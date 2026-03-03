import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, logAdminAudit } from '../lib/supabase';
import { stripHtml } from '../lib/sanitize';

const PAGE_SIZE = 20;

/**
 * 피드백 댓글 CRUD 훅 — Threading(대댓글) + Likes(좋아요) + Realtime
 *
 * 반환되는 comments 구조:
 * [
 *   { ...comment, likeCount: N, replies: [{ ...reply, likeCount: M }, ...] },
 *   ...
 * ]
 */
export default function useFeedback() {
  const [comments, setComments] = useState([]);   // tree 구조 (최상위 + replies)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);           // 최상위 댓글 총 수
  const [myLikes, setMyLikes] = useState(new Set()); // 내가 좋아요한 comment_id Set
  const [adminIds, setAdminIds] = useState(new Set()); // 관리자 user_id Set

  const channelFeedbackRef = useRef(null);
  const channelLikesRef = useRef(null);
  const offsetRef = useRef(0); // 현재까지 로드한 최상위 댓글 수

  // ── 좋아요 수 일괄 조회 ──
  const fetchLikeCounts = useCallback(async (commentIds) => {
    if (!commentIds.length) return {};
    try {
      const { data } = await supabase
        .from('feedback_likes')
        .select('comment_id')
        .in('comment_id', commentIds);
      // 카운트 집계
      const counts = {};
      (data || []).forEach(row => {
        counts[row.comment_id] = (counts[row.comment_id] || 0) + 1;
      });
      return counts;
    } catch {
      return {};
    }
  }, []);

  // ── 내 좋아요 목록 조회 ──
  const fetchMyLikes = useCallback(async (userId) => {
    if (!userId) { setMyLikes(new Set()); return; }
    try {
      const { data } = await supabase
        .from('feedback_likes')
        .select('comment_id')
        .eq('user_id', userId);
      setMyLikes(new Set((data || []).map(r => r.comment_id)));
    } catch {
      setMyLikes(new Set());
    }
  }, []);

  // ── 관리자 ID 목록 조회 ──
  const fetchAdminIds = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
      setAdminIds(new Set((data || []).map(r => r.id)));
    } catch {
      setAdminIds(new Set());
    }
  }, []);

  // ── 댓글 트리 빌드 (최상위 + 답글 + 좋아요 수) ──
  const buildTree = useCallback(async (topComments) => {
    const topIds = topComments.map(c => c.id);
    const allIds = [...topIds];

    // 답글 조회 (parent_id IN topIds)
    let repliesData = [];
    if (topIds.length > 0) {
      try {
        const { data } = await supabase
          .from('feedback_comments')
          .select('*')
          .in('parent_id', topIds)
          .order('created_at', { ascending: true });
        repliesData = data || [];
        repliesData.forEach(r => allIds.push(r.id));
      } catch { /* 테이블 미존재 시 무시 */ }
    }

    // 좋아요 수 일괄 조회
    const likeCounts = await fetchLikeCounts(allIds);

    // 트리 조합
    const repliesMap = {};
    repliesData.forEach(r => {
      if (!repliesMap[r.parent_id]) repliesMap[r.parent_id] = [];
      repliesMap[r.parent_id].push({ ...r, likeCount: likeCounts[r.id] || 0 });
    });

    return topComments.map(c => ({
      ...c,
      likeCount: likeCounts[c.id] || 0,
      replies: repliesMap[c.id] || [],
    }));
  }, [fetchLikeCounts]);

  // ── 댓글 조회 (최상위 댓글 페이지네이션) ──
  const fetchComments = useCallback(async (offset = 0, append = false) => {
    if (!append) setLoading(true);
    try {
      // 최상위 댓글 총 수
      const { count } = await supabase
        .from('feedback_comments')
        .select('*', { count: 'exact', head: true })
        .is('parent_id', null);
      setTotal(count || 0);

      // 최상위 댓글 데이터 조회
      const { data, error: e } = await supabase
        .from('feedback_comments')
        .select('*')
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (e) throw e;

      const rows = data || [];

      // 트리 빌드 (답글 + 좋아요 포함)
      const tree = await buildTree(rows);

      if (append) {
        setComments(prev => [...prev, ...tree]);
      } else {
        setComments(tree);
      }

      offsetRef.current = offset + rows.length;
      setHasMore(rows.length === PAGE_SIZE && offset + rows.length < (count || 0));
      setError(null);
    } catch (e) {
      console.warn('[useFeedback] 로드 실패:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [buildTree]);

  // ── 초기 로드 + Realtime 구독 ──
  useEffect(() => {
    fetchComments();
    fetchAdminIds();

    // Realtime: feedback_comments 변경 감지
    const chFeedback = supabase
      .channel('feedback-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback_comments' },
        () => { fetchComments(); }
      )
      .subscribe();
    channelFeedbackRef.current = chFeedback;

    // Realtime: feedback_likes 변경 감지
    const chLikes = supabase
      .channel('likes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback_likes' },
        () => { fetchComments(); }
      )
      .subscribe();
    channelLikesRef.current = chLikes;

    return () => {
      if (channelFeedbackRef.current) {
        supabase.removeChannel(channelFeedbackRef.current);
        channelFeedbackRef.current = null;
      }
      if (channelLikesRef.current) {
        supabase.removeChannel(channelLikesRef.current);
        channelLikesRef.current = null;
      }
    };
  }, [fetchComments]);

  // ── 더보기 ──
  const loadMore = useCallback(() => {
    fetchComments(offsetRef.current, true);
  }, [fetchComments]);

  // ── 인증된 사용자 ID 검증 (IDOR 방어) ──
  const getAuthUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  };

  // ── 댓글 작성 (parentId 지원) ──
  const addComment = useCallback(async (content, userId, parentId = null) => {
    try {
      // [IDOR 방어] 인증된 사용자 확인 — userId 스푸핑 방지
      const authUid = await getAuthUserId();
      if (!authUid || authUid !== userId) {
        return { success: false, error: '인증 정보가 일치하지 않습니다' };
      }

      // 2단계 이상 중첩 방지: parentId가 이미 답글이면 원래 부모로 리다이렉트
      let safeParentId = parentId;
      if (parentId) {
        const { data: parentRow } = await supabase
          .from('feedback_comments')
          .select('parent_id')
          .eq('id', parentId)
          .single();
        if (parentRow?.parent_id) {
          safeParentId = parentRow.parent_id;
        }
      }

      // profiles에서 author_name 조회
      let authorName = '';
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', authUid)
        .single();
      if (profile?.name) authorName = profile.name;

      // XSS 방어: HTML 태그 제거 후 저장
      const safeContent = stripHtml(content);
      if (!safeContent) return { success: false, error: '내용을 입력해주세요' };

      const { error: e } = await supabase.from('feedback_comments').insert({
        content: safeContent,
        author_id: authUid,  // [IDOR 방어] 인증된 UID 사용
        author_name: authorName,
        parent_id: safeParentId,
      });
      if (e) throw e;

      await fetchComments();
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [fetchComments]);

  // ── 댓글 수정 ──
  const updateComment = useCallback(async (id, newContent) => {
    try {
      // [IDOR 방어] 인증된 사용자 확인
      const authUid = await getAuthUserId();
      if (!authUid) return { success: false, error: '로그인이 필요합니다' };

      // 댓글 소유자 확인
      const { data: comment } = await supabase
        .from('feedback_comments')
        .select('author_id')
        .eq('id', id)
        .single();

      if (!comment) return { success: false, error: '댓글을 찾을 수 없습니다' };

      // 본인 댓글만 수정 가능 (관리자도 타인 댓글 수정 불가)
      if (comment.author_id !== authUid) {
        return { success: false, error: '본인 댓글만 수정할 수 있습니다' };
      }

      // XSS 방어
      const safeContent = stripHtml(newContent);
      if (!safeContent) return { success: false, error: '내용을 입력해주세요' };

      const { error: e } = await supabase
        .from('feedback_comments')
        .update({ content: safeContent, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (e) throw e;

      await fetchComments();
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [fetchComments]);

  // ── 댓글 삭제 ──
  const deleteComment = useCallback(async (id) => {
    try {
      // [IDOR 방어] 소유권 검증 — 본인 댓글 or admin만 삭제 가능
      const authUid = await getAuthUserId();
      if (!authUid) return { success: false, error: '로그인이 필요합니다' };

      // 댓글 소유자 확인
      const { data: comment } = await supabase
        .from('feedback_comments')
        .select('author_id')
        .eq('id', id)
        .single();

      if (!comment) return { success: false, error: '댓글을 찾을 수 없습니다' };

      // 본인 댓글이 아닌 경우, admin 여부 확인
      if (comment.author_id !== authUid) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUid)
          .single();
        if (profile?.role !== 'admin') {
          return { success: false, error: '삭제 권한이 없습니다' };
        }
      }

      // admin이 타인 댓글 삭제 시 감사 로그 기록용
      const isAdminAction = comment.author_id !== authUid;

      const { error: e } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', id);
      if (e) throw e;

      // 관리자가 타인 댓글을 삭제한 경우 감사 로그 기록
      if (isAdminAction) {
        logAdminAudit('comment_delete', `comment_${id}`, { comment_author_id: comment.author_id });
      }

      await fetchComments();
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [fetchComments]);

  // ── 좋아요 토글 ──
  const toggleLike = useCallback(async (commentId, userId) => {
    if (!userId) return { success: false, error: '로그인이 필요합니다' };
    try {
      // [IDOR 방어] 인증된 사용자 확인 — 다른 사용자 좋아요 조작 방지
      const authUid = await getAuthUserId();
      if (!authUid || authUid !== userId) {
        return { success: false, error: '인증 정보가 일치하지 않습니다' };
      }

      // 기존 좋아요 확인
      const { data: existing } = await supabase
        .from('feedback_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', authUid)  // [IDOR 방어] 인증된 UID 사용
        .maybeSingle();

      if (existing) {
        await supabase.from('feedback_likes').delete().eq('id', existing.id);
        setMyLikes(prev => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      } else {
        await supabase.from('feedback_likes').insert({
          comment_id: commentId,
          user_id: authUid,  // [IDOR 방어] 인증된 UID 사용
        });
        setMyLikes(prev => new Set([...prev, commentId]));
      }

      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, []);

  return {
    comments, loading, error, hasMore, total,
    myLikes, adminIds,
    fetchComments, addComment, updateComment, deleteComment, loadMore,
    toggleLike, fetchMyLikes,
  };
}

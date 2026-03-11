import { useState, useEffect, useCallback, useRef } from 'react';
// ✅ Phase 0: CRUD는 api/ 경유, Realtime 채널·verifyAdmin은 supabase 직접 유지
import { supabase, logAdminAudit } from '../lib/supabase';
import {
  getAnnouncements as apiFetchAnnouncements,
  createAnnouncement as apiCreateAnnouncement,
  updateAnnouncement as apiUpdateAnnouncement,
  deleteAnnouncement as apiDeleteAnnouncement,
} from '../api/announcements';
import { stripHtml } from '../lib/sanitize';

/**
 * 공지사항 Supabase CRUD 훅 + Realtime 구독
 * @param {number} limit - 조회할 공지 수 (기본 50)
 */
export default function useAnnouncements(limit = 50) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ api/announcements.js 경유 — supabase 직접 호출 없음
      const { data, error: e } = await apiFetchAnnouncements(limit);
      if (e) throw e;
      setAnnouncements(data || []);
      setError(null);
    } catch (e) {
      console.warn('[useAnnouncements] 로드 실패:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 초기 로드 + Realtime 구독
  useEffect(() => {
    fetchAnnouncements();

    // Realtime: announcements 테이블 변경 감지
    const channel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => { fetchAnnouncements(); }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchAnnouncements]);

  // ── [IDOR 방어] admin 권한 사전 검증 ──
  const verifyAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, uid: null, error: '로그인이 필요합니다' };
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') return { ok: false, uid: user.id, error: '관리자 권한이 필요합니다' };
    return { ok: true, uid: user.id, error: null };
  };

  // ── CRUD ──

  const createAnnouncement = useCallback(async ({ title, content, category = 'general', is_pinned = false }) => {
    try {
      // [IDOR 방어] admin 검증 + 인증된 UID를 author_id로 사용 (스푸핑 방지)
      const auth = await verifyAdmin();
      if (!auth.ok) { setError(auth.error); return { success: false, error: auth.error }; }

      const safeTitle = stripHtml(title);
      const safeContent = stripHtml(content);
      if (!safeTitle || !safeContent) {
        setError('제목과 내용을 입력해주세요');
        return { success: false, error: '제목과 내용을 입력해주세요' };
      }
      // ✅ api/announcements.js 경유
      const { error: e } = await apiCreateAnnouncement({
        title: safeTitle, content: safeContent, category, is_pinned, author_id: auth.uid,
      });
      if (e) throw e;
      logAdminAudit('announcement_create', `announcement`, { title: safeTitle, category });
      await fetchAnnouncements();
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [fetchAnnouncements]);

  const updateAnnouncement = useCallback(async (id, updates) => {
    try {
      // [IDOR 방어] admin 검증
      const auth = await verifyAdmin();
      if (!auth.ok) { setError(auth.error); return { success: false, error: auth.error }; }

      const safeUpdates = { ...updates };
      if (safeUpdates.title) safeUpdates.title = stripHtml(safeUpdates.title);
      if (safeUpdates.content) safeUpdates.content = stripHtml(safeUpdates.content);
      // ✅ api/announcements.js 경유
      const { error: e } = await apiUpdateAnnouncement(id, safeUpdates);
      if (e) throw e;
      logAdminAudit('announcement_update', `announcement_${id}`, { updated_fields: Object.keys(safeUpdates) });
      await fetchAnnouncements();
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [fetchAnnouncements]);

  const deleteAnnouncement = useCallback(async (id) => {
    try {
      // [IDOR 방어] admin 검증
      const auth = await verifyAdmin();
      if (!auth.ok) { setError(auth.error); return { success: false, error: auth.error }; }

      // ✅ api/announcements.js 경유
      const { error: e } = await apiDeleteAnnouncement(id);
      if (e) throw e;
      logAdminAudit('announcement_delete', `announcement_${id}`);
      await fetchAnnouncements();
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [fetchAnnouncements]);

  const togglePin = useCallback(async (id, currentPinned) => {
    // [IDOR 방어] verifyAdmin은 updateAnnouncement 내부에서 수행됨
    return updateAnnouncement(id, { is_pinned: !currentPinned });
  }, [updateAnnouncement]);

  return {
    announcements, loading, error, setError,
    fetchAnnouncements,
    createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin,
  };
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFeedback from '../../hooks/useFeedback';
import EmojiPicker from './EmojiPicker';
import { getLang, timeAgo as i18nTimeAgo, getFeedbackUI } from '../../lib/i18n';
import { ChevronRight, Close } from '@carbon/icons-react';

const MAX_CHARS = 500;

// ── Bold 마크다운 렌더링 (**text** → <strong>) ──
function renderBoldText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ── Ctrl+B Bold 토글 핸들러 ──
function handleBoldShortcut(e, value, setValue, ref) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    const ta = ref?.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    if (selected) {
      // 선택된 텍스트를 **로 감싸기 (이미 **면 제거)
      if (selected.startsWith('**') && selected.endsWith('**')) {
        const unwrapped = selected.slice(2, -2);
        const next = value.substring(0, start) + unwrapped + value.substring(end);
        setValue(next.slice(0, MAX_CHARS));
        requestAnimationFrame(() => { ta.selectionStart = start; ta.selectionEnd = start + unwrapped.length; });
      } else {
        const wrapped = '**' + selected + '**';
        const next = value.substring(0, start) + wrapped + value.substring(end);
        setValue(next.slice(0, MAX_CHARS));
        requestAnimationFrame(() => { ta.selectionStart = start; ta.selectionEnd = start + wrapped.length; });
      }
    } else {
      // 커서 위치에 **|** 삽입
      const insert = '****';
      const next = value.substring(0, start) + insert + value.substring(end);
      setValue(next.slice(0, MAX_CHARS));
      requestAnimationFrame(() => { ta.selectionStart = start + 2; ta.selectionEnd = start + 2; });
    }
  }
}

// ── 아바타 색상 (author_id 해시 기반 결정론적) ──
const AVATAR_COLORS = [
  '#ef4444','#f97316','#f59e0b','#84cc16','#22c55e',
  '#14b8a6','#06b6d4','#3b82f6','#6366f1','#8b5cf6',
  '#a855f7','#d946ef','#ec4899','#f43f5e',
];

function getAvatarColor(id) {
  if (!id) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

/** 작성자명 마스킹 (첫 글자만 표시 + ***) */
function maskName(name) {
  if (!name) return '***';
  return name.charAt(0) + '***';
}

/** 상대 시간 포맷 */
function timeAgo(dateStr) {
  return i18nTimeAgo(dateStr);
}

// ═══════════════════════════════════════
// CommentItem — 댓글/답글 공용 컴포넌트
// ═══════════════════════════════════════
function CommentItem({
  comment,
  isReply = false,
  parentAuthorName = '',
  user,
  isAdmin,
  isLoggedIn,
  myLikes,
  adminIds,
  hasAdminReply = false,
  t,
  onDelete,
  onToggleLike,
  onReply,
  onEdit,
  editingId,
  editInput,
  setEditInput,
  editInputRef,
  onEditSave,
  onEditCancel,
  editSaving,
  deleting,
}) {
  const isOwn = user?.id === comment.author_id;
  const isAdminAuthor = adminIds?.has(comment.author_id);
  const canDelete = isAdmin || (isOwn && !isAdminAuthor && !hasAdminReply);
  const canEdit = isOwn; // 본인 댓글만 수정 가능
  const isEditing = editingId === comment.id;
  const isLiked = myLikes.has(comment.id);
  const isEdited = comment.updated_at && comment.updated_at !== comment.created_at;

  const avatarColor = isLoggedIn ? getAvatarColor(comment.author_id) : '#94a3b8';
  const initial = isLoggedIn ? getInitial(comment.author_name) : '?';
  const displayName = isLoggedIn ? (comment.author_name || t.anon) : maskName(comment.author_name);

  return (
    <div className={`${isReply ? 'ml-8 pl-3 border-l-2 border-slate-100' : ''}`}>
      <div className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
        <div className="flex items-start gap-2.5">
          {/* 아바타 */}
          <div
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold mt-0.5 select-none"
            style={{ backgroundColor: avatarColor }}
          >
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            {/* 작성자 + 시간 + 수정됨 라벨 */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[12px] font-bold text-slate-700">
                {displayName}
              </span>
              {isReply && parentAuthorName && isLoggedIn && (
                <span className="text-[10px] text-blue-400 font-medium">
                  → @{parentAuthorName}
                </span>
              )}
              {isReply && parentAuthorName && !isLoggedIn && (
                <span className="text-[10px] text-slate-300 font-medium">
                  → @{maskName(parentAuthorName)}
                </span>
              )}
              <span className="text-[10px] text-slate-300">
                {timeAgo(comment.created_at)}
              </span>
              {/* 수정됨 라벨 */}
              {isEdited && isLoggedIn && (
                <span className="text-[9px] text-amber-500 font-medium italic" title={comment.updated_at ? new Date(comment.updated_at).toLocaleString() : ''}>
                  {t.edited}
                </span>
              )}
              {isAdminAuthor && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-50 text-red-500 border border-red-100">
                  {t.admin}
                </span>
              )}
              {isOwn && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-50 text-emerald-500">
                  {t.myComment}
                </span>
              )}
              {isReply && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-blue-50 text-blue-400">
                  {t.reply}
                </span>
              )}
            </div>

            {/* 내용 — 수정 모드 또는 일반 표시 */}
            {isEditing ? (
              <div className="mt-1">
                <div className="relative">
                  <textarea
                    ref={editInputRef}
                    value={editInput}
                    onChange={e => setEditInput(e.target.value.slice(0, MAX_CHARS))}
                    onKeyDown={e => {
                      handleBoldShortcut(e, editInput, setEditInput, editInputRef);
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEditSave(); }
                      if (e.key === 'Escape') onEditCancel();
                    }}
                    rows={3}
                    className="w-full px-3 py-2 text-[12px] rounded-lg border border-amber-300 bg-amber-50/30 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                    disabled={editSaving}
                    autoFocus
                  />
                  <span className={`absolute bottom-1.5 right-2 text-[9px] font-mono ${editInput.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-slate-300'}`}>
                    {editInput.length}/{MAX_CHARS}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[9px] text-slate-400">{t.boldTip}</span>
                  <div className="flex gap-2">
                    <button onClick={onEditCancel} className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 rounded transition-colors">
                      {t.editCancel}
                    </button>
                    <button
                      onClick={onEditSave}
                      disabled={!editInput.trim() || editSaving}
                      className="px-3 py-1 text-[10px] font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-all"
                    >
                      {editSaving ? '...' : t.editSave}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p
                className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap break-words"
                style={isLoggedIn ? {} : {
                  filter: 'blur(5px)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {renderBoldText(comment.content)}
              </p>
            )}

            {/* 액션 바 */}
            {!isEditing && (
              <div className="flex items-center gap-3 mt-1.5">
                <button
                  onClick={() => onToggleLike(comment.id)}
                  disabled={!isLoggedIn}
                  className={`flex items-center gap-1 text-[11px] transition-all ${
                    isLiked
                      ? 'text-red-500 font-bold'
                      : 'text-slate-300 hover:text-red-400'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  title={isLoggedIn ? (isLiked ? t.unlike : t.like) : t.loginNeeded}
                >
                  <span className="text-[13px]">{isLiked ? '❤️' : '🤍'}</span>
                  {comment.likeCount > 0 && (
                    <span>{comment.likeCount}</span>
                  )}
                </button>
                {!isReply && isLoggedIn && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="text-[11px] text-slate-300 hover:text-blue-500 transition-colors"
                  >
                    {t.replyBtn}
                  </button>
                )}
                {/* 수정 버튼 — 본인 댓글만 */}
                {canEdit && isLoggedIn && (
                  <button
                    onClick={() => onEdit(comment.id, comment.content)}
                    className="text-[11px] text-slate-300 hover:text-amber-500 transition-colors"
                  >
                    {t.editBtn}
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    disabled={deleting === comment.id}
                    className="text-[11px] text-slate-300 hover:text-red-400 transition-colors"
                    title={isAdmin ? t.deleteAdmin : t.deleteMine}
                  >
                    {deleting === comment.id ? '...' : t.deleteBtn}
                  </button>
                )}
                {isLoggedIn && !canDelete && !isAdmin && (isAdminAuthor || (isOwn && hasAdminReply)) && (
                  <span
                    className="text-[9px] text-slate-300 cursor-help"
                    title={isAdminAuthor ? t.adminOnly : t.adminReplyLock}
                  >
                    🔒
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// FeedbackBoard — 메인 컴포넌트
// ═══════════════════════════════════════
export default function FeedbackBoard() {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const {
    comments, loading, hasMore, total, myLikes, adminIds,
    addComment, updateComment, deleteComment, loadMore,
    toggleLike, fetchMyLikes,
  } = useFeedback();
  const navigate = useNavigate();
  const t = getFeedbackUI();

  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [replyTo, setReplyTo] = useState(null);    // 답글 대상 댓글 ID
  const [replyInput, setReplyInput] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(new Set()); // 펼친 답글 댓글 ID
  const [toast, setToast] = useState(null);        // { type: 'success'|'error', message }
  const [editingId, setEditingId] = useState(null);   // 수정 중인 댓글 ID
  const [editInput, setEditInput] = useState('');      // 수정 입력값
  const [editSaving, setEditSaving] = useState(false); // 수정 저장 중

  const inputRef = useRef(null);
  const replyInputRef = useRef(null);
  const editInputRef = useRef(null);

  // 토스트 자동 숨기기
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 로그인 시 내 좋아요 목록 조회
  useEffect(() => {
    if (user?.id) fetchMyLikes(user.id);
  }, [user?.id, fetchMyLikes, comments]);

  // ── 답글 펼치기/접기 토글 ──
  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // ── 이모지 삽입 (메인 입력) ──
  const handleEmojiSelect = (emoji) => {
    setInput(prev => {
      const next = prev + emoji;
      return next.slice(0, MAX_CHARS);
    });
    inputRef.current?.focus();
  };

  // ── 이모지 삽입 (답글 입력) ──
  const handleReplyEmojiSelect = (emoji) => {
    setReplyInput(prev => {
      const next = prev + emoji;
      return next.slice(0, MAX_CHARS);
    });
    replyInputRef.current?.focus();
  };

  // ── 최상위 댓글 등록 ──
  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user) return;
    setSubmitting(true);
    const result = await addComment(trimmed, user.id);
    if (result.success) setInput('');
    setSubmitting(false);
  };

  // ── 답글 등록 ──
  const handleReplySubmit = async () => {
    const trimmed = replyInput.trim();
    if (!trimmed || !user || !replyTo) return;
    setReplySubmitting(true);
    const result = await addComment(trimmed, user.id, replyTo);
    if (result.success) {
      setReplyInput('');
      setReplyTo(null);
      // 답글 등록 후 해당 댓글의 답글 목록 자동 펼치기
      setExpandedReplies(prev => new Set([...prev, replyTo]));
    }
    setReplySubmitting(false);
  };

  // ── 삭제 ──
  const handleDelete = async (id) => {
    if (!confirm(t.deleteConfirm)) return;
    setDeleting(id);
    const result = await deleteComment(id);
    setDeleting(null);
    if (result.success) {
      setToast({ type: 'success', message: t.deleteSuccess });
    } else {
      setToast({ type: 'error', message: result.error || t.deleteFail });
    }
  };

  // ── 좋아요 토글 ──
  const handleToggleLike = async (commentId) => {
    if (!user) return;
    await toggleLike(commentId, user.id);
  };

  // ── 답글 열기 ──
  const handleReplyOpen = (commentId) => {
    if (replyTo === commentId) {
      setReplyTo(null);
      setReplyInput('');
    } else {
      setReplyTo(commentId);
      setReplyInput('');
      // 답글 입력 시 답글 목록 자동 펼치기
      setExpandedReplies(prev => new Set([...prev, commentId]));
    }
  };

  // ── 수정 시작 ──
  const handleEdit = (id, content) => {
    setEditingId(id);
    setEditInput(content);
  };

  // ── 수정 저장 ──
  const handleEditSave = async () => {
    if (!editInput.trim() || !editingId) return;
    setEditSaving(true);
    const result = await updateComment(editingId, editInput.trim());
    setEditSaving(false);
    if (result.success) {
      setEditingId(null);
      setEditInput('');
      setToast({ type: 'success', message: t.editSuccess });
    } else {
      setToast({ type: 'error', message: result.error || t.editFail });
    }
  };

  // ── 수정 취소 ──
  const handleEditCancel = () => {
    setEditingId(null);
    setEditInput('');
  };

  const handleKeyDown = (e) => {
    handleBoldShortcut(e, input, setInput, inputRef);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReplyKeyDown = (e) => {
    handleBoldShortcut(e, replyInput, setReplyInput, replyInputRef);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
    if (e.key === 'Escape') {
      setReplyTo(null);
      setReplyInput('');
    }
  };

  // 총 댓글 수 (최상위 + 답글)
  const totalWithReplies = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col relative">
      {/* 토스트 알림 */}
      {toast && (
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-[11px] font-bold shadow-lg transition-all animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          {toast.message}
        </div>
      )}
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <h3 className="text-sm font-black text-slate-800 tracking-wide">{t.title}</h3>
          {totalWithReplies > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500">
              {totalWithReplies}
            </span>
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        {isLoggedIn ? (
          <div>
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                rows={2}
                className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-slate-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-slate-400"
                disabled={submitting}
              />
              <span className={`absolute bottom-2 right-2 text-[10px] font-mono ${input.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-slate-300'}`}>
                {input.length}/{MAX_CHARS}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <EmojiPicker onSelect={handleEmojiSelect} disabled={submitting} />
                <span className="text-[9px] text-slate-400 hidden sm:inline">{t.boldTip}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || submitting}
                className="px-4 py-1.5 text-[11px] font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {submitting ? t.sending : t.post}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-1">
            <p className="text-[12px] text-slate-400">{t.loginPrompt}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors"
            >
              {t.login}
            </button>
          </div>
        )}
      </div>

      {/* 삭제 정책 안내 */}
      {isLoggedIn && (
        <div className="px-5 py-2 bg-slate-50/80 border-b border-slate-100">
          <p className="text-[9px] text-slate-400 leading-relaxed">
            ℹ️ {t.policy} · <span className="font-bold text-red-400">{t.admin}</span> {t.policyAdmin} · {t.policyLock} 🔒
          </p>
        </div>
      )}

      {/* 댓글 리스트 (threaded) */}
      <div className="flex-1 overflow-y-auto relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="text-2xl mb-2">🤔</span>
            <p className="text-xs font-bold">{t.empty}</p>
            <p className="text-[10px] mt-1">{t.emptyHint}</p>
          </div>
        ) : (
          <>
            {/* 비로그인 시 로그인 유도 오버레이 */}
            {!isLoggedIn && (
              <div className="sticky top-0 z-10 mx-4 mt-3 mb-1">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                  <span className="text-sm">🔒</span>
                  <p className="text-[11px] text-slate-600 font-medium flex-1">
                    {t.loginRequired}
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3 py-1 text-[10px] font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                  >
                    {t.loginBtn}
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-50">
              {comments.map(c => {
                const replyCount = c.replies?.length || 0;
                const isExpanded = expandedReplies.has(c.id);

                return (
                  <div key={c.id}>
                    {/* 최상위 댓글 */}
                    <CommentItem
                      comment={c}
                      user={user}
                      isAdmin={isAdmin}
                      isLoggedIn={isLoggedIn}
                      myLikes={myLikes}
                      adminIds={adminIds}
                      hasAdminReply={!!(c.replies?.some(r => adminIds.has(r.author_id)))}
                      t={t}
                      onDelete={handleDelete}
                      onToggleLike={handleToggleLike}
                      onReply={handleReplyOpen}
                      onEdit={handleEdit}
                      editingId={editingId}
                      editInput={editInput}
                      setEditInput={setEditInput}
                      editInputRef={editInputRef}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                      editSaving={editSaving}
                      deleting={deleting}
                    />

                    {/* 답글 펼치기/접기 토글 버튼 (로그인 시만 상호작용) */}
                    {replyCount > 0 && (
                      <button
                        onClick={() => isLoggedIn && toggleReplies(c.id)}
                        className={`ml-12 px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                          isLoggedIn
                            ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50/50'
                            : 'text-slate-300 cursor-default'
                        }`}
                      >
                        <span className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}><ChevronRight size={14} /></span>
                        {t.replyCount(replyCount)} {isLoggedIn ? (isExpanded ? t.collapse : t.expand) : ''}
                      </button>
                    )}

                    {/* 답글 목록 (접기/펼치기) — 로그인 시만 */}
                    {isLoggedIn && isExpanded && replyCount > 0 && (
                      <div className="bg-slate-50/30">
                        {c.replies.map(reply => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            isReply
                            parentAuthorName={c.author_name || t.anon}
                            user={user}
                            isAdmin={isAdmin}
                            isLoggedIn={isLoggedIn}
                            myLikes={myLikes}
                            adminIds={adminIds}
                            t={t}
                            onDelete={handleDelete}
                            onToggleLike={handleToggleLike}
                            onReply={handleReplyOpen}
                            onEdit={handleEdit}
                            editingId={editingId}
                            editInput={editInput}
                            setEditInput={setEditInput}
                            editInputRef={editInputRef}
                            onEditSave={handleEditSave}
                            onEditCancel={handleEditCancel}
                            editSaving={editSaving}
                            deleting={deleting}
                          />
                        ))}
                      </div>
                    )}

                    {/* 인라인 답글 입력 (로그인 시만) */}
                    {isLoggedIn && replyTo === c.id && (
                      <div className="ml-8 px-4 py-3 border-l-2 border-blue-200 bg-blue-50/30">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] text-blue-500 font-bold">
                            {t.replyTo(c.author_name || t.anon)}
                          </span>
                          <button
                            onClick={() => { setReplyTo(null); setReplyInput(''); }}
                            className="text-[10px] text-slate-400 hover:text-slate-600"
                          >
                            <Close size={12} />
                          </button>
                        </div>
                        <div className="relative">
                          <textarea
                            ref={replyInputRef}
                            value={replyInput}
                            onChange={e => setReplyInput(e.target.value.slice(0, MAX_CHARS))}
                            onKeyDown={handleReplyKeyDown}
                            placeholder={t.replyPlaceholder}
                            rows={2}
                            className="w-full px-3 py-2 text-[12px] rounded-lg border border-blue-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-slate-400"
                            disabled={replySubmitting}
                            autoFocus
                          />
                          <span className={`absolute bottom-1.5 right-2 text-[9px] font-mono ${replyInput.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-slate-300'}`}>
                            {replyInput.length}/{MAX_CHARS}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <EmojiPicker onSelect={handleReplyEmojiSelect} disabled={replySubmitting} />
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setReplyTo(null); setReplyInput(''); }}
                              className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 rounded transition-colors"
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={handleReplySubmit}
                              disabled={!replyInput.trim() || replySubmitting}
                              className="px-3 py-1 text-[10px] font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all"
                            >
                              {replySubmitting ? '...' : t.postReply}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* 더보기 */}
            {hasMore && isLoggedIn && (
              <div className="px-5 py-3 border-t border-slate-50">
                <button
                  onClick={loadMore}
                  className="w-full py-2 text-[11px] font-bold text-blue-500 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors"
                >
                  {t.loadMore}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

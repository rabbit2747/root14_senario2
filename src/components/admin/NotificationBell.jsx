import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminNotifications from '../../hooks/useAdminNotifications';
import { supabase } from '../../lib/supabase';
import { Chat, UserFollow, Bullhorn, Notification } from '@carbon/icons-react';

const TYPE_ICON = {
  new_comment:      Chat,
  new_user:         UserFollow,
  new_announcement: Bullhorn,
};

// ── 보안: 알림 타입별 허용 경로 화이트리스트 ──
const ROUTE_MAP = {
  new_comment:      { route: '/community',     internal: false, label: '커뮤니티' },
  new_user:         { route: null,             internal: true,  label: '사용자 관리', tab: 'users' },
  new_announcement: { route: '/announcements', internal: false, label: '공지사항' },
};

function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

/**
 * 관리자 알림 벨 아이콘 + 드롭다운
 * @param {Object} props
 * @param {function} [props.onTabChange] - AdminPage 내부 탭 전환 콜백
 */
export default function NotificationBell({ onTabChange }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // ── [보안] 알림 클릭 → 페이지 이동 핸들러 ──
  const handleNotificationClick = useCallback(async (notification) => {
    // 1. 읽음 처리
    if (!notification.is_read) markAsRead(notification.id);

    // 2. 경로 매핑 (화이트리스트만 허용 — data에서 URL 직접 구성 금지)
    const mapping = ROUTE_MAP[notification.type];
    if (!mapping) {
      setOpen(false);
      return;
    }

    // 3. [보안] admin 권한 재검증 후 이동
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // 미로그인 → 로그인 페이지
        navigate('/login', { state: { from: '/admin' } });
        setOpen(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        console.warn('[NotificationBell] 관리자 권한 없음 — 이동 차단');
        setOpen(false);
        return;
      }
    } catch (err) {
      console.warn('[NotificationBell] 권한 검증 실패:', err.message);
      setOpen(false);
      return;
    }

    // 4. 이동 실행
    if (mapping.internal && mapping.tab && onTabChange) {
      // Admin 내부 탭 전환 (new_user → 사용자관리 탭)
      onTabChange(mapping.tab);
    } else if (mapping.route) {
      // 외부 페이지 이동 (React Router — SPA 내부만 허용)
      navigate(mapping.route);
    }

    setOpen(false);
  }, [markAsRead, navigate, onTabChange]);

  // 외부 클릭 → 닫기
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {/* 벨 아이콘 버튼 */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        title="알림"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* 미읽음 뱃지 */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-black bg-red-500 text-white rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">알림</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
              >
                전체 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Notification size={20} className="mb-1" />
                <p className="text-[11px] font-bold">알림이 없습니다</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map(n => {
                  const mapping = ROUTE_MAP[n.type];
                  return (
                    <li
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                        n.is_read ? 'hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/60'
                      }`}
                      title={mapping ? `${mapping.label} 페이지로 이동` : ''}
                    >
                      {/* 아이콘 */}
                      <span className="text-sm shrink-0 mt-0.5">
                        {(() => { const IconComp = TYPE_ICON[n.type] || Notification; return <IconComp size={16} />; })()}
                      </span>
                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] leading-snug ${n.is_read ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-300">
                            {timeAgo(n.created_at)}
                          </span>
                          {mapping && (
                            <span className="text-[9px] text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              {mapping.label} →
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 미읽음 인디케이터 */}
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

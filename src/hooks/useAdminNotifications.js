import { useState, useEffect, useCallback, useRef } from 'react';
// ✅ Phase 0: 알림 CRUD는 api/ 경유, Realtime 채널·verifyAdmin은 supabase 직접 유지
import { supabase } from '../lib/supabase';
import {
  getAdminNotifications as apiFetchNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
} from '../api/admin';

const FETCH_LIMIT = 20;

/**
 * 관리자 알림 훅 — Supabase admin_notifications + Realtime
 * admin 전용: 새 댓글/이벤트 알림을 실시간으로 수신
 */
export default function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // ── 알림 조회 (최근 20개) ──
  const fetchNotifications = useCallback(async () => {
    try {
      // ✅ api/admin.js 경유 — supabase 직접 호출 없음
      const { data, error } = await apiFetchNotifications(FETCH_LIMIT);
      if (error) throw error;

      const rows = data || [];
      setNotifications(rows);
      setUnreadCount(rows.filter(n => !n.is_read).length);
    } catch (e) {
      console.warn('[useAdminNotifications] 로드 실패:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 초기 로드 + Realtime 구독 ──
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('admin-notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          // 새 알림 즉시 state에 추가 (상단에)
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev].slice(0, FETCH_LIMIT));
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchNotifications]);

  // ── [IDOR 방어] admin 권한 사전 검증 ──
  const verifyAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    return profile?.role === 'admin';
  };

  // ── 개별 읽음 처리 ──
  const markAsRead = useCallback(async (id) => {
    try {
      // [IDOR 방어] admin 검증
      if (!(await verifyAdmin())) {
        console.warn('[useAdminNotifications] 관리자 권한 없음');
        return;
      }

      // ✅ api/admin.js 경유
      const { error } = await apiMarkAsRead(id);
      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.warn('[useAdminNotifications] 읽음 처리 실패:', e.message);
    }
  }, []);

  // ── 전체 읽음 처리 ──
  const markAllAsRead = useCallback(async () => {
    try {
      // [IDOR 방어] admin 검증
      if (!(await verifyAdmin())) {
        console.warn('[useAdminNotifications] 관리자 권한 없음');
        return;
      }

      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      // ✅ api/admin.js 경유
      const { error } = await apiMarkAllAsRead(unreadIds);
      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('[useAdminNotifications] 전체 읽음 실패:', e.message);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

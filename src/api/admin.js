/**
 * 🛡️ 관리자 전용 API
 * Phase 0: Supabase 직접 쿼리 → 훅에서 api/ 경유
 *
 * 🔄 Phase 1 이관 우선순위:
 *    A (쉬움): useAdminNotifications.js, useAuditLogs.js (READ 위주)
 *    B (보통): UserManager.jsx (profiles CRUD)
 *    C (복잡): useAuditLogs.js buildQuery (동적 필터링 → NestJS QueryBuilder로 교체)
 */
import { client } from './_client';

// ── 감사 로그 (admin_audit_logs) ──

export const getAuditLogs = (limit = 100) =>
  client
    .from('admin_audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(limit);

/** 감사 로그 action 목록 (필터 드롭다운용) */
export const getAuditLogActions = () =>
  client.from('admin_audit_logs').select('action').order('action');

// ── 유저 관리 (profiles) ──

export const getProfiles = () =>
  client.from('profiles').select('*').order('created_at', { ascending: false });

export const updateProfileRole = (userId, role) =>
  client.from('profiles').update({ role }).eq('id', userId);

export const updateProfileApproval = (userId, approved) =>
  client.from('profiles').update({ approved }).eq('id', userId);

/** 관리자 여부 확인 (verifyAdmin 용) */
export const getProfileRole = (userId) =>
  client.from('profiles').select('role').eq('id', userId).single();

/** 관리자 ID 목록 (useFeedback - adminIds 조회용) */
export const getAdminIds = () =>
  client.from('profiles').select('id').eq('role', 'admin');

// ── 관리자 알림 (admin_notifications) ──

/**
 * 알림 목록 조회
 * ✅ 검증 완료: useAdminNotifications.js fetchNotifications와 일치
 */
export const getAdminNotifications = (limit = 20) =>
  client
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

/**
 * 개별 알림 읽음 처리
 * ✅ 검증 완료: useAdminNotifications.js markAsRead와 일치
 */
export const markNotificationAsRead = (id) =>
  client.from('admin_notifications').update({ is_read: true }).eq('id', id);

/**
 * 전체 알림 읽음 처리 (배열 IN 조건)
 * ✅ 검증 완료: useAdminNotifications.js markAllAsRead와 일치
 */
export const markAllNotificationsAsRead = (ids) =>
  client.from('admin_notifications').update({ is_read: true }).in('id', ids);

// ── 미승인 유저 카운트 (알림 뱃지용) ──

export const getPendingUsersCount = () =>
  client
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('approved', false);

// ── access_logs ──

export const getAccessLogs = (limit = 200) =>
  client
    .from('access_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

/** access_logs 페이지네이션+필터 조회 */
export function queryAccessLogs({ page = 0, pageSize = 50, action = null, dateFrom = null, dateTo = null, searchIp = null, searchEmail = null } = {}) {
  let q = client
    .from('access_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (action) q = q.eq('action', action);
  if (dateFrom) q = q.gte('created_at', dateFrom);
  if (dateTo) q = q.lte('created_at', dateTo);
  if (searchIp) q = q.ilike('ip', `%${searchIp}%`);
  if (searchEmail) q = q.ilike('email', `%${searchEmail}%`);

  return q;
}

/** 특정 IP의 전체 접속 이력 조회 (타임라인 모달용) */
export const getAccessLogsByIp = (ip, limit = 500) =>
  client
    .from('access_logs')
    .select('*')
    .eq('ip', ip)
    .order('created_at', { ascending: false })
    .limit(limit);

/** access_logs 오늘 통계 (서버 시간 기준) */
export const getAccessLogsToday = () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return client
    .from('access_logs')
    .select('action, ip, created_at')
    .gte('created_at', todayStart.toISOString());
}

/** access_logs 최근 7일 일별 카운트 */
export const getAccessLogsWeek = () => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  return client
    .from('access_logs')
    .select('created_at, action')
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: true });
}

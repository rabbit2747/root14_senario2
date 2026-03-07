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

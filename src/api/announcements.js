/**
 * 📢 공지사항 API
 * Phase 0: Supabase 직접 쿼리
 * Phase 1 이관 우선순위: B (표준 — useAnnouncements.js)
 *
 * ⚠️ Realtime 구독(.channel().on())은 Phase 1까지 useAnnouncements.js에서 직접 supabase 허용
 */
import { client } from './_client';

export const getAnnouncements = (limit = 50) =>
  client
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

export const createAnnouncement = (payload) =>
  client.from('announcements').insert(payload);

export const updateAnnouncement = (id, updates) =>
  client
    .from('announcements')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

export const deleteAnnouncement = (id) =>
  client.from('announcements').delete().eq('id', id);

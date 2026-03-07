/**
 * 💬 커뮤니티 피드백 API
 * Phase 0: Supabase 직접 쿼리
 * Phase 1 이관 우선순위: B (표준, non-realtime 부분)
 * Phase 2 이관: D (복잡 — Realtime 채널 2개 WebSocket Gateway 교체 필요)
 *
 * ⚠️ Realtime 구독은 useFeedback.js에서 직접 supabase 허용 (Phase 2까지)
 */
import { client } from './_client';

export const getFeedback = () =>
  client
    .from('feedback')
    .select('*, feedback_comments(*, feedback_likes(*)), feedback_likes(*)')
    .order('created_at', { ascending: false });

export const createFeedback = (payload) =>
  client.from('feedback').insert(payload);

export const deleteFeedback = (id) =>
  client.from('feedback').delete().eq('id', id);

export const createComment = (payload) =>
  client.from('feedback_comments').insert(payload);

export const deleteComment = (id) =>
  client.from('feedback_comments').delete().eq('id', id);

export const addLike = (payload) =>
  client.from('feedback_likes').insert(payload);

export const removeLike = (id) =>
  client.from('feedback_likes').delete().eq('id', id);

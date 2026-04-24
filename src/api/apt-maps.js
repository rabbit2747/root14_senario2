/**
 * APT 맵 메이커 API — apt_maps 테이블 CRUD
 * RLS: 읽기 = 인증 사용자, 쓰기 = 관리자만
 */
import { client } from './_client';

/** 캠페인 맵 로드 */
export const getAptMap = (campaignId) =>
  client
    .from('apt_maps')
    .select('map_data, updated_at')
    .eq('campaign_id', campaignId)
    .maybeSingle();

/** 전체 맵 리스트 (관리자 에디터 목록용) */
export const listAptMaps = () =>
  client
    .from('apt_maps')
    .select('campaign_id, updated_at')
    .order('updated_at', { ascending: false });

/** 맵 저장/업데이트 (upsert) */
export const upsertAptMap = (campaignId, mapData, userId) =>
  client
    .from('apt_maps')
    .upsert(
      { campaign_id: campaignId, map_data: mapData, updated_by: userId },
      { onConflict: 'campaign_id' }
    );

/** 맵 삭제 */
export const deleteAptMap = (campaignId) =>
  client.from('apt_maps').delete().eq('campaign_id', campaignId);

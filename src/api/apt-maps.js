/**
 * APT 맵 메이커 API — apt_maps 테이블 + localStorage 폴백
 *
 * 전략: DB 시도 → 실패(테이블 없음/네트워크 등) 시 localStorage 자동 폴백
 *       관리자는 SQL 실행 전에도 에디터 테스트 가능 · 실행 후엔 DB가 우선권
 */
import { client } from './_client';

const LS_PREFIX = 'gotroot_apt_map_';
const lsKey = (id) => `${LS_PREFIX}${id}`;

function lsGet(id) {
  try {
    const raw = localStorage.getItem(lsKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function lsSet(id, mapData) {
  try {
    localStorage.setItem(lsKey(id), JSON.stringify({
      map_data: mapData, updated_at: new Date().toISOString(), _source: 'localStorage',
    }));
    return true;
  } catch { return false; }
}
function lsList() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) {
        const id = k.slice(LS_PREFIX.length);
        const v = JSON.parse(localStorage.getItem(k));
        out.push({ campaign_id: id, updated_at: v?.updated_at, _source: 'localStorage' });
      }
    }
  } catch {}
  return out;
}

/** 맵 로드 — DB 우선, 실패 시 localStorage */
export async function getAptMap(campaignId) {
  try {
    const res = await client
      .from('apt_maps')
      .select('map_data, updated_at')
      .eq('campaign_id', campaignId)
      .maybeSingle();
    if (res.error) throw res.error;
    if (res.data) return { data: res.data, error: null, source: 'db' };
    // DB에 없으면 localStorage fallback 확인
    const ls = lsGet(campaignId);
    if (ls) return { data: ls, error: null, source: 'localStorage' };
    return { data: null, error: null, source: 'none' };
  } catch (err) {
    const ls = lsGet(campaignId);
    if (ls) return { data: ls, error: null, source: 'localStorage' };
    return { data: null, error: err, source: 'error' };
  }
}

/** 전체 맵 리스트 — DB + localStorage 합집합 */
export async function listAptMaps() {
  try {
    const res = await client
      .from('apt_maps')
      .select('campaign_id, updated_at')
      .order('updated_at', { ascending: false });
    if (res.error) throw res.error;
    const dbIds = new Set((res.data || []).map((r) => r.campaign_id));
    const lsOnly = lsList().filter((l) => !dbIds.has(l.campaign_id));
    return { data: [...(res.data || []), ...lsOnly], error: null };
  } catch {
    return { data: lsList(), error: null };
  }
}

/** 저장 — DB 시도 후 실패 시 localStorage */
export async function upsertAptMap(campaignId, mapData, userId) {
  try {
    const res = await client
      .from('apt_maps')
      .upsert(
        { campaign_id: campaignId, map_data: mapData, updated_by: userId },
        { onConflict: 'campaign_id' }
      );
    if (res.error) throw res.error;
    // DB 성공 시에도 로컬 캐시 저장 (오프라인 대비)
    lsSet(campaignId, mapData);
    return { error: null, source: 'db' };
  } catch (err) {
    const ok = lsSet(campaignId, mapData);
    if (ok) return { error: null, source: 'localStorage', warning: err?.message };
    return { error: err, source: 'error' };
  }
}

/** 삭제 */
export async function deleteAptMap(campaignId) {
  try {
    await client.from('apt_maps').delete().eq('campaign_id', campaignId);
  } catch {}
  try { localStorage.removeItem(lsKey(campaignId)); } catch {}
  return { error: null };
}

/**
 * useCinematic — 시나리오 로더 + localStorage 오버라이드
 *
 * 레지스트리: id → JSON 매핑. 새 시나리오 추가 시 import + 등록.
 */
import { useEffect, useState } from 'react';
import c0024Json from './data/c0024.cinematic.json';
import orionEchoJson from '../orion-echo/data/orion-echo.cinematic.json';

const REGISTRY = {
  'c0024': c0024Json,
  'orion-echo': orionEchoJson,
};

const KEY = (id) => `gotroot_cinematic_override_${id}`;

export function loadOverride(id) {
  try { const r = localStorage.getItem(KEY(id)); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
export function saveOverride(id, o) {
  try { localStorage.setItem(KEY(id), JSON.stringify(o)); return true; } catch { return false; }
}
export function clearOverride(id) {
  try { localStorage.removeItem(KEY(id)); } catch {}
}
export function mergeScenario(base, ov) {
  if (!ov) return base;
  return { ...base, ...ov, clips: ov.clips || base.clips, choices: { ...(base.choices||{}), ...(ov.choices||{}) } };
}
export function getBaseScenario(id = 'c0024') { return REGISTRY[id] || REGISTRY['c0024']; }
export function useCinematic(id = 'c0024') {
  const [s, set] = useState(() => mergeScenario(getBaseScenario(id), loadOverride(id)));
  useEffect(() => {
    const onStorage = (e) => { if (e.key === KEY(id)) set(mergeScenario(getBaseScenario(id), loadOverride(id))); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [id]);
  return s;
}

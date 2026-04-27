/**
 * useScenario — 디오라마 시나리오 로더 + localStorage 오버라이드
 * 에디터에서 저장한 변경분이 있으면 자동 적용. 없으면 원본 JSON.
 */
import { useEffect, useState } from 'react';
import baseJson from './data/c0024.scenario.json';

const KEY = (id) => `gotroot_diorama_override_${id}`;

export function loadOverride(id) {
  try {
    const raw = localStorage.getItem(KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveOverride(id, override) {
  try {
    localStorage.setItem(KEY(id), JSON.stringify(override));
    return true;
  } catch { return false; }
}

export function clearOverride(id) {
  try { localStorage.removeItem(KEY(id)); } catch {}
}

export function mergeScenario(base, override) {
  if (!override) return base;
  return {
    ...base,
    ...override,
    cameras: { ...(base.cameras || {}), ...(override.cameras || {}) },
    timeline: override.timeline || base.timeline,
    hotspots: { ...(base.hotspots || {}), ...(override.hotspots || {}) },
  };
}

/** id 기반 시나리오 로드. 현재는 c0024 단일. 추후 확장. */
export function getBaseScenario(id = 'c0024') {
  return baseJson;
}

export function useScenario(id = 'c0024') {
  const [scenario, setScenario] = useState(() => mergeScenario(getBaseScenario(id), loadOverride(id)));
  // localStorage 변경 감지 (다른 탭에서 저장 시)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY(id)) {
        setScenario(mergeScenario(getBaseScenario(id), loadOverride(id)));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [id]);
  return scenario;
}

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useAttackSimulatorData — 공격 시뮬레이터 데이터 로딩 훅
 *
 * 로드 순서:
 * 1. Supabase attack_simulator_data 테이블
 * 2. 로컬 JSON fallback (src/data/attack-simulators/*.json)
 * 3. null (데이터 없음 → 위젯 미표시)
 *
 * @param {string} subTechniqueId - 서브테크닉 ID (e.g. "T1078.002")
 * @returns {{ data: Object|null, loading: boolean, error: string|null }}
 */
export default function useAttackSimulatorData(subTechniqueId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cache = useRef({});

  useEffect(() => {
    if (!subTechniqueId) {
      setData(null);
      setLoading(false);
      return;
    }

    // 캐시 히트
    if (cache.current[subTechniqueId]) {
      setData(cache.current[subTechniqueId]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1) Supabase 조회
        const { data: row, error: dbErr } = await supabase
          .from('attack_simulator_data')
          .select('data')
          .eq('sub_technique_id', subTechniqueId)
          .maybeSingle();

        if (!cancelled && row?.data) {
          cache.current[subTechniqueId] = row.data;
          setData(row.data);
          setLoading(false);
          return;
        }

        // DB 에러는 무시하고 fallback 진행 (테이블 미생성 등)
        if (dbErr) {
          console.warn('[AttackSimulator] Supabase fallback:', dbErr.message);
        }
      } catch {
        // 네트워크 에러 → fallback
      }

      // 2) 로컬 JSON fallback (dynamic import)
      try {
        const mod = await import(`../data/attack-simulators/${subTechniqueId}.json`);
        const localData = mod.default || mod;
        if (!cancelled && localData?.subTechniqueId) {
          cache.current[subTechniqueId] = localData;
          setData(localData);
          setLoading(false);
          return;
        }
      } catch {
        // 로컬 파일 없음 → null
      }

      // 3) 데이터 없음
      if (!cancelled) {
        setData(null);
        setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [subTechniqueId]);

  return { data, loading, error };
}

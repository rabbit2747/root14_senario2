import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import fallbackData from '../data/matrix-fallback.json';

/**
 * IntroMatrix용 매트릭스 데이터 로더
 * Supabase 3테이블 → attackMatrix + langMapping 형태로 변환
 * DB 오류시 matrix-fallback.json 자동 폴백
 */
export default function useMatrixData() {
  const [attackMatrix, setAttackMatrix] = useState(fallbackData.attackMatrix);
  const [langMapping, setLangMapping] = useState(fallbackData.langMapping);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 병렬 쿼리
        const [tacRes, techRes, subRes] = await Promise.all([
          supabase.from('matrix_tactics').select('*').order('sort_order'),
          supabase.from('matrix_techniques').select('*').order('sort_order'),
          supabase.from('matrix_sub_techniques').select('*').order('sort_order'),
        ]);

        // 에러 체크
        if (tacRes.error || techRes.error || subRes.error) {
          throw new Error(
            tacRes.error?.message || techRes.error?.message || subRes.error?.message
          );
        }

        // 데이터가 비어있으면 fallback 사용
        if (!tacRes.data?.length) {
          console.warn('[useMatrixData] DB 비어있음 → fallback 사용');
          if (!cancelled) setLoading(false);
          return;
        }

        // ── DB → attackMatrix 형태 변환 ──
        // 서브기법 맵: technique_tid → [{name, sid}]
        const subsMap = {};
        (subRes.data || []).forEach(s => {
          if (!subsMap[s.technique_tid]) subsMap[s.technique_tid] = [];
          subsMap[s.technique_tid].push({ name: s.name, sid: s.sid });
        });

        // 기법 맵: tactic_id → [technique]
        const techMap = {};
        (techRes.data || []).forEach(t => {
          if (!techMap[t.tactic_id]) techMap[t.tactic_id] = [];
          const tech = {
            name: t.name,
            tid: t.tid,
            subs: subsMap[t.tid] || [],
          };
          if (t.is_critical) tech.isCritical = true;
          techMap[t.tactic_id].push(tech);
        });

        // attackMatrix 빌드
        const matrix = tacRes.data.map(tac => ({
          id: tac.id,
          title: tac.title,
          techniques: techMap[tac.id] || [],
        }));

        // ── DB → langMapping 변환 ──
        const langs = {};

        // 전술 번역
        tacRes.data.forEach(tac => {
          const trans = tac.translations || {};
          Object.entries(trans).forEach(([lang, val]) => {
            if (!langs[lang]) langs[lang] = { titles: {}, techniques: {} };
            langs[lang].titles[tac.title] = val;
          });
        });

        // 기법 번역
        (techRes.data || []).forEach(t => {
          const trans = t.translations || {};
          Object.entries(trans).forEach(([lang, val]) => {
            if (!langs[lang]) langs[lang] = { titles: {}, techniques: {} };
            langs[lang].techniques[t.name] = val;
          });
        });

        if (!cancelled) {
          setAttackMatrix(matrix);
          // langMapping이 비어있으면 fallback 유지
          if (Object.keys(langs).length > 0) {
            setLangMapping(langs);
          }
          setError(null);
        }
      } catch (err) {
        console.warn('[useMatrixData] DB 로드 실패 → fallback 사용:', err.message);
        if (!cancelled) setError(err.message);
        // fallback 데이터는 이미 초기값
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { attackMatrix, langMapping, loading, error };
}

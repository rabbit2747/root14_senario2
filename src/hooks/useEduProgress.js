import { useState, useEffect, useCallback, useMemo } from 'react';
// ✅ Phase 0: src/api/ 경유 — supabase 직접 호출 제거
import { getEduProgress } from '../api/edu';
import { useAuth } from '../context/AuthContext';
import eduMeta from '../data/edu-meta.json';

const LOCAL_PROGRESS_KEY = 'gotroot_edu_progress';

/**
 * 교육 진행률 데이터 조회 훅 (레벨 지원)
 * - Supabase edu_progress 테이블에서 사용자별 진행률 조회
 * - 비로그인 시 localStorage 폴백
 * - getProgress(techniqueId, level?): { completed, total, chapters, percent }
 *   - level 생략 시 전체 레벨 합산 (backward compatible)
 * - isComplete(techniqueId): boolean
 * - isLevelComplete(techniqueId, level): boolean
 * - isUnlocked(techniqueId, level): boolean
 * - completedTechIds: Set<string> — 완료된 기법 ID 집합
 */

const LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];

/** 기존 flat 배열 구조를 레벨 구조로 마이그레이션 */
function migrateToLevelStructure(data) {
  if (!data || typeof data !== 'object') return {};
  const result = {};
  Object.entries(data).forEach(([tid, val]) => {
    if (Array.isArray(val)) {
      // 기존 flat 형태 → beginner로 취급
      result[tid] = { novice: [], beginner: [...val], intermediate: [], advanced: [], expert: [] };
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      // 이미 레벨 구조
      result[tid] = {
        novice: val.novice || [],
        beginner: val.beginner || [],
        intermediate: val.intermediate || [],
        advanced: val.advanced || [],
        expert: val.expert || [],
      };
    }
  });
  return result;
}

export default function useEduProgress() {
  const { user, isLoggedIn } = useAuth();
  // { 'T1078.002': { beginner: ['ch1','ch2'], intermediate: [], advanced: [] }, ... }
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // ── localStorage 폴백 로드 (레벨 구조로 마이그레이션) ──
  const loadLocal = useCallback(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '{}');
      return migrateToLevelStructure(raw);
    } catch { return {}; }
  }, []);

  // ── Supabase에서 진행률 로드 ──
  const fetchProgress = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setProgress(loadLocal());
      setLoading(false);
      return;
    }

    try {
      // ✅ api/edu.js 경유 — supabase 직접 호출 없음
      const { data, error } = await getEduProgress(user.id);

      if (error) throw error;

      const grouped = {};
      (data || []).forEach(row => {
        const tid = row.technique_id;
        const lvl = row.level || 'beginner'; // level 컬럼 없으면 beginner 기본
        if (!grouped[tid]) grouped[tid] = { novice: [], beginner: [], intermediate: [], advanced: [], expert: [] };
        if (!grouped[tid][lvl]) grouped[tid][lvl] = [];
        if (!grouped[tid][lvl].includes(row.chapter_id)) {
          grouped[tid][lvl].push(row.chapter_id);
        }
      });

      // localStorage 데이터와 병합 (오프라인 중 기록된 것)
      const local = loadLocal();
      Object.entries(local).forEach(([tid, levels]) => {
        if (!grouped[tid]) grouped[tid] = { novice: [], beginner: [], intermediate: [], advanced: [], expert: [] };
        LEVELS.forEach(lvl => {
          const chapters = levels[lvl] || [];
          chapters.forEach(ch => {
            if (!grouped[tid][lvl]) grouped[tid][lvl] = [];
            if (!grouped[tid][lvl].includes(ch)) grouped[tid][lvl].push(ch);
          });
        });
      });

      setProgress(grouped);
    } catch {
      // 네트워크 실패 → localStorage 폴백
      setProgress(loadLocal());
    } finally {
      setLoading(false);
    }
  }, [user, isLoggedIn, loadLocal]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  // ── 특정 기법의 진행률 (level 생략 시 전체 합산) ──
  const getProgress = useCallback((techniqueId, level) => {
    const techProgress = progress[techniqueId] || { beginner: [], intermediate: [], advanced: [] };
    const meta = eduMeta.pages[techniqueId];

    if (level) {
      // 특정 레벨의 진행률
      const completed = techProgress[level] || [];
      // levels 구조가 있으면 해당 레벨의 chapters 수 사용, 없으면 기존 chapters 폴백
      const total = meta?.levels?.[level]?.chapters || meta?.chapters || 3;
      return {
        completed: completed.length,
        total,
        chapters: completed,
        percent: total > 0 ? Math.min(100, Math.round((completed.length / total) * 100)) : 0,
      };
    }

    // 전체 레벨 합산 (backward compatible)
    const allChapters = [
      ...(techProgress.beginner || []),
      ...(techProgress.intermediate || []),
      ...(techProgress.advanced || []),
    ];
    // levels 구조가 있으면 콘텐츠 있는 레벨만 합산, 없으면 기존 chapters 폴백
    const total = meta?.levels
      ? LEVELS.reduce((sum, lvl) => {
          // url이 있는 (콘텐츠 존재) 레벨만 카운트
          if (meta.levels[lvl]?.url) return sum + (meta.levels[lvl]?.chapters || 0);
          return sum;
        }, 0) || (meta?.chapters || 3)
      : (meta?.chapters || 3);
    return {
      completed: allChapters.length,
      total,
      chapters: allChapters,
      percent: total > 0 ? Math.min(100, Math.round((allChapters.length / total) * 100)) : 0,
    };
  }, [progress]);

  // ── 특정 기법 완료 여부 ──
  const isComplete = useCallback((techniqueId) => {
    const { completed, total } = getProgress(techniqueId);
    return completed >= total;
  }, [getProgress]);

  // ── 특정 레벨 완료 여부 ──
  const isLevelComplete = useCallback((techniqueId, level) => {
    const prog = getProgress(techniqueId, level);
    return prog.completed >= prog.total;
  }, [getProgress]);

  // ── 레벨 잠금 해제 여부 (novice→beginner→intermediate→advanced→expert 순차 해금) ──
  // 콘텐츠(url)가 없는 레벨은 잠금 조건에서 건너뜀 → 기존 사용자 진행률 보존
  const isUnlocked = useCallback((techniqueId, level) => {
    const meta = eduMeta.pages[techniqueId];
    const hasContent = (lvl) => !!(meta?.levels?.[lvl]?.url);
    if (level === 'novice') return true;
    if (level === 'beginner') return !hasContent('novice') || isLevelComplete(techniqueId, 'novice');
    if (level === 'intermediate') return !hasContent('beginner') || isLevelComplete(techniqueId, 'beginner');
    if (level === 'advanced') return !hasContent('intermediate') || isLevelComplete(techniqueId, 'intermediate');
    if (level === 'expert') return !hasContent('advanced') || isLevelComplete(techniqueId, 'advanced');
    return false;
  }, [isLevelComplete]);

  // ── 완료된 기법 ID Set (levels 구조 있으면 3레벨 모두 완료, 없으면 beginner만) ──
  const completedTechIds = useMemo(() => {
    const set = new Set();
    Object.keys(progress).forEach(tid => {
      const meta = eduMeta.pages[tid];
      if (meta?.levels) {
        // levels 구조가 있으면 콘텐츠 있는 레벨 모두 완료되어야 함
        const availableLevels = LEVELS.filter(lvl => meta.levels[lvl]?.url);
        const allDone = availableLevels.length > 0 && availableLevels.every(lvl => {
          const chapters = (progress[tid]?.[lvl] || []).length;
          const total = meta.levels[lvl]?.chapters || 0;
          return chapters >= total;
        });
        if (allDone) set.add(tid);
      } else {
        // levels 구조 없음 → 전체 합산으로 판단 (기존 호환)
        const techProgress = progress[tid] || { beginner: [], intermediate: [], advanced: [] };
        const allChapters = [
          ...(techProgress.beginner || []),
          ...(techProgress.intermediate || []),
          ...(techProgress.advanced || []),
        ];
        const total = meta?.chapters || 3;
        if (allChapters.length >= total) set.add(tid);
      }
    });
    return set;
  }, [progress]);

  // ── 전체 통계 ──
  const stats = useMemo(() => {
    const totalPages = Object.keys(eduMeta.pages).length;
    const startedPages = Object.keys(progress).length;
    const completedPages = completedTechIds.size;
    return { totalPages, startedPages, completedPages };
  }, [progress, completedTechIds]);

  return {
    progress,
    loading,
    getProgress,
    isComplete,
    isLevelComplete,
    isUnlocked,
    completedTechIds,
    stats,
    refresh: fetchProgress,
  };
}

// useAptProgress — APT 시나리오 완료 상태 훅
//
// 전략: Supabase edu_progress 테이블을 우선 소스로 사용 (technique_id='APT', level='apt')
//       비로그인 · 네트워크 실패 시 localStorage 폴백
//       쓰기는 DB + localStorage 이중 저장 (edu 패턴과 동일)

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAptCompletedScenarios, upsertAptScenarioComplete } from '../api/edu';

const LS_KEY = 'gotroot_apt_completed';

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function writeLocal(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...new Set(list)])); } catch {}
}

export default function useAptProgress() {
  const { user, isLoggedIn } = useAuth();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setCompleted(readLocal());
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await getAptCompletedScenarios(user.id);
      if (error) throw error;
      const fromDb = (data || []).map((r) => r.chapter_id);
      const merged = [...new Set([...fromDb, ...readLocal()])];
      setCompleted(merged);
      writeLocal(merged);
    } catch {
      setCompleted(readLocal());
    } finally {
      setLoading(false);
    }
  }, [user, isLoggedIn]);

  useEffect(() => { refresh(); }, [refresh]);

  const markComplete = useCallback(async (campaignId) => {
    if (!campaignId) return;
    const next = [...new Set([...completed, campaignId])];
    setCompleted(next);
    writeLocal(next);
    if (isLoggedIn && user) {
      try { await upsertAptScenarioComplete(user.id, campaignId); } catch {}
    }
  }, [completed, user, isLoggedIn]);

  const isCompleted = useCallback((id) => completed.includes(id), [completed]);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  return { completed, completedSet, isCompleted, markComplete, loading, refresh };
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GenericLabSimulator from './GenericLabSimulator';

// ── 전용 랩이 있는 기법 (기존 LabT1078.jsx 등) ──
const DEDICATED_LABS = {
  'T1078.002': '/lab/t1078',
};

// ── 시나리오 JSON 동적 로더 ──
const SCENARIO_LOADERS = {
  'T1589.003': () => import('../../data/lab-scenarios/T1589.003.json'),
  'T1596.001': () => import('../../data/lab-scenarios/T1596.001.json'),
  'T1595.002': () => import('../../data/lab-scenarios/T1595.002.json'),
  'T1583.001': () => import('../../data/lab-scenarios/T1583.001.json'),
  'T1585.001': () => import('../../data/lab-scenarios/T1585.001.json'),
  'T1587.001': () => import('../../data/lab-scenarios/T1587.001.json'),
  'T1566.001': () => import('../../data/lab-scenarios/T1566.001.json'),
  'T1195.002': () => import('../../data/lab-scenarios/T1195.002.json'),
  'T1059.001': () => import('../../data/lab-scenarios/T1059.001.json'),
  'T1047':     () => import('../../data/lab-scenarios/T1047.json'),
  'T1204.002': () => import('../../data/lab-scenarios/T1204.002.json'),
  'T1547.001': () => import('../../data/lab-scenarios/T1547.001.json'),
  'T1053.005': () => import('../../data/lab-scenarios/T1053.005.json'),
  'T1548.002': () => import('../../data/lab-scenarios/T1548.002.json'),
  'T1574.001': () => import('../../data/lab-scenarios/T1574.001.json'),
  'T1134.001': () => import('../../data/lab-scenarios/T1134.001.json'),
  'T1136.001': () => import('../../data/lab-scenarios/T1136.001.json'),
  'T1027.001': () => import('../../data/lab-scenarios/T1027.001.json'),
  'T1055.001': () => import('../../data/lab-scenarios/T1055.001.json'),
  'T1070.001': () => import('../../data/lab-scenarios/T1070.001.json'),
  'T1003.001': () => import('../../data/lab-scenarios/T1003.001.json'),
  'T1558.003': () => import('../../data/lab-scenarios/T1558.003.json'),
  'T1110.001': () => import('../../data/lab-scenarios/T1110.001.json'),
  'T1087.002': () => import('../../data/lab-scenarios/T1087.002.json'),
  'T1083':     () => import('../../data/lab-scenarios/T1083.json'),
  'T1046':     () => import('../../data/lab-scenarios/T1046.json'),
  'T1021.001': () => import('../../data/lab-scenarios/T1021.001.json'),
  'T1021.002': () => import('../../data/lab-scenarios/T1021.002.json'),
  'T1550.002': () => import('../../data/lab-scenarios/T1550.002.json'),
  'T1113':     () => import('../../data/lab-scenarios/T1113.json'),
  'T1114.001': () => import('../../data/lab-scenarios/T1114.001.json'),
  'T1560.001': () => import('../../data/lab-scenarios/T1560.001.json'),
  'T1071.001': () => import('../../data/lab-scenarios/T1071.001.json'),
  'T1071.004': () => import('../../data/lab-scenarios/T1071.004.json'),
  'T1573.001': () => import('../../data/lab-scenarios/T1573.001.json'),
  'T1041':     () => import('../../data/lab-scenarios/T1041.json'),
  'T1567.002': () => import('../../data/lab-scenarios/T1567.002.json'),
  'T1048.003': () => import('../../data/lab-scenarios/T1048.003.json'),
  'T1486':     () => import('../../data/lab-scenarios/T1486.json'),
  'T1561.001': () => import('../../data/lab-scenarios/T1561.001.json'),
  'T1498.001': () => import('../../data/lab-scenarios/T1498.001.json'),
};

export default function DesktopLab() {
  const { techniqueId, level } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  const dedicatedPath = DEDICATED_LABS[techniqueId];

  // ── Auth Gate ──
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/lab/desktop/${techniqueId}/${level || 'beginner'}`)}`, { replace: true });
      return;
    }
    setAuthChecked(true);
  }, [isLoggedIn, navigate, techniqueId, level]);

  // ── 전용 랩이 있으면 리다이렉트 ──
  useEffect(() => {
    if (authChecked && dedicatedPath) {
      navigate(dedicatedPath, { replace: true });
    }
  }, [authChecked, dedicatedPath, navigate]);

  // ── 시나리오 JSON 로드 ──
  useEffect(() => {
    if (!authChecked || dedicatedPath) return;

    const loader = SCENARIO_LOADERS[techniqueId];
    if (loader) {
      loader()
        .then(mod => { setScenario(mod.default || mod); setLoading(false); })
        .catch(() => { setScenario(null); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [authChecked, dedicatedPath, techniqueId]);

  // 로딩 (Auth 체크, 리다이렉트, 또는 시나리오 로드 중)
  if (!authChecked || dedicatedPath || loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-amber-300/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  // ── 시나리오가 있으면 GenericLabSimulator 렌더링 ──
  if (scenario) {
    return <GenericLabSimulator scenario={scenario} techniqueId={techniqueId} />;
  }

  // ── 시나리오 없음 — 폴백 (이론상 도달하지 않음) ──
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center text-white px-4">
      <div className="text-5xl mb-4">🖥️</div>
      <h1 className="text-xl font-black mb-2">Desktop Simulator</h1>
      <p className="text-slate-500 text-sm mb-6">{techniqueId}</p>
      <button onClick={() => navigate(`/edu/${techniqueId}`)}
        className="text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer">
        ← 과정 선택으로 돌아가기
      </button>
    </div>
  );
}

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import eduMeta from '../../data/edu-meta.json';
import { getStoredLang } from '../../components/LangToggle';
import useAttackSimulatorData from '../../hooks/useAttackSimulatorData';
import { Screen, Renew, SkipForwardFilled, Trophy, GameConsole } from '@carbon/icons-react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TacticWidgetTemplate = lazy(() => import('../../components/tactic-widgets/TacticWidgetTemplate'));
const AttackSimulatorWidget = lazy(() => import('../../components/attack-simulator/AttackSimulatorWidget'));

// ── 택틱별 로컬 JSON 로더 (Supabase 실패 시 폴백) ──
const TACTIC_LOADERS = {
  t1:  () => import('../../data/tactic-widgets/t1-recon.json'),
  t2:  () => import('../../data/tactic-widgets/t2-resource-development.json'),
  t3:  () => import('../../data/tactic-widgets/t3-initial-access.json'),
  t4:  () => import('../../data/tactic-widgets/t4-execution.json'),
  t5:  () => import('../../data/tactic-widgets/t5-persistence.json'),
  t6:  () => import('../../data/tactic-widgets/t6-privilege-escalation.json'),
  t7:  () => import('../../data/tactic-widgets/t7-defense-evasion.json'),
  t8:  () => import('../../data/tactic-widgets/t8-credential-access.json'),
  t9:  () => import('../../data/tactic-widgets/t9-discovery.json'),
  t10: () => import('../../data/tactic-widgets/t10-lateral-movement.json'),
  t11: () => import('../../data/tactic-widgets/t11-collection.json'),
  t12: () => import('../../data/tactic-widgets/t12-command-and-control.json'),
  t13: () => import('../../data/tactic-widgets/t13-exfiltration.json'),
  t14: () => import('../../data/tactic-widgets/t14-impact.json'),
};

// ── 택틱 이름 매핑 ──
const TACTIC_NAMES = {
  t1: 'Reconnaissance', t2: 'Resource Development', t3: 'Initial Access',
  t4: 'Execution', t5: 'Persistence', t6: 'Privilege Escalation',
  t7: 'Defense Evasion', t8: 'Credential Access', t9: 'Discovery',
  t10: 'Lateral Movement', t11: 'Collection', t12: 'Command & Control',
  t13: 'Exfiltration', t14: 'Impact',
};

const TACTIC_NAMES_KO = {
  t1: '정찰', t2: '자원 개발', t3: '초기 침투',
  t4: '실행', t5: '지속성 유지', t6: '권한 상승',
  t7: '방어 회피', t8: '자격증명 접근', t9: '탐색',
  t10: '측면 이동', t11: '수집', t12: '명령 및 제어',
  t13: '유출', t14: '영향',
};

// ── URL 파라미터 해석: tacticId(t3) 또는 techniqueId(T1078.002) ──
function resolveIds(id) {
  if (/^t\d{1,2}$/.test(id)) return { tacticId: id, techniqueId: null };
  const page = eduMeta.pages[id];
  return { tacticId: page?.tacticIds?.[0] || null, techniqueId: id };
}

// ── 다국어 UI 텍스트 ──
const uiText = {
  ko: {
    animationLab: '애니메이션 랩',
    loading: '위젯 데이터 로딩 중...',
    notFound: '위젯 데이터를 찾을 수 없습니다',
    completed: '애니메이션 랩 완료!',
    completedDesc: '공격 시나리오 애니메이션을 모두 살펴보았습니다.\n다음 단계로 이동하거나 다시 시청할 수 있습니다.',
    nextDesktop: '데스크톱 시뮬레이터로 이동',
    backToCourse: '과정 선택으로 돌아가기',
    backToMatrix: '매트릭스로 돌아가기',
    replay: '다시 보기',
    skip: '완료로 건너뛰기',
    tactic: '전술',
    simulator: '시뮬레이터',
  },
  en: {
    animationLab: 'Animation Lab',
    loading: 'Loading widget data...',
    notFound: 'Widget data not found',
    completed: 'Animation Lab Complete!',
    completedDesc: 'You have explored all attack scenario animations.\nContinue to the next step or replay.',
    nextDesktop: 'Continue to Desktop Simulator',
    backToCourse: 'Back to Course Selection',
    backToMatrix: 'Back to Matrix',
    replay: 'Replay',
    skip: 'Skip to Complete',
    tactic: 'Tactic',
    simulator: 'Simulator',
  },
  zh: {
    animationLab: '动画实验室',
    loading: '正在加载数据...',
    notFound: '未找到数据',
    completed: '动画实验室完成！',
    completedDesc: '您已浏览所有攻击场景动画。\n继续下一步或重播。',
    nextDesktop: '继续到桌面模拟器',
    backToCourse: '返回课程选择',
    backToMatrix: '返回矩阵',
    replay: '重播',
    skip: '跳过',
    tactic: '战术',
    simulator: '模拟器',
  },
  hi: {
    animationLab: 'एनिमेशन लैब',
    loading: 'डेटा लोड हो रहा है...',
    notFound: 'डेटा नहीं मिला',
    completed: 'एनिमेशन लैब पूर्ण!',
    completedDesc: 'आपने सभी हमले के परिदृश्य एनिमेशन देख लिए हैं।\nअगले चरण पर जाएं या फिर से देखें।',
    nextDesktop: 'डेस्कटॉप सिम्युलेटर पर जाएं',
    backToCourse: 'कोर्स चयन पर वापस',
    backToMatrix: 'मैट्रिक्स पर वापस',
    replay: 'फिर से',
    skip: 'छोड़ें',
    tactic: 'रणनीति',
    simulator: 'सिम्युलेटर',
  },
  ja: {
    animationLab: 'アニメーションラボ',
    loading: 'データを読み込み中...',
    notFound: 'データが見つかりません',
    completed: 'アニメーションラボ完了！',
    completedDesc: 'すべての攻撃シナリオアニメーションを確認しました。\n次のステップに進むか、再生できます。',
    nextDesktop: 'デスクトップシミュレーターへ',
    backToCourse: 'コース選択に戻る',
    backToMatrix: 'マトリックスに戻る',
    replay: 'リプレイ',
    skip: 'スキップ',
    tactic: '戦術',
    simulator: 'シミュレーター',
  },
};

export default function AnimationLab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [language] = useState(() => getStoredLang());
  const [widgetData, setWidgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  // 강제 리마운트용 키
  const [widgetKey, setWidgetKey] = useState(0);

  const { tacticId, techniqueId } = resolveIds(id);
  const t = uiText[language] || uiText.en;

  // ── 공격 시뮬레이터 데이터 로드 (서브테크닉 ID가 있을 때) ──
  const { data: simData, loading: simLoading } = useAttackSimulatorData(techniqueId);
  const isSimulatorMode = !!simData?.phases?.length;

  // ── Auth Gate ──
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/lab/animation/${id}`)}`, { replace: true });
      return;
    }
    setAuthChecked(true);
  }, [isLoggedIn, navigate, id]);

  // ── 택틱 위젯 데이터 로드: Supabase → 로컬 JSON 폴백 ──
  useEffect(() => {
    if (!authChecked || !tacticId) {
      if (!tacticId) { setError('Invalid tactic ID'); setLoading(false); }
      return;
    }

    let cancelled = false;
    async function loadWidget() {
      setLoading(true);
      setError(null);

      // 1) Supabase widget_data 조회
      try {
        const { data: supaData, error: supaErr } = await supabase
          .from('widget_data')
          .select('data')
          .eq('tactic_id', tacticId)
          .single();

        if (!cancelled && !supaErr && supaData?.data) {
          setWidgetData(supaData.data);
          setLoading(false);
          return;
        }
      } catch { /* Supabase 실패 → 로컬 폴백 */ }

      // 2) 로컬 JSON 폴백
      const loader = TACTIC_LOADERS[tacticId];
      if (loader) {
        try {
          const mod = await loader();
          if (!cancelled) setWidgetData(mod.default || mod);
        } catch {
          if (!cancelled) setError('Failed to load widget data');
        }
      } else {
        if (!cancelled) setError('No widget data for this tactic');
      }
      if (!cancelled) setLoading(false);
    }

    loadWidget();
    return () => { cancelled = true; };
  }, [tacticId, authChecked]);

  // ── 위젯 완료 콜백 ──
  const handleComplete = useCallback(() => {
    setCompleted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── 다시 보기 ──
  const handleReplay = useCallback(() => {
    setCompleted(false);
    setWidgetKey(k => k + 1);
  }, []);

  // ── 로딩 화면 (택틱 + 시뮬레이터 모두 대기) ──
  if (!authChecked || loading || (techniqueId && simLoading)) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-300/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-mono">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ── 에러/데이터 없음 (시뮬레이터 데이터가 있으면 에러 무시) ──
  if (!isSimulatorMode && (!tacticId || error || !widgetData)) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center text-slate-400 gap-4 px-4">
        <div className="text-5xl">🔌</div>
        <div className="text-lg font-semibold">{error || t.notFound}</div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer"
        >
          {t.backToMatrix}
        </button>
      </div>
    );
  }

  // ── 완료 화면 ──
  if (completed) {
    const tacticNameLocal = language === 'ko' ? TACTIC_NAMES_KO[tacticId] : TACTIC_NAMES[tacticId];
    const displayName = isSimulatorMode
      ? (simData.nameKo || simData.subTechniqueName || techniqueId)
      : (tacticNameLocal || tacticId);

    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* 성공 아이콘 */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto border border-emerald-500/30 text-emerald-400">
              <Trophy size={48} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg shadow-emerald-500/40">✓</div>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">{t.completed}</h1>
          <p className="text-slate-400 font-mono text-sm mb-1">{displayName}</p>
          <p className="text-slate-500 text-sm mb-8 whitespace-pre-line leading-relaxed">{t.completedDesc}</p>

          <div className="flex flex-col gap-3">
            {/* 데스크톱 랩으로 이동 (techniqueId가 있을 때만) */}
            {techniqueId && (
              <button
                onClick={() => navigate(`/lab/desktop/${techniqueId}`)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 inline-flex items-center justify-center gap-2"
              >
                <Screen size={16} /> {t.nextDesktop}
              </button>
            )}

            {/* 다시 보기 */}
            <button
              onClick={handleReplay}
              className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all cursor-pointer border border-slate-700 inline-flex items-center justify-center gap-2"
            >
              <Renew size={16} /> {t.replay}
            </button>

            {/* 뒤로 가기 */}
            <button
              onClick={() => techniqueId ? navigate(`/edu/${techniqueId}`) : navigate('/')}
              className="text-sm text-slate-500 hover:text-slate-300 transition cursor-pointer mt-2 inline-flex items-center gap-1"
            >
              <ArrowLeftIcon className="w-4 h-4" /> {techniqueId ? t.backToCourse : t.backToMatrix}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 메인: 위젯 재생 화면 ──
  const tacticNameEn = TACTIC_NAMES[tacticId] || tacticId;
  const tacticNameKo = TACTIC_NAMES_KO[tacticId] || '';

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1a]/80 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => techniqueId ? navigate(`/edu/${techniqueId}`) : navigate('/')}
            className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-4 h-4" /> {techniqueId ? t.backToCourse : t.backToMatrix}
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              {isSimulatorMode ? (
                <>
                  <span className="text-[10px] font-bold tracking-wider text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <GameConsole size={12} className="inline" /> {t.simulator}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{techniqueId}</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold tracking-wider text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    {t.tactic}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{tacticNameEn}</span>
                  {tacticNameKo && (
                    <span className="text-xs text-slate-600">({tacticNameKo})</span>
                  )}
                </>
              )}
            </div>
            <button
              onClick={() => setCompleted(true)}
              className="text-[11px] text-slate-600 hover:text-slate-400 transition cursor-pointer border border-slate-800 px-3 py-1 rounded-full hover:border-slate-600 inline-flex items-center gap-1"
            >
              {t.skip} <SkipForwardFilled size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 위젯 본문 */}
      <div className="flex-1 p-3 md:p-6 max-w-7xl mx-auto w-full">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-96">
              <div className="w-10 h-10 border-3 border-blue-300/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          }
        >
          {isSimulatorMode ? (
            <AttackSimulatorWidget
              key={widgetKey}
              subTechniqueId={techniqueId}
              embedded
              onComplete={handleComplete}
            />
          ) : (
            <TacticWidgetTemplate
              key={widgetKey}
              tacticData={widgetData}
              onComplete={handleComplete}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

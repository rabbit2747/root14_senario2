import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useEduProgress from '../hooks/useEduProgress';
import eduMeta from '../data/edu-meta.json';
import LoadingScreen from '../components/LoadingScreen';

// ── 택틱 메타 (LearningPathChoice와 동일) ──
const TACTIC_META = {
  t1:  { emoji: '🔍', ko: '정찰',           en: 'Reconnaissance' },
  t2:  { emoji: '🛠️', ko: '자원 개발',      en: 'Resource Development' },
  t3:  { emoji: '🚪', ko: '초기 접근',      en: 'Initial Access' },
  t4:  { emoji: '⚡', ko: '실행',           en: 'Execution' },
  t5:  { emoji: '🔗', ko: '지속성',         en: 'Persistence' },
  t6:  { emoji: '⬆️', ko: '권한 상승',      en: 'Privilege Escalation' },
  t7:  { emoji: '🛡️', ko: '방어 회피',      en: 'Defense Evasion' },
  t8:  { emoji: '🔑', ko: '자격 증명 접근', en: 'Credential Access' },
  t9:  { emoji: '🔎', ko: '탐색',           en: 'Discovery' },
  t10: { emoji: '↔️', ko: '측면 이동',      en: 'Lateral Movement' },
  t11: { emoji: '📦', ko: '수집',           en: 'Collection' },
  t12: { emoji: '📡', ko: 'C2',             en: 'Command & Control' },
  t13: { emoji: '📤', ko: '유출',           en: 'Exfiltration' },
  t14: { emoji: '💥', ko: '영향',           en: 'Impact' },
};

// ── 유도 학습 콘텐츠 존재 여부 (CHAPTER_LOADERS 키와 동기화) ──
const GUIDED_AVAILABLE = new Set(['T1566.001']);

// ── 학습 단계 정의 ──
const STEPS = [
  { key: 'edu',      emoji: '📖', label: '기초 교육',     labelEn: 'Education',      desc: '핵심 개념과 이론을 챕터별로 학습합니다' },
  { key: 'graphic',  emoji: '🎬', label: '그래픽 설명',   labelEn: 'Graphic',        desc: '시각적 시네마틱으로 공격 흐름을 이해합니다' },
  { key: 'scenario', emoji: '🎯', label: '시나리오 학습', labelEn: 'Scenario',       desc: '실제 공격 시나리오를 분석하고 대응합니다' },
  { key: 'lab',      emoji: '🔬', label: '실습 랩',       labelEn: 'Lab Simulation', desc: '가상 환경에서 공격과 방어를 직접 실습합니다' },
];

// ── macOS 윈도우 래퍼 ──
function PageWrapper({ children, isDark, toggleTheme }) {
  return (
    <div className={`min-h-[100dvh] flex flex-col justify-center items-center transition-colors duration-300 overflow-hidden ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#F4F1EA]'}`}>
      <div className={`w-[95%] max-w-[850px] max-h-[90dvh] flex flex-col rounded-xl z-10 transition-all duration-300 ${isDark ? 'bg-[#242424] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]' : 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]'}`}>
        {/* 타이틀바 */}
        <div className={`h-12 flex-shrink-0 flex items-center px-5 relative border-b rounded-t-xl ${isDark ? 'bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] border-[#111]' : 'bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1]'}`}>
          <div className="flex gap-2">
            <div className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className={`absolute w-full text-center left-0 text-sm font-semibold pointer-events-none ${isDark ? 'text-[#a1a1aa]' : 'text-[#4d4d4d]'}`}>
            Recommended_Course.app
          </div>
          <button onClick={toggleTheme} className="ml-auto z-10 relative text-gray-500 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-200 transition-colors" title="다크 모드 전환">
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.32a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.415l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.32 4.22a1 1 0 010 1.415l-.707.708a1 1 0 01-1.415-1.414l.708-.708a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-1.32a1 1 0 01-1.415 0l-.708-.707a1 1 0 011.414-1.415l.708.708a1 1 0 010 1.414zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm1.32-4.22a1 1 0 010-1.415l.707-.708a1 1 0 011.415 1.414l-.708.708a1 1 0 01-1.414 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
        </div>
        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RecommendedCoursePage() {
  const { techniqueId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { getProgress, isLevelComplete } = useEduProgress();

  // 다크모드
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  };

  // Auth Gate
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate(`/login?redirect=/recommended/${techniqueId}`, { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate, techniqueId]);

  // 기법 메타 데이터
  const pages = eduMeta.pages || eduMeta;
  const techInfo = pages[techniqueId];

  // 진행률 계산
  const progress = useMemo(() => {
    if (!techInfo) return null;
    return getProgress(techniqueId, 'beginner');
  }, [techniqueId, techInfo, getProgress]);

  const eduComplete = useMemo(() => {
    return isLevelComplete(techniqueId, 'beginner');
  }, [techniqueId, isLevelComplete]);

  // 각 단계 가용 여부 확인
  const stepAvailability = useMemo(() => {
    if (!techInfo) return {};
    const beginnerUrl = techInfo.levels?.beginner?.url;
    // 그래픽: 현재 T1587.001-beginner만 존재
    const graphicKey = `${techniqueId}-beginner`;
    const hasGraphic = graphicKey === 'T1587.001-beginner'; // 추후 확장 시 데이터 맵 참조
    // 시나리오: ScenarioExplanationPage가 존재하는지 (모든 기법에 대해 페이지 있음)
    const hasScenario = !!beginnerUrl;
    // 랩: lab-scenarios 디렉토리에 JSON이 있는지 (DesktopLab SCENARIO_LOADERS 참조)
    const hasLab = true; // 186개 시나리오 존재, 대부분 매핑됨
    return {
      edu: !!beginnerUrl,
      graphic: hasGraphic,
      scenario: hasScenario,
      lab: hasLab,
    };
  }, [techInfo, techniqueId]);

  // 택틱 정보 조회
  const tacticInfo = useMemo(() => {
    if (!techInfo?.tacticIds?.[0]) return null;
    return TACTIC_META[techInfo.tacticIds[0]] || null;
  }, [techInfo]);

  if (authLoading || !isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#F4F1EA]'}`}>
        <div className={`w-[95%] max-w-[850px] flex flex-col rounded-xl ${isDark ? 'bg-[#242424] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]' : 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]'}`}>
          <div className={`h-12 flex-shrink-0 flex items-center px-5 relative border-b rounded-t-xl ${isDark ? 'bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] border-[#111]' : 'bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1]'}`}>
            <div className="flex gap-2">
              <div className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>
            <div className={`absolute w-full text-center left-0 text-sm font-semibold pointer-events-none ${isDark ? 'text-[#a1a1aa]' : 'text-[#4d4d4d]'}`}>Recommended_Course.app</div>
          </div>
          <div className="p-[50px_60px] min-h-[450px] flex flex-col">
            <LoadingScreen
              steps={[
                { label: '인증 세션 확인', status: 'VERIFYING' },
                { label: '추천 학습 경로 분석', status: 'ANALYZING' },
                { label: '진행률 데이터 동기화', status: 'SYNCING' },
              ]}
              isDark={isDark}
              title="Recommended Course"
              subtitle="추천 학습 로드맵"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!techInfo) {
    return (
      <PageWrapper isDark={isDark} toggleTheme={toggleTheme}>
        <div className="text-center py-16">
          <p className={`text-6xl mb-4`}>📭</p>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            콘텐츠를 찾을 수 없습니다
          </h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            기법 ID: {techniqueId}
          </p>
          <button onClick={() => navigate('/learning-path')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
            ← 학습 경로로 돌아가기
          </button>
        </div>
      </PageWrapper>
    );
  }

  // 각 단계 클릭 핸들러
  const handleStepClick = (stepKey) => {
    switch (stepKey) {
      case 'edu':
        if (techInfo.levels?.beginner?.url) {
          window.location.href = techInfo.levels.beginner.url;
        }
        break;
      case 'graphic':
        navigate(`/edu/graphic/${techniqueId}`);
        break;
      case 'scenario':
        navigate(`/edu/scenario/${techniqueId}`);
        break;
      case 'lab':
        navigate(`/lab/desktop/${techniqueId}`);
        break;
    }
  };

  // 진행률 퍼센트
  const progressPercent = progress
    ? Math.min(100, Math.round((progress.completed / Math.max(1, progress.total)) * 100))
    : 0;

  return (
    <PageWrapper isDark={isDark} toggleTheme={toggleTheme}>
      <div className="animate-[fadeIn_0.3s_ease-out]">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/learning-path')}
          className={`flex items-center gap-1 text-sm mb-5 transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          학습 경로로 돌아가기
        </button>

        {/* 기법 헤더 */}
        <div className="mb-6">
          {/* 택틱 배지 */}
          {tacticInfo && (
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
              {tacticInfo.emoji} {tacticInfo.ko}
            </span>
          )}
          <h1 className={`text-xl sm:text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {techInfo.title}
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {techniqueId} · {techInfo.titleEn}
          </p>
        </div>

        {/* 전체 진행률 바 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              학습 진행률
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {progressPercent}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 학습 로드맵 (4단계) */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const available = stepAvailability[step.key];
            const isEduStep = step.key === 'edu';
            const stepComplete = isEduStep && eduComplete;

            // 스텝 상태 결정
            let status = 'locked'; // locked, available, in-progress, complete
            if (!available) {
              status = 'coming-soon';
            } else if (isEduStep && stepComplete) {
              status = 'complete';
            } else if (isEduStep && progressPercent > 0) {
              status = 'in-progress';
            } else if (available) {
              status = 'available';
            }

            // 스타일 결정
            const baseCard = isDark
              ? 'bg-[#2a2a2a] border-[#333]'
              : 'bg-white border-gray-200';
            const hoverCard = status === 'available' || status === 'in-progress' || status === 'complete'
              ? (isDark ? 'hover:bg-[#333] hover:border-blue-800/40' : 'hover:bg-blue-50/50 hover:border-blue-300')
              : '';
            const cursor = status === 'coming-soon' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

            return (
              <div
                key={step.key}
                onClick={() => {
                  if (status !== 'coming-soon') handleStepClick(step.key);
                }}
                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${baseCard} ${hoverCard} ${cursor}`}
              >
                {/* 단계 번호 + 연결선 */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                    status === 'complete' ? 'bg-emerald-500 text-white' :
                    status === 'in-progress' ? 'bg-blue-500 text-white' :
                    status === 'available' ? (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600') :
                    (isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400')
                  }`}>
                    {status === 'complete' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="text-sm">{step.emoji}</span>
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-0.5 h-3 mt-1 ${
                      status === 'complete' ? 'bg-emerald-400' :
                      status === 'in-progress' ? 'bg-blue-400' :
                      (isDark ? 'bg-gray-700' : 'bg-gray-200')
                    }`} />
                  )}
                </div>

                {/* 단계 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      STEP {idx + 1}. {step.label}
                    </h3>
                    {status === 'complete' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                        완료
                      </span>
                    )}
                    {status === 'in-progress' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                        진행중 {progressPercent}%
                      </span>
                    )}
                    {status === 'coming-soon' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                        준비중
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {step.desc}
                  </p>
                </div>

                {/* 화살표 */}
                {status !== 'coming-soon' && (
                  <svg className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* 유도 학습 시작 버튼 */}
        {GUIDED_AVAILABLE.has(techniqueId) && (
          <div className={`mt-6 p-5 rounded-xl border-2 border-dashed transition-all ${isDark ? 'border-purple-500/30 bg-purple-900/10' : 'border-purple-300 bg-purple-50/50'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🧭</span>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    유도 학습 모드
                  </h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isDark ? 'bg-purple-800/40 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                    NEW
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  일본식 유도 학습법으로 14챕터를 단계별로 탐구합니다. 코드 조립, 모의 터미널, 퀴즈 등 인터랙티브 학습이 포함되어 있습니다.
                </p>
              </div>
              <button
                onClick={() => navigate(`/guided/${techniqueId}`)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97] ${isDark ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200'}`}
              >
                🧭 유도 학습 시작
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* 하단 정보 */}
        <div className={`mt-6 p-4 rounded-lg text-xs ${isDark ? 'bg-[#1e1e1e] text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          <p className="flex items-center gap-1.5">
            <span>💡</span>
            <span>각 단계를 순서대로 학습하면 더 효과적입니다. 기초 교육을 먼저 완료한 후 그래픽 설명으로 넘어가세요.</span>
          </p>
          {techInfo.levels?.beginner?.estimatedMinutes && (
            <p className="mt-1.5 flex items-center gap-1.5">
              <span>⏱</span>
              <span>예상 학습 시간: 약 {techInfo.levels.beginner.estimatedMinutes}분 (기초 교육 기준)</span>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageWrapper>
  );
}

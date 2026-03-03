import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Icons } from './labT1078Data';
import LangToggle, { getStoredLang, storeLang } from '../../components/LangToggle';
import useSimulationZoom from '../../hooks/useSimulationZoom';
import { Close } from '@carbon/icons-react';

// ── 다국어 UI (LabT1078과 동일 구조) ──
const UI = {
  ko: {
    configTitle: '모의훈련 환경 설정', configSub: '입력한 정보가 터미널 환경에 동기화됩니다.',
    userLabel: '피해자 이름', corpLabel: '타겟 회사명', startBtn: '훈련 시작하기',
    hackerView: '💻 피해자 PC', defenderView: '🛡️ 방어자 SOC',
    what: '상황 설명', why: '전문가 인사이트', termsLabel: '핵심 용어 및 도구',
    defAnalysis: '🔍 탐지 분석', defResponse: '🛡️ 대응 전략', defCheckpoint: '📋 SOC 확인 포인트',
    defWhatHappened: '무슨 일이 일어났나?', defWhyImportant: '왜 중요한가?', defWhatToDo: '어떻게 대응해야 하는가?',
    complete: '훈련 완료 🎉', resetBtn: '초기화 및 재설정', socTitle: '🛡️ SOC 실시간 알럿',
    state0: '해커 침투 연출 중...', stateWaitTTS: '음성 대기 중...',
    statePlay: (t) => `다음 단계까지 ${t}초...`, statePause: '일시정지됨',
    completeMsg: (u, c) => `${u}님, ${c} 인프라 방어 훈련을 마쳤습니다.`,
    topoMap: '네트워크 토폴로지',
    warning: '⚠️ 경고: 본 훈련에 포함된 해킹 도구 및 기법은 오직 \'보안 교육 및 방어 훈련\' 목적으로만 제공됩니다. 불법적인 사용에 대한 책임은 전적으로 본인에게 있습니다.',
    agreeText: '위의 법적 고지 및 책임 소재를 완전히 이해하였으며 이에 동의합니다.',
  },
  en: {
    configTitle: 'Simulation Setup', configSub: 'Info will be synced with the terminal.',
    userLabel: 'Victim Name', corpLabel: 'Company Name', startBtn: 'Start Training',
    hackerView: '💻 Victim PC', defenderView: '🛡️ Defender SOC',
    what: 'Scenario', why: 'Expert Insight', termsLabel: 'Key Terms & Tools',
    defAnalysis: '🔍 Detection Analysis', defResponse: '🛡️ Response Strategy', defCheckpoint: '📋 SOC Checkpoints',
    defWhatHappened: 'What Happened?', defWhyImportant: 'Why It Matters', defWhatToDo: 'How to Respond',
    complete: 'Training Complete 🎉', resetBtn: 'Restart Setup', socTitle: '🛡️ SOC Live Alert',
    state0: 'Infiltrating...', stateWaitTTS: 'Audio playing...',
    statePlay: (t) => `Next in ${t}s.`, statePause: 'Paused',
    completeMsg: (u, c) => `Congrats ${u}! You secured ${c}.`,
    topoMap: 'Network Topology',
    warning: '⚠️ WARNING: Educational use only. The user bears all legal responsibility for any misuse.',
    agreeText: 'I agree to this legal disclaimer.',
  },
};

/**
 * GenericLabSimulator — LabT1078 수준의 데스크톱 시뮬레이션
 * @param {{ scenario: Object, techniqueId: string }} props
 */
export default function GenericLabSimulator({ scenario, techniqueId }) {
  const navigate = useNavigate();
  const totalSteps = scenario.steps.length;
  const targetStepDuration = scenario.stepDuration || 8;
  const colors = { bg: '#e2e8f0', surface: '#ffffff', primary: '#9c6644', primaryLight: '#ede0d4', textDark: '#1e293b', border: '#cbd5e1' };

  // ── Hooks (조건부 return 이전에 모두 선언) ──
  const [lang, setLang] = useState(() => getStoredLang());
  const [showConfig, setShowConfig] = useState(true);
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('Corp');
  const [agreed, setAgreed] = useState(false);

  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(targetStepDuration);
  const [ttsFinished, setTtsFinished] = useState(false);
  const [tooltipExpanded, setTooltipExpanded] = useState(true);
  const [selectedLogIndex, setSelectedLogIndex] = useState(null);
  const [viewMode, setViewMode] = useState('hacker');
  const [isMuted, setIsMuted] = useState(false);
  const [hackerLogOpen, setHackerLogOpen] = useState(false);

  const logEndRef = useRef(null);
  const defLogEndRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const simZoom = useSimulationZoom({ enabled: isMobile });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile && simZoom.zoom > 1) simZoom.resetZoom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // ── Supabase 실명 자동 주입 ──
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: p } = await supabase.from('profiles').select('name').eq('id', session.user.id).single();
        if (p?.name) setUserName(p.name);
      }
    })();
  }, []);

  const t = UI[lang] || UI.en;
  const uName = userName || '훈련생';
  const cName = companyName || 'Corp';
  const replaceVars = useCallback((str) => str?.replace(/\{userName\}/g, uName).replace(/\{companyName\}/g, cName) || '', [uName, cName]);

  const safeStep = Math.min(Math.max(step, 0), totalSteps - 1);
  const current = scenario.steps[safeStep] || scenario.steps[0];

  // ── 4-Phase 진행 표시 ──
  const phases = (() => {
    if (scenario.phases && scenario.phases.length > 0) return scenario.phases;
    // auto-divide into 4 equal groups
    const phaseCount = 4;
    const perPhase = Math.ceil(totalSteps / phaseCount);
    const defaultLabels = [
      { label: '🔍 정찰', labelEn: '🔍 Recon' },
      { label: '⚡ 공격', labelEn: '⚡ Attack' },
      { label: '🔓 침투', labelEn: '🔓 Exploit' },
      { label: '🏁 완료', labelEn: '🏁 Complete' },
    ];
    return defaultLabels.map((dl, idx) => {
      const start = idx * perPhase;
      const end = Math.min(start + perPhase - 1, totalSteps - 1);
      const steps = [];
      for (let i = start; i <= end; i++) steps.push(i);
      return { ...dl, steps };
    }).filter(p => p.steps.length > 0);
  })();

  const getCurrentPhaseIndex = () => {
    for (let i = 0; i < phases.length; i++) {
      if (phases[i].steps.includes(safeStep)) return i;
    }
    return 0;
  };

  // ── 오디오 ──
  const initAudio = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const playWarningSound = () => {
    if (isMuted) return;
    initAudio();
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // ── 완료 페이지 네비게이션 ──
  const navigateToComplete = useCallback(() => {
    window.speechSynthesis?.cancel();
    // 완료 기록 localStorage
    try {
      const labs = JSON.parse(localStorage.getItem('gotroot_completed_labs') || '[]');
      const entry = { name: `${scenario.id} - ${scenario.titleEn}`, technique: scenario.id, completedAt: new Date().toISOString() };
      if (!labs.some(l => l.technique === entry.technique)) { labs.push(entry); localStorage.setItem('gotroot_completed_labs', JSON.stringify(labs)); }
    } catch {}
    navigate(`/lab/complete/${techniqueId}`, {
      state: {
        userName: uName,
        companyName: cName,
        scenarioTitle: scenario.title,
        scenarioTitleEn: scenario.titleEn,
        totalSteps,
        duration: scenario.duration || 0,
      },
    });
  }, [navigate, techniqueId, uName, cName, scenario, totalSteps]);

  // ── 툴팁 자동 접기 ──
  useEffect(() => {
    setTooltipExpanded(true);
    let timer;
    if (isPlaying && !showConfig) timer = setTimeout(() => setTooltipExpanded(false), 5000);
    return () => clearTimeout(timer);
  }, [step, isPlaying, showConfig]);

  // ── 스텝 변경 시 로그 인덱스 동기화 ──
  useEffect(() => { setSelectedLogIndex(step > 0 ? step : null); setHackerLogOpen(false); }, [step]);

  // ── 타이머 ──
  useEffect(() => {
    let timer;
    if (isPlaying && !showConfig) timer = setInterval(() => setTimeLeft(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, showConfig, step]);

  // ── 자동 진행 (TTS 완료 대기) ──
  useEffect(() => {
    if (isPlaying && !showConfig) {
      const ready = timeLeft === 0 && (isMuted || ttsFinished);
      if (ready) {
        if (step < totalSteps - 1) {
          setStep(s => s + 1); setTimeLeft(targetStepDuration); setTtsFinished(false);
        } else {
          // 마지막 스텝 완료 → 완료 페이지로 이동
          setIsPlaying(false);
          setTimeout(() => navigateToComplete(), 1500);
        }
      }
    }
  }, [timeLeft, ttsFinished, isPlaying, isMuted, showConfig, step, totalSteps, targetStepDuration, navigateToComplete]);

  // ── TTS ──
  useEffect(() => {
    if (isPlaying && !showConfig) {
      window.speechSynthesis?.cancel();
      if (step === totalSteps - 1 && !isMuted) playWarningSound();

      const feynmanText = lang === 'ko' ? replaceVars(current.desc) : replaceVars(current.descEn || current.desc);
      if (!isMuted && feynmanText && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(feynmanText);
        u.lang = lang === 'ko' ? 'ko-KR' : lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : lang === 'hi' ? 'hi-IN' : 'ja-JP';
        u.rate = lang === 'en' ? 0.95 : 1.05;
        u.onend = () => setTtsFinished(true);
        u.onerror = () => setTtsFinished(true);
        window.speechSynthesis.speak(u);
      } else { setTtsFinished(true); }
    }
    return () => window.speechSynthesis?.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isPlaying, isMuted, showConfig, lang]);

  // ── 로그 자동 스크롤 ──
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    defLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step, viewMode]);

  // ── 핸들러 ──
  const handlePlayPause = () => {
    initAudio();
    if (step >= totalSteps - 1 && !isPlaying) {
      // 마지막 스텝에서 재시작
      setStep(0); setTimeLeft(targetStepDuration); setTtsFinished(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false); setStep(0); setTimeLeft(targetStepDuration); setTtsFinished(false);
    window.speechSynthesis?.cancel(); setSelectedLogIndex(null); setHackerLogOpen(false);
  };

  const handleNext = () => {
    window.speechSynthesis?.cancel(); setIsPlaying(false);
    if (step >= totalSteps - 1) {
      // 마지막 스텝에서 next → 완료 페이지
      navigateToComplete();
    } else {
      setStep(s => Math.min(s + 1, totalSteps - 1));
    }
    setTimeLeft(targetStepDuration); setTtsFinished(false);
  };

  const handlePrev = () => {
    window.speechSynthesis?.cancel(); setIsPlaying(false);
    setStep(s => Math.max(s - 1, 0));
    setTimeLeft(targetStepDuration); setTtsFinished(false);
  };

  // ── 프로세스 트리 ──
  const getProcessTree = () => (scenario.processTree || []).filter(p => p.minStep <= safeStep);

  // ── 해커 로그 클릭 핸들러 ──
  const handleLogClick = (idx) => {
    setSelectedLogIndex(idx);
    // 해당 스텝에 hackerLog가 있으면 패널 오픈
    const stepData = scenario.steps[idx];
    if (stepData?.hackerLog) {
      setHackerLogOpen(true);
    } else {
      setHackerLogOpen(false);
    }
  };

  // ── 현재 선택된 로그의 hackerLog 데이터 ──
  const selectedHackerLog = selectedLogIndex !== null ? scenario.steps[selectedLogIndex]?.hackerLog : null;

  // =============================
  // RENDER
  // =============================

  const currentPhaseIdx = getCurrentPhaseIndex();

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: colors.bg, color: colors.textDark }}>

      {/* ── 회사 브랜드 배너 ── */}
      <div className="w-full px-4 py-2 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-[#bb3e03] font-mono tracking-widest">GOTROOT</span>
          <span className="text-[8px] text-slate-400 font-mono">|</span>
          <span className="text-[8px] text-slate-500 font-mono hidden sm:inline">(주)갓루트 · 사이버보안 교육 플랫폼</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] text-slate-400 font-mono hidden md:inline">글로벌 정보보안 선두기업</span>
          <a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer" className="text-[8px] font-mono text-[#bb3e03]/60 hover:text-[#bb3e03] transition-colors hidden sm:inline">gotroot.co.kr ↗</a>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="flex flex-col items-center justify-center flex-1 p-2 lg:p-4 relative">

        <button onClick={() => { window.speechSynthesis?.cancel(); navigate(`/edu/${techniqueId}`); }}
          className="absolute top-2 left-2 md:top-4 md:left-4 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-[11px] font-bold text-slate-600 hover:text-[#bb3e03] border border-transparent hover:border-[#bb3e03] transition-all cursor-pointer">
          ← 대시보드
        </button>

        <LangToggle lang={lang} theme="light" className="absolute top-2 right-2 md:top-4 md:right-8 z-50"
          onChange={(code) => { storeLang(code); setLang(code); window.speechSynthesis?.cancel(); }} />

        {/* ── 설정 모달 ── */}
        <AnimatePresence>
          {showConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <span className="text-2xl md:text-3xl">⚙️</span>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">{t.configTitle}</h2>
                    <p className="text-[10px] md:text-xs text-gray-500">{t.configSub}</p>
                  </div>
                </div>
                <div className="space-y-4 md:space-y-5 mb-6">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.userLabel}</label>
                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="훈련생 이름"
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9c6644] font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.corpLabel}</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9c6644] font-mono text-sm" />
                  </div>
                </div>
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] md:text-[13px] font-bold leading-relaxed shadow-inner">{t.warning}</div>
                <label className="flex items-center gap-2 mb-6 cursor-pointer group">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 text-[#9c6644] focus:ring-[#9c6644] border-gray-400 rounded cursor-pointer" />
                  <span className="text-xs md:text-sm text-gray-700 font-bold group-hover:text-black transition-colors">{t.agreeText}</span>
                </label>
                <button disabled={!agreed} onClick={() => setShowConfig(false)}
                  className={`w-full py-3 md:py-4 bg-[#9c6644] text-white font-bold rounded-xl shadow-lg transition-all text-base md:text-lg ${!agreed ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:bg-[#7f5337] active:scale-95 cursor-pointer'}`}>
                  {t.startBtn}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2패널 메인 ── */}
        <div className="relative z-10 w-[98vw] max-w-[1800px] h-auto lg:h-[92vh] lg:min-h-[750px] lg:max-h-[1200px] bg-white rounded-[24px] md:rounded-[36px] shadow-2xl flex flex-col lg:flex-row overflow-hidden border-2 md:border-4 border-white mt-8 md:mt-4">

          {/* 마지막 스텝 레드 플래시 */}
          <motion.div className="absolute inset-0 z-50 pointer-events-none" initial={{ opacity: 0 }}
            animate={safeStep === totalSteps - 1 && isPlaying && !isMuted
              ? { opacity: [0, 1, 0], boxShadow: ['inset 0 0 0 0 rgba(239,68,68,0)', 'inset 0 0 100px 20px rgba(239,68,68,0.4)', 'inset 0 0 0 0 rgba(239,68,68,0)'] }
              : { opacity: 0 }}
            transition={{ duration: 0.6 }} />

          {/* ===== 왼쪽 패널 (시뮬레이션) ===== */}
          <div ref={simZoom.containerRef} className="w-full h-[65vh] shrink-0 lg:h-auto lg:shrink lg:flex-[1.2] flex flex-col relative transition-colors duration-700 overflow-hidden bg-slate-900 border-b lg:border-b-0 lg:border-r border-gray-200">

            {/* 뷰 전환 토글 */}
            <div className="absolute top-4 right-4 z-40 bg-black/40 backdrop-blur-md rounded-full p-1 flex border border-white/10 shadow-lg">
              <button onClick={() => setViewMode('hacker')} className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all cursor-pointer ${viewMode === 'hacker' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'}`}>{t.hackerView}</button>
              <button onClick={() => setViewMode('defender')} className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all cursor-pointer ${viewMode === 'defender' ? 'bg-[#9c6644] text-white shadow' : 'text-white/60 hover:text-white'}`}>{t.defenderView}</button>
            </div>

            {/* 모바일 줌 컨트롤 */}
            {isMobile && (
              <div className="absolute bottom-14 left-3 z-40 flex items-center gap-2">
                {simZoom.zoom > 1 ? (
                  <>
                    <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-lg">🔍 {simZoom.zoom.toFixed(1)}x</span>
                    <button onClick={simZoom.resetZoom} className="bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"><Close size={12} /> 축소</button>
                  </>
                ) : (
                  <button onClick={simZoom.toggleZoom} className="bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-3 py-2 rounded-full shadow-lg border border-white/50 active:scale-95 transition-all animate-pulse cursor-pointer">🔍 탭하여 확대</button>
                )}
              </div>
            )}

            <div ref={simZoom.innerRef} style={simZoom.style} className="absolute inset-0">
              <AnimatePresence mode="wait">

                {/* ===== 해커 뷰 ===== */}
                {viewMode === 'hacker' && (
                  <motion.div key="hacker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, #005A9E, #001f3f)' }}>

                    {/* ── 데스크톱 아이콘 (optional) ── */}
                    {scenario.desktopIcons && scenario.desktopIcons.length > 0 && (
                      <div className="absolute top-16 left-3 md:left-4 z-20 flex flex-col gap-3 md:gap-4">
                        {scenario.desktopIcons.map((icon, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="flex flex-col items-center gap-1 group relative"
                          >
                            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-xl md:text-2xl transition-all group-hover:bg-white/20 group-hover:scale-105 ${icon.alert ? 'animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]' : ''}`}>
                              {icon.icon}
                            </div>
                            <span className="text-[8px] md:text-[9px] text-white/80 font-medium text-center max-w-[56px] leading-tight drop-shadow-md">
                              {replaceVars(icon.name)}
                            </span>
                            {icon.alert && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white/30 animate-ping" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* 터미널 창 */}
                    <div className={`absolute top-16 bottom-12 ${scenario.desktopIcons ? 'left-16 md:left-20' : 'left-2 md:left-6'} right-2 md:right-6 bg-[#0c0c0c]/95 backdrop-blur-xl rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-gray-700 flex flex-col overflow-hidden z-30`}>
                      <div className="h-8 md:h-10 bg-[#202020] flex items-center justify-between px-3 md:px-5 shrink-0 border-b border-gray-700">
                        <span className="text-gray-300 font-semibold text-[10px] md:text-xs flex items-center gap-2"><Icons.Terminal /> Windows PowerShell</span>
                        <div className="flex gap-3 md:gap-5 text-gray-400 text-sm md:text-base"><span>─</span><span>☐</span><span>✕</span></div>
                      </div>
                      <div className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-[11px] md:text-[14px] text-gray-200 leading-relaxed relative">
                        <div className="mb-4 md:mb-6 text-gray-500">Windows PowerShell<br/>Copyright (C) Microsoft.</div>
                        {scenario.steps.slice(0, safeStep + 1).map((s, i) => (
                          <div key={i} className="mb-4 relative group">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className={`relative ${i === totalSteps - 1 && current.alert ? 'text-red-400 font-bold' : ''}`}>
                              <span className="text-blue-400 font-bold mr-2">PS C:\Users\{uName}&gt;</span>
                              <span className={`relative z-10 break-all cursor-pointer transition-colors px-1 rounded ${selectedLogIndex === i ? 'text-[#cfd7c7] bg-[#70a9a1]/30 font-bold' : 'hover:text-blue-300 hover:underline decoration-dashed'}`}
                                onClick={() => handleLogClick(i)}
                                title="클릭하여 상세 로그 분석 보기">
                                {i === safeStep ? <span className="typing-effect inline-block">{replaceVars(s.cmd)}</span> : replaceVars(s.cmd)}
                              </span>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i === safeStep ? 1.5 : 0 }}
                              className={`mt-1 md:mt-2 pl-2 md:pl-4 border-l-2 ${i === totalSteps - 1 && current.alert ? 'border-red-500/50 text-red-300 font-bold' : 'border-gray-700 text-gray-400'} whitespace-pre-wrap break-all relative`}>
                              {replaceVars(s.out)}
                            </motion.div>
                          </div>
                        ))}
                        <div ref={logEndRef} className="h-4 md:h-6" />
                      </div>

                      {/* ── 해커 로그 뷰어 패널 (hackerLog overlay) ── */}
                      <AnimatePresence>
                        {hackerLogOpen && selectedHackerLog && (
                          <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className="absolute top-[5%] md:top-[8%] right-[3%] md:right-[4%] w-[88%] md:w-[450px] bg-[#cfd7c7] border-2 border-[#70a9a1] rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden"
                          >
                            {/* 헤더 바 */}
                            <div className="h-10 md:h-12 bg-[#70a9a1] flex items-center px-4 justify-between shrink-0 shadow-sm">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="w-3 h-3 rounded-full bg-[#40798c]/80 shadow-inner flex-shrink-0"></span>
                                <span className="w-3 h-3 rounded-full bg-[#40798c]/50 flex-shrink-0"></span>
                                <span className="text-[#40798c] font-black text-[11px] md:text-sm ml-2 tracking-widest uppercase truncate">
                                  {selectedHackerLog.title}
                                </span>
                              </div>
                              <button onClick={() => setHackerLogOpen(false)} className="text-[#40798c] hover:text-white font-bold text-lg px-2 transition-colors cursor-pointer"><Close size={16} /></button>
                            </div>
                            {/* 로그 내용 */}
                            <div className="p-5 md:p-6 overflow-y-auto font-mono text-[10px] md:text-[12px] text-[#40798c] flex flex-col gap-4 max-h-[300px] md:max-h-[350px]">
                              {selectedHackerLog.lines.map((item, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (idx * 0.4) }}>
                                  <p className="mb-2 font-bold opacity-80 whitespace-pre-wrap leading-relaxed">{replaceVars(item.log)}</p>
                                  <div className="bg-[#40798c]/10 border-l-4 border-[#40798c]/40 p-3 md:p-4 rounded-r-lg font-sans text-[11px] md:text-[13px] font-bold leading-relaxed shadow-sm">
                                    {replaceVars(item.desc)}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 하단 작업표시줄 */}
                    <div className="h-10 md:h-14 mt-auto bg-[#1a1a1a]/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
                      <div className="flex items-center gap-2 md:gap-4"><div className="p-1 md:p-2 text-[#00a4ef] md:scale-125"><Icons.Windows /></div><div className="w-32 md:w-64 h-7 md:h-10 bg-white/10 rounded-md md:rounded-lg border border-white/5 flex items-center px-3 md:px-4 text-[10px] md:text-sm text-white/50">Search</div></div>
                      <div className="text-[9px] md:text-xs text-white opacity-90 font-medium">14:30 PM</div>
                    </div>
                  </motion.div>
                )}

                {/* ===== 방어자 뷰 ===== */}
                {viewMode === 'defender' && (
                  <motion.div key="defender" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col bg-[#0f172a] text-slate-300 font-sans" style={{ backgroundImage: 'radial-gradient(circle at center, #334155, #0f172a)' }}>

                    {/* SOC 알림 툴팁 */}
                    <div className="absolute top-4 left-4 z-50">
                      <AnimatePresence mode="wait">
                        {tooltipExpanded && (
                          <motion.div key={`tooltip-${safeStep}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => setTooltipExpanded(false)}
                            className="bg-slate-900/95 backdrop-blur-2xl border border-red-500/40 shadow-xl border-l-4 border-l-red-500 text-white px-3 md:px-5 py-2 md:py-3 rounded-lg flex items-center gap-3 md:gap-4 max-w-[90vw] md:max-w-max cursor-pointer">
                            <div className="p-1.5 md:p-2 bg-red-500/20 rounded-full text-red-500 shadow-inner flex-shrink-0"><span className="text-sm md:text-lg">🚨</span></div>
                            <div className="pr-2 overflow-hidden flex flex-col justify-center">
                              <div className="text-[8px] md:text-[10px] font-black tracking-widest text-red-400 uppercase mb-0.5 flex items-center gap-1.5 md:gap-2">
                                <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span></span>
                                {t.socTitle}
                              </div>
                              <p className="text-[10px] md:text-[13px] font-bold leading-tight truncate md:whitespace-nowrap text-slate-100">
                                {replaceVars(current.defTooltip || current.def)}
                              </p>
                            </div>
                          </motion.div>
                        )}
                        {!tooltipExpanded && (
                          <motion.div key="minimized" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setTooltipExpanded(true)}
                            className="bg-slate-800/90 border border-slate-600 text-slate-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full cursor-pointer flex items-center gap-1.5 md:gap-2 hover:bg-slate-700 transition-colors shadow-lg backdrop-blur-md">
                            <span className="text-sm md:text-lg">🚨</span><span className="text-[10px] md:text-xs font-bold">Alert</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* EDR 대시보드 */}
                    <div className="absolute top-20 bottom-12 md:top-24 md:bottom-16 left-2 right-2 md:left-6 md:right-6 bg-[#0b1120] rounded-xl md:rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-slate-700 flex flex-col overflow-hidden">
                      <div className="h-10 md:h-12 bg-[#1e293b] flex items-center justify-between px-3 md:px-5 border-b border-slate-700 shrink-0">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="text-blue-400 scale-90 md:scale-100"><Icons.Shield /></div>
                          <span className="font-black tracking-widest text-slate-100 uppercase text-[10px] md:text-xs">GOTROOT EDR</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded bg-slate-900 border border-slate-700">
                          Status: <span className="text-green-500 animate-pulse">Monitoring</span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* 프로세스 트리 + 토폴로지 패널 */}
                        <div className="w-full h-1/2 md:h-auto md:w-[45%] border-b md:border-b-0 md:border-r border-slate-800 bg-[#0f172a] flex flex-col relative shrink-0 md:shrink">
                          <div className="p-2 md:p-3 bg-[#1e293b]/50 border-b border-slate-800 text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-2 shrink-0">
                            <Icons.Activity /> PROCESS TREE
                          </div>
                          <div className="flex-1 p-3 md:p-5 overflow-y-auto font-mono text-[10px] md:text-[12px]">

                            {/* ── 토폴로지 맵 SVG (optional) ── */}
                            {scenario.topoNodes && scenario.topoNodes.length > 0 && (
                              <div className="mb-4 pb-3 border-b border-slate-800">
                                <div className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                                  {'🌐'} {t.topoMap}
                                </div>
                                <svg viewBox="0 0 560 130" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <filter id="glow-red">
                                      <feGaussianBlur stdDeviation="3" result="blur" />
                                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                    <filter id="glow-gray">
                                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                  </defs>

                                  {/* Edges */}
                                  {(scenario.topoEdges || []).map((edge, idx) => {
                                    const fromNode = scenario.topoNodes.find(n => n.id === edge.from);
                                    const toNode = scenario.topoNodes.find(n => n.id === edge.to);
                                    if (!fromNode || !toNode) return null;
                                    const isActive = safeStep >= (edge.minStep || 0);
                                    return (
                                      <g key={`edge-${idx}`}>
                                        <line
                                          x1={fromNode.x} y1={fromNode.y}
                                          x2={toNode.x} y2={toNode.y}
                                          stroke={isActive ? '#ef4444' : '#475569'}
                                          strokeWidth={isActive ? 2.5 : 1.5}
                                          strokeDasharray={isActive ? 'none' : '6 4'}
                                          filter={isActive ? 'url(#glow-red)' : 'none'}
                                        >
                                          {isActive && (
                                            <animate attributeName="stroke-opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                                          )}
                                        </line>
                                        {isActive && (
                                          <circle r="3" fill="#ef4444">
                                            <animateMotion dur="2s" repeatCount="indefinite"
                                              path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`} />
                                          </circle>
                                        )}
                                      </g>
                                    );
                                  })}

                                  {/* Nodes */}
                                  {scenario.topoNodes.map((node, idx) => {
                                    const isActive = (scenario.topoEdges || []).some(
                                      e => (e.from === node.id || e.to === node.id) && safeStep >= (e.minStep || 0)
                                    );
                                    return (
                                      <g key={`node-${idx}`}>
                                        <circle
                                          cx={node.x} cy={node.y} r="18"
                                          fill={isActive ? '#1e1b4b' : '#1e293b'}
                                          stroke={isActive ? '#ef4444' : '#475569'}
                                          strokeWidth={isActive ? 2 : 1}
                                          filter={isActive ? 'url(#glow-red)' : 'url(#glow-gray)'}
                                        >
                                          {isActive && (
                                            <animate attributeName="stroke-width" values="2;3.5;2" dur="2s" repeatCount="indefinite" />
                                          )}
                                        </circle>
                                        <text
                                          x={node.x} y={node.y + 32}
                                          textAnchor="middle"
                                          fill={isActive ? '#f87171' : '#94a3b8'}
                                          fontSize="9"
                                          fontWeight="bold"
                                          fontFamily="monospace"
                                        >
                                          {replaceVars(node.label)}
                                        </text>
                                        {/* Node icon */}
                                        <text
                                          x={node.x} y={node.y + 4}
                                          textAnchor="middle"
                                          fill={isActive ? '#fca5a5' : '#64748b'}
                                          fontSize="12"
                                          fontFamily="monospace"
                                          fontWeight="bold"
                                        >
                                          {node.icon || '●'}
                                        </text>
                                      </g>
                                    );
                                  })}
                                </svg>
                              </div>
                            )}

                            <div className="mb-3 md:mb-4 pb-2 border-b border-slate-800">
                              <span className="text-slate-300 font-bold">Host:</span> PC-{uName}<br/>
                              <span className="text-slate-500">Target: {replaceVars('{companyName}')}</span>
                            </div>
                            <ul className="space-y-1 md:space-y-2">
                              {getProcessTree().map((proc, i) => (
                                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                  className={`py-1 flex items-center gap-1.5 md:gap-2 ${proc.depth > 0 ? 'border-l border-slate-700 ml-2 pl-2 md:ml-3 md:pl-3' : ''} ${proc.alert ? 'text-red-400 font-bold bg-red-900/10 rounded pr-1 md:pr-2' : 'text-slate-300'}`}
                                  style={{ marginLeft: proc.depth * 12 }}>
                                  <Icons.File /><span className="truncate">{replaceVars(proc.name)}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* SIEM Alerts 패널 */}
                        <div className="w-full h-1/2 md:h-auto md:flex-1 flex flex-col bg-[#020617] shrink-0 md:shrink">
                          <div className="p-2 md:p-3 border-b border-slate-800 text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-2 shrink-0">
                            <Icons.EventLog /> SIEM ALERTS
                          </div>
                          <div className="flex-1 p-3 md:p-6 overflow-y-auto flex flex-col gap-2 md:gap-3 font-mono text-[10px] md:text-[12px]">
                            {scenario.steps.slice(0, safeStep + 1).map((s, i) => (
                              <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                className={`p-2.5 md:p-4 rounded-lg border border-l-2 md:border-l-4 ${i === totalSteps - 1 ? 'bg-red-900/10 border-red-500/30 border-l-red-500 text-red-300' : 'bg-slate-800/30 border-slate-700 border-l-blue-500 text-slate-300'}`}>
                                <div className="flex justify-between mb-1.5 md:mb-2 pb-1.5 md:pb-2 border-b border-slate-800/50">
                                  <span className="font-bold text-white text-[11px] md:text-[13px]">{replaceVars(s.def)}</span>
                                  <span className="text-slate-500 text-[9px] md:text-[10px]">14:3{i}:12</span>
                                </div>
                                <div className="text-slate-400 whitespace-pre-wrap leading-relaxed break-words">{replaceVars(s.defAction)}</div>
                              </motion.div>
                            ))}
                            <div ref={defLogEndRef} className="h-2 md:h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 하단 바 */}
                    <div className="h-10 md:h-12 mt-auto bg-[#020617] border-t border-slate-800 flex items-center px-4 md:px-6 shrink-0 text-slate-400 text-xs md:text-sm shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
                      <span className="flex items-center gap-2 bg-slate-800 px-2 py-1 md:px-3 md:py-1.5 rounded text-white font-bold"><Icons.Windows /> Start</span>
                      <span className="ml-auto font-medium text-[9px] md:text-xs tracking-wide">SOC Analyst</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full h-px lg:w-px lg:h-full bg-gray-200 shrink-0 z-20" />

          {/* ===== 오른쪽 패널 (정보 + 컨트롤) ===== */}
          <div className="flex flex-col w-full lg:w-[450px] xl:w-[500px] h-auto lg:h-full min-h-[500px] bg-[#f8fafc] lg:rounded-r-[32px] overflow-hidden shrink-0 relative">

            {/* 헤더 */}
            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-gray-200 bg-white flex justify-between items-center shrink-0 shadow-sm">
              <div>
                <div className="text-[10px] md:text-xs font-black tracking-widest mb-1 text-[#9c6644]">ATT&CK {scenario.id}</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight">
                  {lang === 'ko' ? scenario.title : scenario.titleEn}
                </h1>
              </div>
              <button onClick={() => { setIsMuted(!isMuted); window.speechSynthesis?.cancel(); }}
                className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                {isMuted ? <Icons.VolumeOff /> : <Icons.VolumeOn />}
              </button>
            </div>

            {/* 정보 패널 */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col px-4 py-4 md:px-8 md:pb-8 md:pt-6 overflow-y-auto">

                {/* ── 4-Phase 진행 표시 ── */}
                <div className="mb-6 md:mb-8 px-2 md:px-4 mt-2">
                  {/* 프로그레스 바 */}
                  <div className="h-1 md:h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#9c6644] rounded-full" style={{ width: `${((safeStep + 1) / totalSteps) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[9px] md:text-[10px] font-bold text-slate-400">
                    <span>STEP {safeStep + 1} / {totalSteps}</span>
                    <span>{scenario.id}</span>
                  </div>

                  {/* 4-Phase 점 표시기 */}
                  <div className="flex items-center justify-between mt-3 md:mt-4 px-1">
                    {phases.map((phase, idx) => {
                      const isCompleted = idx < currentPhaseIdx;
                      const isActive = idx === currentPhaseIdx;
                      const isFuture = idx > currentPhaseIdx;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                          <motion.div
                            animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                            transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-black transition-all duration-300 ${
                              isCompleted
                                ? 'bg-[#9c6644] text-white shadow-md'
                                : isActive
                                  ? 'bg-[#9c6644] text-white shadow-lg shadow-[#9c6644]/40'
                                  : 'bg-transparent border-2 border-slate-300 text-slate-400'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </motion.div>
                          <span className={`text-[7px] md:text-[8px] font-bold text-center leading-tight whitespace-nowrap ${
                            isActive ? 'text-[#9c6644]' : isCompleted ? 'text-[#9c6644]/60' : 'text-slate-400'
                          }`}>
                            {lang === 'ko' ? phase.label : (phase.labelEn || phase.label)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={safeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4 md:gap-5">

                    {/* 제목 */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-[#ede0d4] flex items-center justify-center text-lg md:text-xl text-[#9c6644]">📍</div>
                      <h2 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">
                        {lang === 'ko'
                          ? (current.stepTitle || `단계 ${safeStep + 1}`)
                          : (current.stepTitleEn || `Step ${safeStep + 1}`)}
                      </h2>
                    </div>

                    {/* ════ 해커 뷰 교육 콘텐츠 ════ */}
                    {viewMode === 'hacker' && (
                      <>
                        {/* 파인만 설명 */}
                        <div className="bg-white rounded-[20px] md:rounded-[24px] p-5 md:p-6 border-2 border-gray-100 shadow-sm relative">
                          <div className="text-[9px] md:text-[10px] font-black text-[#9c6644] tracking-widest uppercase mb-2">{t.what}</div>
                          <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                            {lang === 'ko' ? replaceVars(current.feynman || current.desc) : replaceVars(current.feynmanEn || current.descEn || current.desc)}
                            {!isMuted && isPlaying && !ttsFinished && <span className="inline-block ml-2 w-2 h-2 rounded-full bg-[#9c6644] animate-pulse" />}
                          </p>
                        </div>

                        {/* 전문가 인사이트 (JSON에 있을 때만) */}
                        {(current.expert || current.expertEn) && (
                          <div className="bg-[#1e293b] rounded-[20px] md:rounded-[24px] p-5 md:p-6 text-white shadow-lg relative border-t-4 border-[#9c6644]">
                            <div className="absolute -top-[6px] md:-top-[8px] left-6 md:left-8 w-3 h-3 md:w-4 md:h-4 bg-[#1e293b] transform rotate-45 border-t-4 border-l-4 border-[#9c6644]" />
                            <div className="text-[9px] md:text-[10px] font-black tracking-widest text-[#ede0d4] uppercase mb-2">{t.why}</div>
                            <p className="text-[11px] md:text-[12px] leading-relaxed text-gray-300 font-mono">
                              {lang === 'ko' ? replaceVars(current.expert) : replaceVars(current.expertEn || current.expert)}
                            </p>
                          </div>
                        )}

                        {/* 핵심 용어 (JSON에 있을 때만) */}
                        {current.terms && current.terms.length > 0 && (
                          <div className="bg-[#f8fafc] rounded-[20px] md:rounded-[24px] p-5 md:p-6 border-2 border-slate-100 shadow-inner relative mt-1 md:mt-2">
                            <div className="text-[10px] font-black tracking-widest text-[#9c6644] uppercase mb-3 md:mb-4 flex items-center gap-2">
                              <Icons.EventLog /> {t.termsLabel}
                            </div>
                            <div className="flex flex-col gap-3 md:gap-4">
                              {current.terms.map((term, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="font-bold text-slate-800 text-[12px] md:text-[13px] mb-1">
                                    <span className="text-[#9c6644] mr-1.5">◆</span>{term.name}
                                  </span>
                                  <span className="text-slate-600 text-[11px] md:text-[12px] leading-relaxed ml-4">{term.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ════ 방어자 뷰 교육 콘텐츠 ════ */}
                    {viewMode === 'defender' && (
                      <>
                        {/* 🔍 탐지 분석 — 무슨 일이 일어났나? */}
                        <div className="bg-white rounded-[20px] md:rounded-[24px] p-5 md:p-6 border-2 border-red-100 shadow-sm relative">
                          <div className="text-[9px] md:text-[10px] font-black text-red-600 tracking-widest uppercase mb-1">{t.defAnalysis}</div>
                          <div className="text-[8px] md:text-[9px] font-bold text-red-400 mb-2">{t.defWhatHappened}</div>
                          <div className="bg-red-50 rounded-xl p-3 md:p-4 mb-3 border border-red-200">
                            <p className="text-[11px] md:text-[12px] font-bold text-red-800 leading-relaxed">
                              {replaceVars(current.def)}
                            </p>
                          </div>
                          <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                            {lang === 'ko'
                              ? replaceVars(current.defTooltip || current.desc)
                              : replaceVars(current.defTooltipEn || current.descEn || current.desc)}
                          </p>
                        </div>

                        {/* 🛡️ 대응 전략 — 어떻게 대응해야 하는가? */}
                        <div className="bg-[#0f172a] rounded-[20px] md:rounded-[24px] p-5 md:p-6 text-white shadow-lg relative border-t-4 border-blue-500">
                          <div className="absolute -top-[6px] md:-top-[8px] left-6 md:left-8 w-3 h-3 md:w-4 md:h-4 bg-[#0f172a] transform rotate-45 border-t-4 border-l-4 border-blue-500" />
                          <div className="text-[9px] md:text-[10px] font-black tracking-widest text-blue-400 uppercase mb-1">{t.defResponse}</div>
                          <div className="text-[8px] md:text-[9px] font-bold text-blue-300 mb-2">{t.defWhatToDo}</div>
                          <div className="font-mono text-[10px] md:text-[12px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                            {replaceVars(current.defAction)}
                          </div>
                        </div>

                        {/* 📋 SOC 확인 포인트 — 전문가 관점 */}
                        {(current.expert || current.expertEn) && (
                          <div className="bg-[#f0fdf4] rounded-[20px] md:rounded-[24px] p-5 md:p-6 border-2 border-emerald-200 shadow-inner relative mt-1 md:mt-2">
                            <div className="text-[10px] font-black tracking-widest text-emerald-700 uppercase mb-3 md:mb-4 flex items-center gap-2">
                              <Icons.Shield /> {t.defCheckpoint}
                            </div>
                            <p className="text-[11px] md:text-[12px] leading-relaxed text-emerald-800 font-medium">
                              {lang === 'ko' ? replaceVars(current.expert) : replaceVars(current.expertEn || current.expert)}
                            </p>
                            {/* 용어도 방어자 뷰에서 표시 */}
                            {current.terms && current.terms.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-emerald-200">
                                <div className="text-[9px] font-black tracking-widest text-emerald-600 uppercase mb-2">{t.termsLabel}</div>
                                <div className="flex flex-col gap-2">
                                  {current.terms.map((term, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5">
                                      <span className="text-emerald-500 text-[10px] mt-0.5">◆</span>
                                      <div>
                                        <span className="font-bold text-emerald-900 text-[11px]">{term.name}</span>
                                        <span className="text-emerald-700 text-[10px] ml-1.5">{term.desc}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 하단 컨트롤러 */}
            <div className="px-6 pb-6 pt-3 md:px-8 md:pb-8 md:pt-4 shrink-0 bg-[#f8fafc]">
              <div className="text-center mb-2 md:mb-4 h-4 text-[9px] md:text-[11px] font-black tracking-widest text-slate-400 uppercase">
                {isPlaying && timeLeft === 0 && !ttsFinished ? <span className="text-[#9c6644] animate-pulse">{t.stateWaitTTS}</span>
                  : isPlaying && timeLeft > 0 ? <span className="text-[#9c6644]">{t.statePlay(timeLeft)}</span>
                  : !isPlaying ? t.statePause : ''}
              </div>
              <div className="bg-white rounded-full p-1.5 md:p-2.5 flex items-center justify-between border border-gray-200 shadow-sm">
                <button onClick={handleReset} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"><Icons.Reset /></button>
                <div className="flex items-center gap-1.5 md:gap-3">
                  <button onClick={handlePrev} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"><Icons.Prev /></button>
                  <button onClick={handlePlayPause} className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full text-white shadow-lg md:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer" style={{ backgroundColor: colors.primary }}>
                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                  </button>
                  <button onClick={handleNext} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"><Icons.Next /></button>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xs md:text-sm font-black text-gray-300 bg-gray-50 rounded-full border border-gray-100">
                  {safeStep + 1}/{totalSteps}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 회사 footer ── */}
      <div className="w-full mt-4 px-4 py-3 border-t border-slate-200 bg-white/80">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 max-w-full mx-auto px-4 lg:px-6 2xl:px-8">
          <div className="text-center sm:text-left">
            <p className="text-[9px] font-black text-[#bb3e03] font-mono tracking-[0.25em]">GOTROOT</p>
            <p className="text-[8px] text-slate-400 font-mono">(주)갓루트 · 사이버보안 · 모의해킹 · 교육</p>
          </div>
          <div className="text-center text-[8px] font-mono text-slate-400 leading-relaxed">
            <p>© 2026 (주)갓루트(GOTROOT) — ALL RIGHTS RESERVED</p>
            <p>사업자등록번호 391-69-00617 | 대표 윤웅</p>
          </div>
          <div className="text-center sm:text-right text-[8px] font-mono text-slate-400">
            <a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer" className="text-[#bb3e03]/60 hover:text-[#bb3e03] transition-colors">gotroot.co.kr ↗</a>
            <p>ericyoon@gotroot.co.kr</p>
          </div>
        </div>
      </div>
    </div>
  );
}

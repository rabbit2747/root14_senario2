import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// html2canvas, jspdf → dynamic import (인증서 다운로드 시에만 로드)
import { supabase } from '../../lib/supabase';
import { Icons, i18n } from './labT1078Data';
import LangToggle, { getStoredLang, storeLang } from '../../components/LangToggle';
import useSimulationZoom from '../../hooks/useSimulationZoom';
import { Close } from '@carbon/icons-react';

export default function LabT1078() {
  const totalSteps = 10;
  const targetStepDuration = 8;

  // ★ Rules of Hooks: 모든 hook은 조건부 return 이전에 선언해야 합니다

  // Auth Gate 상태
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  // 시뮬레이션 상태 (전부 Auth 체크 이전에 선언)
  const [lang, setLang] = useState(() => getStoredLang());
  const [showConfig, setShowConfig] = useState(true);
  const [userName, setUserName] = useState('');       // Supabase에서 자동 채워짐
  const [companyName, setCompanyName] = useState('Corp');
  const [agreed, setAgreed] = useState(false);

  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(targetStepDuration);
  const [ttsFinished, setTtsFinished] = useState(false);
  const [tooltipExpanded, setTooltipExpanded] = useState(true);
  const [selectedLogIndex, setSelectedLogIndex] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState('hacker');
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const logEndRef = useRef(null);
  const defLogEndRef = useRef(null);
  const audioCtxRef = useRef(null);
  const certificateRef = useRef(null);

  // ── 모바일 핀치 줌 ──
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const simZoom = useSimulationZoom({ enabled: isMobile });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── 뷰 전환 시 줌 리셋 ──
  useEffect(() => {
    if (isMobile && simZoom.zoom > 1) simZoom.resetZoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // ★ Auth Gate + Supabase 실명 자동 주입
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/login?redirect=${encodeURIComponent('/lab/t1078')}`);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('approved, name')
        .eq('id', session.user.id)
        .single();
      if (!profile?.approved) {
        navigate('/login');
        return;
      }
      // Supabase profiles.name으로 수료증 이름 자동 채우기
      if (profile?.name) setUserName(profile.name);
      setAuthChecked(true);
    }
    checkAuth();
  }, [navigate]);

  // Supabase에서 이름을 못 가져온 경우 최후 fallback
  const uName = userName || "훈련생";
  const cName = companyName || "Corp";
  const t = i18n[lang]?.ui || i18n['ko'].ui;

  // ★ 수료증 발급 날짜 — 언어별 포맷 자동 적용
  const certIssueDate = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    if (lang === 'ko') return `${y}년 ${m}월 ${d}일`;
    if (lang === 'zh') return `${y}年${m}月${d}日`;
    if (lang === 'hi') return `${d}/${m}/${y}`;
    // en: "February 26, 2026"
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  })();

  // ★ GOTROOT 공식 인장 SVG (수료증 중앙 도장)
  const GotrootSeal = () => (
    <svg viewBox="0 0 220 220" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      {/* 바깥 이중 원 */}
      <circle cx="110" cy="110" r="106" fill="none" stroke="#9c6644" strokeWidth="4"/>
      <circle cx="110" cy="110" r="94"  fill="none" stroke="#9c6644" strokeWidth="1.2" strokeDasharray="4 3"/>
      {/* 원형 텍스트 경로 */}
      <defs>
        <path id="seal-top-arc" d="M 110,110 m -82,0 a 82,82 0 1,1 164,0"/>
        <path id="seal-bot-arc" d="M 110,110 m -82,0 a 82,82 0 0,0 164,0"/>
      </defs>
      {/* 상단 텍스트: (주)갓루트 · GOTROOT */}
      <text fontSize="12" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">
        <textPath href="#seal-top-arc" startOffset="4%">(주)갓루트 · GOTROOT</textPath>
      </text>
      {/* 하단 텍스트: CYBERSECURITY EDU */}
      <text fontSize="11" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">
        <textPath href="#seal-bot-arc" startOffset="12%">CYBERSECURITY EDU</textPath>
      </text>
      {/* 중앙 방패 아이콘 (SVG path 직접 사용) */}
      <g transform="translate(73, 65) scale(3.1)" fill="none" stroke="#9c6644" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </g>
      {/* 중앙 별 장식 (좌/우) */}
      <text x="34"  y="116" textAnchor="middle" fontSize="11" fill="#9c6644" fontFamily="serif">★</text>
      <text x="186" y="116" textAnchor="middle" fontSize="11" fill="#9c6644" fontFamily="serif">★</text>
      {/* 가운데 하단 OFFICIAL */}
      <text x="110" y="160" textAnchor="middle" fontSize="11" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">OFFICIAL</text>
    </svg>
  );

  const getScenarios = () => {
    const texts = i18n[lang]?.texts || i18n['ko'].texts;
    return [
      { s: 0, cmd: null, out: null, defLog: `[EDR] Suspicious child process spawned.`, defCmd: `Target: PC-${uName}\nAction: Monitoring`, ...texts[0] },
      { s: 1, cmd: "whoami /all", out: `User: ${cName.toUpperCase()}\\${uName}\nPrivilege: Low`, defLog: `[EDR] Enumeration command detected.`, defCmd: `Process: cmd.exe -> whoami.exe\nRisk: Medium`, ...texts[1] },
      { s: 2, cmd: "ipconfig /all", out: `IPv4: 192.168.10.45\nDNS: DC01.${cName.toLowerCase()}.local`, defLog: `[EDR] Network discovery initiated.`, defCmd: `Process: ipconfig.exe\nAction: Logged`, ...texts[2] },
      { s: 3, cmd: "SharpHound.exe -c All", out: "[+] AD Graph Saved to BloodHound.zip", defLog: `[EDR] Massive LDAP queries. SharpHound signature matched.`, defCmd: `Process: SharpHound.exe\nRisk: High!`, ...texts[3] },
      { s: 4, cmd: "cat path.txt", out: `${uName} -> IT_Support -> SVC_SQL`, defLog: `[EDR] Unusual file access pattern.`, defCmd: `File: path.txt\nStatus: Active`, ...texts[4] },
      { s: 5, cmd: "Rubeus.exe kerberoast", out: "[*] Requesting TGS ticket...", defLog: `[SIEM] Event ID 4769: Abnormal TGS Ticket requested.`, defCmd: `Rule: Potential Kerberoasting\nAction: Alert triggered`, ...texts[5] },
      { s: 6, cmd: "(Output Continued)", out: "[+] Got Hash: $krb5tgs$23$*SVC_SQL$...", defLog: `[SIEM] TGS Ticket granted to ${uName}.`, defCmd: `Status: Ticket issued by DC01`, ...texts[6] },
      { s: 7, cmd: "hashcat -m 13100 ...", out: "Cracking... 14%", defLog: `[SIEM] Waiting for subsequent activity...`, defCmd: `Status: No internal anomalies detected.`, ...texts[7] },
      { s: 8, cmd: "(Output Continued)", out: "[CRACKED] : P@ssword123!", defLog: `[SIEM] Standby mode.`, defCmd: `Status: Monitoring Active`, ...texts[8] },
      { s: 9, cmd: "evil-winrm -i DC01", out: "PS C:\\Windows\\System32> ", defLog: `[SIEM] Unauthorized WinRM logon to DC01.`, defCmd: `Account: SVC_SQL\nSource: 192.168.10.45\nRisk: CRITICAL`, ...texts[9] },
      { s: 10, cmd: "🚨 [SYSTEM ALERT]", alert: true, out: `Session terminated by IPS.\nIP (User: ${uName}) Blocked.`, defLog: `[IPS] Threat neutralized.`, defCmd: `Action 1: Firewall Block IP\nAction 2: Isolate Host PC-${uName}\nStatus: SUCCESS`, ...texts[10] }
    ];
  };

  const scenarios = getScenarios();
  const current = scenarios.find(d => d.s === step) || scenarios[0];
  const colors = { bg: '#e2e8f0', surface: '#ffffff', primary: '#9c6644', primaryLight: '#ede0d4', textDark: '#1e293b', border: '#cbd5e1' };

  const getProcessTree = () => {
      const tree = [];
      if(step >= 0) tree.push({ id: 1, name: "explorer.exe", depth: 0, alert: false });
      if(step >= 0) tree.push({ id: 2, name: "invoice.pdf.exe (PID: 4120)", depth: 1, alert: true });
      if(step >= 1) tree.push({ id: 3, name: "powershell.exe (PID: 5882)", depth: 2, alert: false });
      if(step >= 1 && step < 3) tree.push({ id: 4, name: "whoami.exe", depth: 3, alert: false });
      if(step >= 2 && step < 3) tree.push({ id: 5, name: "ipconfig.exe", depth: 3, alert: false });
      if(step >= 3 && step < 5) tree.push({ id: 6, name: "SharpHound.exe", depth: 3, alert: true });
      if(step >= 5 && step < 9) tree.push({ id: 7, name: "Rubeus.exe", depth: 3, alert: true });
      if(step >= 9) tree.push({ id: 8, name: "Monitoring DC01 connection...", depth: 1, alert: true });
      return tree;
  };

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
    } catch (e) {}
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, (pdf.internal.pageSize.getHeight() - pdfHeight) / 2, pdfWidth, pdfHeight);
      pdf.save(`GOTROOT_CERT_${uName}.pdf`);
      // 수료 완료 추적 (매트릭스 완료 뱃지용)
      try {
        const labs = JSON.parse(localStorage.getItem('gotroot_completed_labs') || '[]');
        const entry = { name: 'T1078 - Valid Accounts (Kerberoasting)', technique: 'Valid Accounts', completedAt: new Date().toISOString() };
        if (!labs.some(l => l.technique === entry.technique)) {
          labs.push(entry);
          localStorage.setItem('gotroot_completed_labs', JSON.stringify(labs));
        }
      } catch { /* ignore */ }
    } catch (error) {
      alert("수료증 생성 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    setTooltipExpanded(true);
    let hideTimer;
    if (isPlaying && !showConfig) {
       hideTimer = setTimeout(() => setTooltipExpanded(false), 5000); 
    }
    return () => clearTimeout(hideTimer);
  }, [step, isPlaying, showConfig]);

  // 🔥 일시정지 유무에 상관없이 스텝 변경 시 로그 뷰어 오픈 🔥
  useEffect(() => {
    if (step > 0) {
      setSelectedLogIndex(step);
    } else {
      setSelectedLogIndex(null);
    }
  }, [step]);

  useEffect(() => {
    let timer;
    if (isPlaying && !showConfig) {
      timer = setInterval(() => { setTimeLeft(prev => Math.max(prev - 1, 0)); }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, showConfig, step]);

  useEffect(() => {
    if (isPlaying && !showConfig) {
        const isReadyToAdvance = timeLeft === 0 && (isMuted || ttsFinished);
        if (isReadyToAdvance) {
            if (step < totalSteps) {
                setStep(s => s + 1);
                setTimeLeft(targetStepDuration);
                setTtsFinished(false);
            } else {
                setIsPlaying(false);
                setTimeout(() => setIsFlipped(true), 1500);
            }
        }
    }
  }, [timeLeft, ttsFinished, isPlaying, isMuted, showConfig, step]);

  useEffect(() => {
    if (isPlaying && !showConfig) {
      window.speechSynthesis?.cancel();
      if (step === 10 && !isMuted) playWarningSound();

      if (!isMuted && current && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(current.feynman);
        utterance.lang = i18n[lang]?.langCode || 'ko-KR';
        utterance.rate = lang === 'en' ? 0.95 : 1.05;
        utterance.onend = () => setTtsFinished(true); 
        utterance.onerror = () => setTtsFinished(true); 
        window.speechSynthesis.speak(utterance);
      } else {
        setTtsFinished(true); 
      }
    }
    return () => window.speechSynthesis?.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isPlaying, isMuted, showConfig, lang]); 

  useEffect(() => { 
      logEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
      defLogEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [step, viewMode]);

  const handlePlayPause = () => { initAudio(); if (step >= totalSteps) { setStep(0); setIsFlipped(false); setTimeLeft(targetStepDuration); setTtsFinished(false); } setIsPlaying(!isPlaying); };
  const handleReset = () => { setIsPlaying(false); setStep(0); setIsFlipped(false); setTimeLeft(targetStepDuration); setTtsFinished(false); window.speechSynthesis?.cancel(); setSelectedLogIndex(null); };
  const handleNext = () => { window.speechSynthesis?.cancel(); setIsPlaying(false); if (step === 10 && !isFlipped) { setIsFlipped(true); } else { setStep(Math.min(step + 1, totalSteps)); } setTimeLeft(targetStepDuration); setTtsFinished(false); };
  const handlePrev = () => { window.speechSynthesis?.cancel(); setIsPlaying(false); if (isFlipped) { setIsFlipped(false); } else { setStep(Math.max(step - 1, 0)); } setTimeLeft(targetStepDuration); setTtsFinished(false); };

  const TopologyMap = () => (
    <div className="w-full h-32 md:h-40 bg-[#0f172a] border-t border-slate-800 p-2 md:p-4 flex flex-col shrink-0 relative overflow-hidden z-10">
      <div className="text-[10px] md:text-xs font-bold text-slate-400 mb-1 flex items-center gap-2">
        <Icons.Activity /> {t.topoMap}
      </div>
      <div className="flex-1 w-full h-full relative">
        <svg viewBox="0 0 200 80" className="w-full h-full absolute inset-0">
            <line x1="30" y1="40" x2="90" y2="40" stroke={step >= 0 ? "#ef4444" : "#334155"} strokeWidth="1.5" strokeDasharray={step < 10 ? "4 2" : "0"} />
            <line x1="90" y1="40" x2="160" y2="20" stroke={step >= 5 ? "#ef4444" : "#334155"} strokeWidth="1.5" strokeDasharray={step >= 5 && step < 10 ? "4 2" : "0"} />
            <line x1="90" y1="40" x2="160" y2="60" stroke={step >= 9 ? "#ef4444" : "#334155"} strokeWidth="1.5" strokeDasharray={step >= 9 && step < 10 ? "4 2" : "0"} />

            <circle cx="30" cy="40" r="4" fill="#64748b" />
            <text x="30" y="55" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="bold">EXT</text>

            {step < 5 && isPlaying && <motion.circle cx="90" cy="40" r="6" fill="#ef4444" animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />}
            <circle cx="90" cy="40" r="5" fill={step >= 0 ? "#ef4444" : "#1e293b"} />
            <text x="90" y="55" textAnchor="middle" fontSize="6" fill="#cbd5e1" fontWeight="bold">PC-{uName}</text>

            {step >= 5 && step < 9 && isPlaying && <motion.circle cx="160" cy="20" r="6" fill="#ef4444" animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />}
            <circle cx="160" cy="20" r="5" fill={step >= 5 ? "#ef4444" : "#1e293b"} />
            <text x="160" y="10" textAnchor="middle" fontSize="6" fill="#cbd5e1" fontWeight="bold">SRV-SQL</text>

            {step >= 9 && isPlaying && step < 10 && <motion.circle cx="160" cy="60" r="6" fill="#ef4444" animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />}
            <circle cx="160" cy="60" r="5" fill={step >= 9 ? "#ef4444" : "#1e293b"} />
            <text x="160" y="75" textAnchor="middle" fontSize="6" fill="#cbd5e1" fontWeight="bold">DC01</text>
        </svg>
      </div>
    </div>
  );

  // ★ 모든 Hook 선언 이후 조건부 return (Rules of Hooks 준수)
  if (!authChecked) return null;

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
          <a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer"
            className="text-[8px] font-mono text-[#bb3e03]/60 hover:text-[#bb3e03] transition-colors hidden sm:inline">
            gotroot.co.kr ↗
          </a>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="flex flex-col items-center justify-center flex-1 p-2 lg:p-4 relative">

      {/* ← 대시보드 뒤로가기 버튼 */}
      <button
        onClick={() => { window.speechSynthesis?.cancel(); navigate('/'); }}
        className="absolute top-2 left-2 md:top-4 md:left-4 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-[11px] font-bold text-slate-600 hover:text-[#bb3e03] hover:border-[#bb3e03] border border-transparent transition-all"
      >
        ← 대시보드
      </button>

      {/* 언어 선택 (공통 LangToggle 컴포넌트) */}
      <LangToggle
        lang={lang}
        theme="light"
        className="absolute top-2 right-2 md:top-4 md:right-8 z-50"
        onChange={(code) => { storeLang(code); setLang(code); window.speechSynthesis?.cancel(); }}
      />

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
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="훈련생 이름" className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9c6644] font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.corpLabel}</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9c6644] font-mono text-sm" />
                </div>
              </div>
              
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] md:text-[13px] font-bold leading-relaxed shadow-inner">
                  {t.warning}
              </div>
              <label className="flex items-center gap-2 mb-6 cursor-pointer group">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 text-[#9c6644] focus:ring-[#9c6644] border-gray-400 rounded cursor-pointer" />
                  <span className="text-xs md:text-sm text-gray-700 font-bold group-hover:text-black transition-colors">{t.agreeText}</span>
              </label>

              <button disabled={!agreed} onClick={() => setShowConfig(false)} className={`w-full py-3 md:py-4 bg-[#9c6644] text-white font-bold rounded-xl shadow-lg transition-all text-base md:text-lg ${!agreed ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:bg-[#7f5337] active:scale-95'}`}>
                {t.startBtn}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-[98vw] max-w-[1800px] h-auto lg:h-[92vh] lg:min-h-[750px] lg:max-h-[1200px] bg-white rounded-[24px] md:rounded-[36px] shadow-2xl flex flex-col lg:flex-row overflow-hidden border-2 md:border-4 border-white mt-8 md:mt-4">
        
        <motion.div className="absolute inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={ step === 10 && !isMuted ? { opacity: [0, 1, 0], boxShadow: ["inset 0 0 0 0 rgba(239,68,68,0)", "inset 0 0 100px 20px rgba(239,68,68,0.4)", "inset 0 0 0 0 rgba(239,68,68,0)"] } : { opacity: 0 } }
            transition={{ duration: 0.6 }} />

        {/* ========================================================= */}
        {/* 왼쪽 패널 */}
        {/* ========================================================= */}
        <div ref={simZoom.containerRef} className="w-full h-[65vh] shrink-0 lg:h-auto lg:shrink lg:flex-[1.2] flex flex-col relative transition-colors duration-700 overflow-hidden bg-slate-900 border-b lg:border-b-0 lg:border-r border-gray-200">

            <div className="absolute top-4 right-4 z-40 bg-black/40 backdrop-blur-md rounded-full p-1 flex border border-white/10 shadow-lg">
                <button onClick={() => setViewMode('hacker')} className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${viewMode === 'hacker' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'}`}>{t.hackerView}</button>
                <button onClick={() => setViewMode('defender')} className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${viewMode === 'defender' ? 'bg-[#9c6644] text-white shadow' : 'text-white/60 hover:text-white'}`}>{t.defenderView}</button>
            </div>

            {/* 줌 컨트롤 (모바일 전용) */}
            {isMobile && (
              <div className="absolute bottom-14 left-3 z-40 flex items-center gap-2">
                {simZoom.zoom > 1 ? (
                  <>
                    <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                      🔍 {simZoom.zoom.toFixed(1)}x
                    </span>
                    <button
                      onClick={simZoom.resetZoom}
                      className="bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-lg active:scale-95 transition-all"
                    >
                      <Close size={12} /> 축소
                    </button>
                  </>
                ) : (
                  <button
                    onClick={simZoom.toggleZoom}
                    className="bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-3 py-2 rounded-full shadow-lg border border-white/50 active:scale-95 transition-all animate-pulse"
                  >
                    🔍 탭하여 확대
                  </button>
                )}
              </div>
            )}

            <div ref={simZoom.innerRef} style={simZoom.style} className="absolute inset-0">
            <AnimatePresence mode="wait">
                
                {/* 💻 HACKER VIEW */}
                {viewMode === 'hacker' && (
                    <motion.div key="hacker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, #005A9E, #001f3f)' }}>
                        
                        <div className="absolute top-[80px] left-[30px] flex flex-col items-center gap-1 md:gap-2 p-1 md:p-2 z-10">
                            <span className="text-3xl md:text-4xl">🗑️</span><span className="text-[10px] md:text-sm text-white drop-shadow-md text-center leading-tight">Recycle<br className="md:hidden"/> Bin</span>
                        </div>
                        <div className="absolute top-[180px] left-[30px] flex flex-col items-center gap-1 md:gap-2 p-1 md:p-2 z-10">
                            <span className="text-3xl md:text-4xl">📁</span><span className="text-[10px] md:text-sm text-white drop-shadow-md text-center leading-tight">Company<br className="md:hidden"/> Data</span>
                        </div>
                        <motion.div className="absolute top-[280px] left-[30px] flex flex-col items-center gap-1 md:gap-2 p-1 md:p-2 cursor-pointer z-10"
                            animate={ step === 0 && isPlaying ? { backgroundColor: ["transparent", "rgba(255,255,255,0.2)", "transparent"] } : { backgroundColor: "transparent" } }
                            transition={{ duration: 0.2, delay: 0.6 }}>
                            <span className="text-4xl md:text-5xl">📩</span><span className="text-[9px] md:text-xs text-white drop-shadow-md font-bold text-center leading-tight">Urgent_<br/>Invoice</span>
                        </motion.div>

                        <AnimatePresence>
                            {step === 0 && isPlaying && (
                                <motion.div className="absolute z-50 pointer-events-none" 
                                    initial={{ left: "100%", top: "100%", opacity: 0 }} 
                                    animate={{ 
                                        left: ["100%", "50px", "50px", "50px", "50px", "50%", "50%", "50%", "50%", "50%"], 
                                        top: ["100%", "310px", "310px", "310px", "310px", "65%", "65%", "65%", "65%", "65%"], 
                                        opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0], 
                                        scale: [1, 1, 0.7, 1, 0.7, 1, 0.7, 1, 0.7, 1] 
                                    }} 
                                    transition={{ duration: 3.5, times: [0, 0.15, 0.18, 0.21, 0.24, 0.45, 0.48, 0.51, 0.54, 1], ease: "easeInOut" }}>
                                    <Icons.Cursor />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {step === 0 && isPlaying && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                                    animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 0.9, duration: 0.2 }}
                                    className="absolute top-1/2 left-1/2 w-[90%] max-w-[700px] h-[75%] max-h-[500px] bg-white rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden z-20 flex flex-col"
                                >
                                    <div className="h-10 md:h-12 border-b bg-white flex items-center px-3 md:px-6 gap-2 md:gap-4">
                                        <div className="text-red-500 text-sm md:text-lg font-black tracking-tighter flex items-center gap-1 md:gap-2"><span className="bg-red-500 text-white rounded px-1 md:px-1.5 py-0.5 text-[10px] md:text-sm">M</span> Gmail</div>
                                        <div className="flex-1 max-w-sm bg-gray-100 rounded-full h-6 md:h-8 px-3 md:px-4 flex items-center text-gray-500 text-[10px] md:text-xs font-medium">🔍 Search</div>
                                    </div>
                                    <div className="p-4 md:p-8 flex-1 overflow-y-auto bg-white relative">
                                        <h2 className="text-lg md:text-2xl font-normal text-gray-800 mb-4 md:mb-6">[URGENT] Invoice Payment Required</h2>
                                        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 border-b pb-3 md:pb-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm md:text-xl">🏢</div>
                                            <div>
                                                <div className="font-bold text-xs md:text-sm text-gray-800">HR Dept <span className="hidden md:inline text-xs text-gray-500 font-normal">&lt;billing@gotroot.com&gt;</span></div>
                                                <div className="text-[9px] md:text-xs text-gray-500 mt-0.5">to me ▼</div>
                                            </div>
                                            <div className="ml-auto text-[9px] md:text-xs text-gray-500">10:30 AM</div>
                                        </div>
                                        <div className="text-gray-700 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
                                            Dear Employee,<br/><br/>
                                            Please find the attached invoice for the overdue payment.<br/>
                                            Kindly review the document immediately.<br/><br/>
                                            Finance Team
                                        </div>
                                        <motion.div 
                                            className="w-[90%] md:w-64 border border-gray-200 rounded-xl p-2 md:p-3 flex gap-2 md:gap-3 items-center cursor-pointer relative overflow-hidden mx-auto md:mx-0"
                                            animate={{ backgroundColor: ["#ffffff", "#ffffff", "#f3f4f6", "#f3f4f6"] }}
                                            transition={{ duration: 3.5, times: [0, 0.5, 0.55, 1] }}
                                        >
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 text-red-500 rounded flex items-center justify-center text-[10px] md:text-sm font-black">PDF</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] md:text-xs font-bold text-gray-800 truncate">Invoice_2026.pdf<span className="text-red-500 font-black">.exe</span></div>
                                            </div>
                                            <motion.div className="absolute inset-0 bg-blue-500/10 origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: [0, 0, 1] }} transition={{ duration: 3.5, times: [0, 0.55, 0.8] }} />
                                        </motion.div>
                                    </div>
                                    <motion.div className="absolute inset-0 bg-red-600 z-50 mix-blend-multiply pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 3.5, times: [0, 0.9, 0.95, 1] }} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 플로팅 터미널 */}
                        <AnimatePresence>
                            {(step > 0 || (step === 0 && isPlaying)) && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }} 
                                    animate={{ opacity: step === 0 ? 0 : 1, scale: step === 0 ? 0.8 : 1, y: step === 0 ? 20 : "-50%", x: "-50%" }} 
                                    style={{ display: (step === 0 && !isPlaying) ? 'none' : 'flex', opacity: (step === 0 && isPlaying) ? 1 : (step > 0 ? 1 : 0) }}
                                    transition={{ delay: step === 0 ? 3.4 : 0, duration: 0.4 }}
                                    className="absolute top-1/2 left-1/2 w-[90%] max-w-[850px] h-[75%] max-h-[500px] bg-[#0c0c0c]/95 backdrop-blur-xl rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-gray-700 flex-col overflow-hidden z-30"
                                >
                                    <div className="h-8 md:h-10 bg-[#202020] flex items-center justify-between px-3 md:px-5 shrink-0 border-b border-gray-700">
                                        <span className="text-gray-300 font-semibold text-[10px] md:text-xs flex items-center gap-2"><Icons.Terminal/> Windows PowerShell</span>
                                        <div className="flex gap-3 md:gap-5 text-gray-400 text-sm md:text-base"><span>─</span><span>☐</span><span>✕</span></div>
                                    </div>
                                    <div className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-[11px] md:text-[14px] text-gray-200 leading-relaxed relative">
                                        <div className="mb-4 md:mb-6 text-gray-500">Windows PowerShell<br/>Copyright (C) Microsoft.</div>
                                        {step === 0 && <div className="mb-4"><span className="text-blue-400 font-bold mr-2">PS C:\Users\{uName}&gt;</span></div>}
                                        
                                        {scenarios.map((line) => ( 
                                            line.cmd && step >= line.s && (
                                                <div key={line.s} className="mb-4 relative group">
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`relative ${line.alert ? 'text-red-400 font-bold' : ''}`}>
                                                        <span className="text-blue-400 font-bold mr-2">PS C:\Users\{uName}&gt;</span>
                                                        {/* 🔥 명령어 클릭 시 해당 로그 뷰어 오픈 🔥 */}
                                                        <span 
                                                            className={`relative z-10 break-all cursor-pointer transition-colors px-1 rounded ${selectedLogIndex === line.s ? 'text-[#cfd7c7] bg-[#70a9a1]/30 font-bold' : 'hover:text-blue-300 hover:underline decoration-dashed'}`}
                                                            onClick={() => setSelectedLogIndex(line.s)}
                                                            title="클릭하여 상세 로그 분석 보기"
                                                        >
                                                            {line.s === step && !line.alert ? <span className="typing-effect inline-block">{line.cmd}</span> : line.cmd}
                                                        </span>
                                                    </motion.div>
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: line.s === step ? 1.5 : 0 }} className={`mt-1 md:mt-2 pl-2 md:pl-4 border-l-2 ${line.alert ? 'border-red-500/50 text-red-300 font-bold' : 'border-gray-700 text-gray-400'} whitespace-pre-wrap break-all relative`}>
                                                        {line.out}
                                                    </motion.div>
                                                </div>
                                            )
                                        ))}
                                        <div ref={logEndRef} className="h-4 md:h-6" />
                                    </div>
                                    
                                    {/* 🔥 파인만 로그 뷰어 (전체 단계 지원 및 테마 적용) 🔥 */}
                                    <AnimatePresence>
                                        {selectedLogIndex !== null && scenarios.find(s => s.s === selectedLogIndex)?.hackerLog && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                                                transition={{ duration: 0.4, type: "spring" }}
                                                className="absolute top-[5%] md:top-[8%] right-[5%] md:right-[5%] w-[85%] md:w-[450px] bg-[#cfd7c7] border-2 border-[#70a9a1] rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden"
                                            >
                                                <div className="h-10 md:h-12 bg-[#70a9a1] flex items-center px-4 justify-between shrink-0 shadow-sm cursor-move">
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <span className="w-3 h-3 rounded-full bg-[#40798c]/80 shadow-inner flex-shrink-0"></span>
                                                        <span className="w-3 h-3 rounded-full bg-[#40798c]/50 flex-shrink-0"></span>
                                                        <span className="text-[#40798c] font-black text-[11px] md:text-sm ml-2 tracking-widest uppercase truncate">{scenarios.find(s => s.s === selectedLogIndex).hackerLog.title}</span>
                                                    </div>
                                                    <button onClick={() => setSelectedLogIndex(null)} className="text-[#40798c] hover:text-white font-bold text-lg px-2 transition-colors"><Close size={16} /></button>
                                                </div>
                                                <div className="p-5 md:p-6 overflow-y-auto font-mono text-[10px] md:text-[12px] text-[#40798c] flex flex-col gap-4 max-h-[300px] md:max-h-[350px]">
                                                    {scenarios.find(s => s.s === selectedLogIndex).hackerLog.lines.map((item, idx) => (
                                                        <motion.div key={idx} initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} transition={{delay: 0.2 + (idx * 0.4)}}>
                                                            <p className="mb-2 font-bold opacity-80 whitespace-pre-wrap leading-relaxed">{item.log}</p>
                                                            <div className="bg-[#40798c]/10 border-l-4 border-[#40798c]/40 p-3 md:p-4 rounded-r-lg font-sans text-[11px] md:text-[13px] font-bold leading-relaxed shadow-sm">
                                                                {item.desc}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="h-10 md:h-14 mt-auto bg-[#1a1a1a]/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
                            <div className="flex items-center gap-2 md:gap-4"><div className="p-1 md:p-2 text-[#00a4ef] md:scale-125"><Icons.Windows /></div><div className="w-32 md:w-64 h-7 md:h-10 bg-white/10 rounded-md md:rounded-lg border border-white/5 flex items-center px-3 md:px-4 text-[10px] md:text-sm text-white/50">Search</div></div>
                            <div className="text-[9px] md:text-xs text-white opacity-90 font-medium">14:30 PM</div>
                        </div>
                    </motion.div>
                )}

                {/* ================= 🛡️ DEFENDER VIEW ================= */}
                {viewMode === 'defender' && (
                    <motion.div key="defender" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col bg-[#0f172a] text-slate-300 font-sans bg-cover bg-center" style={{ backgroundImage: 'radial-gradient(circle at center, #334155, #0f172a)' }}>
                        
                        <div className="absolute top-4 left-4 z-50">
                            <AnimatePresence mode="wait">
                                {current?.defTooltip && tooltipExpanded && (
                                    <motion.div key={`tooltip-${step}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => setTooltipExpanded(false)}
                                        className="bg-slate-900/95 backdrop-blur-2xl border border-red-500/40 shadow-xl border-l-4 border-l-red-500 text-white px-3 md:px-5 py-2 md:py-3 rounded-lg flex items-center gap-3 md:gap-4 max-w-[90vw] md:max-w-max cursor-pointer">
                                        <div className="p-1.5 md:p-2 bg-red-500/20 rounded-full text-red-500 shadow-inner flex-shrink-0"><span className="text-sm md:text-lg">🚨</span></div>
                                        <div className="pr-2 overflow-hidden flex flex-col justify-center">
                                            <div className="text-[8px] md:text-[10px] font-black tracking-widest text-red-400 uppercase mb-0.5 flex items-center gap-1.5 md:gap-2">
                                                <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span></span>
                                                {t.socTitle}
                                            </div>
                                            <p className="text-[10px] md:text-[13px] font-bold leading-tight truncate md:whitespace-nowrap text-slate-100">{current.defTooltip}</p>
                                        </div>
                                    </motion.div>
                                )}
                                {!tooltipExpanded && (
                                    <motion.div key="minimized" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setTooltipExpanded(true)} className="bg-slate-800/90 border border-slate-600 text-slate-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full cursor-pointer flex items-center gap-1.5 md:gap-2 hover:bg-slate-700 transition-colors shadow-lg backdrop-blur-md">
                                        <span className="text-sm md:text-lg">🚨</span> <span className="text-[10px] md:text-xs font-bold">Alert</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

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
                                <div className="w-full h-1/2 md:h-auto md:w-[45%] border-b md:border-b-0 md:border-r border-slate-800 bg-[#0f172a] flex flex-col relative shrink-0 md:shrink">
                                    <div className="p-2 md:p-3 bg-[#1e293b]/50 border-b border-slate-800 text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-2 shrink-0">
                                        <Icons.Activity /> PROCESS TREE
                                    </div>
                                    <div className="flex-1 p-3 md:p-5 overflow-y-auto font-mono text-[10px] md:text-[12px]">
                                        <div className="mb-3 md:mb-4 pb-2 border-b border-slate-800">
                                            <span className="text-slate-300 font-bold">Host:</span> PC-{uName} <br/>
                                            <span className="text-slate-500">IP: 192.168.10.45</span>
                                        </div>
                                        <ul className="space-y-1 md:space-y-2">
                                            {getProcessTree().map(proc => (
                                                <motion.li key={proc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                                                    className={`py-1 flex items-center gap-1.5 md:gap-2 ${proc.depth > 0 ? 'border-l border-slate-700 ml-2 pl-2 md:ml-3 md:pl-3' : ''} ${proc.alert ? 'text-red-400 font-bold bg-red-900/10 rounded pr-1 md:pr-2' : 'text-slate-300'}`}>
                                                    <Icons.File />
                                                    <span className="truncate">{proc.name}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                    <TopologyMap />
                                </div>

                                <div className="w-full h-1/2 md:h-auto md:flex-1 flex flex-col bg-[#020617] shrink-0 md:shrink">
                                    <div className="p-2 md:p-3 border-b border-slate-800 text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-2 shrink-0">
                                        <Icons.EventLog /> SIEM ALERTS
                                    </div>
                                    <div className="flex-1 p-3 md:p-6 overflow-y-auto flex flex-col gap-2 md:gap-3 font-mono text-[10px] md:text-[12px]">
                                        {scenarios.filter(d => d.s <= step && d.s > 0).map((d) => (
                                            <motion.div key={d.s} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`p-2.5 md:p-4 rounded-lg border border-l-2 md:border-l-4 ${d.alert || d.s === 9 || d.s === 5 ? 'bg-red-900/10 border-red-500/30 border-l-red-500 text-red-300' : 'bg-slate-800/30 border-slate-700 border-l-blue-500 text-slate-300'}`}>
                                                <div className="flex justify-between mb-1.5 md:mb-2 pb-1.5 md:pb-2 border-b border-slate-800/50">
                                                    <span className="font-bold text-white text-[11px] md:text-[13px]">{d.defLog}</span>
                                                    <span className="text-slate-500 text-[9px] md:text-[10px]">14:3{d.s}:12</span>
                                                </div>
                                                <div className="text-slate-400 whitespace-pre-wrap leading-relaxed break-words">{d.defCmd}</div>
                                            </motion.div>
                                        ))}
                                        <div ref={defLogEndRef} className="h-2 md:h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-10 md:h-12 mt-auto bg-[#020617] border-t border-slate-800 flex items-center px-4 md:px-6 shrink-0 text-slate-400 text-xs md:text-sm shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
                            <span className="flex items-center gap-2 bg-slate-800 px-2 py-1 md:px-3 md:py-1.5 rounded text-white font-bold"><Icons.Windows /> Start</span>
                            <span className="ml-auto font-medium text-[9px] md:text-xs tracking-wide">SOC Analyst</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>{/* /innerRef zoom wrapper */}
        </div>

        <div className="w-full h-px lg:w-px lg:h-full bg-gray-200 shrink-0 z-20"></div>

        {/* ========================================================= */}
        {/* 오른쪽 패널 (핵심 용어 패널 포함) */}
        {/* ========================================================= */}
        <div className="flex flex-col w-full lg:w-[450px] xl:w-[500px] h-auto lg:h-full min-h-[500px] bg-[#f8fafc] lg:rounded-r-[32px] overflow-hidden shrink-0 relative">
            
            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-gray-200 bg-white flex justify-between items-center shrink-0 shadow-sm">
                <div>
                  <div className="text-[10px] md:text-xs font-black tracking-widest mb-1 text-[#9c6644]">ATT&CK T1078.002</div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight">Domain Accounts</h1>
                </div>
                <button onClick={() => { setIsMuted(!isMuted); window.speechSynthesis.cancel(); }} className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                    {isMuted ? <Icons.VolumeOff /> : <Icons.VolumeOn />}
                </button>
            </div>

            <div className="flex-1 relative" style={{ perspective: "1500px" }}>
                <motion.div className="w-full h-full relative" animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.7, ease: "easeInOut" }} style={{ transformStyle: "preserve-3d" }}>
                    
                    {/* 앞면 */}
                    <div className="absolute inset-0 flex flex-col px-4 py-4 md:px-8 md:pb-8 md:pt-6 overflow-y-auto" style={{ backfaceVisibility: "hidden" }}>
                        
                        <div className="flex justify-between items-center mb-6 md:mb-10 relative px-2 md:px-4 mt-2">
                            <div className="absolute top-4 md:top-5 left-6 right-6 md:left-10 md:right-10 h-1 md:h-1.5 bg-slate-200 rounded-full z-0">
                                <motion.div className="h-full bg-[#9c6644] rounded-full" style={{ width: `${(step / totalSteps) * 100}%` }} transition={{ duration: 0.5 }} />
                            </div>
                            {[t.step1, t.step2, t.step3, t.step4].map((label, i) => {
                                const thresholds = [0, 3, 5, 9]; 
                                const nextThresholds = [3, 5, 9, 11];
                                const active = step >= thresholds[i];
                                const isCurrent = step >= thresholds[i] && step < nextThresholds[i];
                                
                                return (
                                    <div key={i} className="flex flex-col items-center gap-2 md:gap-3 z-10 bg-[#f8fafc] px-1.5 md:px-3 relative">
                                        <motion.div 
                                            initial={false} 
                                            animate={{ 
                                                backgroundColor: active ? colors.primary : '#ffffff', 
                                                borderColor: active ? colors.primary : '#cbd5e1', 
                                                color: active ? '#ffffff' : '#94a3b8', 
                                                scale: isCurrent ? 1.2 : 1, 
                                                y: isCurrent ? [-2, 2] : 0,
                                                boxShadow: isCurrent ? ["0px 0px 0px rgba(237,224,212,0)", "0px 0px 15px rgba(237,224,212,1)", "0px 0px 0px rgba(237,224,212,0)"] : "none" 
                                            }} 
                                            transition={isCurrent ? { y: { repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }, boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" } } : { duration: 0.3 }}
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-[12px] md:rounded-[16px] border-2 flex items-center justify-center text-xs md:text-base bg-white shadow-sm relative z-10 font-black"
                                        >
                                            {label?.split(" ")?.[0] || "?"}
                                        </motion.div>
                                        <motion.span animate={{ color: active ? '#1f2937' : '#94a3b8', fontWeight: isCurrent ? 900 : 700 }} className="text-[9px] md:text-[10px] uppercase tracking-widest text-center">
                                            {label?.split(" ")?.[1] || ""}
                                        </motion.span>
                                    </div>
                                );
                            })}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4 md:gap-5">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-[#ede0d4] flex items-center justify-center text-lg md:text-xl text-[#9c6644]">📍</div>
                                    <h2 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">{current?.title}</h2>
                                </div>
                                <div className="bg-white rounded-[20px] md:rounded-[24px] p-5 md:p-6 border-2 border-gray-100 shadow-sm relative">
                                    <div className="text-[9px] md:text-[10px] font-black text-[#9c6644] tracking-widest uppercase mb-2">{t.what}</div>
                                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                                        {current?.feynman}
                                        {!isMuted && isPlaying && !ttsFinished && <span className="inline-block ml-2 w-2 h-2 rounded-full bg-[#9c6644] animate-pulse"></span>}
                                    </p>
                                </div>
                                {current?.expert && (
                                    <div className="bg-[#1e293b] rounded-[20px] md:rounded-[24px] p-5 md:p-6 text-white shadow-lg relative border-t-4 border-[#9c6644]">
                                        <div className="absolute -top-[6px] md:-top-[8px] left-6 md:left-8 w-3 h-3 md:w-4 md:h-4 bg-[#1e293b] transform rotate-45 border-t-4 border-l-4 border-[#9c6644]"></div>
                                        <div className="text-[9px] md:text-[10px] font-black tracking-widest text-[#ede0d4] uppercase mb-2">{t.why}</div>
                                        <p className="text-[11px] md:text-[12px] leading-relaxed text-gray-300 font-mono">{current?.expert}</p>
                                    </div>
                                )}
                                {/* 🔥 핵심 용어 및 도구 (Terms) 추가 섹션 🔥 */}
                                {current?.terms && (
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
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* 뒷면 (수료증 발급) */}
                    <div className="absolute inset-0 flex flex-col p-6 md:p-10 bg-slate-900 text-white overflow-y-auto" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                        <h2 className="text-2xl md:text-3xl font-black mb-2 md:mb-4 text-[#ede0d4]">{t.complete}</h2>
                        <p className="mb-6 md:mb-10 text-sm md:text-base leading-relaxed text-slate-300">{t.completeMsg(uName, cName)}</p>
                        
                        <button onClick={handleDownloadCertificate} disabled={isDownloading} className="mb-3 md:mb-4 flex justify-center items-center gap-2 md:gap-3 bg-[#9c6644] hover:bg-[#7f5337] text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl shadow-lg text-sm md:text-lg transition-transform active:scale-95">
                            {isDownloading ? (
                                <span className="animate-pulse">Generating PDF...</span>
                            ) : (
                                <><Icons.Download /> {t.downloadCert}</>
                            )}
                        </button>

                        <button onClick={() => {setIsFlipped(false); setStep(0); setShowConfig(true);}} className="mt-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl transition-colors text-xs md:text-sm">
                            {t.resetBtn}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* 하단 컨트롤러 */}
            <div className="px-6 pb-6 pt-3 md:px-8 md:pb-8 md:pt-4 shrink-0 bg-[#f8fafc]">
                <div className="text-center mb-2 md:mb-4 h-4 text-[9px] md:text-[11px] font-black tracking-widest text-slate-400 uppercase">
                    {isPlaying && step >= 0 && timeLeft === 0 && !ttsFinished ? <span className="text-[#9c6644] animate-pulse">{t.stateWaitTTS}</span>
                    : isPlaying && step >= 0 && timeLeft > 0 ? <span className="text-[#9c6644]">{step === 0 ? t.state0 + " " + t.statePlay(timeLeft) : t.statePlay(timeLeft)}</span>
                    : !isPlaying && step >= 0 ? t.statePause : ""}
                </div>

                <div className="bg-white rounded-full p-1.5 md:p-2.5 flex items-center justify-between border border-gray-200 shadow-sm">
                    <button onClick={handleReset} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-all"><Icons.Reset /></button>
                    <div className="flex items-center gap-1.5 md:gap-3">
                        <button onClick={handlePrev} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-all"><Icons.Prev /></button>
                        <button onClick={handlePlayPause} className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full text-white shadow-lg md:shadow-xl hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: colors.primary }}>
                            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                        </button>
                        <button onClick={handleNext} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-all"><Icons.Next /></button>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xs md:text-sm font-black text-gray-300 bg-gray-50 rounded-full border border-gray-100">{step}/10</div>
                </div>
            </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 🔥 글로벌 언어 지원 다국어 수료증 (PDF 캡처용 DOM) 🔥 */}
      {/* ========================================================= */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div ref={certificateRef} className="w-[1122px] h-[793px] bg-white relative flex flex-col overflow-hidden" style={{ fontFamily: 'Georgia, serif' }}>

          {/* ── 테두리: 바깥 실선 + 안쪽 장식선 ── */}
          <div className="absolute inset-0 border-[22px] border-[#9c6644]" />
          <div className="absolute inset-[32px] border-[2px] border-[#9c6644]/30" />

          {/* ── 모서리 장식 ── */}
          {[['top-0 left-0','border-t-[6px] border-l-[6px]'],
            ['top-0 right-0','border-t-[6px] border-r-[6px]'],
            ['bottom-0 left-0','border-b-[6px] border-l-[6px]'],
            ['bottom-0 right-0','border-b-[6px] border-r-[6px]']
          ].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-20 h-20 ${border} border-[#9c6644]/40 m-10`} />
          ))}

          {/* ── 배경 워터마크: GOTROOT 텍스트 ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <p className="text-[170px] font-black text-[#9c6644] opacity-[0.025] tracking-widest whitespace-nowrap"
               style={{ fontFamily: 'Georgia, serif' }}>
              GOTROOT
            </p>
          </div>

          {/* ── 헤더 ── */}
          <div className="text-center pt-12 pb-6 relative z-10 px-16">
            <p className="text-sm font-sans text-[#9c6644] tracking-[0.5em] uppercase mb-3">
              (주)갓루트(GOTROOT) Cybersecurity Training Institute
            </p>
            <h1 className="text-[58px] font-extrabold text-gray-900 tracking-[0.18em] uppercase leading-none">
              {t.cert?.title || "Certificate"}
            </h1>
            {/* 헤더 하단 장식 라인 */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-32 bg-[#9c6644]/40" />
              <div className="w-2 h-2 rotate-45 bg-[#9c6644]/50" />
              <div className="h-px w-32 bg-[#9c6644]/40" />
            </div>
          </div>

          {/* ── 본문 ── */}
          <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 px-20">
            <p className="text-xl text-gray-500 italic mb-5">{t.cert?.subtitle || "This certifies that"}</p>
            {/* 수료자 이름 */}
            <h2 className="text-[52px] font-bold text-[#9c6644] pb-3 px-16 mb-6 min-w-[420px]"
                style={{ borderBottom: '3px solid #e2c9b5' }}>
              {uName}
            </h2>
            <p className="text-[17px] text-gray-600 leading-relaxed max-w-[740px] mb-5">
              {t.cert?.desc || "has successfully completed the advanced threat simulation and defense training."}
            </p>
            {/* 과정명 */}
            <div className="flex items-center gap-4">
              <div className="h-px w-16 bg-gray-300" />
              <p className="text-[22px] font-extrabold text-gray-800 tracking-wide font-sans">
                ATT&amp;CK T1078.002 : Domain Accounts
              </p>
              <div className="h-px w-16 bg-gray-300" />
            </div>
          </div>

          {/* ── 푸터: 날짜 | 인장 | 서명 ── */}
          <div className="pb-10 px-20 flex justify-between items-end relative z-10 font-sans">
            {/* 발급 날짜 */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[18px] font-bold text-gray-800">{certIssueDate}</p>
              <div className="border-t-2 border-gray-300 w-52 pt-2 text-center text-xs text-gray-400 tracking-[0.2em] uppercase">
                {t.cert?.date || "Date of Issue"}
              </div>
            </div>

            {/* GOTROOT 인장 */}
            <div className="flex flex-col items-center -mt-4">
              <GotrootSeal />
            </div>

            {/* 수석 훈련관 서명 */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[22px] text-[#9c6644] italic mb-0.5" style={{ fontFamily: 'Brush Script MT, cursive, Georgia, serif' }}>
                (주)갓루트 GOTROOT
              </p>
              <p className="text-[10px] text-gray-500 mb-1" style={{ fontFamily: 'sans-serif' }}>대표 윤웅</p>
              <div className="border-t-2 border-gray-300 w-52 pt-2 text-center text-xs text-gray-400 tracking-[0.2em] uppercase">
                {t.cert?.instructor || "Lead Instructor"}
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
            <a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer"
              className="text-[#bb3e03]/60 hover:text-[#bb3e03] transition-colors">gotroot.co.kr ↗</a>
            <p>ericyoon@gotroot.co.kr</p>
          </div>
        </div>
      </div>

    </div>
  );
}
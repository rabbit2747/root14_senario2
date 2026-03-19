import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Search, ChevronRight, X,
  Terminal, Briefcase, Syringe, Package, Unlock, Shield,
  Cpu, Eye, Download, Play, RefreshCw, FileCode, RotateCw,
  Radar, Map
} from 'lucide-react';

// [게임용 UI 컴포넌트] 사이버 르네상스 스타일
// ──────────────────────────────────────────────────────────────────────────────
const RoseGoldButton = ({ children, onClick, className = '', disabled = false }) => {
  const [isRippling, setIsRippling] = useState(false);
  const handleClick = (e) => {
    if (disabled) return;
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 600);
    if (onClick) onClick(e);
  };
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden inline-flex items-center justify-center font-bold px-4 py-3 md:px-6 md:py-4 rounded-xl transition-all duration-300 shadow-lg tracking-wide text-[13px] md:text-lg border-2 ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-gray-600 bg-[#0A0F1C] text-gray-400'
          : 'border-[#DFB8B6] bg-[#0A0F1C] text-[#DFB8B6] hover:bg-[#DFB8B6] hover:text-[#0A0F1C] hover:shadow-[0_0_20px_rgba(223,184,182,0.4)]'
      } ${className}`}
    >
      {isRippling && <span className="absolute inset-0 bg-white/20 animate-pulse" />}
      {children}
    </button>
  );
};

const RenaissanceBadge = ({ icon: IconComp, imgSrc, glowColor = "#00E5FF" }) => (
  <div
    className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_2px_8px_rgba(255,255,255,0.1)] relative transition-all duration-300 group-hover:scale-110 bg-[#0A0F1C]"
    style={{ border: `2px solid #DFB8B6` }}
  >
    <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: `inset 0 0 25px ${glowColor}60` }}></div>
    {imgSrc ? (
      <img src={imgSrc} alt="clue icon" className="w-8 h-8 md:w-10 md:h-10 relative z-10 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
    ) : (
      IconComp && <IconComp size={28} color={glowColor} strokeWidth={2} className="relative z-10 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
    )}
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Advanced)
// ──────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    scene: 'scene_phase1', loc: 'Sector 1: EDR 전장',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "어험! {AGENT} 요원, 이번 임무는 고급 과정이다. 스피어피싱 첨부파일이 EDR을 우회하는 기법을 분석해야 한다." },
      { speaker: 'AGENT_NAME', text: "네, 팀장님! EDR이 프로세스 행위를 감시하고 있지만, 공격자들은 프로세스 인젝션과 DLL 사이드로딩으로 탐지를 피하고 있습니다." },
      { speaker: 'TEAM_LEADER', text: "좋다. 놈들은 정상 프로세스에 악성 코드를 주입하거나, NTDLL 후킹을 해제해서 EDR의 눈을 피하지. 현장의 단서를 수집해라!" }
    ],
    hint: "프로세스 인젝션 주사기, DLL 패키지, <br>그리고 NTDLL 언후킹 잠금해제 단서를 찾아라."
  },
  {
    scene: 'scene_phase1', loc: 'Sector 1: EDR 전장',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "찾았습니다! 공격자가 svchost.exe에 셸코드를 인젝션하고, EDR 후킹을 해제하여 API 호출을 은폐하고 있었습니다." },
      { speaker: 'TEAM_LEADER', text: "잘했다. 정상 프로세스의 메모리를 악용하는 이 기법의 정확한 명칭을 대답해 보아라." }
    ],
    triggerPuzzle: 1
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: AMSI 분석실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "스피어피싱으로 전달된 매크로나 PowerShell 페이로드는 Windows AMSI의 검사를 받게 되지. 하지만 놈들은 이것마저 무력화한다." },
      { speaker: 'AGENT_NAME', text: "AMSI 스캔 인터페이스가 보입니다! 그런데 공격자가 메모리 패칭으로 AmsiScanBuffer 함수를 변조하고 있어요!" },
      { speaker: 'TEAM_LEADER', text: "그래, 난독화까지 결합하면 스크립트 기반 탐지가 거의 불가능해지지. AMSI 구역의 증거를 확보해라!" }
    ],
    hint: "AMSI 스캐너 방패, 메모리 패칭 CPU, <br>그리고 난독화 기법의 눈 아이콘을 찾아라."
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: AMSI 분석실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "증거 확보 완료! AMSI를 우회하는 메모리 패칭 기법과 Base64+XOR 다중 난독화 레이어를 모두 식별했습니다." },
      { speaker: 'TEAM_LEADER', text: "훌륭하다. Windows의 스크립트 보안 검사 인터페이스를 우회하는 이 공격의 명칭을 말해 보아라." }
    ],
    triggerPuzzle: 2
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: LOLBins 무기고',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "스피어피싱 첨부파일의 진짜 무서운 점은 외부 도구 없이도 시스템에 이미 있는 정상 바이너리를 악용한다는 거다." },
      { speaker: 'AGENT_NAME', text: "certutil로 악성 페이로드를 다운로드하고, mshta로 HTA 스크립트를 실행하고, rundll32로 DLL을 프록시 실행하고 있어요!" },
      { speaker: 'TEAM_LEADER', text: "이것이 Living off the Land 전략이다. 정상 서명된 Microsoft 바이너리라 백신이 차단하기 어렵지. 무기고를 조사해라!" }
    ],
    hint: "certutil 다운로드, mshta 실행 플레이어, <br>그리고 rundll32 프록시 순환 아이콘을 찾아라."
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: LOLBins 무기고',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "무기고 분석 완료! 공격자는 certutil -urlcache, mshta javascript:, rundll32 DllRegisterServer 등 정상 바이너리 체인을 구성하고 있었습니다." },
      { speaker: 'TEAM_LEADER', text: "맞다. 시스템에 이미 설치된 정상 바이너리를 악용하는 이 공격 기법의 통칭을 대답해라." }
    ],
    triggerPuzzle: 3
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: 탐지공학 연구소',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "공격 기법을 알았으니, 이제 방어자의 관점으로 전환하자. Detection Engineering은 탐지 룰의 전체 생명주기를 관리하는 분야다." },
      { speaker: 'AGENT_NAME', text: "Sigma/YARA 룰 작성부터 오탐(False Positive) 분석, 룰 배포와 유지보수까지 체계적으로 관리되고 있군요!" },
      { speaker: 'TEAM_LEADER', text: "탐지 룰 하나가 실전에 배포되기까지의 과정을 이해해야 진정한 방어자가 될 수 있다. 연구소의 단서를 수집해라!" }
    ],
    hint: "탐지 룰 코드 파일, 오탐 경고 삼각형, <br>그리고 룰 생명주기 순환 아이콘을 찾아라."
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: 탐지공학 연구소',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "연구소 조사 완료! Sigma 룰 작성 → 테스트 환경 검증 → 프로덕션 배포 → 오탐 피드백 반영의 전체 사이클을 확인했습니다." },
      { speaker: 'TEAM_LEADER', text: "훌륭하다. 탐지 룰의 생성부터 유지보수까지 전체 과정을 관리하는 이 분야의 정확한 명칭을 말해라." }
    ],
    triggerPuzzle: 4
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 위협 사냥터',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "마지막 구역이다. Threat Hunting은 알려진 시그니처에 의존하지 않고, 가설을 세워 능동적으로 위협을 찾아내는 고급 보안 활동이다." },
      { speaker: 'AGENT_NAME', text: "가설 기반으로 IOC 스윕을 수행하고, ATT&CK TTP에 매핑하여 공격 패턴을 추적하는 프로세스가 보입니다!" },
      { speaker: 'TEAM_LEADER', text: "그래, 스피어피싱 첨부파일 공격에 대한 사냥 가설을 세우고 체계적으로 추적하는 방법을 익혀라. 사냥터의 단서를 모아라!" }
    ],
    hint: "사냥 가설 돋보기, IOC 스윕 레이더, <br>그리고 TTP 매핑 지도를 찾아라."
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 위협 사냥터',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "사냥 완료! '비정상 자식 프로세스 생성' 가설로 Outlook→cmd→PowerShell 체인을 추적하고, T1566.001에 TTP 매핑했습니다." },
      { speaker: 'TEAM_LEADER', text: "완벽하다. 가설을 세우고 능동적으로 위협을 찾아내는 이 보안 활동의 정확한 명칭을 최종 답변해라." }
    ],
    triggerPuzzle: 5
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 위협 사냥터',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "이제 EDR 우회부터 Threat Hunting까지, 고급 스피어피싱 공격의 전체 공방을 완벽히 이해했습니다!" },
      { speaker: 'TEAM_LEADER', text: "수고했다, {AGENT}. 오늘 학습한 내용들을 최종 사건 수첩에 도장 찍어 두었으니 꼼꼼히 복습하도록." }
    ],
    triggerBook: true
  }
];

const CLUES_DATA = {
  scene_phase1: [
    { id: 'proc_inject',   icon: Syringe,  title: "프로세스 인젝션",  msg: "정상 프로세스(svchost.exe, explorer.exe)의 메모리 공간에 악성 셸코드를 삽입하여, EDR이 정상 프로세스로 오인하게 만드는 기법입니다." },
    { id: 'dll_sideload',  icon: Package,  title: "DLL 사이드로딩",   msg: "정상 애플리케이션이 로딩하는 DLL을 악성 DLL로 교체하여, 서명된 프로세스 컨텍스트에서 악성 코드를 실행하는 기법입니다." },
    { id: 'unhook_ntdll',  icon: Unlock,   title: "NTDLL 언후킹",    msg: "EDR이 ntdll.dll에 설치한 후킹(감시 코드)을 제거하여, 시스템 콜 모니터링을 무력화하고 API 호출을 은폐하는 기법입니다." }
  ],
  scene_phase2: [
    { id: 'amsi_scan',     icon: Shield,   title: "AMSI 스캐너",     msg: "Windows Anti-Malware Scan Interface. PowerShell, VBScript 등 스크립트 실행 전 보안 제품에 콘텐츠를 전달하여 악성 여부를 검사합니다." },
    { id: 'mem_patch',     icon: Cpu,      title: "메모리 패칭",     msg: "AmsiScanBuffer 함수의 메모리를 직접 수정하여 항상 'AMSI_RESULT_CLEAN'을 반환하게 만드는 바이패스 기법입니다." },
    { id: 'obfuscation',   icon: Eye,      title: "난독화 기법",     msg: "Base64 인코딩, XOR 암호화, 문자열 분할, 변수명 치환 등을 다중으로 적용하여 시그니처 기반 탐지를 회피하는 기법입니다." }
  ],
  scene_phase3: [
    { id: 'certutil_dl',   icon: Download,  title: "certutil 다운로드", msg: "인증서 관리 도구인 certutil.exe의 -urlcache 옵션을 악용하여 외부에서 악성 페이로드를 다운로드하는 LOLBin 기법입니다." },
    { id: 'mshta_exec',    icon: Play,      title: "mshta 실행",       msg: "Microsoft HTML Application Host(mshta.exe)를 이용해 HTA 파일이나 인라인 JavaScript/VBScript를 실행하는 기법입니다." },
    { id: 'rundll32_proxy', icon: RefreshCw, title: "rundll32 프록시",  msg: "rundll32.exe를 프록시로 사용하여 악성 DLL의 특정 export 함수를 실행하거나, JavaScript를 실행하는 기법입니다." }
  ],
  scene_phase4: [
    { id: 'detection_rule', icon: FileCode,      title: "탐지 룰",      msg: "Sigma, YARA, Snort 등의 형식으로 작성된 탐지 규칙. 특정 공격 행위의 패턴을 정의하여 자동으로 탐지하고 경보를 발생시킵니다." },
    { id: 'false_positive', icon: AlertTriangle,  title: "오탐 분석",    msg: "탐지 룰이 정상 행위를 공격으로 잘못 판단하는 False Positive를 분석하고, 룰의 정밀도를 향상시키는 튜닝 과정입니다." },
    { id: 'rule_lifecycle', icon: RotateCw,       title: "룰 생명주기",  msg: "탐지 룰의 작성→테스트→배포→모니터링→피드백→개선의 전체 순환 과정을 체계적으로 관리하는 Detection Engineering의 핵심입니다." }
  ],
  scene_phase5: [
    { id: 'hunt_hypothesis', icon: Search, title: "사냥 가설",   msg: "Threat Hunting의 출발점. '스피어피싱 첨부파일로 인한 비정상 자식 프로세스가 존재할 것이다'와 같은 가설을 수립합니다." },
    { id: 'ioc_sweep',      icon: Radar,  title: "IOC 스윕",    msg: "Indicator of Compromise(침해 지표)를 기반으로 로그, 네트워크 트래픽, 엔드포인트를 스윕하여 악성 활동의 흔적을 탐색합니다." },
    { id: 'ttp_mapping',    icon: Map,    title: "TTP 매핑",    msg: "발견된 공격 행위를 MITRE ATT&CK의 Tactics, Techniques, Procedures에 매핑하여 공격자의 전술 패턴을 체계적으로 분석합니다." }
  ]
};

const PUZZLES = {
  1: {
    title: "EDR 우회의 핵심",
    desc: "정상 프로세스의 메모리 공간에 <b>악성 코드를 삽입</b>하여 EDR의 탐지를 회피하는 기법은?",
    options: ["프로세스 인젝션", "DLL 하이재킹", "코드 서명", "레지스트리 수정"],
    answer: 0
  },
  2: {
    title: "스크립트 보안의 벽",
    desc: "Windows의 <b>스크립트 보안 검사 인터페이스</b>를 우회하여 악성 PowerShell/VBScript를 탐지 없이 실행하는 공격은?",
    options: ["UAC 바이패스", "커널 익스플로잇", "AMSI 바이패스", "방화벽 우회"],
    answer: 2
  },
  3: {
    title: "내부의 적",
    desc: "별도의 악성 도구 설치 없이, <b>시스템에 이미 설치된 정상 바이너리</b>(certutil, mshta, rundll32 등)를 악용하는 공격 기법의 통칭은?",
    options: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    answer: 1
  },
  4: {
    title: "방어의 과학",
    desc: "탐지 룰의 <b>생성 → 테스트 → 배포 → 유지보수</b> 전체 과정을 체계적으로 관리하는 보안 분야는?",
    options: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    answer: 2
  },
  5: {
    title: "능동적 추적자",
    desc: "<b>가설을 세우고 능동적으로</b> 알려지지 않은 위협을 찾아내는 고급 보안 활동은?",
    options: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    answer: 0
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// [메인 교육 게임 컴포넌트]
// ──────────────────────────────────────────────────────────────────────────────
function InteractiveGameCanvas({ onFinish, userName, companyName }) {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem('t1566_advanced_state');
      if (saved) return { ...JSON.parse(saved), isTyping: false };
    } catch (e) {}
    return { chapterIdx: 0, dialogueIdx: 0, foundClues: [], showBook: false, isTyping: false };
  });
  const [cluePopupId, setCluePopupId] = useState(null);
  const [showPuzzle, setShowPuzzle] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState('idle');
  const puzzleError = puzzleStatus === 'wrong';
  const [showInventory, setShowInventory] = useState(false);
  const [absorbing, setAbsorbing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [clearDate, setClearDate] = useState(() => localStorage.getItem('t1566_advanced_clear'));
  const [activeReportTab, setActiveReportTab] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showHint, setShowHint] = useState(false);

  const typeTimer = useRef(null);
  const idleTimer = useRef(null);
  const currentChapter = CHAPTERS[gameState.chapterIdx];
  const currentDialogue = currentChapter?.dialogues[gameState.dialogueIdx];
  const currentSceneCluesData = CLUES_DATA[currentChapter?.scene] || [];
  const phaseCount = gameState.foundClues.filter(id => currentSceneCluesData.some(c => c.id === id)).length;
  const requiredClues = 3;
  const currentSector = parseInt(currentChapter?.scene?.replace('scene_phase', '')) || 1;
  const totalSectors = 5;

  // Auto Save
  useEffect(() => {
    localStorage.setItem('t1566_advanced_state', JSON.stringify({
      chapterIdx: gameState.chapterIdx,
      dialogueIdx: gameState.dialogueIdx,
      foundClues: gameState.foundClues,
      showBook: gameState.showBook
    }));
  }, [gameState.chapterIdx, gameState.dialogueIdx, gameState.foundClues, gameState.showBook]);

  // Typing Effect
  useEffect(() => {
    if (!currentDialogue || cluePopupId || showPuzzle > 0 || gameState.showBook || showInventory) return;
    const textToType = currentDialogue.text
      .replace(/\{AGENT\}/g, userName)
      .replace(/\{LEADER\}/g, companyName);
    setTypedText("");
    setGameState(prev => ({ ...prev, isTyping: true }));
    let i = 0;
    clearInterval(typeTimer.current);
    typeTimer.current = setInterval(() => {
      setTypedText(textToType.substring(0, i + 1));
      i++;
      if (i >= textToType.length) {
        clearInterval(typeTimer.current);
        setGameState(prev => ({ ...prev, isTyping: false }));
      }
    }, 40);
    return () => clearInterval(typeTimer.current);
  }, [gameState.chapterIdx, gameState.dialogueIdx, cluePopupId, showPuzzle, gameState.showBook, currentDialogue, showInventory, userName, companyName]);

  // Hint Timer
  useEffect(() => {
    clearTimeout(idleTimer.current);
    setShowHint(false);
    if (currentChapter?.hint && phaseCount < requiredClues && !currentDialogue && !cluePopupId && !showPuzzle && !showInventory && !clearDate) {
      idleTimer.current = setTimeout(() => setShowHint(true), 5000);
    }
    return () => clearTimeout(idleTimer.current);
  }, [gameState.chapterIdx, gameState.dialogueIdx, phaseCount, cluePopupId, showPuzzle, currentDialogue, currentChapter, showInventory, clearDate]);

  // 보고서 모달 — 마우스 휠로 탭 전환
  useEffect(() => {
    if (!gameState.showBook) return;
    const handler = (e) => {
      e.preventDefault();
      setActiveReportTab(prev =>
        e.deltaY > 0 ? Math.min(5, prev + 1) : Math.max(0, prev - 1)
      );
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [gameState.showBook]);

  // 자유 탐색 Sector 점프
  const handleSectorJump = (targetSector) => {
    if (!clearDate) return;
    const targetChapterIdx = (targetSector - 1) * 2;
    clearInterval(typeTimer.current);
    clearTimeout(idleTimer.current);
    setTypedText("");
    setGameState(prev => ({
      ...prev,
      chapterIdx: targetChapterIdx,
      dialogueIdx: 0,
      isTyping: false,
      showBook: false
    }));
    setCluePopupId(null);
    setShowPuzzle(0);
    setPuzzleStatus('idle');
    setSuccessMsg("");
    setShowInventory(false);
  };

  const advanceDialogue = () => {
    if (absorbing || successMsg || showInventory) return;
    if (gameState.isTyping) {
      clearInterval(typeTimer.current);
      const textToType = currentDialogue.text
        .replace(/\{AGENT\}/g, userName)
        .replace(/\{LEADER\}/g, companyName);
      setTypedText(textToType);
      setGameState(prev => ({ ...prev, isTyping: false }));
    } else {
      const nextIdx = gameState.dialogueIdx + 1;
      if (nextIdx >= currentChapter.dialogues.length) {
        if (clearDate) {
          setGameState(prev => ({ ...prev, dialogueIdx: nextIdx }));
        } else {
          if (currentChapter.triggerPuzzle !== undefined) {
            setShowPuzzle(currentChapter.triggerPuzzle);
          } else if (currentChapter.triggerBook) {
            const dateStr = new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            setClearDate(dateStr);
            localStorage.setItem('t1566_advanced_clear', dateStr);
            setActiveReportTab(0);
            setGameState(prev => ({ ...prev, showBook: true }));
          } else {
            setGameState(prev => ({ ...prev, dialogueIdx: nextIdx }));
          }
        }
      } else {
        setGameState(prev => ({ ...prev, dialogueIdx: nextIdx }));
      }
    }
  };

  const handleClueClick = (clueId) => {
    if (currentDialogue || cluePopupId || showPuzzle > 0 || gameState.showBook || absorbing || successMsg || showInventory) return;
    if (gameState.foundClues.includes(clueId)) {
      if (clearDate) setCluePopupId(clueId);
      return;
    }
    setShowHint(false);
    setGameState(prev => ({ ...prev, foundClues: [...prev.foundClues, clueId] }));
    setCluePopupId(clueId);
  };

  const closeCluePopup = () => {
    setCluePopupId(null);
    if (clearDate) return;
    const updatedCount = gameState.foundClues.filter(id => currentSceneCluesData.some(c => c.id === id)).length;
    if (updatedCount >= requiredClues) {
      setAbsorbing(true);
      setTimeout(() => {
        setAbsorbing(false);
        setGameState(prev => ({ ...prev, chapterIdx: prev.chapterIdx + 1, dialogueIdx: 0 }));
      }, 1500);
    }
  };

  const handlePuzzleSelect = (idx) => {
    if (successMsg) return;
    if (idx === PUZZLES[showPuzzle].answer) {
      setPuzzleStatus('correct');
      setSuccessMsg("ACCESS GRANTED");
      setTimeout(() => {
        setPuzzleStatus('idle');
        setSuccessMsg("");
        setShowPuzzle(0);
        setGameState(prev => ({ ...prev, chapterIdx: prev.chapterIdx + 1, dialogueIdx: 0 }));
      }, 2000);
    } else {
      setPuzzleStatus('wrong');
      setTimeout(() => setPuzzleStatus('idle'), 800);
    }
  };

  const handleBgClick = () => { if (currentDialogue) advanceDialogue(); };

  const resetGame = () => {
    setGameState({ chapterIdx: 0, dialogueIdx: 0, foundClues: [], showBook: false, isTyping: false });
    setActiveReportTab(0);
    setCluePopupId(null);
    setShowPuzzle(0);
    setPuzzleStatus('idle');
    setSuccessMsg("");
    setAbsorbing(false);
    setShowInventory(false);
    localStorage.removeItem('t1566_advanced_state');
    localStorage.removeItem('t1566_advanced_clear');
    setClearDate(null);
  };

  const activeClueObj = cluePopupId ? Object.values(CLUES_DATA).flat().find(c => c.id === cluePopupId) : null;
  const currentSpeakerName = currentDialogue?.speaker === 'TEAM_LEADER'
    ? `팀장 ${companyName}`
    : `요원 ${userName}`;

  const renderHotspots = () => {
    const scene = currentChapter?.scene;
    const clues = gameState.foundClues;

    const click = (id) => (e) => {
      e.stopPropagation();
      if (currentDialogue) { advanceDialogue(); } else { handleClueClick(id); }
    };
    const getClueProp = (id, prop) => CLUES_DATA[scene]?.find(c => c.id === id)?.[prop];
    const generateClueItem = (id, idx, icon, glowColor, title) => {
      const isFound = clues.includes(id);
      const disableClick = isFound && !clearDate;
      const positions = [{ top: '25%', left: '20%' }, { top: '50%', left: '60%' }, { top: '65%', left: '30%' }];
      return (
        <div
          key={id}
          className={`absolute flex flex-col items-center justify-center transition-all duration-300
            ${disableClick ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer hover:scale-110'}
            ${isFound && clearDate ? 'opacity-90 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]' : ''}`}
          style={positions[idx % 3]}
          onClick={click(id)}
        >
          <RenaissanceBadge icon={icon} imgSrc={getClueProp(id, 'imgSrc')} glowColor={isFound && !clearDate ? "#333" : glowColor} />
          <span className={`mt-2 bg-[#0A0F1C]/90 px-3 py-1 rounded border text-xs font-bold shadow-lg ${isFound && !clearDate ? 'border-[#333] text-gray-500' : 'border-[#DFB8B6]/50 text-[#DFB8B6]'}`}>
            {title}
          </span>
          {isFound && <span className="absolute -top-3 bg-[#DFB8B6] text-black px-2 py-0.5 rounded text-[10px] font-black tracking-widest">SECURED</span>}
        </div>
      );
    };
    if (scene === 'scene_phase1') return (<>
      {generateClueItem('proc_inject',  0, Syringe,  "#FF3333", "프로세스 인젝션")}
      {generateClueItem('dll_sideload', 1, Package,  "#00E5FF", "DLL 사이드로딩")}
      {generateClueItem('unhook_ntdll', 2, Unlock,   "#DFB8B6", "NTDLL 언후킹")}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('amsi_scan',   0, Shield,  "#10B981", "AMSI 스캐너")}
      {generateClueItem('mem_patch',   1, Cpu,     "#FF6B6B", "메모리 패칭")}
      {generateClueItem('obfuscation', 2, Eye,     "#DFB8B6", "난독화 기법")}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('certutil_dl',    0, Download,  "#DFB8B6", "certutil 다운로드")}
      {generateClueItem('mshta_exec',     1, Play,      "#00E5FF", "mshta 실행")}
      {generateClueItem('rundll32_proxy', 2, RefreshCw, "#FF6B6B", "rundll32 프록시")}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('detection_rule', 0, FileCode,      "#00E5FF", "탐지 룰")}
      {generateClueItem('false_positive', 1, AlertTriangle, "#FF6B6B", "오탐 분석")}
      {generateClueItem('rule_lifecycle', 2, RotateCw,      "#10B981", "룰 생명주기")}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('hunt_hypothesis', 0, Search, "#DFB8B6", "사냥 가설")}
      {generateClueItem('ioc_sweep',       1, Radar,  "#00E5FF", "IOC 스윕")}
      {generateClueItem('ttp_mapping',     2, Map,    "#10B981", "TTP 매핑")}
    </>);
    return null;
  };

  return (
    <div className="w-full h-[500px] md:h-[650px] relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-[#0A0F1C] text-white">

      {/* ── CSS Animations ── */}
      <style>{`
        .renaissance-panel {
          background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px);
          border: 2px solid rgba(223, 184, 182, 0.4);
          box-shadow: inset 0 0 30px rgba(223, 184, 182, 0.1), 0 15px 50px rgba(0,0,0,0.8);
          border-radius: 16px;
        }
        .bg-pattern {
          background-color: #0A0F1C;
          background-image: radial-gradient(circle at 50% 50%, rgba(223, 184, 182, 0.05) 0%, transparent 60%),
                            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 0l30 15v30L30 60 0 45V15z' stroke='rgba(223, 184, 182, 0.05)' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E");
        }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25%, 75% { transform: translateX(-10px); } 50% { transform: translateX(10px); } }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        @keyframes suckIntoBag {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0; }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(10deg); filter: brightness(1.5); }
          50% { opacity: 1; transform: translate(50px, -100px) scale(0.8) rotate(45deg); }
          100% { transform: translate(150vw, -150vh) scale(0) rotate(180deg); opacity: 0; }
        }
        .absorb-anim { position: absolute; top: 50%; left: 50%; animation: suckIntoBag 1.2s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards; z-index: 100; pointer-events: none; }
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti-fall linear forwards; }
        @keyframes talk-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-talk { animation: talk-bounce 0.35s ease-in-out infinite; }
        .report-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .report-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
        .report-scroll::-webkit-scrollbar-thumb { background: rgba(223,184,182,0.3); border-radius: 4px; }
        .report-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,229,255,0.5); }
        .stamp-effect {
          display: inline-flex; flex-direction: column; align-items: center;
          padding: 12px 20px; border: 3px solid #DFB8B6; color: #DFB8B6;
          font-family: 'Courier New', Courier, monospace; font-weight: 900;
          text-transform: uppercase; border-radius: 8px; transform: rotate(-10deg);
          box-shadow: inset 0 0 0 2px rgba(223,184,182,0.2), 0 0 0 2px rgba(223,184,182,0.2);
          opacity: 0.9; position: relative; background: rgba(223,184,182,0.05);
        }
      `}</style>

      {/* 패턴 및 씬 배경 */}
      <div className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
        currentChapter?.scene === 'scene_phase1' ? "opacity-50" :
        currentChapter?.scene === 'scene_phase2' ? "opacity-60" : "opacity-40"
      } mix-blend-screen`}
        style={{
          backgroundImage: currentChapter?.scene === 'scene_phase1'
            ? "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000')"
            : currentChapter?.scene === 'scene_phase2'
            ? "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000')"
            : "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=1000')"
        }}
      />

      {/* Sector Progress Bar & Header Info */}
      <div className="absolute top-4 left-2 right-2 md:left-4 md:right-4 z-40 flex justify-between items-start pointer-events-none">
        <div className="bg-[#0A0F1C]/80 border border-[#DFB8B6]/50 px-2 md:px-4 py-1.5 md:py-2 rounded-lg backdrop-blur-sm shadow-lg pointer-events-auto max-w-[45%] md:max-w-none">
          <span className="text-[10px] md:text-xs font-bold text-[#DFB8B6] tracking-wider md:tracking-widest truncate block">{currentChapter?.loc}</span>
        </div>
        {/* 중앙 Sector 진행바 */}
        <div className="hidden md:flex flex-col w-1/3 max-w-[300px] mx-4 pointer-events-auto">
          <div className="flex justify-between w-full text-[10px] md:text-xs font-bold text-[#DFB8B6] mb-1.5 tracking-widest uppercase drop-shadow-md">
            <span>SECTOR PROGRESS {clearDate && <span className="text-[#00E5FF] ml-2 animate-pulse">(자유 탐색 모드)</span>}</span>
            <span className="text-[#00E5FF]">SEC 0{currentSector} / 0{totalSectors}</span>
          </div>
          <div className="flex gap-1.5 w-full h-2">
            {[1, 2, 3, 4, 5].map((sec) => {
              const isCompleted = clearDate || sec < currentSector;
              const isActive = sec === currentSector;
              return (
                <div
                  key={sec}
                  onClick={() => handleSectorJump(sec)}
                  className={`flex-1 rounded-full overflow-hidden border border-[#DFB8B6]/30 transition-all duration-500
                    ${clearDate ? 'cursor-pointer hover:bg-[#DFB8B6] hover:shadow-[0_0_10px_#DFB8B6]' : ''}
                    ${isActive ? 'bg-gradient-to-r from-[#DFB8B6] to-[#00E5FF] animate-pulse shadow-[0_0_12px_rgba(0,229,255,0.8)] scale-y-125' :
                      isCompleted ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] opacity-80' : 'bg-[#0A0F1C]'
                    }`}
                />
              );
            })}
          </div>
        </div>
        {/* 우측 네비게이션 */}
        <div className="flex flex-col gap-2 pointer-events-auto max-w-[45%] md:max-w-none">
          <div className="flex items-center gap-1.5 md:gap-2 bg-[#0A0F1C]/80 border border-[#00E5FF]/50 px-2 md:px-4 py-1.5 md:py-2 rounded-lg backdrop-blur-sm shadow-lg cursor-pointer hover:bg-white/10" onClick={() => setShowInventory(true)}>
            <span className="text-[10px] md:text-xs font-bold text-[#00E5FF] whitespace-nowrap">확보율</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-3 md:w-4 h-2.5 md:h-3 rounded-sm border transition-all duration-300 ${i < phaseCount ? 'bg-[#00E5FF] border-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'border-[#00E5FF]/30'}`} />
              ))}
            </div>
          </div>
          {clearDate && !gameState.showBook && (
            <div className="flex items-center justify-center gap-2 bg-[#0A0F1C]/80 border border-[#DFB8B6]/50 px-3 py-2 rounded-lg backdrop-blur-sm shadow-[0_0_10px_rgba(223,184,182,0.3)] cursor-pointer hover:bg-[#DFB8B6]/20 transition-all"
              onClick={() => { setActiveReportTab(0); setGameState(prev => ({ ...prev, showBook: true })); }}>
              <ShieldCheck size={14} className="text-[#DFB8B6]" />
              <span className="text-xs font-bold text-[#DFB8B6]">수료 보고서</span>
            </div>
          )}
        </div>
      </div>

      {/* 모바일용 중앙 Sector 진행바 */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-2/3 md:hidden z-40 pointer-events-auto">
        <div className="flex gap-1 w-full h-1.5">
          {[1, 2, 3, 4, 5].map((sec) => {
            const isCompleted = clearDate || sec < currentSector;
            const isActive = sec === currentSector;
            return (
              <div
                key={sec}
                onClick={() => handleSectorJump(sec)}
                className={`flex-1 rounded-full overflow-hidden border border-[#DFB8B6]/30
                  ${clearDate ? 'cursor-pointer' : ''}
                  ${isActive ? 'bg-[#DFB8B6] animate-pulse' : isCompleted ? 'bg-[#00E5FF]' : 'bg-[#0A0F1C]'}`}
              />
            );
          })}
        </div>
      </div>

      {/* 클릭 가능 캔버스 영역 */}
      <div className="absolute inset-0 z-10" onClick={handleBgClick}>
        {!showPuzzle && !gameState.showBook && !showInventory && renderHotspots()}
      </div>

      {/* 힌트 말풍선 (백곰 팀장) */}
      <AnimatePresence>
        {showHint && !showInventory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-24 md:top-20 right-6 bg-[#0A0F1C]/95 border-2 border-[#DFB8B6] p-4 rounded-xl shadow-2xl z-20 max-w-[260px] backdrop-blur-lg pointer-events-none"
          >
            <div className="flex items-center gap-3 mb-3 border-b border-[#DFB8B6]/30 pb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-[#DFB8B6] shadow-inner overflow-hidden relative bg-[#0F172A]">
                <svg viewBox="15 15 70 70" fill="none" className="absolute w-[130%] h-[130%] top-[-5px]">
                  <circle cx="25" cy="25" r="10" fill="#F8FAFC" />
                  <circle cx="25" cy="25" r="5" fill="#E2E8F0" />
                  <circle cx="75" cy="25" r="10" fill="#F8FAFC" />
                  <circle cx="75" cy="25" r="5" fill="#E2E8F0" />
                  <circle cx="50" cy="48" r="28" fill="#F8FAFC" />
                  <circle cx="50" cy="58" r="15" fill="#FFFFFF" />
                  <ellipse cx="50" cy="53" rx="8" ry="5.5" fill="#0F172A" />
                  <circle cx="38" cy="42" r="4.5" fill="#0F172A" />
                  <circle cx="62" cy="42" r="4.5" fill="#0F172A" />
                  <path d="M 44 62 Q 50 68 56 62" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-[#DFB8B6] tracking-widest">팀장 {companyName}</span>
            </div>
            <p dangerouslySetInnerHTML={{ __html: currentChapter?.hint || '' }} className="text-sm font-medium text-gray-200 leading-relaxed"></p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 대화창 패널 */}
      <AnimatePresence>
        {(!cluePopupId && currentDialogue && !showPuzzle && !gameState.showBook && !showInventory) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none flex flex-col md:flex-row items-end gap-2 md:gap-4"
          >
            {/* 캐릭터 SVG 아바타 */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 ml-2 md:ml-0 mb-[-5px] z-10 flex items-end drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
              {/* 안경 쓴 수달/원숭이 (요원) */}
              <div className={`absolute w-full h-full bottom-0 left-[-10px] transition-all duration-300 origin-bottom ${currentDialogue.speaker === 'AGENT_NAME' ? 'z-20 scale-110 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]' : 'z-10 scale-90 brightness-50 opacity-70'}`}>
                <div className={`w-full h-full ${currentDialogue.speaker === 'AGENT_NAME' && gameState.isTyping ? 'animate-talk' : ''}`}>
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                    <path d="M 28 100 C 28 55, 72 55, 72 100" fill="#8B5A2B" />
                    <path d="M 36 100 C 36 65, 64 65, 64 100" fill="#D2B48C" />
                    <path d="M 25 70 Q 50 55 75 70 Q 50 85 25 70 Z" fill="#065F46" />
                    <path d="M 35 70 L 45 95 L 55 75 Z" fill="#10B981" />
                    <circle cx="22" cy="38" r="10" fill="#8B5A2B" />
                    <circle cx="22" cy="38" r="5" fill="#D2B48C" />
                    <circle cx="78" cy="38" r="10" fill="#8B5A2B" />
                    <circle cx="78" cy="38" r="5" fill="#D2B48C" />
                    <circle cx="50" cy="48" r="25" fill="#8B5A2B" />
                    <ellipse cx="50" cy="58" rx="15" ry="11" fill="#D2B48C" />
                    <ellipse cx="50" cy="52" rx="6" ry="4" fill="#1A0B05" />
                    <circle cx="39" cy="43" r="4" fill="#1A0B05" />
                    <circle cx="61" cy="43" r="4" fill="#1A0B05" />
                    <path d="M 44 60 Q 50 65 56 60" stroke="#1A0B05" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <circle cx="39" cy="43" r="9" stroke="#00E5FF" strokeWidth="2.5" fill="rgba(0,229,255,0.1)" />
                    <circle cx="61" cy="43" r="9" stroke="#00E5FF" strokeWidth="2.5" fill="rgba(0,229,255,0.1)" />
                    <line x1="48" y1="43" x2="52" y2="43" stroke="#00E5FF" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
              {/* 백곰 (팀장) */}
              <div className={`absolute w-full h-full bottom-0 left-[30px] md:left-[50px] transition-all duration-300 origin-bottom ${currentDialogue.speaker === 'TEAM_LEADER' ? 'z-20 scale-110 drop-shadow-[0_0_20px_rgba(223,184,182,0.5)]' : 'z-10 scale-90 brightness-50 opacity-70'}`}>
                <div className={`w-full h-full ${currentDialogue.speaker === 'TEAM_LEADER' && gameState.isTyping ? 'animate-talk' : ''}`}>
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                    <path d="M 20 100 C 20 50, 80 50, 80 100" fill="#F8FAFC" />
                    <path d="M 35 100 C 35 60, 65 60, 65 100" fill="#FFFFFF" />
                    <path d="M 45 75 L 55 75 L 50 100 Z" fill="#94A3B8" />
                    <circle cx="25" cy="25" r="10" fill="#F8FAFC" />
                    <circle cx="25" cy="25" r="5" fill="#E2E8F0" />
                    <circle cx="75" cy="25" r="10" fill="#F8FAFC" />
                    <circle cx="75" cy="25" r="5" fill="#E2E8F0" />
                    <circle cx="50" cy="48" r="28" fill="#F8FAFC" />
                    <circle cx="50" cy="58" r="15" fill="#FFFFFF" />
                    <ellipse cx="50" cy="53" rx="8" ry="5.5" fill="#0F172A" />
                    <circle cx="38" cy="42" r="4.5" fill="#0F172A" />
                    <circle cx="62" cy="42" r="4.5" fill="#0F172A" />
                    <path d="M 44 62 Q 50 68 56 62" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="bg-[#0A0F1C]/95 border-2 border-[#DFB8B6]/60 rounded-xl p-5 md:p-6 backdrop-blur-lg shadow-2xl relative pointer-events-auto flex-1 w-full"
              onClick={advanceDialogue}
            >
              <div className={`absolute -top-4 left-6 px-4 py-1 font-bold rounded-lg text-sm tracking-widest border-2 ${currentDialogue.speaker === 'TEAM_LEADER' ? 'bg-[#0A0F1C] border-[#DFB8B6] text-[#DFB8B6]' : 'bg-[#0A0F1C] border-[#00E5FF] text-[#00E5FF]'}`}>
                {currentSpeakerName}
              </div>
              <p className="text-[15px] md:text-lg text-[#FDF5E6] mt-2 font-medium leading-relaxed min-h-[60px] break-keep pr-8">{typedText}</p>
              <div className="absolute bottom-4 right-4 animate-pulse text-[#DFB8B6] flex items-center gap-1">
                <span className="text-xs tracking-widest hidden md:inline">{clearDate ? '다음' : '진행'}</span>
                <ChevronRight size={24}/>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 단서 상세 팝업 */}
      <AnimatePresence>
        {activeClueObj && !showInventory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          >
            <div className="bg-[#0A0F1C] border-2 border-[#DFB8B6] w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    {(() => {
                      const IconComp = activeClueObj.icon;
                      return activeClueObj.imgSrc
                        ? <img src={activeClueObj.imgSrc} className="w-8 h-8 object-contain" alt={activeClueObj.title} />
                        : (IconComp && <IconComp size={32} className="text-[#00E5FF]" />);
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-[#DFB8B6]">{activeClueObj.title}</h3>
                </div>
                <button onClick={closeCluePopup} className="text-gray-400 hover:text-white cursor-pointer"><X size={24}/></button>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 bg-black/40 p-4 rounded-lg">{activeClueObj.msg}</p>
              <RoseGoldButton onClick={closeCluePopup} className="w-full !py-3">
                {clearDate ? '창 닫기' : '데이터 저장하기'}
              </RoseGoldButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 퍼즐 모달 */}
      <AnimatePresence>
        {showPuzzle > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 md:p-4 pointer-events-auto overflow-y-auto"
          >
            <div className={`w-full max-w-2xl bg-[#0A0F1C] border-2 border-[#DFB8B6] rounded-2xl overflow-hidden shadow-2xl ${puzzleStatus === 'wrong' ? 'animate-shake border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.4)]' : ''}`}>
              <div className="bg-gray-900 border-b border-gray-800 p-3 md:p-6 text-center">
                <h2 className="text-lg md:text-3xl font-black text-[#00E5FF] tracking-widest">{PUZZLES[showPuzzle].title}</h2>
              </div>
              <div className="p-3 md:p-8">
                <p className="text-sm md:text-lg text-gray-200 mb-4 md:mb-8 text-center leading-relaxed break-keep"
                  dangerouslySetInnerHTML={{ __html: PUZZLES[showPuzzle].desc }}></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  {PUZZLES[showPuzzle].options.map((opt, idx) => (
                    <RoseGoldButton
                      key={idx}
                      onClick={() => handlePuzzleSelect(idx)}
                      disabled={successMsg !== ""}
                      className={`!py-2.5 md:!py-4 !px-3 md:!px-4 !justify-start !text-xs md:!text-sm ${puzzleStatus === 'wrong' ? '!border-red-500 !text-red-400' : ''}`}
                    >
                      <span className="font-bold mr-2 md:mr-3 text-[#00E5FF] bg-gray-900 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs">{String.fromCharCode(65 + idx)}</span> {opt}
                    </RoseGoldButton>
                  ))}
                </div>
              </div>
            </div>
            {puzzleStatus === 'wrong' && <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(255,0,0,0.8)]" />}
            {puzzleStatus === 'correct' && <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,229,255,0.6)]" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 최종 보고서 모달 */}
      <AnimatePresence>
        {gameState.showBook && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[90] bg-black/95 backdrop-blur-md flex items-center justify-center p-1 pointer-events-auto overflow-hidden"
          >
            <div className="w-full h-full flex flex-col md:flex-row bg-[#0A0F1C] border border-[#DFB8B6]/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
              {clearDate && (
                <button
                  onClick={() => setGameState(prev => ({ ...prev, showBook: false }))}
                  className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full border border-gray-600 hover:border-[#DFB8B6] transition-colors cursor-pointer"
                >
                  <X size={24} />
                </button>
              )}
              {/* Sidebar */}
              <div className="w-full md:w-[220px] shrink-0 border-b md:border-b-0 md:border-r border-[#DFB8B6]/30 bg-[#121826] flex flex-col">
                <div className="px-4 py-3 border-b border-[#DFB8B6]/20 flex items-center gap-2 bg-[#0A0F1C]">
                  <ShieldCheck size={22} className="text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)] shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-[#DFB8B6] tracking-wider">분석 리포트</h2>
                    <div className="text-[9px] text-[#00E5FF] tracking-widest font-mono">ADVANCED DEBRIEFING</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-row md:flex-col p-2 gap-1 overflow-x-auto md:overflow-x-hidden report-scroll">
                  {[
                    "1. EDR 우회와 인젝션",
                    "2. AMSI와 메모리 공격",
                    "3. LOLBins 악용",
                    "4. Detection Engineering",
                    "5. Threat Hunting",
                    "6. 최종 훈련 수료"
                  ].map((tabName, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveReportTab(idx)}
                      className={`text-left px-3 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap md:whitespace-normal shrink-0 border border-transparent cursor-pointer ${activeReportTab === idx ? 'bg-[#DFB8B6]/10 border-[#DFB8B6]/50 text-[#00E5FF] shadow-[inset_3px_0_0_#00E5FF]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      {tabName}
                    </button>
                  ))}
                </div>
              </div>
              {/* Main Content */}
              <div className="w-full md:w-2/3 flex flex-col bg-pattern relative">
                <div className="flex-1 p-4 md:p-6 overflow-y-auto report-scroll relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeReportTab}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                      className="h-full flex flex-col"
                    >
                      {activeReportTab === 0 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">EDR 우회와 프로세스 인젝션</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 1. 프로세스 인젝션 기법들</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>정상 프로세스(svchost.exe, explorer.exe)의 메모리에 <span className="text-white bg-white/10 px-1 rounded">셸코드를 주입</span>하여 EDR 탐지를 우회합니다.</li>
                                <li>Classic Injection, Process Hollowing, APC Injection 등 다양한 변종이 존재합니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 2. DLL 사이드로딩과 NTDLL 언후킹</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>정상 애플리케이션의 DLL 로딩 순서를 악용하여 <span className="text-white bg-white/10 px-1 rounded">악성 DLL을 대신 로드</span>시킵니다.</li>
                                <li>EDR이 ntdll.dll에 설치한 후킹을 제거하여 시스템 콜 모니터링을 무력화합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 1 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">AMSI와 메모리 공격</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 3. AMSI 구조와 동작 원리</strong>
                              <p>Windows <span className="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span>는 PowerShell, VBScript 등의 스크립트 실행 전 보안 제품에 콘텐츠를 전달하는 인터페이스입니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 4. AMSI 바이패스 기법</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>AmsiScanBuffer 함수의 <span className="text-white bg-white/10 px-1 rounded">메모리를 직접 패칭</span>하여 항상 CLEAN 결과를 반환하게 만듭니다.</li>
                                <li>Base64, XOR, 문자열 분할 등 다중 난독화를 결합하여 시그니처 탐지를 회피합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 2 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">LOLBins 악용</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 5. certutil과 mshta</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">certutil -urlcache</span>로 외부 악성 페이로드를 다운로드합니다.</li>
                                <li>mshta.exe로 HTA 파일이나 인라인 JavaScript를 실행하여 초기 코드를 구동합니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 6. Living off the Land 전략</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">rundll32.exe</span>를 프록시로 사용하여 악성 DLL의 export 함수를 실행합니다.</li>
                                <li>모든 LOLBin은 Microsoft 서명 바이너리이므로, 전통적 백신의 화이트리스트를 악용합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 3 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">Detection Engineering</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 7. 탐지 룰 작성</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">Sigma, YARA, Snort</span> 등의 형식으로 공격 행위 패턴을 정의합니다.</li>
                                <li>ATT&CK TTP 기반으로 탐지 커버리지를 체계적으로 매핑합니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 8. 오탐 관리와 룰 튜닝</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>False Positive를 분석하고 <span className="text-white bg-white/10 px-1 rounded">룰의 정밀도를 향상</span>시키는 반복적 튜닝 과정을 수행합니다.</li>
                                <li>룰 생명주기: 작성 → 테스트 → 배포 → 모니터링 → 피드백 → 개선의 순환을 관리합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 4 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">Threat Hunting</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 9. 가설 기반 위협 사냥</strong>
                              <p>'비정상 자식 프로세스 생성이 존재할 것이다'와 같은 <span className="text-white bg-white/10 px-1 rounded">가설을 수립</span>하고, 로그와 텔레메트리를 분석하여 능동적으로 위협을 추적합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 10. IOC 스윕과 TTP 매핑</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>IOC(침해 지표)를 기반으로 엔드포인트, 네트워크, 로그를 <span className="text-white bg-white/10 px-1 rounded">체계적으로 스윕</span>합니다.</li>
                                <li>발견된 공격 행위를 MITRE ATT&CK에 매핑하여 공격자의 전술 패턴을 분석합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 5 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10 relative">
                          {clearDate && (
                            <div className="stamp-effect absolute top-0 right-0 z-10 hidden md:inline-flex opacity-80">
                              <div className="text-sm tracking-widest border-b border-[#DFB8B6] pb-1 mb-1 text-[#DFB8B6]">VERIFIED SECURE</div>
                              <div className="text-lg tracking-wider text-[#00E5FF] font-mono">{clearDate.split(' ')[0]}</div>
                            </div>
                          )}
                          <h1 className="text-2xl md:text-3xl text-[#DFB8B6] font-black mb-3 drop-shadow-[0_0_15px_rgba(223,184,182,0.4)]">훈련 수료 완료!</h1>
                          <p className="text-sm md:text-base text-gray-300 mb-4 leading-relaxed break-keep">
                            EDR 우회부터 Threat Hunting까지,<br/>고급 스피어피싱 공방 과정을<br/>모두 훌륭히 마쳤습니다.
                          </p>
                          <p className="text-base md:text-xl text-gray-400 mb-6 flex items-center gap-3 z-20">
                            최종 등급: <span className="text-[#00E5FF] text-5xl md:text-6xl font-black drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]">S</span>
                          </p>
                          <button
                            onClick={() => { if (onFinish) onFinish(); resetGame(); }}
                            className="w-full max-w-md relative overflow-hidden inline-flex items-center justify-center font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] tracking-wide text-lg md:text-xl border-2 border-[#00E5FF] bg-[#0A0F1C] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0A0F1C] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] whitespace-nowrap z-20 cursor-pointer"
                          >
                            실습 랩으로 이동하기
                          </button>
                          <div className="text-gray-500 mt-6 text-sm font-medium animate-pulse">
                            (창을 닫으면 각 구역을 자유롭게 재탐색할 수 있습니다)
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Bottom Navigation for Tabs */}
                <div className="px-4 py-2 bg-[#0A0F1C]/80 border-t border-[#DFB8B6]/30 flex justify-between items-center z-10 mt-auto shrink-0">
                  <button
                    onClick={() => setActiveReportTab(prev => Math.max(0, prev - 1))}
                    disabled={activeReportTab === 0}
                    className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-[#DFB8B6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    ◀ 이전
                  </button>
                  <div className="flex gap-2">
                    {[0,1,2,3,4,5].map(idx => (
                      <div key={idx} className={`h-2 rounded-full transition-all ${activeReportTab === idx ? 'bg-[#00E5FF] w-6 shadow-[0_0_8px_#00E5FF]' : 'bg-gray-600 w-2'}`} />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveReportTab(prev => Math.min(5, prev + 1))}
                    disabled={activeReportTab === 5}
                    className="px-4 py-2 text-sm font-bold text-[#00E5FF] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    다음 ▶
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인벤토리 오버레이 */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 pointer-events-auto overflow-hidden"
          >
            <div className="renaissance-panel w-full h-full flex flex-col overflow-hidden">
              {/* 헤더 */}
              <div className="shrink-0 flex justify-between items-center px-4 py-3 border-b border-[#DFB8B6]/30">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-[#00E5FF]" size={20} />
                  <h2 className="text-base font-bold text-[#DFB8B6]">수집 데이터 (Inventory)</h2>
                </div>
                <button onClick={() => setShowInventory(false)} className="p-1.5 hover:bg-white/10 rounded-full text-[#DFB8B6] transition-colors cursor-pointer shrink-0"><X size={22}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gameState.foundClues.map(clueId => {
                    const clue = Object.values(CLUES_DATA).flat().find(c => c.id === clueId);
                    if (!clue) return null;
                    const IconComponent = clue.icon;
                    return (
                      <div key={clueId} className="bg-white/5 border border-[#DFB8B6]/30 p-3 rounded-xl flex items-start gap-3 hover:bg-white/10 transition-colors">
                        <div className="p-2 bg-[#DFB8B6]/20 rounded-lg text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)] shrink-0">
                          {clue.imgSrc
                            ? <img src={clue.imgSrc} alt="clue" className="w-5 h-5 object-contain" />
                            : (IconComponent && <IconComponent size={18} />)
                          }
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm mb-0.5">{clue.title}</h3>
                          <p className="text-xs text-gray-300 leading-relaxed break-keep">{clue.msg}</p>
                        </div>
                      </div>
                    );
                  })}
                  {gameState.foundClues.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500 font-bold border-2 border-dashed border-gray-700 rounded-xl">
                      아직 수집된 단서가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 성공 메세지 플로팅 */}
      {successMsg && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-black text-[#00E5FF] drop-shadow-[0_0_30px_#00E5FF] tracking-widest animate-pulse">{successMsg}</h1>
        </div>
      )}
    </div>
  );
}

export default InteractiveGameCanvas;

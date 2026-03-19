import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Key, Swords, Shield, FileText,
  ChevronRight, X, Database, Terminal, Briefcase,
  Bug, Code, Package, Rss, Map, Link,
  RefreshCw, Clipboard, Crosshair
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
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Expert)
// ──────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    scene: 'scene_phase1', loc: 'Sector 1: 퍼플팀 지휘실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "어험! {AGENT} 요원, 오늘의 임무는 최상위 수준이다. 퍼플팀 운영 체계를 점검하고 레드팀과 블루팀의 협업 구조를 분석해라." },
      { speaker: 'AGENT_NAME', text: "네, 팀장님! 레드팀이 실제 공격자 TTP를 재현하고, 블루팀이 탐지·대응을 검증하는 구조가 보입니다." },
      { speaker: 'TEAM_LEADER', text: "좋다. 퍼플팀은 양측의 결과를 통합 분석하여 보안 갭을 메우지. 지휘실에서 핵심 단서 3개를 수집해라!" }
    ],
    hint: "레드팀의 공격 무기(크로스헤어), 블루팀의 방패, <br>그리고 퍼플팀 통합 리포트를 찾아라."
  },
  {
    scene: 'scene_phase1', loc: 'Sector 1: 퍼플팀 지휘실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "확인 완료! 레드팀의 공격 시뮬레이션 결과와 블루팀의 탐지 로그, 그리고 통합 분석 리포트를 모두 확보했습니다." },
      { speaker: 'TEAM_LEADER', text: "잘했다. 이 두 팀이 하나로 협력하여 보안을 강화하는 운영 모델의 명칭을 묻겠다." }
    ],
    triggerPuzzle: 1
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: CVE 분석실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "이제 실제 스피어피싱 첨부파일에 악용된 CVE를 분석할 차례다. CVE-2021-40444는 Office 문서를 통해 MSHTML 엔진을 악용한 치명적 제로데이였지." },
      { speaker: 'AGENT_NAME', text: "Word 문서를 열기만 해도 ActiveX 컨트롤을 통해 원격 코드가 실행되는 구조군요! CAB 파일로 페이로드를 전달하고 있습니다." },
      { speaker: 'TEAM_LEADER', text: "맞다. 이 공격 체인의 각 구성요소를 분석실에서 분리 추출해라. MSHTML 익스플로잇, ActiveX 컨트롤, CAB 페이로드를 모두 확보하라!" }
    ],
    hint: "MSHTML 엔진 취약점(버그), ActiveX 코드 컨트롤, <br>그리고 CAB 페이로드 패키지를 수집해라."
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: CVE 분석실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "익스플로잇 체인 분석 완료! 문서 오픈 → MSHTML 렌더링 → ActiveX 로드 → CAB 다운로드 → DLL 실행의 전체 과정을 재구성했습니다." },
      { speaker: 'TEAM_LEADER', text: "훌륭하다. 이 공격에서 핵심적으로 악용된 Internet Explorer 엔진 컴포넌트의 정확한 명칭을 대답해라." }
    ],
    triggerPuzzle: 2
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: 제로데이 연구소',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "제로데이 연구소에 도착했다. 여기서는 CVE-2022-30190(Follina)과 CVE-2023-23397(Outlook 권한 상승)을 동시에 분석한다." },
      { speaker: 'AGENT_NAME', text: "Follina는 ms-msdt: 프로토콜 핸들러를 악용해 MSDT를 트리거하고, Outlook CVE는 사용자 상호작용 없이 NTLM 해시를 탈취하는군요!" },
      { speaker: 'TEAM_LEADER', text: "두 취약점 모두 스피어피싱 첨부파일의 무기로 사용되었다. 연구소에서 Follina MSDT, Outlook NTLM, 제로데이 체인 증거를 확보해라!" }
    ],
    hint: "Follina의 MSDT 터미널, Outlook NTLM 키, <br>그리고 제로데이 공격 체인 링크를 수집해라."
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: 제로데이 연구소',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "두 CVE 모두 분석 완료! Follina는 진단 도구를 악용하고, Outlook CVE는 미리보기만으로도 NTLM 릴레이가 가능한 심각한 취약점입니다." },
      { speaker: 'TEAM_LEADER', text: "정확하다. CVE-2022-30190, 일명 Follina가 악용하는 Windows 진단 도구의 약자를 묻겠다." }
    ],
    triggerPuzzle: 3
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: CTI 센터',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "사이버 위협 인텔리전스(CTI) 센터다. 여기서 우리는 IOC(침해 지표)를 수집하고, TTP 기반으로 공격자 프로파일을 구축한다." },
      { speaker: 'AGENT_NAME', text: "STIX/TAXII 프로토콜로 위협 피드를 자동 수신하고, MITRE ATT&CK 매트릭스에 매핑하여 공격 패턴을 분류하고 있군요!" },
      { speaker: 'TEAM_LEADER', text: "좋다. CTI의 3대 핵심 자산을 확보해라 — 실시간 위협 피드, IOC 데이터베이스, 그리고 MITRE 매핑 체계를 수집하라!" }
    ],
    hint: "실시간 위협 피드(RSS), IOC 데이터베이스, <br>그리고 MITRE ATT&CK 매핑 맵을 찾아라."
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: CTI 센터',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "CTI 자산 확보 완료! 위협 피드에서 최신 IOC를 추출하고, ATT&CK 매트릭스에 T1566.001 스피어피싱 TTP를 정밀 매핑했습니다." },
      { speaker: 'TEAM_LEADER', text: "완벽하다. 공격자의 행동 패턴을 전술·기법·절차로 분류하는 이 프레임워크의 정확한 명칭을 대답해라." }
    ],
    triggerPuzzle: 4
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 전략 통합실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "모든 분석이 완료되었습니다, {LEADER}! 이제 제로데이 대응 전략과 조직 보안 복원력을 통합해야 합니다." },
      { speaker: 'TEAM_LEADER', text: "맞다. 패치 관리 체계를 강화하고, 사고 대응 계획을 수립하며, 조직의 사이버 복원력을 확보하는 것이 최종 목표다!" }
    ],
    hint: "패치 관리 시스템(새로고침), 사고 대응 계획서(클립보드), <br>그리고 복원력 강화 방패를 가동해라!"
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 전략 통합실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "조직의 사고 대응 절차를 사전 검증하기 위한 훈련 체계까지 수립 완료했습니다!" },
      { speaker: 'TEAM_LEADER', text: "마지막 질문이다. 조직의 보안 사고 대응 능력을 실전 투입 전에 사전 검증하는 훈련의 명칭을 묻겠다." }
    ],
    triggerPuzzle: 5
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 전략 통합실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "전략 통합 완료! 퍼플팀 운영, CVE 분석, CTI 체계, 조직 복원력까지 모든 시스템이 정상 가동됩니다." },
      { speaker: 'TEAM_LEADER', text: "수고했다, {AGENT}. 오늘 학습한 내용들을 최종 사건 수첩에 도장 찍어 두었으니 꼼꼼히 복습하도록." }
    ],
    triggerBook: true
  }
];

const CLUES_DATA = {
  scene_phase1: [
    { id: 'red_team',      icon: Crosshair, title: "레드팀 공격",       msg: "실제 공격자의 TTP(전술·기법·절차)를 모방하여 조직의 방어 체계를 실전적으로 테스트하는 공격 시뮬레이션 팀입니다." },
    { id: 'blue_team',     icon: Shield,    title: "블루팀 방어",       msg: "레드팀의 공격을 실시간으로 탐지·분석·대응하며, SIEM/EDR 등 방어 도구를 운용하는 보안 운영 팀입니다." },
    { id: 'purple_report', icon: FileText,  title: "퍼플팀 리포트",     msg: "레드팀의 공격 결과와 블루팀의 탐지 결과를 통합 분석하여 보안 갭을 식별하고 개선 방안을 도출하는 협업 보고서입니다." }
  ],
  scene_phase2: [
    { id: 'mshtml_exploit',  icon: Bug,     title: "MSHTML 익스플로잇", msg: "CVE-2021-40444: Office 문서 내 OLE 객체가 MSHTML(Trident) 엔진을 호출하여 원격 HTML을 렌더링하고, ActiveX를 통해 임의 코드를 실행하는 취약점입니다." },
    { id: 'activex_control', icon: Code,    title: "ActiveX 컨트롤",   msg: "MSHTML이 로드한 원격 HTML 페이지에서 ActiveX 컨트롤을 인스턴스화하여 로컬 파일 시스템에 접근하고 악성 DLL을 실행하는 공격 벡터입니다." },
    { id: 'cab_payload',     icon: Package, title: "CAB 페이로드",     msg: "공격자가 원격 서버에 호스팅한 CAB(Cabinet) 아카이브로, 내부에 악성 DLL을 포함하여 ActiveX를 통해 추출·실행되는 페이로드입니다." }
  ],
  scene_phase3: [
    { id: 'follina_msdt',  icon: Terminal, title: "Follina MSDT",     msg: "CVE-2022-30190: Word 문서의 원격 템플릿이 ms-msdt: URI 스킴을 호출하여 Microsoft Support Diagnostic Tool(MSDT)을 트리거하고 PowerShell 코드를 실행하는 제로데이입니다." },
    { id: 'outlook_ntlm',  icon: Key,      title: "Outlook NTLM",     msg: "CVE-2023-23397: 특수 조작된 캘린더 초대 메일이 Outlook에서 자동 처리될 때 공격자의 SMB 서버로 NTLM 인증 해시가 유출되는 권한 상승 취약점입니다." },
    { id: 'zero_day_chain', icon: Link,     title: "제로데이 체인",     msg: "여러 제로데이 취약점을 연쇄적으로 결합(chain)하여 단일 취약점으로는 불가능한 완전한 시스템 장악을 달성하는 고급 공격 기법입니다." }
  ],
  scene_phase4: [
    { id: 'threat_feed',   icon: Rss,      title: "위협 피드",         msg: "STIX/TAXII 프로토콜을 통해 전 세계 보안 커뮤니티와 실시간으로 공유되는 최신 위협 정보 스트림으로, IOC·악성 IP·해시값을 자동 수집합니다." },
    { id: 'ioc_database',  icon: Database, title: "IOC 데이터베이스",   msg: "침해 지표(Indicators of Compromise) — 악성 파일 해시, C2 도메인, IP 주소, 레지스트리 키 등을 체계적으로 저장·조회하는 위협 인텔리전스 DB입니다." },
    { id: 'mitre_mapping',  icon: Map,      title: "MITRE 매핑",       msg: "수집된 IOC와 공격 행위를 MITRE ATT&CK 매트릭스의 전술(Tactic)·기법(Technique)·절차(Procedure)에 정밀 매핑하여 공격자 프로파일을 구축합니다." }
  ],
  scene_phase5: [
    { id: 'patch_mgmt',    icon: RefreshCw,   title: "패치 관리",       msg: "제로데이 공개 후 벤더 패치 배포까지의 취약 기간(window of exposure)을 최소화하기 위한 자동화된 패치 관리 및 가상 패칭 체계입니다." },
    { id: 'incident_plan', icon: Clipboard,   title: "대응 계획",       msg: "NIST SP 800-61 기반 사고 대응 계획서로, 탐지·분석·격리·복구·사후 분석의 5단계 절차와 RACI 매트릭스를 정의합니다." },
    { id: 'resilience',    icon: ShieldCheck, title: "복원력 강화",     msg: "사이버 공격 후에도 핵심 업무를 지속할 수 있는 조직의 복원력(Cyber Resilience)으로, BCP/DRP와 테이블탑 연습을 포함합니다." }
  ]
};

const PUZZLES = {
  1: {
    title: "협업 운영 모델",
    desc: "공격팀(Red)과 방어팀(Blue)이 협력하여 보안을 강화하는 <b>통합 팀 운영 모델</b>은?",
    options: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    answer: 2
  },
  2: {
    title: "MSHTML 취약점",
    desc: "CVE-2021-40444에서 악용된 <b>Internet Explorer 엔진 컴포넌트</b>는?",
    options: ["MSHTML", "VBScript", "JScript", "Chakra"],
    answer: 0
  },
  3: {
    title: "Follina 진단 도구",
    desc: "CVE-2022-30190(Follina)이 악용하는 <b>Windows 진단 도구</b>는?",
    options: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    answer: 1
  },
  4: {
    title: "위협 분류 프레임워크",
    desc: "위협 인텔리전스에서 공격자의 행동 패턴을 <b>전술·기법·절차(TTP)로 분류하는 프레임워크</b>는?",
    options: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    answer: 2
  },
  5: {
    title: "사고 대응 사전 검증",
    desc: "조직의 보안 사고 대응 능력을 <b>실전 투입 전에 사전 검증하는 훈련</b>은?",
    options: ["모의해킹", "테이블탑 연습", "보안 감사", "컴플라이언스 검토"],
    answer: 1
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// [메인 교육 게임 컴포넌트]
// ──────────────────────────────────────────────────────────────────────────────
function InteractiveGameCanvas({ onFinish, userName, companyName }) {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem('t1566_expert_state');
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
  const [clearDate, setClearDate] = useState(() => localStorage.getItem('t1566_expert_clear'));
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
    localStorage.setItem('t1566_expert_state', JSON.stringify({
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

  // 보고서 모달 — 마우스 휠로 탭 전환 (위/아래 스크롤 → 이전/다음 탭)
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
            localStorage.setItem('t1566_expert_clear', dateStr);
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
    localStorage.removeItem('t1566_expert_state');
    localStorage.removeItem('t1566_expert_clear');
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
      {generateClueItem('red_team',      0, Crosshair, "#FF3333", "레드팀 공격")}
      {generateClueItem('blue_team',     1, Shield,    "#00E5FF", "블루팀 방어")}
      {generateClueItem('purple_report', 2, FileText,  "#DFB8B6", "퍼플팀 리포트")}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('mshtml_exploit',  0, Bug,     "#FF6B6B", "MSHTML 익스플로잇")}
      {generateClueItem('activex_control', 1, Code,    "#00E5FF", "ActiveX 컨트롤")}
      {generateClueItem('cab_payload',     2, Package, "#DFB8B6", "CAB 페이로드")}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('follina_msdt',   0, Terminal, "#FF3333", "Follina MSDT")}
      {generateClueItem('outlook_ntlm',   1, Key,      "#DFB8B6", "Outlook NTLM")}
      {generateClueItem('zero_day_chain', 2, Link,     "#10B981", "제로데이 체인")}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('threat_feed',   0, Rss,      "#FF6B6B", "위협 피드")}
      {generateClueItem('ioc_database',  1, Database, "#00E5FF", "IOC 데이터베이스")}
      {generateClueItem('mitre_mapping', 2, Map,      "#10B981", "MITRE 매핑")}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('patch_mgmt',    0, RefreshCw,   "#00E5FF", "패치 관리")}
      {generateClueItem('incident_plan', 1, Clipboard,   "#DFB8B6", "대응 계획")}
      {generateClueItem('resilience',    2, ShieldCheck, "#10B981", "복원력 강화")}
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
                    <div className="text-[9px] text-[#00E5FF] tracking-widest font-mono">SYSTEM DEBRIEFING</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-row md:flex-col p-2 gap-1 overflow-x-auto md:overflow-x-hidden report-scroll">
                  {[
                    "1. Purple Team 운영",
                    "2. CVE-2021-40444",
                    "3. Follina와 Outlook",
                    "4. 사이버 위협 인텔리전스",
                    "5. 전략적 보안 통합",
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
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">Purple Team 운영</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 1. Red/Blue 팀 역할 분담</strong>
                              <p><span className="text-white bg-white/10 px-1 rounded">레드팀</span>은 실제 APT 그룹의 TTP를 재현하여 조직의 방어 체계를 공격하고, <span className="text-white bg-white/10 px-1 rounded">블루팀</span>은 SIEM·EDR·NDR을 활용해 실시간 탐지와 대응을 수행합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 2. 퍼플팀 협업 보고서</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>퍼플팀은 레드팀의 공격 성공/실패 결과와 블루팀의 탐지율을 <span className="text-white bg-white/10 px-1 rounded">통합 분석</span>합니다.</li>
                                <li>보안 갭(Detection Gap)을 식별하고 MITRE ATT&CK 커버리지를 정량화하여 개선 로드맵을 수립합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 1 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">CVE-2021-40444 분석</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 3. MSHTML 취약점 메커니즘</strong>
                              <p>Office 문서 내 OLE 객체가 <span className="text-white bg-white/10 px-1 rounded">MSHTML(Trident) 엔진</span>을 호출하여 원격 HTML을 렌더링하고, ActiveX 컨트롤을 통해 로컬 시스템에서 임의 코드를 실행합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 4. ActiveX 악용 체인</strong>
                              <ol className="list-decimal pl-5 space-y-2 text-[#DFB8B6] font-bold">
                                <li>악성 .docx 문서 오픈 (스피어피싱 첨부)</li>
                                <li>MSHTML 엔진이 원격 HTML 로드</li>
                                <li>ActiveX 컨트롤이 CAB 아카이브 다운로드</li>
                                <li>CAB 내 악성 DLL 추출 및 실행</li>
                              </ol>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 2 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">Follina와 Outlook CVE</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 5. CVE-2022-30190 MSDT 악용</strong>
                              <p>Word 문서의 원격 템플릿이 <span className="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URI 스킴을 호출하여 Microsoft Support Diagnostic Tool을 트리거하고, PowerShell 코드를 실행하는 제로데이 공격입니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 6. CVE-2023-23397 NTLM 릴레이</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>특수 조작된 캘린더 초대 메일이 Outlook에서 <span className="text-white bg-white/10 px-1 rounded">사용자 상호작용 없이</span> 자동 처리됩니다.</li>
                                <li>공격자의 SMB 서버로 NTLM 인증 해시가 유출되어 권한 상승 및 횡적 이동이 가능해집니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 3 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">사이버 위협 인텔리전스</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 7. IOC 수집과 공유</strong>
                              <p><span className="text-white bg-white/10 px-1 rounded">STIX/TAXII</span> 프로토콜을 통해 악성 해시·C2 도메인·IP 등 침해 지표(IOC)를 자동 수집하고 보안 커뮤니티와 실시간으로 공유합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 8. TTP 기반 공격자 프로파일링</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>수집된 IOC를 <span className="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span> 매트릭스에 매핑하여 공격자의 전술·기법·절차를 분류합니다.</li>
                                <li>Diamond Model과 Kill Chain 분석을 결합하여 APT 그룹의 행동 프로파일을 구축합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 4 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">전략적 보안 통합</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 9. 제로데이 대응 전략</strong>
                              <p>벤더 패치 배포 전 <span className="text-white bg-white/10 px-1 rounded">가상 패칭(Virtual Patching)</span>과 마이크로세그멘테이션을 적용하여 취약 기간(Window of Exposure)을 최소화합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 10. 조직 사이버 복원력</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">테이블탑 연습</span>을 통해 사고 대응 절차를 사전 검증하고 RACI 매트릭스를 점검합니다.</li>
                                <li>BCP/DRP 체계를 수립하여 사이버 공격 후에도 핵심 업무 연속성을 보장합니다.</li>
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
                            퍼플팀 운영부터 CVE 분석, CTI 체계,<br/>조직 복원력까지 Expert 과정을<br/>모두 훌륭히 마쳤습니다.
                          </p>
                          <p className="text-base md:text-xl text-gray-400 mb-6 flex items-center gap-3 z-20">
                            최종 등급: <span className="text-[#00E5FF] text-5xl md:text-6xl font-black drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]">S</span>
                          </p>
                          <button
                            onClick={() => { if (onFinish) onFinish(); resetGame(); }}
                            className="w-full max-w-md relative overflow-hidden inline-flex items-center justify-center font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] tracking-wide text-lg md:text-xl border-2 border-[#00E5FF] bg-[#0A0F1C] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0A0F1C] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] whitespace-nowrap z-20 cursor-pointer"
                          >
                            실습 랩으로 이동하기 🚀
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
              {/* 헤더 - shrink-0으로 고정, 닫기 버튼 항상 표시 */}
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

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Activity, GitBranch, FileText, Code, Binary, Search,
  ChevronRight, X, Shield, Link, Mail, Route, Eye, Settings, Target,
  Briefcase
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
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Intermediate)
// ──────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    scene: 'scene_phase1', loc: 'Sector 1: Sysmon 관제실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "어험! {AGENT} 요원, 오늘은 한 단계 올라간 훈련이다. 스피어피싱 첨부파일이 실행되면 어떤 흔적이 남는지, Sysmon으로 추적하는 법을 배운다." },
      { speaker: 'AGENT_NAME', text: "Sysmon이요? Windows 이벤트 로그보다 더 정밀한 모니터링 도구라고 들었습니다!" },
      { speaker: 'TEAM_LEADER', text: "맞다. Sysmon은 프로세스 생성, 네트워크 연결, 파일 변경까지 세밀하게 기록하지. 관제실에서 핵심 이벤트 단서 3개를 수집해라!" }
    ],
    hint: "Sysmon 이벤트 모니터(Activity), 프로세스 트리(GitBranch), <br>그리고 이벤트 로그 파일(FileText)을 찾아 클릭하세요."
  },
  {
    scene: 'scene_phase1', loc: 'Sector 1: Sysmon 관제실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "수집 완료! Sysmon Event ID 1(프로세스 생성)으로 악성 첨부파일이 cmd.exe를 자식 프로세스로 생성한 흔적을 잡았습니다." },
      { speaker: 'TEAM_LEADER', text: "훌륭하다. 그렇다면 프로세스 생성을 실시간으로 기록하는 Sysmon 이벤트 ID가 몇 번인지 정확히 대답해 보아라." }
    ],
    triggerPuzzle: 1
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: 룰 엔진실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "Sysmon으로 흔적을 잡았으니, 이제 악성코드 자체를 탐지하는 룰 엔진실로 이동한다. 여기서 YARA 룰을 작성하는 법을 배운다." },
      { speaker: 'AGENT_NAME', text: "YARA요? 악성코드 바이너리 안에 숨어 있는 고유한 문자열이나 HEX 패턴을 잡아내는 도구죠!" },
      { speaker: 'TEAM_LEADER', text: "정확하다. YARA 룰은 meta, strings, condition 세 블록으로 구성되지. 룰 엔진실에서 핵심 단서를 수집해라!" }
    ],
    hint: "YARA 룰 편집기(Code), HEX 패턴 뷰어(Binary), <br>문자열 매칭 검색기(Search)를 찾아 클릭하세요."
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: 룰 엔진실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "YARA 룰 구조를 파악했습니다! strings 섹션에 악성코드 고유 문자열을 정의하고, condition으로 탐지 조건을 걸 수 있군요." },
      { speaker: 'TEAM_LEADER', text: "좋아. 그렇다면 악성코드의 바이너리 패턴을 탐지하는 이 룰 엔진의 이름을 정확히 말해 보아라." }
    ],
    triggerPuzzle: 2
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: SIEM 분석실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "YARA가 파일 단위 탐지라면, SIEM은 로그 단위 탐지다. 수천 대 장비에서 쏟아지는 로그를 한곳에 모아 상관분석하는 곳이지." },
      { speaker: 'AGENT_NAME', text: "그런데 SIEM 제품마다 쿼리 문법이 다르잖아요. Splunk는 SPL, Elastic은 KQL... 통일된 탐지 룰은 없나요?" },
      { speaker: 'TEAM_LEADER', text: "바로 Sigma가 그 역할을 한다! 벤더 중립 YAML 형식으로 한 번 작성하면 어떤 SIEM에서든 변환해 사용할 수 있지. 분석실에서 단서를 수집해라!" }
    ],
    hint: "Sigma 룰 편집기(Shield), SIEM 경보 패널(AlertTriangle), <br>상관분석 링크(Link)를 찾아 클릭하세요."
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: SIEM 분석실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "Sigma 룰로 '의심스러운 부모-자식 프로세스 관계'를 정의하니, Splunk와 Elastic 모두에서 동일한 탐지가 가능하군요!" },
      { speaker: 'TEAM_LEADER', text: "정확하다. 그렇다면 SIEM 시스템에서 사용하는 이 벤더 중립 탐지 룰 형식의 이름을 말해 보아라." }
    ],
    triggerPuzzle: 3
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: 포렌식 랩',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "탐지 룰을 갖췄으니, 이제 공격의 시작점을 역추적할 차례다. 스피어피싱은 이메일로 시작되니까, 이메일 헤더를 분석해야 한다." },
      { speaker: 'AGENT_NAME', text: "이메일 헤더에는 발신자, 수신자 외에도 이메일이 거쳐온 서버 경로가 기록되어 있죠?" },
      { speaker: 'TEAM_LEADER', text: "맞다. 특히 Received 헤더를 아래에서 위로 읽으면 최초 발신 서버를 특정할 수 있지. X-헤더에서 SPF, DKIM 검증 결과도 확인해야 한다. 포렌식 랩에서 단서를 수집해라!" }
    ],
    hint: "이메일 헤더 분석기(Mail), Received 체인 추적기(Route), <br>X-헤더 검증 뷰어(Eye)를 찾아 클릭하세요."
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: 포렌식 랩',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "Received 체인을 역추적해서 발신 서버 IP를 특정했습니다! SPF fail, DKIM none — 발신자 도메인이 위조된 스피어피싱이 확실합니다." },
      { speaker: 'TEAM_LEADER', text: "훌륭하다. 그렇다면 이메일이 거쳐온 서버 경로를 추적할 수 있는 헤더 필드의 이름을 정확히 대답해 보아라." }
    ],
    triggerPuzzle: 4
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 정책 배포실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "이제 마지막이다. 탐지와 분석을 마쳤으니, 조직 전체에 방어 정책을 배포해야 한다. GPO와 ASR, 그리고 3축 방어 모델을 학습한다." },
      { speaker: 'AGENT_NAME', text: "GPO로 그룹 정책을 일괄 배포하고, ASR로 Office 매크로 실행 같은 공격 표면을 줄이는 거죠?" },
      { speaker: 'TEAM_LEADER', text: "맞다. 그리고 3축 방어 모델 — 기술(Technology), 프로세스(Process), 인력(People) — 세 축이 균형을 이뤄야 진정한 방어가 완성된다. 정책 배포실의 단서를 마저 수집해라!" }
    ],
    hint: "GPO 정책 편집기(Settings), ASR 룰 패널(ShieldCheck), <br>3축 방어 모델 다이어그램(Target)을 찾아 클릭하세요."
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 정책 배포실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "GPO로 매크로 차단 정책을 전사 배포하고, ASR 룰로 의심스러운 자식 프로세스 생성을 원천 차단했습니다!" },
      { speaker: 'TEAM_LEADER', text: "좋다. 그렇다면 Office 매크로 실행을 차단하는 Windows 보안 정책의 이름을 정확히 말해 보아라." }
    ],
    triggerPuzzle: 5
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 정책 배포실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "모든 구역 탐색과 정책 배포가 완료되었습니다! Sysmon 관제부터 YARA/Sigma 탐지, 이메일 포렌식, 그리고 GPO/ASR 정책까지 체계적으로 학습했습니다." },
      { speaker: 'TEAM_LEADER', text: "수고했다, {AGENT}. 중급 과정을 훌륭히 마쳤군. 오늘 학습한 내용을 최종 사건 수첩에 정리해 두었으니 꼼꼼히 복습하도록." }
    ],
    triggerBook: true
  }
];

const CLUES_DATA = {
  scene_phase1: [
    { id: 'sysmon_evt',  icon: Activity,   title: "Sysmon 이벤트",    msg: "Sysmon(System Monitor)은 Windows 시스템에서 프로세스 생성(ID 1), 네트워크 연결(ID 3), 파일 생성(ID 11) 등을 세밀하게 기록하는 고급 모니터링 도구입니다." },
    { id: 'proc_tree',   icon: GitBranch,  title: "프로세스 트리",     msg: "부모-자식 프로세스 관계를 트리 형태로 시각화합니다. WINWORD.EXE → cmd.exe → powershell.exe 같은 의심스러운 체인을 탐지하는 핵심 기법입니다." },
    { id: 'event_log',   icon: FileText,   title: "이벤트 로그",      msg: "Windows 이벤트 뷰어에 기록되는 구조화된 로그입니다. Sysmon 채널(Microsoft-Windows-Sysmon/Operational)에서 보안 관련 이벤트를 필터링합니다." }
  ],
  scene_phase2: [
    { id: 'yara_rule',    icon: Code,    title: "YARA 룰",        msg: "악성코드의 고유 패턴을 정의하는 룰 엔진입니다. meta(메타정보), strings(탐지 문자열), condition(조건식) 세 블록으로 구성되어 파일 스캐닝에 사용됩니다." },
    { id: 'hex_pattern',  icon: Binary,  title: "HEX 패턴",       msg: "바이너리 파일 내부의 16진수 바이트 시퀀스입니다. YARA의 strings 섹션에 { 4D 5A 90 00 } 같은 HEX 패턴을 정의하여 PE 헤더 등을 탐지합니다." },
    { id: 'string_match', icon: Search,  title: "문자열 매칭",     msg: "악성코드가 사용하는 고유 문자열(C2 도메인, 레지스트리 키, API 호출명)을 YARA strings로 정의하여 정적 분석 없이 빠르게 탐지합니다." }
  ],
  scene_phase3: [
    { id: 'sigma_rule',   icon: Shield,         title: "Sigma 룰",     msg: "벤더 중립 YAML 형식의 탐지 룰입니다. 한 번 작성하면 sigmac 컴파일러로 Splunk SPL, Elastic KQL, Microsoft KQL 등으로 자동 변환할 수 있습니다." },
    { id: 'siem_alert',   icon: AlertTriangle,  title: "SIEM 경보",    msg: "SIEM(Security Information and Event Management)이 상관분석을 통해 생성하는 보안 경보입니다. 단일 이벤트가 아닌 복수 이벤트의 연관성을 분석합니다." },
    { id: 'correlation',  icon: Link,           title: "상관분석",     msg: "서로 다른 로그 소스(Sysmon, 방화벽, IDS)의 이벤트를 시간순으로 연결하여 공격 체인을 재구성하는 SIEM의 핵심 기능입니다." }
  ],
  scene_phase4: [
    { id: 'email_header',   icon: Mail,   title: "이메일 헤더",     msg: "이메일의 메타데이터입니다. From, To, Subject 외에도 Received, Message-ID, X-Mailer 등 발신 경로와 인증 정보가 포함되어 있습니다." },
    { id: 'received_chain', icon: Route,  title: "Received 체인",   msg: "이메일이 거쳐온 메일 서버(MTA)의 경로입니다. 아래에서 위로 읽으면 최초 발신 서버 → 중계 서버 → 최종 수신 서버 순서로 추적할 수 있습니다." },
    { id: 'x_header',       icon: Eye,    title: "X-헤더 분석",     msg: "X-Spam-Status, Authentication-Results 등 확장 헤더입니다. SPF pass/fail, DKIM 서명 검증 결과, DMARC 정책 적용 여부를 확인할 수 있습니다." }
  ],
  scene_phase5: [
    { id: 'gpo_policy',  icon: Settings,    title: "GPO 정책",     msg: "Group Policy Object — Active Directory를 통해 도메인 내 모든 컴퓨터에 보안 정책을 일괄 배포하는 Windows 관리 도구입니다." },
    { id: 'asr_rule',    icon: ShieldCheck,  title: "ASR 룰",      msg: "Attack Surface Reduction — Microsoft Defender의 공격 표면 축소 룰입니다. Office 매크로의 자식 프로세스 생성, 난독화 스크립트 실행 등을 원천 차단합니다." },
    { id: 'defense_axis', icon: Target,      title: "3축 방어",     msg: "기술(Technology), 프로세스(Process), 인력(People) — 이 세 축이 균형을 이뤄야 완전한 방어가 가능하다는 보안 프레임워크입니다." }
  ]
};

const PUZZLES = {
  1: {
    title: "Sysmon 이벤트 추적",
    desc: "<b>프로세스 생성</b>을 실시간으로 기록하는 Sysmon 이벤트 ID는?",
    options: ["Event ID 1", "Event ID 3", "Event ID 7", "Event ID 11"],
    answer: 0
  },
  2: {
    title: "바이너리 탐지 엔진",
    desc: "<b>악성코드의 바이너리 패턴</b>을 탐지하는 룰 엔진은?",
    options: ["Snort", "YARA", "Sigma", "Suricata"],
    answer: 1
  },
  3: {
    title: "벤더 중립 탐지 룰",
    desc: "SIEM 시스템에서 사용하는 <b>벤더 중립 탐지 룰 형식</b>은?",
    options: ["YARA", "Snort", "Sigma", "KQL"],
    answer: 2
  },
  4: {
    title: "이메일 경로 추적",
    desc: "이메일이 거쳐온 <b>서버 경로를 추적</b>할 수 있는 헤더 필드는?",
    options: ["Received", "From", "Reply-To", "Return-Path"],
    answer: 0
  },
  5: {
    title: "공격 표면 축소",
    desc: "<b>Office 매크로 실행을 차단</b>하는 Windows 보안 정책은?",
    options: ["UAC", "ASR", "BitLocker", "AppLocker"],
    answer: 1
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// [메인 교육 게임 컴포넌트]
// ──────────────────────────────────────────────────────────────────────────────
function InteractiveGameCanvas({ onFinish, userName, companyName }) {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem('t1566_intermediate_state');
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
  const [clearDate, setClearDate] = useState(() => localStorage.getItem('t1566_intermediate_clear'));
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
    localStorage.setItem('t1566_intermediate_state', JSON.stringify({
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
            localStorage.setItem('t1566_intermediate_clear', dateStr);
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
    localStorage.removeItem('t1566_intermediate_state');
    localStorage.removeItem('t1566_intermediate_clear');
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
      {generateClueItem('sysmon_evt',  0, Activity,   "#00E5FF", "Sysmon 이벤트")}
      {generateClueItem('proc_tree',   1, GitBranch,  "#10B981", "프로세스 트리")}
      {generateClueItem('event_log',   2, FileText,   "#DFB8B6", "이벤트 로그")}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('yara_rule',    0, Code,    "#DFB8B6", "YARA 룰")}
      {generateClueItem('hex_pattern',  1, Binary,  "#FF6B6B", "HEX 패턴")}
      {generateClueItem('string_match', 2, Search,  "#00E5FF", "문자열 매칭")}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('sigma_rule',   0, Shield,         "#10B981", "Sigma 룰")}
      {generateClueItem('siem_alert',   1, AlertTriangle,  "#FF6B6B", "SIEM 경보")}
      {generateClueItem('correlation',  2, Link,           "#DFB8B6", "상관분석")}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('email_header',   0, Mail,   "#DFB8B6", "이메일 헤더")}
      {generateClueItem('received_chain', 1, Route,  "#00E5FF", "Received 체인")}
      {generateClueItem('x_header',       2, Eye,    "#10B981", "X-헤더 분석")}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('gpo_policy',   0, Settings,    "#00E5FF", "GPO 정책")}
      {generateClueItem('asr_rule',     1, ShieldCheck,  "#10B981", "ASR 룰")}
      {generateClueItem('defense_axis', 2, Target,       "#DFB8B6", "3축 방어")}
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
                    "1. Sysmon과 프로세스 추적",
                    "2. YARA 탐지 룰",
                    "3. Sigma와 SIEM",
                    "4. 이메일 포렌식",
                    "5. 정책 기반 방어",
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
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">Sysmon과 프로세스 추적</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 1. Sysmon Event ID별 역할</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">Event ID 1</span> — 프로세스 생성. 어떤 프로그램이 실행되었는지, 부모 프로세스는 무엇인지 기록합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">Event ID 3</span> — 네트워크 연결. C2 서버와의 통신 시도를 탐지합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">Event ID 11</span> — 파일 생성. 드롭된 악성 페이로드를 추적합니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 2. 프로세스 트리 분석</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>WINWORD.EXE → cmd.exe → powershell.exe 같은 <span className="text-white bg-white/10 px-1 rounded">비정상 부모-자식 관계</span>가 스피어피싱의 전형적 흔적입니다.</li>
                                <li>정상적인 Office 프로세스는 자식 프로세스를 생성하지 않으므로, 이를 탐지 기준으로 삼습니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 1 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">YARA 탐지 룰</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 3. YARA 룰 구조 (meta/strings/condition)</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">meta</span> — 룰 작성자, 설명, 참조 URL 등 메타정보를 정의합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">strings</span> — 탐지할 문자열, HEX 패턴, 정규식을 정의합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">condition</span> — strings에서 정의한 패턴이 몇 개 이상 매칭되어야 탐지할지 조건을 설정합니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 4. HEX 패턴 매칭</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>PE 파일의 <span className="text-white bg-white/10 px-1 rounded">MZ 헤더(4D 5A)</span>나 악성 셸코드의 고유 바이트 시퀀스를 HEX 패턴으로 정의합니다.</li>
                                <li>와일드카드(??), 점프([2-4]), 대안(A|B) 등의 고급 패턴 문법으로 변종까지 탐지합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 2 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">Sigma와 SIEM</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 5. Sigma 룰 문법</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">YAML 형식</span>으로 작성하며, title, logsource, detection, condition 필드로 구성됩니다.</li>
                                <li>한 번 작성한 룰을 sigmac로 Splunk SPL, Elastic KQL, Microsoft Sentinel 등으로 <span className="text-white bg-white/10 px-1 rounded">자동 변환</span>할 수 있습니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 6. SIEM 상관분석</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>단일 이벤트가 아닌 <span className="text-white bg-white/10 px-1 rounded">복수 로그 소스</span>(Sysmon + 방화벽 + IDS)를 시간순으로 연결합니다.</li>
                                <li>이메일 수신 → 첨부파일 실행 → C2 통신 시도를 하나의 공격 체인으로 재구성하여 탐지합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 3 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">이메일 포렌식</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 7. 헤더 필드별 의미</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">From / Reply-To</span> — 발신자 주소. 위조가 가능하므로 단독으로 신뢰하면 안 됩니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">Message-ID / X-Mailer</span> — 메일 클라이언트와 고유 식별자. 대량 발송 도구 흔적을 탐지합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">Authentication-Results</span> — SPF, DKIM, DMARC 검증 결과를 확인하는 핵심 헤더입니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 8. Received 체인 역추적</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>Received 헤더를 <span className="text-white bg-white/10 px-1 rounded">아래에서 위로</span> 읽으면 최초 발신 서버 → 중계 서버 → 수신 서버 순서를 파악합니다.</li>
                                <li>발신 서버 IP를 WHOIS, VirusTotal로 조회하여 악성 인프라 여부를 확인합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 4 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">정책 기반 방어</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 9. GPO와 ASR</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">GPO(Group Policy Object)</span> — Active Directory를 통해 도메인 전체에 보안 정책을 일괄 배포합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">ASR(Attack Surface Reduction)</span> — Office 매크로의 자식 프로세스 생성, 난독화 스크립트 실행 등을 원천 차단합니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 10. 3축 방어 모델</strong>
                              <ol className="list-decimal pl-5 space-y-2 text-[#DFB8B6] font-bold">
                                <li>기술(Technology) — Sysmon, YARA, Sigma, ASR 등 기술적 탐지/차단 도구</li>
                                <li>프로세스(Process) — 인시던트 대응 절차, 패치 관리, 로그 보존 정책</li>
                                <li>인력(People) — 보안 인식 교육, 피싱 시뮬레이션, SOC 분석관 역량 강화</li>
                              </ol>
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
                            Sysmon 관제부터 YARA/Sigma 탐지 룰,<br/>이메일 포렌식, GPO/ASR 정책 배포까지<br/>중급 스피어피싱 방어 과정을 모두 마쳤습니다.
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
                    이전
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
                    다음
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

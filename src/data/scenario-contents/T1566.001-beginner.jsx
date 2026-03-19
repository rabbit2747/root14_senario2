import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Key, Server, Lock, Search,
  ChevronRight, X, Database, Terminal, Briefcase,
  FileText, Code, Globe, Wifi, Box, Shield, UserCheck
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
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Beginner)
// ──────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    scene: 'scene_phase1', loc: 'Sector 1: 메일 서버실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "어험! {AGENT} 요원, 오늘의 임무는 스피어피싱 공격의 전체 구조를 파헤치는 거다. 먼저 이메일이 어떻게 전송되는지부터 알아야 해." },
      { speaker: 'AGENT_NAME', text: "네, 팀장님! 여기가 메일 서버실이군요. SMTP 프로토콜이 이메일을 전송하는 핵심 통로라고 들었습니다." },
      { speaker: 'TEAM_LEADER', text: "맞다. 해커들은 이 SMTP 통로를 악용해서 악성 첨부파일이 담긴 메일을 보내지. 메일 전송 과정의 핵심 단서 3개를 수집해라!" }
    ],
    hint: "메일을 보내는 SMTP 서버, 중계하는 릴레이 서버, <br>그리고 통신에 사용되는 포트 번호를 찾아라."
  },
  {
    scene: 'scene_phase1', loc: 'Sector 1: 메일 서버실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "찾았습니다! 이메일은 SMTP 서버에서 출발해 여러 릴레이를 거쳐 수신자에게 도달하는군요." },
      { speaker: 'TEAM_LEADER', text: "잘했다. 이제 이 전송 과정에서 사용되는 핵심 프로토콜의 이름을 맞혀봐라." }
    ],
    triggerPuzzle: 1
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: 인증 검증소',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "이메일이 전송되는 길을 알았으니, 이제 '가짜 발신자'를 걸러내는 인증 체계를 살펴보자." },
      { speaker: 'AGENT_NAME', text: "발신자 주소를 위조하는 게 가능하다고요? 그럼 누가 보냈는지 어떻게 확인하죠?" },
      { speaker: 'TEAM_LEADER', text: "바로 SPF, DKIM, DMARC라는 세 겹의 인증 방패가 있어. 이 검증소에서 각 인증 기술의 단서를 확보해라!" }
    ],
    hint: "발신 IP를 검증하는 SPF 레코드, 디지털 서명을 확인하는 DKIM, <br>그리고 정책을 결정하는 DMARC를 찾아라."
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: 인증 검증소',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "스캔 완료! SPF는 발신 IP를, DKIM은 메일 내용의 무결성을, DMARC는 둘을 종합해서 판정하는군요." },
      { speaker: 'TEAM_LEADER', text: "정확하다. 그렇다면 발신 도메인의 IP를 검증하는 첫 번째 방패의 이름을 대답해 봐라." }
    ],
    triggerPuzzle: 2
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: 첨부파일 해부실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "인증을 통과하더라도 메일 '안에' 숨겨진 무기가 있다. 첨부파일의 내부 구조를 해부해 보자." },
      { speaker: 'AGENT_NAME', text: "이 해부실에 MIME 헤더와 Base64로 인코딩된 첨부파일, 그리고... 문서 안에 숨은 VBA 매크로가 보입니다!" },
      { speaker: 'TEAM_LEADER', text: "그래, 해커들은 Word나 Excel 문서에 악성 VBA 매크로를 심어서 보내지. 첨부파일의 구조를 낱낱이 파헤쳐라!" }
    ],
    hint: "이메일 구조를 정의하는 MIME 헤더, 문서에 숨겨진 VBA 매크로, <br>그리고 첨부파일을 변환하는 Base64 인코딩을 찾아라."
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: 첨부파일 해부실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "증거 확보했습니다! 매크로가 활성화되면 외부 서버에서 추가 악성코드를 다운로드하는 구조였어요." },
      { speaker: 'TEAM_LEADER', text: "바로 그거다. 문서 파일에 숨겨져 자동 실행되는 이 악성 스크립트의 정확한 이름을 맞혀라." }
    ],
    triggerPuzzle: 3
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: APT 추적실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "이제 이 무기를 실제로 사용하는 놈들의 정체를 밝혀야 한다. 국가 지원을 받는 APT 그룹들이지." },
      { speaker: 'AGENT_NAME', text: "APT28(러시아), Lazarus(북한)... 이들이 스피어피싱 첨부파일을 즐겨 사용하는 그룹이군요!" },
      { speaker: 'TEAM_LEADER', text: "놈들은 타겟의 업무 환경을 철저히 조사한 뒤 맞춤형 피싱 메일을 보내지. C2 채널까지 추적해서 단서를 확보해라!" }
    ],
    hint: "러시아의 APT28 정보, 북한의 Lazarus 흔적, <br>그리고 감염 후 명령을 받는 C2 채널을 찾아라."
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: APT 추적실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "추적 완료! 각 APT 그룹이 특정 산업과 국가를 겨냥해 정밀 타격하는 패턴을 포착했습니다." },
      { speaker: 'TEAM_LEADER', text: "좋다. SolarWinds 공급망 해킹의 배후로 지목된 러시아 APT 그룹의 이름을 정확히 대답해라." }
    ],
    triggerPuzzle: 4
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 방어 지휘소',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "적의 전술을 모두 파악했습니다. 이제 {LEADER}의 조직을 지킬 다층 방어 체계를 구축해야 합니다!" },
      { speaker: 'TEAM_LEADER', text: "그래, 메일 게이트웨이로 1차 필터링하고, 샌드박스에서 의심 파일을 안전하게 분석하며, 사용자 교육으로 최후의 방어선을 세워야 해!" }
    ],
    hint: "악성 메일을 걸러내는 메일 게이트웨이, 의심 파일을 분석하는 샌드박스, <br>그리고 사람의 판단력을 키우는 사용자 교육을 찾아라."
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 방어 지휘소',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "모든 방어 시스템 가동 완료! 게이트웨이, 샌드박스, 그리고 직원 교육까지 삼중 방어선이 작동합니다." },
      { speaker: 'TEAM_LEADER', text: "잠깐, 의심 파일을 안전한 가상 환경에서 실행·분석하는 기술의 이름을 마지막으로 확인하겠다." }
    ],
    triggerPuzzle: 5
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 방어 지휘소',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "완벽하다, {AGENT}. SMTP부터 인증, 매크로, APT, 그리고 다층 방어까지 스피어피싱의 모든 것을 꿰뚫었군." },
      { speaker: 'AGENT_NAME', text: "감사합니다, {LEADER}! 오늘 배운 내용을 사건 수첩에 정리해 두겠습니다." }
    ],
    triggerBook: true
  }
];

const CLUES_DATA = {
  scene_phase1: [
    { id: 'smtp_server',  icon: Server, title: "SMTP 서버",    msg: "Simple Mail Transfer Protocol — 이메일을 발신 측에서 수신 측 서버로 전달하는 핵심 프로토콜입니다. 포트 25(기본), 587(보안 전송)을 사용합니다." },
    { id: 'mail_relay',   icon: Globe,  title: "메일 중계",    msg: "이메일은 발신 MTA에서 수신 MTA까지 여러 중계(Relay) 서버를 거칩니다. 각 서버는 Received 헤더에 경유 기록을 남깁니다." },
    { id: 'port_25',      icon: Terminal, title: "포트 25/587", msg: "SMTP는 기본적으로 포트 25를 사용하고, STARTTLS 암호화 전송 시 포트 587을 사용합니다. 해커는 오픈 릴레이를 악용하기도 합니다." }
  ],
  scene_phase2: [
    { id: 'spf_record',   icon: ShieldCheck, title: "SPF 레코드",  msg: "Sender Policy Framework — 발신 도메인의 DNS에 등록된 허용 IP 목록과 실제 발신 IP를 대조하여 위조를 탐지합니다." },
    { id: 'dkim_sign',    icon: Key,          title: "DKIM 서명",   msg: "DomainKeys Identified Mail — 발신 서버가 메일에 디지털 서명을 추가하고, 수신 측이 DNS의 공개키로 무결성을 검증합니다." },
    { id: 'dmarc_policy', icon: Lock,         title: "DMARC 정책",  msg: "Domain-based Message Authentication — SPF와 DKIM 결과를 종합하여 reject/quarantine/none 정책을 적용하고, 보고서를 생성합니다." }
  ],
  scene_phase3: [
    { id: 'mime_header',   icon: FileText, title: "MIME 헤더",      msg: "Multipurpose Internet Mail Extensions — 이메일의 본문 유형, 첨부파일 경계(boundary), 인코딩 방식을 정의하는 구조입니다." },
    { id: 'vba_macro',     icon: Code,     title: "VBA 매크로",     msg: "Visual Basic for Applications — Word/Excel 문서에 내장되어 '콘텐츠 사용' 클릭 시 자동 실행되는 스크립트입니다. 해커가 가장 즐겨 사용하는 초기 침투 벡터 중 하나입니다." },
    { id: 'base64_encode', icon: Database, title: "Base64 인코딩",  msg: "바이너리 첨부파일을 텍스트로 변환하여 SMTP로 전송하는 인코딩 방식입니다. 악성 파일도 이 형태로 메일에 포함됩니다." }
  ],
  scene_phase4: [
    { id: 'apt28_intel',   icon: AlertTriangle, title: "APT28 정보",    msg: "러시아 GRU 소속 Fancy Bear. 정부·군사·언론 기관을 표적으로 스피어피싱 첨부파일(무기화된 문서)을 주로 사용합니다." },
    { id: 'lazarus_trace', icon: Search,         title: "Lazarus 흔적",  msg: "북한 정찰총국 연계 그룹. 금융기관과 암호화폐 거래소를 겨냥한 스피어피싱으로 수억 달러를 탈취한 이력이 있습니다." },
    { id: 'c2_channel',    icon: Wifi,           title: "C2 채널",       msg: "Command & Control — 매크로 실행 후 감염된 PC가 공격자의 서버와 통신하는 비밀 채널입니다. HTTP/HTTPS/DNS 등 정상 트래픽으로 위장합니다." }
  ],
  scene_phase5: [
    { id: 'mail_gateway',  icon: Shield,    title: "메일 게이트웨이", msg: "메일 서버 앞단에서 스팸, 피싱, 악성 첨부파일을 필터링하는 1차 방어선입니다. URL 재작성과 첨부파일 스캔을 수행합니다." },
    { id: 'sandbox_env',   icon: Box,       title: "샌드박스",       msg: "의심스러운 첨부파일을 격리된 가상 환경에서 실행하여 악성 행위(파일 생성, 레지스트리 변경, C2 통신)를 안전하게 관찰·분석합니다." },
    { id: 'user_training', icon: UserCheck, title: "사용자 교육",    msg: "기술적 방어의 마지막 관문은 '사람'입니다. 피싱 시뮬레이션 훈련과 보안 인식 교육으로 의심 메일을 신고하는 문화를 만듭니다." }
  ]
};

const PUZZLES = {
  1: {
    title: "메일 전송의 핵심",
    desc: "인터넷에서 <b>이메일을 전송하는 핵심 프로토콜</b>의 이름은 무엇인가?",
    options: ["POP3", "SMTP", "FTP", "HTTP"],
    answer: 1
  },
  2: {
    title: "첫 번째 인증 방패",
    desc: "<b>발신 도메인의 DNS에 등록된 허용 IP 목록</b>과 실제 발신 IP를 대조하여 위조를 탐지하는 이메일 인증 기술은?",
    options: ["SPF", "SSL", "SSH", "SNMP"],
    answer: 0
  },
  3: {
    title: "문서 속 숨겨진 무기",
    desc: "Word/Excel 등 <b>문서 파일에 숨겨져 '콘텐츠 사용' 클릭 시 자동 실행되는 악성 스크립트</b>는?",
    options: ["JavaScript", "CSS", "VBA 매크로", "HTML"],
    answer: 2
  },
  4: {
    title: "공급망 해킹의 배후",
    desc: "2020년 <b>SolarWinds 공급망 해킹의 배후로 지목된 러시아 APT 그룹</b>은?",
    options: ["APT28", "APT29", "Lazarus", "APT41"],
    answer: 1
  },
  5: {
    title: "안전한 분석 환경",
    desc: "의심스러운 첨부파일을 <b>격리된 가상 환경에서 실행하여 악성 행위를 안전하게 관찰·분석하는 기술</b>은?",
    options: ["방화벽", "IDS", "샌드박스", "VPN"],
    answer: 2
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// [메인 교육 게임 컴포넌트]
// ──────────────────────────────────────────────────────────────────────────────
function InteractiveGameCanvas({ onFinish, userName, companyName }) {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem('t1566_beginner_state');
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
  const [clearDate, setClearDate] = useState(() => localStorage.getItem('t1566_beginner_clear'));
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
    localStorage.setItem('t1566_beginner_state', JSON.stringify({
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
            localStorage.setItem('t1566_beginner_clear', dateStr);
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
    localStorage.removeItem('t1566_beginner_state');
    localStorage.removeItem('t1566_beginner_clear');
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
      {generateClueItem('smtp_server',  0, Server,   "#00E5FF", "SMTP 서버")}
      {generateClueItem('mail_relay',   1, Globe,    "#10B981", "메일 중계")}
      {generateClueItem('port_25',      2, Terminal, "#DFB8B6", "포트 25/587")}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('spf_record',   0, ShieldCheck, "#10B981", "SPF 레코드")}
      {generateClueItem('dkim_sign',    1, Key,         "#00E5FF", "DKIM 서명")}
      {generateClueItem('dmarc_policy', 2, Lock,        "#DFB8B6", "DMARC 정책")}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('mime_header',   0, FileText, "#DFB8B6", "MIME 헤더")}
      {generateClueItem('vba_macro',     1, Code,     "#FF3333", "VBA 매크로")}
      {generateClueItem('base64_encode', 2, Database, "#00E5FF", "Base64 인코딩")}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('apt28_intel',   0, AlertTriangle, "#FF6B6B", "APT28 정보")}
      {generateClueItem('lazarus_trace', 1, Search,        "#00E5FF", "Lazarus 흔적")}
      {generateClueItem('c2_channel',    2, Wifi,          "#10B981", "C2 채널")}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('mail_gateway',  0, Shield,    "#10B981", "메일 게이트웨이")}
      {generateClueItem('sandbox_env',   1, Box,       "#00E5FF", "샌드박스")}
      {generateClueItem('user_training', 2, UserCheck, "#DFB8B6", "사용자 교육")}
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
                    "1. SMTP와 메일 전송",
                    "2. 이메일 인증 체계",
                    "3. 첨부파일과 매크로",
                    "4. APT 그룹의 전략",
                    "5. 다층 방어 체계",
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
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">SMTP와 메일 전송</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 1. SMTP 프로토콜</strong>
                              <p>이메일 전송의 핵심인 <span className="text-white bg-white/10 px-1 rounded">SMTP(Simple Mail Transfer Protocol)</span>의 동작 원리를 배웁니다. 발신 MTA에서 수신 MTA까지 메일이 전달되는 과정과 포트 25/587의 역할을 이해합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 2. 메일 라우팅</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>이메일은 여러 <span className="text-white bg-white/10 px-1 rounded">릴레이(Relay) 서버</span>를 거쳐 목적지에 도달합니다.</li>
                                <li>각 경유 서버는 Received 헤더에 기록을 남기며, 해커는 오픈 릴레이를 악용해 발신지를 숨깁니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 1 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">이메일 인증 체계</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 3. SPF (Sender Policy Framework)</strong>
                              <p>발신 도메인의 DNS TXT 레코드에 <span className="text-white bg-white/10 px-1 rounded">허용된 발신 IP 목록</span>을 등록하고, 수신 서버가 실제 발신 IP와 대조하여 위조를 탐지합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 4. DKIM과 DMARC</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">DKIM</span>은 발신 서버가 메일에 디지털 서명을 추가하여 전송 중 변조를 감지합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">DMARC</span>는 SPF+DKIM 결과를 종합하여 reject/quarantine/none 정책을 적용합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 2 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">첨부파일과 매크로</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 5. MIME 구조</strong>
                              <p><span className="text-white bg-white/10 px-1 rounded">MIME(Multipurpose Internet Mail Extensions)</span>는 이메일의 본문 유형과 첨부파일 경계를 정의합니다. Base64 인코딩으로 바이너리 파일을 텍스트로 변환하여 전송합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 6. VBA 매크로의 위험</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>해커는 Word/Excel 문서에 <span className="text-white bg-white/10 px-1 rounded">VBA 매크로</span>를 삽입하여 '콘텐츠 사용' 클릭 시 악성 코드를 실행합니다.</li>
                                <li>매크로는 외부 C2 서버에서 추가 페이로드를 다운로드하는 드로퍼 역할을 합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 3 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">APT 그룹의 전략</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 7. APT28과 APT29</strong>
                              <p>러시아 정보기관 연계 그룹으로, <span className="text-white bg-white/10 px-1 rounded">APT28(Fancy Bear)</span>는 정부·군사 기관을, <span className="text-white bg-white/10 px-1 rounded">APT29(Cozy Bear)</span>는 외교·에너지 분야를 표적으로 무기화된 문서를 첨부한 스피어피싱을 수행합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 8. Lazarus의 스피어피싱</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>북한 연계 <span className="text-white bg-white/10 px-1 rounded">Lazarus 그룹</span>은 금융기관과 암호화폐 거래소를 겨냥합니다.</li>
                                <li>채용 제안서, 투자 보고서 등 업무 관련 문서로 위장한 스피어피싱으로 수억 달러를 탈취한 이력이 있습니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 4 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">다층 방어 체계</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 9. 게이트웨이와 샌드박스</strong>
                              <p><span className="text-white bg-white/10 px-1 rounded">메일 게이트웨이</span>는 서버 앞단에서 스팸과 악성 첨부를 필터링하고, <span className="text-white bg-white/10 px-1 rounded">샌드박스</span>는 의심 파일을 격리된 가상 환경에서 실행하여 악성 행위를 관찰합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 10. 사용자 교육</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>기술적 방어의 마지막 관문은 <span className="text-white bg-white/10 px-1 rounded">사람</span>입니다. 정기적인 피싱 시뮬레이션 훈련을 실시합니다.</li>
                                <li>의심스러운 메일을 즉시 신고하는 보안 문화를 조성하고, '콘텐츠 사용' 버튼을 함부로 클릭하지 않는 습관을 기릅니다.</li>
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
                            SMTP 전송부터 이메일 인증, 매크로 분석,<br/>APT 추적, 다층 방어까지<br/>스피어피싱의 모든 것을 꿰뚫었습니다.
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

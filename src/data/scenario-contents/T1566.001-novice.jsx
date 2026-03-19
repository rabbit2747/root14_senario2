import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Mail, Paperclip, Lock, Search,
  ChevronRight, X, FileWarning, Terminal, Briefcase,
  Monitor, Eye, Globe, UserCheck, MailWarning
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
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Novice)
// ──────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    scene: 'scene_phase1', loc: 'Sector 1: 이메일 수신함',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "어험! {AGENT} 요원, 집중해라. 이메일은 세상에서 가장 많이 쓰이는 업무 도구이자, 해커들의 가장 흔한 침투 경로이기도 하다." },
      { speaker: 'AGENT_NAME', text: "네, 팀장님! 이메일을 구성하는 5가지 기본 요소가 보입니다 — 발신자, 수신자, 제목, 본문, 그리고 첨부파일이요!" },
      { speaker: 'TEAM_LEADER', text: "좋다. 해커들은 이 5가지 요소를 하나하나 조작해서 정상 메일인 척 위장하지. 수신함에서 이메일 구조의 단서를 수집해라!" }
    ],
    hint: "발신자 주소(봉투 아이콘), 첨부파일(클립), <br>그리고 본문 내용(모니터)을 클릭해 보렴."
  },
  {
    scene: 'scene_phase1', loc: 'Sector 1: 이메일 수신함',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "찾았습니다! 발신자 주소, 첨부파일, 본문 — 이메일의 핵심 구성요소를 모두 파악했습니다." },
      { speaker: 'TEAM_LEADER', text: "잘했다. 특히 발신자 주소는 가장 먼저 확인해야 할 항목이야. 배운 내용을 바탕으로 첫 번째 암호를 해독해라." }
    ],
    triggerPuzzle: 1
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: 피싱 감별실',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "이제 진짜 위협을 배울 차례다. '피싱(Phishing)'은 불특정 다수에게 미끼를 뿌리는 공격이고, '스피어피싱'은 특정 인물을 정밀 저격하는 공격이지." },
      { speaker: 'AGENT_NAME', text: "스피어피싱은 타겟의 이름, 직책, 회사 정보까지 조사해서 맞춤형 이메일을 보내는군요! 훨씬 교묘해요." },
      { speaker: 'TEAM_LEADER', text: "맞다. 평범한 피싱은 '아무나 걸려라' 식이지만, 스피어피싱은 마치 너만을 위해 쓴 편지처럼 꾸며진다. 감별실에서 차이점의 단서를 모아라!" }
    ],
    hint: "피싱 미끼(경고 메일), 타겟 프로파일(신원 조사), <br>그리고 위조 도메인(지구본)을 찾아라."
  },
  {
    scene: 'scene_phase2', loc: 'Sector 2: 피싱 감별실',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "증거 확보! 일반 피싱과 스피어피싱의 결정적 차이 — 타겟 맞춤형 조사와 위조 도메인까지 포착했습니다." },
      { speaker: 'TEAM_LEADER', text: "훌륭하다. 그러면 이 정밀 저격형 공격의 정확한 명칭을 맞혀 보아라." }
    ],
    triggerPuzzle: 2
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: 첨부파일 분석소',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "스피어피싱의 가장 치명적인 무기는 바로 '첨부파일'이다. 특히 매크로가 숨겨진 .doc, .xls 파일은 열기만 해도 악성코드가 자동 실행되지." },
      { speaker: 'AGENT_NAME', text: "이곳은 첨부파일 분석소군요! 매크로가 포함된 문서 파일과 확장자를 위장한 실행 파일이 가득합니다!" },
      { speaker: 'TEAM_LEADER', text: "겉보기에는 평범한 문서지만, 속에는 시한폭탄이 들어있지. 위험한 첨부파일의 유형별 단서를 분석하고 수집해라!" }
    ],
    hint: "매크로 문서(경고 파일), 위장 실행파일(터미널), <br>그리고 압축 폭탄(자물쇠)을 찾아라."
  },
  {
    scene: 'scene_phase3', loc: 'Sector 3: 첨부파일 분석소',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "분석 완료! 매크로 문서, 위장된 이중 확장자 실행파일, 암호 걸린 압축파일 — 3가지 위험 유형을 모두 식별했습니다." },
      { speaker: 'TEAM_LEADER', text: "좋다. 이 중에서도 가장 흔하고 위험한 녀석의 정체를 정확히 맞혀 보아라." }
    ],
    triggerPuzzle: 3
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: 경고 신호 탐지',
    dialogues: [
      { speaker: 'TEAM_LEADER', text: "이메일 구조와 위험한 첨부파일을 알았으니, 이제 의심스러운 이메일을 가려내는 5가지 경고 신호를 배워야 한다." },
      { speaker: 'AGENT_NAME', text: "'지금 당장 확인하세요!' 같은 긴급 어조, 출처 불명의 발신자, 그리고 문법 오류가 눈에 띕니다!" },
      { speaker: 'TEAM_LEADER', text: "바로 그거다. 거기에 수상한 링크와 예상치 못한 첨부파일까지, 총 5가지 경고 신호를 기억해라. 탐지 구역에서 단서를 스캔해라!" }
    ],
    hint: "긴급 어조(경고 삼각형), 출처 불명(눈 아이콘), <br>그리고 문법 오류(돋보기)를 찾아라."
  },
  {
    scene: 'scene_phase4', loc: 'Sector 4: 경고 신호 탐지',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "스캔 완료! 긴급 어조, 출처 불명, 문법 오류 — 의심스러운 이메일의 경고 신호를 모두 포착했습니다." },
      { speaker: 'TEAM_LEADER', text: "어험! 잘했다. 그러면 이 5가지 경고 신호 중 진짜가 아닌 것을 골라내 보아라." }
    ],
    triggerPuzzle: 4
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 대응 본부',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "이제 스피어피싱의 공격 방식을 완전히 파악했습니다. {LEADER}의 조직을 지키려면 대응 절차를 확립해야 합니다!" },
      { speaker: 'TEAM_LEADER', text: "그래! 의심 이메일을 받으면 절대 첨부파일을 열지 말고, 즉시 IT 보안팀에 신고하고, 격리 조치를 취해야 한다. 대응 본부에서 단서를 확보해라!" }
    ],
    hint: "신고 시스템(방패), 격리 조치(자물쇠), <br>그리고 보안 교육(사용자 인증)을 찾아라."
  },
  {
    scene: 'scene_phase5', loc: 'Sector 5: 대응 본부',
    dialogues: [
      { speaker: 'AGENT_NAME', text: "모든 대응 시스템 가동 완료! 신고 채널, 격리 프로토콜, 보안 인식 교육까지 완벽하게 갖춰졌습니다." },
      { speaker: 'TEAM_LEADER', text: "수고했다, {AGENT}. 오늘 학습한 T1566.001 스피어피싱 첨부파일 방어 내용을 최종 사건 수첩에 도장 찍어 두었으니 꼼꼼히 복습하도록." }
    ],
    triggerBook: true
  }
];

const CLUES_DATA = {
  scene_phase1: [
    { id: 'sender_info',    icon: Mail,       title: "발신자 주소",   msg: "이메일에서 가장 먼저 확인해야 할 요소입니다. 해커는 실제 회사와 유사한 가짜 주소(예: support@g00gle.com)를 사용하여 신뢰를 위장합니다." },
    { id: 'attachment_icon', icon: Paperclip,  title: "첨부파일",     msg: "이메일에 덧붙여 보내는 파일입니다. 정상적인 문서처럼 보이지만, 악성코드가 숨겨져 있을 수 있어 가장 주의해야 할 요소입니다." },
    { id: 'email_body',     icon: Monitor,     title: "본문 내용",    msg: "이메일의 주요 메시지가 담긴 영역입니다. 해커는 긴급한 어조나 공포심을 유발하는 문구로 사용자가 첨부파일을 열도록 유도합니다." }
  ],
  scene_phase2: [
    { id: 'phishing_hook',  icon: MailWarning, title: "피싱 미끼",     msg: "불특정 다수에게 동일한 가짜 이메일을 대량으로 발송하는 공격입니다. '계정이 정지됩니다' 같은 공포 메시지로 클릭을 유도합니다." },
    { id: 'target_profile', icon: UserCheck,   title: "타겟 프로파일", msg: "스피어피싱 공격자는 SNS, 회사 홈페이지 등에서 타겟의 이름, 직책, 동료 관계를 조사해 맞춤형 이메일을 작성합니다." },
    { id: 'fake_domain',    icon: Globe,       title: "위조 도메인",   msg: "실제 회사 도메인과 거의 동일하게 생긴 가짜 도메인입니다. 예: microsoft.com → micros0ft.com, 한 글자만 바꿔도 속기 쉽습니다." }
  ],
  scene_phase3: [
    { id: 'macro_doc',      icon: FileWarning, title: "매크로 문서",     msg: "Word(.doc)나 Excel(.xls) 파일 안에 숨겨진 자동 실행 스크립트입니다. '콘텐츠 사용'을 클릭하면 악성코드가 즉시 실행됩니다." },
    { id: 'exe_disguise',   icon: Terminal,    title: "위장 실행파일",   msg: "이중 확장자(예: report.pdf.exe)를 사용해 문서 파일처럼 보이지만, 실제로는 악성 프로그램인 실행 파일입니다." },
    { id: 'zip_bomb',       icon: Lock,        title: "압축 폭탄",      msg: "암호가 걸린 ZIP/RAR 파일로 보안 솔루션의 검사를 우회합니다. 이메일 본문에 암호를 함께 알려주며 사용자가 직접 풀도록 유도합니다." }
  ],
  scene_phase4: [
    { id: 'urgent_tone',    icon: AlertTriangle, title: "긴급 어조",   msg: "'즉시 확인 필요', '계정 정지 경고' 등 긴급함을 강조하여 사용자가 생각할 틈 없이 첨부파일을 열거나 링크를 클릭하게 만드는 수법입니다." },
    { id: 'unknown_sender', icon: Eye,           title: "출처 불명",   msg: "한 번도 연락한 적 없는 발신자, 또는 이름은 아는데 이메일 주소가 다른 경우입니다. 주소를 반드시 눈으로 직접 확인해야 합니다." },
    { id: 'grammar_error',  icon: Search,        title: "문법 오류",   msg: "공식 기관에서 보낸 이메일에 어색한 문법, 오타, 번역투 문장이 있다면 피싱일 가능성이 높습니다." }
  ],
  scene_phase5: [
    { id: 'report_btn',     icon: ShieldCheck, title: "신고 시스템",   msg: "의심스러운 이메일을 발견하면 가장 먼저 IT 보안팀이나 관리자에게 신고해야 합니다. 혼자 판단하지 말고 전문가에게 맡기세요." },
    { id: 'quarantine',     icon: Lock,        title: "격리 조치",     msg: "의심 이메일은 열지 말고 즉시 격리(스팸함 이동 또는 삭제)합니다. 이미 열었다면 네트워크를 차단하고 보안팀에 알립니다." },
    { id: 'awareness',      icon: UserCheck,   title: "보안 교육",     msg: "정기적인 보안 인식 교육과 모의 피싱 훈련이 스피어피싱 방어의 가장 효과적인 방법입니다. 사람이 최후의 방어선입니다." }
  ]
};

const PUZZLES = {
  1: {
    title: "이메일의 구성 요소",
    desc: "<b>이메일을 구성하는 5가지 요소</b>(발신자, 수신자, 제목, 본문, 첨부파일)에 <b>해당하지 않는 것</b>은?",
    options: ["발신자 / 수신자", "제목 / 본문", "첨부파일", "쿠키 (Cookie)"],
    answer: 3
  },
  2: {
    title: "정밀 저격형 공격",
    desc: "불특정 다수가 아닌, <b>특정 개인이나 조직을 정밀하게 겨냥</b>하여 맞춤형 이메일을 보내는 저격형 공격의 이름은?",
    options: ["DDoS 공격", "스피어피싱 (Spear Phishing)", "SQL 인젝션", "크로스 사이트 스크립팅 (XSS)"],
    answer: 1
  },
  3: {
    title: "가장 위험한 첨부파일",
    desc: "가장 위험한 첨부파일 유형으로, <b>문서 안에 숨겨진 코드(매크로)가 자동 실행</b>되어 악성코드를 설치하는 것은?",
    options: [".txt (텍스트 파일)", ".jpg (이미지 파일)", "매크로 포함 .doc / .xls", ".mp3 (음악 파일)"],
    answer: 2
  },
  4: {
    title: "경고 신호 감별",
    desc: "의심스러운 이메일의 <b>5가지 경고 신호</b>(긴급 어조, 출처 불명, 수상한 링크, 예상치 못한 첨부, 문법 오류)에 <b>해당하지 않는 것</b>은?",
    options: ["급한 어조로 즉시 행동 요구", "출처 불명의 발신자", "회사 공식 도메인에서 온 정상 메일", "어색한 문법과 오타"],
    answer: 2
  },
  5: {
    title: "최우선 대응 행동",
    desc: "스피어피싱 의심 이메일을 받았을 때, <b>가장 먼저 해야 할 행동</b>은 무엇인가?",
    options: ["첨부파일을 열어 내용 확인", "IT 보안팀에 즉시 신고", "발신자에게 답장하여 확인", "동료에게 전달하여 의견 요청"],
    answer: 1
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// [메인 교육 게임 컴포넌트]
// ──────────────────────────────────────────────────────────────────────────────
function InteractiveGameCanvas({ onFinish, userName, companyName }) {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem('t1566_novice_state');
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
  const [clearDate, setClearDate] = useState(() => localStorage.getItem('t1566_novice_clear'));
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
    localStorage.setItem('t1566_novice_state', JSON.stringify({
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
            localStorage.setItem('t1566_novice_clear', dateStr);
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
    localStorage.removeItem('t1566_novice_state');
    localStorage.removeItem('t1566_novice_clear');
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
      {generateClueItem('sender_info',    0, Mail,       "#00E5FF", "발신자 주소")}
      {generateClueItem('attachment_icon', 1, Paperclip,  "#FF6B6B", "첨부파일")}
      {generateClueItem('email_body',     2, Monitor,    "#DFB8B6", "본문 내용")}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('phishing_hook',  0, MailWarning, "#FF3333", "피싱 미끼")}
      {generateClueItem('target_profile', 1, UserCheck,   "#10B981", "타겟 프로파일")}
      {generateClueItem('fake_domain',    2, Globe,       "#DFB8B6", "위조 도메인")}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('macro_doc',    0, FileWarning, "#FF6B6B", "매크로 문서")}
      {generateClueItem('exe_disguise', 1, Terminal,    "#00E5FF", "위장 실행파일")}
      {generateClueItem('zip_bomb',     2, Lock,        "#DFB8B6", "압축 폭탄")}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('urgent_tone',    0, AlertTriangle, "#FF3333", "긴급 어조")}
      {generateClueItem('unknown_sender', 1, Eye,           "#00E5FF", "출처 불명")}
      {generateClueItem('grammar_error',  2, Search,        "#DFB8B6", "문법 오류")}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('report_btn',  0, ShieldCheck, "#10B981", "신고 시스템")}
      {generateClueItem('quarantine',  1, Lock,        "#00E5FF", "격리 조치")}
      {generateClueItem('awareness',   2, UserCheck,   "#DFB8B6", "보안 교육")}
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
            ? "url('https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&q=80&w=1000')"
            : currentChapter?.scene === 'scene_phase2'
            ? "url('https://images.unsplash.com/photo-1563986768609-322da13575f2?auto=format&fit=crop&q=80&w=1000')"
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
                    "1. 이메일의 기본 구조",
                    "2. 피싱과 스피어피싱",
                    "3. 위험한 첨부파일",
                    "4. 5가지 경고 신호",
                    "5. 기본 대응 방법",
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
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">이메일의 기본 구조</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 1. 이메일 5가지 구성요소</strong>
                              <p>이메일은 <span className="text-white bg-white/10 px-1 rounded">발신자, 수신자, 제목, 본문, 첨부파일</span> 5가지 요소로 구성됩니다. 해커는 이 모든 요소를 조작하여 정상 메일처럼 위장합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 2. 발신자 주소의 중요성</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>발신자 주소는 이메일을 받았을 때 <span className="text-white bg-white/10 px-1 rounded">가장 먼저 확인</span>해야 할 항목입니다.</li>
                                <li>해커는 실제 회사와 비슷한 가짜 도메인(예: @g00gle.com)을 사용하여 신뢰를 위장합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 1 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">피싱과 스피어피싱</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 3. 일반 피싱의 특징</strong>
                              <p>피싱(Phishing)은 <span className="text-white bg-white/10 px-1 rounded">불특정 다수</span>에게 동일한 가짜 이메일을 대량 발송하는 공격입니다. '계정이 정지됩니다' 같은 공포 유발 메시지로 클릭을 유도합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 4. 스피어피싱의 정밀 타겟팅</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>스피어피싱은 타겟의 이름, 직책, 회사, 동료 관계를 사전 조사하여 <span className="text-white bg-white/10 px-1 rounded">맞춤형 이메일</span>을 작성합니다.</li>
                                <li>마치 실제 동료나 거래처가 보낸 것처럼 꾸며져 일반 피싱보다 성공률이 훨씬 높습니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 2 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">위험한 첨부파일</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 5. 매크로 문서의 위험</strong>
                              <p>Word(.doc)나 Excel(.xls) 파일에 숨겨진 <span className="text-white bg-white/10 px-1 rounded">매크로(자동 실행 스크립트)</span>는 '콘텐츠 사용' 버튼을 클릭하는 순간 악성코드를 설치합니다.</p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 6. 파일 확장자별 위험도</strong>
                              <ol className="list-decimal pl-5 space-y-2 text-[#DFB8B6] font-bold">
                                <li>매크로 포함 문서 (.doc, .xls, .ppt) — 가장 흔한 공격 벡터</li>
                                <li>이중 확장자 실행파일 (report.pdf.exe) — 문서로 위장</li>
                                <li>암호 걸린 압축파일 (.zip, .rar) — 보안 검사 우회</li>
                                <li>스크립트 파일 (.js, .vbs, .bat) — 직접 코드 실행</li>
                              </ol>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 3 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">5가지 경고 신호</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 7. 긴급 어조와 출처 불명</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">긴급 어조</span>: '즉시 확인', '계정 정지' 등 공포심을 조장하여 판단력을 흐리게 합니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">출처 불명</span>: 모르는 발신자이거나 이름은 아는데 이메일 주소가 평소와 다른 경우입니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 8. 링크, 첨부, 문법 오류</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white bg-white/10 px-1 rounded">수상한 링크</span>: 마우스를 올려보면 실제 URL이 표시와 다릅니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">예상치 못한 첨부</span>: 요청하지 않은 파일이 첨부되어 있습니다.</li>
                                <li><span className="text-white bg-white/10 px-1 rounded">문법 오류</span>: 공식 기관 메일에 오타나 어색한 번역투가 있으면 피싱을 의심합니다.</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 4 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">기본 대응 방법</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 9. 신고와 격리</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>의심스러운 이메일은 <span className="text-white bg-white/10 px-1 rounded">절대 첨부파일을 열지 말고</span> IT 보안팀에 즉시 신고합니다.</li>
                                <li>이미 열어버린 경우 즉시 네트워크를 차단하고, 비밀번호를 변경하며, 보안팀의 지시를 따릅니다.</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">Ch 10. 보안 인식 교육의 중요성</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>정기적인 <span className="text-white bg-white/10 px-1 rounded">보안 인식 교육</span>과 모의 피싱 훈련이 가장 효과적인 방어 수단입니다.</li>
                                <li>기술적 보안 솔루션도 중요하지만, 결국 <span className="text-white bg-white/10 px-1 rounded">사람이 최후의 방어선</span>입니다.</li>
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
                            이메일 기본 구조부터 대응 방법까지,<br/>T1566.001 스피어피싱 첨부파일 기초 과정을<br/>모두 훌륭히 마쳤습니다.
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

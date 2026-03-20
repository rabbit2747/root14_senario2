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
// [다국어 텍스트] — lang prop 기반 분기
// ──────────────────────────────────────────────────────────────────────────────
const T = {
  ko: {
    // CHAPTERS locations
    loc1: 'Sector 1: 이메일 수신함', loc2: 'Sector 2: 피싱 감별실', loc3: 'Sector 3: 첨부파일 분석소', loc4: 'Sector 4: 경고 신호 탐지', loc5: 'Sector 5: 대응 본부',
    // CHAPTERS dialogues
    d1_1: "어험! {AGENT} 요원, 집중해라. 이메일은 세상에서 가장 많이 쓰이는 업무 도구이자, 해커들의 가장 흔한 침투 경로이기도 하다.",
    d1_2: "네, 팀장님! 이메일을 구성하는 5가지 기본 요소가 보입니다 — 발신자, 수신자, 제목, 본문, 그리고 첨부파일이요!",
    d1_3: "좋다. 해커들은 이 5가지 요소를 하나하나 조작해서 정상 메일인 척 위장하지. 수신함에서 이메일 구조의 단서를 수집해라!",
    d2_1: "찾았습니다! 발신자 주소, 첨부파일, 본문 — 이메일의 핵심 구성요소를 모두 파악했습니다.",
    d2_2: "잘했다. 특히 발신자 주소는 가장 먼저 확인해야 할 항목이야. 배운 내용을 바탕으로 첫 번째 암호를 해독해라.",
    d3_1: "이제 진짜 위협을 배울 차례다. '피싱(Phishing)'은 불특정 다수에게 미끼를 뿌리는 공격이고, '스피어피싱'은 특정 인물을 정밀 저격하는 공격이지.",
    d3_2: "스피어피싱은 타겟의 이름, 직책, 회사 정보까지 조사해서 맞춤형 이메일을 보내는군요! 훨씬 교묘해요.",
    d3_3: "맞다. 평범한 피싱은 '아무나 걸려라' 식이지만, 스피어피싱은 마치 너만을 위해 쓴 편지처럼 꾸며진다. 감별실에서 차이점의 단서를 모아라!",
    d4_1: "증거 확보! 일반 피싱과 스피어피싱의 결정적 차이 — 타겟 맞춤형 조사와 위조 도메인까지 포착했습니다.",
    d4_2: "훌륭하다. 그러면 이 정밀 저격형 공격의 정확한 명칭을 맞혀 보아라.",
    d5_1: "스피어피싱의 가장 치명적인 무기는 바로 '첨부파일'이다. 특히 매크로가 숨겨진 .doc, .xls 파일은 열기만 해도 악성코드가 자동 실행되지.",
    d5_2: "이곳은 첨부파일 분석소군요! 매크로가 포함된 문서 파일과 확장자를 위장한 실행 파일이 가득합니다!",
    d5_3: "겉보기에는 평범한 문서지만, 속에는 시한폭탄이 들어있지. 위험한 첨부파일의 유형별 단서를 분석하고 수집해라!",
    d6_1: "분석 완료! 매크로 문서, 위장된 이중 확장자 실행파일, 암호 걸린 압축파일 — 3가지 위험 유형을 모두 식별했습니다.",
    d6_2: "좋다. 이 중에서도 가장 흔하고 위험한 녀석의 정체를 정확히 맞혀 보아라.",
    d7_1: "이메일 구조와 위험한 첨부파일을 알았으니, 이제 의심스러운 이메일을 가려내는 5가지 경고 신호를 배워야 한다.",
    d7_2: "'지금 당장 확인하세요!' 같은 긴급 어조, 출처 불명의 발신자, 그리고 문법 오류가 눈에 띕니다!",
    d7_3: "바로 그거다. 거기에 수상한 링크와 예상치 못한 첨부파일까지, 총 5가지 경고 신호를 기억해라. 탐지 구역에서 단서를 스캔해라!",
    d8_1: "스캔 완료! 긴급 어조, 출처 불명, 문법 오류 — 의심스러운 이메일의 경고 신호를 모두 포착했습니다.",
    d8_2: "어험! 잘했다. 그러면 이 5가지 경고 신호 중 진짜가 아닌 것을 골라내 보아라.",
    d9_1: "이제 스피어피싱의 공격 방식을 완전히 파악했습니다. {LEADER}의 조직을 지키려면 대응 절차를 확립해야 합니다!",
    d9_2: "그래! 의심 이메일을 받으면 절대 첨부파일을 열지 말고, 즉시 IT 보안팀에 신고하고, 격리 조치를 취해야 한다. 대응 본부에서 단서를 확보해라!",
    d10_1: "모든 대응 시스템 가동 완료! 신고 채널, 격리 프로토콜, 보안 인식 교육까지 완벽하게 갖춰졌습니다.",
    d10_2: "수고했다, {AGENT}. 오늘 학습한 T1566.001 스피어피싱 첨부파일 방어 내용을 최종 사건 수첩에 도장 찍어 두었으니 꼼꼼히 복습하도록.",
    // hints
    h1: "발신자 주소(봉투 아이콘), 첨부파일(클립), <br>그리고 본문 내용(모니터)을 클릭해 보렴.",
    h2: "피싱 미끼(경고 메일), 타겟 프로파일(신원 조사), <br>그리고 위조 도메인(지구본)을 찾아라.",
    h3: "매크로 문서(경고 파일), 위장 실행파일(터미널), <br>그리고 압축 폭탄(자물쇠)을 찾아라.",
    h4: "긴급 어조(경고 삼각형), 출처 불명(눈 아이콘), <br>그리고 문법 오류(돋보기)를 찾아라.",
    h5: "신고 시스템(방패), 격리 조치(자물쇠), <br>그리고 보안 교육(사용자 인증)을 찾아라.",
    // clues
    c_sender_t: "발신자 주소", c_sender_m: "이메일에서 가장 먼저 확인해야 할 요소입니다. 해커는 실제 회사와 유사한 가짜 주소(예: support@g00gle.com)를 사용하여 신뢰를 위장합니다.",
    c_attach_t: "첨부파일", c_attach_m: "이메일에 덧붙여 보내는 파일입니다. 정상적인 문서처럼 보이지만, 악성코드가 숨겨져 있을 수 있어 가장 주의해야 할 요소입니다.",
    c_body_t: "본문 내용", c_body_m: "이메일의 주요 메시지가 담긴 영역입니다. 해커는 긴급한 어조나 공포심을 유발하는 문구로 사용자가 첨부파일을 열도록 유도합니다.",
    c_hook_t: "피싱 미끼", c_hook_m: "불특정 다수에게 동일한 가짜 이메일을 대량으로 발송하는 공격입니다. '계정이 정지됩니다' 같은 공포 메시지로 클릭을 유도합니다.",
    c_target_t: "타겟 프로파일", c_target_m: "스피어피싱 공격자는 SNS, 회사 홈페이지 등에서 타겟의 이름, 직책, 동료 관계를 조사해 맞춤형 이메일을 작성합니다.",
    c_domain_t: "위조 도메인", c_domain_m: "실제 회사 도메인과 거의 동일하게 생긴 가짜 도메인입니다. 예: microsoft.com → micros0ft.com, 한 글자만 바꿔도 속기 쉽습니다.",
    c_macro_t: "매크로 문서", c_macro_m: "Word(.doc)나 Excel(.xls) 파일 안에 숨겨진 자동 실행 스크립트입니다. '콘텐츠 사용'을 클릭하면 악성코드가 즉시 실행됩니다.",
    c_exe_t: "위장 실행파일", c_exe_m: "이중 확장자(예: report.pdf.exe)를 사용해 문서 파일처럼 보이지만, 실제로는 악성 프로그램인 실행 파일입니다.",
    c_zip_t: "압축 폭탄", c_zip_m: "암호가 걸린 ZIP/RAR 파일로 보안 솔루션의 검사를 우회합니다. 이메일 본문에 암호를 함께 알려주며 사용자가 직접 풀도록 유도합니다.",
    c_urgent_t: "긴급 어조", c_urgent_m: "'즉시 확인 필요', '계정 정지 경고' 등 긴급함을 강조하여 사용자가 생각할 틈 없이 첨부파일을 열거나 링크를 클릭하게 만드는 수법입니다.",
    c_unknown_t: "출처 불명", c_unknown_m: "한 번도 연락한 적 없는 발신자, 또는 이름은 아는데 이메일 주소가 다른 경우입니다. 주소를 반드시 눈으로 직접 확인해야 합니다.",
    c_grammar_t: "문법 오류", c_grammar_m: "공식 기관에서 보낸 이메일에 어색한 문법, 오타, 번역투 문장이 있다면 피싱일 가능성이 높습니다.",
    c_report_t: "신고 시스템", c_report_m: "의심스러운 이메일을 발견하면 가장 먼저 IT 보안팀이나 관리자에게 신고해야 합니다. 혼자 판단하지 말고 전문가에게 맡기세요.",
    c_quarantine_t: "격리 조치", c_quarantine_m: "의심 이메일은 열지 말고 즉시 격리(스팸함 이동 또는 삭제)합니다. 이미 열었다면 네트워크를 차단하고 보안팀에 알립니다.",
    c_aware_t: "보안 교육", c_aware_m: "정기적인 보안 인식 교육과 모의 피싱 훈련이 스피어피싱 방어의 가장 효과적인 방법입니다. 사람이 최후의 방어선입니다.",
    // puzzles
    p1_title: "이메일의 구성 요소", p1_desc: "<b>이메일을 구성하는 5가지 요소</b>(발신자, 수신자, 제목, 본문, 첨부파일)에 <b>해당하지 않는 것</b>은?",
    p1_opts: ["발신자 / 수신자", "제목 / 본문", "첨부파일", "쿠키 (Cookie)"],
    p2_title: "정밀 저격형 공격", p2_desc: "불특정 다수가 아닌, <b>특정 개인이나 조직을 정밀하게 겨냥</b>하여 맞춤형 이메일을 보내는 저격형 공격의 이름은?",
    p2_opts: ["DDoS 공격", "스피어피싱 (Spear Phishing)", "SQL 인젝션", "크로스 사이트 스크립팅 (XSS)"],
    p3_title: "가장 위험한 첨부파일", p3_desc: "가장 위험한 첨부파일 유형으로, <b>문서 안에 숨겨진 코드(매크로)가 자동 실행</b>되어 악성코드를 설치하는 것은?",
    p3_opts: [".txt (텍스트 파일)", ".jpg (이미지 파일)", "매크로 포함 .doc / .xls", ".mp3 (음악 파일)"],
    p4_title: "경고 신호 감별", p4_desc: "의심스러운 이메일의 <b>5가지 경고 신호</b>(긴급 어조, 출처 불명, 수상한 링크, 예상치 못한 첨부, 문법 오류)에 <b>해당하지 않는 것</b>은?",
    p4_opts: ["급한 어조로 즉시 행동 요구", "출처 불명의 발신자", "회사 공식 도메인에서 온 정상 메일", "어색한 문법과 오타"],
    p5_title: "최우선 대응 행동", p5_desc: "스피어피싱 의심 이메일을 받았을 때, <b>가장 먼저 해야 할 행동</b>은 무엇인가?",
    p5_opts: ["첨부파일을 열어 내용 확인", "IT 보안팀에 즉시 신고", "발신자에게 답장하여 확인", "동료에게 전달하여 의견 요청"],
    // UI
    teamLeader: '팀장', agent: '요원', secRate: '확보율', certReport: '수료 보고서',
    analysisReport: '분석 리포트', freeMode: '(자유 탐색 모드)',
    proceed: '진행', next: '다음', closeWindow: '창 닫기', saveData: '데이터 저장하기',
    inventory: '수집 데이터 (Inventory)', noClues: '아직 수집된 단서가 없습니다.',
    prevTab: '◀ 이전', nextTab: '다음 ▶',
    // report tabs
    rTab1: "1. 이메일의 기본 구조", rTab2: "2. 피싱과 스피어피싱", rTab3: "3. 위험한 첨부파일",
    rTab4: "4. 5가지 경고 신호", rTab5: "5. 기본 대응 방법", rTab6: "6. 최종 훈련 수료",
    // report content
    r1_h: "이메일의 기본 구조",
    r1_ch1: "Ch 1. 이메일 5가지 구성요소",
    r1_ch1_p: '이메일은 <span class="text-white bg-white/10 px-1 rounded">발신자, 수신자, 제목, 본문, 첨부파일</span> 5가지 요소로 구성됩니다. 해커는 이 모든 요소를 조작하여 정상 메일처럼 위장합니다.',
    r1_ch2: "Ch 2. 발신자 주소의 중요성",
    r1_ch2_l1: '발신자 주소는 이메일을 받았을 때 <span class="text-white bg-white/10 px-1 rounded">가장 먼저 확인</span>해야 할 항목입니다.',
    r1_ch2_l2: "해커는 실제 회사와 비슷한 가짜 도메인(예: @g00gle.com)을 사용하여 신뢰를 위장합니다.",
    r2_h: "피싱과 스피어피싱",
    r2_ch3: "Ch 3. 일반 피싱의 특징",
    r2_ch3_p: '피싱(Phishing)은 <span class="text-white bg-white/10 px-1 rounded">불특정 다수</span>에게 동일한 가짜 이메일을 대량 발송하는 공격입니다. \'계정이 정지됩니다\' 같은 공포 유발 메시지로 클릭을 유도합니다.',
    r2_ch4: "Ch 4. 스피어피싱의 정밀 타겟팅",
    r2_ch4_l1: '스피어피싱은 타겟의 이름, 직책, 회사, 동료 관계를 사전 조사하여 <span class="text-white bg-white/10 px-1 rounded">맞춤형 이메일</span>을 작성합니다.',
    r2_ch4_l2: "마치 실제 동료나 거래처가 보낸 것처럼 꾸며져 일반 피싱보다 성공률이 훨씬 높습니다.",
    r3_h: "위험한 첨부파일",
    r3_ch5: "Ch 5. 매크로 문서의 위험",
    r3_ch5_p: 'Word(.doc)나 Excel(.xls) 파일에 숨겨진 <span class="text-white bg-white/10 px-1 rounded">매크로(자동 실행 스크립트)</span>는 \'콘텐츠 사용\' 버튼을 클릭하는 순간 악성코드를 설치합니다.',
    r3_ch6: "Ch 6. 파일 확장자별 위험도",
    r3_ch6_l1: "매크로 포함 문서 (.doc, .xls, .ppt) — 가장 흔한 공격 벡터",
    r3_ch6_l2: "이중 확장자 실행파일 (report.pdf.exe) — 문서로 위장",
    r3_ch6_l3: "암호 걸린 압축파일 (.zip, .rar) — 보안 검사 우회",
    r3_ch6_l4: "스크립트 파일 (.js, .vbs, .bat) — 직접 코드 실행",
    r4_h: "5가지 경고 신호",
    r4_ch7: "Ch 7. 긴급 어조와 출처 불명",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">긴급 어조</span>: \'즉시 확인\', \'계정 정지\' 등 공포심을 조장하여 판단력을 흐리게 합니다.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">출처 불명</span>: 모르는 발신자이거나 이름은 아는데 이메일 주소가 평소와 다른 경우입니다.',
    r4_ch8: "Ch 8. 링크, 첨부, 문법 오류",
    r4_ch8_l1: '<span class="text-white bg-white/10 px-1 rounded">수상한 링크</span>: 마우스를 올려보면 실제 URL이 표시와 다릅니다.',
    r4_ch8_l2: '<span class="text-white bg-white/10 px-1 rounded">예상치 못한 첨부</span>: 요청하지 않은 파일이 첨부되어 있습니다.',
    r4_ch8_l3: '<span class="text-white bg-white/10 px-1 rounded">문법 오류</span>: 공식 기관 메일에 오타나 어색한 번역투가 있으면 피싱을 의심합니다.',
    r5_h: "기본 대응 방법",
    r5_ch9: "Ch 9. 신고와 격리",
    r5_ch9_l1: '의심스러운 이메일은 <span class="text-white bg-white/10 px-1 rounded">절대 첨부파일을 열지 말고</span> IT 보안팀에 즉시 신고합니다.',
    r5_ch9_l2: "이미 열어버린 경우 즉시 네트워크를 차단하고, 비밀번호를 변경하며, 보안팀의 지시를 따릅니다.",
    r5_ch10: "Ch 10. 보안 인식 교육의 중요성",
    r5_ch10_l1: '정기적인 <span class="text-white bg-white/10 px-1 rounded">보안 인식 교육</span>과 모의 피싱 훈련이 가장 효과적인 방어 수단입니다.',
    r5_ch10_l2: '결국 <span class="text-white bg-white/10 px-1 rounded">사람이 최후의 방어선</span>입니다.',
    r6_title: "훈련 수료 완료!",
    r6_desc: "이메일 기본 구조부터 대응 방법까지,<br/>T1566.001 스피어피싱 첨부파일 기초 과정을<br/>모두 훌륭히 마쳤습니다.",
    r6_grade: "최종 등급:",
    r6_labBtn: "실습 랩으로 이동하기 🚀",
    r6_freeHint: "(창을 닫으면 각 구역을 자유롭게 재탐색할 수 있습니다)",
  },
  en: {
    loc1: 'Sector 1: Email Inbox', loc2: 'Sector 2: Phishing Analysis Lab', loc3: 'Sector 3: Attachment Analysis', loc4: 'Sector 4: Warning Signal Detection', loc5: 'Sector 5: Response HQ',
    d1_1: "Ahem! Agent {AGENT}, focus up. Email is the most widely used business tool in the world — and also the most common entry point for hackers.",
    d1_2: "Yes, sir! I can see the 5 basic components of an email — sender, recipient, subject, body, and attachments!",
    d1_3: "Good. Hackers manipulate each of these 5 components to disguise their emails as legitimate. Collect clues about email structure from the inbox!",
    d2_1: "Found them! Sender address, attachment, body — I've identified all the key components of an email.",
    d2_2: "Well done. The sender address is the first thing you should always check. Now decode the first cipher based on what you've learned.",
    d3_1: "Now it's time to learn about real threats. 'Phishing' casts a wide net at random targets, while 'Spear Phishing' is a precision strike aimed at specific individuals.",
    d3_2: "Spear phishing involves researching the target's name, title, and company info to craft personalized emails! That's much more sophisticated.",
    d3_3: "Exactly. Regular phishing is a 'cast and hope' approach, but spear phishing is crafted like a personal letter just for you. Collect clues about the differences in the analysis lab!",
    d4_1: "Evidence secured! I've identified the critical differences between phishing and spear phishing — targeted research and forged domains.",
    d4_2: "Excellent. Now identify the exact name of this precision-targeted attack.",
    d5_1: "The most lethal weapon of spear phishing is the 'attachment'. Especially .doc and .xls files with hidden macros that auto-execute malware when opened.",
    d5_2: "This is the attachment analysis lab! It's full of macro-laden documents and executables disguised with fake extensions!",
    d5_3: "They look like ordinary documents, but they're hiding ticking time bombs inside. Analyze and collect clues about each type of dangerous attachment!",
    d6_1: "Analysis complete! Macro documents, double-extension disguised executables, password-protected archives — all 3 dangerous types identified.",
    d6_2: "Good. Now identify the most common and dangerous type among them.",
    d7_1: "Now that you know email structure and dangerous attachments, it's time to learn the 5 warning signs for identifying suspicious emails.",
    d7_2: "I can spot urgent language like 'Verify immediately!', unknown senders, and grammar errors!",
    d7_3: "That's right. Add suspicious links and unexpected attachments, and you have all 5 warning signs. Scan for clues in the detection zone!",
    d8_1: "Scan complete! Urgent tone, unknown sender, grammar errors — all warning signs of suspicious emails have been captured.",
    d8_2: "Ahem! Well done. Now identify which of the 5 warning signs is NOT real.",
    d9_1: "I now fully understand spear phishing attack methods. We need to establish response procedures to protect {LEADER}'s organization!",
    d9_2: "Right! When you receive a suspicious email, never open the attachment. Report to IT security immediately and take quarantine measures. Collect clues at Response HQ!",
    d10_1: "All response systems are operational! Reporting channels, quarantine protocols, and security awareness training are all in place.",
    d10_2: "Well done, {AGENT}. I've stamped your final case notebook with today's T1566.001 Spearphishing Attachment defense training. Review it thoroughly.",
    h1: "Click on the sender address (envelope icon), attachment (clip), <br>and the body content (monitor).",
    h2: "Find the phishing bait (warning email), target profile (investigation), <br>and forged domain (globe).",
    h3: "Find the macro document (warning file), disguised executable (terminal), <br>and zip bomb (lock).",
    h4: "Find the urgent tone (warning triangle), unknown source (eye icon), <br>and grammar errors (magnifier).",
    h5: "Find the reporting system (shield), quarantine measure (lock), <br>and security training (user verification).",
    c_sender_t: "Sender Address", c_sender_m: "The first element to check in any email. Hackers use fake addresses similar to real companies (e.g., support@g00gle.com) to build trust.",
    c_attach_t: "Attachment", c_attach_m: "Files attached to emails. They look like normal documents but may contain hidden malware — the most critical element to watch.",
    c_body_t: "Email Body", c_body_m: "The main message area of an email. Hackers use urgent language or fear-inducing phrases to trick users into opening attachments.",
    c_hook_t: "Phishing Bait", c_hook_m: "An attack that mass-sends identical fake emails to random targets. Uses fear messages like 'Your account has been suspended' to drive clicks.",
    c_target_t: "Target Profile", c_target_m: "Spear phishing attackers research the target's name, title, and colleague relationships through social media and company websites to craft customized emails.",
    c_domain_t: "Forged Domain", c_domain_m: "A fake domain nearly identical to a real company's domain. Example: microsoft.com → micros0ft.com — changing just one character is enough to deceive.",
    c_macro_t: "Macro Document", c_macro_m: "Auto-execution scripts hidden in Word (.doc) or Excel (.xls) files. Clicking 'Enable Content' immediately installs malware.",
    c_exe_t: "Disguised Executable", c_exe_m: "Uses double extensions (e.g., report.pdf.exe) to look like a document file, but is actually a malicious executable program.",
    c_zip_t: "Archive Bomb", c_zip_m: "Password-protected ZIP/RAR files that bypass security scanning. The password is provided in the email body, tricking users into extracting them.",
    c_urgent_t: "Urgent Tone", c_urgent_m: "'Verify immediately', 'Account suspension warning' — a tactic that creates urgency so users open attachments or click links without thinking.",
    c_unknown_t: "Unknown Source", c_unknown_m: "A sender you've never contacted, or someone whose name you know but the email address is different. Always verify the address visually.",
    c_grammar_t: "Grammar Errors", c_grammar_m: "Awkward grammar, typos, or translation-like phrasing in emails claiming to be from official organizations is a strong indicator of phishing.",
    c_report_t: "Reporting System", c_report_m: "When you find a suspicious email, report it to IT security or an admin immediately. Don't try to judge it alone — leave it to the experts.",
    c_quarantine_t: "Quarantine", c_quarantine_m: "Don't open suspicious emails — quarantine them immediately (move to spam or delete). If already opened, disconnect from the network and alert security.",
    c_aware_t: "Security Training", c_aware_m: "Regular security awareness training and simulated phishing drills are the most effective defense against spear phishing. People are the last line of defense.",
    p1_title: "Email Components", p1_desc: "Which of the following is <b>NOT</b> one of the <b>5 components of an email</b> (sender, recipient, subject, body, attachment)?",
    p1_opts: ["Sender / Recipient", "Subject / Body", "Attachment", "Cookie"],
    p2_title: "Precision-Targeted Attack", p2_desc: "What is the name of the targeted attack that sends <b>customized emails to specific individuals or organizations</b> rather than random targets?",
    p2_opts: ["DDoS Attack", "Spear Phishing", "SQL Injection", "Cross-Site Scripting (XSS)"],
    p3_title: "Most Dangerous Attachment", p3_desc: "Which attachment type is the most dangerous, where <b>hidden code (macros) auto-executes</b> to install malware?",
    p3_opts: [".txt (Text file)", ".jpg (Image file)", "Macro-enabled .doc / .xls", ".mp3 (Audio file)"],
    p4_title: "Warning Sign Identification", p4_desc: "Which is <b>NOT</b> one of the <b>5 warning signs</b> of suspicious emails (urgent tone, unknown sender, suspicious links, unexpected attachments, grammar errors)?",
    p4_opts: ["Urgent tone demanding immediate action", "Unknown sender", "Normal email from official company domain", "Awkward grammar and typos"],
    p5_title: "Top Priority Response", p5_desc: "When you receive a suspected spear phishing email, what should be your <b>first action</b>?",
    p5_opts: ["Open the attachment to check contents", "Report to IT security immediately", "Reply to the sender to verify", "Forward to colleagues for opinions"],
    teamLeader: 'Leader', agent: 'Agent', secRate: 'Secured', certReport: 'Completion Report',
    analysisReport: 'Analysis Report', freeMode: '(Free Exploration Mode)',
    proceed: 'Continue', next: 'Next', closeWindow: 'Close', saveData: 'Save Data',
    inventory: 'Collected Data (Inventory)', noClues: 'No clues collected yet.',
    prevTab: '◀ Prev', nextTab: 'Next ▶',
    rTab1: "1. Email Basics", rTab2: "2. Phishing vs Spear Phishing", rTab3: "3. Dangerous Attachments",
    rTab4: "4. 5 Warning Signs", rTab5: "5. Basic Response", rTab6: "6. Training Complete",
    r1_h: "Email Basics",
    r1_ch1: "Ch 1. 5 Components of Email",
    r1_ch1_p: 'An email consists of 5 components: <span class="text-white bg-white/10 px-1 rounded">sender, recipient, subject, body, and attachment</span>. Hackers manipulate all of these to disguise emails as legitimate.',
    r1_ch2: "Ch 2. Importance of Sender Address",
    r1_ch2_l1: 'The sender address is the <span class="text-white bg-white/10 px-1 rounded">first thing to check</span> when receiving an email.',
    r1_ch2_l2: "Hackers use fake domains similar to real companies (e.g., @g00gle.com) to build trust.",
    r2_h: "Phishing vs Spear Phishing",
    r2_ch3: "Ch 3. Characteristics of General Phishing",
    r2_ch3_p: 'Phishing mass-sends identical fake emails to <span class="text-white bg-white/10 px-1 rounded">random targets</span>. Uses fear messages like \'Your account is suspended\' to drive clicks.',
    r2_ch4: "Ch 4. Precision Targeting of Spear Phishing",
    r2_ch4_l1: 'Spear phishing researches the target\'s name, title, company, and colleague relationships to craft <span class="text-white bg-white/10 px-1 rounded">customized emails</span>.',
    r2_ch4_l2: "Disguised to look like they're from real colleagues or partners, making them far more successful than regular phishing.",
    r3_h: "Dangerous Attachments",
    r3_ch5: "Ch 5. Danger of Macro Documents",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">Macros (auto-execution scripts)</span> hidden in Word (.doc) or Excel (.xls) files install malware the moment you click \'Enable Content\'.',
    r3_ch6: "Ch 6. Risk Level by File Extension",
    r3_ch6_l1: "Macro-enabled documents (.doc, .xls, .ppt) — Most common attack vector",
    r3_ch6_l2: "Double-extension executables (report.pdf.exe) — Disguised as documents",
    r3_ch6_l3: "Password-protected archives (.zip, .rar) — Bypasses security scanning",
    r3_ch6_l4: "Script files (.js, .vbs, .bat) — Direct code execution",
    r4_h: "5 Warning Signs",
    r4_ch7: "Ch 7. Urgent Tone & Unknown Source",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">Urgent tone</span>: \'Verify immediately\', \'Account suspended\' — creates fear to cloud judgment.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">Unknown source</span>: An unknown sender, or someone whose name you know but the email address is different.',
    r4_ch8: "Ch 8. Links, Attachments, Grammar Errors",
    r4_ch8_l1: '<span class="text-white bg-white/10 px-1 rounded">Suspicious links</span>: Hovering reveals the actual URL differs from what\'s displayed.',
    r4_ch8_l2: '<span class="text-white bg-white/10 px-1 rounded">Unexpected attachments</span>: Files attached that you didn\'t request.',
    r4_ch8_l3: '<span class="text-white bg-white/10 px-1 rounded">Grammar errors</span>: Typos or awkward phrasing in emails claiming to be from official organizations indicates phishing.',
    r5_h: "Basic Response Methods",
    r5_ch9: "Ch 9. Reporting & Quarantine",
    r5_ch9_l1: '<span class="text-white bg-white/10 px-1 rounded">Never open the attachment</span> of a suspicious email. Report to IT security immediately.',
    r5_ch9_l2: "If already opened, disconnect from the network immediately, change passwords, and follow security team instructions.",
    r5_ch10: "Ch 10. Importance of Security Awareness Training",
    r5_ch10_l1: 'Regular <span class="text-white bg-white/10 px-1 rounded">security awareness training</span> and simulated phishing drills are the most effective defense.',
    r5_ch10_l2: 'Ultimately, <span class="text-white bg-white/10 px-1 rounded">people are the last line of defense</span>.',
    r6_title: "Training Complete!",
    r6_desc: "From email basics to response methods,<br/>you've excellently completed the<br/>T1566.001 Spearphishing Attachment fundamentals course.",
    r6_grade: "Final Grade:",
    r6_labBtn: "Go to Lab 🚀",
    r6_freeHint: "(Close this window to freely re-explore each sector)",
  },
  ja: {
    loc1: 'Sector 1: メール受信箱', loc2: 'Sector 2: フィッシング識別室', loc3: 'Sector 3: 添付ファイル分析所', loc4: 'Sector 4: 警告信号検知', loc5: 'Sector 5: 対応本部',
    d1_1: "おほん！エージェント{AGENT}、集中したまえ。メールは世界で最も使われる業務ツールであり、ハッカーの最も一般的な侵入経路でもある。",
    d1_2: "はい、チーム長！メールの5つの基本要素が見えます — 送信者、受信者、件名、本文、そして添付ファイルです！",
    d1_3: "よろしい。ハッカーはこの5つの要素を一つずつ操作して正常なメールに偽装する。受信箱でメール構造の手がかりを収集せよ！",
    d2_1: "見つけました！送信者アドレス、添付ファイル、本文 — メールの核心構成要素をすべて把握しました。",
    d2_2: "よくやった。特に送信者アドレスは最初に確認すべき項目だ。学んだ内容を基に最初の暗号を解読せよ。",
    d3_1: "さて、本当の脅威を学ぶ時間だ。「フィッシング」は不特定多数に餌をまく攻撃で、「スピアフィッシング」は特定人物を精密に狙う攻撃だ。",
    d3_2: "スピアフィッシングはターゲットの名前、役職、会社情報まで調査してカスタマイズメールを送るんですね！はるかに巧妙です。",
    d3_3: "その通り。普通のフィッシングは「誰でも引っかかれ」式だが、スピアフィッシングはまるで君だけのために書かれた手紙のように仕立てられる。識別室で違いの手がかりを集めよ！",
    d4_1: "証拠確保！一般フィッシングとスピアフィッシングの決定的な違い — ターゲット向けの調査と偽造ドメインまで捕捉しました。",
    d4_2: "素晴らしい。ではこの精密狙撃型攻撃の正確な名称を当ててみよ。",
    d5_1: "スピアフィッシングの最も致命的な武器は「添付ファイル」だ。特にマクロが隠された.doc、.xlsファイルは開くだけでマルウェアが自動実行される。",
    d5_2: "ここは添付ファイル分析所ですね！マクロ入り文書と拡張子を偽装した実行ファイルがたくさんあります！",
    d5_3: "見た目は普通の文書だが、中には時限爆弾が入っている。危険な添付ファイルの類型別手がかりを分析・収集せよ！",
    d6_1: "分析完了！マクロ文書、偽装二重拡張子実行ファイル、パスワード付き圧縮ファイル — 3種類の危険タイプすべて識別しました。",
    d6_2: "よろしい。この中で最も一般的で危険なものの正体を正確に当ててみよ。",
    d7_1: "メール構造と危険な添付ファイルを理解したので、次は不審なメールを見分ける5つの警告信号を学ぶ必要がある。",
    d7_2: "「今すぐ確認してください！」のような緊急口調、出所不明の送信者、そして文法エラーが目立ちます！",
    d7_3: "その通り。それに怪しいリンクと予期しない添付ファイルを加えて、全部で5つの警告信号を覚えよ。探知区域で手がかりをスキャンせよ！",
    d8_1: "スキャン完了！緊急口調、出所不明、文法エラー — 不審メールの警告信号をすべて捕捉しました。",
    d8_2: "おほん！よくやった。では5つの警告信号の中で本物でないものを見分けよ。",
    d9_1: "スピアフィッシングの攻撃方式を完全に把握しました。{LEADER}の組織を守るには対応手順を確立しなければなりません！",
    d9_2: "そうだ！不審メールを受け取ったら絶対に添付ファイルを開くな、直ちにITセキュリティチームに報告し、隔離措置を取れ。対応本部で手がかりを確保せよ！",
    d10_1: "全対応システム稼働完了！報告チャネル、隔離プロトコル、セキュリティ意識教育まで完璧に整いました。",
    d10_2: "お疲れ様、{AGENT}。本日学んだT1566.001スピアフィッシング添付ファイル防御の内容を最終ケースノートにスタンプしておいたので、しっかり復習するように。",
    h1: "送信者アドレス（封筒アイコン）、添付ファイル（クリップ）、<br>そして本文（モニター）をクリックしてみよう。",
    h2: "フィッシング餌（警告メール）、ターゲットプロファイル（身元調査）、<br>偽造ドメイン（地球儀）を見つけよ。",
    h3: "マクロ文書（警告ファイル）、偽装実行ファイル（ターミナル）、<br>圧縮爆弾（ロック）を見つけよ。",
    h4: "緊急口調（警告三角形）、出所不明（目のアイコン）、<br>文法エラー（虫眼鏡）を見つけよ。",
    h5: "報告システム（盾）、隔離措置（ロック）、<br>セキュリティ教育（ユーザー認証）を見つけよ。",
    c_sender_t: "送信者アドレス", c_sender_m: "メールで最初に確認すべき要素です。ハッカーは実在の企業に似た偽アドレス（例：support@g00gle.com）で信頼を偽装します。",
    c_attach_t: "添付ファイル", c_attach_m: "メールに添付されるファイルです。正常な文書に見えますが、マルウェアが隠されている可能性があり最も注意すべき要素です。",
    c_body_t: "本文内容", c_body_m: "メールの主要メッセージが含まれる領域です。ハッカーは緊急な口調や恐怖を煽る文句でユーザーに添付ファイルを開かせます。",
    c_hook_t: "フィッシング餌", c_hook_m: "不特定多数に同一の偽メールを大量送信する攻撃です。「アカウントが停止されます」のような恐怖メッセージでクリックを誘導します。",
    c_target_t: "ターゲットプロファイル", c_target_m: "スピアフィッシング攻撃者はSNS、企業サイト等でターゲットの名前、役職、同僚関係を調査しカスタマイズメールを作成します。",
    c_domain_t: "偽造ドメイン", c_domain_m: "実在の企業ドメインとほぼ同一に見える偽ドメインです。例：microsoft.com → micros0ft.com、一文字変えるだけで騙されやすくなります。",
    c_macro_t: "マクロ文書", c_macro_m: "Word(.doc)やExcel(.xls)ファイルに隠された自動実行スクリプトです。「コンテンツの有効化」をクリックするとマルウェアが即座に実行されます。",
    c_exe_t: "偽装実行ファイル", c_exe_m: "二重拡張子（例：report.pdf.exe）で文書ファイルに見せかけますが、実際は悪意あるプログラムの実行ファイルです。",
    c_zip_t: "圧縮爆弾", c_zip_m: "パスワード付きZIP/RARファイルでセキュリティソリューションの検査を回避します。メール本文にパスワードを記載しユーザーに解凍させます。",
    c_urgent_t: "緊急口調", c_urgent_m: "「即時確認必要」「アカウント停止警告」等、緊急性を強調しユーザーが考える暇なく添付ファイルを開かせる手法です。",
    c_unknown_t: "出所不明", c_unknown_m: "一度も連絡したことのない送信者、または名前は知っているがメールアドレスが異なる場合です。アドレスを必ず目で直接確認してください。",
    c_grammar_t: "文法エラー", c_grammar_m: "公式機関からのメールに不自然な文法、誤字、翻訳調の文章があればフィッシングの可能性が高いです。",
    c_report_t: "報告システム", c_report_m: "不審なメールを発見したら、まずITセキュリティチームや管理者に報告してください。一人で判断せず専門家に任せましょう。",
    c_quarantine_t: "隔離措置", c_quarantine_m: "不審メールは開かずに即座に隔離（迷惑メールフォルダへ移動または削除）します。既に開いた場合はネットワークを遮断しセキュリティチームに通報します。",
    c_aware_t: "セキュリティ教育", c_aware_m: "定期的なセキュリティ意識教育と模擬フィッシング訓練がスピアフィッシング防御の最も効果的な方法です。人が最後の防衛線です。",
    p1_title: "メールの構成要素", p1_desc: "<b>メールを構成する5つの要素</b>（送信者、受信者、件名、本文、添付ファイル）に<b>該当しないもの</b>は？",
    p1_opts: ["送信者 / 受信者", "件名 / 本文", "添付ファイル", "クッキー (Cookie)"],
    p2_title: "精密狙撃型攻撃", p2_desc: "不特定多数ではなく、<b>特定の個人や組織を精密に狙って</b>カスタマイズメールを送る狙撃型攻撃の名前は？",
    p2_opts: ["DDoS攻撃", "スピアフィッシング (Spear Phishing)", "SQLインジェクション", "クロスサイトスクリプティング (XSS)"],
    p3_title: "最も危険な添付ファイル", p3_desc: "最も危険な添付ファイルタイプで、<b>文書内に隠されたコード（マクロ）が自動実行</b>されマルウェアをインストールするものは？",
    p3_opts: [".txt (テキストファイル)", ".jpg (画像ファイル)", "マクロ付き .doc / .xls", ".mp3 (音楽ファイル)"],
    p4_title: "警告信号の識別", p4_desc: "不審メールの<b>5つの警告信号</b>（緊急口調、出所不明、怪しいリンク、予期しない添付、文法エラー）に<b>該当しないもの</b>は？",
    p4_opts: ["急な口調で即時行動を要求", "出所不明の送信者", "企業公式ドメインからの正常メール", "不自然な文法と誤字"],
    p5_title: "最優先対応行動", p5_desc: "スピアフィッシング疑いのメールを受け取った時、<b>最初にすべき行動</b>は？",
    p5_opts: ["添付ファイルを開いて内容確認", "ITセキュリティチームに即時報告", "送信者に返信して確認", "同僚に転送して意見を求める"],
    teamLeader: 'チーム長', agent: 'エージェント', secRate: '確保率', certReport: '修了報告書',
    analysisReport: '分析レポート', freeMode: '（自由探索モード）',
    proceed: '進行', next: '次へ', closeWindow: '閉じる', saveData: 'データ保存',
    inventory: '収集データ (Inventory)', noClues: 'まだ収集された手がかりがありません。',
    prevTab: '◀ 前へ', nextTab: '次へ ▶',
    rTab1: "1. メールの基本構造", rTab2: "2. フィッシングとスピアフィッシング", rTab3: "3. 危険な添付ファイル",
    rTab4: "4. 5つの警告信号", rTab5: "5. 基本対応方法", rTab6: "6. 最終訓練修了",
    r1_h: "メールの基本構造",
    r1_ch1: "Ch 1. メール5つの構成要素",
    r1_ch1_p: 'メールは<span class="text-white bg-white/10 px-1 rounded">送信者、受信者、件名、本文、添付ファイル</span>の5要素で構成されます。ハッカーはこれらすべてを操作して正常なメールに偽装します。',
    r1_ch2: "Ch 2. 送信者アドレスの重要性",
    r1_ch2_l1: '送信者アドレスはメール受信時に<span class="text-white bg-white/10 px-1 rounded">最初に確認</span>すべき項目です。',
    r1_ch2_l2: "ハッカーは実在企業に似た偽ドメイン（例：@g00gle.com）で信頼を偽装します。",
    r2_h: "フィッシングとスピアフィッシング",
    r2_ch3: "Ch 3. 一般フィッシングの特徴",
    r2_ch3_p: 'フィッシングは<span class="text-white bg-white/10 px-1 rounded">不特定多数</span>に同一の偽メールを大量送信する攻撃です。「アカウントが停止されます」のような恐怖メッセージでクリックを誘導します。',
    r2_ch4: "Ch 4. スピアフィッシングの精密ターゲティング",
    r2_ch4_l1: 'スピアフィッシングはターゲットの名前、役職、会社、同僚関係を事前調査して<span class="text-white bg-white/10 px-1 rounded">カスタマイズメール</span>を作成します。',
    r2_ch4_l2: "実際の同僚や取引先からのように装い、一般フィッシングより成功率がはるかに高くなります。",
    r3_h: "危険な添付ファイル",
    r3_ch5: "Ch 5. マクロ文書の危険性",
    r3_ch5_p: 'Word(.doc)やExcel(.xls)ファイルに隠された<span class="text-white bg-white/10 px-1 rounded">マクロ（自動実行スクリプト）</span>は「コンテンツの有効化」ボタンをクリックした瞬間マルウェアをインストールします。',
    r3_ch6: "Ch 6. ファイル拡張子別危険度",
    r3_ch6_l1: "マクロ付き文書 (.doc, .xls, .ppt) — 最も一般的な攻撃ベクター",
    r3_ch6_l2: "二重拡張子実行ファイル (report.pdf.exe) — 文書に偽装",
    r3_ch6_l3: "パスワード付き圧縮ファイル (.zip, .rar) — セキュリティ検査回避",
    r3_ch6_l4: "スクリプトファイル (.js, .vbs, .bat) — 直接コード実行",
    r4_h: "5つの警告信号",
    r4_ch7: "Ch 7. 緊急口調と出所不明",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">緊急口調</span>：「即時確認」「アカウント停止」等、恐怖心を煽り判断力を鈍らせます。',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">出所不明</span>：知らない送信者、または名前は知っているがメールアドレスが通常と異なる場合です。',
    r4_ch8: "Ch 8. リンク、添付、文法エラー",
    r4_ch8_l1: '<span class="text-white bg-white/10 px-1 rounded">怪しいリンク</span>：マウスを乗せると実際のURLが表示と異なります。',
    r4_ch8_l2: '<span class="text-white bg-white/10 px-1 rounded">予期しない添付</span>：要求していないファイルが添付されています。',
    r4_ch8_l3: '<span class="text-white bg-white/10 px-1 rounded">文法エラー</span>：公式機関メールに誤字や不自然な翻訳調があればフィッシングを疑います。',
    r5_h: "基本対応方法",
    r5_ch9: "Ch 9. 報告と隔離",
    r5_ch9_l1: '不審なメールは<span class="text-white bg-white/10 px-1 rounded">絶対に添付ファイルを開かず</span>ITセキュリティチームに即時報告します。',
    r5_ch9_l2: "既に開いてしまった場合は即座にネットワークを遮断し、パスワードを変更し、セキュリティチームの指示に従います。",
    r5_ch10: "Ch 10. セキュリティ意識教育の重要性",
    r5_ch10_l1: '定期的な<span class="text-white bg-white/10 px-1 rounded">セキュリティ意識教育</span>と模擬フィッシング訓練が最も効果的な防御手段です。',
    r5_ch10_l2: '結局<span class="text-white bg-white/10 px-1 rounded">人が最後の防衛線</span>です。',
    r6_title: "訓練修了！",
    r6_desc: "メールの基本構造から対応方法まで、<br/>T1566.001スピアフィッシング添付ファイル<br/>基礎課程を優秀に修了しました。",
    r6_grade: "最終評価：",
    r6_labBtn: "実習ラボへ移動 🚀",
    r6_freeHint: "（ウィンドウを閉じると各セクターを自由に再探索できます）",
  },
  vi: {
    loc1: 'Sector 1: Hộp thư đến', loc2: 'Sector 2: Phòng phân tích lừa đảo', loc3: 'Sector 3: Phân tích tệp đính kèm', loc4: 'Sector 4: Phát hiện tín hiệu cảnh báo', loc5: 'Sector 5: Trung tâm ứng phó',
    d1_1: "Chú ý! Đặc vụ {AGENT}, tập trung đi. Email là công cụ làm việc phổ biến nhất thế giới và cũng là con đường xâm nhập phổ biến nhất của hacker.",
    d1_2: "Vâng, thưa sếp! Tôi thấy 5 thành phần cơ bản của email — người gửi, người nhận, tiêu đề, nội dung và tệp đính kèm!",
    d1_3: "Tốt. Hacker thao túng từng thành phần trong 5 yếu tố này để ngụy trang email giả thành thật. Thu thập manh mối về cấu trúc email từ hộp thư đến!",
    d2_1: "Tìm thấy rồi! Địa chỉ người gửi, tệp đính kèm, nội dung — đã xác định tất cả thành phần chính của email.",
    d2_2: "Giỏi lắm. Đặc biệt địa chỉ người gửi là mục cần kiểm tra đầu tiên. Dựa trên kiến thức đã học, hãy giải mã mật mã đầu tiên.",
    d3_1: "Bây giờ là lúc học về mối đe dọa thực sự. 'Phishing' rải mồi cho nhiều người, còn 'Spear Phishing' là cuộc tấn công chính xác nhắm vào cá nhân cụ thể.",
    d3_2: "Spear phishing nghiên cứu cả tên, chức vụ, thông tin công ty của mục tiêu để gửi email tùy chỉnh! Tinh vi hơn nhiều.",
    d3_3: "Đúng vậy. Phishing thông thường là kiểu 'ai dính thì dính', nhưng spear phishing được thiết kế như thư viết riêng cho bạn. Thu thập manh mối về sự khác biệt trong phòng phân tích!",
    d4_1: "Đã thu thập bằng chứng! Sự khác biệt quyết định giữa phishing và spear phishing — nghiên cứu mục tiêu và tên miền giả mạo.",
    d4_2: "Xuất sắc. Hãy cho biết chính xác tên của loại tấn công nhắm mục tiêu chính xác này.",
    d5_1: "Vũ khí chết người nhất của spear phishing chính là 'tệp đính kèm'. Đặc biệt file .doc, .xls ẩn macro sẽ tự động chạy mã độc khi mở.",
    d5_2: "Đây là phòng phân tích tệp đính kèm! Đầy tài liệu chứa macro và file thực thi ngụy trang phần mở rộng!",
    d5_3: "Bề ngoài là tài liệu bình thường, nhưng bên trong là bom hẹn giờ. Phân tích và thu thập manh mối về từng loại tệp đính kèm nguy hiểm!",
    d6_1: "Phân tích hoàn tất! Tài liệu macro, file thực thi ngụy trang phần mở rộng kép, file nén có mật khẩu — đã xác định cả 3 loại nguy hiểm.",
    d6_2: "Tốt. Hãy xác định chính xác loại phổ biến và nguy hiểm nhất trong số đó.",
    d7_1: "Đã hiểu cấu trúc email và tệp đính kèm nguy hiểm, bây giờ cần học 5 tín hiệu cảnh báo để nhận diện email đáng ngờ.",
    d7_2: "Tôi nhận thấy giọng điệu khẩn cấp như 'Xác minh ngay!', người gửi không rõ nguồn gốc, và lỗi ngữ pháp!",
    d7_3: "Chính xác. Thêm liên kết đáng ngờ và tệp đính kèm bất ngờ, tổng cộng 5 tín hiệu cảnh báo. Quét tìm manh mối trong khu vực phát hiện!",
    d8_1: "Quét hoàn tất! Giọng khẩn cấp, nguồn không rõ, lỗi ngữ pháp — đã phát hiện tất cả tín hiệu cảnh báo email đáng ngờ.",
    d8_2: "Rất tốt! Hãy chỉ ra tín hiệu nào KHÔNG phải là tín hiệu cảnh báo thực sự.",
    d9_1: "Đã nắm vững hoàn toàn phương thức tấn công spear phishing. Cần thiết lập quy trình ứng phó để bảo vệ tổ chức của {LEADER}!",
    d9_2: "Đúng! Khi nhận email đáng ngờ, tuyệt đối không mở tệp đính kèm, báo cáo IT security ngay lập tức và thực hiện cách ly. Thu thập manh mối tại Trung tâm ứng phó!",
    d10_1: "Tất cả hệ thống ứng phó đã hoạt động! Kênh báo cáo, quy trình cách ly, đào tạo nhận thức bảo mật đều sẵn sàng.",
    d10_2: "Tốt lắm, {AGENT}. Nội dung phòng thủ T1566.001 Spearphishing Attachment hôm nay đã được đóng dấu vào sổ tay vụ án cuối cùng. Hãy ôn tập kỹ.",
    h1: "Nhấp vào địa chỉ người gửi (biểu tượng phong bì), tệp đính kèm (kẹp giấy), <br>và nội dung (màn hình).",
    h2: "Tìm mồi lừa đảo (email cảnh báo), hồ sơ mục tiêu (điều tra), <br>và tên miền giả (quả địa cầu).",
    h3: "Tìm tài liệu macro (file cảnh báo), file thực thi ngụy trang (terminal), <br>và bom nén (ổ khóa).",
    h4: "Tìm giọng khẩn cấp (tam giác cảnh báo), nguồn không rõ (biểu tượng mắt), <br>và lỗi ngữ pháp (kính lúp).",
    h5: "Tìm hệ thống báo cáo (khiên), biện pháp cách ly (ổ khóa), <br>và đào tạo bảo mật (xác thực người dùng).",
    c_sender_t: "Địa chỉ người gửi", c_sender_m: "Yếu tố cần kiểm tra đầu tiên trong email. Hacker dùng địa chỉ giả tương tự công ty thật (ví dụ: support@g00gle.com) để tạo niềm tin.",
    c_attach_t: "Tệp đính kèm", c_attach_m: "File được gửi kèm email. Trông như tài liệu bình thường nhưng có thể ẩn mã độc — yếu tố cần cảnh giác nhất.",
    c_body_t: "Nội dung email", c_body_m: "Khu vực chứa thông điệp chính của email. Hacker dùng giọng khẩn cấp hoặc gây sợ hãi để dụ người dùng mở tệp đính kèm.",
    c_hook_t: "Mồi lừa đảo", c_hook_m: "Tấn công gửi hàng loạt email giả giống nhau cho nhiều người. Dùng thông điệp gây sợ như 'Tài khoản bị đình chỉ' để dụ click.",
    c_target_t: "Hồ sơ mục tiêu", c_target_m: "Kẻ tấn công spear phishing nghiên cứu tên, chức vụ, mối quan hệ đồng nghiệp qua mạng xã hội và website công ty để viết email tùy chỉnh.",
    c_domain_t: "Tên miền giả", c_domain_m: "Tên miền giả gần giống tên miền công ty thật. Ví dụ: microsoft.com → micros0ft.com, chỉ đổi một ký tự cũng dễ bị lừa.",
    c_macro_t: "Tài liệu macro", c_macro_m: "Script tự động thực thi ẩn trong file Word(.doc) hoặc Excel(.xls). Click 'Bật nội dung' là mã độc chạy ngay lập tức.",
    c_exe_t: "File thực thi ngụy trang", c_exe_m: "Dùng phần mở rộng kép (ví dụ: report.pdf.exe) trông như file tài liệu, nhưng thực chất là chương trình độc hại.",
    c_zip_t: "Bom nén", c_zip_m: "File ZIP/RAR có mật khẩu để vượt qua kiểm tra bảo mật. Mật khẩu được cung cấp trong nội dung email, dụ người dùng tự giải nén.",
    c_urgent_t: "Giọng khẩn cấp", c_urgent_m: "'Cần xác minh ngay', 'Cảnh báo đình chỉ tài khoản' — thủ thuật tạo sự khẩn cấp để người dùng mở tệp đính kèm mà không suy nghĩ.",
    c_unknown_t: "Nguồn không rõ", c_unknown_m: "Người gửi chưa bao giờ liên lạc, hoặc biết tên nhưng địa chỉ email khác. Luôn xác minh địa chỉ bằng mắt.",
    c_grammar_t: "Lỗi ngữ pháp", c_grammar_m: "Email từ tổ chức chính thức có ngữ pháp vụng, lỗi chính tả, câu dịch máy thì khả năng cao là lừa đảo.",
    c_report_t: "Hệ thống báo cáo", c_report_m: "Khi phát hiện email đáng ngờ, hãy báo cáo ngay cho đội bảo mật IT hoặc quản trị viên. Đừng tự phán đoán, hãy để chuyên gia xử lý.",
    c_quarantine_t: "Biện pháp cách ly", c_quarantine_m: "Không mở email đáng ngờ — cách ly ngay (chuyển spam hoặc xóa). Nếu đã mở, ngắt mạng và thông báo đội bảo mật.",
    c_aware_t: "Đào tạo bảo mật", c_aware_m: "Đào tạo nhận thức bảo mật định kỳ và diễn tập phishing mô phỏng là biện pháp phòng thủ hiệu quả nhất. Con người là tuyến phòng thủ cuối cùng.",
    p1_title: "Thành phần email", p1_desc: "Yếu tố nào <b>KHÔNG</b> thuộc <b>5 thành phần email</b> (người gửi, người nhận, tiêu đề, nội dung, tệp đính kèm)?",
    p1_opts: ["Người gửi / Người nhận", "Tiêu đề / Nội dung", "Tệp đính kèm", "Cookie"],
    p2_title: "Tấn công nhắm mục tiêu", p2_desc: "Tên của cuộc tấn công gửi <b>email tùy chỉnh nhắm vào cá nhân hoặc tổ chức cụ thể</b> thay vì mục tiêu ngẫu nhiên là gì?",
    p2_opts: ["Tấn công DDoS", "Spear Phishing", "SQL Injection", "Cross-Site Scripting (XSS)"],
    p3_title: "Tệp đính kèm nguy hiểm nhất", p3_desc: "Loại tệp đính kèm nguy hiểm nhất, trong đó <b>mã ẩn (macro) tự động thực thi</b> để cài mã độc là gì?",
    p3_opts: [".txt (File văn bản)", ".jpg (File ảnh)", "Macro trong .doc / .xls", ".mp3 (File âm thanh)"],
    p4_title: "Nhận diện tín hiệu cảnh báo", p4_desc: "Tín hiệu nào <b>KHÔNG</b> thuộc <b>5 tín hiệu cảnh báo</b> email đáng ngờ?",
    p4_opts: ["Giọng khẩn cấp yêu cầu hành động ngay", "Người gửi không rõ nguồn gốc", "Email bình thường từ tên miền chính thức", "Ngữ pháp vụng và lỗi chính tả"],
    p5_title: "Hành động ưu tiên hàng đầu", p5_desc: "Khi nhận email nghi ngờ spear phishing, <b>hành động đầu tiên</b> nên làm là gì?",
    p5_opts: ["Mở tệp đính kèm kiểm tra", "Báo cáo IT security ngay", "Trả lời người gửi để xác minh", "Chuyển tiếp cho đồng nghiệp hỏi ý kiến"],
    teamLeader: 'Đội trưởng', agent: 'Đặc vụ', secRate: 'Đã thu thập', certReport: 'Báo cáo hoàn thành',
    analysisReport: 'Báo cáo phân tích', freeMode: '(Chế độ khám phá tự do)',
    proceed: 'Tiếp tục', next: 'Tiếp', closeWindow: 'Đóng', saveData: 'Lưu dữ liệu',
    inventory: 'Dữ liệu thu thập (Inventory)', noClues: 'Chưa thu thập manh mối nào.',
    prevTab: '◀ Trước', nextTab: 'Tiếp ▶',
    rTab1: "1. Cấu trúc email", rTab2: "2. Phishing vs Spear Phishing", rTab3: "3. Tệp đính kèm nguy hiểm",
    rTab4: "4. 5 tín hiệu cảnh báo", rTab5: "5. Phương pháp ứng phó", rTab6: "6. Hoàn thành đào tạo",
    r1_h: "Cấu trúc cơ bản của email", r1_ch1: "Ch 1. 5 thành phần email",
    r1_ch1_p: 'Email gồm 5 thành phần: <span class="text-white bg-white/10 px-1 rounded">người gửi, người nhận, tiêu đề, nội dung, tệp đính kèm</span>. Hacker thao túng tất cả để ngụy trang email.',
    r1_ch2: "Ch 2. Tầm quan trọng của địa chỉ người gửi",
    r1_ch2_l1: 'Địa chỉ người gửi là mục <span class="text-white bg-white/10 px-1 rounded">cần kiểm tra đầu tiên</span> khi nhận email.',
    r1_ch2_l2: "Hacker dùng tên miền giả tương tự công ty thật (ví dụ: @g00gle.com) để tạo niềm tin.",
    r2_h: "Phishing vs Spear Phishing", r2_ch3: "Ch 3. Đặc điểm Phishing thông thường",
    r2_ch3_p: 'Phishing gửi hàng loạt email giả cho <span class="text-white bg-white/10 px-1 rounded">nhiều người</span>. Dùng thông điệp gây sợ để dụ click.',
    r2_ch4: "Ch 4. Nhắm mục tiêu chính xác của Spear Phishing",
    r2_ch4_l1: 'Spear phishing nghiên cứu tên, chức vụ, công ty, đồng nghiệp để tạo <span class="text-white bg-white/10 px-1 rounded">email tùy chỉnh</span>.',
    r2_ch4_l2: "Ngụy trang như từ đồng nghiệp hoặc đối tác thật, tỷ lệ thành công cao hơn phishing thường.",
    r3_h: "Tệp đính kèm nguy hiểm", r3_ch5: "Ch 5. Nguy hiểm của tài liệu macro",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">Macro (script tự động)</span> ẩn trong file Word(.doc) hoặc Excel(.xls) sẽ cài mã độc ngay khi click "Bật nội dung".',
    r3_ch6: "Ch 6. Mức độ nguy hiểm theo phần mở rộng",
    r3_ch6_l1: "Tài liệu chứa macro (.doc, .xls, .ppt) — Vector tấn công phổ biến nhất",
    r3_ch6_l2: "File thực thi phần mở rộng kép (report.pdf.exe) — Ngụy trang tài liệu",
    r3_ch6_l3: "File nén có mật khẩu (.zip, .rar) — Vượt kiểm tra bảo mật",
    r3_ch6_l4: "File script (.js, .vbs, .bat) — Thực thi mã trực tiếp",
    r4_h: "5 tín hiệu cảnh báo", r4_ch7: "Ch 7. Giọng khẩn cấp & Nguồn không rõ",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">Giọng khẩn cấp</span>: "Xác minh ngay", "Đình chỉ tài khoản" — gây sợ hãi làm mất khả năng phán đoán.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">Nguồn không rõ</span>: Người gửi lạ, hoặc biết tên nhưng địa chỉ email khác thường.',
    r4_ch8: "Ch 8. Liên kết, đính kèm, lỗi ngữ pháp",
    r4_ch8_l1: '<span class="text-white bg-white/10 px-1 rounded">Liên kết đáng ngờ</span>: Di chuột lên thấy URL thật khác với hiển thị.',
    r4_ch8_l2: '<span class="text-white bg-white/10 px-1 rounded">Đính kèm bất ngờ</span>: File được đính kèm mà bạn không yêu cầu.',
    r4_ch8_l3: '<span class="text-white bg-white/10 px-1 rounded">Lỗi ngữ pháp</span>: Email từ tổ chức chính thức có lỗi chính tả hoặc câu dịch máy thì nghi lừa đảo.',
    r5_h: "Phương pháp ứng phó cơ bản", r5_ch9: "Ch 9. Báo cáo & Cách ly",
    r5_ch9_l1: 'Email đáng ngờ thì <span class="text-white bg-white/10 px-1 rounded">tuyệt đối không mở tệp đính kèm</span>, báo cáo IT security ngay.',
    r5_ch9_l2: "Nếu đã mở, ngắt mạng ngay, đổi mật khẩu và làm theo hướng dẫn của đội bảo mật.",
    r5_ch10: "Ch 10. Tầm quan trọng của đào tạo nhận thức bảo mật",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">Đào tạo nhận thức bảo mật</span> định kỳ và diễn tập phishing mô phỏng là biện pháp phòng thủ hiệu quả nhất.',
    r5_ch10_l2: 'Cuối cùng, <span class="text-white bg-white/10 px-1 rounded">con người là tuyến phòng thủ cuối cùng</span>.',
    r6_title: "Hoàn thành đào tạo!",
    r6_desc: "Từ cấu trúc email đến phương pháp ứng phó,<br/>bạn đã xuất sắc hoàn thành khóa<br/>T1566.001 Spearphishing Attachment cơ bản.",
    r6_grade: "Xếp hạng cuối:",
    r6_labBtn: "Đến phòng thực hành 🚀",
    r6_freeHint: "(Đóng cửa sổ để tự do khám phá lại từng khu vực)",
  },
  ar: {
    loc1: 'القطاع 1: صندوق البريد', loc2: 'القطاع 2: مختبر تحليل التصيد', loc3: 'القطاع 3: تحليل المرفقات', loc4: 'القطاع 4: كشف إشارات التحذير', loc5: 'القطاع 5: مقر الاستجابة',
    d1_1: "انتبه! العميل {AGENT}، ركّز. البريد الإلكتروني هو أداة العمل الأكثر استخداماً في العالم وأيضاً أكثر مسارات اختراق القراصنة شيوعاً.",
    d1_2: "نعم يا قائد! أرى 5 مكونات أساسية للبريد — المرسل، المستلم، الموضوع، المحتوى، والمرفقات!",
    d1_3: "جيد. يتلاعب القراصنة بكل عنصر من هذه العناصر الخمسة لتمويه رسائلهم كرسائل حقيقية. اجمع أدلة حول بنية البريد من صندوق الوارد!",
    d2_1: "وجدتها! عنوان المرسل، المرفق، المحتوى — حددت جميع المكونات الرئيسية للبريد.",
    d2_2: "أحسنت. عنوان المرسل هو أول شيء يجب فحصه. بناءً على ما تعلمته، فك الشفرة الأولى.",
    d3_1: "حان وقت تعلم التهديدات الحقيقية. 'التصيد' يلقي شبكة واسعة، بينما 'التصيد الموجه' هجوم دقيق يستهدف أفراداً محددين.",
    d3_2: "التصيد الموجه يبحث عن اسم الهدف ومنصبه ومعلومات شركته لإرسال بريد مخصص! أكثر تطوراً بكثير.",
    d3_3: "بالضبط. التصيد العادي أسلوب 'من يقع يقع'، لكن التصيد الموجه مصنوع كرسالة شخصية لك فقط. اجمع أدلة الاختلافات في مختبر التحليل!",
    d4_1: "تم تأمين الأدلة! الفرق الحاسم بين التصيد والتصيد الموجه — البحث المستهدف والنطاقات المزورة.",
    d4_2: "ممتاز. الآن حدد الاسم الدقيق لهذا الهجوم الموجه بدقة.",
    d5_1: "أخطر سلاح في التصيد الموجه هو 'المرفق'. خاصة ملفات .doc و .xls التي تحتوي ماكرو مخفي ينفذ البرمجيات الخبيثة تلقائياً عند الفتح.",
    d5_2: "هذا مختبر تحليل المرفقات! مليء بمستندات تحتوي ماكرو وملفات تنفيذية مموهة بامتدادات مزيفة!",
    d5_3: "تبدو كمستندات عادية لكنها تخفي قنابل موقوتة. حلل واجمع أدلة عن كل نوع من المرفقات الخطيرة!",
    d6_1: "اكتمل التحليل! مستندات ماكرو، ملفات تنفيذية مموهة بامتداد مزدوج، ملفات مضغوطة بكلمة مرور — تم تحديد الأنواع الثلاثة الخطيرة.",
    d6_2: "جيد. الآن حدد الأكثر شيوعاً وخطورة من بينها.",
    d7_1: "الآن بعد فهم بنية البريد والمرفقات الخطيرة، حان وقت تعلم 5 إشارات تحذير لتحديد الرسائل المشبوهة.",
    d7_2: "ألاحظ لهجة عاجلة مثل 'تحقق فوراً!'، مرسل مجهول، وأخطاء نحوية!",
    d7_3: "بالضبط. أضف الروابط المشبوهة والمرفقات غير المتوقعة ليكون لديك 5 إشارات تحذير. امسح المنطقة بحثاً عن أدلة!",
    d8_1: "اكتمل المسح! لهجة عاجلة، مصدر مجهول، أخطاء نحوية — تم رصد جميع إشارات التحذير.",
    d8_2: "أحسنت! الآن حدد أي من الإشارات الخمس ليست حقيقية.",
    d9_1: "فهمت تماماً أساليب هجوم التصيد الموجه. يجب وضع إجراءات استجابة لحماية مؤسسة {LEADER}!",
    d9_2: "صحيح! عند تلقي بريد مشبوه، لا تفتح المرفق أبداً، أبلغ أمن تكنولوجيا المعلومات فوراً واتخذ إجراءات العزل. اجمع الأدلة في مقر الاستجابة!",
    d10_1: "جميع أنظمة الاستجابة تعمل! قنوات الإبلاغ وبروتوكولات العزل والتدريب على الوعي الأمني جاهزة.",
    d10_2: "أحسنت يا {AGENT}. تم ختم دفتر القضايا النهائي بمحتوى تدريب الدفاع عن T1566.001 اليوم. راجعه بعناية.",
    h1: "انقر على عنوان المرسل (أيقونة الظرف)، المرفق (المشبك)، <br>والمحتوى (الشاشة).",
    h2: "ابحث عن طُعم التصيد (بريد تحذيري)، ملف الهدف (تحقيق)، <br>والنطاق المزور (الكرة الأرضية).",
    h3: "ابحث عن مستند الماكرو (ملف تحذيري)، الملف التنفيذي المموه (الطرفية)، <br>والقنبلة المضغوطة (القفل).",
    h4: "ابحث عن اللهجة العاجلة (مثلث التحذير)، المصدر المجهول (أيقونة العين)، <br>والأخطاء النحوية (العدسة المكبرة).",
    h5: "ابحث عن نظام الإبلاغ (الدرع)، إجراء العزل (القفل)، <br>والتدريب الأمني (التحقق من المستخدم).",
    c_sender_t: "عنوان المرسل", c_sender_m: "أول عنصر يجب فحصه في أي بريد. يستخدم القراصنة عناوين مزيفة مشابهة لشركات حقيقية (مثل: support@g00gle.com) لبناء الثقة.",
    c_attach_t: "المرفق", c_attach_m: "ملفات مرفقة بالبريد. تبدو كمستندات عادية لكنها قد تحتوي برمجيات خبيثة مخفية — العنصر الأكثر خطورة.",
    c_body_t: "محتوى البريد", c_body_m: "منطقة الرسالة الرئيسية. يستخدم القراصنة لهجة عاجلة أو عبارات مخيفة لدفع المستخدم لفتح المرفقات.",
    c_hook_t: "طُعم التصيد", c_hook_m: "هجوم يرسل رسائل مزيفة متطابقة لأهداف عشوائية. يستخدم رسائل خوف مثل 'تم تعليق حسابك' لدفع النقر.",
    c_target_t: "ملف الهدف", c_target_m: "يبحث مهاجم التصيد الموجه عن اسم الهدف ومنصبه وعلاقاته عبر وسائل التواصل ومواقع الشركات لصياغة بريد مخصص.",
    c_domain_t: "نطاق مزور", c_domain_m: "نطاق مزيف شبه مطابق لنطاق شركة حقيقية. مثال: microsoft.com → micros0ft.com — تغيير حرف واحد كافٍ للخداع.",
    c_macro_t: "مستند ماكرو", c_macro_m: "سكريبتات تنفيذ تلقائي مخفية في ملفات Word(.doc) أو Excel(.xls). النقر على 'تمكين المحتوى' يثبت البرمجيات الخبيثة فوراً.",
    c_exe_t: "ملف تنفيذي مموه", c_exe_m: "يستخدم امتداداً مزدوجاً (مثل: report.pdf.exe) ليبدو كملف مستند، لكنه في الواقع برنامج خبيث.",
    c_zip_t: "قنبلة مضغوطة", c_zip_m: "ملفات ZIP/RAR محمية بكلمة مرور لتجاوز فحص الأمان. يتم إعطاء كلمة المرور في نص البريد لدفع المستخدم لفك الضغط.",
    c_urgent_t: "لهجة عاجلة", c_urgent_m: "'تحقق فوراً'، 'تحذير تعليق الحساب' — تكتيك يخلق إلحاحاً ليفتح المستخدم المرفقات بدون تفكير.",
    c_unknown_t: "مصدر مجهول", c_unknown_m: "مرسل لم تتواصل معه قط، أو شخص تعرف اسمه لكن عنوان بريده مختلف. تحقق دائماً من العنوان بصرياً.",
    c_grammar_t: "أخطاء نحوية", c_grammar_m: "قواعد نحوية ركيكة أو أخطاء إملائية في رسائل تدّعي أنها من مؤسسات رسمية تشير بقوة إلى التصيد.",
    c_report_t: "نظام الإبلاغ", c_report_m: "عند اكتشاف بريد مشبوه، أبلغ فريق أمن تكنولوجيا المعلومات فوراً. لا تحكم بنفسك — اترك الأمر للخبراء.",
    c_quarantine_t: "إجراء العزل", c_quarantine_m: "لا تفتح البريد المشبوه — اعزله فوراً (انقله للبريد العشوائي أو احذفه). إذا فتحته، افصل الشبكة وأبلغ فريق الأمن.",
    c_aware_t: "التدريب الأمني", c_aware_m: "التدريب المنتظم على الوعي الأمني وتمارين التصيد المحاكاة هي أفعل دفاع ضد التصيد الموجه. البشر هم خط الدفاع الأخير.",
    p1_title: "مكونات البريد", p1_desc: "أي مما يلي <b>ليس</b> من <b>المكونات الخمسة للبريد</b> (المرسل، المستلم، الموضوع، المحتوى، المرفق)؟",
    p1_opts: ["المرسل / المستلم", "الموضوع / المحتوى", "المرفق", "ملف تعريف الارتباط (Cookie)"],
    p2_title: "هجوم موجه بدقة", p2_desc: "ما اسم الهجوم الذي يرسل <b>رسائل مخصصة لأفراد أو مؤسسات محددة</b> بدلاً من أهداف عشوائية؟",
    p2_opts: ["هجوم DDoS", "التصيد الموجه (Spear Phishing)", "حقن SQL", "البرمجة عبر المواقع (XSS)"],
    p3_title: "أخطر مرفق", p3_desc: "أخطر نوع مرفق حيث <b>ينفذ الكود المخفي (ماكرو) تلقائياً</b> لتثبيت البرمجيات الخبيثة هو؟",
    p3_opts: [".txt (ملف نصي)", ".jpg (ملف صورة)", "ماكرو في .doc / .xls", ".mp3 (ملف صوتي)"],
    p4_title: "تحديد إشارات التحذير", p4_desc: "أي مما يلي <b>ليس</b> من <b>إشارات التحذير الخمس</b> للبريد المشبوه؟",
    p4_opts: ["لهجة عاجلة تطالب بإجراء فوري", "مرسل مجهول المصدر", "بريد عادي من نطاق الشركة الرسمي", "قواعد نحوية ركيكة وأخطاء إملائية"],
    p5_title: "أولوية الاستجابة القصوى", p5_desc: "عند تلقي بريد يُشتبه أنه تصيد موجه، ما <b>أول إجراء</b> يجب اتخاذه؟",
    p5_opts: ["فتح المرفق للتحقق من المحتوى", "إبلاغ فريق أمن تكنولوجيا المعلومات فوراً", "الرد على المرسل للتحقق", "إعادة توجيهه للزملاء لأخذ آرائهم"],
    teamLeader: 'القائد', agent: 'العميل', secRate: 'تم التأمين', certReport: 'تقرير الإتمام',
    analysisReport: 'تقرير التحليل', freeMode: '(وضع الاستكشاف الحر)',
    proceed: 'متابعة', next: 'التالي', closeWindow: 'إغلاق', saveData: 'حفظ البيانات',
    inventory: 'البيانات المجمعة (المخزون)', noClues: 'لم يتم جمع أدلة بعد.',
    prevTab: '◀ السابق', nextTab: 'التالي ▶',
    rTab1: "1. أساسيات البريد", rTab2: "2. التصيد vs التصيد الموجه", rTab3: "3. المرفقات الخطيرة",
    rTab4: "4. 5 إشارات تحذير", rTab5: "5. طرق الاستجابة الأساسية", rTab6: "6. إتمام التدريب",
    r1_h: "أساسيات البريد الإلكتروني", r1_ch1: "الفصل 1. المكونات الخمسة للبريد",
    r1_ch1_p: 'يتكون البريد من 5 مكونات: <span class="text-white bg-white/10 px-1 rounded">المرسل، المستلم، الموضوع، المحتوى، المرفق</span>. يتلاعب القراصنة بجميعها لتمويه البريد.',
    r1_ch2: "الفصل 2. أهمية عنوان المرسل",
    r1_ch2_l1: 'عنوان المرسل هو <span class="text-white bg-white/10 px-1 rounded">أول ما يجب فحصه</span> عند تلقي بريد.',
    r1_ch2_l2: "يستخدم القراصنة نطاقات مزيفة مشابهة لشركات حقيقية (مثل: @g00gle.com) لبناء الثقة.",
    r2_h: "التصيد مقابل التصيد الموجه", r2_ch3: "الفصل 3. خصائص التصيد العام",
    r2_ch3_p: 'التصيد يرسل رسائل مزيفة متطابقة <span class="text-white bg-white/10 px-1 rounded">لأهداف عشوائية</span>. يستخدم رسائل خوف لدفع النقر.',
    r2_ch4: "الفصل 4. الاستهداف الدقيق للتصيد الموجه",
    r2_ch4_l1: 'يبحث التصيد الموجه عن اسم الهدف ومنصبه وشركته وزملائه لصياغة <span class="text-white bg-white/10 px-1 rounded">بريد مخصص</span>.',
    r2_ch4_l2: "يبدو كأنه من زملاء أو شركاء حقيقيين مما يجعله أنجح بكثير من التصيد العادي.",
    r3_h: "المرفقات الخطيرة", r3_ch5: "الفصل 5. خطر مستندات الماكرو",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">الماكرو (سكريبتات التنفيذ التلقائي)</span> المخفي في ملفات Word(.doc) أو Excel(.xls) يثبت البرمجيات الخبيثة لحظة النقر على "تمكين المحتوى".',
    r3_ch6: "الفصل 6. مستوى الخطر حسب الامتداد",
    r3_ch6_l1: "مستندات تحتوي ماكرو (.doc, .xls, .ppt) — أكثر متجهات الهجوم شيوعاً",
    r3_ch6_l2: "ملفات تنفيذية بامتداد مزدوج (report.pdf.exe) — مموهة كمستندات",
    r3_ch6_l3: "ملفات مضغوطة بكلمة مرور (.zip, .rar) — تتجاوز فحص الأمان",
    r3_ch6_l4: "ملفات سكريبت (.js, .vbs, .bat) — تنفيذ كود مباشر",
    r4_h: "5 إشارات تحذير", r4_ch7: "الفصل 7. اللهجة العاجلة والمصدر المجهول",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">لهجة عاجلة</span>: "تحقق فوراً"، "تعليق الحساب" — تخلق خوفاً يشوش الحكم.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">مصدر مجهول</span>: مرسل غير معروف، أو شخص تعرف اسمه لكن عنوان بريده مختلف عن المعتاد.',
    r4_ch8: "الفصل 8. الروابط والمرفقات والأخطاء النحوية",
    r4_ch8_l1: '<span class="text-white bg-white/10 px-1 rounded">روابط مشبوهة</span>: عند التمرير يظهر URL حقيقي مختلف عن المعروض.',
    r4_ch8_l2: '<span class="text-white bg-white/10 px-1 rounded">مرفقات غير متوقعة</span>: ملفات مرفقة لم تطلبها.',
    r4_ch8_l3: '<span class="text-white bg-white/10 px-1 rounded">أخطاء نحوية</span>: أخطاء إملائية أو صياغة ركيكة في رسائل تدّعي أنها من مؤسسات رسمية تشير للتصيد.',
    r5_h: "طرق الاستجابة الأساسية", r5_ch9: "الفصل 9. الإبلاغ والعزل",
    r5_ch9_l1: 'البريد المشبوه: <span class="text-white bg-white/10 px-1 rounded">لا تفتح المرفق أبداً</span>. أبلغ فريق أمن تكنولوجيا المعلومات فوراً.',
    r5_ch9_l2: "إذا فتحته بالفعل، افصل الشبكة فوراً، غيّر كلمات المرور، واتبع تعليمات فريق الأمن.",
    r5_ch10: "الفصل 10. أهمية التدريب على الوعي الأمني",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">التدريب المنتظم على الوعي الأمني</span> وتمارين التصيد المحاكاة هي أفعل وسيلة دفاع.',
    r5_ch10_l2: 'في النهاية، <span class="text-white bg-white/10 px-1 rounded">البشر هم خط الدفاع الأخير</span>.',
    r6_title: "اكتمل التدريب!",
    r6_desc: "من أساسيات البريد إلى طرق الاستجابة،<br/>أكملت بامتياز الدورة الأساسية<br/>T1566.001 مرفقات التصيد الموجه.",
    r6_grade: "التقييم النهائي:",
    r6_labBtn: "انتقل إلى المختبر 🚀",
    r6_freeHint: "(أغلق هذه النافذة لاستكشاف كل قطاع بحرية)",
  },
};

const getT = (lang) => T[lang] || T.ko;

// ──────────────────────────────────────────────────────────────────────────────
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Novice)
// ──────────────────────────────────────────────────────────────────────────────
const buildCHAPTERS = (t) => [
  {
    scene: 'scene_phase1', loc: t.loc1,
    dialogues: [
      { speaker: 'TEAM_LEADER', text: t.d1_1 },
      { speaker: 'AGENT_NAME', text: t.d1_2 },
      { speaker: 'TEAM_LEADER', text: t.d1_3 }
    ],
    hint: t.h1
  },
  {
    scene: 'scene_phase1', loc: t.loc1,
    dialogues: [
      { speaker: 'AGENT_NAME', text: t.d2_1 },
      { speaker: 'TEAM_LEADER', text: t.d2_2 }
    ],
    triggerPuzzle: 1
  },
  {
    scene: 'scene_phase2', loc: t.loc2,
    dialogues: [
      { speaker: 'TEAM_LEADER', text: t.d3_1 },
      { speaker: 'AGENT_NAME', text: t.d3_2 },
      { speaker: 'TEAM_LEADER', text: t.d3_3 }
    ],
    hint: t.h2
  },
  {
    scene: 'scene_phase2', loc: t.loc2,
    dialogues: [
      { speaker: 'AGENT_NAME', text: t.d4_1 },
      { speaker: 'TEAM_LEADER', text: t.d4_2 }
    ],
    triggerPuzzle: 2
  },
  {
    scene: 'scene_phase3', loc: t.loc3,
    dialogues: [
      { speaker: 'TEAM_LEADER', text: t.d5_1 },
      { speaker: 'AGENT_NAME', text: t.d5_2 },
      { speaker: 'TEAM_LEADER', text: t.d5_3 }
    ],
    hint: t.h3
  },
  {
    scene: 'scene_phase3', loc: t.loc3,
    dialogues: [
      { speaker: 'AGENT_NAME', text: t.d6_1 },
      { speaker: 'TEAM_LEADER', text: t.d6_2 }
    ],
    triggerPuzzle: 3
  },
  {
    scene: 'scene_phase4', loc: t.loc4,
    dialogues: [
      { speaker: 'TEAM_LEADER', text: t.d7_1 },
      { speaker: 'AGENT_NAME', text: t.d7_2 },
      { speaker: 'TEAM_LEADER', text: t.d7_3 }
    ],
    hint: t.h4
  },
  {
    scene: 'scene_phase4', loc: t.loc4,
    dialogues: [
      { speaker: 'AGENT_NAME', text: t.d8_1 },
      { speaker: 'TEAM_LEADER', text: t.d8_2 }
    ],
    triggerPuzzle: 4
  },
  {
    scene: 'scene_phase5', loc: t.loc5,
    dialogues: [
      { speaker: 'AGENT_NAME', text: t.d9_1 },
      { speaker: 'TEAM_LEADER', text: t.d9_2 }
    ],
    hint: t.h5
  },
  {
    scene: 'scene_phase5', loc: t.loc5,
    dialogues: [
      { speaker: 'AGENT_NAME', text: t.d10_1 },
      { speaker: 'TEAM_LEADER', text: t.d10_2 }
    ],
    triggerBook: true
  }
];

const buildCLUES_DATA = (t) => ({
  scene_phase1: [
    { id: 'sender_info',    icon: Mail,       title: t.c_sender_t,   msg: t.c_sender_m },
    { id: 'attachment_icon', icon: Paperclip,  title: t.c_attach_t,   msg: t.c_attach_m },
    { id: 'email_body',     icon: Monitor,     title: t.c_body_t,     msg: t.c_body_m }
  ],
  scene_phase2: [
    { id: 'phishing_hook',  icon: MailWarning, title: t.c_hook_t,     msg: t.c_hook_m },
    { id: 'target_profile', icon: UserCheck,   title: t.c_target_t,   msg: t.c_target_m },
    { id: 'fake_domain',    icon: Globe,       title: t.c_domain_t,   msg: t.c_domain_m }
  ],
  scene_phase3: [
    { id: 'macro_doc',      icon: FileWarning, title: t.c_macro_t,    msg: t.c_macro_m },
    { id: 'exe_disguise',   icon: Terminal,    title: t.c_exe_t,      msg: t.c_exe_m },
    { id: 'zip_bomb',       icon: Lock,        title: t.c_zip_t,      msg: t.c_zip_m }
  ],
  scene_phase4: [
    { id: 'urgent_tone',    icon: AlertTriangle, title: t.c_urgent_t,  msg: t.c_urgent_m },
    { id: 'unknown_sender', icon: Eye,           title: t.c_unknown_t, msg: t.c_unknown_m },
    { id: 'grammar_error',  icon: Search,        title: t.c_grammar_t, msg: t.c_grammar_m }
  ],
  scene_phase5: [
    { id: 'report_btn',     icon: ShieldCheck, title: t.c_report_t,     msg: t.c_report_m },
    { id: 'quarantine',     icon: Lock,        title: t.c_quarantine_t, msg: t.c_quarantine_m },
    { id: 'awareness',      icon: UserCheck,   title: t.c_aware_t,      msg: t.c_aware_m }
  ]
});

const buildPUZZLES = (t) => ({
  1: { title: t.p1_title, desc: t.p1_desc, options: t.p1_opts, answer: 3 },
  2: { title: t.p2_title, desc: t.p2_desc, options: t.p2_opts, answer: 1 },
  3: { title: t.p3_title, desc: t.p3_desc, options: t.p3_opts, answer: 2 },
  4: { title: t.p4_title, desc: t.p4_desc, options: t.p4_opts, answer: 2 },
  5: { title: t.p5_title, desc: t.p5_desc, options: t.p5_opts, answer: 1 },
});

// ──────────────────────────────────────────────────────────────────────────────
// [메인 교육 게임 컴포넌트]
// ──────────────────────────────────────────────────────────────────────────────
function InteractiveGameCanvas({ onFinish, userName, companyName, lang = 'ko' }) {
  const t = getT(lang);
  const CHAPTERS = buildCHAPTERS(t);
  const CLUES_DATA = buildCLUES_DATA(t);
  const PUZZLES = buildPUZZLES(t);

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
    ? `${t.teamLeader} ${companyName}`
    : `${t.agent} ${userName}`;

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
      {generateClueItem('sender_info',    0, Mail,       "#00E5FF", t.c_sender_t)}
      {generateClueItem('attachment_icon', 1, Paperclip,  "#FF6B6B", t.c_attach_t)}
      {generateClueItem('email_body',     2, Monitor,    "#DFB8B6", t.c_body_t)}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('phishing_hook',  0, MailWarning, "#FF3333", t.c_hook_t)}
      {generateClueItem('target_profile', 1, UserCheck,   "#10B981", t.c_target_t)}
      {generateClueItem('fake_domain',    2, Globe,       "#DFB8B6", t.c_domain_t)}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('macro_doc',    0, FileWarning, "#FF6B6B", t.c_macro_t)}
      {generateClueItem('exe_disguise', 1, Terminal,    "#00E5FF", t.c_exe_t)}
      {generateClueItem('zip_bomb',     2, Lock,        "#DFB8B6", t.c_zip_t)}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('urgent_tone',    0, AlertTriangle, "#FF3333", t.c_urgent_t)}
      {generateClueItem('unknown_sender', 1, Eye,           "#00E5FF", t.c_unknown_t)}
      {generateClueItem('grammar_error',  2, Search,        "#DFB8B6", t.c_grammar_t)}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('report_btn',  0, ShieldCheck, "#10B981", t.c_report_t)}
      {generateClueItem('quarantine',  1, Lock,        "#00E5FF", t.c_quarantine_t)}
      {generateClueItem('awareness',   2, UserCheck,   "#DFB8B6", t.c_aware_t)}
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
            <span>SECTOR PROGRESS {clearDate && <span className="text-[#00E5FF] ml-2 animate-pulse">{t.freeMode}</span>}</span>
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
            <span className="text-[10px] md:text-xs font-bold text-[#00E5FF] whitespace-nowrap">{t.secRate}</span>
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
              <span className="text-xs font-bold text-[#DFB8B6]">{t.certReport}</span>
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
              <span className="text-sm font-bold text-[#DFB8B6] tracking-widest">{t.teamLeader} {companyName}</span>
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
                <span className="text-xs tracking-widest hidden md:inline">{clearDate ? t.next : t.proceed}</span>
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
                {clearDate ? t.closeWindow : t.saveData}
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
                    <h2 className="text-sm font-bold text-[#DFB8B6] tracking-wider">{t.analysisReport}</h2>
                    <div className="text-[9px] text-[#00E5FF] tracking-widest font-mono">SYSTEM DEBRIEFING</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-row md:flex-col p-2 gap-1 overflow-x-auto md:overflow-x-hidden report-scroll">
                  {[t.rTab1, t.rTab2, t.rTab3, t.rTab4, t.rTab5, t.rTab6].map((tabName, idx) => (
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
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">{t.r1_h}</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r1_ch1}</strong>
                              <p dangerouslySetInnerHTML={{ __html: t.r1_ch1_p }} />
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r1_ch2}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch2_l1 }} />
                                <li>{t.r1_ch2_l2}</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 1 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">{t.r2_h}</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r2_ch3}</strong>
                              <p dangerouslySetInnerHTML={{ __html: t.r2_ch3_p }} />
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r2_ch4}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch4_l1 }} />
                                <li>{t.r2_ch4_l2}</li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 2 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">{t.r3_h}</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r3_ch5}</strong>
                              <p dangerouslySetInnerHTML={{ __html: t.r3_ch5_p }} />
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r3_ch6}</strong>
                              <ol className="list-decimal pl-5 space-y-2 text-[#DFB8B6] font-bold">
                                <li>{t.r3_ch6_l1}</li>
                                <li>{t.r3_ch6_l2}</li>
                                <li>{t.r3_ch6_l3}</li>
                                <li>{t.r3_ch6_l4}</li>
                              </ol>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 3 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">{t.r4_h}</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r4_ch7}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch7_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch7_l2 }} />
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r4_ch8}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch8_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch8_l2 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch8_l3 }} />
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      {activeReportTab === 4 && (
                        <>
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">{t.r5_h}</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r5_ch9}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r5_ch9_l1 }} />
                                <li>{t.r5_ch9_l2}</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r5_ch10}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r5_ch10_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r5_ch10_l2 }} />
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
                          <h1 className="text-2xl md:text-3xl text-[#DFB8B6] font-black mb-3 drop-shadow-[0_0_15px_rgba(223,184,182,0.4)]">{t.r6_title}</h1>
                          <p className="text-sm md:text-base text-gray-300 mb-4 leading-relaxed break-keep" dangerouslySetInnerHTML={{ __html: t.r6_desc }} />
                          <p className="text-base md:text-xl text-gray-400 mb-6 flex items-center gap-3 z-20">
                            {t.r6_grade} <span className="text-[#00E5FF] text-5xl md:text-6xl font-black drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]">S</span>
                          </p>
                          <button
                            onClick={() => { if (onFinish) onFinish(); resetGame(); }}
                            className="w-full max-w-md relative overflow-hidden inline-flex items-center justify-center font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] tracking-wide text-lg md:text-xl border-2 border-[#00E5FF] bg-[#0A0F1C] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0A0F1C] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] whitespace-nowrap z-20 cursor-pointer"
                          >
                            {t.r6_labBtn}
                          </button>
                          <div className="text-gray-500 mt-6 text-sm font-medium animate-pulse">
                            {t.r6_freeHint}
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
                    {t.prevTab}
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
                    {t.nextTab}
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
                  <h2 className="text-base font-bold text-[#DFB8B6]">{t.inventory}</h2>
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
                      {t.noClues}
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

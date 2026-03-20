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
// [다국어 텍스트] — lang prop 기반 분기
// ──────────────────────────────────────────────────────────────────────────────
const T = {
  ko: {
    // CHAPTERS locations
    loc1: 'Sector 1: 메일 서버실', loc2: 'Sector 2: 인증 검증소', loc3: 'Sector 3: 첨부파일 해부실', loc4: 'Sector 4: APT 추적실', loc5: 'Sector 5: 방어 지휘소',
    // CHAPTERS dialogues
    d1_1: "어험! {AGENT} 요원, 오늘의 임무는 스피어피싱 공격의 전체 구조를 파헤치는 거다. 먼저 이메일이 어떻게 전송되는지부터 알아야 해.",
    d1_2: "네, 팀장님! 여기가 메일 서버실이군요. SMTP 프로토콜이 이메일을 전송하는 핵심 통로라고 들었습니다.",
    d1_3: "맞다. 해커들은 이 SMTP 통로를 악용해서 악성 첨부파일이 담긴 메일을 보내지. 메일 전송 과정의 핵심 단서 3개를 수집해라!",
    d2_1: "찾았습니다! 이메일은 SMTP 서버에서 출발해 여러 릴레이를 거쳐 수신자에게 도달하는군요.",
    d2_2: "잘했다. 이제 이 전송 과정에서 사용되는 핵심 프로토콜의 이름을 맞혀봐라.",
    d3_1: "이메일이 전송되는 길을 알았으니, 이제 '가짜 발신자'를 걸러내는 인증 체계를 살펴보자.",
    d3_2: "발신자 주소를 위조하는 게 가능하다고요? 그럼 누가 보냈는지 어떻게 확인하죠?",
    d3_3: "바로 SPF, DKIM, DMARC라는 세 겹의 인증 방패가 있어. 이 검증소에서 각 인증 기술의 단서를 확보해라!",
    d4_1: "스캔 완료! SPF는 발신 IP를, DKIM은 메일 내용의 무결성을, DMARC는 둘을 종합해서 판정하는군요.",
    d4_2: "정확하다. 그렇다면 발신 도메인의 IP를 검증하는 첫 번째 방패의 이름을 대답해 봐라.",
    d5_1: "인증을 통과하더라도 메일 '안에' 숨겨진 무기가 있다. 첨부파일의 내부 구조를 해부해 보자.",
    d5_2: "이 해부실에 MIME 헤더와 Base64로 인코딩된 첨부파일, 그리고... 문서 안에 숨은 VBA 매크로가 보입니다!",
    d5_3: "그래, 해커들은 Word나 Excel 문서에 악성 VBA 매크로를 심어서 보내지. 첨부파일의 구조를 낱낱이 파헤쳐라!",
    d6_1: "증거 확보했습니다! 매크로가 활성화되면 외부 서버에서 추가 악성코드를 다운로드하는 구조였어요.",
    d6_2: "바로 그거다. 문서 파일에 숨겨져 자동 실행되는 이 악성 스크립트의 정확한 이름을 맞혀라.",
    d7_1: "이제 이 무기를 실제로 사용하는 놈들의 정체를 밝혀야 한다. 국가 지원을 받는 APT 그룹들이지.",
    d7_2: "APT28(러시아), Lazarus(북한)... 이들이 스피어피싱 첨부파일을 즐겨 사용하는 그룹이군요!",
    d7_3: "놈들은 타겟의 업무 환경을 철저히 조사한 뒤 맞춤형 피싱 메일을 보내지. C2 채널까지 추적해서 단서를 확보해라!",
    d8_1: "추적 완료! 각 APT 그룹이 특정 산업과 국가를 겨냥해 정밀 타격하는 패턴을 포착했습니다.",
    d8_2: "좋다. SolarWinds 공급망 해킹의 배후로 지목된 러시아 APT 그룹의 이름을 정확히 대답해라.",
    d9_1: "적의 전술을 모두 파악했습니다. 이제 {LEADER}의 조직을 지킬 다층 방어 체계를 구축해야 합니다!",
    d9_2: "그래, 메일 게이트웨이로 1차 필터링하고, 샌드박스에서 의심 파일을 안전하게 분석하며, 사용자 교육으로 최후의 방어선을 세워야 해!",
    d10_1: "모든 방어 시스템 가동 완료! 게이트웨이, 샌드박스, 그리고 직원 교육까지 삼중 방어선이 작동합니다.",
    d10_2: "잠깐, 의심 파일을 안전한 가상 환경에서 실행·분석하는 기술의 이름을 마지막으로 확인하겠다.",
    d11_1: "완벽하다, {AGENT}. SMTP부터 인증, 매크로, APT, 그리고 다층 방어까지 스피어피싱의 모든 것을 꿰뚫었군.",
    d11_2: "감사합니다, {LEADER}! 오늘 배운 내용을 사건 수첩에 정리해 두겠습니다.",
    // hints
    h1: "메일을 보내는 SMTP 서버, 중계하는 릴레이 서버, <br>그리고 통신에 사용되는 포트 번호를 찾아라.",
    h2: "발신 IP를 검증하는 SPF 레코드, 디지털 서명을 확인하는 DKIM, <br>그리고 정책을 결정하는 DMARC를 찾아라.",
    h3: "이메일 구조를 정의하는 MIME 헤더, 문서에 숨겨진 VBA 매크로, <br>그리고 첨부파일을 변환하는 Base64 인코딩을 찾아라.",
    h4: "러시아의 APT28 정보, 북한의 Lazarus 흔적, <br>그리고 감염 후 명령을 받는 C2 채널을 찾아라.",
    h5: "악성 메일을 걸러내는 메일 게이트웨이, 의심 파일을 분석하는 샌드박스, <br>그리고 사람의 판단력을 키우는 사용자 교육을 찾아라.",
    // clues
    c_smtp_t: "SMTP 서버", c_smtp_m: "Simple Mail Transfer Protocol — 이메일을 발신 측에서 수신 측 서버로 전달하는 핵심 프로토콜입니다. 포트 25(기본), 587(보안 전송)을 사용합니다.",
    c_relay_t: "메일 중계", c_relay_m: "이메일은 발신 MTA에서 수신 MTA까지 여러 중계(Relay) 서버를 거칩니다. 각 서버는 Received 헤더에 경유 기록을 남깁니다.",
    c_port_t: "포트 25/587", c_port_m: "SMTP는 기본적으로 포트 25를 사용하고, STARTTLS 암호화 전송 시 포트 587을 사용합니다. 해커는 오픈 릴레이를 악용하기도 합니다.",
    c_spf_t: "SPF 레코드", c_spf_m: "Sender Policy Framework — 발신 도메인의 DNS에 등록된 허용 IP 목록과 실제 발신 IP를 대조하여 위조를 탐지합니다.",
    c_dkim_t: "DKIM 서명", c_dkim_m: "DomainKeys Identified Mail — 발신 서버가 메일에 디지털 서명을 추가하고, 수신 측이 DNS의 공개키로 무결성을 검증합니다.",
    c_dmarc_t: "DMARC 정책", c_dmarc_m: "Domain-based Message Authentication — SPF와 DKIM 결과를 종합하여 reject/quarantine/none 정책을 적용하고, 보고서를 생성합니다.",
    c_mime_t: "MIME 헤더", c_mime_m: "Multipurpose Internet Mail Extensions — 이메일의 본문 유형, 첨부파일 경계(boundary), 인코딩 방식을 정의하는 구조입니다.",
    c_vba_t: "VBA 매크로", c_vba_m: "Visual Basic for Applications — Word/Excel 문서에 내장되어 '콘텐츠 사용' 클릭 시 자동 실행되는 스크립트입니다. 해커가 가장 즐겨 사용하는 초기 침투 벡터 중 하나입니다.",
    c_base64_t: "Base64 인코딩", c_base64_m: "바이너리 첨부파일을 텍스트로 변환하여 SMTP로 전송하는 인코딩 방식입니다. 악성 파일도 이 형태로 메일에 포함됩니다.",
    c_apt28_t: "APT28 정보", c_apt28_m: "러시아 GRU 소속 Fancy Bear. 정부·군사·언론 기관을 표적으로 스피어피싱 첨부파일(무기화된 문서)을 주로 사용합니다.",
    c_lazarus_t: "Lazarus 흔적", c_lazarus_m: "북한 정찰총국 연계 그룹. 금융기관과 암호화폐 거래소를 겨냥한 스피어피싱으로 수억 달러를 탈취한 이력이 있습니다.",
    c_c2_t: "C2 채널", c_c2_m: "Command & Control — 매크로 실행 후 감염된 PC가 공격자의 서버와 통신하는 비밀 채널입니다. HTTP/HTTPS/DNS 등 정상 트래픽으로 위장합니다.",
    c_gateway_t: "메일 게이트웨이", c_gateway_m: "메일 서버 앞단에서 스팸, 피싱, 악성 첨부파일을 필터링하는 1차 방어선입니다. URL 재작성과 첨부파일 스캔을 수행합니다.",
    c_sandbox_t: "샌드박스", c_sandbox_m: "의심스러운 첨부파일을 격리된 가상 환경에서 실행하여 악성 행위(파일 생성, 레지스트리 변경, C2 통신)를 안전하게 관찰·분석합니다.",
    c_training_t: "사용자 교육", c_training_m: "기술적 방어의 마지막 관문은 '사람'입니다. 피싱 시뮬레이션 훈련과 보안 인식 교육으로 의심 메일을 신고하는 문화를 만듭니다.",
    // puzzles
    p1_title: "메일 전송의 핵심", p1_desc: "인터넷에서 <b>이메일을 전송하는 핵심 프로토콜</b>의 이름은 무엇인가?",
    p1_opts: ["POP3", "SMTP", "FTP", "HTTP"],
    p2_title: "첫 번째 인증 방패", p2_desc: "<b>발신 도메인의 DNS에 등록된 허용 IP 목록</b>과 실제 발신 IP를 대조하여 위조를 탐지하는 이메일 인증 기술은?",
    p2_opts: ["SPF", "SSL", "SSH", "SNMP"],
    p3_title: "문서 속 숨겨진 무기", p3_desc: "Word/Excel 등 <b>문서 파일에 숨겨져 '콘텐츠 사용' 클릭 시 자동 실행되는 악성 스크립트</b>는?",
    p3_opts: ["JavaScript", "CSS", "VBA 매크로", "HTML"],
    p4_title: "공급망 해킹의 배후", p4_desc: "2020년 <b>SolarWinds 공급망 해킹의 배후로 지목된 러시아 APT 그룹</b>은?",
    p4_opts: ["APT28", "APT29", "Lazarus", "APT41"],
    p5_title: "안전한 분석 환경", p5_desc: "의심스러운 첨부파일을 <b>격리된 가상 환경에서 실행하여 악성 행위를 안전하게 관찰·분석하는 기술</b>은?",
    p5_opts: ["방화벽", "IDS", "샌드박스", "VPN"],
    // UI
    teamLeader: '팀장', agent: '요원', secRate: '확보율', certReport: '수료 보고서',
    analysisReport: '분석 리포트', freeMode: '(자유 탐색 모드)',
    proceed: '진행', next: '다음', closeWindow: '창 닫기', saveData: '데이터 저장하기',
    inventory: '수집 데이터 (Inventory)', noClues: '아직 수집된 단서가 없습니다.',
    prevTab: '◀ 이전', nextTab: '다음 ▶',
    // report tabs
    rTab1: "1. SMTP와 메일 전송", rTab2: "2. 이메일 인증 체계", rTab3: "3. 첨부파일과 매크로",
    rTab4: "4. APT 그룹의 전략", rTab5: "5. 다층 방어 체계", rTab6: "6. 최종 훈련 수료",
    // report content
    r1_h: "SMTP와 메일 전송",
    r1_ch1: "Ch 1. SMTP 프로토콜",
    r1_ch1_p: '이메일 전송의 핵심인 <span class="text-white bg-white/10 px-1 rounded">SMTP(Simple Mail Transfer Protocol)</span>의 동작 원리를 배웁니다. 발신 MTA에서 수신 MTA까지 메일이 전달되는 과정과 포트 25/587의 역할을 이해합니다.',
    r1_ch2: "Ch 2. 메일 라우팅",
    r1_ch2_l1: '이메일은 여러 <span class="text-white bg-white/10 px-1 rounded">릴레이(Relay) 서버</span>를 거쳐 목적지에 도달합니다.',
    r1_ch2_l2: "각 경유 서버는 Received 헤더에 기록을 남기며, 해커는 오픈 릴레이를 악용해 발신지를 숨깁니다.",
    r2_h: "이메일 인증 체계",
    r2_ch3: "Ch 3. SPF (Sender Policy Framework)",
    r2_ch3_p: '발신 도메인의 DNS TXT 레코드에 <span class="text-white bg-white/10 px-1 rounded">허용된 발신 IP 목록</span>을 등록하고, 수신 서버가 실제 발신 IP와 대조하여 위조를 탐지합니다.',
    r2_ch4: "Ch 4. DKIM과 DMARC",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">DKIM</span>은 발신 서버가 메일에 디지털 서명을 추가하여 전송 중 변조를 감지합니다.',
    r2_ch4_l2: '<span class="text-white bg-white/10 px-1 rounded">DMARC</span>는 SPF+DKIM 결과를 종합하여 reject/quarantine/none 정책을 적용합니다.',
    r3_h: "첨부파일과 매크로",
    r3_ch5: "Ch 5. MIME 구조",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">MIME(Multipurpose Internet Mail Extensions)</span>는 이메일의 본문 유형과 첨부파일 경계를 정의합니다. Base64 인코딩으로 바이너리 파일을 텍스트로 변환하여 전송합니다.',
    r3_ch6: "Ch 6. VBA 매크로의 위험",
    r3_ch6_l1: '해커는 Word/Excel 문서에 <span class="text-white bg-white/10 px-1 rounded">VBA 매크로</span>를 삽입하여 \'콘텐츠 사용\' 클릭 시 악성 코드를 실행합니다.',
    r3_ch6_l2: "매크로는 외부 C2 서버에서 추가 페이로드를 다운로드하는 드로퍼 역할을 합니다.",
    r4_h: "APT 그룹의 전략",
    r4_ch7: "Ch 7. APT28과 APT29",
    r4_ch7_p: '러시아 정보기관 연계 그룹으로, <span class="text-white bg-white/10 px-1 rounded">APT28(Fancy Bear)</span>는 정부·군사 기관을, <span class="text-white bg-white/10 px-1 rounded">APT29(Cozy Bear)</span>는 외교·에너지 분야를 표적으로 무기화된 문서를 첨부한 스피어피싱을 수행합니다.',
    r4_ch8: "Ch 8. Lazarus의 스피어피싱",
    r4_ch8_l1: '북한 연계 <span class="text-white bg-white/10 px-1 rounded">Lazarus 그룹</span>은 금융기관과 암호화폐 거래소를 겨냥합니다.',
    r4_ch8_l2: "채용 제안서, 투자 보고서 등 업무 관련 문서로 위장한 스피어피싱으로 수억 달러를 탈취한 이력이 있습니다.",
    r5_h: "다층 방어 체계",
    r5_ch9: "Ch 9. 게이트웨이와 샌드박스",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">메일 게이트웨이</span>는 서버 앞단에서 스팸과 악성 첨부를 필터링하고, <span class="text-white bg-white/10 px-1 rounded">샌드박스</span>는 의심 파일을 격리된 가상 환경에서 실행하여 악성 행위를 관찰합니다.',
    r5_ch10: "Ch 10. 사용자 교육",
    r5_ch10_l1: '기술적 방어의 마지막 관문은 <span class="text-white bg-white/10 px-1 rounded">사람</span>입니다. 정기적인 피싱 시뮬레이션 훈련을 실시합니다.',
    r5_ch10_l2: "의심스러운 메일을 즉시 신고하는 보안 문화를 조성하고, '콘텐츠 사용' 버튼을 함부로 클릭하지 않는 습관을 기릅니다.",
    r6_title: "훈련 수료 완료!",
    r6_desc: "SMTP 전송부터 이메일 인증, 매크로 분석,<br/>APT 추적, 다층 방어까지<br/>스피어피싱의 모든 것을 꿰뚫었습니다.",
    r6_grade: "최종 등급:",
    r6_labBtn: "실습 랩으로 이동하기 🚀",
    r6_freeHint: "(창을 닫으면 각 구역을 자유롭게 재탐색할 수 있습니다)",
  },
  en: {
    loc1: 'Sector 1: Mail Server Room', loc2: 'Sector 2: Authentication Lab', loc3: 'Sector 3: Attachment Dissection Lab', loc4: 'Sector 4: APT Tracking Room', loc5: 'Sector 5: Defense Command Center',
    d1_1: "Ahem! Agent {AGENT}, today's mission is to dissect the entire structure of spear phishing attacks. First, we need to understand how emails are transmitted.",
    d1_2: "Yes, sir! So this is the mail server room. I've heard that SMTP is the core protocol for email transmission.",
    d1_3: "Correct. Hackers exploit the SMTP channel to send emails with malicious attachments. Collect 3 key clues about the mail delivery process!",
    d2_1: "Found them! Emails originate from SMTP servers and pass through multiple relays before reaching the recipient.",
    d2_2: "Well done. Now identify the name of the core protocol used in this delivery process.",
    d3_1: "Now that you know how email is transmitted, let's examine the authentication systems that filter out 'fake senders'.",
    d3_2: "Wait, it's possible to forge sender addresses? Then how do we verify who sent it?",
    d3_3: "That's where three layers of authentication shields come in: SPF, DKIM, and DMARC. Secure clues about each authentication technology in this lab!",
    d4_1: "Scan complete! SPF verifies sender IP, DKIM verifies email content integrity, and DMARC combines both for a verdict.",
    d4_2: "Exactly right. Now name the first shield that verifies the sender domain's IP.",
    d5_1: "Even if authentication passes, there are weapons hidden 'inside' the email. Let's dissect the internal structure of attachments.",
    d5_2: "In this dissection lab I can see MIME headers, Base64-encoded attachments, and... VBA macros hidden inside documents!",
    d5_3: "Yes, hackers embed malicious VBA macros in Word and Excel documents. Dissect the attachment structure thoroughly!",
    d6_1: "Evidence secured! When macros are activated, they download additional malware from external servers.",
    d6_2: "Exactly. Name the malicious script that hides in document files and auto-executes.",
    d7_1: "Now we need to expose those who actually use these weapons. They're state-sponsored APT groups.",
    d7_2: "APT28 (Russia), Lazarus (North Korea)... these are the groups that frequently use spear phishing attachments!",
    d7_3: "They thoroughly research their target's work environment before sending customized phishing emails. Track down the C2 channel and secure clues!",
    d8_1: "Tracking complete! I've identified the pattern of each APT group precisely targeting specific industries and countries.",
    d8_2: "Good. Name the Russian APT group identified as being behind the SolarWinds supply chain hack.",
    d9_1: "We've identified all enemy tactics. Now we need to build a multi-layered defense system to protect {LEADER}'s organization!",
    d9_2: "Right! Filter first with mail gateways, analyze suspicious files safely in sandboxes, and build the last line of defense through user training!",
    d10_1: "All defense systems operational! Gateway, sandbox, and employee training — triple defense line is active.",
    d10_2: "Wait, let me confirm the name of the technology that safely executes and analyzes suspicious files in an isolated virtual environment.",
    d11_1: "Perfect, {AGENT}. From SMTP to authentication, macros, APT, and multi-layered defense — you've mastered everything about spear phishing.",
    d11_2: "Thank you, {LEADER}! I'll organize today's lessons in the case notebook.",
    h1: "Find the SMTP server that sends mail, the relay server that forwards it, <br>and the port numbers used for communication.",
    h2: "Find the SPF record that verifies sender IP, DKIM that checks digital signatures, <br>and DMARC that determines policy.",
    h3: "Find the MIME header that defines email structure, the VBA macro hidden in documents, <br>and Base64 encoding that converts attachments.",
    h4: "Find APT28 intel from Russia, Lazarus traces from North Korea, <br>and the C2 channel that receives commands after infection.",
    h5: "Find the mail gateway that filters malicious mail, the sandbox that analyzes suspicious files, <br>and user training that builds human judgment.",
    c_smtp_t: "SMTP Server", c_smtp_m: "Simple Mail Transfer Protocol — the core protocol that delivers email from sender to recipient server. Uses port 25 (default) and 587 (secure transmission).",
    c_relay_t: "Mail Relay", c_relay_m: "Emails pass through multiple Relay servers from sending MTA to receiving MTA. Each server records its transit in the Received header.",
    c_port_t: "Port 25/587", c_port_m: "SMTP uses port 25 by default, and port 587 for STARTTLS encrypted transmission. Hackers may exploit open relays.",
    c_spf_t: "SPF Record", c_spf_m: "Sender Policy Framework — compares the allowed IP list registered in the sending domain's DNS against the actual sender IP to detect forgery.",
    c_dkim_t: "DKIM Signature", c_dkim_m: "DomainKeys Identified Mail — the sending server adds a digital signature to the email, and the recipient verifies integrity using the DNS public key.",
    c_dmarc_t: "DMARC Policy", c_dmarc_m: "Domain-based Message Authentication — combines SPF and DKIM results to apply reject/quarantine/none policies and generate reports.",
    c_mime_t: "MIME Header", c_mime_m: "Multipurpose Internet Mail Extensions — defines the email body type, attachment boundaries, and encoding methods.",
    c_vba_t: "VBA Macro", c_vba_m: "Visual Basic for Applications — scripts embedded in Word/Excel documents that auto-execute when 'Enable Content' is clicked. One of hackers' favorite initial access vectors.",
    c_base64_t: "Base64 Encoding", c_base64_m: "An encoding method that converts binary attachments to text for SMTP transmission. Malicious files are also included in emails in this format.",
    c_apt28_t: "APT28 Intel", c_apt28_m: "Russian GRU's Fancy Bear. Primarily uses spear phishing attachments (weaponized documents) targeting government, military, and media organizations.",
    c_lazarus_t: "Lazarus Traces", c_lazarus_m: "North Korean RGB-linked group. Has a history of stealing hundreds of millions through spear phishing targeting financial institutions and cryptocurrency exchanges.",
    c_c2_t: "C2 Channel", c_c2_m: "Command & Control — a covert channel through which infected PCs communicate with the attacker's server after macro execution. Disguised as normal HTTP/HTTPS/DNS traffic.",
    c_gateway_t: "Mail Gateway", c_gateway_m: "The first line of defense that filters spam, phishing, and malicious attachments before the mail server. Performs URL rewriting and attachment scanning.",
    c_sandbox_t: "Sandbox", c_sandbox_m: "Executes suspicious attachments in an isolated virtual environment to safely observe and analyze malicious behavior (file creation, registry changes, C2 communication).",
    c_training_t: "User Training", c_training_m: "The final checkpoint of technical defense is 'people'. Phishing simulation drills and security awareness training create a culture of reporting suspicious emails.",
    p1_title: "Core of Email Delivery", p1_desc: "What is the name of the <b>core protocol for sending email</b> on the Internet?",
    p1_opts: ["POP3", "SMTP", "FTP", "HTTP"],
    p2_title: "The First Authentication Shield", p2_desc: "Which email authentication technology compares the <b>allowed IP list registered in the sender domain's DNS</b> against the actual sender IP to detect forgery?",
    p2_opts: ["SPF", "SSL", "SSH", "SNMP"],
    p3_title: "Hidden Weapon in Documents", p3_desc: "What is the <b>malicious script hidden in document files like Word/Excel that auto-executes when 'Enable Content' is clicked</b>?",
    p3_opts: ["JavaScript", "CSS", "VBA Macro", "HTML"],
    p4_title: "Behind the Supply Chain Hack", p4_desc: "Which <b>Russian APT group was identified as being behind the 2020 SolarWinds supply chain hack</b>?",
    p4_opts: ["APT28", "APT29", "Lazarus", "APT41"],
    p5_title: "Safe Analysis Environment", p5_desc: "What is the <b>technology that safely executes and analyzes suspicious attachments in an isolated virtual environment</b>?",
    p5_opts: ["Firewall", "IDS", "Sandbox", "VPN"],
    teamLeader: 'Leader', agent: 'Agent', secRate: 'Secured', certReport: 'Completion Report',
    analysisReport: 'Analysis Report', freeMode: '(Free Exploration Mode)',
    proceed: 'Continue', next: 'Next', closeWindow: 'Close', saveData: 'Save Data',
    inventory: 'Collected Data (Inventory)', noClues: 'No clues collected yet.',
    prevTab: '◀ Prev', nextTab: 'Next ▶',
    rTab1: "1. SMTP & Email Delivery", rTab2: "2. Email Authentication", rTab3: "3. Attachments & Macros",
    rTab4: "4. APT Group Strategies", rTab5: "5. Multi-Layer Defense", rTab6: "6. Training Complete",
    r1_h: "SMTP & Email Delivery",
    r1_ch1: "Ch 1. SMTP Protocol",
    r1_ch1_p: 'Learn the fundamentals of <span class="text-white bg-white/10 px-1 rounded">SMTP (Simple Mail Transfer Protocol)</span>, the core of email delivery. Understand the process from sending MTA to receiving MTA and the roles of ports 25/587.',
    r1_ch2: "Ch 2. Mail Routing",
    r1_ch2_l1: 'Emails pass through multiple <span class="text-white bg-white/10 px-1 rounded">Relay servers</span> to reach their destination.',
    r1_ch2_l2: "Each transit server records in the Received header, and hackers exploit open relays to hide the origin.",
    r2_h: "Email Authentication",
    r2_ch3: "Ch 3. SPF (Sender Policy Framework)",
    r2_ch3_p: 'Registers a list of <span class="text-white bg-white/10 px-1 rounded">allowed sender IPs</span> in the sending domain\'s DNS TXT record, and the receiving server compares the actual sender IP to detect forgery.',
    r2_ch4: "Ch 4. DKIM & DMARC",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">DKIM</span> adds a digital signature to emails to detect tampering during transit.',
    r2_ch4_l2: '<span class="text-white bg-white/10 px-1 rounded">DMARC</span> combines SPF+DKIM results to apply reject/quarantine/none policies.',
    r3_h: "Attachments & Macros",
    r3_ch5: "Ch 5. MIME Structure",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">MIME (Multipurpose Internet Mail Extensions)</span> defines the email body type and attachment boundaries. Base64 encoding converts binary files to text for transmission.',
    r3_ch6: "Ch 6. Danger of VBA Macros",
    r3_ch6_l1: 'Hackers insert <span class="text-white bg-white/10 px-1 rounded">VBA macros</span> into Word/Excel documents to execute malicious code when \'Enable Content\' is clicked.',
    r3_ch6_l2: "Macros act as droppers that download additional payloads from external C2 servers.",
    r4_h: "APT Group Strategies",
    r4_ch7: "Ch 7. APT28 & APT29",
    r4_ch7_p: 'Russian intelligence-linked groups: <span class="text-white bg-white/10 px-1 rounded">APT28 (Fancy Bear)</span> targets government/military, while <span class="text-white bg-white/10 px-1 rounded">APT29 (Cozy Bear)</span> targets diplomacy/energy sectors with weaponized document attachments.',
    r4_ch8: "Ch 8. Lazarus Spear Phishing",
    r4_ch8_l1: 'North Korea-linked <span class="text-white bg-white/10 px-1 rounded">Lazarus Group</span> targets financial institutions and cryptocurrency exchanges.',
    r4_ch8_l2: "They have stolen hundreds of millions through spear phishing disguised as job offers, investment reports, and other business documents.",
    r5_h: "Multi-Layer Defense",
    r5_ch9: "Ch 9. Gateway & Sandbox",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">Mail gateways</span> filter spam and malicious attachments at the server front, while <span class="text-white bg-white/10 px-1 rounded">sandboxes</span> execute suspicious files in isolated virtual environments to observe malicious behavior.',
    r5_ch10: "Ch 10. User Training",
    r5_ch10_l1: 'The final checkpoint of technical defense is <span class="text-white bg-white/10 px-1 rounded">people</span>. Conduct regular phishing simulation drills.',
    r5_ch10_l2: "Cultivate a security culture of immediately reporting suspicious emails, and develop the habit of never carelessly clicking 'Enable Content'.",
    r6_title: "Training Complete!",
    r6_desc: "From SMTP delivery to email authentication,<br/>macro analysis, APT tracking, and multi-layer defense<br/>— you've mastered everything about spear phishing.",
    r6_grade: "Final Grade:",
    r6_labBtn: "Go to Lab 🚀",
    r6_freeHint: "(Close this window to freely re-explore each sector)",
  },
  ja: {
    loc1: 'Sector 1: メールサーバー室', loc2: 'Sector 2: 認証検証所', loc3: 'Sector 3: 添付ファイル解剖室', loc4: 'Sector 4: APT追跡室', loc5: 'Sector 5: 防御指揮所',
    d1_1: "おほん！エージェント{AGENT}、今日の任務はスピアフィッシング攻撃の全体構造を解明することだ。まずメールがどう送信されるかを知る必要がある。",
    d1_2: "はい、チーム長！ここがメールサーバー室ですね。SMTPプロトコルがメール送信の中核だと聞きました。",
    d1_3: "その通り。ハッカーはこのSMTP経路を悪用して悪性添付ファイル付きメールを送る。メール送信過程の重要な手がかり3つを収集せよ！",
    d2_1: "見つけました！メールはSMTPサーバーから出発し、複数のリレーを経て受信者に届くんですね。",
    d2_2: "よくやった。この送信過程で使われる中核プロトコルの名前を答えてみよ。",
    d3_1: "メールの送信経路を理解したところで、「偽の送信者」を見分ける認証体系を見てみよう。",
    d3_2: "送信者アドレスの偽造が可能なんですか？では誰が送ったかどうやって確認するんですか？",
    d3_3: "そこでSPF、DKIM、DMARCという三重の認証シールドがある。この検証所で各認証技術の手がかりを確保せよ！",
    d4_1: "スキャン完了！SPFは発信IPを、DKIMはメール内容の完全性を、DMARCは両方を総合して判定するんですね。",
    d4_2: "正確だ。では発信ドメインのIPを検証する最初のシールドの名前を答えよ。",
    d5_1: "認証を通過しても、メール「内部」に隠された武器がある。添付ファイルの内部構造を解剖しよう。",
    d5_2: "この解剖室にMIMEヘッダーとBase64エンコードされた添付ファイル、そして…文書内に隠されたVBAマクロが見えます！",
    d5_3: "そうだ、ハッカーはWordやExcel文書に悪性VBAマクロを仕込んで送る。添付ファイルの構造を徹底的に解明せよ！",
    d6_1: "証拠確保しました！マクロが有効化されると外部サーバーから追加マルウェアをダウンロードする仕組みでした。",
    d6_2: "その通り。文書ファイルに隠されて自動実行されるこの悪性スクリプトの正確な名前を答えよ。",
    d7_1: "この武器を実際に使っている者たちの正体を暴く必要がある。国家支援を受けるAPTグループだ。",
    d7_2: "APT28（ロシア）、Lazarus（北朝鮮）…彼らがスピアフィッシング添付ファイルを好んで使用するグループですね！",
    d7_3: "奴らはターゲットの業務環境を徹底調査してからカスタマイズフィッシングメールを送る。C2チャネルまで追跡して手がかりを確保せよ！",
    d8_1: "追跡完了！各APTグループが特定の産業と国家を狙って精密攻撃するパターンを捕捉しました。",
    d8_2: "よろしい。SolarWindsサプライチェーン攻撃の背後と特定されたロシアのAPTグループの名前を正確に答えよ。",
    d9_1: "敵の戦術をすべて把握しました。{LEADER}の組織を守る多層防御体系を構築する必要があります！",
    d9_2: "そうだ、メールゲートウェイで1次フィルタリングし、サンドボックスで不審ファイルを安全に分析し、ユーザー教育で最後の防衛線を築かなければならない！",
    d10_1: "全防御システム稼働完了！ゲートウェイ、サンドボックス、そして社員教育まで三重防衛線が作動しています。",
    d10_2: "待て、不審ファイルを安全な仮想環境で実行・分析する技術の名前を最後に確認する。",
    d11_1: "完璧だ、{AGENT}。SMTPから認証、マクロ、APT、そして多層防御までスピアフィッシングのすべてを貫いたな。",
    d11_2: "ありがとうございます、{LEADER}！今日学んだ内容をケースノートに整理しておきます。",
    h1: "メールを送信するSMTPサーバー、中継するリレーサーバー、<br>そして通信に使われるポート番号を探せ。",
    h2: "発信IPを検証するSPFレコード、デジタル署名を確認するDKIM、<br>そしてポリシーを決定するDMARCを探せ。",
    h3: "メール構造を定義するMIMEヘッダー、文書に隠されたVBAマクロ、<br>そして添付ファイルを変換するBase64エンコーディングを探せ。",
    h4: "ロシアのAPT28情報、北朝鮮のLazarusの痕跡、<br>そして感染後に命令を受けるC2チャネルを探せ。",
    h5: "悪性メールをフィルタリングするメールゲートウェイ、不審ファイルを分析するサンドボックス、<br>そして人の判断力を高めるユーザー教育を探せ。",
    c_smtp_t: "SMTPサーバー", c_smtp_m: "Simple Mail Transfer Protocol — メールを送信側から受信側サーバーに配信する中核プロトコルです。ポート25（デフォルト）、587（セキュア送信）を使用します。",
    c_relay_t: "メール中継", c_relay_m: "メールは送信MTAから受信MTAまで複数のリレーサーバーを経由します。各サーバーはReceivedヘッダーに経由記録を残します。",
    c_port_t: "ポート25/587", c_port_m: "SMTPはデフォルトでポート25を使用し、STARTTLS暗号化送信時にポート587を使用します。ハッカーはオープンリレーを悪用することもあります。",
    c_spf_t: "SPFレコード", c_spf_m: "Sender Policy Framework — 発信ドメインのDNSに登録された許可IPリストと実際の発信IPを照合して偽造を検知します。",
    c_dkim_t: "DKIM署名", c_dkim_m: "DomainKeys Identified Mail — 発信サーバーがメールにデジタル署名を追加し、受信側がDNSの公開鍵で完全性を検証します。",
    c_dmarc_t: "DMARCポリシー", c_dmarc_m: "Domain-based Message Authentication — SPFとDKIMの結果を総合してreject/quarantine/noneポリシーを適用し、レポートを生成します。",
    c_mime_t: "MIMEヘッダー", c_mime_m: "Multipurpose Internet Mail Extensions — メールの本文タイプ、添付ファイル境界（boundary）、エンコーディング方式を定義する構造です。",
    c_vba_t: "VBAマクロ", c_vba_m: "Visual Basic for Applications — Word/Excel文書に内蔵され「コンテンツの有効化」クリック時に自動実行されるスクリプトです。ハッカーが最も好んで使う初期侵入ベクターの一つです。",
    c_base64_t: "Base64エンコーディング", c_base64_m: "バイナリ添付ファイルをテキストに変換してSMTPで送信するエンコーディング方式です。悪性ファイルもこの形式でメールに含まれます。",
    c_apt28_t: "APT28情報", c_apt28_m: "ロシアGRU所属Fancy Bear。政府・軍事・メディア機関を標的にスピアフィッシング添付ファイル（武器化文書）を主に使用します。",
    c_lazarus_t: "Lazarusの痕跡", c_lazarus_m: "北朝鮮偵察総局連携グループ。金融機関と暗号通貨取引所を狙ったスピアフィッシングで数億ドルを窃取した実績があります。",
    c_c2_t: "C2チャネル", c_c2_m: "Command & Control — マクロ実行後、感染したPCが攻撃者のサーバーと通信する秘密チャネルです。HTTP/HTTPS/DNS等の正常トラフィックに偽装します。",
    c_gateway_t: "メールゲートウェイ", c_gateway_m: "メールサーバー前段でスパム、フィッシング、悪性添付ファイルをフィルタリングする第1防衛線です。URL書き換えと添付ファイルスキャンを実行します。",
    c_sandbox_t: "サンドボックス", c_sandbox_m: "不審な添付ファイルを隔離された仮想環境で実行し、悪性行為（ファイル作成、レジストリ変更、C2通信）を安全に観察・分析します。",
    c_training_t: "ユーザー教育", c_training_m: "技術的防御の最終関門は「人」です。フィッシングシミュレーション訓練とセキュリティ意識教育で不審メールを報告する文化を作ります。",
    p1_title: "メール送信の核心", p1_desc: "インターネットで<b>メールを送信する核心プロトコル</b>の名前は？",
    p1_opts: ["POP3", "SMTP", "FTP", "HTTP"],
    p2_title: "最初の認証シールド", p2_desc: "<b>発信ドメインのDNSに登録された許可IPリスト</b>と実際の発信IPを照合して偽造を検知するメール認証技術は？",
    p2_opts: ["SPF", "SSL", "SSH", "SNMP"],
    p3_title: "文書に隠された武器", p3_desc: "Word/Excel等の<b>文書ファイルに隠されて「コンテンツの有効化」クリック時に自動実行される悪性スクリプト</b>は？",
    p3_opts: ["JavaScript", "CSS", "VBAマクロ", "HTML"],
    p4_title: "サプライチェーン攻撃の黒幕", p4_desc: "2020年<b>SolarWindsサプライチェーン攻撃の背後と特定されたロシアのAPTグループ</b>は？",
    p4_opts: ["APT28", "APT29", "Lazarus", "APT41"],
    p5_title: "安全な分析環境", p5_desc: "不審な添付ファイルを<b>隔離された仮想環境で実行して悪性行為を安全に観察・分析する技術</b>は？",
    p5_opts: ["ファイアウォール", "IDS", "サンドボックス", "VPN"],
    teamLeader: 'チーム長', agent: 'エージェント', secRate: '確保率', certReport: '修了報告書',
    analysisReport: '分析レポート', freeMode: '（自由探索モード）',
    proceed: '進行', next: '次へ', closeWindow: '閉じる', saveData: 'データ保存',
    inventory: '収集データ (Inventory)', noClues: 'まだ収集された手がかりがありません。',
    prevTab: '◀ 前へ', nextTab: '次へ ▶',
    rTab1: "1. SMTPとメール送信", rTab2: "2. メール認証体系", rTab3: "3. 添付ファイルとマクロ",
    rTab4: "4. APTグループの戦略", rTab5: "5. 多層防御体系", rTab6: "6. 最終訓練修了",
    r1_h: "SMTPとメール送信",
    r1_ch1: "Ch 1. SMTPプロトコル",
    r1_ch1_p: 'メール送信の核心である<span class="text-white bg-white/10 px-1 rounded">SMTP（Simple Mail Transfer Protocol）</span>の動作原理を学びます。送信MTAから受信MTAまでのメール配信過程とポート25/587の役割を理解します。',
    r1_ch2: "Ch 2. メールルーティング",
    r1_ch2_l1: 'メールは複数の<span class="text-white bg-white/10 px-1 rounded">リレー（Relay）サーバー</span>を経由して目的地に到達します。',
    r1_ch2_l2: "各経由サーバーはReceivedヘッダーに記録を残し、ハッカーはオープンリレーを悪用して発信元を隠します。",
    r2_h: "メール認証体系",
    r2_ch3: "Ch 3. SPF（Sender Policy Framework）",
    r2_ch3_p: '発信ドメインのDNS TXTレコードに<span class="text-white bg-white/10 px-1 rounded">許可された発信IPリスト</span>を登録し、受信サーバーが実際の発信IPと照合して偽造を検知します。',
    r2_ch4: "Ch 4. DKIMとDMARC",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">DKIM</span>は発信サーバーがメールにデジタル署名を追加して送信中の改ざんを検知します。',
    r2_ch4_l2: '<span class="text-white bg-white/10 px-1 rounded">DMARC</span>はSPF+DKIMの結果を総合してreject/quarantine/noneポリシーを適用します。',
    r3_h: "添付ファイルとマクロ",
    r3_ch5: "Ch 5. MIME構造",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">MIME（Multipurpose Internet Mail Extensions）</span>はメールの本文タイプと添付ファイル境界を定義します。Base64エンコーディングでバイナリファイルをテキストに変換して送信します。',
    r3_ch6: "Ch 6. VBAマクロの危険",
    r3_ch6_l1: 'ハッカーはWord/Excel文書に<span class="text-white bg-white/10 px-1 rounded">VBAマクロ</span>を挿入して「コンテンツの有効化」クリック時に悪性コードを実行します。',
    r3_ch6_l2: "マクロは外部C2サーバーから追加ペイロードをダウンロードするドロッパーの役割を果たします。",
    r4_h: "APTグループの戦略",
    r4_ch7: "Ch 7. APT28とAPT29",
    r4_ch7_p: 'ロシア情報機関連携グループで、<span class="text-white bg-white/10 px-1 rounded">APT28（Fancy Bear）</span>は政府・軍事機関を、<span class="text-white bg-white/10 px-1 rounded">APT29（Cozy Bear）</span>は外交・エネルギー分野を標的に武器化文書を添付したスピアフィッシングを行います。',
    r4_ch8: "Ch 8. Lazarusのスピアフィッシング",
    r4_ch8_l1: '北朝鮮連携<span class="text-white bg-white/10 px-1 rounded">Lazarusグループ</span>は金融機関と暗号通貨取引所を狙います。',
    r4_ch8_l2: "採用提案書、投資報告書等の業務関連文書に偽装したスピアフィッシングで数億ドルを窃取した実績があります。",
    r5_h: "多層防御体系",
    r5_ch9: "Ch 9. ゲートウェイとサンドボックス",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">メールゲートウェイ</span>はサーバー前段でスパムと悪性添付をフィルタリングし、<span class="text-white bg-white/10 px-1 rounded">サンドボックス</span>は不審ファイルを隔離された仮想環境で実行して悪性行為を観察します。',
    r5_ch10: "Ch 10. ユーザー教育",
    r5_ch10_l1: '技術的防御の最終関門は<span class="text-white bg-white/10 px-1 rounded">人</span>です。定期的なフィッシングシミュレーション訓練を実施します。',
    r5_ch10_l2: "不審メールを即座に報告するセキュリティ文化を醸成し、「コンテンツの有効化」ボタンを安易にクリックしない習慣を身につけます。",
    r6_title: "訓練修了！",
    r6_desc: "SMTP送信からメール認証、マクロ分析、<br/>APT追跡、多層防御まで<br/>スピアフィッシングのすべてを貫きました。",
    r6_grade: "最終評価：",
    r6_labBtn: "実習ラボへ移動 🚀",
    r6_freeHint: "（ウィンドウを閉じると各セクターを自由に再探索できます）",
  },
  vi: {
    loc1: 'Sector 1: Phòng máy chủ mail', loc2: 'Sector 2: Trạm xác thực', loc3: 'Sector 3: Phòng mổ xẻ tệp đính kèm', loc4: 'Sector 4: Phòng truy vết APT', loc5: 'Sector 5: Trung tâm chỉ huy phòng thủ',
    d1_1: "Chú ý! Đặc vụ {AGENT}, nhiệm vụ hôm nay là phân tích toàn bộ cấu trúc tấn công spear phishing. Trước tiên cần hiểu cách email được truyền tải.",
    d1_2: "Vâng, thưa sếp! Đây là phòng máy chủ mail. Tôi nghe nói SMTP là giao thức cốt lõi để truyền email.",
    d1_3: "Đúng vậy. Hacker lợi dụng kênh SMTP để gửi email chứa tệp đính kèm độc hại. Thu thập 3 manh mối quan trọng về quy trình truyền mail!",
    d2_1: "Tìm thấy rồi! Email xuất phát từ máy chủ SMTP và đi qua nhiều relay trước khi đến người nhận.",
    d2_2: "Giỏi lắm. Hãy cho biết tên giao thức cốt lõi được sử dụng trong quy trình truyền này.",
    d3_1: "Đã hiểu đường truyền email, giờ hãy xem xét hệ thống xác thực lọc ra 'người gửi giả mạo'.",
    d3_2: "Có thể giả mạo địa chỉ người gửi sao? Vậy làm sao xác minh ai đã gửi?",
    d3_3: "Có ba lớp khiên xác thực: SPF, DKIM và DMARC. Hãy thu thập manh mối về từng công nghệ xác thực tại trạm này!",
    d4_1: "Quét hoàn tất! SPF xác minh IP gửi, DKIM xác minh tính toàn vẹn nội dung, DMARC tổng hợp cả hai để phán quyết.",
    d4_2: "Chính xác. Hãy cho biết tên lá chắn đầu tiên xác minh IP của miền gửi.",
    d5_1: "Dù vượt qua xác thực, vẫn có vũ khí ẩn 'bên trong' email. Hãy mổ xẻ cấu trúc bên trong tệp đính kèm.",
    d5_2: "Trong phòng mổ xẻ này tôi thấy MIME header, tệp đính kèm mã hóa Base64, và... macro VBA ẩn trong tài liệu!",
    d5_3: "Đúng vậy, hacker nhúng macro VBA độc hại vào tài liệu Word và Excel. Hãy phân tích kỹ cấu trúc tệp đính kèm!",
    d6_1: "Đã thu thập bằng chứng! Khi macro được kích hoạt, nó tải thêm mã độc từ máy chủ bên ngoài.",
    d6_2: "Chính xác. Hãy cho biết tên chính xác của script độc hại ẩn trong tệp tài liệu và tự động thực thi.",
    d7_1: "Bây giờ cần vạch trần danh tính kẻ thực sự sử dụng những vũ khí này. Đó là các nhóm APT được nhà nước tài trợ.",
    d7_2: "APT28 (Nga), Lazarus (Triều Tiên)... đây là những nhóm thường xuyên sử dụng tệp đính kèm spear phishing!",
    d7_3: "Chúng nghiên cứu kỹ môi trường làm việc của mục tiêu rồi gửi email phishing tùy chỉnh. Truy vết kênh C2 và thu thập manh mối!",
    d8_1: "Truy vết hoàn tất! Đã phát hiện mô hình từng nhóm APT nhắm chính xác vào ngành công nghiệp và quốc gia cụ thể.",
    d8_2: "Tốt. Hãy cho biết chính xác tên nhóm APT Nga bị xác định đứng sau vụ hack chuỗi cung ứng SolarWinds.",
    d9_1: "Đã nắm rõ mọi chiến thuật của kẻ thù. Giờ cần xây dựng hệ thống phòng thủ đa tầng để bảo vệ tổ chức của {LEADER}!",
    d9_2: "Đúng vậy! Lọc đầu tiên bằng mail gateway, phân tích file nghi ngờ an toàn trong sandbox, và xây dựng tuyến phòng thủ cuối cùng qua đào tạo người dùng!",
    d10_1: "Tất cả hệ thống phòng thủ đã hoạt động! Gateway, sandbox và đào tạo nhân viên — tuyến phòng thủ ba lớp đang vận hành.",
    d10_2: "Khoan, để tôi xác nhận tên công nghệ thực thi và phân tích file nghi ngờ an toàn trong môi trường ảo cách ly.",
    d11_1: "Hoàn hảo, {AGENT}. Từ SMTP đến xác thực, macro, APT và phòng thủ đa tầng — bạn đã thông thạo mọi thứ về spear phishing.",
    d11_2: "Cảm ơn, {LEADER}! Tôi sẽ ghi chép bài học hôm nay vào sổ tay vụ án.",
    h1: "Tìm máy chủ SMTP gửi mail, máy chủ relay chuyển tiếp, <br>và số cổng dùng để giao tiếp.",
    h2: "Tìm bản ghi SPF xác minh IP gửi, DKIM kiểm tra chữ ký số, <br>và DMARC quyết định chính sách.",
    h3: "Tìm MIME header định nghĩa cấu trúc email, macro VBA ẩn trong tài liệu, <br>và Base64 encoding chuyển đổi tệp đính kèm.",
    h4: "Tìm thông tin APT28 từ Nga, dấu vết Lazarus từ Triều Tiên, <br>và kênh C2 nhận lệnh sau khi lây nhiễm.",
    h5: "Tìm mail gateway lọc email độc hại, sandbox phân tích file nghi ngờ, <br>và đào tạo người dùng nâng cao khả năng phán đoán.",
    c_smtp_t: "Máy chủ SMTP", c_smtp_m: "Simple Mail Transfer Protocol — giao thức cốt lõi truyền email từ máy chủ gửi đến máy chủ nhận. Sử dụng cổng 25 (mặc định) và 587 (truyền bảo mật).",
    c_relay_t: "Chuyển tiếp mail", c_relay_m: "Email đi qua nhiều máy chủ Relay từ MTA gửi đến MTA nhận. Mỗi máy chủ ghi lại thông tin chuyển tiếp trong header Received.",
    c_port_t: "Cổng 25/587", c_port_m: "SMTP mặc định dùng cổng 25, và cổng 587 cho truyền mã hóa STARTTLS. Hacker có thể lợi dụng open relay.",
    c_spf_t: "Bản ghi SPF", c_spf_m: "Sender Policy Framework — so sánh danh sách IP được phép trong DNS miền gửi với IP gửi thực tế để phát hiện giả mạo.",
    c_dkim_t: "Chữ ký DKIM", c_dkim_m: "DomainKeys Identified Mail — máy chủ gửi thêm chữ ký số vào email, bên nhận xác minh tính toàn vẹn bằng khóa công khai DNS.",
    c_dmarc_t: "Chính sách DMARC", c_dmarc_m: "Domain-based Message Authentication — tổng hợp kết quả SPF và DKIM để áp dụng chính sách reject/quarantine/none và tạo báo cáo.",
    c_mime_t: "MIME Header", c_mime_m: "Multipurpose Internet Mail Extensions — định nghĩa loại nội dung email, ranh giới tệp đính kèm và phương thức mã hóa.",
    c_vba_t: "Macro VBA", c_vba_m: "Visual Basic for Applications — script nhúng trong tài liệu Word/Excel tự động thực thi khi click 'Bật nội dung'. Là một trong những vector xâm nhập ban đầu ưa thích của hacker.",
    c_base64_t: "Mã hóa Base64", c_base64_m: "Phương thức mã hóa chuyển tệp đính kèm nhị phân thành văn bản để truyền qua SMTP. File độc hại cũng được nhúng vào email theo định dạng này.",
    c_apt28_t: "Thông tin APT28", c_apt28_m: "Fancy Bear thuộc GRU Nga. Chủ yếu sử dụng tệp đính kèm spear phishing (tài liệu vũ khí hóa) nhắm vào cơ quan chính phủ, quân sự và truyền thông.",
    c_lazarus_t: "Dấu vết Lazarus", c_lazarus_m: "Nhóm liên kết với Tổng cục Trinh sát Triều Tiên. Có lịch sử đánh cắp hàng trăm triệu USD qua spear phishing nhắm vào tổ chức tài chính và sàn tiền mã hóa.",
    c_c2_t: "Kênh C2", c_c2_m: "Command & Control — kênh bí mật mà PC bị nhiễm giao tiếp với máy chủ kẻ tấn công sau khi macro thực thi. Ngụy trang thành lưu lượng HTTP/HTTPS/DNS bình thường.",
    c_gateway_t: "Mail Gateway", c_gateway_m: "Tuyến phòng thủ đầu tiên lọc spam, phishing và tệp đính kèm độc hại trước máy chủ mail. Thực hiện viết lại URL và quét tệp đính kèm.",
    c_sandbox_t: "Sandbox", c_sandbox_m: "Thực thi tệp đính kèm nghi ngờ trong môi trường ảo cách ly để quan sát và phân tích hành vi độc hại (tạo file, thay đổi registry, giao tiếp C2) an toàn.",
    c_training_t: "Đào tạo người dùng", c_training_m: "Điểm kiểm soát cuối cùng của phòng thủ kỹ thuật là 'con người'. Diễn tập mô phỏng phishing và đào tạo nhận thức bảo mật tạo văn hóa báo cáo email đáng ngờ.",
    p1_title: "Cốt lõi truyền email", p1_desc: "Tên <b>giao thức cốt lõi để gửi email</b> trên Internet là gì?",
    p1_opts: ["POP3", "SMTP", "FTP", "HTTP"],
    p2_title: "Lá chắn xác thực đầu tiên", p2_desc: "Công nghệ xác thực email nào so sánh <b>danh sách IP được phép trong DNS miền gửi</b> với IP gửi thực tế để phát hiện giả mạo?",
    p2_opts: ["SPF", "SSL", "SSH", "SNMP"],
    p3_title: "Vũ khí ẩn trong tài liệu", p3_desc: "<b>Script độc hại ẩn trong tệp tài liệu Word/Excel tự động thực thi khi click 'Bật nội dung'</b> là gì?",
    p3_opts: ["JavaScript", "CSS", "Macro VBA", "HTML"],
    p4_title: "Đằng sau vụ hack chuỗi cung ứng", p4_desc: "<b>Nhóm APT Nga nào bị xác định đứng sau vụ hack chuỗi cung ứng SolarWinds 2020</b>?",
    p4_opts: ["APT28", "APT29", "Lazarus", "APT41"],
    p5_title: "Môi trường phân tích an toàn", p5_desc: "<b>Công nghệ thực thi và phân tích tệp đính kèm nghi ngờ an toàn trong môi trường ảo cách ly</b> là gì?",
    p5_opts: ["Tường lửa", "IDS", "Sandbox", "VPN"],
    teamLeader: 'Đội trưởng', agent: 'Đặc vụ', secRate: 'Đã thu thập', certReport: 'Báo cáo hoàn thành',
    analysisReport: 'Báo cáo phân tích', freeMode: '(Chế độ khám phá tự do)',
    proceed: 'Tiếp tục', next: 'Tiếp', closeWindow: 'Đóng', saveData: 'Lưu dữ liệu',
    inventory: 'Dữ liệu thu thập (Inventory)', noClues: 'Chưa thu thập manh mối nào.',
    prevTab: '◀ Trước', nextTab: 'Tiếp ▶',
    rTab1: "1. SMTP & Truyền email", rTab2: "2. Xác thực email", rTab3: "3. Tệp đính kèm & Macro",
    rTab4: "4. Chiến lược nhóm APT", rTab5: "5. Phòng thủ đa tầng", rTab6: "6. Hoàn thành đào tạo",
    r1_h: "SMTP & Truyền email",
    r1_ch1: "Ch 1. Giao thức SMTP",
    r1_ch1_p: 'Tìm hiểu nguyên lý hoạt động của <span class="text-white bg-white/10 px-1 rounded">SMTP (Simple Mail Transfer Protocol)</span>, cốt lõi truyền email. Hiểu quy trình từ MTA gửi đến MTA nhận và vai trò cổng 25/587.',
    r1_ch2: "Ch 2. Định tuyến email",
    r1_ch2_l1: 'Email đi qua nhiều <span class="text-white bg-white/10 px-1 rounded">máy chủ Relay</span> để đến đích.',
    r1_ch2_l2: "Mỗi máy chủ trung chuyển ghi lại trong header Received, hacker lợi dụng open relay để ẩn nguồn gốc.",
    r2_h: "Hệ thống xác thực email",
    r2_ch3: "Ch 3. SPF (Sender Policy Framework)",
    r2_ch3_p: 'Đăng ký danh sách <span class="text-white bg-white/10 px-1 rounded">IP gửi được phép</span> trong bản ghi DNS TXT miền gửi, máy chủ nhận so sánh IP gửi thực tế để phát hiện giả mạo.',
    r2_ch4: "Ch 4. DKIM & DMARC",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">DKIM</span> thêm chữ ký số vào email để phát hiện giả mạo trong quá trình truyền.',
    r2_ch4_l2: '<span class="text-white bg-white/10 px-1 rounded">DMARC</span> tổng hợp kết quả SPF+DKIM để áp dụng chính sách reject/quarantine/none.',
    r3_h: "Tệp đính kèm & Macro",
    r3_ch5: "Ch 5. Cấu trúc MIME",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">MIME (Multipurpose Internet Mail Extensions)</span> định nghĩa loại nội dung email và ranh giới tệp đính kèm. Mã hóa Base64 chuyển file nhị phân thành văn bản để truyền.',
    r3_ch6: "Ch 6. Nguy hiểm của Macro VBA",
    r3_ch6_l1: 'Hacker chèn <span class="text-white bg-white/10 px-1 rounded">macro VBA</span> vào tài liệu Word/Excel để thực thi mã độc khi click \'Bật nội dung\'.',
    r3_ch6_l2: "Macro đóng vai trò dropper tải thêm payload từ máy chủ C2 bên ngoài.",
    r4_h: "Chiến lược nhóm APT",
    r4_ch7: "Ch 7. APT28 & APT29",
    r4_ch7_p: 'Nhóm liên kết tình báo Nga: <span class="text-white bg-white/10 px-1 rounded">APT28 (Fancy Bear)</span> nhắm vào chính phủ/quân sự, <span class="text-white bg-white/10 px-1 rounded">APT29 (Cozy Bear)</span> nhắm vào ngoại giao/năng lượng bằng spear phishing với tài liệu vũ khí hóa.',
    r4_ch8: "Ch 8. Spear phishing của Lazarus",
    r4_ch8_l1: '<span class="text-white bg-white/10 px-1 rounded">Nhóm Lazarus</span> liên kết Triều Tiên nhắm vào tổ chức tài chính và sàn tiền mã hóa.',
    r4_ch8_l2: "Đã đánh cắp hàng trăm triệu USD qua spear phishing ngụy trang thành thư mời tuyển dụng, báo cáo đầu tư và tài liệu công việc.",
    r5_h: "Phòng thủ đa tầng",
    r5_ch9: "Ch 9. Gateway & Sandbox",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">Mail gateway</span> lọc spam và tệp đính kèm độc hại phía trước máy chủ, <span class="text-white bg-white/10 px-1 rounded">sandbox</span> thực thi file nghi ngờ trong môi trường ảo cách ly để quan sát hành vi độc hại.',
    r5_ch10: "Ch 10. Đào tạo người dùng",
    r5_ch10_l1: 'Điểm kiểm soát cuối cùng của phòng thủ kỹ thuật là <span class="text-white bg-white/10 px-1 rounded">con người</span>. Thực hiện diễn tập mô phỏng phishing định kỳ.',
    r5_ch10_l2: "Xây dựng văn hóa bảo mật báo cáo email đáng ngờ ngay lập tức, và tạo thói quen không bấm nút 'Bật nội dung' một cách tùy tiện.",
    r6_title: "Hoàn thành đào tạo!",
    r6_desc: "Từ truyền SMTP đến xác thực email,<br/>phân tích macro, truy vết APT và phòng thủ đa tầng<br/>— bạn đã thông thạo mọi thứ về spear phishing.",
    r6_grade: "Xếp hạng cuối:",
    r6_labBtn: "Đến phòng thực hành 🚀",
    r6_freeHint: "(Đóng cửa sổ để tự do khám phá lại từng khu vực)",
  },
  ar: {
    loc1: 'القطاع 1: غرفة خادم البريد', loc2: 'القطاع 2: محطة التحقق', loc3: 'القطاع 3: مختبر تشريح المرفقات', loc4: 'القطاع 4: غرفة تتبع APT', loc5: 'القطاع 5: مركز قيادة الدفاع',
    d1_1: "انتبه! العميل {AGENT}، مهمة اليوم هي تحليل الهيكل الكامل لهجمات التصيد الموجه. أولاً يجب فهم كيفية إرسال البريد الإلكتروني.",
    d1_2: "نعم يا قائد! هذه غرفة خادم البريد. سمعت أن SMTP هو البروتوكول الأساسي لنقل البريد.",
    d1_3: "صحيح. يستغل القراصنة قناة SMTP لإرسال رسائل تحتوي مرفقات ضارة. اجمع 3 أدلة رئيسية عن عملية نقل البريد!",
    d2_1: "وجدتها! البريد ينطلق من خادم SMTP ويمر عبر عدة خوادم ترحيل قبل الوصول للمستلم.",
    d2_2: "أحسنت. الآن أخبرني باسم البروتوكول الأساسي المستخدم في عملية النقل هذه.",
    d3_1: "بعد فهم مسار نقل البريد، لنفحص أنظمة التوثيق التي تفلتر 'المرسلين المزيفين'.",
    d3_2: "هل يمكن تزوير عنوان المرسل؟ فكيف نتحقق من هوية المرسل؟",
    d3_3: "هنا تأتي ثلاث طبقات من دروع التوثيق: SPF وDKIM وDMARC. أمّن أدلة عن كل تقنية توثيق في هذه المحطة!",
    d4_1: "اكتمل المسح! SPF يتحقق من IP المرسل، DKIM يتحقق من سلامة المحتوى، وDMARC يجمع بينهما للحكم.",
    d4_2: "بالضبط. الآن أخبرني باسم الدرع الأول الذي يتحقق من IP نطاق المرسل.",
    d5_1: "حتى لو تجاوز البريد التوثيق، هناك أسلحة مخفية 'داخله'. لنشرّح البنية الداخلية للمرفقات.",
    d5_2: "في مختبر التشريح هذا أرى رؤوس MIME ومرفقات مشفرة بـ Base64، و... ماكرو VBA مخفي داخل المستندات!",
    d5_3: "نعم، يزرع القراصنة ماكرو VBA خبيث في مستندات Word وExcel. شرّح بنية المرفقات بالكامل!",
    d6_1: "تم تأمين الأدلة! عند تفعيل الماكرو، يقوم بتحميل برمجيات خبيثة إضافية من خوادم خارجية.",
    d6_2: "بالضبط. أخبرني بالاسم الدقيق للسكريبت الخبيث المخفي في ملفات المستندات والذي ينفذ تلقائياً.",
    d7_1: "الآن يجب كشف هوية من يستخدم هذه الأسلحة فعلياً. إنها مجموعات APT المدعومة من الدول.",
    d7_2: "APT28 (روسيا)، Lazarus (كوريا الشمالية)... هذه المجموعات تستخدم مرفقات التصيد الموجه بكثرة!",
    d7_3: "يبحثون بدقة في بيئة عمل الهدف ثم يرسلون رسائل تصيد مخصصة. تتبع قناة C2 وأمّن الأدلة!",
    d8_1: "اكتمل التتبع! اكتشفت نمط كل مجموعة APT في استهداف صناعات ودول محددة بدقة.",
    d8_2: "جيد. أخبرني بالاسم الدقيق لمجموعة APT الروسية المتورطة في اختراق سلسلة توريد SolarWinds.",
    d9_1: "حددنا جميع تكتيكات العدو. الآن يجب بناء نظام دفاع متعدد الطبقات لحماية مؤسسة {LEADER}!",
    d9_2: "صحيح! نفلتر أولاً ببوابة البريد، ونحلل الملفات المشبوهة بأمان في الصندوق الرملي، ونبني خط الدفاع الأخير عبر تدريب المستخدمين!",
    d10_1: "جميع أنظمة الدفاع تعمل! البوابة والصندوق الرملي وتدريب الموظفين — خط الدفاع الثلاثي نشط.",
    d10_2: "انتظر، دعني أؤكد اسم التقنية التي تنفذ وتحلل الملفات المشبوهة بأمان في بيئة افتراضية معزولة.",
    d11_1: "ممتاز يا {AGENT}. من SMTP إلى التوثيق والماكرو وAPT والدفاع متعدد الطبقات — أتقنت كل شيء عن التصيد الموجه.",
    d11_2: "شكراً لك يا {LEADER}! سأنظم دروس اليوم في دفتر القضايا.",
    h1: "ابحث عن خادم SMTP الذي يرسل البريد، خادم الترحيل، <br>وأرقام المنافذ المستخدمة للاتصال.",
    h2: "ابحث عن سجل SPF الذي يتحقق من IP المرسل، DKIM الذي يفحص التوقيع الرقمي، <br>وDMARC الذي يحدد السياسة.",
    h3: "ابحث عن رأس MIME الذي يحدد بنية البريد، ماكرو VBA المخفي في المستندات، <br>وترميز Base64 الذي يحول المرفقات.",
    h4: "ابحث عن معلومات APT28 من روسيا، آثار Lazarus من كوريا الشمالية، <br>وقناة C2 التي تتلقى الأوامر بعد الإصابة.",
    h5: "ابحث عن بوابة البريد التي تفلتر البريد الخبيث، الصندوق الرملي الذي يحلل الملفات المشبوهة، <br>وتدريب المستخدمين الذي يبني القدرة على الحكم.",
    c_smtp_t: "خادم SMTP", c_smtp_m: "Simple Mail Transfer Protocol — البروتوكول الأساسي لنقل البريد من خادم المرسل إلى خادم المستلم. يستخدم المنفذ 25 (افتراضي) و587 (نقل آمن).",
    c_relay_t: "ترحيل البريد", c_relay_m: "يمر البريد عبر عدة خوادم ترحيل (Relay) من MTA المرسل إلى MTA المستلم. كل خادم يسجل عبوره في رأس Received.",
    c_port_t: "المنفذ 25/587", c_port_m: "يستخدم SMTP المنفذ 25 افتراضياً والمنفذ 587 للنقل المشفر STARTTLS. قد يستغل القراصنة الترحيل المفتوح.",
    c_spf_t: "سجل SPF", c_spf_m: "Sender Policy Framework — يقارن قائمة IP المسموح بها المسجلة في DNS نطاق المرسل مع IP المرسل الفعلي لكشف التزوير.",
    c_dkim_t: "توقيع DKIM", c_dkim_m: "DomainKeys Identified Mail — يضيف خادم الإرسال توقيعاً رقمياً للبريد، ويتحقق المستلم من السلامة باستخدام المفتاح العام في DNS.",
    c_dmarc_t: "سياسة DMARC", c_dmarc_m: "Domain-based Message Authentication — يجمع نتائج SPF وDKIM لتطبيق سياسات reject/quarantine/none وإنشاء تقارير.",
    c_mime_t: "رأس MIME", c_mime_m: "Multipurpose Internet Mail Extensions — يحدد نوع محتوى البريد وحدود المرفقات وطرق الترميز.",
    c_vba_t: "ماكرو VBA", c_vba_m: "Visual Basic for Applications — سكريبتات مضمنة في مستندات Word/Excel تنفذ تلقائياً عند النقر على 'تمكين المحتوى'. أحد أكثر نواقل الوصول الأولي تفضيلاً لدى القراصنة.",
    c_base64_t: "ترميز Base64", c_base64_m: "طريقة ترميز تحول المرفقات الثنائية إلى نص للنقل عبر SMTP. الملفات الخبيثة أيضاً تُضمن في البريد بهذا التنسيق.",
    c_apt28_t: "معلومات APT28", c_apt28_m: "Fancy Bear التابع لـ GRU الروسي. يستخدم بشكل أساسي مرفقات التصيد الموجه (مستندات مسلحة) تستهدف المؤسسات الحكومية والعسكرية والإعلامية.",
    c_lazarus_t: "آثار Lazarus", c_lazarus_m: "مجموعة مرتبطة بمكتب الاستطلاع في كوريا الشمالية. لديها سجل في سرقة مئات الملايين عبر التصيد الموجه المستهدف للمؤسسات المالية وبورصات العملات المشفرة.",
    c_c2_t: "قناة C2", c_c2_m: "Command & Control — قناة سرية يتواصل عبرها الحاسوب المصاب مع خادم المهاجم بعد تنفيذ الماكرو. تتنكر كحركة HTTP/HTTPS/DNS عادية.",
    c_gateway_t: "بوابة البريد", c_gateway_m: "خط الدفاع الأول الذي يفلتر البريد العشوائي والتصيد والمرفقات الخبيثة أمام خادم البريد. ينفذ إعادة كتابة URL ومسح المرفقات.",
    c_sandbox_t: "الصندوق الرملي", c_sandbox_m: "ينفذ المرفقات المشبوهة في بيئة افتراضية معزولة لمراقبة وتحليل السلوك الخبيث (إنشاء ملفات، تغيير السجل، اتصال C2) بأمان.",
    c_training_t: "تدريب المستخدمين", c_training_m: "نقطة التفتيش الأخيرة للدفاع التقني هي 'الإنسان'. تدريبات محاكاة التصيد والتوعية الأمنية تخلق ثقافة الإبلاغ عن الرسائل المشبوهة.",
    p1_title: "جوهر نقل البريد", p1_desc: "ما اسم <b>البروتوكول الأساسي لإرسال البريد الإلكتروني</b> على الإنترنت؟",
    p1_opts: ["POP3", "SMTP", "FTP", "HTTP"],
    p2_title: "الدرع الأول للتوثيق", p2_desc: "ما تقنية توثيق البريد التي تقارن <b>قائمة IP المسموح بها في DNS نطاق المرسل</b> مع IP المرسل الفعلي لكشف التزوير؟",
    p2_opts: ["SPF", "SSL", "SSH", "SNMP"],
    p3_title: "السلاح المخفي في المستندات", p3_desc: "ما <b>السكريبت الخبيث المخفي في ملفات Word/Excel الذي ينفذ تلقائياً عند النقر على 'تمكين المحتوى'</b>؟",
    p3_opts: ["JavaScript", "CSS", "ماكرو VBA", "HTML"],
    p4_title: "خلف اختراق سلسلة التوريد", p4_desc: "ما <b>مجموعة APT الروسية المتورطة في اختراق سلسلة توريد SolarWinds عام 2020</b>؟",
    p4_opts: ["APT28", "APT29", "Lazarus", "APT41"],
    p5_title: "بيئة تحليل آمنة", p5_desc: "ما <b>التقنية التي تنفذ وتحلل المرفقات المشبوهة بأمان في بيئة افتراضية معزولة</b>؟",
    p5_opts: ["جدار الحماية", "IDS", "الصندوق الرملي", "VPN"],
    teamLeader: 'القائد', agent: 'العميل', secRate: 'تم التأمين', certReport: 'تقرير الإنجاز',
    analysisReport: 'تقرير التحليل', freeMode: '(وضع الاستكشاف الحر)',
    proceed: 'متابعة', next: 'التالي', closeWindow: 'إغلاق', saveData: 'حفظ البيانات',
    inventory: 'البيانات المجمعة (المخزون)', noClues: 'لم يتم جمع أي أدلة بعد.',
    prevTab: '◀ السابق', nextTab: 'التالي ▶',
    rTab1: "1. SMTP ونقل البريد", rTab2: "2. توثيق البريد", rTab3: "3. المرفقات والماكرو",
    rTab4: "4. استراتيجيات مجموعات APT", rTab5: "5. الدفاع متعدد الطبقات", rTab6: "6. إتمام التدريب",
    r1_h: "SMTP ونقل البريد",
    r1_ch1: "الفصل 1. بروتوكول SMTP",
    r1_ch1_p: 'تعلم مبادئ عمل <span class="text-white bg-white/10 px-1 rounded">SMTP (Simple Mail Transfer Protocol)</span>، جوهر نقل البريد. فهم العملية من MTA المرسل إلى MTA المستلم وأدوار المنفذين 25/587.',
    r1_ch2: "الفصل 2. توجيه البريد",
    r1_ch2_l1: 'يمر البريد عبر عدة <span class="text-white bg-white/10 px-1 rounded">خوادم ترحيل (Relay)</span> للوصول إلى وجهته.',
    r1_ch2_l2: "كل خادم عبور يسجل في رأس Received، ويستغل القراصنة الترحيل المفتوح لإخفاء المصدر.",
    r2_h: "نظام توثيق البريد",
    r2_ch3: "الفصل 3. SPF (إطار سياسة المرسل)",
    r2_ch3_p: 'يسجل قائمة <span class="text-white bg-white/10 px-1 rounded">عناوين IP المسموح بها للإرسال</span> في سجل DNS TXT لنطاق المرسل، ويقارن خادم الاستقبال IP المرسل الفعلي لكشف التزوير.',
    r2_ch4: "الفصل 4. DKIM وDMARC",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">DKIM</span> يضيف توقيعاً رقمياً للبريد لكشف التلاعب أثناء النقل.',
    r2_ch4_l2: '<span class="text-white bg-white/10 px-1 rounded">DMARC</span> يجمع نتائج SPF+DKIM لتطبيق سياسات reject/quarantine/none.',
    r3_h: "المرفقات والماكرو",
    r3_ch5: "الفصل 5. بنية MIME",
    r3_ch5_p: '<span class="text-white bg-white/10 px-1 rounded">MIME (Multipurpose Internet Mail Extensions)</span> يحدد نوع محتوى البريد وحدود المرفقات. ترميز Base64 يحول الملفات الثنائية إلى نص للنقل.',
    r3_ch6: "الفصل 6. خطر ماكرو VBA",
    r3_ch6_l1: 'يدرج القراصنة <span class="text-white bg-white/10 px-1 rounded">ماكرو VBA</span> في مستندات Word/Excel لتنفيذ كود خبيث عند النقر على \'تمكين المحتوى\'.',
    r3_ch6_l2: "الماكرو يعمل كـ dropper يحمّل حمولات إضافية من خوادم C2 خارجية.",
    r4_h: "استراتيجيات مجموعات APT",
    r4_ch7: "الفصل 7. APT28 وAPT29",
    r4_ch7_p: 'مجموعات مرتبطة بالاستخبارات الروسية: <span class="text-white bg-white/10 px-1 rounded">APT28 (Fancy Bear)</span> تستهدف الحكومة/الجيش، بينما <span class="text-white bg-white/10 px-1 rounded">APT29 (Cozy Bear)</span> تستهدف الدبلوماسية/الطاقة بمستندات مسلحة مرفقة.',
    r4_ch8: "الفصل 8. التصيد الموجه لـ Lazarus",
    r4_ch8_l1: '<span class="text-white bg-white/10 px-1 rounded">مجموعة Lazarus</span> المرتبطة بكوريا الشمالية تستهدف المؤسسات المالية وبورصات العملات المشفرة.',
    r4_ch8_l2: "سرقت مئات الملايين عبر التصيد الموجه المتنكر كعروض توظيف وتقارير استثمار ومستندات عمل.",
    r5_h: "الدفاع متعدد الطبقات",
    r5_ch9: "الفصل 9. البوابة والصندوق الرملي",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">بوابة البريد</span> تفلتر البريد العشوائي والمرفقات الخبيثة أمام الخادم، و<span class="text-white bg-white/10 px-1 rounded">الصندوق الرملي</span> ينفذ الملفات المشبوهة في بيئة افتراضية معزولة لمراقبة السلوك الخبيث.',
    r5_ch10: "الفصل 10. تدريب المستخدمين",
    r5_ch10_l1: 'نقطة التفتيش الأخيرة للدفاع التقني هي <span class="text-white bg-white/10 px-1 rounded">الإنسان</span>. نفّذ تدريبات محاكاة التصيد بانتظام.',
    r5_ch10_l2: "ازرع ثقافة أمنية للإبلاغ الفوري عن الرسائل المشبوهة، وطوّر عادة عدم النقر المتهور على 'تمكين المحتوى'.",
    r6_title: "اكتمل التدريب!",
    r6_desc: "من نقل SMTP إلى توثيق البريد،<br/>تحليل الماكرو، تتبع APT والدفاع متعدد الطبقات<br/>— أتقنت كل شيء عن التصيد الموجه.",
    r6_grade: "التقييم النهائي:",
    r6_labBtn: "انتقل إلى المختبر 🚀",
    r6_freeHint: "(أغلق النافذة لإعادة استكشاف كل قطاع بحرية)",
  },
};

const getT = (lang) => T[lang] || T.ko;

// ──────────────────────────────────────────────────────────────────────────────
// [게임 데이터 빌더] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Beginner)
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
    triggerPuzzle: 5
  },
  {
    scene: 'scene_phase5', loc: t.loc5,
    dialogues: [
      { speaker: 'TEAM_LEADER', text: t.d11_1 },
      { speaker: 'AGENT_NAME', text: t.d11_2 }
    ],
    triggerBook: true
  }
];

const buildCLUES_DATA = (t) => ({
  scene_phase1: [
    { id: 'smtp_server',  icon: Server, title: t.c_smtp_t,    msg: t.c_smtp_m },
    { id: 'mail_relay',   icon: Globe,  title: t.c_relay_t,   msg: t.c_relay_m },
    { id: 'port_25',      icon: Terminal, title: t.c_port_t,  msg: t.c_port_m }
  ],
  scene_phase2: [
    { id: 'spf_record',   icon: ShieldCheck, title: t.c_spf_t,   msg: t.c_spf_m },
    { id: 'dkim_sign',    icon: Key,          title: t.c_dkim_t,  msg: t.c_dkim_m },
    { id: 'dmarc_policy', icon: Lock,         title: t.c_dmarc_t, msg: t.c_dmarc_m }
  ],
  scene_phase3: [
    { id: 'mime_header',   icon: FileText, title: t.c_mime_t,     msg: t.c_mime_m },
    { id: 'vba_macro',     icon: Code,     title: t.c_vba_t,      msg: t.c_vba_m },
    { id: 'base64_encode', icon: Database, title: t.c_base64_t,   msg: t.c_base64_m }
  ],
  scene_phase4: [
    { id: 'apt28_intel',   icon: AlertTriangle, title: t.c_apt28_t,   msg: t.c_apt28_m },
    { id: 'lazarus_trace', icon: Search,         title: t.c_lazarus_t, msg: t.c_lazarus_m },
    { id: 'c2_channel',    icon: Wifi,           title: t.c_c2_t,      msg: t.c_c2_m }
  ],
  scene_phase5: [
    { id: 'mail_gateway',  icon: Shield,    title: t.c_gateway_t,  msg: t.c_gateway_m },
    { id: 'sandbox_env',   icon: Box,       title: t.c_sandbox_t,  msg: t.c_sandbox_m },
    { id: 'user_training', icon: UserCheck, title: t.c_training_t, msg: t.c_training_m }
  ]
});

const buildPUZZLES = (t) => ({
  1: {
    title: t.p1_title,
    desc: t.p1_desc,
    options: t.p1_opts,
    answer: 1
  },
  2: {
    title: t.p2_title,
    desc: t.p2_desc,
    options: t.p2_opts,
    answer: 0
  },
  3: {
    title: t.p3_title,
    desc: t.p3_desc,
    options: t.p3_opts,
    answer: 2
  },
  4: {
    title: t.p4_title,
    desc: t.p4_desc,
    options: t.p4_opts,
    answer: 1
  },
  5: {
    title: t.p5_title,
    desc: t.p5_desc,
    options: t.p5_opts,
    answer: 2
  }
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
      {generateClueItem('smtp_server',  0, Server,   "#00E5FF", t.c_smtp_t)}
      {generateClueItem('mail_relay',   1, Globe,    "#10B981", t.c_relay_t)}
      {generateClueItem('port_25',      2, Terminal, "#DFB8B6", t.c_port_t)}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('spf_record',   0, ShieldCheck, "#10B981", t.c_spf_t)}
      {generateClueItem('dkim_sign',    1, Key,         "#00E5FF", t.c_dkim_t)}
      {generateClueItem('dmarc_policy', 2, Lock,        "#DFB8B6", t.c_dmarc_t)}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('mime_header',   0, FileText, "#DFB8B6", t.c_mime_t)}
      {generateClueItem('vba_macro',     1, Code,     "#FF3333", t.c_vba_t)}
      {generateClueItem('base64_encode', 2, Database, "#00E5FF", t.c_base64_t)}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('apt28_intel',   0, AlertTriangle, "#FF6B6B", t.c_apt28_t)}
      {generateClueItem('lazarus_trace', 1, Search,        "#00E5FF", t.c_lazarus_t)}
      {generateClueItem('c2_channel',    2, Wifi,          "#10B981", t.c_c2_t)}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('mail_gateway',  0, Shield,    "#10B981", t.c_gateway_t)}
      {generateClueItem('sandbox_env',   1, Box,       "#00E5FF", t.c_sandbox_t)}
      {generateClueItem('user_training', 2, UserCheck, "#DFB8B6", t.c_training_t)}
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
                              <p dangerouslySetInnerHTML={{ __html: t.r1_ch1_p }}></p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r1_ch2}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch2_l1 }}></li>
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
                              <p dangerouslySetInnerHTML={{ __html: t.r2_ch3_p }}></p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r2_ch4}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch4_l1 }}></li>
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch4_l2 }}></li>
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
                              <p dangerouslySetInnerHTML={{ __html: t.r3_ch5_p }}></p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r3_ch6}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r3_ch6_l1 }}></li>
                                <li>{t.r3_ch6_l2}</li>
                              </ul>
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
                              <p dangerouslySetInnerHTML={{ __html: t.r4_ch7_p }}></p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r4_ch8}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch8_l1 }}></li>
                                <li>{t.r4_ch8_l2}</li>
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
                              <p dangerouslySetInnerHTML={{ __html: t.r5_ch9_p }}></p>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r5_ch10}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r5_ch10_l1 }}></li>
                                <li>{t.r5_ch10_l2}</li>
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
                          <p className="text-sm md:text-base text-gray-300 mb-4 leading-relaxed break-keep" dangerouslySetInnerHTML={{ __html: t.r6_desc }}></p>
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
              {/* 헤더 - shrink-0으로 고정, 닫기 버튼 항상 표시 */}
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

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
// [다국어 텍스트] — lang prop 기반 분기
// ──────────────────────────────────────────────────────────────────────────────
const T = {
  ko: {
    // CHAPTERS locations
    loc1: 'Sector 1: Sysmon 관제실', loc2: 'Sector 2: 룰 엔진실', loc3: 'Sector 3: SIEM 분석실', loc4: 'Sector 4: 포렌식 랩', loc5: 'Sector 5: 정책 배포실',
    // CHAPTERS dialogues
    d1_1: "어험! {AGENT} 요원, 오늘은 한 단계 올라간 훈련이다. 스피어피싱 첨부파일이 실행되면 어떤 흔적이 남는지, Sysmon으로 추적하는 법을 배운다.",
    d1_2: "Sysmon이요? Windows 이벤트 로그보다 더 정밀한 모니터링 도구라고 들었습니다!",
    d1_3: "맞다. Sysmon은 프로세스 생성, 네트워크 연결, 파일 변경까지 세밀하게 기록하지. 관제실에서 핵심 이벤트 단서 3개를 수집해라!",
    d2_1: "수집 완료! Sysmon Event ID 1(프로세스 생성)으로 악성 첨부파일이 cmd.exe를 자식 프로세스로 생성한 흔적을 잡았습니다.",
    d2_2: "훌륭하다. 그렇다면 프로세스 생성을 실시간으로 기록하는 Sysmon 이벤트 ID가 몇 번인지 정확히 대답해 보아라.",
    d3_1: "Sysmon으로 흔적을 잡았으니, 이제 악성코드 자체를 탐지하는 룰 엔진실로 이동한다. 여기서 YARA 룰을 작성하는 법을 배운다.",
    d3_2: "YARA요? 악성코드 바이너리 안에 숨어 있는 고유한 문자열이나 HEX 패턴을 잡아내는 도구죠!",
    d3_3: "정확하다. YARA 룰은 meta, strings, condition 세 블록으로 구성되지. 룰 엔진실에서 핵심 단서를 수집해라!",
    d4_1: "YARA 룰 구조를 파악했습니다! strings 섹션에 악성코드 고유 문자열을 정의하고, condition으로 탐지 조건을 걸 수 있군요.",
    d4_2: "좋아. 그렇다면 악성코드의 바이너리 패턴을 탐지하는 이 룰 엔진의 이름을 정확히 말해 보아라.",
    d5_1: "YARA가 파일 단위 탐지라면, SIEM은 로그 단위 탐지다. 수천 대 장비에서 쏟아지는 로그를 한곳에 모아 상관분석하는 곳이지.",
    d5_2: "그런데 SIEM 제품마다 쿼리 문법이 다르잖아요. Splunk는 SPL, Elastic은 KQL... 통일된 탐지 룰은 없나요?",
    d5_3: "바로 Sigma가 그 역할을 한다! 벤더 중립 YAML 형식으로 한 번 작성하면 어떤 SIEM에서든 변환해 사용할 수 있지. 분석실에서 단서를 수집해라!",
    d6_1: "Sigma 룰로 '의심스러운 부모-자식 프로세스 관계'를 정의하니, Splunk와 Elastic 모두에서 동일한 탐지가 가능하군요!",
    d6_2: "정확하다. 그렇다면 SIEM 시스템에서 사용하는 이 벤더 중립 탐지 룰 형식의 이름을 말해 보아라.",
    d7_1: "탐지 룰을 갖췄으니, 이제 공격의 시작점을 역추적할 차례다. 스피어피싱은 이메일로 시작되니까, 이메일 헤더를 분석해야 한다.",
    d7_2: "이메일 헤더에는 발신자, 수신자 외에도 이메일이 거쳐온 서버 경로가 기록되어 있죠?",
    d7_3: "맞다. 특히 Received 헤더를 아래에서 위로 읽으면 최초 발신 서버를 특정할 수 있지. X-헤더에서 SPF, DKIM 검증 결과도 확인해야 한다. 포렌식 랩에서 단서를 수집해라!",
    d8_1: "Received 체인을 역추적해서 발신 서버 IP를 특정했습니다! SPF fail, DKIM none — 발신자 도메인이 위조된 스피어피싱이 확실합니다.",
    d8_2: "훌륭하다. 그렇다면 이메일이 거쳐온 서버 경로를 추적할 수 있는 헤더 필드의 이름을 정확히 대답해 보아라.",
    d9_1: "이제 마지막이다. 탐지와 분석을 마쳤으니, 조직 전체에 방어 정책을 배포해야 한다. GPO와 ASR, 그리고 3축 방어 모델을 학습한다.",
    d9_2: "GPO로 그룹 정책을 일괄 배포하고, ASR로 Office 매크로 실행 같은 공격 표면을 줄이는 거죠?",
    d9_3: "맞다. 그리고 3축 방어 모델 — 기술(Technology), 프로세스(Process), 인력(People) — 세 축이 균형을 이뤄야 진정한 방어가 완성된다. 정책 배포실의 단서를 마저 수집해라!",
    d10_1: "GPO로 매크로 차단 정책을 전사 배포하고, ASR 룰로 의심스러운 자식 프로세스 생성을 원천 차단했습니다!",
    d10_2: "좋다. 그렇다면 Office 매크로 실행을 차단하는 Windows 보안 정책의 이름을 정확히 말해 보아라.",
    d11_1: "모든 구역 탐색과 정책 배포가 완료되었습니다! Sysmon 관제부터 YARA/Sigma 탐지, 이메일 포렌식, 그리고 GPO/ASR 정책까지 체계적으로 학습했습니다.",
    d11_2: "수고했다, {AGENT}. 중급 과정을 훌륭히 마쳤군. 오늘 학습한 내용을 최종 사건 수첩에 정리해 두었으니 꼼꼼히 복습하도록.",
    // hints
    h1: "Sysmon 이벤트 모니터(Activity), 프로세스 트리(GitBranch), <br>그리고 이벤트 로그 파일(FileText)을 찾아 클릭하세요.",
    h2: "YARA 룰 편집기(Code), HEX 패턴 뷰어(Binary), <br>문자열 매칭 검색기(Search)를 찾아 클릭하세요.",
    h3: "Sigma 룰 편집기(Shield), SIEM 경보 패널(AlertTriangle), <br>상관분석 링크(Link)를 찾아 클릭하세요.",
    h4: "이메일 헤더 분석기(Mail), Received 체인 추적기(Route), <br>X-헤더 검증 뷰어(Eye)를 찾아 클릭하세요.",
    h5: "GPO 정책 편집기(Settings), ASR 룰 패널(ShieldCheck), <br>3축 방어 모델 다이어그램(Target)을 찾아 클릭하세요.",
    // clues
    c_sysmon_t: "Sysmon 이벤트", c_sysmon_m: "Sysmon(System Monitor)은 Windows 시스템에서 프로세스 생성(ID 1), 네트워크 연결(ID 3), 파일 생성(ID 11) 등을 세밀하게 기록하는 고급 모니터링 도구입니다.",
    c_proc_t: "프로세스 트리", c_proc_m: "부모-자식 프로세스 관계를 트리 형태로 시각화합니다. WINWORD.EXE → cmd.exe → powershell.exe 같은 의심스러운 체인을 탐지하는 핵심 기법입니다.",
    c_event_t: "이벤트 로그", c_event_m: "Windows 이벤트 뷰어에 기록되는 구조화된 로그입니다. Sysmon 채널(Microsoft-Windows-Sysmon/Operational)에서 보안 관련 이벤트를 필터링합니다.",
    c_yara_t: "YARA 룰", c_yara_m: "악성코드의 고유 패턴을 정의하는 룰 엔진입니다. meta(메타정보), strings(탐지 문자열), condition(조건식) 세 블록으로 구성되어 파일 스캐닝에 사용됩니다.",
    c_hex_t: "HEX 패턴", c_hex_m: "바이너리 파일 내부의 16진수 바이트 시퀀스입니다. YARA의 strings 섹션에 { 4D 5A 90 00 } 같은 HEX 패턴을 정의하여 PE 헤더 등을 탐지합니다.",
    c_string_t: "문자열 매칭", c_string_m: "악성코드가 사용하는 고유 문자열(C2 도메인, 레지스트리 키, API 호출명)을 YARA strings로 정의하여 정적 분석 없이 빠르게 탐지합니다.",
    c_sigma_t: "Sigma 룰", c_sigma_m: "벤더 중립 YAML 형식의 탐지 룰입니다. 한 번 작성하면 sigmac 컴파일러로 Splunk SPL, Elastic KQL, Microsoft KQL 등으로 자동 변환할 수 있습니다.",
    c_siem_t: "SIEM 경보", c_siem_m: "SIEM(Security Information and Event Management)이 상관분석을 통해 생성하는 보안 경보입니다. 단일 이벤트가 아닌 복수 이벤트의 연관성을 분석합니다.",
    c_corr_t: "상관분석", c_corr_m: "서로 다른 로그 소스(Sysmon, 방화벽, IDS)의 이벤트를 시간순으로 연결하여 공격 체인을 재구성하는 SIEM의 핵심 기능입니다.",
    c_email_t: "이메일 헤더", c_email_m: "이메일의 메타데이터입니다. From, To, Subject 외에도 Received, Message-ID, X-Mailer 등 발신 경로와 인증 정보가 포함되어 있습니다.",
    c_recv_t: "Received 체인", c_recv_m: "이메일이 거쳐온 메일 서버(MTA)의 경로입니다. 아래에서 위로 읽으면 최초 발신 서버 → 중계 서버 → 최종 수신 서버 순서로 추적할 수 있습니다.",
    c_xhdr_t: "X-헤더 분석", c_xhdr_m: "X-Spam-Status, Authentication-Results 등 확장 헤더입니다. SPF pass/fail, DKIM 서명 검증 결과, DMARC 정책 적용 여부를 확인할 수 있습니다.",
    c_gpo_t: "GPO 정책", c_gpo_m: "Group Policy Object — Active Directory를 통해 도메인 내 모든 컴퓨터에 보안 정책을 일괄 배포하는 Windows 관리 도구입니다.",
    c_asr_t: "ASR 룰", c_asr_m: "Attack Surface Reduction — Microsoft Defender의 공격 표면 축소 룰입니다. Office 매크로의 자식 프로세스 생성, 난독화 스크립트 실행 등을 원천 차단합니다.",
    c_def_t: "3축 방어", c_def_m: "기술(Technology), 프로세스(Process), 인력(People) — 이 세 축이 균형을 이뤄야 완전한 방어가 가능하다는 보안 프레임워크입니다.",
    // puzzles
    p1_title: "Sysmon 이벤트 추적", p1_desc: "<b>프로세스 생성</b>을 실시간으로 기록하는 Sysmon 이벤트 ID는?",
    p1_opts: ["Event ID 1", "Event ID 3", "Event ID 7", "Event ID 11"],
    p2_title: "바이너리 탐지 엔진", p2_desc: "<b>악성코드의 바이너리 패턴</b>을 탐지하는 룰 엔진은?",
    p2_opts: ["Snort", "YARA", "Sigma", "Suricata"],
    p3_title: "벤더 중립 탐지 룰", p3_desc: "SIEM 시스템에서 사용하는 <b>벤더 중립 탐지 룰 형식</b>은?",
    p3_opts: ["YARA", "Snort", "Sigma", "KQL"],
    p4_title: "이메일 경로 추적", p4_desc: "이메일이 거쳐온 <b>서버 경로를 추적</b>할 수 있는 헤더 필드는?",
    p4_opts: ["Received", "From", "Reply-To", "Return-Path"],
    p5_title: "공격 표면 축소", p5_desc: "<b>Office 매크로 실행을 차단</b>하는 Windows 보안 정책은?",
    p5_opts: ["UAC", "ASR", "BitLocker", "AppLocker"],
    // UI
    teamLeader: '팀장', agent: '요원', secRate: '확보율', certReport: '수료 보고서',
    analysisReport: '분석 리포트', freeMode: '(자유 탐색 모드)',
    proceed: '진행', next: '다음', closeWindow: '창 닫기', saveData: '데이터 저장하기',
    inventory: '수집 데이터 (Inventory)', noClues: '아직 수집된 단서가 없습니다.',
    prevTab: '이전', nextTab: '다음',
    // report tabs
    rTab1: "1. Sysmon과 프로세스 추적", rTab2: "2. YARA 탐지 룰", rTab3: "3. Sigma와 SIEM",
    rTab4: "4. 이메일 포렌식", rTab5: "5. 정책 기반 방어", rTab6: "6. 최종 훈련 수료",
    // report content
    r1_h: "Sysmon과 프로세스 추적",
    r1_ch1: "Ch 1. Sysmon Event ID별 역할",
    r1_ch1_l1: '<span class="text-white bg-white/10 px-1 rounded">Event ID 1</span> — 프로세스 생성. 어떤 프로그램이 실행되었는지, 부모 프로세스는 무엇인지 기록합니다.',
    r1_ch1_l2: '<span class="text-white bg-white/10 px-1 rounded">Event ID 3</span> — 네트워크 연결. C2 서버와의 통신 시도를 탐지합니다.',
    r1_ch1_l3: '<span class="text-white bg-white/10 px-1 rounded">Event ID 11</span> — 파일 생성. 드롭된 악성 페이로드를 추적합니다.',
    r1_ch2: "Ch 2. 프로세스 트리 분석",
    r1_ch2_l1: 'WINWORD.EXE → cmd.exe → powershell.exe 같은 <span class="text-white bg-white/10 px-1 rounded">비정상 부모-자식 관계</span>가 스피어피싱의 전형적 흔적입니다.',
    r1_ch2_l2: '정상적인 Office 프로세스는 자식 프로세스를 생성하지 않으므로, 이를 탐지 기준으로 삼습니다.',
    r2_h: "YARA 탐지 룰",
    r2_ch3: "Ch 3. YARA 룰 구조 (meta/strings/condition)",
    r2_ch3_l1: '<span class="text-white bg-white/10 px-1 rounded">meta</span> — 룰 작성자, 설명, 참조 URL 등 메타정보를 정의합니다.',
    r2_ch3_l2: '<span class="text-white bg-white/10 px-1 rounded">strings</span> — 탐지할 문자열, HEX 패턴, 정규식을 정의합니다.',
    r2_ch3_l3: '<span class="text-white bg-white/10 px-1 rounded">condition</span> — strings에서 정의한 패턴이 몇 개 이상 매칭되어야 탐지할지 조건을 설정합니다.',
    r2_ch4: "Ch 4. HEX 패턴 매칭",
    r2_ch4_l1: 'PE 파일의 <span class="text-white bg-white/10 px-1 rounded">MZ 헤더(4D 5A)</span>나 악성 셸코드의 고유 바이트 시퀀스를 HEX 패턴으로 정의합니다.',
    r2_ch4_l2: '와일드카드(??), 점프([2-4]), 대안(A|B) 등의 고급 패턴 문법으로 변종까지 탐지합니다.',
    r3_h: "Sigma와 SIEM",
    r3_ch5: "Ch 5. Sigma 룰 문법",
    r3_ch5_l1: '<span class="text-white bg-white/10 px-1 rounded">YAML 형식</span>으로 작성하며, title, logsource, detection, condition 필드로 구성됩니다.',
    r3_ch5_l2: '한 번 작성한 룰을 sigmac로 Splunk SPL, Elastic KQL, Microsoft Sentinel 등으로 <span class="text-white bg-white/10 px-1 rounded">자동 변환</span>할 수 있습니다.',
    r3_ch6: "Ch 6. SIEM 상관분석",
    r3_ch6_l1: '단일 이벤트가 아닌 <span class="text-white bg-white/10 px-1 rounded">복수 로그 소스</span>(Sysmon + 방화벽 + IDS)를 시간순으로 연결합니다.',
    r3_ch6_l2: '이메일 수신 → 첨부파일 실행 → C2 통신 시도를 하나의 공격 체인으로 재구성하여 탐지합니다.',
    r4_h: "이메일 포렌식",
    r4_ch7: "Ch 7. 헤더 필드별 의미",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">From / Reply-To</span> — 발신자 주소. 위조가 가능하므로 단독으로 신뢰하면 안 됩니다.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">Message-ID / X-Mailer</span> — 메일 클라이언트와 고유 식별자. 대량 발송 도구 흔적을 탐지합니다.',
    r4_ch7_l3: '<span class="text-white bg-white/10 px-1 rounded">Authentication-Results</span> — SPF, DKIM, DMARC 검증 결과를 확인하는 핵심 헤더입니다.',
    r4_ch8: "Ch 8. Received 체인 역추적",
    r4_ch8_l1: 'Received 헤더를 <span class="text-white bg-white/10 px-1 rounded">아래에서 위로</span> 읽으면 최초 발신 서버 → 중계 서버 → 수신 서버 순서를 파악합니다.',
    r4_ch8_l2: '발신 서버 IP를 WHOIS, VirusTotal로 조회하여 악성 인프라 여부를 확인합니다.',
    r5_h: "정책 기반 방어",
    r5_ch9: "Ch 9. GPO와 ASR",
    r5_ch9_l1: '<span class="text-white bg-white/10 px-1 rounded">GPO(Group Policy Object)</span> — Active Directory를 통해 도메인 전체에 보안 정책을 일괄 배포합니다.',
    r5_ch9_l2: '<span class="text-white bg-white/10 px-1 rounded">ASR(Attack Surface Reduction)</span> — Office 매크로의 자식 프로세스 생성, 난독화 스크립트 실행 등을 원천 차단합니다.',
    r5_ch10: "Ch 10. 3축 방어 모델",
    r5_ch10_l1: "기술(Technology) — Sysmon, YARA, Sigma, ASR 등 기술적 탐지/차단 도구",
    r5_ch10_l2: "프로세스(Process) — 인시던트 대응 절차, 패치 관리, 로그 보존 정책",
    r5_ch10_l3: "인력(People) — 보안 인식 교육, 피싱 시뮬레이션, SOC 분석관 역량 강화",
    r6_title: "훈련 수료 완료!",
    r6_desc: "Sysmon 관제부터 YARA/Sigma 탐지 룰,<br/>이메일 포렌식, GPO/ASR 정책 배포까지<br/>중급 스피어피싱 방어 과정을 모두 마쳤습니다.",
    r6_grade: "최종 등급:",
    r6_labBtn: "실습 랩으로 이동하기",
    r6_freeHint: "(창을 닫으면 각 구역을 자유롭게 재탐색할 수 있습니다)",
  },
  en: {
    loc1: 'Sector 1: Sysmon Control Room', loc2: 'Sector 2: Rule Engine Lab', loc3: 'Sector 3: SIEM Analysis Room', loc4: 'Sector 4: Forensics Lab', loc5: 'Sector 5: Policy Deployment',
    d1_1: "Ahem! Agent {AGENT}, today we level up. You'll learn how to track the traces left when a spearphishing attachment executes, using Sysmon.",
    d1_2: "Sysmon? I've heard it's a more precise monitoring tool than standard Windows event logs!",
    d1_3: "Correct. Sysmon records process creation, network connections, and file changes in detail. Collect 3 key event clues from the control room!",
    d2_1: "Collection complete! I caught traces of the malicious attachment spawning cmd.exe as a child process using Sysmon Event ID 1.",
    d2_2: "Excellent. Now tell me exactly which Sysmon Event ID records process creation in real time.",
    d3_1: "Now that we've captured traces with Sysmon, let's move to the Rule Engine Lab to detect malware itself. Here you'll learn to write YARA rules.",
    d3_2: "YARA? That's the tool for catching unique strings and HEX patterns hidden in malware binaries!",
    d3_3: "Exactly. YARA rules consist of three blocks: meta, strings, and condition. Collect the key clues from the Rule Engine Lab!",
    d4_1: "I've understood the YARA rule structure! You define malware-specific strings in the strings section and set detection conditions in condition.",
    d4_2: "Good. Now tell me the exact name of this rule engine that detects binary patterns in malware.",
    d5_1: "If YARA detects at the file level, SIEM detects at the log level. It aggregates logs from thousands of devices and performs correlation analysis.",
    d5_2: "But each SIEM product has different query syntax. Splunk uses SPL, Elastic uses KQL... Is there no unified detection rule?",
    d5_3: "That's exactly what Sigma does! Written once in vendor-neutral YAML format, it can be converted for any SIEM. Collect clues from the analysis room!",
    d6_1: "By defining 'suspicious parent-child process relationships' with Sigma rules, the same detection works on both Splunk and Elastic!",
    d6_2: "Correct. Now tell me the name of this vendor-neutral detection rule format used in SIEM systems.",
    d7_1: "With detection rules in place, it's time to trace the attack's origin. Spearphishing starts with email, so we need to analyze email headers.",
    d7_2: "Email headers contain the server path the email traveled through, in addition to sender and recipient, right?",
    d7_3: "Right. Reading the Received headers from bottom to top identifies the original sending server. You also need to check SPF and DKIM results in X-headers. Collect clues from the Forensics Lab!",
    d8_1: "I traced back the Received chain and identified the sending server IP! SPF fail, DKIM none — this is definitely a spearphishing email with a forged sender domain.",
    d8_2: "Excellent. Now tell me the exact name of the header field that lets you trace the server path an email traveled through.",
    d9_1: "This is the final phase. With detection and analysis complete, we need to deploy defense policies across the entire organization. We'll learn about GPO, ASR, and the 3-axis defense model.",
    d9_2: "GPO deploys group policies across the organization, and ASR reduces the attack surface by blocking things like Office macro execution, right?",
    d9_3: "Correct. And the 3-axis defense model — Technology, Process, People — all three must be balanced for true defense. Collect the remaining clues from the Policy Deployment room!",
    d10_1: "I've deployed macro-blocking policies organization-wide via GPO and blocked suspicious child process creation with ASR rules!",
    d10_2: "Good. Now tell me the exact name of the Windows security policy that blocks Office macro execution.",
    d11_1: "All sector exploration and policy deployment complete! I systematically learned Sysmon monitoring, YARA/Sigma detection, email forensics, and GPO/ASR policies.",
    d11_2: "Well done, {AGENT}. You've excellently completed the intermediate course. I've documented today's lessons in the final case notebook — review it thoroughly.",
    h1: "Click on the Sysmon Event Monitor (Activity), Process Tree (GitBranch), <br>and Event Log file (FileText).",
    h2: "Click on the YARA Rule Editor (Code), HEX Pattern Viewer (Binary), <br>and String Matching Scanner (Search).",
    h3: "Click on the Sigma Rule Editor (Shield), SIEM Alert Panel (AlertTriangle), <br>and Correlation Link (Link).",
    h4: "Click on the Email Header Analyzer (Mail), Received Chain Tracker (Route), <br>and X-Header Verification Viewer (Eye).",
    h5: "Click on the GPO Policy Editor (Settings), ASR Rule Panel (ShieldCheck), <br>and 3-Axis Defense Model Diagram (Target).",
    c_sysmon_t: "Sysmon Events", c_sysmon_m: "Sysmon (System Monitor) is an advanced monitoring tool for Windows that precisely records process creation (ID 1), network connections (ID 3), file creation (ID 11), and more.",
    c_proc_t: "Process Tree", c_proc_m: "Visualizes parent-child process relationships in tree form. A key technique for detecting suspicious chains like WINWORD.EXE → cmd.exe → powershell.exe.",
    c_event_t: "Event Log", c_event_m: "Structured logs recorded in Windows Event Viewer. Security-related events are filtered from the Sysmon channel (Microsoft-Windows-Sysmon/Operational).",
    c_yara_t: "YARA Rules", c_yara_m: "A rule engine that defines unique patterns of malware. Composed of three blocks — meta (metadata), strings (detection strings), and condition (conditions) — used for file scanning.",
    c_hex_t: "HEX Patterns", c_hex_m: "Hexadecimal byte sequences inside binary files. HEX patterns like { 4D 5A 90 00 } are defined in YARA's strings section to detect PE headers and more.",
    c_string_t: "String Matching", c_string_m: "Defines malware-specific strings (C2 domains, registry keys, API call names) in YARA strings for rapid detection without static analysis.",
    c_sigma_t: "Sigma Rules", c_sigma_m: "Vendor-neutral detection rules in YAML format. Once written, they can be auto-converted to Splunk SPL, Elastic KQL, Microsoft KQL, etc. using the sigmac compiler.",
    c_siem_t: "SIEM Alerts", c_siem_m: "Security alerts generated by SIEM (Security Information and Event Management) through correlation analysis. Analyzes relationships between multiple events, not single events.",
    c_corr_t: "Correlation", c_corr_m: "A core SIEM function that connects events from different log sources (Sysmon, firewall, IDS) chronologically to reconstruct attack chains.",
    c_email_t: "Email Headers", c_email_m: "Email metadata. Contains Received, Message-ID, X-Mailer, and authentication info beyond the standard From, To, and Subject fields.",
    c_recv_t: "Received Chain", c_recv_m: "The path of mail servers (MTAs) the email traveled through. Reading from bottom to top reveals: origin server → relay servers → final receiving server.",
    c_xhdr_t: "X-Header Analysis", c_xhdr_m: "Extended headers such as X-Spam-Status and Authentication-Results. Used to verify SPF pass/fail, DKIM signature validation, and DMARC policy application.",
    c_gpo_t: "GPO Policy", c_gpo_m: "Group Policy Object — a Windows management tool for deploying security policies to all computers in a domain via Active Directory.",
    c_asr_t: "ASR Rules", c_asr_m: "Attack Surface Reduction — Microsoft Defender rules that block Office macro child process creation, obfuscated script execution, and more at the source.",
    c_def_t: "3-Axis Defense", c_def_m: "A security framework stating that Technology, Process, and People — all three axes must be balanced for complete defense.",
    p1_title: "Sysmon Event Tracking", p1_desc: "Which Sysmon Event ID records <b>process creation</b> in real time?",
    p1_opts: ["Event ID 1", "Event ID 3", "Event ID 7", "Event ID 11"],
    p2_title: "Binary Detection Engine", p2_desc: "Which rule engine detects <b>binary patterns in malware</b>?",
    p2_opts: ["Snort", "YARA", "Sigma", "Suricata"],
    p3_title: "Vendor-Neutral Detection Rules", p3_desc: "What is the <b>vendor-neutral detection rule format</b> used in SIEM systems?",
    p3_opts: ["YARA", "Snort", "Sigma", "KQL"],
    p4_title: "Email Path Tracing", p4_desc: "Which header field lets you <b>trace the server path</b> an email traveled through?",
    p4_opts: ["Received", "From", "Reply-To", "Return-Path"],
    p5_title: "Attack Surface Reduction", p5_desc: "Which Windows security policy <b>blocks Office macro execution</b>?",
    p5_opts: ["UAC", "ASR", "BitLocker", "AppLocker"],
    teamLeader: 'Chief', agent: 'Agent', secRate: 'Secured', certReport: 'Completion Report',
    analysisReport: 'Analysis Report', freeMode: '(Free Exploration Mode)',
    proceed: 'Proceed', next: 'Next', closeWindow: 'Close', saveData: 'Save Data',
    inventory: 'Collected Data (Inventory)', noClues: 'No clues collected yet.',
    prevTab: 'Prev', nextTab: 'Next',
    rTab1: "1. Sysmon & Process Tracking", rTab2: "2. YARA Detection Rules", rTab3: "3. Sigma & SIEM",
    rTab4: "4. Email Forensics", rTab5: "5. Policy-Based Defense", rTab6: "6. Training Completion",
    r1_h: "Sysmon & Process Tracking",
    r1_ch1: "Ch 1. Sysmon Event ID Roles",
    r1_ch1_l1: '<span class="text-white bg-white/10 px-1 rounded">Event ID 1</span> — Process creation. Records what program was executed and its parent process.',
    r1_ch1_l2: '<span class="text-white bg-white/10 px-1 rounded">Event ID 3</span> — Network connection. Detects communication attempts with C2 servers.',
    r1_ch1_l3: '<span class="text-white bg-white/10 px-1 rounded">Event ID 11</span> — File creation. Tracks dropped malicious payloads.',
    r1_ch2: "Ch 2. Process Tree Analysis",
    r1_ch2_l1: 'Abnormal parent-child relationships like WINWORD.EXE → cmd.exe → powershell.exe are <span class="text-white bg-white/10 px-1 rounded">typical traces of spearphishing</span>.',
    r1_ch2_l2: 'Normal Office processes do not create child processes, making this a reliable detection criterion.',
    r2_h: "YARA Detection Rules",
    r2_ch3: "Ch 3. YARA Rule Structure (meta/strings/condition)",
    r2_ch3_l1: '<span class="text-white bg-white/10 px-1 rounded">meta</span> — Defines metadata such as rule author, description, and reference URLs.',
    r2_ch3_l2: '<span class="text-white bg-white/10 px-1 rounded">strings</span> — Defines detection strings, HEX patterns, and regular expressions.',
    r2_ch3_l3: '<span class="text-white bg-white/10 px-1 rounded">condition</span> — Sets how many patterns must match for detection.',
    r2_ch4: "Ch 4. HEX Pattern Matching",
    r2_ch4_l1: 'Defines HEX patterns for PE file <span class="text-white bg-white/10 px-1 rounded">MZ headers (4D 5A)</span> or unique byte sequences of malicious shellcode.',
    r2_ch4_l2: 'Advanced pattern syntax like wildcards (??), jumps ([2-4]), and alternatives (A|B) can detect variants.',
    r3_h: "Sigma & SIEM",
    r3_ch5: "Ch 5. Sigma Rule Syntax",
    r3_ch5_l1: 'Written in <span class="text-white bg-white/10 px-1 rounded">YAML format</span>, consisting of title, logsource, detection, and condition fields.',
    r3_ch5_l2: 'Rules can be <span class="text-white bg-white/10 px-1 rounded">auto-converted</span> via sigmac to Splunk SPL, Elastic KQL, Microsoft Sentinel, and more.',
    r3_ch6: "Ch 6. SIEM Correlation Analysis",
    r3_ch6_l1: 'Connects <span class="text-white bg-white/10 px-1 rounded">multiple log sources</span> (Sysmon + firewall + IDS) chronologically, not just single events.',
    r3_ch6_l2: 'Reconstructs email receipt → attachment execution → C2 communication attempt as a single attack chain for detection.',
    r4_h: "Email Forensics",
    r4_ch7: "Ch 7. Header Field Meanings",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">From / Reply-To</span> — Sender address. Can be forged, so never trust it alone.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">Message-ID / X-Mailer</span> — Mail client and unique identifier. Detects traces of mass-mailing tools.',
    r4_ch7_l3: '<span class="text-white bg-white/10 px-1 rounded">Authentication-Results</span> — The key header for verifying SPF, DKIM, and DMARC results.',
    r4_ch8: "Ch 8. Received Chain Backtracking",
    r4_ch8_l1: 'Reading Received headers <span class="text-white bg-white/10 px-1 rounded">from bottom to top</span> reveals the origin server → relay servers → receiving server path.',
    r4_ch8_l2: 'The sending server IP is looked up via WHOIS and VirusTotal to check for malicious infrastructure.',
    r5_h: "Policy-Based Defense",
    r5_ch9: "Ch 9. GPO & ASR",
    r5_ch9_l1: '<span class="text-white bg-white/10 px-1 rounded">GPO (Group Policy Object)</span> — Deploys security policies domain-wide via Active Directory.',
    r5_ch9_l2: '<span class="text-white bg-white/10 px-1 rounded">ASR (Attack Surface Reduction)</span> — Blocks Office macro child process creation, obfuscated script execution, and more.',
    r5_ch10: "Ch 10. 3-Axis Defense Model",
    r5_ch10_l1: "Technology — Technical detection/blocking tools: Sysmon, YARA, Sigma, ASR",
    r5_ch10_l2: "Process — Incident response procedures, patch management, log retention policies",
    r5_ch10_l3: "People — Security awareness training, phishing simulations, SOC analyst skill development",
    r6_title: "Training Complete!",
    r6_desc: "From Sysmon monitoring to YARA/Sigma detection rules,<br/>email forensics, and GPO/ASR policy deployment —<br/>you've completed the intermediate spearphishing defense course.",
    r6_grade: "Final Grade:",
    r6_labBtn: "Proceed to Lab",
    r6_freeHint: "(Close this window to freely re-explore each sector)",
  },
  ja: {
    loc1: 'Sector 1: Sysmon管制室', loc2: 'Sector 2: ルールエンジン室', loc3: 'Sector 3: SIEM分析室', loc4: 'Sector 4: フォレンジックラボ', loc5: 'Sector 5: ポリシー配布室',
    d1_1: "おっほん！{AGENT}隊員、今日はワンランク上の訓練だ。スピアフィッシング添付ファイルが実行されるとどんな痕跡が残るか、Sysmonで追跡する方法を学ぶ。",
    d1_2: "Sysmonですか？Windowsイベントログよりも精密な監視ツールだと聞いています！",
    d1_3: "その通りだ。Sysmonはプロセス生成、ネットワーク接続、ファイル変更まで詳細に記録する。管制室で重要なイベント手がかり3つを収集しろ！",
    d2_1: "収集完了！Sysmon Event ID 1（プロセス生成）で悪性添付ファイルがcmd.exeを子プロセスとして生成した痕跡を捕捉しました。",
    d2_2: "素晴らしい。では、プロセス生成をリアルタイムで記録するSysmonイベントIDの番号を正確に答えてみろ。",
    d3_1: "Sysmonで痕跡を捕えたので、次はマルウェア自体を検出するルールエンジン室に移動する。ここでYARAルールの書き方を学ぶ。",
    d3_2: "YARAですか？マルウェアのバイナリに隠された固有の文字列やHEXパターンを検出するツールですね！",
    d3_3: "正確だ。YARAルールはmeta、strings、conditionの3ブロックで構成される。ルールエンジン室で重要な手がかりを収集しろ！",
    d4_1: "YARAルール構造を把握しました！stringsセクションでマルウェア固有の文字列を定義し、conditionで検出条件を設定できるんですね。",
    d4_2: "よし。ではマルウェアのバイナリパターンを検出するこのルールエンジンの名前を正確に言ってみろ。",
    d5_1: "YARAがファイル単位の検出なら、SIEMはログ単位の検出だ。数千台の機器から流れ込むログを一か所に集めて相関分析する場所だ。",
    d5_2: "でもSIEM製品ごとにクエリ文法が違いますよね。SplunkはSPL、ElasticはKQL…統一された検出ルールはないんですか？",
    d5_3: "まさにSigmaがその役割を果たす！ベンダー中立のYAML形式で一度書けば、どのSIEMでも変換して使える。分析室で手がかりを収集しろ！",
    d6_1: "Sigmaルールで『不審な親子プロセス関係』を定義すると、SplunkでもElasticでも同じ検出ができるんですね！",
    d6_2: "正確だ。ではSIEMシステムで使われるこのベンダー中立検出ルール形式の名前を答えてみろ。",
    d7_1: "検出ルールを揃えたので、次は攻撃の起点を逆追跡する番だ。スピアフィッシングはメールから始まるから、メールヘッダーを分析する必要がある。",
    d7_2: "メールヘッダーには送信者、受信者以外にも、メールが経由したサーバー経路が記録されていますよね？",
    d7_3: "その通りだ。特にReceivedヘッダーを下から上に読めば最初の送信サーバーを特定できる。X-ヘッダーでSPF、DKIM検証結果も確認する必要がある。フォレンジックラボで手がかりを収集しろ！",
    d8_1: "Received チェーンを逆追跡して送信サーバーIPを特定しました！SPF fail、DKIM none — 送信者ドメインが偽造されたスピアフィッシングで間違いありません。",
    d8_2: "素晴らしい。ではメールが経由したサーバー経路を追跡できるヘッダーフィールドの名前を正確に答えてみろ。",
    d9_1: "最後だ。検出と分析を終えたので、組織全体に防御ポリシーを配布する必要がある。GPOとASR、そして3軸防御モデルを学習する。",
    d9_2: "GPOでグループポリシーを一括配布し、ASRでOfficeマクロ実行などの攻撃面を削減するんですね？",
    d9_3: "その通りだ。そして3軸防御モデル — 技術(Technology)、プロセス(Process)、人材(People) — この3軸のバランスが取れて初めて真の防御が完成する。ポリシー配布室の手がかりを残りも収集しろ！",
    d10_1: "GPOでマクロ遮断ポリシーを全社に配布し、ASRルールで不審な子プロセス生成を根本から遮断しました！",
    d10_2: "よし。ではOfficeマクロ実行を遮断するWindowsセキュリティポリシーの名前を正確に答えてみろ。",
    d11_1: "全セクターの探索とポリシー配布が完了しました！Sysmon管制からYARA/Sigma検出、メールフォレンジック、GPO/ASRポリシーまで体系的に学びました。",
    d11_2: "ご苦労だった、{AGENT}。中級課程を見事に修了したな。今日学んだ内容を最終事件手帳にまとめてあるので、しっかり復習するように。",
    h1: "Sysmonイベントモニター(Activity)、プロセスツリー(GitBranch)、<br>イベントログファイル(FileText)をクリックしてください。",
    h2: "YARAルールエディター(Code)、HEXパターンビューア(Binary)、<br>文字列マッチングスキャナー(Search)をクリックしてください。",
    h3: "Sigmaルールエディター(Shield)、SIEMアラートパネル(AlertTriangle)、<br>相関分析リンク(Link)をクリックしてください。",
    h4: "メールヘッダーアナライザー(Mail)、Receivedチェーントラッカー(Route)、<br>X-ヘッダー検証ビューア(Eye)をクリックしてください。",
    h5: "GPOポリシーエディター(Settings)、ASRルールパネル(ShieldCheck)、<br>3軸防御モデルダイアグラム(Target)をクリックしてください。",
    c_sysmon_t: "Sysmonイベント", c_sysmon_m: "Sysmon(System Monitor)はWindowsシステムでプロセス生成(ID 1)、ネットワーク接続(ID 3)、ファイル生成(ID 11)などを詳細に記録する高度な監視ツールです。",
    c_proc_t: "プロセスツリー", c_proc_m: "親子プロセス関係をツリー形式で可視化します。WINWORD.EXE → cmd.exe → powershell.exe のような不審なチェーンを検出する核心技法です。",
    c_event_t: "イベントログ", c_event_m: "Windowsイベントビューアに記録される構造化ログです。Sysmonチャンネル(Microsoft-Windows-Sysmon/Operational)でセキュリティ関連イベントをフィルタリングします。",
    c_yara_t: "YARAルール", c_yara_m: "マルウェアの固有パターンを定義するルールエンジンです。meta(メタ情報)、strings(検出文字列)、condition(条件式)の3ブロックで構成され、ファイルスキャンに使用されます。",
    c_hex_t: "HEXパターン", c_hex_m: "バイナリファイル内部の16進数バイトシーケンスです。YARAのstringsセクションに{ 4D 5A 90 00 }のようなHEXパターンを定義してPEヘッダーなどを検出します。",
    c_string_t: "文字列マッチング", c_string_m: "マルウェアが使用する固有文字列(C2ドメイン、レジストリキー、API呼び出し名)をYARA stringsで定義し、静的分析なしで迅速に検出します。",
    c_sigma_t: "Sigmaルール", c_sigma_m: "ベンダー中立のYAML形式の検出ルールです。一度書けばsigmacコンパイラでSplunk SPL、Elastic KQL、Microsoft KQLなどに自動変換できます。",
    c_siem_t: "SIEMアラート", c_siem_m: "SIEM(Security Information and Event Management)が相関分析を通じて生成するセキュリティアラートです。単一イベントではなく複数イベントの関連性を分析します。",
    c_corr_t: "相関分析", c_corr_m: "異なるログソース(Sysmon、ファイアウォール、IDS)のイベントを時系列で接続し、攻撃チェーンを再構成するSIEMの核心機能です。",
    c_email_t: "メールヘッダー", c_email_m: "メールのメタデータです。From、To、Subject以外にもReceived、Message-ID、X-Mailerなど送信経路と認証情報が含まれています。",
    c_recv_t: "Receivedチェーン", c_recv_m: "メールが経由したメールサーバー(MTA)の経路です。下から上に読むと最初の送信サーバー→中継サーバー→最終受信サーバーの順で追跡できます。",
    c_xhdr_t: "X-ヘッダー分析", c_xhdr_m: "X-Spam-Status、Authentication-Resultsなど拡張ヘッダーです。SPF pass/fail、DKIM署名検証結果、DMARCポリシー適用有無を確認できます。",
    c_gpo_t: "GPOポリシー", c_gpo_m: "Group Policy Object — Active Directoryを通じてドメイン内のすべてのコンピューターにセキュリティポリシーを一括配布するWindows管理ツールです。",
    c_asr_t: "ASRルール", c_asr_m: "Attack Surface Reduction — Microsoft Defenderの攻撃面削減ルールです。Officeマクロの子プロセス生成、難読化スクリプト実行などを根本から遮断します。",
    c_def_t: "3軸防御", c_def_m: "技術(Technology)、プロセス(Process)、人材(People) — この3軸のバランスが取れて初めて完全な防御が可能になるセキュリティフレームワークです。",
    p1_title: "Sysmonイベント追跡", p1_desc: "<b>プロセス生成</b>をリアルタイムで記録するSysmonイベントIDは？",
    p1_opts: ["Event ID 1", "Event ID 3", "Event ID 7", "Event ID 11"],
    p2_title: "バイナリ検出エンジン", p2_desc: "<b>マルウェアのバイナリパターン</b>を検出するルールエンジンは？",
    p2_opts: ["Snort", "YARA", "Sigma", "Suricata"],
    p3_title: "ベンダー中立検出ルール", p3_desc: "SIEMシステムで使用する<b>ベンダー中立検出ルール形式</b>は？",
    p3_opts: ["YARA", "Snort", "Sigma", "KQL"],
    p4_title: "メール経路追跡", p4_desc: "メールが経由した<b>サーバー経路を追跡</b>できるヘッダーフィールドは？",
    p4_opts: ["Received", "From", "Reply-To", "Return-Path"],
    p5_title: "攻撃面削減", p5_desc: "<b>Officeマクロ実行を遮断</b>するWindowsセキュリティポリシーは？",
    p5_opts: ["UAC", "ASR", "BitLocker", "AppLocker"],
    teamLeader: '班長', agent: '隊員', secRate: '確保率', certReport: '修了報告書',
    analysisReport: '分析レポート', freeMode: '（自由探索モード）',
    proceed: '進行', next: '次へ', closeWindow: '閉じる', saveData: 'データ保存',
    inventory: '収集データ（Inventory）', noClues: 'まだ収集された手がかりがありません。',
    prevTab: '前へ', nextTab: '次へ',
    rTab1: "1. Sysmonとプロセス追跡", rTab2: "2. YARA検出ルール", rTab3: "3. SigmaとSIEM",
    rTab4: "4. メールフォレンジック", rTab5: "5. ポリシー基盤防御", rTab6: "6. 最終訓練修了",
    r1_h: "Sysmonとプロセス追跡",
    r1_ch1: "Ch 1. Sysmon Event ID別の役割",
    r1_ch1_l1: '<span class="text-white bg-white/10 px-1 rounded">Event ID 1</span> — プロセス生成。どのプログラムが実行されたか、親プロセスは何かを記録します。',
    r1_ch1_l2: '<span class="text-white bg-white/10 px-1 rounded">Event ID 3</span> — ネットワーク接続。C2サーバーとの通信試行を検出します。',
    r1_ch1_l3: '<span class="text-white bg-white/10 px-1 rounded">Event ID 11</span> — ファイル生成。ドロップされた悪性ペイロードを追跡します。',
    r1_ch2: "Ch 2. プロセスツリー分析",
    r1_ch2_l1: 'WINWORD.EXE → cmd.exe → powershell.exe のような<span class="text-white bg-white/10 px-1 rounded">異常な親子関係</span>がスピアフィッシングの典型的な痕跡です。',
    r1_ch2_l2: '正常なOfficeプロセスは子プロセスを生成しないため、これを検出基準とします。',
    r2_h: "YARA検出ルール",
    r2_ch3: "Ch 3. YARAルール構造 (meta/strings/condition)",
    r2_ch3_l1: '<span class="text-white bg-white/10 px-1 rounded">meta</span> — ルール作成者、説明、参照URLなどのメタ情報を定義します。',
    r2_ch3_l2: '<span class="text-white bg-white/10 px-1 rounded">strings</span> — 検出する文字列、HEXパターン、正規表現を定義します。',
    r2_ch3_l3: '<span class="text-white bg-white/10 px-1 rounded">condition</span> — stringsで定義したパターンが何個以上マッチすれば検出するか条件を設定します。',
    r2_ch4: "Ch 4. HEXパターンマッチング",
    r2_ch4_l1: 'PEファイルの<span class="text-white bg-white/10 px-1 rounded">MZヘッダー(4D 5A)</span>や悪性シェルコードの固有バイトシーケンスをHEXパターンで定義します。',
    r2_ch4_l2: 'ワイルドカード(??)、ジャンプ([2-4])、代替(A|B)などの高度なパターン文法で変種まで検出します。',
    r3_h: "SigmaとSIEM",
    r3_ch5: "Ch 5. Sigmaルール文法",
    r3_ch5_l1: '<span class="text-white bg-white/10 px-1 rounded">YAML形式</span>で作成し、title、logsource、detection、conditionフィールドで構成されます。',
    r3_ch5_l2: '一度作成したルールをsigmacでSplunk SPL、Elastic KQL、Microsoft Sentinelなどに<span class="text-white bg-white/10 px-1 rounded">自動変換</span>できます。',
    r3_ch6: "Ch 6. SIEM相関分析",
    r3_ch6_l1: '単一イベントではなく<span class="text-white bg-white/10 px-1 rounded">複数ログソース</span>(Sysmon + ファイアウォール + IDS)を時系列で接続します。',
    r3_ch6_l2: 'メール受信 → 添付ファイル実行 → C2通信試行を一つの攻撃チェーンとして再構成して検出します。',
    r4_h: "メールフォレンジック",
    r4_ch7: "Ch 7. ヘッダーフィールド別の意味",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">From / Reply-To</span> — 送信者アドレス。偽造可能なため単独で信頼してはいけません。',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">Message-ID / X-Mailer</span> — メールクライアントと固有識別子。大量送信ツールの痕跡を検出します。',
    r4_ch7_l3: '<span class="text-white bg-white/10 px-1 rounded">Authentication-Results</span> — SPF、DKIM、DMARC検証結果を確認する重要ヘッダーです。',
    r4_ch8: "Ch 8. Receivedチェーン逆追跡",
    r4_ch8_l1: 'Receivedヘッダーを<span class="text-white bg-white/10 px-1 rounded">下から上に</span>読むと最初の送信サーバー → 中継サーバー → 受信サーバーの順序がわかります。',
    r4_ch8_l2: '送信サーバーIPをWHOIS、VirusTotalで照会して悪性インフラかどうかを確認します。',
    r5_h: "ポリシー基盤防御",
    r5_ch9: "Ch 9. GPOとASR",
    r5_ch9_l1: '<span class="text-white bg-white/10 px-1 rounded">GPO(Group Policy Object)</span> — Active Directoryを通じてドメイン全体にセキュリティポリシーを一括配布します。',
    r5_ch9_l2: '<span class="text-white bg-white/10 px-1 rounded">ASR(Attack Surface Reduction)</span> — Officeマクロの子プロセス生成、難読化スクリプト実行などを根本から遮断します。',
    r5_ch10: "Ch 10. 3軸防御モデル",
    r5_ch10_l1: "技術(Technology) — Sysmon、YARA、Sigma、ASR等の技術的検出/遮断ツール",
    r5_ch10_l2: "プロセス(Process) — インシデント対応手順、パッチ管理、ログ保存ポリシー",
    r5_ch10_l3: "人材(People) — セキュリティ意識教育、フィッシングシミュレーション、SOCアナリストのスキル強化",
    r6_title: "訓練修了！",
    r6_desc: "Sysmon管制からYARA/Sigma検出ルール、<br/>メールフォレンジック、GPO/ASRポリシー配布まで<br/>中級スピアフィッシング防御課程をすべて修了しました。",
    r6_grade: "最終等級：",
    r6_labBtn: "実習ラボへ移動",
    r6_freeHint: "（ウィンドウを閉じると各セクターを自由に再探索できます）",
  },
  vi: {
    loc1: 'Sector 1: Phòng điều khiển Sysmon', loc2: 'Sector 2: Phòng Rule Engine', loc3: 'Sector 3: Phòng phân tích SIEM', loc4: 'Sector 4: Phòng thí nghiệm Forensic', loc5: 'Sector 5: Phòng triển khai chính sách',
    d1_1: "Chú ý! Đặc vụ {AGENT}, hôm nay chúng ta nâng cấp huấn luyện. Bạn sẽ học cách theo dõi dấu vết khi tệp đính kèm spearphishing được thực thi bằng Sysmon.",
    d1_2: "Sysmon ạ? Em nghe nói nó là công cụ giám sát chính xác hơn nhật ký sự kiện Windows!",
    d1_3: "Đúng vậy. Sysmon ghi lại chi tiết việc tạo tiến trình, kết nối mạng và thay đổi tệp. Thu thập 3 manh mối sự kiện quan trọng từ phòng điều khiển!",
    d2_1: "Thu thập hoàn tất! Tôi đã phát hiện dấu vết tệp đính kèm độc hại tạo cmd.exe làm tiến trình con bằng Sysmon Event ID 1.",
    d2_2: "Tuyệt vời. Vậy hãy cho biết chính xác Sysmon Event ID nào ghi lại việc tạo tiến trình theo thời gian thực.",
    d3_1: "Đã bắt được dấu vết bằng Sysmon, giờ chuyển sang phòng Rule Engine để phát hiện phần mềm độc hại. Tại đây bạn sẽ học viết quy tắc YARA.",
    d3_2: "YARA ạ? Đó là công cụ phát hiện các chuỗi ký tự và mẫu HEX ẩn trong mã nhị phân phần mềm độc hại!",
    d3_3: "Chính xác. Quy tắc YARA gồm ba khối: meta, strings và condition. Thu thập manh mối quan trọng từ phòng Rule Engine!",
    d4_1: "Đã nắm được cấu trúc quy tắc YARA! Định nghĩa chuỗi đặc trưng của phần mềm độc hại trong phần strings và đặt điều kiện phát hiện trong condition.",
    d4_2: "Tốt. Vậy hãy nêu chính xác tên của rule engine phát hiện mẫu nhị phân trong phần mềm độc hại.",
    d5_1: "Nếu YARA phát hiện ở cấp tệp thì SIEM phát hiện ở cấp nhật ký. Nó tổng hợp nhật ký từ hàng nghìn thiết bị và thực hiện phân tích tương quan.",
    d5_2: "Nhưng mỗi sản phẩm SIEM có cú pháp truy vấn khác nhau. Splunk dùng SPL, Elastic dùng KQL... Không có quy tắc phát hiện thống nhất sao?",
    d5_3: "Đó chính là vai trò của Sigma! Viết một lần bằng YAML trung lập nhà cung cấp, có thể chuyển đổi cho bất kỳ SIEM nào. Thu thập manh mối từ phòng phân tích!",
    d6_1: "Bằng cách định nghĩa 'mối quan hệ tiến trình cha-con đáng ngờ' với quy tắc Sigma, cùng một phát hiện hoạt động trên cả Splunk và Elastic!",
    d6_2: "Chính xác. Vậy hãy cho biết tên của định dạng quy tắc phát hiện trung lập nhà cung cấp được sử dụng trong hệ thống SIEM.",
    d7_1: "Đã có quy tắc phát hiện, giờ là lúc truy vết nguồn gốc tấn công. Spearphishing bắt đầu từ email nên chúng ta cần phân tích tiêu đề email.",
    d7_2: "Tiêu đề email chứa đường đi qua các máy chủ ngoài thông tin người gửi và người nhận, đúng không?",
    d7_3: "Đúng vậy. Đặc biệt đọc tiêu đề Received từ dưới lên trên sẽ xác định được máy chủ gửi ban đầu. Cũng cần kiểm tra kết quả SPF, DKIM trong X-header. Thu thập manh mối từ phòng Forensic!",
    d8_1: "Đã truy vết ngược chuỗi Received và xác định IP máy chủ gửi! SPF fail, DKIM none — chắc chắn đây là spearphishing với tên miền người gửi giả mạo.",
    d8_2: "Tuyệt vời. Vậy hãy cho biết chính xác tên trường tiêu đề cho phép truy vết đường đi qua máy chủ của email.",
    d9_1: "Đây là giai đoạn cuối. Đã hoàn thành phát hiện và phân tích, chúng ta cần triển khai chính sách phòng thủ cho toàn bộ tổ chức. Học về GPO, ASR và mô hình phòng thủ 3 trục.",
    d9_2: "GPO triển khai chính sách nhóm trên toàn tổ chức và ASR giảm bề mặt tấn công bằng cách chặn thực thi macro Office, đúng không?",
    d9_3: "Đúng vậy. Và mô hình phòng thủ 3 trục — Công nghệ (Technology), Quy trình (Process), Con người (People) — cả ba trục phải cân bằng mới tạo nên phòng thủ thực sự. Thu thập các manh mối còn lại từ phòng triển khai chính sách!",
    d10_1: "Đã triển khai chính sách chặn macro trên toàn tổ chức qua GPO và chặn tạo tiến trình con đáng ngờ bằng quy tắc ASR!",
    d10_2: "Tốt. Vậy hãy cho biết chính xác tên chính sách bảo mật Windows chặn thực thi macro Office.",
    d11_1: "Hoàn thành khám phá tất cả các khu vực và triển khai chính sách! Đã học có hệ thống từ giám sát Sysmon, phát hiện YARA/Sigma, pháp y email đến chính sách GPO/ASR.",
    d11_2: "Cảm ơn sự nỗ lực, {AGENT}. Bạn đã hoàn thành xuất sắc khóa trung cấp. Nội dung hôm nay đã được ghi vào sổ tay vụ án cuối cùng — hãy ôn tập kỹ.",
    h1: "Nhấp vào Sysmon Event Monitor (Activity), Process Tree (GitBranch), <br>và Event Log file (FileText).",
    h2: "Nhấp vào YARA Rule Editor (Code), HEX Pattern Viewer (Binary), <br>và String Matching Scanner (Search).",
    h3: "Nhấp vào Sigma Rule Editor (Shield), SIEM Alert Panel (AlertTriangle), <br>và Correlation Link (Link).",
    h4: "Nhấp vào Email Header Analyzer (Mail), Received Chain Tracker (Route), <br>và X-Header Verification Viewer (Eye).",
    h5: "Nhấp vào GPO Policy Editor (Settings), ASR Rule Panel (ShieldCheck), <br>và 3-Axis Defense Model Diagram (Target).",
    c_sysmon_t: "Sự kiện Sysmon", c_sysmon_m: "Sysmon (System Monitor) là công cụ giám sát nâng cao trên Windows ghi lại chi tiết việc tạo tiến trình (ID 1), kết nối mạng (ID 3), tạo tệp (ID 11) và nhiều hơn nữa.",
    c_proc_t: "Cây tiến trình", c_proc_m: "Trực quan hóa mối quan hệ tiến trình cha-con dạng cây. Kỹ thuật cốt lõi để phát hiện chuỗi đáng ngờ như WINWORD.EXE → cmd.exe → powershell.exe.",
    c_event_t: "Nhật ký sự kiện", c_event_m: "Nhật ký có cấu trúc được ghi trong Windows Event Viewer. Các sự kiện liên quan đến bảo mật được lọc từ kênh Sysmon (Microsoft-Windows-Sysmon/Operational).",
    c_yara_t: "Quy tắc YARA", c_yara_m: "Rule engine định nghĩa các mẫu đặc trưng của phần mềm độc hại. Gồm ba khối — meta (thông tin meta), strings (chuỗi phát hiện), condition (điều kiện) — dùng để quét tệp.",
    c_hex_t: "Mẫu HEX", c_hex_m: "Chuỗi byte thập lục phân bên trong tệp nhị phân. Mẫu HEX như { 4D 5A 90 00 } được định nghĩa trong phần strings của YARA để phát hiện PE header và nhiều hơn.",
    c_string_t: "Khớp chuỗi", c_string_m: "Định nghĩa các chuỗi đặc trưng của phần mềm độc hại (C2 domain, registry key, tên API call) trong YARA strings để phát hiện nhanh mà không cần phân tích tĩnh.",
    c_sigma_t: "Quy tắc Sigma", c_sigma_m: "Quy tắc phát hiện YAML trung lập nhà cung cấp. Viết một lần, chuyển đổi tự động sang Splunk SPL, Elastic KQL, Microsoft KQL bằng sigmac compiler.",
    c_siem_t: "Cảnh báo SIEM", c_siem_m: "Cảnh báo bảo mật do SIEM tạo ra thông qua phân tích tương quan. Phân tích mối liên hệ giữa nhiều sự kiện, không chỉ sự kiện đơn lẻ.",
    c_corr_t: "Phân tích tương quan", c_corr_m: "Chức năng cốt lõi của SIEM kết nối các sự kiện từ nhiều nguồn nhật ký (Sysmon, tường lửa, IDS) theo thứ tự thời gian để tái tạo chuỗi tấn công.",
    c_email_t: "Tiêu đề email", c_email_m: "Siêu dữ liệu email. Chứa Received, Message-ID, X-Mailer và thông tin xác thực ngoài các trường From, To, Subject tiêu chuẩn.",
    c_recv_t: "Chuỗi Received", c_recv_m: "Đường đi qua các máy chủ thư (MTA) mà email đã đi qua. Đọc từ dưới lên trên: máy chủ gốc → máy chủ trung chuyển → máy chủ nhận cuối cùng.",
    c_xhdr_t: "Phân tích X-Header", c_xhdr_m: "Tiêu đề mở rộng như X-Spam-Status, Authentication-Results. Dùng để xác minh SPF pass/fail, xác thực chữ ký DKIM, và áp dụng chính sách DMARC.",
    c_gpo_t: "Chính sách GPO", c_gpo_m: "Group Policy Object — Công cụ quản lý Windows triển khai chính sách bảo mật cho tất cả máy tính trong domain qua Active Directory.",
    c_asr_t: "Quy tắc ASR", c_asr_m: "Attack Surface Reduction — Quy tắc giảm bề mặt tấn công của Microsoft Defender chặn tạo tiến trình con từ macro Office, thực thi script bị làm rối và nhiều hơn.",
    c_def_t: "Phòng thủ 3 trục", c_def_m: "Khung bảo mật cho rằng Công nghệ (Technology), Quy trình (Process) và Con người (People) — cả ba trục phải cân bằng để phòng thủ hoàn chỉnh.",
    p1_title: "Theo dõi sự kiện Sysmon", p1_desc: "Sysmon Event ID nào ghi lại <b>việc tạo tiến trình</b> theo thời gian thực?",
    p1_opts: ["Event ID 1", "Event ID 3", "Event ID 7", "Event ID 11"],
    p2_title: "Engine phát hiện nhị phân", p2_desc: "Rule engine nào phát hiện <b>mẫu nhị phân trong phần mềm độc hại</b>?",
    p2_opts: ["Snort", "YARA", "Sigma", "Suricata"],
    p3_title: "Quy tắc phát hiện trung lập", p3_desc: "<b>Định dạng quy tắc phát hiện trung lập nhà cung cấp</b> được sử dụng trong hệ thống SIEM là gì?",
    p3_opts: ["YARA", "Snort", "Sigma", "KQL"],
    p4_title: "Truy vết đường đi email", p4_desc: "Trường tiêu đề nào cho phép <b>truy vết đường đi qua máy chủ</b> của email?",
    p4_opts: ["Received", "From", "Reply-To", "Return-Path"],
    p5_title: "Giảm bề mặt tấn công", p5_desc: "Chính sách bảo mật Windows nào <b>chặn thực thi macro Office</b>?",
    p5_opts: ["UAC", "ASR", "BitLocker", "AppLocker"],
    teamLeader: 'Đội trưởng', agent: 'Đặc vụ', secRate: 'Đã thu', certReport: 'Báo cáo hoàn thành',
    analysisReport: 'Báo cáo phân tích', freeMode: '(Chế độ khám phá tự do)',
    proceed: 'Tiếp tục', next: 'Tiếp', closeWindow: 'Đóng', saveData: 'Lưu dữ liệu',
    inventory: 'Dữ liệu thu thập (Inventory)', noClues: 'Chưa thu thập được manh mối nào.',
    prevTab: 'Trước', nextTab: 'Tiếp',
    rTab1: "1. Sysmon & Theo dõi tiến trình", rTab2: "2. Quy tắc phát hiện YARA", rTab3: "3. Sigma & SIEM",
    rTab4: "4. Pháp y email", rTab5: "5. Phòng thủ dựa trên chính sách", rTab6: "6. Hoàn thành huấn luyện",
    r1_h: "Sysmon & Theo dõi tiến trình",
    r1_ch1: "Ch 1. Vai trò từng Event ID của Sysmon",
    r1_ch1_l1: '<span class="text-white bg-white/10 px-1 rounded">Event ID 1</span> — Tạo tiến trình. Ghi lại chương trình nào được thực thi và tiến trình cha là gì.',
    r1_ch1_l2: '<span class="text-white bg-white/10 px-1 rounded">Event ID 3</span> — Kết nối mạng. Phát hiện nỗ lực giao tiếp với máy chủ C2.',
    r1_ch1_l3: '<span class="text-white bg-white/10 px-1 rounded">Event ID 11</span> — Tạo tệp. Theo dõi payload độc hại bị drop.',
    r1_ch2: "Ch 2. Phân tích cây tiến trình",
    r1_ch2_l1: 'Mối quan hệ cha-con bất thường như WINWORD.EXE → cmd.exe → powershell.exe là <span class="text-white bg-white/10 px-1 rounded">dấu hiệu điển hình của spearphishing</span>.',
    r1_ch2_l2: 'Tiến trình Office bình thường không tạo tiến trình con, vì vậy đây là tiêu chí phát hiện đáng tin cậy.',
    r2_h: "Quy tắc phát hiện YARA",
    r2_ch3: "Ch 3. Cấu trúc quy tắc YARA (meta/strings/condition)",
    r2_ch3_l1: '<span class="text-white bg-white/10 px-1 rounded">meta</span> — Định nghĩa thông tin meta như tác giả, mô tả, URL tham chiếu.',
    r2_ch3_l2: '<span class="text-white bg-white/10 px-1 rounded">strings</span> — Định nghĩa chuỗi phát hiện, mẫu HEX và biểu thức chính quy.',
    r2_ch3_l3: '<span class="text-white bg-white/10 px-1 rounded">condition</span> — Thiết lập số lượng mẫu cần khớp để phát hiện.',
    r2_ch4: "Ch 4. Khớp mẫu HEX",
    r2_ch4_l1: 'Định nghĩa mẫu HEX cho <span class="text-white bg-white/10 px-1 rounded">MZ header (4D 5A)</span> của tệp PE hoặc chuỗi byte đặc trưng của shellcode độc hại.',
    r2_ch4_l2: 'Cú pháp mẫu nâng cao như wildcard (??), jump ([2-4]) và alternative (A|B) có thể phát hiện cả biến thể.',
    r3_h: "Sigma & SIEM",
    r3_ch5: "Ch 5. Cú pháp quy tắc Sigma",
    r3_ch5_l1: 'Viết bằng <span class="text-white bg-white/10 px-1 rounded">định dạng YAML</span>, gồm các trường title, logsource, detection và condition.',
    r3_ch5_l2: 'Quy tắc có thể được <span class="text-white bg-white/10 px-1 rounded">chuyển đổi tự động</span> qua sigmac sang Splunk SPL, Elastic KQL, Microsoft Sentinel và nhiều hơn.',
    r3_ch6: "Ch 6. Phân tích tương quan SIEM",
    r3_ch6_l1: 'Kết nối <span class="text-white bg-white/10 px-1 rounded">nhiều nguồn nhật ký</span> (Sysmon + tường lửa + IDS) theo thứ tự thời gian, không chỉ sự kiện đơn lẻ.',
    r3_ch6_l2: 'Tái tạo chuỗi: nhận email → thực thi tệp đính kèm → kết nối C2 thành một chuỗi tấn công để phát hiện.',
    r4_h: "Pháp y email",
    r4_ch7: "Ch 7. Ý nghĩa từng trường tiêu đề",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">From / Reply-To</span> — Địa chỉ người gửi. Có thể bị giả mạo nên không được tin tưởng riêng lẻ.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">Message-ID / X-Mailer</span> — Mail client và mã định danh duy nhất. Phát hiện dấu vết công cụ gửi hàng loạt.',
    r4_ch7_l3: '<span class="text-white bg-white/10 px-1 rounded">Authentication-Results</span> — Tiêu đề quan trọng để xác minh kết quả SPF, DKIM và DMARC.',
    r4_ch8: "Ch 8. Truy vết ngược chuỗi Received",
    r4_ch8_l1: 'Đọc tiêu đề Received <span class="text-white bg-white/10 px-1 rounded">từ dưới lên trên</span> để biết máy chủ gửi gốc → máy chủ trung chuyển → máy chủ nhận.',
    r4_ch8_l2: 'Tra cứu IP máy chủ gửi qua WHOIS, VirusTotal để xác minh cơ sở hạ tầng độc hại.',
    r5_h: "Phòng thủ dựa trên chính sách",
    r5_ch9: "Ch 9. GPO & ASR",
    r5_ch9_l1: '<span class="text-white bg-white/10 px-1 rounded">GPO (Group Policy Object)</span> — Triển khai chính sách bảo mật toàn domain qua Active Directory.',
    r5_ch9_l2: '<span class="text-white bg-white/10 px-1 rounded">ASR (Attack Surface Reduction)</span> — Chặn tạo tiến trình con từ macro Office, thực thi script bị làm rối và nhiều hơn.',
    r5_ch10: "Ch 10. Mô hình phòng thủ 3 trục",
    r5_ch10_l1: "Công nghệ (Technology) — Công cụ phát hiện/chặn kỹ thuật: Sysmon, YARA, Sigma, ASR",
    r5_ch10_l2: "Quy trình (Process) — Quy trình ứng phó sự cố, quản lý bản vá, chính sách lưu giữ nhật ký",
    r5_ch10_l3: "Con người (People) — Đào tạo nhận thức bảo mật, mô phỏng phishing, nâng cao kỹ năng SOC analyst",
    r6_title: "Hoàn thành huấn luyện!",
    r6_desc: "Từ giám sát Sysmon đến quy tắc phát hiện YARA/Sigma,<br/>pháp y email và triển khai chính sách GPO/ASR —<br/>bạn đã hoàn thành khóa phòng thủ spearphishing trung cấp.",
    r6_grade: "Xếp hạng cuối cùng:",
    r6_labBtn: "Chuyển đến phòng thực hành",
    r6_freeHint: "(Đóng cửa sổ này để tự do khám phá lại từng khu vực)",
  },
  ar: {
    loc1: 'القطاع 1: غرفة مراقبة Sysmon', loc2: 'القطاع 2: مختبر محرك القواعد', loc3: 'القطاع 3: غرفة تحليل SIEM', loc4: 'القطاع 4: مختبر الطب الرقمي', loc5: 'القطاع 5: غرفة نشر السياسات',
    d1_1: "انتبه! العميل {AGENT}، اليوم ننتقل لمستوى أعلى. ستتعلم كيفية تتبع الآثار التي يتركها تنفيذ مرفق التصيد الموجه باستخدام Sysmon.",
    d1_2: "Sysmon؟ سمعت أنه أداة مراقبة أدق من سجلات أحداث Windows العادية!",
    d1_3: "صحيح. يسجل Sysmon إنشاء العمليات واتصالات الشبكة وتغييرات الملفات بالتفصيل. اجمع 3 أدلة أحداث رئيسية من غرفة المراقبة!",
    d2_1: "اكتمل الجمع! اكتشفت آثار الملف الضار وهو ينشئ cmd.exe كعملية فرعية باستخدام Sysmon Event ID 1.",
    d2_2: "ممتاز. الآن أخبرني بالضبط أي Sysmon Event ID يسجل إنشاء العمليات في الوقت الفعلي.",
    d3_1: "بعد التقاط الآثار بـ Sysmon، ننتقل إلى مختبر محرك القواعد لاكتشاف البرمجيات الخبيثة. ستتعلم كتابة قواعد YARA.",
    d3_2: "YARA؟ هي أداة لالتقاط السلاسل النصية الفريدة وأنماط HEX المخفية في ثنائيات البرمجيات الخبيثة!",
    d3_3: "بالضبط. تتكون قواعد YARA من ثلاث كتل: meta وstrings وcondition. اجمع الأدلة الرئيسية من مختبر محرك القواعد!",
    d4_1: "فهمت بنية قواعد YARA! يمكن تعريف السلاسل المميزة للبرمجيات الخبيثة في قسم strings وتحديد شروط الكشف في condition.",
    d4_2: "جيد. الآن أخبرني بالاسم الدقيق لمحرك القواعد الذي يكشف أنماط ثنائية في البرمجيات الخبيثة.",
    d5_1: "إذا كان YARA يكشف على مستوى الملف، فإن SIEM يكشف على مستوى السجل. يجمع السجلات من آلاف الأجهزة ويجري تحليل الارتباط.",
    d5_2: "لكن كل منتج SIEM له صيغة استعلام مختلفة. Splunk يستخدم SPL وElastic يستخدم KQL... ألا توجد قاعدة كشف موحدة؟",
    d5_3: "هذا بالضبط ما يفعله Sigma! يُكتب مرة واحدة بتنسيق YAML محايد ويمكن تحويله لأي SIEM. اجمع الأدلة من غرفة التحليل!",
    d6_1: "بتعريف 'علاقات العمليات الأب-الابن المشبوهة' بقواعد Sigma، يعمل نفس الكشف على كل من Splunk وElastic!",
    d6_2: "صحيح. الآن أخبرني باسم تنسيق قاعدة الكشف المحايدة المستخدم في أنظمة SIEM.",
    d7_1: "مع وجود قواعد الكشف، حان وقت تتبع أصل الهجوم. التصيد الموجه يبدأ بالبريد الإلكتروني لذا نحتاج لتحليل ترويسات البريد.",
    d7_2: "ترويسات البريد تحتوي مسار الخوادم التي مر بها البريد بالإضافة للمرسل والمستلم، صحيح؟",
    d7_3: "صحيح. قراءة ترويسات Received من أسفل لأعلى تحدد خادم الإرسال الأصلي. كذلك يجب التحقق من نتائج SPF وDKIM في X-headers. اجمع الأدلة من مختبر الطب الرقمي!",
    d8_1: "تتبعت سلسلة Received بشكل عكسي وحددت IP خادم الإرسال! SPF fail وDKIM none — هذا بالتأكيد تصيد موجه بنطاق مرسل مزيف.",
    d8_2: "ممتاز. الآن أخبرني بالاسم الدقيق لحقل الترويسة الذي يتيح تتبع مسار خوادم البريد الإلكتروني.",
    d9_1: "هذه المرحلة الأخيرة. بعد إتمام الكشف والتحليل، نحتاج لنشر سياسات الدفاع في المنظمة بأكملها. سنتعلم عن GPO وASR ونموذج الدفاع ثلاثي المحاور.",
    d9_2: "GPO ينشر سياسات المجموعة في المنظمة وASR يقلل سطح الهجوم بحظر تنفيذ ماكرو Office، صحيح؟",
    d9_3: "صحيح. ونموذج الدفاع ثلاثي المحاور — التقنية والعملية والأشخاص — يجب أن تكون المحاور الثلاثة متوازنة للدفاع الحقيقي. اجمع الأدلة المتبقية من غرفة نشر السياسات!",
    d10_1: "نشرت سياسات حظر الماكرو في المنظمة عبر GPO وحظرت إنشاء العمليات الفرعية المشبوهة بقواعد ASR!",
    d10_2: "جيد. الآن أخبرني بالاسم الدقيق لسياسة أمان Windows التي تحظر تنفيذ ماكرو Office.",
    d11_1: "اكتمل استكشاف جميع القطاعات ونشر السياسات! تعلمت بشكل منهجي مراقبة Sysmon وكشف YARA/Sigma والطب الرقمي للبريد وسياسات GPO/ASR.",
    d11_2: "أحسنت يا {AGENT}. أكملت الدورة المتوسطة بامتياز. وثقت دروس اليوم في دفتر القضايا النهائي — راجعه بعناية.",
    h1: "انقر على مراقب أحداث Sysmon (Activity)، شجرة العمليات (GitBranch)، <br>وملف سجل الأحداث (FileText).",
    h2: "انقر على محرر قواعد YARA (Code)، عارض أنماط HEX (Binary)، <br>وماسح مطابقة السلاسل (Search).",
    h3: "انقر على محرر قواعد Sigma (Shield)، لوحة تنبيهات SIEM (AlertTriangle)، <br>ورابط تحليل الارتباط (Link).",
    h4: "انقر على محلل ترويسات البريد (Mail)، متتبع سلسلة Received (Route)، <br>وعارض التحقق من X-Header (Eye).",
    h5: "انقر على محرر سياسات GPO (Settings)، لوحة قواعد ASR (ShieldCheck)، <br>ومخطط نموذج الدفاع ثلاثي المحاور (Target).",
    c_sysmon_t: "أحداث Sysmon", c_sysmon_m: "Sysmon (System Monitor) أداة مراقبة متقدمة لـ Windows تسجل بدقة إنشاء العمليات (ID 1) واتصالات الشبكة (ID 3) وإنشاء الملفات (ID 11) والمزيد.",
    c_proc_t: "شجرة العمليات", c_proc_m: "تصور علاقات العمليات الأب-الابن بشكل شجري. تقنية أساسية لكشف السلاسل المشبوهة مثل WINWORD.EXE → cmd.exe → powershell.exe.",
    c_event_t: "سجل الأحداث", c_event_m: "سجلات منظمة مسجلة في عارض أحداث Windows. يتم تصفية الأحداث الأمنية من قناة Sysmon (Microsoft-Windows-Sysmon/Operational).",
    c_yara_t: "قواعد YARA", c_yara_m: "محرك قواعد يحدد الأنماط الفريدة للبرمجيات الخبيثة. يتكون من ثلاث كتل — meta وstrings وcondition — ويُستخدم لفحص الملفات.",
    c_hex_t: "أنماط HEX", c_hex_m: "تسلسلات بايت سداسية عشرية داخل الملفات الثنائية. أنماط HEX مثل { 4D 5A 90 00 } تُعرّف في قسم strings لـ YARA لكشف PE header والمزيد.",
    c_string_t: "مطابقة السلاسل", c_string_m: "تعريف سلاسل مميزة للبرمجيات الخبيثة (نطاقات C2، مفاتيح السجل، أسماء استدعاءات API) في YARA strings للكشف السريع دون تحليل ثابت.",
    c_sigma_t: "قواعد Sigma", c_sigma_m: "قواعد كشف YAML محايدة. تُكتب مرة واحدة وتُحوّل تلقائياً إلى Splunk SPL وElastic KQL وMicrosoft KQL باستخدام مترجم sigmac.",
    c_siem_t: "تنبيهات SIEM", c_siem_m: "تنبيهات أمنية يولدها SIEM عبر تحليل الارتباط. يحلل العلاقات بين أحداث متعددة وليس أحداث فردية.",
    c_corr_t: "تحليل الارتباط", c_corr_m: "وظيفة SIEM الأساسية التي تربط أحداث من مصادر سجلات مختلفة (Sysmon، جدار الحماية، IDS) زمنياً لإعادة بناء سلاسل الهجوم.",
    c_email_t: "ترويسات البريد", c_email_m: "بيانات وصفية للبريد. تحتوي Received وMessage-ID وX-Mailer ومعلومات المصادقة بالإضافة للحقول القياسية From وTo وSubject.",
    c_recv_t: "سلسلة Received", c_recv_m: "مسار خوادم البريد (MTA) التي مر بها البريد. القراءة من أسفل لأعلى تكشف: خادم الأصل → خوادم الترحيل → خادم الاستلام النهائي.",
    c_xhdr_t: "تحليل X-Header", c_xhdr_m: "ترويسات ممتدة مثل X-Spam-Status وAuthentication-Results. تُستخدم للتحقق من SPF pass/fail والتحقق من توقيع DKIM وتطبيق سياسة DMARC.",
    c_gpo_t: "سياسة GPO", c_gpo_m: "Group Policy Object — أداة إدارة Windows لنشر سياسات الأمان لجميع الحواسيب في النطاق عبر Active Directory.",
    c_asr_t: "قواعد ASR", c_asr_m: "Attack Surface Reduction — قواعد تقليل سطح الهجوم في Microsoft Defender تحظر إنشاء عمليات فرعية من ماكرو Office وتنفيذ النصوص المبهمة والمزيد.",
    c_def_t: "دفاع ثلاثي المحاور", c_def_m: "إطار أمني يقول أن التقنية والعملية والأشخاص — يجب أن تكون المحاور الثلاثة متوازنة للدفاع الكامل.",
    p1_title: "تتبع أحداث Sysmon", p1_desc: "أي Sysmon Event ID يسجل <b>إنشاء العمليات</b> في الوقت الفعلي؟",
    p1_opts: ["Event ID 1", "Event ID 3", "Event ID 7", "Event ID 11"],
    p2_title: "محرك كشف ثنائي", p2_desc: "أي محرك قواعد يكشف <b>الأنماط الثنائية في البرمجيات الخبيثة</b>؟",
    p2_opts: ["Snort", "YARA", "Sigma", "Suricata"],
    p3_title: "قاعدة كشف محايدة", p3_desc: "ما هو <b>تنسيق قاعدة الكشف المحايدة</b> المستخدم في أنظمة SIEM؟",
    p3_opts: ["YARA", "Snort", "Sigma", "KQL"],
    p4_title: "تتبع مسار البريد", p4_desc: "أي حقل ترويسة يتيح <b>تتبع مسار خوادم</b> البريد الإلكتروني؟",
    p4_opts: ["Received", "From", "Reply-To", "Return-Path"],
    p5_title: "تقليل سطح الهجوم", p5_desc: "أي سياسة أمان Windows <b>تحظر تنفيذ ماكرو Office</b>؟",
    p5_opts: ["UAC", "ASR", "BitLocker", "AppLocker"],
    teamLeader: 'القائد', agent: 'العميل', secRate: 'المؤمّن', certReport: 'تقرير الإتمام',
    analysisReport: 'تقرير التحليل', freeMode: '(وضع الاستكشاف الحر)',
    proceed: 'متابعة', next: 'التالي', closeWindow: 'إغلاق', saveData: 'حفظ البيانات',
    inventory: 'البيانات المجمعة (Inventory)', noClues: 'لم يتم جمع أي أدلة بعد.',
    prevTab: 'السابق', nextTab: 'التالي',
    rTab1: "1. Sysmon وتتبع العمليات", rTab2: "2. قواعد كشف YARA", rTab3: "3. Sigma وSIEM",
    rTab4: "4. الطب الرقمي للبريد", rTab5: "5. الدفاع القائم على السياسات", rTab6: "6. إتمام التدريب",
    r1_h: "Sysmon وتتبع العمليات",
    r1_ch1: "الفصل 1. أدوار Event ID في Sysmon",
    r1_ch1_l1: '<span class="text-white bg-white/10 px-1 rounded">Event ID 1</span> — إنشاء العمليات. يسجل البرنامج الذي تم تنفيذه والعملية الأصلية.',
    r1_ch1_l2: '<span class="text-white bg-white/10 px-1 rounded">Event ID 3</span> — اتصال الشبكة. يكشف محاولات التواصل مع خوادم C2.',
    r1_ch1_l3: '<span class="text-white bg-white/10 px-1 rounded">Event ID 11</span> — إنشاء الملفات. يتتبع الحمولات الضارة المسقطة.',
    r1_ch2: "الفصل 2. تحليل شجرة العمليات",
    r1_ch2_l1: 'العلاقات غير الطبيعية مثل WINWORD.EXE → cmd.exe → powershell.exe هي <span class="text-white bg-white/10 px-1 rounded">آثار نموذجية للتصيد الموجه</span>.',
    r1_ch2_l2: 'عمليات Office العادية لا تنشئ عمليات فرعية، مما يجعل هذا معيار كشف موثوقاً.',
    r2_h: "قواعد كشف YARA",
    r2_ch3: "الفصل 3. بنية قاعدة YARA (meta/strings/condition)",
    r2_ch3_l1: '<span class="text-white bg-white/10 px-1 rounded">meta</span> — يحدد البيانات الوصفية مثل مؤلف القاعدة والوصف وعناوين URL المرجعية.',
    r2_ch3_l2: '<span class="text-white bg-white/10 px-1 rounded">strings</span> — يحدد سلاسل الكشف وأنماط HEX والتعبيرات العادية.',
    r2_ch3_l3: '<span class="text-white bg-white/10 px-1 rounded">condition</span> — يحدد عدد الأنماط التي يجب مطابقتها للكشف.',
    r2_ch4: "الفصل 4. مطابقة أنماط HEX",
    r2_ch4_l1: 'يحدد أنماط HEX لـ <span class="text-white bg-white/10 px-1 rounded">MZ header (4D 5A)</span> لملفات PE أو تسلسلات البايت الفريدة للشيل كود الضار.',
    r2_ch4_l2: 'صيغة الأنماط المتقدمة مثل أحرف البدل (??) والقفزات ([2-4]) والبدائل (A|B) يمكنها كشف المتغيرات.',
    r3_h: "Sigma وSIEM",
    r3_ch5: "الفصل 5. صيغة قاعدة Sigma",
    r3_ch5_l1: 'تُكتب بـ <span class="text-white bg-white/10 px-1 rounded">تنسيق YAML</span>، وتتكون من حقول title وlogsource وdetection وcondition.',
    r3_ch5_l2: 'يمكن <span class="text-white bg-white/10 px-1 rounded">تحويل القواعد تلقائياً</span> عبر sigmac إلى Splunk SPL وElastic KQL وMicrosoft Sentinel والمزيد.',
    r3_ch6: "الفصل 6. تحليل ارتباط SIEM",
    r3_ch6_l1: 'يربط <span class="text-white bg-white/10 px-1 rounded">مصادر سجلات متعددة</span> (Sysmon + جدار الحماية + IDS) زمنياً، وليس أحداثاً فردية فقط.',
    r3_ch6_l2: 'يعيد بناء استلام البريد → تنفيذ المرفق → محاولة اتصال C2 كسلسلة هجوم واحدة للكشف.',
    r4_h: "الطب الرقمي للبريد",
    r4_ch7: "الفصل 7. معاني حقول الترويسات",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">From / Reply-To</span> — عنوان المرسل. يمكن تزويره لذا لا يجب الوثوق به وحده.',
    r4_ch7_l2: '<span class="text-white bg-white/10 px-1 rounded">Message-ID / X-Mailer</span> — عميل البريد والمعرف الفريد. يكشف آثار أدوات الإرسال الجماعي.',
    r4_ch7_l3: '<span class="text-white bg-white/10 px-1 rounded">Authentication-Results</span> — الترويسة الرئيسية للتحقق من نتائج SPF وDKIM وDMARC.',
    r4_ch8: "الفصل 8. التتبع العكسي لسلسلة Received",
    r4_ch8_l1: 'قراءة ترويسات Received <span class="text-white bg-white/10 px-1 rounded">من أسفل لأعلى</span> تكشف مسار خادم الأصل → خوادم الترحيل → خادم الاستلام.',
    r4_ch8_l2: 'يتم الاستعلام عن IP خادم الإرسال عبر WHOIS وVirusTotal للتحقق من البنية التحتية الضارة.',
    r5_h: "الدفاع القائم على السياسات",
    r5_ch9: "الفصل 9. GPO وASR",
    r5_ch9_l1: '<span class="text-white bg-white/10 px-1 rounded">GPO (Group Policy Object)</span> — ينشر سياسات الأمان عبر النطاق بالكامل عبر Active Directory.',
    r5_ch9_l2: '<span class="text-white bg-white/10 px-1 rounded">ASR (Attack Surface Reduction)</span> — يحظر إنشاء العمليات الفرعية من ماكرو Office وتنفيذ النصوص المبهمة والمزيد.',
    r5_ch10: "الفصل 10. نموذج الدفاع ثلاثي المحاور",
    r5_ch10_l1: "التقنية — أدوات الكشف/الحظر التقنية: Sysmon وYARA وSigma وASR",
    r5_ch10_l2: "العملية — إجراءات الاستجابة للحوادث وإدارة التصحيحات وسياسات الاحتفاظ بالسجلات",
    r5_ch10_l3: "الأشخاص — تدريب الوعي الأمني ومحاكاة التصيد وتطوير مهارات محللي SOC",
    r6_title: "اكتمل التدريب!",
    r6_desc: "من مراقبة Sysmon إلى قواعد كشف YARA/Sigma،<br/>الطب الرقمي للبريد، ونشر سياسات GPO/ASR —<br/>أكملت دورة الدفاع المتوسطة ضد التصيد الموجه.",
    r6_grade: "التقييم النهائي:",
    r6_labBtn: "الانتقال إلى المختبر العملي",
    r6_freeHint: "(أغلق هذه النافذة لاستكشاف كل قطاع بحرية)",
  },
};

const getT = (lang) => T[lang] || T.ko;

// ──────────────────────────────────────────────────────────────────────────────
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Intermediate)
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
      { speaker: 'TEAM_LEADER', text: t.d9_1 },
      { speaker: 'AGENT_NAME', text: t.d9_2 },
      { speaker: 'TEAM_LEADER', text: t.d9_3 }
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
      { speaker: 'AGENT_NAME', text: t.d11_1 },
      { speaker: 'TEAM_LEADER', text: t.d11_2 }
    ],
    triggerBook: true
  }
];

const buildCLUES_DATA = (t) => ({
  scene_phase1: [
    { id: 'sysmon_evt',  icon: Activity,   title: t.c_sysmon_t,  msg: t.c_sysmon_m },
    { id: 'proc_tree',   icon: GitBranch,  title: t.c_proc_t,    msg: t.c_proc_m },
    { id: 'event_log',   icon: FileText,   title: t.c_event_t,   msg: t.c_event_m }
  ],
  scene_phase2: [
    { id: 'yara_rule',    icon: Code,    title: t.c_yara_t,    msg: t.c_yara_m },
    { id: 'hex_pattern',  icon: Binary,  title: t.c_hex_t,     msg: t.c_hex_m },
    { id: 'string_match', icon: Search,  title: t.c_string_t,  msg: t.c_string_m }
  ],
  scene_phase3: [
    { id: 'sigma_rule',   icon: Shield,         title: t.c_sigma_t,  msg: t.c_sigma_m },
    { id: 'siem_alert',   icon: AlertTriangle,  title: t.c_siem_t,   msg: t.c_siem_m },
    { id: 'correlation',  icon: Link,           title: t.c_corr_t,   msg: t.c_corr_m }
  ],
  scene_phase4: [
    { id: 'email_header',   icon: Mail,   title: t.c_email_t,   msg: t.c_email_m },
    { id: 'received_chain', icon: Route,  title: t.c_recv_t,    msg: t.c_recv_m },
    { id: 'x_header',       icon: Eye,    title: t.c_xhdr_t,    msg: t.c_xhdr_m }
  ],
  scene_phase5: [
    { id: 'gpo_policy',  icon: Settings,    title: t.c_gpo_t,   msg: t.c_gpo_m },
    { id: 'asr_rule',    icon: ShieldCheck,  title: t.c_asr_t,   msg: t.c_asr_m },
    { id: 'defense_axis', icon: Target,      title: t.c_def_t,   msg: t.c_def_m }
  ]
});

const buildPUZZLES = (t) => ({
  1: {
    title: t.p1_title,
    desc: t.p1_desc,
    options: t.p1_opts,
    answer: 0
  },
  2: {
    title: t.p2_title,
    desc: t.p2_desc,
    options: t.p2_opts,
    answer: 1
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
    answer: 0
  },
  5: {
    title: t.p5_title,
    desc: t.p5_desc,
    options: t.p5_opts,
    answer: 1
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
      {generateClueItem('sysmon_evt',  0, Activity,   "#00E5FF", t.c_sysmon_t)}
      {generateClueItem('proc_tree',   1, GitBranch,  "#10B981", t.c_proc_t)}
      {generateClueItem('event_log',   2, FileText,   "#DFB8B6", t.c_event_t)}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('yara_rule',    0, Code,    "#DFB8B6", t.c_yara_t)}
      {generateClueItem('hex_pattern',  1, Binary,  "#FF6B6B", t.c_hex_t)}
      {generateClueItem('string_match', 2, Search,  "#00E5FF", t.c_string_t)}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('sigma_rule',   0, Shield,         "#10B981", t.c_sigma_t)}
      {generateClueItem('siem_alert',   1, AlertTriangle,  "#FF6B6B", t.c_siem_t)}
      {generateClueItem('correlation',  2, Link,           "#DFB8B6", t.c_corr_t)}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('email_header',   0, Mail,   "#DFB8B6", t.c_email_t)}
      {generateClueItem('received_chain', 1, Route,  "#00E5FF", t.c_recv_t)}
      {generateClueItem('x_header',       2, Eye,    "#10B981", t.c_xhdr_t)}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('gpo_policy',   0, Settings,    "#00E5FF", t.c_gpo_t)}
      {generateClueItem('asr_rule',     1, ShieldCheck,  "#10B981", t.c_asr_t)}
      {generateClueItem('defense_axis', 2, Target,       "#DFB8B6", t.c_def_t)}
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
                  {[
                    t.rTab1, t.rTab2, t.rTab3, t.rTab4, t.rTab5, t.rTab6
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
                          <h3 className="text-xl font-black text-[#DFB8B6] mb-4 border-b border-[#DFB8B6]/30 pb-3">{t.r1_h}</h3>
                          <div className="space-y-6 text-gray-300 leading-relaxed break-keep">
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r1_ch1}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch1_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch1_l2 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch1_l3 }} />
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r1_ch2}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch2_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch2_l2 }} />
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
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch3_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch3_l2 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch3_l3 }} />
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r2_ch4}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch4_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r2_ch4_l2 }} />
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
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r3_ch5_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r3_ch5_l2 }} />
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r3_ch6}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r3_ch6_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r3_ch6_l2 }} />
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
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch7_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch7_l2 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch7_l3 }} />
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r4_ch8}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch8_l1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch8_l2 }} />
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
                                <li dangerouslySetInnerHTML={{ __html: t.r5_ch9_l2 }} />
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r5_ch10}</strong>
                              <ol className="list-decimal pl-5 space-y-2 text-[#DFB8B6] font-bold">
                                <li>{t.r5_ch10_l1}</li>
                                <li>{t.r5_ch10_l2}</li>
                                <li>{t.r5_ch10_l3}</li>
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
                          <h1 className="text-2xl md:text-3xl text-[#DFB8B6] font-black mb-3 drop-shadow-[0_0_15px_rgba(223,184,182,0.4)]">{t.r6_title}</h1>
                          <p className="text-sm md:text-base text-gray-300 mb-4 leading-relaxed break-keep"
                            dangerouslySetInnerHTML={{ __html: t.r6_desc }}>
                          </p>
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

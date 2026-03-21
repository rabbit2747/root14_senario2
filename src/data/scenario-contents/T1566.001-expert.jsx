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
// [다국어 텍스트] — lang prop 기반 분기
// ──────────────────────────────────────────────────────────────────────────────
const T = {
  ko: {
    loc1: 'Sector 1: 퍼플팀 지휘실', loc2: 'Sector 2: CVE 분석실', loc3: 'Sector 3: 제로데이 연구소', loc4: 'Sector 4: CTI 센터', loc5: 'Sector 5: 전략 통합실',
    d1_1: "어험! {AGENT} 요원, 오늘의 임무는 최상위 수준이다. 퍼플팀 운영 체계를 점검하고 레드팀과 블루팀의 협업 구조를 분석해라.",
    d1_2: "네, 팀장님! 레드팀이 실제 공격자 TTP를 재현하고, 블루팀이 탐지·대응을 검증하는 구조가 보입니다.",
    d1_3: "좋다. 퍼플팀은 양측의 결과를 통합 분석하여 보안 갭을 메우지. 지휘실에서 핵심 단서 3개를 수집해라!",
    d2_1: "확인 완료! 레드팀의 공격 시뮬레이션 결과와 블루팀의 탐지 로그, 그리고 통합 분석 리포트를 모두 확보했습니다.",
    d2_2: "잘했다. 이 두 팀이 하나로 협력하여 보안을 강화하는 운영 모델의 명칭을 묻겠다.",
    d3_1: "이제 실제 스피어피싱 첨부파일에 악용된 CVE를 분석할 차례다. CVE-2021-40444는 Office 문서를 통해 MSHTML 엔진을 악용한 치명적 제로데이였지.",
    d3_2: "Word 문서를 열기만 해도 ActiveX 컨트롤을 통해 원격 코드가 실행되는 구조군요! CAB 파일로 페이로드를 전달하고 있습니다.",
    d3_3: "맞다. 이 공격 체인의 각 구성요소를 분석실에서 분리 추출해라. MSHTML 익스플로잇, ActiveX 컨트롤, CAB 페이로드를 모두 확보하라!",
    d4_1: "익스플로잇 체인 분석 완료! 문서 오픈 → MSHTML 렌더링 → ActiveX 로드 → CAB 다운로드 → DLL 실행의 전체 과정을 재구성했습니다.",
    d4_2: "훌륭하다. 이 공격에서 핵심적으로 악용된 Internet Explorer 엔진 컴포넌트의 정확한 명칭을 대답해라.",
    d5_1: "제로데이 연구소에 도착했다. 여기서는 CVE-2022-30190(Follina)과 CVE-2023-23397(Outlook 권한 상승)을 동시에 분석한다.",
    d5_2: "Follina는 ms-msdt: 프로토콜 핸들러를 악용해 MSDT를 트리거하고, Outlook CVE는 사용자 상호작용 없이 NTLM 해시를 탈취하는군요!",
    d5_3: "두 취약점 모두 스피어피싱 첨부파일의 무기로 사용되었다. 연구소에서 Follina MSDT, Outlook NTLM, 제로데이 체인 증거를 확보해라!",
    d6_1: "두 CVE 모두 분석 완료! Follina는 진단 도구를 악용하고, Outlook CVE는 미리보기만으로도 NTLM 릴레이가 가능한 심각한 취약점입니다.",
    d6_2: "정확하다. CVE-2022-30190, 일명 Follina가 악용하는 Windows 진단 도구의 약자를 묻겠다.",
    d7_1: "사이버 위협 인텔리전스(CTI) 센터다. 여기서 우리는 IOC(침해 지표)를 수집하고, TTP 기반으로 공격자 프로파일을 구축한다.",
    d7_2: "STIX/TAXII 프로토콜로 위협 피드를 자동 수신하고, MITRE ATT&CK 매트릭스에 매핑하여 공격 패턴을 분류하고 있군요!",
    d7_3: "좋다. CTI의 3대 핵심 자산을 확보해라 — 실시간 위협 피드, IOC 데이터베이스, 그리고 MITRE 매핑 체계를 수집하라!",
    d8_1: "CTI 자산 확보 완료! 위협 피드에서 최신 IOC를 추출하고, ATT&CK 매트릭스에 T1566.001 스피어피싱 TTP를 정밀 매핑했습니다.",
    d8_2: "완벽하다. 공격자의 행동 패턴을 전술·기법·절차로 분류하는 이 프레임워크의 정확한 명칭을 대답해라.",
    d9_1: "모든 분석이 완료되었습니다, {LEADER}! 이제 제로데이 대응 전략과 조직 보안 복원력을 통합해야 합니다.",
    d9_2: "맞다. 패치 관리 체계를 강화하고, 사고 대응 계획을 수립하며, 조직의 사이버 복원력을 확보하는 것이 최종 목표다!",
    d10_1: "조직의 사고 대응 절차를 사전 검증하기 위한 훈련 체계까지 수립 완료했습니다!",
    d10_2: "마지막 질문이다. 조직의 보안 사고 대응 능력을 실전 투입 전에 사전 검증하는 훈련의 명칭을 묻겠다.",
    d11_1: "전략 통합 완료! 퍼플팀 운영, CVE 분석, CTI 체계, 조직 복원력까지 모든 시스템이 정상 가동됩니다.",
    d11_2: "수고했다, {AGENT}. 오늘 학습한 내용들을 최종 사건 수첩에 도장 찍어 두었으니 꼼꼼히 복습하도록.",
    h1: "레드팀의 공격 무기(크로스헤어), 블루팀의 방패, <br>그리고 퍼플팀 통합 리포트를 찾아라.",
    h2: "MSHTML 엔진 취약점(버그), ActiveX 코드 컨트롤, <br>그리고 CAB 페이로드 패키지를 수집해라.",
    h3: "Follina의 MSDT 터미널, Outlook NTLM 키, <br>그리고 제로데이 공격 체인 링크를 수집해라.",
    h4: "실시간 위협 피드(RSS), IOC 데이터베이스, <br>그리고 MITRE ATT&CK 매핑 맵을 찾아라.",
    h5: "패치 관리 시스템(새로고침), 사고 대응 계획서(클립보드), <br>그리고 복원력 강화 방패를 가동해라!",
    // CLUES
    c_red_t: "레드팀 공격", c_red_m: "실제 공격자의 TTP(전술·기법·절차)를 모방하여 조직의 방어 체계를 실전적으로 테스트하는 공격 시뮬레이션 팀입니다.",
    c_blue_t: "블루팀 방어", c_blue_m: "레드팀의 공격을 실시간으로 탐지·분석·대응하며, SIEM/EDR 등 방어 도구를 운용하는 보안 운영 팀입니다.",
    c_purple_t: "퍼플팀 리포트", c_purple_m: "레드팀의 공격 결과와 블루팀의 탐지 결과를 통합 분석하여 보안 갭을 식별하고 개선 방안을 도출하는 협업 보고서입니다.",
    c_mshtml_t: "MSHTML 익스플로잇", c_mshtml_m: "CVE-2021-40444: Office 문서 내 OLE 객체가 MSHTML(Trident) 엔진을 호출하여 원격 HTML을 렌더링하고, ActiveX를 통해 임의 코드를 실행하는 취약점입니다.",
    c_activex_t: "ActiveX 컨트롤", c_activex_m: "MSHTML이 로드한 원격 HTML 페이지에서 ActiveX 컨트롤을 인스턴스화하여 로컬 파일 시스템에 접근하고 악성 DLL을 실행하는 공격 벡터입니다.",
    c_cab_t: "CAB 페이로드", c_cab_m: "공격자가 원격 서버에 호스팅한 CAB(Cabinet) 아카이브로, 내부에 악성 DLL을 포함하여 ActiveX를 통해 추출·실행되는 페이로드입니다.",
    c_follina_t: "Follina MSDT", c_follina_m: "CVE-2022-30190: Word 문서의 원격 템플릿이 ms-msdt: URI 스킴을 호출하여 Microsoft Support Diagnostic Tool(MSDT)을 트리거하고 PowerShell 코드를 실행하는 제로데이입니다.",
    c_outlook_t: "Outlook NTLM", c_outlook_m: "CVE-2023-23397: 특수 조작된 캘린더 초대 메일이 Outlook에서 자동 처리될 때 공격자의 SMB 서버로 NTLM 인증 해시가 유출되는 권한 상승 취약점입니다.",
    c_zeroday_t: "제로데이 체인", c_zeroday_m: "여러 제로데이 취약점을 연쇄적으로 결합(chain)하여 단일 취약점으로는 불가능한 완전한 시스템 장악을 달성하는 고급 공격 기법입니다.",
    c_feed_t: "위협 피드", c_feed_m: "STIX/TAXII 프로토콜을 통해 전 세계 보안 커뮤니티와 실시간으로 공유되는 최신 위협 정보 스트림으로, IOC·악성 IP·해시값을 자동 수집합니다.",
    c_ioc_t: "IOC 데이터베이스", c_ioc_m: "침해 지표(Indicators of Compromise) — 악성 파일 해시, C2 도메인, IP 주소, 레지스트리 키 등을 체계적으로 저장·조회하는 위협 인텔리전스 DB입니다.",
    c_mitre_t: "MITRE 매핑", c_mitre_m: "수집된 IOC와 공격 행위를 MITRE ATT&CK 매트릭스의 전술(Tactic)·기법(Technique)·절차(Procedure)에 정밀 매핑하여 공격자 프로파일을 구축합니다.",
    c_patch_t: "패치 관리", c_patch_m: "제로데이 공개 후 벤더 패치 배포까지의 취약 기간(window of exposure)을 최소화하기 위한 자동화된 패치 관리 및 가상 패칭 체계입니다.",
    c_incident_t: "대응 계획", c_incident_m: "NIST SP 800-61 기반 사고 대응 계획서로, 탐지·분석·격리·복구·사후 분석의 5단계 절차와 RACI 매트릭스를 정의합니다.",
    c_resilience_t: "복원력 강화", c_resilience_m: "사이버 공격 후에도 핵심 업무를 지속할 수 있는 조직의 복원력(Cyber Resilience)으로, BCP/DRP와 테이블탑 연습을 포함합니다.",
    // PUZZLES
    p1_title: "협업 운영 모델", p1_desc: '공격팀(Red)과 방어팀(Blue)이 협력하여 보안을 강화하는 <b>통합 팀 운영 모델</b>은?', p1_opts: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    p2_title: "MSHTML 취약점", p2_desc: 'CVE-2021-40444에서 악용된 <b>Internet Explorer 엔진 컴포넌트</b>는?', p2_opts: ["MSHTML", "VBScript", "JScript", "Chakra"],
    p3_title: "Follina 진단 도구", p3_desc: 'CVE-2022-30190(Follina)이 악용하는 <b>Windows 진단 도구</b>는?', p3_opts: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    p4_title: "위협 분류 프레임워크", p4_desc: '위협 인텔리전스에서 공격자의 행동 패턴을 <b>전술·기법·절차(TTP)로 분류하는 프레임워크</b>는?', p4_opts: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    p5_title: "사고 대응 사전 검증", p5_desc: '조직의 보안 사고 대응 능력을 <b>실전 투입 전에 사전 검증하는 훈련</b>은?', p5_opts: ["모의해킹", "테이블탑 연습", "보안 감사", "컴플라이언스 검토"],
    // UI
    teamLeader: '팀장', agent: '요원', secRate: '확보율', certReport: '수료 보고서',
    analysisReport: '분석 리포트', freeMode: '(자유 탐색 모드)',
    proceed: '진행', next: '다음', closeWindow: '창 닫기', saveData: '데이터 저장하기',
    inventory: '수집 데이터 (Inventory)', noClues: '아직 수집된 단서가 없습니다.',
    prevTab: '◀ 이전', nextTab: '다음 ▶',
    // Report tabs
    rTab1: "1. Purple Team 운영", rTab2: "2. CVE-2021-40444", rTab3: "3. Follina와 Outlook",
    rTab4: "4. 사이버 위협 인텔리전스", rTab5: "5. 전략적 보안 통합", rTab6: "6. 최종 훈련 수료",
    // Report body
    r1_h: "Purple Team 운영",
    r1_ch1: "Ch 1. Red/Blue 팀 역할 분담",
    r1_ch1_p: '<span class="text-white bg-white/10 px-1 rounded">레드팀</span>은 실제 APT 그룹의 TTP를 재현하여 조직의 방어 체계를 공격하고, <span class="text-white bg-white/10 px-1 rounded">블루팀</span>은 SIEM·EDR·NDR을 활용해 실시간 탐지와 대응을 수행합니다.',
    r1_ch2: "Ch 2. 퍼플팀 협업 보고서",
    r1_ch2_l1: '퍼플팀은 레드팀의 공격 성공/실패 결과와 블루팀의 탐지율을 <span class="text-white bg-white/10 px-1 rounded">통합 분석</span>합니다.',
    r1_ch2_l2: '보안 갭(Detection Gap)을 식별하고 MITRE ATT&CK 커버리지를 정량화하여 개선 로드맵을 수립합니다.',
    r2_h: "CVE-2021-40444 분석",
    r2_ch3: "Ch 3. MSHTML 취약점 메커니즘",
    r2_ch3_p: 'Office 문서 내 OLE 객체가 <span class="text-white bg-white/10 px-1 rounded">MSHTML(Trident) 엔진</span>을 호출하여 원격 HTML을 렌더링하고, ActiveX 컨트롤을 통해 로컬 시스템에서 임의 코드를 실행합니다.',
    r2_ch4: "Ch 4. ActiveX 악용 체인",
    r2_ch4_l1: "악성 .docx 문서 오픈 (스피어피싱 첨부)", r2_ch4_l2: "MSHTML 엔진이 원격 HTML 로드", r2_ch4_l3: "ActiveX 컨트롤이 CAB 아카이브 다운로드", r2_ch4_l4: "CAB 내 악성 DLL 추출 및 실행",
    r3_h: "Follina와 Outlook CVE",
    r3_ch5: "Ch 5. CVE-2022-30190 MSDT 악용",
    r3_ch5_p: 'Word 문서의 원격 템플릿이 <span class="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URI 스킴을 호출하여 Microsoft Support Diagnostic Tool을 트리거하고, PowerShell 코드를 실행하는 제로데이 공격입니다.',
    r3_ch6: "Ch 6. CVE-2023-23397 NTLM 릴레이",
    r3_ch6_l1: '특수 조작된 캘린더 초대 메일이 Outlook에서 <span class="text-white bg-white/10 px-1 rounded">사용자 상호작용 없이</span> 자동 처리됩니다.',
    r3_ch6_l2: '공격자의 SMB 서버로 NTLM 인증 해시가 유출되어 권한 상승 및 횡적 이동이 가능해집니다.',
    r4_h: "사이버 위협 인텔리전스",
    r4_ch7: "Ch 7. IOC 수집과 공유",
    r4_ch7_p: '<span class="text-white bg-white/10 px-1 rounded">STIX/TAXII</span> 프로토콜을 통해 악성 해시·C2 도메인·IP 등 침해 지표(IOC)를 자동 수집하고 보안 커뮤니티와 실시간으로 공유합니다.',
    r4_ch8: "Ch 8. TTP 기반 공격자 프로파일링",
    r4_ch8_l1: '수집된 IOC를 <span class="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span> 매트릭스에 매핑하여 공격자의 전술·기법·절차를 분류합니다.',
    r4_ch8_l2: 'Diamond Model과 Kill Chain 분석을 결합하여 APT 그룹의 행동 프로파일을 구축합니다.',
    r5_h: "전략적 보안 통합",
    r5_ch9: "Ch 9. 제로데이 대응 전략",
    r5_ch9_p: '벤더 패치 배포 전 <span class="text-white bg-white/10 px-1 rounded">가상 패칭(Virtual Patching)</span>과 마이크로세그멘테이션을 적용하여 취약 기간(Window of Exposure)을 최소화합니다.',
    r5_ch10: "Ch 10. 조직 사이버 복원력",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">테이블탑 연습</span>을 통해 사고 대응 절차를 사전 검증하고 RACI 매트릭스를 점검합니다.',
    r5_ch10_l2: 'BCP/DRP 체계를 수립하여 사이버 공격 후에도 핵심 업무 연속성을 보장합니다.',
    r6_complete: "훈련 수료 완료!",
    r6_desc: "퍼플팀 운영부터 CVE 분석, CTI 체계,<br/>조직 복원력까지 Expert 과정을<br/>모두 훌륭히 마쳤습니다.",
    r6_grade: "최종 등급:", r6_labBtn: "실습 랩으로 이동하기 🚀",
    r6_freeHint: "(창을 닫으면 각 구역을 자유롭게 재탐색할 수 있습니다)",
  },
  en: {
    loc1: 'Sector 1: Purple Team HQ', loc2: 'Sector 2: CVE Analysis Lab', loc3: 'Sector 3: Zero-Day Research Lab', loc4: 'Sector 4: CTI Center', loc5: 'Sector 5: Strategic Integration Room',
    d1_1: "Attention! Agent {AGENT}, today's mission is top-level. Inspect the Purple Team operational framework and analyze the Red/Blue team collaboration structure.",
    d1_2: "Yes, Leader! I can see the Red Team replicating real attacker TTPs while the Blue Team validates detection and response.",
    d1_3: "Good. The Purple Team integrates results from both sides to close security gaps. Collect 3 key clues from the command room!",
    d2_1: "Confirmed! I've secured the Red Team's attack simulation results, Blue Team detection logs, and the integrated analysis report.",
    d2_2: "Well done. Name the operational model where these two teams collaborate to strengthen security.",
    d3_1: "Now we analyze CVEs exploited in spearphishing attachments. CVE-2021-40444 was a critical zero-day that abused the MSHTML engine via Office documents.",
    d3_2: "Just opening a Word document triggers remote code execution through ActiveX controls! CAB files deliver the payload.",
    d3_3: "Correct. Extract each component of this attack chain from the lab. Secure the MSHTML exploit, ActiveX control, and CAB payload!",
    d4_1: "Exploit chain analysis complete! I've reconstructed the full process: document open → MSHTML rendering → ActiveX load → CAB download → DLL execution.",
    d4_2: "Excellent. Name the Internet Explorer engine component that was critically exploited in this attack.",
    d5_1: "Welcome to the zero-day research lab. Here we analyze CVE-2022-30190 (Follina) and CVE-2023-23397 (Outlook privilege escalation) simultaneously.",
    d5_2: "Follina abuses the ms-msdt: protocol handler to trigger MSDT, and the Outlook CVE steals NTLM hashes without user interaction!",
    d5_3: "Both vulnerabilities were weaponized as spearphishing attachments. Secure evidence of Follina MSDT, Outlook NTLM, and zero-day chains from the lab!",
    d6_1: "Both CVEs analyzed! Follina exploits diagnostic tools, and the Outlook CVE enables NTLM relay even from preview — a critical vulnerability.",
    d6_2: "Correct. Name the Windows diagnostic tool abbreviation that CVE-2022-30190, aka Follina, exploits.",
    d7_1: "This is the Cyber Threat Intelligence (CTI) center. Here we collect IOCs (Indicators of Compromise) and build attacker profiles based on TTPs.",
    d7_2: "STIX/TAXII protocols automatically receive threat feeds and map attack patterns to the MITRE ATT&CK matrix!",
    d7_3: "Good. Secure CTI's three core assets — real-time threat feeds, IOC database, and MITRE mapping framework!",
    d8_1: "CTI assets secured! I've extracted the latest IOCs from threat feeds and precisely mapped T1566.001 spearphishing TTPs to the ATT&CK matrix.",
    d8_2: "Perfect. Name the framework that classifies attacker behavior patterns into Tactics, Techniques, and Procedures.",
    d9_1: "All analysis complete, {LEADER}! Now we must integrate zero-day response strategies with organizational cyber resilience.",
    d9_2: "Right. Strengthening patch management, establishing incident response plans, and ensuring organizational cyber resilience is the ultimate goal!",
    d10_1: "Training system for pre-validating the organization's incident response procedures has been established!",
    d10_2: "Final question. Name the exercise that pre-validates an organization's security incident response capability before real deployment.",
    d11_1: "Strategic integration complete! Purple Team operations, CVE analysis, CTI framework, organizational resilience — all systems operational.",
    d11_2: "Well done, {AGENT}. Today's learnings have been stamped in the final case book. Review them thoroughly.",
    h1: "Find the Red Team's attack weapon (crosshair), Blue Team's shield, <br>and the Purple Team's integrated report.",
    h2: "Collect the MSHTML engine vulnerability (bug), ActiveX code control, <br>and CAB payload package.",
    h3: "Collect Follina's MSDT terminal, Outlook NTLM key, <br>and zero-day attack chain link.",
    h4: "Find the real-time threat feed (RSS), IOC database, <br>and MITRE ATT&CK mapping.",
    h5: "Activate the patch management system (refresh), incident response plan (clipboard), <br>and resilience shield!",
    c_red_t: "Red Team Attack", c_red_m: "An offensive simulation team that mimics real attacker TTPs (Tactics, Techniques, Procedures) to practically test an organization's defense systems.",
    c_blue_t: "Blue Team Defense", c_blue_m: "A security operations team that detects, analyzes, and responds to Red Team attacks in real-time using SIEM/EDR and other defensive tools.",
    c_purple_t: "Purple Team Report", c_purple_m: "A collaborative report that integrates Red Team attack results with Blue Team detection results to identify security gaps and develop improvement plans.",
    c_mshtml_t: "MSHTML Exploit", c_mshtml_m: "CVE-2021-40444: An OLE object in Office documents invokes the MSHTML (Trident) engine to render remote HTML and execute arbitrary code via ActiveX.",
    c_activex_t: "ActiveX Control", c_activex_m: "ActiveX controls instantiated from remote HTML pages loaded by MSHTML access the local file system and execute malicious DLLs.",
    c_cab_t: "CAB Payload", c_cab_m: "A CAB (Cabinet) archive hosted on the attacker's remote server containing malicious DLLs extracted and executed via ActiveX.",
    c_follina_t: "Follina MSDT", c_follina_m: "CVE-2022-30190: A remote template in Word documents invokes the ms-msdt: URI scheme to trigger MSDT and execute PowerShell code — a zero-day exploit.",
    c_outlook_t: "Outlook NTLM", c_outlook_m: "CVE-2023-23397: A specially crafted calendar invite email is automatically processed by Outlook, leaking NTLM authentication hashes to the attacker's SMB server.",
    c_zeroday_t: "Zero-Day Chain", c_zeroday_m: "An advanced attack technique that chains multiple zero-day vulnerabilities to achieve complete system compromise impossible with a single vulnerability.",
    c_feed_t: "Threat Feed", c_feed_m: "A real-time threat information stream shared globally via STIX/TAXII protocols, automatically collecting IOCs, malicious IPs, and hash values.",
    c_ioc_t: "IOC Database", c_ioc_m: "Indicators of Compromise — a threat intelligence DB that systematically stores and queries malicious file hashes, C2 domains, IP addresses, and registry keys.",
    c_mitre_t: "MITRE Mapping", c_mitre_m: "Precisely maps collected IOCs and attack behaviors to MITRE ATT&CK matrix Tactics, Techniques, and Procedures to build attacker profiles.",
    c_patch_t: "Patch Management", c_patch_m: "An automated patch management and virtual patching system to minimize the window of exposure between zero-day disclosure and vendor patch release.",
    c_incident_t: "Response Plan", c_incident_m: "An incident response plan based on NIST SP 800-61, defining 5-phase procedures (detection, analysis, containment, recovery, post-analysis) and RACI matrix.",
    c_resilience_t: "Resilience Enhancement", c_resilience_m: "Organizational Cyber Resilience to maintain critical operations even after cyberattacks, including BCP/DRP and tabletop exercises.",
    p1_title: "Collaborative Operations Model", p1_desc: 'What is the <b>integrated team operations model</b> where attack (Red) and defense (Blue) teams collaborate to strengthen security?', p1_opts: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    p2_title: "MSHTML Vulnerability", p2_desc: 'What is the <b>Internet Explorer engine component</b> exploited in CVE-2021-40444?', p2_opts: ["MSHTML", "VBScript", "JScript", "Chakra"],
    p3_title: "Follina Diagnostic Tool", p3_desc: 'What <b>Windows diagnostic tool</b> does CVE-2022-30190 (Follina) exploit?', p3_opts: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    p4_title: "Threat Classification Framework", p4_desc: 'What <b>framework classifies attacker behavior into Tactics, Techniques, and Procedures (TTP)</b> in threat intelligence?', p4_opts: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    p5_title: "Incident Response Pre-Validation", p5_desc: 'What <b>exercise pre-validates an organization\'s security incident response capability</b> before real deployment?', p5_opts: ["Penetration Testing", "Tabletop Exercise", "Security Audit", "Compliance Review"],
    teamLeader: 'Leader', agent: 'Agent', secRate: 'Secured', certReport: 'Completion Report',
    analysisReport: 'Analysis Report', freeMode: '(Free Exploration Mode)',
    proceed: 'Continue', next: 'Next', closeWindow: 'Close', saveData: 'Save Data',
    inventory: 'Collected Data (Inventory)', noClues: 'No clues collected yet.',
    prevTab: '◀ Prev', nextTab: 'Next ▶',
    rTab1: "1. Purple Team Ops", rTab2: "2. CVE-2021-40444", rTab3: "3. Follina & Outlook",
    rTab4: "4. Cyber Threat Intelligence", rTab5: "5. Strategic Security Integration", rTab6: "6. Training Complete",
    r1_h: "Purple Team Operations",
    r1_ch1: "Ch 1. Red/Blue Team Role Division",
    r1_ch1_p: 'The <span class="text-white bg-white/10 px-1 rounded">Red Team</span> replicates real APT group TTPs to attack organizational defenses, while the <span class="text-white bg-white/10 px-1 rounded">Blue Team</span> performs real-time detection and response using SIEM, EDR, and NDR.',
    r1_ch2: "Ch 2. Purple Team Collaboration Report",
    r1_ch2_l1: 'The Purple Team <span class="text-white bg-white/10 px-1 rounded">integrates analysis</span> of Red Team attack success/failure results and Blue Team detection rates.',
    r1_ch2_l2: 'Identifies detection gaps and quantifies MITRE ATT&CK coverage to establish an improvement roadmap.',
    r2_h: "CVE-2021-40444 Analysis",
    r2_ch3: "Ch 3. MSHTML Vulnerability Mechanism",
    r2_ch3_p: 'An OLE object in Office documents invokes the <span class="text-white bg-white/10 px-1 rounded">MSHTML (Trident) engine</span> to render remote HTML and execute arbitrary code on the local system via ActiveX controls.',
    r2_ch4: "Ch 4. ActiveX Exploitation Chain",
    r2_ch4_l1: "Open malicious .docx document (spearphishing attachment)", r2_ch4_l2: "MSHTML engine loads remote HTML", r2_ch4_l3: "ActiveX control downloads CAB archive", r2_ch4_l4: "Extract and execute malicious DLL from CAB",
    r3_h: "Follina & Outlook CVE",
    r3_ch5: "Ch 5. CVE-2022-30190 MSDT Exploitation",
    r3_ch5_p: 'A remote template in Word documents invokes the <span class="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URI scheme to trigger Microsoft Support Diagnostic Tool and execute PowerShell code — a zero-day attack.',
    r3_ch6: "Ch 6. CVE-2023-23397 NTLM Relay",
    r3_ch6_l1: 'A specially crafted calendar invite is <span class="text-white bg-white/10 px-1 rounded">automatically processed without user interaction</span> in Outlook.',
    r3_ch6_l2: 'NTLM authentication hashes are leaked to the attacker\'s SMB server, enabling privilege escalation and lateral movement.',
    r4_h: "Cyber Threat Intelligence",
    r4_ch7: "Ch 7. IOC Collection and Sharing",
    r4_ch7_p: 'Automatically collects IOCs (malicious hashes, C2 domains, IPs) via <span class="text-white bg-white/10 px-1 rounded">STIX/TAXII</span> protocols and shares them with the security community in real-time.',
    r4_ch8: "Ch 8. TTP-Based Attacker Profiling",
    r4_ch8_l1: 'Maps collected IOCs to the <span class="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span> matrix to classify attacker tactics, techniques, and procedures.',
    r4_ch8_l2: 'Combines Diamond Model and Kill Chain analysis to build APT group behavioral profiles.',
    r5_h: "Strategic Security Integration",
    r5_ch9: "Ch 9. Zero-Day Response Strategy",
    r5_ch9_p: 'Applies <span class="text-white bg-white/10 px-1 rounded">virtual patching</span> and microsegmentation before vendor patch release to minimize the Window of Exposure.',
    r5_ch10: "Ch 10. Organizational Cyber Resilience",
    r5_ch10_l1: 'Pre-validates incident response procedures through <span class="text-white bg-white/10 px-1 rounded">tabletop exercises</span> and reviews the RACI matrix.',
    r5_ch10_l2: 'Establishes BCP/DRP frameworks to ensure business continuity even after cyberattacks.',
    r6_complete: "Training Complete!",
    r6_desc: "From Purple Team operations to CVE analysis,<br/>CTI frameworks, and organizational resilience —<br/>you've excellently completed the Expert course.",
    r6_grade: "Final Grade:", r6_labBtn: "Go to Lab 🚀",
    r6_freeHint: "(Close this window to freely re-explore each sector)",
  },
  ja: {
    loc1: 'Sector 1: パープルチーム司令室', loc2: 'Sector 2: CVE分析室', loc3: 'Sector 3: ゼロデイ研究所', loc4: 'Sector 4: CTIセンター', loc5: 'Sector 5: 戦略統合室',
    d1_1: "おほん！{AGENT}エージェント、今日の任務は最高レベルだ。パープルチームの運営体制を点検し、レッド・ブルーチームの協業構造を分析せよ。",
    d1_2: "はい、チーム長！レッドチームが実際の攻撃者TTPを再現し、ブルーチームが検知・対応を検証する構造が見えます。",
    d1_3: "よし。パープルチームは両チームの結果を統合分析してセキュリティギャップを埋める。司令室で重要な手がかり3つを収集せよ！",
    d2_1: "確認完了！レッドチームの攻撃シミュレーション結果、ブルーチームの検知ログ、統合分析レポートをすべて確保しました。",
    d2_2: "よくやった。この二つのチームが協力してセキュリティを強化する運営モデルの名称を答えよ。",
    d3_1: "次はスピアフィッシング添付ファイルに悪用されたCVEを分析する番だ。CVE-2021-40444はOffice文書を通じてMSHTMLエンジンを悪用した致命的ゼロデイだった。",
    d3_2: "Word文書を開くだけでActiveXコントロールを通じてリモートコードが実行される構造ですね！CABファイルでペイロードを配信しています。",
    d3_3: "そうだ。この攻撃チェーンの各構成要素を分析室で分離抽出せよ。MSHTMLエクスプロイト、ActiveXコントロール、CABペイロードをすべて確保せよ！",
    d4_1: "エクスプロイトチェーン分析完了！文書オープン→MSHTMLレンダリング→ActiveXロード→CABダウンロード→DLL実行の全過程を再構成しました。",
    d4_2: "素晴らしい。この攻撃で中核的に悪用されたInternet Explorerエンジンコンポーネントの正確な名称を答えよ。",
    d5_1: "ゼロデイ研究所に到着した。ここではCVE-2022-30190（Follina）とCVE-2023-23397（Outlook権限昇格）を同時に分析する。",
    d5_2: "Follinaはms-msdt:プロトコルハンドラを悪用してMSDTをトリガーし、Outlook CVEはユーザー操作なしでNTLMハッシュを奪取するのですね！",
    d5_3: "両方の脆弱性がスピアフィッシング添付ファイルの武器として使用された。研究所でFollina MSDT、Outlook NTLM、ゼロデイチェーンの証拠を確保せよ！",
    d6_1: "両CVE分析完了！Follinaは診断ツールを悪用し、Outlook CVEはプレビューだけでNTLMリレーが可能な深刻な脆弱性です。",
    d6_2: "正確だ。CVE-2022-30190、通称Follinaが悪用するWindows診断ツールの略称を答えよ。",
    d7_1: "サイバー脅威インテリジェンス（CTI）センターだ。ここではIOC（侵害指標）を収集し、TTPベースで攻撃者プロファイルを構築する。",
    d7_2: "STIX/TAXIIプロトコルで脅威フィードを自動受信し、MITRE ATT&CKマトリックスにマッピングして攻撃パターンを分類していますね！",
    d7_3: "よし。CTIの3大コア資産を確保せよ — リアルタイム脅威フィード、IOCデータベース、MITREマッピング体系を収集せよ！",
    d8_1: "CTI資産確保完了！脅威フィードから最新IOCを抽出し、ATT&CKマトリックスにT1566.001スピアフィッシングTTPを精密マッピングしました。",
    d8_2: "完璧だ。攻撃者の行動パターンを戦術・技法・手順で分類するこのフレームワークの正確な名称を答えよ。",
    d9_1: "すべての分析が完了しました、{LEADER}！ゼロデイ対応戦略と組織のセキュリティレジリエンスを統合する必要があります。",
    d9_2: "その通り。パッチ管理体制を強化し、インシデント対応計画を策定し、組織のサイバーレジリエンスを確保することが最終目標だ！",
    d10_1: "組織のインシデント対応手順を事前検証するための訓練体制まで策定完了しました！",
    d10_2: "最後の質問だ。組織のセキュリティインシデント対応能力を実戦投入前に事前検証する訓練の名称を答えよ。",
    d11_1: "戦略統合完了！パープルチーム運営、CVE分析、CTI体系、組織レジリエンスまですべてのシステムが正常稼働しています。",
    d11_2: "ご苦労だった、{AGENT}。今日学んだ内容を最終ケースブックに記録したので、しっかり復習するように。",
    h1: "レッドチームの攻撃武器（クロスヘア）、ブルーチームの盾、<br>そしてパープルチーム統合レポートを見つけよ。",
    h2: "MSHTMLエンジン脆弱性（バグ）、ActiveXコードコントロール、<br>そしてCABペイロードパッケージを収集せよ。",
    h3: "FollinaのMSDTターミナル、Outlook NTLMキー、<br>そしてゼロデイ攻撃チェーンリンクを収集せよ。",
    h4: "リアルタイム脅威フィード（RSS）、IOCデータベース、<br>そしてMITRE ATT&CKマッピングを見つけよ。",
    h5: "パッチ管理システム（更新）、インシデント対応計画書（クリップボード）、<br>そしてレジリエンス強化シールドを起動せよ！",
    c_red_t: "レッドチーム攻撃", c_red_m: "実際の攻撃者のTTP（戦術・技法・手順）を模倣して組織の防御体制を実戦的にテストする攻撃シミュレーションチームです。",
    c_blue_t: "ブルーチーム防御", c_blue_m: "レッドチームの攻撃をリアルタイムで検知・分析・対応し、SIEM/EDR等の防御ツールを運用するセキュリティ運営チームです。",
    c_purple_t: "パープルチームレポート", c_purple_m: "レッドチームの攻撃結果とブルーチームの検知結果を統合分析してセキュリティギャップを特定し改善策を導出する協業レポートです。",
    c_mshtml_t: "MSHTMLエクスプロイト", c_mshtml_m: "CVE-2021-40444: Office文書内のOLEオブジェクトがMSHTML（Trident）エンジンを呼び出してリモートHTMLをレンダリングし、ActiveXを通じて任意のコードを実行する脆弱性です。",
    c_activex_t: "ActiveXコントロール", c_activex_m: "MSHTMLがロードしたリモートHTMLページからActiveXコントロールをインスタンス化してローカルファイルシステムにアクセスし悪性DLLを実行する攻撃ベクターです。",
    c_cab_t: "CABペイロード", c_cab_m: "攻撃者がリモートサーバーにホスティングしたCAB（Cabinet）アーカイブで、内部に悪性DLLを含みActiveXを通じて抽出・実行されるペイロードです。",
    c_follina_t: "Follina MSDT", c_follina_m: "CVE-2022-30190: Word文書のリモートテンプレートがms-msdt: URIスキームを呼び出してMSDTをトリガーしPowerShellコードを実行するゼロデイです。",
    c_outlook_t: "Outlook NTLM", c_outlook_m: "CVE-2023-23397: 特殊に細工されたカレンダー招待メールがOutlookで自動処理される際に攻撃者のSMBサーバーへNTLM認証ハッシュが漏洩する権限昇格脆弱性です。",
    c_zeroday_t: "ゼロデイチェーン", c_zeroday_m: "複数のゼロデイ脆弱性を連鎖的に結合して単一の脆弱性では不可能な完全なシステム掌握を達成する高度な攻撃技法です。",
    c_feed_t: "脅威フィード", c_feed_m: "STIX/TAXIIプロトコルを通じて世界中のセキュリティコミュニティとリアルタイムで共有される最新脅威情報ストリームで、IOC・悪性IP・ハッシュ値を自動収集します。",
    c_ioc_t: "IOCデータベース", c_ioc_m: "侵害指標（Indicators of Compromise）— 悪性ファイルハッシュ、C2ドメイン、IPアドレス、レジストリキー等を体系的に保存・照会する脅威インテリジェンスDBです。",
    c_mitre_t: "MITREマッピング", c_mitre_m: "収集したIOCと攻撃行為をMITRE ATT&CKマトリックスの戦術・技法・手順に精密マッピングして攻撃者プロファイルを構築します。",
    c_patch_t: "パッチ管理", c_patch_m: "ゼロデイ公開後ベンダーパッチ配布までの脆弱期間を最小化するための自動化されたパッチ管理および仮想パッチング体系です。",
    c_incident_t: "対応計画", c_incident_m: "NIST SP 800-61ベースのインシデント対応計画書で、検知・分析・封じ込め・復旧・事後分析の5段階手順とRACIマトリックスを定義します。",
    c_resilience_t: "レジリエンス強化", c_resilience_m: "サイバー攻撃後も中核業務を継続できる組織のレジリエンス（Cyber Resilience）で、BCP/DRPとテーブルトップ演習を含みます。",
    p1_title: "協業運営モデル", p1_desc: '攻撃チーム(Red)と防御チーム(Blue)が協力してセキュリティを強化する<b>統合チーム運営モデル</b>は？', p1_opts: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    p2_title: "MSHTML脆弱性", p2_desc: 'CVE-2021-40444で悪用された<b>Internet Explorerエンジンコンポーネント</b>は？', p2_opts: ["MSHTML", "VBScript", "JScript", "Chakra"],
    p3_title: "Follina診断ツール", p3_desc: 'CVE-2022-30190（Follina）が悪用する<b>Windows診断ツール</b>は？', p3_opts: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    p4_title: "脅威分類フレームワーク", p4_desc: '脅威インテリジェンスで攻撃者の行動パターンを<b>戦術・技法・手順（TTP）で分類するフレームワーク</b>は？', p4_opts: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    p5_title: "インシデント対応事前検証", p5_desc: '組織のセキュリティインシデント対応能力を<b>実戦投入前に事前検証する訓練</b>は？', p5_opts: ["ペネトレーションテスト", "テーブルトップ演習", "セキュリティ監査", "コンプライアンスレビュー"],
    teamLeader: 'チーム長', agent: 'エージェント', secRate: '確保率', certReport: '修了報告書',
    analysisReport: '分析レポート', freeMode: '（自由探索モード）',
    proceed: '進行', next: '次へ', closeWindow: '閉じる', saveData: 'データ保存',
    inventory: '収集データ (Inventory)', noClues: 'まだ収集された手がかりがありません。',
    prevTab: '◀ 前へ', nextTab: '次へ ▶',
    rTab1: "1. Purple Team運営", rTab2: "2. CVE-2021-40444", rTab3: "3. FollinaとOutlook",
    rTab4: "4. サイバー脅威インテリジェンス", rTab5: "5. 戦略的セキュリティ統合", rTab6: "6. 最終訓練修了",
    r1_h: "Purple Team運営", r1_ch1: "Ch 1. Red/Blueチーム役割分担",
    r1_ch1_p: '<span class="text-white bg-white/10 px-1 rounded">レッドチーム</span>は実際のAPTグループのTTPを再現して組織の防御体制を攻撃し、<span class="text-white bg-white/10 px-1 rounded">ブルーチーム</span>はSIEM・EDR・NDRを活用してリアルタイム検知と対応を行います。',
    r1_ch2: "Ch 2. パープルチーム協業レポート",
    r1_ch2_l1: 'パープルチームはレッドチームの攻撃成功/失敗結果とブルーチームの検知率を<span class="text-white bg-white/10 px-1 rounded">統合分析</span>します。',
    r1_ch2_l2: 'セキュリティギャップ（Detection Gap）を特定しMITRE ATT&CKカバレッジを定量化して改善ロードマップを策定します。',
    r2_h: "CVE-2021-40444分析", r2_ch3: "Ch 3. MSHTML脆弱性メカニズム",
    r2_ch3_p: 'Office文書内のOLEオブジェクトが<span class="text-white bg-white/10 px-1 rounded">MSHTML（Trident）エンジン</span>を呼び出してリモートHTMLをレンダリングし、ActiveXコントロールを通じてローカルシステムで任意コードを実行します。',
    r2_ch4: "Ch 4. ActiveX悪用チェーン",
    r2_ch4_l1: "悪性.docx文書オープン（スピアフィッシング添付）", r2_ch4_l2: "MSHTMLエンジンがリモートHTMLロード", r2_ch4_l3: "ActiveXコントロールがCABアーカイブダウンロード", r2_ch4_l4: "CAB内の悪性DLL抽出および実行",
    r3_h: "FollinaとOutlook CVE", r3_ch5: "Ch 5. CVE-2022-30190 MSDT悪用",
    r3_ch5_p: 'Word文書のリモートテンプレートが<span class="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URIスキームを呼び出してMicrosoft Support Diagnostic Toolをトリガーし、PowerShellコードを実行するゼロデイ攻撃です。',
    r3_ch6: "Ch 6. CVE-2023-23397 NTLMリレー",
    r3_ch6_l1: '特殊に細工されたカレンダー招待メールがOutlookで<span class="text-white bg-white/10 px-1 rounded">ユーザー操作なしで</span>自動処理されます。',
    r3_ch6_l2: '攻撃者のSMBサーバーへNTLM認証ハッシュが漏洩し、権限昇格と横移動が可能になります。',
    r4_h: "サイバー脅威インテリジェンス", r4_ch7: "Ch 7. IOC収集と共有",
    r4_ch7_p: '<span class="text-white bg-white/10 px-1 rounded">STIX/TAXII</span>プロトコルを通じて悪性ハッシュ・C2ドメイン・IP等の侵害指標（IOC）を自動収集しセキュリティコミュニティとリアルタイムで共有します。',
    r4_ch8: "Ch 8. TTFベース攻撃者プロファイリング",
    r4_ch8_l1: '収集したIOCを<span class="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span>マトリックスにマッピングして攻撃者の戦術・技法・手順を分類します。',
    r4_ch8_l2: 'Diamond ModelとKill Chain分析を組み合わせてAPTグループの行動プロファイルを構築します。',
    r5_h: "戦略的セキュリティ統合", r5_ch9: "Ch 9. ゼロデイ対応戦略",
    r5_ch9_p: 'ベンダーパッチ配布前に<span class="text-white bg-white/10 px-1 rounded">仮想パッチング（Virtual Patching）</span>とマイクロセグメンテーションを適用して脆弱期間を最小化します。',
    r5_ch10: "Ch 10. 組織サイバーレジリエンス",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">テーブルトップ演習</span>を通じてインシデント対応手順を事前検証しRACIマトリックスを点検します。',
    r5_ch10_l2: 'BCP/DRP体系を策定してサイバー攻撃後も中核業務の継続性を保証します。',
    r6_complete: "訓練修了完了！",
    r6_desc: "パープルチーム運営からCVE分析、CTI体系、<br/>組織レジリエンスまでExpertコースを<br/>すべて素晴らしく修了しました。",
    r6_grade: "最終等級:", r6_labBtn: "実習ラボへ移動 🚀",
    r6_freeHint: "（ウィンドウを閉じると各セクターを自由に再探索できます）",
  },
  vi: {
    loc1: 'Sector 1: Sở chỉ huy Purple Team', loc2: 'Sector 2: Phòng phân tích CVE', loc3: 'Sector 3: Phòng nghiên cứu Zero-Day', loc4: 'Sector 4: Trung tâm CTI', loc5: 'Sector 5: Phòng tích hợp chiến lược',
    d1_1: "Chú ý! Đặc vụ {AGENT}, nhiệm vụ hôm nay ở cấp cao nhất. Kiểm tra hệ thống vận hành Purple Team và phân tích cấu trúc hợp tác Red/Blue Team.",
    d1_2: "Vâng, Đội trưởng! Tôi thấy Red Team tái hiện TTP của kẻ tấn công thực, còn Blue Team xác minh khả năng phát hiện và ứng phó.",
    d1_3: "Tốt. Purple Team tích hợp phân tích kết quả từ cả hai bên để lấp các lỗ hổng bảo mật. Thu thập 3 manh mối chính từ phòng chỉ huy!",
    d2_1: "Xác nhận! Đã thu thập kết quả mô phỏng tấn công của Red Team, nhật ký phát hiện của Blue Team và báo cáo phân tích tích hợp.",
    d2_2: "Tốt lắm. Hãy nêu tên mô hình vận hành mà hai đội này hợp tác để tăng cường bảo mật.",
    d3_1: "Bây giờ phân tích CVE bị khai thác trong tệp đính kèm spearphishing. CVE-2021-40444 là zero-day nghiêm trọng lợi dụng MSHTML qua tài liệu Office.",
    d3_2: "Chỉ cần mở tài liệu Word là thực thi mã từ xa qua ActiveX! Tệp CAB chuyển payload.",
    d3_3: "Đúng. Tách từng thành phần của chuỗi tấn công này. Thu thập MSHTML exploit, ActiveX control và CAB payload!",
    d4_1: "Phân tích chuỗi khai thác hoàn tất! Mở tài liệu → MSHTML render → ActiveX load → CAB download → DLL execute.",
    d4_2: "Xuất sắc. Hãy nêu tên chính xác thành phần engine Internet Explorer bị khai thác.",
    d5_1: "Chào mừng đến phòng nghiên cứu zero-day. Ở đây phân tích đồng thời CVE-2022-30190 (Follina) và CVE-2023-23397 (Outlook leo thang đặc quyền).",
    d5_2: "Follina lợi dụng ms-msdt: để kích hoạt MSDT, và Outlook CVE đánh cắp NTLM hash mà không cần tương tác người dùng!",
    d5_3: "Cả hai lỗ hổng đều được vũ khí hóa qua tệp đính kèm spearphishing. Thu thập Follina MSDT, Outlook NTLM và zero-day chain!",
    d6_1: "Phân tích cả hai CVE hoàn tất! Follina khai thác công cụ chẩn đoán, Outlook CVE cho phép NTLM relay chỉ từ xem trước.",
    d6_2: "Chính xác. Hãy nêu viết tắt của công cụ chẩn đoán Windows mà Follina khai thác.",
    d7_1: "Đây là trung tâm Cyber Threat Intelligence (CTI). Ở đây thu thập IOC và xây dựng hồ sơ kẻ tấn công dựa trên TTP.",
    d7_2: "Giao thức STIX/TAXII tự động nhận threat feed và ánh xạ mẫu tấn công lên MITRE ATT&CK matrix!",
    d7_3: "Tốt. Thu thập 3 tài sản cốt lõi CTI — threat feed thời gian thực, IOC database và MITRE mapping!",
    d8_1: "Thu thập tài sản CTI hoàn tất! Trích xuất IOC mới nhất và ánh xạ chính xác T1566.001 spearphishing TTP lên ATT&CK matrix.",
    d8_2: "Hoàn hảo. Hãy nêu tên framework phân loại hành vi kẻ tấn công thành Tactics, Techniques và Procedures.",
    d9_1: "Tất cả phân tích hoàn tất, {LEADER}! Cần tích hợp chiến lược ứng phó zero-day với khả năng phục hồi mạng của tổ chức.",
    d9_2: "Đúng. Tăng cường quản lý bản vá, lập kế hoạch ứng phó sự cố và đảm bảo khả năng phục hồi mạng là mục tiêu cuối cùng!",
    d10_1: "Hệ thống đào tạo để xác minh trước quy trình ứng phó sự cố đã được thiết lập!",
    d10_2: "Câu hỏi cuối. Hãy nêu tên bài tập xác minh trước năng lực ứng phó sự cố bảo mật trước khi triển khai thực tế.",
    d11_1: "Tích hợp chiến lược hoàn tất! Purple Team, phân tích CVE, hệ thống CTI, khả năng phục hồi — tất cả hoạt động bình thường.",
    d11_2: "Làm tốt lắm, {AGENT}. Nội dung hôm nay đã được ghi nhận. Hãy ôn tập kỹ lưỡng.",
    h1: "Tìm vũ khí tấn công Red Team (crosshair), khiên Blue Team,<br>và báo cáo tích hợp Purple Team.",
    h2: "Thu thập lỗ hổng MSHTML (bug), ActiveX control,<br>và gói CAB payload.",
    h3: "Thu thập MSDT terminal của Follina, NTLM key của Outlook,<br>và liên kết zero-day chain.",
    h4: "Tìm threat feed thời gian thực (RSS), IOC database,<br>và MITRE ATT&CK mapping.",
    h5: "Kích hoạt hệ thống quản lý bản vá (refresh), kế hoạch ứng phó (clipboard),<br>và khiên phục hồi!",
    c_red_t: "Tấn công Red Team", c_red_m: "Đội mô phỏng tấn công bắt chước TTP của kẻ tấn công thực để kiểm tra hệ thống phòng thủ của tổ chức.",
    c_blue_t: "Phòng thủ Blue Team", c_blue_m: "Đội vận hành bảo mật phát hiện, phân tích và ứng phó tấn công Red Team bằng SIEM/EDR.",
    c_purple_t: "Báo cáo Purple Team", c_purple_m: "Báo cáo hợp tác tích hợp kết quả tấn công Red Team và phát hiện Blue Team để xác định lỗ hổng bảo mật.",
    c_mshtml_t: "MSHTML Exploit", c_mshtml_m: "CVE-2021-40444: OLE object trong tài liệu Office gọi MSHTML (Trident) render HTML từ xa và thực thi mã qua ActiveX.",
    c_activex_t: "ActiveX Control", c_activex_m: "ActiveX control từ HTML từ xa truy cập hệ thống tệp cục bộ và thực thi DLL độc hại.",
    c_cab_t: "CAB Payload", c_cab_m: "Kho lưu trữ CAB trên máy chủ từ xa chứa DLL độc hại được trích xuất và thực thi qua ActiveX.",
    c_follina_t: "Follina MSDT", c_follina_m: "CVE-2022-30190: Template từ xa trong Word gọi ms-msdt: URI để kích hoạt MSDT và thực thi PowerShell.",
    c_outlook_t: "Outlook NTLM", c_outlook_m: "CVE-2023-23397: Email lời mời lịch được xử lý tự động trong Outlook, rò rỉ NTLM hash đến máy chủ SMB.",
    c_zeroday_t: "Chuỗi Zero-Day", c_zeroday_m: "Kỹ thuật tấn công cao cấp kết hợp nhiều lỗ hổng zero-day để chiếm quyền hoàn toàn hệ thống.",
    c_feed_t: "Threat Feed", c_feed_m: "Luồng thông tin mối đe dọa thời gian thực qua STIX/TAXII, tự động thu thập IOC, IP độc hại và hash.",
    c_ioc_t: "IOC Database", c_ioc_m: "Cơ sở dữ liệu chỉ báo xâm phạm — hash tệp độc hại, domain C2, địa chỉ IP, registry key.",
    c_mitre_t: "MITRE Mapping", c_mitre_m: "Ánh xạ IOC và hành vi tấn công lên MITRE ATT&CK matrix theo Tactics, Techniques và Procedures.",
    c_patch_t: "Quản lý bản vá", c_patch_m: "Hệ thống quản lý bản vá tự động và virtual patching để giảm thiểu thời gian phơi nhiễm.",
    c_incident_t: "Kế hoạch ứng phó", c_incident_m: "Kế hoạch ứng phó sự cố dựa trên NIST SP 800-61 với 5 giai đoạn và RACI matrix.",
    c_resilience_t: "Tăng cường phục hồi", c_resilience_m: "Khả năng phục hồi mạng để duy trì hoạt động cốt lõi sau tấn công, bao gồm BCP/DRP và tabletop exercise.",
    p1_title: "Mô hình vận hành hợp tác", p1_desc: '<b>Mô hình vận hành đội tích hợp</b> mà Red và Blue Team hợp tác tăng cường bảo mật là gì?', p1_opts: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    p2_title: "Lỗ hổng MSHTML", p2_desc: '<b>Thành phần engine Internet Explorer</b> bị khai thác trong CVE-2021-40444 là gì?', p2_opts: ["MSHTML", "VBScript", "JScript", "Chakra"],
    p3_title: "Công cụ chẩn đoán Follina", p3_desc: '<b>Công cụ chẩn đoán Windows</b> mà CVE-2022-30190 (Follina) khai thác là gì?', p3_opts: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    p4_title: "Framework phân loại mối đe dọa", p4_desc: '<b>Framework phân loại hành vi kẻ tấn công thành TTP</b> trong threat intelligence là gì?', p4_opts: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    p5_title: "Xác minh ứng phó sự cố", p5_desc: '<b>Bài tập xác minh trước năng lực ứng phó sự cố</b> trước khi triển khai thực tế là gì?', p5_opts: ["Kiểm tra xâm nhập", "Tabletop Exercise", "Kiểm toán bảo mật", "Đánh giá tuân thủ"],
    teamLeader: 'Đội trưởng', agent: 'Đặc vụ', secRate: 'Đã thu thập', certReport: 'Báo cáo hoàn thành',
    analysisReport: 'Báo cáo phân tích', freeMode: '(Chế độ khám phá tự do)',
    proceed: 'Tiếp tục', next: 'Tiếp', closeWindow: 'Đóng', saveData: 'Lưu dữ liệu',
    inventory: 'Dữ liệu thu thập (Inventory)', noClues: 'Chưa thu thập manh mối nào.',
    prevTab: '◀ Trước', nextTab: 'Tiếp ▶',
    rTab1: "1. Purple Team", rTab2: "2. CVE-2021-40444", rTab3: "3. Follina & Outlook",
    rTab4: "4. Tình báo mối đe dọa mạng", rTab5: "5. Tích hợp bảo mật chiến lược", rTab6: "6. Hoàn thành đào tạo",
    r1_h: "Vận hành Purple Team", r1_ch1: "Ch 1. Phân chia vai trò Red/Blue Team",
    r1_ch1_p: '<span class="text-white bg-white/10 px-1 rounded">Red Team</span> tái hiện TTP của APT thực để tấn công phòng thủ, <span class="text-white bg-white/10 px-1 rounded">Blue Team</span> phát hiện và ứng phó thời gian thực bằng SIEM, EDR, NDR.',
    r1_ch2: "Ch 2. Báo cáo hợp tác Purple Team",
    r1_ch2_l1: 'Purple Team <span class="text-white bg-white/10 px-1 rounded">tích hợp phân tích</span> kết quả tấn công Red Team và tỷ lệ phát hiện Blue Team.',
    r1_ch2_l2: 'Xác định lỗ hổng phát hiện và định lượng phạm vi MITRE ATT&CK để lập lộ trình cải thiện.',
    r2_h: "Phân tích CVE-2021-40444", r2_ch3: "Ch 3. Cơ chế lỗ hổng MSHTML",
    r2_ch3_p: 'OLE object trong Office gọi <span class="text-white bg-white/10 px-1 rounded">MSHTML (Trident)</span> render HTML từ xa và thực thi mã tùy ý qua ActiveX.',
    r2_ch4: "Ch 4. Chuỗi khai thác ActiveX",
    r2_ch4_l1: "Mở tài liệu .docx độc hại (đính kèm spearphishing)", r2_ch4_l2: "MSHTML engine tải HTML từ xa", r2_ch4_l3: "ActiveX control tải CAB archive", r2_ch4_l4: "Trích xuất và thực thi DLL độc hại từ CAB",
    r3_h: "Follina & Outlook CVE", r3_ch5: "Ch 5. Khai thác MSDT CVE-2022-30190",
    r3_ch5_p: 'Template từ xa trong Word gọi <span class="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URI để kích hoạt MSDT và thực thi PowerShell — tấn công zero-day.',
    r3_ch6: "Ch 6. NTLM Relay CVE-2023-23397",
    r3_ch6_l1: 'Email lời mời lịch được Outlook <span class="text-white bg-white/10 px-1 rounded">xử lý tự động không cần tương tác</span>.',
    r3_ch6_l2: 'NTLM hash rò rỉ đến SMB server của kẻ tấn công, cho phép leo thang đặc quyền và di chuyển ngang.',
    r4_h: "Tình báo mối đe dọa mạng", r4_ch7: "Ch 7. Thu thập và chia sẻ IOC",
    r4_ch7_p: 'Tự động thu thập IOC qua <span class="text-white bg-white/10 px-1 rounded">STIX/TAXII</span> và chia sẻ thời gian thực với cộng đồng bảo mật.',
    r4_ch8: "Ch 8. Hồ sơ kẻ tấn công dựa trên TTP",
    r4_ch8_l1: 'Ánh xạ IOC lên <span class="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span> matrix để phân loại tactics, techniques và procedures.',
    r4_ch8_l2: 'Kết hợp Diamond Model và Kill Chain để xây dựng hồ sơ hành vi APT.',
    r5_h: "Tích hợp bảo mật chiến lược", r5_ch9: "Ch 9. Chiến lược ứng phó Zero-Day",
    r5_ch9_p: 'Áp dụng <span class="text-white bg-white/10 px-1 rounded">virtual patching</span> và microsegmentation trước khi có bản vá để giảm thiểu thời gian phơi nhiễm.',
    r5_ch10: "Ch 10. Khả năng phục hồi mạng tổ chức",
    r5_ch10_l1: 'Xác minh quy trình ứng phó sự cố qua <span class="text-white bg-white/10 px-1 rounded">tabletop exercise</span> và kiểm tra RACI matrix.',
    r5_ch10_l2: 'Thiết lập BCP/DRP để đảm bảo liên tục hoạt động sau tấn công mạng.',
    r6_complete: "Hoàn thành đào tạo!",
    r6_desc: "Từ vận hành Purple Team đến phân tích CVE,<br/>hệ thống CTI và khả năng phục hồi —<br/>bạn đã hoàn thành xuất sắc khóa Expert.",
    r6_grade: "Xếp hạng cuối:", r6_labBtn: "Đến Lab 🚀",
    r6_freeHint: "(Đóng cửa sổ để khám phá lại từng sector)",
  },
  ar: {
    loc1: 'القطاع 1: غرفة قيادة الفريق الأرجواني', loc2: 'القطاع 2: مختبر تحليل CVE', loc3: 'القطاع 3: مختبر أبحاث Zero-Day', loc4: 'القطاع 4: مركز CTI', loc5: 'القطاع 5: غرفة التكامل الاستراتيجي',
    d1_1: "انتبه! العميل {AGENT}، مهمة اليوم من أعلى مستوى. افحص نظام تشغيل الفريق الأرجواني وحلل هيكل التعاون بين الفريقين الأحمر والأزرق.",
    d1_2: "نعم، القائد! أرى الفريق الأحمر يعيد إنتاج TTP للمهاجمين الحقيقيين، والفريق الأزرق يتحقق من الكشف والاستجابة.",
    d1_3: "جيد. الفريق الأرجواني يدمج نتائج الفريقين لسد الثغرات الأمنية. اجمع 3 أدلة رئيسية من غرفة القيادة!",
    d2_1: "تم التأكيد! حصلت على نتائج محاكاة الهجوم وسجلات الكشف والتقرير التحليلي المتكامل.",
    d2_2: "أحسنت. ما اسم نموذج التشغيل الذي يتعاون فيه الفريقان لتعزيز الأمن؟",
    d3_1: "الآن نحلل CVE المستغلة في مرفقات التصيد. CVE-2021-40444 كان zero-day حرج استغل MSHTML عبر مستندات Office.",
    d3_2: "مجرد فتح مستند Word ينفذ كود عن بعد عبر ActiveX! ملفات CAB تنقل الحمولة.",
    d3_3: "صحيح. استخرج كل مكون من سلسلة الهجوم. احصل على MSHTML exploit وActiveX control وCAB payload!",
    d4_1: "اكتمل تحليل سلسلة الاستغلال! فتح المستند → عرض MSHTML → تحميل ActiveX → تنزيل CAB → تنفيذ DLL.",
    d4_2: "ممتاز. ما اسم مكون محرك Internet Explorer الذي تم استغلاله؟",
    d5_1: "مرحباً في مختبر أبحاث zero-day. هنا نحلل CVE-2022-30190 (Follina) وCVE-2023-23397 (تصعيد صلاحيات Outlook) في آن واحد.",
    d5_2: "Follina يستغل معالج ms-msdt: لتشغيل MSDT، وOutlook CVE يسرق NTLM hash بدون تفاعل المستخدم!",
    d5_3: "كلتا الثغرتين استُخدمتا كسلاح في مرفقات التصيد. احصل على أدلة Follina MSDT وOutlook NTLM وسلسلة zero-day!",
    d6_1: "اكتمل تحليل كلا CVE! Follina يستغل أدوات التشخيص، وOutlook CVE يتيح NTLM relay من المعاينة فقط.",
    d6_2: "صحيح. ما اختصار أداة تشخيص Windows التي يستغلها Follina؟",
    d7_1: "هذا مركز استخبارات التهديدات السيبرانية (CTI). هنا نجمع IOC ونبني ملفات تعريف المهاجمين بناءً على TTP.",
    d7_2: "بروتوكولات STIX/TAXII تستقبل تلقائياً threat feeds وتعيّن أنماط الهجوم على مصفوفة MITRE ATT&CK!",
    d7_3: "جيد. احصل على 3 أصول أساسية لـ CTI — threat feed مباشر وIOC database وMITRE mapping!",
    d8_1: "تم تأمين أصول CTI! استخرجت أحدث IOC ورسمت خريطة T1566.001 spearphishing TTP على ATT&CK matrix.",
    d8_2: "ممتاز. ما اسم الإطار الذي يصنف سلوك المهاجمين إلى Tactics وTechniques وProcedures؟",
    d9_1: "اكتمل التحليل، {LEADER}! يجب دمج استراتيجية الاستجابة لـ zero-day مع المرونة السيبرانية للمنظمة.",
    d9_2: "صحيح. تعزيز إدارة التصحيحات ووضع خطة الاستجابة للحوادث وضمان المرونة السيبرانية هو الهدف النهائي!",
    d10_1: "تم إنشاء نظام تدريب للتحقق المسبق من إجراءات الاستجابة للحوادث!",
    d10_2: "السؤال الأخير. ما اسم التمرين الذي يتحقق مسبقاً من قدرة الاستجابة لحوادث الأمن قبل النشر الفعلي؟",
    d11_1: "اكتمل التكامل الاستراتيجي! عمليات الفريق الأرجواني، تحليل CVE، نظام CTI، المرونة — كل الأنظمة تعمل.",
    d11_2: "أحسنت، {AGENT}. تم تسجيل ما تعلمته اليوم. راجعه بعناية.",
    h1: "ابحث عن سلاح Red Team (التصويب)، درع Blue Team،<br>وتقرير Purple Team المتكامل.",
    h2: "اجمع ثغرة MSHTML (خطأ)، ActiveX control،<br>وحزمة CAB payload.",
    h3: "اجمع محطة Follina MSDT، مفتاح Outlook NTLM،<br>ورابط سلسلة zero-day.",
    h4: "ابحث عن threat feed المباشر (RSS)، IOC database،<br>وMITRE ATT&CK mapping.",
    h5: "فعّل نظام إدارة التصحيحات (تحديث)، خطة الاستجابة (حافظة)،<br>ودرع المرونة!",
    c_red_t: "هجوم Red Team", c_red_m: "فريق محاكاة هجومية يقلد TTP المهاجمين الحقيقيين لاختبار دفاعات المنظمة عملياً.",
    c_blue_t: "دفاع Blue Team", c_blue_m: "فريق عمليات أمنية يكتشف ويحلل ويستجيب لهجمات Red Team باستخدام SIEM/EDR.",
    c_purple_t: "تقرير Purple Team", c_purple_m: "تقرير تعاوني يدمج نتائج هجوم Red Team وكشف Blue Team لتحديد الثغرات الأمنية.",
    c_mshtml_t: "MSHTML Exploit", c_mshtml_m: "CVE-2021-40444: كائن OLE في مستندات Office يستدعي MSHTML (Trident) لعرض HTML عن بعد وتنفيذ كود عبر ActiveX.",
    c_activex_t: "ActiveX Control", c_activex_m: "ActiveX control من HTML عن بعد يصل لنظام الملفات المحلي وينفذ DLL ضار.",
    c_cab_t: "CAB Payload", c_cab_m: "أرشيف CAB على خادم المهاجم يحتوي DLL ضار يُستخرج ويُنفذ عبر ActiveX.",
    c_follina_t: "Follina MSDT", c_follina_m: "CVE-2022-30190: قالب عن بعد في Word يستدعي ms-msdt: URI لتشغيل MSDT وتنفيذ PowerShell.",
    c_outlook_t: "Outlook NTLM", c_outlook_m: "CVE-2023-23397: بريد دعوة تقويم مُعدّ يُعالج تلقائياً في Outlook مسرباً NTLM hash.",
    c_zeroday_t: "سلسلة Zero-Day", c_zeroday_m: "تقنية هجومية متقدمة تربط عدة ثغرات zero-day للسيطرة الكاملة على النظام.",
    c_feed_t: "Threat Feed", c_feed_m: "تدفق معلومات تهديدات مباشر عبر STIX/TAXII يجمع تلقائياً IOC وIP ضارة وhash.",
    c_ioc_t: "IOC Database", c_ioc_m: "قاعدة بيانات مؤشرات الاختراق — hash ملفات ضارة، نطاقات C2، عناوين IP، مفاتيح registry.",
    c_mitre_t: "MITRE Mapping", c_mitre_m: "تعيين IOC وسلوك الهجوم على مصفوفة MITRE ATT&CK حسب Tactics وTechniques وProcedures.",
    c_patch_t: "إدارة التصحيحات", c_patch_m: "نظام إدارة تصحيحات آلي وvirtual patching لتقليل فترة التعرض.",
    c_incident_t: "خطة الاستجابة", c_incident_m: "خطة استجابة للحوادث وفق NIST SP 800-61 بخمس مراحل ومصفوفة RACI.",
    c_resilience_t: "تعزيز المرونة", c_resilience_m: "المرونة السيبرانية للحفاظ على العمليات الأساسية بعد الهجمات، تشمل BCP/DRP وتمارين tabletop.",
    p1_title: "نموذج التشغيل التعاوني", p1_desc: 'ما <b>نموذج تشغيل الفريق المتكامل</b> الذي يتعاون فيه Red وBlue لتعزيز الأمن؟', p1_opts: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    p2_title: "ثغرة MSHTML", p2_desc: 'ما <b>مكون محرك Internet Explorer</b> المستغل في CVE-2021-40444؟', p2_opts: ["MSHTML", "VBScript", "JScript", "Chakra"],
    p3_title: "أداة تشخيص Follina", p3_desc: 'ما <b>أداة تشخيص Windows</b> التي يستغلها CVE-2022-30190 (Follina)؟', p3_opts: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    p4_title: "إطار تصنيف التهديدات", p4_desc: 'ما <b>الإطار الذي يصنف سلوك المهاجمين إلى TTP</b> في استخبارات التهديدات؟', p4_opts: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    p5_title: "التحقق المسبق من الاستجابة", p5_desc: 'ما <b>التمرين الذي يتحقق مسبقاً من قدرة الاستجابة لحوادث الأمن</b>؟', p5_opts: ["اختبار الاختراق", "تمرين Tabletop", "تدقيق أمني", "مراجعة الامتثال"],
    teamLeader: 'القائد', agent: 'العميل', secRate: 'تم التأمين', certReport: 'تقرير الإتمام',
    analysisReport: 'تقرير التحليل', freeMode: '(وضع الاستكشاف الحر)',
    proceed: 'متابعة', next: 'التالي', closeWindow: 'إغلاق', saveData: 'حفظ البيانات',
    inventory: 'البيانات المجمعة (Inventory)', noClues: 'لم يتم جمع أدلة بعد.',
    prevTab: '◀ السابق', nextTab: 'التالي ▶',
    rTab1: "1. Purple Team", rTab2: "2. CVE-2021-40444", rTab3: "3. Follina & Outlook",
    rTab4: "4. استخبارات التهديدات السيبرانية", rTab5: "5. التكامل الأمني الاستراتيجي", rTab6: "6. إتمام التدريب",
    r1_h: "عمليات Purple Team", r1_ch1: "Ch 1. توزيع أدوار Red/Blue Team",
    r1_ch1_p: '<span class="text-white bg-white/10 px-1 rounded">Red Team</span> يعيد إنتاج TTP لمجموعات APT الحقيقية، <span class="text-white bg-white/10 px-1 rounded">Blue Team</span> يكتشف ويستجيب في الوقت الحقيقي.',
    r1_ch2: "Ch 2. تقرير تعاون Purple Team",
    r1_ch2_l1: 'Purple Team <span class="text-white bg-white/10 px-1 rounded">يدمج تحليل</span> نتائج هجوم Red Team ومعدلات كشف Blue Team.',
    r1_ch2_l2: 'يحدد فجوات الكشف ويقيّم تغطية MITRE ATT&CK لوضع خارطة تحسين.',
    r2_h: "تحليل CVE-2021-40444", r2_ch3: "Ch 3. آلية ثغرة MSHTML",
    r2_ch3_p: 'كائن OLE في Office يستدعي <span class="text-white bg-white/10 px-1 rounded">MSHTML (Trident)</span> لعرض HTML عن بعد وتنفيذ كود عبر ActiveX.',
    r2_ch4: "Ch 4. سلسلة استغلال ActiveX",
    r2_ch4_l1: "فتح مستند .docx ضار (مرفق تصيد)", r2_ch4_l2: "محرك MSHTML يحمل HTML عن بعد", r2_ch4_l3: "ActiveX control يحمل أرشيف CAB", r2_ch4_l4: "استخراج وتنفيذ DLL ضار من CAB",
    r3_h: "Follina & Outlook CVE", r3_ch5: "Ch 5. استغلال MSDT CVE-2022-30190",
    r3_ch5_p: 'قالب عن بعد في Word يستدعي <span class="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URI لتشغيل MSDT وتنفيذ PowerShell — هجوم zero-day.',
    r3_ch6: "Ch 6. NTLM Relay CVE-2023-23397",
    r3_ch6_l1: 'دعوة تقويم مُعدّة <span class="text-white bg-white/10 px-1 rounded">تُعالج تلقائياً بدون تفاعل</span> في Outlook.',
    r3_ch6_l2: 'تسريب NTLM hash إلى خادم SMB للمهاجم مما يتيح تصعيد الصلاحيات والحركة الجانبية.',
    r4_h: "استخبارات التهديدات السيبرانية", r4_ch7: "Ch 7. جمع ومشاركة IOC",
    r4_ch7_p: 'جمع IOC تلقائياً عبر <span class="text-white bg-white/10 px-1 rounded">STIX/TAXII</span> ومشاركتها مع مجتمع الأمن في الوقت الحقيقي.',
    r4_ch8: "Ch 8. تحليل المهاجمين بناءً على TTP",
    r4_ch8_l1: 'تعيين IOC على <span class="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span> لتصنيف tactics وtechniques وprocedures.',
    r4_ch8_l2: 'دمج Diamond Model وKill Chain لبناء ملفات تعريف سلوك APT.',
    r5_h: "التكامل الأمني الاستراتيجي", r5_ch9: "Ch 9. استراتيجية الاستجابة لـ Zero-Day",
    r5_ch9_p: 'تطبيق <span class="text-white bg-white/10 px-1 rounded">virtual patching</span> وmicrosegmentation قبل إصدار التصحيح لتقليل فترة التعرض.',
    r5_ch10: "Ch 10. المرونة السيبرانية للمنظمة",
    r5_ch10_l1: 'التحقق المسبق من إجراءات الاستجابة عبر <span class="text-white bg-white/10 px-1 rounded">تمارين tabletop</span> ومراجعة مصفوفة RACI.',
    r5_ch10_l2: 'إنشاء إطار BCP/DRP لضمان استمرارية الأعمال بعد الهجمات السيبرانية.',
    r6_complete: "اكتمل التدريب!",
    r6_desc: "من عمليات Purple Team إلى تحليل CVE،<br/>أنظمة CTI والمرونة —<br/>أتممت بامتياز دورة Expert.",
    r6_grade: "التصنيف النهائي:", r6_labBtn: "→ إلى المختبر 🚀",
    r6_freeHint: "(أغلق النافذة لاستكشاف كل قطاع بحرية)",
  },
  zh: {
    loc1: 'Sector 1: 紫队指挥室', loc2: 'Sector 2: CVE 分析室', loc3: 'Sector 3: 零日研究所', loc4: 'Sector 4: CTI 中心', loc5: 'Sector 5: 战略整合室',
    d1_1: "注意！{AGENT} 特工，今天的任务是最高级别。检查 Purple Team 运营体系，分析 Red Team 和 Blue Team 的协作结构。",
    d1_2: "是的，队长！我看到 Red Team 正在复现真实攻击者的 TTP，而 Blue Team 在验证检测与响应能力。",
    d1_3: "很好。Purple Team 整合双方结果以弥补安全缺口。从指挥室收集 3 个关键线索！",
    d2_1: "确认完毕！已获取 Red Team 攻击模拟结果、Blue Team 检测日志以及综合分析报告。",
    d2_2: "干得好。说出这两个团队协作强化安全的运营模型名称。",
    d3_1: "现在分析鱼叉式钓鱼附件中利用的 CVE。CVE-2021-40444 是通过 Office 文档滥用 MSHTML 引擎的严重零日漏洞。",
    d3_2: "仅仅打开 Word 文档就能通过 ActiveX 控件实现远程代码执行！CAB 文件用于传递载荷。",
    d3_3: "没错。从分析室提取此攻击链的每个组件。获取 MSHTML exploit、ActiveX 控件和 CAB 载荷！",
    d4_1: "攻击链分析完成！已重建完整流程：打开文档 → MSHTML 渲染 → ActiveX 加载 → CAB 下载 → DLL 执行。",
    d4_2: "出色。说出此攻击中被关键利用的 Internet Explorer 引擎组件的准确名称。",
    d5_1: "欢迎来到零日研究所。这里我们同时分析 CVE-2022-30190（Follina）和 CVE-2023-23397（Outlook 权限提升）。",
    d5_2: "Follina 滥用 ms-msdt: 协议处理程序触发 MSDT，Outlook CVE 在无用户交互的情况下窃取 NTLM 哈希！",
    d5_3: "两个漏洞都被武器化用于鱼叉式钓鱼附件。从研究所获取 Follina MSDT、Outlook NTLM 和零日链证据！",
    d6_1: "两个 CVE 分析完毕！Follina 利用诊断工具，Outlook CVE 仅通过预览即可实现 NTLM 中继——极其严重的漏洞。",
    d6_2: "正确。说出 CVE-2022-30190（即 Follina）利用的 Windows 诊断工具的缩写。",
    d7_1: "这里是网络威胁情报（CTI）中心。我们收集 IOC（入侵指标）并基于 TTP 构建攻击者画像。",
    d7_2: "STIX/TAXII 协议自动接收威胁情报源，并将攻击模式映射到 MITRE ATT&CK 矩阵！",
    d7_3: "好。获取 CTI 的三大核心资产——实时威胁情报源、IOC 数据库和 MITRE 映射体系！",
    d8_1: "CTI 资产获取完毕！已从威胁情报源提取最新 IOC，并将 T1566.001 鱼叉式钓鱼 TTP 精确映射到 ATT&CK 矩阵。",
    d8_2: "完美。说出将攻击者行为模式分类为战术、技术和程序的框架名称。",
    d9_1: "所有分析已完成，{LEADER}！现在需要将零日响应策略与组织网络弹性整合。",
    d9_2: "没错。加强补丁管理、建立事件响应计划、确保组织网络弹性是最终目标！",
    d10_1: "用于预先验证组织事件响应流程的训练体系已建立完毕！",
    d10_2: "最后一个问题。说出在实际部署前预先验证组织安全事件响应能力的演练名称。",
    d11_1: "战略整合完成！Purple Team 运营、CVE 分析、CTI 体系、组织弹性——所有系统正常运行。",
    d11_2: "辛苦了，{AGENT}。今天学习的内容已记录在最终案例手册中，请仔细复习。",
    h1: "找到 Red Team 的攻击武器（准星）、Blue Team 的盾牌、<br>以及 Purple Team 的综合报告。",
    h2: "收集 MSHTML 引擎漏洞（bug）、ActiveX 代码控件、<br>以及 CAB 载荷包。",
    h3: "收集 Follina 的 MSDT 终端、Outlook NTLM 密钥、<br>以及零日攻击链链接。",
    h4: "找到实时威胁情报源（RSS）、IOC 数据库、<br>以及 MITRE ATT&CK 映射图。",
    h5: "启动补丁管理系统（刷新）、事件响应计划书（剪贴板）、<br>以及弹性防护盾！",
    c_red_t: "Red Team 攻击", c_red_m: "模拟真实攻击者 TTP（战术·技术·程序）来实际测试组织防御体系的攻击模拟团队。",
    c_blue_t: "Blue Team 防御", c_blue_m: "利用 SIEM/EDR 等防御工具实时检测、分析和响应 Red Team 攻击的安全运营团队。",
    c_purple_t: "Purple Team 报告", c_purple_m: "整合 Red Team 攻击结果与 Blue Team 检测结果，识别安全缺口并制定改进方案的协作报告。",
    c_mshtml_t: "MSHTML Exploit", c_mshtml_m: "CVE-2021-40444：Office 文档中的 OLE 对象调用 MSHTML（Trident）引擎渲染远程 HTML，并通过 ActiveX 执行任意代码。",
    c_activex_t: "ActiveX 控件", c_activex_m: "由 MSHTML 加载的远程 HTML 页面实例化 ActiveX 控件，访问本地文件系统并执行恶意 DLL。",
    c_cab_t: "CAB 载荷", c_cab_m: "攻击者在远程服务器上托管的 CAB（Cabinet）归档文件，内含恶意 DLL，通过 ActiveX 提取并执行。",
    c_follina_t: "Follina MSDT", c_follina_m: "CVE-2022-30190：Word 文档中的远程模板调用 ms-msdt: URI 方案触发 MSDT 并执行 PowerShell 代码——零日漏洞利用。",
    c_outlook_t: "Outlook NTLM", c_outlook_m: "CVE-2023-23397：特制的日历邀请邮件在 Outlook 中自动处理，将 NTLM 认证哈希泄露到攻击者的 SMB 服务器。",
    c_zeroday_t: "零日链", c_zeroday_m: "将多个零日漏洞链式组合，实现单一漏洞无法达成的完整系统控制的高级攻击技术。",
    c_feed_t: "威胁情报源", c_feed_m: "通过 STIX/TAXII 协议全球共享的实时威胁信息流，自动收集 IOC、恶意 IP 和哈希值。",
    c_ioc_t: "IOC 数据库", c_ioc_m: "入侵指标（Indicators of Compromise）——系统化存储和查询恶意文件哈希、C2 域名、IP 地址和注册表键的威胁情报数据库。",
    c_mitre_t: "MITRE 映射", c_mitre_m: "将收集到的 IOC 和攻击行为精确映射到 MITRE ATT&CK 矩阵的战术、技术和程序，构建攻击者画像。",
    c_patch_t: "补丁管理", c_patch_m: "自动化的补丁管理和虚拟补丁系统，最大程度缩短零日披露与厂商补丁发布之间的暴露窗口期。",
    c_incident_t: "响应计划", c_incident_m: "基于 NIST SP 800-61 的事件响应计划，定义检测、分析、遏制、恢复、事后分析 5 阶段流程和 RACI 矩阵。",
    c_resilience_t: "弹性强化", c_resilience_m: "组织网络弹性（Cyber Resilience），确保遭受网络攻击后仍能维持核心业务，包括 BCP/DRP 和桌面推演。",
    p1_title: "协作运营模型", p1_desc: '攻击团队（Red）和防御团队（Blue）协作强化安全的<b>集成团队运营模型</b>是什么？', p1_opts: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    p2_title: "MSHTML 漏洞", p2_desc: 'CVE-2021-40444 中被利用的 <b>Internet Explorer 引擎组件</b>是什么？', p2_opts: ["MSHTML", "VBScript", "JScript", "Chakra"],
    p3_title: "Follina 诊断工具", p3_desc: 'CVE-2022-30190（Follina）利用的 <b>Windows 诊断工具</b>是什么？', p3_opts: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    p4_title: "威胁分类框架", p4_desc: '在威胁情报中将攻击者行为分类为<b>战术·技术·程序（TTP）的框架</b>是什么？', p4_opts: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    p5_title: "事件响应预先验证", p5_desc: '在实际部署前<b>预先验证组织安全事件响应能力的演练</b>是什么？', p5_opts: ["渗透测试", "桌面推演", "安全审计", "合规审查"],
    teamLeader: '队长', agent: '特工', secRate: '确保率', certReport: '结业报告',
    analysisReport: '分析报告', freeMode: '(自由探索模式)',
    proceed: '继续', next: '下一步', closeWindow: '关闭', saveData: '保存数据',
    inventory: '收集数据 (Inventory)', noClues: '尚未收集到任何线索。',
    prevTab: '◀ 上一页', nextTab: '下一页 ▶',
    rTab1: "1. Purple Team 运营", rTab2: "2. CVE-2021-40444", rTab3: "3. Follina 与 Outlook",
    rTab4: "4. 网络威胁情报", rTab5: "5. 战略安全整合", rTab6: "6. 训练结业",
    r1_h: "Purple Team 运营",
    r1_ch1: "Ch 1. Red/Blue Team 角色分工",
    r1_ch1_p: '<span class="text-white bg-white/10 px-1 rounded">Red Team</span> 复现真实 APT 组织的 TTP 攻击组织防御体系，<span class="text-white bg-white/10 px-1 rounded">Blue Team</span> 利用 SIEM、EDR、NDR 进行实时检测和响应。',
    r1_ch2: "Ch 2. Purple Team 协作报告",
    r1_ch2_l1: 'Purple Team <span class="text-white bg-white/10 px-1 rounded">综合分析</span> Red Team 攻击成功/失败结果与 Blue Team 检测率。',
    r1_ch2_l2: '识别检测缺口并量化 MITRE ATT&CK 覆盖率，制定改进路线图。',
    r2_h: "CVE-2021-40444 分析",
    r2_ch3: "Ch 3. MSHTML 漏洞机制",
    r2_ch3_p: 'Office 文档中的 OLE 对象调用 <span class="text-white bg-white/10 px-1 rounded">MSHTML（Trident）引擎</span>渲染远程 HTML，并通过 ActiveX 控件在本地系统执行任意代码。',
    r2_ch4: "Ch 4. ActiveX 利用链",
    r2_ch4_l1: "打开恶意 .docx 文档（鱼叉式钓鱼附件）", r2_ch4_l2: "MSHTML 引擎加载远程 HTML", r2_ch4_l3: "ActiveX 控件下载 CAB 归档", r2_ch4_l4: "从 CAB 中提取并执行恶意 DLL",
    r3_h: "Follina 与 Outlook CVE",
    r3_ch5: "Ch 5. CVE-2022-30190 MSDT 利用",
    r3_ch5_p: 'Word 文档中的远程模板调用 <span class="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URI 方案触发 Microsoft Support Diagnostic Tool 并执行 PowerShell 代码——零日攻击。',
    r3_ch6: "Ch 6. CVE-2023-23397 NTLM 中继",
    r3_ch6_l1: '特制的日历邀请在 Outlook 中<span class="text-white bg-white/10 px-1 rounded">无需用户交互即自动处理</span>。',
    r3_ch6_l2: 'NTLM 认证哈希泄露到攻击者的 SMB 服务器，实现权限提升和横向移动。',
    r4_h: "网络威胁情报",
    r4_ch7: "Ch 7. IOC 收集与共享",
    r4_ch7_p: '通过 <span class="text-white bg-white/10 px-1 rounded">STIX/TAXII</span> 协议自动收集 IOC（恶意哈希、C2 域名、IP），并与安全社区实时共享。',
    r4_ch8: "Ch 8. 基于 TTP 的攻击者画像",
    r4_ch8_l1: '将收集到的 IOC 映射到 <span class="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span> 矩阵，分类攻击者的战术、技术和程序。',
    r4_ch8_l2: '结合 Diamond Model 和 Kill Chain 分析，构建 APT 组织行为画像。',
    r5_h: "战略安全整合",
    r5_ch9: "Ch 9. 零日响应策略",
    r5_ch9_p: '在厂商发布补丁前应用 <span class="text-white bg-white/10 px-1 rounded">虚拟补丁（Virtual Patching）</span>和微分段，最大程度缩短暴露窗口期。',
    r5_ch10: "Ch 10. 组织网络弹性",
    r5_ch10_l1: '通过 <span class="text-white bg-white/10 px-1 rounded">桌面推演</span>预先验证事件响应流程并审查 RACI 矩阵。',
    r5_ch10_l2: '建立 BCP/DRP 体系，确保遭受网络攻击后核心业务连续性。',
    r6_complete: "训练结业完成！",
    r6_desc: "从 Purple Team 运营到 CVE 分析、<br/>CTI 体系和组织弹性——<br/>您已出色完成 Expert 课程。",
    r6_grade: "最终等级:", r6_labBtn: "前往实验室 🚀",
    r6_freeHint: "(关闭此窗口可自由重新探索各区域)",
  },
  hi: {
    loc1: 'Sector 1: Purple Team कमांड रूम', loc2: 'Sector 2: CVE विश्लेषण प्रयोगशाला', loc3: 'Sector 3: Zero-Day अनुसंधान प्रयोगशाला', loc4: 'Sector 4: CTI केंद्र', loc5: 'Sector 5: रणनीतिक एकीकरण कक्ष',
    d1_1: "ध्यान दें! एजेंट {AGENT}, आज का मिशन सर्वोच्च स्तर का है। Purple Team की परिचालन प्रणाली का निरीक्षण करें और Red Team तथा Blue Team के सहयोग ढांचे का विश्लेषण करें।",
    d1_2: "जी, टीम लीडर! मैं देख सकता हूँ कि Red Team वास्तविक हमलावरों के TTP को दोहरा रही है, जबकि Blue Team पहचान और प्रतिक्रिया को सत्यापित कर रही है।",
    d1_3: "अच्छा। Purple Team दोनों पक्षों के परिणामों को एकीकृत करके सुरक्षा अंतरालों को भरती है। कमांड रूम से 3 महत्वपूर्ण सुराग एकत्र करें!",
    d2_1: "पुष्टि हो गई! Red Team के हमला अनुकरण परिणाम, Blue Team की पहचान लॉग और एकीकृत विश्लेषण रिपोर्ट सब प्राप्त कर ली हैं।",
    d2_2: "शाबाश। उस परिचालन मॉडल का नाम बताएं जिसमें ये दोनों टीमें सुरक्षा मजबूत करने के लिए सहयोग करती हैं।",
    d3_1: "अब स्पीयरफ़िशिंग अटैचमेंट में उपयोग किए गए CVE का विश्लेषण करें। CVE-2021-40444 एक गंभीर zero-day था जिसने Office दस्तावेज़ों के माध्यम से MSHTML इंजन का दुरुपयोग किया।",
    d3_2: "केवल Word दस्तावेज़ खोलने पर ActiveX नियंत्रणों के माध्यम से रिमोट कोड निष्पादन हो जाता है! CAB फ़ाइलें पेलोड वितरित करती हैं।",
    d3_3: "सही। प्रयोगशाला से इस हमला श्रृंखला के प्रत्येक घटक को निकालें। MSHTML exploit, ActiveX नियंत्रण और CAB पेलोड प्राप्त करें!",
    d4_1: "Exploit श्रृंखला विश्लेषण पूर्ण! पूरी प्रक्रिया पुनर्निर्मित: दस्तावेज़ खोलना → MSHTML रेंडरिंग → ActiveX लोड → CAB डाउनलोड → DLL निष्पादन।",
    d4_2: "उत्कृष्ट। इस हमले में गंभीर रूप से शोषित Internet Explorer इंजन घटक का सटीक नाम बताएं।",
    d5_1: "Zero-Day अनुसंधान प्रयोगशाला में आपका स्वागत है। यहाँ हम CVE-2022-30190 (Follina) और CVE-2023-23397 (Outlook विशेषाधिकार वृद्धि) का एक साथ विश्लेषण करते हैं।",
    d5_2: "Follina ms-msdt: प्रोटोकॉल हैंडलर का दुरुपयोग करके MSDT को ट्रिगर करता है, और Outlook CVE बिना उपयोगकर्ता इंटरैक्शन के NTLM हैश चुराता है!",
    d5_3: "दोनों कमजोरियाँ स्पीयरफ़िशिंग अटैचमेंट के हथियार के रूप में उपयोग की गईं। प्रयोगशाला से Follina MSDT, Outlook NTLM और zero-day श्रृंखला के साक्ष्य प्राप्त करें!",
    d6_1: "दोनों CVE का विश्लेषण पूर्ण! Follina डायग्नोस्टिक टूल का शोषण करता है, और Outlook CVE केवल प्रीव्यू से भी NTLM रिले सक्षम करता है — अत्यंत गंभीर कमजोरी।",
    d6_2: "सही। CVE-2022-30190, उर्फ़ Follina, द्वारा शोषित Windows डायग्नोस्टिक टूल का संक्षिप्त नाम बताएं।",
    d7_1: "यह साइबर खतरा इंटेलिजेंस (CTI) केंद्र है। यहाँ हम IOC (समझौता संकेतक) एकत्र करते हैं और TTP के आधार पर हमलावर प्रोफ़ाइल बनाते हैं।",
    d7_2: "STIX/TAXII प्रोटोकॉल स्वचालित रूप से खतरा फ़ीड प्राप्त करते हैं और हमला पैटर्न को MITRE ATT&CK मैट्रिक्स पर मैप करते हैं!",
    d7_3: "अच्छा। CTI की तीन मूल संपत्तियाँ प्राप्त करें — रियल-टाइम खतरा फ़ीड, IOC डेटाबेस और MITRE मैपिंग प्रणाली!",
    d8_1: "CTI संपत्तियाँ प्राप्त! खतरा फ़ीड से नवीनतम IOC निकाले और ATT&CK मैट्रिक्स पर T1566.001 स्पीयरफ़िशिंग TTP को सटीक रूप से मैप किया।",
    d8_2: "परफ़ेक्ट। हमलावरों के व्यवहार पैटर्न को Tactics, Techniques और Procedures में वर्गीकृत करने वाले फ्रेमवर्क का नाम बताएं।",
    d9_1: "सभी विश्लेषण पूर्ण, {LEADER}! अब zero-day प्रतिक्रिया रणनीतियों को संगठनात्मक साइबर लचीलेपन के साथ एकीकृत करना होगा।",
    d9_2: "सही। पैच प्रबंधन मजबूत करना, घटना प्रतिक्रिया योजना स्थापित करना और संगठनात्मक साइबर लचीलापन सुनिश्चित करना अंतिम लक्ष्य है!",
    d10_1: "संगठन की घटना प्रतिक्रिया प्रक्रियाओं को पूर्व-सत्यापित करने की प्रशिक्षण प्रणाली स्थापित हो गई है!",
    d10_2: "अंतिम प्रश्न। वास्तविक तैनाती से पहले संगठन की सुरक्षा घटना प्रतिक्रिया क्षमता को पूर्व-सत्यापित करने वाले अभ्यास का नाम बताएं।",
    d11_1: "रणनीतिक एकीकरण पूर्ण! Purple Team संचालन, CVE विश्लेषण, CTI प्रणाली, संगठनात्मक लचीलापन — सभी प्रणालियाँ कार्यशील हैं।",
    d11_2: "बहुत अच्छा, {AGENT}। आज की सीख अंतिम केस बुक में दर्ज कर दी गई है। इसकी अच्छी तरह समीक्षा करें।",
    h1: "Red Team का हमला हथियार (क्रॉसहेयर), Blue Team की ढाल,<br>और Purple Team की एकीकृत रिपोर्ट खोजें।",
    h2: "MSHTML इंजन कमजोरी (बग), ActiveX कोड नियंत्रण,<br>और CAB पेलोड पैकेज एकत्र करें।",
    h3: "Follina का MSDT टर्मिनल, Outlook NTLM कुंजी,<br>और zero-day हमला श्रृंखला लिंक एकत्र करें।",
    h4: "रियल-टाइम खतरा फ़ीड (RSS), IOC डेटाबेस,<br>और MITRE ATT&CK मैपिंग मानचित्र खोजें।",
    h5: "पैच प्रबंधन प्रणाली (रिफ़्रेश), घटना प्रतिक्रिया योजना (क्लिपबोर्ड),<br>और लचीलापन सुरक्षा कवच सक्रिय करें!",
    c_red_t: "Red Team हमला", c_red_m: "वास्तविक हमलावरों के TTP (Tactics·Techniques·Procedures) की नकल करके संगठन की रक्षा प्रणाली का व्यावहारिक परीक्षण करने वाली आक्रमण अनुकरण टीम।",
    c_blue_t: "Blue Team रक्षा", c_blue_m: "SIEM/EDR और अन्य रक्षा उपकरणों का उपयोग करके Red Team के हमलों का रियल-टाइम पहचान, विश्लेषण और प्रतिक्रिया करने वाली सुरक्षा संचालन टीम।",
    c_purple_t: "Purple Team रिपोर्ट", c_purple_m: "Red Team के हमले के परिणामों और Blue Team के पहचान परिणामों को एकीकृत करके सुरक्षा अंतरालों की पहचान और सुधार योजना तैयार करने वाली सहयोगी रिपोर्ट।",
    c_mshtml_t: "MSHTML Exploit", c_mshtml_m: "CVE-2021-40444: Office दस्तावेज़ों में OLE ऑब्जेक्ट MSHTML (Trident) इंजन को कॉल करके रिमोट HTML रेंडर करता है और ActiveX के माध्यम से मनमाना कोड निष्पादित करता है।",
    c_activex_t: "ActiveX नियंत्रण", c_activex_m: "MSHTML द्वारा लोड किए गए रिमोट HTML पेज से ActiveX नियंत्रण इंस्टेंशिएट होकर लोकल फ़ाइल सिस्टम तक पहुँचते हैं और दुर्भावनापूर्ण DLL निष्पादित करते हैं।",
    c_cab_t: "CAB पेलोड", c_cab_m: "हमलावर के रिमोट सर्वर पर होस्ट किया गया CAB (Cabinet) आर्काइव, जिसमें दुर्भावनापूर्ण DLL होता है जो ActiveX के माध्यम से निकाला और निष्पादित किया जाता है।",
    c_follina_t: "Follina MSDT", c_follina_m: "CVE-2022-30190: Word दस्तावेज़ में रिमोट टेम्पलेट ms-msdt: URI स्कीम को कॉल करके MSDT ट्रिगर करता है और PowerShell कोड निष्पादित करता है — zero-day exploit।",
    c_outlook_t: "Outlook NTLM", c_outlook_m: "CVE-2023-23397: विशेष रूप से तैयार किया गया कैलेंडर निमंत्रण ईमेल Outlook में स्वचालित रूप से प्रोसेस होता है, हमलावर के SMB सर्वर को NTLM प्रमाणीकरण हैश लीक करता है।",
    c_zeroday_t: "Zero-Day श्रृंखला", c_zeroday_m: "कई zero-day कमजोरियों को श्रृंखलाबद्ध करके एकल कमजोरी से असंभव पूर्ण सिस्टम नियंत्रण प्राप्त करने की उन्नत हमला तकनीक।",
    c_feed_t: "खतरा फ़ीड", c_feed_m: "STIX/TAXII प्रोटोकॉल के माध्यम से वैश्विक रूप से साझा किया जाने वाला रियल-टाइम खतरा सूचना प्रवाह, जो स्वचालित रूप से IOC, दुर्भावनापूर्ण IP और हैश मान एकत्र करता है।",
    c_ioc_t: "IOC डेटाबेस", c_ioc_m: "Indicators of Compromise — दुर्भावनापूर्ण फ़ाइल हैश, C2 डोमेन, IP पते और रजिस्ट्री कुंजियों को व्यवस्थित रूप से संग्रहित और क्वेरी करने वाला खतरा इंटेलिजेंस DB।",
    c_mitre_t: "MITRE मैपिंग", c_mitre_m: "एकत्रित IOC और हमला व्यवहार को MITRE ATT&CK मैट्रिक्स की Tactics, Techniques और Procedures पर सटीक रूप से मैप करके हमलावर प्रोफ़ाइल बनाना।",
    c_patch_t: "पैच प्रबंधन", c_patch_m: "Zero-day प्रकटीकरण और विक्रेता पैच रिलीज़ के बीच एक्सपोज़र विंडो को न्यूनतम करने के लिए स्वचालित पैच प्रबंधन और वर्चुअल पैचिंग प्रणाली।",
    c_incident_t: "प्रतिक्रिया योजना", c_incident_m: "NIST SP 800-61 आधारित घटना प्रतिक्रिया योजना, जो पहचान, विश्लेषण, रोकथाम, पुनर्प्राप्ति, पश्च-विश्लेषण के 5-चरण प्रक्रिया और RACI मैट्रिक्स को परिभाषित करती है।",
    c_resilience_t: "लचीलापन सुदृढ़ीकरण", c_resilience_m: "साइबर हमलों के बाद भी मुख्य संचालन बनाए रखने के लिए संगठनात्मक साइबर लचीलापन (Cyber Resilience), जिसमें BCP/DRP और टेबलटॉप अभ्यास शामिल हैं।",
    p1_title: "सहयोगी संचालन मॉडल", p1_desc: 'आक्रमण टीम (Red) और रक्षा टीम (Blue) सुरक्षा मजबूत करने के लिए सहयोग करने वाला <b>एकीकृत टीम संचालन मॉडल</b> कौन सा है?', p1_opts: ["Red Team", "Blue Team", "Purple Team", "SOC Team"],
    p2_title: "MSHTML कमजोरी", p2_desc: 'CVE-2021-40444 में शोषित <b>Internet Explorer इंजन घटक</b> कौन सा है?', p2_opts: ["MSHTML", "VBScript", "JScript", "Chakra"],
    p3_title: "Follina डायग्नोस्टिक टूल", p3_desc: 'CVE-2022-30190 (Follina) द्वारा शोषित <b>Windows डायग्नोस्टिक टूल</b> कौन सा है?', p3_opts: ["MSBuild", "MSDT", "MSHTA", "MSIExec"],
    p4_title: "खतरा वर्गीकरण फ्रेमवर्क", p4_desc: 'खतरा इंटेलिजेंस में हमलावरों के व्यवहार को <b>Tactics·Techniques·Procedures (TTP) में वर्गीकृत करने वाला फ्रेमवर्क</b> कौन सा है?', p4_opts: ["NIST CSF", "ISO 27001", "MITRE ATT&CK", "CIS Controls"],
    p5_title: "घटना प्रतिक्रिया पूर्व-सत्यापन", p5_desc: 'वास्तविक तैनाती से पहले संगठन की <b>सुरक्षा घटना प्रतिक्रिया क्षमता को पूर्व-सत्यापित करने वाला अभ्यास</b> कौन सा है?', p5_opts: ["पेनेट्रेशन टेस्टिंग", "टेबलटॉप अभ्यास", "सुरक्षा ऑडिट", "अनुपालन समीक्षा"],
    teamLeader: 'टीम लीडर', agent: 'एजेंट', secRate: 'सुरक्षित', certReport: 'समापन रिपोर्ट',
    analysisReport: 'विश्लेषण रिपोर्ट', freeMode: '(स्वतंत्र अन्वेषण मोड)',
    proceed: 'जारी रखें', next: 'अगला', closeWindow: 'बंद करें', saveData: 'डेटा सहेजें',
    inventory: 'एकत्रित डेटा (Inventory)', noClues: 'अभी तक कोई सुराग एकत्र नहीं हुआ।',
    prevTab: '◀ पिछला', nextTab: 'अगला ▶',
    rTab1: "1. Purple Team संचालन", rTab2: "2. CVE-2021-40444", rTab3: "3. Follina और Outlook",
    rTab4: "4. साइबर खतरा इंटेलिजेंस", rTab5: "5. रणनीतिक सुरक्षा एकीकरण", rTab6: "6. प्रशिक्षण समापन",
    r1_h: "Purple Team संचालन",
    r1_ch1: "Ch 1. Red/Blue Team भूमिका विभाजन",
    r1_ch1_p: '<span class="text-white bg-white/10 px-1 rounded">Red Team</span> वास्तविक APT समूहों के TTP को दोहराकर संगठन की रक्षा पर हमला करती है, <span class="text-white bg-white/10 px-1 rounded">Blue Team</span> SIEM, EDR, NDR का उपयोग करके रियल-टाइम पहचान और प्रतिक्रिया करती है।',
    r1_ch2: "Ch 2. Purple Team सहयोग रिपोर्ट",
    r1_ch2_l1: 'Purple Team Red Team के हमले की सफलता/विफलता परिणामों और Blue Team की पहचान दरों का <span class="text-white bg-white/10 px-1 rounded">एकीकृत विश्लेषण</span> करती है।',
    r1_ch2_l2: 'पहचान अंतरालों की पहचान करती है और सुधार रोडमैप बनाने के लिए MITRE ATT&CK कवरेज को मात्रात्मक रूप से मापती है।',
    r2_h: "CVE-2021-40444 विश्लेषण",
    r2_ch3: "Ch 3. MSHTML कमजोरी तंत्र",
    r2_ch3_p: 'Office दस्तावेज़ों में OLE ऑब्जेक्ट <span class="text-white bg-white/10 px-1 rounded">MSHTML (Trident) इंजन</span> को कॉल करके रिमोट HTML रेंडर करता है और ActiveX नियंत्रणों के माध्यम से स्थानीय सिस्टम पर मनमाना कोड निष्पादित करता है।',
    r2_ch4: "Ch 4. ActiveX शोषण श्रृंखला",
    r2_ch4_l1: "दुर्भावनापूर्ण .docx दस्तावेज़ खोलना (स्पीयरफ़िशिंग अटैचमेंट)", r2_ch4_l2: "MSHTML इंजन रिमोट HTML लोड करता है", r2_ch4_l3: "ActiveX नियंत्रण CAB आर्काइव डाउनलोड करता है", r2_ch4_l4: "CAB से दुर्भावनापूर्ण DLL निकालना और निष्पादित करना",
    r3_h: "Follina और Outlook CVE",
    r3_ch5: "Ch 5. CVE-2022-30190 MSDT शोषण",
    r3_ch5_p: 'Word दस्तावेज़ में रिमोट टेम्पलेट <span class="text-white bg-white/10 px-1 rounded">ms-msdt:</span> URI स्कीम को कॉल करके Microsoft Support Diagnostic Tool ट्रिगर करता है और PowerShell कोड निष्पादित करता है — zero-day हमला।',
    r3_ch6: "Ch 6. CVE-2023-23397 NTLM रिले",
    r3_ch6_l1: 'विशेष रूप से तैयार किया गया कैलेंडर निमंत्रण Outlook में <span class="text-white bg-white/10 px-1 rounded">उपयोगकर्ता इंटरैक्शन के बिना स्वचालित रूप से प्रोसेस</span> होता है।',
    r3_ch6_l2: 'NTLM प्रमाणीकरण हैश हमलावर के SMB सर्वर को लीक हो जाता है, जिससे विशेषाधिकार वृद्धि और पार्श्विक गति संभव होती है।',
    r4_h: "साइबर खतरा इंटेलिजेंस",
    r4_ch7: "Ch 7. IOC संग्रह और साझाकरण",
    r4_ch7_p: '<span class="text-white bg-white/10 px-1 rounded">STIX/TAXII</span> प्रोटोकॉल के माध्यम से IOC (दुर्भावनापूर्ण हैश, C2 डोमेन, IP) स्वचालित रूप से एकत्र करता है और सुरक्षा समुदाय के साथ रियल-टाइम साझा करता है।',
    r4_ch8: "Ch 8. TTP-आधारित हमलावर प्रोफ़ाइलिंग",
    r4_ch8_l1: 'एकत्रित IOC को <span class="text-white bg-white/10 px-1 rounded">MITRE ATT&CK</span> मैट्रिक्स पर मैप करके हमलावरों की tactics, techniques और procedures का वर्गीकरण करता है।',
    r4_ch8_l2: 'Diamond Model और Kill Chain विश्लेषण को जोड़कर APT समूह के व्यवहार प्रोफ़ाइल बनाता है।',
    r5_h: "रणनीतिक सुरक्षा एकीकरण",
    r5_ch9: "Ch 9. Zero-Day प्रतिक्रिया रणनीति",
    r5_ch9_p: 'विक्रेता पैच रिलीज़ से पहले <span class="text-white bg-white/10 px-1 rounded">वर्चुअल पैचिंग (Virtual Patching)</span> और माइक्रोसेगमेंटेशन लागू करके एक्सपोज़र विंडो को न्यूनतम करता है।',
    r5_ch10: "Ch 10. संगठनात्मक साइबर लचीलापन",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">टेबलटॉप अभ्यास</span> के माध्यम से घटना प्रतिक्रिया प्रक्रियाओं को पूर्व-सत्यापित करता है और RACI मैट्रिक्स की समीक्षा करता है।',
    r5_ch10_l2: 'साइबर हमलों के बाद भी व्यवसाय निरंतरता सुनिश्चित करने के लिए BCP/DRP ढांचा स्थापित करता है।',
    r6_complete: "प्रशिक्षण समापन पूर्ण!",
    r6_desc: "Purple Team संचालन से CVE विश्लेषण,<br/>CTI प्रणाली और संगठनात्मक लचीलेपन तक —<br/>आपने Expert पाठ्यक्रम उत्कृष्ट रूप से पूरा किया।",
    r6_grade: "अंतिम ग्रेड:", r6_labBtn: "प्रयोगशाला में जाएं 🚀",
    r6_freeHint: "(इस विंडो को बंद करें और प्रत्येक सेक्टर को स्वतंत्र रूप से पुनः खोजें)",
  },
};

const getT = (lang) => T[lang] || T.ko;

// ──────────────────────────────────────────────────────────────────────────────
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Expert)
// ──────────────────────────────────────────────────────────────────────────────
const buildCHAPTERS = (t) => [
  { scene: 'scene_phase1', loc: t.loc1, dialogues: [{ speaker: 'TEAM_LEADER', text: t.d1_1 }, { speaker: 'AGENT_NAME', text: t.d1_2 }, { speaker: 'TEAM_LEADER', text: t.d1_3 }], hint: t.h1 },
  { scene: 'scene_phase1', loc: t.loc1, dialogues: [{ speaker: 'AGENT_NAME', text: t.d2_1 }, { speaker: 'TEAM_LEADER', text: t.d2_2 }], triggerPuzzle: 1 },
  { scene: 'scene_phase2', loc: t.loc2, dialogues: [{ speaker: 'TEAM_LEADER', text: t.d3_1 }, { speaker: 'AGENT_NAME', text: t.d3_2 }, { speaker: 'TEAM_LEADER', text: t.d3_3 }], hint: t.h2 },
  { scene: 'scene_phase2', loc: t.loc2, dialogues: [{ speaker: 'AGENT_NAME', text: t.d4_1 }, { speaker: 'TEAM_LEADER', text: t.d4_2 }], triggerPuzzle: 2 },
  { scene: 'scene_phase3', loc: t.loc3, dialogues: [{ speaker: 'TEAM_LEADER', text: t.d5_1 }, { speaker: 'AGENT_NAME', text: t.d5_2 }, { speaker: 'TEAM_LEADER', text: t.d5_3 }], hint: t.h3 },
  { scene: 'scene_phase3', loc: t.loc3, dialogues: [{ speaker: 'AGENT_NAME', text: t.d6_1 }, { speaker: 'TEAM_LEADER', text: t.d6_2 }], triggerPuzzle: 3 },
  { scene: 'scene_phase4', loc: t.loc4, dialogues: [{ speaker: 'TEAM_LEADER', text: t.d7_1 }, { speaker: 'AGENT_NAME', text: t.d7_2 }, { speaker: 'TEAM_LEADER', text: t.d7_3 }], hint: t.h4 },
  { scene: 'scene_phase4', loc: t.loc4, dialogues: [{ speaker: 'AGENT_NAME', text: t.d8_1 }, { speaker: 'TEAM_LEADER', text: t.d8_2 }], triggerPuzzle: 4 },
  { scene: 'scene_phase5', loc: t.loc5, dialogues: [{ speaker: 'AGENT_NAME', text: t.d9_1 }, { speaker: 'TEAM_LEADER', text: t.d9_2 }], hint: t.h5 },
  { scene: 'scene_phase5', loc: t.loc5, dialogues: [{ speaker: 'AGENT_NAME', text: t.d10_1 }, { speaker: 'TEAM_LEADER', text: t.d10_2 }], triggerPuzzle: 5 },
  { scene: 'scene_phase5', loc: t.loc5, dialogues: [{ speaker: 'AGENT_NAME', text: t.d11_1 }, { speaker: 'TEAM_LEADER', text: t.d11_2 }], triggerBook: true },
];

const buildCLUES_DATA = (t) => ({
  scene_phase1: [
    { id: 'red_team',      icon: Crosshair, title: t.c_red_t,      msg: t.c_red_m },
    { id: 'blue_team',     icon: Shield,    title: t.c_blue_t,     msg: t.c_blue_m },
    { id: 'purple_report', icon: FileText,  title: t.c_purple_t,   msg: t.c_purple_m },
  ],
  scene_phase2: [
    { id: 'mshtml_exploit',  icon: Bug,     title: t.c_mshtml_t,   msg: t.c_mshtml_m },
    { id: 'activex_control', icon: Code,    title: t.c_activex_t,  msg: t.c_activex_m },
    { id: 'cab_payload',     icon: Package, title: t.c_cab_t,      msg: t.c_cab_m },
  ],
  scene_phase3: [
    { id: 'follina_msdt',  icon: Terminal, title: t.c_follina_t,  msg: t.c_follina_m },
    { id: 'outlook_ntlm',  icon: Key,      title: t.c_outlook_t,  msg: t.c_outlook_m },
    { id: 'zero_day_chain', icon: Link,     title: t.c_zeroday_t,  msg: t.c_zeroday_m },
  ],
  scene_phase4: [
    { id: 'threat_feed',   icon: Rss,      title: t.c_feed_t,     msg: t.c_feed_m },
    { id: 'ioc_database',  icon: Database, title: t.c_ioc_t,      msg: t.c_ioc_m },
    { id: 'mitre_mapping',  icon: Map,      title: t.c_mitre_t,    msg: t.c_mitre_m },
  ],
  scene_phase5: [
    { id: 'patch_mgmt',    icon: RefreshCw,   title: t.c_patch_t,    msg: t.c_patch_m },
    { id: 'incident_plan', icon: Clipboard,   title: t.c_incident_t, msg: t.c_incident_m },
    { id: 'resilience',    icon: ShieldCheck, title: t.c_resilience_t, msg: t.c_resilience_m },
  ],
});

const buildPUZZLES = (t) => ({
  1: { title: t.p1_title, desc: t.p1_desc, options: t.p1_opts, answer: 2 },
  2: { title: t.p2_title, desc: t.p2_desc, options: t.p2_opts, answer: 0 },
  3: { title: t.p3_title, desc: t.p3_desc, options: t.p3_opts, answer: 1 },
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
      {generateClueItem('red_team',      0, Crosshair, "#FF3333", t.c_red_t)}
      {generateClueItem('blue_team',     1, Shield,    "#00E5FF", t.c_blue_t)}
      {generateClueItem('purple_report', 2, FileText,  "#DFB8B6", t.c_purple_t)}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('mshtml_exploit',  0, Bug,     "#FF6B6B", t.c_mshtml_t)}
      {generateClueItem('activex_control', 1, Code,    "#00E5FF", t.c_activex_t)}
      {generateClueItem('cab_payload',     2, Package, "#DFB8B6", t.c_cab_t)}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('follina_msdt',   0, Terminal, "#FF3333", t.c_follina_t)}
      {generateClueItem('outlook_ntlm',   1, Key,      "#DFB8B6", t.c_outlook_t)}
      {generateClueItem('zero_day_chain', 2, Link,     "#10B981", t.c_zeroday_t)}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('threat_feed',   0, Rss,      "#FF6B6B", t.c_feed_t)}
      {generateClueItem('ioc_database',  1, Database, "#00E5FF", t.c_ioc_t)}
      {generateClueItem('mitre_mapping', 2, Map,      "#10B981", t.c_mitre_t)}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('patch_mgmt',    0, RefreshCw,   "#00E5FF", t.c_patch_t)}
      {generateClueItem('incident_plan', 1, Clipboard,   "#DFB8B6", t.c_incident_t)}
      {generateClueItem('resilience',    2, ShieldCheck, "#10B981", t.c_resilience_t)}
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
                              <ol className="list-decimal pl-5 space-y-2 text-[#DFB8B6] font-bold">
                                <li>{t.r2_ch4_l1}</li>
                                <li>{t.r2_ch4_l2}</li>
                                <li>{t.r2_ch4_l3}</li>
                                <li>{t.r2_ch4_l4}</li>
                              </ol>
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
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r3_ch6_l1 }} />
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
                              <p dangerouslySetInnerHTML={{ __html: t.r4_ch7_p }} />
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r4_ch8}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch8_l1 }} />
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
                              <p dangerouslySetInnerHTML={{ __html: t.r5_ch9_p }} />
                            </div>
                            <div>
                              <strong className="text-[#00E5FF] text-xl block mb-2">{t.r5_ch10}</strong>
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r5_ch10_l1 }} />
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
                          <h1 className="text-2xl md:text-3xl text-[#DFB8B6] font-black mb-3 drop-shadow-[0_0_15px_rgba(223,184,182,0.4)]">{t.r6_complete}</h1>
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

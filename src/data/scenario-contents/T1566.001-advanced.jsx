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
// [다국어 텍스트] — lang prop 기반 분기
// ──────────────────────────────────────────────────────────────────────────────
const T = {
  ko: {
    // CHAPTERS locations
    loc1: 'Sector 1: EDR 전장', loc2: 'Sector 2: AMSI 분석실', loc3: 'Sector 3: LOLBins 무기고', loc4: 'Sector 4: 탐지공학 연구소', loc5: 'Sector 5: 위협 사냥터',
    // CHAPTERS dialogues
    d1_1: "어험! {AGENT} 요원, 이번 임무는 고급 과정이다. 스피어피싱 첨부파일이 EDR을 우회하는 기법을 분석해야 한다.",
    d1_2: "네, 팀장님! EDR이 프로세스 행위를 감시하고 있지만, 공격자들은 프로세스 인젝션과 DLL 사이드로딩으로 탐지를 피하고 있습니다.",
    d1_3: "좋다. 놈들은 정상 프로세스에 악성 코드를 주입하거나, NTDLL 후킹을 해제해서 EDR의 눈을 피하지. 현장의 단서를 수집해라!",
    d2_1: "찾았습니다! 공격자가 svchost.exe에 셸코드를 인젝션하고, EDR 후킹을 해제하여 API 호출을 은폐하고 있었습니다.",
    d2_2: "잘했다. 정상 프로세스의 메모리를 악용하는 이 기법의 정확한 명칭을 대답해 보아라.",
    d3_1: "스피어피싱으로 전달된 매크로나 PowerShell 페이로드는 Windows AMSI의 검사를 받게 되지. 하지만 놈들은 이것마저 무력화한다.",
    d3_2: "AMSI 스캔 인터페이스가 보입니다! 그런데 공격자가 메모리 패칭으로 AmsiScanBuffer 함수를 변조하고 있어요!",
    d3_3: "그래, 난독화까지 결합하면 스크립트 기반 탐지가 거의 불가능해지지. AMSI 구역의 증거를 확보해라!",
    d4_1: "증거 확보 완료! AMSI를 우회하는 메모리 패칭 기법과 Base64+XOR 다중 난독화 레이어를 모두 식별했습니다.",
    d4_2: "훌륭하다. Windows의 스크립트 보안 검사 인터페이스를 우회하는 이 공격의 명칭을 말해 보아라.",
    d5_1: "스피어피싱 첨부파일의 진짜 무서운 점은 외부 도구 없이도 시스템에 이미 있는 정상 바이너리를 악용한다는 거다.",
    d5_2: "certutil로 악성 페이로드를 다운로드하고, mshta로 HTA 스크립트를 실행하고, rundll32로 DLL을 프록시 실행하고 있어요!",
    d5_3: "이것이 Living off the Land 전략이다. 정상 서명된 Microsoft 바이너리라 백신이 차단하기 어렵지. 무기고를 조사해라!",
    d6_1: "무기고 분석 완료! 공격자는 certutil -urlcache, mshta javascript:, rundll32 DllRegisterServer 등 정상 바이너리 체인을 구성하고 있었습니다.",
    d6_2: "맞다. 시스템에 이미 설치된 정상 바이너리를 악용하는 이 공격 기법의 통칭을 대답해라.",
    d7_1: "공격 기법을 알았으니, 이제 방어자의 관점으로 전환하자. Detection Engineering은 탐지 룰의 전체 생명주기를 관리하는 분야다.",
    d7_2: "Sigma/YARA 룰 작성부터 오탐(False Positive) 분석, 룰 배포와 유지보수까지 체계적으로 관리되고 있군요!",
    d7_3: "탐지 룰 하나가 실전에 배포되기까지의 과정을 이해해야 진정한 방어자가 될 수 있다. 연구소의 단서를 수집해라!",
    d8_1: "연구소 조사 완료! Sigma 룰 작성 → 테스트 환경 검증 → 프로덕션 배포 → 오탐 피드백 반영의 전체 사이클을 확인했습니다.",
    d8_2: "훌륭하다. 탐지 룰의 생성부터 유지보수까지 전체 과정을 관리하는 이 분야의 정확한 명칭을 말해라.",
    d9_1: "마지막 구역이다. Threat Hunting은 알려진 시그니처에 의존하지 않고, 가설을 세워 능동적으로 위협을 찾아내는 고급 보안 활동이다.",
    d9_2: "가설 기반으로 IOC 스윕을 수행하고, ATT&CK TTP에 매핑하여 공격 패턴을 추적하는 프로세스가 보입니다!",
    d9_3: "그래, 스피어피싱 첨부파일 공격에 대한 사냥 가설을 세우고 체계적으로 추적하는 방법을 익혀라. 사냥터의 단서를 모아라!",
    d10_1: "사냥 완료! '비정상 자식 프로세스 생성' 가설로 Outlook→cmd→PowerShell 체인을 추적하고, T1566.001에 TTP 매핑했습니다.",
    d10_2: "완벽하다. 가설을 세우고 능동적으로 위협을 찾아내는 이 보안 활동의 정확한 명칭을 최종 답변해라.",
    d11_1: "이제 EDR 우회부터 Threat Hunting까지, 고급 스피어피싱 공격의 전체 공방을 완벽히 이해했습니다!",
    d11_2: "수고했다, {AGENT}. 오늘 학습한 내용들을 최종 사건 수첩에 도장 찍어 두었으니 꼼꼼히 복습하도록.",
    // hints
    h1: "프로세스 인젝션 주사기, DLL 패키지, <br>그리고 NTDLL 언후킹 잠금해제 단서를 찾아라.",
    h2: "AMSI 스캐너 방패, 메모리 패칭 CPU, <br>그리고 난독화 기법의 눈 아이콘을 찾아라.",
    h3: "certutil 다운로드, mshta 실행 플레이어, <br>그리고 rundll32 프록시 순환 아이콘을 찾아라.",
    h4: "탐지 룰 코드 파일, 오탐 경고 삼각형, <br>그리고 룰 생명주기 순환 아이콘을 찾아라.",
    h5: "사냥 가설 돋보기, IOC 스윕 레이더, <br>그리고 TTP 매핑 지도를 찾아라.",
    // clues
    c_proc_inject_t: "프로세스 인젝션", c_proc_inject_m: "정상 프로세스(svchost.exe, explorer.exe)의 메모리 공간에 악성 셸코드를 삽입하여, EDR이 정상 프로세스로 오인하게 만드는 기법입니다.",
    c_dll_sideload_t: "DLL 사이드로딩", c_dll_sideload_m: "정상 애플리케이션이 로딩하는 DLL을 악성 DLL로 교체하여, 서명된 프로세스 컨텍스트에서 악성 코드를 실행하는 기법입니다.",
    c_unhook_ntdll_t: "NTDLL 언후킹", c_unhook_ntdll_m: "EDR이 ntdll.dll에 설치한 후킹(감시 코드)을 제거하여, 시스템 콜 모니터링을 무력화하고 API 호출을 은폐하는 기법입니다.",
    c_amsi_scan_t: "AMSI 스캐너", c_amsi_scan_m: "Windows Anti-Malware Scan Interface. PowerShell, VBScript 등 스크립트 실행 전 보안 제품에 콘텐츠를 전달하여 악성 여부를 검사합니다.",
    c_mem_patch_t: "메모리 패칭", c_mem_patch_m: "AmsiScanBuffer 함수의 메모리를 직접 수정하여 항상 'AMSI_RESULT_CLEAN'을 반환하게 만드는 바이패스 기법입니다.",
    c_obfuscation_t: "난독화 기법", c_obfuscation_m: "Base64 인코딩, XOR 암호화, 문자열 분할, 변수명 치환 등을 다중으로 적용하여 시그니처 기반 탐지를 회피하는 기법입니다.",
    c_certutil_dl_t: "certutil 다운로드", c_certutil_dl_m: "인증서 관리 도구인 certutil.exe의 -urlcache 옵션을 악용하여 외부에서 악성 페이로드를 다운로드하는 LOLBin 기법입니다.",
    c_mshta_exec_t: "mshta 실행", c_mshta_exec_m: "Microsoft HTML Application Host(mshta.exe)를 이용해 HTA 파일이나 인라인 JavaScript/VBScript를 실행하는 기법입니다.",
    c_rundll32_proxy_t: "rundll32 프록시", c_rundll32_proxy_m: "rundll32.exe를 프록시로 사용하여 악성 DLL의 특정 export 함수를 실행하거나, JavaScript를 실행하는 기법입니다.",
    c_detection_rule_t: "탐지 룰", c_detection_rule_m: "Sigma, YARA, Snort 등의 형식으로 작성된 탐지 규칙. 특정 공격 행위의 패턴을 정의하여 자동으로 탐지하고 경보를 발생시킵니다.",
    c_false_positive_t: "오탐 분석", c_false_positive_m: "탐지 룰이 정상 행위를 공격으로 잘못 판단하는 False Positive를 분석하고, 룰의 정밀도를 향상시키는 튜닝 과정입니다.",
    c_rule_lifecycle_t: "룰 생명주기", c_rule_lifecycle_m: "탐지 룰의 작성→테스트→배포→모니터링→피드백→개선의 전체 순환 과정을 체계적으로 관리하는 Detection Engineering의 핵심입니다.",
    c_hunt_hypothesis_t: "사냥 가설", c_hunt_hypothesis_m: "Threat Hunting의 출발점. '스피어피싱 첨부파일로 인한 비정상 자식 프로세스가 존재할 것이다'와 같은 가설을 수립합니다.",
    c_ioc_sweep_t: "IOC 스윕", c_ioc_sweep_m: "Indicator of Compromise(침해 지표)를 기반으로 로그, 네트워크 트래픽, 엔드포인트를 스윕하여 악성 활동의 흔적을 탐색합니다.",
    c_ttp_mapping_t: "TTP 매핑", c_ttp_mapping_m: "발견된 공격 행위를 MITRE ATT&CK의 Tactics, Techniques, Procedures에 매핑하여 공격자의 전술 패턴을 체계적으로 분석합니다.",
    // puzzles
    p1_title: "EDR 우회의 핵심", p1_desc: "정상 프로세스의 메모리 공간에 <b>악성 코드를 삽입</b>하여 EDR의 탐지를 회피하는 기법은?",
    p1_opts: ["프로세스 인젝션", "DLL 하이재킹", "코드 서명", "레지스트리 수정"],
    p2_title: "스크립트 보안의 벽", p2_desc: "Windows의 <b>스크립트 보안 검사 인터페이스</b>를 우회하여 악성 PowerShell/VBScript를 탐지 없이 실행하는 공격은?",
    p2_opts: ["UAC 바이패스", "커널 익스플로잇", "AMSI 바이패스", "방화벽 우회"],
    p3_title: "내부의 적", p3_desc: "별도의 악성 도구 설치 없이, <b>시스템에 이미 설치된 정상 바이너리</b>(certutil, mshta, rundll32 등)를 악용하는 공격 기법의 통칭은?",
    p3_opts: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    p4_title: "방어의 과학", p4_desc: "탐지 룰의 <b>생성 → 테스트 → 배포 → 유지보수</b> 전체 과정을 체계적으로 관리하는 보안 분야는?",
    p4_opts: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    p5_title: "능동적 추적자", p5_desc: "<b>가설을 세우고 능동적으로</b> 알려지지 않은 위협을 찾아내는 고급 보안 활동은?",
    p5_opts: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    // UI
    teamLeader: '팀장', agent: '요원', secRate: '확보율', certReport: '수료 보고서',
    analysisReport: '분석 리포트', freeMode: '(자유 탐색 모드)',
    proceed: '진행', next: '다음', closeWindow: '창 닫기', saveData: '데이터 저장하기',
    inventory: '수집 데이터 (Inventory)', noClues: '아직 수집된 단서가 없습니다.',
    prevTab: '◀ 이전', nextTab: '다음 ▶',
    // report tabs
    rTab1: "1. EDR 우회와 인젝션", rTab2: "2. AMSI와 메모리 공격", rTab3: "3. LOLBins 악용",
    rTab4: "4. Detection Engineering", rTab5: "5. Threat Hunting", rTab6: "6. 최종 훈련 수료",
    // report content
    r1_h: "EDR 우회와 프로세스 인젝션",
    r1_ch1: "Ch 1. 프로세스 인젝션 기법들",
    r1_ch1_l1: '정상 프로세스(svchost.exe, explorer.exe)의 메모리에 <span class="text-white bg-white/10 px-1 rounded">셸코드를 주입</span>하여 EDR 탐지를 우회합니다.',
    r1_ch1_l2: "Classic Injection, Process Hollowing, APC Injection 등 다양한 변종이 존재합니다.",
    r1_ch2: "Ch 2. DLL 사이드로딩과 NTDLL 언후킹",
    r1_ch2_l1: '정상 애플리케이션의 DLL 로딩 순서를 악용하여 <span class="text-white bg-white/10 px-1 rounded">악성 DLL을 대신 로드</span>시킵니다.',
    r1_ch2_l2: "EDR이 ntdll.dll에 설치한 후킹을 제거하여 시스템 콜 모니터링을 무력화합니다.",
    r2_h: "AMSI와 메모리 공격",
    r2_ch3: "Ch 3. AMSI 구조와 동작 원리",
    r2_ch3_p: 'Windows <span class="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span>는 PowerShell, VBScript 등의 스크립트 실행 전 보안 제품에 콘텐츠를 전달하는 인터페이스입니다.',
    r2_ch4: "Ch 4. AMSI 바이패스 기법",
    r2_ch4_l1: 'AmsiScanBuffer 함수의 <span class="text-white bg-white/10 px-1 rounded">메모리를 직접 패칭</span>하여 항상 CLEAN 결과를 반환하게 만듭니다.',
    r2_ch4_l2: "Base64, XOR, 문자열 분할 등 다중 난독화를 결합하여 시그니처 탐지를 회피합니다.",
    r3_h: "LOLBins 악용",
    r3_ch5: "Ch 5. certutil과 mshta",
    r3_ch5_l1: '<span class="text-white bg-white/10 px-1 rounded">certutil -urlcache</span>로 외부 악성 페이로드를 다운로드합니다.',
    r3_ch5_l2: "mshta.exe로 HTA 파일이나 인라인 JavaScript를 실행하여 초기 코드를 구동합니다.",
    r3_ch6: "Ch 6. Living off the Land 전략",
    r3_ch6_l1: '<span class="text-white bg-white/10 px-1 rounded">rundll32.exe</span>를 프록시로 사용하여 악성 DLL의 export 함수를 실행합니다.',
    r3_ch6_l2: "모든 LOLBin은 Microsoft 서명 바이너리이므로, 전통적 백신의 화이트리스트를 악용합니다.",
    r4_h: "Detection Engineering",
    r4_ch7: "Ch 7. 탐지 룰 작성",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">Sigma, YARA, Snort</span> 등의 형식으로 공격 행위 패턴을 정의합니다.',
    r4_ch7_l2: "ATT&CK TTP 기반으로 탐지 커버리지를 체계적으로 매핑합니다.",
    r4_ch8: "Ch 8. 오탐 관리와 룰 튜닝",
    r4_ch8_l1: 'False Positive를 분석하고 <span class="text-white bg-white/10 px-1 rounded">룰의 정밀도를 향상</span>시키는 반복적 튜닝 과정을 수행합니다.',
    r4_ch8_l2: "룰 생명주기: 작성 → 테스트 → 배포 → 모니터링 → 피드백 → 개선의 순환을 관리합니다.",
    r5_h: "Threat Hunting",
    r5_ch9: "Ch 9. 가설 기반 위협 사냥",
    r5_ch9_p: '\'비정상 자식 프로세스 생성이 존재할 것이다\'와 같은 <span class="text-white bg-white/10 px-1 rounded">가설을 수립</span>하고, 로그와 텔레메트리를 분석하여 능동적으로 위협을 추적합니다.',
    r5_ch10: "Ch 10. IOC 스윕과 TTP 매핑",
    r5_ch10_l1: 'IOC(침해 지표)를 기반으로 엔드포인트, 네트워크, 로그를 <span class="text-white bg-white/10 px-1 rounded">체계적으로 스윕</span>합니다.',
    r5_ch10_l2: "발견된 공격 행위를 MITRE ATT&CK에 매핑하여 공격자의 전술 패턴을 분석합니다.",
    r6_title: "훈련 수료 완료!",
    r6_desc: "EDR 우회부터 Threat Hunting까지,<br/>고급 스피어피싱 공방 과정을<br/>모두 훌륭히 마쳤습니다.",
    r6_grade: "최종 등급:",
    r6_labBtn: "실습 랩으로 이동하기",
    r6_freeHint: "(창을 닫으면 각 구역을 자유롭게 재탐색할 수 있습니다)",
  },
  en: {
    loc1: 'Sector 1: EDR Battlefield', loc2: 'Sector 2: AMSI Analysis Lab', loc3: 'Sector 3: LOLBins Arsenal', loc4: 'Sector 4: Detection Engineering Lab', loc5: 'Sector 5: Threat Hunting Ground',
    d1_1: "Ahem! Agent {AGENT}, this mission is an advanced course. We need to analyze techniques where spearphishing attachments bypass EDR.",
    d1_2: "Yes, sir! EDR is monitoring process behavior, but attackers are evading detection through process injection and DLL sideloading.",
    d1_3: "Good. They inject malicious code into legitimate processes or unhook NTDLL to evade EDR's eyes. Collect clues from the scene!",
    d2_1: "Found it! The attacker was injecting shellcode into svchost.exe and unhooking EDR to conceal API calls.",
    d2_2: "Well done. Tell me the exact name of this technique that exploits legitimate process memory.",
    d3_1: "Macros and PowerShell payloads delivered via spearphishing are scanned by Windows AMSI. But they even neutralize that.",
    d3_2: "I can see the AMSI scan interface! But the attacker is tampering with the AmsiScanBuffer function through memory patching!",
    d3_3: "Yes, combined with obfuscation, script-based detection becomes nearly impossible. Secure evidence from the AMSI zone!",
    d4_1: "Evidence secured! I've identified both the memory patching technique that bypasses AMSI and the multi-layer Base64+XOR obfuscation.",
    d4_2: "Excellent. Tell me the name of this attack that bypasses Windows' script security scan interface.",
    d5_1: "The truly scary thing about spearphishing attachments is that they abuse legitimate binaries already on the system without installing external tools.",
    d5_2: "They're downloading malicious payloads with certutil, executing HTA scripts with mshta, and proxy-executing DLLs with rundll32!",
    d5_3: "This is the Living off the Land strategy. Since they're Microsoft-signed binaries, antivirus has trouble blocking them. Investigate the arsenal!",
    d6_1: "Arsenal analysis complete! The attacker was chaining legitimate binaries: certutil -urlcache, mshta javascript:, rundll32 DllRegisterServer.",
    d6_2: "Correct. Tell me the common name for this attack technique that abuses legitimate binaries already installed on the system.",
    d7_1: "Now that we know the attack techniques, let's switch to the defender's perspective. Detection Engineering manages the entire lifecycle of detection rules.",
    d7_2: "From writing Sigma/YARA rules to false positive analysis, rule deployment and maintenance — it's all systematically managed!",
    d7_3: "You must understand the process of deploying a single detection rule to production to become a true defender. Collect clues from the lab!",
    d8_1: "Lab investigation complete! I've confirmed the full cycle: Sigma rule creation, test environment validation, production deployment, and false positive feedback integration.",
    d8_2: "Excellent. Tell me the exact name of this discipline that manages the entire process from rule creation to maintenance.",
    d9_1: "Final zone. Threat Hunting is an advanced security activity that proactively finds threats by forming hypotheses rather than relying on known signatures.",
    d9_2: "I can see the process of performing IOC sweeps based on hypotheses and tracking attack patterns by mapping to ATT&CK TTPs!",
    d9_3: "Yes, learn how to form hunting hypotheses for spearphishing attachment attacks and systematically track them. Gather clues from the hunting ground!",
    d10_1: "Hunt complete! I tracked the Outlook to cmd to PowerShell chain using the 'abnormal child process creation' hypothesis and mapped it to T1566.001 TTPs.",
    d10_2: "Perfect. Give me the final answer: the exact name of this security activity that forms hypotheses and proactively finds threats.",
    d11_1: "I now fully understand the entire attack and defense of advanced spearphishing, from EDR evasion to Threat Hunting!",
    d11_2: "Well done, {AGENT}. I've stamped your final case notebook with today's training content. Review it thoroughly.",
    h1: "Find the process injection syringe, DLL package, <br>and the NTDLL unhooking unlock clue.",
    h2: "Find the AMSI scanner shield, memory patching CPU, <br>and the obfuscation eye icon.",
    h3: "Find the certutil download, mshta execution player, <br>and the rundll32 proxy rotation icon.",
    h4: "Find the detection rule code file, false positive warning triangle, <br>and the rule lifecycle rotation icon.",
    h5: "Find the hunting hypothesis magnifier, IOC sweep radar, <br>and the TTP mapping map.",
    c_proc_inject_t: "Process Injection", c_proc_inject_m: "A technique that inserts malicious shellcode into the memory space of legitimate processes (svchost.exe, explorer.exe), causing EDR to mistake them for normal processes.",
    c_dll_sideload_t: "DLL Sideloading", c_dll_sideload_m: "A technique that replaces DLLs loaded by legitimate applications with malicious ones, executing malicious code in the context of a signed process.",
    c_unhook_ntdll_t: "NTDLL Unhooking", c_unhook_ntdll_m: "A technique that removes hooks (monitoring code) installed by EDR on ntdll.dll, disabling syscall monitoring and concealing API calls.",
    c_amsi_scan_t: "AMSI Scanner", c_amsi_scan_m: "Windows Anti-Malware Scan Interface. Passes script content (PowerShell, VBScript, etc.) to security products for malware inspection before execution.",
    c_mem_patch_t: "Memory Patching", c_mem_patch_m: "A bypass technique that directly modifies the memory of the AmsiScanBuffer function to always return 'AMSI_RESULT_CLEAN'.",
    c_obfuscation_t: "Obfuscation Techniques", c_obfuscation_m: "Applies multiple layers of Base64 encoding, XOR encryption, string splitting, and variable name substitution to evade signature-based detection.",
    c_certutil_dl_t: "certutil Download", c_certutil_dl_m: "A LOLBin technique that abuses the -urlcache option of the certificate management tool certutil.exe to download malicious payloads from external sources.",
    c_mshta_exec_t: "mshta Execution", c_mshta_exec_m: "A technique using Microsoft HTML Application Host (mshta.exe) to execute HTA files or inline JavaScript/VBScript.",
    c_rundll32_proxy_t: "rundll32 Proxy", c_rundll32_proxy_m: "A technique using rundll32.exe as a proxy to execute specific export functions of malicious DLLs or run JavaScript.",
    c_detection_rule_t: "Detection Rules", c_detection_rule_m: "Detection rules written in formats like Sigma, YARA, and Snort. Defines patterns of specific attack behaviors for automatic detection and alerting.",
    c_false_positive_t: "False Positive Analysis", c_false_positive_m: "The tuning process of analyzing false positives where detection rules incorrectly flag normal behavior as attacks, improving rule precision.",
    c_rule_lifecycle_t: "Rule Lifecycle", c_rule_lifecycle_m: "The core of Detection Engineering: systematically managing the entire cycle of rule creation, testing, deployment, monitoring, feedback, and improvement.",
    c_hunt_hypothesis_t: "Hunting Hypothesis", c_hunt_hypothesis_m: "The starting point of Threat Hunting. Formulates hypotheses like 'abnormal child processes from spearphishing attachments should exist.'",
    c_ioc_sweep_t: "IOC Sweep", c_ioc_sweep_m: "Sweeps logs, network traffic, and endpoints based on Indicators of Compromise (IOC) to search for traces of malicious activity.",
    c_ttp_mapping_t: "TTP Mapping", c_ttp_mapping_m: "Maps discovered attack behaviors to MITRE ATT&CK Tactics, Techniques, and Procedures to systematically analyze attacker tactical patterns.",
    p1_title: "Key to EDR Evasion", p1_desc: "Which technique evades EDR detection by <b>inserting malicious code</b> into the memory space of legitimate processes?",
    p1_opts: ["Process Injection", "DLL Hijacking", "Code Signing", "Registry Modification"],
    p2_title: "The Script Security Wall", p2_desc: "Which attack bypasses Windows' <b>script security scan interface</b> to execute malicious PowerShell/VBScript without detection?",
    p2_opts: ["UAC Bypass", "Kernel Exploit", "AMSI Bypass", "Firewall Evasion"],
    p3_title: "The Enemy Within", p3_desc: "What is the common name for attack techniques that abuse <b>legitimate binaries already installed</b> on the system (certutil, mshta, rundll32, etc.) without installing additional malicious tools?",
    p3_opts: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    p4_title: "The Science of Defense", p4_desc: "Which security discipline systematically manages the entire process of detection rule <b>creation, testing, deployment, and maintenance</b>?",
    p4_opts: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    p5_title: "The Proactive Tracker", p5_desc: "Which advanced security activity <b>forms hypotheses and proactively</b> finds unknown threats?",
    p5_opts: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    teamLeader: 'Leader', agent: 'Agent', secRate: 'Secured', certReport: 'Completion Report',
    analysisReport: 'Analysis Report', freeMode: '(Free Exploration Mode)',
    proceed: 'Continue', next: 'Next', closeWindow: 'Close', saveData: 'Save Data',
    inventory: 'Collected Data (Inventory)', noClues: 'No clues collected yet.',
    prevTab: '◀ Prev', nextTab: 'Next ▶',
    rTab1: "1. EDR Evasion & Injection", rTab2: "2. AMSI & Memory Attacks", rTab3: "3. LOLBins Abuse",
    rTab4: "4. Detection Engineering", rTab5: "5. Threat Hunting", rTab6: "6. Training Complete",
    r1_h: "EDR Evasion & Process Injection",
    r1_ch1: "Ch 1. Process Injection Techniques",
    r1_ch1_l1: 'Bypasses EDR detection by <span class="text-white bg-white/10 px-1 rounded">injecting shellcode</span> into the memory of legitimate processes (svchost.exe, explorer.exe).',
    r1_ch1_l2: "Various variants exist including Classic Injection, Process Hollowing, and APC Injection.",
    r1_ch2: "Ch 2. DLL Sideloading & NTDLL Unhooking",
    r1_ch2_l1: 'Exploits the DLL loading order of legitimate applications to <span class="text-white bg-white/10 px-1 rounded">load malicious DLLs instead</span>.',
    r1_ch2_l2: "Removes hooks installed by EDR on ntdll.dll to disable syscall monitoring.",
    r2_h: "AMSI & Memory Attacks",
    r2_ch3: "Ch 3. AMSI Architecture & Operation",
    r2_ch3_p: 'Windows <span class="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span> is an interface that passes content to security products before executing scripts like PowerShell and VBScript.',
    r2_ch4: "Ch 4. AMSI Bypass Techniques",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">Directly patches the memory</span> of the AmsiScanBuffer function to always return CLEAN results.',
    r2_ch4_l2: "Combines multiple obfuscation layers like Base64, XOR, and string splitting to evade signature detection.",
    r3_h: "LOLBins Abuse",
    r3_ch5: "Ch 5. certutil & mshta",
    r3_ch5_l1: 'Downloads external malicious payloads using <span class="text-white bg-white/10 px-1 rounded">certutil -urlcache</span>.',
    r3_ch5_l2: "Executes HTA files or inline JavaScript via mshta.exe to run initial code.",
    r3_ch6: "Ch 6. Living off the Land Strategy",
    r3_ch6_l1: 'Uses <span class="text-white bg-white/10 px-1 rounded">rundll32.exe</span> as a proxy to execute export functions of malicious DLLs.',
    r3_ch6_l2: "All LOLBins are Microsoft-signed binaries, exploiting traditional antivirus whitelisting.",
    r4_h: "Detection Engineering",
    r4_ch7: "Ch 7. Detection Rule Authoring",
    r4_ch7_l1: 'Defines attack behavior patterns in formats like <span class="text-white bg-white/10 px-1 rounded">Sigma, YARA, Snort</span>.',
    r4_ch7_l2: "Systematically maps detection coverage based on ATT&CK TTPs.",
    r4_ch8: "Ch 8. False Positive Management & Rule Tuning",
    r4_ch8_l1: 'Performs iterative tuning to analyze false positives and <span class="text-white bg-white/10 px-1 rounded">improve rule precision</span>.',
    r4_ch8_l2: "Rule lifecycle: manages the cycle of authoring, testing, deployment, monitoring, feedback, and improvement.",
    r5_h: "Threat Hunting",
    r5_ch9: "Ch 9. Hypothesis-Based Threat Hunting",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">Formulates hypotheses</span> like \'abnormal child process creation should exist\' and proactively tracks threats by analyzing logs and telemetry.',
    r5_ch10: "Ch 10. IOC Sweep & TTP Mapping",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">Systematically sweeps</span> endpoints, networks, and logs based on IOC (Indicators of Compromise).',
    r5_ch10_l2: "Maps discovered attack behaviors to MITRE ATT&CK to analyze attacker tactical patterns.",
    r6_title: "Training Complete!",
    r6_desc: "From EDR evasion to Threat Hunting,<br/>you've excellently completed the<br/>advanced spearphishing attack & defense course.",
    r6_grade: "Final Grade:",
    r6_labBtn: "Go to Lab",
    r6_freeHint: "(Close this window to freely re-explore each sector)",
  },
  ja: {
    loc1: 'Sector 1: EDR 戦場', loc2: 'Sector 2: AMSI 分析室', loc3: 'Sector 3: LOLBins 武器庫', loc4: 'Sector 4: 検知工学研究所', loc5: 'Sector 5: 脅威ハンティング場',
    d1_1: "おほん！エージェント{AGENT}、今回の任務は上級コースだ。スピアフィッシング添付ファイルがEDRを回避する手法を分析しなければならない。",
    d1_2: "はい、チーム長！EDRがプロセス行動を監視していますが、攻撃者はプロセスインジェクションとDLLサイドローディングで検知を回避しています。",
    d1_3: "よろしい。奴らは正規プロセスに悪意のあるコードを注入したり、NTDLLフッキングを解除してEDRの目を逃れる。現場の手がかりを収集せよ！",
    d2_1: "見つけました！攻撃者がsvchost.exeにシェルコードをインジェクションし、EDRフッキングを解除してAPI呼び出しを隠蔽していました。",
    d2_2: "よくやった。正規プロセスのメモリを悪用するこの手法の正確な名称を答えよ。",
    d3_1: "スピアフィッシングで配信されたマクロやPowerShellペイロードはWindows AMSIの検査を受ける。しかし奴らはこれさえ無力化する。",
    d3_2: "AMSIスキャンインターフェースが見えます！しかし攻撃者がメモリパッチングでAmsiScanBuffer関数を改ざんしています！",
    d3_3: "そう、難読化まで組み合わせるとスクリプトベースの検知がほぼ不可能になる。AMSIゾーンの証拠を確保せよ！",
    d4_1: "証拠確保完了！AMSIを回避するメモリパッチング手法とBase64+XOR多重難読化レイヤーをすべて識別しました。",
    d4_2: "素晴らしい。Windowsのスクリプトセキュリティ検査インターフェースを回避するこの攻撃の名称を述べよ。",
    d5_1: "スピアフィッシング添付ファイルの本当に恐ろしい点は、外部ツールなしでもシステムに既にある正規バイナリを悪用することだ。",
    d5_2: "certutilで悪意のあるペイロードをダウンロードし、mshtaでHTAスクリプトを実行し、rundll32でDLLをプロキシ実行しています！",
    d5_3: "これがLiving off the Land戦略だ。Microsoft署名済みバイナリなのでウイルス対策がブロックしにくい。武器庫を調査せよ！",
    d6_1: "武器庫分析完了！攻撃者はcertutil -urlcache、mshta javascript:、rundll32 DllRegisterServerなど正規バイナリチェーンを構成していました。",
    d6_2: "その通り。システムに既にインストールされた正規バイナリを悪用するこの攻撃手法の通称を答えよ。",
    d7_1: "攻撃手法がわかったので、防御者の視点に切り替えよう。Detection Engineeringは検知ルールのライフサイクル全体を管理する分野だ。",
    d7_2: "Sigma/YARAルール作成から誤検知（False Positive）分析、ルールのデプロイとメンテナンスまで体系的に管理されていますね！",
    d7_3: "検知ルール一つが本番にデプロイされるまでの過程を理解してこそ真の防御者になれる。研究所の手がかりを収集せよ！",
    d8_1: "研究所調査完了！Sigmaルール作成→テスト環境検証→プロダクションデプロイ→誤検知フィードバック反映の全サイクルを確認しました。",
    d8_2: "素晴らしい。検知ルールの作成からメンテナンスまで全プロセスを管理するこの分野の正確な名称を述べよ。",
    d9_1: "最後のゾーンだ。Threat Huntingは既知のシグネチャに依存せず、仮説を立てて能動的に脅威を見つけ出す高度なセキュリティ活動だ。",
    d9_2: "仮説に基づいてIOCスイープを実行し、ATT&CK TTPにマッピングして攻撃パターンを追跡するプロセスが見えます！",
    d9_3: "そう、スピアフィッシング添付ファイル攻撃に対するハンティング仮説を立て、体系的に追跡する方法を身につけよ。ハンティング場の手がかりを集めよ！",
    d10_1: "ハンティング完了！「異常な子プロセス生成」仮説でOutlook→cmd→PowerShellチェーンを追跡し、T1566.001にTTPマッピングしました。",
    d10_2: "完璧だ。仮説を立てて能動的に脅威を見つけ出すこのセキュリティ活動の正確な名称を最終回答せよ。",
    d11_1: "これでEDR回避からThreat Huntingまで、高度なスピアフィッシング攻撃の全攻防を完全に理解しました！",
    d11_2: "お疲れ様、{AGENT}。本日学んだ内容を最終ケースノートにスタンプしておいたので、しっかり復習するように。",
    h1: "プロセスインジェクション注射器、DLLパッケージ、<br>そしてNTDLLアンフッキングのロック解除手がかりを見つけよ。",
    h2: "AMSIスキャナーシールド、メモリパッチングCPU、<br>難読化手法の目アイコンを見つけよ。",
    h3: "certutilダウンロード、mshta実行プレーヤー、<br>rundll32プロキシ循環アイコンを見つけよ。",
    h4: "検知ルールコードファイル、誤検知警告三角形、<br>ルールライフサイクル循環アイコンを見つけよ。",
    h5: "ハンティング仮説の虫眼鏡、IOCスイープレーダー、<br>TTPマッピング地図を見つけよ。",
    c_proc_inject_t: "プロセスインジェクション", c_proc_inject_m: "正規プロセス（svchost.exe、explorer.exe）のメモリ空間に悪意のあるシェルコードを挿入し、EDRに正規プロセスと誤認させる手法です。",
    c_dll_sideload_t: "DLLサイドローディング", c_dll_sideload_m: "正規アプリケーションがロードするDLLを悪意のあるDLLに置換し、署名済みプロセスのコンテキストで悪意のあるコードを実行する手法です。",
    c_unhook_ntdll_t: "NTDLLアンフッキング", c_unhook_ntdll_m: "EDRがntdll.dllに設置したフッキング（監視コード）を除去し、システムコール監視を無力化してAPI呼び出しを隠蔽する手法です。",
    c_amsi_scan_t: "AMSIスキャナー", c_amsi_scan_m: "Windows Anti-Malware Scan Interface。PowerShell、VBScript等のスクリプト実行前にセキュリティ製品にコンテンツを渡して悪性かどうか検査します。",
    c_mem_patch_t: "メモリパッチング", c_mem_patch_m: "AmsiScanBuffer関数のメモリを直接修正して常に'AMSI_RESULT_CLEAN'を返すようにするバイパス手法です。",
    c_obfuscation_t: "難読化手法", c_obfuscation_m: "Base64エンコーディング、XOR暗号化、文字列分割、変数名置換等を多重に適用してシグネチャベース検知を回避する手法です。",
    c_certutil_dl_t: "certutilダウンロード", c_certutil_dl_m: "証明書管理ツールcertutil.exeの-urlcacheオプションを悪用して外部から悪意のあるペイロードをダウンロードするLOLBin手法です。",
    c_mshta_exec_t: "mshta実行", c_mshta_exec_m: "Microsoft HTML Application Host（mshta.exe）を利用してHTAファイルやインラインJavaScript/VBScriptを実行する手法です。",
    c_rundll32_proxy_t: "rundll32プロキシ", c_rundll32_proxy_m: "rundll32.exeをプロキシとして使用し、悪意のあるDLLの特定export関数を実行したり、JavaScriptを実行する手法です。",
    c_detection_rule_t: "検知ルール", c_detection_rule_m: "Sigma、YARA、Snort等の形式で作成された検知規則。特定の攻撃行為パターンを定義して自動的に検知し警報を発生させます。",
    c_false_positive_t: "誤検知分析", c_false_positive_m: "検知ルールが正常な行為を攻撃と誤判断するFalse Positiveを分析し、ルールの精度を向上させるチューニング過程です。",
    c_rule_lifecycle_t: "ルールライフサイクル", c_rule_lifecycle_m: "検知ルールの作成→テスト→デプロイ→モニタリング→フィードバック→改善の全循環過程を体系的に管理するDetection Engineeringの核心です。",
    c_hunt_hypothesis_t: "ハンティング仮説", c_hunt_hypothesis_m: "Threat Huntingの出発点。「スピアフィッシング添付ファイルによる異常な子プロセスが存在するはずだ」のような仮説を立てます。",
    c_ioc_sweep_t: "IOCスイープ", c_ioc_sweep_m: "Indicator of Compromise（侵害指標）に基づいてログ、ネットワークトラフィック、エンドポイントをスイープして悪意のある活動の痕跡を探索します。",
    c_ttp_mapping_t: "TTPマッピング", c_ttp_mapping_m: "発見された攻撃行為をMITRE ATT&CKのTactics、Techniques、Proceduresにマッピングして攻撃者の戦術パターンを体系的に分析します。",
    p1_title: "EDR回避の核心", p1_desc: "正規プロセスのメモリ空間に<b>悪意のあるコードを挿入</b>してEDRの検知を回避する手法は？",
    p1_opts: ["プロセスインジェクション", "DLLハイジャック", "コード署名", "レジストリ修正"],
    p2_title: "スクリプトセキュリティの壁", p2_desc: "Windowsの<b>スクリプトセキュリティ検査インターフェース</b>を回避して悪意のあるPowerShell/VBScriptを検知なしで実行する攻撃は？",
    p2_opts: ["UACバイパス", "カーネルエクスプロイト", "AMSIバイパス", "ファイアウォール回避"],
    p3_title: "内部の敵", p3_desc: "追加の悪意のあるツールをインストールせずに、<b>システムに既にインストールされた正規バイナリ</b>（certutil、mshta、rundll32等）を悪用する攻撃手法の通称は？",
    p3_opts: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    p4_title: "防御の科学", p4_desc: "検知ルールの<b>作成→テスト→デプロイ→メンテナンス</b>の全プロセスを体系的に管理するセキュリティ分野は？",
    p4_opts: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    p5_title: "能動的追跡者", p5_desc: "<b>仮説を立てて能動的に</b>未知の脅威を見つけ出す高度なセキュリティ活動は？",
    p5_opts: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    teamLeader: 'チーム長', agent: 'エージェント', secRate: '確保率', certReport: '修了報告書',
    analysisReport: '分析レポート', freeMode: '（自由探索モード）',
    proceed: '進行', next: '次へ', closeWindow: '閉じる', saveData: 'データ保存',
    inventory: '収集データ (Inventory)', noClues: 'まだ収集された手がかりがありません。',
    prevTab: '◀ 前へ', nextTab: '次へ ▶',
    rTab1: "1. EDR回避とインジェクション", rTab2: "2. AMSIとメモリ攻撃", rTab3: "3. LOLBins悪用",
    rTab4: "4. Detection Engineering", rTab5: "5. Threat Hunting", rTab6: "6. 最終訓練修了",
    r1_h: "EDR回避とプロセスインジェクション",
    r1_ch1: "Ch 1. プロセスインジェクション手法",
    r1_ch1_l1: '正規プロセス（svchost.exe、explorer.exe）のメモリに<span class="text-white bg-white/10 px-1 rounded">シェルコードを注入</span>してEDR検知を回避します。',
    r1_ch1_l2: "Classic Injection、Process Hollowing、APC Injection等の多様な変種が存在します。",
    r1_ch2: "Ch 2. DLLサイドローディングとNTDLLアンフッキング",
    r1_ch2_l1: '正規アプリケーションのDLLロード順序を悪用して<span class="text-white bg-white/10 px-1 rounded">悪意のあるDLLを代わりにロード</span>させます。',
    r1_ch2_l2: "EDRがntdll.dllに設置したフッキングを除去してシステムコール監視を無力化します。",
    r2_h: "AMSIとメモリ攻撃",
    r2_ch3: "Ch 3. AMSI構造と動作原理",
    r2_ch3_p: 'Windows <span class="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span>はPowerShell、VBScript等のスクリプト実行前にセキュリティ製品にコンテンツを渡すインターフェースです。',
    r2_ch4: "Ch 4. AMSIバイパス手法",
    r2_ch4_l1: 'AmsiScanBuffer関数の<span class="text-white bg-white/10 px-1 rounded">メモリを直接パッチング</span>して常にCLEAN結果を返すようにします。',
    r2_ch4_l2: "Base64、XOR、文字列分割等の多重難読化を組み合わせてシグネチャ検知を回避します。",
    r3_h: "LOLBins悪用",
    r3_ch5: "Ch 5. certutilとmshta",
    r3_ch5_l1: '<span class="text-white bg-white/10 px-1 rounded">certutil -urlcache</span>で外部の悪意のあるペイロードをダウンロードします。',
    r3_ch5_l2: "mshta.exeでHTAファイルやインラインJavaScriptを実行して初期コードを起動します。",
    r3_ch6: "Ch 6. Living off the Land戦略",
    r3_ch6_l1: '<span class="text-white bg-white/10 px-1 rounded">rundll32.exe</span>をプロキシとして使用して悪意のあるDLLのexport関数を実行します。',
    r3_ch6_l2: "すべてのLOLBinはMicrosoft署名済みバイナリであるため、従来のウイルス対策のホワイトリストを悪用します。",
    r4_h: "Detection Engineering",
    r4_ch7: "Ch 7. 検知ルール作成",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">Sigma、YARA、Snort</span>等の形式で攻撃行為パターンを定義します。',
    r4_ch7_l2: "ATT&CK TTPベースで検知カバレッジを体系的にマッピングします。",
    r4_ch8: "Ch 8. 誤検知管理とルールチューニング",
    r4_ch8_l1: 'False Positiveを分析して<span class="text-white bg-white/10 px-1 rounded">ルールの精度を向上</span>させる反復的チューニング過程を実行します。',
    r4_ch8_l2: "ルールライフサイクル：作成→テスト→デプロイ→モニタリング→フィードバック→改善の循環を管理します。",
    r5_h: "Threat Hunting",
    r5_ch9: "Ch 9. 仮説ベース脅威ハンティング",
    r5_ch9_p: '「異常な子プロセス生成が存在するはずだ」のような<span class="text-white bg-white/10 px-1 rounded">仮説を立て</span>、ログとテレメトリを分析して能動的に脅威を追跡します。',
    r5_ch10: "Ch 10. IOCスイープとTTPマッピング",
    r5_ch10_l1: 'IOC（侵害指標）に基づいてエンドポイント、ネットワーク、ログを<span class="text-white bg-white/10 px-1 rounded">体系的にスイープ</span>します。',
    r5_ch10_l2: "発見された攻撃行為をMITRE ATT&CKにマッピングして攻撃者の戦術パターンを分析します。",
    r6_title: "訓練修了完了！",
    r6_desc: "EDR回避からThreat Huntingまで、<br/>高度なスピアフィッシング攻防課程を<br/>すべて優秀に修了しました。",
    r6_grade: "最終評価：",
    r6_labBtn: "実習ラボへ移動",
    r6_freeHint: "（ウィンドウを閉じると各セクターを自由に再探索できます）",
  },
  vi: {
    loc1: 'Sector 1: Chiến trường EDR', loc2: 'Sector 2: Phòng phân tích AMSI', loc3: 'Sector 3: Kho vũ khí LOLBins', loc4: 'Sector 4: Phòng nghiên cứu Detection Engineering', loc5: 'Sector 5: Bãi săn mối đe dọa',
    d1_1: "Chú ý! Đặc vụ {AGENT}, nhiệm vụ lần này là khóa nâng cao. Chúng ta cần phân tích kỹ thuật mà tệp đính kèm spearphishing vượt qua EDR.",
    d1_2: "Vâng, thưa sếp! EDR đang giám sát hành vi tiến trình, nhưng kẻ tấn công đang né tránh phát hiện thông qua process injection và DLL sideloading.",
    d1_3: "Tốt. Chúng tiêm mã độc vào tiến trình hợp lệ hoặc gỡ hook NTDLL để tránh mắt EDR. Thu thập manh mối từ hiện trường!",
    d2_1: "Tìm thấy rồi! Kẻ tấn công đã tiêm shellcode vào svchost.exe và gỡ hook EDR để che giấu lệnh gọi API.",
    d2_2: "Giỏi lắm. Hãy cho biết tên chính xác của kỹ thuật lạm dụng bộ nhớ tiến trình hợp lệ này.",
    d3_1: "Macro và payload PowerShell được gửi qua spearphishing sẽ bị Windows AMSI quét. Nhưng chúng thậm chí vô hiệu hóa cả điều này.",
    d3_2: "Tôi thấy giao diện quét AMSI! Nhưng kẻ tấn công đang sửa đổi hàm AmsiScanBuffer bằng memory patching!",
    d3_3: "Đúng vậy, kết hợp với obfuscation thì phát hiện dựa trên script gần như bất khả thi. Thu thập bằng chứng từ khu vực AMSI!",
    d4_1: "Thu thập bằng chứng hoàn tất! Đã xác định cả kỹ thuật memory patching vượt AMSI và lớp obfuscation đa tầng Base64+XOR.",
    d4_2: "Xuất sắc. Hãy cho biết tên cuộc tấn công vượt qua giao diện kiểm tra bảo mật script của Windows.",
    d5_1: "Điều thực sự đáng sợ về tệp đính kèm spearphishing là chúng lạm dụng binary hợp lệ đã có sẵn trên hệ thống mà không cần cài công cụ bên ngoài.",
    d5_2: "Chúng tải payload độc hại bằng certutil, thực thi script HTA bằng mshta, và proxy thực thi DLL bằng rundll32!",
    d5_3: "Đây là chiến lược Living off the Land. Vì là binary có chữ ký Microsoft nên antivirus khó chặn. Điều tra kho vũ khí!",
    d6_1: "Phân tích kho vũ khí hoàn tất! Kẻ tấn công đã xây dựng chuỗi binary hợp lệ: certutil -urlcache, mshta javascript:, rundll32 DllRegisterServer.",
    d6_2: "Đúng vậy. Hãy cho biết tên gọi chung của kỹ thuật tấn công lạm dụng binary hợp lệ đã cài sẵn trên hệ thống.",
    d7_1: "Đã biết kỹ thuật tấn công, giờ hãy chuyển sang góc nhìn phòng thủ. Detection Engineering là lĩnh vực quản lý toàn bộ vòng đời quy tắc phát hiện.",
    d7_2: "Từ viết quy tắc Sigma/YARA đến phân tích false positive, triển khai và bảo trì quy tắc — tất cả được quản lý có hệ thống!",
    d7_3: "Phải hiểu quy trình triển khai một quy tắc phát hiện vào production mới trở thành người phòng thủ thực thụ. Thu thập manh mối từ phòng nghiên cứu!",
    d8_1: "Điều tra phòng nghiên cứu hoàn tất! Đã xác nhận toàn bộ chu trình: tạo quy tắc Sigma → xác minh môi trường test → triển khai production → phản hồi false positive.",
    d8_2: "Xuất sắc. Hãy cho biết tên chính xác của lĩnh vực quản lý toàn bộ quy trình từ tạo đến bảo trì quy tắc phát hiện.",
    d9_1: "Khu vực cuối cùng. Threat Hunting là hoạt động bảo mật nâng cao chủ động tìm mối đe dọa bằng cách lập giả thuyết thay vì dựa vào signature đã biết.",
    d9_2: "Tôi thấy quy trình thực hiện IOC sweep dựa trên giả thuyết và theo dõi mẫu tấn công bằng cách ánh xạ vào ATT&CK TTP!",
    d9_3: "Đúng vậy, hãy học cách lập giả thuyết săn tìm cho cuộc tấn công tệp đính kèm spearphishing và theo dõi có hệ thống. Thu thập manh mối từ bãi săn!",
    d10_1: "Săn tìm hoàn tất! Đã truy vết chuỗi Outlook→cmd→PowerShell bằng giả thuyết 'tạo tiến trình con bất thường' và ánh xạ TTP vào T1566.001.",
    d10_2: "Hoàn hảo. Hãy cho câu trả lời cuối cùng: tên chính xác của hoạt động bảo mật lập giả thuyết và chủ động tìm mối đe dọa.",
    d11_1: "Giờ tôi đã hiểu hoàn toàn toàn bộ tấn công và phòng thủ spearphishing nâng cao, từ vượt EDR đến Threat Hunting!",
    d11_2: "Tốt lắm, {AGENT}. Nội dung học hôm nay đã được đóng dấu vào sổ tay vụ án cuối cùng. Hãy ôn tập kỹ.",
    h1: "Tìm ống tiêm process injection, gói DLL, <br>và manh mối mở khóa NTDLL unhooking.",
    h2: "Tìm khiên AMSI scanner, CPU memory patching, <br>và biểu tượng mắt obfuscation.",
    h3: "Tìm certutil download, trình phát mshta execution, <br>và biểu tượng xoay rundll32 proxy.",
    h4: "Tìm tệp mã detection rule, tam giác cảnh báo false positive, <br>và biểu tượng xoay rule lifecycle.",
    h5: "Tìm kính lúp hunting hypothesis, radar IOC sweep, <br>và bản đồ TTP mapping.",
    c_proc_inject_t: "Process Injection", c_proc_inject_m: "Kỹ thuật chèn shellcode độc hại vào không gian bộ nhớ của tiến trình hợp lệ (svchost.exe, explorer.exe), khiến EDR nhầm chúng là tiến trình bình thường.",
    c_dll_sideload_t: "DLL Sideloading", c_dll_sideload_m: "Kỹ thuật thay thế DLL mà ứng dụng hợp lệ tải bằng DLL độc hại, thực thi mã độc trong ngữ cảnh tiến trình đã ký.",
    c_unhook_ntdll_t: "NTDLL Unhooking", c_unhook_ntdll_m: "Kỹ thuật gỡ bỏ hook (mã giám sát) mà EDR cài trên ntdll.dll, vô hiệu hóa giám sát system call và che giấu lệnh gọi API.",
    c_amsi_scan_t: "AMSI Scanner", c_amsi_scan_m: "Windows Anti-Malware Scan Interface. Chuyển nội dung script (PowerShell, VBScript, v.v.) cho sản phẩm bảo mật để kiểm tra mã độc trước khi thực thi.",
    c_mem_patch_t: "Memory Patching", c_mem_patch_m: "Kỹ thuật bypass trực tiếp sửa đổi bộ nhớ hàm AmsiScanBuffer để luôn trả về 'AMSI_RESULT_CLEAN'.",
    c_obfuscation_t: "Kỹ thuật Obfuscation", c_obfuscation_m: "Áp dụng nhiều lớp Base64 encoding, XOR encryption, tách chuỗi, thay đổi tên biến để tránh phát hiện dựa trên signature.",
    c_certutil_dl_t: "certutil Download", c_certutil_dl_m: "Kỹ thuật LOLBin lạm dụng tùy chọn -urlcache của công cụ quản lý chứng chỉ certutil.exe để tải payload độc hại từ bên ngoài.",
    c_mshta_exec_t: "mshta Execution", c_mshta_exec_m: "Kỹ thuật sử dụng Microsoft HTML Application Host (mshta.exe) để thực thi tệp HTA hoặc JavaScript/VBScript inline.",
    c_rundll32_proxy_t: "rundll32 Proxy", c_rundll32_proxy_m: "Kỹ thuật sử dụng rundll32.exe làm proxy để thực thi hàm export cụ thể của DLL độc hại hoặc chạy JavaScript.",
    c_detection_rule_t: "Detection Rules", c_detection_rule_m: "Quy tắc phát hiện viết bằng định dạng Sigma, YARA, Snort. Định nghĩa mẫu hành vi tấn công cụ thể để tự động phát hiện và cảnh báo.",
    c_false_positive_t: "Phân tích False Positive", c_false_positive_m: "Quá trình tuning phân tích false positive khi quy tắc phát hiện nhầm hành vi bình thường là tấn công, cải thiện độ chính xác quy tắc.",
    c_rule_lifecycle_t: "Vòng đời Rule", c_rule_lifecycle_m: "Cốt lõi của Detection Engineering: quản lý có hệ thống toàn bộ chu trình tạo, kiểm tra, triển khai, giám sát, phản hồi và cải tiến quy tắc.",
    c_hunt_hypothesis_t: "Giả thuyết săn tìm", c_hunt_hypothesis_m: "Điểm khởi đầu của Threat Hunting. Lập giả thuyết như 'tiến trình con bất thường từ tệp đính kèm spearphishing phải tồn tại.'",
    c_ioc_sweep_t: "IOC Sweep", c_ioc_sweep_m: "Quét log, lưu lượng mạng và endpoint dựa trên Indicator of Compromise (IOC) để tìm dấu vết hoạt động độc hại.",
    c_ttp_mapping_t: "TTP Mapping", c_ttp_mapping_m: "Ánh xạ hành vi tấn công phát hiện được vào Tactics, Techniques, Procedures của MITRE ATT&CK để phân tích có hệ thống mẫu chiến thuật của kẻ tấn công.",
    p1_title: "Chìa khóa vượt EDR", p1_desc: "Kỹ thuật nào tránh phát hiện EDR bằng cách <b>chèn mã độc</b> vào không gian bộ nhớ tiến trình hợp lệ?",
    p1_opts: ["Process Injection", "DLL Hijacking", "Code Signing", "Registry Modification"],
    p2_title: "Bức tường bảo mật Script", p2_desc: "Cuộc tấn công nào vượt qua <b>giao diện kiểm tra bảo mật script</b> của Windows để thực thi PowerShell/VBScript độc hại không bị phát hiện?",
    p2_opts: ["UAC Bypass", "Kernel Exploit", "AMSI Bypass", "Firewall Evasion"],
    p3_title: "Kẻ thù bên trong", p3_desc: "Tên gọi chung cho kỹ thuật tấn công lạm dụng <b>binary hợp lệ đã cài sẵn</b> trên hệ thống (certutil, mshta, rundll32, v.v.) mà không cần cài thêm công cụ độc hại?",
    p3_opts: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    p4_title: "Khoa học phòng thủ", p4_desc: "Lĩnh vực bảo mật nào quản lý có hệ thống toàn bộ quy trình <b>tạo → kiểm tra → triển khai → bảo trì</b> quy tắc phát hiện?",
    p4_opts: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    p5_title: "Người truy vết chủ động", p5_desc: "Hoạt động bảo mật nâng cao nào <b>lập giả thuyết và chủ động</b> tìm ra mối đe dọa chưa biết?",
    p5_opts: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    teamLeader: 'Đội trưởng', agent: 'Đặc vụ', secRate: 'Đã thu thập', certReport: 'Báo cáo hoàn thành',
    analysisReport: 'Báo cáo phân tích', freeMode: '(Chế độ khám phá tự do)',
    proceed: 'Tiếp tục', next: 'Tiếp', closeWindow: 'Đóng', saveData: 'Lưu dữ liệu',
    inventory: 'Dữ liệu thu thập (Inventory)', noClues: 'Chưa thu thập manh mối nào.',
    prevTab: '◀ Trước', nextTab: 'Tiếp ▶',
    rTab1: "1. Vượt EDR & Injection", rTab2: "2. AMSI & Tấn công bộ nhớ", rTab3: "3. Lạm dụng LOLBins",
    rTab4: "4. Detection Engineering", rTab5: "5. Threat Hunting", rTab6: "6. Hoàn thành đào tạo",
    r1_h: "Vượt EDR & Process Injection",
    r1_ch1: "Ch 1. Kỹ thuật Process Injection",
    r1_ch1_l1: 'Vượt phát hiện EDR bằng cách <span class="text-white bg-white/10 px-1 rounded">tiêm shellcode</span> vào bộ nhớ tiến trình hợp lệ (svchost.exe, explorer.exe).',
    r1_ch1_l2: "Tồn tại nhiều biến thể: Classic Injection, Process Hollowing, APC Injection.",
    r1_ch2: "Ch 2. DLL Sideloading & NTDLL Unhooking",
    r1_ch2_l1: 'Lạm dụng thứ tự tải DLL của ứng dụng hợp lệ để <span class="text-white bg-white/10 px-1 rounded">tải DLL độc hại thay thế</span>.',
    r1_ch2_l2: "Gỡ bỏ hook EDR cài trên ntdll.dll để vô hiệu hóa giám sát system call.",
    r2_h: "AMSI & Tấn công bộ nhớ",
    r2_ch3: "Ch 3. Cấu trúc & nguyên lý AMSI",
    r2_ch3_p: 'Windows <span class="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span> là giao diện chuyển nội dung cho sản phẩm bảo mật trước khi thực thi script như PowerShell và VBScript.',
    r2_ch4: "Ch 4. Kỹ thuật AMSI Bypass",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">Trực tiếp patch bộ nhớ</span> hàm AmsiScanBuffer để luôn trả về kết quả CLEAN.',
    r2_ch4_l2: "Kết hợp nhiều lớp obfuscation như Base64, XOR, tách chuỗi để tránh phát hiện signature.",
    r3_h: "Lạm dụng LOLBins",
    r3_ch5: "Ch 5. certutil & mshta",
    r3_ch5_l1: 'Tải payload độc hại bên ngoài bằng <span class="text-white bg-white/10 px-1 rounded">certutil -urlcache</span>.',
    r3_ch5_l2: "Thực thi tệp HTA hoặc JavaScript inline qua mshta.exe để chạy mã khởi tạo.",
    r3_ch6: "Ch 6. Chiến lược Living off the Land",
    r3_ch6_l1: 'Sử dụng <span class="text-white bg-white/10 px-1 rounded">rundll32.exe</span> làm proxy để thực thi hàm export của DLL độc hại.',
    r3_ch6_l2: "Tất cả LOLBin đều là binary có chữ ký Microsoft, lạm dụng whitelist của antivirus truyền thống.",
    r4_h: "Detection Engineering",
    r4_ch7: "Ch 7. Viết quy tắc phát hiện",
    r4_ch7_l1: 'Định nghĩa mẫu hành vi tấn công bằng định dạng <span class="text-white bg-white/10 px-1 rounded">Sigma, YARA, Snort</span>.',
    r4_ch7_l2: "Ánh xạ coverage phát hiện có hệ thống dựa trên ATT&CK TTP.",
    r4_ch8: "Ch 8. Quản lý False Positive & Tuning Rule",
    r4_ch8_l1: 'Thực hiện quá trình tuning lặp lại để phân tích false positive và <span class="text-white bg-white/10 px-1 rounded">cải thiện độ chính xác rule</span>.',
    r4_ch8_l2: "Vòng đời rule: quản lý chu trình tạo → test → triển khai → giám sát → phản hồi → cải tiến.",
    r5_h: "Threat Hunting",
    r5_ch9: "Ch 9. Săn tìm mối đe dọa dựa trên giả thuyết",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">Lập giả thuyết</span> như \'tiến trình con bất thường phải tồn tại\' và chủ động truy vết mối đe dọa bằng phân tích log và telemetry.',
    r5_ch10: "Ch 10. IOC Sweep & TTP Mapping",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">Quét có hệ thống</span> endpoint, mạng và log dựa trên IOC (Indicator of Compromise).',
    r5_ch10_l2: "Ánh xạ hành vi tấn công phát hiện được vào MITRE ATT&CK để phân tích mẫu chiến thuật kẻ tấn công.",
    r6_title: "Hoàn thành đào tạo!",
    r6_desc: "Từ vượt EDR đến Threat Hunting,<br/>bạn đã hoàn thành xuất sắc<br/>khóa tấn công & phòng thủ spearphishing nâng cao.",
    r6_grade: "Xếp hạng cuối:",
    r6_labBtn: "Đến phòng thực hành",
    r6_freeHint: "(Đóng cửa sổ này để tự do khám phá lại từng sector)",
  },
  ar: {
    loc1: 'Sector 1: ساحة معركة EDR', loc2: 'Sector 2: مختبر تحليل AMSI', loc3: 'Sector 3: ترسانة LOLBins', loc4: 'Sector 4: مختبر هندسة الكشف', loc5: 'Sector 5: ميدان صيد التهديدات',
    d1_1: "انتباه! العميل {AGENT}، هذه المهمة هي دورة متقدمة. نحتاج لتحليل تقنيات تجاوز مرفقات التصيد الاحتيالي الموجه لـ EDR.",
    d1_2: "نعم يا قائد! EDR يراقب سلوك العمليات، لكن المهاجمين يتهربون من الكشف عبر حقن العمليات وتحميل DLL الجانبي.",
    d1_3: "جيد. إنهم يحقنون كوداً خبيثاً في العمليات المشروعة أو يزيلون ربط NTDLL للتهرب من أعين EDR. اجمع الأدلة من الموقع!",
    d2_1: "وجدتها! المهاجم كان يحقن شل كود في svchost.exe ويزيل ربط EDR لإخفاء استدعاءات API.",
    d2_2: "أحسنت. أخبرني الاسم الدقيق لهذه التقنية التي تستغل ذاكرة العمليات المشروعة.",
    d3_1: "الماكرو وحمولات PowerShell المُسلّمة عبر التصيد الموجه تخضع لفحص Windows AMSI. لكنهم يعطلون حتى هذا.",
    d3_2: "أرى واجهة فحص AMSI! لكن المهاجم يُعدّل دالة AmsiScanBuffer عبر ترقيع الذاكرة!",
    d3_3: "نعم، مع التشويش يصبح الكشف المبني على السكربتات شبه مستحيل. أمّن الأدلة من منطقة AMSI!",
    d4_1: "تم تأمين الأدلة! حددت كلاً من تقنية ترقيع الذاكرة لتجاوز AMSI وطبقات التشويش المتعددة Base64+XOR.",
    d4_2: "ممتاز. أخبرني اسم هذا الهجوم الذي يتجاوز واجهة فحص أمان السكربتات في Windows.",
    d5_1: "الشيء المخيف حقاً في مرفقات التصيد الموجه هو استغلال ملفات ثنائية مشروعة موجودة بالفعل على النظام دون تثبيت أدوات خارجية.",
    d5_2: "إنهم يُنزّلون حمولات خبيثة بـ certutil، وينفذون سكربتات HTA بـ mshta، وينفذون DLL عبر وكيل rundll32!",
    d5_3: "هذه استراتيجية Living off the Land. لأنها ملفات ثنائية موقعة من Microsoft، يصعب على مضاد الفيروسات حظرها. تحقق من الترسانة!",
    d6_1: "تحليل الترسانة مكتمل! المهاجم كان يُنشئ سلسلة ملفات ثنائية مشروعة: certutil -urlcache، mshta javascript:، rundll32 DllRegisterServer.",
    d6_2: "صحيح. أخبرني الاسم الشائع لتقنية الهجوم التي تستغل ملفات ثنائية مشروعة مثبتة مسبقاً على النظام.",
    d7_1: "الآن بعد معرفة تقنيات الهجوم، لننتقل لمنظور المدافع. هندسة الكشف تدير دورة حياة قواعد الكشف بالكامل.",
    d7_2: "من كتابة قواعد Sigma/YARA إلى تحليل الإيجابيات الكاذبة ونشر القواعد وصيانتها — كل شيء يُدار بشكل منهجي!",
    d7_3: "يجب فهم عملية نشر قاعدة كشف واحدة في الإنتاج لتصبح مدافعاً حقيقياً. اجمع الأدلة من المختبر!",
    d8_1: "تحقيق المختبر مكتمل! تأكدت من الدورة الكاملة: إنشاء قاعدة Sigma → التحقق في بيئة الاختبار → النشر في الإنتاج → دمج ملاحظات الإيجابيات الكاذبة.",
    d8_2: "ممتاز. أخبرني الاسم الدقيق لهذا التخصص الذي يدير العملية الكاملة من إنشاء القواعد إلى صيانتها.",
    d9_1: "المنطقة الأخيرة. صيد التهديدات نشاط أمني متقدم يجد التهديدات بشكل استباقي عبر صياغة فرضيات بدلاً من الاعتماد على التواقيع المعروفة.",
    d9_2: "أرى عملية إجراء مسح IOC بناءً على فرضيات وتتبع أنماط الهجوم بالربط مع ATT&CK TTP!",
    d9_3: "نعم، تعلم كيفية صياغة فرضيات الصيد لهجمات مرفقات التصيد الموجه وتتبعها بشكل منهجي. اجمع الأدلة من ميدان الصيد!",
    d10_1: "الصيد مكتمل! تتبعت سلسلة Outlook→cmd→PowerShell باستخدام فرضية 'إنشاء عمليات فرعية غير طبيعية' وربطت TTP بـ T1566.001.",
    d10_2: "مثالي. أعطني الإجابة النهائية: الاسم الدقيق لهذا النشاط الأمني الذي يصوغ فرضيات ويجد التهديدات بشكل استباقي.",
    d11_1: "الآن أفهم تماماً كامل هجوم ودفاع التصيد الموجه المتقدم، من تجاوز EDR إلى صيد التهديدات!",
    d11_2: "أحسنت، {AGENT}. تم ختم محتوى تدريب اليوم في دفتر القضية النهائي. راجعه جيداً.",
    h1: "ابحث عن حقنة process injection، حزمة DLL، <br>ودليل فتح قفل NTDLL unhooking.",
    h2: "ابحث عن درع AMSI scanner، معالج memory patching، <br>وأيقونة عين obfuscation.",
    h3: "ابحث عن تنزيل certutil، مشغل تنفيذ mshta، <br>وأيقونة دوران وكيل rundll32.",
    h4: "ابحث عن ملف كود detection rule، مثلث تحذير false positive، <br>وأيقونة دوران دورة حياة القاعدة.",
    h5: "ابحث عن عدسة فرضية الصيد، رادار مسح IOC، <br>وخريطة ربط TTP.",
    c_proc_inject_t: "حقن العمليات", c_proc_inject_m: "تقنية تُدخل شل كود خبيث في مساحة ذاكرة العمليات المشروعة (svchost.exe، explorer.exe)، مما يجعل EDR يعتبرها عمليات طبيعية.",
    c_dll_sideload_t: "تحميل DLL الجانبي", c_dll_sideload_m: "تقنية تستبدل DLL المُحمّلة بواسطة التطبيقات المشروعة بـ DLL خبيثة، لتنفيذ كود خبيث في سياق عملية موقعة.",
    c_unhook_ntdll_t: "إزالة ربط NTDLL", c_unhook_ntdll_m: "تقنية تزيل الربط (كود المراقبة) الذي يثبته EDR على ntdll.dll، لتعطيل مراقبة استدعاءات النظام وإخفاء استدعاءات API.",
    c_amsi_scan_t: "ماسح AMSI", c_amsi_scan_m: "واجهة فحص البرامج الضارة في Windows. تمرر محتوى السكربتات (PowerShell، VBScript، إلخ) لمنتجات الأمان للفحص قبل التنفيذ.",
    c_mem_patch_t: "ترقيع الذاكرة", c_mem_patch_m: "تقنية تجاوز تُعدّل ذاكرة دالة AmsiScanBuffer مباشرةً لتُرجع دائماً 'AMSI_RESULT_CLEAN'.",
    c_obfuscation_t: "تقنيات التشويش", c_obfuscation_m: "تطبق طبقات متعددة من ترميز Base64 وتشفير XOR وتقسيم السلاسل واستبدال أسماء المتغيرات للتهرب من الكشف المبني على التواقيع.",
    c_certutil_dl_t: "تنزيل certutil", c_certutil_dl_m: "تقنية LOLBin تستغل خيار -urlcache في أداة إدارة الشهادات certutil.exe لتنزيل حمولات خبيثة من مصادر خارجية.",
    c_mshta_exec_t: "تنفيذ mshta", c_mshta_exec_m: "تقنية تستخدم Microsoft HTML Application Host (mshta.exe) لتنفيذ ملفات HTA أو JavaScript/VBScript مُضمّنة.",
    c_rundll32_proxy_t: "وكيل rundll32", c_rundll32_proxy_m: "تقنية تستخدم rundll32.exe كوكيل لتنفيذ دوال export محددة في DLL خبيثة أو تشغيل JavaScript.",
    c_detection_rule_t: "قواعد الكشف", c_detection_rule_m: "قواعد كشف مكتوبة بصيغ مثل Sigma وYARA وSnort. تُعرّف أنماط سلوك هجومي محدد للكشف والتنبيه التلقائي.",
    c_false_positive_t: "تحليل الإيجابيات الكاذبة", c_false_positive_m: "عملية ضبط لتحليل الإيجابيات الكاذبة حيث تُصنّف قواعد الكشف سلوكاً طبيعياً خطأً كهجوم، وتحسين دقة القاعدة.",
    c_rule_lifecycle_t: "دورة حياة القاعدة", c_rule_lifecycle_m: "جوهر هندسة الكشف: إدارة منهجية لدورة إنشاء واختبار ونشر ومراقبة وملاحظات وتحسين القواعد بالكامل.",
    c_hunt_hypothesis_t: "فرضية الصيد", c_hunt_hypothesis_m: "نقطة انطلاق صيد التهديدات. صياغة فرضيات مثل 'يجب أن توجد عمليات فرعية غير طبيعية من مرفقات التصيد الموجه.'",
    c_ioc_sweep_t: "مسح IOC", c_ioc_sweep_m: "مسح السجلات وحركة الشبكة ونقاط النهاية بناءً على مؤشرات الاختراق (IOC) للبحث عن آثار النشاط الخبيث.",
    c_ttp_mapping_t: "ربط TTP", c_ttp_mapping_m: "ربط السلوك الهجومي المكتشف بالتكتيكات والتقنيات والإجراءات في MITRE ATT&CK لتحليل أنماط تكتيكات المهاجم بشكل منهجي.",
    p1_title: "مفتاح تجاوز EDR", p1_desc: "أي تقنية تتجاوز كشف EDR عبر <b>إدخال كود خبيث</b> في مساحة ذاكرة العمليات المشروعة؟",
    p1_opts: ["حقن العمليات", "اختطاف DLL", "توقيع الكود", "تعديل السجل"],
    p2_title: "جدار أمان السكربتات", p2_desc: "أي هجوم يتجاوز <b>واجهة فحص أمان السكربتات</b> في Windows لتنفيذ PowerShell/VBScript خبيث دون كشف؟",
    p2_opts: ["تجاوز UAC", "استغلال النواة", "تجاوز AMSI", "تجاوز جدار الحماية"],
    p3_title: "العدو الداخلي", p3_desc: "ما الاسم الشائع لتقنيات الهجوم التي تستغل <b>ملفات ثنائية مشروعة مثبتة مسبقاً</b> على النظام (certutil، mshta، rundll32، إلخ) دون تثبيت أدوات خبيثة إضافية؟",
    p3_opts: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    p4_title: "علم الدفاع", p4_desc: "أي تخصص أمني يدير بشكل منهجي العملية الكاملة <b>لإنشاء واختبار ونشر وصيانة</b> قواعد الكشف؟",
    p4_opts: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    p5_title: "المتتبع الاستباقي", p5_desc: "أي نشاط أمني متقدم <b>يصوغ فرضيات ويبحث بشكل استباقي</b> عن تهديدات غير معروفة؟",
    p5_opts: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    teamLeader: 'القائد', agent: 'العميل', secRate: 'مؤمّن', certReport: 'تقرير الإتمام',
    analysisReport: 'تقرير التحليل', freeMode: '(وضع الاستكشاف الحر)',
    proceed: 'متابعة', next: 'التالي', closeWindow: 'إغلاق', saveData: 'حفظ البيانات',
    inventory: 'البيانات المجمعة (Inventory)', noClues: 'لم يتم جمع أي أدلة بعد.',
    prevTab: '◀ السابق', nextTab: 'التالي ▶',
    rTab1: "1. تجاوز EDR والحقن", rTab2: "2. AMSI وهجمات الذاكرة", rTab3: "3. استغلال LOLBins",
    rTab4: "4. هندسة الكشف", rTab5: "5. صيد التهديدات", rTab6: "6. إتمام التدريب",
    r1_h: "تجاوز EDR وحقن العمليات",
    r1_ch1: "Ch 1. تقنيات حقن العمليات",
    r1_ch1_l1: 'تجاوز كشف EDR عبر <span class="text-white bg-white/10 px-1 rounded">حقن شل كود</span> في ذاكرة العمليات المشروعة (svchost.exe، explorer.exe).',
    r1_ch1_l2: "توجد متغيرات متعددة تشمل Classic Injection وProcess Hollowing وAPC Injection.",
    r1_ch2: "Ch 2. تحميل DLL الجانبي وإزالة ربط NTDLL",
    r1_ch2_l1: 'استغلال ترتيب تحميل DLL للتطبيقات المشروعة <span class="text-white bg-white/10 px-1 rounded">لتحميل DLL خبيثة بدلاً منها</span>.',
    r1_ch2_l2: "إزالة الربط المثبت من EDR على ntdll.dll لتعطيل مراقبة استدعاءات النظام.",
    r2_h: "AMSI وهجمات الذاكرة",
    r2_ch3: "Ch 3. بنية AMSI وآلية العمل",
    r2_ch3_p: 'واجهة <span class="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span> في Windows تمرر المحتوى لمنتجات الأمان قبل تنفيذ سكربتات مثل PowerShell وVBScript.',
    r2_ch4: "Ch 4. تقنيات تجاوز AMSI",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">ترقيع ذاكرة</span> دالة AmsiScanBuffer مباشرةً لإرجاع نتيجة CLEAN دائماً.',
    r2_ch4_l2: "دمج طبقات تشويش متعددة مثل Base64 وXOR وتقسيم السلاسل للتهرب من كشف التواقيع.",
    r3_h: "استغلال LOLBins",
    r3_ch5: "Ch 5. certutil و mshta",
    r3_ch5_l1: 'تنزيل حمولات خبيثة خارجية باستخدام <span class="text-white bg-white/10 px-1 rounded">certutil -urlcache</span>.',
    r3_ch5_l2: "تنفيذ ملفات HTA أو JavaScript مُضمّن عبر mshta.exe لتشغيل الكود الأولي.",
    r3_ch6: "Ch 6. استراتيجية Living off the Land",
    r3_ch6_l1: 'استخدام <span class="text-white bg-white/10 px-1 rounded">rundll32.exe</span> كوكيل لتنفيذ دوال export في DLL خبيثة.',
    r3_ch6_l2: "جميع LOLBins هي ملفات ثنائية موقعة من Microsoft، مما يستغل القوائم البيضاء لمضاد الفيروسات التقليدي.",
    r4_h: "هندسة الكشف",
    r4_ch7: "Ch 7. كتابة قواعد الكشف",
    r4_ch7_l1: 'تعريف أنماط السلوك الهجومي بصيغ مثل <span class="text-white bg-white/10 px-1 rounded">Sigma، YARA، Snort</span>.',
    r4_ch7_l2: "ربط تغطية الكشف بشكل منهجي بناءً على ATT&CK TTP.",
    r4_ch8: "Ch 8. إدارة الإيجابيات الكاذبة وضبط القواعد",
    r4_ch8_l1: 'إجراء ضبط متكرر لتحليل الإيجابيات الكاذبة و<span class="text-white bg-white/10 px-1 rounded">تحسين دقة القواعد</span>.',
    r4_ch8_l2: "دورة حياة القاعدة: إدارة دورة الإنشاء → الاختبار → النشر → المراقبة → الملاحظات → التحسين.",
    r5_h: "صيد التهديدات",
    r5_ch9: "Ch 9. صيد التهديدات المبني على الفرضيات",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">صياغة فرضيات</span> مثل \'يجب أن يوجد إنشاء عمليات فرعية غير طبيعية\' وتتبع التهديدات بشكل استباقي عبر تحليل السجلات والقياسات.',
    r5_ch10: "Ch 10. مسح IOC وربط TTP",
    r5_ch10_l1: '<span class="text-white bg-white/10 px-1 rounded">مسح منهجي</span> لنقاط النهاية والشبكة والسجلات بناءً على IOC (مؤشرات الاختراق).',
    r5_ch10_l2: "ربط سلوك الهجوم المكتشف بـ MITRE ATT&CK لتحليل أنماط تكتيكات المهاجم.",
    r6_title: "اكتمل التدريب!",
    r6_desc: "من تجاوز EDR إلى صيد التهديدات،<br/>أكملت بتفوق دورة<br/>هجوم ودفاع التصيد الموجه المتقدم.",
    r6_grade: "التقييم النهائي:",
    r6_labBtn: "انتقل إلى المختبر",
    r6_freeHint: "(أغلق هذه النافذة لإعادة استكشاف كل قطاع بحرية)",
  },
  zh: {
    loc1: 'Sector 1: EDR 战场', loc2: 'Sector 2: AMSI 分析室', loc3: 'Sector 3: LOLBins 武器库', loc4: 'Sector 4: 检测工程实验室', loc5: 'Sector 5: 威胁狩猎场',
    d1_1: "咳咳！{AGENT} 特工，这次任务是高级课程。我们需要分析鱼叉式钓鱼附件绕过 EDR 的技术。",
    d1_2: "是的，队长！EDR 正在监控进程行为，但攻击者通过进程注入和 DLL 侧加载来规避检测。",
    d1_3: "很好。他们将恶意代码注入合法进程，或解除 NTDLL 挂钩来躲避 EDR 的监视。收集现场线索！",
    d2_1: "找到了！攻击者将 shellcode 注入 svchost.exe，并解除 EDR 挂钩来隐藏 API 调用。",
    d2_2: "干得好。告诉我这种利用合法进程内存的技术的确切名称。",
    d3_1: "通过鱼叉式钓鱼传递的宏和 PowerShell 载荷会受到 Windows AMSI 的检查。但他们甚至能使其失效。",
    d3_2: "我能看到 AMSI 扫描接口！但攻击者正在通过内存补丁篡改 AmsiScanBuffer 函数！",
    d3_3: "没错，结合混淆处理，基于脚本的检测几乎变得不可能。从 AMSI 区域收集证据！",
    d4_1: "证据收集完成！我已识别出绕过 AMSI 的内存补丁技术和多层 Base64+XOR 混淆。",
    d4_2: "出色。告诉我这种绕过 Windows 脚本安全扫描接口的攻击名称。",
    d5_1: "鱼叉式钓鱼附件真正可怕的地方在于，它们无需安装外部工具，就能滥用系统上已有的合法二进制文件。",
    d5_2: "他们用 certutil 下载恶意载荷，用 mshta 执行 HTA 脚本，用 rundll32 代理执行 DLL！",
    d5_3: "这就是 Living off the Land 策略。由于它们是 Microsoft 签名的二进制文件，杀毒软件很难阻止。调查武器库！",
    d6_1: "武器库分析完成！攻击者构建了合法二进制文件链：certutil -urlcache、mshta javascript:、rundll32 DllRegisterServer。",
    d6_2: "正确。告诉我这种滥用系统已安装合法二进制文件的攻击技术的通用名称。",
    d7_1: "既然我们了解了攻击技术，现在转换到防御者视角。Detection Engineering 管理检测规则的整个生命周期。",
    d7_2: "从编写 Sigma/YARA 规则到误报分析、规则部署和维护——一切都被系统化管理！",
    d7_3: "你必须理解将一条检测规则部署到生产环境的过程，才能成为真正的防御者。从实验室收集线索！",
    d8_1: "实验室调查完成！确认了完整周期：Sigma 规则创建 → 测试环境验证 → 生产部署 → 误报反馈整合。",
    d8_2: "出色。告诉我这个管理从规则创建到维护全过程的学科的确切名称。",
    d9_1: "最后一个区域。Threat Hunting 是一种高级安全活动，通过建立假设主动寻找威胁，而非依赖已知签名。",
    d9_2: "我看到了基于假设执行 IOC 扫描并通过映射 ATT&CK TTP 追踪攻击模式的过程！",
    d9_3: "没错，学习如何为鱼叉式钓鱼附件攻击建立狩猎假设并系统地追踪。从狩猎场收集线索！",
    d10_1: "狩猎完成！我使用'异常子进程创建'假设追踪了 Outlook→cmd→PowerShell 链，并映射到 T1566.001 TTP。",
    d10_2: "完美。给出最终答案：这种建立假设并主动寻找威胁的安全活动的确切名称。",
    d11_1: "我现在完全理解了从 EDR 绕过到 Threat Hunting 的高级鱼叉式钓鱼攻防全貌！",
    d11_2: "辛苦了，{AGENT}。今天的训练内容已盖章记录在最终案例笔记本中。仔细复习。",
    h1: "找到进程注入注射器、DLL 包、<br>以及 NTDLL 解除挂钩的解锁线索。",
    h2: "找到 AMSI 扫描器护盾、内存补丁 CPU、<br>以及混淆技术的眼睛图标。",
    h3: "找到 certutil 下载器、mshta 执行播放器、<br>以及 rundll32 代理旋转图标。",
    h4: "找到检测规则代码文件、误报警告三角形、<br>以及规则生命周期旋转图标。",
    h5: "找到狩猎假设放大镜、IOC 扫描雷达、<br>以及 TTP 映射地图。",
    c_proc_inject_t: "进程注入", c_proc_inject_m: "将恶意 shellcode 插入合法进程（svchost.exe、explorer.exe）的内存空间，使 EDR 将其误认为正常进程的技术。",
    c_dll_sideload_t: "DLL 侧加载", c_dll_sideload_m: "将合法应用程序加载的 DLL 替换为恶意 DLL，在签名进程的上下文中执行恶意代码的技术。",
    c_unhook_ntdll_t: "NTDLL 解除挂钩", c_unhook_ntdll_m: "移除 EDR 在 ntdll.dll 上安装的挂钩（监控代码），禁用系统调用监控并隐藏 API 调用的技术。",
    c_amsi_scan_t: "AMSI 扫描器", c_amsi_scan_m: "Windows Anti-Malware Scan Interface。在执行前将脚本内容（PowerShell、VBScript 等）传递给安全产品进行恶意软件检查。",
    c_mem_patch_t: "内存补丁", c_mem_patch_m: "直接修改 AmsiScanBuffer 函数的内存，使其始终返回 'AMSI_RESULT_CLEAN' 的绕过技术。",
    c_obfuscation_t: "混淆技术", c_obfuscation_m: "应用多层 Base64 编码、XOR 加密、字符串拆分和变量名替换来规避基于签名的检测。",
    c_certutil_dl_t: "certutil 下载", c_certutil_dl_m: "一种 LOLBin 技术，滥用证书管理工具 certutil.exe 的 -urlcache 选项从外部源下载恶意载荷。",
    c_mshta_exec_t: "mshta 执行", c_mshta_exec_m: "使用 Microsoft HTML Application Host（mshta.exe）执行 HTA 文件或内联 JavaScript/VBScript 的技术。",
    c_rundll32_proxy_t: "rundll32 代理", c_rundll32_proxy_m: "使用 rundll32.exe 作为代理执行恶意 DLL 的特定导出函数或运行 JavaScript 的技术。",
    c_detection_rule_t: "检测规则", c_detection_rule_m: "以 Sigma、YARA、Snort 等格式编写的检测规则。定义特定攻击行为的模式以进行自动检测和告警。",
    c_false_positive_t: "误报分析", c_false_positive_m: "分析检测规则错误地将正常行为标记为攻击的误报，并提高规则精度的调优过程。",
    c_rule_lifecycle_t: "规则生命周期", c_rule_lifecycle_m: "Detection Engineering 的核心：系统化管理规则创建、测试、部署、监控、反馈和改进的完整周期。",
    c_hunt_hypothesis_t: "狩猎假设", c_hunt_hypothesis_m: "Threat Hunting 的起点。建立如'应存在来自鱼叉式钓鱼附件的异常子进程'之类的假设。",
    c_ioc_sweep_t: "IOC 扫描", c_ioc_sweep_m: "基于入侵指标（IOC）扫描日志、网络流量和端点，搜索恶意活动的痕迹。",
    c_ttp_mapping_t: "TTP 映射", c_ttp_mapping_m: "将发现的攻击行为映射到 MITRE ATT&CK 的战术、技术和程序，系统地分析攻击者的战术模式。",
    p1_title: "EDR 绕过的关键", p1_desc: "哪种技术通过将<b>恶意代码插入</b>合法进程的内存空间来规避 EDR 检测？",
    p1_opts: ["进程注入", "DLL 劫持", "代码签名", "注册表修改"],
    p2_title: "脚本安全之墙", p2_desc: "哪种攻击绕过 Windows 的<b>脚本安全扫描接口</b>来无检测地执行恶意 PowerShell/VBScript？",
    p2_opts: ["UAC 绕过", "内核漏洞利用", "AMSI 绕过", "防火墙绕过"],
    p3_title: "内部之敌", p3_desc: "不安装额外恶意工具，滥用系统上<b>已安装的合法二进制文件</b>（certutil、mshta、rundll32 等）的攻击技术通用名称是什么？",
    p3_opts: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    p4_title: "防御的科学", p4_desc: "哪个安全学科系统化管理检测规则<b>创建、测试、部署和维护</b>的完整过程？",
    p4_opts: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    p5_title: "主动追踪者", p5_desc: "哪种高级安全活动<b>建立假设并主动</b>寻找未知威胁？",
    p5_opts: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    teamLeader: '队长', agent: '特工', secRate: '确保率', certReport: '结业报告',
    analysisReport: '分析报告', freeMode: '(自由探索模式)',
    proceed: '继续', next: '下一步', closeWindow: '关闭', saveData: '保存数据',
    inventory: '收集数据 (Inventory)', noClues: '尚未收集到任何线索。',
    prevTab: '◀ 上一页', nextTab: '下一页 ▶',
    rTab1: "1. EDR 绕过与注入", rTab2: "2. AMSI 与内存攻击", rTab3: "3. LOLBins 滥用",
    rTab4: "4. Detection Engineering", rTab5: "5. Threat Hunting", rTab6: "6. 训练完成",
    r1_h: "EDR 绕过与进程注入",
    r1_ch1: "Ch 1. 进程注入技术",
    r1_ch1_l1: '通过向合法进程（svchost.exe、explorer.exe）的内存中<span class="text-white bg-white/10 px-1 rounded">注入 shellcode</span> 来绕过 EDR 检测。',
    r1_ch1_l2: "存在多种变体，包括 Classic Injection、Process Hollowing 和 APC Injection。",
    r1_ch2: "Ch 2. DLL 侧加载与 NTDLL 解除挂钩",
    r1_ch2_l1: '利用合法应用程序的 DLL 加载顺序<span class="text-white bg-white/10 px-1 rounded">替换加载恶意 DLL</span>。',
    r1_ch2_l2: "移除 EDR 在 ntdll.dll 上安装的挂钩以禁用系统调用监控。",
    r2_h: "AMSI 与内存攻击",
    r2_ch3: "Ch 3. AMSI 架构与工作原理",
    r2_ch3_p: 'Windows <span class="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span> 是在执行 PowerShell、VBScript 等脚本之前将内容传递给安全产品的接口。',
    r2_ch4: "Ch 4. AMSI 绕过技术",
    r2_ch4_l1: '<span class="text-white bg-white/10 px-1 rounded">直接补丁 AmsiScanBuffer 函数的内存</span>使其始终返回 CLEAN 结果。',
    r2_ch4_l2: "结合多层混淆如 Base64、XOR 和字符串拆分来规避签名检测。",
    r3_h: "LOLBins 滥用",
    r3_ch5: "Ch 5. certutil 与 mshta",
    r3_ch5_l1: '使用 <span class="text-white bg-white/10 px-1 rounded">certutil -urlcache</span> 从外部下载恶意载荷。',
    r3_ch5_l2: "通过 mshta.exe 执行 HTA 文件或内联 JavaScript 来运行初始代码。",
    r3_ch6: "Ch 6. Living off the Land 策略",
    r3_ch6_l1: '使用 <span class="text-white bg-white/10 px-1 rounded">rundll32.exe</span> 作为代理执行恶意 DLL 的导出函数。',
    r3_ch6_l2: "所有 LOLBins 都是 Microsoft 签名的二进制文件，利用传统杀毒软件的白名单机制。",
    r4_h: "Detection Engineering",
    r4_ch7: "Ch 7. 检测规则编写",
    r4_ch7_l1: '以 <span class="text-white bg-white/10 px-1 rounded">Sigma、YARA、Snort</span> 等格式定义攻击行为模式。',
    r4_ch7_l2: "基于 ATT&CK TTP 系统化映射检测覆盖范围。",
    r4_ch8: "Ch 8. 误报管理与规则调优",
    r4_ch8_l1: '执行迭代调优以分析误报并<span class="text-white bg-white/10 px-1 rounded">提高规则精度</span>。',
    r4_ch8_l2: "规则生命周期：管理编写 → 测试 → 部署 → 监控 → 反馈 → 改进的循环。",
    r5_h: "Threat Hunting",
    r5_ch9: "Ch 9. 基于假设的威胁狩猎",
    r5_ch9_p: '<span class="text-white bg-white/10 px-1 rounded">建立假设</span>如\'应存在异常子进程创建\'，通过分析日志和遥测数据主动追踪威胁。',
    r5_ch10: "Ch 10. IOC 扫描与 TTP 映射",
    r5_ch10_l1: '基于 IOC（入侵指标）<span class="text-white bg-white/10 px-1 rounded">系统化扫描</span>端点、网络和日志。',
    r5_ch10_l2: "将发现的攻击行为映射到 MITRE ATT&CK 以分析攻击者的战术模式。",
    r6_title: "训练完成！",
    r6_desc: "从 EDR 绕过到 Threat Hunting，<br/>你出色地完成了<br/>高级鱼叉式钓鱼攻防课程。",
    r6_grade: "最终评级：",
    r6_labBtn: "前往实验室",
    r6_freeHint: "(关闭此窗口可自由重新探索各区域)",
  },
  hi: {
    loc1: 'Sector 1: EDR युद्धक्षेत्र', loc2: 'Sector 2: AMSI विश्लेषण प्रयोगशाला', loc3: 'Sector 3: LOLBins शस्त्रागार', loc4: 'Sector 4: Detection Engineering प्रयोगशाला', loc5: 'Sector 5: Threat Hunting मैदान',
    d1_1: "ध्यान दें! एजेंट {AGENT}, यह मिशन एक उन्नत पाठ्यक्रम है। हमें स्पीयरफ़िशिंग अटैचमेंट द्वारा EDR को बायपास करने की तकनीकों का विश्लेषण करना है।",
    d1_2: "जी हाँ, टीम लीडर! EDR प्रोसेस व्यवहार की निगरानी कर रहा है, लेकिन हमलावर प्रोसेस इंजेक्शन और DLL साइडलोडिंग से पहचान से बच रहे हैं।",
    d1_3: "अच्छा। वे वैध प्रोसेस में दुर्भावनापूर्ण कोड इंजेक्ट करते हैं या NTDLL अनहुक करके EDR की नज़र से बचते हैं। स्थल से सुराग एकत्र करो!",
    d2_1: "मिल गया! हमलावर svchost.exe में shellcode इंजेक्ट कर रहा था और API कॉल छिपाने के लिए EDR हुकिंग हटा रहा था।",
    d2_2: "शाबाश। मुझे बताओ कि वैध प्रोसेस मेमोरी का दुरुपयोग करने वाली इस तकनीक का सटीक नाम क्या है।",
    d3_1: "स्पीयरफ़िशिंग के माध्यम से वितरित मैक्रो और PowerShell पेलोड Windows AMSI द्वारा स्कैन किए जाते हैं। लेकिन वे इसे भी निष्क्रिय कर देते हैं।",
    d3_2: "AMSI स्कैन इंटरफ़ेस दिख रहा है! लेकिन हमलावर मेमोरी पैचिंग से AmsiScanBuffer फ़ंक्शन को बदल रहा है!",
    d3_3: "हाँ, ऑब्फ़स्केशन के साथ मिलाने पर स्क्रिप्ट-आधारित पहचान लगभग असंभव हो जाती है। AMSI ज़ोन से सबूत सुरक्षित करो!",
    d4_1: "सबूत सुरक्षित! मैंने AMSI बायपास करने वाली मेमोरी पैचिंग तकनीक और बहु-स्तरीय Base64+XOR ऑब्फ़स्केशन दोनों की पहचान कर ली।",
    d4_2: "उत्कृष्ट। मुझे बताओ कि Windows की स्क्रिप्ट सुरक्षा स्कैन इंटरफ़ेस को बायपास करने वाले इस हमले का नाम क्या है।",
    d5_1: "स्पीयरफ़िशिंग अटैचमेंट की असली डरावनी बात यह है कि वे बाहरी उपकरण स्थापित किए बिना सिस्टम पर पहले से मौजूद वैध बाइनरी का दुरुपयोग करते हैं।",
    d5_2: "वे certutil से दुर्भावनापूर्ण पेलोड डाउनलोड कर रहे हैं, mshta से HTA स्क्रिप्ट चला रहे हैं, और rundll32 से DLL प्रॉक्सी-एक्ज़ीक्यूट कर रहे हैं!",
    d5_3: "यह Living off the Land रणनीति है। चूँकि ये Microsoft-हस्ताक्षरित बाइनरी हैं, एंटीवायरस को इन्हें ब्लॉक करने में कठिनाई होती है। शस्त्रागार की जाँच करो!",
    d6_1: "शस्त्रागार विश्लेषण पूर्ण! हमलावर वैध बाइनरी चेन बना रहा था: certutil -urlcache, mshta javascript:, rundll32 DllRegisterServer।",
    d6_2: "सही। मुझे बताओ कि सिस्टम पर पहले से स्थापित वैध बाइनरी का दुरुपयोग करने वाली इस हमले की तकनीक का सामान्य नाम क्या है।",
    d7_1: "अब जब हम हमले की तकनीकें जानते हैं, चलो रक्षक के दृष्टिकोण पर स्विच करें। Detection Engineering पहचान नियमों के पूरे जीवनचक्र का प्रबंधन करती है।",
    d7_2: "Sigma/YARA नियम लिखने से लेकर फ़ॉल्स पॉज़िटिव विश्लेषण, नियम तैनाती और रखरखाव तक — सब कुछ व्यवस्थित रूप से प्रबंधित है!",
    d7_3: "एक पहचान नियम को प्रोडक्शन में तैनात करने की प्रक्रिया को समझना ज़रूरी है ताकि सच्चे रक्षक बन सको। प्रयोगशाला से सुराग एकत्र करो!",
    d8_1: "प्रयोगशाला जाँच पूर्ण! पूरे चक्र की पुष्टि हुई: Sigma नियम निर्माण → परीक्षण वातावरण सत्यापन → प्रोडक्शन तैनाती → फ़ॉल्स पॉज़िटिव फ़ीडबैक एकीकरण।",
    d8_2: "उत्कृष्ट। मुझे बताओ कि नियम निर्माण से लेकर रखरखाव तक पूरी प्रक्रिया का प्रबंधन करने वाले इस विषय का सटीक नाम क्या है।",
    d9_1: "अंतिम क्षेत्र। Threat Hunting एक उन्नत सुरक्षा गतिविधि है जो ज्ञात हस्ताक्षरों पर निर्भर रहने के बजाय परिकल्पनाएँ बनाकर सक्रिय रूप से खतरों को खोजती है।",
    d9_2: "मैं परिकल्पनाओं के आधार पर IOC स्वीप करने और ATT&CK TTP में मैपिंग करके हमले के पैटर्न को ट्रैक करने की प्रक्रिया देख सकता हूँ!",
    d9_3: "हाँ, स्पीयरफ़िशिंग अटैचमेंट हमलों के लिए हंटिंग परिकल्पनाएँ बनाना और व्यवस्थित रूप से ट्रैक करना सीखो। शिकारस्थल से सुराग इकट्ठा करो!",
    d10_1: "शिकार पूर्ण! मैंने 'असामान्य चाइल्ड प्रोसेस निर्माण' परिकल्पना का उपयोग करके Outlook→cmd→PowerShell चेन को ट्रैक किया और T1566.001 TTP में मैप किया।",
    d10_2: "परिपूर्ण। अंतिम उत्तर दो: परिकल्पनाएँ बनाकर सक्रिय रूप से खतरों को खोजने वाली इस सुरक्षा गतिविधि का सटीक नाम क्या है।",
    d11_1: "अब मैं EDR बायपास से लेकर Threat Hunting तक, उन्नत स्पीयरफ़िशिंग हमले और रक्षा की पूरी तस्वीर समझ गया हूँ!",
    d11_2: "शाबाश, {AGENT}। आज के प्रशिक्षण की सामग्री को अंतिम केस नोटबुक में मुहर लगा दी गई है। अच्छी तरह से दोहराओ।",
    h1: "प्रोसेस इंजेक्शन सिरिंज, DLL पैकेज, <br>और NTDLL अनहुकिंग अनलॉक सुराग खोजो।",
    h2: "AMSI स्कैनर शील्ड, मेमोरी पैचिंग CPU, <br>और ऑब्फ़स्केशन आँख आइकन खोजो।",
    h3: "certutil डाउनलोड, mshta एक्ज़ीक्यूशन प्लेयर, <br>और rundll32 प्रॉक्सी रोटेशन आइकन खोजो।",
    h4: "डिटेक्शन रूल कोड फ़ाइल, फ़ॉल्स पॉज़िटिव चेतावनी त्रिकोण, <br>और रूल जीवनचक्र रोटेशन आइकन खोजो।",
    h5: "हंटिंग परिकल्पना आवर्धक लेंस, IOC स्वीप रडार, <br>और TTP मैपिंग मानचित्र खोजो।",
    c_proc_inject_t: "प्रोसेस इंजेक्शन", c_proc_inject_m: "वैध प्रोसेस (svchost.exe, explorer.exe) के मेमोरी स्पेस में दुर्भावनापूर्ण shellcode डालने की तकनीक, जिससे EDR उन्हें सामान्य प्रोसेस समझता है।",
    c_dll_sideload_t: "DLL साइडलोडिंग", c_dll_sideload_m: "वैध एप्लिकेशन द्वारा लोड की जाने वाली DLL को दुर्भावनापूर्ण DLL से बदलकर, हस्ताक्षरित प्रोसेस के संदर्भ में दुर्भावनापूर्ण कोड चलाने की तकनीक।",
    c_unhook_ntdll_t: "NTDLL अनहुकिंग", c_unhook_ntdll_m: "EDR द्वारा ntdll.dll पर स्थापित हुक (निगरानी कोड) को हटाने, सिस्टम कॉल मॉनिटरिंग को अक्षम करने और API कॉल छिपाने की तकनीक।",
    c_amsi_scan_t: "AMSI स्कैनर", c_amsi_scan_m: "Windows Anti-Malware Scan Interface। PowerShell, VBScript आदि स्क्रिप्ट निष्पादन से पहले सुरक्षा उत्पादों को सामग्री पास करता है।",
    c_mem_patch_t: "मेमोरी पैचिंग", c_mem_patch_m: "AmsiScanBuffer फ़ंक्शन की मेमोरी को सीधे संशोधित करके हमेशा 'AMSI_RESULT_CLEAN' लौटाने वाली बायपास तकनीक।",
    c_obfuscation_t: "ऑब्फ़स्केशन तकनीकें", c_obfuscation_m: "हस्ताक्षर-आधारित पहचान से बचने के लिए Base64 एन्कोडिंग, XOR एन्क्रिप्शन, स्ट्रिंग विभाजन और वेरिएबल नाम प्रतिस्थापन की बहु परतें लागू करती हैं।",
    c_certutil_dl_t: "certutil डाउनलोड", c_certutil_dl_m: "एक LOLBin तकनीक जो प्रमाणपत्र प्रबंधन टूल certutil.exe के -urlcache विकल्प का दुरुपयोग करके बाहरी स्रोतों से दुर्भावनापूर्ण पेलोड डाउनलोड करती है।",
    c_mshta_exec_t: "mshta एक्ज़ीक्यूशन", c_mshta_exec_m: "Microsoft HTML Application Host (mshta.exe) का उपयोग करके HTA फ़ाइलें या इनलाइन JavaScript/VBScript चलाने की तकनीक।",
    c_rundll32_proxy_t: "rundll32 प्रॉक्सी", c_rundll32_proxy_m: "rundll32.exe को प्रॉक्सी के रूप में उपयोग करके दुर्भावनापूर्ण DLL के विशिष्ट export फ़ंक्शन चलाने या JavaScript निष्पादित करने की तकनीक।",
    c_detection_rule_t: "डिटेक्शन रूल", c_detection_rule_m: "Sigma, YARA, Snort जैसे प्रारूपों में लिखे गए पहचान नियम। स्वचालित पहचान और अलर्ट के लिए विशिष्ट हमले के व्यवहार पैटर्न को परिभाषित करते हैं।",
    c_false_positive_t: "फ़ॉल्स पॉज़िटिव विश्लेषण", c_false_positive_m: "पहचान नियमों द्वारा सामान्य व्यवहार को गलत तरीके से हमले के रूप में चिह्नित करने के फ़ॉल्स पॉज़िटिव का विश्लेषण करने और नियम सटीकता में सुधार की ट्यूनिंग प्रक्रिया।",
    c_rule_lifecycle_t: "रूल जीवनचक्र", c_rule_lifecycle_m: "Detection Engineering का मूल: नियम निर्माण, परीक्षण, तैनाती, निगरानी, फ़ीडबैक और सुधार के पूर्ण चक्र का व्यवस्थित प्रबंधन।",
    c_hunt_hypothesis_t: "हंटिंग परिकल्पना", c_hunt_hypothesis_m: "Threat Hunting का प्रारंभिक बिंदु। 'स्पीयरफ़िशिंग अटैचमेंट से असामान्य चाइल्ड प्रोसेस मौजूद होनी चाहिए' जैसी परिकल्पनाएँ बनाता है।",
    c_ioc_sweep_t: "IOC स्वीप", c_ioc_sweep_m: "दुर्भावनापूर्ण गतिविधि के निशान खोजने के लिए इंडिकेटर ऑफ़ कॉम्प्रोमाइज़ (IOC) के आधार पर लॉग, नेटवर्क ट्रैफ़िक और एंडपॉइंट को स्वीप करता है।",
    c_ttp_mapping_t: "TTP मैपिंग", c_ttp_mapping_m: "खोजे गए हमले के व्यवहार को MITRE ATT&CK के Tactics, Techniques और Procedures में मैप करके हमलावर की सामरिक पैटर्न का व्यवस्थित विश्लेषण करता है।",
    p1_title: "EDR बायपास की कुंजी", p1_desc: "कौन सी तकनीक वैध प्रोसेस के मेमोरी स्पेस में <b>दुर्भावनापूर्ण कोड डालकर</b> EDR पहचान से बचती है？",
    p1_opts: ["प्रोसेस इंजेक्शन", "DLL हाइजैकिंग", "कोड साइनिंग", "रजिस्ट्री संशोधन"],
    p2_title: "स्क्रिप्ट सुरक्षा की दीवार", p2_desc: "कौन सा हमला Windows की <b>स्क्रिप्ट सुरक्षा स्कैन इंटरफ़ेस</b> को बायपास करके बिना पहचान के दुर्भावनापूर्ण PowerShell/VBScript चलाता है？",
    p2_opts: ["UAC बायपास", "कर्नेल एक्सप्लॉइट", "AMSI बायपास", "फ़ायरवॉल बायपास"],
    p3_title: "आंतरिक शत्रु", p3_desc: "अतिरिक्त दुर्भावनापूर्ण उपकरण स्थापित किए बिना, सिस्टम पर <b>पहले से स्थापित वैध बाइनरी</b> (certutil, mshta, rundll32 आदि) का दुरुपयोग करने वाली हमले की तकनीक का सामान्य नाम क्या है？",
    p3_opts: ["Rootkit", "LOLBins", "Bootkit", "Fileless"],
    p4_title: "रक्षा का विज्ञान", p4_desc: "कौन सा सुरक्षा विषय पहचान नियम <b>निर्माण, परीक्षण, तैनाती और रखरखाव</b> की पूरी प्रक्रिया का व्यवस्थित प्रबंधन करता है？",
    p4_opts: ["Incident Response", "Threat Intelligence", "Detection Engineering", "Vulnerability Management"],
    p5_title: "सक्रिय ट्रैकर", p5_desc: "कौन सी उन्नत सुरक्षा गतिविधि <b>परिकल्पनाएँ बनाकर सक्रिय रूप से</b> अज्ञात खतरों को खोजती है？",
    p5_opts: ["Threat Hunting", "Penetration Testing", "Red Teaming", "Bug Bounty"],
    teamLeader: 'टीम लीडर', agent: 'एजेंट', secRate: 'सुरक्षित', certReport: 'समापन रिपोर्ट',
    analysisReport: 'विश्लेषण रिपोर्ट', freeMode: '(स्वतंत्र अन्वेषण मोड)',
    proceed: 'जारी रखें', next: 'अगला', closeWindow: 'बंद करें', saveData: 'डेटा सहेजें',
    inventory: 'एकत्रित डेटा (Inventory)', noClues: 'अभी तक कोई सुराग एकत्र नहीं हुआ।',
    prevTab: '◀ पिछला', nextTab: 'अगला ▶',
    rTab1: "1. EDR बायपास और इंजेक्शन", rTab2: "2. AMSI और मेमोरी हमले", rTab3: "3. LOLBins दुरुपयोग",
    rTab4: "4. Detection Engineering", rTab5: "5. Threat Hunting", rTab6: "6. प्रशिक्षण पूर्ण",
    r1_h: "EDR बायपास और प्रोसेस इंजेक्शन",
    r1_ch1: "Ch 1. प्रोसेस इंजेक्शन तकनीकें",
    r1_ch1_l1: 'वैध प्रोसेस (svchost.exe, explorer.exe) की मेमोरी में <span class="text-white bg-white/10 px-1 rounded">shellcode इंजेक्ट</span> करके EDR पहचान को बायपास करता है।',
    r1_ch1_l2: "Classic Injection, Process Hollowing और APC Injection सहित विभिन्न संस्करण मौजूद हैं।",
    r1_ch2: "Ch 2. DLL साइडलोडिंग और NTDLL अनहुकिंग",
    r1_ch2_l1: 'वैध एप्लिकेशन के DLL लोडिंग क्रम का शोषण करके <span class="text-white bg-white/10 px-1 rounded">दुर्भावनापूर्ण DLL लोड</span> कराता है।',
    r1_ch2_l2: "सिस्टम कॉल मॉनिटरिंग अक्षम करने के लिए EDR द्वारा ntdll.dll पर स्थापित हुक हटाता है।",
    r2_h: "AMSI और मेमोरी हमले",
    r2_ch3: "Ch 3. AMSI आर्किटेक्चर और कार्यप्रणाली",
    r2_ch3_p: 'Windows <span class="text-white bg-white/10 px-1 rounded">Anti-Malware Scan Interface</span> एक इंटरफ़ेस है जो PowerShell, VBScript जैसी स्क्रिप्ट चलाने से पहले सुरक्षा उत्पादों को सामग्री पास करता है।',
    r2_ch4: "Ch 4. AMSI बायपास तकनीकें",
    r2_ch4_l1: 'AmsiScanBuffer फ़ंक्शन की मेमोरी को <span class="text-white bg-white/10 px-1 rounded">सीधे पैच</span> करके हमेशा CLEAN परिणाम लौटाता है।',
    r2_ch4_l2: "हस्ताक्षर पहचान से बचने के लिए Base64, XOR और स्ट्रिंग विभाजन जैसी बहु-स्तरीय ऑब्फ़स्केशन को जोड़ता है।",
    r3_h: "LOLBins दुरुपयोग",
    r3_ch5: "Ch 5. certutil और mshta",
    r3_ch5_l1: '<span class="text-white bg-white/10 px-1 rounded">certutil -urlcache</span> का उपयोग करके बाहरी दुर्भावनापूर्ण पेलोड डाउनलोड करता है।',
    r3_ch5_l2: "प्रारंभिक कोड चलाने के लिए mshta.exe के माध्यम से HTA फ़ाइलें या इनलाइन JavaScript निष्पादित करता है।",
    r3_ch6: "Ch 6. Living off the Land रणनीति",
    r3_ch6_l1: 'दुर्भावनापूर्ण DLL के export फ़ंक्शन निष्पादित करने के लिए <span class="text-white bg-white/10 px-1 rounded">rundll32.exe</span> को प्रॉक्सी के रूप में उपयोग करता है।',
    r3_ch6_l2: "सभी LOLBins Microsoft-हस्ताक्षरित बाइनरी हैं, जो पारंपरिक एंटीवायरस की व्हाइटलिस्ट का शोषण करते हैं।",
    r4_h: "Detection Engineering",
    r4_ch7: "Ch 7. डिटेक्शन रूल लेखन",
    r4_ch7_l1: '<span class="text-white bg-white/10 px-1 rounded">Sigma, YARA, Snort</span> जैसे प्रारूपों में हमले के व्यवहार पैटर्न को परिभाषित करता है।',
    r4_ch7_l2: "ATT&CK TTP के आधार पर पहचान कवरेज को व्यवस्थित रूप से मैप करता है।",
    r4_ch8: "Ch 8. फ़ॉल्स पॉज़िटिव प्रबंधन और रूल ट्यूनिंग",
    r4_ch8_l1: 'फ़ॉल्स पॉज़िटिव का विश्लेषण करने और <span class="text-white bg-white/10 px-1 rounded">नियम सटीकता में सुधार</span> के लिए पुनरावृत्त ट्यूनिंग करता है।',
    r4_ch8_l2: "रूल जीवनचक्र: लेखन → परीक्षण → तैनाती → निगरानी → फ़ीडबैक → सुधार के चक्र का प्रबंधन।",
    r5_h: "Threat Hunting",
    r5_ch9: "Ch 9. परिकल्पना-आधारित Threat Hunting",
    r5_ch9_p: '\'असामान्य चाइल्ड प्रोसेस निर्माण मौजूद होना चाहिए\' जैसी <span class="text-white bg-white/10 px-1 rounded">परिकल्पनाएँ बनाकर</span> लॉग और टेलीमेट्री का विश्लेषण करते हुए सक्रिय रूप से खतरों को ट्रैक करता है।',
    r5_ch10: "Ch 10. IOC स्वीप और TTP मैपिंग",
    r5_ch10_l1: 'IOC (इंडिकेटर ऑफ़ कॉम्प्रोमाइज़) के आधार पर एंडपॉइंट, नेटवर्क और लॉग को <span class="text-white bg-white/10 px-1 rounded">व्यवस्थित रूप से स्वीप</span> करता है।',
    r5_ch10_l2: "खोजे गए हमले के व्यवहार को MITRE ATT&CK में मैप करके हमलावर की सामरिक पैटर्न का विश्लेषण करता है।",
    r6_title: "प्रशिक्षण पूर्ण!",
    r6_desc: "EDR बायपास से Threat Hunting तक,<br/>आपने उन्नत स्पीयरफ़िशिंग<br/>हमला और रक्षा पाठ्यक्रम उत्कृष्ट रूप से पूरा किया।",
    r6_grade: "अंतिम ग्रेड:",
    r6_labBtn: "प्रयोगशाला में जाएँ",
    r6_freeHint: "(इस विंडो को बंद करके प्रत्येक सेक्टर को स्वतंत्र रूप से पुनः अन्वेषण करें)",
  },
};

const getT = (lang) => T[lang] || T.ko;

// ──────────────────────────────────────────────────────────────────────────────
// [게임 데이터] 시나리오 및 단서 (T1566.001 Spearphishing Attachment — Advanced)
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
    { id: 'proc_inject',   icon: Syringe,  title: t.c_proc_inject_t,  msg: t.c_proc_inject_m },
    { id: 'dll_sideload',  icon: Package,  title: t.c_dll_sideload_t, msg: t.c_dll_sideload_m },
    { id: 'unhook_ntdll',  icon: Unlock,   title: t.c_unhook_ntdll_t, msg: t.c_unhook_ntdll_m }
  ],
  scene_phase2: [
    { id: 'amsi_scan',     icon: Shield,   title: t.c_amsi_scan_t,    msg: t.c_amsi_scan_m },
    { id: 'mem_patch',     icon: Cpu,      title: t.c_mem_patch_t,    msg: t.c_mem_patch_m },
    { id: 'obfuscation',   icon: Eye,      title: t.c_obfuscation_t,  msg: t.c_obfuscation_m }
  ],
  scene_phase3: [
    { id: 'certutil_dl',   icon: Download,  title: t.c_certutil_dl_t,    msg: t.c_certutil_dl_m },
    { id: 'mshta_exec',    icon: Play,      title: t.c_mshta_exec_t,     msg: t.c_mshta_exec_m },
    { id: 'rundll32_proxy', icon: RefreshCw, title: t.c_rundll32_proxy_t, msg: t.c_rundll32_proxy_m }
  ],
  scene_phase4: [
    { id: 'detection_rule', icon: FileCode,      title: t.c_detection_rule_t,  msg: t.c_detection_rule_m },
    { id: 'false_positive', icon: AlertTriangle,  title: t.c_false_positive_t, msg: t.c_false_positive_m },
    { id: 'rule_lifecycle', icon: RotateCw,       title: t.c_rule_lifecycle_t, msg: t.c_rule_lifecycle_m }
  ],
  scene_phase5: [
    { id: 'hunt_hypothesis', icon: Search, title: t.c_hunt_hypothesis_t, msg: t.c_hunt_hypothesis_m },
    { id: 'ioc_sweep',      icon: Radar,  title: t.c_ioc_sweep_t,       msg: t.c_ioc_sweep_m },
    { id: 'ttp_mapping',    icon: Map,    title: t.c_ttp_mapping_t,      msg: t.c_ttp_mapping_m }
  ]
});

const buildPUZZLES = (t) => ({
  1: { title: t.p1_title, desc: t.p1_desc, options: t.p1_opts, answer: 0 },
  2: { title: t.p2_title, desc: t.p2_desc, options: t.p2_opts, answer: 2 },
  3: { title: t.p3_title, desc: t.p3_desc, options: t.p3_opts, answer: 1 },
  4: { title: t.p4_title, desc: t.p4_desc, options: t.p4_opts, answer: 2 },
  5: { title: t.p5_title, desc: t.p5_desc, options: t.p5_opts, answer: 0 },
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
      {generateClueItem('proc_inject',  0, Syringe,  "#FF3333", t.c_proc_inject_t)}
      {generateClueItem('dll_sideload', 1, Package,  "#00E5FF", t.c_dll_sideload_t)}
      {generateClueItem('unhook_ntdll', 2, Unlock,   "#DFB8B6", t.c_unhook_ntdll_t)}
    </>);
    if (scene === 'scene_phase2') return (<>
      {generateClueItem('amsi_scan',   0, Shield,  "#10B981", t.c_amsi_scan_t)}
      {generateClueItem('mem_patch',   1, Cpu,     "#FF6B6B", t.c_mem_patch_t)}
      {generateClueItem('obfuscation', 2, Eye,     "#DFB8B6", t.c_obfuscation_t)}
    </>);
    if (scene === 'scene_phase3') return (<>
      {generateClueItem('certutil_dl',    0, Download,  "#DFB8B6", t.c_certutil_dl_t)}
      {generateClueItem('mshta_exec',     1, Play,      "#00E5FF", t.c_mshta_exec_t)}
      {generateClueItem('rundll32_proxy', 2, RefreshCw, "#FF6B6B", t.c_rundll32_proxy_t)}
    </>);
    if (scene === 'scene_phase4') return (<>
      {generateClueItem('detection_rule', 0, FileCode,      "#00E5FF", t.c_detection_rule_t)}
      {generateClueItem('false_positive', 1, AlertTriangle, "#FF6B6B", t.c_false_positive_t)}
      {generateClueItem('rule_lifecycle', 2, RotateCw,      "#10B981", t.c_rule_lifecycle_t)}
    </>);
    if (scene === 'scene_phase5') return (<>
      {generateClueItem('hunt_hypothesis', 0, Search, "#DFB8B6", t.c_hunt_hypothesis_t)}
      {generateClueItem('ioc_sweep',       1, Radar,  "#00E5FF", t.c_ioc_sweep_t)}
      {generateClueItem('ttp_mapping',     2, Map,    "#10B981", t.c_ttp_mapping_t)}
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
                    <div className="text-[9px] text-[#00E5FF] tracking-widest font-mono">ADVANCED DEBRIEFING</div>
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
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r1_ch1_l1 }} />
                                <li>{t.r1_ch1_l2}</li>
                              </ul>
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
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r3_ch5_l1 }} />
                                <li>{t.r3_ch5_l2}</li>
                              </ul>
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
                              <ul className="list-disc pl-5 space-y-2">
                                <li dangerouslySetInnerHTML={{ __html: t.r4_ch7_l1 }} />
                                <li>{t.r4_ch7_l2}</li>
                              </ul>
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

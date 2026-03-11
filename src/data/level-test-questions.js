/**
 * 레벨 테스트 문제 은행 (정적 폴백 데이터)
 * - Supabase level_test_questions 테이블에서 불러오기 실패 시 사용
 * - 레벨 1~5 각 20문제, 총 100문제
 * - 카테고리 5축: 네트워크/OS, 보안기초, ATT&CK 전술, 위협 탐지, 심화/CTI
 */

// 카테고리 매핑 (질문 텍스트의 [태그] → 레이더 차트용 카테고리)
const TAG_TO_CATEGORY = {
  '네트워크': '네트워크/OS',
  '운영체제': '네트워크/OS',
  '보안기초': '보안기초',
  'ATT&CK': 'ATT&CK 전술',
  '심화 분석': '심화/CTI',
};

export const CATEGORIES = ['네트워크/OS', '보안기초', 'ATT&CK 전술', '위협 탐지', '심화/CTI'];

// 레이더 차트 라벨 다국어 (CATEGORIES 순서와 1:1 대응)
export const CATEGORIES_I18N = {
  ko: ['네트워크/OS', '보안기초', 'ATT&CK 전술', '위협 탐지', '심화/CTI'],
  en: ['Network/OS', 'Security Basics', 'ATT&CK Tactics', 'Threat Detection', 'Advanced/CTI'],
  ja: ['ネットワーク/OS', 'セキュリティ基礎', 'ATT&CK戦術', '脅威検知', '高度/CTI'],
  zh: ['网络/OS', '安全基础', 'ATT&CK战术', '威胁检测', '高级/CTI'],
  hi: ['नेटवर्क/OS', 'सुरक्षा मूल', 'ATT&CK रणनीति', 'खतरा पहचान', 'उन्नत/CTI'],
};

export const LEVEL_NAMES = {
  1: { ko: '비기너', en: 'Beginner', ja: 'ビギナー', zh: '入门', hi: 'शुरुआती', key: 'beginner' },
  2: { ko: '초급', en: 'Junior', ja: '初級', zh: '初级', hi: 'जूनियर', key: 'junior' },
  3: { ko: '중급', en: 'Intermediate', ja: '中級', zh: '中级', hi: 'मध्यम', key: 'intermediate' },
  4: { ko: '고급', en: 'Advanced', ja: '上級', zh: '高级', hi: 'उन्नत', key: 'advanced' },
  5: { ko: '전문가', en: 'Expert', ja: 'エキスパート', zh: '专家', hi: 'विशेषज्ञ', key: 'expert' },
};

export const LEVEL_COLORS = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#a855f7',
  4: '#f97316',
  5: '#ef4444',
};

// rawBank: [question, [opt1,opt2,opt3,opt4], correctIndex]
const rawBank = {
  1: [
    ["[네트워크] 웹 브라우저가 도메인 이름을 IP 주소로 변환하기 위해 가장 먼저 접속하는 서버는?", ["DHCP 서버", "DNS 서버", "FTP 서버", "프록시 서버"], 1],
    ["[보안기초] 데이터를 암호화하여 인질로 잡고 금전을 요구하는 악성코드의 명칭은?", ["스파이웨어", "루트킷", "랜섬웨어", "애드웨어"], 2],
    ["[운영체제] Linux에서 현재 디렉토리의 파일 목록을 상세히 확인하는 명령어는?", ["ls -l", "cd ..", "mkdir", "pwd"], 0],
    ["[보안기초] 단방향 암호화 기술로, 주로 비밀번호의 무결성을 검증하는 데 사용하는 것은?", ["AES", "RSA", "Base64", "Hash (SHA-256)"], 3],
    ["[네트워크] TCP/IP 통신에서 연결을 맺기 위해 수행하는 3단계 과정은?", ["3-Way Handshake", "4-Way Handshake", "ARP Request", "Ping Sweep"], 0],
    ["[네트워크] 외부 네트워크와 내부 네트워크 사이에서 트래픽을 허용/차단하는 기본 보안 장비는?", ["스위치(Switch)", "방화벽(Firewall)", "허브(Hub)", "라우터(Router)"], 1],
    ["[보안기초] 사용자가 클릭하도록 유도하여 악성 스크립트를 실행하거나 정보를 탈취하는 이메일 공격 기법은?", ["피싱(Phishing)", "스니핑(Sniffing)", "DDoS", "포트 스캐닝"], 0],
    ["[네트워크] HTTP 통신을 암호화하여 보안을 강화한 프로토콜의 이름은?", ["HTTP2", "HTTPS", "SSH", "Telnet"], 1],
    ["[네트워크] IP 주소 고갈 문제를 해결하기 위해 도입된 차세대 IP 주소 체계는?", ["IPv4", "IPv5", "IPv6", "MAC 주소"], 2],
    ["[운영체제] 운영체제(OS)의 가장 핵심이 되며 하드웨어와 소프트웨어를 제어하는 부분은?", ["쉘(Shell)", "커널(Kernel)", "부트로더", "터미널"], 1],
    ["[네트워크] 네트워크 상에서 트래픽을 가로채서 몰래 엿보는 행위를 뜻하는 용어는?", ["스푸핑", "스니핑(Sniffing)", "파밍", "스미싱"], 1],
    ["[보안기초] 데이터의 송수신이 안전하게 이루어지는지 모니터링만 수행하는 장비는?", ["IPS", "방화벽", "IDS(침입 탐지 시스템)", "VPN"], 2],
    ["[보안기초] 알려지지 않은 새로운 취약점을 이용해 보안 패치가 나오기 전에 감행하는 공격은?", ["SQL Injection", "Zero-Day 공격", "Brute Force", "XSS"], 1],
    ["[네트워크] 인터넷을 통해 원격으로 서버에 안전하게 접속하기 위해 사용하는 프로토콜(포트 22)은?", ["Telnet", "FTP", "SSH", "RDP"], 2],
    ["[운영체제] Windows에서 IP 구성 정보와 MAC 주소를 확인하는 명령어는?", ["ifconfig", "ipconfig /all", "netstat", "ping"], 1],
    ["[보안기초] 가짜 웹사이트로 접속을 유도하여 금융 정보 등을 탈취하는 공격 방식은?", ["파밍(Pharming)", "랜섬웨어", "백도어", "APT"], 0],
    ["[보안기초] 인가되지 않은 사용자가 시스템에 접근하지 못하도록 막는 가장 기본적인 인증 수단은?", ["VPN", "패스워드(Password)", "암호화", "IDS"], 1],
    ["[보안기초] 데이터베이스의 데이터를 조회, 수정, 삭제하기 위해 사용하는 언어는?", ["HTML", "C++", "SQL", "Python"], 2],
    ["[네트워크] 웹사이트에서 클라이언트의 상태 정보를 브라우저에 임시로 저장하는 파일은?", ["캐시", "쿠키(Cookie)", "세션", "토큰"], 1],
    ["[보안기초] 다수의 PC를 감염시켜 특정 타겟 서버에 동시에 트래픽을 보내 다운시키는 공격은?", ["DDoS", "Ransomware", "Phishing", "MITM"], 0],
  ],
  2: [
    ["[ATT&CK] MITRE ATT&CK 프레임워크에서 공격자의 궁극적인 목적을 분류한 상위 카테고리는?", ["Technique (기법)", "Tactic (전술)", "Procedure (절차)", "Sub-technique"], 1],
    ["[ATT&CK] 공격자가 시스템에 최초로 접근 권한을 얻는 단계를 의미하는 Tactic은?", ["Execution", "Initial Access", "Persistence", "Impact"], 1],
    ["[보안기초] 엔드포인트(PC/서버)에서 발생하는 악성 행위를 탐지하고 대응하는 보안 솔루션은?", ["WAF", "EDR", "NAC", "VPN"], 1],
    ["[보안기초] 웹 애플리케이션의 취약점을 노리는 공격(예: SQLi, XSS)을 전용으로 방어하는 시스템은?", ["WAF (웹 방화벽)", "IPS", "F/W", "DLP"], 0],
    ["[ATT&CK] 공격자가 재부팅 이후에도 지속적으로 시스템에 접근하기 위해 레지스트리 등을 조작하는 Tactic은?", ["Privilege Escalation", "Lateral Movement", "Persistence", "Discovery"], 2],
    ["[ATT&CK] 피싱 메일의 첨부파일(악성 매크로)을 실행하여 코드가 동작하는 단계에 해당하는 Tactic은?", ["Initial Access", "Execution", "Collection", "Impact"], 1],
    ["[보안기초] 조직 내 다양한 보안 장비의 로그를 중앙 집중화하여 상관 분석을 수행하는 시스템은?", ["SIEM", "IDS", "EDR", "VPN"], 0],
    ["[ATT&CK] 일반 사용자 권한을 탈취한 후, 시스템 관리자(Admin/Root) 권한을 얻어내는 단계는?", ["Credential Access", "Privilege Escalation", "Defense Evasion", "Discovery"], 1],
    ["[ATT&CK] 공격자가 백신(AV)이나 EDR의 탐지를 피하기 위해 악성코드를 난독화하거나 프로세스를 숨기는 행위는?", ["Lateral Movement", "Defense Evasion", "Exfiltration", "Execution"], 1],
    ["[ATT&CK] 이미 장악한 내부망의 특정 PC에서, 연결된 다른 서버나 PC로 공격 범위를 넓혀가는 행위는?", ["Discovery", "Impact", "Lateral Movement", "Initial Access"], 2],
    ["[네트워크] 네트워크 외부에서 내부망에 안전하게 접속하기 위해 암호화된 터널을 생성하는 기술은?", ["VPN", "VLAN", "Proxy", "NAT"], 0],
    ["[ATT&CK] 공격자가 시스템의 계정 정보, 패스워드 해시, 토큰 등을 훔쳐내는 행위를 나타내는 Tactic은?", ["Discovery", "Collection", "Credential Access", "Impact"], 2],
    ["[ATT&CK] 침투 대상 시스템의 OS 버전, 설치된 소프트웨어, 네트워크 구성 등을 탐색하는 단계는?", ["Discovery", "Execution", "Defense Evasion", "Persistence"], 0],
    ["[ATT&CK] 시스템에 저장된 민감한 데이터를 외부(C2 서버 등)로 빼돌리는 행위를 의미하는 Tactic은?", ["Exfiltration", "Impact", "Collection", "Lateral Movement"], 0],
    ["[ATT&CK] 랜섬웨어가 데이터를 암호화하여 시스템 사용을 불가능하게 만들거나 파괴하는 행동의 Tactic은?", ["Impact", "Execution", "Exfiltration", "Persistence"], 0],
    ["[보안기초] Cyber Kill Chain 모델에서 공격자가 악성코드를 대상 시스템에 전달하는 단계는?", ["Reconnaissance", "Delivery", "Exploitation", "Installation"], 1],
    ["[네트워크] 공격자가 감염된 좀비 PC들에게 명령을 내리고 제어하기 위해 통신하는 서버는?", ["DNS 서버", "C2 (Command & Control) 서버", "웹 서버", "프록시 서버"], 1],
    ["[보안기초] 내부 정보를 외부로 유출하는 것을 방지하기 위해 사용되는 보안 솔루션은?", ["DLP", "IPS", "WAF", "SIEM"], 0],
    ["[운영체제] Windows 시스템에서 시스템 및 보안 관련 이벤트 로그를 기록하고 관리하는 구성 요소는?", ["Task Manager", "Event Viewer", "Registry", "Command Prompt"], 1],
    ["[보안기초] 비밀번호를 알아내기 위해 가능한 모든 문자 조합을 무작위로 대입해 보는 공격 기법은?", ["SQL Injection", "Brute Force", "Phishing", "XSS"], 1],
  ],
  3: [
    ["[ATT&CK] 관리자의 패스워드를 모른 채 해시(Hash) 값만 탈취하여 NTLM 인증을 우회 통과하는 공격 기법은?", ["Pass the Hash", "Brute Force", "Kerberoasting", "Golden Ticket"], 0],
    ["[심화 분석] Windows 이벤트 로그에서 '프로세스 생성(Process Creation)'을 의미하는 가장 대표적인 Event ID는?", ["4624", "4625", "4688", "5140"], 2],
    ["[ATT&CK] 공격자가 정상적인 시스템 파일(예: svchost.exe)의 이름이나 아이콘으로 악성코드를 위장하는 기법은?", ["Masquerading", "Process Injection", "DLL Hijacking", "Rootkit"], 0],
    ["[ATT&CK] Windows 관리 도구인 WMI를 활용하여 원격 시스템에서 명령을 실행하는 행위와 매칭되는 Tactic은?", ["Execution", "Initial Access", "Defense Evasion", "Impact"], 0],
    ["[심화 분석] 특정 기업에서만 사용하는 정상 소프트웨어의 업데이트 서버를 해킹하여 악성코드를 유포하는 방식은?", ["Watering Hole", "Supply Chain Attack", "Spear Phishing", "Drive-by Compromise"], 1],
    ["[운영체제] Windows 시스템 부팅 시 자동으로 시작되는 프로그램 목록이 등록되는 대표적인 레지스트리 키는?", ["HKEY_CLASSES_ROOT", "Run / RunOnce 키", "SAM 데이터베이스", "LSA Secrets"], 1],
    ["[보안기초] 공격자가 타겟 조직의 임직원들이 자주 방문하는 웹사이트를 해킹해 두고, 접속 시 감염되게 만드는 공격은?", ["Watering Hole Attack", "Phishing", "DDoS", "SQL Injection"], 0],
    ["[ATT&CK] 실행 중인 다른 정상 프로세스(예: explorer.exe)의 메모리 공간에 악성 코드를 삽입하여 실행시키는 기법은?", ["Process Injection", "DLL Hijacking", "Masquerading", "Obfuscation"], 0],
    ["[ATT&CK] 악성코드가 C2 서버와 통신할 때, 방화벽 탐지를 피하기 위해 정상적인 HTTP/HTTPS 트래픽처럼 위장하는 기법은?", ["Port Knocking", "Protocol Tunneling / Standard Application Layer Protocol", "Domain Fronting", "Fast Flux"], 1],
    ["[운영체제] Windows에서 시스템 자격 증명(패스워드 해시 등)이 메모리에 평문으로 남는 프로세스로, 미미카츠(Mimikatz)의 주요 타겟이 되는 것은?", ["explorer.exe", "lsass.exe", "svchost.exe", "smss.exe"], 1],
    ["[ATT&CK] 공격자가 악성 스크립트를 메모리 상에서만 실행하고 하드디스크에 파일을 남기지 않는 공격 형태는?", ["Fileless Attack", "Ransomware", "Rootkit", "Bootkit"], 0],
    ["[심화 분석] Windows 이벤트 로그 중 '로그온 성공(Logon Success)'을 나타내는 Event ID는?", ["4688", "4624", "4625", "1102"], 1],
    ["[심화 분석] 보안 관제에서 다양한 보안 장비의 알람(Alert)을 하나의 표준화된 룰(Rule) 포맷으로 작성하여 탐지하는 범용 시그니처 언어는?", ["YARA", "Snort", "Sigma", "Suricata"], 2],
    ["[ATT&CK] 시스템에 저장된 데이터를 압축하고 비밀번호를 걸어 묶는 행위(Archive Collected Data)는 다음 중 어떤 Tactic을 위한 준비 과정인가?", ["Execution", "Collection / Exfiltration", "Initial Access", "Defense Evasion"], 1],
    ["[보안기초] 웹 취약점 중 클라이언트의 브라우저에서 악성 스크립트가 실행되게 하여 세션 쿠키를 탈취하는 공격은?", ["SQL Injection", "XSS (Cross-Site Scripting)", "CSRF", "SSRF"], 1],
    ["[ATT&CK] Active Directory 환경에서 도메인 컨트롤러(DC)의 전체 계정 해시 데이터를 추출하는 공격 기법은?", ["Kerberoasting", "DCSync", "Pass the Ticket", "LLMNR Poisoning"], 1],
    ["[ATT&CK] 방어자가 공격자의 공격 기법(Technique)을 어떻게 탐지할지 시각화하고 커버리지를 분석하기 위해 사용하는 MITRE의 도구는?", ["Caldera", "ATT&CK Navigator", "D3FEND", "Engage"], 1],
    ["[운영체제] 리눅스(Linux) 시스템에서 예약된 작업을 통해 지속성(Persistence)을 유지하기 위해 가장 자주 조작되는 파일/명령어는?", ["/etc/passwd", "iptables", "cron (crontab)", "systemctl"], 2],
    ["[심화 분석] 악성 매크로가 포함된 문서(.docm)가 실행되었을 때, EDR 로그 상 부모 프로세스로 가장 적절한 것은?", ["cmd.exe", "powershell.exe", "WINWORD.EXE", "explorer.exe"], 2],
    ["[ATT&CK] 특정 프로세스가 UAC(사용자 계정 컨트롤) 창을 띄우지 않고 몰래 관리자 권한을 획득하는 기법들을 통칭하는 용어는?", ["UAC Bypass", "Token Manipulation", "Process Doppelganging", "Rootkit"], 0],
  ],
  4: [
    ["[심화 분석] 이벤트 로그에서 PowerShell Base64 인코딩 명령 실행을 정규식으로 탐지하려는 구체적인 행위는?", ["PowerShell Base64 인코딩 명령 실행", "네트워크 포트 스캐닝", "웹쉘 파일 업로드", "비밀번호 Brute Force"], 0],
    ["[ATT&CK] Active Directory 환경에서 서비스 계정의 SPN(Service Principal Name)을 조회하여 TGS 티켓을 탈취하고 오프라인에서 크랙하는 공격은?", ["DCSync", "Kerberoasting", "Pass the Hash", "Golden Ticket"], 1],
    ["[ATT&CK] 정상적인 서비스(Service) 바이너리의 경로에 따옴표가 누락된 취약점을 이용해 권한을 상승시키는 기법은?", ["DLL Search Order Hijacking", "Unquoted Service Path", "Scheduled Task", "Registry Run Keys"], 1],
    ["[ATT&CK] 공격자가 EDR이나 백신의 메모리 스캐닝을 우회하기 위해, 하위 시스템 호출(Syscall) 레벨에서 직접 실행하는 기법은?", ["Process Hollowing", "Direct Syscalls", "AMSI Bypass", "Reflective DLL Injection"], 1],
    ["[심화 분석] Windows 이벤트 ID 1102번이 갑자기 발생했습니다. 이는 공격자의 어떤 행위를 강하게 의심할 수 있습니까?", ["관리자 계정 생성", "보안 로그 삭제 (Indicator Removal)", "원격 데스크톱 접속 성공", "악성 서비스 등록"], 1],
    ["[ATT&CK] 공격자가 침투 후 vssadmin.exe delete shadows /all /quiet 명령을 실행했습니다. 이는 어떤 Tactic과 밀접하게 연관되어 있습니까?", ["Initial Access", "Collection", "Impact (Inhibit System Recovery)", "Lateral Movement"], 2],
    ["[ATT&CK] Active Directory에서 krbtgt 계정의 NTLM 해시를 탈취하여 조작된 TGT 티켓을 생성해 도메인 전체 권한을 행사하는 공격은?", ["Silver Ticket", "Golden Ticket", "Pass the Hash", "AS-REP Roasting"], 1],
    ["[ATT&CK] 정상적인 프로그램이 실행될 때 로드해야 할 DLL 파일을 악성 DLL 파일로 먼저 가로채어 실행시키는 기법은?", ["Process Hollowing", "DLL Search Order Hijacking", "Masquerading", "Code Signing 우회"], 1],
    ["[ATT&CK] PowerShell 실행 시 기본적으로 스크립트의 악성 여부를 검사하는 윈도우 내장 보안 인터페이스를 무력화하는 기법은?", ["UAC Bypass", "AMSI Bypass", "ETW Patching", "Sysmon Evasion"], 1],
    ["[심화 분석] cmd.exe를 통해 PowerShell로 원격 페이로드를 다운로드하여 메모리에서 실행하는 패턴은 어떤 기법에 해당합니까?", ["Fileless Execution / Ingress Tool Transfer", "Pass the Ticket", "Account Discovery", "Data Staged"], 0],
    ["[심화 분석] 방어자가 공격자의 행동을 사전에 모사(Emulate)하고 탐지 룰을 검증하기 위해 오픈소스로 제공되는 자동화 프레임워크는?", ["Snort", "Metasploit", "Atomic Red Team / Caldera", "Wireshark"], 2],
    ["[심화 분석] 침해사고 시, 메모리에서만 동작하고 사라진 악성코드의 흔적을 찾기 위해 덤프 파일을 분석하는 도구는?", ["Nmap", "Volatility", "Burp Suite", "Autopsy"], 1],
    ["[ATT&CK] 공격자가 이메일 서버의 규칙(Inbox Rules)을 악의적으로 설정하여 이메일을 외부로 자동 전달하게 하는 행동의 Tactic은?", ["Collection", "Initial Access", "Execution", "Lateral Movement"], 0],
    ["[ATT&CK] 공격자가 악성 페이로드를 정상적인 인증서로 서명된 것처럼 위장하여 탐지를 피하는 기법은?", ["Subvert Trust Controls (Code Signing)", "Obfuscated Files", "Software Packing", "Indicator Removal"], 0],
    ["[심화 분석] 리눅스 EDR 분석 중 /etc/ld.so.preload 파일이 수정된 것을 발견했습니다. 어떤 기법과 관련이 깊습니까?", ["Cron Job", "SSH Authorized Keys", "Dynamic Linker Hijacking (LD_PRELOAD)", "Web Shell"], 2],
    ["[ATT&CK] 도메인 권한이 없는 사용자가 도메인 컨트롤러에 취약점을 통해 시스템 권한을 얻는 과정은 어떤 Tactic입니까?", ["Credential Access", "Lateral Movement", "Privilege Escalation", "Impact"], 2],
    ["[심화 분석] Sysmon 이벤트 ID 8번(CreateRemoteThread)이 탐지되었습니다. 공격자가 어떤 행위를 시도한 것입니까?", ["파일 삭제", "Process Injection (다른 프로세스 메모리 조작)", "네트워크 연결", "레지스트리 수정"], 1],
    ["[ATT&CK] 데이터 유출 시, DNS 쿼리 메시지 내부에 데이터를 인코딩하여 외부로 빼내는 기법은?", ["Protocol Tunneling", "Exfiltration Over Alternative Protocol (DNS Tunneling)", "Data Encrypted", "Automated Exfiltration"], 1],
    ["[운영체제] 방어자의 EDR 제품이 특정 프로세스의 API 호출을 모니터링하기 위해 사용하는 User-land 방식의 기술은?", ["Kernel Driver", "API Hooking", "Event Tracing", "Minifilter"], 1],
    ["[ATT&CK] 클라우드 환경에서 탈취한 Access Key로 인스턴스 스냅샷을 생성하고 외부 계정으로 공유하는 행위는?", ["Defense Evasion", "Initial Access", "Collection & Exfiltration", "Execution"], 2],
  ],
  5: [
    ["[심화 분석] MITRE ATT&CK에 대응하여, 방어자의 기술과 아키텍처를 시스템적으로 분류해 놓은 프레임워크의 이름은?", ["MITRE Engage", "MITRE D3FEND", "MITRE Shield", "Cyber Kill Chain"], 1],
    ["[심화 분석] APT 그룹의 CTI 보고서를 분석하여 ATT&CK TTPs로 추출/맵핑하는 과정의 핵심 목적은?", ["공격자 IP 차단 리스트 생성", "조직 맞춤형 방어 커버리지(Threat-Informed Defense) 갭 식별", "새로운 백신 시그니처 배포", "보안 예산 삭감"], 1],
    ["[ATT&CK] Windows ETW 기능을 메모리 패치하여 EDR이나 Sysmon 텔레메트리 수집 자체를 눈멀게 하는 고급 우회 기법은?", ["AMSI Bypass", "ETW Patching (Event Tracing Evasion)", "Direct Syscalls", "Process Hollowing"], 1],
    ["[심화 분석] MITRE Engage 프레임워크에서 방어자가 공격자를 속이거나 상호작용하여 정보를 수집하는 전략과 가장 거리가 먼 것은?", ["Honeypots 구축", "Lure Data 배포", "정적 방화벽 차단 룰 적용", "Adversary Engagement"], 2],
    ["[ATT&CK] 공격자가 C2 인프라 IP를 숨기기 위해 CDN 구조를 악용하여 HTTP Host 헤더를 조작하는 기법은?", ["Domain Generation Algorithm (DGA)", "Fast Flux", "Domain Fronting", "DNS Rebinding"], 2],
    ["[심화 분석] Adversary Emulation 파이프라인에서 EDR 알람의 누락(False Negative)을 지속적으로 측정하고 개선하기 위해 가장 적합한 방법론은?", ["정기적인 취약점 스캐닝", "Purple Teaming (퍼플 티밍)", "단순 모의해킹 보고서 점검", "방화벽 정책 주기적 리뷰"], 1],
    ["[ATT&CK] Invoke-Mimikatz를 메모리에서 실행할 때 Windows 고유의 프로세스 복제 기술인 PssCapture를 활용하는 행위는 어떤 Evasion 철학에 가까운가?", ["Living off the Land (LotL)", "Fileless Execution", "Bring Your Own Vulnerable Driver (BYOVD)", "Direct Syscalls"], 0],
    ["[ATT&CK] 취약한 커널 드라이버를 의도적으로 시스템에 드롭한 후 EDR의 커널 모드 콜백을 무력화시키는 최고 수준의 우회 기법은?", ["DLL Hijacking", "Bring Your Own Vulnerable Driver (BYOVD)", "UAC Bypass", "Process Doppelganging"], 1],
    ["[심화 분석] 위협 헌팅 시, Software Packing을 탐지하기 위해 가장 유효한 분석 지표는?", ["파일의 크기", "PE 헤더의 높은 엔트로피(Entropy) 값", "컴파일러 버전", "임포트된 표준 라이브러리 개수"], 1],
    ["[심화 분석] D3FEND 프레임워크에서, 메모리에 있는 인증 정보가 무단으로 읽히는 것을 막기 위한 방어 기술 카테고리는?", ["Decoy Environment", "Credential Eviction / Isolation", "Network Traffic Analysis", "File Analysis"], 1],
    ["[ATT&CK] Active Directory의 Trust 관계를 악용하여 자식 도메인에서 포리스트 전체 권한까지 상승시킬 때 주로 조작되는 것은?", ["SID History", "SPN (Service Principal Name)", "GPO (Group Policy Object)", "LAPS Password"], 0],
    ["[ATT&CK] 공격자가 C2 통신 흔적을 숨기기 위해 트위터나 깃허브 같은 정상 웹 서비스를 데이터 중계 용도로 악용하는 기법은?", ["Web Shell", "Web Service / Dead Drop Resolver", "Protocol Tunneling", "Proxy Connection"], 1],
    ["[ATT&CK] 랜섬웨어 그룹이 데이터 공개 협박을 하는 행위는 ATT&CK 관점에서 어떤 Impact 모델에 해당하는가?", ["Data Destruction", "Data Encrypted for Impact", "Defacement", "Data Manipulation (Extortion)"], 3],
    ["[운영체제] 리눅스 커널 레벨에서 시스템 콜을 가로채고 프로세스, 파일, 네트워크 연결을 숨기기 위해 사용되는 악성코드 형태는?", ["Web Shell", "LKM (Loadable Kernel Module) Rootkit", "Reverse Shell", "Ransomware"], 1],
    ["[심화 분석] 위협 인텔리전스 다이아몬드 모델에서 4가지 핵심 요소가 아닌 것은?", ["Adversary (공격자)", "Capability (역량/도구)", "Infrastructure (인프라)", "Budget (예산)"], 3],
    ["[ATT&CK] 공격자가 정상 프로세스를 정지 상태로 생성한 후, 메모리를 비우고 악성 페이로드를 채워 넣어 실행을 재개하는 기법은?", ["Process Hollowing", "DLL Hijacking", "Process Ghosting", "API Hooking"], 0],
    ["[네트워크] 공격자가 패킷을 분할(Fragmentation)하거나 IP 헤더를 조작하여 전송하는 행위는 어떤 Tactic과 연관되는가?", ["Defense Evasion", "Initial Access", "Command and Control", "Discovery"], 0],
    ["[심화 분석] 인시던트 대응에서 메모리 덤프 분석 시, 은닉된 프로세스를 복구하기 위해 사용하는 Volatility 플러그인은?", ["hashdump", "netscan / psxview", "mimikatz", "dumpregistry"], 1],
    ["[ATT&CK] 공격자가 부모 프로세스 ID(PPID)를 정상 프로세스로 위장하여 자식 프로세스를 생성하는 기법은?", ["Parent PID Spoofing", "Command-Line Obfuscation", "Token Impersonation", "Process Doppelganging"], 0],
    ["[보안기초] 코드 저장소나 CI/CD 파이프라인을 최초 침투 타겟으로 삼고 소스코드를 변조하는 포괄적 공격 유형은?", ["Phishing", "Supply Chain Compromise", "Drive-by Compromise", "Valid Accounts 악용"], 1],
  ],
};

/**
 * rawBank를 구조화된 QUESTION_BANK로 변환
 * 카테고리: 질문 텍스트의 [태그]에서 추출
 */
function parseCategory(questionText) {
  const match = questionText.match(/^\[([^\]]+)\]/);
  if (!match) return '보안기초';
  return TAG_TO_CATEGORY[match[1]] || '보안기초';
}

function stripTag(questionText) {
  return questionText.replace(/^\[[^\]]+\]\s*/, '');
}

export const QUESTION_BANK = {};

for (const [level, questions] of Object.entries(rawBank)) {
  QUESTION_BANK[level] = questions.map(([q, opts, correctIdx]) => ({
    level: Number(level),
    category: parseCategory(q),
    question: stripTag(q),
    options: opts.map((text, i) => ({ text, isCorrect: i === correctIdx })),
  }));
}

export default QUESTION_BANK;

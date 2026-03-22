/**
 * IT 기초 학습 대시보드 — 카테고리 & 레슨 카드 데이터
 * 8 Master Categories covering TA0001 ~ TA0040 (Impact)
 */

// ── 전술 상수 ──
export const TACTICS = {
  RECON:      'TA0043 정찰',
  RESDEV:     'TA0042 자원개발',
  INIT:       'TA0001 초기침투',
  EXEC:       'TA0002 실행',
  PERSIST:    'TA0003 지속성유지',
  PRIVESC:    'TA0004 권한상승',
  EVASION:    'TA0005 방어회피',
  CRED:       'TA0006 자격증명탈취',
  DISCOVERY:  'TA0007 시스템탐색',
  LATERAL:    'TA0008 수평이동',
  COLLECT:    'TA0009 정보수집',
  EXFIL:      'TA0010 정보유출',
  C2:         'TA0011 명령제어',
  IMPACT:     'TA0040 시스템파괴',
};

// ── 전술 색상 맵 ──
export const TACTIC_COLORS = {
  [TACTICS.RECON]:      '#6b7280',
  [TACTICS.RESDEV]:     '#8b5cf6',
  [TACTICS.INIT]:       '#0071e3',
  [TACTICS.EXEC]:       '#ac39ff',
  [TACTICS.PERSIST]:    '#ef4444',
  [TACTICS.PRIVESC]:    '#f59e0b',
  [TACTICS.EVASION]:    '#06b6d4',
  [TACTICS.CRED]:       '#eab308',
  [TACTICS.DISCOVERY]:  '#10b981',
  [TACTICS.LATERAL]:    '#f43f5e',
  [TACTICS.COLLECT]:    '#ec4899',
  [TACTICS.EXFIL]:      '#f97316',
  [TACTICS.C2]:         '#8b5cf6',
  [TACTICS.IMPACT]:     '#e11d48',
};

// ── 카테고리 ID 순서 ──
export const CATEGORIES = [
  'network_web',
  'recon_discovery',
  'os_system',
  'auth_credential',
  'exploit_evasion',
  'lateral_movement',
  'c2_exfiltration',
  'cloud_infra',
];

// ── 사이드바 네비 메타 ──
export const CATEGORY_NAV = [
  { id: 'network_web',      emoji: '🌐', label: '네트워크 및 웹 인프라' },
  { id: 'recon_discovery',   emoji: '🔍', label: '탐색 및 데이터 수집' },
  { id: 'os_system',         emoji: '⚙️', label: '운영체제 및 로컬 시스템' },
  { id: 'auth_credential',   emoji: '🔑', label: '인증 체계 및 자격 증명' },
  { id: 'exploit_evasion',   emoji: '💣', label: '익스플로잇 및 방어 회피' },
  { id: 'lateral_movement',  emoji: '🏃‍♂️', label: '수평 이동 및 원격 제어' },
  { id: 'c2_exfiltration',   emoji: '📤', label: 'C2 및 데이터 유출' },
  { id: 'cloud_infra',       emoji: '☁️', label: '클라우드 및 컨테이너' },
];

const T = TACTICS;

// ── 카테고리 데이터 (68 lessons) ──
export const CATEGORY_DATA = {
  network_web: {
    title: '네트워크 및 웹 인프라 (Network & Web)',
    subtitle: '네트워크, DNS, 웹 환경 및 서비스 거부 공격',
    cards: [
      { id: 'nw1',  emoji: '📍', title: 'IP 체계와 주소 관리',       difficulty: 2, tactics: [T.RECON], desc: 'IP, MAC, CIDR, NAT 구조 식별' },
      { id: 'nw2',  emoji: '🗺️', title: '라우팅 및 분산 시스템',     difficulty: 3, tactics: [T.RECON, T.RESDEV], desc: '라우팅, BGP, ASN, VLAN' },
      { id: 'nw3',  emoji: '📦', title: '기본 프로토콜과 패킷',       difficulty: 3, tactics: [T.RECON, T.EXEC], desc: 'TCP/IP, ICMP, 소켓, TTL, 파이프' },
      { id: 'nw4',  emoji: '💥', title: '네트워크 마비 및 서비스 거부', difficulty: 4, tactics: [T.IMPACT], desc: 'DoS, DDoS, SYN Flood, 반사공격' },
      { id: 'nw5',  emoji: '🚇', title: '원격 접속 터널링',           difficulty: 4, tactics: [T.RECON, T.INIT], desc: 'VPN, SSH, RDP, 터널링' },
      { id: 'nw6',  emoji: '📖', title: 'DNS 구조와 레코드',          difficulty: 2, tactics: [T.RECON], desc: 'DNS, 네임서버, 레코드타입' },
      { id: 'nw7',  emoji: '🔐', title: 'DNS 보안 및 취약점',         difficulty: 4, tactics: [T.RECON, T.EVASION], desc: 'DNSSEC, Zone Transfer, DNS캐시' },
      { id: 'nw8',  emoji: '🌍', title: 'HTTP 통신 및 웹 인프라',     difficulty: 2, tactics: [T.RECON, T.RESDEV], desc: 'HTTP헤더, Host헤더, 웹서버, 리다이렉트' },
      { id: 'nw9',  emoji: '🍪', title: '세션 관리 및 탈취',           difficulty: 3, tactics: [T.RESDEV, T.INIT, T.EVASION], desc: '세션, 쿠키, 세션하이재킹' },
      { id: 'nw10', emoji: '🕸️', title: '웹 애플리케이션 보안',       difficulty: 5, tactics: [T.INIT, T.EXEC, T.PERSIST], desc: '웹쉘, ISAPI, XSS, CSRF, SQL' },
      { id: 'nw11', emoji: '📝', title: '비즈니스 데이터 및 웹 변조',  difficulty: 3, tactics: [T.IMPACT], desc: '데이터변조, 웹서버, CMS, 트랜잭션, 무결성' },
      { id: 'nw12', emoji: '🖥️', title: '네트워크 장비 설정 수집',    difficulty: 4, tactics: [T.RECON, T.COLLECT], desc: '네트워크장비, SNMP, TFTP, running-config' },
    ],
  },
  recon_discovery: {
    title: '탐색 및 데이터 수집 (Discovery & Collect)',
    subtitle: '시스템 탐색(Discovery) 및 민감 정보 수집(Collection)',
    cards: [
      { id: 'rd1',  emoji: '🔎', title: 'OSINT 및 메타데이터',            difficulty: 2, tactics: [T.RECON], desc: 'OSINT, 검색연산자, 메타데이터API' },
      { id: 'rd2',  emoji: '👥', title: '소셜 엔지니어링 피싱',           difficulty: 3, tactics: [T.RECON, T.INIT], desc: '소셜엔지니어링, 피싱, 전화, 음성' },
      { id: 'rd3',  emoji: '🚨', title: '인텔리전스 인프라 모니터링',      difficulty: 3, tactics: [T.RECON, T.COLLECT], desc: 'IOC, STIX/TAXII, Shodan, 다크웹' },
      { id: 'rd4',  emoji: '🔍', title: '로컬 시스템 및 계정 열거',        difficulty: 2, tactics: [T.DISCOVERY], desc: 'systeminfo, whoami, net user, OS버전' },
      { id: 'rd5',  emoji: '🗺️', title: '내부 네트워크 탐색',             difficulty: 3, tactics: [T.DISCOVERY, T.RECON], desc: 'ipconfig, netstat, ARP, 포트스캔' },
      { id: 'rd6',  emoji: '⚙️', title: '프로세스 및 서비스 열거',         difficulty: 3, tactics: [T.DISCOVERY], desc: 'tasklist, ps, sc query, 보안소프트웨어' },
      { id: 'rd7',  emoji: '🏢', title: '도메인 자원 탐색',                difficulty: 4, tactics: [T.DISCOVERY], desc: 'nltest, net share, Domain Admins' },
      { id: 'rd8',  emoji: '📁', title: '내부 데이터 수집 및 압축',        difficulty: 3, tactics: [T.COLLECT, T.EXFIL], desc: '파일검색, 스테이징, 커스텀압축, zip' },
      { id: 'rd9',  emoji: '📧', title: '이메일 및 협업 도구 수집',        difficulty: 4, tactics: [T.COLLECT], desc: 'Exchange, Outlook, PST, 메일규칙' },
      { id: 'rd10', emoji: '⌨️', title: '화면 및 입력 수집 (로거/캡처)',  difficulty: 5, tactics: [T.COLLECT], desc: '키로거, 클립보드, API후킹, 스크린샷' },
    ],
  },
  os_system: {
    title: '운영체제 및 로컬 시스템 (OS & System)',
    subtitle: 'Windows/Unix 코어, 프로세스 제어, 파괴 및 실행 하이재킹',
    cards: [
      { id: 'os1',  emoji: '💻', title: '부팅 및 하드웨어 보안',        difficulty: 5, tactics: [T.INIT, T.PERSIST, T.EVASION], desc: 'BIOS, 펌웨어다운그레이드, MBR' },
      { id: 'os2',  emoji: '💣', title: '데이터 파괴 및 랜섬웨어',      difficulty: 4, tactics: [T.IMPACT], desc: '랜섬웨어, 디스크와이프, 파일삭제, VSS, SDelete, 파티션' },
      { id: 'os3',  emoji: '🧱', title: '시스템 중단 및 펌웨어 브릭',   difficulty: 5, tactics: [T.IMPACT], desc: '재부팅, 종료, 부트로더, 브릭, bcdedit, shutdown' },
      { id: 'os4',  emoji: '📂', title: '레지스트리 및 자동 실행',      difficulty: 3, tactics: [T.PERSIST, T.EVASION], desc: 'Run, RunOnce, 레지스트리정리' },
      { id: 'os5',  emoji: '⚙️', title: '서비스 기반 영속성과 조작',    difficulty: 4, tactics: [T.EXEC, T.PERSIST, T.EVASION], desc: '서비스, SCM, 서비스삭제' },
      { id: 'os6',  emoji: '📜', title: '문서 기반 템플릿 악용',        difficulty: 3, tactics: [T.INIT, T.EXEC, T.EVASION], desc: 'Office매크로, 원격템플릿, DOTM' },
      { id: 'os7',  emoji: '🐺', title: '정상 바이너리 악용(LoLBin)',   difficulty: 4, tactics: [T.EXEC, T.EVASION], desc: 'rundll32.exe, mshta.exe, 간접실행' },
      { id: 'os8',  emoji: '🔗', title: '명령줄 조작과 프로세스 회피',  difficulty: 4, tactics: [T.PERSIST, T.EVASION], desc: 'IFEO, CommandLine, 프로세스인자' },
      { id: 'os9',  emoji: '🧠', title: '메모리 인젝션 및 위장',        difficulty: 5, tactics: [T.EXEC, T.EVASION], desc: 'VirtualAllocEx, DLL Injection' },
      { id: 'os10', emoji: '🧵', title: '스레드 하이재킹 및 API',       difficulty: 5, tactics: [T.PRIVESC, T.EVASION], desc: 'CreateRemoteThread, APC, 시스템콜' },
      { id: 'os11', emoji: '⏰', title: 'Unix 스케줄링 및 링커 하이재킹', difficulty: 4, tactics: [T.EXEC, T.PERSIST, T.EVASION], desc: 'cron, systemd, LD_PRELOAD, 루트킷' },
    ],
  },
  auth_credential: {
    title: '인증 체계 및 자격 증명 (Auth & Credential)',
    subtitle: '접근 통제, 엔터프라이즈 인증 및 크리덴셜 탈취',
    cards: [
      { id: 'ac1', emoji: '🛡️', title: 'Windows UAC와 권한 상승',   difficulty: 5, tactics: [T.PRIVESC], desc: 'UAC, Consent, Elevation, Local Admin' },
      { id: 'ac2', emoji: '🎫', title: 'Windows 토큰과 세션',       difficulty: 4, tactics: [T.PRIVESC, T.EVASION], desc: '토큰, Primary Token, 신원위장' },
      { id: 'ac3', emoji: '🐧', title: 'Unix/Linux 권한 체계',      difficulty: 3, tactics: [T.PRIVESC], desc: 'Linux권한, SUID, SGID, sudoers' },
      { id: 'ac4', emoji: '🎟️', title: 'Kerberos 및 티켓 공격',     difficulty: 5, tactics: [T.CRED], desc: 'Kerberos, TGT, TGS, SPN, AS-REP' },
      { id: 'ac5', emoji: '🏢', title: '도메인 컨트롤러 복제',       difficulty: 5, tactics: [T.CRED, T.PRIVESC], desc: 'AD, 도메인컨트롤러, DCSync, NTDS.dit' },
      { id: 'ac6', emoji: '📜', title: 'AD CS 및 인증서 악용',       difficulty: 5, tactics: [T.CRED, T.PRIVESC, T.EVASION], desc: 'AD CS, ESC시나리오, 루트인증서, 코드서명' },
      { id: 'ac7', emoji: '🔨', title: '패스워드 관리 및 크래킹',    difficulty: 3, tactics: [T.CRED], desc: '패스워드, 해싱, 솔트, 레인보우테이블' },
      { id: 'ac8', emoji: '💾', title: '메모리 덤프와 로컬 자격증명', difficulty: 5, tactics: [T.CRED], desc: 'LSASS, MiniDump, SAM, DPAPI' },
      { id: 'ac9', emoji: '📱', title: 'MFA 및 실시간 피싱',         difficulty: 4, tactics: [T.CRED, T.INIT], desc: 'MFA, 피로공격, 실시간피싱, Evilginx' },
    ],
  },
  exploit_evasion: {
    title: '익스플로잇 및 방어 회피 (Exploit & Evasion)',
    subtitle: '취약점 공격, 파일 무기화, 난독화, 로그 삭제 기법',
    cards: [
      { id: 'ee1', emoji: '🚨', title: '취약점 인텔리전스',         difficulty: 2, tactics: [T.RECON, T.RESDEV], desc: 'CVE, CVSS, CWE, 취약버전' },
      { id: 'ee2', emoji: '💣', title: '메모리 공격과 익스플로잇',   difficulty: 5, tactics: [T.INIT, T.EXEC, T.PRIVESC], desc: '익스플로잇킷, Shellcode, ROP, 커널익스플로잇' },
      { id: 'ee3', emoji: '📦', title: '패킹 및 난독화',             difficulty: 4, tactics: [T.RESDEV, T.EVASION], desc: '패커, UPX, 언패킹, 엔트로피, 패딩' },
      { id: 'ee4', emoji: '🔤', title: '데이터 인코딩 및 숨김',      difficulty: 4, tactics: [T.EVASION], desc: 'Base64, 인코딩, API Hashing, 문자열제거' },
      { id: 'ee5', emoji: '🔬', title: '동적 분석 및 샌드박스 회피', difficulty: 5, tactics: [T.EVASION], desc: '안티디버깅, IsDebuggerPresent, 디버거감지' },
      { id: 'ee6', emoji: '🗑️', title: '시스템 로그 삭제 및 위조',  difficulty: 3, tactics: [T.EVASION], desc: '이벤트로그, 로그위조, 흔적제거' },
      { id: 'ee7', emoji: '🕒', title: '타임스탬프 조작',            difficulty: 4, tactics: [T.EVASION], desc: '타임스탬프, MACE Timestamp' },
      { id: 'ee8', emoji: '🛡️', title: '보안 정책 무력화',          difficulty: 5, tactics: [T.EVASION], desc: '감사정책, AppLocker, 보안소프트웨어' },
    ],
  },
  lateral_movement: {
    title: '수평 이동 및 원격 제어 (Lateral Movement)',
    subtitle: '내부망 확산과 세션 장악',
    cards: [
      { id: 'lm1', emoji: '📂', title: 'Windows 네트워크 공유',          difficulty: 3, tactics: [T.LATERAL], desc: '관리공유, SMB, IPC$, Named Pipe' },
      { id: 'lm2', emoji: '⚙️', title: 'Windows 원격 관리 인프라',      difficulty: 4, tactics: [T.LATERAL, T.EXEC], desc: 'WinRM, DCOM, MMC, PowerShell Remoting' },
      { id: 'lm3', emoji: '🖥️', title: 'GUI 원격 데스크톱 (RDP/VNC)',   difficulty: 3, tactics: [T.LATERAL], desc: '화면공유, RDP, VNC, tscon, NLA' },
      { id: 'lm4', emoji: '🐧', title: 'SSH 및 터널링 (Unix)',          difficulty: 3, tactics: [T.LATERAL], desc: 'SSH, SCP, 키페어, 에이전트포워딩' },
      { id: 'lm5', emoji: '🎟️', title: '자격 증명 패스 및 릴레이',      difficulty: 5, tactics: [T.LATERAL, T.CRED], desc: 'PtH, NTLM Relay, 토큰, 세션하이재킹' },
    ],
  },
  c2_exfiltration: {
    title: 'C2 및 데이터 유출 (C2 & Exfil)',
    subtitle: '은닉형 통신 채널 구축, 툴셋 및 외부 데이터 유출',
    cards: [
      { id: 'c2e1', emoji: '🎭', title: 'C2 채널과 프로토콜 위장',           difficulty: 4, tactics: [T.C2, T.EVASION], desc: 'HTTP모방, DNS터널, 프로토콜위장, 비표준포트' },
      { id: 'c2e2', emoji: '🔄', title: 'C2 인프라 복원력 (Resilience)',     difficulty: 4, tactics: [T.C2], desc: 'DGA, 도메인생성, 백업C2, 다단계C2, 빠른IP변경' },
      { id: 'c2e3', emoji: '👻', title: '은닉형 통신망 (Evasion & Tunnels)', difficulty: 5, tactics: [T.C2, T.EVASION], desc: '도메인프론팅, SNI, Host헤더, 리버스프록시, 피봇' },
      { id: 'c2e4', emoji: '☁️', title: '합법 도구 및 클라우드 웹훅 악용',   difficulty: 3, tactics: [T.C2, T.EXFIL], desc: '합법도구, 페이스트빈, 웹훅, 크로스계정, 코드저장소' },
      { id: 'c2e5', emoji: '📦', title: '데이터 패키징 및 암호화 전송',       difficulty: 4, tactics: [T.EXFIL, T.EVASION], desc: '분할전송, 청크, 패킷패딩, 스테가노그래피, 대칭암호화' },
      { id: 'c2e6', emoji: '🐺', title: 'Windows 다운로더 및 스테이저',      difficulty: 3, tactics: [T.C2, T.EXEC], desc: 'certutil, bitsadmin, curl, wget, 로더' },
      { id: 'c2e7', emoji: '🔌', title: '물리적 미디어 및 대체 네트워크',     difficulty: 2, tactics: [T.EXFIL, T.INIT], desc: '이동식미디어, USB, 셀룰러, 근거리통신, Bluetooth' },
    ],
  },
  cloud_infra: {
    title: '클라우드 및 컨테이너 (Cloud & Container)',
    subtitle: '가상화 인프라, 서버리스, 컨테이너 플랫폼 공격',
    cards: [
      { id: 'ci1', emoji: '☁️', title: '클라우드 권한과 메타데이터',     difficulty: 3, tactics: [T.INIT, T.PRIVESC, T.CRED], desc: '클라우드계정, IAM, AssumeRole, IMDS' },
      { id: 'ci2', emoji: '🔐', title: '클라우드 시크릿 관리',           difficulty: 3, tactics: [T.CRED], desc: 'AWS Secrets Manager, Kubernetes Secrets' },
      { id: 'ci3', emoji: '🚀', title: '서버리스와 클라우드 콘솔',       difficulty: 4, tactics: [T.RESDEV, T.EXEC], desc: 'Lambda, 클라우드콘솔, API Gateway' },
      { id: 'ci4', emoji: '🐳', title: '컨테이너 탈출 및 오케스트레이션', difficulty: 5, tactics: [T.EXEC, T.PRIVESC, T.EVASION], desc: '컨테이너탈출, Docker, Kubernetes, kubectl' },
      { id: 'ci5', emoji: '🌫️', title: '클라우드 로깅 무력화',          difficulty: 4, tactics: [T.EVASION], desc: 'CloudTrail중지, 클라우드로깅, 인스턴스삭제' },
      { id: 'ci6', emoji: '🪙', title: '자원 하이재킹 및 크립토마이닝',  difficulty: 4, tactics: [T.IMPACT], desc: '크립토마이닝, 마이닝, CPU, GPU, 과금' },
    ],
  },
};

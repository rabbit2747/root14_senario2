import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReactGA from 'react-ga4';
import { logAccess } from '../lib/supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TECHNIQUE URL 매핑 (IntroMatrix 와 동일하게 유지)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TECHNIQUE_URLS = {
  'Domain': '/edu/t1078-002-domain-accounts.html',
  // 'Phishing': '/edu/t1566-phishing.html',
};
const FALLBACK_URL = 'https://hw8z3v.csb.app/';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 한국어 전술 / 기법 이름 매핑
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const koMapping = {
  titles: {
    'Reconnaissance':             '정찰',
    'Resource Development':       '자원 개발',
    'Initial Access':             '초기 접근',
    'Execution':                  '실행',
    'Persistence':                '지속성',
    'Privilege Escalation':       '권한 상승',
    'Defense Evasion':            '방어 회피',
    'Credential Access':          '자격 증명 접근',
    'Discovery':                  '탐색',
    'Lateral Movement':           '측면 이동',
    'Collection':                 '수집',
    'Command and Control (C2)':   '명령 및 제어',
    'Exfiltration':               '유출',
    'Impact':                     '영향',
  },
  techniques: {
    // ── Reconnaissance ──
    'Active Scanning':                       '능동 스캐닝',
    'Gather Victim Host Information':        '피해자 호스트 정보 수집',
    'Gather Victim Identity Information':    '피해자 신원 정보 수집',
    'Gather Victim Network Information':     '피해자 네트워크 정보 수집',
    'Gather Victim Org Information':         '피해자 조직 정보 수집',
    'Phishing for Information':              '정보 피싱',
    'Search Closed Sources':                 '비공개 소스 검색',
    'Search Open Technical Databases':       '공개 기술 DB 검색',
    'Search Open Websites/Domains':          '공개 웹사이트 검색',
    // ── Resource Development ──
    'Acquire Infrastructure':               '인프라 획득',
    'Compromise Accounts':                  '계정 침해',
    'Develop Capabilities':                 '역량 개발',
    'Obtain Capabilities':                  '역량 획득',
    'Stage Capabilities':                   '역량 준비',
    // ── Initial Access ──
    'Phishing':                             '피싱',
    'Supply Chain Compromise':              '공급망 침해',
    'Valid Accounts':                       '유효 계정',
    'Exploit Public-Facing Application':    '공개 앱 취약점 악용',
    'External Remote Services':             '외부 원격 서비스',
    // ── Execution ──
    'Command and Scripting Interpreter':    '명령/스크립트 인터프리터',
    'User Execution':                       '사용자 실행',
    'Scheduled Task / Job':                 '예약 작업',
    'System Services':                      '시스템 서비스',
    // ── Persistence ──
    'Boot or Logon Autostart Execution':    '부팅/로그온 자동 실행',
    'Create Account':                       '계정 생성',
    'Event Triggered Execution':            '이벤트 트리거 실행',
    'Server Software Component':            '서버 소프트웨어 컴포넌트',
    // ── Privilege Escalation ──
    'Abuse Elevation Control Mechanism':    '권한 상승 메커니즘 남용',
    'Access Token Manipulation':            '액세스 토큰 조작',
    'Process Injection':                    '프로세스 인젝션',
    // ── Defense Evasion ──
    'Obfuscated Files or Information':      '난독화 파일/정보',
    'Hide Artifacts':                       '아티팩트 은닉',
    'Masquerading':                         '위장',
    'Impair Defenses':                      '방어 약화',
    // ── Credential Access ──
    'OS Credential Dumping':               'OS 자격 증명 덤핑',
    'Brute Force':                          '브루트 포스',
    'Input Capture':                        '입력 캡처',
    // ── Discovery ──
    'Account Discovery':                    '계정 탐색',
    'Network Discovery':                    '네트워크 탐색',
    'Process Discovery':                    '프로세스 탐색',
    'System Information Discovery':         '시스템 정보 탐색',
    // ── Lateral Movement ──
    'Remote Services':                      '원격 서비스',
    'Remote Service Session Hijacking':     '원격 세션 하이재킹',
    'Use Alternate Authentication Material':'대체 인증 자료 사용',
    // ── Collection ──
    'Data from Local System':               '로컬 시스템 데이터',
    'Data from Cloud Storage':              '클라우드 저장소 데이터',
    'Email Collection':                     '이메일 수집',
    'Screen Capture':                       '화면 캡처',
    'Archive Collected Data':               '수집 데이터 압축',
    // ── Command and Control ──
    'Application Layer Protocol':           '앱 계층 프로토콜',
    'Encrypted Channel':                    '암호화 채널',
    'Proxy':                                '프록시',
    'Dynamic Resolution':                   '동적 해석',
    // ── Exfiltration ──
    'Exfiltration Over C2 Channel':         'C2 채널 유출',
    'Exfiltration to Cloud Storage':        '클라우드 저장소 유출',
    'Exfiltration Over Web Service':        '웹 서비스 유출',
    'Exfiltration Over USB':                'USB 유출',
    // ── Impact ──
    'Data Encrypted for Impact (랜섬웨어)': '랜섬웨어 암호화',
    'Disk Wipe':                            '디스크 삭제',
    'Defacement':                           '웹 변조',
    'Denial of Service':                    '서비스 거부',
    'Resource Hijacking (크립토마이닝 등)': '자원 탈취 (크립토마이닝)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5개국어 UI 번역 (한국어 기본)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const uiT = {
  en: {
    title: 'ATT&CK Enterprise v14.1',
    search: 'Search techniques...',
    subs: 'Subs',
    authenticated: '● AUTHENTICATED',
    logout: 'LOGOUT',
    dashboard: '← Dashboard',
    loading: 'Initializing Session...',
    authRequired: 'Authentication Required',
    tagline: 'Know the weapon. Secure the future.',
    enterMatrix: 'ENTER MATRIX →',
    brand: 'GOTROOT',
    brandSub: 'CYBERSECURITY TRAINING',
  },
  ko: {
    title: 'ATT&CK 엔터프라이즈 v14.1',
    search: '기법 검색...',
    subs: '서브기법',
    authenticated: '● 인증됨',
    logout: '로그아웃',
    dashboard: '← 대시보드',
    loading: '세션 초기화 중...',
    authRequired: '로그인이 필요합니다',
    tagline: '무기를 알아야 미래를 지킨다.',
    enterMatrix: '매트릭스 진입 →',
    brand: 'GOTROOT',
    brandSub: '사이버보안 교육 플랫폼',
  },
  zh: {
    title: 'ATT&CK 企业版 v14.1',
    search: '搜索技术...',
    subs: '子技术',
    authenticated: '● 已认证',
    logout: '登出',
    dashboard: '← 返回',
    loading: '初始化会话...',
    authRequired: '需要身份验证',
    tagline: '知己知彼，百战不殆。',
    enterMatrix: '进入矩阵 →',
    brand: 'GOTROOT',
    brandSub: '网络安全培训平台',
  },
  hi: {
    title: 'ATT&CK एंटरप्राइज v14.1',
    search: 'तकनीक खोजें...',
    subs: 'उप-तकनीक',
    authenticated: '● प्रमाणित',
    logout: 'लॉगआउट',
    dashboard: '← डैशबोर्ड',
    loading: 'सत्र प्रारंभ...',
    authRequired: 'प्रमाणीकरण आवश्यक',
    tagline: 'हथियार को समझो, भविष्य सुरक्षित करो।',
    enterMatrix: 'मैट्रिक्स में प्रवेश →',
    brand: 'GOTROOT',
    brandSub: 'साइबर सुरक्षा प्रशिक्षण',
  },
  ja: {
    title: 'ATT&CK エンタープライズ v14.1',
    search: 'テクニック検索...',
    subs: 'サブ表示',
    authenticated: '● 認証済み',
    logout: 'ログアウト',
    dashboard: '← ダッシュボード',
    loading: 'セッション初期化中...',
    authRequired: '認証が必要です',
    tagline: '武器を知り、未来を守れ。',
    enterMatrix: 'マトリクスへ進む →',
    brand: 'GOTROOT',
    brandSub: 'サイバーセキュリティ教育',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ATT&CK 매트릭스 데이터 (14개 전술)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const attackMatrix = [
  {
    id: 't1', title: 'Reconnaissance',
    techniques: [
      { name: 'Active Scanning', subs: 'Scanning IP Blocks, Vulnerability Scanning, Wordlist Scanning' },
      { name: 'Gather Victim Host Information', subs: 'Hardware, Software, Firmware, Client Configurations' },
      { name: 'Gather Victim Identity Information', subs: 'Credentials, Email Addresses, Employee Names' },
      { name: 'Gather Victim Network Information', subs: 'Domain Properties, DNS, Network Trust Dependencies, Network Topology, IP Addresses, Network Security Appliances' },
      { name: 'Gather Victim Org Information', subs: 'Determine Physical Locations, Business Relationships, Identify Business Tempo, Identify Roles' },
      { name: 'Phishing for Information', subs: 'Spearphishing Service, Spearphishing Attachment, Spearphishing Link, Spearphishing Voice' },
      { name: 'Search Closed Sources', subs: 'Threat Intel Vendors, Purchase Technical Data' },
      { name: 'Search Open Technical Databases', subs: 'DNS / Passive DNS, WHOIS, Digital Certificates, CDNs, Scan Databases' },
      { name: 'Search Open Websites/Domains', subs: 'Social Media, Search Engines, Code Repositories, Search Threat Vendor Data, Search Victim-Owned Websites' },
    ],
  },
  {
    id: 't2', title: 'Resource Development',
    techniques: [
      { name: 'Acquire Infrastructure', subs: 'Domains, DNS Server, VPS, Botnet, Web Services, Serverless, Malvertising' },
      { name: 'Compromise Accounts', subs: 'Social Media, Email, Cloud Accounts' },
      { name: 'Develop Capabilities', subs: 'Malware, Exploits, Code Signing Certificates' },
      { name: 'Obtain Capabilities', subs: 'Malware, Tools, Exploits, Vulnerabilities, AI' },
      { name: 'Stage Capabilities', subs: 'Upload Malware, SEO Poisoning, Content Injection, Drive-by Compromise' },
    ],
  },
  {
    id: 't3', title: 'Initial Access',
    techniques: [
      { name: 'Phishing', subs: 'Spearphishing Attachment, Spearphishing Link, Spearphishing via Service, Voice' },
      { name: 'Supply Chain Compromise', subs: 'Software Supply Chain, Software Dependencies, Hardware Supply Chain' },
      { name: 'Valid Accounts', subs: 'Default, Domain, Local, Cloud', isCritical: true },
      { name: 'Exploit Public-Facing Application', subs: '' },
      { name: 'External Remote Services', subs: '' },
    ],
  },
  {
    id: 't4', title: 'Execution',
    techniques: [
      { name: 'Command and Scripting Interpreter', subs: 'PowerShell, Windows CMD, Unix Shell, Python, JavaScript, Cloud API, Container CLI', isCritical: true },
      { name: 'User Execution', subs: 'Malicious File, Malicious Link, Malicious Image' },
      { name: 'Scheduled Task / Job', subs: 'Cron, At, Systemd, Scheduled Task' },
      { name: 'System Services', subs: 'Launchctl, Windows Service, Systemctl' },
    ],
  },
  {
    id: 't5', title: 'Persistence',
    techniques: [
      { name: 'Boot or Logon Autostart Execution', subs: 'Registry Run Keys, Startup Folder, Winlogon Helper DLL, Login Items, XDG Autostart' },
      { name: 'Create Account', subs: 'Local, Domain, Cloud' },
      { name: 'Event Triggered Execution', subs: 'WMI Subscription, AppInit DLL, Image File Execution Options, PowerShell Profile' },
      { name: 'Server Software Component', subs: 'Web Shell, IIS Components, SQL Stored Procedures' },
    ],
  },
  {
    id: 't6', title: 'Privilege Escalation',
    techniques: [
      { name: 'Abuse Elevation Control Mechanism', subs: 'Bypass UAC, Sudo, Setuid' },
      { name: 'Access Token Manipulation', subs: 'Token Impersonation, SID History Injection' },
      { name: 'Process Injection', subs: 'DLL Injection, Process Hollowing, APC Injection', isCritical: true },
    ],
  },
  {
    id: 't7', title: 'Defense Evasion',
    techniques: [
      { name: 'Obfuscated Files or Information', subs: 'Packing, Encryption, HTML Smuggling, Polymorphic Code' },
      { name: 'Hide Artifacts', subs: 'Hidden Files, Hidden Users, Timestomp' },
      { name: 'Masquerading', subs: 'Double Extension, Rename Legitimate Utility' },
      { name: 'Impair Defenses', subs: 'Disable Security Tools, Disable Logging, Firewall Modification' },
    ],
  },
  {
    id: 't8', title: 'Credential Access',
    techniques: [
      { name: 'OS Credential Dumping', subs: 'LSASS Memory, SAM, NTDS.dit, DCSync', isCritical: true },
      { name: 'Brute Force', subs: 'Password Spraying, Credential Stuffing' },
      { name: 'Input Capture', subs: 'Keylogging, GUI Capture' },
    ],
  },
  {
    id: 't9', title: 'Discovery',
    techniques: [
      { name: 'Account Discovery', subs: 'Local, Domain, Cloud' },
      { name: 'Network Discovery', subs: 'Network Sniffing, Share Discovery, Service Discovery' },
      { name: 'Process Discovery', subs: '' },
      { name: 'System Information Discovery', subs: '' },
    ],
  },
  {
    id: 't10', title: 'Lateral Movement',
    techniques: [
      { name: 'Remote Services', subs: 'RDP, SMB, SSH, WinRM' },
      { name: 'Remote Service Session Hijacking', subs: 'RDP Hijacking, SSH Hijacking' },
      { name: 'Use Alternate Authentication Material', subs: 'Pass-the-Hash, Pass-the-Ticket' },
    ],
  },
  {
    id: 't11', title: 'Collection',
    techniques: [
      { name: 'Data from Local System', subs: '' },
      { name: 'Data from Cloud Storage', subs: '' },
      { name: 'Email Collection', subs: '' },
      { name: 'Screen Capture', subs: '' },
      { name: 'Archive Collected Data', subs: '' },
    ],
  },
  {
    id: 't12', title: 'Command and Control (C2)',
    techniques: [
      { name: 'Application Layer Protocol', subs: 'Web (HTTP/HTTPS), DNS, Mail' },
      { name: 'Encrypted Channel', subs: 'Symmetric, Asymmetric' },
      { name: 'Proxy', subs: 'Domain Fronting, Multi-hop' },
      { name: 'Dynamic Resolution', subs: 'DGA, Fast Flux' },
    ],
  },
  {
    id: 't13', title: 'Exfiltration',
    techniques: [
      { name: 'Exfiltration Over C2 Channel', subs: '' },
      { name: 'Exfiltration to Cloud Storage', subs: '' },
      { name: 'Exfiltration Over Web Service', subs: '' },
      { name: 'Exfiltration Over USB', subs: '' },
    ],
  },
  {
    id: 't14', title: 'Impact',
    techniques: [
      { name: 'Data Encrypted for Impact (랜섬웨어)', subs: 'Ransomware', isCritical: true },
      { name: 'Disk Wipe', subs: '' },
      { name: 'Defacement', subs: '' },
      { name: 'Denial of Service', subs: '' },
      { name: 'Resource Hijacking (크립토마이닝 등)', subs: 'Cryptomining' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG 아이콘 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const SearchIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// GOTROOT 히어로 로고 — 육각형 + 방패 + 글로우
const GotrootHeroLogo = () => (
  <svg viewBox="0 0 160 160" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
    {/* 회전 육각형 테두리 */}
    <polygon
      points="80,6 142,42 142,118 80,154 18,118 18,42"
      fill="none" stroke="rgba(0,255,157,0.25)" strokeWidth="1.2"
      style={{ animation: 'heroHexSpin 12s linear infinite', transformOrigin: '80px 80px' }}
    />
    <polygon
      points="80,14 134,46 134,114 80,146 26,114 26,46"
      fill="none" stroke="rgba(0,255,157,0.12)" strokeWidth="0.8"
      style={{ animation: 'heroHexSpin 8s linear infinite reverse', transformOrigin: '80px 80px' }}
    />
    {/* 외곽 원 */}
    <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(0,255,157,0.18)" strokeWidth="1"
      strokeDasharray="6 4"
      style={{ animation: 'heroHexSpin 20s linear infinite', transformOrigin: '80px 80px' }} />
    {/* 내부 배경 */}
    <circle cx="80" cy="80" r="52" fill="rgba(0,255,157,0.04)" />
    {/* 방패 아이콘 */}
    <path
      d="M80 34 L108 46 L108 76 C108 96 95 110 80 120 C65 110 52 96 52 76 L52 46 Z"
      fill="rgba(0,255,157,0.08)" stroke="#00ff9d" strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* 방패 내부 체크 표시 */}
    <polyline
      points="66,80 76,91 96,68"
      fill="none" stroke="#00ff9d" strokeWidth="3.5"
      strokeLinecap="round" strokeLinejoin="round"
    />
    {/* 코너 장식 dot */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x = 80 + 68 * Math.cos(rad);
      const y = 80 + 68 * Math.sin(rad);
      return <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(0,255,157,0.5)" />;
    })}
  </svg>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메인 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function MatrixShowcase() {
  // ── 기본 상태 ──
  const [searchTerm,    setSearchTerm]    = useState('');
  const [showSubs,      setShowSubs]      = useState(true);
  const [language,      setLanguage]      = useState('ko');
  const [showLangMenu,  setShowLangMenu]  = useState(false);
  const [tooltip,       setTooltip]       = useState({ show: false, x: 0, y: 0, title: '', id: '', desc: '' });
  const [animatingCard, setAnimatingCard] = useState(null);
  const [animOrigin,    setAnimOrigin]    = useState({ x: '50%', y: '50%' });
  const [expandedTactic, setExpandedTactic] = useState(null); // 모바일 아코디언용
  const [isMobileView,   setIsMobileView]   = useState(false);
  const [isTabletView,   setIsTabletView]   = useState(false);

  // ── 반응형 감지 ──
  useEffect(() => {
    const check = () => {
      setIsMobileView(window.innerWidth < 768);
      setIsTabletView(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── GOTROOT 히어로 인트로 (localStorage skip 지원) ──
  // phases: 'entering' → 'sliding' → 'done'
  const [heroPhase, setHeroPhase] = useState(() =>
    localStorage.getItem('gotroot_showcase_seen') === 'true' ? 'done' : 'entering'
  );
  const [typedText,    setTypedText]    = useState('');
  const [logoVisible,  setLogoVisible]  = useState(false);
  const [brandVisible, setBrandVisible] = useState(false);
  const matrixCanvasRef = useRef(null);

  const { isLoggedIn, user, logout } = useAuth();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  // stale closure 방지용 ref
  const isLoggedInRef = useRef(isLoggedIn);
  const userRef       = useRef(user);
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);
  useEffect(() => { userRef.current = user; }, [user]);

  const t = uiT[language];

  // ── 히어로 로고 → 브랜드명 순서 페이드인 ──
  useEffect(() => {
    if (heroPhase !== 'entering') return;
    const t1 = setTimeout(() => setLogoVisible(true),  120);
    const t2 = setTimeout(() => setBrandVisible(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [heroPhase]);

  // ── 타이핑 효과 (브랜드 visible 후) ──
  useEffect(() => {
    if (heroPhase !== 'entering' || !brandVisible) return;
    const tagline = t.tagline;
    let i = 0;
    setTypedText('');
    const tid = setInterval(() => {
      setTypedText(tagline.slice(0, ++i));
      if (i >= tagline.length) clearInterval(tid);
    }, 72);
    return () => clearInterval(tid);
  }, [heroPhase, brandVisible, language]);

  // ── 히어로 자동 전환: entering → sliding (3.2s) ──
  useEffect(() => {
    if (heroPhase !== 'entering') return;
    const t1 = setTimeout(() => setHeroPhase('sliding'), 3200);
    return () => clearTimeout(t1);
  }, [heroPhase]);

  // ── sliding → done (0.75s) ──
  useEffect(() => {
    if (heroPhase !== 'sliding') return;
    const t2 = setTimeout(() => {
      setHeroPhase('done');
      localStorage.setItem('gotroot_showcase_seen', 'true');
    }, 750);
    return () => clearTimeout(t2);
  }, [heroPhase]);

  // ── Canvas 매트릭스 레인 (히어로 배경) ──
  useEffect(() => {
    if (heroPhase === 'done') return;
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx   = canvas.getContext('2d');
    const cols  = Math.floor(canvas.width / 18);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    // GOTROOT 느낌: 영문+숫자+한글+일본어 혼합
    const chars = 'GOTROOT0▓▒░1アイウエ가나다ABCDEF@#%';

    const draw = () => {
      ctx.fillStyle = 'rgba(3,7,17,0.055)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char  = chars[Math.floor(Math.random() * chars.length)];
        const alpha = Math.random() * 0.28 + 0.04;
        ctx.fillStyle = `rgba(0,255,157,${alpha})`;
        ctx.font      = '13px monospace';
        ctx.fillText(char, i * 18, y * 16);
        drops[i] = y > canvas.height / 16 + 8 ? Math.random() * -30 : y + 0.5;
      });
    };

    const interval = setInterval(draw, 48);
    return () => clearInterval(interval);
  }, [heroPhase]);

  // ── 히어로 스킵 ──
  const skipHero = () => {
    setHeroPhase('done');
    localStorage.setItem('gotroot_showcase_seen', 'true');
  };

  // ── 언어/이름 변환 헬퍼 ──
  const getTechName    = (name)  => language === 'ko' ? (koMapping.techniques[name] || name) : name;
  const getTacticTitle = (title) => language === 'ko' ? (koMapping.titles[title]    || title) : title;

  const getMitreMockInfo = (name, isSub = false) => {
    const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
    const id   = isSub
      ? `T1${(hash % 900) + 100}.${String(hash % 99).padStart(3, '0')}`
      : `T1${(hash % 900) + 100}`;
    const descs = {
      ko: `공격자는 [${getTechName(name)}] 기법으로 운영 목적을 달성할 수 있습니다.`,
      en: `Adversaries may use [${name}] to further their operational objectives.`,
      zh: `攻击者可能利用 [${name}] 实现其目标。`,
      hi: `हमलावर [${name}] का उपयोग लक्ष्य हासिल करने के लिए कर सकते हैं।`,
      ja: `攻撃者は [${name}] を使用して目標を達成できます。`,
    };
    return { id, desc: descs[language] || descs.en };
  };

  // ── 기법 클릭 핸들러 ──
  const handleItemClick = useCallback((tactic, tech, subName, e) => {
    const ox = e?.clientX != null ? `${((e.clientX / window.innerWidth)  * 100).toFixed(1)}%` : '50%';
    const oy = e?.clientY != null ? `${((e.clientY / window.innerHeight) * 100).toFixed(1)}%` : '50%';
    setAnimOrigin({ x: ox, y: oy });
    const targetName = subName ?? tech.name;
    setAnimatingCard({ tacticTitle: tactic.title, techName: tech.name, targetName, isSub: !!subName, isCritical: tech.isCritical });
    setTooltip(p => ({ ...p, show: false }));
    ReactGA.event({ category: 'Matrix_Interaction', action: 'Select_Technique', label: targetName, value: tech.isCritical ? 10 : 1 });
    if (isLoggedIn && user) {
      logAccess({ userId: user.id, email: user.email, ip: null, action: 'technique_click', technique: targetName });
    }
    const url = TECHNIQUE_URLS[targetName] || FALLBACK_URL;
    setTimeout(() => {
      if (isLoggedIn) window.location.href = url;
      else navigate(`/login?redirect=${encodeURIComponent(url)}`);
    }, 1600);
  }, [isLoggedIn, user, navigate]);

  // ── autoTarget URL 파라미터 ──
  useEffect(() => {
    const target = searchParams.get('autoTarget');
    if (!target) return;
    const tid = setTimeout(() => {
      for (const tactic of attackMatrix) {
        const tech = tactic.techniques.find(t => t.name.includes(target));
        if (tech) {
          setAnimOrigin({ x: '50%', y: '50%' });
          setAnimatingCard({ tacticTitle: tactic.title, techName: tech.name, targetName: tech.name, isSub: false, isCritical: tech.isCritical });
          ReactGA.event({ category: 'Matrix_Interaction', action: 'AutoTarget', label: tech.name });
          if (isLoggedInRef.current && userRef.current) {
            logAccess({ userId: userRef.current.id, email: userRef.current.email, ip: null, action: 'auto_target', technique: tech.name });
          }
          const url = TECHNIQUE_URLS[tech.name] || FALLBACK_URL;
          setTimeout(() => {
            if (isLoggedInRef.current) window.location.href = url;
            else window.location.href = `/login?redirect=${encodeURIComponent(url)}`;
          }, 1600);
          break;
        }
      }
    }, heroPhase === 'done' ? 300 : 4200); // 히어로 끝난 후 실행
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tooltip 핸들러 ──
  const handleMouseEnter = (e, name, isSub = false) => {
    if (isSub) e.stopPropagation();
    const { id, desc } = getMitreMockInfo(name, isSub);
    setTooltip({ show: true, x: e.clientX, y: e.clientY, title: getTechName(name), id, desc });
  };
  const handleMouseMove  = (e) => setTooltip(p => ({ ...p, x: e.clientX, y: e.clientY }));
  const handleMouseLeave = (e) => { e.stopPropagation(); setTooltip(p => ({ ...p, show: false })); };

  const langOptions = [
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文',    flag: '🇨🇳' },
    { code: 'hi', label: 'हिंदी',   flag: '🇮🇳' },
    { code: 'ja', label: '日本語',  flag: '🇯🇵' },
  ];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div
      className="relative w-full min-h-screen font-mono text-slate-300 overflow-x-hidden overflow-y-auto"
      style={{ background: '#030711' }}
      onClick={() => showLangMenu && setShowLangMenu(false)}
    >
      {/* ── 전역 CSS 애니메이션 ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ──── 히어로 ──── */
        @keyframes heroHexSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes heroLogoIn {
          0%   { opacity: 0; transform: scale(0.6); filter: blur(8px); }
          60%  { opacity: 1; filter: blur(0px); transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes heroBrandIn {
          from { opacity: 0; letter-spacing: 0.6em; }
          to   { opacity: 1; letter-spacing: 0.3em; }
        }
        @keyframes heroCursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes heroSlideUp {
          from { transform: translateY(0%); }
          to   { transform: translateY(-100%); }
        }
        @keyframes heroLineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes heroTagIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroLangIn {
          from { opacity: 0; transform: translateY(6px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .hero-lang-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 6px; cursor: pointer;
          font-size: 11px; font-family: monospace; letter-spacing: 0.08em;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(65,90,119,0.55);
          transition: all 0.18s ease;
        }
        .hero-lang-btn:hover {
          border-color: rgba(0,255,157,0.45);
          color: rgba(0,255,157,0.85);
          background: rgba(0,255,157,0.05);
        }
        .hero-lang-btn.active {
          border-color: rgba(0,255,157,0.7);
          color: #00ff9d;
          background: rgba(0,255,157,0.08);
          box-shadow: 0 0 10px rgba(0,255,157,0.2);
        }
        /* ──── 매트릭스 ──── */
        @keyframes showcaseSuckIn {
          0%   { clip-path: circle(1.5% at var(--ox) var(--oy)); opacity: 0; }
          20%  { opacity: 1; }
          100% { clip-path: circle(160% at var(--ox) var(--oy)); opacity: 1; }
        }
        @keyframes showcaseFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes dotPing {
          0%, 100% { transform: scale(1);   opacity: 0.8; }
          50%       { transform: scale(1.8); opacity: 0.2; }
        }
        /* ──── 카드 ──── */
        .sc-tech-card {
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015);
          transition: border-color .12s, background .12s, box-shadow .12s, transform .12s;
          cursor: pointer;
        }
        .sc-tech-card:hover {
          border-color: rgba(0,255,157,0.45);
          background: rgba(0,255,157,0.04);
          box-shadow: 0 0 12px rgba(0,255,157,0.12);
          transform: translateY(-1px);
        }
        .sc-tech-card.critical:hover {
          border-color: rgba(248,113,113,0.5);
          background: rgba(248,113,113,0.04);
          box-shadow: 0 0 12px rgba(248,113,113,0.18);
        }
        .sc-tactic-col:hover .sc-tactic-hdr {
          border-top-color: rgba(0,255,157,0.7) !important;
          background: rgba(0,255,157,0.06) !important;
        }
        .sc-sub-item { color: rgba(65,90,119,0.6); cursor: pointer; transition: color .1s; }
        .sc-sub-item:hover { color: rgba(0,255,157,0.8); }
        .sc-lang-item:hover { background: rgba(0,255,157,0.06); }
        .sc-suck-overlay { animation: showcaseSuckIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        .sc-fade-content { opacity: 0; animation: showcaseFadeUp 0.4s 0.32s ease forwards; }
        .scanline-fixed {
          background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px);
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
        }

        /* ══════ 모바일 아코디언 ══════ */
        @keyframes scAccordionOpen {
          from { max-height: 0; opacity: 0; }
          to   { max-height: 2000px; opacity: 1; }
        }
        @keyframes scChevronRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(180deg); }
        }

        /* ── 모바일 (<768px) ── */
        @media (max-width: 767px) {
          .sc-desktop-grid { display: none !important; }
          .sc-mobile-accordion { display: flex !important; }

          /* 헤더 터치 타겟 */
          .sc-header { height: 56px !important; padding: 0 8px !important; }
          .sc-header button, .sc-header .sc-hdr-btn {
            min-height: 44px !important; min-width: 44px !important;
            font-size: 12px !important; padding: 8px 12px !important;
          }
          .sc-header input {
            min-height: 44px !important; font-size: 13px !important;
            padding: 8px 12px 8px 32px !important;
          }
          .sc-header .sc-search-icon { top: 50% !important; transform: translateY(-50%) !important; left: 10px !important; }
          .sc-header .sc-hide-mobile { display: none !important; }

          /* 아코디언 터치 타겟 */
          .sc-accordion-tactic {
            min-height: 56px; padding: 12px 16px;
            display: flex; align-items: center; justify-content: space-between;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            transition: background .15s;
          }
          .sc-accordion-tactic:active { background: rgba(0,255,157,0.08) !important; }
          .sc-accordion-body {
            overflow: hidden;
            animation: scAccordionOpen 0.3s ease forwards;
          }
          .sc-accordion-tech {
            min-height: 48px; padding: 12px 16px 12px 24px;
            display: flex; align-items: center;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            border-bottom: 1px solid rgba(255,255,255,0.02);
            transition: background .12s;
          }
          .sc-accordion-tech:active { background: rgba(0,255,157,0.06); }
          .sc-accordion-sub {
            min-height: 44px; padding: 10px 16px 10px 40px;
            display: flex; align-items: center;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            border-bottom: 1px solid rgba(255,255,255,0.015);
            transition: background .12s;
          }
          .sc-accordion-sub:active { background: rgba(0,255,157,0.04); }
        }

        /* ── 태블릿 (768-1023px) ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sc-desktop-grid { display: none !important; }
          .sc-mobile-accordion { display: grid !important; grid-template-columns: repeat(2, 1fr); gap: 8px; }

          .sc-header button, .sc-header .sc-hdr-btn {
            min-height: 44px !important; min-width: 44px !important;
          }
          .sc-header input { min-height: 44px !important; }

          .sc-accordion-tactic {
            min-height: 52px; padding: 10px 14px;
            display: flex; align-items: center; justify-content: space-between;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            border-bottom: 1px solid rgba(255,255,255,0.04);
          }
          .sc-accordion-tactic:active { background: rgba(0,255,157,0.08) !important; }
          .sc-accordion-body { overflow: hidden; animation: scAccordionOpen 0.3s ease forwards; }
          .sc-accordion-tech {
            min-height: 44px; padding: 10px 14px 10px 20px;
            display: flex; align-items: center;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            border-bottom: 1px solid rgba(255,255,255,0.02);
          }
          .sc-accordion-tech:active { background: rgba(0,255,157,0.06); }
          .sc-accordion-sub {
            min-height: 44px; padding: 8px 14px 8px 36px;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            border-bottom: 1px solid rgba(255,255,255,0.015);
          }
          .sc-accordion-sub:active { background: rgba(0,255,157,0.04); }
        }

        /* ── 데스크톱 (1024px+) ── */
        @media (min-width: 1024px) {
          .sc-mobile-accordion { display: none !important; }
          .sc-desktop-grid { display: grid !important; }
        }
      `}} />

      {/* 스캔라인 */}
      <div className="scanline-fixed" aria-hidden />

      {/* 배경 ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute rounded-full blur-[100px]"
          style={{ width: 600, height: 600, top: '-10%', left: '8%', background: 'radial-gradient(circle,rgba(0,255,157,0.06),transparent 70%)' }} />
        <div className="absolute rounded-full blur-[80px]"
          style={{ width: 400, height: 400, bottom: '5%', right: '12%', background: 'radial-gradient(circle,rgba(0,102,255,0.05),transparent 70%)' }} />
      </div>

      {/* ═══════════════════════════════════════
          GOTROOT 히어로 인트로 오버레이
          phases: entering → sliding → done(remove)
      ════════════════════════════════════════ */}
      {heroPhase !== 'done' && (
        <div
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: '#030711',
            transform: heroPhase === 'sliding' ? 'translateY(-100%)' : 'translateY(0)',
            transition: heroPhase === 'sliding' ? 'transform 0.75s cubic-bezier(0.55, 0, 0.1, 1)' : 'none',
          }}
        >
          {/* 매트릭스 레인 캔버스 배경 */}
          <canvas
            ref={matrixCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.7 }}
          />

          {/* 중앙 히어로 콘텐츠 */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">

            {/* GOTROOT 헥사곤 로고 */}
            <div style={{
              opacity: logoVisible ? 1 : 0,
              animation: logoVisible ? 'heroLogoIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
              filter: logoVisible ? 'drop-shadow(0 0 24px rgba(0,255,157,0.45))' : 'none',
              marginBottom: '20px',
            }}>
              <GotrootHeroLogo />
            </div>

            {/* GOTROOT 브랜드명 */}
            <div style={{
              opacity: brandVisible ? 1 : 0,
              animation: brandVisible ? 'heroBrandIn 0.7s ease forwards' : 'none',
              marginBottom: '6px',
            }}>
              <h1 style={{
                fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                fontWeight: 900,
                color: '#00ff9d',
                letterSpacing: '0.3em',
                fontFamily: 'monospace',
                textShadow: '0 0 30px rgba(0,255,157,0.5), 0 0 60px rgba(0,255,157,0.2)',
              }}>
                {t.brand}
              </h1>
            </div>

            {/* 브랜드 서브텍스트 */}
            {brandVisible && (
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.3em',
                color: 'rgba(0,255,157,0.45)',
                textTransform: 'uppercase',
                marginBottom: '32px',
                animation: 'heroTagIn 0.5s 0.15s ease forwards',
                opacity: 0,
              }}>
                {t.brandSub}
              </p>
            )}

            {/* ── 히어로 언어 선택기 ── */}
            {brandVisible && (
              <div style={{
                display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center',
                marginBottom: '28px',
                animation: 'heroLangIn 0.5s 0.3s ease forwards',
                opacity: 0,
              }}>
                {[
                  { code: 'ko', flag: '🇰🇷', label: 'KO' },
                  { code: 'en', flag: '🇺🇸', label: 'EN' },
                  { code: 'zh', flag: '🇨🇳', label: 'ZH' },
                  { code: 'hi', flag: '🇮🇳', label: 'HI' },
                  { code: 'ja', flag: '🇯🇵', label: 'JA' },
                ].map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => setLanguage(opt.code)}
                    className={`hero-lang-btn ${language === opt.code ? 'active' : ''}`}
                  >
                    <span style={{ fontSize: '15px', lineHeight: 1 }}>{opt.flag}</span>
                    <span>{opt.label}</span>
                    {language === opt.code && (
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff9d', display: 'inline-block' }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 구분선 + 타이핑 tagline */}
            {brandVisible && (
              <div style={{ maxWidth: '480px', width: '100%' }}>
                {/* 수평선 애니메이션 */}
                <div style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(0,255,157,0.5), transparent)',
                  animation: 'heroLineGrow 0.6s 0.2s ease forwards',
                  width: 0,
                  margin: '0 auto 24px',
                  animationFillMode: 'forwards',
                }} />

                {/* 타이핑 텍스트 */}
                <p style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
                  color: 'rgba(203,213,225,0.85)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.04em',
                  lineHeight: 1.6,
                  minHeight: '2em',
                }}>
                  {typedText}
                  <span style={{ animation: 'heroCursor 0.9s step-end infinite', color: '#00ff9d' }}>|</span>
                </p>
              </div>
            )}

            {/* 하단 진행 표시 바 */}
            <div style={{
              position: 'absolute',
              bottom: '-100px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
            }}>
              {[0, 150, 300].map(delay => (
                <div key={delay} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'rgba(0,255,157,0.5)',
                  animation: `dotPing 1.2s ${delay}ms ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>

          {/* SKIP ⏭ 버튼 */}
          <button
            onClick={skipHero}
            style={{
              position: 'absolute', top: '24px', right: '24px',
              zIndex: 10,
              fontSize: '10px', letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              padding: '6px 14px', borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'monospace',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00ff9d'; e.currentTarget.style.borderColor = 'rgba(0,255,157,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            SKIP ⏭
          </button>

          {/* 코너 장식선 */}
          {[
            { top: 16, left: 16, borderTop: '1px solid rgba(0,255,157,0.3)', borderLeft: '1px solid rgba(0,255,157,0.3)', width: 32, height: 32 },
            { top: 16, right: 16, borderTop: '1px solid rgba(0,255,157,0.3)', borderRight: '1px solid rgba(0,255,157,0.3)', width: 32, height: 32 },
            { bottom: 16, left: 16, borderBottom: '1px solid rgba(0,255,157,0.3)', borderLeft: '1px solid rgba(0,255,157,0.3)', width: 32, height: 32 },
            { bottom: 16, right: 16, borderBottom: '1px solid rgba(0,255,157,0.3)', borderRight: '1px solid rgba(0,255,157,0.3)', width: 32, height: 32 },
          ].map((style, i) => (
            <div key={i} style={{ position: 'absolute', ...style }} />
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════
          헤더
      ════════════════════════════════════════ */}
      <header
        className="sc-header sticky top-0 z-50 w-full flex items-center justify-between px-4 gap-2"
        style={{ height: 52, background: 'rgba(3,7,17,0.96)', borderBottom: '1px solid rgba(0,255,157,0.08)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="sc-hdr-btn text-[10px] px-2 py-1 rounded transition-all"
            style={{ minHeight: 36, color: 'rgba(65,90,119,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00ff9d'; e.currentTarget.style.borderColor = 'rgba(0,255,157,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(65,90,119,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            {t.dashboard}
          </button>
          <span className="sc-hide-mobile text-[11px] font-black tracking-[0.18em] uppercase hidden sm:block" style={{ color: '#00ff9d' }}>
            {t.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 검색 */}
          <div className="relative flex items-center">
            <span className="sc-search-icon absolute left-2 pointer-events-none" style={{ color: 'rgba(65,90,119,0.6)' }}><SearchIcon /></span>
            <input
              type="text" placeholder={t.search} value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); if (e.target.value && isMobileView) setExpandedTactic(null); }}
              className="pl-6 pr-3 text-[10px] rounded transition-all"
              style={{ height: 36, width: isMobileView ? 100 : 140, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e0e1dd', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,255,157,0.4)'; }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          {/* 서브기법 토글 */}
          <button
            onClick={() => setShowSubs(v => !v)}
            className="sc-hdr-btn text-[10px] px-2 rounded transition-all whitespace-nowrap"
            style={{
              minHeight: 36,
              border:     showSubs ? '1px solid rgba(0,255,157,0.5)'  : '1px solid rgba(255,255,255,0.1)',
              color:      showSubs ? '#00ff9d'                         : 'rgba(65,90,119,0.7)',
              background: showSubs ? 'rgba(0,255,157,0.05)'           : 'transparent',
            }}
          >
            {t.subs}
          </button>

          {/* 언어 선택기 */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              className="sc-hdr-btn flex items-center gap-1.5 text-[10px] px-2 rounded transition-all"
              style={{ minHeight: 36, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(65,90,119,0.7)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00ff9d'; e.currentTarget.style.borderColor = 'rgba(0,255,157,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(65,90,119,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <GlobeIcon />
              <span>{langOptions.find(l => l.code === language)?.flag}</span>
              <span className="hidden md:inline">{langOptions.find(l => l.code === language)?.label}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-11 rounded shadow-2xl overflow-hidden"
                style={{ background: '#0a1220', border: '1px solid rgba(0,255,157,0.15)', minWidth: 130, zIndex: 200 }}>
                {langOptions.map(opt => (
                  <button key={opt.code}
                    onClick={() => { setLanguage(opt.code); setShowLangMenu(false); }}
                    className="sc-lang-item w-full flex items-center gap-2 px-3 text-[10px] text-left transition-all"
                    style={{ minHeight: 44, color: language === opt.code ? '#00ff9d' : 'rgba(65,90,119,0.65)' }}
                  >
                    <span className="text-sm">{opt.flag}</span>
                    <span>{opt.label}</span>
                    {language === opt.code && <span className="ml-auto" style={{ color: '#00ff9d' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 인증 상태 + 로그아웃 */}
          {isLoggedIn && (
            <div className="flex items-center gap-1.5">
              <span className="sc-hide-mobile text-[9px] px-2 rounded whitespace-nowrap hidden sm:inline"
                style={{ minHeight: 36, lineHeight: '36px', color: '#00ff9d', border: '1px solid rgba(0,255,157,0.3)' }}>
                {t.authenticated}
              </span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="sc-hdr-btn text-[9px] px-2 rounded transition-all whitespace-nowrap"
                style={{ minHeight: 36, color: 'rgba(65,90,119,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(65,90,119,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════
          매트릭스 그리드 (데스크톱)
      ════════════════════════════════════════ */}
      <main className="relative z-10 w-full p-3 overflow-x-auto">
        <div className="sc-desktop-grid grid gap-1.5" style={{ minWidth: 1860, gridTemplateColumns: 'repeat(14, 1fr)' }}>
          {attackMatrix.map((tactic, tacticIdx) => (
            <div key={tactic.id} className="sc-tactic-col flex flex-col gap-1.5">

              {/* 전술 헤더 */}
              <div className="sc-tactic-hdr p-2 text-center transition-all duration-300"
                style={{ borderTop: '2px solid rgba(0,255,157,0.2)', background: 'rgba(0,255,157,0.025)', minHeight: 54 }}>
                <div className="text-[8px] mb-0.5" style={{ color: 'rgba(0,255,157,0.3)' }}>
                  {String(tacticIdx + 1).padStart(2, '0')}
                </div>
                <h3 className="text-[9px] font-black uppercase leading-tight break-words" style={{ color: '#00ff9d' }}>
                  {getTacticTitle(tactic.title)}
                </h3>
                {language !== 'en' && (
                  <p className="text-[7px] leading-tight mt-0.5 break-words" style={{ color: 'rgba(65,90,119,0.4)' }}>
                    {tactic.title}
                  </p>
                )}
              </div>

              {/* 기법 카드들 */}
              <div className="flex flex-col gap-1">
                {tactic.techniques.map((tech, idx) => {
                  const matched =
                    searchTerm === '' ||
                    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (koMapping.techniques[tech.name] || '').includes(searchTerm);
                  return (
                    <div
                      key={idx}
                      onClick={e => handleItemClick(tactic, tech, null, e)}
                      onMouseEnter={e => handleMouseEnter(e, tech.name, false)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`sc-tech-card ${tech.isCritical ? 'critical' : ''} p-[7px] rounded`}
                      style={{ opacity: matched ? 1 : 0.12 }}
                    >
                      <div className="text-[9px] font-bold leading-tight"
                        style={{ color: tech.isCritical ? '#f87171' : '#e0e1dd' }}>
                        {getTechName(tech.name)}{tech.isCritical && ' 🔥'}
                      </div>
                      {language === 'ko' && koMapping.techniques[tech.name] && (
                        <div className="text-[7px] mt-0.5 truncate" style={{ color: 'rgba(65,90,119,0.38)' }}>
                          {tech.name}
                        </div>
                      )}
                      {showSubs && tech.subs && (
                        <div className="mt-1.5 pl-1.5 flex flex-col gap-0.5"
                          style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                          {tech.subs.split(',').map((sub, sidx) => (
                            <div
                              key={sidx}
                              onClick={e => { e.stopPropagation(); handleItemClick(tactic, tech, sub.trim(), e); }}
                              onMouseEnter={e => handleMouseEnter(e, sub.trim(), true)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                              className="sc-sub-item text-[7px] truncate"
                            >
                              ↳ {sub.trim()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            모바일/태블릿 아코디언 레이아웃
        ════════════════════════════════════════ */}
        <div className="sc-mobile-accordion flex-col gap-2" style={{ display: 'none' }}>
          {attackMatrix.map((tactic, tacticIdx) => {
            const isExpanded = expandedTactic === tactic.id;
            const techCount = tactic.techniques.length;
            const subCount  = tactic.techniques.reduce((a, t) => a + (t.subs ? t.subs.split(',').length : 0), 0);
            // 검색 필터: 해당 택틱에 매칭 기법이 있는지
            const hasMatch = searchTerm === '' || tactic.techniques.some(tech =>
              tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (koMapping.techniques[tech.name] || '').includes(searchTerm) ||
              (tech.subs && tech.subs.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            if (!hasMatch) return null;

            return (
              <div key={tactic.id}
                className="rounded-lg overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* 택틱 헤더 (아코디언 토글) */}
                <div
                  className="sc-accordion-tactic"
                  style={{
                    background: isExpanded ? 'rgba(0,255,157,0.06)' : 'rgba(0,255,157,0.02)',
                    borderLeft: `3px solid ${isExpanded ? 'rgba(0,255,157,0.7)' : 'rgba(0,255,157,0.2)'}`,
                  }}
                  onClick={() => setExpandedTactic(isExpanded ? null : tactic.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[10px] font-mono shrink-0" style={{ color: 'rgba(0,255,157,0.4)' }}>
                      {String(tacticIdx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-black uppercase leading-tight truncate" style={{ color: '#00ff9d' }}>
                        {getTacticTitle(tactic.title)}
                      </h3>
                      {language !== 'en' && (
                        <p className="text-[10px] leading-tight truncate" style={{ color: 'rgba(65,90,119,0.5)' }}>
                          {tactic.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono" style={{ color: 'rgba(65,90,119,0.5)' }}>
                      {techCount}T · {subCount}S
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* 기법 목록 (펼침) */}
                {isExpanded && (
                  <div className="sc-accordion-body">
                    {tactic.techniques.map((tech, idx) => {
                      const techMatched =
                        searchTerm === '' ||
                        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (koMapping.techniques[tech.name] || '').includes(searchTerm);
                      if (!techMatched && searchTerm) return null;

                      return (
                        <div key={idx}>
                          {/* 기법 행 */}
                          <div
                            className="sc-accordion-tech"
                            style={{
                              background: 'rgba(255,255,255,0.01)',
                              borderLeft: `2px solid ${tech.isCritical ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.04)'}`,
                            }}
                            onClick={e => handleItemClick(tactic, tech, null, e)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold leading-tight truncate"
                                style={{ color: tech.isCritical ? '#f87171' : '#e0e1dd' }}>
                                {getTechName(tech.name)}{tech.isCritical && ' 🔥'}
                              </div>
                              {language === 'ko' && koMapping.techniques[tech.name] && (
                                <div className="text-[10px] mt-0.5 truncate" style={{ color: 'rgba(65,90,119,0.4)' }}>
                                  {tech.name}
                                </div>
                              )}
                            </div>
                            {tech.subs && (
                              <span className="text-[9px] ml-2 shrink-0" style={{ color: 'rgba(65,90,119,0.35)' }}>
                                {tech.subs.split(',').length} subs
                              </span>
                            )}
                          </div>

                          {/* 서브기법 목록 */}
                          {showSubs && tech.subs && tech.subs.split(',').map((sub, sidx) => (
                            <div
                              key={sidx}
                              className="sc-accordion-sub"
                              style={{ background: 'rgba(255,255,255,0.005)' }}
                              onClick={e => { e.stopPropagation(); handleItemClick(tactic, tech, sub.trim(), e); }}
                            >
                              <span className="text-[9px] mr-2 shrink-0" style={{ color: 'rgba(0,255,157,0.3)' }}>↳</span>
                              <span className="text-[11px] truncate" style={{ color: 'rgba(65,90,119,0.7)' }}>
                                {sub.trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Tooltip (데스크톱만) ── */}
      {tooltip.show && !isMobileView && !isTabletView && (
        <div className="fixed z-[300] p-3 rounded shadow-2xl pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14, width: 210, background: '#0a1220', border: '1px solid rgba(0,255,157,0.2)' }}>
          <div className="font-bold text-[10px] pb-1 mb-1"
            style={{ color: '#00ff9d', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {tooltip.title}
          </div>
          <div className="text-[9px] mb-1" style={{ color: 'rgba(65,90,119,0.6)' }}>{tooltip.id}</div>
          <div className="text-[9px] leading-relaxed" style={{ color: 'rgba(65,90,119,0.55)' }}>{tooltip.desc}</div>
        </div>
      )}

      {/* ── Suck-In 클릭 오버레이 ── */}
      {animatingCard && (
        <div
          className="sc-suck-overlay fixed inset-0 z-[400] flex items-center justify-center"
          style={{ '--ox': animOrigin.x, '--oy': animOrigin.y, background: '#030711' }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(rgba(0,255,157,0.35) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.06 }} />
          <div className="sc-fade-content text-center relative z-10 px-8 max-w-xl w-full">
            <div className="text-[10px] tracking-[0.35em] mb-5 uppercase"
              style={{ color: animatingCard.isCritical ? '#f87171' : '#00ff9d', animation: 'neonPulse 1s ease-in-out infinite' }}>
              {isLoggedIn ? t.loading : t.authRequired}
            </div>
            <h2 className="font-black text-white mb-1" style={{ fontSize: 'clamp(1.6rem,4vw,3rem)', lineHeight: 1.1 }}>
              {getTechName(animatingCard.targetName)}
            </h2>
            {language === 'ko' && animatingCard.targetName !== getTechName(animatingCard.targetName) && (
              <p className="text-sm mb-1" style={{ color: 'rgba(65,90,119,0.5)' }}>{animatingCard.targetName}</p>
            )}
            <p className="text-[10px] tracking-widest mt-1 mb-8 uppercase" style={{ color: 'rgba(65,90,119,0.4)' }}>
              {getTacticTitle(animatingCard.tacticTitle)}
            </p>
            <div className="flex justify-center gap-3">
              {[0, 150, 300].map(delay => (
                <div key={delay} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: animatingCard.isCritical ? '#f87171' : '#00ff9d', animation: `dotPing 1s ${delay}ms ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

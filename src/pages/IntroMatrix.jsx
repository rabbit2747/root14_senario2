import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReactGA from 'react-ga4';
import { logAccess, supabase } from '../lib/supabase';
import LangToggle, { getStoredLang, storeLang } from '../components/LangToggle';
import AvatarRoom from '../components/AvatarRoom';
import useMatrixData from '../hooks/useMatrixData';
import useEduProgress from '../hooks/useEduProgress';
import { SkipForwardFilled, ChevronLeft, ChevronRight, Close, Education, ArrowRight } from '@carbon/icons-react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import HeroIncidentMatrix from '../components/hero/HeroIncidentMatrix';
// TacticWidgetTemplate 제거됨 — v0.7.3에서 과정 셀렉터 흐름으로 대체
const CommunitySection = lazy(() => import('../components/community/CommunitySection'));
// HeroAnnouncementPreview 제거됨 (유저 요청)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TECHNIQUE URL 매핑 (edu-meta.json 기반 자동 생성)
// ── 새 교육 추가 절차 ──
// 1. public/edu/ 에 HTML 파일 배치
// 2. src/data/edu-meta.json 에 메타데이터 추가
// 3. 매핑된 기법은 자동으로 "교육가능" 뱃지 + 클릭 시 이동 활성화
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import eduMeta from '../data/edu-meta.json';
const TECHNIQUE_URLS = Object.fromEntries(
  Object.entries(eduMeta.pages).map(([id, page]) => [id, page.url])
);
// 기법/서브기법이 교육 콘텐츠를 갖고 있는지 체크하는 헬퍼 (ID 기반)
const hasEduContent = (tid, subs) => {
  if (tid in TECHNIQUE_URLS) return true;
  if (subs?.length) return subs.some(s => s.sid in TECHNIQUE_URLS);
  return false;
};
const FALLBACK_URL = 'https://hw8z3v.csb.app/';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Full Matrix 택틱 색상 (14 택틱 × 라이트/다크)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MATRIX_TACTIC_COLORS = {
  t1:  { hex: '#6366f1', darkHex: '#818cf8', name: 'indigo' },    // Reconnaissance
  t2:  { hex: '#8b5cf6', darkHex: '#a78bfa', name: 'violet' },    // Resource Development
  t3:  { hex: '#2563eb', darkHex: '#60a5fa', name: 'blue' },      // Initial Access
  t4:  { hex: '#f97316', darkHex: '#fb923c', name: 'orange' },    // Execution
  t5:  { hex: '#059669', darkHex: '#34d399', name: 'emerald' },   // Persistence
  t6:  { hex: '#7c3aed', darkHex: '#a78bfa', name: 'purple' },    // Privilege Escalation
  t7:  { hex: '#b45309', darkHex: '#fbbf24', name: 'amber' },     // Defense Evasion
  t8:  { hex: '#0891b2', darkHex: '#22d3ee', name: 'cyan' },      // Credential Access
  t9:  { hex: '#0284c7', darkHex: '#38bdf8', name: 'sky' },       // Discovery
  t10: { hex: '#db2777', darkHex: '#f472b6', name: 'pink' },      // Lateral Movement
  t11: { hex: '#0d9488', darkHex: '#2dd4bf', name: 'teal' },      // Collection
  t12: { hex: '#9333ea', darkHex: '#c084fc', name: 'fuchsia' },   // Command & Control
  t13: { hex: '#65a30d', darkHex: '#a3e635', name: 'lime' },      // Exfiltration
  t14: { hex: '#dc2626', darkHex: '#f87171', name: 'red' },       // Impact
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// langMapping + attackMatrix → useMatrixData() 훅으로 이동 (DB + fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5개국어 UI 번역 (한국어 기본)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const uiT = {
  en: {
    title:         'ATT&CK Enterprise v14.1',
    search:        'Search techniques...',
    subs:          'Toggle Subs',
    authenticated: '● AUTHENTICATED',
    logout:        'LOGOUT',
    loading:       'Initializing Session...',
    authRequired:  'Authentication Required',
    tagline:       'Know the weapon. Secure the future.',
    enterMatrix:   'ENTER MATRIX',
    brand:         'ROOT14',
    brandSub:      'CYBERSECURITY TRAINING',
    skip:          'SKIP',
    visitors:      'Visitors',
    finishers:     'Finishers',
    mypage:        'MY',
    marketing:     'AI ROOT',
    mainSite:      'Main',
    completed:     'CLEAR',
    comingSoonHint: 'Training content coming soon',
    introHint:     'View Intro',
    itBasics:      'IT Basics', itBasicsHint: 'IT Basics',
    communityLabel:'Community', communityHint: 'Community',
    adminHint:     'Admin',
    resultsCount:  'results', moreResults: 'more...',
    navBack: 'Back', navHome: 'Home', navAll: 'All', navChat: 'Chat', navMy: 'My',
  },
  ko: {
    title:         'ATT&CK 엔터프라이즈 v14.1',
    search:        '기법 검색...',
    subs:          '서브기법',
    authenticated: '● 인증됨',
    logout:        '로그아웃',
    loading:       '세션 초기화 중...',
    authRequired:  '로그인이 필요합니다',
    tagline:       '무기를 알아야 미래를 지킨다.',
    enterMatrix:   '매트릭스 진입',
    brand:         'ROOT14',
    brandSub:      '사이버보안 교육 플랫폼',
    skip:          'SKIP',
    visitors:      '방문자',
    finishers:     '수료자',
    mypage:        'MY',
    marketing:     'AI ROOT',
    mainSite:      '메인',
    completed:     '수료',
    comingSoonHint: '교육 콘텐츠 준비중입니다',
    introHint:     '인트로 히어로 보기',
    itBasics:      'IT 기초', itBasicsHint: 'IT 기초 학습',
    communityLabel:'커뮤니티', communityHint: '커뮤니티 페이지',
    adminHint:     '관리자 페이지',
    resultsCount:  '개 결과', moreResults: '개 더...',
    navBack: '뒤로', navHome: '홈', navAll: '전체', navChat: '커뮤니티', navMy: '마이',
  },
  zh: {
    title:         'ATT&CK 企业版 v14.1',
    search:        '搜索技术...',
    subs:          '切换子技术',
    authenticated: '● 已认证',
    logout:        '登出',
    loading:       '初始化会话...',
    authRequired:  '需要身份验证',
    tagline:       '知己知彼，百战不殆。',
    enterMatrix:   '进入矩阵',
    brand:         'ROOT14',
    brandSub:      '网络安全培训平台',
    skip:          'SKIP',
    visitors:      '访客', finishers: '完成者', mypage: 'MY', marketing: 'AI ROOT', mainSite: '主页', completed: '通过',
    comingSoonHint: '教育内容准备中', introHint: '查看介绍', itBasics: 'IT基础', itBasicsHint: 'IT基础学习', communityLabel: '社区', communityHint: '社区页面', adminHint: '管理页面',
    resultsCount: '个结果', moreResults: '更多...',
    navBack: '返回', navHome: '主页', navAll: '全部', navChat: '社区', navMy: '我的',
  },
  hi: {
    title:         'ATT&CK एंटरप्राइज v14.1',
    search:        'तकनीक खोजें...',
    subs:          'उप-तकनीक',
    authenticated: '● प्रमाणित',
    logout:        'लॉगआउट',
    loading:       'सत्र प्रारंभ...',
    authRequired:  'प्रमाणीकरण आवश्यक',
    tagline:       'हथियार को समझो, भविष्य सुरक्षित करो।',
    enterMatrix:   'मैट्रिक्स में प्रवेश',
    brand:         'ROOT14',
    brandSub:      'साइबर सुरक्षा प्रशिक्षण',
    skip:          'SKIP',
    visitors:      'आगंतुक', finishers: 'पूरा', mypage: 'MY', marketing: 'AI ROOT', mainSite: 'मुख्य', completed: 'पूर्ण',
    comingSoonHint: 'सामग्री तैयार हो रही है', introHint: 'इंट्रो देखें', itBasics: 'IT मूल', itBasicsHint: 'IT मूल सीखें', communityLabel: 'समुदाय', communityHint: 'समुदाय पृष्ठ', adminHint: 'व्यवस्थापक',
    resultsCount: 'परिणाम', moreResults: 'और...',
    navBack: 'वापस', navHome: 'होम', navAll: 'सभी', navChat: 'समुदाय', navMy: 'मेरा',
  },
  ja: {
    title:         'ATT&CK エンタープライズ v14.1',
    search:        'テクニック検索...',
    subs:          'サブ表示',
    authenticated: '● 認証済み',
    logout:        'ログアウト',
    loading:       'セッション初期化中...',
    authRequired:  '認証が必要です',
    tagline:       '武器を知り、未来を守れ。',
    enterMatrix:   'マトリクスへ進む',
    brand:         'ROOT14',
    brandSub:      'サイバーセキュリティ教育',
    skip:          'SKIP',
    visitors:      '訪問者', finishers: '修了者', mypage: 'MY', marketing: 'AI ROOT', mainSite: 'メイン', completed: '修了',
    comingSoonHint: '教育コンテンツ準備中', introHint: 'イントロを見る', itBasics: 'IT基礎', itBasicsHint: 'IT基礎学習', communityLabel: 'コミュニティ', communityHint: 'コミュニティページ', adminHint: '管理者ページ',
    resultsCount: '件', moreResults: 'もっと見る...',
    navBack: '戻る', navHome: 'ホーム', navAll: '全て', navChat: 'コミュニティ', navMy: 'マイ',
  },
  ar: {
    title:         'ATT&CK Enterprise v14.1',
    search:        'ابحث عن التقنيات...',
    subs:          'تبديل الفروع',
    authenticated: '● موثق',
    logout:        'تسجيل الخروج',
    loading:       'جارٍ تهيئة الجلسة...',
    authRequired:  'المصادقة مطلوبة',
    tagline:       'اعرف السلاح، أمِّن المستقبل.',
    enterMatrix:   'دخول المصفوفة',
    brand:         'ROOT14',
    brandSub:      'منصة التدريب على الأمن السيبراني',
    skip:          'SKIP',
    visitors:      'زوار', finishers: 'مكتملون', mypage: 'MY', marketing: 'AI ROOT', mainSite: 'الرئيسية', completed: 'مكتمل',
    comingSoonHint: 'جارٍ تحضير المحتوى', introHint: 'عرض المقدمة', itBasics: 'IT أساسيات', itBasicsHint: 'تعلم أساسيات IT', communityLabel: 'مجتمع', communityHint: 'صفحة المجتمع', adminHint: 'لوحة الإدارة',
    resultsCount: 'نتائج', moreResults: 'المزيد...',
    navBack: 'رجوع', navHome: 'الرئيسية', navAll: 'الكل', navChat: 'مجتمع', navMy: 'حسابي',
  },
  vi: {
    title:         'ATT&CK Enterprise v14.1',
    search:        'Tìm kiếm kỹ thuật...',
    subs:          'Bật/Tắt Nhánh',
    authenticated: '● ĐÃ XÁC THỰC',
    logout:        'ĐĂNG XUẤT',
    loading:       'Đang khởi tạo phiên...',
    authRequired:  'Yêu cầu xác thực',
    tagline:       'Biết vũ khí, bảo vệ tương lai.',
    enterMatrix:   'VÀO MA TRẬN',
    brand:         'ROOT14',
    brandSub:      'Nền Tảng Đào Tạo An Ninh Mạng',
    skip:          'SKIP',
    visitors:      'Người dùng', finishers: 'Hoàn thành', mypage: 'MY', marketing: 'AI ROOT', mainSite: 'Trang chủ', completed: 'HOÀN THÀNH',
    comingSoonHint: 'Nội dung đang được chuẩn bị',
    introHint:     'Xem màn hình giới thiệu',
    itBasics:      'IT Cơ bản', itBasicsHint: 'Học IT cơ bản',
    communityLabel:'Cộng đồng', communityHint: 'Trang cộng đồng',
    adminHint:     'Trang quản trị',
    resultsCount:  'kết quả', moreResults: 'thêm...',
    navBack: 'Quay lại', navHome: 'Trang chủ', navAll: 'Tất cả', navChat: 'Cộng đồng', navMy: 'Của tôi',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG 아이콘
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// GotrootHeroLogo 제거됨 — v0.7.5에서 HeroIncidentMatrix로 대체

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메인 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function UltimateCinematicMatrix() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();

  // ── 매트릭스 데이터 (Supabase → fallback JSON) ──
  const { attackMatrix, langMapping, loading: matrixLoading } = useMatrixData();

  // ── 교육 진행률 (Supabase edu_progress) ──
  const { getProgress, completedTechIds: eduCompletedIds } = useEduProgress();

  // ── 히어로 상태 (localStorage에 기록 있으면 skip, 없으면 Hero 표시) ──
  const [heroPhase, setHeroPhase] = useState(() => {
    return localStorage.getItem('gotroot_intro_seen') === 'true' ? 'done' : 'entering';
  });
  const matrixGridRef = useRef(null);

  // ── 네비게이션 상태 보존 키 ──
  const NAV_STATE_KEY = 'gotroot_nav_state';
  const _readNav = () => { try { return JSON.parse(sessionStorage.getItem(NAV_STATE_KEY) || '{}'); } catch { return {}; } };

  // ── 매트릭스 상태 (sessionStorage에서 복원) ──
  const [showSubs,       setShowSubs]       = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [language,       setLanguage]       = useState(() => getStoredLang());
  const [tooltip,        setTooltip]        = useState({ show: false, x: 0, y: 0, title: '', id: '', desc: '' });
  const [animatingCard,  setAnimatingCard]  = useState(null);
  const [animOrigin,     setAnimOrigin]     = useState({ x: '50%', y: '50%' });
  const [clickCounts,    setClickCounts]    = useState({});
  const [showAvatarRoom, setShowAvatarRoom] = useState(false);
  const [darkMode] = useState(false); // 라이트 모드 고정
  const [completedLabs, setCompletedLabs] = useState([]);
  const [statsData, setStatsData] = useState({ visitors: 0, finishers: 0 });
  const [selectedTactic, setSelectedTactic] = useState(() => _readNav().selectedTactic || null);
  const [sidebarOpen, setSidebarOpen] = useState(() => _readNav().sidebarOpen || false);
  const [activeWidget, setActiveWidget] = useState(null);   // 호환용 유지 (줌인 레이아웃 참조)
  const [viewMode, setViewMode] = useState(() => _readNav().viewMode || 'dashboard');

  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const isLoggedInRef = useRef(isLoggedIn);
  const userRef       = useRef(user);
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);
  useEffect(() => { userRef.current = user; }, [user]);

  const t = uiT[language] || uiT.en;
  const dm = darkMode;

  // ── 위젯 데이터 로더 제거됨 (v0.7.3: 과정 셀렉터 흐름으로 대체) ──

  // ── 네비게이션 상태 → sessionStorage 동기화 ──
  useEffect(() => {
    try {
      const existing = _readNav();
      existing.selectedTactic = selectedTactic;
      existing.viewMode = viewMode;
      existing.sidebarOpen = sidebarOpen;
      existing.timestamp = Date.now();
      sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(existing));
    } catch { /* ignore */ }
  }, [selectedTactic, viewMode, sidebarOpen]);

  // ── selectedTactic 초기화 시 activeWidget도 리셋 ──
  useEffect(() => { if (!selectedTactic) { setActiveWidget(null); } }, [selectedTactic]);

  // ── 모바일 줌인 시 서브기법 자동 표시 (데스크톱 영향 없음) ──
  useEffect(() => {
    if (selectedTactic && window.innerWidth <= 768) {
      setShowSubs(true);
    }
  }, [selectedTactic]);

  // ── 매트릭스 자동 스케일 (뷰포트 맞춤) ──
  const MATRIX_DESIGN_WIDTH = 2280; // 매트릭스 디자인 기준 너비 (2200px grid + padding)
  const MIN_ZOOM = 0.5; // 최소 zoom 하한선 — 이하에서는 수평 스크롤
  const [matrixZoom, setMatrixZoom] = useState(1);
  useEffect(() => {
    const el = matrixGridRef.current;
    if (!el) return;
    const calc = () => {
      if (selectedTactic || window.innerWidth < 1024) { setMatrixZoom(1); return; }
      const currentZoom = parseFloat(el.style.zoom) || 1;
      const available = el.clientWidth * currentZoom;
      const raw = available / MATRIX_DESIGN_WIDTH;
      // 하한선 이하면 zoom 적용하지 않고 수평 스크롤로 전환
      setMatrixZoom(raw >= MIN_ZOOM ? Math.min(1, raw) : 1);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    window.addEventListener('resize', calc);
    return () => { ro.disconnect(); window.removeEventListener('resize', calc); };
  }, [selectedTactic]);

  // ── 다크 모드 토글 ──
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('gotroot_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // ── 완료 랩 로드 ──
  useEffect(() => {
    try {
      const labs = JSON.parse(localStorage.getItem('gotroot_completed_labs') || '[]');
      setCompletedLabs(labs);
    } catch { /* ignore */ }
  }, []);

  // ── 통계 데이터 로드 (localStorage 기반) ──
  useEffect(() => {
    try {
      const visitors = parseInt(localStorage.getItem('gotroot_visitor_count') || '0', 10);
      const clickData = JSON.parse(localStorage.getItem('gotroot_tech_clicks') || '{}');
      const uniqueClicked = Object.keys(clickData).length;
      const totalTechs = attackMatrix.reduce((sum, t) => sum + t.techniques.length, 0);
      const finishers = uniqueClicked >= totalTechs ? 1 : 0;
      // 방문자 카운트 증가 (세션당 1회)
      if (!sessionStorage.getItem('gotroot_visited')) {
        sessionStorage.setItem('gotroot_visited', 'true');
        const newCount = visitors + 1;
        localStorage.setItem('gotroot_visitor_count', String(newCount));
        setStatsData({ visitors: newCount, finishers });
      } else {
        setStatsData({ visitors: Math.max(visitors, 1), finishers });
      }
    } catch { setStatsData({ visitors: 1, finishers: 0 }); }
  }, []);

  // ── 검색 매칭 기법 수 ──
  const searchMatchCount = useMemo(() => {
    if (!searchTerm) return 0;
    const q = searchTerm.toLowerCase();
    const langMap = langMapping[language];
    let count = 0;
    attackMatrix.forEach(tactic => {
      const tacticTranslated = langMap ? (langMap.titles[tactic.title] || '') : '';
      const tacticMatch = tactic.title.toLowerCase().includes(q) || tactic.id.toLowerCase().includes(q) || tacticTranslated.toLowerCase().includes(q);
      tactic.techniques.forEach(tech => {
        const translatedName = langMap ? (langMap.techniques[tech.name] || '') : '';
        if (tacticMatch || tech.name.toLowerCase().includes(q) || translatedName.toLowerCase().includes(q) || (tech.subs?.length && tech.subs.some(s => s.name.toLowerCase().includes(q)))) count++;
      });
    });
    return count;
  }, [searchTerm, language]);

  // ── 완료된 기법 세트 (수료증 + Supabase 교육 진행률 병합) ──
  const completedTechSet = useMemo(() => {
    const set = new Set();
    completedLabs.forEach(lab => {
      if (typeof lab === 'string') set.add(lab);
      else if (lab?.technique) set.add(lab.technique);
    });
    // Supabase 교육 진행률 병합
    eduCompletedIds.forEach(tid => set.add(tid));
    return set;
  }, [completedLabs, eduCompletedIds]);

  // ── 인기 기법 계산 (상위 5개 + 순위 맵) ──
  const popularTechs = useMemo(() => {
    const sorted = Object.entries(clickCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);
    const rankMap = {};
    sorted.slice(0, 3).forEach(([name], i) => { rankMap[name] = i + 1; });
    return {
      top5: new Set(sorted.slice(0, 5).map(([name]) => name)),
      top3: new Set(sorted.slice(0, 3).map(([name]) => name)),
      rankMap,
    };
  }, [clickCounts]);

  // Canvas 매트릭스 레인 제거됨 — v0.7.5에서 HeroIncidentMatrix로 대체

  // ── 클릭 카운트 로드 (localStorage + Supabase access_logs) ──
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('gotroot_tech_clicks') || '{}');
      if (Object.keys(local).length > 0) setClickCounts(local);
    } catch { /* ignore */ }
    (async () => {
      try {
        const { data } = await supabase
          .from('access_logs')
          .select('technique')
          .eq('action', 'technique_click')
          .not('technique', 'is', null)
          .limit(500);
        if (data && data.length > 0) {
          const counts = {};
          data.forEach(r => { if (r.technique) counts[r.technique] = (counts[r.technique] || 0) + 1; });
          setClickCounts(prev => {
            const merged = { ...prev };
            for (const [k, v] of Object.entries(counts)) merged[k] = Math.max(merged[k] || 0, v);
            return merged;
          });
        }
      } catch { /* RLS 또는 네트워크 오류 시 로컬 카운트 사용 */ }
    })();
  }, []);

  // ── 히어로 진입 버튼: sliding → done ──
  const enterMatrix = () => {
    setHeroPhase('sliding');
    setTimeout(() => {
      setHeroPhase('done');
      localStorage.setItem('gotroot_intro_seen', 'true');
    }, 650);
  };

  // ── 히어로 즉시 스킵 ──
  const skipHero = () => {
    setHeroPhase('done');
    localStorage.setItem('gotroot_intro_seen', 'true');
  };

  // ── 언어 헬퍼 ──
  const getTechName    = (name)  => { const m = langMapping[language]; return m ? (m.techniques[name] || name) : name; };
  const getTacticTitle = (title) => { const m = langMapping[language]; return m ? (m.titles[title]    || title) : title; };

  // ── MITRE 툴팁 정보 (실제 ID 기반) ──
  const getMitreInfo = (name, mitreId) => {
    const descs = {
      ko: `공격자는 [${getTechName(name)}] 기법으로 운영 목적을 달성할 수 있습니다.`,
      en: `Adversaries may use [${name}] to further their operational objectives.`,
      zh: `攻击者可能利用 [${getTechName(name)}] 实现其目标。`,
      hi: `हमलावर [${getTechName(name)}] का उपयोग लक्ष्य हासिल करने के लिए कर सकते हैं।`,
      ja: `攻撃者は [${getTechName(name)}] を使用して目標を達成できます。`,
    };
    return { id: mitreId, desc: descs[language] || descs.en };
  };

  // ── 기법 클릭 핸들러 ──
  const handleItemClick = useCallback((tactic, tech, sub, e) => {
    let targetName = sub?.name ?? tech.name;
    let lookupKey = sub?.sid ?? tech.tid;
    let url = TECHNIQUE_URLS[lookupKey];
    // 부모 기법에 edu 없으면 → 첫 번째 서브기법으로 자동 이동
    if (!url && !sub && tech.subs?.length) {
      const firstSubWithEdu = tech.subs.find(s => TECHNIQUE_URLS[s.sid]);
      if (firstSubWithEdu) {
        lookupKey = firstSubWithEdu.sid;
        targetName = firstSubWithEdu.name;
        url = TECHNIQUE_URLS[lookupKey];
      }
    }
    // 교육 콘텐츠 미준비 기법 → 준비중 토스트 (DOM 직접 삽입)
    if (!url) {
      const existing = document.getElementById('coming-soon-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'coming-soon-toast';
      toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:9999;animation:fadeInDown .3s ease';
      // XSS 방어: innerHTML 대신 안전한 DOM API 사용 (textContent로 삽입)
      const inner = document.createElement('div');
      inner.style.cssText = 'background:#0f172a;color:#fff;padding:12px 24px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.3);border:1px solid #334155;display:flex;align-items:center;gap:12px;font-family:sans-serif';
      const ico = document.createElement('span');
      ico.style.fontSize = '20px';
      ico.textContent = '\u23F3';
      const tw = document.createElement('div');
      const nm = document.createElement('div');
      nm.style.cssText = 'font-size:13px;font-weight:700';
      nm.textContent = targetName;
      const ds = document.createElement('div');
      ds.style.cssText = 'font-size:11px;color:#94a3b8';
      ds.textContent = t.comingSoonHint;
      tw.append(nm, ds);
      inner.append(ico, tw);
      toast.appendChild(inner);
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
      try { ReactGA.event({ category: 'Matrix_Interaction', action: 'Coming_Soon_Click', label: targetName }); } catch {}
      return;
    }
    const ox = e?.clientX != null ? `${((e.clientX / window.innerWidth)  * 100).toFixed(1)}%` : '50%';
    const oy = e?.clientY != null ? `${((e.clientY / window.innerHeight) * 100).toFixed(1)}%` : '50%';
    setAnimOrigin({ x: ox, y: oy });
    setAnimatingCard({ tacticTitle: tactic.title, techName: tech.name, targetName, isSub: !!sub, isCritical: tech.isCritical });
    // 로컬 클릭 카운트 업데이트
    setClickCounts(prev => {
      const updated = { ...prev, [targetName]: (prev[targetName] || 0) + 1 };
      try { localStorage.setItem('gotroot_tech_clicks', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setTooltip(p => ({ ...p, show: false }));
    ReactGA.event({ category: 'Matrix_Interaction', action: 'Select_Technique', label: targetName, value: tech.isCritical ? 10 : 1 });
    if (isLoggedIn && user) {
      logAccess({ userId: user.id, email: user.email, ip: null, action: 'technique_click', technique: targetName });
    }
    // ── 브레드크럼 저장 (navigate 직전) ──
    try {
      const ns = _readNav();
      const tacticTitle = langMapping?.[language]?.[tactic.title] || tactic.title;
      ns.lastVisitedTechnique = lookupKey;
      ns.breadcrumb = [
        { label: 'ROOT14', path: '/', state: { viewMode: 'dashboard' } },
        ...(selectedTactic ? [{
          label: tacticTitle,
          tacticId: tactic.id,
          path: '/',
          state: { viewMode: 'matrix', selectedTactic: tactic.id, sidebarOpen: true }
        }] : [{
          label: t?.mainSite || 'Matrix',
          path: '/',
          state: { viewMode: 'matrix' }
        }]),
        { label: lookupKey, path: `/edu/${lookupKey}` }
      ];
      sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(ns));
    } catch { /* ignore */ }

    setTimeout(() => {
      // 미로그인 → 로그인 페이지로 리다이렉트
      if (!isLoggedIn) { navigate(`/login?redirect=${encodeURIComponent(`/edu/${lookupKey}`)}`); return; }
      // v0.7.3: 과정 레벨 셀렉터로 직행 (위젯 인트로 제거)
      navigate(`/edu/${lookupKey}`);
    }, 1500);
  }, [isLoggedIn, user, navigate, selectedTactic, language, langMapping]);

  // ── autoTarget URL 파라미터 ──
  useEffect(() => {
    const target = searchParams.get('autoTarget');
    if (!target) return;
    const delay = heroPhase === 'done' ? 400 : 4500;
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
          const url = TECHNIQUE_URLS[tech.tid];
          if (!url) break;
          setTimeout(() => {
            if (isLoggedInRef.current) window.location.href = url;
            else window.location.href = `/login?redirect=${encodeURIComponent(url)}`;
          }, 1500);
          break;
        }
      }
    }, delay);
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tooltip 핸들러 ──
  const handleMouseEnter = (e, name, mitreId) => {
    if (mitreId?.includes('.')) e.stopPropagation();
    const { id, desc } = getMitreInfo(name, mitreId);
    setTooltip({ show: true, x: e.clientX, y: e.clientY, title: getTechName(name), id, desc });
  };
  const handleMouseMove  = (e) => setTooltip(p => ({ ...p, x: e.clientX, y: e.clientY }));
  const handleMouseLeave = (e) => { e.stopPropagation(); setTooltip(p => ({ ...p, show: false })); };

  // langOptions → LangToggle 컴포넌트 내 LANG_OPTIONS로 통일됨
  const langOptions = [
    { code: 'ko', label: '한국어',      flag: '🇰🇷' },
    { code: 'en', label: 'English',    flag: '🇺🇸' },
    { code: 'zh', label: '中文',        flag: '🇨🇳' },
    { code: 'hi', label: 'हिंदी',       flag: '🇮🇳' },
    { code: 'ja', label: '日本語',      flag: '🇯🇵' },
    { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div
      className={`relative w-full min-h-screen font-sans overflow-hidden ${dm ? 'dm-root bg-[#0d1b2a] text-slate-200' : 'bg-[#e0e1dd] text-slate-800'}`}
      onClick={() => {}}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* 히어로 CSS 제거됨 — HeroIncidentMatrix에서 framer-motion + Tailwind 사용 */
        /* 매트릭스 카드 */
        .matrix-tech-card {
          transition: border-color .12s, box-shadow .12s, transform .12s;
        }
        .matrix-tech-card:hover {
          border-color: #0d1b2a !important;
          box-shadow: 0 0 8px rgba(13,27,42,0.15);
          transform: translateY(-1px);
        }
        /* 서브기법 스타일 (테크닉명과 시각 구분) */
        .matrix-sub-area { border-left: 2px solid rgba(123,147,190,0.25); }
        .matrix-sub-item { transition: color .1s; color: #7b93be; }
        .matrix-sub-item:hover { color: #0d1b2a; }
        /* 언어 드롭다운 아이템 */
        .matrix-lang-item:hover { background: rgba(65,90,119,0.05); }
        /* 검색 매칭 카드 글로우 애니메이션 */
        @keyframes searchGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
          50% { box-shadow: 0 0 12px 3px rgba(16,185,129,0.35); }
        }
        .search-matched { animation: searchGlow 1.5s ease-in-out infinite; }
        /* 사이드 suck-in */
        @keyframes suckIn {
          0%   { clip-path: circle(1.5% at var(--ox) var(--oy)); opacity: 0; }
          20%  { opacity: 1; }
          100% { clip-path: circle(160% at var(--ox) var(--oy)); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPing {
          0%, 100% { transform: scale(1);   opacity: 0.8; }
          50%       { transform: scale(1.8); opacity: 0.2; }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        .overlay-suck { animation: suckIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        .overlay-fade { opacity: 0; animation: fadeUp 0.4s 0.32s ease forwards; }
        /* 인기 카드 하이라이트 */
        .matrix-tech-popular { border-color: rgba(244,208,111,0.4) !important; border-width: 2px; }
        .matrix-tech-top3 { border-color: rgba(244,208,111,0.6) !important; }
        .rank-badge {
          position: absolute; top: 4px; right: 4px; z-index: 5;
          min-width: 18px; height: 18px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 10px; line-height: 1; padding: 0 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); }
        .rank-2 { background: linear-gradient(135deg, #E8E8E8, #B0B0B0); }
        .rank-3 { background: linear-gradient(135deg, #CD7F32, #A0522D); }
        .click-count-badge {
          position: absolute; bottom: 3px; right: 4px;
          font-size: 8px; font-weight: 700; color: rgba(65,90,119,0.45);
          letter-spacing: 0.02em;
        }
        /* 카드 내 기법명 영역 강화 */
        .tech-name-area {
          padding: 3px 5px; margin: -2px -5px 0 -5px;
          border-radius: 3px;
          background: linear-gradient(135deg, rgba(15,23,42,0.04), rgba(15,23,42,0.01));
          border-bottom: 1px solid rgba(224,225,221,0.6);
        }
        .tech-name-critical .tech-name-area {
          background: linear-gradient(135deg, rgba(65,90,119,0.06), rgba(65,90,119,0.02));
          border-bottom-color: rgba(65,90,119,0.15);
        }
        /* 서브기법 영역 강화 */
        .matrix-sub-area {
          border-left: 2px solid rgba(123,147,190,0.25);
          background: rgba(241,245,249,0.5);
          border-radius: 0 3px 3px 0;
          padding: 3px 4px 3px 6px !important;
          margin-top: 4px !important;
        }
        .matrix-sub-item { transition: color .1s, padding-left .1s; color: #7b93be; }
        .matrix-sub-item:hover { color: #0d1b2a; padding-left: 2px; }
        /* ── 다크 모드 ── */
        .dm-root { background: #0d1b2a !important; color: #e0e1dd !important; }
        .dm-root .dm-header { background: #0d1b2a !important; border-color: #415a77 !important; }
        .dm-tactic { cursor: default !important; user-select: none; pointer-events: none; }
        .dm-tactic h3, .dm-tactic p { cursor: default !important; pointer-events: none; }
        /* ── Full Matrix 비선택 뷰: 전술 헤더 탭/클릭 활성화 (모바일·태블릿·데스크톱 공통) ── */
        .matrix-full-grid:not(.matrix-zoomed) .dm-tactic { pointer-events: auto !important; cursor: pointer !important; }
        .matrix-full-grid:not(.matrix-zoomed) .dm-tactic h3,
        .matrix-full-grid:not(.matrix-zoomed) .dm-tactic p { pointer-events: auto !important; }
        .dm-root .dm-tactic h3 { color: #e0e1dd !important; }
        .dm-root .dm-tactic p { color: #94a3b8 !important; }
        .dm-root .matrix-tech-card { background: #0d1b2a !important; }
        .dm-root .matrix-tech-card:hover { border-color: #00ff41 !important; }
        .dm-root .tech-name-area { background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)) !important; border-bottom-color: rgba(71,85,105,0.4) !important; }
        .dm-root .tech-name-critical .tech-name-area { background: linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.04)) !important; }
        .dm-root .matrix-sub-area { background: rgba(13,27,42,0.6) !important; border-left-color: rgba(65,90,119,0.3) !important; }
        .dm-root .matrix-sub-item { color: #64748b !important; }
        .dm-root .matrix-sub-item:hover { color: #00ff41 !important; }
        .dm-root .text-slate-900 { color: #e0e1dd !important; }
        .dm-root .text-slate-400 { color: #64748b !important; }
        .dm-root .dm-footer { background: #0d1b2a !important; border-color: #0d1b2a !important; }
        .dm-root .mobile-bottom-nav { background: #0d1b2a !important; border-color: #415a77 !important; }
        .dm-root .mobile-bottom-nav button { color: #94a3b8 !important; }
        .dm-root .mobile-bottom-nav button:active { color: #00ff41 !important; }
        .dm-root .dm-search { background: rgba(13,27,42,0.8) !important; border-color: #475569 !important; color: #e0e1dd !important; }
        .dm-root .dm-stats { background: #0d1b2a !important; border-color: #415a77 !important; }
        /* ── 완료 뱃지 ── */
        .matrix-tech-completed { border-color: rgba(34,197,94,0.4) !important; border-width: 2px; }
        .matrix-tech-completed::after {
          content: '✓'; position: absolute; top: 4px; left: 4px; z-index: 5;
          width: 16px; height: 16px; border-radius: 50%;
          background: #22c55e; color: white; font-size: 9px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        /* ── 교육 콘텐츠 프리뷰 ── */
        .edu-preview {
          background: linear-gradient(135deg, rgba(241,245,249,0.5), rgba(241,245,249,0.2));
          border-radius: 0 0 4px 4px;
          padding: 8px 10px;
          margin: 8px -16px -16px -16px;
        }
        .dm-root .edu-preview {
          background: linear-gradient(135deg, rgba(65,90,119,0.08), rgba(65,90,119,0.03)) !important;
          border-color: rgba(71,85,105,0.4) !important;
        }
        /* ── 다크모드 토글 스위치 ── */
        .theme-toggle {
          position: relative; width: 36px; height: 18px; border-radius: 9px; cursor: pointer;
          border: 1px solid rgba(65,90,119,0.4); transition: all 0.2s;
        }
        .theme-toggle::after {
          content: ''; position: absolute; top: 2px; left: 2px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #0d1b2a; transition: transform 0.2s;
        }
        .theme-toggle.active { background: #0d1b2a; border-color: #00ff41; }
        .theme-toggle.active::after { transform: translateX(18px); background: #00ff41; }
        /* ── GOTROOT 로고 심볼 ── */
        .gotroot-logo-symbol { text-decoration: none; }
        .gotroot-logo-icon svg { filter: drop-shadow(0 0 4px rgba(65,90,119,0.3)); transition: filter 0.2s; }
        .gotroot-logo-symbol:hover .gotroot-logo-icon svg { filter: drop-shadow(0 0 8px rgba(65,90,119,0.5)); }
        @keyframes logoPulse { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }
        .gotroot-logo-icon circle { animation: logoPulse 3s ease-in-out infinite; }
        /* ── 좌측 사이드바 ── */
        .tactic-sidebar { width: 210px; min-width: 210px; overflow-y: auto; scrollbar-width: thin; }
        .tactic-sidebar::-webkit-scrollbar { width: 4px; }
        .tactic-sidebar::-webkit-scrollbar-thumb { background: rgba(65,90,119,0.3); border-radius: 2px; }
        .tactic-sidebar-btn {
          width: 100%; text-align: left; padding: 10px 12px; border-radius: 6px;
          border: 1px solid transparent; font-size: 13px; font-weight: 700;
          transition: all 0.15s; cursor: pointer;
          display: flex; align-items: center; gap: 6px; line-height: 1.3;
        }
        .tactic-sidebar-btn .tactic-id { font-size: 10px; font-weight: 900; opacity: 0.5; min-width: 22px; }
        .tactic-sidebar-btn .tactic-count {
          margin-left: auto; font-size: 10px; font-weight: 800;
          background: rgba(13,27,42,0.1); color: #0d1b2a;
          padding: 2px 6px; border-radius: 8px; white-space: nowrap;
        }
        .dm-root .tactic-sidebar-btn { color: #e0e1dd; border-color: rgba(65,90,119,0.5); background: rgba(13,27,42,0.6); }
        .dm-root .tactic-sidebar-btn:hover { border-color: rgba(0,255,65,0.4); background: rgba(0,255,65,0.08); }
        .dm-root .tactic-sidebar-active { border-color: #00ff41 !important; background: rgba(0,255,65,0.08) !important; color: #00ff41 !important; box-shadow: inset 3px 0 0 #00ff41; }
        .tactic-sidebar-btn:not(.dm-root .tactic-sidebar-btn) { color: #415a77; border-color: rgba(224,225,221,1); background: white; }
        .tactic-sidebar-btn:not(.dm-root .tactic-sidebar-btn):hover { border-color: rgba(13,27,42,0.5); background: rgba(13,27,42,0.04); }
        .tactic-sidebar-active:not(.dm-root .tactic-sidebar-active) { border-color: #0d1b2a !important; background: rgba(13,27,42,0.08) !important; color: #0d1b2a !important; box-shadow: inset 3px 0 0 #0d1b2a; font-weight: 900; }
        /* ── 모바일 사이드바 오버레이 ── */
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0.8; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .sidebar-backdrop { display: none; }
        .sidebar-mobile-close { display: none; }
        @media (max-width: 768px) {
          .tactic-sidebar {
            position: fixed !important; top: 0 !important; left: 0 !important;
            z-index: 150; height: 100vh; width: 260px !important; min-width: 260px !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.2);
            animation: slideInLeft 0.25s ease-out forwards;
            overflow-y: auto;
          }
          .sidebar-backdrop { display: block !important; animation: fadeIn 0.2s ease-out; }
          .sidebar-mobile-close {
            display: flex !important; align-items: center; justify-content: flex-end;
            padding: 8px 4px; font-size: 12px; font-weight: 700; color: #64748b;
            cursor: pointer; border: none; background: none;
          }
          .sidebar-mobile-close:hover { color: #0d1b2a; }
        }
        @media (min-width: 769px) {
          .sidebar-backdrop { display: none !important; }
        }
        /* ── 모바일 풀매트릭스: 2컬럼 + 기법카드 숨김 ── */
        @media (max-width: 767px) {
          /* 전체 보기 (비줌): 2열 그리드, 카드 숨김 */
          .matrix-full-grid:not(.matrix-zoomed) {
            grid-template-columns: repeat(2, 1fr) !important;
            min-width: unset !important;
            gap: 8px !important;
          }
          .matrix-full-grid:not(.matrix-zoomed) .matrix-tech-cards-wrap {
            display: none !important;
          }
          .matrix-full-grid:not(.matrix-zoomed) .dm-tactic {
            cursor: pointer !important;
            min-height: 60px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border-radius: 8px;
          }
          .matrix-full-grid:not(.matrix-zoomed) .dm-tactic:active {
            opacity: 0.7;
            transform: scale(0.97);
          }
          /* 줌인 모드: 1열 + 기법 카드 표시 */
          .matrix-full-grid.matrix-zoomed {
            grid-template-columns: 1fr !important;
            min-width: unset !important;
            gap: 12px !important;
          }
          .matrix-full-grid.matrix-zoomed .matrix-tech-cards-wrap {
            display: flex !important;
          }
          /* 헤더 모바일 최적화 — 가로 스크롤 + 터치 타겟 44px */
          .dm-header {
            height: 56px !important; padding-left: 6px !important; padding-right: 6px !important;
            overflow-x: auto !important; -webkit-overflow-scrolling: touch;
            flex-wrap: nowrap !important; scrollbar-width: none;
          }
          .dm-header::-webkit-scrollbar { display: none; }
          .dm-header .dm-mobile-hide { display: none !important; }
          .dm-header button,
          .dm-header span[class*="cursor-pointer"],
          .dm-header .gotroot-logo-symbol {
            min-height: 44px !important; min-width: 36px !important;
            display: inline-flex !important; align-items: center !important; justify-content: center !important;
            font-size: 11px !important; padding: 6px 8px !important;
          }
          .dm-header .dm-search { width: 80px !important; font-size: 12px !important; height: 44px !important; padding: 8px !important; }
          /* 사이드바 버튼 터치 타겟 */
          .tactic-sidebar-btn { min-height: 44px !important; padding: 10px 12px !important; font-size: 13px !important; }
          .sidebar-toggle-btn { min-height: 44px !important; width: 36px !important; min-width: 36px !important; }
          /* 매트릭스 영역 패딩 축소 */
          .matrix-grid-area { padding: 8px !important; }
          /* 줌인 배너 컴팩트 — 모바일 flex-wrap 지원 */
          .matrix-zoom-banner { padding: 6px 10px !important; flex-wrap: wrap !important; gap: 4px !important; }
          .matrix-zoom-banner span { font-size: 10px !important; }
          .matrix-zoom-banner button { margin-top: 2px; }
          /* 모바일 검색 드롭다운 */
          .mobile-search-dropdown { min-width: 260px !important; right: 0 !important; left: auto !important; }
          /* 하단 네비 높이만큼 콘텐츠 바닥 패딩 */
          .dm-footer { padding-bottom: 64px !important; }
          /* 모바일 하단 네비 */
          .mobile-bottom-nav {
            display: flex !important;
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
            background: white; border-top: 1px solid #e2e8f0;
            justify-content: space-around; align-items: center;
            padding: 6px 4px; padding-bottom: max(6px, env(safe-area-inset-bottom));
            box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
          }
          .mobile-bottom-nav button {
            display: flex; flex-direction: column; align-items: center; gap: 2px;
            font-size: 9px; font-weight: 700; color: #64748b;
            background: none; border: none; cursor: pointer; padding: 4px 8px;
            min-height: 44px; min-width: 44px; justify-content: center;
          }
          .mobile-bottom-nav button:active { color: #3b82f6; transform: scale(0.95); }
          .mobile-bottom-nav .nav-icon { font-size: 16px; line-height: 1; }
        }
        @media (min-width: 768px) {
          .dm-header .dm-mobile-only { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
          .dm-mobile-only-block { display: none !important; }
        }
        /* ── 태블릿 (768-1023px) ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .matrix-full-grid:not(.matrix-zoomed) {
            grid-template-columns: repeat(4, 1fr) !important;
            min-width: unset !important;
            gap: 6px !important;
          }
          .matrix-full-grid:not(.matrix-zoomed) .matrix-tech-cards-wrap {
            display: none !important;
          }
          .matrix-full-grid:not(.matrix-zoomed) .dm-tactic {
            cursor: pointer !important;
            min-height: 56px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border-radius: 8px;
          }
          .matrix-full-grid.matrix-zoomed {
            grid-template-columns: 1fr !important;
            min-width: unset !important; gap: 12px !important;
          }
          .matrix-full-grid.matrix-zoomed .matrix-tech-cards-wrap {
            display: flex !important;
          }
          /* 헤더 태블릿 터치 타겟 */
          .dm-header button,
          .dm-header span[class*="cursor-pointer"] {
            min-height: 44px !important; min-width: 44px !important;
            display: inline-flex !important; align-items: center !important; justify-content: center !important;
          }
          .dm-header .dm-search { height: 44px !important; }
          .tactic-sidebar-btn { min-height: 44px !important; }
        }
      `}} />

      {/* ══════════════════════════════════════
          MITRE ATT&CK 사고 매트릭스 히어로 (v0.7.5)
      ══════════════════════════════════════ */}
      {heroPhase !== 'done' && (
        <HeroIncidentMatrix
          heroPhase={heroPhase}
          enterMatrix={enterMatrix}
          skipHero={skipHero}
          language={language}
          setLanguage={setLanguage}
          langOptions={langOptions}
          isLoggedIn={isLoggedIn}
          navigate={navigate}
        />
      )}

      {/* ══════════════════════════════════════
          비로그인 매트릭스 차단 오버레이
      ══════════════════════════════════════ */}
      {heroPhase === 'done' && !isLoggedIn && (
        <div className="fixed inset-0 z-[60] bg-[#0d1b2a]/95 flex items-center justify-center px-4"
          style={{ backdropFilter: 'blur(8px)' }}>
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-black text-white tracking-wider mb-3">
              매트릭스 열람 권한이 필요합니다
            </h2>
            <p className="text-slate-400 text-sm font-mono mb-6 leading-relaxed">
              MITRE ATT&CK 매트릭스 학습을 시작하려면<br/>
              레벨 테스트 후 회원가입이 필요합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/level-test')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wider rounded-lg transition-all active:scale-[0.98]"
              >
                🎯 레벨 테스트 시작
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 font-bold text-sm tracking-wider rounded-lg transition-all"
              >
                로그인
              </button>
            </div>
            {/* AIROOT 소개 — 로컬 전용 (Vercel 배포 시 숨김) */}

            <button
              onClick={() => { setHeroPhase('entering'); localStorage.removeItem('gotroot_intro_seen'); window.scrollTo({ top: 0 }); }}
              className="mt-4 text-slate-600 hover:text-slate-400 text-xs font-mono transition-colors"
            >
              ← 인트로 다시 보기
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          밝은 테마 ATT&CK 매트릭스
      ══════════════════════════════════════ */}
      <div className={`transition-opacity duration-[800ms] ${heroPhase === 'done' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        {/* 헤더 */}
        <div className="dm-header w-full h-14 flex items-center justify-between px-2 sm:px-4 2xl:px-6 border-b shadow-sm gap-2 bg-white border-slate-200 sticky top-0 z-50">
          {/* 좌측: ROOT14 심볼 로고 + 글로벌 내비 */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" onClick={e => { e.preventDefault(); window.location.reload(); }}
              className="gotroot-logo-symbol flex items-center gap-1.5 no-underline" title="페이지 새로고침">
              <img
                src="/logo/root14-logo.svg"
                alt="ROOT14"
                style={{ height: 32, width: 'auto', objectFit: 'contain' }}
                draggable={false}
              />
            </a>
            {/* 글로벌 내비 아이콘 */}
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => { setHeroPhase('entering'); localStorage.removeItem('gotroot_intro_seen'); window.scrollTo({ top: 0 }); }}
                className="px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap cursor-pointer select-none transition-colors border-violet-300 text-violet-500 bg-violet-50/50 hover:text-violet-700 hover:border-violet-400"
                title={t.introHint}>
                🎬 <span className="dm-mobile-hide">INTRO</span>
              </span>
              <span
                onClick={() => setViewMode(v => v === 'dashboard' ? 'matrix' : 'dashboard')}
                className={`px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap cursor-pointer select-none transition-colors ${
                  viewMode === 'matrix'
                    ? 'border-blue-300 text-blue-500 bg-blue-50/50 hover:text-blue-700 hover:border-blue-400'
                    : 'border-slate-300 text-slate-500 bg-slate-50/50 hover:text-slate-700 hover:border-slate-400'
                }`}
                title={viewMode === 'dashboard' ? '매트릭스 전체 보기' : '대시보드로 돌아가기'}>
                {viewMode === 'dashboard' ? <><span className="dm-mobile-only">🔳</span><span className="dm-mobile-hide">🔳 MATRIX</span></> : <><span className="dm-mobile-only">📋</span><span className="dm-mobile-hide">📋 DASHBOARD</span></>}
              </span>
              {isLoggedIn && (
                <span
                  onClick={() => navigate('/basics')}
                  className="px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap cursor-pointer select-none border-purple-200 text-purple-500 bg-purple-50/50 hover:text-purple-700 hover:border-purple-400 transition-colors"
                  title={t.itBasicsHint}>
                  📖 <span className="dm-mobile-hide">{t.itBasics}</span>
                </span>
              )}
              {/* AIROOT 버튼 — 로컬 전용 (Vercel 배포 시 숨김) */}
              <span
                onClick={() => navigate('/community')}
                className="px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap cursor-pointer select-none border-emerald-200 text-emerald-500 bg-emerald-50/50 hover:text-emerald-700 hover:border-emerald-400 transition-colors"
                title={t.communityHint}>
                💬 <span className="dm-mobile-hide">{t.communityLabel}</span>
              </span>
              {isAdmin && (
                <span
                  onClick={() => navigate('/admin')}
                  className="px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap cursor-pointer select-none border-red-200 text-red-500 bg-red-50/50 hover:text-red-700 hover:border-red-400 transition-colors"
                  title={t.adminHint}>
                  🔒 ADMIN
                </span>
              )}
              <span
                onClick={() => window.location.reload()}
                className="px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap hidden sm:inline-flex cursor-pointer select-none border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors"
                title="페이지 새로고침">
                🤖 {t.marketing}
              </span>
            </div>
          </div>
          {/* 우측: 검색 + 기능 버튼들 */}
          <div className="flex gap-2 items-center ml-auto">
            <div className="relative flex items-center">
              <input
                type="text" placeholder={t.search}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="dm-search px-3 py-1 text-xs rounded border w-32 sm:w-40 bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="ml-1 text-[10px] text-slate-400 hover:text-slate-600 px-1"><Close size={16} /></button>
              )}
              {searchTerm && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                  {searchMatchCount}
                </span>
              )}
              {/* 모바일 검색 결과 드롭다운 */}
              {searchTerm && (() => {
                const lower = searchTerm.toLowerCase();
                const results = [];
                const langMap = langMapping[language];
                attackMatrix.forEach(tac => {
                  // ★ 택틱 자체 검색 (정찰, Reconnaissance, t1 등)
                  const tacTitle = langMap ? (langMap.titles[tac.title] || '') : '';
                  if (tac.title.toLowerCase().includes(lower) || tac.id.toLowerCase().includes(lower) || tacTitle.toLowerCase().includes(lower)) {
                    results.push({ tactic: tac, tech: null, sub: null, name: getTacticTitle(tac.title), tid: tac.id, isTactic: true });
                  }
                  // 기법 + 서브기법 검색
                  tac.techniques.forEach(tech => {
                    const techTranslated = langMap ? (langMap.techniques[tech.name] || '') : '';
                    if (tech.name.toLowerCase().includes(lower) || tech.tid.toLowerCase().includes(lower) || techTranslated.toLowerCase().includes(lower)) {
                      results.push({ tactic: tac, tech, sub: null, name: getTechName(tech.name), tid: tech.tid });
                    }
                    tech.subs?.forEach(sub => {
                      const subTranslated = langMap ? (langMap.techniques[sub.name] || '') : '';
                      if (sub.name.toLowerCase().includes(lower) || sub.sid.toLowerCase().includes(lower) || subTranslated.toLowerCase().includes(lower)) {
                        results.push({ tactic: tac, tech, sub, name: sub.name, tid: sub.sid });
                      }
                    });
                  });
                });
                if (!results.length) return null;
                return (
                  <div className="mobile-search-dropdown fixed right-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[200] max-h-64 overflow-y-auto" style={{ minWidth: 260, top: 58 }}>
                    <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 bg-slate-50 border-b border-slate-100 sticky top-0">
                      {results.length} {t.resultsCount}
                    </div>
                    {results.slice(0, 15).map((r, i) => (
                      <div key={i}
                        onClick={e => {
                          setSearchTerm('');
                          if (r.isTactic) {
                            setSelectedTactic(r.tactic.id);
                            setViewMode('matrix');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            handleItemClick(r.tactic, r.tech, r.sub, e);
                          }
                        }}
                        className={`px-3 py-2.5 text-[11px] hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center gap-2 active:bg-blue-100 ${r.isTactic ? 'bg-amber-50/60' : ''}`}
                      >
                        <span className={`text-[9px] font-mono shrink-0 ${r.isTactic ? 'text-amber-600 font-bold' : 'text-cyan-600'}`}>
                          {r.isTactic ? '📂' : ''}{r.tid}
                        </span>
                        <span className={`font-bold truncate ${r.isTactic ? 'text-amber-800' : 'text-slate-700'}`}>{r.name}</span>
                        {!r.isTactic && TECHNIQUE_URLS[r.tid] && <span className="text-emerald-500 shrink-0"><Education size={12} /></span>}
                        {r.isTactic && <span className="text-[8px] text-amber-500 shrink-0 ml-auto">{r.tactic.techniques.length}개 기법</span>}
                      </div>
                    ))}
                    {results.length > 15 && (
                      <div className="px-3 py-2 text-[9px] text-slate-400 text-center">
                        +{results.length - 15} {t.moreResults}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <button onClick={() => setShowSubs(v => !v)}
              className="px-2 sm:px-3 py-1 bg-[#0d1b2a] text-white text-xs font-bold rounded border border-[#0d1b2a] shadow-sm uppercase whitespace-nowrap hover:bg-[#1b2d45] transition-colors">
              <span className="dm-mobile-hide">{t.subs}</span><span className="dm-mobile-only" style={{ fontSize: 9 }}>SUB</span>
            </button>
            <button onClick={() => setShowAvatarRoom(true)}
              className="dm-mobile-hide px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-200 shadow-sm uppercase whitespace-nowrap hover:bg-emerald-100 transition-colors"
              title="Training Room — Real-time Presence">
              🖥 LIVE
            </button>
            {/* 마이페이지 */}
            {isLoggedIn && (
              <button onClick={() => navigate('/mypage')}
                className="px-2 py-1 text-[9px] font-bold rounded border transition-colors whitespace-nowrap border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                title="My Page">
                👤 {t.mypage}
              </button>
            )}
            <LangToggle lang={language} theme="light" onChange={(code) => { storeLang(code); setLanguage(code); }} />
            {isLoggedIn && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] border px-2 py-1 rounded whitespace-nowrap hidden sm:inline text-emerald-600 border-emerald-200">
                  {t.authenticated}
                </span>
                <button
                  onClick={() => { logout(); localStorage.removeItem('gotroot_intro_seen'); setHeroPhase('entering'); navigate('/'); }}
                  className="text-[10px] border px-2 py-1 rounded hover:border-red-400 hover:text-red-400 transition-colors whitespace-nowrap text-slate-400 border-slate-200"
                  title={t.logout}>
                  <span className="dm-mobile-hide">{t.logout}</span><span className="dm-mobile-only">↩</span>
                </button>
              </div>
            )}
          </div>
        </div>


        {/* 통계바 → MyPage로 이동됨 */}

        {viewMode === 'matrix' ? (
        <>
        {/* 사이드바 + 매트릭스 그리드 래퍼 */}
        <div className="flex w-full">
          {/* 사이드바 토글 버튼 (항상 표시) */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="sidebar-toggle-btn flex items-center justify-center border-r bg-white border-slate-200 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            style={{ width: 44, minWidth: 44, cursor: 'pointer' }}
            title={sidebarOpen ? 'Hide Tactics' : 'Show Tactics'}
          >
            <span className="text-[12px] font-bold text-slate-500 flex items-center gap-0.5" style={{ writingMode: sidebarOpen ? 'horizontal-tb' : 'vertical-rl' }}>
              {sidebarOpen ? <ChevronLeft size={16} /> : <><ChevronRight size={16} /> TACTICS</>}
            </span>
          </button>
          {/* 모바일 사이드바 backdrop */}
          {sidebarOpen && (
            <div
              className="sidebar-backdrop"
              style={{ position: 'fixed', inset: 0, zIndex: 140, background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* 좌측 전술 카테고리 사이드바 */}
          {sidebarOpen && (
          <div className="tactic-sidebar p-3 border-r flex flex-col gap-1.5 bg-white border-slate-200">
            {/* 모바일 닫기 버튼 */}
            <button className="sidebar-mobile-close" onClick={() => setSidebarOpen(false)}><Close size={16} className="inline" /> 닫기</button>
            <div className="text-[8px] font-black uppercase tracking-widest mb-1 px-2 flex items-center justify-between text-slate-400">
              <span>Tactics</span>
              {selectedTactic && (
                <button
                  onClick={() => setSelectedTactic(null)}
                  className="text-[7px] font-bold px-1.5 py-0.5 rounded transition-colors bg-[#0d1b2a]/10 text-[#0d1b2a] hover:bg-[#0d1b2a]/20">
                  <Close size={16} className="inline" /> RESET
                </button>
              )}
            </div>
            {attackMatrix.map((tactic, i) => (
              <div key={tactic.id}
                onClick={() => {
                  setSelectedTactic(prev => prev === tactic.id ? null : tactic.id);
                  if (window.innerWidth <= 768) {
                    setSidebarOpen(false);
                    setTimeout(() => {
                      matrixGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300);
                  }
                }}
                className={`tactic-sidebar-btn ${selectedTactic === tactic.id ? 'tactic-sidebar-active' : ''}`}>
                <span className="tactic-id">T{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate">{getTacticTitle(tactic.title)}</span>
                <span className="tactic-count">{tactic.techniques.length}</span>
              </div>
            ))}
          </div>
          )}

          {/* 매트릭스 그리드 */}
          <div ref={matrixGridRef} className={`matrix-grid-area flex-1 p-4 min-w-0 ${selectedTactic || matrixZoom >= 1 ? 'overflow-x-auto' : 'overflow-x-hidden'}`} style={!selectedTactic && matrixZoom < 1 ? { zoom: matrixZoom } : undefined}>
            {/* 줌인 리셋 배너 */}
            {selectedTactic && (
              <div className={`matrix-zoom-banner mb-3 px-4 py-2 rounded-lg flex items-center justify-between ${dm ? 'bg-[#00ff41]/5 border border-[#00ff41]/20' : 'bg-[#0d1b2a]/5 border border-[#0d1b2a]/15'}`}>
                <span className={`text-[11px] font-bold ${dm ? 'text-[#00ff41]' : 'text-[#0d1b2a]'}`}>
                  🔍 {getTacticTitle(attackMatrix.find(t => t.id === selectedTactic)?.title || '')}
                  <span className={`ml-2 text-[9px] font-normal ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    — {attackMatrix.find(t => t.id === selectedTactic)?.techniques.length || 0} techniques
                  </span>
                </span>
                <button
                  onClick={() => setSelectedTactic(null)}
                  className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors ${dm ? 'border-[#00ff41]/30 text-[#00ff41] hover:bg-[#00ff41]/10' : 'border-[#0d1b2a]/30 text-[#0d1b2a] hover:bg-[#0d1b2a]/10'}`}>
                  <ArrowLeftIcon className="w-3 h-3 inline" /> Full Matrix
                </button>
              </div>
            )}
            {/* 줌인 시 카드 + 위젯 가로 병렬 래퍼 */}
            <div className={selectedTactic ? 'flex flex-col-reverse lg:flex-row gap-2' : ''}>
            <div className={`grid ${selectedTactic ? `gap-3 lg:w-full lg:flex-none min-w-0 matrix-full-grid matrix-zoomed` : 'gap-3 min-w-[2200px] items-start matrix-full-grid'}`}
              style={{ gridTemplateColumns: selectedTactic ? 'repeat(1, 1fr)' : 'repeat(14, 1fr)' }}>
            {(selectedTactic ? attackMatrix.filter(t => t.id === selectedTactic) : attackMatrix).map((tactic, tacticIdx) => (
              <div key={tactic.id} className={`flex flex-col gap-2 ${!selectedTactic && tacticIdx % 2 === 1 ? (dm ? 'bg-white/[0.02] rounded-lg p-1' : 'bg-slate-50/80 rounded-lg p-1') : ''}`}>
                {/* 전술 헤더 (택틱별 고유 색상) */}
                {(() => {
                  const tc = MATRIX_TACTIC_COLORS[tactic.id] || { hex: '#0d1b2a', darkHex: '#475569' };
                  const isSelected = selectedTactic === tactic.id;
                  return (
                    <div
                      onClick={() => { setSelectedTactic(prev => { const next = prev === tactic.id ? null : tactic.id; if (next && window.innerWidth > 768) setSidebarOpen(true); if (next && window.innerWidth <= 768) { setTimeout(() => { matrixGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); } return next; }); }}
                      className={`dm-tactic rounded-t-lg ${selectedTactic ? 'p-4' : 'p-2.5'} text-center cursor-pointer select-none transition-all duration-200 hover:opacity-90 ${isSelected ? 'ring-2 ring-white/30 shadow-lg' : ''}`}
                      style={{
                        background: dm
                          ? isSelected ? tc.darkHex : `${tc.darkHex}22`
                          : isSelected ? tc.hex : tc.hex,
                        borderTop: `4px solid ${dm ? tc.darkHex : tc.hex}`,
                      }}
                    >
                      <h3 className={`${selectedTactic ? 'text-[18px]' : 'text-[14px]'} font-black uppercase break-words leading-tight cursor-pointer ${dm ? (isSelected ? 'text-white' : 'text-slate-300') : 'text-white'}`}>
                        {getTacticTitle(tactic.title)}
                      </h3>
                      {language !== 'en' && (
                        <p className={`${selectedTactic ? 'text-[12px] mt-1' : 'text-[10px] mt-0.5'} break-words leading-tight ${dm ? 'text-slate-400' : 'text-white/70'}`}>
                          {tactic.title}
                        </p>
                      )}
                      {/* 모바일: 탭 힌트 (풀매트릭스에서만) */}
                      {!selectedTactic && (
                        <p className="dm-mobile-only text-[8px] mt-1 text-white/60">
                          TAP ▸ {tactic.techniques.length} techniques
                        </p>
                      )}
                    </div>
                  );
                })()}
                {/* 기법 카드 */}
                <div className={`matrix-tech-cards-wrap flex flex-col ${selectedTactic ? 'gap-3' : 'gap-2'}`}>
                  {tactic.techniques.map((tech, idx) => {
                    const lowerSearch = searchTerm.toLowerCase();
                    const langMap = langMapping[language];
                    const translatedName = langMap ? (langMap.techniques[tech.name] || '') : '';
                    const tacticTranslated = langMap ? (langMap.titles[tactic.title] || '') : '';
                    const tacticMatched =
                      tactic.title.toLowerCase().includes(lowerSearch) ||
                      tactic.id.toLowerCase().includes(lowerSearch) ||
                      tacticTranslated.toLowerCase().includes(lowerSearch);
                    const matched =
                      lowerSearch === '' ||
                      tacticMatched ||
                      tech.name.toLowerCase().includes(lowerSearch) ||
                      translatedName.toLowerCase().includes(lowerSearch) ||
                      (tech.subs?.length && tech.subs.some(s => s.name.toLowerCase().includes(lowerSearch)));
                    const isTop5 = popularTechs.top5.has(tech.name);
                    const isTop3 = popularTechs.top3.has(tech.name);
                    const rank = popularTechs.rankMap[tech.name];
                    const count = clickCounts[tech.name] || 0;
                    const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                    const isCompleted = completedTechSet.has(tech.name) || completedTechSet.has(tactic.title);
                    return (
                      <div
                        key={idx}
                        onClick={e => handleItemClick(tactic, tech, null, e)}
                        onMouseEnter={e => handleMouseEnter(e, tech.name, tech.tid)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className={`matrix-tech-card border rounded-lg overflow-hidden ${selectedTactic ? 'p-4' : 'p-2.5'} cursor-pointer relative ${dm ? 'bg-[#0d1b2a]' : 'bg-white'} ${matched ? 'opacity-100' : 'opacity-20 grayscale'} ${matched && searchTerm ? 'search-matched' : ''} ${isTop5 ? 'matrix-tech-popular' : ''} ${isTop3 ? 'matrix-tech-top3' : ''} ${tech.isCritical ? 'tech-name-critical' : ''} ${isCompleted ? 'matrix-tech-completed' : ''}`}
                        style={{
                          borderColor: isCompleted ? undefined : isTop5 ? undefined : dm ? 'rgba(65,90,119,0.5)' : 'rgba(224,225,221,1)',
                          borderLeftWidth: 3,
                          borderLeftColor: dm
                            ? (MATRIX_TACTIC_COLORS[tactic.id]?.darkHex || '#475569')
                            : (MATRIX_TACTIC_COLORS[tactic.id]?.hex || '#0d1b2a'),
                        }}
                      >
                        {/* 순위 뱃지 (top3) 또는 HOT 뱃지 (top4-5) */}
                        {rankEmoji && (
                          <span className={`rank-badge rank-${rank}`}>{rankEmoji}</span>
                        )}
                        {isTop5 && !rankEmoji && (
                          <span className="absolute top-1 right-1 text-[7px] font-black bg-[#0d1b2a] text-white px-1.5 py-0.5 rounded shadow-sm z-5">
                            HOT
                          </span>
                        )}
                        {/* 교육 상태 뱃지 (진행률 포함) */}
                        {!isTop5 && !rankEmoji && (() => {
                          if (!hasEduContent(tech.tid, tech.subs)) {
                            return (
                              <span className={`absolute top-1 right-1 text-[7px] font-bold px-1.5 py-0.5 rounded z-5 ${dm ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                ⏳
                              </span>
                            );
                          }
                          // 서브테크닉 중 edu-meta에 매핑된 것의 진행률
                          const subIds = (tech.subs || []).map(s => s.sid).filter(sid => sid in TECHNIQUE_URLS);
                          const eduIds = [tech.tid, ...subIds].filter(id => eduMeta.pages[id]);
                          const firstId = eduIds[0];
                          const prog = firstId ? getProgress(firstId) : null;

                          if (!prog || prog.completed === 0) {
                            return (
                              <span className={`absolute top-1 right-1 text-[7px] font-bold px-1.5 py-0.5 rounded z-5 inline-flex items-center gap-0.5 ${dm ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                                <ChevronRight size={12} /> EDU
                              </span>
                            );
                          } else if (prog.completed >= prog.total) {
                            return (
                              <span className="absolute top-1 right-1 text-[9px] z-5">
                                ✅
                              </span>
                            );
                          } else {
                            return (
                              <span className={`absolute top-1 right-1 text-[7px] font-extrabold px-1.5 py-0.5 rounded z-5 ${dm ? 'bg-blue-900/60 text-blue-400 border border-blue-700/50' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                                {prog.completed}/{prog.total}
                              </span>
                            );
                          }
                        })()}
                        {/* 기법명 영역 (강화된 시각 구분) */}
                        <div className="tech-name-area">
                          <div className={`${selectedTactic ? 'text-[16px]' : 'text-[12px]'} font-extrabold leading-tight ${tech.isCritical ? 'text-red-600' : (dm ? 'text-slate-200' : 'text-slate-900')}`}>
                            {getTechName(tech.name)}{tech.isCritical && ' 🔥'}
                          </div>
                          <div className={`${selectedTactic ? 'text-[11px] mt-0.5' : 'text-[8px] mt-0.5'} font-mono font-bold ${dm ? 'text-cyan-500/70' : 'text-cyan-700/60'}`}>{tech.tid}</div>
                          {language !== 'en' && langMapping[language]?.techniques[tech.name] && (
                            <div className={`${selectedTactic ? 'text-[12px] mt-0.5' : 'text-[9px] mt-0.5'} text-slate-400 truncate`}>{tech.name}</div>
                          )}
                        </div>
                        {/* 서브기법 영역 (강화된 시각 구분) */}
                        {showSubs && tech.subs?.length > 0 && (
                          <div className={`matrix-sub-area flex flex-col ${selectedTactic ? 'gap-2' : 'gap-1'}`}>
                            {tech.subs.map((sub, sidx) => (
                              <div
                                key={sub.sid}
                                onClick={e => { e.stopPropagation(); handleItemClick(tactic, tech, sub, e); }}
                                onMouseEnter={e => handleMouseEnter(e, sub.name, sub.sid)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                className={`matrix-sub-item ${selectedTactic ? 'text-[13px]' : 'text-[9px]'} truncate cursor-pointer`}
                                style={{ borderLeftColor: dm ? (MATRIX_TACTIC_COLORS[tactic.id]?.darkHex || '#475569') + '60' : (MATRIX_TACTIC_COLORS[tactic.id]?.hex || '#0d1b2a') + '30' }}
                              >
                                <span style={{ color: dm ? MATRIX_TACTIC_COLORS[tactic.id]?.darkHex : MATRIX_TACTIC_COLORS[tactic.id]?.hex, opacity: 0.7 }}>↳</span> {sub.name} <span className={`font-mono ${selectedTactic ? 'text-[10px]' : 'text-[7px]'} ${dm ? 'text-cyan-500/50' : 'text-cyan-700/40'}`}>{sub.sid}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* 교육 콘텐츠 프리뷰 (selectedTactic 확대 뷰에서만) */}
                        {selectedTactic && (() => {
                          const { desc } = getMitreInfo(tech.name, tech.tid);
                          const techEduUrl = TECHNIQUE_URLS[tech.tid] || null;
                          const subsWithEdu = tech.subs?.filter(s => s.sid in TECHNIQUE_URLS) || [];
                          const hasAnyEdu = techEduUrl || subsWithEdu.length > 0;
                          const goEdu = (url, e, subTid = null) => {
                            e.stopPropagation();
                            const targetTid = subTid || tech.tid;
                            if (!isLoggedIn) { navigate(`/login?redirect=${encodeURIComponent(`/edu/${targetTid}`)}`); return; }
                            navigate(`/edu/${targetTid}`);
                          };
                          const eduBtnCls = `inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all duration-200 ${dm ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 hover:bg-[#00ff41]/20 hover:shadow-[0_0_8px_rgba(0,255,65,0.3)]' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm'}`;
                          const pendingLabel = language === 'ko' ? '준비 중' : language === 'ja' ? '準備中' : language === 'zh' ? '准备中' : language === 'hi' ? 'तैयारी में' : language === 'vi' ? 'Sắp có' : language === 'ar' ? 'قريباً' : 'Coming Soon';
                          return (
                            <div
                              className={`edu-preview mt-3 pt-3 border-t ${dm ? 'border-slate-700' : 'border-slate-200'}`}
                              onClick={e => e.stopPropagation()}
                            >
                              <div className={`text-[11px] font-mono font-bold ${dm ? 'text-cyan-500/70' : 'text-cyan-700/60'}`}>
                                {tech.tid}
                              </div>
                              <div className={`text-[12px] mt-1 leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                                {desc}
                              </div>
                              <div className="mt-2 flex flex-col gap-1.5">
                                {/* 기법 레벨 교육 */}
                                {techEduUrl && (
                                  <button onClick={(e) => goEdu(techEduUrl, e)} className={eduBtnCls}>
                                    <ChevronRight size={12} /> <span className="font-mono text-[10px] opacity-70">{tech.tid}</span> {getTechName(tech.name)}
                                  </button>
                                )}
                                {/* 서브기법별 교육 (있는 것만 개별 표시) */}
                                {subsWithEdu.map(sub => (
                                  <button key={sub.sid} onClick={(e) => goEdu(TECHNIQUE_URLS[sub.sid], e, sub.sid)} className={eduBtnCls}>
                                    <ChevronRight size={12} /> <span className="font-mono text-[10px] opacity-70">{sub.sid}</span> {sub.name}
                                  </button>
                                ))}
                                {/* 교육 없으면 준비 중 */}
                                {!hasAnyEdu && (
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${dm ? 'bg-slate-700/50 text-slate-500 border border-slate-600' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                    ⏳ {pendingLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                        {/* 완료 뱃지 라벨 */}
                        {isCompleted && (
                          <span className="absolute bottom-2.5 left-3 text-[8px] font-black text-[#22c55e] tracking-wider uppercase opacity-80">{t.completed}</span>
                        )}
                        {/* 클릭 수 표시 */}
                        {count > 0 && (
                          <span className="click-count-badge">{count}↗</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
            {/* v0.7.3: 위젯 인트로 제거됨 — 과정 셀렉터 라우트(/edu/:techniqueId)로 대체 */}
          </div>{/* 줌인 가로 병렬 래퍼 닫기 */}
        </div>
        </div>{/* flex w-full 래퍼 닫기 */}
        </>
        ) : (
          <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 py-6 w-full">
            <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading…</div>}>
              <CommunitySection onShowMatrix={() => setViewMode('matrix')} language={language} />
            </Suspense>
          </div>
        )}
        {/* 사이트 푸터 */}
        <div className={`dm-footer w-full mt-6 px-0 py-5 border-t ${dm ? 'bg-[#0d1b2a] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-full mx-auto px-4 lg:px-6 2xl:px-8">
            <div className="text-center sm:text-left flex items-center gap-2">
              <img src={dm ? '/logo/root14-logo-white.svg' : '/logo/root14-logo.svg'} alt="ROOT14"
                style={{ height: 22, width: 'auto', objectFit: 'contain' }}
                draggable={false} />
              <div>
                <p className={`text-[10px] font-black tracking-[0.25em] ${dm ? 'text-[#00ff41]' : 'text-[#0d1b2a]'}`}>ROOT14</p>
                <p className={`text-[8px] mt-0.5 tracking-wide ${dm ? 'text-slate-500' : 'text-[#415a77]'}`}>
                  ROOT14 Academy · 사이버보안 · 모의해킹 · 디지털포렌식 · 교육</p>
              </div>
            </div>
            <div className={`text-center text-[9px] leading-relaxed ${dm ? 'text-slate-500' : 'text-[#415a77]/70'}`}>
              <p>© 2026 ROOT14 Academy — ALL RIGHTS RESERVED</p>
              <p>사업자등록번호 391-69-00617 | 대표 윤웅</p>
              <p>서울 구로구 디지털로33길 48, 대륭포스트타워 7차 305-P136호</p>
            </div>
            <div className={`text-center sm:text-right text-[9px] ${dm ? 'text-slate-500' : 'text-[#415a77]/70'}`}>
              <a href="https://root14.co.kr" target="_blank" rel="noopener noreferrer"
                className={`transition-colors block font-bold ${dm ? 'text-[#00ff41]/50 hover:text-[#00ff41]' : 'text-[#0d1b2a] hover:text-[#415a77]'}`}>
                root14.co.kr ↗</a>
              <p className="mt-1">ericyoon@root14.co.kr</p>
              <p>0507-1386-9106</p>
            </div>
          </div>
        </div>

        {/* ══ 모바일 하단 네비게이션 바 ══ */}
        <div className="mobile-bottom-nav">
          <button onClick={() => {
            if (selectedTactic) {
              setSelectedTactic(null); // 택틱 줌 → 매트릭스 전체
            } else if (viewMode === 'matrix') {
              setViewMode('dashboard'); // 매트릭스 → 대시보드
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setHeroPhase('entering'); // 대시보드 → 인트로 히어로
              localStorage.removeItem('gotroot_intro_seen');
              window.scrollTo({ top: 0 });
            }
          }}>
            <span className="nav-icon"><ArrowLeftIcon className="w-4 h-4" /></span>
            <span>{t.navBack}</span>
          </button>
          <button onClick={() => { setSelectedTactic(null); setViewMode('matrix'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span className="nav-icon">🏠</span>
            <span>{t.navHome}</span>
          </button>
          {selectedTactic && (
            <button onClick={() => { setSelectedTactic(null); }}>
              <span className="nav-icon">🔳</span>
              <span>{t.navAll}</span>
            </button>
          )}
          <button onClick={() => setViewMode(v => v === 'dashboard' ? 'matrix' : 'dashboard')}>
            <span className="nav-icon">💬</span>
            <span>{t.navChat}</span>
          </button>
          {isLoggedIn && (
            <button onClick={() => navigate('/mypage')}>
              <span className="nav-icon">👤</span>
              <span>{t.navMy}</span>
            </button>
          )}
        </div>
        {/* 모바일 하단 네비 높이 여백 */}
        <div className="dm-mobile-only-block" style={{ height: 60 }} />
      </div>

      {/* ── Tooltip ── */}
      {tooltip.show && (
        <div
          className="fixed z-[300] bg-black text-white p-3 rounded text-[10px] w-52 pointer-events-none shadow-2xl border border-white/20"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="font-bold border-b border-white/20 pb-1 mb-1 text-[#00ff41]">{tooltip.title}</div>
          <div className="text-slate-400 text-[9px] mb-1">{tooltip.id}</div>
          <div className="text-slate-500 text-[9px] leading-relaxed">{tooltip.desc}</div>
        </div>
      )}

      {/* ── 기법 클릭 Suck-In 오버레이 ── */}
      {animatingCard && (
        <div
          className="overlay-suck fixed inset-0 z-[400] flex items-center justify-center"
          style={{ '--ox': animOrigin.x, '--oy': animOrigin.y, background: '#030711' }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(rgba(244,208,111,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.07 }} />
          <div className="overlay-fade text-center relative z-10 px-8 max-w-xl w-full">
            <div className="text-[10px] tracking-[0.35em] mb-5 uppercase"
              style={{ color: animatingCard.isCritical ? '#f87171' : '#00ff41', animation: 'neonPulse 1s ease-in-out infinite' }}>
              {isLoggedIn ? t.loading : t.authRequired}
            </div>
            <h2 className="font-black text-white mb-1" style={{ fontSize: 'clamp(1.5rem,4vw,2.8rem)', lineHeight: 1.1 }}>
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
                  style={{ background: animatingCard.isCritical ? '#f87171' : '#00ff41', animation: `dotPing 1s ${delay}ms ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Avatar Room 모달 ── */}
      <AvatarRoom isOpen={showAvatarRoom} onClose={() => setShowAvatarRoom(false)} language={language} />
    </div>
  );
}

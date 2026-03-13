import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Time } from '@carbon/icons-react';
import WikiFloatingButton from './components/wiki/WikiFloatingButton';

// ── Route-level 코드 스플리팅 (lazy loading) ──
const IntroMatrix    = lazy(() => import('./pages/IntroMatrix'));
const Login          = lazy(() => import('./pages/Login'));
const Signup         = lazy(() => import('./pages/Signup'));
const LabT1078       = lazy(() => import('./pages/lab/LabT1078'));
const MyPage         = lazy(() => import('./pages/MyPage'));
const AdminPage      = lazy(() => import('./pages/admin/AdminPage'));
const Announcements  = lazy(() => import('./pages/Announcements'));
const CommunityPage  = lazy(() => import('./pages/CommunityPage'));
const CourseSelector          = lazy(() => import('./pages/CourseSelector'));
const GraphicExplanationPage  = lazy(() => import('./pages/GraphicExplanationPage'));
const ScenarioExplanationPage = lazy(() => import('./pages/ScenarioExplanationPage'));
const DesktopLab              = lazy(() => import('./pages/lab/DesktopLab'));
const LabCompletion           = lazy(() => import('./pages/lab/LabCompletionPage'));
const LevelTest               = lazy(() => import('./pages/LevelTest'));
const BasicsPage              = lazy(() => import('./pages/BasicsPage'));
const LearningPathChoice      = lazy(() => import('./pages/LearningPathChoice'));
const RecommendedCoursePage   = lazy(() => import('./pages/RecommendedCoursePage'));

// GA4 초기화 (앱 최초 로드 시 1회)
ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);

// SPA 라우팅 변경 시마다 Pageview 자동 전송
function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname });
  }, [location]);
  return null;
}

// ── 로딩 스피너 (Suspense fallback) ──
function RouteLoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0f172a',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(96,165,250,0.3)',
          borderTopColor: '#60a5fa', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
          LOADING...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}

// ── 세션 타임아웃 경고 토스트 (글로벌) ──
function SessionWarningToast() {
  const { sessionWarning } = useAuth();
  if (!sessionWarning) return null;
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 99999, background: '#fbbf24', color: '#78350f',
      padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)', whiteSpace: 'nowrap',
      animation: 'slideDown 0.3s ease-out',
    }}>
      <Time size={16} className="inline" /> {sessionWarning}
      <style>{`@keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageTracker />
        <SessionWarningToast />
        <WikiFloatingButton />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<IntroMatrix />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/level-test" element={<LevelTest />} />
            <Route path="/basics" element={<BasicsPage />} />
            <Route path="/learning-path" element={<LearningPathChoice />} />
            <Route path="/recommended/:techniqueId" element={<RecommendedCoursePage />} />
            <Route path="/lab/t1078" element={<LabT1078 />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/edu/:techniqueId" element={<CourseSelector />} />
            <Route path="/edu/graphic/:techniqueId/:level" element={<GraphicExplanationPage />} />
            <Route path="/edu/scenario/:techniqueId/:level" element={<ScenarioExplanationPage />} />
            <Route path="/lab/desktop/:techniqueId/:level" element={<DesktopLab />} />
            <Route path="/lab/complete/:techniqueId" element={<LabCompletion />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

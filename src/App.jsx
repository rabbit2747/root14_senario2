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
const GuidedLearning          = lazy(() => import('./pages/guided/GuidedLearning'));
const AptGalleryPage          = lazy(() => import('./pages/apt/AptGalleryPage'));
const AptDetailPage           = lazy(() => import('./pages/apt/AptDetailPage'));
const AptStudyPage            = lazy(() => import('./pages/apt/study/AptStudyPage'));
const DensityPreview          = lazy(() => import('./pages/apt/study/DensityPreview'));

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

// ── 로딩 스피너 (Suspense fallback) — 라이트 테마 기본 ──
function RouteLoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#F4F1EA',
      fontFamily: "'Paperlogy', 'Apple SD Gothic Neo', system-ui, sans-serif",
    }}>
      <div style={{
        width: '95%', maxWidth: 850, background: '#fff', borderRadius: 12,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1) inset',
        overflow: 'hidden',
      }}>
        {/* macOS 타이틀바 */}
        <div style={{
          height: 48, display: 'flex', alignItems: 'center', padding: '0 20px',
          position: 'relative', borderBottom: '1px solid #d1d1d1',
          background: 'linear-gradient(to bottom, #f6f6f6, #e0e0e0)',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }} />
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }} />
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }} />
          </div>
          <div style={{ position: 'absolute', width: '100%', textAlign: 'center', left: 0, fontSize: 14, fontWeight: 600, color: '#4d4d4d', pointerEvents: 'none' }}>
            Loading...
          </div>
        </div>
        {/* 로딩 콘텐츠 */}
        <div style={{ padding: '60px 40px', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <svg style={{ width: 48, height: 48 }} fill="none" stroke="#a1a1aa" strokeWidth="1.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#71717a', margin: 0 }}>
            Gotroot Security
          </p>
          <div style={{ width: 200 }}>
            <div style={{ height: 3, borderRadius: 9999, overflow: 'hidden', background: '#e4e4e7' }}>
              <div style={{
                height: '100%', borderRadius: 9999, width: '60%',
                background: 'linear-gradient(90deg, #a1a1aa 0%, #71717a 100%)',
                animation: 'loadbar 1.5s ease-in-out infinite alternate',
              }} />
            </div>
          </div>
          <style>{`
            @keyframes loadbar { 0% { width: 20%; } 100% { width: 80%; } }
          `}</style>
        </div>
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
            <Route path="/guided/:techniqueId" element={<GuidedLearning />} />
            <Route path="/apt" element={<AptGalleryPage />} />
            <Route path="/apt/:campaignId" element={<AptDetailPage />} />
            <Route path="/apt/:campaignId/study" element={<AptStudyPage />} />
            <Route path="/apt/preview-density" element={<DensityPreview />} />
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

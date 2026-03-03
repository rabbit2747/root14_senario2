import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStoredLang } from '../components/LangToggle';
import { Locked } from '@carbon/icons-react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CommunitySection = lazy(() => import('../components/community/CommunitySection'));

const UI = {
  ko: { title: '커뮤니티', sub: '공지사항과 피드백을 확인하세요', back: '매트릭스로 돌아가기' },
  en: { title: 'Community', sub: 'Check announcements and feedback', back: 'Back to Matrix' },
  ja: { title: 'コミュニティ', sub: 'お知らせとフィードバックを確認', back: 'マトリクスに戻る' },
  zh: { title: '社区', sub: '查看公告和反馈', back: '返回矩阵' },
  hi: { title: 'समुदाय', sub: 'घोषणाएं और फीडबैक देखें', back: 'मैट्रिक्स पर वापस जाएं' },
};

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const lang = getStoredLang() || 'ko';
  const t = UI[lang] || UI.ko;

  return (
    <div className="min-h-screen bg-[#e0e1dd]">
      {/* 헤더 */}
      <div className="w-full h-14 flex items-center justify-between px-4 border-b shadow-sm bg-white border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 no-underline" title="홈으로">
            <img
              src="/logo/logo-white.png"
              alt="GR"
              style={{ width: 38, height: 38, objectFit: 'contain', filter: 'brightness(0)' }}
              draggable={false}
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span className="text-[11px] font-black tracking-[0.25em] text-[#0d1b2a]">GOTROOT</span>
              <span className="text-[6px] tracking-[0.15em] uppercase text-slate-400">Community</span>
            </span>
          </a>
          <span
            onClick={() => navigate('/')}
            className="px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap cursor-pointer select-none border-slate-300 text-slate-500 bg-slate-50/50 hover:text-slate-700 hover:border-slate-400 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-3 h-3" /> {t.back}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span
              onClick={() => navigate('/admin')}
              className="px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap cursor-pointer select-none border-red-200 text-red-500 bg-red-50/50 hover:text-red-700 hover:border-red-400 transition-colors"
            >
              <Locked size={12} className="inline" /> ADMIN
            </span>
          )}
          {isLoggedIn ? (
            <>
              <span className="text-[10px] border px-2 py-1 rounded whitespace-nowrap hidden sm:inline text-emerald-600 border-emerald-200">
                ● {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-[10px] border px-2 py-1 rounded hover:border-red-400 hover:text-red-400 transition-colors whitespace-nowrap text-slate-400 border-slate-200"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-[10px] font-bold border px-3 py-1 rounded text-blue-500 border-blue-200 hover:bg-blue-50 transition-colors"
            >
              LOGIN
            </button>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 py-6">
        <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading…</div>}>
          <CommunitySection onShowMatrix={() => navigate('/')} language={lang} />
        </Suspense>
      </div>
    </div>
  );
}

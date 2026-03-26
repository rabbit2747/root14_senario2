import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CATEGORIES, CATEGORY_DATA, CATEGORY_NAV, TACTIC_COLORS,
} from '../data/basics-categories';
import './BasicsPage.css';

// ── 헬퍼 ──
function Stars({ difficulty }) {
  return (
    <span className="text-[10px]">
      <span className="basics-star-filled">{'★'.repeat(difficulty)}</span>
      <span className="basics-star-empty">{'★'.repeat(5 - difficulty)}</span>
    </span>
  );
}

function TacticTags({ tactics }) {
  return tactics.map((t, i) => (
    <span
      key={i}
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-sm"
      style={{ backgroundColor: TACTIC_COLORS[t] || '#3b82f6' }}
    >
      {t}
    </span>
  ));
}

function getUserRank(percent) {
  if (percent >= 100) return '마스터 (Master)';
  if (percent >= 75) return '엑스퍼트 (Expert)';
  if (percent >= 50) return '고급 (Advanced)';
  if (percent >= 25) return '중급 (Intermediate)';
  return '비기너 (Beginner)';
}

// ── 메인 컴포넌트 ──
export default function BasicsPage() {
  const { isLoggedIn, loading: authLoading, user, userLevel } = useAuth();
  const navigate = useNavigate();

  // Auth Gate
  useEffect(() => {
    if (authLoading) return; // 세션 로딩 완료 대기
    if (!isLoggedIn) navigate('/login?redirect=/basics', { replace: true });
  }, [authLoading, isLoggedIn, navigate]);

  // UI State
  const [currentCategory, setCurrentCategory] = useState('network_web');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // none | desc | asc
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalCard, setModalCard] = useState(null); // { categoryId, cardIndex, card }
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // ── 다크모드 토글 ──
  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle('dark');
    setIsDark(prev => !prev);
  }, []);

  // ── 사이드바 클릭 ──
  const handleNavClick = useCallback((catId) => {
    setCurrentCategory(catId);
    setSearchQuery('');
    setSortOrder('none');
    setSidebarOpen(false);
  }, []);

  // ── 뷰 모드 ──
  const handleViewMode = useCallback((mode) => {
    setViewMode(mode);
    setSortOrder('none');
  }, []);

  // ── 난이도 정렬 토글 ──
  const toggleSort = useCallback(() => {
    setSortOrder(prev => prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none');
  }, []);

  // ── 검색 결과 ──
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results = [];
    CATEGORIES.forEach(catId => {
      CATEGORY_DATA[catId].cards.forEach((card, idx) => {
        if (card.title.toLowerCase().includes(q) || card.desc.toLowerCase().includes(q)) {
          results.push({ categoryId: catId, cardIndex: idx, card });
        }
      });
    });
    return results;
  }, [searchQuery]);

  // ── 표시할 카드 목록 ──
  const displayCards = useMemo(() => {
    let items;
    if (searchResults) {
      items = searchResults;
    } else {
      items = CATEGORY_DATA[currentCategory].cards.map((card, idx) => ({
        categoryId: currentCategory, cardIndex: idx, card,
      }));
    }
    // 정렬
    if (sortOrder !== 'none') {
      items = [...items].sort((a, b) =>
        sortOrder === 'desc'
          ? b.card.difficulty - a.card.difficulty
          : a.card.difficulty - b.card.difficulty
      );
    }
    return items;
  }, [searchResults, currentCategory, sortOrder]);

  // ── 진행률 (현재 0% — 콘텐츠 준비중) ──
  const progress = 0;

  // ── 모달 ──
  const openModal = useCallback((categoryId, cardIndex) => {
    const card = CATEGORY_DATA[categoryId].cards[cardIndex];
    setModalCard({ categoryId, cardIndex, card });
  }, []);

  const closeModal = useCallback(() => setModalCard(null), []);

  // ESC 닫기
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && modalCard) closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modalCard, closeModal]);

  if (!isLoggedIn) return null;

  const catData = CATEGORY_DATA[currentCategory];
  const sortIcon = sortOrder === 'desc' ? '▼' : sortOrder === 'asc' ? '▲' : '↕';

  return (
    <div className="flex h-screen w-full text-gray-900 dark:text-gray-100 transition-colors duration-200 basics-scrollbar">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════ Left Sidebar ══════════ */}
      <aside
        className={`fixed md:relative w-[250px] bg-white dark:bg-[#1a1b23] text-gray-600 dark:text-gray-400 flex flex-col h-full shrink-0 z-40 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo — ROOT14 */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-800/60 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 w-full group">
            <img
              src="/logo/root14-logo.svg"
              alt="ROOT14"
              className="w-8 h-8 object-contain"
              draggable={false}
            />
            <div className="flex flex-col leading-none">
              <span className="text-[12px] font-black tracking-[0.2em] text-gray-800 dark:text-gray-100 group-hover:text-[#7c3aed] dark:group-hover:text-white transition-colors">ROOT14</span>
              <span className="text-[8px] tracking-[0.1em] uppercase text-gray-400 dark:text-gray-500">IT Basics Course</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 basics-scrollbar">
          <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
            Curriculum
          </div>
          {CATEGORY_NAV.map(nav => (
            <button
              key={nav.id}
              onClick={() => handleNavClick(nav.id)}
              className={`basics-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group text-left ${
                currentCategory === nav.id && !searchQuery
                  ? 'active bg-[#f3f0ff] dark:bg-[#2d2e3d] text-[#7c3aed] dark:text-[#8b5cf6] font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-[#2a2b36] hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <span className="w-5 h-5 opacity-80 group-hover:opacity-100 flex justify-center text-lg">{nav.emoji}</span>
              <span>{nav.label}</span>
            </button>
          ))}
        </nav>

        {/* User Bottom — 실제 로그인 유저 정보 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                {user?.email ? user.email.split('@')[0] : 'Guest'}
              </span>
              <span className="text-[11px] font-semibold text-[#7c3aed] dark:text-[#8b5cf6]">
                {userLevel ? (userLevel.charAt(0).toUpperCase() + userLevel.slice(1)) : getUserRank(progress)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════ Main Content ══════════ */}
      <main className="flex-1 flex flex-col min-w-0 relative transition-colors duration-200">
        {/* Top Header */}
        <header className="h-16 bg-white/90 dark:bg-[#1a1b23]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
          {/* Left */}
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              title="MITRE ATT&CK Matrix"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">Matrix</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 w-auto shrink-0">
              <span>Curriculum</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {searchQuery ? `검색 결과: "${searchQuery}"` : catData.title}
              </span>
            </div>

            {/* Search */}
            <div className="max-w-md w-full relative ml-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-[#0f1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] sm:text-sm shadow-sm"
                placeholder="검색어 (예: 랜섬웨어, DDoS, 디스크와이프)..."
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-1 ml-2 border border-gray-200 dark:border-gray-700 shrink-0">
              <button
                onClick={() => handleViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-[#2d2e3d] shadow-sm text-[#7c3aed] dark:text-[#8b5cf6]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                title="그리드 보기"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => handleViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-[#2d2e3d] shadow-sm text-[#7c3aed] dark:text-[#8b5cf6]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                title="리스트 보기"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-[#8b5cf6] h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-bold text-[#7c3aed] dark:text-[#8b5cf6] w-8">{progress}%</span>
            </div>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 hidden md:block" />
            <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                {isDark
                  ? <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  : <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                }
              </svg>
            </button>
          </div>
        </header>

        {/* ══════════ Content Area ══════════ */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 basics-bg-dotted bg-gray-50 dark:bg-[#0f1117] basics-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* Category Header */}
            {!searchResults && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/60 dark:bg-[#1a1b23]/60 p-6 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-sm basics-fade-in">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{catData.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">{catData.subtitle}</p>
                </div>
              </div>
            )}

            {/* Search Header */}
            {searchResults && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Results</h1>
                <p className="text-sm text-gray-500 mt-1">{searchResults.length} modules found</p>
              </div>
            )}

            {/* No results */}
            {searchResults && searchResults.length === 0 && (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-[#1a1b23]/50 rounded-2xl">
                <svg className="w-12 h-12 mb-4 opacity-50 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                일치하는 키워드가 없습니다.
              </div>
            )}

            {/* List Header (list mode only) */}
            {viewMode === 'list' && displayCards.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 px-4 py-3 mb-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-[#1a1b23]/70 backdrop-blur-sm rounded-lg shadow-sm">
                <div className="w-12 text-center shrink-0">분류</div>
                <div className="flex-1">레슨 / 지식 제목</div>
                <div className="w-64 text-right shrink-0">획득 택틱 (Tactic)</div>
                <button
                  onClick={toggleSort}
                  className="w-24 text-right shrink-0 cursor-pointer hover:text-[#8b5cf6] transition-colors flex items-center justify-end gap-1 select-none group"
                >
                  난이도
                  <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded group-hover:bg-purple-100 dark:group-hover:bg-purple-900 group-hover:text-[#7c3aed] dark:group-hover:text-[#8b5cf6] transition-colors">
                    {sortIcon}
                  </span>
                </button>
              </div>
            )}

            {/* ── Cards Grid / List ── */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12'
              : 'flex flex-col gap-2 pb-12'
            }>
              {displayCards.map((item, i) => {
                const c = item.card;
                const origCards = CATEGORY_DATA[item.categoryId].cards;
                const origLessonNum = origCards.findIndex(card => card.id === c.id) + 1;
                const catInfo = searchResults
                  ? <span className="text-[11px] text-gray-500">{CATEGORY_DATA[item.categoryId].title}</span>
                  : <span className="text-[10px] font-semibold text-[#8b5cf6] tracking-wider">LESSON {origLessonNum}</span>;

                if (viewMode === 'grid') {
                  return (
                    <div
                      key={c.id}
                      className="basics-card rounded-xl p-5 cursor-pointer relative group flex flex-col h-full basics-fade-in border border-gray-200 dark:border-gray-800 min-h-[300px]"
                      onClick={() => openModal(item.categoryId, origLessonNum - 1)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        {catInfo}
                        <div className="flex flex-col items-end gap-1 text-right">
                          <Stars difficulty={c.difficulty} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <TacticTags tactics={c.tactics} />
                      </div>
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform origin-left">{c.emoji}</div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-2">{c.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">{c.desc}</p>
                    </div>
                  );
                }

                // List mode
                return (
                  <div
                    key={c.id}
                    className="basics-card rounded-xl p-4 cursor-pointer relative group flex flex-row items-center gap-4 basics-fade-in border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#1a1b23]/95 hover:bg-gray-50 dark:hover:bg-[#2a2b36] transition-colors"
                    onClick={() => openModal(item.categoryId, origLessonNum - 1)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100/50 dark:bg-[#0f1117]/50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform border border-gray-100 dark:border-gray-800">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{c.title}</h3>
                        {catInfo}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.desc}</p>
                    </div>
                    <div className="hidden md:flex flex-wrap gap-1 w-64 shrink-0 justify-end">
                      <TacticTags tactics={c.tactics} />
                    </div>
                    <div className="hidden sm:block text-[10px] shrink-0 w-24 text-right pr-2">
                      <Stars difficulty={c.difficulty} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ══════════ Modal ══════════ */}
      <div className={`basics-modal-overlay ${modalCard ? 'active' : ''}`} onClick={closeModal}>
        {modalCard && (
          <div
            className="basics-modal-content bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start p-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl border border-purple-100 dark:border-purple-800">
                  {modalCard.card.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 tracking-wider">LESSON {modalCard.cardIndex + 1}</span>
                    <Stars difficulty={modalCard.card.difficulty} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{modalCard.card.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <TacticTags tactics={modalCard.card.tactics} />
                  </div>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body — 준비중 */}
            <div className="p-6 overflow-y-auto basics-scrollbar bg-gray-50/50 dark:bg-[#0f1117]/50 flex-grow">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-6">🔧</div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">콘텐츠 준비 중</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                  이 레슨의 상세 학습 자료와 퀴즈가 준비 중입니다.<br />
                  곧 업데이트될 예정이니 조금만 기다려주세요!
                </p>
                <div className="mt-6 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    📚 키워드: {modalCard.card.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1a1b23] rounded-b-xl shrink-0">
              <button onClick={closeModal} className="px-5 py-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-sm font-semibold transition-colors">
                닫기
              </button>
              {/* 다음 레슨 버튼 */}
              {(() => {
                const catCards = CATEGORY_DATA[modalCard.categoryId].cards;
                const nextIdx = modalCard.cardIndex + 1;
                if (nextIdx < catCards.length) {
                  return (
                    <button
                      onClick={() => openModal(modalCard.categoryId, nextIdx)}
                      className="px-6 py-2 bg-[#7c3aed] hover:bg-[#8b5cf6] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      다음 레슨으로
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  );
                }
                const nextCatIdx = CATEGORIES.indexOf(modalCard.categoryId) + 1;
                if (nextCatIdx < CATEGORIES.length) {
                  return (
                    <button
                      onClick={() => {
                        const nextCatId = CATEGORIES[nextCatIdx];
                        setCurrentCategory(nextCatId);
                        setSearchQuery('');
                        openModal(nextCatId, 0);
                      }}
                      className="px-6 py-2 bg-[#7c3aed] hover:bg-[#8b5cf6] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      다음 챕터로
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

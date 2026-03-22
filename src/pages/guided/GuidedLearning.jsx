import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { upsertGuidedProgress, getGuidedProgress } from '../../api/edu';
import PageWrapper, { useDarkMode } from './components/PageWrapper';
import ChapterNav from './components/ChapterNav';
import ChapterRenderer from './components/ChapterRenderer';

// 챕터 데이터 동적 로더 (서브테크닉별)
const CHAPTER_LOADERS = {
  'T1566.001': () => import('../../data/guided-chapters/T1566.001'),
};

const STORAGE_KEY = 'gotroot_guided_progress';

function loadProgress(techniqueId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const all = JSON.parse(raw);
    return new Set(all[techniqueId] || []);
  } catch { return new Set(); }
}

function saveProgress(techniqueId, completed) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[techniqueId] = [...completed];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

/** Supabase에서 유도 학습 진행률 로드 → localStorage 병합 */
async function loadServerProgress(userId, techniqueId) {
  try {
    const { data, error } = await getGuidedProgress(userId, techniqueId);
    if (error || !data) return new Set();
    // chapter_id = 'guided_ch{N}' → N 추출
    return new Set(data.map(row => {
      const match = row.chapter_id.match(/^guided_ch(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    }).filter(Boolean));
  } catch { return new Set(); }
}

export default function GuidedLearning() {
  const { techniqueId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, userName: profileName, loading: authLoading } = useAuth();
  const isDark = useDarkMode();

  const [chapterMeta, setChapterMeta] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [completedChapters, setCompletedChapters] = useState(() => loadProgress(techniqueId));
  const [navOpen, setNavOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Auth Gate
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate(`/login?redirect=/guided/${techniqueId}`, { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate, techniqueId]);

  // 서버 진행률 로드 (로그인 시 localStorage와 병합)
  useEffect(() => {
    if (!user?.id) return;
    loadServerProgress(user.id, techniqueId).then(serverSet => {
      if (serverSet.size === 0) return;
      setCompletedChapters(prev => {
        const merged = new Set([...prev, ...serverSet]);
        saveProgress(techniqueId, merged); // localStorage에도 동기화
        return merged;
      });
    });
  }, [user?.id, techniqueId]);

  // 챕터 데이터 로드
  useEffect(() => {
    const loader = CHAPTER_LOADERS[techniqueId];
    if (!loader) {
      setLoadError(true);
      return;
    }
    loader().then(mod => {
      setChapterMeta(mod.CHAPTER_META);
      setChapters(mod.CHAPTERS);
    }).catch(() => setLoadError(true));
  }, [techniqueId]);

  // 챕터 완료 처리 (localStorage + Supabase 이중 저장)
  const markComplete = useCallback((chapterId) => {
    setCompletedChapters(prev => {
      const next = new Set(prev);
      next.add(chapterId);
      saveProgress(techniqueId, next);
      return next;
    });
    // 서버 저장 (fire-and-forget)
    if (user?.id) {
      upsertGuidedProgress(user.id, techniqueId, chapterId).catch(() => { /* 실패 시 localStorage 폴백으로 충분 */ });
    }
  }, [techniqueId, user?.id]);

  // 다음 챕터 이동
  const goNext = useCallback(() => {
    if (currentChapter < chapters.length) {
      setCurrentChapter(prev => prev + 1);
      setNavOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentChapter, chapters.length]);

  // 챕터9 분기 선택
  const handleChoiceSelect = useCallback((choiceId) => {
    if (choiceId === 'continue') {
      setCurrentChapter(10);
    }
    // 'stop' → 아무것도 안함 (현재 페이지 유지)
  }, []);

  const currentChapterData = useMemo(() => chapters.find(c => c.id === currentChapter), [chapters, currentChapter]);

  // 로딩 중
  if (authLoading || (!loadError && chapters.length === 0)) {
    return (
      <PageWrapper title="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm">챕터 데이터를 불러오는 중...</div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // 에러
  if (loadError) {
    return (
      <PageWrapper title="Error">
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            콘텐츠가 준비되지 않았습니다
          </h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {techniqueId}에 대한 유도 학습 콘텐츠가 아직 없습니다.
          </p>
          <button
            onClick={() => navigate(-1)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
          >
            ← 돌아가기
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={chapterMeta?.title ? `${techniqueId} — ${chapterMeta.title}` : 'Guided_Learning.app'} maxWidth="1200px">
      <div className="flex h-[calc(95dvh-48px)]">
        {/* 사이드 네비게이션 */}
        <ChapterNav
          chapters={chapters}
          currentChapter={currentChapter}
          completedChapters={completedChapters}
          onSelect={(id) => { setCurrentChapter(id); setNavOpen(false); }}
          isDark={isDark}
          isOpen={navOpen}
          onToggle={() => setNavOpen(o => !o)}
        />

        {/* 챕터 본문 */}
        <ChapterRenderer
          key={currentChapter}
          chapter={currentChapterData}
          onComplete={() => markComplete(currentChapter)}
          onNext={goNext}
          onChoiceSelect={handleChoiceSelect}
          isDark={isDark}
          techniqueId={techniqueId}
          userName={profileName || user?.user_metadata?.name || user?.email?.split('@')[0] || '훈련생'}
          chapterMeta={chapterMeta}
          totalChapters={chapters.length}
        />
      </div>
    </PageWrapper>
  );
}

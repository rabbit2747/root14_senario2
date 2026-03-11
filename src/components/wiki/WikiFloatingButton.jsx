import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WikiModal from './WikiModal';

// 경로에서 techniqueId 추출
// /edu/T1587.001, /edu/graphic/T1587.001/beginner, /lab/desktop/T1587.001/beginner
function extractTechniqueId(pathname) {
  const patterns = [
    /^\/edu\/graphic\/([^/]+)/,
    /^\/edu\/scenario\/([^/]+)/,
    /^\/lab\/desktop\/([^/]+)/,
    /^\/lab\/complete\/([^/]+)/,
    /^\/edu\/([^/]+)/,
  ];
  for (const re of patterns) {
    const m = pathname.match(re);
    if (m) return m[1];
  }
  return null;
}

/**
 * 갓루트 위키 플로팅 버튼 (SPA 전용)
 * BrowserRouter 내부, Routes 밖에서 렌더링됨
 */
export default function WikiFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // 모바일 감지 — 하단 네비(IntroMatrix)와 겹침 방지
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const techniqueId = extractTechniqueId(location.pathname);

  // 관리자 페이지에서는 숨김
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="갓루트 위키 열기"
        style={{
          position: 'fixed',
          bottom: isMobile ? '4.5rem' : '1.5rem',  // 모바일: 하단 네비(~56px) 위로 이동
          right: '1.5rem',
          zIndex: 8000,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
          border: '2px solid rgba(96,165,250,0.4)',
          boxShadow: '0 4px 20px rgba(29,78,216,0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          color: 'white',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(29,78,216,0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,78,216,0.5)';
        }}
      >
        📖
      </button>

      <WikiModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        techniqueId={techniqueId}
      />
    </>
  );
}

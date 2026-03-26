// ── ContentProtection: 교육 콘텐츠 복사 방지 + 유저 워터마크 ──
// 래핑만 하면 되는 공통 컴포넌트
// - 우클릭/텍스트 선택/복사/드래그 차단
// - 유저 이메일 반투명 워터마크 (유출 추적용)
// - 개발자도구 콘솔 경고
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ContentProtection({ children, className = '' }) {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const email = user?.email || '';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prevent = (e) => e.preventDefault();
    const blockKeys = (e) => {
      // Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };

    el.addEventListener('contextmenu', prevent);
    el.addEventListener('copy', prevent);
    el.addEventListener('cut', prevent);
    el.addEventListener('dragstart', prevent);
    document.addEventListener('keydown', blockKeys);

    return () => {
      el.removeEventListener('contextmenu', prevent);
      el.removeEventListener('copy', prevent);
      el.removeEventListener('cut', prevent);
      el.removeEventListener('dragstart', prevent);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  // 콘솔 경고 (1회)
  useEffect(() => {
    console.log(
      '%c⚠️ WARNING: 이 콘텐츠는 저작권으로 보호됩니다. 무단 복제 시 법적 책임이 있습니다.',
      'color: red; font-size: 18px; font-weight: bold;'
    );
    console.log(
      '%c모든 접근은 서버에 기록됩니다. (Audit Log)',
      'color: orange; font-size: 14px;'
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
    >
      {children}

      {/* ── 워터마크 오버레이 ── */}
      {email && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            overflow: 'hidden',
            // 대각선 반복 패턴
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 180px,
              rgba(128,128,128,0.015) 180px,
              rgba(128,128,128,0.015) 181px
            )`,
          }}
        >
          {/* 워터마크 텍스트 타일 */}
          <div style={{
            position: 'absolute',
            inset: '-50%',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            gap: '80px 60px',
            transform: 'rotate(-30deg)',
            transformOrigin: 'center center',
          }}>
            {Array.from({ length: 60 }, (_, i) => (
              <span
                key={i}
                style={{
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: 'rgba(128, 128, 128, 0.07)',
                  whiteSpace: 'nowrap',
                  letterSpacing: '2px',
                }}
              >
                {email}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

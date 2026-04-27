/**
 * StartGate — 디오라마 진입 게이트 (오토플레이 정책 대응)
 * 시네마틱 톤. 큰 타이틀 → 부제 → 미세 깜빡이는 PRESS PLAY 버튼
 */
import { useEffect, useState } from 'react';

export default function StartGate({ scenario, onStart }) {
  const [exiting, setExiting] = useState(false);

  // 키보드 단축키: Space / Enter
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleStart = () => {
    setExiting(true);
    setTimeout(() => onStart(), 700);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e2e8f0',
      cursor: 'pointer',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.7s ease-out',
      zIndex: 100,
      fontFamily: '-apple-system,sans-serif',
    }}
    onClick={handleStart}
    >
      <style>{`
        @keyframes gateFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gateBlink {
          0%, 100% { opacity: 0.5 }
          50% { opacity: 1 }
        }
        @keyframes gateGrain {
          0% { transform: translate(0,0) }
          25% { transform: translate(-1%,1%) }
          50% { transform: translate(1%,-1%) }
          75% { transform: translate(-1%,-1%) }
          100% { transform: translate(0,0) }
        }
      `}</style>

      {/* 필름 그레인 */}
      <div style={{
        position: 'absolute', inset: '-2%',
        background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' /><feColorMatrix values=\'0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.15 0\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")',
        opacity: 0.08,
        pointerEvents: 'none',
        animation: 'gateGrain 0.5s steps(4) infinite',
      }}/>

      {/* 위 라벨 */}
      <div style={{
        fontSize: 11,
        letterSpacing: 6,
        color: '#64748b',
        fontFamily: 'monospace',
        marginBottom: 24,
        animation: 'gateFadeIn 0.8s ease-out 0.1s both',
      }}>
        APT DIORAMA · CASE FILE
      </div>

      {/* 케이스 ID */}
      <div style={{
        fontSize: 13,
        letterSpacing: 4,
        color: '#fbbf24',
        fontFamily: 'monospace',
        fontWeight: 700,
        marginBottom: 8,
        animation: 'gateFadeIn 0.8s ease-out 0.3s both',
      }}>
        ▎ {scenario.id.toUpperCase()}
      </div>

      {/* 메인 타이틀 */}
      <div style={{
        fontSize: 'clamp(28px, 5vw, 56px)',
        fontWeight: 200,
        letterSpacing: -1,
        color: '#fefefe',
        textAlign: 'center',
        maxWidth: '90%',
        lineHeight: 1.15,
        marginBottom: 12,
        animation: 'gateFadeIn 1.2s ease-out 0.5s both',
      }}>
        {scenario.title}
      </div>

      {/* 부제 */}
      <div style={{
        fontSize: 'clamp(13px, 1.5vw, 16px)',
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: 600,
        lineHeight: 1.6,
        marginBottom: 56,
        animation: 'gateFadeIn 1.2s ease-out 0.8s both',
      }}>
        {scenario.subtitle}
      </div>

      {/* 메타 정보 */}
      <div style={{
        display: 'flex',
        gap: 24,
        marginBottom: 56,
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#475569',
        letterSpacing: 2,
        animation: 'gateFadeIn 1.2s ease-out 1.0s both',
      }}>
        <div><span style={{color:'#64748b'}}>RUNTIME</span> {scenario.duration}s</div>
        <div><span style={{color:'#64748b'}}>CHOICES</span> {Object.keys(scenario.choices || {}).length}</div>
        <div><span style={{color:'#64748b'}}>RATED</span> APT</div>
      </div>

      {/* 시작 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); handleStart(); }}
        style={{
          background: 'transparent',
          border: '1px solid #475569',
          color: '#fefefe',
          padding: '14px 36px',
          fontSize: 13,
          letterSpacing: 6,
          fontFamily: 'monospace',
          fontWeight: 600,
          cursor: 'pointer',
          animation: 'gateFadeIn 1.2s ease-out 1.2s both, gateBlink 2s ease-in-out 2s infinite',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#fbbf24';
          e.currentTarget.style.color = '#fbbf24';
          e.currentTarget.style.background = 'rgba(251,191,36,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#475569';
          e.currentTarget.style.color = '#fefefe';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        ▶  PRESS PLAY
      </button>

      <div style={{
        marginTop: 16,
        fontSize: 10,
        color: '#334155',
        letterSpacing: 2,
        fontFamily: 'monospace',
        animation: 'gateFadeIn 1.2s ease-out 1.4s both',
      }}>
        SPACE · ENTER · CLICK
      </div>
    </div>
  );
}

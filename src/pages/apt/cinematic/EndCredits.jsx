/**
 * EndCredits — 영화 크레딧 톤 종료 화면 (단계 페이드)
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EndCredits({ scenario, ending, chosenPath, onRestart }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 1800),
      setTimeout(() => setStage(3), 3000),
      setTimeout(() => setStage(4), 4200),
      setTimeout(() => setStage(5), 5400),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const tone = ending?.tone || 'cold-blue';
  const toneBg = {
    'cold-blue':  'radial-gradient(ellipse at center, rgba(8,47,73,0.85) 0%, rgba(0,0,0,0.98) 100%)',
    'red-alert':  'radial-gradient(ellipse at center, rgba(69,10,10,0.85) 0%, rgba(0,0,0,0.98) 100%)',
    'monochrome': 'radial-gradient(ellipse at center, rgba(23,23,23,0.85) 0%, rgba(0,0,0,0.98) 100%)',
  }[tone];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: toneBg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#e2e8f0', padding: 40, textAlign: 'center',
      zIndex: 50, fontFamily: '-apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes credFade { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {stage >= 1 && (
        <div style={{ animation: 'credFade 0.8s ease-out' }}>
          <div style={{ fontSize: 10, color: '#fbbf24', letterSpacing: 6, fontFamily: 'monospace', marginBottom: 14 }}>
            ▎ CASE CLOSED
          </div>
          <div style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 200, marginBottom: 6, letterSpacing: -0.5 }}>
            {scenario.title}
          </div>
          {ending?.title && (
            <div style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: '#94a3b8', fontStyle: 'italic', marginBottom: 28 }}>
              &ldquo;{ending.title}&rdquo;
            </div>
          )}
          {ending?.summary && (
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 32, maxWidth: 480 }}>
              {ending.summary}
            </div>
          )}
        </div>
      )}

      {stage >= 2 && chosenPath?.length > 0 && (
        <div style={{ animation: 'credFade 0.8s ease-out', marginBottom: 28, maxWidth: 600 }}>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: 3, marginBottom: 10, fontFamily: 'monospace' }}>
            YOUR PATH
          </div>
          {chosenPath.map((p, i) => (
            <div key={i} style={{
              display: 'inline-block',
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(100,116,139,0.3)',
              padding: '8px 14px',
              borderRadius: 4,
              margin: 4,
              fontSize: 12,
            }}>
              <span style={{ color: '#fbbf24', fontFamily: 'monospace', marginRight: 10, fontWeight: 700 }}>{p.tag}</span>
              <span style={{ color: '#cbd5e1' }}>{p.label}</span>
            </div>
          ))}
        </div>
      )}

      {stage >= 3 && scenario.credits?.tactics && (
        <div style={{ animation: 'credFade 0.8s ease-out', marginBottom: 28, maxWidth: 720 }}>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: 3, marginBottom: 12, fontFamily: 'monospace' }}>
            ATT&CK TACTICS COVERED
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {scenario.credits.tactics.map((t) => (
              <span key={t} style={{
                fontSize: 11, fontFamily: 'monospace', letterSpacing: 1,
                color: '#94a3b8',
                border: '1px dashed rgba(148,163,184,0.3)',
                padding: '4px 10px',
              }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {stage >= 4 && scenario.credits?.next && (
        <div style={{
          animation: 'credFade 0.8s ease-out',
          padding: 20,
          background: 'rgba(30,41,59,0.4)',
          backdropFilter: 'blur(8px)',
          border: '1px dashed rgba(251,191,36,0.3)',
          borderRadius: 6,
          maxWidth: 560,
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: 3, marginBottom: 8, fontFamily: 'monospace' }}>
            ▶ NEXT EPISODE
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1', letterSpacing: 0.5 }}>
            {scenario.credits.next.title}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, fontStyle: 'italic' }}>
            {scenario.credits.next.hint}
          </div>
        </div>
      )}

      {stage >= 5 && (
        <div style={{ display: 'flex', gap: 12, animation: 'credFade 0.8s ease-out' }}>
          <button onClick={onRestart} style={btn({ background: '#fbbf24', color: '#000', fontWeight: 800 })}>
            ↻ 다시 보기
          </button>
          <button
            onClick={() => navigate(scenario.exitRoute || '/apt/scenarios')}
            style={btn({ background: 'transparent', color: '#cbd5e1', border: '1px solid #475569' })}
          >
            {scenario.exitLabel || '시나리오 허브'}
          </button>
        </div>
      )}
    </div>
  );
}

function btn(extra = {}) {
  return {
    padding: '12px 28px',
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 2,
    fontFamily: 'monospace',
    ...extra,
  };
}

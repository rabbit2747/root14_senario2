/**
 * ChoiceOverlay — 시네마틱 분기 결정 UI
 * 화면 상단 페이드 + 중앙 선택지 카드
 */
export default function ChoiceOverlay({ choice, onSelect }) {
  if (!choice) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>

      <div style={{
        maxWidth: 720,
        width: '90%',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#fbbf24',
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 8,
          fontFamily: 'monospace',
        }}>
          ▎ DECISION POINT
        </div>
        <div style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#fefefe',
          lineHeight: 1.4,
          marginBottom: 6,
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
        }}>
          {choice.prompt}
        </div>
        {choice.context && (
          <div style={{
            fontSize: 11,
            color: '#94a3b8',
            marginBottom: 24,
            fontFamily: 'monospace',
          }}>
            {choice.context}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {choice.options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt)}
              style={{
                background: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
                border: '1px solid #475569',
                color: '#e2e8f0',
                padding: '14px 18px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.2s',
                animation: `slideUp 0.5s ease-out ${0.2 + i * 0.1}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#fbbf24';
                e.currentTarget.style.background = 'linear-gradient(180deg, rgba(67,20,7,0.95) 0%, rgba(30,41,59,0.95) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#475569';
                e.currentTarget.style.background = 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)';
              }}
            >
              <span style={{
                background: '#fbbf24',
                color: '#451a03',
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 3,
              }}>
                {opt.tag}
              </span>
              <span style={{ flex: 1 }}>{opt.label}</span>
              <span style={{ color: '#94a3b8' }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

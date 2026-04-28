/**
 * SubtitleOverlay — 1인칭 자막 페이드인
 */
export default function SubtitleOverlay({ text, idKey }) {
  if (!text) return null;
  return (
    <div
      key={idKey}
      style={{
        position: 'absolute',
        bottom: '13vh',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '70%',
        textAlign: 'center',
        color: '#fefefe',
        fontSize: 'clamp(14px, 1.7vw, 20px)',
        fontWeight: 300,
        lineHeight: 1.55,
        letterSpacing: 0.3,
        textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 0 32px rgba(0,0,0,0.7)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'subFade 0.7s ease-out',
        whiteSpace: 'pre-line',
        fontFamily: '-apple-system, sans-serif',
      }}
    >
      <style>{`
        @keyframes subFade {
          from { opacity: 0; transform: translate(-50%, 8px) }
          to { opacity: 1; transform: translate(-50%, 0) }
        }
      `}</style>
      {text}
    </div>
  );
}

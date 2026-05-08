/**
 * Root14ScenarioChoice — Scenario Library 진입 직전 placeholder
 *
 * VISUAL_RULES.md 적용:
 *   - 카드 X · 흰 배경 X · admin 톤 X
 *   - intelligence archive · classified signal · cinematic surveillance
 *   - typography 중심 · 작은 애니메이션으로 긴장감
 */
import { useEffect } from 'react';

const TARGET = 'https://root14-shelf-v3.vercel.app';

export default function Root14ScenarioChoice() {
  useEffect(() => {
    window.location.replace(TARGET);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#03060a',
        color: '#c9d1d9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes r14SignalBlink { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes r14ScanLine    { 0% { transform: translateY(-30%); } 100% { transform: translateY(120vh); } }
        @keyframes r14LetterCascade {
          from { letter-spacing: 24px; opacity: 0; }
          to   { letter-spacing: 8px;  opacity: 1; }
        }
        @keyframes r14BarGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      {/* CRT 스캔라인 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(transparent 0%, rgba(255,255,255,0.025) 50%, transparent 100%)',
          animation: 'r14ScanLine 6s linear infinite',
          pointerEvents: 'none',
        }}
      />
      {/* 가로 스캔 줄 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
          opacity: 0.35,
        }}
      />
      <CornerMark pos="tl" />
      <CornerMark pos="tr" />
      <CornerMark pos="bl" />
      <CornerMark pos="br" />

      {/* CLASSIFIED 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: 8,
          color: '#dc2626',
          fontWeight: 700,
          opacity: 0.85,
        }}
      >
        ▎ CLASSIFIED // ROOT14 EYES ONLY
      </div>

      {/* 메인 라벨 */}
      <div
        style={{
          fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
          fontSize: 11,
          letterSpacing: 8,
          color: '#58a6ff',
          fontWeight: 700,
          textShadow: '0 0 16px rgba(88,166,255,0.55)',
          marginBottom: 28,
          animation: 'r14LetterCascade 0.7s cubic-bezier(0.19,1,0.22,1) both',
        }}
      >
        INCOMING SIGNAL
      </div>

      {/* 시그니처 라인 */}
      <div
        style={{
          width: 80,
          height: 2,
          background: '#58a6ff',
          boxShadow: '0 0 14px #58a6ff',
          marginBottom: 28,
          transformOrigin: 'left center',
          animation: 'r14BarGrow 0.6s ease-out 0.3s both',
        }}
      />

      {/* 타이틀 */}
      <h1
        style={{
          fontSize: 'clamp(22px, 2.8vw, 32px)',
          fontWeight: 200,
          letterSpacing: 1,
          color: '#fefefe',
          margin: 0,
          textAlign: 'center',
          textShadow: '0 0 24px rgba(0,0,0,0.6)',
          opacity: 0,
          animation: 'r14LetterCascade 0.9s ease-out 0.45s both',
        }}
      >
        Scenario Archive
      </h1>

      {/* 상태 */}
      <div
        style={{
          marginTop: 18,
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: 4,
          color: '#8b949e',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'r14SignalBlink 1.6s ease-in-out infinite',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#58a6ff',
            boxShadow: '0 0 12px #58a6ff',
          }}
        />
        TRANSMITTING — ESTABLISHING SECURE CHANNEL
      </div>

      {/* 좌하 좌표 — HUD 톤 */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          bottom: 28,
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: 3,
          color: '#475569',
          lineHeight: 1.7,
        }}
      >
        ▎ NODE  ROOT14-EDU<br />
        ▎ DEST  SHELF.A.PRIME<br />
        ▎ MODE  AUTO-RELAY
      </div>

      {/* 우하 — 수동 백업 링크 */}
      <a
        href={TARGET}
        style={{
          position: 'absolute',
          right: 28,
          bottom: 28,
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: 3,
          color: '#58a6ff',
          textDecoration: 'none',
          padding: '6px 12px',
          border: '1px solid rgba(88,166,255,0.3)',
          background: 'rgba(88,166,255,0.05)',
        }}
      >
        ↳ MANUAL OVERRIDE
      </a>
    </div>
  );
}

function CornerMark({ pos }) {
  const place = {
    tl: { top: 16, left: 16, borderTop: '2px solid #58a6ff', borderLeft: '2px solid #58a6ff' },
    tr: { top: 16, right: 16, borderTop: '2px solid #58a6ff', borderRight: '2px solid #58a6ff' },
    bl: { bottom: 16, left: 16, borderBottom: '2px solid #58a6ff', borderLeft: '2px solid #58a6ff' },
    br: { bottom: 16, right: 16, borderBottom: '2px solid #58a6ff', borderRight: '2px solid #58a6ff' },
  }[pos];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 14,
        height: 14,
        opacity: 0.55,
        ...place,
      }}
    />
  );
}

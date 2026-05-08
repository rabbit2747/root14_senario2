/**
 * Root14NotFound — 404 catch-all (ROOT14 톤)
 *
 * VISUAL_RULES.md:
 *   - 일반 404 페이지 X · classified signal lost 톤
 *   - operation control 톤 fallback CTA
 */
import { useLocation, useNavigate } from "react-router-dom";

export default function Root14NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#03060a",
        color: "#c9d1d9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes r14NfBlink   { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes r14NfScan    { 0% { transform: translateY(-30%); } 100% { transform: translateY(120vh); } }
        @keyframes r14NfCascade { from { letter-spacing: 24px; opacity: 0; } to { letter-spacing: 8px; opacity: 1; } }
      `}</style>

      {/* CRT 가로 줄 */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />
      {/* 흐르는 스캔 */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 90,
          background: "linear-gradient(transparent 0%, rgba(220,38,38,0.06) 50%, transparent 100%)",
          animation: "r14NfScan 8s linear infinite",
          pointerEvents: "none",
        }}
      />
      {/* 비네트 */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 코너 마커 (빨강) */}
      {["tl", "tr", "bl", "br"].map((p) => {
        const place = {
          tl: { top: 14, left: 14, borderTop: "2px solid #dc2626", borderLeft: "2px solid #dc2626" },
          tr: { top: 14, right: 14, borderTop: "2px solid #dc2626", borderRight: "2px solid #dc2626" },
          bl: { bottom: 14, left: 14, borderBottom: "2px solid #dc2626", borderLeft: "2px solid #dc2626" },
          br: { bottom: 14, right: 14, borderBottom: "2px solid #dc2626", borderRight: "2px solid #dc2626" },
        }[p];
        return (
          <div
            key={p}
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 18,
              height: 18,
              opacity: 0.6,
              animation: "r14NfBlink 2.4s ease-in-out infinite",
              ...place,
            }}
          />
        );
      })}

      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9,
          letterSpacing: 8,
          color: "#dc2626",
          fontWeight: 700,
          opacity: 0.85,
          marginBottom: 22,
        }}
      >
        ▎ CLASSIFIED // ROOT14
      </div>

      <div
        style={{
          fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
          fontSize: 12,
          letterSpacing: 8,
          color: "#dc2626",
          fontWeight: 700,
          textShadow: "0 0 18px rgba(220,38,38,0.55)",
          marginBottom: 22,
          animation: "r14NfCascade 0.7s cubic-bezier(0.19,1,0.22,1) both",
        }}
      >
        SIGNAL LOST
      </div>

      <div
        style={{
          width: 80,
          height: 2,
          background: "#dc2626",
          boxShadow: "0 0 14px #dc2626",
          marginBottom: 20,
        }}
      />

      <h1
        style={{
          fontSize: "clamp(22px, 2.8vw, 32px)",
          fontWeight: 200,
          letterSpacing: 1,
          color: "#fefefe",
          margin: 0,
          textAlign: "center",
          textShadow: "0 0 24px rgba(0,0,0,0.6)",
        }}
      >
        404 — UNKNOWN ROUTE
      </h1>

      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          letterSpacing: 3,
          color: "#475569",
          marginTop: 8,
          maxWidth: 520,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        ▎ PATH  {location.pathname}<br />
        ▎ STATE  RESOURCE NOT IN ARCHIVE
      </div>

      <button
        type="button"
        onClick={() => navigate("/learning-path")}
        style={{
          marginTop: 28,
          background: "transparent",
          border: "1px solid #58a6ff",
          borderLeft: "3px solid #58a6ff",
          color: "#58a6ff",
          padding: "12px 28px",
          fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
          fontSize: 11,
          letterSpacing: 5,
          fontWeight: 800,
          cursor: "pointer",
          textTransform: "uppercase",
          textShadow: "0 0 12px rgba(88,166,255,0.55)",
          boxShadow: "0 0 22px rgba(88,166,255,0.35)",
          transition: "all 0.22s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(88,166,255,0.12)";
          e.currentTarget.style.boxShadow = "0 0 32px rgba(88,166,255,0.55), inset 0 0 26px rgba(88,166,255,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.boxShadow = "0 0 22px rgba(88,166,255,0.35)";
        }}
      >
        ● RETURN TO LEARNING PATH
      </button>

      <div
        style={{
          marginTop: 14,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9,
          letterSpacing: 3,
          color: "#334155",
        }}
      >
        ▎ ROOT14 // OPERATIONS
      </div>
    </div>
  );
}

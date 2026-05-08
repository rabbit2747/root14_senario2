/**
 * OperationHeader — 작전 브리핑 페이지 상단 헤더
 *
 * VISUAL_RULES:
 *   - intelligence archive · classified document
 *   - chapter label (Press Start 2P) → glow line → big weight-200 title → italic tagline
 *   - 좌측 시그니처 글로우 라인 (briefing 전형)
 *
 * @example
 *   <OperationHeader
 *     classification="CLASSIFIED // ROOT14 EYES ONLY"
 *     label="ROOT14 // ORION ECHO"
 *     title="Operation Orion Echo"
 *     tagline="신뢰된 공급망을 장악하라."
 *     intent="당신은 벤더의 빌드·서명 파이프라인을..."
 *     accent="#58a6ff"
 *   />
 */
import React from "react";

export default function OperationHeader({
  classification = null,
  label,
  title,
  tagline,
  intent,
  accent = "#58a6ff",
}) {
  return (
    <header style={{ position: "relative", marginBottom: 20 }}>
      {/* 좌측 시그니처 글로우 라인 */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 4,
          left: -16,
          width: 2,
          height: 28,
          background: accent,
          boxShadow: `0 0 12px ${accent}`,
        }}
      />

      {classification && (
        <div
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 9,
            letterSpacing: 6,
            color: "#dc2626",
            fontWeight: 700,
            opacity: 0.8,
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          ▎ {classification}
        </div>
      )}

      {label && (
        <span
          style={{
            display: "inline-block",
            fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
            letterSpacing: 6,
            fontSize: 10,
            color: accent,
            textShadow: `0 0 12px ${accent}55`,
            fontWeight: 700,
          }}
        >
          ▎ {label}
        </span>
      )}

      {title && (
        <h1
          style={{
            fontWeight: 200,
            letterSpacing: -0.4,
            fontSize: "clamp(28px, 3.6vw, 44px)",
            margin: "16px 0 14px",
            lineHeight: 1.18,
            color: "#fefefe",
            textShadow: "0 2px 24px rgba(0,0,0,0.7), 0 0 32px rgba(255,255,255,0.04)",
          }}
        >
          {title}
        </h1>
      )}

      {tagline && (
        <p
          style={{
            fontStyle: "italic",
            margin: "0 0 14px",
            color: "#94a3b8",
            fontSize: 14,
            letterSpacing: 0.3,
          }}
        >
          "{tagline}"
        </p>
      )}

      {intent && (
        <p
          style={{
            color: "#a3acba",
            lineHeight: 1.7,
            fontSize: 14,
            margin: 0,
            paddingLeft: 16,
            borderLeft: `1px solid ${accent}40`,
          }}
        >
          {intent}
        </p>
      )}
    </header>
  );
}

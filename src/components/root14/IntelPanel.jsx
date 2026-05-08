/**
 * IntelPanel — 첩보 문서 톤 컨테이너 (카드 X · 군사 보고서 셸)
 *
 * VISUAL_RULES:
 *   - 둥근 모서리 X · 카드 그림자 X · 일반 border 절제
 *   - 좌측 굵은 시그니처 라인 (classified report 톤)
 *   - 코너 마커 옵션 (작전실 모니터 톤)
 *
 * @example
 *   <IntelPanel label="MISSION BRIEF" code="OE-001">
 *     <p>당신은 공급망의 그림자가 된다...</p>
 *   </IntelPanel>
 *
 *   <IntelPanel label="THREAT ANALYSIS" accent="#dc2626" corners>
 *     ...
 *   </IntelPanel>
 */
import React from "react";

export default function IntelPanel({
  label,
  code,
  children,
  accent = "#58a6ff",
  corners = false,
  dense = false,
}) {
  const pad = dense ? "16px 18px" : "22px 24px";
  return (
    <section
      style={{
        position: "relative",
        background: "rgba(8, 12, 20, 0.55)",
        border: `1px solid ${accent}22`,
        borderLeft: `3px solid ${accent}`,
        padding: pad,
        margin: "16px 0",
        borderRadius: 0,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      {corners && (
        <>
          <PanelCorner pos="tl" accent={accent} />
          <PanelCorner pos="tr" accent={accent} />
          <PanelCorner pos="bl" accent={accent} />
          <PanelCorner pos="br" accent={accent} />
        </>
      )}

      {(label || code) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `1px dashed ${accent}33`,
          }}
        >
          {label && (
            <span
              style={{
                fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
                fontSize: 10,
                letterSpacing: 4,
                color: accent,
                fontWeight: 700,
                textShadow: `0 0 10px ${accent}55`,
                textTransform: "uppercase",
              }}
            >
              ▎ {label}
            </span>
          )}
          {code && (
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 9,
                letterSpacing: 3,
                color: "#475569",
                fontWeight: 600,
              }}
            >
              FILE  {code}
            </span>
          )}
        </div>
      )}

      <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}

function PanelCorner({ pos, accent }) {
  const place = {
    tl: { top: 6, left: 6, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
    tr: { top: 6, right: 6, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
    bl: { bottom: 6, left: 6, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
    br: { bottom: 6, right: 6, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
  }[pos];
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", width: 12, height: 12, opacity: 0.6, ...place }}
    />
  );
}

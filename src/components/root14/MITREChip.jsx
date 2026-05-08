/**
 * MITREChip — ATT&CK 기법 코드를 군사 작전 코드 스탬프로 표시
 *
 * VISUAL_RULES:
 *   - 카드 X · 둥근 모서리 X · neon hacker X
 *   - 군사 작전 코드 톤 (대괄호 + 모노스페이스 + 시그니처 글로우)
 *
 * @example
 *   <MITREChip code="T1591" />
 *   <MITREChip code="T1566.002" name="Spearphishing Link" accent="#a855f7" />
 *   <MITREChip code="T1078" size="lg" muted />
 */
import React from "react";

const SIZE = {
  sm: { fontSize: 9,  pad: "3px 7px",  letterSpacing: 1.4 },
  md: { fontSize: 10, pad: "4px 9px",  letterSpacing: 1.6 },
  lg: { fontSize: 12, pad: "6px 12px", letterSpacing: 2 },
};

export default function MITREChip({
  code,
  name,
  accent = "#58a6ff",
  size = "md",
  muted = false,
}) {
  const s = SIZE[size] || SIZE.md;
  const color = muted ? "#475569" : accent;
  const border = muted ? "rgba(71,85,105,0.4)" : `${accent}66`;
  const bg = muted ? "transparent" : `${accent}10`;

  return (
    <span
      title={name ? `${code} — ${name}` : code}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${border}`,
        padding: s.pad,
        borderRadius: 0,
        textTransform: "uppercase",
        textShadow: muted ? "none" : `0 0 8px ${accent}55`,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true" style={{ opacity: 0.55 }}>[</span>
      {code}
      <span aria-hidden="true" style={{ opacity: 0.55 }}>]</span>
    </span>
  );
}

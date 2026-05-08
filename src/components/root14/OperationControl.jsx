/**
 * OperationControl — 작전 콘솔 톤 버튼 (앱 일반 버튼 X · operation panel 톤)
 *
 * VISUAL_RULES:
 *   - 둥근 모서리 X · solid fill X (primary 제외)
 *   - 좌측 굵은 시그니처 보더(3px) + 외곽선
 *   - hover시 inset 글로우 강화 (operation control 톤)
 *   - 좌측 작은 액센트 점 (펄스) — 시스템 신호 톤
 *
 * variants:
 *   - primary  : 액센트 글로우 + 외곽 강조 (기본 작전 시작 등)
 *   - ghost    : 투명 + 약한 외곽 (보조 액션)
 *   - danger   : 빨간 액센트 (취소·중단 등)
 *   - disabled : 회색 톤 (비활성)
 *
 * @example
 *   <OperationControl variant="primary" onClick={begin}>BEGIN OPERATION</OperationControl>
 *   <OperationControl variant="ghost">HOLD PREVIEW</OperationControl>
 *   <OperationControl variant="danger" prefix="●">ABORT</OperationControl>
 */
import React, { useState } from "react";

const VARIANT = {
  primary:  { color: "#58a6ff", border: "#58a6ff",            shadow: "rgba(88,166,255,0.35)", inset: "rgba(88,166,255,0.08)" },
  ghost:    { color: "#cbd5e1", border: "rgba(255,255,255,0.18)", shadow: "rgba(255,255,255,0.05)", inset: "rgba(255,255,255,0.02)" },
  danger:   { color: "#ef4444", border: "#ef4444",            shadow: "rgba(239,68,68,0.35)",  inset: "rgba(239,68,68,0.08)" },
  disabled: { color: "#475569", border: "rgba(71,85,105,0.4)", shadow: "rgba(0,0,0,0)",         inset: "rgba(0,0,0,0)" },
};

const SIZE = {
  sm: { fontSize: 10, padding: "10px 22px 10px 18px", letterSpacing: 4 },
  md: { fontSize: 11, padding: "14px 32px 14px 24px", letterSpacing: 5 },
  lg: { fontSize: 12, padding: "18px 40px 18px 28px", letterSpacing: 6 },
};

export default function OperationControl({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  prefix = "●",
  ariaLabel,
}) {
  const v = VARIANT[disabled ? "disabled" : variant] || VARIANT.primary;
  const s = SIZE[size] || SIZE.md;
  const [hover, setHover] = useState(false);

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: disabled
          ? "transparent"
          : hover
            ? `${v.color}1a`
            : "transparent",
        color: v.color,
        border: `1px solid ${v.border}`,
        borderLeft: `3px solid ${v.border}`,
        padding: s.padding,
        fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
        fontSize: s.fontSize,
        fontWeight: 800,
        letterSpacing: s.letterSpacing,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 0,
        textTransform: "uppercase",
        textShadow: disabled ? "none" : `0 0 12px ${v.color}55`,
        boxShadow: disabled
          ? "none"
          : hover
            ? `0 0 36px ${v.shadow}, inset 0 0 32px ${v.color}26`
            : `0 0 24px ${v.shadow}, inset 0 0 24px ${v.inset}`,
        transition: "all 0.22s ease",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {prefix && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            background: v.color,
            boxShadow: disabled ? "none" : `0 0 10px ${v.color}`,
            verticalAlign: "middle",
            marginRight: 2,
          }}
        />
      )}
      <span>{children}</span>
    </button>
  );
}

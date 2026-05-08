/**
 * ThreatLevel — military HUD 톤 위협도 인디케이터
 *
 * VISUAL_RULES:
 *   - HUD 톤 (펄스 점 + 가는 진행 막대 + 모노스페이스 라벨)
 *   - 색은 의미 단계로 절제: green / amber / orange / red
 *   - 카드 X · 그림자 X · 일반 progress bar UI X
 *
 * @example
 *   <ThreatLevel level="HIGH" />
 *   <ThreatLevel level="CRITICAL" value={87} label="DETECTION PRESSURE" />
 *   <ThreatLevel level="LOW" value={12} compact />
 */
import React from "react";

const LEVEL_COLOR = {
  LOW:      "#22c55e",
  MEDIUM:   "#fbbf24",
  HIGH:     "#fb923c",
  CRITICAL: "#dc2626",
};

const LEVEL_ANIM_SPEED = {
  LOW:      "2.4s",
  MEDIUM:   "1.8s",
  HIGH:     "1.2s",
  CRITICAL: "0.7s",
};

export default function ThreatLevel({
  level = "LOW",
  value = null,
  label = "THREAT LEVEL",
  compact = false,
}) {
  const upper = String(level).toUpperCase();
  const color = LEVEL_COLOR[upper] || "#475569";
  const speed = LEVEL_ANIM_SPEED[upper] || "2.4s";
  const v = value == null ? null : Math.max(0, Math.min(100, value));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: compact ? 120 : 180,
      }}
    >
      <style>{`
        @keyframes r14ThreatPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.18); }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 9,
            letterSpacing: 3,
            color: "#475569",
            fontWeight: 600,
          }}
        >
          ▎ {label}
        </span>
        {v != null && (
          <span
            style={{
              fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: 2,
              color,
              fontWeight: 800,
              textShadow: `0 0 8px ${color}66`,
            }}
          >
            {String(v).padStart(2, "0")}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 10px ${color}`,
            animation: `r14ThreatPulse ${speed} ease-in-out infinite`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: compact ? 11 : 12,
            letterSpacing: 3,
            color,
            fontWeight: 700,
            textShadow: `0 0 6px ${color}55`,
          }}
        >
          {upper}
        </span>
      </div>

      {/* 가는 진행 막대 (value 있을 때만) */}
      {v != null && (
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }}>
          <div
            style={{
              width: `${v}%`,
              height: "100%",
              background: color,
              boxShadow: `0 0 6px ${color}`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}

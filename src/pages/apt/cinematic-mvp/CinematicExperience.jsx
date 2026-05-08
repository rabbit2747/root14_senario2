/**
 * CinematicExperience — Cinematic 첫 장면 (ROOT14 대표 장면)
 *
 * 작업 범위 (이번 turn):
 *   - 첫 장면만 (multi-scene caroulsel X)
 *   - ROOT14 공통 컴포넌트 5종 적용
 *     OperationHeader · MITREChip · IntelPanel · ThreatLevel · OperationControl
 *
 * VISUAL_RULES.md · ROOT14_RULES.md 준수
 */
import { useNavigate, useParams } from "react-router-dom";
import {
  OperationHeader,
  MITREChip,
  IntelPanel,
  ThreatLevel,
  OperationControl,
} from "../../../components/root14";

// ── 캠페인 첫 장면 데이터 (이 페이지 전용 · inline) ──
const FIRST_SCENE = {
  "operation-orion-echo": {
    classification: "CLASSIFIED // ROOT14 EYES ONLY",
    label: "ROOT14 // ORION ECHO",
    title: "Operation Orion Echo",
    tagline: "신뢰된 공급망을 장악하라.",
    intent:
      "당신은 벤더의 빌드·서명 파이프라인을 거쳐, 신뢰된 업데이트 채널을 통해 고객 환경에 도달한다. 작전의 첫 장면은 인터넷 끝에서 시작된다.",
    chapter: "01 / EXTERNAL RECONNAISSANCE",
    sceneTitle: "그림자는 인터넷 끝에서 시작된다",
    narration:
      "당신은 벤더의 공개 면을 읽는다. 회사·제품·고객·서비스 — 이 회사가 누구의 신뢰를 받고 있는지, 그것이 당신의 첫 지도다. 발자국은 아직 어디에도 남지 않았다.",
    mitre: ["T1591", "T1592.002", "T1593"],
    threatLevel: "LOW",
    threatValue: 12,
    operatorRole: "Advanced Persistent Threat Operator",
    accent: "#58a6ff",
    nextLabel: "BEGIN OPERATION",
    nextRoute: "https://root14-3d.vercel.app/?case=operation-orion-echo",
    nextDisabled: false,
  },
  "operation-ledger-mirage": {
    classification: "CLASSIFIED // ROOT14 EYES ONLY",
    label: "ROOT14 // LEDGER MIRAGE",
    title: "Operation Ledger Mirage",
    tagline: "조직의 신뢰 구조를 해킹하라.",
    intent:
      "당신은 사기형 공격자다. 메일·결재·신뢰가 무대다. 작전의 첫 장면은 타겟의 일상을 관찰하는 곳에서 시작된다.",
    chapter: "01 / RECONNAISSANCE",
    sceneTitle: "타겟의 일상을 읽는다",
    narration:
      "결재일과 휴가, 계약과 침묵. 임원의 말투, 회계팀의 답장 시간. 평범한 것들이 당신의 무기가 된다. 발자국은 아직 어디에도 남지 않았다.",
    mitre: ["T1591", "T1593"],
    threatLevel: "LOW",
    threatValue: 8,
    operatorRole: "Financial Fraud Operator",
    accent: "#a855f7",
    nextLabel: "OPERATION ENVIRONMENT PREPARING",
    nextRoute: null,
    nextDisabled: true,
  },
};

const SUPPORTED = Object.keys(FIRST_SCENE);

// ── 뒤로가기 — intro briefing 으로 (현재 흐름 origin) ──
const INTRO_BACK_BASE = "https://root14-intro-v2.vercel.app";
function backToBriefing(scenarioId) {
  // history가 같은 origin이면 back, 아니면 intro로 직접 이동 (404 방지)
  if (window.history.length > 1 && document.referrer && document.referrer.includes("root14-intro")) {
    window.history.back();
    return;
  }
  window.location.href = `${INTRO_BACK_BASE}/apt/${scenarioId}/briefing`;
}

export default function CinematicExperience() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const scene = FIRST_SCENE[scenarioId];

  if (!scene) return <NotFound id={scenarioId} onBack={() => navigate("/learning-path")} />;

  const goNext = () => {
    if (scene.nextDisabled || !scene.nextRoute) return;
    window.location.href = scene.nextRoute;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#03060a",
        color: "#cbd5e1",
        fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
        overflow: "auto",
      }}
    >
      <Atmosphere accent={scene.accent} caseId={scenarioId} />

      {/* 뒤로가기 — BRIEFING 으로 */}
      <button
        type="button"
        onClick={() => backToBriefing(scenarioId)}
        style={{
          position: "fixed",
          top: 16,
          left: 60,
          zIndex: 9999,
          background: "rgba(8, 12, 20, 0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: `1px solid ${scene.accent}55`,
          color: scene.accent,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          letterSpacing: 3,
          padding: "8px 14px",
          borderRadius: 0,
          cursor: "pointer",
          transition: "all 0.2s",
          fontWeight: 700,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${scene.accent}1a`;
          e.currentTarget.style.borderColor = scene.accent;
          e.currentTarget.style.boxShadow = `0 0 16px ${scene.accent}55`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(8, 12, 20, 0.85)";
          e.currentTarget.style.borderColor = `${scene.accent}55`;
          e.currentTarget.style.boxShadow = "none";
        }}
        aria-label="뒤로 — 작전 브리핑"
      >
        ← BRIEFING
      </button>

      <div
        style={{
          position: "relative",
          maxWidth: 980,
          margin: "0 auto",
          padding: "84px 48px 72px",
          zIndex: 5,
        }}
      >
        {/* 상단 — 작전 헤더 */}
        <OperationHeader
          classification={scene.classification}
          label={scene.label}
          title={scene.title}
          tagline={scene.tagline}
          intent={scene.intent}
          accent={scene.accent}
        />

        {/* 장면 — 챕터 + 큰 타이틀 + 내레이션 (장면 자체) */}
        <section style={{ marginTop: 56 }}>
          <div
            style={{
              fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
              fontSize: 11,
              letterSpacing: 6,
              color: scene.accent,
              fontWeight: 700,
              marginBottom: 20,
              textShadow: `0 0 14px ${scene.accent}55`,
              animation: "r14ChapterIn 0.7s cubic-bezier(0.19,1,0.22,1) 0.1s both",
            }}
          >
            ▎ {scene.chapter}
          </div>
          <div
            aria-hidden="true"
            style={{
              width: 60,
              height: 2,
              background: scene.accent,
              boxShadow: `0 0 12px ${scene.accent}`,
              marginBottom: 22,
              transformOrigin: "left center",
              animation: "r14BarGrow 0.6s ease-out 0.3s both",
            }}
          />
          <h2
            style={{
              fontSize: "clamp(30px, 4.4vw, 52px)",
              fontWeight: 200,
              letterSpacing: -0.5,
              margin: "0 0 26px",
              lineHeight: 1.18,
              color: "#fefefe",
              textShadow: "0 2px 28px rgba(0,0,0,0.8), 0 0 36px rgba(255,255,255,0.04)",
              animation: "r14TitleIn 0.85s cubic-bezier(0.19,1,0.22,1) 0.4s both",
            }}
          >
            {scene.sceneTitle}
          </h2>
          <p
            style={{
              fontSize: "clamp(14px, 1.4vw, 17px)",
              lineHeight: 1.85,
              color: "#a3acba",
              maxWidth: 720,
              margin: "0 0 36px",
              letterSpacing: 0.3,
              animation: "r14NarrationIn 0.9s ease-out 0.55s both",
            }}
          >
            {scene.narration}
          </p>
        </section>

        {/* 중간 — Intel Panel : MITRE 코드 (군사 작전 코드) */}
        <IntelPanel label="ATT&CK CODES IN PLAY" code={scenarioId.split("-").pop().toUpperCase()} accent={scene.accent}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
            {scene.mitre.map((code) => (
              <MITREChip key={code} code={code} accent={scene.accent} size="md" />
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 12,
              color: "#64748b",
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: 1.5,
              lineHeight: 1.6,
            }}
          >
            첫 장면에서 모델링된 ATT&CK 기법. 흔적은 아직 남지 않는다.
          </div>
        </IntelPanel>

        {/* 우측 정렬 — Threat Level + Operator Role 두 작은 패널 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 16,
          }}
        >
          <IntelPanel label="DETECTION PRESSURE" accent={scene.accent} dense>
            <ThreatLevel
              level={scene.threatLevel}
              value={scene.threatValue}
              label="EXPOSURE"
            />
          </IntelPanel>

          <IntelPanel label="OPERATOR" accent={scene.accent} dense>
            <div
              style={{
                fontSize: 13,
                color: "#cbd5e1",
                lineHeight: 1.6,
                paddingTop: 4,
              }}
            >
              {scene.operatorRole}
            </div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                letterSpacing: 2,
                color: "#475569",
                marginTop: 8,
              }}
            >
              ▎ STATE  ACTIVE
            </div>
          </IntelPanel>
        </div>

        {/* 하단 — 단일 메인 CTA (operation control 톤) */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            justifyContent: "center",
            gap: 16,
            paddingTop: 26,
            borderTop: `1px dashed ${scene.accent}33`,
            animation: "r14NarrationIn 0.9s ease-out 0.85s both",
          }}
        >
          <OperationControl
            variant="primary"
            size="lg"
            disabled={scene.nextDisabled}
            onClick={goNext}
            ariaLabel={scene.nextLabel}
          >
            {scene.nextLabel}
          </OperationControl>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            letterSpacing: 3,
            color: "#334155",
          }}
        >
          {scene.nextDisabled
            ? "▎ ENVIRONMENT PROVISIONING — STANDBY"
            : "▎ ENTERING 3D OPERATION SPACE"}
        </div>
      </div>

      <style>{`
        @keyframes r14ChapterIn {
          from { opacity: 0; letter-spacing: 16px; transform: translateX(-8px); }
          to   { opacity: 1; letter-spacing: 6px;  transform: translateX(0);   }
        }
        @keyframes r14BarGrow    { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes r14TitleIn {
          0%   { opacity: 0; transform: translateY(-12px); filter: blur(4px); }
          70%  { opacity: 1; filter: blur(0); }
          80%  { transform: translateX(2px); }
          90%  { transform: translateX(-1px); }
          100% { transform: translate(0,0); opacity: 1; }
        }
        @keyframes r14NarrationIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ───────────── Atmosphere — VISUAL_RULES 작전실 톤 (배경 레이어) ─────────────
function Atmosphere({ accent, caseId }) {
  return (
    <>
      <style>{`
        @keyframes r14ScanFlow { 0% { transform: translateY(-30%); } 100% { transform: translateY(120vh); } }
        @keyframes r14CornerPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes r14ClassifiedBlink { 0%,100% { opacity: 0.65; } 50% { opacity: 0.95; } }
      `}</style>

      {/* CRT 가로 줄 */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 1,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />
      {/* 흐르는 스캔라인 */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", left: 0, right: 0, height: 120, zIndex: 2,
          background: `linear-gradient(transparent 0%, ${accent}0a 50%, transparent 100%)`,
          animation: "r14ScanFlow 14s linear infinite",
          pointerEvents: "none",
        }}
      />
      {/* 비네트 */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 2,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* 시그니처 그라디언트 (campaign accent) */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          background: `radial-gradient(ellipse at 80% 20%, ${accent}10 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* 코너 마커 */}
      <Corner pos="tl" accent={accent} />
      <Corner pos="tr" accent={accent} />
      <Corner pos="bl" accent={accent} />
      <Corner pos="br" accent={accent} />

      {/* 우상 CLASSIFIED */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", top: 18, right: 80, zIndex: 9998,
          fontFamily: "monospace", fontSize: 9, letterSpacing: 5,
          color: "#dc2626", fontWeight: 700, opacity: 0.7,
          animation: "r14ClassifiedBlink 3.2s ease-in-out infinite",
          pointerEvents: "none",
        }}
      >
        ▎ CLASSIFIED // ROOT14
      </div>

      {/* 좌하 HUD */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", left: 18, bottom: 16, zIndex: 9998,
          fontFamily: "monospace", fontSize: 9, letterSpacing: 3,
          color: "#475569", lineHeight: 1.6, pointerEvents: "none",
        }}
      >
        ▎ CASE   {caseId.toUpperCase()}<br />
        ▎ STATE  CINEMATIC<br />
        ▎ ACCESS GRANTED
      </div>

      {/* 우하 HUD */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", right: 18, bottom: 16, zIndex: 9998,
          fontFamily: "monospace", fontSize: 9, letterSpacing: 3,
          color: "#475569", textAlign: "right", lineHeight: 1.6,
          pointerEvents: "none",
        }}
      >
        ▎ ROOT14 // OPERATIONS<br />
        ▎ FILE  CINEMATIC-001<br />
        ▎ TZ    UTC+09
      </div>
    </>
  );
}

function Corner({ pos, accent }) {
  const place = {
    tl: { top: 14, left: 14, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
    tr: { top: 14, right: 14, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
    bl: { bottom: 14, left: 14, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
    br: { bottom: 14, right: 14, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
  }[pos];
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        width: 18,
        height: 18,
        zIndex: 9997,
        animation: "r14CornerPulse 4s ease-in-out infinite",
        pointerEvents: "none",
        ...place,
      }}
    />
  );
}

function NotFound({ id, onBack }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#03060a",
        color: "#cbd5e1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 6, color: "#dc2626", fontWeight: 700 }}>
        ▎ CASE NOT FOUND
      </div>
      <div style={{ fontSize: 18, fontWeight: 300 }}>{id}</div>
      <div style={{ fontSize: 12, color: "#64748b" }}>지원: {SUPPORTED.join(" · ")}</div>
      <button
        onClick={onBack}
        style={{
          marginTop: 16,
          background: "transparent",
          border: "1px solid #475569",
          color: "#cbd5e1",
          padding: "10px 22px",
          fontFamily: "monospace",
          fontSize: 11,
          letterSpacing: 3,
          cursor: "pointer",
        }}
      >
        ← BACK
      </button>
    </div>
  );
}

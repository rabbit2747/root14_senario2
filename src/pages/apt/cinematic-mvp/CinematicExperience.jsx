/**
 * CinematicExperience — Cinematic Sequence (5~7 scene)
 *
 * 작업 범위 (이번 turn):
 *   - 1장면 → 7장면 시퀀스로 확장
 *   - useState(currentIndex) 기반 장면 진행 (실시간 시뮬레이션 X · 더미 데이터)
 *   - PREV / NEXT 버튼 + 마지막 장면에서만 ENTER 3D EXPERIENCE
 *   - Detection Pressure 가 장면마다 변화 (LOW → CRITICAL)
 *
 * 비-수정 영역:
 *   - Intro · 3D · 라우트 · 상태관리 절대 미접촉
 *   - ROOT14 5종 컴포넌트 그대로 사용
 *
 * VISUAL_RULES.md · ROOT14_RULES.md 준수
 *   - 어두운 배경 / 큰 타이포 / 카드 남발 금지 / 영화 톤
 */
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  OperationHeader,
  MITREChip,
  IntelPanel,
  ThreatLevel,
  OperationControl,
} from "../../../components/root14";

// ═══════════════════════════════════════════════════════════════════
//  CAMPAIGN META — 캠페인 단위 헤더 (장면 진행과 무관, 1회 렌더)
// ═══════════════════════════════════════════════════════════════════
const CAMPAIGN_META = {
  "operation-orion-echo": {
    classification: "CLASSIFIED // ROOT14 EYES ONLY",
    label: "ROOT14 // ORION ECHO",
    title: "Operation Orion Echo",
    tagline: "신뢰된 공급망을 장악하라.",
    intent:
      "당신은 벤더의 빌드·서명 파이프라인을 거쳐, 신뢰된 업데이트 채널을 통해 고객 환경에 도달한다.",
    operatorRole: "Advanced Persistent Threat Operator",
    accent: "#58a6ff",
    finalLabel: "ENTER 3D EXPERIENCE",
    finalRoute: "https://root14-3d.vercel.app/?case=operation-orion-echo",
  },
  "operation-ledger-mirage": {
    classification: "CLASSIFIED // ROOT14 EYES ONLY",
    label: "ROOT14 // LEDGER MIRAGE",
    title: "Operation Ledger Mirage",
    tagline: "조직의 신뢰 구조를 해킹하라.",
    intent:
      "당신은 사기형 공격자다. 메일·결재·신뢰가 무대다. 평범한 일상이 당신의 무기가 된다.",
    operatorRole: "Financial Fraud Operator",
    accent: "#a855f7",
    finalLabel: "ENTER 3D EXPERIENCE",
    finalRoute: "https://root14-3d.vercel.app/?case=operation-ledger-mirage",
  },
};

// ═══════════════════════════════════════════════════════════════════
//  SCENES — 캠페인별 7장면 시퀀스 (더미 데이터, 영화 톤)
// ═══════════════════════════════════════════════════════════════════
const SCENES_BY_CAMPAIGN = {
  "operation-orion-echo": [
    {
      chapter: "01 / EXTERNAL RECONNAISSANCE",
      sceneTitle: "그림자는 인터넷 끝에서 시작된다",
      narration:
        "벤더의 공개 면을 읽는다. 회사·제품·고객·계약. 누구의 신뢰를 받는지가 당신의 첫 지도다. 발자국은 어디에도 남지 않는다.",
      mitre: ["T1591", "T1592.002", "T1593"],
      threatLevel: "LOW",
      threatValue: 12,
    },
    {
      chapter: "02 / INITIAL ACCESS",
      sceneTitle: "벤더의 자물쇠가 첫 균열을 낸다",
      narration:
        "공개된 자격증명, 잘못 방치된 토큰, 익숙한 피싱. 침입은 화려하지 않다. 절대 화려하지 않다.",
      mitre: ["T1078", "T1133", "T1566.002"],
      threatLevel: "LOW",
      threatValue: 22,
    },
    {
      chapter: "03 / FOOTHOLD ESTABLISHED",
      sceneTitle: "교두보가 자리를 잡는다",
      narration:
        "벤더의 내부망 한 구석에 거점이 선다. 신호는 짧고 잠잠하다. 당신의 다음 발걸음은 더 깊은 곳으로 향한다.",
      mitre: ["T1547.001", "T1098", "T1505.003"],
      threatLevel: "MEDIUM",
      threatValue: 38,
    },
    {
      chapter: "04 / INTERNAL DISCOVERY",
      sceneTitle: "조직의 골격을 손끝으로 읽는다",
      narration:
        "사람·서비스·신뢰의 흐름이 보인다. 누가 누구에게 서명하는가. 어디가 빌드 파이프라인인가. 당신은 지도를 다시 그린다.",
      mitre: ["T1018", "T1069.002", "T1087.002"],
      threatLevel: "MEDIUM",
      threatValue: 50,
    },
    {
      chapter: "05 / BUILD PIPELINE ACCESS",
      sceneTitle: "신뢰가 만들어지는 방으로 들어선다",
      narration:
        "코드 서명 키, 빌드 서버, 릴리스 채널. 이 방의 작은 실수 하나가 수천 개의 고객 환경을 바꾼다. 당신은 그 방의 손님이 된다.",
      mitre: ["T1195.002", "T1554", "T1199"],
      threatLevel: "HIGH",
      threatValue: 66,
    },
    {
      chapter: "06 / TRUSTED UPDATE PROPAGATION",
      sceneTitle: "신뢰가 무기처럼 흐른다",
      narration:
        "정상 서명, 정상 채널, 정상 업데이트. 모든 게 정상이라 어떤 경보도 울리지 않는다. 신뢰는 가장 빠른 전달자다.",
      mitre: ["T1195.002", "T1071.001"],
      threatLevel: "HIGH",
      threatValue: 80,
    },
    {
      chapter: "07 / CUSTOMER ENVIRONMENT ENTRY",
      sceneTitle: "고객의 안방, 마지막 장면",
      narration:
        "감사 데이터에 손이 닿는다. 작전의 도착점이다. 다음은 3D 작전 공간에서 직접 본다.",
      mitre: ["T1041", "T1567.002", "T1486"],
      threatLevel: "CRITICAL",
      threatValue: 92,
    },
  ],
  "operation-ledger-mirage": [
    {
      chapter: "01 / VENDOR TRUST MAPPING",
      sceneTitle: "타겟의 일상을 읽는다",
      narration:
        "결재일과 휴가, 계약과 침묵. 임원의 말투, 회계팀의 답장 시간. 평범한 것들이 당신의 무기다.",
      mitre: ["T1591", "T1593", "T1589.002"],
      threatLevel: "LOW",
      threatValue: 8,
    },
    {
      chapter: "02 / EXECUTIVE IMPERSONATION",
      sceneTitle: "당신은 그가 된다",
      narration:
        "표지를 그대로 베껴 쓰는 일은 어렵지 않다. 어려운 건 그의 침묵까지 베끼는 일이다. 당신은 침묵까지 가져간다.",
      mitre: ["T1585.002", "T1586.002", "T1656"],
      threatLevel: "LOW",
      threatValue: 18,
    },
    {
      chapter: "03 / THREAD MANIPULATION",
      sceneTitle: "오래된 대화 속으로 미끄러진다",
      narration:
        "이미 신뢰가 쌓인 메일 스레드. 당신은 새로 시작하지 않는다. 진행 중인 대화의 결을 따라 한 줄을 보탠다.",
      mitre: ["T1566.002", "T1534"],
      threatLevel: "MEDIUM",
      threatValue: 34,
    },
    {
      chapter: "04 / MAILBOX RULE ABUSE",
      sceneTitle: "받은 편지함을 조용히 비튼다",
      narration:
        "특정 키워드의 메일은 본인이 보지 못한다. 답장은 당신을 거쳐 간다. 정상은 정상으로 남고, 정상이 아닌 건 사라진다.",
      mitre: ["T1564.008", "T1114.003"],
      threatLevel: "MEDIUM",
      threatValue: 48,
    },
    {
      chapter: "05 / PAYMENT REDIRECTION",
      sceneTitle: "숫자 한 줄이 행로를 바꾼다",
      narration:
        "계좌번호, 송장 코드, 한 글자. 시스템은 정직하게 새 좌표를 따른다. 정직함이 가장 무서운 도구가 된다.",
      mitre: ["T1656", "T1565.001"],
      threatLevel: "HIGH",
      threatValue: 64,
    },
    {
      chapter: "06 / DETECTION PRESSURE",
      sceneTitle: "이상함의 첫 신호가 깜빡인다",
      narration:
        "다른 회계팀의 한 사람이 다시 한 번 확인한다. 당신은 답장을 빠르게 보낸다. 시간이 당신의 편이라고 믿어야 하는 순간이다.",
      mitre: ["T1656", "T1078"],
      threatLevel: "HIGH",
      threatValue: 78,
    },
    {
      chapter: "07 / OUTCOME PREVIEW",
      sceneTitle: "송금 버튼이 눌린다",
      narration:
        "엔터키 한 번. 정상 절차의 끝이다. 다음은 3D 작전 공간에서 이 흐름을 다시 본다.",
      mitre: ["T1657", "T1486"],
      threatLevel: "CRITICAL",
      threatValue: 88,
    },
  ],
};

const SUPPORTED = Object.keys(CAMPAIGN_META);

// ═══════════════════════════════════════════════════════════════════
//  뒤로가기 — intro briefing 으로
// ═══════════════════════════════════════════════════════════════════
const INTRO_BACK_BASE = "https://root14-intro-v3.vercel.app";
function backToBriefing(scenarioId) {
  if (
    window.history.length > 1 &&
    document.referrer &&
    document.referrer.includes("root14-intro")
  ) {
    window.history.back();
    return;
  }
  window.location.href = `${INTRO_BACK_BASE}/apt/${scenarioId}/briefing`;
}

// ═══════════════════════════════════════════════════════════════════
//  Main
// ═══════════════════════════════════════════════════════════════════
export default function CinematicExperience() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const meta = CAMPAIGN_META[scenarioId];
  const scenes = SCENES_BY_CAMPAIGN[scenarioId] || [];
  const total = scenes.length;
  const [idx, setIdx] = useState(0);

  // scenarioId 바뀌면 idx 리셋 (방어적)
  useEffect(() => {
    setIdx(0);
  }, [scenarioId]);

  const goPrev = useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setIdx((i) => Math.min(total - 1, i + 1));
  }, [total]);
  const enter3D = useCallback(() => {
    if (meta?.finalRoute) window.location.href = meta.finalRoute;
  }, [meta]);

  // 키보드 ← / → 단축 (몰입 보조 · 영화 톤)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (!meta || total === 0) {
    return <NotFound id={scenarioId} onBack={() => navigate("/learning-path")} />;
  }

  const scene = scenes[idx];
  const isFirst = idx === 0;
  const isLast = idx === total - 1;
  const progressPct = ((idx + 1) / total) * 100;

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
      <Atmosphere accent={meta.accent} caseId={scenarioId} />

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
          border: `1px solid ${meta.accent}55`,
          color: meta.accent,
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
          e.currentTarget.style.background = `${meta.accent}1a`;
          e.currentTarget.style.borderColor = meta.accent;
          e.currentTarget.style.boxShadow = `0 0 16px ${meta.accent}55`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(8, 12, 20, 0.85)";
          e.currentTarget.style.borderColor = `${meta.accent}55`;
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
        {/* 상단 — 작전 헤더 (캠페인 단위, 장면 진행과 무관) */}
        <OperationHeader
          classification={meta.classification}
          label={meta.label}
          title={meta.title}
          tagline={meta.tagline}
          intent={meta.intent}
          accent={meta.accent}
        />

        {/* ─── SCENE PROGRESS HUD ──────────────────────────────────
              "▎ SCENE 03 / 07"  +  진행 막대 + 7개 dot 마커
            ─────────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 18,
            paddingBottom: 12,
            borderBottom: `1px dashed ${meta.accent}22`,
          }}
        >
          <div
            style={{
              fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: 4,
              color: meta.accent,
              fontWeight: 700,
              textShadow: `0 0 10px ${meta.accent}55`,
              whiteSpace: "nowrap",
            }}
          >
            ▎ SCENE {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>

          {/* 진행 막대 */}
          <div
            style={{
              flex: 1,
              height: 2,
              background: `${meta.accent}1a`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${meta.accent}33, ${meta.accent})`,
                boxShadow: `0 0 10px ${meta.accent}88`,
                transition: "width 0.55s cubic-bezier(0.19,1,0.22,1)",
              }}
            />
          </div>

          {/* 7개 dot 마커 */}
          <div style={{ display: "flex", gap: 6 }}>
            {scenes.map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 0,
                  background: i <= idx ? meta.accent : `${meta.accent}33`,
                  boxShadow: i === idx ? `0 0 8px ${meta.accent}` : "none",
                  transition: "background 0.3s, box-shadow 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* ─── SCENE BODY ──────────────────────────────────────────
              key={idx} 로 매 장면마다 재마운트 → 진입 애니메이션 재생
            ─────────────────────────────────────────────────────── */}
        <section key={idx} style={{ marginTop: 44 }}>
          <div
            style={{
              fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
              fontSize: 11,
              letterSpacing: 6,
              color: meta.accent,
              fontWeight: 700,
              marginBottom: 20,
              textShadow: `0 0 14px ${meta.accent}55`,
              animation: "r14ChapterIn 0.65s cubic-bezier(0.19,1,0.22,1) 0.05s both",
            }}
          >
            ▎ {scene.chapter}
          </div>
          <div
            aria-hidden="true"
            style={{
              width: 60,
              height: 2,
              background: meta.accent,
              boxShadow: `0 0 12px ${meta.accent}`,
              marginBottom: 22,
              transformOrigin: "left center",
              animation: "r14BarGrow 0.55s ease-out 0.2s both",
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
              animation: "r14TitleIn 0.8s cubic-bezier(0.19,1,0.22,1) 0.3s both",
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
              animation: "r14NarrationIn 0.85s ease-out 0.5s both",
            }}
          >
            {scene.narration}
          </p>
        </section>

        {/* ATT&CK 코드 — 군사 작전 코드 톤 */}
        <div
          key={`mitre-${idx}`}
          style={{ animation: "r14NarrationIn 0.7s ease-out 0.6s both" }}
        >
          <IntelPanel
            label="ATT&CK CODES IN PLAY"
            code={`SCN-${String(idx + 1).padStart(2, "0")}`}
            accent={meta.accent}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
              {scene.mitre.map((code) => (
                <MITREChip key={code} code={code} accent={meta.accent} size="md" />
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
              이 장면에서 모델링된 ATT&CK 기법.
            </div>
          </IntelPanel>
        </div>

        {/* DETECTION PRESSURE + OPERATOR — 2단 */}
        <div
          key={`hud-${idx}`}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 16,
            animation: "r14NarrationIn 0.7s ease-out 0.7s both",
          }}
        >
          <IntelPanel label="DETECTION PRESSURE" accent={meta.accent} dense>
            <ThreatLevel
              level={scene.threatLevel}
              value={scene.threatValue}
              label="EXPOSURE"
            />
          </IntelPanel>

          <IntelPanel label="OPERATOR" accent={meta.accent} dense>
            <div
              style={{
                fontSize: 13,
                color: "#cbd5e1",
                lineHeight: 1.6,
                paddingTop: 4,
              }}
            >
              {meta.operatorRole}
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
              ▎ STATE  {isLast ? "MISSION END APPROACHING" : "ACTIVE"}
            </div>
          </IntelPanel>
        </div>

        {/* ─── 하단 컨트롤 ─────────────────────────────────────────
              · isFirst:  [NEXT SCENE]
              · 중간:     [← PREV] [NEXT SCENE]
              · isLast:   [← PREV] [ENTER 3D EXPERIENCE]
            ─────────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            justifyContent: "center",
            gap: 14,
            paddingTop: 26,
            borderTop: `1px dashed ${meta.accent}33`,
            flexWrap: "wrap",
          }}
        >
          {!isFirst && (
            <OperationControl
              variant="ghost"
              size="md"
              onClick={goPrev}
              ariaLabel="이전 장면"
            >
              ← PREV SCENE
            </OperationControl>
          )}

          {!isLast && (
            <OperationControl
              variant="primary"
              size="lg"
              onClick={goNext}
              ariaLabel="다음 장면"
            >
              NEXT SCENE →
            </OperationControl>
          )}

          {isLast && (
            <OperationControl
              variant="primary"
              size="lg"
              onClick={enter3D}
              ariaLabel="3D 작전 공간 진입"
              disabled={!meta.finalRoute}
            >
              ENTER 3D EXPERIENCE
            </OperationControl>
          )}
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
          {isLast
            ? "▎ ENTERING 3D OPERATION SPACE"
            : `▎ NEXT — ${scenes[idx + 1]?.chapter || ""}`}
        </div>

        {/* 키보드 힌트 — 영화 톤 fine print */}
        <div
          style={{
            textAlign: "center",
            marginTop: 8,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 8,
            letterSpacing: 4,
            color: "#1e293b",
          }}
        >
          ◀ ▶ KEYS TO TRAVERSE
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

// ═══════════════════════════════════════════════════════════════════
//  Atmosphere — VISUAL_RULES 작전실 톤 (배경 레이어)
// ═══════════════════════════════════════════════════════════════════
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
        ▎ FILE  CINEMATIC-SEQ<br />
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

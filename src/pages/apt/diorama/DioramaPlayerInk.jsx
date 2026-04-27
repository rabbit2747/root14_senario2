/**
 * DioramaPlayerInk — INK 시리즈(Seedance 2) 스타일 + 시네마틱 글래스모피즘
 * 기존 v1과 동일한 시나리오·씬·카메라 재사용, HUD/StartGate/Choice만 재디자인
 *
 * 스타일 톤:
 *   - 풀스크린 3D 디오라마 위에 글래스 패널이 떠 있는 헤드업 디스플레이
 *   - 강한 대비 타이포 (uppercase, letter-spacing, sharp sans)
 *   - 흑백 반전 강조 (active item = 흰 bg + 검은 fg)
 *   - 1px 헤어라인 보더, backdrop-blur(20px+), rgba 글래스
 *   - 세그먼트 진행바, 얇은 라인, 모서리 어노테이션
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import { useScenario } from './useScenario';
import DioramaScene from './DioramaScene';
import CameraRig from './CameraRig';

function findActiveCue(timeline, t) {
  let active = null, idx = -1;
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].t <= t) { active = timeline[i]; idx = i; } else break;
  }
  return { cue: active, idx };
}

// ────────────────────────────────────────────────
// 글래스 패널 공통 스타일
const glass = (extra = {}) => ({
  background: 'rgba(8,12,20,0.62)',
  backdropFilter: 'blur(24px) saturate(140%)',
  WebkitBackdropFilter: 'blur(24px) saturate(140%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  ...extra,
});
const glassDark = (extra = {}) => ({
  ...glass(),
  background: 'rgba(0,0,0,0.78)',
  ...extra,
});
const text = (size, weight = 400, letter = 0) => ({
  fontSize: size,
  fontWeight: weight,
  letterSpacing: letter,
  color: '#fefefe',
  fontFamily: '-apple-system,sans-serif',
});

// ── 세그먼트 진행 바 (10칸 / 점등 N칸) ─────
function SegBar({ value, max = 10, color = '#fefefe', dimColor = 'rgba(255,255,255,0.08)' }) {
  const filled = Math.round((value / 10) * max);
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 12, height: 6,
          background: i < filled ? color : dimColor,
          transition: 'background 0.3s',
        }}/>
      ))}
    </div>
  );
}

// ── 얇은 라벨 (uppercase + letter-spacing) ─
const Lbl = ({ children, sx = {} }) => (
  <div style={{
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 3,
    fontFamily: 'monospace',
    fontWeight: 500,
    textTransform: 'uppercase',
    ...sx,
  }}>{children}</div>
);

// ════════════════════════════════════════════════
// 시작 게이트 (INK 스타일 BRIEFING)
// ════════════════════════════════════════════════
function StartGateInk({ scenario, onStart }) {
  const [exit, setExit] = useState(false);
  useEffect(() => {
    const k = (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); start(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  const start = () => { setExit(true); setTimeout(onStart, 700); };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(135deg, #050810 0%, #0a0e1a 100%)',
      display: 'flex',
      opacity: exit ? 0 : 1,
      transition: 'opacity 0.7s ease-out',
      zIndex: 100,
    }}>
      <style>{`
        @keyframes inkFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes inkLine { from { width: 0; } to { width: 64px; } }
        @keyframes inkBlink { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
      `}</style>

      {/* ── 좌측 60%: 브리핑 ─────────────────── */}
      <div style={{
        flex: 1,
        padding: '8vh 6vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}>
        {/* 상단 로고 */}
        <div style={{ animation: 'inkFadeIn 0.6s ease-out' }}>
          <div style={{ ...text(11, 800, 6), color: '#fefefe', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, border: '1.5px solid #fefefe', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>R</span>
            ROOT14 ·  CASE FILE
          </div>
        </div>

        {/* 중앙 메인 */}
        <div>
          <Lbl sx={{ animation: 'inkFadeIn 0.6s ease-out 0.2s both' }}>▎ CLASSIFIED · APT INTRUSION</Lbl>
          <div style={{
            ...text('clamp(13px, 1.5vw, 16px)', 700, 4),
            color: '#fbbf24',
            marginTop: 14,
            marginBottom: 12,
            fontFamily: 'monospace',
            animation: 'inkFadeIn 0.6s ease-out 0.4s both',
          }}>
            CASE {scenario.id.toUpperCase()}
          </div>
          <div style={{
            ...text('clamp(36px, 6vw, 72px)', 100, -2),
            lineHeight: 1.05,
            marginBottom: 16,
            animation: 'inkFadeIn 0.8s ease-out 0.6s both',
          }}>
            {scenario.title}
          </div>
          <div style={{
            ...text('clamp(13px, 1.4vw, 16px)', 300),
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 540,
            lineHeight: 1.6,
            animation: 'inkFadeIn 0.8s ease-out 0.8s both',
          }}>
            {scenario.subtitle}
          </div>

          <div style={{
            width: 64, height: 1, background: '#fbbf24',
            margin: '32px 0',
            animation: 'inkLine 0.8s ease-out 1.0s both',
          }}/>

          {/* 메타 */}
          <div style={{
            display: 'flex', gap: 48,
            animation: 'inkFadeIn 0.8s ease-out 1.1s both',
          }}>
            <div>
              <Lbl>RUNTIME</Lbl>
              <div style={text(20, 200)}>{scenario.duration}s</div>
            </div>
            <div>
              <Lbl>CHOICES</Lbl>
              <div style={text(20, 200)}>{Object.keys(scenario.choices || {}).length}</div>
            </div>
            <div>
              <Lbl>TACTICS</Lbl>
              <div style={text(20, 200)}>{(scenario.principles?.relevance || []).length}</div>
            </div>
          </div>
        </div>

        {/* 하단 ENGAGE 버튼 */}
        <div style={{ animation: 'inkFadeIn 0.8s ease-out 1.3s both' }}>
          <button
            onClick={start}
            style={{
              background: '#fefefe',
              color: '#000',
              border: 'none',
              padding: '20px 40px',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 6,
              fontFamily: '-apple-system,sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fbbf24'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fefefe'; }}
          >
            <span style={{ fontSize: 16 }}>▶</span>
            ENGAGE
          </button>
          <div style={{ ...text(10, 500, 3), color: 'rgba(255,255,255,0.3)', marginTop: 12, fontFamily: 'monospace' }}>
            <span style={{ animation: 'inkBlink 1.8s ease-in-out infinite' }}>● </span>
            PRESS [SPACE] OR [ENTER]
          </div>
        </div>
      </div>

      {/* ── 우측 40%: ATT&CK 카드 ─────────── */}
      <div style={{
        flex: '0 0 38%',
        padding: '8vh 4vw',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        animation: 'inkFadeIn 0.8s ease-out 0.5s both',
      }}>
        <Lbl>▎ MITRE ATT&CK · TACTICS BRIEFED</Lbl>
        {(scenario.principles?.relevance || []).map((r, i) => (
          <div key={r.label} style={{
            ...glass({ padding: 16, animation: `inkFadeIn 0.6s ease-out ${0.7 + i * 0.1}s both` }),
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}>
            <div style={{
              width: 56, padding: '6px 0',
              textAlign: 'center',
              background: '#fefefe',
              color: '#000',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              fontFamily: 'monospace',
              flexShrink: 0,
            }}>{r.label}</div>
            <div style={{ ...text(12, 400), color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{r.note}</div>
          </div>
        ))}

        <div style={{ flex: 1 }}/>

        {/* NEXT 카드 */}
        <div style={{ ...glass({ padding: 14, borderColor: 'rgba(251,191,36,0.25)' }) }}>
          <Lbl>▶ NEXT IN SERIES</Lbl>
          <div style={{ ...text(13, 600), marginTop: 6 }}>
            {scenario.principles?.coherence?.nextTitle}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// Choice (INK 스타일 — WEAPON SELECT 패널처럼)
// ════════════════════════════════════════════════
function ChoiceInk({ choice, onSelect }) {
  const [hovered, setHovered] = useState(0);
  useEffect(() => {
    const k = (e) => {
      if (e.code === 'ArrowDown') setHovered((h) => Math.min(h + 1, choice.options.length - 1));
      if (e.code === 'ArrowUp')   setHovered((h) => Math.max(h - 1, 0));
      if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); onSelect(choice.options[hovered]); }
      const num = parseInt(e.key, 10) - 1;
      if (!isNaN(num) && choice.options[num]) onSelect(choice.options[num]);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [hovered, choice, onSelect]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'auto',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(2px)',
      animation: 'inkFadeIn 0.5s ease-out',
      zIndex: 30,
      display: 'flex',
    }}>
      <style>{`
        @keyframes inkSlide { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes inkSlideR { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* 좌측: 옵션 리스트 (WEAPON SELECT 패널) */}
      <div style={{
        ...glassDark({
          width: 380,
          margin: '8vh 0 8vh 4vw',
          padding: '28px 0',
          animation: 'inkSlide 0.6s ease-out',
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
        }),
      }}>
        <div style={{ padding: '0 24px 24px' }}>
          <Lbl>▎ DECISION POINT</Lbl>
          <div style={{ ...text(20, 700, 1), marginTop: 8, lineHeight: 1.3 }}>
            {choice.prompt}
          </div>
          {choice.context && (
            <div style={{ ...text(10, 500, 2), color: 'rgba(251,191,36,0.7)', fontFamily: 'monospace', marginTop: 8 }}>
              {choice.context}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }}/>

        {/* 옵션 리스트 */}
        <div style={{ flex: 1, padding: '8px 0' }}>
          {choice.options.map((opt, i) => {
            const active = hovered === i;
            return (
              <div
                key={opt.id}
                onMouseEnter={() => setHovered(i)}
                onClick={() => onSelect(opt)}
                style={{
                  padding: '14px 24px',
                  background: active ? '#fefefe' : 'transparent',
                  color: active ? '#000' : '#fefefe',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'all 0.2s',
                  borderLeft: active ? '3px solid #fbbf24' : '3px solid transparent',
                  animation: `inkSlide 0.5s ease-out ${0.2 + i * 0.1}s both`,
                }}
              >
                <span style={{
                  width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: active ? '1px solid #000' : '1px solid rgba(255,255,255,0.3)',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 800,
                  flexShrink: 0,
                }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: active ? '#000' : 'rgba(255,255,255,0.5)',
                    marginBottom: 2,
                  }}>{opt.tag}</div>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 400 }}>{opt.label}</div>
                </div>
                {active && <span style={{ fontSize: 16 }}>›</span>}
              </div>
            );
          })}
        </div>

        {/* 하단 힌트 */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ ...text(9, 500, 2), color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>↑↓ NAVIGATE</span>
          <span style={{ ...text(9, 500, 2), color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>[ENTER] CONFIRM</span>
        </div>
      </div>

      {/* 우측: 선택된 옵션 디테일 (RAZORBACK 디테일 패널처럼) */}
      <div style={{
        ...glass({
          flex: 1,
          margin: '8vh 4vw 8vh 24px',
          padding: 32,
          animation: 'inkSlideR 0.6s ease-out 0.2s both',
          display: 'flex',
          flexDirection: 'column',
        }),
      }}>
        <Lbl>▎ TECHNIQUE DETAILS</Lbl>
        <div style={{
          ...text(36, 100, -1),
          marginTop: 8,
          marginBottom: 4,
        }}>
          {choice.options[hovered]?.tag}
        </div>
        <div style={{ ...text(14, 400), color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          {choice.options[hovered]?.label}
        </div>

        {/* 가짜 스탯 (시각 흥미용) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { l: 'STEALTH',  v: hovered === 0 ? 3 : 8 },
            { l: 'SPEED',    v: hovered === 0 ? 9 : 4 },
            { l: 'NOISE',    v: hovered === 0 ? 7 : 2 },
            { l: 'EVIDENCE', v: hovered === 0 ? 8 : 3 },
          ].map((s) => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Lbl sx={{ width: 80 }}>{s.l}</Lbl>
              <SegBar value={s.v} color="#fefefe"/>
              <div style={{ ...text(11, 700), fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', minWidth: 30, textAlign: 'right' }}>
                {s.v}/10
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        {/* CONFIRM 버튼 */}
        <button
          onClick={() => onSelect(choice.options[hovered])}
          style={{
            background: '#fbbf24',
            color: '#000',
            border: 'none',
            padding: '18px 32px',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fefefe'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fbbf24'; }}
        >
          <span>COMMIT DECISION</span>
          <span style={{ fontSize: 18 }}>›</span>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 메인 플레이어
// ════════════════════════════════════════════════
export default function DioramaPlayerInk() {
  const { scenarioId = 'c0024' } = useParams();
  const navigate = useNavigate();
  const scenario = useScenario(scenarioId);

  const [started, setStarted] = useState(false);
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeChoice, setActiveChoice] = useState(null);
  const [chosenPath, setChosenPath] = useState([]);
  const [activeNarration, setActiveNarration] = useState('');
  const [narrationKey, setNarrationKey] = useState(0);
  const [showVideoInsert, setShowVideoInsert] = useState(null);
  const [ended, setEnded] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [endStage, setEndStage] = useState(0);

  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);
  const seenChoicesRef = useRef(new Set());
  const lastNarrationRef = useRef('');

  // 시간 진행
  useEffect(() => {
    if (!started) return;
    let raf;
    const tick = (now) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      if (!paused) {
        const elapsed = (now - startTimeRef.current) / 1000 + pausedAtRef.current;
        if (elapsed >= scenario.duration) { setT(scenario.duration); setEnded(true); return; }
        setT(elapsed);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, scenario.duration, started]);

  useEffect(() => {
    if (!ended) return;
    const t1 = setTimeout(() => setEndStage(1), 500);
    const t2 = setTimeout(() => setEndStage(2), 1400);
    const t3 = setTimeout(() => setEndStage(3), 2400);
    const t4 = setTimeout(() => setEndStage(4), 3400);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [ended]);

  // 큐 처리
  useEffect(() => {
    if (!started) return;
    const { cue } = findActiveCue(scenario.timeline, t);
    if (!cue) return;
    if (cue.narration && cue.narration !== lastNarrationRef.current) {
      setActiveNarration(cue.narration);
      setNarrationKey((k) => k + 1);
      lastNarrationRef.current = cue.narration;
    }
    setActiveHotspot(cue.hotspot ? scenario.hotspots[cue.hotspot] : null);
    if (cue.videoInsert && t < cue.t + (cue.duration || 4)) {
      setShowVideoInsert({ subtitle: cue.subtitle || '[INSERT]' });
    } else if (showVideoInsert) {
      setShowVideoInsert(null);
    }
    if (cue.choice && !seenChoicesRef.current.has(cue.choice)) {
      seenChoicesRef.current.add(cue.choice);
      setActiveChoice({ id: cue.choice, ...scenario.choices[cue.choice] });
      setPaused(true);
    }
  }, [t, scenario, started, showVideoInsert]);

  const handleChoiceSelect = (option) => {
    setChosenPath((p) => [...p, option]);
    setActiveChoice(null);
    pausedAtRef.current = t;
    startTimeRef.current = null;
    setPaused(false);
  };

  const handleRestart = () => {
    pausedAtRef.current = 0;
    startTimeRef.current = null;
    seenChoicesRef.current = new Set();
    lastNarrationRef.current = '';
    setT(0); setChosenPath([]); setEnded(false); setEndStage(0); setPaused(false);
  };

  const consequenceTags = chosenPath.map((p) => p.consequence);
  const progress = Math.min(100, (t / scenario.duration) * 100);
  const finalConsequence = chosenPath.length > 0 ? chosenPath[chosenPath.length - 1].consequence : null;
  const endingTitle = finalConsequence ? scenario.consequences[finalConsequence]?.endingTitle : null;
  const { idx: cueIdx } = findActiveCue(scenario.timeline, t);

  const cameraCues = scenario.timeline.filter((c) => c.camera);
  const currentChapterIdx = Math.max(0, cameraCues.findIndex((c, i, arr) => c.t <= t && (!arr[i+1] || arr[i+1].t > t)));

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000', overflow: 'hidden',
      fontFamily: '-apple-system,sans-serif',
    }}>
      {/* 3D 캔버스 */}
      <Canvas
        camera={{ position: [16, 9, 16], fov: 35, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 1.1 }}
        shadows
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#020617', 25, 75]} />
          <DioramaScene consequences={consequenceTags} />
          <CameraRig scenario={scenario} currentT={t} />
          <EffectComposer>
            <DepthOfField focusDistance={0.08} focalLength={0.12} bokehScale={1.2} height={360} />
            <Bloom intensity={0.5} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
            <ChromaticAberration offset={[0.0005, 0.0005]} blendFunction={BlendFunction.NORMAL} />
            <Noise opacity={0.035} blendFunction={BlendFunction.MULTIPLY} />
            <Vignette eskil={false} offset={0.2} darkness={0.82} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* 시작 게이트 */}
      {!started && <StartGateInk scenario={scenario} onStart={() => setStarted(true)} />}

      {started && !ended && (
        <>
          {/* ════ 상단 바 — INK 로고 + 탭 + 에이전트 ════ */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            ...glass({ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }),
            zIndex: 6,
          }}>
            {/* 로고 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, height: 28,
                border: '1.5px solid #fefefe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...text(11, 800),
              }}>R</div>
              <div style={{ ...text(11, 800, 4) }}>ROOT14 · APT</div>
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', gap: 28 }}>
              {['BRIEFING', 'DIORAMA', 'INTEL', 'DEBRIEF'].map((tab, i) => (
                <div key={tab} style={{
                  ...text(11, 700, 3),
                  color: i === 1 ? '#fefefe' : 'rgba(255,255,255,0.4)',
                  borderBottom: i === 1 ? '2px solid #fbbf24' : '2px solid transparent',
                  paddingBottom: 4,
                  cursor: 'pointer',
                }}>{tab}</div>
              ))}
            </div>

            {/* 에이전트 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...text(11, 700, 1) }}>AGENT_OBSERVER</div>
                <Lbl sx={{ marginTop: 2 }}>ID · 7X9K2L</Lbl>
              </div>
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #fbbf24, #dc2626)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...text(13, 800), color: '#000',
              }}>R</div>
              <button
                onClick={() => navigate('/apt/scenarios')}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.6)', padding: '6px 12px',
                  cursor: 'pointer', ...text(10, 700, 2), fontFamily: 'monospace',
                }}
              >ESC</button>
            </div>
          </div>

          {/* ════ 좌측: TIMELINE 챕터 리스트 ════ */}
          <div style={{
            position: 'absolute',
            left: 28, top: '12vh', bottom: '12vh',
            width: 280,
            ...glass({ padding: 20, display: 'flex', flexDirection: 'column' }),
            zIndex: 5,
          }}>
            <Lbl>▎ TIMELINE</Lbl>
            <div style={{ ...text(15, 700, 0.5), marginTop: 6, marginBottom: 18 }}>SCENE FLOW</div>

            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cameraCues.map((c, i) => {
                const active = i === currentChapterIdx;
                const past = i < currentChapterIdx;
                return (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: active ? '#fefefe' : 'transparent',
                    color: active ? '#000' : (past ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)'),
                    borderLeft: active ? '3px solid #fbbf24' : '3px solid transparent',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span style={{
                      ...text(10, 700, 1),
                      fontFamily: 'monospace',
                      width: 24,
                      color: active ? '#000' : (past ? 'rgba(255,255,255,0.3)' : 'rgba(251,191,36,0.7)'),
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...text(11, active ? 700 : 500, 1), textTransform: 'uppercase' }}>
                        {c.camera.replace(/_/g, ' ')}
                      </div>
                      <div style={{ ...text(9, 500), color: active ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: 2 }}>
                        T+{String(c.t).padStart(2, '0')}s
                      </div>
                    </div>
                    {past && <span style={{ ...text(10, 700), color: 'rgba(255,255,255,0.3)' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════ 우측: ATT&CK 인텔 패널 ════ */}
          <div style={{
            position: 'absolute',
            right: 28, top: '12vh',
            width: 300,
            ...glass({ padding: 20 }),
            zIndex: 5,
          }}>
            <Lbl>▎ MITRE ATT&CK</Lbl>
            <div style={{ ...text(15, 700), marginTop: 6, marginBottom: 18 }}>TACTICS DECODED</div>

            {(scenario.principles?.relevance || []).map((r) => {
              const used = chosenPath.some((p) => p.tag === r.label);
              return (
                <div key={r.label} style={{
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 56, padding: '4px 0',
                    textAlign: 'center',
                    background: used ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                    color: used ? '#000' : 'rgba(255,255,255,0.6)',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    fontFamily: 'monospace',
                  }}>{r.label}</div>
                  <div style={{ ...text(11, 400), color: 'rgba(255,255,255,0.55)', flex: 1, lineHeight: 1.3 }}>{r.note}</div>
                </div>
              );
            })}
          </div>

          {/* ════ 우측 하단: 핫스팟 인디케이터 ════ */}
          {activeHotspot && (
            <div style={{
              position: 'absolute',
              right: 28, bottom: '12vh',
              width: 300,
              ...glass({ padding: 16, borderColor: 'rgba(251,191,36,0.4)' }),
              zIndex: 5,
              animation: 'inkFadeIn 0.5s ease-out',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', animation: 'inkBlink 1s ease-in-out infinite' }}/>
                <Lbl sx={{ color: '#fbbf24' }}>HOTSPOT DETECTED</Lbl>
              </div>
              <div style={{ ...text(13, 600), marginTop: 8 }}>{activeHotspot.tooltip}</div>
            </div>
          )}

          {/* ════ 자막 (하단 중앙) ════ */}
          {activeNarration && !showVideoInsert && !activeChoice && (
            <div
              key={narrationKey}
              style={{
                position: 'absolute',
                bottom: '14vh', left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '50%',
                textAlign: 'center',
                ...glassDark({ padding: '14px 28px' }),
                animation: 'subtitleSlide 0.6s ease-out',
                zIndex: 6,
              }}>
              <style>{`
                @keyframes subtitleSlide { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
              `}</style>
              <div style={{ ...text(15, 400), letterSpacing: 0.3, lineHeight: 1.5 }}>
                {activeNarration}
              </div>
            </div>
          )}

          {/* ════ 하단: 진행 + 컨트롤 ════ */}
          <div style={{
            position: 'absolute',
            bottom: 24, left: 28, right: 28,
            ...glass({ padding: '14px 20px' }),
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            zIndex: 6,
          }}>
            <button
              onClick={() => setPaused((p) => !p)}
              style={{
                width: 36, height: 36,
                background: '#fefefe', color: '#000',
                border: 'none',
                cursor: 'pointer',
                ...text(13, 800),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {paused ? '▶' : '❚❚'}
            </button>

            <Lbl sx={{ minWidth: 72 }}>SCENE {String(currentChapterIdx + 1).padStart(2, '0')} / {String(cameraCues.length).padStart(2, '0')}</Lbl>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 6 }}>
              {/* 세그먼트 진행 */}
              {cameraCues.map((c, i) => {
                const next = cameraCues[i + 1];
                const segStart = c.t;
                const segEnd = next ? next.t : scenario.duration;
                const segProg = Math.max(0, Math.min(1, (t - segStart) / (segEnd - segStart)));
                return (
                  <div key={i} style={{ flex: segEnd - segStart, height: 4, background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
                    <div style={{
                      width: `${segProg * 100}%`,
                      height: '100%',
                      background: i < currentChapterIdx ? 'rgba(251,191,36,0.45)' : '#fbbf24',
                      boxShadow: i === currentChapterIdx ? '0 0 8px rgba(251,191,36,0.8)' : 'none',
                      transition: 'width 0.1s linear',
                    }}/>
                  </div>
                );
              })}
            </div>

            <div style={{ ...text(11, 700, 2), fontFamily: 'monospace', minWidth: 70, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
              {String(Math.floor(t)).padStart(2, '0')} / {scenario.duration}s
            </div>
          </div>
        </>
      )}

      {/* CCTV 인서트 */}
      {showVideoInsert && (
        <div style={{
          position: 'absolute', inset: 0, background: '#0a0a0a',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          color: '#a3a3a3', fontFamily: 'monospace', zIndex: 10, overflow: 'hidden',
        }}>
          <style>{`
            @keyframes cctvFlicker { 0%,92%,94%,100% { opacity: 1 } 93% { opacity: 0.6 } }
            @keyframes scanlineMove { 0% { transform: translateY(-30%) } 100% { transform: translateY(130%) } }
          `}</style>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'2.5\' /><feColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0\'/></filter><rect width=\'400\' height=\'400\' filter=\'url(%23n)\'/></svg>")',
            opacity: 0.12, mixBlendMode: 'screen',
            animation: 'cctvFlicker 4s ease-in-out infinite',
          }}/>
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 80,
            background: 'linear-gradient(transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            animation: 'scanlineMove 4s linear infinite',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
          }}/>
          <div style={{ position: 'absolute', top: '8vh', left: 24, fontSize: 11, letterSpacing: 4, color: '#dc2626' }}>
            ● REC
          </div>
          <div style={{ fontSize: 28, fontWeight: 200, color: '#d4d4d4', letterSpacing: 8, opacity: 0.8 }}>
            {showVideoInsert.subtitle}
          </div>
        </div>
      )}

      {/* 분기 결정 */}
      {activeChoice && <ChoiceInk choice={activeChoice} onSelect={handleChoiceSelect} />}

      {/* 종료 화면 */}
      {ended && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(5,8,16,0.95) 0%, rgba(0,0,0,0.98) 100%)',
          display: 'flex',
          zIndex: 20,
        }}>
          <div style={{ flex: 1, padding: '8vh 6vw', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {endStage >= 1 && (
              <div style={{ animation: 'inkFadeIn 0.7s ease-out' }}>
                <Lbl>▎ CASE CLOSED</Lbl>
                <div style={{ ...text('clamp(36px, 6vw, 64px)', 100, -1.5), marginTop: 12, lineHeight: 1.05 }}>
                  {scenario.title}
                </div>
                {endingTitle && (
                  <div style={{ ...text('clamp(15px, 1.6vw, 19px)', 300), color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', marginTop: 12 }}>
                    &ldquo;{endingTitle}&rdquo;
                  </div>
                )}
                <div style={{ width: 64, height: 1, background: '#fbbf24', margin: '32px 0', animation: 'inkLine 0.8s ease-out 0.3s both' }}/>
              </div>
            )}

            {endStage >= 2 && chosenPath.length > 0 && (
              <div style={{ animation: 'inkFadeIn 0.7s ease-out', marginBottom: 32 }}>
                <Lbl>YOUR PATH</Lbl>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {chosenPath.map((p, i) => (
                    <div key={i} style={{ ...glass({ padding: '10px 16px' }), display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ ...text(10, 800, 1), color: '#fbbf24', fontFamily: 'monospace' }}>{p.tag}</span>
                      <span style={{ ...text(12, 500) }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {endStage >= 4 && (
              <div style={{ display: 'flex', gap: 12, animation: 'inkFadeIn 0.7s ease-out' }}>
                <button onClick={handleRestart} style={{
                  background: '#fefefe', color: '#000', border: 'none',
                  padding: '18px 32px', ...text(12, 800, 4), cursor: 'pointer',
                }}>↻ REPLAY</button>
                <button onClick={() => navigate('/apt/scenarios')} style={{
                  background: 'transparent', color: '#fefefe',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '18px 32px', ...text(12, 800, 4), cursor: 'pointer',
                }}>EXIT</button>
              </div>
            )}
          </div>

          {endStage >= 3 && (
            <div style={{
              flex: '0 0 38%',
              padding: '8vh 4vw',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column', gap: 14,
              animation: 'inkFadeIn 0.7s ease-out',
            }}>
              <Lbl>▶ NEXT IN SERIES</Lbl>
              <div style={{ ...text(22, 600, 0.5), lineHeight: 1.3 }}>
                {scenario.principles?.coherence?.nextTitle}
              </div>
              <div style={{ ...text(13, 400), color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                {scenario.principles?.coherence?.nextHint}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

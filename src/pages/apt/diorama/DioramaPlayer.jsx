/**
 * DioramaPlayer — Phase 1.5 폴리싱
 * 추가: StartGate · 자막 페이드 · 헤더 자동숨김 · 종료 단계화 · consequence 적용
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import { useScenario } from './useScenario';
import DioramaScene from './DioramaScene';
import CameraRig from './CameraRig';
import Hotspot from './Hotspot';
import ChoiceOverlay from './ChoiceOverlay';
import StartGate from './StartGate';

function findActiveCue(timeline, t) {
  let active = null;
  for (const c of timeline) {
    if (c.t <= t) active = c;
    else break;
  }
  return active;
}

export default function DioramaPlayer() {
  const { scenarioId = 'c0024' } = useParams();
  const navigate = useNavigate();
  const scenario = useScenario(scenarioId);

  const [started, setStarted] = useState(false);
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeChoice, setActiveChoice] = useState(null);
  const [chosenPath, setChosenPath] = useState([]);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeNarration, setActiveNarration] = useState('');
  const [narrationKey, setNarrationKey] = useState(0); // 페이드 애니메이션 트리거
  const [showVideoInsert, setShowVideoInsert] = useState(null);
  const [ended, setEnded] = useState(false);
  const [endStage, setEndStage] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);
  const seenChoicesRef = useRef(new Set());
  const lastNarrationRef = useRef('');
  const headerHideTimer = useRef(null);
  const controlsHideTimer = useRef(null);

  // ── 시간 진행 (started만) ─────────────────
  useEffect(() => {
    if (!started) return;
    let raf;
    const tick = (now) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      if (!paused) {
        const elapsed = (now - startTimeRef.current) / 1000 + pausedAtRef.current;
        if (elapsed >= scenario.duration) {
          setT(scenario.duration);
          setEnded(true);
          return;
        }
        setT(elapsed);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, scenario.duration, started]);

  // ── 헤더 자동 숨김 (시작 후 4초) ─────────
  useEffect(() => {
    if (!started) return;
    headerHideTimer.current = setTimeout(() => setShowHeader(false), 4000);
    return () => clearTimeout(headerHideTimer.current);
  }, [started]);

  // ── 종료 단계화 페이드 ────────────────────
  useEffect(() => {
    if (!ended) return;
    setEndStage(0);
    const t1 = setTimeout(() => setEndStage(1), 600);
    const t2 = setTimeout(() => setEndStage(2), 1800);
    const t3 = setTimeout(() => setEndStage(3), 3000);
    const t4 = setTimeout(() => setEndStage(4), 4200);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [ended]);

  // ── 큐 처리 ──────────────────────────────
  useEffect(() => {
    if (!started) return;
    const cue = findActiveCue(scenario.timeline, t);
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
      const choice = scenario.choices[cue.choice];
      setActiveChoice({ id: cue.choice, ...choice });
      setPaused(true);
    }
  }, [t, scenario, showVideoInsert, started]);

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
    setT(0);
    setChosenPath([]);
    setEnded(false);
    setEndStage(0);
    setPaused(false);
  };

  // ── 마우스 움직이면 컨트롤 표시 ──────────
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsHideTimer.current);
    controlsHideTimer.current = setTimeout(() => setShowControls(false), 2200);
  };

  // ── 키보드 단축키 ────────────────────────
  useEffect(() => {
    if (!started || activeChoice || ended) return;
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, activeChoice, ended]);

  // ── consequence 누적 → DioramaScene 전달 ─
  const consequenceTags = chosenPath.map((p) => p.consequence);

  const progress = Math.min(100, (t / scenario.duration) * 100);

  // ── 종료 결과 텍스트 ─────────────────────
  const finalConsequence = chosenPath.length > 0 ? chosenPath[chosenPath.length - 1].consequence : null;
  const endingTitle = finalConsequence ? scenario.consequences[finalConsequence]?.endingTitle : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        overflow: 'hidden',
        fontFamily: '-apple-system,sans-serif',
        cursor: showControls || activeChoice || ended ? 'auto' : 'none',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* ── 3D 캔버스 ─────────────────────── */}
      <Canvas
        camera={{ position: [16, 9, 16], fov: 35, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: 4 /* ACESFilmic */, toneMappingExposure: 1.1 }}
        shadows
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#020617', 25, 75]} />
          <DioramaScene consequences={consequenceTags} />
          <CameraRig scenario={scenario} currentT={t} />
          {activeHotspot && (
            <Hotspot pos={activeHotspot.pos} tooltip={activeHotspot.tooltip} />
          )}
          <EffectComposer>
            <DepthOfField focusDistance={0.08} focalLength={0.12} bokehScale={1.2} height={360} />
            <Bloom intensity={0.5} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
            <ChromaticAberration offset={[0.0005, 0.0005]} blendFunction={BlendFunction.NORMAL} />
            <Noise opacity={0.035} blendFunction={BlendFunction.MULTIPLY} />
            <Vignette eskil={false} offset={0.2} darkness={0.82} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* ── 시작 게이트 ─────────────────────── */}
      {!started && (
        <StartGate scenario={scenario} onStart={() => setStarted(true)} />
      )}

      {/* ── 영화 레터박스 (위·아래 검은 바) ── */}
      {started && !ended && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '6vh', background: '#000', pointerEvents: 'none', zIndex: 5,
            transition: 'height 0.6s',
          }}/>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '6vh', background: '#000', pointerEvents: 'none', zIndex: 5,
            transition: 'height 0.6s',
          }}/>
        </>
      )}

      {/* ── 헤더 (4초 후 자동 페이드) ──────── */}
      {started && !ended && (
        <div style={{
          position: 'absolute',
          top: '7vh', left: 28, right: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          opacity: showHeader ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
          zIndex: 6,
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#475569', letterSpacing: 4, fontFamily: 'monospace' }}>
              APT DIORAMA · {scenarioId.toUpperCase()}
            </div>
            <div style={{ fontSize: 14, fontWeight: 300, color: '#cbd5e1', letterSpacing: 0.5, marginTop: 4 }}>
              {scenario.title}
            </div>
          </div>
          <button
            onClick={() => navigate('/apt/scenarios')}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(100,116,139,0.4)',
              color: '#94a3b8',
              padding: '4px 10px',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: 'monospace',
            }}
          >
            ESC · 닫기
          </button>
        </div>
      )}

      {/* ── 자막 (페이드 애니메이션) ────────── */}
      {started && activeNarration && !showVideoInsert && !activeChoice && !ended && (
        <div
          key={narrationKey}
          style={{
            position: 'absolute',
            bottom: '12vh',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '70%',
            textAlign: 'center',
            color: '#fefefe',
            fontSize: 'clamp(14px, 1.6vw, 18px)',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: 0.3,
            textShadow: '0 2px 12px rgba(0,0,0,0.95), 0 0 32px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            zIndex: 6,
            animation: 'subtitleFade 0.6s ease-out',
          }}>
          <style>{`
            @keyframes subtitleFade {
              from { opacity: 0; transform: translate(-50%, 8px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
          {activeNarration}
        </div>
      )}

      {/* ── CCTV 인서트 (흑백 + 노이즈) ──── */}
      {showVideoInsert && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#a3a3a3',
          fontFamily: 'monospace',
          zIndex: 10,
          overflow: 'hidden',
        }}>
          <style>{`
            @keyframes cctvFlicker {
              0%, 100% { opacity: 1 }
              92% { opacity: 1 }
              93% { opacity: 0.7 }
              94% { opacity: 1 }
            }
            @keyframes scanlineMove {
              0% { transform: translateY(-30%) }
              100% { transform: translateY(130%) }
            }
            @keyframes cctvNoise {
              0%,100% { background-position: 0 0 }
              25% { background-position: 8% 12% }
              50% { background-position: -5% 7% }
              75% { background-position: 6% -8% }
            }
          `}</style>
          {/* 노이즈 텍스처 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'2.5\' /><feColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0\'/></filter><rect width=\'400\' height=\'400\' filter=\'url(%23n)\'/></svg>")',
            opacity: 0.12,
            mixBlendMode: 'screen',
            animation: 'cctvNoise 0.15s steps(3) infinite, cctvFlicker 4s ease-in-out infinite',
          }}/>
          {/* 스캔라인 */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            height: 80,
            background: 'linear-gradient(transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            animation: 'scanlineMove 4s linear infinite',
          }}/>
          {/* 가로 스캔 줄 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
            pointerEvents: 'none',
          }}/>

          <div style={{ position: 'absolute', top: '8vh', left: 24, fontSize: 11, letterSpacing: 4, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', animation: 'cctvFlicker 1s ease-in-out infinite' }}/>
            REC
          </div>
          <div style={{ position: 'absolute', top: '8vh', right: 24, fontSize: 11, letterSpacing: 2, color: '#737373' }}>
            2024-03-14 23:51:08
          </div>

          <div style={{ fontSize: 28, fontWeight: 200, color: '#d4d4d4', letterSpacing: 8, opacity: 0.8 }}>
            {showVideoInsert.subtitle}
          </div>
        </div>
      )}

      {/* ── 분기 결정 ──────────────────────── */}
      {activeChoice && (
        <ChoiceOverlay choice={activeChoice} onSelect={handleChoiceSelect} />
      )}

      {/* ── 종료 화면 (단계화 페이드) ─────── */}
      {ended && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.85) 0%, rgba(0,0,0,0.98) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#e2e8f0',
          padding: 40,
          textAlign: 'center',
          zIndex: 20,
        }}>
          <style>{`
            @keyframes endFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>

          {endStage >= 1 && (
            <div style={{ animation: 'endFade 0.8s ease-out' }}>
              <div style={{ fontSize: 11, color: '#fbbf24', letterSpacing: 6, marginBottom: 14, fontFamily: 'monospace' }}>
                ▎CASE CLOSED
              </div>
              <div style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 200, marginBottom: 6, letterSpacing: -0.5 }}>
                {scenario.title}
              </div>
              {endingTitle && (
                <div style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: '#94a3b8', fontStyle: 'italic', marginBottom: 32, fontWeight: 300 }}>
                  &ldquo;{endingTitle}&rdquo;
                </div>
              )}
            </div>
          )}

          {endStage >= 2 && chosenPath.length > 0 && (
            <div style={{ animation: 'endFade 0.8s ease-out', marginBottom: 32, maxWidth: 600 }}>
              <div style={{ fontSize: 10, color: '#475569', letterSpacing: 3, marginBottom: 10, fontFamily: 'monospace' }}>
                YOUR PATH
              </div>
              {chosenPath.map((p, i) => (
                <div key={i} style={{
                  display: 'inline-block',
                  background: 'rgba(15,23,42,0.6)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(100,116,139,0.3)',
                  padding: '8px 14px',
                  borderRadius: 4,
                  margin: '4px',
                  fontSize: 12,
                }}>
                  <span style={{ color: '#fbbf24', fontFamily: 'monospace', marginRight: 10, fontWeight: 700 }}>{p.tag}</span>
                  <span style={{ color: '#cbd5e1' }}>{p.label}</span>
                </div>
              ))}
            </div>
          )}

          {endStage >= 3 && (
            <div style={{
              animation: 'endFade 0.8s ease-out',
              padding: 20,
              background: 'rgba(30,41,59,0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px dashed rgba(251,191,36,0.3)',
              borderRadius: 6,
              maxWidth: 560,
              marginBottom: 28,
            }}>
              <div style={{ fontSize: 10, color: '#475569', letterSpacing: 3, marginBottom: 8, fontFamily: 'monospace' }}>
                ▶ NEXT EPISODE
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1', letterSpacing: 0.5 }}>
                {scenario.principles.coherence.nextTitle}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, fontStyle: 'italic' }}>
                {scenario.principles.coherence.nextHint}
              </div>
            </div>
          )}

          {endStage >= 4 && (
            <div style={{ display: 'flex', gap: 12, animation: 'endFade 0.8s ease-out' }}>
              <button onClick={handleRestart} style={btn('#fbbf24', '#451a03')}>↻ 다시 보기</button>
              <button onClick={() => navigate('/apt/scenarios')} style={btn('transparent', '#cbd5e1', { border: '1px solid #475569' })}>시나리오 허브</button>
            </div>
          )}
        </div>
      )}

      {/* ── 진행 바 (마우스 움직임시만) ────── */}
      {started && !ended && (
        <div style={{
          position: 'absolute',
          bottom: '7vh',
          left: 28,
          right: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.4s',
          pointerEvents: showControls ? 'auto' : 'none',
          zIndex: 7,
        }}>
          <button
            onClick={() => setPaused((p) => !p)}
            disabled={!!activeChoice}
            style={{
              width: 28, height: 28, padding: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(100,116,139,0.4)',
              color: '#cbd5e1',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            {paused ? '▶' : '❚❚'}
          </button>
          <div style={{
            flex: 1,
            height: 1,
            background: 'rgba(100,116,139,0.3)',
            position: 'relative',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: '#fbbf24',
              boxShadow: '0 0 8px rgba(251,191,36,0.8)',
              transition: 'width 0.1s linear',
            }}/>
          </div>
          <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', minWidth: 56, textAlign: 'right', letterSpacing: 1 }}>
            {String(Math.floor(t)).padStart(2, '0')} / {scenario.duration}
          </div>
        </div>
      )}
    </div>
  );
}

function btn(bg, fg, extra = {}) {
  return {
    background: bg,
    color: fg,
    border: 'none',
    padding: '12px 28px',
    borderRadius: 3,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: 'monospace',
    ...extra,
  };
}

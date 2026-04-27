/**
 * DioramaPlayer — Phase 1 PoC
 * - 75초 자동 재생, 카메라 자동 무빙, 자막 표시, 분기 정지·선택
 * - 박스 placeholder 디오라마 (Phase 3에서 GLB 교체)
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import scenarioData from './data/c0024.scenario.json';
import DioramaScene from './DioramaScene';
import CameraRig from './CameraRig';
import Hotspot from './Hotspot';
import ChoiceOverlay from './ChoiceOverlay';

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
  const scenario = scenarioData; // Phase 1: c0024 고정. Phase 2에서 동적 로드

  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeChoice, setActiveChoice] = useState(null);
  const [chosenPath, setChosenPath] = useState([]);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeNarration, setActiveNarration] = useState('');
  const [showVideoInsert, setShowVideoInsert] = useState(null);
  const [ended, setEnded] = useState(false);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);
  const seenChoicesRef = useRef(new Set());

  // ── 메인 시간 진행 루프 (RAF) ─────────────────
  useEffect(() => {
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
  }, [paused, scenario.duration]);

  // ── 큐 변화 감지 → 분기·자막·핫스팟·인서트 처리 ─
  useEffect(() => {
    const cue = findActiveCue(scenario.timeline, t);
    if (!cue) return;

    // 자막
    if (cue.narration) setActiveNarration(cue.narration);

    // 핫스팟 활성
    setActiveHotspot(cue.hotspot ? scenario.hotspots[cue.hotspot] : null);

    // 영상 인서트 (Phase 1: 검은 화면 + 자막으로 시뮬레이션)
    if (cue.videoInsert && t < cue.t + (cue.duration || 4)) {
      setShowVideoInsert({ subtitle: cue.subtitle || '[INSERT]' });
    } else if (showVideoInsert) {
      setShowVideoInsert(null);
    }

    // 분기 — 한 번만 트리거 + 일시정지
    if (cue.choice && !seenChoicesRef.current.has(cue.choice)) {
      seenChoicesRef.current.add(cue.choice);
      const choice = scenario.choices[cue.choice];
      setActiveChoice({ id: cue.choice, ...choice });
      setPaused(true);
    }
  }, [t, scenario, showVideoInsert]);

  const handleChoiceSelect = (option) => {
    setChosenPath((p) => [...p, option]);
    setActiveChoice(null);
    // 일시정지 해제 (시작 기준 시각 재계산)
    pausedAtRef.current = t;
    startTimeRef.current = null;
    setPaused(false);
  };

  const handleRestart = () => {
    pausedAtRef.current = 0;
    startTimeRef.current = null;
    seenChoicesRef.current = new Set();
    setT(0);
    setChosenPath([]);
    setEnded(false);
    setPaused(false);
  };

  // ── 진행률 ─────────────────────────────────
  const progress = Math.min(100, (t / scenario.duration) * 100);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      overflow: 'hidden',
      fontFamily: '-apple-system,sans-serif',
    }}>
      {/* ── 3D 캔버스 ────────────────────────── */}
      <Canvas
        camera={{ position: [16, 9, 16], fov: 35, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: 4 /* ACESFilmic */ }}
        shadows
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#020617', 15, 40]} />
          <DioramaScene />
          <CameraRig scenario={scenario} currentT={t} />
          {activeHotspot && (
            <Hotspot pos={activeHotspot.pos} tooltip={activeHotspot.tooltip} />
          )}
          <EffectComposer>
            <Bloom intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
            <ChromaticAberration offset={[0.0008, 0.0008]} blendFunction={BlendFunction.NORMAL} />
            <Vignette eskil={false} offset={0.15} darkness={0.85} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* ── 헤더 (제목 + 닫기) ─────────────────── */}
      <div style={{
        position: 'absolute',
        top: 16, left: 20, right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 2, fontFamily: 'monospace' }}>
            APT DIORAMA · {scenarioId.toUpperCase()}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', textShadow: '0 2px 8px #000' }}>
            {scenario.title}
          </div>
        </div>
        <button
          onClick={() => navigate('/apt/scenarios')}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid #475569',
            color: '#cbd5e1',
            padding: '6px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ✕ 닫기
        </button>
      </div>

      {/* ── 자막 ──────────────────────────── */}
      {activeNarration && !showVideoInsert && !activeChoice && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '80%',
          textAlign: 'center',
          padding: '12px 24px',
          background: 'rgba(0,0,0,0.6)',
          color: '#fefefe',
          fontSize: 18,
          fontWeight: 500,
          borderRadius: 6,
          textShadow: '0 2px 8px #000',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
        }}>
          {activeNarration}
        </div>
      )}

      {/* ── 영상 인서트 (Phase 1: 검은 화면 시뮬레이션) ── */}
      {showVideoInsert && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#dc2626',
          fontFamily: 'monospace',
          animation: 'flicker 0.15s infinite',
        }}>
          <style>{`
            @keyframes flicker {
              0%, 100% { opacity: 0.95 }
              50% { opacity: 1 }
            }
            @keyframes scanline {
              0% { transform: translateY(-100%) }
              100% { transform: translateY(100vh) }
            }
          `}</style>
          {/* 스캔라인 효과 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(transparent 0%, rgba(220,38,38,0.1) 50%, transparent 100%)',
            height: 100,
            animation: 'scanline 2s linear infinite',
          }}/>
          <div style={{ fontSize: 14, marginBottom: 16, letterSpacing: 4 }}>● REC</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fca5a5' }}>{showVideoInsert.subtitle}</div>
          <div style={{ fontSize: 12, marginTop: 16, color: '#7f1d1d' }}>
            (Phase 3에서 Runway 4초 영상으로 교체)
          </div>
        </div>
      )}

      {/* ── 분기 결정 오버레이 ───────────────── */}
      {activeChoice && (
        <ChoiceOverlay choice={activeChoice} onSelect={handleChoiceSelect} />
      )}

      {/* ── 종료 화면 ──────────────────────── */}
      {ended && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#e2e8f0',
          padding: 40,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#fbbf24', letterSpacing: 4, marginBottom: 12, fontFamily: 'monospace' }}>
            CASE CLOSED
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{scenario.title}</div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>{scenario.subtitle}</div>

          {chosenPath.length > 0 && (
            <div style={{ marginBottom: 24, maxWidth: 600 }}>
              <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>당신의 결정</div>
              {chosenPath.map((p, i) => (
                <div key={i} style={{
                  display: 'inline-block',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  padding: '6px 12px',
                  borderRadius: 4,
                  margin: '4px',
                  fontSize: 13,
                }}>
                  <span style={{ color: '#fbbf24', fontFamily: 'monospace', marginRight: 6 }}>{p.tag}</span>
                  {p.label}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, padding: 16, background: 'rgba(30,41,59,0.6)', borderRadius: 6, maxWidth: 600 }}>
            <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 2, marginBottom: 6 }}>다음 디오라마 (예정)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#cbd5e1' }}>{scenario.principles.coherence.nextTitle}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{scenario.principles.coherence.nextHint}</div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={handleRestart} style={btn('#fbbf24', '#451a03')}>↻ 다시 보기</button>
            <button onClick={() => navigate('/apt/scenarios')} style={btn('#475569', '#e2e8f0')}>시나리오 허브</button>
          </div>
        </div>
      )}

      {/* ── 진행 바 + 컨트롤 ──────────────── */}
      {!ended && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'auto',
        }}>
          <button
            onClick={() => setPaused((p) => !p)}
            disabled={!!activeChoice}
            style={btn('#1e293b', '#cbd5e1', { width: 32, height: 32, padding: 0, opacity: activeChoice ? 0.4 : 1 })}
          >
            {paused ? '▶' : '❚❚'}
          </button>
          <div style={{
            flex: 1,
            height: 4,
            background: '#1e293b',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #1e40af, #7c3aed)',
              transition: 'width 0.1s linear',
            }}/>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', minWidth: 56, textAlign: 'right' }}>
            {String(Math.floor(t)).padStart(2, '0')}s / {scenario.duration}s
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
    padding: '10px 16px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    ...extra,
  };
}

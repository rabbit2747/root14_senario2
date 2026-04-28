/**
 * PreMissionRecon — 시네마틱 시작 전 정찰 화면
 * - 좌측: 케이스 메타 (제목·부제·출연·태그)
 * - 우측 (메인): Voxel 은행 디오라마 + HUD
 * - 하단: PROCEED 버튼 (pixel-border)
 * - GSAP 타임라인으로 단계별 페이드인
 * - StartGate 역할 대체. PRESS PLAY 후 시네마틱 진입
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { motion } from 'framer-motion';

import VoxelBankDiorama, { VOXEL_COUNT_ESTIMATE } from './VoxelBankDiorama';
import MissionHUD from './MissionHUD';

const FONT_PIXEL = '"Press Start 2P", monospace';
const FONT_LABEL = '"Silkscreen", monospace';

// 픽셀 보더 (계단식 box-shadow)
const PIXEL_BORDER = `
  inset 0 0 0 1px rgba(251,191,36,0.4),
  6px 0 0 0 rgba(0,0,0,0.85),
  -6px 0 0 0 rgba(0,0,0,0.85),
  0 6px 0 0 rgba(0,0,0,0.85),
  0 -6px 0 0 rgba(0,0,0,0.85),
  6px 6px 0 0 rgba(251,191,36,0.2),
  -6px -6px 0 0 rgba(251,191,36,0.2),
  6px -6px 0 0 rgba(251,191,36,0.2),
  -6px 6px 0 0 rgba(251,191,36,0.2)
`;

export default function PreMissionRecon({ scenario, onProceed }) {
  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const idRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const dioramaRef = useRef(null);
  const metaRef = useRef(null);
  const buttonRef = useRef(null);
  const [exiting, setExiting] = useState(false);

  // ── GSAP 입장 시퀀스 ──────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(labelRef.current,    { opacity: 0, y: -10, duration: 0.6 }, 0)
      .from(idRef.current,       { opacity: 0, y: -10, duration: 0.6 }, 0.15)
      .from(titleRef.current,    { opacity: 0, y: 20,  duration: 0.9 }, 0.35)
      .from(subtitleRef.current, { opacity: 0, y: 14,  duration: 0.8 }, 0.6)
      .from(dioramaRef.current,  { opacity: 0, scale: 0.96, duration: 1.0, ease: 'power2.out' }, 0.7)
      .from(metaRef.current,     { opacity: 0, y: 12,  duration: 0.7 }, 1.4)
      .from(buttonRef.current,   { opacity: 0, y: 14,  duration: 0.7 }, 1.8);
    return () => tl.kill();
  }, []);

  // ── 키보드 단축키 ─────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleProceed(); }
      if (e.code === 'Escape') window.history.back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleProceed = () => {
    if (exiting) return;
    setExiting(true);
    // GSAP 퇴장: 블러 + 스케일 + 페이드
    gsap.to(rootRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => onProceed?.(),
    });
    gsap.to(dioramaRef.current, {
      scale: 1.05,
      filter: 'blur(8px)',
      duration: 0.6,
      ease: 'power2.in',
    });
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        zIndex: 1000,
        fontFamily: FONT_LABEL,
        color: '#e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* 필름 그레인 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' /><feColorMatrix values=\'0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.08 0\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 100,
      }}/>

      {/* 스캔라인 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none',
        zIndex: 99,
      }}/>

      {/* ═══════════ 상단 헤더 (타이틀 영역) ═══════════ */}
      <div style={{
        padding: '32px 48px 16px',
        display: 'flex', flexDirection: 'column',
        gap: 4,
        flexShrink: 0,
      }}>
        <div ref={labelRef} style={{
          fontSize: 9, letterSpacing: 6,
          color: '#475569',
          fontFamily: FONT_LABEL,
        }}>
          APT CINEMATIC ▎ CASE FILE ▎ PRE-MISSION RECON
        </div>
        <div ref={idRef} style={{
          fontFamily: FONT_PIXEL,
          fontSize: 12, letterSpacing: 2,
          color: '#fbbf24',
          marginTop: 6,
        }}>
          ▎ {scenario.id?.toUpperCase()}
        </div>
        <div ref={titleRef} style={{
          fontSize: 'clamp(22px, 3vw, 36px)',
          fontWeight: 200,
          color: '#fefefe',
          letterSpacing: -0.5,
          marginTop: 6,
          fontFamily: '-apple-system, sans-serif',
          lineHeight: 1.2,
        }}>
          {scenario.title}
        </div>
        <div ref={subtitleRef} style={{
          fontSize: 'clamp(11px, 1.2vw, 14px)',
          color: '#64748b',
          fontStyle: 'italic',
          fontFamily: '-apple-system, sans-serif',
        }}>
          {scenario.subtitle}
        </div>
      </div>

      {/* ═══════════ 디오라마 영역 ═══════════ */}
      <div
        ref={dioramaRef}
        style={{
          flex: 1,
          margin: '0 48px',
          position: 'relative',
          background: 'linear-gradient(180deg, #020617 0%, #0a0e1a 50%, #1e293b 100%)',
          overflow: 'hidden',
          // 픽셀 보더 효과
          border: '1px solid rgba(251,191,36,0.2)',
          boxShadow: '0 0 0 4px #000, 0 0 0 5px rgba(251,191,36,0.15), 0 30px 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* 코너 마커 */}
        <CornerMark pos="tl" />
        <CornerMark pos="tr" />
        <CornerMark pos="bl" />
        <CornerMark pos="br" />

        <Canvas
          camera={{ position: [38, 22, 0], fov: 38, near: 0.1, far: 200 }}
          gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 1.05 }}
          shadows
        >
          <Suspense fallback={null}>
            <VoxelBankDiorama />
          </Suspense>
        </Canvas>

        {/* HUD 오버레이 */}
        <MissionHUD scenario={scenario} voxelCount={VOXEL_COUNT_ESTIMATE} />
      </div>

      {/* ═══════════ 하단: 메타 + PROCEED ═══════════ */}
      <div
        ref={metaRef}
        style={{
          padding: '20px 48px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 32,
          flexShrink: 0,
        }}
      >
        <div style={{
          display: 'flex',
          gap: 24,
          fontSize: 9,
          fontFamily: FONT_PIXEL,
          color: '#475569',
          letterSpacing: 1,
        }}>
          <span><span style={{ color: '#94a3b8' }}>VOICE</span>  1ST PERSON</span>
          <span><span style={{ color: '#94a3b8' }}>ASPECT</span>  21:9</span>
          <span><span style={{ color: '#94a3b8' }}>RUNTIME</span>  ~75s</span>
          <span><span style={{ color: '#94a3b8' }}>RATED</span>  APT</span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontFamily: FONT_PIXEL,
            fontSize: 9,
            color: '#334155',
            letterSpacing: 2,
          }}>
            SPACE · ENTER
          </span>
        </div>
      </div>

      {/* PROCEED 버튼 — 픽셀 스타일 */}
      <div
        ref={buttonRef}
        style={{
          padding: '0 48px 36px',
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <motion.button
          onClick={handleProceed}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          style={{
            background: '#fbbf24',
            color: '#0a0e1a',
            border: 'none',
            padding: '16px 48px',
            fontFamily: FONT_PIXEL,
            fontSize: 14,
            letterSpacing: 4,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: PIXEL_BORDER,
            minWidth: 320,
            position: 'relative',
          }}
        >
          ▶ PROCEED
        </motion.button>
      </div>
    </div>
  );
}

// 디오라마 코너 픽셀 마커
function CornerMark({ pos }) {
  const styleByPos = {
    tl: { top: 8, left: 8, borderTop: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24' },
    tr: { top: 8, right: 8, borderTop: '2px solid #fbbf24', borderRight: '2px solid #fbbf24' },
    bl: { bottom: 8, left: 8, borderBottom: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24' },
    br: { bottom: 8, right: 8, borderBottom: '2px solid #fbbf24', borderRight: '2px solid #fbbf24' },
  };
  return (
    <div style={{
      position: 'absolute',
      width: 16, height: 16,
      ...styleByPos[pos],
      pointerEvents: 'none',
      zIndex: 10,
    }}/>
  );
}

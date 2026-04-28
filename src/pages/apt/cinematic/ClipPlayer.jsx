/**
 * ClipPlayer — 영상 / 복셀 / fallback 그라디언트 디스패처
 * - clip.type === 'voxel'  → VoxelClip (Three.js)
 * - clip.src 있고 video 로드 성공 → <video>
 * - 둘 다 실패 → CSS 그라디언트 모션 fallback
 */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const VoxelClip = lazy(() => import('./VoxelClip'));

const MOTIONS = {
  'slow-pan-up':    { key: 'panUp',     dur: '12s' },
  'dolly-forward':  { key: 'dolly',     dur: '8s'  },
  'monitor-glow':   { key: 'glow',      dur: '3s'  },
  'code-scroll':    { key: 'scroll',    dur: '6s'  },
  'rapid-flicker':  { key: 'flicker',   dur: '0.4s'},
  'slow-pulse':     { key: 'pulse',     dur: '4s'  },
  'terminal-text':  { key: 'terminal',  dur: '5s'  },
  'tilt-up':        { key: 'tiltUp',    dur: '8s'  },
  'data-flow':      { key: 'flow',      dur: '3s'  },
  'shell-text':     { key: 'shell',     dur: '4s'  },
  'alert-pulse':    { key: 'alert',     dur: '0.8s'},
  'upload-bar':     { key: 'upload',    dur: '5s'  },
  'all-red':        { key: 'allRed',    dur: '2s'  },
  'fade-out-text':  { key: 'fadeOut',   dur: '5s'  },
  'newspaper-flip': { key: 'flip',      dur: '5s'  },
};

export default function ClipPlayer({ clip, playing, onEnded, fade = 1 }) {
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const fallbackTimerRef = useRef(null);

  // src 변경 시 reset
  useEffect(() => {
    setVideoFailed(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [clip?.id]);

  // playing 토글에 따라 video play/pause
  useEffect(() => {
    const v = videoRef.current;
    if (!v || videoFailed) return;
    if (playing) {
      v.play().catch(() => setVideoFailed(true));
    } else {
      v.pause();
    }
  }, [playing, videoFailed, clip?.id]);

  // fallback 타이머
  useEffect(() => {
    clearTimeout(fallbackTimerRef.current);
    if (videoFailed && playing && clip) {
      fallbackTimerRef.current = setTimeout(() => onEnded?.(), (clip.duration || 5) * 1000);
    }
    return () => clearTimeout(fallbackTimerRef.current);
  }, [videoFailed, playing, clip?.id, clip?.duration, onEnded]);

  if (!clip) return null;

  // ── 복셀 클립이면 VoxelClip으로 위임 ──
  if (clip.type === 'voxel') {
    return (
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#020617' }}/>}>
        <VoxelClip clip={clip} playing={playing} onEnded={onEnded} fade={fade} />
      </Suspense>
    );
  }

  const fb = clip.fallback || { type: 'gradient', colors: ['#020617', '#1e293b'], motion: 'slow-pan-up', icon: '·' };
  const motion = MOTIONS[fb.motion] || MOTIONS['slow-pan-up'];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: fade,
      transition: 'opacity 0.6s ease-in-out',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes panUp { from { transform: scale(1.2) translateY(2%) } to { transform: scale(1.3) translateY(-4%) } }
        @keyframes dolly { from { transform: scale(1) } to { transform: scale(1.15) } }
        @keyframes glow { 0%,100% { filter: brightness(0.85) } 50% { filter: brightness(1.15) } }
        @keyframes scroll { from { background-position: 0 0 } to { background-position: 0 -200px } }
        @keyframes flicker { 0%,100% { opacity: 0.95 } 50% { opacity: 1 } 51% { opacity: 0.7 } }
        @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.04) } }
        @keyframes terminal { 0% { opacity: 0.4 } 100% { opacity: 1 } }
        @keyframes tiltUp { from { transform: scale(1.1) translateY(8%) } to { transform: scale(1.15) translateY(-2%) } }
        @keyframes flow { 0% { background-position: 0 0 } 100% { background-position: 200px 0 } }
        @keyframes shell { 0%,100% { opacity: 0.85 } 50% { opacity: 1 } }
        @keyframes alert { 0%,100% { filter: brightness(0.9) } 50% { filter: brightness(1.4) } }
        @keyframes upload { from { background-position: -200px 0 } to { background-position: 0 0 } }
        @keyframes allRed { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.3) saturate(1.4) } }
        @keyframes fadeOut { from { opacity: 1; filter: brightness(1) } to { opacity: 0.4; filter: brightness(0.5) } }
        @keyframes flip { 0% { transform: rotateY(0deg) } 50% { transform: rotateY(8deg) } 100% { transform: rotateY(0deg) } }
      `}</style>

      {/* 비디오 (먼저 시도) */}
      {!videoFailed && clip.src && (
        <video
          ref={videoRef}
          src={clip.src}
          autoPlay={playing}
          muted
          playsInline
          preload="auto"
          onEnded={() => onEnded?.()}
          onError={() => setVideoFailed(true)}
          onCanPlay={() => { if (playing) videoRef.current?.play().catch(() => setVideoFailed(true)); }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            background: '#000',
          }}
        />
      )}

      {/* Fallback: 그라디언트 + 애니메이션 */}
      {videoFailed && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${(fb.colors || ['#020617','#1e293b']).join(', ')})`,
          backgroundSize: '200% 200%',
          animation: `${motion.key} ${motion.dur} ease-in-out ${fb.motion === 'rapid-flicker' || fb.motion === 'alert-pulse' ? 'infinite' : 'infinite alternate'}`,
        }}>
          {/* 노이즈 텍스처 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' /><feColorMatrix values=\'0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.18 0\'/></filter><rect width=\'400\' height=\'400\' filter=\'url(%23n)\'/></svg>")',
            opacity: 0.4,
            mixBlendMode: 'overlay',
          }}/>
          {/* 비네트 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none',
          }}/>
          {/* 큰 아이콘 (placeholder임을 시각적으로) */}
          {fb.icon && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(80px, 12vw, 180px)',
              opacity: 0.18,
              filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.6))',
              userSelect: 'none',
            }}>{fb.icon}</div>
          )}
          {/* 좌상단 PLACEHOLDER 라벨 */}
          <div style={{
            position: 'absolute', top: 28, left: 28,
            fontSize: 9, letterSpacing: 4,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace',
            fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '4px 8px',
          }}>
            ⚠ PLACEHOLDER · {clip.id}.mp4 미존재
          </div>
        </div>
      )}
    </div>
  );
}

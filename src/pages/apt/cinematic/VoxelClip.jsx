/**
 * VoxelClip — 시네마틱 클립 슬롯의 3D 복셀 렌더 버전
 * - clip.glb 있으면 외부 GLB 로드 (사용자가 public/voxels/*.glb 드롭)
 * - 없으면 clip.scene 프리셋으로 절차적 씬 (city-night 등)
 * - 카메라 무빙 프리셋 (slow-pan-up / dolly-forward / static-wide)
 * - duration 만료 시 onEnded 자동 호출
 */
import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import VoxelCityNight from './voxel/VoxelCityNight';

const SCENES = {
  'city-night-wide': VoxelCityNight,
};

// ── 외부 GLB 로더 (있을 때만) ────────────────
function ExternalGLB({ path }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

// ── 카메라 무빙 프리셋 ──────────────────────
function CameraRig({ preset = 'slow-pan-up', duration = 6, playing = true }) {
  const { camera } = useThree();
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
  }, [preset, duration]);

  useFrame((state) => {
    if (!playing) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = (state.clock.elapsedTime - startRef.current) / duration;
    const e = Math.min(1, Math.max(0, t));

    if (preset === 'slow-pan-up') {
      // 시작: 멀고 낮음 → 끝: 더 멀고 높음
      const x = 35 - e * 5;
      const y = 8 + e * 22;
      const z = 35 - e * 5;
      camera.position.set(x, y, z);
      camera.lookAt(0, 5, 0);
      camera.fov = 35 + e * 8;
    } else if (preset === 'dolly-forward') {
      const x = 0;
      const y = 6 - e * 1;
      const z = 30 - e * 18;
      camera.position.set(x, y, z);
      camera.lookAt(0, 4, 0);
      camera.fov = 40;
    } else if (preset === 'orbit') {
      const r = 28;
      const a = e * Math.PI * 0.4;
      camera.position.set(Math.sin(a) * r, 12, Math.cos(a) * r);
      camera.lookAt(0, 4, 0);
      camera.fov = 38;
    } else {
      // static-wide
      camera.position.set(28, 14, 28);
      camera.lookAt(0, 4, 0);
      camera.fov = 36;
    }
    camera.updateProjectionMatrix();
  });

  return null;
}

export default function VoxelClip({ clip, playing, onEnded, fade = 1 }) {
  const endTimerRef = useRef(null);
  const [glbFailed, setGlbFailed] = useState(false);

  useEffect(() => {
    setGlbFailed(false);
  }, [clip?.id]);

  useEffect(() => {
    clearTimeout(endTimerRef.current);
    if (playing && clip) {
      endTimerRef.current = setTimeout(() => onEnded?.(), (clip.duration || 6) * 1000);
    }
    return () => clearTimeout(endTimerRef.current);
  }, [playing, clip?.id, clip?.duration, onEnded]);

  if (!clip) return null;
  const useGlb = clip.glb && !glbFailed;
  const SceneComponent = SCENES[clip.scene] || VoxelCityNight;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: fade,
      transition: 'opacity 0.6s ease-in-out',
      background: 'linear-gradient(180deg, #020617 0%, #1e293b 50%, #0c4a6e 100%)',
      overflow: 'hidden',
    }}>
      <Canvas
        camera={{ position: [28, 14, 28], fov: 36, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 1.05 }}
        shadows
      >
        <fog attach="fog" args={['#020617', 22, 70]} />

        <Suspense fallback={null}>
          {useGlb ? (
            <ErrorCatcher onError={() => setGlbFailed(true)}>
              <ExternalGLB path={clip.glb} />
            </ErrorCatcher>
          ) : (
            <SceneComponent />
          )}
        </Suspense>

        <CameraRig preset={clip.cameraPreset || 'slow-pan-up'} duration={clip.duration || 6} playing={playing} />
      </Canvas>

      {/* 좌상단 라벨 */}
      <div style={{
        position: 'absolute', top: 28, left: 28,
        fontSize: 9, letterSpacing: 4,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
        fontWeight: 700,
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '4px 8px',
        background: 'rgba(0,0,0,0.4)',
      }}>
        ▎ VOXEL · {clip.glb ? 'GLB' : 'PROCEDURAL'} · {clip.scene || 'default'}
      </div>
    </div>
  );
}

// 단순 에러 경계 (GLB 로딩 실패 캐치)
class ErrorCatcher extends Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.error ? null : this.props.children; }
}

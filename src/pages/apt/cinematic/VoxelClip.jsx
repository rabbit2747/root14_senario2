/**
 * VoxelClip — 시네마틱 클립의 3D 복셀 슬롯
 * - clip.scene → SCENE_REGISTRY에서 컴포넌트 찾아 렌더 (씬 자체에 카메라·조명 포함)
 * - clip.glb 있으면 외부 GLB 우선
 * - duration 만료 시 onEnded
 */
import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { SCENE_REGISTRY } from './voxel/scenes';

function ExternalGLB({ path }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

class ErrorCatcher extends Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.error ? null : this.props.children; }
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
  const SceneComponent = SCENE_REGISTRY[clip.scene] || SCENE_REGISTRY['city-night-wide'];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: fade,
      transition: 'opacity 0.6s ease-in-out',
      background: 'linear-gradient(180deg, #020617 0%, #0a0e1a 50%, #1e293b 100%)',
      overflow: 'hidden',
    }}>
      <Canvas
        camera={{ position: [0, 5, 12], fov: 38, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 1.05 }}
        shadows
      >
        <Suspense fallback={null}>
          {useGlb ? (
            <ErrorCatcher onError={() => setGlbFailed(true)}>
              <ExternalGLB path={clip.glb} />
            </ErrorCatcher>
          ) : (
            <SceneComponent />
          )}
        </Suspense>
      </Canvas>

      {/* 좌상단 라벨 (디버그용 — 자가 진단 후 톤다운 가능) */}
      <div style={{
        position: 'absolute', top: 28, left: 28,
        fontSize: 9, letterSpacing: 4,
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'monospace',
        fontWeight: 700,
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '4px 8px',
        background: 'rgba(0,0,0,0.4)',
      }}>
        ▎ VOXEL · {clip.glb && !glbFailed ? 'GLB' : 'PROCEDURAL'} · {clip.scene}
      </div>
    </div>
  );
}

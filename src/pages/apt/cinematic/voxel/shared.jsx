/**
 * voxel/shared — 공통 InstancedMesh + RNG + 카메라 헬퍼
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

// 시드 RNG (같은 씬 = 같은 결과)
export function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── InstancedMesh 박스 그룹 ─────────────────
export function VoxelInstances({ data, emissive = false, size = 1, opacity = 1 }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !data.length) return;
    data.forEach((v, i) => {
      dummy.position.set(v.x, v.y, v.z);
      dummy.scale.set(v.sx ?? size, v.sy ?? size, v.sz ?? size);
      if (v.rot) dummy.rotation.set(v.rot[0] || 0, v.rot[1] || 0, v.rot[2] || 0);
      else dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, tmpColor.set(v.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [data, size]);

  if (!data.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, data.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {emissive ? (
        <meshStandardMaterial flatShading vertexColors emissive="#ffffff" emissiveIntensity={1.4} transparent={opacity < 1} opacity={opacity} />
      ) : (
        <meshStandardMaterial flatShading vertexColors roughness={0.7} metalness={0.1} transparent={opacity < 1} opacity={opacity} />
      )}
    </instancedMesh>
  );
}

// ── 자동 오빗 카메라 ────────────────────────
export function AutoOrbit({ speed = 0.025, radius = 38, height = 22, target = [0, 8, 0] }) {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    camera.position.set(Math.sin(t) * radius, height, Math.cos(t) * radius);
    camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

// ── 정적 카메라 ────────────────────────────
export function StaticCamera({ pos = [0, 5, 12], look = [0, 1, 0], fov = 38 }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...look);
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, pos, look, fov]);
  return null;
}

// ── 슬로우 돌리 (앞으로 천천히 들어감) ─────
export function DollyForward({ from = [0, 6, 30], to = [0, 5, 12], duration = 6, target = [0, 4, 0] }) {
  const { camera } = useThree();
  const startRef = useRef(null);
  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = Math.min(1, (state.clock.elapsedTime - startRef.current) / duration);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.set(
      from[0] + (to[0] - from[0]) * e,
      from[1] + (to[1] - from[1]) * e,
      from[2] + (to[2] - from[2]) * e
    );
    camera.lookAt(...target);
  });
  return null;
}

// ── 슬로우 틸트업 (낮음→높음) ──────────────
export function TiltUp({ from = [0, 1, 14], to = [0, 14, 6], duration = 6, target = [0, 6, 0] }) {
  const { camera } = useThree();
  const startRef = useRef(null);
  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = Math.min(1, (state.clock.elapsedTime - startRef.current) / duration);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.set(
      from[0] + (to[0] - from[0]) * e,
      from[1] + (to[1] - from[1]) * e,
      from[2] + (to[2] - from[2]) * e
    );
    camera.lookAt(...target);
  });
  return null;
}

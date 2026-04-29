/**
 * VoxelEffect — 효과 voxel
 * ScannerSweep, RedThread, PulseRing, BeaconPulse, EdrSpotlight
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

// 가로로 쓸어가는 스캐너 라인
export function ScannerSweep({ y = 1.45, z = -1.05, length = 4.5 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = Math.PI / 7 + Math.sin(t * 1.2) * 0.05;
    if (ref.current.material) {
      ref.current.material.emissiveIntensity = 0.8 + Math.sin(t * 4) * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={[0, y, z]} rotation={[0, 0, Math.PI / 7]}>
      <boxGeometry args={[length, 0.025, 0.025]} />
      <meshStandardMaterial color="#00ffd1" emissive="#00ffd1" emissiveIntensity={1.2} />
    </mesh>
  );
}

// 동심원 펄스 링
export function PulseRing({ position = [0, 0.05, 0], color = '#00ffd1', maxRadius = 3 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() % 2) / 2;
    const r = maxRadius * t;
    ref.current.scale.set(r, r, r);
    if (ref.current.material) {
      ref.current.material.opacity = 1 - t;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.95, 1, 48]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent />
    </mesh>
  );
}

// 비콘 (주기적 깜빡임)
export function BeaconPulse({ position = [0, 0, 0], color = '#ff3b3b', period = 1.2 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() % period;
    const k = t < 0.15 ? 1 : 0.2;
    if (ref.current.material) {
      ref.current.material.emissiveIntensity = k * 1.5;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.18, 12, 12]} />
      <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={1.2} />
    </mesh>
  );
}

// 빨간 실선 (공격 경로)
export function RedThread({ points }) {
  return <Line points={points} color="#ff3b3b" lineWidth={2} dashed dashSize={0.15} gapSize={0.1} />;
}

// EDR 스포트라이트 (위에서 아래)
export function EdrSpotlight({ x = 0, z = 0, color = '#fde68a' }) {
  return (
    <>
      <pointLight position={[x, 4, z]} intensity={6} color={color} distance={6} decay={2} />
      <mesh position={[x, 3.5, z]}>
        <coneGeometry args={[1.2, 3.5, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={2} />
      </mesh>
    </>
  );
}

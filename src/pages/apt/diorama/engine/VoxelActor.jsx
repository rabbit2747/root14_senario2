/**
 * VoxelActor — 인물 voxel (몸통 + 머리)
 * state: idle | compromised | alert
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function VoxelActor({ position = [0, 0, 0], color = '#ffffff', state = 'idle' }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.035;
    ref.current.rotation.y = Math.sin(t * 0.6) * 0.08;
  });

  const emissive = state === 'compromised' ? '#ff3b3b' : state === 'alert' ? '#fbbf24' : '#000000';

  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.45, 0.7, 0.35]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

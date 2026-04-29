/**
 * VoxelTool — 떠다니는 도구·아이콘 voxel
 * idle 모션: 떠오름(sin) + 미세 회전
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function VoxelTool({
  position = [0, 0, 0],
  color = '#00ffd1',
  active = false,
  scale = 1,
  onClick,
}) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 2) * 0.06;
    ref.current.rotation.y += active ? 0.025 : 0.008;
  });

  return (
    <group ref={ref} position={position} scale={scale} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={active ? color : '#000000'}
          emissiveIntensity={active ? 0.7 : 0.05}
          roughness={0.75}
        />
      </mesh>
    </group>
  );
}

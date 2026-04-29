/**
 * GenericVoxelScene — 14단계 중 미완성 씬용 stub
 * stage.atoms를 단순 voxel로 표현 (환경+도구 픽토그램)
 */
import { Text } from '@react-three/drei';
import { VoxelTool } from '../engine/VoxelTool';
import { PulseRing } from '../engine/VoxelEffect';

export function GenericVoxelScene({ stage, onHotspot }) {
  const tools = stage?.atoms?.tools || [];
  const hotspots = stage?.hotspots || [];

  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 4]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <PulseRing position={[0, 0.05, 0]} color="#00ffd1" maxRadius={2.5} />

      {/* 도구 voxel을 가로로 정렬 */}
      {tools.slice(0, 5).map((toolId, i) => {
        const x = -2 + i;
        const correctHotspot = hotspots.find((h) => h.correct);
        const isPrimary = correctHotspot && i === 0;
        return (
          <group key={toolId} position={[x, 0, 0]}>
            <VoxelTool
              position={[0, 0.4, Math.sin(i * 0.7) * 0.5]}
              color={isPrimary ? '#fbbf24' : i % 2 ? '#00ffd1' : '#38bdf8'}
              active={isPrimary}
              onClick={() => onHotspot?.(correctHotspot?.id || toolId)}
            />
            <Text position={[0, 1.15, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
              {toolId}
            </Text>
          </group>
        );
      })}

      <Text position={[0, 2.0, -1]} fontSize={0.22} color="#ffffff" anchorX="center">
        {stage?.title}
      </Text>
      <Text position={[0, 1.65, -1]} fontSize={0.1} color="#94a3b8" anchorX="center" maxWidth={6}>
        {stage?.objective}
      </Text>
      <Text position={[0, -0.85, -1]} fontSize={0.08} color="#475569" anchorX="center">
        ▎ STUB SCENE · TIMELINE READY
      </Text>
    </group>
  );
}

/**
 * GenericVoxelScene — 14단계 중 미완성 씬용 stub
 * stage.atoms를 단순 voxel로 표현 (환경+도구 픽토그램)
 */
import { Html } from '@react-three/drei';
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
            <Html position={[0, 1.15, 0]} center distanceFactor={4} style={{ pointerEvents: 'none' }}>
              <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{toolId}</div>
            </Html>
          </group>
        );
      })}

      <Html position={[0, 2.0, -1]} center distanceFactor={4} style={{ pointerEvents: 'none', textAlign: 'center', minWidth: 280 }}>
        <div style={{ fontSize: 16, color: '#ffffff', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{stage?.title}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{stage?.objective}</div>
        <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', marginTop: 14, letterSpacing: 2 }}>▎ STUB SCENE · TIMELINE READY</div>
      </Html>
    </group>
  );
}

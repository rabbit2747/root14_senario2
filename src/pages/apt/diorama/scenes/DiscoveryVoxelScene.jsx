/**
 * DiscoveryVoxelScene — 내부 네트워크 정찰
 * 학습자 행동: 노드 클릭 → wallet_node 식별 → 하이라이트
 */
import { useState } from 'react';
import { Html, Line } from '@react-three/drei';
import { VoxelTool } from '../engine/VoxelTool';
import { VoxelNetworkFloor } from '../engine/VoxelEnvironment';
import { PulseRing } from '../engine/VoxelEffect';
import { TIMELINES } from '../engine/timelines';
import { useTimelinePlayer } from '../engine/useTimelinePlayer';

function NetworkNode({ position, label, risky, selected, onClick }) {
  return (
    <group position={position} onClick={onClick}>
      <VoxelTool
        color={selected ? (risky ? '#ff3b3b' : '#38bdf8') : '#334155'}
        active={selected}
        scale={risky ? 1.15 : 0.9}
      />
      <Html position={[0, 0.55, 0]} center distanceFactor={4} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: '#ffffff', fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</div>
      </Html>
    </group>
  );
}

export function DiscoveryVoxelScene({ stage, onHotspot }) {
  const [selected, setSelected] = useState(null);
  useTimelinePlayer(TIMELINES.discovery, 5);

  const choose = (id) => {
    setSelected(id);
    onHotspot?.(id);
  };

  const nodes = [
    { id: 'dev_node',    label: 'DEV',     position: [-2, 0.3, 0],    risky: false },
    { id: 'wallet_node', label: 'WALLET?', position: [0, 0.3, -0.4],  risky: true },
    { id: 'print_node',  label: 'PRINT',   position: [2, 0.3, 0.25],  risky: false },
    { id: 'jump_node',   label: 'JUMP',    position: [0.8, 0.3, 1.5], risky: false },
  ];

  return (
    <group>
      <VoxelNetworkFloor />
      <PulseRing position={[0, 0.05, -0.4]} color={selected === 'wallet_node' ? '#ff3b3b' : '#00ffd1'} maxRadius={2.5} />

      {nodes.map((n) => (
        <NetworkNode
          key={n.id}
          {...n}
          selected={selected === n.id}
          onClick={() => choose(n.id)}
        />
      ))}

      <Line points={[[-2, 0.35, 0], [0.8, 0.35, 1.5], [0, 0.35, -0.4]]} color="#00ffd1" lineWidth={2} />
      <Line points={[[2, 0.35, 0.25], [0.8, 0.35, 1.5]]} color="#334155" lineWidth={1} />

      {selected === 'wallet_node' && (
        <mesh position={[0, 1.15, -0.4]}>
          <torusGeometry args={[0.65, 0.025, 8, 32]} />
          <meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={1.2} />
        </mesh>
      )}

      <Html position={[0, 2.15, -1.2]} center distanceFactor={4} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 13, color: '#ffffff', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.95)', whiteSpace: 'nowrap' }}>SCANNER PULSE REVEALS HIGH-VALUE NODE</div>
      </Html>
    </group>
  );
}

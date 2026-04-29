/**
 * InitialAccessVoxelScene — 피싱 메일 도착 → 검사 → 결정
 * 학습자 행동: sender_domain / attachment / reward_copy 검사 → trust meter 떨어짐 → 문 열림
 */
import { useState } from 'react';
import { Text, Line } from '@react-three/drei';
import { VoxelDesk, VoxelServerRoomGate } from '../engine/VoxelEnvironment';
import { VoxelActor } from '../engine/VoxelActor';
import { VoxelTool } from '../engine/VoxelTool';
import { TIMELINES } from '../engine/timelines';
import { useTimelinePlayer } from '../engine/useTimelinePlayer';

function EmailVoxel({ opened, onClick }) {
  return (
    <group position={[0, 1.25, -0.8]} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[1.55, 0.95, 0.08]} />
        <meshStandardMaterial
          color={opened ? '#2b1111' : '#111827'}
          emissive={opened ? '#ff3b3b' : '#00ffd1'}
          emissiveIntensity={opened ? 0.5 : 0.18}
        />
      </mesh>
      <Text position={[0, 0.22, 0.07]} fontSize={0.1} color="#ffffff" anchorX="center">
        INVESTMENT OFFER
      </Text>
      <Text position={[0, -0.08, 0.07]} fontSize={0.08} color="#ffcc66" anchorX="center">
        beta test reward
      </Text>
      <Text position={[0, -0.28, 0.07]} fontSize={0.08} color="#ff3b3b" anchorX="center">
        attachment.pkg
      </Text>
    </group>
  );
}

function TrustMeter({ value }) {
  // value: 0 ~ 1
  const w = 1.4;
  const filled = w * value;
  return (
    <group position={[1.6, 1.6, -0.7]}>
      <mesh>
        <boxGeometry args={[w, 0.12, 0.04]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      <mesh position={[-w / 2 + filled / 2, 0, 0.03]}>
        <boxGeometry args={[Math.max(0.01, filled), 0.1, 0.04]} />
        <meshStandardMaterial color={value < 0.4 ? '#dc2626' : value < 0.7 ? '#fbbf24' : '#22c55e'} emissive={value < 0.4 ? '#dc2626' : '#000'} emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0, -0.18, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        TRUST METER
      </Text>
    </group>
  );
}

export function InitialAccessVoxelScene({ stage, onHotspot }) {
  const [inspected, setInspected] = useState(new Set());
  useTimelinePlayer(TIMELINES.initial_access, 5);

  const inspect = (id) => {
    setInspected((prev) => new Set([...prev, id]));
    onHotspot?.(id);
  };

  // trust value: 검사할 때마다 떨어짐
  const trust = Math.max(0, 1 - inspected.size * 0.32);
  const opened = inspected.has('attachment') || inspected.size >= 2;

  return (
    <group>
      <VoxelDesk />
      <VoxelActor position={[-2.1, 0.35, 0.6]} color="#d8dee9" state={opened ? 'alert' : 'idle'} />

      <EmailVoxel opened={opened} onClick={() => inspect('attachment')} />

      {/* 검사 도구들 */}
      <VoxelTool
        position={[-1.8, 0.95, 0.4]}
        color={inspected.has('sender_domain') ? '#ff3b3b' : '#00ffd1'}
        active={inspected.has('sender_domain')}
        scale={0.85}
        onClick={() => inspect('sender_domain')}
      />
      <Text position={[-1.8, 1.45, 0.4]} fontSize={0.08} color="#94a3b8" anchorX="center">
        SENDER DOMAIN
      </Text>

      <VoxelTool
        position={[0, 0.85, 0.4]}
        color={inspected.has('reward_copy') ? '#ff3b3b' : '#fbbf24'}
        active={inspected.has('reward_copy')}
        scale={0.85}
        onClick={() => inspect('reward_copy')}
      />
      <Text position={[0, 1.35, 0.4]} fontSize={0.08} color="#94a3b8" anchorX="center">
        REWARD COPY
      </Text>

      <TrustMeter value={trust} />

      {opened && (
        <>
          <Line
            points={[[0.3, 1.2, -0.75], [1.5, 0.8, -0.3], [2.5, 0.5, 0.8]]}
            color="#ff3b3b"
            lineWidth={2}
          />
          <VoxelServerRoomGate opened />
          <Text position={[2.7, 1.2, 0.86]} fontSize={0.1} color="#ff3b3b" anchorX="center">
            DOOR OPENED
          </Text>
        </>
      )}

      <Text position={[0, 2.35, -1.2]} fontSize={0.18} color="#ffffff" anchorX="center">
        EMAIL ARRIVES.  INSPECT BEFORE TRUST.
      </Text>
    </group>
  );
}

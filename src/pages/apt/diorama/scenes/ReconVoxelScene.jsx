/**
 * ReconVoxelScene — 정찰 단계
 * 학습자 행동: 정상 단서(crypto_bot, trading_interest) 클릭 → 타겟 락온
 * 단서 2개 모두 선택 시: 빨간 그림자 등장 + 공격선 활성
 */
import { useMemo, useState } from 'react';
import { Html, Line } from '@react-three/drei';
import { VoxelDesk } from '../engine/VoxelEnvironment';
import { VoxelActor } from '../engine/VoxelActor';
import { VoxelTool } from '../engine/VoxelTool';
import { ScannerSweep } from '../engine/VoxelEffect';
import { TIMELINES } from '../engine/timelines';
import { useTimelinePlayer } from '../engine/useTimelinePlayer';

function ProfileCard({ position, label, sub, active, correct, onClick }) {
  return (
    <group position={position} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[1.25, 0.85, 0.08]} />
        <meshStandardMaterial
          color={active ? (correct ? '#102a2a' : '#2a1010') : '#151923'}
          emissive={active ? (correct ? '#00ffd1' : '#ff3b3b') : '#000000'}
          emissiveIntensity={active ? 0.45 : 0.05}
        />
      </mesh>
      <Html position={[0, 0, 0.06]} center transform distanceFactor={3} style={{ pointerEvents: 'none', textAlign: 'center', minWidth: 100 }}>
        <div style={{ fontSize: 11, color: '#ffffff', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 8, color: active ? (correct ? '#00ffd1' : '#ff3b3b') : '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{sub}</div>
      </Html>
    </group>
  );
}

export function ReconVoxelScene({ stage, onHotspot }) {
  const [selected, setSelected] = useState([]);
  const events = useTimelinePlayer(TIMELINES.reconnaissance, 5);
  const activeEvents = useMemo(() => new Set(events.map((e) => e.event)), [events]);

  const click = (id) => {
    setSelected((prev) => [...new Set([...prev, id])]);
    onHotspot?.(id);
  };

  const targetLocked =
    selected.includes('crypto_bot') && selected.includes('trading_interest');

  return (
    <group>
      <VoxelDesk />

      <VoxelActor position={[-2.4, 0.35, 0.6]} color="#d8dee9" />
      <VoxelActor position={[2.6, 0.35, 0.7]} color="#222222" state={targetLocked ? 'compromised' : 'idle'} />

      {/* 프로필 카드 3장 */}
      <ProfileCard
        position={[-1.8, 1.25, -1.1]}
        label="Backend Dev"
        sub="crypto_bot"
        active={selected.includes('crypto_bot')}
        correct
        onClick={() => click('crypto_bot')}
      />
      <ProfileCard
        position={[0, 1.45, -1.25]}
        label="Auto Trading"
        sub="trading_interest"
        active={selected.includes('trading_interest')}
        correct
        onClick={() => click('trading_interest')}
      />
      <ProfileCard
        position={[1.8, 1.2, -1.1]}
        label="CSS Animation"
        sub="random_skill"
        active={selected.includes('random_skill')}
        correct={false}
        onClick={() => click('random_skill')}
      />

      {/* 스캐너 펄스 (이벤트가 켜진 후) */}
      {activeEvents.has('scanner_sweep') && <ScannerSweep />}

      {/* 정답 2개 모두 선택 → 관계선 + 공격자 표시 */}
      {targetLocked && (
        <>
          <Line
            points={[[-1.8, 1.25, -1.0], [0, 1.45, -1.15], [2.6, 0.8, 0.7]]}
            color="#00ffd1"
            lineWidth={3}
          />
          <VoxelTool position={[0, 0.75, 0.2]} color="#ff3b3b" active scale={0.9} />
        </>
      )}

      <Html position={[0, 2.45, -1.3]} center distanceFactor={4} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: 2,
          color: targetLocked ? '#00ffd1' : '#ffffff',
          fontFamily: 'monospace',
          textShadow: '0 2px 8px rgba(0,0,0,0.95)',
          whiteSpace: 'nowrap',
        }}>
          {targetLocked ? 'TARGET PROFILE LOCKED' : 'INSPECT OSINT CLUES'}
        </div>
      </Html>
    </group>
  );
}

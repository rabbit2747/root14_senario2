/**
 * VoxelEnvironment — 환경 voxel 컴포넌트들
 * Desk, ServerRoomGate, BootRail, NetworkFloor, PrivilegeTower
 */

export function VoxelDesk() {
  return (
    <group>
      {/* 책상 상판 */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[7, 0.25, 4]} />
        <meshStandardMaterial color="#1c1f26" roughness={0.9} />
      </mesh>
      {/* 노트북 베이스 */}
      <mesh position={[0, 0.08, -0.8]} castShadow>
        <boxGeometry args={[1.6, 0.08, 1]} />
        <meshStandardMaterial color="#222831" />
      </mesh>
      {/* 노트북 화면 */}
      <mesh position={[0, 0.55, -1.25]} castShadow>
        <boxGeometry args={[1.7, 1, 0.08]} />
        <meshStandardMaterial color="#0a0a0a" emissive="#00ffd1" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

export function VoxelServerRoomGate({ opened = false }) {
  return (
    <group position={[2.7, 0.45, 0.8]}>
      <mesh>
        <boxGeometry args={[0.9, 1.1, 0.1]} />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive={opened ? '#ff3b3b' : '#00ffd1'}
          emissiveIntensity={opened ? 0.45 : 0.1}
        />
      </mesh>
    </group>
  );
}

export function VoxelNetworkFloor() {
  return (
    <mesh position={[0, -0.1, 0]} receiveShadow>
      <boxGeometry args={[6.5, 0.12, 4.5]} />
      <meshStandardMaterial color="#0f172a" roughness={0.8} />
    </mesh>
  );
}

export function VoxelPrivilegeTower({ tier = 0 }) {
  const colors = ['#475569', '#0891b2', '#fbbf24', '#dc2626'];
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.5 + i * 0.6, 0]} castShadow>
          <boxGeometry args={[1 - i * 0.18, 0.5, 1 - i * 0.18]} />
          <meshStandardMaterial
            color={colors[i]}
            emissive={i <= tier ? colors[i] : '#000000'}
            emissiveIntensity={i <= tier ? 0.6 : 0}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export function VoxelBootRail({ slotIndex = -1 }) {
  // 5칸 부트 슬롯
  return (
    <group>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[5, 0.12, 1.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {[-1.6, -0.8, 0, 0.8, 1.6].map((x, i) => (
        <mesh key={i} position={[x, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.8]} />
          <meshStandardMaterial
            color={i === slotIndex ? '#ff3b3b' : '#475569'}
            emissive={i === slotIndex ? '#ff3b3b' : '#000'}
            emissiveIntensity={i === slotIndex ? 0.8 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

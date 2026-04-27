/**
 * DioramaScene — Phase 1 박스 placeholder 디오라마
 * 평면도(c0024-floorplan.svg) 좌표 그대로 차용.
 * 월드 단위 1u = 1m. 좌표계: +X 오른쪽, +Y 위, -Z 앞쪽
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// ── 단순 박스 헬퍼 ─────────────────────────────
function Box({ pos, size, color = '#475569', emissive = null, ...props }) {
  return (
    <mesh position={pos} {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || '#000000'}
        emissiveIntensity={emissive ? 0.4 : 0}
        roughness={0.7}
        metalness={emissive ? 0.3 : 0.1}
      />
    </mesh>
  );
}

// ── 모니터 발광 ────────────────────────────────
function Monitor({ pos, color = '#22d3ee', flicker = false }) {
  const ref = useRef();
  useFrame((state) => {
    if (flicker && ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.material.emissiveIntensity = 1.5 + Math.sin(t * 8) * 0.3;
    }
  });
  return (
    <mesh position={pos} ref={ref}>
      <boxGeometry args={[0.5, 0.35, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
    </mesh>
  );
}

// ── 책상 (책상 + 모니터) ─────────────────────
function Desk({ x, z, monitorColor = '#22d3ee', highlight = false, flicker = false }) {
  return (
    <group position={[x, 0, z]}>
      {/* 책상 상판 */}
      <Box pos={[0, 0.75, 0]} size={[1.2, 0.05, 0.6]} color={highlight ? '#7c3aed' : '#52525b'} />
      {/* 다리 */}
      <Box pos={[-0.5, 0.37, -0.25]} size={[0.05, 0.75, 0.05]} color="#27272a" />
      <Box pos={[ 0.5, 0.37, -0.25]} size={[0.05, 0.75, 0.05]} color="#27272a" />
      <Box pos={[-0.5, 0.37,  0.25]} size={[0.05, 0.75, 0.05]} color="#27272a" />
      <Box pos={[ 0.5, 0.37,  0.25]} size={[0.05, 0.75, 0.05]} color="#27272a" />
      {/* 모니터 */}
      <Monitor pos={[0, 1.15, -0.15]} color={monitorColor} flicker={flicker} />
      {/* 모니터 받침 */}
      <Box pos={[0, 0.85, -0.15]} size={[0.15, 0.15, 0.05]} color="#1f2937" />
    </group>
  );
}

// ── 서버 랙 (높이 2m) ────────────────────────
function ServerRack({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <Box pos={[0, 1, 0]} size={[0.6, 2, 0.5]} color="#1e293b" />
      {/* LED 점등 */}
      {[0.4, 0.7, 1.0, 1.3, 1.6, 1.9].map((y, i) => (
        <Box
          key={i}
          pos={[0, y, 0.26]}
          size={[0.5, 0.05, 0.01]}
          color="#000"
          emissive={i % 2 === 0 ? '#06b6d4' : '#22c55e'}
        />
      ))}
    </group>
  );
}

export default function DioramaScene() {
  return (
    <group>
      {/* ── 바닥 ───────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* 그리드 패턴 */}
      <gridHelper args={[24, 24, '#1e293b', '#1e293b']} position={[0, 0.01, 0]} />

      {/* ── 외벽 (낮은 벽으로 시야 확보) ─── */}
      <Box pos={[0, 1, -8]}  size={[24, 2, 0.2]} color="#1e293b" /> {/* 뒤 */}
      <Box pos={[0, 1, 8]}   size={[24, 2, 0.2]} color="#1e293b" /> {/* 앞 */}
      <Box pos={[-12, 1, 0]} size={[0.2, 2, 16]} color="#1e293b" /> {/* 좌 */}
      <Box pos={[12, 1, 0]}  size={[0.2, 2, 16]} color="#1e293b" /> {/* 우 */}

      {/* ── 로비 / 보안실 (x:-7~-2) ─────── */}
      <Box pos={[-4.5, 0.5, 0]} size={[5, 1, 8]} color="#1e293b" /> {/* 카운터 영역 표시 */}
      <Box pos={[-4.5, 1.0, 3]} size={[3, 1, 0.3]} color="#334155" /> {/* 안내 데스크 */}

      {/* ── 사무실 (x:-2~6) ─ 책상 6개 + 관리자 PC 강조 ─ */}
      <Desk x={-1.2} z={-2} monitorColor="#22d3ee" />
      <Desk x={-1.2} z={ 0} monitorColor="#22d3ee" />
      <Desk x={ 1.5} z={-2} monitorColor="#0891b2" />
      <Desk x={ 1.5} z={ 0} monitorColor="#0891b2" />
      <Desk x={ 4.0} z={-2} monitorColor="#06b6d4" />
      {/* 관리자 PC — 보라색 강조 + 깜박이는 모니터 (잠금 안된 표시) */}
      <Desk x={-3.5} z={ 1.5} monitorColor="#a855f7" highlight={true} flicker={true} />

      {/* 의자 (작은 박스) */}
      <Box pos={[-1.2, 0.4, -1.2]} size={[0.45, 0.8, 0.45]} color="#1f2937" />
      <Box pos={[-1.2, 0.4,  0.8]} size={[0.45, 0.8, 0.45]} color="#1f2937" />
      <Box pos={[-3.5, 0.4,  2.3]} size={[0.45, 0.8, 0.45]} color="#7c3aed" /> {/* 관리자 의자 */}

      {/* ── 복도 (x:6~7) ─────────────────── */}
      <Box pos={[6.5, 0.05, 0]} size={[1, 0.1, 16]} color="#0c4a6e" /> {/* 복도 바닥 색상 */}

      {/* ── 서버실 (x:7~12, z:-4~2) ──────── */}
      <ServerRack x={ 8} z={-5} />
      <ServerRack x={ 9} z={-5} />
      <ServerRack x={10} z={-5} />
      <ServerRack x={11} z={-5} />
      {/* 서버실 바닥 컬러 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, 0.02, -2]}>
        <planeGeometry args={[5, 6]} />
        <meshStandardMaterial color="#0c4a6e" />
      </mesh>

      {/* ── 다크웹 모니터링 룸 (x:7~12, z:2~8) ─ */}
      <Box pos={[9.5, 1.0, 5]} size={[3, 1.8, 0.1]} color="#000" emissive="#581c87" /> {/* 큰 화면 */}
      <Box pos={[9.5, 0.4, 7]} size={[1.5, 0.8, 0.6]} color="#1f2937" /> {/* 책상 */}

      {/* ── 조명 ──────────────────────────── */}
      <ambientLight intensity={0.15} color="#1e3a8a" />
      {/* 형광등 (사무실) */}
      <pointLight position={[0, 4, 0]} intensity={20} color="#bae6fd" distance={12} decay={2} />
      {/* 서버실 조명 (시안) */}
      <pointLight position={[9.5, 3.5, -5]} intensity={15} color="#06b6d4" distance={8} decay={2} />
      {/* 다크웹 모니터 조명 (보라) */}
      <pointLight position={[9.5, 2, 5]} intensity={8} color="#a855f7" distance={6} decay={2} />
      {/* 외부 가로등 */}
      <directionalLight position={[20, 15, 20]} intensity={0.3} color="#f59e0b" />
      {/* 핫스팟 강조용 */}
      <pointLight position={[-3.5, 1.6, 1.5]} intensity={3} color="#a855f7" distance={3} />
    </group>
  );
}

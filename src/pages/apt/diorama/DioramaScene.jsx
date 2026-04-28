/**
 * DioramaScene — Phase 1.5 폴리싱 박스 디오라마
 * - 천장·창문·복도 디테일 추가
 * - 분기 결과(consequence)에 따라 조명·LUT 변화
 * - 모니터 발광 톤다운, 책상 그룹화로 공간감
 * - extraObjects: 에디터에서 추가한 데이터 기반 오브젝트 (배열)
 * - glbPath: 선택적 GLB 모델 슬롯 (있으면 procedural 위에 겹쳐 렌더)
 * 평면도 좌표 그대로 차용. 1u = 1m
 */
import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// ── 헬퍼 ────────────────────────────────────────
function Box({ pos, size, color = '#475569', emissive = null, emissiveIntensity = 0.4, ...props }) {
  return (
    <mesh position={pos} {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || '#000000'}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
        roughness={0.7}
        metalness={emissive ? 0.3 : 0.1}
      />
    </mesh>
  );
}

function Monitor({ pos, color = '#22d3ee', flicker = false, intensity = 0.7 }) {
  const ref = useRef();
  useFrame((state) => {
    if (flicker && ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.material.emissiveIntensity = intensity + Math.sin(t * 12) * 0.15 + Math.random() * 0.05;
    }
  });
  return (
    <mesh position={pos} ref={ref}>
      <boxGeometry args={[0.5, 0.35, 0.04]} />
      <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={intensity} />
    </mesh>
  );
}

// ── 책상 ───────────────────────────────────────
function Desk({ x, z, rot = 0, monitorColor = '#22d3ee', highlight = false, flicker = false, hasKeyboard = true }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* 책상 상판 */}
      <Box pos={[0, 0.74, 0]} size={[1.2, 0.04, 0.6]} color={highlight ? '#5b21b6' : '#3f3f46'} />
      {/* 다리 */}
      {[[-0.5,-0.25],[0.5,-0.25],[-0.5,0.25],[0.5,0.25]].map(([px,pz],i)=>(
        <Box key={i} pos={[px,0.37,pz]} size={[0.04,0.74,0.04]} color="#18181b" />
      ))}
      {/* 모니터 */}
      <Monitor pos={[0, 1.13, -0.18]} color={monitorColor} flicker={flicker} intensity={highlight ? 0.9 : 0.55} />
      {/* 모니터 받침 */}
      <Box pos={[0, 0.84, -0.18]} size={[0.12, 0.18, 0.04]} color="#1f2937" />
      {/* 키보드 */}
      {hasKeyboard && <Box pos={[0, 0.77, 0.05]} size={[0.4, 0.02, 0.14]} color="#1c1917" />}
      {/* 마우스 */}
      {hasKeyboard && <Box pos={[0.3, 0.77, 0.08]} size={[0.06, 0.02, 0.1]} color="#1c1917" />}
    </group>
  );
}

function Chair({ x, z, rot = 0, color = '#1f2937' }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Box pos={[0, 0.45, 0]} size={[0.42, 0.06, 0.42]} color={color} />
      <Box pos={[0, 0.7, -0.18]} size={[0.42, 0.5, 0.04]} color={color} />
      <Box pos={[0, 0.22, 0]} size={[0.04, 0.44, 0.04]} color="#0c0a09" />
    </group>
  );
}

// ── 서버 랙 ──────────────────────────────────
function ServerRack({ x, z, ledColor = ['#06b6d4', '#22c55e'] }) {
  return (
    <group position={[x, 0, z]}>
      <Box pos={[0, 1, 0]} size={[0.6, 2, 0.5]} color="#0c0a09" />
      {/* 정면 슬롯 */}
      <Box pos={[0, 1, 0.26]} size={[0.55, 1.9, 0.005]} color="#18181b" />
      {/* LED */}
      {[0.4, 0.7, 1.0, 1.3, 1.6, 1.9].map((y, i) => (
        <Box
          key={i}
          pos={[0.22, y, 0.27]}
          size={[0.02, 0.02, 0.005]}
          color="#000"
          emissive={i % 2 === 0 ? ledColor[0] : ledColor[1]}
          emissiveIntensity={1.2}
        />
      ))}
      {/* 환기 슬릿 */}
      <Box pos={[-0.22, 1.5, 0.27]} size={[0.12, 0.6, 0.005]} color="#18181b" emissive="#0c4a6e" emissiveIntensity={0.3} />
    </group>
  );
}

// ── 천장 형광등 ─────────────────────────────
function CeilingLight({ pos, on = true }) {
  return (
    <mesh position={pos}>
      <boxGeometry args={[1.6, 0.05, 0.4]} />
      <meshStandardMaterial color="#f1f5f9" emissive={on ? '#dbeafe' : '#000'} emissiveIntensity={on ? 1.5 : 0} />
    </mesh>
  );
}

// ── 창문 (벽에 끼워진 발광 패널) ─────────────
function Window({ pos, size = [1.5, 1.2, 0.05], color = '#0c4a6e' }) {
  return (
    <group position={pos}>
      <Box pos={[0, 0, 0]} size={size} color="#000" emissive={color} emissiveIntensity={0.4} />
      {/* 창틀 십자 */}
      <Box pos={[0, 0, 0.03]} size={[size[0], 0.04, 0.01]} color="#27272a" />
      <Box pos={[0, 0, 0.03]} size={[0.04, size[1], 0.01]} color="#27272a" />
    </group>
  );
}

// ──────────────────────────────────────────────
// consequence별 조명·LUT 변형
const CONSEQUENCE_LIGHTING = {
  // 첫 분기
  fast_path:    { ambient: 1.4,  fluorescent: 1.0, rackLed: ['#06b6d4', '#22c55e'], adminColor: '#a855f7' },
  stealth_path: { ambient: 0.6,  fluorescent: 0.5, rackLed: ['#0891b2', '#06b6d4'], adminColor: '#3b82f6' },
  // 두 번째 분기
  exfil_path:   { ambient: 0.9,  fluorescent: 0.7, rackLed: ['#dc2626', '#f97316'], adminColor: '#dc2626' },
  ghost_path:   { ambient: 0.4,  fluorescent: 0.3, rackLed: ['#475569', '#64748b'], adminColor: '#1f2937' },
};

function mergeLighting(consequenceTags = []) {
  // 후속 결정이 우선. 없으면 baseline.
  const base = { ambient: 1.0, fluorescent: 1.0, rackLed: ['#06b6d4', '#22c55e'], adminColor: '#a855f7' };
  const m = { ...base };
  consequenceTags.forEach((tag) => {
    if (CONSEQUENCE_LIGHTING[tag]) Object.assign(m, CONSEQUENCE_LIGHTING[tag]);
  });
  return m;
}

// ── GLB 슬롯 (선택적) ────────────────────────
function GLBSlot({ path }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

// ── ExtraObject — 에디터로 추가한 사용자 박스 ─
function ExtraObject({ obj, onSelect, selected = false }) {
  const handleClick = (e) => {
    if (onSelect) {
      e.stopPropagation();
      onSelect(obj.id);
    }
  };
  return (
    <mesh
      position={obj.pos}
      rotation={obj.rot || [0, 0, 0]}
      onClick={handleClick}
    >
      <boxGeometry args={obj.size || [1, 1, 1]} />
      <meshStandardMaterial
        color={obj.color || '#475569'}
        emissive={obj.emissive || '#000'}
        emissiveIntensity={obj.emissive ? (obj.emissiveIntensity || 0.5) : 0}
        roughness={obj.roughness ?? 0.7}
        metalness={obj.metalness ?? 0.1}
        wireframe={selected}
      />
    </mesh>
  );
}

// ──────────────────────────────────────────────
export default function DioramaScene({
  consequences = [],
  extraObjects = [],
  glbPath = null,
  selectedObjectId = null,
  onObjectSelect = null,
}) {
  const L = mergeLighting(consequences);

  return (
    <group>
      {/* ── 바닥 ─────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color="#0a0e1a" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* ── 천장 (와이드샷에서 디오라마 박스 느낌) ─ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} side={2} />
      </mesh>

      {/* 천장 형광등 그리드 */}
      {[[-3,-3],[-3,0],[-3,3],[0,-3],[0,0],[0,3],[3,-3],[3,0],[3,3]].map(([x,z],i)=>(
        <CeilingLight key={i} pos={[x, 3.95, z]} on={L.fluorescent > 0.4} />
      ))}
      <CeilingLight pos={[9.5, 3.95, -5]} on={true} />
      <CeilingLight pos={[9.5, 3.95, 5]} on={true} />

      {/* ── 외벽 ───────────────────────────── */}
      <Box pos={[0, 2, -8.05]}  size={[24, 4, 0.1]} color="#1e293b" />
      <Box pos={[0, 2, 8.05]}   size={[24, 4, 0.1]} color="#1e293b" />
      <Box pos={[-12.05, 2, 0]} size={[0.1, 4, 16]} color="#1e293b" />
      <Box pos={[12.05, 2, 0]}  size={[0.1, 4, 16]} color="#1e293b" />

      {/* ── 창문 (외벽에) ──────────────────── */}
      <Window pos={[-8, 2.2, -7.99]} />
      <Window pos={[-4, 2.2, -7.99]} />
      <Window pos={[ 0, 2.2, -7.99]} />
      <Window pos={[ 4, 2.2, -7.99]} />

      {/* ── 내벽 (구역 분리) ───────────────── */}
      {/* 로비 ↔ 사무실 */}
      <Box pos={[-2, 1.3, -3]} size={[0.1, 2.6, 4]} color="#27272a" />
      <Box pos={[-2, 1.3,  3]} size={[0.1, 2.6, 4]} color="#27272a" />
      {/* 사무실 ↔ 복도 */}
      <Box pos={[6, 1.3, -3.5]} size={[0.1, 2.6, 3]} color="#27272a" />
      <Box pos={[6, 1.3,  3.5]} size={[0.1, 2.6, 3]} color="#27272a" />
      {/* 복도 ↔ 서버실 */}
      <Box pos={[7, 1.3, -2]} size={[0.1, 2.6, 4]} color="#27272a" />
      <Box pos={[7, 1.3, -7]} size={[0.1, 2.6, 1]} color="#27272a" />
      {/* 복도 ↔ 다크웹룸 */}
      <Box pos={[7, 1.3, 2]} size={[0.1, 2.6, 4]} color="#27272a" />
      <Box pos={[7, 1.3, 7]} size={[0.1, 2.6, 1]} color="#27272a" />

      {/* ── 로비 / 보안실 (x:-7~-2) ───────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.01, 0]}>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial color="#0c1424" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* 안내 데스크 */}
      <Box pos={[-4.5, 0.55, 3]} size={[3, 1.1, 0.4]} color="#1e293b" />
      <Box pos={[-4.5, 1.15, 3]} size={[3, 0.05, 0.5]} color="#0f172a" />
      {/* 의자 (보안실 빈 자리) */}
      <Chair x={-4.5} z={3.8} rot={Math.PI} />
      {/* 모니터 (보안 CCTV) */}
      <Monitor pos={[-4.5, 1.4, 3.05]} color="#dc2626" flicker={true} intensity={0.4} />
      {/* 잡지·종이 */}
      <Box pos={[-4.5, 1.18, 2.85]} size={[0.3, 0.01, 0.2]} color="#cbd5e1" />

      {/* ── 사무실 (책상 6개 그룹화) ────── */}
      {/* 좌측 그룹 */}
      <Desk x={-1.2} z={-2} monitorColor="#22d3ee" />
      <Desk x={-1.2} z={ 0} monitorColor="#22d3ee" />
      <Chair x={-1.2} z={-1.2} />
      <Chair x={-1.2} z={ 0.8} />

      {/* 우측 그룹 */}
      <Desk x={ 1.5} z={-2} monitorColor="#0891b2" />
      <Desk x={ 1.5} z={ 0} monitorColor="#0891b2" />
      <Chair x={ 1.5} z={-1.2} />
      <Chair x={ 1.5} z={ 0.8} />

      {/* 회의 테이블 (큰 책상 1개) */}
      <Box pos={[4.0, 0.74, -1]} size={[1.6, 0.04, 1.2]} color="#3f3f46" />
      {[[-0.7,-0.5],[0.7,-0.5],[-0.7,0.5],[0.7,0.5]].map(([px,pz],i)=>(
        <Box key={i} pos={[4+px, 0.37, -1+pz]} size={[0.04,0.74,0.04]} color="#18181b" />
      ))}
      <Chair x={3.2} z={-1} rot={Math.PI/2} />
      <Chair x={4.8} z={-1} rot={-Math.PI/2} />
      <Chair x={4.0} z={-1.8} />
      <Chair x={4.0} z={-0.2} rot={Math.PI} />
      {/* 테이블 위 노트북 */}
      <Box pos={[4.0, 0.78, -1]} size={[0.4, 0.02, 0.3]} color="#52525b" />

      {/* 관리자 PC (강조) */}
      <Desk x={-3.5} z={1.5} monitorColor={L.adminColor} highlight={true} flicker={true} />
      <Chair x={-3.5} z={2.3} color="#5b21b6" />
      {/* 관리자 책상 위 종이/머그컵 */}
      <Box pos={[-3.2, 0.78, 1.4]} size={[0.15, 0.02, 0.2]} color="#e7e5e4" />
      <mesh position={[-3.7, 0.82, 1.6]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>

      {/* 화분 (코너) */}
      <mesh position={[-1.7, 0.3, 3]}>
        <cylinderGeometry args={[0.18, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <mesh position={[-1.7, 0.85, 3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#16a34a" roughness={0.9} />
      </mesh>

      {/* ── 복도 (x=6~7) ──────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, 0.01, 0]}>
        <planeGeometry args={[1, 16]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.6} />
      </mesh>
      {/* 비상등 */}
      <Box pos={[6.5, 3.5, -7]} size={[0.2, 0.2, 0.05]} color="#000" emissive="#10b981" emissiveIntensity={0.6} />
      <Box pos={[6.5, 3.5,  7]} size={[0.2, 0.2, 0.05]} color="#000" emissive="#10b981" emissiveIntensity={0.6} />

      {/* ── 서버실 ─────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, 0.02, -5]}>
        <planeGeometry args={[5, 6]} />
        <meshStandardMaterial color="#082f49" roughness={0.4} metalness={0.3} />
      </mesh>
      <ServerRack x={ 8} z={-5} ledColor={L.rackLed} />
      <ServerRack x={ 9} z={-5} ledColor={L.rackLed} />
      <ServerRack x={10} z={-5} ledColor={L.rackLed} />
      <ServerRack x={11} z={-5} ledColor={L.rackLed} />
      {/* 서버실 케이블 트레이 (천장) */}
      <Box pos={[9.5, 3.7, -5]} size={[4, 0.1, 0.3]} color="#27272a" />

      {/* ── 다크웹 모니터링 룸 ─────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, 0.02, 5]}>
        <planeGeometry args={[5, 6]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.6} />
      </mesh>
      {/* 큰 모니터 (벽걸이) */}
      <group position={[11.9, 1.8, 5]}>
        <Box pos={[0, 0, 0]} size={[0.05, 1.6, 2.5]} color="#000" emissive="#581c87" emissiveIntensity={1.0} />
        <Box pos={[0.03, 0, 0]} size={[0.01, 1.5, 2.4]} color="#000" emissive="#a855f7" emissiveIntensity={0.6} />
      </group>
      {/* 책상·의자 */}
      <Box pos={[10, 0.4, 6.5]} size={[1.5, 0.04, 0.6]} color="#3f3f46" />
      <Chair x={10} z={6.0} rot={Math.PI} />
      {/* 노트북 */}
      <Box pos={[10, 0.43, 6.5]} size={[0.4, 0.02, 0.3]} color="#18181b" />
      <Box pos={[10, 0.55, 6.6]} size={[0.4, 0.25, 0.02]} color="#000" emissive="#a855f7" emissiveIntensity={0.5} />
      {/* 흩어진 종이 */}
      <Box pos={[8.5, 0.02, 5.5]} size={[0.2, 0.005, 0.28]} color="#e7e5e4" rotation={[0, 0.3, 0]} />
      <Box pos={[9.0, 0.02, 5.0]} size={[0.2, 0.005, 0.28]} color="#e7e5e4" rotation={[0, -0.4, 0]} />

      {/* ══════════════ 조명 ══════════════ */}
      {/* 환경광 */}
      <ambientLight intensity={0.18 * L.ambient} color="#1e3a8a" />

      {/* 사무실 형광등 */}
      <pointLight position={[-1, 3.5, -1]} intensity={12 * L.fluorescent} color="#dbeafe" distance={10} decay={2} />
      <pointLight position={[ 2, 3.5, -1]} intensity={12 * L.fluorescent} color="#dbeafe" distance={10} decay={2} />
      <pointLight position={[ 4, 3.5,  1]} intensity={10 * L.fluorescent} color="#bae6fd" distance={8} decay={2} />

      {/* 관리자 PC 강조광 */}
      <pointLight position={[-3.5, 1.6, 1.5]} intensity={2.5} color={L.adminColor} distance={2.5} />

      {/* 서버실 시안 */}
      <pointLight position={[9.5, 3, -5]} intensity={10 * L.fluorescent} color={L.rackLed[0]} distance={6} decay={2} />
      <pointLight position={[9.5, 1, -3.5]} intensity={3} color={L.rackLed[1]} distance={3} />

      {/* 다크웹 룸 보라 */}
      <pointLight position={[11.5, 2, 5]} intensity={6} color="#a855f7" distance={5} decay={2} />
      <pointLight position={[10, 1, 6.5]} intensity={2} color="#7c3aed" distance={2.5} />

      {/* 외부 가로등 (창문 쪽) */}
      <directionalLight position={[-5, 8, -15]} intensity={0.4} color="#fbbf24" />
      <pointLight position={[-4, 3, -7.8]} intensity={3} color="#f59e0b" distance={4} />
      <pointLight position={[ 0, 3, -7.8]} intensity={3} color="#f59e0b" distance={4} />

      {/* 보안실 CCTV 모니터 발광 */}
      <pointLight position={[-4.5, 1.4, 3]} intensity={1.5} color="#dc2626" distance={2} />

      {/* 로비 천장 (어두운 톤) */}
      <pointLight position={[-4.5, 3.5, 0]} intensity={3 * L.fluorescent} color="#7dd3fc" distance={6} decay={2} />
    </group>
  );
}

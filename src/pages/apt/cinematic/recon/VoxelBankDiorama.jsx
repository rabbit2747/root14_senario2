/**
 * VoxelBankDiorama — InstancedMesh 기반 OO은행 야경 디오라마
 * - 메인 빌딩 InstancedMesh (외벽 블록 ~3000개)
 * - 창문 발광 InstancedMesh (~500개, 무작위 점등)
 * - 주변 도시 InstancedMesh (~1500개)
 * - 자동 오빗 카메라
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

// 시드 RNG
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── 1. 은행 본체 빌딩 외벽 데이터 생성 ─────────
function buildBankExterior() {
  const data = []; // {x, y, z, color}
  const W = 8, D = 8, H = 28;
  const facadeColor = '#1f2937';
  const accentColor = '#374151';

  for (let y = 0; y < H; y++) {
    for (let x = -W/2; x < W/2; x++) {
      for (let z = -D/2; z < D/2; z++) {
        // 외벽만 (셸)
        const onEdge =
          x === -W/2 || x === W/2 - 1 ||
          z === -D/2 || z === D/2 - 1 ||
          y === 0 || y === H - 1;
        if (!onEdge) continue;

        // 5층 단위로 어두운 라인
        const isFloorLine = y % 5 === 0;
        const c = isFloorLine ? '#0f172a' : (y % 2 === 0 ? facadeColor : accentColor);
        data.push({ x, y, z, color: c });
      }
    }
  }
  return data;
}

// ── 2. 창문 (발광 큐브) ────────────────────
function buildWindows() {
  const data = []; // {x, y, z, color}
  const r = rng(7);
  const W = 8, D = 8, H = 28;
  const colors = ['#fbbf24', '#fde68a', '#3b82f6', '#fb923c', '#facc15'];

  for (let y = 1; y < H - 1; y++) {
    if (y % 2 === 0) continue; // 홀수층만 창문
    for (let x = -W/2 + 1; x < W/2 - 1; x++) {
      for (let z = -D/2 + 1; z < D/2 - 1; z++) {
        // 외벽 안쪽 한 줄만
        const onWall =
          (x === -W/2 + 1 || x === W/2 - 2) ||
          (z === -D/2 + 1 || z === D/2 - 2);
        if (!onWall) continue;
        if (r() > 0.45) continue; // 절반 정도만 점등
        const c = colors[Math.floor(r() * colors.length)];
        // 외벽 살짝 바깥으로
        let dx = 0, dz = 0;
        if (x === -W/2 + 1) dx = -0.55;
        if (x === W/2 - 2)  dx = 0.55;
        if (z === -D/2 + 1) dz = -0.55;
        if (z === D/2 - 2)  dz = 0.55;
        data.push({ x: x + dx, y, z: z + dz, color: c });
      }
    }
  }
  return data;
}

// ── 3. 주변 도시 ───────────────────────────
function buildSurrounding() {
  const data = [];
  const r = rng(42);
  const palette = ['#374151', '#1f2937', '#475569', '#334155'];

  // 4사분면에 작은 빌딩들 배치
  const positions = [
    { cx: -16, cz: -16 }, { cx: -16, cz: 16 },
    { cx: 16, cz: -16 },  { cx: 16, cz: 16 },
    { cx: -22, cz: 0 },   { cx: 22, cz: 0 },
    { cx: 0, cz: -22 },   { cx: 0, cz: 22 },
    { cx: -12, cz: -22 }, { cx: 12, cz: -22 },
    { cx: -22, cz: -12 }, { cx: 22, cz: -12 },
    { cx: -22, cz: 12 },  { cx: 22, cz: 12 },
    { cx: -12, cz: 22 },  { cx: 12, cz: 22 },
  ];

  positions.forEach(({ cx, cz }) => {
    const w = 2 + Math.floor(r() * 3);
    const d = 2 + Math.floor(r() * 3);
    const h = 4 + Math.floor(r() * 12);
    const baseColor = palette[Math.floor(r() * palette.length)];
    for (let y = 0; y < h; y++) {
      for (let x = -w; x <= w; x++) {
        for (let z = -d; z <= d; z++) {
          if (Math.abs(x) === w || Math.abs(z) === d || y === 0 || y === h - 1) {
            data.push({ x: cx + x, y, z: cz + z, color: baseColor });
          }
        }
      }
    }
  });

  return data;
}

// ── 4. 작은 창문(주변 도시) ────────────────
function buildSurroundingWindows() {
  const data = [];
  const r = rng(99);
  const colors = ['#fbbf24', '#fde68a', '#3b82f6', '#fb923c'];

  // 빌딩별 무작위 창문
  const positions = [
    { cx: -16, cz: -16 }, { cx: -16, cz: 16 },
    { cx: 16, cz: -16 },  { cx: 16, cz: 16 },
    { cx: -22, cz: 0 },   { cx: 22, cz: 0 },
    { cx: 0, cz: -22 },   { cx: 0, cz: 22 },
    { cx: -22, cz: -12 }, { cx: 22, cz: -12 },
    { cx: -22, cz: 12 },  { cx: 22, cz: 12 },
  ];
  positions.forEach(({ cx, cz }) => {
    for (let i = 0; i < 12; i++) {
      const x = cx + (r() - 0.5) * 6;
      const y = 1 + Math.floor(r() * 10);
      const z = cz + (r() - 0.5) * 6;
      const c = colors[Math.floor(r() * colors.length)];
      if (r() > 0.5) data.push({ x, y, z, color: c });
    }
  });
  return data;
}

// ── 5. 도로 ───────────────────────────────
function buildStreets() {
  const data = [];
  const grayDark = '#0a0e1a';
  // 십자 도로
  for (let x = -28; x <= 28; x++) {
    for (let z = -2; z <= 2; z++) data.push({ x, y: -0.4, z, color: grayDark });
  }
  for (let z = -28; z <= 28; z++) {
    for (let x = -2; x <= 2; x++) data.push({ x, y: -0.4, z, color: grayDark });
  }
  return data;
}

// ────────────────────────────────────────────
// InstancedMesh 컴포넌트
// ────────────────────────────────────────────
function VoxelInstances({ data, emissive = false, size = 1 }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    data.forEach((v, i) => {
      dummy.position.set(v.x, v.y, v.z);
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, tmpColor.set(v.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [data, size]);

  return (
    <instancedMesh ref={ref} args={[null, null, data.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {emissive ? (
        <meshStandardMaterial flatShading vertexColors emissive="#ffffff" emissiveIntensity={1.4} />
      ) : (
        <meshStandardMaterial flatShading vertexColors roughness={0.7} metalness={0.1} />
      )}
    </instancedMesh>
  );
}

// 자동 오빗 카메라
function AutoOrbit({ speed = 0.05, radius = 38, height = 22, target = [0, 8, 0] }) {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    camera.position.set(Math.sin(t) * radius, height, Math.cos(t) * radius);
    camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

// ────────────────────────────────────────────
// 메인 디오라마
// ────────────────────────────────────────────
export default function VoxelBankDiorama() {
  const bankExterior = useMemo(buildBankExterior, []);
  const bankWindows  = useMemo(buildWindows, []);
  const surrounding  = useMemo(buildSurrounding, []);
  const surroundingWindows = useMemo(buildSurroundingWindows, []);
  const streets      = useMemo(buildStreets, []);

  const totalVoxels = bankExterior.length + bankWindows.length + surrounding.length + surroundingWindows.length + streets.length;

  return (
    <>
      <fog attach="fog" args={['#020617', 28, 90]} />

      {/* 환경광 */}
      <ambientLight intensity={0.15} color="#1e3a8a" />
      <directionalLight position={[20, 30, 20]} intensity={0.4} color="#dbeafe" castShadow />
      {/* 메인 빌딩 강조 광 */}
      <pointLight position={[0, 30, 0]} intensity={20} color="#3b82f6" distance={40} decay={2} />
      <pointLight position={[0, 10, 12]} intensity={3} color="#fbbf24" distance={10} decay={2} />

      {/* 도로 */}
      <VoxelInstances data={streets} size={1} />
      {/* 주변 도시 */}
      <VoxelInstances data={surrounding} />
      <VoxelInstances data={surroundingWindows} emissive size={0.6} />
      {/* 본 빌딩 */}
      <VoxelInstances data={bankExterior} />
      <VoxelInstances data={bankWindows} emissive size={0.5} />

      {/* 옥상 안테나 (꼭대기 강조) */}
      <mesh position={[0, 30, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      <mesh position={[0, 32.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#000" emissive="#dc2626" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 32, 0]} intensity={3} color="#dc2626" distance={6} />

      <AutoOrbit speed={0.04} radius={38} height={22} target={[0, 8, 0]} />

      {/* totalVoxels 노출용 invisible — 부모에서 props로 받기보다 디버그용 */}
      <mesh visible={false} userData={{ totalVoxels }} />
    </>
  );
}

// 외부에서 voxel count 조회용 (HUD에서 사용)
export const VOXEL_COUNT_ESTIMATE = 5000;

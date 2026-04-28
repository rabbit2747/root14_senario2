/**
 * VoxelBankDiorama — InstancedMesh 야경 디오라마 (디테일 업그레이드)
 * 추가: 1F 로비 통유리, 정문 회전문, 좌우 ATM, OO BANK 간판,
 *       돌계단, 보도블럭, 가로수 voxel
 */
import { useMemo } from 'react';
import { rng, VoxelInstances, AutoOrbit } from '../voxel/shared';

// ── 1. 은행 본체 외벽 셸 ─────────────────────
function buildBankExterior() {
  const data = [];
  const W = 8, D = 8, H = 28;
  const facade = '#1f2937';
  const accent = '#374151';

  for (let y = 1; y < H; y++) { // 1F는 통유리(아래에서 별도 처리)
    for (let x = -W/2; x < W/2; x++) {
      for (let z = -D/2; z < D/2; z++) {
        const onEdge =
          x === -W/2 || x === W/2 - 1 ||
          z === -D/2 || z === D/2 - 1 ||
          y === H - 1;
        if (!onEdge) continue;
        // 5층 단위 어두운 코니스
        const isFloorLine = y % 5 === 0;
        const c = isFloorLine ? '#0f172a' : (y % 2 === 0 ? facade : accent);
        data.push({ x, y, z, color: c });
      }
    }
  }
  return data;
}

// ── 2. 1층 로비 통유리 + 기둥 ────────────────
function buildLobby() {
  const data = [];
  const W = 8, D = 8;
  // 모서리 4기둥
  for (let y = 0; y < 4; y++) {
    data.push({ x: -W/2, y, z: -D/2, color: '#0f172a' });
    data.push({ x: W/2 - 1, y, z: -D/2, color: '#0f172a' });
    data.push({ x: -W/2, y, z: D/2 - 1, color: '#0f172a' });
    data.push({ x: W/2 - 1, y, z: D/2 - 1, color: '#0f172a' });
  }
  // 1층 통유리 (전·후·좌·우)
  for (let y = 0; y < 4; y++) {
    // 전면 (z = D/2 - 1)
    for (let x = -W/2 + 1; x < W/2 - 1; x++) {
      data.push({ x, y, z: D/2 - 1, color: '#06b6d4' });
    }
    // 후면
    for (let x = -W/2 + 1; x < W/2 - 1; x++) {
      data.push({ x, y, z: -D/2, color: '#0e7490' });
    }
    // 측면
    for (let z = -D/2 + 1; z < D/2 - 1; z++) {
      data.push({ x: -W/2, y, z, color: '#0e7490' });
      data.push({ x: W/2 - 1, y, z, color: '#0e7490' });
    }
  }
  // 1층 천장 보더
  for (let x = -W/2; x < W/2; x++) {
    data.push({ x, y: 4, z: D/2 - 1, color: '#1f2937' });
    data.push({ x, y: 4, z: -D/2, color: '#1f2937' });
  }
  for (let z = -D/2; z < D/2; z++) {
    data.push({ x: -W/2, y: 4, z, color: '#1f2937' });
    data.push({ x: W/2 - 1, y: 4, z, color: '#1f2937' });
  }
  return data;
}

// ── 3. 정문 (회전문 — 4사분원 박스) ──────────
function buildEntrance() {
  const data = [];
  // 정문 상단 캐노피
  for (let x = -2; x <= 1; x++) {
    data.push({ x, y: 3, z: 5, color: '#fbbf24' });
  }
  // 정문 좌·우 프레임
  for (let y = 0; y < 3; y++) {
    data.push({ x: -2, y, z: 4, color: '#27272a' });
    data.push({ x: 1, y, z: 4, color: '#27272a' });
  }
  // 회전문 — 십자 4분 (윗부분)
  data.push({ x: -1, y: 1, z: 4, color: '#06b6d4' });
  data.push({ x: 0, y: 1, z: 4, color: '#06b6d4' });
  data.push({ x: -1, y: 2, z: 4, color: '#06b6d4' });
  data.push({ x: 0, y: 2, z: 4, color: '#06b6d4' });
  // 입구 발판
  for (let x = -3; x <= 2; x++) {
    for (let z = 4; z <= 6; z++) {
      data.push({ x, y: -0.4, z, color: '#94a3b8' });
    }
  }
  // 계단 한 단
  for (let x = -3; x <= 2; x++) {
    data.push({ x, y: -0.7, z: 6, color: '#64748b' });
  }
  return data;
}

// ── 4. ATM 박스 (좌·우 1대씩) ────────────────
function buildATMs() {
  const data = [];
  const positions = [{ x: -5, z: 5 }, { x: 4, z: 5 }];
  positions.forEach(({ x, z }) => {
    // 본체
    for (let dy = 0; dy < 2; dy++) {
      data.push({ x, y: dy, z, color: '#1e293b' });
    }
    // 화면 발광
    data.push({ x, y: 1.5, z: z + 0.5, color: '#22c55e', emissive: true });
  });
  return data;
}

// ── 5. OO BANK 간판 ───────────────────────────
function buildSignage() {
  const data = [];
  // O O 두 글자를 voxel로 표현 (5x5 ring × 2)
  // 좌측 O (x: -3 ~ -1)
  const oPattern = [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ];
  // y는 5층 정도 (위쪽 빌딩 외벽에 부착)
  const baseY = 5;
  oPattern.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell) {
        // 좌측 O
        data.push({ x: -3.5 + ci * 0.9, y: baseY + (4 - ri) * 0.9, z: 4.05, color: '#000', emissive: true, emissiveColor: '#fbbf24' });
        // 우측 O
        data.push({ x: 0 + ci * 0.9, y: baseY + (4 - ri) * 0.9, z: 4.05, color: '#000', emissive: true, emissiveColor: '#fbbf24' });
      }
    });
  });
  return data;
}

// ── 6. 가로수 ────────────────────────────────
function buildTrees() {
  const data = [];
  const r = rng(123);
  const positions = [
    { x: -8, z: 6 }, { x: 7, z: 6 },
    { x: -10, z: 8 }, { x: 9, z: 8 },
    { x: -8, z: -8 }, { x: 7, z: -8 },
  ];
  positions.forEach(({ x, z }) => {
    // 줄기
    data.push({ x, y: 0, z, color: '#78350f' });
    data.push({ x, y: 1, z, color: '#78350f' });
    // 잎 (복셀 구체)
    const leafColor = r() > 0.5 ? '#16a34a' : '#15803d';
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        data.push({ x: x + dx, y: 2, z: z + dz, color: leafColor });
      }
    }
    data.push({ x, y: 3, z, color: leafColor });
  });
  return data;
}

// ── 7. 창문 (발광) ─────────────────────────
function buildWindows() {
  const data = [];
  const r = rng(7);
  const W = 8, D = 8, H = 28;
  const colors = ['#fbbf24', '#fde68a', '#3b82f6', '#fb923c', '#facc15'];

  for (let y = 5; y < H - 1; y++) {
    if (y % 2 === 0) continue;
    for (let x = -W/2 + 1; x < W/2 - 1; x++) {
      for (let z = -D/2 + 1; z < D/2 - 1; z++) {
        const onWall =
          (x === -W/2 + 1 || x === W/2 - 2) ||
          (z === -D/2 + 1 || z === D/2 - 2);
        if (!onWall) continue;
        if (r() > 0.45) continue;
        const c = colors[Math.floor(r() * colors.length)];
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

// ── 8. 주변 도시 ─────────────────────────────
function buildSurrounding() {
  const data = [];
  const r = rng(42);
  const palette = ['#374151', '#1f2937', '#475569', '#334155'];
  const positions = [
    { cx: -16, cz: -16 }, { cx: -16, cz: 16 },
    { cx: 16, cz: -16 },  { cx: 16, cz: 16 },
    { cx: -22, cz: 0 },   { cx: 22, cz: 0 },
    { cx: 0, cz: -22 },   { cx: 0, cz: 22 },
    { cx: -22, cz: -12 }, { cx: 22, cz: -12 },
    { cx: -22, cz: 12 },  { cx: 22, cz: 12 },
  ];
  positions.forEach(({ cx, cz }) => {
    const w = 2 + Math.floor(r() * 3);
    const d = 2 + Math.floor(r() * 3);
    const h = 4 + Math.floor(r() * 12);
    const c = palette[Math.floor(r() * palette.length)];
    for (let y = 0; y < h; y++) {
      for (let x = -w; x <= w; x++) {
        for (let z = -d; z <= d; z++) {
          if (Math.abs(x) === w || Math.abs(z) === d || y === 0 || y === h - 1) {
            data.push({ x: cx + x, y, z: cz + z, color: c });
          }
        }
      }
    }
  });
  return data;
}

function buildSurroundingWindows() {
  const data = [];
  const r = rng(99);
  const colors = ['#fbbf24', '#fde68a', '#3b82f6', '#fb923c'];
  const positions = [
    { cx: -16, cz: -16 }, { cx: -16, cz: 16 },
    { cx: 16, cz: -16 },  { cx: 16, cz: 16 },
    { cx: -22, cz: 0 },   { cx: 22, cz: 0 },
    { cx: 0, cz: -22 },   { cx: 0, cz: 22 },
    { cx: -22, cz: -12 }, { cx: 22, cz: -12 },
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

function buildStreets() {
  const data = [];
  for (let x = -28; x <= 28; x++) {
    for (let z = -2; z <= 2; z++) data.push({ x, y: -0.4, z, color: '#0a0e1a' });
  }
  for (let z = -28; z <= 28; z++) {
    for (let x = -2; x <= 2; x++) data.push({ x, y: -0.4, z, color: '#0a0e1a' });
  }
  // 보도블럭 (은행 앞)
  for (let x = -7; x <= 6; x++) {
    for (let z = 5; z <= 9; z++) data.push({ x, y: -0.45, z, color: '#374151' });
  }
  return data;
}

// ────────────────────────────────────────────
export default function VoxelBankDiorama() {
  const exterior     = useMemo(buildBankExterior, []);
  const lobby        = useMemo(buildLobby, []);
  const entrance     = useMemo(buildEntrance, []);
  const atms         = useMemo(buildATMs, []);
  const signage      = useMemo(buildSignage, []);
  const trees        = useMemo(buildTrees, []);
  const windows      = useMemo(buildWindows, []);
  const surrounding  = useMemo(buildSurrounding, []);
  const surrWindows  = useMemo(buildSurroundingWindows, []);
  const streets      = useMemo(buildStreets, []);

  // emissive 분리
  const lobbyEmissive = lobby.filter((d) => ['#06b6d4','#0e7490'].includes(d.color));
  const lobbySolid    = lobby.filter((d) => !['#06b6d4','#0e7490'].includes(d.color));

  const entranceEmissive = entrance.filter((d) => d.color === '#06b6d4' || d.color === '#fbbf24');
  const entranceSolid    = entrance.filter((d) => d.color !== '#06b6d4' && d.color !== '#fbbf24');

  const atmEmissive = atms.filter((d) => d.emissive);
  const atmSolid    = atms.filter((d) => !d.emissive);

  return (
    <>
      <fog attach="fog" args={['#020617', 28, 90]} />
      <ambientLight intensity={0.15} color="#1e3a8a" />
      <directionalLight position={[20, 30, 20]} intensity={0.4} color="#dbeafe" castShadow />
      <pointLight position={[0, 30, 0]} intensity={20} color="#3b82f6" distance={40} decay={2} />
      <pointLight position={[0, 6, 8]} intensity={4} color="#fbbf24" distance={12} decay={2} />
      <pointLight position={[0, 2, 6]} intensity={2.5} color="#06b6d4" distance={8} decay={2} />

      {/* 도로·보도 */}
      <VoxelInstances data={streets} size={1} />
      {/* 주변 도시 */}
      <VoxelInstances data={surrounding} />
      <VoxelInstances data={surrWindows} emissive size={0.6} />
      {/* 가로수 */}
      <VoxelInstances data={trees} />
      {/* 1층 로비 */}
      <VoxelInstances data={lobbySolid} />
      <VoxelInstances data={lobbyEmissive} emissive opacity={0.7} />
      {/* 정문·캐노피·계단 */}
      <VoxelInstances data={entranceSolid} />
      <VoxelInstances data={entranceEmissive} emissive />
      {/* ATM */}
      <VoxelInstances data={atmSolid} />
      <VoxelInstances data={atmEmissive} emissive size={0.4} />
      {/* OO 간판 */}
      <VoxelInstances data={signage} emissive size={0.7} />
      {/* 빌딩 외벽 + 창문 */}
      <VoxelInstances data={exterior} />
      <VoxelInstances data={windows} emissive size={0.5} />

      {/* 옥상 안테나 */}
      <mesh position={[0, 30, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      <mesh position={[0, 32.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#000" emissive="#dc2626" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[0, 32, 0]} intensity={2} color="#dc2626" distance={6} />

      <AutoOrbit speed={0.025} radius={38} height={22} target={[0, 8, 0]} />
    </>
  );
}

export const VOXEL_COUNT_ESTIMATE = 5800;

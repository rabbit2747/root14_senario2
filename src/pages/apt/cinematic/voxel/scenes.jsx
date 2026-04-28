/**
 * voxel/scenes — 시나리오 클립별 절차적 복셀 씬 모음
 * 모든 씬은 InstancedMesh + 자체 카메라/조명을 포함
 * 각 씬은 default export 컴포넌트 + 카메라 props 받음
 */
import { useMemo } from 'react';
import { rng, VoxelInstances, AutoOrbit, StaticCamera, DollyForward, TiltUp } from './shared';

// ════════════════════════════════════════════
// 1. LOBBY — 빈 복도, 일점 소실, 형광등
// ════════════════════════════════════════════
function buildLobbyData() {
  const data = [];
  // 좌·우 벽
  for (let z = -10; z <= 4; z++) {
    for (let y = 0; y < 5; y++) {
      data.push({ x: -3, y, z, color: y === 4 ? '#0f172a' : '#1e293b' });
      data.push({ x:  3, y, z, color: y === 4 ? '#0f172a' : '#1e293b' });
    }
  }
  // 바닥 + 천장
  for (let z = -10; z <= 4; z++) {
    for (let x = -3; x <= 3; x++) {
      data.push({ x, y: -1, z, color: '#0a0e1a' });
      data.push({ x, y: 5, z, color: '#1e293b' });
    }
  }
  // 문 (좌우 격자로 4개)
  for (let zd = -8; zd <= 0; zd += 4) {
    for (let dy = 0; dy < 3; dy++) {
      data.push({ x: -2.7, y: dy, z: zd,     color: '#27272a' });
      data.push({ x: -2.7, y: dy, z: zd + 1, color: '#27272a' });
      data.push({ x: 2.7,  y: dy, z: zd,     color: '#27272a' });
      data.push({ x: 2.7,  y: dy, z: zd + 1, color: '#27272a' });
    }
  }
  return data;
}
function buildLobbyLights() {
  const data = [];
  for (let z = -8; z <= 2; z += 4) {
    data.push({ x: 0, y: 4.6, z, color: '#000', sx: 1.6, sy: 0.3, sz: 0.6 });
  }
  return data;
}
export function LobbyScene() {
  const walls = useMemo(buildLobbyData, []);
  const lights = useMemo(buildLobbyLights, []);
  return (
    <>
      <fog attach="fog" args={['#020617', 8, 24]} />
      <ambientLight intensity={0.15} color="#1e3a8a" />
      {[-6, -2, 2].map((z) => (
        <pointLight key={z} position={[0, 4, z]} intensity={6} color="#dbeafe" distance={6} decay={2} />
      ))}
      <VoxelInstances data={walls} />
      <VoxelInstances data={lights} emissive />
      <DollyForward from={[0, 2.5, 14]} to={[0, 2.2, -2]} duration={5} target={[0, 2, -8]} />
    </>
  );
}

// ════════════════════════════════════════════
// 2. ADMIN-PC — 책상·모니터(보라 발광)·의자·서랍
// ════════════════════════════════════════════
function buildAdminPCSolid() {
  const data = [];
  // 바닥
  for (let x = -6; x <= 6; x++) for (let z = -3; z <= 5; z++) {
    data.push({ x, y: -1, z, color: '#0c0a09' });
  }
  // 책상 상판
  for (let x = -3; x <= 3; x++) for (let z = -1; z <= 1; z++) {
    data.push({ x, y: 1, z, color: '#3f3f46' });
  }
  // 책상 다리
  data.push({ x: -3, y: 0, z: -1, color: '#18181b' });
  data.push({ x: 3, y: 0, z: -1, color: '#18181b' });
  data.push({ x: -3, y: 0, z: 1, color: '#18181b' });
  data.push({ x: 3, y: 0, z: 1, color: '#18181b' });
  // 모니터 받침대
  data.push({ x: 0, y: 1.6, z: 0, color: '#27272a' });
  // 의자
  data.push({ x: 0, y: 0, z: 2.5, color: '#5b21b6' });
  data.push({ x: 0, y: 1, z: 2.5, color: '#5b21b6' });
  data.push({ x: 0, y: 1.5, z: 3, color: '#7c3aed' });
  // 서랍장 (좌측)
  for (let y = 0; y < 2; y++) data.push({ x: -5, y, z: 0, color: '#27272a' });
  // 키보드
  for (let x = -2; x <= 2; x++) data.push({ x, y: 1.1, z: 0.7, sx: 1, sy: 0.1, sz: 0.4, color: '#1c1917' });
  return data;
}
function buildAdminPCEmissive() {
  const data = [];
  // 모니터 화면 (3x2)
  for (let x = -1; x <= 1; x++) for (let y = 2; y <= 3; y++) {
    data.push({ x, y, z: -0.3, color: '#a855f7' });
  }
  // 책상 위 머그컵 (작은 노란 점)
  data.push({ x: 2, y: 1.6, z: 0.3, color: '#fde68a' });
  return data;
}
export function AdminPCScene() {
  const solid = useMemo(buildAdminPCSolid, []);
  const emi = useMemo(buildAdminPCEmissive, []);
  return (
    <>
      <fog attach="fog" args={['#0a0e1a', 6, 20]} />
      <ambientLight intensity={0.1} color="#1e1b4b" />
      <pointLight position={[0, 3, -1]} intensity={4} color="#a855f7" distance={5} decay={2} />
      <pointLight position={[0, 2.5, 1]} intensity={2} color="#7c3aed" distance={4} />
      <VoxelInstances data={solid} />
      <VoxelInstances data={emi} emissive />
      <StaticCamera pos={[2, 2.5, 4]} look={[0, 2, 0]} fov={42} />
    </>
  );
}

// ════════════════════════════════════════════
// 3. FIREWALL — 코드/로그 벽 (수많은 작은 voxel 텍스트)
// ════════════════════════════════════════════
function buildFirewallData() {
  const data = [];
  const r = rng(11);
  const colors = ['#22c55e', '#16a34a', '#06b6d4', '#0891b2'];
  for (let row = 0; row < 30; row++) {
    let x = -8;
    while (x < 8) {
      const len = 1 + Math.floor(r() * 4);
      const c = colors[Math.floor(r() * colors.length)];
      for (let i = 0; i < len && x < 8; i++) {
        data.push({ x, y: 8 - row * 0.3, z: 0, sx: 0.4, sy: 0.2, sz: 0.1, color: c });
        x += 0.5;
      }
      x += 0.4 + r() * 0.5;
    }
  }
  return data;
}
export function FirewallScene() {
  const data = useMemo(buildFirewallData, []);
  return (
    <>
      <fog attach="fog" args={['#020617', 6, 16]} />
      <ambientLight intensity={0.08} color="#000" />
      <pointLight position={[0, 4, 5]} intensity={3} color="#22c55e" distance={8} />
      <VoxelInstances data={data} emissive />
      <StaticCamera pos={[0, 4, 8]} look={[0, 4, 0]} fov={38} />
    </>
  );
}

// ════════════════════════════════════════════
// 4. FAST-TYPING — 키보드 + 빠르게 흔들리는 카메라
// ════════════════════════════════════════════
function buildKeyboardData() {
  const data = [];
  // 베이스
  for (let x = -5; x <= 5; x++) for (let z = -2; z <= 2; z++) {
    data.push({ x, y: 0, z, color: '#1c1917' });
  }
  // 키들 (10x4)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 11; col++) {
      data.push({
        x: -5 + col, y: 0.5, z: -1.5 + row,
        sx: 0.85, sy: 0.4, sz: 0.85,
        color: row === 3 ? '#27272a' : '#3f3f46',
      });
    }
  }
  // 스페이스 바
  for (let x = -2; x <= 2; x++) {
    data.push({ x, y: 0.5, z: 1.7, sx: 1, sy: 0.4, sz: 1, color: '#27272a' });
  }
  return data;
}
function buildKeyboardLights() {
  const data = [];
  const r = rng(33);
  // 무작위 빛나는 키 (RGB 백라이트)
  const colors = ['#dc2626', '#fbbf24', '#22c55e', '#3b82f6'];
  for (let i = 0; i < 18; i++) {
    const col = Math.floor(r() * 11);
    const row = Math.floor(r() * 4);
    data.push({
      x: -5 + col, y: 0.85, z: -1.5 + row,
      sx: 0.85, sy: 0.05, sz: 0.85,
      color: colors[Math.floor(r() * colors.length)],
    });
  }
  return data;
}
export function FastTypingScene() {
  const kb = useMemo(buildKeyboardData, []);
  const lights = useMemo(buildKeyboardLights, []);
  return (
    <>
      <fog attach="fog" args={['#0c0a09', 5, 15]} />
      <ambientLight intensity={0.1} color="#dc2626" />
      <pointLight position={[0, 3, 2]} intensity={3} color="#fbbf24" distance={6} />
      <pointLight position={[-3, 2, -3]} intensity={2} color="#dc2626" distance={5} />
      <VoxelInstances data={kb} />
      <VoxelInstances data={lights} emissive />
      <StaticCamera pos={[3, 4, 5]} look={[0, 0.5, 0]} fov={38} />
    </>
  );
}

// ════════════════════════════════════════════
// 5. STEALTH-MOUSE — 마우스 + 천천히
// ════════════════════════════════════════════
function buildStealthMouseData() {
  const data = [];
  // 마우스패드
  for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++) {
    data.push({ x, y: 0, z, color: '#0c4a6e' });
  }
  // 마우스 (둥근 형태)
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 2; dz++) {
    if (Math.abs(dx) === 1 && (dz === -1 || dz === 2)) continue;
    data.push({ x: dx, y: 0.5, z: dz, color: '#1c1917' });
  }
  data.push({ x: 0, y: 0.85, z: 0, color: '#27272a', sx: 0.4, sy: 0.05, sz: 0.5 });
  // 마우스 휠
  data.push({ x: 0, y: 1, z: -0.3, sx: 0.3, sy: 0.3, sz: 0.3, color: '#dc2626' });
  return data;
}
export function StealthMouseScene() {
  const data = useMemo(buildStealthMouseData, []);
  return (
    <>
      <fog attach="fog" args={['#082f49', 5, 14]} />
      <ambientLight intensity={0.1} color="#0891b2" />
      <pointLight position={[0, 5, 3]} intensity={3} color="#06b6d4" distance={8} />
      <pointLight position={[2, 2, 0]} intensity={1.5} color="#3b82f6" distance={4} />
      <VoxelInstances data={data} />
      <DollyForward from={[5, 4, 6]} to={[2, 2.5, 3]} duration={5} target={[0, 0.5, 0]} />
    </>
  );
}

// ════════════════════════════════════════════
// 6. CMD-PROMPT — 큰 터미널 화면 (가까이)
// ════════════════════════════════════════════
function buildTerminalData() {
  const data = [];
  // 화면 베이스
  for (let x = -8; x <= 8; x++) for (let y = -4; y <= 4; y++) {
    data.push({ x, y, z: 0, color: '#0a0a0a' });
  }
  return data;
}
function buildTerminalText() {
  const data = [];
  const r = rng(57);
  // ~10줄 랜덤 텍스트
  for (let row = 0; row < 10; row++) {
    let x = -7;
    while (x < 7) {
      const len = 1 + Math.floor(r() * 5);
      for (let i = 0; i < len && x < 7; i++) {
        data.push({
          x, y: 3.5 - row * 0.8, z: 0.05,
          sx: 0.4, sy: 0.3, sz: 0.05,
          color: '#22c55e',
        });
        x += 0.5;
      }
      x += 0.4;
    }
  }
  // 커서 (마지막 줄)
  data.push({ x: 1, y: -3.7, z: 0.05, sx: 0.4, sy: 0.5, sz: 0.05, color: '#22c55e' });
  return data;
}
export function CmdPromptScene() {
  const screen = useMemo(buildTerminalData, []);
  const text = useMemo(buildTerminalText, []);
  return (
    <>
      <fog attach="fog" args={['#000', 6, 16]} />
      <ambientLight intensity={0.06} color="#22c55e" />
      <pointLight position={[0, 0, 6]} intensity={4} color="#22c55e" distance={10} />
      <VoxelInstances data={screen} />
      <VoxelInstances data={text} emissive />
      <StaticCamera pos={[0, 0, 12]} look={[0, 0, 0]} fov={36} />
    </>
  );
}

// ════════════════════════════════════════════
// 7. SERVER-RACK — 4대 서버랙 + LED
// ════════════════════════════════════════════
function buildServerRackSolid() {
  const data = [];
  // 바닥 격자 (래치드)
  for (let x = -6; x <= 6; x++) for (let z = -3; z <= 5; z++) {
    data.push({ x, y: -1, z, color: '#082f49' });
  }
  // 4 서버랙
  for (let i = 0; i < 4; i++) {
    const x = -4.5 + i * 3;
    for (let y = 0; y < 6; y++) {
      data.push({ x, y, z: 0, sx: 1.5, sy: 1, sz: 1, color: '#0c0a09' });
    }
  }
  return data;
}
function buildServerRackLEDs() {
  const data = [];
  const r = rng(77);
  for (let i = 0; i < 4; i++) {
    const x = -4.5 + i * 3;
    for (let y = 0; y < 6; y += 0.5) {
      const c = r() > 0.5 ? '#06b6d4' : '#22c55e';
      // 좌우 LED 줄
      data.push({ x: x - 0.5, y, z: 0.55, sx: 0.1, sy: 0.1, sz: 0.05, color: c });
      data.push({ x: x + 0.5, y, z: 0.55, sx: 0.1, sy: 0.1, sz: 0.05, color: c });
    }
  }
  return data;
}
export function ServerRackScene() {
  const solid = useMemo(buildServerRackSolid, []);
  const leds = useMemo(buildServerRackLEDs, []);
  return (
    <>
      <fog attach="fog" args={['#020617', 8, 25]} />
      <ambientLight intensity={0.1} color="#0891b2" />
      <pointLight position={[0, 6, 4]} intensity={5} color="#06b6d4" distance={10} />
      <pointLight position={[0, 2, 5]} intensity={3} color="#22c55e" distance={6} />
      <VoxelInstances data={solid} />
      <VoxelInstances data={leds} emissive />
      <TiltUp from={[6, 1, 8]} to={[2, 6, 6]} duration={6} target={[0, 3, 0]} />
    </>
  );
}

// ════════════════════════════════════════════
// 8. NETWORK-TRAFFIC (SMB) — 노드 + 패킷
// ════════════════════════════════════════════
function buildNetworkNodes() {
  const data = [];
  const positions = [
    { x: -4, y: 0, z: -2 }, { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: -2 },
    { x: -2, y: 0, z: 3 }, { x: 2, y: 0, z: 3 },
  ];
  positions.forEach(({ x, y, z }) => {
    // 노드 큐브
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      data.push({ x: x + dx * 0.5, y, z: z + dz * 0.5, sx: 0.5, sy: 0.5, sz: 0.5, color: '#3b82f6' });
    }
  });
  return data;
}
function buildNetworkPackets() {
  const data = [];
  // 라인을 따라 패킷 voxel
  const lines = [
    [{x:-4,z:-2},{x:0,z:0}],
    [{x:0,z:0},{x:4,z:-2}],
    [{x:0,z:0},{x:-2,z:3}],
    [{x:0,z:0},{x:2,z:3}],
  ];
  lines.forEach(([a, b], li) => {
    for (let t = 0; t <= 1; t += 0.1) {
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      data.push({ x, y: 0.5, z, sx: 0.25, sy: 0.25, sz: 0.25, color: '#22d3ee' });
    }
  });
  return data;
}
export function NetworkTrafficScene() {
  const nodes = useMemo(buildNetworkNodes, []);
  const packets = useMemo(buildNetworkPackets, []);
  return (
    <>
      <fog attach="fog" args={['#020617', 8, 22]} />
      <ambientLight intensity={0.12} color="#1e40af" />
      <pointLight position={[0, 6, 0]} intensity={5} color="#3b82f6" distance={12} />
      <VoxelInstances data={nodes} />
      <VoxelInstances data={packets} emissive />
      <AutoOrbit speed={0.06} radius={10} height={4} target={[0, 0, 0.5]} />
    </>
  );
}

// ════════════════════════════════════════════
// 9. SHELL-WINDOW (PowerShell) — 부유 창 1개
// ════════════════════════════════════════════
function buildShellWindow() {
  const data = [];
  // 창 프레임
  for (let x = -6; x <= 6; x++) {
    data.push({ x, y: 4, z: 0, color: '#1e40af' });
    data.push({ x, y: -3, z: 0, color: '#1e40af' });
  }
  for (let y = -3; y <= 4; y++) {
    data.push({ x: -6, y, z: 0, color: '#1e40af' });
    data.push({ x: 6, y, z: 0, color: '#1e40af' });
  }
  // 창 안 (배경)
  for (let x = -5; x <= 5; x++) for (let y = -2; y <= 3; y++) {
    data.push({ x, y, z: -0.05, color: '#0a0e1a' });
  }
  return data;
}
function buildShellText() {
  const data = [];
  const r = rng(89);
  for (let row = 0; row < 6; row++) {
    let x = -4.5;
    while (x < 5) {
      const len = 1 + Math.floor(r() * 4);
      for (let i = 0; i < len && x < 5; i++) {
        data.push({
          x, y: 2.3 - row * 0.8, z: 0.05,
          sx: 0.35, sy: 0.3, sz: 0.05,
          color: '#3b82f6',
        });
        x += 0.4;
      }
      x += 0.3;
    }
  }
  return data;
}
export function ShellWindowScene() {
  const win = useMemo(buildShellWindow, []);
  const txt = useMemo(buildShellText, []);
  return (
    <>
      <fog attach="fog" args={['#020617', 6, 18]} />
      <ambientLight intensity={0.08} color="#1e40af" />
      <pointLight position={[0, 0, 5]} intensity={4} color="#3b82f6" distance={12} />
      <VoxelInstances data={win} emissive />
      <VoxelInstances data={txt} emissive />
      <StaticCamera pos={[0, 0, 12]} look={[0, 0, 0]} fov={36} />
    </>
  );
}

// ════════════════════════════════════════════
// 10. FINAL-PROMPT — 빨간 경고등 (펄스)
// ════════════════════════════════════════════
function buildAlertSign() {
  const data = [];
  // 삼각형 경고 표지 (피라미드)
  const tri = [
    [0,0],[-2,-3],[2,-3],
    [-1,-1],[1,-1],[-1.5,-2],[1.5,-2],
  ];
  tri.forEach(([x, y]) => {
    data.push({ x, y, z: 0, sx: 1, sy: 1, sz: 0.5, color: '#dc2626' });
  });
  // ! 마크
  for (let dy = -2.5; dy <= -1; dy += 0.4) {
    data.push({ x: 0, y: dy, z: 0.3, sx: 0.3, sy: 0.4, sz: 0.1, color: '#000' });
  }
  data.push({ x: 0, y: -1.6, z: 0.3, sx: 0.3, sy: 0.3, sz: 0.1, color: '#000' });
  return data;
}
export function FinalPromptScene() {
  const data = useMemo(buildAlertSign, []);
  return (
    <>
      <fog attach="fog" args={['#1c0a0a', 4, 14]} />
      <ambientLight intensity={0.1} color="#7c2d12" />
      <pointLight position={[0, 0, 5]} intensity={6} color="#dc2626" distance={12} />
      <pointLight position={[2, 2, 4]} intensity={3} color="#fb923c" distance={6} />
      <VoxelInstances data={data} emissive />
      <StaticCamera pos={[0, -1, 8]} look={[0, -1.5, 0]} fov={40} />
    </>
  );
}

// ════════════════════════════════════════════
// 11. DATA-TRANSFER — 진행바 + 화살표
// ════════════════════════════════════════════
function buildProgressBar() {
  const data = [];
  // 빈 바 outline
  for (let x = -6; x <= 6; x++) {
    data.push({ x, y: 1, z: 0, color: '#0c4a6e' });
    data.push({ x, y: -1, z: 0, color: '#0c4a6e' });
  }
  data.push({ x: -6, y: 0, z: 0, color: '#0c4a6e' });
  data.push({ x: 6, y: 0, z: 0, color: '#0c4a6e' });
  // 채워진 부분 (75%)
  for (let x = -5.5; x <= 3; x += 0.5) {
    data.push({ x, y: 0, z: 0, sx: 0.4, sy: 1.6, sz: 0.4, color: '#06b6d4' });
  }
  // 화살표 (오른쪽으로 떠나는)
  for (let i = 0; i < 5; i++) {
    data.push({ x: 4 + i * 1.2, y: 0, z: 0, sx: 0.5, sy: 0.5, sz: 0.5, color: '#22d3ee' });
  }
  return data;
}
export function DataTransferScene() {
  const data = useMemo(buildProgressBar, []);
  return (
    <>
      <fog attach="fog" args={['#020617', 6, 18]} />
      <ambientLight intensity={0.1} color="#0891b2" />
      <pointLight position={[0, 0, 5]} intensity={5} color="#06b6d4" distance={12} />
      <VoxelInstances data={data} emissive />
      <StaticCamera pos={[0, 0, 14]} look={[0, 0, 0]} fov={38} />
    </>
  );
}

// ════════════════════════════════════════════
// 12. RED-SCREENS (Ransom) — 모니터 벽
// ════════════════════════════════════════════
function buildRedScreens() {
  const data = [];
  // 9개 모니터 (3x3)
  for (let mx = 0; mx < 3; mx++) {
    for (let my = 0; my < 3; my++) {
      const cx = (mx - 1) * 4;
      const cy = (my - 1) * 3;
      // 프레임
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (Math.abs(dx) === 1 || Math.abs(dy) === 1) {
          data.push({ x: cx + dx * 1.5, y: cy + dy, z: 0, color: '#1c1917', sx: 0.3, sy: 0.3, sz: 0.4 });
        }
      }
      // 화면
      for (let dx = -1; dx <= 1; dx++) for (let dy = -0.5; dy <= 0.5; dy += 1) {
        data.push({ x: cx + dx, y: cy + dy, z: 0, sx: 0.9, sy: 0.9, sz: 0.05, color: '#dc2626' });
      }
    }
  }
  return data;
}
export function RedScreensScene() {
  const data = useMemo(buildRedScreens, []);
  return (
    <>
      <fog attach="fog" args={['#1c0a0a', 8, 20]} />
      <ambientLight intensity={0.15} color="#7c2d12" />
      <pointLight position={[0, 0, 8]} intensity={6} color="#dc2626" distance={20} />
      <VoxelInstances data={data} emissive />
      <DollyForward from={[12, 2, 12]} to={[0, 0, 8]} duration={6} target={[0, 0, 0]} />
    </>
  );
}

// ════════════════════════════════════════════
// 13. LOG-WIPE — 사라지는 voxel
// ════════════════════════════════════════════
function buildWipeData() {
  const data = [];
  const r = rng(13);
  // 무작위 분포 voxel (점점 사라지는 느낌의 격자)
  for (let i = 0; i < 200; i++) {
    const x = (r() - 0.5) * 14;
    const y = (r() - 0.5) * 6;
    const z = (r() - 0.5) * 4;
    const c = r() > 0.5 ? '#475569' : '#374151';
    data.push({ x, y, z, sx: 0.5, sy: 0.5, sz: 0.5, color: c });
  }
  return data;
}
export function LogWipeScene() {
  const data = useMemo(buildWipeData, []);
  return (
    <>
      <fog attach="fog" args={['#0a0a0a', 4, 12]} />
      <ambientLight intensity={0.1} color="#374151" />
      <pointLight position={[0, 0, 6]} intensity={2} color="#9ca3af" distance={10} />
      <VoxelInstances data={data} opacity={0.6} />
      <StaticCamera pos={[0, 0, 12]} look={[0, 0, 0]} fov={42} />
    </>
  );
}

// ════════════════════════════════════════════
// 14. NEWSPAPER — 신문 voxel + 헤드라인
// ════════════════════════════════════════════
function buildNewspaper() {
  const data = [];
  // 신문 베이스
  for (let x = -5; x <= 5; x++) for (let y = -4; y <= 4; y++) {
    data.push({ x, y, z: 0, color: '#fafaf9' });
  }
  // 가로줄 (텍스트 시뮬)
  for (let row = 0; row < 8; row++) {
    let x = -4.5;
    while (x < 4.5) {
      const len = 0.5 + Math.random() * 2;
      for (let i = 0; i < len; i += 0.3) {
        data.push({ x, y: 3 - row, z: 0.05, sx: 0.25, sy: 0.15, sz: 0.05, color: '#27272a' });
        x += 0.3;
      }
      x += 0.3 + Math.random() * 0.5;
    }
  }
  // 헤드라인 (큰 검은 줄)
  for (let x = -4; x <= 4; x++) {
    data.push({ x, y: 3.5, z: 0.06, sx: 0.9, sy: 0.5, sz: 0.05, color: '#000' });
  }
  return data;
}
export function NewspaperScene() {
  const data = useMemo(buildNewspaper, []);
  return (
    <>
      <fog attach="fog" args={['#1c1917', 6, 18]} />
      <ambientLight intensity={0.4} color="#fafaf9" />
      <directionalLight position={[3, 5, 6]} intensity={0.8} color="#fef3c7" />
      <VoxelInstances data={data} />
      <StaticCamera pos={[3, 1, 9]} look={[0, 0, 0]} fov={38} />
    </>
  );
}

// ════════════════════════════════════════════
// 15. CREDITS — 떠 있는 텍스트 voxel + 검은 배경
// ════════════════════════════════════════════
function buildCredits() {
  const data = [];
  // 가운데 가로 라인 (텍스트 위치)
  for (let row = 0; row < 6; row++) {
    let x = -5;
    while (x < 5) {
      const len = 1 + Math.random() * 3;
      for (let i = 0; i < len; i++) {
        data.push({
          x, y: 3 - row * 1.2, z: 0,
          sx: 0.4, sy: 0.4, sz: 0.4,
          color: row === 0 ? '#fbbf24' : '#94a3b8',
        });
        x += 0.5;
      }
      x += 0.5 + Math.random();
    }
  }
  return data;
}
export function CreditsScene() {
  const data = useMemo(buildCredits, []);
  return (
    <>
      <fog attach="fog" args={['#000', 6, 20]} />
      <ambientLight intensity={0.3} color="#1e293b" />
      <pointLight position={[0, 0, 6]} intensity={2} color="#fbbf24" distance={12} />
      <VoxelInstances data={data} emissive />
      <DollyForward from={[0, 0, 14]} to={[0, 2, 14]} duration={8} target={[0, 0, 0]} />
    </>
  );
}

// ════════════════════════════════════════════
// 16. CITY-NIGHT-WIDE — intro용 (기존 VoxelCityNight 호환)
// ════════════════════════════════════════════
import VoxelCityNight from './VoxelCityNight';
export function CityNightWideScene() {
  return (
    <>
      <VoxelCityNight />
    </>
  );
}

// ════════════════════════════════════════════
// 씬 디스패치 맵
// ════════════════════════════════════════════
export const SCENE_REGISTRY = {
  'city-night-wide':   CityNightWideScene,
  'lobby':             LobbyScene,
  'admin-pc':          AdminPCScene,
  'firewall':          FirewallScene,
  'fast-typing':       FastTypingScene,
  'stealth-mouse':     StealthMouseScene,
  'cmd-prompt':        CmdPromptScene,
  'server-rack':       ServerRackScene,
  'network-traffic':   NetworkTrafficScene,
  'shell-window':      ShellWindowScene,
  'final-prompt':      FinalPromptScene,
  'data-transfer':     DataTransferScene,
  'red-screens':       RedScreensScene,
  'log-wipe':          LogWipeScene,
  'newspaper':         NewspaperScene,
  'credits':           CreditsScene,
};

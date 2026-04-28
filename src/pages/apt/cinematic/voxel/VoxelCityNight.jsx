/**
 * VoxelCityNight — 절차적 복셀 도시 야경
 * - 30×30 그리드 위 무작위 높이 빌딩
 * - 각 빌딩에 무작위 창문 발광 큐브
 * - Crossy Road / Cubeworld 톤: flat shading, 16색 팔레트
 * - 외부 CC0 .glb 없이도 작동 — 사용자가 .glb 드롭하면 VoxelClip이 우선 사용
 */
import { useMemo } from 'react';

const BUILDING_COLORS = ['#4b5563', '#374151', '#1f2937', '#475569', '#334155', '#0f172a', '#3f3f46'];
const ROOF_COLORS     = ['#1e293b', '#27272a', '#18181b'];
const WINDOW_COLORS   = ['#fbbf24', '#fde68a', '#3b82f6', '#fb923c', '#facc15'];

// 시드 기반 의사난수 (재실행 시 같은 도시)
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export default function VoxelCityNight() {
  const buildings = useMemo(() => {
    const rng = mulberry32(42);
    const out = [];
    const GRID = 14; // 28x28 buildings
    for (let gx = -GRID; gx <= GRID; gx += 2) {
      for (let gz = -GRID; gz <= GRID; gz += 2) {
        // 도로 (4 단위 간격) skip
        if (Math.abs(gx) % 8 < 2 || Math.abs(gz) % 8 < 2) continue;

        const baseColor = BUILDING_COLORS[Math.floor(rng() * BUILDING_COLORS.length)];
        const roofColor = ROOF_COLORS[Math.floor(rng() * ROOF_COLORS.length)];
        const w = 1 + Math.floor(rng() * 1.5);
        const d = 1 + Math.floor(rng() * 1.5);
        const h = 2 + Math.floor(rng() * 18); // 2~20
        const lightDensity = 0.15 + rng() * 0.35;

        const windows = [];
        // 전면 창
        for (let y = 1; y < h; y++) {
          for (let i = 0; i < w; i++) {
            if (rng() < lightDensity) {
              const wc = WINDOW_COLORS[Math.floor(rng() * WINDOW_COLORS.length)];
              windows.push({ side: 'front', y, i, color: wc });
            }
          }
        }
        // 측면 창
        for (let y = 1; y < h; y++) {
          for (let i = 0; i < d; i++) {
            if (rng() < lightDensity * 0.7) {
              const wc = WINDOW_COLORS[Math.floor(rng() * WINDOW_COLORS.length)];
              windows.push({ side: 'right', y, i, color: wc });
            }
          }
        }

        out.push({ x: gx, z: gz, w, d, h, baseColor, roofColor, windows });
      }
    }
    return out;
  }, []);

  const streetLights = useMemo(() => {
    const rng = mulberry32(99);
    const out = [];
    for (let i = 0; i < 30; i++) {
      out.push({
        x: (rng() - 0.5) * 28,
        z: (rng() - 0.5) * 28,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {/* 바닥 (어두운 평면) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a0e1a" flatShading />
      </mesh>

      {/* 도로 그리드 (격자 패턴) */}
      {[-12, -4, 4, 12].map((p) => (
        <group key={`r${p}`}>
          <mesh position={[p, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 30]} />
            <meshStandardMaterial color="#000" flatShading />
          </mesh>
          <mesh position={[0, 0.01, p]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 1.6]} />
            <meshStandardMaterial color="#000" flatShading />
          </mesh>
        </group>
      ))}

      {/* 빌딩들 */}
      {buildings.map((b, i) => {
        const halfH = b.h / 2;
        const halfW = b.w / 2;
        const halfD = b.d / 2;
        return (
          <group key={i} position={[b.x, 0, b.z]}>
            {/* 본체 */}
            <mesh position={[0, halfH, 0]} castShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial color={b.baseColor} flatShading />
            </mesh>
            {/* 옥상 */}
            <mesh position={[0, b.h + 0.05, 0]}>
              <boxGeometry args={[b.w + 0.1, 0.1, b.d + 0.1]} />
              <meshStandardMaterial color={b.roofColor} flatShading />
            </mesh>
            {/* 창문 — emissive 작은 박스 */}
            {b.windows.map((w, wi) => (
              <mesh
                key={wi}
                position={
                  w.side === 'front'
                    ? [-halfW + 0.2 + w.i * 0.6, w.y, halfD + 0.01]
                    : [halfW + 0.01, w.y, -halfD + 0.2 + w.i * 0.6]
                }
              >
                <boxGeometry args={
                  w.side === 'front' ? [0.35, 0.4, 0.05] : [0.05, 0.4, 0.35]
                } />
                <meshStandardMaterial
                  color="#000"
                  emissive={w.color}
                  emissiveIntensity={1.6}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* 가로등 */}
      {streetLights.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.15, 2.4, 0.15]} />
            <meshStandardMaterial color="#27272a" flatShading />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.4]} />
            <meshStandardMaterial color="#000" emissive="#fbbf24" emissiveIntensity={2} />
          </mesh>
          <pointLight position={[0, 2.5, 0]} intensity={2} color="#fbbf24" distance={5} decay={2} />
        </group>
      ))}

      {/* 환경광 (달빛) */}
      <ambientLight intensity={0.12} color="#1e3a8a" />
      <directionalLight position={[20, 30, 20]} intensity={0.5} color="#dbeafe" castShadow />
      {/* 도시 주변 보라 글로우 */}
      <pointLight position={[0, 25, 0]} intensity={20} color="#3b82f6" distance={50} decay={2} />
    </group>
  );
}

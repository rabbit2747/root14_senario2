/**
 * Hotspot — 디오라마 안의 빛나는 마커
 * 활성화된 핫스팟만 표시. 클릭 시 툴팁 토글.
 */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';

export default function Hotspot({ pos, tooltip, color = '#f59e0b' }) {
  const ref = useRef();
  const [open, setOpen] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
    }
  });

  return (
    <group position={pos}>
      <Billboard>
        <mesh ref={ref} onClick={() => setOpen((o) => !o)}>
          <ringGeometry args={[0.15, 0.22, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Billboard>
      {open && tooltip && (
        <Html position={[0.3, 0.3, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid #f59e0b',
            color: '#fbbf24',
            padding: '6px 10px',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: '-apple-system,sans-serif',
            whiteSpace: 'nowrap',
          }}>
            {tooltip}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * DioramaEditor — 카메라 에디터 (MVP)
 * - 자유 오빗 카메라로 디오라마 둘러보기
 * - 카메라 8개를 wireframe frustum + 마커로 시각화
 * - 좌측 리스트 클릭 → 선택 → 우측 패널 슬라이더/입력으로 편집
 * - "Snap to camera" 버튼: 편집용 오빗 카메라가 그 자리로 점프
 * - "TransformControls" 토글: 3D 드래그로 위치 이동
 * - 저장: localStorage 오버라이드. 플레이어 진입 시 자동 반영.
 * - 내보내기: 변경분 JSON 클립보드 복사
 */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Html, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import * as THREE from 'three';

import DioramaScene from '../DioramaScene';
import { getBaseScenario, loadOverride, saveOverride, clearOverride, mergeScenario } from '../useScenario';

// ────────────────────────────────────────────
// 카메라 시각화 (frustum + 마커)
// ────────────────────────────────────────────
function CameraMarker({ name, cam, selected, onSelect }) {
  const group = useRef();
  const lookDir = useMemo(() => {
    const a = new THREE.Vector3().fromArray(cam.pos);
    const b = new THREE.Vector3().fromArray(cam.look);
    return b.sub(a).normalize().multiplyScalar(2);
  }, [cam.pos, cam.look]);

  useFrame((state) => {
    if (group.current && selected) {
      group.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.08);
    } else if (group.current) {
      group.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={group} position={cam.pos} onClick={(e) => { e.stopPropagation(); onSelect(name); }}>
      {/* 카메라 박스 */}
      <mesh>
        <boxGeometry args={[0.4, 0.3, 0.5]} />
        <meshBasicMaterial color={selected ? '#fbbf24' : '#06b6d4'} wireframe />
      </mesh>
      {/* 렌즈 */}
      <mesh position={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
        <meshBasicMaterial color={selected ? '#fbbf24' : '#06b6d4'} wireframe />
      </mesh>
      {/* 시선 방향 화살표 */}
      <line>
        <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints([
          new THREE.Vector3(0, 0, 0),
          lookDir,
        ])}/>
        <lineBasicMaterial color={selected ? '#fbbf24' : '#06b6d4'} linewidth={2} />
      </line>
      {/* frustum 시각화 */}
      <FrustumLines fov={cam.fov} pos={cam.pos} look={cam.look} color={selected ? '#fbbf24' : '#06b6d4'} />
      {/* 라벨 */}
      <Html distanceFactor={10}>
        <div style={{
          background: selected ? '#fbbf24' : 'rgba(8,12,20,0.85)',
          color: selected ? '#000' : '#06b6d4',
          padding: '3px 8px',
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          borderRadius: 2,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transform: 'translate(8px, -8px)',
          border: `1px solid ${selected ? '#fbbf24' : 'rgba(6,182,212,0.4)'}`,
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// frustum 와이어프레임 (4선)
function FrustumLines({ fov, pos, look, color }) {
  const points = useMemo(() => {
    const camPos = new THREE.Vector3().fromArray(pos);
    const lookAt = new THREE.Vector3().fromArray(look);
    const dir = lookAt.clone().sub(camPos).normalize();
    const dist = 4;
    const halfH = dist * Math.tan((fov * Math.PI / 180) / 2);
    const halfW = halfH * 1.78; // aspect

    // 카메라 좌표계
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const upAdj = new THREE.Vector3().crossVectors(right, dir).normalize();

    const center = camPos.clone().add(dir.clone().multiplyScalar(dist));
    const tl = center.clone().add(upAdj.clone().multiplyScalar(halfH)).add(right.clone().multiplyScalar(-halfW));
    const tr = center.clone().add(upAdj.clone().multiplyScalar(halfH)).add(right.clone().multiplyScalar(halfW));
    const bl = center.clone().add(upAdj.clone().multiplyScalar(-halfH)).add(right.clone().multiplyScalar(-halfW));
    const br = center.clone().add(upAdj.clone().multiplyScalar(-halfH)).add(right.clone().multiplyScalar(halfW));

    return [
      [camPos, tl, tr, camPos, br, bl, camPos],
      [tl, tr, br, bl, tl],
    ];
  }, [pos, look, fov]);

  return (
    <>
      {points.map((seg, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints(seg.map((p) => p.clone().sub(new THREE.Vector3().fromArray(pos))))}/>
          <lineBasicMaterial color={color} transparent opacity={0.4} />
        </line>
      ))}
    </>
  );
}

// ────────────────────────────────────────────
// 카메라 위치 드래그용 TransformControls 래퍼
// ────────────────────────────────────────────
function CameraDragHandle({ cam, onChange }) {
  const meshRef = useRef();
  const tcRef = useRef();
  const orbitRef = useThree((s) => s.gl); // for disabling orbit during drag

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.fromArray(cam.pos);
    }
  }, [cam.pos]);

  return (
    <>
      <mesh ref={meshRef} visible={false}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
      </mesh>
      {meshRef.current && (
        <TransformControls
          ref={tcRef}
          object={meshRef.current}
          mode="translate"
          onObjectChange={() => {
            const p = meshRef.current.position;
            onChange([
              Math.round(p.x * 100) / 100,
              Math.round(p.y * 100) / 100,
              Math.round(p.z * 100) / 100,
            ]);
          }}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────
// 메인 에디터
// ────────────────────────────────────────────
export default function DioramaEditor() {
  const { scenarioId = 'c0024' } = useParams();
  const navigate = useNavigate();
  const base = getBaseScenario(scenarioId);

  // 편집 상태 — 오버라이드만 메모리에 들고 있다가 저장 시 localStorage로
  const [override, setOverride] = useState(() => loadOverride(scenarioId) || { cameras: {} });
  const merged = useMemo(() => mergeScenario(base, override), [base, override]);

  const [selectedCam, setSelectedCam] = useState('wide_outside');
  const [showFrustums, setShowFrustums] = useState(true);
  const [dragMode, setDragMode] = useState(false); // 3D 드래그 토글
  const [previewMode, setPreviewMode] = useState(false); // 카메라 프리뷰 모드
  const [previewCamName, setPreviewCamName] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const cur = merged.cameras[selectedCam];

  // 카메라 한 필드 업데이트
  const updateCam = (name, patch) => {
    setOverride((o) => ({
      ...o,
      cameras: {
        ...(o.cameras || {}),
        [name]: { ...(merged.cameras[name] || {}), ...(o.cameras?.[name] || {}), ...patch },
      },
    }));
  };

  const handleSave = () => {
    saveOverride(scenarioId, override);
    showToast('✓ SAVED · 플레이어가 자동 반영');
  };
  const handleReset = () => {
    if (confirm('모든 변경 초기화? (localStorage 비움)')) {
      clearOverride(scenarioId);
      setOverride({ cameras: {} });
      showToast('↺ RESET');
    }
  };
  const handleExport = async () => {
    const json = JSON.stringify(override, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      showToast('✓ JSON 클립보드 복사 완료');
    } catch {
      showToast('복사 실패 — 콘솔 확인');
      console.log(json);
    }
  };

  const cameraNames = Object.keys(merged.cameras);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0e1a',
      display: 'flex',
      fontFamily: '-apple-system,sans-serif',
      color: '#e2e8f0',
    }}>
      <style>{`
        @keyframes editFade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* ════ 좌측 패널: 카메라 리스트 ════ */}
      <div style={{
        width: 280,
        background: 'rgba(8,12,20,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 헤더 */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 24, height: 24,
              border: '1.5px solid #fefefe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800,
            }}>R</span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4 }}>DIORAMA EDITOR</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginTop: 6, fontFamily: 'monospace' }}>
            CASE {scenarioId.toUpperCase()}
          </div>
        </div>

        {/* 카메라 리스트 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 0' }}>
          <div style={{ padding: '0 20px 8px', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, fontFamily: 'monospace' }}>
            ▎ CAMERAS · {cameraNames.length}
          </div>
          {cameraNames.map((name) => {
            const c = merged.cameras[name];
            const active = name === selectedCam;
            const overridden = !!override.cameras?.[name];
            return (
              <div
                key={name}
                onClick={() => setSelectedCam(name)}
                style={{
                  padding: '10px 20px',
                  background: active ? '#fefefe' : 'transparent',
                  color: active ? '#000' : '#e2e8f0',
                  borderLeft: active ? '3px solid #fbbf24' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{
                  width: 24, fontSize: 10, fontFamily: 'monospace',
                  color: active ? 'rgba(0,0,0,0.5)' : 'rgba(251,191,36,0.6)',
                  fontWeight: 700,
                }}>{String(cameraNames.indexOf(name) + 1).padStart(2, '0')}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: active ? 700 : 500, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {name.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: active ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)' }}>
                    [{c.pos.map((v) => v.toFixed(1)).join(', ')}] · {c.fov}°
                  </div>
                </div>
                {overridden && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }}/>}
              </div>
            );
          })}
        </div>

        {/* 토글들 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Toggle label="FRUSTUM 시각화" value={showFrustums} onChange={setShowFrustums} />
          <Toggle label="3D 드래그 모드" value={dragMode} onChange={setDragMode} />
          <Toggle label="카메라 프리뷰" value={previewMode} onChange={(v) => { setPreviewMode(v); if(v) setPreviewCamName(selectedCam); }} />
        </div>
      </div>

      {/* ════ 중앙: 3D 캔버스 ════ */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ position: [22, 14, 22], fov: 40, near: 0.1, far: 200 }}
          gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 1.0 }}
        >
          <Suspense fallback={null}>
            <fog attach="fog" args={['#020617', 30, 90]} />
            <DioramaScene consequences={[]} />

            {/* 그리드 */}
            <Grid
              position={[0, 0.005, 0]}
              args={[24, 16]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#1e3a5f"
              sectionSize={4}
              sectionThickness={1}
              sectionColor="#3b82f6"
              fadeDistance={40}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={false}
            />

            {/* 카메라 마커 */}
            {Object.entries(merged.cameras).map(([name, c]) => (
              <CameraMarker
                key={name}
                name={name}
                cam={c}
                selected={name === selectedCam}
                onSelect={setSelectedCam}
              />
            ))}

            {/* 선택 카메라 lookAt 마커 */}
            {cur && (
              <mesh position={cur.look}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshBasicMaterial color="#fbbf24" wireframe />
              </mesh>
            )}

            {/* 선택 카메라 → lookAt 시선선 */}
            {cur && (
              <line>
                <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints([
                  new THREE.Vector3().fromArray(cur.pos),
                  new THREE.Vector3().fromArray(cur.look),
                ])}/>
                <lineDashedMaterial color="#fbbf24" dashSize={0.3} gapSize={0.2} />
              </line>
            )}

            {/* 3D 드래그 핸들 */}
            {dragMode && cur && (
              <CameraDragHandle
                cam={cur}
                onChange={(newPos) => updateCam(selectedCam, { pos: newPos })}
              />
            )}

            {/* 프리뷰 모드: 선택 카메라 시점으로 점프 */}
            {previewMode && cur && (
              <PreviewCamera cam={cur} />
            )}

            {/* 자유 오빗 카메라 (프리뷰 아닐 때) */}
            {!previewMode && (
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                target={[0, 1.5, 0]}
                minDistance={3}
                maxDistance={60}
              />
            )}

            {/* 우상단 좌표축 기즈모 */}
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport axisColors={['#dc2626', '#22c55e', '#3b82f6']} labelColor="white" />
            </GizmoHelper>
          </Suspense>
        </Canvas>

        {/* 상단 닫기·도움말 */}
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate(`/apt/diorama/${scenarioId}`)}
              style={btnSm({ background: '#fefefe', color: '#000' })}
            >▶ v1 PLAYER</button>
            <button
              onClick={() => navigate(`/apt/diorama/${scenarioId}/ink`)}
              style={btnSm({ background: 'transparent', color: '#fefefe', border: '1px solid rgba(255,255,255,0.2)' })}
            >▶ INK PLAYER</button>
          </div>
          <div style={{
            pointerEvents: 'auto',
            background: 'rgba(8,12,20,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            padding: '6px 12px',
            fontSize: 10,
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 1,
          }}>
            🖱️ 드래그 회전 · 휠 줌 · ⇧드래그 팬
          </div>
        </div>

        {/* 토스트 */}
        {toast && (
          <div style={{
            position: 'absolute', top: 60, left: '50%',
            transform: 'translateX(-50%)',
            background: '#fbbf24', color: '#000',
            padding: '10px 20px',
            fontWeight: 700, fontSize: 12, letterSpacing: 2,
            animation: 'editFade 0.3s ease-out',
          }}>{toast}</div>
        )}
      </div>

      {/* ════ 우측 패널: 인스펙터 ════ */}
      <div style={{
        width: 320,
        background: 'rgba(8,12,20,0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 헤더 */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, fontFamily: 'monospace' }}>▎ INSPECTOR</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, letterSpacing: 0.5 }}>{selectedCam.replace(/_/g, ' ')}</div>
        </div>

        {/* 인스펙터 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="POSITION (X · Y · Z)">
            <Vec3 value={cur.pos} step={0.1} onChange={(v) => updateCam(selectedCam, { pos: v })} />
          </Field>

          <Field label="LOOK AT (X · Y · Z)">
            <Vec3 value={cur.look} step={0.1} onChange={(v) => updateCam(selectedCam, { look: v })} />
          </Field>

          <Field label={`FOV · ${cur.fov}°`}>
            <input
              type="range"
              min={10} max={75} step={1}
              value={cur.fov}
              onChange={(e) => updateCam(selectedCam, { fov: parseInt(e.target.value, 10) })}
              style={slider()}
            />
          </Field>

          <Field label={`SHAKE · ${(cur.shake || 0).toFixed(3)}`}>
            <input
              type="range"
              min={0} max={0.1} step={0.005}
              value={cur.shake || 0}
              onChange={(e) => updateCam(selectedCam, { shake: parseFloat(e.target.value) })}
              style={slider()}
            />
          </Field>

          <Field label="EASE 진입 곡선">
            <select
              value={cur.ease || 'cinematic'}
              onChange={(e) => updateCam(selectedCam, { ease: e.target.value })}
              style={selectStyle()}
            >
              <option value="cinematic">cinematic</option>
              <option value="easeInOut">easeInOut</option>
              <option value="easeOut">easeOut</option>
              <option value="easeIn">easeIn</option>
              <option value="linear">linear</option>
            </select>
          </Field>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}/>

          {/* 빠른 액션 */}
          <button
            onClick={() => {
              setPreviewCamName(selectedCam);
              setPreviewMode(true);
            }}
            style={btn({ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)', color: '#67e8f9' })}
          >
            👁️  이 카메라로 미리 보기
          </button>

          <button
            onClick={() => {
              if (override.cameras?.[selectedCam]) {
                const newCams = { ...override.cameras };
                delete newCams[selectedCam];
                setOverride({ ...override, cameras: newCams });
                showToast(`↻ ${selectedCam} 원본 복원`);
              }
            }}
            disabled={!override.cameras?.[selectedCam]}
            style={btn({
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: override.cameras?.[selectedCam] ? '#fefefe' : 'rgba(255,255,255,0.3)',
              cursor: override.cameras?.[selectedCam] ? 'pointer' : 'not-allowed',
            })}
          >
            ↻  이 카메라만 원본으로
          </button>
        </div>

        {/* 하단 액션 */}
        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleSave} style={btn({ background: '#fbbf24', color: '#000', fontWeight: 800 })}>
            💾  SAVE  ·  플레이어 자동 반영
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExport} style={btn({ flex: 1, background: '#fefefe', color: '#000' })}>
              📋  COPY JSON
            </button>
            <button onClick={handleReset} style={btn({ flex: 1, background: 'transparent', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5' })}>
              ↺  RESET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 프리뷰 카메라 (편집 카메라를 그 시점으로 옮김)
// ────────────────────────────────────────────
function PreviewCamera({ cam }) {
  const { camera } = useThree();
  useEffect(() => {
    if (camera && cam) {
      camera.position.fromArray(cam.pos);
      camera.lookAt(...cam.look);
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cam.pos, cam.look, cam.fov]);
  return null;
}

// ════════════════════════════════════════════
// 유틸 컴포넌트
// ════════════════════════════════════════════
function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 3, marginBottom: 6, fontFamily: 'monospace', fontWeight: 600 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Vec3({ value, step = 0.1, onChange }) {
  const setI = (i, v) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {['X', 'Y', 'Z'].map((axis, i) => (
        <div key={axis} style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', top: 4, left: 6,
            fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)',
            letterSpacing: 1,
          }}>{axis}</span>
          <input
            type="number"
            step={step}
            value={value[i]}
            onChange={(e) => setI(i, parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fefefe',
              padding: '12px 6px 4px',
              fontSize: 12,
              fontFamily: 'monospace',
              textAlign: 'right',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
      ))}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', padding: '6px 0',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 0.5 }}>{label}</span>
      <div style={{
        width: 32, height: 16, borderRadius: 8,
        background: value ? '#fbbf24' : 'rgba(255,255,255,0.1)',
        position: 'relative',
        transition: 'background 0.2s',
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: value ? '#000' : '#94a3b8',
          position: 'absolute', top: 2, left: value ? 18 : 2,
          transition: 'left 0.2s',
        }}/>
      </div>
    </div>
  );
}

function btn(extra = {}) {
  return {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    color: '#000',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    fontFamily: '-apple-system,sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...extra,
  };
}
function btnSm(extra = {}) {
  return {
    padding: '6px 12px',
    border: 'none',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    fontFamily: 'monospace',
    cursor: 'pointer',
    ...extra,
  };
}
function slider() {
  return {
    width: '100%',
    accentColor: '#fbbf24',
    background: 'transparent',
  };
}
function selectStyle() {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fefefe',
    padding: '8px 10px',
    fontSize: 11,
    fontFamily: 'monospace',
    outline: 'none',
  };
}

/**
 * CameraRig — 타임라인 큐 사이를 부드럽게 lerp하며 카메라 이동
 * useFrame 매 프레임에서 currentT 받아 → 현재 큐와 다음 큐 보간
 */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function CameraRig({ scenario, currentT }) {
  const { camera } = useThree();
  const cuesRef = useRef(null);

  // 카메라 큐만 추출 (timeline 항목 중 camera 필드 가진 것만)
  if (!cuesRef.current) {
    cuesRef.current = scenario.timeline.filter((c) => c.camera);
  }
  const cues = cuesRef.current;

  useFrame(() => {
    // 현재 시간에서 가장 최근 카메라 큐 + 다음 큐 찾기
    let curIdx = 0;
    for (let i = 0; i < cues.length; i++) {
      if (cues[i].t <= currentT) curIdx = i;
      else break;
    }
    const cur = cues[curIdx];
    const next = cues[curIdx + 1];

    const curCam = scenario.cameras[cur.camera];
    if (!curCam) return;

    // 다음 큐가 있으면 보간, 없으면 고정
    if (next) {
      const nextCam = scenario.cameras[next.camera];
      const segDur = next.t - cur.t;
      const localT = Math.min(1, Math.max(0, (currentT - cur.t) / segDur));
      const e = easeInOutCubic(localT);

      tmpA.fromArray(curCam.pos);
      tmpB.fromArray(nextCam.pos);
      camera.position.lerpVectors(tmpA, tmpB, e);

      tmpA.fromArray(curCam.look);
      tmpB.fromArray(nextCam.look);
      tmpLook.lerpVectors(tmpA, tmpB, e);
      camera.lookAt(tmpLook);

      camera.fov = curCam.fov + (nextCam.fov - curCam.fov) * e;
    } else {
      camera.position.fromArray(curCam.pos);
      tmpLook.fromArray(curCam.look);
      camera.lookAt(tmpLook);
      camera.fov = curCam.fov;
    }

    // shake
    if (curCam.shake) {
      const t = performance.now() * 0.01;
      camera.position.x += Math.sin(t * 7.3) * curCam.shake;
      camera.position.y += Math.cos(t * 5.1) * curCam.shake;
    }

    camera.updateProjectionMatrix();
  });

  return null;
}

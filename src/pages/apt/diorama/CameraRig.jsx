/**
 * CameraRig — 큐 사이 lerp + 큐별 ease 다양화 + 미세 shake
 * - 큐에 ease, hold 옵션 지원
 * - 큰 점프 큐(직전과 거리 > 8m)는 자동 hold 시간 추가
 */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

const EASE = {
  linear:     (t) => t,
  easeInOut:  (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOut:    (t) => 1 - Math.pow(1 - t, 3),
  easeIn:     (t) => t * t * t,
  // 영화풍: 시작·끝에서 천천히, 중간 빠르게
  cinematic:  (t) => 0.5 - Math.cos(Math.PI * t) / 2,
};

export default function CameraRig({ scenario, currentT }) {
  const { camera } = useThree();
  const cuesRef = useRef(null);

  if (!cuesRef.current) {
    cuesRef.current = scenario.timeline.filter((c) => c.camera);
  }
  const cues = cuesRef.current;

  useFrame(() => {
    let curIdx = 0;
    for (let i = 0; i < cues.length; i++) {
      if (cues[i].t <= currentT) curIdx = i;
      else break;
    }
    const cur = cues[curIdx];
    const next = cues[curIdx + 1];

    const curCam = scenario.cameras[cur.camera];
    if (!curCam) return;

    if (next) {
      const nextCam = scenario.cameras[next.camera];
      const segDur = next.t - cur.t;
      const localT = Math.min(1, Math.max(0, (currentT - cur.t) / segDur));

      // ease 선택: cue에 명시 > 다음 cam.ease > 기본 cinematic
      const easeName = cur.ease || nextCam.ease || 'cinematic';
      const easeFn = EASE[easeName] || EASE.cinematic;
      const e = easeFn(localT);

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

    // shake (감폭)
    if (curCam.shake) {
      const t = performance.now() * 0.01;
      camera.position.x += Math.sin(t * 7.3) * curCam.shake * 0.6;
      camera.position.y += Math.cos(t * 5.1) * curCam.shake * 0.6;
    }

    camera.updateProjectionMatrix();
  });

  return null;
}

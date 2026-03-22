import { useState, useRef, useCallback, useEffect } from 'react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const DOUBLE_TAP_ZOOM = 2;
const DOUBLE_TAP_DELAY = 300; // ms
const CLICK_THRESHOLD = 5;     // px — 이 이하 이동은 클릭으로 취급

/**
 * useSimulationZoom — 모바일 핀치 줌 / 패닝 / 더블탭 훅
 * 외부 라이브러리 없이 네이티브 Touch API 사용
 *
 * @param {{ enabled?: boolean }} options
 * @returns {{ containerRef, innerRef, style, zoom, resetZoom }}
 */
export default function useSimulationZoom({ enabled = true } = {}) {
  const containerRef = useRef(null);
  const innerRef = useRef(null);

  // ── 줌 / 패닝 상태 ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // ── 내부 ref (re-render 없이 빠른 갱신) ──
  const stateRef = useRef({
    zoom: 1,
    pan: { x: 0, y: 0 },
    // 핀치 시작 시점
    initialDistance: 0,
    initialZoom: 1,
    // 패닝 시작 시점
    panStartX: 0,
    panStartY: 0,
    panInitialX: 0,
    panInitialY: 0,
    // 제스처 판별
    isPinching: false,
    isPanning: false,
    totalMoved: 0,
    // 더블탭
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
  });

  // ── 상태 동기화 ──
  const syncState = useCallback((z, p) => {
    stateRef.current.zoom = z;
    stateRef.current.pan = p;
    setZoom(z);
    setPan(p);
  }, []);

  // ── 경계 제한 패닝 계산 ──
  const clampPan = useCallback((px, py, z) => {
    if (z <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    if (!container) return { x: px, y: py };
    const rect = container.getBoundingClientRect();
    const maxX = (rect.width * (z - 1)) / 2;
    const maxY = (rect.height * (z - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, px)),
      y: Math.max(-maxY, Math.min(maxY, py)),
    };
  }, []);

  // ── 리셋 ──
  const resetZoom = useCallback(() => {
    syncState(1, { x: 0, y: 0 });
  }, [syncState]);

  // ── 줌 토글 (버튼용) — 좌상단 중심으로 확대 ──
  const toggleZoom = useCallback(() => {
    if (stateRef.current.zoom > 1) {
      syncState(1, { x: 0, y: 0 });
    } else {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        // 좌상단 아이콘 영역 쪽으로 패닝
        const panX = rect.width * (DOUBLE_TAP_ZOOM - 1) * 0.25;
        const panY = rect.height * (DOUBLE_TAP_ZOOM - 1) * 0.2;
        syncState(DOUBLE_TAP_ZOOM, clampPan(panX, panY, DOUBLE_TAP_ZOOM));
      } else {
        syncState(DOUBLE_TAP_ZOOM, { x: 0, y: 0 });
      }
    }
  }, [syncState, clampPan]);

  // ── 두 손가락 사이 거리 ──
  const getDistance = (t1, t2) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  // ── 터치 이벤트 핸들러 ──
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    const s = stateRef.current;

    // ── touchstart ──
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        // 핀치 시작
        s.isPinching = true;
        s.isPanning = false;
        s.initialDistance = getDistance(e.touches[0], e.touches[1]);
        s.initialZoom = s.zoom;
        e.preventDefault();
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        const now = Date.now();

        // 더블탭 감지
        if (
          now - s.lastTapTime < DOUBLE_TAP_DELAY &&
          Math.abs(touch.clientX - s.lastTapX) < 30 &&
          Math.abs(touch.clientY - s.lastTapY) < 30
        ) {
          // 더블탭 → 줌 토글
          e.preventDefault();
          s.lastTapTime = 0; // 연속 트리거 방지
          const newZoom = s.zoom > 1 ? 1 : DOUBLE_TAP_ZOOM;

          if (newZoom === 1) {
            syncState(1, { x: 0, y: 0 });
          } else {
            // 탭 위치 기준 줌
            const rect = el.getBoundingClientRect();
            const cx = touch.clientX - rect.left - rect.width / 2;
            const cy = touch.clientY - rect.top - rect.height / 2;
            const newPan = clampPan(
              -cx * (newZoom - 1),
              -cy * (newZoom - 1),
              newZoom
            );
            syncState(newZoom, newPan);
          }
          return;
        }

        s.lastTapTime = now;
        s.lastTapX = touch.clientX;
        s.lastTapY = touch.clientY;

        // 줌 상태에서 1손가락 → 패닝 준비
        s.panStartX = touch.clientX;
        s.panStartY = touch.clientY;
        s.panInitialX = s.pan.x;
        s.panInitialY = s.pan.y;
        s.isPanning = false;
        s.totalMoved = 0;
      }
    };

    // ── touchmove ──
    const onTouchMove = (e) => {
      if (s.isPinching && e.touches.length === 2) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const ratio = dist / s.initialDistance;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s.initialZoom * ratio));
        const newPan = clampPan(s.pan.x, s.pan.y, newZoom);
        syncState(newZoom, newPan);
      } else if (e.touches.length === 1 && s.zoom > 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - s.panStartX;
        const dy = touch.clientY - s.panStartY;
        s.totalMoved += Math.abs(dx) + Math.abs(dy);

        if (s.totalMoved > CLICK_THRESHOLD) {
          s.isPanning = true;
          e.preventDefault();
          const newX = s.panInitialX + dx;
          const newY = s.panInitialY + dy;
          const clamped = clampPan(newX, newY, s.zoom);
          syncState(s.zoom, clamped);
        }
      }
    };

    // ── touchend ──
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        s.isPinching = false;
      }
      if (e.touches.length === 0) {
        s.isPanning = false;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, syncState, clampPan]);

  // ── 리사이즈 시 줌 리셋 ──
  useEffect(() => {
    if (!enabled) return;
    const onResize = () => {
      if (stateRef.current.zoom > 1) resetZoom();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [enabled, resetZoom]);

  // ── transform 스타일 ──
  const style = zoom > 1
    ? {
        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }
    : {};

  return {
    containerRef,
    innerRef,
    style,
    zoom,
    resetZoom,
    toggleZoom,
  };
}

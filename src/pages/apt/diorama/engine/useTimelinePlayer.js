/**
 * useTimelinePlayer — 타임라인 항목을 시간 경과에 따라 누적 발화
 * 반환: 지금까지 발화된 events 배열
 */
import { useEffect, useRef, useState } from 'react';

export function useTimelinePlayer(timeline, duration = 5) {
  const [events, setEvents] = useState([]);
  const startRef = useRef(null);
  const firedRef = useRef(new Set());

  useEffect(() => {
    startRef.current = performance.now();
    firedRef.current = new Set();
    setEvents([]);

    let raf;
    const tick = (now) => {
      const elapsed = (now - startRef.current) / 1000;
      timeline.forEach((item) => {
        const key = `${item.at}-${item.event}-${item.target}`;
        if (elapsed >= item.at && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          setEvents((prev) => [...prev, item]);
        }
      });
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [timeline, duration]);

  return events;
}

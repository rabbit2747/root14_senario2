import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 로봇 말풍선 — 활성 사고 카드에 대한 영상 + 캡션 표시
 * 영상이 끝나면 onVideoEnd()를 호출하여 다음 카드로 이동
 */
export default function RobotSpeechBubble({
  incident,       // 현재 활성 사고 객체
  language = 'ko',
  isDark = false,
  onVideoEnd,      // 영상 종료 콜백
  isActive = false, // 표시 여부
  isPaused = false, // 일시정지 여부 (마우스 호버)
}) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const fallbackTimerRef = useRef(null);

  const FALLBACK_DURATION = 8000; // 영상 없을 때 폴백 (8초)

  // ── 영상 재생/정지 제어 ──
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPaused) {
      v.pause();
    } else if (isActive && videoLoaded) {
      v.play().catch(() => {});
    }
  }, [isPaused, isActive, videoLoaded]);

  // ── 영상 변경 시 리셋 ──
  useEffect(() => {
    setProgress(0);
    setVideoError(false);
    setVideoLoaded(false);

    // 폴백 타이머 클리어
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    // 영상 파일이 없으면 폴백 타이머 시작
    if (!incident?.videoFile) {
      setVideoError(true);
      fallbackTimerRef.current = setTimeout(() => {
        onVideoEnd?.();
      }, FALLBACK_DURATION);
    }

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, [incident?.id]);

  // ── 영상 폴백: 에러 시 타이머 기반 진행 ──
  useEffect(() => {
    if (!videoError || !isActive) return;

    let start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / FALLBACK_DURATION, 1));
    }, 50);

    return () => clearInterval(interval);
  }, [videoError, isActive]);

  // ── 영상 이벤트 핸들러 ──
  const handleLoadedData = useCallback(() => {
    setVideoLoaded(true);
    setVideoError(false);
    // 폴백 타이머 제거
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v && v.duration) {
      setProgress(v.currentTime / v.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setProgress(1);
    // 짧은 딜레이 후 다음 카드로 (전환 애니메이션 시간)
    setTimeout(() => {
      onVideoEnd?.();
    }, 400);
  }, [onVideoEnd]);

  const handleError = useCallback(() => {
    setVideoError(true);
    setVideoLoaded(false);
    // 에러 시 폴백 타이머
    fallbackTimerRef.current = setTimeout(() => {
      onVideoEnd?.();
    }, FALLBACK_DURATION);
  }, [onVideoEnd]);

  if (!incident) return null;

  const caption = incident.videoCaption?.[language] || incident.videoCaption?.ko || incident.description?.[language] || '';

  // 색상
  const bgColor = isDark ? 'bg-slate-800/95' : 'bg-white/95';
  const borderColor = isDark ? 'border-slate-600/50' : 'border-slate-200';
  const textColor = isDark ? 'text-slate-200' : 'text-slate-700';
  const captionColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const progressBg = isDark ? 'bg-slate-700' : 'bg-slate-200';

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={incident.id}
          className={`absolute z-50`}
          style={{
            // 데스크톱: 로봇 위에 배치
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className={`
              ${bgColor} ${borderColor} border rounded-2xl shadow-2xl overflow-hidden
              backdrop-blur-xl
            `}
            style={{
              width: 'clamp(260px, 22vw, 320px)',
              boxShadow: isDark
                ? '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(59,130,246,0.1)'
                : '0 8px 40px rgba(0,0,0,0.12), 0 0 20px rgba(59,130,246,0.08)',
            }}
          >
            {/* 헤더: 사고 이름 + 연도 */}
            <div className={`px-3 py-2 flex items-center gap-2 border-b ${borderColor}`}>
              <span className="text-[10px]">🎬</span>
              <span className={`text-[11px] font-bold ${textColor} truncate`}>
                {incident.name}
              </span>
              {incident.year && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'} font-mono`}>
                  {incident.year}
                </span>
              )}
            </div>

            {/* 영상 영역 */}
            <div className="relative" style={{ aspectRatio: '16/9' }}>
              {incident.videoFile && !videoError ? (
                <video
                  ref={videoRef}
                  src={incident.videoFile}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  onLoadedData={handleLoadedData}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  onError={handleError}
                />
              ) : (
                // 영상 없을 때 폴백: 설명 텍스트 + 아이콘
                <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  <div className="text-3xl mb-2 opacity-40">🎞️</div>
                  <p className={`text-[10px] text-center leading-relaxed ${captionColor}`}>
                    {caption}
                  </p>
                </div>
              )}

              {/* 로딩 인디케이터 */}
              {incident.videoFile && !videoLoaded && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* 프로그레스 바 */}
            <div className={`h-1 ${progressBg}`}>
              <motion.div
                className="h-full bg-blue-500"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* 캡션 */}
            <div className="px-3 py-2">
              <p className={`text-[10px] leading-relaxed ${captionColor} line-clamp-2`}>
                {caption}
              </p>
            </div>
          </div>

          {/* 말풍선 꼬리 (삼각형 포인터) */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: -8 }}
          >
            <svg width="20" height="10" viewBox="0 0 20 10">
              <path
                d="M0 0 L10 10 L20 0"
                fill={isDark ? 'rgb(30,41,59)' : 'rgba(255,255,255,0.95)'}
                stroke={isDark ? 'rgb(71,85,105)' : 'rgb(226,232,240)'}
                strokeWidth="1"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

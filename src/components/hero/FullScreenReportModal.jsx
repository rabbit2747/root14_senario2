import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TACTICS, HERO_TEXT, TACTIC_COLORS } from './incidentData';

// ── 위험도 뱃지 ──
function SeverityBadge({ severity, isDark }) {
  const styles = {
    critical: isDark
      ? 'bg-red-950/60 text-red-400 border-red-800/50'
      : 'bg-red-100 text-red-700 border-red-200',
    high: isDark
      ? 'bg-orange-950/60 text-orange-400 border-orange-800/50'
      : 'bg-orange-100 text-orange-700 border-orange-200',
    medium: isDark
      ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
      : 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold border
      ${styles[severity] || styles.medium}`}
    >
      {(severity || 'medium').toUpperCase()}
    </span>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FullScreenReportModal
//
// createPortal(document.body) → z-[99999], AnimatePresence 내부 처리
// Props:
//   incident  — 표시할 인시던트 객체 (null이면 모달 닫힘)
//   language  — 언어 코드
//   isDark    — 다크모드
//   onClose   — 닫기 콜백
//   videoRef  — HeroIncidentMatrix의 bgVideoRef (모달 열릴 때 영상 일시정지)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function FullScreenReportModal({ incident, language, isDark, onClose, videoRef }) {
  // ── Body scroll lock + 배경 영상 제어 ──
  useEffect(() => {
    if (incident) {
      // 모달 열림: 스크롤 잠금 + 영상 일시정지
      document.body.style.overflow = 'hidden';
      if (videoRef?.current) {
        videoRef.current.pause();
      }
    } else {
      // 모달 닫힘: 스크롤 복원 + 영상 재개
      document.body.style.overflow = '';
      if (videoRef?.current) {
        videoRef.current.play().catch(() => {});
      }
    }
    // 언마운트 시 항상 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [incident, videoRef]);

  const ht = HERO_TEXT[language] || HERO_TEXT.ko;
  const lang = language === 'ko' || language === 'en' ? language : 'en';

  const detail = incident?.detailedInfo;
  const tacticId = incident
    ? TACTICS.find(t => t.incidents.some(i => i.id === incident.id))?.id
    : null;
  const colors   = tacticId ? TACTIC_COLORS[tacticId] : null;
  const accentHex  = isDark ? colors?.dark?.hex  : colors?.hex;
  const accentText = isDark ? colors?.dark?.text : colors?.text;

  const cardBg    = isDark ? 'bg-slate-900 border-slate-700'  : 'bg-white border-slate-200';
  const textMain  = isDark ? 'text-slate-200'  : 'text-slate-800';
  const textSub   = isDark ? 'text-slate-400'  : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-500'  : 'text-slate-400';
  const divider   = isDark ? 'border-slate-700' : 'border-slate-200';
  const sectionBg = isDark ? 'bg-slate-800/60' : 'bg-slate-50';

  return createPortal(
    // AnimatePresence를 createPortal 내부에 배치
    // → AnimatePresence + Portal 호환성 문제 해결 (항상 마운트 유지)
    <AnimatePresence>
      {incident && detail && (
        <motion.div
          key={incident.id}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{
            backdropFilter: 'blur(4px)',
            background: isDark ? 'rgba(2,6,23,0.85)' : 'rgba(241,245,249,0.88)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ${cardBg}`}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── 헤더 (sticky) ── */}
            <div
              className="sticky top-0 z-10 flex items-start justify-between p-5 border-b"
              style={{
                borderColor: accentHex ? accentHex + '33' : undefined,
                background: isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${accentText}`}
                    style={{ background: accentHex ? accentHex + '18' : undefined }}
                  >
                    {incident.techniqueId}
                  </span>
                  <SeverityBadge severity={detail.severity} isDark={isDark} />
                </div>
                <h2 className={`text-lg font-bold ${textMain}`}>
                  {incident.name}
                  {incident.year && (
                    <span className={`font-normal text-sm ml-2 ${textMuted}`}>({incident.year})</span>
                  )}
                </h2>
                <p className={`text-xs ${textSub}`}>{incident.technique}</p>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors
                  ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ── 본문 ── */}
            <div className="p-5 space-y-4">
              <p className={`text-sm leading-relaxed ${textSub}`}>
                {incident.description?.[language] || incident.description?.ko}
              </p>
              <div className={`border-t ${divider}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: ht.detailAttackVector, value: detail.attackVector?.[lang] || detail.attackVector?.ko },
                  { label: ht.detailAffected,     value: detail.affectedOrgs?.[lang] || detail.affectedOrgs?.ko },
                  { label: ht.detailTimeline,     value: detail.timeline?.[lang]     || detail.timeline?.ko },
                  { label: ht.detailLessons,      value: detail.lessonsLearned?.[lang] || detail.lessonsLearned?.ko },
                ].filter(item => item.label && item.value).map(({ label, value }) => (
                  <div key={label} className={`p-3 rounded-lg ${sectionBg}`}>
                    <div className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 ${textMuted}`}>
                      {label}
                    </div>
                    <div className={`text-xs leading-relaxed ${textMain}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* 통계 수치 (있는 경우) */}
              {incident.stat && (
                <div className={`flex items-center gap-3 p-3 rounded-lg border
                  ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="text-2xl font-black font-mono" style={{ color: accentHex }}>
                    {incident.stat.value?.toLocaleString()}{incident.stat.unit}
                  </div>
                  <div className={`text-xs ${textSub}`}>
                    {incident.stat.label?.[lang] || incident.stat.label?.ko}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

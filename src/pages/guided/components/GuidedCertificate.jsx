import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

/**
 * 유도 학습 수료증 모달 + PDF 다운로드
 * LabCompletionPage의 수료증 패턴 재사용
 */

// ROOT14 공식 인장 SVG
function OfficialSeal() {
  return (
    <svg viewBox="0 0 220 220" width="110" height="110" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="106" fill="none" stroke="#9c6644" strokeWidth="4"/>
      <circle cx="110" cy="110" r="94" fill="none" stroke="#9c6644" strokeWidth="1.2" strokeDasharray="4 3"/>
      <defs>
        <path id="gc-top" d="M 110,110 m -82,0 a 82,82 0 1,1 164,0"/>
        <path id="gc-bot" d="M 110,110 m -82,0 a 82,82 0 0,0 164,0"/>
      </defs>
      <text fontSize="12" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">
        <textPath href="#gc-top" startOffset="8%">ROOT14 · ACADEMY</textPath>
      </text>
      <text fontSize="11" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">
        <textPath href="#gc-bot" startOffset="8%">GUIDED LEARNING</textPath>
      </text>
      <g transform="translate(73, 65) scale(3.1)" fill="none" stroke="#9c6644" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </g>
      <text x="34" y="116" textAnchor="middle" fontSize="11" fill="#9c6644" fontFamily="serif">★</text>
      <text x="186" y="116" textAnchor="middle" fontSize="11" fill="#9c6644" fontFamily="serif">★</text>
      <text x="110" y="160" textAnchor="middle" fontSize="11" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">OFFICIAL</text>
    </svg>
  );
}

function getCertDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { ko: `${y}년 ${m}월 ${d}일`, en: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
}

export default function GuidedCertificate({ isOpen, onClose, userName, techniqueId, chapterMeta, totalChapters, isDark }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);
  const certDate = getCertDate();

  const courseTitle = chapterMeta?.title || 'Guided Learning';
  const courseSubtitle = chapterMeta?.subtitle || techniqueId;

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      const htmlToImage = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const el = certificateRef.current;
      const dataUrl = await htmlToImage.toPng(el, {
        width: 1122,
        height: 793,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: { position: 'relative', top: '0', left: '0' },
      });

      const pdf = new jsPDF('l', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
      pdf.save(`ROOT14_GUIDED_CERT_${techniqueId}_${userName || 'student'}.pdf`);
    } catch (e) {
      console.error('수료증 PDF 생성 오류:', e);
      alert('수료증 생성 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-[#1a1a2e]' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-[#1a1a2e]' : 'border-gray-200 bg-gray-50'}`}>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  수료증
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {techniqueId} · {totalChapters}챕터 전 과정 수료
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* 수료증 미리보기 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className={`rounded-xl border p-6 ${isDark ? 'border-[#9c6644]/30 bg-[#0f0f1a]' : 'border-[#9c6644]/20 bg-[#faf8f5]'}`}>
                {/* 미리보기 카드 */}
                <div className="text-center mb-4">
                  <p className={`text-xs tracking-[0.4em] uppercase font-bold ${isDark ? 'text-[#9c6644]/70' : 'text-[#9c6644]/60'}`}>
                    ROOT14 Academy — Guided Learning Certificate
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <div className={`h-px w-16 ${isDark ? 'bg-[#9c6644]/30' : 'bg-[#9c6644]/20'}`} />
                    <div className={`w-1.5 h-1.5 rotate-45 ${isDark ? 'bg-[#9c6644]/50' : 'bg-[#9c6644]/40'}`} />
                    <div className={`h-px w-16 ${isDark ? 'bg-[#9c6644]/30' : 'bg-[#9c6644]/20'}`} />
                  </div>
                </div>

                <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-2 ${isDark ? 'text-[#9c6644]' : 'text-[#9c6644]'}`}>
                  {userName || '훈련생'}
                </h2>

                <p className={`text-sm text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  위 사람은 ROOT14 Academy의 유도 학습 과정을 성공적으로 수료하였습니다.
                </p>

                <div className={`rounded-lg p-3 text-center mb-4 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                  <p className={`text-xs font-bold tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    ATT&CK {techniqueId}
                  </p>
                  <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    {courseTitle} — {courseSubtitle}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    전 {totalChapters}챕터 (공격자 파트 + 방어자/우회 파트)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{certDate.ko}</p>
                  <p className={`text-xs italic ${isDark ? 'text-[#9c6644]/60' : 'text-[#9c6644]/50'}`}>ROOT14 Academy</p>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#9c6644] hover:bg-[#7f5337] text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isDownloading
                  ? <span className="animate-pulse">PDF 생성 중...</span>
                  : <><Download size={18} /> 수료증 PDF 다운로드</>
                }
              </button>
            </div>
          </motion.div>

          {/* ===== PDF 캡처용 오프스크린 DOM ===== */}
          <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
            <div
              ref={certificateRef}
              style={{
                width: 1122,
                height: 793,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: 'Georgia, serif',
                backgroundColor: '#ffffff',
              }}
            >
              {/* 외부 테두리 */}
              <div style={{ position: 'absolute', inset: 0, border: '22px solid #9c6644' }} />
              {/* 내부 테두리 */}
              <div style={{ position: 'absolute', inset: 32, border: '2px solid rgba(156,102,68,0.3)' }} />

              {/* 코너 장식 */}
              {[
                { top: 40, left: 40, bt: true, bl: true },
                { top: 40, right: 40, bt: true, br: true },
                { bottom: 40, left: 40, bb: true, bl: true },
                { bottom: 40, right: 40, bb: true, br: true },
              ].map((pos, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 80, height: 80,
                  ...(pos.top !== undefined ? { top: pos.top } : {}),
                  ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
                  ...(pos.left !== undefined ? { left: pos.left } : {}),
                  ...(pos.right !== undefined ? { right: pos.right } : {}),
                  borderTop: pos.bt ? '6px solid rgba(156,102,68,0.4)' : 'none',
                  borderBottom: pos.bb ? '6px solid rgba(156,102,68,0.4)' : 'none',
                  borderLeft: pos.bl ? '6px solid rgba(156,102,68,0.4)' : 'none',
                  borderRight: pos.br ? '6px solid rgba(156,102,68,0.4)' : 'none',
                }} />
              ))}

              {/* 워터마크 */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <p style={{ fontSize: 170, fontWeight: 900, color: '#9c6644', opacity: 0.025, letterSpacing: '0.15em', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}>ROOT14</p>
              </div>

              {/* 상단 헤더 */}
              <div style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 24, position: 'relative', zIndex: 10, paddingLeft: 64, paddingRight: 64 }}>
                <p style={{ fontSize: 13, fontFamily: 'sans-serif', color: '#9c6644', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 12 }}>
                  ROOT14 Academy — Guided Learning Program
                </p>
                <h1 style={{ fontSize: 54, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1, color: '#111827', margin: 0 }}>
                  수 료 증
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                  <div style={{ height: 1, width: 128, backgroundColor: 'rgba(156,102,68,0.4)' }} />
                  <div style={{ width: 8, height: 8, transform: 'rotate(45deg)', backgroundColor: 'rgba(156,102,68,0.5)' }} />
                  <div style={{ height: 1, width: 128, backgroundColor: 'rgba(156,102,68,0.4)' }} />
                </div>
              </div>

              {/* 본문 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', zIndex: 10, paddingLeft: 80, paddingRight: 80 }}>
                <p style={{ fontSize: 20, fontStyle: 'italic', marginBottom: 20, color: '#6b7280' }}>증명 대상:</p>
                <h2 style={{ fontSize: 48, fontWeight: 700, color: '#9c6644', paddingBottom: 12, paddingLeft: 64, paddingRight: 64, marginBottom: 24, minWidth: 420, borderBottom: '3px solid #e2c9b5', margin: '0 0 24px 0' }}>
                  {userName || '훈련생'}
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 700, marginBottom: 20, color: '#4b5563' }}>
                  위 사람은 ROOT14 Academy의 유도 학습(Guided Learning) 과정에서
                  <br />다음의 MITRE ATT&CK 기법에 대한 전 과정을 성공적으로 수료하였습니다.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ height: 1, width: 64, backgroundColor: '#d1d5db' }} />
                  <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.05em', fontFamily: 'sans-serif', color: '#1f2937', margin: 0 }}>
                    ATT&CK {techniqueId} : {courseTitle}
                  </p>
                  <div style={{ height: 1, width: 64, backgroundColor: '#d1d5db' }} />
                </div>
                <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>
                  {courseSubtitle} · 전 {totalChapters}챕터 (공격자 파트 + 방어자/우회 파트)
                </p>
              </div>

              {/* 하단: 날짜 / 인장 / 서명 */}
              <div style={{ paddingBottom: 40, paddingLeft: 80, paddingRight: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10, fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>{certDate.ko}</p>
                  <div style={{ borderTop: '2px solid #d1d5db', width: 208, paddingTop: 8, textAlign: 'center' }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af' }}>발급일자</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -16 }}>
                  <OfficialSeal />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <p style={{ fontSize: 22, color: '#9c6644', fontStyle: 'italic', marginBottom: 2, fontFamily: 'Brush Script MT, cursive, Georgia, serif', margin: 0 }}>ROOT14 Academy</p>
                  <p style={{ fontSize: 10, fontFamily: 'sans-serif', color: '#6b7280', margin: '4px 0' }}>대표 윤웅</p>
                  <div style={{ borderTop: '2px solid #d1d5db', width: 208, paddingTop: 8, textAlign: 'center' }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af' }}>수석 훈련관</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

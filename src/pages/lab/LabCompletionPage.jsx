import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from './labT1078Data';
import LangToggle, { getStoredLang, storeLang } from '../../components/LangToggle';
import { Trophy, Renew } from '@carbon/icons-react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// ── 다국어 ──
const UI = {
  ko: {
    title: '훈련 완료',
    completeMsg: (u, c, tid) => `${u}님, ${c} 인프라 대상 ${tid} 시뮬레이션 훈련을 성공적으로 마쳤습니다.`,
    downloadCert: '수료증 PDF 다운로드',
    backToEdu: '교육 과정으로 돌아가기',
    retryBtn: '다시 훈련하기',
    stats: '훈련 요약',
    technique: '기법',
    steps: '완료 단계',
    duration: '소요 시간',
    date: '수료일',
    cert: { title: '수 료 증', subtitle: '증명 대상:', desc: '위 사람은 다음의 고급 위협 시뮬레이션 및 방어 훈련 과정을 성공적으로 수료하였습니다.', dateLabel: '발급일자', instructor: '수석 훈련관' },
  },
  en: {
    title: 'Training Complete',
    completeMsg: (u, c, tid) => `Congratulations ${u}! You successfully completed the ${tid} simulation for ${c}.`,
    downloadCert: 'Download PDF Certificate',
    backToEdu: 'Back to Courses',
    retryBtn: 'Retry Training',
    stats: 'Training Summary',
    technique: 'Technique',
    steps: 'Steps Completed',
    duration: 'Duration',
    date: 'Completed',
    cert: { title: 'Certificate of Completion', subtitle: 'This proudly certifies that', desc: 'has successfully completed the advanced threat simulation and defense training module:', dateLabel: 'Date of Issue', instructor: 'Lead Instructor' },
  },
};

// ── GOTROOT 공식 인장 SVG ──
function GotrootSeal() {
  return (
    <svg viewBox="0 0 220 220" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="106" fill="none" stroke="#9c6644" strokeWidth="4"/>
      <circle cx="110" cy="110" r="94" fill="none" stroke="#9c6644" strokeWidth="1.2" strokeDasharray="4 3"/>
      <defs>
        <path id="gs-top2" d="M 110,110 m -82,0 a 82,82 0 1,1 164,0"/>
        <path id="gs-bot2" d="M 110,110 m -82,0 a 82,82 0 0,0 164,0"/>
      </defs>
      <text fontSize="12" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">
        <textPath href="#gs-top2" startOffset="4%">(주)갓루트 · GOTROOT</textPath>
      </text>
      <text fontSize="11" fill="#9c6644" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="3">
        <textPath href="#gs-bot2" startOffset="12%">CYBERSECURITY EDU</textPath>
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

export default function LabCompletionPage() {
  const { techniqueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState(() => getStoredLang());
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  // location.state에서 시뮬레이션 정보 수신
  const {
    userName = '훈련생',
    companyName = 'Corp',
    scenarioTitle = '',
    scenarioTitleEn = '',
    totalSteps = 0,
    duration = 0,
  } = location.state || {};

  const t = UI[lang] || UI.en;

  // ── 수료증 발급 날짜 ──
  const certDate = (() => {
    const now = new Date();
    const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0'), d = String(now.getDate()).padStart(2, '0');
    if (lang === 'ko') return `${y}년 ${m}월 ${d}일`;
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  })();

  // localStorage에 완료 기록 저장
  useEffect(() => {
    try {
      const labs = JSON.parse(localStorage.getItem('gotroot_completed_labs') || '[]');
      const entry = { name: `${techniqueId} - ${scenarioTitleEn || scenarioTitle}`, technique: techniqueId, completedAt: new Date().toISOString() };
      if (!labs.some(l => l.technique === entry.technique)) { labs.push(entry); localStorage.setItem('gotroot_completed_labs', JSON.stringify(labs)); }
    } catch {}
  }, [techniqueId, scenarioTitle, scenarioTitleEn]);

  // ── PDF 다운로드 ──
  // html-to-image: SVG foreignObject 기반 렌더링으로 oklch 등 최신 CSS 완전 지원
  // html2canvas v1.x는 Tailwind v4의 oklch 색상 함수를 파싱 실패 → 교체
  const handleDownloadCert = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      const htmlToImage = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const el = certificateRef.current;
      // 2x 픽셀 레이시오로 고해상도 PNG 생성 (A4 1122×793px 기준)
      const dataUrl = await htmlToImage.toPng(el, {
        width: 1122,
        height: 793,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: { position: 'relative', top: '0', left: '0' },
      });

      const pdf = new jsPDF('l', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();  // 297mm
      const h = pdf.internal.pageSize.getHeight(); // 210mm
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
      pdf.save(`GOTROOT_CERT_${techniqueId}_${userName}.pdf`);
    } catch (e) {
      console.error('수료증 PDF 생성 오류:', e);
      alert('수료증 생성 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const displayTitle = lang === 'ko' ? scenarioTitle : (scenarioTitleEn || scenarioTitle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col">

      {/* 헤더 */}
      <div className="w-full px-4 py-2 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-[#bb3e03] font-mono tracking-widest">GOTROOT</span>
          <span className="text-[8px] text-slate-600 font-mono">|</span>
          <span className="text-[8px] text-slate-500 font-mono">(주)갓루트 · 사이버보안 교육 플랫폼</span>
        </div>
        <LangToggle lang={lang} theme="dark" onChange={(code) => { storeLang(code); setLang(code); }} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="max-w-2xl w-full">

          {/* 🎉 완료 배너 */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-amber-400 mb-4 flex justify-center"><Trophy size={64} /></motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{t.title}</h1>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-lg mx-auto">{t.completeMsg(userName, companyName, techniqueId)}</p>
          </div>

          {/* 훈련 요약 카드 */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h3 className="text-xs font-black tracking-widest text-[#9c6644] uppercase mb-4">{t.stats}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-white">{techniqueId}</div>
                <div className="text-[10px] text-slate-500 font-bold mt-1">{t.technique}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-emerald-400">{totalSteps}</div>
                <div className="text-[10px] text-slate-500 font-bold mt-1">{t.steps}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-blue-400">{duration > 0 ? `${duration}m` : '-'}</div>
                <div className="text-[10px] text-slate-500 font-bold mt-1">{t.duration}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-amber-400">{certDate.split(' ').slice(-2).join(' ')}</div>
                <div className="text-[10px] text-slate-500 font-bold mt-1">{t.date}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500 font-mono">{displayTitle}</p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-3">
            <button onClick={handleDownloadCert} disabled={isDownloading}
              className="w-full flex justify-center items-center gap-3 bg-[#9c6644] hover:bg-[#7f5337] text-white font-bold py-4 rounded-2xl shadow-lg text-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50">
              {isDownloading ? <span className="animate-pulse">Generating PDF...</span> : <><Icons.Download /> {t.downloadCert}</>}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate(`/lab/desktop/${techniqueId}`)}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                <Renew size={16} /> {t.retryBtn}
              </button>
              <button onClick={() => navigate(`/edu/${techniqueId}`)}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                <ArrowLeftIcon className="w-4 h-4" /> {t.backToEdu}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== 수료증 PDF 캡처용 오프스크린 DOM ===== */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div ref={certificateRef} className="w-[1122px] h-[793px] relative flex flex-col overflow-hidden" style={{ fontFamily: 'Georgia, serif', backgroundColor: '#ffffff' }}>
          <div className="absolute inset-0 border-[22px] border-[#9c6644]" />
          <div className="absolute inset-[32px] border-[2px]" style={{ borderColor: 'rgba(156,102,68,0.3)' }} />
          {[['top-0 left-0','border-t-[6px] border-l-[6px]'],['top-0 right-0','border-t-[6px] border-r-[6px]'],['bottom-0 left-0','border-b-[6px] border-l-[6px]'],['bottom-0 right-0','border-b-[6px] border-r-[6px]']].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-20 h-20 ${border} m-10`} style={{ borderColor: 'rgba(156,102,68,0.4)' }} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <p className="text-[170px] font-black text-[#9c6644] opacity-[0.025] tracking-widest whitespace-nowrap" style={{ fontFamily: 'Georgia, serif' }}>GOTROOT</p>
          </div>
          <div className="text-center pt-12 pb-6 relative z-10 px-16">
            <p className="text-sm font-sans text-[#9c6644] tracking-[0.5em] uppercase mb-3">(주)갓루트(GOTROOT) Cybersecurity Training Institute</p>
            <h1 className="text-[58px] font-extrabold tracking-[0.18em] uppercase leading-none" style={{ color: '#111827' }}>{t.cert?.title || 'Certificate'}</h1>
            <div className="flex items-center justify-center gap-3 mt-4"><div className="h-px w-32" style={{ backgroundColor: 'rgba(156,102,68,0.4)' }} /><div className="w-2 h-2 rotate-45" style={{ backgroundColor: 'rgba(156,102,68,0.5)' }} /><div className="h-px w-32" style={{ backgroundColor: 'rgba(156,102,68,0.4)' }} /></div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 px-20">
            <p className="text-xl italic mb-5" style={{ color: '#6b7280' }}>{t.cert?.subtitle || 'This certifies that'}</p>
            <h2 className="text-[52px] font-bold text-[#9c6644] pb-3 px-16 mb-6 min-w-[420px]" style={{ borderBottom: '3px solid #e2c9b5' }}>{userName}</h2>
            <p className="text-[17px] leading-relaxed max-w-[740px] mb-5" style={{ color: '#4b5563' }}>{t.cert?.desc}</p>
            <div className="flex items-center gap-4">
              <div className="h-px w-16" style={{ backgroundColor: '#d1d5db' }} />
              <p className="text-[22px] font-extrabold tracking-wide font-sans" style={{ color: '#1f2937' }}>ATT&amp;CK {techniqueId} : {scenarioTitleEn || scenarioTitle}</p>
              <div className="h-px w-16" style={{ backgroundColor: '#d1d5db' }} />
            </div>
          </div>
          <div className="pb-10 px-20 flex justify-between items-end relative z-10 font-sans">
            <div className="flex flex-col items-center gap-1">
              <p className="text-[18px] font-bold" style={{ color: '#1f2937' }}>{certDate}</p>
              <div className="border-t-2 w-52 pt-2 text-center text-xs tracking-[0.2em] uppercase" style={{ borderColor: '#d1d5db', color: '#9ca3af' }}>{t.cert?.dateLabel}</div>
            </div>
            <div className="flex flex-col items-center -mt-4"><GotrootSeal /></div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-[22px] text-[#9c6644] italic mb-0.5" style={{ fontFamily: 'Brush Script MT, cursive, Georgia, serif' }}>(주)갓루트 GOTROOT</p>
              <p className="text-[10px] mb-1" style={{ fontFamily: 'sans-serif', color: '#6b7280' }}>대표 윤웅</p>
              <div className="border-t-2 w-52 pt-2 text-center text-xs tracking-[0.2em] uppercase" style={{ borderColor: '#d1d5db', color: '#9ca3af' }}>{t.cert?.instructor}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="w-full px-4 py-3 border-t border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-center gap-4 text-[8px] font-mono text-slate-600">
          <span>© 2026 (주)갓루트(GOTROOT)</span>
          <span>·</span>
          <a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer" className="text-[#bb3e03]/40 hover:text-[#bb3e03] transition-colors">gotroot.co.kr ↗</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LangToggle — 전체 사이트 통일 언어 선택 컴포넌트
// localStorage 'gotroot_lang' 키로 선택 언어 유지
// theme: 'light' (흰 배경용) | 'dark' (검정 배경용)
// ============================================================
import { useState, useEffect, useRef } from 'react';

export const LANG_STORAGE_KEY = 'gotroot_lang';
export const LANG_DEFAULT     = 'ko';

export const LANG_OPTIONS = [
  { code: 'ko', label: '한국어',   flag: '🇰🇷' },
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'zh', label: '中文',     flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'ja', label: '日本語',   flag: '🇯🇵' },
  { code: 'ar', label: 'العربية',  flag: '🇸🇦' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

/** 지원 언어 코드 Set (빠른 조회용) */
const SUPPORTED_LANGS = new Set(LANG_OPTIONS.map(o => o.code));

/**
 * localStorage에서 저장된 언어를 읽거나,
 * 첫 방문 시 navigator.language 기반으로 자동 감지 후 저장
 */
export function getStoredLang() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored) return stored;

    // 첫 방문: 브라우저 언어 자동 감지
    const browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase();
    const detected = SUPPORTED_LANGS.has(browserLang) ? browserLang : LANG_DEFAULT;

    // 감지 결과 저장 (이후 방문 시 재감지 방지)
    localStorage.setItem(LANG_STORAGE_KEY, detected);
    return detected;
  } catch { return LANG_DEFAULT; }
}

/** 언어 코드를 localStorage에 저장 */
export function storeLang(code) {
  try { localStorage.setItem(LANG_STORAGE_KEY, code); } catch {}
}

// Globe 아이콘 (IntroMatrix 기존 스타일 일치)
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/**
 * LangToggle 공통 컴포넌트
 * @param {string}   lang       - 현재 선택된 언어 코드
 * @param {function} onChange   - 언어 변경 핸들러 (code) => void
 * @param {'light'|'dark'} theme - 배경 테마 (기본 'light')
 * @param {string}   className  - 추가 클래스
 */
export default function LangToggle({ lang, onChange, theme = 'light', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (code) => {
    storeLang(code);
    onChange(code);
    setOpen(false);
  };

  // ── 테마별 스타일 ──
  const btnClass = theme === 'dark'
    ? 'flex items-center gap-1.5 px-2 py-1 text-[10px] rounded border border-slate-500 bg-slate-800/60 text-slate-300 font-mono transition-all hover:border-[#415a77] hover:text-white backdrop-blur-sm'
    : 'flex items-center gap-1.5 px-2 py-1 text-[10px] rounded border border-slate-500 bg-white/60 font-mono transition-all hover:border-[#415a77]';

  const dropdownClass = theme === 'dark'
    ? 'absolute right-0 top-9 rounded shadow-xl overflow-hidden z-[200] bg-[#0d1b2a] border border-slate-600'
    : 'absolute right-0 top-9 rounded shadow-xl overflow-hidden z-[200] bg-white border border-slate-200';

  const itemBase = theme === 'dark'
    ? 'w-full flex items-center gap-2 px-3 py-2 text-[10px] text-left transition-all hover:bg-slate-700'
    : 'w-full flex items-center gap-2 px-3 py-2 text-[10px] text-left transition-all hover:bg-slate-50';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className={btnClass}
        title="언어 선택 / Language"
      >
        <GlobeIcon />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="opacity-50">▾</span>
      </button>

      {open && (
        <div className={dropdownClass} style={{ minWidth: 130 }}>
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.code}
              onClick={() => handleSelect(opt.code)}
              className={itemClass(itemBase, opt.code === lang, theme)}
            >
              <span className="text-sm">{opt.flag}</span>
              <span>{opt.label}</span>
              {opt.code === lang && <span className="ml-auto text-[#415a77]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function itemClass(base, isActive, theme) {
  const active = theme === 'dark' ? 'text-[#415a77] bg-slate-700/50' : 'text-[#415a77]';
  const normal = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  return `${base} ${isActive ? active : normal}`;
}

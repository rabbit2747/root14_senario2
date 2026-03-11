import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useWikiTerms from '../../hooks/useWikiTerms';

/**
 * 갓루트 위키 모달 (SPA 전용)
 * createPortal → document.body, z-[9000]
 */
export default function WikiModal({ isOpen, onClose, techniqueId = null }) {
  const { terms, search, setSearch, loading, error } = useWikiTerms(techniqueId);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // 열릴 때 검색창 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen, setSearch]);

  // ESC 닫기
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-xl mx-4 rounded-2xl shadow-2xl flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(96,165,250,0.2)',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <h2 className="text-white font-black tracking-wider text-sm">
              갓루트 위키
              <span className="text-blue-400 ml-1 font-normal text-xs">Gotroot Wiki</span>
            </h2>
          </div>
          {techniqueId && (
            <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700/40 rounded px-2 py-0.5 font-mono">
              {techniqueId}
            </span>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* 검색창 */}
        <div className="px-5 py-3 border-b border-slate-700/30">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={techniqueId ? `${techniqueId} 관련 용어 검색...` : '용어 검색...'}
              className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:bg-slate-800"
            />
          </div>
          {techniqueId && (
            <p className="text-xs text-slate-500 mt-1.5">
              현재 기법({techniqueId}) 관련 + 공통 용어 표시 중
            </p>
          )}
        </div>

        {/* 결과 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3" style={{ minHeight: 0 }}>
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center py-6">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && terms.length === 0 && (
            <div className="text-slate-500 text-sm text-center py-8">
              {search ? `"${search}" 검색 결과 없음` : '등록된 용어가 없습니다.'}
            </div>
          )}

          {!loading && terms.map((t) => (
            <div
              key={t.id}
              className="rounded-xl p-4 border transition-colors hover:border-blue-500/30"
              style={{
                background: 'rgba(30,41,59,0.6)',
                border: '1px solid rgba(71,85,105,0.4)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-white font-bold text-sm leading-tight">{t.term}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  {t.level && (
                    <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 rounded px-1.5 py-0.5">
                      {t.level}
                    </span>
                  )}
                  {t.technique_id && (
                    <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-700/30 rounded px-1.5 py-0.5 font-mono">
                      {t.technique_id}
                    </span>
                  )}
                  {!t.technique_id && (
                    <span className="text-xs bg-slate-700/40 text-slate-400 border border-slate-600/30 rounded px-1.5 py-0.5">
                      공통
                    </span>
                  )}
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{t.definition}</p>
              {t.source_url && (
                t.source_url.startsWith('/edu/') ? (
                  /* 내부 edu 페이지: sessionStorage 공유 안 되므로 SPA navigate 사용 */
                  <button
                    onClick={() => {
                      const target = t.technique_id ? `/edu/${t.technique_id}` : t.source_url;
                      if (t.technique_id) { onClose(); navigate(target); }
                      else { window.location.href = t.source_url; }
                    }}
                    className="text-blue-400 text-xs mt-1.5 inline-block hover:underline bg-transparent border-0 p-0 cursor-pointer"
                  >
                    📚 관련 교육 보기
                  </button>
                ) : (
                  <a
                    href={t.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs mt-1.5 inline-block hover:underline"
                  >
                    📄 출처 보기
                  </a>
                )
              )}
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div className="px-5 py-3 border-t border-slate-700/30 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {loading ? '로딩 중...' : `${terms.length}개 용어`}
          </span>
          <span className="text-xs text-slate-600">ESC로 닫기</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

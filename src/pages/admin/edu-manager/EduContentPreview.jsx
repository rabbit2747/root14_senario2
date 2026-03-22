import { useState } from 'react';
import { Document, WarningAlt } from '@carbon/icons-react';

export default function EduContentPreview({ url }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Document size={32} className="mb-2" />
        <span className="text-xs text-slate-400 font-bold">URL이 설정되면 프리뷰가 표시됩니다</span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[300px] bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* 로딩 오버레이 */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-slate-400 font-bold">프리뷰 로딩 중...</span>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/50 z-10">
          <WarningAlt size={24} className="mb-2" />
          <span className="text-xs text-red-500 font-bold">프리뷰를 로드할 수 없습니다</span>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">{url}</span>
          <button
            onClick={() => { setError(false); setLoading(true); }}
            className="mt-3 text-[10px] font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* URL 표시 바 */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border-b border-slate-200">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <span className="text-[10px] font-mono text-slate-400 truncate flex-1">{url}</span>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-[9px] font-bold text-blue-500 hover:text-blue-700 shrink-0">
          새 탭 ↗
        </a>
      </div>

      {/* iframe */}
      {!error && (
        <iframe
          src={url}
          title="Education Page Preview"
          className="w-full border-0"
          style={{ height: 'calc(100% - 32px)' }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
}

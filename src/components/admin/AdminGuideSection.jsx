import { ChevronRight } from '@carbon/icons-react';

/**
 * AdminGuideSection — 관리자 페이지 인페이지 사용 가이드
 * <details> 기반 접기/펼치기, 추가 상태 관리 불필요
 *
 * @param {{ steps: string[], tips?: string[] }} props
 */
export default function AdminGuideSection({ steps = [], tips = [] }) {
  return (
    <details className="bg-blue-50/50 border border-blue-200/60 rounded-xl mt-6 group">
      <summary className="p-4 cursor-pointer select-none list-none flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors">
        <span className="transition-transform group-open:rotate-90"><ChevronRight size={14} /></span>
        📖 사용 가이드
        <span className="text-[10px] font-medium text-blue-400 ml-1">(클릭하여 펼치기)</span>
      </summary>

      <div className="px-5 pb-5 space-y-2.5 border-t border-blue-100">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2.5 text-xs leading-relaxed">
            <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center text-[10px]">
              {i + 1}
            </span>
            <span className="text-slate-600 pt-0.5">{step}</span>
          </div>
        ))}

        {tips.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-100 space-y-1.5">
            {tips.map((tip, i) => (
              <p key={i} className="text-[11px] text-amber-600 flex items-start gap-1.5">
                <span className="shrink-0">⚠️</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

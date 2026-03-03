import { lazy, Suspense } from 'react';

const TacticWidgetTemplate = lazy(() => import('../../../components/tactic-widgets/TacticWidgetTemplate'));

export default function WidgetPreviewPanel({ widgetData, error }) {
  const hasData = widgetData && (Object.keys(widgetData.glossary || {}).length > 0 || (widgetData.attackCases || []).length > 0);

  return (
    <div className="space-y-2 sticky top-4">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Live Preview</span>
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50" style={{ height: 600, overflowY: 'auto' }}>
        {hasData && !error ? (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          }>
            <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '181.8%' }}>
              <TacticWidgetTemplate tacticData={widgetData} />
            </div>
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2">
            <div className="text-3xl">🎨</div>
            <div className="text-sm text-slate-400 font-bold">
              {error ? 'JSON 오류 수정 후 프리뷰 표시' : '용어집 또는 공격 케이스를 추가하면 프리뷰가 표시됩니다'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

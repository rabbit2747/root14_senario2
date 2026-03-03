import { ChevronUp, ChevronDown, Close } from '@carbon/icons-react';

export default function ChapterManager({ pageId, chapterTitles = [], addChapter, updateChapter, removeChapter, moveChapter }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">챕터 ({chapterTitles.length}개)</span>
      </div>

      {chapterTitles.length === 0 && (
        <div className="p-4 text-center text-[11px] text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          아직 챕터가 없습니다
        </div>
      )}

      <div className="space-y-1.5">
        {chapterTitles.map((title, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <span className="text-[9px] font-bold text-slate-400 w-5 text-right shrink-0">{i + 1}.</span>
            <input
              type="text"
              value={title}
              onChange={e => updateChapter(pageId, i, e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder={`챕터 ${i + 1} 제목`}
            />
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {i > 0 && (
                <button onClick={() => moveChapter(pageId, i, i - 1)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500"><ChevronUp size={12} /></button>
              )}
              {i < chapterTitles.length - 1 && (
                <button onClick={() => moveChapter(pageId, i, i + 1)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500"><ChevronDown size={12} /></button>
              )}
              <button onClick={() => removeChapter(pageId, i)}
                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-red-50 text-red-400 hover:text-red-600"><Close size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => addChapter(pageId, '')}
        className="w-full text-[10px] font-bold py-2 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all">
        + 챕터 추가
      </button>
    </div>
  );
}

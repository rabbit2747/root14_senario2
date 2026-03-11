import ChapterManager from './ChapterManager';
import TagInput from './TagInput';
import { DIFFICULTY_OPTIONS, TACTIC_OPTIONS } from './useEduFormState';

const DIFF_LABELS = { beginner: '초급', intermediate: '중급', advanced: '고급' };
const DIFF_COLORS = {
  beginner: 'bg-green-50 text-green-700 border-green-200',
  intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-50 text-red-700 border-red-200',
};

export default function EduMetaForm({
  pageId, page, updatePage,
  addChapter, updateChapter, removeChapter, moveChapter,
  addTag, removeTag, allTags,
}) {
  const update = (key, value) => updatePage(pageId, { [key]: value });

  // tacticIds 토글
  const toggleTactic = (tid) => {
    const current = page.tacticIds || [];
    const next = current.includes(tid)
      ? current.filter(t => t !== tid)
      : [...current, tid];
    update('tacticIds', next);
  };

  return (
    <div className="space-y-5">
      {/* ── 기본 정보 ── */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">기본 정보</h3>

        {/* ID + URL (읽기 전용) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Sub-Technique ID</label>
            <div className="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 px-3 py-2 rounded-lg border border-cyan-200">
              {page.subTechniqueId || pageId}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">URL (자동 생성)</label>
            <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 truncate">
              {page.url}
            </div>
          </div>
        </div>

        {/* 제목 한/영 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">제목 (한국어)</label>
            <input
              type="text"
              value={page.title || ''}
              onChange={e => update('title', e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="예: Domain Accounts 심층 분석"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">제목 (영어)</label>
            <input
              type="text"
              value={page.titleEn || ''}
              onChange={e => update('titleEn', e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="예: Domain Accounts Deep Dive"
            />
          </div>
        </div>

        {/* Technique ID */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1">Technique ID</label>
          <input
            type="text"
            value={page.techniqueId || ''}
            onChange={e => update('techniqueId', e.target.value)}
            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="예: T1078"
          />
        </div>
      </section>

      {/* ── 전술 매핑 ── */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
          관련 전술 ({(page.tacticIds || []).length}개 선택)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {TACTIC_OPTIONS.map(opt => {
            const selected = (page.tacticIds || []).includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleTactic(opt.id)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  selected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                }`}
              >
                {opt.id.toUpperCase()} {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 난이도 + 시간 ── */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">난이도 & 소요시간</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 난이도 라디오 */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-2">난이도</label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => update('difficulty', d)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    page.difficulty === d ? DIFF_COLORS[d] + ' ring-2 ring-offset-1 ring-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {DIFF_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* 소요시간 슬라이더 */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-2">
              예상 소요시간: <span className="text-blue-600">{page.estimatedMinutes || 15}분</span>
            </label>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={page.estimatedMinutes || 15}
              onChange={e => update('estimatedMinutes', Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
              <span>5분</span><span>30분</span><span>60분</span><span>120분</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 챕터 관리 ── */}
      <section>
        <ChapterManager
          pageId={pageId}
          chapterTitles={page.chapterTitles || []}
          addChapter={addChapter}
          updateChapter={updateChapter}
          removeChapter={removeChapter}
          moveChapter={moveChapter}
        />
      </section>

      {/* ── 콘텐츠 정보 ── */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">콘텐츠 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">미니랩 수</label>
            <input
              type="number"
              min={0}
              max={20}
              value={page.miniLabs || 0}
              onChange={e => update('miniLabs', Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">퀴즈 수</label>
            <input
              type="number"
              min={0}
              max={20}
              value={page.quizzes || 0}
              onChange={e => update('quizzes', Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </div>
      </section>

      {/* ── 태그 ── */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">태그</h3>
        <TagInput
          tags={page.tags || []}
          allTags={allTags}
          onAdd={tag => addTag(pageId, tag)}
          onRemove={tag => removeTag(pageId, tag)}
        />
      </section>
    </div>
  );
}

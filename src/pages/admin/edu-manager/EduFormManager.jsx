import { useState, useMemo } from 'react';
import useEduFormState, { DIFFICULTY_OPTIONS, TACTIC_OPTIONS } from './useEduFormState';
import EduMetaForm from './EduMetaForm';
import EduContentPreview from './EduContentPreview';
import AdminGuideSection from '../../../components/admin/AdminGuideSection';
import { Save, Education, Chemistry, Help, Time, View, MailAll } from '@carbon/icons-react';

const DIFF_LABELS = { beginner: '초급', intermediate: '중급', advanced: '고급' };
const DIFF_BADGE = {
  beginner: 'bg-green-50 text-green-600 border-green-200',
  intermediate: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  advanced: 'bg-red-50 text-red-600 border-red-200',
};

export default function EduFormManager({ requestVerify }) {
  const {
    pages, loading, saving, error, setError,
    addPage, updatePage, savePage, deletePage,
    addChapter, updateChapter, removeChapter, moveChapter,
    addTag, removeTag, allTags,
  } = useEduFormState();

  // 로컬 UI 상태
  const [editId, setEditId] = useState(null);
  const [newIdInput, setNewIdInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterTactic, setFilterTactic] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // 필터링된 페이지 목록
  const filteredIds = useMemo(() => {
    return Object.keys(pages).filter(id => {
      const p = pages[id];
      // 검색
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = id.toLowerCase().includes(q);
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchTitleEn = (p.titleEn || '').toLowerCase().includes(q);
        const matchTags = (p.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchId && !matchTitle && !matchTitleEn && !matchTags) return false;
      }
      // 난이도 필터
      if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
      // 전술 필터
      if (filterTactic !== 'all' && !(p.tacticIds || []).includes(filterTactic)) return false;
      return true;
    }).sort();
  }, [pages, search, filterDifficulty, filterTactic]);

  // 새 페이지 추가
  const handleAddPage = () => {
    const id = newIdInput.trim().toUpperCase();
    if (!id) return;
    if (pages[id]) {
      setEditId(id);
      setNewIdInput('');
      return;
    }
    addPage(id);
    setEditId(id);
    setNewIdInput('');
  };

  // 저장
  const handleSave = async () => {
    if (!editId) return;
    if (requestVerify) {
      const verified = await requestVerify();
      if (!verified) return;
    }
    const ok = await savePage(editId);
    if (ok) {
      setEditId(null);
      setError(null);
    }
  };

  // 삭제
  const handleDelete = async (id) => {
    if (requestVerify) {
      const verified = await requestVerify();
      if (!verified) return;
    }
    const ok = await deletePage(id);
    if (ok) {
      if (editId === id) setEditId(null);
      setDeleteConfirm(null);
    }
  };

  const editingPage = editId ? pages[editId] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-bold">교육 데이터 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── 헤더 ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-slate-800">
          교육 페이지 관리
          <span className="ml-2 text-sm font-bold text-slate-400">({Object.keys(pages).length}개)</span>
        </h2>
        <div className="flex items-center gap-2">
          <input
            value={newIdInput}
            onChange={e => setNewIdInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddPage()}
            placeholder="T1078.003"
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 w-32 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          />
          <button
            onClick={handleAddPage}
            disabled={!newIdInput.trim()}
            className="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            + 새 페이지
          </button>
        </div>
      </div>

      {/* ── 검색 & 필터 ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ID, 제목, 태그 검색..."
          className="flex-1 text-xs px-2 py-1 outline-none"
        />
        <select
          value={filterDifficulty}
          onChange={e => setFilterDifficulty(e.target.value)}
          className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 outline-none"
        >
          <option value="all">전체 난이도</option>
          {DIFFICULTY_OPTIONS.map(d => (
            <option key={d} value={d}>{DIFF_LABELS[d]}</option>
          ))}
        </select>
        <select
          value={filterTactic}
          onChange={e => setFilterTactic(e.target.value)}
          className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 outline-none"
        >
          <option value="all">전체 전술</option>
          {TACTIC_OPTIONS.map(t => (
            <option key={t.id} value={t.id}>{t.id.toUpperCase()} {t.label}</option>
          ))}
        </select>
        <span className="text-[10px] text-slate-400 font-bold shrink-0">{filteredIds.length}건</span>
      </div>

      {/* ── 에러 메시지 ── */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <span className="text-xs text-red-600 font-bold">{error}</span>
          <button onClick={() => setError(null)} className="text-[10px] text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── 편집 모달 ── */}
      {editId && editingPage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                  {editId}
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {editingPage.title || '(제목 없음)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    showPreview
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {showPreview ? '프리뷰 닫기' : <><View size={14} className="inline" /> 프리뷰</>}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs font-bold text-white px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? '저장 중...' : <><Save size={14} className="inline" /> 저장</>}
                </button>
                <button
                  onClick={() => { setEditId(null); setShowPreview(false); }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  ✕ 닫기
                </button>
              </div>
            </div>

            {/* 모달 바디 */}
            <div className={`flex ${showPreview ? 'flex-col md:flex-row md:divide-x divide-slate-200' : ''}`}>
              {/* 좌측: 폼 */}
              <div className={`${showPreview ? 'w-full md:w-1/2' : 'w-full'} p-6 max-h-[70vh] overflow-y-auto`}>
                <EduMetaForm
                  pageId={editId}
                  page={editingPage}
                  updatePage={updatePage}
                  addChapter={addChapter}
                  updateChapter={updateChapter}
                  removeChapter={removeChapter}
                  moveChapter={moveChapter}
                  addTag={addTag}
                  removeTag={removeTag}
                  allTags={allTags}
                />
              </div>

              {/* 우측: 프리뷰 */}
              {showPreview && (
                <div className="w-full md:w-1/2 p-4 max-h-[50vh] md:max-h-[70vh]">
                  <EduContentPreview url={editingPage.url} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-sm font-black text-slate-800 mb-2">교육 페이지 삭제</h3>
            <p className="text-xs text-slate-500 mb-4">
              <span className="font-mono font-bold text-red-500">{deleteConfirm}</span> 교육 메타데이터를 삭제하시겠습니까?<br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 카드 그리드 ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIds.map(id => {
          const p = pages[id];
          return (
            <div
              key={id}
              className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setEditId(id)}
            >
              <div className="p-4 space-y-2.5">
                {/* ID 뱃지 + 난이도 */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {id}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${DIFF_BADGE[p.difficulty] || 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {DIFF_LABELS[p.difficulty] || p.difficulty}
                  </span>
                </div>

                {/* 제목 */}
                <h3 className="text-sm font-bold text-slate-700 leading-tight line-clamp-2">
                  {p.title || <span className="text-slate-300 italic">제목 없음</span>}
                </h3>

                {/* 메타 정보 */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-0.5"><Education size={12} /> {p.chapters || 0} 챕터</span>
                  <span className="inline-flex items-center gap-0.5"><Chemistry size={12} /> {p.miniLabs || 0} 랩</span>
                  <span className="inline-flex items-center gap-0.5"><Help size={12} /> {p.quizzes || 0} 퀴즈</span>
                  <span className="inline-flex items-center gap-0.5"><Time size={12} /> {p.estimatedMinutes || 0}분</span>
                </div>

                {/* 전술 뱃지 */}
                {(p.tacticIds || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tacticIds.map(tid => (
                      <span key={tid} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        {tid.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* 태그 */}
                {(p.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 border border-blue-100">
                        {tag}
                      </span>
                    ))}
                    {p.tags.length > 4 && (
                      <span className="text-[9px] text-slate-400">+{p.tags.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              {/* 카드 푸터 */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 rounded-b-xl">
                <span className="text-[9px] font-mono text-slate-400 truncate max-w-[60%]">{p.url}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); setEditId(id); }}
                    className="text-[9px] font-bold text-blue-500 hover:text-blue-700 px-2 py-0.5 rounded bg-white border border-blue-200"
                  >
                    편집
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteConfirm(id); }}
                    className="text-[9px] font-bold text-red-400 hover:text-red-600 px-2 py-0.5 rounded bg-white border border-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 빈 상태 */}
      {filteredIds.length === 0 && (
        <div className="text-center py-12">
          <span className="block mb-3"><MailAll size={32} /></span>
          <p className="text-sm text-slate-400 font-bold">
            {search || filterDifficulty !== 'all' || filterTactic !== 'all'
              ? '검색 결과가 없습니다'
              : '등록된 교육 페이지가 없습니다'}
          </p>
        </div>
      )}

      <AdminGuideSection
        steps={[
          '+ 새 페이지 버튼으로 교육 페이지 메타데이터를 추가합니다',
          '기법 ID 형식: T1078.002 (MITRE ATT&CK 서브기법 번호)',
          '난이도(초급/중급/고급)와 태그를 선택하면 필터링에 활용됩니다',
          '챕터를 추가하면 교육 페이지에 목차가 자동 생성됩니다',
          '카드를 클릭하면 편집 모달이 열립니다',
        ]}
        tips={['삭제는 되돌릴 수 없습니다 — 확인 팝업에서 신중하게 결정하세요']}
      />
    </div>
  );
}

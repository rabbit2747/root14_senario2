import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import eduMetaLocal from '../../data/edu-meta.json';

export default function EduPageManager() {
  const [pages, setPages] = useState({});
  const [editId, setEditId] = useState(null);
  const [editJson, setEditJson] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newId, setNewId] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    // Supabase에서 로드 시도 → 실패 시 로컬 JSON fallback
    try {
      const { data } = await supabase.from('edu_meta').select('technique_id, metadata');
      if (data && data.length > 0) {
        const merged = { ...eduMetaLocal.pages };
        data.forEach(row => { merged[row.technique_id] = row.metadata; });
        setPages(merged);
        return;
      }
    } catch { /* fallback to local */ }
    setPages(eduMetaLocal.pages || {});
  };

  const startEdit = (id) => {
    setEditId(id);
    setEditJson(JSON.stringify(pages[id], null, 2));
    setJsonError('');
  };

  const startNew = () => {
    if (!newId.trim()) return;
    const template = {
      url: `/edu/${newId.toLowerCase().replace(/\./g, '-')}.html`,
      title: '',
      titleEn: '',
      tacticIds: [],
      techniqueId: '',
      subTechniqueId: newId,
      chapters: 0,
      chapterTitles: [],
      miniLabs: 0,
      quizzes: 0,
      difficulty: 'beginner',
      estimatedMinutes: 15,
      tags: []
    };
    setPages(prev => ({ ...prev, [newId]: template }));
    setEditId(newId);
    setEditJson(JSON.stringify(template, null, 2));
    setJsonError('');
    setNewId('');
  };

  const saveEntry = async () => {
    try {
      const parsed = JSON.parse(editJson);
      setJsonError('');
      setSaving(true);

      // Supabase에 upsert
      const { error } = await supabase.from('edu_meta').upsert({
        technique_id: editId,
        metadata: parsed,
        updated_at: new Date().toISOString()
      }, { onConflict: 'technique_id' });

      if (error) throw error;
      setPages(prev => ({ ...prev, [editId]: parsed }));
      setEditId(null);
    } catch (e) {
      if (e instanceof SyntaxError) setJsonError('JSON 구문 오류: ' + e.message);
      else setJsonError('저장 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm(`${id} 교육 메타데이터를 삭제하시겠습니까?`)) return;
    await supabase.from('edu_meta').delete().eq('technique_id', id);
    setPages(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    if (editId === id) setEditId(null);
  };

  const pageIds = Object.keys(pages);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-800">교육 페이지 관리</h2>
        <div className="flex items-center gap-2">
          <input
            value={newId}
            onChange={e => setNewId(e.target.value)}
            placeholder="T1078.003"
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 w-32 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          />
          <button onClick={startNew} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            + 추가
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="grid gap-3">
        {pageIds.map(id => (
          <div key={id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{id}</span>
                <span className="ml-2 text-sm font-bold text-slate-700">{pages[id].title || '(제목 없음)'}</span>
                <span className="ml-2 text-xs text-slate-400">tacticIds: [{pages[id].tacticIds?.join(', ')}]</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(id)} className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
                  편집
                </button>
                <button onClick={() => deleteEntry(id)} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
                  삭제
                </button>
              </div>
            </div>

            {/* 인라인 JSON 편집기 */}
            {editId === id && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={editJson}
                  onChange={e => { setEditJson(e.target.value); setJsonError(''); }}
                  className="w-full h-64 font-mono text-xs p-3 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-y"
                  spellCheck={false}
                />
                {jsonError && <p className="text-xs text-red-500 font-bold">{jsonError}</p>}
                <div className="flex gap-2">
                  <button onClick={saveEntry} disabled={saving} className="text-xs font-bold text-white px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button onClick={() => setEditId(null)} className="text-xs font-bold text-slate-500 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {pageIds.length === 0 && <p className="text-center py-8 text-sm text-slate-400">등록된 교육 페이지가 없습니다</p>}
    </div>
  );
}

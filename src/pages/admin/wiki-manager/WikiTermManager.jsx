import { useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { getWikiTerms, upsertWikiTerm, deleteWikiTerm, bulkImportWikiTerms } from '../../../api/wiki';
import useWikiTerms from '../../../hooks/useWikiTerms';

const EMPTY_FORM = { term: '', definition: '', technique_id: '', level: '', source_url: '', tags: [] };

const LEVEL_OPTIONS = ['', 'novice', 'beginner', 'intermediate', 'advanced', 'expert'];

/** XSS 방어: 텍스트 필드에서 HTML 태그/스크립트 제거 */
function sanitizeText(str) {
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

export default function WikiTermManager({ requestVerify }) {
  const { terms, search, setSearch, loading, error, refetch } = useWikiTerms(null);
  const [editItem, setEditItem] = useState(null);  // null = 새 항목 폼 닫힘, {} = 새 항목, {id,...} = 수정
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditItem({});
  }

  function openEdit(t) {
    setForm({
      term: t.term,
      definition: t.definition,
      technique_id: t.technique_id || '',
      level: t.level || '',
      source_url: t.source_url || '',
      tags: t.tags || [],
    });
    setEditItem(t);
  }

  function closeForm() {
    setEditItem(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.term.trim() || !form.definition.trim()) {
      setMsg({ type: 'error', text: '용어와 정의는 필수입니다.' });
      return;
    }
    const ok = await requestVerify?.();
    if (ok === false) return; // 비밀번호 재확인 취소
    setSaving(true);
    setMsg(null);
    try {
      await upsertWikiTerm({
        ...(editItem?.id ? { id: editItem.id } : {}),
        term: sanitizeText(form.term),
        definition: sanitizeText(form.definition),
        technique_id: sanitizeText(form.technique_id) || null,
        level: form.level || null,
        source_url: sanitizeText(form.source_url) || null,
        tags: form.tags,
      });
      setMsg({ type: 'ok', text: '저장 완료!' });
      closeForm();
      refetch();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    if (!confirm(`"${t.term}" 용어를 삭제할까요?`)) return;
    const ok = await requestVerify?.();
    if (ok === false) return;
    try {
      await deleteWikiTerm(t.id);
      setMsg({ type: 'ok', text: '삭제 완료' });
      refetch();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await requestVerify?.();
    if (ok === false) { if (fileRef.current) fileRef.current.value = ''; return; }
    setImporting(true);
    setMsg(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('JSON 배열이어야 합니다.');
      const result = await bulkImportWikiTerms(data);
      setMsg({ type: 'ok', text: `${result.length}개 용어 임포트 완료!` });
      refetch();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-800">📖 위키 용어 관리</h2>
        <div className="flex gap-2">
          <label className="cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1">
            {importing ? '임포트 중...' : '📥 JSON 임포트'}
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
          </label>
          <button onClick={openNew} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            + 새 용어
          </button>
        </div>
      </div>

      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg font-bold ${msg.type === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* 검색창 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="용어 검색..."
          className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 새 용어 / 수정 폼 */}
      {editItem !== null && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-700">
            {editItem.id ? '용어 수정' : '새 용어 추가'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-600 mb-1 block">용어 *</label>
              <input
                value={form.term}
                onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 악성코드, Malware, C2 서버"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-600 mb-1 block">정의 *</label>
              <textarea
                value={form.definition}
                onChange={e => setForm(f => ({ ...f, definition: e.target.value }))}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="용어에 대한 설명을 입력하세요."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">기법 ID (선택)</label>
              <input
                value={form.technique_id}
                onChange={e => setForm(f => ({ ...f, technique_id: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: T1587.001"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">레벨 (선택)</label>
              <select
                value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l || '없음 (공통)'}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-600 mb-1 block">출처 URL (선택)</label>
              <input
                value={form.source_url}
                onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/edu/t1587-001-beginner-ch1.html"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={closeForm} className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 용어 목록 */}
      {loading && <div className="text-center text-slate-400 py-8 text-sm">불러오는 중...</div>}
      {error && <div className="text-red-500 text-sm py-4">{error}</div>}

      {!loading && (
        <div className="text-xs text-slate-500 font-bold">{terms.length}개 용어</div>
      )}

      <div className="space-y-2">
        {terms.map(t => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4 hover:border-slate-300 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-sm text-slate-800">{t.term}</span>
                {t.technique_id && (
                  <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 font-mono">
                    {t.technique_id}
                  </span>
                )}
                {t.level && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">
                    {t.level}
                  </span>
                )}
                {!t.technique_id && (
                  <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">
                    공통
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{t.definition}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => openEdit(t)} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-colors">
                수정
              </button>
              <button onClick={() => handleDelete(t)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 font-bold transition-colors">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

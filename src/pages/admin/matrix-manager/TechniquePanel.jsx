import { useState } from 'react';
import { Close } from '@carbon/icons-react';

export default function TechniquePanel({
  selectedTacticId, techniques, subTechniques,
  addTechnique, updateTechnique, deleteTechnique,
  addSubTechnique, updateSubTechnique, deleteSubTechnique,
  saving, requestVerify, onSelectItem,
}) {
  const [newTid, setNewTid] = useState('');
  const [newName, setNewName] = useState('');
  const [addSubFor, setAddSubFor] = useState(null); // technique tid
  const [newSid, setNewSid] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!selectedTacticId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-slate-400 font-bold">← 전술을 선택하세요</p>
      </div>
    );
  }

  const tacTechniques = techniques
    .filter(t => t.tactic_id === selectedTacticId)
    .sort((a, b) => a.sort_order - b.sort_order);

  const getSubsForTech = (tid) =>
    subTechniques
      .filter(s => s.technique_tid === tid)
      .sort((a, b) => a.sort_order - b.sort_order);

  const handleAddTech = async () => {
    const tid = newTid.trim().toUpperCase();
    const name = newName.trim();
    if (!tid || !name) return;
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    await addTechnique(selectedTacticId, tid, name);
    setNewTid(''); setNewName('');
  };

  const handleAddSub = async (techniqueTid) => {
    const sid = newSid.trim().toUpperCase();
    const name = newSubName.trim();
    if (!sid || !name) return;
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    await addSubTechnique(techniqueTid, sid, name);
    setNewSid(''); setNewSubName(''); setAddSubFor(null);
  };

  const handleToggleCritical = async (tech) => {
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    await updateTechnique(tech.tid, { is_critical: !tech.is_critical });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    if (deleteConfirm.type === 'tech') {
      await deleteTechnique(deleteConfirm.id);
    } else {
      await deleteSubTechnique(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
        기법 ({tacTechniques.length}) — {selectedTacticId.toUpperCase()}
      </h3>

      {/* 기법 목록 */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {tacTechniques.map(tech => {
          const subs = getSubsForTech(tech.tid);
          return (
            <div key={tech.tid} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* 기법 헤더 */}
              <div
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer group"
                onClick={() => onSelectItem?.({ type: 'technique', tid: tech.tid, name: tech.name })}
              >
                <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                  {tech.tid}
                </span>
                {tech.is_critical && (
                  <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded border border-red-200 shrink-0">CRITICAL</span>
                )}
                <span className="text-xs font-bold text-slate-700 truncate flex-1">
                  {tech.name}
                </span>
                <span className="text-[9px] text-slate-400 shrink-0">{subs.length}개</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); handleToggleCritical(tech); }}
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded border transition-colors ${tech.is_critical ? 'text-red-500 border-red-200 hover:bg-red-50' : 'text-slate-400 border-slate-200 hover:text-red-500'}`}
                    disabled={saving}
                  >{tech.is_critical ? '★' : '☆'}</button>
                  <button
                    onClick={e => { e.stopPropagation(); setAddSubFor(tech.tid); }}
                    className="text-[8px] font-bold text-emerald-500 hover:text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200"
                  >+Sub</button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'tech', id: tech.tid, label: tech.tid }); }}
                    className="text-[8px] text-red-300 hover:text-red-500 px-1"
                  ><Close size={12} /></button>
                </div>
              </div>

              {/* 서브기법 */}
              {subs.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  {subs.map(sub => (
                    <div
                      key={sub.sid}
                      className="flex items-center gap-2 px-3 py-1.5 pl-7 hover:bg-slate-100 cursor-pointer group/sub"
                      onClick={() => onSelectItem?.({ type: 'sub', sid: sub.sid, name: sub.name })}
                    >
                      <span className="text-[8px] font-mono text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-200 shrink-0">
                        {sub.sid}
                      </span>
                      <span className="text-[10px] text-slate-600 truncate flex-1">{sub.name}</span>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'sub', id: sub.sid, label: sub.sid }); }}
                        className="text-[8px] text-red-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                      ><Close size={12} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* 서브기법 추가 인라인 */}
              {addSubFor === tech.tid && (
                <div className="border-t border-slate-100 bg-emerald-50/50 px-3 py-2 pl-7">
                  <div className="flex gap-1.5">
                    <input
                      value={newSid}
                      onChange={e => setNewSid(e.target.value)}
                      placeholder={`${tech.tid}.00X`}
                      className="w-24 text-[9px] font-mono px-2 py-1 rounded border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none"
                      autoFocus
                    />
                    <input
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      placeholder="Sub-technique name"
                      onKeyDown={e => e.key === 'Enter' && handleAddSub(tech.tid)}
                      className="flex-1 text-[9px] px-2 py-1 rounded border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                    <button
                      onClick={() => handleAddSub(tech.tid)}
                      disabled={!newSid.trim() || !newSubName.trim() || saving}
                      className="text-[9px] font-bold text-white px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40"
                    >추가</button>
                    <button
                      onClick={() => { setAddSubFor(null); setNewSid(''); setNewSubName(''); }}
                      className="text-[9px] text-slate-400 hover:text-slate-600 px-1"
                    ><Close size={12} /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 새 기법 추가 */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <span className="text-[9px] font-bold text-slate-400">새 기법 추가</span>
        <div className="flex gap-1.5">
          <input
            value={newTid}
            onChange={e => setNewTid(e.target.value)}
            placeholder="T1234"
            className="w-20 text-[10px] font-mono px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Technique Name"
            onKeyDown={e => e.key === 'Enter' && handleAddTech()}
            className="flex-1 text-[10px] px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          <button
            onClick={handleAddTech}
            disabled={!newTid.trim() || !newName.trim() || saving}
            className="text-[10px] font-bold text-white px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
          >+ 기법</button>
        </div>
      </div>

      {/* 삭제 확인 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-5 w-72">
            <h3 className="text-sm font-black text-slate-800 mb-2">
              {deleteConfirm.type === 'tech' ? '기법 삭제' : '서브기법 삭제'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              <span className="font-mono font-bold text-red-500">{deleteConfirm.label}</span>을(를) 삭제합니다.
              {deleteConfirm.type === 'tech' && <><br />하위 서브기법도 모두 삭제됩니다.</>}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >취소</button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

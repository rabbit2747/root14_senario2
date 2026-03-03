import { useState } from 'react';
import { ChevronUp, ChevronDown, Close } from '@carbon/icons-react';

export default function TacticListPanel({
  tactics, selectedTacticId, onSelect,
  addTactic, deleteTactic, moveTactic, saving, requestVerify,
}) {
  const [newId, setNewId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sorted = [...tactics].sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = async () => {
    const id = newId.trim().toLowerCase();
    const title = newTitle.trim();
    if (!id || !title) return;
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    await addTactic(id, title);
    setNewId('');
    setNewTitle('');
  };

  const handleDelete = async (id) => {
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    await deleteTactic(id);
    setDeleteConfirm(null);
  };

  const handleMove = async (id, dir) => {
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    await moveTactic(id, dir);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
        전술 목록 ({tactics.length})
      </h3>

      {/* 전술 카드 리스트 */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {sorted.map((tac, idx) => (
          <div
            key={tac.id}
            onClick={() => onSelect(tac.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all group ${
              selectedTacticId === tac.id
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'
            }`}
          >
            <span className="text-[9px] font-mono font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 shrink-0">
              {tac.id.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-slate-700 truncate flex-1">
              {tac.title}
            </span>

            {/* 순서변경/삭제 버튼 */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {idx > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); handleMove(tac.id, 'up'); }}
                  className="text-[9px] text-slate-400 hover:text-blue-500 px-1"
                  disabled={saving}
                ><ChevronUp size={12} /></button>
              )}
              {idx < sorted.length - 1 && (
                <button
                  onClick={e => { e.stopPropagation(); handleMove(tac.id, 'down'); }}
                  className="text-[9px] text-slate-400 hover:text-blue-500 px-1"
                  disabled={saving}
                ><ChevronDown size={12} /></button>
              )}
              <button
                onClick={e => { e.stopPropagation(); setDeleteConfirm(tac.id); }}
                className="text-[9px] text-red-300 hover:text-red-500 px-1"
              ><Close size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* 새 전술 추가 */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <span className="text-[9px] font-bold text-slate-400">새 전술 추가</span>
        <div className="flex gap-1.5">
          <input
            value={newId}
            onChange={e => setNewId(e.target.value)}
            placeholder="t15"
            className="w-14 text-[10px] font-mono px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Tactic Title"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 text-[10px] px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newId.trim() || !newTitle.trim() || saving}
            className="text-[10px] font-bold text-white px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 transition-colors shrink-0"
          >+</button>
        </div>
      </div>

      {/* 삭제 확인 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-5 w-72">
            <h3 className="text-sm font-black text-slate-800 mb-2">전술 삭제</h3>
            <p className="text-xs text-slate-500 mb-4">
              <span className="font-mono font-bold text-red-500">{deleteConfirm}</span> 전술과 하위 기법/서브기법을 모두 삭제합니다.
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >취소</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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

import { useState } from 'react';
import GlossaryTermForm from './GlossaryTermForm';

export default function GlossaryEditor({ glossary = {}, addGlossaryTerm, updateGlossaryTerm, removeGlossaryTerm, renameGlossaryKey }) {
  const [newKeyInput, setNewKeyInput] = useState('');
  const entries = Object.entries(glossary);

  const handleAdd = () => {
    const key = newKeyInput.trim().replace(/\s+/g, '_').toLowerCase();
    if (!key) return;
    if (glossary[key]) return; // 이미 존재
    addGlossaryTerm(key, {
      term: '',
      fullName: '',
      analogy: '',
      easyDesc: '',
      techDesc: '',
    });
    setNewKeyInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
          용어집 ({entries.length}개)
        </span>
      </div>

      {entries.length === 0 && (
        <div className="p-6 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          아직 용어가 없습니다. 아래에서 추가하세요.
        </div>
      )}

      <div className="space-y-2">
        {entries.map(([key, data]) => (
          <GlossaryTermForm
            key={key}
            termKey={key}
            termData={data}
            onUpdate={updateGlossaryTerm}
            onDelete={removeGlossaryTerm}
            onRenameKey={renameGlossaryKey}
          />
        ))}
      </div>

      {/* 새 용어 추가 */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          value={newKeyInput}
          onChange={e => setNewKeyInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          placeholder="새 용어 key (snake_case, 예: valid_accounts)"
        />
        <button
          onClick={handleAdd}
          disabled={!newKeyInput.trim()}
          className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
        >
          + 추가
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function GlossaryTermForm({ termKey, termData, onUpdate, onDelete, onRenameKey }) {
  const [editing, setEditing] = useState(false);
  const [localKey, setLocalKey] = useState(termKey);
  const { term = '', fullName = '', analogy = '', easyDesc = '', techDesc = '' } = termData;

  const handleField = (field, value) => {
    onUpdate(termKey, { ...termData, [field]: value });
  };

  const handleKeyBlur = () => {
    const newKey = localKey.trim().replace(/\s+/g, '_').toLowerCase();
    if (newKey && newKey !== termKey) {
      onRenameKey(termKey, newKey);
    }
    setLocalKey(newKey || termKey);
  };

  if (!editing) {
    return (
      <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">{termKey}</span>
            <span className="text-sm font-bold text-slate-800 truncate">{term || '(빈 용어)'}</span>
            {fullName && <span className="text-[10px] text-slate-400 truncate hidden sm:inline">— {fullName}</span>}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">편집</button>
            <button onClick={() => onDelete(termKey)} className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">삭제</button>
          </div>
        </div>
        {analogy && <div className="mt-1 text-[11px] text-slate-500">{analogy}</div>}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border-2 border-blue-300 bg-blue-50/30 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">용어 편집</span>
        <button onClick={() => setEditing(false)} className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">접기</button>
      </div>

      {/* Key */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Key (snake_case)</span>
        <input type="text" value={localKey} onChange={e => setLocalKey(e.target.value)} onBlur={handleKeyBlur}
          className="mt-0.5 w-full text-xs font-mono px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none" />
      </label>

      {/* Term + Full Name */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Term *</span>
          <input type="text" value={term} onChange={e => handleField('term', e.target.value)}
            className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="OSINT" />
        </label>
        <label className="block">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Full Name</span>
          <input type="text" value={fullName} onChange={e => handleField('fullName', e.target.value)}
            className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Open-Source Intelligence" />
        </label>
      </div>

      {/* Analogy */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Analogy (비유)</span>
        <input type="text" value={analogy} onChange={e => handleField('analogy', e.target.value)}
          className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="합법적인 뒷조사" />
      </label>

      {/* Easy Desc */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Easy Description (쉬운 설명)</span>
        <textarea value={easyDesc} onChange={e => handleField('easyDesc', e.target.value)} rows={2}
          className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none resize-y" />
      </label>

      {/* Tech Desc */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Tech Description (기술 설명)</span>
        <textarea value={techDesc} onChange={e => handleField('techDesc', e.target.value)} rows={2}
          className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none resize-y" />
      </label>

      <div className="flex justify-end">
        <button onClick={() => onDelete(termKey)} className="text-[10px] font-bold px-3 py-1 rounded-md text-red-500 hover:bg-red-50 transition-colors">이 용어 삭제</button>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Close } from '@carbon/icons-react';

export default function TagInput({ tags = [], allTags = [], onAdd, onRemove }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const suggestions = input.trim()
    ? allTags.filter(t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t)).slice(0, 6)
    : [];

  const handleAdd = (tag) => {
    const trimmed = (tag || input).trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onAdd(trimmed);
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {/* 태그 목록 */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {tag}
            <button onClick={() => onRemove(tag)} className="text-blue-400 hover:text-red-500 transition-colors ml-0.5"><Close size={12} /></button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-[11px] text-slate-400">태그 없음</span>}
      </div>

      {/* 입력 */}
      <div className="relative">
        <div className="flex gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
            }}
            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="태그 입력 후 Enter"
          />
          <button onClick={() => handleAdd()} disabled={!input.trim()}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0">
            추가
          </button>
        </div>

        {/* 자동완성 드롭다운 */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 max-h-36 overflow-y-auto">
            {suggestions.map(s => (
              <button key={s} onMouseDown={() => handleAdd(s)}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-blue-50 text-slate-700 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

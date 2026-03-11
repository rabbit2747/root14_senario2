import { useState, useEffect } from 'react';

const LANGS = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export default function TranslationPanel({
  selectedItem, techniques, updateTactic, updateTechnique,
  saving, requestVerify,
}) {
  // selectedItem: { type: 'tactic'|'technique', id, title/name, translations }
  const [drafts, setDrafts] = useState({});
  const [saved, setSaved] = useState(false);

  // 선택 항목 변경시 draft 리셋
  useEffect(() => {
    if (selectedItem?.translations) {
      setDrafts({ ...selectedItem.translations });
    } else {
      setDrafts({});
    }
    setSaved(false);
  }, [selectedItem?.id || selectedItem?.tid]);

  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-slate-400 font-bold">항목을 선택하면 번역을 편집할 수 있습니다</p>
      </div>
    );
  }

  const handleChange = (lang, value) => {
    setDrafts(prev => ({ ...prev, [lang]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (requestVerify) { const ok = await requestVerify(); if (!ok) return; }
    if (selectedItem.type === 'tactic') {
      await updateTactic(selectedItem.id, { translations: drafts });
    } else if (selectedItem.type === 'technique') {
      await updateTechnique(selectedItem.tid, { translations: drafts });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const label = selectedItem.type === 'tactic'
    ? selectedItem.title
    : `${selectedItem.tid} ${selectedItem.name}`;

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">번역 편집</h3>

      {/* 선택 항목 표시 */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
          selectedItem.type === 'tactic'
            ? 'text-cyan-600 bg-cyan-50 border-cyan-200'
            : 'text-blue-600 bg-blue-50 border-blue-200'
        }`}>
          {selectedItem.type === 'tactic' ? 'TACTIC' : 'TECHNIQUE'}
        </span>
        <p className="text-xs font-bold text-slate-700 mt-1">{label}</p>
      </div>

      {/* 영어 원문 */}
      <div>
        <label className="text-[9px] font-bold text-slate-400 block mb-1">English (원문)</label>
        <div className="text-xs font-mono text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
          {selectedItem.title || selectedItem.name}
        </div>
      </div>

      {/* 4개 언어 입력 */}
      <div className="space-y-2">
        {LANGS.map(lang => (
          <div key={lang.code}>
            <label className="text-[9px] font-bold text-slate-400 block mb-1">
              {lang.flag} {lang.label} ({lang.code})
            </label>
            <input
              type="text"
              value={drafts[lang.code] || ''}
              onChange={e => handleChange(lang.code, e.target.value)}
              placeholder={`${lang.label} 번역 입력`}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
          saved
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 disabled:opacity-50'
        }`}
      >
        {saving ? '저장 중...' : saved ? '저장됨 ✓' : '번역 저장'}
      </button>
    </div>
  );
}

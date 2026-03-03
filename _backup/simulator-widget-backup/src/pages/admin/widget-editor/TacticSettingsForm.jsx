export default function TacticSettingsForm({ widgetData, updateSettings }) {
  const { tacticName = '', tacticNameKo = '', dictionaryTitle = '', bgLogo = '', stepTimings = {} } = widgetData;

  const handleTimingChange = (key, value) => {
    updateSettings({
      stepTimings: { ...stepTimings, [key]: parseInt(value, 10) || 0 },
    });
  };

  return (
    <div className="space-y-5">
      {/* 택틱 이름 */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tactic Name (EN)</span>
          <input
            type="text"
            value={tacticName}
            onChange={e => updateSettings({ tacticName: e.target.value })}
            className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            placeholder="Initial Access"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">택틱 이름 (KO)</span>
          <input
            type="text"
            value={tacticNameKo}
            onChange={e => updateSettings({ tacticNameKo: e.target.value })}
            className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            placeholder="초기 접근"
          />
        </label>
      </div>

      {/* 사전 제목 + 로고 */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Dictionary Title</span>
          <input
            type="text"
            value={dictionaryTitle}
            onChange={e => updateSettings({ dictionaryTitle: e.target.value })}
            className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            placeholder="Initial Access Dictionary"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">BG Logo Path</span>
          <input
            type="text"
            value={bgLogo}
            onChange={e => updateSettings({ bgLogo: e.target.value })}
            className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none font-mono text-[11px]"
            placeholder="/logo/logo-name-dark-nobg.png"
          />
        </label>
      </div>

      {/* 스텝 타이밍 */}
      <div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Step Timings (ms)</span>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {['alert', 'context', 'mechanism', 'identified'].map(key => (
            <label key={key} className="block">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{key}</span>
              <input
                type="number"
                value={stepTimings[key] || 0}
                onChange={e => handleTimingChange(key, e.target.value)}
                className="mt-0.5 w-full text-xs font-mono px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                step={500}
                min={500}
              />
            </label>
          ))}
        </div>
      </div>

      {/* tacticId / speedStorageKey (읽기 전용) */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">자동 생성 필드</span>
        <div className="mt-1.5 text-[11px] font-mono text-slate-500 space-y-0.5">
          <div>tacticId: <span className="text-slate-700 font-bold">{widgetData.tacticId}</span></div>
          <div>speedStorageKey: <span className="text-slate-700">{widgetData.speedStorageKey}</span></div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ANIMATION_PRESETS } from './useWidgetFormState';
import { ChevronUp, ChevronDown } from '@carbon/icons-react';

const PRESET_LABELS = {
  scan: 'Scan (스캔)',
  query: 'Query (질의)',
  probe: 'Probe (탐침)',
  flow: 'Flow (흐름)',
  inject: 'Inject (주입)',
  lateral: 'Lateral (측면이동)',
};

export default function AttackCaseForm({ index, caseData, glossaryKeys, onUpdate, onDelete, onMove, totalCases }) {
  const [expanded, setExpanded] = useState(false);
  const {
    subTechniqueId = '', subTechniqueName = '', tactic = '', technique = '',
    log = '', report = '', mechanismTitle = '', mechanismDesc = '',
    animationPreset = 'scan', targets = {},
  } = caseData;

  const handleField = (field, value) => {
    onUpdate(index, { [field]: value });
  };

  const handleTarget = (step, value) => {
    onUpdate(index, { targets: { ...targets, [step]: value } });
  };

  // 축소 상태
  if (!expanded) {
    return (
      <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">#{index + 1}</span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">{subTechniqueId || '?'}</span>
            <span className="text-sm font-bold text-slate-800 truncate">{subTechniqueName || '(이름 없음)'}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase shrink-0">{animationPreset}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {index > 0 && <button onClick={() => onMove(index, index - 1)} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200"><ChevronUp size={12} /></button>}
            {index < totalCases - 1 && <button onClick={() => onMove(index, index + 1)} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200"><ChevronDown size={12} /></button>}
            <button onClick={() => setExpanded(true)} className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">편집</button>
            <button onClick={() => onDelete(index)} className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-red-500 hover:bg-red-50 transition-colors">삭제</button>
          </div>
        </div>
      </div>
    );
  }

  // 확장 편집 상태
  return (
    <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">공격 케이스 #{index + 1}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold uppercase">{animationPreset}</span>
        </div>
        <div className="flex items-center gap-1">
          {index > 0 && <button onClick={() => onMove(index, index - 1)} className="text-[10px] px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 inline-flex items-center gap-0.5"><ChevronUp size={12} /> 위로</button>}
          {index < totalCases - 1 && <button onClick={() => onMove(index, index + 1)} className="text-[10px] px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 inline-flex items-center gap-0.5"><ChevronDown size={12} /> 아래로</button>}
          <button onClick={() => setExpanded(false)} className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">접기</button>
        </div>
      </div>

      {/* 기법 정보 */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Sub-Technique ID *</span>
          <input type="text" value={subTechniqueId} onChange={e => handleField('subTechniqueId', e.target.value)}
            className="mt-0.5 w-full text-xs font-mono px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="T1078.002" />
        </label>
        <label className="block">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Sub-Technique Name</span>
          <input type="text" value={subTechniqueName} onChange={e => handleField('subTechniqueName', e.target.value)}
            className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="Domain Accounts" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Tactic</span>
          <input type="text" value={tactic} onChange={e => handleField('tactic', e.target.value)}
            className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="Initial Access (초기 접근)" />
        </label>
        <label className="block">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Technique</span>
          <input type="text" value={technique} onChange={e => handleField('technique', e.target.value)}
            className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="Valid Accounts" />
        </label>
      </div>

      {/* SIEM Alert 로그 */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">SIEM Alert Log</span>
        <textarea value={log} onChange={e => handleField('log', e.target.value)} rows={2}
          className="mt-0.5 w-full text-xs font-mono px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none resize-y bg-slate-900 text-emerald-400"
          placeholder="[SIEM-ALRT] Suspicious login detected..." />
      </label>

      {/* 분석 보고서 */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">분석 보고서 (Report)</span>
        <textarea value={report} onChange={e => handleField('report', e.target.value)} rows={3}
          className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none resize-y" />
      </label>

      {/* 메커니즘 */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Mechanism Title</span>
        <input type="text" value={mechanismTitle} onChange={e => handleField('mechanismTitle', e.target.value)}
          className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none" />
      </label>
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Mechanism Description</span>
        <textarea value={mechanismDesc} onChange={e => handleField('mechanismDesc', e.target.value)} rows={3}
          className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none resize-y" />
      </label>

      {/* 애니메이션 프리셋 */}
      <label className="block">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Animation Preset *</span>
        <select value={animationPreset} onChange={e => handleField('animationPreset', e.target.value)}
          className="mt-0.5 w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none">
          {ANIMATION_PRESETS.map(p => (
            <option key={p} value={p}>{PRESET_LABELS[p] || p}</option>
          ))}
        </select>
      </label>

      {/* Targets (용어집 연결) */}
      <div>
        <span className="text-[9px] font-bold text-slate-400 uppercase">Targets (용어집 연결)</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {['step1', 'step2', 'step3'].map(step => (
            <label key={step} className="block">
              <span className="text-[8px] font-bold text-slate-400">{step}</span>
              <select value={targets[step] || ''} onChange={e => handleTarget(step, e.target.value)}
                className="mt-0.5 w-full text-[11px] font-mono px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none">
                <option value="">(선택)</option>
                {glossaryKeys.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-emerald-200">
        <button onClick={() => onDelete(index)} className="text-[10px] font-bold px-3 py-1 rounded-md text-red-500 hover:bg-red-50 transition-colors">이 케이스 삭제</button>
      </div>
    </div>
  );
}

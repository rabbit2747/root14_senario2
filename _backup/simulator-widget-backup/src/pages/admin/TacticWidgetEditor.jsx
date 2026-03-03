import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase, logAdminAudit } from '../../lib/supabase';

const TacticWidgetTemplate = lazy(() => import('../../components/tactic-widgets/TacticWidgetTemplate'));

// 로컬 JSON 목록
const LOCAL_DATA_MAP = {
  t1: () => import('../../data/tactic-widgets/t1-recon.json'),
  t2: () => import('../../data/tactic-widgets/t2-resource-development.json'),
  t3: () => import('../../data/tactic-widgets/t3-initial-access.json'),
  t4: () => import('../../data/tactic-widgets/t4-execution.json'),
  t5: () => import('../../data/tactic-widgets/t5-persistence.json'),
  t6: () => import('../../data/tactic-widgets/t6-privilege-escalation.json'),
  t7: () => import('../../data/tactic-widgets/t7-defense-evasion.json'),
  t8: () => import('../../data/tactic-widgets/t8-credential-access.json'),
  t9: () => import('../../data/tactic-widgets/t9-discovery.json'),
  t10: () => import('../../data/tactic-widgets/t10-lateral-movement.json'),
  t11: () => import('../../data/tactic-widgets/t11-collection.json'),
  t12: () => import('../../data/tactic-widgets/t12-command-and-control.json'),
  t13: () => import('../../data/tactic-widgets/t13-exfiltration.json'),
  t14: () => import('../../data/tactic-widgets/t14-impact.json'),
};

const TACTIC_LABELS = {
  t1: '정찰 (Reconnaissance)',
  t2: '자원 개발 (Resource Development)',
  t3: '초기 접근 (Initial Access)',
  t4: '실행 (Execution)',
  t5: '지속성 (Persistence)',
  t6: '권한 상승 (Privilege Escalation)',
  t7: '방어 회피 (Defense Evasion)',
  t8: '자격 증명 접근 (Credential Access)',
  t9: '탐색 (Discovery)',
  t10: '측면 이동 (Lateral Movement)',
  t11: '수집 (Collection)',
  t12: '명령 및 제어 (C2)',
  t13: '유출 (Exfiltration)',
  t14: '영향 (Impact)',
};

export default function TacticWidgetEditor() {
  const [selectedTactic, setSelectedTactic] = useState('t1');
  const [jsonText, setJsonText] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 택틱 변경 시 데이터 로드 (Supabase → 로컬 fallback)
  useEffect(() => {
    loadTacticData(selectedTactic);
  }, [selectedTactic]);

  const loadTacticData = async (tacticId) => {
    setJsonError('');
    setSaved(false);
    // 1) Supabase 우선
    try {
      const { data } = await supabase.from('widget_data').select('data').eq('tactic_id', tacticId).single();
      if (data?.data) {
        const text = JSON.stringify(data.data, null, 2);
        setJsonText(text);
        setPreviewData(data.data);
        return;
      }
    } catch { /* fallback */ }

    // 2) 로컬 JSON fallback
    const loader = LOCAL_DATA_MAP[tacticId];
    if (loader) {
      try {
        const mod = await loader();
        const localData = mod.default || mod;
        const text = JSON.stringify(localData, null, 2);
        setJsonText(text);
        setPreviewData(localData);
        return;
      } catch { /* no data */ }
    }

    // 3) 빈 템플릿
    const template = {
      tacticId,
      tacticName: TACTIC_LABELS[tacticId]?.split(' (')[0] || tacticId,
      tacticNameKo: TACTIC_LABELS[tacticId]?.split(' (')[0] || '',
      dictionaryTitle: 'Dictionary',
      bgLogo: '/logo/logo-name-dark-nobg.png',
      speedStorageKey: `${tacticId}_widget_speed`,
      glossary: {},
      attackCases: [],
      stepTimings: { alert: 3000, context: 4000, mechanism: 5000, identified: 5500 },
      speedOptions: [{ label: '0.5x', value: 0.5 }, { label: '1x', value: 1 }, { label: '1.5x', value: 1.5 }, { label: '2x', value: 2 }]
    };
    const text = JSON.stringify(template, null, 2);
    setJsonText(text);
    setPreviewData(template);
  };

  const handleJsonChange = (value) => {
    setJsonText(value);
    setJsonError('');
    setSaved(false);
    try {
      const parsed = JSON.parse(value);
      setPreviewData(parsed);
    } catch (e) {
      setJsonError('JSON 구문 오류: ' + e.message);
    }
  };

  const saveToSupabase = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonError('');
      setSaving(true);
      const { error } = await supabase.from('widget_data').upsert({
        tactic_id: selectedTactic,
        data: parsed,
        updated_at: new Date().toISOString()
      }, { onConflict: 'tactic_id' });
      if (error) throw error;
      logAdminAudit('widget_json_save', selectedTactic);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      if (e instanceof SyntaxError) setJsonError('JSON 구문 오류: ' + e.message);
      else setJsonError('저장 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-800">택틱 위젯 편집기</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedTactic}
            onChange={e => setSelectedTactic(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          >
            {Object.entries(TACTIC_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{id.toUpperCase()} — {label}</option>
            ))}
          </select>
          <button
            onClick={saveToSupabase}
            disabled={saving || !!jsonError}
            className={`text-xs font-bold px-4 py-1.5 rounded-lg border transition-all ${saved ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 disabled:opacity-50'}`}
          >
            {saving ? '저장 중...' : saved ? '저장됨' : 'Supabase 저장'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* JSON 편집기 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">JSON Editor</span>
            {jsonError && <span className="text-[10px] text-red-500 font-bold">{jsonError}</span>}
          </div>
          <textarea
            value={jsonText}
            onChange={e => handleJsonChange(e.target.value)}
            className="w-full h-[600px] font-mono text-[11px] p-4 rounded-xl border border-slate-300 bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* 실시간 프리뷰 */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Live Preview</span>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50" style={{ height: 600, overflowY: 'auto' }}>
            {previewData && !jsonError ? (
              <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
                <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '181.8%' }}>
                  <TacticWidgetTemplate tacticData={previewData} />
                </div>
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                {jsonError ? 'JSON 오류 수정 후 프리뷰가 표시됩니다' : '데이터 없음'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

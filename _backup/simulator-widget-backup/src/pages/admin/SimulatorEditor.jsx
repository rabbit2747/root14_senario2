import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase, logAdminAudit } from '../../lib/supabase';
import { ChevronLeft, ChevronRight, GameConsole, Renew } from '@carbon/icons-react';

const AttackSimulatorWidget = lazy(() =>
  import('../../components/attack-simulator/AttackSimulatorWidget')
);

// 로컬 JSON fallback 매핑
const LOCAL_DATA_MAP = {
  'T1078.002': () => import('../../data/attack-simulators/T1078.002.json'),
};

// 알려진 서브테크닉 목록 (확장 가능)
const SUB_TECHNIQUES = [
  { id: 'T1078.002', label: 'T1078.002 — Domain Accounts (도메인 계정)' },
];

/**
 * SimulatorEditor — 공격 시뮬레이터 JSON 편집기
 * TacticWidgetEditor 패턴 기반
 */
export default function SimulatorEditor({ requestVerify }) {
  const [selectedId, setSelectedId] = useState('T1078.002');
  const [jsonText, setJsonText] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 서브테크닉 변경 시 데이터 로드
  useEffect(() => {
    loadData(selectedId);
  }, [selectedId]);

  const loadData = async (subTechId) => {
    setJsonError('');
    setSaved(false);

    // 1) Supabase 우선
    try {
      const { data } = await supabase
        .from('attack_simulator_data')
        .select('data')
        .eq('sub_technique_id', subTechId)
        .maybeSingle();
      if (data?.data) {
        setJsonText(JSON.stringify(data.data, null, 2));
        return;
      }
    } catch { /* fallback */ }

    // 2) 로컬 JSON fallback
    const loader = LOCAL_DATA_MAP[subTechId];
    if (loader) {
      try {
        const mod = await loader();
        const localData = mod.default || mod;
        setJsonText(JSON.stringify(localData, null, 2));
        return;
      } catch { /* no data */ }
    }

    // 3) 빈 템플릿
    const template = {
      subTechniqueId: subTechId,
      subTechniqueName: '',
      nameKo: '',
      tactics: [],
      technique: '',
      topology: { viewBox: '0 0 620 220', nodes: [], edges: [] },
      phases: [],
      glossary: {},
    };
    setJsonText(JSON.stringify(template, null, 2));
  };

  const handleJsonChange = (value) => {
    setJsonText(value);
    setJsonError('');
    setSaved(false);
    try {
      JSON.parse(value);
      setJsonError('');
    } catch (e) {
      setJsonError('JSON 구문 오류: ' + e.message);
    }
  };

  const handlePreview = () => {
    try {
      JSON.parse(jsonText);
      setPreviewKey(k => k + 1);
    } catch (e) {
      setJsonError('JSON 구문 오류: ' + e.message);
    }
  };

  const saveToSupabase = async () => {
    if (requestVerify) {
      const ok = await requestVerify();
      if (!ok) return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      setJsonError('');
      setSaving(true);

      const { error } = await supabase
        .from('attack_simulator_data')
        .upsert({
          sub_technique_id: selectedId,
          data: parsed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'sub_technique_id' });

      if (error) throw error;
      logAdminAudit('simulator_json_save', selectedId);
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
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><GameConsole size={20} /> 공격 시뮬레이터 편집기</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          >
            {SUB_TECHNIQUES.map(st => (
              <option key={st.id} value={st.id}>{st.label}</option>
            ))}
          </select>
          <button
            onClick={handlePreview}
            disabled={!!jsonError}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <Renew size={14} className="inline" /> 프리뷰 새로고침
          </button>
          <button
            onClick={saveToSupabase}
            disabled={saving || !!jsonError}
            className={`text-xs font-bold px-4 py-1.5 rounded-lg border transition-all ${
              saved
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {saving ? '저장 중...' : saved ? '✓ 저장됨' : 'Supabase 저장'}
          </button>
        </div>
      </div>

      {/* 2컬럼 레이아웃: JSON + 프리뷰 */}
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
            className="w-full h-[650px] font-mono text-[11px] p-4 rounded-xl border border-slate-300 bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* 실시간 프리뷰 */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Live Preview</span>
          <div
            className="rounded-xl border border-slate-200 overflow-hidden bg-[#0a0f1a]"
            style={{ height: 650, overflowY: 'auto' }}
          >
            {!jsonError ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                }
              >
                <div key={previewKey} className="p-4">
                  <SimulatorPreviewInline jsonText={jsonText} />
                </div>
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                JSON 오류 수정 후 프리뷰가 표시됩니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SimulatorPreviewInline — JSON 텍스트를 파싱하여 위젯 인라인 프리뷰
 * AttackSimulatorWidget은 훅으로 데이터를 로딩하므로,
 * 에디터 프리뷰에서는 직접 JSON을 파싱하여 하위 컴포넌트만 렌더링
 */
function SimulatorPreviewInline({ jsonText }) {
  const [NetworkTopologyDiagram, setNetworkTopologyDiagram] = useState(null);
  const [PhaseStepperBar, setPhaseStepperBar] = useState(null);
  const [PhaseDetailPanel, setPhaseDetailPanel] = useState(null);
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // 동적 import로 컴포넌트 로드
    Promise.all([
      import('../../components/attack-simulator/NetworkTopologyDiagram'),
      import('../../components/attack-simulator/PhaseStepperBar'),
      import('../../components/attack-simulator/PhaseDetailPanel'),
    ]).then(([ntd, psb, pdp]) => {
      setNetworkTopologyDiagram(() => ntd.default);
      setPhaseStepperBar(() => psb.default);
      setPhaseDetailPanel(() => pdp.default);
    });
  }, []);

  let data = null;
  try { data = JSON.parse(jsonText); } catch { return null; }
  if (!data?.phases?.length) return <div className="text-slate-500 text-sm text-center py-10">페이즈 데이터가 필요합니다</div>;

  const currentPhaseData = data.phases.find(p => p.id === phase) || data.phases[0];

  if (!NetworkTopologyDiagram || !PhaseStepperBar || !PhaseDetailPanel) {
    return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <PhaseStepperBar phases={data.phases} currentPhase={phase} onPhaseClick={setPhase} />
      <NetworkTopologyDiagram topology={data.topology} currentPhase={phase} activeNodes={currentPhaseData.activeNodes || []} />
      <PhaseDetailPanel phase={currentPhaseData} glossary={data.glossary} />
      <div className="flex justify-center gap-2">
        <button onClick={() => setPhase(p => Math.max(1, p - 1))} className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 cursor-pointer inline-flex items-center gap-1"><ChevronLeft size={14} /> 이전</button>
        <button onClick={() => setPhase(p => Math.min(data.phases.length, p + 1))} className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 cursor-pointer inline-flex items-center gap-1">다음 <ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

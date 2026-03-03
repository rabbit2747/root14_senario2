import { useState, useEffect, useMemo, useCallback } from 'react';
import { Screen, Search, WarningAlt, Idea, Task } from '@carbon/icons-react';

// ── 시나리오 동적 로더 (DesktopLab.jsx와 동일 매핑) ──
const SCENARIO_LOADERS = {
  'T1589.003': () => import('../../../data/lab-scenarios/T1589.003.json'),
  'T1596.001': () => import('../../../data/lab-scenarios/T1596.001.json'),
  'T1595.002': () => import('../../../data/lab-scenarios/T1595.002.json'),
  'T1583.001': () => import('../../../data/lab-scenarios/T1583.001.json'),
  'T1585.001': () => import('../../../data/lab-scenarios/T1585.001.json'),
  'T1587.001': () => import('../../../data/lab-scenarios/T1587.001.json'),
  'T1566.001': () => import('../../../data/lab-scenarios/T1566.001.json'),
  'T1195.002': () => import('../../../data/lab-scenarios/T1195.002.json'),
  'T1059.001': () => import('../../../data/lab-scenarios/T1059.001.json'),
  'T1047':     () => import('../../../data/lab-scenarios/T1047.json'),
  'T1204.002': () => import('../../../data/lab-scenarios/T1204.002.json'),
  'T1547.001': () => import('../../../data/lab-scenarios/T1547.001.json'),
  'T1053.005': () => import('../../../data/lab-scenarios/T1053.005.json'),
  'T1548.002': () => import('../../../data/lab-scenarios/T1548.002.json'),
  'T1574.001': () => import('../../../data/lab-scenarios/T1574.001.json'),
  'T1134.001': () => import('../../../data/lab-scenarios/T1134.001.json'),
  'T1136.001': () => import('../../../data/lab-scenarios/T1136.001.json'),
  'T1027.001': () => import('../../../data/lab-scenarios/T1027.001.json'),
  'T1055.001': () => import('../../../data/lab-scenarios/T1055.001.json'),
  'T1070.001': () => import('../../../data/lab-scenarios/T1070.001.json'),
  'T1003.001': () => import('../../../data/lab-scenarios/T1003.001.json'),
  'T1558.003': () => import('../../../data/lab-scenarios/T1558.003.json'),
  'T1110.001': () => import('../../../data/lab-scenarios/T1110.001.json'),
  'T1087.002': () => import('../../../data/lab-scenarios/T1087.002.json'),
  'T1083':     () => import('../../../data/lab-scenarios/T1083.json'),
  'T1046':     () => import('../../../data/lab-scenarios/T1046.json'),
  'T1021.001': () => import('../../../data/lab-scenarios/T1021.001.json'),
  'T1021.002': () => import('../../../data/lab-scenarios/T1021.002.json'),
  'T1550.002': () => import('../../../data/lab-scenarios/T1550.002.json'),
  'T1113':     () => import('../../../data/lab-scenarios/T1113.json'),
  'T1114.001': () => import('../../../data/lab-scenarios/T1114.001.json'),
  'T1560.001': () => import('../../../data/lab-scenarios/T1560.001.json'),
  'T1071.001': () => import('../../../data/lab-scenarios/T1071.001.json'),
  'T1071.004': () => import('../../../data/lab-scenarios/T1071.004.json'),
  'T1573.001': () => import('../../../data/lab-scenarios/T1573.001.json'),
  'T1041':     () => import('../../../data/lab-scenarios/T1041.json'),
  'T1567.002': () => import('../../../data/lab-scenarios/T1567.002.json'),
  'T1048.003': () => import('../../../data/lab-scenarios/T1048.003.json'),
  'T1486':     () => import('../../../data/lab-scenarios/T1486.json'),
  'T1561.001': () => import('../../../data/lab-scenarios/T1561.001.json'),
  'T1498.001': () => import('../../../data/lab-scenarios/T1498.001.json'),
};

// ── 전용 랩 (LabT1078처럼 별도 컴포넌트) ──
const DEDICATED_LABS = { 'T1078.002': '/lab/t1078' };

/**
 * LabScenarioManager — 관리자용 랩 시나리오 관리 대시보드
 */
export default function LabScenarioManager() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [search, setSearch] = useState('');

  // ── 전체 시나리오 로드 ──
  useEffect(() => {
    async function loadAll() {
      const results = [];

      // 전용 랩 추가
      Object.entries(DEDICATED_LABS).forEach(([id, path]) => {
        results.push({ id, title: 'Domain Accounts 시뮬레이션', titleEn: 'Domain Accounts Simulation', steps: 11, dedicated: true, path });
      });

      // JSON 시나리오 로드
      const entries = Object.entries(SCENARIO_LOADERS);
      const promises = entries.map(async ([id, loader]) => {
        try {
          const mod = await loader();
          const data = mod.default || mod;
          return { id, title: data.title, titleEn: data.titleEn, steps: data.steps?.length || 0, processTree: data.processTree?.length || 0, duration: data.duration || data.stepDuration || 8, dedicated: false, data };
        } catch {
          return { id, title: '(로드 실패)', titleEn: '(Load failed)', steps: 0, dedicated: false, error: true };
        }
      });

      const loaded = await Promise.all(promises);
      results.push(...loaded);
      results.sort((a, b) => a.id.localeCompare(b.id));
      setScenarios(results);
      setLoading(false);
    }
    loadAll();
  }, []);

  // ── 시나리오 선택 ──
  const handleSelect = useCallback((sc) => {
    if (sc.dedicated) {
      setSelectedId(sc.id);
      setJsonText('// 전용 컴포넌트 (LabT1078.jsx)\n// 이 시나리오는 별도 JSX 파일로 관리됩니다.\n// 경로: src/pages/lab/LabT1078.jsx');
      setJsonError(null);
      return;
    }
    setSelectedId(sc.id);
    setJsonText(JSON.stringify(sc.data, null, 2));
    setJsonError(null);
  }, []);

  // ── JSON 유효성 검사 ──
  const handleJsonChange = useCallback((value) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      if (!parsed.id || !parsed.steps || !Array.isArray(parsed.steps)) {
        setJsonError('필수 필드 누락: id, steps[] 필요');
      } else if (parsed.steps.length === 0) {
        setJsonError('steps 배열이 비어있습니다');
      } else {
        setJsonError(null);
      }
    } catch (e) {
      setJsonError(`JSON 파싱 오류: ${e.message}`);
    }
  }, []);

  // ── 필드 통계 분석 ──
  const getFieldStats = useCallback((data) => {
    if (!data?.steps) return {};
    const fields = ['cmd', 'out', 'def', 'defAction', 'desc', 'descEn', 'feynman', 'feynmanEn', 'expert', 'expertEn', 'defTooltip', 'terms', 'stepTitle', 'stepTitleEn'];
    const stats = {};
    fields.forEach(f => {
      const count = data.steps.filter(s => s[f] && (Array.isArray(s[f]) ? s[f].length > 0 : true)).length;
      stats[f] = { count, total: data.steps.length, percent: Math.round((count / data.steps.length) * 100) };
    });
    return stats;
  }, []);

  // ── 검색 필터 ──
  const filtered = useMemo(() => {
    if (!search.trim()) return scenarios;
    const q = search.toLowerCase();
    return scenarios.filter(s => s.id.toLowerCase().includes(q) || s.title?.toLowerCase().includes(q) || s.titleEn?.toLowerCase().includes(q));
  }, [scenarios, search]);

  const selectedScenario = scenarios.find(s => s.id === selectedId);
  const fieldStats = selectedScenario?.data ? getFieldStats(selectedScenario.data) : null;

  // ── 통계 요약 ──
  const totalScenarios = scenarios.length;
  const dedicatedCount = scenarios.filter(s => s.dedicated).length;
  const jsonCount = scenarios.filter(s => !s.dedicated).length;
  const avgSteps = jsonCount > 0 ? Math.round(scenarios.filter(s => !s.dedicated).reduce((sum, s) => sum + s.steps, 0) / jsonCount) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-300/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-mono">시나리오 로드 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── 헤더 + 통계 ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Screen size={20} /> 랩 시나리오 관리</h2>
          <p className="text-xs text-slate-500 mt-1">데스크톱 시뮬레이션 시나리오 JSON 파일을 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-black text-blue-600">{totalScenarios}</div>
            <div className="text-[10px] text-blue-500 font-bold">전체</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-black text-amber-600">{dedicatedCount}</div>
            <div className="text-[10px] text-amber-500 font-bold">전용</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-black text-emerald-600">{jsonCount}</div>
            <div className="text-[10px] text-emerald-500 font-bold">JSON</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-black text-purple-600">{avgSteps}</div>
            <div className="text-[10px] text-purple-500 font-bold">평균 스텝</div>
          </div>
        </div>
      </div>

      {/* ── 검색 ── */}
      <div className="relative">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="시나리오 검색 (ID 또는 제목)..."
          className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm" />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><Search size={16} /></span>
      </div>

      {/* ── 2컬럼 레이아웃 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 시나리오 목록 */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">시나리오 목록 ({filtered.length}개)</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
            {filtered.map(sc => (
              <button key={sc.id} onClick={() => handleSelect(sc)}
                className={`w-full text-left px-4 py-3 transition-all hover:bg-blue-50/50 ${selectedId === sc.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800">{sc.id}</span>
                  <div className="flex items-center gap-1.5">
                    {sc.dedicated && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">전용</span>}
                    {sc.error && <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">에러</span>}
                    <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">{sc.steps}스텝</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sc.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 시나리오 상세 / 에디터 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {selectedId ? (
            <>
              {/* 선택된 시나리오 헤더 */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedScenario?.titleEn || selectedScenario?.title}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedId} · {selectedScenario?.steps || 0} steps</p>
                </div>
                <div className="flex gap-2">
                  <a href={`/lab/desktop/${selectedId}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors">
                    <Screen size={16} className="inline" /> 미리보기
                  </a>
                </div>
              </div>

              {/* 필드 완성도 (JSON 시나리오만) */}
              {fieldStats && (
                <div className="px-5 py-3 bg-white border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">필드 완성도</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(fieldStats).map(([field, stat]) => (
                      <div key={field} className={`text-[9px] font-bold px-2 py-1 rounded-full ${stat.percent === 100 ? 'bg-emerald-100 text-emerald-700' : stat.percent > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                        {field}: {stat.count}/{stat.total}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JSON 에디터 */}
              <div className="relative">
                {jsonError && (
                  <div className="px-5 py-2 bg-red-50 border-b border-red-200 text-xs font-bold text-red-600 flex items-center gap-1">
                    <WarningAlt size={14} /> {jsonError}
                  </div>
                )}
                <textarea value={jsonText} onChange={e => handleJsonChange(e.target.value)}
                  spellCheck={false} readOnly={selectedScenario?.dedicated}
                  className={`w-full h-[500px] p-5 font-mono text-[11px] leading-relaxed bg-[#1e293b] text-slate-300 resize-none outline-none ${selectedScenario?.dedicated ? 'opacity-60' : ''}`}
                  placeholder="시나리오 JSON을 입력하세요..." />
              </div>

              {/* 안내 */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400">
                <Idea size={14} className="inline" /> JSON 시나리오는 <code className="bg-slate-200 px-1 rounded">src/data/lab-scenarios/{selectedId}.json</code>에 저장됩니다.
                편집 후 파일을 직접 업데이트하세요.
                {selectedScenario?.dedicated && <span className="text-amber-500 font-bold ml-2">전용 컴포넌트는 읽기 전용입니다.</span>}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-slate-400">
              <div className="text-center">
                <div className="mb-3"><Screen size={32} /></div>
                <p className="text-sm font-bold">왼쪽에서 시나리오를 선택하세요</p>
                <p className="text-xs mt-1">JSON 구조와 필드 완성도를 확인할 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── JSON 스키마 가이드 ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Task size={16} /> 시나리오 JSON 스키마</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
          <div>
            <div className="font-bold text-slate-700 mb-1">필수 필드</div>
            <ul className="space-y-1 text-slate-500">
              <li><span className="text-emerald-600">id</span> — 기법 ID (예: "T1595.002")</li>
              <li><span className="text-emerald-600">title</span> — 한국어 제목</li>
              <li><span className="text-emerald-600">titleEn</span> — 영어 제목</li>
              <li><span className="text-emerald-600">steps[]</span> — 시뮬레이션 스텝 배열</li>
              <li className="ml-3"><span className="text-blue-600">cmd</span> — 해커 명령어</li>
              <li className="ml-3"><span className="text-blue-600">out</span> — 명령어 출력</li>
              <li className="ml-3"><span className="text-blue-600">def</span> — 방어자 알림</li>
              <li className="ml-3"><span className="text-blue-600">defAction</span> — 방어 조치</li>
              <li className="ml-3"><span className="text-blue-600">desc</span> — 한국어 설명</li>
              <li className="ml-3"><span className="text-blue-600">descEn</span> — 영어 설명</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-slate-700 mb-1">선택 필드 (LabT1078 수준)</div>
            <ul className="space-y-1 text-slate-500">
              <li><span className="text-purple-600">stepDuration</span> — 스텝당 초 (기본: 8)</li>
              <li><span className="text-purple-600">processTree[]</span> — 프로세스 트리</li>
              <li className="ml-3"><span className="text-amber-600">name</span> / <span className="text-amber-600">depth</span> / <span className="text-amber-600">alert</span> / <span className="text-amber-600">minStep</span></li>
              <li><span className="text-purple-600">steps[].feynman</span> — TTS 파인만 텍스트</li>
              <li><span className="text-purple-600">steps[].expert</span> — 전문가 인사이트</li>
              <li><span className="text-purple-600">steps[].defTooltip</span> — SOC 알럿 텍스트</li>
              <li><span className="text-purple-600">steps[].stepTitle</span> — 스텝 제목</li>
              <li><span className="text-purple-600">steps[].terms[]</span> — 핵심 용어</li>
              <li className="ml-3"><span className="text-amber-600">name</span> / <span className="text-amber-600">desc</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

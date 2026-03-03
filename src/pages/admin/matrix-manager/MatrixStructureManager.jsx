import { useState, useMemo } from 'react';
import useMatrixFormState from './useMatrixFormState';
import TacticListPanel from './TacticListPanel';
import TechniquePanel from './TechniquePanel';
import TranslationPanel from './TranslationPanel';
import AdminGuideSection from '../../../components/admin/AdminGuideSection';
import { Close, Renew } from '@carbon/icons-react';

export default function MatrixStructureManager({ requestVerify }) {
  const state = useMatrixFormState();
  const {
    tactics, techniques, subTechniques,
    loading, saving, error, setError,
    addTactic, updateTactic, deleteTactic, moveTactic,
    addTechnique, updateTechnique, deleteTechnique,
    addSubTechnique, updateSubTechnique, deleteSubTechnique,
    loadAll,
  } = state;

  const [selectedTacticId, setSelectedTacticId] = useState(null);
  const [selectedTransItem, setSelectedTransItem] = useState(null);

  // 전술 선택시 번역 패널에 전술 정보 전달
  const handleSelectTactic = (id) => {
    setSelectedTacticId(id);
    const tac = tactics.find(t => t.id === id);
    if (tac) {
      setSelectedTransItem({ type: 'tactic', id: tac.id, title: tac.title, translations: tac.translations });
    }
  };

  // 기법/서브 선택시 번역 패널
  const handleSelectItem = (item) => {
    if (item.type === 'technique') {
      const tech = techniques.find(t => t.tid === item.tid);
      if (tech) {
        setSelectedTransItem({ type: 'technique', tid: tech.tid, name: tech.name, translations: tech.translations });
      }
    }
    // 서브기법은 번역 없음 (DB에 translations 컬럼 없음) → 무시
  };

  // 통계
  const stats = useMemo(() => ({
    tactics: tactics.length,
    techniques: techniques.length,
    subs: subTechniques.length,
    critical: techniques.filter(t => t.is_critical).length,
  }), [tactics, techniques, subTechniques]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-bold">매트릭스 데이터 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-800">매트릭스 구조 관리</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              전술 {stats.tactics}
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              기법 {stats.techniques}
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              서브 {stats.subs}
            </span>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              Critical {stats.critical}
            </span>
          </div>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="text-[10px] font-bold text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Renew size={14} className="inline" /> 새로고침
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <span className="text-xs text-red-600 font-bold">{error}</span>
          <button onClick={() => setError(null)} className="text-[10px] text-red-400 hover:text-red-600"><Close size={12} /></button>
        </div>
      )}

      {/* 3-패널 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 좌측: 전술 목록 */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4">
          <TacticListPanel
            tactics={tactics}
            selectedTacticId={selectedTacticId}
            onSelect={handleSelectTactic}
            addTactic={addTactic}
            deleteTactic={deleteTactic}
            moveTactic={moveTactic}
            saving={saving}
            requestVerify={requestVerify}
          />
        </div>

        {/* 중앙: 기법 + 서브기법 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <TechniquePanel
            selectedTacticId={selectedTacticId}
            techniques={techniques}
            subTechniques={subTechniques}
            addTechnique={addTechnique}
            updateTechnique={updateTechnique}
            deleteTechnique={deleteTechnique}
            addSubTechnique={addSubTechnique}
            updateSubTechnique={updateSubTechnique}
            deleteSubTechnique={deleteSubTechnique}
            saving={saving}
            requestVerify={requestVerify}
            onSelectItem={handleSelectItem}
          />
        </div>

        {/* 우측: 번역 */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4">
          <TranslationPanel
            selectedItem={selectedTransItem}
            techniques={techniques}
            updateTactic={updateTactic}
            updateTechnique={updateTechnique}
            saving={saving}
            requestVerify={requestVerify}
          />
        </div>
      </div>

      <AdminGuideSection
        steps={[
          '왼쪽 패널: 전술(Tactic) 목록 — 추가/삭제/드래그 정렬 가능',
          '중앙 패널: 선택된 전술의 기법(Technique) 및 서브기법(Sub-technique) 계층',
          '오른쪽 패널: 선택된 항목의 번역 편집 (5개 언어)',
          '전술을 클릭하면 해당 기법 목록이 중앙에 표시됩니다',
          '기법 아래 + 서브기법 버튼으로 하위 항목을 추가합니다',
        ]}
        tips={['전술/기법 삭제 시 하위 데이터도 함께 삭제됩니다']}
      />
    </div>
  );
}

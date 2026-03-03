import AttackCaseForm from './AttackCaseForm';

export default function AttackCaseEditor({ attackCases = [], glossaryKeys = [], addAttackCase, updateAttackCase, removeAttackCase, moveAttackCase }) {
  const handleAdd = () => {
    addAttackCase({
      subTechniqueId: '',
      subTechniqueName: '',
      tactic: '',
      technique: '',
      log: '',
      report: '',
      mechanismTitle: '',
      mechanismDesc: '',
      animationPreset: 'scan',
      targets: { step1: '', step2: '', step3: '' },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
          공격 케이스 ({attackCases.length}개)
        </span>
      </div>

      {attackCases.length === 0 && (
        <div className="p-6 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          아직 공격 케이스가 없습니다. 아래에서 추가하세요.
        </div>
      )}

      <div className="space-y-2">
        {attackCases.map((caseData, i) => (
          <AttackCaseForm
            key={caseData.id || i}
            index={i}
            caseData={caseData}
            glossaryKeys={glossaryKeys}
            onUpdate={updateAttackCase}
            onDelete={removeAttackCase}
            onMove={moveAttackCase}
            totalCases={attackCases.length}
          />
        ))}
      </div>

      {/* 새 케이스 추가 */}
      <button
        onClick={handleAdd}
        className="w-full text-xs font-bold py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
      >
        + 공격 케이스 추가
      </button>
    </div>
  );
}

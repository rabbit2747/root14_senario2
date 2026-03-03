import { useState } from 'react';
import useWidgetFormState, { TACTIC_LABELS } from './useWidgetFormState';
import TacticSettingsForm from './TacticSettingsForm';
import GlossaryEditor from './GlossaryEditor';
import AttackCaseEditor from './AttackCaseEditor';
import WidgetPreviewPanel from './WidgetPreviewPanel';
import AdminGuideSection from '../../../components/admin/AdminGuideSection';
import { Settings, Book, Security } from '@carbon/icons-react';

const INNER_TABS = [
  { id: 'settings', label: '기본설정', Icon: Settings },
  { id: 'glossary', label: '용어집', Icon: Book },
  { id: 'cases', label: '공격케이스', Icon: Security },
];

export default function WidgetFormEditor({ requestVerify }) {
  const [innerTab, setInnerTab] = useState('settings');
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  const state = useWidgetFormState('t1');
  const {
    selectedTactic, setSelectedTactic, widgetData,
    loading, saving, saved, error, setError,
    updateSettings,
    addGlossaryTerm, updateGlossaryTerm, removeGlossaryTerm, renameGlossaryKey,
    addAttackCase, updateAttackCase, removeAttackCase, moveAttackCase,
    saveToSupabase, setFromJson,
  } = state;

  const glossaryKeys = Object.keys(widgetData.glossary || {});

  // JSON 모드 토글
  const toggleJsonMode = () => {
    if (!jsonMode) {
      setJsonText(JSON.stringify(widgetData, null, 2));
      setJsonError('');
    } else {
      // JSON → 폼 전환: 현재 JSON 텍스트를 적용
      if (jsonText) {
        const ok = setFromJson(jsonText);
        if (!ok) return; // 파싱 에러 시 전환 안 함
      }
    }
    setJsonMode(!jsonMode);
  };

  const handleJsonChange = (value) => {
    setJsonText(value);
    setJsonError('');
    try {
      JSON.parse(value);
    } catch (e) {
      setJsonError('JSON 구문 오류: ' + e.message);
    }
  };

  const handleSave = async () => {
    if (requestVerify) {
      const ok = await requestVerify();
      if (!ok) return;
    }
    if (jsonMode) {
      const ok = setFromJson(jsonText);
      if (!ok) return;
    }
    await saveToSupabase();
  };

  return (
    <div className="space-y-4">
      {/* 상단 바 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
            onClick={toggleJsonMode}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${jsonMode ? 'bg-slate-800 text-emerald-400 border-slate-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
          >
            {jsonMode ? '폼 모드' : 'JSON 모드'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (jsonMode && !!jsonError)}
            className={`text-xs font-bold px-4 py-1.5 rounded-lg border transition-all ${saved ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 disabled:opacity-50'}`}
          >
            {saving ? '저장 중...' : saved ? '저장됨 ✓' : 'Supabase 저장'}
          </button>
        </div>
      </div>

      {/* 에러 표시 */}
      {(error || jsonError) && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-bold whitespace-pre-wrap">
          {error || jsonError}
          <button onClick={() => { setError(null); setJsonError(''); }} className="ml-2 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* 좌측: 폼 or JSON */}
          <div className="xl:col-span-3 space-y-3">
            {jsonMode ? (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">JSON Editor</span>
                <textarea
                  value={jsonText}
                  onChange={e => handleJsonChange(e.target.value)}
                  className="w-full h-[600px] font-mono text-[11px] p-4 rounded-xl border border-slate-300 bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>
            ) : (
              <>
                {/* 내부 탭 */}
                <div className="flex gap-1 border-b border-slate-200">
                  {INNER_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setInnerTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${innerTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                      <tab.Icon size={16} />
                      {tab.label}
                      {tab.id === 'glossary' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{glossaryKeys.length}</span>}
                      {tab.id === 'cases' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{(widgetData.attackCases || []).length}</span>}
                    </button>
                  ))}
                </div>

                {/* 탭 콘텐츠 */}
                <div className="min-h-[500px]">
                  {innerTab === 'settings' && (
                    <TacticSettingsForm widgetData={widgetData} updateSettings={updateSettings} />
                  )}
                  {innerTab === 'glossary' && (
                    <GlossaryEditor
                      glossary={widgetData.glossary}
                      addGlossaryTerm={addGlossaryTerm}
                      updateGlossaryTerm={updateGlossaryTerm}
                      removeGlossaryTerm={removeGlossaryTerm}
                      renameGlossaryKey={renameGlossaryKey}
                    />
                  )}
                  {innerTab === 'cases' && (
                    <AttackCaseEditor
                      attackCases={widgetData.attackCases}
                      glossaryKeys={glossaryKeys}
                      addAttackCase={addAttackCase}
                      updateAttackCase={updateAttackCase}
                      removeAttackCase={removeAttackCase}
                      moveAttackCase={moveAttackCase}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* 우측: 프리뷰 */}
          <div className="xl:col-span-2">
            <WidgetPreviewPanel widgetData={widgetData} error={error || jsonError} />
          </div>
        </div>
      )}

      <AdminGuideSection
        steps={[
          '상단 드롭다운에서 편집할 전술(Tactic)을 선택합니다',
          '기본설정 탭에서 전술 이름, 로고, 애니메이션 속도를 설정합니다',
          '용어집 탭에서 보안 용어를 추가/수정합니다 (용어, 유사어, 설명)',
          '공격케이스 탭에서 실제 공격 시나리오를 구성합니다 (서브기법 ID, 로그, 메커니즘)',
          '우측 상단 JSON 모드로 전환하면 원본 데이터를 직접 편집할 수 있습니다',
          '저장 버튼 → 관리자 비밀번호 재검증 → Supabase에 저장됩니다',
        ]}
        tips={[
          '용어집 키가 공격케이스의 targets에서 참조되므로, 키 이름 변경 시 targets도 함께 수정하세요',
          '애니메이션 프리셋: scan, query, probe, flow, inject, lateral 중 선택',
        ]}
      />
    </div>
  );
}

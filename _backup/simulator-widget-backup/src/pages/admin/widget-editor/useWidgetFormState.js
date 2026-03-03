import { useState, useEffect, useCallback } from 'react';
import { supabase, logAdminAudit } from '../../../lib/supabase';

// 로컬 JSON fallback
const LOCAL_DATA_MAP = {
  t1: () => import('../../../data/tactic-widgets/t1-recon.json'),
  t2: () => import('../../../data/tactic-widgets/t2-resource-development.json'),
  t3: () => import('../../../data/tactic-widgets/t3-initial-access.json'),
  t4: () => import('../../../data/tactic-widgets/t4-execution.json'),
  t5: () => import('../../../data/tactic-widgets/t5-persistence.json'),
  t6: () => import('../../../data/tactic-widgets/t6-privilege-escalation.json'),
  t7: () => import('../../../data/tactic-widgets/t7-defense-evasion.json'),
  t8: () => import('../../../data/tactic-widgets/t8-credential-access.json'),
  t9: () => import('../../../data/tactic-widgets/t9-discovery.json'),
  t10: () => import('../../../data/tactic-widgets/t10-lateral-movement.json'),
  t11: () => import('../../../data/tactic-widgets/t11-collection.json'),
  t12: () => import('../../../data/tactic-widgets/t12-command-and-control.json'),
  t13: () => import('../../../data/tactic-widgets/t13-exfiltration.json'),
  t14: () => import('../../../data/tactic-widgets/t14-impact.json'),
};

export const TACTIC_LABELS = {
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

export const ANIMATION_PRESETS = ['scan', 'query', 'probe', 'flow', 'inject', 'lateral'];

const DEFAULT_STEP_TIMINGS = { alert: 3000, context: 4000, mechanism: 5000, identified: 5500 };
const DEFAULT_SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
];

function createEmptyTemplate(tacticId) {
  const label = TACTIC_LABELS[tacticId] || tacticId;
  const enName = label.match(/\((.+)\)/)?.[1] || tacticId;
  const koName = label.split(' (')[0] || '';
  return {
    tacticId,
    tacticName: enName,
    tacticNameKo: koName,
    dictionaryTitle: `${enName} Dictionary`,
    bgLogo: '/logo/logo-name-dark-nobg.png',
    speedStorageKey: `${tacticId}_widget_speed`,
    glossary: {},
    attackCases: [],
    stepTimings: { ...DEFAULT_STEP_TIMINGS },
    speedOptions: [...DEFAULT_SPEED_OPTIONS],
  };
}

export default function useWidgetFormState(initialTacticId = 't1') {
  const [selectedTactic, setSelectedTactic] = useState(initialTacticId);
  const [widgetData, setWidgetData] = useState(() => createEmptyTemplate(initialTacticId));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // ── 택틱 변경 시 데이터 로드 ──
  useEffect(() => {
    loadTacticData(selectedTactic);
  }, [selectedTactic]);

  const loadTacticData = async (tacticId) => {
    setLoading(true);
    setError(null);
    setSaved(false);

    // 1) Supabase 우선
    try {
      const { data } = await supabase.from('widget_data').select('data').eq('tactic_id', tacticId).single();
      if (data?.data) {
        setWidgetData(data.data);
        setLoading(false);
        return;
      }
    } catch { /* fallback */ }

    // 2) 로컬 JSON fallback
    const loader = LOCAL_DATA_MAP[tacticId];
    if (loader) {
      try {
        const mod = await loader();
        setWidgetData(mod.default || mod);
        setLoading(false);
        return;
      } catch { /* no data */ }
    }

    // 3) 빈 템플릿
    setWidgetData(createEmptyTemplate(tacticId));
    setLoading(false);
  };

  // ── 기본 설정 업데이트 ──
  const updateSettings = useCallback((partial) => {
    setSaved(false);
    setWidgetData(prev => ({ ...prev, ...partial }));
  }, []);

  // ── 용어집 CRUD ──
  const addGlossaryTerm = useCallback((key, termData) => {
    setSaved(false);
    setWidgetData(prev => ({
      ...prev,
      glossary: { ...prev.glossary, [key]: termData },
    }));
  }, []);

  const updateGlossaryTerm = useCallback((key, termData) => {
    setSaved(false);
    setWidgetData(prev => ({
      ...prev,
      glossary: { ...prev.glossary, [key]: termData },
    }));
  }, []);

  const removeGlossaryTerm = useCallback((key) => {
    setSaved(false);
    setWidgetData(prev => {
      const { [key]: _, ...rest } = prev.glossary;
      return { ...prev, glossary: rest };
    });
  }, []);

  const renameGlossaryKey = useCallback((oldKey, newKey) => {
    if (oldKey === newKey) return;
    setSaved(false);
    setWidgetData(prev => {
      const { [oldKey]: termData, ...restGlossary } = prev.glossary;
      const updatedGlossary = { ...restGlossary, [newKey]: termData };
      // attackCases의 targets에서 oldKey를 newKey로 교체
      const updatedCases = prev.attackCases.map(c => ({
        ...c,
        targets: Object.fromEntries(
          Object.entries(c.targets || {}).map(([step, val]) => [step, val === oldKey ? newKey : val])
        ),
      }));
      return { ...prev, glossary: updatedGlossary, attackCases: updatedCases };
    });
  }, []);

  // ── 공격 케이스 CRUD ──
  const addAttackCase = useCallback((caseData) => {
    setSaved(false);
    setWidgetData(prev => {
      const newId = prev.attackCases.length > 0 ? Math.max(...prev.attackCases.map(c => c.id || 0)) + 1 : 1;
      return {
        ...prev,
        attackCases: [...prev.attackCases, { ...caseData, id: newId }],
      };
    });
  }, []);

  const updateAttackCase = useCallback((index, caseData) => {
    setSaved(false);
    setWidgetData(prev => ({
      ...prev,
      attackCases: prev.attackCases.map((c, i) => i === index ? { ...c, ...caseData } : c),
    }));
  }, []);

  const removeAttackCase = useCallback((index) => {
    setSaved(false);
    setWidgetData(prev => ({
      ...prev,
      attackCases: prev.attackCases.filter((_, i) => i !== index),
    }));
  }, []);

  const moveAttackCase = useCallback((fromIndex, toIndex) => {
    setSaved(false);
    setWidgetData(prev => {
      const cases = [...prev.attackCases];
      const [moved] = cases.splice(fromIndex, 1);
      cases.splice(toIndex, 0, moved);
      return { ...prev, attackCases: cases };
    });
  }, []);

  // ── 유효성 검사 ──
  const validate = useCallback(() => {
    const errors = [];
    if (!widgetData.tacticId) errors.push('tacticId 필수');
    if (!widgetData.tacticName) errors.push('tacticName 필수');
    const glossaryKeys = Object.keys(widgetData.glossary || {});
    glossaryKeys.forEach(key => {
      const t = widgetData.glossary[key];
      if (!t.term) errors.push(`용어 [${key}]: term 필수`);
    });
    (widgetData.attackCases || []).forEach((c, i) => {
      if (!c.subTechniqueId) errors.push(`케이스 #${i + 1}: subTechniqueId 필수`);
      if (!c.animationPreset || !ANIMATION_PRESETS.includes(c.animationPreset)) {
        errors.push(`케이스 #${i + 1}: 유효한 animationPreset 필요`);
      }
      ['step1', 'step2', 'step3'].forEach(step => {
        const targetKey = c.targets?.[step];
        if (targetKey && !glossaryKeys.includes(targetKey)) {
          errors.push(`케이스 #${i + 1}: targets.${step} "${targetKey}"가 용어집에 없음`);
        }
      });
    });
    return errors;
  }, [widgetData]);

  // ── Supabase 저장 ──
  const saveToSupabase = useCallback(async () => {
    const errors = validate();
    if (errors.length > 0) {
      setError('유효성 검사 실패:\n' + errors.join('\n'));
      return false;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: dbError } = await supabase.from('widget_data').upsert({
        tactic_id: selectedTactic,
        data: widgetData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'tactic_id' });
      if (dbError) throw dbError;
      logAdminAudit('widget_form_save', selectedTactic);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch (e) {
      setError('저장 실패: ' + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedTactic, widgetData, validate]);

  // ── JSON 직접 편집 모드 지원 ──
  const setFromJson = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      setWidgetData(parsed);
      setError(null);
      setSaved(false);
      return true;
    } catch (e) {
      setError('JSON 구문 오류: ' + e.message);
      return false;
    }
  }, []);

  return {
    selectedTactic,
    setSelectedTactic,
    widgetData,
    setWidgetData,
    loading,
    saving,
    saved,
    error,
    setError,
    updateSettings,
    addGlossaryTerm,
    updateGlossaryTerm,
    removeGlossaryTerm,
    renameGlossaryKey,
    addAttackCase,
    updateAttackCase,
    removeAttackCase,
    moveAttackCase,
    validate,
    saveToSupabase,
    setFromJson,
  };
}

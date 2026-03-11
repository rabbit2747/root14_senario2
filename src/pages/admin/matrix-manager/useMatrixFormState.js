import { useState, useEffect, useCallback } from 'react';
import { supabase, logAdminAudit } from '../../../lib/supabase';

/**
 * 매트릭스 구조 관리 CRUD 상태 훅
 */
export default function useMatrixFormState() {
  const [tactics, setTactics] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [subTechniques, setSubTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ── 초기 로드 ──
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tacRes, techRes, subRes] = await Promise.all([
        supabase.from('matrix_tactics').select('*').order('sort_order'),
        supabase.from('matrix_techniques').select('*').order('sort_order'),
        supabase.from('matrix_sub_techniques').select('*').order('sort_order'),
      ]);
      if (tacRes.error) throw tacRes.error;
      if (techRes.error) throw techRes.error;
      if (subRes.error) throw subRes.error;
      setTactics(tacRes.data || []);
      setTechniques(techRes.data || []);
      setSubTechniques(subRes.data || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 전술 CRUD ──
  const addTactic = useCallback(async (id, title) => {
    setSaving(true);
    try {
      const maxOrder = tactics.reduce((m, t) => Math.max(m, t.sort_order), -1);
      const { error: e } = await supabase.from('matrix_tactics').insert({
        id, title, sort_order: maxOrder + 1, translations: {},
      });
      if (e) throw e;
      logAdminAudit('matrix_tactic_add', id, { title });
      await loadAll();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, [tactics, loadAll]);

  const updateTactic = useCallback(async (id, updates) => {
    setSaving(true);
    try {
      const { error: e } = await supabase.from('matrix_tactics').update(updates).eq('id', id);
      if (e) throw e;
      logAdminAudit('matrix_tactic_update', id, updates);
      setTactics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, []);

  const deleteTactic = useCallback(async (id) => {
    setSaving(true);
    try {
      const { error: e } = await supabase.from('matrix_tactics').delete().eq('id', id);
      if (e) throw e;
      logAdminAudit('matrix_tactic_delete', id);
      await loadAll();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, [loadAll]);

  const moveTactic = useCallback(async (id, direction) => {
    const sorted = [...tactics].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(t => t.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    setSaving(true);
    try {
      const a = sorted[idx], b = sorted[swapIdx];
      await Promise.all([
        supabase.from('matrix_tactics').update({ sort_order: b.sort_order }).eq('id', a.id),
        supabase.from('matrix_tactics').update({ sort_order: a.sort_order }).eq('id', b.id),
      ]);
      logAdminAudit('matrix_tactic_move', id, { direction });
      await loadAll();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, [tactics, loadAll]);

  // ── 기법 CRUD ──
  const addTechnique = useCallback(async (tacticId, tid, name) => {
    setSaving(true);
    try {
      const tacTechs = techniques.filter(t => t.tactic_id === tacticId);
      const maxOrder = tacTechs.reduce((m, t) => Math.max(m, t.sort_order), -1);
      const { error: e } = await supabase.from('matrix_techniques').insert({
        tactic_id: tacticId, tid, name, sort_order: maxOrder + 1,
        is_critical: false, translations: {},
      });
      if (e) throw e;
      logAdminAudit('matrix_technique_add', tid, { tactic_id: tacticId, name });
      await loadAll();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, [techniques, loadAll]);

  const updateTechnique = useCallback(async (tid, updates) => {
    setSaving(true);
    try {
      const { error: e } = await supabase.from('matrix_techniques').update(updates).eq('tid', tid);
      if (e) throw e;
      logAdminAudit('matrix_technique_update', tid, updates);
      setTechniques(prev => prev.map(t => t.tid === tid ? { ...t, ...updates } : t));
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, []);

  const deleteTechnique = useCallback(async (tid) => {
    setSaving(true);
    try {
      const { error: e } = await supabase.from('matrix_techniques').delete().eq('tid', tid);
      if (e) throw e;
      logAdminAudit('matrix_technique_delete', tid);
      await loadAll();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, [loadAll]);

  // ── 서브기법 CRUD ──
  const addSubTechnique = useCallback(async (techniqueTid, sid, name) => {
    setSaving(true);
    try {
      const techSubs = subTechniques.filter(s => s.technique_tid === techniqueTid);
      const maxOrder = techSubs.reduce((m, s) => Math.max(m, s.sort_order), -1);
      const { error: e } = await supabase.from('matrix_sub_techniques').insert({
        technique_tid: techniqueTid, sid, name, sort_order: maxOrder + 1,
      });
      if (e) throw e;
      logAdminAudit('matrix_sub_add', sid, { technique_tid: techniqueTid, name });
      await loadAll();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, [subTechniques, loadAll]);

  const updateSubTechnique = useCallback(async (sid, updates) => {
    setSaving(true);
    try {
      const { error: e } = await supabase.from('matrix_sub_techniques').update(updates).eq('sid', sid);
      if (e) throw e;
      logAdminAudit('matrix_sub_update', sid, updates);
      setSubTechniques(prev => prev.map(s => s.sid === sid ? { ...s, ...updates } : s));
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, []);

  const deleteSubTechnique = useCallback(async (sid) => {
    setSaving(true);
    try {
      const { error: e } = await supabase.from('matrix_sub_techniques').delete().eq('sid', sid);
      if (e) throw e;
      logAdminAudit('matrix_sub_delete', sid);
      await loadAll();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }, [loadAll]);

  return {
    tactics, techniques, subTechniques,
    loading, saving, error, setError,
    loadAll,
    addTactic, updateTactic, deleteTactic, moveTactic,
    addTechnique, updateTechnique, deleteTechnique,
    addSubTechnique, updateSubTechnique, deleteSubTechnique,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase, logAdminAudit } from '../../../lib/supabase';
import eduMetaLocal from '../../../data/edu-meta.json';

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];

const TACTIC_OPTIONS = [
  { id: 't1', label: '정찰' }, { id: 't2', label: '자원 개발' }, { id: 't3', label: '초기 접근' },
  { id: 't4', label: '실행' }, { id: 't5', label: '지속성' }, { id: 't6', label: '권한 상승' },
  { id: 't7', label: '방어 회피' }, { id: 't8', label: '자격 증명' }, { id: 't9', label: '탐색' },
  { id: 't10', label: '측면 이동' }, { id: 't11', label: '수집' }, { id: 't12', label: 'C2' },
  { id: 't13', label: '유출' }, { id: 't14', label: '영향' },
];

function generateSlug(subTechniqueId) {
  return subTechniqueId.toLowerCase().replace(/\./g, '-');
}

function createTemplate(subTechniqueId) {
  const slug = generateSlug(subTechniqueId);
  const techId = subTechniqueId.split('.')[0];
  return {
    url: `/edu/${slug}.html`,
    title: '',
    titleEn: '',
    tacticIds: [],
    techniqueId: techId,
    subTechniqueId,
    chapters: 0,
    chapterTitles: [],
    miniLabs: 0,
    quizzes: 0,
    difficulty: 'beginner',
    estimatedMinutes: 15,
    tags: [],
  };
}

export { DIFFICULTY_OPTIONS, TACTIC_OPTIONS };

export default function useEduFormState() {
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadPages(); }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('edu_meta').select('technique_id, metadata');
      if (data && data.length > 0) {
        const merged = { ...(eduMetaLocal.pages || {}) };
        data.forEach(row => { merged[row.technique_id] = row.metadata; });
        setPages(merged);
      } else {
        setPages(eduMetaLocal.pages || {});
      }
    } catch {
      setPages(eduMetaLocal.pages || {});
    } finally {
      setLoading(false);
    }
  };

  // 새 페이지 추가
  const addPage = useCallback((subTechniqueId) => {
    if (!subTechniqueId.trim()) return;
    const template = createTemplate(subTechniqueId.trim());
    setPages(prev => ({ ...prev, [subTechniqueId]: template }));
    return template;
  }, []);

  // 페이지 메타 업데이트
  const updatePage = useCallback((id, partial) => {
    setPages(prev => ({
      ...prev,
      [id]: { ...prev[id], ...partial },
    }));
  }, []);

  // 챕터 관리
  const addChapter = useCallback((id, title = '') => {
    setPages(prev => {
      const page = prev[id];
      const titles = [...(page.chapterTitles || []), title];
      return { ...prev, [id]: { ...page, chapterTitles: titles, chapters: titles.length } };
    });
  }, []);

  const updateChapter = useCallback((id, index, title) => {
    setPages(prev => {
      const page = prev[id];
      const titles = [...(page.chapterTitles || [])];
      titles[index] = title;
      return { ...prev, [id]: { ...page, chapterTitles: titles } };
    });
  }, []);

  const removeChapter = useCallback((id, index) => {
    setPages(prev => {
      const page = prev[id];
      const titles = (page.chapterTitles || []).filter((_, i) => i !== index);
      return { ...prev, [id]: { ...page, chapterTitles: titles, chapters: titles.length } };
    });
  }, []);

  const moveChapter = useCallback((id, fromIndex, toIndex) => {
    setPages(prev => {
      const page = prev[id];
      const titles = [...(page.chapterTitles || [])];
      const [moved] = titles.splice(fromIndex, 1);
      titles.splice(toIndex, 0, moved);
      return { ...prev, [id]: { ...page, chapterTitles: titles } };
    });
  }, []);

  // 태그 관리
  const addTag = useCallback((id, tag) => {
    setPages(prev => {
      const page = prev[id];
      const tags = [...new Set([...(page.tags || []), tag.trim()])];
      return { ...prev, [id]: { ...page, tags } };
    });
  }, []);

  const removeTag = useCallback((id, tag) => {
    setPages(prev => {
      const page = prev[id];
      return { ...prev, [id]: { ...page, tags: (page.tags || []).filter(t => t !== tag) } };
    });
  }, []);

  // Supabase 저장
  const savePage = useCallback(async (id) => {
    setSaving(true);
    setError(null);
    try {
      const { error: dbError } = await supabase.from('edu_meta').upsert({
        technique_id: id,
        metadata: pages[id],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'technique_id' });
      if (dbError) throw dbError;
      logAdminAudit('edu_meta_save', id);
      return true;
    } catch (e) {
      setError('저장 실패: ' + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [pages]);

  // 삭제
  const deletePage = useCallback(async (id) => {
    try {
      await supabase.from('edu_meta').delete().eq('technique_id', id);
      logAdminAudit('edu_meta_delete', id);
      setPages(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
      return true;
    } catch (e) {
      setError('삭제 실패: ' + e.message);
      return false;
    }
  }, []);

  // 전체 태그 수집 (자동완성용)
  const allTags = [...new Set(Object.values(pages).flatMap(p => p.tags || []))].sort();

  return {
    pages, loading, saving, error, setError,
    addPage, updatePage, savePage, deletePage,
    addChapter, updateChapter, removeChapter, moveChapter,
    addTag, removeTag, allTags,
  };
}

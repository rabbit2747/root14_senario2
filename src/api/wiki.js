import { client } from './_client';

/**
 * 위키 용어 검색
 * @param {Object} opts
 * @param {string} opts.search - 검색어 (term 부분 일치)
 * @param {string|null} opts.techniqueId - 기법 ID 필터 (null이면 전체)
 */
export async function getWikiTerms({ search = '', techniqueId = null } = {}) {
  let q = client.from('wiki_terms').select('*').order('term');

  if (search.trim()) {
    q = q.ilike('term', `%${search.trim()}%`);
  }

  if (techniqueId) {
    // 해당 기법 + 공통 용어(technique_id IS NULL) 함께 조회
    q = q.or(`technique_id.eq.${techniqueId},technique_id.is.null`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/**
 * 단일 용어 조회
 */
export async function getWikiTerm(id) {
  const { data, error } = await client
    .from('wiki_terms')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * 용어 생성 / 수정 (upsert)
 */
export async function upsertWikiTerm(term) {
  const payload = {
    term: term.term,
    definition: term.definition,
    technique_id: term.technique_id || null,
    level: term.level || null,
    source_url: term.source_url || null,
    tags: term.tags || [],
    updated_at: new Date().toISOString(),
  };
  if (term.id) payload.id = term.id;

  const { data, error } = await client
    .from('wiki_terms')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * 용어 삭제
 */
export async function deleteWikiTerm(id) {
  const { error } = await client.from('wiki_terms').delete().eq('id', id);
  if (error) throw error;
}

/**
 * JSON 배열을 일괄 임포트 (관리자 추출 스크립트 결과 import)
 * @param {Array} terms - [{ term, definition, technique_id, level, source_url }]
 */
export async function bulkImportWikiTerms(terms) {
  const payload = terms.map(t => ({
    term: t.term,
    definition: t.definition || '',
    technique_id: t.technique_id || null,
    level: t.level || null,
    source_url: t.source_url || null,
    tags: t.tags || [],
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await client
    .from('wiki_terms')
    .insert(payload)
    .select();
  if (error) throw error;
  return data;
}

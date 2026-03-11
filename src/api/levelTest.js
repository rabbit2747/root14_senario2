/**
 * 레벨 테스트 API 레이어 (Phase 0: Supabase 직접 호출)
 * Phase 1 전환 시: _client.js만 교체하면 자동 전환
 */
import { client } from './_client';

/**
 * 활성화된 문제 목록 조회
 * @param {number} [level] - 특정 레벨만 조회 (생략 시 전체)
 * @returns {Promise<Array>}
 */
export async function getQuestions(level) {
  let query = client
    .from('level_test_questions')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: true });

  if (level) {
    query = query.eq('level', level);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * 문제 생성
 * @param {{ level: number, category: string, question: string, options: Array }} questionData
 */
export async function createQuestion(questionData) {
  const { data, error } = await client
    .from('level_test_questions')
    .insert(questionData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * 문제 수정
 * @param {string} id
 * @param {object} updates
 */
export async function updateQuestion(id, updates) {
  const { data, error } = await client
    .from('level_test_questions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * 문제 비활성화 (soft delete)
 * @param {string} id
 */
export async function deleteQuestion(id) {
  const { error } = await client
    .from('level_test_questions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/**
 * 문제 일괄 등록 (JSON import)
 * @param {Array} questionsArray - [{level, category, question, options}]
 */
export async function importQuestions(questionsArray) {
  const { data, error } = await client
    .from('level_test_questions')
    .insert(questionsArray)
    .select();
  if (error) throw error;
  return data;
}

/**
 * 전체 문제 조회 (관리자용 - 비활성 포함)
 */
export async function getAllQuestions() {
  const { data, error } = await client
    .from('level_test_questions')
    .select('*')
    .order('level', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

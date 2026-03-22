/**
 * 🗺️ MITRE ATT&CK 매트릭스 API
 * Phase 0: Supabase 직접 쿼리
 * Phase 1 이관 우선순위: A (쉬움 — useMatrixData.js 1개 파일)
 *
 * 실패 시 폴백: src/data/matrix-fallback.json (useMatrixData에서 처리)
 */
import { client } from './_client';

export const getTactics = () =>
  client.from('matrix_tactics').select('*').order('sort_order');

export const getTechniques = () =>
  client.from('matrix_techniques').select('*').order('sort_order');

export const getSubTechniques = () =>
  client.from('matrix_sub_techniques').select('*').order('sort_order');

export const updateTactic = (id, updates) =>
  client.from('matrix_tactics').update(updates).eq('id', id);

export const updateTechnique = (id, updates) =>
  client.from('matrix_techniques').update(updates).eq('id', id);

export const upsertTacticTranslation = (payload) =>
  client.from('matrix_tactics').upsert(payload);

export const upsertTechniqueTranslation = (payload) =>
  client.from('matrix_techniques').upsert(payload);

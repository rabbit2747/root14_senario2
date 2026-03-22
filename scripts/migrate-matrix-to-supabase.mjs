/**
 * 1회성 마이그레이션 스크립트
 * matrix-fallback.json → Supabase matrix_* 테이블
 *
 * 실행:
 *   node scripts/migrate-matrix-to-supabase.mjs
 *
 * 환경변수 (.env 또는 직접):
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 *   + SUPABASE_SERVICE_KEY (RLS 우회용, 선택)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── .env 로드 ───
const __dir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dir, '..');
try {
  const envText = readFileSync(join(rootDir, '.env'), 'utf-8');
  envText.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch { /* .env 없으면 환경변수 직접 세팅 */ }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ VITE_SUPABASE_URL / SUPABASE_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── 데이터 로드 ───
const data = JSON.parse(readFileSync(join(rootDir, 'src/data/matrix-fallback.json'), 'utf-8'));
const { attackMatrix, langMapping } = data;

// 번역 빌드: title → { ko, zh, hi, ja }
function buildTitleTranslations(englishTitle) {
  const result = {};
  for (const lang of Object.keys(langMapping)) {
    const val = langMapping[lang].titles[englishTitle];
    if (val) result[lang] = val;
  }
  return result;
}

function buildTechTranslations(englishName) {
  const result = {};
  for (const lang of Object.keys(langMapping)) {
    const val = langMapping[lang].techniques[englishName];
    if (val) result[lang] = val;
  }
  return result;
}

async function migrate() {
  console.log('🚀 매트릭스 데이터 마이그레이션 시작...\n');

  // ── 1) matrix_tactics ───
  const tacticRows = attackMatrix.map((t, idx) => ({
    id: t.id,
    title: t.title,
    sort_order: idx,
    translations: buildTitleTranslations(t.title),
  }));

  console.log(`📋 전술 ${tacticRows.length}개 삽입 중...`);
  const { error: e1 } = await supabase
    .from('matrix_tactics')
    .upsert(tacticRows, { onConflict: 'id' });
  if (e1) { console.error('❌ matrix_tactics 오류:', e1.message); return; }
  console.log('  ✅ matrix_tactics 완료');

  // ── 2) matrix_techniques ───
  const techRows = [];
  attackMatrix.forEach(tactic => {
    tactic.techniques.forEach((tech, idx) => {
      techRows.push({
        tactic_id: tactic.id,
        tid: tech.tid,
        name: tech.name,
        is_critical: tech.isCritical || false,
        sort_order: idx,
        translations: buildTechTranslations(tech.name),
      });
    });
  });

  console.log(`📋 기법 ${techRows.length}개 삽입 중...`);
  // upsert in batches of 50 (Supabase limit)
  for (let i = 0; i < techRows.length; i += 50) {
    const batch = techRows.slice(i, i + 50);
    const { error: e2 } = await supabase
      .from('matrix_techniques')
      .upsert(batch, { onConflict: 'tid' });
    if (e2) { console.error(`❌ matrix_techniques 배치[${i}] 오류:`, e2.message); return; }
  }
  console.log('  ✅ matrix_techniques 완료');

  // ── 3) matrix_sub_techniques ───
  const subRows = [];
  attackMatrix.forEach(tactic => {
    tactic.techniques.forEach(tech => {
      tech.subs.forEach((sub, idx) => {
        subRows.push({
          technique_tid: tech.tid,
          sid: sub.sid,
          name: sub.name,
          sort_order: idx,
        });
      });
    });
  });

  console.log(`📋 서브기법 ${subRows.length}개 삽입 중...`);
  for (let i = 0; i < subRows.length; i += 50) {
    const batch = subRows.slice(i, i + 50);
    const { error: e3 } = await supabase
      .from('matrix_sub_techniques')
      .upsert(batch, { onConflict: 'sid' });
    if (e3) { console.error(`❌ matrix_sub_techniques 배치[${i}] 오류:`, e3.message); return; }
  }
  console.log('  ✅ matrix_sub_techniques 완료');

  // ── 검증 ───
  const { count: cTac } = await supabase.from('matrix_tactics').select('*', { count: 'exact', head: true });
  const { count: cTech } = await supabase.from('matrix_techniques').select('*', { count: 'exact', head: true });
  const { count: cSub } = await supabase.from('matrix_sub_techniques').select('*', { count: 'exact', head: true });

  console.log(`\n🎉 마이그레이션 완료!`);
  console.log(`   전술: ${cTac}, 기법: ${cTech}, 서브기법: ${cSub}`);
}

migrate().catch(err => {
  console.error('❌ 마이그레이션 실패:', err);
  process.exit(1);
});

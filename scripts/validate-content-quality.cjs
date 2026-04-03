#!/usr/bin/env node
/**
 * Gotroot Edu — 콘텐츠 품질 자동 검증 스크립트
 *
 * 사용법:
 *   node scripts/validate-content-quality.cjs                  # 전체 검증
 *   node scripts/validate-content-quality.cjs --type graphic   # 특정 타입만
 *   node scripts/validate-content-quality.cjs --id T1566.001   # 특정 기법만
 *   node scripts/validate-content-quality.cjs --json           # JSON 출력
 *
 * 등급 기준:
 *   A (90+)  — 프로덕션 준비 완료, 다국어 포함
 *   B (60~89) — 기본 구조 완성, 일부 보완 필요
 *   C (0~59) — 골격만 존재, 콘텐츠 작성 필요
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── CLI 인자 ──
const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] || true;
}
const filterType = getFlag('--type');    // edu | graphic | scenario | lab
const filterId = getFlag('--id');        // T1566.001
const jsonOutput = args.includes('--json');

// ── 유틸 ──
function grade(score) {
  if (score >= 90) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

function gradeColor(g) {
  return { A: '\x1b[32m', B: '\x1b[33m', C: '\x1b[31m' }[g] || '';
}

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

const I18N_LANGS = ['ko', 'en', 'vi', 'ar', 'ja', 'zh', 'hi'];

// ══════════════════════════════════════════
// 1. Edu HTML 검증
// ══════════════════════════════════════════
function validateEduHtml() {
  const dir = path.join(ROOT, 'public/edu');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f.startsWith('t'));
  const results = [];

  // 기법별 그룹핑
  const groups = {};
  for (const f of files) {
    // t1566-001-beginner-ch1.html → T1566.001
    const m = f.match(/^t(\d{4})-?(\d{3})?/);
    if (!m) continue;
    const id = m[2] ? `T${m[1]}.${m[2]}` : `T${m[1]}`;
    if (filterId && id !== filterId) continue;
    if (!groups[id]) groups[id] = [];
    groups[id].push(f);
  }

  for (const [id, htmlFiles] of Object.entries(groups)) {
    let score = 0;
    const issues = [];
    const good = [];

    // 챕터 수 (10~15 최적)
    const chapterCount = htmlFiles.length;
    if (chapterCount >= 10) { score += 25; good.push(`${chapterCount} chapters`); }
    else if (chapterCount >= 5) { score += 15; issues.push(`chapters: ${chapterCount}/10 (5+ OK)`); }
    else if (chapterCount >= 1) { score += 5; issues.push(`chapters: ${chapterCount}/10 (too few)`); }
    else { issues.push('no chapters found'); }

    // 파일 크기 (평균 5KB 이상이면 충실)
    const sizes = htmlFiles.map(f => {
      try { return fs.statSync(path.join(dir, f)).size; } catch { return 0; }
    });
    const avgSize = sizes.reduce((a, b) => a + b, 0) / Math.max(sizes.length, 1);
    if (avgSize >= 8000) { score += 20; good.push(`avg ${(avgSize/1024).toFixed(1)}KB`); }
    else if (avgSize >= 3000) { score += 12; issues.push(`avg size: ${(avgSize/1024).toFixed(1)}KB (light)`); }
    else { score += 3; issues.push(`avg size: ${(avgSize/1024).toFixed(1)}KB (skeleton)`); }

    // 필수 속성 확인 (첫 파일 샘플)
    const sample = fs.readFileSync(path.join(dir, htmlFiles[0]), 'utf-8');
    if (sample.includes('data-technique-id')) { score += 10; good.push('data-technique-id'); }
    else issues.push('missing data-technique-id');

    if (sample.includes('data-level')) { score += 5; good.push('data-level'); }
    else issues.push('missing data-level');

    // 공통 스크립트 포함
    if (sample.includes('progress-tracker.js')) { score += 10; good.push('progress-tracker'); }
    else issues.push('missing progress-tracker.js');

    if (sample.includes('breadcrumb.js')) { score += 5; good.push('breadcrumb'); }
    else issues.push('missing breadcrumb.js');

    if (sample.includes('graphic-link.js')) { score += 5; good.push('graphic-link'); }
    else issues.push('missing graphic-link.js (no graphic connection)');

    // CSP 헤더
    if (sample.includes('Content-Security-Policy')) { score += 10; good.push('CSP meta'); }
    else issues.push('missing CSP meta tag');

    // 레벨 분류 확인
    const levels = new Set();
    for (const f of htmlFiles) {
      const lm = f.match(/-(novice|beginner|intermediate|advanced|expert)/);
      if (lm) levels.add(lm[1]);
    }
    if (levels.size >= 3) { score += 10; good.push(`${levels.size} levels`); }
    else if (levels.size >= 1) { score += 5; issues.push(`levels: ${levels.size} (${[...levels].join(',')})`); }
    else issues.push('no level in filenames');

    results.push({
      type: 'edu',
      id,
      score: Math.min(score, 100),
      grade: grade(Math.min(score, 100)),
      files: chapterCount,
      good,
      issues,
    });
  }

  return results;
}

// ══════════════════════════════════════════
// 2. Graphic JSX 검증
// ══════════════════════════════════════════
function validateGraphic() {
  const dir = path.join(ROOT, 'src/data/graphic-contents');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
  const results = [];

  for (const f of files) {
    const id = f.replace('.jsx', '');
    const techId = id.replace(/-(?:novice|beginner|intermediate|advanced|expert)$/, '');
    if (filterId && techId !== filterId) continue;

    let score = 0;
    const issues = [];
    const good = [];
    const content = fs.readFileSync(path.join(dir, f), 'utf-8');
    const size = Buffer.byteLength(content);

    // export: subtitlesData
    if (content.includes('export const subtitlesData') || content.includes('export { subtitlesData')) {
      score += 15;
      good.push('subtitlesData export');
    } else {
      issues.push('missing subtitlesData export');
    }

    // export: renderSlides
    if (content.includes('export function renderSlides') || content.includes('export { renderSlides')) {
      score += 15;
      good.push('renderSlides export');
    } else {
      issues.push('missing renderSlides export');
    }

    // language 파라미터
    if (/renderSlides\s*\(\s*language/.test(content)) {
      score += 10;
      good.push('language param');
    } else {
      issues.push('renderSlides missing language param');
    }

    // 슬라이드 수 (key="s 패턴 카운트)
    const slideMatches = content.match(/key=["']s\d+["']/g);
    const slideCount = slideMatches ? slideMatches.length : 0;
    if (slideCount >= 15) { score += 15; good.push(`${slideCount} slides`); }
    else if (slideCount >= 5) { score += 8; issues.push(`slides: ${slideCount}/15`); }
    else if (slideCount >= 1) { score += 3; issues.push(`slides: ${slideCount}/15 (few)`); }
    else {
      // subtitlesData 배열 길이로 대체 추정
      const subMatches = content.match(/\{\s*ko\s*:/g);
      const estSlides = subMatches ? subMatches.length : 0;
      if (estSlides >= 15) { score += 12; good.push(`~${estSlides} slides (est)`); }
      else if (estSlides >= 5) { score += 6; issues.push(`~${estSlides} slides (est)`); }
      else issues.push('cannot detect slide count');
    }

    // i18n 다국어 지원
    const i18nCount = I18N_LANGS.filter(l => {
      if (l === 'ko' || l === 'en') return content.includes(`${l}:`);
      // vi/ar/ja/zh/hi — null이 아닌 실제 값이 있는지
      const pattern = new RegExp(`${l}\\s*:\\s*['"\`][^'"\`]+['"\`]`);
      return pattern.test(content);
    }).length;
    if (i18nCount >= 5) { score += 15; good.push(`i18n: ${i18nCount}/7 langs`); }
    else if (i18nCount >= 2) { score += 8; issues.push(`i18n: ${i18nCount}/7 langs`); }
    else { score += 3; issues.push(`i18n: ko/en only`); }

    // duration 필드
    if (content.includes('duration')) { score += 5; good.push('duration timing'); }
    else issues.push('missing duration in subtitlesData');

    // 파일 크기 (큰 파일 = 풍부한 콘텐츠)
    if (size >= 20000) { score += 15; good.push(`${(size/1024).toFixed(0)}KB rich`); }
    else if (size >= 5000) { score += 8; issues.push(`size: ${(size/1024).toFixed(0)}KB`); }
    else { score += 2; issues.push(`size: ${(size/1024).toFixed(0)}KB (skeleton)`); }

    // 1280x720 고정해상도
    if (content.includes('1280') && content.includes('720')) { score += 10; good.push('1280x720'); }
    else issues.push('missing 1280x720 resolution');

    results.push({
      type: 'graphic',
      id,
      score: Math.min(score, 100),
      grade: grade(Math.min(score, 100)),
      files: 1,
      good,
      issues,
    });
  }

  return results;
}

// ══════════════════════════════════════════
// 3. Scenario JSX 검증
// ══════════════════════════════════════════
function validateScenario() {
  const dir = path.join(ROOT, 'src/data/scenario-contents');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
  const results = [];

  for (const f of files) {
    const id = f.replace('.jsx', '');
    const techId = id.replace(/-(?:novice|beginner|intermediate|advanced|expert)$/, '');
    if (filterId && techId !== filterId) continue;

    let score = 0;
    const issues = [];
    const good = [];
    const content = fs.readFileSync(path.join(dir, f), 'utf-8');
    const size = Buffer.byteLength(content);

    // default export
    if (content.includes('export default')) { score += 15; good.push('default export'); }
    else issues.push('missing default export');

    // language prop
    if (/language\s*[=}]/.test(content) || /\{\s*language/.test(content)) {
      score += 10;
      good.push('language prop');
    } else {
      issues.push('missing language prop');
    }

    // CHAPTERS 배열
    const chaptersMatch = content.match(/CHAPTERS\s*=\s*\[/);
    if (chaptersMatch) {
      score += 10;
      good.push('CHAPTERS array');
      // Sector 수 추정
      const sectorMatches = content.match(/sector|Sector|SECTOR/gi);
      const sectorCount = sectorMatches ? new Set(sectorMatches.map(s => s.toLowerCase())).size : 0;
      if (sectorCount >= 3) good.push(`${sectorCount}+ sectors`);
    } else {
      issues.push('missing CHAPTERS array');
    }

    // 인터랙티브 요소
    const hasOnClick = /onClick/.test(content);
    const hasState = /useState/.test(content);
    const hasScore = /score|Score|점수/.test(content);
    const interactiveScore = [hasOnClick, hasState, hasScore].filter(Boolean).length;
    if (interactiveScore >= 3) { score += 15; good.push('interactive (click+state+score)'); }
    else if (interactiveScore >= 1) { score += 8; issues.push(`interactive: ${interactiveScore}/3 elements`); }
    else issues.push('no interactive elements detected');

    // i18n
    const i18nCount = I18N_LANGS.filter(l => {
      if (l === 'ko' || l === 'en') return content.includes(`${l}:`);
      const pattern = new RegExp(`${l}\\s*:\\s*['"\`{][^'"\`}]+['"\`}]`);
      return pattern.test(content);
    }).length;
    if (i18nCount >= 5) { score += 15; good.push(`i18n: ${i18nCount}/7 langs`); }
    else if (i18nCount >= 2) { score += 8; issues.push(`i18n: ${i18nCount}/7 langs`); }
    else { score += 3; issues.push('i18n: ko/en only'); }

    // 파일 크기
    if (size >= 30000) { score += 15; good.push(`${(size/1024).toFixed(0)}KB rich`); }
    else if (size >= 8000) { score += 8; issues.push(`size: ${(size/1024).toFixed(0)}KB`); }
    else { score += 2; issues.push(`size: ${(size/1024).toFixed(0)}KB (skeleton)`); }

    // 보고서 모달
    if (content.includes('report') || content.includes('Report') || content.includes('보고서')) {
      score += 10;
      good.push('completion report');
    } else {
      issues.push('missing completion report');
    }

    // lucide-react 아이콘 사용
    if (content.includes('lucide-react')) { score += 10; good.push('lucide icons'); }

    results.push({
      type: 'scenario',
      id,
      score: Math.min(score, 100),
      grade: grade(Math.min(score, 100)),
      files: 1,
      good,
      issues,
    });
  }

  return results;
}

// ══════════════════════════════════════════
// 4. Lab JSON 검증
// ══════════════════════════════════════════
function validateLab() {
  const dir = path.join(ROOT, 'src/data/lab-scenarios');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const results = [];

  for (const f of files) {
    const id = f.replace('.json', '');
    const techId = id.replace(/-(?:novice|beginner|intermediate|advanced|expert)$/, '');
    if (filterId && techId !== filterId) continue;

    let score = 0;
    const issues = [];
    const good = [];

    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    } catch (e) {
      results.push({ type: 'lab', id, score: 0, grade: 'C', files: 1, good: [], issues: [`JSON parse error: ${e.message}`] });
      continue;
    }

    // title (ko + en)
    if (data.title) { score += 5; good.push('title'); }
    else issues.push('missing title');
    if (data.titleEn) { score += 5; good.push('titleEn'); }
    else issues.push('missing titleEn');

    // steps 수 (8~15 최적)
    const stepCount = Array.isArray(data.steps) ? data.steps.length : 0;
    if (stepCount >= 8) { score += 20; good.push(`${stepCount} steps`); }
    else if (stepCount >= 4) { score += 10; issues.push(`steps: ${stepCount}/8`); }
    else if (stepCount >= 1) { score += 3; issues.push(`steps: ${stepCount}/8 (few)`); }
    else issues.push('no steps');

    // phases
    const phaseCount = Array.isArray(data.phases) ? data.phases.length : 0;
    if (phaseCount >= 3) { score += 10; good.push(`${phaseCount} phases`); }
    else if (phaseCount >= 1) { score += 5; issues.push(`phases: ${phaseCount}`); }
    else issues.push('missing phases');

    // step 품질 (샘플 첫 step)
    if (stepCount > 0) {
      const s = data.steps[0];

      // 필수 필드
      if (s.command) { score += 5; good.push('command'); }
      else issues.push('step missing command');

      if (s.output) { score += 5; good.push('output'); }
      else issues.push('step missing output');

      if (s.feynman) { score += 5; good.push('feynman'); }
      else issues.push('step missing feynman explanation');

      if (s.expert) { score += 5; good.push('expert'); }
      else issues.push('step missing expert explanation');

      if (s.desc) { score += 3; }
      if (s.descEn) { score += 3; good.push('descEn'); }
      else issues.push('step missing descEn');
    }

    // 다국어 필드 (vi/ar 번역 여부)
    let i18nFields = 0;
    const checkFields = ['titleVi', 'titleAr', 'titleJa', 'titleZh', 'titleHi'];
    for (const field of checkFields) {
      if (data[field] && data[field].length > 0) i18nFields++;
    }
    if (stepCount > 0 && data.steps[0].descVi && data.steps[0].descVi.length > 0) i18nFields++;
    if (stepCount > 0 && data.steps[0].descAr && data.steps[0].descAr.length > 0) i18nFields++;

    if (i18nFields >= 4) { score += 15; good.push(`i18n: ${i18nFields} fields`); }
    else if (i18nFields >= 1) { score += 7; issues.push(`i18n: ${i18nFields} fields (partial)`); }
    else issues.push('i18n: ko/en only');

    // hackerLog
    if (stepCount > 0 && data.steps[0].hackerLog && data.steps[0].hackerLog.lines) {
      score += 5;
      good.push('hackerLog');
    } else {
      issues.push('missing hackerLog');
    }

    // terms (용어 사전)
    if (stepCount > 0 && Array.isArray(data.steps[0].terms) && data.steps[0].terms.length > 0) {
      score += 5;
      good.push('terms glossary');
    }

    // desktopIcons
    if (Array.isArray(data.desktopIcons) && data.desktopIcons.length > 0) {
      score += 4;
      good.push('desktopIcons');
    }

    // stepDuration
    if (data.stepDuration) { score += 5; good.push(`stepDuration: ${data.stepDuration}s`); }

    results.push({
      type: 'lab',
      id,
      score: Math.min(score, 100),
      grade: grade(Math.min(score, 100)),
      files: 1,
      good,
      issues,
    });
  }

  return results;
}

// ══════════════════════════════════════════
// 실행
// ══════════════════════════════════════════
const allResults = [];

if (!filterType || filterType === 'edu') allResults.push(...validateEduHtml());
if (!filterType || filterType === 'graphic') allResults.push(...validateGraphic());
if (!filterType || filterType === 'scenario') allResults.push(...validateScenario());
if (!filterType || filterType === 'lab') allResults.push(...validateLab());

// JSON 출력
if (jsonOutput) {
  console.log(JSON.stringify(allResults, null, 2));
  process.exit(0);
}

// ── 콘솔 출력 ──
const typeLabels = { edu: '📘 Edu HTML', graphic: '🎬 Graphic', scenario: '🎮 Scenario', lab: '🧪 Lab JSON' };

// 타입별 그룹
const byType = {};
for (const r of allResults) {
  if (!byType[r.type]) byType[r.type] = [];
  byType[r.type].push(r);
}

console.log(`\n${BOLD}🔍 Gotroot Edu — 콘텐츠 품질 검증 리포트${RESET}\n`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

let totalA = 0, totalB = 0, totalC = 0;

for (const type of ['edu', 'graphic', 'scenario', 'lab']) {
  const items = byType[type];
  if (!items || items.length === 0) continue;

  // 정렬: 점수 내림차순
  items.sort((a, b) => b.score - a.score);

  const typeA = items.filter(i => i.grade === 'A').length;
  const typeB = items.filter(i => i.grade === 'B').length;
  const typeC = items.filter(i => i.grade === 'C').length;
  const avgScore = Math.round(items.reduce((s, i) => s + i.score, 0) / items.length);

  totalA += typeA;
  totalB += typeB;
  totalC += typeC;

  console.log(`\n${BOLD}${typeLabels[type]}${RESET}  (${items.length}개 | 평균 ${avgScore}점 | A:${typeA} B:${typeB} C:${typeC})`);
  console.log(`${'─'.repeat(60)}`);

  for (const item of items) {
    const gc = gradeColor(item.grade);
    const bar = '█'.repeat(Math.round(item.score / 5)) + '░'.repeat(20 - Math.round(item.score / 5));
    console.log(`  ${gc}${item.grade}${RESET} ${bar} ${String(item.score).padStart(3)}  ${item.id}`);

    if (item.good.length > 0) {
      console.log(`     ${DIM}✅ ${item.good.join(', ')}${RESET}`);
    }
    if (item.issues.length > 0) {
      console.log(`     ${DIM}⚠️  ${item.issues.join(', ')}${RESET}`);
    }
  }
}

// ── 전체 요약 ──
const total = allResults.length;
const overallAvg = total > 0 ? Math.round(allResults.reduce((s, i) => s + i.score, 0) / total) : 0;

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`${BOLD}📊 전체 요약${RESET}  ${total}개 콘텐츠 | 평균 ${overallAvg}점`);
console.log(`   ${gradeColor('A')}A${RESET}: ${totalA}개 (프로덕션 준비)   ${gradeColor('B')}B${RESET}: ${totalB}개 (보완 필요)   ${gradeColor('C')}C${RESET}: ${totalC}개 (작성 필요)`);

// 개선 권고
const cItems = allResults.filter(i => i.grade === 'C');
if (cItems.length > 0) {
  console.log(`\n${BOLD}💡 우선 개선 대상 (C등급)${RESET}`);
  for (const item of cItems.slice(0, 10)) {
    console.log(`   ${typeLabels[item.type]} ${item.id}: ${item.issues.slice(0, 3).join(', ')}`);
  }
}

console.log('');

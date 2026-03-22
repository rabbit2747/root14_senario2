#!/usr/bin/env node
/**
 * GOTROOT EDU — Education HTML Generator
 *
 * JSON 데이터셋에서 EJS 템플릿을 사용하여 교육 HTML 페이지를 자동 생성합니다.
 *
 * Usage:
 *   node scripts/generate-edu-html.js T1003.001              # 한 기법의 모든 레벨 생성
 *   node scripts/generate-edu-html.js T1003.001 beginner     # 특정 레벨만 생성
 *   node scripts/generate-edu-html.js --all                   # 모든 데이터셋 일괄 생성
 *   node scripts/generate-edu-html.js --dry-run T1003.001    # 미리보기 (파일 저장 안 함)
 */

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// ── Paths ──
const ROOT = path.resolve(__dirname, '..');
const DATASETS_DIR = path.join(ROOT, 'src', 'data', 'edu-datasets');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const OUTPUT_DIR = path.join(ROOT, 'public', 'edu');
const EDU_META_PATH = path.join(ROOT, 'src', 'data', 'edu-meta.json');

// ── Template files ──
const TEMPLATE_MAP = {
  beginner: path.join(TEMPLATES_DIR, 'edu-beginner.html.ejs'),
  intermediate: path.join(TEMPLATES_DIR, 'edu-intermediate.html.ejs'),
  advanced: path.join(TEMPLATES_DIR, 'edu-advanced.html.ejs'),
};

// ── Helpers ──

/**
 * techniqueId를 파일명 형식으로 변환합니다.
 * 예: "T1003.001" -> "t1003-001", "T1078" -> "t1078"
 */
function techniqueIdToSlug(techniqueId) {
  return techniqueId.toLowerCase().replace(/\./g, '-');
}

/**
 * 기법명에서 파일명 slug를 생성합니다.
 * 예: "OS Credential Dumping: LSASS Memory" -> "lsass-memory"
 */
function techniqueNameToSlug(techniqueName) {
  // 콜론 뒤의 서브테크닉 이름만 사용
  let name = techniqueName;
  if (name.includes(':')) {
    name = name.split(':').pop().trim();
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * pageId를 생성합니다.
 * 예: "T1003.001", "OS Credential Dumping: LSASS Memory" -> "t1003-001-lsass-memory"
 */
function generatePageId(techniqueId, techniqueName) {
  const idSlug = techniqueIdToSlug(techniqueId);
  const nameSlug = techniqueNameToSlug(techniqueName);
  return nameSlug ? `${idSlug}-${nameSlug}` : idSlug;
}

/**
 * 레벨에 따른 출력 파일명을 생성합니다.
 * beginner:      t1003-001-lsass-memory.html
 * intermediate:  t1003-001-lsass-memory-intermediate.html
 * advanced:      t1003-001-lsass-memory-advanced.html
 */
function generateFilename(pageId, level) {
  if (level === 'beginner') {
    return `${pageId}.html`;
  }
  return `${pageId}-${level}.html`;
}

/**
 * 데이터셋 JSON 파일을 찾습니다.
 * 파일명 패턴: t1003-001.json 또는 T1003.001.json 등
 */
function findDatasetFile(techniqueId) {
  const slug = techniqueIdToSlug(techniqueId);
  const candidates = [
    path.join(DATASETS_DIR, `${slug}.json`),
    path.join(DATASETS_DIR, `${techniqueId}.json`),
    path.join(DATASETS_DIR, `${techniqueId.toLowerCase()}.json`),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // Glob으로 패턴 검색
  if (fs.existsSync(DATASETS_DIR)) {
    const files = fs.readdirSync(DATASETS_DIR);
    const match = files.find(f => {
      const base = path.basename(f, '.json').toLowerCase().replace(/\./g, '-');
      return base === slug;
    });
    if (match) {
      return path.join(DATASETS_DIR, match);
    }
  }

  return null;
}

/**
 * 모든 데이터셋 파일을 찾습니다.
 */
function findAllDatasets() {
  if (!fs.existsSync(DATASETS_DIR)) {
    console.error(`❌ 데이터셋 디렉토리가 없습니다: ${DATASETS_DIR}`);
    process.exit(1);
  }

  return fs.readdirSync(DATASETS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .map(f => path.join(DATASETS_DIR, f));
}

/**
 * 하나의 레벨에 대해 HTML을 생성합니다.
 */
function generateLevel(dataset, level, options = {}) {
  const { dryRun = false } = options;

  if (!dataset.levels[level]) {
    console.log(`  ⏭  ${level} 레벨 데이터 없음 — 건너뜀`);
    return null;
  }

  const templatePath = TEMPLATE_MAP[level];
  if (!fs.existsSync(templatePath)) {
    console.error(`  ❌ 템플릿 파일을 찾을 수 없습니다: ${templatePath}`);
    return null;
  }

  const levelData = dataset.levels[level];
  const pageId = generatePageId(dataset.techniqueId, dataset.techniqueName);
  const filename = generateFilename(pageId, level);

  // 레벨별 pageId (intermediate/advanced는 접미사 추가)
  const levelPageId = level === 'beginner' ? pageId : `${pageId}-${level}`;

  const meta = {
    techniqueId: dataset.techniqueId,
    techniqueName: dataset.techniqueName,
    tacticIds: dataset.tacticIds,
    tacticName: dataset.tacticName || dataset.tacticIds.join(', '),
    pageId: levelPageId,
    filename: filename,
    level: level,
  };

  // EJS 렌더링
  const templateStr = fs.readFileSync(templatePath, 'utf8');
  let html;
  try {
    html = ejs.render(templateStr, { data: levelData, meta: meta }, {
      filename: templatePath,  // include 해석을 위한 기본 경로
    });
  } catch (err) {
    console.error(`  ❌ EJS 렌더링 실패 (${level}):`, err.message);
    if (err.stack) {
      const lines = err.stack.split('\n').slice(0, 5);
      lines.forEach(l => console.error('     ', l));
    }
    return null;
  }

  // 라인 수 체크
  const lineCount = html.split('\n').length;
  if (lineCount > 3000) {
    console.warn(`  ⚠️  ${filename}: ${lineCount}줄 (3000줄 초과)`);
  }

  // 파일 저장
  const outputPath = path.join(OUTPUT_DIR, filename);
  if (dryRun) {
    console.log(`  🔍 [DRY-RUN] ${filename} — ${lineCount}줄, ${Math.round(html.length / 1024)}KB`);
  } else {
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`  ✅ ${filename} — ${lineCount}줄, ${Math.round(html.length / 1024)}KB`);
  }

  return {
    filename,
    pageId: levelPageId,
    level,
    url: `/edu/${filename}`,
    lineCount,
    chapters: levelData.chapters.length,
    chapterTitles: levelData.chapters.map(ch => ch.title),
    chapterIds: levelData.chapters.map(ch => ch.id),
    estimatedMinutes: levelData.estimatedMinutes,
    miniLabs: (levelData.miniLabs && levelData.miniLabs.length) || 0,
    quizQuestions: levelData.quiz.questions.length,
  };
}

/**
 * edu-meta.json에 생성된 페이지 정보를 업데이트합니다.
 */
function updateEduMeta(dataset, results) {
  let eduMeta = { version: 3, pages: {} };

  if (fs.existsSync(EDU_META_PATH)) {
    try {
      eduMeta = JSON.parse(fs.readFileSync(EDU_META_PATH, 'utf8'));
    } catch (err) {
      console.warn('  ⚠️  edu-meta.json 파싱 실패, 새로 생성합니다.');
    }
  }

  if (!eduMeta.pages) eduMeta.pages = {};

  const key = dataset.techniqueId;
  const pageId = generatePageId(dataset.techniqueId, dataset.techniqueName);
  const nameSlug = techniqueNameToSlug(dataset.techniqueName);

  // 기본 beginner URL
  const beginnerResult = results.find(r => r && r.level === 'beginner');
  const primaryUrl = beginnerResult ? beginnerResult.url : `/edu/${generateFilename(pageId, 'beginner')}`;

  // 기존 데이터 유지하면서 업데이트
  const existing = eduMeta.pages[key] || {};

  const entry = {
    url: primaryUrl,
    title: dataset.techniqueName,
    titleEn: (dataset.levels.beginner && dataset.levels.beginner.titleEn) || dataset.techniqueName,
    tacticIds: dataset.tacticIds,
    techniqueId: dataset.techniqueId.split('.')[0],
    subTechniqueId: dataset.techniqueId,
    chapters: beginnerResult ? beginnerResult.chapters : (existing.chapters || 3),
    chapterTitles: beginnerResult ? beginnerResult.chapterTitles : (existing.chapterTitles || []),
    miniLabs: beginnerResult ? beginnerResult.miniLabs : (existing.miniLabs || 0),
    quizzes: 1,
    difficulty: 'beginner',
    estimatedMinutes: beginnerResult ? beginnerResult.estimatedMinutes : (existing.estimatedMinutes || 20),
    tags: (dataset.metadata && dataset.metadata.tags) || (existing.tags || []),
    levels: {},
  };

  // 레벨 정보 추가
  results.forEach(function(result) {
    if (!result) return;
    entry.levels[result.level] = {
      url: result.url,
      chapters: result.chapters,
      chapterTitles: result.chapterTitles,
      estimatedMinutes: result.estimatedMinutes,
      chapterIds: result.chapterIds,
    };
  });

  eduMeta.pages[key] = entry;

  fs.writeFileSync(EDU_META_PATH, JSON.stringify(eduMeta, null, 2), 'utf8');
  console.log(`  📋 edu-meta.json 업데이트 완료 (${key})`);
}

/**
 * 하나의 기법에 대해 모든 레벨을 생성합니다.
 */
function generateTechnique(techniqueId, targetLevel, options = {}) {
  console.log(`\n🔧 ${techniqueId} 생성 시작...`);

  const datasetPath = findDatasetFile(techniqueId);
  if (!datasetPath) {
    console.error(`❌ 데이터셋 파일을 찾을 수 없습니다: ${techniqueId}`);
    console.error(`   검색 경로: ${DATASETS_DIR}`);
    return false;
  }

  let dataset;
  try {
    dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  } catch (err) {
    console.error(`❌ JSON 파싱 실패: ${datasetPath}`);
    console.error(`   ${err.message}`);
    return false;
  }

  // 기본 유효성 체크
  if (!dataset.techniqueId || !dataset.techniqueName || !dataset.levels) {
    console.error(`❌ 필수 필드 누락: techniqueId, techniqueName, levels`);
    return false;
  }

  const levels = targetLevel ? [targetLevel] : ['beginner', 'intermediate', 'advanced'];
  const results = [];

  for (const level of levels) {
    const result = generateLevel(dataset, level, options);
    results.push(result);
  }

  // edu-meta.json 업데이트 (dry-run이 아닌 경우)
  if (!options.dryRun && results.some(r => r !== null)) {
    updateEduMeta(dataset, results.filter(r => r !== null));
  }

  const successCount = results.filter(r => r !== null).length;
  console.log(`✅ ${techniqueId}: ${successCount}개 HTML 생성 완료\n`);
  return true;
}

// ═══════════════════════════════════════════
// CLI Entry Point
// ═══════════════════════════════════════════
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
╔═══════════════════════════════════════════════════╗
║  GOTROOT EDU — HTML Page Generator                ║
╚═══════════════════════════════════════════════════╝

Usage:
  node scripts/generate-edu-html.js T1003.001              모든 레벨 생성
  node scripts/generate-edu-html.js T1003.001 beginner     특정 레벨만
  node scripts/generate-edu-html.js --all                   모든 데이터셋 일괄 생성
  node scripts/generate-edu-html.js --dry-run T1003.001    미리보기 (파일 미저장)

Options:
  --all        src/data/edu-datasets/ 의 모든 JSON 처리
  --dry-run    파일을 생성하지 않고 결과만 표시
  --help, -h   도움말 표시

Templates:
  templates/edu-beginner.html.ejs       초급 (teal 테마)
  templates/edu-intermediate.html.ejs   중급 (blue 테마)
  templates/edu-advanced.html.ejs       고급 (red 테마)

Dataset Directory:
  src/data/edu-datasets/

Output Directory:
  public/edu/
`);
    process.exit(0);
  }

  // 옵션 파싱
  const dryRun = args.includes('--dry-run');
  const generateAll = args.includes('--all');
  const filteredArgs = args.filter(a => !a.startsWith('--'));

  // 출력 디렉토리 확인
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 템플릿 파일 존재 확인
  for (const [level, templatePath] of Object.entries(TEMPLATE_MAP)) {
    if (!fs.existsSync(templatePath)) {
      console.error(`❌ 템플릿 파일이 없습니다: ${templatePath}`);
      process.exit(1);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('  GOTROOT EDU — HTML Page Generator');
  console.log('═══════════════════════════════════════════');
  if (dryRun) console.log('  🔍 DRY-RUN 모드 (파일 미저장)');

  let successCount = 0;
  let failCount = 0;

  if (generateAll) {
    // 모든 데이터셋 처리
    const datasets = findAllDatasets();
    if (datasets.length === 0) {
      console.error('❌ 데이터셋 파일이 없습니다.');
      process.exit(1);
    }

    console.log(`\n📁 ${datasets.length}개 데이터셋 발견\n`);

    for (const datasetPath of datasets) {
      try {
        const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        const ok = generateTechnique(dataset.techniqueId, null, { dryRun });
        if (ok) successCount++;
        else failCount++;
      } catch (err) {
        console.error(`❌ ${path.basename(datasetPath)}: ${err.message}`);
        failCount++;
      }
    }
  } else {
    // 단일 기법 처리
    const techniqueId = filteredArgs[0];
    const targetLevel = filteredArgs[1] || null;

    if (!techniqueId) {
      console.error('❌ 기법 ID를 지정하세요 (예: T1003.001)');
      process.exit(1);
    }

    // 유효한 레벨 체크
    if (targetLevel && !['beginner', 'intermediate', 'advanced'].includes(targetLevel)) {
      console.error(`❌ 유효하지 않은 레벨: ${targetLevel}`);
      console.error('   유효한 레벨: beginner, intermediate, advanced');
      process.exit(1);
    }

    const ok = generateTechnique(techniqueId, targetLevel, { dryRun });
    if (ok) successCount++;
    else failCount++;
  }

  // 결과 요약
  console.log('═══════════════════════════════════════════');
  console.log(`  결과: ✅ ${successCount}개 성공, ❌ ${failCount}개 실패`);
  console.log('═══════════════════════════════════════════');

  process.exit(failCount > 0 ? 1 : 0);
}

main();

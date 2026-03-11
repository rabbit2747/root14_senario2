#!/usr/bin/env node
/**
 * GOTROOT EDU — Education HTML Validator
 *
 * 생성된 교육 HTML 파일의 필수 요소와 구조를 검증합니다.
 *
 * Usage:
 *   node scripts/validate-edu-html.js t1003-001-lsass-memory.html         # 단일 파일
 *   node scripts/validate-edu-html.js --all                                # 모든 edu HTML
 *   node scripts/validate-edu-html.js --generated                          # 생성된 파일만
 *   node scripts/validate-edu-html.js --technique T1003.001               # 특정 기법 파일
 */

const fs = require('fs');
const path = require('path');

// ── Paths ──
const ROOT = path.resolve(__dirname, '..');
const EDU_DIR = path.join(ROOT, 'public', 'edu');

// ── Validation Rules ──

/**
 * 레벨 감지: data-level 속성 또는 파일명으로 판단
 */
function detectLevel(html, filename) {
  const levelMatch = html.match(/data-level="(beginner|intermediate|advanced)"/);
  if (levelMatch) return levelMatch[1];

  if (filename.includes('-advanced')) return 'advanced';
  if (filename.includes('-intermediate')) return 'intermediate';
  return 'beginner';
}

/**
 * HTML 파일을 검증하고 결과를 반환합니다.
 */
function validateFile(filePath) {
  const filename = path.basename(filePath);
  const html = fs.readFileSync(filePath, 'utf8');
  const lineCount = html.split('\n').length;
  const level = detectLevel(html, filename);

  const errors = [];
  const warnings = [];
  const info = [];

  info.push(`파일: ${filename}`);
  info.push(`레벨: ${level}`);
  info.push(`줄 수: ${lineCount}`);
  info.push(`크기: ${Math.round(html.length / 1024)}KB`);

  // ═══════════════════════════════════════════
  // 1. 필수 구조 요소 검사
  // ═══════════════════════════════════════════

  // 1.1 Auth Gate
  if (!html.includes('sb-bnwbybawqrnhznirivfg-auth-token')) {
    errors.push('[AUTH] 인증 게이트(auth gate)가 없습니다 — Supabase 세션 체크 필수');
  } else {
    // localStorage 또는 sessionStorage 사용 확인
    if (html.includes('localStorage.getItem') || html.includes('sessionStorage.getItem')) {
      info.push('[AUTH] 인증 게이트 확인 완료');
    }
  }

  // 1.2 data-technique-id
  const techIdMatch = html.match(/data-technique-id="([^"]+)"/);
  if (!techIdMatch) {
    errors.push('[TECH-ID] data-technique-id 속성이 없습니다');
  } else {
    const techId = techIdMatch[1];
    if (!/^T\d{4}(\.\d{3})?$/.test(techId)) {
      warnings.push(`[TECH-ID] 형식이 올바르지 않습니다: "${techId}" (예: T1003.001)`);
    } else {
      info.push(`[TECH-ID] ${techId}`);
    }
  }

  // 1.3 Dynamic Content Loader
  if (!html.includes('edu_html_content') || !html.includes('_eduDynLoaded')) {
    warnings.push('[DYN-LOADER] 동적 콘텐츠 로더가 없거나 불완전합니다');
  }

  // 1.4 edu-ready CSS 가드
  if (!html.includes('edu-ready')) {
    warnings.push('[CSS-GUARD] edu-ready 클래스 가드가 없습니다 (깜빡임 방지)');
  }

  // 1.5 CSP 헤더
  if (!html.includes('Content-Security-Policy')) {
    warnings.push('[CSP] Content-Security-Policy 메타 태그가 없습니다');
  }

  // 1.6 Tailwind CSS
  if (!html.includes('cdn.tailwindcss.com')) {
    errors.push('[TAILWIND] Tailwind CSS CDN이 포함되지 않았습니다');
  }

  // 1.7 Font 로드
  if (!html.includes('fonts.googleapis.com')) {
    warnings.push('[FONT] Google Fonts 링크가 없습니다');
  }

  // ═══════════════════════════════════════════
  // 2. 콘텐츠 구조 검사
  // ═══════════════════════════════════════════

  // 2.1 section-observe 섹션 수
  const sectionMatches = html.match(/class="[^"]*section-observe[^"]*"/g);
  const sectionCount = sectionMatches ? sectionMatches.length : 0;

  if (sectionCount === 0) {
    errors.push('[SECTIONS] section-observe 클래스가 포함된 섹션이 없습니다');
  } else {
    info.push(`[SECTIONS] ${sectionCount}개 섹션 발견`);
  }

  // 2.2 최소 챕터 수 검사 (레벨별)
  // 챕터 섹션 수 (quiz/minilab 제외)
  const chapterSections = html.match(/id="ch\d+"/g);
  const chapterCount = chapterSections ? chapterSections.length : 0;

  const minChapters = {
    beginner: 3,
    intermediate: 5,
    advanced: 5,
  };

  if (chapterCount < minChapters[level]) {
    warnings.push(`[CHAPTERS] 챕터 수 부족: ${chapterCount}개 (${level} 최소 ${minChapters[level]}개 권장)`);
  } else {
    info.push(`[CHAPTERS] ${chapterCount}개 챕터`);
  }

  // 2.3 퀴즈 검사
  const quizQuestions = html.match(/class="quiz-q"/g);
  const quizCount = quizQuestions ? quizQuestions.length : 0;

  if (quizCount === 0) {
    errors.push('[QUIZ] 퀴즈 문제가 없습니다');
  } else if (quizCount < 3) {
    warnings.push(`[QUIZ] 퀴즈 문제가 ${quizCount}개로 부족합니다 (최소 3개 권장)`);
  } else {
    info.push(`[QUIZ] ${quizCount}개 퀴즈 문제`);
  }

  // 2.4 data-correct 속성 검사 (퀴즈 정답)
  const dataCorrectMatches = html.match(/data-correct="\d+"/g);
  if (quizCount > 0 && (!dataCorrectMatches || dataCorrectMatches.length !== quizCount)) {
    warnings.push(`[QUIZ] 일부 퀴즈 문제에 data-correct 속성이 없습니다`);
  }

  // 2.5 gradeFinalQuiz 함수
  if (quizCount > 0 && !html.includes('gradeFinalQuiz')) {
    errors.push('[QUIZ] gradeFinalQuiz() 함수가 없습니다');
  }

  // ═══════════════════════════════════════════
  // 3. 레벨별 검사
  // ═══════════════════════════════════════════

  // 3.1 중급/고급: POC 코드 패널 존재 확인
  if (level === 'intermediate' || level === 'advanced') {
    const hasTerminalBg = html.includes('terminal-bg');
    const hasCodeWarning = html.includes('교육 목적 코드');

    if (!hasTerminalBg) {
      warnings.push(`[CODE] ${level} 레벨에 코드 패널(terminal-bg)이 없습니다`);
    }

    if (!hasCodeWarning) {
      warnings.push(`[CODE] "교육 목적 코드" 경고 문구가 없습니다`);
    }
  }

  // 3.2 고급: 경고 배너 확인
  if (level === 'advanced') {
    if (!html.includes('허가된') && !html.includes('테스트 환경')) {
      warnings.push('[ADVANCED] 고급 경고 배너("허가된 테스트 환경")가 없습니다');
    }
  }

  // ═══════════════════════════════════════════
  // 4. UI 요소 검사
  // ═══════════════════════════════════════════

  // 4.1 사이드바 네비게이션
  if (!html.includes('sidebar-nav')) {
    errors.push('[NAV] 사이드바 네비게이션(#sidebar-nav)이 없습니다');
  }

  // 4.2 메인 스크롤 영역
  if (!html.includes('main-scroll')) {
    errors.push('[MAIN] 메인 스크롤 영역(#main-scroll)이 없습니다');
  }

  // 4.3 테마 토글
  if (!html.includes('toggleTheme')) {
    warnings.push('[THEME] 테마 토글 기능(toggleTheme)이 없습니다');
  }

  // 4.4 IntersectionObserver
  if (!html.includes('IntersectionObserver')) {
    warnings.push('[OBSERVER] IntersectionObserver가 없습니다 (fade-in 애니메이션)');
  }

  // 4.5 go() 네비게이션 함수
  if (!html.includes('function go(')) {
    warnings.push('[NAV-FN] go() 네비게이션 함수가 없습니다');
  }

  // 4.6 GOTROOT 브랜드 헤더
  if (!html.includes('GOTROOT')) {
    warnings.push('[BRAND] GOTROOT 브랜드 헤더가 없습니다');
  }

  // 4.7 매트릭스 대시보드 링크
  if (!html.includes('매트릭스 대시보드') && !html.includes('대시보드로 돌아가기')) {
    warnings.push('[NAV] 매트릭스 대시보드 링크가 없습니다');
  }

  // ═══════════════════════════════════════════
  // 5. 스크립트 참조 검사
  // ═══════════════════════════════════════════

  // 5.1 breadcrumb.js
  if (!html.includes('breadcrumb.js')) {
    warnings.push('[SCRIPT] breadcrumb.js 참조가 없습니다');
  }

  // 5.2 progress-tracker.js
  if (!html.includes('progress-tracker.js')) {
    warnings.push('[SCRIPT] progress-tracker.js 참조가 없습니다');
  }

  // 5.3 lab-link.js
  if (!html.includes('lab-link.js')) {
    warnings.push('[SCRIPT] lab-link.js 참조가 없습니다');
  }

  // ═══════════════════════════════════════════
  // 6. 크기/성능 검사
  // ═══════════════════════════════════════════

  // 6.1 줄 수 제한
  if (lineCount > 3000) {
    warnings.push(`[SIZE] ${lineCount}줄 — 3000줄 제한 초과`);
  }

  // 6.2 파일 크기
  const fileSizeKB = Math.round(html.length / 1024);
  if (fileSizeKB > 500) {
    warnings.push(`[SIZE] ${fileSizeKB}KB — 대용량 파일`);
  }

  // ═══════════════════════════════════════════
  // 7. 학습 완료 CTA 검사
  // ═══════════════════════════════════════════
  if (!html.includes('학습 완료')) {
    warnings.push('[CTA] 학습 완료 CTA 섹션이 없습니다');
  }

  return {
    filename,
    level,
    lineCount,
    sizeKB: fileSizeKB,
    errors,
    warnings,
    info,
    isValid: errors.length === 0,
  };
}

/**
 * 결과를 포맷하여 출력합니다.
 */
function printResult(result) {
  const status = result.isValid ? '✅ PASS' : '❌ FAIL';
  const levelEmoji = { beginner: '🟢', intermediate: '🔵', advanced: '🔴' };

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${status}  ${result.filename}`);
  console.log(`${levelEmoji[result.level] || '⚪'} ${result.level} | ${result.lineCount}줄 | ${result.sizeKB}KB`);
  console.log(`${'─'.repeat(60)}`);

  if (result.errors.length > 0) {
    console.log('\n  ❌ 오류:');
    result.errors.forEach(e => console.log(`     ${e}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n  ⚠️  경고:');
    result.warnings.forEach(w => console.log(`     ${w}`));
  }

  if (result.info.length > 0 && (result.errors.length > 0 || result.warnings.length > 0)) {
    console.log('\n  ℹ️  정보:');
    result.info.forEach(i => console.log(`     ${i}`));
  }
}

/**
 * 요약 리포트를 출력합니다.
 */
function printSummary(results) {
  const pass = results.filter(r => r.isValid).length;
  const fail = results.filter(r => !r.isValid).length;
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  검증 결과 요약`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  전체: ${results.length}개 파일`);
  console.log(`  ✅ 통과: ${pass}개`);
  console.log(`  ❌ 실패: ${fail}개`);
  console.log(`  ⚠️  경고: ${totalWarnings}개`);
  console.log(`  ❌ 오류: ${totalErrors}개`);
  console.log(`${'═'.repeat(60)}`);

  if (fail > 0) {
    console.log('\n  실패한 파일:');
    results.filter(r => !r.isValid).forEach(r => {
      console.log(`    ❌ ${r.filename}`);
      r.errors.forEach(e => console.log(`       ${e}`));
    });
  }
}

// ═══════════════════════════════════════════
// CLI Entry Point
// ═══════════════════════════════════════════
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
╔═══════════════════════════════════════════════════╗
║  GOTROOT EDU — HTML Validator                     ║
╚═══════════════════════════════════════════════════╝

Usage:
  node scripts/validate-edu-html.js <filename>               단일 파일 검증
  node scripts/validate-edu-html.js --all                     모든 HTML 검증
  node scripts/validate-edu-html.js --generated               생성된 파일만 검증
  node scripts/validate-edu-html.js --technique T1003.001    특정 기법 파일 검증

Options:
  --all          public/edu/ 의 모든 HTML 파일 검증
  --generated    EJS로 생성된 파일만 검증 (data-technique-id 포함)
  --technique    특정 기법 ID의 파일만 검증
  --quiet        요약만 표시
  --help, -h     도움말

Checks:
  - 인증 게이트 (auth gate) 존재
  - data-technique-id 속성
  - 동적 콘텐츠 로더
  - CSP 메타 태그
  - Tailwind CSS CDN
  - 최소 챕터 수 (beginner: 3, intermediate/advanced: 5)
  - 퀴즈 문제 수 (최소 3개)
  - POC 코드 패널 (intermediate/advanced)
  - 사이드바, 테마 토글, IntersectionObserver
  - breadcrumb.js, progress-tracker.js, lab-link.js 참조
  - 줄 수 제한 (3000줄)
`);
    process.exit(0);
  }

  const quiet = args.includes('--quiet');
  const validateAll = args.includes('--all');
  const validateGenerated = args.includes('--generated');
  const techniqueFlag = args.includes('--technique');
  const techniqueArg = techniqueFlag ? args[args.indexOf('--technique') + 1] : null;
  const filteredArgs = args.filter(a => !a.startsWith('--') && a !== techniqueArg);

  let filesToValidate = [];

  if (validateAll || validateGenerated) {
    // 모든 HTML 파일
    if (!fs.existsSync(EDU_DIR)) {
      console.error(`❌ 교육 디렉토리가 없습니다: ${EDU_DIR}`);
      process.exit(1);
    }

    filesToValidate = fs.readdirSync(EDU_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(EDU_DIR, f));

    if (validateGenerated) {
      // data-technique-id가 포함된 파일만
      filesToValidate = filesToValidate.filter(f => {
        const content = fs.readFileSync(f, 'utf8');
        return content.includes('data-technique-id=');
      });
    }
  } else if (techniqueArg) {
    // 특정 기법
    const slug = techniqueArg.toLowerCase().replace(/\./g, '-');
    const allFiles = fs.readdirSync(EDU_DIR).filter(f => f.endsWith('.html'));
    filesToValidate = allFiles
      .filter(f => f.startsWith(slug))
      .map(f => path.join(EDU_DIR, f));

    if (filesToValidate.length === 0) {
      console.error(`❌ ${techniqueArg}에 해당하는 파일을 찾을 수 없습니다.`);
      process.exit(1);
    }
  } else {
    // 단일 파일
    const filename = filteredArgs[0];
    if (!filename) {
      console.error('❌ 파일명을 지정하세요.');
      process.exit(1);
    }

    let filePath = path.isAbsolute(filename) ? filename : path.join(EDU_DIR, filename);
    if (!fs.existsSync(filePath)) {
      // 확장자 없이 입력한 경우
      if (!filename.endsWith('.html')) {
        filePath = path.join(EDU_DIR, filename + '.html');
      }
    }

    if (!fs.existsSync(filePath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
      process.exit(1);
    }

    filesToValidate = [filePath];
  }

  if (filesToValidate.length === 0) {
    console.error('❌ 검증할 파일이 없습니다.');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════');
  console.log('  GOTROOT EDU — HTML Validator');
  console.log('═══════════════════════════════════════════');
  console.log(`  검증 대상: ${filesToValidate.length}개 파일\n`);

  const results = [];

  for (const filePath of filesToValidate) {
    try {
      const result = validateFile(filePath);
      results.push(result);

      if (!quiet) {
        printResult(result);
      }
    } catch (err) {
      console.error(`❌ ${path.basename(filePath)}: ${err.message}`);
      results.push({
        filename: path.basename(filePath),
        level: 'unknown',
        lineCount: 0,
        sizeKB: 0,
        errors: [`파일 읽기 실패: ${err.message}`],
        warnings: [],
        info: [],
        isValid: false,
      });
    }
  }

  printSummary(results);

  const failCount = results.filter(r => !r.isValid).length;
  process.exit(failCount > 0 ? 1 : 0);
}

main();

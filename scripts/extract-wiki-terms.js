#!/usr/bin/env node
/**
 * 갓루트 위키 자동 추출 스크립트
 *
 * 사용법: node scripts/extract-wiki-terms.js
 * 결과:  wiki-terms-extracted.json (관리자 패널에서 일괄 임포트)
 *
 * 추출 방식:
 *   - public/edu/*.html 파일 파싱
 *   - <body data-technique-id="..." data-level="..."> 읽기
 *   - h2, h3 태그 = term (용어)
 *   - 해당 heading 바로 다음 첫 번째 <p> = definition (설명)
 *   - 중복 term 발생 시 가장 긴 definition 채택
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EDU_DIR = join(__dirname, '..', 'public', 'edu');
const OUTPUT_FILE = join(__dirname, '..', 'wiki-terms-extracted.json');

// 간단한 HTML 파서 (DOMParser 없이 정규식 사용)
function extractTechniqueAndLevel(html) {
  const techniqueMatch = html.match(/data-technique-id=["']([^"']+)["']/);
  const levelMatch = html.match(/data-level=["']([^"']+)["']/);
  return {
    techniqueId: techniqueMatch ? techniqueMatch[1] : null,
    level: levelMatch ? levelMatch[1] : null,
  };
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')    // 태그 제거
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTermsFromHtml(html, filePath) {
  const { techniqueId, level } = extractTechniqueAndLevel(html);

  const terms = [];
  // h2/h3 뒤의 첫 번째 p 추출
  const headingParagraphRe = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;

  let match;
  while ((match = headingParagraphRe.exec(html)) !== null) {
    const term = stripHtml(match[2]);
    const definition = stripHtml(match[3]);

    // 너무 짧거나 코드처럼 보이는 건 스킵
    if (!term || term.length < 2 || term.length > 100) continue;
    if (!definition || definition.length < 10) continue;
    // 숫자로만 이루어진 제목 스킵
    if (/^\d+[\.\d]*$/.test(term)) continue;

    const relPath = filePath.split('/public/')[1] || filePath;
    terms.push({
      term,
      definition: definition.slice(0, 500), // 최대 500자
      technique_id: techniqueId,
      level,
      source_url: '/' + relPath,
      tags: [],
    });
  }

  return terms;
}

// 중복 제거 (같은 term → 가장 긴 definition 채택)
function deduplicateTerms(terms) {
  const map = new Map();
  for (const t of terms) {
    const key = t.term.toLowerCase();
    if (!map.has(key) || t.definition.length > map.get(key).definition.length) {
      map.set(key, t);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.term.localeCompare(b.term, 'ko'));
}

// 메인
let allTerms = [];
let fileCount = 0;

try {
  const files = readdirSync(EDU_DIR).filter(f => f.endsWith('.html'));
  fileCount = files.length;

  for (const file of files) {
    const filePath = join(EDU_DIR, file);
    const html = readFileSync(filePath, 'utf-8');
    const terms = extractTermsFromHtml(html, filePath);
    allTerms.push(...terms);
  }

  const deduped = deduplicateTerms(allTerms);

  writeFileSync(OUTPUT_FILE, JSON.stringify(deduped, null, 2), 'utf-8');

  console.log(`✓ 완료`);
  console.log(`  파일 수: ${fileCount}개`);
  console.log(`  추출 용어 (중복 포함): ${allTerms.length}개`);
  console.log(`  최종 용어 (중복 제거): ${deduped.length}개`);
  console.log(`  출력: wiki-terms-extracted.json`);
  console.log(``);
  console.log(`다음 단계: 관리자 패널 → 위키 탭 → JSON 임포트`);
} catch (e) {
  console.error('오류:', e.message);
  process.exit(1);
}

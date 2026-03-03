/**
 * edu-meta.json 자동 업데이트 스크립트
 * public/edu/*.html 파일을 스캔하여 누락된 항목을 edu-meta.json에 추가
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EDU_DIR = path.join(ROOT, 'public', 'edu');
const META_PATH = path.join(ROOT, 'src', 'data', 'edu-meta.json');
const MATRIX_PATH = path.join(ROOT, 'src', 'data', 'matrix-fallback.json');

// ── 1. 매트릭스 매핑 빌드 ──
const mf = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
const am = mf.attackMatrix;
const techMap = {}; // sid/tid → { name, parentName, parentTid, tacticIds }

for (var i = 0; i < am.length; i++) {
  var tactic = am[i];
  for (var j = 0; j < tactic.techniques.length; j++) {
    var tech = tactic.techniques[j];
    if (tech.subs && tech.subs.length > 0) {
      for (var k = 0; k < tech.subs.length; k++) {
        var sub = tech.subs[k];
        if (techMap[sub.sid]) {
          techMap[sub.sid].tacticIds.push(tactic.id);
        } else {
          techMap[sub.sid] = { name: sub.name, parentName: tech.name, parentTid: tech.tid, tacticIds: [tactic.id] };
        }
      }
    } else {
      if (techMap[tech.tid]) {
        techMap[tech.tid].tacticIds.push(tactic.id);
      } else {
        techMap[tech.tid] = { name: tech.name, parentName: null, parentTid: tech.tid, tacticIds: [tactic.id] };
      }
    }
  }
}

// ── 2. 한국어 제목 매핑 ──
const koTech = mf.langMapping.ko.techniques;

// ── 3. HTML 파일 스캔 ──
const htmlFiles = fs.readdirSync(EDU_DIR).filter(f => f.endsWith('.html'));

function parseFilename(fname) {
  // t1078-002-domain-accounts.html => { id: 'T1078.002', url, kebab }
  const m1 = fname.match(/^t(\d{4})-(\d{3})-(.+)\.html$/);
  if (m1) {
    return {
      id: 'T' + m1[1] + '.' + m1[2],
      tid: 'T' + m1[1],
      sub: m1[2],
      url: '/edu/' + fname,
      kebab: m1[3]
    };
  }
  // t1046-network-service-discovery.html => { id: 'T1046', url, kebab }
  const m2 = fname.match(/^t(\d{4})-([a-z].+)\.html$/);
  if (m2) {
    return {
      id: 'T' + m2[1],
      tid: 'T' + m2[1],
      sub: null,
      url: '/edu/' + fname,
      kebab: m2[2]
    };
  }
  return null;
}

// ── 4. 현재 edu-meta.json 읽기 ──
const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
const existing = Object.keys(meta.pages);
console.log('기존 entries:', existing.length);

// ── 5. 누락 항목 추가 ──
let added = 0;
let skipped = 0;

for (const fname of htmlFiles) {
  const parsed = parseFilename(fname);
  if (!parsed) {
    console.log('  SKIP (parse fail):', fname);
    skipped++;
    continue;
  }

  // 이미 있으면 스킵
  if (meta.pages[parsed.id]) continue;

  // 매트릭스 매핑 찾기
  const info = techMap[parsed.id];
  if (!info) {
    console.log('  WARN (no matrix mapping):', parsed.id, fname);
    // 매핑 없어도 최소 정보로 추가
    meta.pages[parsed.id] = {
      url: parsed.url,
      title: parsed.kebab.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' 심층 분석',
      titleEn: parsed.kebab.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Deep Dive',
      tacticIds: [],
      techniqueId: parsed.tid,
      subTechniqueId: parsed.sub ? parsed.id : null,
      chapters: 3,
      chapterTitles: ['개념과 원리', '공격 기법 분석', '탐지 및 방어'],
      miniLabs: 1,
      quizzes: 1,
      difficulty: 'intermediate',
      estimatedMinutes: 25,
      tags: [],
      levels: {
        beginner: { url: parsed.url, chapters: 3, chapterTitles: ['개념과 원리'], estimatedMinutes: 15, chapterIds: ['b-ch1','b-ch2','b-ch3'] },
        intermediate: { url: null, chapters: 3, chapterTitles: ['공격 시뮬레이션'], estimatedMinutes: 25, chapterIds: ['i-ch1','i-ch2','i-ch3'] },
        advanced: { url: null, chapters: 3, chapterTitles: ['실전 대응'], estimatedMinutes: 40, chapterIds: ['a-ch1','a-ch2','a-ch3'] }
      }
    };
    added++;
    continue;
  }

  // 난이도 결정
  var diff = 'intermediate';
  if (['t1','t9'].includes(info.tacticIds[0])) diff = 'beginner';
  if (['t6','t7','t14'].includes(info.tacticIds[0])) diff = 'advanced';

  // 한국어 제목
  var koParent = info.parentName ? (koTech[info.parentName] || info.parentName) : '';
  var koTitle = info.name + (koParent ? ' (' + koParent + ')' : '') + ' 심층 분석';
  var enTitle = info.name + ' Deep Dive';

  // 태그 생성
  var tags = [];
  if (info.parentName) tags.push(info.parentName);
  tags.push(info.name);
  // 택틱별 추가 태그
  var tacticTags = {
    t1: ['OSINT', 'Reconnaissance'],
    t2: ['Infrastructure', 'Resource Development'],
    t3: ['Initial Access', 'Phishing'],
    t4: ['Execution', 'Scripting'],
    t5: ['Persistence', 'Autostart'],
    t6: ['Privilege Escalation', 'Token'],
    t7: ['Defense Evasion', 'Obfuscation'],
    t8: ['Credential Access', 'Dumping'],
    t9: ['Discovery', 'Enumeration'],
    t10: ['Lateral Movement', 'Remote'],
    t11: ['Collection', 'Data'],
    t12: ['C2', 'Protocol'],
    t13: ['Exfiltration', 'Data Theft'],
    t14: ['Impact', 'Destruction']
  };
  var extraTags = tacticTags[info.tacticIds[0]] || [];
  for (var t = 0; t < extraTags.length; t++) {
    if (tags.indexOf(extraTags[t]) === -1) tags.push(extraTags[t]);
  }

  meta.pages[parsed.id] = {
    url: parsed.url,
    title: koTitle,
    titleEn: enTitle,
    tacticIds: info.tacticIds,
    techniqueId: info.parentTid,
    subTechniqueId: parsed.sub ? parsed.id : null,
    chapters: 3,
    chapterTitles: ['개념과 원리', '공격 기법 분석', '탐지 및 방어'],
    miniLabs: 1,
    quizzes: 1,
    difficulty: diff,
    estimatedMinutes: diff === 'beginner' ? 20 : diff === 'intermediate' ? 25 : 30,
    tags: tags,
    levels: {
      beginner: {
        url: parsed.url,
        chapters: 3,
        chapterTitles: ['개념과 원리'],
        estimatedMinutes: 15,
        chapterIds: ['b-ch1', 'b-ch2', 'b-ch3']
      },
      intermediate: {
        url: null,
        chapters: 3,
        chapterTitles: [info.parentName ? info.parentName + ' 공격 시뮬레이션' : '공격 시뮬레이션'],
        estimatedMinutes: 25,
        chapterIds: ['i-ch1', 'i-ch2', 'i-ch3']
      },
      advanced: {
        url: null,
        chapters: 3,
        chapterTitles: ['실전 대응 및 종합 평가'],
        estimatedMinutes: 40,
        chapterIds: ['a-ch1', 'a-ch2', 'a-ch3']
      }
    }
  };
  added++;
}

// ── 6. 저장 ──
fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), 'utf8');

console.log('\n=== 결과 ===');
console.log('추가:', added);
console.log('스킵:', skipped);
console.log('총 entries:', Object.keys(meta.pages).length);
console.log('완료!');

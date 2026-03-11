const fs = require('fs');
const path = require('path');

const matrix = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/matrix-fallback.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/edu-meta.json'), 'utf8'));
const pages = meta.pages || {};

// 1. Parent techniques with subs but no own edu page
console.log('=== 부모 기법 (서브기법 있으나 자체 edu 페이지 없음) ===');
const parentMissing = [];
matrix.attackMatrix.forEach(t => {
  t.techniques.forEach(tech => {
    if (tech.subs && tech.subs.length > 0 && !pages[tech.tid]) {
      const subsWithEdu = tech.subs.filter(s => !!pages[s.sid]);
      parentMissing.push({ tactic: t.title, tid: tech.tid, name: tech.name, subsWithEdu: subsWithEdu.length, totalSubs: tech.subs.length });
    }
  });
});
console.log('개수: ' + parentMissing.length);
parentMissing.forEach(m => {
  console.log('  ' + m.tid + ' ' + m.name + ' [' + m.tactic + '] edu subs: ' + m.subsWithEdu + '/' + m.totalSubs);
});

// 2. Sub-techniques missing from edu-meta
console.log('\n=== 누락된 서브기법 (edu-meta에 없음) ===');
let missingSubs = 0;
matrix.attackMatrix.forEach(t => {
  t.techniques.forEach(tech => {
    if (tech.subs) {
      tech.subs.forEach(sub => {
        if (!pages[sub.sid]) {
          console.log('  ' + sub.sid + ' ' + sub.name + ' [' + t.title + ']');
          missingSubs++;
        }
      });
    }
  });
});
console.log('누락 서브기법 수: ' + missingSubs);

// 3. Standalone techniques missing
console.log('\n=== 독립 기법 (서브기법 없는 기법 중 edu 없음) ===');
let missingStandalone = 0;
matrix.attackMatrix.forEach(t => {
  t.techniques.forEach(tech => {
    if ((!tech.subs || tech.subs.length === 0) && !pages[tech.tid]) {
      console.log('  ' + tech.tid + ' ' + tech.name + ' [' + t.title + ']');
      missingStandalone++;
    }
  });
});
console.log('누락 독립기법 수: ' + missingStandalone);

// 4. Check HTML files exist for all edu-meta entries
console.log('\n=== edu-meta에 있지만 HTML 없는 항목 ===');
const eduDir = path.join(__dirname, '../public/edu');
let missingHtml = 0;
Object.entries(pages).forEach(([key, val]) => {
  const htmlPath = path.join(eduDir, path.basename(val.url));
  if (!fs.existsSync(htmlPath)) {
    console.log('  ' + key + ' -> ' + val.url + ' (파일 없음)');
    missingHtml++;
  }
});
console.log('HTML 없는 항목 수: ' + missingHtml);

console.log('\n=== 요약 ===');
console.log('부모 기법 자체 페이지 없음: ' + parentMissing.length);
console.log('서브기법 누락: ' + missingSubs);
console.log('독립기법 누락: ' + missingStandalone);
console.log('HTML 파일 누락: ' + missingHtml);

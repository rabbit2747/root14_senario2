#!/usr/bin/env node
/**
 * Gotroot Edu — 실습 난이도 계산기 (7축 공식, v2)
 *
 * **역할: 실습자가 실제로 해야 하는 일의 복잡도로만 난이도 결정.**
 *   유명도는 완전 분리 (calculate-curation-priority.cjs 사용).
 *
 * ═══════════════════════════════════════════════════════════════
 * 공식: 실습 난이도 = 자동 90 + 수동 10 = 100
 * ═══════════════════════════════════════════════════════════════
 *   1. 공격체인 범위 (20)     — tactic 커버리지 + 기간(캠페인)
 *   2. 기법 수/커버리지 (20)   — Parent 고유 수 + Sub 10개↑ 시 +2
 *   3. 환경 복잡도 (15)        — platform 다양성 + AD/Cloud 가중
 *   4. 자격증명/횡적이동 (15)  — credential-access + lateral-movement tactic
 *   5. 은닉/탐지회피/LOTL (10) — defense-evasion tactic + LOTL 키워드
 *   6. 분석·탐지 요구 (10)     — mitigation 연결 풍부도
 *   7. 학습자 자율성 (10)      — 수동 manualAdjust (기본 0)
 *
 * 레벨 매핑:
 *   0~20   novice
 *   21~40  beginner
 *   41~60  intermediate
 *   61~80  advanced
 *   81~100 expert
 *
 * 강제 승급 규칙 (7개):
 *   - 단순 웹 취약점 1개 → novice 이상
 *   - 피싱·매크로·단일호스트 실행 → beginner 이상
 *   - 내부망 이동·credential dumping·2대↑ 호스트 → intermediate 이상
 *   - AD 도메인 장악·LOTL·방어회피·지속성 → advanced 이상
 *   - 공급망·제로데이·클라우드 IAM·OT/ICS·다중 조직 → expert 이상
 *   - Parent 8개 + Sub 15개 이상 → advanced 이상
 *   - 랜섬웨어 + impact + AD → advanced 이상
 *
 * 사용법:
 *   node scripts/calculate-difficulty.cjs
 *   node scripts/calculate-difficulty.cjs --top10
 *   node scripts/calculate-difficulty.cjs --distribution
 *   node scripts/calculate-difficulty.cjs --entity G0016
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARSED_DIR = path.join(ROOT, 'scripts/data/mitre-parsed');

const args = process.argv.slice(2);
const showTop10 = args.includes('--top10');
const showDist = args.includes('--distribution');
const entityIdx = args.indexOf('--entity');
const entityId = entityIdx >= 0 ? args[entityIdx + 1] : null;

const BOLD = '\x1b[1m', DIM = '\x1b[2m', RESET = '\x1b[0m';
const GREEN = '\x1b[32m', YELLOW = '\x1b[33m', RED = '\x1b[31m';
const BLUE = '\x1b[34m', CYAN = '\x1b[36m', MAGENTA = '\x1b[35m';

const LEVEL_COLORS = {
  novice: '\x1b[90m',       // 회색
  beginner: '\x1b[32m',     // 초록
  intermediate: '\x1b[36m', // 청록
  advanced: '\x1b[33m',     // 노랑
  expert: '\x1b[35m',       // 마젠타
};

const LEVEL_ORDER = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];

// ═══════════════════════════════════════════════════════════════
// 키워드 사전
// ═══════════════════════════════════════════════════════════════

// LOTL (Living Off The Land) 도구 — defense evasion
const LOTL_KEYWORDS = [
  'powershell', 'wmi', 'wmic', 'rundll32', 'mshta', 'certutil',
  'bitsadmin', 'regsvr32', 'cscript', 'wscript', 'schtasks',
  'psexec', 'net.exe', 'msbuild', 'installutil', 'regasm',
  'regsvcs', 'wsl.exe',
];

// Cloud / SaaS 환경 키워드
const CLOUD_KEYWORDS = [
  'aws', 'azure', 'gcp', 'google cloud', 'iam', 'saas',
  'cloud', 'office 365', 'o365', 'okta', 'onedrive',
];

// AD (Active Directory) / 도메인 장악
const AD_KEYWORDS = [
  'active directory', 'domain controller', 'kerberos',
  'dcsync', 'golden ticket', 'silver ticket', 'pass-the-hash',
  'pass-the-ticket', 'ntlm', 'lsass', 'ntds.dit', 'sid history',
];

// 강제 승급 키워드
const PROMOTION_KEYWORDS = {
  expert: [
    'supply chain', 'supply-chain', 'software supply',
    'zero-day', '0-day', '0day',
    'ics/scada', 'scada', 'ot attack', 'operational technology',
    'industrial control', 'cloud iam',
  ],
  advanced: [
    ...AD_KEYWORDS,
    'lateral movement', 'credential dumping',
  ],
  intermediate: [
    'internal network', 'pivot', 'port forward',
    'credential', 'dump',
  ],
  beginner: [
    'phishing', 'spearphishing', 'macro', 'malicious document',
  ],
};

// ═══════════════════════════════════════════════════════════════
// 데이터 로드 + 헬퍼 맵
// ═══════════════════════════════════════════════════════════════
function loadData() {
  const load = (f) => JSON.parse(fs.readFileSync(path.join(PARSED_DIR, f), 'utf-8'));
  return {
    groups: load('groups.json'),
    campaigns: load('campaigns.json'),
    techniques: load('techniques.json'),
    indexes: load('indexes.json'),
  };
}

function buildHelpers(techniques) {
  const techMap = {};
  const techToTactics = {};
  const techToPlatforms = {};

  techniques.forEach(t => {
    techMap[t.attackId] = t;
    techToTactics[t.attackId] = t.tactics || [];
    techToPlatforms[t.attackId] = t.platforms || [];
  });

  return { techMap, techToTactics, techToPlatforms };
}

// ═══════════════════════════════════════════════════════════════
// 축 1. 공격체인 범위 (0~20)
// ═══════════════════════════════════════════════════════════════
function scoreChainScope(ctx) {
  const tacticCount = ctx.tactics.size;
  let breadth;
  if (tacticCount >= 10) breadth = 15;
  else if (tacticCount >= 7) breadth = 12;
  else if (tacticCount >= 5) breadth = 8;
  else if (tacticCount >= 3) breadth = 5;
  else if (tacticCount >= 1) breadth = 2;
  else breadth = 0;

  let durationPts = 0;
  let durationReason = '';
  if (ctx.firstSeen && ctx.lastSeen) {
    const months = (new Date(ctx.lastSeen) - new Date(ctx.firstSeen)) / (1000 * 60 * 60 * 24 * 30);
    if (months >= 12) durationPts = 5;
    else if (months >= 6) durationPts = 3;
    else if (months >= 1) durationPts = 1;
    durationReason = `지속 ${months.toFixed(1)}개월`;
  }

  const score = Math.min(breadth + durationPts, 20);
  return {
    score,
    reason: `tactic ${tacticCount}/14 커버 (${breadth}pt)${durationReason ? ', ' + durationReason + ' (+' + durationPts + 'pt)' : ''}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// 축 2. 기법 수/전술 커버리지 (0~20)
//   - Parent 고유 개수 + Sub 10개↑ 시 +2
// ═══════════════════════════════════════════════════════════════
function scoreTtpCount(ctx) {
  const parentSet = new Set();
  let subCount = 0;
  ctx.techniques.forEach(tid => {
    if (tid.includes('.')) {
      subCount++;
      parentSet.add(tid.split('.')[0]);
    } else {
      parentSet.add(tid);
    }
  });
  const parentCount = parentSet.size;

  let parentPts;
  if (parentCount >= 20) parentPts = 18;
  else if (parentCount >= 15) parentPts = 16;
  else if (parentCount >= 10) parentPts = 13;
  else if (parentCount >= 6) parentPts = 9;
  else if (parentCount >= 3) parentPts = 5;
  else if (parentCount >= 1) parentPts = 2;
  else parentPts = 0;

  const subBonus = subCount >= 10 ? 2 : 0;
  const score = Math.min(parentPts + subBonus, 20);

  return {
    score,
    reason: `Parent ${parentCount}개 (${parentPts}pt) + Sub ${subCount}개${subBonus ? ' (+2 다양성)' : ''}`,
    meta: { parentCount, subCount },
  };
}

// ═══════════════════════════════════════════════════════════════
// 축 3. 환경 복잡도 (0~15)
// ═══════════════════════════════════════════════════════════════
function scoreEnvironment(ctx) {
  const platforms = ctx.platforms;
  let platformPts;
  if (platforms.size >= 5) platformPts = 10;
  else if (platforms.size >= 3) platformPts = 7;
  else if (platforms.size >= 2) platformPts = 4;
  else if (platforms.size >= 1) platformPts = 1;
  else platformPts = 0;

  const text = ctx.aggregateText.toLowerCase();
  const hasCloud = CLOUD_KEYWORDS.some(k => text.includes(k));
  const hasAd = AD_KEYWORDS.some(k => text.includes(k));

  const cloudPts = hasCloud ? 3 : 0;
  const adPts = hasAd ? 2 : 0;

  const score = Math.min(platformPts + cloudPts + adPts, 15);
  const extras = [];
  if (hasCloud) extras.push('Cloud/SaaS');
  if (hasAd) extras.push('AD');

  return {
    score,
    reason: `platform ${platforms.size}종 (${platformPts}pt)${extras.length ? ' + ' + extras.join('/') + ' (+' + (cloudPts + adPts) + 'pt)' : ''}`,
    meta: { hasCloud, hasAd },
  };
}

// ═══════════════════════════════════════════════════════════════
// 축 4. 자격증명/횡적이동 (0~15)
// ═══════════════════════════════════════════════════════════════
function scoreCredLateral(ctx) {
  let score = 0;
  const hits = [];
  if (ctx.tactics.has('credential-access')) { score += 5; hits.push('credential-access'); }
  if (ctx.tactics.has('lateral-movement')) { score += 5; hits.push('lateral-movement'); }
  if (ctx.tactics.has('privilege-escalation')) { score += 5; hits.push('privilege-escalation'); }

  return {
    score,
    reason: hits.length ? hits.join(' + ') : '자격증명/횡적이동 tactic 없음',
    meta: { hits },
  };
}

// ═══════════════════════════════════════════════════════════════
// 축 5. 은닉/탐지회피/LOTL (0~10)
// ═══════════════════════════════════════════════════════════════
function scoreStealthLotl(ctx) {
  let score = 0;
  const hasEvasion = ctx.tactics.has('defense-evasion');
  if (hasEvasion) score += 4;

  const text = ctx.aggregateText.toLowerCase();
  const lotlHits = LOTL_KEYWORDS.filter(k => text.includes(k));
  let lotlPts;
  if (lotlHits.length >= 5) lotlPts = 6;
  else if (lotlHits.length >= 3) lotlPts = 4;
  else if (lotlHits.length >= 1) lotlPts = 2;
  else lotlPts = 0;
  score += lotlPts;

  const reasonParts = [];
  if (hasEvasion) reasonParts.push('defense-evasion tactic');
  if (lotlHits.length) reasonParts.push(`LOTL ${lotlHits.length}종 (${lotlHits.slice(0, 3).join(',')})`);

  return {
    score: Math.min(score, 10),
    reason: reasonParts.length ? reasonParts.join(' + ') : '은닉 시그널 없음',
    meta: { hasEvasion, lotlHitCount: lotlHits.length },
  };
}

// ═══════════════════════════════════════════════════════════════
// 축 6. 분석·탐지 요구 (0~10)
// ═══════════════════════════════════════════════════════════════
function scoreAnalysisDemand(ctx, indexes) {
  const ttm = indexes.techniqueToMitigations || {};
  let totalMit = 0;
  ctx.techniques.forEach(tid => {
    const mits = ttm[tid] || ttm[tid.split('.')[0]] || [];
    totalMit += mits.length;
  });

  let score;
  if (totalMit >= 40) score = 10;
  else if (totalMit >= 25) score = 8;
  else if (totalMit >= 15) score = 6;
  else if (totalMit >= 8) score = 4;
  else if (totalMit >= 3) score = 2;
  else score = 0;

  return {
    score,
    reason: `mitigation 연결 ${totalMit}건`,
    meta: { totalMit },
  };
}

// ═══════════════════════════════════════════════════════════════
// 축 7. 학습자 자율성 (수동, 기본 0)
// ═══════════════════════════════════════════════════════════════
function scoreAutonomy(ctx) {
  const manual = ctx.manualAdjust || 0;
  return {
    score: Math.max(0, Math.min(10, manual)),
    reason: manual ? `manualAdjust: ${manual}/10` : '수동 보정 없음 (기본 0)',
  };
}

// ═══════════════════════════════════════════════════════════════
// 점수 → 레벨 매핑
// ═══════════════════════════════════════════════════════════════
function scoreToLevel(score) {
  if (score >= 81) return 'expert';
  if (score >= 61) return 'advanced';
  if (score >= 41) return 'intermediate';
  if (score >= 21) return 'beginner';
  return 'novice';
}

function maxLevel(a, b) {
  return LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;
}

// ═══════════════════════════════════════════════════════════════
// 강제 승급 규칙
// ═══════════════════════════════════════════════════════════════
function applyForcePromotion(level, ctx, scores) {
  const text = ctx.aggregateText.toLowerCase();
  const promotionNotes = [];

  // R1. 공급망 / 제로데이 / OT → expert
  const expertHit = PROMOTION_KEYWORDS.expert.find(k => text.includes(k));
  if (expertHit) {
    level = maxLevel(level, 'expert');
    promotionNotes.push(`키워드 '${expertHit}' → expert 강제 승급`);
  }

  // R2. AD/LOTL → advanced
  const advHit = PROMOTION_KEYWORDS.advanced.find(k => text.includes(k));
  if (advHit) {
    level = maxLevel(level, 'advanced');
    promotionNotes.push(`키워드 '${advHit}' → advanced 강제 승급`);
  }

  // R3. 내부망/credential dumping → intermediate (내부 용)
  const intHit = PROMOTION_KEYWORDS.intermediate.find(k => text.includes(k));
  if (intHit) {
    level = maxLevel(level, 'intermediate');
  }

  // R4. 피싱/매크로 → beginner (내부 용)
  const begHit = PROMOTION_KEYWORDS.beginner.find(k => text.includes(k));
  if (begHit) {
    level = maxLevel(level, 'beginner');
  }

  // R5. Parent 8개 + Sub 15개 → advanced
  if (scores.ttp.meta.parentCount >= 8 && scores.ttp.meta.subCount >= 15) {
    level = maxLevel(level, 'advanced');
    promotionNotes.push(`Parent 8+Sub 15+ → advanced 강제 승급`);
  }

  // R6. 랜섬웨어 + impact + AD → advanced
  if (text.includes('ransomware') && ctx.tactics.has('impact') && scores.env.meta.hasAd) {
    level = maxLevel(level, 'advanced');
    promotionNotes.push(`랜섬웨어+impact+AD → advanced 강제 승급`);
  }

  // R7. Cloud IAM 체인 → expert
  if (scores.env.meta.hasCloud &&
      ctx.tactics.has('credential-access') &&
      ctx.tactics.has('privilege-escalation')) {
    level = maxLevel(level, 'expert');
    promotionNotes.push(`Cloud + credential + privesc → expert 강제 승급`);
  }

  return { level, promotionNotes };
}

// ═══════════════════════════════════════════════════════════════
// Entity 처리
// ═══════════════════════════════════════════════════════════════
function processEntity(entity, type, data, helpers) {
  const { indexes } = data;
  const { techToTactics, techToPlatforms } = helpers;

  const techMap = type === 'group' ? indexes.groupToTechniques : indexes.campaignToTechniques;
  let usedTechs = (techMap[entity.attackId] || []).map(r => r.techniqueId);

  // 캠페인은 attributed-to 그룹의 기법도 상속
  if (type === 'campaign') {
    const attrGroups = indexes.campaignToGroups[entity.attackId] || [];
    attrGroups.forEach(gid => {
      (indexes.groupToTechniques[gid] || []).forEach(rel => usedTechs.push(rel.techniqueId));
    });
  }
  usedTechs = Array.from(new Set(usedTechs));

  const tactics = new Set();
  const platforms = new Set();
  usedTechs.forEach(tid => {
    (techToTactics[tid] || []).forEach(t => tactics.add(t));
    (techToPlatforms[tid] || []).forEach(p => platforms.add(p));
  });

  const descriptions = [entity.description || ''];
  (techMap[entity.attackId] || []).forEach(r => descriptions.push(r.description || ''));
  const aggregateText = descriptions.join(' ');

  const ctx = {
    techniques: usedTechs,
    tactics,
    platforms,
    aggregateText,
    firstSeen: entity.firstSeen,
    lastSeen: entity.lastSeen,
    manualAdjust: 0,
  };

  const s1 = scoreChainScope(ctx);
  const s2 = scoreTtpCount(ctx);
  const s3 = scoreEnvironment(ctx);
  const s4 = scoreCredLateral(ctx);
  const s5 = scoreStealthLotl(ctx);
  const s6 = scoreAnalysisDemand(ctx, indexes);
  const s7 = scoreAutonomy(ctx);

  const autoScore = s1.score + s2.score + s3.score + s4.score + s5.score + s6.score;
  const totalScore = autoScore + s7.score;
  let level = scoreToLevel(totalScore);

  const { level: promotedLevel, promotionNotes } = applyForcePromotion(
    level, ctx,
    { chainScope: s1, ttp: s2, env: s3, credLat: s4, stealth: s5, analysis: s6, autonomy: s7 },
  );
  level = promotedLevel;

  const reasons = [
    `공격체인 ${s1.score}/20 — ${s1.reason}`,
    `기법수 ${s2.score}/20 — ${s2.reason}`,
    `환경 ${s3.score}/15 — ${s3.reason}`,
    `자격증명/횡적 ${s4.score}/15 — ${s4.reason}`,
    `은닉/LOTL ${s5.score}/10 — ${s5.reason}`,
    `분석요구 ${s6.score}/10 — ${s6.reason}`,
    `자율성 ${s7.score}/10 — ${s7.reason}`,
    ...promotionNotes,
  ];

  return {
    attackId: entity.attackId,
    name: entity.name,
    aliases: entity.aliases || [],
    difficultyScore: totalScore,
    autoScore,
    manualAdjust: ctx.manualAdjust,
    level,
    breakdown: {
      chainScope: s1.score,
      ttpCount: s2.score,
      environment: s3.score,
      credLateral: s4.score,
      stealthLotl: s5.score,
      analysisDemand: s6.score,
      autonomy: s7.score,
    },
    meta: {
      parentTechniqueCount: s2.meta.parentCount,
      subTechniqueCount: s2.meta.subCount,
      tacticCount: tactics.size,
      platformCount: platforms.size,
      hasAd: s3.meta.hasAd,
      hasCloud: s3.meta.hasCloud,
      lotlHitCount: s5.meta.lotlHitCount,
    },
    reasons,
  };
}

// ═══════════════════════════════════════════════════════════════
// 출력 헬퍼
// ═══════════════════════════════════════════════════════════════
function printTop10(label, arr) {
  console.log(`\n${BOLD}🏆 ${label} 실습 난이도 TOP 10${RESET}`);
  arr.slice(0, 10).forEach((r, i) => {
    const c = LEVEL_COLORS[r.level];
    console.log(
      `  ${String(i + 1).padStart(2)}. ${CYAN}${r.attackId}${RESET} ` +
      `${r.name.padEnd(30)} ${c}${r.level.padEnd(12)}${RESET} ` +
      `${MAGENTA}${String(r.difficultyScore).padStart(3)}${RESET}/100`,
    );
  });
}

function printDistribution(label, arr) {
  const dist = { novice: 0, beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
  arr.forEach(r => dist[r.level]++);
  console.log(`\n${BOLD}📊 ${label} 레벨 분포${RESET}`);
  LEVEL_ORDER.forEach(lv => {
    const c = LEVEL_COLORS[lv];
    const bar = '█'.repeat(dist[lv]);
    console.log(`  ${c}${lv.padEnd(12)}${RESET} ${String(dist[lv]).padStart(3)}  ${c}${bar}${RESET}`);
  });
}

function printEntity(r) {
  if (!r) {
    console.log(`${RED}❌ 해당 ID 없음${RESET}`);
    return;
  }
  const c = LEVEL_COLORS[r.level];
  console.log(`\n${BOLD}${CYAN}${r.attackId}${RESET} ${BOLD}${r.name}${RESET}`);
  console.log(`${c}${r.level}${RESET} — ${MAGENTA}${r.difficultyScore}${RESET}/100 (auto ${r.autoScore}, manual ${r.manualAdjust})\n`);
  console.log(`${BOLD}breakdown:${RESET}`);
  Object.entries(r.breakdown).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(18)} ${v}`);
  });
  console.log(`\n${BOLD}reasons:${RESET}`);
  r.reasons.forEach(rr => console.log(`  • ${rr}`));
  console.log(`\n${BOLD}meta:${RESET} ${JSON.stringify(r.meta)}\n`);
}

// ═══════════════════════════════════════════════════════════════
// 실행
// ═══════════════════════════════════════════════════════════════
function run() {
  console.log(`\n${BOLD}🎯 실습 난이도 계산 (7축 공식 v2)${RESET}\n`);

  const data = loadData();
  const helpers = buildHelpers(data.techniques);

  const groupResults = data.groups
    .map(g => processEntity(g, 'group', data, helpers))
    .sort((a, b) => b.difficultyScore - a.difficultyScore);

  const campaignResults = data.campaigns
    .map(c => processEntity(c, 'campaign', data, helpers))
    .sort((a, b) => b.difficultyScore - a.difficultyScore);

  fs.writeFileSync(
    path.join(PARSED_DIR, 'groups-leveled.json'),
    JSON.stringify(groupResults, null, 2),
  );
  fs.writeFileSync(
    path.join(PARSED_DIR, 'campaigns-leveled.json'),
    JSON.stringify(campaignResults, null, 2),
  );
  console.log(`${GREEN}✅ groups-leveled.json     ${RESET}${groupResults.length}개`);
  console.log(`${GREEN}✅ campaigns-leveled.json  ${RESET}${campaignResults.length}개`);

  if (entityId) {
    const all = [...groupResults, ...campaignResults];
    printEntity(all.find(r => r.attackId === entityId));
    return;
  }

  if (showTop10 || (!showDist && !entityId)) {
    printTop10('APT 그룹', groupResults);
    printTop10('캠페인', campaignResults);
  }

  if (showDist || (!showTop10 && !entityId)) {
    printDistribution('APT 그룹', groupResults);
    printDistribution('캠페인', campaignResults);
  }

  console.log(`\n${BOLD}✨ 완료${RESET}\n`);
}

run();

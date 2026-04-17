#!/usr/bin/env node
/**
 * Gotroot Edu — 큐레이션 우선순위 계산기
 *
 * **역할: "어떤 사건을 먼저 보여줄지" 결정 (0~100점)**
 *   - 실습 난이도와는 완전 독립 — 유명도가 높다고 어려운 건 아니다.
 *   - /apt 페이지 카드 갤러리의 정렬 순서를 결정하는 데 사용.
 *
 * 공식:
 *   우선순위 = 유명도(30) + 타겟 관련성(30) + 교육 가치(40)
 *
 *   1. 유명도 (30점) — Claude 큐레이션 맵 + MITRE 내 언급 횟수
 *   2. 타겟 관련성 (30점) — 미국/중동/금융/정부 타겟 가중 (사용자 결정: 글로벌 우선)
 *   3. 교육 가치 (40점) — 기법 다양성 + mitigation 연결 + tactic 스프레드
 *
 * 사용법:
 *   node scripts/calculate-curation-priority.cjs
 *   node scripts/calculate-curation-priority.cjs --top20
 *
 * 출력:
 *   scripts/data/mitre-parsed/groups-curation.json
 *   scripts/data/mitre-parsed/campaigns-curation.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARSED_DIR = path.join(ROOT, 'scripts/data/mitre-parsed');

const args = process.argv.slice(2);
const showTop20 = args.includes('--top20');

const BOLD = '\x1b[1m', DIM = '\x1b[2m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m', MAGENTA = '\x1b[35m', RESET = '\x1b[0m';

// ═══════════════════════════════════════════════════════════════
// 1. 유명도 맵 (Claude 큐레이션, 0~30 스케일)
// ═══════════════════════════════════════════════════════════════
const FAMOUS_APT_MAP = {
  // 최상위 티어 (28-30)
  'G0016': 30, // APT29 / Cozy Bear (러시아 SVR)
  'G0032': 30, // Lazarus Group (북한)
  'G0007': 29, // APT28 / Fancy Bear (러시아 GRU)
  'G0034': 28, // Sandworm Team (러시아 GRU, NotPetya, Ukraine)
  'G1017': 28, // Volt Typhoon (중국, critical infra)

  // 상위 티어 (25-27)
  'G0102': 27, // Wizard Spider (Ryuk, Conti, TrickBot)
  'G0049': 26, // APT34 / OilRig (이란)
  'G0064': 26, // APT33 / Elfin (이란)
  'G0046': 26, // FIN7 (금융권)
  'G0069': 25, // MuddyWater (이란)
  'G0065': 25, // Leviathan / APT40 (중국)
  'G0050': 25, // APT32 (베트남)
  'G0094': 25, // Kimsuky (북한)

  // 중상위 티어 (20-24)
  'G0045': 24, // menuPass / APT10 (중국)
  'G0019': 24, // Naikon (중국)
  'G0082': 23, // APT38 (북한 금융)
  'G0010': 23, // Turla (러시아 FSB)
  'G0027': 23, // Threat Group-3390 / APT27 (중국)
  'G0060': 22, // BRONZE BUTLER (중국, 일본 타겟)
  'G0026': 22, // APT18 (중국)
  'G0076': 22, // Thrip (중국)
  'G0106': 22, // Rocke (크립토재킹)
  'G0037': 22, // FIN6
  'G0056': 22, // PROMETHIUM
  'G0041': 21, // Strider / ProjectSauron
  'G0087': 21, // APT39 (이란)
  'G0035': 21, // Dragonfly (러시아, 에너지)

  // 중위 티어 (15-19)
  'G0059': 19, // Magic Hound / APT35 (이란)
  'G0080': 19, // Cobalt Group (금융권)
  'G0125': 19, // HAFNIUM (중국, MS Exchange)
  'G0143': 19, // Aquatic Panda (중국, Log4j)
  'G0096': 18, // APT41 (중국, 이중목적)
  'G0088': 18, // TEMP.Veles / XENOTIME (러시아 OT)
  'G1004': 18, // LAPSUS$
  'G0040': 17, // Patchwork (인도)
  'G0011': 17, // PittyTiger (중국)
  'G0119': 17, // Indrik Spider
  'G0020': 16, // Equation (NSA 추정)
  'G0139': 16, // TeamTNT (클라우드 공격)
  'G0136': 16, // IndigoZebra
  'G0108': 15, // Blue Mockingbird
  'G0111': 15, // WellMess / APT29 sub

  // 기본 (5-14)는 generic 처리
};

const FAMOUS_CAMPAIGN_MAP = {
  'C0024': 30, // SolarWinds Compromise (APT29)
  'C0002': 25, // Night Dragon
  'C0010': 24, // C0010 (대규모 2021 APT)
  'C0011': 24,
  'C0014': 24,
  'C0015': 23, // C0015 (금융권)
  'C0017': 23, // APT41 미국 주정부
  'C0018': 23, // NotPetya-adjacent
  'C0021': 22, // 2018 올림픽
  'C0022': 22,
  'C0025': 22, // 2016 Ukraine 정전
  'C0026': 21,
  'C0027': 20, // Scattered Spider
};

// ═══════════════════════════════════════════════════════════════
// 2. 타겟 관련성 키워드 (30점)
// ═══════════════════════════════════════════════════════════════
// 사용자 결정: 미국/중동/글로벌 우선. 한국 특화는 약하게.
const RELEVANCE_KEYWORDS = {
  usMiddleEast: {
    keywords: ['united states', 'u.s.', ' us ', 'american', 'middle east',
               'iran', 'israel', 'saudi', 'uae', 'gulf', 'persian',
               'qatar', 'bahrain', 'kuwait', 'oman'],
    points: 15,
  },
  criticalInfra: {
    keywords: ['financial', 'banking', 'bank ', 'energy', 'oil', 'gas',
               'government', 'defense', 'military', 'healthcare', 'hospital',
               'telecom', 'electric grid', 'nuclear', 'water utility',
               'critical infrastructure', 'ics', 'scada', 'ot '],
    points: 10,
  },
  globalScale: {
    keywords: ['global', 'worldwide', 'multinational', 'multiple countries',
               'international', 'cross-border', 'transnational'],
    points: 5,
  },
};

// ═══════════════════════════════════════════════════════════════
// 3. 데이터 로드
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

// ═══════════════════════════════════════════════════════════════
// 4. 서브 스코어러
// ═══════════════════════════════════════════════════════════════

// 4-1. 유명도 (0~30)
function scoreFame(entity, type) {
  const map = type === 'group' ? FAMOUS_APT_MAP : FAMOUS_CAMPAIGN_MAP;
  const curated = map[entity.attackId];
  if (curated !== undefined) return { score: curated, reason: `큐레이션 매핑: ${curated}/30` };

  // 별칭 수로 generic 추정 (유명할수록 alias가 많음)
  const aliasCount = (entity.aliases || []).length;
  let score;
  if (aliasCount >= 8) score = 14;
  else if (aliasCount >= 5) score = 10;
  else if (aliasCount >= 3) score = 6;
  else if (aliasCount >= 1) score = 3;
  else score = 1;

  return { score, reason: `별칭 ${aliasCount}개 기반 추정: ${score}/30` };
}

// 4-2. 타겟 관련성 (0~30)
function scoreRelevance(entity) {
  const text = ((entity.description || '') + ' ' + (entity.name || '')).toLowerCase();
  let score = 0;
  const hits = [];

  for (const [key, { keywords, points }] of Object.entries(RELEVANCE_KEYWORDS)) {
    const matched = keywords.filter(kw => text.includes(kw));
    if (matched.length > 0) {
      score += points;
      hits.push(`${key}:${matched.slice(0, 3).join(',')}`);
    }
  }

  score = Math.min(score, 30);
  return { score, reason: hits.length ? hits.join(' / ') : '관련성 키워드 미검출' };
}

// 4-3. 교육 가치 (0~40)
function scoreEducational(entity, type, { indexes, techniques }) {
  const ttm = indexes.techniqueToMitigations || {};
  const techMap = type === 'group' ? indexes.groupToTechniques : indexes.campaignToTechniques;
  const usedTechs = (techMap[entity.attackId] || []).map(r => r.techniqueId);
  const uniqueTechs = Array.from(new Set(usedTechs));

  // a. 기법 다양성 (0~15)
  let diversityPts = 0;
  if (uniqueTechs.length >= 30) diversityPts = 15;
  else if (uniqueTechs.length >= 20) diversityPts = 12;
  else if (uniqueTechs.length >= 10) diversityPts = 9;
  else if (uniqueTechs.length >= 5) diversityPts = 5;
  else if (uniqueTechs.length >= 1) diversityPts = 2;

  // b. Tactic 스프레드 (0~15)
  const techByAttackId = {};
  techniques.forEach(t => { techByAttackId[t.attackId] = t; });
  const tactics = new Set();
  uniqueTechs.forEach(tid => {
    const t = techByAttackId[tid];
    if (t && t.tactics) t.tactics.forEach(tac => tactics.add(tac));
  });
  let tacticPts = 0;
  if (tactics.size >= 10) tacticPts = 15;
  else if (tactics.size >= 7) tacticPts = 12;
  else if (tactics.size >= 5) tacticPts = 8;
  else if (tactics.size >= 3) tacticPts = 5;
  else if (tactics.size >= 1) tacticPts = 2;

  // c. Mitigation 풍부도 (0~10) — 방어자 교육가치
  let mitigationTotalCount = 0;
  uniqueTechs.forEach(tid => {
    const parentId = tid.split('.')[0];
    mitigationTotalCount += (ttm[tid] || ttm[parentId] || []).length;
  });
  let mitigationPts = 0;
  if (mitigationTotalCount >= 30) mitigationPts = 10;
  else if (mitigationTotalCount >= 15) mitigationPts = 7;
  else if (mitigationTotalCount >= 5) mitigationPts = 4;
  else if (mitigationTotalCount >= 1) mitigationPts = 2;

  const total = diversityPts + tacticPts + mitigationPts;
  return {
    score: total,
    reason: `다양성 ${uniqueTechs.length}기법/${diversityPts}pt + tactic ${tactics.size}/${tacticPts}pt + mit ${mitigationTotalCount}/${mitigationPts}pt`,
  };
}

// ═══════════════════════════════════════════════════════════════
// 5. Entity 처리
// ═══════════════════════════════════════════════════════════════
function processEntity(entity, type, ctx) {
  const fame = scoreFame(entity, type);
  const relevance = scoreRelevance(entity);
  const edu = scoreEducational(entity, type, ctx);

  const curationScore = fame.score + relevance.score + edu.score;

  return {
    attackId: entity.attackId,
    name: entity.name,
    aliases: entity.aliases || [],
    curationScore,
    breakdown: {
      fame: fame.score,
      relevance: relevance.score,
      educational: edu.score,
    },
    reasons: [
      `유명도 ${fame.score}/30 — ${fame.reason}`,
      `관련성 ${relevance.score}/30 — ${relevance.reason}`,
      `교육가치 ${edu.score}/40 — ${edu.reason}`,
    ],
  };
}

// ═══════════════════════════════════════════════════════════════
// 6. 실행
// ═══════════════════════════════════════════════════════════════
function run() {
  console.log(`\n${BOLD}🎯 큐레이션 우선순위 계산${RESET}\n`);

  const { groups, campaigns, techniques, indexes } = loadData();
  const ctx = { indexes, techniques };

  const groupResults = groups
    .map(g => processEntity(g, 'group', ctx))
    .sort((a, b) => b.curationScore - a.curationScore);

  const campaignResults = campaigns
    .map(c => processEntity(c, 'campaign', ctx))
    .sort((a, b) => b.curationScore - a.curationScore);

  fs.writeFileSync(
    path.join(PARSED_DIR, 'groups-curation.json'),
    JSON.stringify(groupResults, null, 2),
  );
  fs.writeFileSync(
    path.join(PARSED_DIR, 'campaigns-curation.json'),
    JSON.stringify(campaignResults, null, 2),
  );

  console.log(`${GREEN}✅ groups-curation.json     ${RESET}${groupResults.length}개`);
  console.log(`${GREEN}✅ campaigns-curation.json  ${RESET}${campaignResults.length}개`);

  const topN = showTop20 ? 20 : 10;

  console.log(`\n${BOLD}🏆 APT 그룹 TOP ${topN}${RESET}`);
  groupResults.slice(0, topN).forEach((r, i) => {
    const bd = r.breakdown;
    console.log(
      `  ${String(i + 1).padStart(2)}. ${CYAN}${r.attackId}${RESET} ` +
      `${r.name.padEnd(28)} ${MAGENTA}${String(r.curationScore).padStart(3)}${RESET} ` +
      `${DIM}(유명 ${bd.fame} / 관련 ${bd.relevance} / 교육 ${bd.educational})${RESET}`,
    );
  });

  console.log(`\n${BOLD}🏆 캠페인 TOP ${topN}${RESET}`);
  campaignResults.slice(0, topN).forEach((r, i) => {
    const bd = r.breakdown;
    console.log(
      `  ${String(i + 1).padStart(2)}. ${CYAN}${r.attackId}${RESET} ` +
      `${r.name.padEnd(42)} ${MAGENTA}${String(r.curationScore).padStart(3)}${RESET} ` +
      `${DIM}(유명 ${bd.fame} / 관련 ${bd.relevance} / 교육 ${bd.educational})${RESET}`,
    );
  });

  console.log(`\n${BOLD}✨ 완료${RESET}\n`);
}

run();

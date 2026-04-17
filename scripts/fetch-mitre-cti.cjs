#!/usr/bin/env node
/**
 * Gotroot Edu — MITRE CTI (Cyber Threat Intelligence) 데이터 fetcher
 *
 * MITRE의 공식 CTI GitHub 저장소에서 enterprise-attack 데이터를 clone/pull하고
 * STIX 2.1 JSON을 파싱해서 교육 콘텐츠 생성용 구조화 데이터를 추출한다.
 *
 * 소스: https://github.com/mitre/cti (Apache 2.0)
 * 형식: STIX 2.1 JSON
 *
 * 사용법:
 *   node scripts/fetch-mitre-cti.cjs              # clone + 파싱 전체 실행
 *   node scripts/fetch-mitre-cti.cjs --clone      # clone(또는 pull)만
 *   node scripts/fetch-mitre-cti.cjs --parse      # 파싱만 (이미 clone된 경우)
 *   node scripts/fetch-mitre-cti.cjs --stats      # 현재 데이터 통계
 *
 * 출력:
 *   scripts/data/mitre-cti/           — Git clone 원본 (gitignored)
 *   scripts/data/mitre-parsed/
 *     ├── campaigns.json              — 캠페인 목록
 *     ├── groups.json                 — APT 그룹 목록
 *     ├── software.json               — 악성코드/도구
 *     ├── techniques.json             — 기법 (요약본)
 *     ├── mitigations.json            — 완화 조치
 *     └── relationships.json          — 관계 (uses, attributed-to 등)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'scripts/data');
const CTI_DIR = path.join(DATA_DIR, 'mitre-cti');
const PARSED_DIR = path.join(DATA_DIR, 'mitre-parsed');
const CTI_REPO = 'https://github.com/mitre/cti.git';
const ENTERPRISE_BUNDLE = path.join(CTI_DIR, 'enterprise-attack', 'enterprise-attack.json');

// ── CLI 인자 ──
const args = process.argv.slice(2);
const cloneOnly = args.includes('--clone');
const parseOnly = args.includes('--parse');
const statsOnly = args.includes('--stats');

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

// ══════════════════════════════════════════
// 1. Clone 또는 Pull
// ══════════════════════════════════════════
function cloneOrPull() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (fs.existsSync(path.join(CTI_DIR, '.git'))) {
    console.log(`${CYAN}📥 MITRE CTI 업데이트 중...${RESET}`);
    try {
      execSync(`cd "${CTI_DIR}" && git pull --depth 1 --ff-only`, { stdio: 'inherit' });
      console.log(`${GREEN}✅ git pull 완료${RESET}`);
    } catch (e) {
      console.log(`${YELLOW}⚠️  pull 실패, 기존 데이터 유지${RESET}`);
    }
  } else {
    console.log(`${CYAN}📥 MITRE CTI 최초 clone (얕은 복제, ~250MB)...${RESET}`);
    console.log(`${DIM}   ${CTI_REPO}${RESET}`);
    try {
      execSync(
        `git clone --depth 1 --filter=blob:none --sparse "${CTI_REPO}" "${CTI_DIR}"`,
        { stdio: 'inherit' }
      );
      execSync(
        `cd "${CTI_DIR}" && git sparse-checkout set enterprise-attack`,
        { stdio: 'inherit' }
      );
      console.log(`${GREEN}✅ clone 완료${RESET}`);
    } catch (e) {
      console.error(`${YELLOW}❌ clone 실패: ${e.message}${RESET}`);
      process.exit(1);
    }
  }

  // .gitignore에 scripts/data/mitre-cti/ 추가
  const gitignorePath = path.join(ROOT, '.gitignore');
  let gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';
  if (!gitignore.includes('scripts/data/mitre-cti')) {
    gitignore += '\n# MITRE CTI raw clone (파싱 결과만 커밋)\nscripts/data/mitre-cti/\n';
    fs.writeFileSync(gitignorePath, gitignore);
    console.log(`${DIM}   .gitignore에 scripts/data/mitre-cti/ 추가됨${RESET}`);
  }
}

// ══════════════════════════════════════════
// 2. STIX 번들 로드
// ══════════════════════════════════════════
function loadBundle() {
  if (!fs.existsSync(ENTERPRISE_BUNDLE)) {
    console.error(`${YELLOW}❌ enterprise-attack.json 없음. 먼저 --clone 실행 필요.${RESET}`);
    console.error(`   예상 경로: ${ENTERPRISE_BUNDLE}`);
    process.exit(1);
  }

  console.log(`${CYAN}📖 STIX 번들 로드 중...${RESET} ${DIM}${path.relative(ROOT, ENTERPRISE_BUNDLE)}${RESET}`);
  const bundle = JSON.parse(fs.readFileSync(ENTERPRISE_BUNDLE, 'utf-8'));
  console.log(`${DIM}   총 객체: ${bundle.objects.length}개${RESET}`);
  return bundle;
}

// ══════════════════════════════════════════
// 3. 파싱 (유형별 추출)
// ══════════════════════════════════════════
function extractAttackId(obj) {
  const ref = (obj.external_references || []).find(r => r.source_name === 'mitre-attack');
  return ref ? ref.external_id : null;
}

function extractUrl(obj) {
  const ref = (obj.external_references || []).find(r => r.source_name === 'mitre-attack');
  return ref ? ref.url : null;
}

function parseBundle(bundle) {
  const campaigns = [];
  const groups = [];
  const software = [];
  const techniques = [];
  const mitigations = [];
  const relationships = [];
  const stixIdToAttackId = {};  // STIX internal ID → ATT&CK ID 매핑

  for (const obj of bundle.objects) {
    if (obj.revoked || obj.x_mitre_deprecated) continue;

    switch (obj.type) {
      case 'campaign': {
        const attackId = extractAttackId(obj);
        stixIdToAttackId[obj.id] = attackId;
        campaigns.push({
          stixId: obj.id,
          attackId,
          name: obj.name,
          aliases: obj.aliases || [],
          description: obj.description || '',
          firstSeen: obj.first_seen || null,
          lastSeen: obj.last_seen || null,
          url: extractUrl(obj),
        });
        break;
      }

      case 'intrusion-set': {  // APT 그룹
        const attackId = extractAttackId(obj);
        stixIdToAttackId[obj.id] = attackId;
        groups.push({
          stixId: obj.id,
          attackId,
          name: obj.name,
          aliases: obj.aliases || [],
          description: obj.description || '',
          url: extractUrl(obj),
        });
        break;
      }

      case 'malware':
      case 'tool': {
        const attackId = extractAttackId(obj);
        stixIdToAttackId[obj.id] = attackId;
        software.push({
          stixId: obj.id,
          attackId,
          type: obj.type,  // 'malware' or 'tool'
          name: obj.name,
          aliases: obj.x_mitre_aliases || [],
          description: obj.description || '',
          platforms: obj.x_mitre_platforms || [],
          url: extractUrl(obj),
        });
        break;
      }

      case 'attack-pattern': {  // 기법
        const attackId = extractAttackId(obj);
        stixIdToAttackId[obj.id] = attackId;
        techniques.push({
          stixId: obj.id,
          attackId,
          name: obj.name,
          description: obj.description || '',
          platforms: obj.x_mitre_platforms || [],
          dataSources: obj.x_mitre_data_sources || [],
          detection: obj.x_mitre_detection || '',
          tactics: (obj.kill_chain_phases || []).map(k => k.phase_name),
          url: extractUrl(obj),
        });
        break;
      }

      case 'course-of-action': {  // 완화 조치
        const attackId = extractAttackId(obj);
        stixIdToAttackId[obj.id] = attackId;
        mitigations.push({
          stixId: obj.id,
          attackId,
          name: obj.name,
          description: obj.description || '',
          url: extractUrl(obj),
        });
        break;
      }

      case 'relationship': {
        relationships.push({
          type: obj.relationship_type,  // uses, attributed-to, mitigates, revoked-by ...
          sourceRef: obj.source_ref,
          targetRef: obj.target_ref,
          description: obj.description || '',
        });
        break;
      }
    }
  }

  // ── 관계 후처리: ATT&CK ID로도 접근 가능하게 ──
  for (const rel of relationships) {
    rel.sourceAttackId = stixIdToAttackId[rel.sourceRef] || null;
    rel.targetAttackId = stixIdToAttackId[rel.targetRef] || null;
  }

  return { campaigns, groups, software, techniques, mitigations, relationships, stixIdToAttackId };
}

// ══════════════════════════════════════════
// 4. 파생 인덱스 (빠른 조회용)
// ══════════════════════════════════════════
function buildIndexes(parsed) {
  const { relationships } = parsed;

  // 그룹 → 기법
  const groupToTechniques = {};
  // 그룹 → 소프트웨어
  const groupToSoftware = {};
  // 캠페인 → 그룹 (attributed-to)
  const campaignToGroups = {};
  // 캠페인 → 기법
  const campaignToTechniques = {};
  // 기법 → 완화조치
  const techniqueToMitigations = {};

  for (const rel of relationships) {
    const src = rel.sourceAttackId;
    const tgt = rel.targetAttackId;

    if (rel.type === 'uses' && src && tgt) {
      // intrusion-set → attack-pattern or malware
      if (src.startsWith('G') && tgt.startsWith('T')) {
        if (!groupToTechniques[src]) groupToTechniques[src] = [];
        groupToTechniques[src].push({ techniqueId: tgt, description: rel.description });
      } else if (src.startsWith('G') && (tgt.startsWith('S') || tgt.startsWith('M'))) {
        if (!groupToSoftware[src]) groupToSoftware[src] = [];
        groupToSoftware[src].push({ softwareId: tgt, description: rel.description });
      } else if (src.startsWith('C') && tgt.startsWith('T')) {
        if (!campaignToTechniques[src]) campaignToTechniques[src] = [];
        campaignToTechniques[src].push({ techniqueId: tgt, description: rel.description });
      }
    }

    if (rel.type === 'attributed-to' && src && tgt) {
      if (src.startsWith('C') && tgt.startsWith('G')) {
        if (!campaignToGroups[src]) campaignToGroups[src] = [];
        campaignToGroups[src].push(tgt);
      }
    }

    if (rel.type === 'mitigates' && src && tgt) {
      if (src.startsWith('M') && tgt.startsWith('T')) {
        if (!techniqueToMitigations[tgt]) techniqueToMitigations[tgt] = [];
        techniqueToMitigations[tgt].push({ mitigationId: src, description: rel.description });
      }
    }
  }

  return {
    groupToTechniques,
    groupToSoftware,
    campaignToGroups,
    campaignToTechniques,
    techniqueToMitigations,
  };
}

// ══════════════════════════════════════════
// 5. 저장
// ══════════════════════════════════════════
function save(parsed, indexes) {
  fs.mkdirSync(PARSED_DIR, { recursive: true });

  const files = [
    ['campaigns.json', parsed.campaigns],
    ['groups.json', parsed.groups],
    ['software.json', parsed.software],
    ['techniques.json', parsed.techniques],
    ['mitigations.json', parsed.mitigations],
    ['relationships.json', parsed.relationships],
    ['indexes.json', indexes],
  ];

  console.log(`\n${BOLD}💾 파싱 결과 저장${RESET}`);
  for (const [name, data] of files) {
    const filePath = path.join(PARSED_DIR, name);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    const size = fs.statSync(filePath).size;
    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(`   ${GREEN}✅${RESET} ${name.padEnd(22)} ${String(count).padStart(5)} 항목  ${DIM}${(size / 1024).toFixed(1)} KB${RESET}`);
  }
}

// ══════════════════════════════════════════
// 6. 통계 출력
// ══════════════════════════════════════════
function printStats(parsed) {
  console.log(`\n${BOLD}📊 MITRE ATT&CK Enterprise 통계${RESET}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   ${BLUE}캠페인${RESET}        ${parsed.campaigns.length.toString().padStart(4)}개`);
  console.log(`   ${BLUE}APT 그룹${RESET}      ${parsed.groups.length.toString().padStart(4)}개`);
  console.log(`   ${BLUE}소프트웨어${RESET}    ${parsed.software.length.toString().padStart(4)}개  ${DIM}(malware + tool)${RESET}`);
  console.log(`   ${BLUE}기법${RESET}          ${parsed.techniques.length.toString().padStart(4)}개`);
  console.log(`   ${BLUE}완화 조치${RESET}     ${parsed.mitigations.length.toString().padStart(4)}개`);
  console.log(`   ${BLUE}관계${RESET}          ${parsed.relationships.length.toString().padStart(4)}개`);

  // 샘플 APT 그룹 (상위 5개)
  console.log(`\n${BOLD}🎯 주요 APT 그룹 샘플${RESET}`);
  for (const g of parsed.groups.slice(0, 5)) {
    const aliases = g.aliases.slice(0, 3).join(', ');
    console.log(`   ${CYAN}${g.attackId}${RESET} ${g.name} ${DIM}(${aliases})${RESET}`);
  }

  // 샘플 캠페인 (최신 5개)
  const sortedCampaigns = [...parsed.campaigns]
    .filter(c => c.firstSeen)
    .sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen))
    .slice(0, 5);
  console.log(`\n${BOLD}📰 최근 캠페인 샘플${RESET}`);
  for (const c of sortedCampaigns) {
    const date = c.firstSeen ? c.firstSeen.slice(0, 10) : 'N/A';
    console.log(`   ${CYAN}${c.attackId}${RESET} ${c.name.padEnd(30)} ${DIM}${date}${RESET}`);
  }
}

// ══════════════════════════════════════════
// 실행 흐름
// ══════════════════════════════════════════
(async () => {
  console.log(`\n${BOLD}🎯 Gotroot Edu — MITRE CTI Fetcher${RESET}\n`);

  if (statsOnly) {
    if (!fs.existsSync(path.join(PARSED_DIR, 'campaigns.json'))) {
      console.error(`${YELLOW}❌ 파싱 결과 없음. 먼저 --parse 실행 필요.${RESET}`);
      process.exit(1);
    }
    const parsed = {
      campaigns: JSON.parse(fs.readFileSync(path.join(PARSED_DIR, 'campaigns.json'), 'utf-8')),
      groups: JSON.parse(fs.readFileSync(path.join(PARSED_DIR, 'groups.json'), 'utf-8')),
      software: JSON.parse(fs.readFileSync(path.join(PARSED_DIR, 'software.json'), 'utf-8')),
      techniques: JSON.parse(fs.readFileSync(path.join(PARSED_DIR, 'techniques.json'), 'utf-8')),
      mitigations: JSON.parse(fs.readFileSync(path.join(PARSED_DIR, 'mitigations.json'), 'utf-8')),
      relationships: JSON.parse(fs.readFileSync(path.join(PARSED_DIR, 'relationships.json'), 'utf-8')),
    };
    printStats(parsed);
    return;
  }

  if (!parseOnly) {
    cloneOrPull();
  }

  if (cloneOnly) return;

  const bundle = loadBundle();
  const parsed = parseBundle(bundle);
  const indexes = buildIndexes(parsed);
  save(parsed, indexes);
  printStats(parsed);

  console.log(`\n${BOLD}✨ 완료!${RESET}`);
  console.log(`${DIM}   파싱 결과: scripts/data/mitre-parsed/${RESET}`);
  console.log(`${DIM}   원본 clone: scripts/data/mitre-cti/ (gitignored)${RESET}\n`);
})();

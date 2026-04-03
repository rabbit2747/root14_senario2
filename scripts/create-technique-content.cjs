#!/usr/bin/env node
/**
 * Gotroot Edu — 새 기법 콘텐츠 골격 자동 생성 스크립트
 *
 * 사용법:
 *   node scripts/create-technique-content.cjs T1566.001 beginner
 *   node scripts/create-technique-content.cjs T1059.001 novice --title "PowerShell 악용" --titleEn "PowerShell Abuse"
 *
 * 생성되는 파일 (4종):
 *   1. public/edu/t{id}-{level}-ch1.html          — Edu HTML 1챕터 골격
 *   2. src/data/graphic-contents/{ID}-{level}.jsx  — Graphic JSX 템플릿
 *   3. src/data/scenario-contents/{ID}-{level}.jsx — Scenario JSX 템플릿
 *   4. src/data/lab-scenarios/{ID}-{level}.json    — Lab JSON 템플릿
 *
 * 등록 안내:
 *   스크립트 실행 후 수동 등록이 필요한 3곳을 안내합니다.
 */

const fs = require('fs');
const path = require('path');

// ── CLI 인자 파싱 ──
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(`
  사용법: node scripts/create-technique-content.cjs <TECHNIQUE_ID> <LEVEL> [옵션]

  필수:
    TECHNIQUE_ID   MITRE ATT&CK ID (예: T1566.001)
    LEVEL          novice | beginner | intermediate | advanced | expert

  옵션:
    --title "제목"      한국어 제목 (기본: "{ID} 교육")
    --titleEn "Title"   영어 제목 (기본: "{ID} Education")
    --force              기존 파일 덮어쓰기 허용
    --dry-run            파일 생성 없이 미리보기만

  예시:
    node scripts/create-technique-content.cjs T1566.001 beginner --title "스피어피싱 첨부" --titleEn "Spearphishing Attachment"
`);
  process.exit(1);
}

const techniqueId = args[0];                    // T1566.001
const level = args[1];                          // beginner
const VALID_LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];

if (!VALID_LEVELS.includes(level)) {
  console.error(`❌ 유효하지 않은 레벨: "${level}"\n   허용: ${VALID_LEVELS.join(', ')}`);
  process.exit(1);
}

if (!/^T\d{4}(\.\d{3})?$/.test(techniqueId)) {
  console.error(`❌ 유효하지 않은 기법 ID: "${techniqueId}"\n   예: T1566, T1566.001`);
  process.exit(1);
}

// 옵션 파싱
function getFlag(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] || true;
}
const title = getFlag('--title') || `${techniqueId} 교육`;
const titleEn = getFlag('--titleEn') || `${techniqueId} Education`;
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');

// ── 경로 계산 ──
const ROOT = path.resolve(__dirname, '..');
const idLower = techniqueId.toLowerCase().replace('.', '-');  // t1566-001
const fileKey = `${techniqueId}-${level}`;                     // T1566.001-beginner

const files = {
  edu: path.join(ROOT, `public/edu/${idLower}-${level}-ch1.html`),
  graphic: path.join(ROOT, `src/data/graphic-contents/${fileKey}.jsx`),
  scenario: path.join(ROOT, `src/data/scenario-contents/${fileKey}.jsx`),
  lab: path.join(ROOT, `src/data/lab-scenarios/${fileKey}.json`),
};

// ── 파일 존재 확인 ──
const existing = Object.entries(files).filter(([, p]) => fs.existsSync(p));
if (existing.length > 0 && !force) {
  console.error(`⚠️  이미 존재하는 파일 (--force로 덮어쓰기 가능):`);
  existing.forEach(([type, p]) => console.error(`   [${type}] ${path.relative(ROOT, p)}`));
  process.exit(1);
}

// ── 템플릿 생성 ──

// 1. Edu HTML
const eduHtml = `<!DOCTYPE html>
<html lang="ko" data-technique-id="${techniqueId}" data-level="${level}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co;">
  <title>${title} — Ch.1</title>
  <link rel="stylesheet" href="/edu/common.css">
</head>
<body>
  <div id="edu-container">
    <header>
      <h1>${title}</h1>
      <p class="subtitle">${titleEn}</p>
      <span class="badge badge-${level}">${level}</span>
    </header>

    <main>
      <!-- ═══ Chapter 1: 개요 ═══ -->
      <section id="ch1" class="chapter" data-chapter="ch1">
        <h2>Chapter 1: 개요</h2>
        <p>
          이 챕터에서는 ${techniqueId} 기법의 기본 개념과 실제 공격 사례를 학습합니다.
        </p>

        <!-- TODO: 교육 콘텐츠 작성 -->
        <div class="content-placeholder">
          <p>📝 여기에 교육 내용을 작성하세요.</p>
          <ul>
            <li>공격 개요 및 동기</li>
            <li>실제 사례 (CVE, 사고 보고서)</li>
            <li>탐지 방법</li>
            <li>방어 전략</li>
          </ul>
        </div>
      </section>
    </main>
  </div>

  <!-- Gotroot 공통 스크립트 -->
  <script src="/edu/breadcrumb.js"><\/script>
  <script src="/edu/progress-tracker.js"><\/script>
  <script src="/edu/graphic-link.js"><\/script>
</body>
</html>`;

// 2. Graphic JSX
const graphicJsx = `/**
 * ${techniqueId} ${level} — 그래픽 시네마틱 콘텐츠
 *
 * CinematicPlayer가 사용하는 2개 export:
 *   subtitlesData — 슬라이드별 자막 (다국어 객체 배열)
 *   renderSlides  — 슬라이드별 JSX 렌더 함수
 *
 * 가이드: docs/guides/graphic-content-template-guide.md
 */
import React from 'react';

// ── 자막 데이터 (슬라이드당 1개, duration ms) ──
export const subtitlesData = [
  {
    ko: '${title} — 개요',
    en: '${titleEn} — Overview',
    vi: null, ar: null, ja: null, zh: null, hi: null,
    duration: 8000,
  },
  {
    ko: '공격 흐름 분석',
    en: 'Attack Flow Analysis',
    vi: null, ar: null, ja: null, zh: null, hi: null,
    duration: 10000,
  },
  {
    ko: '탐지 및 방어 전략',
    en: 'Detection & Defense Strategy',
    vi: null, ar: null, ja: null, zh: null, hi: null,
    duration: 10000,
  },
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides(language = 'ko') {
  const T = {
    ko: {
      slide1Title: '${title}',
      slide1Body: '이 슬라이드에서 ${techniqueId} 기법의 전체 흐름을 시각적으로 설명합니다.',
      slide2Title: '공격 흐름',
      slide2Body: '공격자가 사용하는 단계별 절차를 도식화합니다.',
      slide3Title: '탐지 및 방어',
      slide3Body: '효과적인 탐지 규칙과 방어 전략을 제시합니다.',
    },
    en: {
      slide1Title: '${titleEn}',
      slide1Body: 'This slide visually explains the overall flow of ${techniqueId}.',
      slide2Title: 'Attack Flow',
      slide2Body: 'Step-by-step procedures used by attackers.',
      slide3Title: 'Detection & Defense',
      slide3Body: 'Effective detection rules and defense strategies.',
    },
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };

  const t = T[language] || T.ko;

  return [
    // ── Slide 1: 개요 ──
    <div key="s1" style={{ width: 1280, height: 720, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f8fafc', padding: 60 }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 20 }}>{t.slide1Title}</h1>
      <p style={{ fontSize: 22, color: '#94a3b8', textAlign: 'center', maxWidth: 800 }}>{t.slide1Body}</p>
    </div>,

    // ── Slide 2: 공격 흐름 ──
    <div key="s2" style={{ width: 1280, height: 720, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#f8fafc', padding: 60 }}>
      <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 20 }}>{t.slide2Title}</h1>
      <p style={{ fontSize: 20, color: '#94a3b8', textAlign: 'center', maxWidth: 800 }}>{t.slide2Body}</p>
      {/* TODO: 공격 흐름 다이어그램 추가 */}
    </div>,

    // ── Slide 3: 탐지 및 방어 ──
    <div key="s3" style={{ width: 1280, height: 720, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#f8fafc', padding: 60 }}>
      <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 20 }}>{t.slide3Title}</h1>
      <p style={{ fontSize: 20, color: '#94a3b8', textAlign: 'center', maxWidth: 800 }}>{t.slide3Body}</p>
      {/* TODO: 탐지 규칙 시각화 추가 */}
    </div>,
  ];
}
`;

// 3. Scenario JSX
const scenarioJsx = `/**
 * ${techniqueId} ${level} — 시나리오 인터랙티브 콘텐츠
 *
 * ScenarioExplanationPage가 React.lazy로 로드
 * language prop 수신 필수
 *
 * 가이드: CLAUDE.md > 시나리오 콘텐츠 필수 구조
 */
import React, { useState } from 'react';

const CHAPTERS = [
  { id: 'sector1', title: 'Sector 1: 초기 접근' },
  { id: 'sector2', title: 'Sector 2: 분석' },
  { id: 'sector3', title: 'Sector 3: 대응' },
];

export default function Scenario({ language = 'ko' }) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [score, setScore] = useState(0);

  const T = {
    ko: {
      title: '${title} — 시나리오',
      sector1: 'Sector 1: 초기 접근',
      sector1Desc: '공격자의 초기 침투 경로를 추적합니다.',
      sector2: 'Sector 2: 분석',
      sector2Desc: '수집된 증거를 분석하여 공격 패턴을 파악합니다.',
      sector3: 'Sector 3: 대응',
      sector3Desc: '적절한 대응 전략을 수립하고 실행합니다.',
      next: '다음 섹터',
      prev: '이전 섹터',
      complete: '시나리오 완료',
    },
    en: {
      title: '${titleEn} — Scenario',
      sector1: 'Sector 1: Initial Access',
      sector1Desc: 'Track the attacker\\'s initial intrusion path.',
      sector2: 'Sector 2: Analysis',
      sector2Desc: 'Analyze collected evidence to identify attack patterns.',
      sector3: 'Sector 3: Response',
      sector3Desc: 'Develop and execute appropriate response strategies.',
      next: 'Next Sector',
      prev: 'Previous Sector',
      complete: 'Scenario Complete',
    },
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };

  const t = T[language] || T.ko;
  const chapter = CHAPTERS[currentChapter];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{t.title}</h1>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.id}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= currentChapter ? '#3b82f6' : '#334155',
            }}
          />
        ))}
      </div>

      {/* Chapter Content */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 32, minHeight: 400 }}>
        <h2 style={{ fontSize: 24, color: '#60a5fa', marginBottom: 12 }}>
          {t[\`sector\${currentChapter + 1}\`]}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8 }}>
          {t[\`sector\${currentChapter + 1}Desc\`]}
        </p>

        {/* TODO: 인터랙티브 콘텐츠 추가 */}
        <div style={{ marginTop: 32, padding: 24, border: '2px dashed #334155', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
          여기에 인터랙티브 콘텐츠를 추가하세요.
          <br />
          (대화, 퀴즈, 드래그앤드롭, 증거 분석 등)
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button
          onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
          disabled={currentChapter === 0}
          style={{ padding: '10px 24px', borderRadius: 8, background: '#334155', color: '#f8fafc', border: 'none', cursor: 'pointer', opacity: currentChapter === 0 ? 0.4 : 1 }}
        >
          {t.prev}
        </button>
        <button
          onClick={() => {
            if (currentChapter < CHAPTERS.length - 1) {
              setCurrentChapter(currentChapter + 1);
            }
          }}
          style={{ padding: '10px 24px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {currentChapter === CHAPTERS.length - 1 ? t.complete : t.next}
        </button>
      </div>
    </div>
  );
}
`;

// 4. Lab JSON
const labJson = JSON.stringify({
  id: fileKey,
  title: title,
  titleEn: titleEn,
  titleVi: '',
  titleAr: '',
  titleJa: '',
  titleZh: '',
  titleHi: '',
  duration: '15분',
  stepDuration: 8,
  phases: [
    { label: '정찰', labelEn: 'Reconnaissance', labelVi: '', labelAr: '' },
    { label: '침투', labelEn: 'Initial Access', labelVi: '', labelAr: '' },
    { label: '실행', labelEn: 'Execution', labelVi: '', labelAr: '' },
    { label: '탐지', labelEn: 'Detection', labelVi: '', labelAr: '' },
  ],
  desktopIcons: [
    { name: 'Terminal', icon: 'terminal' },
    { name: 'Browser', icon: 'globe' },
    { name: 'File Manager', icon: 'folder' },
  ],
  steps: [
    {
      phase: 0,
      stepTitle: '환경 정찰',
      stepTitleEn: 'Environment Reconnaissance',
      stepTitleVi: '',
      stepTitleAr: '',
      desc: '공격자가 대상 환경을 정찰하는 단계입니다.',
      descEn: 'The attacker reconnoiters the target environment.',
      descVi: '',
      descAr: '',
      command: 'nmap -sV target.example.com',
      output: 'PORT    STATE SERVICE  VERSION\n22/tcp  open  ssh      OpenSSH 8.9\n80/tcp  open  http     Apache 2.4.52\n443/tcp open  https    Apache 2.4.52',
      feynman: '공격자는 먼저 어떤 문이 열려있는지 확인합니다. 마치 건물의 모든 창문과 문을 하나씩 두드려보는 것과 같습니다.',
      feynmanEn: 'The attacker first checks which doors are open, like knocking on every window and door of a building.',
      feynmanVi: '',
      feynmanAr: '',
      expert: 'nmap SYN 스캔으로 열린 포트와 서비스 버전을 식별합니다. -sV 플래그는 서비스 핑거프린팅을 수행합니다.',
      expertEn: 'nmap SYN scan identifies open ports and service versions. The -sV flag performs service fingerprinting.',
      expertVi: '',
      expertAr: '',
      defTooltip: '네트워크 IDS에서 포트 스캔 패턴을 탐지하세요.',
      defTooltipEn: 'Detect port scan patterns in your network IDS.',
      defTooltipVi: '',
      defTooltipAr: '',
      terms: [
        {
          name: '포트 스캔',
          nameEn: 'Port Scan',
          desc: '네트워크 호스트의 열린 포트를 식별하는 기법',
          descEn: 'Technique to identify open ports on a network host',
          descVi: '',
          descAr: '',
        },
      ],
      hackerLog: {
        lines: [
          {
            log: '$ nmap -sV target.example.com',
            desc: 'SYN 스캔으로 서비스 버전 탐지 시작',
            descEn: 'Starting SYN scan for service version detection',
            descVi: '',
            descAr: '',
          },
        ],
      },
    },
  ],
}, null, 2);

// ── 파일 생성 ──
const results = [
  { type: 'Edu HTML', path: files.edu, content: eduHtml },
  { type: 'Graphic JSX', path: files.graphic, content: graphicJsx },
  { type: 'Scenario JSX', path: files.scenario, content: scenarioJsx },
  { type: 'Lab JSON', path: files.lab, content: labJson },
];

console.log(`\n🚀 ${techniqueId} ${level} 콘텐츠 생성${dryRun ? ' (DRY RUN)' : ''}\n`);
console.log(`   제목: ${title} / ${titleEn}\n`);

let created = 0;
for (const { type, path: filePath, content } of results) {
  const rel = path.relative(ROOT, filePath);
  const exists = fs.existsSync(filePath);

  if (dryRun) {
    console.log(`   ${exists ? '⚠️  덮어쓰기' : '✅ 생성'} ${type}: ${rel}`);
    created++;
    continue;
  }

  // 디렉토리 보장
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`   ✅ ${type}: ${rel}`);
  created++;
}

// ── 등록 안내 ──
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 수동 등록 필요 (3곳)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  src/pages/GraphicExplanationPage.jsx
   GRAPHIC_COMPONENTS 맵에 추가:
   '${fileKey}': React.lazy(() => import('../data/graphic-contents/${fileKey}').then(mod => ({ default: () => null, _slideData: mod }))),

   GRAPHIC_DATA_LOADERS 맵에 추가:
   '${fileKey}': () => import('../data/graphic-contents/${fileKey}'),

2️⃣  src/pages/ScenarioExplanationPage.jsx
   SCENARIO_COMPONENTS 맵에 추가:
   '${fileKey}': React.lazy(() => import('../data/scenario-contents/${fileKey}')),

3️⃣  src/pages/lab/DesktopLab.jsx
   SCENARIO_LOADERS 맵에 추가:
   '${fileKey}': () => import('../../data/lab-scenarios/${fileKey}.json'),

4️⃣  src/data/edu-meta.json
   해당 기법의 levels 배열에 레벨 추가:
   { "level": "${level}", "url": "/edu/${idLower}-${level}-ch1.html" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ 빌드 검증: npm run build
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

console.log(`✨ ${created}개 파일 생성 완료!\n`);

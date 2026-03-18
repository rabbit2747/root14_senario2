# 14. Data Structures - 데이터 구조 (JSON / DB / localStorage)

## Meta
| Key | Value |
|-----|-------|
| Location | `src/data/`, `public/edu/`, Supabase, localStorage |
| Purpose | 교육 시스템 전체 데이터 레이어 문서화 |

---

## 1. edu-meta.json (교육 메타데이터)

### Location
`src/data/edu-meta.json`

### Used By
CourseSelector, IntroMatrix, LearningPathChoice, RecommendedCoursePage, EduFormManager(Admin)

### Structure
```json
{
  "version": 3,
  "pages": {
    "[techniqueId]": {
      "url": "/edu/[slug].html",
      "title": "한글 제목",
      "titleEn": "English Title",
      "tacticIds": ["t1", "t2"],
      "techniqueId": "T1587",
      "subTechniqueId": "T1587.001",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedMinutes": 30,
      "tags": ["Tag1", "Tag2"],
      "levels": {
        "novice": {
          "url": "/edu/[slug]-novice.html",
          "chapters": 3,
          "chapterTitles": ["Ch1 Title", "Ch2 Title", "Ch3 Title"],
          "chapterIds": ["ch1", "ch2", "ch3"]
        },
        "beginner": { "url": "...", "chapters": 10, ... },
        "intermediate": { "url": "...", "chapters": 8, ... },
        "advanced": null,
        "expert": null
      }
    }
  }
}
```

### Key Points
- `pages` 키: 150+ 테크닉 (T1587.001, T1566.001, ...)
- `levels`: 5단계 중 존재하는 레벨만 URL 포함, 없는 레벨은 null 또는 미포함
- `chapterIds`: progress-tracker.js의 `data-chapter-id`와 매칭
- `url`: `/edu/` 접두사 + 하이픈 연결 슬러그 + `.html`

---

## 2. lab-scenarios/*.json (랩 시나리오)

### Location
`src/data/lab-scenarios/` (186개 파일)

### Used By
DesktopLab (SCENARIO_LOADERS), GenericLabSimulator

### Structure
```json
{
  "id": "T1587.001",
  "title": "악성코드 개발",
  "titleEn": "Malware Development",
  "duration": 480,
  "stepDuration": 8,
  "steps": [
    {
      "action": "string (단계 설명)",
      "output": "string (터미널 출력)",
      "command": "string (실행 명령어)",
      "userMessage": "string (사용자 메시지)",
      "defenseComment": "string (방어자 코멘트)",
      "ttsText": "string (TTS 텍스트)",
      "processTree": [
        { "pid": 1, "name": "explorer.exe", "children": [2] }
      ],
      "desktopIcons": [
        { "name": "Terminal", "icon": "terminal" }
      ]
    }
  ],
  "phases": [
    { "name": "정찰", "startStep": 0, "endStep": 3 },
    { "name": "침투", "startStep": 4, "endStep": 8 },
    { "name": "유출", "startStep": 9, "endStep": 12 }
  ],
  "processTree": [
    { "pid": 1, "name": "System", "children": [2, 3, 4] }
  ],
  "desktopIcons": [
    { "name": "My Computer", "icon": "computer" },
    { "name": "Recycle Bin", "icon": "trash" }
  ]
}
```

---

## 3. graphic-contents/*.jsx (그래픽 슬라이드)

### Location
`src/data/graphic-contents/` (현재 1개: T1587.001-beginner.jsx)

### Used By
GraphicExplanationPage (GRAPHIC_DATA_LOADERS, GRAPHIC_COMPONENTS)

### Required Exports
```javascript
// 자막 데이터 (배열)
export const subtitlesData = [
  { text: "슬라이드 1 설명 텍스트", duration: 5, slideIndex: 0 },
  { text: "슬라이드 2 설명 텍스트", duration: 8, slideIndex: 1 },
  // ... N개 자막
];

// 슬라이드 JSX 렌더 함수
export function renderSlides() {
  return (
    <>
      <div className="slide" data-slide="0">
        {/* Slide 1: JSX + SVG + CSS */}
      </div>
      <div className="slide" data-slide="1">
        {/* Slide 2 */}
      </div>
    </>
  );
}
```

### Naming Convention
`{techniqueId}-{level}.jsx` → 예: `T1587.001-beginner.jsx`

---

## 4. guided-chapters/*.js (유도 학습 챕터)

### Location
`src/data/guided-chapters/` (현재 1개: T1566.001.js)

### Used By
GuidedLearning.jsx

### Structure
```javascript
export const chapters = [
  {
    id: 'ch1',
    title: '한글 제목',
    titleEn: 'English Title',
    type: 'text',             // text | code | quiz | animation | scenario
    content: 'string or object (타입별 다름)',
  },
];

// type별 content 구조:
// text:      string (마크다운 또는 HTML)
// code:      { template, solution, hints[] }
// quiz:      { question, options[], answer: number, explanation }
// animation: { steps: [{ label, icon }] }
// scenario:  { commands: [{ input, output }], goal }
```

---

## 5. level-test-questions.js (레벨 테스트 메타)

### Location
`src/data/level-test-questions.js`

### Used By
LevelTest.jsx (UI 메타만, 문제는 서버 API)

### Structure (v1.2.0~ 클라이언트 측)
```javascript
// ⚠️ 문제 은행은 서버에서만 제공 (보안)
export const CATEGORIES = ['네트워크/OS', '보안기초', 'ATT&CK 전술', '위협 탐지', '심화/CTI'];

export const CATEGORIES_I18N = {
  ko: ['네트워크/OS', '보안기초', 'ATT&CK 전술', '위협 탐지', '심화/CTI'],
  en: ['Network/OS', 'Security Basics', 'ATT&CK Tactics', 'Threat Detection', 'Advanced/CTI'],
  ja: ['ネットワーク/OS', 'セキュリティ基礎', 'ATT&CK戦術', '脅威検知', '高度/CTI'],
};

export const LEVEL_NAMES = {
  1: { ko: '입문', en: 'Novice' },
  2: { ko: '초급', en: 'Beginner' },
  3: { ko: '중급', en: 'Intermediate' },
  4: { ko: '고급', en: 'Advanced' },
  5: { ko: '전문가', en: 'Expert' },
};

export const LEVEL_COLORS = {
  1: '#22c55e', 2: '#3b82f6', 3: '#8b5cf6', 4: '#ef4444', 5: '#f59e0b',
};

export const QUESTION_BANK = {};  // 빈 객체 (하위 호환)
```

### Server-Side Data (server-data/level-test-questions.json)
```json
[
  {
    "id": "uuid-or-index",
    "level": 1,
    "category": "네트워크/OS",
    "question": "DNS 서버의 주요 역할은?",
    "options": [
      { "text": "IP를 도메인으로 변환", "isCorrect": false },
      { "text": "도메인을 IP로 변환", "isCorrect": true },
      { "text": "패킷 필터링", "isCorrect": false },
      { "text": "암호화 처리", "isCorrect": false }
    ]
  }
  // ... 100문제 (5레벨 × 20문제)
]
```

---

## 6. matrix-fallback.json (매트릭스 폴백)

### Location
`src/data/matrix-fallback.json`

### Used By
useMatrixData (Supabase 실패 시), LearningPathChoice

### Structure
```json
{
  "tactics": [
    {
      "id": "t1",
      "name": "Reconnaissance",
      "nameKo": "정찰",
      "order": 1,
      "techniques": [
        {
          "id": "T1595",
          "name": "Active Scanning",
          "nameKo": "능동 스캐닝",
          "subTechniques": [
            { "id": "T1595.001", "name": "Scanning IP Blocks", "nameKo": "IP 블록 스캐닝" }
          ]
        }
      ]
    }
  ]
}
```

---

## 7. Supabase Tables (Education Related)

### edu_progress
```
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| technique_id | TEXT | T1587.001 등 |
| chapter_id | TEXT | ch1, ch2, quiz, eval, lab_completed |
| level | TEXT | novice/beginner/intermediate/advanced/expert |
| completed_at | TIMESTAMPTZ | 완료 시각 |
| UNIQUE | (user_id, technique_id, chapter_id, level) |
```

### level_test_questions
```
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| level | INT | 1-5 |
| category | TEXT | 카테고리명 |
| question | TEXT | 문제 텍스트 |
| options | JSONB | [{ text, isCorrect }] |
| is_active | BOOLEAN | 활성 여부 |
| created_at | TIMESTAMPTZ | |
```

### profiles (education fields)
```
| Column | Type | Description |
|--------|------|-------------|
| level | TEXT | beginner/junior/intermediate/advanced/expert |
| name | TEXT | 사용자 이름 (GenericLabSimulator prefill) |
| role | TEXT | user/admin |
```

---

## 8. localStorage Keys (Education)

| Key | Structure | Written By | Read By |
|-----|-----------|-----------|---------|
| `gotroot_edu_progress` | `{ [techId]: { [level]: [chIds] } }` | progress-tracker.js | useEduProgress |
| `gotroot_completed_labs` | `[{ name, technique, completedAt }]` | GenericLabSimulator | MyPage, LabCompletionPage |
| `gotroot_guided_progress` | `{ [techId]: [chapterIndices] }` | GuidedLearning | GuidedLearning |
| `gotroot_intro_seen` | `'true'` | IntroMatrix (히어로 완료) | IntroMatrix |
| `gotroot_lang` | `'ko'\|'en'\|'ja'\|'vi'\|'ar'` | LangToggle | 모든 페이지 |
| `gotroot_theme` | `'dark'\|'light'` | IntroMatrix 토글 | GraphicExplanationPage, MyPage |

---

## 9. sessionStorage Keys

| Key | Structure | Written By | Read By |
|-----|-----------|-----------|---------|
| `gotroot_nav_state` | `{ breadcrumb: [{ label, path }] }` | CourseSelector, IntroMatrix | CourseSelector, breadcrumb.js |
| `gotroot_level_test_result` | `{ level, scores, ... }` | LevelTest (임시) | Signup (level 파라미터로 전달) |

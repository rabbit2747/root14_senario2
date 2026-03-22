# GOTROOT Edu — 교육 페이지 제작 가이드

> 작성 기준: v0.9.0 (2026-03-06)
> 대상: 교육 HTML 페이지 / edu-meta.json / lab-scenarios JSON 제작·수정

---

## 1. 교육 HTML 페이지 구조

### 1-1. 파일 명명 규칙

| 레벨 | 파일명 패턴 | 예시 (T1078.002) |
|------|------------|-----------------|
| beginner | `t{id소문자}.html` | `t1078-002-domain-accounts.html` |
| intermediate | `t{id소문자}-intermediate.html` | `t1078-002-domain-accounts-intermediate.html` |
| advanced | `t{id소문자}-advanced.html` | `t1078-002-domain-accounts-advanced.html` |
| novice | `t{id소문자}-novice.html` | `t1078-002-domain-accounts-novice.html` |
| expert | `t{id소문자}-expert.html` | `t1078-002-domain-accounts-expert.html` |

> **변환 규칙**: 기법 ID의 대문자를 소문자로, `.`(점)을 `-`(하이픈)으로 변환
> T1078.002 → t1078-002, T1587.001 → t1587-001

저장 위치: `public/edu/`

---

### 1-2. `<html>` 루트 속성

```html
<html lang="ko" class="light" data-technique-id="T1078.002" data-level="beginner">
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `data-technique-id` | ✅ 필수 | MITRE ATT&CK 기법 ID (대문자, 점 포함) |
| `data-level` | ✅ 필수 | `novice` / `beginner` / `intermediate` / `advanced` / `expert` |
| `class="light"` | 권장 | 기본 라이트 모드 |
| `lang="ko"` | 권장 | 한국어 기본 |

> ⚠️ `data-level`이 없으면 `progress-tracker.js`가 자동으로 `"beginner"`로 처리합니다.

---

### 1-3. `<head>` 필수 스크립트 블록 (순서 고정)

```html
<head>
  <!-- ① 인증 게이트 (맨 처음, 비로그인 차단) -->
  <script>
    (function() {
      if (new URLSearchParams(window.location.search).get('preview') === '1') return;
      try {
        var key = 'sb-bnwbybawqrnhznirivfg-auth-token';
        var session = sessionStorage.getItem(key);
        if (!session || !JSON.parse(session)) {
          var redirect = encodeURIComponent(window.location.href);
          window.location.replace('/login?redirect=' + redirect);
        }
      } catch(e) { window.location.replace('/login'); }
    })();
  </script>

  <!-- ② 동적 콘텐츠 로더 (Supabase edu_html_content 우선 적용) -->
  <script>
    var _eduDynLoaded = false;
    (async function() {
      try {
        var SUPA = 'https://bnwbybawqrnhznirivfg.supabase.co';
        var KEY  = 'sb_publishable_fiXeTnAxpTatUSnC0ZvOWg_x5eSbL1w';
        var pageId = '{page_id}'; // 예: 't1078-002-domain-accounts'
        var res = await fetch(
          SUPA + '/rest/v1/edu_html_content?page_id=eq.' + pageId + '&select=content&limit=1',
          { headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY } }
        );
        if (res.ok) {
          var data = await res.json();
          if (data && data.length > 0 && data[0].content) {
            _eduDynLoaded = true;
            document.open(); document.write(data[0].content); document.close();
            return;
          }
        }
      } catch(e) {}
      document.documentElement.classList.add('edu-ready');
    })();
    setTimeout(function() { if (!_eduDynLoaded) document.documentElement.classList.add('edu-ready'); }, 3000);
  </script>
  <style>html:not(.edu-ready) body { visibility: hidden; } html.edu-ready body { visibility: visible; }</style>

  <!-- ③ CSP (콘텐츠 보안 정책) -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob:;
      connect-src 'self' https://*.supabase.co;
      frame-src 'none'; object-src 'none'; base-uri 'self';" />
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />

  <!-- ④ Tailwind CSS CDN + 커스텀 테마 -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            cbg: '#FFF8F0', cyel: '#F4D06F',
            cteal: '#9DD9D2', cdark: '#1e293b', cgray: '#475569',
          }
        }
      }
    }
  </script>
</head>
```

> **동적 콘텐츠 로더의 `page_id`**는 파일명에서 `.html` 제거한 값:
> `t1078-002-domain-accounts.html` → `t1078-002-domain-accounts`

---

### 1-4. 본문 섹션 구조

#### 필수 section ID 패턴

```html
<!-- 챕터 섹션 (ch1 ~ ch{N}) -->
<section id="ch1" class="section-observe p-8 max-w-4xl mx-auto">
  <h2>챕터 1 제목</h2>
  <!-- 교육 콘텐츠 -->
</section>

<section id="ch2" class="section-observe p-8 max-w-4xl mx-auto">
  <!-- 교육 콘텐츠 -->
</section>

<!-- 퀴즈 섹션 (있을 경우) -->
<section id="quiz" class="section-observe p-8 max-w-4xl mx-auto">
  <!-- 퀴즈 콘텐츠 -->
</section>

<!-- 평가 섹션 (있을 경우) -->
<section id="eval" class="section-observe p-8 max-w-4xl mx-auto">
  <!-- 평가 콘텐츠 -->
</section>
```

#### ⚠️ 진행률 추적 규칙

| section id | 기록 여부 | 비고 |
|------------|----------|------|
| `ch1` ~ `ch99` | ✅ 기록됨 | 정규식 `/^(ch\d+|quiz|eval)$/` |
| `quiz` | ✅ 기록됨 | |
| `eval` | ✅ 기록됨 | |
| 기타 id | ❌ 기록 안 됨 | section-observe 클래스 있어도 무시 |

> **중요**: `class="section-observe"` + `id="ch1"` 두 속성이 모두 있어야 진행률이 기록됩니다.
> 사용자가 해당 섹션을 **75% 이상 스크롤하여 노출**시키면 완료로 기록됩니다.

#### quiz / eval section 취급 방침

> **결정**: `quiz`와 `eval` section은 **완료 조건에 포함하지 않는다** (bonus 취급)

| 구분 | 추천 설정 |
|------|----------|
| `chapterIds` | `ch1`~`ch{N}` 만 포함 (`quiz`, `eval` 제외) |
| `chapters` | `ch` 계열 section 수만 카운트 (`quiz`, `eval` 제외) |

**이유**: quiz/eval을 완료 조건에 넣으면 사용자가 ch1~chN을 모두 이수해도 완료 처리가 안 되는 문제가 발생합니다.

**올바른 예시**:
```html
<!-- HTML: ch1~ch3 + quiz = 4개 section-observe -->
<section id="ch1" class="section-observe">...</section>
<section id="ch2" class="section-observe">...</section>
<section id="ch3" class="section-observe">...</section>
<section id="quiz" class="section-observe">...</section>
```
```json
// edu-meta.json: quiz 제외, chapters = 3
{
  "chapters": 3,
  "chapterIds": ["ch1", "ch2", "ch3"]
}
```

#### `chapters` 값과 HTML section 수 일치 규칙

> **핵심 규칙**: `chapters` 값 = HTML에서 `ch` 계열만 카운트한 값

```
chapters = HTML의 <section id="chN" class="section-observe"> 개수
```

**검증 방법** (새 페이지 작성 후 반드시 실행):
```python
import re
with open('public/edu/t????-???-???.html', 'r', encoding='utf-8') as f:
    html = f.read()
sections = re.findall(r'<section\b([^>]*)>', html, re.IGNORECASE)
ch_ids = [re.search(r'id=["\']([^"\']+)["\']', a).group(1)
          for a in sections
          if 'section-observe' in a and re.search(r'id=["\']([^"\']+)["\']', a)]
print("section-observe id 목록:", ch_ids)
print("chapters 권장값:", len([i for i in ch_ids if re.match(r'^ch\d+$', i)]))
```

---

### 1-5. `</body>` 직전 필수 스크립트 (순서 고정)

```html
  <!-- 브레드크럼 (선택, 있으면 좋음) -->
  <script src="/edu/breadcrumb.js"></script>
  <!-- 그래픽 설명 페이지 이동 버튼 자동 삽입 -->
  <script src="/edu/graphic-link.js"></script>
  <!-- 진행률 추적기 (반드시 마지막) -->
  <script src="/edu/progress-tracker.js"></script>
</body>
```

> `graphic-link.js`는 `data-technique-id` 속성을 읽어 `/edu/graphic/:id` 링크 섹션을 자동으로 페이지 하단에 삽입합니다.
> `progress-tracker.js`는 IntersectionObserver로 section-observe 요소를 감지하여 Supabase에 진행률을 기록합니다.

---

## 2. `edu-meta.json` 스키마

위치: `src/data/edu-meta.json`
구조: `{ "pages": { "T1078.002": { ... }, ... } }`

### 2-1. 전체 필드 정의

```jsonc
{
  "pages": {
    "T1078.002": {
      // ── 기본 식별자 ──
      "techniqueId": "T1078",           // 상위 기법 ID (점 없음)
      "subTechniqueId": "T1078.002",    // 현재 기법 ID

      // ── 제목 (다국어) ──
      "title": "한국어 제목",
      "titleEn": "English Title",

      // ── 메타데이터 ──
      "difficulty": "beginner",         // "beginner" | "intermediate" | "advanced"
      "tacticIds": ["t3", "t5"],        // Supabase tactics 테이블의 ID 참조
      "tags": ["Active Directory", "Kerberoasting"],
      "miniLabs": 3,
      "quizzes": 1,
      "estimatedMinutes": 30,

      // ── 기존 호환 필드 (levels 구조 없을 경우 폴백) ──
      "chapters": 3,                    // 전체 챕터 수 (fallback)
      "url": "/edu/t1078-002-domain-accounts.html",  // beginner URL (fallback)
      "chapterTitles": ["ch1 제목", "ch2 제목"],

      // ── 레벨별 구조 ──
      "levels": {
        // 사용 안 하는 레벨은 생략 가능
        "novice": {
          "url": "/edu/t1078-002-domain-accounts-novice.html",
          "chapters": 2,
          "estimatedMinutes": 10,
          "chapterIds": ["ch1", "ch2"],
          "chapterTitles": ["ch1 제목", "ch2 제목"]
        },
        "beginner": {
          "url": "/edu/t1078-002-domain-accounts.html",
          "chapters": 3,
          "estimatedMinutes": 15,
          "chapterIds": ["ch1", "ch2", "ch3"],
          "chapterTitles": ["ch1 제목", "ch2 제목", "ch3 제목"]
        },
        "intermediate": {
          "url": "/edu/t1078-002-domain-accounts-intermediate.html",
          "chapters": 3,
          "estimatedMinutes": 30,
          "chapterIds": ["ch1", "ch2", "ch3"],
          "chapterTitles": ["ch1 제목", "ch2 제목", "ch3 제목"]
        },
        "advanced": {
          "url": "/edu/t1078-002-domain-accounts-advanced.html",
          "chapters": 3,
          "estimatedMinutes": 40,
          "chapterIds": ["ch1", "ch2", "ch3"],
          "chapterTitles": ["ch1 제목", "ch2 제목", "ch3 제목"]
        },
        "expert": {
          "url": "/edu/t1078-002-domain-accounts-expert.html",
          "chapters": 3,
          "estimatedMinutes": 60,
          "chapterIds": ["ch1", "ch2", "eval"],
          "chapterTitles": ["ch1 제목", "ch2 제목", "최종 평가"]
        }
      }
    }
  }
}
```

### 2-2. 필드별 핵심 규칙

| 필드 | 규칙 |
|------|------|
| `levels.*.url` | 있어야 레벨이 CourseSelector에 표시됨 (없으면 레벨 잠금 건너뜀) |
| `levels.*.chapters` | HTML에서 실제로 추적 가능한 section id 수와 일치해야 함 |
| `levels.*.chapterIds` | HTML의 `section#id`와 반드시 동일한 값 사용 |
| `chapterIds` 값 | `ch1`~`ch99`, `quiz`, `eval` 형식 (접두사 없이) |

### 2-3. 레벨 잠금 해제 로직

```
novice → 항상 해금
beginner → novice에 url이 없거나 novice 완료 시 해금
intermediate → beginner에 url이 없거나 beginner 완료 시 해금
advanced → intermediate에 url이 없거나 intermediate 완료 시 해금
expert → advanced에 url이 없거나 advanced 완료 시 해금
```

> **완료 조건**: `progress[techniqueId][level].length >= levels[level].chapters`
> 즉, 실제 기록된 chapter id 수 ≥ `chapters` 필드 값

---

## 3. `lab-scenarios` JSON 스키마

위치: `src/data/lab-scenarios/{TECHNIQUE_ID}.json`
예시: `src/data/lab-scenarios/T1078.002.json`

### 3-1. 전체 필드 정의

```jsonc
{
  "id": "T1003.001",               // MITRE 기법 ID (대문자)
  "title": "한국어 시뮬레이션 제목",
  "titleEn": "English Simulation Title",
  "duration": 10,                  // 예상 소요 시간 (분)
  "stepDuration": 8,               // 각 스텝 자동 진행 시간 (초, 기본 8)

  // ── 공격 단계 탭 ──
  "phases": [
    { "label": "정찰", "labelEn": "Recon" },
    { "label": "공격", "labelEn": "Attack" },
    { "label": "침투", "labelEn": "Breach" },
    { "label": "완료", "labelEn": "Complete" }
  ],

  // ── 토폴로지 다이어그램 ──
  "topoNodes": [
    { "id": "attacker", "label": "Attacker", "type": "attacker" },
    { "id": "target",   "label": "Target PC", "type": "victim" },
    { "id": "dc",       "label": "Domain Controller", "type": "server" },
    { "id": "edr",      "label": "EDR / SIEM", "type": "defense" }
  ],
  "topoEdges": [
    { "from": "attacker", "to": "target", "label": "Elevated Shell", "activeStep": 0 }
  ],

  // ── 해커 바탕화면 아이콘 ──
  "desktopIcons": [
    { "label": "Mimikatz", "icon": "🔑" }
  ],

  // ── 프로세스 트리 ──
  "processTree": [
    { "name": "lsass.exe (PID: 684, SYSTEM)", "depth": 0, "alert": false, "minStep": 0 },
    { "name": "mimikatz.exe (PID: 5500)",      "depth": 2, "alert": true,  "minStep": 1 }
  ],

  // ── 시뮬레이션 단계 ──
  "steps": [...]
}
```

### 3-2. `steps[]` 각 항목 필드

```jsonc
{
  // ── 해커 터미널 ──
  "cmd": "tasklist /FI \"IMAGENAME eq lsass.exe\"",   // 명령어 (터미널에 표시)
  "out": "lsass.exe   684   ...",                      // 명령어 출력 결과

  // ── 방어자 SOC ──
  "def": "[EDR] LSASS process enumeration",            // SOC 알림 한 줄
  "defAction": "Process: tasklist.exe\nRisk: Medium",  // SOC 대응 액션 (멀티라인)
  "defTooltip": "Sysmon Event ID 1에서 탐지하세요.",   // 방어자 힌트 (한국어)
  "defTooltipEn": "Detect via Sysmon Event ID 1.",     // 방어자 힌트 (영어)

  // ── 단계 제목 ──
  "stepTitle": "LSASS PID 확인",
  "stepTitleEn": "Find LSASS PID",

  // ── 설명 (3가지 깊이) ──
  "desc": "초급 설명 (한국어, 2-3줄)",
  "descEn": "초급 설명 (English)",
  "feynman": "초등학생도 이해하는 비유 설명 (한국어)",
  "feynmanEn": "Feynman-style analogy (English)",
  "expert": "전문가 심층 기술 설명 (한국어, 기술 용어 포함)",
  "expertEn": "Expert-level technical explanation (English)",

  // ── 해커 로그 패널 ──
  "hackerLog": {
    "title": "LSASS 프로세스 탐색",
    "lines": [
      { "text": "tasklist /FI IMAGENAME eq lsass.exe", "desc": "LSASS PID 검색" },
      { "text": "lsass.exe  PID: 684",                 "desc": "PID 확인" }
    ]
  },

  // ── 용어 사전 ──
  "terms": [
    { "term": "LSASS",      "desc": "Local Security Authority Subsystem Service" },
    { "term": "PID",        "desc": "Process ID — 프로세스 고유 번호" }
  ]
}
```

#### 동적 치환 변수 (`{변수명}` 형태)

| 변수 | 의미 | 사용 위치 |
|------|------|----------|
| `{userName}` | 사용자가 설정 화면에서 입력한 이름 | `out`, `def`, `defAction` |
| `{companyName}` | 사용자가 설정 화면에서 입력한 회사명 | `out`, `def`, `defAction` |

---

## 4. 교육 플로우 전체 흐름

```
[교육 HTML] → (graphic-link.js 버튼) → [GraphicExplanationPage] → [ScenarioExplanationPage] → [DesktopLab]
    ↓                                           ↓                           ↓                      ↓
progress-tracker.js                      /edu/graphic/:id           /edu/scenario/:id      /lab/desktop/:id
Supabase edu_progress 기록              Auth Gate 포함              Auth Gate 포함         Auth Gate 포함
```

### 레벨별 교육 HTML → CourseSelector 잠금 해제 흐름

```
CourseSelector (/edu/:id)
├── novice 카드: 항상 해금 (url이 있을 경우)
├── beginner 카드: novice 완료 시 해금 (novice url 없으면 기본 해금)
├── intermediate 카드: beginner 완료 시 해금
├── advanced 카드: intermediate 완료 시 해금
└── expert 카드: advanced 완료 시 해금

완료 판단: progress[id][level].length >= meta.levels[level].chapters
          (실제 기록된 section 수 ≥ edu-meta.json의 chapters 값)
```

---

## 5. 새 교육 페이지 추가 체크리스트

```
□ 1. HTML 파일 생성
     - 파일명: t{id소문자}-{level}.html (beginner는 접미사 생략)
     - <html data-technique-id="T?.???" data-level="beginner"> 설정
     - 동적 콘텐츠 로더의 page_id 설정 (파일명에서 .html 제거)
     - section id: ch1, ch2, ... (class="section-observe" 필수)
     - quiz/eval section 있으면 id="quiz" / id="eval" 설정
     - </body> 직전에 graphic-link.js, progress-tracker.js 삽입

□ 2. edu-meta.json 수정
     - pages 객체에 새 기법 ID 키 추가
     - levels.{level}.url: 실제 HTML 파일 경로 (예: "/edu/t1234-567.html")
     - levels.{level}.chapters: HTML의 추적 가능 section 수와 일치
     - levels.{level}.chapterIds: HTML의 section#id 값들과 정확히 일치

□ 3. lab-scenarios JSON 생성 (실습 랩이 있을 경우)
     - 파일명: src/data/lab-scenarios/{TECHNIQUE_ID}.json
     - steps[] 배열: 최소 5개 이상 권장
     - 각 step에 cmd, out, def, defAction, desc, descEn 필수

□ 4. DesktopLab.jsx의 SCENARIO_LOADERS 추가
     - 파일: src/pages/lab/DesktopLab.jsx
     - 예: 'T1234.567': () => import('../../data/lab-scenarios/T1234.567.json')

□ 5. 빌드 검증
     - npm run build → 성공 확인
```

---

## 6. 주요 파일 위치 요약

| 파일 | 위치 | 용도 |
|------|------|------|
| 교육 HTML | `public/edu/*.html` | 교육 콘텐츠 (SPA 외부) |
| edu-meta.json | `src/data/edu-meta.json` | 레벨/챕터 메타데이터 |
| lab-scenarios | `src/data/lab-scenarios/T???.json` | 실습 시뮬레이션 데이터 |
| progress-tracker.js | `public/edu/progress-tracker.js` | 진행률 기록 (모든 HTML 공유) |
| graphic-link.js | `public/edu/graphic-link.js` | 그래픽 설명 이동 버튼 (모든 HTML 공유) |
| breadcrumb.js | `public/edu/breadcrumb.js` | 브레드크럼 UI (모든 HTML 공유) |
| GraphicExplanationPage | `src/pages/GraphicExplanationPage.jsx` | `/edu/graphic/:id` React 페이지 |
| ScenarioExplanationPage | `src/pages/ScenarioExplanationPage.jsx` | `/edu/scenario/:id` React 페이지 |
| DesktopLab | `src/pages/lab/DesktopLab.jsx` | `/lab/desktop/:id` React 페이지 |
| useEduProgress | `src/hooks/useEduProgress.js` | 진행률 조회 훅 (읽기 전용) |

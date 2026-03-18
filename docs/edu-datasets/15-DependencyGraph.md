# 15. Dependency Graph (DAG) - 교육 시스템 의존성 그래프

## 1. 페이지 간 네비게이션 DAG (User Flow)

```mermaid
graph TD
    subgraph "비로그인 진입"
        HERO["/ (IntroMatrix)<br/>히어로 + 매트릭스"]
        LT["/level-test<br/>적응형 7문제 퀴즈"]
        SIGNUP["/signup?level=X"]
        LOGIN["/login"]
    end

    subgraph "학습 경로 분기"
        LP["/learning-path<br/>추천 vs 자율"]
        BASICS["/basics<br/>IT 기초"]
        RC["/recommended/:id<br/>4단계 로드맵"]
    end

    subgraph "교육 파이프라인 (per technique)"
        CS["/edu/:id<br/>CourseSelector 5레벨"]
        HTML["public/edu/*.html<br/>외부 HTML 203개"]
        GRAPHIC["/edu/graphic/:id/:level<br/>시네마틱 그래픽"]
        SCENARIO["/edu/scenario/:id/:level<br/>인터랙티브 시나리오"]
        LAB["/lab/desktop/:id/:level<br/>해커/방어자 시뮬레이션"]
        COMPLETE["/lab/complete/:id<br/>수료 화면"]
    end

    subgraph "특수 경로"
        GUIDED["/guided/:id<br/>유도 학습 14챕터"]
        LABT1078["/lab/t1078<br/>T1078 전용 랩"]
    end

    %% 비로그인 흐름
    HERO -->|"CTA 클릭"| LT
    LT -->|"완료 → signup"| SIGNUP
    SIGNUP -->|"가입 완료"| LOGIN
    LOGIN -->|"beginner/junior"| LP
    LOGIN -->|"intermediate+"| HERO

    %% 학습 경로
    LP -->|"추천 학습"| RC
    LP -->|"자율: IT기초"| BASICS
    LP -->|"자율: Full Matrix"| HERO
    RC -->|"테크닉 선택"| CS

    %% 매트릭스 → 코스
    HERO -->|"기법 클릭 (로그인)"| CS

    %% 교육 파이프라인
    CS -->|"window.location.href<br/>(SPA 밖)"| HTML
    HTML -->|"graphic-link.js"| GRAPHIC
    GRAPHIC -->|"navigate"| SCENARIO
    SCENARIO -->|"navigate"| LAB
    LAB -->|"완료"| COMPLETE

    %% 특수 경로
    RC -->|"T1566.001만"| GUIDED
    LAB -->|"T1078.002"| LABT1078
    LABT1078 --> COMPLETE

    %% 복귀
    COMPLETE -->|"과정으로"| CS
    COMPLETE -->|"매트릭스로"| HERO

    style HERO fill:#fef3c7,stroke:#f59e0b,color:#000
    style LT fill:#dbeafe,stroke:#3b82f6,color:#000
    style CS fill:#e0e7ff,stroke:#6366f1,color:#000
    style HTML fill:#fce7f3,stroke:#ec4899,color:#000
    style GRAPHIC fill:#d1fae5,stroke:#10b981,color:#000
    style SCENARIO fill:#ede9fe,stroke:#8b5cf6,color:#000
    style LAB fill:#fee2e2,stroke:#ef4444,color:#000
    style COMPLETE fill:#f0fdf4,stroke:#22c55e,color:#000
    style GUIDED fill:#cffafe,stroke:#06b6d4,color:#000
```

---

## 2. 데이터 의존성 DAG (Data Flow)

```mermaid
graph LR
    subgraph "Supabase Tables"
        DB_PROF["profiles<br/>(user, role, level, name)"]
        DB_EDU["edu_progress<br/>(user_id, tech_id, ch_id, level)"]
        DB_TACT["tactics + techniques<br/>(매트릭스 구조)"]
        DB_LTQ["level_test_questions<br/>(100문제, 5레벨)"]
        DB_ANN["announcements"]
        DB_WIKI["wiki_terms"]
    end

    subgraph "Static JSON"
        JSON_META["edu-meta.json<br/>(150+ 테크닉 메타)"]
        JSON_FALLBACK["matrix-fallback.json<br/>(Supabase 실패 폴백)"]
        JSON_LAB["lab-scenarios/*.json<br/>(186개 시뮬레이션)"]
        JSON_BASICS["basics-categories.js<br/>(IT 기초 카드)"]
    end

    subgraph "Dynamic JSX"
        JSX_GRAPHIC["graphic-contents/*.jsx<br/>(슬라이드+자막)"]
        JSX_SCENARIO["scenario-contents/*.jsx<br/>(인터랙티브 게임)"]
        JSX_GUIDED["guided-chapters/*.js<br/>(14챕터 콘텐츠)"]
    end

    subgraph "Server-Only"
        SRV_QUESTIONS["server-data/<br/>level-test-questions.json"]
        SRV_API_Q["GET /api/level-test/questions"]
        SRV_API_C["POST /api/level-test/check"]
    end

    subgraph "localStorage"
        LS_PROGRESS["gotroot_edu_progress"]
        LS_LABS["gotroot_completed_labs"]
        LS_GUIDED["gotroot_guided_progress"]
        LS_LANG["gotroot_lang"]
        LS_THEME["gotroot_theme"]
    end

    subgraph "Hooks"
        H_AUTH["useAuth()<br/>(user, isAdmin, isLoggedIn)"]
        H_EDU["useEduProgress()<br/>(getProgress, isUnlocked)"]
        H_MATRIX["useMatrixData()<br/>(tactics, techniques)"]
    end

    subgraph "Pages"
        P_HERO["IntroMatrix"]
        P_LT["LevelTest"]
        P_CS["CourseSelector"]
        P_GP["GraphicExplanation"]
        P_SP["ScenarioExplanation"]
        P_LAB["DesktopLab → GenericLab"]
        P_RC["RecommendedCourse"]
        P_LP["LearningPathChoice"]
        P_GL["GuidedLearning"]
        P_BP["BasicsPage"]
        P_HTML["edu/*.html"]
    end

    %% Supabase → Hooks
    DB_PROF --> H_AUTH
    DB_EDU --> H_EDU
    DB_TACT --> H_MATRIX
    DB_LTQ --> SRV_API_Q

    %% Static → Hooks/Pages
    JSON_META --> H_EDU
    JSON_META --> P_CS
    JSON_META --> P_LP
    JSON_META --> P_RC
    JSON_FALLBACK --> H_MATRIX
    JSON_FALLBACK --> P_LP

    %% Server → Pages
    SRV_QUESTIONS --> SRV_API_Q
    SRV_API_Q --> P_LT
    SRV_API_C --> P_LT

    %% Hooks → Pages
    H_AUTH --> P_HERO
    H_AUTH --> P_CS
    H_AUTH --> P_RC
    H_AUTH --> P_LP
    H_AUTH --> P_LAB
    H_AUTH --> P_GP
    H_AUTH --> P_SP
    H_AUTH --> P_GL
    H_AUTH --> P_BP

    H_EDU --> P_CS
    H_EDU --> P_HERO
    H_EDU --> P_RC

    H_MATRIX --> P_HERO

    %% Dynamic JSX → Pages
    JSX_GRAPHIC --> P_GP
    JSX_SCENARIO --> P_SP
    JSX_GUIDED --> P_GL
    JSON_LAB --> P_LAB
    JSON_BASICS --> P_BP

    %% localStorage ↔ Pages
    LS_PROGRESS <--> P_HTML
    LS_PROGRESS --> H_EDU
    LS_LABS <--> P_LAB
    LS_GUIDED <--> P_GL
    LS_LANG --> P_LT
    LS_LANG --> P_GP
    LS_THEME --> P_GP

    %% HTML 쓰기
    P_HTML -->|"progress-tracker.js"| DB_EDU
    P_HTML -->|"progress-tracker.js"| LS_PROGRESS
    P_LAB -->|"완료 시"| DB_EDU
    P_LAB -->|"완료 시"| LS_LABS

    style DB_PROF fill:#fef3c7,stroke:#f59e0b
    style DB_EDU fill:#fef3c7,stroke:#f59e0b
    style DB_TACT fill:#fef3c7,stroke:#f59e0b
    style DB_LTQ fill:#fef3c7,stroke:#f59e0b
    style SRV_QUESTIONS fill:#fee2e2,stroke:#ef4444
    style SRV_API_Q fill:#fee2e2,stroke:#ef4444
    style SRV_API_C fill:#fee2e2,stroke:#ef4444
```

---

## 3. 컴포넌트 Import 의존성 트리

```mermaid
graph TD
    subgraph "Context"
        CTX_AUTH["AuthContext.jsx<br/>user, isAdmin, isLoggedIn,<br/>loading, logout"]
    end

    subgraph "Hooks"
        HOOK_EDU["useEduProgress.js"]
        HOOK_MATRIX["useMatrixData.js"]
        HOOK_ZOOM["useSimulationZoom.js"]
        HOOK_ANN["useAnnouncements.js"]
    end

    subgraph "API Layer (Phase 0)"
        API_EDU["api/edu.js<br/>getEduProgress()"]
        API_LT["api/levelTest.js<br/>getQuestions()"]
        API_WIKI["api/wiki.js"]
        API_CLIENT["api/_client.js<br/>supabase client"]
    end

    subgraph "Lib"
        LIB_SUPA["lib/supabase.js<br/>createClient()"]
        LIB_I18N["lib/i18n.js"]
        LIB_SANITIZE["lib/sanitize.js<br/>DOMPurify"]
    end

    subgraph "Shared Components"
        COMP_LANG["LangToggle.jsx<br/>getStoredLang()"]
        COMP_LOADING["LoadingScreen.jsx<br/>VerifyingOverlay"]
        COMP_WIKI["WikiFloatingButton"]
    end

    subgraph "Data"
        DATA_META["edu-meta.json"]
        DATA_FALLBACK["matrix-fallback.json"]
        DATA_LTQ["level-test-questions.js<br/>(메타만)"]
    end

    %% Context → Hooks
    CTX_AUTH --> HOOK_EDU
    LIB_SUPA --> CTX_AUTH

    %% API Layer
    API_CLIENT --> API_EDU
    API_CLIENT --> API_LT
    API_CLIENT --> API_WIKI
    LIB_SUPA --> API_CLIENT

    %% Hooks → API
    HOOK_EDU --> API_EDU
    HOOK_MATRIX --> LIB_SUPA

    %% Pages import 관계 (주요만)
    P_LT["LevelTest"] --> CTX_AUTH
    P_LT --> COMP_LANG
    P_LT --> COMP_LOADING
    P_LT --> DATA_LTQ

    P_CS["CourseSelector"] --> CTX_AUTH
    P_CS --> HOOK_EDU
    P_CS --> DATA_META
    P_CS --> COMP_LOADING
    P_CS --> COMP_LANG

    P_HERO["IntroMatrix"] --> CTX_AUTH
    P_HERO --> HOOK_MATRIX
    P_HERO --> HOOK_EDU
    P_HERO --> DATA_META
    P_HERO --> COMP_LANG

    P_RC["RecommendedCourse"] --> CTX_AUTH
    P_RC --> HOOK_EDU
    P_RC --> DATA_META
    P_RC --> COMP_LOADING

    P_LP["LearningPathChoice"] --> CTX_AUTH
    P_LP --> DATA_META
    P_LP --> DATA_FALLBACK

    P_GP["GraphicExplanation"] --> CTX_AUTH
    P_GP --> COMP_LANG

    P_LAB["DesktopLab/GenericLab"] --> CTX_AUTH
    P_LAB --> HOOK_ZOOM
    P_LAB --> LIB_SUPA

    P_GL["GuidedLearning"] --> CTX_AUTH

    style CTX_AUTH fill:#fef3c7,stroke:#f59e0b
    style API_CLIENT fill:#e0e7ff,stroke:#6366f1
    style LIB_SUPA fill:#fee2e2,stroke:#ef4444
    style COMP_LOADING fill:#d1fae5,stroke:#10b981
```

---

## 4. 쓰기 경로 DAG (Write Operations)

```mermaid
graph LR
    subgraph "Writers"
        W_PT["progress-tracker.js<br/>(edu HTML 내부)"]
        W_LAB["GenericLabSimulator<br/>(시뮬레이션 완료)"]
        W_GL["GuidedLearning<br/>(챕터 완료)"]
        W_LT["LevelTest → Signup<br/>(레벨 결정)"]
        W_ADMIN["AdminPage 탭들<br/>(관리자)"]
    end

    subgraph "Supabase"
        T_EDU["edu_progress"]
        T_PROF["profiles.level"]
        T_TACT["tactics / techniques"]
        T_ANN["announcements"]
        T_LTQ["level_test_questions"]
        T_WIKI["wiki_terms"]
        T_AUDIT["audit_logs"]
    end

    subgraph "localStorage"
        L_EDU["gotroot_edu_progress"]
        L_LABS["gotroot_completed_labs"]
        L_GUIDED["gotroot_guided_progress"]
    end

    W_PT -->|"UPSERT"| T_EDU
    W_PT -->|"동시 저장"| L_EDU
    W_LAB -->|"UPSERT (lab_completed)"| T_EDU
    W_LAB -->|"push"| L_LABS
    W_GL -->|"localStorage만"| L_GUIDED
    W_LT -->|"signup 시 UPDATE"| T_PROF

    W_ADMIN -->|"CRUD"| T_TACT
    W_ADMIN -->|"CRUD"| T_ANN
    W_ADMIN -->|"CRUD"| T_LTQ
    W_ADMIN -->|"CRUD"| T_WIKI
    W_ADMIN -->|"자동 INSERT"| T_AUDIT

    style W_PT fill:#fce7f3,stroke:#ec4899
    style W_LAB fill:#fee2e2,stroke:#ef4444
    style W_ADMIN fill:#fef3c7,stroke:#f59e0b
    style T_EDU fill:#dbeafe,stroke:#3b82f6
    style L_EDU fill:#d1fae5,stroke:#10b981
```

---

## 5. 인증 게이트 맵

```mermaid
graph TD
    subgraph "No Auth Required"
        NA1["/ (IntroMatrix) — 매트릭스는 차단 오버레이"]
        NA2["/level-test"]
        NA3["/login"]
        NA4["/signup"]
        NA5["/announcements"]
        NA6["/community"]
        NA7["/lab/complete/:id"]
    end

    subgraph "Auth Required (redirect to /login)"
        A1["/edu/:id → CourseSelector"]
        A2["/edu/graphic/:id/:level"]
        A3["/edu/scenario/:id/:level"]
        A4["/lab/desktop/:id/:level"]
        A5["/recommended/:id"]
        A6["/learning-path"]
        A7["/guided/:id"]
        A8["/basics"]
        A9["/mypage"]
    end

    subgraph "Admin Required (AdminGuard)"
        AD1["/admin"]
    end

    subgraph "Server JWT Auth"
        SRV1["/edu/*.html — Express 미들웨어"]
        SRV2["/airoot/* — Express JWT"]
    end

    LOGIN["/login"] -->|"beginner/junior"| A6
    LOGIN -->|"intermediate+"| NA1

    style NA1 fill:#d1fae5,stroke:#10b981
    style NA2 fill:#d1fae5,stroke:#10b981
    style A1 fill:#dbeafe,stroke:#3b82f6
    style AD1 fill:#fee2e2,stroke:#ef4444
    style SRV1 fill:#fef3c7,stroke:#f59e0b
```

---

## 6. JSON 요약 (프로그래밍적 분석용)

```json
{
  "nodes": {
    "pages": [
      { "id": "IntroMatrix",           "route": "/",                            "auth": false, "reads": ["useMatrixData", "useEduProgress", "edu-meta.json"], "writes": [] },
      { "id": "LevelTest",             "route": "/level-test",                  "auth": false, "reads": ["server-api:questions", "level-test-questions.js"], "writes": ["server-api:check", "sessionStorage"] },
      { "id": "LearningPathChoice",    "route": "/learning-path",               "auth": true,  "reads": ["edu-meta.json", "matrix-fallback.json"], "writes": [] },
      { "id": "CourseSelector",        "route": "/edu/:techniqueId",            "auth": true,  "reads": ["useEduProgress", "edu-meta.json"], "writes": [] },
      { "id": "EduHTML",               "route": "/edu/*.html",                  "auth": "server-jwt", "reads": [], "writes": ["edu_progress", "localStorage:edu_progress"] },
      { "id": "GraphicExplanation",    "route": "/edu/graphic/:id/:level",      "auth": true,  "reads": ["graphic-contents/*.jsx"], "writes": [] },
      { "id": "ScenarioExplanation",   "route": "/edu/scenario/:id/:level",     "auth": true,  "reads": ["scenario-contents/*.jsx", "profiles.name"], "writes": [] },
      { "id": "DesktopLab",            "route": "/lab/desktop/:id/:level",      "auth": true,  "reads": ["lab-scenarios/*.json", "profiles.name"], "writes": ["edu_progress:lab_completed", "localStorage:completed_labs"] },
      { "id": "LabCompletion",         "route": "/lab/complete/:id",            "auth": false, "reads": ["location.state"], "writes": ["localStorage:completed_labs"] },
      { "id": "RecommendedCourse",     "route": "/recommended/:id",             "auth": true,  "reads": ["useEduProgress", "edu-meta.json"], "writes": [] },
      { "id": "GuidedLearning",        "route": "/guided/:id",                  "auth": true,  "reads": ["guided-chapters/*.js"], "writes": ["localStorage:guided_progress"] },
      { "id": "BasicsPage",            "route": "/basics",                      "auth": true,  "reads": ["basics-categories.js"], "writes": [] }
    ],
    "data_sources": [
      { "id": "edu-meta.json",              "type": "static-json",   "location": "src/data/", "consumers": ["CourseSelector", "IntroMatrix", "LearningPathChoice", "RecommendedCourse", "useEduProgress"] },
      { "id": "matrix-fallback.json",       "type": "static-json",   "location": "src/data/", "consumers": ["useMatrixData", "LearningPathChoice"] },
      { "id": "lab-scenarios/*.json",       "type": "static-json",   "location": "src/data/lab-scenarios/", "count": 186, "consumers": ["DesktopLab"] },
      { "id": "graphic-contents/*.jsx",     "type": "dynamic-jsx",   "location": "src/data/graphic-contents/", "count": 1, "consumers": ["GraphicExplanation"] },
      { "id": "scenario-contents/*.jsx",    "type": "dynamic-jsx",   "location": "src/data/scenario-contents/", "count": 1, "consumers": ["ScenarioExplanation"] },
      { "id": "guided-chapters/*.js",       "type": "dynamic-js",    "location": "src/data/guided-chapters/", "count": 1, "consumers": ["GuidedLearning"] },
      { "id": "basics-categories.js",       "type": "static-js",     "location": "src/data/", "consumers": ["BasicsPage"] },
      { "id": "level-test-questions.js",    "type": "static-js",     "location": "src/data/", "note": "UI meta only, no questions", "consumers": ["LevelTest"] },
      { "id": "server-data/questions.json", "type": "server-only",   "location": "server-data/", "consumers": ["server-api:questions", "server-api:check"] }
    ],
    "supabase_tables": [
      { "id": "edu_progress",          "readers": ["useEduProgress"], "writers": ["progress-tracker.js", "GenericLabSimulator"] },
      { "id": "profiles",              "readers": ["AuthContext", "GenericLabSimulator", "ScenarioExplanation"], "writers": ["Signup(level)", "UserManager(role)"] },
      { "id": "tactics",               "readers": ["useMatrixData"], "writers": ["MatrixStructureManager"] },
      { "id": "techniques",            "readers": ["useMatrixData"], "writers": ["MatrixStructureManager"] },
      { "id": "level_test_questions",  "readers": ["server-api"], "writers": ["LevelTestManager(admin)"] },
      { "id": "announcements",         "readers": ["useAnnouncements"], "writers": ["AnnouncementManager"] },
      { "id": "wiki_terms",            "readers": ["useWikiTerms"], "writers": ["WikiTermManager"] }
    ],
    "localStorage_keys": [
      { "id": "gotroot_edu_progress",    "format": "{ [techId]: { [level]: [chIds] } }", "writers": ["progress-tracker.js"], "readers": ["useEduProgress"] },
      { "id": "gotroot_completed_labs",  "format": "[{ name, technique, completedAt }]",  "writers": ["GenericLabSimulator", "LabCompletion"], "readers": ["MyPage"] },
      { "id": "gotroot_guided_progress", "format": "{ [techId]: [chapterIndices] }",      "writers": ["GuidedLearning"], "readers": ["GuidedLearning"] },
      { "id": "gotroot_lang",            "format": "string (ko|en|ja|vi|ar)",              "writers": ["LangToggle"], "readers": ["all pages"] },
      { "id": "gotroot_theme",           "format": "string (dark|light)",                  "writers": ["IntroMatrix"], "readers": ["GraphicExplanation", "MyPage"] }
    ]
  },
  "edges": {
    "navigation": [
      ["IntroMatrix", "LevelTest", "CTA 클릭"],
      ["LevelTest", "Signup", "완료 → signup"],
      ["Login", "LearningPathChoice", "beginner/junior"],
      ["Login", "IntroMatrix", "intermediate+"],
      ["LearningPathChoice", "RecommendedCourse", "추천 학습"],
      ["LearningPathChoice", "BasicsPage", "자율: IT기초"],
      ["LearningPathChoice", "IntroMatrix", "자율: Full Matrix"],
      ["RecommendedCourse", "CourseSelector", "테크닉 선택"],
      ["IntroMatrix", "CourseSelector", "기법 클릭"],
      ["CourseSelector", "EduHTML", "window.location.href (SPA 밖)"],
      ["EduHTML", "GraphicExplanation", "graphic-link.js"],
      ["GraphicExplanation", "ScenarioExplanation", "navigate"],
      ["ScenarioExplanation", "DesktopLab", "navigate"],
      ["DesktopLab", "LabCompletion", "완료"],
      ["LabCompletion", "CourseSelector", "과정으로"],
      ["LabCompletion", "IntroMatrix", "매트릭스로"],
      ["RecommendedCourse", "GuidedLearning", "T1566.001만"]
    ],
    "data_reads": [
      ["IntroMatrix", "useMatrixData"],
      ["IntroMatrix", "useEduProgress"],
      ["IntroMatrix", "edu-meta.json"],
      ["CourseSelector", "useEduProgress"],
      ["CourseSelector", "edu-meta.json"],
      ["LevelTest", "server-api:questions"],
      ["LevelTest", "level-test-questions.js"],
      ["LearningPathChoice", "edu-meta.json"],
      ["LearningPathChoice", "matrix-fallback.json"],
      ["RecommendedCourse", "useEduProgress"],
      ["RecommendedCourse", "edu-meta.json"],
      ["GraphicExplanation", "graphic-contents/*.jsx"],
      ["ScenarioExplanation", "scenario-contents/*.jsx"],
      ["DesktopLab", "lab-scenarios/*.json"],
      ["GuidedLearning", "guided-chapters/*.js"],
      ["BasicsPage", "basics-categories.js"]
    ],
    "data_writes": [
      ["EduHTML", "edu_progress", "progress-tracker.js UPSERT"],
      ["EduHTML", "gotroot_edu_progress", "progress-tracker.js localStorage"],
      ["DesktopLab", "edu_progress", "lab_completed UPSERT"],
      ["DesktopLab", "gotroot_completed_labs", "localStorage push"],
      ["GuidedLearning", "gotroot_guided_progress", "localStorage"],
      ["LevelTest", "server-api:check", "서버 채점 요청"],
      ["Signup", "profiles.level", "UPDATE"]
    ]
  }
}
```

---

## 7. 핵심 병목 & 의존성 분석 요약

### Critical Path (학습 완료까지 최장 경로)
```
IntroMatrix → LevelTest → Signup → Login → LearningPathChoice
→ RecommendedCourse → CourseSelector → EduHTML → GraphicExplanation
→ ScenarioExplanation → DesktopLab → LabCompletion
```
**12단계, 6개 데이터 소스, 3개 인증 게이트**

### Single Point of Failure
| 의존성 | 영향 범위 | 폴백 |
|--------|----------|------|
| `edu-meta.json` | CourseSelector, IntroMatrix, LearningPath, Recommended (4개) | 없음 (static import) |
| `useAuth()` | 9개 페이지 (auth gate) | 로그인 리다이렉트 |
| `useEduProgress()` | CourseSelector, IntroMatrix, Recommended (3개) | localStorage 폴백 |
| `useMatrixData()` | IntroMatrix (1개) | matrix-fallback.json |
| `Supabase` | edu_progress 쓰기 | localStorage 이중 저장 |
| `server-data/` | LevelTest 문제 (1개) | Supabase level_test_questions 우선 |

### Circular Dependencies
**없음** — 모든 데이터 흐름이 단방향 DAG.

### SPA ↔ 외부 HTML 경계
```
SPA 영역: React Router (navigate)
    ↕ window.location.href (전체 페이지 이동)
HTML 영역: public/edu/*.html (Express static + JWT)
    ↕ graphic-link.js → SPA route (전체 페이지 이동)

⚠️ 이 경계를 넘을 때마다:
  - React 상태 초기화
  - sessionStorage로 breadcrumb 보존
  - Cookie로 인증 유지
  - localStorage로 진행률 보존
```

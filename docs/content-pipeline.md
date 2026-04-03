# Gotroot Edu — Content Pipeline

> 콘텐츠 파이프라인 전체 구조 (Mermaid 다이어그램 + 재현 가이드)
> SVG 버전: [content-pipeline-diagram.svg](./content-pipeline-diagram.svg)

---

## 1. 파이프라인 전체 흐름 (Mermaid)

```mermaid
flowchart TB
    subgraph SOURCE["🔍 SOURCE LAYER — 콘텐츠 원천"]
        direction LR
        MITRE["🛡️ MITRE ATT&CK<br/>attack.mitre.org<br/>14 Tactics / 200+ Techniques"]
        INCIDENT["🔴 Real-World Incidents<br/>CVE DB / CISA / 뉴스<br/>SolarWinds, Log4Shell..."]
        CLAUDE["🤖 Claude AI (Opus)<br/>콘텐츠 생성 + 코드 작성<br/>7개 언어 번역"]
        TEMPLATE["📐 Template Guides<br/>docs/guides/<br/>파일 구조 · 네이밍 규칙"]
    end

    subgraph CONTENT["📦 CONTENT LAYER — 4종 콘텐츠"]
        direction LR
        EDU["📘 Edu HTML<br/>public/edu/*.html<br/>203 files<br/>10~15 챕터"]
        GRAPHIC["🎬 Graphic JSX<br/>src/data/graphic-contents/<br/>6 files<br/>시네마틱 슬라이드"]
        SCENARIO["🎮 Scenario JSX<br/>src/data/scenario-contents/<br/>6 files<br/>인터랙티브 게임"]
        LAB["🧪 Lab JSON<br/>src/data/lab-scenarios/<br/>191 files<br/>해커/방어자 시뮬레이션"]
    end

    subgraph FLOW["👤 USER JOURNEY — 4단계 학습"]
        direction LR
        S1["Step 1<br/>개념 학습<br/>/edu/:id"]
        S2["Step 2<br/>시각적 이해<br/>/edu/graphic/:id/:level"]
        S3["Step 3<br/>시나리오 체험<br/>/edu/scenario/:id/:level"]
        S4["Step 4<br/>실습 시뮬레이션<br/>/lab/desktop/:id"]
    end

    subgraph REG["⚙️ REGISTRATION — 등록 레이어"]
        META["edu-meta.json<br/>237 techniques"]
        MAPS["Component Maps<br/>GRAPHIC_DATA_LOADERS<br/>SCENARIO_COMPONENTS<br/>SCENARIO_LOADERS"]
        DB["Supabase DB<br/>edu_progress<br/>tactics / techniques"]
    end

    MITRE --> EDU & LAB
    INCIDENT --> GRAPHIC & SCENARIO
    CLAUDE -.->|자동생성| EDU & GRAPHIC & SCENARIO & LAB
    TEMPLATE -.->|구조 가이드| EDU & GRAPHIC & SCENARIO & LAB

    EDU --> S1
    GRAPHIC --> S2
    SCENARIO --> S3
    LAB --> S4

    S1 -->|graphic-link.js| S2
    S2 -->|시나리오 버튼| S3
    S3 -->|실습 시작| S4

    META --> S1
    MAPS --> S2 & S3 & S4
    DB --> S1

    style SOURCE fill:#1e293b,stroke:#3b82f6,color:#f8fafc
    style CONTENT fill:#0f172a,stroke:#f59e0b,color:#f8fafc
    style FLOW fill:#0f172a,stroke:#10b981,color:#f8fafc
    style REG fill:#1a1a2e,stroke:#818cf8,color:#f8fafc
```

## 2. 레벨 시스템

```mermaid
flowchart LR
    N["🟡 Novice<br/>Always Open"]
    B["🟢 Beginner<br/>Novice 완료 시"]
    I["🔵 Intermediate<br/>Beginner 완료 시"]
    A["🔴 Advanced<br/>Intermediate 완료 시"]
    E["⭐ Expert<br/>Advanced 완료 시"]

    N -->|완료| B -->|완료| I -->|완료| A -->|완료| E

    style N fill:#422006,stroke:#f59e0b,color:#fbbf24
    style B fill:#052e16,stroke:#22c55e,color:#4ade80
    style I fill:#172554,stroke:#3b82f6,color:#60a5fa
    style A fill:#450a0a,stroke:#ef4444,color:#f87171
    style E fill:#3b0764,stroke:#a855f7,color:#c084fc
```

## 3. 파일 생성 → 등록 흐름

```mermaid
flowchart TD
    START["🚀 새 기법 콘텐츠 추가"]
    SCRIPT["node scripts/create-technique-content.cjs<br/>T1566.001 beginner"]

    subgraph FILES["생성되는 4종 파일"]
        F1["public/edu/<br/>t1566-001-beginner-ch1.html"]
        F2["src/data/graphic-contents/<br/>T1566.001-beginner.jsx"]
        F3["src/data/scenario-contents/<br/>T1566.001-beginner.jsx"]
        F4["src/data/lab-scenarios/<br/>T1566.001-beginner.json"]
    end

    subgraph REGISTER["수동 등록 (3곳)"]
        R1["GraphicExplanationPage.jsx<br/>GRAPHIC_DATA_LOADERS +<br/>GRAPHIC_COMPONENTS"]
        R2["ScenarioExplanationPage.jsx<br/>SCENARIO_COMPONENTS"]
        R3["DesktopLab.jsx<br/>SCENARIO_LOADERS"]
        R4["edu-meta.json<br/>levels 배열에 추가"]
    end

    VERIFY["npm run build ✅"]
    DEPLOY["git push → Vercel 자동 배포"]

    START --> SCRIPT --> FILES
    F1 --> R4
    F2 --> R1
    F3 --> R2
    F4 --> R3
    REGISTER --> VERIFY --> DEPLOY
```

## 4. 콘텐츠 타입별 상세

### 4-1. Edu HTML (`public/edu/`)
| 항목 | 설명 |
|------|------|
| **목적** | 개념 학습 (텍스트 + 코드 예제 + 퀴즈) |
| **파일명** | `t{id}-{level}-ch{n}.html` |
| **출처** | MITRE ATT&CK 공격 기법 설명 + 실제 CVE 분석 |
| **생성** | Claude AI가 MITRE 데이터 기반으로 10~15챕터 자동 생성 |
| **등록** | `edu-meta.json`의 `levels[].url` |
| **스크립트** | `progress-tracker.js` (챕터 완료 → Supabase upsert) |
| **특이사항** | SPA 외부 (React Router 아님), 서버측 JWT 인증 |

### 4-2. Graphic JSX (`src/data/graphic-contents/`)
| 항목 | 설명 |
|------|------|
| **목적** | 시네마틱 시각화 (1280×720 슬라이드쇼) |
| **파일명** | `{TechniqueId}-{level}.jsx` |
| **출처** | 실제 사고 사례를 시각적 스토리텔링으로 재구성 |
| **생성** | Claude AI가 사고 보고서 기반으로 20슬라이드 생성 |
| **export** | `subtitlesData[]` (자막+타이밍) + `renderSlides(lang)` (JSX) |
| **등록** | `GRAPHIC_DATA_LOADERS` + `GRAPHIC_COMPONENTS` 맵 |
| **특이사항** | CinematicPlayer가 자동재생, 전체화면/F키/가로회전 지원 |

### 4-3. Scenario JSX (`src/data/scenario-contents/`)
| 항목 | 설명 |
|------|------|
| **목적** | 인터랙티브 게임 (Sector 탐색, 증거 분석) |
| **파일명** | `{TechniqueId}-{level}.jsx` |
| **출처** | 실제 공격 시나리오를 게임 형태로 재구성 |
| **생성** | Claude AI가 공격 체인 기반으로 3~5 Sector 게임 생성 |
| **export** | `default` (React 컴포넌트, `language` prop 수신) |
| **등록** | `SCENARIO_COMPONENTS` 맵 (React.lazy) |
| **특이사항** | 수료 보고서 모달, 인벤토리 시스템, 점수 채점 |

### 4-4. Lab JSON (`src/data/lab-scenarios/`)
| 항목 | 설명 |
|------|------|
| **목적** | 실습 시뮬레이션 (해커PC + 방어자SOC) |
| **파일명** | `{TechniqueId}-{level}.json` |
| **출처** | MITRE ATT&CK 절차 + 실제 공격 도구 (nmap, mimikatz 등) |
| **생성** | Claude AI가 공격 절차 기반으로 8~15 step 생성 |
| **구조** | `phases[]`, `steps[]`, `desktopIcons[]`, `processTree[]` |
| **등록** | `SCENARIO_LOADERS` 맵 (dynamic import) |
| **특이사항** | TTS 자동재생, feynman/expert 이중 설명, 다국어 지원 |

---

## 5. 다른 사이트에서 동일 퀄리티 재현하기

> **핵심 원칙**: 이 시스템의 퀄리티는 "구조화된 템플릿 + AI 자동생성 + 체계적 등록"에서 나옵니다.

### Step 1: 도메인 지식 체계 정의

```
새 사이트 주제 (예: 네트워크 보안, 클라우드, 포렌식)
  ↓
공인 프레임워크 선정 (MITRE ATT&CK 같은 것)
  ↓
기법/카테고리 목록화 (= Technique ID 역할)
  ↓
레벨 체계 설계 (novice → expert)
```

**이 프로젝트의 경우:**
- 프레임워크: MITRE ATT&CK (attack.mitre.org)
- 카테고리: 14 Tactics → 200+ Techniques → Sub-techniques
- 레벨: 5단계 (novice/beginner/intermediate/advanced/expert)

**다른 사이트 적용 예시:**
| 도메인 | 프레임워크 | 카테고리 |
|--------|-----------|---------|
| 클라우드 보안 | CIS Benchmarks / CSA CCM | 14 Domains → Controls |
| 디지털 포렌식 | NIST SP 800-86 | 4 Phases → Sub-tasks |
| DevSecOps | OWASP SAMM | 5 Functions → 15 Practices |
| AI 보안 | OWASP ML Top 10 | 10 Risks → Attack Vectors |

### Step 2: 4단계 콘텐츠 파이프라인 복제

```
                  새 사이트 구조
                  ═══════════════
   📘 이론 학습     →  HTML 챕터 (개념, 사례, 코드)
   🎬 시각적 이해   →  시네마틱 슬라이드 (JSX/React)
   🎮 시나리오 체험  →  인터랙티브 게임 (JSX/React)
   🧪 실습 시뮬     →  시뮬레이터 (JSON 구조화 데이터)
```

각 단계별 핵심:

| 단계 | 핵심 요소 | 퀄리티 포인트 |
|------|-----------|-------------|
| 이론 | 챕터 분할, 진행률 추적, 잠금 해제 | 10~15챕터로 적절한 분량 유지 |
| 시각화 | 1280×720 고정해상도, 자동재생, 자막 | 실제 사고 기반 스토리텔링 |
| 시나리오 | Sector 기반 탐색, 선택지, 점수 | 몰입감 있는 게임화(Gamification) |
| 실습 | 해커/방어자 이중 뷰, TTS, 단계별 진행 | 실제 명령어 + 파인만 설명 |

### Step 3: Claude AI 활용 콘텐츠 생성 프로세스

```mermaid
flowchart TD
    A["1. 기법 선정<br/>(프레임워크에서 추출)"] --> B["2. 프롬프트 작성<br/>(템플릿 가이드 기반)"]
    B --> C["3. Claude에 콘텐츠 생성 요청"]
    C --> D["4. 생성된 4종 파일 검토"]
    D --> E{"품질 OK?"}
    E -->|Yes| F["5. 등록 + 빌드 검증"]
    E -->|No| G["피드백 후 재생성"]
    G --> C
    F --> H["6. 배포 (Vercel)"]
```

**Claude 프롬프트 핵심 요소:**

1. **컨텍스트**: 해당 기법의 MITRE ATT&CK 설명 전문 + 실제 CVE/사고 사례
2. **템플릿**: `docs/guides/` 가이드 문서를 시스템 프롬프트에 포함
3. **제약**: i18n 구조 필수, export 이름/형태 정확히 지정
4. **퀄리티**: "파인만 설명(5살도 이해할 수 있게)" + "전문가 설명" 이중 계층

**프롬프트 예시 (Lab JSON 생성):**
```
MITRE ATT&CK T1566.001 (Spearphishing Attachment) 기반으로
Lab JSON을 생성해줘.

필수 구조: src/data/lab-scenarios/ JSON 스키마 준수
- 8~12 steps, 4 phases (정찰/침투/실행/탐지)
- 각 step: command + output + feynman(쉬운설명) + expert(전문설명)
- 다국어: ko + en 필수, vi/ar/ja/zh/hi는 null
- 실제 도구: nmap, curl, python, mimikatz 등 실제 명령어 사용
- hackerLog: 터미널에 표시될 실제 커맨드 로그
```

### Step 4: 인프라 구성

```
필수 스택:
├── React + Vite (SPA)
├── Supabase (인증 + DB + RLS)
├── Vercel (호스팅 + Edge Middleware)
├── edu-meta.json (콘텐츠 메타데이터)
└── progress-tracker.js (진행률 추적)

선택 스택:
├── TTS (window.speechSynthesis)
├── Fullscreen API (시네마틱)
├── Screen Orientation API (모바일 가로)
└── ContentProtection (워터마크 + 복사방지)
```

### Step 5: 퀄리티 체크리스트

새 콘텐츠 추가 시 반드시 확인:

- [ ] 5개 레벨 중 해당 레벨 콘텐츠가 적절한 난이도인가?
- [ ] feynman 설명이 비전공자도 이해할 수 있는 수준인가?
- [ ] expert 설명이 실무자에게 유용한 수준인가?
- [ ] 실제 명령어/도구가 정확한가? (가짜 명령어 없음)
- [ ] 다국어 구조가 i18n 가이드를 준수하는가?
- [ ] 시네마틱 슬라이드가 20장 내외인가?
- [ ] 시나리오가 3~5 Sector로 적절히 분할되었는가?
- [ ] Lab step이 8~15개로 과하지 않은가?
- [ ] `npm run build` 성공하는가?

---

## 6. 현재 통계 (2026-04)

| 타입 | 파일 수 | 기법 수 | 완성도 |
|------|---------|---------|--------|
| Edu HTML | 203 | ~40 | ███████░░░ 70% |
| Graphic JSX | 6 | 2 | █░░░░░░░░░ 10% |
| Scenario JSX | 6 | 2 | █░░░░░░░░░ 10% |
| Lab JSON | 191 | ~40 | ███████░░░ 70% |
| **등록 (meta)** | — | **237** | ██████████ 100% |

> Graphic/Scenario는 6개씩으로 아직 초기 단계. Edu HTML과 Lab JSON이 주력 콘텐츠.

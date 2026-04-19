# Claude Code Rules

**GOAL:** Risk mitigation & Clarity.
**LANG:** Output in Korean (except code).

Before writing code, MUST output the following steps using XML tags:

<analysis>
1. PREMISES: [List 3 knowns]
2. UNKNOWNS: [List 3 missing info & how to verify]
3. RISKS: [List 3 major risks]
</analysis>

<plan>
- SIMPLEST_FORM: [Describe]
- COMPLEXITY_REASON: [If complex, justify]
- ROLLBACK_EASE: [Compare options]
- ALTERNATIVES: [List 2 simpler options with verification steps]
- SAFETY_NET: Simplify complex outputs to reduce future maintenance.
</plan>

<scope>
- PURPOSE: [1 sentence]
- SCOPE_CREEP: [Yes/No. If Yes, separate it]
- BOUNDARY: [Define clear limits, e.g., "UI text only, no logic change"]
</scope>

<criteria>
- SUCCESS: [Definition of success]
- DONE_CONDITION: [What to check to finish]
- FAILURE_SIGNS: [Triggers for rollback]
</criteria>

**MANDATORY:** Every final response MUST end with:

### 🔁 Self-Refine
형식: "잘한 점 / 부족한 점 / 다음에 더 잘할 점"

### 🔄 Inverse Prompt
💡 최적 프롬프트 5개 제안

---

## 🎓 교육 콘텐츠 설계 3원칙 (MUST — 체크리스트 준수 의무)

> 사용자 지침 (2026-04-19): 학습 목적 **모든** 콘텐츠에 반드시 적용.
> 적용 대상: APT 스터디 · edu HTML(public/edu/*) · lab-scenarios/*.json · graphic-contents/*.jsx · guided learning · level-test 해설 · scenario-contents · 관리자 수동 작성 콘텐츠 포함 전부.

### 🔒 최상위 경고 — 학습자 UI 노출 금지 (2026-04-19 추가 지침)

- **"연계성 / 연관성 / 연결성" 용어를 학습자에게 절대 노출하지 않는다.**
- 이 3원칙은 **설계하는 Claude·관리자·콘텐츠 작성자의 내부 체크리스트**이다. 학습자 뷰의 라벨·헤더·툴팁·버튼 어디에도 등장 금지.
- 학습자 UI는 자연어로 녹여 표현한다:
  - 연계성 → "💭 잠깐, 앞서 세운 목표와…" / "당신이 기억하는…"
  - 연관성 → "🔎 비슷한 패턴의 다른 사건들" / "📚 같은 계열 사례"
  - 연결성 → "▶ 다음 작전" / "다음 장면 미리보기"
- 관리자(`isAdmin`)에게만 내부 원칙 라벨을 작은 회색 태그로 병기 가능 (선택, 설계 검수용).
- **원칙은 적용만 하고, 용어는 쓰지 않는다.** 사용자 표현 그대로: "연계성 연관성 연결성을 쓰라는게 아니라 교육 시스템을 만들 때 적용하라는 것".

### 3원칙

| 원칙 | 방향 | 핵심 질문 |
|------|:----:|-----------|
| 🔗 **연계성 (Continuity)** | 앞 → 지금 | "지금이 왜 지금인가? 앞과 어떻게 이어지는가?" |
| 🕸️ **연관성 (Relevance)** | 지금 ↔ 옆 | "같은 패턴의 다른 사건/기법 2~3개는?" |
| ▶ **연결성 (Coherence)** | 지금 → 다음 | "다음엔 뭐가 오는가? 지금이 다음을 어떻게 준비시키는가?" |

### ✅ 작성 전 체크리스트 (콘텐츠 기획 단계)
- [ ] 이 콘텐츠가 **앞에서 무엇을 전제**로 하는지 1문장으로 쓸 수 있는가? (선행 챕터·이전 결정·선수 지식)
- [ ] 지금 다루는 개념과 **같은 맥락의 다른 사례 2~5개**를 미리 뽑아 뒀는가? (MITRE 다른 TTP, 유사 사건, 관련 도구)
- [ ] **다음 콘텐츠의 티저 1줄**(다음 제목 + 힌트)을 미리 쓸 수 있는가?
- [ ] 위 3개 중 하나라도 공란이면 **작성 중단 후 플롯 재정비** — 빈 칸인 채로 학습 콘텐츠를 생산하지 않는다

### ✅ 작성 중 체크리스트 (컴포넌트 내부 구조)
- [ ] 데이터 객체에 **3개 필드**를 명시적으로 뒀는가?
  ```js
  {
    continuity: "앞과의 이음새 1문단",
    relevance: [{ label: "T1xxx", note: "..." }, ...],  // 2~5개
    coherence: { nextTitle: "...", nextHint: "..." }
  }
  ```
- [ ] UI에 3원칙 **각각을 시각적으로 구분**해 노출하는가? (색상 border / 아이콘 / 라벨)
  - 🔗 파란 border-l → 연계성
  - 🕸️ 초록 border-l → 연관성
  - ▶ 황색 border-dashed → 연결성
- [ ] 학습자가 3원칙 블록 중 **하나만 봐도 맥락이 이해**되는가? (독립 가독성)

### ✅ 작성 후 체크리스트 (리뷰 단계)
- [ ] "지금이 왜 지금인지" 학습자가 **5초 안에** 답할 수 있는가?
- [ ] "이거 말고 비슷한 게 뭐 있어?" 질문에 **2개 이상 예시**가 콘텐츠 안에 있는가?
- [ ] 다음 콘텐츠로 가는 **기대감/호기심**이 생기는가? (단순 "다음" 버튼이 아니라 티저)
- [ ] 3원칙 중 하나라도 약하면 **해당 블록만 보강** — 전체 재작성보다 점진 개선

### 구현 참조
- `src/pages/apt/study/DensityPreview.jsx` ResultCard `depth='rich'` 블록 → 표준 레이아웃
- 미니멀(A) 모드라도 **연결성(다음 티저) 1줄**은 유지 권장
- 기존 콘텐츠 리팩터 시 3원칙 빈 칸을 먼저 채운 뒤 UI 갱신

### ⚠️ 금지 패턴
- "다음" 버튼만 있고 **다음에 뭐가 오는지 알려주지 않음** → 연결성 위반
- 개념 설명만 있고 **관련 사례·TTP 제로** → 연관성 위반
- 챕터가 독립적이고 **앞과의 맥락 없이 튀어나옴** → 연계성 위반

---

## 공지사항 자동 업데이트 규칙

업데이트 완료 후, `announcements` 테이블에 변경 사항 등록.
- 기술 용어 최소화, 버전 번호 포함 (현재 최신: **v1.3.0**)
- 카테고리: 🆕 새 기능 / 🔧 개선 / 🛡️ 보안 / 🐛 버그 수정

---

## 🔒 보안 체크리스트

```
[✅] V-01: profiles UPDATE role+approved 차단 — 2026-03-16
[✅] V-02: access_logs RLS 관리자만 SELECT — 2026-03-16
[✅] V-03: wiki_terms RLS approved READ + admin WRITE — 2026-03-16
[✅] V-04: announcements RLS approved READ — 2026-03-16
[✅] V-05: feedback_likes RLS 자기 것만 — 2026-03-16
[✅] V-06: 이메일 인증 활성화 — 2026-03-16
[✅] V-07: 회원가입 Rate Limiting — 2026-03-16
[✅] V-08: HSTS — Vercel HTTPS 자동 적용 (2026-03-22)
✅ 전면 보안 패치 완료. 새 테이블 추가 시 RLS 필수 확인.
보안 SQL 전문: docs/security/SECURITY_REPORT.md
```

---

## ⚠️ Claude 작업 시 주의사항

1. **수정 범위 준수**: 사용자가 명시한 파일/범위만 수정. "이 파일들만 수정합니다: [목록]" 먼저 명시
2. **대규모 작업 사전 확인**: 10개+ 파일 영향 시 "약 N개 파일 수정 필요, 진행할까요?" 먼저 물어보기
3. **시각적 수치는 선택지 제시**: opacity/색상 등 임의 조정 금지 → "0.2? 0.3? 0.5?" 옵션 제공
4. **heroPhase 리셋**: `setHeroPhase('entering')` + `localStorage.removeItem('gotroot_intro_seen')` 둘 다 필수
5. **CSS !important 금지**: 인라인 스타일 사용 컴포넌트에서 절대 사용하지 않음
6. **빌드 검증 필수**: 코드 수정 후 `npm run build` 성공 확인
7. **컨텍스트 효율**: 큰 파일은 offset/limit으로 읽기, "스탑" 시 즉시 중단
8. **Worktree .env 동기화**: worktree 생성 시 `.env` 반드시 복사

---

## 프론트엔드 UI 규칙

- 이벤트 핸들러가 상태 변경 함수와 연결되었는지 확인
- 모달 z-index: `z-[100]` 이상, `pointer-events-none` 안의 모달은 `createPortal` 사용
- 상태 관리: Redux/Zustand 등 명시적 요청 없으면 도입 금지, React Hook 우선
- 비동기 데이터: Loading Spinner/Skeleton 필수

---

## 🌐 i18n 가이드 (7개 언어: ko/en/ja/vi/ar/zh/hi)

> 전체 가이드: `docs/guides/i18n-content-guide.md`

### 필수 패턴
```js
// 그래픽/시나리오 공통
const T = { ko: {...}, en: {...}, ja: null, vi: null, ar: null, zh: null, hi: null };
const t = T[language] || T.ko;
```
- 기술 용어 번역 금지: `SMTP / YARA / CVE-xxxx / cat / grep / nmap`
- 랩 JSON: `title/titleEn/titleVi/titleAr` + `desc/descEn/descVi/descAr` 패턴

---

## 📐 프로젝트 구조

### 라우팅 맵
```
/                    → IntroMatrix        (히어로+MITRE 매트릭스)
/login, /signup      → Login, Signup
/mypage              → MyPage
/admin               → AdminPage          (AdminGuard: isAdmin 필수)
/announcements       → Announcements
/community           → CommunityPage
/edu/:techniqueId    → CourseSelector      (Auth Gate)
/edu/graphic/:techniqueId/:level  → GraphicExplanationPage (Auth Gate)
/edu/scenario/:techniqueId/:level → ScenarioExplanationPage (Auth Gate)
/lab/desktop/:techniqueId/:level  → DesktopLab         (Auth Gate)
/lab/t1078           → LabT1078
/lab/complete/:techniqueId → LabCompletionPage
/level-test          → LevelTest
/learning-path       → LearningPathChoice
/recommended/:techniqueId → RecommendedCoursePage
/guided/:techniqueId → GuidedLearning
/basics              → BasicsPage
```
- 모든 컴포넌트 `lazy()`, Suspense fallback
- 감싸기: AuthProvider > BrowserRouter > PageTracker(GA4) > SessionWarningToast > WikiFloatingButton > Suspense
- 세션타임아웃: 10분 비활동 → 자동 로그아웃

### 핵심 데이터 흐름
```
edu_progress 쓰기: public/edu/progress-tracker.js (SPA 밖!)
edu_progress 읽기: useEduProgress (CourseSelector, IntroMatrix)
tactics/techniques: useMatrixData → Supabase (실패 시 matrix-fallback.json)
랩 완료: edu_progress.upsert + localStorage['gotroot_completed_labs'] 이중 저장
레벨테스트: Vercel Serverless 채점 (POST /api/level-test/check)
```

### 관리자 탭 (11개)
```
edu → EduFormManager | matrix → MatrixStructureManager | announce → AnnouncementManager
users → UserManager  | lab → EduHtmlEditor            | labscenario → LabScenarioManager
wiki → WikiTermManager | leveltest → LevelTestManager  | stats → EduProgressStats
accesslogs → AccessLogsDashboard | audit → AuditLogViewer
```

### 폴더 구조
```
src/
├── api/          ← Phase 0 API 레이어 (신규 Supabase 쿼리는 반드시 여기 경유)
├── components/   ← hero/, community/, admin/, wiki/
├── context/      ← AuthContext (user, isAdmin, isLoggedIn, logout)
├── data/         ← edu-meta.json, graphic-contents/, lab-scenarios/ (~170개 JSON)
├── hooks/        ← useMatrixData, useEduProgress, useFeedback 등
├── lib/          ← supabase.js, i18n.js, sanitize.js
└── pages/        ← IntroMatrix, CourseSelector, lab/, admin/

api/              ← Vercel Serverless Functions (7개 엔드포인트)
public/edu/       ← 203개 HTML (SPA 밖, window.location.href로 이동)
server.js         ← Express 로컬 전용 (Vercel 전환 후 레거시, AIROOT 로컬용)
server-data/      ← 레벨테스트 정답 (Serverless Function이 읽음)
```

---

## 🚀 배포 구조 (v1.3.0 — Vercel)

**프로덕션**: https://gotroot-edu.vercel.app
**배포 방식**: GitHub push → Vercel 자동 빌드+배포
**브랜치**: `master` → Production
**Edge Middleware**: `/edu/*` 정적 HTML JWT 인증 (5분 토큰 캐시)

### Vercel Serverless Functions (7개)
```
api/level-test/questions.js  ← GET  문제 목록 (정답 제외)
api/level-test/check.js      ← POST 답안 채점
api/auth/check-rate.js       ← GET  브루트포스 확인
api/auth/report-failure.js   ← POST 로그인 실패 보고
api/auth/report-success.js   ← POST 로그인 성공 보고
api/ip.js                    ← GET  클라이언트 IP
api/geoip.js                 ← POST IP 지오로케이션 배치
```

### 코드 규칙
- **금지**: 컴포넌트에서 `supabase.*` 신규 직접 호출 추가 금지
- **허용 예외**: AuthContext.jsx, public/edu/progress-tracker.js
- **신규 API**: `api/` 폴더에 Vercel Serverless Function으로 추가
- `server.js`는 로컬 개발/AIROOT 전용 (Vercel 배포에 포함 안 됨)

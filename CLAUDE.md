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

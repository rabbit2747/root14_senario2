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

**MANDATORY:** Every final response MUST end with ALL THREE of the following sections, in this order:

### 🔁 Self-Refine
내 응답을 스스로 검토하고, 부족한 점·개선 가능한 점·놓친 것을 솔직하게 서술한다.
형식: "잘한 점 / 부족한 점 / 다음에 더 잘할 점"

### 🔄 Inverse Prompt
사용자가 나에게 보낸 질문/요청을 역방향으로 분석해서,
**"이렇게 물었다면 더 좋은 결과를 얻을 수 있었을 것"** 이라는 최적 프롬프트를 제안한다.
형식: `💡 최적 프롬프트: "..."`

"왜 그렇게 했는지 설명해줘"

---

## 공지사항 자동 업데이트 규칙

**업데이트 완료 후**, 관리자 공지사항(`announcements` 테이블)에 변경 사항을 **사용자 친화적으로** 등록해야 합니다.

### 작성 규칙
1. **기술 용어 최소화**: 사용자가 이해할 수 있는 쉬운 표현 사용
2. **버전 번호 포함**: `v0.x.x` 형식 (현재 최신: v0.9.8)
3. **변경 내용 요약**: "무엇이 좋아졌는지" 관점으로 작성
4. **다국어 지원**: 한국어 기본, 필요 시 영어 병기
5. **카테고리**: 🆕 새 기능 / 🔧 개선 / 🛡️ 보안 / 🐛 버그 수정

### 작성 예시
```
📢 v0.5.0 업데이트 안내

🆕 새 기능
- 실습 페이지 편집 기능이 추가되었습니다 (관리자 전용)
- 시뮬레이션 시나리오가 5개 언어로 번역되었습니다

🔧 개선
- 코드 편집기에 구문 강조(Syntax Highlighting)가 적용되었습니다
- 미리보기가 더 안전하게 동작합니다

🛡️ 보안
- 저장 시 위험한 스크립트가 자동으로 필터링됩니다
- 관리자 작업이 감사 로그에 기록됩니다
```

### 버전 히스토리
| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| v0.4.0 | 2026-02-28 | 커뮤니티 피드백, 이모지 피커, 대댓글 시스템 |
| v0.5.0 | 2026-03-01 | 실습 에디터, Prism.js 코드 하이라이팅, DOMPurify XSS 필터링, 감사 로깅, 5개 언어 번역 완성 |
| v0.7.0 | 2026-03-03 | 히어로 섹션 MITRE ATT&CK 사고 매트릭스 교체, 다크모드+SVG 일러스트, MatrixShowcase 줌/TTP 체인 |
| v0.7.1 | 2026-03-03 | 히어로 5전술×8사고 축소, 배경영상 opacity 0.28, 투어 무한루프, INTRO 버튼, 로그아웃→히어로 |
| v0.8.0 | 2026-03-06 | 히어로 무비모드(사용자 인터랙션 제거), 줌 50-200% 슬라이더, 사이드패널 타이핑 제거, 재생속도 10초, 스크롤 버그 수정, 갓루트 로고 삽입, CTA 버튼 상단 배치, subheader/matrixTitle 하단 푸터 이동, 베트남어·아랍어 번역 추가, 아랍어 RTL 지원 |
| v0.8.1 | 2026-03-06 | 히어로 번역 버그 4건 수정: 모바일 버튼 하드코딩, vi/ar description 한국어 폴백, FullScreenModal 폴백, TacticColumn 비한국어 시 한국어 부제 숨김 |
| v0.8.2 | 2026-03-06 | 번역 누락 전면 수정: DetailPanel 'Attack Vector'/'Affected' 라벨 다국어화, 8개 인시던트 베트남어·아랍어 description 추가 |
| v0.8.3 | 2026-03-06 | LangToggle LANG_OPTIONS + IntroMatrix langOptions/uiT에 vi/ar 추가, uiT fallback 방어 코드, vi/ar 선택 시 흰 화면 버그 수정 |
| v0.9.0 | 2026-03-06 | 교육 레벨 3→5단계(novice/beginner/intermediate/advanced/expert), 교육흐름 edu→graphic→scenario→lab 4단계, GraphicExplanationPage/ScenarioExplanationPage 신규, graphic-link.js 생성, 161개 HTML lab-link→graphic-link 교체 |
| v0.9.1 | 2026-03-06 | 진행률 버그 수정: progress-tracker.js 정규식 /^(ch\d+|quiz|eval)$/ 확장, edu-meta.json chapterIds 접두사(b-/i-/a-) 547개 제거, T1587.001 beginner chapters 11→10(quiz optional화), edu-page-template-guide.md 신규 생성 |
| v0.9.2 | 2026-03-06 | 그래픽/시나리오/랩 라우트 레벨 독립화: /:techniqueId/:level 파라미터 추가(3개 라우트), beginner HTML 187개 data-level="beginner" 일괄 추가, graphic-link.js data-level 읽기 적용, GraphicExplanationPage/ScenarioExplanationPage 레벨 배지 UI 추가 |
| v0.9.3 | 2026-03-06 | 시나리오 SCENARIO_COMPONENTS 동적 분기 구조(React.lazy+Suspense), T1587.001-beginner 인터랙티브 게임 별도 파일 분리(lucide-react 설치), 수료 보고서 모달 휠 스크롤 탭 전환, 보고서 모달·인벤토리 크기 버그 수정 |
| v0.9.4 | 2026-03-08 | 보안 패치: Vite dev server host 0.0.0.0→127.0.0.1(소스코드 외부노출 차단), blockExternalSourcePlugin 미들웨어 추가, ?preview=1 인증우회 제거(edu HTML 159개), api.ipify.org 제3자 IP전송 제거, CSP connect-src 정리, SECURITY_REPORT.md 생성 |
| v0.9.5 | 2026-03-08 | 갓루트 위키 출시: wiki_terms Supabase 테이블, WikiFloatingButton+WikiModal(SPA 인페이지), wiki-popup.html(edu HTML 팝업), 관리자 위키 탭(CRUD+JSON 임포트), scripts/extract-wiki-terms.js(edu HTML 856개 용어 자동 추출), SPA 라우팅 404 버그 수정(serve-prod.sh 래퍼 + serve -s 플래그) |
| v0.9.6 | 2026-03-09 | 버그 수정 3건: 진행률 100% 초과 표시 버그(Math.min 캡 적용), 브레드크럼 중복 쌓임 버그(마지막 경로 비교 dedup), CourseSelector 인증 레이스컨디션(authLoading 체크 추가); AnnouncementManager DOMPurify XSS 방어 추가 |
| v0.9.7 | 2026-03-09 | 🛡️ 보안: Express 서버 교체(serve→Express), /edu/*.html 서버 측 JWT 인증(Supabase API 검증+5분 캐시), AuthContext 쿠키 동기화, Login.jsx 레이스컨디션 방어, ?preview=1 잔여 42개 제거, cleanUrls:false 유지, 히어로 CTA 버튼 로그인 분기 수정, docs/security/ 보안 히스토리 문서 체계화 |
| v0.9.8 | 2026-03-10 | 🛡️ 보안 헤더 강화: CSP 경로 분리(SPA전용 CSP/edu는 자체 meta CSP), CORP edu cross-origin 허용, Permissions-Policy 9개 API 차단; 🐛 모바일 버그 수정: WikiFloatingButton 하단 메뉴 겹침(bottom 4.5rem), 시나리오 페이지 Sector 라벨·데이터 확보율·하단 버튼 1줄 표시, 퍼즐 모달 모바일 크기 축소 |
| v0.9.9 | 2026-03-10 | 🆕 그래픽 설명 시네마틱 플레이어: CinematicPlayer(1280×720 고정해상도+CSS transform scale), T1587.001-beginner 20슬라이드 그래픽 콘텐츠, 전체화면(Fullscreen API+F키)+모바일 가로회전(Screen Orientation API), 모바일 레이아웃 최적화(헤더·여백·스케일 반응형), FontAwesome CDN→npm(@fortawesome/fontawesome-free v7.2.0, main.jsx 글로벌 import), docs/graphic-content-template-guide.md 콘텐츠 작성 가이드 신규 |
| v1.0.0 | 2026-03-11 | 🆕 레벨 테스트 시스템: 적응형 7문제 퀴즈(/level-test, 100문제 은행 5레벨×20문제, Radar 차트 결과, canvas-confetti 만점 이스터에그), 비로그인 매트릭스 차단 오버레이(IntroMatrix), 히어로 CTA→레벨테스트 시작, Signup.jsx URL level 파라미터 수신+배지 UI+profiles.level 저장, Login.jsx level 기반 분기(beginner/junior→/basics), BasicsPlaceholder IT기초 랜딩, AuthContext userLevel 노출, 관리자 레벨테스트 문제 CRUD 탭(LevelTestManager, JSON import/export), src/api/levelTest.js Phase 0 API 레이어, level_test_questions Supabase 테이블+RLS, 레벨테스트 재응시 차단(로그인+레벨 보유 시 리다이렉트) |
| v1.0.1 | 2026-03-12 | 🛡️ 보안: 클라이언트 측 로그인 브루트포스 방어(5회 실패→15분 잠금, localStorage), 서버 측 브루트포스 방어(/api/auth/check-rate IP 기반 레이트리밋, 10회/15분), 익명 방문자 IP 수집 서버 미들웨어(IP당 1시간 쿨다운, access_logs fire-and-forget); 🆕 새 기능: 학습 경로 선택 페이지(/learning-path, beginner/junior 로그인→추천학습 vs 자율학습 선택, 14개 택틱 그리드→서브테크닉 목록→/edu/:id 이동, macOS 윈도우 PageWrapper 디자인), 관리자 접속 로그 대시보드(AccessLogViewer, IP·이메일·경로 검색+필터+페이지네이션) |
| v1.0.2 | 2026-03-13 | 🆕 추천 학습 로드맵: RecommendedCoursePage(/recommended/:techniqueId, 4단계 edu→graphic→scenario→lab, macOS 윈도우 디자인, 진행률 바, 택틱 배지), LearningPathChoice→/recommended 이동 연결; 🔧 관리자 접속 로그 강화: 30초 자동 갱신 토글(Play/Pause+카운트다운), IP 지오로케이션 표시(🌍 국가 플래그+도시, ip-api.com 배치 조회, 서버 24시간 캐시), CSV에 국가·도시 컬럼 추가, /api/geoip 배치 엔드포인트(server.js), 이메일 검색 필터(ilike 부분 매칭), IP 클릭→타임라인 모달(날짜별 그룹핑, 500건 제한, getAccessLogsByIp API) |
| v1.1.0 | 2026-03-14 | 🆕 유도 학습 시스템: /guided/:techniqueId 14챕터 유도학습(T1566.001 Spearphishing), CodeSketch DnD 코드빌더, SimTerminal 모의터미널, AnimatedFlow 단계애니메이션, QuizCheckpoint 인라인퀴즈, CompletionCelebration 축하+분기, macOS 윈도우 디자인, localStorage 진행률; AuthContext profiles.name(userName) 추가; v1.1.0 공지사항 등록 |
| v1.1.1 | 2026-03-16 | 🆕 AIROOT 서브프로젝트 연동: /airoot/* JWT 인증 서빙(별도 폴더), AIROOT API 9개 엔드포인트(방명록 CRUD+삭제+답글, 회의록 사용자 CRUD, 수료증, 대시보드 통계, 이모지 반응, 실시간 접속자), checkIsAdmin 서버측 관리자 검증, sanitizeHtml 서버측 XSS 방어(CSS injection 포함), 방명록 이모지 반응(인메모리 Map), 방명록 답글(parent_id 트리 구조+들여쓰기 UI), 프로필 십이지신 도트 아바타 12종+resolveAvatar 3단계 폴백, BGM 4곡 플레이어+AudioContext.resume() 효과음 공존, 다크/라이트 테마 토글(CSS변수), 수료증 동적 코스명+PDF 다운로드, 대시보드 코스별 수료율 도넛차트+실시간 접속자+30초 자동갱신, 모바일 반응형 CSS, PWA manifest+sw.js(HTTPS 대비), 도트아트 아이콘 192/512px, IntroMatrix AIROOT 버튼+히어로 소개, AIROOT_PATH 환경변수 |
| v1.2.0 | 2026-03-18 | 🛡️ 보안: 레벨테스트 문제은행 서버사이드 이관(server-data/, GET /api/level-test/questions 정답 미포함, POST /api/level-test/check 서버 채점, src/data/level-test-questions.js→UI 메타만), SB_HEADERS 상수 추출(8개 인라인→3개 상수), 전 엔드포인트 r.ok 에러 체크(12개소); 🔧 개선: 공통 LoadingScreen 컴포넌트(src/components/LoadingScreen.jsx, steps props, VerifyingOverlay), LevelTest/CourseSelector/RecommendedCoursePage/App.jsx Suspense 적용, 앱 전체 기본 라이트 테마, GraphicExplanationPage dark 하드코딩→localStorage; 📄 교육 데이터셋 문서(docs/edu-datasets/ 17개 파일, T1587.001 풀 파이프라인 포함) |
| v1.2.1 | 2026-03-18 | 🌐 다국어: 8개 인시던트 detailedInfo(attackVector/affectedOrgs/timeline/lessonsLearned) vi/ar 번역 완성(64개 필드), stat.label vi/ar 추가(16개), 5개 전술 titleVi/titleAr 추가, HERO_TEXT 전 언어 defenseAnalysis 키 추가, RightDetailPanel 하드코딩 버튼 텍스트→ht.defenseAnalysis 현지화; 🛡️ 보안: server.js sanitizeHtml Bidi Override 제거(step 7, U+200B~200F/202A~202E/2066~2069/FEFF), AIROOT 방명록/회의록/리액션 전 엔드포인트 sanitizeHtml 감사 완료; ⚡ 성능: TacticColumn React.memo+module-level TITLE_FIELD 상수(렌더 중 객체 생성 제거), IIFE 안티패턴 제거; 🐛 버그: FeedbackBoard 편집 저장 버튼 disabled 체크 stripBidi 불일치 수정(line 214) |

---

## 🚨🚨🚨 보안 필수 검증 프로토콜 — 매 세션 반드시 실행 🚨🚨🚨

> **⛔ BLOCKING REQUIREMENT**: Claude는 매 세션 시작 시 아래 체크리스트를 사용자에게 보여줘야 한다.
> "대기" 상태는 없다. 미조치 항목이 있으면 작업 시작 전에 반드시 사용자에게 경고한다.
> 새 테이블/RLS 변경이 포함된 작업 완료 후에도 이 섹션을 업데이트한다.

### 매 세션 시작 시 출력할 보안 체크리스트

```
🔒 보안 체크리스트 (2026-03-16 취약점 진단 기반)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[✅] V-01: profiles UPDATE에서 role+approved 변경 차단 — 2026-03-16 SQL 실행 완료
[✅] V-02: access_logs RLS — 관리자만 SELECT — 2026-03-16 SQL 실행 완료
[✅] V-03: wiki_terms RLS — approved READ + admin WRITE — 2026-03-16 SQL 실행 완료
[✅] V-04: announcements RLS — approved READ — 2026-03-16 SQL 실행 완료
[✅] V-05: feedback_likes RLS — 자기 것만 SELECT — 2026-03-16 SQL 실행 완료
[✅] V-06: 이메일 인증 활성화 — 2026-03-16 Dashboard Confirm email ON
[✅] V-07: 회원가입 Rate Limiting — 서버 10회/15분 + Supabase 기본 제한
[🔜] V-08: HSTS — HTTPS 도입 후 활성화 (현재 HTTP → 의도적 비활성화)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 2026-03-16 전면 보안 패치 완료. 새 테이블 추가 시 RLS 필수 확인.
```

### 취약점 상세 및 조치 이력

| # | 취약점 | 등급 | 공격 벡터 | 상태 |
|---|--------|:----:|-----------|:----:|
| V-01 | profiles UPDATE IDOR — 사용자가 자기 role/approved를 admin/true로 변경 가능 | 🔴 CRITICAL | `PATCH /rest/v1/profiles → {"role":"admin","approved":true}` | ✅ 2026-03-16 |
| V-02 | access_logs 전체 노출 — 비인증/일반 사용자가 이메일·IP·활동내역 조회 가능 | 🔴 CRITICAL | `GET /rest/v1/access_logs?select=email,user_id` (anon key) | ✅ 2026-03-16 |
| V-03 | wiki_terms 무단 CRUD — admin 우회 후 교육 콘텐츠 변조/삭제 가능 | 🔴 CRITICAL | profiles 권한상승 → `POST /rest/v1/wiki_terms` | ✅ 2026-03-16 |
| V-04 | announcements 비인증 노출 — anon key만으로 공지사항 전체 조회 | 🟡 HIGH | `GET /rest/v1/announcements` (anon key) | ✅ 2026-03-16 |
| V-05 | feedback_likes user_id 노출 | 🟡 HIGH | `GET /rest/v1/feedback_likes` | ✅ 2026-03-16 |
| V-06 | 이메일 인증 없이 계정 즉시 활성화 | 🟡 HIGH | `POST /auth/v1/signup` → 즉시 access_token | ✅ 2026-03-16 |
| V-07 | 회원가입 Rate Limiting 부재 → 무제한 계정 생성 | 🟠 MEDIUM | 연속 signup 요청 | ✅ 2026-03-16 |
| V-08 | HSTS 미적용 | 🟢 LOW | HTTPS 도입 전까지 의도적 비활성화 | 🔜 HTTPS 도입 시 |
| V-09 | user_metadata 조작 (is_admin 주입) | 🟢 INFO | `PUT /auth/v1/user → {"data":{"is_admin":true}}` — AuthContext가 profiles.role 기반이라 실제 영향 제한적. V-01 해결 시 무력화 | V-01 종속 |
| V-10 | X-Forwarded-For IP 스푸핑 | ✅ | getClientIP → socket IP only | ✅ 2026-03-15 |
| V-11 | CSP 헤더에 Supabase URL 노출 | 🟢 INFO | connect-src에 프로젝트 ID 포함 — JS 분석 없이 백엔드 식별 가능 | 수용 (아키텍처상 불가피) |

### 보안 패치 SQL v2 (2026-03-16 — 멱등성 보장, 반복 실행 안전)

> Claude는 이 SQL이 Supabase에서 실행되었는지 **매번 사용자에게 확인**해야 한다.
> "대기" 상태로 방치하지 말 것. 실행 안 했으면 즉시 실행을 요청할 것.

```sql
-- ══════════════════════════════════════════════════════════════
-- GOTROOT EDU 보안 패치 v2 (2026-03-16)
-- 취약점 진단 보고서 기반 전면 RLS 정비
-- DROP IF EXISTS로 멱등성 보장 — 여러 번 실행해도 안전
-- ══════════════════════════════════════════════════════════════

-- ━━━ V-01: profiles role + approved 변경 완전 차단 ━━━
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own non-role fields" ON profiles;
DROP POLICY IF EXISTS "Users update own non-sensitive fields" ON profiles;
CREATE POLICY "Users update own non-sensitive fields" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND approved = (SELECT approved FROM profiles WHERE id = auth.uid())
  );

-- ━━━ V-02: access_logs 관리자만 조회 ━━━
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "access_logs_own_only" ON access_logs;
DROP POLICY IF EXISTS "access_logs_approved_own_only" ON access_logs;
DROP POLICY IF EXISTS "access_logs_admin_only" ON access_logs;
CREATE POLICY "access_logs_admin_only" ON access_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.approved = true
  ));

-- ━━━ V-03: wiki_terms 승인 사용자 읽기 + 관리자만 쓰기 ━━━
ALTER TABLE wiki_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wiki_terms_public_read" ON wiki_terms;
DROP POLICY IF EXISTS "wiki_terms_approved_read" ON wiki_terms;
CREATE POLICY "wiki_terms_approved_read" ON wiki_terms
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.approved = true
  ));
DROP POLICY IF EXISTS "wiki_terms_admin_write" ON wiki_terms;
CREATE POLICY "wiki_terms_admin_write" ON wiki_terms
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.approved = true
  ));

-- ━━━ V-04: announcements 승인 사용자만 읽기 ━━━
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "announcements_public_read" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_read" ON announcements;
DROP POLICY IF EXISTS "announcements_approved_read" ON announcements;
CREATE POLICY "announcements_approved_read" ON announcements
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.approved = true
  ));

-- ━━━ V-05: feedback_likes 자기 것만 ━━━
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "feedback_likes_own" ON feedback_likes;
CREATE POLICY "feedback_likes_own" ON feedback_likes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

### Supabase Dashboard 설정 (SQL로 불가 — 수동 확인 필수)

1. **Auth → Settings → Enable email confirmations**: ✅ ON 확인
2. **Auth → Rate Limits**: 회원가입 제한 활성화 확인
3. **Auth → Users**: 테스트 계정(ratelimit_test_*, rjsdn1578@test.com) 삭제

### 공격 시나리오 (V-01 미조치 시 5분 내 전체 탈취 가능)

```
비인증 → JS에서 anon key 추출 → signup(인증 없이 즉시) →
PATCH profiles(role:admin, approved:true) → wiki_terms INSERT(피싱 콘텐츠) →
access_logs SELECT(전체 이메일+IP) → 완전 탈취
```

**V-01(profiles UPDATE 차단)이 가장 중요한 방어선.** 이것만 막으면 체인이 끊김.

---

## ⚠️ Claude 작업 시 주의사항 (실수 기록 기반)

과거 세션에서 발생한 실수를 반복하지 않기 위한 규칙입니다.

### 1. 파일 수정 범위를 정확히 지킬 것
- **사건**: 사용자가 "showcase만 없애라"고 했는데, IntroMatrix.jsx까지 되돌려서 다른 작업물이 날아감
- **규칙**: 사용자가 명시한 파일/범위만 수정. 관련 파일이라도 명시적 허가 없이 변경 금지
- **확인 방법**: 수정 전 "이 파일들만 수정합니다: [목록]" 형태로 범위 명시

### 2. 대규모 횡단 작업은 먼저 범위를 확인할 것
- **사건**: "베트남어/아랍어 추가해줘" 요청에 즉시 10+개 파일 탐색 Agent를 실행 → 사용자가 "야 그냥 하지마 스탑" → 컨텍스트 낭비
- **규칙**: 10개 이상 파일에 영향을 미치는 작업은 먼저 영향 범위와 소요 시간을 알려주고, 사용자 확인 후 시작
- **확인 방법**: "약 [N]개 파일 수정 필요, 진행할까요?" 물어보기

### 3. 시각적 수치(opacity, 색상 등)는 사용자에게 구체적 값을 물어볼 것
- **사건**: 배경 영상 opacity를 0.08 → 0.18 → 0.28로 3번 반복 수정 (사용자가 매번 "안보인다" 피드백)
- **규칙**: 시각적 수치 조정 시 "현재 0.08인데, 어느 정도로 올릴까요? (0.2? 0.3? 0.5?)" 식으로 구체적 선택지 제공
- **확인 방법**: 임의로 조금만 올리지 말고, 충분한 변화폭의 옵션을 제시

### 4. heroPhase 리셋 시 반드시 setHeroPhase('entering') 호출
- **사건**: 로그아웃 시 localStorage만 지우고 setHeroPhase를 호출하지 않아 히어로가 표시되지 않음
- **규칙**: 히어로를 다시 보여주려면 반드시 `setHeroPhase('entering')` + `localStorage.removeItem('gotroot_intro_seen')` 둘 다 실행
- **확인 방법**: 히어로 복귀 관련 코드에서 두 가지 모두 있는지 검증

### 5. CSS !important를 inline style과 충돌하는 곳에 사용하지 말 것
- **사건**: 다크 모드 CSS에 `!important`를 넣어서 인라인 tactic 색상이 덮어씌워짐
- **규칙**: 인라인 스타일을 사용하는 컴포넌트에는 CSS `!important` 사용 금지. Tailwind 유틸리티 또는 인라인 스타일로 통일
- **확인 방법**: 기존 스타일링 방식(인라인 vs CSS)을 먼저 확인 후 같은 방식 사용

### 6. 모든 변경 후 반드시 빌드 검증
- **규칙**: 코드 수정 완료 후 `npm run build` 성공 확인 필수
- **확인 방법**: 빌드 실패 시 즉시 수정, 빌드 성공 로그 확인

### 7. 컨텍스트 효율적 사용
- **규칙**: 큰 파일 전체를 반복적으로 읽지 말 것. 필요한 부분만 offset/limit으로 읽기
- **규칙**: Task Agent 실행 전 정말 필요한지 판단. 간단한 검색은 Grep/Glob으로 충분
- **규칙**: 사용자가 "스탑"이라고 하면 즉시 중단, 진행 중인 Agent도 멈추기

### 8. Worktree 사용 시 .env 파일 동기화
- **사건**: Worktree에 `.env`가 없어서 Supabase 인증이 무한 pending → `return null` → 흰 화면
- **규칙**: 새 worktree 생성 또는 dev 서버가 worktree에서 실행될 때, `.env`를 main → worktree로 반드시 복사
- **확인 방법**: `ls worktree/.env` 로 존재 여부 확인 후 없으면 즉시 복사

### 9. 메인/Worktree 파일 동기화 규칙
- **사건**: 편집은 main 프로젝트에, dev 서버는 worktree에서 실행 → 변경사항이 반영 안 됨
- **규칙**: 코드 수정 후 worktree에서 dev 서버가 실행 중이면 반드시 `cp main/file worktree/file` 동기화
- **확인 방법**: `preview_list`로 server CWD 확인 후 main vs worktree 불일치 시 즉시 동기화

---

## 프론트엔드 상태 관리 및 UI 작업 규칙 (Strict Rules)

### 1. 이벤트 바인딩 필수로 확인 (Event Binding)
- UI 요소(버튼, 폼 등)를 렌더링할 때 디자인만 만들지 말 것.
- 반드시 `onClick`, `onChange` 등의 이벤트 핸들러가 상태 변경 함수(e.g., `setIsModalOpen`)와 정상적으로 연결되었는지 확인한다.

### 2. 명확한 초기 상태 설정 (Initial State)
- 모달, 패널 등의 가시성을 제어할 때는 `useState` 초기값을 명확히 설정한다.
- 예: `const [isOpen, setIsOpen] = useState(false);`

### 3. 안전한 상태 전달 (Props & State Management)
- 복잡한 상태 관리 라이브러리(Redux, Zustand 등)는 명시적인 요청이 없을 경우 도입하지 않고, 기본 React Hook(`useState`, `useEffect`)을 우선 사용한다.
- 부모에서 자식으로 상태와 상태 변경 함수가 끊기지 않고 전달되는지 검증한다.

### 4. 비동기 데이터 렌더링 방어 (Loading State)
- 외부/비동기 데이터를 불러와 모달이나 패널에 띄울 때는 데이터가 로딩되기 전의 '빈 화면'이나 '에러'를 방지하기 위해 반드시 로딩 상태(Loading Spinner/Skeleton)를 구현한다.

### 5. 렌더링 계층 및 Z-Index 관리
- 모달이나 오버레이 컴포넌트가 나타날 때 다른 UI(예: 사이드 패널) 밑에 깔리지 않도록 최상단 레이어에 배치한다.
- Tailwind CSS 사용 시 모달 래퍼에 `z-[100]` 이상의 충분히 높은 z-index를 부여한다.
- `pointer-events-none` 컨테이너 안에 있는 모달은 반드시 `createPortal(modal, document.body)`로 렌더링한다.

---

## 📐 프로젝트 구조 & 페이지 흐름도 (코드 기반)

### ① 라우팅 맵 — App.jsx `<Routes>` 완전 기준

```
Route path                     Component          인증조건          비고
───────────────────────────────────────────────────────────────────────────────
/                           → IntroMatrix         없음              히어로+MITRE 매트릭스 메인
/login                      → Login               없음
/signup                     → Signup              없음
/mypage                     → MyPage              없음 (내부 처리)
/admin                      → AdminPage           AdminGuard        !isLoggedIn→/login, !isAdmin→/
/announcements              → Announcements       없음
/community                  → CommunityPage       없음
/edu/:techniqueId           → CourseSelector           Auth Gate 내부    !isLoggedIn→/login?redirect=...
/edu/graphic/:techniqueId   → GraphicExplanationPage  Auth Gate 내부    !isLoggedIn→/login?redirect=...
/edu/scenario/:techniqueId  → ScenarioExplanationPage Auth Gate 내부    !isLoggedIn→/login?redirect=...
/lab/desktop/:techniqueId   → DesktopLab               Auth Gate 내부    !isLoggedIn→/login?redirect=...
/lab/t1078                  → LabT1078            없음              T1078.002 전용 하드코딩 랩
/lab/complete/:techniqueId  → LabCompletionPage   없음
───────────────────────────────────────────────────────────────────────────────
· 모든 컴포넌트 lazy() — Suspense fallback: 다크 스피너
· 감싸는 순서: AuthProvider > BrowserRouter > PageTracker(GA4) > SessionWarningToast > Suspense
· 세션타임아웃: 비활동 9분30초 → 경고 토스트, 10분 → supabase.auth.signOut() 자동 실행
```

### ② 유저 흐름 분기 — 비로그인 / 일반 / 관리자

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[A] 비로그인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  / → 기법 클릭 → 로그인 유도 UI (navigate 없음, 페이지 내 안내)
  /edu/:id  직접접근 → CourseSelector useEffect → navigate('/login?redirect=/edu/:id')
  /lab/desktop/:id 직접접근 → DesktopLab useEffect → navigate('/login?redirect=/lab/desktop/:id', {replace:true})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[B] 로그인 — 일반 유저
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  / (IntroMatrix)
   ├─ 기법 클릭 (hasEduContent) → navigate('/edu/:techniqueId')
   │    └─ sessionStorage['gotroot_nav_state'].breadcrumb 업데이트
   └─ /edu/:techniqueId (CourseSelector)
        ├─ eduMeta.pages[id] 없음 → "콘텐츠 없음" 404 화면
        ├─ eduMeta.pages[id] 있음
        │   └─ 레벨카드 5장 (LEVELS = ['novice','beginner','intermediate','advanced','expert'])
        │        ├─ 🟡 novice       : 항상 해금
        │        ├─ 🟢 beginner     : novice 콘텐츠 있으면 완료 후 해금, 없으면 항상 해금
        │        ├─ 🔵 intermediate : beginner 콘텐츠 있으면 완료 후 해금, 없으면 항상 해금
        │        ├─ 🔴 advanced     : intermediate 완료 후 해금 (동일 규칙)
        │        └─ ⭐ expert       : advanced 완료 후 해금 (동일 규칙)
        │        ※ url 없는 레벨은 "준비중" 상태, 잠금 조건 건너뜀 (기존 진행률 보존)
        │
        │   카드 클릭 시 CTA 라벨:
        │     completed → "복습하기"
        │     progress.completed > 0 → "이어하기"
        │     else → "시작하기"
        │
        │   이동 방식: window.location.href = card.url   ← React Router 아님!
        │             (public/edu/*.html은 SPA 외부 별도 HTML)
        │
        └─ public/edu/*.html 내 graphic-link.js 클릭  ← (구: lab-link.js)
             └─ window.location.href = '/edu/graphic/:techniqueId'  (SPA 라우트)
                  └─ /edu/graphic/:techniqueId (GraphicExplanationPage.jsx)
                       ├─ CinematicPlayer: 1280×720 고정해상도 + CSS transform scale 반응형
                       │   ├─ GRAPHIC_DATA_LOADERS[id]() → subtitlesData (자막+타이밍)
                       │   ├─ GRAPHIC_COMPONENTS[id]() → renderSlides (슬라이드 JSX)
                       │   ├─ 자동재생: subtitlesData[].duration 기반 슬라이드 전환
                       │   ├─ 전체화면: Fullscreen API + F키 + 모바일 가로회전(Screen Orientation API)
                       │   └─ 줌: 모바일 overhead 100px / 데스크톱 overhead 190px
                       └─ [시나리오 기반 설명으로] 버튼 → navigate('/edu/scenario/:id')
                            └─ /edu/scenario/:techniqueId (ScenarioExplanationPage.jsx)
                                 └─ [실습 랩 시작] 버튼 → navigate('/lab/desktop/:id')
                                      └─ navigate('/lab/desktop/:techniqueId')
                  │
                  ├─ [T1078.002] DEDICATED_LABS 해당
                  │    └─ navigate('/lab/t1078', {replace:true})  ← LabT1078
                  │
                  ├─ SCENARIO_LOADERS[id] 있는 경우 (40개 기법)
                  │    └─ dynamic import('lab-scenarios/:id.json') → scenario 객체
                  │         └─ <GenericLabSimulator scenario={...} techniqueId={...} />
                  │              ① 법적 고지 동의 체크박스
                  │              ② 설정화면: userName(profiles.name prefill), companyName
                  │              ③ 실습화면 2분할
                  │                   viewMode='hacker' → 해커PC (터미널+단계로그+데스크톱아이콘)
                  │                   viewMode='defender' → 방어자SOC (탐지/대응/체크포인트)
                  │              ④ 자동재생: stepDuration(기본8초) + TTS 완료 대기 후 진행
                  │                   TTS: window.speechSynthesis API
                  │                   음소거 시 TTS 없이 타이머만
                  │              ⑤ 마지막 스텝 완료
                  │                   localStorage['gotroot_completed_labs'] 배열에 push
                  │                   navigate('/lab/complete/:id', { state: { ... } })
                  │
                  └─ SCENARIO_LOADERS[id] 없는 경우
                       └─ 폴백 화면 (scenario=null) — 현실적으로 도달 불가

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[C] 관리자 (isAdmin=true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /admin → AdminGuard → AdminContent
    탭ID          컴포넌트                requestVerify  역할
    ──────────────────────────────────────────────────────
    'edu'       → EduFormManager          ✅            edu-meta.json CRUD
    'matrix'    → MatrixStructureManager  ✅            Supabase tactics/techniques 편집
    'announce'  → AnnouncementManager     ✅            공지사항 CRUD
    'users'     → UserManager             ✅            profiles.role 관리
    'lab'       → EduHtmlEditor           ✅            public/edu/ HTML 직접 편집
    'labscenario'→LabScenarioManager      ❌            랩 시나리오 JSON 관리
    'stats'     → EduProgressStats        ✅            edu_progress 통계
    'audit'     → AuditLogViewer          ✅            audit_logs 조회
    ──────────────────────────────────────────────────────
    NotificationBell: useAdminNotifications → 실시간 알림, 탭 전환 연동
    AdminVerifyModal: useAdminVerify() → requestVerify 시 비밀번호 재확인 모달
```

### ③ 폴더별 파일 역할 트리

```
src/
├── main.jsx          # Vite 진입점. ReactDOM.createRoot(document.getElementById('root'))
├── App.jsx           # AuthProvider > BrowserRouter > Routes 11개. GA4 PageTracker 포함
├── index.css         # Tailwind + Paperlogy 폰트 @font-face
│
├── context/
│   └── AuthContext.jsx
│       ├─ 제공값: user, isAdmin, isLoggedIn, loading, sessionWarning, logout
│       ├─ profiles.role === 'admin' → isAdmin 판단
│       └─ 세션타임아웃: IDLE_TIMEOUT=10분, WARN_BEFORE=30초
│          감지이벤트: mousemove/keydown/scroll/touchstart/click
│
├── pages/
│   ├── IntroMatrix.jsx
│   │   ├─ HeroIncidentMatrix(히어로 시네마틱) + 전체 MITRE 매트릭스 테이블
│   │   ├─ 5개국어: LangToggle (ko/en/ja/vi/ar)
│   │   ├─ TECHNIQUE_URLS: eduMeta.pages 순회로 교육가능 기법 자동 판단
│   │   ├─ useMatrixData: Supabase tactics/techniques (실패 시 matrix-fallback.json)
│   │   ├─ useEduProgress: 로그인 시 진행률 배지
│   │   └─ CommunitySection: lazy() (스크롤 하단)
│   │
│   ├── Login.jsx / Signup.jsx     # Supabase Auth (이메일/비밀번호)
│   ├── MyPage.jsx                 # 진행률, 완료 랩 목록(localStorage)
│   ├── Announcements.jsx          # useAnnouncements → 공지 목록+페이지네이션
│   ├── CommunityPage.jsx          # CommunitySection 전체화면 래퍼
│   │
│   ├── CourseSelector.jsx         ← /edu/:techniqueId
│   │   ├─ Auth Gate: !isLoggedIn → navigate('/login?redirect=...')
│   │   ├─ eduMeta.pages[id] 없으면 → 404 화면
│   │   ├─ LEVELS = [beginner🟢, intermediate🔵, advanced🔴]
│   │   │   isUnlocked(id,level) ← useEduProgress ← edu_progress 테이블
│   │   ├─ CTA: completed→복습하기 / progress>0→이어하기 / else→시작하기
│   │   ├─ 이동: window.location.href = card.url  (React Router 아님!)
│   │   └─ 브레드크럼: sessionStorage['gotroot_nav_state'].breadcrumb
│   │
│   ├── lab/
│   │   ├── DesktopLab.jsx         ← /lab/desktop/:techniqueId
│   │   │   ├─ Auth Gate: !isLoggedIn → navigate('/login?redirect=...', {replace:true})
│   │   │   ├─ DEDICATED_LABS = { 'T1078.002': '/lab/t1078' }
│   │   │   │   해당 시 → navigate(dedicatedPath, {replace:true})
│   │   │   ├─ SCENARIO_LOADERS[id]() → dynamic import('lab-scenarios/:id.json')
│   │   │   │   성공 → <GenericLabSimulator scenario={mod.default} techniqueId={id} />
│   │   │   └─ 로더 없으면 → 폴백 화면 (scenario=null)
│   │   │
│   │   ├── GenericLabSimulator.jsx    # props: { scenario, techniqueId }
│   │   │   ├─ scenario 구조:
│   │   │   │   { id, title, titleEn, duration, stepDuration(기본8초),
│   │   │   │     steps[], phases[]?, processTree[]?, desktopIcons[]? }
│   │   │   ├─ ① 법적 고지 동의 (agreed 체크박스)
│   │   │   ├─ ② 설정화면: userName(profiles.name prefill), companyName
│   │   │   ├─ ③ 실습화면
│   │   │   │   viewMode='hacker'   → 해커PC: 데스크톱+터미널+단계로그+processTree
│   │   │   │   viewMode='defender' → SOC: 탐지분석/대응전략/SOC체크포인트
│   │   │   ├─ ④ 자동재생: stepDuration초 + TTS(ttsFinished) 둘 다 충족 시 진행
│   │   │   │   TTS: window.speechSynthesis (음소거 시 건너뜀)
│   │   │   │   줌: useSimulationZoom({ enabled: isMobile(width<1024) })
│   │   │   └─ ⑤ 완료:
│   │   │       localStorage['gotroot_completed_labs'] push
│   │   │       navigate('/lab/complete/:id', { state: { scenarioTitle, ... } })
│   │   │
│   │   ├── LabT1078.jsx             # T1078.002 Domain Accounts 전용 랩
│   │   ├── labT1078Data.jsx         # T1078 단계 데이터 배열 + Icons export
│   │   └── LabCompletionPage.jsx    # 완료 화면. navigate state로 시나리오 정보 수신
│   │
│   └── admin/                       # AdminGuard 보호 (isAdmin 필수)
│       ├── AdminGuard.jsx           # !isLoggedIn→/login, !isAdmin→/ Navigate
│       ├── AdminPage.jsx            # 8탭 레이아웃. NotificationBell, AdminVerifyModal
│       ├── EduPageManager.jsx       # ⚠️ 현재 탭에서 미사용 (EduHtmlEditor가 대신 담당)
│       ├── EduProgressStats.jsx     # 탭'stats': 기법별/레벨별 학습 통계
│       ├── UserManager.jsx          # 탭'users': profiles.role 부여/회수
│       ├── announcement-manager/AnnouncementManager.jsx  # 탭'announce'
│       ├── audit-log/AuditLogViewer.jsx                  # 탭'audit'
│       ├── edu-html-editor/EduHtmlEditor.jsx             # 탭'lab': HTML 직접 편집
│       ├── edu-html-editor/editor-theme.css
│       ├── edu-manager/                                   # 탭'edu': edu-meta.json CRUD
│       │   ├── EduFormManager.jsx / EduMetaForm.jsx
│       │   ├── ChapterManager.jsx / TagInput.jsx
│       │   └── EduContentPreview.jsx / useEduFormState.js
│       ├── lab-scenario-manager/LabScenarioManager.jsx   # 탭'labscenario'
│       └── matrix-manager/                               # 탭'matrix'
│           ├── MatrixStructureManager.jsx
│           ├── TacticListPanel.jsx / TechniquePanel.jsx / TranslationPanel.jsx
│           └── useMatrixFormState.js
│
├── components/
│   ├── LangToggle.jsx     # ko/en/ja/vi/ar. localStorage 'gotroot_lang'
│   │                      # export: getStoredLang() / storeLang()
│   ├── AvatarRoom.jsx     # 유저 아바타
│   ├── hero/              # IntroMatrix 전용
│   │   ├── HeroIncidentMatrix.jsx    # 8개 실제 사고 시네마틱 매트릭스
│   │   ├── TacticColumn.jsx          # 전술 컬럼 렌더링
│   │   ├── IncidentCard.jsx          # 인시던트 카드 (클릭→DetailPanel)
│   │   ├── DetailPanel.jsx           # 좌측 사이드패널 (기법+TTP 상세)
│   │   ├── RightDetailPanel.jsx      # 우측 사이드패널
│   │   ├── FullScreenReportModal.jsx # 전체화면 침해사고 보고서
│   │   ├── IncidentIllustration.jsx  # SVG 다크모드 일러스트
│   │   ├── JsonDiagram.jsx           # 공격체인 JSON 시각화
│   │   ├── RobotCharacter.jsx / RobotSpeechBubble.jsx
│   │   └── incidentData.js           # 8개 인시던트 정적 데이터 (다국어 포함)
│   ├── community/
│   │   ├── CommunitySection.jsx      # lazy loaded. 피드백+공지 통합
│   │   ├── FeedbackBoard.jsx         # 이모지 반응/댓글/대댓글
│   │   ├── AnnouncementPreview.jsx   # 공지 미리보기 카드
│   │   └── EmojiPicker.jsx
│   └── admin/
│       ├── AdminVerifyModal.jsx      # requestVerify 시 비밀번호 재확인 모달
│       ├── AdminGuideSection.jsx     # 어드민 가이드 텍스트
│       └── NotificationBell.jsx      # useAdminNotifications → 실시간 알림+탭 연동
│
├── hooks/
│   ├── useMatrixData.js         # tactics+techniques. 실패→matrix-fallback.json
│   ├── useEduProgress.js        # getProgress/isLevelComplete/isUnlocked 제공
│   ├── useAnnouncements.js      # announcements CRUD
│   ├── useFeedback.js           # feedback 테이블 (이모지/댓글/대댓글)
│   ├── useAdminVerify.js        # { requestVerify, ...modalProps }
│   ├── useAdminNotifications.js # 어드민 알림 폴링
│   ├── useAuditLogs.js          # audit_logs 조회
│   ├── useEduHtmlContent.js     # edu_html_content (어드민 HTML 편집)
│   └── useSimulationZoom.js     # 줌 50~200% 상태. GenericLabSimulator 사용
│
├── lib/
│   ├── supabase.js       # createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
│   │                     # + logAccess() → audit_logs insert
│   ├── i18n.js           # 다국어 헬퍼
│   ├── sanitize.js       # DOMPurify (React dangerouslySetInnerHTML)
│   ├── sanitizeHtml.js   # DOMPurify (HTML 문자열 직접 처리)
│   └── maskUtils.js      # maskEmail() — 관리자 헤더 이메일 마스킹
│
└── data/
    ├── edu-meta.json          # { pages: { [techniqueId]: { title,titleEn,levels,tags,difficulty } } }
    │                          # CourseSelector + IntroMatrix(TECHNIQUE_URLS) 둘 다 사용
    ├── matrix-fallback.json   # Supabase 실패 시 폴백 전체 구조
    ├── attack-simulators/T1078.002.json   # LabT1078 전용 시뮬레이터 데이터
    ├── edu-datasets/          # 교육용 정적 JSON 5개 (t1003/t1059/t1110/t1547/t1566)
    ├── graphic-contents/      # 그래픽 슬라이드 JSX. GraphicExplanationPage GRAPHIC_COMPONENTS 동적 import
    │   └── T1587.001-beginner.jsx  # 20슬라이드+자막. export { subtitlesData, renderSlides }
    └── lab-scenarios/         # ~170개 JSON. DesktopLab SCENARIO_LOADERS 동적 import

public/
├── edu/ (203개 HTML)      # window.location.href 이동. SPA 밖 별도 환경
│   ├── breadcrumb.js      # 교육 HTML 내 브레드크럼 UI
│   ├── lab-link.js        # 실습 시작 → /lab/desktop/:id pushState
│   └── progress-tracker.js# 챕터 완료 시 Supabase edu_progress upsert
├── logo/                  # logo-name-dark-nobg / dark / white / logo-white (4종)
├── fonts/                 # Paperlogy 1Thin~9Black (9종 .ttf)
└── videos/hero/           # 히어로 배경 영상 5개

docs/
├── security/              # 보안 히스토리 문서 (v0.9.7~)
├── 설명/                  # 작업 완료 후 그래픽 레코딩 스타일 요약 (SVG)
└── graphic-content-template-guide.md  # 그래픽 슬라이드 콘텐츠 작성 가이드 (v0.9.9)
```

### ④ Supabase 테이블 의존성 — 읽기 / 쓰기 분리

```
테이블               읽기 (SELECT)                         쓰기 (INSERT/UPDATE/UPSERT)
────────────────────────────────────────────────────────────────────────────────────────
profiles          AuthContext (role→isAdmin 판단)          UserManager (role 변경)
                  GenericLabSimulator (name prefill)
────────────────────────────────────────────────────────────────────────────────────────
tactics           useMatrixData                            MatrixStructureManager
techniques        useMatrixData                            MatrixStructureManager
                                                           TranslationPanel
────────────────────────────────────────────────────────────────────────────────────────
announcements     useAnnouncements                         AnnouncementManager
                  AnnouncementPreview
────────────────────────────────────────────────────────────────────────────────────────
feedback          useFeedback                              FeedbackBoard (이모지/댓글/대댓글)
────────────────────────────────────────────────────────────────────────────────────────
edu_progress      useEduProgress                           public/edu/progress-tracker.js
                  (isLevelComplete, isUnlocked,            ⚠️ SPA 밖! HTML이 직접 upsert
                   getProgress, EduProgressStats)
────────────────────────────────────────────────────────────────────────────────────────
audit_logs        useAuditLogs, AuditLogViewer             lib/supabase.logAccess()
                                                           (관리자 작업 시 자동 기록)
────────────────────────────────────────────────────────────────────────────────────────
edu_html_content  useEduHtmlContent                        EduHtmlEditor (어드민 HTML 편집)
────────────────────────────────────────────────────────────────────────────────────────

핵심 주의사항:
· tactics/techniques: Supabase 실패 → src/data/matrix-fallback.json 폴백
· edu_progress 쓰기: React SPA가 아닌 public/edu/progress-tracker.js 가 담당
  CourseSelector의 isUnlocked/getProgress는 이 테이블을 읽기만 함
· GenericLabSimulator 완료: edu_progress.upsert(ignoreDuplicates:true) + localStorage 폴백 이중 저장
  localStorage['gotroot_completed_labs'] = [{ name, technique, completedAt }] (오프라인/폴백)
  edu_progress: { user_id, technique_id, chapter_id:'lab_completed', level } (서버 측 증빙)
```

---

## 🗺️ 중장기 마이그레이션 플랜 (Supabase → NestJS + PostgreSQL)

> **목표**: 사용자 100명 도달 시 무중단으로 Supabase → 자체 백엔드 전환
> **원칙**: Strangler Fig Pattern — 화면 변화 없이 API 레이어만 교체

### 현황 vs 목표

| 항목 | 현재 | 목표 |
|------|------|------|
| 구조 | React → Supabase 직접 연결 | React → NestJS API → PostgreSQL |
| 인증 | Supabase Auth | JWT (NestJS Guard) |
| 실시간 | Supabase Realtime | NestJS WebSocket Gateway |
| 외부 HTML | progress-tracker.js (하드코딩) | API 엔드포인트 호출 |

### Phase 0 — 지금 당장 (비용 0, 코드 규칙만)

**금지**: 컴포넌트에서 `supabase.*` 신규 직접 호출 추가 금지
**허용 예외**:
- `AuthContext.jsx`: `onAuthStateChange` 실시간 리스너 (Phase 2까지 유지)
- `public/edu/progress-tracker.js`: SPA 외부 파일, 별도 전환 계획 필요
- 기존 코드 수정 불요 (신규 쿼리만 `src/api/` 경유)

**신규 쿼리 작성 규칙**:
```js
// ❌ 금지 (직접 호출)
const { data } = await supabase.from('announcements').select('*');

// ✅ 허용 (api 경유)
import { getAnnouncements } from '../api/announcements';
const data = await getAnnouncements();
```

### Phase 1 — 사용자 50명 도달 시 (~3주 풀타임, ~95시간)

```
1. NestJS + Prisma 프로젝트 생성
2. prisma db pull  →  Supabase 스키마 자동 추출 (재설계 불필요!)
3. src/api/_client.js 1파일 교체  →  전체 프론트 전환
4. 파일 이관 순서 (A→B→C 우선):
   A (쉬움, 8개):  useMatrixData, useAuditLogs, useAdminNotifications, EduProgressStats
   B (표준, 11개): useAnnouncements, useFeedback (non-realtime), EduFormManager
   C (예외, 4개):  AuthContext, progress-tracker.js, GenericLabSimulator, useFeedback Realtime
```

### Phase 2 — 사용자 100명 이후

- Supabase Realtime → NestJS WebSocket Gateway 교체
- `progress-tracker.js` → NestJS API 엔드포인트 호출
- AuthContext → JWT access/refresh token 관리

### src/api/ 껍데기 구조 (Phase 0 준비)

```
src/api/
├── _client.js          ← 단일 교체 포인트 (현재: supabase client, 전환 후: axios)
├── auth.js             ← getSession, signIn, signOut
├── announcements.js    ← CRUD
├── matrix.js           ← tactics, techniques
├── feedback.js         ← 이모지/댓글
├── edu.js              ← edu_progress, edu_meta
└── admin.js            ← audit_logs, profiles, edu_html_content
```

### 기술 선택: NestJS (TypeScript) > Spring Boot

| 이유 | 설명 |
|------|------|
| 언어 통일 | TypeScript (React ↔ NestJS) |
| 스키마 자동화 | `prisma db pull` → Supabase PostgreSQL 즉시 추출 |
| 실시간 대응 | Supabase Realtime → WebSocket Gateway 1:1 |
| 팀 규모 | 소규모 + I/O-heavy → NestJS 최적 |

### 🚨 보안 즉시 조치 (Supabase SQL Editor에서 직접 실행)

```sql
-- 1. access_logs: 이메일·IP 노출 차단 (🔴 CRITICAL)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_logs_own_only" ON access_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. feedback_likes: user_id 노출 차단
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_likes_own" ON feedback_likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. announcements: 로그인 유저만 읽기 (공개 접근 차단)
DROP POLICY IF EXISTS "announcements_public_read" ON announcements;
CREATE POLICY "announcements_auth_read" ON announcements
  FOR SELECT TO authenticated USING (true);
```

> ⚠️ Claude는 Supabase SQL Editor를 직접 실행할 수 없음. 사용자가 직접 실행 필요.

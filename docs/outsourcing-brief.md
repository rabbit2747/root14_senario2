# 백엔드 마이그레이션 외주 의뢰서
> 갓루트 에듀 (Gotroot Edu) — Supabase → NestJS + PostgreSQL 전환
> 문서 버전: v2.0 | 작성일: 2026-03-07

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 갓루트 에듀 (Gotroot Edu) |
| 서비스 설명 | MITRE ATT&CK 기반 사이버보안 교육 플랫폼 |
| 기술 스택 (현재) | Vite + React + TailwindCSS + Supabase (BaaS) |
| 기술 스택 (목표) | 위 프론트엔드 유지 + **NestJS + Prisma + PostgreSQL** 추가 |
| 핵심 제약 | **사용자가 보는 화면은 단 한 글자도 변경 불가** |
| 현재 사용자 | ~50명 (100명 도달 전 전환 목표) |

---

## 2. 의뢰 배경

현재 React 프론트엔드가 Supabase(BaaS)에 **직접** 연결되어 있어 확장 시 아래 문제가 예상됩니다.

| 문제 | 현황 | 위험도 |
|------|------|--------|
| 비용 폭증 | Supabase 요금 Row/API 호출 기준 | 🟡 중간 |
| 보안 감사 불가 | `ANON_KEY` 클라이언트 노출 구조 | 🔴 높음 |
| 서버 검증 부재 | 프론트→DB 직접 쓰기, 내용 검증 없음 | 🔴 높음 |
| Realtime 제한 | Supabase 연결 수 제한 | 🟡 중간 |

---

## 3. 이미 완료된 준비 작업 (Phase 0)

> 인수인계 받은 코드베이스에는 이미 아래 작업이 완료되어 있습니다.

### ✅ src/api/ 폴더 구조 (7개 파일)

```
src/api/
├── _client.js       ← ★ 단일 교체 포인트 (이 파일 1개만 교체하면 전체 전환)
├── auth.js          ← 로그인/세션/onAuthStateChange
├── matrix.js        ← ATT&CK 매트릭스 3테이블 CRUD
├── announcements.js ← 공지사항 CRUD
├── edu.js           ← 진행률·HTML 에디터 CRUD
├── feedback.js      ← 댓글/좋아요
└── admin.js         ← 감사로그·알림·유저관리
```

**_client.js 교체 예시 (Phase 1 착수 시):**
```js
// 현재 (Supabase)
export const client = supabase;

// 전환 후 (NestJS)
import axios from 'axios';
export const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });
```

### ✅ 훅 리팩터링 현황 (Phase 0 완료분)

| 훅 | 상태 | 비고 |
|---|---|---|
| `useMatrixData.js` | ✅ **api/ 완전 분리** | supabase import 제거 완료 |
| `useEduProgress.js` | ✅ **api/ 경유** | SELECT 쿼리 분리 완료 |
| `useAnnouncements.js` | ✅ **CRUD api/ 경유** | Realtime 채널만 직접 유지 |
| `useAdminNotifications.js` | ✅ **알림 CRUD api/ 경유** | Realtime 채널만 직접 유지 |
| `useAuditLogs.js` | ⏳ **Phase 1** | 동적 쿼리 빌더 → NestJS QueryBuilder 필요 |
| `useEduHtmlContent.js` | ⏳ **Phase 1** | getPublicIP + XSS 로직 결합 |
| `useFeedback.js` | ⏳ **Phase 1~2** | Realtime 2채널 + IDOR 트리 |
| `AuthContext.jsx` | ⏳ **Phase 2** | onAuthStateChange 실시간 리스너 |

---

## 4. 요청 작업 범위

### Phase 1 — 백엔드 구축 및 API 레이어 교체

#### Step 1: NestJS 프로젝트 셋업

```bash
# Supabase PostgreSQL 스키마 자동 추출 (재설계 불필요!)
npx prisma db pull   # → schema.prisma 자동 생성
```

#### Step 2: `src/api/_client.js` 1파일 교체

이 파일만 교체하면 Phase 0에서 완료된 훅들이 자동으로 NestJS를 바라봄.

#### Step 3: Phase 1 훅 완료 (이관 순서)

| 순서 | 대상 | 엔드포인트 수 | 예상 시간 |
|-----|------|-------------|---------|
| 1 | `useAuditLogs.js` (동적 필터링 쿼리) | 3개 | ~8h |
| 2 | `useEduHtmlContent.js` (IP 로깅 서버 이관) | 4개 | ~12h |
| 3 | `useFeedback.js` (non-realtime 분리) | 8개 | ~15h |
| 4 | `useAdminVerify.js` | 1개 | ~3h |
| 5 | 관리자 컴포넌트 직접 호출 정리 | ~10개 | ~20h |

### Phase 2 — 실시간 및 인증 전환 (별도 협의)

- Supabase Realtime → NestJS WebSocket Gateway
- `public/edu/progress-tracker.js` → NestJS API 엔드포인트
- `AuthContext.jsx` → JWT access/refresh token

---

## 5. 절대 하지 말아야 할 것

```
❌ React 컴포넌트, JSX, CSS, 라우팅 수정 금지
❌ 사용자 UI 텍스트, 레이아웃, 색상 변경 금지
❌ 기존 Supabase 테이블 스키마 변경 금지 (병렬 운영 기간)
❌ 프론트엔드에 새 npm 패키지 임의 추가 금지
❌ src/api/_client.js 이외의 파일 구조 변경 금지
```

---

## 6. 인수인계 자료

| 자료 | 경로 | 설명 |
|------|------|------|
| 전체 아키텍처 | `CLAUDE.md` | 라우팅 맵, DB 의존성, 마이그레이션 3단계 |
| API 레이어 | `src/api/` | 7개 파일, Phase 0 완료 상태 |
| DB 스키마 추출 | `npx prisma db pull` | Supabase URL/KEY 제공 시 자동 생성 |
| 폴백 데이터 | `src/data/matrix-fallback.json` | Supabase 장애 시 사용 |
| 외주 의뢰서 | `docs/outsourcing-brief.md` | 이 문서 |
| 환경 변수 | `.env` (별도 전달) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

---

## 7. ✅ 완료 기준 체크리스트 (Definition of Done)

### Phase 0 인수 확인 (개발자가 받자마자 체크)

| # | 검증 항목 | 확인 명령 / 기준 | 완료 |
|---|---------|----------------|-----|
| 1 | `src/api/` 폴더에 파일 7개 존재 | `ls src/api/` → 7개 파일 확인 | ☐ |
| 2 | `npm run build` 에러 0 (2918 modules 기준) | `npm run build` → 에러 없음 | ☐ |
| 3 | `useMatrixData.js` — supabase import 없음 | `grep "supabase" src/hooks/useMatrixData.js` → 결과 없음 | ☐ |
| 4 | `useAdminVerify.js` — api/auth.js 경유 import | `grep "api/auth" src/hooks/useAdminVerify.js` → 있음 | ☐ |
| 5 | `useEduProgress.js` — api/edu.js 경유 import | `grep "api/edu" src/hooks/useEduProgress.js` → 있음 | ☐ |
| 6 | `useAnnouncements.js` — api/announcements.js import | `grep "api/announcements" src/hooks/useAnnouncements.js` → 있음 | ☐ |
| 7 | `useAdminNotifications.js` — api/admin.js import | `grep "api/admin" src/hooks/useAdminNotifications.js` → 있음 | ☐ |

### Phase 1 완료 기준

#### 기능 검증

| # | 검증 항목 | 확인 방법 | 완료 |
|---|---------|---------|-----|
| 1 | 로그인 / 로그아웃 정상 동작 | 브라우저 직접 확인 | ☐ |
| 2 | 매트릭스 데이터 로드 (Supabase 없이 NestJS에서) | Supabase 접근 차단 후 매트릭스 페이지 확인 | ☐ |
| 3 | 교육 진행률 저장 / 조회 정상 | 챕터 완료 후 진행률 배지 확인 | ☐ |
| 4 | 공지사항 CRUD 정상 (관리자) | 관리자 → announce 탭 CRUD 동작 확인 | ☐ |
| 5 | 감사 로그 필터링 조회 정상 (관리자) | 관리자 → audit 탭 필터링 동작 확인 | ☐ |
| 6 | 커뮤니티 댓글 작성 / 삭제 정상 | 커뮤니티 → 댓글 작성 / 삭제 확인 | ☐ |
| 7 | 관리자 8탭 모두 오류 없음 | 8탭 순서대로 오류 없이 이동 확인 | ☐ |

#### 코드 검증

| # | 검증 항목 | 확인 명령 | 완료 |
|---|---------|---------|-----|
| 1 | `npm run build` 에러 0 유지 | `npm run build` | ☐ |
| 2 | `src/api/_client.js` 교체 후 전체 훅 동작 | _client.js → axios 교체 후 재빌드 | ☐ |
| 3 | Phase 1 이관 훅 — supabase 직접 import 제거 | `grep -n "supabase" src/hooks/useAuditLogs.js` → 0건 | ☐ |
| 4 | useEduHtmlContent.js — supabase import 제거 | `grep -n "supabase" src/hooks/useEduHtmlContent.js` → 0건 | ☐ |
| 5 | useFeedback.js (non-realtime 부분) — api/ 경유 | CRUD 함수 supabase 직접 호출 0건 확인 | ☐ |

#### 화면 무결성 검증

| # | 검증 항목 | 확인 방법 | 완료 |
|---|---------|---------|-----|
| 1 | 스크린샷 Before/After 비교 — 픽셀 차이 없음 | Playwright 또는 수동 스크린샷 비교 | ☐ |
| 2 | 모바일 반응형 깨짐 없음 | Chrome DevTools → 375px / 768px 확인 | ☐ |
| 3 | 다국어 (ko/en/ja/vi/ar) 전환 정상 | LangToggle 5개 언어 전환 후 UI 확인 | ☐ |

#### 안정성 검증

| # | 검증 항목 | 확인 방법 | 완료 |
|---|---------|---------|-----|
| 1 | Supabase 없이 30분 이상 무장애 운영 | Supabase 프로젝트 일시 중단 후 30분 모니터링 | ☐ |
| 2 | NestJS 서버 재시작 시 자동 복구 | `pm2 restart` 후 서비스 정상 확인 | ☐ |
| 3 | 에러 시 사용자 적절한 메시지 표시 | 네트워크 강제 차단 → 에러 토스트/메시지 확인 | ☐ |

### Phase 2 완료 기준

| # | 검증 항목 | 확인 명령 / 기준 | 완료 |
|---|---------|----------------|-----|
| 1 | Supabase Realtime 완전 제거 — WebSocket Gateway 대체 동작 | 실시간 알림 / 공지 변경 WS 수신 확인 | ☐ |
| 2 | JWT 로그인 흐름 (access + refresh token 발급/갱신) | 로그인 후 토큰 헤더 확인, 만료 후 자동 갱신 확인 | ☐ |
| 3 | `public/edu/progress-tracker.js` → NestJS API 호출 동작 | 챕터 완료 시 NestJS `/api/edu/progress` 요청 확인 | ☐ |
| 4 | Supabase 의존성 완전 제거 | `grep -r "supabase" src/` → 0건 | ☐ |
| 5 | 세션 타임아웃 (10분 유휴 → 자동 로그아웃) 동작 | 10분 비활동 후 자동 로그아웃 확인 | ☐ |

---

## 8. 예상 공수

| Phase | 내용 | 예상 시간 |
|-------|------|----------|
| 환경 설정 | NestJS + Prisma + DB 연결 | ~5h |
| Phase 1-A | 이미 완료된 4개 훅 검증 및 _client 교체 | ~10h |
| Phase 1-B | useAuditLogs, useEduHtmlContent, useFeedback | ~35h |
| Phase 1-C | 관리자 컴포넌트 직접 호출 정리 | ~25h |
| 테스트 및 검수 | 기능 검증, 스크린샷 비교, 안정성 테스트 | ~20h |
| **Phase 1 합계** | | **~95h** |
| Phase 2 (별도) | Realtime → WebSocket, JWT, progress-tracker | ~40h |

> 풀타임(주 40h) 기준 Phase 1: **약 2~3주** 소요

---

## 9. 기술 스택 요건

- **필수**: NestJS (TypeScript), Prisma ORM, PostgreSQL
- **우대**: Supabase 경험, WebSocket/Socket.io, JWT 구현, React (구조 파악용)
- **작업 성격**: 프론트엔드 수정 없이 백엔드만 신규 구축

---

## 10. 🚨 보안 즉시 조치 (착수 전 Supabase SQL Editor 실행 필수)

아래 3개 SQL이 미실행 상태입니다. 착수 전 반드시 완료를 확인하세요.

```sql
-- 1. access_logs: 이메일·IP 노출 차단 (🔴 긴급)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_logs_own_only" ON access_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. feedback_likes: user_id 노출 차단
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_likes_own" ON feedback_likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. announcements: 로그인 유저만 읽기
DROP POLICY IF EXISTS "announcements_public_read" ON announcements;
CREATE POLICY "announcements_auth_read" ON announcements
  FOR SELECT TO authenticated USING (true);
```

> ⚠️ 위 SQL 미실행 시 이메일·IP 데이터가 누구나 조회 가능한 상태입니다.

---

*갓루트 에듀 운영팀 | docs/outsourcing-brief.md | v2.0*

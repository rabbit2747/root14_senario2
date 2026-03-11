# Gotroot 보안 히스토리

> 보안 관련 변경 사항을 시간순으로 기록합니다.
> 각 버전별 상세 내용은 개별 마크다운 파일을 참조하세요.

## 타임라인

| 버전 | 날짜 | 분류 | 요약 | 상세 파일 |
|------|------|------|------|-----------|
| v0.9.4 | 2026-03-08 | 🔴 Critical | Vite dev server 소스코드 외부 노출 차단 | [v0.9.4-vite-exposure.md](./v0.9.4-vite-exposure.md) |
| v0.9.7 | 2026-03-09 | 🟡 Medium | ?preview=1 인증 우회 코드 제거 | [v0.9.7-preview-bypass.md](./v0.9.7-preview-bypass.md) |
| v0.9.7 | 2026-03-09 | 🔴 Critical | Express 서버 교체 — edu HTML 서버 측 JWT 인증 | [v0.9.7-express-auth.md](./v0.9.7-express-auth.md) |
| v0.9.7 | 2026-03-10 | 🟢 Hardening | 보안 헤더 강화 — CSP 경로 분리, Permissions-Policy, CORP | [v0.9.7-express-auth.md](./v0.9.7-express-auth.md#보안-헤더-강화-2026-03-10-추가) |

## 미해결 보안 사항

| 항목 | 심각도 | 상태 | 비고 |
|------|--------|------|------|
| Lab scenario JSON (170개) | 🟡 Low | 미조치 | JS 번들 내장, Express로 보호 불가. NestJS API 전환 시 해결 |
| React SPA 번들 내 컴포넌트 | 🟡 Low | 미조치 | GraphicExplanation/Scenario 등. NestJS SSR 전환 시 해결 |
| Supabase RLS (access_logs, feedback_likes) | 🔴 Critical | 미조치 | SQL Editor에서 사용자 직접 실행 필요 |
| announcements 공개 읽기 | 🟡 Medium | 미조치 | SQL Editor에서 사용자 직접 실행 필요 |

## 보안 아키텍처 현황

```
[브라우저]
  ├─ SPA (React)
  │   └─ sessionStorage 기반 Supabase Auth
  │       └─ AuthContext.jsx → gotroot_auth_token 쿠키 동기화
  │
  ├─ edu HTML (200개)
  │   ├─ 클라이언트: sessionStorage 인증 체크 (JS)
  │   └─ 서버: Express 쿠키 JWT 인증 (v0.9.7~)
  │
  └─ 정적 에셋 (JS/CSS/이미지)
      └─ 인증 없음 (공개)

[서버]
  ├─ Express (server.js) — port 4173, bind 0.0.0.0
  │   ├─ /edu/*.html → 쿠키 JWT 검증 (Supabase API + 5분 캐시)
  │   ├─ /edu/*.js|css → 공개 (지원 스크립트)
  │   ├─ /assets/* → 공개 (빌드 에셋)
  │   └─ /* → SPA 폴백 (index.html)
  │
  ├─ 보안 헤더 (v0.9.7 2026-03-10~)
  │   ├─ 공통: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
  │   │        Referrer-Policy, Permissions-Policy(9 API 차단), COOP
  │   ├─ SPA 전용: CSP(서버 헤더), CORP=same-origin
  │   ├─ edu 전용: CSP 없음(자체 meta), CORP=cross-origin
  │   └─ 비활성: HSTS, upgrade-insecure-requests (HTTP 직접 서빙 → HTTPS 도입 후 활성화)
  │
  └─ Supabase (BaaS)
      ├─ Auth: 이메일/비밀번호
      ├─ Database: PostgreSQL (RLS 일부 적용)
      └─ Realtime: 피드백 구독
```

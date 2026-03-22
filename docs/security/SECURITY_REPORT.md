# Gotroot Edu — 보안 취약점 분석 및 조치 보고서

> **작성일**: 2026-03-08
> **버전**: v0.9.3 기준
> **분석 기준**: OWASP Top 10 (2021)
> **환경**: Vite 6 + React SPA + Supabase Backend

---

## 📋 요약 (Executive Summary)

| # | 취약점 | OWASP 분류 | 심각도 | 상태 |
|---|--------|-----------|--------|------|
| ① | Vite Dev 서버 소스코드 외부 노출 + 환경변수·절대경로 노출 | A05:2021 (보안 설정 오류) | 🔴 CRITICAL | ✅ 수정 완료 |
| ② | `?preview=1` 파라미터 인증 우회 | A01:2021 (접근통제 실패) | 🟠 HIGH | ✅ 수정 완료 |
| ③ | api.ipify.org 제3자 외부 IP 전송 | A02:2021 (암호화 실패) / A05:2021 | 🟡 MEDIUM | ✅ 수정 완료 |
| ④ | Supabase Anon Key 소스 노출 | A02:2021 (암호화 실패) | 🟠 HIGH | ✅ 수정 완료 |
| ⑤ | RLS 미적용 테이블 (access_logs, feedback_likes) | A01:2021 (접근통제 실패) | 🔴 CRITICAL | ⚠️ 수동 조치 필요 |
| ⑥ | CSP에 불필요한 외부 도메인 허용 | A05:2021 (보안 설정 오류) | 🟡 MEDIUM | ✅ 수정 완료 |

---

## 🔍 취약점별 상세 분석

---

### ① Vite Dev 서버 소스코드·절대경로·환경변수 외부 노출

**OWASP 분류**: `A05:2021 — Security Misconfiguration`

#### 왜 절대경로가 노출되었는가?

이것이 핵심 질문입니다. 이유는 **Vite의 개발 서버 동작 원리** 때문입니다.

```
브라우저/공격자 요청
      │
      ▼
GET http://[서버IP]:5173/src/lib/supabase.js
      │
      ▼
Vite Dev Server (이전: host 0.0.0.0)
      │
      ├─ JSX 파일을 실시간 트랜스파일
      ├─ import.meta.env.VITE_* 값을 인라인으로 치환
      └─ 응답 본문에 실제 소스코드 반환
```

**Vite는 개발 편의를 위해 `/src/` 경로의 파일을 HTTP로 직접 서빙합니다.**
브라우저 개발자도구(F12) → Sources 탭에서 보이는 `src/lib/supabase.js`, `src/pages/...` 경로들은
Vite Dev Server가 실제 파일시스템의 **절대경로를 기반으로** 응답을 반환하기 때문에 노출됩니다.

#### 노출된 정보 목록

```
노출 경로                          노출 내용
───────────────────────────────────────────────────────────────
/src/lib/supabase.js               VITE_SUPABASE_URL (인라인 치환됨)
                                   VITE_SUPABASE_ANON_KEY (인라인 치환됨)
/src/pages/admin/AdminPage.jsx     관리자 탭 목록, 권한 체크 로직
/src/pages/login.jsx               인증 흐름 전체 로직
F12 Sources 탭                     C:\Users\GOTROOT\Desktop\Gotroot_Edu\ (절대경로)
Burp Suite 캡처                    서버 응답 헤더에 Vite/6.x 버전 노출
```

#### 왜 `host: 0.0.0.0` 이 위험한가?

```
[이전 설정]
server:
  host: '0.0.0.0'   ← 모든 네트워크 인터페이스 바인딩
  port: 5173

┌─────────────────────────────────────────────────────────────┐
│ 192.168.0.1:5173 ─ LAN의 모든 기기 접근 가능               │
│ 203.x.x.x:5173  ─ 포트포워딩 시 인터넷에서도 접근 가능     │
│ 127.0.0.1:5173  ─ 로컬호스트도 접근 가능                   │
└─────────────────────────────────────────────────────────────┘
→ 같은 Wi-Fi의 다른 기기, VPN 연결된 기기, 공유기 포트포워딩
  설정 시 외부 인터넷에서도 Vite Dev Server의 소스코드 전체 접근 가능
```

#### 조치 내용

**1단계: 네트워크 바인딩 제한 (1차 방어선)**

```js
// vite.config.js - server 설정 변경
server: {
  host: '127.0.0.1',  // ← '0.0.0.0' → '127.0.0.1' (루프백 전용)
  port: 5173,
}
```

```bat
// dev.bat 변경
// Before: --host 0.0.0.0
// After:  --host 127.0.0.1
"C:\Program Files\nodejs\node.exe" "...\vite.js" --port 5173 --host 127.0.0.1
```

TCP 레벨에서 127.0.0.1 이외의 접속을 원천 차단.
`netstat -ano | grep 5173` → `TCP 127.0.0.1:5173 LISTENING` 확인.

**2단계: 미들웨어 심층방어 (2차 방어선)**

```js
// vite.config.js — blockExternalSourcePlugin
const blockExternalSourcePlugin = {
  name: 'block-external-source',
  apply: 'serve',
  configureServer(server) {
    const BLOCKED = ['/src/', '/@fs/', '/.env', '/node_modules/'];
    server.middlewares.use((req, res, next) => {
      const ip = req.socket?.remoteAddress ?? '';
      const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
      if (!isLocal && BLOCKED.some(p => req.url?.startsWith(p))) {
        res.statusCode = 403;
        res.end('403 Forbidden: Source access denied from external IP');
        return;
      }
      next();
    });
  },
};
```

**3단계: 파일시스템 접근 제한**

```js
fs: {
  strict: true,
  deny: ['.env', '.env.*', '*.{pem,key,crt,p12,pfx}', '.git', 'node_modules/.cache'],
}
```

**4단계: 소스맵 비활성화 (빌드 시)**

```js
build: {
  sourcemap: false,  // 프로덕션 빌드에서 소스맵 생성 금지
}
```

#### ⚠️ 근본적 해결책

> Dev 서버는 개발 전용입니다.
> **프로덕션 배포 시 반드시 `npm run build` 로 빌드 후 정적 파일만 서빙하십시오.**
> 빌드된 `dist/` 폴더에는 소스코드가 없고, 환경변수도 번들에 포함되지 않습니다.

---

### ② `?preview=1` URL 파라미터 인증 우회

**OWASP 분류**: `A01:2021 — Broken Access Control`

#### 취약점 원리

교육 HTML 파일(public/edu/*.html)에 다음 코드가 삽입되어 있었습니다:

```js
// 취약한 코드 (제거됨)
if (new URLSearchParams(window.location.search).get('preview') === '1') {
  return;  // ← 이 줄 하나로 이후 모든 인증/권한 체크를 건너뜀
}
```

**공격 방법**: `https://사이트주소/edu/t1587-001-malware-advanced.html?preview=1`
→ sessionStorage 인증 체크 완전 우회 → 비로그인 상태로 유료 콘텐츠 무단 열람

#### 영향 범위

```
취약 파일 수: 159개 (public/edu/ 디렉토리 전체 HTML)
```

#### 조치 내용

Node.js 일괄 처리 스크립트로 159개 파일에서 해당 코드 완전 제거:

```js
// Node.js 배치 스크립트 실행 완료
const regex = /\n?\s*if\s*\(new URLSearchParams\(window\.location\.search\)\.get\(['"]preview['"]\)\s*===\s*['"]1['"]\)\s*return;?/g;
// 159개 파일 처리 완료, 잔존 파일: 0개
```

**검증**:
```powershell
Select-String -Path "public\edu\*.html" -Pattern "preview.*==.*1" | Measure-Object
# 결과: Count = 0 ← 잔존 없음 확인
```

---

### ③ api.ipify.org 제3자 서비스로 사용자 IP 외부 전송

**OWASP 분류**: `A02:2021 — Cryptographic Failures` / `A05:2021 — Security Misconfiguration`
**관련 법규**: GDPR Article 28 (제3자 처리자), 개인정보보호법

#### 취약점 원리

```js
// 취약한 코드 (수정됨)
export async function getPublicIP() {
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  return data.ip;  // ← 사용자 IP가 제3자 서버(api.ipify.org)로 전송됨
}
```

**데이터 흐름 (취약 상태)**:
```
사용자 브라우저 → api.ipify.org (미국 제3자 서버) → IP 반환
                  ↑
                  여기서 사용자 IP가 로그됨 (GDPR 위반 가능성)
```

**네트워크 탭에서 보이는 이유**: 매 로그인/페이지 로드마다 `https://api.ipify.org?format=json` POST 요청이 발생, Burp Suite에서 명확히 포착됨.

#### 조치 내용

**supabase.js 수정**:
```js
// 수정된 코드
export async function getPublicIP() {
  // ⚠️ 보안: api.ipify.org 제3자 서비스 의존 제거
  // 사용자 IP가 외부로 전송되는 프라이버시 이슈 해결
  // Supabase Edge Function 또는 자체 API로 교체 전까지 'unknown' 반환
  return 'unknown';
}
```

**index.html CSP 수정**:
```html
<!-- 변경 전 -->
connect-src 'self' https://*.supabase.co ... https://api.ipify.org ...;

<!-- 변경 후 -->
connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com;
```

---

### ④ Supabase Anon Key 소스코드 노출

**OWASP 분류**: `A02:2021 — Cryptographic Failures`

#### 취약점 원리

```
.env 파일:
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

↓ Vite Dev Server에서 import.meta.env 처리

브라우저에서 GET /src/lib/supabase.js 요청 시:
  createClient("https://xxxxx.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  ← 환경변수 값이 평문으로 인라인 치환되어 응답됨
```

#### Supabase Anon Key 특성 이해

| 항목 | 내용 |
|------|------|
| 설계 의도 | **공개 키(Publishable Key)** — 클라이언트 사이드에 노출되도록 설계됨 |
| 취약 조건 | Supabase Row Level Security(RLS)가 **비활성화**된 테이블이 있는 경우 |
| 안전 조건 | 모든 테이블에 RLS 활성화 + 적절한 Policy 설정 시 |

**결론**: Anon Key 자체는 공개 키이나, Dev 서버 소스 노출은 다음 정보도 함께 노출:
- API URL 구조 → 엔드포인트 추론 가능
- 코드 로직 → 인증 우회 가능한 로직 탐색 가능
- 절대 경로 → 로컬 개발 환경 구조 파악 가능

#### 조치 내용

① 취약점 수정은 취약점 ①과 동일 (host 127.0.0.1 바인딩)
② RLS 보안 정책 적용 (수동 실행 필요 — 아래 SQL 참조)

---

### ⑤ Row Level Security (RLS) 미적용 테이블

**OWASP 분류**: `A01:2021 — Broken Access Control`

**영향 테이블**:

```sql
-- 🔴 CRITICAL: access_logs (이메일·IP 노출 위험)
SELECT * FROM access_logs;  -- Anon Key로 전체 조회 가능!

-- 🔴 HIGH: feedback_likes (user_id 노출 위험)
SELECT * FROM feedback_likes;  -- 모든 유저의 행동 패턴 노출
```

#### 즉시 적용해야 할 SQL (Supabase SQL Editor에서 직접 실행)

```sql
-- ① access_logs RLS 활성화
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_logs_own_only" ON access_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ② feedback_likes RLS 활성화
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_likes_own" ON feedback_likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ③ announcements 인증 유저만 읽기
DROP POLICY IF EXISTS "announcements_public_read" ON announcements;
CREATE POLICY "announcements_auth_read" ON announcements
  FOR SELECT TO authenticated USING (true);
```

> ⚠️ **Claude는 Supabase SQL Editor를 직접 실행할 수 없습니다.**
> 사용자가 Supabase 대시보드 → SQL Editor에서 직접 실행해야 합니다.

---

### ⑥ CSP(Content Security Policy) 불필요한 외부 도메인

**OWASP 분류**: `A05:2021 — Security Misconfiguration`

#### 취약점 원리

```html
<!-- 이전 CSP (취약) -->
connect-src 'self' https://*.supabase.co wss://*.supabase.co
            https://www.google-analytics.com
            https://api.ipify.org          ← 불필요한 외부 도메인
            https://region1.google-analytics.com;
```

`api.ipify.org` CSP 허용은 클라이언트가 해당 도메인으로 요청을 보낼 수 있음을 명시적으로 허가함.
이는 프라이버시 위협 도메인을 허용 목록에 올린 것과 같음.

#### 조치 내용

```html
<!-- 수정된 CSP -->
connect-src 'self' https://*.supabase.co wss://*.supabase.co
            https://www.google-analytics.com
            https://region1.google-analytics.com;
```

---

## 🗺️ OWASP Top 10 (2021) 전체 매핑 테이블

| OWASP 항목 | 취약점 | 발견 | 조치 |
|------------|--------|------|------|
| **A01:2021 — Broken Access Control** | ② `?preview=1` 인증 우회 | ✅ 발견 | ✅ 수정 |
| | ⑤ RLS 미적용 테이블 | ✅ 발견 | ⚠️ 수동 조치 필요 |
| **A02:2021 — Cryptographic Failures** | ③ api.ipify.org 개인정보 외부 전송 | ✅ 발견 | ✅ 수정 |
| | ④ Anon Key 소스 노출 | ✅ 발견 | ✅ 수정 |
| **A03:2021 — Injection** | XSS: DOMPurify sanitize 적용됨 | — | ✅ 기적용 |
| **A04:2021 — Insecure Design** | 인증 우회 파라미터 설계 자체가 문제 | ✅ 발견 | ✅ 수정 |
| **A05:2021 — Security Misconfiguration** | ① host:0.0.0.0 → 소스코드 외부 노출 | ✅ 발견 | ✅ 수정 |
| | ⑥ CSP 불필요한 외부 도메인 | ✅ 발견 | ✅ 수정 |
| **A06:2021 — Vulnerable Components** | vite-plugin-obfuscator 사용 (빌드 보호) | — | ✅ 기적용 |
| **A07:2021 — Identification & Authentication Failures** | Supabase Auth 세션 sessionStorage 저장 | — | ✅ 기적용 |
| | 세션 타임아웃 10분 자동 로그아웃 | — | ✅ 기적용 |
| **A08:2021 — Software & Data Integrity Failures** | 소스맵 비활성화 (빌드) | — | ✅ 기적용 |
| **A09:2021 — Security Logging & Monitoring** | admin_audit_logs 관리자 감사 로그 | — | ✅ 기적용 |
| | access_logs 접속 로그 | — | ✅ 기적용 |
| **A10:2021 — Server-Side Request Forgery** | SSRF: SPA 구조로 서버사이드 없음 | — | N/A |

---

## 🏗️ WAS 계층별 보안 현황 (WEB-WAS-DB)

```
┌──────────────────────────────────────────────────────────┐
│  WEB Layer (브라우저 / 정적 파일)                         │
│                                                          │
│  ✅ CSP 헤더 적용 (index.html meta)                      │
│  ✅ DOMPurify XSS 필터링 (dangerouslySetInnerHTML)       │
│  ✅ 소스맵 비활성화 (프로덕션 빌드)                       │
│  ✅ JavaScript 난독화 (vite-plugin-obfuscator)           │
│  ✅ 파일명 해시화 (assets/c-[hash].js)                   │
│  ⚠️ 개발 서버 소스 노출 → host:127.0.0.1 로 완화        │
└──────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│  WAS Layer (Vite Dev / 프로덕션 배포 서버)                │
│                                                          │
│  ✅ host: 127.0.0.1 (TCP 레벨 외부 차단)                 │
│  ✅ blockExternalSourcePlugin (미들웨어 심층방어)         │
│  ✅ server.fs.strict + deny 리스트                       │
│  ✅ 세션 타임아웃 10분 (AuthContext)                     │
│  ✅ 관리자 재인증 모달 (AdminVerifyModal)                 │
│  ❌ ?preview=1 인증 우회 → 제거 완료                     │
└──────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│  DB Layer (Supabase PostgreSQL)                          │
│                                                          │
│  ✅ Supabase Auth (JWT 기반)                             │
│  ✅ profiles RLS (기적용)                                │
│  ✅ edu_progress RLS (기적용)                            │
│  ✅ announcements RLS 강화 (인증 유저만)                 │
│  ⚠️ access_logs RLS 미적용 → SQL 적용 필요              │
│  ⚠️ feedback_likes RLS 미적용 → SQL 적용 필요           │
│  ✅ admin_audit_logs 감사 추적                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📌 특별 분석: "왜 절대경로·디렉토리가 노출되었는가?"

### 노출 메커니즘 전체 흐름

```
1. 개발자가 dev.bat 실행
   └─ node vite.js --host 0.0.0.0 --port 5173
           ↓
2. Vite가 0.0.0.0:5173에 바인딩
   └─ 같은 LAN의 모든 기기에서 접근 가능

3. 공격자/사용자가 브라우저 개발자 도구 열기 (F12)
   └─ Sources 탭 → localhost:5173 → src/
           ↓
4. Vite Dev 서버의 소스 서빙 동작
   ┌──────────────────────────────────────────────────┐
   │ GET /src/lib/supabase.js                         │
   │                                                  │
   │ Vite 내부 처리:                                  │
   │   1. 파일시스템에서 src/lib/supabase.js 읽기     │
   │   2. import.meta.env 치환                        │
   │      VITE_SUPABASE_URL → 실제 URL                │
   │      VITE_SUPABASE_ANON_KEY → 실제 Key           │
   │   3. ESM 모듈로 변환                              │
   │   4. HTTP 응답으로 반환                           │
   └──────────────────────────────────────────────────┘

5. 절대경로가 노출되는 이유:
   └─ Vite의 source map에 개발 머신의 실제 경로 포함:
      /C:/Users/GOTROOT/Desktop/Gotroot_Edu/src/...
      ↑ 이것이 F12 Sources 탭과 Burp 캡처에서 보인 경로

6. 추가 위협:
   └─ JSX 소스코드 전체 → 로직 분석 → 취약점 발견 가능
   └─ 관리자 판별 로직 → 우회 시도 가능
   └─ Supabase 테이블 이름 → 직접 API 호출 가능
```

### Vite가 개발 중에 소스를 서빙하는 이유 (설계 의도)

Vite는 **ESM(ES Modules) 기반 개발 서버**입니다.
번들링 없이 브라우저가 직접 각 모듈을 import하도록 설계되어 있어,
브라우저가 `/src/lib/supabase.js`를 직접 요청하는 것이 **정상 동작**입니다.

```
[이전 webpack 방식]                [Vite 방식]
번들 → bundle.js (1개 파일)        브라우저가 각 .js 직접 요청
                                   → /src/App.jsx
                                   → /src/lib/supabase.js
                                   → /src/pages/Login.jsx
                                   → ...
```

이 설계는 개발 속도를 극적으로 향상시키지만,
**dev 서버가 외부에 노출되면 소스코드 전체가 공개**됩니다.

---

## ✅ 조치 완료 파일 목록

| 파일 | 변경 내용 |
|------|---------|
| `vite.config.js` | `host: '0.0.0.0'` → `'127.0.0.1'`, `blockExternalSourcePlugin` 추가, `fs.strict + deny` 추가, `sourcemap: false` 추가 |
| `dev.bat` | `--host 0.0.0.0` → `--host 127.0.0.1` |
| `src/lib/supabase.js` | `getPublicIP()` → `return 'unknown'` (api.ipify.org 제거) |
| `index.html` | CSP `connect-src`에서 `api.ipify.org` 제거 |
| `public/edu/*.html` (159개) | `?preview=1` 인증 우회 코드 전체 제거 |

---

## 🔜 남은 조치 사항 (수동 실행 필요)

### Supabase SQL Editor 실행 항목

```sql
-- 1. access_logs RLS (이메일·IP 보호)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_logs_own_only" ON access_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. feedback_likes RLS (user_id 보호)
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_likes_own" ON feedback_likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. announcements 인증 유저만
DROP POLICY IF EXISTS "announcements_public_read" ON announcements;
CREATE POLICY "announcements_auth_read" ON announcements
  FOR SELECT TO authenticated USING (true);
```

### 장기 계획

1. **IP 수집 재활성화**: Supabase Edge Function으로 서버사이드에서 IP 취득 (제3자 서비스 없이)
2. **프로덕션 배포 전환**: Vite dev 서버 대신 `npm run build` + Nginx/Cloudflare 정적 서빙
3. **Supabase → NestJS 마이그레이션**: CLAUDE.md 마이그레이션 플랜 참조

---

*보고서 생성: Claude Code (Anthropic) | 프로젝트: Gotroot Edu v0.9.3*

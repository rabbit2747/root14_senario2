# 04. Education HTML Pages - 외부 교육 콘텐츠

## Meta
| Key | Value |
|-----|-------|
| Route | `/edu/*.html` (Express static serving) |
| Location | `public/edu/` (203개 HTML 파일) |
| Auth | 서버 JWT 쿠키 인증 (v0.9.7~) |
| Environment | SPA 밖 — 독립 HTML, 자체 CSS/JS |

## Purpose
MITRE ATT&CK 테크닉별 실제 교육 콘텐츠.
React SPA가 아닌 순수 HTML 페이지로, `window.location.href`로 진입.
서버(Express)가 JWT 쿠키(`gotroot_auth_token`)를 검증 후 서빙.

## Architecture
```
[CourseSelector.jsx]
  ↓ window.location.href = '/edu/t1587-001-beginner.html'
  ↓ (SPA 컨텍스트 벗어남)

[Express server.js]
  ↓ /edu/*.html 미들웨어
  ↓ req.cookies.gotroot_auth_token 읽기
  ↓ Supabase /auth/v1/user API로 JWT 검증 (5분 캐시)
  ↓ 유효 → 파일 서빙
  ↓ 무효 → 302 → /login?redirect={path}

[HTML Page]
  ↓ <html data-technique-id="T1587.001" data-level="beginner">
  ↓ progress-tracker.js 로드 → 챕터 완료 추적
  ↓ breadcrumb.js 로드 → 네비게이션 브레드크럼
  ↓ graphic-link.js 로드 → "다음 단계" 버튼 주입
```

## Injected JavaScript Files

### progress-tracker.js
```javascript
// 역할: 챕터 완료를 감지하여 Supabase에 기록
// 동작:
//   1. <html data-technique-id="T1587.001" data-level="beginner"> 읽기
//   2. IntersectionObserver로 .section-observe 요소 관찰 (threshold: 0.8)
//   3. 80% 이상 보이면 해당 챕터 "완료" 처리
//   4. Supabase edu_progress 테이블에 UPSERT:
//      { user_id, technique_id, chapter_id, level }
//   5. localStorage에도 병렬 저장 (오프라인 폴백):
//      gotroot_edu_progress[techniqueId][level] = [ch1, ch2, ...]
//
// Supabase 인증: gotroot_auth_token 쿠키에서 JWT 추출
// 정규식: /^(ch\d+|quiz|eval)$/ — 유효한 chapter ID 패턴
```

### breadcrumb.js
```javascript
// 역할: 페이지 상단에 네비게이션 브레드크럼 삽입
// 데이터: sessionStorage['gotroot_nav_state'].breadcrumb (배열)
// 렌더: Home / Matrix / Technique / Course → [현재 페이지]
// 중복 방지: 마지막 경로 비교 dedup (v0.9.6)
```

### graphic-link.js
```javascript
// 역할: 페이지 하단에 "다음 단계: 그래픽 설명" 버튼 삽입
// 동작:
//   1. <html data-technique-id data-level> 읽기
//   2. URL 생성: /edu/graphic/{techniqueId}/{level}
//   3. 스타일된 CTA 버튼 섹션 자동 삽입
//   4. 클릭 시 SPA 라우트로 전체 페이지 이동
```

## HTML Structure Pattern
```html
<!DOCTYPE html>
<html data-technique-id="T1587.001" data-level="beginner">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="...">  <!-- 자체 CSP -->
  <title>T1587.001 - Malware Development (Beginner)</title>
  <link rel="stylesheet" href="/edu/styles/edu-common.css">
</head>
<body>
  <div id="breadcrumb-root"></div>  <!-- breadcrumb.js 삽입 지점 -->

  <section class="section-observe" data-chapter-id="ch1">
    <h2>Chapter 1: 악성코드 개발 개요</h2>
    <!-- 교육 콘텐츠 -->
  </section>

  <section class="section-observe" data-chapter-id="ch2">
    <h2>Chapter 2: ...</h2>
    <!-- 교육 콘텐츠 -->
  </section>

  <!-- ... 더 많은 챕터 ... -->

  <div id="graphic-link-root"></div>  <!-- graphic-link.js 삽입 지점 -->

  <script src="/edu/progress-tracker.js"></script>
  <script src="/edu/breadcrumb.js"></script>
  <script src="/edu/graphic-link.js"></script>
</body>
</html>
```

## Security
| Measure | Description |
|---------|------------|
| Server JWT Auth | Express 미들웨어, gotroot_auth_token 쿠키 (v0.9.7) |
| CSP | 자체 meta 태그 CSP (SPA CSP와 별도) |
| CORP | cross-origin 허용 (edu 리소스 공유 필요) |
| ?preview=1 제거 | 인증 우회 파라미터 완전 제거 (v0.9.4, 201개) |

## File Count by Level
```
총 203개 HTML 파일
├── novice:       ~30개
├── beginner:     ~100개 (가장 많음)
├── intermediate: ~50개
├── advanced:     ~15개
└── expert:       ~8개
```

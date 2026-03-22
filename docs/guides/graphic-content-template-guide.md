# GOTROOT 그래픽 설명 콘텐츠 제작 가이드

> 작성 기준: v0.9.9 (2026-03-10)
> 대상: `src/data/graphic-contents/` 내 슬라이드 JSX 파일 제작·수정
> 참고: CinematicPlayer (GraphicExplanationPage.jsx) 가 렌더링

---

## 1. 아키텍처 개요

```
사용자 흐름:
  CourseSelector → [교육 HTML] → graphic-link.js 클릭
    → /edu/graphic/:techniqueId/:level (SPA)
      → GraphicExplanationPage.jsx
        → CinematicPlayer (1280×720 고정, CSS transform scale 반응형)
          → src/data/graphic-contents/{techniqueId}-{level}.jsx (슬라이드 데이터)
```

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `GraphicExplanationPage.jsx` | 페이지 컴포넌트 + CinematicPlayer + CSS 테마 |
| `src/data/graphic-contents/{id}-{level}.jsx` | **슬라이드 콘텐츠 + 자막** (이 파일을 만듦) |
| `src/data/edu-meta.json` | 기법 메타데이터 (title, levels 등) |

---

## 2. 새 콘텐츠 파일 생성 절차

### Step 1: 파일 생성

```
경로: src/data/graphic-contents/{techniqueId}-{level}.jsx
예시: src/data/graphic-contents/T1566.001-beginner.jsx
```

**파일명 규칙**: `{MITRE ID 그대로}-{level}.jsx`
- 기법 ID는 대문자+점 그대로 유지 (예: `T1566.001`)
- 레벨: `novice` / `beginner` / `intermediate` / `advanced` / `expert`

### Step 2: GRAPHIC_DATA_LOADERS 등록

`src/pages/GraphicExplanationPage.jsx` 상단의 두 맵에 추가:

```jsx
// ── 그래픽 콘텐츠 동적 로딩 맵 ──
const GRAPHIC_COMPONENTS = {
  'T1587.001-beginner': React.lazy(() => import(...)),
  'T1566.001-beginner': React.lazy(() => import(...)),  // ← 추가
};

const GRAPHIC_DATA_LOADERS = {
  'T1587.001-beginner': () => import('../data/graphic-contents/T1587.001-beginner'),
  'T1566.001-beginner': () => import('../data/graphic-contents/T1566.001-beginner'),  // ← 추가
};
```

### Step 3: 빌드 및 배포

```bash
npm run build && pm2 restart gotroot-prod
```

---

## 3. 콘텐츠 파일 구조 (필수 export)

```jsx
// src/data/graphic-contents/{id}-{level}.jsx
import React from 'react';

// ═══ 1. 자막 배열 (TTS + 자막 표시) ═══
// 배열 길이 = 슬라이드 수 (1:1 매핑)
export const subtitlesData = [
  "슬라이드 1 자막 — TTS가 읽어줄 텍스트",
  "슬라이드 2 자막",
  // ...
  "마지막 슬라이드 자막"
];

// ═══ 2. 슬라이드 렌더 함수 ═══
// CinematicPlayer가 호출하는 렌더 함수
export function renderSlides({ currentSlide, confettiParticles, onRestart }) {
  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`}>
        ...
      </div>

      {/* Slide 2 */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        ...
      </div>

      {/* ... 중간 슬라이드들 ... */}

      {/* Slide N: Outro */}
      <div className={`slide ${currentSlide === N-1 ? 'active' : ''}`}>
        ...
      </div>
    </>
  );
}
```

### 필수 규칙

| 항목 | 규칙 |
|------|------|
| **export** | `subtitlesData` (배열) + `renderSlides` (함수) 필수 |
| **슬라이드 수** | `subtitlesData.length` === 슬라이드 `<div>` 개수 (불일치 시 TTS 오동작) |
| **className** | 반드시 `slide ${currentSlide === N ? 'active' : ''}` 패턴 |
| **Intro 슬라이드** | index 0, 대형 아이콘 + 제목 + 부제 |
| **Outro 슬라이드** | 마지막 index, `confettiParticles` + `onRestart` 사용 |
| **해상도** | 1280×720px 기준 레이아웃 (CinematicPlayer가 scale 처리) |

---

## 4. 슬라이드 CSS 클래스 레퍼런스

CinematicPlayer에 내장된 PLAYER_STYLES에서 사용 가능한 클래스:

### 4-1. 레이아웃

| 클래스 | 용도 |
|--------|------|
| `.slide` | 슬라이드 래퍼 (필수) |
| `.slide-header` | 상단 제목 바 (아이콘 + 텍스트) |
| `.slide-content` | 콘텐츠 영역 (flex-1) |
| `.center-layout` | 중앙 정렬 (text-align: center, flex-col) |
| `.grid-2` | 2칸 그리드 (좌우 분할) |
| `.grid-3` | 3칸 그리드 |

### 4-2. 카드 & 리스트

| 클래스 | 용도 |
|--------|------|
| `.card` | 기본 카드 (상단 파란 바) |
| `.card.purple` | 상단 보라 바 |
| `.card.red` | 상단 빨간 바 |
| `.card-icon` | 카드 내 대형 아이콘 |
| `.info-list` | 순서형 리스트 (`>` 표시) |
| `.info-list.malware` | 빨간 `>` 표시 |
| `.callout` | 파란 강조 박스 |
| `.callout.malware` | 빨간 강조 박스 |

### 4-3. 타이포그래피

| 클래스 | 용도 |
|--------|------|
| `.title` | 메인 제목 (64px) |
| `.title.large` | 대형 제목 (80px) |
| `.title span` | 그라데이션 텍스트 (blue→purple) |
| `.slide-header.malware-header i` | 헤더 아이콘 빨간색 |

### 4-4. 애니메이션

| 클래스 | 효과 | 타이밍 |
|--------|------|--------|
| `.anim-el.delay-1` | 슬라이드 업 페이드인 | 0.2s |
| `.anim-el.delay-2` | 슬라이드 업 페이드인 | 0.6s |
| `.anim-el.delay-3` | 슬라이드 업 페이드인 | 1.0s |
| `.anim-el.delay-4` | 슬라이드 업 페이드인 | 1.4s |
| `.anim-el.delay-5` | 슬라이드 업 페이드인 | 1.8s |
| `.anim-el.delay-6` | 슬라이드 업 페이드인 | 2.2s |
| `.anim-scale.scale-delay-1` | 스케일 업 바운스 | 0.4s |
| `.anim-scale.scale-delay-2` | 스케일 업 바운스 | 0.8s |
| `.anim-scale.scale-delay-3` | 스케일 업 바운스 | 1.2s |
| `.anim-fade` | 단순 페이드인 | CSS로 직접 지정 |
| `.float` | 위아래 부유 (무한) | 3s 주기 |
| `.malware-pulse` | 빨간 글로우 펄스 (무한) | 1.5s 주기 |

### 4-5. CSS 변수 (테마 자동 전환)

| 변수 | 다크 모드 | 라이트 모드 |
|------|-----------|-------------|
| `--accent-blue` | #38bdf8 | #0284c7 |
| `--accent-purple` | #a855f7 | #7e22ce |
| `--accent-red` | #f43f5e | #e11d48 |
| `--accent-green` | #10b981 | #059669 |
| `--text-main` | #f8fafc | #0f172a |
| `--text-muted` | #94a3b8 | #64748b |
| `--card-bg` | rgba(255,255,255,0.03) | rgba(0,0,0,0.02) |
| `--card-border` | rgba(255,255,255,0.05) | rgba(0,0,0,0.08) |

**중요**: 색상은 반드시 CSS 변수 사용 (다크/라이트 테마 자동 대응)

### 4-6. 특수 효과

| 클래스/구조 | 용도 |
|------------|------|
| `.data-line.red` | 데이터 이동 라인 (빨간, 우→좌 애니메이션) |
| `.data-line.blue` | 데이터 이동 라인 (파란) |
| `.confetti` | 색종이 파티클 (Outro 전용) |

---

## 5. 슬라이드 유형별 템플릿

### 5-1. Intro 슬라이드 (첫 번째)

```jsx
<div className={`slide ${currentSlide === 0 ? 'active' : ''}`}
     style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.08) 0%, transparent 60%)' }}>
  <div className="slide-content center-layout">
    {/* 대형 아이콘 (150px, 글로우 효과) */}
    <div className="anim-scale scale-delay-1 float"
         style={{ fontSize: '150px', color: 'var(--accent-blue)', marginBottom: '30px',
                  filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.3))' }}>
      <i className="fa-solid fa-shield-halved"></i>
    </div>

    {/* 메인 제목 + 그라데이션 강조 */}
    <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>
      제목 첫 줄<br /><span>그라데이션 강조 텍스트</span>
    </h1>

    {/* 부제 */}
    <p className="anim-fade"
       style={{ fontSize: '26px', marginTop: '16px',
                animation: 'simpleFade 1s forwards 1.8s' }}>
      "인용구 또는 질문형 부제"
    </p>
  </div>
</div>
```

### 5-2. 일반 설명 슬라이드 (좌우 분할)

```jsx
<div className={`slide ${currentSlide === N ? 'active' : ''}`}>
  <h2 className="slide-header anim-el delay-1">
    <i className="fa-solid fa-server"></i> 슬라이드 제목
  </h2>
  <div className="slide-content grid-2">
    {/* 좌: 텍스트 */}
    <div>
      <ul className="info-list">
        <li className="anim-el delay-2">
          <strong>키워드 제목</strong>
          설명 텍스트입니다.
        </li>
        <li className="anim-el delay-3">
          <strong>두 번째 포인트</strong>
          설명 텍스트입니다.
        </li>
      </ul>
    </div>
    {/* 우: 비주얼 */}
    <div className="center-layout anim-scale scale-delay-2">
      <i className="fa-solid fa-database float"
         style={{ fontSize: '120px', color: 'var(--accent-blue)' }}></i>
    </div>
  </div>
</div>
```

### 5-3. 해킹/위협 슬라이드 (빨간 테마)

```jsx
<div className={`slide ${currentSlide === N ? 'active' : ''}`}>
  <h2 className="slide-header malware-header anim-el delay-1">
    <i className="fa-solid fa-skull-crossbones"></i> [해킹] 위협 제목
  </h2>
  <div className="slide-content grid-2">
    <div>
      <ul className="info-list malware">
        <li className="anim-el delay-2">
          <strong>공격 기법 이름</strong>
          해킹 원리 설명
        </li>
      </ul>
    </div>
    <div className="center-layout anim-scale scale-delay-2">
      <i className="fa-solid fa-bug malware-pulse"
         style={{ fontSize: '120px', color: 'var(--accent-red)' }}></i>
    </div>
  </div>
</div>
```

### 5-4. 카드 3열 슬라이드

```jsx
<div className={`slide ${currentSlide === N ? 'active' : ''}`}>
  <h2 className="slide-header anim-el delay-1">
    <i className="fa-solid fa-layer-group"></i> 비교 제목
  </h2>
  <div className="slide-content">
    <div className="grid-3">
      <div className="card anim-scale scale-delay-1">
        <div className="card-icon"><i className="fa-solid fa-shield"></i></div>
        <h3>카드 1</h3>
        <p>설명</p>
      </div>
      <div className="card purple anim-scale scale-delay-2">
        <div className="card-icon"><i className="fa-solid fa-lock"></i></div>
        <h3>카드 2</h3>
        <p>설명</p>
      </div>
      <div className="card red anim-scale scale-delay-3">
        <div className="card-icon"><i className="fa-solid fa-fire"></i></div>
        <h3>카드 3</h3>
        <p>설명</p>
      </div>
    </div>
  </div>
</div>
```

### 5-5. Outro 슬라이드 (마지막)

```jsx
<div className={`slide ${currentSlide === LAST ? 'active' : ''}`}
     style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.08) 0%, transparent 60%)' }}>
  {/* 색종이 파티클 */}
  {currentSlide === LAST && (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {confettiParticles.map((p) => (
        <div key={p.id} className="confetti"
             style={{ left: p.left, animationDelay: p.animationDelay,
                      animationDuration: p.animationDuration,
                      backgroundColor: p.backgroundColor }}></div>
      ))}
    </div>
  )}

  <div className="slide-content center-layout" style={{ zIndex: 1 }}>
    <div className="anim-scale scale-delay-1 float"
         style={{ fontSize: '150px', color: 'var(--accent-green)', marginBottom: '30px',
                  filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.3))' }}>
      <i className="fa-solid fa-circle-check"></i>
    </div>
    <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>
      재생이 완료되었습니다.
    </h1>
    <p className="anim-fade"
       style={{ fontSize: '26px', marginTop: '8px',
                animation: 'simpleFade 1s forwards 1.8s' }}>
      마무리 메시지
    </p>
    <button onClick={onRestart} className="anim-fade control-btn"
            style={{ marginTop: '40px', padding: '18px 50px',
                     background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(16,185,129,0.15))',
                     border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)',
                     fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px',
                     animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s' }}>
      <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i>
      처음부터 다시 보기
    </button>
  </div>
</div>
```

---

## 6. 아이콘 레퍼런스

FontAwesome 6 Free (npm `@fortawesome/fontawesome-free`) 사용.
`main.jsx`에서 전역 import되므로 별도 설정 불필요.

### 자주 쓰는 아이콘

| 카테고리 | 아이콘 | 클래스 |
|----------|--------|--------|
| 컴퓨터 | 💻 | `fa-solid fa-laptop-code` |
| 서버 | 🖥️ | `fa-solid fa-server` |
| 네트워크 | 🌐 | `fa-solid fa-globe` |
| 방패 | 🛡️ | `fa-solid fa-shield-halved` |
| 잠금 | 🔒 | `fa-solid fa-lock` |
| 해골 | ☠️ | `fa-solid fa-skull-crossbones` |
| 바이러스 | 🦠 | `fa-solid fa-virus` |
| 파일 | 📄 | `fa-solid fa-file-lines` |
| 데이터베이스 | 💾 | `fa-solid fa-database` |
| CPU | ⚙️ | `fa-solid fa-microchip` |
| 완료 | ✅ | `fa-solid fa-circle-check` |
| 경고 | ⚠️ | `fa-solid fa-triangle-exclamation` |
| 키 | 🔑 | `fa-solid fa-key` |
| 이메일 | ✉️ | `fa-solid fa-envelope` |
| 위험물 | ☣️ | `fa-solid fa-biohazard` |

전체 목록: https://fontawesome.com/search?o=r&m=free&s=solid

---

## 7. 콘텐츠 설계 가이드라인

### 7-1. 슬라이드 수

| 레벨 | 권장 슬라이드 수 | 예상 재생 시간 |
|------|-----------------|---------------|
| novice | 10~12 | 1~1.5분 |
| beginner | 15~20 | 2~2.5분 |
| intermediate | 20~25 | 2.5~3분 |
| advanced | 15~20 | 2~2.5분 |
| expert | 10~15 | 1.5~2분 |

- `slideDuration`: 6500ms (6.5초/슬라이드) + TTS 대기
- 마지막 슬라이드는 자동 진행 안 함 (사용자가 수동으로)

### 7-2. 자막 작성 규칙

1. **한 문장 40~60자** (TTS 읽기 적정 길이)
2. **존댓말 통일** ("~합니다", "~입니다")
3. **전문 용어 → 비유 필수** ("CPU는 사람의 뇌처럼...")
4. **해킹 슬라이드 전환 시 톤 변화** ("하지만 해커는...")

### 7-3. 슬라이드 구성 패턴

| 구간 | 슬라이드 비율 | 내용 |
|------|-------------|------|
| Intro | 1장 (5%) | 대형 아이콘 + 제목 + 부제 |
| 기초 개념 | 40% | 정상 동작 원리 설명 |
| 해킹 위협 | 40% | 기초 개념을 악용하는 해킹 기법 |
| Outro | 1장 (5%) | 완료 + 다시보기 CTA |

**패턴**: `개념 → 해킹` 쌍으로 배치
- Slide 5: "CPU는 이렇게 동작합니다" (일반)
- Slide 6: "[해킹] 해커는 CPU의 명령을 이렇게 조작합니다" (위협)

---

## 8. 체크리스트 (콘텐츠 제출 전)

- [ ] `subtitlesData.length` === `<div className="slide">` 개수
- [ ] 첫 슬라이드: `currentSlide === 0`, Intro 패턴 적용
- [ ] 마지막 슬라이드: `confettiParticles` + `onRestart` 사용
- [ ] 모든 색상: CSS 변수 사용 (`var(--accent-blue)` 등)
- [ ] 아이콘: `fa-solid fa-*` 클래스 사용 (CDN 아님, npm 패키지)
- [ ] `GRAPHIC_DATA_LOADERS`에 키 등록됨
- [ ] `npm run build` 성공
- [ ] 다크/라이트 테마 모두 정상 렌더링

---

## 9. 빠른 시작: 빈 템플릿 복사

```bash
cp src/data/graphic-contents/T1587.001-beginner.jsx \
   src/data/graphic-contents/{새ID}-{level}.jsx
```

파일 열어서:
1. `subtitlesData` 배열 내용 교체
2. `renderSlides` 내 슬라이드 JSX 교체
3. `GraphicExplanationPage.jsx`의 `GRAPHIC_DATA_LOADERS`에 등록
4. 빌드 & 배포

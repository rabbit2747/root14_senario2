# 05. GraphicExplanationPage - 시네마틱 그래픽 설명

## Meta
| Key | Value |
|-----|-------|
| Route | `/edu/graphic/:techniqueId/:level` |
| File | `src/pages/GraphicExplanationPage.jsx` |
| Auth Required | Yes |
| Version | v0.9.9 (2026-03-10) |
| Design | 1280x720 고정해상도 시네마틱 플레이어 |

## Purpose
교육 콘텐츠를 시네마틱 슬라이드 형태로 시각적으로 전달.
자동재생 + 자막 방식으로, TTS 없이 Duration 기반 슬라이드 전환.

## Dependencies
```javascript
import { useAuth } from '../context/AuthContext';
import { getStoredLang } from '../components/LangToggle';
// Internal: CinematicPlayer (inline component)
// Dynamic: GRAPHIC_DATA_LOADERS, GRAPHIC_COMPONENTS (lazy import)
```

## Core Component: CinematicPlayer

### Resolution & Scaling
```
고정 해상도: 1280 x 720 (16:9)
렌더링 방식: CSS transform: scale(ratio)

ratio = (containerWidth - overhead) / 1280

Overhead values:
  - 모바일 (< 640px): 100px
  - 데스크톱: 190px
  - 전체화면: 0px
```

### Auto-Play System
```javascript
// subtitlesData 배열 기반 자동재생
const subtitlesData = [
  { text: "자막 텍스트 1", duration: 5, slideIndex: 0 },
  { text: "자막 텍스트 2", duration: 8, slideIndex: 1 },
  ...
];

// 동작: subtitlesData[currentIndex].duration 초 후 다음 자막으로
// slideIndex 변경 시 슬라이드도 전환
// 일시정지/재생: Space 키 또는 버튼
```

### Fullscreen
```
방법 1: Fullscreen API (element.requestFullscreen())
방법 2: F키 단축키
방법 3: 버튼 클릭
방법 4: 모바일 가로회전 (Screen Orientation API → lock('landscape'))
```

### Zoom
```
범위: 50% ~ 200%
UI: 슬라이더 (데스크톱), 핀치 줌 (모바일)
적용: transform: scale(masterZoom * autoScale)
```

## Content Loading (Dynamic Import)
```javascript
// 자막 데이터 로더
const GRAPHIC_DATA_LOADERS = {
  'T1587.001-beginner': () => import('../data/graphic-contents/T1587.001-beginner.jsx')
    .then(m => m.subtitlesData),
};

// 슬라이드 컴포넌트 로더
const GRAPHIC_COMPONENTS = {
  'T1587.001-beginner': React.lazy(() => import('../data/graphic-contents/T1587.001-beginner.jsx')
    .then(m => ({ default: () => m.renderSlides() }))),
};

// 키 생성: `${techniqueId}-${level}` (예: T1587.001-beginner)
```

## Content File Structure
```
src/data/graphic-contents/
└── T1587.001-beginner.jsx   ← 현재 유일한 콘텐츠

// 파일 구조 (필수 export):
export const subtitlesData = [
  { text: "슬라이드 1 설명", duration: 5, slideIndex: 0 },
  { text: "슬라이드 2 설명", duration: 8, slideIndex: 1 },
  // ... 20개 슬라이드
];

export function renderSlides() {
  return (
    <>
      <div className="slide" data-slide="0"> {/* Slide 1 JSX */} </div>
      <div className="slide" data-slide="1"> {/* Slide 2 JSX */} </div>
      {/* ... */}
    </>
  );
}
```

## Navigation Flow
```
/edu/*.html (graphic-link.js 클릭)
  ↓
/edu/graphic/:techniqueId/:level (이 페이지)
  ↓ [시나리오 기반 설명으로] 버튼
/edu/scenario/:techniqueId/:level
```

## Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Space | 재생/일시정지 |
| → | 다음 슬라이드 |
| ← | 이전 슬라이드 |
| F | 전체화면 토글 |

## Theme
```javascript
const [theme, setTheme] = useState(() => {
  try { return localStorage.getItem('gotroot_theme') || 'light'; }
  catch { return 'light'; }
});
// 기본: 라이트 (v1.2.0~)
```

## Rendering Structure
```
<div class="min-h-screen bg-[#F4F1EA] or bg-[#111]">
  <!-- 헤더: 뒤로가기 + 흐름 단계 표시 (2/4) -->
  <header>
    ← 뒤로 | 📖 교육 → [🎨 그래픽] → 🎭 시나리오 → 🔬 실습
  </header>

  <!-- 메인: 시네마틱 플레이어 -->
  <CinematicPlayer>
    <div style="width:1280px; height:720px; transform:scale(ratio)">
      {/* 현재 슬라이드 JSX */}
    </div>
    <div class="subtitle-bar">
      {/* 자막 텍스트 + 프로그레스 바 */}
    </div>
    <div class="controls">
      {/* 재생/일시정지, 이전/다음, 줌, 전체화면 */}
    </div>
  </CinematicPlayer>

  <!-- 하단: 다음 단계 버튼 -->
  <button> 시나리오 기반 설명으로 → </button>
</div>
```

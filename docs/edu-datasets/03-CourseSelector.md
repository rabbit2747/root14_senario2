# 03. CourseSelector - 과정 선택 (5레벨 카드)

## Meta
| Key | Value |
|-----|-------|
| Route | `/edu/:techniqueId` |
| File | `src/pages/CourseSelector.jsx` |
| Auth Required | Yes (→ /login?redirect=/edu/:id) |
| Version | v0.9.0 (2026-03-06), 5레벨 확장 v0.9.2 |
| Design | 다크 배경 (#0a0f1a) + 카드 그리드 |

## Purpose
특정 테크닉(예: T1587.001)의 5단계 레벨 카드를 표시.
각 레벨의 잠금/해금 상태, 진행률, CTA 버튼을 관리.
카드 클릭 시 `window.location.href`로 외부 HTML 페이지 이동 (SPA 밖).

## Dependencies
```javascript
import { useAuth } from '../context/AuthContext';
import useEduProgress from '../hooks/useEduProgress';
import eduMeta from '../data/edu-meta.json';
import { getStoredLang } from '../components/LangToggle';
import LoadingScreen from '../components/LoadingScreen';
```

## State Variables
```javascript
const { techniqueId } = useParams();
const { isLoggedIn, user, loading: authLoading } = useAuth();
const { getProgress, isLevelComplete, isUnlocked, loading } = useEduProgress();
const [language] = useState(() => getStoredLang());
const [authChecked, setAuthChecked] = useState(false);
```

## Core Logic: Level Cards Construction
```javascript
const levelCards = useMemo(() => {
  const LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
  return LEVELS.map(level => {
    const levelData = pageMeta.levels?.[level];
    const url = levelData?.url;
    const chapters = levelData?.chapters || 0;
    const progress = getProgress(canonicalId, level);
    const completed = isLevelComplete(canonicalId, level);
    const unlocked = isUnlocked(canonicalId, level);

    return {
      level,
      url,             // null이면 "준비중"
      chapters,
      progress,        // { completed, total, percent }
      completed,       // boolean
      unlocked,        // boolean (순차 해금)
      cta: completed ? '복습하기' : progress.completed > 0 ? '이어하기' : '시작하기',
    };
  });
}, [pageMeta, canonicalId, getProgress, isLevelComplete, isUnlocked]);
```

## Unlock Logic (Sequential)
```
novice:       항상 해금
beginner:     novice 콘텐츠 있으면 → novice 완료 필수, 없으면 → 항상 해금
intermediate: beginner 콘텐츠 있으면 → beginner 완료 필수, 없으면 → 항상 해금
advanced:     intermediate 완료 필수 (동일 규칙)
expert:       advanced 완료 필수 (동일 규칙)

※ URL 없는 레벨은 "준비중" — 잠금 조건 건너뜀 (기존 진행률 보존)
```

## Navigation
```
카드 클릭 시:
  window.location.href = card.url
  예: /edu/t1587-001-develop-capabilities-malware.html

⚠️ React Router가 아닌 전체 페이지 이동!
   → SPA 컨텍스트를 벗어남
   → 브레드크럼은 sessionStorage로 보존
```

## Breadcrumb System
```javascript
// sessionStorage['gotroot_nav_state'] 구조:
{
  breadcrumb: [
    { label: 'Matrix', path: '/' },
    { label: 'T1587.001', path: '/edu/T1587.001' }
  ]
}
// public/edu/breadcrumb.js가 HTML 페이지 내에서 이어받아 렌더
```

## Slug Reverse Matching
```javascript
// URL에 slug가 올 수도 있음: /edu/develop-capabilities-malware
const canonicalId = useMemo(() => {
  // 1. eduMeta.pages[techniqueId]가 직접 존재하면 사용
  // 2. 없으면 pages 순회하며 url에서 slug 추출 → 매칭
  for (const [id, meta] of Object.entries(eduMeta.pages)) {
    if (meta.url?.includes(techniqueId)) return id;
  }
  return techniqueId;
}, [techniqueId]);
```

## Loading State
```
LoadingScreen (macOS 윈도우 + 라이트 테마):
  steps: 인증 세션 확인 → 학습 진행률 조회 → 과정 메타데이터 로딩 → 레벨 잠금 상태 계산
  title: "Course Selector"
```

## edu-meta.json Entry Example
```json
{
  "T1587.001": {
    "url": "/edu/t1587-001-develop-capabilities-malware.html",
    "title": "악성코드 개발 심층 분석",
    "titleEn": "Develop Capabilities: Malware",
    "tacticIds": ["t2"],
    "difficulty": "advanced",
    "estimatedMinutes": 45,
    "tags": ["Malware", "C2", "Payload"],
    "levels": {
      "novice":       { "url": "/edu/t1587-001-novice.html", "chapters": 3 },
      "beginner":     { "url": "/edu/t1587-001-beginner.html", "chapters": 10 },
      "intermediate": { "url": "/edu/t1587-001-intermediate.html", "chapters": 8 }
    }
  }
}
```

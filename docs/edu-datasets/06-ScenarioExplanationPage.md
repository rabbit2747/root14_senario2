# 06. ScenarioExplanationPage - 시나리오 기반 설명

## Meta
| Key | Value |
|-----|-------|
| Route | `/edu/scenario/:techniqueId/:level` |
| File | `src/pages/ScenarioExplanationPage.jsx` |
| Auth Required | Yes |
| Version | v0.9.3 (2026-03-06) |
| Design | 다크/라이트 + React.lazy 동적 로딩 |

## Purpose
특정 테크닉의 시나리오 기반 인터랙티브 학습.
그래픽 설명 이후, 랩 실습 이전 단계 (흐름: 3/4단계).
현재 T1587.001-beginner만 커스텀 시나리오 존재, 나머지는 플레이스홀더.

## Dependencies
```javascript
import React, { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStoredLang } from '../components/LangToggle';
import { supabase } from '../lib/supabase';
```

## Dynamic Component Loading
```javascript
// 시나리오 컴포넌트 맵 (techniqueId-level 키)
const SCENARIO_COMPONENTS = {
  'T1587.001-beginner': React.lazy(
    () => import('../data/scenario-contents/T1587.001-beginner.jsx')
  ),
};

// 사용:
const key = `${techniqueId}-${level}`;
const ScenarioComp = SCENARIO_COMPONENTS[key];

// 존재하면: <ScenarioComp onFinish={handleFinish} userName={userName} />
// 없으면:   <DefaultScenarioPlaceholder />
```

## State Variables
```javascript
const [authChecked, setAuthChecked] = useState(false);
const [lang] = useState(() => getStoredLang());
const [userName, setUserName] = useState('');  // profiles.name에서 fetch
```

## Data Flow
```
Mount → Auth check (redirect if not logged in)
  ↓
Supabase profiles.name fetch → userName
  ↓
SCENARIO_COMPONENTS[key] 존재 여부 확인
  ├─ 존재 → React.lazy + Suspense 로딩
  │         └─ ScenarioComp({ onFinish, userName, companyName })
  └─ 미존재 → DefaultScenarioPlaceholder
               (시나리오 준비 중 메시지 + 랩 바로가기 버튼)
```

## Navigation Flow
```
/edu/graphic/:id/:level (그래픽 설명)
  ↓ [시나리오 기반 설명으로] 버튼
/edu/scenario/:id/:level (이 페이지)
  ↓ handleFinish() 또는 [실습 랩 시작] 버튼
/lab/desktop/:id/:level (랩 실습)
```

## Rendering Structure
```
<div class="min-h-screen">
  <!-- 헤더: 흐름 단계 (3/4) -->
  <header>
    📖 교육 → 🎨 그래픽 → [🎭 시나리오] → 🔬 실습
  </header>

  <!-- 메인: 시나리오 컴포넌트 또는 플레이스홀더 -->
  <Suspense fallback={<Spinner />}>
    {ScenarioComp ? (
      <ScenarioComp onFinish={handleFinish} userName={userName} />
    ) : (
      <DefaultScenarioPlaceholder />
    )}
  </Suspense>

  <!-- 하단: 네비게이션 -->
  <nav>
    ← 그래픽으로 돌아가기
    실습 랩 시작하기 →
  </nav>
</div>
```

## Current Content
| Key | File | Status |
|-----|------|--------|
| T1587.001-beginner | src/data/scenario-contents/T1587.001-beginner.jsx | Active (인터랙티브 게임) |
| (기타 모든 조합) | — | DefaultScenarioPlaceholder |

## T1587.001-beginner Scenario Features
- lucide-react 아이콘 사용
- 인터랙티브 퍼즐/게임 UI
- 수료 보고서 모달 (휠 스크롤 탭 전환)
- 인벤토리 시스템

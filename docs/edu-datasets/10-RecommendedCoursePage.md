# 10. RecommendedCoursePage - 추천 학습 로드맵

## Meta
| Key | Value |
|-----|-------|
| Route | `/recommended/:techniqueId` |
| File | `src/pages/RecommendedCoursePage.jsx` |
| Auth Required | Yes |
| Version | v1.0.2 (2026-03-13) |
| Design | macOS 윈도우 PageWrapper |

## Purpose
특정 테크닉의 4단계 학습 로드맵(교육→그래픽→시나리오→랩)을 시각적으로 표시.
각 단계의 완료 상태, 가용 여부를 판단하여 진행률 바와 함께 제공.

## Dependencies
```javascript
import { useAuth } from '../context/AuthContext';
import useEduProgress from '../hooks/useEduProgress';
import eduMeta from '../data/edu-meta.json';
import LoadingScreen from '../components/LoadingScreen';
// Internal: TACTIC_META, STEPS, GUIDED_AVAILABLE
```

## 4-Step Learning Roadmap
```javascript
const STEPS = [
  { key: 'edu',      emoji: '📖', label: '기초 교육',     labelEn: 'Education',
    desc: '핵심 개념과 이론을 챕터별로 학습합니다' },
  { key: 'graphic',  emoji: '🎨', label: '그래픽 설명',   labelEn: 'Graphic',
    desc: '시각적 자료로 공격 흐름을 이해합니다' },
  { key: 'scenario', emoji: '🎭', label: '시나리오 학습', labelEn: 'Scenario',
    desc: '실제 사례 기반 시나리오를 체험합니다' },
  { key: 'lab',      emoji: '🔬', label: '실습 랩',       labelEn: 'Lab',
    desc: '해커/방어자 시뮬레이션으로 실전 훈련합니다' },
];
```

## Step Availability Logic
```javascript
const stepAvailability = useMemo(() => {
  const levels = techInfo?.levels || {};
  const beginnerUrl = levels.beginner?.url;

  return {
    edu:      !!beginnerUrl,                          // HTML 페이지 존재 여부
    graphic:  GRAPHIC_EXISTS.has(techniqueId),         // graphic-contents/ 파일 존재
    scenario: SCENARIO_EXISTS.has(techniqueId),        // scenario-contents/ 파일 존재
    lab:      SCENARIO_LOADERS_EXISTS.has(techniqueId), // lab-scenarios/ JSON 존재
  };
}, [techInfo, techniqueId]);
```

## Step States (4가지)
```
complete:     단계 완료됨 (초록 체크)
in-progress:  진행 중 (파란 프로그레스)
available:    시작 가능 (회색 + CTA)
coming-soon:  콘텐츠 미존재 (비활성)
```

## Navigation per Step
```javascript
const handleStepClick = (stepKey) => {
  switch (stepKey) {
    case 'edu':
      window.location.href = techInfo.levels.beginner.url;  // SPA 밖!
      break;
    case 'graphic':
      navigate(`/edu/graphic/${techniqueId}/beginner`);
      break;
    case 'scenario':
      navigate(`/edu/scenario/${techniqueId}/beginner`);
      break;
    case 'lab':
      navigate(`/lab/desktop/${techniqueId}/beginner`);
      break;
  }
};
```

## Progress Calculation
```javascript
const progressPercent = useMemo(() => {
  const progress = getProgress(techniqueId, 'beginner');
  if (!progress) return 0;
  // beginner 레벨만 기준
  return Math.min(progress.percent, 100);  // Math.min 캡 (v0.9.6)
}, [techniqueId, getProgress]);
```

## Guided Learning Link
```javascript
// T1566.001만 유도 학습 가능
const GUIDED_AVAILABLE = new Set(['T1566.001']);

{GUIDED_AVAILABLE.has(techniqueId) && (
  <button onClick={() => navigate(`/guided/${techniqueId}`)}>
    🗺️ 유도 학습 시작하기
  </button>
)}
```

## Rendering Structure
```
<macOS Window>
  <Title Bar> ← 뒤로 | "추천 학습 로드맵" </Title Bar>
  <Content>
    <!-- 테크닉 헤더 -->
    <div>
      [택틱 배지 🔍 정찰] T1587.001 - 악성코드 개발
      [진행률 바: 45%]
    </div>

    <!-- 4단계 카드 (세로 타임라인) -->
    <div class="step-timeline">
      [📖 기초 교육]     ✅ Complete    → 클릭: window.location.href
      [🎨 그래픽 설명]   🔵 In Progress → 클릭: /edu/graphic/:id
      [🎭 시나리오 학습]  ⚪ Available   → 클릭: /edu/scenario/:id
      [🔬 실습 랩]       ⚪ Available   → 클릭: /lab/desktop/:id
    </div>

    <!-- 유도 학습 (T1566.001만) -->
    {guided && <GuidedLearningButton />}

    <!-- 팁 푸터 -->
    <footer>💡 순서대로 학습하면 더 효과적입니다</footer>
  </Content>
</macOS Window>
```

## TACTIC_META (Shared with LearningPathChoice)
```javascript
const TACTIC_META = {
  t1:  { emoji: '🔍', ko: '정찰',           en: 'Reconnaissance' },
  t2:  { emoji: '🛠️', ko: '자원 개발',      en: 'Resource Development' },
  // ... 14개 택틱
};
```

## Loading State
```
LoadingScreen (macOS 윈도우):
  steps: 인증 세션 확인 → 추천 학습 경로 분석 → 진행률 데이터 동기화
  title: "Recommended Course"
  subtitle: "추천 학습 로드맵"
```

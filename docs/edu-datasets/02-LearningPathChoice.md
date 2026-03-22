# 02. LearningPathChoice - 학습 경로 선택

## Meta
| Key | Value |
|-----|-------|
| Route | `/learning-path` |
| File | `src/pages/LearningPathChoice.jsx` |
| Auth Required | Yes (beginner/junior 로그인 시 자동 이동) |
| Version | v1.0.1 (2026-03-12) |
| Design | macOS 윈도우 PageWrapper |

## Purpose
beginner/junior 레벨 사용자가 로그인 후 "추천 학습" vs "자율 학습"을 선택.
추천 학습 선택 시 14개 택틱 그리드 → 서브테크닉 목록 → /recommended/:id 이동.

## Dependencies
```javascript
import { useAuth } from '../context/AuthContext';
import eduMeta from '../data/edu-meta.json';
import matrixFallback from '../data/matrix-fallback.json';
// Internal: TACTIC_META (14 tactics), COLOR_MAP (Tailwind utilities)
```

## State Variables
```javascript
const [phase, setPhase] = useState('choice');    // choice | recommended | tactic-detail | self-directed
const [selectedTactic, setSelectedTactic] = useState(null);
const [isDark, setIsDark] = useState(false);     // 기본 라이트
```

## Phase Flow
```
[Phase: choice]
  ├─ "추천 학습" 카드 클릭 → phase: 'recommended'
  └─ "자율 학습" 카드 클릭 → phase: 'self-directed'

[Phase: recommended]
  ├─ 14개 택틱 그리드 표시 (교육 콘텐츠 있는 택틱만)
  └─ 택틱 클릭 → phase: 'tactic-detail', selectedTactic 설정

[Phase: tactic-detail]
  ├─ 선택한 택틱의 서브테크닉 목록 (edu-meta.json 기반)
  ├─ 각 테크닉 카드에 난이도 + 예상 시간 표시
  └─ 테크닉 클릭 → navigate('/recommended/:techniqueId')

[Phase: self-directed]
  ├─ "IT 기초" 카드 → navigate('/basics')
  └─ "Full Matrix" 카드 → navigate('/')
```

## Data Sources
```javascript
// edu-meta.json에서 교육 가능한 테크닉 추출
const tacticTechMap = useMemo(() => {
  // pages 순회 → tacticIds로 그룹핑
  // beginner 레벨 URL이 있는 테크닉만 포함
  return { t1: [{ id, title, difficulty, minutes }], t3: [...], ... };
}, []);

// matrixFallback.json에서 택틱 이름 보완
const tacticNames = matrixFallback.tactics.reduce(...);
```

## TACTIC_META (14 Tactics)
```javascript
const TACTIC_META = {
  t1:  { emoji: '🔍', color: 'slate',  ko: '정찰',           en: 'Reconnaissance' },
  t2:  { emoji: '🛠️', color: 'amber',  ko: '자원 개발',      en: 'Resource Development' },
  t3:  { emoji: '🚪', color: 'red',    ko: '초기 접근',      en: 'Initial Access' },
  t4:  { emoji: '⚡', color: 'orange', ko: '실행',           en: 'Execution' },
  t5:  { emoji: '🔗', color: 'yellow', ko: '지속성',         en: 'Persistence' },
  t6:  { emoji: '⬆️', color: 'purple', ko: '권한 상승',      en: 'Privilege Escalation' },
  t7:  { emoji: '🛡️', color: 'green',  ko: '방어 회피',      en: 'Defense Evasion' },
  t8:  { emoji: '🔑', color: 'pink',   ko: '자격 증명 접근', en: 'Credential Access' },
  t9:  { emoji: '🔎', color: 'cyan',   ko: '탐색',           en: 'Discovery' },
  t10: { emoji: '↔️', color: 'indigo', ko: '측면 이동',      en: 'Lateral Movement' },
  t11: { emoji: '📦', color: 'teal',   ko: '수집',           en: 'Collection' },
  t12: { emoji: '📡', color: 'blue',   ko: 'C2 (명령 및 제어)', en: 'Command & Control' },
  t13: { emoji: '📤', color: 'rose',   ko: '유출',           en: 'Exfiltration' },
  t14: { emoji: '💥', color: 'red',    ko: '영향',           en: 'Impact' },
};
```

## Rendering Structure
```
<macOS Window>
  <Title Bar> "Learning Path" </Title Bar>
  <Content>
    {phase === 'choice' && (
      <두 장의 카드>
        [추천 학습] — 체계적 커리큘럼, 단계별 안내
        [자율 학습] — 자유 탐색, 원하는 주제
      </두 장의 카드>
    )}
    {phase === 'recommended' && (
      <택틱 그리드> 14개 택틱 (이모지 + 이름 + 테크닉 수) </택틱 그리드>
    )}
    {phase === 'tactic-detail' && (
      <테크닉 리스트> 난이도 배지 + 예상 시간 + CTA </테크닉 리스트>
    )}
    {phase === 'self-directed' && (
      <두 장의 카드>
        [IT 기초] — 네트워크, OS, 보안 기초
        [Full Matrix] — MITRE ATT&CK 전체 매트릭스
      </두 장의 카드>
    )}
  </Content>
</macOS Window>
```

## Navigation Map
```
Login (beginner/junior) → /learning-path
LevelTest (beginner/junior) → /learning-path
/learning-path:
  추천 → 택틱 그리드 → 테크닉 리스트 → /recommended/:id
  자율 → /basics 또는 /
```

# 08. GenericLabSimulator - 범용 랩 시뮬레이터

## Meta
| Key | Value |
|-----|-------|
| Route | (component, DesktopLab에서 렌더) |
| File | `src/pages/lab/GenericLabSimulator.jsx` |
| Props | `{ scenario, techniqueId }` |
| Version | v0.5.0 (초기), v0.9.3 (인터랙티브 분기) |

## Purpose
해커 PC + 방어자 SOC 2분할 뷰로 사이버 공격/방어 시뮬레이션을 자동 재생.
40개 이상의 ATT&CK 테크닉에 범용 적용.

## Props
```typescript
interface Props {
  scenario: {
    id: string;
    title: string;
    titleEn: string;
    duration: number;          // 총 소요 시간 (초)
    stepDuration: number;      // 스텝당 기본 시간 (기본 8초)
    steps: Step[];
    phases?: Phase[];
    processTree?: Process[];
    desktopIcons?: Icon[];
  };
  techniqueId: string;
}
```

## State Machine (4 단계)
```
[1. Legal Notice]
  └─ agreed: false → 법적 고지 + 체크박스 → agreed: true

[2. Config Screen]
  ├─ userName (profiles.name prefill)
  ├─ companyName (수동 입력)
  └─ "시뮬레이션 시작" 버튼

[3. Simulation]
  ├─ viewMode: 'hacker' → 해커 PC 화면
  │   ├─ 데스크톱 아이콘 (Windows 스타일)
  │   ├─ 터미널 (명령어 + 출력 자동 타이핑)
  │   ├─ 단계 로그 (좌측 사이드바)
  │   └─ 프로세스 트리 (하단)
  │
  └─ viewMode: 'defender' → SOC 화면
      ├─ 탐지/분석 패널
      ├─ 대응 전략 패널
      └─ SOC 체크포인트 (인터랙티브)

[4. Complete]
  └─ 훈련 완료 → 저장 → navigate('/lab/complete/:id')
```

## Auto-Play Engine
```javascript
// 진행 조건: stepDuration 경과 + TTS 완료 (둘 다 충족)
useEffect(() => {
  if (!isPlaying || showFeedback) return;

  const timer = setTimeout(() => {
    if (ttsFinished) advanceStep();
  }, stepDuration * 1000);

  return () => clearTimeout(timer);
}, [currentStep, isPlaying, ttsFinished]);
```

## TTS (Text-to-Speech)
```javascript
// window.speechSynthesis API 사용
// 각 step.ttsText를 한국어/영어로 읽기
// 음소거 시 TTS 건너뜀 → 타이머만으로 진행

const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
  utterance.onend = () => setTtsFinished(true);
  speechSynthesis.speak(utterance);
};
```

## Keyboard Controls
| Key | Action |
|-----|--------|
| Space | 재생/일시정지 |
| → | 다음 스텝 |
| ← | 이전 스텝 |
| H | 해커 뷰 전환 |
| D | 방어자 뷰 전환 |

## Zoom (Mobile)
```javascript
import useSimulationZoom from '../../hooks/useSimulationZoom';

const { zoom, setZoom } = useSimulationZoom({
  enabled: isMobile,     // width < 1024
  minZoom: 50,
  maxZoom: 200,
  defaultZoom: 100,
});
// 적용: transform: scale(zoom / 100)
```

## Completion & Data Storage
```javascript
// 1. localStorage (오프라인 폴백)
const completed = JSON.parse(localStorage.getItem('gotroot_completed_labs') || '[]');
completed.push({
  name: scenario.title,
  technique: techniqueId,
  completedAt: new Date().toISOString(),
});
localStorage.setItem('gotroot_completed_labs', JSON.stringify(completed));

// 2. Supabase edu_progress (서버 증빙)
await supabase.from('edu_progress').upsert({
  user_id: user.id,
  technique_id: techniqueId,
  chapter_id: 'lab_completed',
  level: level || 'beginner',
}, { onConflict: 'user_id,technique_id,chapter_id,level', ignoreDuplicates: true });

// 3. Navigate
navigate(`/lab/complete/${techniqueId}`, {
  state: { scenarioTitle: scenario.title, userName, companyName, totalSteps: scenario.steps.length }
});
```

## Rendering (Hacker View)
```
┌─────────────────────────────────────────────────┐
│  [Phase Progress Bar]                           │
├──────────────┬──────────────────────────────────┤
│  Step Log    │  Desktop                         │
│  (sidebar)   │  ┌─────────────────────────────┐ │
│              │  │ [Icon] [Icon] [Icon]        │ │
│  Step 1 ✓   │  │                              │ │
│  Step 2 ✓   │  │     Terminal Window          │ │
│  Step 3 →   │  │  $ command output here...    │ │
│  Step 4     │  │  $ ...                       │ │
│  Step 5     │  │                              │ │
│              │  └─────────────────────────────┘ │
├──────────────┴──────────────────────────────────┤
│  Process Tree: explorer → cmd → powershell      │
├─────────────────────────────────────────────────┤
│  [◀ Prev] [⏸ Pause] [▶ Next]  [🔊] [👁 View]  │
└─────────────────────────────────────────────────┘
```

## Rendering (Defender View)
```
┌─────────────────────────────────────────────────┐
│  [Phase Progress Bar]                           │
├──────────────────────┬──────────────────────────┤
│  Detection Panel     │  Response Panel          │
│  ┌────────────────┐  │  ┌────────────────────┐  │
│  │ Alert: ...     │  │  │ Action: ...        │  │
│  │ Severity: HIGH │  │  │ Mitigation: ...    │  │
│  │ Source: ...    │  │  │ Status: IN_PROGRESS│  │
│  └────────────────┘  │  └────────────────────┘  │
├──────────────────────┴──────────────────────────┤
│  SOC Checkpoint                                 │
│  [✓] Alert acknowledged  [✓] Escalated          │
│  [ ] Contained           [ ] Eradicated          │
├─────────────────────────────────────────────────┤
│  [◀ Prev] [⏸ Pause] [▶ Next]  [🔊] [👁 View]  │
└─────────────────────────────────────────────────┘
```

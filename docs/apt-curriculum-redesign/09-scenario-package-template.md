# Scenario Package Template

## 목표

새 APT 시나리오가 들어와도 화면마다 따로 고치지 않는다. 하나의 시나리오 패키지를 만들고, 공통 템플릿 UI가 그 패키지를 읽도록 한다.

## 현재 Orion Echo 패키지

```text
src/pages/apt/orion-echo/
  CourseTOC.jsx
  OrionEchoIntro.jsx
  LegacyBridge.jsx
  ConceptClass.jsx
  PracticalScenario.jsx
  data/
    orion-echo-course.js
    orion-echo-curriculum.js
    orion-echo-practical.json

src/pages/apt/scenario-template/
  ScenarioIntro.jsx
  ScenarioLegacyBridge.jsx
  ScenarioTOC.jsx
  ScenarioConceptClass.jsx
  ScenarioPracticalReview.jsx
  validateScenarioPackage.js
```

## 역할

### `*-curriculum.js`

교육 흐름과 개념 교육 내용을 담는다.

포함:

- 시나리오 메타데이터
- 라우트
- Mission Briefing 데이터
- Legacy 3D bridge 데이터
- 세션 순서
- Concept Class 인프라 지도
- Concept Class 개념 카드
- Practical 3D URL

### `*-practical.json`

실무 분석과 Practical topology 내용을 담는다.

포함:

- zones
- nodes
- edges
- steps
- eventMarkers
- quiz
- explanation

### `*-course.js`

`curriculum`과 `practical JSON`을 하나의 course package로 묶는다.

UI는 개별 데이터 파일을 직접 import하지 않고 이 파일만 import한다.

### `scenario-template/validateScenarioPackage.js`

개발 중 기본 오류를 잡는다.

현재 확인하는 것:

- 필수 메타데이터 존재 여부
- briefing / legacy3d 존재 여부
- concept의 `focusZones` / `focusBoundaries`가 실제 Concept Class map에 존재하는지
- practical node의 `zoneId`가 실제 zone에 존재하는지
- edge의 source/target node가 존재하는지
- step의 activeNodes/activeEdges가 실제 node/edge에 존재하는지

## 새 시나리오 추가 절차

1. `src/pages/apt/{scenario-slug}/data/`를 만든다.
2. `{scenario-slug}-curriculum.js`를 작성한다.
3. `{scenario-slug}-practical.json`을 작성한다.
4. `{scenario-slug}-course.js`에서 두 파일을 묶고 validator를 실행한다.
5. wrapper 파일에서 공통 템플릿에 새 course를 넘긴다.
6. 특수 UI가 필요할 때만 화면 컴포넌트를 분기한다.
7. `npm run build`를 통과시킨다.

## Wrapper 예시

```jsx
import ScenarioTOC from '../scenario-template/ScenarioTOC';
import { ledgerMirageCourse } from './data/ledger-mirage-course';

export default function CourseTOC() {
  return <ScenarioTOC course={ledgerMirageCourse} />;
}
```

## 완료 기준

현재 공통화 완료:

- Mission Briefing
- Legacy 3D Bridge
- Course TOC
- Concept Class
- Practical Case Review
- Scenario package validator

각 시나리오는 데이터와 wrapper만 가진다. UI 본체는 `scenario-template`에 둔다.

# 06. Refactor Roadmap

이 로드맵은 기존 동작을 깨지 않고 APT 공격 시나리오 학습을 템플릿화하기 위한 단계별 계획이다.

## Phase 0. 기준 고정

목표: 현재 동작하는 기준을 문서화하고, 더 이상 이전 버전과 섞이지 않게 한다.

완료 또는 진행 중:

- `/learning-path`에서 APT 공격 시나리오 학습 흐름 파악
- Orion Echo Legacy / Practical / MVP 3D 구분
- MVP 기준 화면 문서화
- APT 커리큘럼 재설계 문서 디렉토리 생성

검증 기준:

- `/apt/scenarios` 진입 가능
- `/apt/orion-echo` 진입 가능
- `/apt/orion-echo-practical` 진입 가능
- `http://localhost:3100/three/orion_2` 진입 가능
- `npm run build` 통과

## Phase 1. ID 매핑 정리

목표: 흩어진 ID를 `caseId` 중심으로 정리한다.

작업:

1. `src/lib/apt/caseIdMap.js` 생성
2. `operation-orion-echo`의 alias 정리
3. `OE001`, `OE002`, `orion-echo`, `orion_2` 매핑 문서화
4. route wrapper에서 caseId를 명시적으로 사용

예상 산출물:

```js
export const CASE_ID_MAP = {
  'operation-orion-echo': {
    eduSlug: 'orion-echo',
    legacyLabId: 'OE001',
    practicalLabId: 'OE002',
    mvpSlug: 'orion_2'
  }
}
```

## Phase 2. Orion Echo manifest 생성

목표: Orion Echo 관련 데이터를 하나의 manifest로 모은다.

작업:

1. `src/data/apt-scenarios/manifests/operation-orion-echo.js` 생성
2. `CourseTOC.jsx`의 `SECTIONS` 데이터 이동
3. `OrionEchoIntro.jsx`의 story/persona/stages 데이터 이동
4. `ScenarioHub.jsx`의 `LABS` 데이터 일부 이동
5. 기존 화면은 manifest를 읽도록 최소 변경

중요:

- 이 단계에서는 UI를 바꾸지 않는다.
- 화면이 이전과 동일하게 보여야 한다.

## Phase 3. 공통 renderer 추출

목표: Orion Echo 전용 컴포넌트를 공통 컴포넌트로 바꾼다.

작업:

1. `AptCourseTOC.jsx` 생성
2. `AptMissionBriefing.jsx` 생성
3. `AptLegacyBridge.jsx` 생성
4. `AptPracticalTrack.jsx` 생성
5. 기존 Orion route는 wrapper로 남긴다.

예:

```tsx
export default function OrionEchoTOC() {
  return <AptCourseTOC caseId="operation-orion-echo" />
}
```

## Phase 4. Concept Class 추가

목표: Legacy 3D와 Practical 사이에 대학생도 이해할 수 있는 개념 교육 구간을 추가한다.

작업:

1. `ConceptClass` manifest 구조 확정
2. 2D Network Boundary Map renderer 생성
3. Concept marker 클릭/강조 UI 구현
4. Supply Chain, Trust, Token/SSO, CI/CD, Signing, Evidence lesson 작성
5. Course TOC에서 Legacy 3D 이후 Concept Class로 이어지게 연결

중요:

- Concept Class는 텍스트 페이지가 아니다.
- 첫 화면은 2D Network Boundary Map이어야 한다.
- 각 네트워크 망의 경계와 신뢰 관계를 명확히 표시해야 한다.
- Practical 3D처럼 복잡하면 안 된다.

## Phase 5. Practical 3D 데이터 분리

목표: `ScenarioThreePlayerOrion2.tsx` 내부 상수를 데이터로 분리한다.

작업:

1. `senario/09_platform/mvp/data/scenarios/operation-orion-echo.three.ts` 생성
2. `zones`, `nodes`, `paths`, `stages`, `stageNarratives` 이동
3. `ScenarioThreePlayerOrion2`는 기존 UI를 유지하되 데이터 prop을 받게 변경
4. `/three/orion_2` 화면 비교 검증

주의:

- 기존 generic `ScenarioThreePlayer`와 섞지 않는다.
- 먼저 같은 화면이 유지되는지만 확인한다.

## Phase 6. 두 번째 시나리오로 검증

목표: 템플릿이 진짜인지 확인한다.

작업:

1. `operation-ledger-mirage` manifest 추가
2. route wrapper 추가
3. Course TOC 자동 렌더 확인
4. Practical Track 자동 렌더 확인
5. Practical 3D는 최소 skeleton으로 시작

성공 기준:

- Orion Echo를 복사하지 않고 새 manifest로 화면이 뜬다.
- 기존 Orion Echo 화면은 깨지지 않는다.

## Phase 7. 협업/PR 안전장치 추가

목표: 개발을 잘 모르는 협업자도 안전하게 작업할 수 있게 한다.

작업:

1. 공통 `HANDOFF.md` 템플릿 작성
2. 레포별 `CLAUDE.md` 정리
3. whitelist 기반 pre-commit hook 검토
4. GitHub Actions에서 build 검증
5. route/caseId 변경 감지 체크 추가

## 권장 우선순위

가장 먼저 할 일:

1. Orion Echo manifest 만들기
2. `ScenarioHub`의 Orion Lab 카드 데이터를 manifest 기반으로 바꾸기
3. `CourseTOC`를 manifest 기반으로 바꾸기
4. Concept Class와 2D Network Boundary Map 추가
5. `PracticalScenario`를 manifest 기반으로 바꾸기
6. MVP 3D 데이터 분리

이 순서가 좋은 이유:

- 화면 변경 없이 데이터 구조를 먼저 안정화할 수 있다.
- 큰 route 변경 없이 템플릿화를 시작할 수 있다.
- Orion Echo를 기준 샘플로 삼아 다른 시나리오 확장이 가능해진다.

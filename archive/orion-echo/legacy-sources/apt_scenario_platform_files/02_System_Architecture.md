# 시스템 아키텍처

## 1. 전체 구조

```text
사용자 입력
  ↓
LLM Scenario Generator
  ↓
Scenario JSON
  ↓
Validation Layer
  ↓
Layout Engine
  ↓
React Flow Renderer
  ↓
Scenario Player
```

## 2. 핵심 원칙

### 2.1 LLM은 데이터 생성 담당

LLM은 다음 정보를 생성한다.

- 시나리오 제목
- 학습 목표
- 기업망/외부망/DMZ/내부망/클라우드 구분
- 인프라 노드 목록
- 통신 경로 목록
- 단계별 활성 노드/엣지
- 단계별 설명
- 방어 포인트
- 퀴즈

LLM은 다음을 직접 생성하지 않는다.

- React 컴포넌트 코드
- CSS 코드
- 애니메이션 코드
- 최종 좌표
- 실제 공격 코드/명령어

### 2.2 프론트엔드는 고정 렌더러

프론트엔드는 JSON을 읽어 화면을 만든다.

```text
Scenario JSON
→ buildReactFlowNodes()
→ buildReactFlowEdges()
→ applyCurrentStepState()
→ render()
```

### 2.3 Layout Engine이 좌표 계산

LLM이 위치를 직접 찍지 않고, 다음 정보를 제공한다.

- `zoneId`
- `layoutRole`
- `importance`
- `sequence`
- `groupHint`

Layout Engine은 이 정보를 기반으로 위치를 계산한다.

## 3. Frontend Architecture

```text
app/
  scenarios/[scenarioId]/page.tsx

components/
  scenario-player/
    ScenarioPlayer.tsx
    ScenarioCanvas.tsx
    ScenarioStepPanel.tsx
    ScenarioTimeline.tsx
    ScenarioControls.tsx

  flow/
    nodes/
      BaseInfraNode.tsx
      AttackerPcNode.tsx
      DesktopNode.tsx
      ServerNode.tsx
      DatabaseNode.tsx
      FirewallNode.tsx
      SecurityNode.tsx
      ZoneGroupNode.tsx

    edges/
      AnimatedTrafficEdge.tsx
      BoundaryCrossingEdge.tsx
      BlockedEdge.tsx
      DetectionEdge.tsx

lib/
  scenario/
    schema.ts
    validateScenario.ts
    normalizeScenario.ts
    scenarioToFlow.ts
    stepState.ts

  layout/
    layoutZones.ts
    layoutNodes.ts
    layoutEnterpriseNetwork.ts
    collisionResolver.ts
```

## 4. Backend Architecture

```text
api/
  scenarios/
    POST /scenarios/generate
    GET /scenarios/:id
    POST /scenarios/:id/validate
    PUT /scenarios/:id
    POST /scenarios/:id/publish

  llm/
    POST /llm/generate-scenario
    POST /llm/repair-scenario-json

  courses/
    GET /courses
    POST /courses

  progress/
    GET /progress/:scenarioId
    POST /progress/:scenarioId
```

## 5. Data Flow: 시나리오 생성

```text
1. 제작자가 시나리오 설명 입력
2. 서버가 LLM Prompt Template에 입력값 삽입
3. LLM이 Scenario JSON 생성
4. 서버가 JSON parse 시도
5. Zod Schema 검증
6. 참조 무결성 검사
   - activeNodes가 nodes에 존재하는가?
   - activeEdges가 edges에 존재하는가?
   - edge.source/target이 nodes에 존재하는가?
   - node.zoneId가 zones에 존재하는가?
7. 오류가 있으면 repair prompt 실행
8. 정상 JSON을 저장
9. 프론트엔드 미리보기에서 Layout Engine 실행
10. 제작자가 검수 후 배포
```

## 6. Data Flow: 수강생 학습

```text
1. 수강생이 시나리오 페이지 접근
2. 서버에서 Scenario JSON 로드
3. 프론트엔드가 Zone/Node/Edge 생성
4. Layout Engine이 좌표 계산
5. currentStep = 0으로 초기화
6. 전체 인프라 맵 표시
7. 다음 단계 클릭
8. activeNodes/activeEdges/eventMarkers 적용
9. 설명 패널 업데이트
10. 진도 저장
```

## 7. React Flow 변환 흐름

```ts
ScenarioJSON
  -> normalizeScenario(scenario)
  -> createZoneGroupNodes(zones)
  -> createInfraNodes(nodes)
  -> createFlowEdges(edges)
  -> applyStepState(currentStep)
  -> ReactFlow nodes/edges
```

## 8. 상태 관리

### 권장 상태

```ts
type ScenarioPlayerState = {
  scenario: Scenario
  currentStepIndex: number
  selectedNodeId?: string
  selectedEdgeId?: string
  mode: 'attack' | 'defense'
  isPlaying: boolean

  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  selectNode: (nodeId: string) => void
  selectEdge: (edgeId: string) => void
}
```

### Zustand 사용 권장

- 간단한 플레이어 상태에는 Zustand가 적합
- 복잡한 상태 전이, 자동재생, 퀴즈, 분기 시나리오가 많아지면 XState 고려

## 9. 콘텐츠 안전성 레이어

LLM 생성 콘텐츠는 다음 기준을 만족해야 한다.

### 허용

- 공격 흐름의 개념적 설명
- 인프라 간 통신 흐름
- 방어 관점 설명
- 탐지 포인트
- 로그 관찰 포인트
- 대응 절차 개요
- MITRE ATT&CK 전술/기법 수준의 고수준 매핑

### 금지

- 실제 악용 가능한 명령어
- 익스플로잇 코드
- 우회 기법 상세 절차
- 실제 서비스 대상 공격 지침
- 크리덴셜 탈취 자동화 절차
- 피해 확산을 위한 구체적 운영 단계

## 10. 저장소 구조 예시

```text
scenario-platform/
  apps/
    web/
      app/
      components/
      lib/

    api/
      src/

  packages/
    scenario-schema/
    scenario-layout/
    scenario-renderer/
    prompts/

  docs/
    product/
    architecture/
    prompts/
```

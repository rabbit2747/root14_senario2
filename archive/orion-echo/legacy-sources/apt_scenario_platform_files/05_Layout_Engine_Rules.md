# Layout Engine Rules

## 1. 목적

Layout Engine은 LLM이 생성한 Scenario JSON을 기반으로, React Flow에서 사용할 수 있는 노드 좌표와 그룹 경계를 자동 계산한다.

LLM은 최종 좌표를 생성하지 않는다. 대신 다음 정보를 제공한다.

- zone.type
- zone.parentId
- node.zoneId
- node.layoutRole
- node.importance
- edge.source
- edge.target
- edge.crossesBoundary

Layout Engine은 이를 기준으로 일관된 기업망 구조를 만든다.

## 2. 기본 캔버스

권장 기본 캔버스 크기:

```ts
const CANVAS = {
  width: 1600,
  height: 900,
  padding: 80
}
```

## 3. Enterprise Network 기본 배치

```text
┌─────────────────────────────────────────────────────────────┐
│                         클라우드 영역                       │
├───────────────┬─────────────────────────────────────────────┤
│ 외부 인터넷   │                   A 기업망                  │
│               │ ┌──────────────┐ ┌───────────────────────┐ │
│ 공격자 PC     │ │ DMZ          │ │ 내부망                │ │
│ 외부 서비스   │ │ 웹서버/WAF   │ │ DB/AD/파일서버        │ │
│               │ └──────────────┘ └───────────────────────┘ │
│               │ ┌─────────────────────────────────────────┐ │
│               │ │ 보안 영역: SIEM/EDR/로그                │ │
│               │ └─────────────────────────────────────────┘ │
└───────────────┴─────────────────────────────────────────────┘
```

## 4. Zone 배치 규칙

### 4.1 최상위 Zone

| zone.type | 기본 위치 |
|---|---|
| external | 좌측 |
| company | 중앙/우측 큰 영역 |
| cloud | 상단 |
| partner | 우측 또는 하단 |

### 4.2 회사 내부 하위 Zone

| zone.type | 회사 내부 위치 |
|---|---|
| dmz | 좌상단 또는 중앙 왼쪽 |
| internal | 중앙 오른쪽 |
| security | 하단 |
| management | 하단 오른쪽 |
| user-zone | 내부망 하단 또는 좌측 |

## 5. Node 배치 규칙

### 5.1 layoutRole 기준

| layoutRole | 권장 위치 |
|---|---|
| source | 외부 영역 왼쪽 |
| entryPoint | DMZ의 왼쪽 또는 중앙 |
| intermediary | 소속 zone 중앙 |
| criticalAsset | 내부망 오른쪽 또는 깊은 위치 |
| securityControl | 경계 또는 보안 영역 |
| userEndpoint | 사용자 영역 |
| externalService | 외부 또는 클라우드 |
| identity | 내부망 중앙/상단 |
| logging | 보안 영역 |

### 5.2 node.type 기준 보정

| node.type | 보정 규칙 |
|---|---|
| firewall | 경계선 근처에 배치 |
| waf | DMZ 앞단에 배치 |
| webServer | DMZ 중앙에 배치 |
| database | 내부망 깊은 위치에 배치 |
| adServer | 내부망 중앙 또는 상단에 배치 |
| siem | 보안 영역 중앙에 배치 |
| edr | 보안 영역 또는 사용자 영역 가까이 배치 |
| attackerPc | 외부 영역 왼쪽에 배치 |

## 6. Edge 라우팅 규칙

### 6.1 내부 통신

- 얇은 기본 선
- 활성화 시 파란색 또는 청록색
- 패킷 애니메이션 표시

### 6.2 경계 통과 통신

`crossesBoundary: true`인 경우:

- 선을 더 굵게 표시
- 경계 교차 지점에 작은 마커 표시
- 활성화 시 주황색 또는 강조 색상 사용

### 6.3 탐지/보안 이벤트

`edge.type: securityAlert` 또는 `eventMarker.type: alert`인 경우:

- 보안 장비 방향으로 점선 또는 경고 선 표시
- 경고 아이콘 표시

## 7. 충돌 방지 규칙

Layout Engine은 다음 검사를 수행한다.

1. 노드가 부모 zone 밖으로 나갔는지 확인
2. 같은 zone 내부 노드끼리 겹치는지 확인
3. 최소 간격 유지
4. 경계 그룹 간 겹침 확인
5. edge label과 node label이 겹치는지 확인
6. 화면 밖으로 나간 노드 보정

## 8. 자동 배치 알고리즘 제안

### 8.1 단순 규칙 기반 방식

노드 수가 20~80개 정도라면 규칙 기반 배치로 충분하다.

```ts
function layoutNodesByZone(nodes, zones) {
  for (const zone of zones) {
    const zoneNodes = nodes.filter(node => node.zoneId === zone.id)
    placeNodesInGrid(zoneNodes, zone.bounds)
    applyRoleBasedOrdering(zoneNodes)
  }
}
```

### 8.2 Dagre/ELK 보조 사용

복잡한 의존 관계가 있으면 다음 전략을 사용한다.

1. zone은 규칙 기반 배치
2. 각 zone 내부 노드는 Dagre 또는 ELK로 배치
3. 결과 좌표를 zone bounds 안에 정규화
4. 충돌 검사 후 보정

## 9. 활성화 시각 효과 규칙

### 비활성 노드

- opacity: 0.35
- grayscale
- 얇은 border

### 활성 노드

- opacity: 1
- 강조 border
- glow effect
- pulse animation

### 이전 단계 노드

- opacity: 0.65
- history color
- 작은 check marker

### 활성 엣지

- stroke width 증가
- animated packet 표시
- 방향 화살표 강조

### 이벤트 마커

| event type | 표시 방식 |
|---|---|
| vulnerability | 취약점 경고 아이콘 |
| credential | 키/계정 아이콘 |
| malware | 위험 아이콘 |
| dataAccess | 데이터 접근 아이콘 |
| alert | 탐지 경고 아이콘 |
| blocked | 차단 표시 |
| investigation | 돋보기/포렌식 아이콘 |

## 10. 추천 함수 목록

```ts
layoutScenario(scenario): FlowLayout
layoutZones(zones): ZoneLayout[]
layoutNodes(nodes, zoneLayouts): NodeLayout[]
layoutEdges(edges, nodeLayouts): EdgeLayout[]
resolveCollisions(nodeLayouts, zoneLayouts): NodeLayout[]
applyStepVisualState(flow, step): FlowVisualState
```

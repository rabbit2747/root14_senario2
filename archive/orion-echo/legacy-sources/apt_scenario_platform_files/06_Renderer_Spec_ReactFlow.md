# React Flow Renderer 구현 명세

## 1. 목적

React Flow Renderer는 Scenario JSON을 기반으로 수강생이 보는 인프라 맵을 렌더링한다.

주요 기능:

- 기업망/외부망/DMZ/내부망 경계 표현
- 서버/PC/DB/방화벽 등 인프라 노드 표현
- 통신 연결선 표현
- 단계별 활성화
- 통신 흐름 애니메이션
- 이벤트 마커 표시
- 설명 패널과 동기화

## 2. 핵심 컴포넌트

```text
ScenarioPlayer
 ├─ ScenarioHeader
 ├─ ScenarioCanvas
 │   └─ ReactFlow
 │       ├─ ZoneGroupNode
 │       ├─ InfraNode
 │       └─ AnimatedTrafficEdge
 ├─ ScenarioStepPanel
 ├─ ScenarioTimeline
 └─ ScenarioControls
```

## 3. React Flow Node Types

```ts
const nodeTypes = {
  zoneGroup: ZoneGroupNode,
  attackerPc: AttackerPcNode,
  desktop: DesktopNode,
  webServer: WebServerNode,
  appServer: AppServerNode,
  database: DatabaseNode,
  firewall: FirewallNode,
  router: RouterNode,
  mailServer: MailServerNode,
  fileServer: FileServerNode,
  adServer: AdServerNode,
  siem: SiemNode,
  edr: EdrNode,
  cloudService: CloudServiceNode,
  dnsServer: DnsServerNode,
  vpn: VpnNode,
  waf: WafNode,
  proxy: ProxyNode,
  identityProvider: IdentityProviderNode,
}
```

## 4. React Flow Edge Types

```ts
const edgeTypes = {
  traffic: AnimatedTrafficEdge,
  boundary: BoundaryCrossingEdge,
  blocked: BlockedEdge,
  detection: DetectionEdge,
}
```

## 5. InfraNode 데이터

```ts
type InfraNodeData = {
  label: string
  type: InfraNodeType
  description?: string
  active: boolean
  previous: boolean
  selected: boolean
  eventMarkers: EventMarker[]
}
```

## 6. Edge 데이터

```ts
type InfraEdgeData = {
  label: string
  type: EdgeType
  active: boolean
  previous: boolean
  crossesBoundary: boolean
  eventMarkers: EventMarker[]
}
```

## 7. 단계별 활성화 로직

```ts
function applyStepState(nodes, edges, step, previousSteps) {
  const activeNodeSet = new Set(step.activeNodes)
  const activeEdgeSet = new Set(step.activeEdges)
  const previousNodeSet = new Set(previousSteps.flatMap(s => s.activeNodes))
  const previousEdgeSet = new Set(previousSteps.flatMap(s => s.activeEdges))

  return {
    nodes: nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        active: activeNodeSet.has(node.id),
        previous: !activeNodeSet.has(node.id) && previousNodeSet.has(node.id),
      }
    })),
    edges: edges.map(edge => ({
      ...edge,
      data: {
        ...edge.data,
        active: activeEdgeSet.has(edge.id),
        previous: !activeEdgeSet.has(edge.id) && previousEdgeSet.has(edge.id),
      },
      animated: activeEdgeSet.has(edge.id)
    }))
  }
}
```

## 8. Custom Node 스타일

### 기본 노드

```css
.infra-node {
  border-radius: 14px;
  padding: 12px 16px;
  background: linear-gradient(145deg, #f8fafc, #e2e8f0);
  box-shadow: 0 8px 0 rgba(15, 23, 42, 0.16), 0 16px 32px rgba(15, 23, 42, 0.10);
  border: 1px solid rgba(148, 163, 184, 0.7);
  transition: all 220ms ease;
}

.infra-node.inactive {
  opacity: 0.35;
  filter: grayscale(0.75);
}

.infra-node.active {
  opacity: 1;
  border-color: #2563eb;
  box-shadow:
    0 0 0 4px rgba(37, 99, 235, 0.18),
    0 0 32px rgba(37, 99, 235, 0.55),
    0 10px 0 rgba(37, 99, 235, 0.35);
  transform: translateY(-4px);
}

.infra-node.previous {
  opacity: 0.65;
}
```

## 9. Custom Edge 애니메이션

활성화된 연결선에는 SVG `animateMotion` 또는 CSS stroke animation을 사용한다.

```tsx
function AnimatedTrafficEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const path = `M ${sourceX} ${sourceY} C ${sourceX + 80} ${sourceY}, ${targetX - 80} ${targetY}, ${targetX} ${targetY}`

  return (
    <>
      <path
        id={id}
        d={path}
        fill="none"
        stroke={data.active ? '#2563eb' : '#94a3b8'}
        strokeWidth={data.active ? 4 : 1.5}
        strokeDasharray={data.crossesBoundary ? '8 6' : undefined}
      />

      {data.active && (
        <circle r="5" fill="#38bdf8">
          <animateMotion dur="1.2s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </>
  )
}
```

## 10. ZoneGroupNode

기업망, DMZ, 내부망, 클라우드, 협력사 경계를 표현한다.

```ts
type ZoneGroupData = {
  label: string
  type: 'external' | 'company' | 'dmz' | 'internal' | 'security' | 'cloud' | 'partner' | 'user-zone' | 'management'
  description?: string
}
```

표현 방식:

- 반투명 배경
- 점선 또는 실선 border
- 좌상단 label
- zone.type별 아이콘 또는 색상
- 활성 step에 해당 zone이 포함될 경우 경계 강조

## 11. 이벤트 마커 렌더링

`eventMarkers`는 노드 또는 엣지 위에 표시한다.

```ts
type EventMarker = {
  id: string
  type: 'vulnerability' | 'credential' | 'malware' | 'dataAccess' | 'alert' | 'blocked' | 'investigation'
  targetType: 'node' | 'edge' | 'zone'
  targetId: string
  label: string
  description: string
}
```

## 12. UX 권장 사항

1. 수강생이 처음 진입하면 전체 맵을 먼저 보여준다.
2. Step 1부터는 현재 단계의 노드와 엣지만 강하게 활성화한다.
3. 이전 단계는 흐리게 남겨 흐름을 이해하게 한다.
4. 현재 단계 설명 패널은 맵과 동시에 업데이트한다.
5. 활성 엣지에는 방향성과 움직임이 반드시 보여야 한다.
6. 이벤트 마커를 클릭하면 짧은 설명 툴팁을 제공한다.
7. 노드를 클릭하면 해당 인프라 설명을 보여준다.

## 13. 성능 가이드

노드가 수십 개 규모라면 React Flow로 충분하다. 다만 다음 원칙을 지킨다.

- 모든 노드 배열을 매 프레임 재생성하지 않는다.
- currentStep 변경 시에만 active state를 계산한다.
- activeEdges에만 애니메이션을 적용한다.
- 불필요한 React state 구독을 줄인다.
- nodeTypes와 edgeTypes는 컴포넌트 밖에서 선언한다.
- 큰 label/tooltip은 필요할 때만 렌더링한다.

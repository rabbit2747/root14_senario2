import type { Edge, Node } from '@xyflow/react'
import type { EventMarker, Scenario, ScenarioStep } from './schema'
import { layoutScenario } from './layout'

export type InfraNodeData = {
  label: string
  kind: string
  description?: string
  importance: string
  active: boolean
  previous: boolean
  markers: EventMarker[]
}

export type ZoneNodeData = {
  label: string
  kind: string
  description?: string
  active: boolean
}

export type InfraEdgeData = {
  label?: string
  kind: string
  active: boolean
  previous: boolean
  crossesBoundary: boolean
  markers: EventMarker[]
}

export function scenarioToFlow(scenario: Scenario, stepIndex: number): { nodes: Node[]; edges: Edge[] } {
  const layout = layoutScenario(scenario)
  const steps = scenario.steps.slice().sort((a, b) => a.order - b.order)
  const step = steps[stepIndex] ?? steps[0]
  const previousSteps = steps.slice(0, stepIndex)
  const activeNodes = new Set(step.activeNodes)
  const activeEdges = new Set(step.activeEdges)
  const previousNodes = new Set(previousSteps.flatMap(item => item.activeNodes))
  const previousEdges = new Set(previousSteps.flatMap(item => item.activeEdges))
  const activeZones = new Set(
    scenario.nodes.filter(node => activeNodes.has(node.id)).map(node => node.zoneId)
  )

  const markerMap = new Map<string, EventMarker[]>()
  for (const marker of step.eventMarkers) {
    const key = `${marker.targetType}:${marker.targetId}`
    markerMap.set(key, [...(markerMap.get(key) ?? []), marker])
  }

  const zoneNodes: Node<ZoneNodeData>[] = scenario.zones.map(zone => {
    const bounds = layout.zoneBounds[zone.id]
    return {
      id: `zone:${zone.id}`,
      type: 'zoneGroup',
      position: { x: bounds.x, y: bounds.y },
      selectable: false,
      draggable: false,
      data: {
        label: zone.label,
        kind: zone.type,
        description: zone.description,
        active: activeZones.has(zone.id) || Boolean(markerMap.get(`zone:${zone.id}`)?.length)
      },
      style: {
        width: bounds.width,
        height: bounds.height,
        zIndex: -20
      }
    }
  })

  const infraNodes: Node<InfraNodeData>[] = scenario.nodes.map(node => ({
    id: node.id,
    type: 'infra',
    position: layout.nodePositions[node.id] ?? { x: 0, y: 0 },
    style: {
      zIndex: 20
    },
    data: {
      label: node.label,
      kind: node.type,
      description: node.description,
      importance: node.importance,
      active: activeNodes.has(node.id),
      previous: !activeNodes.has(node.id) && previousNodes.has(node.id),
      markers: markerMap.get(`node:${node.id}`) ?? []
    }
  }))

  const edges: Edge<InfraEdgeData>[] = scenario.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type === 'securityAlert' ? 'detection' : edge.crossesBoundary ? 'boundary' : 'traffic',
    animated: activeEdges.has(edge.id),
    label: edge.label,
    zIndex: 10000,
    interactionWidth: 28,
    markerEnd: {
      type: 'arrowclosed',
      width: 18,
      height: 18,
      color: activeEdges.has(edge.id) ? '#1d4ed8' : edge.type === 'securityAlert' ? '#d97706' : '#64748b'
    },
    style: {
      stroke: activeEdges.has(edge.id) ? '#1d4ed8' : edge.type === 'securityAlert' ? '#d97706' : '#64748b',
      strokeWidth: activeEdges.has(edge.id) ? 4 : 2.4,
      opacity: activeEdges.has(edge.id) || previousEdges.has(edge.id) ? 1 : 0.72
    },
    data: {
      label: edge.label,
      kind: edge.type,
      active: activeEdges.has(edge.id),
      previous: !activeEdges.has(edge.id) && previousEdges.has(edge.id),
      crossesBoundary: edge.crossesBoundary,
      markers: markerMap.get(`edge:${edge.id}`) ?? []
    }
  }))

  return { nodes: [...zoneNodes, ...infraNodes], edges }
}

export function currentStep(scenario: Scenario, stepIndex: number): ScenarioStep {
  const steps = scenario.steps.slice().sort((a, b) => a.order - b.order)
  return steps[stepIndex] ?? steps[0]
}

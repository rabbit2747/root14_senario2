import type { InfraNode, Scenario, Zone } from './schema'

export type Vec3 = [number, number, number]

export type Zone3D = {
  id: string
  label: string
  type: Zone['type']
  center: Vec3
  size: [number, number]
}

export type Node3D = {
  id: string
  label: string
  kind: InfraNode['type']
  importance: InfraNode['importance']
  zoneId: string
  position: Vec3
}

export type Edge3D = {
  id: string
  source: string
  target: string
  kind: string
  label?: string
  points: [Vec3, Vec3]
}

export type Layout3D = {
  zones: Zone3D[]
  nodes: Node3D[]
  edges: Edge3D[]
}

const zoneDefaults: Record<Zone['type'], { center: Vec3; size: [number, number] }> = {
  external: { center: [-9, 0.02, 0], size: [4.2, 9.2] },
  company: { center: [2.2, 0.01, 0], size: [16, 10.2] },
  dmz: { center: [-1.7, 0.03, -1.6], size: [5.2, 3.6] },
  internal: { center: [4.3, 0.03, -1.2], size: [6.4, 4.2] },
  security: { center: [1.8, 0.03, 3.5], size: [11.5, 2.6] },
  cloud: { center: [0, 0.04, -5.8], size: [6.2, 1.8] },
  partner: { center: [10.4, 0.03, 0.5], size: [4.2, 5.6] },
  'user-zone': { center: [5, 0.04, 3.4], size: [4.8, 2.5] },
  management: { center: [7.8, 0.04, 3.4], size: [3.5, 2.4] }
}

const zoneIdOverrides: Record<string, { center: Vec3; size: [number, number] }> = {
  'orion-enterprise': { center: [-0.25, 0.01, 0.15], size: [12.3, 8.6] },
  'orion-dmz': { center: [-3.45, 0.03, -2.35], size: [5.6, 3.2] },
  'orion-corp': { center: [2.8, 0.03, -2.3], size: [5.7, 3.65] },
  'orion-devops': { center: [-3.45, 0.04, 2.25], size: [5.6, 3.3] },
  'orion-release': { center: [2.8, 0.04, 2.25], size: [5.7, 3.2] },
  'anrc-customer': { center: [10.9, 0.03, -1.65], size: [5.7, 5.6] },
  'orion-control': { center: [11.4, 0.04, 3.75], size: [5.7, 3.25] }
}

const roleOrder: Record<InfraNode['layoutRole'], number> = {
  source: 0,
  externalService: 1,
  securityControl: 2,
  entryPoint: 3,
  intermediary: 4,
  userEndpoint: 5,
  identity: 6,
  logging: 7,
  criticalAsset: 8
}

function placeNodes(nodes: InfraNode[], zone: Zone3D): Node3D[] {
  const sorted = [...nodes].sort((a, b) => {
    const roleDelta = roleOrder[a.layoutRole] - roleOrder[b.layoutRole]
    if (roleDelta !== 0) return roleDelta
    return a.label.localeCompare(b.label)
  })

  const cols = Math.max(1, Math.ceil(Math.sqrt(sorted.length)))
  const rows = Math.max(1, Math.ceil(sorted.length / cols))
  const [width, depth] = zone.size
  const usableWidth = Math.max(1.4, width - 1.0)
  const usableDepth = Math.max(1.4, depth - 1.0)

  return sorted.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = zone.center[0] - usableWidth / 2 + ((col + 0.5) * usableWidth) / cols
    const z = zone.center[2] - usableDepth / 2 + ((row + 0.5) * usableDepth) / rows
    return {
      id: node.id,
      label: node.label,
      kind: node.type,
      importance: node.importance,
      zoneId: node.zoneId,
      position: [x, 0.45, z]
    }
  })
}

export function layoutScenario3D(scenario: Scenario): Layout3D {
  const zones = scenario.zones.map(zone => ({
    id: zone.id,
    label: zone.label,
    type: zone.type,
    ...(zoneIdOverrides[zone.id] ?? zoneDefaults[zone.type])
  }))

  const zonesById = new Map(zones.map(zone => [zone.id, zone]))
  const nodes = zones.flatMap(zone => placeNodes(scenario.nodes.filter(node => node.zoneId === zone.id), zone))
  const nodeById = new Map(nodes.map(node => [node.id, node]))

  const edges = scenario.edges.flatMap(edge => {
    const source = nodeById.get(edge.source)
    const target = nodeById.get(edge.target)
    if (!source || !target) return []
    return [{
      id: edge.id,
      source: edge.source,
      target: edge.target,
      kind: edge.type,
      label: edge.label,
      points: [
        [source.position[0], 0.92, source.position[2]],
        [target.position[0], 0.92, target.position[2]]
      ] as [Vec3, Vec3]
    }]
  })

  return {
    zones: zones.filter(zone => zonesById.has(zone.id)),
    nodes,
    edges
  }
}

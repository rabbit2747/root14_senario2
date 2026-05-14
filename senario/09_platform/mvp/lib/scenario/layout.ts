import type { InfraNode, Scenario, Zone } from './schema'

export type Bounds = { x: number; y: number; width: number; height: number }

export type LayoutResult = {
  zoneBounds: Record<string, Bounds>
  nodePositions: Record<string, { x: number; y: number }>
}

const zoneDefaults: Record<Zone['type'], Bounds> = {
  external: { x: 60, y: 120, width: 260, height: 600 },
  company: { x: 360, y: 80, width: 980, height: 690 },
  dmz: { x: 420, y: 150, width: 360, height: 250 },
  internal: { x: 820, y: 150, width: 440, height: 300 },
  security: { x: 420, y: 500, width: 840, height: 190 },
  cloud: { x: 420, y: 20, width: 520, height: 100 },
  partner: { x: 1380, y: 190, width: 260, height: 360 },
  'user-zone': { x: 820, y: 500, width: 440, height: 190 },
  management: { x: 1080, y: 500, width: 260, height: 190 }
}

const zoneIdOverrides: Record<string, Bounds> = {
  'orion-enterprise': { x: 360, y: 70, width: 1080, height: 680 },
  'orion-dmz': { x: 420, y: 135, width: 460, height: 245 },
  'orion-corp': { x: 930, y: 135, width: 460, height: 285 },
  'orion-devops': { x: 420, y: 430, width: 460, height: 245 },
  'orion-release': { x: 930, y: 460, width: 460, height: 230 },
  'anrc-customer': { x: 1580, y: 160, width: 410, height: 410 },
  'orion-control': { x: 1580, y: 640, width: 410, height: 210 }
}

const roleWeight: Record<InfraNode['layoutRole'], number> = {
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

function zoneBoundsFor(zone: Zone): Bounds {
  if (zoneIdOverrides[zone.id]) return { ...zoneIdOverrides[zone.id] }
  const base = zoneDefaults[zone.type]
  return { ...base }
}

function placeInZone(nodes: InfraNode[], bounds: Bounds) {
  const sorted = [...nodes].sort((a, b) => {
    const roleDelta = roleWeight[a.layoutRole] - roleWeight[b.layoutRole]
    if (roleDelta !== 0) return roleDelta
    return a.label.localeCompare(b.label)
  })

  const cols = Math.max(1, Math.ceil(Math.sqrt(sorted.length)))
  const rows = Math.max(1, Math.ceil(sorted.length / cols))
  const cellWidth = bounds.width / cols
  const cellHeight = bounds.height / rows

  return sorted.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    return {
      id: node.id,
      position: {
        x: bounds.x + col * cellWidth + Math.max(28, cellWidth / 2 - 82),
        y: bounds.y + row * cellHeight + Math.max(44, cellHeight / 2 - 38)
      }
    }
  })
}

export function layoutScenario(scenario: Scenario): LayoutResult {
  const zoneBounds: Record<string, Bounds> = {}
  for (const zone of scenario.zones) {
    zoneBounds[zone.id] = zoneBoundsFor(zone)
  }

  const nodePositions: Record<string, { x: number; y: number }> = {}
  for (const zone of scenario.zones) {
    const bounds = zoneBounds[zone.id]
    const inset = zone.type === 'company' ? 24 : 18
    const zoneNodes = scenario.nodes.filter(node => node.zoneId === zone.id)
    const usable = {
      x: bounds.x + inset,
      y: bounds.y + 46,
      width: Math.max(180, bounds.width - inset * 2),
      height: Math.max(120, bounds.height - 70)
    }
    for (const placed of placeInZone(zoneNodes, usable)) {
      nodePositions[placed.id] = placed.position
    }
  }

  return { zoneBounds, nodePositions }
}

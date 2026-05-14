'use client'

import { useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Line, MapControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Cpu,
  ExternalLink,
  Layers3,
  Play,
  RotateCcw,
  Server,
  ShieldCheck
} from 'lucide-react'
import type { Scenario } from '@/lib/scenario/schema'
import type { ComponentKind, Practical3DDetailFlow, Practical3DScenario, Practical3DStage, StageComponent, TopologyNode, TopologyZone, TrustPath, Vec3 } from '@/lib/scenario/practical3d'

type Props = {
  scenario: Scenario
  practical3DScenario: Practical3DScenario
  labHref?: string
  labLabel?: string
  sideNote?: string
}

function GridFloor() {
  return (
    <group>
      <gridHelper args={[40, 40, '#0ea5b7', '#0b4050']} position={[1.5, 0, 1.1]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, -0.035, 1.1]}>
        <planeGeometry args={[42, 25]} />
        <meshBasicMaterial color="#061018" transparent opacity={0.95} />
      </mesh>
    </group>
  )
}

function ZonePlate({ zone, active, zoneColors }: { zone: TopologyZone; active: boolean; zoneColors: Practical3DScenario['theme']['zoneColors'] }) {
  const color = zoneColors[zone.kind]
  const [width, depth] = zone.size
  const isNetwork = zone.level === 'network'
  const fillOpacity = isNetwork ? (active ? 0.07 : 0.035) : (active ? 0.16 : 0.055)
  const lineOpacity = isNetwork ? (active ? 0.9 : 0.58) : (active ? 0.98 : 0.5)
  const lineWidth = isNetwork ? (active ? 3.2 : 2) : (active ? 2.8 : 1.15)
  const labelSize = isNetwork ? 0.25 : 0.2
  const labelY = isNetwork ? 0.42 : 0.34
  const points: Vec3[] = [
    [zone.center[0] - width / 2, 0.05, zone.center[2] - depth / 2],
    [zone.center[0] + width / 2, 0.05, zone.center[2] - depth / 2],
    [zone.center[0] + width / 2, 0.05, zone.center[2] + depth / 2],
    [zone.center[0] - width / 2, 0.05, zone.center[2] + depth / 2],
    [zone.center[0] - width / 2, 0.05, zone.center[2] - depth / 2]
  ]

  return (
    <group>
      <mesh position={zone.center} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={zone.size} />
        <meshBasicMaterial color={color} transparent opacity={fillOpacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Line points={points} color={color} lineWidth={lineWidth} transparent opacity={lineOpacity} />
      <Billboard position={[zone.center[0] - width / 2 + 0.32, labelY, zone.center[2] - depth / 2 + 0.28]}>
        <Text fontSize={labelSize} color={color} anchorX="left" anchorY="middle" outlineWidth={0.014} outlineColor="#020617">
          {zone.label}
        </Text>
      </Billboard>
    </group>
  )
}

function TopologyObject({ node, active, previous, base, nodeColors }: { node: TopologyNode; active: boolean; previous: boolean; base: boolean; nodeColors: Practical3DScenario['theme']['nodeColors'] }) {
  const ref = useRef<THREE.Group>(null)
  const color = nodeColors[node.kind]
  const opacity = active || base ? 0.98 : previous ? 0.58 : 0.34

  useFrame(({ clock }) => {
    if (ref.current && (active || base)) {
      ref.current.position.y = node.position[1] + Math.sin(clock.elapsedTime * (base ? 4.2 : 3.2)) * (base ? 0.055 : 0.04)
    }
  })

  const material = (
    <meshStandardMaterial color={color} emissive={base ? '#facc15' : color} emissiveIntensity={base ? 0.92 : active ? 0.78 : 0.18} transparent opacity={opacity} roughness={0.36} metalness={0.14} />
  )

  return (
    <group ref={ref} position={node.position}>
      {node.kind === 'router' || node.kind === 'operator' ? (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.32, 34]} />
          {material}
        </mesh>
      ) : node.kind === 'firewall' ? (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.98, 1.22]} />
          {material}
        </mesh>
      ) : node.kind === 'switch' || node.kind === 'proxy' ? (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.32, 0.68]} />
          {material}
        </mesh>
      ) : node.kind === 'storage' ? (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.92, 28]} />
          {material}
        </mesh>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.84, 1.04, 0.84]} />
          {material}
        </mesh>
      )}
      {active && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
          <torusGeometry args={[0.7, 0.026, 8, 72]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      )}
      {base && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
            <torusGeometry args={[0.88, 0.034, 8, 80]} />
            <meshBasicMaterial color="#facc15" transparent opacity={0.95} />
          </mesh>
          <Billboard position={[0, 1.42, 0]}>
            <group>
              <mesh>
                <planeGeometry args={[1.34, 0.28]} />
                <meshBasicMaterial color="#3f2f06" transparent opacity={0.9} />
              </mesh>
              <Text position={[0, 0.005, 0.01]} fontSize={0.12} color="#fef3c7" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#020617">
                CURRENT VIEW
              </Text>
            </group>
          </Billboard>
        </>
      )}
      <Billboard position={[0, 1.0, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[Math.max(1.32, node.label.length * 0.096), 0.34]} />
            <meshBasicMaterial color="#03080d" transparent opacity={0.84} />
          </mesh>
          <Text position={[0, 0.01, 0.01]} fontSize={0.15} color={base ? '#facc15' : active ? color : '#d8e4ee'} anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#020617">
            {node.label}
          </Text>
        </group>
      </Billboard>
    </group>
  )
}

function MovingPacket({ points, color }: { points: Vec3[]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const progress = (clock.elapsedTime * 0.46) % 1
    const index = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)))
    const [x, y, z] = points[index]
    ref.current.position.set(x, y, z)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.075, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function TopologyPathLine({ path, active, previous, nodes, pathColors }: { path: TrustPath; active: boolean; previous: boolean; nodes: TopologyNode[]; pathColors: Practical3DScenario['theme']['pathColors'] }) {
  const source = nodes.find(node => node.id === path.source)
  const target = nodes.find(node => node.id === path.target)
  if (!source || !target) return null
  const color = active ? pathColors[path.kind] : previous ? '#4ade80' : '#0f6b7c'
  const opacity = active ? 0.98 : previous ? 0.55 : 0.34
  const start: Vec3 = [source.position[0], 0.32, source.position[2]]
  const end: Vec3 = [target.position[0], 0.32, target.position[2]]
  const mid: Vec3 = [(start[0] + end[0]) / 2, active ? 0.72 : 0.42, (start[2] + end[2]) / 2]
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(...start), new THREE.Vector3(...mid), new THREE.Vector3(...end)])
  const points = curve.getPoints(30).map(point => [point.x, point.y, point.z] as Vec3)

  return (
    <group>
      <Line points={points} color={color} lineWidth={active ? path.kind === 'attacker-session' ? 4 : 3.2 : 1.35} transparent opacity={opacity} />
      {active && <MovingPacket points={points} color={color} />}
      {active && path.kind === 'attacker-session' && (
        <Billboard position={[mid[0], mid[1] + 0.18, mid[2]]}>
          <group>
            <mesh>
              <planeGeometry args={[Math.max(1.12, path.label.length * 0.075), 0.26]} />
              <meshBasicMaterial color="#3f2f06" transparent opacity={0.88} />
            </mesh>
            <Text position={[0, 0.005, 0.01]} fontSize={0.105} color="#fef3c7" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#020617">
              {path.label}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  )
}

function detailPositions(stage: Practical3DStage, nodes: TopologyNode[], detailZone: Practical3DScenario['topology']['detailZone']): Array<{ node: TopologyNode; position: Vec3; components: StageComponent[] }> {
  const activeTopologyNodes = stage.activeNodes
    .map(id => nodes.find(node => node.id === id))
    .filter((node): node is TopologyNode => Boolean(node))
  const uniqueNodes = Array.from(new Map(activeTopologyNodes.map(node => [node.id, node])).values()).slice(0, 8)
  const cols = Math.min(4, Math.max(1, uniqueNodes.length))
  const rows = Math.max(1, Math.ceil(uniqueNodes.length / cols))
  const usableWidth = detailZone.size[0] - 1.6
  const usableDepth = detailZone.size[1] - 1.15

  return uniqueNodes.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = detailZone.center[0] - usableWidth / 2 + ((col + 0.5) * usableWidth) / cols
    const z = detailZone.center[2] - usableDepth / 2 + ((row + 0.5) * usableDepth) / rows
    return {
      node,
      position: [x, 0.5, z] as Vec3,
      components: stage.components.filter(component => component.parentNodeId === node.id)
    }
  })
}

function DetailComponentChip({ component, index, componentColors }: { component: StageComponent; index: number; componentColors: Practical3DScenario['theme']['componentColors'] }) {
  const color = componentColors[component.kind]
  const row = Math.floor(index / 2)
  const col = index % 2
  const x = col === 0 ? -0.46 : 0.46
  const y = 1.08 + row * 0.24

  return (
    <Billboard position={[x, y, 0]}>
      <group>
        <mesh>
          <planeGeometry args={[0.82, 0.18]} />
          <meshBasicMaterial color="#071018" transparent opacity={0.9} />
        </mesh>
        <Line points={[[-0.39, -0.075, 0.012], [0.39, -0.075, 0.012]]} color={color} lineWidth={1.2} transparent opacity={0.75} />
        <Text position={[0, 0.01, 0.018]} fontSize={0.052} color="#e5f5ff" anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor="#020617">
          {component.label}
        </Text>
      </group>
    </Billboard>
  )
}

function DetailNodeObject({ item, nodeColors, componentColors }: { item: ReturnType<typeof detailPositions>[number]; nodeColors: Practical3DScenario['theme']['nodeColors']; componentColors: Practical3DScenario['theme']['componentColors'] }) {
  const color = nodeColors[item.node.kind]

  return (
    <group position={item.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.72, 0.72]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.74} transparent opacity={0.92} roughness={0.36} metalness={0.16} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.75, 0.75, 0.75)]} />
        <lineBasicMaterial color={color} transparent opacity={0.95} />
      </lineSegments>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.37, 0]}>
        <torusGeometry args={[0.58, 0.022, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <Billboard position={[0, 0.73, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[Math.max(1.15, item.node.label.length * 0.078), 0.26]} />
            <meshBasicMaterial color="#03080d" transparent opacity={0.88} />
          </mesh>
          <Text position={[0, 0.012, 0.012]} fontSize={0.11} color={color} anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#020617">
            {item.node.label}
          </Text>
        </group>
      </Billboard>
      {(item.components.length > 0 ? item.components : [{ id: `${item.node.id}-context`, parentNodeId: item.node.id, label: 'active topology context', kind: 'evidence' as ComponentKind }]).slice(0, 4).map((component, index) => (
        <DetailComponentChip key={component.id} component={component} index={index} componentColors={componentColors} />
      ))}
    </group>
  )
}

function StageDetailZone({ stage, nodes, detailZone, nodeColors, componentColors }: { stage: Practical3DStage; nodes: TopologyNode[]; detailZone: Practical3DScenario['topology']['detailZone']; nodeColors: Practical3DScenario['theme']['nodeColors']; componentColors: Practical3DScenario['theme']['componentColors'] }) {
  const items = detailPositions(stage, nodes, detailZone)
  const color = '#67e8f9'
  const [width, depth] = detailZone.size
  const points: Vec3[] = [
    [detailZone.center[0] - width / 2, 0.07, detailZone.center[2] - depth / 2],
    [detailZone.center[0] + width / 2, 0.07, detailZone.center[2] - depth / 2],
    [detailZone.center[0] + width / 2, 0.07, detailZone.center[2] + depth / 2],
    [detailZone.center[0] - width / 2, 0.07, detailZone.center[2] + depth / 2],
    [detailZone.center[0] - width / 2, 0.07, detailZone.center[2] - depth / 2]
  ]

  return (
    <group>
      <mesh position={detailZone.center} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={detailZone.size} />
        <meshBasicMaterial color="#082f49" transparent opacity={0.26} side={THREE.DoubleSide} />
      </mesh>
      <Line points={points} color={color} lineWidth={2.4} transparent opacity={0.9} />
      <Billboard position={[detailZone.center[0] - width / 2 + 0.35, 0.44, detailZone.center[2] - depth / 2 + 0.32]}>
        <group>
          <Text fontSize={0.2} color={color} anchorX="left" anchorY="middle" outlineWidth={0.014} outlineColor="#020617">
            Active Stage Detail
          </Text>
          <Text position={[0, -0.26, 0]} fontSize={0.12} color="#d8e4ee" anchorX="left" anchorY="middle" outlineWidth={0.01} outlineColor="#020617">
            {stage.title}
          </Text>
        </group>
      </Billboard>
      {items.map(item => {
        const source: Vec3 = [item.node.position[0], 0.24, item.node.position[2]]
        const target: Vec3 = [item.position[0], 0.24, item.position[2]]
        return (
          <Line
            key={`guide-${item.node.id}`}
            points={[source, [(source[0] + target[0]) / 2, 0.4, (source[2] + target[2]) / 2], target]}
            color={nodeColors[item.node.kind]}
            lineWidth={1}
            transparent
            opacity={0.32}
          />
        )
      })}
      {items.map(item => <DetailNodeObject key={`detail-${item.node.id}`} item={item} nodeColors={nodeColors} componentColors={componentColors} />)}
    </group>
  )
}

function TopologyScene({ stageIndex, practical3DScenario }: { stageIndex: number; practical3DScenario: Practical3DScenario }) {
  const { topology, theme, stages } = practical3DScenario
  const { zones, nodes, paths } = topology
  const { zoneColors, nodeColors, pathColors } = theme
  const stage = stages[stageIndex]
  const previousStages = stages.slice(0, stageIndex)
  const activeNodes = new Set(stage.activeNodes)
  if (stage.baseNodeId) activeNodes.add(stage.baseNodeId)
  if (stage.baseNodeId) activeNodes.add('operator')
  const previousNodes = new Set(previousStages.flatMap(item => item.baseNodeId ? [...item.activeNodes, item.baseNodeId, 'operator'] : item.activeNodes))
  const activePaths = new Set(stage.activePaths)
  const previousPaths = new Set(previousStages.flatMap(item => item.activePaths))
  const zoneById = new Map(zones.map(zone => [zone.id, zone]))
  const activeZoneIds = new Set(nodes.filter(node => activeNodes.has(node.id)).map(node => node.zoneId))
  Array.from(activeZoneIds).forEach(zoneId => {
    const parentId = zoneById.get(zoneId)?.parentId
    if (parentId) activeZoneIds.add(parentId)
  })
  const orderedZones = [...zones].sort((a, b) => (a.level === 'network' ? 0 : 1) - (b.level === 'network' ? 0 : 1))

  return (
    <>
      <color attach="background" args={['#03080d']} />
      <fog attach="fog" args={['#03080d', 18, 40]} />
      <ambientLight intensity={0.56} />
      <directionalLight position={[4, 8, 4]} intensity={1.35} />
      <pointLight position={[-6, 4, -4]} color="#22d3ee" intensity={8} distance={18} />
      <GridFloor />
      {orderedZones.map(zone => <ZonePlate key={zone.id} zone={zone} active={activeZoneIds.has(zone.id)} zoneColors={zoneColors} />)}
      {paths.map(path => <TopologyPathLine key={path.id} path={path} active={activePaths.has(path.id)} previous={previousPaths.has(path.id)} nodes={nodes} pathColors={pathColors} />)}
      {nodes.map(node => <TopologyObject key={node.id} node={node} active={activeNodes.has(node.id)} previous={previousNodes.has(node.id)} base={stage.baseNodeId === node.id} nodeColors={nodeColors} />)}
      <MapControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        enableRotate
        enableZoom
        zoomSpeed={1.05}
        panSpeed={0.9}
        screenSpacePanning={false}
        minDistance={5.5}
        maxDistance={36}
        maxPolarAngle={Math.PI / 2.25}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE
        }}
        touches={{
          ONE: THREE.TOUCH.PAN,
          TWO: THREE.TOUCH.DOLLY_ROTATE
        }}
        target={[2, 0, 0.45]}
      />
    </>
  )
}

function fallbackDetailFlows(stage: Practical3DStage, paths: TrustPath[]): Practical3DDetailFlow[] {
  const activePaths = stage.activePaths
    .map(id => paths.find(path => path.id === id))
    .filter((path): path is TrustPath => Boolean(path))

  if (activePaths.length === 0) {
    return [{
      id: `${stage.title}-local-detail`,
      sourceNodeId: stage.activeNodes[0],
      sourceFunction: 'local service context',
      technique: stage.tactic,
      summary: stage.summary,
      evidence: stage.evidenceNote
    }]
  }

  return activePaths.slice(0, 2).map(path => ({
    id: `${stage.title}-${path.id}`,
    sourceNodeId: path.source,
    targetNodeId: path.target,
    sourceFunction: path.label,
    targetFunction: path.kind,
    technique: stage.tactic,
    summary: stage.summary,
    evidence: stage.evidenceNote
  }))
}

function nodeById(nodes: TopologyNode[], nodeId?: string) {
  return nodes.find(node => node.id === nodeId)
}

function DetailInfraCard({ node, label, nodeColors }: { node?: TopologyNode; label: string; nodeColors: Practical3DScenario['theme']['nodeColors'] }) {
  const color = node ? nodeColors[node.kind] : '#64748b'

  return (
    <div className="orion2-detail-infra" style={{ '--detail-color': color } as CSSProperties}>
      <div className="orion2-detail-infra__icon">
        <Server size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{node?.label ?? 'Local Context'}</strong>
        <em>{node?.role ?? 'single-host verification'}</em>
      </div>
    </div>
  )
}

function FunctionBox({ label, muted = false }: { label?: string; muted?: boolean }) {
  if (!label) return null

  return (
    <div className={`orion2-function-box ${muted ? 'muted' : ''}`}>
      <Cpu size={14} />
      <span>{label}</span>
    </div>
  )
}

function DetailFlowCard({ flow, nodes, nodeColors }: { flow: Practical3DDetailFlow; nodes: TopologyNode[]; nodeColors: Practical3DScenario['theme']['nodeColors'] }) {
  const sourceNode = nodeById(nodes, flow.sourceNodeId)
  const targetNode = nodeById(nodes, flow.targetNodeId)

  return (
    <article className="orion2-detail-flow">
      <div className="orion2-flow-row">
        <DetailInfraCard node={sourceNode} label="Source Infra" nodeColors={nodeColors} />
        <FunctionBox label={flow.sourceFunction} />
        {targetNode && (
          <>
            <ArrowRight className="orion2-flow-arrow" size={24} />
            <FunctionBox label={flow.targetFunction} />
            <DetailInfraCard node={targetNode} label="Target Infra" nodeColors={nodeColors} />
          </>
        )}
      </div>

      <div className="orion2-technique-row">
        <div className="orion2-technique-chip">
          <ShieldCheck size={14} />
          <span>{flow.techniqueId ? `${flow.techniqueId} · ${flow.technique}` : flow.technique}</span>
        </div>
        <p>{flow.summary}</p>
      </div>

      <div className="orion2-evidence-line">
        <Activity size={14} />
        <span>{flow.evidence}</span>
      </div>
    </article>
  )
}

function StageDetailMap({ stage, practical3DScenario }: { stage: Practical3DStage; practical3DScenario: Practical3DScenario }) {
  const { topology, theme } = practical3DScenario
  const flows = stage.detailFlows?.length ? stage.detailFlows : fallbackDetailFlows(stage, topology.paths)
  const baseNode = nodeById(topology.nodes, stage.baseNodeId)

  return (
    <section className="orion2-detail-bay" aria-label="Stage detail map">
      <div className="orion2-detail-bay__header">
        <div>
          <span>Stage Detail Map</span>
          <strong>{stage.title}</strong>
        </div>
        <div className="orion2-detail-bay__header-actions">
          {baseNode && (
            <div className="orion2-base-pill" style={{ '--base-color': theme.nodeColors[baseNode.kind] } as CSSProperties}>
              <Crosshair size={13} />
              <div>
                <span>Current View</span>
                <strong>{baseNode.label}</strong>
              </div>
            </div>
          )}
          <div className="orion2-detail-bay__meta">
            {flows.length} flow{flows.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
      <div className="orion2-detail-flow-list">
        {flows.map(flow => (
          <DetailFlowCard key={flow.id} flow={flow} nodes={topology.nodes} nodeColors={theme.nodeColors} />
        ))}
      </div>
    </section>
  )
}

export function ScenarioThreePlayerOrion2({ scenario, practical3DScenario, labHref = 'http://127.0.0.1:5173/apt/orion-echo/lab', labLabel = 'Open Lab', sideNote }: Props) {
  const [stageIndex, setStageIndex] = useState(0)
  const stages = practical3DScenario.stages
  const stage = stages[stageIndex]
  const narrative = practical3DScenario.stageNarratives[stageIndex] ?? stage
  const totalStages = stages.length
  const isFinalStage = stageIndex === totalStages - 1
  const title = useMemo(() => practical3DScenario.theme.title || (scenario.title.includes('Orion Echo') ? 'Orion Echo V2 Red Team Testbed' : scenario.title), [practical3DScenario.theme.title, scenario.title])
  const note = sideNote ?? 'C2 is not part of this attack path. The flow uses SSTI foothold, direct internal discovery, application tokens, and release trust relationships.'

  return (
    <main className="orion2-workspace">
      <div className="orion2-canvas">
        <Canvas shadows camera={{ position: [9.8, 9.8, 14.2], fov: 50 }}>
          <TopologyScene stageIndex={stageIndex} practical3DScenario={practical3DScenario} />
        </Canvas>
      </div>

      <section className="orion2-hud">
        <div className="orion2-hud__title">
          <Layers3 size={19} />
          <div>
            <span>Network Topology View</span>
            <strong>{title}</strong>
          </div>
        </div>
        <div className="orion2-step">
          <span>Step {stageIndex + 1} / {totalStages}</span>
          <strong>{narrative.title}</strong>
          <p>{narrative.summary}</p>
        </div>
        <div className="orion2-actions">
          <button type="button" onClick={() => setStageIndex(index => Math.max(0, index - 1))} disabled={stageIndex === 0} title="Previous stage">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => setStageIndex(0)} title="Reset">
            <RotateCcw size={17} />
          </button>
          <button type="button" onClick={() => setStageIndex(index => Math.min(totalStages - 1, index + 1))} disabled={stageIndex === totalStages - 1} title="Next stage">
            <Play size={16} />
            <ChevronRight size={18} />
          </button>
          {isFinalStage && (
            <a className="orion2-lab-link" href={labHref} title="Open hands-on lab">
              {labLabel}
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </section>

      <section className="orion2-side">
        <h2>{narrative.tactic}</h2>
        <p>{narrative.evidenceNote}</p>
        <div>{note}</div>
      </section>

      <StageDetailMap stage={stage} practical3DScenario={practical3DScenario} />
    </main>
  )
}

'use client'

import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Line, MapControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Activity, Box, ChevronLeft, ChevronRight, Database, FileCode2, KeyRound, Layers3, Network, Package, Play, RotateCcw, Server, ShieldCheck } from 'lucide-react'
import type { InfraNode, Scenario, ScenarioStep } from '@/lib/scenario/schema'
import { currentStep } from '@/lib/scenario/flow'
import { layoutScenario3D, type Edge3D, type Node3D, type Vec3, type Zone3D } from '@/lib/scenario/layout3d'

type Props = {
  scenario: Scenario
}

const zoneColors: Record<string, string> = {
  external: '#22d3ee',
  company: '#38bdf8',
  dmz: '#f59e0b',
  internal: '#4ade80',
  security: '#a78bfa',
  cloud: '#67e8f9',
  partner: '#fb7185',
  'user-zone': '#2dd4bf',
  management: '#facc15'
}

const nodeColors: Record<string, string> = {
  attackerPc: '#fb7185',
  desktop: '#38bdf8',
  webServer: '#22d3ee',
  appServer: '#60a5fa',
  database: '#4ade80',
  firewall: '#f97316',
  router: '#06b6d4',
  mailServer: '#a78bfa',
  fileServer: '#c084fc',
  adServer: '#fde047',
  siem: '#facc15',
  edr: '#34d399',
  cloudService: '#67e8f9',
  dnsServer: '#93c5fd',
  vpn: '#2dd4bf',
  waf: '#f59e0b',
  proxy: '#22d3ee',
  identityProvider: '#fde047'
}

type ComponentKind = 'service' | 'config' | 'credential' | 'artifact' | 'data' | 'control' | 'log'

type ActiveComponent = {
  id: string
  label: string
  kind: ComponentKind
}

type ActiveHost = {
  node: InfraNode
  zoneLabel: string
  components: ActiveComponent[]
}

type TopologyDeviceKind = 'internet' | 'router' | 'firewall' | 'switch' | 'gateway'

type TopologyDevice = {
  id: string
  zoneId: string
  label: string
  kind: TopologyDeviceKind
  position: Vec3
}

const componentLabelsByNode: Record<string, ActiveComponent[]> = {
  operator: [
    { id: 'operator-console', label: 'operator console', kind: 'control' },
    { id: 'scenario-notes', label: 'recon notes', kind: 'data' }
  ],
  'edge-proxy': [
    { id: 'reverse-proxy-rule', label: 'route rules', kind: 'config' },
    { id: 'edge-access-log', label: 'edge access log', kind: 'log' }
  ],
  'public-site': [
    { id: 'product-pages', label: 'product metadata', kind: 'data' },
    { id: 'customer-names', label: 'customer references', kind: 'data' }
  ],
  'public-docs': [
    { id: 'release-notes', label: 'release notes', kind: 'data' },
    { id: 'agent-docs', label: 'EchoAgent docs', kind: 'data' }
  ],
  'support-portal': [
    { id: 'support-session', label: 'support session', kind: 'service' },
    { id: 'portal-upload', label: 'case attachment', kind: 'data' }
  ],
  'vendor-portal': [
    { id: 'vendor-session', label: 'vendor session', kind: 'service' },
    { id: 'partner-case', label: 'partner case data', kind: 'data' }
  ],
  'corp-sso': [
    { id: 'sso-session', label: 'SSO session', kind: 'credential' },
    { id: 'role-claims', label: 'role claims', kind: 'credential' }
  ],
  intranet: [
    { id: 'internal-index', label: 'internal index', kind: 'service' },
    { id: 'team-links', label: 'team links', kind: 'data' }
  ],
  'hr-directory': [
    { id: 'org-chart', label: 'org chart', kind: 'data' },
    { id: 'employee-records', label: 'employee records', kind: 'data' }
  ],
  wiki: [
    { id: 'runbook-pages', label: 'release runbooks', kind: 'data' },
    { id: 'signing-guide', label: 'signing procedure', kind: 'config' }
  ],
  'ticket-service': [
    { id: 'release-ticket', label: 'release ticket', kind: 'data' },
    { id: 'customer-request', label: 'customer request', kind: 'data' }
  ],
  'doc-portal': [
    { id: 'internal-docs', label: 'internal docs', kind: 'data' },
    { id: 'operation-guide', label: 'operation guide', kind: 'config' }
  ],
  'mail-web': [
    { id: 'release-mail', label: 'release mail thread', kind: 'data' },
    { id: 'approval-context', label: 'approval context', kind: 'data' }
  ],
  'source-repo': [
    { id: 'release-pipeline', label: 'release-pipeline.yml', kind: 'config' },
    { id: 'repo-ref', label: 'repo/ref/channel', kind: 'config' }
  ],
  'build-server': [
    { id: 'build-token', label: 'build permission', kind: 'credential' },
    { id: 'build-artifact', label: 'ANRC artifact', kind: 'artifact' }
  ],
  'signing-service': [
    { id: 'manifest-check', label: 'manifest check', kind: 'control' },
    { id: 'signing-policy', label: 'signing policy', kind: 'config' }
  ],
  'update-server': [
    { id: 'update-channel', label: 'ANRC channel', kind: 'service' },
    { id: 'trusted-update', label: 'trusted update', kind: 'artifact' }
  ],
  'customer-app': [
    { id: 'agent-update', label: 'EchoAgent update', kind: 'artifact' },
    { id: 'customer-session', label: 'customer session', kind: 'service' }
  ],
  'customer-api': [
    { id: 'api-metadata', label: 'API metadata', kind: 'data' },
    { id: 'export-index', label: 'export index', kind: 'data' }
  ],
  'object-store': [
    { id: 'audit-export', label: 'audit export', kind: 'data' },
    { id: 'facility-risk', label: 'facility risk summary', kind: 'data' }
  ],
  monitoring: [
    { id: 'customer-telemetry', label: 'telemetry feed', kind: 'log' },
    { id: 'update-event', label: 'update event', kind: 'log' }
  ],
  'c2-emulator': [
    { id: 'operator-channel', label: 'operator channel', kind: 'control' },
    { id: 'safe-callback', label: 'safe callback', kind: 'log' }
  ],
  'audit-log': [
    { id: 'audit-events', label: 'audit events', kind: 'log' },
    { id: 'detection-trail', label: 'detection trail', kind: 'log' }
  ],
  'evidence-vault': [
    { id: 'impact-evidence', label: 'impact evidence', kind: 'data' },
    { id: 'evidence-chain', label: 'evidence chain', kind: 'log' }
  ]
}

const componentFallbackByKind: Record<InfraNode['type'], ActiveComponent[]> = {
  attackerPc: [{ id: 'operator-action', label: 'operator action', kind: 'control' }],
  desktop: [{ id: 'endpoint-session', label: 'endpoint session', kind: 'service' }],
  webServer: [{ id: 'web-service', label: 'web service', kind: 'service' }],
  appServer: [{ id: 'app-process', label: 'application process', kind: 'service' }],
  database: [{ id: 'records', label: 'records', kind: 'data' }],
  firewall: [{ id: 'policy', label: 'policy rule', kind: 'control' }],
  router: [{ id: 'route', label: 'route table', kind: 'config' }],
  mailServer: [{ id: 'mailbox', label: 'mailbox data', kind: 'data' }],
  fileServer: [{ id: 'files', label: 'files and docs', kind: 'data' }],
  adServer: [{ id: 'directory', label: 'directory objects', kind: 'credential' }],
  siem: [{ id: 'events', label: 'security events', kind: 'log' }],
  edr: [{ id: 'sensor', label: 'sensor event', kind: 'log' }],
  cloudService: [{ id: 'cloud-object', label: 'cloud object', kind: 'data' }],
  dnsServer: [{ id: 'dns-record', label: 'DNS records', kind: 'config' }],
  vpn: [{ id: 'vpn-session', label: 'VPN session', kind: 'credential' }],
  waf: [{ id: 'waf-rule', label: 'WAF policy', kind: 'control' }],
  proxy: [{ id: 'proxy-route', label: 'proxy route', kind: 'config' }],
  identityProvider: [{ id: 'identity-claim', label: 'identity claim', kind: 'credential' }]
}

function componentIcon(kind: ComponentKind) {
  switch (kind) {
    case 'config':
      return FileCode2
    case 'credential':
      return KeyRound
    case 'artifact':
      return Package
    case 'data':
      return Database
    case 'control':
      return ShieldCheck
    case 'log':
      return Activity
    default:
      return Box
  }
}

function buildActiveHosts(scenario: Scenario, step: ScenarioStep): ActiveHost[] {
  const nodeById = new Map(scenario.nodes.map(node => [node.id, node]))
  const zoneById = new Map(scenario.zones.map(zone => [zone.id, zone]))
  const edgeNodeIds = scenario.edges
    .filter(edge => step.activeEdges.includes(edge.id))
    .flatMap(edge => [edge.source, edge.target])
  const orderedIds = Array.from(new Set([...step.activeNodes, ...edgeNodeIds]))

  return orderedIds
    .map(id => nodeById.get(id))
    .filter((node): node is InfraNode => Boolean(node))
    .slice(0, 8)
    .map(node => ({
      node,
      zoneLabel: zoneById.get(node.zoneId)?.label ?? node.zoneId,
      components: (componentLabelsByNode[node.id] ?? componentFallbackByKind[node.type]).slice(0, 3)
    }))
}

const topologyDeviceColors: Record<TopologyDeviceKind, string> = {
  internet: '#e2e8f0',
  router: '#38bdf8',
  firewall: '#fb7185',
  switch: '#67e8f9',
  gateway: '#a78bfa'
}

function buildTopologyDevices(zones: Zone3D[]): TopologyDevice[] {
  const zoneById = new Map(zones.map(zone => [zone.id, zone]))
  const device = (id: string, zoneId: string, label: string, kind: TopologyDeviceKind, offsetX: number, offsetZ: number): TopologyDevice | null => {
    const zone = zoneById.get(zoneId)
    if (!zone) return null
    return {
      id,
      zoneId,
      label,
      kind,
      position: [zone.center[0] + offsetX, 0.44, zone.center[2] + offsetZ]
    }
  }

  return [
    device('internet', 'external', 'Internet', 'internet', -0.85, 2.55),
    device('edge-router', 'external', 'Edge Router', 'router', 0.45, 1.55),
    device('dmz-firewall', 'orion-dmz', 'DMZ Firewall', 'firewall', -2.05, 0.95),
    device('dmz-switch', 'orion-dmz', 'DMZ L4 Switch', 'switch', -0.25, 0.95),
    device('corp-switch', 'orion-corp', 'Corp L3 Switch', 'switch', -0.65, 0.95),
    device('devops-switch', 'orion-devops', 'DevOps Switch', 'switch', -0.7, -0.9),
    device('release-switch', 'orion-release', 'Release L4 Switch', 'switch', -0.7, -0.85),
    device('customer-firewall', 'anrc-customer', 'Customer Firewall', 'firewall', -1.95, 0.2),
    device('customer-switch', 'anrc-customer', 'Customer Switch', 'switch', -0.2, 0.2),
    device('control-gateway', 'orion-control', 'C2 Gateway', 'gateway', -1.3, -0.2)
  ].filter((item): item is TopologyDevice => Boolean(item))
}

const topologyLinks = [
  ['internet', 'edge-router'],
  ['edge-router', 'dmz-firewall'],
  ['dmz-firewall', 'dmz-switch'],
  ['dmz-switch', 'corp-switch'],
  ['corp-switch', 'devops-switch'],
  ['devops-switch', 'release-switch'],
  ['release-switch', 'customer-firewall'],
  ['customer-firewall', 'customer-switch'],
  ['dmz-switch', 'control-gateway'],
  ['corp-switch', 'control-gateway']
]

function lift([x, y, z]: Vec3, amount: number): Vec3 {
  return [x, y + amount, z]
}

function ZonePlane({ zone, active }: { zone: Zone3D; active: boolean }) {
  const color = zoneColors[zone.type] ?? '#38bdf8'
  const points: Vec3[] = [
    [zone.center[0] - zone.size[0] / 2, 0.04, zone.center[2] - zone.size[1] / 2],
    [zone.center[0] + zone.size[0] / 2, 0.04, zone.center[2] - zone.size[1] / 2],
    [zone.center[0] + zone.size[0] / 2, 0.04, zone.center[2] + zone.size[1] / 2],
    [zone.center[0] - zone.size[0] / 2, 0.04, zone.center[2] + zone.size[1] / 2],
    [zone.center[0] - zone.size[0] / 2, 0.04, zone.center[2] - zone.size[1] / 2]
  ]

  return (
    <group>
      <mesh position={zone.center} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={zone.size} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.16 : 0.055} side={THREE.DoubleSide} />
      </mesh>
      <Line points={points} color={color} lineWidth={active ? 2.6 : 1.2} transparent opacity={active ? 0.95 : 0.48} />
      <Billboard position={[zone.center[0] - zone.size[0] / 2 + 0.35, 0.35, zone.center[2] - zone.size[1] / 2 + 0.28]}>
        <Text fontSize={0.22} color={color} anchorX="left" anchorY="middle" outlineWidth={0.018} outlineColor="#061018">
          {zone.label}
        </Text>
      </Billboard>
    </group>
  )
}

function InfraObject({ node, active, previous }: { node: Node3D; active: boolean; previous: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const color = nodeColors[node.kind] ?? '#22d3ee'
  const height = node.kind === 'database' ? 0.75 : node.kind === 'firewall' || node.kind === 'waf' ? 0.55 : 0.95
  const opacity = active ? 0.95 : previous ? 0.58 : 0.32

  useFrame(({ clock }) => {
    if (ref.current && active) {
      ref.current.position.y = node.position[1] + Math.sin(clock.elapsedTime * 3) * 0.045
    }
  })

  return (
    <group ref={ref} position={node.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.82, height, 0.82]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.75 : 0.18}
          transparent
          opacity={opacity}
          roughness={0.38}
          metalness={0.18}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.86, height + 0.02, 0.86)]} />
        <lineBasicMaterial color={color} transparent opacity={active ? 1 : 0.55} />
      </lineSegments>
      {node.kind === 'database' && (
        <mesh position={[0, height / 2 + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.36, 0.028, 8, 36]} />
          <meshBasicMaterial color={color} transparent opacity={0.82} />
        </mesh>
      )}
      <Billboard position={[0, height + 0.42, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[Math.max(1.25, node.label.length * 0.115), 0.38]} />
            <meshBasicMaterial color="#071018" transparent opacity={0.82} />
          </mesh>
          <Text position={[0, 0.01, 0.01]} fontSize={0.18} color={active ? color : '#d8e4ee'} anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#020617">
            {node.label}
          </Text>
        </group>
      </Billboard>
      {active && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
          <torusGeometry args={[0.68, 0.025, 8, 72]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
}

function TrafficEdge({ edge, active, previous }: { edge: Edge3D; active: boolean; previous: boolean }) {
  const color = edge.kind === 'securityAlert' ? '#f97316' : active ? '#22d3ee' : previous ? '#4ade80' : '#64748b'
  const opacity = active ? 1 : previous ? 0.78 : 0.4
  const start = lift(edge.points[0], active ? 0.2 : 0)
  const end = lift(edge.points[1], active ? 0.2 : 0)
  const mid: Vec3 = [(start[0] + end[0]) / 2, Math.max(start[1], end[1]) + 0.35, (start[2] + end[2]) / 2]
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...start),
    new THREE.Vector3(...mid),
    new THREE.Vector3(...end)
  ])
  const points = curve.getPoints(28).map(point => [point.x, point.y, point.z] as Vec3)

  return (
    <group>
      <Line points={points} color={color} lineWidth={active ? 3.2 : 1.35} transparent opacity={opacity} />
      {active && <MovingPacket points={points} color={color} />}
    </group>
  )
}

function TopologyDeviceObject({ device, active }: { device: TopologyDevice; active: boolean }) {
  const color = topologyDeviceColors[device.kind]
  const emissiveIntensity = active ? 0.95 : 0.28

  return (
    <group position={device.position}>
      {device.kind === 'router' || device.kind === 'internet' ? (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.28, 36]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} transparent opacity={active ? 0.9 : 0.58} />
        </mesh>
      ) : device.kind === 'firewall' ? (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.92, 1.16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} transparent opacity={active ? 0.9 : 0.62} />
        </mesh>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.26, 0.62]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} transparent opacity={active ? 0.9 : 0.62} />
        </mesh>
      )}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(device.kind === 'firewall' ? 0.32 : 1.08, device.kind === 'firewall' ? 0.95 : 0.3, device.kind === 'firewall' ? 1.2 : 0.66)]} />
        <lineBasicMaterial color={color} transparent opacity={active ? 1 : 0.55} />
      </lineSegments>
      <Billboard position={[0, 0.92, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[Math.max(1.35, device.label.length * 0.095), 0.34]} />
            <meshBasicMaterial color="#03080d" transparent opacity={0.82} />
          </mesh>
          <Text position={[0, 0.01, 0.01]} fontSize={0.15} color={color} anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#020617">
            {device.label}
          </Text>
        </group>
      </Billboard>
    </group>
  )
}

function TopologyBackbone({ devices, activeZones }: { devices: TopologyDevice[]; activeZones: Set<string> }) {
  const deviceById = new Map(devices.map(device => [device.id, device]))

  return (
    <group>
      {topologyLinks.flatMap(([sourceId, targetId]) => {
        const source = deviceById.get(sourceId)
        const target = deviceById.get(targetId)
        if (!source || !target) return []
        const active = activeZones.has(source.zoneId) || activeZones.has(target.zoneId)
        const points: Vec3[] = [
          [source.position[0], 0.2, source.position[2]],
          [target.position[0], 0.2, target.position[2]]
        ]
        return [<Line key={`${sourceId}-${targetId}`} points={points} color={active ? '#67e8f9' : '#0ea5b7'} lineWidth={active ? 3 : 1.4} transparent opacity={active ? 0.88 : 0.42} />]
      })}
      {devices.map(device => (
        <TopologyDeviceObject key={device.id} device={device} active={activeZones.has(device.zoneId)} />
      ))}
    </group>
  )
}

function MovingPacket({ points, color }: { points: Vec3[]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const progress = (clock.elapsedTime * 0.42) % 1
    const index = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)))
    const [x, y, z] = points[index]
    ref.current.position.set(x, y, z)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function GridFloor() {
  return (
    <group>
      <gridHelper args={[38, 38, '#0ea5b7', '#0b4050']} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <planeGeometry args={[40, 24]} />
        <meshBasicMaterial color="#071018" transparent opacity={0.94} />
      </mesh>
    </group>
  )
}

function Scene({ scenario, stepIndex }: { scenario: Scenario; stepIndex: number }) {
  const layout = useMemo(() => layoutScenario3D(scenario), [scenario])
  const step = currentStep(scenario, stepIndex)
  const previousSteps = scenario.steps.slice().sort((a, b) => a.order - b.order).slice(0, stepIndex)
  const activeNodes = new Set(step.activeNodes)
  const previousNodes = new Set(previousSteps.flatMap(item => item.activeNodes))
  const activeEdges = new Set(step.activeEdges)
  const previousEdges = new Set(previousSteps.flatMap(item => item.activeEdges))
  const activeZones = new Set(layout.nodes.filter(node => activeNodes.has(node.id)).map(node => node.zoneId))
  const topologyDevices = useMemo(() => buildTopologyDevices(layout.zones), [layout.zones])

  return (
    <>
      <color attach="background" args={['#03080d']} />
      <fog attach="fog" args={['#03080d', 18, 38]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 8, 4]} intensity={1.4} />
      <pointLight position={[-5, 4, -3]} color="#22d3ee" intensity={8} distance={16} />
      <GridFloor />
      {layout.zones.map(zone => <ZonePlane key={zone.id} zone={zone} active={activeZones.has(zone.id)} />)}
      <TopologyBackbone devices={topologyDevices} activeZones={activeZones} />
      {layout.edges.map(edge => (
        <TrafficEdge key={edge.id} edge={edge} active={activeEdges.has(edge.id)} previous={previousEdges.has(edge.id)} />
      ))}
      {layout.nodes.map(node => (
        <InfraObject key={node.id} node={node} active={activeNodes.has(node.id)} previous={previousNodes.has(node.id)} />
      ))}
      <MapControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        panSpeed={0.9}
        screenSpacePanning={false}
        minDistance={8}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.25}
        target={[2.5, 0, 0.4]}
      />
    </>
  )
}

function ActiveStageBay({ hosts, step }: { hosts: ActiveHost[]; step: ScenarioStep }) {
  return (
    <section className="active-stage-bay">
      <div className="active-stage-bay__header">
        <div>
          <span>Active Stage Detail</span>
          <strong>{step.title}</strong>
        </div>
        <div className="active-stage-bay__meta">
          <Network size={15} />
          {hosts.length} infra elements
        </div>
      </div>
      <div className="active-stage-bay__rail">
        {hosts.map((host, index) => {
          const color = nodeColors[host.node.type] ?? '#22d3ee'
          return (
            <div className="active-host" key={host.node.id} style={{ '--host-color': color } as CSSProperties}>
              <div className="active-host__top">
                <div className="active-host__icon">
                  <Server size={18} />
                </div>
                <div>
                  <span>{host.zoneLabel}</span>
                  <strong>{host.node.label}</strong>
                </div>
              </div>
              <div className="active-host__components">
                {host.components.map(component => {
                  const Icon = componentIcon(component.kind)
                  return (
                    <div className={`active-component active-component--${component.kind}`} key={component.id}>
                      <Icon size={14} />
                      <span>{component.label}</span>
                    </div>
                  )
                })}
              </div>
              {index < hosts.length - 1 && <div className="active-host__connector" />}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function ScenarioThreePlayer({ scenario }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = currentStep(scenario, stepIndex)
  const totalSteps = scenario.steps.length
  const activeHosts = useMemo(() => buildActiveHosts(scenario, step), [scenario, step])

  return (
    <main className="three-workspace">
      <div className="three-canvas">
        <Canvas shadows camera={{ position: [9.5, 9.5, 13.5], fov: 51 }}>
          <Scene scenario={scenario} stepIndex={stepIndex} />
        </Canvas>
      </div>

      <section className="three-hud">
        <div className="three-hud__title">
          <Layers3 size={19} />
          <div>
            <span>3D Scenario Map</span>
            <strong>{scenario.title}</strong>
          </div>
        </div>
        <div className="three-step">
          <span>Step {stepIndex + 1} / {totalSteps}</span>
          <strong>{step.title}</strong>
          <p>{step.summary}</p>
        </div>
        <div className="three-actions">
          <button type="button" onClick={() => setStepIndex(index => Math.max(0, index - 1))} disabled={stepIndex === 0} title="이전 단계">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => setStepIndex(0)} title="처음으로">
            <RotateCcw size={17} />
          </button>
          <button type="button" onClick={() => setStepIndex(index => Math.min(totalSteps - 1, index + 1))} disabled={stepIndex === totalSteps - 1} title="다음 단계">
            <Play size={16} />
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="three-side">
        <h2>{step.tactic}</h2>
        <p>{step.explanation.defenseView}</p>
        <div>{step.explanation.learnerTakeaway}</div>
      </section>

      <ActiveStageBay hosts={activeHosts} step={step} />
    </main>
  )
}

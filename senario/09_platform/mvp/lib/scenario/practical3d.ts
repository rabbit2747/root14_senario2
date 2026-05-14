export type Vec3 = [number, number, number]

export type ZoneKind = 'internet' | 'orion' | 'dmz' | 'internal' | 'devops' | 'release' | 'customer' | 'external-leak'
export type NodeKind = 'operator' | 'proxy' | 'router' | 'firewall' | 'switch' | 'server' | 'storage' | 'evidence'
export type ComponentKind = 'endpoint' | 'service' | 'config' | 'credential' | 'artifact' | 'log' | 'evidence' | 'data'
export type PathKind = 'http' | 'discovery' | 'api-token' | 'signed-artifact' | 'update-channel' | 'exfiltration' | 'attacker-session' | 'evidence'

export type TopologyZone = {
  id: string
  label: string
  kind: ZoneKind
  center: Vec3
  size: [number, number]
  parentId?: string
  level?: 'network' | 'segment'
}

export type TopologyNode = {
  id: string
  label: string
  zoneId: string
  kind: NodeKind
  role: string
  position: Vec3
}

export type TrustPath = {
  id: string
  source: string
  target: string
  kind: PathKind
  label: string
}

export type StageComponent = {
  id: string
  parentNodeId: string
  label: string
  kind: ComponentKind
}

export type Practical3DDetailFlow = {
  id: string
  sourceNodeId: string
  targetNodeId?: string
  sourceFunction: string
  targetFunction?: string
  technique: string
  techniqueId?: string
  summary: string
  evidence: string
}

export type Practical3DStage = {
  title: string
  tactic: string
  summary: string
  activeNodes: string[]
  baseNodeId?: string
  activePaths: string[]
  components: StageComponent[]
  evidenceNote: string
  detailFlows?: Practical3DDetailFlow[]
}

export type StageNarrative = Pick<Practical3DStage, 'title' | 'tactic' | 'summary' | 'evidenceNote'>

export type Practical3DTheme = {
  title?: string
  zoneColors: Record<ZoneKind, string>
  nodeColors: Record<NodeKind, string>
  pathColors: Record<PathKind, string>
  componentColors: Record<ComponentKind, string>
}

export type Practical3DScenario = {
  metadata: {
    id: string
    title: string
    subtitle?: string
    difficulty?: string
    estimatedMinutes?: number
  }
  theme: Practical3DTheme
  topology: {
    detailZone: {
      center: Vec3
      size: [number, number]
    }
    zones: TopologyZone[]
    nodes: TopologyNode[]
    paths: TrustPath[]
  }
  stages: Practical3DStage[]
  stageNarratives: StageNarrative[]
}

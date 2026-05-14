import { z } from 'zod'

export const ZoneTypeSchema = z.enum([
  'external',
  'company',
  'dmz',
  'internal',
  'security',
  'cloud',
  'partner',
  'user-zone',
  'management'
])

export const NodeTypeSchema = z.enum([
  'attackerPc',
  'desktop',
  'webServer',
  'appServer',
  'database',
  'firewall',
  'router',
  'mailServer',
  'fileServer',
  'adServer',
  'siem',
  'edr',
  'cloudService',
  'dnsServer',
  'vpn',
  'waf',
  'proxy',
  'identityProvider'
])

export const LayoutRoleSchema = z.enum([
  'source',
  'entryPoint',
  'intermediary',
  'criticalAsset',
  'securityControl',
  'userEndpoint',
  'externalService',
  'identity',
  'logging'
])

export const EdgeTypeSchema = z.enum([
  'http',
  'https',
  'smtp',
  'dns',
  'ssh',
  'rdp',
  'db',
  'smb',
  'api',
  'log',
  'securityAlert',
  'vpn',
  'identity',
  'unknown'
])

export const TacticSchema = z.enum([
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact',
  'Detection & Response'
])

export const EventMarkerTypeSchema = z.enum([
  'vulnerability',
  'credential',
  'malware',
  'dataAccess',
  'alert',
  'blocked',
  'investigation'
])

export const ZoneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: ZoneTypeSchema,
  parentId: z.string().nullable().optional(),
  description: z.string().optional()
})

export const InfraNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: NodeTypeSchema,
  zoneId: z.string().min(1),
  layoutRole: LayoutRoleSchema,
  importance: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().optional()
})

export const InfraEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: EdgeTypeSchema,
  label: z.string().optional(),
  crossesBoundary: z.boolean().default(false),
  description: z.string().optional()
})

export const EventMarkerSchema = z.object({
  id: z.string().min(1),
  type: EventMarkerTypeSchema,
  targetType: z.enum(['node', 'edge', 'zone']),
  targetId: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional()
})

export const QuizSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  answerIndex: z.number().int().min(0),
  explanation: z.string().min(1)
})

export const StepExplanationSchema = z.object({
  attackView: z.string().min(1),
  defenseView: z.string().min(1),
  learnerTakeaway: z.string().min(1)
})

export const ScenarioStepSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  tactic: TacticSchema,
  summary: z.string().min(1),
  activeNodes: z.array(z.string().min(1)),
  activeEdges: z.array(z.string().min(1)),
  eventMarkers: z.array(EventMarkerSchema).default([]),
  explanation: StepExplanationSchema,
  quiz: QuizSchema.optional()
})

export const ScenarioSchema = z.object({
  schemaVersion: z.string().min(1),
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.number().int().positive(),
  layoutMode: z.enum(['enterprise-network', 'cloud-hybrid', 'partner-supply-chain', 'incident-response']),
  learningObjectives: z.array(z.string().min(1)).min(1),
  safetyLevel: z.enum(['defensive-education', 'authorized-redteam-lab']),
  zones: z.array(ZoneSchema).min(1),
  nodes: z.array(InfraNodeSchema).min(1),
  edges: z.array(InfraEdgeSchema),
  steps: z.array(ScenarioStepSchema).min(1),
  metadata: z.object({
    createdBy: z.string().optional(),
    reviewStatus: z.enum(['draft', 'needs_review', 'approved', 'published', 'archived']).default('draft'),
    tags: z.array(z.string()).default([])
  })
})

export type Scenario = z.infer<typeof ScenarioSchema>
export type ScenarioStep = z.infer<typeof ScenarioStepSchema>
export type InfraNode = z.infer<typeof InfraNodeSchema>
export type InfraEdge = z.infer<typeof InfraEdgeSchema>
export type EventMarker = z.infer<typeof EventMarkerSchema>
export type Zone = z.infer<typeof ZoneSchema>

export function validateScenarioReferences(scenario: Scenario): string[] {
  const errors: string[] = []
  const zoneIds = new Set(scenario.zones.map(zone => zone.id))
  const nodeIds = new Set(scenario.nodes.map(node => node.id))
  const edgeIds = new Set(scenario.edges.map(edge => edge.id))

  for (const zone of scenario.zones) {
    if (zone.parentId && !zoneIds.has(zone.parentId)) {
      errors.push(`Zone "${zone.id}" references missing parentId "${zone.parentId}".`)
    }
  }

  for (const node of scenario.nodes) {
    if (!zoneIds.has(node.zoneId)) {
      errors.push(`Node "${node.id}" references missing zoneId "${node.zoneId}".`)
    }
  }

  for (const edge of scenario.edges) {
    if (!nodeIds.has(edge.source)) errors.push(`Edge "${edge.id}" references missing source node "${edge.source}".`)
    if (!nodeIds.has(edge.target)) errors.push(`Edge "${edge.id}" references missing target node "${edge.target}".`)
  }

  for (const step of scenario.steps) {
    for (const nodeId of step.activeNodes) {
      if (!nodeIds.has(nodeId)) errors.push(`Step "${step.id}" references missing activeNode "${nodeId}".`)
    }
    for (const edgeId of step.activeEdges) {
      if (!edgeIds.has(edgeId)) errors.push(`Step "${step.id}" references missing activeEdge "${edgeId}".`)
    }
    for (const marker of step.eventMarkers) {
      if (marker.targetType === 'node' && !nodeIds.has(marker.targetId)) {
        errors.push(`Marker "${marker.id}" references missing node "${marker.targetId}".`)
      }
      if (marker.targetType === 'edge' && !edgeIds.has(marker.targetId)) {
        errors.push(`Marker "${marker.id}" references missing edge "${marker.targetId}".`)
      }
      if (marker.targetType === 'zone' && !zoneIds.has(marker.targetId)) {
        errors.push(`Marker "${marker.id}" references missing zone "${marker.targetId}".`)
      }
    }
    if (step.quiz && step.quiz.answerIndex >= step.quiz.options.length) {
      errors.push(`Step "${step.id}" has quiz.answerIndex outside options range.`)
    }
  }

  return errors
}

export function parseAndValidateScenario(input: unknown): { scenario?: Scenario; errors: string[] } {
  const parsed = ScenarioSchema.safeParse(input)
  if (!parsed.success) {
    return { errors: parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) }
  }

  const referenceErrors = validateScenarioReferences(parsed.data)
  if (referenceErrors.length > 0) return { errors: referenceErrors }

  return { scenario: parsed.data, errors: [] }
}

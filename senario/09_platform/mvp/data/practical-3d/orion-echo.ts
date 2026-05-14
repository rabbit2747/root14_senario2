import type { ComponentKind, NodeKind, PathKind, Practical3DScenario, Practical3DStage, StageNarrative, TopologyNode, TopologyZone, TrustPath, Vec3, ZoneKind } from '@/lib/scenario/practical3d'

const zoneColors: Record<ZoneKind, string> = {
  internet: '#e2e8f0',
  orion: '#38bdf8',
  dmz: '#f59e0b',
  internal: '#4ade80',
  devops: '#facc15',
  release: '#a78bfa',
  customer: '#fb7185',
  'external-leak': '#f43f5e'
}

const nodeColors: Record<NodeKind, string> = {
  operator: '#fb7185',
  proxy: '#22d3ee',
  router: '#38bdf8',
  firewall: '#f97316',
  switch: '#67e8f9',
  server: '#60a5fa',
  storage: '#4ade80',
  evidence: '#facc15'
}

const pathColors: Record<PathKind, string> = {
  http: '#22d3ee',
  discovery: '#4ade80',
  'api-token': '#facc15',
  'signed-artifact': '#a78bfa',
  'update-channel': '#fb7185',
  exfiltration: '#f43f5e',
  'attacker-session': '#facc15',
  evidence: '#67e8f9'
}

const componentColors: Record<ComponentKind, string> = {
  endpoint: '#67e8f9',
  service: '#22d3ee',
  config: '#93c5fd',
  credential: '#facc15',
  artifact: '#a78bfa',
  log: '#fb7185',
  evidence: '#facc15',
  data: '#4ade80'
}

const detailZone = {
  center: [2.4, 0.06, 7.55] as Vec3,
  size: [15.8, 3.75] as [number, number]
}

const zones: TopologyZone[] = [
  { id: 'operator-net', label: 'Operator Network', kind: 'internet', center: [-10.25, 0.01, -0.15], size: [3.75, 7.4], level: 'network' },
  { id: 'orion-enterprise', label: 'Orion Echo Enterprise Network', kind: 'orion', center: [0.45, 0.01, 0.25], size: [14.35, 9.65], level: 'network' },
  { id: 'customer', label: 'ANRC Customer Network', kind: 'customer', center: [10.9, 0.01, -0.35], size: [5.8, 7.35], level: 'network' },
  { id: 'external-leak', label: 'External Leak Site', kind: 'external-leak', center: [16.15, 0.01, 1.1], size: [4.35, 4.1], level: 'network' },
  { id: 'dmz', label: 'DMZ Service Servers', kind: 'dmz', center: [-3.25, 0.025, -1.85], size: [4.75, 3.95], parentId: 'orion-enterprise', level: 'segment' },
  { id: 'internal', label: 'Corporate Internal', kind: 'internal', center: [2.25, 0.025, -2.05], size: [5.55, 4.05], parentId: 'orion-enterprise', level: 'segment' },
  { id: 'devops', label: 'DevOps', kind: 'devops', center: [-2.05, 0.025, 3.1], size: [5.05, 3.25], parentId: 'orion-enterprise', level: 'segment' },
  { id: 'release', label: 'Release Trust Chain', kind: 'release', center: [3.85, 0.025, 3.1], size: [5.05, 3.25], parentId: 'orion-enterprise', level: 'segment' }
]

const nodes: TopologyNode[] = [
  { id: 'operator', label: 'Red Team Operator', zoneId: 'operator-net', kind: 'operator', role: 'operator workstation', position: [-10.25, 0.46, 0.8] },
  { id: 'edge-proxy', label: 'Edge Proxy / WAF', zoneId: 'dmz', kind: 'proxy', role: 'reverse proxy / TLS termination', position: [-4.85, 0.48, -0.45] },
  { id: 'dmz-fw', label: 'DMZ Firewall', zoneId: 'dmz', kind: 'firewall', role: 'DMZ boundary control', position: [-3.85, 0.5, -0.45] },
  { id: 'dmz-switch', label: 'DMZ L4 Switch', zoneId: 'dmz', kind: 'switch', role: 'DMZ service switching', position: [-2.8, 0.42, -0.45] },
  { id: 'public-site', label: 'Public Site Server', zoneId: 'dmz', kind: 'server', role: 'marketing/product surface', position: [-3.9, 0.55, -2.75] },
  { id: 'public-docs', label: 'Public Docs Server', zoneId: 'dmz', kind: 'server', role: 'release notes and docs', position: [-2.55, 0.55, -2.75] },
  { id: 'support-portal', label: 'Support Portal Server', zoneId: 'dmz', kind: 'server', role: 'SSTI initial access surface', position: [-1.55, 0.55, -1.35] },
  { id: 'vendor-portal', label: 'Vendor Portal Server', zoneId: 'dmz', kind: 'server', role: 'partner/release portal', position: [-1.55, 0.55, -3.0] },
  { id: 'corp-switch', label: 'Corp L3 Switch', zoneId: 'internal', kind: 'switch', role: 'internal routing', position: [1.55, 0.42, -0.35] },
  { id: 'corp-sso', label: 'Corp SSO', zoneId: 'internal', kind: 'server', role: 'identity', position: [2.35, 0.55, -2.9] },
  { id: 'wiki', label: 'Wiki Runbooks', zoneId: 'internal', kind: 'server', role: 'release runbooks', position: [3.65, 0.55, -3.25] },
  { id: 'ticket-service', label: 'Ticket Service', zoneId: 'internal', kind: 'server', role: 'release/customer tickets', position: [4.9, 0.55, -2.55] },
  { id: 'doc-portal', label: 'Doc Portal', zoneId: 'internal', kind: 'server', role: 'operations documents', position: [2.9, 0.55, -1.35] },
  { id: 'mail-web', label: 'Mail Web', zoneId: 'internal', kind: 'server', role: 'approval context', position: [4.35, 0.55, -1.2] },
  { id: 'devops-switch', label: 'DevOps Switch', zoneId: 'devops', kind: 'switch', role: 'dev/build routing', position: [-3.25, 0.42, 2.35] },
  { id: 'source-repo', label: 'Source Repo', zoneId: 'devops', kind: 'server', role: 'release pipeline config', position: [-2.15, 0.55, 3.65] },
  { id: 'build-server', label: 'Build Server', zoneId: 'devops', kind: 'server', role: 'build job API', position: [-0.25, 0.55, 3.55] },
  { id: 'release-switch', label: 'Release L4 Switch', zoneId: 'release', kind: 'switch', role: 'release routing', position: [2.5, 0.42, 2.25] },
  { id: 'signing-service', label: 'Signing Service', zoneId: 'release', kind: 'server', role: 'artifact signing', position: [3.55, 0.55, 3.6] },
  { id: 'update-server', label: 'Update Server', zoneId: 'release', kind: 'server', role: 'ANRC update channel', position: [5.35, 0.55, 3.35] },
  { id: 'customer-fw', label: 'Customer Firewall', zoneId: 'customer', kind: 'firewall', role: 'customer boundary', position: [8.95, 0.5, -0.2] },
  { id: 'customer-switch', label: 'Customer Switch', zoneId: 'customer', kind: 'switch', role: 'customer routing', position: [10.15, 0.42, -0.2] },
  { id: 'customer-app', label: 'Customer App', zoneId: 'customer', kind: 'server', role: 'trusted update consumer', position: [10.25, 0.55, -2.4] },
  { id: 'customer-api', label: 'Customer API', zoneId: 'customer', kind: 'server', role: 'customer data API', position: [11.7, 0.55, -1.2] },
  { id: 'object-store', label: 'Object Store', zoneId: 'customer', kind: 'storage', role: 'sensitive exports', position: [12.55, 0.55, 0.85] },
  { id: 'monitoring', label: 'Monitoring', zoneId: 'customer', kind: 'evidence', role: 'customer telemetry', position: [12.65, 0.55, -2.65] },
  { id: 'dark-web-drop', label: 'Dark Web Drop', zoneId: 'external-leak', kind: 'server', role: 'external leak drop record', position: [15.35, 0.55, 0.35] },
  { id: 'leak-bundle', label: 'Leak Bundle', zoneId: 'external-leak', kind: 'storage', role: 'exposed customer dataset', position: [16.9, 0.55, 1.65] }
]

const paths: TrustPath[] = [
  { id: 'operator-edge', source: 'operator', target: 'edge-proxy', kind: 'http', label: 'public access' },
  { id: 'session-support', source: 'operator', target: 'support-portal', kind: 'attacker-session', label: 'operator shell session' },
  { id: 'session-build', source: 'operator', target: 'build-server', kind: 'attacker-session', label: 'operator build session' },
  { id: 'session-update', source: 'operator', target: 'update-server', kind: 'attacker-session', label: 'operator release session' },
  { id: 'session-customer-api', source: 'operator', target: 'customer-api', kind: 'attacker-session', label: 'operator customer API session' },
  { id: 'edge-dmz-fw', source: 'edge-proxy', target: 'dmz-fw', kind: 'http', label: 'reverse proxy route' },
  { id: 'dmz-fw-switch', source: 'dmz-fw', target: 'dmz-switch', kind: 'http', label: 'DMZ ingress' },
  { id: 'dmz-public-site', source: 'dmz-switch', target: 'public-site', kind: 'http', label: 'route /' },
  { id: 'dmz-public-docs', source: 'dmz-switch', target: 'public-docs', kind: 'http', label: 'route /docs' },
  { id: 'dmz-support', source: 'dmz-switch', target: 'support-portal', kind: 'http', label: 'route /support' },
  { id: 'dmz-vendor', source: 'dmz-switch', target: 'vendor-portal', kind: 'http', label: 'route /portal' },
  { id: 'support-corp', source: 'support-portal', target: 'corp-switch', kind: 'discovery', label: 'internal reachability' },
  { id: 'corp-wiki', source: 'corp-switch', target: 'wiki', kind: 'discovery', label: 'wiki health' },
  { id: 'corp-ticket', source: 'corp-switch', target: 'ticket-service', kind: 'discovery', label: 'ticket health' },
  { id: 'corp-doc', source: 'corp-switch', target: 'doc-portal', kind: 'discovery', label: 'doc health' },
  { id: 'corp-mail', source: 'corp-switch', target: 'mail-web', kind: 'discovery', label: 'mail health' },
  { id: 'corp-devops', source: 'corp-switch', target: 'devops-switch', kind: 'discovery', label: 'devops route' },
  { id: 'devops-repo', source: 'devops-switch', target: 'source-repo', kind: 'discovery', label: 'repo access' },
  { id: 'devops-build', source: 'devops-switch', target: 'build-server', kind: 'api-token', label: 'build API' },
  { id: 'support-wiki-direct', source: 'support-portal', target: 'wiki', kind: 'discovery', label: 'wiki health probe' },
  { id: 'support-ticket-direct', source: 'support-portal', target: 'ticket-service', kind: 'discovery', label: 'ticket health probe' },
  { id: 'support-doc-direct', source: 'support-portal', target: 'doc-portal', kind: 'discovery', label: 'doc collection session' },
  { id: 'support-mail-direct', source: 'support-portal', target: 'mail-web', kind: 'discovery', label: 'mail collection session' },
  { id: 'support-source-direct', source: 'support-portal', target: 'source-repo', kind: 'discovery', label: 'repo config read' },
  { id: 'support-build-direct', source: 'support-portal', target: 'build-server', kind: 'api-token', label: 'build API call' },
  { id: 'build-release', source: 'build-server', target: 'release-switch', kind: 'signed-artifact', label: 'artifact transfer' },
  { id: 'release-signing', source: 'release-switch', target: 'signing-service', kind: 'signed-artifact', label: 'sign request' },
  { id: 'release-update', source: 'signing-service', target: 'update-server', kind: 'update-channel', label: 'signed manifest' },
  { id: 'build-signing-direct', source: 'build-server', target: 'signing-service', kind: 'signed-artifact', label: 'signing request' },
  { id: 'signing-update-direct', source: 'signing-service', target: 'update-server', kind: 'update-channel', label: 'publish signed manifest' },
  { id: 'update-customer-fw', source: 'update-server', target: 'customer-fw', kind: 'update-channel', label: 'ANRC channel' },
  { id: 'customer-fw-switch', source: 'customer-fw', target: 'customer-switch', kind: 'update-channel', label: 'customer ingress' },
  { id: 'customer-app', source: 'customer-switch', target: 'customer-app', kind: 'update-channel', label: 'poll update' },
  { id: 'update-customer-app-direct', source: 'update-server', target: 'customer-app', kind: 'update-channel', label: 'trusted update poll' },
  { id: 'customer-api', source: 'customer-app', target: 'customer-api', kind: 'http', label: 'customer API' },
  { id: 'customer-object', source: 'customer-api', target: 'object-store', kind: 'http', label: 'export object' },
  { id: 'object-dark-drop', source: 'object-store', target: 'dark-web-drop', kind: 'exfiltration', label: 'leak transfer' },
  { id: 'dark-drop-bundle', source: 'dark-web-drop', target: 'leak-bundle', kind: 'exfiltration', label: 'exposed dataset' }
]

const stages: Practical3DStage[] = [
  {
    title: 'Stage 0. Public Surface Reconnaissance',
    tactic: 'Reconnaissance',
    summary: 'Identify the Orion product version, release notes, and ANRC channel references from public exposure to establish the supply-chain starting point.',
    activeNodes: ['edge-proxy', 'public-site', 'public-docs'],
    baseNodeId: 'operator',
    activePaths: ['operator-edge', 'dmz-public-site', 'dmz-public-docs'],
    evidenceNote: 'route logs, product metadata, release notes, ANRC channel hints',
    detailFlows: [
      {
        id: 'flow-0-public-docs',
        sourceNodeId: 'operator',
        targetNodeId: 'public-docs',
        sourceFunction: 'OSINT browser / public routing',
        targetFunction: 'release notes and product metadata',
        techniqueId: 'T1591',
        technique: 'Gather Victim Org Information',
        summary: 'The learner sees public-facing documentation as the first usable function, not just a web server box.',
        evidence: 'route access logs, release note metadata, ANRC channel hints'
      }
    ],
    components: [
      { id: 'c0-1', parentNodeId: 'edge-proxy', label: 'route access logs', kind: 'log' },
      { id: 'c0-2', parentNodeId: 'public-site', label: 'product metadata', kind: 'data' },
      { id: 'c0-3', parentNodeId: 'public-docs', label: 'release notes', kind: 'data' },
      { id: 'c0-4', parentNodeId: 'vendor-portal', label: 'ANRC channel hints', kind: 'data' }
    ]
  },
  {
    title: 'Stage 1. Support Portal Initial Access',
    tactic: 'Initial Access',
    summary: 'Initial access occurs through the support preview renderer, leaving a preview audit event and a post-exploit marker.',
    activeNodes: ['support-portal'],
    baseNodeId: 'support-portal',
    activePaths: ['operator-edge', 'dmz-support', 'session-support'],
    evidenceNote: 'SSTI payload, shell context, exploit telemetry',
    detailFlows: [
      {
        id: 'flow-1-ssti-preview',
        sourceNodeId: 'operator',
        targetNodeId: 'support-portal',
        sourceFunction: 'crafted preview request',
        targetFunction: 'template preview renderer',
        techniqueId: 'T1190',
        technique: 'Exploit Public-Facing Application',
        summary: 'The important detail is the preview-rendering function exposed by the support portal.',
        evidence: 'preview endpoint request, renderer telemetry, constrained shell context'
      }
    ],
    components: [
      { id: 'c1-1', parentNodeId: 'support-portal', label: '/support/preview', kind: 'endpoint' },
      { id: 'c1-2', parentNodeId: 'support-portal', label: 'template renderer', kind: 'service' },
      { id: 'c1-3', parentNodeId: 'support-portal', label: 'SSTI payload', kind: 'config' },
      { id: 'c1-4', parentNodeId: 'support-portal', label: 'shell context', kind: 'evidence' },
      { id: 'c1-5', parentNodeId: 'support-portal', label: 'exploit log', kind: 'log' }
    ]
  },
  {
    title: 'Stage 2. Foothold Validation',
    tactic: 'Discovery',
    summary: 'Confirm current privileges, hostname, routing, and DNS resolver context from the support-portal execution point before judging internal movement.',
    activeNodes: ['support-portal'],
    baseNodeId: 'support-portal',
    activePaths: ['session-support'],
    evidenceNote: 'user context, hostname, route table, resolver configuration',
    detailFlows: [
      {
        id: 'flow-2-local-context',
        sourceNodeId: 'support-portal',
        sourceFunction: 'local process context',
        techniqueId: 'T1082',
        technique: 'System Information Discovery',
        summary: 'The learner checks what the foothold can actually see before assuming lateral movement.',
        evidence: 'id/whoami, hostname, route table, resolver configuration'
      }
    ],
    components: [
      { id: 'c2-1', parentNodeId: 'support-portal', label: 'id / whoami', kind: 'evidence' },
      { id: 'c2-2', parentNodeId: 'support-portal', label: 'hostname', kind: 'evidence' },
      { id: 'c2-3', parentNodeId: 'support-portal', label: 'ip route', kind: 'config' },
      { id: 'c2-4', parentNodeId: 'support-portal', label: '/etc/resolv.conf', kind: 'config' },
      { id: 'c2-5', parentNodeId: 'support-portal', label: 'command telemetry', kind: 'log' }
    ]
  },
  {
    title: 'Stage 3. Internal Service Discovery',
    tactic: 'Discovery',
    summary: 'From the DMZ foothold, discover reachable Corporate and DevOps services such as wiki, ticket-service, source-repo, and build-server.',
    activeNodes: ['wiki', 'ticket-service', 'source-repo', 'build-server'],
    baseNodeId: 'support-portal',
    activePaths: ['session-support', 'support-wiki-direct', 'support-ticket-direct', 'support-source-direct', 'support-build-direct'],
    evidenceNote: 'DNS lookup results and internal service health responses',
    detailFlows: [
      {
        id: 'flow-3-health-probe',
        sourceNodeId: 'support-portal',
        targetNodeId: 'wiki',
        sourceFunction: 'DNS lookup and HTTP health probe',
        targetFunction: 'wiki service health endpoint',
        techniqueId: 'T1046',
        technique: 'Network Service Discovery',
        summary: 'The detail view shows service discovery as a function-to-function probe path.',
        evidence: 'internal DNS result, HTTP status, reachable service map'
      }
    ],
    components: [
      { id: 'c3-1', parentNodeId: 'support-portal', label: 'getent hosts', kind: 'service' },
      { id: 'c3-2', parentNodeId: 'support-portal', label: 'HTTP health probes', kind: 'service' },
      { id: 'c3-3', parentNodeId: 'wiki', label: 'wiki:8000', kind: 'endpoint' },
      { id: 'c3-4', parentNodeId: 'ticket-service', label: 'ticket-service:8000', kind: 'endpoint' },
      { id: 'c3-5', parentNodeId: 'source-repo', label: 'source-repo:8000', kind: 'endpoint' },
      { id: 'c3-6', parentNodeId: 'build-server', label: 'build-server:8000', kind: 'endpoint' }
    ]
  },
  {
    title: 'Stage 4. Internal Knowledge Collection',
    tactic: 'Collection',
    summary: 'Collect release runbooks, tickets, approval context, and pipeline metadata from internal knowledge and business systems.',
    activeNodes: ['wiki', 'ticket-service', 'doc-portal', 'mail-web', 'source-repo'],
    baseNodeId: 'support-portal',
    activePaths: ['session-support', 'support-wiki-direct', 'support-ticket-direct', 'support-doc-direct', 'support-mail-direct', 'support-source-direct'],
    evidenceNote: 'release runbooks, tickets, approval context, repo config',
    detailFlows: [
      {
        id: 'flow-4-runbook-collection',
        sourceNodeId: 'support-portal',
        targetNodeId: 'wiki',
        sourceFunction: 'authenticated internal HTTP session',
        targetFunction: 'release runbook repository',
        techniqueId: 'T1213',
        technique: 'Data from Information Repositories',
        summary: 'The learner sees that the useful asset is a runbook function inside the wiki service.',
        evidence: 'release runbook, ticket metadata, approval context, repo config'
      }
    ],
    components: [
      { id: 'c4-1', parentNodeId: 'wiki', label: 'release runbook', kind: 'data' },
      { id: 'c4-2', parentNodeId: 'ticket-service', label: 'OES release ticket', kind: 'data' },
      { id: 'c4-3', parentNodeId: 'doc-portal', label: 'operations guide', kind: 'data' },
      { id: 'c4-4', parentNodeId: 'mail-web', label: 'approval context', kind: 'data' },
      { id: 'c4-5', parentNodeId: 'source-repo', label: 'release-pipeline config', kind: 'config' }
    ]
  },
  {
    title: 'Stage 5. Build Permission Clue Identification',
    tactic: 'Credential Access',
    summary: 'Combine internal document and repository clues to identify build trigger token context, release branch, and the ANRC channel.',
    activeNodes: ['wiki', 'ticket-service', 'source-repo'],
    baseNodeId: 'support-portal',
    activePaths: ['session-support', 'support-wiki-direct', 'support-ticket-direct', 'support-source-direct'],
    evidenceNote: 'build token source, release ref, ANRC channel, signing workflow',
    detailFlows: [
      {
        id: 'flow-5-token-clue',
        sourceNodeId: 'source-repo',
        targetNodeId: 'build-server',
        sourceFunction: 'release-pipeline config',
        targetFunction: 'build trigger token validation',
        techniqueId: 'T1550',
        technique: 'Use Alternate Authentication Material',
        summary: 'The detail view ties the token clue to the build API function that accepts it.',
        evidence: 'token source, release ref, ANRC channel, signing workflow'
      }
    ],
    components: [
      { id: 'c5-1', parentNodeId: 'wiki', label: 'signing workflow', kind: 'config' },
      { id: 'c5-2', parentNodeId: 'ticket-service', label: 'release request', kind: 'data' },
      { id: 'c5-3', parentNodeId: 'source-repo', label: 'BUILD_TRIGGER_TOKEN', kind: 'credential' },
      { id: 'c5-4', parentNodeId: 'source-repo', label: 'release ref', kind: 'config' },
      { id: 'c5-5', parentNodeId: 'build-server', label: 'ANRC channel', kind: 'config' }
    ]
  },
  {
    title: 'Stage 6. Build Server API Abuse',
    tactic: 'Lateral Movement',
    summary: 'Call the Build Server API, confirm the build job is accepted, and capture the build job id and acceptance marker.',
    activeNodes: ['build-server'],
    baseNodeId: 'support-portal',
    activePaths: ['session-support', 'support-build-direct'],
    evidenceNote: 'accepted build job, job metadata, artifact metadata',
    detailFlows: [
      {
        id: 'flow-6-build-api',
        sourceNodeId: 'support-portal',
        targetNodeId: 'build-server',
        sourceFunction: 'application token from source-repo',
        targetFunction: '/api/jobs build job API',
        techniqueId: 'T1608',
        technique: 'Stage Capabilities',
        summary: 'The learner sees the build API as the function that turns access material into an artifact.',
        evidence: 'accepted build job, job metadata, artifact metadata, API access log'
      }
    ],
    components: [
      { id: 'c6-1', parentNodeId: 'build-server', label: '/api/jobs', kind: 'endpoint' },
      { id: 'c6-2', parentNodeId: 'build-server', label: 'application token', kind: 'credential' },
      { id: 'c6-3', parentNodeId: 'build-server', label: 'build job metadata', kind: 'evidence' },
      { id: 'c6-4', parentNodeId: 'build-server', label: 'artifact metadata', kind: 'artifact' },
      { id: 'c6-5', parentNodeId: 'build-server', label: 'API access log', kind: 'log' }
    ]
  },
  {
    title: 'Stage 7. Artifact Build Review',
    tactic: 'Collection',
    summary: 'Review the build-server artifact id, artifact hash, and build marker before the release enters signing.',
    activeNodes: ['build-server'],
    baseNodeId: 'build-server',
    activePaths: ['session-build'],
    evidenceNote: 'artifact id, artifact hash, build marker',
    detailFlows: [
      {
        id: 'flow-7-artifact-review',
        sourceNodeId: 'build-server',
        sourceFunction: 'build job artifact registry',
        technique: 'Artifact Build Review',
        summary: 'The learner confirms the build output before it enters signing and publishing.',
        evidence: 'artifact id, artifact hash, build marker'
      }
    ],
    components: [
      { id: 'c7-1', parentNodeId: 'build-server', label: 'artifact id', kind: 'artifact' },
      { id: 'c7-2', parentNodeId: 'build-server', label: 'artifact hash', kind: 'evidence' },
      { id: 'c7-3', parentNodeId: 'build-server', label: 'build marker', kind: 'log' }
    ]
  },
  {
    title: 'Stage 8. Sign and Publish',
    tactic: 'Supply Chain',
    summary: 'The build artifact moves through signing-service and becomes the ANRC update manifest on update-server.',
    activeNodes: ['build-server', 'signing-service', 'update-server'],
    baseNodeId: 'build-server',
    activePaths: ['session-build', 'build-signing-direct', 'signing-update-direct'],
    evidenceNote: 'signed manifest, signing log, ANRC update manifest',
    detailFlows: [
      {
        id: 'flow-8-sign-publish',
        sourceNodeId: 'build-server',
        targetNodeId: 'update-server',
        sourceFunction: 'artifact transfer and signing request',
        targetFunction: 'signed manifest publish channel',
        techniqueId: 'T1195.002',
        technique: 'Compromise Software Supply Chain',
        summary: 'The detail map shows how trust moves through signing into the update channel.',
        evidence: 'signed manifest, signing log, ANRC update manifest'
      }
    ],
    components: [
      { id: 'c8-1', parentNodeId: 'build-server', label: 'artifact transfer', kind: 'artifact' },
      { id: 'c8-2', parentNodeId: 'signing-service', label: 'signing log', kind: 'log' },
      { id: 'c8-3', parentNodeId: 'signing-service', label: 'signed manifest', kind: 'artifact' },
      { id: 'c8-4', parentNodeId: 'update-server', label: 'ANRC update manifest', kind: 'service' }
    ]
  },
  {
    title: 'Stage 9. Customer Trusted Update',
    tactic: 'Trusted Relationship',
    summary: 'The ANRC customer app trusts the vendor update channel and applies the update.',
    activeNodes: ['update-server', 'customer-app', 'customer-api'],
    baseNodeId: 'update-server',
    activePaths: ['session-update', 'update-customer-app-direct', 'customer-api'],
    evidenceNote: 'customer poll response, customer update applied event',
    detailFlows: [
      {
        id: 'flow-9-update-poll',
        sourceNodeId: 'update-server',
        targetNodeId: 'customer-app',
        sourceFunction: 'ANRC update channel manifest',
        targetFunction: 'trusted update poll and apply',
        techniqueId: 'T1072',
        technique: 'Software Deployment Tools',
        summary: 'The learner can see why the customer app accepts the vendor update path.',
        evidence: 'customer poll response, customer update applied event'
      }
    ],
    components: [
      { id: 'c9-1', parentNodeId: 'update-server', label: 'ANRC update manifest', kind: 'artifact' },
      { id: 'c9-2', parentNodeId: 'customer-app', label: 'customer poll response', kind: 'service' },
      { id: 'c9-3', parentNodeId: 'customer-app', label: 'update applied event', kind: 'log' },
      { id: 'c9-4', parentNodeId: 'customer-api', label: 'API reachability', kind: 'evidence' }
    ]
  },
  {
    title: 'Stage 10. Customer Export Access',
    tactic: 'Collection',
    summary: 'Review customer API and object-store access evidence for the customer export.',
    activeNodes: ['customer-api', 'object-store'],
    baseNodeId: 'customer-api',
    activePaths: ['session-customer-api', 'customer-object'],
    evidenceNote: 'export detail, presigned URL, object access proof',
    detailFlows: [
      {
        id: 'flow-10-export-object',
        sourceNodeId: 'customer-api',
        targetNodeId: 'object-store',
        sourceFunction: '/exports metadata endpoint',
        targetFunction: 'audit export object access',
        techniqueId: 'T1530',
        technique: 'Data from Cloud Storage',
        summary: 'The diagram shows the data-access function rather than only the customer API and storage boxes.',
        evidence: 'export detail, presigned URL, object access proof'
      }
    ],
    components: [
      { id: 'c10-1', parentNodeId: 'customer-api', label: '/exports', kind: 'endpoint' },
      { id: 'c10-2', parentNodeId: 'customer-api', label: 'export detail', kind: 'data' },
      { id: 'c10-3', parentNodeId: 'object-store', label: 'presigned URL', kind: 'credential' },
      { id: 'c10-4', parentNodeId: 'object-store', label: 'object access proof', kind: 'evidence' }
    ]
  },
  {
    title: 'Stage 11. Customer Data Exfiltration To Dark Web',
    tactic: 'Exfiltration',
    summary: 'The customer export leaves ANRC and appears as leak metadata, a dark-web drop record, and an exposed dataset.',
    activeNodes: ['customer-api', 'object-store', 'dark-web-drop', 'leak-bundle'],
    baseNodeId: 'customer-api',
    activePaths: ['session-customer-api', 'customer-object', 'object-dark-drop', 'dark-drop-bundle'],
    evidenceNote: 'leak bundle metadata, dark-web drop record, exposed customer dataset',
    detailFlows: [
      {
        id: 'flow-11-darkweb-exfiltration',
        sourceNodeId: 'object-store',
        targetNodeId: 'dark-web-drop',
        sourceFunction: 'customer export archive',
        targetFunction: 'dark-web drop record',
        techniqueId: 'T1041',
        technique: 'Exfiltration Over C2 Channel',
        summary: 'The learner sees how collected customer records leave the trusted customer data path and become external dark-web exposure.',
        evidence: 'leak bundle metadata, dark-web drop record, exposed customer dataset'
      }
    ],
    components: [
      { id: 'c11-1', parentNodeId: 'object-store', label: 'customer export archive', kind: 'data' },
      { id: 'c11-2', parentNodeId: 'dark-web-drop', label: 'dark-web drop record', kind: 'log' },
      { id: 'c11-3', parentNodeId: 'dark-web-drop', label: 'leak bundle metadata', kind: 'evidence' },
      { id: 'c11-4', parentNodeId: 'leak-bundle', label: 'exposed customer dataset', kind: 'data' }
    ]
  }
]

const englishStageNarratives: StageNarrative[] = [
  {
    title: 'Stage 0. Public Surface Reconnaissance',
    tactic: 'Reconnaissance',
    summary: 'Identify the Orion product version, release notes, and ANRC channel references from public exposure to establish the supply-chain starting point.',
    evidenceNote: 'product/version metadata, release note, ANRC channel reference'
  },
  {
    title: 'Stage 1. Support Portal Initial Access',
    tactic: 'Initial Access',
    summary: 'Initial access occurs through the support preview renderer, leaving a preview audit event and a post-exploit marker.',
    evidenceNote: 'preview audit event, post exploit marker'
  },
  {
    title: 'Stage 2. Foothold Validation',
    tactic: 'Discovery',
    summary: 'Confirm current privileges, hostname, routing, and DNS resolver context from the support-portal execution point before judging internal movement.',
    evidenceNote: 'id output, hostname output, route table, resolver configuration'
  },
  {
    title: 'Stage 3. Internal Service Discovery',
    tactic: 'Discovery',
    summary: 'From the DMZ foothold, discover reachable Corporate and DevOps services such as wiki, ticket-service, source-repo, and build-server.',
    evidenceNote: 'service list, health endpoint, route evidence'
  },
  {
    title: 'Stage 4. Internal Knowledge Collection',
    tactic: 'Collection',
    summary: 'Collect release runbooks, tickets, approval context, and pipeline metadata from internal knowledge and business systems.',
    evidenceNote: 'release runbook, release ticket, pipeline metadata'
  },
  {
    title: 'Stage 5. Build Permission Clue Identification',
    tactic: 'Credential Access',
    summary: 'Combine internal document and repository clues to identify build trigger token context, release branch, and the ANRC channel.',
    evidenceNote: 'build trigger token context, release branch, ANRC channel'
  },
  {
    title: 'Stage 6. Build Server API Abuse',
    tactic: 'Lateral Movement',
    summary: 'Call the Build Server API, confirm the build job is accepted, and capture the build job id and acceptance marker.',
    evidenceNote: 'HTTP 202 build response, build job id, acceptance marker'
  },
  {
    title: 'Stage 7. Artifact Build Review',
    tactic: 'Collection',
    summary: 'Review artifact id, artifact hash, and build marker generated by the Build Server before the release enters signing.',
    evidenceNote: 'artifact id, artifact hash, build marker'
  },
  {
    title: 'Stage 8. Sign and Publish',
    tactic: 'Supply Chain',
    summary: 'The build artifact passes through signing-service, becomes a signed manifest, and is published as the ANRC update manifest on update-server.',
    evidenceNote: 'signed manifest, signing log, ANRC update manifest'
  },
  {
    title: 'Stage 9. Customer Trusted Update',
    tactic: 'Trusted Relationship',
    summary: 'The ANRC customer app trusts the vendor update channel, applies the update, and opens the flow toward customer API access.',
    evidenceNote: 'customer poll response, customer update applied event'
  },
  {
    title: 'Stage 10. Customer Export Access',
    tactic: 'Collection',
    summary: 'Review customer API and object-store access evidence to connect export detail, presigned URL, and object access proof.',
    evidenceNote: 'export detail, presigned URL, object access proof'
  },
  {
    title: 'Stage 11. Customer Data Exfiltration To Dark Web',
    tactic: 'Exfiltration',
    summary: 'The customer export is exfiltrated to the External Leak Site and verified through leak bundle metadata, a dark-web drop record, and the exposed customer dataset.',
    evidenceNote: 'leak bundle metadata, dark-web drop record, exposed customer dataset'
  }
]

const normalizedStages: Practical3DStage[] = stages.map((stage, index) => ({
  ...stage,
  title: englishStageNarratives[index]?.title ?? stage.title,
  tactic: englishStageNarratives[index]?.tactic ?? stage.tactic,
  summary: englishStageNarratives[index]?.summary ?? stage.summary,
  evidenceNote: englishStageNarratives[index]?.evidenceNote ?? stage.evidenceNote
}))

export const orionEchoPractical3DScenario: Practical3DScenario = {
  metadata: {
    id: 'orion-echo',
    title: 'Orion Echo V2 Red Team Testbed',
    subtitle: 'Supply Chain Attack Practical 3D',
    difficulty: 'advanced',
    estimatedMinutes: 90
  },
  theme: {
    title: 'Orion Echo V2 Red Team Testbed',
    zoneColors,
    nodeColors,
    pathColors,
    componentColors
  },
  topology: {
    detailZone,
    zones,
    nodes,
    paths
  },
  stages: normalizedStages,
  stageNarratives: englishStageNarratives
}

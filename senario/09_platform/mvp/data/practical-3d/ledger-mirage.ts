import type { ComponentKind, NodeKind, PathKind, Practical3DScenario, Practical3DStage, StageNarrative, TopologyNode, TopologyZone, TrustPath, Vec3, ZoneKind } from '@/lib/scenario/practical3d'

const zoneColors: Record<ZoneKind, string> = {
  internet: '#e2e8f0',
  orion: '#38bdf8',
  dmz: '#22d3ee',
  internal: '#a78bfa',
  devops: '#34d399',
  release: '#facc15',
  customer: '#fb7185',
  'external-leak': '#f59e0b'
}

const nodeColors: Record<NodeKind, string> = {
  operator: '#facc15',
  proxy: '#22d3ee',
  router: '#38bdf8',
  firewall: '#f97316',
  switch: '#67e8f9',
  server: '#60a5fa',
  storage: '#34d399',
  evidence: '#facc15'
}

const pathColors: Record<PathKind, string> = {
  http: '#22d3ee',
  discovery: '#34d399',
  'api-token': '#a78bfa',
  'signed-artifact': '#facc15',
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
  data: '#34d399'
}

const detailZone = {
  center: [2.2, 0.06, 7.45] as Vec3,
  size: [15.8, 3.7] as [number, number]
}

const zones: TopologyZone[] = [
  { id: 'analyst-net', label: 'Analyst Workbench', kind: 'internet', center: [-10.2, 0.01, -0.1], size: [3.8, 7.2], level: 'network' },
  { id: 'northbridge', label: 'NorthBridge Evidence Network', kind: 'orion', center: [0.25, 0.01, 0.15], size: [14.5, 9.5], level: 'network' },
  { id: 'sender-infra', label: 'External Sender Infrastructure', kind: 'external-leak', center: [10.9, 0.01, -2.05], size: [5.8, 3.35], level: 'network' },
  { id: 'finance-network', label: 'Finance Workflow', kind: 'customer', center: [10.9, 0.01, 2.55], size: [5.8, 4.25], level: 'network' },
  { id: 'case-zone', label: 'Case and Reporting', kind: 'release', center: [-3.8, 0.025, -2.2], size: [4.6, 3.75], parentId: 'northbridge', level: 'segment' },
  { id: 'email-zone', label: 'Email Evidence', kind: 'dmz', center: [1.4, 0.025, -2.25], size: [5.4, 3.85], parentId: 'northbridge', level: 'segment' },
  { id: 'identity-zone', label: 'Identity and Mailbox', kind: 'internal', center: [4.75, 0.025, 1.8], size: [4.3, 3.45], parentId: 'northbridge', level: 'segment' },
  { id: 'telemetry-zone', label: 'Endpoint and Network Telemetry', kind: 'devops', center: [-1.4, 0.025, 2.6], size: [5.5, 3.7], parentId: 'northbridge', level: 'segment' }
]

const nodes: TopologyNode[] = [
  { id: 'analyst', label: 'Incident Analyst', zoneId: 'analyst-net', kind: 'operator', role: 'learner workstation', position: [-10.2, 0.46, 0.8] },
  { id: 'bec-actor', label: 'BEC Actor', zoneId: 'sender-infra', kind: 'operator', role: 'external fraud operator', position: [8.25, 0.46, -1.25] },
  { id: 'case-portal', label: 'Case Portal', zoneId: 'case-zone', kind: 'server', role: 'case intake and scope', position: [-4.9, 0.55, -2.85] },
  { id: 'timeline-builder', label: 'Timeline Builder', zoneId: 'case-zone', kind: 'server', role: 'timeline reconstruction', position: [-3.6, 0.55, -1.45] },
  { id: 'report-portal', label: 'Report Portal', zoneId: 'case-zone', kind: 'server', role: 'final findings submission', position: [-2.55, 0.55, -2.85] },
  { id: 'mail-viewer', label: 'Mail Viewer', zoneId: 'email-zone', kind: 'server', role: 'reported message review', position: [-0.45, 0.55, -3.0] },
  { id: 'message-trace', label: 'Message Trace', zoneId: 'email-zone', kind: 'server', role: 'mail transport evidence', position: [0.95, 0.55, -1.35] },
  { id: 'header-analyzer', label: 'Header Analyzer', zoneId: 'email-zone', kind: 'server', role: 'SPF DKIM DMARC and reply-to review', position: [2.45, 0.55, -3.05] },
  { id: 'invoice-review', label: 'Invoice Review', zoneId: 'email-zone', kind: 'storage', role: 'invoice and metadata comparison', position: [3.35, 0.55, -1.5] },
  { id: 'm365-dashboard', label: 'M365 Dashboard', zoneId: 'identity-zone', kind: 'server', role: 'cloud audit overview', position: [3.55, 0.55, 1.0] },
  { id: 'signin-log', label: 'Sign-in Logs', zoneId: 'identity-zone', kind: 'server', role: 'identity access evidence', position: [4.9, 0.55, 2.7] },
  { id: 'compromised-mailbox', label: 'Compromised Mailbox Session', zoneId: 'identity-zone', kind: 'server', role: 'attacker webmail session', position: [5.45, 0.55, 0.15] },
  { id: 'mailbox-rules', label: 'Mailbox Rules', zoneId: 'identity-zone', kind: 'server', role: 'rules forwarding and folder movement', position: [6.15, 0.55, 1.2] },
  { id: 'edr-console', label: 'EDR Console', zoneId: 'telemetry-zone', kind: 'evidence', role: 'endpoint scan and process context', position: [-3.45, 0.55, 1.8] },
  { id: 'browser-history', label: 'Browser History', zoneId: 'telemetry-zone', kind: 'server', role: 'user web activity', position: [-1.95, 0.55, 3.55] },
  { id: 'proxy-log', label: 'Proxy Logs', zoneId: 'telemetry-zone', kind: 'proxy', role: 'web proxy activity', position: [-0.25, 0.48, 1.45] },
  { id: 'dns-log', label: 'DNS Logs', zoneId: 'telemetry-zone', kind: 'server', role: 'DNS query activity', position: [0.7, 0.55, 3.45] },
  { id: 'domain-records', label: 'Domain Records', zoneId: 'sender-infra', kind: 'server', role: 'WHOIS DNS hosting evidence', position: [9.15, 0.55, -2.75] },
  { id: 'ct-logs', label: 'CT Logs', zoneId: 'sender-infra', kind: 'evidence', role: 'certificate transparency evidence', position: [10.85, 0.55, -1.25] },
  { id: 'lookalike-login', label: 'Lookalike Login Site', zoneId: 'sender-infra', kind: 'server', role: 'suspicious login infrastructure', position: [12.7, 0.55, -2.75] },
  { id: 'finance-portal', label: 'Finance Portal', zoneId: 'finance-network', kind: 'server', role: 'payment investigation', position: [8.95, 0.55, 2.15] },
  { id: 'vendor-master', label: 'Vendor Master Log', zoneId: 'finance-network', kind: 'storage', role: 'beneficiary change evidence', position: [10.75, 0.55, 3.55] },
  { id: 'approval-chain', label: 'Approval Chain', zoneId: 'finance-network', kind: 'server', role: 'payment authorization path', position: [12.45, 0.55, 2.1] },
  { id: 'flag-service', label: 'Flag Service', zoneId: 'finance-network', kind: 'evidence', role: 'checkpoint acceptance', position: [12.7, 0.55, 4.0] }
]

const paths: TrustPath[] = [
  { id: 'actor-domain', source: 'bec-actor', target: 'domain-records', kind: 'attacker-session', label: 'domain setup' },
  { id: 'actor-login-host', source: 'bec-actor', target: 'lookalike-login', kind: 'attacker-session', label: 'phishing site' },
  { id: 'actor-email', source: 'bec-actor', target: 'mail-viewer', kind: 'attacker-session', label: 'BEC message' },
  { id: 'actor-invoice', source: 'bec-actor', target: 'invoice-review', kind: 'attacker-session', label: 'fake invoice' },
  { id: 'login-signin', source: 'lookalike-login', target: 'signin-log', kind: 'attacker-session', label: 'stolen creds' },
  { id: 'login-mailbox-session', source: 'lookalike-login', target: 'compromised-mailbox', kind: 'attacker-session', label: 'webmail login' },
  { id: 'signin-mailbox-rule', source: 'compromised-mailbox', target: 'mailbox-rules', kind: 'attacker-session', label: 'rule creation' },
  { id: 'mailbox-vendor', source: 'compromised-mailbox', target: 'vendor-master', kind: 'attacker-session', label: 'payment redirect' },
  { id: 'mailbox-approval', source: 'compromised-mailbox', target: 'approval-chain', kind: 'attacker-session', label: 'thread steering' },
  { id: 'analyst-case', source: 'analyst', target: 'case-portal', kind: 'evidence', label: 'case intake' },
  { id: 'case-mail', source: 'case-portal', target: 'mail-viewer', kind: 'evidence', label: 'reported messages' },
  { id: 'case-finance', source: 'case-portal', target: 'finance-portal', kind: 'evidence', label: 'payment exception' },
  { id: 'mail-trace', source: 'mail-viewer', target: 'message-trace', kind: 'http', label: 'message id trace' },
  { id: 'mail-header', source: 'mail-viewer', target: 'header-analyzer', kind: 'http', label: 'header review' },
  { id: 'header-domain', source: 'header-analyzer', target: 'domain-records', kind: 'discovery', label: 'sender domain clues' },
  { id: 'domain-ct', source: 'domain-records', target: 'ct-logs', kind: 'discovery', label: 'certificate timing' },
  { id: 'domain-login', source: 'domain-records', target: 'lookalike-login', kind: 'discovery', label: 'lookalike login host' },
  { id: 'mail-invoice', source: 'mail-viewer', target: 'invoice-review', kind: 'evidence', label: 'invoice attachment' },
  { id: 'mail-identity', source: 'mail-viewer', target: 'm365-dashboard', kind: 'evidence', label: 'mailbox timing' },
  { id: 'm365-signin', source: 'm365-dashboard', target: 'signin-log', kind: 'api-token', label: 'sign-in audit' },
  { id: 'signin-rules', source: 'signin-log', target: 'mailbox-rules', kind: 'api-token', label: 'rule activity' },
  { id: 'identity-browser', source: 'signin-log', target: 'browser-history', kind: 'evidence', label: 'user activity pivot' },
  { id: 'browser-domain', source: 'browser-history', target: 'lookalike-login', kind: 'http', label: 'suspicious visit' },
  { id: 'browser-edr', source: 'browser-history', target: 'edr-console', kind: 'evidence', label: 'endpoint context' },
  { id: 'domain-dns', source: 'lookalike-login', target: 'dns-log', kind: 'discovery', label: 'DNS query evidence' },
  { id: 'domain-proxy', source: 'lookalike-login', target: 'proxy-log', kind: 'http', label: 'proxy session evidence' },
  { id: 'network-finance', source: 'proxy-log', target: 'vendor-master', kind: 'evidence', label: 'timeline support' },
  { id: 'invoice-finance', source: 'invoice-review', target: 'finance-portal', kind: 'evidence', label: 'payment instruction review' },
  { id: 'finance-vendor', source: 'finance-portal', target: 'vendor-master', kind: 'evidence', label: 'vendor master change' },
  { id: 'vendor-approval', source: 'vendor-master', target: 'approval-chain', kind: 'evidence', label: 'approval workflow' },
  { id: 'approval-timeline', source: 'approval-chain', target: 'timeline-builder', kind: 'evidence', label: 'impact timeline' },
  { id: 'timeline-report', source: 'timeline-builder', target: 'report-portal', kind: 'evidence', label: 'findings package' },
  { id: 'report-flag', source: 'report-portal', target: 'flag-service', kind: 'evidence', label: 'report accepted' }
]

function stage(
  title: string,
  tactic: string,
  summary: string,
  baseNodeId: string,
  activeNodes: string[],
  activePaths: string[],
  evidenceNote: string,
  components: StageComponentInput[],
  detailFlows: Practical3DStage['detailFlows']
): Practical3DStage {
  return {
    title,
    tactic,
    summary,
    baseNodeId,
    activeNodes,
    activePaths,
    evidenceNote,
    components: components.map((component, index) => ({
      id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
      ...component
    })),
    detailFlows
  }
}

type StageComponentInput = {
  parentNodeId: string
  label: string
  kind: ComponentKind
}

const stages: Practical3DStage[] = [
  stage(
    'Stage 0. Intake and Scope',
    'Detection & Response',
    'Define NorthBridge, Meridian, the affected user, the payment amount, and the investigation window before opening evidence.',
    'bec-actor',
    ['bec-actor', 'case-portal', 'finance-portal'],
    ['analyst-case', 'case-finance'],
    'intake summary, affected user, vendor, amount, incident window',
    [
      { parentNodeId: 'case-portal', label: 'intake_summary.md', kind: 'artifact' },
      { parentNodeId: 'finance-portal', label: '482,750 USD exception', kind: 'data' }
    ],
    [{
      id: 'flow-s0-scope',
      sourceNodeId: 'analyst',
      targetNodeId: 'case-portal',
      sourceFunction: 'case intake review',
      targetFunction: 'scope definition',
      technique: 'Incident Scoping',
      summary: 'The learner starts from business context before technical evidence.',
      evidence: 'NorthBridge, Meridian, ap.lead@northbridge.example, 482,750 USD'
    }]
  ),
  stage(
    'Stage 1. Suspicious Email Triage',
    'Initial Access',
    'Identify the vendor-looking payment message and executive follow-up that pushed the finance workflow.',
    'bec-actor',
    ['bec-actor', 'case-portal', 'mail-viewer', 'message-trace'],
    ['actor-email', 'case-mail', 'mail-trace'],
    'reported messages, message IDs, initial vendor notice, executive follow-up',
    [
      { parentNodeId: 'mail-viewer', label: 'reported messages', kind: 'data' },
      { parentNodeId: 'message-trace', label: 'message ids', kind: 'log' }
    ],
    [{
      id: 'flow-s1-email-triage',
      sourceNodeId: 'bec-actor',
      targetNodeId: 'mail-viewer',
      sourceFunction: 'attacker webmail composer',
      targetFunction: 'recipient mailbox evidence',
      techniqueId: 'T1566.002',
      technique: 'Spearphishing Link',
      summary: 'BEC starts as a message that appears business-normal.',
      evidence: 'billing-meridian@example.invalid and ceo.office@northbridge.example messages'
    }]
  ),
  stage(
    'Stage 2. Header and Sender Infrastructure Analysis',
    'Reconnaissance',
    'Analyze SPF, DKIM, DMARC, reply-to mismatch, relay path, and sender infrastructure.',
    'bec-actor',
    ['bec-actor', 'mail-viewer', 'message-trace', 'header-analyzer', 'domain-records', 'ct-logs', 'lookalike-login'],
    ['actor-email', 'actor-domain', 'actor-login-host', 'mail-header', 'mail-trace', 'header-domain', 'domain-ct'],
    'headers, authentication results, reply-to mismatch, domain registration timing',
    [
      { parentNodeId: 'header-analyzer', label: 'Authentication-Results', kind: 'log' },
      { parentNodeId: 'domain-records', label: 'WHOIS / DNS history', kind: 'data' },
      { parentNodeId: 'ct-logs', label: 'certificate timing', kind: 'evidence' }
    ],
    [{
      id: 'flow-s2-header-domain',
      sourceNodeId: 'bec-actor',
      targetNodeId: 'domain-records',
      sourceFunction: 'registrar and DNS setup',
      targetFunction: 'defender sender infrastructure lookup',
      techniqueId: 'T1583.001',
      technique: 'Acquire Infrastructure: Domains',
      summary: 'The visible sender story is checked against authentication and infrastructure evidence.',
      evidence: 'northbridge-secure-login.example and sender auth classification'
    }]
  ),
  stage(
    'Stage 3. Attachment and Invoice Analysis',
    'Collection',
    'Compare suspicious invoice details, metadata, and beneficiary changes against the legitimate vendor baseline.',
    'bec-actor',
    ['bec-actor', 'mail-viewer', 'invoice-review', 'finance-portal', 'vendor-master'],
    ['actor-email', 'actor-invoice', 'mail-invoice', 'invoice-finance', 'finance-vendor'],
    'invoice metadata, legitimate baseline, beneficiary change, vendor master evidence',
    [
      { parentNodeId: 'invoice-review', label: 'fake_invoice_2026-04.pdf', kind: 'artifact' },
      { parentNodeId: 'vendor-master', label: 'beneficiary change log', kind: 'log' }
    ],
    [{
      id: 'flow-s3-invoice-finance',
      sourceNodeId: 'bec-actor',
      targetNodeId: 'finance-portal',
      sourceFunction: 'fake invoice preparation',
      targetFunction: 'payment instruction validation',
      technique: 'Invoice Redirection Review',
      summary: 'The learner sees that BEC evidence crosses from email attachments into finance records.',
      evidence: 'changed beneficiary and baseline invoice mismatch'
    }]
  ),
  stage(
    'Stage 4. Microsoft 365 Log Correlation',
    'Credential Access',
    'Correlate sign-ins, MFA context, user agents, source IPs, and mailbox audit actions.',
    'lookalike-login',
    ['bec-actor', 'mail-viewer', 'm365-dashboard', 'signin-log', 'lookalike-login', 'compromised-mailbox'],
    ['actor-login-host', 'login-signin', 'login-mailbox-session', 'mail-identity', 'm365-signin'],
    'M365 sign-in logs, MFA events, user agent, source IP, audit actions',
    [
      { parentNodeId: 'm365-dashboard', label: 'unified audit log', kind: 'log' },
      { parentNodeId: 'signin-log', label: 'MFA and source IP', kind: 'evidence' },
      { parentNodeId: 'compromised-mailbox', label: 'OWA session view', kind: 'credential' }
    ],
    [{
      id: 'flow-s4-m365',
      sourceNodeId: 'lookalike-login',
      targetNodeId: 'compromised-mailbox',
      sourceFunction: 'credential capture page',
      targetFunction: 'attacker webmail session',
      techniqueId: 'T1078',
      technique: 'Valid Accounts',
      summary: 'The investigation tests whether mailbox access evidence supports credential abuse.',
      evidence: 'sign-in time, source IP, user agent, MFA result'
    }]
  ),
  stage(
    'Stage 5. Mailbox Rule and Email Manipulation Review',
    'Collection',
    'Review inbox rules, forwarding, folder movement, and deleted payment-related messages.',
    'compromised-mailbox',
    ['bec-actor', 'signin-log', 'compromised-mailbox', 'mailbox-rules', 'mail-viewer'],
    ['actor-login-host', 'login-mailbox-session', 'signin-mailbox-rule', 'signin-rules'],
    'inbox rule export, forwarding state, deleted items, folder activity',
    [
      { parentNodeId: 'compromised-mailbox', label: 'attacker mailbox view', kind: 'credential' },
      { parentNodeId: 'mailbox-rules', label: 'inbox_rules_export.csv', kind: 'artifact' },
      { parentNodeId: 'mailbox-rules', label: 'folder activity', kind: 'log' }
    ],
    [{
      id: 'flow-s5-mailbox-rules',
      sourceNodeId: 'compromised-mailbox',
      targetNodeId: 'mailbox-rules',
      sourceFunction: 'attacker mailbox view',
      targetFunction: 'rule creation and folder movement',
      techniqueId: 'T1098.002',
      technique: 'Additional Email Delegate Permissions',
      summary: 'Mailbox manipulation can hide replies and warnings in a BEC case.',
      evidence: 'rule creation time and payment-related folder movement'
    }]
  ),
  stage(
    'Stage 6. Device and Browser History Review',
    'Discovery',
    'Validate whether the affected user visited the lookalike login site and whether malware evidence exists.',
    'lookalike-login',
    ['bec-actor', 'signin-log', 'browser-history', 'edr-console', 'lookalike-login', 'compromised-mailbox'],
    ['actor-login-host', 'login-signin', 'login-mailbox-session', 'identity-browser', 'browser-domain', 'browser-edr'],
    'browser history, downloads, EDR scan result, suspicious login site visit',
    [
      { parentNodeId: 'browser-history', label: 'browser_history_user_ap01.csv', kind: 'log' },
      { parentNodeId: 'edr-console', label: 'defender scan result', kind: 'evidence' }
    ],
    [{
      id: 'flow-s6-browser-domain',
      sourceNodeId: 'browser-history',
      targetNodeId: 'lookalike-login',
      sourceFunction: 'user browser timeline',
      targetFunction: 'lookalike login site',
      techniqueId: 'T1204.002',
      technique: 'User Execution: Malicious File or Link',
      summary: 'A BEC investigation may prove credential-entry activity without malware execution.',
      evidence: 'northbridge-secure-login.example visit and clean endpoint scan context'
    }]
  ),
  stage(
    'Stage 7. Domain, DNS, and Hosting Analysis',
    'Reconnaissance',
    'Analyze lookalike domain registration, DNS history, certificate transparency, and hosting clues.',
    'bec-actor',
    ['bec-actor', 'domain-records', 'ct-logs', 'lookalike-login', 'dns-log'],
    ['actor-domain', 'actor-login-host', 'domain-ct', 'domain-login', 'domain-dns'],
    'WHOIS, DNS history, certificate transparency, hosting notes',
    [
      { parentNodeId: 'domain-records', label: 'WHOIS / DNS history', kind: 'data' },
      { parentNodeId: 'ct-logs', label: 'certificate transparency', kind: 'evidence' }
    ],
    [{
      id: 'flow-s7-domain',
      sourceNodeId: 'bec-actor',
      targetNodeId: 'ct-logs',
      sourceFunction: 'domain and certificate setup',
      targetFunction: 'certificate timing validation',
      techniqueId: 'T1583.001',
      technique: 'Acquire Infrastructure: Domains',
      summary: 'Infrastructure timing helps connect suspicious email to the campaign window.',
      evidence: 'registration and certificate timestamps near 2026-04-07 to 2026-04-18'
    }]
  ),
  stage(
    'Stage 8. Firewall and Proxy Log Correlation',
    'Detection & Response',
    'Correlate DNS, proxy, firewall, browser, and M365 evidence into a single timeline.',
    'lookalike-login',
    ['bec-actor', 'browser-history', 'dns-log', 'proxy-log', 'lookalike-login'],
    ['actor-login-host', 'domain-dns', 'domain-proxy'],
    'DNS queries, proxy sessions, firewall egress, browser visits, timestamp alignment',
    [
      { parentNodeId: 'dns-log', label: 'dns_query_logs.csv', kind: 'log' },
      { parentNodeId: 'proxy-log', label: 'proxy_logs.csv', kind: 'log' }
    ],
    [{
      id: 'flow-s8-network',
      sourceNodeId: 'lookalike-login',
      targetNodeId: 'proxy-log',
      sourceFunction: 'suspicious domain endpoint',
      targetFunction: 'proxy and DNS evidence',
      technique: 'Network Evidence Correlation',
      summary: 'Network telemetry validates whether the user device interacted with the suspicious infrastructure.',
      evidence: 'DNS and proxy events aligned to browser and M365 timestamps'
    }]
  ),
  stage(
    'Stage 9. Payment Workflow and Impact Assessment',
    'Impact',
    'Determine payment status, recovery status, vendor master changes, approval path, and failed callback verification.',
    'compromised-mailbox',
    ['bec-actor', 'compromised-mailbox', 'finance-portal', 'vendor-master', 'approval-chain', 'timeline-builder', 'mailbox-rules'],
    ['login-mailbox-session', 'signin-mailbox-rule', 'mailbox-vendor', 'mailbox-approval', 'network-finance', 'finance-vendor', 'vendor-approval', 'approval-timeline'],
    'wire transfer record, vendor master change log, approval chain, recall status',
    [
      { parentNodeId: 'compromised-mailbox', label: 'payment thread view', kind: 'credential' },
      { parentNodeId: 'finance-portal', label: 'wire_transfer_record.pdf', kind: 'artifact' },
      { parentNodeId: 'approval-chain', label: 'callback verification gap', kind: 'evidence' }
    ],
    [{
      id: 'flow-s9-finance-impact',
      sourceNodeId: 'compromised-mailbox',
      targetNodeId: 'approval-chain',
      sourceFunction: 'payment thread steering',
      targetFunction: 'approval and callback control review',
      technique: 'Payment Redirection Impact',
      summary: 'The final BEC impact is a business-process failure, not just a suspicious inbox event.',
      evidence: '482,750 USD payment workflow and failed callback verification'
    }]
  ),
  stage(
    'Stage 10. Final Findings and Recommendations',
    'Detection & Response',
    'Submit executive findings with timeline, root cause, business impact, containment, and recommendations.',
    'compromised-mailbox',
    ['bec-actor', 'compromised-mailbox', 'timeline-builder', 'report-portal', 'flag-service', 'approval-chain', 'mailbox-rules', 'vendor-master'],
    ['actor-email', 'actor-login-host', 'login-signin', 'login-mailbox-session', 'signin-mailbox-rule', 'mailbox-vendor', 'mailbox-approval', 'approval-timeline', 'timeline-report', 'report-flag'],
    'final report, evidence index, recommendation matrix, accepted checkpoint',
    [
      { parentNodeId: 'timeline-builder', label: 'timeline draft', kind: 'artifact' },
      { parentNodeId: 'report-portal', label: 'executive findings', kind: 'artifact' },
      { parentNodeId: 'flag-service', label: 'flag_10_final_report', kind: 'evidence' }
    ],
    [{
      id: 'flow-s10-report',
      sourceNodeId: 'timeline-builder',
      targetNodeId: 'report-portal',
      sourceFunction: 'evidence-backed timeline',
      targetFunction: 'executive report submission',
      technique: 'Executive Incident Reporting',
      summary: 'The learner converts technical evidence into business decisions and prevention work.',
      evidence: 'facts, likely conclusions, open questions, containment, recommendations'
    }]
  )
]

const stageNarratives: StageNarrative[] = stages.map(({ title, tactic, summary, evidenceNote }) => ({
  title,
  tactic,
  summary,
  evidenceNote
}))

export const ledgerMiragePractical3DScenario: Practical3DScenario = {
  metadata: {
    id: 'ledger-mirage',
    title: 'Ledger Mirage BEC Investigation Range',
    subtitle: 'Business Email Compromise Practical 3D',
    difficulty: 'intermediate',
    estimatedMinutes: 70
  },
  theme: {
    title: 'Ledger Mirage BEC Investigation Range',
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
  stages,
  stageNarratives
}

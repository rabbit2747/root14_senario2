'use client'

import { useMemo, useState } from 'react'
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  type EdgeProps,
  type NodeProps,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Eye,
  Flame,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  Monitor,
  Network,
  Play,
  Radar,
  Route,
  Search,
  Server,
  Shield,
  Square,
  TimerReset
} from 'lucide-react'
import type { Scenario } from '@/lib/scenario/schema'
import { currentStep, scenarioToFlow, type InfraEdgeData, type InfraNodeData, type ZoneNodeData } from '@/lib/scenario/flow'

type Props = {
  scenario: Scenario
  validationErrors: string[]
}

const nodeTypes = {
  infra: InfraNode,
  zoneGroup: ZoneGroupNode
}

const edgeTypes = {
  traffic: AnimatedTrafficEdge,
  boundary: AnimatedTrafficEdge,
  detection: AnimatedTrafficEdge
}

const iconMap = {
  attackerPc: Flame,
  desktop: Monitor,
  webServer: Server,
  appServer: Server,
  database: Database,
  firewall: Shield,
  router: Route,
  mailServer: Server,
  fileServer: Server,
  adServer: KeyRound,
  siem: Radar,
  edr: Shield,
  cloudService: Cloud,
  dnsServer: Globe2,
  vpn: Lock,
  waf: Shield,
  proxy: Network,
  identityProvider: KeyRound
}

const markerIconMap = {
  vulnerability: Bug,
  credential: KeyRound,
  malware: Flame,
  dataAccess: Database,
  alert: AlertTriangle,
  blocked: Lock,
  investigation: Search
}

function InfraNode({ data }: NodeProps) {
  const nodeData = data as InfraNodeData
  const Icon = iconMap[nodeData.kind as keyof typeof iconMap] ?? Square
  const stateClass = nodeData.active ? 'active' : nodeData.previous ? 'previous' : 'inactive'

  return (
    <div className={`infra-node ${stateClass}`}>
      <div className="infra-node__top">
        <span className="infra-node__icon"><Icon size={18} /></span>
        <span className="infra-node__kind">{nodeData.kind}</span>
      </div>
      <div className="infra-node__label">{nodeData.label}</div>
      <div className={`importance importance--${nodeData.importance}`}>{nodeData.importance}</div>
      {nodeData.markers.length > 0 && (
        <div className="marker-row">
          {nodeData.markers.map(marker => {
            const MarkerIcon = markerIconMap[marker.type]
            return (
              <span className="marker-pill" title={marker.description} key={marker.id}>
                <MarkerIcon size={13} />
                {marker.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ZoneGroupNode({ data }: NodeProps) {
  const zoneData = data as ZoneNodeData
  return (
    <div className={`zone-group zone-group--${zoneData.kind} ${zoneData.active ? 'zone-group--active' : ''}`}>
      <div className="zone-group__label">{zoneData.label}</div>
    </div>
  )
}

function AnimatedTrafficEdge(props: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath(props)
  const data = props.data as InfraEdgeData | undefined
  const active = Boolean(data?.active)
  const previous = Boolean(data?.previous)
  const detection = data?.kind === 'securityAlert' || props.type === 'detection'
  const className = [
    'flow-edge',
    active ? 'flow-edge--active' : '',
    previous ? 'flow-edge--previous' : '',
    detection ? 'flow-edge--detection' : '',
    data?.crossesBoundary ? 'flow-edge--boundary' : ''
  ].join(' ')

  return (
    <>
      <BaseEdge id={props.id} path={path} className={className} />
      {active && (
        <circle r="5" className="packet-dot">
          <animateMotion dur="1.2s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {props.label && (
        <EdgeLabelRenderer>
          <div
            className={`edge-label ${active ? 'edge-label--active' : ''}`}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {props.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export function ScenarioPlayer({ scenario, validationErrors }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = currentStep(scenario, stepIndex)
  const flow = useMemo(() => scenarioToFlow(scenario, stepIndex), [scenario, stepIndex])
  const totalSteps = scenario.steps.length
  const progress = ((stepIndex + 1) / totalSteps) * 100

  return (
    <ReactFlowProvider>
      <main className="workspace">
        <section className="topbar">
          <div>
            <div className="eyebrow">APT Scenario Platform MVP</div>
            <h1>{scenario.title}</h1>
          </div>
          <div className="status-strip">
            <span className="status-item"><CheckCircle2 size={16} /> Schema {validationErrors.length === 0 ? 'valid' : 'invalid'}</span>
            <span className="status-item"><TimerReset size={16} /> {scenario.estimatedMinutes} min</span>
            <span className="status-item"><Eye size={16} /> {scenario.difficulty}</span>
          </div>
        </section>

        <section className="player-grid">
          <div className="canvas-shell">
            <ReactFlow
              nodes={flow.nodes}
              edges={flow.edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              minZoom={0.45}
              maxZoom={1.4}
              fitView
              fitViewOptions={{ padding: 0.08 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#d5dee8" gap={24} />
              <Controls position="bottom-left" />
            </ReactFlow>
          </div>

          <aside className="step-panel">
            <div className="step-panel__head">
              <span>Step {stepIndex + 1} / {totalSteps}</span>
              <strong>{step.tactic}</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <h2>{step.title}</h2>
            <p className="summary">{step.summary}</p>

            <div className="view-block">
              <h3>공격 관점</h3>
              <p>{step.explanation.attackView}</p>
            </div>
            <div className="view-block">
              <h3>방어 관점</h3>
              <p>{step.explanation.defenseView}</p>
            </div>
            <div className="takeaway">{step.explanation.learnerTakeaway}</div>

            {step.quiz && (
              <div className="quiz-box">
                <h3>{step.quiz.question}</h3>
                {step.quiz.options.map((option, index) => (
                  <div className={`quiz-option ${index === step.quiz?.answerIndex ? 'quiz-option--answer' : ''}`} key={option}>
                    {option}
                  </div>
                ))}
              </div>
            )}

            <div className="controls-row">
              <button type="button" onClick={() => setStepIndex(index => Math.max(0, index - 1))} disabled={stepIndex === 0} title="이전 단계">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => setStepIndex(index => Math.min(totalSteps - 1, index + 1))} disabled={stepIndex === totalSteps - 1} title="다음 단계">
                <Play size={16} />
                다음
                <ChevronRight size={18} />
              </button>
            </div>
          </aside>
        </section>
      </main>
    </ReactFlowProvider>
  )
}

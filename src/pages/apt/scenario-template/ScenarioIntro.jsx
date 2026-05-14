import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageToggle, languageToggleStyles, useScenarioLanguage } from './scenarioLanguage.jsx';

const C = {
  bg: '#0a0a0f',
  panel: '#13131a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#fbbf24',
  text: '#e2e8f0',
  muted: '#94a3b8',
  faint: '#475569',
};

const introCopy = {
  en: {
    backLabel: 'Curriculum TOC',
    kicker: 'MISSION BRIEFING',
    headline: 'Trace a supply-chain attack that reaches the customer through a trusted vendor update path.',
    story: [
      'After an EchoAgent update, ANRC observes unusual behavior in the customer environment. The starting point is not the customer network itself. The trail points back to Orion Echo Systems and its build, signing, and update chain.',
      'Your role is to reconstruct the incident by following evidence across public services, support systems, internal knowledge stores, CI/CD, release trust, the ANRC customer environment, supervised file-drop validation, and the final Dark Web drop record.',
      'This briefing sets the mission context before you move into Legacy 3D, Concept Class, Practical 3D, and the hands-on Docker lab.',
    ],
    personaTitle: 'Learner Role',
    personaRole: 'Red Team Operator reconstructing an authorized enterprise supply-chain incident',
    personaSetup:
      'You are not memorizing attack steps. You are learning how trust boundaries, service accounts, build artifacts, signing records, customer exports, and leak evidence connect into one explainable incident.',
    stagesTitle: 'MISSION STAGE PREVIEW',
    ctaLabel: 'Open Legacy 3D',
    ctaHint: 'First, use the existing ROOT14 3D session to feel the overall attack flow and operational tone.',
  },
  ko: {
    backLabel: '커리큘럼 목차',
    kicker: 'MISSION BRIEFING',
    headline: '신뢰된 vendor update 경로를 통해 고객 환경까지 도달하는 공급망 공격을 추적합니다.',
    story: [
      'EchoAgent 업데이트 이후 ANRC 고객 환경에서 비정상 행위가 관찰됩니다. 시작점은 고객망 자체가 아니라 Orion Echo Systems의 build, signing, update chain입니다.',
      '학습자는 public service, support system, 내부 지식 저장소, CI/CD, release trust, ANRC 고객 환경, supervisor file-drop validation, Dark Web drop record까지 증거를 따라가며 사건을 재구성합니다.',
      '이 briefing은 Legacy 3D, Concept Class, Practical 3D, hands-on Docker lab으로 넘어가기 전 mission context를 잡는 단계입니다.',
    ],
    personaTitle: '학습자 역할',
    personaRole: '허가된 enterprise supply-chain incident를 재구성하는 Red Team Operator',
    personaSetup:
      '공격 단계를 외우는 것이 아니라 trust boundary, service account, build artifact, signing record, customer export, leak evidence가 하나의 사건으로 연결되는 방식을 학습합니다.',
    stagesTitle: 'MISSION STAGE PREVIEW',
    ctaLabel: 'Legacy 3D 열기',
    ctaHint: '먼저 기존 ROOT14 3D 세션으로 전체 공격 흐름과 분위기를 확인합니다.',
  },
};

const stageCopy = [
  ['Public Reconnaissance', 'Collect public Orion Echo clues: product metadata, release notes, and ANRC channel references.'],
  ['Support Initial Access', 'Establish the first DMZ foothold marker from support portal evidence.'],
  ['Foothold Validation', 'Confirm host, user, and constrained execution context before moving inward.'],
  ['Internal Discovery', 'Identify wiki, ticket, repo, build server, update server, and customer API boundaries.'],
  ['Knowledge Collection', 'Connect internal documents and tickets to release branch, token, and ANRC update channel.'],
  ['Build Credential Discovery', 'Review build-token context, service account scope, and authorization evidence.'],
  ['Build API Abuse', 'Trigger a build job that appears operationally normal from the DevOps perspective.'],
  ['Artifact Review', 'Inspect build artifact metadata, marker, hash, and release readiness evidence.'],
  ['Sign and Publish', 'Connect signing request, release manifest, and trusted update channel.'],
  ['Trusted Customer Update', 'Show how the ANRC customer environment accepts the trusted vendor update.'],
  ['Customer Export Access', 'Trace customer export metadata and object-store access proof.'],
  ['Dark Web Exfiltration', 'Confirm the supervised file drop and final Dark Web drop record.'],
];

function stageName(stage, fallbackStep) {
  if (Array.isArray(stage)) return stage[0];
  return stage?.name || stage?.title || fallbackStep.title.replace(/^Stage\s+\d+\.\s*/, '');
}

function stageObjective(stage, fallbackStep) {
  if (Array.isArray(stage)) return stage[1];
  return stage?.objective || stage?.summary || fallbackStep.summary;
}

export default function ScenarioIntro({ course }) {
  const navigate = useNavigate();
  const { curriculum, practicalScenario } = course;
  const { language, setLanguage } = useScenarioLanguage();
  const baseBriefing = introCopy[language] || introCopy.en;
  const customBriefing = curriculum.introCopy?.[language] || curriculum.introCopy?.en || {};
  const briefing = {
    ...baseBriefing,
    ...customBriefing,
    story: customBriefing.story || baseBriefing.story,
  };
  const stages = useMemo(() => {
    const customStages = curriculum.introStageCopy?.[language] || curriculum.introStageCopy?.en || stageCopy;
    const sortedSteps = [...practicalScenario.steps]
      .sort((a, b) => a.order - b.order)
      .map((step, index) => ({
        id: index,
        name: stageName(customStages[index], step),
        objective: stageObjective(customStages[index], step),
      }));
    return sortedSteps;
  }, [curriculum.introStageCopy, language, practicalScenario.steps]);

  return (
    <div className="scenario-intro" lang={language}>
      <header className="intro-hero">
        <div className="intro-inner">
          <div className="top-row">
            <button className="ghost" type="button" onClick={() => navigate(curriculum.routes.toc)}>
              {briefing.backLabel}
            </button>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>

          <div className="badge">{briefing.kicker}</div>
          <h1>{curriculum.scenario.title}</h1>
          <p className="headline">{briefing.headline}</p>
        </div>
      </header>

      <main className="intro-inner intro-main">
        <section className="story-block">
          {briefing.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="persona-card">
          <div className="section-kicker">{briefing.personaTitle}</div>
          <strong>{briefing.personaRole}</strong>
          <p>{briefing.personaSetup}</p>
        </section>

        <section className="stage-section">
          <div className="stage-head">
            <span />
            <h2>{briefing.stagesTitle}</h2>
          </div>

          <div className="stage-list">
            {stages.map((stage) => (
              <article className="stage-row" key={stage.id}>
                <div>{String(stage.id).padStart(2, '0')}</div>
                <section>
                  <strong>{stage.name}</strong>
                  <p>{stage.objective}</p>
                </section>
              </article>
            ))}
          </div>
        </section>

        <div className="cta">
          <button type="button" aria-label={briefing.ctaLabel} onClick={() => navigate(curriculum.routes.legacy3d)}>
            {briefing.ctaLabel}
          </button>
          <p>{briefing.ctaHint}</p>
        </div>
      </main>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  ${languageToggleStyles}
  .scenario-intro {
    min-height: 100vh;
    background: ${C.bg};
    color: ${C.text};
    font-family: -apple-system, "Apple SD Gothic Neo", system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.75;
  }
  .scenario-intro * { box-sizing: border-box; }
  .intro-hero {
    position: relative;
    border-bottom: 1px solid ${C.border};
    background:
      radial-gradient(ellipse at top right, rgba(124,58,237,0.18) 0%, transparent 60%),
      radial-gradient(ellipse at bottom left, rgba(220,38,38,0.12) 0%, transparent 50%);
  }
  .intro-inner {
    max-width: 900px;
    margin: 0 auto;
    padding-left: 28px;
    padding-right: 28px;
  }
  .intro-hero .intro-inner {
    padding-top: 48px;
    padding-bottom: 72px;
  }
  .ghost {
    background: transparent;
    border: 0;
    color: ${C.muted};
    font-size: 14px;
    cursor: pointer;
    margin: 0;
    padding: 0;
  }
  .top-row {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    font-family: monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 4px;
    color: ${C.accent};
    padding: 5px 12px;
    border: 1px solid ${C.accent};
    margin-bottom: 24px;
  }
  h1 {
    font-size: clamp(34px, 5vw, 56px);
    font-weight: 200;
    letter-spacing: 0;
    margin: 0;
    line-height: 1.15;
  }
  .headline {
    font-size: 19px;
    color: ${C.muted};
    margin: 16px 0 0;
    font-style: italic;
    line-height: 1.5;
  }
  .intro-main {
    padding-top: 56px;
    padding-bottom: 96px;
  }
  .story-block p {
    font-size: 18px;
    line-height: 1.85;
    color: #cbd5e1;
    margin: 0 0 18px;
    padding-left: 22px;
    border-left: 2px solid ${C.faint};
  }
  .persona-card {
    margin-top: 56px;
    padding: 28px;
    background: ${C.panel};
    border: 1px solid ${C.border};
  }
  .section-kicker {
    font-size: 13px;
    letter-spacing: 4px;
    color: ${C.accent};
    font-family: monospace;
    margin-bottom: 14px;
    font-weight: 700;
  }
  .persona-card strong {
    display: block;
    font-size: 18px;
    color: ${C.text};
    font-weight: 400;
    line-height: 1.6;
  }
  .persona-card p {
    font-size: 16px;
    color: ${C.muted};
    margin: 14px 0 0;
    line-height: 1.7;
  }
  .stage-section {
    margin-top: 64px;
  }
  .stage-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }
  .stage-head span {
    width: 36px;
    height: 1px;
    background: ${C.accent};
  }
  .stage-head h2 {
    font-family: monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 4px;
    color: ${C.accent};
    margin: 0;
  }
  .stage-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .stage-row {
    background: ${C.panel};
    border: 1px solid ${C.border};
    padding: 20px;
    display: grid;
    grid-template-columns: 52px 1fr;
    align-items: center;
    gap: 20px;
  }
  .stage-row > div {
    font-family: monospace;
    font-size: 20px;
    font-weight: 700;
    color: ${C.accent};
    text-align: center;
  }
  .stage-row strong {
    display: block;
    font-size: 17px;
    font-weight: 700;
    color: ${C.text};
    margin-bottom: 6px;
  }
  .stage-row p {
    font-size: 15px;
    color: #cbd5e1;
    line-height: 1.6;
    margin: 0;
  }
  .cta {
    margin-top: 72px;
    text-align: center;
  }
  .cta button {
    background: ${C.accent};
    color: #0a0a0f;
    border: 1px solid ${C.accent};
    padding: 18px 48px;
    font-family: monospace;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 4px;
    cursor: pointer;
    box-shadow: 0 0 28px rgba(251, 191, 36, 0.16);
  }
  .cta p {
    margin: 16px 0 0;
    font-size: 14px;
    color: ${C.muted};
  }
`;

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink, Play } from 'lucide-react';
import { LanguageToggle, languageToggleStyles, useScenarioLanguage } from './scenarioLanguage.jsx';

const C = {
  bg: '#06080d',
  panel: 'rgba(15, 23, 42, 0.78)',
  border: 'rgba(148, 163, 184, 0.18)',
  accent: '#fbbf24',
  concept: '#58a6ff',
  text: '#e5eefc',
  muted: '#94a3b8',
};

const legacyCopy = {
  en: {
    backLabel: 'Mission Briefing',
    kicker: 'LEGACY 3D OVERVIEW',
    headline: 'First, experience the original ROOT14 3D flow. Then return for concept and lab work.',
    summary:
      'Legacy 3D is the cinematic orientation layer. It helps learners feel the incident sequence, visual tone, and operator flow before the curriculum breaks the same scenario into concepts, topology, and hands-on evidence.',
    primaryLabel: 'Open Legacy 3D',
    nextLabel: 'Continue to Concept Class',
    steps: [
      {
        id: 'legacy',
        number: '01',
        tone: 'legacy',
        title: 'Legacy 3D Session',
        body: 'Use the existing ROOT14 cinematic session to understand the broad story arc, stage transitions, and shell-assisted operational mood.',
      },
      {
        id: 'concept',
        number: '02',
        tone: 'concept',
        title: 'Concept Class',
        body: 'After the cinematic pass, the curriculum explains supply chain, trust boundary, token, CI/CD, signing, and impact using the Orion Echo infrastructure map.',
      },
    ],
  },
  ko: {
    backLabel: 'Mission Briefing',
    kicker: 'LEGACY 3D OVERVIEW',
    headline: '먼저 기존 ROOT14 3D 흐름을 체감한 뒤 개념 학습과 실습으로 돌아옵니다.',
    summary:
      'Legacy 3D는 cinematic orientation 단계입니다. 학습자가 사건 순서, 화면 분위기, operator flow를 먼저 체감한 뒤 같은 시나리오를 개념, topology, hands-on evidence로 분해합니다.',
    primaryLabel: 'Legacy 3D 열기',
    nextLabel: 'Concept Class로 이동',
    steps: [
      {
        id: 'legacy',
        number: '01',
        tone: 'legacy',
        title: 'Legacy 3D Session',
        body: '기존 ROOT14 cinematic session에서 전체 story arc, stage transition, shell 기반 진행감을 먼저 확인합니다.',
      },
      {
        id: 'concept',
        number: '02',
        tone: 'concept',
        title: 'Concept Class',
        body: '이후 Orion Echo infrastructure map 위에서 supply chain, trust boundary, token, CI/CD, signing, impact를 설명합니다.',
      },
    ],
  },
};

export default function ScenarioLegacyBridge({ course }) {
  const navigate = useNavigate();
  const { curriculum } = course;
  const { language, setLanguage } = useScenarioLanguage();
  const baseLegacy = legacyCopy[language] || legacyCopy.en;
  const customLegacy = curriculum.legacy3d?.copy?.[language] || curriculum.legacy3d?.copy?.en || {};
  const legacy = {
    ...baseLegacy,
    ...curriculum.legacy3d,
    ...customLegacy,
    steps: customLegacy.steps || curriculum.legacy3d.steps || baseLegacy.steps,
  };

  const openLegacy = () => {
    if (legacy.url?.startsWith('/')) {
      navigate(legacy.url);
      return;
    }
    window.open(legacy.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="legacy-bridge" lang={language}>
      <div className="scanline" />
      <main className="bridge-shell">
        <div className="top-row">
          <button className="ghost" type="button" onClick={() => navigate(curriculum.routes.intro)}>
            <ArrowLeft size={15} />
            {legacy.backLabel}
          </button>
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>

        <section className="hero">
          <div className="kicker">{curriculum.scenario.title.toUpperCase()} // {legacy.kicker}</div>
          <h1>{legacy.headline}</h1>
          <p>{legacy.summary}</p>
        </section>

        <section className="flow">
          {legacy.steps.map((step, index) => (
            <LegacyStepGroup key={step.id} step={step} showConnector={index < legacy.steps.length - 1} />
          ))}
        </section>

        <div className="actions">
          <button className="primary legacy" type="button" onClick={openLegacy}>
            <Play size={17} />
            {legacy.primaryLabel}
            <ExternalLink size={15} />
          </button>
          <button className="primary concept" type="button" onClick={() => navigate(curriculum.routes.concepts)}>
            <BookOpen size={17} />
            {legacy.nextLabel}
          </button>
        </div>
      </main>

      <style>{styles}</style>
    </div>
  );
}

function LegacyStepGroup({ step, showConnector }) {
  return (
    <>
      <article className={`step ${step.tone}`}>
        <div className="step-number">{step.number}</div>
        <h2>{step.title}</h2>
        <div>{step.body}</div>
      </article>
      {showConnector && <div className="connector" />}
    </>
  );
}

const styles = `
  ${languageToggleStyles}
  .legacy-bridge {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at top right, rgba(251, 191, 36, 0.13), transparent 48%),
      radial-gradient(ellipse at bottom left, rgba(88, 166, 255, 0.1), transparent 48%),
      ${C.bg};
    color: ${C.text};
    font-family: -apple-system, "Apple SD Gothic Neo", system-ui, sans-serif;
    position: relative;
    overflow: hidden;
  }
  .scanline {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 4px);
    opacity: 0.35;
  }
  .bridge-shell {
    position: relative;
    z-index: 1;
    max-width: 980px;
    margin: 0 auto;
    padding: 48px 28px 88px;
  }
  .ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 0;
    color: ${C.muted};
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    margin: 0;
  }
  .top-row {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 52px;
  }
  .hero {
    max-width: 820px;
  }
  .kicker {
    color: ${C.accent};
    font-family: monospace;
    letter-spacing: 4px;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 18px;
  }
  h1 {
    font-size: clamp(34px, 5vw, 58px);
    font-weight: 250;
    letter-spacing: 0;
    line-height: 1.13;
    margin: 0;
  }
  p {
    color: ${C.muted};
    font-size: 17px;
    line-height: 1.75;
    margin: 22px 0 0;
  }
  .flow {
    display: grid;
    grid-template-columns: 1fr 56px 1fr;
    gap: 0;
    margin-top: 54px;
    align-items: stretch;
  }
  .step {
    background: ${C.panel};
    border: 1px solid ${C.border};
    padding: 24px;
    min-height: 168px;
  }
  .step.legacy {
    border-color: rgba(251, 191, 36, 0.3);
  }
  .step.concept {
    border-color: rgba(88, 166, 255, 0.3);
  }
  .step-number {
    font-family: monospace;
    font-size: 13px;
    letter-spacing: 3px;
    color: ${C.muted};
  }
  .step h2 {
    margin: 14px 0 10px;
    font-size: 24px;
    letter-spacing: 0;
    line-height: 1.25;
  }
  .step div:last-child {
    color: #cbd5e1;
    line-height: 1.7;
    font-size: 15px;
  }
  .connector {
    align-self: center;
    height: 2px;
    background: linear-gradient(90deg, ${C.accent}, ${C.concept});
    box-shadow: 0 0 20px rgba(88, 166, 255, 0.25);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 34px;
  }
  .primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid transparent;
    padding: 15px 22px;
    font-family: monospace;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 2px;
    cursor: pointer;
  }
  .primary.legacy {
    background: ${C.accent};
    color: #0a0a0f;
    border-color: ${C.accent};
  }
  .primary.concept {
    background: ${C.concept};
    color: #031014;
    border-color: ${C.concept};
  }
  @media (max-width: 780px) {
    .flow {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .connector {
      width: 2px;
      height: 34px;
      justify-self: center;
      background: linear-gradient(180deg, ${C.accent}, ${C.concept});
    }
    .primary {
      width: 100%;
      justify-content: center;
    }
  }
`;

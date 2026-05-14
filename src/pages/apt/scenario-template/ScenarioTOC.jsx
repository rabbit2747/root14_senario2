import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cuboid,
  FileText,
  GitBranch,
  Network,
  RadioTower,
  Server,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { LanguageToggle, languageToggleStyles, useScenarioLanguage } from './scenarioLanguage.jsx';

const C = {
  bg: '#05070b',
  panel: 'rgba(11, 17, 28, 0.82)',
  panelStrong: 'rgba(15, 23, 42, 0.94)',
  line: 'rgba(148, 163, 184, 0.18)',
  lineStrong: 'rgba(88, 166, 255, 0.34)',
  text: '#e5eefc',
  muted: '#94a3b8',
  faint: '#64748b',
  blue: '#58a6ff',
  cyan: '#22d3ee',
  green: '#34d399',
  amber: '#f59e0b',
};

const copy = {
  en: {
    back: 'Scenario Hub',
    kicker: 'ROOT14 APT CURRICULUM',
    headline: 'Operation Orion Echo',
    intro:
      'This course turns a supply-chain APT scenario into a complete learning path: storyline, core concepts, infrastructure mapping, Practical 3D, and a Docker-based hands-on lab.',
    start: 'Start Curriculum',
    labNow: 'Open Lab',
    status: 'MISSION STATUS',
    canonical: 'CANONICAL',
    mission: 'ANRC Customer Export Exposure',
    missionBody:
      'The canonical ending is not a defender report. The learner recovers the ANRC customer export file, drops it into a controlled simulator, and passes supervisor-bot validation.',
    outcomes: [
      ['Learning Target', 'Supply Chain APT', 'Abuse of a vendor trust chain rather than direct customer-network intrusion', GitBranch],
      ['Final Impact', 'Dark Web Impact', 'Connect customer export, object access, supervised drop validation, and drop record', ShieldCheck],
      ['Lab Runtime', 'Docker / WSL', 'Local lab entry runs at http://localhost:8081', Server],
    ],
    flowTitle: 'This curriculum runs in four learning sessions.',
    flowBody: 'First feel the incident in Legacy 3D, then learn the concepts, re-map the same case in Practical 3D, and finally prove it in the lab.',
    sessionsTitle: 'Session Entry Points',
    sessionsBody: 'Each session can be opened directly, but the intended path is top to bottom.',
    labBannerTitle: 'The next step after Practical 3D is the hands-on lab.',
    labBannerBody:
      'The Docker lab is prepared around port 8081. In Stage 11, learners verify the final impact through the dark-web-drop simulator.',
    labBannerButton: 'Lab Control Center',
    fixedPurpose: {
      'mission-briefing': 'Understand the case background, learner role, and final objective before starting the scenario.',
      'legacy-3d-overview': 'Use the existing 3D session to quickly feel the attack flow and operational tone.',
      'concept-class': 'Learn supply chain, trust boundary, token, CI/CD, signing, and evidence-chain concepts on top of the infrastructure map.',
      'practical-case-review': 'Reframe the incident from an operator perspective and identify which systems and logs matter.',
      'practical-3d': 'Use the MVP topology to see which system and boundary each stage passes through.',
      'hands-on-lab': 'Run commands in the Docker lab and directly inspect responses, logs, tokens, artifacts, and impact evidence.',
      'dark-web-impact': 'Confirm the final ANRC export path into object storage, supervised file-drop validation, and the controlled Dark Web drop record.',
    },
    macroFlow: [
      ['Legacy 3D', 'Feel the full incident first', 'Start with the shape and rhythm of the attack before diving into definitions.', Cuboid, C.cyan],
      ['Concept Class', 'Attach concepts to infrastructure boundaries', 'Learn trust, tokens, CI/CD, signing, and evidence chains with diagrams and plain explanations.', BookOpen, C.blue],
      ['Practical 3D', 'Trace system-to-system movement', 'Map each stage to services, networks, and trust boundaries in the topology.', Network, C.green],
      ['Hands-on Lab', 'Run commands and collect evidence', 'Follow Stage 0-11 in Docker and prove the final Dark Web Impact.', TerminalSquare, C.amber],
    ],
  },
  ko: {
    back: 'Scenario Hub',
    kicker: 'ROOT14 APT CURRICULUM',
    headline: 'Operation Orion Echo',
    intro:
      '이 과정은 공급망 APT 시나리오를 사건 흐름, 핵심 개념, 인프라 매핑, Practical 3D, Docker 실습까지 이어지는 하나의 학습 경로로 구성합니다.',
    start: '커리큘럼 시작',
    labNow: 'Lab 바로 확인',
    status: 'MISSION STATUS',
    canonical: 'CANONICAL',
    mission: 'ANRC Customer Export Exposure',
    missionBody:
      '정본 결말은 Defender Report가 아니라 ANRC customer export 파일을 회수해 controlled simulator에 떨구고 supervisor bot 검증을 통과하는 흐름입니다.',
    outcomes: [
      ['학습 대상', 'Supply Chain APT', '고객망 직접 침투가 아니라 vendor trust chain을 오염시키는 사건', GitBranch],
      ['최종 영향', 'Dark Web Impact', 'customer export, object access, supervised drop validation, drop record를 연결', ShieldCheck],
      ['실습 환경', 'Docker / WSL', '로컬 lab entry는 http://localhost:8081 기준으로 접근', Server],
    ],
    flowTitle: '이번 커리큘럼은 네 단계로 진행됩니다.',
    flowBody: 'Legacy 3D로 큰 흐름을 잡고, 개념을 학습한 뒤, Practical 3D와 Lab에서 같은 사건을 다시 검증합니다.',
    sessionsTitle: '세션별 진입점',
    sessionsBody: '각 세션은 독립적으로 열 수 있지만, 기본 흐름은 위에서 아래 순서입니다.',
    labBannerTitle: 'Practical 3D 이후 단계는 실제 실습 Lab입니다.',
    labBannerBody:
      'Docker lab은 현재 8081 포트 기준으로 구성되어 있고, Stage 11에서 dark-web-drop simulator를 통해 최종 영향 증거를 확인합니다.',
    labBannerButton: 'Lab Control Center',
    fixedPurpose: {
      'mission-briefing': '사건 배경, 학습자 역할, 최종 목표를 먼저 잡고 전체 학습 맥락을 만듭니다.',
      'legacy-3d-overview': '기존 3D 세션으로 공격 흐름과 분위기를 빠르게 체감합니다.',
      'concept-class': '공급망, 신뢰 경계, 토큰, CI/CD, 서명, 증거 체인을 인프라 지도 위에서 학습합니다.',
      'practical-case-review': '사건을 실무 관점으로 재정리하고 어떤 시스템과 로그를 봐야 하는지 연결합니다.',
      'practical-3d': 'MVP topology에서 각 단계가 어느 시스템과 경계를 통과하는지 확인합니다.',
      'hands-on-lab': 'Docker lab에서 명령, 응답, 로그, 토큰, 산출물, 영향 증거를 직접 추적합니다.',
      'dark-web-impact': 'ANRC export가 object store, supervised file-drop validation, controlled Dark Web drop record로 이어지는 최종 영향을 확인합니다.',
    },
    macroFlow: [
      ['Legacy 3D', '큰 사건 흐름을 먼저 본다', '정의부터 외우지 않고 공격이 어떤 순서와 분위기로 진행되는지 먼저 감각화합니다.', Cuboid, C.cyan],
      ['Concept Class', '개념을 인프라 경계에 붙인다', 'trust, token, CI/CD, signing, evidence chain을 도식과 설명으로 이해합니다.', BookOpen, C.blue],
      ['Practical 3D', '시스템 연결을 단계별로 확인한다', '각 단계가 어느 서비스, 네트워크, 신뢰 구간을 통과하는지 topology로 재구성합니다.', Network, C.green],
      ['Hands-on Lab', '직접 명령을 실행하고 증거를 남긴다', 'Docker lab에서 Stage 0-11을 따라가며 최종 Dark Web Impact까지 검증합니다.', TerminalSquare, C.amber],
    ],
  },
};

const iconBySession = {
  'mission-briefing': FileText,
  'legacy-3d-overview': Cuboid,
  'concept-class': BookOpen,
  'practical-case-review': RadioTower,
  'practical-3d': Box,
  'hands-on-lab': Beaker,
  'dark-web-impact': ShieldCheck,
  'evidence-topology-review': Network,
  'hands-on-investigation-lab': Beaker,
  'final-report': ShieldCheck,
};

const iconRegistry = {
  ArrowRight,
  Beaker,
  BookOpen,
  Box,
  CheckCircle2,
  Cuboid,
  FileText,
  GitBranch,
  Network,
  RadioTower,
  Server,
  ShieldCheck,
  TerminalSquare,
};

const toneRegistry = {
  cyan: C.cyan,
  blue: C.blue,
  green: C.green,
  amber: C.amber,
  faint: C.faint,
};

const toneByPhase = {
  context: C.cyan,
  concept: C.blue,
  application: C.green,
  lab: C.amber,
};

const phaseLabel = {
  context: 'Context',
  concept: 'Concept',
  application: 'Practice',
  lab: 'Lab',
};

const routeBySession = {
  'mission-briefing': 'intro',
  'legacy-3d-overview': 'legacy3d',
  'concept-class': 'concepts',
  'practical-case-review': 'practical',
  'practical-3d': 'practical',
  'evidence-topology-review': 'practical',
  'hands-on-lab': 'lab',
  'hands-on-investigation-lab': 'lab',
  'dark-web-impact': 'lab',
  'final-report': 'lab',
};

function resolveIcon(icon) {
  if (typeof icon === 'string') return iconRegistry[icon] || FileText;
  return icon || FileText;
}

function resolveTone(tone) {
  if (typeof tone === 'string') return toneRegistry[tone] || tone;
  return tone || C.faint;
}

export default function ScenarioTOC({ course }) {
  const navigate = useNavigate();
  const { curriculum } = course;
  const { language, setLanguage } = useScenarioLanguage();
  const baseCopy = copy[language] || copy.en;
  const customCopy = curriculum.tocCopy?.[language] || curriculum.tocCopy?.en || {};
  const t = {
    ...baseCopy,
    ...customCopy,
    fixedPurpose: {
      ...(baseCopy.fixedPurpose || {}),
      ...(customCopy.fixedPurpose || {}),
    },
    outcomes: customCopy.outcomes || baseCopy.outcomes,
    macroFlow: customCopy.macroFlow || baseCopy.macroFlow,
  };

  const sections = useMemo(() => {
    return curriculum.sessions.map((session, index) => {
      const routeKey = routeBySession[session.id];
      const route = routeKey ? curriculum.routes[routeKey] : null;
      return {
        id: index + 1,
        sessionId: session.id,
        label: session.label,
        phase: phaseLabel[session.phase] || session.phase,
        summary: t.fixedPurpose[session.id] || session.purpose,
        route,
        icon: session.icon ? resolveIcon(session.icon) : iconBySession[session.id] || FileText,
        tone: toneByPhase[session.phase] || C.faint,
        open: Boolean(route) && !session.planned,
      };
    });
  }, [curriculum, t]);

  const startRoute = curriculum.routes.intro || curriculum.routes.legacy3d || curriculum.routes.concepts;
  const labRoute = curriculum.routes.lab;

  return (
    <div className="entry-root" lang={language}>
      <div className="entry-grid-bg" aria-hidden="true" />
      <header className="entry-hero">
        <nav className="entry-nav">
          <button type="button" onClick={() => navigate('/apt/scenarios')}>{t.back}</button>
          <div className="nav-right">
            <span>{curriculum.scenario.difficulty}</span>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
        </nav>

        <div className="hero-layout">
          <section>
            <div className="kicker">{t.kicker}</div>
            <h1>{t.headline}</h1>
            <p>{t.intro}</p>
            <div className="hero-actions">
              <button className="primary" type="button" onClick={() => navigate(startRoute)}>
                {t.start}
                <ArrowRight size={17} />
              </button>
              <button className="secondary" type="button" onClick={() => navigate(labRoute)}>
                {t.labNow}
                <Beaker size={17} />
              </button>
            </div>
          </section>

          <aside className="mission-card">
            <div className="mission-top">
              <span>{t.status}</span>
              <strong>{t.canonical}</strong>
            </div>
            <div className="mission-title">{t.mission}</div>
            <p>{t.missionBody}</p>
            <div className="mission-meta">
              <span><Clock3 size={14} /> {curriculum.scenario.estimatedMinutes} min</span>
              <span><CheckCircle2 size={14} /> {t.stageRange || 'Stage 0-11'}</span>
            </div>
          </aside>
        </div>
      </header>

      <main className="entry-main">
        <section className="outcome-grid">
          {t.outcomes.map(([label, value, detail, IconValue]) => {
            const Icon = resolveIcon(IconValue);
            return (
            <article key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{detail}</p>
            </article>
            );
          })}
        </section>

        <section className="macro-section">
          <div className="section-head">
            <div>
              <div className="kicker">LEARNING FLOW</div>
              <h2>{t.flowTitle}</h2>
            </div>
            <p>{t.flowBody}</p>
          </div>
          <div className="macro-flow">
            {t.macroFlow.map(([label, title, body, IconValue, toneValue], index) => {
              const Icon = resolveIcon(IconValue);
              const tone = resolveTone(toneValue);
              return (
              <article key={label} style={{ '--tone': tone }}>
                <div className="macro-index">{String(index + 1).padStart(2, '0')}</div>
                <Icon size={22} />
                <span>{label}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </article>
              );
            })}
          </div>
        </section>

        <section className="session-section">
          <div className="section-head">
            <div>
              <div className="kicker">SESSION MAP</div>
              <h2>{t.sessionsTitle}</h2>
            </div>
            <p>{t.sessionsBody}</p>
          </div>
          <div className="session-list">
            {sections.map((section) => (
              <SessionRow key={`${section.sessionId}-${section.id}`} section={section} onOpen={(route) => navigate(route)} />
            ))}
          </div>
        </section>

        <section className="lab-banner">
          <div>
            <div className="kicker">NEXT AFTER PRACTICAL 3D</div>
            <h2>{t.labBannerTitle}</h2>
            <p>{t.labBannerBody}</p>
          </div>
          <button type="button" onClick={() => navigate(labRoute)}>
            {t.labBannerButton}
            <ChevronRight size={18} />
          </button>
        </section>
      </main>

      <style>{styles}</style>
    </div>
  );
}

function SessionRow({ section, onOpen }) {
  const Icon = section.icon;
  return (
    <article className="session-row" style={{ '--tone': section.tone }} onClick={() => section.open && section.route && onOpen(section.route)}>
      <div className="session-number">{String(section.id).padStart(2, '0')}</div>
      <div className="session-icon"><Icon size={20} /></div>
      <div className="session-copy">
        <div>
          <strong>{section.label}</strong>
          <span>{section.phase}</span>
        </div>
        <p>{section.summary}</p>
      </div>
      <div className="session-action">
        {section.open ? 'OPEN' : 'LOCKED'}
        <ChevronRight size={16} />
      </div>
    </article>
  );
}

const styles = `
  ${languageToggleStyles}
  .entry-root {
    min-height: 100vh;
    background:
      radial-gradient(circle at 74% 0%, rgba(88, 166, 255, 0.16), transparent 30%),
      radial-gradient(circle at 18% 12%, rgba(34, 211, 238, 0.10), transparent 28%),
      linear-gradient(180deg, rgba(5, 7, 11, 0.2), ${C.bg} 520px),
      ${C.bg};
    color: ${C.text};
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", sans-serif;
    overflow-x: hidden;
    position: relative;
  }
  .entry-root * { box-sizing: border-box; }
  .entry-grid-bg {
    background-image:
      linear-gradient(rgba(148, 163, 184, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.035) 1px, transparent 1px);
    background-size: 38px 38px;
    inset: 0;
    mask-image: linear-gradient(180deg, black, transparent 78%);
    pointer-events: none;
    position: fixed;
  }
  .entry-hero, .entry-main {
    margin: 0 auto;
    position: relative;
    width: min(1180px, calc(100% - 64px));
  }
  .entry-hero { padding: 34px 0 54px; }
  .entry-nav {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 54px;
  }
  .entry-nav button {
    background: transparent;
    border: 1px solid ${C.line};
    color: ${C.muted};
    cursor: pointer;
    font-size: 13px;
    height: 36px;
    padding: 0 14px;
  }
  .nav-right {
    align-items: center;
    display: flex;
    gap: 12px;
  }
  .nav-right > span {
    color: ${C.faint};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .hero-layout {
    align-items: end;
    display: grid;
    gap: 46px;
    grid-template-columns: minmax(0, 1fr) 360px;
  }
  .kicker {
    color: ${C.cyan};
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  h1, h2, p { margin: 0; }
  h1 {
    font-size: 72px;
    font-weight: 760;
    letter-spacing: 0;
    line-height: 0.98;
    margin-top: 16px;
    max-width: 760px;
  }
  .hero-layout section > p {
    color: ${C.muted};
    font-size: 19px;
    line-height: 1.75;
    margin-top: 24px;
    max-width: 790px;
  }
  .hero-actions { display: flex; gap: 12px; margin-top: 34px; }
  .hero-actions button, .lab-banner button {
    align-items: center;
    border: 1px solid transparent;
    cursor: pointer;
    display: inline-flex;
    font-weight: 800;
    gap: 10px;
    height: 48px;
    justify-content: center;
    padding: 0 20px;
  }
  .hero-actions .primary { background: ${C.blue}; color: #03111f; }
  .hero-actions .secondary {
    background: rgba(15, 23, 42, 0.76);
    border-color: ${C.line};
    color: ${C.text};
  }
  .mission-card {
    background: ${C.panelStrong};
    border: 1px solid ${C.lineStrong};
    min-height: 286px;
    padding: 24px;
  }
  .mission-top, .mission-meta {
    align-items: center;
    display: flex;
    gap: 14px;
    justify-content: space-between;
  }
  .mission-top span, .mission-top strong, .mission-meta span {
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    letter-spacing: 2px;
  }
  .mission-top span { color: ${C.faint}; }
  .mission-top strong { color: ${C.green}; }
  .mission-title {
    color: ${C.text};
    font-size: 28px;
    font-weight: 780;
    line-height: 1.14;
    margin-top: 34px;
  }
  .mission-card p {
    color: ${C.muted};
    font-size: 15px;
    line-height: 1.7;
    margin-top: 16px;
  }
  .mission-meta {
    border-top: 1px solid ${C.line};
    justify-content: flex-start;
    margin-top: 24px;
    padding-top: 16px;
  }
  .mission-meta span {
    align-items: center;
    color: ${C.cyan};
    display: inline-flex;
    gap: 7px;
  }
  .entry-main { padding-bottom: 90px; }
  .outcome-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(3, 1fr);
    margin-bottom: 48px;
  }
  .outcome-grid article {
    background: rgba(15, 23, 42, 0.58);
    border: 1px solid ${C.line};
    min-height: 156px;
    padding: 20px;
  }
  .outcome-grid svg { color: ${C.cyan}; margin-bottom: 18px; }
  .outcome-grid span {
    color: ${C.faint};
    display: block;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .outcome-grid strong { display: block; font-size: 20px; margin-top: 7px; }
  .outcome-grid p { color: ${C.muted}; font-size: 14px; line-height: 1.55; margin-top: 10px; }
  .macro-section, .session-section { margin-top: 52px; }
  .section-head {
    align-items: end;
    display: flex;
    gap: 30px;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .section-head h2 { font-size: 32px; letter-spacing: 0; line-height: 1.25; margin-top: 10px; }
  .section-head p { color: ${C.muted}; font-size: 15px; line-height: 1.65; max-width: 480px; }
  .macro-flow {
    border: 1px solid ${C.line};
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  .macro-flow article {
    background: ${C.panel};
    border-right: 1px solid ${C.line};
    min-height: 292px;
    padding: 20px;
  }
  .macro-flow article:last-child { border-right: 0; }
  .macro-index {
    color: var(--tone);
    font-family: "JetBrains Mono", Consolas, monospace;
    font-weight: 900;
    letter-spacing: 2px;
    margin-bottom: 44px;
  }
  .macro-flow svg { color: var(--tone); }
  .macro-flow span {
    color: var(--tone);
    display: block;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    margin-top: 18px;
    text-transform: uppercase;
  }
  .macro-flow strong { color: ${C.text}; display: block; font-size: 21px; line-height: 1.28; margin-top: 9px; }
  .macro-flow p { color: ${C.muted}; font-size: 14px; line-height: 1.65; margin-top: 12px; }
  .session-list { display: flex; flex-direction: column; gap: 12px; }
  .session-row {
    align-items: center;
    background: rgba(15, 23, 42, 0.54);
    border: 1px solid ${C.line};
    border-left: 3px solid var(--tone);
    cursor: pointer;
    display: grid;
    gap: 18px;
    grid-template-columns: 58px 44px 1fr 90px;
    min-height: 118px;
    padding: 20px 22px;
  }
  .session-row:hover { background: rgba(15, 23, 42, 0.82); border-color: rgba(88, 166, 255, 0.32); }
  .session-number {
    color: var(--tone);
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 21px;
    font-weight: 900;
  }
  .session-icon {
    align-items: center;
    border: 1px solid ${C.line};
    color: var(--tone);
    display: flex;
    height: 44px;
    justify-content: center;
    width: 44px;
  }
  .session-copy div { align-items: baseline; display: flex; gap: 12px; }
  .session-copy strong { font-size: 19px; }
  .session-copy span {
    color: var(--tone);
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .session-copy p { color: ${C.muted}; font-size: 14px; line-height: 1.6; margin-top: 7px; }
  .session-action {
    align-items: center;
    color: var(--tone);
    display: inline-flex;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    font-weight: 900;
    gap: 4px;
    justify-content: flex-end;
    letter-spacing: 2px;
  }
  .lab-banner {
    align-items: center;
    background: linear-gradient(90deg, rgba(245, 158, 11, 0.14), rgba(88, 166, 255, 0.10));
    border: 1px solid rgba(245, 158, 11, 0.28);
    display: flex;
    gap: 28px;
    justify-content: space-between;
    margin-top: 52px;
    padding: 28px;
  }
  .lab-banner h2 { font-size: 28px; margin-top: 9px; }
  .lab-banner p { color: ${C.muted}; font-size: 15px; line-height: 1.65; margin-top: 10px; max-width: 700px; }
  .lab-banner button { background: ${C.amber}; color: #160d02; flex: 0 0 auto; }
`;

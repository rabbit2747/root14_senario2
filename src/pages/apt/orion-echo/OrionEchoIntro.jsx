/**
 * OrionEchoIntro — Orion Echo Enterprise APT Range 시나리오 인트로
 *
 * 학습자가 ScenarioHub에서 카드 클릭시 도착.
 * Docker 실습 환경 시작 전 스토리·11스테이지·MITRE 매핑·전제조건·안전규칙 안내.
 */
import { useNavigate } from 'react-router-dom';
import OE from './data/orion-echo';

const C = {
  bg: '#0a0a0f',
  panel: '#13131a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#fbbf24',
  text: '#e2e8f0',
  muted: '#64748b',
  subtle: '#475569',
};

export default function OrionEchoIntro() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
    }}>
      {/* ── 히어로 ── */}
      <div style={{
        position: 'relative',
        borderBottom: `1px solid ${C.border}`,
        background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(220,38,38,0.1) 0%, transparent 50%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 56px' }}>
          <button
            onClick={() => navigate('/apt/scenarios')}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.muted,
              fontSize: 12,
              cursor: 'pointer',
              marginBottom: 32,
              padding: 0,
            }}
          >
            ← 시나리오 허브
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: 4,
              color: C.accent,
              padding: '4px 10px',
              border: `1px solid ${C.accent}`,
            }}>
              {OE.id}
            </span>
            <span style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace', letterSpacing: 2 }}>
              Lv.{OE.level} · {OE.difficulty.toUpperCase()} · ⏱ ~{Math.floor(OE.durationMin/60)}h
            </span>
            {OE.status === 'preparing' && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                background: 'rgba(251,191,36,0.15)',
                color: C.accent,
                padding: '3px 10px',
                borderRadius: 999,
                border: `1px solid rgba(251,191,36,0.4)`,
                letterSpacing: 1,
              }}>
                ⚙ PREPARING
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 200,
            letterSpacing: -0.5,
            margin: 0,
            lineHeight: 1.15,
          }}>
            {OE.name}
          </h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8, fontStyle: 'italic' }}>
            {OE.group}
          </div>

          {/* 메타 행 */}
          <div style={{
            marginTop: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}>
            <Meta label="회사" value={OE.hero.company} />
            <Meta label="고객" value={OE.hero.customer} />
            <Meta label="최종 목표" value={OE.hero.finalObjective} />
            <Meta label="컨테이너 / 세션" value={`~${OE.containerCount}`} />
          </div>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* 스토리 */}
        <Section title="MISSION BRIEFING">
          {OE.story.map((p, i) => (
            <p key={i} style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: '#cbd5e1',
              margin: '0 0 12px',
              paddingLeft: 16,
              borderLeft: `2px solid ${C.subtle}`,
            }}>
              {p}
            </p>
          ))}
          <div style={{ marginTop: 20, padding: 16, background: C.panel, border: `1px dashed ${C.border}`, borderRadius: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: C.accent, fontFamily: 'monospace', marginBottom: 6 }}>
              ▎ ROLE
            </div>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>
              {OE.persona.role}
            </div>
          </div>
        </Section>

        {/* 11 스테이지 */}
        <Section title={`ATTACK CHAIN · ${OE.stages.length} STAGES`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OE.stages.map((s) => (
              <div key={s.id} style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '40px 1fr auto',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.accent,
                  textAlign: 'center',
                }}>
                  {String(s.id).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.name}</span>
                    {s.passive && (
                      <span style={{
                        fontSize: 9,
                        color: C.muted,
                        fontFamily: 'monospace',
                        letterSpacing: 1,
                        border: `1px solid ${C.border}`,
                        padding: '1px 5px',
                      }}>passive</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, lineHeight: 1.5 }}>
                    {s.objective}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {s.mitre.map((m) => (
                      <span key={m} style={{
                        fontFamily: 'monospace',
                        fontSize: 9,
                        color: C.accent,
                        background: 'rgba(251,191,36,0.08)',
                        padding: '1px 6px',
                        border: `1px solid rgba(251,191,36,0.25)`,
                        borderRadius: 2,
                        letterSpacing: 0.5,
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                  {s.note && (
                    <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: 'italic' }}>
                      ⚠ {s.note}
                    </div>
                  )}
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: C.subtle,
                  letterSpacing: 1,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}>
                  {s.flag}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 네트워크 */}
        <Section title="NETWORK ZONES">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {OE.networks.map((n, i) => (
              <div key={i} style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#cbd5e1',
                padding: '10px 14px',
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 3,
                letterSpacing: 0.5,
              }}>
                {n}
              </div>
            ))}
          </div>
        </Section>

        {/* 전제조건 */}
        <Section title="PREREQUISITES">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {OE.prerequisites.map((p, i) => (
              <li key={i} style={{
                fontSize: 13, color: '#cbd5e1', display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ color: C.accent, fontFamily: 'monospace', flexShrink: 0 }}>▸</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>

        {/* 안전 규칙 */}
        <Section title="SAFETY RULES" accent="#dc2626">
          <div style={{
            background: 'rgba(220,38,38,0.06)',
            border: `1px solid rgba(220,38,38,0.25)`,
            borderRadius: 4,
            padding: 16,
          }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {OE.safetyRules.map((r, i) => (
                <li key={i} style={{
                  fontSize: 12, color: '#fecaca', display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <span style={{ color: '#dc2626', fontFamily: 'monospace', flexShrink: 0 }}>✕</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* CTA */}
        <div style={{
          marginTop: 56,
          padding: 32,
          textAlign: 'center',
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
        }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: C.accent, fontFamily: 'monospace', marginBottom: 14 }}>
            ▎ STATUS · {OE.status.toUpperCase()}
          </div>
          <div style={{ fontSize: 18, fontWeight: 300, color: C.text, marginBottom: 8 }}>
            {OE.statusMessage}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>
            Docker Compose 환경이 준비되면 여기에서 세션을 시작할 수 있습니다.
          </div>
          <button
            onClick={() => navigate('/apt/scenarios')}
            style={{
              background: 'transparent',
              color: C.accent,
              border: `1px solid ${C.accent}`,
              padding: '12px 32px',
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 4,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.accent;
              e.currentTarget.style.color = '#0a0a0f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = C.accent;
            }}
          >
            ← BACK TO HUB
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, accent = '#fbbf24', children }) {
  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ width: 32, height: 1, background: accent }}/>
        <h2 style={{
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 4,
          color: accent,
          margin: 0,
        }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: 9, fontFamily: 'monospace', letterSpacing: 3, color: C.muted, marginBottom: 4,
      }}>
        ▎ {label}
      </div>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 500, lineHeight: 1.5 }}>
        {value}
      </div>
    </div>
  );
}

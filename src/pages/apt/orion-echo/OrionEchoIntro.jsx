/**
 * OrionEchoIntro — Orion Echo Enterprise APT Range 인트로
 *
 * narrator 어투: "당신은 공격자다" — 2인칭 격조.
 * 가독성: 본문 16~17px / 라벨 13~14px / 미니 메타 11~12px.
 */
import { useNavigate } from 'react-router-dom';
import OE from './data/orion-echo';

const C = {
  bg: '#0a0a0f',
  panel: '#13131a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#fbbf24',
  text: '#e2e8f0',
  muted: '#94a3b8',
  subtle: '#64748b',
  faint: '#475569',
};

export default function OrionEchoIntro() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
      fontSize: 16,
      lineHeight: 1.6,
    }}>
      {/* ── 히어로 ── */}
      <div style={{
        position: 'relative',
        borderBottom: `1px solid ${C.border}`,
        background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(220,38,38,0.12) 0%, transparent 50%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 64px' }}>
          <button
            onClick={() => navigate('/apt/scenarios')}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.muted,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: 36,
              padding: 0,
              fontWeight: 500,
            }}
          >
            ← 시나리오 허브
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 4,
              color: C.accent,
              padding: '5px 12px',
              border: `1px solid ${C.accent}`,
            }}>
              {OE.id}
            </span>
            <span style={{ fontSize: 13, color: C.muted, fontFamily: 'monospace', letterSpacing: 2 }}>
              Lv.{OE.level} · {OE.difficulty.toUpperCase()} · ⏱ ~{Math.floor(OE.durationMin / 60)}h
            </span>
            {OE.status === 'preparing' && (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                background: 'rgba(251,191,36,0.18)',
                color: C.accent,
                padding: '5px 12px',
                borderRadius: 999,
                border: `1px solid rgba(251,191,36,0.45)`,
                letterSpacing: 1,
              }}>
                ⚙ 실습 환경 준비중
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 4.5vw, 52px)',
            fontWeight: 200,
            letterSpacing: -0.5,
            margin: 0,
            lineHeight: 1.15,
          }}>
            {OE.name}
          </h1>
          <div style={{ fontSize: 16, color: C.muted, marginTop: 12, fontStyle: 'italic' }}>
            {OE.group}
          </div>

          {/* 메타 행 */}
          <div style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            <Meta label="회사" value={OE.hero.company} />
            <Meta label="고객" value={OE.hero.customer} />
            <Meta label="최종 목표" value={OE.hero.finalObjective} />
            <Meta label="컨테이너 / 세션" value={`~${OE.containerCount}대`} />
          </div>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px 96px' }}>

        {/* 미션 브리핑 */}
        <Section title="MISSION BRIEFING">
          {OE.story.map((p, i) => (
            <p key={i} style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: '#cbd5e1',
              margin: '0 0 14px',
              paddingLeft: 18,
              borderLeft: `2px solid ${C.faint}`,
            }}>
              {p}
            </p>
          ))}
          <div style={{ marginTop: 24, padding: 20, background: C.panel, border: `1px dashed ${C.border}`, borderRadius: 4 }}>
            <div style={{ fontSize: 12, letterSpacing: 3, color: C.accent, fontFamily: 'monospace', marginBottom: 8, fontWeight: 700 }}>
              ▎ ROLE
            </div>
            <div style={{ fontSize: 16, color: C.text, fontWeight: 500 }}>
              {OE.persona.role}
            </div>
          </div>
        </Section>

        {/* 11 스테이지 */}
        <Section title={`ATTACK CHAIN · ${OE.stages.length} STAGES`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OE.stages.map((s) => (
              <div key={s.id} style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: 18,
                display: 'grid',
                gridTemplateColumns: '48px 1fr auto',
                alignItems: 'center',
                gap: 18,
              }}>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.accent,
                  textAlign: 'center',
                }}>
                  {String(s.id).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{s.name}</span>
                    {s.passive && (
                      <span style={{
                        fontSize: 11,
                        color: C.muted,
                        fontFamily: 'monospace',
                        letterSpacing: 1,
                        border: `1px solid ${C.border}`,
                        padding: '2px 7px',
                      }}>passive</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 10, lineHeight: 1.55 }}>
                    {s.objective}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {s.mitre.map((m) => (
                      <span key={m} style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.accent,
                        background: 'rgba(251,191,36,0.1)',
                        padding: '3px 8px',
                        border: `1px solid rgba(251,191,36,0.3)`,
                        borderRadius: 2,
                        letterSpacing: 0.5,
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                  {s.note && (
                    <div style={{ marginTop: 10, fontSize: 13, color: C.muted, fontStyle: 'italic' }}>
                      ⚠ {s.note}
                    </div>
                  )}
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: C.faint,
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {OE.networks.map((n, i) => (
              <div key={i} style={{
                fontFamily: 'monospace',
                fontSize: 14,
                color: '#cbd5e1',
                padding: '12px 16px',
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
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OE.prerequisites.map((p, i) => (
              <li key={i} style={{
                fontSize: 15,
                color: '#cbd5e1',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                lineHeight: 1.6,
              }}>
                <span style={{ color: C.accent, fontFamily: 'monospace', flexShrink: 0, fontSize: 14 }}>▸</span>
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
            padding: 20,
          }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {OE.safetyRules.map((r, i) => (
                <li key={i} style={{
                  fontSize: 14,
                  color: '#fecaca',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  lineHeight: 1.6,
                }}>
                  <span style={{ color: '#dc2626', fontFamily: 'monospace', flexShrink: 0, fontSize: 14 }}>✕</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* CTA */}
        <div style={{
          marginTop: 64,
          padding: 36,
          textAlign: 'center',
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
        }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: C.accent, fontFamily: 'monospace', marginBottom: 18, fontWeight: 700 }}>
            ▎ STATUS · {OE.status.toUpperCase()}
          </div>
          <div style={{ fontSize: 20, fontWeight: 300, color: C.text, marginBottom: 12, lineHeight: 1.5 }}>
            {OE.statusMessage}
          </div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
            Docker Compose 환경이 준비되면 이 자리에서 세션을 시작할 수 있다.
          </div>
          <button
            onClick={() => navigate('/apt/scenarios')}
            style={{
              background: 'transparent',
              color: C.accent,
              border: `1px solid ${C.accent}`,
              padding: '14px 36px',
              fontFamily: 'monospace',
              fontSize: 14,
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
    <section style={{ marginTop: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <span style={{ width: 36, height: 1, background: accent }}/>
        <h2 style={{
          fontFamily: 'monospace',
          fontSize: 14,
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
        fontSize: 11,
        fontFamily: 'monospace',
        letterSpacing: 3,
        color: C.subtle,
        marginBottom: 6,
        fontWeight: 600,
      }}>
        ▎ {label}
      </div>
      <div style={{ fontSize: 15, color: C.text, fontWeight: 500, lineHeight: 1.5 }}>
        {value}
      </div>
    </div>
  );
}

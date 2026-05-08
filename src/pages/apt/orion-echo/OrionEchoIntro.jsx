/**
 * OrionEchoIntro — 인트로 (스토리 중심)
 *
 * 학습자 페이지. 운영/관리 메타 노출 X.
 * narrator: 2인칭 격조 "당신은 공격자다"
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
      fontSize: 17,
      lineHeight: 1.75,
    }}>
      {/* ── 히어로 ── */}
      <div style={{
        position: 'relative',
        borderBottom: `1px solid ${C.border}`,
        background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(220,38,38,0.12) 0%, transparent 50%)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 28px 72px' }}>
          <button
            onClick={() => navigate('/apt/orion-echo')}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.muted,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: 40,
              padding: 0,
            }}
          >
            ← 목차
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 4,
              color: C.accent,
              padding: '5px 12px',
              border: `1px solid ${C.accent}`,
            }}>
              MISSION BRIEFING
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 5vw, 56px)',
            fontWeight: 200,
            letterSpacing: -0.5,
            margin: 0,
            lineHeight: 1.15,
          }}>
            {OE.name}
          </h1>
          <div style={{
            fontSize: 19,
            color: C.muted,
            marginTop: 16,
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}>
            한 벤더의 신뢰가 무너지는 순간을 추적한다.
          </div>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 28px 96px' }}>

        {/* 스토리 */}
        <section>
          {OE.story.map((p, i) => (
            <p key={i} style={{
              fontSize: 18,
              lineHeight: 1.85,
              color: '#cbd5e1',
              margin: '0 0 18px',
              paddingLeft: 22,
              borderLeft: `2px solid ${C.faint}`,
            }}>
              {p}
            </p>
          ))}
        </section>

        {/* 당신의 역할 */}
        <section style={{
          marginTop: 56,
          padding: 28,
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
        }}>
          <div style={{
            fontSize: 13,
            letterSpacing: 4,
            color: C.accent,
            fontFamily: 'monospace',
            marginBottom: 14,
            fontWeight: 700,
          }}>
            ▎ 당신의 역할
          </div>
          <div style={{ fontSize: 18, color: C.text, fontWeight: 400, lineHeight: 1.6 }}>
            {OE.persona.role}
          </div>
          <div style={{ fontSize: 16, color: C.muted, marginTop: 14, lineHeight: 1.7 }}>
            {OE.persona.setup}
          </div>
        </section>

        {/* 거치게 될 단계 (이름·목표만 — 운영 메타 X) */}
        <section style={{ marginTop: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span style={{ width: 36, height: 1, background: C.accent }} />
            <h2 style={{
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 4,
              color: C.accent,
              margin: 0,
            }}>
              당신이 거치게 될 길
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OE.stages.map((s) => (
              <div key={s.id} style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: 20,
                display: 'grid',
                gridTemplateColumns: '52px 1fr',
                alignItems: 'center',
                gap: 20,
              }}>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.accent,
                  textAlign: 'center',
                }}>
                  {String(s.id).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6 }}>
                    {s.objective}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          marginTop: 72,
          textAlign: 'center',
        }}>
          <button
            disabled
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px dashed ${C.faint}`,
              padding: '18px 48px',
              fontFamily: 'monospace',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 4,
              cursor: 'not-allowed',
            }}
          >
            ⚙ 시네마틱 재구축 중
          </button>
          <div style={{
            marginTop: 16,
            fontSize: 14,
            color: C.muted,
          }}>
            ANRC 직원의 시점에서 그날 무슨 일이 벌어졌는가.
          </div>
        </div>
      </div>
    </div>
  );
}

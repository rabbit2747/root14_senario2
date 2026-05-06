/**
 * CourseTOC — Orion Echo 목차 (페이지 #1, 학습자 진입 첫 화면)
 *
 * 큰 목차 8개 + 각 단계 한 줄 안내. 단순·차분.
 * 어투: "당신은 다음의 길을 거치게 된다"
 */
import { useNavigate } from 'react-router-dom';

const C = {
  bg: '#0a0a0f',
  panel: '#13131a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#06b6d4', // 시안 — 목차의 시그니처 색
  text: '#e2e8f0',
  muted: '#94a3b8',
  subtle: '#64748b',
  faint: '#475569',
};

const SECTIONS = [
  {
    id: 1, label: '미션 브리핑',
    summary: '시나리오의 배경, 회사·고객의 관계, 그리고 당신의 역할을 받아본다.',
    route: '/apt/orion-echo/intro',
    open: true,
  },
  {
    id: 2, label: '사건의 그날 — 피해자 시점',
    summary: '평범한 출근. 평범한 메일. 평범한 업데이트. 그리고 평범하지 않은 결말.',
    route: '/apt/orion-echo/cinematic',
    open: true,
  },
  {
    id: 3, label: '공격자의 첫 수',
    summary: '같은 사건을 반대편에서 본다. 당신의 첫 정찰이 시작된다.',
    route: null,
    open: false,
    note: '디자인 적용 예정',
  },
  {
    id: 4, label: '공격자의 마지막 수',
    summary: '신뢰 채널을 통해 고객 환경에 도달하는 마지막 한 걸음.',
    route: null,
    open: false,
    note: '디자인 적용 예정',
  },
  {
    id: 5, label: '학습 정리',
    summary: '당신이 본 모든 행위의 이름. 개념과 도구로 다시 본다.',
    route: null,
    open: false,
    note: '준비중',
  },
  {
    id: 6, label: '방어자의 자리',
    summary: '같은 11단계를 반대편에서 다시 본다. 어디서 막을 수 있었는가.',
    route: null,
    open: false,
    note: '준비중',
  },
  {
    id: 7, label: '실전 검증 — CTF',
    summary: '체험과 학습이 끝나는 자리. 당신의 손으로 다시 풀어본다.',
    route: null,
    open: false,
    note: '준비중',
  },
];

export default function CourseTOC() {
  const navigate = useNavigate();
  const firstOpen = SECTIONS.find((s) => s.open);

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
      fontSize: 17,
      lineHeight: 1.7,
    }}>
      {/* ── 히어로 ── */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        background: 'radial-gradient(ellipse at top left, rgba(6,182,212,0.12) 0%, transparent 60%)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 28px 64px' }}>
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
            }}
          >
            ← 시나리오 허브
          </button>

          <div style={{
            fontSize: 13,
            fontFamily: 'monospace',
            letterSpacing: 6,
            color: C.accent,
            fontWeight: 700,
            marginBottom: 16,
          }}>
            ▎ COURSE TABLE OF CONTENTS
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 5vw, 52px)',
            fontWeight: 200,
            letterSpacing: -0.5,
            margin: 0,
            lineHeight: 1.2,
          }}>
            Orion Echo Enterprise APT Range
          </h1>
          <div style={{
            fontSize: 18,
            color: C.muted,
            marginTop: 18,
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}>
            당신은 공격자다. 그리고 마지막에 당신은 방어자가 된다.
          </div>
        </div>
      </div>

      {/* ── 목차 ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 28px 96px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SECTIONS.map((s) => (
            <SectionRow key={s.id} section={s} onOpen={(r) => navigate(r)} />
          ))}
        </div>

        {/* CTA */}
        {firstOpen && (
          <div style={{ marginTop: 72, textAlign: 'center' }}>
            <button
              onClick={() => navigate(firstOpen.route)}
              style={{
                background: C.accent,
                color: '#0a0a0f',
                border: 'none',
                padding: '18px 48px',
                fontFamily: 'monospace',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 4,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#67e8f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; }}
            >
              ▶ 시작하기
            </button>
            <div style={{ marginTop: 14, fontSize: 14, color: C.muted }}>
              첫 자리는 미션 브리핑이다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionRow({ section, onOpen }) {
  const open = section.open;
  return (
    <div
      onClick={() => open && section.route && onOpen(section.route)}
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr auto',
        alignItems: 'center',
        gap: 24,
        padding: '22px 26px',
        background: open ? C.panel : 'transparent',
        border: `1px solid ${open ? C.border : 'rgba(255,255,255,0.04)'}`,
        borderLeft: `3px solid ${open ? C.accent : 'rgba(100,116,139,0.3)'}`,
        borderRadius: 3,
        cursor: open ? 'pointer' : 'default',
        opacity: open ? 1 : 0.5,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (open) {
          e.currentTarget.style.background = '#1a1a25';
          e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (open) {
          e.currentTarget.style.background = C.panel;
          e.currentTarget.style.borderColor = C.border;
        }
      }}
    >
      <div style={{
        fontFamily: 'monospace',
        fontSize: 22,
        fontWeight: 700,
        color: open ? C.accent : C.faint,
        textAlign: 'center',
      }}>
        {String(section.id).padStart(2, '0')}
      </div>
      <div>
        <div style={{
          fontSize: 19,
          fontWeight: 600,
          color: open ? C.text : C.muted,
          marginBottom: 6,
        }}>
          {section.label}
        </div>
        <div style={{
          fontSize: 15,
          color: open ? '#cbd5e1' : C.subtle,
          lineHeight: 1.6,
        }}>
          {section.summary}
        </div>
      </div>
      <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        letterSpacing: 2,
        color: open ? C.accent : C.faint,
        textAlign: 'right',
        whiteSpace: 'nowrap',
      }}>
        {open ? '진입 →' : section.note || '준비중'}
      </div>
    </div>
  );
}

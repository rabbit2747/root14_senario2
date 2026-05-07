/**
 * Root14ScenarioChoice — placeholder
 *
 * 원본: github.com/derekChae/1_scenario_choice (private repo)
 * 코드 공유 받는 즉시 이 placeholder를 그대로 교체.
 *
 * 어투: 2인칭 격조 "당신은 ~다"
 */
import { useNavigate } from 'react-router-dom';

export default function Root14ScenarioChoice() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px',
      fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
    }}>
      <div style={{
        fontSize: 13,
        letterSpacing: 6,
        color: '#06b6d4',
        fontFamily: 'monospace',
        fontWeight: 700,
        marginBottom: 20,
      }}>
        ▎ ROOT14 SCENARIO CHOICE
      </div>

      <h1 style={{
        fontSize: 'clamp(28px, 4.5vw, 44px)',
        fontWeight: 200,
        letterSpacing: -0.5,
        margin: 0,
        marginBottom: 18,
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        ROOT14 시나리오 선택
      </h1>

      <p style={{
        fontSize: 17,
        color: '#94a3b8',
        maxWidth: 560,
        textAlign: 'center',
        lineHeight: 1.7,
        marginBottom: 36,
      }}>
        원본 디자인이 적용되기 전 임시 자리다.<br />
        곧 첫 시나리오 선택 화면이 이 자리에서 펼쳐진다.
      </p>

      <div style={{
        padding: 20,
        background: 'rgba(6,182,212,0.08)',
        border: '1px dashed rgba(6,182,212,0.4)',
        borderRadius: 4,
        maxWidth: 480,
        marginBottom: 40,
      }}>
        <div style={{
          fontSize: 12,
          letterSpacing: 4,
          color: '#06b6d4',
          fontFamily: 'monospace',
          fontWeight: 700,
          marginBottom: 10,
        }}>
          ▎ STATUS · PREPARING
        </div>
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>
          원본 코드(<code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 3, fontFamily: 'monospace' }}>derekChae/1_scenario_choice</code>)
          공유가 완료되면 이 자리에 그대로 적용된다.
        </div>
      </div>

      <button
        onClick={() => navigate('/learning-path')}
        style={{
          background: 'transparent',
          border: '1px solid #475569',
          color: '#cbd5e1',
          padding: '14px 32px',
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 4,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#06b6d4';
          e.currentTarget.style.color = '#06b6d4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#475569';
          e.currentTarget.style.color = '#cbd5e1';
        }}
      >
        ← 학습 경로 선택으로
      </button>
    </div>
  );
}

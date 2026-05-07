/**
 * Root14ScenarioChoice — derekChae/1_scenario_choice_last 별도 Vercel로 즉시 리다이렉트
 *
 * 원본: github.com/derekChae/1_scenario_choice_last
 * 배포 URL: https://root14-scenario-last.vercel.app
 */
import { useEffect } from 'react';

const TARGET = 'https://root14-scenario-last.vercel.app';

export default function Root14ScenarioChoice() {
  useEffect(() => {
    window.location.replace(TARGET);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0f',
      color: '#cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontFamily: '-apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
    }}>
      <div style={{
        fontSize: 11,
        letterSpacing: 6,
        color: '#06b6d4',
        fontFamily: 'monospace',
        fontWeight: 700,
      }}>
        ▎ ROOT14 SCENARIO
      </div>
      <div style={{ fontSize: 16, fontWeight: 300 }}>
        시나리오로 이동 중…
      </div>
      <a
        href={TARGET}
        style={{
          marginTop: 16,
          fontSize: 12,
          color: '#06b6d4',
          textDecoration: 'underline',
          fontFamily: 'monospace',
          letterSpacing: 2,
        }}
      >
        자동 이동이 안 될 경우 클릭 →
      </a>
    </div>
  );
}

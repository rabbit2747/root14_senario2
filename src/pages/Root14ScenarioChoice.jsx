/**
 * Root14ScenarioChoice — derekChae/1_scenario_choice 별도 Vercel 프로젝트로 리다이렉트
 *
 * 원본 앱: https://github.com/derekChae/1_scenario_choice
 * 배포 URL: https://root14-scenario-choice.vercel.app
 *
 * 별도 BrowserRouter·Three.js·zustand 스택을 가진 standalone 앱.
 * 메인 앱과 충돌 없이 통째 외부 deploy로 운영.
 */
import { useEffect } from 'react';

const TARGET = 'https://root14-scenario-choice.vercel.app/gather';

export default function Root14ScenarioChoice() {
  useEffect(() => {
    // 즉시 리다이렉트 (history.replace로 뒤로가기시 무한루프 방지)
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
        ▎ ROOT14 SCENARIO CHOICE
      </div>
      <div style={{ fontSize: 16, fontWeight: 300 }}>
        시나리오 선택 화면으로 이동 중…
      </div>
      <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#475569',
        letterSpacing: 1,
      }}>
        {TARGET}
      </div>
      <a
        href={TARGET}
        style={{
          marginTop: 24,
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

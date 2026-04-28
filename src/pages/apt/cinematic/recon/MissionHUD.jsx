/**
 * MissionHUD — 디오라마 위 HUD 오버레이
 * - 좌상단: 좌표·복셀 카운트
 * - 우상단: 시간·스캔 인디케이터
 * - 하단: 4 stat 카드 (TARGET·ENTRY·ETA·BRANCHES)
 */
import { useEffect, useState } from 'react';

const FONT_HUD_DIGITAL = '"Press Start 2P", monospace';
const FONT_HUD_LABEL = '"Silkscreen", monospace';

export default function MissionHUD({ scenario, voxelCount }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  // 가상의 좌표 (디오라마 카메라 시뮬레이션용)
  const x = (Math.sin(tick * 0.04) * 38).toFixed(2);
  const z = (Math.cos(tick * 0.04) * 38).toFixed(2);
  const y = '22.00';

  return (
    <>
      {/* ── 좌상단: 코드네임 + 좌표 ── */}
      <div className="recon-hud-tl" style={{
        position: 'absolute', top: 16, left: 16,
        fontFamily: FONT_HUD_LABEL,
        color: '#fbbf24',
        fontSize: 10,
        letterSpacing: 1,
        animation: 'hudFadeIn 0.6s ease-out 1.6s both',
      }}>
        <div style={{
          padding: '4px 8px',
          border: '1px solid rgba(251,191,36,0.4)',
          background: 'rgba(8,12,20,0.85)',
          backdropFilter: 'blur(8px)',
          marginBottom: 4,
        }}>
          ▎ RECON LIVE
        </div>
        <div style={{ fontFamily: FONT_HUD_DIGITAL, fontSize: 9, color: '#94a3b8', marginTop: 8, lineHeight: 1.6 }}>
          X {x}<br/>
          Y {y}<br/>
          Z {z}
        </div>
        <div style={{ fontFamily: FONT_HUD_DIGITAL, fontSize: 8, color: '#475569', marginTop: 8 }}>
          VOX  {voxelCount.toLocaleString()}
        </div>
      </div>

      {/* ── 우상단: 시간 + 스캔 ── */}
      <div className="recon-hud-tr" style={{
        position: 'absolute', top: 16, right: 16,
        textAlign: 'right',
        fontFamily: FONT_HUD_LABEL,
        color: '#fbbf24',
        fontSize: 10,
        letterSpacing: 1,
        animation: 'hudFadeIn 0.6s ease-out 1.7s both',
      }}>
        <div style={{
          padding: '4px 8px',
          border: '1px solid rgba(251,191,36,0.4)',
          background: 'rgba(8,12,20,0.85)',
          backdropFilter: 'blur(8px)',
          marginBottom: 4,
        }}>
          ▎ 23:47:12
        </div>
        <div style={{ fontFamily: FONT_HUD_DIGITAL, fontSize: 8, color: '#94a3b8', marginTop: 8, lineHeight: 1.8 }}>
          SCAN <span style={{ color: '#22c55e' }}>●</span><br/>
          THREAT LV  <span style={{ color: '#dc2626' }}>HIGH</span><br/>
          TARGET LOCKED
        </div>
      </div>

      {/* ── 하단: 4 stat 카드 ── */}
      <div className="recon-hud-bottom" style={{
        position: 'absolute',
        bottom: 16, left: 16, right: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
      }}>
        <StatCard label="TARGET"   value="OO BANK"    sub="HQ · 14F"      delay={1.8} />
        <StatCard label="ENTRY"    value="CONTRACTOR" sub="EXT-VPN"       delay={1.95}/>
        <StatCard label="ETA"      value="23:47"      sub="CHANGEOVER 5m" delay={2.1} />
        <StatCard label="BRANCHES" value={String(Object.keys(scenario.choices||{}).length)}
                                   sub="DECISION POINTS" delay={2.25}/>
      </div>

      <style>{`
        @keyframes hudFadeIn {
          from { opacity: 0; transform: translateY(-6px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes hudFadeUp {
          from { opacity: 0; transform: translateY(8px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </>
  );
}

function StatCard({ label, value, sub, delay = 0 }) {
  return (
    <div style={{
      padding: 12,
      background: 'rgba(8,12,20,0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(251,191,36,0.25)',
      // pixel-border: 계단식 박스섀도
      boxShadow: `
        0 0 0 1px rgba(251,191,36,0.15),
        4px 0 0 0 rgba(0,0,0,0.6),
        -4px 0 0 0 rgba(0,0,0,0.6),
        0 4px 0 0 rgba(0,0,0,0.6),
        0 -4px 0 0 rgba(0,0,0,0.6)
      `,
      animation: `hudFadeUp 0.6s ease-out ${delay}s both`,
      fontFamily: FONT_HUD_LABEL,
    }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: '#fbbf24', marginBottom: 6 }}>
        ▎ {label}
      </div>
      <div style={{
        fontFamily: FONT_HUD_DIGITAL,
        fontSize: 12,
        color: '#fefefe',
        marginBottom: 4,
        letterSpacing: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 1 }}>
        {sub}
      </div>
    </div>
  );
}

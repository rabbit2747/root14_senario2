/**
 * DioramaCourse — APT 14단계 복셀 디오라마 코스
 *
 * 좌측: 14 단계 리스트 + 진행률
 * 중앙: 현재 단계 voxel 씬 + objective + visualMetaphor
 * 우측: 핫스팟 학습 패널 (학습자가 클릭한 단서 표시)
 *
 * 사용자=학습자 (방어 관점). 공격 코드·세부 실행 0%.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Lightbulb, Target } from 'lucide-react';

import { VOXEL_STAGES } from './data/stages.voxel';
import { SceneRenderer } from './engine/SceneRenderer';

export default function DioramaCourse() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const currentIndex = useMemo(() => {
    const i = VOXEL_STAGES.findIndex((s) => s.id === stageId);
    return i < 0 ? 0 : i;
  }, [stageId]);
  const stage = VOXEL_STAGES[currentIndex];

  const [discovered, setDiscovered] = useState({}); // { [stageId]: Set<hotspotId> }

  const stageDiscovered = discovered[stage.id] || new Set();
  const correctHotspots = stage.hotspots.filter((h) => h.correct).map((h) => h.id);
  const allCorrectFound = correctHotspots.every((id) => stageDiscovered.has(id));

  const handleHotspot = (id) => {
    setDiscovered((d) => {
      const next = { ...d };
      const set = new Set(next[stage.id] || []);
      set.add(id);
      next[stage.id] = set;
      return next;
    });
  };

  const goto = (idx) => {
    const target = VOXEL_STAGES[idx];
    if (!target) return;
    navigate(`/apt/diorama/${target.id}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06070a',
      color: '#e2e8f0',
      fontFamily: '-apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ─────── 헤더 ─────── */}
      <header style={{
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/apt/scenarios')}
            style={btnGhost}
          >
            <ArrowLeft size={14} /> Hub
          </button>
          <span style={{ color: '#475569' }}>·</span>
          <span style={{
            fontSize: 10,
            letterSpacing: 4,
            color: '#fbbf24',
            fontFamily: 'monospace',
          }}>
            APT VOXEL DIORAMA
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          fontSize: 11,
          fontFamily: 'monospace',
          color: '#94a3b8',
        }}>
          STAGE {String(currentIndex + 1).padStart(2, '0')} / {VOXEL_STAGES.length}
        </div>
      </header>

      {/* ─────── 메인 3컬럼 ─────── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '240px 1fr 320px',
        gap: 16,
        padding: 16,
        minHeight: 0,
      }}>
        {/* ── 좌: 단계 리스트 ── */}
        <aside style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: 8,
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: 9, letterSpacing: 3, color: '#475569',
            fontFamily: 'monospace', padding: '8px 12px',
          }}>
            ▎ 14 STAGES
          </div>
          {VOXEL_STAGES.map((s, i) => {
            const ds = discovered[s.id];
            const isCleared = ds && s.hotspots.filter((h) => h.correct).every((h) => ds.has(h.id));
            const active = i === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => goto(i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  marginBottom: 2,
                  background: active ? 'rgba(251,191,36,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(251,191,36,0.4)' : '1px solid transparent',
                  borderRadius: 6,
                  color: active ? '#fbbf24' : '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.18s',
                }}
              >
                <span style={{
                  fontSize: 9,
                  fontFamily: 'monospace',
                  color: active ? '#fbbf24' : '#475569',
                  width: 22,
                }}>{String(i + 1).padStart(2, '0')}</span>
                {isCleared ? <CheckCircle2 size={12} color="#22c55e" /> : <Circle size={12} color={active ? '#fbbf24' : '#475569'} />}
                <span style={{ flex: 1, fontWeight: active ? 600 : 400 }}>{s.title}</span>
              </button>
            );
          })}
        </aside>

        {/* ── 중: 씬 + objective ── */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minWidth: 0,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {/* 씬 */}
              <div style={{ flex: 1, minHeight: 360 }}>
                <SceneRenderer stage={stage} onHotspot={handleHotspot} />
              </div>

              {/* objective + metaphor */}
              <div style={{
                background: 'rgba(15,23,42,0.55)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={14} color="#fbbf24" />
                  <span style={{ fontSize: 9, letterSpacing: 3, color: '#fbbf24', fontFamily: 'monospace' }}>
                    OBJECTIVE
                  </span>
                </div>
                <div style={{ fontSize: 14, color: '#fefefe', lineHeight: 1.45 }}>
                  {stage.objective}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', lineHeight: 1.5 }}>
                  ▎ {stage.visualMetaphor}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 하단 네비 */}
          <div style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => goto(currentIndex - 1)}
              disabled={currentIndex === 0}
              style={{ ...btnGhost, opacity: currentIndex === 0 ? 0.3 : 1 }}
            >
              <ArrowLeft size={14} /> Prev
            </button>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {VOXEL_STAGES.map((s, i) => {
                const ds = discovered[s.id];
                const isCleared = ds && s.hotspots.filter((h) => h.correct).every((h) => ds.has(h.id));
                return (
                  <span
                    key={s.id}
                    style={{
                      width: 6, height: 6, borderRadius: 3,
                      background: i === currentIndex ? '#fbbf24' : isCleared ? '#22c55e' : '#334155',
                    }}
                  />
                );
              })}
            </div>
            <button
              onClick={() => goto(currentIndex + 1)}
              disabled={currentIndex >= VOXEL_STAGES.length - 1}
              style={{
                ...btnPrimary,
                opacity: currentIndex >= VOXEL_STAGES.length - 1 ? 0.3 : 1,
                background: allCorrectFound ? '#22c55e' : '#fbbf24',
                color: '#0a0e1a',
              }}
            >
              {allCorrectFound ? '✓ Next' : 'Next'} <ArrowRight size={14} />
            </button>
          </div>
        </main>

        {/* ── 우: 핫스팟 학습 패널 ── */}
        <aside style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflowY: 'auto',
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: '#fbbf24', fontFamily: 'monospace', marginBottom: 6 }}>
              ▎ {stage.title.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
              {stage.summary}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}/>

          <div style={{ fontSize: 9, letterSpacing: 3, color: '#475569', fontFamily: 'monospace' }}>
            ▎ HOTSPOTS
          </div>
          {stage.hotspots.map((h) => {
            const found = stageDiscovered.has(h.id);
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '10px 12px',
                  background: found ? (h.correct ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)') : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${found ? (h.correct ? 'rgba(34,197,94,0.4)' : 'rgba(220,38,38,0.4)') : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 6,
                  fontSize: 11,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {found
                    ? <CheckCircle2 size={11} color={h.correct ? '#22c55e' : '#dc2626'} />
                    : <Circle size={11} color="#475569" />}
                  <span style={{ fontWeight: 600, color: found ? '#fefefe' : '#94a3b8' }}>
                    {h.label}
                  </span>
                  {h.correct && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 8,
                      letterSpacing: 1,
                      color: '#22c55e',
                      fontFamily: 'monospace',
                    }}>SIGNAL</span>
                  )}
                </div>
                {found && (
                  <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <Lightbulb size={10} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ lineHeight: 1.5 }}>{h.hint}</span>
                  </div>
                )}
              </motion.div>
            );
          })}

          {allCorrectFound && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 'auto',
                padding: '10px 12px',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.4)',
                borderRadius: 6,
                fontSize: 11,
                color: '#86efac',
              }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>
                ✓ STAGE CLEARED
              </div>
              <div>{stage.summary}</div>
            </motion.div>
          )}
        </aside>
      </div>

      {/* ─────── 하단 안전 고지 ─────── */}
      <footer style={{
        padding: '8px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: 10,
        color: '#475569',
        fontFamily: 'monospace',
        letterSpacing: 1,
        textAlign: 'center',
      }}>
        ▎ DEFENSIVE EDUCATION ONLY · NO OFFENSIVE STEP-BY-STEP · ATT&CK MAPPING
      </footer>
    </div>
  );
}

// ─────── 버튼 토큰 ───────
const btnGhost = {
  background: 'transparent',
  border: '1px solid rgba(100,116,139,0.4)',
  color: '#94a3b8',
  padding: '6px 12px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
  fontFamily: 'monospace',
  letterSpacing: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};
const btnPrimary = {
  background: '#fbbf24',
  border: 'none',
  color: '#0a0e1a',
  padding: '6px 14px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
  fontFamily: 'monospace',
  letterSpacing: 1,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

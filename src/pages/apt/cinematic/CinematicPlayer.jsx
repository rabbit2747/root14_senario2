/**
 * CinematicPlayer — 2D 시네마틱 인터랙티브 플레이어
 * - HTML5 video A/B 두 개로 0.6s 크로스페이드
 * - 영상 없으면 CSS 그라디언트 + 모션 fallback (placeholder)
 * - 21:9 시네마스코프 위아래 검은 바
 * - 분기 결정 카드 → 다음 클립 분기
 * - 1인칭 자막 페이드
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCinematic } from './useCinematic';
import ClipPlayer from './ClipPlayer';
import StartGate from './StartGate';
import SubtitleOverlay from './SubtitleOverlay';
import ChoiceCard from './ChoiceCard';
import EndCredits from './EndCredits';

// 클립 ID로 클립 객체 찾기
const findClip = (clips, id) => clips.find((c) => c.id === id);

export default function CinematicPlayer() {
  const { scenarioId = 'c0024' } = useParams();
  const navigate = useNavigate();
  const scenario = useCinematic(scenarioId);

  // 상태
  const [started, setStarted] = useState(false);
  const [currentId, setCurrentId] = useState(scenario.first || scenario.clips[0]?.id);
  const [layerA, setLayerA] = useState({ id: scenario.first || scenario.clips[0]?.id, fade: 1 });
  const [layerB, setLayerB] = useState({ id: null, fade: 0 });
  const [activeLayer, setActiveLayer] = useState('A'); // 현재 보이는 레이어
  const [activeChoice, setActiveChoice] = useState(null);
  const [chosenPath, setChosenPath] = useState([]);
  const [ended, setEnded] = useState(false);
  const [endingKey, setEndingKey] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const hudTimerRef = useRef(null);

  const currentClip = useMemo(() => findClip(scenario.clips, currentId), [currentId, scenario]);

  // ── 클립 전환 (크로스페이드) ─────────────────
  const transitionTo = useCallback((nextId) => {
    if (!nextId) return;
    const next = findClip(scenario.clips, nextId);
    if (!next) {
      console.warn(`Clip not found: ${nextId}`);
      return;
    }

    if (activeLayer === 'A') {
      setLayerB({ id: nextId, fade: 0 });
      setTimeout(() => {
        setLayerB({ id: nextId, fade: 1 });
        setLayerA((s) => ({ ...s, fade: 0 }));
      }, 30);
      setTimeout(() => setActiveLayer('B'), 600);
    } else {
      setLayerA({ id: nextId, fade: 0 });
      setTimeout(() => {
        setLayerA({ id: nextId, fade: 1 });
        setLayerB((s) => ({ ...s, fade: 0 }));
      }, 30);
      setTimeout(() => setActiveLayer('A'), 600);
    }
    setCurrentId(nextId);

    // ending consequence 감지
    if (next.consequence?.startsWith('ENDING_')) {
      setEndingKey(next.consequence);
    }
  }, [scenario, activeLayer]);

  // ── 클립 끝 → 다음 처리 ────────────────────
  const handleClipEnded = useCallback(() => {
    if (paused) return;
    if (!currentClip) return;
    const next = currentClip.next;
    if (!next) {
      // null = ending
      setEnded(true);
      return;
    }
    if (typeof next === 'string') {
      transitionTo(next);
    } else if (next.choice) {
      setActiveChoice({ id: next.choice, ...scenario.choices[next.choice] });
      setPaused(true);
    }
  }, [currentClip, scenario, transitionTo, paused]);

  // ── 분기 선택 ─────────────────────────────
  const handleChoiceSelect = useCallback((option) => {
    setChosenPath((p) => [...p, option]);
    setActiveChoice(null);
    setPaused(false);
    transitionTo(option.next);
  }, [transitionTo]);

  // ── 다시 보기 ───────────────────────────
  const handleRestart = useCallback(() => {
    setStarted(false);
    setEnded(false);
    setEndingKey(null);
    setChosenPath([]);
    setActiveChoice(null);
    setPaused(false);
    const firstId = scenario.first || scenario.clips[0]?.id;
    setCurrentId(firstId);
    setLayerA({ id: firstId, fade: 1 });
    setLayerB({ id: null, fade: 0 });
    setActiveLayer('A');
  }, [scenario]);

  // ── HUD 자동 숨김 ────────────────────────
  const showHudTemporarily = useCallback(() => {
    setShowHud(true);
    clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => setShowHud(false), 2400);
  }, []);

  useEffect(() => {
    if (!started) return;
    showHudTemporarily();
  }, [started, showHudTemporarily]);

  // ── 키보드 ───────────────────────────────
  useEffect(() => {
    if (!started || activeChoice) return;
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setPaused((p) => !p); showHudTemporarily(); }
      if (e.code === 'Escape') navigate('/apt/scenarios');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, activeChoice, navigate, showHudTemporarily]);

  // ── 21:9 시네마스코프 letterbox 비율 계산 ─
  // 21:9 ≈ 2.33, 16:9 ≈ 1.78 → 16:9 viewport에서 위아래 ~12.5% 검은 바
  const letterboxVh = '12vh';

  // ── 레이어 A·B 클립 객체
  const aClip = layerA.id ? findClip(scenario.clips, layerA.id) : null;
  const bClip = layerB.id ? findClip(scenario.clips, layerB.id) : null;

  // ── 진행 (자막용 currentClip)
  const subtitleText = currentClip?.subtitle;

  // ── 종료 조건
  if (ended) {
    return (
      <EndCredits
        scenario={scenario}
        ending={endingKey ? scenario.endings?.[endingKey] : null}
        chosenPath={chosenPath}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: '#000',
        overflow: 'hidden',
        cursor: showHud || activeChoice ? 'auto' : 'none',
        fontFamily: '-apple-system, sans-serif',
      }}
      onMouseMove={showHudTemporarily}
    >
      {/* 시작 게이트 */}
      {!started && <StartGate scenario={scenario} onStart={() => setStarted(true)} />}

      {/* ── 21:9 영상 영역 (위아래 letterbox 안쪽) ── */}
      <div style={{
        position: 'absolute',
        top: letterboxVh, bottom: letterboxVh, left: 0, right: 0,
        background: '#000',
        overflow: 'hidden',
      }}>
        {/* Layer A */}
        {aClip && (
          <ClipPlayer
            clip={aClip}
            playing={started && !paused && activeLayer === 'A' && !activeChoice}
            onEnded={activeLayer === 'A' ? handleClipEnded : undefined}
            fade={layerA.fade}
          />
        )}
        {/* Layer B */}
        {bClip && (
          <ClipPlayer
            clip={bClip}
            playing={started && !paused && activeLayer === 'B' && !activeChoice}
            onEnded={activeLayer === 'B' ? handleClipEnded : undefined}
            fade={layerB.fade}
          />
        )}

        {/* 자막 (영상 영역 안쪽) */}
        {started && !activeChoice && (
          <SubtitleOverlay text={subtitleText} idKey={currentId} />
        )}

        {/* 분기 카드 (영상 영역 안쪽 풀스크린) */}
        {activeChoice && (
          <ChoiceCard choice={activeChoice} onSelect={handleChoiceSelect} />
        )}
      </div>

      {/* ── 위 letterbox 안 — 헤더 ── */}
      {started && !ended && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: letterboxVh,
          background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
          opacity: showHud ? 1 : 0.3,
          transition: 'opacity 0.5s',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: '#475569', fontFamily: 'monospace' }}>
              APT CINEMATIC · {scenario.id?.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, fontWeight: 300, color: '#94a3b8', letterSpacing: 0.5 }}>
              {scenario.title}
            </div>
          </div>
          <button
            onClick={() => navigate('/apt/scenarios')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(100,116,139,0.4)',
              color: '#94a3b8',
              padding: '4px 10px',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 10,
              letterSpacing: 2,
              fontFamily: 'monospace',
            }}
          >
            ESC · 닫기
          </button>
        </div>
      )}

      {/* ── 아래 letterbox 안 — 컨트롤 ── */}
      {started && !ended && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: letterboxVh,
          background: '#000',
          display: 'flex', alignItems: 'center',
          gap: 16,
          padding: '0 28px',
          opacity: showHud ? 1 : 0.3,
          transition: 'opacity 0.5s',
          zIndex: 10,
        }}>
          {/* 재생/정지 */}
          <button
            onClick={() => setPaused((p) => !p)}
            disabled={!!activeChoice}
            style={{
              width: 28, height: 28, padding: 0,
              background: 'transparent',
              border: '1px solid rgba(100,116,139,0.4)',
              color: '#cbd5e1',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 11,
              opacity: activeChoice ? 0.4 : 1,
            }}
          >{paused ? '▶' : '❚❚'}</button>

          {/* 클립 진행 인디케이터 */}
          <div style={{
            flex: 1,
            display: 'flex', gap: 4,
          }}>
            {scenario.clips.filter((c) => !c.consequence?.startsWith('ENDING_')).slice(0, 12).map((c, i) => {
              const isCurrent = c.id === currentId;
              const isPast = chosenPath.some((p) => p.next === c.id) || (i < scenario.clips.findIndex((cc) => cc.id === currentId));
              return (
                <div key={c.id} style={{
                  flex: 1,
                  height: 2,
                  background: isCurrent ? '#fbbf24' : isPast ? '#475569' : 'rgba(100,116,139,0.2)',
                  boxShadow: isCurrent ? '0 0 6px rgba(251,191,36,0.7)' : 'none',
                  transition: 'all 0.3s',
                }}/>
              );
            })}
          </div>

          {/* 클립 ID */}
          <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', letterSpacing: 2, minWidth: 80, textAlign: 'right' }}>
            ▎ {currentId}
          </div>
        </div>
      )}
    </div>
  );
}

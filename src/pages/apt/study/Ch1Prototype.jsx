// Ch1Prototype — 캠페인 챕터 엔진 (하이브리드 B+E+D)
//
// 구성:
//   - HUD: 일수 / 예산 / 탐지% (D에서 가져옴)
//   - BeatRail: 5 대목 진행 표시 (B 뼈대)
//   - SelectionCard: 미니멀 선택 (D 모드)
//   - ResultCard: 밀도있는 결과 (C 모드 — 3블록 자연어 라벨)
//   - ExpansionShelf: 더 파고들기 서브 카드 (선택)
//
// 데이터 스키마는 chapters/C0024-ch1.js 상단 주석 참고.
// 이 엔진은 데이터에 의존하지 않음 — 다른 캠페인도 같은 엔진 사용 가능.
//
// 🔒 내부 원칙(연계/연관/연결)은 isAdmin 에게만 작은 태그로 노출.
//    학습자는 자연어 라벨(💭 목표 회상 / 🔎 유사 사례 / ▶ 다음 작전)만 본다.

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import chapterData from './chapters/C0024-ch1';

// ══════════════════════════════════════════════════════════════════════
// AdminTag — 내부 원칙 용어는 관리자에게만
// ══════════════════════════════════════════════════════════════════════
function AdminTag({ text, isAdmin, isDark }) {
  if (!isAdmin) return null;
  return (
    <span
      className={`ml-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded align-middle ${
        isDark ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#eee] text-[#888]'
      }`}
      title="관리자 전용 내부 설계 원칙 (학습자 비노출)"
    >
      {text}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════
// HUD — 상단 3수치
// ══════════════════════════════════════════════════════════════════════
function HUD({ days, budget, detection, isDark }) {
  const Cell = ({ label, value, suffix, tone }) => (
    <div
      className={`flex-1 px-4 py-2.5 ${
        isDark ? 'bg-[#0f0f13] border border-[#2a2a2a]' : 'bg-white border border-[#e5e5e5]'
      } rounded-md`}
    >
      <div className={`text-[10px] font-semibold tracking-wider uppercase ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
        {label}
      </div>
      <div className={`text-lg font-bold ${tone}`}>
        {value}
        <span className={`text-xs font-normal ml-0.5 ${isDark ? 'text-[#777]' : 'text-[#999]'}`}>{suffix}</span>
      </div>
    </div>
  );
  const detectionTone =
    detection >= 50 ? 'text-red-500' : detection >= 20 ? 'text-amber-500' : isDark ? 'text-emerald-400' : 'text-emerald-600';
  const daysTone = days <= 60 ? 'text-red-500' : days <= 150 ? 'text-amber-500' : isDark ? 'text-white' : 'text-[#1a1a1a]';
  const budgetTone = budget <= 30 ? 'text-red-500' : budget <= 60 ? 'text-amber-500' : isDark ? 'text-white' : 'text-[#1a1a1a]';

  return (
    <div className="flex gap-2 mb-5">
      <Cell label="남은 작전 일수" value={days} suffix="일" tone={daysTone} />
      <Cell label="가용 자원" value={budget} suffix="/100" tone={budgetTone} />
      <Cell label="누적 탐지 위험" value={detection} suffix="%" tone={detectionTone} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// BeatRail — 5 대목 진행 인디케이터
// ══════════════════════════════════════════════════════════════════════
function BeatRail({ beats, currentIdx, completed, isDark }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {beats.map((b, i) => {
        const isDone = completed.has(b.id);
        const isCurrent = i === currentIdx;
        const isLocked = b.status === 'locked' && !isCurrent;
        return (
          <div key={b.id} className="flex-1 flex items-center gap-1.5">
            <div
              className={`flex-1 rounded-full h-1.5 ${
                isDone
                  ? 'bg-emerald-500'
                  : isCurrent
                  ? isDark ? 'bg-amber-400' : 'bg-amber-500'
                  : isDark ? 'bg-[#2a2a2a]' : 'bg-[#e5e5e5]'
              }`}
            />
            <div
              className={`text-[10px] font-bold whitespace-nowrap ${
                isDone
                  ? 'text-emerald-500'
                  : isCurrent
                  ? isDark ? 'text-amber-300' : 'text-amber-600'
                  : isLocked
                  ? isDark ? 'text-[#555]' : 'text-[#bbb]'
                  : isDark ? 'text-[#888]' : 'text-[#999]'
              }`}
            >
              {b.emoji} {b.num}. {b.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SelectionCard — 미니멀 선택 (D 모드)
// ══════════════════════════════════════════════════════════════════════
function SelectionCard({ decision, onPick, isDark }) {
  return (
    <motion.div
      key={decision.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className={`rounded-xl border-2 p-6 ${
        isDark ? 'bg-[#0f0f13] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'
      }`}
    >
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {decision.question}
      </h3>
      {decision.hint && (
        <div
          className={`text-xs leading-relaxed mb-4 px-3 py-2 rounded ${
            isDark ? 'bg-[#1a1a24] text-[#bbb]' : 'bg-[#faf6ea] text-[#6b5a2e]'
          }`}
        >
          💡 {decision.hint}
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-3">
        {decision.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.25 }}
            onClick={() => onPick(opt)}
            className={`text-left rounded-lg p-4 border-2 transition-all hover:scale-[1.02] ${
              isDark
                ? 'bg-[#1a1a1e] border-[#2a2a2a] hover:border-amber-500 hover:bg-[#1e1e24]'
                : 'bg-[#fafafa] border-[#e5e5e5] hover:border-amber-500 hover:bg-white'
            }`}
          >
            <div className="text-3xl mb-2">{opt.emoji}</div>
            <div className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
              {opt.title}
            </div>
            <div className={`text-xs leading-relaxed ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
              {opt.subtitle}
            </div>
            {opt.ttp?.length > 0 && (
              <div className={`mt-2 flex flex-wrap gap-1`}>
                {opt.ttp.map((t) => (
                  <span
                    key={t}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isDark ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#eee] text-[#888]'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ResultCard — 밀도있는 결과 (C 모드 — 3블록 자연어 라벨)
// ══════════════════════════════════════════════════════════════════════
function ResultCard({ option, onContinue, onRetry, canContinue, isDark, isAdmin }) {
  const r = option.result;
  const hudChanges = [
    r.daysDelta !== 0 && { label: '일수', delta: r.daysDelta, suffix: '일' },
    r.budgetDelta !== 0 && { label: '자원', delta: r.budgetDelta, suffix: '' },
    r.detectionDelta !== 0 && { label: '탐지', delta: r.detectionDelta, suffix: '%' },
  ].filter(Boolean);

  return (
    <motion.div
      key={option.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border-2 p-6 ${
        isDark ? 'bg-[#0f0f13] border-amber-900' : 'bg-white border-amber-200'
      }`}
    >
      {/* 선택 요약 */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-4xl">{option.emoji}</div>
        <div className="flex-1">
          <div className={`text-[10px] font-bold tracking-wider uppercase mb-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            당신의 선택
          </div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
            {option.title}
          </h3>
        </div>
      </div>

      {/* 즉각적 결과 (short + long) */}
      <div
        className={`rounded-lg p-4 mb-4 ${
          isDark ? 'bg-[#1a1a1e] border border-[#2a2a2a]' : 'bg-[#fafafa] border border-[#e5e5e5]'
        }`}
      >
        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          {r.consequenceShort}
        </p>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#bbb]' : 'text-[#555]'}`}>
          {r.consequenceLong}
        </p>
      </div>

      {/* HUD 변화 */}
      {hudChanges.length > 0 && (
        <div className="flex gap-2 mb-4">
          {hudChanges.map((c, i) => {
            const isNeg = c.label === '탐지' ? c.delta > 0 : c.delta < 0;
            const tone = isNeg
              ? isDark ? 'text-red-400 bg-[#2a0f0f]' : 'text-red-700 bg-red-50'
              : isDark ? 'text-emerald-400 bg-[#0f2a1a]' : 'text-emerald-700 bg-emerald-50';
            return (
              <div key={i} className={`flex-1 text-center rounded px-2 py-1.5 text-[11px] font-mono font-bold ${tone}`}>
                {c.label} {c.delta > 0 ? '+' : ''}{c.delta}{c.suffix}
              </div>
            );
          })}
        </div>
      )}

      {/* 학습 포인트 */}
      <div
        className={`rounded-lg p-3 mb-4 border-l-4 ${
          isDark ? 'bg-[#1a1a24] border-purple-500' : 'bg-purple-50 border-purple-400'
        }`}
      >
        <div className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
          📘 공격자 교리
        </div>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
          {r.learning}
        </p>
      </div>

      {/* 💭 목표 회상 (continuity) */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={`rounded-lg p-3 mb-3 border-l-4 ${
          isDark ? 'bg-[#0f1a24] border-blue-500' : 'bg-blue-50 border-blue-400'
        }`}
      >
        <div className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          💭 목표 회상
          <AdminTag text="[연계성 Continuity]" isAdmin={isAdmin} isDark={isDark} />
        </div>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
          {r.continuity}
        </p>
      </motion.div>

      {/* 🔎 유사 사례 (relevance) */}
      {r.relevance?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`rounded-lg p-3 mb-3 border-l-4 ${
            isDark ? 'bg-[#0f241a] border-emerald-500' : 'bg-emerald-50 border-emerald-400'
          }`}
        >
          <div className={`text-[10px] font-bold tracking-wider uppercase mb-1.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
            🔎 비슷한 패턴의 다른 사건들
            <AdminTag text="[연관성 Relevance]" isAdmin={isAdmin} isDark={isDark} />
          </div>
          <ul className="space-y-1.5">
            {r.relevance.map((rel, i) => (
              <li key={i} className={`text-xs ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
                <span className="font-semibold">{rel.label}</span>
                <span className={isDark ? 'text-[#888]' : 'text-[#888]'}> — {rel.note}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ▶ 다음 작전 (coherence) */}
      {r.coherence && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className={`rounded-lg p-3 mb-4 border-2 border-dashed ${
            isDark ? 'bg-[#241a0f] border-amber-700' : 'bg-amber-50 border-amber-400'
          }`}
        >
          <div className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            ▶ 다음 작전 미리보기
            <AdminTag text="[연결성 Coherence]" isAdmin={isAdmin} isDark={isDark} />
          </div>
          <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
            {r.coherence.nextTitle}
          </p>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-[#bbb]' : 'text-[#666]'}`}>
            {r.coherence.nextHint}
          </p>
        </motion.div>
      )}

      {/* 액션 */}
      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isDark
              ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ddd]'
              : 'bg-[#eee] hover:bg-[#ddd] text-[#333]'
          }`}
        >
          ↩ 다시 선택
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            canContinue
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : isDark
              ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed'
              : 'bg-[#eee] text-[#aaa] cursor-not-allowed'
          }`}
        >
          {canContinue ? '다음 결정으로 ▶' : '선택을 확정하려면 "다시 선택"이 아닌 이 선택을 진행하세요'}
        </button>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ExpansionShelf — 더 파고들 학습자용 (선택)
// ══════════════════════════════════════════════════════════════════════
function ExpansionShelf({ items, isDark }) {
  const [openId, setOpenId] = useState(null);
  if (!items?.length) return null;
  return (
    <div className="mt-6">
      <div className={`text-[10px] font-bold tracking-wider uppercase mb-2 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
        🔬 더 파고들기 (선택)
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setOpenId(openId === it.id ? null : it.id)}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
              openId === it.id
                ? isDark ? 'bg-amber-700 text-white' : 'bg-amber-500 text-white'
                : isDark ? 'bg-[#1a1a1e] text-[#bbb] hover:bg-[#2a2a2a]' : 'bg-white text-[#555] border border-[#e5e5e5] hover:bg-[#f5f5f5]'
            }`}
          >
            {it.emoji} {it.title}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {openId && (
          <motion.div
            key={openId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`rounded-lg p-4 text-xs leading-relaxed overflow-hidden ${
              isDark ? 'bg-[#1a1a1e] text-[#ddd] border border-[#2a2a2a]' : 'bg-[#fafafa] text-[#333] border border-[#e5e5e5]'
            }`}
          >
            {items.find((x) => x.id === openId)?.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Ch1Prototype — 최상위 컴포넌트
// ══════════════════════════════════════════════════════════════════════
export default function Ch1Prototype() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('gotroot_theme') === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('gotroot_theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const [beatIdx, setBeatIdx] = useState(0);      // 현재 beat
  const [decisionIdx, setDecisionIdx] = useState(0); // 현재 beat 내 결정 인덱스
  const [pickedOption, setPickedOption] = useState(null); // 현재 보여주는 결과
  const [choiceLog, setChoiceLog] = useState([]); // 전체 선택 기록 (도미노용)

  // HUD 누적 상태
  const hud = useMemo(() => {
    let days = chapterData.hud.totalDays;
    let budget = chapterData.hud.initialBudget;
    let detection = chapterData.hud.initialDetection;
    choiceLog.forEach((entry) => {
      days += entry.result.daysDelta || 0;
      budget += entry.result.budgetDelta || 0;
      detection += entry.result.detectionDelta || 0;
    });
    return {
      days: Math.max(0, days),
      budget: Math.max(0, Math.min(100, budget)),
      detection: Math.max(0, Math.min(100, detection)),
    };
  }, [choiceLog]);

  const currentBeat = chapterData.beats[beatIdx];
  const currentDecision = currentBeat?.required?.[decisionIdx];
  const completed = useMemo(
    () => new Set(choiceLog.filter((c) => c.completesBeat).map((c) => c.beatId)),
    [choiceLog]
  );

  const handlePick = (opt) => {
    setPickedOption(opt);
  };

  const handleRetry = () => {
    setPickedOption(null);
  };

  const handleContinue = () => {
    if (!pickedOption || !currentDecision) return;

    // 선택이 리트라이 유도형인 경우 (coherence.nextTitle === '다시 선택으로'), continue 자체를 막아야 함
    // 하지만 UX상 유저가 "그래도 이걸로 간다"는 의사를 표현할 수 있으니 log에는 남기되 beatIdx는 유지
    const isRetryNudge = pickedOption.result.coherence?.nextTitle === '다시 선택으로';

    const isLastDecisionInBeat = decisionIdx >= (currentBeat.required.length - 1);
    const completesBeat = isLastDecisionInBeat && !isRetryNudge;

    const entry = {
      beatId: currentBeat.id,
      decisionId: currentDecision.id,
      optionId: pickedOption.id,
      result: pickedOption.result,
      completesBeat,
    };

    setChoiceLog((prev) => [...prev, entry]);
    setPickedOption(null);

    if (isRetryNudge) {
      // 같은 결정 유지 — 사용자가 "다시 선택" 누르게 유도
      return;
    }
    if (isLastDecisionInBeat) {
      // 다음 beat
      if (beatIdx < chapterData.beats.length - 1) {
        setBeatIdx(beatIdx + 1);
        setDecisionIdx(0);
      }
    } else {
      setDecisionIdx(decisionIdx + 1);
    }
  };

  const canContinue = !!pickedOption;

  // ──────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#1a0a0f]'
          : 'bg-gradient-to-br from-[#f5f0e5] via-[#efe8d8] to-[#e8dfc8]'
      }`}
      style={{ fontFamily: "'Paperlogy', 'Apple SD Gothic Neo', system-ui, sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => navigate('/apt')}
              className={`text-xs font-semibold ${isDark ? 'text-[#888] hover:text-white' : 'text-[#888] hover:text-[#1a1a1a]'}`}
            >
              ← APT 갤러리
            </button>
            <h1 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
              {chapterData.title}
              <span className={`ml-2 text-sm font-normal ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
                Ch.{chapterData.beats[0].num}–{chapterData.beats.at(-1).num}
              </span>
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
              {chapterData.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <span
                className={`text-[9px] font-mono px-2 py-1 rounded ${
                  isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}
                title="관리자로 로그인됨 — 내부 원칙 태그 표시됨"
              >
                🛠 admin view
              </span>
            )}
            <button
              onClick={() => setIsDark((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold ${
                isDark ? 'bg-[#1a1a1e] text-[#ddd] hover:bg-[#2a2a2a]' : 'bg-white text-[#555] border border-[#e5e5e5] hover:bg-[#f5f5f5]'
              }`}
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        {/* HUD */}
        <HUD days={hud.days} budget={hud.budget} detection={hud.detection} isDark={isDark} />

        {/* BeatRail */}
        <BeatRail beats={chapterData.beats} currentIdx={beatIdx} completed={completed} isDark={isDark} />

        {/* 현재 beat intro */}
        {currentBeat?.intro && decisionIdx === 0 && !pickedOption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`rounded-lg p-4 mb-4 ${
              isDark ? 'bg-[#0f0f13] border border-[#2a2a2a]' : 'bg-white border border-[#e5e5e5]'
            }`}
          >
            <div className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              📜 Beat {currentBeat.num} · {currentBeat.emoji} {currentBeat.title}
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
              {currentBeat.intro}
            </p>
          </motion.div>
        )}

        {/* 본문 — locked beat 은 준비 중 */}
        {currentBeat?.status === 'locked' ? (
          <div
            className={`rounded-xl border-2 border-dashed p-10 text-center ${
              isDark ? 'bg-[#0f0f13] border-[#2a2a2a] text-[#888]' : 'bg-white border-[#ddd] text-[#888]'
            }`}
          >
            <div className="text-4xl mb-2">{currentBeat.emoji}</div>
            <div className={`text-lg font-bold mb-1 ${isDark ? 'text-[#ccc]' : 'text-[#555]'}`}>
              Beat {currentBeat.num} · {currentBeat.title}
            </div>
            <p className="text-sm mb-4">{currentBeat.intro}</p>
            <div className={`text-xs ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
              ⚙️ 준비 중 — Beat 1 톤이 확정되면 이어서 제작합니다
            </div>
            <button
              onClick={() => setBeatIdx(0)}
              className={`mt-4 text-xs px-3 py-1.5 rounded-md font-semibold ${
                isDark ? 'bg-[#2a2a2a] text-[#ddd] hover:bg-[#3a3a3a]' : 'bg-[#eee] text-[#555] hover:bg-[#ddd]'
              }`}
            >
              ↩ Beat 1으로 돌아가기
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {pickedOption ? (
              <ResultCard
                key={`result-${currentDecision.id}-${pickedOption.id}`}
                option={pickedOption}
                onContinue={handleContinue}
                onRetry={handleRetry}
                canContinue={canContinue}
                isDark={isDark}
                isAdmin={isAdmin}
              />
            ) : (
              <SelectionCard
                key={`select-${currentDecision.id}`}
                decision={currentDecision}
                onPick={handlePick}
                isDark={isDark}
              />
            )}
          </AnimatePresence>
        )}

        {/* ExpansionShelf — beat 인트로 영역에 */}
        {currentBeat?.status === 'active' && !pickedOption && decisionIdx === 0 && (
          <ExpansionShelf items={currentBeat.expansion} isDark={isDark} />
        )}

        {/* 관리자 전용 디버그 바 */}
        {isAdmin && choiceLog.length > 0 && (
          <div
            className={`mt-6 rounded-lg p-3 text-[10px] font-mono ${
              isDark ? 'bg-[#0a0a0f] border border-[#2a2a2a] text-[#888]' : 'bg-white border border-[#e5e5e5] text-[#888]'
            }`}
          >
            <div className="font-bold mb-1">🛠 admin · choiceLog (도미노 추적용)</div>
            {choiceLog.map((c, i) => (
              <div key={i}>
                {i + 1}. [{c.beatId}.{c.decisionId}] → {c.optionId}
                {c.result.leavesTrace && <span className="text-amber-500"> · trace: {c.result.leavesTrace}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

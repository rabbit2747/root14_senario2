// VictimScenario — 1인칭 시나리오 엔진
//
// 컨셉: 학습자가 평범한 직원이 되어 업무를 처리한다 → 마지막에 "내가 한 모든 게 공격이었다" 충격.
//
// 🔒 노출 규칙:
//   Scene 1~6: MITRE/공격 설명 0% — 평범한 업무 화면만
//   Scene 7 (결과): 자연어 라벨로 일괄 공개
//   리플레이 토글: 기술번호 + 공격 실체
//
// 데이터 스키마: chapters/C0024-victim.js 상단 주석 참고.
// 다른 시나리오 이식: chapters/{id}-victim.js 작성 + 라우트 변경만.

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import scenarioData from './chapters/C0024-victim';

// ══════════════════════════════════════════════════════════════════════
// SCENE 1 — Mail (Outlook 스타일)
// ══════════════════════════════════════════════════════════════════════
function MailScene({ scene, onAction, isDark }) {
  const c = scene.content;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-lg overflow-hidden border-2 ${
        isDark ? 'bg-[#1a1a1e] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'
      }`}
    >
      {/* 메일 헤더 */}
      <div className={`px-5 py-3 border-b ${isDark ? 'border-[#2a2a2a] bg-[#0f0f13]' : 'border-[#e5e5e5] bg-[#f8f8f8]'}`}>
        <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          {c.subject}
        </h3>
        <div className={`grid grid-cols-[60px_1fr] gap-x-3 gap-y-1 text-xs ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
          <span className="font-semibold">보낸이</span>
          <span>
            {c.from}
            {c.fromVerified && (
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                ✓ 사내 도메인 인증
              </span>
            )}
          </span>
          <span className="font-semibold">받는이</span>
          <span>{c.to}</span>
          <span className="font-semibold">날짜</span>
          <span>{c.date}</span>
        </div>
      </div>

      {/* 메일 본문 */}
      <div className={`px-5 py-4 ${isDark ? 'bg-[#1a1a1e] text-[#ddd]' : 'bg-white text-[#333]'}`}>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{c.body}</pre>
      </div>

      {/* 액션 */}
      <div className={`px-5 py-3 border-t flex gap-2 ${isDark ? 'border-[#2a2a2a] bg-[#0f0f13]' : 'border-[#e5e5e5] bg-[#fafafa]'}`}>
        {c.actions.map((a) => (
          <button
            key={a.id}
            onClick={() => onAction(a.id, a.label)}
            className={`text-sm px-4 py-2 rounded-md font-semibold transition-colors ${
              a.primary
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ddd]' : 'bg-white hover:bg-[#eee] text-[#555] border border-[#e5e5e5]'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SCENE 2 — Progress (Windows Update 스타일)
// ══════════════════════════════════════════════════════════════════════
function ProgressScene({ scene, onAction, isDark }) {
  const c = scene.content;
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (stepIdx >= c.steps.length) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), c.steps[stepIdx].durationMs);
    return () => clearTimeout(t);
  }, [stepIdx, c.steps]);

  const totalDuration = c.steps.reduce((s, x) => s + x.durationMs, 0);
  const elapsed = c.steps.slice(0, stepIdx).reduce((s, x) => s + x.durationMs, 0);
  const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-lg p-6 border-2 ${
        isDark ? 'bg-[#0f0f13] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">⚙️</div>
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>{c.title}</h3>
      </div>

      <div className={`h-2 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#eee]'}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className={`text-xs font-mono mb-4 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>{pct}%</div>

      <ul className="space-y-1.5">
        {c.steps.map((s, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-xs ${
              i < stepIdx ? (isDark ? 'text-emerald-400' : 'text-emerald-700') :
              i === stepIdx ? (isDark ? 'text-amber-300' : 'text-amber-700') :
              isDark ? 'text-[#666]' : 'text-[#aaa]'
            }`}
          >
            <span className="font-mono w-3">{i < stepIdx ? '✓' : i === stepIdx ? '▸' : '·'}</span>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>

      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-4 rounded-lg p-3 flex items-center justify-between ${
            isDark ? 'bg-emerald-900/30 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'
          }`}
        >
          <div className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
            {c.successMessage}
          </div>
          <button
            onClick={() => onAction('confirm-done', '확인')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-1.5 rounded-md"
          >
            확인 ▶
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SCENE 3 — Login (SSO 스타일)
// ══════════════════════════════════════════════════════════════════════
function LoginScene({ scene, onAction, isDark }) {
  const c = scene.content;
  const [pw, setPw] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex justify-center"
    >
      <div
        className={`w-full max-w-md rounded-xl p-6 border-2 shadow-xl ${
          isDark ? 'bg-[#1a1a1e] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'
        }`}
      >
        {c.sessionExpired && (
          <div
            className={`text-[11px] font-semibold mb-3 px-2 py-1 rounded ${
              isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700'
            }`}
          >
            ⚠ 세션이 만료되었습니다. 다시 로그인해주세요.
          </div>
        )}
        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>{c.title}</h3>
        <p className={`text-xs mb-5 ${isDark ? 'text-[#888]' : 'text-[#666]'}`}>{c.subtitle}</p>

        <div className="space-y-3">
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#aaa]' : 'text-[#555]'}`}>
              {c.idLabel}
            </label>
            <input
              defaultValue={c.prefilledId}
              readOnly
              className={`w-full px-3 py-2 text-sm font-mono rounded-md border ${
                isDark ? 'bg-[#0f0f13] border-[#2a2a2a] text-[#aaa]' : 'bg-[#f8f8f8] border-[#e5e5e5] text-[#666]'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#aaa]' : 'text-[#555]'}`}>
              {c.pwLabel}
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder={c.placeholderPw}
              autoFocus
              className={`w-full px-3 py-2 text-sm font-mono rounded-md border ${
                isDark ? 'bg-[#0f0f13] border-[#2a2a2a] text-white placeholder-[#555]' : 'bg-white border-[#e5e5e5] text-[#1a1a1a] placeholder-[#bbb]'
              }`}
            />
          </div>
          <button
            onClick={() => onAction('login-submit', `사번 + 비밀번호 ${pw.length}자`)}
            disabled={pw.length < 4}
            className={`w-full text-sm font-bold py-2.5 rounded-md transition-colors ${
              pw.length >= 4
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : isDark ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed' : 'bg-[#eee] text-[#aaa] cursor-not-allowed'
            }`}
          >
            {c.button}
          </button>
        </div>

        <div className={`mt-4 text-[10px] text-center ${isDark ? 'text-[#666]' : 'text-[#aaa]'}`}>
          ⚠️ 시뮬레이션 — 입력값은 외부로 전송되지 않습니다
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SCENE 4 — Dialog (UAC 스타일 권한 요청)
// ══════════════════════════════════════════════════════════════════════
function DialogScene({ scene, onAction, isDark }) {
  const c = scene.content;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center"
    >
      <div
        className={`w-full max-w-lg rounded-xl border-2 shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#1a1a1e] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'
        }`}
      >
        <div className={`px-5 py-3 border-b flex items-center gap-3 ${isDark ? 'border-[#2a2a2a] bg-[#0f0f13]' : 'border-[#e5e5e5] bg-[#f8f8f8]'}`}>
          <div className="text-2xl">{c.icon}</div>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>{c.title}</h3>
        </div>
        <div className="px-5 py-4">
          <pre className={`whitespace-pre-wrap text-sm leading-relaxed font-sans ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
            {c.body}
          </pre>
          {c.footnote && (
            <p className={`mt-3 text-[11px] italic ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>{c.footnote}</p>
          )}
        </div>
        <div className={`px-5 py-3 border-t flex justify-end gap-2 ${isDark ? 'border-[#2a2a2a] bg-[#0f0f13]' : 'border-[#e5e5e5] bg-[#fafafa]'}`}>
          {c.actions.map((a) => (
            <button
              key={a.id}
              onClick={() => onAction(a.id, a.label)}
              className={`text-sm px-4 py-2 rounded-md font-semibold transition-colors ${
                a.primary
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ddd]' : 'bg-white hover:bg-[#eee] text-[#555] border border-[#e5e5e5]'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SCENE 5 — Download (파일 다운로드 패널)
// ══════════════════════════════════════════════════════════════════════
function DownloadScene({ scene, onAction, isDark }) {
  const c = scene.content;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress >= 100) return;
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 110);
    return () => clearInterval(t);
  }, [progress]);

  const done = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-lg p-5 border-2 ${
        isDark ? 'bg-[#0f0f13] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'
      }`}
    >
      <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>{c.title}</h3>
      <p className={`text-xs mb-4 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>{c.subtitle}</p>

      <ul className="space-y-2 mb-4">
        {c.items.map((it, i) => {
          const itemPct = i === 0 ? progress : i === 1 && done ? 50 : i === 2 && done ? 20 : 0;
          return (
            <li
              key={i}
              className={`rounded-md p-3 flex items-center justify-between gap-3 ${
                isDark ? 'bg-[#1a1a1e] border border-[#2a2a2a]' : 'bg-[#fafafa] border border-[#e5e5e5]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-mono truncate ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>{it.name}</div>
                <div className={`text-[11px] ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>{it.size}</div>
                <div className={`mt-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#eee]'}`}>
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${itemPct}%` }} />
                </div>
              </div>
              <span className={`text-[10px] font-mono w-12 text-right ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
                {itemPct}%
              </span>
            </li>
          );
        })}
      </ul>

      <div className={`text-[11px] italic mb-4 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>{c.note}</div>

      <button
        onClick={() => onAction('skip-download', '백그라운드 진행')}
        disabled={!done}
        className={`w-full text-sm font-bold py-2.5 rounded-md transition-colors ${
          done
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : isDark ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed' : 'bg-[#eee] text-[#aaa] cursor-not-allowed'
        }`}
      >
        {done ? '다른 일을 하러 자리를 비운다 ▶' : '다운로드 진행 중...'}
      </button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SCENE 6 — Background (자리 비움 + ambient 로그)
// ══════════════════════════════════════════════════════════════════════
function BackgroundScene({ scene, onAction, isDark }) {
  const c = scene.content;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= c.ambient.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [shown, c.ambient.length]);

  const done = shown >= c.ambient.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`rounded-lg p-6 border-2 text-center ${
        isDark ? 'bg-[#0a0a0f] border-[#1a1a1e]' : 'bg-[#f8f5ec] border-[#e5e0d2]'
      }`}
    >
      <div className="text-5xl mb-3">☕</div>
      <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>{c.title}</h3>
      <p className={`text-xs mb-4 ${isDark ? 'text-[#888]' : 'text-[#666]'}`}>{c.subtitle}</p>

      <ul
        className={`text-left text-[11px] font-mono space-y-1 mx-auto max-w-md rounded-md p-3 ${
          isDark ? 'bg-[#0f0f13] border border-[#2a2a2a] text-[#888]' : 'bg-white border border-[#e5e5e5] text-[#666]'
        }`}
      >
        {c.ambient.slice(0, shown).map((line, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={
              line.includes('avsvmcloud')
                ? isDark ? 'text-amber-400' : 'text-amber-600'
                : ''
            }
          >
            {line}
          </motion.li>
        ))}
      </ul>

      <button
        onClick={() => onAction('return-to-desk', '자리로 돌아옴')}
        disabled={!done}
        className={`mt-5 text-sm font-bold px-6 py-2 rounded-md transition-colors ${
          done
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : isDark ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed' : 'bg-[#eee] text-[#aaa] cursor-not-allowed'
        }`}
      >
        {done ? '자리로 돌아간다 ▶' : '잠시 자리 비움...'}
      </button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SCENE 7 — Result + Replay
// ══════════════════════════════════════════════════════════════════════
function ResultScene({ scenario, actionLog, onRestart, isDark }) {
  const r = scenario.result;
  const [showReplay, setShowReplay] = useState(false);

  // Scene 7 은 hidden 이 null 이므로 Scene 1~6만 사용
  const replayScenes = scenario.scenes.filter((s) => s.hidden);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* 헤드라인 — 충격 */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`rounded-xl p-6 border-4 ${
          isDark ? 'bg-[#2a0a0a] border-red-800' : 'bg-red-50 border-red-300'
        }`}
      >
        <div className={`text-xs font-bold tracking-[0.2em] uppercase mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
          🚨 SOC ALERT · CRITICAL
        </div>
        <h2 className={`text-3xl font-extrabold mb-2 ${isDark ? 'text-red-200' : 'text-red-900'}`}>
          {r.headline}
        </h2>
        <p className={`text-base font-semibold ${isDark ? 'text-red-300' : 'text-red-800'}`}>{r.subline}</p>
      </motion.div>

      {/* 피해 요약 */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className={`rounded-xl p-5 border-2 ${
          isDark ? 'bg-[#0f0f13] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'
        }`}
      >
        <div className={`text-[10px] font-bold tracking-wider uppercase mb-3 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
          📋 피해 요약
        </div>
        <ul className="grid sm:grid-cols-2 gap-2">
          {r.summary.map((s, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 ${
                isDark ? 'bg-[#1a1a1e]' : 'bg-[#fafafa]'
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className={`flex-1 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>{s.label}</span>
              <span className={`font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>{s.value}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* 💭 당신이 지금 한 행동 (continuity) */}
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className={`rounded-lg p-4 border-l-4 ${
          isDark ? 'bg-[#0f1a24] border-blue-500' : 'bg-blue-50 border-blue-400'
        }`}
      >
        <div className={`text-[10px] font-bold tracking-wider uppercase mb-1.5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          💭 당신이 지금 한 행동
        </div>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>{r.continuity}</p>
      </motion.div>

      {/* 🔎 비슷한 패턴 (relevance) */}
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className={`rounded-lg p-4 border-l-4 ${
          isDark ? 'bg-[#0f241a] border-emerald-500' : 'bg-emerald-50 border-emerald-400'
        }`}
      >
        <div className={`text-[10px] font-bold tracking-wider uppercase mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
          🔎 비슷한 패턴의 다른 사건들
        </div>
        <ul className="space-y-1.5">
          {r.relevance.map((rel, i) => (
            <li key={i} className={`text-sm ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
              <span className="font-bold">{rel.label}</span>
              <span className={isDark ? 'text-[#888]' : 'text-[#888]'}> — {rel.note}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ▶ 다음 챕터 (coherence) */}
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className={`rounded-lg p-4 border-2 border-dashed ${
          isDark ? 'bg-[#241a0f] border-amber-700' : 'bg-amber-50 border-amber-400'
        }`}
      >
        <div className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
          ▶ 다음 챕터 예고
        </div>
        <p className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>{r.coherence.nextTitle}</p>
        <p className={`text-sm ${isDark ? 'text-[#bbb]' : 'text-[#666]'}`}>{r.coherence.nextHint}</p>
      </motion.div>

      {/* 리플레이 토글 */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setShowReplay((v) => !v)}
          className={`flex-1 text-sm font-bold py-2.5 rounded-md transition-colors ${
            isDark ? 'bg-[#1a1a1e] hover:bg-[#2a2a2a] text-white border border-[#2a2a2a]' : 'bg-white hover:bg-[#f5f5f5] text-[#1a1a1a] border border-[#e5e5e5]'
          }`}
        >
          {showReplay ? '🔬 리플레이 닫기' : '🔬 리플레이 — 내가 한 클릭이 무엇이었는지 보기'}
        </button>
        <button
          onClick={onRestart}
          className={`px-4 py-2.5 text-sm font-bold rounded-md transition-colors ${
            isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ddd]' : 'bg-[#eee] hover:bg-[#ddd] text-[#555]'
          }`}
        >
          ↻ 다시 시작
        </button>
      </motion.div>

      {/* 리플레이 패널 — ATT&CK 매핑 + 공격 실체 */}
      <AnimatePresence>
        {showReplay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-xl p-5 border-2 ${
                isDark ? 'bg-[#0a0a0f] border-[#1a1a1e]' : 'bg-[#f8f5ec] border-[#e5e0d2]'
              }`}
            >
              <div className={`text-[10px] font-bold tracking-wider uppercase mb-4 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                🔬 ATT&CK 타임라인 — 9분간 발생한 일
              </div>
              <ol className="space-y-3">
                {replayScenes.map((s, i) => {
                  const userAct = actionLog.find((a) => a.sceneId === s.id);
                  return (
                    <li
                      key={s.id}
                      className={`rounded-lg p-3 border ${isDark ? 'bg-[#0f0f13] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDark ? 'bg-amber-700 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-baseline gap-2 mb-1">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#eee] text-[#888]'}`}>
                              {s.hidden.technique}
                            </span>
                            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                              {s.hidden.tactic} · {s.hidden.techniqueName}
                            </span>
                          </div>
                          {userAct && (
                            <div className={`text-[11px] mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                              👤 당신의 행동: <span className="font-semibold">{userAct.label}</span>
                            </div>
                          )}
                          <div className={`text-[11px] mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                            🦠 실제 발생: <span className="font-semibold">{s.hidden.attack}</span>
                          </div>
                          <p className={`text-xs leading-relaxed mt-1.5 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
                            {s.hidden.replayDescription}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 메인 컨테이너
// ══════════════════════════════════════════════════════════════════════
const SCENE_RENDERERS = {
  mail: MailScene,
  progress: ProgressScene,
  login: LoginScene,
  dialog: DialogScene,
  download: DownloadScene,
  background: BackgroundScene,
};

export default function VictimScenario() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('gotroot_theme') === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('gotroot_theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const [sceneIdx, setSceneIdx] = useState(0);
  const [actionLog, setActionLog] = useState([]);
  const [introDismissed, setIntroDismissed] = useState(false);

  const currentScene = scenarioData.scenes[sceneIdx];

  const recordAndAdvance = (actionId, label) => {
    setActionLog((prev) => [
      ...prev,
      { sceneId: currentScene.id, actionId, label, at: Date.now() },
    ]);
    setSceneIdx((i) => Math.min(i + 1, scenarioData.scenes.length - 1));
    // 다음 화면 진입 시 스크롤 상단
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const restart = () => {
    setSceneIdx(0);
    setActionLog([]);
    setIntroDismissed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Renderer = currentScene.ui !== 'result' ? SCENE_RENDERERS[currentScene.ui] : null;
  const totalActable = scenarioData.scenes.length - 1; // 결과 제외
  const currentNum = currentScene.ui === 'result' ? totalActable : currentScene.num;

  // ──────────────────────────────────────────────────────────────
  // 인트로
  // ──────────────────────────────────────────────────────────────
  if (!introDismissed) {
    return (
      <div
        className={`min-h-screen ${
          isDark
            ? 'bg-gradient-to-br from-[#0a0a0f] via-[#0f0a14] to-[#1a0a14]'
            : 'bg-gradient-to-br from-[#f5f0e5] via-[#efe8d8] to-[#e8dfc8]'
        }`}
        style={{ fontFamily: "'Paperlogy', 'Apple SD Gothic Neo', system-ui, sans-serif" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate('/apt')}
            className={`text-xs font-semibold mb-4 ${isDark ? 'text-[#888] hover:text-white' : 'text-[#888] hover:text-[#1a1a1a]'}`}
          >
            ← APT 갤러리
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-6 border-2 ${isDark ? 'bg-[#0f0f13] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'}`}
          >
            <div className={`text-[10px] font-bold tracking-[0.25em] uppercase mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              🎬 1인칭 시나리오
            </div>
            <h1 className={`text-2xl font-extrabold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
              {scenarioData.name}
            </h1>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
              기반 사건 · {scenarioData.basedOn} · {scenarioData.group}
            </p>

            <div className={`rounded-lg p-4 mb-5 ${isDark ? 'bg-[#1a1a1e]' : 'bg-[#fafafa]'}`}>
              <div className={`text-[10px] font-bold tracking-wider uppercase mb-2 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
                당신의 역할
              </div>
              <p className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {scenarioData.persona.role} · {scenarioData.persona.company}
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-[#bbb]' : 'text-[#555]'}`}>
                {scenarioData.persona.setup}
              </p>
            </div>

            <ul className={`text-xs space-y-1.5 mb-5 ${isDark ? 'text-[#aaa]' : 'text-[#555]'}`}>
              <li>· 평범한 업무 화면들이 순서대로 등장합니다.</li>
              <li>· 어떤 화면에도 "이건 공격입니다" 같은 경고가 없습니다.</li>
              <li>· 마지막에 당신이 한 모든 클릭의 의미가 공개됩니다.</li>
              <li>· 약 {scenarioData.durationMin}분 소요.</li>
            </ul>

            <div className={`text-[10px] mb-4 px-3 py-2 rounded ${isDark ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
              ⚠️ 시뮬레이션 — 어떤 입력도 외부로 전송되지 않습니다.
            </div>

            <button
              onClick={() => setIntroDismissed(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-base font-bold py-3 rounded-md"
            >
              ▶ 월요일 오전 9시 17분, 메일을 연다
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 본 화면
  // ──────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-[#0a0a0f] via-[#0f0a14] to-[#1a0a14]'
          : 'bg-gradient-to-br from-[#f5f0e5] via-[#efe8d8] to-[#e8dfc8]'
      }`}
      style={{ fontFamily: "'Paperlogy', 'Apple SD Gothic Neo', system-ui, sans-serif" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* 미니 상단 바 — 진행만 표시, 공격 정보 0% */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className={`text-[10px] font-mono ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
              {scenarioData.persona.company} · {scenarioData.persona.role}
            </div>
            <div className={`flex items-center gap-1.5 mt-1`}>
              {scenarioData.scenes.slice(0, totalActable).map((s, i) => (
                <div
                  key={s.id}
                  className={`flex-1 h-1 rounded-full ${
                    i < sceneIdx ? 'bg-emerald-500'
                    : i === sceneIdx ? (isDark ? 'bg-amber-400' : 'bg-amber-500')
                    : isDark ? 'bg-[#2a2a2a]' : 'bg-[#e5e5e5]'
                  }`}
                />
              ))}
            </div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
              {currentScene.ui === 'result' ? '결과' : `${currentNum} / ${totalActable}`}
            </div>
          </div>
          <button
            onClick={() => setIsDark((v) => !v)}
            className={`ml-3 text-[10px] px-2 py-1 rounded ${isDark ? 'bg-[#1a1a1e] text-[#888] hover:text-white' : 'bg-white text-[#888] hover:text-[#1a1a1a] border border-[#e5e5e5]'}`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Scene 본체 */}
        <AnimatePresence mode="wait">
          {Renderer ? (
            <div key={currentScene.id}>
              <Renderer scene={currentScene} onAction={recordAndAdvance} isDark={isDark} />
            </div>
          ) : (
            <div key="result">
              <ResultScene scenario={scenarioData} actionLog={actionLog} onRestart={restart} isDark={isDark} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

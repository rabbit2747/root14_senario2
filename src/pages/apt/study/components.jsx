// APT 학습 모드 공용 컴포넌트
// - ExpandableSection: 난이도별 선택적 펼침 섹션 (아코디언)
// - CaseStudyPrompt: 의사결정 지점 (HBS 스타일, 선택→해설 reveal)
// - SocraticQuestion: 질문 먼저, 예측 후 정답 노출
// - MiniQuiz: 체크포인트 다지선다 퀴즈
// - KeyTerm: 용어 툴팁 밑줄
// - Timeline: 공격 단계 타임라인 시각화
// - CalloutBox: 색상 태그 박스 (info/warn/danger/success)

import { useState } from 'react';

// ── 색상 테마 헬퍼 ──
const TONE = {
  info:    { bg: '#3b82f622', border: '#3b82f6', text: '#1d4ed8',   dbg: '#1e3a8a33', dtext: '#93c5fd' },
  warn:    { bg: '#f59e0b22', border: '#f59e0b', text: '#b45309',   dbg: '#78350f33', dtext: '#fcd34d' },
  danger:  { bg: '#ef444422', border: '#ef4444', text: '#b91c1c',   dbg: '#7f1d1d33', dtext: '#fca5a5' },
  success: { bg: '#22c55e22', border: '#22c55e', text: '#15803d',   dbg: '#14532d33', dtext: '#86efac' },
  neutral: { bg: '#6b728022', border: '#6b7280', text: '#374151',   dbg: '#37415133', dtext: '#d1d5db' },
};

function tone(name, isDark) {
  const t = TONE[name] || TONE.neutral;
  return {
    bg: isDark ? t.dbg : t.bg,
    border: t.border,
    text: isDark ? t.dtext : t.text,
  };
}

// ── Callout: 정보/경고 박스 ──
export function CalloutBox({ tone: toneName = 'info', icon, title, children, isDark }) {
  const c = tone(toneName, isDark);
  return (
    <div
      className="rounded-lg p-4 my-4 border-l-4"
      style={{ backgroundColor: c.bg, borderLeftColor: c.border }}
    >
      {title && (
        <div className="flex items-center gap-2 mb-2 text-sm font-bold" style={{ color: c.text }}>
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </div>
      )}
      <div className={`text-sm leading-relaxed ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
        {children}
      </div>
    </div>
  );
}

// ── 펼침 섹션 (난이도별 defaultOpen 제어) ──
export function ExpandableSection({
  title,
  tagLabel,       // 예: "심화", "선택"
  tagColor,       // 예: "#a855f7"
  defaultOpen = false,
  children,
  isDark,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`rounded-lg my-3 overflow-hidden border transition-colors ${
        isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-[#e5e5e5]'
      }`}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-semibold transition-colors ${
          isDark ? 'hover:bg-[#262626] text-white' : 'hover:bg-[#fafafa] text-[#1a1a1a]'
        }`}
      >
        <span
          className="text-xs transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        <span className="flex-1">{title}</span>
        {tagLabel && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: (tagColor || '#6b7280') + '22',
              color: tagColor || '#6b7280',
            }}
          >
            {tagLabel}
          </span>
        )}
      </button>
      {open && (
        <div className={`px-4 pb-4 pt-1 text-sm leading-relaxed ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Case Study: 의사결정 프롬프트 ──
// choices: [{ id, label, correct?:boolean, feedback: string }]
// reveal: 추가 해설 (선택 후 공통 노출)
export function CaseStudyPrompt({ scenario, question, choices = [], reveal, isDark }) {
  const [picked, setPicked] = useState(null);

  return (
    <div
      className={`rounded-lg my-4 p-5 border ${
        isDark ? 'bg-[#1a1a1a] border-[#3a3a3a]' : 'bg-[#fffdf7] border-[#e5dcc0]'
      }`}
    >
      <div
        className={`text-[10px] font-bold tracking-wider mb-2 ${
          isDark ? 'text-amber-400' : 'text-amber-700'
        }`}
      >
        🎬 CASE STUDY
      </div>
      {scenario && (
        <div className={`text-sm mb-3 leading-relaxed ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
          {scenario}
        </div>
      )}
      <div
        className={`text-sm font-bold mb-3 p-3 rounded ${
          isDark ? 'bg-[#2d2d2d] text-white' : 'bg-white text-[#1a1a1a]'
        }`}
      >
        Q. {question}
      </div>
      <div className="space-y-2">
        {choices.map(c => {
          const isPicked = picked?.id === c.id;
          const showResult = picked !== null;
          const isCorrect = c.correct === true;
          return (
            <button
              key={c.id}
              onClick={() => picked === null && setPicked(c)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border-2 ${
                !showResult
                  ? isDark
                    ? 'border-[#3a3a3a] hover:border-blue-500 bg-[#2d2d2d] text-white'
                    : 'border-[#e5e5e5] hover:border-blue-400 bg-white text-[#1a1a1a]'
                  : isPicked
                  ? isCorrect
                    ? isDark
                      ? 'border-green-500 bg-green-900/30 text-green-200'
                      : 'border-green-500 bg-green-50 text-green-900'
                    : isDark
                    ? 'border-red-500 bg-red-900/30 text-red-200'
                    : 'border-red-500 bg-red-50 text-red-900'
                  : isCorrect
                  ? isDark
                    ? 'border-green-700 bg-green-900/10 text-green-300 opacity-70'
                    : 'border-green-300 bg-green-50/50 text-green-800 opacity-70'
                  : isDark
                  ? 'border-[#3a3a3a] bg-[#1a1a1a] text-[#888] opacity-50'
                  : 'border-[#e5e5e5] bg-white text-[#999] opacity-50'
              }`}
            >
              <span className="font-mono font-bold mr-2">{c.id}.</span>
              {c.label}
              {showResult && isCorrect && <span className="ml-2">✅</span>}
              {showResult && isPicked && !isCorrect && <span className="ml-2">❌</span>}
            </button>
          );
        })}
      </div>
      {picked && (
        <div
          className={`mt-4 p-4 rounded-lg text-sm leading-relaxed ${
            isDark ? 'bg-[#2d2d2d] text-[#ddd]' : 'bg-white text-[#333] border border-[#e5e5e5]'
          }`}
        >
          <div className="font-bold mb-1">
            {picked.correct ? '정답 해설' : '선택 피드백'}
          </div>
          <div className="mb-2">{picked.feedback}</div>
          {reveal && (
            <div
              className={`mt-3 pt-3 border-t text-xs ${
                isDark ? 'border-[#444] text-[#bbb]' : 'border-[#e5e5e5] text-[#555]'
              }`}
            >
              <div className="font-bold mb-1">📖 실제 사례에서는…</div>
              <div>{reveal}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Socratic: 예측 → 정답 ──
export function SocraticQuestion({ prompt, hint, answer, isDark }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div
      className={`rounded-lg my-4 p-4 border ${
        isDark ? 'bg-[#1f1f2e] border-[#3a3a5a]' : 'bg-[#f5f3ff] border-[#d8cfff]'
      }`}
    >
      <div
        className={`text-[10px] font-bold tracking-wider mb-2 ${
          isDark ? 'text-purple-300' : 'text-purple-700'
        }`}
      >
        🤔 먼저 예측해 보세요
      </div>
      <div className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {prompt}
      </div>
      {hint && (
        <div className={`text-xs italic mb-3 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
          힌트: {hint}
        </div>
      )}
      <button
        onClick={() => setRevealed(true)}
        disabled={revealed}
        className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
          revealed
            ? isDark
              ? 'bg-[#333] text-[#666] cursor-default'
              : 'bg-[#f0f0f0] text-[#999] cursor-default'
            : isDark
            ? 'bg-purple-700 hover:bg-purple-600 text-white'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        {revealed ? '✓ 공개됨' : '정답 확인 →'}
      </button>
      {revealed && (
        <div
          className={`mt-3 p-3 rounded text-sm leading-relaxed ${
            isDark ? 'bg-[#2d2d3d] text-[#ddd]' : 'bg-white text-[#333] border border-purple-200'
          }`}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

// ── MiniQuiz: 체크포인트 퀴즈 (다지선다) ──
// questions: [{ q, choices: [{id, label}], correctId, explain }]
export function MiniQuiz({ title = '체크포인트 퀴즈', questions = [], isDark, onComplete }) {
  const [answers, setAnswers] = useState({}); // { [qIdx]: choiceId }
  const [submitted, setSubmitted] = useState(false);

  const pick = (qIdx, cid) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qIdx]: cid }));
  };

  const submit = () => {
    setSubmitted(true);
    const correctCount = questions.filter((q, i) => answers[i] === q.correctId).length;
    if (onComplete) onComplete({ correctCount, total: questions.length });
  };

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const correctCount = questions.filter((q, i) => answers[i] === q.correctId).length;

  return (
    <div
      className={`rounded-lg my-4 p-5 border-2 ${
        isDark ? 'bg-[#1a1a1a] border-blue-700' : 'bg-blue-50/30 border-blue-200'
      }`}
    >
      <div
        className={`text-[11px] font-bold tracking-wider mb-3 ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}
      >
        🧠 {title}
      </div>

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi}>
            <div className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
              Q{qi + 1}. {q.q}
            </div>
            <div className="space-y-1.5">
              {q.choices.map(c => {
                const picked = answers[qi] === c.id;
                const isRight = submitted && c.id === q.correctId;
                const isWrong = submitted && picked && c.id !== q.correctId;
                return (
                  <button
                    key={c.id}
                    onClick={() => pick(qi, c.id)}
                    disabled={submitted}
                    className={`w-full text-left px-3 py-2 rounded text-sm border transition-all ${
                      isRight
                        ? isDark
                          ? 'border-green-500 bg-green-900/30 text-green-200'
                          : 'border-green-500 bg-green-50 text-green-900'
                        : isWrong
                        ? isDark
                          ? 'border-red-500 bg-red-900/30 text-red-200'
                          : 'border-red-500 bg-red-50 text-red-900'
                        : picked
                        ? isDark
                          ? 'border-blue-500 bg-blue-900/30 text-white'
                          : 'border-blue-500 bg-blue-50 text-[#1a1a1a]'
                        : isDark
                        ? 'border-[#3a3a3a] bg-[#2d2d2d] text-[#ddd] hover:border-[#555]'
                        : 'border-[#e5e5e5] bg-white text-[#333] hover:border-[#ccc]'
                    }`}
                  >
                    <span className="font-mono font-bold mr-2">{c.id}.</span>
                    {c.label}
                    {isRight && <span className="ml-2">✅</span>}
                    {isWrong && <span className="ml-2">❌</span>}
                  </button>
                );
              })}
            </div>
            {submitted && q.explain && (
              <div
                className={`mt-2 p-3 rounded text-xs leading-relaxed ${
                  isDark ? 'bg-[#2d2d2d] text-[#bbb]' : 'bg-white text-[#555] border border-[#e5e5e5]'
                }`}
              >
                <span className="font-bold">해설: </span>{q.explain}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className={`mt-5 text-sm font-semibold px-5 py-2 rounded-lg transition-colors ${
            allAnswered
              ? isDark
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              : isDark
              ? 'bg-[#333] text-[#666] cursor-not-allowed'
              : 'bg-[#e5e5e5] text-[#999] cursor-not-allowed'
          }`}
        >
          제출하기 ({Object.keys(answers).length}/{questions.length})
        </button>
      ) : (
        <div
          className={`mt-5 p-4 rounded-lg text-sm font-bold ${
            correctCount === questions.length
              ? isDark
                ? 'bg-green-900/30 text-green-200'
                : 'bg-green-50 text-green-900'
              : isDark
              ? 'bg-amber-900/30 text-amber-200'
              : 'bg-amber-50 text-amber-900'
          }`}
        >
          결과: {correctCount} / {questions.length}
          {correctCount === questions.length ? ' · 완벽합니다! 🎉' : ' · 해설을 확인하고 복습해 보세요'}
        </div>
      )}
    </div>
  );
}

// ── 용어 툴팁 (밑줄 hover) ──
export function KeyTerm({ term, definition, isDark }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        className={`cursor-help border-b-2 border-dotted font-semibold ${
          isDark ? 'border-blue-400 text-blue-300' : 'border-blue-500 text-blue-700'
        }`}
      >
        {term}
      </span>
      {open && (
        <span
          className={`absolute z-50 left-0 top-full mt-1 min-w-[220px] max-w-[320px] p-2 rounded shadow-lg text-xs font-normal leading-snug pointer-events-none ${
            isDark ? 'bg-[#1a1a1a] text-[#ddd] border border-[#444]' : 'bg-white text-[#333] border border-[#ddd]'
          }`}
        >
          {definition}
        </span>
      )}
    </span>
  );
}

// ── 타임라인 ──
// steps: [{ time, title, detail, tone? }]
export function Timeline({ steps = [], isDark }) {
  return (
    <div className="relative pl-6 my-4">
      <div
        className={`absolute left-2 top-1 bottom-1 w-0.5 ${
          isDark ? 'bg-[#444]' : 'bg-[#d5d5d5]'
        }`}
      />
      {steps.map((s, i) => {
        const c = tone(s.tone || 'info', isDark);
        return (
          <div key={i} className="relative mb-4 last:mb-0">
            <div
              className="absolute -left-[22px] top-1 w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                borderColor: c.border,
              }}
            />
            <div
              className={`text-[11px] font-mono font-bold mb-0.5`}
              style={{ color: c.text }}
            >
              {s.time}
            </div>
            <div className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
              {s.title}
            </div>
            {s.detail && (
              <div className={`text-xs leading-relaxed ${isDark ? 'text-[#bbb]' : 'text-[#555]'}`}>
                {s.detail}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 레이어 헤더 배지 ──
export function LayerBadge({ num, title, subtitle, isDark }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          isDark ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
        }`}
      >
        {num}
      </div>
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

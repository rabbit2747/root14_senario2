import { useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

/**
 * 인라인 퀴즈 체크포인트
 * questions: [{ question, options: string[], correct: number, explanation }]
 */
export default function QuizCheckpoint({ questions = [], isDark, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];
  if (!q) return null;

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setShowResult(true);
    if (selected === q.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ >= questions.length - 1) {
      setFinished(true);
      onComplete?.();
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className={`rounded-2xl border p-6 text-center ${isDark ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="text-4xl mb-3">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          체크포인트 완료!
        </h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {questions.length}문제 중 <span className="font-bold text-emerald-500">{score}개</span> 정답 ({pct}%)
        </p>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* 진행 표시 */}
      <div className={`px-5 py-3 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          ✅ 체크포인트
        </span>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      <div className="p-5">
        {/* 질문 */}
        <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {q.question}
        </h4>

        {/* 선택지 */}
        <div className="space-y-2 mb-4">
          {q.options.map((opt, i) => {
            let style = isDark ? 'border-gray-700 hover:border-gray-500 text-gray-300' : 'border-gray-200 hover:border-gray-400 text-gray-700';
            if (showResult) {
              if (i === q.correct) style = isDark ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-emerald-500 bg-emerald-50 text-emerald-700';
              else if (i === selected && i !== q.correct) style = isDark ? 'border-red-500 bg-red-900/20 text-red-300' : 'border-red-500 bg-red-50 text-red-700';
            } else if (i === selected) {
              style = isDark ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-blue-500 bg-blue-50 text-blue-700';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${style} ${showResult ? '' : 'cursor-pointer'}`}
              >
                <span className="w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {showResult && i === q.correct ? <Check size={14} /> : showResult && i === selected ? <X size={14} /> : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* 결과 설명 */}
        {showResult && q.explanation && (
          <div className={`p-4 rounded-xl mb-4 text-sm animate-[fadeIn_0.2s_ease-out] ${isDark ? 'bg-blue-900/10 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
            💬 {q.explanation}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end">
          {!showResult ? (
            <button
              onClick={handleConfirm}
              disabled={selected === null}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              정답 확인
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`flex items-center gap-1 px-5 py-2 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              {currentQ >= questions.length - 1 ? '완료' : '다음'} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, Trash2, Play, RotateCcw, Check, X, Lightbulb } from 'lucide-react';

/**
 * 드래그앤드롭 코드 빌더 (스케치 방식)
 * config: {
 *   title, description,
 *   palette: [{ id, code, hint? }],  // 왼쪽 코드 블록 팔레트
 *   correctOrder: string[],           // 정답 순서 (id 배열)
 *   expectedOutput: string,           // 실행 결과 미리보기
 *   language: string                  // 코드 언어 라벨
 * }
 */
export default function CodeSketch({ config, isDark, onComplete }) {
  const { title, description, palette = [], correctOrder = [], expectedOutput = '', language = 'python' } = config || {};

  const [available, setAvailable] = useState(() => palette.map(b => ({ ...b })));
  const [assembled, setAssembled] = useState([]);
  const [result, setResult] = useState(null); // 'success' | 'error' | null
  const [showHint, setShowHint] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const dragItem = useRef(null);

  // 팔레트 → 조립 영역으로 추가
  const addBlock = useCallback((block) => {
    setAssembled(prev => [...prev, { ...block, uid: Date.now() + Math.random() }]);
    setAvailable(prev => prev.filter(b => b.id !== block.id));
    setResult(null);
    setShowOutput(false);
  }, []);

  // 조립 영역에서 제거
  const removeBlock = useCallback((uid) => {
    setAssembled(prev => {
      const block = prev.find(b => b.uid === uid);
      const next = prev.filter(b => b.uid !== uid);
      if (block) {
        setAvailable(av => [...av, { id: block.id, code: block.code, hint: block.hint }]);
      }
      return next;
    });
    setResult(null);
    setShowOutput(false);
  }, []);

  // 실행 (정답 체크)
  const handleRun = () => {
    const userOrder = assembled.map(b => b.id);
    const isCorrect = correctOrder.length === userOrder.length && correctOrder.every((id, i) => id === userOrder[i]);
    setResult(isCorrect ? 'success' : 'error');
    if (isCorrect) {
      setShowOutput(true);
      onComplete?.();
    }
  };

  // 리셋
  const handleReset = () => {
    setAssembled([]);
    setAvailable(palette.map(b => ({ ...b })));
    setResult(null);
    setShowOutput(false);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* 헤더 */}
      <div className={`px-5 py-3 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>🧩 코드 스케치</span>
          {title && <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>— {title}</span>}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
          {language}
        </span>
      </div>

      {description && (
        <div className={`px-5 py-3 text-sm border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          {description}
        </div>
      )}

      <div className="flex flex-col sm:flex-row">
        {/* 왼쪽: 팔레트 */}
        <div className={`sm:w-[40%] p-4 border-b sm:border-b-0 sm:border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            코드 블록 ({available.length}개)
          </div>
          <div className="space-y-2 min-h-[100px]">
            <AnimatePresence>
              {available.map(block => (
                <motion.button
                  key={block.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => addBlock(block)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-[#252525] border-gray-600 text-gray-300 hover:border-purple-500/50' : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-400'}`}
                >
                  <code>{block.code}</code>
                </motion.button>
              ))}
            </AnimatePresence>
            {available.length === 0 && (
              <div className={`text-xs text-center py-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                모든 블록을 배치했습니다!
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 조립 영역 */}
        <div className="sm:w-[60%] p-4">
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            조립 영역 (순서대로 배치)
          </div>

          <div className={`min-h-[150px] rounded-xl border-2 border-dashed p-3 space-y-2 transition-colors ${
            assembled.length === 0
              ? (isDark ? 'border-gray-700' : 'border-gray-200')
              : result === 'success'
                ? 'border-emerald-500/50'
                : result === 'error'
                  ? 'border-red-500/50'
                  : (isDark ? 'border-gray-600' : 'border-gray-300')
          }`}>
            {assembled.length === 0 && (
              <div className={`text-xs text-center py-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                ← 왼쪽에서 코드 블록을 클릭하여 추가하세요
              </div>
            )}
            <Reorder.Group axis="y" values={assembled} onReorder={setAssembled}>
              {assembled.map((block) => (
                <Reorder.Item
                  key={block.uid}
                  value={block}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-mono cursor-grab active:cursor-grabbing ${isDark ? 'bg-[#2a2a2a] border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
                >
                  <GripVertical size={14} className={`flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <code className="flex-1">{block.code}</code>
                  <button onClick={() => removeBlock(block.uid)} className="flex-shrink-0 text-red-400 hover:text-red-300">
                    <Trash2 size={13} />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* 결과 피드백 */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 mt-3 px-4 py-2 rounded-lg text-sm font-semibold ${
                result === 'success'
                  ? (isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                  : (isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700')
              }`}
            >
              {result === 'success' ? <Check size={16} /> : <X size={16} />}
              {result === 'success' ? '정답! 코드가 올바르게 조립되었습니다.' : '순서가 올바르지 않습니다. 다시 시도해보세요.'}
            </motion.div>
          )}

          {/* 실행 결과 미리보기 */}
          {showOutput && expectedOutput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-3 rounded-xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className={`px-3 py-1.5 text-[10px] font-bold border-b ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                실행 결과
              </div>
              <pre className={`p-3 text-xs font-mono whitespace-pre-wrap ${isDark ? 'bg-[#111] text-green-400' : 'bg-gray-900 text-green-400'}`}>
                {expectedOutput}
              </pre>
            </motion.div>
          )}

          {/* 버튼 */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleRun}
              disabled={assembled.length === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              <Play size={13} /> 실행
            </button>
            <button
              onClick={handleReset}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
            >
              <RotateCcw size={13} /> 리셋
            </button>
            <button
              onClick={() => setShowHint(h => !h)}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-amber-700/30 hover:bg-amber-700/50 text-amber-400' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}
            >
              <Lightbulb size={13} /> 힌트
            </button>
          </div>

          {/* 힌트 */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-3 p-3 rounded-lg text-xs ${isDark ? 'bg-amber-900/10 text-amber-300/80' : 'bg-amber-50 text-amber-700'}`}
              >
                💡 첫 번째 블록: <code className={`px-1 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-amber-100'}`}>{palette.find(b => b.id === correctOrder[0])?.code || '...'}</code>
                {correctOrder.length > 1 && <> → 마지막 블록: <code className={`px-1 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-amber-100'}`}>{palette.find(b => b.id === correctOrder[correctOrder.length - 1])?.code || '...'}</code></>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

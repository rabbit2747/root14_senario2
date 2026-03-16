import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CornerDownLeft } from 'lucide-react';

/**
 * 모의 터미널 환경
 * config: {
 *   title, prompt: string,
 *   commands: { [cmd]: { output, success?, next? } },
 *   scenario: [{ instruction, expectedCmd, output, success? }]  // 순차 시나리오
 * }
 */
export default function SimTerminal({ config, isDark, onComplete }) {
  const { title, prompt = 'attacker@kali:~$', commands = {}, scenario = [] } = config || {};

  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const isScenarioMode = scenario.length > 0;
  const currentTask = isScenarioMode ? scenario[scenarioIdx] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const typeOutput = async (text, isError = false) => {
    setIsTyping(true);
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
      setHistory(prev => [...prev, { type: isError ? 'error' : 'output', text: lines[i] }]);
    }
    setIsTyping(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'input', text: `${prompt} ${cmd}` }]);
    setInput('');

    if (isScenarioMode && currentTask) {
      // 시나리오 모드: 정확한 명령어 매칭
      if (cmd === currentTask.expectedCmd || cmd.toLowerCase() === currentTask.expectedCmd?.toLowerCase()) {
        await typeOutput(currentTask.output || '');
        setHistory(prev => [...prev, { type: 'success', text: '✅ 올바른 명령어입니다!' }]);

        if (scenarioIdx >= scenario.length - 1) {
          setCompleted(true);
          setHistory(prev => [...prev, { type: 'success', text: '\n🎉 시나리오를 모두 완료했습니다!' }]);
          onComplete?.();
        } else {
          setScenarioIdx(prev => prev + 1);
        }
      } else {
        await typeOutput(`❌ 예상 명령어가 아닙니다. 힌트: ${currentTask.instruction}`, true);
      }
    } else {
      // 자유 모드: commands 맵에서 매칭
      const cmdEntry = commands[cmd] || commands[cmd.toLowerCase()];
      if (cmdEntry) {
        await typeOutput(cmdEntry.output || '');
        if (cmdEntry.success) {
          setHistory(prev => [...prev, { type: 'success', text: '✅ 명령 성공!' }]);
        }
      } else if (cmd === 'help') {
        const helpText = Object.keys(commands).map(k => `  ${k}`).join('\n');
        await typeOutput(`사용 가능한 명령어:\n${helpText}`);
      } else if (cmd === 'clear') {
        setHistory([]);
      } else {
        await typeOutput(`bash: ${cmd}: command not found\n'help'를 입력하면 사용 가능한 명령어를 볼 수 있습니다.`, true);
      }
    }
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0d0d0d] border-gray-700' : 'bg-gray-900 border-gray-700'}`}>
      {/* 타이틀바 */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
          <Terminal size={12} />
          {title || 'Terminal — Simulation'}
        </div>
      </div>

      {/* 시나리오 태스크 표시 */}
      {isScenarioMode && currentTask && !completed && (
        <div className="px-4 py-2 bg-blue-900/20 border-b border-blue-800/30 text-xs text-blue-300">
          📋 <span className="font-semibold">Task {scenarioIdx + 1}/{scenario.length}:</span>{' '}
          {currentTask.instruction}
        </div>
      )}

      {/* 터미널 출력 */}
      <div
        ref={scrollRef}
        className="h-[250px] sm:h-[300px] overflow-y-auto p-4 font-mono text-xs leading-relaxed"
      >
        {/* 초기 배너 */}
        {history.length === 0 && (
          <div className="text-gray-500 mb-2">
            {isScenarioMode
              ? '시나리오가 시작되었습니다. 지시에 따라 명령어를 입력하세요.'
              : "'help'를 입력하면 사용 가능한 명령어를 볼 수 있습니다."}
          </div>
        )}

        {history.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`whitespace-pre-wrap ${
              line.type === 'input' ? 'text-white'
              : line.type === 'error' ? 'text-red-400'
              : line.type === 'success' ? 'text-emerald-400 font-semibold'
              : 'text-green-400/80'
            }`}
          >
            {line.text}
          </motion.div>
        ))}

        {isTyping && (
          <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
        )}
      </div>

      {/* 입력 */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900/50"
      >
        <span className="text-xs text-emerald-400 font-mono flex-shrink-0">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isTyping || completed}
          placeholder={completed ? '시나리오 완료' : '명령어 입력...'}
          className="flex-1 bg-transparent text-white text-xs font-mono outline-none placeholder-gray-600 disabled:opacity-50"
          autoFocus
        />
        <button type="submit" disabled={isTyping || completed} className="text-gray-500 hover:text-gray-300 disabled:opacity-30">
          <CornerDownLeft size={14} />
        </button>
      </form>
    </div>
  );
}

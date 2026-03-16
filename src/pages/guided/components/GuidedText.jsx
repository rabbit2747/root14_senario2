import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, Info, Code } from 'lucide-react';

/**
 * 일본식 유도 학습 텍스트 컴포넌트
 * - 유도 질문 → 생각 유도 → 답 공개 (scaffolded discovery)
 * - 토글 가능한 상세 설명 블록
 * - 키워드 하이라이트
 */
export default function GuidedText({ content, guidedQuestion, isDark, onComplete }) {
  const [revealedHints, setRevealedHints] = useState(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());

  const toggleHint = (idx) => {
    setRevealedHints(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleBlock = (idx) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (!content) return null;

  const { blocks = [] } = content;

  const ICON_MAP = {
    info: <Info size={16} />,
    warning: <AlertTriangle size={16} />,
    tip: <Lightbulb size={16} />,
    code: <Code size={16} />,
  };

  const STYLE_MAP = {
    info: isDark ? 'bg-blue-900/15 border-blue-500/40 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-800',
    warning: isDark ? 'bg-red-900/15 border-red-500/40 text-red-300' : 'bg-red-50 border-red-300 text-red-800',
    tip: isDark ? 'bg-amber-900/15 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800',
    code: isDark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-800',
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {renderHighlightedText(block.text, isDark)}
              </p>
            );

          case 'heading':
            return (
              <h3 key={idx} className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {block.text}
              </h3>
            );

          case 'callout':
            return (
              <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${STYLE_MAP[block.variant || 'info']}`}>
                <span className="mt-0.5 flex-shrink-0">{ICON_MAP[block.variant || 'info']}</span>
                <div className="text-sm leading-relaxed">{renderHighlightedText(block.text, isDark)}</div>
              </div>
            );

          case 'hint':
            return (
              <div key={idx} className={`rounded-xl border overflow-hidden transition-all ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => toggleHint(idx)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${isDark ? 'hover:bg-[#2a2a2a] text-amber-400' : 'hover:bg-gray-50 text-amber-600'}`}
                >
                  <span>💡 {block.label || '힌트 보기'}</span>
                  {revealedHints.has(idx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {revealedHints.has(idx) && (
                  <div className={`px-4 pb-4 text-sm leading-relaxed animate-[fadeIn_0.2s_ease-out] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {renderHighlightedText(block.text, isDark)}
                  </div>
                )}
              </div>
            );

          case 'toggle':
            return (
              <div key={idx} className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => toggleBlock(idx)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${isDark ? 'hover:bg-[#2a2a2a] text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <span>{block.label}</span>
                  {expandedBlocks.has(idx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedBlocks.has(idx) && (
                  <div className={`px-4 pb-4 text-sm leading-relaxed animate-[fadeIn_0.2s_ease-out] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {renderHighlightedText(block.text, isDark)}
                  </div>
                )}
              </div>
            );

          case 'code':
            return (
              <div key={idx} className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                {block.label && (
                  <div className={`px-4 py-2 text-xs font-mono font-bold border-b ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                    {block.label}
                  </div>
                )}
                <pre className={`p-4 text-xs leading-relaxed overflow-x-auto font-mono ${isDark ? 'bg-[#1a1a1a] text-green-400' : 'bg-gray-50 text-gray-800'}`}>
                  {block.text}
                </pre>
              </div>
            );

          case 'image':
            return (
              <div key={idx} className="flex flex-col items-center gap-2 my-4">
                <div className={`w-full max-w-lg aspect-video rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <span className="text-4xl">{block.emoji || '📷'}</span>
                </div>
                {block.caption && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{block.caption}</span>
                )}
              </div>
            );

          case 'comparison':
            return (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                {(block.items || []).map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.text}</div>
                  </div>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

/** 키워드 하이라이트: **bold** 와 `code` 마크다운 미니 파서 */
function renderHighlightedText(text, isDark) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className={isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-gray-700 text-emerald-400' : 'bg-gray-200 text-emerald-700'}`}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

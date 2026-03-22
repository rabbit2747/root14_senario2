import { useState } from 'react';
import GuidedText from './GuidedText';
import AnimatedFlow from './AnimatedFlow';
import QuizCheckpoint from './QuizCheckpoint';
import CodeSketch from './CodeSketch';
import SimTerminal from './SimTerminal';
import CompletionCelebration from './CompletionCelebration';

/**
 * 챕터 동적 렌더러 — sections 배열의 type별 컴포넌트 매핑
 */
export default function ChapterRenderer({ chapter, onComplete, onNext, onChoiceSelect, isDark, techniqueId, userName, chapterMeta, totalChapters }) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [sectionCompleted, setSectionCompleted] = useState(new Set());

  if (!chapter) return null;

  const sections = chapter.sections || [];
  const currentSection = sections[sectionIdx];
  const isLastSection = sectionIdx === sections.length - 1;
  const allSectionsComplete = sectionCompleted.size >= sections.length;

  const handleSectionComplete = () => {
    setSectionCompleted(prev => new Set([...prev, sectionIdx]));
    if (isLastSection) {
      onComplete?.();
    }
  };

  const handleNextSection = () => {
    if (isLastSection) {
      onComplete?.();
      onNext?.();
    } else {
      setSectionIdx(prev => prev + 1);
    }
  };

  // 섹션 타입 → 컴포넌트 매핑
  const renderSection = (section, idx) => {
    const key = `${chapter.id}-${idx}`;
    const commonProps = { isDark, onComplete: handleSectionComplete };

    switch (section.type) {
      case 'text':
        return <GuidedText key={key} {...commonProps} content={section.content} guidedQuestion={section.guidedQuestion} />;
      case 'animation':
        return <AnimatedFlow key={key} {...commonProps} config={section.config} />;
      case 'quiz':
        return <QuizCheckpoint key={key} {...commonProps} questions={section.questions} />;
      case 'code-sketch':
        return <CodeSketch key={key} {...commonProps} config={section.config} />;
      case 'terminal':
        return <SimTerminal key={key} {...commonProps} config={section.config} />;
      case 'celebration':
        return <CompletionCelebration key={key} {...commonProps} config={section.config} onChoiceSelect={onChoiceSelect} userName={userName} techniqueId={techniqueId} chapterMeta={chapterMeta} totalChapters={totalChapters} />;
      default:
        return <div key={key} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>알 수 없는 섹션 타입: {section.type}</div>;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
      {/* 챕터 헤더 */}
      <div className="mb-8">
        <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-blue-400/60' : 'text-blue-500/60'}`}>
          Chapter {String(chapter.id).padStart(2, '0')}
        </div>
        <h1 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {chapter.title}
        </h1>
        {chapter.subtitle && (
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {chapter.subtitle}
          </p>
        )}
        {/* 유도 질문 배너 */}
        {chapter.guidedQuestion && (
          <div className={`mt-4 p-4 rounded-xl border-l-4 ${isDark ? 'bg-amber-900/10 border-amber-500/50 text-amber-300/90' : 'bg-amber-50 border-amber-400 text-amber-800'}`}>
            <span className="text-lg mr-2">💡</span>
            <span className="text-sm font-medium italic">{chapter.guidedQuestion}</span>
          </div>
        )}
      </div>

      {/* 섹션 진행 표시 */}
      {sections.length > 1 && (
        <div className="flex gap-1.5 mb-6">
          {sections.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < sectionIdx ? (isDark ? 'bg-emerald-500' : 'bg-emerald-400')
                : i === sectionIdx ? (isDark ? 'bg-blue-500' : 'bg-blue-400')
                : (isDark ? 'bg-gray-700' : 'bg-gray-200')
              }`}
            />
          ))}
        </div>
      )}

      {/* 현재 섹션 렌더 */}
      <div className="animate-[fadeIn_0.3s_ease-out]" key={`section-${chapter.id}-${sectionIdx}`}>
        {currentSection && renderSection(currentSection, sectionIdx)}
      </div>

      {/* 다음 버튼 */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNextSection}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
          }`}
        >
          {isLastSection ? '다음 챕터로 →' : '계속 →'}
        </button>
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

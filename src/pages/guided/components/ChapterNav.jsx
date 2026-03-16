import { useMemo } from 'react';
import { ChevronRight, Check, Lock, BookOpen } from 'lucide-react';

/**
 * 챕터 네비게이션 사이드바
 * Props: chapters (배열), currentChapter (번호), completedChapters (Set), onSelect, isDark
 */
export default function ChapterNav({ chapters, currentChapter, completedChapters, onSelect, isDark, isOpen, onToggle }) {
  const attackChapters = useMemo(() => chapters.filter(c => c.id <= 9), [chapters]);
  const defenseChapters = useMemo(() => chapters.filter(c => c.id >= 10), [chapters]);

  // 챕터9 완료 없이 10+ 진입 불가
  const isDefenseUnlocked = completedChapters.has(9);

  return (
    <>
      {/* 모바일 토글 버튼 */}
      <button
        onClick={onToggle}
        className={`lg:hidden fixed top-16 left-3 z-50 p-2 rounded-lg border shadow-lg transition-all ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-600'}`}
      >
        <BookOpen size={18} />
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={onToggle} />
      )}

      {/* 사이드바 */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full lg:h-auto z-40 lg:z-auto
        w-[280px] flex-shrink-0 border-r overflow-y-auto
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#fafaf8] border-gray-200'}
      `}>
        {/* 헤더 */}
        <div className={`sticky top-0 z-10 px-4 py-3 border-b ${isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#fafaf8] border-gray-200'}`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Chapters
          </div>
        </div>

        {/* 공격 파트 */}
        <div className="px-2 py-2">
          <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-red-400/70' : 'text-red-500/70'}`}>
            🗡️ 공격자 파트
          </div>
          {attackChapters.map(ch => (
            <ChapterItem
              key={ch.id}
              chapter={ch}
              isCurrent={currentChapter === ch.id}
              isCompleted={completedChapters.has(ch.id)}
              isLocked={false}
              isDark={isDark}
              onClick={() => onSelect(ch.id)}
            />
          ))}
        </div>

        {/* 구분선 */}
        <div className={`mx-4 my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

        {/* 방어 파트 */}
        <div className="px-2 py-2">
          <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-blue-400/70' : 'text-blue-500/70'}`}>
            🛡️ 방어자 / 우회 파트
          </div>
          {defenseChapters.map(ch => (
            <ChapterItem
              key={ch.id}
              chapter={ch}
              isCurrent={currentChapter === ch.id}
              isCompleted={completedChapters.has(ch.id)}
              isLocked={!isDefenseUnlocked}
              isDark={isDark}
              onClick={() => isDefenseUnlocked && onSelect(ch.id)}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function ChapterItem({ chapter, isCurrent, isCompleted, isLocked, isDark, onClick }) {
  const statusIcon = isLocked
    ? <Lock size={13} className="text-gray-500" />
    : isCompleted
      ? <Check size={13} className="text-emerald-500" />
      : isCurrent
        ? <ChevronRight size={13} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
        : <span className={`w-[13px] h-[13px] rounded-full border-2 inline-block ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] transition-all duration-150
        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'}
        ${isCurrent
          ? (isDark ? 'bg-blue-900/30 text-blue-300 font-semibold' : 'bg-blue-50 text-blue-700 font-semibold')
          : isCompleted
            ? (isDark ? 'text-emerald-400/80 hover:bg-[#2a2a2a]' : 'text-emerald-600/80 hover:bg-gray-50')
            : (isDark ? 'text-gray-400 hover:bg-[#2a2a2a]' : 'text-gray-600 hover:bg-gray-50')
        }
      `}
    >
      <span className="flex-shrink-0 w-5 flex justify-center">{statusIcon}</span>
      <span className="flex-1 leading-tight">
        <span className={`text-[10px] font-bold block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          CH.{String(chapter.id).padStart(2, '0')}
        </span>
        {chapter.title}
      </span>
    </button>
  );
}

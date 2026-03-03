import { useState, useRef, useEffect } from 'react';
import { getEmojiUI } from '../../lib/i18n';

// ── 이모티콘 카테고리별 그룹 (title은 i18n 키로 참조) ──
const EMOJI_GROUPS = [
  {
    label: '😀',
    titleKey: 'smile',
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','🤩','🥳','😏','😒','😔','😢','😭','😤','🤔','🤗','🫡','🙄','😴','🤮','🥶','🥵','😱','🤯'],
  },
  {
    label: '👍',
    titleKey: 'gesture',
    emojis: ['👍','👎','👏','🙌','🤝','✌️','🤞','🫶','💪','🙏','👋','🫵','☝️','👆','👇','👈','👉','🖐️','✋','🤚'],
  },
  {
    label: '❤️',
    titleKey: 'heart',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💖','💗','💘','💝','⭐','🌟','✨','🔥','💯','💥','⚡','🎯','🏆','🎉','🎊','🎁','🎈','🏅','👑'],
  },
  {
    label: '🔧',
    titleKey: 'tech',
    emojis: ['💻','🖥️','⌨️','🖱️','🔒','🔓','🛡️','⚠️','🚨','📡','🔑','🗝️','🔧','🔨','⚙️','🧲','💾','📊','📈','🐛','🐞','🧪','🔬','🏴‍☠️','💀','👾','🤖','🧑‍💻','📌','📎'],
  },
];

/**
 * EmojiPicker — 인라인 이모티콘 팔레트
 * @param {Function} onSelect - 이모지 선택 시 콜백 (emoji string)
 * @param {boolean} disabled - 비활성화 여부
 */
export default function EmojiPicker({ onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const ref = useRef(null);
  const t = getEmojiUI();

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (emoji) => {
    onSelect(emoji);
    // 팔레트 열어둔 채로 연속 입력 가능
  };

  return (
    <div className="relative inline-block" ref={ref}>
      {/* 토글 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        disabled={disabled}
        className={`text-[16px] px-1.5 py-0.5 rounded transition-all ${
          open
            ? 'bg-blue-100 scale-110'
            : 'hover:bg-slate-100 opacity-60 hover:opacity-100'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title={t.title}
      >
        😊
      </button>

      {/* 팔레트 드롭다운 */}
      {open && (
        <div
          className="absolute top-full mt-1 left-0 z-50 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
          style={{ width: 260 }}
        >
          {/* 카테고리 탭 */}
          <div className="flex border-b border-slate-100 px-1 py-1 gap-0.5 bg-slate-50/50">
            {EMOJI_GROUPS.map((g, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveGroup(i)}
                className={`flex-1 text-center text-[14px] py-1 rounded-md transition-all ${
                  activeGroup === i
                    ? 'bg-white shadow-sm scale-105'
                    : 'hover:bg-white/60'
                }`}
                title={t[g.titleKey]}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* 이모지 그리드 */}
          <div className="p-2 grid grid-cols-7 gap-0.5 max-h-[160px] overflow-y-auto">
            {EMOJI_GROUPS[activeGroup].emojis.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(emoji)}
                className="text-[18px] w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-50 hover:scale-110 transition-all active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

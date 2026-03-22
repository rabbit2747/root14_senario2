import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAnnouncements from '../hooks/useAnnouncements';
import { timeAgo as i18nTimeAgo, formatDate as i18nFormatDate, getAnnounceUI, getCatLabel } from '../lib/i18n';
import { List, Document, Renew, ToolKit, Events, WarningAlt, MailAll, PinFilled, ChevronDown } from '@carbon/icons-react';

const CATEGORY_IDS = ['all', 'general', 'update', 'maintenance', 'event', 'important'];
const CATEGORY_ICONS = { all: List, general: Document, update: Renew, maintenance: ToolKit, event: Events, important: WarningAlt };

const CATEGORY_STYLE = {
  general:     { bg: 'bg-slate-100', text: 'text-slate-600' },
  update:      { bg: 'bg-blue-50',   text: 'text-blue-600' },
  maintenance: { bg: 'bg-amber-50',  text: 'text-amber-600' },
  event:       { bg: 'bg-purple-50', text: 'text-purple-600' },
  important:   { bg: 'bg-red-50',    text: 'text-red-600' },
};

export default function Announcements() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { announcements, loading, deleteAnnouncement } = useAnnouncements(100);
  const t = getAnnounceUI();

  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // 카테고리 필터 라벨 (다국어)
  const categories = useMemo(() =>
    CATEGORY_IDS.map(id => ({
      id,
      icon: CATEGORY_ICONS[id],
      label: id === 'all'
        ? t.all
        : getCatLabel(id).replace(/^🚨\s*/, ''),  // 필터에선 emoji 제거 (아이콘 별도)
    })),
  [t]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return announcements;
    return announcements.filter(a => a.category === activeCategory);
  }, [announcements, activeCategory]);

  const handleDelete = async (id) => {
    if (!confirm(t.deleteConfirm)) return;
    setDeleting(id);
    await deleteAnnouncement(id);
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold transition-colors"
            >
              ← Matrix
            </button>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <img
                src="/logo/root14-logo.svg"
                alt="ROOT14"
                style={{ width: 28, height: 28, objectFit: 'contain' }}
                draggable={false}
              />
              <h1 className="text-sm font-black tracking-wider text-slate-800">{t.title}</h1>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {filtered.length}{t.items}
          </span>
        </div>
      </header>

      {/* 카테고리 필터 */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 flex gap-1 overflow-x-auto py-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {(() => { const CatIcon = cat.icon; return <CatIcon size={16} />; })()}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 공지 리스트 */}
      <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MailAll size={32} className="mb-3" />
            <p className="text-sm font-bold">{t.noAnn}</p>
            <p className="text-xs mt-1">{t.noAnnHint}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ann => {
              const cat = CATEGORY_STYLE[ann.category] || CATEGORY_STYLE.general;
              const isExpanded = expandedId === ann.id;

              return (
                <div
                  key={ann.id}
                  className={`bg-white rounded-xl border shadow-sm transition-all ${
                    ann.category === 'important'
                      ? 'border-red-300 bg-red-50/30 ring-1 ring-red-100'
                      : ann.is_pinned ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
                  } ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}
                >
                  {/* 카드 헤더 (클릭으로 펼침/접힘) */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                    className="w-full px-5 py-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      {ann.is_pinned && (
                        <span className="text-sm mt-0.5 shrink-0"><PinFilled size={16} /></span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                            {getCatLabel(ann.category)}
                          </span>
                          <h3 className="text-[14px] font-bold text-slate-800 truncate">
                            {ann.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {i18nFormatDate(ann.created_at)}
                          </span>
                          <span className="text-[11px] text-slate-300">
                            ({i18nTimeAgo(ann.created_at)})
                          </span>
                        </div>
                        {!isExpanded && (
                          <p className="text-[12px] text-slate-400 mt-1.5 truncate">
                            {ann.content.length > 100 ? ann.content.slice(0, 100) + '...' : ann.content}
                          </p>
                        )}
                      </div>
                      <span className={`text-slate-300 text-xs transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={12} />
                      </span>
                    </div>
                  </button>

                  {/* 펼친 내용 */}
                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                      <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </p>
                      {isAdmin && (
                        <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }}
                            disabled={deleting === ann.id}
                            className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors"
                          >
                            {deleting === ann.id ? t.deleting : t.delete}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 푸터 */}
      <div className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-full mx-auto px-4 lg:px-6 2xl:px-8 py-4 text-center">
          <p className="text-[10px] text-slate-400">
            © 2026 ROOT14 Academy — ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}

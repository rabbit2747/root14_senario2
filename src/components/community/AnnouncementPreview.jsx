import { useNavigate } from 'react-router-dom';
import useAnnouncements from '../../hooks/useAnnouncements';
import { timeAgo as i18nTimeAgo, getAnnounceUI, getCatLabel } from '../../lib/i18n';

const CATEGORY_STYLE = {
  general:     { bg: 'bg-slate-100', text: 'text-slate-600' },
  update:      { bg: 'bg-blue-50',   text: 'text-blue-600' },
  maintenance: { bg: 'bg-amber-50',  text: 'text-amber-600' },
  event:       { bg: 'bg-purple-50', text: 'text-purple-600' },
  important:   { bg: 'bg-red-50',    text: 'text-red-600' },
};

export default function AnnouncementPreview() {
  const { announcements, loading } = useAnnouncements(5);
  const navigate = useNavigate();
  const t = getAnnounceUI();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-base">📢</span>
          <h3 className="text-sm font-black text-slate-800 tracking-wide">{t.title}</h3>
        </div>
        <button
          onClick={() => navigate('/announcements')}
          className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
        >
          {t.viewAll}
        </button>
      </div>

      {/* 공지 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="text-2xl mb-2">📭</span>
            <p className="text-xs font-bold">{t.empty}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {announcements.map(ann => {
              const cat = CATEGORY_STYLE[ann.category] || CATEGORY_STYLE.general;
              return (
                <li
                  key={ann.id}
                  onClick={() => navigate('/announcements')}
                  className="px-5 py-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    {/* 고정 아이콘 */}
                    {ann.is_pinned && (
                      <span className="text-[10px] mt-0.5 shrink-0" title={t.pinned}>📌</span>
                    )}
                    <div className="flex-1 min-w-0">
                      {/* 제목 + 카테고리 */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                          {getCatLabel(ann.category)}
                        </span>
                        <h4 className="text-[13px] font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                          {ann.title}
                        </h4>
                      </div>
                      {/* 미리보기 + 시간 */}
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-slate-400 truncate flex-1">
                          {ann.content.length > 60 ? ann.content.slice(0, 60) + '...' : ann.content}
                        </p>
                        <span className="text-[10px] text-slate-300 whitespace-nowrap shrink-0">
                          {i18nTimeAgo(ann.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ── 레벨 메타 ──
const LEVEL_META = {
  novice:       { emoji: '🟡', ko: '입문',     en: 'Novice',       color: '#eab308', rank: 1 },
  beginner:     { emoji: '🟢', ko: '초급',     en: 'Beginner',     color: '#22c55e', rank: 2 },
  intermediate: { emoji: '🔵', ko: '중급',     en: 'Intermediate', color: '#3b82f6', rank: 3 },
  advanced:     { emoji: '🔴', ko: '고급',     en: 'Advanced',     color: '#ef4444', rank: 4 },
  expert:       { emoji: '⭐', ko: '전문가',   en: 'Expert',       color: '#a855f7', rank: 5 },
};
const LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];

// ── macOS 윈도우 래퍼 (RecommendedCoursePage와 동일 패턴) ──
function PageWrapper({ children, isDark, toggleTheme, onClose }) {
  return (
    <div className={`min-h-[100dvh] flex flex-col justify-center items-center transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#F4F1EA]'}`}>
      <div className={`w-[95%] max-w-[1100px] max-h-[92dvh] flex flex-col rounded-xl z-10 transition-all duration-300 ${isDark ? 'bg-[#242424] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]' : 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]'}`}>
        <div className={`h-12 flex-shrink-0 flex items-center px-5 relative border-b rounded-t-xl ${isDark ? 'bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] border-[#111]' : 'bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1]'}`}>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-70 transition-opacity"
              title="홈으로"
            />
            <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className={`absolute w-full text-center left-0 text-sm font-semibold pointer-events-none ${isDark ? 'text-[#a1a1aa]' : 'text-[#4d4d4d]'}`}>
            APT_Gallery.app
          </div>
          <button
            onClick={toggleTheme}
            className={`ml-auto z-10 text-lg transition-transform hover:scale-110 ${isDark ? 'text-yellow-400' : 'text-slate-600'}`}
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ── 카드 컴포넌트 ──
function CampaignCard({ campaign, isDark, onClick }) {
  const levelMeta = LEVEL_META[campaign.level] || LEVEL_META.intermediate;
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${
        isDark
          ? 'bg-[#2d2d2d] hover:bg-[#333] border border-[#3a3a3a] hover:border-[#555]'
          : 'bg-[#fafafa] hover:bg-white border border-[#e5e5e5] hover:border-[#ccc] shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isDark ? 'bg-[#1a1a1a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'}`}>
          {campaign.attackId}
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: levelMeta.color + '22', color: levelMeta.color }}
        >
          {levelMeta.emoji} {levelMeta.ko}
        </span>
      </div>
      <h3 className={`text-base font-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {campaign.name}
      </h3>
      {campaign.aliases?.length > 1 && (
        <p className={`text-xs mb-3 line-clamp-1 ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
          {campaign.aliases.slice(1, 3).join(' · ')}
        </p>
      )}
      <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
        <span>큐레이션 <b style={{ color: isDark ? '#fbbf24' : '#d97706' }}>{campaign.curationScore}</b>/100</span>
        <span>난이도 <b style={{ color: levelMeta.color }}>{campaign.difficultyScore}</b>/100</span>
      </div>
    </button>
  );
}

// ── 메인 페이지 ──
export default function AptGalleryPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState('all');
  const [limit, setLimit] = useState(5); // MVP: 상위 5개만
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('gotroot_theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    fetch('/data/apt/campaigns.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => { setCampaigns(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const toggleTheme = () => {
    setIsDark(v => {
      try { localStorage.setItem('gotroot_theme', !v ? 'dark' : 'light'); } catch {}
      return !v;
    });
  };

  const filtered = useMemo(() => {
    let arr = levelFilter === 'all' ? campaigns : campaigns.filter(c => c.level === levelFilter);
    return arr.slice(0, limit);
  }, [campaigns, levelFilter, limit]);

  const levelCounts = useMemo(() => {
    const counts = { all: campaigns.length };
    LEVELS.forEach(l => { counts[l] = campaigns.filter(c => c.level === l).length; });
    return counts;
  }, [campaigns]);

  return (
    <PageWrapper isDark={isDark} toggleTheme={toggleTheme} onClose={() => navigate('/')}>
      <div className={`p-6 md:p-8 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <h1 className="text-2xl md:text-3xl font-bold">APT 캠페인 갤러리</h1>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isDark ? 'bg-[#1a1a1a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'}`}>
              MVP
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
            MITRE ATT&CK 실제 공격 사례 기반 학습 큐레이션. 큐레이션 우선순위 상위 {limit}개 표시.
          </p>
        </div>

        {/* 레벨 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setLevelFilter('all')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              levelFilter === 'all'
                ? (isDark ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white')
                : (isDark ? 'bg-[#2d2d2d] text-[#aaa] hover:bg-[#333]' : 'bg-[#f0f0f0] text-[#666] hover:bg-[#e0e0e0]')
            }`}
          >
            전체 ({levelCounts.all})
          </button>
          {LEVELS.map(l => {
            const m = LEVEL_META[l];
            const active = levelFilter === l;
            return (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                disabled={levelCounts[l] === 0}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                style={{
                  backgroundColor: active ? m.color : (isDark ? '#2d2d2d' : '#f0f0f0'),
                  color: active ? '#fff' : m.color,
                  border: `1px solid ${active ? m.color : 'transparent'}`,
                }}
              >
                {m.emoji} {m.ko} ({levelCounts[l] || 0})
              </button>
            );
          })}
        </div>

        {/* 콘텐츠 */}
        {loading && (
          <div className={`text-center py-16 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent mb-3"></div>
            <p className="text-sm">데이터 로딩 중…</p>
          </div>
        )}

        {error && (
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
            <p className="font-semibold mb-1">⚠️ 데이터 로딩 실패</p>
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-[#888]' : 'text-[#999]'}`}>
            <p>선택한 레벨에 해당하는 캠페인이 없습니다.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => (
                <CampaignCard
                  key={c.attackId}
                  campaign={c}
                  isDark={isDark}
                  onClick={() => navigate(`/apt/${c.attackId}`)}
                />
              ))}
            </div>

            {/* 더보기 */}
            {levelFilter === 'all' && campaigns.length > limit && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setLimit(v => Math.min(v + 5, campaigns.length))}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-[#2d2d2d] hover:bg-[#333] text-white' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a]'
                  }`}
                >
                  더 보기 (+5)
                </button>
                <p className={`text-[10px] mt-2 ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
                  전체 {campaigns.length}개 중 {limit}개 표시 중
                </p>
              </div>
            )}
          </>
        )}

        {/* 푸터 안내 */}
        <div className={`mt-8 pt-6 border-t text-[11px] text-center ${isDark ? 'border-[#333] text-[#666]' : 'border-[#e5e5e5] text-[#999]'}`}>
          MVP — 캠페인 상세 페이지 및 학습 콘텐츠 연동은 단계별로 추가됩니다.
        </div>
      </div>
    </PageWrapper>
  );
}

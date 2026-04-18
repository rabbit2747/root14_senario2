import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LEVEL_META = {
  novice:       { emoji: '🟡', ko: '입문',     color: '#eab308' },
  beginner:     { emoji: '🟢', ko: '초급',     color: '#22c55e' },
  intermediate: { emoji: '🔵', ko: '중급',     color: '#3b82f6' },
  advanced:     { emoji: '🔴', ko: '고급',     color: '#ef4444' },
  expert:       { emoji: '⭐', ko: '전문가',   color: '#a855f7' },
};

function PageWrapper({ children, isDark, toggleTheme, onClose, title }) {
  return (
    <div className={`min-h-[100dvh] flex flex-col justify-center items-center transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#F4F1EA]'}`}>
      <div className={`w-[95%] max-w-[950px] max-h-[92dvh] flex flex-col rounded-xl z-10 transition-all duration-300 ${isDark ? 'bg-[#242424] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]' : 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]'}`}>
        <div className={`h-12 flex-shrink-0 flex items-center px-5 relative border-b rounded-t-xl ${isDark ? 'bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] border-[#111]' : 'bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1]'}`}>
          <div className="flex gap-2">
            <button onClick={onClose} className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-70" title="갤러리로" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className={`absolute w-full text-center left-0 text-sm font-semibold pointer-events-none ${isDark ? 'text-[#a1a1aa]' : 'text-[#4d4d4d]'}`}>
            {title || 'APT_Detail.app'}
          </div>
          <button onClick={toggleTheme} className={`ml-auto z-10 text-lg hover:scale-110 transition ${isDark ? 'text-yellow-400' : 'text-slate-600'}`}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max, color, isDark }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <div className="mb-3">
      <div className={`flex justify-between text-xs mb-1 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
        <span>{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{score}/{max}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'}`}>
        <div className="h-full rounded-full transition-all" style={{ width: pct + '%', backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AptDetailPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('gotroot_theme') === 'dark'; } catch { return false; }
  });
  const toggleTheme = () => {
    setIsDark(v => {
      try { localStorage.setItem('gotroot_theme', !v ? 'dark' : 'light'); } catch {}
      return !v;
    });
  };

  useEffect(() => {
    fetch('/data/apt/campaigns.json')
      .then(r => r.json())
      .then(data => {
        const found = data.find(c => c.attackId === campaignId);
        if (!found) throw new Error('캠페인을 찾을 수 없습니다: ' + campaignId);
        setCampaign(found);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [campaignId]);

  const levelMeta = campaign ? (LEVEL_META[campaign.level] || LEVEL_META.intermediate) : null;

  if (loading) {
    return (
      <PageWrapper isDark={isDark} toggleTheme={toggleTheme} onClose={() => navigate('/apt')}>
        <div className={`p-8 text-center ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent mb-3"></div>
          <p className="text-sm">로딩 중…</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !campaign) {
    return (
      <PageWrapper isDark={isDark} toggleTheme={toggleTheme} onClose={() => navigate('/apt')}>
        <div className={`p-8 text-center ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          <p className="text-5xl mb-3">🤔</p>
          <p className="font-semibold mb-2">캠페인을 찾을 수 없습니다</p>
          <p className={`text-xs font-mono mb-4 ${isDark ? 'text-[#888]' : 'text-[#999]'}`}>{error || campaignId}</p>
          <button
            onClick={() => navigate('/apt')}
            className={`text-sm font-semibold px-4 py-2 rounded-lg ${isDark ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white'}`}
          >
            갤러리로 돌아가기
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper isDark={isDark} toggleTheme={toggleTheme} onClose={() => navigate('/apt')} title={`${campaign.attackId}.app`}>
      <div className={`p-6 md:p-8 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${isDark ? 'bg-[#1a1a1a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'}`}>
              {campaign.attackId}
            </span>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: levelMeta.color + '22', color: levelMeta.color }}
            >
              {levelMeta.emoji} {levelMeta.ko} · {campaign.difficultyScore}/100
            </span>
            <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
              🎯 큐레이션 {campaign.curationScore}/100
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{campaign.name}</h1>
          {campaign.aliases?.length > 1 && (
            <p className={`text-sm ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
              aka {campaign.aliases.slice(1).join(' · ')}
            </p>
          )}
        </div>

        {/* 점수 비교 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`rounded-lg p-5 ${isDark ? 'bg-[#2d2d2d]' : 'bg-[#fafafa] border border-[#e5e5e5]'}`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <span>🎯</span> 큐레이션 우선순위
              <span className="ml-auto text-xs font-mono" style={{ color: '#d97706' }}>
                {campaign.curationScore}/100
              </span>
            </h3>
            {campaign.curationBreakdown && (
              <>
                <ScoreBar label="유명도" score={campaign.curationBreakdown.fame || 0} max={30} color="#d97706" isDark={isDark} />
                <ScoreBar label="관련성" score={campaign.curationBreakdown.relevance || 0} max={30} color="#f59e0b" isDark={isDark} />
                <ScoreBar label="교육가치" score={campaign.curationBreakdown.educational || 0} max={40} color="#fbbf24" isDark={isDark} />
              </>
            )}
          </div>

          <div className={`rounded-lg p-5 ${isDark ? 'bg-[#2d2d2d]' : 'bg-[#fafafa] border border-[#e5e5e5]'}`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <span>⚔️</span> 실습 난이도
              <span className="ml-auto text-xs font-mono" style={{ color: levelMeta.color }}>
                {campaign.difficultyScore}/100
              </span>
            </h3>
            {campaign.difficultyBreakdown && (
              <>
                <ScoreBar label="공격체인" score={campaign.difficultyBreakdown.chainScope || 0} max={20} color={levelMeta.color} isDark={isDark} />
                <ScoreBar label="기법수" score={campaign.difficultyBreakdown.ttpCount || 0} max={20} color={levelMeta.color} isDark={isDark} />
                <ScoreBar label="환경" score={campaign.difficultyBreakdown.environment || 0} max={15} color={levelMeta.color} isDark={isDark} />
                <ScoreBar label="자격증명/횡적" score={campaign.difficultyBreakdown.credLateral || 0} max={15} color={levelMeta.color} isDark={isDark} />
                <ScoreBar label="은닉/LOTL" score={campaign.difficultyBreakdown.stealthLotl || 0} max={10} color={levelMeta.color} isDark={isDark} />
                <ScoreBar label="분석요구" score={campaign.difficultyBreakdown.analysisDemand || 0} max={10} color={levelMeta.color} isDark={isDark} />
                <ScoreBar label="자율성" score={campaign.difficultyBreakdown.autonomy || 0} max={10} color={levelMeta.color} isDark={isDark} />
              </>
            )}
          </div>
        </div>

        {/* 메타 정보 */}
        {campaign.meta && Object.keys(campaign.meta).length > 0 && (
          <div className={`rounded-lg p-5 mb-6 ${isDark ? 'bg-[#2d2d2d]' : 'bg-[#fafafa] border border-[#e5e5e5]'}`}>
            <h3 className="text-sm font-bold mb-3">📊 메타 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <div className={isDark ? 'text-[#888]' : 'text-[#999]'}>기법 (Parent)</div>
                <div className="font-bold text-lg">{campaign.meta.parentTechniqueCount ?? '-'}</div>
              </div>
              <div>
                <div className={isDark ? 'text-[#888]' : 'text-[#999]'}>Sub-technique</div>
                <div className="font-bold text-lg">{campaign.meta.subTechniqueCount ?? '-'}</div>
              </div>
              <div>
                <div className={isDark ? 'text-[#888]' : 'text-[#999]'}>Tactic 커버리지</div>
                <div className="font-bold text-lg">{campaign.meta.tacticCount ?? '-'} / 14</div>
              </div>
              <div>
                <div className={isDark ? 'text-[#888]' : 'text-[#999]'}>플랫폼</div>
                <div className="font-bold text-lg">{campaign.meta.platformCount ?? '-'} 종</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {campaign.meta.hasAd && <span className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>Active Directory</span>}
              {campaign.meta.hasCloud && <span className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>Cloud/SaaS</span>}
              {campaign.meta.lotlHitCount > 0 && <span className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>LOTL {campaign.meta.lotlHitCount}</span>}
            </div>
          </div>
        )}

        {/* 점수 근거 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {campaign.curationReasons?.length > 0 && (
            <div className={`rounded-lg p-5 ${isDark ? 'bg-[#2d2d2d]' : 'bg-[#fafafa] border border-[#e5e5e5]'}`}>
              <h3 className="text-sm font-bold mb-3">💡 큐레이션 근거</h3>
              <ul className="space-y-2 text-xs">
                {campaign.curationReasons.map((r, i) => (
                  <li key={i} className={isDark ? 'text-[#ccc]' : 'text-[#555]'}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
          {campaign.difficultyReasons?.length > 0 && (
            <div className={`rounded-lg p-5 ${isDark ? 'bg-[#2d2d2d]' : 'bg-[#fafafa] border border-[#e5e5e5]'}`}>
              <h3 className="text-sm font-bold mb-3">⚙️ 난이도 근거</h3>
              <ul className="space-y-2 text-xs">
                {campaign.difficultyReasons.map((r, i) => (
                  <li key={i} className={isDark ? 'text-[#ccc]' : 'text-[#555]'}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => navigate('/apt')}
            className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${
              isDark ? 'bg-[#2d2d2d] hover:bg-[#333] text-white' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a]'
            }`}
          >
            ← 갤러리로
          </button>
          <a
            href={`https://attack.mitre.org/campaigns/${campaign.attackId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${
              isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            MITRE ATT&CK 원문 ↗
          </a>
        </div>

        <div className={`mt-8 pt-6 border-t text-[11px] text-center ${isDark ? 'border-[#333] text-[#666]' : 'border-[#e5e5e5] text-[#999]'}`}>
          MVP 상세 페이지 — 교육 콘텐츠(실습 랩/시나리오) 연동은 추후 단계에서 추가됩니다.
        </div>
      </div>
    </PageWrapper>
  );
}

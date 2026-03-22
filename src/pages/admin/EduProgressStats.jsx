import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { maskEmail } from '../../lib/maskUtils';
import eduMeta from '../../data/edu-meta.json';
import AdminGuideSection from '../../components/admin/AdminGuideSection';
import { User, Education, FlagFilled, CheckmarkFilled, ChartBar, Trophy, ChartPie, Growth, Group } from '@carbon/icons-react';

// ── 색상 팔레트 ──
const COLORS = {
  beginner:     { fill: '#34d399', bg: '#ecfdf5', text: '#065f46' },
  intermediate: { fill: '#60a5fa', bg: '#eff6ff', text: '#1e40af' },
  advanced:     { fill: '#f472b6', bg: '#fdf2f8', text: '#9d174d' },
  accent:       '#6366f1',
  bar:          ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
};

const LEVEL_LABEL = { beginner: '초급', intermediate: '중급', advanced: '고급' };

// ── 순수 SVG 막대 차트 ──
function BarChart({ data, width = 500, height = 220, barColor }) {
  if (!data.length) return <p className="text-xs text-slate-400 text-center py-8">데이터 없음</p>;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(36, (width - 60) / data.length - 6);
  const chartH = height - 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* Y축 눈금 */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = 20 + chartH * (1 - ratio);
        return (
          <g key={ratio}>
            <line x1={40} y1={y} x2={width - 10} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={36} y={y + 3} textAnchor="end" className="text-[9px]" fill="#94a3b8">
              {Math.round(maxVal * ratio)}
            </text>
          </g>
        );
      })}
      {/* 막대 */}
      {data.map((d, i) => {
        const x = 50 + i * ((width - 60) / data.length);
        const barH = (d.value / maxVal) * chartH;
        const color = barColor || COLORS.bar[i % COLORS.bar.length];
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={20 + chartH - barH}
              width={barW}
              height={barH}
              rx={3}
              fill={color}
              opacity={0.85}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            <text
              x={x + barW / 2}
              y={20 + chartH - barH - 4}
              textAnchor="middle"
              className="text-[8px]"
              fill="#475569"
              fontWeight="bold"
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              className="text-[7px]"
              fill="#94a3b8"
              fontWeight="600"
            >
              {d.label.length > 10 ? d.label.slice(0, 10) + '…' : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 순수 SVG 도넛 차트 ──
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size * 0.35, strokeW = size * 0.12;
  let cumAngle = -90;

  const arcs = data.map(d => {
    const angle = (d.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const rad = Math.PI / 180;
    const x1 = cx + r * Math.cos(startAngle * rad);
    const y1 = cy + r * Math.sin(startAngle * rad);
    const x2 = cx + r * Math.cos(endAngle * rad);
    const y2 = cy + r * Math.sin(endAngle * rad);
    const largeArc = angle > 180 ? 1 : 0;

    return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}` };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size, maxHeight: size }}>
      {/* 배경 원 */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeW} />
      {/* 아크 */}
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={arc.path}
          fill="none"
          stroke={arc.color}
          strokeWidth={strokeW}
          strokeLinecap="round"
        >
          <title>{`${arc.label}: ${arc.value} (${Math.round((arc.value / total) * 100)}%)`}</title>
        </path>
      ))}
      {/* 중앙 텍스트 */}
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-xl" fill="#1e293b" fontWeight="900">
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="text-[8px]" fill="#94a3b8" fontWeight="700">
        총 완료
      </text>
    </svg>
  );
}

// ── 진행률 바 ──
function ProgressBar({ percent, color = '#6366f1', height = 6 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: '#e2e8f0' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, percent)}%`, background: color }}
      />
    </div>
  );
}

// ══════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════
export default function EduProgressStats({ requestVerify }) {
  const [progressData, setProgressData] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('completedCount');
  const [sortAsc, setSortAsc] = useState(false);

  // ── 데이터 로드 ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // admin 권한 검증
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인 필요');
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') throw new Error('관리자 권한 필요');

      // 병렬 조회
      const [progressRes, profilesRes] = await Promise.all([
        supabase.from('edu_progress').select('user_id, technique_id, chapter_id, level, completed_at'),
        supabase.from('profiles').select('id, email, name, approved, role').order('email'),
      ]);

      if (progressRes.error) throw progressRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setProgressData(progressRes.data || []);
      setProfiles(profilesRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── 통계 계산 ──
  const stats = useMemo(() => {
    const totalTechniques = Object.keys(eduMeta.pages).length;
    const totalUsers = profiles.length;
    const approvedUsers = profiles.filter(p => p.approved).length;

    // 사용자별 그룹핑
    const userMap = {}; // userId → { techniques: Set, chapters: count, levels: { b, i, a }, lastActivity }
    progressData.forEach(row => {
      const uid = row.user_id;
      if (!userMap[uid]) {
        userMap[uid] = { techniques: new Set(), chapters: 0, levels: { beginner: 0, intermediate: 0, advanced: 0 }, lastActivity: null };
      }
      userMap[uid].techniques.add(row.technique_id);
      userMap[uid].chapters += 1;
      const lvl = row.level || 'beginner';
      if (userMap[uid].levels[lvl] !== undefined) userMap[uid].levels[lvl] += 1;
      const at = row.completed_at ? new Date(row.completed_at) : null;
      if (at && (!userMap[uid].lastActivity || at > userMap[uid].lastActivity)) {
        userMap[uid].lastActivity = at;
      }
    });

    const activeUsers = Object.keys(userMap).length;

    // 기법별 완료 횟수 (상위 10)
    const techCount = {};
    progressData.forEach(row => {
      const tid = row.technique_id;
      if (!techCount[tid]) techCount[tid] = new Set();
      techCount[tid].add(row.user_id);
    });
    const topTechniques = Object.entries(techCount)
      .map(([tid, users]) => ({
        label: eduMeta.pages[tid]?.title?.slice(0, 15) || tid,
        fullLabel: eduMeta.pages[tid]?.title || tid,
        value: users.size,
        id: tid,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // 레벨별 분포
    const levelDist = { beginner: 0, intermediate: 0, advanced: 0 };
    progressData.forEach(row => {
      const lvl = row.level || 'beginner';
      if (levelDist[lvl] !== undefined) levelDist[lvl] += 1;
    });

    // 사용자 상세 테이블 데이터
    const userDetails = profiles.map(p => {
      const ud = userMap[p.id];
      return {
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role,
        approved: p.approved,
        techniqueCount: ud ? ud.techniques.size : 0,
        chapterCount: ud ? ud.chapters : 0,
        completedCount: ud ? ud.techniques.size : 0,
        levels: ud ? ud.levels : { beginner: 0, intermediate: 0, advanced: 0 },
        lastActivity: ud?.lastActivity || null,
        percent: ud ? Math.round((ud.techniques.size / totalTechniques) * 100) : 0,
      };
    });

    // 일별 활동 (최근 14일)
    const dailyActivity = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyActivity[d.toISOString().slice(0, 10)] = 0;
    }
    progressData.forEach(row => {
      if (row.completed_at) {
        const day = row.completed_at.slice(0, 10);
        if (dailyActivity[day] !== undefined) dailyActivity[day] += 1;
      }
    });
    const dailyChartData = Object.entries(dailyActivity).map(([date, count]) => ({
      label: date.slice(5), // MM-DD
      value: count,
    }));

    return {
      totalUsers, approvedUsers, activeUsers, totalTechniques,
      totalProgress: progressData.length,
      topTechniques, levelDist, userDetails, dailyChartData,
    };
  }, [progressData, profiles]);

  // ── 정렬 ──
  const sortedUsers = useMemo(() => {
    const arr = [...stats.userDetails];
    arr.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (va instanceof Date) { va = va?.getTime() || 0; vb = vb?.getTime() || 0; }
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? (va || 0) - (vb || 0) : (vb || 0) - (va || 0);
    });
    return arr;
  }, [stats.userDetails, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  // ── 로딩/에러 ──
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm font-bold text-red-600">{error}</p>
        <p className="text-xs text-red-400 mt-2">
          edu_progress 테이블의 관리자 RLS 정책이 필요합니다.
          <br />
          <code className="bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
            CREATE POLICY "Admins can view all progress" ON edu_progress FOR SELECT
            USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
          </code>
        </p>
        <button onClick={fetchAll} className="mt-4 px-4 py-1.5 text-xs font-bold text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <ChartBar size={20} /> 교육 통계 대시보드
        </h2>
        <button onClick={fetchAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors">
          새로고침
        </button>
      </div>

      {/* ── 요약 카드 4개 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '전체 사용자', value: stats.totalUsers, sub: `승인 ${stats.approvedUsers}명`, Icon: User, color: 'blue' },
          { label: '학습 참여자', value: stats.activeUsers, sub: `${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% 참여율`, Icon: Education, color: 'emerald' },
          { label: '교육 기법 수', value: stats.totalTechniques, sub: `총 ${stats.totalProgress}건 기록`, Icon: FlagFilled, color: 'amber' },
          { label: '챕터 완료', value: stats.totalProgress, sub: '전체 누적', Icon: CheckmarkFilled, color: 'indigo' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <card.Icon size={20} />
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-${card.color}-50 text-${card.color}-600`}>
                {card.sub}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">{card.value.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── 차트 영역 (2열) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 인기 기법 TOP 10 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5"><Trophy size={16} /> 인기 기법 TOP {stats.topTechniques.length}</h3>
          <p className="text-[10px] text-slate-400 mb-2">학습 참여 사용자 수 기준</p>
          <BarChart data={stats.topTechniques} width={480} height={200} />
          {stats.topTechniques.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">아직 학습 데이터가 없습니다</p>
          )}
        </div>

        {/* 레벨별 분포 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5"><ChartPie size={16} /> 레벨별 학습 분포</h3>
          <p className="text-[10px] text-slate-400 mb-4">챕터 완료 기준</p>
          <div className="flex items-center gap-6">
            <div className="w-40 shrink-0">
              <DonutChart
                size={160}
                data={[
                  { label: '초급', value: stats.levelDist.beginner, color: COLORS.beginner.fill },
                  { label: '중급', value: stats.levelDist.intermediate, color: COLORS.intermediate.fill },
                  { label: '고급', value: stats.levelDist.advanced, color: COLORS.advanced.fill },
                ]}
              />
            </div>
            <div className="flex-1 space-y-3">
              {Object.entries(LEVEL_LABEL).map(([key, label]) => {
                const val = stats.levelDist[key] || 0;
                const total = stats.totalProgress || 1;
                const pct = Math.round((val / total) * 100);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-600">{label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{val}건 ({pct}%)</span>
                    </div>
                    <ProgressBar percent={pct} color={COLORS[key].fill} height={8} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 일별 활동 차트 ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5"><Growth size={16} /> 최근 14일 학습 활동</h3>
        <p className="text-[10px] text-slate-400 mb-2">일별 챕터 완료 수</p>
        <BarChart data={stats.dailyChartData} width={700} height={180} barColor="#6366f1" />
      </div>

      {/* ── 사용자별 상세 테이블 ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-1.5"><Group size={16} /> 사용자별 학습 현황</h3>
          <span className="text-[10px] font-bold text-slate-400">{sortedUsers.length}명</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { field: 'email', label: '이메일' },
                  { field: 'completedCount', label: '학습 기법' },
                  { field: 'chapterCount', label: '챕터 수' },
                  { field: 'percent', label: '진행률' },
                  { field: 'lastActivity', label: '최근 활동' },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                  >
                    {col.label}
                    {sortField === col.field && (
                      <span className="ml-1 text-indigo-500">{sortAsc ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-600">{maskEmail(u.email)}</span>
                      {u.role === 'admin' && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">ADMIN</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{u.completedCount}</span>
                      <span className="text-[9px] text-slate-400">/ {stats.totalTechniques}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-600">{u.levels.beginner}</span>
                      <span className="text-[8px] text-slate-300">/</span>
                      <span className="text-[10px] font-bold text-blue-600">{u.levels.intermediate}</span>
                      <span className="text-[8px] text-slate-300">/</span>
                      <span className="text-[10px] font-bold text-pink-600">{u.levels.advanced}</span>
                      <span className="text-[9px] text-slate-400 ml-1">({u.chapterCount})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <ProgressBar percent={u.percent} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{u.percent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-slate-400">
                      {u.lastActivity ? u.lastActivity.toLocaleDateString('ko-KR') : '-'}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedUsers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-xs text-slate-400">학습 데이터가 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 가이드 ── */}
      <AdminGuideSection
        steps={[
          '상단 요약 카드에서 전체 사용자/참여자/기법 수를 한눈에 확인합니다',
          '인기 기법 차트에서 가장 많이 학습되는 기법을 파악합니다',
          '레벨별 분포 차트에서 초급/중급/고급 학습 비율을 확인합니다',
          '사용자별 테이블에서 개별 진행률과 최근 활동을 확인합니다',
          '열 헤더를 클릭하면 정렬할 수 있습니다',
        ]}
        tips={[
          'edu_progress 테이블에 관리자 SELECT RLS 정책이 필요합니다',
          '데이터가 안 보이면 Supabase Dashboard에서 RLS 정책을 추가하세요',
          '이메일은 자동 마스킹됩니다 (사용자 관리 탭에서 원본 확인 가능)',
        ]}
      />
    </div>
  );
}

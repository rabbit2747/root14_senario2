import { useState, useEffect, useCallback, useRef } from 'react';
import { queryAccessLogs, getAccessLogsToday, getAccessLogsWeek, getAccessLogsByIp } from '../../../api/admin';
import AdminGuideSection from '../../../components/admin/AdminGuideSection';
import {
  Renew, ChevronLeft, ChevronRight, Download, Filter,
  Activity, Login, WarningAlt, View, Earth, Play, Pause,
  Close, Email, Time
} from '@carbon/icons-react';

// ── 날짜 포맷 ──
function fmt(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ── 국가 코드 → 플래그 이모지 ──
function countryFlag(code) {
  if (!code || code === 'LOCAL' || code === '??' || code.length !== 2) return '';
  const c = code.toUpperCase();
  return String.fromCodePoint(...[...c].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
}

// ── 액션 배지 ──
const ACTION_BADGE = {
  page_visit:   { label: '방문',     color: 'bg-blue-50 text-blue-600',   Icon: View },
  login:        { label: '로그인',   color: 'bg-emerald-50 text-emerald-600', Icon: Login },
  login_failed: { label: '로그인 실패', color: 'bg-red-50 text-red-600', Icon: WarningAlt },
};

function ActionBadge({ action }) {
  const s = ACTION_BADGE[action] || { label: action, color: 'bg-slate-100 text-slate-600', Icon: Activity };
  const IconC = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.color}`}>
      <IconC size={12} /> {s.label}
    </span>
  );
}

// ── 통계 카드 ──
function StatCard({ icon: Icon, label, value, sub, color = 'text-blue-600' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '50')}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ── 순수 SVG 바 차트 (최근 7일) ──
function WeeklyChart({ data }) {
  if (!data.length) return <p className="text-xs text-slate-400 text-center py-8">데이터 없음</p>;
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const w = 480, h = 180;
  const chartH = h - 36;
  const barW = 40;
  const gap = (w - 40) / data.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: h }}>
      {/* Y축 눈금 */}
      {[0, 0.5, 1].map(ratio => {
        const y = 12 + chartH * (1 - ratio);
        return (
          <g key={ratio}>
            <line x1={36} y1={y} x2={w - 4} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={32} y={y + 3} textAnchor="end" className="text-[9px]" fill="#94a3b8">
              {Math.round(maxVal * ratio)}
            </text>
          </g>
        );
      })}
      {/* 막대 — 스택 (page_visit + login + login_failed) */}
      {data.map((d, i) => {
        const x = 44 + i * gap;
        const visitH = (d.visit / maxVal) * chartH;
        const loginH = (d.login / maxVal) * chartH;
        const failH = (d.fail / maxVal) * chartH;
        let yOff = 12 + chartH;

        return (
          <g key={d.date}>
            {visitH > 0 && (
              <rect x={x} y={yOff - visitH} width={barW} height={visitH} rx={2} fill="#60a5fa" opacity={0.8}>
                <title>{`${d.dateLabel} 방문: ${d.visit}`}</title>
              </rect>
            )}
            {loginH > 0 && (
              <rect x={x} y={yOff - visitH - loginH} width={barW} height={loginH} rx={0} fill="#34d399" opacity={0.8}>
                <title>{`${d.dateLabel} 로그인: ${d.login}`}</title>
              </rect>
            )}
            {failH > 0 && (
              <rect x={x} y={yOff - visitH - loginH - failH} width={barW} height={failH} rx={0} fill="#f87171" opacity={0.8}>
                <title>{`${d.dateLabel} 실패: ${d.fail}`}</title>
              </rect>
            )}
            <text x={x + barW / 2} y={h - 2} textAnchor="middle" className="text-[9px]" fill="#64748b">{d.dateLabel}</text>
            <text x={x + barW / 2} y={yOff - visitH - loginH - failH - 4} textAnchor="middle" className="text-[9px]" fill="#475569" fontWeight="bold">
              {d.total || ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── IP 타임라인 모달 ──
function IpTimelineModal({ ip, geoInfo, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await getAccessLogsByIp(ip);
      setLogs(data || []);
      setLoading(false);
    })();
  }, [ip]);

  // 날짜별 그룹핑
  const grouped = {};
  for (const log of logs) {
    const dateKey = log.created_at?.slice(0, 10) || 'unknown';
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(log);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col m-4"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Time size={16} /> IP 타임라인
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{ip}</p>
            {geoInfo && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {countryFlag(geoInfo.countryCode)} {geoInfo.country} · {geoInfo.city !== '-' ? geoInfo.city : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-bold">{logs.length}건</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <Close size={18} />
            </button>
          </div>
        </div>

        {/* 타임라인 본체 */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">로딩 중...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">접속 이력이 없습니다.</div>
          ) : (
            Object.entries(grouped).map(([date, entries]) => (
              <div key={date} className="mb-5 last:mb-0">
                {/* 날짜 구분 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{date}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] text-slate-300">{entries.length}건</span>
                </div>
                {/* 이벤트 리스트 */}
                <div className="space-y-1.5">
                  {entries.map((log, idx) => {
                    const time = new Date(log.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return (
                      <div key={log.id || idx} className="flex items-center gap-2 pl-3 border-l-2 border-slate-200 hover:border-blue-400 transition-colors py-1">
                        <span className="text-[10px] font-mono text-slate-400 w-[60px] shrink-0">{time}</span>
                        <ActionBadge action={log.action} />
                        <span className="text-[11px] text-slate-500 truncate flex-1">{log.email || '-'}</span>
                        {log.technique && (
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[80px]">{log.technique}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// AccessLogsDashboard — 메인
// ══════════════════════════════════════
export default function AccessLogsDashboard({ requestVerify }) {
  // ── 통계 ──
  const [todayStats, setTodayStats] = useState(null);
  const [weekData, setWeekData] = useState([]);

  // ── 테이블 ──
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 50;

  // ── 필터 ──
  const [filterAction, setFilterAction] = useState('');
  const [filterIp, setFilterIp] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // ── IP 타임라인 모달 ──
  const [timelineIp, setTimelineIp] = useState(null);

  // ── 자동 갱신 ──
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const autoRefreshRef = useRef(null);
  const countdownRef = useRef(null);

  // ── IP 지오로케이션 ──
  const [geoMap, setGeoMap] = useState({}); // ip → { country, countryCode, city }
  const [geoLoading, setGeoLoading] = useState(false);

  // ── 통계 로딩 ──
  const loadStats = useCallback(async () => {
    const [todayRes, weekRes] = await Promise.all([
      getAccessLogsToday(),
      getAccessLogsWeek(),
    ]);

    if (todayRes.data) {
      const rows = todayRes.data;
      const uniqueIps = new Set(rows.map(r => r.ip)).size;
      const visits = rows.filter(r => r.action === 'page_visit').length;
      const logins = rows.filter(r => r.action === 'login').length;
      const fails = rows.filter(r => r.action === 'login_failed').length;
      setTodayStats({ total: rows.length, uniqueIps, visits, logins, fails });
    }

    if (weekRes.data) {
      const dayMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { date: key, dateLabel: `${d.getMonth() + 1}/${d.getDate()}`, visit: 0, login: 0, fail: 0, total: 0 };
      }
      for (const row of weekRes.data) {
        const key = row.created_at.slice(0, 10);
        if (dayMap[key]) {
          dayMap[key].total++;
          if (row.action === 'page_visit') dayMap[key].visit++;
          else if (row.action === 'login') dayMap[key].login++;
          else if (row.action === 'login_failed') dayMap[key].fail++;
        }
      }
      setWeekData(Object.values(dayMap));
    }
  }, []);

  // ── 테이블 로딩 ──
  const loadLogs = useCallback(async () => {
    setLoading(true);
    const params = { page, pageSize };
    if (filterAction) params.action = filterAction;
    if (filterIp.trim()) params.searchIp = filterIp.trim();
    if (filterEmail.trim()) params.searchEmail = filterEmail.trim();
    if (filterDate) {
      params.dateFrom = filterDate + 'T00:00:00';
      params.dateTo = filterDate + 'T23:59:59';
    }
    const { data, count } = await queryAccessLogs(params);
    setLogs(data || []);
    setTotalCount(count || 0);
    setLoading(false);
    return data || [];
  }, [page, filterAction, filterIp, filterEmail, filterDate]);

  // ── IP 지오 배치 조회 ──
  const resolveGeoIps = useCallback(async (logRows) => {
    if (!logRows || logRows.length === 0) return;
    // 아직 조회 안 된 IP만 필터
    const newIps = [...new Set(logRows.map(r => r.ip).filter(ip => ip && !geoMap[ip]))];
    if (newIps.length === 0) return;

    setGeoLoading(true);
    try {
      const res = await fetch('/api/geoip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ips: newIps }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeoMap(prev => ({ ...prev, ...data }));
      }
    } catch { /* 지오 조회 실패 무시 */ }
    setGeoLoading(false);
  }, [geoMap]);

  // ── 전체 새로고침 ──
  const refreshAll = useCallback(async () => {
    loadStats();
    const data = await loadLogs();
    resolveGeoIps(data);
  }, [loadStats, loadLogs, resolveGeoIps]);

  // ── 초기 로딩 ──
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => {
    (async () => {
      const data = await loadLogs();
      resolveGeoIps(data);
    })();
  }, [loadLogs]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 자동 갱신 타이머 ──
  useEffect(() => {
    if (autoRefresh) {
      setCountdown(30);
      // 카운트다운 매초
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) return 30;
          return prev - 1;
        });
      }, 1000);
      // 30초마다 데이터 갱신
      autoRefreshRef.current = setInterval(() => {
        refreshAll();
      }, 30000);
    }
    return () => {
      if (autoRefreshRef.current) { clearInterval(autoRefreshRef.current); autoRefreshRef.current = null; }
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    };
  }, [autoRefresh, refreshAll]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // ── CSV 내보내기 ──
  const handleExport = useCallback(async () => {
    const ok = await requestVerify();
    if (!ok) return;
    const { data } = await queryAccessLogs({ page: 0, pageSize: 10000 });
    if (!data?.length) return alert('데이터가 없습니다.');
    const headers = ['시간,액션,이메일,IP,국가,도시,경로'];
    const rows = data.map(r => {
      const geo = geoMap[r.ip];
      return [
        fmt(r.created_at), r.action, r.email || '', r.ip || '',
        geo?.country || '', geo?.city || '', r.technique || '',
      ].map(v => `"${v}"`).join(',');
    });
    const csv = '\uFEFF' + headers.concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `access-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [requestVerify, geoMap]);

  // ── 필터 리셋 ──
  const resetFilters = () => {
    setFilterAction('');
    setFilterIp('');
    setFilterEmail('');
    setFilterDate('');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Activity size={20} /> 접속 로그 대시보드
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">모든 방문자(익명 포함)의 접속 기록을 실시간으로 모니터링합니다.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* 자동 갱신 토글 */}
          <button
            onClick={() => setAutoRefresh(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              autoRefresh
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
            title={autoRefresh ? '자동 갱신 중지' : '30초 자동 갱신'}
          >
            {autoRefresh ? <Pause size={14} /> : <Play size={14} />}
            {autoRefresh ? `자동 ${countdown}s` : '자동 갱신'}
          </button>
          <button onClick={refreshAll} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Renew size={14} /> 새로고침
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* 통계 카드 (오늘) */}
      {todayStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard icon={Activity} label="오늘 전체 이벤트" value={todayStats.total} color="text-blue-600" />
          <StatCard icon={Earth} label="고유 IP" value={todayStats.uniqueIps} color="text-purple-600" />
          <StatCard icon={View} label="페이지 방문" value={todayStats.visits} color="text-sky-600" />
          <StatCard icon={Login} label="로그인 성공" value={todayStats.logins} color="text-emerald-600" />
          <StatCard icon={WarningAlt} label="로그인 실패" value={todayStats.fails} color="text-red-600" />
        </div>
      )}

      {/* 주간 차트 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">📊 최근 7일 접속 추이</h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" /> 방문</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> 로그인</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> 실패</span>
          </div>
        </div>
        <WeeklyChart data={weekData} />
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setPage(0); }}
            className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">전체 액션</option>
            <option value="page_visit">방문</option>
            <option value="login">로그인</option>
            <option value="login_failed">로그인 실패</option>
          </select>
          <input
            type="text"
            placeholder="IP 검색..."
            value={filterIp}
            onChange={e => { setFilterIp(e.target.value); setPage(0); }}
            className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 w-36 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="relative">
            <Email size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="이메일 검색..."
              value={filterEmail}
              onChange={e => { setFilterEmail(e.target.value); setPage(0); }}
              className="text-xs border border-slate-300 rounded-lg pl-6 pr-2 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(0); }}
            className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          {(filterAction || filterIp || filterEmail || filterDate) && (
            <button onClick={resetFilters} className="text-xs text-red-500 font-bold hover:underline">초기화</button>
          )}
          <span className="ml-auto text-[11px] text-slate-400">총 {totalCount.toLocaleString()}건</span>
        </div>
      </div>

      {/* 로그 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 820 }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 w-[140px]">시간</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 w-[110px]">액션</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 w-[130px]">IP</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 w-[120px]">
                  <span className="flex items-center gap-1"><Earth size={12} /> 위치</span>
                </th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500">이메일</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500">경로</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">로딩 중...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">데이터가 없습니다.</td></tr>
              ) : logs.map((log, idx) => {
                const geo = geoMap[log.ip];
                return (
                  <tr key={log.id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2 text-slate-600 font-mono text-[11px]">{fmt(log.created_at)}</td>
                    <td className="px-4 py-2"><ActionBadge action={log.action} /></td>
                    <td className="px-4 py-2">
                      {log.ip ? (
                        <button
                          onClick={() => setTimelineIp(log.ip)}
                          className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none p-0"
                          title={`${log.ip} 전체 타임라인 보기`}
                        >
                          {log.ip}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-[11px]">
                      {geo ? (
                        <span className="inline-flex items-center gap-1 text-slate-600" title={`${geo.country} · ${geo.city}`}>
                          <span>{countryFlag(geo.countryCode)}</span>
                          <span className="truncate max-w-[80px]">{geo.city !== '-' ? geo.city : geo.country}</span>
                        </span>
                      ) : geoLoading ? (
                        <span className="text-slate-300">···</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-600 truncate max-w-[180px]">{log.email || '-'}</td>
                    <td className="px-4 py-2 text-slate-500 truncate max-w-[180px] font-mono text-[11px]">{log.technique || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-500">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} / {totalCount.toLocaleString()}건
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-600 px-2">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 가이드 */}
      <AdminGuideSection
        title="접속 로그 대시보드 가이드"
        items={[
          '모든 방문자(비로그인 포함)의 IP와 접속 경로가 자동으로 기록됩니다.',
          '동일 IP는 1시간에 1회만 기록됩니다 (DB 부하 방지).',
          '로그인 실패 시 해당 IP와 시도한 이메일이 함께 기록됩니다.',
          '📧 이메일 검색: 부분 검색 지원 (예: "user" → user@example.com 매칭).',
          '🔍 IP 클릭: 해당 IP의 전체 접속 타임라인을 모달로 확인할 수 있습니다.',
          '▶ 자동 갱신 버튼으로 30초마다 실시간 모니터링이 가능합니다.',
          '🌍 IP 위치 정보는 ip-api.com 기반이며, 24시간 서버 캐시됩니다.',
          'CSV 내보내기 시 위치 정보(국가, 도시)도 함께 포함됩니다.',
          '※ access_logs RLS가 미적용 상태 — Supabase SQL Editor에서 RLS 활성화를 권장합니다.',
        ]}
      />

      {/* IP 타임라인 모달 */}
      {timelineIp && (
        <IpTimelineModal
          ip={timelineIp}
          geoInfo={geoMap[timelineIp]}
          onClose={() => setTimelineIp(null)}
        />
      )}
    </div>
  );
}

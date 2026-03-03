import { useState, useCallback } from 'react';
import useAuditLogs from '../../../hooks/useAuditLogs';
import AdminGuideSection from '../../../components/admin/AdminGuideSection';
import { Save, TrashCan, Document, Task, NotificationNew, Renew, WarningAlt, MailAll, ChevronLeft, ChevronRight, ChevronDown } from '@carbon/icons-react';

// ── 액션 배지 스타일 ──
const ACTION_STYLE = {
  edu_html_save:   { bg: 'bg-blue-50', text: 'text-blue-600', Icon: Save, label: 'HTML 저장' },
  edu_html_delete: { bg: 'bg-red-50',  text: 'text-red-600',  Icon: TrashCan, label: 'HTML 삭제' },
};

function getActionBadge(action) {
  const s = ACTION_STYLE[action] || { bg: 'bg-slate-100', text: 'text-slate-600', Icon: Document, label: action };
  const IconComp = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
      <IconComp size={12} /> {s.label}
    </span>
  );
}

// ── 날짜 포맷 ──
function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ── CSV 변환 ──
function convertToCSV(rows) {
  const headers = ['시간', '액션', '이메일', 'IP', '페이지', '상세'];
  const csvRows = [headers.join(',')];
  for (const row of rows) {
    csvRows.push([
      `"${formatDate(row.created_at)}"`,
      `"${row.action || ''}"`,
      `"${row.email || ''}"`,
      `"${row.ip || ''}"`,
      `"${row.page_id || ''}"`,
      `"${row.detail ? JSON.stringify(row.detail).replace(/"/g, '""') : ''}"`,
    ].join(','));
  }
  return csvRows.join('\n');
}

// ═══════════════════════════════════════
// AuditLogViewer — 메인 컴포넌트
// ═══════════════════════════════════════
export default function AuditLogViewer({ requestVerify }) {
  const audit = useAuditLogs();
  const [expandedId, setExpandedId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(audit.totalCount / audit.pageSize));

  // ── CSV 내보내기 ──
  const handleExport = useCallback(async () => {
    const ok = await requestVerify();
    if (!ok) return;
    setExporting(true);
    try {
      const rows = await audit.getAllForExport();
      const csvContent = convertToCSV(rows);
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('CSV 내보내기 실패: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setExporting(false);
    }
  }, [requestVerify, audit]);

  // ── 필터 초기화 ──
  const resetFilters = () => {
    audit.setFilters({ action: '', email: '', dateFrom: '', dateTo: '' });
  };

  return (
    <div className="space-y-4">
      {/* ── 헤더 ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Task size={20} /> 감사 로그
          <span className="text-sm font-bold text-slate-400">
            ({audit.totalCount}건)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {/* 새 로그 알림 배지 */}
          {audit.newCount > 0 && (
            <button
              onClick={audit.dismissNew}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors animate-pulse"
            >
              <NotificationNew size={14} className="inline" /> 새 로그 {audit.newCount}건 — 클릭하여 확인
            </button>
          )}
          <button
            onClick={audit.refresh}
            disabled={audit.loading}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <Renew size={14} className="inline" /> 새로고침
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || audit.loading || audit.totalCount === 0}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            {exporting ? '내보내는 중...' : '📥 CSV 내보내기'}
          </button>
        </div>
      </div>

      {/* ── 필터 바 ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 액션 필터 */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">액션</label>
            <select
              value={audit.filters.action}
              onChange={e => audit.setFilters({ action: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="">전체</option>
              {audit.actionOptions.map(a => (
                <option key={a} value={a}>
                  {ACTION_STYLE[a]?.label || a}
                </option>
              ))}
            </select>
          </div>

          {/* 이메일 검색 */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">이메일</label>
            <input
              type="text"
              value={audit.filters.email}
              onChange={e => audit.setFilters({ email: e.target.value })}
              placeholder="검색..."
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          {/* 시작일 */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">시작일</label>
            <input
              type="date"
              value={audit.filters.dateFrom}
              onChange={e => audit.setFilters({ dateFrom: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">종료일</label>
            <input
              type="date"
              value={audit.filters.dateTo}
              onChange={e => audit.setFilters({ dateTo: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
        </div>

        {/* 초기화 버튼 */}
        {(audit.filters.action || audit.filters.email || audit.filters.dateFrom || audit.filters.dateTo) && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕ 필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* ── 에러 표시 ── */}
      {audit.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-600 font-bold">
          <WarningAlt size={14} className="inline" /> {audit.error}
        </div>
      )}

      {/* ── 테이블 ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-[160px]">시간</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-[130px]">액션</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-[180px]">이메일</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-[120px]">IP</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-[150px]">페이지</th>
                <th className="text-center px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-[60px]">상세</th>
              </tr>
            </thead>
            <tbody>
              {audit.loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="mt-2 font-bold">로딩 중...</p>
                  </td>
                </tr>
              ) : audit.logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <span className="mb-2 block"><MailAll size={32} /></span>
                    <p className="font-bold">감사 로그가 없습니다</p>
                    <p className="text-[10px] mt-1">필터 조건을 변경하거나 감사 로그 테이블이 생성되었는지 확인하세요</p>
                  </td>
                </tr>
              ) : (
                audit.logs.map(log => (
                  <LogRow
                    key={log.id}
                    log={log}
                    expanded={expandedId === log.id}
                    onToggle={() => setExpandedId(prev => prev === log.id ? null : log.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 페이지네이션 ── */}
      {audit.totalCount > audit.pageSize && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => audit.setPage(Math.max(0, audit.page - 1))}
            disabled={audit.page === 0}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} className="inline" /> 이전
          </button>
          <span className="text-xs font-bold text-slate-500">
            {audit.page + 1} / {totalPages}
          </span>
          <button
            onClick={() => audit.setPage(Math.min(totalPages - 1, audit.page + 1))}
            disabled={audit.page >= totalPages - 1}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            다음 <ChevronRight size={14} className="inline" />
          </button>
        </div>
      )}

      <AdminGuideSection
        steps={[
          '액션 필터: 드롭다운에서 특정 작업 유형만 조회합니다',
          '이메일 검색: 관리자 이메일로 필터링합니다 (부분 일치)',
          '날짜 범위: 시작일~종료일로 기간 한정 조회합니다',
          '▶ 버튼: 상세 정보(JSONB)를 펼쳐 XSS 경고 등을 확인합니다',
          'CSV 내보내기: 현재 필터 기준으로 전체 데이터를 Excel 호환 CSV로 다운로드합니다',
          '🔔 배지: 실시간으로 새 감사 로그가 도착하면 알림이 표시됩니다',
        ]}
      />
    </div>
  );
}

// ═══════════════════════════════════════
// LogRow — 개별 행 + 확장
// ═══════════════════════════════════════
function LogRow({ log, expanded, onToggle }) {
  const hasDetail = log.detail && Object.keys(log.detail).length > 0;

  return (
    <>
      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
        <td className="px-4 py-2.5 text-slate-600 font-mono text-[11px]">
          {formatDate(log.created_at)}
        </td>
        <td className="px-4 py-2.5">
          {getActionBadge(log.action)}
        </td>
        <td className="px-4 py-2.5 text-slate-600 font-mono text-[11px]">
          {log.email || '-'}
        </td>
        <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
          {log.ip || '-'}
        </td>
        <td className="px-4 py-2.5 text-slate-500 text-[11px]">
          {log.page_id || '-'}
        </td>
        <td className="px-4 py-2.5 text-center">
          {hasDetail ? (
            <button
              onClick={onToggle}
              className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                expanded
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <span className="text-[11px] text-slate-200">-</span>
          )}
        </td>
      </tr>
      {/* 확장된 상세 JSONB */}
      {expanded && hasDetail && (
        <tr>
          <td colSpan={6} className="px-4 py-3 bg-slate-50/80">
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 mt-1">DETAIL</span>
              <pre className="flex-1 bg-white p-3 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
                {JSON.stringify(log.detail, null, 2)}
              </pre>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

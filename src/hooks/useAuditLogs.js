import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 50;
const DEBOUNCE_MS = 300;

/**
 * useAuditLogs — admin_audit_logs 읽기 전용 훅
 * 필터링, 페이지네이션, CSV 내보내기 지원
 */
export default function useAuditLogs() {
  // ── 상태 ──
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [filters, setFiltersRaw] = useState({
    action: '',
    email: '',
    dateFrom: '',
    dateTo: '',
  });
  const [actionOptions, setActionOptions] = useState([]);
  const [newCount, setNewCount] = useState(0);  // Realtime으로 도착한 새 로그 수

  // 이메일 검색 debounce용
  const debounceTimer = useRef(null);
  const [debouncedEmail, setDebouncedEmail] = useState('');

  // ── 필터 변경 시 page 리셋 ──
  const setFilters = useCallback((partial) => {
    setFiltersRaw(prev => ({ ...prev, ...partial }));
    setPage(0);
  }, []);

  // ── 이메일 debounce ──
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedEmail(filters.email);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [filters.email]);

  // ── 쿼리 빌더 (공통) ──
  const buildQuery = useCallback((withPagination = true) => {
    let query = supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.action) query = query.eq('action', filters.action);
    if (debouncedEmail) query = query.ilike('email', `%${debouncedEmail}%`);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom + 'T00:00:00');
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo + 'T23:59:59');

    if (withPagination) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);
    }

    return query;
  }, [filters.action, debouncedEmail, filters.dateFrom, filters.dateTo, page]);

  // ── 로그 조회 ──
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, count, error: queryError } = await buildQuery(true);
      if (queryError) throw queryError;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err.message || '감사 로그를 불러올 수 없습니다');
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // ── 자동 fetch ──
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Action 옵션 동적 조회 ──
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('admin_audit_logs')
          .select('action')
          .order('action');
        if (data) {
          const unique = [...new Set(data.map(d => d.action))].filter(Boolean);
          setActionOptions(unique);
        }
      } catch {
        // 폴백: 하드코딩 옵션
        setActionOptions(['edu_html_save', 'edu_html_delete']);
      }
    })();
  }, []);

  // ── Realtime 구독 (새 INSERT 감지) ──
  useEffect(() => {
    const channel = supabase
      .channel('audit-logs-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_audit_logs' },
        () => {
          setNewCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── 새 로그 확인 (배지 리셋 + 데이터 새로고침) ──
  const dismissNew = useCallback(() => {
    setNewCount(0);
    fetchLogs();
  }, [fetchLogs]);

  // ── CSV 내보내기용 전체 데이터 ──
  const getAllForExport = useCallback(async () => {
    const { data, error: queryError } = await buildQuery(false);
    if (queryError) throw queryError;
    return data || [];
  }, [buildQuery]);

  // ── 수동 새로고침 ──
  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    totalCount,
    loading,
    error,
    page,
    pageSize: PAGE_SIZE,
    filters,
    actionOptions,
    newCount,
    setFilters,
    setPage,
    refresh,
    dismissNew,
    getAllForExport,
  };
}

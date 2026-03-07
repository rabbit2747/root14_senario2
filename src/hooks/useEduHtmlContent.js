import { useState, useCallback } from 'react';
// ⏳ Phase 1: supabase 직접 호출 분리 대기
// ─────────────────────────────────────────────────────────────────────
// 분리 불가 이유 1 — getPublicIP() + logAudit() 복합 구조:
//   logAudit() 내부: getPublicIP() → supabase.auth.getUser() → admin_audit_logs.insert()
//   세 가지 동작이 단일 함수에 결합 → api/ 단순 wrapping 불가
//   예정: NestJS req.ip 미들웨어(서버측 IP 수집) + 인터셉터(자동 감사 로깅)
//
// 분리 불가 이유 2 — IDOR 검증(verifyAdmin):
//   supabase.auth.getUser() + profiles.role SELECT 2단계 검증
//   → Phase 2 NestJS JWT Guard로 교체 시 함께 이관
//
// 분리 불가 이유 3 — fetchContent / saveContent / deleteContent 직접 호출:
//   api/edu.js에 getEduHtmlContent / upsertEduHtmlContent / deleteEduHtmlContent 껍데기 존재
//   그러나 logAudit 결합으로 인해 Phase 1 완전 이관 시 saveContent/deleteContent 함께 교체 필요
// ─────────────────────────────────────────────────────────────────────
import { supabase, getPublicIP } from '../lib/supabase';
import { sanitizeEduHtml } from '../lib/sanitizeHtml';

/**
 * 실습 HTML 콘텐츠 Supabase CRUD 훅
 * - fetchContent(pageId): Supabase에서 저장된 HTML 로드
 * - saveContent(pageId, html): upsert로 저장
 * - fetchStaticDefault(pageId): 정적 HTML 파일에서 기본값 로드
 */
export default function useEduHtmlContent() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // ── [IDOR 방어] admin 권한 사전 검증 ──
  const verifyAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: '로그인이 필요합니다' };
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') return { ok: false, error: '관리자 권한이 필요합니다' };
    return { ok: true };
  };

  // ── 감사 로그 기록 (비동기, fire-and-forget) ──
  const logAudit = async (pageId, action, warnings = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ip = await getPublicIP();
      await supabase.from('admin_audit_logs').insert({
        user_id: user?.id,
        email: user?.email,
        ip,
        action,
        page_id: pageId,
        detail: warnings.length > 0 ? { xss_warnings: warnings } : null,
      });
    } catch {
      // 감사 로그 실패해도 메인 작업에 영향 없음
    }
  };

  /** Supabase에서 저장된 HTML 콘텐츠 로드 */
  const fetchContent = useCallback(async (pageId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: e } = await supabase
        .from('edu_html_content')
        .select('content, updated_at')
        .eq('page_id', pageId)
        .single();

      if (e && e.code !== 'PGRST116') throw e; // PGRST116 = no rows (정상)

      if (data?.content) {
        setContent(data.content);
        setLastSaved(data.updated_at);
        return { found: true, content: data.content };
      }
      return { found: false, content: '' };
    } catch (e) {
      setError('로드 실패: ' + e.message);
      return { found: false, content: '' };
    } finally {
      setLoading(false);
    }
  }, []);

  /** 정적 HTML 파일에서 기본값 로드 (fetch로 전체 HTML 가져옴) */
  const fetchStaticDefault = useCallback(async (pageId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/edu/${pageId}.html`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      setContent(html);
      return { success: true, content: html };
    } catch (e) {
      setError('기본 파일 로드 실패: ' + e.message);
      return { success: false, content: '' };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Supabase에 HTML 콘텐츠 저장 (upsert) + XSS 필터링 + 감사 로깅 */
  const saveContent = useCallback(async (pageId, html) => {
    setSaving(true);
    setError(null);
    try {
      // admin 검증
      const auth = await verifyAdmin();
      if (!auth.ok) {
        setError(auth.error);
        return { success: false, error: auth.error };
      }

      // ── XSS 필터링 (DOMPurify 기반) ──
      const { html: sanitizedHtml, warnings } = sanitizeEduHtml(html);

      const { error: e } = await supabase
        .from('edu_html_content')
        .upsert(
          {
            page_id: pageId,
            content: sanitizedHtml,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'page_id' }
        );

      if (e) throw e;

      // 저장된 콘텐츠로 에디터 동기화 (필터링된 버전)
      if (sanitizedHtml !== html) {
        setContent(sanitizedHtml);
      }

      setLastSaved(new Date().toISOString());

      // ── 감사 로그 기록 (비동기, 실패해도 저장은 성공) ──
      logAudit(pageId, 'edu_html_save', warnings);

      return { success: true, warnings };
    } catch (e) {
      setError('저장 실패: ' + e.message);
      return { success: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, []);

  /** Supabase에서 콘텐츠 삭제 (원본 복원용) + 감사 로깅 */
  const deleteContent = useCallback(async (pageId) => {
    setSaving(true);
    setError(null);
    try {
      const auth = await verifyAdmin();
      if (!auth.ok) {
        setError(auth.error);
        return { success: false, error: auth.error };
      }

      const { error: e } = await supabase
        .from('edu_html_content')
        .delete()
        .eq('page_id', pageId);

      if (e) throw e;
      setContent('');
      setLastSaved(null);

      // 감사 로그
      logAudit(pageId, 'edu_html_delete');

      return { success: true };
    } catch (e) {
      setError('삭제 실패: ' + e.message);
      return { success: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    content,
    setContent,
    loading,
    saving,
    error,
    setError,
    lastSaved,
    fetchContent,
    fetchStaticDefault,
    saveContent,
    deleteContent,
  };
}

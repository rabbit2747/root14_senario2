import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useEduHtmlContent from '../../../hooks/useEduHtmlContent';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import './editor-theme.css';
import AdminGuideSection from '../../../components/admin/AdminGuideSection';
import eduMeta from '../../../data/edu-meta.json';
import { supabase } from '../../../lib/supabase';
import { Save, Document, Renew, View, ViewOff, Locked, WarningAlt, Security, CheckmarkFilled } from '@carbon/icons-react';

// ── Prism 하이라이팅 함수 ──
const highlightHtml = (code) => {
  try {
    return Prism.highlight(code || '', Prism.languages.markup, 'markup');
  } catch {
    return code || '';
  }
};

/**
 * 미리보기용 HTML 정화 — 보안에 영향 없는 요소만 제거
 * ① 인증 게이트 스크립트 (localStorage 접근 → sandbox에서 실패)
 * ② CSP 메타태그 ('self' 가 opaque origin과 충돌)
 * ③ 동적 로더 스크립트 (Supabase fetch → 미리보기에서 불필요)
 */
function sanitizeForPreview(html) {
  if (!html) return '';
  return html
    .replace(/<script>\s*\(function\(\)\s*\{[\s\S]*?auth-token[\s\S]*?<\/script>/i,
      '<!-- [preview] auth gate removed -->')
    .replace(/<script>\s*var\s+_eduDynLoaded[\s\S]*?<\/script>/i,
      '<!-- [preview] dynamic loader removed -->')
    .replace(/<script>\s*setTimeout\(function\(\)\s*\{\s*if\s*\(\s*!_eduDynLoaded[\s\S]*?<\/script>/i,
      '<!-- [preview] loader timeout removed -->')
    .replace(/<style>\s*html:not\(\.edu-ready\)[\s\S]*?<\/style>/i,
      '<!-- [preview] loader style removed -->')
    .replace(/<meta\s+http-equiv\s*=\s*"Content-Security-Policy"[^>]*>/i,
      '<!-- [preview] CSP removed (sandbox enforced) -->');
}

// ── 택틱 이름 매핑 ──
const TACTIC_LABELS = {
  t1: '📡 T1 — Reconnaissance',
  t2: '🛠️ T2 — Resource Development',
  t3: '🚪 T3 — Initial Access',
  t4: '⚡ T4 — Execution',
  t5: '🔗 T5 — Persistence',
  t6: '👑 T6 — Privilege Escalation',
  t7: '🛡️ T7 — Defense Evasion',
  t8: '🔑 T8 — Credential Access',
  t9: '🔍 T9 — Discovery',
  t10: '🔀 T10 — Lateral Movement',
  t11: '📦 T11 — Collection',
  t12: '📡 T12 — Command & Control',
  t13: '📤 T13 — Exfiltration',
  t14: '💥 T14 — Impact',
};

// ── edu-meta.json에서 42개 페이지 목록 자동 생성 (택틱별 그룹) ──
const EDU_PAGES_GROUPED = (() => {
  const groups = {};
  Object.entries(eduMeta.pages).forEach(([id, meta]) => {
    const tacticId = meta.tacticIds?.[0] || 'unknown';
    if (!groups[tacticId]) groups[tacticId] = [];
    groups[tacticId].push({
      id: meta.url.replace('/edu/', '').replace('.html', ''),
      techniqueKey: id,
      label: `${meta.subTechniqueId || meta.techniqueId} ${meta.titleEn}`,
      title: meta.title,
      tacticId,
    });
  });
  // 택틱 순서로 정렬
  return Object.entries(groups)
    .sort(([a], [b]) => parseInt(a.replace('t', '')) - parseInt(b.replace('t', '')))
    .map(([tacticId, pages]) => ({
      tacticId,
      label: TACTIC_LABELS[tacticId] || tacticId,
      pages: pages.sort((a, b) => a.label.localeCompare(b.label)),
    }));
})();

// 플랫 목록 (첫 페이지 기본 선택용)
const ALL_PAGES = EDU_PAGES_GROUPED.flatMap(g => g.pages);

/**
 * EduHtmlEditor — 관리자용 실습 HTML 페이지 에디터
 * - edu-meta.json 기반 42개 페이지 택틱별 드롭다운
 * - Prism.js 코드 하이라이팅 + 줄 번호
 * - srcdoc + sandbox="allow-scripts" iframe 격리 미리보기
 * - DOMPurify 기반 XSS 필터링 (저장 시)
 * - 감사 로깅 (IP/타임스탬프)
 * - Supabase 저장/로드/원본복원
 */
export default function EduHtmlEditor({ requestVerify }) {
  const {
    content, setContent,
    loading, saving, error, setError,
    lastSaved,
    fetchContent, fetchStaticDefault, saveContent, deleteContent,
  } = useEduHtmlContent();

  const [selectedPage, setSelectedPage] = useState(ALL_PAGES[0]?.id || '');
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [xssWarnings, setXssWarnings] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [overridePages, setOverridePages] = useState(new Set());
  const gutterRef = useRef(null);
  const editorWrapRef = useRef(null);

  // ── Supabase 오버라이드 존재 여부 로드 ──
  useEffect(() => {
    supabase.from('edu_html_content').select('page_id').then(({ data }) => {
      if (data) setOverridePages(new Set(data.map(d => d.page_id)));
    });
  }, [lastSaved]); // 저장 시 새로고침

  // ── 검색 필터 ──
  const filteredGroups = useMemo(() => {
    if (!searchFilter.trim()) return EDU_PAGES_GROUPED;
    const q = searchFilter.toLowerCase();
    return EDU_PAGES_GROUPED.map(group => ({
      ...group,
      pages: group.pages.filter(p =>
        p.label.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        group.label.toLowerCase().includes(q)
      ),
    })).filter(g => g.pages.length > 0);
  }, [searchFilter]);

  // ── 페이지 선택 시 Supabase에서 로드 ──
  useEffect(() => {
    if (!selectedPage) return;
    (async () => {
      const result = await fetchContent(selectedPage);
      if (!result.found) {
        await fetchStaticDefault(selectedPage);
      }
      setHasChanges(false);
      setXssWarnings([]);
    })();
  }, [selectedPage, fetchContent, fetchStaticDefault]);

  // ── 에디터 ↔ 줄번호 스크롤 동기화 ──
  useEffect(() => {
    const wrap = editorWrapRef.current;
    if (!wrap) return;
    const handleScroll = () => {
      if (gutterRef.current) {
        gutterRef.current.scrollTop = wrap.scrollTop;
      }
    };
    wrap.addEventListener('scroll', handleScroll, { passive: true });
    return () => wrap.removeEventListener('scroll', handleScroll);
  }, []);

  // ── 저장 (XSS 필터링 + 감사 로깅 포함) ──
  const handleSave = async () => {
    if (requestVerify) {
      const ok = await requestVerify();
      if (!ok) return;
    }
    const result = await saveContent(selectedPage, content);
    if (result.success) {
      const warns = result.warnings || [];
      setXssWarnings(warns);
      setToast(warns.length > 0 ? `저장 완료! (XSS ${warns.length}건 필터링됨)` : '저장 완료!');
      setHasChanges(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  // ── 기본값 불러오기 ──
  const handleLoadDefault = async () => {
    if (hasChanges && !confirm('현재 수정 내용을 버리고 기본값을 불러올까요?')) return;
    await fetchStaticDefault(selectedPage);
    setHasChanges(true);
    setXssWarnings([]);
    setToast('기본 파일 로드 완료');
    setTimeout(() => setToast(null), 2500);
  };

  // ── 원본 복원 ──
  const handleRestore = async () => {
    if (!confirm('Supabase에 저장된 수정본을 삭제하고 원본으로 복원할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
    if (requestVerify) {
      const ok = await requestVerify();
      if (!ok) return;
    }
    const result = await deleteContent(selectedPage);
    if (result.success) {
      await fetchStaticDefault(selectedPage);
      setHasChanges(false);
      setXssWarnings([]);
      setToast('원본 복원 완료');
      setTimeout(() => setToast(null), 2500);
    }
  };

  // ── srcdoc 미리보기 ──
  const previewHtml = useMemo(() => {
    if (!showPreview || !content) return null;
    return sanitizeForPreview(content);
  }, [showPreview, content]);

  const lineCount = content ? content.split('\n').length : 0;
  const charCount = content ? content.length : 0;
  const editorHeight = showPreview ? 500 : 600;

  // ── 현재 선택 페이지 정보 ──
  const currentPageInfo = ALL_PAGES.find(p => p.id === selectedPage);

  return (
    <div className="space-y-4">
      {/* ── 헤더 ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧪</span>
          <div>
            <h2 className="text-lg font-black text-slate-800">실습 페이지 편집</h2>
            <p className="text-xs text-slate-500">
              교육 실습 HTML 콘텐츠를 직접 편집합니다
              <span className="ml-2 text-blue-500 font-bold">{ALL_PAGES.length}개 페이지</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── 페이지 선택 영역 ── */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 검색 필터 */}
          <input
            type="text"
            placeholder="🔍 페이지 검색 (기법명, ID...)"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-52"
          />
          {/* 택틱별 그룹 드롭다운 */}
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-[300px]"
          >
            {filteredGroups.map(group => (
              <optgroup key={group.tacticId} label={group.label}>
                {group.pages.map(p => (
                  <option key={p.id} value={p.id}>
                    {overridePages.has(p.id) ? '● ' : '  '}{p.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {/* 현재 선택 페이지 요약 */}
        {currentPageInfo && (
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="font-bold text-slate-600">{currentPageInfo.title}</span>
            <span className="font-mono">/edu/{currentPageInfo.id}.html</span>
            {overridePages.has(selectedPage) && (
              <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Supabase 수정본</span>
            )}
          </div>
        )}
      </div>

      {/* ── 에러 표시 ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-red-600 flex items-center gap-1"><WarningAlt size={14} /> {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
        </div>
      )}

      {/* ── XSS 필터링 경고 ── */}
      {xssWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-amber-700 flex items-center gap-1"><Security size={14} /> XSS 필터링 결과</span>
            <button onClick={() => setXssWarnings([])} className="text-amber-400 hover:text-amber-600 text-sm">✕</button>
          </div>
          <ul className="text-[11px] text-amber-600 space-y-0.5 list-disc list-inside">
            {xssWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* ── 토스트 ── */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-xs font-bold text-emerald-600">
          <CheckmarkFilled size={14} className="inline" /> {toast}
        </div>
      )}

      {/* ── 도구 모음 ── */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm">
        <button
          onClick={handleSave}
          disabled={saving || loading || !content}
          className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {saving ? '저장 중...' : <><Save size={14} className="inline" /> 저장</>}
        </button>
        <button
          onClick={handleLoadDefault}
          disabled={loading}
          className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <Document size={14} className="inline" /> 기본값 불러오기
        </button>
        <button
          onClick={handleRestore}
          disabled={saving || loading || !lastSaved}
          className="text-xs font-bold px-3 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
          title="Supabase에 저장된 수정본을 삭제하고 정적 파일 원본으로 복원"
        >
          <Renew size={14} className="inline" /> 원본 복원
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(prev => !prev)}
          className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
            showPreview
              ? 'bg-blue-50 border-blue-300 text-blue-600'
              : 'border-slate-300 text-slate-500 hover:bg-slate-50'
          }`}
        >
          {showPreview ? <><ViewOff size={14} className="inline" /> 미리보기 닫기</> : <><View size={14} className="inline" /> 미리보기</>}
        </button>
        {/* 상태 정보 */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
          <span>{lineCount.toLocaleString()} 줄</span>
          <span>{(charCount / 1024).toFixed(1)} KB</span>
          {hasChanges && <span className="text-amber-500 font-bold">● 수정됨</span>}
          {lastSaved && !hasChanges && (
            <span className="text-emerald-500">✓ 저장됨</span>
          )}
        </div>
      </div>

      {/* ── 에디터 영역 ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-lg border border-slate-200">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* 코드 에디터 (Prism.js + 줄 번호) */}
          <div className="relative rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
            {/* 라벨 */}
            <div className="absolute top-2 left-14 text-[9px] font-mono text-slate-500 pointer-events-none z-20">
              HTML
            </div>

            <div
              className="flex overflow-auto"
              ref={editorWrapRef}
              style={{ maxHeight: editorHeight }}
            >
              {/* 줄 번호 거터 */}
              <div
                ref={gutterRef}
                className="edu-line-gutter flex-shrink-0 pt-7 pb-4 pr-2 pl-2 bg-slate-800/60 text-slate-600 text-right font-mono text-[12px] select-none border-r border-slate-700/50 overflow-hidden"
                style={{ minWidth: 44 }}
              >
                {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Prism 코드 에디터 */}
              <div className="edu-code-editor flex-1 min-w-0">
                <Editor
                  value={content || ''}
                  onValueChange={(code) => { setContent(code); setHasChanges(true); }}
                  highlight={highlightHtml}
                  tabSize={2}
                  insertSpaces={true}
                  padding={{ top: 28, right: 16, bottom: 16, left: 12 }}
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 12,
                    lineHeight: '1.625',
                    minHeight: editorHeight,
                    color: '#e2e8f0',
                    background: 'transparent',
                  }}
                  textareaClassName="focus:outline-none"
                  placeholder="HTML 코드를 입력하세요..."
                />
              </div>
            </div>
          </div>

          {/* 미리보기 iframe — sandbox로 부모 페이지 완전 격리 */}
          {showPreview && previewHtml && (
            <div className="relative">
              <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-400 pointer-events-none z-10 bg-white/80 px-1.5 py-0.5 rounded">
                미리보기 <Locked size={12} className="inline" />
              </div>
              <iframe
                srcDoc={previewHtml}
                title="실습 페이지 미리보기"
                className="w-full rounded-lg border border-slate-200 bg-white"
                style={{ minHeight: editorHeight }}
                sandbox="allow-scripts"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      )}

      <AdminGuideSection
        steps={[
          '상단 드롭다운에서 편집할 교육 페이지를 선택합니다 (검색으로 빠르게 찾을 수 있습니다)',
          '택틱별(T1~T14) 그룹으로 42개 페이지가 분류되어 있습니다',
          '● 표시가 있는 페이지는 Supabase에 수정본이 저장된 상태입니다',
          '기본값 불러오기: public/edu/ 폴더의 원본 HTML을 에디터에 로드합니다',
          '코드를 수정한 후 저장 버튼 → 관리자 비밀번호 재검증 → Supabase에 저장됩니다',
          '미리보기: 편집 내용을 iframe에서 실시간 확인할 수 있습니다',
          '원본 복원: Supabase에 저장된 내용을 삭제하고 원본 HTML로 되돌립니다',
        ]}
        tips={[
          '저장 시 위험한 스크립트(XSS)가 자동 필터링됩니다 — 경고가 표시되면 해당 코드를 확인하세요',
          'auth gate(인증 스크립트)를 삭제하면 비로그인 사용자도 페이지에 접근할 수 있으니 주의하세요',
          '수정한 콘텐츠는 사용자가 해당 교육 페이지에 접속할 때 자동으로 적용됩니다',
        ]}
      />
    </div>
  );
}

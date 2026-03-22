// ============================================================
// sanitizeHtml.js — edu HTML 저장 전 XSS 페이로드 필터링
//
// 전략:
//  ① DOMPurify 로 body 콘텐츠 이상 탐지 (detection)
//  ② 정규식으로 인라인 이벤트 핸들러 & javascript: URI 정밀 제거
//     (전체 HTML 구조를 리스트럭처링하지 않음)
//
// 왜 DOMPurify 전체 적용하지 않는가?
//  → WHOLE_DOCUMENT 모드는 head/body 구조를 재배치하여
//    관리자가 편집 중인 원본 HTML의 구조를 깨뜨릴 수 있음
//  → 대신 body 내 콘텐츠만 DOMPurify로 검증하고,
//    이벤트 핸들러/javascript URI는 정규식으로 정밀 제거
// ============================================================
import DOMPurify from 'dompurify';

/**
 * 교육 HTML 콘텐츠 저장 전 XSS 필터링
 * @param {string} html - 전체 HTML 문서
 * @returns {{ html: string, warnings: string[] }}
 */
export function sanitizeEduHtml(html) {
  if (!html) return { html: '', warnings: [] };

  const warnings = [];
  let clean = html;

  // ── ① DOMPurify: body 콘텐츠 이상 탐지 ──
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    const rawBody = bodyMatch[1];
    const purifiedBody = DOMPurify.sanitize(rawBody, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ['style', 'iframe'],
      ALLOW_DATA_ATTR: true,
      ALLOW_ARIA_ATTR: true,
    });
    // DOMPurify가 5% 이상 콘텐츠를 제거했으면 경고
    if (purifiedBody.length < rawBody.length * 0.95) {
      warnings.push('⚠️ body 콘텐츠에서 잠재적 XSS 요소 감지 (DOMPurify)');
    }
  }

  // ── ② 인라인 이벤트 핸들러 제거 ──
  // <tag ... onclick="..." ...> → <tag ... ...>
  clean = clean.replace(
    /(<[a-z][a-z0-9]*\b[^>]*?)\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    (_, prefix) => {
      warnings.push('🛡️ 인라인 이벤트 핸들러 제거됨');
      return prefix;
    }
  );

  // ── ③ javascript: URI 제거 ──
  clean = clean.replace(
    /((?:href|src|action|formaction)\s*=\s*)["']javascript:[^"']*["']/gi,
    (_, attr) => {
      warnings.push('🛡️ javascript: URI 제거됨');
      return `${attr}"#"`;
    }
  );

  // ── ④ data: URI in executable tags 제거 ──
  clean = clean.replace(
    /(<(?:script|iframe|embed|object)\b[^>]*\s+src\s*=\s*)["']data:[^"']*["']/gi,
    (_, prefix) => {
      warnings.push('🛡️ data: URI (실행 가능 태그) 제거됨');
      return `${prefix}""`;
    }
  );

  return { html: clean, warnings: [...new Set(warnings)] };
}

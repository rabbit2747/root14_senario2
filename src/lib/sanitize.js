/**
 * 보안 유틸리티 — XSS 방어용 입력 sanitizer
 * React JSX는 자동 escaping하지만, DB 저장 전 방어 계층 추가
 */

/**
 * HTML 태그를 제거하고 안전한 텍스트만 반환
 * 사용자 입력(댓글, 공지 제목/내용)에 적용
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')       // HTML 태그 제거
    .replace(/&lt;/g, '<')         // 이미 이스케이프된 것은 유지
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * 텍스트를 HTML 엔티티로 이스케이프 (innerHTML에 삽입 시 사용)
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * URL이 안전한 내부 경로인지 검증
 * Open Redirect 방어: 외부 URL, protocol-relative URL 차단
 */
export function isSafeRedirect(url) {
  if (typeof url !== 'string') return false;
  const decoded = decodeURIComponent(url);
  // 내부 경로만 허용 (/ 시작, // 불가, protocol 불가)
  if (!decoded.startsWith('/')) return false;
  if (decoded.startsWith('//')) return false;
  if (/^\/[\\]/.test(decoded)) return false;
  // javascript:, data: 등 위험 프로토콜 차단
  if (/^[a-z]+:/i.test(decoded.replace(/^\/+/, ''))) return false;
  return true;
}

/**
 * 이메일 마스킹: operator@domain.com → op***@domain.com
 */
export function maskEmail(email) {
  if (!email) return '';
  const atIdx = email.indexOf('@');
  if (atIdx < 0) return '***';
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***${domain}`;
}

/**
 * 이름 마스킹: 홍길동 → 홍***, John → J***
 */
export function maskName(name) {
  if (!name) return '';
  return name.charAt(0) + '***';
}

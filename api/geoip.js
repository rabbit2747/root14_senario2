// Vercel Serverless — POST /api/geoip
// IP 배열 → 지오로케이션 배치 반환 (ip-api.com, 무료 45req/분)
// ⚠️ Serverless: 캐시는 인스턴스 내에서만 유지 (cold start 시 리셋)

const geoCache = new Map();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간
const GEO_CACHE_MAX = 5000;

function isPrivateIP(ip) {
  return !ip || ip === 'unknown' || ip === '::1' ||
    ip.startsWith('127.') || ip.startsWith('10.') ||
    ip.startsWith('192.168.') || ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') || ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') || ip.startsWith('172.2') ||
    ip.startsWith('172.30.') || ip.startsWith('172.31.') ||
    ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { ips } = req.body || {};
  if (!Array.isArray(ips) || ips.length === 0) return res.json({});

  const uniqueIps = [...new Set(ips)].slice(0, 100);
  const result = {};
  const toResolve = [];

  for (const ip of uniqueIps) {
    if (isPrivateIP(ip)) {
      result[ip] = { country: '로컬', countryCode: 'LOCAL', city: '-' };
      continue;
    }
    const cached = geoCache.get(ip);
    if (cached && (Date.now() - cached.ts) < GEO_CACHE_TTL) {
      result[ip] = { country: cached.country, countryCode: cached.countryCode, city: cached.city };
      continue;
    }
    toResolve.push(ip);
  }

  if (toResolve.length > 0) {
    try {
      const batchRes = await fetch('http://ip-api.com/batch?fields=query,country,countryCode,city,status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toResolve.map(ip => ({ query: ip, fields: 'query,country,countryCode,city,status' }))),
      });
      const batchData = await batchRes.json();

      for (const item of batchData) {
        if (item.status === 'success') {
          const geo = { country: item.country, countryCode: item.countryCode, city: item.city || '-' };
          result[item.query] = geo;
          geoCache.set(item.query, { ...geo, ts: Date.now() });
        } else {
          result[item.query] = { country: '알 수 없음', countryCode: '??', city: '-' };
        }
      }
    } catch (err) {
      for (const ip of toResolve) {
        if (!result[ip]) result[ip] = { country: '알 수 없음', countryCode: '??', city: '-' };
      }
    }
  }

  // 캐시 정리
  if (geoCache.size > GEO_CACHE_MAX) {
    const now = Date.now();
    for (const [k, v] of geoCache) {
      if (now - v.ts > GEO_CACHE_TTL) geoCache.delete(k);
    }
  }

  res.json(result);
}

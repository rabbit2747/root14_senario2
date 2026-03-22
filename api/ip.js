// Vercel Serverless — GET /api/ip
// 클라이언트 IP 반환 (자체 호스팅, 제3자 의존 없음)

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const xff = req.headers['x-forwarded-for'];
  const ip = xff ? xff.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
  res.json({ ip });
}

// Vercel Serverless — POST /api/auth/report-success
// 로그인 성공 → 실패 카운트 초기화

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  // Serverless 환경: 다른 인스턴스의 loginAttempts를 초기화할 수 없지만
  // 성공 응답을 반환해 클라이언트 측 localStorage 초기화 트리거
  return res.json({ ok: true });
}

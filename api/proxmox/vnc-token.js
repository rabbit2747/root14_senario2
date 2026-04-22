// Proxmox noVNC 웹 콘솔 토큰 발급 (v1.4.0-draft · 미운영)
//
// 흐름: session.js 에서 발급된 vmid + ticket 으로 vncproxy 호출 → 포트/티켓 반환
// 클라이언트는 noVNC iframe 으로 wss://host:port 연결 (websockify 프록시)
// 요구 ENV: PROXMOX_URL / PROXMOX_TOKEN_* / PROXMOX_WS_PROXY_HOST

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, vmid } = req.body || {};
  if (!sessionId || !vmid) return res.status(400).json({ error: 'sessionId, vmid required' });

  // TODO: 세션 소유자 검증 (JWT)
  // TODO: Proxmox API: POST /nodes/{node}/qemu/{vmid}/vncproxy?websocket=1
  //   → { ticket, port, upid, cert }
  // TODO: websockify 프록시 경유 URL 반환

  return res.status(501).json({
    error: 'not_implemented',
    message: 'noVNC 토큰 발급 API는 계획 단계입니다.',
    sessionId,
    vmid,
  });
}

// Proxmox VM 세션 생성 스켈레톤 (v1.4.0-draft)
//
// 목적: 학습자가 APT 시나리오 중 실제 실습이 필요한 지점에서 가상 실습환경 부여
// 상태: 미운영 · 계획 중 — Proxmox VE API 연결 전
//
// 흐름 (최종):
//   1) POST /api/proxmox/session { campaignId, missionId } → 풀에서 VM 1대 할당
//   2) templateId 기반 clone → ticket + csrfPrevention 발급
//   3) /api/proxmox/vnc-token 으로 noVNC 포워딩 토큰 발급
//   4) 30분 TTL + 학습자당 1세션 제한 + 자동 destroy
//
// 보안 체크: Supabase JWT 검증 · rate limit · 학습자 격리 네트워크(VLAN)
// 요구 ENV: PROXMOX_URL / PROXMOX_TOKEN_ID / PROXMOX_TOKEN_SECRET / PROXMOX_NODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { campaignId, missionId } = req.body || {};
  if (!campaignId) return res.status(400).json({ error: 'campaignId required' });

  // TODO: Supabase JWT 검증 → userId 추출
  // TODO: rate limit (학습자당 1세션)
  // TODO: Proxmox API clone 호출
  //   const ticket = await proxmoxAuth();
  //   const vmid = await cloneTemplate(ticket, TEMPLATE_MAP[campaignId]);
  //   await startVM(ticket, vmid);

  return res.status(501).json({
    error: 'not_implemented',
    message: 'Proxmox 세션 API는 현재 계획 단계입니다.',
    plannedFeatures: [
      'VM 풀에서 템플릿 clone',
      'noVNC 웹 콘솔 포워딩',
      '30분 TTL 자동 destroy',
      '학습자별 격리 VLAN',
    ],
    campaignId,
    missionId,
  });
}

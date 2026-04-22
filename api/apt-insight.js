// Claude API 실시간 ATT&CK 인사이트 (v1.4.0-draft)
//
// 목적: 학습자가 시나리오 Scene 전환 시점에 Claude가 실시간 해설
//   · 지금 이 행동이 어떤 TTP(T1xxx)에 해당하는지
//   · 유사 캠페인 2~3개 제시 (연관성)
//   · 다음 장면에서 일어날 일 힌트 (연결성)
//
// 상태: 스켈레톤 — ANTHROPIC_API_KEY 설정 후 활성화
// 비용 관리: Scene 전환당 1회 호출 + 응답 캐시 (campaignId+sceneId 키)

const MAX_TOKENS = 400;
const SYSTEM_PROMPT = `당신은 MITRE ATT&CK 전문 교육 설계자입니다.
학습자가 APT 공격 시나리오의 특정 장면에 도달했을 때, 3가지 관점으로 짧고 선명하게 해설하세요:

1. 🔗 연계성: 이 장면이 앞 장면의 무엇을 전제로 하는가 (1문장)
2. 🕸️ 연관성: 같은 TTP를 쓴 다른 캠페인 2개 (ID + 한 줄 설명)
3. ▶ 연결성: 다음 장면에서 공격자가 노리는 것 (1문장 티저)

⚠️ 학습자 UI에 "연계성/연관성/연결성" 단어는 절대 쓰지 말 것. 자연어로 녹여서.
JSON 형식으로만 응답: { continuity, relevance: [{id,note}], coherence }`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { campaignId, sceneId, sceneSummary } = req.body || {};
  if (!campaignId || !sceneId) {
    return res.status(400).json({ error: 'campaignId, sceneId required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(501).json({
      error: 'not_configured',
      message: 'ANTHROPIC_API_KEY 미설정 — Claude 인사이트는 곧 활성화됩니다.',
      fallback: {
        continuity: '앞 장면에서 공격자는 초기 접근을 확보했습니다.',
        relevance: [
          { id: 'C0024', note: 'SolarWinds — 공급망 침투로 동일 TTP 사용' },
          { id: 'C0015', note: 'Conti — 측면 이동 단계에서 유사한 크리덴셜 덤프' },
        ],
        coherence: '다음 장면에서 권한 상승 시도가 관찰될 것입니다.',
      },
    });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `캠페인: ${campaignId}\n장면: ${sceneId}\n장면요약: ${sceneSummary || '(없음)'}`,
        }],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(502).json({ error: 'claude_upstream', detail: errText.slice(0, 500) });
    }

    const data = await r.json();
    const text = data?.content?.[0]?.text || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    return res.status(200).json({ ok: true, insight: parsed });
  } catch (err) {
    return res.status(500).json({ error: 'internal', message: err.message });
  }
}

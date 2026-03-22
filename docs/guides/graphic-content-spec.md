# Graphic Content 스펙 문서
# 작성일: 2026-03-06 | 버전: v0.9.2

---

## 1. 파일 위치 규칙

```
src/data/graphic-contents/
  {techniqueId}-{level}.json

예시:
  T1587.001-beginner.json
  T1587.001-intermediate.json
  T1587.001-advanced.json
  T1566.001-beginner.json
```

---

## 2. JSON 스키마 정의 (전체 필드)

```jsonc
{
  // ── 식별자 (필수) ──
  "techniqueId": "T1587.001",          // MITRE ATT&CK 기법 ID
  "level": "beginner",                  // novice | beginner | intermediate | advanced | expert
  "title": "악성 코드 개발",            // 한국어 제목 (eduMeta와 동일하게)
  "titleEn": "Develop Malware",         // 영문 제목

  // ── 개요 (필수) ──
  "summary": "공격자가 탐지를 피하기 위해 직접 맞춤형 악성 코드를 제작하는 기법입니다. 일반 백신으로는 탐지하기 어렵고, 특정 목표 시스템에 최적화되어 있습니다.",

  // ── 공격 흐름 다이어그램 (필수, 3~6 단계) ──
  "attackFlow": [
    {
      "step": 1,
      "label": "목표 설정",             // 짧은 단계명 (5자 이내 권장)
      "icon": "🎯",                     // 이모지
      "color": "#3b82f6",               // 단계 색상 (hex)
      "desc": "공격자가 침투 목표와 필요한 기능(정보 탈취, 지속 유지 등)을 정의합니다.",
      "detail": "이 단계에서 공격자는 어떤 OS, 언어, 회피 기법을 사용할지 결정합니다."
                                        // detail은 선택 필드 (툴팁 등에 활용 가능)
    },
    {
      "step": 2,
      "label": "개발 환경 구축",
      "icon": "⚙️",
      "color": "#f59e0b",
      "desc": "C2 통신, 페이로드 실행, 지속성 유지에 필요한 개발 환경을 준비합니다."
    },
    {
      "step": 3,
      "label": "코드 작성",
      "icon": "📝",
      "color": "#8b5cf6",
      "desc": "역방향 셸, 키로거, 파일 탈취 등 핵심 기능을 코드로 구현합니다."
    },
    {
      "step": 4,
      "label": "탐지 우회",
      "icon": "🛡️",
      "color": "#ef4444",
      "desc": "백신 및 EDR 탐지를 피하기 위해 난독화, 패킹, 서명 위조 등을 적용합니다."
    },
    {
      "step": 5,
      "label": "테스트 및 배포",
      "icon": "🚀",
      "color": "#22c55e",
      "desc": "격리 환경에서 동작을 검증한 후 실제 공격에 사용합니다."
    }
  ],

  // ── 핵심 포인트 (필수, 2~5개) ──
  "keyPoints": [
    "맞춤형 악성 코드는 일반 시그니처 기반 백신으로 탐지하기 매우 어렵습니다",
    "공격자는 오픈소스 툴을 변형하거나 완전히 새로 작성하여 탐지를 피합니다",
    "타깃 시스템의 OS/언어/보안 솔루션에 맞게 최적화된 코드를 사용합니다"
  ],

  // ── 방어자 탐지 힌트 (필수, 2~4개) ──
  "detectionHints": [
    "행동 기반 탐지(EDR): 알려지지 않은 프로세스의 이상 행동 모니터링",
    "메모리 포렌식: 실행 중인 프로세스에서 의심스러운 코드 패턴 분석",
    "네트워크 이상 탐지: C2 서버와의 비정상적 통신 패턴 식별"
  ],

  // ── 다이어그램 노드 (선택, 공격 관계 시각화용) ──
  "diagram": {
    "type": "flow",                     // "flow" | "kill-chain" | "timeline"
    "nodes": [
      { "id": "attacker", "label": "공격자",     "icon": "👤", "color": "#ef4444" },
      { "id": "dev",      "label": "개발 환경",   "icon": "💻", "color": "#f59e0b" },
      { "id": "malware",  "label": "악성 코드",   "icon": "🦠", "color": "#8b5cf6" },
      { "id": "target",   "label": "피해 시스템", "icon": "🖥️", "color": "#3b82f6" }
    ],
    "edges": [
      { "from": "attacker", "to": "dev",     "label": "제작" },
      { "from": "dev",      "to": "malware", "label": "빌드" },
      { "from": "malware",  "to": "target",  "label": "배포/실행" }
    ]
  }
}
```

---

## 3. 실제 샘플 파일 (T1587.001-beginner.json)

아래 내용을 `src/data/graphic-contents/T1587.001-beginner.json` 으로 저장:

```json
{
  "techniqueId": "T1587.001",
  "level": "beginner",
  "title": "악성 코드 개발",
  "titleEn": "Develop Malware",
  "summary": "공격자가 탐지를 피하기 위해 직접 맞춤형 악성 코드를 제작하는 기법입니다. 일반 백신 프로그램으로는 탐지하기 어려운 경우가 많으며, 특정 목표 시스템에 최적화되어 있습니다.",
  "attackFlow": [
    {
      "step": 1,
      "label": "목표 설정",
      "icon": "🎯",
      "color": "#3b82f6",
      "desc": "공격자가 침투 목표(정보 탈취, 랜섬웨어 등)와 필요한 기능을 정의합니다."
    },
    {
      "step": 2,
      "label": "환경 구축",
      "icon": "⚙️",
      "color": "#f59e0b",
      "desc": "C2 통신 모듈, 페이로드 실행 기능 개발을 위한 환경을 준비합니다."
    },
    {
      "step": 3,
      "label": "코드 작성",
      "icon": "📝",
      "color": "#8b5cf6",
      "desc": "역방향 셸, 키로거, 파일 탈취 등 핵심 기능을 직접 코딩합니다."
    },
    {
      "step": 4,
      "label": "탐지 우회",
      "icon": "🛡️",
      "color": "#ef4444",
      "desc": "난독화, 패킹, 안티 디버깅 등으로 백신/EDR 탐지를 피합니다."
    },
    {
      "step": 5,
      "label": "배포 준비",
      "icon": "🚀",
      "color": "#22c55e",
      "desc": "격리 환경에서 테스트 후 실제 공격 캠페인에 투입합니다."
    }
  ],
  "keyPoints": [
    "맞춤형 악성 코드는 일반 시그니처 백신으로 탐지하기 매우 어렵습니다",
    "오픈소스 툴을 변형하거나 완전히 새로 작성하여 탐지 회피합니다",
    "타깃 OS와 보안 솔루션에 맞게 최적화된 코드가 사용됩니다"
  ],
  "detectionHints": [
    "행동 기반 탐지(EDR): 알려지지 않은 프로세스의 이상 행동 모니터링",
    "메모리 포렌식: 실행 중인 프로세스 내 의심 코드 패턴 분석",
    "네트워크 이상 탐지: C2 서버와의 비정상적 통신 패턴 식별"
  ]
}
```

---

## 4. GraphicExplanationPage.jsx 수정 내용

### 4-1. import.meta.glob 추가 (파일 최상단 import 아래)

```js
// ── 그래픽 콘텐츠 JSON 동적 로더 (Vite glob) ──
const GRAPHIC_CONTENT_MODULES = import.meta.glob('../data/graphic-contents/*.json');
```

### 4-2. useState + useEffect 추가 (authChecked 선언 아래)

```js
const [content, setContent] = useState(null);
const [contentLoading, setContentLoading] = useState(true);

// 그래픽 콘텐츠 JSON 로드
useEffect(() => {
  if (!authChecked) return;
  const key = `../data/graphic-contents/${techniqueId}-${level}.json`;
  const loader = GRAPHIC_CONTENT_MODULES[key];
  if (loader) {
    loader()
      .then(mod => { setContent(mod.default || mod); setContentLoading(false); })
      .catch(() => { setContent(null); setContentLoading(false); });
  } else {
    setContent(null);
    setContentLoading(false);
  }
}, [authChecked, techniqueId, level]);
```

### 4-3. 메인 콘텐츠 영역 교체

현재 플레이스홀더 영역(`{/* ── 메인 콘텐츠 영역 (플레이스홀더) ── */}`)을 아래로 교체:

```jsx
{/* ── 메인 콘텐츠 영역 ── */}
<div className="flex-1 max-w-6xl mx-auto px-4 w-full pb-32">
  {contentLoading ? (
    /* 로딩 스피너 */
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-amber-300/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  ) : content ? (
    /* ── 실제 콘텐츠 렌더링 ── */
    <div className="space-y-8">

      {/* 요약 */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-6">
        <p className="text-slate-300 text-sm leading-relaxed">{content.summary}</p>
      </div>

      {/* 공격 흐름 다이어그램 */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">⚡ 공격 흐름</h2>
        <div className="flex flex-wrap items-center gap-2">
          {content.attackFlow.map((node, i) => (
            <React.Fragment key={node.step}>
              <div
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl border min-w-[100px]"
                style={{ borderColor: node.color + '40', backgroundColor: node.color + '12' }}
              >
                <span className="text-2xl">{node.icon}</span>
                <span className="text-xs font-bold" style={{ color: node.color }}>{node.label}</span>
                <span className="text-xs text-slate-500 text-center leading-relaxed max-w-[120px]">{node.desc}</span>
              </div>
              {i < content.attackFlow.length - 1 && (
                <span className="text-slate-600 text-xl flex-shrink-0">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 핵심 포인트 + 탐지 힌트 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">💡 핵심 포인트</h3>
          <ul className="space-y-2">
            {content.keyPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
          <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">🛡️ 방어자 탐지 힌트</h3>
          <ul className="space-y-2">
            {content.detectionHints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                {hint}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  ) : (
    /* ── 플레이스홀더 (콘텐츠 없을 때) ── */
    <div className="rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-900/40 p-12 text-center min-h-[400px] flex flex-col items-center justify-center gap-6">
      <div className="text-6xl opacity-40">🎨</div>
      <div>
        <h2 className="text-xl font-bold text-slate-300 mb-3">{t.placeholderTitle}</h2>
        <p className="text-slate-500 text-sm max-w-md leading-relaxed">{t.placeholderDesc}</p>
      </div>
      <div className="text-xs text-slate-600 mt-2">
        [{techniqueId} / {level}] 그래픽 콘텐츠 준비 중
        <br/>
        → src/data/graphic-contents/{techniqueId}-{level}.json 파일을 추가하세요
      </div>
    </div>
  )}
</div>
```

---

## 5. 제미나이(Gemini) 프롬프트 템플릿

아래 프롬프트를 복사해서 Gemini에 붙여넣기. `{...}` 부분만 원하는 값으로 교체.

```
MITRE ATT&CK 기법 {T1587.001 - Develop Malware}의 {beginner(초급)} 수준
그래픽 교육 콘텐츠를 아래 JSON 형식으로 정확히 출력해줘.

--- 출력 형식 ---
{
  "techniqueId": "{T1587.001}",
  "level": "{beginner}",
  "title": "한국어 기법 이름",
  "titleEn": "영문 기법 이름",
  "summary": "2~3문장. 공격자가 이 기법을 왜, 어떻게 사용하는지 설명. 초급 눈높이로.",
  "attackFlow": [
    {
      "step": 1,
      "label": "5자 이내 단계명",
      "icon": "단계를 표현하는 이모지 1개",
      "color": "#hex (단계마다 다른 색상)",
      "desc": "이 단계에서 공격자가 하는 행동을 1~2문장으로"
    }
    // 총 3~6 단계
  ],
  "keyPoints": [
    "이 기법의 핵심 특징 또는 위험성 (1문장)",
    "두 번째 핵심 포인트",
    "세 번째 핵심 포인트"
  ],
  "detectionHints": [
    "방어자가 이 기법을 탐지할 수 있는 방법 1 (구체적으로)",
    "탐지 방법 2",
    "탐지 방법 3"
  ]
}
--- 출력 규칙 ---
- JSON 외 다른 텍스트 없이 JSON만 출력
- 모든 텍스트는 한국어
- attackFlow의 color는 각 단계마다 다르게: 파란계열(#3b82f6), 노란계열(#f59e0b), 보라계열(#8b5cf6), 빨간계열(#ef4444), 초록계열(#22c55e) 순서 권장
- 초급(beginner) 수준이므로 기술 용어 최소화, 비유 사용 권장
- keyPoints와 detectionHints는 각 3개씩
```

### 레벨별 수준 조정 가이드

| 레벨 | 특징 | 프롬프트에 추가할 지시 |
|------|------|----------------------|
| novice (입문) | 완전 초보, 비유 위주 | "IT 비전공자도 이해할 수 있도록, 기술 용어 없이 일상 언어로" |
| beginner (초급) | 기본 개념 이해 | "보안 입문자 눈높이, 핵심 개념 위주" |
| intermediate (중급) | 기술적 세부사항 | "보안 실무자 수준, 구체적인 기술 스택과 도구명 포함" |
| advanced (고급) | 심화 분석 | "침해사고 대응 경험자 수준, MITRE ATT&CK Sub-technique 세부 차이 포함" |
| expert (전문가) | 연구/개발 수준 | "악성 코드 분석가/연구자 수준, 코드 레벨 분석 및 IOC 포함" |

---

## 6. 작업 순서 (체크리스트)

```
새 기법 그래픽 콘텐츠 추가 시:

[ ] 1. 제미나이에서 위 프롬프트로 JSON 생성
[ ] 2. 출력된 JSON 검토 (기술 오류, 한국어 어색함 수정)
[ ] 3. src/data/graphic-contents/{techniqueId}-{level}.json 으로 저장
[ ] 4. GraphicExplanationPage 자동 반영 확인 (코드 수정 불필요)
[ ] 5. 브라우저에서 /edu/graphic/{techniqueId}/{level} 접속 확인
```

---

## 7. 현재 구현 상태

```
GraphicExplanationPage.jsx
  현재: 플레이스홀더만 표시
  목표: graphic-contents/*.json 파일 존재 시 실제 콘텐츠 렌더링

수정 완료 후 동작:
  src/data/graphic-contents/T1587.001-beginner.json 존재 → 실제 콘텐츠 표시
  파일 없음 → 기존 플레이스홀더 표시 (하위 호환 유지)
```

> ⚠️ **GraphicExplanationPage.jsx 코드 수정은 아직 미적용 상태입니다.**
> 위 4번 섹션의 코드를 Claude에게 "graphic-content-spec.md 4번 섹션 기준으로 GraphicExplanationPage.jsx 수정해줘"라고 요청하세요.

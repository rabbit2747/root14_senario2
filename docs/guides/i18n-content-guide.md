# 콘텐츠 작성 다국어(i18n) 가이드
> **대상**: 콘텐츠 담당 Claude (graphic / scenario / lab 파일 작성 시 반드시 준수)
> **작성**: 번역 담당 Claude | 2026-03-19 | v1.0
> **지원 언어**: `ko` `en` `ja` `zh` `hi` `vi` `ar` (7개)

---

## ⚠️ 핵심 원칙

**절대 하지 말 것:**
```jsx
// ❌ 한국어 하드코딩 — 번역 불가
<h1>스피어피싱 첨부파일</h1>
export const subtitlesData = ["안녕하세요! ..."];
{ speaker: 'TEAM_LEADER', text: "집중해라." }
```

**반드시 할 것:**
```jsx
// ✅ 다국어 객체 구조
<h1>{t.slideTitle}</h1>
export const subtitlesData = [{ ko: "안녕하세요!", en: "Hello!", vi: "Xin chào!", ar: "مرحباً!" }];
{ speaker: 'TEAM_LEADER', text: t.dialogue1 }
```

---

## 1. 그래픽 콘텐츠 (`src/data/graphic-contents/`)

### subtitlesData — 다국어 객체 배열로 작성

```jsx
// ✅ 올바른 구조
export const subtitlesData = [
  {
    ko: "안녕하세요! 지금부터 스피어피싱 첨부파일 공격을 배웁니다.",
    en: "Hello! Let's learn about Spearphishing Attachment attacks.",
    ja: "こんにちは！スピアフィッシングについて学びましょう。",
    zh: "您好！让我们来学习鱼叉式网络钓鱼攻击。",
    hi: "नमस्ते! आइए स्पीयरफिशिंग अटैचमेंट के बारे में सीखें।",
    vi: "Xin chào! Hãy cùng tìm hiểu về tấn công Spearphishing Attachment.",
    ar: "مرحباً! لنتعلم عن هجمات مرفقات التصيد الموجّه.",
  },
  // ... 슬라이드 수만큼 반복
];
```

> **번역 담당 Claude가 채워줄 항목**: `ja`, `zh`, `hi`, `vi`, `ar`
> **콘텐츠 담당이 반드시 작성**: `ko`, `en` (최소 2개)

### renderSlides — language prop 받아서 사용

```jsx
// ✅ 올바른 구조
export function renderSlides(language = 'ko') {
  // 텍스트를 언어별로 분리
  const T = {
    ko: {
      slideTitle: '스피어피싱 첨부파일',
      slideSubtitle: '이메일 보안의 첫걸음',
      card1: '이메일은 가장 보편적인 업무 소통 수단입니다.',
      statLabel: '하루 전 세계 이메일 전송량',
      listItem1: '사전 정보 수집 — SNS, 회사 홈페이지에서 타깃 조사',
    },
    en: {
      slideTitle: 'Spearphishing Attachment',
      slideSubtitle: 'First Steps in Email Security',
      card1: 'Email is the most universal business communication tool.',
      statLabel: 'Global daily email volume',
      listItem1: 'Reconnaissance — researching target via SNS, company website',
    },
    // vi, ar, ja, zh, hi → 번역 담당 Claude가 채움 (아래 빈 구조만 남겨둘 것)
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };
  const t = T[language] || T.ko;

  return (
    <>
      {/* Slide 1 */}
      <div className="slide">
        <h1>{t.slideTitle}<br /><span>{t.slideSubtitle}</span></h1>
        <p>{t.card1}</p>
        <h3>3,000억 통</h3>           {/* 수치는 언어 공통 */}
        <p>{t.statLabel}</p>
        <li>{t.listItem1}</li>
      </div>
    </>
  );
}
```

> **수치/코드/브랜드명**: 번역하지 말 것 (3,000억, CVE-2017-5638, SMTP, YARA 등)
> **`null` 자리**: 번역 담당 Claude가 채울 예정이니 키 구조만 만들어 놓을 것

### GraphicExplanationPage 연동

파일 등록 시 `GRAPHIC_COMPONENTS`에 아래 방식으로 추가:
```js
// GraphicExplanationPage.jsx
const GRAPHIC_COMPONENTS = {
  'T1566.001-novice': React.lazy(() =>
    import('../data/graphic-contents/T1566.001-novice.jsx')
  ),
};
// CinematicPlayer는 자동으로 language를 받아서 subtitlesData[i][lang] 사용함
// renderSlides(lang) 호출도 자동 처리됨
```

---

## 2. 시나리오 콘텐츠 (`src/data/scenario-contents/`)

### language prop 필수 수신

```jsx
// ✅ 올바른 구조
export default function T1566001NoviceScenario({ language = 'ko' }) {
  // 언어별 텍스트 객체
  const T = {
    ko: {
      chapter1_loc: 'Sector 1: 이메일 수신함',
      chapter1_dialogue1: "집중해라. 이메일은 해커들의 가장 흔한 침투 경로이기도 하다.",
      chapter1_hint: "발신자 주소, 첨부파일, 본문을 클릭해 보렴.",
      btn_next: '다음',
      btn_complete: '임무 완료',
    },
    en: {
      chapter1_loc: 'Sector 1: Inbox',
      chapter1_dialogue1: "Focus. Email is the most common attacker entry point.",
      chapter1_hint: "Click the sender address, attachment, and body.",
      btn_next: 'Next',
      btn_complete: 'Mission Complete',
    },
    // vi, ar, ja, zh, hi → 번역 담당 Claude가 채움
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };
  const t = T[language] || T.ko;

  const CHAPTERS = [
    {
      scene: 'scene_phase1',
      loc: t.chapter1_loc,
      dialogues: [
        { speaker: 'TEAM_LEADER', text: t.chapter1_dialogue1 },
      ],
      hint: t.chapter1_hint,
    },
  ];

  return (
    // ... 기존 JSX 구조 그대로
  );
}
```

### ScenarioExplanationPage 연동

```js
// ScenarioExplanationPage.jsx에서 language 전달 확인
<ScenarioComponent language={lang} />
```

---

## 3. 랩 시나리오 JSON (`src/data/lab-scenarios/`)

### 필드 네이밍 규칙

| 필드 | ko | en | vi | ar | ja | zh | hi |
|------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| title | `title` | `titleEn` | `titleVi` | `titleAr` | `titleJa` | `titleZh` | `titleHi` |
| phases[].label | `label` | `labelEn` | `labelVi` | `labelAr` | `labelJa` | `labelZh` | `labelHi` |
| steps[].desc | `desc` | `descEn` | `descVi` | `descAr` | `descJa` | `descZh` | `descHi` |
| steps[].stepTitle | `stepTitle` | `stepTitleEn` | `stepTitleVi` | `stepTitleAr` | — | — | — |
| steps[].feynman | `feynman` | `feynmanEn` | `feynmanVi` | `feynmanAr` | — | — | — |
| steps[].expert | `expert` | `expertEn` | `expertVi` | `expertAr` | — | — | — |
| steps[].defTooltip | `defTooltip` | `defTooltipEn` | `defTooltipVi` | `defTooltipAr` | — | — | — |

> `—` 표시: vi/ar 우선, 나머지 언어는 en 폴백 사용 (추후 추가 가능)

### 템플릿 (JSON)

```json
{
  "id": "T1566.001-novice",
  "title": "이메일 보안의 첫걸음",
  "titleEn": "First Steps in Email Security",
  "titleVi": "",
  "titleAr": "",
  "phases": [
    {
      "label": "📧 이메일 확인",
      "labelEn": "📧 Email Check",
      "labelVi": "",
      "labelAr": "",
      "steps": [0, 1]
    }
  ],
  "steps": [
    {
      "cmd": "cat suspicious_email.eml",
      "out": "...",
      "desc": "첨부파일의 확장자를 확인합니다.",
      "descEn": "Check the attachment's file extension.",
      "descVi": "",
      "descAr": "",
      "stepTitle": "의심 이메일 수신",
      "stepTitleEn": "Suspicious Email Received",
      "stepTitleVi": "",
      "stepTitleAr": "",
      "feynman": "음식 포장지의 성분표를 확인하는 것과 같습니다.",
      "feynmanEn": "It's like checking an ingredient label on food packaging.",
      "feynmanVi": "",
      "feynmanAr": "",
      "expert": "이메일 헤더의 From 필드를 통해 발신자 도메인을 확인하세요.",
      "expertEn": "Check the sender domain via the From field in the email header.",
      "expertVi": "",
      "expertAr": "",
      "defTooltip": "📧 이메일 필터: 의심 메일이 도착했습니다.",
      "defTooltipEn": "📧 Email Filter: Suspicious email arrived.",
      "defTooltipVi": "",
      "defTooltipAr": "",
      "terms": [
        {
          "name": "피싱 (Phishing)",
          "nameEn": "Phishing",
          "desc": "가짜 이메일이나 웹사이트로 개인정보를 탈취하는 공격",
          "descEn": "An attack that steals personal information via fake emails or websites.",
          "descVi": "",
          "descAr": ""
        }
      ],
      "hackerLog": {
        "title": "email_analysis.log",
        "lines": [
          {
            "log": "From: security-team@g00gle-support.com",
            "desc": "💡 'google'이 아니라 'g00gle' — 0으로 오탈자 위장",
            "descEn": "💡 Not 'google' but 'g00gle' — zero disguised as 'o'",
            "descVi": "",
            "descAr": ""
          }
        ]
      }
    }
  ]
}
```

> **빈 문자열 `""`**: 번역 담당 Claude가 채울 자리. 절대 ko 텍스트로 채우지 말 것.

---

## 4. 번역하지 않는 것 (언어 공통)

```
✅ 유지 (번역 금지):
  기술 용어: phishing, spearphishing, SMTP, YARA, Sigma, MITRE ATT&CK
  CVE 번호: CVE-2017-5638, MS17-010
  브랜드/제품명: Outlook, EternalBlue, Mimikatz, Sysmon
  명령어: cat, ls, grep, nmap, curl
  코드/로그 출력: terminal out 블록
  수치+단위: 230,000, 10B$, 72시간
  이메일 주소/도메인: security@g00gle.com

❌ 반드시 번역:
  UI 라벨, 버튼 텍스트
  대사/힌트/설명 (desc/feynman/expert)
  페이즈/스텝 제목
  용어 설명 (terms.desc)
```

---

## 5. 새 파일 작성 체크리스트

```
콘텐츠 담당이 파일 완성 후 확인:
[ ] subtitlesData — ko/en 작성 완료, vi/ar/ja/zh/hi 빈 키 포함
[ ] renderSlides — language 파라미터 수신, T 객체에 ko/en 작성, null 플레이스홀더 포함
[ ] 시나리오 JSX — language prop 선언, T 객체 구조 완성 (ko/en), null 플레이스홀더
[ ] 랩 JSON — 모든 번역 필드에 En suffix 작성, Vi/Ar 빈 문자열 포함
[ ] 번역 금지 항목 확인 (기술 용어/코드/수치)

번역 담당 Claude에게 인계:
[ ] 커밋 후 브랜치명과 파일 경로 알려주기
[ ] "번역 준비 완료" 메시지에 파일 목록 포함
```

---

## 6. 협업 규칙

| 파일 | 소유권 |
|------|--------|
| `src/data/graphic-contents/*.jsx` | 콘텐츠 담당 (구조) → 번역 담당 (텍스트 채우기) |
| `src/data/scenario-contents/*.jsx` | 콘텐츠 담당 (구조) → 번역 담당 (T 객체 채우기) |
| `src/data/lab-scenarios/*.json` | 콘텐츠 담당 (ko/en) → 번역 담당 (vi/ar/ja/zh/hi) |
| `src/lib/i18n.js` | 번역 담당 전용 — 콘텐츠 담당 수정 금지 |
| `src/components/hero/incidentData.js` | 번역 담당 전용 |
| `src/pages/GraphicExplanationPage.jsx` | 공유 — 수정 전 상호 확인 |
| `src/pages/lab/GenericLabSimulator.jsx` | 번역 담당 전용 (언어 분기 로직) |

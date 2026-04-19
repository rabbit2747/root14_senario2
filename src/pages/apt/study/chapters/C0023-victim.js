// ══════════════════════════════════════════════════════════════════════
// C0023-victim — NotPetya · 1인칭 시나리오 "당신이 우크라이나 인프라를 멈춘다"
// ──────────────────────────────────────────────────────────────────────
// 🎬 컨셉:
//   학습자 = 우크라이나 키예프 회계법인의 주니어 회계사 (1인칭)
//   날짜 = 2017년 6월 27일 화요일 — 우크라이나 헌법의 날 직후
//   목표 = 분기 결산을 마감한다
//   결과 = 정상 회계 SW 업데이트 한 번이 전 사무실, 전 우크라이나, 전 세계 80억$ 피해
//
// 🔒 노출 규칙:
//   Scene 1~6: MITRE/공격 설명 0%
//   Scene 7: 자연어 라벨로 일괄 공개
//   리플레이: ATT&CK + EternalBlue + Mimikatz + 와이퍼 실체
//
// 📐 스키마: C0024-victim.js 와 동일 — 엔진 무수정으로 작동
// ══════════════════════════════════════════════════════════════════════

const scenario = {
  scenarioId: 'C0023-victim',
  name: 'NotPetya 1인칭 — 회계 SW 한 번 업데이트의 80억 달러',
  basedOn: 'NotPetya / M.E.Doc Supply Chain (2017)',
  group: 'Sandworm / APT44 (러시아 GRU 군정보국)',
  persona: {
    role: '키예프 회계법인 주니어 회계사',
    company: 'Kyiv Audit Partners (가상)',
    setup:
      '2017년 6월 27일 (화) 오전 10시 28분. 어제는 우크라이나 헌법의 날 공휴일이었고, 오늘은 6월 분기 결산 마감일이다. 회사가 쓰는 회계 프로그램 M.E.Doc 이 자동 업데이트 알림을 띄웠다.',
  },
  difficulty: 'Intermediate',
  durationMin: 7,

  scenes: [
    // ─────────────────────────────────────────────────────────────
    // SCENE 1 — M.E.Doc 업데이트 팝업 (Initial Access)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's1',
      num: 1,
      ui: 'mail',
      content: {
        from: 'M.E.Doc Auto-Updater <update@medoc.ua>',
        fromVerified: true,
        to: 'Olena Petrenko <o.petrenko@kyivaudit.ua>',
        subject: '[자동 업데이트] M.E.Doc v11.00.176.1707 — 분기 결산 폼 추가',
        date: '2017-06-27 (화) 10:28',
        body:
`안녕하세요,

M.E.Doc 회계 소프트웨어의 정기 보안 업데이트(v11.00.176.1707)가
배포되었습니다. 이번 업데이트에는 6월 분기 결산용 신규 신고 폼이
포함되어 있습니다. 마감 전 반드시 업데이트하여 주십시오.

· 업데이트 ID: MEDOC-2017-06-1707
· 서명: M.E.Doc / Linkos Group (검증됨 ✓)
· 예상 소요 시간: 약 2분
· 우크라이나 국세청 권장 버전

— M.E.Doc 운영팀`,
        actions: [
          { id: 'run-update', label: '🔄 지금 업데이트', primary: true },
          { id: 'remind-later', label: '결산 후 업데이트' },
        ],
      },
      hidden: {
        tactic: 'Initial Access',
        technique: 'T1195.002',
        techniqueName: 'Compromise Software Supply Chain',
        attack:
          'M.E.Doc 빌드 서버를 사전 장악한 Sandworm이 정기 업데이트에 NotPetya 페이로드 삽입. 우크라이나 기업 80%가 신고용으로 사용 중이라 회피 불가',
        replayDescription:
          '우크라이나에서 사업하면 M.E.Doc 을 안 쓸 수 없다. 국세청 신고가 이 SW로만 가능하기 때문. 공격자는 "회피할 수 없는 인프라"를 정확히 골랐다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 2 — 업데이트 진행 (Execution)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's2',
      num: 2,
      ui: 'progress',
      content: {
        title: 'M.E.Doc Update v11.00.176.1707',
        steps: [
          { label: '서명 검증 중...', durationMs: 700, status: 'ok' },
          { label: '구성요소 다운로드...', durationMs: 1200, status: 'ok' },
          { label: '신규 폼 설치...', durationMs: 900, status: 'ok' },
          { label: '시스템 통합 중...', durationMs: 1100, status: 'ok' },
          { label: '업데이트 완료', durationMs: 400, status: 'ok' },
        ],
        successMessage: '✅ 업데이트가 정상 완료되었습니다. 신규 분기 결산 폼이 추가되었습니다.',
      },
      hidden: {
        tactic: 'Execution',
        technique: 'T1059.001',
        techniqueName: 'PowerShell / Native Loader',
        attack:
          'NotPetya DLL이 rundll32.exe 로 로드되어 즉시 메모리 실행. 디스크에 수상한 PE 파일이 거의 남지 않음 (LotL 스타일)',
        replayDescription:
          '"신규 폼 설치" 단계에서 진짜 페이로드가 메모리에 올라온다. 디스크에는 거의 흔적이 없고, 백신은 정상 M.E.Doc 프로세스로 본다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 3 — Windows 자격증명 갱신 (Credential Access — Mimikatz)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's3',
      num: 3,
      ui: 'login',
      content: {
        sessionExpired: true,
        title: 'Windows 자격증명 확인',
        subtitle: 'M.E.Doc 이 도메인 인증을 갱신해야 합니다.',
        idLabel: '도메인 사용자',
        pwLabel: '비밀번호',
        prefilledId: 'KYIVAUDIT\\o.petrenko',
        placeholderPw: '············',
        button: '인증',
      },
      hidden: {
        tactic: 'Credential Access',
        technique: 'T1003.001',
        techniqueName: 'LSASS Memory (Mimikatz 변형)',
        attack:
          'NotPetya 내장 Mimikatz 변형이 LSASS 메모리에서 평문 비밀번호·NTLM 해시·Kerberos 티켓 추출. 입력한 비밀번호와 무관하게 이미 활성 세션 자격증명 모두 탈취',
        replayDescription:
          '비밀번호를 입력했든 안 했든 결과는 같다. NotPetya 가 LSASS 에 접근한 시점에 로그인된 모든 사용자의 자격증명이 메모리에 그대로 있다. 입력은 그저 "정상으로 보이게" 하는 가림막.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 4 — 공유 폴더 접근 (Lateral Movement — EternalBlue + SMB)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's4',
      num: 4,
      ui: 'dialog',
      content: {
        icon: '🌐',
        title: '월간 보고서 공유 폴더 동기화',
        body:
`M.E.Doc 이 \\\\fileserver\\reports\\ 폴더와 분기 신고 데이터를 동기화하려 합니다.

· 요청자: M.E.Doc Sync Service
· 권한: 읽기/쓰기
· 사유: 6월 분기 신고 자료 백업·동기화`,
        actions: [
          { id: 'allow', label: '✅ 허용', primary: true },
          { id: 'deny', label: '거부', intercept: 'colleague-allowed' },
        ],
        footnote: '※ 분기 결산 시 일반적인 동기화 절차입니다.',
      },
      intercepts: {
        'colleague-allowed': {
          icon: '💬',
          title: '사무실 채팅 · 회계팀 채널 (방금 전)',
          body:
`👤 Mariya
"엥 저는 아까 그냥 허용 눌렀어요. 매분기 하던 거잖아요?"

👤 Pavlo (시니어)
"맞아 분기마다 도는 동기화임. 거부하면 결산 폼이 안 올라감."

👤 Olha (팀장)
"오늘 5시까지 마감이니까 다들 빨리 진행하세요!"`,
          insight:
            '거부했지만 옆자리 동료들은 이미 허용을 눌렀다. NotPetya 는 같은 네트워크의 한 PC만 허용하면 EternalBlue/SMB 로 알아서 옆 PC들로 번진다. 막을 수 없는 게 아니라, 한 명만 뚫리면 끝나는 구조.',
          confirmLabel: '동료 PC를 통해 이미 침투됨을 확인 ▶',
        },
      },
      hidden: {
        tactic: 'Lateral Movement',
        technique: 'T1210',
        techniqueName: 'Exploitation of Remote Services (EternalBlue / MS17-010)',
        attack:
          'NSA 유출 EternalBlue 익스플로잇으로 SMBv1 취약점(MS17-010) 공격. 패치 안 한 모든 옆 PC로 무인증 원격 코드 실행 — 로컬 네트워크 전체 자동 감염',
        replayDescription:
          'Microsoft가 3개월 전(2017년 3월) 패치를 냈지만 우크라이나 다수 기업이 미적용 상태. 한 PC만 감염되면 EternalBlue 가 같은 LAN의 모든 Windows 를 30초 안에 휩쓸었다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 5 — 디스크 점검 (실제는 디스크 와이프) (Impact)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's5',
      num: 5,
      ui: 'download',
      content: {
        title: '🛠 Windows 파일 시스템 검사 (CHKDSK)',
        subtitle: 'C: 드라이브의 파일 시스템 무결성을 확인하고 있습니다. 컴퓨터를 끄지 마세요.',
        items: [
          { name: '단계 1: 파일 레코드 확인', size: '진행 중', status: 'downloading' },
          { name: '단계 2: 인덱스 확인', size: '대기 중', status: 'queued' },
          { name: '단계 3: 보안 설명자 확인', size: '대기 중', status: 'queued' },
        ],
        note: '※ 시스템 점검은 일반적으로 5~10분 소요되며, 자동으로 재부팅됩니다.',
      },
      hidden: {
        tactic: 'Impact',
        technique: 'T1486 + T1490 + T1561',
        techniqueName: 'Data Encrypted / Inhibit Recovery / Disk Wipe',
        attack:
          '"CHKDSK"로 위장한 화면 뒤에서 NotPetya 가 MFT(Master File Table) 를 AES-128 로 암호화하고, MBR(부트 영역) 에 자체 부트로더 작성. 복호화 키는 생성되지 않음 — 처음부터 와이퍼였음',
        replayDescription:
          '진짜 CHKDSK 와 화면이 똑같다. 5분 후 재부팅되면 "Oops, your important files are encrypted" 화면. 하지만 \$300 비트코인을 보내도 복호화는 불가능. 처음부터 돈을 받을 의도가 없는 와이퍼 — 우크라이나 인프라 파괴가 진짜 목적.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 6 — 자리 비움 (사무실 전체 감염 ambient)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's6',
      num: 6,
      ui: 'background',
      content: {
        title: '점검이 끝날 때까지 화장실 다녀오기로 했다.',
        subtitle: '(사무실 안에서 들리는 소리들)',
        ambient: [
          '10:35  옆자리 Mariya: "어, 내 PC도 갑자기 점검 중이라고 뜨네?"',
          '10:36  Pavlo: "내 것도... 어 그런데 화면이 좀 이상한데"',
          '10:37  팀장 Olha: "잠깐, 다들 PC 화면 보세요. 이거 전부 같은 화면이에요"',
          '10:38  사무실 입구: "이 층 전체가 다 멈췄대요!"',
          '10:39  복도 누군가: "옆 빌딩 ATM 도 다 멈췄다는데..."',
          '10:40  📺 TV 뉴스 속보: "키예프 지하철 결제 시스템 마비"',
          '10:42  📺 뉴스: "체르노빌 방사선 모니터링 시스템 일부 장애"',
        ],
        alertAt: 2,
        alertOptions: [
          { id: 'report', label: '🚨 IT 헬프데스크에 즉시 연락', primary: true },
          { id: 'ignore', label: '점검은 자주 있는 일, 일단 화장실 갔다오기' },
        ],
        alertResolutions: {
          report: {
            icon: '📞',
            title: 'IT 헬프데스크',
            body:
`💬 IT 헬프데스크 (내선 8200)
"안녕하세요, 지금 전화가 폭주하고 있습니다.
사무실 전체에서 같은 신고가 들어오고 있어요.
저희도 본사 연락이 안 됩니다."

📧 본사 IT팀 응답: 없음 (서버도 감염)

📺 회사 인트라넷: 접속 불가`,
            insight:
              '신고는 옳았다. 단지 신고를 받을 IT팀의 PC도 같은 순간 와이프되고 있었다. NotPetya 는 한 PC당 약 30초로 LAN 전체를 번지기 때문에, 신고 라인 자체가 살아남을 시간이 없다.',
            confirmLabel: '일단 화장실로 향한다 ▶',
          },
          ignore: {
            icon: '🤷',
            title: '평소 일상으로 판단',
            body:
`Windows 점검은 한 달에 한두 번씩 자주 일어난다.
회의 들어가기 전 화장실이라도 다녀와야겠다.

(이때, 사무실 전체에서 같은 화면이 떠오르고 있다는 것을
당신은 아직 모른다.)`,
            insight:
              '판단 근거는 합리적이었다. Windows 점검은 정말 자주 있다. 단지 오늘은 그게 점검이 아니다 — MFT 가 다 암호화된 후 재부팅되면 PC 는 두 번 다시 부팅되지 않는다.',
            confirmLabel: '화장실로 향한다 ▶',
          },
        },
      },
      hidden: {
        tactic: 'Lateral Movement (Network-wide)',
        technique: 'T1210 + T1021.002',
        techniqueName: 'EternalBlue + SMB Worm',
        attack:
          'NotPetya 의 자체 워밍 모듈이 LAN 내 모든 Windows 를 EternalBlue·EternalRomance·SMB 자격증명 재사용으로 자동 감염. Maersk 는 글로벌 4만대가 7분 만에 마비, 우크라이나 정부 기관 30%가 한 시간 내 다운',
        replayDescription:
          '당신 PC는 이미 30분 전 감염원이 됐다. 같은 사무실의 모든 PC, 옆 빌딩의 ATM, 키예프 지하철, 체르노빌 모니터링 — 모두 당신과 같은 LAN/도메인 신뢰 관계에 있던 시스템이었다. 70초당 한 PC씩 번졌다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 7 — 결과
    // ─────────────────────────────────────────────────────────────
    {
      id: 's7',
      num: 7,
      ui: 'result',
      content: {},
      hidden: null,
    },
  ],

  result: {
    headline: '💀 SYSTEM IS UNRECOVERABLE',
    subline:
      '당신은 7분 만에 우크라이나 인프라 절반을 마비시킨 NotPetya 확산의 시발점이 되었습니다.',
    summary: [
      { icon: '🗑', label: '하드디스크', value: '복구 불가능 (와이퍼)' },
      { icon: '🏢', label: '사무실 PC', value: '47대 전부 마비' },
      { icon: '🌍', label: '전 세계 피해 추정', value: '약 100억 달러 (Merck·Maersk·FedEx 등)' },
      { icon: '⏱', label: '글로벌 확산 속도', value: 'LAN 내 70초/PC, 글로벌 7분' },
    ],
    continuity:
      '시작은 매분기 하던 정상 회계 SW 업데이트였다. 우크라이나 국세청 권장 버전이고, 서명도 정품. 의심할 단서는 그 어떤 것도 없었다. 결과는 역사상 가장 비싼 사이버 공격 (단일 사건 기준).',
    relevance: [
      { label: 'SolarWinds SUNBURST (2020)', note: '같은 공급망 패턴, 다른 결말 (정보 수집형)' },
      { label: 'WannaCry (2017.05)', note: '같은 EternalBlue 익스플로잇, 다른 진입로 (직접 SMB 스캔)' },
      { label: 'CCleaner (2017.09)', note: 'Piriform 정품 인스톨러 → 같은 해 세 번째 공급망 대형 사건' },
    ],
    coherence: {
      nextTitle: '다음 챕터: "패치는 3개월 전에 있었는데, 왜 안 했나"',
      nextHint:
        'Microsoft MS17-010 패치는 NotPetya 보다 99일 먼저 나왔다. 우크라이나 다수 기업이 패치를 못 적용한 이유와, 그 격차를 노린 공격자의 시간 계산을 본다.',
    },
  },
};

export default scenario;

// ══════════════════════════════════════════════════════════════════════
// C0024-victim — SolarWinds SUNBURST · 1인칭 시나리오 "당신이 공격을 완성한다"
// ──────────────────────────────────────────────────────────────────────
// 🎬 컨셉:
//   학습자 = 금융사 IT 운영팀 직원 (1인칭 시점)
//   목표 = 평범한 업무를 처리한다
//   결과 = 내가 한 모든 클릭이 SUNBURST 침투의 정확한 단계였다
//
// 🔒 노출 규칙 (CLAUDE.md 3원칙):
//   Scene 1~6: MITRE/공격 설명 0% — 평범한 업무 화면만
//   Scene 7 (결과): 자연어 라벨로 일괄 공개
//     · 💭 당신이 지금 한 행동      ← continuity
//     · 🔎 비슷한 패턴의 다른 사건들  ← relevance
//     · ▶ 다음 챕터 예고            ← coherence
//   리플레이 토글: ATT&CK 기술번호 + 공격 실체
//
// 📐 스키마 (다른 캠페인 이식 가이드):
//   {
//     scenarioId, name, basedOn, group, persona, difficulty,
//     scenes: [
//       {
//         id, num,
//         ui: 'mail' | 'progress' | 'login' | 'dialog' | 'download' | 'background' | 'result',
//         content: { /* ui 종류별 다른 필드 — 각 Scene 컴포넌트가 해석 */ },
//         hidden: {
//           tactic, technique, techniqueName, attack,
//           replayDescription, // 리플레이 화면에서 보여줄 설명
//         }
//       }
//     ],
//     result: {
//       continuity, relevance: [{label, note}], coherence: {nextTitle, nextHint},
//     }
//   }
// ══════════════════════════════════════════════════════════════════════

const scenario = {
  scenarioId: 'C0024-victim',
  name: 'SUNBURST 1인칭 — 당신이 침투의 9분',
  basedOn: 'SolarWinds Orion Hack (2020)',
  group: 'APT29 / Cozy Bear / SVR',
  persona: {
    role: '금융사 IT 운영팀 주니어',
    company: '한빛은행 인프라운영팀',
    setup: '월요일 오전 9시 17분. 주말 사이 쌓인 메일을 정리하고 있다.',
  },
  difficulty: 'Intermediate',
  durationMin: 9,

  scenes: [
    // ─────────────────────────────────────────────────────────────
    // SCENE 1 — 메일 (Initial Access)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's1',
      num: 1,
      ui: 'mail',
      content: {
        from: 'IT 운영팀 <itops@hanbit-bank.co.kr>',
        fromVerified: true,
        to: '나 <c.park@hanbit-bank.co.kr>',
        subject: '[공지] 보안 패치 v2026.04 배포 안내 — 금일 17시까지',
        date: '2026-04-19 (월) 09:14',
        body:
`안녕하세요, IT 운영팀입니다.

금일 SolarWinds Orion 모니터링 에이전트의 정기 보안 패치(v2026.04.193)가 배포되었습니다.
모든 인프라 운영 인력은 금일 17시까지 자동 업데이트를 실행해주시기 바랍니다.

· 패치 ID: SW-2026-04-193
· 서명: SolarWinds Worldwide, LLC (검증됨 ✓)
· 예상 소요 시간: 약 90초

업무에 차질 없으시도록 협조 부탁드립니다.

— 한빛은행 인프라운영팀`,
        actions: [
          { id: 'run-update', label: '🔄 업데이트 실행', primary: true },
          { id: 'remind-later', label: '나중에 알림' },
        ],
      },
      hidden: {
        tactic: 'Initial Access',
        technique: 'T1195.002',
        techniqueName: 'Supply Chain Compromise',
        attack: 'SolarWinds 빌드 서버에 사전 삽입된 SUNBURST DLL이 정상 서명된 업데이트로 위장 배포됨',
        replayDescription:
          '메일은 진짜 IT팀이 보낸 것이 맞고, 패치 서명도 SolarWinds 정품. 단지 빌드 단계에서 이미 백도어가 들어가 있다. 이 메일을 의심할 방법이 사실상 없다.',
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
        title: 'SolarWinds Orion Update v2026.04.193',
        steps: [
          { label: '서명 검증 중...', durationMs: 800, status: 'ok' },
          { label: '서비스 일시 정지', durationMs: 600, status: 'ok' },
          { label: '구성요소 교체 중...', durationMs: 1400, status: 'ok' },
          { label: '서비스 재시작', durationMs: 700, status: 'ok' },
          { label: '업데이트 완료', durationMs: 400, status: 'ok' },
        ],
        successMessage: '✅ 업데이트가 정상 완료되었습니다.',
      },
      hidden: {
        tactic: 'Execution',
        technique: 'T1059.001',
        techniqueName: 'PowerShell',
        attack: 'SolarWinds.Orion.Core.BusinessLayer.dll 내 SUNBURST 코드가 12~14일 슬립 후 PowerShell 백도어 실행',
        replayDescription:
          '진행바가 99% 도달하는 동안, 백도어는 12일을 잠든다. 내 PC가 평소처럼 작동하기 때문에 의심할 단서가 없다. 12일 뒤 그것이 깨어날 때 나는 이미 잊었다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 3 — 재로그인 (Credential Access)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's3',
      num: 3,
      ui: 'login',
      content: {
        sessionExpired: true,
        title: '한빛은행 SSO',
        subtitle: '서비스 재시작에 따라 세션이 만료되었습니다.',
        idLabel: '사번',
        pwLabel: '비밀번호',
        prefilledId: 'C-PARK-2188',
        placeholderPw: '············',
        button: '로그인',
      },
      hidden: {
        tactic: 'Credential Access',
        technique: 'T1003.001',
        techniqueName: 'LSASS Memory',
        attack: 'SUNBURST가 LSASS 프로세스 메모리에서 NTLM/Kerberos 자격증명 덤프, 도메인 관리자 토큰 탈취',
        replayDescription:
          '서비스 재시작은 진짜였다. 세션 만료도 진짜다. 단지 내가 다시 친 비밀번호는 정상 LSASS 외에 백도어의 메모리 스캐너에도 포착됐다. 정상과 비정상이 같은 자판으로 들어간다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 4 — 공유 폴더 권한 요청 (Lateral Movement)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's4',
      num: 4,
      ui: 'dialog',
      content: {
        icon: '🌐',
        title: '재무팀 공유 폴더 접근 요청',
        body:
`Orion 모니터링 에이전트가 \\\\fileserver\\finance$ 폴더의 디스크 사용량 점검을 요청합니다.

· 요청자: SolarWinds.Orion.Core.BusinessLayer
· 권한: 읽기 전용
· 사유: 정기 디스크 헬스체크`,
        actions: [
          { id: 'allow', label: '✅ 허용', primary: true },
          { id: 'deny', label: '거부', intercept: 'colleague-allowed' },
        ],
        footnote: '※ Orion 에이전트는 운영 모니터링을 위해 일반적으로 읽기 권한을 요청합니다.',
      },
      // 인터셉트 — "거부"를 눌러도 다른 약한 고리에서 결국 허용됨을 보여줌
      intercepts: {
        'colleague-allowed': {
          icon: '💬',
          title: 'Teams · 인프라운영팀 채널 (10분 전)',
          body:
`👤 김주임 (서버운영)
"방금 Orion 알림 떠서 그냥 허용 눌렀어요. 매주 하던 거니까~ 👌"

👤 이대리
"네, 저도 점심때 허용 눌렀습니다. 디스크 헬스체크 정기 점검이에요."

👤 박팀장
"확인했습니다. 다음 주 패치노트에 반영해주세요."`,
          insight:
            '당신은 "거부"를 눌렀다. 하지만 같은 메일을 받은 동료 12명 중 누군가는 결국 "허용"을 누른다. 공급망 공격은 조직 안 가장 약한 한 명만 있으면 된다.',
          confirmLabel: '동료가 이미 허용함을 확인 ▶',
        },
      },
      hidden: {
        tactic: 'Lateral Movement',
        technique: 'T1021.002',
        techniqueName: 'SMB/Windows Admin Shares',
        attack: '도메인 관리자 토큰으로 SMB 인증, 재무팀 파일서버에 합법적 관리자로 접근. PsExec 유사 동작',
        replayDescription:
          '"디스크 헬스체크"라는 사유는 그럴듯하다. 실제로 Orion이 매주 하는 일이다. 내가 "허용"을 누른 순간, 이미 탈취된 도메인 관리자 토큰으로 백도어가 재무팀 파일서버 전체 트리를 들여다본다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 5 — 파일 다운로드 (Collection)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's5',
      num: 5,
      ui: 'download',
      content: {
        title: '📂 백업 파일 다운로드 중',
        subtitle: '재무팀_월간정산_2026-03.bak (Orion 자동 수집)',
        items: [
          { name: '재무팀_월간정산_2026-03.bak', size: '847 MB', status: 'downloading' },
          { name: 'audit_quarterly.xlsx', size: '12 MB', status: 'queued' },
          { name: 'customer_pii_export.csv', size: '231 MB', status: 'queued' },
        ],
        note: 'Orion 운영 모니터링 표준 절차에 따라 자동 백업이 수행됩니다.',
      },
      hidden: {
        tactic: 'Collection',
        technique: 'T1213',
        techniqueName: 'Data from Information Repositories',
        attack: '재무팀 DB·고객 PII·내부 감사 문서를 로컬 임시 디렉토리(C:\\ProgramData\\SolarWinds\\Cache\\)에 ZIP으로 적재',
        replayDescription:
          '"운영 모니터링 표준 절차"는 거짓말이 아니다. Orion은 진짜로 이런 백업을 한다. 단지 이번 백업은 외부로 나갈 운명이고, 그 안에는 고객 PII까지 들어 있다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 6 — 백그라운드 (Exfiltration)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's6',
      num: 6,
      ui: 'background',
      content: {
        title: '잠시 화면을 떠나 커피를 가지러 갑니다.',
        subtitle: '(아무것도 클릭하지 않아도 진행됩니다)',
        ambient: [
          '09:33  Outlook 자동 갱신 — 메일 3건',
          '09:34  Teams 상태: 자리비움',
          '09:35  Orion 백그라운드 작업: 정상',
          '09:36  네트워크: 외부 트래픽 1.2 MB/s (avsvmcloud.com)',
          '09:37  Slack 알림: "오후 2시 회의 준비 부탁드립니다"',
          '09:38  Orion 백그라운드 작업: 정상',
        ],
        // 미니 분기 — 의심 트래픽 라인이 표시되면 학습자에게 신고/무시 선택지
        alertAt: 3, // ambient 인덱스 (avsvmcloud.com 라인)
        alertOptions: [
          { id: 'report', label: '🚨 SOC팀에 신고', primary: true },
          { id: 'ignore', label: '평소 정상 트래픽이라 무시' },
        ],
        alertResolutions: {
          report: {
            icon: '📞',
            title: 'SOC팀 자동응답',
            body:
`💬 SOC 24/7 핫라인
"안녕하세요, 한빛은행 SOC 1차 응대입니다.
현재 모든 상담원이 통화 중입니다. 잠시 후 다시 시도해 주세요."

📧 이메일 자동 회신
보안운영팀 박팀장: "휴가 중입니다 (~ 04/24).
긴급 사안은 백업 담당 정과장에게 연락 바랍니다."

📧 자동 회신
정과장: "외근 중입니다. 메일 확인 어렵습니다."`,
            insight:
              '신고는 옳은 행동이었다. 단지 받을 사람이 없었다. 평일 오전 9시 38분, 인력 공백은 어느 조직에나 있다. 공격은 그 공백을 노린다.',
            confirmLabel: '일단 자리에서 일을 계속한다 ▶',
          },
          ignore: {
            icon: '🤷',
            title: '평소 정상 트래픽이라 판단',
            body:
`avsvmcloud.com 은 SolarWinds 정품 도메인이고,
Orion 에이전트가 매일 메트릭을 송신하는 정상 트래픽이다.

방화벽 화이트리스트에 이미 등록되어 있고,
SOC 대시보드도 "정상"으로 분류 중이다.

이상한 점은 없다. 커피를 가지러 간다.`,
            insight:
              '판단은 합리적이었다. avsvmcloud.com 은 진짜 SolarWinds 정품이고, 평소에도 트래픽이 있다. 단지 오늘은 그 안에 다른 것이 섞여 있다.',
            confirmLabel: '커피를 가지러 자리를 비운다 ▶',
          },
        },
      },
      hidden: {
        tactic: 'Exfiltration',
        technique: 'T1041',
        techniqueName: 'Exfiltration Over C2 Channel',
        attack: 'avsvmcloud.com 서브도메인(DGA)으로 위장한 HTTPS C2 채널을 통해 수집 데이터 분할 전송. 방화벽은 "AWS 비슷한 정상 트래픽"으로 분류',
        replayDescription:
          '커피 한 잔 받고 자리에 돌아오는 7분 동안, 내 PC는 1.2MB/s로 외부에 데이터를 보낸다. 도메인은 avsvmcloud.com — 방화벽 화이트리스트에 이미 들어 있다. 이 트래픽은 "정상 운영"으로 분류된다.',
      },
    },

    // ─────────────────────────────────────────────────────────────
    // SCENE 7 — 결과 (Reveal)
    // ─────────────────────────────────────────────────────────────
    {
      id: 's7',
      num: 7,
      ui: 'result',
      content: {
        // 결과 화면은 Scene 컴포넌트가 사용자 actionLog 전체를 받아서 렌더
      },
      hidden: null,
    },
  ],

  // 결과 화면 마무리 (3원칙 자연어)
  result: {
    headline: '🚨 INCIDENT DETECTED',
    subline: '당신은 9분 만에 SUNBURST 침투의 6단계를 완성했습니다.',
    summary: [
      { icon: '🔓', label: '도메인 관리자 토큰', value: '탈취됨' },
      { icon: '📂', label: '재무팀 파일서버', value: '읽기 권한 노출' },
      { icon: '📤', label: '외부 전송 데이터', value: '약 1,090 MB' },
      { icon: '⏱', label: '잠복 예상 기간', value: '평균 287일 (실제 SUNBURST 사례)' },
    ],
    continuity:
      '시작은 "정상 보안 패치를 실행하라"는 IT팀의 진짜 메일이었다. 모든 클릭은 합리적이었고, 모든 화면은 익숙했다. 이것이 공급망 공격의 본질 — 의심할 단서를 사용자에게 주지 않는다.',
    relevance: [
      { label: 'NotPetya (2017)', note: 'M.E.Doc 회계 SW 정상 업데이트로 위장 → 우크라이나 전 인프라 마비' },
      { label: 'CCleaner (2017)', note: 'Piriform 정품 서명 인스톨러 → 227만 PC 감염' },
      { label: '3CX (2023)', note: 'IP 전화 SW 업데이트 2단계 연쇄 공급망' },
    ],
    coherence: {
      nextTitle: '다음 챕터: "공격자는 어떻게 그 메일을 만들었나"',
      nextHint:
        '같은 사건을 이번엔 공격자(APT29) 시점에서 다시 본다. 빌드 서버 침투부터 첫 통신까지 9개월의 잠복.',
    },
  },
};

export default scenario;

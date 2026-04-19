// ══════════════════════════════════════════════════════════════════════
// C0024 — SolarWinds SUNBURST · Chapter 1 "작전 수립"
// ──────────────────────────────────────────────────────────────────────
// 🔒 내부 설계 원칙 (학습자 비노출):
//   · 연계성 (Continuity)  — 현재 결정이 "앞서 정한 목표"와 어떻게 이어지는가
//   · 연관성 (Relevance)   — 비슷한 패턴의 다른 사건/기법/TTP 와의 관계
//   · 연결성 (Coherence)   — 다음 beat/chapter 로 자연스럽게 넘어가는 다리
//
// 학습자에게 보여줄 때는 반드시 자연어 라벨만 사용:
//   · 💭 목표 회상    ← continuity
//   · 🔎 유사 사례    ← relevance
//   · ▶ 다음 작전    ← coherence
//
// 📐 스키마 (다른 캠페인 이식 시 이 구조만 맞추면 재사용 가능):
//
//   {
//     campaignId, chapterId, title, subtitle, group,
//     hud: { totalDays, initialBudget, initialDetection },
//     beats: [
//       {
//         id, num, title, emoji, status: 'active' | 'locked',
//         intro?: string,
//         required: [
//           {
//             id, question, hint,
//             options: [
//               {
//                 id, title, subtitle, emoji, ttp: string[],
//                 result: {
//                   consequenceShort, consequenceLong, learning,
//                   continuity,                        // 내부 원칙 1
//                   relevance: [{ label, note }],     // 내부 원칙 2
//                   coherence: { nextTitle, nextHint },// 내부 원칙 3
//                   daysDelta, budgetDelta, detectionDelta,
//                   leavesTrace?: string              // 도미노 발현 키
//                 }
//               }
//             ]
//           }
//         ],
//         expansion?: [ /* 선택 카드: 더 파고들 학습자용 */ ]
//       }
//     ],
//     dominoes?: [ /* 후속 beat에서 발현될 과거 흔적 — 로직은 엔진에서 */ ]
//   }
// ══════════════════════════════════════════════════════════════════════

const chapter = {
  campaignId: 'C0024',
  chapterId: 'Ch1',
  title: '작전 수립',
  subtitle: 'APT29 · Cozy Bear · SolarWinds Supply Chain',
  group: 'APT29 (Cozy Bear / SVR)',

  // HUD 기준 (실제 SUNBURST 타임라인):
  //   2019.01 초기 정찰 → 2019.09.12 첫 테스트 주입 → 2020.02.20 본 SUNBURST 배포
  //   → 2020.06.04 마지막 악성 빌드 → 2020.12.13 FireEye 탐지·작전 종료
  //   총 작전 수명 ≈ 700일. Ch1~Ch5 전체에 걸쳐 소진되는 공용 예산.
  //   Beat별 예상 소모: Ch1 ≈ 270일 / Ch2 ≈ 60일 / Ch3 ≈ 150일 / Ch4 ≈ 120일 / Ch5 ≈ 30일
  hud: {
    totalDays: 700,         // 남은 작전 수명 (탐지 전까지 가용한 총 일수)
    initialBudget: 100,     // 자원·인력 (추상 지표, 100 기준)
    initialDetection: 0,    // 누적 탐지 위험 (%, 50% 넘으면 경고)
  },

  beats: [
    // ─────────────────────────────────────────────────────────────
    // BEAT 1 — 타겟 선정
    // ─────────────────────────────────────────────────────────────
    {
      id: 'b1',
      num: 1,
      title: '타겟 선정',
      emoji: '🎯',
      status: 'active',
      intro:
        '2019년 봄, 모스크바. 당신은 APT29 작전 지휘관이다. 서방 정보기관이 사용하는 네트워크를 "조용히, 오래" 뚫으라는 지시를 받았다. 정면 돌파는 이미 실패했다. 이번엔 다른 길이 필요하다.',
      required: [
        // 1-a ─────────────────────────────────────────────────────
        {
          id: 'b1-a',
          question: '어느 "길"로 들어갈 것인가?',
          hint: '정면은 막혔다. 적이 스스로 열어 둔 문을 찾아야 한다. 그들이 매일 믿고 여는 문.',
          options: [
            {
              id: 'supply-chain',
              title: '공급망',
              subtitle: '그들이 신뢰하는 "소프트웨어 제조사"를 뚫는다',
              emoji: '📦',
              ttp: ['T1195.002'],
              result: {
                consequenceShort:
                  '한 번의 성공이 수천 기관을 동시에 연다. 대신 준비는 1년 이상.',
                consequenceLong:
                  '소프트웨어 제조사의 빌드 서버 한 대를 장악하면, 그 회사의 업데이트를 받는 모든 고객이 당신의 백도어를 "서명된 정품 업데이트"로 받게 된다. SolarWinds Orion은 포춘 500 중 425개사와 미 국방부, 재무부, 국토안보부가 사용 중. 한 번의 성공이 수천 개 문을 여는 열쇠가 된다.',
                learning:
                  '공급망 공격의 본질은 "신뢰 관계의 하이재킹"이다. 피해자는 당신을 공격자가 아닌 업데이트 알림으로 본다.',
                continuity:
                  '작전 지시는 "조용히, 오래"였다. 공급망은 공격이 "정상 업데이트"로 위장되기 때문에 탐지까지 시간을 가장 많이 번다.',
                relevance: [
                  { label: 'NotPetya (2017)', note: 'M.E.Doc 회계 SW 업데이트 하이재킹 → 전 세계 확산' },
                  { label: 'CCleaner (2017)', note: 'Piriform 빌드 서버 침투 → 227만 감염' },
                  { label: '3CX (2023)', note: 'Trading Tech 공급망 2단계 연쇄' },
                ],
                coherence: {
                  nextTitle: '다음: "어느 제조사를 뚫을 것인가?"',
                  nextHint: '네트워크 모니터링 제품이 눈에 띈다. 관리자 권한으로 모든 서버를 들여다보는 제품.',
                },
                daysDelta: -30,       // 정찰에 한 달
                budgetDelta: -15,
                detectionDelta: 0,    // 아직 드러나지 않음
                leavesTrace: 'supply-chain-chosen',
              },
            },
            {
              id: 'spearphishing',
              title: '스피어피싱',
              subtitle: '핵심 인물에게 정교한 이메일 하나',
              emoji: '✉️',
              ttp: ['T1566.001'],
              result: {
                consequenceShort:
                  '빠르고 싸다. 대신 한 번 당한 기관은 다른 기관으로 번지지 않는다.',
                consequenceLong:
                  '핵심 관리자 한 명을 속여 첨부파일을 열게 하면 그 네트워크로는 들어갈 수 있다. 하지만 목표는 "하나의 기관"이 아니라 "다수 기관 동시 장악". 스피어피싱으로는 기관당 한 번씩 새로 뚫어야 하고, 각 기관의 EDR·이메일 게이트웨이가 당신의 동일 수법을 학습한다.',
                learning:
                  '스피어피싱은 "점"을 뚫는 공격. 공급망은 "면"을 뚫는 공격. 이번 작전의 규모와 맞지 않는다.',
                continuity:
                  '지시는 수천 기관을 "동시에, 조용히"였다. 스피어피싱은 동시성을 보장하지 못한다.',
                relevance: [
                  { label: 'APT29 COZY CAR (2014)', note: '미 국무부 스피어피싱 — 점 단위 침투' },
                  { label: 'Fancy Bear DNC (2016)', note: '민주당 선거대책본부 이메일 — 단일 타겟' },
                ],
                coherence: {
                  nextTitle: '다시 선택으로',
                  nextHint: '작전 규모와 맞지 않는다. 다른 길을 고민해야 한다.',
                },
                daysDelta: -5,
                budgetDelta: -5,
                detectionDelta: 5,
                leavesTrace: null,
              },
            },
            {
              id: 'zero-day',
              title: '제로데이 구매',
              subtitle: '아무도 모르는 취약점을 돈으로 산다',
              emoji: '💎',
              ttp: ['T1190'],
              result: {
                consequenceShort:
                  '강력하지만 한 번 쓰면 끝. 공급망의 "재사용 가능성"과 비교하면 비효율.',
                consequenceLong:
                  '다크마켓에서 미발표 취약점을 100만 달러 단위로 사면 방어자는 막을 수 없다. 그러나 한 번 사용된 제로데이는 로그에 남고, Microsoft나 Cisco가 긴급 패치를 내면 가치는 즉시 0이 된다. 공급망은 탐지가 어렵고, 탐지되어도 그 사이 뿌려둔 백도어는 살아있다.',
                learning:
                  '제로데이는 "강하지만 휘발성". 공급망 공격은 "조용하지만 지속성". 이번 작전은 후자를 원한다.',
                continuity:
                  '"오래" 살아남아야 한다. 제로데이는 패치되면 죽는다. 공급망 백도어는 수천 고객에 이미 설치됐으면 패치와 무관하게 살아있다.',
                relevance: [
                  { label: 'Stuxnet (2010)', note: '제로데이 4개 동원 — 최고 수준이지만 결국 발견됨' },
                  { label: 'Hafnium (2021)', note: 'Exchange 제로데이 → 긴급 패치로 수명 단축' },
                ],
                coherence: {
                  nextTitle: '다시 선택으로',
                  nextHint: '강도와 지속성을 구분해야 한다.',
                },
                daysDelta: -15,
                budgetDelta: -40,
                detectionDelta: 10,
                leavesTrace: null,
              },
            },
          ],
        },
        // 1-b ─────────────────────────────────────────────────────
        {
          id: 'b1-b',
          question: '어떤 제조사를 뚫을 것인가?',
          hint:
            '"한 번의 침투가 많은 문을 여는" 제품을 찾아야 한다. 관리자 권한으로 모든 네트워크를 보는 소프트웨어.',
          options: [
            {
              id: 'solarwinds',
              title: 'SolarWinds Orion',
              subtitle: 'IT 모니터링 — 포춘 500 중 425곳, 미 정부 다수',
              emoji: '🌞',
              ttp: ['T1195.002'],
              result: {
                consequenceShort:
                  '완벽. Orion은 관리자 권한으로 모든 서버를 모니터링한다. 한 번 심으면 모든 것을 본다.',
                consequenceLong:
                  'Orion은 네트워크 전체 장비를 SNMP/WMI로 조회하는 관리자급 에이전트를 고객 서버에 설치한다. 즉 Orion 업데이트에 백도어를 심으면, 고객사 내부 네트워크에 "합법적 관리자"로 들어가 있는 백도어가 된다. 게다가 고객 리스트가 미 재무부·국토안보부·국방부·Microsoft·FireEye까지 포함한다.',
                learning:
                  '타겟 선정의 황금률: "가장 많은 고객 × 가장 높은 권한 × 가장 민감한 고객". 세 조건을 모두 만족하는 것이 최상위 타겟.',
                continuity:
                  '1-a에서 공급망을 선택한 목표("조용히·오래·많이")에 Orion이 수학적으로 가장 잘 맞는다.',
                relevance: [
                  { label: 'Kaseya VSA (2021)', note: '원격관리 SW — 동일한 "관리자 권한 공급망" 패턴' },
                  { label: 'SITA Passenger SW (2021)', note: '항공사 공급망 — 고객망을 한 번에' },
                ],
                coherence: {
                  nextTitle: '다음: "빌드 서버에 어떻게 접근할 것인가?"',
                  nextHint: 'SolarWinds 본사 IT 네트워크부터 뚫어야 한다. 정면 침투 vs 개발자 계정.',
                },
                daysDelta: -10,
                budgetDelta: -5,
                detectionDelta: 0,
                leavesTrace: 'target-solarwinds',
              },
            },
            {
              id: 'microsoft-update',
              title: 'Microsoft Windows Update',
              subtitle: '지구상 거의 모든 PC가 받는다',
              emoji: '🪟',
              ttp: ['T1195.002'],
              result: {
                consequenceShort:
                  '이상적이지만 불가능. MS는 지구에서 가장 잘 방어되는 빌드 파이프라인 중 하나.',
                consequenceLong:
                  '규모는 최대지만, MS Azure Signing Infra는 HSM·Split Key·다중 서명자·물리 격리 환경으로 일반 공격자가 뚫을 수 없다. 2010년 Stuxnet이 훔친 RealTek·JMicron 서명키도 MS급 아님. 현실적 비용 대비 불가능.',
                learning:
                  '공급망 타겟 선정은 "규모"뿐 아니라 "돌파 가능성"을 함께 본다. 너무 크면 뚫을 수 없다.',
                continuity:
                  '"조용히" 들어가야 한다. MS 인프라를 뚫다가 발각되면 전 세계가 즉시 경계 태세.',
                relevance: [
                  { label: 'Flame (2012)', note: 'MS 인증서 위조 — 국가급 예외 사례' },
                  { label: 'ShadowHammer ASUS (2019)', note: 'ASUS 업데이트 — 크지만 MS보단 접근 가능' },
                ],
                coherence: {
                  nextTitle: '다시 선택으로',
                  nextHint: '규모와 가능성 사이의 균형.',
                },
                daysDelta: -5,
                budgetDelta: -10,
                detectionDelta: 3,
                leavesTrace: null,
              },
            },
            {
              id: 'av-vendor',
              title: '백신 벤더 업데이트',
              subtitle: 'Avast/Kaspersky — EDR 자체가 관리자',
              emoji: '🛡️',
              ttp: ['T1195.002'],
              result: {
                consequenceShort:
                  '권한은 최고지만 내부 코드 감사가 가장 엄격한 산업.',
                consequenceLong:
                  '백신은 커널 드라이버를 설치하고 모든 프로세스를 감시한다. 업데이트에 백도어를 심으면 최상위 권한을 얻지만, 백신 회사들은 서로를 감시하며 자사 업데이트를 스스로 YARA로 검증한다. 게다가 Kaspersky 같은 경우 러시아 정부 영향권 — 내부 정치 리스크.',
                learning:
                  '타겟의 "방어 태세"와 "내부 정치"도 선정 요소. 권한만 높다고 좋은 타겟이 아니다.',
                continuity:
                  '빠르게 드러날 가능성이 높아 "오래" 조건을 만족하기 어렵다.',
                relevance: [
                  { label: 'Kaspersky Duqu2.0 (2015)', note: '백신사 내부 침투 — 단, 자사 탐지로 자가 발견' },
                ],
                coherence: {
                  nextTitle: '다시 선택으로',
                  nextHint: '권한과 탐지 리스크의 트레이드오프.',
                },
                daysDelta: -8,
                budgetDelta: -20,
                detectionDelta: 8,
                leavesTrace: null,
              },
            },
          ],
        },
        // 1-c ─────────────────────────────────────────────────────
        {
          id: 'b1-c',
          question: '작전 기간을 얼마로 잡을 것인가?',
          hint:
            '공급망 공격은 "심기 전 정찰"이 전투의 80%. 짧으면 들킨다. 너무 길면 경쟁 조직에게 기회를 뺏긴다.',
          options: [
            {
              id: 'patient-12m',
              title: '12개월 계획',
              subtitle: '정찰 6개월 · 잠복 3개월 · 실행 3개월',
              emoji: '🕯️',
              ttp: ['T1583'],
              result: {
                consequenceShort:
                  'SolarWinds 사내 시스템·빌드 파이프라인·개발자 습관을 완전히 파악한 뒤 실행.',
                consequenceLong:
                  'APT29는 실제로 2019년 9월 테스트 코드(OrionImprovements Business Layer 관련 테스트) 주입부터 시작해, 2020년 2월에야 본격 SUNBURST DLL을 배포했다. 6개월 "점검기"를 두어 탐지 여부를 관찰한 것. 이 인내가 18개월 무탐지를 만든 핵심.',
                learning:
                  '공격자의 시간은 방어자의 적. 서두르는 공격자는 자기가 남긴 흔적에 걸린다.',
                continuity:
                  '"조용히·오래" 조건은 본질적으로 시간 투자 문제다. 이 선택이 나머지 모든 결정의 기조를 결정한다.',
                relevance: [
                  { label: 'APT1 PLA 61398', note: '평균 잠복 356일 — 국가급 APT 표준 시간' },
                  { label: 'Equation Group', note: '수년 단위 잠복 — 시간이 무기인 대표 사례' },
                ],
                coherence: {
                  nextTitle: 'Beat 2로 이동: "빌드 서버 접근"',
                  nextHint: 'SolarWinds 본사 네트워크의 개발자 계정부터 확보해야 한다.',
                },
                daysDelta: 0,
                budgetDelta: -10,
                detectionDelta: -3,
                leavesTrace: 'patient-12m',
              },
            },
            {
              id: 'fast-3m',
              title: '3개월 속공',
              subtitle: '빠르게 들어가 빠르게 퍼뜨린다',
              emoji: '⚡',
              ttp: ['T1583'],
              result: {
                consequenceShort:
                  '탐지율 급증. 방어자가 당신의 정찰 트래픽을 기억한다.',
                consequenceLong:
                  '짧은 준비는 곧 짧은 관찰을 의미한다. SolarWinds 빌드 시스템의 YARA 룰 주기, SHA 서명 검증 타이밍, 개발자 커밋 패턴을 모르는 상태로 뛰어들면 흔적이 쌓인다. 실제 3CX(2023)는 서두르다 Mandiant에 한 달 만에 잡혔다.',
                learning:
                  '공급망은 장거리 달리기. 단거리 전술을 쓰면 실패한다.',
                continuity:
                  '"오래" 살아남기 위한 선택이었는데, 속공은 그 조건을 포기하는 것.',
                relevance: [
                  { label: '3CX Supply Chain (2023)', note: '빠른 실행 → 34일 만에 Mandiant 탐지' },
                ],
                coherence: {
                  nextTitle: '다시 선택으로',
                  nextHint: '지속성과 속도 중 하나를 골라야 한다.',
                },
                daysDelta: 30,        // 실제로 더 빨리 끝남 (역설적으로 시간 절약 아님)
                budgetDelta: -5,
                detectionDelta: 25,
                leavesTrace: null,
              },
            },
            {
              id: 'ultra-patient-24m',
              title: '24개월 초장기',
              subtitle: '경쟁 APT에 뺏길 위험',
              emoji: '🗿',
              ttp: ['T1583'],
              result: {
                consequenceShort:
                  '완벽하지만 다른 팀이 먼저 SolarWinds를 뚫을 수 있다.',
                consequenceLong:
                  'APT 세계는 경쟁이다. 중국 APT10·북한 Lazarus·이란 APT33이 같은 타겟을 노릴 수 있고, 그중 누군가가 먼저 뚫으면 당신이 심어둔 정찰 장비가 "이미 타사 침투로 노이지해진 환경"에 노출된다. 24개월은 현실적으로 너무 길다.',
                learning:
                  '인내는 미덕이지만, 과도한 인내는 기회 상실.',
                continuity:
                  '목표는 "조용히·오래"였지, "영원히"가 아니다. 12개월이 균형점.',
                relevance: [
                  { label: 'Dragonfly (2017)', note: '3년 준비 → 에너지 섹터 다수 공격자 경쟁' },
                ],
                coherence: {
                  nextTitle: '다시 선택으로',
                  nextHint: '경쟁이 없는 타겟은 없다.',
                },
                daysDelta: -365,      // 1년을 그냥 태움
                budgetDelta: -25,
                detectionDelta: 2,
                leavesTrace: null,
              },
            },
          ],
        },
      ],
      expansion: [
        {
          id: 'exp-why-cozy-bear',
          title: '왜 APT29인가?',
          emoji: '🐻',
          content:
            'APT29는 FSB 산하 SVR(해외정보국) 소속으로 추정. 특징은 "드러나지 않는 것이 성공"이라는 교리. 2014 COZY CAR(국무부), 2015 COZY DUKE(DNC), 2020 SUNBURST — 모두 평균 잠복 1년 이상. 다른 그룹(APT28/Fancy Bear)이 시끄럽게 들어가는 동안 APT29는 문자 그대로 "바닥에 녹아" 있었다.',
        },
        {
          id: 'exp-orion-product',
          title: 'Orion은 정확히 뭐 하는 SW?',
          emoji: '🔍',
          content:
            'SolarWinds Orion Platform = IT 인프라 모니터링. SNMP·WMI·SSH로 네트워크 장비·서버·DB의 상태를 수집. 즉 고객사 방화벽 안쪽에서 "모든 장비의 관리자 자격증명"을 쥐고 있다. 백도어 삽입 시 그 자격증명이 공격자 손에 들어온다.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // BEAT 2 — 빌드 서버 접근 (shell)
    // ─────────────────────────────────────────────────────────────
    {
      id: 'b2',
      num: 2,
      title: '빌드 서버 접근',
      emoji: '🏗️',
      status: 'locked',
      intro: 'SolarWinds 본사 네트워크로 들어간다. 개발자 계정, VPN, 소스 저장소 — 어느 길을 먼저?',
      required: [],
    },
    // ─────────────────────────────────────────────────────────────
    // BEAT 3 — 백도어 코드 설계 (shell)
    // ─────────────────────────────────────────────────────────────
    {
      id: 'b3',
      num: 3,
      title: '백도어 코드 설계',
      emoji: '🧬',
      status: 'locked',
      intro: 'SUNBURST DLL의 잠복 로직 — 얼마나 "자는지", 무엇을 피해야 하는지.',
      required: [],
    },
    // ─────────────────────────────────────────────────────────────
    // BEAT 4 — C2 인프라 구축 (shell)
    // ─────────────────────────────────────────────────────────────
    {
      id: 'b4',
      num: 4,
      title: 'C2 인프라 구축',
      emoji: '📡',
      status: 'locked',
      intro: 'DGA 도메인, CDN 위장, AWS 리전. 흔적을 덮는 법.',
      required: [],
    },
    // ─────────────────────────────────────────────────────────────
    // BEAT 5 — 첫 통신 확인 (shell)
    // ─────────────────────────────────────────────────────────────
    {
      id: 'b5',
      num: 5,
      title: '첫 통신 확인',
      emoji: '📶',
      status: 'locked',
      intro: '18,000개 고객 중 누가 제일 먼저 집에 편지를 보냈나.',
      required: [],
    },
  ],

  // 후속 beat 에서 발현시킬 "과거 흔적" (엔진 로직은 후속 PR)
  dominoes: [
    {
      id: 'd-supply-chain-locked-in',
      triggerAt: 'b2',
      dependsOn: 'supply-chain-chosen',
      reveal:
        '1-a에서 고른 공급망 전략이 이제 발목을 잡는다. 정찰이 길어야 하고, 빌드 서버는 정면 돌파 불가.',
    },
    {
      id: 'd-patient-pays-off',
      triggerAt: 'b3',
      dependsOn: 'patient-12m',
      reveal:
        '1-c에서 고른 12개월은 여기서 보답한다. SolarWinds 빌드 주기(2주)를 6번 관찰한 덕에 삽입 타이밍이 보인다.',
    },
  ],
};

export default chapter;

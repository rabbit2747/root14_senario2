// SolarWinds SUNBURST 학습 콘텐츠 (C0024) — 공격자 관점 10챕터
//
// 대상: 해외 펜테스터 + 초보자 혼합 → 중학생도 이해할 문장 + 실제로 써보는 인터랙션
// 톤: "당신이 APT29 요원이라면?" 시뮬레이션형 내레이션
// 구조:
//   Ch1 APT29의 정체             [풀]   — 누가 했는가
//   Ch2 공급망 공격이란?         [풀]   — 왜 이 방식이 무서운가
//   Ch3 Orion 해부학             [풀]   — 타겟이 왜 치명적이었는가
//   Ch4 빌드 서버 정찰           [skel]
//   Ch5 SUNBURST DLL 주입        [skel]
//   Ch6 코드 서명 & 배포         [skel]
//   Ch7 14일 잠복 & 샌드박스 회피[skel]
//   Ch8 DGA C2 통신              [skel]  ← DgaSandbox 맛보기는 Ch3 제공
//   Ch9 2차 페이로드 (TEARDROP)  [skel]
//   Ch10 지속성 + 종합 평가      [skel]
//
// 규약:
//   - 각 CHAPTERS[i].ready === true 인 챕터만 풀 렌더링
//   - render({isDark, C}) 에서 C = Study components (import * as Study)
//   - ready:false 인 챕터는 { bullets: [] } 만 제공 → NotReadyChapter 로 렌더

import DgaSandbox from '../../pages/apt/study/DgaSandbox.jsx';

export const META = {
  campaignId: 'C0024',
  title: 'SolarWinds SUNBURST — APT29의 9개월 공급망 침투',
  availableLevels: ['intermediate'],
  totalEstimatedMin: 180, // 10챕터 × 평균 18분
  subtitle:
    '2019년 9월부터 2020년 12월까지, 세계 최고 수준의 정보기관 해커가 어떻게 18,000개 기관의 신뢰를 우회했는지 — 공격자 관점에서 한 단계씩 해부합니다.',
};

// ═══════════════════════════════════════════════════════════════════
// 챕터 데이터
// ═══════════════════════════════════════════════════════════════════

export const CHAPTERS = [
  // ─── Ch1. APT29의 정체 ─────────────────────────────────────────
  {
    id: 'ch1-apt29',
    num: 1,
    title: '"Cozy Bear"는 누구인가 — 적을 안다는 것',
    subtitle:
      '9개월간 들키지 않았던 공격자의 정체. 국가 정보기관 수준의 해커는 "실력"보다 "인내심"이 무기입니다.',
    estMin: 15,
    ready: true,
    render: ({ isDark, C }) => (
      <>
        <C.P isDark={isDark}>
          2020년 12월 13일, 사이버 보안 회사 <b>FireEye</b>가 충격적인 발표를 합니다.
          "우리 내부 도구가 도난당했고, 범인은 세계에서 가장 정교한 해커 그룹이다."
          곧이어 밝혀진 사실은 더 믿기 어려웠어요 — 미국 재무부, 국무부, 국토안보부, 그리고 포천 500대 기업 중 425개사.
          이 모든 곳이 같은 범인에게 당했고, 이미 <b>9개월째 침투당한 상태</b>였습니다.
        </C.P>

        <C.P isDark={isDark}>
          당신이 펜테스터라면 여기서 첫 질문을 던져야 합니다 — <b>"9개월 동안 어떻게 안 들켰지?"</b>
          답은 공격자의 정체에 있습니다. 이 챕터에서는 범인이 <i>어떤 사람들</i>이었고, 왜 그들의 방식이 일반 해커와 달랐는지부터 이해합니다.
        </C.P>

        <C.H3 icon="🐻" isDark={isDark}>APT29 = Cozy Bear = SVR</C.H3>

        <C.P isDark={isDark}>
          보안업계는 그들을 <C.KeyTerm term="APT29" definition="Advanced Persistent Threat의 29번. 지속적 침투형 공격자 그룹에 붙는 추적 번호. APT28(Fancy Bear), APT29(Cozy Bear) 등 '곰' 시리즈는 러시아 소속으로 분류됩니다." isDark={isDark} />이라 부릅니다.
          별명은 <b>Cozy Bear</b>(아늑한 곰), 소속은 러시아 <C.KeyTerm term="SVR" definition="Служба внешней разведки — 러시아 해외정보국. 구 KGB의 해외 파트가 1991년 분리된 조직으로, 한국의 국정원·미국 CIA에 해당합니다. 군사정보국 GRU(APT28)와는 별개 조직이에요." isDark={isDark} /> (해외정보국).
          즉, 이 공격은 <b>정부 기관이 집행한 정보 수집 작전</b>이었지 돈을 노린 사이버 범죄가 아니었습니다.
        </C.P>

        <C.Metaphor icon="🎭" title="쉽게 비유하자면" isDark={isDark}>
          일반 해커가 "은행을 털러 가는 강도"라면, APT29는 "은행에 청소부로 취직해서 2년 동안 청소하며 금고 비밀번호를 외우는 스파이"입니다.
          들어가는 방식도 조용하고, 머무는 시간도 길고, 목적도 돈이 아니라 <b>정보</b>예요.
        </C.Metaphor>

        <C.H3 icon="📜" isDark={isDark}>APT29의 경력 — 그들이 이미 해왔던 것들</C.H3>

        <C.P isDark={isDark}>
          SolarWinds가 그들의 첫 작품은 아닙니다. 9개월을 들키지 않은 건 "운이 좋아서"가 아니라 <b>10년치 경험의 결과</b>예요.
          주요 활동 이력을 보면 왜 FireEye가 이들을 "최상위 국가 행위자"로 분류했는지 보입니다.
        </C.P>

        <C.Timeline
          isDark={isDark}
          steps={[
            {
              time: '2014',
              title: '미 국무부 비공개 이메일 침투',
              detail:
                '백악관·국무부 비기밀 네트워크 침투. 발견된 뒤에도 몇 달간 방어자와 실시간 교전하며 재접근을 시도했습니다 — "집요함"이 트레이드마크가 된 순간.',
              tone: 'warn',
            },
            {
              time: '2015-2016',
              title: 'DNC(미국 민주당 전국위원회) 해킹',
              detail:
                'APT28과 함께 DNC 네트워크에 1년 이상 체류. 이메일 유출이 2016 대선 개입으로 이어졌습니다 — 하지만 APT29 쪽은 유출이 아니라 "조용한 정보 수집"만 수행.',
              tone: 'danger',
            },
            {
              time: '2018',
              title: '핀란드·노르웨이 외교부',
              detail: '북유럽 정부 네트워크 장기 체류. 패턴은 같아요 — 들어가서, 숨고, 읽는다.',
              tone: 'warn',
            },
            {
              time: '2020.07',
              title: 'COVID 백신 연구소',
              detail: '영·미·캐나다 옥스퍼드·AstraZeneca 등 백신 개발 데이터 탈취 시도. 이게 "평소" 모드.',
              tone: 'info',
            },
            {
              time: '2020.12',
              title: '★ SolarWinds SUNBURST 공개',
              detail:
                '9개월 은폐 → 18,000개 기관 감염 → 100개 정밀 타겟 심화 침투 → 탐지. 지금 이 강의의 주제.',
              tone: 'danger',
            },
          ]}
        />

        <C.H3 icon="🔬" isDark={isDark}>APT29의 3가지 TTP 특징</C.H3>

        <C.P isDark={isDark}>
          <C.KeyTerm term="TTP" definition="Tactics, Techniques, Procedures — '전술·기법·절차'. 공격자가 어떻게 움직이는지를 세 단계 추상도로 쪼갠 분석 틀. MITRE ATT&CK 프레임워크가 이걸 체계화했어요. 여기서는 '공격 스타일'로 이해하면 됩니다." isDark={isDark} />만 보면 APT29는 다른 러시아 그룹(APT28)과도 확연히 다릅니다. 펜테스터로서 이 세 가지 특징은 꼭 외워 두세요 —
          SolarWinds의 모든 선택이 이 세 원칙에서 나옵니다.
        </C.P>

        <C.StepByStep
          isDark={isDark}
          items={[
            {
              title: '원칙 1. "들키느니 포기한다"',
              body:
                'SUNBURST는 14일간 자기 자신을 가만히 재웠습니다. 백신 프로세스가 보이거나, 도메인 환경이 아니면 아예 활동을 시작하지 않았어요. 일반 해커는 "빨리 수익화"가 목적이라 이렇게 기다리지 못합니다. 국가 정보기관은 "1년 잠복이라도 정보만 얻으면 성공"이기 때문에 가능한 판단이에요.',
            },
            {
              title: '원칙 2. "기존에 있는 것만 쓴다"(Living off the Land)',
              body:
                '새로운 멀웨어를 만들어 배포하면 백신 시그니처에 걸립니다. APT29는 가능하면 운영체제·관리도구에 원래부터 있던 정상 프로그램(PowerShell, WMI, certutil, 심지어 SolarWinds Orion 자체!)을 악용해요. 이걸 "Living off the Land"(LotL)라 부릅니다. 쉽게 말해 "식당에서 도구를 훔치지 않고, 식당 주방칼로 요리한다"는 뜻.',
            },
            {
              title: '원칙 3. "같은 인프라는 재활용하지 않는다"',
              body:
                '다른 그룹은 같은 C2 서버를 10년씩 쓰다가 한 번 털리면 모든 작전이 무너집니다. APT29는 캠페인마다 완전히 새 도메인·새 서버를 만들어요. SolarWinds용 avsvmcloud.com은 이 작전 전용으로 2019년에 새로 준비된 인프라였습니다.',
            },
          ]}
        />

        <C.CalloutBox tone="warn" icon="⚠️" title="펜테스터 주의" isDark={isDark}>
          이 세 원칙은 레드팀 방법론으로도 훌륭합니다. 하지만 실제 모의침투 업무에서 "14일 잠복"은 의미 없는 비용입니다 —
          국가 행위자와 허가받은 펜테스터의 차이는 <b>시간 예산</b>이에요. APT29의 방법론을 이해하되, 모방할 부분과 그렇지 않을 부분을 구분하세요.
        </C.CalloutBox>

        <C.H3 icon="🎯" isDark={isDark}>왜 SolarWinds를 골랐을까 — 공격자의 타겟 선정</C.H3>

        <C.P isDark={isDark}>
          2019년 9월, APT29는 이미 SolarWinds 회사 네트워크에 들어와 있었습니다. 하지만 바로 공격을 시작하지 않았어요.
          대신 <b>7개월 동안 정찰</b>만 했습니다. 왜? 이 케이스 스터디에서 같이 생각해 봅시다.
        </C.P>

        <C.CaseStudyPrompt
          isDark={isDark}
          scenario="당신은 SVR의 사이버 작전 기획 장교입니다. 미국 정부 네트워크 전체에 대한 장기 접근권이 필요합니다. 직접 국무부를 해킹하는 건 방어가 너무 두텁고 이미 여러 번 실패했어요. 대신 국무부가 '무조건 신뢰하는 제3자'를 찾으려고 합니다."
          question="다음 중 가장 전략적으로 매력적인 타겟은?"
          choices={[
            {
              id: 'A',
              label: '국무부 직원에게 피싱 이메일 — 빠르고 비용이 싸다',
              correct: false,
              feedback:
                '빠르긴 하지만 한 명 한 명 낚아야 하고, 걸리면 "국무부가 피싱 당했다"로 끝납니다. 국가 행위자에게 비용(실력 노출)이 너무 큰 방식이에요.',
            },
            {
              id: 'B',
              label: 'SolarWinds — 국무부 네트워크를 감시하는 도구를 만드는 회사',
              correct: true,
              feedback:
                '정답. SolarWinds Orion은 국무부가 관리자 권한으로 설치하는 네트워크 감시 도구예요. 이 회사 하나를 털면, 국무부는 이 회사가 서명한 업데이트를 "정식 소프트웨어"로 믿고 자동 설치합니다. 1번의 침투로 수천 개 타겟에 동시 접근이 가능하죠. 이것이 공급망 공격의 핵심.',
            },
            {
              id: 'C',
              label: 'Cisco — 국무부가 사용하는 네트워크 장비 제조사',
              correct: false,
              feedback:
                '이론상 가능하지만 Cisco는 펌웨어 배포가 엄격하게 서명·검증되고, 고객 네트워크에 원격 자동 업데이트되는 구조가 아닙니다. 침투해도 "원격 자동 설치" 파이프라인이 없어 파급력이 제한적이에요.',
            },
            {
              id: 'D',
              label: 'Microsoft — 운영체제 공급사',
              correct: false,
              feedback:
                'MS 공급망 침투는 가능했다면 당연히 최고였겠지만, 보안 투자 규모가 SolarWinds의 수백 배입니다. 침투 확률과 탐지 회피 확률을 곱하면 기대값이 낮아요. 공격자는 가성비를 따집니다.',
            },
          ]}
          reveal="실제로 SVR이 선택한 건 B — SolarWinds였습니다. 이유 3가지: (1) Orion은 고객사 네트워크에 관리자 권한으로 설치됨, (2) 매월 자동 업데이트되는 구조, (3) 고객 명단에 미 연방정부 425개 부처와 포천 500대 기업의 대부분이 포함. 한 번의 침투 → 18,000개 동시 감염. 이것이 SolarWinds가 '공급망 공격의 원형'으로 기억되는 이유입니다."
        />

        <C.H3 icon="🧭" isDark={isDark}>이 강의의 지도</C.H3>

        <C.P isDark={isDark}>
          10챕터에 걸쳐, APT29가 2019년 9월 SolarWinds 네트워크에 처음 들어간 순간부터 2020년 12월 FireEye가 발견한 순간까지를 <b>시간 순서대로</b> 따라갑니다.
          각 챕터 끝에는 공격자 샌드박스(실습)나 케이스 스터디(결정)가 있어요. 당신은 관찰자가 아니라 <b>APT29 요원의 어깨 너머</b>에서 같이 판단합니다.
        </C.P>

        <C.CalloutBox tone="info" icon="📚" title="다음 챕터 예고 — 공급망 공격의 해부학" isDark={isDark}>
          왜 이 방식이 "기존 방어 체계를 무력화"했는지, 그리고 공급망 공격이 기존 해킹과 근본적으로 다른 점 3가지를 배웁니다.
          마지막에는 "18,000개 감염 중 왜 100개만 활성화했는가" 의사결정 케이스를 풀어 봅니다.
        </C.CalloutBox>

        <C.MiniQuiz
          isDark={isDark}
          title="Ch1 체크포인트 — APT29 이해도"
          questions={[
            {
              q: 'APT29(Cozy Bear)의 모국 소속 정보기관은?',
              choices: [
                { id: 'A', label: 'GRU (군사정보국)' },
                { id: 'B', label: 'SVR (해외정보국)' },
                { id: 'C', label: 'FSB (연방보안국)' },
                { id: 'D', label: 'KGB (현재 존재하지 않음)' },
              ],
              correctId: 'B',
              explain:
                'APT29 = Cozy Bear = SVR. GRU는 APT28(Fancy Bear)로 별개 조직입니다. 두 그룹은 같은 타겟(DNC)을 공격했지만 협력하지 않고 서로 모르게 작전했어요.',
            },
            {
              q: '"Living off the Land" 전략의 핵심 아이디어는?',
              choices: [
                { id: 'A', label: '새로운 제로데이 취약점을 쓴다' },
                { id: 'B', label: '시스템에 원래 있는 정상 도구만 악용한다' },
                { id: 'C', label: '물리적으로 사무실에 침입한다' },
                { id: 'D', label: '소셜 엔지니어링으로 직원에게 직접 멀웨어를 실행시킨다' },
              ],
              correctId: 'B',
              explain:
                'LotL은 PowerShell, WMI, 정상 서명된 업체 도구처럼 이미 시스템에 있는 프로그램으로만 공격하는 전략. 새 멀웨어를 배포하지 않으니 백신 시그니처로는 절대 안 잡힙니다.',
            },
            {
              q: '당신이 APT29의 타겟 선정자라면, 미국 정부 전체에 장기 접근할 가장 효율적인 타겟은?',
              choices: [
                { id: 'A', label: '국무부 직원에게 피싱' },
                { id: 'B', label: 'Cisco 라우터 펌웨어 공급망' },
                { id: 'C', label: '국무부가 신뢰하는 제3자 소프트웨어 공급사' },
                { id: 'D', label: '국무부 클라우드 서비스 제공사' },
              ],
              correctId: 'C',
              explain:
                'C — 정확히 SolarWinds 시나리오. 공급망 공격의 본질은 "피해자가 이미 신뢰를 확립한 제3자"를 장악하는 것. 한 번의 침투로 신뢰 관계 전체가 감염 통로로 바뀝니다.',
            },
          ]}
        />
      </>
    ),
  },

  // ─── Ch2. 공급망 공격이란? ──────────────────────────────────────
  {
    id: 'ch2-supply-chain',
    num: 2,
    title: '공급망 공격 — 왜 방화벽으로는 못 막나',
    subtitle:
      '기존 해킹과 근본적으로 다른 "신뢰 우회" 공격. 이메일, 포트 스캔, 제로데이 다음에 온 4세대 공격 모델.',
    estMin: 20,
    ready: true,
    render: ({ isDark, C }) => (
      <>
        <C.P isDark={isDark}>
          "방화벽을 뚫는다"는 1990년대 해킹의 언어입니다. 2020년대 공격자는 방화벽을 <b>뚫지 않아요</b> — 뚫린 상태로 들여 보내달라고 합니다.
          공급망 공격이 "4세대 사이버 공격"으로 불리는 이유가 여기 있어요. 이 챕터에서는 왜 이 방식이 기존 방어 체계를 무력화하는지, 그리고 공격자가 이 방식을 선택하는 경제적 이유를 배웁니다.
        </C.P>

        <C.H3 icon="🔄" isDark={isDark}>세대별 공격 모델의 진화</C.H3>

        <C.AttackFlow
          isDark={isDark}
          steps={[
            { icon: '🏰', label: '1세대: 경계 침투', detail: '포트 스캔 → 방화벽 취약점 → 직접 침입', tone: 'neutral' },
            { icon: '📧', label: '2세대: 피싱/소셜', detail: '사람을 속여 문을 열게 함', tone: 'info' },
            { icon: '💥', label: '3세대: 제로데이', detail: '알려지지 않은 취약점 익스플로잇', tone: 'warn' },
            { icon: '🎁', label: '4세대: 공급망', detail: '신뢰받는 제3자를 타고 합법적 진입', tone: 'danger' },
          ]}
        />

        <C.P isDark={isDark}>
          세대가 올라갈수록 공격자에게 필요한 건 "기술"이 아니라 "<b>레버리지</b>"입니다. 1세대는 내가 직접 문을 따야 했지만, 4세대는 피해자가 <b>자기 손으로 문을 열어줍니다</b>.
          그것도 의심 없이, "우리 업체에서 업데이트 왔네"라면서요.
        </C.P>

        <C.H3 icon="⚖️" isDark={isDark}>전통적 공격 vs 공급망 공격</C.H3>

        <C.CompareTable
          isDark={isDark}
          leftTitle="전통적 직접 공격"
          rightTitle="공급망 공격 (SUNBURST형)"
          rows={[
            {
              key: '진입 벡터',
              left: '피해자 네트워크를 직접 뚫음 (방화벽, 피싱)',
              right: '피해자가 신뢰하는 벤더의 업데이트를 감염',
            },
            {
              key: '첫 탐지 벽',
              left: '방화벽, IDS, EDR이 "외부에서 들어오는 트래픽"을 의심',
              right: '방화벽은 벤더 업데이트를 허용 목록(allowlist)에 넣음 → 통과',
            },
            {
              key: '권한',
              left: '사용자 계정 → 권한 상승 필요',
              right: '벤더 소프트웨어가 관리자 권한으로 설치됨 (Orion의 경우)',
            },
            {
              key: '코드 서명',
              left: '공격자 멀웨어 = 서명 없음 → 경고',
              right: '벤더의 정식 코드서명 인증서로 서명됨 → 운영체제가 신뢰',
            },
            {
              key: '공격 규모',
              left: '1대1 — 피해자마다 새로 뚫어야 함',
              right: '1대N — 한 번의 빌드 서버 침투로 수만 곳 감염',
            },
            {
              key: '공격 시간',
              left: '침투 후 빠른 수익화 (랜섬웨어 등)',
              right: '월 단위 잠복 — 진짜 타겟을 고를 시간이 있음',
            },
            {
              key: '공격자 투자',
              left: '피해자 1곳당 수시간~수일',
              right: '벤더 공격 셋업 6~18개월, 이후 자동 확산',
            },
          ]}
        />

        <C.CalloutBox tone="danger" icon="🚨" title="방어자가 구조적으로 불리한 이유" isDark={isDark}>
          기존 보안 체계는 "외부=위험, 벤더 업데이트=신뢰"라는 <b>이분법 신뢰 모델</b>로 설계됐습니다. 공급망 공격은 이 모델의 정중앙을 때려요 —
          신뢰해야 하는 대상이 감염되면, 방어자가 가진 모든 도구(방화벽, AV, 허용 목록)가 오히려 공격자의 편이 됩니다.
          이게 왜 2020년 이후 <C.KeyTerm term="Zero Trust" definition="어떤 네트워크 위치·계정·소프트웨어도 기본적으로 신뢰하지 않고, 매 요청마다 검증하는 보안 모델. SolarWinds 이후 미 연방정부가 의무화한 접근법." isDark={isDark} /> 아키텍처가 사실상 의무가 됐는지의 원인이에요.
        </C.CalloutBox>

        <C.H3 icon="🎯" isDark={isDark}>공격자의 경제학 — 왜 이 방식인가</C.H3>

        <C.P isDark={isDark}>
          APT29가 SolarWinds에 7개월을 투자한 건 감정이 아니라 <b>계산</b>입니다. 국가 행위자도 예산·인력이 유한해요.
          투입 시간 대비 얻는 정보 가치(ROI)를 계산해 봅시다.
        </C.P>

        <C.CodeBlock filename="attacker-roi-calc.txt" lang="text" isDark={isDark}>
{`[시나리오 A] 직접 공격 — 국무부를 피싱으로 뚫기
  - 피싱 이메일 1회 발송 → 성공률 3%
  - 직원 1명 감염 → 내부 정찰 → 권한 상승: 2~4주
  - 탐지 확률: EDR + SOC = 30% (들키면 작전 종료)
  - 얻는 것: 해당 직원 권한 범위 + 그 PC 내 파일
  - 기대 가치: 중간 (단일 기관 단일 직원)

[시나리오 B] 공급망 — SolarWinds를 통해
  - SolarWinds 네트워크 침투: 4~6개월 (한 번만)
  - 빌드 파이프라인 장악: 2개월
  - SUNBURST 배포 후 자동 확산: 0 (피해자가 설치)
  - 탐지 확률: 낮음 — 서명된 정식 업데이트 경로
  - 얻는 것: 18,000개 기관 잠재 접근 → 100개 정밀 타겟 선택
  - 기대 가치: 극도로 높음 (기관 수 × 권한 수준 × 시간)

결론: 초기 투자 6개월 증가, 기대 가치 10000배 이상.`}
        </C.CodeBlock>

        <C.H3 icon="🧩" isDark={isDark}>신뢰 체인이 공격 통로가 되는 메커니즘</C.H3>

        <C.P isDark={isDark}>
          조금 더 세부적으로 들어가 볼까요. "신뢰 체인"이 구체적으로 어떻게 공격 통로로 뒤집히는지, 시각으로 보면 명확합니다.
        </C.P>

        <C.DiagramBox
          caption="▲ 정상 업데이트 흐름(위)과 감염 업데이트 흐름(아래). 방어자 관점에서 두 흐름은 구별 불가능 — 동일한 인증서, 동일한 도메인, 동일한 설치 과정."
          isDark={isDark}
        >
          <svg viewBox="0 0 600 280" className="w-full max-w-[600px]" xmlns="http://www.w3.org/2000/svg">
            <g>
              <rect x="10" y="30" width="120" height="50" rx="6" fill={isDark ? '#1a3a1a' : '#dcfce7'} stroke="#22c55e" />
              <text x="70" y="52" fontSize="11" fill={isDark ? '#86efac' : '#15803d'} textAnchor="middle" fontWeight="bold">SolarWinds</text>
              <text x="70" y="66" fontSize="10" fill={isDark ? '#86efac' : '#15803d'} textAnchor="middle">개발팀 코드</text>
              <path d="M 130 55 L 180 55" stroke={isDark ? '#86efac' : '#22c55e'} strokeWidth="2" markerEnd="url(#arrG)" />
              <rect x="180" y="30" width="120" height="50" rx="6" fill={isDark ? '#1a3a1a' : '#dcfce7'} stroke="#22c55e" />
              <text x="240" y="52" fontSize="11" fill={isDark ? '#86efac' : '#15803d'} textAnchor="middle" fontWeight="bold">정상 빌드</text>
              <text x="240" y="66" fontSize="10" fill={isDark ? '#86efac' : '#15803d'} textAnchor="middle">서명된 DLL</text>
              <path d="M 300 55 L 350 55" stroke={isDark ? '#86efac' : '#22c55e'} strokeWidth="2" markerEnd="url(#arrG)" />
              <rect x="350" y="30" width="120" height="50" rx="6" fill={isDark ? '#1a3a1a' : '#dcfce7'} stroke="#22c55e" />
              <text x="410" y="52" fontSize="11" fill={isDark ? '#86efac' : '#15803d'} textAnchor="middle" fontWeight="bold">업데이트 서버</text>
              <text x="410" y="66" fontSize="10" fill={isDark ? '#86efac' : '#15803d'} textAnchor="middle">downloads.solar...</text>
              <path d="M 470 55 L 520 55" stroke={isDark ? '#86efac' : '#22c55e'} strokeWidth="2" markerEnd="url(#arrG)" />
              <rect x="520" y="30" width="70" height="50" rx="6" fill={isDark ? '#1a3a1a' : '#dcfce7'} stroke="#22c55e" />
              <text x="555" y="58" fontSize="11" fill={isDark ? '#86efac' : '#15803d'} textAnchor="middle" fontWeight="bold">고객</text>
              <text x="300" y="105" fontSize="11" fill={isDark ? '#86efac' : '#22c55e'} textAnchor="middle" fontStyle="italic" fontWeight="bold">정상 흐름 — 방어자 허용</text>
            </g>
            <line x1="10" y1="140" x2="590" y2="140" stroke={isDark ? '#555' : '#ccc'} strokeDasharray="4,4" />
            <g>
              <rect x="10" y="170" width="120" height="50" rx="6" fill={isDark ? '#3a1a1a' : '#fee2e2'} stroke="#ef4444" />
              <text x="70" y="192" fontSize="11" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle" fontWeight="bold">SolarWinds</text>
              <text x="70" y="206" fontSize="10" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle">+ APT29 침투</text>
              <path d="M 130 195 L 180 195" stroke={isDark ? '#fca5a5' : '#ef4444'} strokeWidth="2" markerEnd="url(#arrR)" />
              <rect x="180" y="170" width="120" height="50" rx="6" fill={isDark ? '#3a1a1a' : '#fee2e2'} stroke="#ef4444" />
              <text x="240" y="188" fontSize="11" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle" fontWeight="bold">감염 빌드</text>
              <text x="240" y="201" fontSize="9.5" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle">SUNBURST 삽입</text>
              <text x="240" y="213" fontSize="9.5" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle">+ 정식 서명</text>
              <path d="M 300 195 L 350 195" stroke={isDark ? '#fca5a5' : '#ef4444'} strokeWidth="2" markerEnd="url(#arrR)" />
              <rect x="350" y="170" width="120" height="50" rx="6" fill={isDark ? '#3a1a1a' : '#fee2e2'} stroke="#ef4444" />
              <text x="410" y="192" fontSize="11" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle" fontWeight="bold">동일 서버</text>
              <text x="410" y="206" fontSize="10" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle">downloads.solar...</text>
              <path d="M 470 195 L 520 195" stroke={isDark ? '#fca5a5' : '#ef4444'} strokeWidth="2" markerEnd="url(#arrR)" />
              <rect x="520" y="170" width="70" height="50" rx="6" fill={isDark ? '#3a1a1a' : '#fee2e2'} stroke="#ef4444" />
              <text x="555" y="198" fontSize="11" fill={isDark ? '#fca5a5' : '#b91c1c'} textAnchor="middle" fontWeight="bold">감염 ✗</text>
              <text x="300" y="245" fontSize="11" fill={isDark ? '#fca5a5' : '#ef4444'} textAnchor="middle" fontStyle="italic" fontWeight="bold">감염 흐름 — 방어자 허용 (구별 불가)</text>
            </g>
            <defs>
              <marker id="arrG" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={isDark ? '#86efac' : '#22c55e'} />
              </marker>
              <marker id="arrR" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={isDark ? '#fca5a5' : '#ef4444'} />
              </marker>
            </defs>
          </svg>
        </C.DiagramBox>

        <C.SocraticQuestion
          isDark={isDark}
          prompt="만약 당신이 방어자라면, 위 두 흐름을 어떻게 구별하겠습니까?"
          hint="인증서 확인? 해시 비교? 도메인 검사? 각각이 왜 실패하는지 생각해 보세요."
          answer={
            <span>
              <b>구별 불가능 — 그게 핵심입니다.</b> 인증서는 SolarWinds의 정식 코드서명이고, 해시는 SolarWinds 공식 릴리스 페이지에 공지된 값과 일치하며(왜냐면 공식 빌드 서버에서 나왔으니까), 다운로드 도메인도 진짜 solarwinds.com입니다.
              유일한 탐지 경로는 <b>행위 기반</b>(behavioral detection) — 설치된 후 14일 뒤부터 만들어내는 이상한 DNS 쿼리 — 뿐이에요. FireEye도 이걸로 발견했죠.
              "구조적으로 정적 분석은 불가능하다"가 공급망 공격의 정의적 특징입니다.
            </span>
          }
        />

        <C.H3 icon="📊" isDark={isDark}>"18,000개 중 100개만" — 공격자의 선택과 집중</C.H3>

        <C.P isDark={isDark}>
          SUNBURST는 18,000개 기관에 배포됐지만 실제로 2차 페이로드를 받은 곳은 <b>~100곳</b>이었습니다. 왜일까? 이번엔 당신이 직접 판단해 봅시다.
        </C.P>

        <C.CaseStudyPrompt
          isDark={isDark}
          scenario="당신은 APT29 작전 지휘관입니다. SUNBURST가 성공적으로 배포되어 18,000개 기관에 백도어가 심어졌습니다. 매주 감염된 기관 목록이 도메인 콜백으로 들어옵니다. 치과병원, 학교, 작은 회계법인, 그리고 미 국무부·재무부·NSA 같은 고가치 타겟이 뒤섞여 있어요."
          question="다음 단계로 무엇을 하시겠습니까?"
          choices={[
            {
              id: 'A',
              label: '모든 18,000개 기관에서 즉시 데이터를 빨아낸다 — 기회는 한 번뿐',
              correct: false,
              feedback:
                '유혹적이지만 자살 행위입니다. 18,000곳 동시 C2 트래픽 → 한 곳의 SOC만 "이상한 DNS"를 발견해도 그 IoC로 전 세계가 동시에 백도어를 찾게 돼요. 한 달 안에 작전 전체가 공개됩니다.',
            },
            {
              id: 'B',
              label: '고가치 타겟 ~100곳만 추려 2차 페이로드 배포, 나머지는 잠자게 둔다',
              correct: true,
              feedback:
                '정답. APT29가 실제로 택한 방식. 80%의 감염 기관은 "소음 차폐막"으로 유지 — 탐지돼도 "이 회사도 감염됐네"로 끝나게 만드는 희석 효과. 진짜 작전은 나머지 20%에 집중했고, 거기서도 추린 ~100곳만 TEARDROP 같은 2차 도구를 받았습니다.',
            },
            {
              id: 'C',
              label: '모든 감염을 제거해 증거를 없앤다',
              correct: false,
              feedback:
                '18,000곳 동시 백도어 제거는 대규모 이상 동작이라 바로 탐지됩니다. 또한 작전 성과를 포기하는 거라 SVR 상부 보고가 불가능해요.',
            },
            {
              id: 'D',
              label: '공개해서 SolarWinds의 신뢰를 무너뜨린다',
              correct: false,
              feedback:
                '러시아 정보기관이 자기 작전을 공개하지는 않습니다. 공개 = 동일 수법 재활용 영구 불가 = 미래 가치 0.',
            },
          ]}
          reveal="실제 APT29는 B를 택했습니다. FireEye 분석 결과 2차 페이로드(TEARDROP·RAINDROP)를 받은 기관은 미 국무부·재무부·NTIA·국토안보부·NIH·에너지부 등 고가치 정부 기관 + 일부 고가치 기업뿐. 나머지 17,900개는 백도어만 심어진 채 대기 상태였고, 이 '잠자는 감염'이 오히려 방어자에게는 복구를 더 어렵게 만들었어요 — 탐지 이후에도 '우리 네트워크에 TEARDROP이 없다고 해서 안전한가?'라는 질문에 답하기 어려웠기 때문."
        />

        <C.CalloutBox tone="success" icon="📝" title="Ch2 핵심 정리" isDark={isDark}>
          <ul className="list-disc pl-5 space-y-1">
            <li>공급망 공격은 "신뢰 체인"을 공격 통로로 뒤집는 4세대 모델입니다.</li>
            <li>방어자의 기존 도구(방화벽, 허용 목록, 인증서 검증)는 구조적으로 이 공격을 구별할 수 없습니다.</li>
            <li>공격자는 초기 투자 6개월 ↔ 기대 가치 10,000배의 계산으로 이 방식을 선택합니다.</li>
            <li>대규모 감염 후에도 "선택과 집중"으로 고가치 타겟만 심화 공격해야 탐지를 늦출 수 있습니다.</li>
          </ul>
        </C.CalloutBox>

        <C.MiniQuiz
          isDark={isDark}
          title="Ch2 체크포인트"
          questions={[
            {
              q: '공급망 공격이 전통적 직접 공격과 근본적으로 다른 "구조적 이점"은?',
              choices: [
                { id: 'A', label: '공격자가 제로데이를 더 많이 쓴다' },
                { id: 'B', label: '피해자가 신뢰하는 제3자의 서명된 경로로 들어간다' },
                { id: 'C', label: '네트워크 속도가 더 빠르다' },
                { id: 'D', label: '피해자가 반드시 알아차린다' },
              ],
              correctId: 'B',
              explain:
                '핵심은 "서명된 신뢰 경로" 사용. 방어자의 정적 도구는 서명을 신뢰하도록 설계됐기 때문에 구조적으로 탐지 불가능.',
            },
            {
              q: 'APT29가 18,000개 감염 중 ~100개만 2차 공격한 이유로 가장 정확한 것은?',
              choices: [
                { id: 'A', label: '나머지는 기술적으로 접근 불가능했다' },
                { id: 'B', label: 'SUNBURST의 버그였다' },
                { id: 'C', label: '탐지 지연을 위한 소음 차폐 + 가치 집중' },
                { id: 'D', label: '인력 부족' },
              ],
              correctId: 'C',
              explain:
                '의도적 선택이에요. 80%는 방어자가 "우리 회사도 감염됐네?"에서 분석을 멈추게 하는 희석 효과, 20%는 진짜 작전 수행.',
            },
            {
              q: 'Zero Trust 아키텍처가 SolarWinds 이후 의무화된 이유는?',
              choices: [
                { id: 'A', label: '방화벽을 대체하기 위해' },
                { id: 'B', label: '기존 "내부=신뢰" 이분법 모델이 공급망 공격에 구조적으로 취약함을 증명했기 때문' },
                { id: 'C', label: 'MS가 판매했기 때문' },
                { id: 'D', label: '사용자 편의성을 위해' },
              ],
              correctId: 'B',
              explain:
                '"어떤 요청도 기본 신뢰 없음"이 Zero Trust의 핵심. SolarWinds는 "벤더=신뢰"가 무너지면 모든 내부 제어가 무력화됨을 보여준 결정적 사례였어요.',
            },
          ]}
        />
      </>
    ),
  },

  // ─── Ch3. Orion 해부학 ────────────────────────────────────────
  {
    id: 'ch3-orion-anatomy',
    num: 3,
    title: 'Orion 해부학 — 공격자가 본 완벽한 타겟',
    subtitle:
      '왜 하필 Orion이었는가. 제품 구조, 빌드 파이프라인, 그리고 DGA 도메인 생성을 "직접 돌려 보는" 샌드박스.',
    estMin: 22,
    ready: true,
    render: ({ isDark, C }) => (
      <>
        <C.P isDark={isDark}>
          Ch2에서 우리는 "공급망 공격이 유리하다"를 추상적으로 이해했습니다. 이번 챕터는 구체적입니다 —
          왜 <b>하필 SolarWinds Orion</b>이 공격자에게 역사적 수준의 타겟이었는지, 제품 구조를 뜯어보면서 알아봅시다.
          마지막에는 공격자가 실제로 다룬 DGA 알고리즘을 <b>당신 손으로 직접 돌려 볼</b> 샌드박스가 있습니다.
        </C.P>

        <C.H3 icon="📦" isDark={isDark}>SolarWinds Orion이 하는 일</C.H3>

        <C.P isDark={isDark}>
          Orion은 기업 네트워크를 감시하는 <C.KeyTerm term="NMS" definition="Network Management System. 회사 내부의 서버·라우터·스위치·장비들을 실시간으로 모니터링해 어디가 다운됐는지, 트래픽이 비정상인지를 관리자에게 알려주는 도구." isDark={isDark} /> 도구입니다.
          시스템 관리자가 한 화면에서 회사 전체 IT 인프라의 상태를 보는 중앙 통제실이에요.
          기능은 단순하지만 <b>권한</b>이 치명적입니다.
        </C.P>

        <C.Metaphor icon="🏢" title="Orion을 건물 관리 시스템에 비유하면" isDark={isDark}>
          Orion = 대형 빌딩의 중앙 관제실. 모든 층의 CCTV, 방문자 출입 기록, 전기·수도 계량기, 엘리베이터 제어판이 한 방에 모여 있는 곳.
          이 방을 장악한 사람은 CCTV를 꺼서 자기 이동을 지우고, 엘리베이터를 특정 층에 멈추게 하고, 모든 방의 출입 기록을 읽을 수 있습니다.
          <b>건물 자체를 해킹한 게 아니라, 건물을 감시하는 시스템을 해킹한 것</b>이 Orion 공격의 본질이에요.
        </C.Metaphor>

        <C.H3 icon="🔑" isDark={isDark}>Orion이 가진 3가지 위험한 특권</C.H3>

        <C.StepByStep
          isDark={isDark}
          items={[
            {
              title: '특권 1. 도메인 관리자(Domain Admin) 수준 권한',
              body:
                'Orion은 네트워크 전 장비를 스캔해야 하므로, 설치 시 기업 Active Directory의 고권한 서비스 계정을 요구합니다. 많은 기업이 편의를 위해 그냥 Domain Admin 계정으로 설치했어요. 즉 Orion을 장악 = Domain Admin을 장악 = 회사 AD 전체 장악.',
              code:
                '# Orion 설치 권한 예시\n사용 계정: CORP\\SolarWindsSvc\n실제 권한: Domain Admin + Schema Admin\n→ 이 계정 훔치면 Kerberos 티켓 위조 가능',
            },
            {
              title: '특권 2. 방화벽 아웃바운드 허용 목록(egress allowlist)',
              body:
                'Orion은 SolarWinds 클라우드와 업데이트·라이선스 확인 통신을 합니다. 따라서 거의 모든 고객사가 Orion 서버의 아웃바운드 트래픽을 방화벽에서 허용해 둡니다. 이건 SUNBURST가 C2 통신을 "정상처럼" 내보낼 수 있는 완벽한 조건이에요.',
              code:
                '# 고객사 방화벽 규칙(일반적)\nALLOW orion-server → *.solarwinds.com  (443/TCP)\nALLOW orion-server → downloads.solarwinds.com\n# SUNBURST가 추가한 도메인도 이 규칙으로 빠져나감\n# → avsvmcloud.com 이 solarwinds.com 인 척 위장',
            },
            {
              title: '특권 3. 매월 자동 업데이트',
              body:
                'Orion은 기본값으로 자동 업데이트가 켜져 있고, 고객사 IT팀은 패치를 빠르게 적용하는 걸 "보안 모범 사례"로 여깁니다. 즉 SolarWinds가 릴리스한 업데이트는 며칠 안에 고객사 서버에 자동 설치됩니다. 공격자에게 이건 "자동 확산 파이프라인"이에요.',
            },
          ]}
        />

        <C.CalloutBox tone="danger" icon="⚡" title="세 특권이 결합되면" isDark={isDark}>
          <b>Domain Admin 권한 + 방화벽 통과 + 자동 배포</b> — 이 세 가지가 한 제품에 모이는 경우는 드물어요.
          Orion은 기능상 이 조합이 필수였기 때문에 구조적으로 고위험이었습니다. APT29가 7개월을 투자해도 수익이 남는 이유가 이것.
        </C.CalloutBox>

        <C.H3 icon="🏭" isDark={isDark}>Orion 빌드 파이프라인 — 공격 지점 찾기</C.H3>

        <C.P isDark={isDark}>
          이제 본론입니다. SolarWinds가 Orion을 만들어 고객에게 배포하는 파이프라인이 어떻게 생겼는지 봅시다.
          각 단계에는 공격자가 끼어들 수 있는 "침투 지점"이 있어요.
          아래 다이어그램에서 <b>당신이 APT29라면 어디를 노리겠는지</b> 직접 골라 보세요.
        </C.P>

        <C.Hotspot
          isDark={isDark}
          imgW={600}
          imgH={280}
          question="Orion 빌드 파이프라인에서 공격자가 가장 효율적으로 백도어를 심을 수 있는 지점은?"
          hotspots={[
            {
              x: 12,
              y: 35,
              label: '개발자 노트북',
              correct: false,
              detail:
                '개발자 한 명을 해킹해도 다른 개발자의 커밋이 정상이면 악성 코드가 리뷰·머지 단계에서 걸립니다. 비용 대비 효과 낮음.',
            },
            {
              x: 38,
              y: 35,
              label: 'Git 저장소 (소스코드)',
              correct: false,
              detail:
                '소스코드에 악성 코드를 직접 커밋하면 코드 리뷰와 Git 히스토리에 영구히 남습니다. 내부 감사에서 거의 확실히 발견돼요.',
            },
            {
              x: 64,
              y: 35,
              label: '빌드 서버 (MSBuild 중)',
              correct: true,
              detail:
                '정답. APT29는 빌드 서버의 MSBuild.exe 프로세스를 감염시켜, "빌드가 실행되는 순간에만" 악성 코드를 소스 파일에 주입하고, 빌드가 끝나면 원본을 복구했습니다. Git에는 흔적 없음, 컴파일된 DLL만 감염. SUNBURST 본체 "SUNSPOT" 로더가 이 일을 했어요.',
            },
            {
              x: 88,
              y: 35,
              label: '코드 서명 서버',
              correct: false,
              detail:
                '여기를 털면 모든 서명이 오염되어 내부 QA에서 해시 불일치로 걸립니다. 빌드 단계에서 주입하면 자연스럽게 정식 서명을 받아요.',
            },
          ]}
        >
          <svg viewBox="0 0 600 280" className="w-full" xmlns="http://www.w3.org/2000/svg">
            <g>
              {[
                { x: 10, label: '개발자', icon: '👨‍💻' },
                { x: 160, label: 'Git 저장소', icon: '📦' },
                { x: 310, label: '빌드 서버', icon: '🏭' },
                { x: 460, label: '서명 서버', icon: '🔏' },
              ].map((s, i) => (
                <g key={i}>
                  <rect x={s.x} y={60} width={130} height={70} rx={8}
                    fill={isDark ? '#1a1a2a' : '#f0f9ff'}
                    stroke={isDark ? '#3a3a5a' : '#bae6fd'} strokeWidth={2} />
                  <text x={s.x + 65} y={90} fontSize="24" textAnchor="middle">{s.icon}</text>
                  <text x={s.x + 65} y={115} fontSize="12" fontWeight="bold"
                    fill={isDark ? '#ddd' : '#0c4a6e'} textAnchor="middle">{s.label}</text>
                </g>
              ))}
              {[140, 290, 440].map((x, i) => (
                <path key={i} d={`M ${x} 95 L ${x + 20} 95`}
                  stroke={isDark ? '#555' : '#94a3b8'} strokeWidth={2} markerEnd="url(#arr3)" />
              ))}
              <text x={300} y={180} textAnchor="middle" fontSize="12" fill={isDark ? '#888' : '#666'}>
                ↓ 위의 ? 버튼을 클릭해 보세요
              </text>
              <text x={300} y={235} textAnchor="middle" fontSize="11"
                fill={isDark ? '#aaa' : '#555'} fontStyle="italic">
                고객사 자동 업데이트 → 18,000개 서버 (다음 챕터)
              </text>
            </g>
            <defs>
              <marker id="arr3" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill={isDark ? '#555' : '#94a3b8'} />
              </marker>
            </defs>
          </svg>
        </C.Hotspot>

        <C.H3 icon="🧬" isDark={isDark}>SUNBURST의 해부 — DLL 사이드 로딩 메커니즘</C.H3>

        <C.P isDark={isDark}>
          APT29가 빌드 서버에서 심은 악성 코드는 <b><code>SolarWinds.Orion.Core.BusinessLayer.dll</code></b>이라는 정식 컴포넌트에 주입됐습니다.
          이 DLL은 Orion이 <b>정상 실행 과정에서 반드시 로드하는</b> 파일이에요. 즉 Orion이 켜지면 자동으로 SUNBURST도 메모리에 올라갑니다.
          이 기법의 MITRE 이름은 <C.KeyTerm term="T1574.002" definition="DLL Side-Loading. 정상 프로그램이 특정 이름의 DLL을 찾을 때, 그 이름으로 악성 DLL을 대신 로드시키는 기법. MITRE ATT&CK 분류 T1574.002." isDark={isDark} />입니다.
        </C.P>

        <C.CodeBlock filename="SolarWinds.Orion.Core.BusinessLayer.dll — 감염된 메서드" lang="csharp" isDark={isDark} annotate="실제 SUNBURST 코드 단순화. InvokeInitialize()는 정상 Orion 기능처럼 보이지만, 내부에서 OrionImprovementBusinessLayer를 호출해 C2 콜백을 시작합니다.">
{`namespace SolarWinds.Orion.Core.BusinessLayer
{
    public class InventoryManager
    {
        public void RefreshInternal()
        {
            // ↓ APT29가 주입한 정확히 1개 메서드 호출
            OrionImprovementBusinessLayer.Initialize();

            // ↓ 정상 Orion 로직 (원본 그대로)
            this.RefreshInventoryFromDb();
        }
    }

    // ↓ 주입된 네임스페이스 — 이름이 "개선 레이어"처럼 위장
    internal class OrionImprovementBusinessLayer
    {
        public static void Initialize()
        {
            // 14일 수면 체크
            if (!SleepCheckPassed()) return;

            // 샌드박스/백신 회피 체크
            if (IsAnalystEnvironment()) return;

            // 도메인 생성 (DGA) → C2 콜백
            var c2 = GenerateC2Domain();  // ← 다음 샌드박스에서 직접 돌려봄
            SendBeacon(c2);
        }
    }
}`}
        </C.CodeBlock>

        <C.CalloutBox tone="warn" icon="🎓" title="펜테스터가 여기서 배울 점" isDark={isDark}>
          잘 설계된 백도어는 "눈에 띄지 않게 끼어드는" 것이 아니라 "원래 있어야 할 것처럼 생긴다"입니다.
          <code>OrionImprovementBusinessLayer</code>라는 네임스페이스 이름은 SolarWinds의 실제 개발 관행과 완벽히 일치해요.
          코드 리뷰어가 봐도 "아 품질 개선 관련 레이어구나" 하고 넘어가게 만든 <b>명명 심리학(naming psychology)</b>의 교과서적 예시입니다.
        </C.CalloutBox>

        <C.H3 icon="🎮" isDark={isDark}>공격자 샌드박스 맛보기 — DGA 도메인 생성</C.H3>

        <C.P isDark={isDark}>
          이제 당신이 직접 공격자의 도구를 돌려 볼 차례입니다. 위 코드의 <code>GenerateC2Domain()</code>이 실제로 뭘 하는지 아래에서 확인해 보세요.
          "어떤 타겟 컴퓨터 이름을 넣든, 매번 다르게 생긴 도메인이 나오는 이유"를 체감하는 게 이 샌드박스의 목적입니다.
          (Ch8에서 이 알고리즘의 내부 구조와 실제 FNV-1a 구현을 완전히 해부합니다.)
        </C.P>

        <DgaSandbox isDark={isDark} />

        <C.SocraticQuestion
          isDark={isDark}
          prompt="위 샌드박스에서 같은 회사 이름의 대문자·소문자를 바꿔 넣어 보세요. 예: dc01.bank.com vs DC01.bank.com. 도메인이 어떻게 달라지나요?"
          hint="해시 함수의 특성을 생각해 보세요. 그리고 공격자가 왜 대소문자를 구분하도록 알고리즘을 설계했을까요?"
          answer={
            <span>
              완전히 다른 도메인이 나옵니다. 이유 2가지 — (1) 해시 함수는 1비트 차이도 결과 전체를 바꾸는 "눈사태 효과"가 특징이에요. (2) 대소문자 구분 설계는 의도적이에요. 실제 컴퓨터 이름은 Windows에서 대소문자를 무시하지만, 공격자는 <b>"감염된 컴퓨터의 정확한 해시"</b>가 필요합니다 — 왜냐면 각 컴퓨터마다 고유한 C2 대화를 해야 피해자가 서로의 감염 사실을 공유해도 IoC가 쓸모없어지기 때문이죠. 같은 회사 안 10대가 감염돼도 10개 전혀 다른 도메인과 통신합니다.
            </span>
          }
        />

        <C.H3 icon="📋" isDark={isDark}>이 챕터에서 기억할 "공격자 체크리스트"</C.H3>

        <C.CalloutBox tone="success" icon="✅" isDark={isDark}>
          펜테스터가 공급망 공격 타겟을 평가할 때 Orion이 가진 특성을 체크리스트로 만들어 보세요 —
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>☑ 고객사에 <b>관리자 권한</b>으로 설치되는가?</li>
            <li>☑ <b>자동 업데이트</b>가 기본 켜져 있는가?</li>
            <li>☑ 고객 방화벽이 벤더 도메인에 <b>아웃바운드 허용</b>을 걸어두는가?</li>
            <li>☑ 제품 내부에 <b>많은 DLL·네임스페이스</b>가 있어 새 컴포넌트를 위장하기 쉬운가?</li>
            <li>☑ 빌드 파이프라인이 <b>단일 서버</b>에서 돌아가는가(분리·서명 격리가 없는가)?</li>
          </ul>
          다섯 개 모두 "예"라면 그 제품은 2025년에도 SUNBURST급 타겟입니다. Orion은 다섯 개 모두 "예"였어요.
        </C.CalloutBox>

        <C.MiniQuiz
          isDark={isDark}
          title="Ch3 체크포인트"
          questions={[
            {
              q: 'Orion이 공격자에게 "완벽한 타겟"이었던 주된 이유는?',
              choices: [
                { id: 'A', label: '코드가 나빴다' },
                { id: 'B', label: 'Domain Admin 권한 + 자동 업데이트 + 방화벽 허용의 조합' },
                { id: 'C', label: 'SolarWinds가 작은 회사였다' },
                { id: 'D', label: '제로데이 취약점이 있었다' },
              ],
              correctId: 'B',
              explain:
                '세 특권이 한 제품에 모여서 구조적으로 자동 확산이 가능했어요. 제로데이나 코드 품질 문제가 아니라 "의도된 기능"이 모두 무기가 됐습니다.',
            },
            {
              q: 'APT29가 선택한 침투 지점은 빌드 파이프라인 중 어디였나?',
              choices: [
                { id: 'A', label: '개발자 노트북' },
                { id: 'B', label: 'Git 저장소' },
                { id: 'C', label: '빌드 서버 (MSBuild 실행 중)' },
                { id: 'D', label: '고객사 Orion 서버' },
              ],
              correctId: 'C',
              explain:
                'MSBuild가 소스를 컴파일하는 "순간에만" 악성 코드를 주입하고 즉시 원본 복구. 소스·Git·서명 어디에도 흔적을 남기지 않음.',
            },
            {
              q: 'T1574.002 (DLL Side-Loading)의 핵심 아이디어는?',
              choices: [
                { id: 'A', label: '정상 프로그램이 로드해야 할 DLL 위치를 악성 DLL로 대체' },
                { id: 'B', label: 'DLL을 네트워크로 전송' },
                { id: 'C', label: 'DLL 파일 크기를 줄임' },
                { id: 'D', label: 'DLL을 암호화함' },
              ],
              correctId: 'A',
              explain:
                '정상 프로그램의 로딩 경로를 악용해 악성 코드를 "정식 실행 흐름 안에서" 구동시키는 기법. SUNBURST의 핵심 실행 메커니즘이었습니다.',
            },
            {
              q: 'DGA 샌드박스에서 같은 컴퓨터 이름도 대소문자가 다르면 전혀 다른 도메인이 나오는 이유는?',
              choices: [
                { id: 'A', label: '버그' },
                { id: 'B', label: '해시 함수의 눈사태 효과 + 공격자가 의도적으로 설계한 고유 식별' },
                { id: 'C', label: '무작위' },
                { id: 'D', label: '시간에 따라 변해서' },
              ],
              correctId: 'B',
              explain:
                '공격자는 감염된 기기마다 "고유한 도메인"이 나오길 원합니다. 방어자가 IoC로 한 도메인을 차단해도 옆 컴퓨터는 다른 도메인을 쓰니까 블랙리스트가 무력화돼요.',
            },
          ]}
        />
      </>
    ),
  },

  // ─── Ch4. 빌드 서버 정찰 (SKELETON) ───────────────────────────
  {
    id: 'ch4-build-recon',
    num: 4,
    title: '빌드 서버 정찰 — 7개월의 잠복',
    estMin: 20,
    ready: false,
    bullets: [
      'TEARDROP 이전 단계: SolarWinds 내부 네트워크 침투 후 빌드 서버까지 도달한 경로',
      'CI/CD 파이프라인 구조 매핑 (MSBuild, Jenkins, TeamCity 중 어떤 스택인지 공격자 관점 분석)',
      '실습: 가상 Orion 빌드 서버 환경에서 MSBuild.exe 프로세스를 찾고 인젝션 지점 식별',
      '왜 7개월이나 걸렸는가 — "빌드가 언제, 어떤 계정으로, 어떤 파라미터로 실행되는지"를 관찰',
    ],
  },

  // ─── Ch5. SUNBURST DLL 주입 (SKELETON) ────────────────────────
  {
    id: 'ch5-sunburst-injection',
    num: 5,
    title: 'SUNSPOT — 빌드 순간의 정밀 주입',
    estMin: 25,
    ready: false,
    bullets: [
      'SUNSPOT 로더 상세 해부 (MSBuild.exe DLL 인젝션, 소스 파일 원자적 치환)',
      'CSPROJ → 컴파일 → DLL 생성 시점에만 활동하고 그 외엔 은닉',
      '실습: 샌드박스에서 "정상 InventoryManager.cs"를 "감염 버전"으로 치환하는 C# 시뮬레이션',
      'Git 히스토리·체크섬 우회 메커니즘',
    ],
  },

  // ─── Ch6. 코드 서명 & 배포 (SKELETON) ──────────────────────────
  {
    id: 'ch6-sign-distribute',
    num: 6,
    title: '정식 서명 획득 → 18,000개 자동 배포',
    estMin: 15,
    ready: false,
    bullets: [
      '감염된 DLL이 어떻게 SolarWinds 정식 코드서명을 자연스럽게 받았는지',
      'Authenticode 서명 메커니즘과 체인 검증',
      '릴리스 노트: Orion 2019.4 HF 5 → 2020.2.1 HF 1 — 감염된 구체 버전 범위',
      '자동 업데이트 서버의 구조, 그리고 왜 HTTPS만으로는 공급망 공격을 막을 수 없는가',
    ],
  },

  // ─── Ch7. 14일 잠복 & 샌드박스 회피 (SKELETON) ─────────────────
  {
    id: 'ch7-dormancy',
    num: 7,
    title: '14일 수면 + 분석 환경 회피',
    estMin: 20,
    ready: false,
    bullets: [
      '왜 14일인가 — SolarWinds 평균 QA 주기 + 보안 분석가 집중 시간',
      '프로세스·서비스 블랙리스트 (백신 70종, Wireshark, Sysinternals 등 디컴파일 대비 이름 해시)',
      '도메인 가입 여부 체크 → 개인 PC/분석 랩 제외',
      '실습: "내가 분석가다" 체크를 회피하는 정찰 스크립트 작성 (가상 환경)',
    ],
  },

  // ─── Ch8. DGA C2 통신 (SKELETON) ──────────────────────────────
  {
    id: 'ch8-dga-c2',
    num: 8,
    title: 'avsvmcloud.com — DGA의 완전 해부',
    estMin: 25,
    ready: false,
    bullets: [
      'Ch3에서 맛본 DGA의 실제 알고리즘(FNV-1a XOR + custom base32) 전체 구현',
      'HTTP 헤더에 감염 정보를 숨기는 커스텀 인코딩 (User-Agent, Cookie 분할)',
      '실습: DGA 샌드박스 고급 모드 — 실제 도메인 6개를 순서대로 생성해 검증',
      'C2 응답 디코딩: DNS CNAME 레코드에 숨긴 IP 주소',
    ],
  },

  // ─── Ch9. 2차 페이로드 TEARDROP (SKELETON) ────────────────────
  {
    id: 'ch9-teardrop',
    num: 9,
    title: 'TEARDROP · RAINDROP — 고가치 타겟만의 진짜 작전',
    estMin: 25,
    ready: false,
    bullets: [
      '~100개 정밀 타겟에만 배포된 2차 페이로드의 정체 (Cobalt Strike 커스텀 비콘)',
      'JPEG 파일 안에 암호화된 셸코드 — 스테가노그래피 실전 분석',
      '실습: 샌드박스에서 정상 JPEG와 TEARDROP JPEG의 구조 차이 식별',
      'Golden SAML — Kerberos 토큰 위조로 클라우드(M365) 권한 탈취 (재무부 이메일 시나리오)',
    ],
  },

  // ─── Ch10. 지속성 + 종합 평가 (SKELETON) ───────────────────────
  {
    id: 'ch10-persistence-final',
    num: 10,
    title: '지속성 확립 + 전체 작전 회고',
    estMin: 20,
    ready: false,
    bullets: [
      '탐지 이후에도 남은 "잠자는 감염" — 왜 복구가 어려웠는가',
      '클라우드 권한 토큰 장기 보유 + 서비스 계정 분산',
      '9개월 침투 전 과정 종합 시각화 타임라인',
      '종합 실습: 가상 기업 환경에서 Ch1~9 공격 체인을 레드팀 관점에서 재구성',
      '최종 평가 20문제 + 수료증 발급',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// 종합 체크포인트 (Ch1-3 톤 승인용 축소판, 전체 오픈 시 20문제로 확장)
// ═══════════════════════════════════════════════════════════════════

export const FINAL_QUIZ = [
  {
    q: 'SUNBURST 작전 전체에서 "공급망 공격 모델"이 주는 가장 근본적인 이점은?',
    choices: [
      { id: 'A', label: '공격 속도가 빠르다' },
      { id: 'B', label: '피해자의 기존 신뢰·서명·허용 목록이 모두 공격자의 자산이 된다' },
      { id: 'C', label: '제로데이가 필요 없다' },
      { id: 'D', label: 'C2 통신이 빠르다' },
    ],
    correctId: 'B',
    explain:
      '방어 인프라(서명 검증, 벤더 허용 목록, 자동 업데이트)가 공격자의 전파 수단으로 뒤집힙니다. Zero Trust 아키텍처가 이 문제의 해답이었죠.',
  },
  {
    q: 'APT29가 SolarWinds 침투 후 실제 Orion 빌드 오염까지 7개월을 기다린 주된 이유는?',
    choices: [
      { id: 'A', label: '기술적 어려움' },
      { id: 'B', label: '빌드 파이프라인의 정확한 실행 시점·계정·파라미터 관찰이 필요' },
      { id: 'C', label: '돈 부족' },
      { id: 'D', label: '휴가' },
    ],
    correctId: 'B',
    explain:
      'SUNSPOT이 MSBuild 실행 "순간"에만 정확히 주입하려면 언제·어떤 계정·어떤 빌드 구성이 돌아가는지 완벽히 알아야 했어요. 정찰은 공격 성공의 90%.',
  },
  {
    q: '18,000개 감염 중 2차 페이로드를 받은 기관이 ~100개뿐이었던 설계 의도는?',
    choices: [
      { id: 'A', label: '버그' },
      { id: 'B', label: '탐지 지연을 위한 소음 차폐 + 고가치 타겟 집중' },
      { id: 'C', label: '기술 한계' },
      { id: 'D', label: '랜덤' },
    ],
    correctId: 'B',
    explain:
      '대부분 감염은 "우리 회사도 감염됐네?"에서 분석을 멈추게 하는 희석 효과를 내는 데 활용됐습니다.',
  },
  {
    q: 'DLL Side-Loading(T1574.002)의 핵심 원리는?',
    choices: [
      { id: 'A', label: 'DLL을 암호화' },
      { id: 'B', label: '정상 프로그램의 DLL 로딩 경로를 악용해 악성 DLL을 "정식 실행 맥락 안"에서 실행' },
      { id: 'C', label: 'DLL을 네트워크로 원격 로드' },
      { id: 'D', label: '새 프로세스를 띄운다' },
    ],
    correctId: 'B',
    explain:
      '악성 코드가 자기 프로세스를 만들지 않고 정상 프로세스 안에 "얹혀서" 실행되므로 프로세스 기반 EDR이 탐지하기 어려워요.',
  },
  {
    q: 'Ch3 DGA 샌드박스에서 알 수 있는 DGA의 방어자 관점 문제점은?',
    choices: [
      { id: 'A', label: '도메인마다 다른 인증서 필요' },
      { id: 'B', label: '해시 기반 고유 도메인 → IoC 블랙리스트가 구조적으로 무력화' },
      { id: 'C', label: '느림' },
      { id: 'D', label: '돈이 많이 듦' },
    ],
    correctId: 'B',
    explain:
      '감염 기기마다 다른 도메인으로 통신하므로 한 도메인 차단 = 한 기기만 차단. 알고리즘 자체를 역분석하고 예측 생성해야 비로소 전부 차단 가능합니다.',
  },
];

// ═══════════════════════════════════════════════════════════════════
// 용어 사전
// ═══════════════════════════════════════════════════════════════════

export const GLOSSARY = [
  { term: 'APT29 / Cozy Bear', def: '러시아 SVR(해외정보국) 소속 사이버 그룹. 2014년부터 장기 정보 수집 작전으로 유명. APT28(GRU)과 별개 조직.' },
  { term: 'SVR', def: '러시아 해외정보국. 구 KGB 해외 부문이 1991년 분리된 조직. 한국의 국정원, 미국의 CIA에 해당.' },
  { term: 'TTP', def: 'Tactics, Techniques, Procedures. 공격자가 "어떻게" 움직이는지를 세 단계 추상도로 분석하는 틀. MITRE ATT&CK 프레임워크의 기초.' },
  { term: 'Living off the Land (LotL)', def: '시스템에 이미 있는 정상 도구(PowerShell, WMI, 관리 도구)로만 공격하는 전략. 새 멀웨어 배포가 없어 시그니처 기반 탐지를 완전히 우회.' },
  { term: 'SolarWinds Orion', def: '기업 네트워크 감시 도구(NMS). 관리자 권한으로 설치되며 자동 업데이트가 기본. 세계 33,000개 기관 사용.' },
  { term: 'NMS', def: 'Network Management System. 네트워크 장비의 가용성·성능·구성을 중앙에서 모니터링하는 시스템.' },
  { term: 'SUNBURST', def: 'Orion DLL에 주입된 백도어 멀웨어. 14일 잠복 후 DGA로 C2 통신. MITRE: S0559.' },
  { term: 'SUNSPOT', def: 'SolarWinds 빌드 서버에 설치된 로더. MSBuild 실행 순간 소스 파일을 감염 버전으로 치환하고 빌드 후 원본 복구.' },
  { term: 'TEARDROP / RAINDROP', def: '2차 페이로드 — Cobalt Strike 비콘 로더. ~100개 고가치 타겟에만 선별 배포.' },
  { term: 'DGA', def: 'Domain Generation Algorithm. 감염 기기마다 고유한 C2 도메인을 알고리즘적으로 생성. 블랙리스트 기반 차단을 무력화. MITRE: T1568.002.' },
  { term: 'avsvmcloud.com', def: 'SUNBURST C2 통신의 모도메인. AWS 유사 이름으로 위장 → 방화벽 심사 통과. 2020년 12월 FireEye가 발견.' },
  { term: 'T1574.002 (DLL Side-Loading)', def: '정상 프로그램의 DLL 로딩 경로를 이용해 악성 DLL을 정식 프로세스 맥락 안에서 실행시키는 기법.' },
  { term: 'T1195.002 (Compromise Software Supply Chain)', def: '벤더의 빌드/배포 파이프라인을 침해해 정상 업데이트에 악성 코드를 심는 MITRE 기법.' },
  { term: 'Zero Trust', def: '어떤 네트워크 위치·계정·소프트웨어도 기본 신뢰하지 않고 매 요청 검증하는 보안 모델. SolarWinds 이후 미 연방정부 의무화.' },
  { term: 'Authenticode', def: 'Microsoft 코드 서명 표준. SUNBURST DLL은 SolarWinds 정식 인증서로 Authenticode 서명을 받아 Windows가 경고 없이 로드.' },
  { term: 'MSBuild', def: 'Microsoft의 C# 빌드 도구. APT29는 MSBuild.exe 프로세스에 인젝션해 컴파일 순간 악성 코드를 주입.' },
  { term: 'C2 (Command & Control)', def: '감염 기기가 공격자와 명령·응답을 주고받는 서버/채널. SolarWinds에선 DGA 생성 서브도메인.' },
  { term: 'IoC (Indicator of Compromise)', def: '침해를 암시하는 흔적 — 도메인, 해시, IP 등. DGA는 IoC 기반 차단을 구조적으로 무력화.' },
  { term: 'Domain Admin', def: 'Active Directory 전체를 제어하는 고권한 계정. Orion 설치 관행상 이 권한을 쓰는 기업이 많아 침해 시 파급 극대화.' },
  { term: 'Golden SAML', def: '탈취한 서명 키로 위조 SAML 토큰을 만들어 SSO 환경의 클라우드 서비스(M365 등)에 임의 접근하는 기법. Ch9에서 상세.' },
];

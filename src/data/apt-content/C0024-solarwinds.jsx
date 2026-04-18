// C0024 — SolarWinds Compromise 학습 콘텐츠
// 레벨: intermediate (풀 콘텐츠) / 그 외 레벨은 AptStudyPage에서 placeholder 처리
// 구조:
//   layers[]  → 5개 레이어 (추상 개념 → 스토리 → 메커니즘 → 탐지/방어 → 교훈)
//   finalQuiz → 종합 체크포인트 5문제
//   glossary  → 핵심 용어 사전 20개
//
// 각 layer.render(ctx)는 JSX를 반환하며, ctx는 { isDark, components } 이다.

export const LAYERS = [
  {
    id: 'abstract',
    num: 1,
    title: '한 문장으로 이해하기',
    subtitle: '추상 개념 — SolarWinds 공격이 왜 특별한가',
    estimatedMin: 5,
    render: ({ isDark, C }) => (
      <div>
        <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-[#ddd]' : 'text-[#1a1a1a]'}`}>
          SolarWinds 사건은{' '}
          <C.KeyTerm
            term="공급망 공격(Supply Chain Attack)"
            definition="최종 피해자가 아닌, 그들이 신뢰해서 이미 설치·업데이트하는 소프트웨어나 하드웨어 공급자를 먼저 침해해서 광범위한 하위 조직에 동시에 침투하는 방식."
            isDark={isDark}
          />
          {' '}가 국가 인프라급으로 성공할 수 있다는 것을 보여준 대표 사례입니다.
        </p>

        <C.CalloutBox tone="warn" icon="⚡" title="핵심 명제" isDark={isDark}>
          <b>"신뢰 있는 업데이트가 가장 치명적인 백도어가 될 수 있다."</b><br />
          피해 조직은 SolarWinds Orion을 <i>정상적으로 업데이트했을 뿐</i>이다. 방화벽 뚫기, 피싱 클릭,
          자격증명 탈취 그 어느 것도 없었다. 서명된 정식 패치 안에 악성 코드가 들어 있었다.
        </C.CalloutBox>

        <h3 className={`text-sm font-bold mt-5 mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          한눈에 보는 핵심 지표
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
          {[
            { k: '피해 규모', v: '~18,000', u: '조직 감염' },
            { k: '활동 기간', v: '9개월+', u: '공식 침투 기준' },
            { k: '주요 공격자', v: 'APT29', u: 'Cozy Bear / SVR' },
            { k: '최초 탐지', v: 'FireEye', u: '2020.12.08' },
          ].map((m, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 ${
                isDark ? 'bg-[#2d2d2d]' : 'bg-[#fafafa] border border-[#e5e5e5]'
              }`}
            >
              <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-[#888]' : 'text-[#999]'}`}>
                {m.k}
              </div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {m.v}
              </div>
              <div className={`text-[11px] ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>{m.u}</div>
            </div>
          ))}
        </div>

        <C.ExpandableSection
          title="왜 이 사건이 교과서에 실리나"
          tagLabel="심화"
          tagColor="#a855f7"
          defaultOpen={false}
          isDark={isDark}
        >
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <b>신뢰 경계(trust boundary) 재정의</b>: 방어자가 "서명된 MSP 업데이트는 안전하다"고 가정했던
              전제 자체를 무너뜨림.
            </li>
            <li>
              <b>Blast radius</b>: 단일 벤더 침해가 Fortune 500 + 미 연방기관으로 확산될 수 있음을 실증.
            </li>
            <li>
              <b>LOTL 수준</b>: 감염 이후에는 PowerShell, WMI 등 정상 도구만 사용해 IOC 기반 탐지 실패.
            </li>
            <li>
              <b>정책적 여파</b>: 미국 EO 14028(사이버 보안 행정명령)을 직접 촉발.
              SBOM(Software Bill of Materials) 의무화의 배경.
            </li>
          </ul>
        </C.ExpandableSection>

        <C.CaseStudyPrompt
          scenario="당신은 2020년 10월, 중견 금융사의 SOC 리드다. Orion 대시보드가 조용히 월 1회 업데이트 패치를 가져오고 있다. 지난 3개월 간 Orion 관련 알람은 0건이고, IDS도 조용하다."
          question="이 시점에 SolarWinds 공급망 공격이 진행 중일 가능성을 탐지할 수 있는 가장 현실적인 방법은?"
          choices={[
            {
              id: 'A',
              label: 'Orion 서버의 전체 로그를 CVE 기반으로 스캔한다',
              correct: false,
              feedback:
                '서명된 정식 업데이트라 알려진 CVE가 없음. 이 시점 IOC는 세상에 존재하지 않았다. 0-day 단계의 공급망 공격은 시그니처 스캔으로 잡히지 않는다.',
            },
            {
              id: 'B',
              label: 'Orion 서버가 외부로 새로 맺은 도메인·IP 연결을 baseline 대비 비교한다',
              correct: true,
              feedback:
                '정답. 실제로 FireEye도 "관리 도구가 평소에 안 쓰던 외부 도메인과 통신"이라는 이상 행위에서 출발했다. 시그니처가 없을 때는 행위 baseline 편차가 거의 유일한 단서다.',
            },
            {
              id: 'C',
              label: 'AV 정의 업데이트를 하루 2회로 늘린다',
              correct: false,
              feedback:
                '한계가 분명한 조치. 0-day 백도어는 AV 정의에 들어갈 수 없다. 심리적 안정감만 줄 뿐이다.',
            },
            {
              id: 'D',
              label: '사용자들에게 피싱 훈련을 강화한다',
              correct: false,
              feedback:
                '이 공격의 본질과 거리가 멀다. SolarWinds는 사용자 행동이 원인이 아니었다. 훈련은 별개 과제다.',
            },
          ]}
          reveal="실제 FireEye가 최초 탐지한 것은 '한 직원이 2FA 토큰을 새 기기에 등록하려 했다'는 내부 알람이었다. 즉 주변부 행위 감지(비ATL 도메인 생성, 비정상 토큰 등록) 하나가 전체를 붕괴시킨다."
          isDark={isDark}
        />
      </div>
    ),
  },

  {
    id: 'story',
    num: 2,
    title: '9개월의 타임라인',
    subtitle: '스토리 — 침투에서 폭로까지',
    estimatedMin: 8,
    render: ({ isDark, C }) => (
      <div>
        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-[#ddd]' : 'text-[#1a1a1a]'}`}>
          시간 순서대로 보면 이 공격의 핵심은 "<b>천천히, 조용히</b>"다. 최초 침투에서 공개 폭로까지 9개월 이상
          방어 레이더 아래에 머물렀다. 각 단계가 왜 그 시점에 일어났는지 의도를 읽어 보자.
        </p>

        <C.Timeline
          isDark={isDark}
          steps={[
            {
              time: '2019.09',
              title: 'SolarWinds 빌드 서버 최초 침투',
              detail:
                '공격자는 개발 네트워크에 접근해 Orion의 빌드 파이프라인을 정찰한다. 이 시점에는 악성 코드를 심지 않는다. 오직 정찰과 지속성 확보만.',
              tone: 'warn',
            },
            {
              time: '2020.02',
              title: 'TEARDROP/SUNBURST 테스트 주입',
              detail:
                'Orion 소스에 먼저 "무해한" 코드 조각을 넣어, 빌드 파이프라인이 이를 거르지 않는지 실험한다. 성공 확인 후 악성 페이로드 주입 단계로 진행.',
              tone: 'warn',
            },
            {
              time: '2020.03',
              title: 'SUNBURST 악성 DLL 정식 서명',
              detail:
                'SolarWinds가 자체 인증서로 서명한 Orion Platform 업데이트(2019.4 HF5 / 2020.2 HF1)에 SUNBURST가 포함되어 배포됨. 18,000여 조직이 설치.',
              tone: 'danger',
            },
            {
              time: '2020.03~06',
              title: '12~14일 잠복 후 선택적 활성화',
              detail:
                '백도어는 설치 직후가 아니라 12~14일 뒤에 깨어나, 자체 도메인 생성 알고리즘(DGA)으로 C2에 신호를 보낸다. 공격자는 수천 피해 중 "관심 대상"만 선별해 2차 페이로드(TEARDROP, RAINDROP) 투하.',
              tone: 'danger',
            },
            {
              time: '2020.12.08',
              title: 'FireEye 내부 탐지',
              detail:
                '한 FireEye 엔지니어가 낯선 기기에 2FA 등록을 시도한 알람을 보고 내부 조사 착수 → Red Team 도구 탈취 및 SolarWinds 백도어 최초 발견.',
              tone: 'info',
            },
            {
              time: '2020.12.13',
              title: '공개 폭로',
              detail:
                'SolarWinds가 SEC에 공시, SUNBURST 명명. CISA는 긴급 명령 21-01 발령, 미 연방기관에 Orion 즉시 격리 지시.',
              tone: 'success',
            },
          ]}
        />

        <C.CalloutBox tone="info" icon="🧭" title="타임라인이 말해주는 것" isDark={isDark}>
          <ul className="list-disc pl-5 space-y-1">
            <li>"최초 침투 → 악성 배포"까지 약 <b>6개월</b>의 침묵 기간이 있다. 서두르지 않은 공격.</li>
            <li>배포 후 <b>12~14일 잠복</b>은 자동 샌드박스 분석을 회피하기 위한 의도적 설계다.</li>
            <li>탐지는 피해 조직이 아닌 <b>보안 회사(FireEye)</b>에서 나왔다. 엔드포인트 혼자서는 못 잡았다.</li>
          </ul>
        </C.CalloutBox>

        <C.ExpandableSection
          title="SUNBURST의 활성화 조건들 (심화)"
          tagLabel="심화"
          tagColor="#a855f7"
          isDark={isDark}
        >
          <p className="mb-2">공격자는 다음 조건이 모두 충족될 때만 2차 페이로드를 내려보냈다:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>설치 후 12~14일 이상 경과</li>
            <li>호스트 이름이 분석용 샌드박스 패턴이 아닐 것 (예: <code>*-test</code>, <code>sandbox-*</code> 제외)</li>
            <li>도메인이 공격자 관심 목록(정부·보안업체·엔터프라이즈)과 일치</li>
            <li>AV/EDR 프로세스가 프리셋 목록에 없을 것</li>
          </ul>
          <p className="mt-2 text-xs italic">
            이 네 조건을 모두 통과해야만 실제 공격이 개시된다. 그래서 감염 18,000개 중
            실제 "표적" 공격이 진행된 곳은 약 <b>100곳</b>으로 추정된다.
          </p>
        </C.ExpandableSection>

        <C.SocraticQuestion
          prompt="만약 이 공격이 12~14일 잠복 없이 설치 직후 즉시 활성화됐다면, 탐지되는 데 얼마나 걸렸을까?"
          hint="자동 샌드박스는 보통 몇 분~몇 시간 안에 이상 행위를 관찰한다."
          answer="높은 확률로 수일 내 탐지됐을 것이다. 상용 샌드박스·EDR이 '설치 직후 외부 도메인 생성 + 베이스64 인코딩 비콘'을 이상 행위로 플래그했을 가능성이 크다. 12~14일 잠복은 단순히 '천천히'가 아니라, 자동 분석기의 관측 창(window)을 벗어나기 위한 계산된 설계다."
          isDark={isDark}
        />
      </div>
    ),
  },

  {
    id: 'mechanism',
    num: 3,
    title: '공격이 작동하는 방식',
    subtitle: '메커니즘 — SUNBURST 내부 구조와 TTP',
    estimatedMin: 10,
    render: ({ isDark, C }) => (
      <div>
        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-[#ddd]' : 'text-[#1a1a1a]'}`}>
          메커니즘 레이어는 "이걸 내가 탐지 규칙을 짠다면 뭘 봐야 하나"의 관점에서 내부를 들여다본다. 세 가지
          핵심 기법을 중심으로 정리한다.
        </p>

        {/* 기법 3종 테이블 */}
        <div
          className={`rounded-lg overflow-hidden border my-4 ${
            isDark ? 'border-[#333]' : 'border-[#e5e5e5]'
          }`}
        >
          <table className="w-full text-xs">
            <thead>
              <tr className={isDark ? 'bg-[#2d2d2d] text-[#aaa]' : 'bg-[#f5f5f5] text-[#666]'}>
                <th className="text-left p-2 font-semibold">MITRE ID</th>
                <th className="text-left p-2 font-semibold">기법</th>
                <th className="text-left p-2 font-semibold">이 캠페인에서의 역할</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-[#ddd]' : 'text-[#333]'}>
              <tr className={`border-t ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'}`}>
                <td className="p-2 font-mono text-blue-500">T1195.002</td>
                <td className="p-2 font-bold">Supply Chain Compromise: Software</td>
                <td className="p-2">SolarWinds 빌드 파이프라인 침해 → 정식 서명된 업데이트에 SUNBURST 삽입</td>
              </tr>
              <tr className={`border-t ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'}`}>
                <td className="p-2 font-mono text-blue-500">T1568.002</td>
                <td className="p-2 font-bold">Dynamic Resolution: DGA</td>
                <td className="p-2">
                  피해자 도메인 → 알고리즘으로 C2 서브도메인 생성 → <code>avsvmcloud[.]com</code> 계열
                </td>
              </tr>
              <tr className={`border-t ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'}`}>
                <td className="p-2 font-mono text-blue-500">T1574.002</td>
                <td className="p-2 font-bold">Hijack Execution Flow: DLL Side-Loading</td>
                <td className="p-2">Orion 정상 프로세스 안에서 악성 DLL이 신뢰된 컨텍스트로 실행</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SUNBURST 흐름 */}
        <h3 className={`text-sm font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          SUNBURST 실행 흐름 (5단계)
        </h3>
        <div className={`rounded-lg p-4 font-mono text-xs leading-relaxed ${
          isDark ? 'bg-[#0f0f0f] text-green-400' : 'bg-[#1a1a1a] text-green-400'
        }`}>
          <div>[1] SolarWinds.Orion.Core.BusinessLayer.dll 로드 (서명 유효)</div>
          <div>[2] sleep(12~14 days)  ← 샌드박스 회피</div>
          <div>[3] domain = hashDGA(hostname) + ".avsvmcloud.com"</div>
          <div>[4] HTTP GET {'→'} 도메인 응답으로 "표적 여부" 판단</div>
          <div>[5] if 표적: decrypt(TEARDROP) {'→'} reflective_load() {'→'} Cobalt Strike Beacon</div>
        </div>

        <C.CalloutBox tone="danger" icon="🧬" title="DGA (도메인 생성 알고리즘) 핵심" isDark={isDark}>
          피해자 호스트 이름을 해시 기반 알고리즘에 넣어 <b>사람이 보기엔 랜덤 서브도메인</b>을 만든다.
          공격자는 자기 DNS에 이 알고리즘을 거꾸로 돌려서 "누가 찌르고 있는지"를 식별한다.
          → <i>차단 대상 도메인 하나를 고정하기 어렵다. 매번 바뀐다.</i>
        </C.CalloutBox>

        {/* Case Study - Detection */}
        <C.CaseStudyPrompt
          scenario="당신의 조직 방화벽 로그에 Orion 서버가 이런 DNS를 질의하고 있다: 7kkp3q2rh[.]appsync-api[.]us-east-1[.]avsvmcloud[.]com. 고유 호스트 이름이 계속 바뀌며 1일 2~3회 질의된다."
          question="가장 우선 취해야 할 조치는?"
          choices={[
            {
              id: 'A',
              label: 'Orion 서버를 즉시 네트워크에서 격리하고 포렌식 이미지를 생성한다',
              correct: true,
              feedback:
                '정답. avsvmcloud.com 계열 DGA 패턴은 SUNBURST의 서명적 지표. 메모리 덤프가 필요하므로 전원을 끄지 말고 네트워크 격리 + 메모리/디스크 이미지 확보가 정석이다.',
            },
            {
              id: 'B',
              label: '해당 도메인만 DNS 블랙홀로 차단한다',
              correct: false,
              feedback:
                'DGA이므로 도메인 하나만 차단해도 다음 호출은 다른 서브도메인으로 들어온다. 탐지됐다는 사실만 공격자에게 알려주고 근본 대응은 못 한다.',
            },
            {
              id: 'C',
              label: 'Orion 서비스를 재시작하고 24시간 모니터링한다',
              correct: false,
              feedback:
                '재시작으로 메모리 증거가 날아가고, 서비스가 다시 올라오면 백도어가 동일하게 동작한다. 전형적인 "증거 파괴" 실수.',
            },
            {
              id: 'D',
              label: '사용자 계정 비밀번호를 전체 초기화한다',
              correct: false,
              feedback:
                '공격은 계정 탈취가 아니라 신뢰된 프로세스에서 출발했다. 비밀번호 초기화는 이 시점에 잘못된 에너지 소모.',
            },
          ]}
          reveal="실제 CISA ED 21-01은 '즉시 전원 단절(shut down)'까지 권고했다가 수정됐다. 현장에서는 '격리 + 메모리 이미지 + 포렌식팀 투입' 3단이 지금 표준이다."
          isDark={isDark}
        />

        <C.ExpandableSection
          title="SUNBURST 내부 킬스위치 — 왜 공격자 스스로 넣었나"
          tagLabel="심화"
          tagColor="#a855f7"
          isDark={isDark}
        >
          <p className="mb-2">
            SUNBURST는 피해자 환경이 다음과 일치하면 <b>스스로 종료</b>하도록 설계됐다:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>특정 AV/EDR 프로세스(예: <code>windefend</code>, <code>mssense</code>)가 실행 중일 때</li>
            <li>도메인 이름이 SolarWinds 자체 내부망일 때</li>
            <li>레지스트리에 특정 분석 도구가 설치되어 있을 때</li>
          </ul>
          <p className="mt-3 text-xs italic">
            이것은 <b>정교한 OPSEC</b>이다. "진짜 표적이 아니면 붙잡히지 않도록 조용히 자살한다."
            결과적으로 18,000개 감염 중 실제 2차 공격이 진행된 100여 곳을 제외하고는 아무 일도 안 일어난 것처럼
            보였다. 그래서 탐지가 더 늦어졌다.
          </p>
        </C.ExpandableSection>
      </div>
    ),
  },

  {
    id: 'detection',
    num: 4,
    title: '어떻게 탐지하고 막는가',
    subtitle: '방어 — 탐지 전략과 통제(Control)',
    estimatedMin: 8,
    render: ({ isDark, C }) => (
      <div>
        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-[#ddd]' : 'text-[#1a1a1a]'}`}>
          SolarWinds처럼 <b>시그니처 0, 서명 유효, 정상 프로세스</b>인 공격은 IOC 매칭으로는 못 잡는다.
          "정상에서의 이탈(anomaly)"을 어떻게 정의하느냐가 핵심이다.
        </p>

        {/* 탐지 레이어 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
          {[
            {
              tone: 'info',
              icon: '🌐',
              title: 'DNS / Egress 이상',
              body: '관리 도구(Orion 등)가 평소 연결하지 않던 외부 도메인에 반복 질의. DGA 의심 패턴 (랜덤 서브도메인).',
            },
            {
              tone: 'warn',
              icon: '🪪',
              title: '인증 이상',
              body: '비정상 시간대 관리자 로그인, MFA 등록 기기 급증(FireEye가 최초 발견한 바로 그 신호).',
            },
            {
              tone: 'danger',
              icon: '🧬',
              title: '프로세스 계보 (Parent–Child)',
              body: 'Orion 하위에서 PowerShell, rundll32, 비정상 DLL 로드가 발생. 정상 운영에서는 드문 조합.',
            },
            {
              tone: 'success',
              icon: '🔐',
              title: '공급망 검증',
              body: 'SBOM 확보, 업데이트 해시·서명 자동 검증, 벤더 침해 고지(SEC 8-K) 모니터링.',
            },
          ].map((b, i) => (
            <C.CalloutBox key={i} tone={b.tone} icon={b.icon} title={b.title} isDark={isDark}>
              {b.body}
            </C.CalloutBox>
          ))}
        </div>

        {/* SIEM 규칙 예시 */}
        <h3 className={`text-sm font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          예시 탐지 규칙 (의사코드)
        </h3>
        <div className={`rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto ${
          isDark ? 'bg-[#0f0f0f] text-cyan-300' : 'bg-[#1a1a1a] text-cyan-300'
        }`}>
{`// 1) Orion 프로세스가 외부 DNS에 고유 서브도메인 질의
rule orion_rare_dns_egress:
  source = dns_logs
  where  process_name == "SolarWinds.BusinessLayerHost.exe"
    and  query matches /[a-z0-9]{16,}\\.appsync-api\\.[a-z0-9.-]+\\.[a-z]{2,}/
    and  query not_in baseline_last_30d
  action = alert("SUNBURST DGA candidate")

// 2) Orion이 PowerShell을 자식으로 소환
rule orion_spawn_unusual_child:
  source = edr_process
  where  parent == "SolarWinds*.exe"
    and  child  in  ("powershell.exe","rundll32.exe","cmd.exe")
  action = alert("Unexpected Orion child process")`}
        </div>

        <C.SocraticQuestion
          prompt="위 rule 1의 정규식이 'avsvmcloud.com'을 직접 박지 않는 이유는 무엇일까?"
          hint="이미 알려진 IOC를 쓰는 것과 '알려지지 않은 DGA'까지 잡는 것의 차이."
          answer="특정 도메인을 하드코딩하면 같은 공격자가 인프라를 바꾸는 순간 무력화된다. 'Orion이 평소 안 쓰는 외부 DNS 패턴'이라는 일반화된 행위 조건으로 잡아야 다음 세대 SUNBURST류도 잡힌다. 이게 IOC 중심에서 TTP 중심 탐지로의 전환이다."
          isDark={isDark}
        />

        {/* 통제 프레임워크 매핑 */}
        <h3 className={`text-sm font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          표준 통제 매핑
        </h3>
        <div
          className={`rounded-lg overflow-hidden border ${
            isDark ? 'border-[#333]' : 'border-[#e5e5e5]'
          }`}
        >
          <table className="w-full text-xs">
            <thead>
              <tr className={isDark ? 'bg-[#2d2d2d] text-[#aaa]' : 'bg-[#f5f5f5] text-[#666]'}>
                <th className="text-left p-2 font-semibold">프레임워크</th>
                <th className="text-left p-2 font-semibold">통제</th>
                <th className="text-left p-2 font-semibold">이 사건에 직접 적용</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-[#ddd]' : 'text-[#333]'}>
              <tr className={`border-t ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'}`}>
                <td className="p-2 font-mono">NIST SP 800-161</td>
                <td className="p-2">C-SCRM (공급망 리스크 관리)</td>
                <td className="p-2">벤더 보안 심사, SBOM 요구</td>
              </tr>
              <tr className={`border-t ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'}`}>
                <td className="p-2 font-mono">ISO 27001 A.15</td>
                <td className="p-2">공급자 관계</td>
                <td className="p-2">공급자 보안 계약, 업데이트 수신 검증</td>
              </tr>
              <tr className={`border-t ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'}`}>
                <td className="p-2 font-mono">MITRE D3FEND</td>
                <td className="p-2">Software Bill of Materials</td>
                <td className="p-2">구성 파일 해시 기반 무결성 자동 검증</td>
              </tr>
              <tr className={`border-t ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'}`}>
                <td className="p-2 font-mono">CIS v8</td>
                <td className="p-2">15. 서비스 공급자 관리</td>
                <td className="p-2">서비스 제공자 인벤토리, 위험 평가</td>
              </tr>
            </tbody>
          </table>
        </div>

        <C.ExpandableSection
          title="왜 EDR만으로는 부족했나 (심화)"
          tagLabel="심화"
          tagColor="#a855f7"
          isDark={isDark}
        >
          <p className="mb-2">EDR의 기본 전제 3가지가 SolarWinds에서 하나씩 뒤집혔다:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li><b>서명된 바이너리 = 신뢰</b> → 공격자가 서명 체인 자체를 장악.</li>
            <li><b>알려진 악성 프로세스 목록</b> → 악성 코드는 정상 프로세스의 합법 DLL로 로드.</li>
            <li><b>이상 행위 = 머신러닝 베이스라인</b> → 6개월의 잠복으로 "정상 베이스라인"에 공격자 행위가 이미 포함됨.</li>
          </ol>
          <p className="mt-2 text-xs italic">
            EDR은 여전히 핵심이지만, 이 사건 이후 <b>네트워크 이탈점(egress)</b> 관측과 <b>자격증명 흐름</b>이 같이
            엮일 때만 신호가 된다는 점이 명확해졌다. 단일 레이어 방어의 한계.
          </p>
        </C.ExpandableSection>
      </div>
    ),
  },

  {
    id: 'lessons',
    num: 5,
    title: '무엇을 배울 것인가',
    subtitle: '교훈 — 조직·개인 차원의 행동 원칙',
    estimatedMin: 5,
    render: ({ isDark, C }) => (
      <div>
        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-[#ddd]' : 'text-[#1a1a1a]'}`}>
          기술적 세부를 외우는 것보다, 이 사건이 바꾼 <b>사고방식 세 가지</b>를 체화하는 것이 더 오래 간다.
        </p>

        {/* 핵심 교훈 3개 */}
        <div className="space-y-3 my-4">
          {[
            {
              n: 1,
              title: '"신뢰된 업데이트"는 더 이상 공리가 아니다',
              body:
                '업데이트 채널 자체를 공격면으로 본다. 서명 검증은 최소 조건이지 충분 조건이 아니다. SBOM·해시 핀닝·단계적 배포(카나리아)를 업데이트 정책에 명문화.',
              tone: 'danger',
            },
            {
              n: 2,
              title: '탐지는 IOC가 아니라 TTP 기반으로',
              body:
                '0-day 공급망 공격은 알려진 IOC가 없다. "내 환경의 정상이 무엇인가"를 명시적으로 정의하고 이탈을 추적해야 한다. 행위 기반 탐지 + 주요 자산(Crown Jewel)의 egress baseline 확보.',
              tone: 'warn',
            },
            {
              n: 3,
              title: '단일 레이어로 방어하지 않는다',
              body:
                'EDR 하나, SIEM 하나만으로는 부족하다. 엔드포인트 × 네트워크 × 아이덴티티(특히 MFA 이벤트) 3개 축이 교차할 때만 이런 공격의 꼬리가 보인다.',
              tone: 'info',
            },
          ].map(l => (
            <div
              key={l.n}
              className={`rounded-lg p-4 border-l-4 ${
                isDark ? 'bg-[#1a1a1a]' : 'bg-[#fafafa]'
              }`}
              style={{
                borderLeftColor:
                  l.tone === 'danger' ? '#ef4444' : l.tone === 'warn' ? '#f59e0b' : '#3b82f6',
              }}
            >
              <div
                className={`flex items-center gap-2 mb-1 text-sm font-bold ${
                  isDark ? 'text-white' : 'text-[#1a1a1a]'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor:
                      l.tone === 'danger'
                        ? '#ef4444'
                        : l.tone === 'warn'
                        ? '#f59e0b'
                        : '#3b82f6',
                    color: '#fff',
                  }}
                >
                  {l.n}
                </span>
                {l.title}
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#ccc]' : 'text-[#555]'}`}>
                {l.body}
              </p>
            </div>
          ))}
        </div>

        <C.CaseStudyPrompt
          scenario="당신이 내년 보안 예산을 짤 CSO라면, SolarWinds 교훈을 반영해 추가 투자할 수 있는 예산은 1개 항목이다."
          question="가장 효과가 큰 항목은?"
          choices={[
            {
              id: 'A',
              label: 'EDR을 차세대 버전으로 업그레이드',
              correct: false,
              feedback:
                'EDR 혼자로는 이 유형을 못 잡는다는 것이 교훈의 본체. 투자 자체는 나쁘지 않지만 "단일 레이어 신뢰" 실수를 반복한다.',
            },
            {
              id: 'B',
              label: '주요 자산의 Egress(외부 통신) 베이스라인 + 이탈 탐지 파이프라인 구축',
              correct: true,
              feedback:
                '정답. 0-day 공급망 공격에서 가장 일찍 튀는 신호가 "평소 안 쓰던 도메인과의 통신"이다. Crown Jewel을 지정해 egress를 꾸준히 관측하는 것이 ROI가 가장 높다.',
            },
            {
              id: 'C',
              label: '전 직원 피싱 훈련 횟수를 4회 → 12회로 늘린다',
              correct: false,
              feedback:
                '이 사건은 피싱이 출발점이 아니었다. 별도 예산으로 가야 할 항목.',
            },
            {
              id: 'D',
              label: 'AV 정의 업데이트 주기를 단축한다',
              correct: false,
              feedback:
                '0-day에 대한 AV 대응력은 거의 0이다. 주기 단축의 효과는 제한적.',
            },
          ]}
          reveal="실제로 대형 금융사·IT기업들은 이 사건 이후 'Internet-bound Egress Analytics'라는 카테고리로 별도 예산을 배정하기 시작했다."
          isDark={isDark}
        />

        <C.CalloutBox tone="success" icon="🎯" title="개인 실무자 관점 체크리스트" isDark={isDark}>
          <ul className="list-disc pl-5 space-y-1">
            <li>내 조직이 어떤 관리 소프트웨어(Orion급)를 쓰는지 자산 인벤토리가 있는가?</li>
            <li>그 소프트웨어의 <b>egress baseline</b>이 문서화돼 있는가?</li>
            <li>관리자 MFA 등록 이벤트가 SIEM에 들어가는가?</li>
            <li>업데이트 배포 프로세스에 카나리아 단계가 있는가?</li>
            <li>벤더 보안 공시(SEC 8-K) 모니터링 루틴이 있는가?</li>
          </ul>
          <p className="mt-2 text-xs">이 5개 질문에 "예"라고 답할 수 있으면, SolarWinds급 공격의 조기 신호를 잡을 수 있다.</p>
        </C.CalloutBox>
      </div>
    ),
  },
];

// ── 종합 체크포인트 퀴즈 ──
export const FINAL_QUIZ = [
  {
    q: 'SolarWinds 공격이 MITRE ATT&CK에서 가장 대표적으로 분류되는 기법은?',
    choices: [
      { id: 'A', label: 'T1566.001 Spearphishing Attachment' },
      { id: 'B', label: 'T1195.002 Supply Chain Compromise: Software' },
      { id: 'C', label: 'T1110 Brute Force' },
      { id: 'D', label: 'T1078 Valid Accounts' },
    ],
    correctId: 'B',
    explain: 'T1195.002는 정식 소프트웨어 공급망을 침해하는 기법. SolarWinds Orion 빌드 파이프라인 침투가 대표 사례다.',
  },
  {
    q: 'SUNBURST가 설치 직후가 아니라 12~14일 뒤에 활성화된 설계의 목적은?',
    choices: [
      { id: 'A', label: '업데이트 충돌을 피하기 위해' },
      { id: 'B', label: '자동 샌드박스 분석 창(window)을 벗어나기 위해' },
      { id: 'C', label: '네트워크 대역폭을 아끼기 위해' },
      { id: 'D', label: '라이선스 검증 때문' },
    ],
    correctId: 'B',
    explain: '상용 샌드박스/EDR은 보통 분석 대상을 수 분~수 시간 관찰한다. 2주 뒤 활성화는 이 관측 창을 완전히 벗어나게 한다. OPSEC의 대표적 패턴.',
  },
  {
    q: '감염 18,000개 중 실제 2차 공격이 진행된 표적이 약 100개로 추정되는 이유는?',
    choices: [
      { id: 'A', label: '공격자가 피해자 환경을 선별해 페이로드를 추가 배포했기 때문' },
      { id: 'B', label: '감염된 조직 중 대다수가 Orion을 사용하지 않았기 때문' },
      { id: 'C', label: '무작위로 4%의 호스트만 페이로드가 동작했기 때문' },
      { id: 'D', label: 'AV가 96%를 자동 차단했기 때문' },
    ],
    correctId: 'A',
    explain: '공격자는 SUNBURST가 보내온 호스트/도메인 정보를 보고 "관심 대상"에만 TEARDROP/RAINDROP 등을 2차 전달했다. 이것이 DGA 비콘의 본질적 역할 중 하나.',
  },
  {
    q: '"SolarWinds급 공급망 공격"을 조직에서 조기 탐지하기 위한 투자 중 효과가 가장 큰 것은?',
    choices: [
      { id: 'A', label: 'AV 정의 업데이트 주기 단축' },
      { id: 'B', label: '전 직원 피싱 훈련 횟수 2배' },
      { id: 'C', label: '주요 자산 egress baseline + 이탈 탐지 파이프라인' },
      { id: 'D', label: '방화벽 rule 숫자 늘리기' },
    ],
    correctId: 'C',
    explain: '0-day 공급망 공격에서 가장 일찍 튀는 신호는 "Crown Jewel이 평소 안 쓰던 외부 도메인과 통신". baseline과 이탈 탐지가 ROI 가장 높다.',
  },
  {
    q: 'SolarWinds 사건 이후 미국 정책에 직접 반영된 대표 산출물은?',
    choices: [
      { id: 'A', label: 'GDPR' },
      { id: 'B', label: 'EO 14028 + SBOM(Software Bill of Materials) 의무화' },
      { id: 'C', label: 'PCI DSS v4.0' },
      { id: 'D', label: 'SOC 2 Type II' },
    ],
    correctId: 'B',
    explain: 'EO 14028(2021.5)은 SolarWinds 이후 연방기관 공급망 보안을 강화한 대통령 행정명령. SBOM 의무화가 대표 조치다.',
  },
];

// ── 용어 사전 (20개) ──
export const GLOSSARY = [
  { term: 'SUNBURST', def: 'SolarWinds Orion에 삽입됐던 SolarWinds.Orion.Core.BusinessLayer.dll 내부의 백도어 이름.' },
  { term: 'SolarWinds Orion', def: 'IT 인프라 모니터링 플랫폼. 2020년 시점 대기업·미 연방기관이 광범위하게 사용.' },
  { term: 'APT29', def: 'Cozy Bear, NOBELIUM 등으로 불리는 러시아 SVR 연계 국가지원 공격그룹.' },
  { term: 'Supply Chain Attack', def: '최종 피해자가 아닌 신뢰된 공급자(소프트웨어/하드웨어)를 먼저 침해해 하위로 확산시키는 공격 전략.' },
  { term: 'SBOM', def: 'Software Bill of Materials. 소프트웨어 구성요소(라이브러리 버전 등)를 기계판독 가능 형식으로 문서화한 것.' },
  { term: 'DGA', def: 'Domain Generation Algorithm. 알고리즘으로 C2 도메인을 동적으로 생성해 블랙리스팅을 회피하는 기법.' },
  { term: 'C2 (C&C)', def: 'Command & Control. 공격자가 피해자 시스템에 명령을 내리고 결과를 수신하는 통신 채널.' },
  { term: 'DLL Side-Loading', def: '신뢰된 프로세스가 로드하는 DLL을 가로채서 악성 DLL이 신뢰된 컨텍스트로 실행되게 하는 기법.' },
  { term: 'IOC', def: 'Indicator of Compromise. 침해 발생을 나타내는 흔적 (해시, IP, 도메인 등).' },
  { term: 'TTP', def: 'Tactics, Techniques, and Procedures. IOC보다 상위 레벨로 "공격자의 행동 양식" 자체를 지칭.' },
  { term: 'EDR', def: 'Endpoint Detection and Response. 엔드포인트 수준의 행위 수집·탐지·대응 솔루션.' },
  { term: 'SIEM', def: 'Security Information and Event Management. 여러 원본 로그를 통합 상관분석하는 보안 운영 플랫폼.' },
  { term: 'LOTL', def: 'Living Off The Land. 정상 도구(PowerShell, WMI 등)만 사용해 공격을 수행하는 기법.' },
  { term: 'Sandbox Evasion', def: '자동 분석 환경(샌드박스)에서는 악성 동작을 하지 않고, 실제 피해자 환경에서만 활성화되는 회피 기법.' },
  { term: 'TEARDROP', def: 'SUNBURST가 2차로 내려받은 메모리 전용 로더. Cobalt Strike Beacon을 로드함.' },
  { term: 'RAINDROP', def: 'SUNBURST의 또다른 2차 페이로드. 7z 라이브러리로 위장.' },
  { term: 'Cobalt Strike', def: '본래 레드팀 도구였으나 악용 사례가 많은 공격자용 포스트 익스플로잇 프레임워크.' },
  { term: 'OPSEC', def: 'Operational Security. 공격자가 자신의 정체/기법이 노출되지 않도록 운용 보안을 유지하는 행동.' },
  { term: 'FireEye (Mandiant)', def: 'SolarWinds 최초 탐지 및 공개를 주도한 보안 회사. 현재 구글 Cloud Mandiant.' },
  { term: 'CISA ED 21-01', def: 'CISA가 2020.12.13 발령한 긴급 명령. 미 연방기관에 Orion 즉시 격리 지시.' },
];

// ── 메타 ──
export const META = {
  campaignId: 'C0024',
  title: 'SolarWinds Compromise',
  availableLevels: ['intermediate'], // 프로토타입 MVP: intermediate만 풀콘텐츠
  totalEstimatedMin: 36, // 5+8+10+8+5
};

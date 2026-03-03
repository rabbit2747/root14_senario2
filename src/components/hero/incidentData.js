// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 사고 매트릭스 데이터 + 전술 색상 + 투어 시퀀스
// 8대 사이버 사고 × 5 전술 (가장 대중적 + 최근 핫 이슈)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TACTIC_COLORS = {
  'initial-access': {
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-600',
    light: 'bg-blue-50',
    hex: '#2563eb',
    glowRgb: '59,130,246',
    dark: {
      light: 'bg-blue-950/50',
      border: 'border-blue-400/40',
      text: 'text-blue-400',
      hex: '#60a5fa',
      glowRgb: '96,165,250',
    },
  },
  execution: {
    bg: 'bg-orange-500',
    border: 'border-orange-400',
    text: 'text-orange-500',
    light: 'bg-orange-50',
    hex: '#f97316',
    glowRgb: '249,115,22',
    dark: {
      light: 'bg-orange-950/50',
      border: 'border-orange-400/40',
      text: 'text-orange-400',
      hex: '#fb923c',
      glowRgb: '251,146,60',
    },
  },
  evasion: {
    bg: 'bg-amber-700',
    border: 'border-amber-600',
    text: 'text-amber-700',
    light: 'bg-amber-50',
    hex: '#b45309',
    glowRgb: '180,83,9',
    dark: {
      light: 'bg-amber-950/50',
      border: 'border-amber-400/40',
      text: 'text-amber-400',
      hex: '#fbbf24',
      glowRgb: '251,191,36',
    },
  },
  'credential-access': {
    bg: 'bg-cyan-600',
    border: 'border-cyan-500',
    text: 'text-cyan-600',
    light: 'bg-cyan-50',
    hex: '#0891b2',
    glowRgb: '8,145,178',
    dark: {
      light: 'bg-cyan-950/50',
      border: 'border-cyan-400/40',
      text: 'text-cyan-400',
      hex: '#22d3ee',
      glowRgb: '34,211,238',
    },
  },
  impact: {
    bg: 'bg-red-600',
    border: 'border-red-500',
    text: 'text-red-600',
    light: 'bg-red-50',
    hex: '#dc2626',
    glowRgb: '239,68,68',
    dark: {
      light: 'bg-red-950/50',
      border: 'border-red-400/40',
      text: 'text-red-400',
      hex: '#f87171',
      glowRgb: '248,113,113',
    },
  },
};

export const TACTICS = [
  // ━━━━ 1. Initial Access (초기 접근) ━━━━
  {
    id: 'initial-access',
    title: 'Initial Access',
    titleKo: '초기 접근',
    incidents: [
      {
        id: 'solarwinds-2020',
        name: 'SolarWinds',
        year: 2020,
        technique: 'Supply Chain Compromise',
        techniqueId: 'T1195.002',
        tourOrder: 0,
        icon: 'globe',
        stat: { value: 18000, unit: '+', label: { ko: '감염 조직', en: 'Orgs Compromised' } },
        description: {
          ko: '러시아 APT29(Cozy Bear) 그룹이 SolarWinds Orion IT 모니터링 소프트웨어의 업데이트 과정에 SUNBURST 백도어를 삽입했습니다. 이 악성코드는 정상 디지털 서명이 포함된 업데이트로 위장되어, 미국 재무부·국토안보부·국무부 등 핵심 정부기관과 Microsoft·FireEye·Intel 등 18,000개 이상의 조직에 9개월간 탐지되지 않고 침투했습니다. 역사상 가장 정교한 공급망 공격으로 평가됩니다.',
          en: 'Russian APT29 (Cozy Bear) inserted the SUNBURST backdoor into SolarWinds Orion IT monitoring software updates. Disguised with legitimate digital signatures, it infiltrated 18,000+ organizations including the US Treasury, DHS, State Department, Microsoft, FireEye, and Intel — remaining undetected for 9 months. It is considered the most sophisticated supply chain attack in history.',
          zh: '俄罗斯APT29组织在SolarWinds Orion软件更新中植入SUNBURST后门，伪装成合法数字签名的更新，渗透了美国财政部、国土安全部等18,000多个组织，持续9个月未被发现。被评为史上最精密的供应链攻击。',
          hi: 'रूसी APT29 ने SolarWinds Orion सॉफ़्टवेयर अपडेट में SUNBURST बैकडोर डाला। वैध डिजिटल हस्ताक्षरों से छिपकर, यह 9 महीने तक 18,000+ संगठनों में अनदेखा रहा — जिसमें अमेरिकी ट्रेज़री, DHS, Microsoft और FireEye शामिल हैं।',
          ja: 'ロシアのAPT29がSolarWinds Orionソフトウェア更新にSUNBURSTバックドアを埋め込みました。正規のデジタル署名で偽装し、米財務省・DHS・Microsoft・FireEyeなど18,000以上の組織に9ヶ月間検知されずに侵入しました。史上最も精巧なサプライチェーン攻撃と評価されています。',
        },
        detailedInfo: {
          attackVector: {
            ko: 'Orion 빌드 서버 침투 → SUNBURST 백도어 삽입 → 정상 서명 업데이트로 배포 → C2 통신',
            en: 'Orion build server infiltration → SUNBURST backdoor injection → distribution via signed update → C2 communication',
          },
          affectedOrgs: {
            ko: '미국 재무부, 국토안보부, Microsoft, FireEye, Intel — 18,000+ 조직 감염',
            en: 'US Treasury, DHS, Microsoft, FireEye, Intel — 18,000+ organizations infected',
          },
          severity: 'critical',
          timeline: {
            ko: '2020년 3월~12월 — 9개월간 탐지되지 않은 공급망 공격',
            en: 'March-December 2020 — 9 months of undetected supply chain attack',
          },
          lessonsLearned: {
            ko: '공급망 보안 강화, 제로 트러스트 아키텍처 도입, 소프트웨어 무결성 검증 필수',
            en: 'Supply chain security, zero-trust architecture, software integrity verification',
          },
        },
        videoFile: '/videos/hero/solarwinds-2020.mp4',
        videoCaption: {
          ko: 'SolarWinds 공급망 공격으로 미국 정부기관 포함 18,000개 이상의 조직이 감염되었습니다.',
          en: 'SolarWinds supply chain attack infected 18,000+ organizations including US government agencies.',
        },
      },
      {
        id: 'log4shell-2021',
        name: 'Log4Shell',
        year: 2021,
        technique: 'Exploit Public-Facing App',
        techniqueId: 'T1190',
        tourOrder: 1,
        icon: 'code',
        stat: { value: 93, unit: '%', label: { ko: '취약 클라우드', en: 'Vulnerable Clouds' } },
        description: {
          ko: '2021년 12월 발견된 Apache Log4j 취약점(CVE-2021-44228)은 "역사상 가장 심각한 단일 취약점"으로 불립니다. 단 한 줄의 문자열(${jndi:ldap://...})만으로 원격 코드 실행이 가능했으며, Minecraft부터 Apple iCloud, AWS, Cloudflare, Steam까지 전 세계 수십억 대의 기기가 영향을 받았습니다. 공개 48시간 만에 80만 건 이상의 공격 시도가 탐지되었고, 전 세계 클라우드 환경의 93%가 취약한 것으로 분석되었습니다.',
          en: 'Discovered in December 2021, the Apache Log4j vulnerability (CVE-2021-44228) is called "the single most critical vulnerability in history." A single string (${jndi:ldap://...}) enabled remote code execution, affecting billions of devices from Minecraft to Apple iCloud, AWS, Cloudflare, and Steam. Over 800,000 attack attempts were detected within 48 hours of disclosure, with 93% of cloud environments found vulnerable.',
          zh: '2021年12月发现的Apache Log4j漏洞被称为"史上最严重的单一漏洞"。仅一行字符串即可实现远程代码执行，影响了从Minecraft到iCloud、AWS等数十亿设备。公开48小时内就检测到80万+次攻击，93%的云环境存在漏洞。',
          hi: '2021 में खोजी गई Apache Log4j भेद्यता को "इतिहास की सबसे गंभीर एकल भेद्यता" कहा जाता है। एक स्ट्रिंग से रिमोट कोड एक्ज़ीक्यूशन संभव था, Minecraft से लेकर iCloud, AWS तक अरबों डिवाइस प्रभावित हुए। 48 घंटों में 8 लाख+ हमले हुए।',
          ja: '2021年12月に発見されたApache Log4j脆弱性は「史上最も深刻な単一の脆弱性」と呼ばれています。たった1行の文字列でリモートコード実行が可能で、MinecraftからiCloud、AWS、Cloudflareまで数十億台が影響を受けました。公開48時間で80万件以上の攻撃が検知されました。',
        },
        detailedInfo: {
          attackVector: {
            ko: 'Log4j JNDI 룩업 → ${jndi:ldap://악성서버} → 원격 코드 실행 (RCE)',
            en: 'Log4j JNDI lookup → ${jndi:ldap://malicious-server} → Remote Code Execution (RCE)',
          },
          affectedOrgs: {
            ko: 'Apache, Minecraft, Apple iCloud, AWS, Cloudflare, Steam — 전 세계 수십억 기기',
            en: 'Apache, Minecraft, Apple iCloud, AWS, Cloudflare, Steam — billions of devices worldwide',
          },
          severity: 'critical',
          timeline: {
            ko: '2021년 12월 9일 공개 — 48시간 내 80만 건 이상 공격 시도 탐지',
            en: 'Dec 9, 2021 disclosure — 800,000+ attack attempts within 48 hours',
          },
          lessonsLearned: {
            ko: '오픈소스 의존성 관리(SBOM), 소프트웨어 구성 분석(SCA), WAF 긴급 규칙 배포',
            en: 'Open source dependency management (SBOM), SCA tools, emergency WAF rule deployment',
          },
        },
        videoFile: null,
        videoCaption: {},
      },
    ],
  },

  // ━━━━ 2. Execution (실행) ━━━━
  {
    id: 'execution',
    title: 'Execution',
    titleKo: '실행',
    incidents: [
      {
        id: 'wannacry-ia',
        name: 'WannaCry',
        year: 2017,
        technique: 'User Execution',
        techniqueId: 'T1204',
        tourOrder: 2,
        icon: 'lock',
        stat: { value: 230000, unit: '+', label: { ko: '감염 시스템', en: 'Systems Infected' } },
        description: {
          ko: '2017년 5월 12일, 북한 라자루스 그룹이 개발한 WannaCry 랜섬웨어가 NSA에서 유출된 EternalBlue 익스플로잇(MS17-010)을 이용해 전 세계로 확산되었습니다. 불과 72시간 만에 150개국 23만 대 이상의 컴퓨터가 감염되었고, 영국 NHS(국민건강서비스) 병원 시스템이 마비되어 수술이 취소되고 환자가 다른 병원으로 이송되었습니다. Telefónica, FedEx, Renault 등 글로벌 기업도 피해를 입었으며, 총 피해액은 약 40~80억 달러로 추산됩니다.',
          en: 'On May 12, 2017, WannaCry ransomware developed by North Korea\'s Lazarus Group spread globally using the NSA-leaked EternalBlue exploit (MS17-010). Within just 72 hours, 230,000+ computers across 150 countries were infected. The UK\'s NHS hospital systems were paralyzed — surgeries canceled, patients redirected. Telefónica, FedEx, and Renault were also hit, with total damages estimated at $4-8 billion.',
          zh: '2017年5月12日，朝鲜拉撒路组织开发的WannaCry勒索软件利用NSA泄露的EternalBlue漏洞在72小时内感染150个国家23万+台电脑。英国NHS医院系统瘫痪，手术被取消。总损失估计40-80亿美元。',
          hi: '12 मई 2017 को उत्तर कोरिया के Lazarus Group द्वारा विकसित WannaCry रैनसमवेयर ने NSA के लीक EternalBlue एक्सप्लॉइट का उपयोग कर 72 घंटों में 150 देशों के 2.3 लाख+ कंप्यूटर संक्रमित किए। ब्रिटेन के NHS अस्पताल ठप हो गए।',
          ja: '2017年5月12日、北朝鮮のLazarus Groupが開発したWannaCryランサムウェアが、NSAから流出したEternalBlueエクスプロイトを利用して72時間で150カ国23万台以上に感染。英国NHSの病院システムが麻痺し、手術がキャンセルされました。被害額は40〜80億ドルと推定されます。',
        },
        detailedInfo: {
          attackVector: {
            ko: 'EternalBlue (MS17-010 SMB 취약점) → 자동 전파 → 파일 암호화 → 비트코인 몸값 요구',
            en: 'EternalBlue (MS17-010 SMB vulnerability) → auto-propagation → file encryption → Bitcoin ransom demand',
          },
          affectedOrgs: {
            ko: 'NHS(영국 의료), Telefónica, FedEx, Renault — 150개국 230,000+ 시스템',
            en: 'NHS, Telefónica, FedEx, Renault — 150 countries, 230,000+ systems',
          },
          severity: 'critical',
          timeline: {
            ko: '2017년 5월 12일~15일 — 72시간 만에 전 세계 확산',
            en: 'May 12-15, 2017 — global spread within 72 hours',
          },
          lessonsLearned: {
            ko: '패치 관리 자동화 필수, 백업 전략(3-2-1 규칙), SMB 포트(445) 차단',
            en: 'Automated patch management, backup strategy (3-2-1 rule), SMB port (445) blocking',
          },
        },
        videoFile: '/videos/hero/wannacry-ia.mp4',
        videoCaption: {
          ko: 'WannaCry 랜섬웨어가 EternalBlue 취약점을 이용해 72시간 만에 150개국으로 확산되었습니다.',
          en: 'WannaCry ransomware spread to 150 countries within 72 hours via EternalBlue.',
        },
      },
      {
        id: 'colonial-2021',
        name: 'Colonial Pipeline',
        year: 2021,
        technique: 'Command & Scripting',
        techniqueId: 'T1059',
        tourOrder: 3,
        icon: 'explosion',
        stat: { value: 4.4, unit: 'M$', label: { ko: '랜섬 지불', en: 'Ransom Paid' } },
        description: {
          ko: '2021년 5월, DarkSide 랜섬웨어 그룹이 미국 최대 연료 파이프라인 기업인 Colonial Pipeline을 공격했습니다. 유출된 VPN 비밀번호 하나로 시작된 이 공격은 미국 동부 해안 연료 공급의 45%를 5일간 중단시켰습니다. 주유소에 긴 줄이 생기고 연료 패닉 매수가 발생했으며, 바이든 대통령이 국가 비상사태를 선포했습니다. 회사는 결국 440만 달러의 비트코인 몸값을 지불했고, 이 사건은 사이버 공격이 실물 경제에 직접적 영향을 미칠 수 있음을 보여준 대표적 사례입니다.',
          en: 'In May 2021, the DarkSide ransomware group attacked Colonial Pipeline, the largest US fuel pipeline. Starting from a single leaked VPN password, the attack shut down 45% of East Coast fuel supply for 5 days. Gas stations saw long lines, panic buying erupted, and President Biden declared a national emergency. The company paid a $4.4M Bitcoin ransom. This case demonstrated how cyberattacks can directly impact the physical economy.',
          zh: '2021年5月，DarkSide勒索组织攻击了美国最大燃油管道公司Colonial Pipeline。从一个泄露的VPN密码开始，导致东海岸45%燃油供应中断5天。加油站排长队，拜登总统宣布国家紧急状态。公司支付了440万美元比特币赎金。',
          hi: 'मई 2021 में DarkSide रैनसमवेयर ने अमेरिका की सबसे बड़ी ईंधन पाइपलाइन Colonial Pipeline पर हमला किया। एक लीक VPN पासवर्ड से शुरू हुआ यह हमला 5 दिन तक पूर्वी तट की 45% ईंधन आपूर्ति बंद कर दिया। राष्ट्रपति बाइडन ने राष्ट्रीय आपातकाल घोषित किया।',
          ja: '2021年5月、DarkSideランサムウェアグループが米国最大の燃料パイプラインColonial Pipelineを攻撃。流出したVPNパスワード1つから始まり、東海岸の燃料供給の45%が5日間停止。バイデン大統領が国家非常事態を宣言しました。440万ドルのビットコイン身代金が支払われました。',
        },
        detailedInfo: {
          attackVector: {
            ko: '유출 VPN 비밀번호(MFA 미설정) → 내부 네트워크 침투 → 랜섬웨어 배포 → 파이프라인 운영 중단',
            en: 'Leaked VPN password (no MFA) → internal network infiltration → ransomware deployment → pipeline shutdown',
          },
          affectedOrgs: {
            ko: 'Colonial Pipeline — 미국 동부 연료 45% 공급 중단 (5일간), 17개 주 비상사태',
            en: 'Colonial Pipeline — 45% of US East Coast fuel supply disrupted (5 days), 17 states emergency',
          },
          severity: 'critical',
          timeline: {
            ko: '2021년 5월 7일~12일 — 미국 국가 비상사태 선포',
            en: 'May 7-12, 2021 — US national emergency declared',
          },
          lessonsLearned: {
            ko: 'VPN MFA 필수 적용, OT/IT 네트워크 분리, 랜섬웨어 대응 플레이북 수립',
            en: 'Mandatory VPN MFA, OT/IT network segmentation, ransomware response playbook',
          },
        },
        videoFile: null,
        videoCaption: {},
      },
    ],
  },

  // ━━━━ 3. Defense Evasion (방어 회피) ━━━━
  {
    id: 'evasion',
    title: 'Defense Evasion',
    titleKo: '방어 회피',
    incidents: [
      {
        id: 'stuxnet-evasion',
        name: 'Stuxnet',
        year: 2010,
        technique: 'Obfuscated Files',
        techniqueId: 'T1027',
        tourOrder: 4,
        icon: 'shield',
        stat: { value: 984, unit: '', label: { ko: '파괴 원심분리기', en: 'Centrifuges Hit' } },
        description: {
          ko: '역사상 최초의 사이버 무기로 불리는 Stuxnet은 미국 NSA와 이스라엘 Unit 8200이 공동 개발한 것으로 추정됩니다. USB 드라이브를 통해 에어갭(인터넷 단절) 네트워크에 침투했으며, 당시 알려지지 않은 4개의 제로데이 취약점을 동시에 사용하는 전례 없는 정교함을 보여주었습니다. 이란 나탄즈 핵시설의 원심분리기 984대를 파괴하여 이란 핵 프로그램을 수 년 지연시켰습니다. 3년간 은밀히 작동하다가 2010년에 발견되었고, 사이버 전쟁의 시대를 열었습니다.',
          en: 'Known as the first true cyber weapon, Stuxnet was allegedly co-developed by the US NSA and Israel\'s Unit 8200. It infiltrated air-gapped networks via USB drives, using an unprecedented 4 zero-day exploits simultaneously. It destroyed 984 centrifuges at Iran\'s Natanz nuclear facility, delaying Iran\'s nuclear program by years. Operating covertly for 3 years before discovery in 2010, it opened the era of cyber warfare.',
          zh: 'Stuxnet被称为首个真正的网络武器，据称由美国NSA和以色列8200部队联合开发。通过USB渗透物理隔离网络，同时利用4个零日漏洞。摧毁了伊朗纳坦兹核设施984台离心机，将伊朗核计划推迟数年。秘密运行3年后于2010年被发现，开启了网络战时代。',
          hi: 'इतिहास का पहला साइबर हथियार Stuxnet अमेरिकी NSA और इज़राइल की Unit 8200 ने मिलकर बनाया। USB के ज़रिए एयर-गैप नेटवर्क में घुसकर 4 ज़ीरो-डे का एक साथ इस्तेमाल किया। ईरान के 984 सेंट्रीफ्यूज नष्ट किए, परमाणु कार्यक्रम वर्षों पीछे धकेला।',
          ja: '史上初の真のサイバー兵器Stuxnetは、米NSAとイスラエルUnit 8200が共同開発したとされています。USBドライブでエアギャップネットワークに侵入し、前例のない4つのゼロデイ脆弱性を同時使用。イラン・ナタンズ核施設の遠心分離機984台を破壊し、核計画を数年遅延させました。3年間秘密裡に動作し2010年に発見されました。',
        },
        detailedInfo: {
          attackVector: {
            ko: 'USB 감염 → 제로데이 4개 활용 → Siemens STEP 7 PLC 코드 변조 → 원심분리기 과속 회전',
            en: 'USB infection → 4 zero-days → Siemens STEP 7 PLC manipulation → centrifuge over-spinning',
          },
          affectedOrgs: {
            ko: '이란 나탄즈 핵시설 — 원심분리기 984대 파괴, 핵 프로그램 수 년 지연',
            en: 'Iran Natanz — 984 centrifuges destroyed, nuclear program delayed by years',
          },
          severity: 'critical',
          timeline: {
            ko: '2007~2010년 (2010년 발견) — 3년간 은밀 작전 수행',
            en: '2007-2010 (discovered 2010) — 3 years of covert operation',
          },
          lessonsLearned: {
            ko: '에어갭 네트워크도 안전하지 않음, SCADA/ICS 보안 강화, USB 매체 통제 필수',
            en: 'Air-gapped networks are not safe, SCADA/ICS hardening, mandatory USB media control',
          },
        },
        videoFile: '/videos/hero/stuxnet-evasion.mp4',
        videoCaption: {
          ko: 'Stuxnet은 4개의 제로데이를 활용해 이란 핵시설 원심분리기 984대를 파괴했습니다.',
          en: 'Stuxnet used 4 zero-day exploits to destroy 984 centrifuges at Iran nuclear facility.',
        },
      },
      {
        id: 'notpetya-2017',
        name: 'NotPetya',
        year: 2017,
        technique: 'Masquerading',
        techniqueId: 'T1036',
        tourOrder: 5,
        icon: 'explosion',
        stat: { value: 10, unit: 'B$', label: { ko: '총 피해액', en: 'Total Damage' } },
        description: {
          ko: '2017년 6월 27일, 러시아 군사정보기관(GRU)이 개발한 NotPetya는 랜섬웨어로 위장했지만 실제로는 데이터 파괴가 목적인 와이퍼 맬웨어였습니다. 우크라이나 세무 소프트웨어 MeDoc의 업데이트를 통해 확산되었고, 단 하루 만에 전 세계로 퍼졌습니다. 세계 최대 해운사 Maersk는 45,000대 PC와 4,000대 서버를 재설치해야 했으며($3B 피해), 제약회사 Merck는 $8.7B, FedEx TNT는 $4B의 피해를 입었습니다. 역사상 가장 파괴적인 사이버 공격으로 총 피해액이 100억 달러를 넘습니다.',
          en: 'On June 27, 2017, NotPetya — developed by Russia\'s GRU — masqueraded as ransomware but was actually a wiper designed to destroy data. Spread through Ukraine\'s MeDoc tax software updates, it went global within a single day. Maersk had to reinstall 45,000 PCs and 4,000 servers ($3B damage), Merck suffered $8.7B, and FedEx TNT $4B. The most destructive cyberattack in history, with total damages exceeding $10 billion.',
          zh: '2017年6月27日，俄罗斯GRU开发的NotPetya伪装成勒索软件，实际是数据擦除恶意软件。通过乌克兰MeDoc税务软件更新传播，一天内扩散全球。Maersk重装45,000台PC（$3B损失），Merck损失$8.7B。总损失超过100亿美元，是史上最具破坏性的网络攻击。',
          hi: '27 जून 2017 को रूस के GRU द्वारा विकसित NotPetya रैनसमवेयर की तरह दिखता था लेकिन असल में डेटा नष्ट करने वाला वाइपर था। यूक्रेन के MeDoc सॉफ़्टवेयर से फैलकर एक दिन में वैश्विक हो गया। Maersk को 45,000 PC दोबारा इंस्टॉल करने पड़े। कुल नुकसान $10B+ — इतिहास का सबसे विनाशकारी साइबर हमला।',
          ja: '2017年6月27日、ロシアGRUが開発したNotPetyaはランサムウェアを装っていましたが、実際はデータ破壊が目的のワイパーマルウェアでした。ウクライナのMeDoc税務ソフトの更新で拡散し、1日で世界中に広がりました。Maerskは45,000台のPCと4,000台のサーバーを再インストール（$3B被害）、Merckは$8.7B、FedExは$4Bの損害。史上最も破壊的なサイバー攻撃で、被害総額は100億ドル超です。',
        },
        detailedInfo: {
          attackVector: {
            ko: 'MeDoc 업데이트 공급망 공격 → EternalBlue + Mimikatz 자격증명 수집 → 횡적 이동 → 데이터 파괴',
            en: 'MeDoc update supply chain → EternalBlue + Mimikatz credential harvesting → lateral movement → data destruction',
          },
          affectedOrgs: {
            ko: 'Maersk($3B), Merck($8.7B), FedEx TNT($4B), Mondelez, 우크라이나 정부기관',
            en: 'Maersk ($3B), Merck ($8.7B), FedEx TNT ($4B), Mondelez, Ukrainian government',
          },
          severity: 'critical',
          timeline: {
            ko: '2017년 6월 27일 — 단 하루 만에 전 세계 확산, 총 피해 $10B+',
            en: 'June 27, 2017 — global spread within a single day, $10B+ total damage',
          },
          lessonsLearned: {
            ko: '공급망 보안 검증, 네트워크 세그먼테이션, 오프라인 백업 필수, 와이퍼 vs 랜섬웨어 구분 능력',
            en: 'Supply chain verification, network segmentation, offline backups mandatory, wiper vs ransomware distinction',
          },
        },
        videoFile: null,
        videoCaption: {},
      },
    ],
  },

  // ━━━━ 4. Credential Access (자격 증명 접근) ━━━━
  {
    id: 'credential-access',
    title: 'Credential Access',
    titleKo: '자격 증명',
    incidents: [
      {
        id: 'equifax-2017',
        name: 'Equifax',
        year: 2017,
        technique: 'OS Credential Dumping',
        techniqueId: 'T1003',
        tourOrder: 6,
        icon: 'database',
        stat: { value: 147, unit: 'M', label: { ko: '유출 개인정보', en: 'Records Leaked' } },
        description: {
          ko: '2017년 미국 3대 신용평가사 중 하나인 Equifax에서 1억 4,700만 명의 개인정보가 유출되었습니다. 이는 미국 전체 인구의 약 44%에 해당하는 규모입니다. 공격자는 Apache Struts 웹 프레임워크의 알려진 취약점(CVE-2017-5638)을 이용했는데, 이 패치는 이미 2개월 전에 공개되어 있었습니다. 유출된 정보에는 사회보장번호(SSN), 생년월일, 주소, 운전면허번호, 신용카드 번호가 포함되어 있어, 피해자들은 평생 신원 도용의 위험에 노출되었습니다. 76일간 탐지되지 않았으며, Equifax는 $7억의 합의금을 지불했습니다.',
          en: 'In 2017, Equifax — one of America\'s three major credit bureaus — suffered a breach exposing 147 million personal records, approximately 44% of the US population. Attackers exploited a known Apache Struts vulnerability (CVE-2017-5638) that had been patched 2 months prior. Leaked data included SSNs, birth dates, addresses, driver\'s licenses, and credit card numbers, exposing victims to lifetime identity theft risk. Undetected for 76 days, Equifax paid a $700M settlement.',
          zh: '2017年美国三大信用评估机构之一Equifax泄露1.47亿个人信息，约占美国人口44%。攻击者利用2个月前已修补的Apache Struts漏洞。泄露数据包括SSN、生日、地址、信用卡号。76天未被发现，Equifax支付$7亿和解金。',
          hi: '2017 में अमेरिका की तीन प्रमुख क्रेडिट ब्यूरो में से एक Equifax से 14.7 करोड़ व्यक्तिगत रिकॉर्ड लीक हुए — अमेरिकी आबादी का ~44%। हमलावरों ने 2 महीने पहले पैच की गई Apache Struts भेद्यता का फायदा उठाया। SSN, जन्मतिथि, पते, क्रेडिट कार्ड नंबर लीक। 76 दिन तक अनदेखा, $700M निपटारा।',
          ja: '2017年、米国3大信用調査機関の1つEquifaxで1億4,700万人の個人情報が漏洩しました。米国人口の約44%に相当します。攻撃者は2ヶ月前にパッチが公開されていたApache Strutsの脆弱性を悪用。SSN、生年月日、住所、クレジットカード番号が流出し、76日間検知されませんでした。Equifaxは7億ドルの和解金を支払いました。',
        },
        detailedInfo: {
          attackVector: {
            ko: 'Apache Struts 취약점(CVE-2017-5638) → 웹 앱 침투 → 76일간 DB에서 개인정보 수집',
            en: 'Apache Struts (CVE-2017-5638) → web app infiltration → 76 days of data exfiltration from DB',
          },
          affectedOrgs: {
            ko: 'Equifax — 미국 인구 44%(1.47억 명) SSN/생년월일/주소/카드정보 유출, $700M 합의',
            en: 'Equifax — 44% of US population (147M) SSN/DOB/address/card data, $700M settlement',
          },
          severity: 'critical',
          timeline: {
            ko: '2017년 5월~7월 — 76일간 탐지되지 않음, 9월 공개 시 주가 35% 폭락',
            en: 'May-July 2017 — undetected for 76 days, stock dropped 35% upon September disclosure',
          },
          lessonsLearned: {
            ko: '보안 패치 즉시 적용, 민감 데이터 암호화, 침입 탐지 시스템(IDS) 강화, 사고 공개 의무화',
            en: 'Immediate security patching, sensitive data encryption, IDS enhancement, mandatory breach disclosure',
          },
        },
        videoFile: null,
        videoCaption: {},
      },
    ],
  },

  // ━━━━ 5. Impact (임팩트) ━━━━
  {
    id: 'impact',
    title: 'Impact',
    titleKo: '임팩트',
    incidents: [
      {
        id: 'moveit-2023',
        name: 'MOVEit',
        year: 2023,
        technique: 'Data Encrypted for Impact',
        techniqueId: 'T1486',
        tourOrder: 7,
        icon: 'database',
        stat: { value: 2773, unit: '+', label: { ko: '피해 조직', en: 'Orgs Affected' } },
        description: {
          ko: '2023년 러시아 기반 Cl0p 랜섬웨어 그룹이 Progress Software의 파일 전송 솔루션 MOVEit Transfer의 SQL 인젝션 제로데이(CVE-2023-34362)를 대규모로 악용했습니다. 이 공격으로 전 세계 2,773개 이상의 조직과 9,500만 명 이상의 개인정보가 유출되었습니다. 피해 조직에는 미국 에너지부(DOE), 영국 BBC, 브리티시 에어웨이즈, Shell, Sony, 뉴욕시 교육청 등이 포함됩니다. Cl0p은 기존 랜섬웨어와 달리 파일을 암호화하지 않고 데이터를 탈취한 후 공개 협박하는 새로운 전략을 사용했으며, 이는 2023년 최대 규모의 사이버 보안 사건이 되었습니다.',
          en: 'In 2023, Russia-based Cl0p ransomware group mass-exploited a SQL injection zero-day (CVE-2023-34362) in Progress Software\'s MOVEit Transfer file transfer solution. The attack compromised 2,773+ organizations and 95+ million personal records. Victims include the US Department of Energy, BBC, British Airways, Shell, Sony, and NYC Department of Education. Unlike typical ransomware, Cl0p used a data theft + public extortion strategy without encrypting files, making this the largest cybersecurity incident of 2023.',
          zh: '2023年，俄罗斯Cl0p勒索组织大规模利用MOVEit Transfer的SQL注入零日漏洞，攻击了2,773+个组织，泄露9,500万+条个人信息。受害者包括美国能源部、BBC、英航、Shell、Sony。Cl0p采用不加密文件而窃取数据公开勒索的新策略，成为2023年最大网络安全事件。',
          hi: '2023 में रूस स्थित Cl0p रैनसमवेयर ने MOVEit Transfer की SQL इंजेक्शन ज़ीरो-डे का बड़े पैमाने पर फायदा उठाया। 2,773+ संगठन और 9.5 करोड़+ व्यक्तिगत रिकॉर्ड प्रभावित। अमेरिकी ऊर्जा विभाग, BBC, British Airways, Shell, Sony शामिल। फ़ाइलें एन्क्रिप्ट किए बिना डेटा चोरी — 2023 की सबसे बड़ी साइबर घटना।',
          ja: '2023年、ロシア拠点のCl0pランサムウェアグループがMOVEit TransferのSQLインジェクションゼロデイを大規模に悪用。2,773以上の組織と9,500万人以上の個人情報が流出。米エネルギー省、BBC、British Airways、Shell、Sonyが被害。ファイル暗号化せずデータ窃取・脅迫という新戦略で、2023年最大のサイバーセキュリティ事件となりました。',
        },
        detailedInfo: {
          attackVector: {
            ko: 'MOVEit Transfer SQL 인젝션 제로데이(CVE-2023-34362) → 웹 셸 설치 → 대규모 데이터 탈취',
            en: 'MOVEit Transfer SQL injection zero-day (CVE-2023-34362) → web shell → mass data exfiltration',
          },
          affectedOrgs: {
            ko: '미국 에너지부(DOE), BBC, 브리티시 에어웨이즈, Shell, Sony, 뉴욕시 교육청 등 2,773+ 조직',
            en: 'US DOE, BBC, British Airways, Shell, Sony, NYC Dept of Education — 2,773+ organizations',
          },
          severity: 'critical',
          timeline: {
            ko: '2023년 5~6월 대규모 익스플로잇 — 수 개월간 피해 규모 지속 확대',
            en: 'May-June 2023 mass exploitation — impact scope expanded for months',
          },
          lessonsLearned: {
            ko: '파일 전송 솔루션 보안 감사, 제로데이 대응 체계, 공급업체 보안 평가, 데이터 최소화 원칙',
            en: 'File transfer solution security audit, zero-day response framework, vendor security assessment, data minimization',
          },
        },
        videoFile: null,
        videoCaption: {},
      },
    ],
  },
];

// 투어 시퀀스 (tourOrder 순서대로 정렬)
export const TOUR_SEQUENCE = TACTICS.flatMap(t =>
  t.incidents.map(inc => ({ tacticId: t.id, incidentId: inc.id, tourOrder: inc.tourOrder }))
).sort((a, b) => a.tourOrder - b.tourOrder);

export const TOTAL_TOUR_STEPS = TOUR_SEQUENCE.length;

// 히어로 다국어 텍스트
export const HERO_TEXT = {
  ko: {
    header: '실전 해킹 사고로 배우는',
    headerAccent: '마이터 어택 기반의 전문 분석 학습법',
    subheader: '과거의 위협을 통해 미래의 위협에 대비하세요. 전문가 수준의 분류 역량 강화.',
    matrixTitle: '우리의 핵심 학습 모델: 마이터 어택 기반 사고 매트릭스',
    incidentCases: '과거 사고 (Incident Cases)',
    incidentDesc: '실제 사이버 공격 사례를 MITRE ATT&CK 프레임워크로 분류하여 학습합니다.',
    ctaCurriculum: '커리큘럼 확인하기',
    ctaLearnMore: '학습법 자세히 알아보기',
    techniqueId: 'Technique ID',
    skip: 'SKIP',
    login: '로그인 / 회원가입',
    detailAttackVector: '공격 경로',
    detailAffected: '피해 대상',
    detailTimeline: '타임라인',
    detailLessons: '교훈',
    detailSeverity: '위험도',
  },
  en: {
    header: 'Learn from Real Hacking Incidents',
    headerAccent: 'MITRE ATT&CK-based Professional Analysis',
    subheader: 'Prepare for future threats by studying past ones. Build expert-level classification skills.',
    matrixTitle: 'Our Core Learning Model: MITRE ATT&CK Incident Matrix',
    incidentCases: 'Past Incidents (Incident Cases)',
    incidentDesc: 'Learn by classifying real cyber attack cases using the MITRE ATT&CK framework.',
    ctaCurriculum: 'View Curriculum',
    ctaLearnMore: 'Learn More',
    techniqueId: 'Technique ID',
    skip: 'SKIP',
    login: 'LOGIN / REGISTER',
    detailAttackVector: 'Attack Vector',
    detailAffected: 'Affected',
    detailTimeline: 'Timeline',
    detailLessons: 'Lessons Learned',
    detailSeverity: 'Severity',
  },
  zh: {
    header: '从真实黑客事件中学习',
    headerAccent: '基于MITRE ATT&CK的专业分析方法',
    subheader: '通过研究过去的威胁为未来做好准备。培养专家级分类能力。',
    matrixTitle: '我们的核心学习模型：MITRE ATT&CK事件矩阵',
    incidentCases: '历史事件 (Incident Cases)',
    incidentDesc: '使用MITRE ATT&CK框架对真实网络攻击案例进行分类学习。',
    ctaCurriculum: '查看课程',
    ctaLearnMore: '了解更多',
    techniqueId: 'Technique ID',
    skip: 'SKIP',
    login: '登录 / 注册',
    detailAttackVector: '攻击路径',
    detailAffected: '受影响对象',
    detailTimeline: '时间线',
    detailLessons: '经验教训',
    detailSeverity: '严重程度',
  },
  hi: {
    header: 'वास्तविक हैकिंग घटनाओं से सीखें',
    headerAccent: 'MITRE ATT&CK आधारित पेशेवर विश्लेषण',
    subheader: 'पिछले खतरों का अध्ययन करके भविष्य के खतरों के लिए तैयार रहें।',
    matrixTitle: 'हमारा कोर लर्निंग मॉडल: MITRE ATT&CK इंसिडेंट मैट्रिक्स',
    incidentCases: 'पिछली घटनाएँ (Incident Cases)',
    incidentDesc: 'MITRE ATT&CK फ्रेमवर्क का उपयोग करके वास्तविक साइबर हमलों का वर्गीकरण सीखें।',
    ctaCurriculum: 'पाठ्यक्रम देखें',
    ctaLearnMore: 'और जानें',
    techniqueId: 'Technique ID',
    skip: 'SKIP',
    login: 'लॉगिन / रजिस्टर',
    detailAttackVector: 'अटैक वेक्टर',
    detailAffected: 'प्रभावित',
    detailTimeline: 'टाइमलाइन',
    detailLessons: 'सीखे गए सबक',
    detailSeverity: 'गंभीरता',
  },
  ja: {
    header: '実際のハッキング事件から学ぶ',
    headerAccent: 'MITRE ATT&CKベースのプロフェッショナル分析',
    subheader: '過去の脅威を研究して将来の脅威に備えましょう。専門家レベルの分類能力を強化。',
    matrixTitle: 'コア学習モデル：MITRE ATT&CK インシデントマトリクス',
    incidentCases: '過去のインシデント (Incident Cases)',
    incidentDesc: 'MITRE ATT&CKフレームワークを使用して実際のサイバー攻撃事例を分類して学習します。',
    ctaCurriculum: 'カリキュラムを見る',
    ctaLearnMore: '詳しく見る',
    techniqueId: 'Technique ID',
    skip: 'SKIP',
    login: 'ログイン / 登録',
    detailAttackVector: '攻撃経路',
    detailAffected: '影響対象',
    detailTimeline: 'タイムライン',
    detailLessons: '教訓',
    detailSeverity: '深刻度',
  },
};

/**
 * Orion Echo Enterprise APT Range — 시나리오 메타데이터
 * 출처: docs/apt-orion-echo/ (사용자 spec 폴더)
 *
 * 11단계 SolarWinds-style supply-chain 침투 시뮬레이션.
 * Docker-only training range (UAE summer school).
 */
export default {
  id: 'OE001',
  name: 'Orion Echo Enterprise APT Range',
  group: 'Inspired by APT29 (SolarWinds-style)',
  level: 4,
  type: 'lab', // 'lab' = Docker 실습 환경 (1인칭 시나리오 X)
  durationMin: 360, // 6시간 권장
  difficulty: 'advanced',

  hero: {
    company: 'Orion Echo Systems LLC',
    industry: 'UAE 기반 산업 모니터링·스마트 시설 운영 SW 벤더',
    customer: 'Al Noor Research Campus (ANRC)',
    finalObjective: 'ANRC 시설 감사 보고서 (Object Storage)',
  },

  persona: {
    setup: 'ANRC가 EchoAgent 업데이트 관련 의심 활동을 감지했다. 의심 원인은 ANRC가 아니라 Orion Echo의 빌드/업데이트 파이프라인. 너는 외부 정찰부터 시작해 신뢰 관계를 타고 고객 환경의 감사 데이터에 도달한다.',
    role: 'External Operator (외부 위협 행위자)',
  },

  story: [
    'Orion Echo Systems는 UAE 산업·물류·연구 캠퍼스를 대상으로 모니터링 SW를 공급한다.',
    '최근 고객사 ANRC에서 EchoAgent 업데이트와 관련된 비정상 행동이 관찰됐다.',
    '의혹의 화살은 ANRC가 아니라 Orion Echo의 공급망 자체로 향한다.',
    '너는 공격자다. 외부 정찰부터 빌드 파이프라인을 거쳐, 신뢰된 업데이트 채널을 통해 고객 환경에 도달해야 한다.',
  ],

  // 11 스테이지 (스펙 문서 § 9 참고)
  stages: [
    {
      id: 0, name: 'External Recon',
      mitre: ['T1591', 'T1592.002'],
      objective: '회사·제품·노출 서비스·고객·릴리즈 프로세스 식별',
      surface: ['edge-proxy', 'public-site', 'public-docs', 'vendor-portal', 'support-portal'],
      flag: 'flag_0_recon_context',
      passive: true,
    },
    {
      id: 1, name: 'Initial Access',
      mitre: ['T1190'],
      objective: 'DMZ 취약 서비스 통한 첫 발판 확보 (SSTI/RCE/file upload)',
      surface: ['support-portal'],
      flag: 'flag_1_initial_access',
      passive: false,
    },
    {
      id: 2, name: 'Execution & Foothold Stabilization',
      mitre: ['T1059.004', 'T1082', 'T1083'],
      objective: 'Foothold 컨텍스트 파악·환경 열거·접근 가능 서비스 식별',
      surface: ['c2-emulator'],
      flag: 'flag_2_foothold_execution',
      passive: true,
    },
    {
      id: 3, name: 'Persistence / C2 Emulation',
      mitre: ['T1071'],
      objective: '랩 컨트롤 implant 등록·beacon 관계 수립',
      surface: ['c2-emulator'],
      flag: 'flag_3_persistence_c2',
      passive: true,
      note: 'lab-controlled emulator만 사용. 실제 malware/외부 callback 금지.',
    },
    {
      id: 4, name: 'Internal Discovery',
      mitre: ['T1046', 'T1213'],
      objective: '내부 호스트·SSO·intranet·wiki·ticket·HR·mail·doc 조사',
      surface: ['corp-sso', 'intranet', 'wiki', 'ticket-service', 'hr-directory', 'mail-web', 'doc-portal'],
      flag: 'flag_4_internal_discovery',
      passive: false,
    },
    {
      id: 5, name: 'Credential / Token Discovery',
      mitre: ['T1552', 'T1213.003'],
      objective: '다수 decoy 사이에서 유효한 토큰·자격증명 식별',
      surface: ['intranet', 'wiki', 'ticket-service', 'doc-portal'],
      flag: 'flag_5_credential_material',
      passive: false,
    },
    {
      id: 6, name: 'Lateral Movement to DevOps',
      mitre: ['T1550.001'],
      objective: '발견한 토큰으로 source-repo·build-server·CI runner 진입',
      surface: ['source-repo', 'build-server', 'ci-runner', 'package-registry'],
      flag: 'flag_6_devops_lateral_movement',
      passive: false,
    },
    {
      id: 7, name: 'Build Pipeline & Supply Chain',
      mitre: ['T1195.002', 'T1072'],
      objective: 'SolarWinds 스타일 supply-chain 모델링 — benign marker 주입',
      surface: ['build-server', 'ci-runner', 'signing-service', 'update-server'],
      flag: 'flag_7_supply_chain_stage',
      passive: false,
      note: 'malware 생성 금지. ORION_ECHO_BUILD_MARKER만 사용.',
    },
    {
      id: 8, name: 'Trusted Update → Customer',
      mitre: ['T1199', 'T1550.001'],
      objective: '신뢰된 업데이트 채널 통해 고객 환경 도달',
      surface: ['update-server', 'customer-app', 'customer-api'],
      flag: 'flag_8_customer_reach',
      passive: false,
    },
    {
      id: 9, name: 'Customer Environment Discovery',
      mitre: ['T1046', 'T1083'],
      objective: 'ANRC API·monitoring·audit-log·object-store 열거',
      surface: ['customer-api', 'monitoring', 'audit-log', 'object-store'],
      flag: 'flag_9_customer_discovery',
      passive: false,
    },
    {
      id: 10, name: 'Final Collection',
      mitre: ['T1530'],
      objective: 'ANRC 감사 보고서 수집 (PDF + final marker)',
      surface: ['object-store'],
      flag: 'flag_10_final_objective',
      passive: false,
    },
  ],

  networks: [
    'public_net (외부 진입)',
    'dmz_net (벤더 DMZ)',
    'corp_net (사내)',
    'dev_net (개발/CI)',
    'release_net (서명·배포)',
    'customer_net (ANRC 고객 환경)',
    'control_net (랩 컨트롤·flag·세션)',
  ],

  containerCount: 20,

  safetyRules: [
    '실제 malware/destructive payload 절대 금지',
    '외부 C2 인프라 사용 금지',
    'Docker host escape · docker.sock abuse · privileged container abuse 금지',
    'Persistence·backdoor·C2는 control_net 안 lab-controlled emulator로만',
    '컨테이너 → 인터넷 egress 기본 비활성',
    '학생 세션 간 완전 격리',
  ],

  prerequisites: [
    'Linux 셸·HTTP/REST 기본',
    'Docker / Docker Compose 동작 이해',
    'OWASP Top10 / 공통 웹 취약점 (SSTI·File Upload·Path Traversal)',
    'Git 워크플로우·CI/CD 개념',
    'OAuth/OIDC 토큰 흐름 (참고)',
    'MITRE ATT&CK Enterprise 입문',
  ],

  status: 'preparing', // 'preparing' | 'available' | 'closed'
  statusMessage: 'Docker 인프라 구축 중 — 2026년 여름 학교 정식 오픈 예정',

  // 다음 시나리오 티저
  next: {
    title: 'C0025 — NotPetya 변종',
    hint: 'Orion Echo의 신뢰 채널을 인접 고객 망으로 확산시키는 worm 시뮬레이션',
  },
};

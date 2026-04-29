/**
 * stages.voxel.js — APT 14단계 Atom Spec
 *
 * 계층:
 *   APT Course
 *     └─ Stage (14)
 *         └─ Scene (sceneType)
 *             └─ Atom { Environment, Actor, Tool, Action, Effect }
 *
 * 학습자 hotspot 클릭 → 씬 변화 → success 트리거 → 다음 단계
 * 공격 실행 코드 0%. 행위의 원자(Atom)를 시각화만.
 */

export const VOXEL_STAGES = [
  {
    id: "reconnaissance",
    title: "Reconnaissance",
    sceneType: "recon",
    objective: "타겟 후보를 관찰하고 위험 신호를 식별한다.",
    visualMetaphor: "어두운 책상 위에 떠다니는 프로필 카드와 OSINT 스캐너",
    atoms: {
      environment: ["desk", "laptop", "profile_wall"],
      actors: ["analyst", "target_developer", "shadow_attacker"],
      tools: ["linkedin_card", "github_repo", "search_lens", "interest_tag"],
      actions: ["scan", "connect", "select_target"],
      effects: ["scanner_sweep", "relationship_lines", "lock_glow"],
    },
    hotspots: [
      { id: "crypto_bot",       label: "Crypto Bot",        correct: true,  hint: "공격자가 노릴 만한 직업·관심사" },
      { id: "trading_interest", label: "Auto Trading",      correct: true,  hint: "투자 보상 미끼와 연결되는 관심사" },
      { id: "random_skill",     label: "CSS Animation",     correct: false, hint: "이 시나리오의 미끼와 무관" },
    ],
    success: "target_locked",
    summary: "공격자는 무차별이 아니라 '미끼가 통할 사람'을 고른다.",
  },
  {
    id: "initial_access",
    title: "Initial Access",
    sceneType: "initial_access",
    objective: "피싱 메일이 사용자의 행동을 유도하는 과정을 관찰한다.",
    visualMetaphor: "발신자·첨부·보상 카피가 신뢰 게이지를 흔드는 메일 박스",
    atoms: {
      environment: ["developer_room", "macbook", "inbox"],
      actors: ["developer", "shadow_attacker"],
      tools: ["email", "attachment_pkg", "trust_meter"],
      actions: ["inspect_header", "open_attachment", "decision"],
      effects: ["red_thread", "door_crack", "trust_drop"],
    },
    hotspots: [
      { id: "sender_domain",  label: "Sender Domain",       correct: true, hint: "유사 도메인·오타 도메인" },
      { id: "attachment",     label: ".pkg Attachment",     correct: true, hint: "실행형 첨부의 위험" },
      { id: "reward_copy",    label: "High Reward Copy",    correct: true, hint: "비현실적 보상 카피" },
    ],
    success: "door_opened",
    summary: "메일 자체가 아니라 '신뢰를 흔드는 단서들'을 본다.",
  },
  {
    id: "execution",
    title: "Execution",
    sceneType: "generic",
    objective: "정상 UI 뒤에서 백그라운드 동작이 시작되는 패턴을 관찰한다.",
    visualMetaphor: "정상 차트가 켜진 앱 뒤로 흐릿한 프로세스 큐브가 빛난다",
    atoms: {
      environment: ["trading_app", "chart_screen", "memory_grid"],
      actors: ["developer"],
      tools: ["foreground_ui", "background_thread"],
      actions: ["app_launch", "ghost_packets", "memory_blocks_light"],
      effects: ["normal_glow", "ghost_motion"],
    },
    hotspots: [
      { id: "fg_ui",     label: "Foreground UI",  correct: false, hint: "정상으로 보이는 부분" },
      { id: "bg_thread", label: "Background Thread", correct: true, hint: "보이지 않는 동작" },
    ],
    success: "execution_seen",
    summary: "정상 UI 뒤에서도 의심 가능한 신호가 있다.",
  },
  {
    id: "persistence",
    title: "Persistence",
    sceneType: "generic",
    objective: "재부팅 후에도 살아남는 자동 실행 슬롯의 존재를 인지한다.",
    visualMetaphor: "부트 레일 위에 새로 끼어든 startup slot이 깜빡인다",
    atoms: {
      environment: ["boot_rail", "startup_slot"],
      actors: ["sleeping_cube"],
      tools: ["auto_run_loop"],
      actions: ["system_reboot", "backdoor_wakes"],
      effects: ["loop_glow"],
    },
    hotspots: [
      { id: "startup_slot", label: "New Startup Slot", correct: true, hint: "원래 없던 슬롯" },
    ],
    success: "persistence_seen",
    summary: "Persistence는 '재부팅 후 살아 있느냐'로 식별한다.",
  },
  {
    id: "privilege_escalation",
    title: "Privilege Escalation",
    sceneType: "generic",
    objective: "권한 토큰이 상승하는 순간의 신호를 관찰한다.",
    visualMetaphor: "잠긴 권한 타워 → trust prompt → 토큰이 떠오르며 admin ring 점등",
    atoms: {
      environment: ["privilege_tower"],
      actors: ["user_token", "admin_ring"],
      tools: ["trust_prompt", "permission_token"],
      actions: ["prompt_appears", "token_rises", "admin_ring_glow"],
      effects: ["ring_pulse"],
    },
    hotspots: [
      { id: "trust_prompt", label: "Trust Prompt", correct: true, hint: "동의 클릭 직전이 위험 순간" },
    ],
    success: "escalated_visible",
    summary: "권한 상승은 'OK 한 번'으로 일어난다.",
  },
  {
    id: "defense_evasion",
    title: "Defense Evasion",
    sceneType: "generic",
    objective: "EDR 스포트라이트를 피하는 회피 행위를 관찰한다.",
    visualMetaphor: "EDR 빛이 방을 비추자 의심 객체가 신뢰된 그림자 뒤에 숨는다",
    atoms: {
      environment: ["room", "trusted_silhouette"],
      actors: ["suspicious_object"],
      tools: ["edr_spotlight", "detection_meter"],
      actions: ["object_hides", "confidence_drops"],
      effects: ["shadow_overlap"],
    },
    hotspots: [
      { id: "trusted_silhouette", label: "Trusted Silhouette", correct: true, hint: "정상으로 위장된 위치" },
    ],
    success: "evasion_seen",
    summary: "회피는 '신뢰된 것 뒤에 숨기'다.",
  },
  {
    id: "credential_access",
    title: "Credential Access",
    sceneType: "generic",
    objective: "약한 비밀(secret)이 흘러나가는 경로를 관찰한다.",
    visualMetaphor: "credential vault에서 약한 단편이 빛나며 공격자 경로로 흐른다",
    atoms: {
      environment: ["credential_vault"],
      actors: ["secret_fragments"],
      tools: ["weak_secret"],
      actions: ["weak_secret_glow", "fragments_flow"],
      effects: ["leak_line"],
    },
    hotspots: [
      { id: "weak_secret", label: "Weak Secret", correct: true, hint: "재사용·취약·평문 보관" },
    ],
    success: "credential_seen",
    summary: "약한 비밀은 '훔치기 쉬운 비밀'이다.",
  },
  {
    id: "discovery",
    title: "Discovery",
    sceneType: "discovery",
    objective: "내부 네트워크에서 중요 서버 후보를 찾는다.",
    visualMetaphor: "안개 낀 네트워크에 스캐너 펄스가 퍼지며 wallet 후보가 빛난다",
    atoms: {
      environment: ["network_floor", "subnet_blocks", "server_room"],
      actors: ["shadow_attacker"],
      tools: ["scanner_pulse", "network_node", "wallet_server"],
      actions: ["sweep", "reveal", "classify"],
      effects: ["pulse_ring"],
    },
    hotspots: [
      { id: "wallet_node", label: "Wallet Server Candidate", correct: true,  hint: "고가치 자산 노드" },
      { id: "dev_node",    label: "Dev Server",              correct: false, hint: "현 시나리오 핵심 자산 아님" },
      { id: "print_node",  label: "Printer",                 correct: false, hint: "낮은 가치 노드" },
    ],
    success: "wallet_revealed",
    summary: "Discovery는 '값어치 있는 노드 찾기'다.",
  },
  {
    id: "lateral_movement",
    title: "Lateral Movement",
    sceneType: "generic",
    objective: "분리된 네트워크 영역 사이의 신뢰 경로를 관찰한다.",
    visualMetaphor: "네트워크 게이트가 열리고 허용된 경로로만 큐브가 이동",
    atoms: {
      environment: ["network_zones"],
      actors: ["payload_cube"],
      tools: ["allowed_path", "movement_line"],
      actions: ["trust_path_reveal", "snake_motion"],
      effects: ["path_glow"],
    },
    hotspots: [
      { id: "allowed_path", label: "Allowed Path", correct: true, hint: "신뢰 관계로 이미 열린 길" },
    ],
    success: "lateral_seen",
    summary: "Lateral Movement는 '이미 열려 있는 길을 따라가기'.",
  },
  {
    id: "collection",
    title: "Collection",
    sceneType: "generic",
    objective: "수집 대상이 한 번에 묶이는 패턴을 관찰한다.",
    visualMetaphor: "wallet server가 열리고 핵심 자산이 큐브 번들로 묶인다",
    atoms: {
      environment: ["wallet_server"],
      actors: ["key_objects"],
      tools: ["collection_bundle"],
      actions: ["sensitive_asset_highlight", "bundle_forms"],
      effects: ["bundle_glow"],
    },
    hotspots: [
      { id: "bundle", label: "Collection Bundle", correct: true, hint: "한꺼번에 묶이는 자산" },
    ],
    success: "collection_seen",
    summary: "Collection은 '한 번에 묶이는 자산'을 본다.",
  },
  {
    id: "command_and_control",
    title: "Command & Control",
    sceneType: "generic",
    objective: "외부와의 비콘 통신 리듬을 관찰한다.",
    visualMetaphor: "egress 트래픽 중 의심 스레드가 일정한 간격으로 깜빡인다",
    atoms: {
      environment: ["egress_lines"],
      actors: ["suspicious_thread"],
      tools: ["beacon_rhythm"],
      actions: ["traffic_streams", "red_thread_visible"],
      effects: ["beacon_pulse"],
    },
    hotspots: [
      { id: "c2_line", label: "C2 Beacon", correct: true, hint: "주기적·외부향 통신" },
    ],
    success: "c2_seen",
    summary: "C2는 '리듬'으로 식별된다.",
  },
  {
    id: "exfiltration",
    title: "Exfiltration",
    sceneType: "generic",
    objective: "데이터가 빠져나가는 경로를 시각화한다.",
    visualMetaphor: "데이터 블록이 DLP 센서를 우회해 외부로 흘러간다",
    atoms: {
      environment: ["data_blocks", "dlp_sensor"],
      actors: ["exit_path"],
      tools: ["bypass_route"],
      actions: ["dlp_sensor_pulse", "egress_visualized"],
      effects: ["exit_glow"],
    },
    hotspots: [
      { id: "exit_path", label: "Exit Path", correct: true, hint: "DLP 센서를 비켜난 경로" },
    ],
    success: "exfil_seen",
    summary: "Exfiltration은 '빠져나간 경로'를 본다.",
  },
  {
    id: "impact",
    title: "Impact",
    sceneType: "generic",
    objective: "사고 영향 범위와 대응 시퀀스를 관찰한다.",
    visualMetaphor: "system meter가 흔들리고 server room의 blast radius가 커진다",
    atoms: {
      environment: ["system_meter", "server_room"],
      actors: ["backup_nodes"],
      tools: ["ir_timeline"],
      actions: ["stability_drop", "blast_radius", "containment_nodes"],
      effects: ["impact_pulse"],
    },
    hotspots: [
      { id: "containment_nodes", label: "Containment Nodes", correct: true, hint: "대응 시작 지점" },
    ],
    success: "impact_seen",
    summary: "Impact는 '폭발 반경 vs 대응 시퀀스'.",
  },
  {
    id: "wrap_up",
    title: "Case Wrap",
    sceneType: "generic",
    objective: "전체 단계의 연결을 한 화면에서 회고한다.",
    visualMetaphor: "14 stage가 작은 픽토그램으로 정렬되며 학습자 경로가 빛난다",
    atoms: {
      environment: ["stage_grid"],
      actors: [],
      tools: ["path_replay"],
      actions: ["recap"],
      effects: ["chain_glow"],
    },
    hotspots: [
      { id: "replay", label: "Replay Path", correct: true, hint: "전체 경로 다시 보기" },
    ],
    success: "wrap_done",
    summary: "공격은 단일 단계가 아니라 '연결된 14단계'다.",
  },
];

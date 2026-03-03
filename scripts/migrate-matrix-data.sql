-- ============================================================
-- migrate-matrix-data.sql
-- Generated from matrix-fallback.json
-- Run in Supabase SQL Editor (bypasses RLS)
-- ============================================================

BEGIN;

-- ============================================================
-- matrix_tactics  (14 rows)
-- ============================================================

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't1',
  'Reconnaissance',
  1,
  '{"ko":"정찰","zh":"侦察","hi":"टोह","ja":"偵察"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't2',
  'Resource Development',
  2,
  '{"ko":"자원 개발","zh":"资源开发","hi":"संसाधन विकास","ja":"リソース開発"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't3',
  'Initial Access',
  3,
  '{"ko":"초기 접근","zh":"初始访问","hi":"प्रारंभिक पहुँच","ja":"初期アクセス"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't4',
  'Execution',
  4,
  '{"ko":"실행","zh":"执行","hi":"निष्पादन","ja":"実行"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't5',
  'Persistence',
  5,
  '{"ko":"지속성","zh":"持久化","hi":"दृढ़ता","ja":"永続化"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't6',
  'Privilege Escalation',
  6,
  '{"ko":"권한 상승","zh":"权限提升","hi":"विशेषाधिकार वृद्धि","ja":"権限昇格"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't7',
  'Defense Evasion',
  7,
  '{"ko":"방어 회피","zh":"防御绕过","hi":"रक्षा चोरी","ja":"防御回避"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't8',
  'Credential Access',
  8,
  '{"ko":"자격 증명 접근","zh":"凭证访问","hi":"प्रमाण-पत्र पहुँच","ja":"認証情報アクセス"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't9',
  'Discovery',
  9,
  '{"ko":"탐색","zh":"发现","hi":"खोज","ja":"探索"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't10',
  'Lateral Movement',
  10,
  '{"ko":"측면 이동","zh":"横向移动","hi":"पार्श्व गति","ja":"横展開"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't11',
  'Collection',
  11,
  '{"ko":"수집","zh":"收集","hi":"संग्रह","ja":"収集"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't12',
  'Command and Control (C2)',
  12,
  '{"ko":"명령 및 제어","zh":"命令与控制","hi":"कमांड और नियंत्रण","ja":"C2通信"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't13',
  'Exfiltration',
  13,
  '{"ko":"유출","zh":"数据泄露","hi":"डेटा निष्कासन","ja":"データ持ち出し"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_tactics (id, title, sort_order, translations)
VALUES (
  't14',
  'Impact',
  14,
  '{"ko":"영향","zh":"影响","hi":"प्रभाव","ja":"インパクト"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

-- ============================================================
-- matrix_techniques  (62 rows)
-- ============================================================

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1595',
  'Active Scanning',
  FALSE,
  1,
  '{"ko":"능동 스캐닝","zh":"主动扫描","hi":"सक्रिय स्कैनिंग","ja":"アクティブスキャン"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1592',
  'Gather Victim Host Information',
  FALSE,
  2,
  '{"ko":"피해자 호스트 정보 수집","zh":"收集受害者主机信息","hi":"पीड़ित होस्ट जानकारी एकत्र","ja":"被害者ホスト情報収集"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1589',
  'Gather Victim Identity Information',
  FALSE,
  3,
  '{"ko":"피해자 신원 정보 수집","zh":"收集受害者身份信息","hi":"पीड़ित पहचान जानकारी एकत्र","ja":"被害者身元情報収集"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1590',
  'Gather Victim Network Information',
  FALSE,
  4,
  '{"ko":"피해자 네트워크 정보 수집","zh":"收集受害者网络信息","hi":"पीड़ित नेटवर्क जानकारी एकत्र","ja":"被害者ネットワーク情報収集"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1591',
  'Gather Victim Org Information',
  FALSE,
  5,
  '{"ko":"피해자 조직 정보 수집","zh":"收集受害者组织信息","hi":"पीड़ित संगठन जानकारी एकत्र","ja":"被害者組織情報収集"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1598',
  'Phishing for Information',
  FALSE,
  6,
  '{"ko":"정보 피싱","zh":"信息钓鱼","hi":"सूचना फ़िशिंग","ja":"情報フィッシング"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1597',
  'Search Closed Sources',
  FALSE,
  7,
  '{"ko":"비공개 소스 검색","zh":"搜索封闭源","hi":"बंद स्रोत खोज","ja":"非公開ソース検索"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1596',
  'Search Open Technical Databases',
  FALSE,
  8,
  '{"ko":"공개 기술 DB 검색","zh":"搜索公开技术数据库","hi":"सार्वजनिक तकनीकी DB खोज","ja":"公開技術DB検索"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't1',
  'T1593',
  'Search Open Websites/Domains',
  FALSE,
  9,
  '{"ko":"공개 웹사이트 검색","zh":"搜索公开网站/域名","hi":"सार्वजनिक वेबसाइट खोज","ja":"公開サイト/ドメイン検索"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't2',
  'T1583',
  'Acquire Infrastructure',
  FALSE,
  1,
  '{"ko":"인프라 획득","zh":"获取基础设施","hi":"बुनियादी ढांचा प्राप्त","ja":"インフラ取得"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't2',
  'T1586',
  'Compromise Accounts',
  FALSE,
  2,
  '{"ko":"계정 침해","zh":"入侵账户","hi":"खाता उल्लंघन","ja":"アカウント侵害"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't2',
  'T1587',
  'Develop Capabilities',
  FALSE,
  3,
  '{"ko":"역량 개발","zh":"开发能力","hi":"क्षमता विकास","ja":"能力開発"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't2',
  'T1588',
  'Obtain Capabilities',
  FALSE,
  4,
  '{"ko":"역량 획득","zh":"获取能力","hi":"क्षमता प्राप्त","ja":"能力取得"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't2',
  'T1608',
  'Stage Capabilities',
  FALSE,
  5,
  '{"ko":"역량 준비","zh":"预置能力","hi":"क्षमता तैयार","ja":"能力の準備"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't3',
  'T1566',
  'Phishing',
  FALSE,
  1,
  '{"ko":"피싱","zh":"网络钓鱼","hi":"फ़िशिंग","ja":"フィッシング"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't3',
  'T1195',
  'Supply Chain Compromise',
  FALSE,
  2,
  '{"ko":"공급망 침해","zh":"供应链入侵","hi":"आपूर्ति श्रृंखला उल्लंघन","ja":"サプライチェーン侵害"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't3',
  'T1078',
  'Valid Accounts',
  TRUE,
  3,
  '{"ko":"유효 계정","zh":"有效账户","hi":"वैध खाते","ja":"正規アカウント"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't3',
  'T1190',
  'Exploit Public-Facing Application',
  FALSE,
  4,
  '{"ko":"공개 앱 취약점 악용","zh":"利用公开应用漏洞","hi":"सार्वजनिक ऐप का शोषण","ja":"公開アプリの脆弱性悪用"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't3',
  'T1133',
  'External Remote Services',
  FALSE,
  5,
  '{"ko":"외부 원격 서비스","zh":"外部远程服务","hi":"बाहरी दूरस्थ सेवाएं","ja":"外部リモートサービス"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't4',
  'T1059',
  'Command and Scripting Interpreter',
  TRUE,
  1,
  '{"ko":"명령/스크립트 인터프리터","zh":"命令与脚本解释器","hi":"कमांड/स्क्रिप्ट इंटरप्रेटर","ja":"コマンド/スクリプトインタープリタ"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't4',
  'T1204',
  'User Execution',
  FALSE,
  2,
  '{"ko":"사용자 실행","zh":"用户执行","hi":"उपयोगकर्ता निष्पादन","ja":"ユーザー実行"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't4',
  'T1053',
  'Scheduled Task / Job',
  FALSE,
  3,
  '{"ko":"예약 작업","zh":"计划任务","hi":"निर्धारित कार्य","ja":"スケジュールタスク"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't4',
  'T1569',
  'System Services',
  FALSE,
  4,
  '{"ko":"시스템 서비스","zh":"系统服务","hi":"सिस्टम सेवाएं","ja":"システムサービス"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't5',
  'T1547',
  'Boot or Logon Autostart Execution',
  FALSE,
  1,
  '{"ko":"부팅/로그온 자동 실행","zh":"启动自启动执行","hi":"बूट/लॉगऑन स्वतः निष्पादन","ja":"起動・ログオン時自動実行"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't5',
  'T1136',
  'Create Account',
  FALSE,
  2,
  '{"ko":"계정 생성","zh":"创建账户","hi":"खाता बनाना","ja":"アカウント作成"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't5',
  'T1546',
  'Event Triggered Execution',
  FALSE,
  3,
  '{"ko":"이벤트 트리거 실행","zh":"事件触发执行","hi":"इवेंट ट्रिगर निष्पादन","ja":"イベントトリガー実行"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't5',
  'T1505',
  'Server Software Component',
  FALSE,
  4,
  '{"ko":"서버 소프트웨어 컴포넌트","zh":"服务器软件组件","hi":"सर्वर सॉफ़्टवेयर घटक","ja":"サーバーソフトウェアコンポーネント"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't6',
  'T1548',
  'Abuse Elevation Control Mechanism',
  FALSE,
  1,
  '{"ko":"권한 상승 메커니즘 남용","zh":"滥用提权机制","hi":"उन्नयन तंत्र का दुरुपयोग","ja":"昇格制御機構の悪用"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't6',
  'T1134',
  'Access Token Manipulation',
  FALSE,
  2,
  '{"ko":"액세스 토큰 조작","zh":"访问令牌操纵","hi":"एक्सेस टोकन हेरफेर","ja":"アクセストークン操作"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't6',
  'T1055',
  'Process Injection',
  TRUE,
  3,
  '{"ko":"프로세스 인젝션","zh":"进程注入","hi":"प्रोसेस इंजेक्शन","ja":"プロセスインジェクション"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't7',
  'T1027',
  'Obfuscated Files or Information',
  FALSE,
  1,
  '{"ko":"난독화 파일/정보","zh":"混淆文件或信息","hi":"अस्पष्ट फ़ाइलें/जानकारी","ja":"難読化ファイル/情報"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't7',
  'T1564',
  'Hide Artifacts',
  FALSE,
  2,
  '{"ko":"아티팩트 은닉","zh":"隐藏痕迹","hi":"आर्टिफैक्ट छुपाना","ja":"アーティファクトの隠蔽"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't7',
  'T1036',
  'Masquerading',
  FALSE,
  3,
  '{"ko":"위장","zh":"伪装","hi":"छद्मवेश","ja":"偽装"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't7',
  'T1562',
  'Impair Defenses',
  FALSE,
  4,
  '{"ko":"방어 약화","zh":"削弱防御","hi":"रक्षा को कमजोर करना","ja":"防御機能の妨害"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't8',
  'T1003',
  'OS Credential Dumping',
  TRUE,
  1,
  '{"ko":"OS 자격 증명 덤핑","zh":"OS凭证转储","hi":"OS क्रेडेंशियल डंपिंग","ja":"OS認証情報ダンプ"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't8',
  'T1110',
  'Brute Force',
  FALSE,
  2,
  '{"ko":"브루트 포스","zh":"暴力破解","hi":"ब्रूट फोर्स","ja":"ブルートフォース"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't8',
  'T1056',
  'Input Capture',
  FALSE,
  3,
  '{"ko":"입력 캡처","zh":"输入捕获","hi":"इनपुट कैप्चर","ja":"入力キャプチャ"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't9',
  'T1087',
  'Account Discovery',
  FALSE,
  1,
  '{"ko":"계정 탐색","zh":"账户发现","hi":"खाता खोज","ja":"アカウント探索"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't9',
  'T1046',
  'Network Discovery',
  FALSE,
  2,
  '{"ko":"네트워크 탐색","zh":"网络发现","hi":"नेटवर्क खोज","ja":"ネットワーク探索"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't9',
  'T1057',
  'Process Discovery',
  FALSE,
  3,
  '{"ko":"프로세스 탐색","zh":"进程发现","hi":"प्रोसेस खोज","ja":"プロセス探索"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't9',
  'T1082',
  'System Information Discovery',
  FALSE,
  4,
  '{"ko":"시스템 정보 탐색","zh":"系统信息发现","hi":"सिस्टम जानकारी खोज","ja":"システム情報探索"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't10',
  'T1021',
  'Remote Services',
  FALSE,
  1,
  '{"ko":"원격 서비스","zh":"远程服务","hi":"दूरस्थ सेवाएं","ja":"リモートサービス"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't10',
  'T1563',
  'Remote Service Session Hijacking',
  FALSE,
  2,
  '{"ko":"원격 세션 하이재킹","zh":"远程服务会话劫持","hi":"दूरस्थ सेवा सत्र अपहरण","ja":"リモートセッションハイジャック"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't10',
  'T1550',
  'Use Alternate Authentication Material',
  FALSE,
  3,
  '{"ko":"대체 인증 자료 사용","zh":"使用替代认证材料","hi":"वैकल्पिक प्रमाणीकरण सामग्री","ja":"代替認証情報の使用"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't11',
  'T1005',
  'Data from Local System',
  FALSE,
  1,
  '{"ko":"로컬 시스템 데이터","zh":"本地系统数据","hi":"स्थानीय सिस्टम डेटा","ja":"ローカルシステムデータ"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't11',
  'T1530',
  'Data from Cloud Storage',
  FALSE,
  2,
  '{"ko":"클라우드 저장소 데이터","zh":"云存储数据","hi":"क्लाउड स्टोरेज डेटा","ja":"クラウドストレージデータ"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't11',
  'T1114',
  'Email Collection',
  FALSE,
  3,
  '{"ko":"이메일 수집","zh":"邮件收集","hi":"ईमेल संग्रह","ja":"メール収集"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't11',
  'T1113',
  'Screen Capture',
  FALSE,
  4,
  '{"ko":"화면 캡처","zh":"屏幕截图","hi":"स्क्रीन कैप्चर","ja":"スクリーンキャプチャ"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't11',
  'T1560',
  'Archive Collected Data',
  FALSE,
  5,
  '{"ko":"수집 데이터 압축","zh":"压缩收集的数据","hi":"एकत्र डेटा संग्रह","ja":"収集データの圧縮"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't12',
  'T1071',
  'Application Layer Protocol',
  FALSE,
  1,
  '{"ko":"앱 계층 프로토콜","zh":"应用层协议","hi":"एप्लीकेशन परत प्रोटोकॉल","ja":"アプリケーション層プロトコル"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't12',
  'T1573',
  'Encrypted Channel',
  FALSE,
  2,
  '{"ko":"암호화 채널","zh":"加密通道","hi":"एन्क्रिप्टेड चैनल","ja":"暗号化チャネル"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't12',
  'T1090',
  'Proxy',
  FALSE,
  3,
  '{"ko":"프록시","zh":"代理","hi":"प्रॉक्सी","ja":"プロキシ"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't12',
  'T1568',
  'Dynamic Resolution',
  FALSE,
  4,
  '{"ko":"동적 해석","zh":"动态解析","hi":"गतिशील समाधान","ja":"動的解決"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't13',
  'T1041',
  'Exfiltration Over C2 Channel',
  FALSE,
  1,
  '{"ko":"C2 채널 유출","zh":"C2通道数据泄露","hi":"C2 चैनल से डेटा चोरी","ja":"C2チャネルからの持ち出し"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't13',
  'T1537',
  'Exfiltration to Cloud Storage',
  FALSE,
  2,
  '{"ko":"클라우드 저장소 유출","zh":"泄露至云存储","hi":"क्लाउड स्टोरेज में डेटा चोरी","ja":"クラウドストレージへの持ち出し"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't13',
  'T1567',
  'Exfiltration Over Web Service',
  FALSE,
  3,
  '{"ko":"웹 서비스 유출","zh":"通过Web服务泄露","hi":"वेब सेवा से डेटा चोरी","ja":"Webサービス経由の持ち出し"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't13',
  'T1052',
  'Exfiltration Over USB',
  FALSE,
  4,
  '{"ko":"USB 유출","zh":"通过USB泄露","hi":"USB से डेटा चोरी","ja":"USB経由の持ち出し"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't14',
  'T1486',
  'Data Encrypted for Impact (랜섬웨어)',
  TRUE,
  1,
  '{"ko":"랜섬웨어 암호화","zh":"勒索软件加密","hi":"रैनसमवेयर एन्क्रिप्शन","ja":"ランサムウェア暗号化"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't14',
  'T1561',
  'Disk Wipe',
  FALSE,
  2,
  '{"ko":"디스크 삭제","zh":"磁盘擦除","hi":"डिस्क वाइप","ja":"ディスク消去"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't14',
  'T1491',
  'Defacement',
  FALSE,
  3,
  '{"ko":"웹 변조","zh":"网站篡改","hi":"वेब विरूपण","ja":"ウェブ改ざん"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't14',
  'T1499',
  'Denial of Service',
  FALSE,
  4,
  '{"ko":"서비스 거부","zh":"拒绝服务","hi":"सेवा इनकार","ja":"サービス拒否"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

INSERT INTO matrix_techniques (tactic_id, tid, name, is_critical, sort_order, translations)
VALUES (
  't14',
  'T1496',
  'Resource Hijacking (크립토마이닝 등)',
  FALSE,
  5,
  '{"ko":"자원 탈취 (크립토마이닝)","zh":"资源劫持（挖矿等）","hi":"संसाधन अपहरण (क्रिप्टोमाइनिंग)","ja":"リソースハイジャック（仮想通貨採掘等）"}'::jsonb
)
ON CONFLICT (tid) DO UPDATE SET
  tactic_id    = EXCLUDED.tactic_id,
  name         = EXCLUDED.name,
  is_critical  = EXCLUDED.is_critical,
  sort_order   = EXCLUDED.sort_order,
  translations = EXCLUDED.translations;

-- ============================================================
-- matrix_sub_techniques  (154 rows)
-- ============================================================

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1595',
  'T1595.001',
  'Scanning IP Blocks',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1595',
  'T1595.002',
  'Vulnerability Scanning',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1595',
  'T1595.003',
  'Wordlist Scanning',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1592',
  'T1592.001',
  'Hardware',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1592',
  'T1592.002',
  'Software',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1592',
  'T1592.003',
  'Firmware',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1592',
  'T1592.004',
  'Client Configurations',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1589',
  'T1589.001',
  'Credentials',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1589',
  'T1589.002',
  'Email Addresses',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1589',
  'T1589.003',
  'Employee Names',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1590',
  'T1590.001',
  'Domain Properties',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1590',
  'T1590.002',
  'DNS',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1590',
  'T1590.003',
  'Network Trust Dependencies',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1590',
  'T1590.004',
  'Network Topology',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1590',
  'T1590.005',
  'IP Addresses',
  5
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1590',
  'T1590.006',
  'Network Security Appliances',
  6
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1591',
  'T1591.001',
  'Determine Physical Locations',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1591',
  'T1591.002',
  'Business Relationships',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1591',
  'T1591.003',
  'Identify Business Tempo',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1591',
  'T1591.004',
  'Identify Roles',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1598',
  'T1598.001',
  'Spearphishing Service',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1598',
  'T1598.002',
  'Spearphishing Attachment',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1598',
  'T1598.003',
  'Spearphishing Link',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1598',
  'T1598.004',
  'Spearphishing Voice',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1597',
  'T1597.001',
  'Threat Intel Vendors',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1597',
  'T1597.002',
  'Purchase Technical Data',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1596',
  'T1596.001',
  'DNS / Passive DNS',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1596',
  'T1596.002',
  'WHOIS',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1596',
  'T1596.003',
  'Digital Certificates',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1596',
  'T1596.004',
  'CDNs',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1596',
  'T1596.005',
  'Scan Databases',
  5
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1593',
  'T1593.001',
  'Social Media',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1593',
  'T1593.002',
  'Search Engines',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1593',
  'T1593.003',
  'Code Repositories',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1593',
  'T1593.004',
  'Search Threat Vendor Data',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1593',
  'T1593.005',
  'Search Victim-Owned Websites',
  5
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1583',
  'T1583.001',
  'Domains',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1583',
  'T1583.002',
  'DNS Server',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1583',
  'T1583.003',
  'VPS',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1583',
  'T1583.004',
  'Botnet',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1583',
  'T1583.005',
  'Web Services',
  5
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1583',
  'T1583.006',
  'Serverless',
  6
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1583',
  'T1583.007',
  'Malvertising',
  7
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1586',
  'T1586.001',
  'Social Media',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1586',
  'T1586.002',
  'Email',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1586',
  'T1586.003',
  'Cloud Accounts',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1587',
  'T1587.001',
  'Malware',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1587',
  'T1587.002',
  'Exploits',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1587',
  'T1587.003',
  'Code Signing Certificates',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1588',
  'T1588.001',
  'Malware',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1588',
  'T1588.002',
  'Tools',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1588',
  'T1588.003',
  'Exploits',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1588',
  'T1588.004',
  'Vulnerabilities',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1588',
  'T1588.005',
  'AI',
  5
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1608',
  'T1608.001',
  'Upload Malware',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1608',
  'T1608.002',
  'SEO Poisoning',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1608',
  'T1608.003',
  'Content Injection',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1608',
  'T1608.004',
  'Drive-by Compromise',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1566',
  'T1566.001',
  'Spearphishing Attachment',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1566',
  'T1566.002',
  'Spearphishing Link',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1566',
  'T1566.003',
  'Spearphishing via Service',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1566',
  'T1566.004',
  'Voice',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1195',
  'T1195.001',
  'Software Supply Chain',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1195',
  'T1195.002',
  'Software Dependencies',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1195',
  'T1195.003',
  'Hardware Supply Chain',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1078',
  'T1078.001',
  'Default',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1078',
  'T1078.002',
  'Domain',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1078',
  'T1078.003',
  'Local',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1078',
  'T1078.004',
  'Cloud',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1059',
  'T1059.001',
  'PowerShell',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1059',
  'T1059.003',
  'Windows CMD',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1059',
  'T1059.004',
  'Unix Shell',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1059',
  'T1059.006',
  'Python',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1059',
  'T1059.007',
  'JavaScript',
  5
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1059',
  'T1059.009',
  'Cloud API',
  6
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1059',
  'T1059.010',
  'Container CLI',
  7
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1204',
  'T1204.001',
  'Malicious File',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1204',
  'T1204.002',
  'Malicious Link',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1204',
  'T1204.003',
  'Malicious Image',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1053',
  'T1053.003',
  'Cron',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1053',
  'T1053.001',
  'At',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1053',
  'T1053.006',
  'Systemd',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1053',
  'T1053.005',
  'Scheduled Task',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1569',
  'T1569.001',
  'Launchctl',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1569',
  'T1569.002',
  'Windows Service',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1569',
  'T1569.003',
  'Systemctl',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1547',
  'T1547.001',
  'Registry Run Keys',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1547',
  'T1547.002',
  'Startup Folder',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1547',
  'T1547.004',
  'Winlogon Helper DLL',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1547',
  'T1547.011',
  'Login Items',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1547',
  'T1547.013',
  'XDG Autostart',
  5
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1136',
  'T1136.001',
  'Local',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1136',
  'T1136.002',
  'Domain',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1136',
  'T1136.003',
  'Cloud',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1546',
  'T1546.003',
  'WMI Subscription',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1546',
  'T1546.010',
  'AppInit DLL',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1546',
  'T1546.012',
  'Image File Execution Options',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1546',
  'T1546.013',
  'PowerShell Profile',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1505',
  'T1505.003',
  'Web Shell',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1505',
  'T1505.004',
  'IIS Components',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1505',
  'T1505.001',
  'SQL Stored Procedures',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1548',
  'T1548.002',
  'Bypass UAC',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1548',
  'T1548.003',
  'Sudo',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1548',
  'T1548.001',
  'Setuid',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1134',
  'T1134.001',
  'Token Impersonation',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1134',
  'T1134.005',
  'SID History Injection',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1055',
  'T1055.001',
  'DLL Injection',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1055',
  'T1055.012',
  'Process Hollowing',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1055',
  'T1055.004',
  'APC Injection',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1027',
  'T1027.002',
  'Packing',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1027',
  'T1027.013',
  'Encryption',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1027',
  'T1027.006',
  'HTML Smuggling',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1027',
  'T1027.014',
  'Polymorphic Code',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1564',
  'T1564.001',
  'Hidden Files',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1564',
  'T1564.002',
  'Hidden Users',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1564',
  'T1564.003',
  'Timestomp',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1036',
  'T1036.007',
  'Double Extension',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1036',
  'T1036.003',
  'Rename Legitimate Utility',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1562',
  'T1562.001',
  'Disable Security Tools',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1562',
  'T1562.002',
  'Disable Logging',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1562',
  'T1562.004',
  'Firewall Modification',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1003',
  'T1003.001',
  'LSASS Memory',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1003',
  'T1003.002',
  'SAM',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1003',
  'T1003.003',
  'NTDS.dit',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1003',
  'T1003.006',
  'DCSync',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1110',
  'T1110.003',
  'Password Spraying',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1110',
  'T1110.004',
  'Credential Stuffing',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1056',
  'T1056.001',
  'Keylogging',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1056',
  'T1056.002',
  'GUI Capture',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1087',
  'T1087.001',
  'Local',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1087',
  'T1087.002',
  'Domain',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1087',
  'T1087.003',
  'Cloud',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1046',
  'T1046.001',
  'Network Sniffing',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1046',
  'T1046.002',
  'Share Discovery',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1046',
  'T1046.003',
  'Service Discovery',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1021',
  'T1021.001',
  'RDP',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1021',
  'T1021.002',
  'SMB',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1021',
  'T1021.004',
  'SSH',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1021',
  'T1021.006',
  'WinRM',
  4
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1563',
  'T1563.002',
  'RDP Hijacking',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1563',
  'T1563.001',
  'SSH Hijacking',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1550',
  'T1550.002',
  'Pass-the-Hash',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1550',
  'T1550.003',
  'Pass-the-Ticket',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1071',
  'T1071.001',
  'Web (HTTP/HTTPS)',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1071',
  'T1071.004',
  'DNS',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1071',
  'T1071.003',
  'Mail',
  3
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1573',
  'T1573.001',
  'Symmetric',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1573',
  'T1573.002',
  'Asymmetric',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1090',
  'T1090.004',
  'Domain Fronting',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1090',
  'T1090.003',
  'Multi-hop',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1568',
  'T1568.002',
  'DGA',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1568',
  'T1568.001',
  'Fast Flux',
  2
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1486',
  'T1486.001',
  'Ransomware',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

INSERT INTO matrix_sub_techniques (technique_tid, sid, name, sort_order)
VALUES (
  'T1496',
  'T1496.001',
  'Cryptomining',
  1
)
ON CONFLICT (sid) DO UPDATE SET
  technique_tid = EXCLUDED.technique_tid,
  name          = EXCLUDED.name,
  sort_order    = EXCLUDED.sort_order;

COMMIT;

-- Summary:
--   matrix_tactics:        14 rows
--   matrix_techniques:     62 rows
--   matrix_sub_techniques: 154 rows
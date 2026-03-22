// ── T1566.001 Expert: 스피어피싱 첨부파일 — Purple Team & 제로데이 ──
import React from 'react';

// ── 자막 데이터 ──
export const subtitlesData = [
  { ko: "안녕하세요! 스피어피싱의 최고급 과정, Purple Team 운영과 제로데이 대응을 알아보겠습니다.", en: "Hello! Let's explore the expert-level course: Purple Team operations and zero-day response for spearphishing.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "Purple Team은 Red Team의 공격 기술과 Blue Team의 방어 역량을 하나의 팀으로 결합한 협업 모델입니다.", en: "Purple Team is a collaborative model combining Red Team's offensive skills and Blue Team's defensive capabilities.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "Red Team은 실제 공격자처럼 스피어피싱 캠페인을 시뮬레이션하여 조직의 약점을 테스트합니다.", en: "Red Team simulates spearphishing campaigns like real attackers to test an organization's weaknesses.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "Blue Team은 Red Team의 공격을 실시간으로 탐지·분석·대응하며, 탐지 규칙의 효과를 검증합니다.", en: "Blue Team detects, analyzes, and responds to Red Team attacks in real-time, validating detection rules.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "CVE-2021-40444는 MSHTML 엔진의 취약점으로, Office 문서에서 ActiveX 컨트롤을 통해 원격 코드를 실행합니다.", en: "CVE-2021-40444 is a vulnerability in the MSHTML engine that executes remote code via ActiveX controls in Office documents.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "CVE-2022-30190(Follina)은 ms-msdt: 프로토콜을 악용하여 매크로 없이 Word 문서만으로 코드를 실행합니다.", en: "CVE-2022-30190 (Follina) exploits the ms-msdt: protocol to execute code through Word documents without macros.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "CVE-2023-23397은 Outlook의 NTLM 릴레이 취약점으로, 이메일 수신만으로 인증 정보가 탈취됩니다.", en: "CVE-2023-23397 is an Outlook NTLM relay vulnerability that steals credentials just by receiving an email.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "제로데이 연구는 퍼징, 코드 오디트, 패치 디핑 등의 방법론으로 아직 알려지지 않은 취약점을 발견합니다.", en: "Zero-day research discovers unknown vulnerabilities through methodologies like fuzzing, code auditing, and patch diffing.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "자체 탐지 프레임워크 설계는 MITRE ATT&CK 매핑, 커버리지 분석, 우선순위 결정의 과정을 거칩니다.", en: "Custom detection framework design involves MITRE ATT&CK mapping, coverage analysis, and priority determination.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "위협 인텔리전스(CTI)를 탐지 규칙에 통합하면, 최신 공격 캠페인에 선제적으로 대응할 수 있습니다.", en: "Integrating Cyber Threat Intelligence (CTI) into detection rules enables proactive response to the latest attack campaigns.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "지금까지 전문가 과정이었습니다. Purple Team과 제로데이 대응은 보안의 최전선입니다. 수고하셨습니다!", en: "That concludes the expert course. Purple Team and zero-day response represent the frontline of security. Great work!", vi: null, ar: null, ja: null, zh: null, hi: null },
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides({ currentSlide, confettiParticles, onRestart, language = 'ko' }) {
  const T = {
    ko: {
      // Slide 1
      s1Title: '스피어피싱 첨부파일',
      s1Subtitle: 'Purple Team & 제로데이',
      s1Quote: '"보안의 최전선에서 공격과 방어를 함께 운영합니다."',
      // Slide 2
      s2Header: 'Purple Team 운영 모델',
      s2RedTitle: 'Red Team',
      s2RedDesc: '공격 시뮬레이션\nTTP 실행\n약점 발견',
      s2PurpleTitle: 'Purple Team',
      s2PurpleDesc: 'Red+Blue 협업\n실시간 피드백\n탐지 개선',
      s2BlueTitle: 'Blue Team',
      s2BlueDesc: '탐지·분석·대응\n규칙 검증\n방어 강화',
      s2Footer: '협업을 통한 보안 수준 극대화',
      // Slide 3
      s3Header: 'Red Team 피싱 시뮬레이션',
      s3Steps: [
        { label: '정찰', desc: 'OSINT 수집' },
        { label: '무기화', desc: '피싱 제작' },
        { label: '전달', desc: '이메일 발송' },
        { label: '익스플로잇', desc: '매크로 실행' },
        { label: 'C2', desc: '원격 제어' },
      ],
      s3Footer: 'Cyber Kill Chain 전 단계를 실제와 동일하게 시뮬레이션',
      // Slide 4
      s4Header: 'Blue Team 실시간 대응',
      s4Phases: [
        { phase: 'Detection', desc: 'SIEM 알림 수신 → Sigma 규칙 매칭 확인' },
        { phase: 'Analysis', desc: '이메일 헤더 포렌식 + 첨부파일 샌드박스 분석' },
        { phase: 'Containment', desc: '감염 호스트 네트워크 격리 + 계정 잠금' },
        { phase: 'Eradication', desc: '악성코드 제거 + 레지스트리 복원 + C2 차단' },
        { phase: 'Recovery', desc: '시스템 복구 + 모니터링 강화 + 탐지 규칙 업데이트' },
      ],
      // Slide 5
      s5Header: 'CVE-2021-40444: MSHTML 취약점',
      s5Vuln: '취약점',
      s5VulnDesc: 'MSHTML 엔진의 ActiveX 컨트롤 실행',
      s5Feature: '특징',
      s5FeatureDesc: '매크로 없이 Office 문서로 원격 코드 실행',
      s5Defense: '방어',
      s5DefenseDesc: '2021-09 패치 적용 + ActiveX 비활성화',
      // Slide 6
      s6Header: 'CVE-2022-30190: Follina',
      s6Desc: ' ms-msdt: 프로토콜로 원격 코드 실행',
      s6NoMacro: '매크로 없이',
      s6AttackTitle: '공격 벡터',
      s6AttackItems: ['Word 원격 템플릿 → HTML 로드', 'ms-msdt: URI 스킴 호출', 'MSDT 진단 도구로 PowerShell', '미리보기만으로도 실행 가능'],
      s6DefTitle: '방어 방법',
      s6DefItems: ['2022-06 패치 즉시 적용', 'MSDT 프로토콜 레지스트리 삭제', 'ASR 규칙 "Office 자식 프로세스 차단"', 'Sysmon ID 1 모니터링'],
      // Slide 7
      s7Header: 'CVE-2023-23397: Outlook NTLM 릴레이',
      s7Alert: '이메일 수신만으로 인증 정보 탈취!',
      s7Step1: '공격자가 캘린더 초대에 UNC 경로 삽입 (\\\\attacker\\share)',
      s7Step2: 'Outlook이 자동으로 UNC 경로에 NTLM 인증 시도',
      s7Step3: '공격자가 NTLM 해시 캡처 → Pass-the-Hash 공격',
      s7Def: '🛡️ 방어: 2023-03 패치 + 아웃바운드 445 포트 차단 + NTLM 비활성화',
      // Slide 8
      s8Header: '제로데이 연구 방법론',
      s8Card1Title: '퍼징 (Fuzzing)',
      s8Card1Desc: '대량의 비정상 입력으로\n크래시 유발점 발견',
      s8Card2Title: '패치 디핑',
      s8Card2Desc: '패치 전후 바이너리 비교로\n취약점 위치 역추적',
      s8Card3Title: '코드 오디트',
      s8Card3Desc: '수동 소스 코드 분석으로\n논리적 취약점 발견',
      // Slide 9
      s9Header: '자체 탐지 프레임워크 설계',
      s9Steps: [
        { title: 'ATT&CK 매핑', desc: '조직에 해당하는 기법을 MITRE ATT&CK에 매핑' },
        { title: '커버리지 분석', desc: '현재 탐지 규칙이 커버하는 영역 vs 빈 영역 식별' },
        { title: '우선순위 결정', desc: '위험도 × 발생 가능성 기반 탐지 개발 순서 결정' },
        { title: '규칙 개발·배포', desc: 'Sigma/YARA 작성 → 테스트 → SIEM 배포' },
      ],
      // Slide 10
      s10Header: '위협 인텔리전스(CTI) 통합',
      s10Strategic: '전략적 CTI',
      s10StrategicDesc: '경영진을 위한 위협 트렌드 브리핑',
      s10Tactical: '전술적 CTI',
      s10TacticalDesc: 'SOC를 위한 TTP, IOC 피드',
      s10Operational: '운영적 CTI',
      s10OperationalDesc: '실시간 위협 데이터 자동 수집·적용',
      // Slide 11
      s11Title: '전문가 과정을 완료했습니다!',
      s11Desc: 'Purple Team과 제로데이 대응은 보안의 최전선입니다.',
      s11Restart: '처음부터 다시 보기',
    },
    en: {
      s1Title: 'Spearphishing Attachment',
      s1Subtitle: 'Purple Team & Zero-Day',
      s1Quote: '"Operating offense and defense together at the security frontline."',
      s2Header: 'Purple Team Operating Model',
      s2RedTitle: 'Red Team',
      s2RedDesc: 'Attack Simulation\nTTP Execution\nWeakness Discovery',
      s2PurpleTitle: 'Purple Team',
      s2PurpleDesc: 'Red+Blue Collab\nReal-time Feedback\nDetection Improvement',
      s2BlueTitle: 'Blue Team',
      s2BlueDesc: 'Detect·Analyze·Respond\nRule Validation\nDefense Hardening',
      s2Footer: 'Maximizing security posture through collaboration',
      s3Header: 'Red Team Phishing Simulation',
      s3Steps: [
        { label: 'Recon', desc: 'OSINT Collection' },
        { label: 'Weaponize', desc: 'Phishing Craft' },
        { label: 'Deliver', desc: 'Email Send' },
        { label: 'Exploit', desc: 'Macro Exec' },
        { label: 'C2', desc: 'Remote Control' },
      ],
      s3Footer: 'Simulating the entire Cyber Kill Chain identically to real attacks',
      s4Header: 'Blue Team Real-Time Response',
      s4Phases: [
        { phase: 'Detection', desc: 'Receive SIEM alerts → Verify Sigma rule matches' },
        { phase: 'Analysis', desc: 'Email header forensics + Attachment sandbox analysis' },
        { phase: 'Containment', desc: 'Isolate infected host network + Lock accounts' },
        { phase: 'Eradication', desc: 'Remove malware + Restore registry + Block C2' },
        { phase: 'Recovery', desc: 'Restore systems + Enhance monitoring + Update detection rules' },
      ],
      s5Header: 'CVE-2021-40444: MSHTML Vulnerability',
      s5Vuln: 'Vulnerability',
      s5VulnDesc: 'ActiveX control execution in MSHTML engine',
      s5Feature: 'Feature',
      s5FeatureDesc: 'RCE via Office documents without macros',
      s5Defense: 'Defense',
      s5DefenseDesc: 'Apply 2021-09 patch + Disable ActiveX',
      s6Header: 'CVE-2022-30190: Follina',
      s6Desc: ' ms-msdt: protocol for remote code execution',
      s6NoMacro: 'No macros needed',
      s6AttackTitle: 'Attack Vector',
      s6AttackItems: ['Word remote template → HTML load', 'ms-msdt: URI scheme call', 'PowerShell via MSDT diagnostic tool', 'Executable even in preview mode'],
      s6DefTitle: 'Defense Method',
      s6DefItems: ['Apply 2022-06 patch immediately', 'Delete MSDT protocol from registry', 'ASR rule "Block Office child processes"', 'Sysmon Event ID 1 monitoring'],
      s7Header: 'CVE-2023-23397: Outlook NTLM Relay',
      s7Alert: 'Credential theft just by receiving an email!',
      s7Step1: 'Attacker inserts UNC path in calendar invite (\\\\attacker\\share)',
      s7Step2: 'Outlook auto-attempts NTLM auth to UNC path',
      s7Step3: 'Attacker captures NTLM hash → Pass-the-Hash attack',
      s7Def: '🛡️ Defense: 2023-03 patch + Block outbound port 445 + Disable NTLM',
      s8Header: 'Zero-Day Research Methodology',
      s8Card1Title: 'Fuzzing',
      s8Card1Desc: 'Finding crash points\nvia massive abnormal inputs',
      s8Card2Title: 'Patch Diffing',
      s8Card2Desc: 'Tracing vulnerability location\nby comparing pre/post-patch binaries',
      s8Card3Title: 'Code Audit',
      s8Card3Desc: 'Finding logical vulnerabilities\nvia manual source code analysis',
      s9Header: 'Custom Detection Framework Design',
      s9Steps: [
        { title: 'ATT&CK Mapping', desc: 'Map relevant techniques to MITRE ATT&CK' },
        { title: 'Coverage Analysis', desc: 'Identify covered vs uncovered detection areas' },
        { title: 'Priority Setting', desc: 'Determine development order by risk × likelihood' },
        { title: 'Rule Dev & Deploy', desc: 'Write Sigma/YARA → Test → Deploy to SIEM' },
      ],
      s10Header: 'Cyber Threat Intelligence (CTI) Integration',
      s10Strategic: 'Strategic CTI',
      s10StrategicDesc: 'Threat trend briefings for executives',
      s10Tactical: 'Tactical CTI',
      s10TacticalDesc: 'TTP and IOC feeds for SOC',
      s10Operational: 'Operational CTI',
      s10OperationalDesc: 'Automated real-time threat data collection & application',
      s11Title: 'Expert Course Complete!',
      s11Desc: 'Purple Team and zero-day response represent the frontline of security.',
      s11Restart: 'Watch Again from Start',
    },
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };
  const t = T[language] || T.ko;

  const stepIcons = ['fa-magnifying-glass', 'fa-envelope', 'fa-paper-plane', 'fa-bug', 'fa-server'];
  const stepColors = ['var(--accent-blue)', 'var(--accent-purple)', '#f59e0b', '#ef4444', '#ef4444'];
  const phaseIcons = ['fa-bell', 'fa-magnifying-glass', 'fa-lock', 'fa-trash-can', 'fa-rotate-right'];
  const phaseColors = ['var(--accent-blue)', 'var(--accent-purple)', '#f59e0b', '#ef4444', '#22c55e'];
  const fwStepColors = ['var(--accent-blue)', 'var(--accent-purple)', '#f59e0b', '#22c55e'];

  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.08) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-purple)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.3))' }}>
            <i className="fa-solid fa-star"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>{t.s1Title}<br /><span>{t.s1Subtitle}</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.s1Quote}</p>
        </div>
      </div>

      {/* Slide 2: Purple Team */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-people-group"></i> {t.s2Header}</h2>
        <div className="slide-content center-layout">
          <div className="grid-3" style={{ maxWidth: '1000px' }}>
            <div className="card anim-el delay-2" style={{ padding: '35px', borderTopColor: '#ef4444' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: '#ef4444' }}><i className="fa-solid fa-skull-crossbones"></i></div>
              <h3 style={{ color: '#ef4444' }}>{t.s2RedTitle}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', whiteSpace: 'pre-line' }}>{t.s2RedDesc}</p>
            </div>
            <div className="card anim-el delay-3" style={{ padding: '35px', borderTopColor: 'var(--accent-purple)' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: 'var(--accent-purple)' }}><i className="fa-solid fa-handshake"></i></div>
              <h3 style={{ color: 'var(--accent-purple)' }}>{t.s2PurpleTitle}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', whiteSpace: 'pre-line' }}>{t.s2PurpleDesc}</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '35px', borderTopColor: 'var(--accent-blue)' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-shield-halved"></i></div>
              <h3 style={{ color: 'var(--accent-blue)' }}>{t.s2BlueTitle}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', whiteSpace: 'pre-line' }}>{t.s2BlueDesc}</p>
            </div>
          </div>
          <p className="anim-el delay-5" style={{ marginTop: '30px', fontSize: '22px' }}>Purple = <span style={{ color: '#ef4444' }}>Red</span> + <span style={{ color: 'var(--accent-blue)' }}>Blue</span> → {t.s2Footer}</p>
        </div>
      </div>

      {/* Slide 3: Red Team 시뮬레이션 */}
      <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-crosshairs"></i> {t.s3Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {t.s3Steps.map((step, i) => (
              <React.Fragment key={i}>
                <div className={`anim-el delay-${i + 2}`} style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: 'var(--card-bg)', border: `3px solid ${stepColors[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <i className={`fa-solid ${stepIcons[i]}`} style={{ fontSize: '28px', color: stepColors[i] }}></i>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{step.label}</p>
                  <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
                {i < 4 && <i className="fa-solid fa-chevron-right anim-fade" style={{ fontSize: '18px', color: 'var(--text-muted)', animation: `simpleFade 0.5s forwards ${0.8 + i * 0.3}s` }}></i>}
              </React.Fragment>
            ))}
          </div>
          <p className="anim-el delay-7" style={{ marginTop: '35px', fontSize: '20px', color: 'var(--text-muted)' }}>{t.s3Footer}</p>
        </div>
      </div>

      {/* Slide 4: Blue Team 대응 */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-shield"></i> {t.s4Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px' }}>
            {t.s4Phases.map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '18px 25px', borderRadius: '14px', border: '1px solid var(--border)', borderLeft: `4px solid ${phaseColors[i]}` }}>
                <i className={`fa-solid ${phaseIcons[i]}`} style={{ fontSize: '24px', color: phaseColors[i], minWidth: '30px' }}></i>
                <div>
                  <strong style={{ color: phaseColors[i], fontSize: '18px' }}>{item.phase}</strong>
                  <p style={{ fontSize: '18px', marginTop: '3px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 5: CVE-2021-40444 */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-file-excel"></i> {t.s5Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>{t.s5Vuln}</strong> {t.s5VulnDesc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>{t.s5Feature}</strong> {t.s5FeatureDesc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>{t.s5Defense}</strong> {t.s5DefenseDesc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '25px', border: '2px solid rgba(239,68,68,0.2)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', lineHeight: '2' }}>
                <span style={{ color: 'var(--accent-blue)' }}>1.</span> .docx → Open<br />
                <span style={{ color: 'var(--accent-purple)' }}>2.</span> URL → MSHTML<br />
                <span style={{ color: '#ef4444' }}>3.</span> ActiveX Render<br />
                <span style={{ color: '#ef4444' }}>4.</span> .cab Download<br />
                <span style={{ color: '#ef4444' }}>5.</span> DLL Sideload → <strong>RCE</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 6: CVE-2022-30190 Follina */}
      <div className={`slide ${currentSlide === 5 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-virus"></i> {t.s6Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '35px' }}><strong style={{ color: '#ef4444' }}>{t.s6NoMacro}</strong>{t.s6Desc}</p>
          <div className="grid-2" style={{ maxWidth: '850px' }}>
            <div className="card anim-el delay-3" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444' }}>{t.s6AttackTitle}</h3>
              <div style={{ fontSize: '18px', marginTop: '15px', lineHeight: '1.8', textAlign: 'left' }}>
                {t.s6AttackItems.map((item, i) => <p key={i}>• {item}</p>)}
              </div>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: '#22c55e' }}>
              <h3 style={{ color: '#22c55e' }}>{t.s6DefTitle}</h3>
              <div style={{ fontSize: '18px', marginTop: '15px', lineHeight: '1.8', textAlign: 'left' }}>
                {t.s6DefItems.map((item, i) => <p key={i}>• {item}</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 7: CVE-2023-23397 */}
      <div className={`slide ${currentSlide === 6 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-envelope-circle-xmark"></i> {t.s7Header}</h2>
        <div className="slide-content center-layout">
          <div className="callout anim-el delay-2" style={{ maxWidth: '850px', padding: '35px', fontSize: '22px' }}>
            <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '26px', marginBottom: '20px' }}>{t.s7Alert}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="anim-el delay-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>①</span>
                <span>{t.s7Step1}</span>
              </div>
              <div className="anim-el delay-4" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>②</span>
                <span>{t.s7Step2}</span>
              </div>
              <div className="anim-el delay-5" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>③</span>
                <span>{t.s7Step3}</span>
              </div>
            </div>
            <p className="anim-el delay-6" style={{ marginTop: '20px', fontSize: '18px', color: '#22c55e' }}>{t.s7Def}</p>
          </div>
        </div>
      </div>

      {/* Slide 8: 제로데이 연구 */}
      <div className={`slide ${currentSlide === 7 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-flask"></i> {t.s8Header}</h2>
        <div className="slide-content center-layout">
          <div className="grid-3" style={{ maxWidth: '1000px' }}>
            <div className="card anim-el delay-2" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-burst"></i></div>
              <h3>{t.s8Card1Title}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', whiteSpace: 'pre-line' }}>{t.s8Card1Desc}</p>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '50px' }}><i className="fa-solid fa-code-compare"></i></div>
              <h3>{t.s8Card2Title}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', whiteSpace: 'pre-line' }}>{t.s8Card2Desc}</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '35px 25px', borderTopColor: '#ef4444' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: '#ef4444' }}><i className="fa-solid fa-file-magnifying-glass"></i></div>
              <h3>{t.s8Card3Title}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', whiteSpace: 'pre-line' }}>{t.s8Card3Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 9: 탐지 프레임워크 설계 */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-sitemap"></i> {t.s9Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '800px' }}>
            {t.s9Steps.map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '20px 25px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: fwStepColors[i], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <strong style={{ fontSize: '20px' }}>{item.title}</strong>
                  <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '3px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 10: CTI 통합 */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-globe"></i> {t.s10Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>{t.s10Strategic}</strong> {t.s10StrategicDesc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>{t.s10Tactical}</strong> {t.s10TacticalDesc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>{t.s10Operational}</strong> {t.s10OperationalDesc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="card anim-scale scale-delay-3" style={{ padding: '30px', borderTopColor: 'var(--accent-purple)' }}>
              <h3 style={{ color: 'var(--accent-purple)', marginBottom: '15px' }}>Diamond Model</h3>
              <div style={{ fontSize: '18px', lineHeight: '2', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold' }}>Adversary</p>
                <p>↙ &nbsp;&nbsp;&nbsp;&nbsp; ↘</p>
                <p><strong>Capability</strong> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Infrastructure</strong></p>
                <p>↘ &nbsp;&nbsp;&nbsp;&nbsp; ↙</p>
                <p style={{ fontWeight: 'bold' }}>Victim</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 11: Outro */}
      <div className={`slide ${currentSlide === 10 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)' }}>
        {confettiParticles && confettiParticles.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%', width: p.size + 'px', height: p.size + 'px', backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : '2px', opacity: p.opacity, transform: `rotate(${p.rotation}deg)`, transition: 'all 0.5s ease-out' }} />
        ))}
        <div className="slide-content center-layout" style={{ zIndex: 1 }}>
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-green)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.3))' }}>
            <i className="fa-solid fa-trophy"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>{t.s11Title}</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.s11Desc}</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-purple)', color: 'var(--accent-purple)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(168,85,247,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> {t.s11Restart}
          </button>
        </div>
      </div>
    </>
  );
}

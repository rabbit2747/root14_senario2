// ── T1566.001 Advanced: 스피어피싱 첨부파일 — 탐지 우회와 재탐지 ──
import React from 'react';

// ── 자막 데이터 ──
export const subtitlesData = [
  { ko: "안녕하세요! 스피어피싱 공격의 탐지 우회 기법과 이를 다시 잡아내는 재탐지 전략을 알아보겠습니다.", en: "Hello! Let's explore detection evasion techniques in spearphishing attacks and re-detection strategies to catch them.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "EDR은 프로세스·파일·네트워크 활동을 실시간 모니터링합니다. 하지만 공격자는 다양한 우회 기법을 사용합니다.", en: "EDR monitors process, file, and network activity in real-time. However, attackers use various evasion techniques.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "AMSI(Anti-Malware Scan Interface)는 스크립트 실행 시 내용을 백신에 전달합니다. 공격자는 이를 메모리 패치로 무력화합니다.", en: "AMSI (Anti-Malware Scan Interface) passes script contents to antivirus during execution. Attackers neutralize it via memory patching.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "매크로 난독화는 변수명 치환, 문자열 분할, 환경변수 조합 등으로 정적 탐지를 회피하는 기법입니다.", en: "Macro obfuscation evades static detection through variable renaming, string splitting, and environment variable concatenation.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "LOLBins(Living-off-the-Land Binaries)는 Windows 기본 도구를 악용합니다. mshta, certutil, bitsadmin 등이 대표적입니다.", en: "LOLBins (Living-off-the-Land Binaries) abuse built-in Windows tools. mshta, certutil, and bitsadmin are prime examples.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "Sigma YAML 고급 작성법: 필터 조합, 타임윈도우, 부정 조건(not) 등을 활용하여 정밀한 탐지 규칙을 작성합니다.", en: "Advanced Sigma YAML: Write precise detection rules using filter combinations, time windows, and negation conditions.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "YARA 고급 규칙: 해시 매칭, 엔트로피 체크, 바이너리 패턴, 파일 크기 조건 등 복합 조건으로 탐지합니다.", en: "Advanced YARA rules: Detect using complex conditions like hash matching, entropy checks, binary patterns, and file size.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "우회 공격에 대한 재탐지 전략: 기존 규칙의 빈틈을 찾고, 행위 기반 + 이상 탐지를 결합합니다.", en: "Re-detection strategy for evasion attacks: Find gaps in existing rules and combine behavioral and anomaly detection.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "Detection Engineering은 탐지 규칙의 전체 수명주기를 관리합니다: 설계 → 구현 → 테스트 → 배포 → 성능 측정.", en: "Detection Engineering manages the full lifecycle of detection rules: Design → Implement → Test → Deploy → Measure.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "Threat Hunting은 규칙에 의존하지 않고, 가설 기반으로 능동적으로 위협을 탐색하는 활동입니다.", en: "Threat Hunting is the proactive, hypothesis-driven search for threats without relying on automated rules.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "지금까지 탐지 우회와 재탐지 전략이었습니다. 공격과 방어의 끝없는 진화를 이해하는 것이 핵심입니다!", en: "That concludes detection evasion and re-detection strategies. Understanding the endless evolution of attack and defense is key!", vi: null, ar: null, ja: null, zh: null, hi: null },
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides({ currentSlide, confettiParticles, onRestart, language = 'ko' }) {
  const T = {
    ko: {
      // Slide 1
      titleMain: '스피어피싱 첨부파일',
      titleSub: '탐지 우회와 재탐지',
      introQuote: '"우회를 이해해야 더 강력한 탐지를 만들 수 있습니다."',
      // Slide 2
      slide2Header: 'EDR 우회 기법 개론',
      edrWhat: 'EDR이란?',
      edrWhatDesc: '엔드포인트 탐지 및 대응, 프로세스·파일·네트워크 실시간 모니터링',
      edrBypass: '우회 원리',
      edrBypassDesc: '커널 후킹 해제, DLL 언로드, 직접 시스콜로 API 호출 우회',
      edrResult: '결과',
      edrResultDesc: 'EDR이 행위를 관찰하지 못하면 로그 자체가 생성되지 않음',
      edrTechniques: '주요 우회 기법',
      // Slide 3
      slide3Header: 'AMSI 바이패스 분석',
      amsiDesc: 'Anti-Malware Scan Interface: 스크립트 실행 시',
      amsiDescBold: '백신에게 내용 전달',
      normalOp: '정상 동작',
      normalDetect: '탐지: "악성 스크립트!"',
      normalBlock: '실행 차단 ✅',
      bypassTitle: '바이패스 후',
      bypassPatch: 'AMSI 패치',
      bypassClean: '항상 CLEAN',
      bypassExec: '악성코드 실행 성공 ❌',
      // Slide 4
      slide4Header: '매크로 난독화 기법',
      varRename: '변수명 치환',
      strSplit: '문자열 분할',
      envConcat: '환경변수 조합',
      obfuscNote: '→ 정적 탐지(YARA, 시그니처)를 회피하기 위한 핵심 기법',
      // Slide 5
      slide5Header: 'LOLBins: 시스템 도구 악용',
      lolDesc: 'Living-off-the-Land:',
      lolDescBold: 'Windows 기본 도구',
      lolDescEnd: '를 공격에 악용',
      mshtaDesc: 'HTA 파일 실행 → 스크립트 코드 우회 실행',
      certutilDesc: '인증서 도구를 악용한 파일 다운로드/디코딩',
      bitsadminDesc: '백그라운드 파일 전송 서비스로 악성코드 다운로드',
      regsvr32Desc: 'COM 스크립틀릿 실행으로 AppLocker 우회',
      // Slide 6
      slide6Header: 'Sigma YAML 고급 작성법',
      // Slide 7
      slide7Header: 'YARA 고급 규칙',
      hashMatch: '해시 매칭',
      hashMatchDesc: 'import "hash" → 특정 파일 해시 탐지',
      entropyCheck: '엔트로피 체크',
      entropyCheckDesc: 'math.entropy(0, filesize) > 7.0 → 패킹 탐지',
      binaryPattern: '바이너리 패턴',
      binaryPatternDesc: 'PE 헤더 + 코드 시그니처 복합 조건',
      // Slide 8
      slide8Header: '우회 공격 재탐지 전략',
      absenceDetect: '부재 탐지',
      absenceDesc: '예상 로그가 없는 경우 탐지\n예: Sysmon ID 7 이미지 로드\n없이 ntdll.dll 시스콜 발생',
      behaviorChain: '행위 체이닝',
      behaviorDesc: '단일 이벤트가 아닌\n행위 시퀀스로 탐지\n예: 문서→쉘→다운로드→실행',
      anomalyDetect: '이상 탐지',
      anomalyDesc: '정상 패턴 베이스라인 대비\n편차를 자동 감지\n예: 새벽 3시 PowerShell 실행',
      networkAnalysis: '네트워크 분석',
      networkDesc: 'DNS 비콘, JA3 핑거프린트,\n비정상 트래픽 패턴 탐지\n예: 주기적 DNS 쿼리 간격',
      // Slide 9
      slide9Header: 'Detection Engineering 워크플로',
      deDesign: '설계',
      deDesignDesc: '가설 수립',
      deImpl: '구현',
      deImplDesc: 'Sigma/YARA',
      deTest: '테스트',
      deTestDesc: 'Atomic Red',
      deDeploy: '배포',
      deDeployDesc: 'SIEM 적용',
      deMeasure: '측정',
      deMeasureDesc: '성능 평가',
      deCycleNote: '→ 순환 프로세스: 공격 기법 진화에 맞춰 지속적으로 규칙 개선',
      // Slide 10
      slide10Header: 'Threat Hunting: 능동적 위협 탐색',
      thDef: '정의',
      thDefDesc: '알림에 의존하지 않고 가설 기반으로 위협을 능동 탐색',
      thProcess: '프로세스',
      thProcessDesc: '가설 수립 → 데이터 수집 → 분석 → 결과 공유',
      thDiff: '차이점',
      thDiffDesc: 'Detection = 자동 알림 / Hunting = 수동 탐색',
      thHypothesis: '헌팅 가설 예시',
      thHypothesisText: '"Office에서 생성된 PowerShell 프로세스 중\nBase64 인코딩 명령을 사용하는 것이\n지난 30일간 존재할 것이다"',
      // Outro
      outroTitle: '재생이 완료되었습니다.',
      outroSub: '공격과 방어의 끝없는 진화를 이해하는 것이 핵심입니다!',
      restartBtn: '처음부터 다시 보기',
    },
    en: {
      titleMain: 'Spearphishing Attachment',
      titleSub: 'Detection Evasion & Re-Detection',
      introQuote: '"Understanding evasion leads to stronger detection."',
      slide2Header: 'EDR Evasion Overview',
      edrWhat: 'What is EDR?',
      edrWhatDesc: 'Endpoint Detection & Response — real-time monitoring of processes, files, and network',
      edrBypass: 'Evasion Principle',
      edrBypassDesc: 'Kernel hook unhooking, DLL unloading, direct syscalls to bypass API calls',
      edrResult: 'Result',
      edrResultDesc: 'If EDR cannot observe behavior, logs are never generated',
      edrTechniques: 'Key Evasion Techniques',
      slide3Header: 'AMSI Bypass Analysis',
      amsiDesc: 'Anti-Malware Scan Interface: During script execution,',
      amsiDescBold: 'content is passed to antivirus',
      normalOp: 'Normal Operation',
      normalDetect: 'Detected: "Malicious script!"',
      normalBlock: 'Execution blocked ✅',
      bypassTitle: 'After Bypass',
      bypassPatch: 'AMSI Patched',
      bypassClean: 'Always CLEAN',
      bypassExec: 'Malware execution succeeds ❌',
      slide4Header: 'Macro Obfuscation Techniques',
      varRename: 'Variable Renaming',
      strSplit: 'String Splitting',
      envConcat: 'Environment Variable Concat',
      obfuscNote: '→ Key techniques to evade static detection (YARA, signatures)',
      slide5Header: 'LOLBins: Abusing System Tools',
      lolDesc: 'Living-off-the-Land: Abusing',
      lolDescBold: 'built-in Windows tools',
      lolDescEnd: 'for attacks',
      mshtaDesc: 'HTA file execution → bypass script code execution',
      certutilDesc: 'Abusing certificate tool for file download/decoding',
      bitsadminDesc: 'Background file transfer service for malware download',
      regsvr32Desc: 'COM scriptlet execution to bypass AppLocker',
      slide6Header: 'Advanced Sigma YAML Writing',
      slide7Header: 'Advanced YARA Rules',
      hashMatch: 'Hash Matching',
      hashMatchDesc: 'import "hash" → Detect specific file hashes',
      entropyCheck: 'Entropy Check',
      entropyCheckDesc: 'math.entropy(0, filesize) > 7.0 → Detect packing',
      binaryPattern: 'Binary Patterns',
      binaryPatternDesc: 'PE header + code signature complex conditions',
      slide8Header: 'Re-Detection Strategies for Evasion',
      absenceDetect: 'Absence Detection',
      absenceDesc: 'Detect when expected logs are missing\ne.g., ntdll.dll syscall without\nSysmon ID 7 image load',
      behaviorChain: 'Behavior Chaining',
      behaviorDesc: 'Detect via behavior sequences,\nnot single events\ne.g., Doc→Shell→Download→Execute',
      anomalyDetect: 'Anomaly Detection',
      anomalyDesc: 'Auto-detect deviations from\nnormal baseline patterns\ne.g., PowerShell at 3 AM',
      networkAnalysis: 'Network Analysis',
      networkDesc: 'DNS beacons, JA3 fingerprints,\nabnormal traffic pattern detection\ne.g., periodic DNS query intervals',
      slide9Header: 'Detection Engineering Workflow',
      deDesign: 'Design',
      deDesignDesc: 'Hypothesis',
      deImpl: 'Implement',
      deImplDesc: 'Sigma/YARA',
      deTest: 'Test',
      deTestDesc: 'Atomic Red',
      deDeploy: 'Deploy',
      deDeployDesc: 'SIEM Apply',
      deMeasure: 'Measure',
      deMeasureDesc: 'Performance',
      deCycleNote: '→ Cyclic process: Continuously improve rules as attack techniques evolve',
      slide10Header: 'Threat Hunting: Proactive Threat Search',
      thDef: 'Definition',
      thDefDesc: 'Proactively search for threats based on hypotheses, not alerts',
      thProcess: 'Process',
      thProcessDesc: 'Hypothesis → Data Collection → Analysis → Share Results',
      thDiff: 'Difference',
      thDiffDesc: 'Detection = Automated Alerts / Hunting = Manual Search',
      thHypothesis: 'Hunting Hypothesis Example',
      thHypothesisText: '"Among PowerShell processes spawned by Office,\nthose using Base64-encoded commands\nhave existed in the past 30 days"',
      outroTitle: 'Playback Complete.',
      outroSub: 'Understanding the endless evolution of attack and defense is key!',
      restartBtn: 'Watch Again from the Start',
    },
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };
  const t = T[language] || T.ko;

  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.06) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: '#ef4444', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.3))' }}>
            <i className="fa-solid fa-eye-slash"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>{t.titleMain}<br /><span>{t.titleSub}</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.introQuote}</p>
        </div>
      </div>

      {/* Slide 2: EDR 우회 개론 */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-ghost"></i> {t.slide2Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>{t.edrWhat}</strong> {t.edrWhatDesc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>{t.edrBypass}</strong> {t.edrBypassDesc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>{t.edrResult}</strong> {t.edrResultDesc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="card anim-scale scale-delay-3" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>{t.edrTechniques}</h3>
              <div style={{ fontSize: '18px', lineHeight: '2.2', textAlign: 'left' }}>
                <p>• User-mode hooking 해제</p>
                <p>• Direct syscall (ntdll.dll 직접 호출)</p>
                <p>• DLL sideloading</p>
                <p>• Process hollowing</p>
                <p>• AMSI 메모리 패치</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 3: AMSI 바이패스 */}
      <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-ban"></i> {t.slide3Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '35px' }}>{t.amsiDesc} <strong style={{ color: '#ef4444' }}>{t.amsiDescBold}</strong></p>
          <div className="grid-2" style={{ maxWidth: '900px' }}>
            <div className="card anim-el delay-3" style={{ padding: '30px', borderTopColor: '#22c55e' }}>
              <h3 style={{ color: '#22c55e' }}>{t.normalOp}</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', marginTop: '15px', lineHeight: '2', textAlign: 'left' }}>
                PowerShell → <span style={{ color: '#22c55e' }}>AMSI</span> → Defender<br />
                → <span style={{ color: '#22c55e' }}>{t.normalDetect}</span><br />
                → <span style={{ color: '#22c55e' }}>{t.normalBlock}</span>
              </div>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444' }}>{t.bypassTitle}</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', marginTop: '15px', lineHeight: '2', textAlign: 'left' }}>
                PowerShell → <span style={{ color: '#ef4444' }}>{t.bypassPatch}</span><br />
                → AmsiScanBuffer = <span style={{ color: '#ef4444' }}>{t.bypassClean}</span><br />
                → <span style={{ color: '#ef4444' }}>{t.bypassExec}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 4: 매크로 난독화 */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-mask"></i> {t.slide4Header}</h2>
        <div className="slide-content center-layout">
          <div className="grid-3" style={{ maxWidth: '1000px' }}>
            <div className="card anim-el delay-2" style={{ padding: '30px' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-shuffle"></i></div>
              <h3 style={{ fontSize: '20px' }}>{t.varRename}</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>Shell → xKz9_q</div>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '30px' }}>
              <div className="card-icon" style={{ fontSize: '50px' }}><i className="fa-solid fa-scissors"></i></div>
              <h3 style={{ fontSize: '20px' }}>{t.strSplit}</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>"pow" & "ersh" & "ell"</div>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: '#ef4444' }}><i className="fa-solid fa-puzzle-piece"></i></div>
              <h3 style={{ fontSize: '20px' }}>{t.envConcat}</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>Environ("COMSPEC")</div>
            </div>
          </div>
          <p className="anim-el delay-5" style={{ marginTop: '35px', fontSize: '20px', color: '#ef4444' }}>{t.obfuscNote}</p>
        </div>
      </div>

      {/* Slide 5: LOLBins */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-house-chimney"></i> {t.slide5Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '35px' }}>{t.lolDesc} <strong style={{ color: '#ef4444' }}>{t.lolDescBold}</strong>{t.lolDescEnd}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px' }}>
            {[
              { tool: 'mshta.exe', desc: t.mshtaDesc, color: '#ef4444' },
              { tool: 'certutil.exe', desc: t.certutilDesc, color: 'var(--accent-purple)' },
              { tool: 'bitsadmin.exe', desc: t.bitsadminDesc, color: 'var(--accent-blue)' },
              { tool: 'regsvr32.exe', desc: t.regsvr32Desc, color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 3}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '20px 25px', borderRadius: '14px', border: '1px solid var(--border)', borderLeft: `4px solid ${item.color}` }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', color: item.color, fontWeight: 'bold', minWidth: '140px' }}>{item.tool}</span>
                <span style={{ fontSize: '20px' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 6: Sigma YAML 고급 */}
      <div className={`slide ${currentSlide === 5 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-code"></i> {t.slide6Header}</h2>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-2" style={{ maxWidth: '800px', background: 'var(--card-bg)', borderRadius: '14px', padding: '30px', border: '2px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', lineHeight: '2' }}>
              <span style={{ color: '#ef4444' }}>detection:</span><br />
              &nbsp;&nbsp;<span style={{ color: 'var(--accent-blue)' }}>selection_parent:</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;ParentImage|endswith:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- '\WINWORD.EXE'<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- '\EXCEL.EXE'<br />
              &nbsp;&nbsp;<span style={{ color: 'var(--accent-purple)' }}>selection_child:</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;Image|endswith:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- '\mshta.exe'<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- '\certutil.exe'<br />
              &nbsp;&nbsp;<span style={{ color: '#ef4444' }}>filter:</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;User|contains: 'SYSTEM'<br />
              &nbsp;&nbsp;<span style={{ color: '#22c55e' }}>condition:</span> selection_parent <span style={{ color: '#22c55e' }}>and</span> selection_child <span style={{ color: '#ef4444' }}>and not</span> filter
            </div>
          </div>
        </div>
      </div>

      {/* Slide 7: YARA 고급 규칙 */}
      <div className={`slide ${currentSlide === 6 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-microscope"></i> {t.slide7Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong>{t.hashMatch}</strong> {t.hashMatchDesc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong>{t.entropyCheck}</strong> {t.entropyCheckDesc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong>{t.binaryPattern}</strong> {t.binaryPatternDesc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '25px', border: '2px solid var(--border)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', lineHeight: '2' }}>
                <span style={{ color: 'var(--accent-blue)' }}>import</span> "pe"<br />
                <span style={{ color: 'var(--accent-blue)' }}>import</span> "math"<br /><br />
                <span style={{ color: 'var(--accent-blue)' }}>rule</span> packed_dropper {'{'}<br />
                &nbsp;&nbsp;<span style={{ color: '#ef4444' }}>condition:</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;pe.is_pe <span style={{ color: 'var(--accent-blue)' }}>and</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;math.entropy(0, filesize) {'>'} 7.0 <span style={{ color: 'var(--accent-blue)' }}>and</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;pe.number_of_sections {'<'} 3<br />
                {'}'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 8: 재탐지 전략 */}
      <div className={`slide ${currentSlide === 7 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-rotate"></i> {t.slide8Header}</h2>
        <div className="slide-content center-layout">
          <div className="grid-2" style={{ maxWidth: '900px' }}>
            <div className="card anim-el delay-2" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444' }}><i className="fa-solid fa-eye-slash"></i> {t.absenceDetect}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{t.absenceDesc}</p>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '30px' }}>
              <h3 style={{ color: 'var(--accent-purple)' }}><i className="fa-solid fa-chart-line"></i> {t.behaviorChain}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{t.behaviorDesc}</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: 'var(--accent-blue)' }}>
              <h3 style={{ color: 'var(--accent-blue)' }}><i className="fa-solid fa-wave-square"></i> {t.anomalyDetect}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{t.anomalyDesc}</p>
            </div>
            <div className="card anim-el delay-5" style={{ padding: '30px', borderTopColor: '#f59e0b' }}>
              <h3 style={{ color: '#f59e0b' }}><i className="fa-solid fa-network-wired"></i> {t.networkAnalysis}</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{t.networkDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 9: Detection Engineering */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-wrench"></i> {t.slide9Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: 'fa-lightbulb', label: t.deDesign, desc: t.deDesignDesc, color: 'var(--accent-blue)' },
              { icon: 'fa-code', label: t.deImpl, desc: t.deImplDesc, color: 'var(--accent-purple)' },
              { icon: 'fa-flask', label: t.deTest, desc: t.deTestDesc, color: '#f59e0b' },
              { icon: 'fa-rocket', label: t.deDeploy, desc: t.deDeployDesc, color: '#22c55e' },
              { icon: 'fa-chart-bar', label: t.deMeasure, desc: t.deMeasureDesc, color: '#ef4444' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className={`anim-el delay-${i + 2}`} style={{ textAlign: 'center', minWidth: '110px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--card-bg)', border: `3px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <i className={`fa-solid ${step.icon}`} style={{ fontSize: '30px', color: step.color }}></i>
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{step.label}</p>
                  <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
                {i < 4 && <i className="fa-solid fa-chevron-right anim-fade" style={{ fontSize: '20px', color: 'var(--text-muted)', animation: `simpleFade 0.5s forwards ${0.8 + i * 0.3}s` }}></i>}
              </React.Fragment>
            ))}
          </div>
          <p className="anim-el delay-7" style={{ marginTop: '40px', fontSize: '20px', color: 'var(--text-muted)' }}>{t.deCycleNote}</p>
        </div>
      </div>

      {/* Slide 10: Threat Hunting */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-binoculars"></i> {t.slide10Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>{t.thDef}</strong> {t.thDefDesc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>{t.thProcess}</strong> {t.thProcessDesc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#22c55e' }}>{t.thDiff}</strong> {t.thDiffDesc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="callout anim-scale scale-delay-3" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: 'var(--accent-blue)' }}>{t.thHypothesis}</h3>
              <div style={{ fontSize: '18px', lineHeight: '2', textAlign: 'left', whiteSpace: 'pre-line' }}>
                <p>{t.thHypothesisText}</p>
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
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>{t.outroTitle}</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.outroSub}</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(56,189,248,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> {t.restartBtn}
          </button>
        </div>
      </div>
    </>
  );
}

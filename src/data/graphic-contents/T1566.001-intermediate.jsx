// ── T1566.001 Intermediate: 스피어피싱 첨부파일 — 탐지와 방어 ──
import React from 'react';

// ── 자막 데이터 ──
export const subtitlesData = [
  "안녕하세요! 스피어피싱 첨부파일의 탐지와 방어 기법을 본격적으로 알아보겠습니다.",
  "보안 환경이 잘 갖춰진 조직에서는 스피어피싱이 어떻게 차단되는지, 실패 시나리오부터 살펴보겠습니다.",
  "이메일 게이트웨이는 SPF/DKIM/DMARC를 검증하고, 의심스러운 첨부파일을 샌드박스에서 분석합니다.",
  "Microsoft의 ASR(Attack Surface Reduction) 규칙은 Office 매크로의 자식 프로세스 생성을 원천 차단합니다.",
  "Sysmon은 Windows 시스템 모니터링 도구로, 이벤트 ID별로 프로세스 생성부터 네트워크 연결까지 기록합니다.",
  "Sysmon 이벤트 ID 1은 프로세스 생성, ID 3은 네트워크 연결, ID 11은 파일 생성을 추적합니다.",
  "YARA 규칙은 파일 내 특정 패턴을 탐지하는 도구입니다. 문자열과 조건을 조합하여 악성코드를 식별합니다.",
  "Sigma 규칙은 SIEM 독립적인 탐지 로직입니다. YAML 형식으로 작성하여 Splunk, ELK 등에 변환 적용합니다.",
  "이메일 헤더 포렌식은 Received 체인을 역추적하여 실제 발신 서버를 특정하고 위조 여부를 판단합니다.",
  "공격자 관점에서 방어자 관점으로 전환하면, 각 공격 단계마다 탐지 포인트가 보이기 시작합니다.",
  "GPO(그룹 정책)로 매크로를 조직 전체에서 비활성화하고, ASR 규칙으로 프로세스 생성을 차단합니다.",
  "이메일 게이트웨이에서 위험 확장자를 차단하고, 외부 메일에 경고 배너를 표시하여 사용자 경각심을 높입니다.",
  "종합하면, 탐지(Sysmon+YARA+Sigma) + 차단(ASR+GPO+게이트웨이) + 교육의 3축 방어가 핵심입니다.",
  "지금까지 스피어피싱 탐지와 방어였습니다. 탐지 규칙을 이해하면 공격을 미리 막을 수 있습니다!"
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides({ currentSlide, confettiParticles, onRestart }) {
  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-blue)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.3))' }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>스피어피싱 첨부파일<br /><span>탐지와 방어</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>"탐지 규칙을 이해하면, 공격을 미리 막을 수 있습니다."</p>
        </div>
      </div>

      {/* Slide 2: 보안 환경에서의 피싱 실패 */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-ban"></i> 보안 환경에서 피싱이 실패하는 이유</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: 'fa-envelope-circle-check', label: '게이트웨이\nSPF 검증', color: 'var(--accent-blue)', result: '✅ 차단' },
              { icon: 'fa-box', label: '샌드박스\n첨부 분석', color: 'var(--accent-purple)', result: '✅ 탐지' },
              { icon: 'fa-ban', label: 'ASR 규칙\n매크로 차단', color: '#ef4444', result: '✅ 차단' },
              { icon: 'fa-bell', label: 'EDR 알림\n이상 행위', color: '#f59e0b', result: '✅ 경고' },
            ].map((step, i) => (
              <div key={i} className={`card anim-el delay-${i + 2}`} style={{ padding: '30px 20px', minWidth: '160px', textAlign: 'center' }}>
                <div style={{ fontSize: '50px', color: step.color, marginBottom: '15px' }}><i className={`fa-solid ${step.icon}`}></i></div>
                <p style={{ fontSize: '18px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{step.label}</p>
                <p style={{ fontSize: '16px', color: '#22c55e', fontWeight: 'bold', marginTop: '10px' }}>{step.result}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 3: 이메일 게이트웨이 */}
      <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-door-open"></i> 이메일 게이트웨이 심층 분석</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>1단계</strong> SPF/DKIM/DMARC 검증 → 발신자 정당성 확인</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>2단계</strong> 첨부파일 확장자 필터링 → .exe, .scr 등 차단</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>3단계</strong> 샌드박스 실행 → 의심 파일을 격리 환경에서 동적 분석</li>
              <li className="anim-el delay-5" style={{ fontSize: '22px' }}><strong style={{ color: '#22c55e' }}>4단계</strong> URL 리라이팅 → 본문 링크를 안전 검사 경유로 변환</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'linear-gradient(180deg, rgba(56,189,248,0.05), rgba(168,85,247,0.05))', borderRadius: '16px', padding: '30px', border: '2px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div style={{ padding: '12px 30px', background: 'rgba(56,189,248,0.1)', borderRadius: '10px', fontSize: '18px' }}>📧 외부 메일 도착</div>
                <i className="fa-solid fa-arrow-down" style={{ color: 'var(--text-muted)' }}></i>
                <div style={{ padding: '12px 30px', background: 'rgba(168,85,247,0.1)', borderRadius: '10px', fontSize: '18px' }}>🔍 게이트웨이 검사</div>
                <i className="fa-solid fa-arrow-down" style={{ color: 'var(--text-muted)' }}></i>
                <div style={{ padding: '12px 30px', background: 'rgba(34,197,94,0.1)', borderRadius: '10px', fontSize: '18px' }}>✅ 안전한 메일 전달</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 4: ASR 규칙 */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-shield-virus"></i> ASR 규칙: 매크로 자식 프로세스 차단</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '35px' }}>Attack Surface Reduction — Microsoft Defender의 <strong style={{ color: '#ef4444' }}>선제 방어</strong> 기능</p>
          <div className="anim-scale scale-delay-2" style={{ maxWidth: '850px', background: 'var(--card-bg)', borderRadius: '16px', padding: '35px', border: '2px solid rgba(239,68,68,0.2)', textAlign: 'left' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '17px', lineHeight: '2.2' }}>
              <span style={{ color: 'var(--text-muted)' }}>// GUID: d4f940ab-401b-4efc-aadc-ad5f3c50688a</span><br />
              <span style={{ color: '#ef4444' }}>Rule:</span> Office 앱이 자식 프로세스 생성 차단<br /><br />
              <span style={{ color: 'var(--accent-blue)' }}>WINWORD.EXE</span> → <span style={{ color: '#ef4444' }}>❌ cmd.exe 차단</span><br />
              <span style={{ color: 'var(--accent-blue)' }}>EXCEL.EXE</span> → <span style={{ color: '#ef4444' }}>❌ powershell.exe 차단</span><br />
              <span style={{ color: 'var(--accent-blue)' }}>OUTLOOK.EXE</span> → <span style={{ color: '#ef4444' }}>❌ mshta.exe 차단</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 5: Sysmon 소개 */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-eye"></i> Sysmon: 시스템 모니터링의 핵심</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>Sysmon이란?</strong> Microsoft Sysinternals 제공 시스템 모니터링 드라이버</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>특징</strong> 프로세스, 네트워크, 파일, 레지스트리 이벤트 상세 기록</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>핵심 가치</strong> 기본 Windows 로그보다 훨씬 상세한 원격 측정</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="card anim-scale scale-delay-3" style={{ padding: '35px', borderTopColor: 'var(--accent-blue)' }}>
              <h3 style={{ marginBottom: '20px' }}>핵심 이벤트 ID</h3>
              <div style={{ fontSize: '20px', lineHeight: '2.2', textAlign: 'left' }}>
                <p><strong style={{ color: 'var(--accent-blue)' }}>ID 1</strong> — 프로세스 생성</p>
                <p><strong style={{ color: 'var(--accent-purple)' }}>ID 3</strong> — 네트워크 연결</p>
                <p><strong style={{ color: '#ef4444' }}>ID 7</strong> — 이미지 로드 (DLL)</p>
                <p><strong style={{ color: '#22c55e' }}>ID 11</strong> — 파일 생성</p>
                <p><strong style={{ color: '#f59e0b' }}>ID 13</strong> — 레지스트리 변경</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 6: Sysmon 이벤트 상세 */}
      <div className={`slide ${currentSlide === 5 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-list-check"></i> Sysmon 이벤트로 공격 추적</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '850px' }}>
            {[
              { id: 'ID 1', desc: 'WINWORD.EXE → cmd.exe /c powershell 프로세스 트리 포착', color: 'var(--accent-blue)' },
              { id: 'ID 3', desc: 'powershell.exe → 185.x.x.x:443 외부 C2 서버 연결 탐지', color: 'var(--accent-purple)' },
              { id: 'ID 11', desc: 'C:\\Users\\temp\\payload.exe 악성 파일 드롭 기록', color: '#ef4444' },
              { id: 'ID 13', desc: 'HKCU\\...\\Run\\Persistence 자동 실행 레지스트리 등록 탐지', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '20px 25px', borderRadius: '14px', border: '1px solid var(--border)', borderLeft: `4px solid ${item.color}` }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', color: item.color, fontWeight: 'bold', minWidth: '50px' }}>{item.id}</span>
                <span style={{ fontSize: '20px' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 7: YARA 규칙 */}
      <div className={`slide ${currentSlide === 6 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-virus-slash"></i> YARA: 파일 패턴 기반 탐지</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ fontSize: '26px' }}>YARA란?</strong> 파일 내 문자열·바이너리 패턴을 매칭하는 규칙 엔진</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ fontSize: '26px' }}>구성 요소</strong> strings (탐지 문자열) + condition (매칭 조건)</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ fontSize: '26px' }}>활용처</strong> 악성코드 분류, 사고 대응, 위협 헌팅</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '25px', border: '2px solid var(--border)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', lineHeight: '2' }}>
                <span style={{ color: 'var(--accent-blue)' }}>rule</span> spearphish_macro {'{'}<br />
                &nbsp;&nbsp;<span style={{ color: 'var(--accent-purple)' }}>strings:</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;$a = <span style={{ color: '#22c55e' }}>"Auto_Open"</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;$b = <span style={{ color: '#22c55e' }}>"Shell"</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;$c = <span style={{ color: '#22c55e' }}>"powershell"</span><br />
                &nbsp;&nbsp;<span style={{ color: '#ef4444' }}>condition:</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;2 of ($a, $b, $c)<br />
                {'}'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 8: Sigma 규칙 */}
      <div className={`slide ${currentSlide === 7 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-file-code"></i> Sigma: SIEM 독립 탐지 규칙</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '30px' }}>하나의 YAML 규칙으로 Splunk, ELK, QRadar 등 <strong style={{ color: 'var(--accent-blue)' }}>모든 SIEM에 적용</strong></p>
          <div className="anim-scale scale-delay-2" style={{ maxWidth: '750px', background: 'var(--card-bg)', borderRadius: '14px', padding: '30px', border: '2px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '17px', lineHeight: '2' }}>
              <span style={{ color: 'var(--accent-blue)' }}>title:</span> Office Macro Spawns Shell<br />
              <span style={{ color: 'var(--accent-blue)' }}>status:</span> experimental<br />
              <span style={{ color: 'var(--accent-purple)' }}>logsource:</span><br />
              &nbsp;&nbsp;category: process_creation<br />
              &nbsp;&nbsp;product: windows<br />
              <span style={{ color: '#ef4444' }}>detection:</span><br />
              &nbsp;&nbsp;selection:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;ParentImage|endswith: '\WINWORD.EXE'<br />
              &nbsp;&nbsp;&nbsp;&nbsp;Image|endswith: '\cmd.exe'<br />
              &nbsp;&nbsp;condition: selection<br />
              <span style={{ color: '#f59e0b' }}>level:</span> high
            </div>
          </div>
        </div>
      </div>

      {/* Slide 9: 이메일 헤더 포렌식 */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-magnifying-glass-chart"></i> 이메일 헤더 포렌식</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>Received 체인</strong> 아래→위 순서로 서버 경유 경로 역추적</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>시간 분석</strong> 각 홉 간 타임스탬프로 지연·우회 확인</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>위조 감지</strong> From과 Return-Path 불일치, SPF fail 확인</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '25px', border: '2px solid rgba(239,68,68,0.2)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', lineHeight: '2' }}>
                <span style={{ color: 'var(--accent-blue)' }}>Received:</span> from gateway.company<br />
                <span style={{ color: 'var(--accent-blue)' }}>Received:</span> from <span style={{ color: '#ef4444' }}>relay.evil-domain</span><br />
                <span style={{ color: '#ef4444' }}>From:</span> CEO &lt;ceo@company.com&gt;<br />
                <span style={{ color: '#ef4444' }}>Return-Path:</span> &lt;bounce@evil.com&gt;<br />
                <span style={{ color: '#22c55e' }}>SPF:</span> <span style={{ color: '#ef4444' }}>FAIL</span>
              </div>
              <p style={{ fontSize: '14px', color: '#ef4444', marginTop: '15px', fontWeight: 'bold' }}>→ From과 Return-Path 불일치 = 위조!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 10: 공격→방어 관점 전환 */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-arrows-rotate"></i> 공격자 → 방어자 관점 전환</h2>
        <div className="slide-content center-layout">
          <div className="grid-2" style={{ maxWidth: '900px' }}>
            <div className="card anim-el delay-2" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '20px' }}><i className="fa-solid fa-skull"></i> 공격 단계</h3>
              <div style={{ fontSize: '18px', lineHeight: '2.2', textAlign: 'left' }}>
                <p>① 이메일 발송</p>
                <p>② 문서 열기 유도</p>
                <p>③ 매크로 실행</p>
                <p>④ C2 연결</p>
                <p>⑤ 횡이동</p>
              </div>
            </div>
            <div className="card anim-el delay-3" style={{ padding: '30px', borderTopColor: '#22c55e' }}>
              <h3 style={{ color: '#22c55e', marginBottom: '20px' }}><i className="fa-solid fa-shield"></i> 탐지 포인트</h3>
              <div style={{ fontSize: '18px', lineHeight: '2.2', textAlign: 'left' }}>
                <p>① 게이트웨이 SPF 검증</p>
                <p>② 첨부 샌드박스 분석</p>
                <p>③ ASR 매크로 차단</p>
                <p>④ Sysmon ID 3 네트워크</p>
                <p>⑤ EDR 이상 행위 탐지</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 11: GPO 매크로 차단 */}
      <div className={`slide ${currentSlide === 10 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-gears"></i> GPO: 조직 전체 매크로 비활성화</h2>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-2" style={{ maxWidth: '800px', background: 'var(--card-bg)', borderRadius: '16px', padding: '35px', border: '2px solid var(--border)' }}>
            <div style={{ fontSize: '20px', lineHeight: '2.5', textAlign: 'left' }}>
              <p className="anim-el delay-2"><i className="fa-solid fa-folder-open" style={{ color: 'var(--accent-blue)', marginRight: '10px' }}></i> <strong>경로:</strong> 컴퓨터 구성 → 관리 템플릿 → Microsoft Office</p>
              <p className="anim-el delay-3"><i className="fa-solid fa-toggle-on" style={{ color: '#22c55e', marginRight: '10px' }}></i> <strong>설정:</strong> "VBA 매크로 알림 없이 비활성화"</p>
              <p className="anim-el delay-4"><i className="fa-solid fa-shield-halved" style={{ color: '#ef4444', marginRight: '10px' }}></i> <strong>ASR:</strong> "Office 앱이 자식 프로세스 생성 차단" 활성화</p>
              <p className="anim-el delay-5"><i className="fa-solid fa-bell" style={{ color: '#f59e0b', marginRight: '10px' }}></i> <strong>알림:</strong> 외부 메일 수신 시 경고 배너 표시</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 12: 게이트웨이 방어 설정 */}
      <div className={`slide ${currentSlide === 11 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-filter"></i> 이메일 게이트웨이 방어 설정</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '800px' }}>
            {[
              { icon: 'fa-ban', text: '위험 확장자 차단: .exe, .scr, .js, .vbs, .bat, .hta', color: '#ef4444' },
              { icon: 'fa-lock', text: '암호화 ZIP 첨부 차단 (매크로 은닉 방지)', color: 'var(--accent-purple)' },
              { icon: 'fa-envelope-circle-check', text: 'SPF/DKIM/DMARC 정책: reject 모드', color: 'var(--accent-blue)' },
              { icon: 'fa-triangle-exclamation', text: '외부 메일 경고 배너: "[EXTERNAL]" 접두사', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '20px 30px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '26px', color: item.color, minWidth: '35px' }}></i>
                <span style={{ fontSize: '20px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 13: 3축 방어 종합 */}
      <div className={`slide ${currentSlide === 12 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-triangle-exclamation"></i> 3축 방어 전략 종합</h2>
        <div className="slide-content center-layout">
          <div className="grid-3">
            <div className="card anim-el delay-2" style={{ padding: '35px 25px', borderTopColor: 'var(--accent-blue)' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-search"></i></div>
              <h3>탐지 (Detect)</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8' }}>Sysmon 모니터링<br />YARA 파일 스캔<br />Sigma 로그 분석</p>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '60px' }}><i className="fa-solid fa-hand"></i></div>
              <h3>차단 (Block)</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8' }}>ASR 규칙 적용<br />GPO 매크로 비활성화<br />게이트웨이 필터링</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '35px 25px', borderTopColor: '#22c55e' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: '#22c55e' }}><i className="fa-solid fa-graduation-cap"></i></div>
              <h3>교육 (Train)</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8' }}>피싱 시뮬레이션<br />의심 신고 프로세스<br />정기 보안 교육</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 14: Outro */}
      <div className={`slide ${currentSlide === 13 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)' }}>
        {confettiParticles && confettiParticles.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%', width: p.size + 'px', height: p.size + 'px', backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : '2px', opacity: p.opacity, transform: `rotate(${p.rotation}deg)`, transition: 'all 0.5s ease-out' }} />
        ))}
        <div className="slide-content center-layout" style={{ zIndex: 1 }}>
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-green)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.3))' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>재생이 완료되었습니다.</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>탐지 규칙을 이해하면 공격을 미리 막을 수 있습니다!</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(56,189,248,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> 처음부터 다시 보기
          </button>
        </div>
      </div>
    </>
  );
}

// ── T1566.001 Advanced: 스피어피싱 첨부파일 — 탐지 우회와 재탐지 ──
import React from 'react';

// ── 자막 데이터 ──
export const subtitlesData = [
  "안녕하세요! 스피어피싱 공격의 탐지 우회 기법과 이를 다시 잡아내는 재탐지 전략을 알아보겠습니다.",
  "EDR은 프로세스·파일·네트워크 활동을 실시간 모니터링합니다. 하지만 공격자는 다양한 우회 기법을 사용합니다.",
  "AMSI(Anti-Malware Scan Interface)는 스크립트 실행 시 내용을 백신에 전달합니다. 공격자는 이를 메모리 패치로 무력화합니다.",
  "매크로 난독화는 변수명 치환, 문자열 분할, 환경변수 조합 등으로 정적 탐지를 회피하는 기법입니다.",
  "LOLBins(Living-off-the-Land Binaries)는 Windows 기본 도구를 악용합니다. mshta, certutil, bitsadmin 등이 대표적입니다.",
  "Sigma YAML 고급 작성법: 필터 조합, 타임윈도우, 부정 조건(not) 등을 활용하여 정밀한 탐지 규칙을 작성합니다.",
  "YARA 고급 규칙: 해시 매칭, 엔트로피 체크, 바이너리 패턴, 파일 크기 조건 등 복합 조건으로 탐지합니다.",
  "우회 공격에 대한 재탐지 전략: 기존 규칙의 빈틈을 찾고, 행위 기반 + 이상 탐지를 결합합니다.",
  "Detection Engineering은 탐지 규칙의 전체 수명주기를 관리합니다: 설계 → 구현 → 테스트 → 배포 → 성능 측정.",
  "Threat Hunting은 규칙에 의존하지 않고, 가설 기반으로 능동적으로 위협을 탐색하는 활동입니다.",
  "지금까지 탐지 우회와 재탐지 전략이었습니다. 공격과 방어의 끝없는 진화를 이해하는 것이 핵심입니다!"
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides({ currentSlide, confettiParticles, onRestart }) {
  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.06) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: '#ef4444', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.3))' }}>
            <i className="fa-solid fa-eye-slash"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>스피어피싱 첨부파일<br /><span>탐지 우회와 재탐지</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>"우회를 이해해야 더 강력한 탐지를 만들 수 있습니다."</p>
        </div>
      </div>

      {/* Slide 2: EDR 우회 개론 */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-ghost"></i> EDR 우회 기법 개론</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>EDR이란?</strong> 엔드포인트 탐지 및 대응, 프로세스·파일·네트워크 실시간 모니터링</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>우회 원리</strong> 커널 후킹 해제, DLL 언로드, 직접 시스콜로 API 호출 우회</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>결과</strong> EDR이 행위를 관찰하지 못하면 로그 자체가 생성되지 않음</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="card anim-scale scale-delay-3" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>주요 우회 기법</h3>
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
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-ban"></i> AMSI 바이패스 분석</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '35px' }}>Anti-Malware Scan Interface: 스크립트 실행 시 <strong style={{ color: '#ef4444' }}>백신에게 내용 전달</strong></p>
          <div className="grid-2" style={{ maxWidth: '900px' }}>
            <div className="card anim-el delay-3" style={{ padding: '30px', borderTopColor: '#22c55e' }}>
              <h3 style={{ color: '#22c55e' }}>정상 동작</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', marginTop: '15px', lineHeight: '2', textAlign: 'left' }}>
                PowerShell → <span style={{ color: '#22c55e' }}>AMSI</span> → Defender<br />
                → <span style={{ color: '#22c55e' }}>탐지: "악성 스크립트!"</span><br />
                → <span style={{ color: '#22c55e' }}>실행 차단 ✅</span>
              </div>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444' }}>바이패스 후</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', marginTop: '15px', lineHeight: '2', textAlign: 'left' }}>
                PowerShell → <span style={{ color: '#ef4444' }}>AMSI 패치</span><br />
                → AmsiScanBuffer = <span style={{ color: '#ef4444' }}>항상 CLEAN</span><br />
                → <span style={{ color: '#ef4444' }}>악성코드 실행 성공 ❌</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 4: 매크로 난독화 */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-mask"></i> 매크로 난독화 기법</h2>
        <div className="slide-content center-layout">
          <div className="grid-3" style={{ maxWidth: '1000px' }}>
            <div className="card anim-el delay-2" style={{ padding: '30px' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-shuffle"></i></div>
              <h3 style={{ fontSize: '20px' }}>변수명 치환</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>Shell → xKz9_q</div>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '30px' }}>
              <div className="card-icon" style={{ fontSize: '50px' }}><i className="fa-solid fa-scissors"></i></div>
              <h3 style={{ fontSize: '20px' }}>문자열 분할</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>"pow" & "ersh" & "ell"</div>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: '#ef4444' }}><i className="fa-solid fa-puzzle-piece"></i></div>
              <h3 style={{ fontSize: '20px' }}>환경변수 조합</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>Environ("COMSPEC")</div>
            </div>
          </div>
          <p className="anim-el delay-5" style={{ marginTop: '35px', fontSize: '20px', color: '#ef4444' }}>→ 정적 탐지(YARA, 시그니처)를 회피하기 위한 핵심 기법</p>
        </div>
      </div>

      {/* Slide 5: LOLBins */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-house-chimney"></i> LOLBins: 시스템 도구 악용</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '35px' }}>Living-off-the-Land: <strong style={{ color: '#ef4444' }}>Windows 기본 도구</strong>를 공격에 악용</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px' }}>
            {[
              { tool: 'mshta.exe', desc: 'HTA 파일 실행 → 스크립트 코드 우회 실행', color: '#ef4444' },
              { tool: 'certutil.exe', desc: '인증서 도구를 악용한 파일 다운로드/디코딩', color: 'var(--accent-purple)' },
              { tool: 'bitsadmin.exe', desc: '백그라운드 파일 전송 서비스로 악성코드 다운로드', color: 'var(--accent-blue)' },
              { tool: 'regsvr32.exe', desc: 'COM 스크립틀릿 실행으로 AppLocker 우회', color: '#f59e0b' },
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
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-code"></i> Sigma YAML 고급 작성법</h2>
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
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-microscope"></i> YARA 고급 규칙</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong>해시 매칭</strong> import "hash" → 특정 파일 해시 탐지</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong>엔트로피 체크</strong> math.entropy(0, filesize) {'>'} 7.0 → 패킹 탐지</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong>바이너리 패턴</strong> PE 헤더 + 코드 시그니처 복합 조건</li>
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
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-rotate"></i> 우회 공격 재탐지 전략</h2>
        <div className="slide-content center-layout">
          <div className="grid-2" style={{ maxWidth: '900px' }}>
            <div className="card anim-el delay-2" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444' }}><i className="fa-solid fa-eye-slash"></i> 부재 탐지</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8' }}>예상 로그가 <strong>없는</strong> 경우 탐지<br />예: Sysmon ID 7 이미지 로드<br />없이 ntdll.dll 시스콜 발생</p>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '30px' }}>
              <h3 style={{ color: 'var(--accent-purple)' }}><i className="fa-solid fa-chart-line"></i> 행위 체이닝</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8' }}>단일 이벤트가 아닌<br /><strong>행위 시퀀스</strong>로 탐지<br />예: 문서→쉘→다운로드→실행</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: 'var(--accent-blue)' }}>
              <h3 style={{ color: 'var(--accent-blue)' }}><i className="fa-solid fa-wave-square"></i> 이상 탐지</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8' }}>정상 패턴 베이스라인 대비<br /><strong>편차</strong>를 자동 감지<br />예: 새벽 3시 PowerShell 실행</p>
            </div>
            <div className="card anim-el delay-5" style={{ padding: '30px', borderTopColor: '#f59e0b' }}>
              <h3 style={{ color: '#f59e0b' }}><i className="fa-solid fa-network-wired"></i> 네트워크 분석</h3>
              <p style={{ fontSize: '18px', marginTop: '10px', lineHeight: '1.8' }}>DNS 비콘, JA3 핑거프린트,<br /><strong>비정상 트래픽 패턴</strong> 탐지<br />예: 주기적 DNS 쿼리 간격</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 9: Detection Engineering */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-wrench"></i> Detection Engineering 워크플로</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: 'fa-lightbulb', label: '설계', desc: '가설 수립', color: 'var(--accent-blue)' },
              { icon: 'fa-code', label: '구현', desc: 'Sigma/YARA', color: 'var(--accent-purple)' },
              { icon: 'fa-flask', label: '테스트', desc: 'Atomic Red', color: '#f59e0b' },
              { icon: 'fa-rocket', label: '배포', desc: 'SIEM 적용', color: '#22c55e' },
              { icon: 'fa-chart-bar', label: '측정', desc: '성능 평가', color: '#ef4444' },
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
          <p className="anim-el delay-7" style={{ marginTop: '40px', fontSize: '20px', color: 'var(--text-muted)' }}>→ 순환 프로세스: 공격 기법 진화에 맞춰 지속적으로 규칙 개선</p>
        </div>
      </div>

      {/* Slide 10: Threat Hunting */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-binoculars"></i> Threat Hunting: 능동적 위협 탐색</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>정의</strong> 알림에 의존하지 않고 가설 기반으로 위협을 능동 탐색</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>프로세스</strong> 가설 수립 → 데이터 수집 → 분석 → 결과 공유</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#22c55e' }}>차이점</strong> Detection = 자동 알림 / Hunting = 수동 탐색</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="callout anim-scale scale-delay-3" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: 'var(--accent-blue)' }}>헌팅 가설 예시</h3>
              <div style={{ fontSize: '18px', lineHeight: '2', textAlign: 'left' }}>
                <p>"Office에서 생성된 PowerShell 프로세스 중<br />Base64 인코딩 명령을 사용하는 것이<br />지난 30일간 존재할 것이다"</p>
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
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>재생이 완료되었습니다.</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>공격과 방어의 끝없는 진화를 이해하는 것이 핵심입니다!</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(56,189,248,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> 처음부터 다시 보기
          </button>
        </div>
      </div>
    </>
  );
}

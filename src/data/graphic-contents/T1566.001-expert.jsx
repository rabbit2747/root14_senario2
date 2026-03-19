// ── T1566.001 Expert: 스피어피싱 첨부파일 — Purple Team & 제로데이 ──
import React from 'react';

// ── 자막 데이터 ──
export const subtitlesData = [
  "안녕하세요! 스피어피싱의 최고급 과정, Purple Team 운영과 제로데이 대응을 알아보겠습니다.",
  "Purple Team은 Red Team의 공격 기술과 Blue Team의 방어 역량을 하나의 팀으로 결합한 협업 모델입니다.",
  "Red Team은 실제 공격자처럼 스피어피싱 캠페인을 시뮬레이션하여 조직의 약점을 테스트합니다.",
  "Blue Team은 Red Team의 공격을 실시간으로 탐지·분석·대응하며, 탐지 규칙의 효과를 검증합니다.",
  "CVE-2021-40444는 MSHTML 엔진의 취약점으로, Office 문서에서 ActiveX 컨트롤을 통해 원격 코드를 실행합니다.",
  "CVE-2022-30190(Follina)은 ms-msdt: 프로토콜을 악용하여 매크로 없이 Word 문서만으로 코드를 실행합니다.",
  "CVE-2023-23397은 Outlook의 NTLM 릴레이 취약점으로, 이메일 수신만으로 인증 정보가 탈취됩니다.",
  "제로데이 연구는 퍼징, 코드 오디트, 패치 디핑 등의 방법론으로 아직 알려지지 않은 취약점을 발견합니다.",
  "자체 탐지 프레임워크 설계는 MITRE ATT&CK 매핑, 커버리지 분석, 우선순위 결정의 과정을 거칩니다.",
  "위협 인텔리전스(CTI)를 탐지 규칙에 통합하면, 최신 공격 캠페인에 선제적으로 대응할 수 있습니다.",
  "지금까지 전문가 과정이었습니다. Purple Team과 제로데이 대응은 보안의 최전선입니다. 수고하셨습니다!"
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides({ currentSlide, confettiParticles, onRestart }) {
  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.08) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-purple)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.3))' }}>
            <i className="fa-solid fa-star"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>스피어피싱 첨부파일<br /><span>Purple Team &amp; 제로데이</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>"보안의 최전선에서 공격과 방어를 함께 운영합니다."</p>
        </div>
      </div>

      {/* Slide 2: Purple Team */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-people-group"></i> Purple Team 운영 모델</h2>
        <div className="slide-content center-layout">
          <div className="grid-3" style={{ maxWidth: '1000px' }}>
            <div className="card anim-el delay-2" style={{ padding: '35px', borderTopColor: '#ef4444' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: '#ef4444' }}><i className="fa-solid fa-skull-crossbones"></i></div>
              <h3 style={{ color: '#ef4444' }}>Red Team</h3>
              <p style={{ fontSize: '18px', marginTop: '10px' }}>공격 시뮬레이션<br />TTP 실행<br />약점 발견</p>
            </div>
            <div className="card anim-el delay-3" style={{ padding: '35px', borderTopColor: 'var(--accent-purple)' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: 'var(--accent-purple)' }}><i className="fa-solid fa-handshake"></i></div>
              <h3 style={{ color: 'var(--accent-purple)' }}>Purple Team</h3>
              <p style={{ fontSize: '18px', marginTop: '10px' }}>Red+Blue 협업<br />실시간 피드백<br />탐지 개선</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '35px', borderTopColor: 'var(--accent-blue)' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-shield-halved"></i></div>
              <h3 style={{ color: 'var(--accent-blue)' }}>Blue Team</h3>
              <p style={{ fontSize: '18px', marginTop: '10px' }}>탐지·분석·대응<br />규칙 검증<br />방어 강화</p>
            </div>
          </div>
          <p className="anim-el delay-5" style={{ marginTop: '30px', fontSize: '22px' }}>Purple = <span style={{ color: '#ef4444' }}>Red</span> + <span style={{ color: 'var(--accent-blue)' }}>Blue</span> → 협업을 통한 보안 수준 극대화</p>
        </div>
      </div>

      {/* Slide 3: Red Team 시뮬레이션 */}
      <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-crosshairs"></i> Red Team 피싱 시뮬레이션</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: 'fa-magnifying-glass', label: '정찰', desc: 'OSINT 수집', color: 'var(--accent-blue)' },
              { icon: 'fa-envelope', label: '무기화', desc: '피싱 제작', color: 'var(--accent-purple)' },
              { icon: 'fa-paper-plane', label: '전달', desc: '이메일 발송', color: '#f59e0b' },
              { icon: 'fa-bug', label: '익스플로잇', desc: '매크로 실행', color: '#ef4444' },
              { icon: 'fa-server', label: 'C2', desc: '원격 제어', color: '#ef4444' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className={`anim-el delay-${i + 2}`} style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: 'var(--card-bg)', border: `3px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <i className={`fa-solid ${step.icon}`} style={{ fontSize: '28px', color: step.color }}></i>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{step.label}</p>
                  <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
                {i < 4 && <i className="fa-solid fa-chevron-right anim-fade" style={{ fontSize: '18px', color: 'var(--text-muted)', animation: `simpleFade 0.5s forwards ${0.8 + i * 0.3}s` }}></i>}
              </React.Fragment>
            ))}
          </div>
          <p className="anim-el delay-7" style={{ marginTop: '35px', fontSize: '20px', color: 'var(--text-muted)' }}>Cyber Kill Chain 전 단계를 실제와 동일하게 시뮬레이션</p>
        </div>
      </div>

      {/* Slide 4: Blue Team 대응 */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-shield"></i> Blue Team 실시간 대응</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px' }}>
            {[
              { phase: 'Detection', desc: 'SIEM 알림 수신 → Sigma 규칙 매칭 확인', color: 'var(--accent-blue)', icon: 'fa-bell' },
              { phase: 'Analysis', desc: '이메일 헤더 포렌식 + 첨부파일 샌드박스 분석', color: 'var(--accent-purple)', icon: 'fa-magnifying-glass' },
              { phase: 'Containment', desc: '감염 호스트 네트워크 격리 + 계정 잠금', color: '#f59e0b', icon: 'fa-lock' },
              { phase: 'Eradication', desc: '악성코드 제거 + 레지스트리 복원 + C2 차단', color: '#ef4444', icon: 'fa-trash-can' },
              { phase: 'Recovery', desc: '시스템 복구 + 모니터링 강화 + 탐지 규칙 업데이트', color: '#22c55e', icon: 'fa-rotate-right' },
            ].map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '18px 25px', borderRadius: '14px', border: '1px solid var(--border)', borderLeft: `4px solid ${item.color}` }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '24px', color: item.color, minWidth: '30px' }}></i>
                <div>
                  <strong style={{ color: item.color, fontSize: '18px' }}>{item.phase}</strong>
                  <p style={{ fontSize: '18px', marginTop: '3px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 5: CVE-2021-40444 */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-file-excel"></i> CVE-2021-40444: MSHTML 취약점</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>취약점</strong> MSHTML 엔진의 ActiveX 컨트롤 실행</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>특징</strong> 매크로 없이 Office 문서로 원격 코드 실행</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>방어</strong> 2021-09 패치 적용 + ActiveX 비활성화</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '25px', border: '2px solid rgba(239,68,68,0.2)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', lineHeight: '2' }}>
                <span style={{ color: 'var(--accent-blue)' }}>1.</span> .docx 문서 열기<br />
                <span style={{ color: 'var(--accent-purple)' }}>2.</span> 내장 URL → MSHTML 로드<br />
                <span style={{ color: '#ef4444' }}>3.</span> ActiveX 컨트롤 렌더링<br />
                <span style={{ color: '#ef4444' }}>4.</span> .cab 파일 다운로드<br />
                <span style={{ color: '#ef4444' }}>5.</span> DLL 사이드로딩 → <strong>RCE</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 6: CVE-2022-30190 Follina */}
      <div className={`slide ${currentSlide === 5 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-virus"></i> CVE-2022-30190: Follina</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '24px', marginBottom: '35px' }}><strong style={{ color: '#ef4444' }}>매크로 없이</strong> ms-msdt: 프로토콜로 원격 코드 실행</p>
          <div className="grid-2" style={{ maxWidth: '850px' }}>
            <div className="card anim-el delay-3" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444' }}>공격 벡터</h3>
              <div style={{ fontSize: '18px', marginTop: '15px', lineHeight: '1.8', textAlign: 'left' }}>
                <p>• Word 원격 템플릿 → HTML 로드</p>
                <p>• ms-msdt: URI 스킴 호출</p>
                <p>• MSDT 진단 도구로 PowerShell</p>
                <p>• <strong>미리보기만으로도 실행 가능</strong></p>
              </div>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: '#22c55e' }}>
              <h3 style={{ color: '#22c55e' }}>방어 방법</h3>
              <div style={{ fontSize: '18px', marginTop: '15px', lineHeight: '1.8', textAlign: 'left' }}>
                <p>• 2022-06 패치 즉시 적용</p>
                <p>• MSDT 프로토콜 레지스트리 삭제</p>
                <p>• ASR 규칙 "Office 자식 프로세스 차단"</p>
                <p>• Sysmon ID 1 모니터링</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 7: CVE-2023-23397 */}
      <div className={`slide ${currentSlide === 6 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-envelope-circle-xmark"></i> CVE-2023-23397: Outlook NTLM 릴레이</h2>
        <div className="slide-content center-layout">
          <div className="callout anim-el delay-2" style={{ maxWidth: '850px', padding: '35px', fontSize: '22px' }}>
            <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '26px', marginBottom: '20px' }}>이메일 수신만으로 인증 정보 탈취!</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="anim-el delay-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>①</span>
                <span>공격자가 캘린더 초대에 UNC 경로 삽입 (\\attacker\share)</span>
              </div>
              <div className="anim-el delay-4" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>②</span>
                <span>Outlook이 자동으로 UNC 경로에 NTLM 인증 시도</span>
              </div>
              <div className="anim-el delay-5" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>③</span>
                <span>공격자가 NTLM 해시 캡처 → Pass-the-Hash 공격</span>
              </div>
            </div>
            <p className="anim-el delay-6" style={{ marginTop: '20px', fontSize: '18px', color: '#22c55e' }}>🛡️ 방어: 2023-03 패치 + 아웃바운드 445 포트 차단 + NTLM 비활성화</p>
          </div>
        </div>
      </div>

      {/* Slide 8: 제로데이 연구 */}
      <div className={`slide ${currentSlide === 7 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-flask"></i> 제로데이 연구 방법론</h2>
        <div className="slide-content center-layout">
          <div className="grid-3" style={{ maxWidth: '1000px' }}>
            <div className="card anim-el delay-2" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-burst"></i></div>
              <h3>퍼징 (Fuzzing)</h3>
              <p style={{ fontSize: '18px', marginTop: '10px' }}>대량의 비정상 입력으로<br />크래시 유발점 발견</p>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '50px' }}><i className="fa-solid fa-code-compare"></i></div>
              <h3>패치 디핑</h3>
              <p style={{ fontSize: '18px', marginTop: '10px' }}>패치 전후 바이너리 비교로<br />취약점 위치 역추적</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '35px 25px', borderTopColor: '#ef4444' }}>
              <div className="card-icon" style={{ fontSize: '50px', color: '#ef4444' }}><i className="fa-solid fa-file-magnifying-glass"></i></div>
              <h3>코드 오디트</h3>
              <p style={{ fontSize: '18px', marginTop: '10px' }}>수동 소스 코드 분석으로<br />논리적 취약점 발견</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 9: 탐지 프레임워크 설계 */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-sitemap"></i> 자체 탐지 프레임워크 설계</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '800px' }}>
            {[
              { step: '1', title: 'ATT&CK 매핑', desc: '조직에 해당하는 기법을 MITRE ATT&CK에 매핑', color: 'var(--accent-blue)' },
              { step: '2', title: '커버리지 분석', desc: '현재 탐지 규칙이 커버하는 영역 vs 빈 영역 식별', color: 'var(--accent-purple)' },
              { step: '3', title: '우선순위 결정', desc: '위험도 × 발생 가능성 기반 탐지 개발 순서 결정', color: '#f59e0b' },
              { step: '4', title: '규칙 개발·배포', desc: 'Sigma/YARA 작성 → 테스트 → SIEM 배포', color: '#22c55e' },
            ].map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '20px 25px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>{item.step}</div>
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
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-globe"></i> 위협 인텔리전스(CTI) 통합</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>전략적 CTI</strong> 경영진을 위한 위협 트렌드 브리핑</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>전술적 CTI</strong> SOC를 위한 TTP, IOC 피드</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>운영적 CTI</strong> 실시간 위협 데이터 자동 수집·적용</li>
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
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>전문가 과정을 완료했습니다!</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>Purple Team과 제로데이 대응은 보안의 최전선입니다.</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-purple)', color: 'var(--accent-purple)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(168,85,247,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> 처음부터 다시 보기
          </button>
        </div>
      </div>
    </>
  );
}

// ── T1587.001 Beginner: 컴퓨터 기초 & 해킹의 원리 ──
// 슬라이드 콘텐츠 + 자막 데이터를 분리하여 관리
import React from 'react';

// ── 자막 데이터 (TTS 음성 + 자막 표시) ──
export const subtitlesData = [
  "안녕하세요! 지금부터 컴퓨터의 기본 원리와 이를 악용하는 해킹에 대해 알아보겠습니다.",
  "컴퓨터는 크게 입력, 처리, 출력이라는 세 가지 단순한 과정으로 작동하는 기계입니다.",
  "컴퓨터는 영어를 모릅니다. 오직 전기의 흐름인 0과 1, 즉 이진수만을 이해하고 처리하죠.",
  "이러한 과정을 수행하기 위해 물리적인 부품들이 필요한데, 가장 중요한 하드웨어 3대장을 소개합니다.",
  "첫 번째는 CPU입니다. 사람의 뇌처럼 컴퓨터의 모든 계산과 명령 처리를 아주 빠르게 담당합니다.",
  "해커는 바로 이 CPU의 '다음에 할 일' 목록을 교묘하게 조작하여 악성코드를 강제 실행하게 만듭니다.",
  "두 번째는 RAM입니다. 속도가 빠른 CPU를 위해 데이터를 임시로 펼쳐두는 넓은 작업대 역할을 하죠.",
  "해커는 꼬리를 밟히지 않기 위해, 이 작업대(RAM) 구석에만 악성코드를 숨겨 백신을 피하는 Fileless 기법을 사용합니다.",
  "세 번째는 스토리지(SSD)입니다. 전원이 꺼져도 데이터를 영구적으로 안전하게 보관하는 튼튼한 서랍장입니다.",
  "최근의 랜섬웨어는 이 서랍장 속 소중한 데이터들에 강력한 자물쇠를 채워 거액의 돈을 요구합니다.",
  "이러한 부품들을 우리가 쉽게 다룰 수 있게 해주는 총괄 매니저가 바로 '운영체제(OS)'입니다.",
  "운영체제는 실행된 프로그램을 '프로세스'라는 단위로 관리하며 메모리와 일꾼들을 배분합니다.",
  "중요한 점은, 일반 프로그램은 '유저 모드'에서만 동작하며 시스템 통제 권한이 없다는 것입니다.",
  "하지만 루트킷(Rootkit) 같은 고급 악성코드는 운영체제의 취약점을 파고들어 사장님 권한인 '커널 모드'를 탈취해 시스템을 완전히 장악합니다.",
  "스토리지에 저장된 파일들은 확장자를 통해 종류가 구분되지만, 사실 이는 쉽게 속일 수 있습니다.",
  "따라서 보안 분석가들은 확장자 대신, 파일 내부의 진짜 DNA인 '매직 넘버(Magic Number)'를 직접 확인합니다.",
  "컴퓨터가 외부와 통신하려면, 건물 주소인 'IP 주소'와 방 번호인 '포트 번호'가 필요합니다.",
  "우리의 컴퓨터를 지켜주는 '방화벽'은 외부에서 들어오는 불법적인 접근 시도를 든든하게 막아줍니다.",
  "하지만 악성코드는 내부에서 해커의 서버(C2)로 먼저 전화를 거는 '리버스 쉘' 기법으로 방화벽을 무사히 통과합니다.",
  "지금까지 컴퓨터의 구조와 해킹의 원리였습니다. 원리를 이해하면 방어할 수 있습니다. 수고하셨습니다!"
];

// ── 슬라이드 렌더 함수 (JSX 반환) ──
// currentSlide, confettiParticles, setIsPlaying, setCurrentSlide 를 props로 받음
export function renderSlides({ currentSlide, confettiParticles, onRestart }) {
  return (
    <>
      {/* Slide 1: Intro — 배경 그라데이션 + 대형 아이콘 */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.08) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-blue)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.3))' }}>
            <i className="fa-solid fa-laptop-code"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>초보자를 위한<br /><span>컴퓨터 기초 &amp; 해킹의 원리</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>"컴퓨터는 어떻게 작동하고, 해커는 어떻게 그것을 망가뜨리는가?"</p>
        </div>
      </div>

      {/* Slide 2: What is a Computer — 카드 아이콘 확대, 화살표 강화 */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-desktop"></i> 컴퓨터란 무엇인가요?</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ marginBottom: '50px', fontSize: '28px' }}>컴퓨터는 복잡해 보이지만, 결국 <strong style={{ color: 'var(--accent-blue)' }}>3단계</strong>로만 움직이는 단순한 기계입니다.</p>
          <div className="grid-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <div className="card anim-scale scale-delay-1" style={{ flex: 1, padding: '40px 25px' }}>
              <div className="card-icon" style={{ fontSize: '90px', filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.2))' }}><i className="fa-solid fa-keyboard"></i></div>
              <h3 style={{ fontSize: '26px' }}>1. 입력 (Input)</h3>
              <p style={{ fontSize: '20px' }}>클릭, 키보드 치기</p>
            </div>
            <div className="anim-fade" style={{ fontSize: '36px', color: 'var(--accent-blue)', animation: 'simpleFade 1s forwards 1s' }}><i className="fa-solid fa-chevron-right"></i></div>
            <div className="card purple anim-scale scale-delay-2" style={{ flex: 1, padding: '40px 25px' }}>
              <div className="card-icon" style={{ fontSize: '90px', filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.2))' }}><i className="fa-solid fa-microchip"></i></div>
              <h3 style={{ fontSize: '26px' }}>2. 처리 (Process)</h3>
              <p style={{ fontSize: '20px' }}>내부에서 계산하기</p>
            </div>
            <div className="anim-fade" style={{ fontSize: '36px', color: 'var(--accent-blue)', animation: 'simpleFade 1s forwards 1.4s' }}><i className="fa-solid fa-chevron-right"></i></div>
            <div className="card anim-scale scale-delay-3" style={{ borderTopColor: 'var(--accent-blue)', flex: 1, padding: '40px 25px' }}>
              <div className="card-icon" style={{ fontSize: '90px', filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.2))' }}><i className="fa-solid fa-display"></i></div>
              <h3 style={{ fontSize: '26px' }}>3. 출력 (Output)</h3>
              <p style={{ fontSize: '20px' }}>모니터로 보여주기</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 3: Binary */}
      <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-0"></i> 컴퓨터의 유일한 언어: 이진수 (Binary)</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '26px' }}>
                <strong style={{ fontSize: '30px' }}>컴퓨터는 영어를 모릅니다.</strong>
                전기가 '흐른다(1)'와 '흐르지 않는다(0)' 두 가지만 인식합니다.
              </li>
              <li className="anim-el delay-3" style={{ fontSize: '26px' }}>
                <strong style={{ fontSize: '30px' }}>모든 것은 숫자다</strong>
                사진, 영상, 게임 모두 엄청나게 긴 '0과 1'의 조합일 뿐입니다.
              </li>
            </ul>
          </div>
          <div className="center-layout anim-scale scale-delay-3 float">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '100px', color: 'var(--accent-blue)', lineHeight: 1.1 }}>
              01001000<br />01101001
            </div>
            <p style={{ marginTop: '30px', fontSize: '28px', color: 'var(--text-main)' }}>(컴퓨터가 바라보는 알파벳 "Hi")</p>
          </div>
        </div>
      </div>

      {/* Slide 4: Hardware Big 3 */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-toolbox"></i> 물리적인 기계: 하드웨어 3대장</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ marginBottom: '60px', fontSize: '26px' }}>본체를 열어보면 부품이 많지만, 핵심은 이 세 가지입니다.</p>
          <div className="grid-3">
            <div className="card anim-el delay-3" style={{ padding: '60px 30px' }}>
              <div className="card-icon float" style={{ fontSize: '80px' }}><i className="fa-solid fa-brain"></i></div>
              <h3>CPU</h3>
              <p style={{ fontSize: '22px' }}>컴퓨터의 <strong>'두뇌'</strong></p>
            </div>
            <div className="card purple anim-el delay-4" style={{ padding: '60px 30px' }}>
              <div className="card-icon float" style={{ fontSize: '80px' }}><i className="fa-solid fa-table"></i></div>
              <h3>RAM</h3>
              <p style={{ fontSize: '22px' }}>컴퓨터의 <strong>'작업대'</strong></p>
            </div>
            <div className="card anim-el delay-5" style={{ borderTopColor: 'var(--accent-blue)', padding: '60px 30px' }}>
              <div className="card-icon float" style={{ fontSize: '80px' }}><i className="fa-solid fa-box-archive"></i></div>
              <h3>Storage</h3>
              <p style={{ fontSize: '22px' }}>컴퓨터의 <strong>'서랍장'</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 5: CPU — 아이콘 glow 강화 */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-brain"></i> 1. CPU (중앙처리장치)</h2>
        <div className="slide-content grid-2">
          <div className="center-layout anim-scale scale-delay-1 float">
            <i className="fa-solid fa-microchip" style={{ fontSize: '200px', color: 'var(--accent-blue)', filter: 'drop-shadow(0 0 25px rgba(56,189,248,0.25))' }}></i>
          </div>
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2">
                <strong>매우 똑똑하고 빠른 두뇌</strong>
                우리 몸의 뇌처럼, 컴퓨터의 모든 계산을 담당합니다. 1초에 수십억 번의 계산을 해냅니다.
              </li>
              <li className="anim-el delay-3">
                <strong>레지스터 (Register)</strong>
                CPU 안에는 아주 작은 메모장이 있습니다. 지금 당장 처리해야 할 데이터와 <strong>'다음에 할 일의 주소'</strong>를 적어둡니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide 6: Malware (CPU) */}
      <div className={`slide ${currentSlide === 5 ? 'active' : ''}`}>
        <h2 className="slide-header malware-header anim-el delay-1"><i className="fa-solid fa-biohazard"></i> [해킹] 두뇌(CPU) 속이기</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list malware">
              <li className="anim-el delay-2">
                <strong>제어 흐름 가로채기 (Hijacking)</strong>
                정상적인 컴퓨터라면 CPU는 정해진 순서대로 일을 합니다.
              </li>
              <li className="anim-el delay-3">
                <strong>명령어 바꿔치기</strong>
                해커는 오류를 일으켜 CPU의 메모장에 적힌 '다음에 할 일'을 <strong>'해커의 악성코드'</strong>로 몰래 바꿔버립니다.
              </li>
            </ul>
            <div className="callout malware anim-el delay-4">
              <i className="fa-solid fa-skull malware-pulse" style={{ color: 'var(--accent-red)' }}></i> 결과: CPU는 해킹당한 줄 모르고 해커의 명령을 실행합니다.
            </div>
          </div>
          <div className="center-layout anim-scale scale-delay-2 float">
            <i className="fa-solid fa-brain" style={{ fontSize: '150px', color: 'var(--text-muted)', position: 'relative' }}>
              <i className="fa-solid fa-spider malware-pulse" style={{ position: 'absolute', color: 'var(--accent-red)', fontSize: '80px', top: '-20px', right: '-30px' }}></i>
            </i>
          </div>
        </div>
      </div>

      {/* Slide 7: RAM */}
      <div className={`slide ${currentSlide === 6 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-table"></i> 2. RAM (주기억장치)</h2>
        <div className="slide-content grid-2">
          <div className="center-layout anim-scale scale-delay-1 float">
            <i className="fa-solid fa-memory" style={{ fontSize: '200px', color: 'var(--accent-purple)', filter: 'drop-shadow(0 0 25px rgba(168,85,247,0.25))' }}></i>
          </div>
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2">
                <strong>데이터를 펼쳐놓는 넓은 작업대</strong>
                서랍장(SSD)은 느려서, CPU는 당장 쓸 데이터를 넓은 작업대(RAM)에 잔뜩 꺼내놓고 일을 합니다.
              </li>
              <li className="anim-el delay-3">
                <strong>휘발성 (기억 상실)</strong>
                작업대는 전원이 꺼지면 싹 비워집니다. 저장 안 한 문서가 날아가는 이유죠.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide 8: Malware (RAM) */}
      <div className={`slide ${currentSlide === 7 ? 'active' : ''}`}>
        <h2 className="slide-header malware-header anim-el delay-1"><i className="fa-solid fa-biohazard"></i> [해킹] 작업대(RAM)에 기생하기</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list malware">
              <li className="anim-el delay-2">
                <strong>파일 없는 악성코드 (Fileless)</strong>
                백신은 보통 서랍장(SSD) 안의 파일을 검사합니다.
              </li>
              <li className="anim-el delay-3">
                <strong>메모리 상주 기법</strong>
                고급 해커는 파일로 남기지 않고, <strong>작업대(RAM) 구석에 보이지 않게 투명한 악성코드</strong>를 올려놓고 실행합니다.
              </li>
            </ul>
            <div className="callout malware anim-el delay-4">
              <i className="fa-solid fa-ghost malware-pulse" style={{ color: 'var(--accent-red)' }}></i> 결과: 파일이 없어 백신이 잡아내기 매우 어렵습니다.
            </div>
          </div>
          <div className="center-layout anim-scale scale-delay-2 float">
            <i className="fa-solid fa-table" style={{ fontSize: '150px', color: 'var(--text-muted)', position: 'relative' }}>
              <i className="fa-solid fa-user-ninja malware-pulse" style={{ position: 'absolute', color: 'var(--accent-red)', fontSize: '80px', bottom: '-10px', right: '-40px' }}></i>
            </i>
          </div>
        </div>
      </div>

      {/* Slide 9: Storage */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-box-archive"></i> 3. Storage (보조기억장치)</h2>
        <div className="slide-content grid-2">
          <div className="center-layout anim-scale scale-delay-1 float">
            <i className="fa-solid fa-hard-drive" style={{ fontSize: '200px', color: 'var(--accent-blue)', filter: 'drop-shadow(0 0 25px rgba(56,189,248,0.25))' }}></i>
          </div>
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2">
                <strong>안전하고 튼튼한 서랍장</strong>
                HDD나 SSD를 말합니다. 속도는 조금 느리지만 용량이 아주 큽니다.
              </li>
              <li className="anim-el delay-3">
                <strong>영구적인 보관</strong>
                전원을 꺼도 데이터가 지워지지 않습니다. 다운로드한 사진, 게임들은 모두 이곳에 저장됩니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide 10: Malware (Storage) */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <h2 className="slide-header malware-header anim-el delay-1"><i className="fa-solid fa-biohazard"></i> [해킹] 서랍장(Storage) 인질극</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list malware">
              <li className="anim-el delay-2">
                <strong>파일 파괴를 넘어선 암호화</strong>
                과거의 바이러스는 파일을 지웠지만, 요즘 해커들은 더 악랄합니다.
              </li>
              <li className="anim-el delay-3">
                <strong>랜섬웨어 (Ransomware)</strong>
                해커는 내 서랍장 속 소중한 데이터들에 아주 복잡한 자물쇠(암호화)를 채워버립니다.
              </li>
            </ul>
            <div className="callout malware anim-el delay-4">
              <i className="fa-solid fa-sack-dollar malware-pulse" style={{ color: 'var(--accent-red)' }}></i> 결과: "파일을 열고 싶다면 비트코인을 내놔라!"
            </div>
          </div>
          <div className="center-layout anim-scale scale-delay-2 float">
            <i className="fa-solid fa-folder-closed" style={{ fontSize: '150px', color: 'var(--text-muted)', position: 'relative' }}>
              <i className="fa-solid fa-lock malware-pulse" style={{ position: 'absolute', color: 'var(--accent-red)', fontSize: '80px', top: '30px', right: '-30px' }}></i>
            </i>
          </div>
        </div>
      </div>

      {/* Slide 11: OS */}
      <div className={`slide ${currentSlide === 10 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-brands fa-windows"></i> 운영체제 (OS): 시스템 총괄 매니저</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ marginBottom: '60px', fontSize: '26px' }}>컴퓨터 하드웨어를 쉽게 쓸 수 있도록 중간에서 돕는 매니저 소프트웨어입니다.</p>
          <div className="grid-3 anim-scale scale-delay-2" style={{ width: '80%' }}>
            <div className="center-layout float">
              <i className="fa-brands fa-windows" style={{ fontSize: '130px', color: '#00a4ef', filter: 'drop-shadow(0 0 15px rgba(0,164,239,0.2))' }}></i>
              <h3 style={{ marginTop: '20px', fontSize: '32px' }}>Windows</h3>
            </div>
            <div className="center-layout float" style={{ animationDelay: '0.2s' }}>
              <i className="fa-brands fa-apple" style={{ fontSize: '130px', color: 'var(--text-main)' }}></i>
              <h3 style={{ marginTop: '20px', fontSize: '32px' }}>macOS</h3>
            </div>
            <div className="center-layout float" style={{ animationDelay: '0.4s' }}>
              <i className="fa-brands fa-linux" style={{ fontSize: '130px', color: '#f5ba00', filter: 'drop-shadow(0 0 15px rgba(245,186,0,0.2))' }}></i>
              <h3 style={{ marginTop: '20px', fontSize: '32px' }}>Linux</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 12: Process */}
      <div className={`slide ${currentSlide === 11 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-gears"></i> 프로세스 (Process): 매니저의 직원들</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2">
                <strong>실행 중인 프로그램</strong>
                스토리지의 실행파일(.exe)을 더블클릭하면, OS는 이를 <strong>'프로세스(작업자)'</strong>로 만들어 메모리에 올립니다.
              </li>
              <li className="anim-el delay-3">
                <strong>스레드 (Thread)</strong>
                프로세스 안에서 실제로 일을 하는 팔과 다리들입니다.
              </li>
            </ul>
          </div>
          <div className="center-layout anim-scale scale-delay-2">
            <div className="card" style={{ width: '90%' }}>
              <div style={{ fontSize: '24px', color: 'var(--accent-blue)', marginBottom: '15px' }}>작업 관리자</div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-main)', textAlign: 'left', fontSize: '20px', lineHeight: 1.8 }}>
                &gt; chrome.exe (PID: 1024)<br />
                &gt; discord.exe (PID: 4011)<br />
                <span style={{ display: 'block', animation: 'blink 2s infinite' }}>&gt; <strong style={{ color: 'var(--accent-red)' }}>svchost.exe (PID: 592)</strong></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 13: Privileges */}
      <div className={`slide ${currentSlide === 12 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-id-badge"></i> 권한의 분리: 사장님과 일반 직원</h2>
        <div className="slide-content grid-2">
          <div className="center-layout anim-scale scale-delay-1">
            <div className="privilege-ring float" style={{ width: '280px', height: '280px', borderRadius: '50%', border: '4px dashed var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '25px', color: 'var(--accent-blue)', fontSize: '22px' }}>User Mode</span>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'var(--red-bg)', border: '4px solid var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '22px' }}>Kernel Mode</span>
              </div>
            </div>
          </div>
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2">
                <strong>유저 모드 (일반 직원)</strong>
                웹 브라우저나 게임이 실행되는 곳. 부품을 맘대로 쓸 수 없고 매니저(OS)에게 요청해야 합니다.
              </li>
              <li className="anim-el delay-3">
                <strong>커널 모드 (사장님 권한)</strong>
                OS의 심장부. 컴퓨터의 모든 메모리와 하드웨어를 완벽하게 통제하는 절대 권한을 가집니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide 14: Malware (Rootkit) */}
      <div className={`slide ${currentSlide === 13 ? 'active' : ''}`}>
        <h2 className="slide-header malware-header anim-el delay-1"><i className="fa-solid fa-biohazard"></i> [해킹] 사장님 권한 탈취 (Rootkit)</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list malware">
              <li className="anim-el delay-2">
                <strong>권한 상승 (Privilege Escalation)</strong>
                악성코드도 처음엔 '일반 직원' 권한으로 시작하지만 취약점을 뚫어 '사장님 권한'을 빼앗습니다.
              </li>
              <li className="anim-el delay-3">
                <strong>루트킷 (Rootkit)의 탄생</strong>
                커널 권한을 얻으면 백신의 눈을 피해 시스템 깊숙한 곳에서 절대 권력을 휘두릅니다.
              </li>
            </ul>
          </div>
          <div className="center-layout anim-scale scale-delay-2 float">
            <i className="fa-solid fa-crown" style={{ fontSize: '150px', color: 'var(--text-muted)', position: 'relative' }}>
              <i className="fa-solid fa-skull-crossbones malware-pulse" style={{ position: 'absolute', color: 'var(--accent-red)', fontSize: '80px', top: '15px', right: '30px' }}></i>
            </i>
            <p style={{ marginTop: '30px', fontSize: '26px', color: 'var(--accent-red)', fontWeight: 'bold' }}>시스템 완벽 장악</p>
          </div>
        </div>
      </div>

      {/* Slide 15: File formats */}
      <div className={`slide ${currentSlide === 14 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-file-lines"></i> 파일과 확장자 (Extensions)</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2">
                <strong>이름 뒤의 꼬리표</strong>
                윈도우는 파일 이름 뒤에 붙은 확장자를 보고 어떤 프로그램으로 열어야 할지 결정합니다.
              </li>
              <li className="anim-el delay-3">
                <strong>대표적인 확장자들</strong>
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <span>• <strong style={{ display: 'inline', fontSize: '24px' }}>.txt</strong> (메모장 텍스트)</span>
                  <span>• <strong style={{ display: 'inline', fontSize: '24px' }}>.jpg, .png</strong> (사진 이미지)</span>
                  <span>• <strong style={{ display: 'inline', color: 'var(--accent-red)', fontSize: '24px' }}>.exe</strong> (실행 프로그램)</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="center-layout anim-scale scale-delay-2" style={{ gap: '30px' }}>
            <div style={{ background: 'var(--card-bg)', padding: '25px 50px', borderRadius: '12px', fontSize: '30px', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}>document<strong>.pdf</strong></div>
            <div style={{ background: 'var(--card-bg)', padding: '25px 50px', borderRadius: '12px', fontSize: '30px', color: 'var(--text-main)', border: '1px solid var(--accent-red)', boxShadow: '0 0 15px var(--red-bg)' }}>game_installer<strong style={{ color: 'var(--accent-red)' }}>.exe</strong></div>
          </div>
        </div>
      </div>

      {/* Slide 16: Malware (Magic Numbers) */}
      <div className={`slide ${currentSlide === 15 ? 'active' : ''}`}>
        <h2 className="slide-header malware-header anim-el delay-1"><i className="fa-solid fa-biohazard"></i> [해킹] 위장과 매직 넘버(Magic Number)</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list malware">
              <li className="anim-el delay-2">
                <strong>확장자 위장</strong>
                해커가 virus.exe를 cute_cat.jpg로 바꾸면 일반 사용자는 사진인 줄 알고 속게 됩니다.
              </li>
              <li className="anim-el delay-3">
                <strong>진짜 DNA: 매직 넘버</strong>
                분석가는 이름 대신 파일 데이터 맨 앞의 <strong>식별 코드(Magic Number)</strong>를 확인해 진짜 정체를 파악합니다.
              </li>
            </ul>
          </div>
          <div className="center-layout anim-scale scale-delay-2 float">
            <div className="card malware-pulse" style={{ borderTopColor: 'var(--accent-red)', width: '100%', padding: '60px 40px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '50px', color: 'var(--accent-red)' }}>4D 5A (MZ)</div>
              <p style={{ marginTop: '20px', fontSize: '22px' }}>이름이 .jpg라도 앞부분이 MZ라면?<br />=&gt; 무조건 악성 실행 파일(.exe)!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 17: Network */}
      <div className={`slide ${currentSlide === 16 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-globe"></i> 네트워크 기초: 인터넷의 주소</h2>
        <div className="slide-content grid-2">
          <div className="card anim-el delay-2 float" style={{ padding: '60px 40px', gap: '20px' }}>
            <div className="card-icon" style={{ fontSize: '110px', filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.2))' }}><i className="fa-solid fa-map-location-dot"></i></div>
            <h3 style={{ fontSize: '28px' }}>IP 주소 (건물 주소)</h3>
            <p style={{ fontSize: '22px' }}>네트워크에서 컴퓨터를 찾기 위한 고유 주소<br /><span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-blue)' }}>192.168.0.1</span></p>
          </div>
          <div className="card purple anim-el delay-3 float" style={{ padding: '60px 40px', gap: '20px', animationDelay: '0.5s' }}>
            <div className="card-icon" style={{ fontSize: '110px', filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.2))' }}><i className="fa-solid fa-door-open"></i></div>
            <h3 style={{ fontSize: '28px' }}>포트 번호 (방 번호)</h3>
            <p style={{ fontSize: '22px' }}>컴퓨터 안에서 특정 서비스로 들어가는 문<br /><span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-purple)' }}>:80 (HTTP) :443 (HTTPS)</span></p>
          </div>
        </div>
      </div>

      {/* Slide 18: Firewall */}
      <div className={`slide ${currentSlide === 17 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-shield-halved"></i> 방화벽 (Firewall): 든든한 경비원</h2>
        <div className="slide-content grid-2">
          <div className="center-layout anim-scale scale-delay-1 float">
            <i className="fa-solid fa-shield-halved" style={{ fontSize: '200px', color: 'var(--accent-blue)', filter: 'drop-shadow(0 0 25px rgba(56,189,248,0.25))' }}></i>
          </div>
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2">
                <strong>인바운드 (외부 -&gt; 내부) 차단</strong>
                방화벽은 해커가 외부에서 내 컴퓨터로 무작정 들어오려는 시도를 강력하게 막아냅니다.
              </li>
              <li className="anim-el delay-3">
                <strong>아웃바운드 (내부 -&gt; 외부) 허용</strong>
                하지만 내가 유튜브를 보려면 내 컴퓨터가 외부로 접속하는 것은 허용해 주어야 합니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide 19: Malware (Reverse Shell) */}
      <div className={`slide ${currentSlide === 18 ? 'active' : ''}`}>
        <h2 className="slide-header malware-header anim-el delay-1"><i className="fa-solid fa-biohazard"></i> [해킹] 경비원 속이기 (리버스 쉘)</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list malware">
              <li className="anim-el delay-2">
                <strong>방향을 뒤집다 (Reverse)</strong>
                해커는 밖에서 뚫지 못하니, 내부의 악성코드가 <strong>"스스로 해커의 컴퓨터(C2 서버)에 전화를 걸게"</strong> 만듭니다.
              </li>
              <li className="anim-el delay-3">
                <strong>방화벽 무사 통과</strong>
                방화벽은 컴퓨터가 정상적으로 웹서핑을 나가는 줄 알고 문을 열어주어 해킹 통로가 뚫리게 됩니다.
              </li>
            </ul>
          </div>
          <div className="center-layout anim-scale scale-delay-2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <i className="fa-solid fa-laptop float" style={{ fontSize: '80px', color: 'var(--text-main)' }}></i>
              <div className="data-line red"></div>
              <i className="fa-solid fa-shield-halved float" style={{ fontSize: '80px', color: 'var(--accent-blue)', animationDelay: '0.2s' }}></i>
              <div className="data-line red"></div>
              <i className="fa-solid fa-server float" style={{ fontSize: '80px', color: 'var(--accent-red)', animationDelay: '0.4s' }}></i>
            </div>
            <p style={{ marginTop: '35px', fontSize: '26px', color: 'var(--accent-red)', fontWeight: 'bold' }} className="malware-pulse">안에서 밖으로 연결 성공!</p>
          </div>
        </div>
      </div>

      {/* Slide 20: Outro — 배경 그라데이션 + 강화된 CTA */}
      <div className={`slide ${currentSlide === 19 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.08) 0%, transparent 60%)' }}>
        {currentSlide === 19 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
            {confettiParticles.map((p) => (
              <div key={p.id} className="confetti" style={{ left: p.left, animationDelay: p.animationDelay, animationDuration: p.animationDuration, backgroundColor: p.backgroundColor }}></div>
            ))}
          </div>
        )}
        <div className="slide-content center-layout" style={{ zIndex: 1 }}>
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-green)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.3))' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>재생이 완료되었습니다.</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>컴퓨터의 원리를 알아야 해커의 공격 방법도 보입니다.</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(56,189,248,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> 처음부터 다시 보기
          </button>
        </div>
      </div>
    </>
  );
}

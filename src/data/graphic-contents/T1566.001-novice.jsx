// ── T1566.001 Novice: 스피어피싱 첨부파일 — 이메일 보안의 첫걸음 ──
import React from 'react';

// ── 자막 데이터 ──
export const subtitlesData = [
  { ko: "안녕하세요! 지금부터 이메일에 숨어있는 위험, '스피어피싱 첨부파일'에 대해 알아보겠습니다.", en: "Hello! Let's learn about the danger hidden in emails: 'Spearphishing Attachments'.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "이메일은 전 세계에서 가장 많이 사용되는 업무 소통 수단이며, 하루에 약 3,000억 통이 전송됩니다.", en: "Email is the most widely used business communication tool in the world, with about 300 billion messages sent daily.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "이메일의 기본 구조는 발신자, 수신자, 제목, 본문, 그리고 첨부파일 5가지 요소로 이루어져 있습니다.", en: "An email consists of five basic elements: sender, recipient, subject, body, and attachments.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "피싱(Phishing)은 물고기를 낚는 것처럼, 가짜 이메일로 사용자를 속여 정보를 빼내는 공격입니다.", en: "Phishing, like fishing, is an attack that tricks users with fake emails to steal their information.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "스피어피싱은 일반 피싱과 달리, 특정 개인이나 조직을 정밀하게 겨냥하는 '저격형' 공격입니다.", en: "Unlike general phishing, spearphishing is a 'sniper-type' attack that precisely targets specific individuals or organizations.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "실제 사례: 2020년 SolarWinds 해킹은 스피어피싱 이메일 한 통에서 시작되어 미국 정부 기관까지 침투했습니다.", en: "Real case: The 2020 SolarWinds hack started from a single spearphishing email and infiltrated U.S. government agencies.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "첨부파일 공격의 핵심은 악성 매크로입니다. 문서를 열면 숨겨진 코드가 자동으로 실행됩니다.", en: "The core of attachment attacks is malicious macros. Hidden code runs automatically when you open the document.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "위험한 첨부파일 유형에는 .doc, .xls, .pdf, .zip, .exe, .js 등이 있으며, 특히 매크로가 포함된 문서가 가장 많습니다.", en: "Dangerous attachment types include .doc, .xls, .pdf, .zip, .exe, .js, with macro-enabled documents being the most common.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "의심스러운 이메일을 구별하는 5가지 신호를 기억하세요: 급한 어조, 출처 불명, 링크 요구, 첨부파일, 문법 오류.", en: "Remember 5 signs of suspicious emails: urgent tone, unknown source, link requests, attachments, and grammar errors.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "지금까지 스피어피싱의 기초였습니다. 이메일 한 통이 조직 전체를 위험에 빠뜨릴 수 있다는 것을 기억하세요!", en: "That was the basics of spearphishing. Remember that a single email can put an entire organization at risk!", vi: null, ar: null, ja: null, zh: null, hi: null },
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides({ currentSlide, confettiParticles, onRestart, language = 'ko' }) {
  const T = {
    ko: {
      // Slide 1
      s1Title: '스피어피싱 첨부파일',
      s1Subtitle: '이메일 보안의 첫걸음',
      s1Quote: '"당신에게 온 이메일, 정말 안전한가요?"',
      // Slide 2
      s2Header: '이메일의 세계',
      s2Desc: '이메일은 전 세계에서 가장 보편적인 ',
      s2DescStrong: '업무 소통 수단',
      s2DescEnd: '입니다.',
      s2Card1Title: '3,000억 통',
      s2Card1Desc: '하루 전 세계 이메일 전송량',
      s2Card2Title: '91%',
      s2Card2Desc: '사이버 공격이 이메일로 시작',
      s2Card3Title: '40+',
      s2Card3Desc: '직장인 하루 평균 수신 수',
      // Slide 3
      s3Header: '이메일의 5가지 구성 요소',
      s3Item1Label: '① 발신자 (From)',
      s3Item1Desc: ' 누가 보냈는지 — 위조 가능!',
      s3Item2Label: '② 수신자 (To)',
      s3Item2Desc: ' 누구에게 보내는지',
      s3Item3Label: '③ 제목 (Subject)',
      s3Item3Desc: ' 급박한 제목으로 클릭 유도',
      s3Item4Label: '④ 본문 (Body)',
      s3Item4Desc: ' HTML로 가짜 링크 삽입 가능',
      s3Item5Label: '⑤ 첨부파일',
      s3Item5Desc1: '공격자가 악성코드를 숨기는',
      s3Item5Desc2: '가장 흔한 통로',
      // Slide 4
      s4Header: '피싱(Phishing)이란?',
      s4Desc: '물고기를 낚듯이 가짜 미끼로 ',
      s4DescStrong: '사람을 속이는',
      s4DescEnd: ' 사이버 공격',
      s4Card1Title: '일반 피싱',
      s4Card1Desc1: '수천 명에게 동일한 가짜 메일',
      s4Card1Desc2: '"대량 투망"',
      s4Card2Title: '스피어피싱',
      s4Card2Desc1: '특정 인물을 정밀 조준',
      s4Card2Desc2: '"저격 사냥"',
      // Slide 5
      s5Header: '스피어피싱은 왜 위험한가?',
      s5Item1Label: '사전 정보 수집',
      s5Item1Desc: ' SNS, 회사 홈페이지에서 타깃 조사',
      s5Item2Label: '맞춤형 시나리오',
      s5Item2Desc: ' "김 부장님, 지난 회의 자료입니다"',
      s5Item3Label: '높은 성공률',
      s5Item3Desc: ' 일반 피싱 3% vs 스피어피싱 ',
      s5TargetAttack: '표적 공격',
      // Slide 6
      s6Header: '실제 사례: SolarWinds 해킹',
      s6CaseTitle: '2020년 SolarWinds 사건',
      s6Step1: '스피어피싱 이메일 1통',
      s6Result: '→ 소프트웨어 업데이트 서버 장악 → 미국 재무부·국토안보부 등 18,000개 기관 침투',
      // Slide 7
      s7Header: '첨부파일의 비밀: 악성 매크로',
      s7Item1Label: '매크로(Macro)란?',
      s7Item1Desc: ' 문서 안에 숨긴 자동 실행 프로그램',
      s7Item2Label: '작동 원리',
      s7Item2Desc: ' 문서 열기 → "콘텐츠 사용" 클릭 → 악성코드 실행',
      s7Item3Label: '주요 트리거',
      s7Item3Desc: ' Auto_Open, Document_Open, Workbook_Open',
      // Slide 8
      s8Header: '위험한 첨부파일 확장자',
      s8Cat1Title: '🔴 매우 위험',
      s8Cat2Title: '🟠 주의 필요',
      s8Cat3Title: '🟡 비교적 안전',
      s8Note: '※ .pdf도 JavaScript 삽입이 가능하므로 100% 안전하지는 않습니다',
      // Slide 9
      s9Header: '의심스러운 이메일 5가지 신호',
      s9Item1: '① 급박한 어조 — "지금 바로 확인하세요!"',
      s9Item2: '② 출처 불명 — 도메인이 이상하거나 처음 보는 발신자',
      s9Item3: '③ 링크 요구 — 비밀번호 변경, 계정 확인 유도',
      s9Item4: '④ 의심 첨부파일 — .zip, .docm, 이중 확장자',
      s9Item5: '⑤ 문법·맞춤법 오류 — 부자연스러운 번역체',
      // Slide 10
      s10Title: '재생이 완료되었습니다.',
      s10Desc: '이메일 한 통이 조직 전체를 위험에 빠뜨릴 수 있습니다.',
      s10Restart: '처음부터 다시 보기',
    },
    en: {
      s1Title: 'Spearphishing Attachment',
      s1Subtitle: 'First Steps in Email Security',
      s1Quote: '"Is the email you received really safe?"',
      s2Header: 'The World of Email',
      s2Desc: 'Email is the most universal ',
      s2DescStrong: 'business communication tool',
      s2DescEnd: ' in the world.',
      s2Card1Title: '300 Billion',
      s2Card1Desc: 'Emails sent worldwide per day',
      s2Card2Title: '91%',
      s2Card2Desc: 'Cyberattacks start with email',
      s2Card3Title: '40+',
      s2Card3Desc: 'Avg. emails received per worker/day',
      s3Header: '5 Components of an Email',
      s3Item1Label: '① Sender (From)',
      s3Item1Desc: ' Who sent it — can be forged!',
      s3Item2Label: '② Recipient (To)',
      s3Item2Desc: ' Who it is addressed to',
      s3Item3Label: '③ Subject',
      s3Item3Desc: ' Urgent subjects lure clicks',
      s3Item4Label: '④ Body',
      s3Item4Desc: ' HTML can embed fake links',
      s3Item5Label: '⑤ Attachment',
      s3Item5Desc1: 'The most common channel',
      s3Item5Desc2: 'for hiding malware',
      s4Header: 'What is Phishing?',
      s4Desc: 'A cyberattack that ',
      s4DescStrong: 'deceives people',
      s4DescEnd: ' with fake bait, like fishing',
      s4Card1Title: 'General Phishing',
      s4Card1Desc1: 'Same fake email to thousands',
      s4Card1Desc2: '"Mass net casting"',
      s4Card2Title: 'Spearphishing',
      s4Card2Desc1: 'Precisely targeting a specific person',
      s4Card2Desc2: '"Sniper hunting"',
      s5Header: 'Why is Spearphishing Dangerous?',
      s5Item1Label: 'Reconnaissance',
      s5Item1Desc: ' Researching targets via SNS and company websites',
      s5Item2Label: 'Custom Scenarios',
      s5Item2Desc: ' "Mr. Kim, here are the meeting materials"',
      s5Item3Label: 'High Success Rate',
      s5Item3Desc: ' General phishing 3% vs Spearphishing ',
      s5TargetAttack: 'Targeted Attack',
      s6Header: 'Real Case: SolarWinds Hack',
      s6CaseTitle: '2020 SolarWinds Incident',
      s6Step1: '1 spearphishing email',
      s6Result: '→ Compromised software update server → Infiltrated 18,000 organizations including U.S. Treasury & DHS',
      s7Header: 'The Secret of Attachments: Malicious Macros',
      s7Item1Label: 'What is a Macro?',
      s7Item1Desc: ' An auto-executing program hidden in a document',
      s7Item2Label: 'How It Works',
      s7Item2Desc: ' Open document → Click "Enable Content" → Malware executes',
      s7Item3Label: 'Key Triggers',
      s7Item3Desc: ' Auto_Open, Document_Open, Workbook_Open',
      s8Header: 'Dangerous Attachment Extensions',
      s8Cat1Title: '🔴 Very Dangerous',
      s8Cat2Title: '🟠 Caution Needed',
      s8Cat3Title: '🟡 Relatively Safe',
      s8Note: '※ Even .pdf can have JavaScript injected, so it\'s not 100% safe',
      s9Header: '5 Signs of Suspicious Emails',
      s9Item1: '① Urgent tone — "Check this right now!"',
      s9Item2: '② Unknown source — Strange domain or unfamiliar sender',
      s9Item3: '③ Link request — Password change, account verification prompt',
      s9Item4: '④ Suspicious attachment — .zip, .docm, double extension',
      s9Item5: '⑤ Grammar errors — Unnatural phrasing or translations',
      s10Title: 'Playback Complete.',
      s10Desc: 'A single email can put an entire organization at risk.',
      s10Restart: 'Watch Again from Start',
    },
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };
  const t = T[language] || T.ko;

  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.08) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-blue)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.3))' }}>
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>{t.s1Title}<br /><span>{t.s1Subtitle}</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.s1Quote}</p>
        </div>
      </div>

      {/* Slide 2: 이메일의 세계 */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-globe"></i> {t.s2Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ marginBottom: '50px', fontSize: '28px' }}>{t.s2Desc}<strong style={{ color: 'var(--accent-blue)' }}>{t.s2DescStrong}</strong>{t.s2DescEnd}</p>
          <div className="grid-3">
            <div className="card anim-scale scale-delay-1" style={{ padding: '40px 25px' }}>
              <div className="card-icon" style={{ fontSize: '80px' }}><i className="fa-solid fa-envelope"></i></div>
              <h3 style={{ fontSize: '30px' }}>{t.s2Card1Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s2Card1Desc}</p>
            </div>
            <div className="card purple anim-scale scale-delay-2" style={{ padding: '40px 25px' }}>
              <div className="card-icon" style={{ fontSize: '80px' }}><i className="fa-solid fa-building"></i></div>
              <h3 style={{ fontSize: '30px' }}>{t.s2Card2Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s2Card2Desc}</p>
            </div>
            <div className="card anim-scale scale-delay-3" style={{ borderTopColor: 'var(--accent-blue)', padding: '40px 25px' }}>
              <div className="card-icon" style={{ fontSize: '80px' }}><i className="fa-solid fa-user-tie"></i></div>
              <h3 style={{ fontSize: '30px' }}>{t.s2Card3Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s2Card3Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 3: 이메일 구조 */}
      <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-layer-group"></i> {t.s3Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '24px' }}><strong style={{ color: 'var(--accent-blue)', fontSize: '28px' }}>{t.s3Item1Label}</strong>{t.s3Item1Desc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '24px' }}><strong style={{ color: 'var(--accent-purple)', fontSize: '28px' }}>{t.s3Item2Label}</strong>{t.s3Item2Desc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '24px' }}><strong style={{ color: 'var(--accent-blue)', fontSize: '28px' }}>{t.s3Item3Label}</strong>{t.s3Item3Desc}</li>
              <li className="anim-el delay-5" style={{ fontSize: '24px' }}><strong style={{ color: 'var(--accent-purple)', fontSize: '28px' }}>{t.s3Item4Label}</strong>{t.s3Item4Desc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="card anim-scale scale-delay-3" style={{ padding: '50px 40px', borderTopColor: '#ef4444' }}>
              <div className="card-icon float" style={{ fontSize: '80px', color: '#ef4444' }}><i className="fa-solid fa-paperclip"></i></div>
              <h3 style={{ fontSize: '28px', color: '#ef4444' }}>{t.s3Item5Label}</h3>
              <p style={{ fontSize: '22px' }}>{t.s3Item5Desc1}<br /><strong>{t.s3Item5Desc2}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 4: 피싱이란? */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-fish"></i> {t.s4Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '28px', marginBottom: '50px' }}>{t.s4Desc}<strong style={{ color: '#ef4444' }}>{t.s4DescStrong}</strong>{t.s4DescEnd}</p>
          <div className="grid-2" style={{ maxWidth: '900px' }}>
            <div className="card anim-el delay-3" style={{ padding: '40px 30px' }}>
              <div className="card-icon" style={{ fontSize: '70px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-fish-fins"></i></div>
              <h3>{t.s4Card1Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s4Card1Desc1}<br />{t.s4Card1Desc2}</p>
            </div>
            <div className="card purple anim-el delay-4" style={{ padding: '40px 30px' }}>
              <div className="card-icon" style={{ fontSize: '70px', color: '#ef4444' }}><i className="fa-solid fa-crosshairs"></i></div>
              <h3 style={{ color: '#ef4444' }}>{t.s4Card2Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s4Card2Desc1}<br />{t.s4Card2Desc2}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 5: 스피어피싱의 특징 */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-bullseye"></i> {t.s5Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s5Item1Label}</strong>{t.s5Item1Desc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s5Item2Label}</strong>{t.s5Item2Desc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s5Item3Label}</strong>{t.s5Item3Desc}<span style={{ color: '#ef4444', fontWeight: 'bold' }}>70%</span></li>
            </ul>
          </div>
          <div className="center-layout anim-scale scale-delay-3">
            <div style={{ position: 'relative', width: '300px', height: '300px' }}>
              <div className="float" style={{ width: '300px', height: '300px', borderRadius: '50%', border: '4px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)' }}>
                <div style={{ textAlign: 'center' }}>
                  <i className="fa-solid fa-user-secret" style={{ fontSize: '80px', color: '#ef4444' }}></i>
                  <p style={{ marginTop: '15px', fontSize: '22px', fontWeight: 'bold' }}>{t.s5TargetAttack}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 6: 실제 사례 */}
      <div className={`slide ${currentSlide === 5 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-newspaper"></i> {t.s6Header}</h2>
        <div className="slide-content center-layout">
          <div className="callout anim-el delay-2" style={{ maxWidth: '850px', padding: '40px', fontSize: '24px' }}>
            <p style={{ marginBottom: '20px' }}><strong style={{ color: '#ef4444', fontSize: '28px' }}>{t.s6CaseTitle}</strong></p>
            <div className="grid-2" style={{ gap: '30px', marginTop: '25px' }}>
              <div style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-envelope anim-el delay-3" style={{ fontSize: '50px', color: 'var(--accent-blue)' }}></i>
                <p style={{ marginTop: '10px' }}>{t.s6Step1}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-arrow-right anim-fade" style={{ fontSize: '30px', color: 'var(--text-muted)', animation: 'simpleFade 1s forwards 1.2s' }}></i>
              </div>
            </div>
            <p className="anim-el delay-4" style={{ marginTop: '25px', fontSize: '22px' }}>{t.s6Result}</p>
          </div>
        </div>
      </div>

      {/* Slide 7: 악성 매크로 */}
      <div className={`slide ${currentSlide === 6 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-bug"></i> {t.s7Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s7Item1Label}</strong>{t.s7Item1Desc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s7Item2Label}</strong>{t.s7Item2Desc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s7Item3Label}</strong>{t.s7Item3Desc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(168,85,247,0.08))', borderRadius: '20px', padding: '40px', border: '2px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', color: 'var(--text-main)', textAlign: 'left', lineHeight: '2' }}>
                <span style={{ color: '#ef4444' }}>Sub</span> Auto_Open()<br />
                &nbsp;&nbsp;<span style={{ color: 'var(--accent-purple)' }}>Shell</span> "powershell -enc ..."<br />
                <span style={{ color: '#ef4444' }}>End Sub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 8: 위험한 파일 유형 */}
      <div className={`slide ${currentSlide === 7 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-file-circle-exclamation"></i> {t.s8Header}</h2>
        <div className="slide-content center-layout">
          <div className="grid-3" style={{ maxWidth: '1000px' }}>
            <div className="card anim-el delay-2" style={{ padding: '30px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444', fontSize: '22px' }}>{t.s8Cat1Title}</h3>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', marginTop: '15px', lineHeight: '2' }}>.exe .scr .bat<br />.cmd .ps1 .js</p>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '30px' }}>
              <h3 style={{ color: 'var(--accent-purple)', fontSize: '22px' }}>{t.s8Cat2Title}</h3>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', marginTop: '15px', lineHeight: '2' }}>.docm .xlsm<br />.pptm .zip</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', borderTopColor: 'var(--accent-blue)' }}>
              <h3 style={{ color: 'var(--accent-blue)', fontSize: '22px' }}>{t.s8Cat3Title}</h3>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', marginTop: '15px', lineHeight: '2' }}>.docx .xlsx<br />.pdf .txt</p>
            </div>
          </div>
          <p className="anim-el delay-5" style={{ marginTop: '40px', fontSize: '22px', color: 'var(--text-muted)' }}>{t.s8Note}</p>
        </div>
      </div>

      {/* Slide 9: 5가지 의심 신호 */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-shield-halved"></i> {t.s9Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
            {[
              { icon: 'fa-clock', text: t.s9Item1, color: '#ef4444' },
              { icon: 'fa-user-xmark', text: t.s9Item2, color: 'var(--accent-purple)' },
              { icon: 'fa-link', text: t.s9Item3, color: 'var(--accent-blue)' },
              { icon: 'fa-paperclip', text: t.s9Item4, color: '#ef4444' },
              { icon: 'fa-spell-check', text: t.s9Item5, color: 'var(--accent-purple)' },
            ].map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '20px 30px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '28px', color: item.color, minWidth: '35px' }}></i>
                <span style={{ fontSize: '22px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 10: Outro */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)' }}>
        {confettiParticles && confettiParticles.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%', width: p.size + 'px', height: p.size + 'px', backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : '2px', opacity: p.opacity, transform: `rotate(${p.rotation}deg)`, transition: 'all 0.5s ease-out' }} />
        ))}
        <div className="slide-content center-layout" style={{ zIndex: 1 }}>
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-green)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.3))' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>{t.s10Title}</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.s10Desc}</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(56,189,248,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> {t.s10Restart}
          </button>
        </div>
      </div>
    </>
  );
}

// ── T1566.001 Beginner: 스피어피싱 첨부파일 — 공격 도구와 원리 ──
import React from 'react';

// ── 자막 데이터 ──
export const subtitlesData = [
  { ko: "안녕하세요! 스피어피싱 첨부파일 공격의 도구와 원리를 깊이 있게 알아보겠습니다.", en: "Hello! Let's take a deep dive into the tools and principles behind spearphishing attachment attacks.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "SMTP 프로토콜은 이메일을 전송하는 표준 규약입니다. 문제는, 발신자 주소를 손쉽게 위조할 수 있다는 것이죠.", en: "SMTP is the standard protocol for sending emails. The problem is that the sender address can be easily forged.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "공격자는 SPF, DKIM, DMARC 같은 이메일 인증 체계가 없는 도메인을 찾아 발신자를 사칭합니다.", en: "Attackers find domains lacking SPF, DKIM, and DMARC email authentication to impersonate senders.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "MIME 구조는 이메일에 다양한 형식의 첨부파일을 담을 수 있게 해주며, 공격자는 이를 악용합니다.", en: "The MIME structure allows emails to carry various file types as attachments, which attackers exploit.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "VBA 매크로는 Office 문서 내에서 실행되는 프로그래밍 언어입니다. Auto_Open 같은 이벤트로 자동 실행됩니다.", en: "VBA macros are a programming language that runs inside Office documents. They auto-execute via events like Auto_Open.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "매크로 실행 흐름은 문서 열기 → '콘텐츠 사용' 클릭 → WScript.Shell 호출 → PowerShell 다운로드 순서입니다.", en: "The macro execution flow is: Open document → Click 'Enable Content' → WScript.Shell call → PowerShell download.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "APT 그룹은 일반 피싱과 달리 수개월 동안 타깃을 관찰하고 맞춤형 시나리오를 설계합니다.", en: "Unlike general phishing, APT groups observe targets for months and design custom attack scenarios.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "실제 APT28(Fancy Bear) 그룹은 정부 기관 직원에게 '보안 업데이트' 위장 문서를 보내 침투했습니다.", en: "The APT28 (Fancy Bear) group infiltrated by sending 'security update' disguised documents to government employees.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "소셜 엔지니어링 기법은 기술이 아닌 사람의 심리를 공격합니다. 권위, 긴급성, 호기심을 이용하죠.", en: "Social engineering attacks exploit human psychology, not technology. It leverages authority, urgency, and curiosity.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "이메일 헤더 분석은 공격 탐지의 핵심입니다. Received, X-Originating-IP, Return-Path를 확인하세요.", en: "Email header analysis is key to detecting attacks. Check Received, X-Originating-IP, and Return-Path.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "첨부파일 분석의 첫 단계는 해시값 추출입니다. SHA-256으로 VirusTotal에서 이미 알려진 악성코드인지 확인합니다.", en: "The first step in attachment analysis is hash extraction. Use SHA-256 to check VirusTotal for known malware.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "문서 매크로 추출에는 olevba, oletools 같은 도구가 사용됩니다. 숨겨진 VBA 코드를 평문으로 확인할 수 있죠.", en: "Tools like olevba and oletools are used to extract document macros. They reveal hidden VBA code in plain text.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "방어의 핵심은 다중 레이어입니다. 이메일 필터 → 엔드포인트 보호 → 사용자 교육의 3단 방어가 필요합니다.", en: "The key to defense is multiple layers: email filtering → endpoint protection → user training, a 3-layer defense.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "기본 방어 설정: Office 매크로 비활성화, 위험 확장자 차단, 이메일 게이트웨이 SPF/DKIM 검증을 켜세요.", en: "Basic defense settings: Disable Office macros, block dangerous extensions, enable SPF/DKIM verification on email gateways.", vi: null, ar: null, ja: null, zh: null, hi: null },
  { ko: "지금까지 스피어피싱 공격의 도구와 원리였습니다. 공격을 이해해야 방어할 수 있습니다. 수고하셨습니다!", en: "That covers the tools and principles of spearphishing attacks. Understanding attacks is the first step to defense. Great work!", vi: null, ar: null, ja: null, zh: null, hi: null },
];

// ── 슬라이드 렌더 함수 ──
export function renderSlides({ currentSlide, confettiParticles, onRestart, language = 'ko' }) {
  const T = {
    ko: {
      // Slide 1
      s1Title: '스피어피싱 첨부파일',
      s1Subtitle: '공격 도구와 원리',
      s1Quote: '"공격자의 무기를 이해하면, 방어의 시작입니다."',
      // Slide 2
      s2Header: 'SMTP: 이메일 전송 프로토콜',
      s2Item1Label: 'SMTP란?',
      s2Item1Desc: ' Simple Mail Transfer Protocol, 이메일을 서버 간 전달하는 규약',
      s2Item2Label: '취약점',
      s2Item2Desc: ' MAIL FROM 필드를 자유롭게 설정 가능 → 발신자 위조',
      s2Item3Label: '포트',
      s2Item3Desc: ' 25(기본), 587(인증), 465(SSL)',
      s2CodeSubject: 'Subject: 긴급 보안 업데이트...',
      // Slide 3
      s3Header: '이메일 인증: SPF · DKIM · DMARC',
      s3SpfDesc: '발신 서버 IP가\n허용 목록에 있는지 확인',
      s3DkimDesc: '전자 서명으로\n이메일 위변조 검증',
      s3DmarcDesc: 'SPF+DKIM 결과 기반\n정책 적용 (거부/격리)',
      s3Warning: '⚠️ 이 3가지가 모두 없는 도메인은 발신자 위조에 무방비!',
      // Slide 4
      s4Header: 'MIME: 이메일 첨부파일의 비밀',
      s4Item1Label: 'MIME이란?',
      s4Item1Desc: ' Multipurpose Internet Mail Extensions, 이메일에 다양한 파일을 담는 표준',
      s4Item2Label: 'Content-Type',
      s4Item2Desc: ' 파일 종류 지정: application/pdf, image/png 등',
      s4Item3Label: '악용 방법',
      s4Item3Desc: ' Content-Type을 속이거나, Base64 인코딩으로 악성코드 은닉',
      // Slide 5
      s5Header: 'VBA 매크로: Office 문서의 숨겨진 무기',
      s5Desc: 'Visual Basic for Applications — Office 문서에 내장된 프로그래밍 언어',
      // Slide 6
      s6Header: '매크로 공격 실행 흐름',
      s6Step1: '이메일 수신',
      s6Step2: '문서 열기',
      s6Step3: '콘텐츠 사용',
      s6Step4: 'Shell 호출',
      s6Step5: 'PS 다운로드',
      s6Step6: '악성코드 실행',
      // Slide 7
      s7Header: 'APT: 조직화된 공격 그룹',
      s7Item1Label: 'APT란?',
      s7Item1Desc: ' Advanced Persistent Threat, 국가 지원형 해킹 그룹',
      s7Item2Label: '특징',
      s7Item2Desc: ' 수개월~수년에 걸친 장기 침투, 정밀 타깃 공격',
      s7Item3Label: '일반 피싱과 차이',
      s7Item3Desc: ' 대량 발송 X → 1명에게 맞춤 제작',
      s7AptTitle: '대표 APT 그룹',
      // Slide 8
      s8Header: '사례: APT28 정부 기관 침투',
      s8CaseTitle: 'APT28 (Fancy Bear) 캠페인',
      s8Step1: '직원 LinkedIn 프로필에서 부서·직급·관심사 수집',
      s8Step2: '"보안 업데이트 안내" 위장 .docm 문서 첨부',
      s8Step3: '매크로 실행 → C2 서버 연결 → 내부 네트워크 횡이동',
      // Slide 9
      s9Header: '소셜 엔지니어링: 사람을 해킹하다',
      s9Desc: '기술이 아닌 ',
      s9DescStrong: '심리',
      s9DescEnd: '를 공격하는 기법',
      s9Card1Title: '권위',
      s9Card1Desc: '"사장님이 보낸 메일입니다"',
      s9Card2Title: '긴급성',
      s9Card2Desc: '"오늘 내로 확인해주세요"',
      s9Card3Title: '호기심',
      s9Card3Desc: '"연봉 인상 명단.xlsx"',
      // Slide 10
      s10Header: '이메일 헤더 분석',
      s10Item1Label: 'Received',
      s10Item1Desc: ' 이메일이 거쳐온 서버 경로 추적',
      s10Item2Label: 'X-Originating-IP',
      s10Item2Desc: ' 실제 발신자 IP 주소 확인',
      s10Item3Label: 'Return-Path',
      s10Item3Desc: ' 반송 주소와 From이 다르면 위조 의심',
      s10Item4Label: 'SPF/DKIM 결과',
      s10Item4Desc: ' Pass/Fail로 발신자 정당성 판단',
      // Slide 11
      s11Header: '첨부파일 해시 분석',
      s11Desc: '파일의 ',
      s11DescStrong: '디지털 지문',
      s11DescEnd: '을 추출하여 악성코드 여부를 확인',
      s11Card1Title: 'SHA-256 해시',
      s11Card1Desc: '고유한 64자 문자열',
      s11Card2Desc: '70개 이상 백신 엔진으로\n한 번에 검사',
      s11Card2Result: '결과: 42/70 탐지 → 악성!',
      // Slide 12
      s12Header: '매크로 분석 도구: olevba',
      s12Desc: 'oletools 패키지로 VBA 매크로를 안전하게 추출·분석',
      // Slide 13
      s13Header: '다중 레이어 방어 전략',
      s13Layer1Title: '1층: 이메일 게이트웨이',
      s13Layer1Desc: 'SPF/DKIM/DMARC 검증 + 첨부파일 필터링',
      s13Layer2Title: '2층: 엔드포인트 보호',
      s13Layer2Desc: '매크로 비활성화 + ASR 규칙 + EDR 모니터링',
      s13Layer3Title: '3층: 사용자 교육',
      s13Layer3Desc: '피싱 시뮬레이션 훈련 + 신고 프로세스',
      // Slide 14
      s14Header: '지금 바로 적용할 방어 설정',
      s14Item1: 'Office 매크로 기본 비활성화 (그룹 정책)',
      s14Item2: '위험 확장자 차단: .exe, .scr, .js, .vbs, .bat',
      s14Item3: 'SPF/DKIM/DMARC 레코드 설정',
      s14Item4: '외부 메일 경고 배너 표시',
      // Slide 15
      s15Title: '재생이 완료되었습니다.',
      s15Desc: '공격을 이해해야 방어할 수 있습니다. 수고하셨습니다!',
      s15Restart: '처음부터 다시 보기',
    },
    en: {
      s1Title: 'Spearphishing Attachment',
      s1Subtitle: 'Attack Tools & Principles',
      s1Quote: '"Understanding the attacker\'s weapons is the beginning of defense."',
      s2Header: 'SMTP: Email Transfer Protocol',
      s2Item1Label: 'What is SMTP?',
      s2Item1Desc: ' Simple Mail Transfer Protocol, a standard for delivering email between servers',
      s2Item2Label: 'Vulnerability',
      s2Item2Desc: ' MAIL FROM field can be freely set → sender forgery',
      s2Item3Label: 'Ports',
      s2Item3Desc: ' 25 (default), 587 (auth), 465 (SSL)',
      s2CodeSubject: 'Subject: Urgent Security Update...',
      s3Header: 'Email Authentication: SPF · DKIM · DMARC',
      s3SpfDesc: 'Checks if the sending server IP\nis on the allowed list',
      s3DkimDesc: 'Verifies email integrity\nvia digital signature',
      s3DmarcDesc: 'Applies policy based on\nSPF+DKIM results (reject/quarantine)',
      s3Warning: '⚠️ Domains missing all three are defenseless against sender forgery!',
      s4Header: 'MIME: The Secret of Email Attachments',
      s4Item1Label: 'What is MIME?',
      s4Item1Desc: ' Multipurpose Internet Mail Extensions, a standard for embedding various files in email',
      s4Item2Label: 'Content-Type',
      s4Item2Desc: ' Specifies file type: application/pdf, image/png, etc.',
      s4Item3Label: 'Exploitation',
      s4Item3Desc: ' Faking Content-Type or hiding malware via Base64 encoding',
      s5Header: 'VBA Macros: The Hidden Weapon in Office Documents',
      s5Desc: 'Visual Basic for Applications — A programming language embedded in Office documents',
      s6Header: 'Macro Attack Execution Flow',
      s6Step1: 'Receive Email',
      s6Step2: 'Open Document',
      s6Step3: 'Enable Content',
      s6Step4: 'Shell Call',
      s6Step5: 'PS Download',
      s6Step6: 'Malware Executes',
      s7Header: 'APT: Organized Attack Groups',
      s7Item1Label: 'What is APT?',
      s7Item1Desc: ' Advanced Persistent Threat, state-sponsored hacking groups',
      s7Item2Label: 'Characteristics',
      s7Item2Desc: ' Long-term infiltration over months to years, precision-targeted attacks',
      s7Item3Label: 'Difference from Phishing',
      s7Item3Desc: ' No mass sending → Custom-crafted for a single target',
      s7AptTitle: 'Notable APT Groups',
      s8Header: 'Case: APT28 Government Infiltration',
      s8CaseTitle: 'APT28 (Fancy Bear) Campaign',
      s8Step1: 'Collected department, title, and interests from employee LinkedIn profiles',
      s8Step2: 'Attached a .docm document disguised as a "security update notice"',
      s8Step3: 'Macro execution → C2 server connection → Lateral movement through internal network',
      s9Header: 'Social Engineering: Hacking Humans',
      s9Desc: 'A technique that attacks ',
      s9DescStrong: 'psychology',
      s9DescEnd: ', not technology',
      s9Card1Title: 'Authority',
      s9Card1Desc: '"This email is from the CEO"',
      s9Card2Title: 'Urgency',
      s9Card2Desc: '"Please confirm by end of today"',
      s9Card3Title: 'Curiosity',
      s9Card3Desc: '"Salary_Increase_List.xlsx"',
      s10Header: 'Email Header Analysis',
      s10Item1Label: 'Received',
      s10Item1Desc: ' Trace the server path the email traveled',
      s10Item2Label: 'X-Originating-IP',
      s10Item2Desc: ' Verify the actual sender IP address',
      s10Item3Label: 'Return-Path',
      s10Item3Desc: ' Suspect forgery if it differs from From',
      s10Item4Label: 'SPF/DKIM Results',
      s10Item4Desc: ' Judge sender legitimacy by Pass/Fail',
      s11Header: 'Attachment Hash Analysis',
      s11Desc: 'Extract the file\'s ',
      s11DescStrong: 'digital fingerprint',
      s11DescEnd: ' to check for malware',
      s11Card1Title: 'SHA-256 Hash',
      s11Card1Desc: 'A unique 64-character string',
      s11Card2Desc: 'Scan with 70+ antivirus engines\nat once',
      s11Card2Result: 'Result: 42/70 detected → Malicious!',
      s12Header: 'Macro Analysis Tool: olevba',
      s12Desc: 'Safely extract and analyze VBA macros with the oletools package',
      s13Header: 'Multi-Layer Defense Strategy',
      s13Layer1Title: 'Layer 1: Email Gateway',
      s13Layer1Desc: 'SPF/DKIM/DMARC verification + attachment filtering',
      s13Layer2Title: 'Layer 2: Endpoint Protection',
      s13Layer2Desc: 'Macro disable + ASR rules + EDR monitoring',
      s13Layer3Title: 'Layer 3: User Training',
      s13Layer3Desc: 'Phishing simulation drills + reporting process',
      s14Header: 'Defense Settings to Apply Now',
      s14Item1: 'Disable Office macros by default (Group Policy)',
      s14Item2: 'Block dangerous extensions: .exe, .scr, .js, .vbs, .bat',
      s14Item3: 'Configure SPF/DKIM/DMARC records',
      s14Item4: 'Display external email warning banner',
      s15Title: 'Playback Complete.',
      s15Desc: 'Understanding attacks is the first step to defense. Great work!',
      s15Restart: 'Watch Again from Start',
    },
    vi: null, ar: null, ja: null, zh: null, hi: null,
  };
  const t = T[language] || T.ko;

  return (
    <>
      {/* Slide 1: Intro */}
      <div className={`slide ${currentSlide === 0 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.08) 0%, transparent 60%)' }}>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-blue)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.3))' }}>
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '72px' }}>{t.s1Title}<br /><span>{t.s1Subtitle}</span></h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '16px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.s1Quote}</p>
        </div>
      </div>

      {/* Slide 2: SMTP 프로토콜 */}
      <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-paper-plane"></i> {t.s2Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s2Item1Label}</strong>{t.s2Item1Desc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px', color: '#ef4444' }}>{t.s2Item2Label}</strong>{t.s2Item2Desc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s2Item3Label}</strong>{t.s2Item3Desc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '30px', border: '2px solid var(--border)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', lineHeight: '2.2' }}>
                <span style={{ color: 'var(--accent-blue)' }}>HELO</span> mail.attacker.com<br />
                <span style={{ color: '#ef4444' }}>MAIL FROM:</span> &lt;ceo@company.com&gt;<br />
                <span style={{ color: 'var(--accent-purple)' }}>RCPT TO:</span> &lt;victim@company.com&gt;<br />
                <span style={{ color: 'var(--accent-blue)' }}>DATA</span><br />
                {t.s2CodeSubject}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 3: 이메일 인증 체계 */}
      <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-certificate"></i> {t.s3Header}</h2>
        <div className="slide-content center-layout">
          <div className="grid-3">
            <div className="card anim-el delay-2" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-server"></i></div>
              <h3>SPF</h3>
              <p style={{ fontSize: '20px', whiteSpace: 'pre-line' }}>{t.s3SpfDesc}</p>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '60px' }}><i className="fa-solid fa-signature"></i></div>
              <h3>DKIM</h3>
              <p style={{ fontSize: '20px', whiteSpace: 'pre-line' }}>{t.s3DkimDesc}</p>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '35px 25px', borderTopColor: '#ef4444' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: '#ef4444' }}><i className="fa-solid fa-shield-halved"></i></div>
              <h3>DMARC</h3>
              <p style={{ fontSize: '20px', whiteSpace: 'pre-line' }}>{t.s3DmarcDesc}</p>
            </div>
          </div>
          <p className="anim-el delay-5" style={{ marginTop: '35px', fontSize: '22px', color: '#ef4444' }}>{t.s3Warning}</p>
        </div>
      </div>

      {/* Slide 4: MIME 구조 */}
      <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-file-code"></i> {t.s4Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s4Item1Label}</strong>{t.s4Item1Desc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s4Item2Label}</strong>{t.s4Item2Desc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px', color: '#ef4444' }}>{t.s4Item3Label}</strong>{t.s4Item3Desc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '30px', border: '2px solid rgba(239,68,68,0.3)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', lineHeight: '2' }}>
                Content-Type: <span style={{ color: '#ef4444' }}>application/octet-stream</span><br />
                Content-Disposition: attachment;<br />
                &nbsp;&nbsp;filename="<span style={{ color: '#ef4444' }}>invoice.pdf.exe</span>"<br />
                Content-Transfer-Encoding: <span style={{ color: 'var(--accent-blue)' }}>base64</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 5: VBA 매크로 */}
      <div className={`slide ${currentSlide === 4 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-code"></i> {t.s5Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '26px', marginBottom: '40px' }}>{t.s5Desc}</p>
          <div className="anim-scale scale-delay-2" style={{ maxWidth: '800px', background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(168,85,247,0.05))', borderRadius: '20px', padding: '40px', border: '2px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', textAlign: 'left', lineHeight: '2.2' }}>
              <span style={{ color: '#ef4444' }}>Sub</span> <span style={{ color: 'var(--accent-purple)' }}>Auto_Open</span>()<br />
              &nbsp;&nbsp;<span style={{ color: 'var(--text-muted)' }}>' 문서 열면 자동 실행</span><br />
              &nbsp;&nbsp;<span style={{ color: 'var(--accent-blue)' }}>Dim</span> cmd <span style={{ color: 'var(--accent-blue)' }}>As</span> String<br />
              &nbsp;&nbsp;cmd = <span style={{ color: '#22c55e' }}>"powershell -w hidden -enc "</span> &amp; payload<br />
              &nbsp;&nbsp;Shell cmd, <span style={{ color: 'var(--accent-purple)' }}>vbHide</span><br />
              <span style={{ color: '#ef4444' }}>End Sub</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 6: 매크로 실행 흐름 */}
      <div className={`slide ${currentSlide === 5 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-diagram-project"></i> {t.s6Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: 'fa-envelope', label: t.s6Step1, color: 'var(--accent-blue)' },
              { icon: 'fa-file-word', label: t.s6Step2, color: 'var(--accent-purple)' },
              { icon: 'fa-mouse-pointer', label: t.s6Step3, color: '#f59e0b' },
              { icon: 'fa-terminal', label: t.s6Step4, color: '#ef4444' },
              { icon: 'fa-download', label: t.s6Step5, color: '#ef4444' },
              { icon: 'fa-skull-crossbones', label: t.s6Step6, color: '#ef4444' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className={`anim-el delay-${i + 2}`} style={{ textAlign: 'center', minWidth: '120px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--card-bg)', border: `3px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <i className={`fa-solid ${step.icon}`} style={{ fontSize: '32px', color: step.color }}></i>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{step.label}</p>
                </div>
                {i < 5 && <i className="fa-solid fa-chevron-right anim-fade" style={{ fontSize: '24px', color: 'var(--text-muted)', animation: `simpleFade 0.5s forwards ${0.8 + i * 0.3}s` }}></i>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 7: APT 그룹 */}
      <div className={`slide ${currentSlide === 6 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-user-secret"></i> {t.s7Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s7Item1Label}</strong>{t.s7Item1Desc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px' }}>{t.s7Item2Label}</strong>{t.s7Item2Desc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '24px' }}><strong style={{ fontSize: '28px', color: '#ef4444' }}>{t.s7Item3Label}</strong>{t.s7Item3Desc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="card anim-scale scale-delay-3" style={{ padding: '40px', borderTopColor: '#ef4444' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '20px' }}>{t.s7AptTitle}</h3>
              <div style={{ fontSize: '20px', lineHeight: '2.2', textAlign: 'left' }}>
                <p><strong>APT28</strong> (Fancy Bear) — Russia</p>
                <p><strong>APT29</strong> (Cozy Bear) — Russia</p>
                <p><strong>APT41</strong> (Winnti) — China</p>
                <p><strong>Lazarus</strong> — North Korea</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 8: APT28 사례 */}
      <div className={`slide ${currentSlide === 7 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-landmark"></i> {t.s8Header}</h2>
        <div className="slide-content center-layout">
          <div className="callout anim-el delay-2" style={{ maxWidth: '850px', padding: '40px', fontSize: '22px' }}>
            <p style={{ marginBottom: '20px' }}><strong style={{ color: '#ef4444', fontSize: '26px' }}>{t.s8CaseTitle}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div className="anim-el delay-3" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold', minWidth: '30px' }}>①</span>
                <span>{t.s8Step1}</span>
              </div>
              <div className="anim-el delay-4" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold', minWidth: '30px' }}>②</span>
                <span>{t.s8Step2}</span>
              </div>
              <div className="anim-el delay-5" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold', minWidth: '30px' }}>③</span>
                <span>{t.s8Step3}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 9: 소셜 엔지니어링 */}
      <div className={`slide ${currentSlide === 8 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-brain"></i> {t.s9Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '26px', marginBottom: '40px' }}>{t.s9Desc}<strong style={{ color: '#ef4444' }}>{t.s9DescStrong}</strong>{t.s9DescEnd}</p>
          <div className="grid-3">
            <div className="card anim-el delay-3" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: '#ef4444' }}><i className="fa-solid fa-crown"></i></div>
              <h3>{t.s9Card1Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s9Card1Desc}</p>
            </div>
            <div className="card purple anim-el delay-4" style={{ padding: '35px 25px' }}>
              <div className="card-icon" style={{ fontSize: '60px' }}><i className="fa-solid fa-clock"></i></div>
              <h3>{t.s9Card2Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s9Card2Desc}</p>
            </div>
            <div className="card anim-el delay-5" style={{ padding: '35px 25px', borderTopColor: 'var(--accent-blue)' }}>
              <div className="card-icon" style={{ fontSize: '60px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-eye"></i></div>
              <h3>{t.s9Card3Title}</h3>
              <p style={{ fontSize: '20px' }}>{t.s9Card3Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 10: 이메일 헤더 분석 */}
      <div className={`slide ${currentSlide === 9 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-magnifying-glass"></i> {t.s10Header}</h2>
        <div className="slide-content grid-2">
          <div>
            <ul className="info-list">
              <li className="anim-el delay-2" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>{t.s10Item1Label}</strong>{t.s10Item1Desc}</li>
              <li className="anim-el delay-3" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-purple)' }}>{t.s10Item2Label}</strong>{t.s10Item2Desc}</li>
              <li className="anim-el delay-4" style={{ fontSize: '22px' }}><strong style={{ color: '#ef4444' }}>{t.s10Item3Label}</strong>{t.s10Item3Desc}</li>
              <li className="anim-el delay-5" style={{ fontSize: '22px' }}><strong style={{ color: 'var(--accent-blue)' }}>{t.s10Item4Label}</strong>{t.s10Item4Desc}</li>
            </ul>
          </div>
          <div className="center-layout">
            <div className="anim-scale scale-delay-3" style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '25px', border: '2px solid var(--border)', textAlign: 'left' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', lineHeight: '2' }}>
                <span style={{ color: 'var(--accent-blue)' }}>Received:</span> from evil.server<br />
                <span style={{ color: '#ef4444' }}>X-Originating-IP:</span> 185.x.x.x<br />
                <span style={{ color: 'var(--accent-purple)' }}>Return-Path:</span> bounce@evil.com<br />
                <span style={{ color: '#22c55e' }}>Authentication-Results:</span><br />
                &nbsp;&nbsp;spf=<span style={{ color: '#ef4444' }}>fail</span>; dkim=<span style={{ color: '#ef4444' }}>none</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 11: 해시값 & VirusTotal */}
      <div className={`slide ${currentSlide === 10 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-fingerprint"></i> {t.s11Header}</h2>
        <div className="slide-content center-layout">
          <p className="anim-el delay-2" style={{ fontSize: '26px', marginBottom: '40px' }}>{t.s11Desc}<strong style={{ color: 'var(--accent-blue)' }}>{t.s11DescStrong}</strong>{t.s11DescEnd}</p>
          <div className="grid-2" style={{ maxWidth: '850px' }}>
            <div className="card anim-el delay-3" style={{ padding: '35px' }}>
              <div className="card-icon" style={{ fontSize: '50px' }}><i className="fa-solid fa-hashtag"></i></div>
              <h3>{t.s11Card1Title}</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginTop: '15px', wordBreak: 'break-all', color: 'var(--accent-blue)' }}>
                a1b2c3d4e5f6...
              </div>
              <p style={{ fontSize: '18px', marginTop: '10px' }}>{t.s11Card1Desc}</p>
            </div>
            <div className="card purple anim-el delay-4" style={{ padding: '35px' }}>
              <div className="card-icon" style={{ fontSize: '50px' }}><i className="fa-solid fa-virus-slash"></i></div>
              <h3>VirusTotal</h3>
              <p style={{ fontSize: '18px', marginTop: '15px', whiteSpace: 'pre-line' }}>{t.s11Card2Desc}</p>
              <p style={{ fontSize: '16px', marginTop: '10px', color: '#ef4444' }}>{t.s11Card2Result}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 12: olevba 도구 */}
      <div className={`slide ${currentSlide === 11 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-toolbox"></i> {t.s12Header}</h2>
        <div className="slide-content center-layout">
          <div className="anim-scale scale-delay-2" style={{ maxWidth: '850px', background: 'var(--card-bg)', borderRadius: '16px', padding: '35px', border: '2px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', lineHeight: '2.2' }}>
              <span style={{ color: 'var(--accent-blue)' }}>$</span> olevba suspicious.docm<br />
              <span style={{ color: 'var(--text-muted)' }}>───────────────────────</span><br />
              <span style={{ color: '#ef4444' }}>AutoExec:</span> Auto_Open<br />
              <span style={{ color: '#ef4444' }}>Suspicious:</span> Shell, PowerShell<br />
              <span style={{ color: '#ef4444' }}>IOC:</span> http://evil.com/payload.exe<br />
              <span style={{ color: 'var(--accent-purple)' }}>Encoded:</span> Base64 string detected
            </div>
          </div>
          <p className="anim-el delay-4" style={{ marginTop: '30px', fontSize: '22px' }}>{t.s12Desc}</p>
        </div>
      </div>

      {/* Slide 13: 다중 레이어 방어 */}
      <div className={`slide ${currentSlide === 12 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-layer-group"></i> {t.s13Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '700px' }}>
            <div className="card anim-el delay-2" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '25px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '32px', color: 'var(--accent-blue)' }}></i>
              </div>
              <div><h3 style={{ marginBottom: '5px' }}>{t.s13Layer1Title}</h3><p style={{ fontSize: '20px' }}>{t.s13Layer1Desc}</p></div>
            </div>
            <div className="card purple anim-el delay-3" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '25px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-shield-virus" style={{ fontSize: '32px', color: 'var(--accent-purple)' }}></i>
              </div>
              <div><h3 style={{ marginBottom: '5px' }}>{t.s13Layer2Title}</h3><p style={{ fontSize: '20px' }}>{t.s13Layer2Desc}</p></div>
            </div>
            <div className="card anim-el delay-4" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '25px', borderTopColor: '#22c55e' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-graduation-cap" style={{ fontSize: '32px', color: '#22c55e' }}></i>
              </div>
              <div><h3 style={{ marginBottom: '5px' }}>{t.s13Layer3Title}</h3><p style={{ fontSize: '20px' }}>{t.s13Layer3Desc}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 14: 기본 방어 설정 */}
      <div className={`slide ${currentSlide === 13 ? 'active' : ''}`}>
        <h2 className="slide-header anim-el delay-1"><i className="fa-solid fa-gear"></i> {t.s14Header}</h2>
        <div className="slide-content center-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '800px' }}>
            {[
              { icon: 'fa-ban', text: t.s14Item1, color: '#ef4444' },
              { icon: 'fa-filter', text: t.s14Item2, color: 'var(--accent-purple)' },
              { icon: 'fa-envelope-circle-check', text: t.s14Item3, color: 'var(--accent-blue)' },
              { icon: 'fa-bell', text: t.s14Item4, color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className={`anim-el delay-${i + 2}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '20px 30px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '26px', color: item.color, minWidth: '35px' }}></i>
                <span style={{ fontSize: '22px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 15: Outro */}
      <div className={`slide ${currentSlide === 14 ? 'active' : ''}`} style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)' }}>
        {confettiParticles && confettiParticles.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%', width: p.size + 'px', height: p.size + 'px', backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : '2px', opacity: p.opacity, transform: `rotate(${p.rotation}deg)`, transition: 'all 0.5s ease-out' }} />
        ))}
        <div className="slide-content center-layout" style={{ zIndex: 1 }}>
          <div className="anim-scale scale-delay-1 float" style={{ fontSize: '150px', color: 'var(--accent-green)', marginBottom: '30px', filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.3))' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h1 className="title large anim-el delay-2" style={{ fontSize: '68px' }}>{t.s15Title}</h1>
          <p className="anim-fade" style={{ fontSize: '26px', marginTop: '8px', animation: 'simpleFade 1s forwards 1.8s', letterSpacing: '0.5px' }}>{t.s15Desc}</p>
          <button onClick={onRestart} className="anim-fade control-btn" style={{ marginTop: '40px', padding: '18px 50px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(16,185,129,0.15))', border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)', fontSize: '22px', fontFamily: "var(--font-sans, 'Paperlogy'), sans-serif", fontWeight: 'bold', cursor: 'pointer', borderRadius: '14px', animation: 'simpleFade 1s forwards 2.5s', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(56,189,248,0.15)' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '10px' }}></i> {t.s15Restart}
          </button>
        </div>
      </div>
    </>
  );
}

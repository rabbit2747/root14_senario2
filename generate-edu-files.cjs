const fs = require('fs');
const path = require('path');

const EDU_DIR = path.join(__dirname, 'public', 'edu');
const JSON_DIR = path.join(__dirname, 'src', 'data', 'lab-scenarios');

function generateHTML(config) {
  const { techId, pageId, title, titleEn, tactic, description, ch1Title, ch1Content, ch1Cards, ch2Title, ch2Terminal, ch2Defense, ch3Defense, simLines, quizQ, quizChoices, quizCorrectIdx, quizExplainCorrect, quizExplainWrong } = config;

  return `<!DOCTYPE html>
<html lang="ko" class="light" data-technique-id="${techId}">
<head>
    <script>(function(){if(new URLSearchParams(window.location.search).get('preview')==='1')return;try{var key='sb-bnwbybawqrnhznirivfg-auth-token';var s=localStorage.getItem(key);if(!s||!JSON.parse(s)){window.location.replace('/login?redirect='+encodeURIComponent(window.location.href));}}catch(e){window.location.replace('/login');}})()</script>
    <script>var _eduDynLoaded=false;(async function(){try{var SUPA='https://bnwbybawqrnhznirivfg.supabase.co';var KEY='sb_publishable_fiXeTnAxpTatUSnC0ZvOWg_x5eSbL1w';var res=await fetch(SUPA+'/rest/v1/edu_html_content?page_id=eq.${pageId}&select=content&limit=1',{headers:{'apikey':KEY,'Authorization':'Bearer '+KEY}});if(res.ok){var data=await res.json();if(data&&data.length>0&&data[0].content){_eduDynLoaded=true;document.open();document.write(data[0].content);document.close();return;}}}catch(e){}document.documentElement.classList.add('edu-ready');})();setTimeout(function(){if(!_eduDynLoaded)document.documentElement.classList.add('edu-ready');},3000);</script>
    <style>html:not(.edu-ready) body{visibility:hidden;}html.edu-ready body{visibility:visible;}</style>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <meta name="description" content="GOTROOT EDU — ${techId} ${titleEn} ${title} 교육">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self';" />
    <title>GOTROOT EDU | ${techId} ${titleEn}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],mono:['JetBrains Mono','monospace']},colors:{cbg:'#FFF8F0',cyel:'#F4D06F',cteal:'#9DD9D2',cdark:'#1e293b',cgray:'#475569'}}}}</script>
    <style>body{scroll-behavior:smooth;background:#FFF8F0;color:#1e293b;transition:background .3s,color .3s}.glass-panel{background:rgba(255,255,255,.7);backdrop-filter:blur(16px);border:1px solid rgba(157,217,210,.5);box-shadow:0 8px 32px rgba(30,41,59,.05)}.dark body{background:#0f172a;color:#f8fafc}.dark .glass-panel{background:rgba(30,41,59,.7);border:1px solid rgba(244,208,111,.2)}.hl-teal{color:#0f766e;font-weight:700}.dark .hl-teal{color:#9DD9D2}.hl-yel{color:#b45309;font-weight:700}.dark .hl-yel{color:#F4D06F}.nav-item.active{background:linear-gradient(90deg,rgba(157,217,210,.3),transparent);border-left:4px solid #9DD9D2;color:#0f766e;font-weight:700}.dark .nav-item.active{background:linear-gradient(90deg,rgba(244,208,111,.2),transparent);border-left:4px solid #F4D06F;color:#F4D06F}.terminal-bg{background:#1e293b;color:#9DD9D2;font-family:'JetBrains Mono',monospace}</style>
</head>
<body class="flex flex-col h-screen overflow-hidden">
    <div class="w-full px-4 py-1.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shrink-0 z-[60]" style="font-family:'JetBrains Mono',monospace;"><div class="flex items-center gap-2"><span style="font-size:9px;font-weight:900;color:#bb3e03;letter-spacing:.25em;">GOTROOT</span><span style="font-size:8px;color:#94a3b8;">|</span><span style="font-size:8px;color:#64748b;" class="hidden sm:inline">사이버보안 교육 플랫폼</span></div><button onclick="location.href='/'" style="font-size:8px;color:#bb3e03;background:transparent;border:1px solid rgba(187,62,3,.3);padding:3px 10px;border-radius:4px;cursor:pointer;font-family:inherit;">&larr; 매트릭스 대시보드</button></div>
    <div class="flex flex-1 overflow-hidden">
    <button onclick="toggleTheme()" class="fixed top-12 right-6 z-50 p-3 rounded-full glass-panel hover:scale-110 transition-transform shadow-lg"><span id="theme-icon" class="text-xl">🌙</span></button>
    <aside class="w-64 glass-panel border-r border-[#9DD9D2]/30 h-full hidden md:flex flex-col shrink-0 z-40"><div class="p-6 border-b border-[#9DD9D2]/30"><button onclick="location.href='/'" class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 mb-4 transition-colors"><span>&larr;</span><span>대시보드로 돌아가기</span></button><h1 class="text-xl font-bold font-mono hl-teal tracking-tighter">ATT&CK Matrix</h1><p class="text-xs text-cgray dark:text-slate-400 mt-2">${techId}: ${titleEn}</p></div>
        <nav class="flex-1 overflow-y-auto py-4"><button onclick="go('ch1')" class="nav-item active w-full text-left px-6 py-3 text-sm text-cgray dark:text-slate-400" data-target="ch1">1. 개념과 원리</button><button onclick="go('ch2')" class="nav-item w-full text-left px-6 py-3 text-sm text-cgray dark:text-slate-400" data-target="ch2">2. 공격 기법 분석</button><button onclick="go('ch3')" class="nav-item w-full text-left px-6 py-3 text-sm text-cgray dark:text-slate-400" data-target="ch3">3. 탐지 및 방어</button></nav></aside>
    <main class="flex-1 overflow-y-auto h-full scroll-smooth" id="main-scroll">
        <div class="max-w-4xl mx-auto p-6 md:p-12 pb-24 space-y-32">
            <header class="text-center pt-8"><div class="inline-block px-4 py-1 rounded-full bg-[#F4D06F]/20 border border-[#F4D06F] hl-yel font-mono text-sm mb-4">${tactic}</div><h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 dark:text-white">${titleEn}</h1><p class="text-cgray dark:text-slate-400 text-lg">${description}</p></header>
            <section id="ch1" class="scroll-mt-12 opacity-0 translate-y-10 transition-all duration-700 section-observe">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#9DD9D2] pb-2 dark:text-white"><span class="hl-teal">#1.</span> 개념과 원리</h2>
                <div class="space-y-6">
                    <div class="glass-panel p-6 rounded-xl border-l-4 border-l-[#F4D06F]"><h3 class="font-bold text-lg mb-2 hl-yel">${ch1Title}</h3><p class="text-cgray dark:text-slate-300 leading-relaxed">${ch1Content}</p></div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">${ch1Cards.map((c,i) => {
                      const colors = ['red','yellow','purple'];
                      const cl = colors[i%3];
                      const darkCl = cl === 'yellow' ? 'hl-yel' : `text-${cl}-600 dark:text-${cl}-400`;
                      return `
                        <div class="glass-panel p-4 rounded-xl border-l-4 border-l-${cl}-400"><h4 class="font-bold text-sm ${darkCl} mb-2">${c.title}</h4><p class="text-xs text-cgray dark:text-slate-400">${c.desc}</p></div>`;
                    }).join('')}
                    </div>
                </div>
            </section>
            <section id="ch2" class="scroll-mt-12 opacity-0 translate-y-10 transition-all duration-700 section-observe">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#9DD9D2] pb-2 dark:text-white"><span class="hl-teal">#2.</span> 공격 기법 분석</h2>
                <div class="space-y-6">
                    <div class="terminal-bg rounded-xl p-4 text-xs">${ch2Terminal.map(l => `<div${l.startsWith('#') ? ' class="text-[#F4D06F]"' : l.startsWith('//') ? ' class="text-slate-500"' : ''}>${l}</div>`).join('\n                        ')}</div>
                    <div class="glass-panel p-6 rounded-xl border-l-4 border-l-red-400"><h3 class="font-bold text-lg mb-2 text-red-600 dark:text-red-400">${ch2Title || '공격 분석'}</h3><ul class="list-disc list-inside text-sm text-cgray dark:text-slate-300 space-y-2">${ch2Defense.map(d => `<li>${d}</li>`).join('')}</ul></div>
                </div>
            </section>
            <section id="ch3" class="scroll-mt-12 opacity-0 translate-y-10 transition-all duration-700 section-observe">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#9DD9D2] pb-2 dark:text-white"><span class="hl-teal">#3.</span> 탐지 및 방어 + 퀴즈</h2>
                <div class="space-y-6">
                    <div class="glass-panel p-6 rounded-xl border-l-4 border-l-green-400"><h3 class="font-bold text-lg mb-2 text-green-700 dark:text-green-400">방어 전략</h3><ul class="list-disc list-inside text-sm text-cgray dark:text-slate-300 space-y-2">${ch3Defense.map(d => `<li>${d}</li>`).join('')}</ul></div>
                    <div class="glass-panel p-6 rounded-xl border-l-4 border-l-[#9DD9D2]"><h3 class="font-bold text-lg mb-4 hl-teal">미니 실습</h3>
                        <div class="terminal-bg rounded-lg p-4 text-xs mb-4">
                            <div class="text-slate-400 mb-2">[ ${titleEn} Simulation ]</div>
                            <div id="sim-output" class="space-y-1"><div class="text-[#9DD9D2]">$ 분석 시작...</div></div>
                            <button onclick="runSim()" class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-mono">&#9654; 시뮬레이션 실행</button>
                        </div>
                    </div>
                    <div class="glass-panel p-6 rounded-xl border-l-4 border-l-[#F4D06F]"><h3 class="font-bold text-lg mb-4 hl-yel">퀴즈</h3><div id="quiz-area" class="space-y-4">
                        <p class="text-sm text-cgray dark:text-slate-300 font-bold">${quizQ}</p>
                        <div class="space-y-2">${quizChoices.map((c, i) => `<button onclick="checkQuiz(this,'${i === quizCorrectIdx ? 'correct' : 'wrong'}')" class="block w-full text-left px-4 py-2 rounded-lg glass-panel text-sm hover:border-[#F4D06F] transition-colors">${String.fromCharCode(65+i)}. ${c}</button>`).join('')}</div>
                        <p id="quiz-result" class="text-sm font-bold mt-2 hidden"></p>
                    </div></div>
                </div>
            </section>
        </div>
    </main>
    </div>
<script>
function toggleTheme(){document.documentElement.classList.toggle('dark');document.getElementById('theme-icon').textContent=document.documentElement.classList.contains('dark')?'\\u2600\\uFE0F':'\\uD83C\\uDF19';}
function go(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'});document.querySelectorAll('.nav-item').forEach(n=>{n.classList.toggle('active',n.dataset.target===id);});}
document.getElementById('main-scroll')?.addEventListener('scroll',()=>{const sects=['ch1','ch2','ch3'];let cur='ch1';sects.forEach(s=>{const el=document.getElementById(s);if(el&&el.getBoundingClientRect().top<200)cur=s;});document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.target===cur));});
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('opacity-0','translate-y-10');e.target.classList.add('opacity-100','translate-y-0');}}),{threshold:0.1});document.querySelectorAll('.section-observe').forEach(s=>obs.observe(s));
function runSim(){const o=document.getElementById('sim-output');const lines=${JSON.stringify(simLines)};let i=0;const iv=setInterval(()=>{if(i>=lines.length){clearInterval(iv);return;}o.innerHTML+='<div class="'+(lines[i].includes('\\u26A0')?'text-red-400':'text-[#9DD9D2]')+'">'+lines[i]+'</div>';i++;},500);}
function checkQuiz(el,r){const res=document.getElementById('quiz-result');res.classList.remove('hidden');if(r==='correct'){res.textContent='\\u2705 '+${JSON.stringify(quizExplainCorrect)};res.className='text-sm font-bold mt-2 text-green-600 dark:text-green-400';}else{res.textContent='\\u274C '+${JSON.stringify(quizExplainWrong)};res.className='text-sm font-bold mt-2 text-red-600 dark:text-red-400';}}
</script>
</body>
</html>`;
}

// All 19 remaining technique configurations
const techniques = [
  // 5. T1078.001 Default Accounts
  {
    techId: 'T1078.001', pageId: 't1078-001-default-accounts', fileName: 't1078-001-default-accounts',
    title: '기본 계정 악용', titleEn: 'Default Accounts', tactic: 'Initial Access',
    description: '장비/소프트웨어의 기본 계정(admin/admin)을 악용하여 초기 접근을 획득',
    ch1Title: '기본 계정 악용이란?', ch1Content: '<strong>네트워크 장비, IoT 디바이스, 소프트웨어에 기본 설정된 계정(admin/admin, root/root 등)을 변경하지 않고 사용하는 경우</strong>, 공격자가 쉽게 접근할 수 있습니다. Shodan 등으로 인터넷에 노출된 장비를 검색하고, 제조사 매뉴얼에 공개된 기본 자격증명으로 로그인합니다. Mirai 봇넷은 텔넷 기본 계정으로 수십만 대의 IoT 디바이스를 감염시켰습니다.',
    ch1Cards: [
      { title: '네트워크 장비', desc: '라우터, 스위치, AP의 admin/admin 기본 계정' },
      { title: 'IoT 디바이스', desc: 'IP 카메라, 프린터, NAS의 제조사 기본 비밀번호' },
      { title: '관리 콘솔', desc: 'Jenkins, Tomcat, phpMyAdmin의 기본 관리자 계정' }
    ],
    ch2Title: '공격 벡터 분석', ch2Terminal: ['# Shodan으로 기본 계정 장비 검색','shodan search "default password" port:23,80,443','','# Mirai 봇넷 스타일 - 텔넷 기본 계정 스캔','hydra -L default_users.txt -P default_pass.txt telnet://192.168.1.0/24','','# 결과: admin/admin, root/root, admin/1234 등','// 제조사별 기본 계정은 공개 데이터베이스에서 확인 가능'],
    ch2Defense: ['<strong>기본 계정 무차별 대입</strong>: Hydra, Medusa로 알려진 기본 자격증명 시도','<strong>Shodan/Censys 검색</strong>: 인터넷에 노출된 관리 인터페이스 발견','<strong>제조사 매뉴얼 참조</strong>: 공개된 기본 비밀번호 목록 활용','<strong>자동화 봇넷</strong>: Mirai처럼 대규모 자동 스캔 및 감염'],
    ch3Defense: ['<strong>초기 설정 시 기본 비밀번호 변경 필수화</strong>','<strong>네트워크 세분화</strong>: IoT/OT 장비를 별도 VLAN으로 격리','<strong>자산 관리</strong>: 모든 장비의 기본 계정 변경 여부 점검','<strong>포트 제한</strong>: Telnet(23), HTTP(80) 관리 포트 외부 차단','<strong>자격증명 스캐너</strong>: 정기적으로 기본 계정 사용 여부 점검'],
    simLines: ['$ 네트워크 스캔 시작...','$ 192.168.1.1 - 라우터 (포트 80 오픈)','$ 192.168.1.50 - IP 카메라 (포트 554 RTSP)','$ 192.168.1.100 - NAS (포트 443)','$ ','$ 기본 계정 테스트:','$   192.168.1.1 admin/admin → 로그인 성공! ⚠️','$   192.168.1.50 admin/12345 → 로그인 성공! ⚠️','$   192.168.1.100 admin/admin → 실패 (변경됨) ✓','$ ','$ ⚠️ 2대의 장비에서 기본 계정 사용 확인!'],
    quizQ: 'Q1. Mirai 봇넷이 수십만 대의 IoT를 감염시킬 수 있었던 주요 원인은?',
    quizChoices: ['제로데이 취약점을 사용했기 때문','기본 계정(admin/admin 등)을 변경하지 않은 장비가 많았기 때문','암호화를 우회했기 때문','내부자가 도움을 줬기 때문'],
    quizCorrectIdx: 1, quizExplainCorrect: '정답! Mirai는 62개의 알려진 기본 자격증명 목록으로 텔넷 로그인을 시도했습니다.', quizExplainWrong: '오답. Mirai의 핵심은 제조사 기본 계정을 변경하지 않은 IoT 장비를 자동으로 감염시킨 것입니다.',
    jsonData: {
      title: "기본 계정 악용 시뮬레이션", titleEn: "Default Accounts Exploitation Simulation", duration: 6,
      phases: [{"label":"🔍 장비 스캔","labelEn":"🔍 Device Scanning","steps":[0]},{"label":"🔑 기본 계정 접근","labelEn":"🔑 Default Login","steps":[1]},{"label":"🎯 장비 장악","labelEn":"🎯 Device Takeover","steps":[2]},{"label":"🔍 탐지 & 방어","labelEn":"🔍 Detection & Defense","steps":[3]}],
      topoNodes: [{"id":"attacker","label":"Attacker\n(Scanner)","x":50,"y":80},{"id":"router","label":"Router\n(admin/admin)","x":180,"y":30},{"id":"camera","label":"IP Camera\n(default)","x":180,"y":130},{"id":"internal","label":"Internal\nNetwork","x":330,"y":80},{"id":"botnet","label":"Botnet\nC2","x":480,"y":80}],
      topoEdges: [{"from":"attacker","to":"router","minStep":1},{"from":"attacker","to":"camera","minStep":1},{"from":"router","to":"internal","minStep":2},{"from":"camera","to":"botnet","minStep":2}],
      desktopIcons: [{"name":"Shodan","icon":"🔍"},{"name":"Hydra","icon":"🔑"},{"name":"Telnet","icon":"💻"},{"name":"Router Admin","icon":"🌐"},{"name":"SIEM","icon":"📊"}],
      steps: [
        {cmd:"# Shodan으로 기본 계정 장비 검색\nshodan search 'default password' --fields ip_str,port,org\n\n# Nmap 서비스 스캔\nnmap -sV -p 23,80,443,8080 192.168.1.0/24\n\n# 결과에서 관리 인터페이스 식별\ncurl -s http://192.168.1.1 | grep -i 'login\\|admin'",out:"[Shodan 검색 결과]\nIP: 203.0.113.10 Port: 23 (Telnet) Org: ISP-Korea\nIP: 203.0.113.25 Port: 80 (HTTP) Org: SmallBiz Corp\nIP: 203.0.113.50 Port: 8080 (HTTP) Org: IoT-Factory\n\n[Nmap 스캔 결과]\n192.168.1.1 - Cisco IOS (Port 23,80)\n192.168.1.50 - Hikvision IP Camera (Port 80,554)\n192.168.1.100 - Synology NAS (Port 443,5000)\n192.168.1.200 - HP Printer (Port 80,9100)\n\n[관리 인터페이스]\n4개 장비 관리 페이지 발견\n기본 계정 데이터베이스: 62개 제조사",def:"[Network Scan] External scanning detected — Shodan fingerprinting and port scanning activity",defAction:"Tool: Shodan + Nmap\nTargets: 4 devices with management interfaces\nPorts: Telnet(23), HTTP(80,8080), HTTPS(443)\nDefault Credential DB: 62 manufacturers\nRisk Level: Reconnaissance phase\nAction: Block scanning IPs, audit exposed services",desc:"Shodan과 Nmap으로 네트워크에서 관리 인터페이스가 노출된 장비를 검색합니다. 62개 제조사의 기본 계정 데이터베이스를 준비합니다.",descEn:"Scan network for devices with exposed management interfaces using Shodan and Nmap. Prepare default credential database for 62 manufacturers.",stepTitle:"장비 스캔 + 기본 계정 데이터베이스 준비",stepTitleEn:"Device Scanning + Default Credential Database",feynman:"도둑이 동네(네트워크)를 돌아다니며 문이 열려 있는 집(관리 인터페이스)을 찾습니다. 열쇠 제조사별 '출고 시 기본 열쇠'(기본 비밀번호) 목록을 가지고 다닙니다.",feynmanEn:"A thief walks around the neighborhood (network) looking for open doors (management interfaces), carrying a list of factory default keys (passwords) for each lock manufacturer.",expert:"Shodan은 인터넷에 연결된 장비의 배너 정보를 수집하는 검색 엔진입니다. 기본 계정 데이터베이스(예: default-password.info, cirt.net)에는 수천 개의 제조사별 기본 자격증명이 공개되어 있습니다. Mirai 소스코드에는 62개의 기본 사용자명/비밀번호 쌍이 하드코딩되어 있었습니다.",expertEn:"Shodan collects banner info from internet-connected devices. Default credential databases contain thousands of manufacturer defaults. Mirai source code had 62 hardcoded username/password pairs.",defTooltip:"🔐 4대 장비 관리 인터페이스 노출!",defTooltipEn:"🔐 4 devices with exposed management interfaces!",hackerLog:{title:"scan.log",lines:["[08:00:00] Shodan 검색 시작","[08:05:00] 4대 장비 발견","[08:10:00] 관리 인터페이스 확인","[08:15:00] 기본 계정 DB 준비"]},terms:[{term:"Shodan",def:"인터넷에 연결된 장비를 검색하는 검색 엔진, 배너/포트/서비스 정보 수집"},{term:"Mirai",def:"IoT 기본 계정을 악용하여 대규모 DDoS 봇넷을 구축한 악성코드 (2016)"}]},
        {cmd:"# 기본 계정으로 로그인 시도\n# Hydra 무차별 대입 (기본 계정 목록)\nhydra -L defaults.txt -P defaults.txt \\\n  192.168.1.1 http-get /login\n\n# 텔넷 기본 계정\ntelnet 192.168.1.1\n# Username: admin\n# Password: admin\n\n# IP 카메라 기본 계정\ncurl -u admin:12345 http://192.168.1.50/api/status",out:"[기본 계정 테스트 결과]\n\n192.168.1.1 (Cisco Router):\n  admin/admin → 성공! ⚠️\n  enable password: cisco → 성공! ⚠️\n  권한: Level 15 (최고 관리자)\n\n192.168.1.50 (Hikvision Camera):\n  admin/12345 → 성공! ⚠️\n  권한: Administrator\n  기능: PTZ 제어, 녹화, 스트리밍\n\n192.168.1.100 (Synology NAS):\n  admin/admin → 실패 ✓ (변경됨)\n  admin/synology → 실패 ✓\n\n192.168.1.200 (HP Printer):\n  admin/(빈 비밀번호) → 성공! ⚠️\n  권한: 관리자 (네트워크 설정 변경 가능)\n\n[결과: 4대 중 3대 기본 계정 사용]",def:"[SIEM] Multiple successful logins with default credentials — 3 devices compromised",defAction:"Tool: Hydra + Telnet + HTTP Basic Auth\nRouter: admin/admin (Level 15 access)\nCamera: admin/12345 (full control)\nPrinter: admin/(empty) (network settings)\nNAS: Secured (password changed)\nCompromised: 3/4 devices\nRisk Level: Critical\nAction: Change all default passwords immediately",desc:"Hydra로 기본 계정을 시도하여 라우터, IP 카메라, 프린터 3대에 관리자 권한으로 로그인합니다. NAS만 비밀번호가 변경되어 있었습니다.",descEn:"Use Hydra to test default credentials. Successfully log into router, IP camera, and printer with admin access. Only NAS had changed passwords.",stepTitle:"기본 계정 로그인 + 관리자 권한 획득",stepTitleEn:"Default Credential Login + Admin Access",feynman:"기본 열쇠(admin/admin)로 3개의 문을 열었습니다. 라우터는 집 전체의 통로를 제어하고, 카메라는 모든 것을 녹화하며, 프린터는 네트워크 설정을 변경할 수 있습니다. NAS만 열쇠를 바꿔서 안전했습니다.",feynmanEn:"Opened 3 doors with factory keys (admin/admin). Router controls all pathways, camera records everything, printer changes network settings. Only NAS was safe because the lock was changed.",expert:"Hydra는 병렬 네트워크 로그인 크래커로, HTTP, Telnet, SSH, FTP 등 50개 이상의 프로토콜을 지원합니다. Cisco IOS의 enable 비밀번호 'cisco'는 가장 흔한 기본값입니다. Hikvision은 2017년 이후 초기 설정 시 비밀번호 변경을 강제하지만, 구형 모델은 여전히 12345가 기본입니다.",expertEn:"Hydra is a parallel network login cracker supporting 50+ protocols. Cisco IOS 'cisco' enable password is the most common default. Hikvision enforces password change since 2017, but older models default to 12345.",defTooltip:"🔐 3대 장비 기본 계정 접근 성공!",defTooltipEn:"🔐 Default credential access on 3 devices!",hackerLog:{title:"login.log",lines:["[08:20:00] Hydra 기본 계정 테스트","[08:20:05] 라우터 admin/admin 성공","[08:20:10] 카메라 admin/12345 성공","[08:20:15] 프린터 admin/(빈) 성공"]},terms:[{term:"Hydra",def:"병렬 네트워크 로그인 크래커, 50+ 프로토콜의 자격증명 무차별 대입 지원"},{term:"Enable Password",def:"Cisco IOS의 특권 모드(Level 15) 접근을 위한 비밀번호"}]},
        {cmd:"# 장악된 장비를 통한 네트워크 확장\n# 라우터: 네트워크 구조 파악 + ACL 수정\nshow running-config\nshow ip route\nshow ip arp\n\n# ACL 수정 (외부 접근 허용)\nconf t\naccess-list 101 permit ip any any\ninterface GigabitEthernet0/1\n ip access-group 101 in\nexit",out:"[라우터 장악 결과]\nRunning Config: 전체 네트워크 구조 확인\nRoutes: 내부 서브넷 5개 발견\nARP Table: 활성 호스트 127대\nACL: 외부 접근 허용으로 변경 ⚠️\n\n[IP 카메라 장악]\n영상 스트리밍: RTSP 접근 가능\nPTZ 제어: 원격 조작 가능\n저장 영상: 30일분 접근 가능\n네트워크: 카메라 VLAN → 서버 VLAN 접근\n\n[프린터 장악]\n인쇄 기록: 최근 문서 1,247건 확인\nSMB 공유: 스캔 문서 접근 가능\nLDAP 설정: 도메인 자격증명 노출\nFirmware: 백도어 삽입 가능\n\n[피해 범위]\n- 전체 네트워크 구조 노출\n- ACL 우회로 외부 접근 허용\n- 127대 호스트 정보 수집\n- 기밀 문서/영상 접근 가능",def:"[SIEM] Router ACL modified — unauthorized external access permitted, lateral movement detected",defAction:"Tool: Cisco CLI + RTSP + SMB\nRouter: Full network visibility, ACL bypassed\nCamera: Video access, PTZ control, 30-day archive\nPrinter: 1,247 print jobs, LDAP credentials exposed\nNetwork: 5 subnets, 127 hosts discovered\nRisk Level: Critical — full network compromise\nAction: Reset all devices, restore ACLs, rotate credentials",desc:"라우터 관리자 권한으로 ACL을 수정하여 외부 접근을 허용하고, 전체 네트워크 구조를 파악합니다. IP 카메라 영상과 프린터 문서에 접근합니다.",descEn:"Modify router ACLs with admin access to allow external entry. Map entire network structure. Access IP camera footage and printer documents.",stepTitle:"네트워크 장악 + ACL 수정 + 정보 수집",stepTitleEn:"Network Takeover + ACL Modification + Intelligence",feynman:"열린 문(기본 계정)으로 들어가 집 관리인(라우터)의 열쇠 꾸러미를 가져옵니다. 모든 방의 잠금을 해제하고(ACL 수정), CCTV를 보고(카메라), 문서함을 뒤집니다(프린터).",feynmanEn:"Enter through unlocked doors (default accounts), take the caretaker's (router's) keys. Unlock all rooms (ACL modification), watch CCTV (camera), search filing cabinets (printer).",expert:"Cisco IOS의 ACL(Access Control List)은 네트워크 트래픽 필터링의 핵심입니다. 'permit ip any any'는 모든 트래픽을 허용하는 가장 위험한 설정입니다. RTSP(Real Time Streaming Protocol, 포트 554)는 기본적으로 암호화 없이 영상을 전송합니다. 프린터의 LDAP 설정에는 Active Directory 바인드 자격증명이 평문으로 저장되는 경우가 많습니다.",expertEn:"Cisco IOS ACLs are core network traffic filters. 'permit ip any any' is the most dangerous rule. RTSP (port 554) streams video without encryption by default. Printer LDAP settings often store AD bind credentials in cleartext.",defTooltip:"🔐 ACL 수정! 127대 호스트 노출!",defTooltipEn:"🔐 ACL modified! 127 hosts exposed!",hackerLog:{title:"takeover.log",lines:["[08:30:00] 라우터 설정 확인","[08:35:00] ACL 수정 (외부 접근 허용)","[08:40:00] 카메라 RTSP 접근","[08:45:00] 프린터 문서 1,247건 접근"]},terms:[{term:"ACL",def:"Access Control List, 네트워크 트래픽의 허용/차단 규칙 목록"},{term:"RTSP",def:"Real Time Streaming Protocol, IP 카메라 등의 실시간 영상 스트리밍 프로토콜"}]},
        {cmd:"# 기본 계정 방어 종합\n# 1. 초기 설정 강제 변경\n# 2. 자격증명 스캐너\n# 3. 네트워크 세분화\n# 4. 모니터링\n\n# 기본 계정 스�너\nnmap --script default-credentials 192.168.1.0/24\n\n# IoT 격리 VLAN 설정\nvlan 100\n name IoT_Isolated\n exit\ninterface range Gi0/1-24\n switchport access vlan 100",out:"[기본 계정 방어]\n✅ 모든 장비 초기 설정 시 비밀번호 변경 강제\n✅ 복잡도 요구: 12자 이상, 대소문자+숫자+특수\n✅ 분기별 기본 계정 스캔 (자동화)\n\n[네트워크 세분화]\n✅ IoT 전용 VLAN 격리 (VLAN 100)\n✅ IoT → 서버 통신 차단\n✅ 관리 인터페이스 전용 VLAN (VLAN 999)\n✅ 외부에서 관리 포트 접근 차단\n\n[모니터링]\n✅ 기본 계정 로그인 시도 알림\n✅ Telnet 접속 차단 (SSH만 허용)\n✅ 실패 로그인 5회 → 계정 잠금\n✅ 장비 설정 변경 실시간 알림\n\n[자산 관리]\n✅ CMDB에 모든 장비 등록\n✅ 기본 계정 변경 여부 체크리스트\n✅ 신규 장비 설치 절차 보안 포함\n✅ 벤더 보안 업데이트 자동 알림",def:"[SIEM] Default account defense deployed — forced password change, IoT isolation, credential scanning",defAction:"Tool: Credential scanner + VLAN isolation + monitoring\nPassword: Forced change on setup, 12+ chars complexity\nNetwork: IoT VLAN isolated, management VLAN separate\nAccess: Telnet disabled, SSH only, 5-attempt lockout\nScanning: Quarterly automated default credential checks\nAsset: CMDB registration, security checklist\nRisk Level: Low (with full implementation)\nAction: Maintain quarterly scans, enforce onboarding procedures",desc:"모든 장비의 기본 비밀번호를 강제 변경하고, IoT를 별도 VLAN으로 격리합니다. 분기별 기본 계정 스캔과 텔넷 차단으로 방어합니다.",descEn:"Force default password changes on all devices. Isolate IoT in separate VLANs. Quarterly credential scanning and Telnet blocking for defense.",stepTitle:"강제 변경 + VLAN 격리 + 스캐닝 + 모니터링",stepTitleEn:"Forced Change + VLAN Isolation + Scanning + Monitoring",feynman:"4가지 대책: 1) 새 열쇠(장비)를 받으면 반드시 자물쇠를 바꾼다(비밀번호 변경), 2) IoT 장비를 별도 건물(VLAN)에 격리한다, 3) 분기마다 모든 문이 기본 열쇠로 열리지 않는지 점검한다, 4) 기본 열쇠로 문을 열려는 시도가 있으면 즉시 경보를 울린다.",feynmanEn:"4 measures: 1) Always change locks on new keys (password change), 2) Isolate IoT in separate buildings (VLANs), 3) Quarterly checks that no doors open with factory keys, 4) Immediate alert when someone tries factory keys.",expert:"NIST SP 800-63B는 기본 비밀번호 변경을 필수로 권고합니다. IEEE 802.1X(포트 기반 네트워크 접근 제어)를 사용하면 인증되지 않은 장비의 네트워크 접근을 차단할 수 있습니다. NAC(Network Access Control)은 장비의 보안 상태(패치, 비밀번호 변경 등)를 확인한 후 네트워크 접근을 허용합니다. Nmap의 default-credentials NSE 스크립트는 다양한 프로토콜의 기본 자격증명을 자동으로 테스트합니다.",expertEn:"NIST SP 800-63B mandates default password changes. IEEE 802.1X port-based NAC blocks unauthenticated devices. NAC checks device security posture before granting access. Nmap's default-credentials NSE script auto-tests default credentials across protocols.",defTooltip:"🔐 기본 계정 방어 + IoT 격리 완성!",defTooltipEn:"🔐 Default account defense + IoT isolation complete!",hackerLog:{title:"defense.log",lines:["[09:00:00] 기본 비밀번호 강제 변경","[09:05:00] IoT VLAN 격리","[09:10:00] 기본 계정 스캐너 배포","[09:15:00] 텔넷 차단 + SSH 전환"]},terms:[{term:"NAC",def:"Network Access Control, 장비의 보안 상태를 확인한 후 네트워크 접근을 허용하는 시스템"},{term:"802.1X",def:"포트 기반 네트워크 접근 제어 표준, RADIUS 인증 후 네트워크 접근 허용"}]}
      ],
      processTree: {name:"hydra",pid:5000,children:[{name:"telnet (admin/admin)",pid:5100,children:[{name:"cisco_ios_shell",pid:5110,children:[]}]},{name:"http (admin/12345)",pid:5200,children:[]}]}
    }
  }
];

// Write files
let count = 0;
for (const tech of techniques) {
  // Write HTML
  const htmlPath = path.join(EDU_DIR, `${tech.fileName}.html`);
  if (!fs.existsSync(htmlPath)) {
    fs.writeFileSync(htmlPath, generateHTML(tech));
    count++;
    console.log(`[HTML] ${tech.techId} → ${tech.fileName}.html`);
  }

  // Write JSON
  const jsonId = tech.techId;
  const jsonPath = path.join(JSON_DIR, `${jsonId}.json`);
  if (!fs.existsSync(jsonPath) && tech.jsonData) {
    const jsonContent = {
      id: jsonId,
      ...tech.jsonData
    };
    const jsonStr = JSON.stringify(jsonContent, null, 2);
    // Validate JSON
    try {
      JSON.parse(jsonStr);
      fs.writeFileSync(jsonPath, jsonStr);
      count++;
      console.log(`[JSON] ${tech.techId} → ${jsonId}.json`);
    } catch(e) {
      console.error(`[ERROR] Invalid JSON for ${jsonId}: ${e.message}`);
    }
  }
}

console.log(`\nGenerated ${count} files.`);

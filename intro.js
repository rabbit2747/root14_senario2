import React, { useState, useEffect, useRef } from 'react';

export default function UltimateCinematicMatrix() {
  // --- 1. State 정의 (모든 에러 방지를 위해 최상단 배치) ---
  const [introPhase, setIntroPhase] = useState(0); 
  const [showSubs, setShowSubs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('ko');
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, title: '', id: '', desc: '' });
  const [animatingCard, setAnimatingCard] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  // 사운드 Ref (사용자 동의 후 재생)
  const audioUnlock = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));

  // --- 2. 데이터 정의 (Full Matrix 100%) ---
  const attackMatrix = [
    {
      id: 't1', title: 'Reconnaissance',
      techniques: [
        { name: 'Active Scanning', subs: 'Scanning IP Blocks, Vulnerability Scanning, Wordlist Scanning' },
        { name: 'Gather Victim Host Information', subs: 'Hardware, Software, Firmware, Client Configurations' },
        { name: 'Gather Victim Identity Information', subs: 'Credentials, Email Addresses, Employee Names' },
        { name: 'Gather Victim Network Information', subs: 'Domain Properties, DNS, Network Trust Dependencies, Network Topology, IP Addresses, Network Security Appliances' },
        { name: 'Gather Victim Org Information', subs: 'Determine Physical Locations, Business Relationships, Identify Business Tempo, Identify Roles' },
        { name: 'Phishing for Information', subs: 'Spearphishing Service, Spearphishing Attachment, Spearphishing Link, Spearphishing Voice' },
        { name: 'Search Closed Sources', subs: 'Threat Intel Vendors, Purchase Technical Data' },
        { name: 'Search Open Technical Databases', subs: 'DNS / Passive DNS, WHOIS, Digital Certificates, CDNs, Scan Databases' },
        { name: 'Search Open Websites/Domains', subs: 'Social Media, Search Engines, Code Repositories, Search Threat Vendor Data, Search Victim-Owned Websites' }
      ]
    },
    {
      id: 't2', title: 'Resource Development',
      techniques: [
        { name: 'Acquire Infrastructure', subs: 'Domains, DNS Server, VPS, Botnet, Web Services, Serverless, Malvertising' },
        { name: 'Compromise Accounts', subs: 'Social Media, Email, Cloud Accounts' },
        { name: 'Develop Capabilities', subs: 'Malware, Exploits, Code Signing Certificates' },
        { name: 'Obtain Capabilities', subs: 'Malware, Tools, Exploits, Vulnerabilities, AI' },
        { name: 'Stage Capabilities', subs: 'Upload Malware, SEO Poisoning, Content Injection, Drive-by Compromise' }
      ]
    },
    {
      id: 't3', title: 'Initial Access',
      techniques: [
        { name: 'Phishing', subs: 'Spearphishing Attachment, Spearphishing Link, Spearphishing via Service, Voice' },
        { name: 'Supply Chain Compromise', subs: 'Software Supply Chain, Software Dependencies, Hardware Supply Chain' },
        { name: 'Valid Accounts', subs: 'Default, Domain, Local, Cloud', isCritical: true },
        { name: 'Exploit Public-Facing Application', subs: '' },
        { name: 'External Remote Services', subs: '' }
      ]
    },
    {
      id: 't4', title: 'Execution',
      techniques: [
        { name: 'Command and Scripting Interpreter', subs: 'PowerShell, Windows CMD, Unix Shell, Python, JavaScript, Cloud API, Container CLI', isCritical: true },
        { name: 'User Execution', subs: 'Malicious File, Malicious Link, Malicious Image' },
        { name: 'Scheduled Task / Job', subs: 'Cron, At, Systemd, Scheduled Task' },
        { name: 'System Services', subs: 'Launchctl, Windows Service, Systemctl' }
      ]
    },
    {
      id: 't5', title: 'Persistence',
      techniques: [
        { name: 'Boot or Logon Autostart Execution', subs: 'Registry Run Keys, Startup Folder, Winlogon Helper DLL, Login Items, XDG Autostart' },
        { name: 'Create Account', subs: 'Local, Domain, Cloud' },
        { name: 'Event Triggered Execution', subs: 'WMI Subscription, AppInit DLL, Image File Execution Options, PowerShell Profile' },
        { name: 'Server Software Component', subs: 'Web Shell, IIS Components, SQL Stored Procedures' }
      ]
    },
    {
      id: 't6', title: 'Privilege Escalation',
      techniques: [
        { name: 'Abuse Elevation Control Mechanism', subs: 'Bypass UAC, Sudo, Setuid' },
        { name: 'Access Token Manipulation', subs: 'Token Impersonation, SID History Injection' },
        { name: 'Process Injection', subs: 'DLL Injection, Process Hollowing, APC Injection', isCritical: true }
      ]
    },
    {
      id: 't7', title: 'Defense Evasion',
      techniques: [
        { name: 'Obfuscated Files or Information', subs: 'Packing, Encryption, HTML Smuggling, Polymorphic Code' },
        { name: 'Hide Artifacts', subs: 'Hidden Files, Hidden Users, Timestomp' },
        { name: 'Masquerading', subs: 'Double Extension, Rename Legitimate Utility' },
        { name: 'Impair Defenses', subs: 'Disable Security Tools, Disable Logging, Firewall Modification' }
      ]
    },
    {
      id: 't8', title: 'Credential Access',
      techniques: [
        { name: 'OS Credential Dumping', subs: 'LSASS Memory, SAM, NTDS.dit, DCSync', isCritical: true },
        { name: 'Brute Force', subs: 'Password Spraying, Credential Stuffing' },
        { name: 'Input Capture', subs: 'Keylogging, GUI Capture' }
      ]
    },
    {
      id: 't9', title: 'Discovery',
      techniques: [
        { name: 'Account Discovery', subs: 'Local, Domain, Cloud' },
        { name: 'Network Discovery', subs: 'Network Sniffing, Share Discovery, Service Discovery' },
        { name: 'Process Discovery', subs: '' },
        { name: 'System Information Discovery', subs: '' }
      ]
    },
    {
      id: 't10', title: 'Lateral Movement',
      techniques: [
        { name: 'Remote Services', subs: 'RDP, SMB, SSH, WinRM' },
        { name: 'Remote Service Session Hijacking', subs: 'RDP Hijacking, SSH Hijacking' },
        { name: 'Use Alternate Authentication Material', subs: 'Pass-the-Hash, Pass-the-Ticket' }
      ]
    },
    {
      id: 't11', title: 'Collection',
      techniques: [
        { name: 'Data from Local System', subs: '' },
        { name: 'Data from Cloud Storage', subs: '' },
        { name: 'Email Collection', subs: '' },
        { name: 'Screen Capture', subs: '' },
        { name: 'Archive Collected Data', subs: '' }
      ]
    },
    {
      id: 't12', title: 'Command and Control (C2)',
      techniques: [
        { name: 'Application Layer Protocol', subs: 'Web (HTTP/HTTPS), DNS, Mail' },
        { name: 'Encrypted Channel', subs: 'Symmetric, Asymmetric' },
        { name: 'Proxy', subs: 'Domain Fronting, Multi-hop' },
        { name: 'Dynamic Resolution', subs: 'DGA, Fast Flux' }
      ]
    },
    {
      id: 't13', title: 'Exfiltration',
      techniques: [
        { name: 'Exfiltration Over C2 Channel', subs: '' },
        { name: 'Exfiltration to Cloud Storage', subs: '' },
        { name: 'Exfiltration Over Web Service', subs: '' },
        { name: 'Exfiltration Over USB', subs: '' }
      ]
    },
    {
      id: 't14', title: 'Impact',
      techniques: [
        { name: 'Data Encrypted for Impact (랜섬웨어)', subs: 'Ransomware', isCritical: true },
        { name: 'Disk Wipe', subs: '' },
        { name: 'Defacement', subs: '' },
        { name: 'Denial of Service', subs: '' },
        { name: 'Resource Hijacking (크립토마이닝 등)', subs: 'Cryptomining' }
      ]
    }
  ];

  const newsItems = [
    { title: "BREAKING: Global Infrastructure Under Siege", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=500&auto=format", top: "10%", left: "5%", delay: "0s" },
    { title: "LIVE: Massive Data Breach in Financial Sector", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=500&auto=format", top: "40%", left: "15%", delay: "1.5s" },
    { title: "ALERT: New Zero-Day Exploit Found", img: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=500&auto=format", top: "20%", left: "60%", delay: "0.8s" },
    { title: "SCENARIO: APT Group Activity Spiking", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=500&auto=format", top: "65%", left: "55%", delay: "2.2s" }
  ];

  // --- 3. 로직 함수 (컴포넌트 내부에 정의하여 에러 방지) ---
  const getMitreMockInfo = (name, isSub = false, lang = 'ko') => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const id = isSub ? `T1${(hash % 900) + 100}.${String(hash % 99).padStart(3, '0')}` : `T1${(hash % 900) + 100}`;
    const descriptions = {
      ko: `공격자는 대상 환경 내에서 운영 목적을 달성하기 위해 [${name}] 기법을 사용할 수 있습니다.`,
      en: `Adversaries may use [${name}] to further their operational objectives.`
    };
    return { id, desc: descriptions[lang] || descriptions['en'] };
  };

  const handleMouseEnter = (e, name, isSub = false) => {
    if (isSub) e.stopPropagation();
    const { id, desc } = getMitreMockInfo(name, isSub, language);
    setTooltip({ show: true, x: e.clientX, y: e.clientY, title: name, id, desc });
  };

  const handleMouseMove = (e) => {
    setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
  };

  const handleMouseLeave = (e) => {
    e.stopPropagation();
    setTooltip({ show: false, x: 0, y: 0, title: '', id: '', desc: '' });
  };

  const handleItemClick = (tactic, tech, subName = null) => {
    setTooltip({ ...tooltip, show: false });
    setAnimatingCard({ 
      tacticTitle: tactic.title, 
      techName: tech.name,
      targetName: subName ? subName : tech.name,
      isSub: !!subName,
      isCritical: tech.isCritical
    });
    // 매트릭스 진입 사운드 재생
    try { audioUnlock.current.play(); } catch(e) {}
    setTimeout(() => window.location.href = 'https://hw8z3v.csb.app/', 1500);
  };

  // 인트로 자동 전환 로직
  useEffect(() => {
    if (introPhase === 1) {
      const timer = setTimeout(() => setIntroPhase(2), 7000); // 7초로 연장
      return () => clearTimeout(timer);
    } else if (introPhase === 2) {
      const timer = setTimeout(() => setIntroPhase(3), 6000); // 6초로 연장
      return () => clearTimeout(timer);
    }
  }, [introPhase]);

  return (
    <div className="relative w-full min-h-screen bg-[#FFF8F0] font-sans text-slate-800 overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes newsFly {
          0% { opacity: 0; transform: scale(0.5) translateZ(-500px) rotateY(30deg); filter: blur(10px); }
          20% { opacity: 1; filter: blur(0px); }
          80% { opacity: 1; filter: blur(0px); }
          100% { opacity: 0; transform: scale(1.5) translateZ(500px) rotateY(-30deg); filter: blur(15px); }
        }
        .news-card {
          position: absolute; width: 320px; border-radius: 12px; overflow: hidden;
          background: white; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          animation: newsFly 5s ease-in-out forwards; opacity: 0;
        }
      `}} />

      {/* PHASE 0: Legal Consent */}
      {introPhase === 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617] backdrop-blur-md">
           <div className="bg-[#0f172a] border border-slate-700 p-10 rounded-xl shadow-2xl max-w-lg w-full flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-white mb-6 tracking-widest">SYSTEM CONSENT</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed font-mono text-left">
                > 본 시뮬레이션은 승인된 레드팀 활동을 위한 교육용 도구입니다.<br/>
                > 무단 사용에 의한 모든 책임은 사용자에게 있음에 동의합니까?
              </p>
              <button 
                onClick={() => { setHasAgreed(true); setIntroPhase(1); }}
                className="w-full py-4 border border-[#bb3e03] text-[#bb3e03] hover:bg-[#bb3e03] hover:text-white font-bold transition-all"
              >
                I AGREE & INITIALIZE
              </button>
           </div>
        </div>
      )}

      {/* PHASE 1: News Flyby (Images Included) */}
      {introPhase === 1 && (
        <div className="fixed inset-0 z-[180] bg-black perspective-[1200px] flex items-center justify-center overflow-hidden">
          {newsItems.map((news, i) => (
            <div key={i} className="news-card" style={{ top: news.top, left: news.left, animationDelay: news.delay }}>
              <img src={news.img} alt="news" className="w-full h-40 object-cover grayscale hover:grayscale-0 transition-all" />
              <div className="p-4 bg-white">
                <p className="text-red-600 font-black text-xs mb-1 uppercase tracking-tighter">Breaking</p>
                <h4 className="text-sm font-bold text-black leading-tight">{news.title}</h4>
              </div>
            </div>
          ))}
          <div className="absolute bottom-10 text-white/30 font-mono animate-pulse uppercase tracking-[1em]">Scanning Global Vectors...</div>
        </div>
      )}

      {/* PHASE 2: Paradigm Shift */}
      {introPhase === 2 && (
        <div className="fixed inset-0 z-[180] bg-[#020617] flex flex-col items-center justify-center text-center px-10">
           <div className="w-px h-24 bg-gradient-to-b from-[#bb3e03] to-transparent mb-8"></div>
           <h2 className="text-5xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">
             Defense is no longer <span className="text-[#bb3e03]">Enough.</span>
           </h2>
           <p className="text-slate-500 font-mono text-lg max-w-2xl leading-relaxed">
             The paradigm has shifted. To secure the future, you must understand the weapon. Welcome to the Offensive Realm.
           </p>
           <div className="mt-12 text-slate-700 font-bold italic tracking-widest animate-pulse italic">
             "드가자고..."
           </div>
        </div>
      )}

      {/* PHASE 3: Full Matrix Dashboard */}
      <div className={`transition-opacity duration-[2000ms] ${introPhase === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-14 bg-[#9DD9D2] flex items-center justify-between px-6 border-b border-slate-300 shadow-sm">
          <h1 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">ATT&CK Enterprise v14.1</h1>
          <div className="flex gap-2">
            <input type="text" placeholder="Search..." onChange={(e)=>setSearchTerm(e.target.value)} className="px-3 py-1 text-xs rounded border border-slate-400 bg-white/50" />
            <button onClick={()=>setShowSubs(!showSubs)} className="px-3 py-1 bg-[#F4D06F] text-xs font-bold rounded border border-slate-600 shadow-sm uppercase">Toggle Subs</button>
          </div>
        </div>

        <div className="w-full p-4 overflow-x-auto">
          <div className="grid gap-2 min-w-[1800px]" style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}>
            {attackMatrix.map((tactic) => (
              <div key={tactic.id} className="flex flex-col gap-2">
                <div className="bg-[#F4D06F]/40 border-t-4 border-[#F4D06F] p-2 text-center">
                  <h3 className="text-[10px] font-black uppercase text-slate-800 break-words">{tactic.title}</h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {tactic.techniques.map((tech, idx) => {
                    const matched = searchTerm === '' || tech.name.toLowerCase().includes(searchTerm.toLowerCase());
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleItemClick(tactic, tech)}
                        onMouseEnter={(e) => handleMouseEnter(e, tech.name, false)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className={`bg-white border p-2 rounded relative group cursor-pointer transition-all ${matched ? 'opacity-100 hover:border-[#bb3e03]' : 'opacity-20 grayscale'}`}
                      >
                        <div className={`text-[9px] font-bold leading-tight ${tech.isCritical ? 'text-[#bb3e03]' : 'text-slate-800'}`}>
                          {tech.name} {tech.isCritical && '🔥'}
                        </div>
                        {showSubs && tech.subs && (
                          <div className="mt-2 pl-1 border-l border-slate-200 flex flex-col gap-1">
                            {tech.subs.split(',').map((sub, sidx) => (
                              <div key={sidx} onClick={(e)=>{ e.stopPropagation(); handleItemClick(tactic, tech, sub.trim()); }} className="text-[8px] text-slate-500 hover:text-slate-900 truncate">↳ {sub.trim()}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip & Transition Overlays */}
      {tooltip.show && (
        <div className="fixed z-[300] bg-black text-white p-3 rounded text-[10px] w-48 pointer-events-none shadow-2xl border border-white/20" style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}>
          <div className="font-bold border-b border-white/20 pb-1 mb-1">{tooltip.title}</div>
          <div className="text-slate-400">{tooltip.desc}</div>
        </div>
      )}

      {animatingCard && (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center animate-pulse">
            <div className="text-[#F4D06F] font-mono text-sm tracking-[1em] mb-4 uppercase">Initializing Session</div>
            <h2 className="text-3xl font-black text-white">{animatingCard.targetName}</h2>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 bg-[#bb3e03] rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-[#bb3e03] rounded-full animate-ping delay-100"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
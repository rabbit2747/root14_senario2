import { motion } from 'framer-motion';

// --- 공용 SVG 아이콘 셋 ---
export const Icons = {
  Server: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  FileCode: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="10 13 8 15 10 17"/><polyline points="14 13 16 15 14 17"/></svg>,
  Terminal: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Book: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Play: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Key: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  Database: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  ArrowRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Wifi: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
};

// --- 그리드 배경 ---
const GridBg = () => (
  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6개 애니메이션 프리셋 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 1. scan — 검색 아이콘 좌우 바운스 (LinkedIn Scraping 등)
 * 좌: Attacker → 가운데: Search 아이콘 바운스 → 우: 데이터 패널
 */
function ScanAnimation() {
  return (
    <div className="relative w-full px-8 lg:px-16 flex justify-between items-center">
      <div className="flex flex-col items-center z-10">
        <div className="text-slate-400 mb-2"><Icons.Terminal /></div>
        <span className="text-[10px] text-slate-500 font-mono">Attacker</span>
      </div>
      <div className="flex-1 relative h-full flex items-center justify-center">
        <motion.div
          animate={{ x: [-20, 20], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-blue-500"
        >
          <Icons.Search />
        </motion.div>
      </div>
      <div className="flex flex-col gap-2 z-10 p-3 bg-slate-800 rounded-lg border border-slate-600">
        <span className="text-[9px] text-slate-400 font-bold mb-1">LinkedIn DB</span>
        <div className="flex items-center gap-2"><Icons.User /><span className="text-[10px] text-emerald-400 font-mono">CEO Name</span></div>
        <div className="flex items-center gap-2"><Icons.User /><span className="text-[10px] text-emerald-400 font-mono">IT Admin</span></div>
      </div>
    </div>
  );
}

/**
 * 2. query — 소스→DB→타겟 간접 조회 (Shodan 등)
 * 좌: Attacker → 중앙: 3rd-party DB → 우: Target (흐릿)
 */
function QueryAnimation() {
  return (
    <div className="relative w-full px-10 lg:px-20 flex justify-between items-center">
      <div className="flex flex-col items-center z-10">
        <div className="text-slate-400 mb-2"><Icons.Terminal /></div>
        <span className="text-[10px] text-slate-500 font-mono">Attacker</span>
      </div>
      <div className="flex flex-col items-center z-10 p-4 rounded-full border-2 border-dashed border-blue-500/50 bg-blue-900/20">
        <Icons.Globe />
        <span className="text-[9px] text-blue-300 font-bold mt-1">Shodan API</span>
      </div>
      <motion.div
        initial={{ left: 100, opacity: 0 }}
        animate={{ left: "calc(100% - 100px)", opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute z-20 flex flex-col items-center"
      >
        <span className="text-[9px] text-slate-400 font-mono bg-slate-800 px-1 rounded">GET /domain=gotroot.com</span>
      </motion.div>
      <div className="flex flex-col items-center z-10 opacity-30 blur-[1px]">
        <div className="text-emerald-400 mb-2"><Icons.Server /></div>
        <span className="text-[10px] text-emerald-500 font-mono">Target (Untouched)</span>
      </div>
    </div>
  );
}

/**
 * 3. probe — 파동 퍼져나감 (Vulnerability Scanning 등)
 * 좌: Scanner → 중앙: 파동 라인 → 우: Target + CVE 발견
 */
function ProbeAnimation() {
  return (
    <div className="relative w-full px-8 flex justify-between items-center">
      <div className="flex flex-col items-center z-10">
        <div className="text-red-400 mb-2"><Icons.Terminal /></div>
        <span className="text-[10px] font-bold text-red-500 font-mono">Vuln Scanner</span>
      </div>
      <div className="flex-1 flex justify-center items-center relative h-full">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ width: 0, opacity: 1 }}
            animate={{ width: "100%", opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
            className="absolute border-t-2 border-red-500/50"
          />
        ))}
      </div>
      <div className="flex flex-col items-center z-10 relative">
        <div className="text-emerald-400"><Icons.Shield /></div>
        <span className="text-[10px] text-emerald-500 font-mono mt-1">VPN Gateway</span>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"
        />
        <span className="absolute -bottom-4 text-[8px] text-red-400 font-bold whitespace-nowrap">CVE Found!</span>
      </div>
    </div>
  );
}

/**
 * 4. flow — 데이터 단방향 파이프라인 (Exfiltration / Data Transfer)
 * 좌: Source → 가운데: 데이터 패킷 이동 → 우: Destination
 */
function FlowAnimation() {
  return (
    <div className="relative w-full px-8 lg:px-16 flex justify-between items-center">
      <div className="flex flex-col items-center z-10">
        <div className="text-amber-400 mb-2"><Icons.Database /></div>
        <span className="text-[10px] text-amber-500 font-mono">Source DB</span>
      </div>
      <div className="flex-1 relative h-8 flex items-center">
        <div className="w-full h-[2px] bg-slate-600" />
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
            className="absolute w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          />
        ))}
      </div>
      <div className="flex flex-col items-center z-10">
        <div className="text-red-400 mb-2"><Icons.Terminal /></div>
        <span className="text-[10px] text-red-500 font-mono">C2 Server</span>
      </div>
    </div>
  );
}

/**
 * 5. inject — 타겟 내부 삽입 (Process Injection / Code Injection)
 * 좌: Payload → 중앙: 진입 애니메이션 → 우: Target Process
 */
function InjectAnimation() {
  return (
    <div className="relative w-full px-8 lg:px-16 flex justify-between items-center">
      <div className="flex flex-col items-center z-10">
        <div className="text-purple-400 mb-2"><Icons.FileCode /></div>
        <span className="text-[10px] text-purple-500 font-mono">Payload</span>
      </div>
      <div className="flex-1 relative flex items-center justify-center">
        <motion.div
          animate={{ x: ["-40px", "40px"], scale: [1, 0.8, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-purple-500"
        >
          <Icons.ArrowRight />
        </motion.div>
      </div>
      <div className="flex flex-col items-center z-10 relative">
        <div className="p-3 rounded-lg border-2 border-emerald-500/50 bg-emerald-900/20">
          <Icons.Server />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500"
          />
        </div>
        <span className="text-[10px] text-emerald-500 font-mono mt-1">svchost.exe</span>
      </div>
    </div>
  );
}

/**
 * 6. lateral — 노드 간 횡적 이동 (Lateral Movement)
 * 3개 노드가 순서대로 연결 (jump)
 */
function LateralAnimation() {
  const nodes = [
    { label: "Workstation", icon: <Icons.Terminal /> },
    { label: "File Server", icon: <Icons.Server /> },
    { label: "DC", icon: <Icons.Shield /> },
  ];
  return (
    <div className="relative w-full px-6 lg:px-12 flex items-center justify-between">
      {nodes.map((node, i) => (
        <div key={i} className="flex flex-col items-center z-10 relative">
          <motion.div
            animate={{ borderColor: ["rgba(59,130,246,0.3)", "rgba(59,130,246,0.8)", "rgba(59,130,246,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
            className="p-3 rounded-lg border-2 bg-slate-800"
          >
            <div className="text-blue-400">{node.icon}</div>
          </motion.div>
          <span className="text-[9px] text-slate-400 font-mono mt-1.5">{node.label}</span>
          {i < nodes.length - 1 && (
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.7 }}
              className="absolute top-1/2 -right-10 w-8 h-[2px] bg-blue-500"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 프리셋 레지스트리 & 메인 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PRESET_MAP = {
  scan: ScanAnimation,
  query: QueryAnimation,
  probe: ProbeAnimation,
  flow: FlowAnimation,
  inject: InjectAnimation,
  lateral: LateralAnimation,
};

/**
 * AnimationStage — 프리셋 이름을 받아 해당 애니메이션을 렌더
 * @param {{ preset: string }} props
 */
export default function AnimationStage({ preset }) {
  const Comp = PRESET_MAP[preset];
  if (!Comp) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[180px] lg:h-[220px] bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center shadow-inner mt-4"
    >
      <GridBg />
      <Comp />
    </motion.div>
  );
}

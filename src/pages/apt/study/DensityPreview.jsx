// DensityPreview — 분기 카드 게임의 "정보 밀도" 비교 프리뷰
//
// 라우트: /apt/preview-density
//
// ── 교육 설계 3원칙 (이 프리뷰가 시각화하는 것) ──────────────
//   🔗 연계성(Continuity)  : 앞 내용 ──→ 지금 내용
//   🕸️ 연관성(Relevance)   : 지금 내용 ↔ 같은 맥락의 다른 개념
//   ▶ 연결성(Coherence)    : 지금 내용 ──→ 다음 내용
//
// 하이브리드 모드(D)의 결과 깊이 "C"에서 이 3원칙을 명시적으로 구현한다.
// 향후 이 리포의 모든 교육 컴포넌트는 이 3원칙을 기본 체크리스트로 둔다.
//
// ── 밀도 옵션 ──────────────────────────────────────────────
//   A) 미니멀      : 질문 + 선택지만 (비교 베이스라인)
//   B) 균형        : 질문 + 컨텍스트 + 힌트 + 결과 문단
//   C) 밀도 있게   : 배경/TTP/사전지식 + 결과 문단 + 3원칙 전체
//   D) 하이브리드  : 선택=미니멀+팁, 결과=[B 균형 | C 밀도] 서브토글

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

const THEME_KEY = 'gotroot_theme';

// ⚠️ 중요: "연계성 / 연관성 / 연결성"은 **내부 설계 원칙** 용어입니다.
// 학습자 UI에 이 단어를 노출하지 않습니다. 관리자에게만 내부 라벨 표시.
// 학습자에게는 자연어로만 보여줍니다:
//   · 연계성 → "💭 잠깐, 당신의 목표와…"
//   · 연관성 → "🔎 비슷한 패턴의 다른 사건들"
//   · 연결성 → "▶ 다음 작전"

// ── 공통: 선택지 데이터 ─────────────────────────────────────
const CHOICES = [
  {
    id: 'msft',
    title: 'Microsoft 본사',
    subtitle: '세계 최대 소프트웨어 회사',
    emoji: '🏢',
    hint: '방어가 두껍지만 한 번 뚫으면 파급력이 크다',
    ttp: ['T1078 Valid Accounts', 'T1199 Trusted Relationship'],
    consequenceShort: '탐지 확률 70%. 1주일 내 발각.',
    consequenceLong:
      '최상위 타겟. 블루팀이 두텁고 EDR·로그 분석이 촘촘해서 1주일을 못 버틴다. ' +
      '직접 공격보다는 "Microsoft가 신뢰하는 누군가"를 먼저 노리는 게 현실적.',
    learning:
      '2020년 APT29는 이 선택을 피했다. 대신 Microsoft가 신뢰하는 SolarWinds를 먼저 노렸다. ' +
      '실제 역사와 달라 다음 카드에서는 "재선정"을 해야 한다.',
    // ── 3원칙 데이터 (rich 결과에만 노출) ───────────────
    continuity:
      '직전에 당신은 목표를 세웠다: "1년 이상 탐지 없이". ' +
      'Microsoft 정면 돌파는 일주일 만에 EDR·SIEM·위협 헌팅 팀에 걸린다. ' +
      '목표와 수단이 어긋나는 선택.',
    relevance: [
      { label: 'T1078 Valid Accounts', note: '정상 계정을 훔쳐서 직접 로그인하는 기법' },
      { label: 'SolarWinds 2020', note: '결국 Microsoft도 공급망을 통해 뚫렸다 (네 선택과 반대 경로)' },
      { label: 'NotPetya 2017', note: '우크라이나 MeDoc 회계 SW 공급망으로 전 세계 파괴' },
      { label: 'Operation Aurora 2009', note: '중국 APT가 Google·Adobe 직접 노린 사례 — 대부분 탐지됨' },
    ],
    coherence: {
      nextTitle: 'Ch1 · 재선정 (결정 #1-b)',
      nextHint:
        '실제 APT29는 이 길을 가지 않았다. 같은 목표로 다른 경로를 찾아야 한다. ' +
        '"신뢰받는 제3자"를 노리는 것이 핵심이다.',
    },
  },
  {
    id: 'solarwinds',
    title: 'SolarWinds Orion',
    subtitle: '네트워크 관리 소프트웨어 공급사',
    emoji: '🌀',
    hint: '고객 18,000곳이 자동으로 업데이트를 받는다',
    ttp: ['T1195.002 Supply Chain', 'T1574.002 DLL Side-Loading'],
    consequenceShort: '한 번의 침투로 18,000곳 동시 감염.',
    consequenceLong:
      '공급망 공격의 교과서. Orion 업데이트 서버에 악성 DLL을 심으면 ' +
      '고객사가 "정상 업데이트"로 믿고 자기 손으로 백도어를 설치한다. ' +
      'Microsoft·미 재무부·FireEye 모두 여기서 털렸다.',
    learning:
      '이 선택이 2020년 실제 역사. 한 번의 공급망 침투로 18,000곳이 감염되었다. ' +
      '다음 카드에서는 "Orion 빌드 서버에 어떻게 침투할지"를 결정한다.',
    continuity:
      '직전 목표 "1년 이상 탐지 없이"와 완벽히 일치한다. ' +
      '공급망은 "신뢰 사슬의 취약점"을 파고드는 가장 은밀한 경로. ' +
      '피해자가 자기 손으로 백도어를 설치하니 탐지의 출발점조차 잘못 찍힌다.',
    relevance: [
      { label: 'T1195.002 Supply Chain', note: '이번 카드의 핵심 TTP — 공급망 침해' },
      { label: 'T1574.002 DLL Side-Loading', note: '정상 서명 프로세스가 악성 DLL을 로드하게 하는 기법' },
      { label: 'CCleaner 2017', note: '청소 SW 업데이트로 227만대 감염 — APT17 추정' },
      { label: 'NotPetya 2017', note: 'M.E.Doc 우크라 회계 SW 공급망 → 전 세계 $100억+ 피해' },
      { label: '3CX 2023', note: 'APT 라자루스가 VoIP SW 공급망 침해 — 패턴 반복' },
    ],
    coherence: {
      nextTitle: 'Ch2 · Orion 빌드 서버 침투',
      nextHint:
        'MSBuild의 TaskHost 프로세스에 악성 DLL(SUNSPOT)을 심는다. ' +
        '빌드 시점에만 활성화되고 빌드 후 스스로 지워진다 — 증거가 거의 남지 않는다.',
    },
  },
];

// ── 카드 래퍼 ────────────────────────────────────────────
function Card({ children, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full max-w-[560px] rounded-2xl border-2 shadow-xl overflow-hidden ${
        isDark
          ? 'bg-[#111114] border-[#2a2a2a] text-white'
          : 'bg-white border-[#e5e5e5] text-[#1a1a1a]'
      }`}
    >
      {children}
    </motion.div>
  );
}

// ── A. 미니멀 (옵션: 힌트 1줄) ────────────────────────────
//   hint 있으면 D(하이브리드) 용, 없으면 순수 A 베이스라인
function DensityA({ isDark, onPick, hint }) {
  return (
    <Card isDark={isDark}>
      <div className="p-10 text-center">
        <div className="text-[11px] font-bold tracking-[0.2em] text-red-500 mb-6">
          APT29 · 2020
        </div>
        <h2 className={`text-2xl font-bold leading-snug ${hint ? 'mb-4' : 'mb-10'}`}>
          먼저 어디를 노릴까?
        </h2>
        {hint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xs italic leading-relaxed mb-8 px-4 ${
              isDark ? 'text-[#9a9a9a]' : 'text-[#777]'
            }`}
          >
            💡 {hint}
          </motion.div>
        )}
        <div className="flex flex-col gap-3">
          {CHOICES.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => onPick(c)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-4 rounded-xl font-bold text-base transition-colors ${
                isDark
                  ? 'bg-[#1e1e22] hover:bg-[#2a2a30] border border-[#333]'
                  : 'bg-[#f7f7f8] hover:bg-[#eee] border border-[#e5e5e5]'
              }`}
            >
              {c.emoji} {c.title}
            </motion.button>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── B. 균형 ───────────────────────────────────────────────
function DensityB({ isDark, onPick }) {
  return (
    <Card isDark={isDark}>
      <div className="p-7">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-red-500 mb-2">
          🎯 APT29 · 2020년 초봄 · 타겟 선정 회의
        </div>
        <h2 className="text-xl font-bold mb-2 leading-snug">
          먼저 어디를 노릴까?
        </h2>
        <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-[#bbb]' : 'text-[#555]'}`}>
          당신은 러시아 SVR 소속 팀장. 미국 정부·대기업 내부에 "조용히" 1년 이상
          머무르는 게 목표다. 두 후보가 책상 위에 올라와 있다.
        </p>
        <div className="flex flex-col gap-2.5">
          {CHOICES.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => onPick(c)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-3 rounded-lg text-left transition-colors border ${
                isDark
                  ? 'bg-[#1a1a1e] hover:bg-[#22222a] border-[#2a2a2a]'
                  : 'bg-[#fafafa] hover:bg-white border-[#e5e5e5]'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xl">{c.emoji}</span>
                <span className="font-bold text-sm">{c.title}</span>
              </div>
              <div className={`text-[11px] ml-7 ${isDark ? 'text-[#888]' : 'text-[#777]'}`}>
                {c.hint}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── C. 밀도 있게 ─────────────────────────────────────────
function DensityC({ isDark, onPick }) {
  return (
    <Card isDark={isDark}>
      <div className={`px-6 py-3 text-[10px] font-bold tracking-wider flex items-center justify-between ${
        isDark ? 'bg-[#1a0a0a] text-red-300 border-b border-red-900' : 'bg-red-50 text-red-700 border-b border-red-200'
      }`}>
        <span>🎯 CH1 · 결정 지점 #1 / 5</span>
        <span>진행률 ████░░ 40%</span>
      </div>
      <div className="p-6">
        <div className={`text-[11px] font-mono mb-1 ${isDark ? 'text-[#888]' : 'text-[#999]'}`}>
          LOCATION: 러시아 SVR 본부, 2020년 초봄
        </div>
        <h2 className="text-xl font-bold mb-2 leading-snug">
          먼저 어디를 노릴까?
        </h2>
        <p className={`text-[13px] leading-relaxed mb-3 ${isDark ? 'text-[#bbb]' : 'text-[#555]'}`}>
          당신은 APT29(Cozy Bear)의 작전 팀장이다. 목표는 "1년 이상 탐지 없이"
          미국 정부·민간 네트워크에 머무르는 것. 예산과 인력은 한정되어 있고,
          한 번 들키면 전부 처음부터 다시 해야 한다.
        </p>
        <div className={`p-3 rounded text-[11px] leading-relaxed mb-4 ${
          isDark ? 'bg-[#1a1a2a] text-[#ccc]' : 'bg-blue-50 text-[#333] border border-blue-100'
        }`}>
          <b>📚 사전 지식: </b>
          APT(Advanced Persistent Threat)는 "고급·지속·위협"의 약자. 한 번의 침투보다
          <b> 오래 머무르는 것</b>이 본질이다. MITRE ATT&CK의 모든 전술이 여기서 시작된다.
        </div>
        <div className="flex flex-col gap-2.5">
          {CHOICES.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => onPick(c)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-3 rounded-lg text-left transition-colors border ${
                isDark
                  ? 'bg-[#1a1a1e] hover:bg-[#22222a] border-[#2a2a2a]'
                  : 'bg-[#fafafa] hover:bg-white border-[#e5e5e5]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{c.emoji}</span>
                <div>
                  <div className="font-bold text-sm leading-tight">{c.title}</div>
                  <div className={`text-[10px] ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>{c.subtitle}</div>
                </div>
              </div>
              <div className={`text-[11px] mb-1.5 ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
                {c.hint}
              </div>
              <div className="flex flex-wrap gap-1">
                {c.ttp.map((t) => (
                  <span
                    key={t}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isDark ? 'bg-[#2a1a0a] text-amber-300' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── 결과 카드 (depth: 'short' | 'balanced' | 'rich') ──────
//   short    : 한 줄 요약 (A 전용)
//   balanced : 문단 + 러닝 포인트 (B, D-B)
//   rich     : 위 + 3개 맥락 블록 (C, D-C) ← 내부적으로는 연계/연관/연결
//
// ⚠️ 학습자 라벨은 자연어. 관리자(isAdmin)에게만 내부 원칙 라벨 병기.
function ResultCard({ choice, depth, isDark, onBack, isAdmin = false }) {
  const showBalanced = depth === 'balanced' || depth === 'rich';
  const showRich = depth === 'rich';

  // 관리자 전용 내부 원칙 라벨 뱃지
  const AdminTag = ({ text }) =>
    isAdmin ? (
      <span
        className={`ml-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded align-middle ${
          isDark ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#eee] text-[#999]'
        }`}
        title="관리자 전용 내부 설계 원칙 (학습자 비노출)"
      >
        {text}
      </span>
    ) : null;

  return (
    <Card isDark={isDark}>
      <div className="p-7">
        <div className="text-[11px] font-bold tracking-wider text-red-500 mb-2">
          {depth === 'short' ? '결과' : '📜 결과 · 작전 평가'}
        </div>
        <h2 className="text-xl font-bold mb-3 leading-snug">
          {choice.emoji} {choice.title}
        </h2>

        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-[#ccc]' : 'text-[#333]'}`}>
          {depth === 'short' ? choice.consequenceShort : choice.consequenceLong}
        </p>

        {showBalanced && (
          <div
            className={`p-3 rounded text-[11px] leading-relaxed mb-4 ${
              isDark
                ? 'bg-[#0a1a0a] text-green-300 border border-green-900'
                : 'bg-green-50 text-green-900 border border-green-200'
            }`}
          >
            <b>🎓 Learning: </b>
            {choice.learning}
          </div>
        )}

        {showRich && (
          <div className="space-y-3 mb-4">
            {/* 앞과의 이음새 (내부: 연계성) */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-3 rounded text-[11px] leading-relaxed border-l-4 ${
                isDark
                  ? 'bg-[#0a1525] text-[#cbd5e1] border-blue-500'
                  : 'bg-blue-50 text-[#1e3a5f] border-blue-500'
              }`}
            >
              <b className={isDark ? 'text-blue-300' : 'text-blue-700'}>💭 잠깐, 당신의 목표와…</b>
              <AdminTag text="연계성 Continuity" />
              <div className="mt-1">{choice.continuity}</div>
            </motion.div>

            {/* 같은 맥락의 다른 사례 (내부: 연관성) */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-3 rounded text-[11px] border-l-4 ${
                isDark
                  ? 'bg-[#0d1f14] text-[#cbe0d1] border-emerald-500'
                  : 'bg-emerald-50 text-[#1e3a2a] border-emerald-500'
              }`}
            >
              <b className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>🔎 비슷한 패턴의 다른 사건들</b>
              <AdminTag text="연관성 Relevance" />
              <ul className="mt-1.5 space-y-1">
                {choice.relevance.map((r, i) => (
                  <li key={i} className="text-[11px] leading-snug">
                    <span
                      className={`font-mono font-bold text-[10px] px-1 py-0.5 rounded mr-1 ${
                        isDark
                          ? 'bg-[#2a1a0a] text-amber-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.label}
                    </span>
                    {r.note}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* 다음으로 가는 티저 (내부: 연결성) */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-3 rounded border-2 border-dashed ${
                isDark
                  ? 'bg-[#1a1405] border-amber-700 text-[#e5d9b5]'
                  : 'bg-amber-50 border-amber-400 text-[#5a4510]'
              }`}
            >
              <div
                className={`text-[10px] font-bold tracking-wider mb-1 flex items-center gap-1 ${
                  isDark ? 'text-amber-300' : 'text-amber-700'
                }`}
              >
                ▶ 다음 작전 미리보기
                <AdminTag text="연결성 Coherence" />
              </div>
              <div className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {choice.coherence.nextTitle}
              </div>
              <div className="text-[11px] leading-relaxed">{choice.coherence.nextHint}</div>
            </motion.div>
          </div>
        )}

        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-700 text-white"
        >
          ← 다시 비교해보기
        </motion.button>
      </div>
    </Card>
  );
}

// ── 메인 프리뷰 페이지 ───────────────────────────────────
export default function DensityPreview() {
  const { isAdmin } = useAuth() || {};
  const [density, setDensity] = useState('D');
  const [resultDepth, setResultDepth] = useState('rich'); // D 서브 토글 (balanced | rich)
  const [picked, setPicked] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {}
  };

  const reset = () => setPicked(null);

  // 메인 밀도 → 결과 카드 depth
  const effectiveDepth =
    density === 'A'
      ? 'short'
      : density === 'B'
      ? 'balanced'
      : density === 'C'
      ? 'rich'
      : /* D */ resultDepth;

  // D에서만 선택 카드에 힌트 노출 (미니멀 철학은 유지하되 사고 방향 유도)
  const selectHint =
    density === 'D'
      ? '당신의 최우선 가치는 "탐지 회피"입니다. 정면 돌파가 정말 최선일까요?'
      : null;

  // 선택 카드 렌더러
  const renderSelectionCard = () => {
    if (density === 'A') return <DensityA isDark={isDark} onPick={setPicked} />;
    if (density === 'B') return <DensityB isDark={isDark} onPick={setPicked} />;
    if (density === 'C') return <DensityC isDark={isDark} onPick={setPicked} />;
    // D: 미니멀 + 힌트
    return <DensityA isDark={isDark} onPick={setPicked} hint={selectHint} />;
  };

  const densityLabels = {
    A: { name: '미니멀', desc: '질문 + 선택지만. 책장 넘기듯 빠르게.', badge: null },
    B: { name: '균형', desc: '질문 + 컨텍스트 + 힌트 + 결과 문단.', badge: null },
    C: { name: '밀도 있게', desc: '배경 + TTP + 풍부한 맥락 결과.', badge: null },
    D: {
      name: '하이브리드',
      desc: '선택=미니멀+팁 / 결과=B·C 서브토글.',
      badge: '추천',
    },
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'}`}>
      {/* 헤더 */}
      <div
        className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur ${
          isDark ? 'bg-[#0a0a0a]/80 border-[#2a2a2a]' : 'bg-white/80 border-[#e5e5e5]'
        }`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className={`text-[10px] font-bold tracking-[0.2em] ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              APT STUDY · 밀도 비교 프리뷰
            </div>
            <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
              Ch1 · APT29 타겟 선정 — 어느 밀도가 좋은지 클릭해서 비교해 주세요
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`text-xs font-bold px-3 py-1.5 rounded border ${
              isDark ? 'border-[#333] text-[#ddd] hover:bg-[#1a1a1a]' : 'border-[#ddd] text-[#333] hover:bg-[#f0f0f0]'
            }`}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-6">
        {/* 🔒 관리자 전용: 교육 설계 3원칙 안내 박스 — 학습자에게는 노출되지 않음 */}
        {isAdmin && (
          <div
            className={`mb-5 p-3 rounded-lg text-xs leading-relaxed ${
              isDark
                ? 'bg-[#0a1510] border border-emerald-900 text-[#cbe0d1]'
                : 'bg-emerald-50 border border-emerald-200 text-[#1e3a2a]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <b className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
                🎓 교육 설계 3원칙 · 관리자 전용 설계 체크리스트
              </b>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                  isDark ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#eee] text-[#999]'
                }`}
                title="학습자 UI에는 이 원칙 용어가 노출되지 않습니다"
              >
                🔒 ADMIN ONLY
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className={`p-2 rounded border-l-2 ${isDark ? 'bg-[#0a1525] border-blue-500' : 'bg-white border-blue-500'}`}>
                <b className={isDark ? 'text-blue-300' : 'text-blue-700'}>🔗 연계성</b> — 앞 → 지금 이음새
              </div>
              <div className={`p-2 rounded border-l-2 ${isDark ? 'bg-[#0d1f14] border-emerald-500' : 'bg-white border-emerald-500'}`}>
                <b className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>🕸️ 연관성</b> — 같은 맥락 얽힘
              </div>
              <div className={`p-2 rounded border-l-2 ${isDark ? 'bg-[#1a1405] border-amber-500' : 'bg-white border-amber-500'}`}>
                <b className={isDark ? 'text-amber-300' : 'text-amber-700'}>▶ 연결성</b> — 지금 → 다음 연결
              </div>
            </div>
            <div className="mt-2 opacity-80">
              학습자 UI에서는 "잠깐 당신의 목표와…" / "비슷한 패턴의 다른 사건들" / "다음 작전 미리보기"로 자연어화돼 표시됩니다.
              원칙 자체는 작성자·관리자의 내부 체크리스트로만 사용합니다.
            </div>
          </div>
        )}

        {/* 메인 밀도 토글 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {['A', 'B', 'C', 'D'].map((k) => {
            const active = density === k;
            const { name, desc, badge } = densityLabels[k];
            return (
              <button
                key={k}
                onClick={() => {
                  setDensity(k);
                  setPicked(null);
                }}
                className={`relative text-left p-3 rounded-lg border-2 transition-all ${
                  active
                    ? isDark
                      ? 'bg-red-950 border-red-500 text-white'
                      : 'bg-red-50 border-red-500 text-[#1a1a1a]'
                    : isDark
                    ? 'bg-[#111] border-[#2a2a2a] text-[#aaa] hover:border-[#444]'
                    : 'bg-white border-[#e5e5e5] text-[#555] hover:border-[#bbb]'
                }`}
              >
                {badge && (
                  <span
                    className={`absolute -top-2 -right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isDark ? 'bg-amber-500 text-black' : 'bg-amber-400 text-black'
                    }`}
                  >
                    ⭐ {badge}
                  </span>
                )}
                <div className="text-[10px] font-mono mb-1">
                  {active ? '▶ ' : ''}
                  OPTION {k}
                </div>
                <div className="font-bold text-sm mb-0.5">{name}</div>
                <div className="text-[11px] leading-snug opacity-80">{desc}</div>
              </button>
            );
          })}
        </div>

        {/* D 전용 서브 토글 — 결과 깊이 */}
        <AnimatePresence>
          {density === 'D' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-xs flex-wrap ${
                  isDark
                    ? 'bg-amber-950/30 border border-amber-800'
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <span className={`font-bold mr-1 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  ⭐ D 서브 토글 — 결과 깊이:
                </span>
                {[
                  { k: 'balanced', label: 'B · 균형', desc: '문단 + 러닝 포인트' },
                  { k: 'rich', label: 'C · 밀도', desc: '+ 맥락 블록 3개 (목표 회상 · 유사 사례 · 다음 작전)' },
                ].map(({ k, label, desc }) => {
                  const active = resultDepth === k;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        setResultDepth(k);
                        setPicked(null);
                      }}
                      className={`px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${
                        active
                          ? isDark
                            ? 'bg-amber-500 text-black'
                            : 'bg-amber-500 text-black'
                          : isDark
                          ? 'bg-[#2a2a2a] text-[#ccc] hover:bg-[#333]'
                          : 'bg-white text-[#555] hover:bg-[#f0f0f0] border border-amber-200'
                      }`}
                      title={desc}
                    >
                      {label}
                    </button>
                  );
                })}
                <span className={`text-[10px] ml-auto ${isDark ? 'text-[#aaa]' : 'text-[#666]'}`}>
                  현재: <b>{resultDepth === 'rich' ? 'C · 맥락 블록 포함' : 'B · 기본 러닝 포인트'}</b>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 카드 스테이지 */}
        <div className="flex justify-center pb-8 min-h-[560px]">
          <AnimatePresence mode="wait">
            {picked ? (
              <ResultCard
                key={`result-${density}-${effectiveDepth}-${picked.id}`}
                choice={picked}
                depth={effectiveDepth}
                isDark={isDark}
                isAdmin={isAdmin}
                onBack={reset}
              />
            ) : (
              <motion.div key={`card-${density}`}>{renderSelectionCard()}</motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 비교 가이드 */}
        <div
          className={`max-w-[560px] mx-auto p-4 rounded-lg text-xs leading-relaxed mb-12 ${
            isDark ? 'bg-[#1a1a2a] text-[#bbb]' : 'bg-blue-50 text-[#333] border border-blue-100'
          }`}
        >
          <b className={isDark ? 'text-white' : 'text-[#1a1a1a]'}>💡 비교하는 법</b>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              <b className={isDark ? 'text-amber-300' : 'text-amber-700'}>⭐ D (하이브리드)</b> —
              선택 카드는 미니멀 + 힌트 1줄, 선택 뒤엔 B/C 서브토글로 결과 깊이를 고른다.
            </li>
            <li>
              D에서 <b>"C · 밀도"</b> 로 놓고 한 번 눌러 보세요 — 선택 후 "앞서 세운 목표" 회상 → 유사 사건
              → 다음 작전 미리보기 3블록이 자연스럽게 이어집니다.
            </li>
            <li>A/B/C 순수 모드와 D를 오가며 다크/라이트 시인성도 점검</li>
            <li>
              최종 선택을 <b>"D + 균형"</b> 또는 <b>"D + 밀도"</b>로 알려주시면 Ch1 전체 프로토타입을
              그 조합으로 만듭니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

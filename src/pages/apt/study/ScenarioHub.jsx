// ScenarioHub — 넷플릭스 스타일 APT 시나리오 허브
//
// 컨셉: 레벨테스트 결과(userLevel)에 따라 공격자 시점 APT 시나리오를 언락
//   · 내 레벨 이하: 자유 플레이
//   · 내 레벨 초과: 🔒 잠김 ("현재 레벨 전부 완료 시 해제")
//   · Lv1~2 실제 운영, Lv3~5 "준비중" 프리뷰 카드
//
// 데이터: SCENARIOS (VictimScenario.jsx) · SCENARIO_LEVEL_META
// 완료 판정: localStorage['gotroot_apt_completed'] JSON 배열 (scenarioId 목록)

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { SCENARIOS, SCENARIO_LEVEL_META } from './VictimScenario';

const LEVEL_META = {
  1: { label: '비기너', color: '#22c55e', accent: 'from-emerald-500 to-green-600' },
  2: { label: '초급',   color: '#3b82f6', accent: 'from-blue-500 to-indigo-600' },
  3: { label: '중급',   color: '#a855f7', accent: 'from-purple-500 to-fuchsia-600' },
  4: { label: '고급',   color: '#f97316', accent: 'from-orange-500 to-red-500' },
  5: { label: '전문가', color: '#ef4444', accent: 'from-rose-500 to-red-700' },
};

// 준비중 프리뷰 카드 (Lv3~5)
const COMING_SOON = {
  3: [
    { id: 'C0010', name: 'APT1 Comment Crew', group: 'APT1', teaser: '중국발 장기 스파이 작전 — 수백 조직 침투' },
    { id: 'C0006', name: 'APT28 Fancy Bear', group: 'APT28', teaser: '정치·군사 표적 스피어피싱' },
  ],
  4: [
    { id: 'C0015', name: 'Conti Ransomware', group: 'WizardSpider', teaser: '대규모 이중 갈취 랜섬웨어 작전' },
    { id: 'C0011', name: 'APT29 SolarWinds 2차', group: 'APT29', teaser: 'Cloud Identity 체인 침투' },
  ],
  5: [
    { id: 'C0020', name: 'Stuxnet', group: '국가주도', teaser: 'ICS/SCADA 제로데이 4종 — 원심분리기 파괴' },
    { id: 'C0021', name: 'Equation Group', group: 'EQUATION', teaser: 'BIOS/펌웨어 레벨 지속성' },
  ],
};

// profiles.level 문자열 → 숫자
const LEVEL_STR_TO_NUM = {
  beginner: 1, junior: 2, intermediate: 3, advanced: 4, expert: 5,
};

function getCompletedIds() {
  try {
    return JSON.parse(localStorage.getItem('gotroot_apt_completed') || '[]');
  } catch { return []; }
}

export default function ScenarioHub() {
  const navigate = useNavigate();
  const { userLevel, isLoggedIn } = useAuth();

  const myLevelNum = useMemo(() => {
    if (!userLevel) return 1;
    return typeof userLevel === 'number' ? userLevel : (LEVEL_STR_TO_NUM[userLevel] || 1);
  }, [userLevel]);

  const completed = getCompletedIds();

  // 레벨별 시나리오 그루핑
  const byLevel = useMemo(() => {
    const map = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    Object.entries(SCENARIOS).forEach(([id, data]) => {
      const meta = SCENARIO_LEVEL_META[id] || { level: 1 };
      map[meta.level].push({ id, data, meta });
    });
    return map;
  }, []);

  // 레벨 언락 규칙: 내 레벨 이하는 자유, 내 레벨 이상은 하위 레벨 전부 완료 시 해제
  const isLevelUnlocked = (lv) => {
    if (lv <= myLevelNum) return true;
    for (let l = 1; l < lv; l++) {
      const scens = byLevel[l] || [];
      if (scens.length === 0) return false;
      if (!scens.every((s) => completed.includes(s.id))) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* 히어로 헤더 */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-purple-900/10 to-blue-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/learning-path')}
            className="text-xs text-gray-400 hover:text-white mb-6 inline-flex items-center gap-1"
          >
            ← 학습 방식 선택으로
          </button>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
            APT 공격사례 <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">1인칭 체험</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
            평범한 업무 하나하나가 어떻게 공격이 되는지 — 공격자의 시점에서 작전을 완성하세요.
          </p>
          {isLoggedIn && (
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
              <span className="text-gray-400">내 레벨</span>
              <span
                className="px-2 py-0.5 rounded-full font-bold"
                style={{ background: LEVEL_META[myLevelNum].color, color: '#000' }}
              >
                Lv.{myLevelNum} {LEVEL_META[myLevelNum].label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 레벨별 로우 */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">
        {[1, 2, 3, 4, 5].map((lv) => {
          const unlocked = isLevelUnlocked(lv);
          const scens = byLevel[lv] || [];
          const previews = COMING_SOON[lv] || [];
          const meta = LEVEL_META[lv];

          return (
            <section key={lv}>
              <div className="flex items-end justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-md bg-gradient-to-r ${meta.accent} text-white text-sm font-black`}
                  >
                    Lv.{lv}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">{meta.label}</h2>
                  {!unlocked && (
                    <span className="text-xs text-gray-500 ml-2">🔒 하위 레벨 완료 시 해제</span>
                  )}
                </div>
                {scens.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {scens.filter((s) => completed.includes(s.id)).length} / {scens.length} 완료
                  </span>
                )}
              </div>

              {/* 실제 시나리오 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scens.map(({ id, data }) => {
                  const isDone = completed.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => unlocked && navigate(`/apt/${id}/scenario`)}
                      disabled={!unlocked}
                      className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-300 ${
                        unlocked
                          ? 'border-white/10 hover:border-white/30 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white/5 to-white/0'
                          : 'border-white/5 opacity-50 cursor-not-allowed bg-black/40'
                      }`}
                    >
                      <div className={`h-32 bg-gradient-to-br ${meta.accent} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
                        <div className="absolute top-3 left-3 text-xs font-mono text-white/80">{id}</div>
                        {isDone && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-xs font-bold">
                            ✓ 완료
                          </div>
                        )}
                        {!unlocked && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-3xl">
                            🔒
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-gray-400 mb-1">{data.group || 'Unknown'}</div>
                        <div className="font-bold text-sm mb-2">{data.name || id}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {data.persona || '실제 APT 캠페인 — 1인칭 피해자/공격자 시점'}
                        </div>
                        {data.durationMin && (
                          <div className="mt-3 text-xs text-gray-500">⏱ 약 {data.durationMin}분</div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* 준비중 프리뷰 */}
                {previews.map((p) => (
                  <div
                    key={p.id}
                    className="relative rounded-xl overflow-hidden border border-dashed border-white/10 bg-black/30"
                  >
                    <div className={`h-32 bg-gradient-to-br ${meta.accent} opacity-40`} />
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1">{p.group}</div>
                      <div className="font-bold text-sm mb-2 text-gray-300">{p.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{p.teaser}</div>
                      <div className="mt-3 inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                        준비중 · COMING SOON
                      </div>
                    </div>
                  </div>
                ))}

                {scens.length === 0 && previews.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-600 text-sm">
                    이 레벨의 시나리오를 준비하고 있습니다.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* 다음 작전 티저 (연결성) */}
      <div className="border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="text-xs text-gray-500 mb-2">▶ 다음 작전</div>
          <div className="text-sm text-gray-300">
            곧 추가됩니다 — <span className="text-amber-400">Colonial Pipeline (C1004)</span> · 물리 인프라를 마비시킨 랜섬웨어
          </div>
        </div>
      </div>
    </div>
  );
}

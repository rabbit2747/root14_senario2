// APT 맵 메이커 — 관리자용 시각 편집기
//
// 사용법:
//   1. 좌측에서 캠페인 선택 (C0024 등)
//   2. 팔레트에서 타일/오브젝트 선택
//   3. 중앙 그리드에 클릭(드래그)으로 배치 · 우클릭=지우기
//   4. 저장 → Supabase apt_maps 테이블 → 학습자 게임에 즉시 반영
//
// 데이터 구조 (map_data JSONB):
//   { width, height, floor[[frame]], walls[[frame|null]], objects[{x,y,frame,collide}],
//     npcs[{x,y,sprite,name,line}], missions[{x,y}], start:{x,y} }

import { useEffect, useMemo, useState } from 'react';
import { getAptMap, upsertAptMap, listAptMaps } from '../../../api/apt-maps';
import { useAuth } from '../../../context/AuthContext';
import { SCENARIOS, SCENARIO_LEVEL_META } from '../../apt/study/VictimScenario';

const TS = 16;                  // 타일 소스 크기
const CELL = 32;                // 화면 셀 크기 (2배 스케일)
const DEFAULT_W = 22;
const DEFAULT_H = 15;

// 큐레이션된 프레임 프리셋 (Modern Interiors 타일셋 기반)
// ⚠️ 프레임 번호는 시각 추정치 — 에디터에서 배치 후 확인 필요
const FLOORS = [
  { id: 'f_brick',    name: '벽돌 바닥',  frame: 65 },
  { id: 'f_yellow',   name: '노란 체커',  frame: 82 },
  { id: 'f_blue',     name: '파란 타일',  frame: 99 },
  { id: 'f_gray',     name: '회색 콘크리트', frame: 116 },
  { id: 'f_wood',     name: '나무 마루',   frame: 133 },
];

const WALLS = [
  { id: 'w_wood',  name: '나무 벽',   frame: 51 },
  { id: 'w_white', name: '흰 벽',    frame: 57 },
  { id: 'w_brick', name: '벽돌 벽',   frame: 153 },
  { id: 'w_top',   name: '벽 상단',   frame: 17 },
];

const OBJECTS = [
  { id: 'o_desk',     name: '책상',   sheet: 'deco', frame: 486, collide: true },
  { id: 'o_chair',    name: '의자',   sheet: 'deco', frame: 611, collide: true },
  { id: 'o_pc',       name: '모니터', sheet: 'deco', frame: 645, collide: false },
  { id: 'o_plant',    name: '화분',   sheet: 'deco', frame: 858, collide: false },
  { id: 'o_shelf',    name: '책장',   sheet: 'deco', frame: 772, collide: true },
  { id: 'o_sofa',     name: '소파',   sheet: 'deco', frame: 994, collide: true },
  { id: 'o_window',   name: '창문',   sheet: 'deco', frame: 18,  collide: false },
];

const NPC_SPRITES = [
  { key: 'alex',   label: 'Alex' },
  { key: 'amelia', label: 'Amelia' },
  { key: 'bob',    label: 'Bob' },
];

const SHEET_SRC = {
  room: '/apt-assets/Room_Builder_free_16x16.png',
  deco: '/apt-assets/Interiors_free_16x16.png',
};
const SHEET_COLS = { room: 17, deco: 16 };

// 프레임 → CSS background-position (소스 좌표)
function frameToBg(sheet, frame, scale = 2) {
  const cols = SHEET_COLS[sheet];
  const sx = (frame % cols) * TS;
  const sy = Math.floor(frame / cols) * TS;
  return {
    backgroundImage: `url(${SHEET_SRC[sheet]})`,
    backgroundPosition: `-${sx * scale}px -${sy * scale}px`,
    backgroundSize: `${cols * TS * scale}px auto`,
    imageRendering: 'pixelated',
    width: TS * scale, height: TS * scale,
  };
}

// 기본 빈 맵 생성
function emptyMap(w, h) {
  return {
    width: w, height: h, tileSize: TS,
    floor: Array.from({ length: h }, () => Array(w).fill(FLOORS[0].frame)),
    walls: Array.from({ length: h }, () => Array(w).fill(null)),
    objects: [],
    npcs: [],
    missions: [],
    start: { x: 2, y: 1 },
  };
}

export default function AptMapMaker() {
  const { user } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [mapData, setMapData] = useState(null);
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMapList, setSavedMapList] = useState([]);

  // 에디터 상태
  const [tool, setTool] = useState({ type: 'floor', preset: FLOORS[0] });
  const [painting, setPainting] = useState(false);
  const [showNpcModal, setShowNpcModal] = useState(null); // {x,y} or null

  // 캠페인 목록 (ScenarioHub와 동일 소스)
  const campaigns = useMemo(() =>
    Object.keys(SCENARIOS).map((id) => ({
      id,
      level: SCENARIO_LEVEL_META[id]?.level ?? 1,
      name: SCENARIOS[id]?.name || id,
    })), []);

  // 저장된 맵 리스트 fetch
  useEffect(() => {
    listAptMaps().then(({ data }) => setSavedMapList(data || []));
  }, [saved]);

  // 캠페인 선택 시 맵 로드
  useEffect(() => {
    if (!selectedCampaign) { setMapData(null); return; }
    getAptMap(selectedCampaign).then(({ data, error }) => {
      if (error) { alert('로드 실패: ' + error.message); return; }
      if (data?.map_data) setMapData(data.map_data);
      else setMapData(emptyMap(DEFAULT_W, DEFAULT_H));
      setSaved(Date.now());
    });
  }, [selectedCampaign]);

  // 타일 배치
  const paintAt = (x, y, rightClick = false) => {
    if (!mapData) return;
    const m = structuredClone(mapData);
    if (rightClick) {
      // 지우기: 우클릭한 셀의 상위 레이어부터 제거
      const objIdx = m.objects.findIndex((o) => o.x === x && o.y === y);
      if (objIdx >= 0) m.objects.splice(objIdx, 1);
      else if (m.walls[y][x] !== null) m.walls[y][x] = null;
      else {
        const npcIdx = m.npcs.findIndex((n) => n.x === x && n.y === y);
        if (npcIdx >= 0) m.npcs.splice(npcIdx, 1);
        else {
          const msIdx = m.missions.findIndex((mm) => mm.x === x && mm.y === y);
          if (msIdx >= 0) m.missions.splice(msIdx, 1);
        }
      }
    } else {
      switch (tool.type) {
        case 'floor':
          m.floor[y][x] = tool.preset.frame; break;
        case 'wall':
          m.walls[y][x] = tool.preset.frame; break;
        case 'object': {
          // 같은 좌표 기존 오브젝트 교체
          const i = m.objects.findIndex((o) => o.x === x && o.y === y);
          if (i >= 0) m.objects.splice(i, 1);
          m.objects.push({ x, y, sheet: tool.preset.sheet, frame: tool.preset.frame, collide: tool.preset.collide });
          break;
        }
        case 'mission': {
          if (!m.missions.some((mm) => mm.x === x && mm.y === y)) m.missions.push({ x, y });
          break;
        }
        case 'start':
          m.start = { x, y }; break;
        case 'npc':
          setShowNpcModal({ x, y, existing: m.npcs.find((n) => n.x === x && n.y === y) });
          return; // 모달에서 저장
        default: break;
      }
    }
    setMapData(m);
  };

  const confirmNpc = ({ x, y, sprite, name, line }) => {
    const m = structuredClone(mapData);
    const i = m.npcs.findIndex((n) => n.x === x && n.y === y);
    if (i >= 0) m.npcs.splice(i, 1);
    m.npcs.push({ x, y, sprite, name, line });
    setMapData(m);
    setShowNpcModal(null);
  };

  const save = async () => {
    if (!selectedCampaign || !mapData || !user) return;
    setSaving(true);
    const { error } = await upsertAptMap(selectedCampaign, mapData, user.id);
    setSaving(false);
    if (error) alert('저장 실패: ' + error.message);
    else { setSaved(Date.now()); alert('✅ 저장 완료 — 학습자 게임에 즉시 반영'); }
  };

  return (
    <div className="flex gap-3" style={{ height: 'calc(100vh - 200px)' }}>
      {/* ── 좌: 캠페인 선택 + 팔레트 */}
      <aside className="w-60 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-600 mb-2">캠페인 선택</div>
          <select
            className="w-full text-xs border border-slate-300 rounded px-2 py-1.5"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">— 선택하세요 —</option>
            {campaigns.map((c) => {
              const saved = savedMapList.find((s) => s.campaign_id === c.id);
              return (
                <option key={c.id} value={c.id}>
                  Lv{c.level} · {c.id} {c.name} {saved ? '💾' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <PaletteSection title="🟫 바닥" items={FLOORS} type="floor" sheet="room" tool={tool} setTool={setTool} />
          <PaletteSection title="🧱 벽" items={WALLS} type="wall" sheet="room" tool={tool} setTool={setTool} />
          <PaletteSection title="🪑 오브젝트" items={OBJECTS} type="object" sheet="deco" tool={tool} setTool={setTool} />
          <ToolSection tool={tool} setTool={setTool} />
        </div>
      </aside>

      {/* ── 중앙: 그리드 캔버스 */}
      <main className="flex-1 bg-slate-900 rounded-lg overflow-auto p-4 flex items-start justify-center">
        {!mapData ? (
          <div className="text-slate-400 text-sm mt-20">좌측에서 캠페인을 선택하세요.</div>
        ) : (
          <div
            className="relative select-none"
            style={{ width: mapData.width * CELL, height: mapData.height * CELL, boxShadow: '0 0 0 2px #334155' }}
            onMouseDown={(e) => { e.preventDefault(); setPainting(true); }}
            onMouseUp={() => setPainting(false)}
            onMouseLeave={() => setPainting(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {mapData.floor.map((row, y) =>
              row.map((floorFrame, x) => (
                <Cell
                  key={`${x}-${y}`}
                  x={x} y={y} map={mapData}
                  onDown={(rc) => paintAt(x, y, rc)}
                  onEnter={() => { if (painting) paintAt(x, y, false); }}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* ── 우: 메타 + 저장 */}
      <aside className="w-64 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-600 mb-2">현재 도구</div>
          <div className="text-sm font-bold text-blue-600">
            {tool.type === 'floor' && `🟫 ${tool.preset.name}`}
            {tool.type === 'wall' && `🧱 ${tool.preset.name}`}
            {tool.type === 'object' && `🪑 ${tool.preset.name}`}
            {tool.type === 'npc' && '🧑 NPC 배치'}
            {tool.type === 'mission' && '🎯 미션존'}
            {tool.type === 'start' && '🚩 시작점'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">좌클릭=배치 · 우클릭=지우기</div>
        </div>

        {mapData && (
          <div className="p-3 border-b border-slate-200 text-xs text-slate-600 space-y-1">
            <div>크기: {mapData.width} × {mapData.height}</div>
            <div>벽: {mapData.walls.flat().filter(Boolean).length}</div>
            <div>오브젝트: {mapData.objects.length}</div>
            <div>NPC: {mapData.npcs.length}</div>
            <div>미션존: {mapData.missions.length}</div>
            <div>시작점: ({mapData.start.x}, {mapData.start.y})</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {mapData?.npcs.map((n, i) => (
            <div key={i} className="text-[11px] bg-amber-50 border border-amber-200 rounded p-2">
              <div className="font-bold text-amber-800">🧑 {n.name} ({n.x},{n.y})</div>
              <div className="text-amber-700 line-clamp-2">{n.line}</div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={save}
            disabled={!mapData || saving}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded"
          >
            {saving ? '저장 중…' : '💾 저장'}
          </button>
        </div>
      </aside>

      {/* NPC 편집 모달 */}
      {showNpcModal && (
        <NpcEditModal
          pos={showNpcModal}
          onCancel={() => setShowNpcModal(null)}
          onConfirm={confirmNpc}
        />
      )}
    </div>
  );
}

// ── 하위 컴포넌트 ──

function PaletteSection({ title, items, type, sheet, tool, setTool }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-slate-500 mb-1.5">{title}</div>
      <div className="grid grid-cols-3 gap-1.5">
        {items.map((it) => {
          const active = tool.type === type && tool.preset.id === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTool({ type, preset: { ...it, sheet: it.sheet || sheet } })}
              title={it.name}
              className={`relative aspect-square border rounded overflow-hidden ${active ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-200 hover:border-slate-400'}`}
            >
              <div className="absolute inset-0 bg-slate-100" />
              <div style={{ ...frameToBg(it.sheet || sheet, it.frame, 2), position: 'absolute', left: 0, top: 0 }} />
              <div className="absolute bottom-0 left-0 right-0 text-[9px] bg-black/50 text-white px-0.5 truncate">
                {it.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToolSection({ tool, setTool }) {
  const tools = [
    { id: 'npc', label: '🧑 NPC' },
    { id: 'mission', label: '🎯 미션존' },
    { id: 'start', label: '🚩 시작점' },
  ];
  return (
    <div>
      <div className="text-[11px] font-bold text-slate-500 mb-1.5">도구</div>
      <div className="grid grid-cols-3 gap-1.5">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool({ type: t.id, preset: {} })}
            className={`text-[11px] py-2 rounded border ${tool.type === t.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-slate-200 hover:border-slate-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Cell({ x, y, map, onDown, onEnter }) {
  const wallFrame = map.walls[y][x];
  const obj = map.objects.find((o) => o.x === x && o.y === y);
  const npc = map.npcs.find((n) => n.x === x && n.y === y);
  const isMission = map.missions.some((m) => m.x === x && m.y === y);
  const isStart = map.start.x === x && map.start.y === y;

  return (
    <div
      onMouseDown={(e) => onDown(e.button === 2)}
      onMouseEnter={onEnter}
      className="absolute cursor-crosshair"
      style={{ left: x * CELL, top: y * CELL, width: CELL, height: CELL, outline: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* 바닥 */}
      <div style={{ ...frameToBg('room', map.floor[y][x], 2), position: 'absolute', left: 0, top: 0 }} />
      {/* 벽 */}
      {wallFrame != null && (
        <div style={{ ...frameToBg('room', wallFrame, 2), position: 'absolute', left: 0, top: 0 }} />
      )}
      {/* 오브젝트 */}
      {obj && (
        <div style={{ ...frameToBg(obj.sheet, obj.frame, 2), position: 'absolute', left: 0, top: 0, opacity: 0.95 }} />
      )}
      {/* NPC 마커 */}
      {npc && (
        <div className="absolute inset-0 flex items-center justify-center text-lg bg-amber-400/40">🧑</div>
      )}
      {/* 미션존 */}
      {isMission && (
        <div className="absolute inset-0 border-2 border-red-500 bg-red-500/20 animate-pulse" />
      )}
      {/* 시작점 */}
      {isStart && (
        <div className="absolute inset-0 flex items-center justify-center text-sm">🚩</div>
      )}
    </div>
  );
}

function NpcEditModal({ pos, onCancel, onConfirm }) {
  const [sprite, setSprite] = useState(pos.existing?.sprite || 'alex');
  const [name, setName] = useState(pos.existing?.name || '');
  const [line, setLine] = useState(pos.existing?.line || '');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl p-5 w-96 shadow-2xl">
        <div className="text-sm font-bold mb-3">🧑 NPC 배치 ({pos.x}, {pos.y})</div>
        <label className="block text-[11px] font-bold text-slate-600 mb-1">캐릭터</label>
        <select value={sprite} onChange={(e) => setSprite(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-3">
          {NPC_SPRITES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <label className="block text-[11px] font-bold text-slate-600 mb-1">이름</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김 과장"
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-3" />
        <label className="block text-[11px] font-bold text-slate-600 mb-1">대사 (APT 힌트)</label>
        <textarea value={line} onChange={(e) => setLine(e.target.value)} rows={3}
          placeholder="이메일 첨부파일이 수상해요… (T1566)"
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-4" />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded">취소</button>
          <button
            onClick={() => onConfirm({ x: pos.x, y: pos.y, sprite, name: name || 'NPC', line: line || '...' })}
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

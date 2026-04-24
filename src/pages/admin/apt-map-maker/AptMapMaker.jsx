// APT 맵 메이커 — Sticky Office / Gather.town 스타일 시각 편집기
//
// 기능:
//   · 캠페인 선택 → DB(apt_maps) 또는 localStorage 폴백 로드
//   · 타일 팔레트: 바닥/벽/가구 (프리셋 + 커스텀 추가/삭제)
//   · 그리드 캔버스: 좌클릭 배치 · 드래그 페인트 · 우클릭 지우기
//   · 맵 크기 조정 (리사이즈 시 기존 데이터 보존)
//   · 줌 1x/2x/3x (기본 2x — 16px 원본 → 32px 표시)
//   · NPC 모달 · 미션존 · 시작점 도구
//   · 저장: Supabase 우선, 실패 시 localStorage 폴백 (자동)
//
// 커스텀 팔레트 저장: localStorage key = 'gotroot_apt_palette'

import { useEffect, useMemo, useRef, useState } from 'react';
import { getAptMap, upsertAptMap, listAptMaps } from '../../../api/apt-maps';
import { useAuth } from '../../../context/AuthContext';
import { SCENARIOS, SCENARIO_LEVEL_META } from '../../apt/study/VictimScenario';

const TS = 16;                    // 타일 소스 크기 (16×16 원본)
const DEFAULT_W = 30;
const DEFAULT_H = 20;
const PALETTE_LS = 'gotroot_apt_palette';

// 기본 프리셋 (관리자가 삭제/추가 가능)
const DEFAULT_PALETTE = {
  floors: [
    { id: 'f_brick',  name: '벽돌 바닥',  sheet: 'room', frame: 65 },
    { id: 'f_yellow', name: '노란 체커',  sheet: 'room', frame: 82 },
    { id: 'f_blue',   name: '파란 타일',  sheet: 'room', frame: 99 },
    { id: 'f_gray',   name: '회색',       sheet: 'room', frame: 116 },
    { id: 'f_wood',   name: '나무',       sheet: 'room', frame: 133 },
  ],
  walls: [
    { id: 'w_wood',  name: '나무 벽', sheet: 'room', frame: 51 },
    { id: 'w_white', name: '흰 벽',   sheet: 'room', frame: 57 },
    { id: 'w_brick', name: '벽돌 벽', sheet: 'room', frame: 153 },
    { id: 'w_top',   name: '벽 상단', sheet: 'room', frame: 17 },
  ],
  objects: [
    { id: 'o_desk',   name: '책상',   sheet: 'deco', frame: 486, collide: true },
    { id: 'o_chair',  name: '의자',   sheet: 'deco', frame: 611, collide: true },
    { id: 'o_pc',     name: '모니터', sheet: 'deco', frame: 645, collide: false },
    { id: 'o_plant',  name: '화분',   sheet: 'deco', frame: 858, collide: false },
    { id: 'o_shelf',  name: '책장',   sheet: 'deco', frame: 772, collide: true },
    { id: 'o_sofa',   name: '소파',   sheet: 'deco', frame: 994, collide: true },
    { id: 'o_window', name: '창문',   sheet: 'deco', frame: 18,  collide: false },
  ],
};

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
const SHEET_ROWS = { room: 23, deco: 89 };

function frameToBg(sheet, frame, cellPx) {
  const cols = SHEET_COLS[sheet];
  const scale = cellPx / TS;
  const sx = (frame % cols) * TS;
  const sy = Math.floor(frame / cols) * TS;
  return {
    backgroundImage: `url(${SHEET_SRC[sheet]})`,
    backgroundPosition: `-${sx * scale}px -${sy * scale}px`,
    backgroundSize: `${cols * TS * scale}px auto`,
    imageRendering: 'pixelated',
    width: cellPx, height: cellPx,
  };
}

function emptyMap(w, h, floorFrame) {
  return {
    width: w, height: h, tileSize: TS,
    floor: Array.from({ length: h }, () => Array(w).fill(floorFrame)),
    walls: Array.from({ length: h }, () => Array(w).fill(null)),
    objects: [], npcs: [], missions: [],
    start: { x: Math.floor(w / 2), y: Math.floor(h / 2) },
  };
}

// 맵 크기 변경 시 데이터 보존 리사이즈
function resizeMap(m, w, h, defaultFloor) {
  const newFloor = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => m.floor[y]?.[x] ?? defaultFloor));
  const newWalls = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => m.walls[y]?.[x] ?? null));
  return {
    ...m, width: w, height: h,
    floor: newFloor, walls: newWalls,
    objects: (m.objects || []).filter((o) => o.x < w && o.y < h),
    npcs: (m.npcs || []).filter((n) => n.x < w && n.y < h),
    missions: (m.missions || []).filter((ms) => ms.x < w && ms.y < h),
    start: {
      x: Math.min(m.start?.x ?? 1, w - 1),
      y: Math.min(m.start?.y ?? 1, h - 1),
    },
  };
}

export default function AptMapMaker() {
  const { user } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [mapData, setMapData] = useState(null);
  const [loadedFrom, setLoadedFrom] = useState(null); // 'db' | 'localStorage' | 'none'
  const [saving, setSaving] = useState(false);
  const [savedMapList, setSavedMapList] = useState([]);

  // 팔레트 (localStorage에서 로드 → 관리자가 수정 가능)
  const [palette, setPalette] = useState(() => {
    try {
      const raw = localStorage.getItem(PALETTE_LS);
      return raw ? JSON.parse(raw) : DEFAULT_PALETTE;
    } catch { return DEFAULT_PALETTE; }
  });
  useEffect(() => {
    try { localStorage.setItem(PALETTE_LS, JSON.stringify(palette)); } catch {}
  }, [palette]);

  const [tool, setTool] = useState({ type: 'floor', preset: DEFAULT_PALETTE.floors[0] });
  const [painting, setPainting] = useState(false);
  const [showNpcModal, setShowNpcModal] = useState(null);
  const [showFramePicker, setShowFramePicker] = useState(null); // { category: 'floors'|'walls'|'objects' }

  // 줌 (셀 픽셀 크기): 16 / 32 / 48
  const [zoom, setZoom] = useState(32);

  // 리사이즈 입력
  const [sizeInput, setSizeInput] = useState({ w: DEFAULT_W, h: DEFAULT_H });

  const campaigns = useMemo(() =>
    Object.keys(SCENARIOS).map((id) => ({
      id,
      level: SCENARIO_LEVEL_META[id]?.level ?? 1,
      name: SCENARIOS[id]?.name || id,
    })), []);

  useEffect(() => {
    listAptMaps().then(({ data }) => setSavedMapList(data || []));
  }, [loadedFrom]);

  useEffect(() => {
    if (!selectedCampaign) { setMapData(null); setLoadedFrom(null); return; }
    getAptMap(selectedCampaign).then(({ data, source }) => {
      if (data?.map_data) {
        setMapData(data.map_data);
        setSizeInput({ w: data.map_data.width, h: data.map_data.height });
      } else {
        const m = emptyMap(DEFAULT_W, DEFAULT_H, palette.floors[0].frame);
        setMapData(m);
        setSizeInput({ w: DEFAULT_W, h: DEFAULT_H });
      }
      setLoadedFrom(source);
    });
  }, [selectedCampaign]); // eslint-disable-line

  const paintAt = (x, y, rightClick = false) => {
    if (!mapData) return;
    const m = structuredClone(mapData);
    if (rightClick) {
      // 지우기: 오브젝트 → 벽 → NPC → 미션존 순
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
        case 'floor': m.floor[y][x] = tool.preset.frame; break;
        case 'wall':  m.walls[y][x] = tool.preset.frame; break;
        case 'object': {
          const i = m.objects.findIndex((o) => o.x === x && o.y === y);
          if (i >= 0) m.objects.splice(i, 1);
          m.objects.push({ x, y, sheet: tool.preset.sheet, frame: tool.preset.frame, collide: tool.preset.collide });
          break;
        }
        case 'mission':
          if (!m.missions.some((mm) => mm.x === x && mm.y === y)) m.missions.push({ x, y });
          break;
        case 'start': m.start = { x, y }; break;
        case 'npc':
          setShowNpcModal({ x, y, existing: m.npcs.find((n) => n.x === x && n.y === y) });
          return;
        case 'erase': {
          // 전용 지우개 툴 = 우클릭과 동일
          const objIdx = m.objects.findIndex((o) => o.x === x && o.y === y);
          if (objIdx >= 0) m.objects.splice(objIdx, 1);
          else if (m.walls[y][x] !== null) m.walls[y][x] = null;
          break;
        }
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

  const addPaletteItem = (category, item) => {
    setPalette((p) => ({ ...p, [category]: [...p[category], { ...item, id: `${category[0]}_${Date.now()}` }] }));
    setShowFramePicker(null);
  };
  const removePaletteItem = (category, id) => {
    if (!confirm('이 팔레트 항목을 삭제할까요?')) return;
    setPalette((p) => ({ ...p, [category]: p[category].filter((it) => it.id !== id) }));
  };

  const resetPalette = () => {
    if (!confirm('팔레트를 기본값으로 되돌릴까요?')) return;
    setPalette(DEFAULT_PALETTE);
  };

  const applyResize = () => {
    if (!mapData) return;
    const w = Math.max(5, Math.min(100, parseInt(sizeInput.w) || DEFAULT_W));
    const h = Math.max(5, Math.min(100, parseInt(sizeInput.h) || DEFAULT_H));
    setMapData(resizeMap(mapData, w, h, palette.floors[0]?.frame || 65));
  };

  const save = async () => {
    if (!selectedCampaign || !mapData) return;
    setSaving(true);
    const { error, source, warning } = await upsertAptMap(selectedCampaign, mapData, user?.id);
    setSaving(false);
    if (error) { alert('저장 실패: ' + error.message); return; }
    setLoadedFrom(source);
    if (source === 'localStorage') {
      alert('💾 localStorage에 저장 완료\n(DB 저장 실패 — SQL 실행 후 자동으로 DB 사용)\n\n원인: ' + (warning || '네트워크/테이블 없음'));
    } else {
      alert('✅ DB 저장 완료 — 학습자 게임에 즉시 반영');
    }
  };

  return (
    <div className="flex gap-3" style={{ height: 'calc(100vh - 200px)' }}>
      {/* ── 좌: 캠페인 + 팔레트 ───────────────── */}
      <aside className="w-64 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
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
                  Lv{c.level} · {c.id} {saved ? '💾' : ''}
                </option>
              );
            })}
          </select>
          {loadedFrom && (
            <div className={`mt-2 text-[10px] px-2 py-1 rounded inline-block ${loadedFrom === 'db' ? 'bg-emerald-50 text-emerald-700' : loadedFrom === 'localStorage' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {loadedFrom === 'db' ? '🟢 DB' : loadedFrom === 'localStorage' ? '🟡 localStorage' : '⚪ 새 맵'}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <PaletteSection
            title="🟫 바닥" items={palette.floors} category="floors" type="floor"
            tool={tool} setTool={setTool} zoom={Math.min(zoom, 32)}
            onAdd={() => setShowFramePicker({ category: 'floors', sheet: 'room' })}
            onRemove={(id) => removePaletteItem('floors', id)}
          />
          <PaletteSection
            title="🧱 벽" items={palette.walls} category="walls" type="wall"
            tool={tool} setTool={setTool} zoom={Math.min(zoom, 32)}
            onAdd={() => setShowFramePicker({ category: 'walls', sheet: 'room' })}
            onRemove={(id) => removePaletteItem('walls', id)}
          />
          <PaletteSection
            title="🪑 오브젝트" items={palette.objects} category="objects" type="object"
            tool={tool} setTool={setTool} zoom={Math.min(zoom, 32)}
            onAdd={() => setShowFramePicker({ category: 'objects', sheet: 'deco' })}
            onRemove={(id) => removePaletteItem('objects', id)}
          />
          <ToolSection tool={tool} setTool={setTool} />
          <button onClick={resetPalette} className="w-full text-[10px] py-1.5 text-slate-500 hover:text-slate-700 border border-slate-200 rounded">
            🔄 팔레트 기본값 복원
          </button>
        </div>
      </aside>

      {/* ── 중앙: 캔버스 (가운데 정렬) ───────── */}
      <main className="flex-1 bg-slate-900 rounded-lg overflow-auto">
        <div className="min-h-full min-w-full flex items-center justify-center p-8">
          {!mapData ? (
            <div className="text-slate-400 text-sm">좌측에서 캠페인을 선택하세요.</div>
          ) : (
            <div
              className="relative select-none"
              style={{ width: mapData.width * zoom, height: mapData.height * zoom, boxShadow: '0 0 0 2px #334155' }}
              onMouseDown={(e) => { e.preventDefault(); setPainting(true); }}
              onMouseUp={() => setPainting(false)}
              onMouseLeave={() => setPainting(false)}
              onContextMenu={(e) => e.preventDefault()}
            >
              {mapData.floor.map((row, y) =>
                row.map((_, x) => (
                  <Cell
                    key={`${x}-${y}`}
                    x={x} y={y} map={mapData} cell={zoom}
                    onDown={(rc) => paintAt(x, y, rc)}
                    onEnter={() => { if (painting) paintAt(x, y, false); }}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── 우: 도구 + 크기 + 저장 ───────────── */}
      <aside className="w-64 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-600 mb-2">현재 도구</div>
          <div className="text-sm font-bold text-blue-600 truncate">
            {tool.type === 'floor'   && `🟫 ${tool.preset?.name}`}
            {tool.type === 'wall'    && `🧱 ${tool.preset?.name}`}
            {tool.type === 'object'  && `🪑 ${tool.preset?.name}`}
            {tool.type === 'npc'     && '🧑 NPC 배치'}
            {tool.type === 'mission' && '🎯 미션존'}
            {tool.type === 'start'   && '🚩 시작점'}
            {tool.type === 'erase'   && '🧽 지우개'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">좌클릭=배치 · 우클릭=지우기</div>
        </div>

        {/* 줌 */}
        <div className="p-3 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5">🔍 줌</div>
          <div className="grid grid-cols-3 gap-1">
            {[16, 32, 48].map((z) => (
              <button key={z} onClick={() => setZoom(z)}
                className={`text-xs py-1.5 rounded border ${zoom === z ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
                {z / 16}×
              </button>
            ))}
          </div>
        </div>

        {/* 맵 크기 */}
        {mapData && (
          <div className="p-3 border-b border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 mb-1.5">📐 맵 크기</div>
            <div className="flex items-center gap-1 mb-2">
              <input type="number" min="5" max="100" value={sizeInput.w}
                onChange={(e) => setSizeInput((s) => ({ ...s, w: e.target.value }))}
                className="w-16 border border-slate-300 rounded px-2 py-1 text-xs" />
              <span className="text-xs text-slate-500">×</span>
              <input type="number" min="5" max="100" value={sizeInput.h}
                onChange={(e) => setSizeInput((s) => ({ ...s, h: e.target.value }))}
                className="w-16 border border-slate-300 rounded px-2 py-1 text-xs" />
              <button onClick={applyResize} className="ml-auto text-[11px] px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded">
                적용
              </button>
            </div>
            <div className="text-[10px] text-slate-500">5~100 범위 · 기존 배치 보존</div>
          </div>
        )}

        {/* 메타 통계 */}
        {mapData && (
          <div className="p-3 border-b border-slate-200 text-xs text-slate-600 space-y-1">
            <div>현재: {mapData.width} × {mapData.height}</div>
            <div>벽: {mapData.walls.flat().filter((v) => v != null).length} · 오브젝트: {mapData.objects.length}</div>
            <div>NPC: {mapData.npcs.length} · 미션존: {mapData.missions.length}</div>
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
          <button onClick={save} disabled={!mapData || saving}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded">
            {saving ? '저장 중…' : '💾 저장'}
          </button>
        </div>
      </aside>

      {/* 모달들 */}
      {showNpcModal && (
        <NpcEditModal pos={showNpcModal} onCancel={() => setShowNpcModal(null)} onConfirm={confirmNpc} />
      )}
      {showFramePicker && (
        <FramePickerModal
          sheet={showFramePicker.sheet}
          onCancel={() => setShowFramePicker(null)}
          onPick={(item) => addPaletteItem(showFramePicker.category, item)}
          category={showFramePicker.category}
        />
      )}
    </div>
  );
}

// ── 하위 컴포넌트 ─────────────────────────

function PaletteSection({ title, items, category, type, tool, setTool, zoom, onAdd, onRemove }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[11px] font-bold text-slate-500">{title}</div>
        <button onClick={onAdd} className="text-[11px] text-blue-600 hover:text-blue-800 font-bold">+ 추가</button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {items.map((it) => {
          const active = tool.type === type && tool.preset?.id === it.id;
          return (
            <div key={it.id} className="relative group">
              <button
                onClick={() => setTool({ type, preset: it })}
                title={it.name}
                className={`relative aspect-square w-full border rounded overflow-hidden ${active ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-200 hover:border-slate-400'}`}
              >
                <div className="absolute inset-0 bg-slate-100" />
                <div style={{ ...frameToBg(it.sheet, it.frame, zoom), position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
                <div className="absolute bottom-0 left-0 right-0 text-[9px] bg-black/50 text-white px-0.5 truncate">
                  {it.name}
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(it.id); }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition"
                title="삭제"
              >×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolSection({ tool, setTool }) {
  const tools = [
    { id: 'npc',     label: '🧑 NPC' },
    { id: 'mission', label: '🎯 미션' },
    { id: 'start',   label: '🚩 시작' },
    { id: 'erase',   label: '🧽 지움' },
  ];
  return (
    <div>
      <div className="text-[11px] font-bold text-slate-500 mb-1.5">도구</div>
      <div className="grid grid-cols-2 gap-1.5">
        {tools.map((t) => (
          <button key={t.id}
            onClick={() => setTool({ type: t.id, preset: {} })}
            className={`text-[11px] py-2 rounded border ${tool.type === t.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Cell({ x, y, map, cell, onDown, onEnter }) {
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
      style={{ left: x * cell, top: y * cell, width: cell, height: cell, outline: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div style={{ ...frameToBg('room', map.floor[y][x], cell), position: 'absolute', left: 0, top: 0 }} />
      {wallFrame != null && (
        <div style={{ ...frameToBg('room', wallFrame, cell), position: 'absolute', left: 0, top: 0 }} />
      )}
      {obj && (
        <div style={{ ...frameToBg(obj.sheet, obj.frame, cell), position: 'absolute', left: 0, top: 0, opacity: 0.95 }} />
      )}
      {npc && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-400/40" style={{ fontSize: cell * 0.6 }}>🧑</div>
      )}
      {isMission && (
        <div className="absolute inset-0 border-2 border-red-500 bg-red-500/20 animate-pulse" />
      )}
      {isStart && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: cell * 0.5 }}>🚩</div>
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
          <button onClick={() => onConfirm({ x: pos.x, y: pos.y, sprite, name: name || 'NPC', line: line || '...' })}
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded">저장</button>
        </div>
      </div>
    </div>
  );
}

// 프레임 전체 그리드에서 시각적으로 고르는 피커
function FramePickerModal({ sheet, onCancel, onPick, category }) {
  const [picked, setPicked] = useState(null);
  const [name, setName] = useState('');
  const [collide, setCollide] = useState(category === 'objects');
  const [otherSheet, setOtherSheet] = useState(sheet);
  const cols = SHEET_COLS[otherSheet];
  const rows = SHEET_ROWS[otherSheet];
  const total = cols * rows;
  const THUMB = 24;
  const containerRef = useRef(null);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{ width: '90vw', maxWidth: 1000, height: '85vh' }}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
          <div className="text-sm font-bold">🎨 프레임 선택 → 팔레트 추가</div>
          <select value={otherSheet} onChange={(e) => { setOtherSheet(e.target.value); setPicked(null); }}
            className="ml-auto text-xs border border-slate-300 rounded px-2 py-1">
            <option value="room">Room Builder (바닥/벽)</option>
            <option value="deco">Interiors (가구)</option>
          </select>
        </div>

        <div ref={containerRef} className="flex-1 overflow-auto p-3 bg-slate-50">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, ${THUMB}px)`, gap: 2, width: 'fit-content' }}>
            {Array.from({ length: total }, (_, frame) => (
              <button key={frame}
                onClick={() => setPicked(frame)}
                title={`frame ${frame}`}
                className={`relative border ${picked === frame ? 'border-blue-500 ring-2 ring-blue-300 z-10' : 'border-slate-300 hover:border-slate-500'}`}
                style={{ width: THUMB, height: THUMB, background: '#fff' }}
              >
                <div style={{ ...frameToBg(otherSheet, frame, THUMB), position: 'absolute', left: 0, top: 0 }} />
                <div className="absolute bottom-0 right-0 text-[7px] bg-black/60 text-white px-0.5 pointer-events-none">{frame}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-3">
          {picked != null ? (
            <>
              <div className="flex items-center gap-2">
                <div className="border border-slate-300" style={frameToBg(otherSheet, picked, 48)} />
                <div className="text-xs text-slate-600">frame #{picked}</div>
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 (예: 책상)"
                className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm" />
              {category === 'objects' && (
                <label className="text-xs flex items-center gap-1">
                  <input type="checkbox" checked={collide} onChange={(e) => setCollide(e.target.checked)} />
                  충돌
                </label>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-500 flex-1">그리드에서 프레임을 선택하세요</div>
          )}
          <button onClick={onCancel} className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded">취소</button>
          <button
            disabled={picked == null || !name.trim()}
            onClick={() => onPick({ name: name.trim(), sheet: otherSheet, frame: picked, ...(category === 'objects' ? { collide } : {}) })}
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 disabled:bg-slate-300 text-white rounded">
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

// APT 맵 메이커 v2 — StarCraft UseMap 스타일 프로 에디터
//
// 레이아웃 (5섹션):
//   ┌─────────────────────────────────────────────┐
//   │ 메뉴바: 캠페인 / 템플릿 / Export / Save     │
//   ├────┬───────────────────────────┬───────────┤
//   │툴바│        캔버스              │ 팔레트    │
//   │    │                            │ (필터탭)  │
//   │    ├───────────────────────────┤           │
//   │    │  상태바 (x,y · 도구 · 크기) │           │
//   └────┴───────────────────────────┴───────────┘
//
// 단축키: B펜슬 R사각형 F채우기 E지우개 I스포이드 Ctrl+Z/Y 1-9팔레트 Space팬

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getAptMap, upsertAptMap, listAptMaps } from '../../../api/apt-maps';
import { useAuth } from '../../../context/AuthContext';
import { SCENARIOS, SCENARIO_LEVEL_META } from '../../apt/study/VictimScenario';

// ═══ 상수 ══════════════════════════════════════
const TS = 16;
const DEFAULT_W = 30;
const DEFAULT_H = 20;
const MAX_UNDO = 50;
const PALETTE_LS = 'gotroot_apt_palette_v2';

const SHEET_SRC = {
  room: '/apt-assets/Room_Builder_free_16x16.png',
  deco: '/apt-assets/Interiors_free_16x16.png',
};
const SHEET_COLS = { room: 17, deco: 16 };
const SHEET_ROWS = { room: 23, deco: 89 };

// Interiors 카테고리 (256×1424 PNG 실측 기반 — 2026-04-24 보정)
const DECO_CATEGORIES = [
  { id: 'all',       label: '전체',      rowStart: 0,  rowEnd: 89 },
  { id: 'window',    label: '🪟 창문',    rowStart: 0,  rowEnd: 5 },
  { id: 'shelf',     label: '📚 책장/서랍', rowStart: 5,  rowEnd: 10 },
  { id: 'sofa',      label: '🛋️ 소파/쿠션', rowStart: 10, rowEnd: 16 },
  { id: 'deco',      label: '🖼️ 액자/벽',  rowStart: 16, rowEnd: 23 },
  { id: 'kitchen',   label: '🍳 주방카운터', rowStart: 23, rowEnd: 28 },
  { id: 'door',      label: '🚪 문',       rowStart: 28, rowEnd: 31 },
  { id: 'chair',     label: '🪑 의자',     rowStart: 31, rowEnd: 38 },
  { id: 'table',     label: '🔲 테이블/보드', rowStart: 38, rowEnd: 46 },
  { id: 'elec',      label: '🖥️ 전자제품',  rowStart: 46, rowEnd: 51 },
  { id: 'plant',     label: '🌿 식물',     rowStart: 51, rowEnd: 55 },
  { id: 'lamp',      label: '💡 조명',     rowStart: 55, rowEnd: 59 },
  { id: 'utensil',   label: '🍽️ 주방기구',  rowStart: 59, rowEnd: 69 },
  { id: 'fireplace', label: '🔥 벽난로/거울', rowStart: 69, rowEnd: 74 },
  { id: 'bed',       label: '🛏️ 침대',     rowStart: 74, rowEnd: 79 },
  { id: 'misc',      label: '📦 기타',     rowStart: 79, rowEnd: 89 },
];
const ROOM_CATEGORIES = [
  { id: 'all',   label: '전체', rowStart: 0,  rowEnd: 23 },
  { id: 'top',   label: '벽상단', rowStart: 0, rowEnd: 3 },
  { id: 'wall',  label: '벽면',  rowStart: 3, rowEnd: 11 },
  { id: 'floor', label: '바닥',  rowStart: 11, rowEnd: 23 },
];

const DEFAULT_PALETTE = {
  floors: [
    { id: 'f_brick',  name: '벽돌',     sheet: 'room', frame: 65 },
    { id: 'f_yellow', name: '체커',     sheet: 'room', frame: 82 },
    { id: 'f_blue',   name: '블루타일', sheet: 'room', frame: 99 },
    { id: 'f_gray',   name: '회색',     sheet: 'room', frame: 116 },
    { id: 'f_wood',   name: '나무',     sheet: 'room', frame: 133 },
  ],
  walls: [
    { id: 'w_wood',  name: '나무벽', sheet: 'room', frame: 51 },
    { id: 'w_white', name: '흰벽',   sheet: 'room', frame: 57 },
    { id: 'w_brick', name: '벽돌벽', sheet: 'room', frame: 153 },
    { id: 'w_top',   name: '벽상단', sheet: 'room', frame: 17 },
  ],
  // 실측 기반 기본 프레임 (카테고리 중앙값) — 2026-04-24 보정
  // desk: row 40(table),  chair: row 33,  pc: row 47(elec),  plant: row 52
  // shelf: row 6,  sofa: row 12,  window: row 1,  door: row 29
  objects: [
    { id: 'o_desk',   name: '책상',   sheet: 'deco', frame: 640, collide: true },   // row 40 col 0
    { id: 'o_chair',  name: '의자',   sheet: 'deco', frame: 528, collide: true },   // row 33 col 0
    { id: 'o_pc',     name: '모니터', sheet: 'deco', frame: 752, collide: false },  // row 47 col 0
    { id: 'o_plant',  name: '화분',   sheet: 'deco', frame: 842, collide: false },  // row 52 col 10
    { id: 'o_shelf',  name: '책장',   sheet: 'deco', frame: 96,  collide: true },   // row 6  col 0
    { id: 'o_sofa',   name: '소파',   sheet: 'deco', frame: 192, collide: true },   // row 12 col 0
    { id: 'o_window', name: '창문',   sheet: 'deco', frame: 18,  collide: false },  // row 1  col 2
    { id: 'o_door',   name: '문',     sheet: 'deco', frame: 464, collide: false },  // row 29 col 0
  ],
};

const NPC_SPRITES = [
  { key: 'alex',   label: 'Alex' },
  { key: 'amelia', label: 'Amelia' },
  { key: 'bob',    label: 'Bob' },
];

// ═══ 유틸 ══════════════════════════════════════
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
    start: { x: Math.min(m.start?.x ?? 1, w - 1), y: Math.min(m.start?.y ?? 1, h - 1) },
  };
}

function countCropped(m, w, h) {
  let floor = 0, walls = 0, objects = 0, npcs = 0, missions = 0;
  for (let y = h; y < m.height; y++) for (let x = 0; x < m.width; x++) { floor++; if (m.walls[y]?.[x] != null) walls++; }
  for (let y = 0; y < Math.min(h, m.height); y++) for (let x = w; x < m.width; x++) { floor++; if (m.walls[y]?.[x] != null) walls++; }
  objects = (m.objects || []).filter((o) => o.x >= w || o.y >= h).length;
  npcs = (m.npcs || []).filter((n) => n.x >= w || n.y >= h).length;
  missions = (m.missions || []).filter((ms) => ms.x >= w || ms.y >= h).length;
  return { floor, walls, objects, npcs, missions };
}

// ═══ 룸 템플릿 ══════════════════════════════════
// ── APT 시나리오 기본 NPC 3명 (alex=피해자/amelia=보안팀/bob=공격자)
const APT_NPCS = [
  { spriteKey: 'alex',   name: '김민수 (재무팀)', line: '이상한 이메일이 계속 와서 이미 열어버렸어요... 첨부 파일도 실행했는데, 괜찮을까요?' },
  { spriteKey: 'amelia', name: '박지영 (보안팀)', line: 'SIEM에 알림이 연속으로 뜨고 있어요. PowerShell 비정상 실행 + 외부 IP 통신 의심. 로그 분석 도와주세요.' },
  { spriteKey: 'bob',    name: '정체불명의 직원',  line: '(수상한 USB를 만지작거리며) 어? 뭐야, 그냥 지나가는 중인데요?' },
];

function addNpcs(m, palette, positions) {
  // positions: [{x,y}, {x,y}, {x,y}] 3개
  positions.forEach((pos, i) => {
    if (!pos || i >= APT_NPCS.length) return;
    m.npcs.push({ x: pos.x, y: pos.y, ...APT_NPCS[i] });
  });
}

// ── 템플릿 헬퍼: 팔레트에서 오브젝트 id로 찾기 (없으면 null)
function findObj(palette, id) { return (palette.objects || []).find((o) => o.id === id) || null; }
function addObj(m, palette, id, x, y) {
  const o = findObj(palette, id);
  if (!o) return;
  m.objects.push({ x, y, sheet: o.sheet, frame: o.frame, collide: !!o.collide });
}
function rect(m, x0, y0, x1, y1, wallFrame) {
  for (let x = x0; x <= x1; x++) { m.walls[y0][x] = wallFrame; m.walls[y1][x] = wallFrame; }
  for (let y = y0; y <= y1; y++) { m.walls[y][x0] = wallFrame; m.walls[y][x1] = wallFrame; }
}
function fillFloor(m, x0, y0, x1, y1, frame) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.floor[y][x] = frame;
}

function templateOpen(palette) {
  const m = emptyMap(30, 20, palette.floors[0].frame);
  const W = palette.walls[0].frame;
  rect(m, 0, 0, 29, 19, W);
  // 4열 책상 배치 (가로 2개씩 쌍)
  for (let row = 0; row < 2; row++) {
    const by = 4 + row * 7;
    for (let col = 0; col < 4; col++) {
      const bx = 3 + col * 6;
      addObj(m, palette, 'o_desk',  bx,     by);
      addObj(m, palette, 'o_desk',  bx + 1, by);
      addObj(m, palette, 'o_pc',    bx,     by);
      addObj(m, palette, 'o_pc',    bx + 1, by);
      addObj(m, palette, 'o_chair', bx,     by + 1);
      addObj(m, palette, 'o_chair', bx + 1, by + 1);
    }
  }
  // 코너 화분
  addObj(m, palette, 'o_plant', 1, 1);
  addObj(m, palette, 'o_plant', 28, 1);
  addObj(m, palette, 'o_plant', 1, 18);
  addObj(m, palette, 'o_plant', 28, 18);
  // 창문 (상단 벽)
  addObj(m, palette, 'o_window', 8, 0);
  addObj(m, palette, 'o_window', 15, 0);
  addObj(m, palette, 'o_window', 22, 0);
  // APT NPC 3명
  addNpcs(m, palette, [{ x: 4, y: 5 }, { x: 18, y: 5 }, { x: 25, y: 12 }]);
  // 미션 (피해자 PC / 보안팀 콘솔)
  m.missions.push({ x: 4, y: 6 });
  m.missions.push({ x: 18, y: 6 });
  m.start = { x: 2, y: 2 };
  return m;
}

function template3Rooms(palette) {
  const m = emptyMap(36, 20, palette.floors[0].frame);
  const W = palette.walls[0].frame;
  const F1 = palette.floors[0].frame;
  const F2 = palette.floors[1]?.frame ?? F1;
  const F3 = palette.floors[2]?.frame ?? F1;

  rect(m, 0, 0, 35, 19, W);
  // 세로 분리벽 (복도 쪽 문 y=10)
  for (let y = 1; y < 19; y++) { if (y !== 10) m.walls[y][12] = W; }
  for (let y = 1; y < 19; y++) { if (y !== 10) m.walls[y][24] = W; }
  // 방별 바닥
  fillFloor(m,  1, 1, 11, 18, F1);
  fillFloor(m, 13, 1, 23, 18, F2);
  fillFloor(m, 25, 1, 34, 18, F3);

  // ── Room A (좌): 업무 공간 — 책상 3쌍
  for (let i = 0; i < 3; i++) {
    const by = 3 + i * 5;
    addObj(m, palette, 'o_desk', 3, by);
    addObj(m, palette, 'o_desk', 4, by);
    addObj(m, palette, 'o_pc',   3, by);
    addObj(m, palette, 'o_pc',   4, by);
    addObj(m, palette, 'o_chair', 3, by + 1);
    addObj(m, palette, 'o_chair', 4, by + 1);
    addObj(m, palette, 'o_desk', 8, by);
    addObj(m, palette, 'o_desk', 9, by);
    addObj(m, palette, 'o_pc',   8, by);
    addObj(m, palette, 'o_pc',   9, by);
    addObj(m, palette, 'o_chair', 8, by + 1);
    addObj(m, palette, 'o_chair', 9, by + 1);
  }
  addObj(m, palette, 'o_plant', 1, 1);
  addObj(m, palette, 'o_shelf', 11, 2);
  addObj(m, palette, 'o_shelf', 11, 3);

  // ── Room B (중): 라운지 — 소파 + 책장
  addObj(m, palette, 'o_sofa', 15, 4);
  addObj(m, palette, 'o_sofa', 16, 4);
  addObj(m, palette, 'o_sofa', 17, 4);
  addObj(m, palette, 'o_sofa', 20, 14);
  addObj(m, palette, 'o_sofa', 21, 14);
  addObj(m, palette, 'o_sofa', 22, 14);
  addObj(m, palette, 'o_shelf', 14, 1);
  addObj(m, palette, 'o_shelf', 15, 1);
  addObj(m, palette, 'o_shelf', 22, 18);
  addObj(m, palette, 'o_plant', 14, 18);
  addObj(m, palette, 'o_plant', 23, 1);

  // ── Room C (우): 회의실 — 긴 테이블 + 의자
  for (let x = 27; x <= 32; x++) addObj(m, palette, 'o_desk', x, 8);
  for (let x = 27; x <= 32; x++) addObj(m, palette, 'o_chair', x, 6);
  for (let x = 27; x <= 32; x++) addObj(m, palette, 'o_chair', x, 10);
  addObj(m, palette, 'o_plant', 25, 1);
  addObj(m, palette, 'o_plant', 34, 1);
  addObj(m, palette, 'o_plant', 25, 18);
  addObj(m, palette, 'o_plant', 34, 18);

  // 창문
  addObj(m, palette, 'o_window', 5, 0);
  addObj(m, palette, 'o_window', 17, 0);
  addObj(m, palette, 'o_window', 29, 0);

  // APT NPC: A(피해자 재무팀) / B(보안팀 라운지) / C(공격자 회의실 침투)
  addNpcs(m, palette, [{ x: 3, y: 4 }, { x: 18, y: 10 }, { x: 29, y: 3 }]);
  // 미션 (피해자 PC / 회의실 노트북)
  m.missions.push({ x: 3, y: 3 });
  m.missions.push({ x: 29, y: 8 });
  m.start = { x: 2, y: 10 };
  return m;
}

function templateMeeting(palette) {
  const m = emptyMap(32, 22, palette.floors[0].frame);
  const W = palette.walls[0].frame;
  const F2 = palette.floors[1]?.frame ?? palette.floors[0].frame;

  rect(m, 0, 0, 31, 21, W);
  // 중앙 회의실 (10,5 ~ 21,15)
  rect(m, 10, 5, 21, 15, W);
  // 문 구멍 (상/하)
  m.walls[5][15] = null; m.walls[15][15] = null;
  fillFloor(m, 11, 6, 20, 14, F2);

  // ── 회의실 안: 긴 회의 테이블 + 의자 20석
  for (let x = 12; x <= 19; x++) addObj(m, palette, 'o_desk', x, 10);
  for (let x = 12; x <= 19; x++) addObj(m, palette, 'o_chair', x, 8);
  for (let x = 12; x <= 19; x++) addObj(m, palette, 'o_chair', x, 12);
  addObj(m, palette, 'o_plant', 11, 6);
  addObj(m, palette, 'o_plant', 20, 6);
  addObj(m, palette, 'o_plant', 11, 14);
  addObj(m, palette, 'o_plant', 20, 14);

  // ── 외곽: 워크스테이션 4군데 (회의실 밖 모서리)
  // 좌상
  addObj(m, palette, 'o_desk', 2, 2); addObj(m, palette, 'o_desk', 3, 2);
  addObj(m, palette, 'o_pc', 2, 2); addObj(m, palette, 'o_pc', 3, 2);
  addObj(m, palette, 'o_chair', 2, 3); addObj(m, palette, 'o_chair', 3, 3);
  // 우상
  addObj(m, palette, 'o_desk', 27, 2); addObj(m, palette, 'o_desk', 28, 2);
  addObj(m, palette, 'o_pc', 27, 2); addObj(m, palette, 'o_pc', 28, 2);
  addObj(m, palette, 'o_chair', 27, 3); addObj(m, palette, 'o_chair', 28, 3);
  // 좌하: 라운지 소파
  addObj(m, palette, 'o_sofa', 2, 18); addObj(m, palette, 'o_sofa', 3, 18); addObj(m, palette, 'o_sofa', 4, 18);
  addObj(m, palette, 'o_plant', 1, 17);
  // 우하: 책장 라이브러리
  addObj(m, palette, 'o_shelf', 27, 18); addObj(m, palette, 'o_shelf', 28, 18); addObj(m, palette, 'o_shelf', 29, 18);
  addObj(m, palette, 'o_plant', 30, 17);

  // 창문
  addObj(m, palette, 'o_window', 6, 0);
  addObj(m, palette, 'o_window', 15, 0);
  addObj(m, palette, 'o_window', 25, 0);

  // APT NPC: 피해자(좌상 워크스테이션) / 보안팀(회의실 안) / 공격자(우상 워크스테이션)
  addNpcs(m, palette, [{ x: 3, y: 4 }, { x: 15, y: 10 }, { x: 28, y: 4 }]);
  m.missions.push({ x: 3, y: 3 });
  m.missions.push({ x: 15, y: 10 });
  m.start = { x: 2, y: 20 };
  return m;
}

// ── templateBreach: 침입 시나리오 — 서버실 + 경비실 + 대기실
function templateBreach(palette) {
  const m = emptyMap(40, 24, palette.floors[0].frame);
  const W = palette.walls[0].frame;
  const F_SERVER = palette.floors[2]?.frame ?? palette.floors[0].frame; // 블루타일
  const F_GUARD  = palette.floors[3]?.frame ?? palette.floors[0].frame; // 회색
  const F_LOBBY  = palette.floors[4]?.frame ?? palette.floors[0].frame; // 나무

  rect(m, 0, 0, 39, 23, W);

  // ┌────────────┬───────────┐
  // │ 서버실      │           │
  // │ (좌)        │ 대기실    │
  // ├────────────┤ (중앙)     │
  // │ 경비실      │           │
  // │ (좌하)      │           │
  // └────────────┴───────────┘
  //                         │ 복도(우) │

  // 세로 분리벽 (x=15: 서버실/경비실 vs 대기실) 문 y=12
  for (let y = 1; y < 23; y++) if (y !== 12) m.walls[y][15] = W;
  // 가로 분리벽 (y=10: 서버실/경비실) 문 x=7
  for (let x = 1; x < 15; x++) if (x !== 7) m.walls[10][x] = W;
  // 세로 분리벽 (x=30: 대기실/복도) 문 y=12
  for (let y = 1; y < 23; y++) if (y !== 12) m.walls[y][30] = W;

  // 방별 바닥
  fillFloor(m,  1, 1, 14,  9, F_SERVER);
  fillFloor(m,  1, 11, 14, 22, F_GUARD);
  fillFloor(m, 16, 1, 29, 22, F_LOBBY);

  // ── 서버실: 서버랙(책장 대용) 2열 × 4개
  for (let i = 0; i < 4; i++) {
    addObj(m, palette, 'o_shelf', 3 + i * 2, 3);
    addObj(m, palette, 'o_shelf', 3 + i * 2, 4);
    addObj(m, palette, 'o_shelf', 3 + i * 2, 7);
    addObj(m, palette, 'o_shelf', 3 + i * 2, 8);
  }
  // 서버실 관리 콘솔
  addObj(m, palette, 'o_desk', 12, 5);
  addObj(m, palette, 'o_pc',   12, 5);
  addObj(m, palette, 'o_chair', 12, 6);

  // ── 경비실: CCTV 모니터 벽 + 경비 책상
  for (let x = 2; x <= 6; x++) {
    addObj(m, palette, 'o_pc', x, 12);
  }
  addObj(m, palette, 'o_desk', 2, 15); addObj(m, palette, 'o_desk', 3, 15);
  addObj(m, palette, 'o_pc', 2, 15);  addObj(m, palette, 'o_pc', 3, 15);
  addObj(m, palette, 'o_chair', 2, 16); addObj(m, palette, 'o_chair', 3, 16);
  // 경비 라운지
  addObj(m, palette, 'o_sofa', 10, 18); addObj(m, palette, 'o_sofa', 11, 18); addObj(m, palette, 'o_sofa', 12, 18);
  addObj(m, palette, 'o_plant', 13, 13);
  addObj(m, palette, 'o_plant', 1, 22);

  // ── 대기실: 방문객 소파 + 리셉션 데스크
  addObj(m, palette, 'o_desk', 20, 3); addObj(m, palette, 'o_desk', 21, 3); addObj(m, palette, 'o_desk', 22, 3);
  addObj(m, palette, 'o_pc',   21, 3);
  addObj(m, palette, 'o_chair', 21, 4);
  // 방문객 대기 소파 (2줄)
  addObj(m, palette, 'o_sofa', 18, 10); addObj(m, palette, 'o_sofa', 19, 10); addObj(m, palette, 'o_sofa', 20, 10);
  addObj(m, palette, 'o_sofa', 24, 10); addObj(m, palette, 'o_sofa', 25, 10); addObj(m, palette, 'o_sofa', 26, 10);
  addObj(m, palette, 'o_sofa', 18, 18); addObj(m, palette, 'o_sofa', 19, 18); addObj(m, palette, 'o_sofa', 20, 18);
  addObj(m, palette, 'o_plant', 17, 1); addObj(m, palette, 'o_plant', 29, 1);
  addObj(m, palette, 'o_plant', 17, 22); addObj(m, palette, 'o_plant', 29, 22);

  // ── 복도: 비상구 + 화분
  addObj(m, palette, 'o_plant', 32, 2); addObj(m, palette, 'o_plant', 38, 2);
  addObj(m, palette, 'o_plant', 32, 22); addObj(m, palette, 'o_plant', 38, 22);
  addObj(m, palette, 'o_door', 39, 12);

  // 창문
  addObj(m, palette, 'o_window', 5, 0);
  addObj(m, palette, 'o_window', 22, 0);
  addObj(m, palette, 'o_window', 35, 0);

  // APT NPC: 경비원(경비실) / 보안팀(서버실) / 공격자(대기실 위장)
  m.npcs.push({ x: 8, y: 15, spriteKey: 'bob',    name: '이경호 (야간 경비)', line: '어젯밤 1시쯤 낯선 사람이 대기실을 서성거렸어요. CCTV 확인해보시겠어요?' });
  m.npcs.push({ x: 10, y: 5, spriteKey: 'amelia', name: '박지영 (보안팀)',    line: '서버실 접근 로그에 이상이 있어요. 한 계정이 새벽에 여러 번 로그인 시도했어요.' });
  m.npcs.push({ x: 22, y: 12, spriteKey: 'alex',  name: '정체불명의 방문자',   line: '(방문증을 목에 걸고) 아, 저는 외부 업체 A/S 기사입니다. 어디로 가면 되죠?' });

  // 미션: 서버랙 / CCTV 콘솔 / 리셉션 출입기록
  m.missions.push({ x: 12, y: 5 });  // 서버 콘솔
  m.missions.push({ x: 4, y: 12 });  // CCTV
  m.missions.push({ x: 21, y: 3 });  // 리셉션 로그

  m.start = { x: 35, y: 12 };
  return m;
}

const TEMPLATES = [
  { id: 'open',    label: '🏢 오픈 오피스 (APT)',   fn: templateOpen },
  { id: '3rooms',  label: '🚪 3방 사무실 (APT)',    fn: template3Rooms },
  { id: 'meeting', label: '👥 회의실 중심 (APT)',   fn: templateMeeting },
  { id: 'breach',  label: '🛡️ 침입 시나리오 (서버+경비+대기)', fn: templateBreach },
  { id: 'blank',   label: '⬜ 빈 맵 (외곽벽 없음)', fn: (p) => emptyMap(30, 20, p.floors[0].frame) },
];

// ═══ 리듀서 (Undo/Redo) ═════════════════════════
function mapReducer(state, action) {
  const push = (next) => {
    const history = [...state.history.slice(0, state.idx + 1), state.mapData].slice(-MAX_UNDO);
    return { mapData: next, history, idx: history.length - 1 };
  };
  switch (action.type) {
    case 'LOAD':
      return { mapData: action.mapData, history: [], idx: -1 };
    case 'SET_NO_HISTORY':
      return { ...state, mapData: action.mapData };
    case 'PAINT': {
      const m = structuredClone(state.mapData);
      action.cells.forEach(([x, y]) => action.apply(m, x, y));
      return push(m);
    }
    case 'REPLACE': // 리사이즈/템플릿
      return push(action.mapData);
    case 'UNDO': {
      if (state.idx < 0) return state;
      return { mapData: state.history[state.idx], history: [...state.history, state.mapData], idx: state.idx - 1 };
    }
    case 'REDO': {
      if (state.idx + 1 >= state.history.length) return state;
      const next = state.history[state.idx + 1];
      return { mapData: next, history: state.history, idx: state.idx + 1 };
    }
    default: return state;
  }
}

// ═══ 컴포넌트 ══════════════════════════════════
export default function AptMapMaker() {
  const { user } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [state, dispatch] = useReducer(mapReducer, { mapData: null, history: [], idx: -1 });
  const mapData = state.mapData;
  const [loadedFrom, setLoadedFrom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMapList, setSavedMapList] = useState([]);

  const [palette, setPalette] = useState(() => {
    try { const raw = localStorage.getItem(PALETTE_LS); return raw ? JSON.parse(raw) : DEFAULT_PALETTE; }
    catch { return DEFAULT_PALETTE; }
  });
  useEffect(() => { try { localStorage.setItem(PALETTE_LS, JSON.stringify(palette)); } catch {} }, [palette]);

  const [tool, setTool] = useState('pencil');  // pencil|rect|fill|erase|pick|npc|mission|start
  const [activePreset, setActivePreset] = useState({ category: 'floors', item: DEFAULT_PALETTE.floors[0] });
  const [zoom, setZoom] = useState(32);
  const [paletteTab, setPaletteTab] = useState('floors');
  const [paletteFilter, setPaletteFilter] = useState('all');
  const [layers, setLayers] = useState({ floor: true, walls: true, objects: true, npcs: true, missions: true });
  const [showFramePicker, setShowFramePicker] = useState(null);
  const [showNpcModal, setShowNpcModal] = useState(null);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);
  const [dragStart, setDragStart] = useState(null); // 박스 채우기용
  const canvasWrapRef = useRef(null);

  const campaigns = useMemo(() =>
    Object.keys(SCENARIOS).map((id) => ({
      id,
      level: SCENARIO_LEVEL_META[id]?.level ?? 1,
    })), []);

  useEffect(() => {
    listAptMaps().then(({ data }) => setSavedMapList(data || []));
  }, [loadedFrom]);

  useEffect(() => {
    if (!selectedCampaign) { dispatch({ type: 'LOAD', mapData: null }); setLoadedFrom(null); return; }
    getAptMap(selectedCampaign).then(({ data, source }) => {
      if (data?.map_data) dispatch({ type: 'LOAD', mapData: data.map_data });
      else dispatch({ type: 'LOAD', mapData: emptyMap(DEFAULT_W, DEFAULT_H, palette.floors[0].frame) });
      setLoadedFrom(source);
    });
  }, [selectedCampaign]); // eslint-disable-line

  // 단축키
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); dispatch({ type: 'REDO' }); return; }
      const key = e.key.toLowerCase();
      const map = { b: 'pencil', r: 'rect', f: 'fill', e: 'erase', i: 'pick', n: 'npc', m: 'mission' };
      if (map[key]) { setTool(map[key]); return; }
      // 1-9: 활성 탭에서 n번째 팔레트
      if (/^[1-9]$/.test(e.key)) {
        const items = palette[paletteTab] || [];
        const idx = parseInt(e.key) - 1;
        if (items[idx]) setActivePreset({ category: paletteTab, item: items[idx] });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [palette, paletteTab]);

  // ── 페인트 적용 함수 ──
  const applyPaintSingle = (m, x, y) => {
    if (x < 0 || y < 0 || x >= m.width || y >= m.height) return;
    if (tool === 'erase') {
      const oi = m.objects.findIndex((o) => o.x === x && o.y === y);
      if (oi >= 0) m.objects.splice(oi, 1);
      else if (m.walls[y][x] !== null) m.walls[y][x] = null;
      else {
        const ni = m.npcs.findIndex((n) => n.x === x && n.y === y);
        if (ni >= 0) m.npcs.splice(ni, 1);
        else {
          const mi = m.missions.findIndex((mm) => mm.x === x && mm.y === y);
          if (mi >= 0) m.missions.splice(mi, 1);
        }
      }
      return;
    }
    if (activePreset.category === 'floors') m.floor[y][x] = activePreset.item.frame;
    else if (activePreset.category === 'walls') m.walls[y][x] = activePreset.item.frame;
    else if (activePreset.category === 'objects') {
      const i = m.objects.findIndex((o) => o.x === x && o.y === y);
      if (i >= 0) m.objects.splice(i, 1);
      m.objects.push({ x, y, sheet: activePreset.item.sheet, frame: activePreset.item.frame, collide: activePreset.item.collide });
    }
  };

  const paintCells = (cells) => dispatch({ type: 'PAINT', cells, apply: applyPaintSingle });

  // Flood fill
  const floodFill = (x, y) => {
    if (!mapData) return;
    const target = activePreset.category === 'floors'
      ? mapData.floor[y][x]
      : activePreset.category === 'walls' ? mapData.walls[y][x] : null;
    if (activePreset.category === 'objects') return;
    const queue = [[x, y]];
    const seen = new Set();
    const cells = [];
    while (queue.length) {
      const [cx, cy] = queue.shift();
      const k = `${cx},${cy}`;
      if (seen.has(k)) continue; seen.add(k);
      if (cx < 0 || cy < 0 || cx >= mapData.width || cy >= mapData.height) continue;
      const cur = activePreset.category === 'floors' ? mapData.floor[cy][cx] : mapData.walls[cy][cx];
      if (cur !== target) continue;
      cells.push([cx, cy]);
      queue.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    paintCells(cells);
  };

  // 셀 클릭/드래그 핸들러
  const onCellDown = (x, y, rightClick, ctrl) => {
    if (rightClick) { paintCells([[x, y]]); return; } // 우클릭=지우기
    switch (tool) {
      case 'pencil':
      case 'erase':
        paintCells([[x, y]]);
        setDragStart({ x, y, dragType: 'brush' });
        break;
      case 'rect':
        setDragStart({ x, y, dragType: 'rect' });
        break;
      case 'fill':
        floodFill(x, y);
        break;
      case 'pick': {
        const obj = mapData.objects.find((o) => o.x === x && o.y === y);
        if (obj) { /* TODO: add to palette */ }
        else if (mapData.walls[y][x] != null) setActivePreset({ category: 'walls', item: { ...(palette.walls.find((w) => w.frame === mapData.walls[y][x]) || { id: 'pick_w', name: '스포이드', sheet: 'room', frame: mapData.walls[y][x] }) } });
        else setActivePreset({ category: 'floors', item: { ...(palette.floors.find((f) => f.frame === mapData.floor[y][x]) || { id: 'pick_f', name: '스포이드', sheet: 'room', frame: mapData.floor[y][x] }) } });
        break;
      }
      case 'npc':
        setShowNpcModal({ x, y, existing: mapData.npcs.find((n) => n.x === x && n.y === y) });
        break;
      case 'mission': {
        const m = structuredClone(mapData);
        if (!m.missions.some((mm) => mm.x === x && mm.y === y)) m.missions.push({ x, y });
        dispatch({ type: 'REPLACE', mapData: m });
        break;
      }
      case 'start': {
        const m = structuredClone(mapData); m.start = { x, y };
        dispatch({ type: 'REPLACE', mapData: m });
        break;
      }
      default: break;
    }
  };

  const onCellEnter = (x, y) => {
    setHoverCell({ x, y });
    if (!dragStart) return;
    if (dragStart.dragType === 'brush') paintCells([[x, y]]);
  };

  const onCanvasUp = () => {
    if (dragStart?.dragType === 'rect' && hoverCell) {
      const x1 = Math.min(dragStart.x, hoverCell.x), x2 = Math.max(dragStart.x, hoverCell.x);
      const y1 = Math.min(dragStart.y, hoverCell.y), y2 = Math.max(dragStart.y, hoverCell.y);
      const cells = [];
      for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) cells.push([x, y]);
      paintCells(cells);
    }
    setDragStart(null);
  };

  const confirmNpc = ({ x, y, sprite, name, line }) => {
    const m = structuredClone(mapData);
    const i = m.npcs.findIndex((n) => n.x === x && n.y === y);
    if (i >= 0) m.npcs.splice(i, 1);
    m.npcs.push({ x, y, sprite, name, line });
    dispatch({ type: 'REPLACE', mapData: m });
    setShowNpcModal(null);
  };

  const applyTemplate = (tpl) => {
    if (!confirm(`"${tpl.label}" 템플릿을 적용하면 현재 맵이 대체됩니다. 계속?`)) return;
    dispatch({ type: 'REPLACE', mapData: tpl.fn(palette) });
  };

  const exportPalette = () => {
    const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `apt-palette-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importPalette = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const p = JSON.parse(reader.result);
        if (!p.floors || !p.walls || !p.objects) throw new Error('포맷 오류');
        setPalette(p);
        alert('✅ 팔레트 불러오기 완료');
      } catch (e) { alert('❌ 불러오기 실패: ' + e.message); }
    };
    reader.readAsText(file);
  };

  const save = async () => {
    if (!selectedCampaign || !mapData) return;
    setSaving(true);
    const { error, source, warning } = await upsertAptMap(selectedCampaign, mapData, user?.id);
    setSaving(false);
    if (error) { alert('저장 실패: ' + error.message); return; }
    setLoadedFrom(source);
    if (source === 'localStorage') alert('💾 localStorage 저장 — SQL 실행 후 자동 DB 전환\n' + (warning || ''));
    else alert('✅ DB 저장 — 학습자 게임에 즉시 반영');
  };

  // 팔레트 현재 아이템 리스트
  const paletteItems = palette[paletteTab] || [];
  const canUndo = state.idx >= 0;
  const canRedo = state.idx + 1 < state.history.length;

  return (
    <div className="flex flex-col bg-slate-100 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
      {/* ═══ 메뉴바 ═══ */}
      <div className="bg-slate-800 text-white px-3 py-2 flex items-center gap-2 flex-shrink-0">
        <div className="text-xs font-bold text-emerald-400 mr-2">MAPMAKER</div>
        <select className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1"
          value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
          <option value="">캠페인 선택…</option>
          {campaigns.map((c) => {
            const saved = savedMapList.find((s) => s.campaign_id === c.id);
            return <option key={c.id} value={c.id}>Lv{c.level} · {c.id} {saved ? '💾' : ''}</option>;
          })}
        </select>

        <div className="h-5 w-px bg-slate-600 mx-1" />

        <select className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1"
          defaultValue="" onChange={(e) => {
            const tpl = TEMPLATES.find((t) => t.id === e.target.value);
            if (tpl && mapData) applyTemplate(tpl);
            e.target.value = '';
          }} disabled={!mapData}>
          <option value="">📐 템플릿 적용…</option>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>

        <button onClick={() => setShowResizeModal(true)} disabled={!mapData}
          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-40">
          📏 크기 변경
        </button>

        <div className="h-5 w-px bg-slate-600 mx-1" />

        <button onClick={exportPalette} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">
          📤 팔레트 내보내기
        </button>
        <label className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded cursor-pointer">
          📥 팔레트 가져오기
          <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && importPalette(e.target.files[0])} />
        </label>

        <div className="flex-1" />

        {loadedFrom && (
          <span className={`text-[10px] px-2 py-0.5 rounded ${loadedFrom === 'db' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {loadedFrom === 'db' ? '🟢 DB' : '🟡 localStorage'}
          </span>
        )}

        <button onClick={save} disabled={!mapData || saving}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded font-bold">
          {saving ? '저장 중…' : '💾 저장'}
        </button>
      </div>

      {/* ═══ 본체: 툴바 / 캔버스 / 팔레트 ═══ */}
      <div className="flex flex-1 min-h-0">
        {/* 툴바 */}
        <div className="w-14 bg-slate-700 flex flex-col items-center py-2 gap-1 flex-shrink-0">
          <ToolBtn icon="✏️" label="펜슬 (B)" active={tool === 'pencil'} onClick={() => setTool('pencil')} />
          <ToolBtn icon="▭" label="사각형 (R)" active={tool === 'rect'} onClick={() => setTool('rect')} />
          <ToolBtn icon="🪣" label="채우기 (F)" active={tool === 'fill'} onClick={() => setTool('fill')} />
          <ToolBtn icon="🧽" label="지우개 (E)" active={tool === 'erase'} onClick={() => setTool('erase')} />
          <ToolBtn icon="💧" label="스포이드 (I)" active={tool === 'pick'} onClick={() => setTool('pick')} />
          <div className="h-px w-8 bg-slate-500 my-1" />
          <ToolBtn icon="🧑" label="NPC (N)" active={tool === 'npc'} onClick={() => setTool('npc')} />
          <ToolBtn icon="🎯" label="미션 (M)" active={tool === 'mission'} onClick={() => setTool('mission')} />
          <ToolBtn icon="🚩" label="시작점" active={tool === 'start'} onClick={() => setTool('start')} />
          <div className="h-px w-8 bg-slate-500 my-1" />
          <ToolBtn icon="↶" label="Undo (⌘Z)" disabled={!canUndo} onClick={() => dispatch({ type: 'UNDO' })} />
          <ToolBtn icon="↷" label="Redo (⌘⇧Z)" disabled={!canRedo} onClick={() => dispatch({ type: 'REDO' })} />
          <div className="flex-1" />
          {/* 레이어 토글 */}
          <div className="flex flex-col gap-0.5 items-center pb-1">
            {Object.entries(layers).map(([k, v]) => (
              <button key={k} onClick={() => setLayers((L) => ({ ...L, [k]: !v }))}
                title={`${k} 레이어`}
                className={`text-[9px] w-10 py-0.5 rounded ${v ? 'bg-slate-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* 캔버스 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={canvasWrapRef}
            className="flex-1 overflow-auto bg-slate-900 relative"
            onMouseUp={onCanvasUp} onMouseLeave={() => { onCanvasUp(); setHoverCell(null); }}
          >
            <div className="min-h-full min-w-full flex items-center justify-center p-8">
              {!mapData ? (
                <div className="text-slate-400 text-sm">상단에서 캠페인을 선택하세요. (또는 템플릿 적용)</div>
              ) : (
                <div className="relative select-none"
                  style={{ width: mapData.width * zoom, height: mapData.height * zoom, boxShadow: '0 0 0 2px #334155' }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {mapData.floor.map((row, y) =>
                    row.map((_, x) => (
                      <Cell key={`${x}-${y}`} x={x} y={y} map={mapData} cell={zoom} layers={layers}
                        onDown={(rc, ctrl) => onCellDown(x, y, rc, ctrl)}
                        onEnter={() => onCellEnter(x, y)}
                      />
                    ))
                  )}
                  {/* 박스 드래그 프리뷰 */}
                  {dragStart?.dragType === 'rect' && hoverCell && (
                    <div className="absolute border-2 border-blue-400 bg-blue-400/20 pointer-events-none"
                      style={{
                        left: Math.min(dragStart.x, hoverCell.x) * zoom,
                        top: Math.min(dragStart.y, hoverCell.y) * zoom,
                        width: (Math.abs(dragStart.x - hoverCell.x) + 1) * zoom,
                        height: (Math.abs(dragStart.y - hoverCell.y) + 1) * zoom,
                      }} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 상태바 */}
          <div className="bg-slate-200 border-t border-slate-300 px-3 py-1.5 text-[11px] text-slate-700 flex items-center gap-4 flex-shrink-0">
            <span>도구: <b>{tool}</b></span>
            <span>팔레트: <b>{activePreset.item?.name || '-'}</b></span>
            {hoverCell && <span>좌표: ({hoverCell.x}, {hoverCell.y})</span>}
            {mapData && <span>맵: {mapData.width}×{mapData.height}</span>}
            <div className="flex-1" />
            <span>줌:</span>
            {[16, 32, 48].map((z) => (
              <button key={z} onClick={() => setZoom(z)}
                className={`px-2 ${zoom === z ? 'bg-blue-600 text-white rounded' : 'hover:underline'}`}>
                {z / 16}×
              </button>
            ))}
          </div>
        </div>

        {/* 팔레트 */}
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
          {/* 팔레트 탭 */}
          <div className="flex border-b border-slate-200">
            {[
              { id: 'floors',  label: '🟫 바닥' },
              { id: 'walls',   label: '🧱 벽' },
              { id: 'objects', label: '🪑 오브젝트' },
            ].map((t) => (
              <button key={t.id}
                onClick={() => { setPaletteTab(t.id); setPaletteFilter('all'); }}
                className={`flex-1 text-xs py-2 font-bold ${paletteTab === t.id ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* 카테고리 필터 (objects만) */}
          {paletteTab === 'objects' && (
            <div className="px-2 py-2 border-b border-slate-100 flex flex-wrap gap-1">
              {DECO_CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setPaletteFilter(c.id)}
                  className={`text-[10px] px-2 py-0.5 rounded ${paletteFilter === c.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* 팔레트 아이템 */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {paletteItems.map((it, i) => {
                const active = activePreset.category === paletteTab && activePreset.item?.id === it.id;
                return (
                  <div key={it.id} className="relative group">
                    <button onClick={() => setActivePreset({ category: paletteTab, item: it })} title={`${it.name} (${i + 1})`}
                      className={`relative aspect-square w-full border rounded overflow-hidden ${active ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-200 hover:border-slate-400'}`}>
                      <div className="absolute inset-0 bg-slate-100" />
                      <div style={{ ...frameToBg(it.sheet, it.frame, 40), position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 text-[8px] bg-black/60 text-white px-0.5 truncate">{it.name}</div>
                      {i < 9 && <div className="absolute top-0 left-0 text-[8px] bg-white/70 px-0.5 rounded-br">{i + 1}</div>}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('삭제?')) setPalette((p) => ({ ...p, [paletteTab]: p[paletteTab].filter((x) => x.id !== it.id) })); }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition">×</button>
                  </div>
                );
              })}
              <button onClick={() => setShowFramePicker({ category: paletteTab, sheet: paletteTab === 'objects' ? 'deco' : 'room', filter: paletteFilter })}
                className="aspect-square border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500">
                +
              </button>
            </div>
          </div>

          {/* NPC 목록 */}
          {mapData?.npcs.length > 0 && (
            <div className="border-t border-slate-200 p-2 max-h-32 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-500 mb-1">🧑 NPC ({mapData.npcs.length})</div>
              {mapData.npcs.map((n, i) => (
                <div key={i} className="text-[10px] bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mb-0.5">
                  <b>{n.name}</b> ({n.x},{n.y})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ 모달들 ═══ */}
      {showNpcModal && <NpcEditModal pos={showNpcModal} onCancel={() => setShowNpcModal(null)} onConfirm={confirmNpc} />}
      {showFramePicker && (
        <FramePickerModal
          sheet={showFramePicker.sheet} filter={showFramePicker.filter}
          onCancel={() => setShowFramePicker(null)}
          onPick={(item) => {
            const cat = showFramePicker.category;
            setPalette((p) => ({ ...p, [cat]: [...p[cat], { ...item, id: `${cat[0]}_${Date.now()}` }] }));
            setShowFramePicker(null);
          }}
          category={showFramePicker.category}
        />
      )}
      {showResizeModal && mapData && (
        <ResizeModal mapData={mapData} palette={palette}
          onCancel={() => setShowResizeModal(false)}
          onConfirm={(w, h) => {
            dispatch({ type: 'REPLACE', mapData: resizeMap(mapData, w, h, palette.floors[0]?.frame || 65) });
            setShowResizeModal(false);
          }} />
      )}
    </div>
  );
}

// ═══ 하위 컴포넌트 ══════════════════════════════
function ToolBtn({ icon, label, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label}
      className={`w-10 h-10 rounded text-lg flex items-center justify-center transition ${
        active ? 'bg-blue-500 text-white' :
        disabled ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
        'bg-slate-600 text-white hover:bg-slate-500'
      }`}>
      {icon}
    </button>
  );
}

function Cell({ x, y, map, cell, layers, onDown, onEnter }) {
  const wallFrame = map.walls[y][x];
  const obj = map.objects.find((o) => o.x === x && o.y === y);
  const npc = map.npcs.find((n) => n.x === x && n.y === y);
  const isMission = map.missions.some((m) => m.x === x && m.y === y);
  const isStart = map.start.x === x && map.start.y === y;
  return (
    <div onMouseDown={(e) => onDown(e.button === 2, e.ctrlKey || e.metaKey)} onMouseEnter={onEnter}
      className="absolute cursor-crosshair"
      style={{ left: x * cell, top: y * cell, width: cell, height: cell }}>
      {layers.floor && (
        <div style={{ ...frameToBg('room', map.floor[y][x], cell), position: 'absolute', left: 0, top: 0 }} />
      )}
      {layers.walls && wallFrame != null && (
        <div style={{ ...frameToBg('room', wallFrame, cell), position: 'absolute', left: 0, top: 0 }} />
      )}
      {layers.objects && obj && (
        <div style={{ ...frameToBg(obj.sheet, obj.frame, cell), position: 'absolute', left: 0, top: 0 }} />
      )}
      {layers.npcs && npc && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-400/40" style={{ fontSize: cell * 0.5 }}>🧑</div>
      )}
      {layers.missions && isMission && (
        <div className="absolute inset-0 border-2 border-red-500 bg-red-500/20 animate-pulse" />
      )}
      {isStart && <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: cell * 0.5 }}>🚩</div>}
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
        <div className="text-sm font-bold mb-3">🧑 NPC ({pos.x}, {pos.y})</div>
        <label className="block text-[11px] font-bold text-slate-600 mb-1">캐릭터</label>
        <select value={sprite} onChange={(e) => setSprite(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-3">
          {NPC_SPRITES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <label className="block text-[11px] font-bold text-slate-600 mb-1">이름</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김 과장"
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-3" />
        <label className="block text-[11px] font-bold text-slate-600 mb-1">대사</label>
        <textarea value={line} onChange={(e) => setLine(e.target.value)} rows={3}
          placeholder="이메일 첨부가 수상해… (T1566)"
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

function FramePickerModal({ sheet, filter, category, onCancel, onPick }) {
  const [picked, setPicked] = useState(null);
  const [name, setName] = useState('');
  const [collide, setCollide] = useState(category === 'objects');
  const [currentSheet, setCurrentSheet] = useState(sheet);
  const [currentFilter, setCurrentFilter] = useState(filter || 'all');
  const cols = SHEET_COLS[currentSheet];
  const rows = SHEET_ROWS[currentSheet];
  const cats = currentSheet === 'deco' ? DECO_CATEGORIES : ROOM_CATEGORIES;
  const active = cats.find((c) => c.id === currentFilter) || cats[0];
  const THUMB = 28;
  const startFrame = active.rowStart * cols;
  const endFrame = active.rowEnd * cols;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{ width: '90vw', maxWidth: 1100, height: '85vh' }}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
          <div className="text-sm font-bold">🎨 프레임 선택</div>
          <select value={currentSheet} onChange={(e) => { setCurrentSheet(e.target.value); setPicked(null); setCurrentFilter('all'); }}
            className="text-xs border border-slate-300 rounded px-2 py-1">
            <option value="room">Room Builder</option>
            <option value="deco">Interiors</option>
          </select>
          <div className="flex gap-1 flex-wrap">
            {cats.map((c) => (
              <button key={c.id} onClick={() => { setCurrentFilter(c.id); setPicked(null); }}
                className={`text-[11px] px-2 py-1 rounded ${currentFilter === c.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[10px] text-slate-500">rows {active.rowStart}-{active.rowEnd - 1}</div>
        </div>

        <div className="flex-1 overflow-auto p-3 bg-slate-50">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, ${THUMB}px)`, gap: 2, width: 'fit-content' }}>
            {Array.from({ length: endFrame - startFrame }, (_, i) => {
              const frame = startFrame + i;
              return (
                <button key={frame} onClick={() => setPicked(frame)} title={`frame ${frame}`}
                  className={`relative border ${picked === frame ? 'border-blue-500 ring-2 ring-blue-300 z-10' : 'border-slate-300 hover:border-slate-500'}`}
                  style={{ width: THUMB, height: THUMB, background: '#fff' }}>
                  <div style={{ ...frameToBg(currentSheet, frame, THUMB), position: 'absolute', left: 0, top: 0 }} />
                  <div className="absolute bottom-0 right-0 text-[7px] bg-black/60 text-white px-0.5 pointer-events-none">{frame}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-3">
          {picked != null ? (
            <>
              <div style={frameToBg(currentSheet, picked, 48)} className="border border-slate-300" />
              <div className="text-xs text-slate-600">frame #{picked}</div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름"
                className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm" />
              {category === 'objects' && (
                <label className="text-xs flex items-center gap-1">
                  <input type="checkbox" checked={collide} onChange={(e) => setCollide(e.target.checked)} /> 충돌
                </label>
              )}
            </>
          ) : <div className="text-xs text-slate-500 flex-1">그리드에서 프레임을 선택하세요</div>}
          <button onClick={onCancel} className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded">취소</button>
          <button disabled={picked == null || !name.trim()}
            onClick={() => onPick({ name: name.trim(), sheet: currentSheet, frame: picked, ...(category === 'objects' ? { collide } : {}) })}
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 disabled:bg-slate-300 text-white rounded">추가</button>
        </div>
      </div>
    </div>
  );
}

function ResizeModal({ mapData, palette, onCancel, onConfirm }) {
  const [w, setW] = useState(mapData.width);
  const [h, setH] = useState(mapData.height);
  const willCrop = w < mapData.width || h < mapData.height;
  const cropped = willCrop ? countCropped(mapData, w, h) : null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl p-5 w-96 shadow-2xl">
        <div className="text-sm font-bold mb-3">📏 맵 크기 변경</div>
        <div className="text-xs text-slate-600 mb-3">현재: {mapData.width} × {mapData.height}</div>
        <div className="flex items-center gap-2 mb-3">
          <input type="number" min="5" max="100" value={w} onChange={(e) => setW(parseInt(e.target.value) || 5)}
            className="w-20 border border-slate-300 rounded px-2 py-1.5 text-sm" />
          <span>×</span>
          <input type="number" min="5" max="100" value={h} onChange={(e) => setH(parseInt(e.target.value) || 5)}
            className="w-20 border border-slate-300 rounded px-2 py-1.5 text-sm" />
          <span className="text-[10px] text-slate-500">(5~100)</span>
        </div>
        {willCrop && cropped && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-[11px] text-red-700 mb-3">
            ⚠️ 크기 축소로 다음 데이터가 <b>영구 삭제</b>됩니다:
            <ul className="mt-1 ml-4 list-disc">
              {cropped.walls > 0 && <li>벽 타일 {cropped.walls}개</li>}
              {cropped.objects > 0 && <li>오브젝트 {cropped.objects}개</li>}
              {cropped.npcs > 0 && <li>NPC {cropped.npcs}명</li>}
              {cropped.missions > 0 && <li>미션존 {cropped.missions}개</li>}
              {cropped.walls + cropped.objects + cropped.npcs + cropped.missions === 0 && <li>빈 영역만 삭제됨 (안전)</li>}
            </ul>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded">취소</button>
          <button onClick={() => onConfirm(w, h)}
            className={`px-3 py-1.5 text-xs font-bold text-white rounded ${willCrop ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {willCrop ? '⚠️ 잘라내고 적용' : '✓ 적용'}
          </button>
        </div>
      </div>
    </div>
  );
}

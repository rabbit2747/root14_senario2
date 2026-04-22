// AptGame — Phaser.js 도트맵 게임 엔진 마운트 (PoC)
//
// 목적: Gather.town 스타일 2D 탐험 → 작전 지점 도착 시 미션 시퀀스 트리거
// 현재: 타일맵 에셋 없음 → 색상 블록으로 프로토타입 (사무실 배치)
// TODO: 사용자 PNG 에셋 수집 후 Tiled로 map.json 제작 → loadTilemapTiledJSON

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';

const TILE = 32;
const MAP_W = 20; // 20 * 32 = 640
const MAP_H = 15; // 15 * 32 = 480

// 맵 레이아웃 (0=바닥, 1=벽, 2=책상, 3=미션존)
const LAYOUT = [
  '11111111111111111111',
  '10000000000000000031',
  '10222000000000000001',
  '10000000001111100001',
  '10000000001000100001',
  '10003000001000100001',
  '10000000001000100001',
  '10000000000000000001',
  '10222000000002222001',
  '10000000000000000001',
  '10000003000000000001',
  '10000000000000000001',
  '10000000000000000001',
  '10000000000000000001',
  '11111111111111111111',
];

class OfficeScene extends Phaser.Scene {
  constructor() { super('office'); }

  create() {
    // 타일 그리기 (에셋 없이 Graphics)
    const g = this.add.graphics();
    this.missionZones = [];

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = LAYOUT[y][x];
        const px = x * TILE;
        const py = y * TILE;
        if (t === '1') { g.fillStyle(0x2a2a33); g.fillRect(px, py, TILE, TILE); g.lineStyle(1, 0x1a1a22); g.strokeRect(px, py, TILE, TILE); }
        else if (t === '2') { g.fillStyle(0x8b6f3c); g.fillRect(px + 2, py + 2, TILE - 4, TILE - 4); }
        else if (t === '3') { g.fillStyle(0xef4444); g.fillRect(px + 6, py + 6, TILE - 12, TILE - 12); this.missionZones.push({ x: px + TILE / 2, y: py + TILE / 2 }); }
        else { g.fillStyle(0x1a1f2b); g.fillRect(px, py, TILE, TILE); }
      }
    }

    // 플레이어 (도트 캐릭터 — 색상블록 PoC)
    this.player = this.add.rectangle(TILE * 2 + TILE / 2, TILE * 7 + TILE / 2, TILE - 8, TILE - 8, 0x60a5fa);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // 입력
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // 미션존 근접 감지
    this.onMissionEnter = this.registry.get('onMissionEnter');
  }

  update() {
    const speed = 160;
    const b = this.player.body;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    b.setVelocity(vx, vy);

    // 미션존 진입 체크
    for (const z of this.missionZones) {
      const dx = this.player.x - z.x;
      const dy = this.player.y - z.y;
      if (Math.sqrt(dx * dx + dy * dy) < TILE * 0.7) {
        if (!z._triggered && this.onMissionEnter) {
          z._triggered = true;
          this.onMissionEnter(z);
          this.time.delayedCall(3000, () => { z._triggered = false; });
        }
      }
    }
  }
}

export default function AptGame() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const [currentMission, setCurrentMission] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: MAP_W * TILE,
      height: MAP_H * TILE,
      backgroundColor: '#0a0a0f',
      parent: mountRef.current,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false },
      },
      scene: [OfficeScene],
    };

    const game = new Phaser.Game(config);
    game.registry.set('onMissionEnter', (zone) => {
      setCurrentMission({ zone, at: Date.now() });
    });
    gameRef.current = game;

    return () => { game.destroy(true); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/apt/scenarios')} className="text-xs text-gray-400 hover:text-white">
            ← 시나리오 허브
          </button>
          <div className="text-xs text-gray-500 font-mono">{campaignId} · 탐험 모드 (PoC)</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* 게임 캔버스 */}
          <div className="bg-black/50 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-4">
            <div ref={mountRef} />
          </div>

          {/* 사이드 패널 */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">🎮 조작</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <div>WASD / 화살표: 이동</div>
                <div>🔴 빨간 블록 = 미션존</div>
                <div>책상 옆으로 가면 작전 시작</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">📍 현재 미션</h3>
              {currentMission ? (
                <div className="text-xs">
                  <div className="text-amber-400 font-bold mb-1">미션존 진입</div>
                  <div className="text-gray-400">
                    좌표 ({Math.round(currentMission.zone.x)}, {Math.round(currentMission.zone.y)})
                  </div>
                  <button
                    onClick={() => navigate(`/apt/${campaignId}/scenario`)}
                    className="mt-3 w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded"
                  >
                    ▶ 시나리오 시작
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-500">미션존에 접근하세요</div>
              )}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs text-amber-400 font-bold mb-1">🚧 PoC 단계</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                타일맵 에셋 수집 후 Tiled 포맷으로 교체 예정. 현재는 색상블록 프로토타입.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

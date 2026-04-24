// AptGame — Phaser.js 도트맵 (isometric) + Adam 스프라이트 + NPC 대화
//
// 업그레이드 (2026-04-23):
//   · 플레이어: Adam_16x16.png 스프라이트 (Gather.town 스타일)
//   · 맵: isometric 다이아몬드 타일 (Phaser Graphics, 에셋 추가 없음)
//   · NPC: 3명 배치 + 근접 시 힌트 대사 (APT TTP 연결성)
//
// 에셋: /public/apt-assets/Adam_16x16.png (384×224, 24×14 grid of 16px frames)

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';

const TILE = 48;          // 논리 타일 크기 (isometric base)
const TILE_H = 24;        // 다이아몬드 높이 = TILE/2
const MAP_W = 14;
const MAP_H = 12;

// 0=바닥, 1=벽, 2=책상, 3=미션존, 9=NPC 위치(바닥 취급)
const LAYOUT = [
  '11111111111111',
  '10000000000031',
  '10220000009001',
  '10000001111001',
  '10000001001001',
  '10003001001001',
  '10000001001001',
  '10009000002201',
  '10220000000001',
  '10000003009001',
  '10000000000001',
  '11111111111111',
];

// NPC 배치: (tileX, tileY, id, color, emoji, name, dialogue)
const NPCS = [
  { tx: 9, ty: 2, id: 'n1', color: 0xfbbf24, emoji: '🧑‍💼', name: '김 과장',
    line: '"요즘 이메일 첨부파일이 수상해… SolarWinds 업데이트도 그래." (T1566 · T1195)' },
  { tx: 4, ty: 7, id: 'n2', color: 0x60a5fa, emoji: '🧑‍🔧', name: '보안팀 이 대리',
    line: '"PowerShell 실행이 비정상적으로 늘었어요. 로그 확인 필요." (T1059.001)' },
  { tx: 9, ty: 9, id: 'n3', color: 0xf472b6, emoji: '🧑‍💻', name: '개발자 박 팀장',
    line: '"빌드 서버 인증서가 바뀐 것 같아요. 공급망 점검해야…" (T1554)' },
];

// isometric 투영 유틸 (논리 타일 → 화면 픽셀)
function isoX(tx, ty) { return (tx - ty) * (TILE / 2); }
function isoY(tx, ty) { return (tx + ty) * (TILE_H / 2); }

class OfficeScene extends Phaser.Scene {
  constructor() { super('office'); }

  preload() {
    this.load.spritesheet('adam', '/apt-assets/Adam_16x16.png', {
      frameWidth: 16, frameHeight: 16,
    });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    // 월드 중심 오프셋: isometric 맵을 화면 중앙에 배치
    const OFF_X = W / 2;
    const OFF_Y = 80;

    this.offX = OFF_X;
    this.offY = OFF_Y;

    const g = this.add.graphics();
    this.missionZones = [];
    this.walls = [];

    // 바닥 먼저 (모든 타일 diamond 렌더)
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = LAYOUT[y][x];
        const cx = OFF_X + isoX(x, y);
        const cy = OFF_Y + isoY(x, y);
        // diamond 꼭짓점: top, right, bottom, left
        const pts = [
          cx, cy,
          cx + TILE / 2, cy + TILE_H / 2,
          cx, cy + TILE_H,
          cx - TILE / 2, cy + TILE_H / 2,
        ];

        if (t === '1') {
          // 벽: 어두운 블록 + 높이감 (수직 기둥)
          g.fillStyle(0x1a1f2b);
          g.fillPoints(this._diamond(cx, cy, TILE, TILE_H), true);
          // 기둥 측면 (좌/우 사각)
          g.fillStyle(0x0f1318);
          g.beginPath();
          g.moveTo(cx - TILE / 2, cy + TILE_H / 2);
          g.lineTo(cx, cy + TILE_H);
          g.lineTo(cx, cy + TILE_H + 20);
          g.lineTo(cx - TILE / 2, cy + TILE_H / 2 + 20);
          g.closePath();
          g.fillPath();
          g.fillStyle(0x161a22);
          g.beginPath();
          g.moveTo(cx, cy + TILE_H);
          g.lineTo(cx + TILE / 2, cy + TILE_H / 2);
          g.lineTo(cx + TILE / 2, cy + TILE_H / 2 + 20);
          g.lineTo(cx, cy + TILE_H + 20);
          g.closePath();
          g.fillPath();
          // 윗면 라인
          g.lineStyle(1, 0x2a2f3b);
          g.strokePoints(this._diamond(cx, cy, TILE, TILE_H), true);
          this.walls.push({ x: cx, y: cy + TILE_H / 2, tx: x, ty: y });
        } else {
          // 바닥: 체크 패턴
          const odd = (x + y) % 2 === 0;
          g.fillStyle(odd ? 0x2a3042 : 0x242938);
          g.fillPoints(this._diamond(cx, cy, TILE, TILE_H), true);
          g.lineStyle(1, 0x1c2030);
          g.strokePoints(this._diamond(cx, cy, TILE, TILE_H), true);
        }

        if (t === '2') {
          // 책상: 밝은 갈색 작은 박스
          g.fillStyle(0x8b6f3c);
          g.fillPoints(this._diamond(cx, cy - 6, TILE * 0.7, TILE_H * 0.7), true);
          g.lineStyle(1, 0x5a4520);
          g.strokePoints(this._diamond(cx, cy - 6, TILE * 0.7, TILE_H * 0.7), true);
        }
        if (t === '3') {
          // 미션존: 붉은 발광 마커
          g.fillStyle(0xef4444, 0.8);
          g.fillPoints(this._diamond(cx, cy - 2, TILE * 0.5, TILE_H * 0.5), true);
          g.lineStyle(2, 0xfca5a5);
          g.strokePoints(this._diamond(cx, cy - 2, TILE * 0.5, TILE_H * 0.5), true);
          this.missionZones.push({ x: cx, y: cy + TILE_H / 2, tx: x, ty: y });
        }
      }
    }

    // NPC 렌더 (원형 + 이모지 텍스트)
    this.npcs = NPCS.map((npc) => {
      const cx = OFF_X + isoX(npc.tx, npc.ty);
      const cy = OFF_Y + isoY(npc.tx, npc.ty);
      const circle = this.add.circle(cx, cy + TILE_H / 2 - 10, 12, npc.color);
      circle.setStrokeStyle(2, 0xffffff, 0.8);
      const emoji = this.add.text(cx, cy + TILE_H / 2 - 10, npc.emoji, {
        fontSize: '18px',
      }).setOrigin(0.5);
      const label = this.add.text(cx, cy + TILE_H / 2 - 30, npc.name, {
        fontSize: '10px', color: '#fbbf24', fontStyle: 'bold',
      }).setOrigin(0.5);
      return { ...npc, x: cx, y: cy + TILE_H / 2, sprite: circle, emoji, label };
    });

    // 플레이어 (Adam 스프라이트, frame 0 = idle-down)
    const startTx = 2, startTy = 1;
    const spx = OFF_X + isoX(startTx, startTy);
    const spy = OFF_Y + isoY(startTx, startTy) + TILE_H / 2;
    this.player = this.physics.add.sprite(spx, spy, 'adam', 0);
    this.player.setScale(2); // 16×16 → 32×32 시각 크기
    this.player.setOrigin(0.5, 0.8);
    this.player.body.setSize(14, 8);
    this.player.body.setOffset(1, 8);

    // 걷기 애니메이션 (Gather.town Adam 표준 레이아웃 추정):
    //   idle-down=frame 0, idle-right=6, idle-up=12, idle-left=18
    //   walk row는 6행 아래(144+) — 확실하지 않아 안전하게 idle 프레임만 사용
    this.anims.create({ key: 'idle-down',  frames: [{ key: 'adam', frame: 0 }],  frameRate: 1 });
    this.anims.create({ key: 'idle-right', frames: [{ key: 'adam', frame: 6 }],  frameRate: 1 });
    this.anims.create({ key: 'idle-up',    frames: [{ key: 'adam', frame: 12 }], frameRate: 1 });
    this.anims.create({ key: 'idle-left',  frames: [{ key: 'adam', frame: 18 }], frameRate: 1 });

    // 입력
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.interactKey = this.input.keyboard.addKey('E');

    this.onMissionEnter = this.registry.get('onMissionEnter');
    this.onNpcTalk = this.registry.get('onNpcTalk');

    this.player.anims.play('idle-down');
  }

  _diamond(cx, cy, w, h) {
    // Phaser Geom.Point 대신 plain 객체 배열
    return [
      { x: cx, y: cy },
      { x: cx + w / 2, y: cy + h / 2 },
      { x: cx, y: cy + h },
      { x: cx - w / 2, y: cy + h / 2 },
    ];
  }

  update() {
    const speed = 120;
    const b = this.player.body;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    b.setVelocity(vx, vy);

    // 방향 애니메이션
    if (Math.abs(vx) > Math.abs(vy)) {
      this.player.anims.play(vx > 0 ? 'idle-right' : 'idle-left', true);
    } else if (vy !== 0) {
      this.player.anims.play(vy > 0 ? 'idle-down' : 'idle-up', true);
    }

    // depth sort: y 좌표 큰 것이 앞에
    this.player.setDepth(this.player.y);
    for (const n of this.npcs) {
      n.sprite.setDepth(n.y);
      n.emoji.setDepth(n.y + 0.1);
      n.label.setDepth(n.y + 0.2);
    }

    // NPC 근접 감지
    let nearestNpc = null;
    for (const n of this.npcs) {
      const dx = this.player.x - n.x;
      const dy = this.player.y - n.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 50) {
        nearestNpc = n;
        if (!n._hinted && this.onNpcTalk) {
          n._hinted = true;
          this.onNpcTalk({ id: n.id, name: n.name, line: n.line, emoji: n.emoji });
          this.time.delayedCall(4000, () => { n._hinted = false; });
        }
      }
    }

    // 미션존 진입
    for (const z of this.missionZones) {
      const dx = this.player.x - z.x;
      const dy = this.player.y - z.y;
      if (Math.sqrt(dx * dx + dy * dy) < 40) {
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
  const [dialogue, setDialogue] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      backgroundColor: '#0a0a0f',
      parent: mountRef.current,
      pixelArt: true,
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [OfficeScene],
    };

    const game = new Phaser.Game(config);
    game.registry.set('onMissionEnter', (zone) => setCurrentMission({ zone, at: Date.now() }));
    game.registry.set('onNpcTalk', (d) => {
      setDialogue(d);
      setTimeout(() => setDialogue((cur) => (cur && cur.id === d.id ? null : cur)), 5000);
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
          <div className="text-xs text-gray-500 font-mono">{campaignId} · 탐험 모드 (isometric)</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* 게임 캔버스 + 대사 오버레이 */}
          <div className="relative bg-black/50 border border-white/10 rounded-xl overflow-hidden">
            <div ref={mountRef} className="flex items-center justify-center" />
            {dialogue && (
              <div className="absolute left-1/2 bottom-6 -translate-x-1/2 max-w-md w-[90%] bg-black/90 border-2 border-amber-400 rounded-lg px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{dialogue.emoji}</span>
                  <span className="text-amber-400 font-bold text-sm">{dialogue.name}</span>
                </div>
                <div className="text-xs text-gray-200 leading-relaxed">{dialogue.line}</div>
              </div>
            )}
          </div>

          {/* 사이드 패널 */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">🎮 조작</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <div>WASD / 화살표: 이동</div>
                <div>🔴 붉은 다이아 = 미션존</div>
                <div>💬 동료 근처 가면 힌트</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">👥 사무실 동료 (3명)</h3>
              <div className="text-xs text-gray-400 space-y-1.5">
                {NPCS.map((n) => (
                  <div key={n.id} className="flex items-start gap-1.5">
                    <span>{n.emoji}</span>
                    <span><span className="text-amber-400 font-bold">{n.name}</span> — APT 힌트 보유</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">📍 현재 미션</h3>
              {currentMission ? (
                <div className="text-xs">
                  <div className="text-amber-400 font-bold mb-1">미션존 진입</div>
                  <button
                    onClick={() => navigate(`/apt/${campaignId}/scenario`)}
                    className="mt-3 w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded"
                  >
                    ▶ 시나리오 시작
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-500">동료 대화 → 미션존 접근</div>
              )}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs text-amber-400 font-bold mb-1">🧩 작전 힌트</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                동료들이 흘리는 대사는 실제 MITRE ATT&CK TTP 번호와 연결됩니다. 3명 모두 만나보세요.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

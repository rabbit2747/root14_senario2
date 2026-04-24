// AptGame — Gather.town 스타일 top-down 도트 오피스
//
// 에셋: LimeZu "Modern Interiors" (CC0/free-use) — Downloads에서 가져옴
//   · Room_Builder_free_16x16.png (17×23 = 391 frames) — 바닥/벽
//   · Interiors_free_16x16.png (16×89 = 1424 frames) — 가구/소품
//   · Adam/Alex/Amelia/Bob_16x16.png — 캐릭터 (각 24×14 = 336 frames)
//
// 설계:
//   · Top-down 뷰 (타일셋이 top-down이라 isometric 폐기)
//   · 16px 논리 타일 × 2배 스케일 = 화면 32px
//   · Phaser Tilemap 프로그래매틱 생성 (Tiled JSON 불필요)
//   · 플레이어 충돌: 벽(W) + 가구(F)
//   · NPC 3명 충돌 + E키 대화 재활성

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';

const TS = 16;                 // 논리 타일 크기
const SCALE = 2;               // 표시 배율
const DISPLAY = TS * SCALE;    // 32px 화면 타일
const MAP_W = 22;
const MAP_H = 15;

// 프레임 인덱스 (시각 추정치 — 품질 개선 시 조정)
// Room_Builder 17 cols: row*17 + col
const F_FLOOR       = 3 * 17 + 14;  // 53? → 빨간 벽돌 바닥 (시각 추정)
const F_FLOOR_ALT   = 5 * 17 + 14;  // 청록 체커 바닥 (카펫 대체)
const F_WALL        = 3 * 17 + 1;   // 일반 벽 면
const F_WALL_TOP    = 0 * 17 + 1;   // 벽 상단

// Interiors 16 cols: row*16 + col (가구 프레임 추정)
const DECOR = {
  desk:      30 * 16 + 6,   // 나무 책상
  chair:     38 * 16 + 3,   // 의자
  computer:  40 * 16 + 5,   // 모니터
  plant:     53 * 16 + 10,  // 화분
};

// 맵 레이아웃 문자: . 바닥  # 벽  c 카펫  D 책상  P 화분  M 미션존
// (가구는 상단 오브젝트 레이어로, 바닥은 그대로 둠)
const MAP = [
  '######################',
  '#....................#',
  '#..D.....cccc.......M#',
  '#..D.....cccc........#',
  '#........cccc........#',
  '#......######........#',
  '#......#....#........#',
  '#..M...#....#....D...#',
  '#......#....#....D...#',
  '#......######........#',
  '#....................#',
  '#.P........D......P..#',
  '#..........D.........#',
  '#....................#',
  '######################',
];

// NPC 배치: 픽셀 좌표 아닌 tile 좌표로
const NPCS = [
  { tx: 14, ty: 3, id: 'n1', sprite: 'alex', name: '김 과장', emoji: '🧑‍💼',
    line: '"요즘 이메일 첨부파일이 수상해… SolarWinds 업데이트도 그래." (T1566 · T1195)' },
  { tx: 4, ty: 11, id: 'n2', sprite: 'amelia', name: '보안팀 이 대리', emoji: '🧑‍🔧',
    line: '"PowerShell 실행이 비정상적으로 늘었어요. 로그 확인 필요." (T1059.001)' },
  { tx: 17, ty: 7, id: 'n3', sprite: 'bob', name: '개발자 박 팀장', emoji: '🧑‍💻',
    line: '"빌드 서버 인증서가 바뀐 것 같아요. 공급망 점검해야…" (T1554)' },
];

class OfficeScene extends Phaser.Scene {
  constructor() { super('office'); }

  preload() {
    this.load.spritesheet('room', '/apt-assets/Room_Builder_free_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('deco', '/apt-assets/Interiors_free_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('adam', '/apt-assets/Adam_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('alex', '/apt-assets/Alex_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('amelia', '/apt-assets/Amelia_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('bob', '/apt-assets/Bob_16x16.png', { frameWidth: TS, frameHeight: TS });
  }

  create() {
    // ── 바닥 레이어 (항상 floor 프레임으로 깔고, 카펫은 위에 덮음)
    this.floorSprites = [];
    this.wallBodies = [];
    this.missionZones = [];
    this.obstacles = this.physics.add.staticGroup();

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const ch = MAP[y][x];
        const px = x * DISPLAY;
        const py = y * DISPLAY;

        // 바닥은 모든 칸에 깔기
        const floorFrame = (ch === 'c') ? F_FLOOR_ALT : F_FLOOR;
        const f = this.add.image(px, py, 'room', floorFrame).setOrigin(0, 0).setScale(SCALE);
        f.setDepth(0);

        if (ch === '#') {
          // 벽 (상단 행 아래 인접하면 TOP, 아니면 FACE)
          const isTopEdge = (y > 0 && MAP[y - 1][x] !== '#');
          const wall = this.add.image(px, py, 'room', isTopEdge ? F_WALL_TOP : F_WALL)
            .setOrigin(0, 0).setScale(SCALE).setDepth(5);
          // 충돌체
          const body = this.add.rectangle(px + DISPLAY / 2, py + DISPLAY / 2, DISPLAY, DISPLAY);
          this.physics.add.existing(body, true);
          this.obstacles.add(body);
        } else if (ch === 'D') {
          // 책상 + 컴퓨터 (가구는 2타일 높이 느낌 위해 모니터를 위에 얹음)
          this.add.image(px, py, 'deco', DECOR.desk).setOrigin(0, 0).setScale(SCALE).setDepth(py + 100);
          this.add.image(px, py - DISPLAY * 0.3, 'deco', DECOR.computer).setOrigin(0, 0).setScale(SCALE).setDepth(py + 100);
          const body = this.add.rectangle(px + DISPLAY / 2, py + DISPLAY / 2, DISPLAY * 0.9, DISPLAY * 0.9);
          this.physics.add.existing(body, true);
          this.obstacles.add(body);
        } else if (ch === 'P') {
          // 화분 (장식, 통과 가능)
          this.add.image(px, py, 'deco', DECOR.plant).setOrigin(0, 0).setScale(SCALE).setDepth(py + 100);
        } else if (ch === 'M') {
          // 미션존 마커 (발광 원)
          const mk = this.add.circle(px + DISPLAY / 2, py + DISPLAY / 2, 10, 0xef4444, 0.7);
          mk.setStrokeStyle(2, 0xfca5a5);
          mk.setDepth(2);
          this.tweens.add({ targets: mk, alpha: { from: 0.4, to: 1 }, duration: 700, yoyo: true, repeat: -1 });
          this.missionZones.push({ x: px + DISPLAY / 2, y: py + DISPLAY / 2 });
        }
      }
    }

    // ── NPC 생성 (정적 물리체, 플레이어와 충돌)
    this.npcGroup = this.physics.add.staticGroup();
    this.npcs = NPCS.map((n) => {
      const cx = n.tx * DISPLAY + DISPLAY / 2;
      const cy = n.ty * DISPLAY + DISPLAY / 2;
      const s = this.physics.add.staticSprite(cx, cy, n.sprite, 0).setScale(SCALE);
      s.body.setSize(12, 12).setOffset(2, 4);
      s.refreshBody();
      const label = this.add.text(cx, cy - 24, n.name, {
        fontSize: '10px', color: '#fbbf24', fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 3, y: 1 },
      }).setOrigin(0.5).setDepth(1000);
      return { ...n, x: cx, y: cy, sprite_obj: s, label };
    });

    // ── 플레이어
    const startX = 2 * DISPLAY + DISPLAY / 2;
    const startY = 1 * DISPLAY + DISPLAY / 2;
    this.player = this.physics.add.sprite(startX, startY, 'adam', 0).setScale(SCALE);
    this.player.body.setSize(10, 10).setOffset(3, 6);
    this.player.setCollideWorldBounds(true);

    // 애니메이션 (idle 4방향 — walk row는 불확실하여 idle만 사용)
    ['adam', 'alex', 'amelia', 'bob'].forEach((k) => {
      this.anims.create({ key: `${k}-down`,  frames: [{ key: k, frame: 0 }],  frameRate: 1 });
      this.anims.create({ key: `${k}-right`, frames: [{ key: k, frame: 6 }],  frameRate: 1 });
      this.anims.create({ key: `${k}-up`,    frames: [{ key: k, frame: 12 }], frameRate: 1 });
      this.anims.create({ key: `${k}-left`,  frames: [{ key: k, frame: 18 }], frameRate: 1 });
    });
    this.player.anims.play('adam-down');

    // 충돌
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, this.npcGroup);
    this.npcs.forEach((n) => this.npcGroup.add(n.sprite_obj));

    // 입력
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.eKey = this.input.keyboard.addKey('E');

    // 콜백
    this.onMissionEnter = this.registry.get('onMissionEnter');
    this.onNpcTalk = this.registry.get('onNpcTalk');

    // 카메라
    this.cameras.main.setBounds(0, 0, MAP_W * DISPLAY, MAP_H * DISPLAY);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update() {
    const speed = 110;
    const b = this.player.body;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    b.setVelocity(vx, vy);

    if (Math.abs(vx) > Math.abs(vy)) {
      this.player.anims.play(vx > 0 ? 'adam-right' : 'adam-left', true);
    } else if (vy !== 0) {
      this.player.anims.play(vy > 0 ? 'adam-down' : 'adam-up', true);
    }

    // depth sort (y 기준)
    this.player.setDepth(this.player.y + 1000);
    this.npcs.forEach((n) => n.sprite_obj.setDepth(n.y + 1000));

    // NPC 근접 → 자동 힌트 + E키 재활성
    for (const n of this.npcs) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
      if (d < 50) {
        const ePressed = Phaser.Input.Keyboard.JustDown(this.eKey);
        if ((!n._hinted || ePressed) && this.onNpcTalk) {
          n._hinted = true;
          this.onNpcTalk({ id: n.id, name: n.name, line: n.line, emoji: n.emoji });
          this.time.delayedCall(4500, () => { n._hinted = false; });
        }
      }
    }

    // 미션존
    for (const z of this.missionZones) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x, z.y);
      if (d < 30) {
        if (!z._triggered && this.onMissionEnter) {
          z._triggered = true;
          this.onMissionEnter(z);
          this.time.delayedCall(500, () => { /* 사용자 확인 버튼까지 대기 */ });
        }
      } else if (d > 80) {
        z._triggered = false;
      }
    }
  }
}

export default function AptGame() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const [missionPrompt, setMissionPrompt] = useState(false);
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
    game.registry.set('onMissionEnter', () => setMissionPrompt(true));
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
          <div className="text-xs text-gray-500 font-mono">{campaignId} · 탐험 모드 · Modern Interiors 타일</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="relative bg-black/50 border border-white/10 rounded-xl overflow-hidden">
            <div ref={mountRef} className="flex items-center justify-center" />

            {/* NPC 대사 */}
            {dialogue && !missionPrompt && (
              <div className="absolute left-1/2 bottom-6 -translate-x-1/2 max-w-md w-[90%] bg-black/90 border-2 border-amber-400 rounded-lg px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{dialogue.emoji}</span>
                  <span className="text-amber-400 font-bold text-sm">{dialogue.name}</span>
                  <span className="ml-auto text-[10px] text-gray-500">E키로 재대화</span>
                </div>
                <div className="text-xs text-gray-200 leading-relaxed">{dialogue.line}</div>
              </div>
            )}

            {/* 미션 진입 확인 모달 */}
            {missionPrompt && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="bg-[#1a1a22] border-2 border-red-500 rounded-xl p-6 max-w-sm w-[90%] shadow-2xl">
                  <div className="text-red-400 text-xs font-bold mb-2">▶ 작전 지점 도달</div>
                  <div className="text-lg font-bold mb-3">시나리오를 시작할까요?</div>
                  <div className="text-xs text-gray-400 mb-5 leading-relaxed">
                    탐험을 중단하고 1인칭 공격자 시점 시나리오로 전환됩니다.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMissionPrompt(false)}
                      className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded"
                    >
                      좀 더 탐험
                    </button>
                    <button
                      onClick={() => navigate(`/apt/${campaignId}/scenario`)}
                      className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded"
                    >
                      ▶ 시나리오 시작
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">🎮 조작</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <div>WASD / 화살표: 이동</div>
                <div>E: 동료 대화 재활성</div>
                <div>🔴 붉은 마커 = 미션존</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2">👥 사무실 동료</h3>
              <div className="text-xs text-gray-400 space-y-1.5">
                {NPCS.map((n) => (
                  <div key={n.id} className="flex items-start gap-1.5">
                    <span>{n.emoji}</span>
                    <span><span className="text-amber-400 font-bold">{n.name}</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs text-amber-400 font-bold mb-1">🧩 힌트</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                3명 동료 대사에 MITRE ATT&CK TTP가 숨어있습니다. 단서를 모아 미션존으로.
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-3">
              <div className="text-[10px] text-gray-500 leading-relaxed">
                타일 에셋: LimeZu <a href="https://limezu.itch.io/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white underline">Modern Interiors</a> (무료 티어)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

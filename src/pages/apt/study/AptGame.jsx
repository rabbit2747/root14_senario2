// AptGame — DB에 저장된 관리자 편집 맵을 Phaser로 렌더
//
// 맵 소스: apt_maps 테이블 (관리자가 /admin "APT 맵 메이커" 탭에서 편집)
// 맵 없음: 안내 화면 + 관리자에게 편집 유도

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { getAptMap } from '../../../api/apt-maps';

const TS = 16;
const SCALE = 2;
const DISPLAY = TS * SCALE;

class MapScene extends Phaser.Scene {
  constructor() { super('map'); }

  init(data) { this.mapData = data.mapData; }

  preload() {
    this.load.spritesheet('room', '/apt-assets/Room_Builder_free_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('deco', '/apt-assets/Interiors_free_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('adam', '/apt-assets/Adam_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('alex', '/apt-assets/Alex_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('amelia', '/apt-assets/Amelia_16x16.png', { frameWidth: TS, frameHeight: TS });
    this.load.spritesheet('bob', '/apt-assets/Bob_16x16.png', { frameWidth: TS, frameHeight: TS });
  }

  create() {
    const m = this.mapData;
    this.obstacles = this.physics.add.staticGroup();
    this.missionZones = [];

    // 바닥
    for (let y = 0; y < m.height; y++) {
      for (let x = 0; x < m.width; x++) {
        const frame = m.floor[y][x];
        this.add.image(x * DISPLAY, y * DISPLAY, 'room', frame).setOrigin(0, 0).setScale(SCALE).setDepth(0);
      }
    }
    // 벽
    for (let y = 0; y < m.height; y++) {
      for (let x = 0; x < m.width; x++) {
        const frame = m.walls[y][x];
        if (frame == null) continue;
        this.add.image(x * DISPLAY, y * DISPLAY, 'room', frame).setOrigin(0, 0).setScale(SCALE).setDepth(5);
        const body = this.add.rectangle(x * DISPLAY + DISPLAY / 2, y * DISPLAY + DISPLAY / 2, DISPLAY, DISPLAY);
        this.physics.add.existing(body, true);
        this.obstacles.add(body);
      }
    }
    // 오브젝트
    (m.objects || []).forEach((o) => {
      const px = o.x * DISPLAY, py = o.y * DISPLAY;
      this.add.image(px, py, o.sheet || 'deco', o.frame).setOrigin(0, 0).setScale(SCALE).setDepth(py + 100);
      if (o.collide) {
        const body = this.add.rectangle(px + DISPLAY / 2, py + DISPLAY / 2, DISPLAY * 0.9, DISPLAY * 0.9);
        this.physics.add.existing(body, true);
        this.obstacles.add(body);
      }
    });
    // 미션존 마커
    (m.missions || []).forEach((ms) => {
      const cx = ms.x * DISPLAY + DISPLAY / 2;
      const cy = ms.y * DISPLAY + DISPLAY / 2;
      const mk = this.add.circle(cx, cy, 10, 0xef4444, 0.7).setStrokeStyle(2, 0xfca5a5).setDepth(2);
      this.tweens.add({ targets: mk, alpha: { from: 0.4, to: 1 }, duration: 700, yoyo: true, repeat: -1 });
      this.missionZones.push({ x: cx, y: cy });
    });

    // NPC
    this.npcGroup = this.physics.add.staticGroup();
    this.npcs = (m.npcs || []).map((n) => {
      const cx = n.x * DISPLAY + DISPLAY / 2;
      const cy = n.y * DISPLAY + DISPLAY / 2;
      const s = this.physics.add.staticSprite(cx, cy, n.sprite, 0).setScale(SCALE);
      s.body.setSize(12, 12).setOffset(2, 4); s.refreshBody();
      const label = this.add.text(cx, cy - 24, n.name, {
        fontSize: '10px', color: '#fbbf24', fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 3, y: 1 },
      }).setOrigin(0.5).setDepth(1000);
      return { ...n, x: cx, y: cy, sprite_obj: s, label };
    });

    // 플레이어
    const sx = m.start.x * DISPLAY + DISPLAY / 2;
    const sy = m.start.y * DISPLAY + DISPLAY / 2;
    this.player = this.physics.add.sprite(sx, sy, 'adam', 0).setScale(SCALE);
    this.player.body.setSize(10, 10).setOffset(3, 6);
    this.player.setCollideWorldBounds(true);
    this.anims.create({ key: 'adam-down',  frames: [{ key: 'adam', frame: 0 }],  frameRate: 1 });
    this.anims.create({ key: 'adam-right', frames: [{ key: 'adam', frame: 6 }],  frameRate: 1 });
    this.anims.create({ key: 'adam-up',    frames: [{ key: 'adam', frame: 12 }], frameRate: 1 });
    this.anims.create({ key: 'adam-left',  frames: [{ key: 'adam', frame: 18 }], frameRate: 1 });
    this.player.anims.play('adam-down');

    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, this.npcGroup);
    this.npcs.forEach((n) => this.npcGroup.add(n.sprite_obj));

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.eKey = this.input.keyboard.addKey('E');

    this.onMissionEnter = this.registry.get('onMissionEnter');
    this.onNpcTalk = this.registry.get('onNpcTalk');

    this.cameras.main.setBounds(0, 0, m.width * DISPLAY, m.height * DISPLAY);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update() {
    const b = this.player.body;
    let vx = 0, vy = 0;
    const speed = 110;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    b.setVelocity(vx, vy);
    if (Math.abs(vx) > Math.abs(vy)) this.player.anims.play(vx > 0 ? 'adam-right' : 'adam-left', true);
    else if (vy !== 0) this.player.anims.play(vy > 0 ? 'adam-down' : 'adam-up', true);

    this.player.setDepth(this.player.y + 1000);
    this.npcs.forEach((n) => n.sprite_obj.setDepth(n.y + 1000));

    for (const n of this.npcs) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
      if (d < 50) {
        const ePressed = Phaser.Input.Keyboard.JustDown(this.eKey);
        if ((!n._hinted || ePressed) && this.onNpcTalk) {
          n._hinted = true;
          this.onNpcTalk({ id: `${n.x}-${n.y}`, name: n.name, line: n.line, emoji: '🧑' });
          this.time.delayedCall(4500, () => { n._hinted = false; });
        }
      }
    }
    for (const z of this.missionZones) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x, z.y);
      if (d < 30) {
        if (!z._triggered && this.onMissionEnter) {
          z._triggered = true;
          this.onMissionEnter(z);
        }
      } else if (d > 80) z._triggered = false;
    }
  }
}

export default function AptGame() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const [mapData, setMapData] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading|ready|missing|error
  const [missionPrompt, setMissionPrompt] = useState(false);
  const [dialogue, setDialogue] = useState(null);

  useEffect(() => {
    getAptMap(campaignId).then(({ data, error }) => {
      if (error) { setLoadState('error'); return; }
      if (!data?.map_data) { setLoadState('missing'); return; }
      setMapData(data.map_data);
      setLoadState('ready');
    });
  }, [campaignId]);

  useEffect(() => {
    if (loadState !== 'ready' || !mountRef.current || !mapData) return;
    const config = {
      type: Phaser.AUTO,
      width: 800, height: 500,
      backgroundColor: '#0a0a0f',
      parent: mountRef.current,
      pixelArt: true,
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [MapScene],
    };
    const game = new Phaser.Game(config);
    game.registry.set('onMissionEnter', () => setMissionPrompt(true));
    game.registry.set('onNpcTalk', (d) => {
      setDialogue(d);
      setTimeout(() => setDialogue((cur) => (cur && cur.id === d.id ? null : cur)), 5000);
    });
    game.scene.start('map', { mapData });
    gameRef.current = game;
    return () => { game.destroy(true); };
  }, [loadState, mapData]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/apt/scenarios')} className="text-xs text-gray-400 hover:text-white">
            ← 시나리오 허브
          </button>
          <div className="text-xs text-gray-500 font-mono">{campaignId} · 탐험 모드</div>
        </div>

        {loadState === 'loading' && (
          <div className="text-center py-20 text-sm text-gray-400">맵 로딩 중…</div>
        )}

        {loadState === 'missing' && (
          <div className="bg-white/5 border border-amber-500/30 rounded-xl p-8 text-center">
            <div className="text-amber-400 text-4xl mb-3">🗺️</div>
            <div className="text-lg font-bold mb-2">이 캠페인은 아직 맵이 없습니다</div>
            <div className="text-sm text-gray-400 mb-5">
              관리자가 <span className="text-amber-400 font-bold">/admin → APT 맵 메이커</span>에서<br />
              {campaignId} 맵을 편집하면 즉시 반영됩니다.
            </div>
            <button
              onClick={() => navigate(`/apt/${campaignId}/scenario`)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded"
            >
              🎬 1인칭 시나리오로 바로 시작
            </button>
          </div>
        )}

        {loadState === 'error' && (
          <div className="text-center py-20 text-red-400">맵 로드 실패 — 네트워크 확인</div>
        )}

        {loadState === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className="relative bg-black/50 border border-white/10 rounded-xl overflow-hidden">
              <div ref={mountRef} className="flex items-center justify-center" />
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
              {missionPrompt && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="bg-[#1a1a22] border-2 border-red-500 rounded-xl p-6 max-w-sm w-[90%] shadow-2xl">
                    <div className="text-red-400 text-xs font-bold mb-2">▶ 작전 지점 도달</div>
                    <div className="text-lg font-bold mb-3">시나리오를 시작할까요?</div>
                    <div className="text-xs text-gray-400 mb-5">탐험을 중단하고 1인칭 공격자 시점으로 전환됩니다.</div>
                    <div className="flex gap-2">
                      <button onClick={() => setMissionPrompt(false)} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-xs font-bold rounded">좀 더 탐험</button>
                      <button onClick={() => navigate(`/apt/${campaignId}/scenario`)} className="flex-1 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded">▶ 시나리오 시작</button>
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
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-[10px] text-gray-500">
                  타일: <a href="https://limezu.itch.io/" target="_blank" rel="noreferrer" className="underline">LimeZu Modern Interiors</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

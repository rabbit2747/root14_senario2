import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// ── 8-bit 아바타 컬러 팔레트 ──
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#82E0AA', '#F0B27A',
];

function getAvatarColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── 픽셀 캐릭터 컴포넌트 ──
function PixelChar({ color, name, isJoining }) {
  return (
    <div className={isJoining ? 'pixel-join' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* 모니터 */}
      <div style={{
        width: 34, height: 26, background: '#222', border: '2px solid #444',
        borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 22, height: 16, borderRadius: 1, overflow: 'hidden',
          background: `linear-gradient(180deg, ${color}22, ${color}08)`,
          border: `1px solid ${color}33`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 3px, ${color}11 3px, ${color}11 4px)`,
          }} />
        </div>
      </div>
      {/* 모니터 받침 */}
      <div style={{ width: 6, height: 4, background: '#333' }} />
      <div style={{ width: 16, height: 3, background: '#2a2a2a', borderRadius: 1 }} />
      {/* 캐릭터 (머리 + 몸통 + 다리) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, marginTop: 2 }}>
        <div style={{
          width: 12, height: 12, background: color, borderRadius: 3,
          boxShadow: `0 0 8px ${color}44`, imageRendering: 'pixelated',
        }} />
        <div style={{
          width: 16, height: 8, background: color, opacity: 0.75,
          borderRadius: '0 0 2px 2px', imageRendering: 'pixelated',
        }} />
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 5, height: 5, background: color, opacity: 0.55, borderRadius: 1 }} />
          <div style={{ width: 5, height: 5, background: color, opacity: 0.55, borderRadius: 1 }} />
        </div>
      </div>
      {/* 네임태그 */}
      <div style={{
        marginTop: 4, padding: '1px 6px',
        background: 'rgba(0,0,0,0.7)', border: `1px solid ${color}33`, borderRadius: 2,
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 8, color,
          letterSpacing: '0.05em', textShadow: `0 0 4px ${color}55`,
        }}>
          {name.length > 8 ? name.slice(0, 8) + '..' : name}
        </span>
      </div>
    </div>
  );
}

// ── 다국어 번역 ──
const roomT = {
  ko: { title: '훈련실', online: '접속 중', waiting: '훈련생 대기 중...', footer: 'GOTROOT 사이버보안 훈련 — 실시간 프레즌스', loginReq: '로그인 후 입장 가능합니다' },
  en: { title: 'TRAINING ROOM', online: 'ONLINE', waiting: 'WAITING FOR AGENTS...', footer: 'GOTROOT CYBERSECURITY TRAINING — REAL-TIME PRESENCE', loginReq: 'Login required to enter' },
  zh: { title: '训练室', online: '在线', waiting: '等待训练员...', footer: 'GOTROOT 网络安全训练 — 实时在线', loginReq: '请登录后进入' },
  hi: { title: 'प्रशिक्षण कक्ष', online: 'ऑनलाइन', waiting: 'एजेंट की प्रतीक्षा...', footer: 'GOTROOT — रीयल-टाइम प्रेजेंस', loginReq: 'प्रवेश के लिए लॉगिन करें' },
  ja: { title: '訓練室', online: 'オンライン', waiting: 'エージェント待機中...', footer: 'GOTROOT サイバーセキュリティ — リアルタイム', loginReq: 'ログインが必要です' },
};

export default function AvatarRoom({ isOpen, onClose, language = 'ko' }) {
  const { user, isLoggedIn } = useAuth();
  const [users, setUsers] = useState([]);
  const [joinedId, setJoinedId] = useState(null);
  const channelRef = useRef(null);
  const t = roomT[language] || roomT.ko;

  useEffect(() => {
    if (!isOpen || !user) return;

    const channel = supabase.channel('gotroot-training-room', {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = [];
        for (const [key, presences] of Object.entries(state)) {
          if (presences.length > 0) {
            online.push({ id: key, name: presences[0].name || 'Agent', color: presences[0].color || '#4ade80' });
          }
        }
        setUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setJoinedId(key);
        setTimeout(() => setJoinedId(null), 1500);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Agent';
          await channel.track({ name, color: getAvatarColor(user.id) });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-md"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0c0c0c',
          border: '3px solid #2a2a2a',
          borderRadius: 6,
          boxShadow: '0 0 60px rgba(0,255,0,0.08), 0 4px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* CRT 스캔라인 */}
        <div className="absolute inset-0 pointer-events-none z-30" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
        }} />

        {/* 헤더 */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3" style={{ borderBottom: '2px solid #222', background: '#111' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14 }}>🖥️</span>
            <span style={{
              fontFamily: 'monospace', fontSize: 12, fontWeight: 900,
              color: '#4ade80', letterSpacing: '0.12em',
              textShadow: '0 0 8px rgba(74,222,128,0.4)',
            }}>
              {t.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{
              fontFamily: 'monospace', fontSize: 9, color: '#4ade80',
              border: '1px solid rgba(74,222,128,0.3)', padding: '2px 8px', borderRadius: 3,
            }}>
              ● {users.length} {t.online}
            </span>
            <button onClick={onClose} style={{
              fontFamily: 'monospace', fontSize: 16, fontWeight: 900,
              color: '#ef4444', background: 'none', border: '1px solid rgba(239,68,68,0.3)',
              width: 24, height: 24, borderRadius: 3, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
            }}>×</button>
          </div>
        </div>

        {/* 메인 영역 */}
        <div className="relative z-10 px-4 py-6" style={{
          minHeight: 220,
          background: 'linear-gradient(180deg, #0c0c0c 0%, #0c1a0c 100%)',
          backgroundImage: 'radial-gradient(rgba(74,222,128,0.03) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}>
          {!isLoggedIn ? (
            <div className="flex items-center justify-center h-40">
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(74,222,128,0.4)', textAlign: 'center' }}>
                {t.loginReq}
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 18, color: 'rgba(74,222,128,0.15)', marginBottom: 8 }}>
                  ▓░▓░▓░▓
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(74,222,128,0.25)' }}>
                  {t.waiting}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-8 justify-center">
              {users.map(u => (
                <PixelChar key={u.id} color={u.color} name={u.name} isJoining={u.id === joinedId} />
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="relative z-10 px-4 py-2 text-center" style={{ borderTop: '1px solid #1a1a1a' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(74,222,128,0.2)', letterSpacing: '0.15em' }}>
            {t.footer}
          </span>
        </div>
      </div>

      {/* 픽셀 입장 애니메이션 */}
      <style>{`
        .pixel-join { animation: pixelBounce 0.5s ease; }
        @keyframes pixelBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}

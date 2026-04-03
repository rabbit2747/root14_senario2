import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStoredLang } from '../components/LangToggle';
import ContentProtection from '../components/ContentProtection';
import eduMeta from '../data/edu-meta.json';
// FontAwesome: main.jsx에서 전역 import (@fortawesome/fontawesome-free)

// ── 레벨 표시 라벨 ──
const LEVEL_LABELS = {
  novice:       { ko: '입문',   en: 'Novice',       color: '#94a3b8' },
  beginner:     { ko: '초급',   en: 'Beginner',     color: '#22c55e' },
  intermediate: { ko: '중급',   en: 'Intermediate', color: '#3b82f6' },
  advanced:     { ko: '고급',   en: 'Advanced',     color: '#ef4444' },
  expert:       { ko: '전문가', en: 'Expert',       color: '#a855f7' },
};

// ── 다국어 UI 텍스트 ──
const uiText = {
  ko: {
    graphicTitle: '그래픽으로 이해하기',
    graphicSubtitle: '공격 기법의 흐름을 시각적으로 확인하세요',
    nextBtn: '시나리오 기반 설명으로 →',
    backBtn: '과정 선택으로 돌아가기',
    shortcutHint: '단축키: 좌우 클릭 또는 [Space], [←][→], [F] 전체화면',
    loading: '로딩 중...',
    noContent: '그래픽 콘텐츠가 아직 준비되지 않았습니다.',
  },
  en: {
    graphicTitle: 'Graphic Explanation',
    graphicSubtitle: 'Visualize the attack technique flow',
    nextBtn: 'Scenario-Based Explanation →',
    backBtn: 'Back to Course Selection',
    shortcutHint: 'Shortcuts: Click L/R or [Space], [←][→], [F] Fullscreen',
    loading: 'Loading...',
    noContent: 'Graphic content is not yet available.',
  },
  ja: {
    graphicTitle: 'グラフィック解説',
    graphicSubtitle: '攻撃技法のフローを視覚的に確認',
    nextBtn: 'シナリオベース解説へ →',
    backBtn: 'コース選択に戻る',
    shortcutHint: 'ショートカット: 左右クリック [Space],[←][→],[F]全画面',
    loading: '読み込み中...',
    noContent: 'グラフィックコンテンツはまだ準備中です。',
  },
  vi: {
    graphicTitle: 'Giải thích bằng hình ảnh',
    graphicSubtitle: 'Trực quan hóa luồng kỹ thuật tấn công',
    nextBtn: 'Giải thích theo kịch bản →',
    backBtn: 'Quay lại chọn khóa học',
    shortcutHint: 'Phím tắt: Click trái/phải hoặc [Space], [←][→], [F] Toàn màn hình',
    loading: 'Đang tải...',
    noContent: 'Nội dung đồ họa chưa sẵn sàng.',
  },
  ar: {
    graphicTitle: 'الشرح بالرسوم',
    graphicSubtitle: 'تصوير مرئي لمسار تقنية الهجوم',
    nextBtn: 'الشرح القائم على السيناريو →',
    backBtn: 'العودة لاختيار المسار',
    shortcutHint: 'اختصارات: انقر يساراً/يميناً أو [Space]، [←][→]، [F] ملء الشاشة',
    loading: 'جارٍ التحميل...',
    noContent: 'محتوى الرسوم غير متوفر بعد.',
  },
};

// ── 그래픽 콘텐츠 동적 로딩 맵 (SCENARIO_COMPONENTS 패턴) ──
const GRAPHIC_COMPONENTS = {
  'T1587.001-beginner': React.lazy(() =>
    import('../data/graphic-contents/T1587.001-beginner').then(mod => ({
      default: () => null, // 렌더링은 CinematicPlayer가 직접 처리
      _slideData: mod,
    }))
  ),
  'T1566.001-novice': React.lazy(() =>
    import('../data/graphic-contents/T1566.001-novice').then(mod => ({ default: () => null, _slideData: mod }))
  ),
  'T1566.001-beginner': React.lazy(() =>
    import('../data/graphic-contents/T1566.001-beginner').then(mod => ({ default: () => null, _slideData: mod }))
  ),
  'T1566.001-intermediate': React.lazy(() =>
    import('../data/graphic-contents/T1566.001-intermediate').then(mod => ({ default: () => null, _slideData: mod }))
  ),
  'T1566.001-advanced': React.lazy(() =>
    import('../data/graphic-contents/T1566.001-advanced').then(mod => ({ default: () => null, _slideData: mod }))
  ),
  'T1566.001-expert': React.lazy(() =>
    import('../data/graphic-contents/T1566.001-expert').then(mod => ({ default: () => null, _slideData: mod }))
  ),
};

// ── 그래픽 콘텐츠 직접 import 맵 (slide data) ──
const GRAPHIC_DATA_LOADERS = {
  'T1587.001-beginner': () => import('../data/graphic-contents/T1587.001-beginner'),
  'T1566.001-novice': () => import('../data/graphic-contents/T1566.001-novice'),
  'T1566.001-beginner': () => import('../data/graphic-contents/T1566.001-beginner'),
  'T1566.001-intermediate': () => import('../data/graphic-contents/T1566.001-intermediate'),
  'T1566.001-advanced': () => import('../data/graphic-contents/T1566.001-advanced'),
  'T1566.001-expert': () => import('../data/graphic-contents/T1566.001-expert'),
};

// FontAwesome: CDN 제거 → npm @fortawesome/fontawesome-free 로컬 import (상단)

// ── 시네마틱 플레이어 CSS (1280×720 고정 해상도, CSS 변수 기반 테마) ──
const PLAYER_STYLES = `
/* 테마별 CSS 변수 정의 */
.cinematic-scope {
  --bg-color: #0a0f1a;
  --panel-bg: #111827;
  --accent-blue: #38bdf8;
  --accent-purple: #a855f7;
  --accent-red: #f43f5e;
  --accent-green: #10b981;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --grid-color: rgba(255,255,255,0.02);
  --grid-glow: rgba(56, 189, 248, 0.05);
  --dock-bg: rgba(0, 0, 0, 0.85);
  --dock-text: #ffffff;
  --dock-border: rgba(255, 255, 255, 0.15);
  --dock-shadow: rgba(0, 0, 0, 0.6);
  --dock-frame-outer: rgba(255, 255, 255, 0.12);
  --dock-frame-highlight: rgba(255, 255, 255, 0.08);
  --dock-highlight-top: rgba(255, 255, 255, 0.07);
  --dock-highlight-bottom: rgba(0, 0, 0, 0.15);
  --dock-brush-line: rgba(255, 255, 255, 0.015);
  --dock-base-top: #1a1f2e;
  --dock-base-mid: #141825;
  --dock-base-bottom: #0d1118;
  --dock-grille-color: rgba(255, 255, 255, 0.08);
  --dock-led-glow: rgba(56, 189, 248, 0.6);
  --ctrl-btn-bg: rgba(255, 255, 255, 0.04);
  --ctrl-btn-border: rgba(255, 255, 255, 0.08);
  --tooltip-bg: rgba(0, 0, 0, 0.85);
  --tooltip-text: #ffffff;
  --card-bg: rgba(255, 255, 255, 0.03);
  --card-border: rgba(255, 255, 255, 0.05);
  --btn-hover-bg: rgba(56, 189, 248, 0.15);
  --control-divider: rgba(255, 255, 255, 0.2);
  --shadow-main: rgba(0, 0, 0, 0.8);
  --subtitle-shadow: 1px 1px 3px rgba(0,0,0,0.8);
  --blue-bg: rgba(56, 189, 248, 0.1);
  --red-bg: rgba(244, 63, 94, 0.2);
  --purple-bg: rgba(168, 85, 247, 0.2);
}
.cinematic-scope.light {
  --bg-color: #f1f5f9;
  --panel-bg: #ffffff;
  --accent-blue: #0284c7;
  --accent-purple: #7e22ce;
  --accent-red: #e11d48;
  --accent-green: #059669;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --grid-color: rgba(0,0,0,0.03);
  --grid-glow: rgba(2, 132, 199, 0.05);
  --dock-bg: rgba(255, 255, 255, 0.95);
  --dock-text: #0f172a;
  --dock-border: rgba(0, 0, 0, 0.1);
  --dock-shadow: rgba(0, 0, 0, 0.08);
  --dock-frame-outer: rgba(0, 0, 0, 0.12);
  --dock-frame-highlight: rgba(255, 255, 255, 0.6);
  --dock-highlight-top: rgba(255, 255, 255, 0.4);
  --dock-highlight-bottom: rgba(0, 0, 0, 0.03);
  --dock-brush-line: rgba(0, 0, 0, 0.01);
  --dock-base-top: #f0f2f5;
  --dock-base-mid: #e8eaed;
  --dock-base-bottom: #dfe1e4;
  --dock-grille-color: rgba(0, 0, 0, 0.1);
  --dock-led-glow: rgba(2, 132, 199, 0.4);
  --ctrl-btn-bg: rgba(0, 0, 0, 0.03);
  --ctrl-btn-border: rgba(0, 0, 0, 0.08);
  --tooltip-bg: rgba(255, 255, 255, 0.95);
  --tooltip-text: #0f172a;
  --card-bg: rgba(0, 0, 0, 0.02);
  --card-border: rgba(0, 0, 0, 0.08);
  --btn-hover-bg: rgba(2, 132, 199, 0.1);
  --control-divider: rgba(0, 0, 0, 0.15);
  --shadow-main: rgba(0, 0, 0, 0.15);
  --subtitle-shadow: none;
  --blue-bg: rgba(2, 132, 199, 0.1);
  --red-bg: rgba(225, 29, 72, 0.1);
  --purple-bg: rgba(126, 34, 206, 0.1);
}
.cinematic-scope * { box-sizing: border-box; }

@keyframes parallaxGrid {
  0% { background-position: center center, 0px 0px, 0px 0px; }
  100% { background-position: center center, 30px 30px, 30px 30px; }
}
.cinematic-scope .player-container {
  background-color: var(--panel-bg);
  background-image:
    radial-gradient(circle at 50% 50%, var(--grid-glow) 0%, transparent 60%),
    linear-gradient(var(--grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-size: 100% 100%, 30px 30px, 30px 30px;
  animation: parallaxGrid 15s linear infinite;
  animation-play-state: paused;
  cursor: pointer;
}
.cinematic-scope .player-container.playing { animation-play-state: running; }

.cinematic-scope .progress-bar-container { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--control-divider); z-index: 100; cursor: default; }
.cinematic-scope .progress-bar { height: 100%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-red)); transition: width 0.1s linear; }

/* 하단 통합 도크 — 사운드바/기계 패널 질감 */
.cinematic-scope .bottom-dock {
  position: absolute; bottom: 30px; left: 40px; right: 40px;
  z-index: 100; display: flex; align-items: center; justify-content: space-between;
  padding: 0; border-radius: 16px; cursor: default; transition: all 0.3s ease;
  overflow: hidden;
  /* 외곽 프레임: 이중 보더로 기계적 입체감 */
  border: 1.5px solid var(--dock-frame-outer, rgba(255,255,255,0.12));
  box-shadow:
    0 2px 0 0 var(--dock-frame-highlight, rgba(255,255,255,0.06)),
    0 12px 40px var(--dock-shadow),
    inset 0 1px 0 var(--dock-frame-highlight, rgba(255,255,255,0.08)),
    inset 0 -1px 0 rgba(0,0,0,0.3);
}
/* 도크 내부 배경 레이어 (브러시드 메탈 + 스피커 그릴 텍스처) */
.cinematic-scope .bottom-dock::before {
  content: '';
  position: absolute; inset: 0; z-index: 0; border-radius: inherit;
  /* 3-레이어: ① 상단 하이라이트 ② 브러시드 메탈 라인 ③ 베이스 그라데이션 */
  background:
    linear-gradient(180deg,
      var(--dock-highlight-top, rgba(255,255,255,0.07)) 0%,
      transparent 40%,
      transparent 60%,
      var(--dock-highlight-bottom, rgba(0,0,0,0.15)) 100%),
    repeating-linear-gradient(90deg,
      transparent 0px,
      var(--dock-brush-line, rgba(255,255,255,0.015)) 1px,
      transparent 2px,
      transparent 4px),
    linear-gradient(180deg,
      var(--dock-base-top, #1a1f2e) 0%,
      var(--dock-base-mid, #141825) 50%,
      var(--dock-base-bottom, #0d1118) 100%);
  backdrop-filter: blur(16px);
}
/* 도크 콘텐츠 래퍼 (z-index 올려서 텍스처 위에 렌더링) */
.cinematic-scope .dock-content {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 14px 28px;
}
/* 좌측 스피커 그릴 장식 */
.cinematic-scope .dock-grille {
  display: flex; flex-direction: column; gap: 3px; margin-right: 18px; flex-shrink: 0;
}
.cinematic-scope .dock-grille-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--dock-grille-color, rgba(255,255,255,0.08));
  box-shadow: 8px 0 0 var(--dock-grille-color, rgba(255,255,255,0.08)),
              16px 0 0 var(--dock-grille-color, rgba(255,255,255,0.08));
}
/* LED 상태 표시등 */
.cinematic-scope .dock-led {
  width: 6px; height: 6px; border-radius: 50%; margin-right: 14px; flex-shrink: 0;
  box-shadow: 0 0 6px var(--dock-led-glow, rgba(56,189,248,0.6));
  transition: all 0.4s ease;
}
.cinematic-scope .dock-led.active { background: var(--accent-blue); box-shadow: 0 0 8px var(--accent-blue), 0 0 16px rgba(56,189,248,0.3); }
.cinematic-scope .dock-led.muted { background: var(--accent-red); box-shadow: 0 0 8px var(--accent-red), 0 0 16px rgba(244,63,94,0.3); }
.cinematic-scope .subtitle-area { flex-grow: 1; padding-right: 20px; display: flex; align-items: center; transition: opacity 0.4s ease; }
.cinematic-scope .subtitle-area.hidden { opacity: 0; pointer-events: none; }
.cinematic-scope .subtitle-text { color: var(--dock-text); font-size: 17px; font-weight: 500; line-height: 1.6; text-shadow: var(--subtitle-shadow); margin: 0; word-break: keep-all; font-family: var(--font-sans, 'Paperlogy'), sans-serif; }
/* 컨트롤 영역 구분선 (에칭 효과) */
.cinematic-scope .controls-divider {
  width: 1px; height: 32px; margin: 0 12px; flex-shrink: 0;
  background: linear-gradient(180deg, transparent 0%, var(--control-divider) 20%, var(--control-divider) 80%, transparent 100%);
  box-shadow: 1px 0 0 var(--dock-frame-highlight, rgba(255,255,255,0.05));
}
.cinematic-scope .controls-area { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.cinematic-scope .slide-counter {
  font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: bold;
  letter-spacing: 1.5px; margin-right: 6px;
  /* LED 디스플레이 느낌 */
  color: var(--accent-blue); text-shadow: 0 0 6px rgba(56,189,248,0.4);
  background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 6px;
  border: 1px solid rgba(56,189,248,0.15);
}
.cinematic-scope .control-btn {
  background: var(--ctrl-btn-bg, rgba(255,255,255,0.04));
  border: 1px solid var(--ctrl-btn-border, rgba(255,255,255,0.08));
  color: var(--text-main); font-size: 18px; cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 9px 14px; border-radius: 10px; outline: none;
  display: flex; align-items: center; justify-content: center;
  /* 버튼 입체감 (볼록 느낌) */
  box-shadow: inset 0 1px 0 var(--dock-frame-highlight, rgba(255,255,255,0.06)),
              0 1px 3px rgba(0,0,0,0.3);
}
.cinematic-scope .control-btn:hover {
  background: var(--btn-hover-bg); color: var(--accent-blue);
  transform: translateY(-1px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 3px 8px rgba(0,0,0,0.4);
}
.cinematic-scope .control-btn:active { transform: translateY(1px); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
.cinematic-scope .control-btn.active-cc { color: var(--accent-green); background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.25); }
.cinematic-scope .control-btn.active-mute { color: var(--accent-red); background: rgba(244,63,94,0.12); border-color: rgba(244,63,94,0.25); }
.cinematic-scope .control-btn.primary {
  font-size: 20px; padding: 10px 18px;
  background: linear-gradient(180deg, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0.05) 100%);
  border-color: rgba(56,189,248,0.25);
}
.cinematic-scope .control-btn.primary:hover {
  background: linear-gradient(180deg, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0.1) 100%);
}
/* 라이트 테마 도크 오버라이드 */
.cinematic-scope.light .bottom-dock {
  border-color: rgba(0,0,0,0.12);
  box-shadow: 0 2px 0 0 rgba(255,255,255,0.5), 0 12px 40px var(--dock-shadow),
    inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.08);
}
.cinematic-scope.light .bottom-dock::before {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.03) 100%),
    repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.01) 1px, transparent 2px, transparent 4px),
    linear-gradient(180deg, #f0f2f5 0%, #e8eaed 50%, #dfe1e4 100%);
}
.cinematic-scope.light .dock-grille-dot {
  background: rgba(0,0,0,0.1);
  box-shadow: 8px 0 0 rgba(0,0,0,0.1), 16px 0 0 rgba(0,0,0,0.1);
}
.cinematic-scope.light .slide-counter {
  color: var(--accent-blue); text-shadow: none;
  background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.08);
}
.cinematic-scope.light .control-btn {
  background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.08);
}
.cinematic-scope.light .controls-divider {
  box-shadow: 1px 0 0 rgba(255,255,255,0.5);
}

/* 전체화면 모드 */
.cinematic-scope.fullscreen {
  background: var(--bg-color) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100vw !important;
  height: 100vh !important;
}
.cinematic-scope .control-btn.active-fs {
  color: var(--accent-blue);
  background: rgba(56,189,248,0.12);
  border-color: rgba(56,189,248,0.25);
}

.cinematic-scope .shortcut-tooltip { position: absolute; top: 20px; right: 20px; z-index: 200; background: var(--tooltip-bg); color: var(--tooltip-text); padding: 12px 24px; border-radius: 8px; border: 1px solid var(--dock-border); font-size: 16px; font-weight: 500; display: flex; align-items: center; gap: 12px; backdrop-filter: blur(10px); transition: opacity 0.6s ease, transform 0.6s ease; cursor: default; font-family: var(--font-sans, 'Paperlogy'), sans-serif; }
.cinematic-scope .shortcut-tooltip.fade-out { opacity: 0; transform: translateY(-15px); pointer-events: none; }
.cinematic-scope .shortcut-tooltip i { color: var(--accent-blue); font-size: 20px; }

/* 슬라이드 */
.cinematic-scope .slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 40px 60px 140px 60px; display: flex; flex-direction: column; justify-content: flex-start; opacity: 0; pointer-events: none; transition: opacity 0.6s ease; }
.cinematic-scope .slide.active { opacity: 1; pointer-events: none; z-index: 10; }
.cinematic-scope .slide-header { font-size: 38px; margin-bottom: 30px; display: flex; align-items: center; gap: 15px; border-bottom: 2px solid var(--card-border); padding-bottom: 15px; width: 100%; height: 60px; flex-shrink: 0; color: var(--text-main); font-family: var(--font-sans, 'Paperlogy'), sans-serif; font-weight: 900; }
.cinematic-scope .slide-header i { color: var(--accent-blue); }
.cinematic-scope .slide-header.malware-header i { color: var(--accent-red); }
.cinematic-scope .slide-content { display: flex; flex-direction: column; justify-content: center; flex: 1; min-height: 0; width: 100%; }

.cinematic-scope h1, .cinematic-scope h2, .cinematic-scope h3 { font-family: var(--font-sans, 'Paperlogy'), sans-serif; font-weight: 900; margin: 0; }
.cinematic-scope .title { font-size: 64px; line-height: 1.2; margin-bottom: 20px; text-align: center; color: var(--text-main); }
.cinematic-scope .title.large { font-size: 80px; }
.cinematic-scope .title span { background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.cinematic-scope p, .cinematic-scope li { font-size: 22px; line-height: 1.6; color: var(--text-muted); word-break: keep-all; margin: 0; font-family: var(--font-sans, 'Paperlogy'), sans-serif; }
.cinematic-scope .center-layout { text-align: center; display: flex; flex-direction: column; align-items: center; }
.cinematic-scope .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; width: 100%; align-items: center; height: 100%; }
.cinematic-scope .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; width: 100%; }

.cinematic-scope .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 40px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.cinematic-scope .card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: var(--accent-blue); }
.cinematic-scope .card.purple::before { background: var(--accent-purple); }
.cinematic-scope .card.red::before { background: var(--accent-red); }
.cinematic-scope .card-icon { font-size: 50px; color: var(--text-main); margin-bottom: 20px; text-align: center; }
.cinematic-scope .card h3 { font-size: 28px; color: var(--text-main); margin-bottom: 15px; text-align: center; }
.cinematic-scope .card p { font-size: 18px; text-align: center; }

.cinematic-scope .info-list { list-style: none; padding: 0; margin: 0; text-align: left; }
.cinematic-scope .info-list li { margin-bottom: 30px; padding-left: 45px; position: relative; }
.cinematic-scope .info-list li::before { content: '>'; font-family: 'JetBrains Mono', monospace; color: var(--accent-blue); font-weight: bold; position: absolute; left: 0; top: 2px; font-size: 26px; }
.cinematic-scope .info-list.malware li::before { color: var(--accent-red); }
.cinematic-scope .info-list strong { color: var(--text-main); font-size: 26px; display: block; margin-bottom: 10px; font-family: var(--font-sans, 'Paperlogy'), sans-serif; }

.cinematic-scope .callout { background: var(--blue-bg); border-left: 4px solid var(--accent-blue); padding: 25px; border-radius: 0 12px 12px 0; margin-top: 30px; text-align: left; }
.cinematic-scope .callout.malware { background: var(--red-bg); border-left-color: var(--accent-red); }

/* Animations */
.cinematic-scope .anim-el { opacity: 0; transform: translateY(30px); }
.cinematic-scope .anim-scale { opacity: 0; transform: scale(0.9); }
.cinematic-scope .anim-fade { opacity: 0; }
@keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }
@keyframes scaleUpFade { to { opacity: 1; transform: scale(1); } }
@keyframes simpleFade { to { opacity: 1; } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes flowRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }

.cinematic-scope .data-line { position: relative; width: 120px; height: 6px; background: var(--card-border); border-radius: 3px; overflow: hidden; margin: 0 15px; }
.cinematic-scope .data-line.red::after { content: ''; position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, var(--accent-red), transparent); animation: flowRight 1.5s infinite linear; }
.cinematic-scope .data-line.blue::after { content: ''; position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, var(--accent-blue), transparent); animation: flowRight 1.5s infinite linear; }

@keyframes pulseGlow { 0%, 100% { filter: drop-shadow(0 0 5px rgba(244,63,94,0.4)); transform: scale(1); } 50% { filter: drop-shadow(0 0 20px rgba(244,63,94,0.8)); transform: scale(1.05); } }
.cinematic-scope .malware-pulse { animation: pulseGlow 1.5s infinite ease-in-out; }
@keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
.cinematic-scope .float { animation: floatAnim 3s infinite ease-in-out; }
@keyframes confettiFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
.cinematic-scope .confetti { position: absolute; width: 12px; height: 24px; top: -30px; animation: confettiFall linear infinite; opacity: 0; }

.cinematic-scope .slide.active .delay-1 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards 0.2s; }
.cinematic-scope .slide.active .delay-2 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards 0.6s; }
.cinematic-scope .slide.active .delay-3 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards 1.0s; }
.cinematic-scope .slide.active .delay-4 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards 1.4s; }
.cinematic-scope .slide.active .delay-5 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards 1.8s; }
.cinematic-scope .slide.active .delay-6 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) forwards 2.2s; }
.cinematic-scope .slide.active .scale-delay-1 { animation: scaleUpFade 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards 0.4s; }
.cinematic-scope .slide.active .scale-delay-2 { animation: scaleUpFade 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards 0.8s; }
.cinematic-scope .slide.active .scale-delay-3 { animation: scaleUpFade 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards 1.2s; }
`;

// ══════════════════════════════════════════════════════════════
// CinematicPlayer — 1280×720 고정 해상도 + transform scale 반응형
// ══════════════════════════════════════════════════════════════
function CinematicPlayer({ theme, slideContent, subtitles, lang }) {
  const [scale, setScale] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCCEnabled, setIsCCEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [ttsFinished, setTtsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── ref 미러 (타이머 콜백 클로저에서 최신 값 읽기용) ──
  const ttsFinishedRef = useRef(false);
  const isMutedRef = useRef(false);
  const isPlayingRef = useRef(true);

  const slidesCount = subtitles.length;
  const slideDuration = 6500;
  const timerRef = useRef(null);
  const ttsWaitIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const isFullscreenRef = useRef(false);
  const playerWrapperRef = useRef(null);

  // ── ref 동기화 ──
  useEffect(() => { ttsFinishedRef.current = ttsFinished; }, [ttsFinished]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isFullscreenRef.current = isFullscreen; }, [isFullscreen]);

  // 색종이 파티클 (마지막 슬라이드)
  const confettiParticles = useMemo(() => {
    const colors = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f5ba00'];
    return [...Array(60)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  // 툴팁 3초 후 숨김
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // ── 전체화면 변경 감지 ──
  useEffect(() => {
    const handleFSChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      isFullscreenRef.current = fs;
      if (!fs) screen.orientation?.unlock?.();
      // 전체화면 전환 후 스케일 재계산 트리거
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // ── 반응형 스케일링 (1280×720 고정 → transform scale) ──
  useEffect(() => {
    const resizePlayer = () => {
      const parent = playerWrapperRef.current || document.getElementById('player-wrapper-parent');
      if (!parent) return;
      const scaleX = parent.clientWidth / 1280;
      const isMobile = window.innerWidth < 640;
      const overhead = isFullscreenRef.current ? 0 : (isMobile ? 100 : 190);
      const scaleY = (window.innerHeight - overhead) / 720;
      setScale(Math.max(Math.min(scaleX, scaleY), 0.2));
    };
    window.addEventListener('resize', resizePlayer);
    resizePlayer();
    setTimeout(resizePlayer, 100);
    return () => window.removeEventListener('resize', resizePlayer);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, slidesCount - 1));
  }, [slidesCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  }, []);

  const pauseAutoPlay = useCallback(() => {
    setIsPlaying(false);
    clearTimeout(timerRef.current);
    clearInterval(ttsWaitIntervalRef.current);
    clearInterval(progressIntervalRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // ── TTS (ref 기반 — 클로저 안전) ──
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setTtsFinished(false);
    ttsFinishedRef.current = false;

    if (isPlaying && subtitles[currentSlide]) {
      const text = subtitles[currentSlide];
      if (!isMuted && text && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'ko' ? 'ko-KR' : lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR';
        u.rate = lang === 'en' ? 0.95 : 1.05;
        u.onend = () => { setTtsFinished(true); ttsFinishedRef.current = true; };
        u.onerror = () => { setTtsFinished(true); ttsFinishedRef.current = true; };
        window.speechSynthesis.speak(u);
      } else {
        setTtsFinished(true);
        ttsFinishedRef.current = true;
      }
    } else {
      setTtsFinished(true);
      ttsFinishedRef.current = true;
    }

    return () => window.speechSynthesis?.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, isPlaying, isMuted, lang]);

  // ── 타이머 + 프로그레스 (ref 기반 TTS 완료 폴링) ──
  useEffect(() => {
    clearTimeout(timerRef.current);
    clearInterval(ttsWaitIntervalRef.current);
    clearInterval(progressIntervalRef.current);

    if (isPlaying && currentSlide < slidesCount - 1) {
      startTimeRef.current = Date.now();

      // slideDuration 후 → TTS 완료 여부를 ref로 폴링
      timerRef.current = setTimeout(() => {
        // 이미 TTS 끝났거나 음소거면 즉시 진행
        if (ttsFinishedRef.current || isMutedRef.current) {
          nextSlide();
          return;
        }
        // TTS 대기: 100ms 간격 폴링 (최대 15초 안전장치)
        const pollStart = Date.now();
        ttsWaitIntervalRef.current = setInterval(() => {
          if (ttsFinishedRef.current || isMutedRef.current || !isPlayingRef.current) {
            clearInterval(ttsWaitIntervalRef.current);
            if (isPlayingRef.current) nextSlide();
            return;
          }
          // 15초 초과 시 강제 진행 (비정상 TTS 대비)
          if (Date.now() - pollStart > 15000) {
            clearInterval(ttsWaitIntervalRef.current);
            nextSlide();
          }
        }, 100);
      }, slideDuration);

      // 프로그레스 바 업데이트
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min((elapsed / slideDuration) * 100, 100);
        setProgress(((currentSlide * 100) + pct) / slidesCount);
      }, 30);
    } else {
      setProgress(((currentSlide + (currentSlide === slidesCount - 1 ? 1 : 0)) / slidesCount) * 100);
    }
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(ttsWaitIntervalRef.current);
      clearInterval(progressIntervalRef.current);
    };
  // ttsFinished를 의존성에서 제거 — ref로 직접 읽으므로 불필요
  }, [currentSlide, isPlaying, nextSlide, slidesCount]);

  // ── 전체화면 토글 (모바일: 가로 모드 강제) ──
  const toggleFullscreen = useCallback(() => {
    const el = playerWrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      screen.orientation?.unlock?.();
    } else {
      el.requestFullscreen().then(() => {
        // 모바일: 전체화면 진입 시 가로 모드 강제
        screen.orientation?.lock?.('landscape').catch(() => {});
      }).catch(() => {});
    }
  }, []);

  // ── 화면 클릭 네비게이션 (도크 예외) ──
  const handlePlayerClick = useCallback((e) => {
    if (e.target.closest('.bottom-dock') || e.target.closest('.shortcut-tooltip')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    pauseAutoPlay();
    window.speechSynthesis?.cancel();
    if (x < rect.width / 2) prevSlide();
    else nextSlide();
  }, [pauseAutoPlay, prevSlide, nextSlide]);

  // ── 키보드 단축키 ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.code === 'ArrowRight') { pauseAutoPlay(); window.speechSynthesis?.cancel(); nextSlide(); }
      else if (e.code === 'ArrowLeft') { pauseAutoPlay(); window.speechSynthesis?.cancel(); prevSlide(); }
      else if (e.code === 'KeyF') { e.preventDefault(); toggleFullscreen(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, pauseAutoPlay, nextSlide, prevSlide, toggleFullscreen]);

  // 다시보기 콜백
  const handleRestart = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(true);
    setCurrentSlide(0);
  }, []);

  const uiT = uiText[lang] || uiText.ko;

  return (
    <div id="player-wrapper-parent" ref={playerWrapperRef} className={`cinematic-scope w-full flex justify-center items-center ${theme}${isFullscreen ? ' fullscreen' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: PLAYER_STYLES }} />

      <div style={{
        width: `${1280 * scale}px`,
        height: `${720 * scale}px`,
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: `0 20px 60px var(--shadow-main), 0 0 0 1px var(--card-border)`
      }}>
        <div
          className={`player-container ${isPlaying ? 'playing' : ''}`}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '1280px',
            height: '720px',
            position: 'absolute',
            top: 0, left: 0
          }}
          onClick={handlePlayerClick}
        >
          {/* 단축키 툴팁 */}
          <div className={`shortcut-tooltip ${!showTooltip ? 'fade-out' : ''}`}>
            <i className="fa-solid fa-keyboard"></i>
            <span>{uiT.shortcutHint}</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {/* 슬라이드 콘텐츠 렌더링 */}
          {slideContent.renderSlides({
            currentSlide,
            confettiParticles,
            onRestart: handleRestart
          })}

          {/* 하단 통합 도크 (사운드바 스타일 — 자막 + 컨트롤) */}
          <div className="bottom-dock">
            {/* 스피커 그릴 SVG 패턴 (도크 좌우 끝) */}
            <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.25 }} width="20" height="40" viewBox="0 0 20 40">
              {[0,1,2,3,4,5,6,7].map(r => [0,1,2].map(c => (
                <circle key={`${r}-${c}`} cx={4 + c * 7} cy={3 + r * 5} r="1.2" fill="currentColor" style={{ color: 'var(--text-muted)' }} />
              )))}
            </svg>
            <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.25 }} width="20" height="40" viewBox="0 0 20 40">
              {[0,1,2,3,4,5,6,7].map(r => [0,1,2].map(c => (
                <circle key={`${r}-${c}`} cx={4 + c * 7} cy={3 + r * 5} r="1.2" fill="currentColor" style={{ color: 'var(--text-muted)' }} />
              )))}
            </svg>

            <div className="dock-content">
              {/* 스피커 그릴 점 장식 */}
              <div className="dock-grille">
                <div className="dock-grille-dot"></div>
                <div className="dock-grille-dot"></div>
                <div className="dock-grille-dot"></div>
              </div>

              {/* LED 상태등 */}
              <div className={`dock-led ${isMuted ? 'muted' : 'active'}`}></div>

              <div className={`subtitle-area ${isCCEnabled ? '' : 'hidden'}`}>
                <p className="subtitle-text">
                  {subtitles[currentSlide]}
                  {!isMuted && isPlaying && !ttsFinished && (
                    <span className="inline-block ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ verticalAlign: 'middle' }} />
                  )}
                </p>
              </div>

              {/* 에칭 구분선 */}
              <div className="controls-divider"></div>

              <div className="controls-area">
                <span className="slide-counter">{(currentSlide + 1).toString().padStart(2, '0')} / {slidesCount}</span>

                {/* CC 토글 */}
                <button className={`control-btn ${isCCEnabled ? 'active-cc' : ''}`} onClick={() => setIsCCEnabled(!isCCEnabled)} title="자막 켜기/끄기">
                  <i className="fa-solid fa-closed-captioning"></i>
                </button>

                {/* 음소거 토글 */}
                <button className={`control-btn ${isMuted ? 'active-mute' : ''}`} onClick={() => { setIsMuted(!isMuted); window.speechSynthesis?.cancel(); }} title="음성 켜기/끄기">
                  <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                </button>

                <div className="controls-divider"></div>

                <button className="control-btn" onClick={() => { pauseAutoPlay(); window.speechSynthesis?.cancel(); prevSlide(); }} title="이전 (←)">
                  <i className="fa-solid fa-backward-step"></i>
                </button>
                <button className="control-btn primary" onClick={togglePlay} title="재생/일시정지 (Space)">
                  {isPlaying ? <i className="fa-solid fa-pause"></i> : <i className="fa-solid fa-play" style={{ marginLeft: '4px' }}></i>}
                </button>
                <button className="control-btn" onClick={() => { pauseAutoPlay(); window.speechSynthesis?.cancel(); nextSlide(); }} title="다음 (→)">
                  <i className="fa-solid fa-forward-step"></i>
                </button>

                <div className="controls-divider"></div>

                {/* 전체화면 토글 */}
                <button className={`control-btn ${isFullscreen ? 'active-fs' : ''}`} onClick={toggleFullscreen} title="전체화면 (F)">
                  <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// GraphicExplanationPage — 메인 페이지 컴포넌트
// ══════════════════════════════════════════════════════════════
export default function GraphicExplanationPage() {
  // FontAwesome: 상단 import로 로컬 번들에 포함됨 (CDN 불필요)
  const { techniqueId, level } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [lang] = useState(() => getStoredLang());
  const t = uiText[lang] || uiText.ko;

  // 다크/라이트 테마
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('gotroot_theme') || 'light'; } catch { return 'light'; }
  });
  const isDark = theme === 'dark';
  const levelInfo = LEVEL_LABELS[level] || LEVEL_LABELS.beginner;

  // 그래픽 콘텐츠 동적 로딩
  const [slideContent, setSlideContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);

  // Auth Gate — authLoading 대기 필수 (세션 복원 전 리다이렉트 방지)
  useEffect(() => {
    if (authLoading) return; // 세션 로딩 완료 대기
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/edu/graphic/${techniqueId}/${level}`)}`);
      return;
    }
    setAuthChecked(true);
  }, [authLoading, isLoggedIn, navigate, techniqueId, level]);

  // 콘텐츠 동적 로딩
  useEffect(() => {
    const key = `${techniqueId}-${level}`;
    const loader = GRAPHIC_DATA_LOADERS[key];
    if (loader) {
      setContentLoading(true);
      loader().then(mod => {
        setSlideContent(mod);
        setContentLoading(false);
      }).catch(() => {
        setSlideContent(null);
        setContentLoading(false);
      });
    } else {
      setSlideContent(null);
      setContentLoading(false);
    }
  }, [techniqueId, level]);

  // 페이지 이탈 시 TTS 정리
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const pageMeta = eduMeta.pages[techniqueId];

  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isDark ? 'bg-[#0a0f1a]' : 'bg-slate-50'}`}>
        <div className="w-10 h-10 border-3 border-blue-300/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ContentProtection>
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-[#0a0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* ── 헤더 ── */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${isDark ? 'bg-[#0a0f1a]/80 border-slate-800/60' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between">
          <button
            onClick={() => { window.speechSynthesis?.cancel(); navigate(`/edu/${techniqueId}`); }}
            className={`flex items-center gap-1 sm:gap-2 text-xs transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{t.backBtn}</span>
            <span className="sm:hidden">←</span>
          </button>

          {/* 브레드크럼 단계 — 모바일: 현재 단계만 표시, 데스크톱: 전체 표시 */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <span className={`hidden sm:inline px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>1. 교육</span>
            <span className={`hidden sm:inline ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>→</span>
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold">2. 그래픽</span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>→</span>
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><span className="sm:hidden">3</span><span className="hidden sm:inline">3. 시나리오</span></span>
            <span className={`hidden sm:inline ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>→</span>
            <span className={`hidden sm:inline px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>4. 랩</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <span
              className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full border"
              style={{ color: levelInfo.color, borderColor: levelInfo.color + '50', backgroundColor: levelInfo.color + '15' }}
            >
              {lang === 'en' ? levelInfo.en : levelInfo.ko}
            </span>
            <span className={`text-xs font-mono hidden md:inline-block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{techniqueId}</span>

            {/* 테마 전환 */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border cursor-pointer text-sm sm:text-base ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-sky-500 hover:bg-slate-100'
              }`}
              title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* ── 기법 정보 (모바일: 최소화) ── */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 pt-1 sm:pt-4 pb-0.5 sm:pb-2 w-full">
        <div className="text-center">
          <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mb-1">
            🎨 {t.graphicTitle}
          </span>
          <h1 className="text-sm sm:text-xl md:text-2xl font-black mb-0 sm:mb-1">
            {lang === 'en' ? pageMeta?.titleEn : pageMeta?.title}
          </h1>
          <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.graphicSubtitle}</p>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="flex-1 max-w-6xl mx-auto px-1 sm:px-4 w-full pb-14 sm:pb-20 flex flex-col justify-center items-center">
        {contentLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-blue-300/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : slideContent ? (
          <CinematicPlayer
            theme={theme}
            slideContent={slideContent}
            subtitles={slideContent.subtitlesData}
            lang={lang}
          />
        ) : (
          /* 콘텐츠 없음 폴백 */
          <div className="rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-900/40 p-12 text-center min-h-[400px] flex flex-col items-center justify-center gap-6">
            <div className="text-6xl opacity-40">🎨</div>
            <h2 className="text-xl font-bold text-slate-300 mb-3">{t.noContent}</h2>
            <div className="text-xs text-slate-600">[{techniqueId} / {level}]</div>
          </div>
        )}
      </div>

      {/* ── 하단 네비게이션 바 ── */}
      <div className={`fixed bottom-0 left-0 right-0 backdrop-blur border-t py-2 sm:py-4 px-2 sm:px-4 z-50 transition-colors duration-500 ${isDark ? 'bg-[#0a0f1a]/95 border-slate-800/60' : 'bg-white/95 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={() => { window.speechSynthesis?.cancel(); navigate(`/edu/${techniqueId}`); }}
            className={`text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{t.backBtn}</span>
            <span className="sm:hidden">←</span>
          </button>
          <button
            onClick={() => { window.speechSynthesis?.cancel(); navigate(`/edu/scenario/${techniqueId}/${level}`); }}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer shadow-lg shadow-amber-500/20 whitespace-nowrap shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <span className="hidden sm:inline">{t.nextBtn}</span>
            <span className="sm:hidden">시나리오 →</span>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    </ContentProtection>
  );
}

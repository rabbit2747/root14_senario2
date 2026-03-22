/**
 * GOTROOT Edu — 교육 페이지 하단 "그래픽 설명" 이동 링크 자동 삽입
 * 각 교육 HTML 페이지의 progress-tracker.js 직전에 삽입:
 *   <script src="/edu/graphic-link.js"></script>
 *
 * 동작 원리:
 * 1. <html data-technique-id="T1078.002"> 속성에서 기법 ID 추출
 * 2. 페이지 하단에 "다음 단계: 그래픽으로 이해하기" 링크 섹션 동적 생성
 * 3. 클릭 시 React SPA 라우트 /edu/graphic/:techniqueId 로 이동 (풀 네비게이션)
 * 4. 다크/라이트 모드 자동 감지
 */
(function() {
  'use strict';

  var techniqueId = document.documentElement.getAttribute('data-technique-id');
  if (!techniqueId) return;

  var level = document.documentElement.getAttribute('data-level') || 'beginner';
  var graphicUrl = '/edu/graphic/' + techniqueId + '/' + level;

  function inject() {
    // 이미 삽입되었으면 중복 방지
    if (document.getElementById('gotroot-graphic-link')) return;

    var isDark = document.documentElement.classList.contains('dark');

    // ── 링크 섹션 생성 ──
    var section = document.createElement('div');
    section.id = 'gotroot-graphic-link';
    section.style.cssText = 'padding:2.5rem 1rem 1.5rem;text-align:center;margin-top:2rem;';

    section.innerHTML = [
      '<div style="max-width:480px;margin:0 auto;">',
      // 구분선
      '<div style="width:60px;height:2px;background:linear-gradient(to right,#f59e0b,#8b5cf6);margin:0 auto 1.5rem;border-radius:2px;"></div>',
      // 플로우 안내
      '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:1.2rem;flex-wrap:wrap;">',
      '<span style="font-size:10px;padding:3px 8px;border-radius:9999px;background:rgba(100,116,139,0.2);color:#94a3b8;border:1px solid rgba(100,116,139,0.3);">📖 교육</span>',
      '<span style="color:#475569;font-size:10px;">→</span>',
      '<span style="font-size:10px;padding:3px 8px;border-radius:9999px;background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);font-weight:700;">🎨 그래픽</span>',
      '<span style="color:#475569;font-size:10px;">→</span>',
      '<span style="font-size:10px;padding:3px 8px;border-radius:9999px;background:rgba(100,116,139,0.1);color:#64748b;border:1px solid rgba(100,116,139,0.2);">📋 시나리오</span>',
      '<span style="color:#475569;font-size:10px;">→</span>',
      '<span style="font-size:10px;padding:3px 8px;border-radius:9999px;background:rgba(100,116,139,0.1);color:#64748b;border:1px solid rgba(100,116,139,0.2);">🧪 랩</span>',
      '</div>',
      // 아이콘
      '<div style="font-size:2.5rem;margin-bottom:0.75rem;">🎨</div>',
      // 제목
      '<h3 style="font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;color:' + (isDark ? '#f1f5f9' : '#1e293b') + ';">',
      '다음 단계: 그래픽으로 이해하기',
      '</h3>',
      // 설명
      '<p style="font-size:0.85rem;color:#94a3b8;margin-bottom:1.5rem;line-height:1.6;">',
      '공격 기법의 흐름을 시각적 다이어그램으로<br>직관적으로 이해합니다.',
      '</p>',
      // 버튼
      '<a id="gotroot-graphic-btn" href="' + graphicUrl + '" style="',
      'display:inline-flex;align-items:center;gap:10px;',
      'background:linear-gradient(135deg,#f59e0b,#d97706);',
      'color:#fff;padding:14px 28px;border-radius:14px;',
      'font-weight:700;font-size:14px;text-decoration:none;',
      'box-shadow:0 4px 15px rgba(245,158,11,0.3);',
      'transition:all 0.2s ease;">',
      '<span>그래픽 설명으로 이동하기</span>',
      '<span style="font-size:1.1rem;">→</span>',
      '</a>',
      '</div>'
    ].join('');

    // 호버 효과
    var btn = section.querySelector('#gotroot-graphic-btn');
    if (btn) {
      btn.onmouseover = function() {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 6px 20px rgba(245,158,11,0.4)';
      };
      btn.onmouseout = function() {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 15px rgba(245,158,11,0.3)';
      };
    }

    // ── 삽입 위치 결정 ──
    // 1순위: main-scroll 내부 max-w 컨테이너의 마지막 자식으로
    var mainScroll = document.getElementById('main-scroll');
    if (mainScroll) {
      var inner = mainScroll.querySelector('.max-w-4xl') || mainScroll.querySelector('.max-w-3xl');
      if (inner) {
        inner.appendChild(section);
        return;
      }
    }

    // 2순위: <main> 태그의 마지막 자식으로
    var mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.appendChild(section);
      return;
    }

    // 3순위: progress-tracker 스크립트 직전
    var trackerScript = document.querySelector('script[src*="progress-tracker"]');
    if (trackerScript && trackerScript.parentNode) {
      trackerScript.parentNode.insertBefore(section, trackerScript);
      return;
    }

    // 최후 폴백: body 끝에
    document.body.appendChild(section);
  }

  // DOM 준비 후 삽입
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    // 동적 콘텐츠 로더와 호환 (약간의 딜레이)
    setTimeout(inject, 600);
  }
})();

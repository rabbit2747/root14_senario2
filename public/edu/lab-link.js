/**
 * GOTROOT Edu — 교육 페이지 하단 "애니메이션 랩" 이동 링크 자동 삽입
 * 각 교육 HTML 페이지의 progress-tracker.js 직전에 삽입:
 *   <script src="/edu/lab-link.js"></script>
 *
 * 동작 원리:
 * 1. <html data-technique-id="T1078.002"> 속성에서 기법 ID 추출
 * 2. 페이지 하단에 "다음 단계: 애니메이션 랩" 링크 섹션 동적 생성
 * 3. 다크/라이트 모드 자동 감지
 */
(function() {
  'use strict';

  var techniqueId = document.documentElement.getAttribute('data-technique-id');
  if (!techniqueId) return;

  var labUrl = '/lab/animation/' + techniqueId;

  function inject() {
    // 이미 삽입되었으면 중복 방지
    if (document.getElementById('gotroot-lab-link')) return;

    var isDark = document.documentElement.classList.contains('dark');

    // ── 링크 섹션 생성 ──
    var section = document.createElement('div');
    section.id = 'gotroot-lab-link';
    section.style.cssText = 'padding:2.5rem 1rem 1.5rem;text-align:center;margin-top:2rem;';

    section.innerHTML = [
      '<div style="max-width:480px;margin:0 auto;">',
      // 구분선
      '<div style="width:60px;height:2px;background:linear-gradient(to right,#3b82f6,#8b5cf6);margin:0 auto 1.5rem;border-radius:2px;"></div>',
      // 아이콘
      '<div style="font-size:2.5rem;margin-bottom:0.75rem;">🎮</div>',
      // 제목
      '<h3 style="font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;color:' + (isDark ? '#f1f5f9' : '#1e293b') + ';">',
      '다음 단계: 애니메이션 랩',
      '</h3>',
      // 설명
      '<p style="font-size:0.85rem;color:#94a3b8;margin-bottom:1.5rem;line-height:1.6;">',
      '실제 공격 시나리오가 어떻게 전개되는지<br>시각화된 애니메이션으로 체험합니다.',
      '</p>',
      // 버튼
      '<a id="gotroot-lab-btn" href="' + labUrl + '" style="',
      'display:inline-flex;align-items:center;gap:10px;',
      'background:linear-gradient(135deg,#3b82f6,#8b5cf6);',
      'color:#fff;padding:14px 28px;border-radius:14px;',
      'font-weight:700;font-size:14px;text-decoration:none;',
      'box-shadow:0 4px 15px rgba(59,130,246,0.3);',
      'transition:all 0.2s ease;">',
      '<span>애니메이션 랩으로 이동하기</span>',
      '<span style="font-size:1.1rem;">→</span>',
      '</a>',
      '</div>'
    ].join('');

    // 호버 효과
    var btn = section.querySelector('#gotroot-lab-btn');
    if (btn) {
      btn.onmouseover = function() {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)';
      };
      btn.onmouseout = function() {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 15px rgba(59,130,246,0.3)';
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

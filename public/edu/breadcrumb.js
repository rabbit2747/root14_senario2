/**
 * GOTROOT Education Platform — Breadcrumb Navigation & State Preservation
 *
 * 이 스크립트는 모든 교육 HTML 페이지에서 공유됩니다.
 * - sessionStorage 기반 브레드크럼 경로 표시
 * - "대시보드로 돌아가기" 버튼의 상태 복원 업그레이드
 * - SPA ↔ 정적 HTML 간 네비게이션 상태 보존
 *
 * 사용법: <script src="/edu/breadcrumb.js"></script>
 */
(function () {
  'use strict';

  var NAV_KEY = 'gotroot_nav_state';

  // ── sessionStorage 읽기 헬퍼 ──
  function getNavState() {
    try {
      return JSON.parse(sessionStorage.getItem(NAV_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function setNavState(state) {
    try {
      sessionStorage.setItem(NAV_KEY, JSON.stringify(state));
    } catch (e) { /* quota exceeded 등 무시 */ }
  }

  // ── 브레드크럼 DOM 주입 ──
  function injectBreadcrumb() {
    var navState = getNavState();
    var breadcrumb = navState.breadcrumb;
    if (!breadcrumb || !breadcrumb.length) return;

    // 브랜드 헤더 바 찾기 (모든 교육 HTML의 공통 구조)
    var headerBar = document.querySelector('.w-full.px-4.py-1\\.5.border-b');
    if (!headerBar) {
      // 다른 셀렉터 시도
      headerBar = document.querySelector('[class*="border-b"][class*="bg-white"]') ||
                  document.querySelector('[class*="border-b"][class*="bg-slate-900"]');
    }
    if (!headerBar) return;

    // 기존 브레드크럼이 있으면 제거 (중복 방지)
    var existing = headerBar.querySelector('.gotroot-breadcrumb');
    if (existing) existing.remove();

    // 브레드크럼 컨테이너 생성
    var bc = document.createElement('nav');
    bc.className = 'gotroot-breadcrumb';
    bc.setAttribute('aria-label', 'Breadcrumb');
    bc.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'gap:6px',
      'font-size:11px',
      'margin-left:16px',
      'font-family:Inter,system-ui,sans-serif',
      'flex-shrink:1',
      'min-width:0',
      'overflow:hidden'
    ].join(';');

    breadcrumb.forEach(function (crumb, i) {
      // 구분자
      if (i > 0) {
        var sep = document.createElement('span');
        sep.textContent = '/';
        sep.style.cssText = 'color:#64748b;flex-shrink:0;';
        sep.setAttribute('aria-hidden', 'true');
        bc.appendChild(sep);
      }

      var isLast = (i === breadcrumb.length - 1);

      if (isLast) {
        // 현재 페이지 (클릭 불가)
        var span = document.createElement('span');
        span.textContent = crumb.label;
        span.style.cssText = 'color:#f8fafc;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;';
        span.setAttribute('aria-current', 'page');
        bc.appendChild(span);
      } else {
        // 클릭 가능한 링크
        var link = document.createElement('a');
        link.href = crumb.path || '/';
        link.textContent = crumb.label;
        link.style.cssText = 'color:#94a3b8;text-decoration:none;cursor:pointer;transition:color .15s;white-space:nowrap;';
        link.onmouseover = function () { this.style.color = '#f8fafc'; };
        link.onmouseout = function () { this.style.color = '#94a3b8'; };

        // 클릭 시 상태 복원 후 이동
        (function (c) {
          link.onclick = function (e) {
            e.preventDefault();
            if (c.state) {
              var ns = getNavState();
              for (var key in c.state) {
                if (c.state.hasOwnProperty(key)) {
                  ns[key] = c.state[key];
                }
              }
              setNavState(ns);
            }
            window.location.href = c.path || '/';
          };
        })(crumb);

        bc.appendChild(link);
      }
    });

    // 헤더 바의 첫 번째 flex 자식 뒤에 삽입
    var firstChild = headerBar.querySelector('.flex') || headerBar.firstElementChild;
    if (firstChild) {
      firstChild.style.display = 'flex';
      firstChild.style.alignItems = 'center';
      firstChild.style.flexWrap = 'nowrap';
      firstChild.style.minWidth = '0';
      firstChild.appendChild(bc);
    } else {
      headerBar.appendChild(bc);
    }
  }

  // ── "대시보드로 돌아가기" 버튼 업그레이드 ──
  function upgradeBackButtons() {
    // onclick="location.href='/'" 패턴의 버튼들을 찾아 상태 복원 방식으로 교체
    var allButtons = document.querySelectorAll('button, a');
    allButtons.forEach(function (btn) {
      var onclick = btn.getAttribute('onclick') || '';
      var href = btn.getAttribute('href') || '';

      // location.href='/' 또는 location.href="/" 패턴 감지
      var isBackToHome = onclick.match(/location\.href\s*=\s*['"]\/['"]/) ||
                         (href === '/' && btn.textContent.match(/대시보드|매트릭스|돌아가기|Back|Matrix/i));

      if (isBackToHome) {
        // 기존 onclick 제거
        btn.removeAttribute('onclick');
        if (btn.tagName === 'A') {
          btn.setAttribute('href', '#');
        }

        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var ns = getNavState();

          // 브레드크럼에서 직전 경로 찾기
          if (ns.breadcrumb && ns.breadcrumb.length >= 2) {
            var prev = ns.breadcrumb[ns.breadcrumb.length - 2];
            if (prev.state) {
              for (var key in prev.state) {
                if (prev.state.hasOwnProperty(key)) {
                  ns[key] = prev.state[key];
                }
              }
            }
            // 현재 단계를 breadcrumb에서 제거 (뒤로가기)
            ns.breadcrumb = ns.breadcrumb.slice(0, -1);
            setNavState(ns);
            window.location.href = prev.path || '/';
          } else {
            // 브레드크럼이 없으면 기본 동작
            if (ns.selectedTactic) {
              ns.viewMode = 'matrix';
              setNavState(ns);
            }
            window.location.href = '/';
          }
        });
      }
    });
  }

  // ── 현재 페이지 정보 기록 (스크롤 위치 등) ──
  function trackCurrentPage() {
    var ns = getNavState();
    var mainScroll = document.getElementById('main-scroll');
    if (!mainScroll) return;

    var saveTimeout;
    mainScroll.addEventListener('scroll', function () {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(function () {
        ns = getNavState();
        ns.eduScrollPosition = mainScroll.scrollTop;
        setNavState(ns);
      }, 300);
    });

    // 페이지 로드 시 스크롤 위치 복원
    if (ns.eduScrollPosition && ns.eduScrollPosition > 0) {
      var currentUrl = window.location.pathname;
      var lastCrumb = ns.breadcrumb && ns.breadcrumb[ns.breadcrumb.length - 1];
      if (lastCrumb && lastCrumb.path === currentUrl) {
        setTimeout(function () {
          mainScroll.scrollTop = ns.eduScrollPosition;
        }, 200);
      }
    }
  }

  // ── 다크모드 감지 후 브레드크럼 스타일 조정 ──
  function adaptTheme() {
    var isDark = document.documentElement.classList.contains('dark');
    var bc = document.querySelector('.gotroot-breadcrumb');
    if (!bc) return;

    var links = bc.querySelectorAll('a');
    links.forEach(function (link) {
      link.style.color = isDark ? '#94a3b8' : '#64748b';
      link.onmouseover = function () { this.style.color = isDark ? '#f8fafc' : '#1e293b'; };
      link.onmouseout = function () { this.style.color = isDark ? '#94a3b8' : '#64748b'; };
    });

    var current = bc.querySelector('[aria-current="page"]');
    if (current) {
      current.style.color = isDark ? '#f8fafc' : '#0f172a';
    }
  }

  // ── 초기화 ──
  function init() {
    injectBreadcrumb();
    upgradeBackButtons();
    trackCurrentPage();
    adaptTheme();

    // 테마 변경 감지 (MutationObserver)
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName === 'class') {
          adaptTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  // ── DOM 준비 후 실행 ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(init, 50);
    });
  } else {
    setTimeout(init, 50);
  }
})();

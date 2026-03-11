/**
 * GOTROOT Edu — 교육 페이지 챕터 진행률 추적기
 * 각 교육 HTML 페이지의 </body> 직전에 삽입:
 *   <script src="/edu/progress-tracker.js"></script>
 *
 * 동작 원리:
 * 1. <html data-technique-id="T1078.002" data-level="beginner"> 속성에서 기법 ID + 레벨 추출
 * 2. IntersectionObserver로 .section-observe 챕터 80%+ 진입 감지
 * 3. Supabase REST API로 edu_progress INSERT (중복 무시, level 포함)
 * 4. localStorage에도 동시 저장 (오프라인 폴백, 레벨별 중첩 구조)
 */
(function() {
  'use strict';

  var SUPA_URL = 'https://bnwbybawqrnhznirivfg.supabase.co';
  var SUPA_KEY = 'sb_publishable_fiXeTnAxpTatUSnC0ZvOWg_x5eSbL1w';
  var AUTH_STORAGE_KEY = 'sb-bnwbybawqrnhznirivfg-auth-token';
  var LOCAL_PROGRESS_KEY = 'gotroot_edu_progress';

  // ── technique_id + level 추출 ──
  var techniqueId = document.documentElement.getAttribute('data-technique-id');
  if (!techniqueId) return; // data-technique-id 없으면 추적 안 함
  var level = document.documentElement.getAttribute('data-level') || 'beginner';

  // ── 인증 정보 헬퍼 ──
  function getSession() {
    try {
      var raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) { return null; }
  }

  function getAccessToken() {
    var s = getSession();
    return s ? (s.access_token || null) : null;
  }

  function getUserId() {
    var s = getSession();
    return s && s.user ? s.user.id : null;
  }

  // ── 기존 배열 형식 → 레벨별 객체 형식 마이그레이션 ──
  try {
    var localAll = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '{}');
    var migrated = false;
    Object.keys(localAll).forEach(function(tid) {
      if (Array.isArray(localAll[tid])) {
        localAll[tid] = { beginner: localAll[tid] };
        migrated = true;
      }
    });
    if (migrated) localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(localAll));
  } catch(e) {}

  // ── 완료 상태 관리 ──
  var completedChapters = {};

  // 이미 완료된 챕터 로드 (로컬, 레벨별 중첩 구조 지원)
  try {
    var local = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '{}');
    var techData = local[techniqueId];
    if (techData) {
      if (Array.isArray(techData)) {
        // Old format (마이그레이션 누락 시 폴백) — beginner로 취급
        techData.forEach(function(ch) { completedChapters[ch] = true; });
      } else if (techData[level]) {
        techData[level].forEach(function(ch) { completedChapters[ch] = true; });
      }
    }
  } catch(e) {}

  // ── 챕터 완료 기록 ──
  function markChapterComplete(chapterId) {
    if (completedChapters[chapterId]) return; // 중복 방지
    completedChapters[chapterId] = true;

    // 1) localStorage 동시 저장 (레벨별 중첩 구조)
    try {
      var local = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '{}');
      if (!local[techniqueId]) local[techniqueId] = {};
      if (!local[techniqueId][level]) local[techniqueId][level] = [];
      if (local[techniqueId][level].indexOf(chapterId) === -1) {
        local[techniqueId][level].push(chapterId);
        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(local));
      }
    } catch(e) {}

    // 2) Supabase REST API INSERT
    var token = getAccessToken();
    var userId = getUserId();
    if (!token || !userId) return; // 비로그인 → localStorage만

    fetch(SUPA_URL + '/rest/v1/edu_progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + token,
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        technique_id: techniqueId,
        chapter_id: chapterId,
        level: level
      })
    }).catch(function() { /* 네트워크 실패 → localStorage에 이미 저장됨 */ });
  }

  // ── IntersectionObserver: 80% 이상 노출 시 완료 ──
  function startTracking() {
    var sections = document.querySelectorAll('.section-observe');
    if (!sections.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.intersectionRatio >= 0.75) {
          var id = entry.target.getAttribute('id');
          if (id && /^(ch\d+|quiz|eval)$/.test(id)) {
            markChapterComplete(id);
          }
        }
      });
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
      rootMargin: '0px'
    });

    sections.forEach(function(s) { observer.observe(s); });
  }

  // ── DOM 로드 후 시작 ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTracking);
  } else {
    // 동적 로더가 document.write()로 교체한 경우 DOM이 이미 완성
    // 약간의 딜레이로 IntersectionObserver가 정상 동작하도록 보장
    setTimeout(startTracking, 500);
  }
})();

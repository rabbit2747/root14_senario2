# 13. Progress Tracking System - 진행률 추적 시스템

## Meta
| Key | Value |
|-----|-------|
| Hook | `src/hooks/useEduProgress.js` |
| API | `src/api/edu.js` |
| Client Writer | `public/edu/progress-tracker.js` |
| Supabase Table | `edu_progress` |

## Purpose
학습 진행률을 Supabase + localStorage 이중 저장으로 추적.
SPA(React)는 읽기만, 쓰기는 외부 HTML(progress-tracker.js)에서 수행.
랩 완료 시에만 SPA에서 직접 쓰기.

## Architecture
```
[쓰기 경로 1: 교육 HTML]
public/edu/*.html
  → progress-tracker.js
  → IntersectionObserver (챕터 80% 도달)
  → Supabase edu_progress UPSERT (gotroot_auth_token 쿠키)
  → localStorage gotroot_edu_progress 동시 저장

[쓰기 경로 2: 랩 완료]
GenericLabSimulator.jsx
  → 시뮬레이션 완료
  → supabase.from('edu_progress').upsert({ chapter_id: 'lab_completed' })
  → localStorage gotroot_completed_labs push

[읽기 경로: SPA]
useEduProgress.js
  → src/api/edu.js → getEduProgress(userId) → Supabase SELECT
  → localStorage gotroot_edu_progress 읽기
  → 두 소스 병합 (merge)
  → { getProgress, isLevelComplete, isUnlocked, completedTechIds, stats }
```

## Supabase Table: edu_progress
```sql
CREATE TABLE edu_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  technique_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner',
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, technique_id, chapter_id, level)
);

-- RLS
ALTER TABLE edu_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_progress" ON edu_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## useEduProgress Hook API
```javascript
const {
  progress,          // { [techniqueId]: { [level]: [chapterIds] } }
  loading,           // boolean
  getProgress,       // (techniqueId, level?) → { completed, total, chapters, percent }
  isComplete,        // (techniqueId) → boolean (모든 레벨 완료)
  isLevelComplete,   // (techniqueId, level) → boolean
  isUnlocked,        // (techniqueId, level) → boolean (순차 해금)
  completedTechIds,  // Set<string>
  stats,             // { totalPages, startedPages, completedPages }
  refresh,           // () → Supabase 재조회
} = useEduProgress();
```

## getProgress 상세
```javascript
function getProgress(techniqueId, level) {
  // edu-meta.json에서 해당 레벨의 총 챕터 수 조회
  const meta = eduMeta.pages[techniqueId];
  const levelData = meta?.levels?.[level];
  const totalChapters = levelData?.chapters || 0;

  // progress에서 완료된 챕터 ID 목록 조회
  const completedChapters = progress[techniqueId]?.[level] || [];

  return {
    completed: completedChapters.length,
    total: totalChapters,
    chapters: completedChapters,
    percent: totalChapters > 0
      ? Math.min(Math.round((completedChapters.length / totalChapters) * 100), 100)
      : 0,
  };
}
```

## isUnlocked 상세
```javascript
function isUnlocked(techniqueId, level) {
  const LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
  const idx = LEVELS.indexOf(level);

  if (idx === 0) return true;  // novice 항상 해금

  const prevLevel = LEVELS[idx - 1];
  const prevMeta = eduMeta.pages[techniqueId]?.levels?.[prevLevel];

  if (!prevMeta?.url) return true;  // 이전 레벨 콘텐츠 없으면 건너뜀

  return isLevelComplete(techniqueId, prevLevel);
}
```

## localStorage Structures

### gotroot_edu_progress
```json
{
  "T1587.001": {
    "novice": ["ch1", "ch2", "ch3"],
    "beginner": ["ch1", "ch2", "ch3", "ch4", "ch5"]
  },
  "T1566.001": {
    "beginner": ["ch1", "ch2"]
  }
}
```

### gotroot_completed_labs
```json
[
  {
    "name": "악성코드 개발 시뮬레이션",
    "technique": "T1587.001",
    "completedAt": "2026-03-15T10:30:00.000Z"
  }
]
```

### gotroot_guided_progress
```json
{
  "T1566.001": [0, 1, 2, 3, 4, 5]
}
```

## progress-tracker.js (Public HTML)
```javascript
// ─── 핵심 동작 ───
// 1. HTML 속성에서 메타 추출
const techniqueId = document.documentElement.dataset.techniqueId;
const level = document.documentElement.dataset.level;

// 2. IntersectionObserver로 챕터 감시
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.intersectionRatio >= 0.8) {
      const chapterId = entry.target.dataset.chapterId;
      markCompleted(chapterId);
    }
  });
}, { threshold: 0.8 });

document.querySelectorAll('.section-observe').forEach(el => observer.observe(el));

// 3. 완료 시 Supabase UPSERT
async function markCompleted(chapterId) {
  // 정규식 검증: /^(ch\d+|quiz|eval)$/
  if (!/^(ch\d+|quiz|eval)$/.test(chapterId)) return;

  // JWT 쿠키에서 토큰 추출
  const token = getCookie('gotroot_auth_token');

  // Supabase UPSERT
  await fetch(`${SUPA_URL}/rest/v1/edu_progress`, {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      technique_id: techniqueId,
      chapter_id: chapterId,
      level: level,
    }),
  });

  // localStorage 동시 저장 (오프라인 폴백)
  saveToLocalStorage(techniqueId, level, chapterId);
}
```

## Data Merge Strategy
```
Supabase 데이터:  { T1587.001: { beginner: [ch1, ch2, ch3] } }
localStorage 데이터: { T1587.001: { beginner: [ch1, ch2, ch3, ch4] } }

병합 결과: { T1587.001: { beginner: [ch1, ch2, ch3, ch4] } }
(합집합 — 양쪽 중 더 많은 진행률 보존)
```

## Used By
| Component | Method | Purpose |
|-----------|--------|---------|
| CourseSelector | isUnlocked, getProgress | 레벨 잠금/해금, CTA 텍스트 |
| IntroMatrix | completedTechIds | 매트릭스 완료 배지 |
| RecommendedCoursePage | getProgress, isLevelComplete | 4단계 진행률 |
| EduProgressStats (Admin) | stats | 전체 통계 |
| MyPage | completedTechIds, stats | 마이페이지 진행률 |

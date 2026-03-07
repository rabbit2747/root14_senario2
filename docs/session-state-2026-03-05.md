# 세션 상태 참조 문서 — 2026-03-05

> Claude가 다음 세션에서 현재까지의 작업 맥락을 빠르게 파악하기 위한 문서

---

## 현재 프로젝트 상태

| 항목 | 상태 |
|------|------|
| 현재 브랜치 (main) | `feature/hero-incident-matrix` |
| 현재 브랜치 (worktree) | `claude/compassionate-kapitsa` |
| Dev 서버 | Worktree에서 실행 (포트 5173) |
| 최신 버전 | v0.7.1 (CLAUDE.md 기준) |

---

## 완료된 작업 목록

### ✅ 1. 아랍어(ar) + 베트남어(vi) 히어로 페이지 번역 추가
- **파일**: `src/components/hero/incidentData.js`
  - 8개 사건 모두: `description`, `attackVector`, `affectedOrgs`, `timeline`, `lessonsLearned`, `stat.label` → ar/vi 추가
  - `HERO_TEXT` 객체에 `ar`, `vi` 키 추가 (header, subheader, detailLabels 등)
- **파일**: `src/pages/IntroMatrix.jsx`
  - `langOptions` 배열에 `{ code: 'ar', label: 'العربية', flag: '🇸🇦' }`, `{ code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' }` 추가
  - **`uiT` 객체에 `ar`, `vi` 엔트리 추가** (버그 픽스: 없으면 `t.search` 등에서 TypeError 발생)

### ✅ 2. DetailPanel 동적 위치 조정 (panelSide)
- **파일**: `src/components/hero/DetailPanel.jsx`
  - `panelSide = 'right'` prop 추가
  - `makePanelContainerVariants(panelSide)` — 슬라이드 방향 동적 생성
  - outer wrapper: `<motion.div layout>` + `${panelSide === 'left' ? 'left-0 lg:left-2' : 'right-0 lg:right-2'}`
- **파일**: `src/components/hero/HeroIncidentMatrix.jsx`
  - `lastTacticId = TACTICS[TACTICS.length - 1]?.id` → `'impact'`
  - `activeTacticIdForPanel = selectedTacticId || currentTourItem?.tacticId`
  - `panelSide = activeTacticIdForPanel === lastTacticId ? 'left' : 'right'`
  - `detailPanelData` useMemo에 `fallback(obj)` 함수 적용 (ar/vi 포함 모든 언어 지원)

### ✅ 3. "전체 분석 리포트 보기" 모달 구현
- **파일**: `src/components/hero/DetailPanel.jsx`
  - `import { createPortal } from 'react-dom'` 추가
  - `FullAnalysisModal` 컴포넌트 추가 (ESC 닫기, 백드롭 클릭 닫기)
  - `isModalOpen` state 내부 관리 (`useState(false)`)
  - `handleOpenFullReport()` — 버튼 핸들러 (내부 모달 + 부모 콜백 옵션)
  - 모달은 `createPortal(modal, document.body)` → `pointer-events-none` 영향 없음
  - `AnimatePresence` 래핑으로 framer-motion 진입/퇴장 애니메이션
  - `z-[100]` — 사이드 패널(z-40) 위에 항상 표시

### ✅ 4. 빌드 검증
- `npm run build` ✓ 성공 (24.37s)

---

## 발견 및 수정된 버그

| 버그 | 원인 | 수정 |
|------|------|------|
| 흰 화면 | Worktree에 `.env` 없음 → Supabase auth pending | `.env` main → worktree 복사 |
| AR 클릭 시 앱 크래시 | `uiT['ar']` 없음 → `t.search` TypeError | `uiT`에 ar/vi 엔트리 추가 |
| 옛날 버전 화면 표시 | Worktree 파일이 이전 세션 버전 (인라인 DetailPanel) | main 파일 → worktree 전체 동기화 |
| 모달 버튼 동작 안 함 | `onOpenFullScreen` prop이 부모에서 전달되지 않음 | DetailPanel 내부 state로 전환 |

---

## 파일별 현재 상태

```
src/
├── components/hero/
│   ├── DetailPanel.jsx        ★ 수정됨 (panelSide + FullAnalysisModal)
│   ├── HeroIncidentMatrix.jsx ★ 수정됨 (panelSide 계산 + fallback)
│   ├── incidentData.js        ★ 수정됨 (ar/vi 번역)
│   ├── IncidentCard.jsx       수정됨 (blur 제거)
│   └── TacticColumn.jsx       수정됨
└── pages/
    └── IntroMatrix.jsx        ★ 수정됨 (ar/vi langOptions + uiT)
```

---

## 다음 세션에서 할 일 후보

1. **공지사항 등록** (CLAUDE.md 규칙): v0.7.x 업데이트 내용을 `announcements` 테이블에 등록
2. **VI (베트남어) 테스트** — AR은 테스트 완료, VI는 미확인
3. **panelSide 시각적 스크린샷 확인** — DOM 테스트로는 LEFT 전환 확인됨, 스크린샷 캡처 미완
4. **FullAnalysisModal 콘텐츠 확충** — 현재는 기본 데이터만 표시, 더 풍부한 리포트 UI 가능
5. **Worktree → main 브랜치 병합 검토**

---

## 중요 경로

```
메인 프로젝트:  C:\Users\GOTROOT\Desktop\Gotroot_Edu\
Worktree:       C:\Users\GOTROOT\Desktop\Gotroot_Edu\.claude\worktrees\compassionate-kapitsa\
Dev 서버:       http://127.0.0.1:5173  (worktree에서 실행)
빌드:           npm run build (메인 기준)
```

---

## Worktree 동기화 명령어 (자주 사용)

```bash
MAIN="C:\Users\GOTROOT\Desktop\Gotroot_Edu"
WT="C:\Users\GOTROOT\Desktop\Gotroot_Edu\.claude\worktrees\compassionate-kapitsa"

# 핵심 파일 동기화
cp "$MAIN/src/components/hero/DetailPanel.jsx"        "$WT/src/components/hero/DetailPanel.jsx"
cp "$MAIN/src/components/hero/HeroIncidentMatrix.jsx" "$WT/src/components/hero/HeroIncidentMatrix.jsx"
cp "$MAIN/src/components/hero/incidentData.js"        "$WT/src/components/hero/incidentData.js"
cp "$MAIN/src/pages/IntroMatrix.jsx"                  "$WT/src/pages/IntroMatrix.jsx"
```

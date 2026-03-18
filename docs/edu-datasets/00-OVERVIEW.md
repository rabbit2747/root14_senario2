# Gotroot Education System - Architecture Dataset

> Generated: 2026-03-18
> Version: v1.2.0
> Purpose: AI analysis dataset for education page architecture

## System Summary

Gotroot_Edu is a MITRE ATT&CK-based cybersecurity education platform built with React 18 + Vite + Supabase + Express.js.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 |
| State | React Hooks (useState, useEffect, useMemo, useCallback) |
| Auth | Supabase Auth (email/password) + JWT cookie |
| DB | Supabase (PostgreSQL) + Row-Level Security |
| Server | Express.js (production), Vite Dev Server (development) |
| Charts | react-chartjs-2, Chart.js |
| Animation | framer-motion (guided learning DnD) |
| Font | Paperlogy (custom, 9 weights) |

### Education Flow (User Journey)
```
[비로그인] → Hero + Matrix(차단) → Level Test(7문제 적응형)
  → Signup(레벨 저장) → Login
  → [beginner/junior] → /learning-path → 추천학습 or 자율학습
  → [intermediate+]   → / (Full Matrix)

[학습 흐름 (per technique)]
  /edu/:id (CourseSelector, 5레벨 카드)
  → /edu/*.html (외부 HTML, SPA 밖)
  → /edu/graphic/:id/:level (시네마틱 그래픽 슬라이드)
  → /edu/scenario/:id/:level (인터랙티브 시나리오)
  → /lab/desktop/:id/:level (해커/방어자 시뮬레이션)
  → /lab/complete/:id (수료 화면)
```

### 5-Level System
| Level | Emoji | Korean | Unlock Condition |
|-------|-------|--------|-----------------|
| novice | 🟡 | 입문 | Always unlocked |
| beginner | 🟢 | 초급 | novice complete (or always if no novice content) |
| intermediate | 🔵 | 중급 | beginner complete |
| advanced | 🔴 | 고급 | intermediate complete |
| expert | ⭐ | 전문가 | advanced complete |

### File Index
| File | Page | Route |
|------|------|-------|
| 01-LevelTest.md | 레벨 테스트 | /level-test |
| 02-LearningPathChoice.md | 학습 경로 선택 | /learning-path |
| 03-CourseSelector.md | 과정 선택 | /edu/:techniqueId |
| 04-EduHTML.md | 교육 HTML (외부) | /edu/*.html |
| 05-GraphicExplanationPage.md | 그래픽 설명 | /edu/graphic/:id/:level |
| 06-ScenarioExplanationPage.md | 시나리오 설명 | /edu/scenario/:id/:level |
| 07-DesktopLab.md | 데스크톱 랩 | /lab/desktop/:id/:level |
| 08-GenericLabSimulator.md | 범용 랩 시뮬레이터 | (component) |
| 09-LabCompletionPage.md | 랩 수료 | /lab/complete/:id |
| 10-RecommendedCoursePage.md | 추천 학습 로드맵 | /recommended/:id |
| 11-GuidedLearning.md | 유도 학습 | /guided/:id |
| 12-BasicsPage.md | IT 기초 | /basics |
| 13-ProgressTracking.md | 진행률 추적 시스템 | (hook + public JS) |
| 14-DataStructures.md | 데이터 구조 (JSON/DB) | (data layer) |

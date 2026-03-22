# 01. LevelTest - 적응형 레벨 테스트

## Meta
| Key | Value |
|-----|-------|
| Route | `/level-test` |
| File | `src/pages/LevelTest.jsx` |
| Auth Required | No (비로그인 허용, 로그인+레벨 보유 시 리다이렉트) |
| Version | v1.0.0 (2026-03-11) |
| Design | macOS 윈도우 PageWrapper + 다크/라이트 토글 |

## Purpose
비로그인 사용자가 7문제 적응형 퀴즈를 풀어 자신의 사이버보안 수준(5단계)을 측정.
결과는 회원가입 시 `profiles.level`에 저장되어 학습 경로 분기에 사용.

## Dependencies
```javascript
import { Radar } from 'react-chartjs-2';            // 레이더 차트 (결과 화면)
import { Chart as ChartJS, ... } from 'chart.js';   // 차트 엔진
import confetti from 'canvas-confetti';               // 만점 이스터에그
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getStoredLang } from '../components/LangToggle';
import { CATEGORIES, CATEGORIES_I18N, LEVEL_NAMES, LEVEL_COLORS } from '../data/level-test-questions';
import LoadingScreen, { VerifyingOverlay } from '../components/LoadingScreen';
```

## State Variables
```javascript
const [phase, setPhase] = useState('intro');           // intro | quiz | result
const [bank, setBank] = useState({});                  // { 1: [...], 2: [...], ... 5: [...] }
const [bankLoading, setBankLoading] = useState(true);  // 서버 API 로딩 상태
const [grading, setGrading] = useState(false);         // 채점 중 오버레이
const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
const [lang, setLang] = useState(() => getStoredLang());

// Quiz State
const [currentLevelIndex, setCurrentLevelIndex] = useState(3); // 적응형: 1-5, 초기 Lv.3
const [questionIndex, setQuestionIndex] = useState(0);          // 0-6 (7문제)
const [optionIdx, setOptionIdx] = useState(null);
const [showFeedback, setShowFeedback] = useState(false);
const [timeLeft, setTimeLeft] = useState(15);                   // 기본 15초 + 긴 지문 보너스

// Result State
const [scores, setScores] = useState({});                       // { category: { correct, total } }
const [finalLevel, setFinalLevel] = useState(null);             // 1-5
const [radarData, setRadarData] = useState(null);               // Chart.js dataset
```

## Core Algorithm: Adaptive Difficulty
```
초기 레벨: 3 (중급)
정답 → currentLevel + 1 (최대 5)
오답 → currentLevel - 1 (최소 1)
7문제 후 → 가중 평균으로 최종 레벨 결정

문제 선택: bank[currentLevel]에서 랜덤 1문제
타이머: 15초 기본 + (문제 텍스트 길이 > 100자 시 +3초 보너스)
```

## Data Flow
```
[Phase: intro]
  ↓ useEffect (mount)
  ↓ fetch('/api/level-test/questions')   ← 서버 API (문제 100개, 정답 미포함)
  ↓ 응답: [{ id, level, category, question, options: [text, text, ...] }]
  ↓ 레벨별 그룹핑 → setBank({ 1: [...], 2: [...], ... })
  ↓ 실패 시: 빈 bank → "문제를 불러올 수 없습니다" + 재시도 버튼

[Phase: quiz (7문제 반복)]
  ↓ 사용자 답변 선택 → setOptionIdx
  ↓ 확인 버튼 → handleConfirm()
  ↓ fetch('/api/level-test/check', { questionId, answerIndex })  ← 서버 채점
  ↓ 응답: { correct: boolean, correctIndex: number }
  ↓ 정답 표시 (초록) / 오답 표시 (빨강) + 정답 하이라이트
  ↓ 1.5초 후 다음 문제 또는 결과로 전환

[Phase: result]
  ↓ 레이더 차트 렌더 (5개 카테고리 축)
  ↓ 최종 레벨 배지 + 설명
  ↓ 만점 시 → confetti 이스터에그
  ↓ "회원가입하러 가기" → /signup?level={level}
```

## Server API Endpoints
```
GET  /api/level-test/questions
  → Supabase level_test_questions (is_active=true)
  → 20개 미만 시 server-data/level-test-questions.json 폴백
  → 응답에서 isCorrect 필드 제거 (보안)

POST /api/level-test/check
  → body: { questionId, answerIndex }
  → Supabase에서 해당 문제의 정답 조회
  → local- prefix 시 server-data/ 파일에서 조회
  → 응답: { correct: boolean, correctIndex: number }
```

## Loading States
1. **문제 로딩** (`bankLoading`): `<LoadingScreen>` 공통 컴포넌트
   - steps: 보안 채널 연결 → 문제 은행 복호화 → 적응형 엔진 초기화 → 난이도 알고리즘 → 위협 시나리오 → ATT&CK 동기화
2. **채점 중** (`grading`): `<VerifyingOverlay>` 블러 배경 + "VERIFYING" 스피너
3. **에러**: "문제를 불러올 수 없습니다" + 재시도 링크

## Rendering Phases
```
phase === 'intro' + bankLoading → LoadingScreen (macOS 윈도우 내)
phase === 'intro' + bank empty  → Error + Retry
phase === 'intro' + bank loaded → 인트로 화면 (시작 CTA)
phase === 'quiz'                → 문제 카드 (타이머 + 4지선다 + 확인)
phase === 'result'              → 레이더 차트 + 레벨 배지 + CTA
```

## Supabase Tables
| Table | Operation | Purpose |
|-------|-----------|---------|
| level_test_questions | SELECT (server-side) | 문제 은행 (100문제) |
| profiles | UPDATE (signup 시) | level 컬럼 저장 |

## Security
- 문제 은행: 클라이언트 번들에서 완전 제거 (v1.2.0)
- 정답: 서버에서만 검증, 클라이언트에 전달 안 함
- 채점: POST /api/level-test/check (서버사이드)
- 폴백: server-data/ 폴더 (Vite 빌드에 포함되지 않음)

## Categories (5)
```
네트워크/OS | 보안기초 | ATT&CK 전술 | 위협 탐지 | 심화/CTI
```

## i18n Support
- UI 텍스트: ko, en (uiText 객체)
- 카테고리명: ko, en, ja, zh, hi (CATEGORIES_I18N)
- 로딩 스텝: ko, en (LEVEL_TEST_LOADING_STEPS)

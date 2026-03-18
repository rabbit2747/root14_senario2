# 11. GuidedLearning - 유도 학습 시스템

## Meta
| Key | Value |
|-----|-------|
| Route | `/guided/:techniqueId` |
| File | `src/pages/guided/GuidedLearning.jsx` |
| Auth Required | Yes |
| Version | v1.1.0 (2026-03-14) |
| Design | macOS 윈도우 PageWrapper |

## Purpose
챕터 기반 유도 학습. 텍스트, 코드, 퀴즈, 시나리오, 애니메이션 등
다양한 인터랙티브 요소를 결합한 심화 학습 경험.
현재 T1566.001 (Spearphishing Attachment) 14챕터만 구현.

## Directory Structure
```
src/pages/guided/
├── GuidedLearning.jsx              # 메인 페이지
└── components/
    ├── PageWrapper.jsx             # macOS 윈도우 디자인
    ├── ChapterNav.jsx              # 챕터 네비게이션 (1-14)
    ├── ChapterRenderer.jsx         # 챕터 타입별 렌더 분기
    ├── GuidedText.jsx              # 텍스트 챕터
    ├── AnimatedFlow.jsx            # 단계 애니메이션
    ├── QuizCheckpoint.jsx          # 인라인 퀴즈
    ├── CodeSketch.jsx              # DnD 코드 빌더
    ├── SimTerminal.jsx             # 모의 터미널
    ├── CompletionCelebration.jsx   # 챕터 완료 축하
    └── GuidedCertificate.jsx       # 최종 수료증

src/data/guided-chapters/
└── T1566.001.js                    # 14챕터 콘텐츠 데이터
```

## Dependencies
```javascript
import { useAuth } from '../../context/AuthContext';
// Internal components:
import PageWrapper from './components/PageWrapper';
import ChapterNav from './components/ChapterNav';
import ChapterRenderer from './components/ChapterRenderer';
// framer-motion (CodeSketch DnD Reorder)
```

## State Variables
```javascript
const { techniqueId } = useParams();
const [currentChapter, setCurrentChapter] = useState(0);  // 0-13
const [progress, setProgress] = useState(() => {
  // localStorage: gotroot_guided_progress[techniqueId] = [0, 1, 2, ...]
  const saved = localStorage.getItem('gotroot_guided_progress');
  return saved ? JSON.parse(saved)[techniqueId] || [] : [];
});
```

## Chapter Content Structure (T1566.001.js)
```javascript
export const chapters = [
  {
    id: 'ch1',
    title: 'Spearphishing 개요',
    titleEn: 'Spearphishing Overview',
    type: 'text',        // text | code | quiz | scenario | animation
    content: '...'        // 타입별 다른 구조
  },
  {
    id: 'ch2',
    title: 'Email Header 분석',
    type: 'code',
    content: {
      template: 'From: {{sender}}\nTo: {{target}}\n...',
      solution: 'From: attacker@evil.com\nTo: ceo@company.com\n...',
      hints: ['발신자 주소를 확인하세요', '...']
    }
  },
  {
    id: 'ch3',
    title: '중간 점검',
    type: 'quiz',
    content: {
      question: 'Spearphishing에서 가장 중요한 요소는?',
      options: ['무작위 대상', '특정 대상 조사', '대량 발송', '자동화'],
      answer: 1,
      explanation: '스피어피싱은 특정 대상을 조사하여...'
    }
  },
  {
    id: 'ch4',
    title: '첨부파일 분석',
    type: 'animation',
    content: {
      steps: [
        { label: '이메일 수신', icon: '📧' },
        { label: '첨부파일 클릭', icon: '📎' },
        { label: '매크로 실행', icon: '⚡' },
        { label: 'C2 연결', icon: '📡' }
      ]
    }
  },
  // ... 14개 챕터
];
```

## Component Details

### PageWrapper.jsx
```
macOS 윈도우 디자인:
- 상단 타이틀바 (빨/노/초 버튼 + 제목)
- 다크/라이트 토글
- 반응형 (모바일 패딩 축소)
```

### ChapterNav.jsx
```
좌측 사이드바 (데스크톱) 또는 상단 슬라이더 (모바일)
- 챕터 번호 + 제목
- 완료 표시 (체크마크)
- 현재 챕터 하이라이트
- 잠금 상태 (순차 진행)
```

### ChapterRenderer.jsx
```javascript
switch (chapter.type) {
  case 'text':      return <GuidedText content={chapter.content} />;
  case 'code':      return <CodeSketch content={chapter.content} />;
  case 'quiz':      return <QuizCheckpoint content={chapter.content} onPass={advance} />;
  case 'animation': return <AnimatedFlow content={chapter.content} />;
  case 'scenario':  return <SimTerminal content={chapter.content} />;
}
```

### CodeSketch.jsx (DnD 코드 빌더)
```
framer-motion Reorder 사용
- 코드 블록을 드래그해서 올바른 순서로 배치
- 정답 확인 시 하이라이트 (초록/빨강)
- 힌트 버튼 제공
```

### SimTerminal.jsx (모의 터미널)
```
- 가짜 터미널 UI ($ 프롬프트)
- 사용자 명령어 입력 → 미리 정의된 출력 표시
- 자동완성 지원
- 올바른 명령어 시퀀스 완료 → 챕터 클리어
```

### QuizCheckpoint.jsx (인라인 퀴즈)
```
- 4지선다 + 설명 표시
- 정답 시 → 다음 챕터 해금
- 오답 시 → 설명 표시 + 재시도
```

### AnimatedFlow.jsx (단계 애니메이션)
```
- steps 배열을 순차 애니메이션으로 표시
- 각 단계: 아이콘 + 라벨 + 연결선
- 자동재생 또는 클릭 진행
```

### CompletionCelebration.jsx
```
- 챕터 완료 축하 UI
- 다음 챕터 안내 또는 전체 완료 시 수료
- 분기: 다음 챕터 / 복습 / 수료증
```

## Progress Storage
```javascript
// localStorage 키: gotroot_guided_progress
// 구조: { [techniqueId]: [completedChapterIndices] }
// 예: { "T1566.001": [0, 1, 2, 3] }

const saveProgress = (chapterIndex) => {
  const all = JSON.parse(localStorage.getItem('gotroot_guided_progress') || '{}');
  if (!all[techniqueId]) all[techniqueId] = [];
  if (!all[techniqueId].includes(chapterIndex)) {
    all[techniqueId].push(chapterIndex);
  }
  localStorage.setItem('gotroot_guided_progress', JSON.stringify(all));
};
```

## Rendering Structure
```
<PageWrapper title="유도 학습">
  <div class="flex">
    <!-- 좌측: 챕터 네비게이션 -->
    <ChapterNav
      chapters={chapters}
      current={currentChapter}
      progress={progress}
      onSelect={setCurrentChapter}
    />

    <!-- 우측: 챕터 콘텐츠 -->
    <div class="flex-1">
      <ChapterRenderer
        chapter={chapters[currentChapter]}
        onComplete={() => {
          saveProgress(currentChapter);
          if (currentChapter < chapters.length - 1) {
            setCurrentChapter(prev => prev + 1);
          }
        }}
      />

      <!-- 하단: 이전/다음 네비게이션 -->
      <nav>
        [← 이전 챕터] [다음 챕터 →]
      </nav>
    </div>
  </div>
</PageWrapper>
```

## Available Content
| Technique | Chapters | Status |
|-----------|----------|--------|
| T1566.001 (Spearphishing Attachment) | 14 | Active |
| (기타) | — | 미구현 |

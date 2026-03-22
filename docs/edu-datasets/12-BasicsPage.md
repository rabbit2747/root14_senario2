# 12. BasicsPage - IT 기초 학습

## Meta
| Key | Value |
|-----|-------|
| Route | `/basics` |
| File | `src/pages/BasicsPage.jsx` |
| Auth Required | Yes |
| Version | v1.0.0 (2026-03-11) |
| Design | 3컬럼 레이아웃 + 다크/라이트 토글 |

## Purpose
beginner/junior 레벨 사용자를 위한 IT 기초 커리큘럼.
네트워크, 웹, OS, 보안기초 카테고리별 학습 카드 제공.
자율 학습 경로에서 진입.

## Dependencies
```javascript
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, CATEGORY_DATA, CATEGORY_NAV, TACTIC_COLORS } from '../data/basics-categories';
import './BasicsPage.css';
```

## State Variables
```javascript
const [currentCategory, setCurrentCategory] = useState('network_web');
const [viewMode, setViewMode] = useState('grid');       // grid | list
const [searchQuery, setSearchQuery] = useState('');
const [sortOrder, setSortOrder] = useState('none');       // none | desc | asc
const [modalCard, setModalCard] = useState(null);         // 클릭한 카드 상세
const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
```

## Data Source: basics-categories.js
```javascript
// 카테고리 정의
export const CATEGORIES = {
  network_web: { label: '네트워크/웹', icon: '🌐', color: 'blue' },
  os_system:   { label: 'OS/시스템',   icon: '🖥️', color: 'green' },
  security:    { label: '보안 기초',   icon: '🔒', color: 'red' },
  tools:       { label: '도구/실습',   icon: '🔧', color: 'purple' },
};

// 카테고리별 카드 데이터
export const CATEGORY_DATA = {
  network_web: [
    {
      id: 'nw-001',
      title: 'TCP/IP 기초',
      titleEn: 'TCP/IP Basics',
      description: 'TCP/IP 프로토콜 스택의 4계층...',
      difficulty: 1,        // 1-5 별 난이도
      estimatedMinutes: 15,
      tags: ['TCP', 'IP', 'OSI'],
      tactics: ['t9'],      // MITRE 택틱 연관
      status: 'coming-soon', // available | coming-soon
    },
    // ... 더 많은 카드
  ],
  os_system: [...],
  security: [...],
  tools: [...],
};

// 사이드바 네비게이션
export const CATEGORY_NAV = [
  { key: 'network_web', label: '네트워크/웹', icon: '🌐' },
  { key: 'os_system',   label: 'OS/시스템',   icon: '🖥️' },
  { key: 'security',    label: '보안 기초',   icon: '🔒' },
  { key: 'tools',       label: '도구/실습',   icon: '🔧' },
];
```

## Features

### Search
```javascript
const filtered = useMemo(() => {
  let cards = CATEGORY_DATA[currentCategory] || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    cards = cards.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.titleEn.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (sortOrder !== 'none') {
    cards = [...cards].sort((a, b) =>
      sortOrder === 'asc' ? a.difficulty - b.difficulty : b.difficulty - a.difficulty
    );
  }
  return cards;
}, [currentCategory, searchQuery, sortOrder]);
```

### View Modes
```
Grid: 3-4 컬럼 카드 그리드 (반응형)
List: 1컬럼 리스트 (상세 정보 표시)
```

### Difficulty Rating
```
⭐ (1) → 매우 쉬움
⭐⭐ (2) → 쉬움
⭐⭐⭐ (3) → 보통
⭐⭐⭐⭐ (4) → 어려움
⭐⭐⭐⭐⭐ (5) → 매우 어려움
```

### Card Modal
```
카드 클릭 → modalCard 설정 → 모달 오버레이
- 카드 제목 + 설명
- 난이도 + 예상 시간
- 연관 MITRE 택틱 배지
- 학습 시작 버튼 (status: available인 경우)
- "준비 중" 메시지 (status: coming-soon)
```

## Rendering Structure
```
<div class="min-h-screen flex">
  <!-- 좌측 사이드바 -->
  <aside class="w-64">
    <Logo />
    <nav>
      {CATEGORY_NAV.map(cat => (
        <button class={currentCategory === cat.key ? 'active' : ''}>
          {cat.icon} {cat.label}
        </button>
      ))}
    </nav>
  </aside>

  <!-- 메인 콘텐츠 -->
  <main class="flex-1">
    <!-- 헤더: 검색 + 뷰 토글 + 정렬 + 다크모드 -->
    <header>
      <SearchInput />
      <ViewToggle grid|list />
      <SortButton none|asc|desc />
      <DarkToggle />
      <ProgressBar />
    </header>

    <!-- 카드 그리드/리스트 -->
    <div class={viewMode === 'grid' ? 'grid grid-cols-3' : 'flex flex-col'}>
      {filtered.map(card => <CardComponent />)}
    </div>
  </main>

  <!-- 카드 모달 -->
  {modalCard && <CardDetailModal card={modalCard} onClose={() => setModalCard(null)} />}
</div>
```

## Navigation Context
```
/learning-path → "자율 학습" → /basics (이 페이지)
/basics 내에서:
  - 카테고리 전환 (사이드바)
  - 카드 클릭 → 모달 (상세)
  - "학습 시작" → (현재 대부분 coming-soon)
```

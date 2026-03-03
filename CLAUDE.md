# Claude Code Rules

**GOAL:** Risk mitigation & Clarity.
**LANG:** Output in Korean (except code).

Before writing code, MUST output the following steps using XML tags:

<analysis>
1. PREMISES: [List 3 knowns]
2. UNKNOWNS: [List 3 missing info & how to verify]
3. RISKS: [List 3 major risks]
</analysis>

<plan>
- SIMPLEST_FORM: [Describe]
- COMPLEXITY_REASON: [If complex, justify]
- ROLLBACK_EASE: [Compare options]
- ALTERNATIVES: [List 2 simpler options with verification steps]
- SAFETY_NET: Simplify complex outputs to reduce future maintenance.
</plan>

<scope>
- PURPOSE: [1 sentence]
- SCOPE_CREEP: [Yes/No. If Yes, separate it]
- BOUNDARY: [Define clear limits, e.g., "UI text only, no logic change"]
</scope>

<criteria>
- SUCCESS: [Definition of success]
- DONE_CONDITION: [What to check to finish]
- FAILURE_SIGNS: [Triggers for rollback]
</criteria>

**MANDATORY:** Always append this exact sentence at the very end of your final response:
"왜 그렇게 했는지 설명해줘"

---

## 공지사항 자동 업데이트 규칙

**업데이트 완료 후**, 관리자 공지사항(`announcements` 테이블)에 변경 사항을 **사용자 친화적으로** 등록해야 합니다.

### 작성 규칙
1. **기술 용어 최소화**: 사용자가 이해할 수 있는 쉬운 표현 사용
2. **버전 번호 포함**: `v0.x.x` 형식 (현재 최신: v0.5.0)
3. **변경 내용 요약**: "무엇이 좋아졌는지" 관점으로 작성
4. **다국어 지원**: 한국어 기본, 필요 시 영어 병기
5. **카테고리**: 🆕 새 기능 / 🔧 개선 / 🛡️ 보안 / 🐛 버그 수정

### 작성 예시
```
📢 v0.5.0 업데이트 안내

🆕 새 기능
- 실습 페이지 편집 기능이 추가되었습니다 (관리자 전용)
- 시뮬레이션 시나리오가 5개 언어로 번역되었습니다

🔧 개선
- 코드 편집기에 구문 강조(Syntax Highlighting)가 적용되었습니다
- 미리보기가 더 안전하게 동작합니다

🛡️ 보안
- 저장 시 위험한 스크립트가 자동으로 필터링됩니다
- 관리자 작업이 감사 로그에 기록됩니다
```

### 버전 히스토리
| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| v0.4.0 | 2026-02-28 | 커뮤니티 피드백, 이모지 피커, 대댓글 시스템 |
| v0.5.0 | 2026-03-01 | 실습 에디터, Prism.js 코드 하이라이팅, DOMPurify XSS 필터링, 감사 로깅, 5개 언어 번역 완성 |
| v0.7.0 | 2026-03-03 | 히어로 섹션 MITRE ATT&CK 사고 매트릭스 교체, 다크모드+SVG 일러스트, MatrixShowcase 줌/TTP 체인 |
| v0.7.1 | 2026-03-03 | 히어로 5전술×8사고 축소, 배경영상 opacity 0.28, 투어 무한루프, INTRO 버튼, 로그아웃→히어로 |

---

## ⚠️ Claude 작업 시 주의사항 (실수 기록 기반)

과거 세션에서 발생한 실수를 반복하지 않기 위한 규칙입니다.

### 1. 파일 수정 범위를 정확히 지킬 것
- **사건**: 사용자가 "showcase만 없애라"고 했는데, IntroMatrix.jsx까지 되돌려서 다른 작업물이 날아감
- **규칙**: 사용자가 명시한 파일/범위만 수정. 관련 파일이라도 명시적 허가 없이 변경 금지
- **확인 방법**: 수정 전 "이 파일들만 수정합니다: [목록]" 형태로 범위 명시

### 2. 대규모 횡단 작업은 먼저 범위를 확인할 것
- **사건**: "베트남어/아랍어 추가해줘" 요청에 즉시 10+개 파일 탐색 Agent를 실행 → 사용자가 "야 그냥 하지마 스탑" → 컨텍스트 낭비
- **규칙**: 10개 이상 파일에 영향을 미치는 작업은 먼저 영향 범위와 소요 시간을 알려주고, 사용자 확인 후 시작
- **확인 방법**: "약 [N]개 파일 수정 필요, 진행할까요?" 물어보기

### 3. 시각적 수치(opacity, 색상 등)는 사용자에게 구체적 값을 물어볼 것
- **사건**: 배경 영상 opacity를 0.08 → 0.18 → 0.28로 3번 반복 수정 (사용자가 매번 "안보인다" 피드백)
- **규칙**: 시각적 수치 조정 시 "현재 0.08인데, 어느 정도로 올릴까요? (0.2? 0.3? 0.5?)" 식으로 구체적 선택지 제공
- **확인 방법**: 임의로 조금만 올리지 말고, 충분한 변화폭의 옵션을 제시

### 4. heroPhase 리셋 시 반드시 setHeroPhase('entering') 호출
- **사건**: 로그아웃 시 localStorage만 지우고 setHeroPhase를 호출하지 않아 히어로가 표시되지 않음
- **규칙**: 히어로를 다시 보여주려면 반드시 `setHeroPhase('entering')` + `localStorage.removeItem('gotroot_intro_seen')` 둘 다 실행
- **확인 방법**: 히어로 복귀 관련 코드에서 두 가지 모두 있는지 검증

### 5. CSS !important를 inline style과 충돌하는 곳에 사용하지 말 것
- **사건**: 다크 모드 CSS에 `!important`를 넣어서 인라인 tactic 색상이 덮어씌워짐
- **규칙**: 인라인 스타일을 사용하는 컴포넌트에는 CSS `!important` 사용 금지. Tailwind 유틸리티 또는 인라인 스타일로 통일
- **확인 방법**: 기존 스타일링 방식(인라인 vs CSS)을 먼저 확인 후 같은 방식 사용

### 6. 모든 변경 후 반드시 빌드 검증
- **규칙**: 코드 수정 완료 후 `npm run build` 성공 확인 필수
- **확인 방법**: 빌드 실패 시 즉시 수정, 빌드 성공 로그 확인

### 7. 컨텍스트 효율적 사용
- **규칙**: 큰 파일 전체를 반복적으로 읽지 말 것. 필요한 부분만 offset/limit으로 읽기
- **규칙**: Task Agent 실행 전 정말 필요한지 판단. 간단한 검색은 Grep/Glob으로 충분
- **규칙**: 사용자가 "스탑"이라고 하면 즉시 중단, 진행 중인 Agent도 멈추기
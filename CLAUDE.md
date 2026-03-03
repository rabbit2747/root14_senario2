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
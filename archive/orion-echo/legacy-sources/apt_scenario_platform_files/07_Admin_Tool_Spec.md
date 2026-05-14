# 관리자 시나리오 제작 도구 명세

## 1. 목적

관리자 도구는 LLM이 생성한 Scenario JSON을 제작자가 검수하고 수정한 뒤, 수강생에게 배포할 수 있게 하는 화면이다.

## 2. 주요 사용자

- 보안 교육 강사
- 콘텐츠 제작자
- 기업 교육 담당자
- 플랫폼 운영자

## 3. 핵심 흐름

```text
시나리오 입력
→ LLM 생성
→ JSON 검증
→ 인프라 맵 미리보기
→ 단계별 활성화 검수
→ 설명/퀴즈 수정
→ 저장
→ 배포
```

## 4. 주요 화면

### 4.1 시나리오 생성 화면

입력 필드:

- 시나리오 이름
- 대상 학습자
- 시나리오 개요
- 기업/조직 구조
- 필수 포함 인프라
- 사고/공격 흐름
- 반드시 보여줘야 하는 단계
- 방어 관점 강조 사항
- 난이도

버튼:

- LLM으로 시나리오 생성
- 템플릿 불러오기
- 기존 시나리오 복제

### 4.2 JSON 검증 화면

표시 항목:

- Schema validation 결과
- 누락된 필드
- 잘못된 참조
- activeNodes 참조 오류
- activeEdges 참조 오류
- zoneId 참조 오류
- 콘텐츠 안전성 경고

버튼:

- 자동 보정 요청
- 직접 수정
- 다시 생성

### 4.3 인프라 맵 미리보기 화면

구성:

```text
[좌측] Scenario Tree
- Zones
- Nodes
- Edges
- Steps

[중앙] React Flow Preview
- 자동 배치된 인프라 맵
- 단계별 활성화 미리보기

[우측] 선택 항목 속성 편집
- 노드 정보
- 엣지 정보
- 단계 설명
- 퀴즈
```

### 4.4 단계별 활성화 검수 화면

기능:

- Step 선택
- activeNodes 확인
- activeEdges 확인
- eventMarkers 확인
- 단계 설명 수정
- 방어 관점 설명 수정
- 퀴즈 수정

### 4.5 배포 화면

기능:

- 시나리오 상태 변경: draft → needs_review → approved → published
- 과정에 연결
- 태그 설정
- 버전 메모 작성
- 공개 대상 설정

## 5. 검수 체크리스트

시나리오 배포 전 제작자가 확인해야 하는 항목:

- 모든 단계가 학습 흐름상 자연스러운가?
- 각 단계에서 활성화된 노드가 적절한가?
- 각 단계에서 활성화된 엣지가 적절한가?
- 기업망 경계와 DMZ/내부망 구분이 명확한가?
- 실제 공격 악용 절차가 포함되어 있지 않은가?
- 방어 관점 설명이 충분한가?
- 퀴즈 정답이 명확한가?
- 수강생이 처음 봐도 흐름을 이해할 수 있는가?

## 6. 데이터 상태

```ts
type ScenarioStatus = 'draft' | 'needs_review' | 'approved' | 'published' | 'archived'
```

## 7. 버전 관리

시나리오가 수정될 때마다 버전을 남긴다.

```ts
type ScenarioVersion = {
  scenarioId: string
  version: number
  createdAt: string
  createdBy: string
  changeSummary: string
  jsonSnapshot: Scenario
}
```

## 8. 권한 모델

| 권한 | 가능 작업 |
|---|---|
| viewer | 시나리오 보기 |
| editor | 시나리오 생성/수정 |
| reviewer | 검수/승인 |
| admin | 배포/삭제/권한 관리 |

## 9. 관리자 도구에서 필요한 보조 기능

- JSON Diff 보기
- 단계별 미리보기 자동재생
- 노드 검색
- 특정 노드가 등장하는 단계 찾기
- 특정 엣지가 활성화되는 단계 찾기
- 시나리오 복제
- 시나리오 내보내기/import
- LLM 재생성 요청
- LLM 부분 수정 요청

## 10. LLM 부분 수정 예시

```text
현재 시나리오의 steps만 수정해줘.
조건:
- 기존 zones, nodes, edges는 유지
- Initial Access 단계에서 attacker-pc와 web-server만 활성화
- Detection 단계에서 siem, edr, web-server를 활성화
- 출력은 전체 Scenario JSON으로 반환
```

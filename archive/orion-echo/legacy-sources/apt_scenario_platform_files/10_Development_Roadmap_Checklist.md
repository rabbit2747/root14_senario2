# 개발 로드맵 및 체크리스트

## 1. 목표

시나리오 입력 → LLM JSON 생성 → 검증 → 자동 배치 → React Flow 렌더링 → 단계별 활성화 → 수강생 학습까지 이어지는 end-to-end 흐름을 만든다.

## 2. Phase 0. 준비

- [ ] 기술 스택 확정
- [ ] 디자인 톤앤매너 확정
- [ ] 시나리오 JSON 스키마 확정
- [ ] LLM Prompt Template 확정
- [ ] 노드 타입 목록 확정
- [ ] 엣지 타입 목록 확정
- [ ] 이벤트 마커 타입 확정
- [ ] 콘텐츠 안전성 기준 확정

## 3. Phase 1. Frontend 기반

- [ ] Next.js 프로젝트 생성
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] React Flow 설치
- [ ] Zustand 또는 XState 설치
- [ ] 기본 라우팅 구성
- [ ] 샘플 시나리오 JSON 로딩
- [ ] ScenarioPlayer 기본 화면 구성

## 4. Phase 2. React Flow Renderer

- [ ] ZoneGroupNode 구현
- [ ] BaseInfraNode 구현
- [ ] AttackerPcNode 구현
- [ ] ServerNode 구현
- [ ] DatabaseNode 구현
- [ ] FirewallNode 구현
- [ ] SecurityNode 구현
- [ ] CloudServiceNode 구현
- [ ] AnimatedTrafficEdge 구현
- [ ] BoundaryCrossingEdge 구현
- [ ] DetectionEdge 구현
- [ ] EventMarker 렌더링 구현

## 5. Phase 3. Scenario Engine

- [ ] Scenario JSON 타입 정의
- [ ] Zod Schema 작성
- [ ] 참조 무결성 검사 함수 작성
- [ ] normalizeScenario 함수 작성
- [ ] scenarioToFlow 함수 작성
- [ ] applyStepState 함수 작성
- [ ] currentStep 상태 관리
- [ ] nextStep / prevStep 구현
- [ ] 자동재생 구현
- [ ] 이전 단계 히스토리 표시 구현

## 6. Phase 4. Layout Engine

- [ ] layoutZones 구현
- [ ] enterprise-network 레이아웃 구현
- [ ] cloud-hybrid 레이아웃 구현
- [ ] partner-supply-chain 레이아웃 구현
- [ ] zone 내부 grid 배치 구현
- [ ] layoutRole 기반 정렬 구현
- [ ] node.type 기반 위치 보정 구현
- [ ] 충돌 검사 구현
- [ ] 경계 밖 노드 보정 구현
- [ ] viewport fitView 처리

## 7. Phase 5. LLM Generation Pipeline

- [ ] 프롬프트 템플릿 저장 구조 구현
- [ ] LLM 호출 API 구현
- [ ] JSON parse 처리
- [ ] Zod 검증 연결
- [ ] 오류 발생 시 repair prompt 연결
- [ ] 콘텐츠 안전성 검사
- [ ] 생성 결과 저장
- [ ] 재생성 기능 구현
- [ ] 부분 수정 기능 구현

## 8. Phase 6. Admin Tool

- [ ] 시나리오 생성 폼
- [ ] LLM 생성 버튼
- [ ] JSON 보기/편집기
- [ ] 검증 결과 패널
- [ ] 미리보기 화면
- [ ] 단계별 활성화 검수 화면
- [ ] 노드/엣지 검색
- [ ] 배포 상태 변경
- [ ] 버전 저장
- [ ] 시나리오 복제

## 9. Phase 7. Learning Experience

- [ ] 수강생 시나리오 목록
- [ ] 시나리오 상세 페이지
- [ ] Step 설명 패널
- [ ] 공격 관점/방어 관점 전환
- [ ] 퀴즈 표시
- [ ] 퀴즈 채점
- [ ] 진도 저장
- [ ] 완료 처리
- [ ] 학습 리포트

## 10. Phase 8. 품질 개선

- [ ] 노드 디자인 고도화
- [ ] 엣지 애니메이션 고도화
- [ ] 이벤트 마커 디자인 고도화
- [ ] 다크 모드
- [ ] 반응형 레이아웃
- [ ] 접근성 개선
- [ ] 키보드 조작 지원
- [ ] 시나리오 로딩 skeleton
- [ ] 오류 상태 UX 개선

## 11. Phase 9. 운영 기능

- [ ] 인증/권한
- [ ] 과정 관리
- [ ] 기업별 테넌트 관리
- [ ] 수강생 관리
- [ ] 학습 진도 대시보드
- [ ] 관리자 감사 로그
- [ ] 콘텐츠 버전 관리
- [ ] 백업/복구

## 12. MVP 완료 기준

- [ ] 샘플 Scenario JSON이 정상 렌더링된다.
- [ ] 외부망, 기업망, DMZ, 내부망, 보안 영역이 구분되어 보인다.
- [ ] 각 단계에서 activeNodes가 강조된다.
- [ ] 각 단계에서 activeEdges가 애니메이션으로 표시된다.
- [ ] eventMarkers가 노드 또는 엣지 위에 표시된다.
- [ ] 설명 패널이 currentStep과 동기화된다.
- [ ] LLM이 생성한 JSON을 검증할 수 있다.
- [ ] 오류가 있는 JSON을 사용자에게 명확히 보여준다.
- [ ] 관리자 미리보기에서 시나리오를 검수할 수 있다.
- [ ] 수강생이 처음부터 끝까지 하나의 시나리오를 학습할 수 있다.

## 13. 첫 번째 개발 스프린트 추천 범위

### Sprint 1: 1~2주

- Next.js 프로젝트 세팅
- React Flow 기본 화면
- 샘플 JSON 로딩
- ZoneGroupNode
- BaseInfraNode
- AnimatedTrafficEdge
- Step Controller

### Sprint 2: 1~2주

- Layout Engine 1차
- active state 적용
- event marker
- 설명 패널
- 퀴즈 표시

### Sprint 3: 1~2주

- LLM Prompt 연결
- JSON 검증
- Admin 생성 화면
- Preview 저장
- 오류 보정 흐름

### Sprint 4: 1~2주

- 관리자 검수 도구
- 수강생 진도 저장
- 디자인 고도화
- 베타 테스트

## 14. 개발 우선순위

1. 수강생이 보는 시나리오 플레이어
2. Scenario JSON Schema
3. Layout Engine
4. Step Activation Engine
5. LLM 생성 파이프라인
6. 관리자 검수 도구
7. 학습 진도/퀴즈
8. 운영/관리 기능

## 15. 피해야 할 접근

- [ ] LLM이 매번 React 코드를 생성하게 하기
- [ ] LLM이 좌표를 전부 직접 찍게 하기
- [ ] 시나리오마다 화면을 하드코딩하기
- [ ] 공격 절차를 지나치게 구체화하기
- [ ] 수강생 화면과 관리자 편집기를 하나의 복잡한 화면으로 섞기
- [ ] 모든 엣지를 항상 애니메이션으로 돌리기
- [ ] 검증 없이 LLM 출력물을 바로 배포하기

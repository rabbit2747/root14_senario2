# APT Curriculum Redesign

이 디렉토리는 ROOT14 / GOTROOT APT 공격 시나리오 학습 흐름을 다시 설계하기 위한 문서 모음이다.

현재 플랫폼은 여러 레포와 여러 화면이 연결되어 있으며, 일부는 실험적으로 구현되어 있어 전체 설계가 한눈에 보이지 않는다. 이 문서들은 현재 구조를 먼저 고정하고, 이후 개발하기 좋은 템플릿 기반 구조로 옮기기 위한 기준점이다.

## 문서 목록

| 문서 | 목적 |
| --- | --- |
| [01-current-map.md](01-current-map.md) | 현재 learning-path 기반 APT 커리큘럼 구조 파악 |
| [02-problems.md](02-problems.md) | 현재 구조의 문제점과 리스크 정리 |
| [03-target-architecture.md](03-target-architecture.md) | 앞으로 가야 할 목표 아키텍처 |
| [04-scenario-template.md](04-scenario-template.md) | 어떤 시나리오가 와도 같은 형식으로 구현하기 위한 템플릿 규격 |
| [05-repo-responsibilities.md](05-repo-responsibilities.md) | 레포별 책임 범위와 수정 금지 경계 |
| [06-refactor-roadmap.md](06-refactor-roadmap.md) | 단계별 리팩터링 실행 계획 |
| [07-concept-class-design.md](07-concept-class-design.md) | Concept Class와 2D Network Boundary Map 설계 |

## 핵심 결론

현재 APT 공격 시나리오 학습은 완전한 템플릿 시스템이 아니다.

일부 화면은 데이터 기반으로 움직이지만, Orion Echo 중심 흐름은 전용 route, 전용 component, 전용 JSON, 전용 3D player가 섞여 있다. 따라서 새 APT 시나리오가 들어오면 아직은 같은 형식으로 자동 생성되지 않고, 기존 구현을 복제하거나 직접 route를 추가해야 한다.

목표는 `caseId`를 중심으로 한 단일 시나리오 manifest를 만들고, 각 레포와 화면이 그 manifest를 자기 역할에 맞게 렌더링하도록 바꾸는 것이다.

교육 흐름에서는 Legacy 3D를 인프라 학습의 본편으로 사용하지 않는다. Legacy 3D는 공격 흐름을 감각적으로 보여주는 오프닝 역할로 두고, 실제 개념 교육은 2D Network Boundary Map 기반 Concept Class에서 수행한다.

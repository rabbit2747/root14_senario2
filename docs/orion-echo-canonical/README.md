# Orion Echo Canonical Scenario

이 디렉토리는 Orion Echo 교육 커리큘럼의 정본을 관리한다. 앞으로 Concept Class, Practical 3D, Hands-on Lab, Dark Web Impact는 이 문서를 기준으로 맞춘다.

## 정본 기준

- Scenario ID: `operation-orion-echo`
- Scenario Slug: `orion-echo`
- 핵심 사건: Orion Echo Systems의 EchoAgent 업데이트 공급망을 통해 ANRC 고객 환경까지 영향이 이어지는 공급망 공격
- 학습 목표: 공격 순서를 외우는 것이 아니라, 신뢰 경계와 증거 지점을 연결해서 사건을 설명할 수 있게 만드는 것

## 현재 기준 자료

| 구분 | 경로 | 역할 |
| --- | --- | --- |
| 설계 기준 | `senario/09_platform/v2` | 시나리오 의도, 단계 설계, C2 제거 방향 |
| Practical 3D 기준 | `senario/09_platform/mvp` | 최종 3D 토폴로지와 `/three/orion_2` 화면 |
| Lab 기준 | `hands-on lab/orion-echo-hands-on-lab` | 학생이 직접 실행할 Docker 실습 패키지 |
| Web Curriculum 기준 | `src/pages/apt/orion-echo/data/orion-echo-curriculum.js` | learning-path에서 사용하는 커리큘럼 데이터 |

## 문서 구성

- `scenario-canonical.md`: 사람이 읽는 정본 시나리오 설명
- `canonical-scenario-manifest.json`: 템플릿화와 구현에 사용할 정본 데이터 구조
- `open-decisions.md`: 아직 하나로 정해야 하는 불일치 항목

## Archive 기준

헷갈림을 만들던 초기 설계안과 중복 lab은 `archive/orion-echo`로 이동했다. 삭제하지 않고 보존한 이유는, 나중에 구현 히스토리나 과거 자료가 필요할 수 있기 때문이다.

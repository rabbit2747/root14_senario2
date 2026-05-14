# Orion Echo Archive

이 디렉토리는 현재 정본 커리큘럼에서 직접 사용하지 않는 Orion Echo 관련 과거 자료를 보존한다. 삭제가 아니라 격리다.

## 이동된 항목

| Archive 경로 | 원래 경로 | 이유 |
| --- | --- | --- |
| `legacy-sources/apt_scenario_platform_files` | `senario/09_platform/apt_scenario_platform_files` | 초기 플랫폼/템플릿 설계안. 현재 Orion Echo 정본과 직접 연결되지 않아 혼선을 만든다. |
| `legacy-sources/senario_1` | `senario/09_platform/senario_1` | 구버전 scenario/lab 설계. C2, flag, 초기 demo 흐름이 현재 정본과 충돌한다. |
| `legacy-labs/root14_senario2-main` | `hands-on lab/root14_senario2-main` | 원본 lab 복제본과 중첩 복제본이 포함되어 있어 현재 실습 기준과 혼동된다. 정리된 실습은 `hands-on lab/orion-echo-hands-on-lab`를 사용한다. |

## 현재 작업선에 남긴 항목

| 경로 | 이유 |
| --- | --- |
| `senario/09_platform/v2` | 정본 설계 방향의 핵심 참고자료 |
| `senario/09_platform/mvp` | 최종 Practical 3D MVP 구현 |
| `hands-on lab/orion-echo-hands-on-lab` | 현재 커리큘럼에 맞춰 재구성한 hands-on lab |
| `docs/orion-echo-canonical` | 앞으로의 단일 정본 문서 |

## 사용 규칙

- 새 기능이나 교육 페이지를 만들 때 archive 자료를 직접 기준으로 삼지 않는다.
- archive 자료에서 쓸 내용이 있으면 먼저 `docs/orion-echo-canonical`에 반영한 뒤 사용한다.
- archive 안의 파일은 히스토리 확인용으로 보존한다.

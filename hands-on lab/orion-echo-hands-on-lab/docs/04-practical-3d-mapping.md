# 04. Practical 3D and Hands-on Lab Mapping

## 목적

Practical 3D는 topology 기반 워크스루이고, Hands-on Lab은 직접 수행 실습입니다.

두 단계는 같은 사건을 다루지만, granularity가 다릅니다.

- Practical 3D: 학습자가 “어느 시스템과 망 경계를 통과하는가”를 이해한다.
- Hands-on Lab: 학습자가 직접 요청을 보내고, 응답과 로그를 근거로 판단한다.

## 전체 매핑

| Practical 3D 단계 | Hands-on Lab 단계 | 비고 |
| --- | --- | --- |
| Stage 0. 공개 표면 정찰 | Lab Stage 0. Recon | 거의 1:1 |
| Stage 1. Support Portal 초기 접근 | Lab Stage 1. Initial Access | 거의 1:1 |
| Stage 2. Foothold 확인과 작전 채널 등록 | Lab Stage 2. Foothold Orientation + Stage 3. Safe C2 | lab이 더 세분화됨 |
| Stage 3. 내부 서비스 탐색 | Lab Stage 4. Internal Discovery | 거의 1:1 |
| Stage 4. Wiki/Ticket/Repo 단서 수집 | Lab Stage 5. Evidence Collection | 거의 1:1 |
| Stage 5. 빌드 권한 단서로 Artifact 생성 | Lab Stage 6. Build Token Use + Stage 7. Artifact Build | lab이 더 세분화됨 |
| Stage 6. 서명과 ANRC 채널 Publish | Lab Stage 8. Sign & Publish | 거의 1:1 |
| Stage 7. 고객 앱의 Trusted Update 적용 | Lab Stage 9. Customer Trusted Update | 거의 1:1 |
| Stage 8. 고객 Export 식별과 정보 유출 시뮬레이션 | Lab Stage 10. Customer Export and Final Object | lab이 export와 final object를 함께 수행 |
| Stage 10. Customer Data Exfiltration To Dark Web | Lab Stage 11. Dark Web Impact | 정본 최종 영향 단계 |

## 권장 정렬 방식

현재 lab이 Practical 3D보다 더 실습 단위가 명확합니다.

따라서 최종 교육 설계에서는 다음 방향을 권장합니다.

```text
Practical 3D = lab의 큰 흐름을 미리 보여주는 topology preview
Hands-on Lab = lab stage manifest를 기준으로 실제 수행
Dark Web Impact = customer export file, object access proof, supervisor drop verdict, dark-web drop record를 연결한 최종 영향
```

## 망 경계 매핑

| 망 경계 | Practical 3D | Hands-on Lab Docker network |
| --- | --- | --- |
| External / Internet | operator, edge-proxy | public_net |
| DMZ | public-site, public-docs, support-portal, vendor-portal | dmz_net |
| Corporate Internal | corp-sso, wiki, ticket, docs, mail | corp_net |
| DevOps | source-repo, build-server | dev_net |
| Release Trust Zone | signing-service, update-server | release_net |
| Customer Environment | customer-app, customer-api, object-store, monitoring | customer_net |
| Control / Audit / Leak | c2-emulator, grading-service, audit-log, dark-web-drop | control_net |

## 명칭 정리 필요 사항

현재 Practical 3D 데이터에는 `evidence-vault` 노드가 있고, lab에는 `grading-service`가 있습니다.

최종 정합성을 위해 둘 중 하나로 맞춰야 합니다.

권장:

```text
grading-service = instructor-only 내부 채점 토큰 발급/검증
audit-log = 이벤트 증거 저장
evidence-vault = 화면/교육용 명칭으로만 사용하거나 제거
```

즉 실습 시스템 기준으로는 `grading-service`와 `audit-log`를 사용하고, `evidence-vault`는 별도 서비스가 아니라 `audit-log`의 교육적 표현으로 처리하는 것이 좋습니다.

## URL/포트 정리

실제 구현 기준:

```text
edge-proxy: http://localhost:28081
internal services: http://{service-name}:8000
c2-emulator: http://c2-emulator:8000
```

주의:

기존 설계 문서 일부에는 `c2-emulator:7300`이 남아 있습니다. 현재 실행 코드는 `8000` 기준이므로 새 문서와 플랫폼 manifest는 `8000`만 사용합니다.



# Orion Echo 정본 시나리오

## 한 문장 요약

Orion Echo는 ANRC 고객망을 직접 침입하는 시나리오가 아니라, ANRC가 신뢰하는 Orion Echo Systems의 EchoAgent 빌드, 서명, 업데이트 공급망을 악용해 고객 환경까지 영향이 이어지는 실무형 공급망 공격 학습 시나리오다.

## 등장 조직

| 조직 | 역할 |
| --- | --- |
| Orion Echo Systems | EchoAgent를 개발하고 배포하는 벤더 |
| ANRC | EchoAgent 업데이트를 신뢰하고 받아들이는 고객사 |
| Red Team Operator | 학습자가 맡는 관점. 공격 흐름을 실행하고 증거를 수집한다. |
| External Leak Site | 고객 데이터가 최종적으로 외부 유출되는 지점 |

## 핵심 교육 메시지

이 시나리오의 핵심은 “고객사를 직접 뚫지 않아도 고객에게 도달할 수 있다”는 점이다. 공급망 공격에서는 취약한 웹 진입점, 내부 업무 문서, DevOps 자동화 토큰, 빌드 서버, 서명 서비스, 업데이트 채널, 고객사의 신뢰 관계가 하나의 공격 경로로 이어진다.

학생은 다음 질문에 답할 수 있어야 한다.

- 공격자는 어느 경계에서 다음 경계로 이동했는가?
- 각 단계에서 어떤 시스템이 신뢰를 제공했는가?
- 그 신뢰는 왜 공격자에게 유리하게 작동했는가?
- 방어자는 어떤 로그와 산출물을 연결해서 사건을 재구성해야 하는가?

## 정본 인프라 경계

```text
Internet / Operator
  -> Edge Proxy / WAF
  -> DMZ Public Services
  -> Corporate Internal
  -> DevOps Network
  -> Release Trust Chain
  -> ANRC Customer Environment
  -> External Leak Site
```

| Zone | 주요 시스템 | 학습 포인트 |
| --- | --- | --- |
| Internet / Operator | operator | 공격 시작점, 공개 정보 수집 |
| DMZ Public Services | edge-proxy, public-site, public-docs, support-portal, vendor-portal | 공개 노출면, support portal 초기 접근 |
| Corporate Internal | corp-sso, wiki, ticket-service, doc-portal, mail-web | 내부 지식, SSO, 티켓, 운영 문서 |
| DevOps Network | source-repo, build-server | 빌드 토큰, release branch, CI/CD 자동화 |
| Release Trust Chain | signing-service, update-server | 서명, manifest, update channel |
| ANRC Customer Environment | customer-app, customer-api, object-store, monitoring | 고객 신뢰, 업데이트 적용, 데이터 접근 |
| External Leak Site | dark-web-drop, leak-bundle | 고객 데이터가 조직 외부로 유출되는 최종 영향 |

## 정본 학습 흐름

| 순서 | 세션 | 목적 |
| --- | --- | --- |
| 1 | Mission Briefing | 사건 배경, 역할, 목표를 잡는다. |
| 2 | Legacy 3D Overview | 기존 3D 세션으로 전체 공격 분위기와 단계 전환을 먼저 체감한다. |
| 3 | Concept Class | supply chain, trust, token, CI/CD, signing, evidence를 인프라 경계 위에서 학습한다. |
| 4 | Practical Case Review | 개념을 Orion Echo 사건에 다시 연결하고 어떤 증거를 봐야 하는지 정리한다. |
| 5 | Practical 3D | MVP 3D 토폴로지에서 각 단계가 어느 시스템과 경계를 통과하는지 확인한다. |
| 6 | Hands-on Lab | Docker lab에서 명령어를 실행하고 실제 응답, 로그, 산출물을 확인한다. |
| 7 | Dark Web Impact | 고객 데이터가 외부 유출 지점까지 이동하는 최종 영향을 확인한다. |

## 정본 공격 단계

| Stage | 이름 | 공격자 행동 | 학생이 확인할 증거 |
| --- | --- | --- | --- |
| 0 | Public Recon | 공개 페이지, docs, build-info에서 제품과 고객 단서를 찾는다. | product/version, release note, ANRC channel reference |
| 1 | Support Portal Initial Access | support portal의 Jinja2 draft preview SSTI를 확인하고 guarded diagnostic helper로 foothold를 만든다. | 49 arithmetic render, preview audit, post-exploit marker |
| 2 | Foothold Validation | 현재 권한, hostname, 작업 경로, 네트워크 컨텍스트를 확인한다. | id, hostname, resolver/network context |
| 3 | Internal Service Discovery | 내부 wiki, ticket, source-repo, build-server 등 접근 가능한 서비스를 찾는다. | service list, health endpoint, route evidence |
| 4 | Internal Knowledge Collection | wiki, ticket, repo, mail/docs에서 release 운영 지식을 수집한다. | runbook, OES ticket, release pipeline metadata |
| 5 | Build Credential Discovery | build trigger token, branch, channel, artifact naming rule을 식별한다. | token context, release branch, channel evidence |
| 6 | Build Server API Abuse | build token으로 build job을 생성한다. | HTTP 202, build job id, acceptance marker |
| 7 | Artifact Build Review | 생성된 artifact와 metadata/hash를 확인한다. | artifact id, hash, build marker |
| 8 | Sign and Publish | artifact를 서명하고 ANRC update channel에 publish한다. | signed manifest, signing log, update manifest |
| 9 | Customer Trusted Update | ANRC customer app이 vendor update channel을 신뢰해 업데이트를 적용한다. | customer poll response, update applied event |
| 10 | Customer Export Access | customer API와 object store 접근 흔적을 확인한다. | export detail, presigned URL, object access |
| 11 | Customer Data Exfiltration To Dark Web | 확보한 고객 export 파일을 supervised drop simulator에 제출하고 최종 impact를 확인한다. | dropped file, supervisor verdict, dark-web drop record, exposed customer dataset |

## Concept Class에서 반드시 설명해야 하는 개념

| 개념 | 이 시나리오에서의 의미 |
| --- | --- |
| Supply Chain Attack | 고객이 신뢰하는 공급자, 빌드, 배포 경로를 오염시키는 공격 |
| Trust Boundary | DMZ, 내부망, DevOps, Release, Customer 사이에서 신뢰가 넘어가는 지점 |
| Token / SSO | 사람 계정이 아니라 자동화/서비스 권한이 공격 경로가 되는 이유 |
| CI/CD | 코드와 빌드 산출물이 만들어지고 배포 준비가 되는 자동화 공정 |
| Signing | 산출물이 공식 배포물로 인정받는 신뢰 표시 |
| Update Channel | 고객이 vendor update를 정상으로 받아들이는 배포 경로 |
| Evidence | 각 단계가 실제로 발생했음을 설명하는 로그, 응답, 산출물 |

## 구현 원칙

- Concept Class는 추상 개념만 설명하지 않는다. 각 개념을 Orion Echo 인프라의 특정 zone과 연결한다.
- Practical 3D는 topology와 단계 흐름을 보여주는 시각적 이해 도구로 둔다.
- Hands-on Lab은 학생이 직접 명령어를 실행하고 결과를 해석하는 실습 단계로 둔다.
- 최종 결말은 Defender Report가 아니라 Dark Web Exfiltration이다. 보고서 작성은 선택적 사후 과제로만 둔다.
- flag는 플랫폼 진행 체크용으로만 사용하고, 교육 서술에서는 evidence로 표현한다.
- 새 시나리오는 이 구조를 복제하되, 조직명, 인프라, 단계별 evidence, lab command만 교체할 수 있어야 한다.

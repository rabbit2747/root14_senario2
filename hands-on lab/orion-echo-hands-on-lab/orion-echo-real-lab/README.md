# Operation Orion Echo Real-Isolated Lab

This is the new HTB/DreamHack-style MVP for Operation Orion Echo.

It preserves the original SolarWinds-inspired story, but the P0/P1
implementation uses real services and real evidence:

- Real Flask/Jinja2 support preview surface
- Real files seeded into the support portal container
- Real OpenLDAP bind
- Real SQLite-backed internal wiki
- Real audit logs consumed by a grader

## Start

```powershell
Copy-Item .env.example .env
wsl -d Ubuntu-24.04 -- bash -lc "cd '/mnt/c/Users/HS/OneDrive/Desktop/platform/hands-on lab/orion-echo-hands-on-lab/orion-echo-real-lab' && docker compose up --build -d"
```

Entrypoints:

```text
Support portal: http://localhost:28181
Grader status:  http://localhost:29100/status
```

Only the edge proxy and local grader port are exposed to the host. LDAP and
wiki are reachable only inside Docker networks.

## Stage Flow

```text
Stage 1: support portal Jinja2 SSTI
Stage 2: read real support portal evidence files
Stage 3: use discovered LDAP credential to access internal wiki
```

## Manual Writeup Path

Stage 1:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:28181/
Invoke-WebRequest -UseBasicParsing http://localhost:28181/ticket/preview `
  -Method Post `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body 'body={{7*7}}'
```

Stage 2:

```powershell
Invoke-WebRequest -UseBasicParsing 'http://localhost:28181/support/read/list'
Invoke-WebRequest -UseBasicParsing 'http://localhost:28181/support/read?k=portal'
Invoke-WebRequest -UseBasicParsing 'http://localhost:28181/support/read?k=ldap'
```

Stage 3:

Use the `LDAP_BIND_PW` from Stage 2 against the internal wiki from inside the
Docker network:

```powershell
wsl -d Ubuntu-24.04 -- bash -lc "cd '/mnt/c/Users/HS/OneDrive/Desktop/platform/hands-on lab/orion-echo-hands-on-lab/orion-echo-real-lab' && PW=\$(grep LDAP_BIND_PW volumes/portal-data/config/ldap_creds.conf | cut -d= -f2-) && docker run --rm --network orion-echo-real-lab_internal_net curlimages/curl:8.10.1 -s -u operator:\$PW http://wiki:6000/page/orion-echo-brief"
```

Check grader:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:29100/status
```

## Safety

- No Docker socket mount
- No privileged containers
- Non-root users for custom apps
- `read_only`, `no-new-privileges`, `cap_drop: ALL`
- Internal Docker networks for LDAP/wiki
- Evidence-based grader reads logs read-only

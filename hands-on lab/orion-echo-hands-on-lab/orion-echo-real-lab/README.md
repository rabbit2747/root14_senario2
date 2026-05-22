# Operation Orion Echo Real-Isolated Lab

This is the new HTB/DreamHack-style MVP for Operation Orion Echo.

It preserves the original SolarWinds-inspired story, but the P0/P1
implementation uses real services and real evidence:

- Real Flask/Jinja2 support preview surface
- Real files seeded into the support portal container
- Real OpenLDAP bind
- Real SQLite-backed internal wiki
- Real SQLite-backed internal ticket service with seeded case comments
- Real internal build, signing, update, customer, object, and drop services
- Real internal Gitea repository seeded with branch history and release metadata
- Real SQLite-backed customer data service and file-backed internal object store
- Real `.tar` artifact generation and SHA-256 verification
- File-backed signing secret mounted only into signing/update services
- Real audit logs consumed by a grader

## Start

```powershell
Copy-Item .env.example .env
wsl -d Ubuntu-24.04 -u root -- bash -c "rm -rf /home/ubuntu/orion-echo-real-lab && mkdir -p /home/ubuntu/orion-echo-real-lab && rsync -a --exclude 'volumes/' '/mnt/c/Users/HS/OneDrive/Desktop/platform/hands-on lab/orion-echo-hands-on-lab/orion-echo-real-lab/' /home/ubuntu/orion-echo-real-lab/ && chown -R ubuntu:ubuntu /home/ubuntu/orion-echo-real-lab"
wsl -d Ubuntu-24.04 -- bash -lc "cd /home/ubuntu/orion-echo-real-lab && docker compose build support-portal"
wsl -d Ubuntu-24.04 -- bash -lc "cd /home/ubuntu/orion-echo-real-lab && cp -n .env.example .env && chmod +x verify/*.sh seeder/seed.sh && docker compose up --build -d"
```

Entrypoints:

```text
Support portal: http://localhost:28181
Grader status:  http://localhost:29100/status
```

Only the edge proxy and local grader port are exposed to the host. LDAP and
wiki/Gitea/release services are reachable only inside Docker networks.

## Stage Flow

```text
Stage 1: support portal Jinja2 SSTI
Stage 2: read real support portal evidence files
Stage 3: use discovered LDAP credential to access internal wiki
Stage 4: discover DevOps and release services from internal wiki
Stage 5: collect ticket and source-repo release evidence
Stage 6: use the valid build token to create a build job
Stage 7: inspect benign artifact metadata
Stage 8: sign and publish the manifest to the ANRC update channel
Stage 9: confirm customer trusted update application
Stage 10: retrieve the customer export final object
Stage 11: submit the recovered object to the controlled dark-web-drop simulator
```

Scoring accepts both the guided support path and the realistic RCE path:

```text
Stage 1 SSTI discovery: +10
Stage 2A support/read evidence path: +10
Stage 2B direct /var/lab evidence discovery through SSTI/RCE: +15
Stage 3 LDAP-authenticated wiki access: +20
Stage 4 internal service discovery: +10
Stage 5 ticket/Gitea-backed repo evidence collection: +20
Stage 6 build token use: +20
Stage 7 artifact metadata and file download review: +15
Stage 8 sign and publish: +25
Stage 9 customer trusted update: +20
Stage 10 customer export and object access: +20
Stage 11 controlled dark web drop: +25
Bonus audit log review: +5
Bonus DevOps onboarding review: +5
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
wsl -d Ubuntu-24.04 -- bash -lc "cd /home/ubuntu/orion-echo-real-lab && PW=\$(grep LDAP_BIND_PW volumes/portal-data/config/ldap_creds.conf | cut -d= -f2-) && docker run --rm --network orion-echo-real-lab_internal_net curlimages/curl:8.10.1 -s -u operator:\$PW http://wiki:6000/page/orion-echo-brief"
```

Automated verification:

```powershell
wsl -d Ubuntu-24.04 -- bash -lc "cd /home/ubuntu/orion-echo-real-lab && bash verify/stage1_ssti.sh && bash verify/stage2_evidence.sh && bash verify/stage3_ldap_wiki.sh"
wsl -d Ubuntu-24.04 -- bash -lc "cd /home/ubuntu/orion-echo-real-lab && bash verify/stage4_11_full_chain.sh"
```

Internal source repository check:

```powershell
wsl -d Ubuntu-24.04 -- bash -lc "docker run --rm --network orion-echo-real-lab_internal_net curlimages/curl:8.10.1 -sS http://gitea:3000/orion/echo-agent/raw/branch/release-2.6.4/release-pipeline/release.json"
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

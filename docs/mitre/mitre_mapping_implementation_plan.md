# MITRE ATT&CK Mapping and Implementation Plan
# Orion Echo SolarWinds-Inspired Supply Chain Demo

Version: 1.0-demo-scope
Date: 2026-05-02
Audience: implementation engineer / instructor / AI coding agent
Scope: one-person demonstration, Docker Compose only

---

## 0. Purpose

This document updates the existing Orion Echo Enterprise APT Range plan for the
new business requirement:

```text
Original: 20 concurrent student sessions
Updated:  1-person end-to-end demonstration
```

The scenario remains inspired by the SolarWinds-style software supply chain
compromise pattern, but it must stay bounded and safe:

```text
No real malware
No external C2
No host escape
No docker.sock abuse
No privileged container abuse
No destructive payloads
No worm behavior
```

The purpose of this update is to define the exact MITRE ATT&CK Enterprise
tactics and techniques that the demo will intentionally model, then translate
those mappings into an implementation plan.

MITRE ATT&CK is used here as a training and classification framework, not as a
requirement to implement dangerous behavior. Where a real technique would be
unsafe, the demo implements a benign emulator or marker-based equivalent.

---

## 1. Demo Narrative

### 1.1 Story

Orion Echo Systems LLC provides EchoAgent monitoring software to Al Noor
Research Campus (ANRC). ANRC observed suspicious behavior after an EchoAgent
update. The operator must reproduce a supply-chain path through Orion Echo's
public service, internal knowledge systems, build/release pipeline, trusted
update channel, and customer environment.

### 1.2 Demonstration Goal

The demo must show this full chain:

```text
External recon
-> exploit support-portal
-> limited foothold
-> safe C2 emulator registration
-> internal wiki/ticket discovery
-> token discovery
-> build-server job trigger
-> artifact generation
-> signing-service
-> update-server manifest publish
-> customer-app trusted update polling
-> customer-api export discovery
-> MinIO object-store final flag
```

### 1.3 SolarWinds-Inspired Core

The center of gravity is the supply chain segment:

```text
build-server
-> signing-service
-> update-server
-> customer-app
-> customer-api
-> object-store
```

This maps primarily to:

```text
T1195.002 Compromise Software Supply Chain
T1072     Software Deployment Tools
T1550.001 Application Access Token
T1530     Data from Cloud Storage
```

The demo does not reproduce SUNBURST, real malware behavior, stealth, evasion,
or real command-and-control infrastructure.

---

## 2. Authoritative ATT&CK Technique Set

Only the following MITRE ATT&CK Enterprise techniques are in scope for v1.
Implementation should avoid adding unrelated techniques unless the scenario
requires them.

| ID | Technique | Tactic | Demo meaning |
|---|---|---|---|
| T1591 | Gather Victim Org Information | Reconnaissance | Learn Orion Echo products, ANRC relationship, release channels |
| T1592.002 | Gather Victim Host Information: Software | Reconnaissance | Identify exposed services, versions, product names |
| T1190 | Exploit Public-Facing Application | Initial Access | SSTI/RCE in support-portal preview endpoint |
| T1059.004 | Command and Scripting Interpreter: Unix Shell | Execution | Restricted post-exploit probes such as `id`, hostname, marker read |
| T1082 | System Information Discovery | Discovery | Identify user, host, runtime context |
| T1083 | File and Directory Discovery | Discovery | Find marker files and limited application paths |
| T1046 | Network Service Discovery | Discovery | Discover internal corp/dev/release/customer services |
| T1213 | Data from Information Repositories | Collection | Read internal wiki/ticket/docs for operational clues |
| T1213.003 | Data from Information Repositories: Code Repositories | Collection | Inspect release-pipeline and echo-agent repo metadata |
| T1552 | Unsecured Credentials | Credential Access | Find token names/values in wiki/ticket/doc artifacts |
| T1550.001 | Use Alternate Authentication Material: Application Access Token | Defense Evasion / Lateral Movement | Use discovered bearer tokens to access build/update/customer APIs |
| T1078 | Valid Accounts | Initial Access / Persistence / Privilege Escalation / Defense Evasion | Use seeded SSO/service identity where the lab requires authenticated access |
| T1071.001 | Application Layer Protocol: Web Protocols | Command and Control | Lab C2 emulator over HTTP GET/POST |
| T1105 | Ingress Tool Transfer | Command and Control | Benign artifact download from update-server by customer-app |
| T1570 | Lateral Tool Transfer | Lateral Movement | Artifact movement from build/release path into customer environment |
| T1072 | Software Deployment Tools | Execution / Lateral Movement | Abuse trusted update/deployment mechanism to reach customer-app |
| T1195.002 | Supply Chain Compromise: Compromise Software Supply Chain | Initial Access | Publish a signed benign update to ANRC channel |
| T1530 | Data from Cloud Storage | Collection | Retrieve final ANRC object from MinIO via customer-api presigned URL |

Notes:

- `T1195.002` is the main SolarWinds-inspired technique for the demo.
- `T1072` is used to explain the trusted software deployment/update mechanism.
- `T1071.001` is implemented only as a closed-action C2 emulator, not real C2.
- `T1550.001` is modeled through application/API tokens, not Kerberos/SAML
  forgery. SAML-style behavior is out of scope for v1.

---

## 3. Stage-to-ATT&CK Mapping

### Stage 0 - External Recon

Student action:

```text
Browse public site, public docs, release notes, support portal, service metadata.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Reconnaissance | T1591 Gather Victim Org Information |
| Reconnaissance | T1592.002 Gather Victim Host Information: Software |

Implementation:

- `edge-proxy` exposes `/`, `/docs/`, `/support/`, `/releases/public`.
- `public-site` and `public-docs` mention EchoAgent, EchoUpdate, ANRC, and
  version 2.6.x.
- `GET /service/build-info` reveals stage 0 flag after the operator has
  visited at least three recon routes.

Detection/logging:

- `edge-proxy` logs route hits.
- `session-agent` or `flag-service` counts distinct route access.

---

### Stage 1 - Initial Access

Student action:

```text
Exploit support-portal /preview SSTI to read post-exploit marker.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Initial Access | T1190 Exploit Public-Facing Application |
| Execution | T1059.004 Command and Scripting Interpreter: Unix Shell |

Implementation:

- `support-portal` has intentionally vulnerable `/preview`.
- The vulnerability is Jinja2 SSTI-like, but behind a strict lab guard.
- Allowed post-exploit actions:
  - `id`
  - `hostname`
  - `cat /var/lib/support-portal/.post_exploit_marker`
  - `ls /opt/support-portal`
- Disallowed commands return `Permission denied (lab guard)`.

Flag:

```text
/var/lib/support-portal/.post_exploit_marker
```

Safety boundary:

- No arbitrary shell.
- No network egress except the intended internal C2 emulator URL.
- No file writes.
- No Docker socket.

---

### Stage 2 - Foothold Orientation

Student action:

```text
Run restricted discovery probes through the foothold.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Discovery | T1082 System Information Discovery |
| Discovery | T1083 File and Directory Discovery |

Implementation:

- The post-exploit shim records allowed probes.
- After three approved probes, it writes `/tmp/orion_stage2.txt`.

Flag:

```text
/tmp/orion_stage2.txt
```

Detection/logging:

- `support-portal` emits `post_exploit.probe` events to `audit-log`.

---

### Stage 3 - Safe C2 Emulation

Student action:

```text
Register the foothold with c2-emulator over HTTP.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Command and Control | T1071.001 Application Layer Protocol: Web Protocols |

Implementation:

- `c2-emulator` exposes:
  - `POST /beacon/register`
  - `GET /beacon/{implant_id}/actions`
  - `POST /beacon/{implant_id}/actions/{action_id}/result`
- Allowed actions are a closed enum:
  - `discover_services`
  - `list_env_var_names`
  - `collect_predefined_artifact`
  - `report_progress`
  - `mark_persistence_simulated`
  - `exit`

Flag:

- Returned in the registration response.

Safety boundary:

- No arbitrary command execution.
- No stealth.
- No external callback.
- No persistence outside the lab.

---

### Stage 4 - Internal Discovery and Repository Mining

Student action:

```text
Discover wiki, ticket-service, build-server references, release-pipeline repo.
Read internal knowledge sources to understand the release process.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Discovery | T1046 Network Service Discovery |
| Collection | T1213 Data from Information Repositories |
| Collection | T1213.003 Data from Information Repositories: Code Repositories |

Implementation:

- `wiki` contains pages for:
  - release runbook
  - signing runbook
  - ANRC channel notes
- `ticket-service` contains partial clues and decoys.
- `source-repo` may be implemented as either Gitea or a lightweight repo API
  for v1 demo.
- `release-pipeline/release.json` describes build token env name, channels,
  signing key ID, and marker.

Flag:

- Returned after four distinct internal service discoveries or embedded in
  a high-value wiki page for simpler demo flow.

Detection/logging:

- Log wiki page views, ticket reads, repo file reads.

---

### Stage 5 - Credential and Token Discovery

Student action:

```text
Find BUILD_TRIGGER_TOKEN among valid clues, partial clues, and decoys.
Use it to trigger a build job.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Credential Access | T1552 Unsecured Credentials |
| Defense Evasion / Lateral Movement | T1550.001 Application Access Token |

Implementation:

- Valid token appears in exactly one place:

```text
wiki page: release/runbook-build-trigger
field: BUILD_TRIGGER_TOKEN=<demo value>
```

- Decoys appear in:
  - `.env.sample`
  - old build process wiki page
  - legacy ticket comments
  - doc artifact with expired tokens

Completion:

```text
POST /api/jobs with valid BUILD_TRIGGER_TOKEN returns HTTP 202.
```

Flag:

- `x_orion_acceptance` in the 202 response.
- Also printed in first job log line.

---

### Stage 6 - Build Artifact Generation

Student action:

```text
Trigger build-server to generate benign EchoAgent artifact containing marker.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Execution | T1059.004 Command and Scripting Interpreter: Unix Shell |
| Resource Development | T1608 Stage Capabilities |

Implementation:

- `build-server` creates a tarball:

```text
echo-agent-2.6.4.tar.gz
LAB_BUILD_MARKER
```

- The marker must contain:

```text
ORION_ECHO_BUILD_MARKER=<session_id or demo_id>
```

Flag:

```text
LAB_BUILD_MARKER contains stage 6 flag.
```

Safety boundary:

- Artifact is benign.
- No malware, persistence, or remote execution payload.

---

### Stage 7 - Supply Chain Publish

Student action:

```text
Sign a canonical manifest and publish it to the ANRC update channel.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Initial Access | T1195.002 Supply Chain Compromise: Compromise Software Supply Chain |
| Execution / Lateral Movement | T1072 Software Deployment Tools |
| Defense Evasion / Lateral Movement | T1550.001 Application Access Token |

Implementation:

- `signing-service` signs only manifests containing the correct lab marker.
- `update-server` accepts publish only for:

```text
channel=anrc
metadata.lab_marker=ORION_ECHO_BUILD_MARKER=<demo_id>
signature.valid=true
```

- The published manifest includes:

```json
"metadata": {
  "customer": "anrc",
  "lab_marker": "ORION_ECHO_BUILD_MARKER=<demo_id>",
  "flag": "orion{...}"
}
```

Flag:

- Read from `GET /channels/anrc/manifest.json`.

Safety boundary:

- The update artifact is a harmless marker package.
- The signing key is lab-only HMAC.
- No real executable malicious behavior.

---

### Stage 8 - Trusted Update to Customer Environment

Student action:

```text
Observe customer-app polling update-server, validating the signed manifest,
downloading the artifact, and reporting update-applied to customer-api.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Lateral Movement | T1072 Software Deployment Tools |
| Lateral Movement | T1570 Lateral Tool Transfer |
| Command and Control | T1105 Ingress Tool Transfer |

Implementation:

- `customer-app` polls:

```text
GET /channels/anrc/manifest.json
```

- On a newer valid manifest:
  - verify signature
  - download artifact
  - verify sha256
  - extract `LAB_BUILD_MARKER`
  - call `customer-api /internal/agent/update-applied`

Flag:

- `customer-api /metadata` includes `recent_event_flag` after update.

Safety boundary:

- The artifact does not execute arbitrary code.
- The customer app only reads marker content and records an event.

---

### Stage 9 - Customer Discovery

Student action:

```text
Enumerate customer-api metadata, facilities, audits, exports, and object keys.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Discovery | T1046 Network Service Discovery |
| Collection | T1213 Data from Information Repositories |

Implementation:

- `customer-api` exposes:
  - `GET /metadata`
  - `GET /facilities`
  - `GET /audits`
  - `GET /exports`
  - `GET /exports/{id}`

Completion:

- Operator fetches at least five distinct customer-api paths.
- One path must include a Q2 ANRC audit export.

Flag:

- `x_orion_discovery_flag` in `GET /exports/{id}` for the Q2 export.

---

### Stage 10 - Final Collection

Student action:

```text
Use customer-api presigned URL to retrieve final ANRC object from MinIO.
```

MITRE mapping:

| Tactic | Technique |
|---|---|
| Collection | T1530 Data from Cloud Storage |

Implementation:

- Final object:

```text
anrc-objects/anrc-audit-exports/2026/Q2/project-orion-echo-final.txt
```

- Companion decoy:

```text
anrc-audit-exports/2026/Q2/facility-risk-summary.pdf
```

Flag:

```text
project-orion-echo-final.txt contains final_flag.
```

Safety boundary:

- No external exfiltration.
- Retrieval happens inside the lab through MinIO/presigned URL.

---

## 4. Revised Docker Demo Architecture

For the one-person demo, do not implement the full 20-student platform.

### 4.1 Required containers

```text
edge-proxy
support-portal
wiki
ticket-service
source-repo
build-server
signing-service
update-server
customer-app
customer-api
object-store
c2-emulator
flag-service
audit-log
```

### 4.2 Optional containers for polish

```text
public-site
public-docs
corp-sso
doc-portal
mail-web
monitoring
```

For v1, `corp-sso` may be replaced with static demo auth if time is limited.
If SSO is included, it should remain an OIDC-lite simulator.

### 4.3 Networks

Keep the enterprise segmentation because it helps the story:

```text
public_net
dmz_net
corp_net
dev_net
release_net
customer_net
control_net
```

But remove:

```text
per-student subnet allocation
session pool
cross-session isolation
CTFd launcher
Prometheus/Grafana/Loki
OCI production sizing
```

---

## 5. Implementation Phases

### Phase 1 - Single Compose Skeleton

Deliverables:

```text
compose.yml
shared FastAPI service template
network definitions
edge-proxy routing
flag-service
audit-log
```

Validation:

```text
docker compose up -d
curl public entrypoint
curl each service health endpoint from allowed networks
```

### Phase 2 - Stage 0 to Stage 3

Deliverables:

```text
public recon routes
support-portal SSTI-like lab vulnerability
post-exploit marker and lab guard
c2-emulator registration flow
```

MITRE coverage:

```text
T1591
T1592.002
T1190
T1059.004
T1082
T1083
T1071.001
```

### Phase 3 - Internal Discovery and Token Hunt

Deliverables:

```text
wiki pages
ticket records
source-repo files
valid BUILD_TRIGGER_TOKEN
decoy tokens
build-server /api/jobs
```

MITRE coverage:

```text
T1046
T1213
T1213.003
T1552
T1550.001
```

### Phase 4 - Build, Sign, Publish

Deliverables:

```text
artifact generator
LAB_BUILD_MARKER
signing-service /api/sign and /api/verify
update-server /internal/publish
ANRC manifest endpoint
```

MITRE coverage:

```text
T1608
T1195.002
T1072
```

### Phase 5 - Customer Trust and Final Collection

Deliverables:

```text
customer-app polling worker
customer-api update-applied endpoint
customer-api exports endpoints
MinIO final object
presigned URL flow
```

MITRE coverage:

```text
T1072
T1570
T1105
T1530
```

### Phase 6 - Instructor Demo Polish

Deliverables:

```text
demo walkthrough script
instructor guide
reset script
minimal UI polish
clear stage banners or logs
decoy data pass
```

Validation:

```text
One clean run from Stage 0 to Stage 10 in under 45 minutes.
One scripted walkthrough completes in under 5 minutes.
```

---

## 6. Stage Completion Rules for Demo Scope

For a one-person demonstration, use simple and visible gating.

| Stage | Completion rule | Flag location |
|---|---|---|
| 0 | Visit 3 recon routes | `/service/build-info` |
| 1 | Read support marker through lab SSTI | support marker file |
| 2 | Run 3 allowed foothold probes | `/tmp/orion_stage2.txt` |
| 3 | Register beacon | c2 response |
| 4 | Discover 4 internal services or read release runbook | c2 response or wiki |
| 5 | Submit valid build token | build job 202 response |
| 6 | Build artifact generated | `LAB_BUILD_MARKER` |
| 7 | ANRC manifest published | manifest metadata |
| 8 | customer-app applies update | customer-api metadata |
| 9 | Q2 export discovered | export detail JSON |
| 10 | final object retrieved | object content |

---

## 7. Detection and Teaching Notes

Each implemented technique must produce a visible event in `audit-log`.

| Technique | Required audit event |
|---|---|
| T1190 | `support.exploit.preview_triggered` |
| T1059.004 | `support.post_exploit.command_allowed` |
| T1082 | `support.discovery.system_info` |
| T1083 | `support.discovery.file_read` |
| T1071.001 | `c2.beacon.registered` |
| T1046 | `c2.discovery.service_probe` |
| T1213 | `wiki.page.viewed`, `ticket.viewed` |
| T1213.003 | `repo.file.viewed` |
| T1552 | `token.clue.accessed` |
| T1550.001 | `api.token.accepted` |
| T1195.002 | `release.manifest.published` |
| T1072 | `customer.update.applied` |
| T1530 | `object.final.downloaded` |

Instructor explanation should emphasize:

```text
The behavior is mapped to ATT&CK.
The payloads are benign.
The C2 is an emulator.
The supply-chain trust relationship is the lesson.
The final object retrieval is collection, not real-world exfiltration.
```

---

## 8. Explicit Out-of-Scope Techniques

Do not implement these in the demo:

| Technique family | Reason |
|---|---|
| OS credential dumping | Too risky and unnecessary |
| Kernel/host escape | Prohibited by safety rules |
| Docker socket abuse | Prohibited by safety rules |
| Real persistence mechanisms | Use emulator only |
| Real external C2 | Use internal c2-emulator only |
| Destructive impact | Not part of the training goal |
| Real malware upload | Use benign marker artifact only |
| SAML token forging | Too complex for v1; mention as SolarWinds context only |

---

## 9. Success Criteria

The updated plan is complete when:

1. A single `docker compose up -d` starts the demo.
2. The operator can run Stage 0 through Stage 10 end-to-end.
3. Every stage has an explicit MITRE tactic and technique mapping.
4. The supply-chain segment clearly demonstrates `T1195.002`.
5. All C2/persistence/malware-like concepts are implemented as safe emulation.
6. The final object is retrieved from MinIO through the intended customer-api
   path.
7. `audit-log` records one event per major mapped technique.
8. The instructor can explain why this is SolarWinds-inspired without claiming
   to reproduce SolarWinds malware or SUNBURST behavior.

---

## 10. Reference Sources

Technique IDs and tactic names are based on MITRE ATT&CK Enterprise:

- https://attack.mitre.org/tactics/enterprise/
- https://attack.mitre.org/techniques/T1195/
- https://attack.mitre.org/techniques/T1195/002/
- https://attack.mitre.org/techniques/T1190/
- https://attack.mitre.org/techniques/T1059/004/
- https://attack.mitre.org/techniques/T1071/001/
- https://attack.mitre.org/techniques/T1072/
- https://attack.mitre.org/techniques/T1213/
- https://attack.mitre.org/techniques/T1213/003/
- https://attack.mitre.org/techniques/T1552/
- https://attack.mitre.org/techniques/T1550/001/
- https://attack.mitre.org/techniques/T1530/

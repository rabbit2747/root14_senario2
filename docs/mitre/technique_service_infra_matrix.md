# Technique-to-Service Infrastructure Matrix
# Orion Echo SolarWinds-Inspired Supply Chain Demo

Version: 1.0-demo-scope
Date: 2026-05-02
Audience: implementation engineer / scenario designer / instructor
Companion to:

- `mitre_mapping_implementation_plan.md`
- `api_contracts.md` section 15 service identity matrix
- `platform_runtime.md` section 2.3 network membership rules
- `stage_gating.md` stage completion and credential placement rules

---

## 0. Purpose

This matrix translates each selected MITRE ATT&CK technique into concrete
Docker services, installed components, configuration options, seeded data,
network placement, and audit events.

The goal is to make the demo feel like a real enterprise network while keeping
the scenario safe and bounded.

```text
Technique -> required services -> options/settings -> seed data -> logs -> flags
```

This document supersedes the scattered implementation notes for the 1-person
demo scope. The older 20-student platform design remains useful as a future
scale-out reference.

---

## 1. Enterprise Service Baseline

Every custom service must implement this baseline unless explicitly exempted.

| Requirement | Implementation |
|---|---|
| Framework fingerprint reduction | Disable FastAPI `/docs`, `/redoc`, and public OpenAPI in demo mode |
| Metadata endpoints | `GET /health`, `GET /service/version`, `GET /service/build-info` |
| Response headers | `X-Request-Id`, `X-Service`, `X-Service-Version`, `X-Build-Id` |
| Error shape | Standard JSON error envelope with request ID |
| Logging | Emit JSON audit event to `audit-log` for meaningful user actions |
| Service identity | One service identity per service, matching `api_contracts.md` where possible |
| Network exposure | No backend container has public `ports:` except `edge-proxy` |
| Safety | No privileged containers, no docker.sock mount, no host networking |

Recommended UI/enterprise realism:

```text
Orion Echo branding
Different UI feel per service class
Internal hostnames via Docker aliases
Realistic release/channel/customer terminology
Valid, partial, decoy, and noise records mixed together
```

---

## 2. Required Docker Networks

For the 1-person demo, keep the segmented network model but remove dynamic
session allocation.

| Network | Purpose | Student direct access |
|---|---|---|
| `public_net` | Published entrypoint | Yes, through `edge-proxy` |
| `dmz_net` | Public-facing vendor services | Indirect only |
| `corp_net` | Internal corporate systems | No |
| `dev_net` | Source and build systems | No |
| `release_net` | Signing/update systems | No |
| `customer_net` | ANRC customer environment | No |
| `control_net` | Flags, audit, C2 emulator | No |

Minimum enforcement:

```text
Only edge-proxy publishes host ports.
Backend services bind only to Compose networks.
Service-to-service APIs require bearer/control tokens where specified.
Internet egress may be left simple for local demo, but no service should need it.
```

---

## 3. Service Inventory Matrix

| Service | Network(s) | Role | Required options/settings | Enterprise realism data |
|---|---|---|---|---|
| `edge-proxy` | `public_net`, `dmz_net` | External entrypoint | Route `/`, `/docs`, `/support`, `/portal`; access logs on; only published port | Host-based routing names and realistic headers |
| `public-site` | `dmz_net` | Corporate website | Static/FastAPI; metadata endpoints | Products, customers, leadership blurbs, ANRC hint |
| `public-docs` | `dmz_net` | Product docs/release notes | Static/FastAPI; searchable docs | EchoAgent docs, release notes, channel names |
| `support-portal` | `dmz_net`, `corp_net`, optional `control_net` | Initial access surface | `/preview` lab SSTI; lab guard whitelist; custom errors | Tickets preview UI, support categories, stale notices |
| `wiki` | `corp_net` | Internal knowledge repository | Auth or demo token; page search; page view audit | Release runbooks, signing notes, decoys |
| `ticket-service` | `corp_net` | Helpdesk/engineering tickets | Ticket list/detail/search; audit reads | Partial clues, old tickets, customer escalations |
| `doc-portal` | `corp_net`, optional | Internal documents | File list/read; restricted folder concept | Optional ANRC channel doc and legacy token files |
| `mail-web` | `corp_net`, optional | Internal mail simulator | Search/list messages | Optional release emails and partial clues |
| `source-repo` | `dev_net` | Code repository | Gitea or lightweight repo API; file read audit | `release-pipeline/release.json`, `.env.sample`, CODEOWNERS |
| `build-server` | `dev_net`, `release_net` | Build API/artifact generator | Token-protected `/api/jobs`; artifact endpoint | Build logs, job stages, marker artifact |
| `signing-service` | `release_net` | Lab signing service | HMAC signing; allow caller `build-server`; require marker | Signing key ID, refusal messages |
| `update-server` | `release_net`, `customer_net` | Update manifest/artifact channel | `anrc` manifest; `/internal/publish`; artifact serving | Channels: stable, beta, internal-canary, anrc, legacy |
| `customer-app` | `customer_net` | Simulated EchoAgent at ANRC | Poll update-server; verify signature/hash; apply marker only | Status UI, recent updates, installed version |
| `customer-api` | `customer_net` | ANRC internal API | Metadata/facilities/audits/exports; presigned URL generation | Facility/audit/export records |
| `object-store` | `customer_net` | MinIO final data store | Buckets and policies; final object | ANRC Q2 audit export and decoys |
| `monitoring` | `customer_net`, optional | Customer status dashboard | Read-only status | Update timeline, facility health summary |
| `c2-emulator` | `control_net` | Safe C2 concept emulator | Closed action enum; no shell; no file write | Beacon console and operator hint surface |
| `flag-service` | `control_net` | Stage flag generation/verification | Static demo flags or HMAC demo ID | Stage status |
| `audit-log` | `control_net`, optionally reachable from all services | Event sink | JSON event API; query UI optional | Technique event stream |

---

## 4. Technique-to-Infrastructure Matrix

### 4.1 Reconnaissance

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data | Audit events |
|---|---|---|---|---|---|
| `T1591` | Gather Victim Org Information | `public-site`, `public-docs`, `edge-proxy` | Public pages route through edge; no auth | Orion Echo company profile, EchoAgent/EchoUpdate descriptions, ANRC customer mention | `recon.route.viewed`, `public.page.viewed` |
| `T1592.002` | Gather Victim Host Information: Software | `public-docs`, `support-portal`, `edge-proxy` | Version/build metadata endpoints; release notes | Version 2.6.3/2.6.4 references, service names, release channels | `recon.metadata.viewed`, `service.build_info.viewed` |

Implementation notes:

```text
The student should learn product, customer, and update-channel context before
touching the vulnerable support-portal. Keep clues visible but not too direct.
```

---

### 4.2 Initial Access and Execution

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data / artifacts | Audit events |
|---|---|---|---|---|---|
| `T1190` | Exploit Public-Facing Application | `support-portal` | `/preview` implements lab-controlled SSTI/RCE; lab guard enabled | `.post_exploit_marker` containing stage 1 flag and C2 hint | `support.exploit.preview_triggered` |
| `T1059.004` | Command and Scripting Interpreter: Unix Shell | `support-portal` | Whitelist only `id`, `hostname`, `ls /opt/support-portal`, `cat` marker paths | `/tmp/orion_stage2.txt` generated after probes | `support.post_exploit.command_allowed`, `support.post_exploit.command_denied` |

Required safety options:

```text
read_only filesystem where practical
non-root user
no Docker socket
no host network
no privileged mode
no arbitrary shell passthrough
allowlist commands only
```

---

### 4.3 Local and Network Discovery

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data / artifacts | Audit events |
|---|---|---|---|---|---|
| `T1082` | System Information Discovery | `support-portal` | Probe wrapper exposes user/host/runtime context | Masked env names, hostname, service account name | `support.discovery.system_info` |
| `T1083` | File and Directory Discovery | `support-portal` | Allowlist directory listing and marker reads | `/opt/support-portal`, marker files, limited config names | `support.discovery.file_read`, `support.discovery.dir_list` |
| `T1046` | Network Service Discovery | `c2-emulator`, internal services | `discover_services` action probes known internal `/health` endpoints | Service aliases: `wiki.corp.local`, `build.dev.local`, `updates.release.local` | `c2.discovery.service_probe` |

Implementation notes:

```text
Discovery should reveal enough internal services to feel like an enterprise,
but it must not become an arbitrary port scan. Use curated targets.
```

---

### 4.4 Safe Command and Control Emulation

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data / artifacts | Audit events |
|---|---|---|---|---|---|
| `T1071.001` | Application Layer Protocol: Web Protocols | `c2-emulator`, `support-portal` | HTTP `POST /beacon/register`, `GET /actions`, `POST /result`; closed action enum | Beacon ID, reachable target list, stage 3 flag | `c2.beacon.registered`, `c2.action.polled`, `c2.action.result_posted` |

Allowed action enum:

```text
discover_services
list_env_var_names
collect_predefined_artifact
report_progress
mark_persistence_simulated
exit
```

Explicitly prohibited:

```text
arbitrary command execution
file write
filesystem traversal
external callback
stealth/evasion
worming
```

---

### 4.5 Internal Repository and Knowledge Collection

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data | Audit events |
|---|---|---|---|---|---|
| `T1213` | Data from Information Repositories | `wiki`, `ticket-service`, optional `doc-portal`, optional `mail-web` | Search/list/detail views; internal-only routing | Release runbooks, signing docs, ANRC notes, old tickets, decoys | `wiki.page.viewed`, `ticket.viewed`, `doc.file.viewed`, `mail.message.viewed` |
| `T1213.003` | Data from Information Repositories: Code Repositories | `source-repo` | File read API or Gitea; repo browser; read audit | `release-pipeline/release.json`, `.env.sample`, README, CODEOWNERS | `repo.file.viewed`, `repo.clone_or_browse` |

Required data mix:

```text
valid clue: 1 build token location
partial clues: 2-3 references pointing to the runbook or repo
decoys: old tokens, old channel names, legacy docs
noise: ordinary HR/support/release content
```

---

### 4.6 Credential and Token Use

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data / artifacts | Audit events |
|---|---|---|---|---|---|
| `T1552` | Unsecured Credentials | `wiki`, `ticket-service`, `doc-portal`, `source-repo` | Place valid/decoy token material; validators reject decoys | `BUILD_TRIGGER_TOKEN`, old expired tokens, `.env.sample=replace-me` | `token.clue.accessed`, `token.decoy.accessed` |
| `T1550.001` | Use Alternate Authentication Material: Application Access Token | `build-server`, `update-server`, `customer-api` | Bearer/API token validation; scope checks; decoy rejection | Build trigger token, channel token names, customer token held by app | `api.token.accepted`, `api.token.rejected`, `api.token.scope_denied` |
| `T1078` | Valid Accounts | optional `corp-sso`, `wiki`, `ticket-service` | Demo users/groups or static auth; group-gated pages if implemented | `releng` user, service accounts, disabled/legacy accounts | `auth.login.success`, `auth.login.failed`, `auth.group_access` |

Implementation notes:

```text
For v1, full SSO can be simplified. If SSO is skipped, preserve the training
objective by using scoped API tokens and service accounts.
```

---

### 4.7 Build, Signing, and Supply Chain

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data / artifacts | Audit events |
|---|---|---|---|---|---|
| `T1608` | Stage Capabilities | `build-server`, `update-server` | Generate benign artifact and make it retrievable | `echo-agent-2.6.4.tar.gz`, `LAB_BUILD_MARKER` | `build.artifact.created` |
| `T1195.002` | Supply Chain Compromise: Compromise Software Supply Chain | `build-server`, `signing-service`, `update-server`, `customer-app` | Signed manifest publish to `anrc`; marker required; signature verified | ANRC manifest with lab marker and flag | `release.manifest.signed`, `release.manifest.published` |
| `T1072` | Software Deployment Tools | `update-server`, `customer-app`, `customer-api` | Customer app polls trusted update channel and reports applied update | `anrc` channel, version 2.6.4, update-applied event | `customer.update.poll`, `customer.update.applied` |

Required update channels:

```text
stable
beta
internal-canary
anrc
legacy-2.5
```

Signing-service options:

```text
HMAC-SHA256 lab signing only
caller allowlist: build-server
reject missing metadata.lab_marker
reject wrong channel
reject arbitrary payloads
```

Update-server options:

```text
GET /channels/{channel}/manifest.json
GET /artifacts/{artifact_name}
POST /internal/publish
only channel=anrc completes the supply-chain stage
legacy-2.5 remains a decoy channel
```

---

### 4.8 Artifact Transfer and Customer Reach

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data / artifacts | Audit events |
|---|---|---|---|---|---|
| `T1105` | Ingress Tool Transfer | `customer-app`, `update-server` | Customer app downloads update artifact through HTTP | Signed artifact URL in manifest | `customer.artifact.downloaded` |
| `T1570` | Lateral Tool Transfer | `build-server`, `update-server`, `customer-app` | Artifact moves from build/release path to customer environment | Build artifact, release artifact, customer extracted marker | `artifact.transferred.release_to_customer` |

Safety note:

```text
The artifact is not malware. It contains only a marker file and harmless
metadata so the transfer behavior can be taught safely.
```

---

### 4.9 Final Collection

| MITRE ID | Exact technique name | Required services | Required configuration | Seed data / artifacts | Audit events |
|---|---|---|---|---|---|
| `T1530` | Data from Cloud Storage | `customer-api`, `object-store` | Presigned URL generation; MinIO final bucket/object | `anrc-audit-exports/2026/Q2/project-orion-echo-final.txt` | `object.final.downloaded`, `customer.export.viewed` |

Required objects:

```text
anrc-objects/anrc-audit-exports/2026/Q2/project-orion-echo-final.txt
anrc-objects/anrc-audit-exports/2026/Q2/facility-risk-summary.pdf
anrc-objects-legacy/deprecated/anrc-credentials-export.csv
```

Decoy behavior:

```text
facility-risk-summary.pdf has no flag
legacy credentials file is a honeytoken/decoy
final txt contains final flag
```

---

## 5. Service-to-Service Trust Matrix for Demo

This is the reduced 1-person demo version of the larger service identity
matrix in `api_contracts.md`.

| Caller | May call | Purpose |
|---|---|---|
| `edge-proxy` | `public-site`, `public-docs`, `support-portal` | Public routing |
| `support-portal` | `wiki`, `ticket-service`, `c2-emulator`, `audit-log` | Foothold path and audit |
| `wiki` | `audit-log` | Page read events |
| `ticket-service` | `audit-log` | Ticket read events |
| `source-repo` | `audit-log` | Repo read events |
| `build-server` | `source-repo`, `signing-service`, `update-server`, `audit-log` | Build/sign/publish |
| `signing-service` | `audit-log` | Signing events |
| `update-server` | `audit-log` | Manifest/artifact events |
| `customer-app` | `update-server`, `signing-service`, `customer-api`, `audit-log` | Trusted update flow |
| `customer-api` | `object-store`, `audit-log` | Export/presign flow |
| `c2-emulator` | `flag-service`, `audit-log` | Safe C2 stage gating |
| `flag-service` | `audit-log` | Flag issue/verify events |

All other service-to-service calls should be rejected at application level even
if Docker networking would technically allow them.

---

## 6. Compose Configuration Checklist

Every service:

```yaml
restart: unless-stopped
read_only: true        # except DB/object-store or services needing temp files
tmpfs:
  - /tmp
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
```

Exceptions:

```text
object-store, corp-db/release-db if used, Gitea if used:
  need writable volumes

support-portal:
  needs writable /tmp for stage 2 marker only

build-server:
  needs writable artifact workspace volume

customer-app:
  needs writable small state directory for installed_version/recent updates
```

Required aliases:

| Service | Alias |
|---|---|
| `wiki` | `wiki.corp.local` |
| `ticket-service` | `tickets.corp.local` |
| `source-repo` | `git.dev.local` |
| `build-server` | `build.dev.local` |
| `signing-service` | `signing.release.local` |
| `update-server` | `updates.release.local` |
| `customer-api` | `api.anrc.customer.local` |
| `object-store` | `objects.anrc.customer.local` |
| `c2-emulator` | `c2-emulator` |

---

## 7. Seed Data Checklist

Minimum v1 demo seed counts:

| Data class | Minimum | Must include |
|---|---:|---|
| Public pages | 5 | products, customers, docs, release notes |
| Wiki pages | 12 | release runbook, signing runbook, ANRC notes, legacy decoys |
| Tickets | 20 | build token partial clue, ANRC channel clue, legacy false leads |
| Repo files | 10 | `release.json`, `.env.sample`, README, CHANGELOG, CODEOWNERS |
| Release channels | 5 | stable, beta, internal-canary, anrc, legacy-2.5 |
| Customer exports | 5 | one final object, one PDF decoy, routine exports |
| Decoy tokens | 8 | expired build tokens, legacy ANRC tokens, replace-me examples |

Token placement:

| Secret/token | Valid location | Decoys |
|---|---|---|
| `BUILD_TRIGGER_TOKEN` | wiki `release/runbook-build-trigger` | `.env.sample`, old wiki page, legacy ticket |
| `CUSTOMER_ANRC_CHANNEL_TOKEN` | held by `customer-app`; optional restricted doc clue only | decoy ANRC files/tickets |
| `SIGNING_KEY_ID` | public identifier in repo and signing runbook | old key IDs |
| `CUSTOMER_API_TOKEN` | held by `customer-app` only | none; teach trust-chain access, not token theft |

---

## 8. Audit Event Schema

All services should emit events to `audit-log` in this shape:

```json
{
  "ts": "2026-05-02T00:00:00Z",
  "service": "support-portal",
  "kind": "support.exploit.preview_triggered",
  "actor": "demo-operator",
  "technique": "T1190",
  "stage_id": "flag_1_initial_access",
  "subject": "POST /preview",
  "data": {
    "request_id": "uuid",
    "safe": true
  }
}
```

The `technique` field is required for all major events so the instructor can
filter logs by MITRE technique during the debrief.

---

## 9. Implementation Priority

Build in this order:

1. `edge-proxy`, `public-site`, `public-docs`
2. `support-portal` with lab-guarded initial access
3. `audit-log` and `flag-service`
4. `c2-emulator`
5. `wiki`, `ticket-service`, `source-repo` with seed data
6. `build-server`
7. `signing-service`
8. `update-server`
9. `customer-app`, `customer-api`
10. `object-store`
11. polish: `monitoring`, `doc-portal`, `mail-web`

Do not start with optional enterprise polish. First make the complete
SolarWinds-inspired chain work from recon to final object.

---

## 10. Acceptance Test Matrix

| Test | Expected result |
|---|---|
| Public recon routes load | Stage 0 flag appears in build-info |
| Support preview exploit path used | Stage 1 marker readable; denied commands blocked |
| Three allowed foothold probes run | Stage 2 marker generated |
| Beacon registered | Stage 3 flag returned; audit event has `T1071.001` |
| Internal services discovered | At least four service probes logged |
| Release runbook read | Build token visible; audit event has `T1213`/`T1552` |
| Build job submitted with valid token | HTTP 202; invalid tokens rejected |
| Artifact generated | `LAB_BUILD_MARKER` exists |
| Manifest signed and published | ANRC manifest contains stage 7 flag |
| Customer app polls and applies update | `customer.update.applied` logged |
| Customer export discovered | Q2 export response contains discovery flag |
| Final object downloaded | Final flag returned; `T1530` event logged |

---

## 11. Instructor Debrief View

At the end of the demo, the instructor should be able to show a chronological
event stream like this:

```text
T1591      recon.route.viewed
T1190      support.exploit.preview_triggered
T1059.004  support.post_exploit.command_allowed
T1082      support.discovery.system_info
T1071.001  c2.beacon.registered
T1046      c2.discovery.service_probe
T1213      wiki.page.viewed
T1552      token.clue.accessed
T1550.001  api.token.accepted
T1608      build.artifact.created
T1195.002  release.manifest.published
T1072      customer.update.applied
T1530      object.final.downloaded
```

This event stream is the teaching bridge between the hands-on demo and the
MITRE ATT&CK taxonomy.

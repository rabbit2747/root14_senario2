# AI Implementation Instruction & Architecture Specification
# Orion Echo Enterprise APT Range — Final Design

Version: 1.0-final-conclusion  
Date: 2026-04-29  
Primary audience: AI coding agent / implementation assistant / infrastructure automation agent  
Language for produced application UI: English by default  
Operator language: Korean/English acceptable  
Runtime target: Docker-only training range

---

## 0. Mission Statement

Build a Docker-only, enterprise-style APT training range for UAE summer school students.

This project is **not** a single-CVE CTF and not a linear supply-chain demo. It must simulate a realistic corporate/institutional environment where students perform reconnaissance, discover vulnerable services, obtain footholds, stabilize access using a lab-controlled implant/C2 emulator, enumerate internal services, pivot through multiple network zones, perform lateral movement, interact with a supply-chain/build/update pipeline, enter a simulated customer environment, and collect a final flag.

The scenario is inspired by SolarWinds-style supply-chain compromise, but it must not reproduce real malware, real SUNBURST behavior, real destructive payloads, or unsafe host/container escape behavior.

Core principle:

```text
CVE / vulnerability discovery is a means to obtain foothold.
The real learning objective is multi-stage APT chaining:
recon → foothold → execution → persistence/C2 emulation → discovery → credential/token discovery → pivot → lateral movement → supply-chain path → trusted customer environment → final collection.
```

---

## 1. Safety and Scope Rules

The AI must follow these non-negotiable boundaries:

1. The system is for an isolated training range only.
2. Do not implement real malware.
3. Do not implement destructive payloads.
4. Do not implement external C2 infrastructure.
5. Do not implement Docker host escape, docker.sock abuse, privileged container abuse, kernel exploitation, worm behavior, or persistence outside the lab session.
6. Any persistence, backdoor, or C2 concept must be implemented only as a **lab-controlled emulator** inside the per-session Docker network.
7. Any CVE-like or real-CVE-inspired component must be container-contained and must not allow escape to host or other students' sessions.
8. Every student session must be isolated from every other student session.
9. Internet egress from scenario containers must be disabled by default.
10. The exercise must be realistic enough for training, but safe and bounded.

---

## 2. Target Deployment Model

### 2.1 Development

Development will be performed on Windows using WSL2.

```text
Windows 11
→ WSL2 Ubuntu 24.04
→ Docker Desktop WSL2 backend or Docker Engine inside WSL2
→ VS Code Remote WSL
```

Project must live inside the WSL filesystem:

```text
/home/<user>/orion-echo-range
```

Do not use Windows-mounted paths such as:

```text
/mnt/c/Users/<user>/project
```

### 2.2 Staging

AWS Seoul may be used for integration/staging.

Recommended staging instances:

```text
Small integration:
- AWS Seoul
- Ubuntu Server 24.04
- m7i.2xlarge
- 8 vCPU / 32 GiB RAM
- 500GB gp3

Larger staging:
- AWS Seoul
- Ubuntu Server 24.04
- m7i.4xlarge
- 16 vCPU / 64 GiB RAM
- 1TB gp3
```

### 2.3 Production / Summer School

Production for UAE students must be hosted in OCI UAE.

Recommended production configurations:

```text
Cost-optimized production:
- OCI UAE
- VM.Standard.E4.Flex
- 24 OCPU
- 384GB RAM
- 4TB Block Volume
- Ubuntu Server 24.04

Stable production:
- OCI UAE
- VM.Standard.E4.Flex
- 32 OCPU
- 512GB RAM
- 4TB Block Volume
- Ubuntu Server 24.04
```

The original 16 OCPU / 256GB plan is only acceptable for the older linear supply-chain demo. For the final enterprise APT range, use at least 24 OCPU / 384GB if 20 concurrent sessions are expected.

---

## 3. Virtual Enterprise Theme

### 3.1 Organization

```text
Company name: Orion Echo Systems LLC
Industry: UAE-based industrial monitoring and smart facility operations software vendor
Region: UAE / Middle East
Primary customers: research campuses, industrial operators, logistics companies, smart-building operators, critical facility operators
```

### 3.2 Products

```text
EchoAgent
- Monitoring agent installed in customer facilities.

EchoUpdate
- Update distribution channel for EchoAgent.

EchoInsights
- Customer-facing analytics and operational dashboard.

EchoCollector
- Internal service collecting telemetry, logs, and audit exports.
```

### 3.3 Simulated Customer

```text
Customer name: Al Noor Research Campus
Short name: ANRC
Final objective: ANRC facility audit export data stored in object storage.
```

### 3.4 Business Story

Orion Echo Systems provides monitoring software to ANRC. Students are told that ANRC observed suspicious activity related to EchoAgent update behavior. The suspected root cause is not ANRC itself but Orion Echo's build/update pipeline and trusted update relationship.

The student must reproduce an attacker path through Orion Echo's public, corporate, DevOps, release, and customer-connected services to reach ANRC audit data.

---

## 4. High-Level Attack Chain

The final chain must follow this structure:

```text
External Recon
→ CVE / Initial Foothold
→ Shell / Execution
→ Lab-controlled Persistence & C2 Emulation
→ Internal Discovery
→ Credential / Token Discovery
→ Pivot to Corporate Services
→ Lateral Movement to DevOps
→ Build / Release Chain
→ Trusted Update to Customer Environment
→ Customer Discovery
→ Object Store Collection
→ Final Flag
```

The student should not be given a direct sequence. The environment must contain enough decoys, dead ends, documents, stale credentials, and partial hints that the student must decide what matters.

---

## 5. Network Architecture

Each student session must create a separate Docker Compose project and networks.

### 5.1 Per-Session Networks

```text
public_net
- External entrypoint network.

dmz_net
- Public/DMZ-facing vendor services.

corp_net
- Internal corporate services.

dev_net
- Development and CI/CD services.

release_net
- Signing and update distribution services.

customer_net
- Simulated ANRC customer environment.

control_net
- Internal lab control, flags, session agent, and emulator services.
```

### 5.2 Network Reachability Principles

```text
Student → public_net / selected dmz_net services: allowed
Student → corp_net: denied by default
Student → dev_net: denied by default
Student → release_net: denied by default
Student → customer_net: denied by default
Session A → Session B: denied
Scenario containers → Internet: denied by default
Scenario containers → Docker host management: denied
```

Students must move through intended footholds and trust paths.

---

## 6. Container Inventory

Per student session, create approximately 20 containers.

### 6.1 Public / DMZ Containers

| Container | Purpose | Technology | Network |
|---|---|---|---|
| `edge-proxy` | External entrypoint and routing | Nginx or Traefik | public_net, dmz_net |
| `public-site` | Company marketing site | Static or FastAPI | dmz_net |
| `public-docs` | Public documentation and release notes | Static docs / FastAPI | dmz_net |
| `vendor-portal` | Customer/partner portal | Custom FastAPI | dmz_net, corp_net limited |
| `support-portal` | Support/ticket-facing portal | Custom FastAPI | dmz_net |

### 6.2 Corporate Containers

| Container | Purpose | Technology | Network |
|---|---|---|---|
| `corp-sso` | OIDC-lite identity provider | Custom FastAPI | corp_net |
| `intranet` | Internal portal | Custom FastAPI | corp_net |
| `wiki` | Internal knowledge base | Custom FastAPI Markdown Wiki | corp_net |
| `ticket-service` | Helpdesk/issues | Custom FastAPI | corp_net |
| `hr-directory` | Employees, teams, departments | Custom FastAPI | corp_net |
| `mail-web` | Mail/webmail simulator | Mailpit/MailHog or custom | corp_net |
| `doc-portal` | Internal document portal | Custom FastAPI | corp_net |
| `corp-db` | Corporate data backend | PostgreSQL | corp_net |

### 6.3 DevOps / Supply Chain Containers

| Container | Purpose | Technology | Network |
|---|---|---|---|
| `source-repo` | Git repository service | Gitea rootless | dev_net |
| `package-registry` | Internal package registry | Docker Registry or custom API | dev_net |
| `build-server` | Build API and artifact generator | Custom FastAPI + worker | dev_net, release_net |
| `ci-runner` | CI execution simulator | Custom runner | dev_net |
| `signing-service` | Lab-only signing service | FastAPI HMAC signing | release_net |
| `update-server` | Update manifest and artifact channel | FastAPI/Nginx | release_net, customer_net |
| `release-db` | Release metadata | PostgreSQL or SQLite | release_net |

### 6.4 Customer Environment Containers

| Container | Purpose | Technology | Network |
|---|---|---|---|
| `customer-app` | EchoAgent installed at ANRC | Custom FastAPI app + polling worker | customer_net |
| `customer-api` | Internal ANRC API | Custom FastAPI | customer_net |
| `object-store` | Final data store | MinIO | customer_net |
| `monitoring` | Read-only customer status dashboard | Custom page | customer_net |
| `audit-log` | Audit/event log service | Custom FastAPI | customer_net |

### 6.5 Control Containers

| Container | Scope | Purpose | Technology |
|---|---|---|---|
| `session-agent` | Per-session | Health, TTL, stage state | Custom FastAPI/Python worker |
| `c2-emulator` | Per-session | Lab-controlled implant/C2 simulation | Custom FastAPI/websocket or HTTP |
| `flag-service` | Shared | Dynamic flag issue/verify | Custom FastAPI |
| `lab-controller` | Shared | Session lifecycle orchestration | Custom FastAPI |
| `ctfd` | Shared | User/challenge/scoreboard | CTFd |
| `ctfd-db` | Shared | CTFd DB | PostgreSQL |
| `ctfd-cache` | Shared | CTFd cache/session | Redis |
| `reverse-proxy` | Shared | Global routing | Nginx/Traefik |
| `registry` | Shared | Internal image registry | registry:2 |
| `prometheus` | Shared | Metrics | Prometheus |
| `grafana` | Shared | Operator dashboard | Grafana |

---

## 7. Technology Stack Policy

Use a hybrid of real products and custom simulators.

### 7.1 Real Products to Use

Use real products where they provide realism without high complexity:

```text
Gitea
PostgreSQL
Redis
MinIO
Nginx or Traefik
Mailpit or MailHog
Docker Registry
CTFd
Prometheus/Grafana for operator monitoring
```

### 7.2 Custom Services to Build

Use custom FastAPI services where exact scenario control is needed:

```text
vendor-portal
public-site / public-docs
corp-sso OIDC-lite
intranet
wiki
ticket-service
hr-directory
doc-portal
monitoring page
build-server
ci-runner
signing-service
update-server
customer-app
customer-api
audit-log
session-agent
c2-emulator
flag-service
lab-controller
```

### 7.3 SSO Decision

MVP: implement `corp-sso` as a custom FastAPI OIDC-lite simulator.  
Advanced version: consider a shared Keycloak instance with per-session realm/client/user seeding.

Do not run full Keycloak per student session due to memory cost.

### 7.4 Wiki Decision

Use a custom FastAPI Markdown wiki. Do not run Wiki.js per session.

### 7.5 Monitoring Decision

Use a custom per-session monitoring/status page for students. Use real Grafana only for shared operator monitoring.

### 7.6 File Service Decision

Use MinIO + document portal. Do not use Samba in the first Docker-only version.

---

## 8. Realism and Fidelity Requirements

The environment must not look like a toy FastAPI demo.

### 8.1 Must Remove Default Framework Fingerprints

For all custom FastAPI production containers:

```text
Disable /docs
Disable /redoc
Disable default OpenAPI exposure unless explicitly needed internally
Hide uvicorn/server banners behind reverse proxy
Use custom 404/403/500 pages
Return realistic error JSON with request_id, timestamp, service name
Set realistic cookies and headers
```

### 8.2 UI and Design System

Create a consistent Orion Echo identity:

```text
Logo
Color palette
Header/footer
Product names
Department names
Internal/external UI separation
```

Different service classes should feel different:

```text
public-site: polished external marketing site
vendor-portal: customer/partner portal
intranet/wiki: corporate internal tools
ticket-service: utilitarian helpdesk
monitoring: operational status dashboard
```

### 8.3 Seed Data Minimums

The range must include realistic volume, not only one or two hints.

```text
Employees: 40–80
Departments: 6–8
Wiki pages: 40–80
Tickets: 80–150
Emails/notices: 30–60
Release notes: 20–40
Git commits: 50–100
Customers: 5–10
Service accounts: 10–20
Decoy credentials: many
```

### 8.4 Hint Quality Ratio

```text
Valid clues: 20%
Partial clues: 30%
Invalid/expired/decoy clues: 50%
```

### 8.5 Service Metadata

All services should expose realistic metadata internally:

```text
/service/health
/service/version
/build-info
/status
request_id in responses
service version
build id
release channel
tenant/customer id
```

---

## 9. Intended APT Training Stages

### Stage 0 — External Recon

Purpose: identify company, products, exposed services, customers, release process.

Services:

```text
edge-proxy
public-site
public-docs
vendor-portal
support-portal
```

Flag:

```text
flag_0_recon_context
```

---

### Stage 1 — Initial Access via Vulnerable Public Service

Purpose: find a vulnerable public/DMZ service and obtain first foothold.

Allowed weakness types:

```text
CVE-inspired RCE
old component vulnerability
file upload flaw
template injection
support-portal auth bypass
public-docs generator flaw
```

Result must be limited:

```text
limited shell or implant registration
limited service account
access to only part of internal network
```

Flag:

```text
flag_1_initial_access
```

---

### Stage 2 — Execution and Foothold Stabilization

Purpose: understand the first foothold and execution context.

Student tasks:

```text
identify current user
inspect filesystem
enumerate environment
identify reachable services
prepare for internal discovery
```

Flag:

```text
flag_2_foothold_execution
```

---

### Stage 3 — Persistence / C2 Emulation

Purpose: teach post-exploitation foothold management in a safe way.

Implementation:

```text
c2-emulator inside control_net only
lab-controlled implant emulator
predefined safe actions only
no real malware
no stealth/evasion
no external callback
```

Allowed emulator actions:

```text
register host
list reachable services
run limited discovery command
collect predefined artifact
mark persistence simulated
```

Flag:

```text
flag_3_persistence_c2
```

---

### Stage 4 — Internal Discovery

Purpose: discover corporate services and identify useful paths.

Services:

```text
corp-sso
intranet
wiki
ticket-service
hr-directory
mail-web
doc-portal
```

Student tasks:

```text
identify internal hostnames
read wiki/ticket/docs
filter decoys
identify source-repo and build pipeline references
understand service account naming
```

Flag:

```text
flag_4_internal_discovery
```

---

### Stage 5 — Credential / Token Discovery

Purpose: find valid credentials/tokens among many decoys.

Valid clue examples:

```text
BUILD_TRIGGER_TOKEN
RELEASE_STAGING_TOKEN
CUSTOMER_ANRC_CHANNEL
SOURCE_REPO_PROJECT=echo-agent
```

Decoy examples:

```text
OLD_BUILD_TOKEN=expired
STAGING_API_KEY=wrong-scope
ANRC_LEGACY_SECRET=revoked
ADMIN_EMAIL=disabled
PUBLIC_BUCKET_TOKEN=read-only sample data
```

Flag:

```text
flag_5_credential_material
```

---

### Stage 6 — Lateral Movement to DevOps

Purpose: move from corporate services into DevOps/build environment.

Services:

```text
source-repo
build-server
ci-runner
package-registry
```

Student tasks:

```text
access source-repo
analyze build.yml / release.json
trigger safe build job
inspect artifacts
understand CI runner path
```

Flag:

```text
flag_6_devops_lateral_movement
```

---

### Stage 7 — Build Pipeline and Supply Chain Stage

Purpose: model SolarWinds-style supply-chain update path safely.

Services:

```text
build-server
ci-runner
signing-service
update-server
```

Never produce malware. Use benign marker:

```text
ORION_ECHO_BUILD_MARKER={session_id}
```

Student tasks:

```text
create build job
generate artifact
request lab-only signature
publish manifest to allowed channel
```

Flag:

```text
flag_7_supply_chain_stage
```

---

### Stage 8 — Trusted Relationship to Customer Environment

Purpose: use the trusted update relationship to reach customer environment.

Services:

```text
update-server
customer-app
customer-api
```

Concept:

```text
Vendor update channel
→ Customer app trust
→ Customer API token
→ Customer internal data path
```

Flag:

```text
flag_8_customer_reach
```

---

### Stage 9 — Customer Environment Discovery

Purpose: enumerate ANRC APIs, monitoring, audit logs, and object storage hints.

Services:

```text
customer-api
monitoring
audit-log
object-store
```

Student tasks:

```text
inspect metadata
identify facilities/audits/exports endpoints
identify object-store bucket names
understand token scope
```

Flag:

```text
flag_9_customer_discovery
```

---

### Stage 10 — Final Collection

Purpose: access final ANRC audit export.

Objects:

```text
anrc-audit-exports/2026/Q2/facility-risk-summary.pdf
anrc-audit-exports/2026/Q2/project-orion-echo-final.txt
```

Flag:

```text
flag_10_final_objective
```

---

## 10. CVE / Vulnerability Usage Policy

CVE usage is allowed and encouraged when it supports realistic foothold and pivot training.

### Allowed

```text
CVE-inspired initial foothold
container-contained RCE
application-layer exploit
old public-service vulnerability
intermediate foothold on internal service
```

### Required Behavior

```text
CVE success must lead to shell/foothold, not final flag.
Student must still perform discovery, credential/token discovery, pivot, lateral movement, and final collection.
```

### Prohibited

```text
Docker host escape
docker.sock abuse
privileged container abuse
kernel exploits
wormable payloads
destructive payloads
external C2
real malware
one-CVE-to-final-flag design
```

---

## 11. Flag System

Use dynamic per-session flags.

```text
FLAG = HMAC(secret, session_id + stage_id)
```

Flag stages:

```text
flag_0_recon_context
flag_1_initial_access
flag_2_foothold_execution
flag_3_persistence_c2
flag_4_internal_discovery
flag_5_credential_material
flag_6_devops_lateral_movement
flag_7_supply_chain_stage
flag_8_customer_reach
flag_9_customer_discovery
flag_10_final_objective
```

Flag-service APIs:

```text
POST /verify
GET /internal/flags/{session_id}/{stage_id}
POST /internal/stage-complete
```

Only internal components may request flag generation. Students submit flags through CTFd.

---

## 12. Session Lifecycle

### 12.1 Create Session

API:

```text
POST /sessions
```

Steps:

```text
1. Generate session_id.
2. Generate session_secret.
3. Generate per-session .env.
4. Generate Docker Compose project name.
5. Create per-session networks.
6. Start containers.
7. Seed corp-db.
8. Seed Gitea repositories.
9. Seed MinIO buckets and objects.
10. Seed wiki/tickets/mail/docs.
11. Generate flags.
12. Register reverse proxy route.
13. Register CTFd metadata.
14. Return session URL.
```

### 12.2 Delete Session

API:

```text
DELETE /sessions/{id}
```

Steps:

```text
1. Lock session.
2. Remove reverse proxy route.
3. Stop Compose project.
4. Archive logs if enabled.
5. Remove volumes according to retention policy.
6. Remove networks.
7. Update CTFd state.
8. Mark session deleted.
```

### 12.3 Reset Session

API:

```text
POST /sessions/{id}/reset
```

Equivalent to delete + create with the same user/challenge association and new session_secret.

### 12.4 TTL

```text
Default TTL: 180 minutes
Warning: 10 minutes before expiration
Extension: instructor-only
Cleanup: automatic
```

---

## 13. API Contract Requirements

The Engineering Specification must define exact schemas for:

```text
update-server manifest JSON
signing-service request/response
build-server job request/response
customer-app update polling response
customer-api auth and metadata response
lab-controller session APIs
flag-service verification API
OIDC-lite endpoints
```

Minimum APIs:

```text
vendor-portal:
- GET /health
- GET /releases
- GET /docs
- POST /login
- GET /me

corp-sso:
- GET /.well-known/openid-configuration
- GET /oauth/authorize
- POST /oauth/token
- GET /oauth/userinfo
- GET /oauth/jwks

build-server:
- POST /api/jobs
- GET /api/jobs/{job_id}
- GET /api/artifacts/{artifact_id}
- GET /api/environment

signing-service:
- POST /api/sign
- POST /api/verify

update-server:
- GET /channels/{channel}/manifest.json
- GET /artifacts/{artifact_name}
- POST /internal/publish

customer-api:
- GET /metadata
- GET /facilities
- GET /audits
- GET /exports
- GET /exports/{id}

lab-controller:
- POST /sessions
- GET /sessions/{id}
- DELETE /sessions/{id}
- POST /sessions/{id}/reset
- GET /sessions/{id}/health

flag-service:
- POST /verify
- GET /internal/flags/{session_id}/{stage_id}
```

---

## 14. Example Manifest Schema

```json
{
  "product": "EchoAgent",
  "channel": "customer-anrc",
  "version": "2.6.4",
  "build_id": "build-2026-0429-001",
  "artifact": {
    "name": "echo-agent-2.6.4.tar.gz",
    "sha256": "PLACEHOLDER",
    "url": "http://update-server:8081/artifacts/echo-agent-2.6.4.tar.gz"
  },
  "signature": {
    "alg": "HMAC-SHA256",
    "kid": "orion-lab-signing-key",
    "value": "PLACEHOLDER"
  },
  "metadata": {
    "customer": "anrc",
    "generated_at": "2026-04-29T00:00:00Z"
  }
}
```

---

## 15. Resource Limits

Initial container resource limits should be specified in Compose.

Approximate per-session limits:

| Container | RAM Limit | CPU Limit |
|---|---:|---:|
| edge-proxy | 128MB | 0.25 |
| public-site | 128MB | 0.25 |
| public-docs | 128MB | 0.25 |
| vendor-portal | 384MB | 0.5 |
| support-portal | 256MB | 0.25 |
| corp-sso | 256MB | 0.5 |
| intranet | 256MB | 0.25 |
| wiki | 256MB | 0.25 |
| ticket-service | 384MB | 0.5 |
| hr-directory | 256MB | 0.25 |
| mail-web | 256MB | 0.25 |
| doc-portal | 256MB | 0.25 |
| corp-db | 512MB | 0.5 |
| source-repo | 768MB | 1.0 |
| package-registry | 512MB | 0.5 |
| build-server | 768MB | 1.0 |
| ci-runner | 512MB | 1.0 |
| signing-service | 256MB | 0.25 |
| update-server | 384MB | 0.5 |
| release-db | 256MB | 0.25 |
| customer-app | 384MB | 0.5 |
| customer-api | 384MB | 0.5 |
| object-store | 1GB | 1.0 |
| monitoring | 256MB | 0.25 |
| audit-log | 256MB | 0.25 |
| c2-emulator | 256MB | 0.5 |
| session-agent | 128MB | 0.25 |

Expected per session:

```text
Average RAM: 5–7GB
Upper bound RAM: 8–10GB
Average CPU: 1.5–3 vCPU
```

---

## 16. Repository Layout

```text
orion-echo-range/
├── compose/
│   ├── compose.base.yml
│   ├── compose.dev.yml
│   ├── compose.staging.yml
│   └── compose.prod.yml
├── services/
│   ├── edge-proxy/
│   ├── public-site/
│   ├── public-docs/
│   ├── vendor-portal/
│   ├── support-portal/
│   ├── corp-sso/
│   ├── intranet/
│   ├── wiki/
│   ├── ticket-service/
│   ├── hr-directory/
│   ├── mail-web/
│   ├── doc-portal/
│   ├── source-repo-seed/
│   ├── package-registry/
│   ├── build-server/
│   ├── ci-runner/
│   ├── signing-service/
│   ├── update-server/
│   ├── customer-app/
│   ├── customer-api/
│   ├── monitoring/
│   ├── audit-log/
│   ├── c2-emulator/
│   ├── session-agent/
│   ├── flag-service/
│   └── lab-controller/
├── seed/
│   ├── employees/
│   ├── wiki/
│   ├── tickets/
│   ├── mail/
│   ├── releases/
│   ├── gitea/
│   ├── minio/
│   ├── credentials/
│   └── decoys/
├── scripts/
│   ├── create-session.sh
│   ├── destroy-session.sh
│   ├── reset-session.sh
│   ├── seed-session.sh
│   ├── cleanup-expired.sh
│   └── health-check.sh
├── infra/
│   ├── aws-dev/
│   └── oci-prod/
└── docs/
    ├── ai_instruction.md
    ├── team_plan.md
    ├── engineering_spec.md
    ├── api_contracts.md
    ├── network_matrix.md
    ├── seed_data_spec.md
    └── instructor_guide.md
```

---

## 17. Implementation Order

### Phase 1 — Foundation

```text
1. Set up repository.
2. Create base Docker Compose.
3. Implement shared reverse proxy.
4. Implement lab-controller skeleton.
5. Implement flag-service skeleton.
6. Implement session create/delete lifecycle.
```

### Phase 2 — Enterprise Shell

```text
1. Build public-site, vendor-portal, public-docs.
2. Build corp-sso OIDC-lite.
3. Build intranet/wiki/ticket/hr/doc services.
4. Seed employees, tickets, wiki pages, docs.
5. Add decoys and stale credentials.
```

### Phase 3 — DevOps and Supply Chain

```text
1. Deploy Gitea rootless.
2. Seed repositories.
3. Build build-server and ci-runner.
4. Build signing-service.
5. Build update-server.
6. Define artifact and manifest flow.
```

### Phase 4 — Customer Environment

```text
1. Build customer-app.
2. Build customer-api.
3. Deploy MinIO object-store.
4. Seed ANRC buckets and objects.
5. Build monitoring and audit-log services.
```

### Phase 5 — APT Chain Hooks

```text
1. Add initial foothold vulnerability hook.
2. Add lab-controlled implant/C2 emulator registration flow.
3. Add internal discovery hooks.
4. Add credential/token discovery hooks.
5. Add DevOps lateral movement hook.
6. Add update-channel trust hook.
7. Add customer discovery and final collection hook.
```

### Phase 6 — Realism Pass

```text
1. Disable FastAPI docs/redoc.
2. Customize error pages.
3. Add request IDs and build metadata.
4. Add realistic UI/branding.
5. Expand seed data.
6. Add decoy/dead-end data.
7. Validate service behavior by scanning.
```

### Phase 7 — Load Test

```text
1. Run 1 session locally.
2. Run 3–5 sessions on AWS staging.
3. Run 20 sessions on OCI UAE production-sized instance.
4. Tune CPU/memory limits.
5. Validate cleanup.
6. Validate flag uniqueness.
```

---

## 18. Pricing Guidance

### 18.1 Development

```text
Windows + WSL2: 0 KRW
Docker Desktop: free only if license terms allow; otherwise paid
AWS staging: optional
```

### 18.2 AWS Staging

Approximate monthly cost when used only during work hours:

```text
m7i.2xlarge + 500GB gp3: ~180,000–240,000 KRW/month
m7i.4xlarge + 1TB gp3: ~340,000–500,000 KRW/month
```

### 18.3 OCI UAE Production for Summer School

For 4-week 24/7 run:

```text
16 OCPU / 256GB: ~1.2M–1.6M KRW
24 OCPU / 384GB: ~1.8M–2.4M KRW
32 OCPU / 512GB: ~2.4M–3.2M KRW
```

Recommendation:

```text
Minimum: 24 OCPU / 384GB
Stable: 32 OCPU / 512GB
```

---

## 19. Definition of Done

The implementation is acceptable when:

1. A student can start a session and receive a unique URL.
2. Per-session networks are isolated.
3. The environment contains public, corporate, DevOps, release, and customer zones.
4. Student cannot directly access corp/dev/release/customer zones from outside.
5. Student can progress through at least 10 APT stages.
6. CVE/foothold stage leads only to limited foothold, not final flag.
7. Lab-controlled C2 emulator works inside the session only.
8. Dynamic flags are unique per session.
9. Decoys and dead ends are present.
10. FastAPI default fingerprints are removed.
11. 20 concurrent sessions run on OCI UAE target hardware.
12. TTL cleanup reliably removes containers, volumes, networks, and routes.

---

## 20. Final Instruction to AI Implementer

Do not build a toy CTF. Build a realistic enterprise APT training range.

Every service must exist for one of these reasons:

```text
1. It supports the business story.
2. It provides a realistic discovery surface.
3. It contains a valid clue.
4. It contains a partial clue.
5. It contains a decoy or dead end.
6. It participates in the intended APT chain.
```

The final student experience must be:

```text
Explore → identify → test → foothold → stabilize → discover → filter noise → pivot → move laterally → abuse supply-chain trust → discover customer environment → collect final objective.
```


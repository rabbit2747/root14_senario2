# Team Planning Report
# Orion Echo Enterprise APT Training Range — Final Plan

Version: 1.0-final-conclusion  
Date: 2026-04-29  
Audience: project stakeholders, instructors, developers, infrastructure team  
Primary goal: UAE summer school APT hands-on training environment

---

## 1. Executive Summary

We are building a Docker-only, enterprise-style APT training range for UAE summer school students.

The project has evolved from a simple SolarWinds-inspired supply-chain demo into a realistic enterprise/institution simulation. The goal is not to teach students to solve one CVE or follow a linear path. The goal is to train students to perform realistic APT-style penetration testing:

```text
external reconnaissance
→ vulnerable service discovery
→ initial foothold
→ shell/execution
→ lab-controlled persistence and C2 emulation
→ internal discovery
→ credential/token discovery
→ pivot
→ lateral movement
→ supply-chain/build/update path
→ customer environment discovery
→ final data collection
```

The final scenario is called **Operation Orion Echo** and is inspired by SolarWinds-style software supply-chain compromise, but it is implemented safely in a bounded lab environment. No real malware, destructive payloads, external C2, Docker host escape, or unsafe container abuse will be implemented.

---

## 2. Training Philosophy

This platform must not become a “single CVE to flag” CTF.

CVE-style vulnerabilities are allowed and useful, but they are only one part of the chain. A CVE should give the student a foothold. After that, the student must discover internal systems, stabilize access using a lab-only emulator, identify useful credentials or tokens, pivot to new services, and chain multiple techniques to reach the final goal.

The learning objectives are:

```text
- enterprise reconnaissance
- service discovery
- vulnerability validation
- foothold management
- controlled persistence/C2 concepts
- internal discovery
- credential and token discovery
- pivoting
- lateral movement
- CI/CD and supply-chain trust understanding
- customer environment discovery
- final objective collection
```

The experience should feel closer to a real corporate penetration test than a puzzle room.

---

## 3. Virtual Enterprise Theme

### 3.1 Organization

```text
Name: Orion Echo Systems LLC
Location: UAE / Middle East
Industry: industrial monitoring and smart facility operations software
```

Orion Echo Systems provides monitoring agents and analytics software for research campuses, smart buildings, industrial facilities, logistics hubs, and other operational environments.

### 3.2 Products

```text
EchoAgent
- Customer-side monitoring agent.

EchoUpdate
- Update channel for EchoAgent.

EchoInsights
- Analytics dashboard for operational data.

EchoCollector
- Telemetry and audit export collection component.
```

### 3.3 Simulated Customer

```text
Customer: Al Noor Research Campus, ANRC
Final target: ANRC facility audit export data
```

The scenario story is that suspicious access was observed in ANRC’s environment, and the suspected root cause is Orion Echo’s vendor build/update pipeline and trusted software update relationship.

---

## 4. Why This Must Be an Enterprise Range, Not a Linear Demo

A simple flow such as:

```text
vendor portal → source repo → build server → update server → final flag
```

is too linear and does not provide enough realistic practice.

A real APT-style lab must include:

```text
- external services
- internal corporate services
- documentation systems
- ticket systems
- mail or notification systems
- employee and department data
- source repositories
- build systems
- release/update systems
- customer-connected systems
- monitoring and audit services
- decoys and dead ends
```

Students must learn to decide what matters and what does not.

---

## 5. Final Attack Chain

The intended training chain is:

```text
1. External Recon
2. Initial Access through vulnerable public service or CVE-like issue
3. Execution and limited foothold
4. Lab-controlled Persistence / C2 Emulation
5. Internal Discovery
6. Credential / Token Discovery
7. Pivot into corporate services
8. Lateral Movement to DevOps environment
9. Build / Release / Update-chain interaction
10. Trusted update relationship into customer environment
11. Customer environment discovery
12. Object-store collection and final flag
```

This chain is designed to train multi-technique APT reasoning rather than single-vulnerability exploitation.

---

## 6. Infrastructure Model

The platform will be Docker-only for the first version.

Each student session gets a separate Docker Compose project and isolated networks. Around 20 containers are created per student session.

Expected concurrent users: 20 students.

Estimated total runtime size:

```text
Per session: 18–22 containers
20 sessions: ~400 containers
Shared platform containers: ~10–12 containers
```

---

## 7. Container Groups

### 7.1 Public / DMZ Services

These are externally visible or near-external services.

| Service | Purpose |
|---|---|
| edge-proxy | External entrypoint and routing |
| public-site | Company website |
| public-docs | Product documentation and release notes |
| vendor-portal | Partner/customer portal |
| support-portal | Support portal and public-facing issue interface |

These provide the first reconnaissance surface and potential initial-access foothold.

---

### 7.2 Corporate Internal Services

| Service | Purpose |
|---|---|
| corp-sso | OIDC-lite identity provider |
| intranet | Internal corporate portal |
| wiki | Internal knowledge base |
| ticket-service | Helpdesk and engineering tickets |
| hr-directory | Employees, teams, departments |
| mail-web | Mail/webmail simulator |
| doc-portal | Internal document portal |
| corp-db | Internal corporate data store |

These provide internal discovery, decoys, documents, tickets, identity hints, and token/credential discovery opportunities.

---

### 7.3 DevOps / Supply Chain Services

| Service | Purpose |
|---|---|
| source-repo | Gitea-based source repository |
| package-registry | Internal package or image registry |
| build-server | Build pipeline API |
| ci-runner | CI runner simulator |
| signing-service | Lab-only signing/HMAC service |
| update-server | Update manifest and artifact distribution |
| release-db | Release metadata store |

This is the SolarWinds-inspired supply-chain area of the lab.

---

### 7.4 Customer Environment Services

| Service | Purpose |
|---|---|
| customer-app | EchoAgent instance at ANRC |
| customer-api | ANRC internal API |
| object-store | MinIO storage containing final data |
| monitoring | Read-only customer status dashboard |
| audit-log | Audit and event log service |

This environment represents the simulated customer network reached through vendor trust.

---

### 7.5 Control and Platform Services

| Service | Purpose |
|---|---|
| CTFd | Student portal, challenge, score, flag submission |
| lab-controller | Session creation, deletion, reset, health |
| flag-service | Dynamic per-session flags |
| c2-emulator | Lab-only persistence/C2 training emulator |
| session-agent | Per-session health and TTL management |
| reverse-proxy | Global routing |
| registry | Internal Docker image registry |
| Prometheus/Grafana | Operator monitoring |

---

## 8. Network Design

Each session has isolated networks:

```text
public_net
- edge-proxy

dmz_net
- public-site, public-docs, vendor-portal, support-portal

corp_net
- SSO, intranet, wiki, ticket-service, HR, mail, docs, corporate DB

dev_net
- source repo, package registry, build server, CI runner

release_net
- signing service, update server, release DB

customer_net
- customer app, customer API, object store, monitoring, audit log

control_net
- session agent, C2 emulator, flag-service access
```

Students can access public/DMZ entrypoints only. They must obtain foothold and pivot through intended paths to reach internal zones.

---

## 9. CVE and Vulnerability Policy

CVE-style or real-CVE-inspired issues are allowed and useful.

However, a CVE must not directly reveal the final flag. It should provide a foothold or an intermediate foothold.

Allowed uses:

```text
- initial foothold
- internal service foothold
- application-layer compromise
- limited shell
- access to next discovery point
```

Not allowed:

```text
- Docker host escape
- docker.sock abuse
- privileged container abuse
- kernel exploits
- destructive payloads
- external C2
- real malware
- single CVE to final flag
```

This keeps the environment realistic but safe.

---

## 10. Lab-Controlled Persistence and C2 Emulation

APT training should include persistence and C2 concepts, but not real malware.

The range will include a **lab-controlled implant/C2 emulator**.

It may support safe actions such as:

```text
- registering a foothold
- showing reachable services
- running predefined discovery actions
- collecting predefined artifacts
- marking persistence as simulated
```

It must not support arbitrary destructive commands, stealth, evasion, external callback, worming, or real malware-like behavior.

---

## 11. Realism Requirements

The range must look and behave like a real enterprise environment.

Custom FastAPI services are acceptable, but they must not look like simple toy apps.

Required quality controls:

```text
- disable /docs and /redoc in production mode
- remove obvious uvicorn/FastAPI fingerprints
- custom 404/403/500 pages
- realistic request IDs and error messages
- consistent Orion Echo branding
- realistic employee, ticket, wiki, release, and customer data
- valid, partial, expired, and false credentials mixed together
- service version/build/status metadata
- realistic host and service naming
```

Recommended seed data:

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
```

Clue ratio:

```text
Valid clues: 20%
Partial clues: 30%
Invalid/expired/decoy clues: 50%
```

---

## 12. Flag / Checkpoint Plan

The scenario should have multiple checkpoints.

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

Flags must be dynamic per student session.

```text
FLAG = HMAC(secret, session_id + stage_id)
```

This prevents students from sharing static flags.

---

## 13. Development Workflow

### Local Development

```text
Windows 11
WSL2 Ubuntu 24.04
Docker Desktop WSL2 backend or Docker Engine in WSL2
VS Code Remote WSL
```

### Staging

AWS Seoul may be used for integration testing.

```text
m7i.2xlarge: 8 vCPU / 32GiB RAM
m7i.4xlarge: 16 vCPU / 64GiB RAM
```

### Production

OCI UAE should be used for summer school operations, because students are in UAE.

---

## 14. Production Sizing and Price Estimate

The enterprise range is larger than the original simple supply-chain demo.

### Expected Runtime

```text
Per student: 18–22 containers
20 students: ~400 containers
Average RAM per session: 5–7GB
Upper bound RAM per session: 8–10GB
```

### Recommended OCI UAE Sizing

| Option | Spec | Use Case |
|---|---|---|
| Minimum | 24 OCPU / 384GB RAM / 4TB block volume | Cost-conscious summer school |
| Stable | 32 OCPU / 512GB RAM / 4TB block volume | Safer for 20 concurrent users |

### 4-Week Estimated Cost

| Option | Estimated Cost |
|---|---:|
| 16 OCPU / 256GB RAM | 1.2M–1.6M KRW |
| 24 OCPU / 384GB RAM | 1.8M–2.4M KRW |
| 32 OCPU / 512GB RAM | 2.4M–3.2M KRW |

Recommendation:

```text
Use 24 OCPU / 384GB as the minimum.
Use 32 OCPU / 512GB if budget allows.
```

---

## 15. Build Phases

### Phase 1 — Foundation

```text
- repository structure
- base Docker Compose
- reverse proxy
- lab-controller skeleton
- flag-service skeleton
- session create/delete/reset
```

### Phase 2 — Enterprise Environment

```text
- public site
- vendor portal
- corp SSO
- intranet/wiki/ticket/HR/mail/doc portal
- realistic seed data
- decoys and dead ends
```

### Phase 3 — DevOps / Supply Chain

```text
- Gitea
- source repositories
- build server
- CI runner
- signing service
- update server
- artifact/manifest flow
```

### Phase 4 — Customer Environment

```text
- customer app
- customer API
- object store
- monitoring
- audit log
- ANRC final data
```

### Phase 5 — APT Chain Hooks

```text
- initial foothold vulnerability hook
- controlled implant/C2 emulator
- internal discovery hooks
- credential/token discovery
- DevOps lateral movement
- update trust relationship
- final collection
```

### Phase 6 — Realism Pass

```text
- remove framework fingerprints
- improve UI and documents
- expand seed data
- add decoys
- scanning validation
- student walkthrough validation
```

### Phase 7 — Load Test

```text
- 1 session locally
- 3–5 sessions on AWS staging
- 20 sessions on OCI UAE target spec
- tune resource limits
- validate cleanup and logs
```

---

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Environment feels fake | Add realistic seed data, UI, error pages, metadata |
| Too linear | Add decoys, dead ends, partial clues, multiple services |
| CVE becomes whole problem | Require post-foothold chain to reach final objective |
| Resource usage too high | Use lightweight custom services, cap CPU/RAM, avoid per-session Keycloak/Grafana |
| Unsafe exploit behavior | No host escape, no privileged containers, no docker.sock, no malware |
| Session cleanup failure | Build robust lab-controller cleanup and TTL system |
| Students share flags | Use dynamic HMAC flags |
| UAE latency | Host production in OCI UAE |

---

## 17. Definition of Success

The summer school range is successful if students can:

```text
- identify the company and services through recon
- find an initial vulnerability or foothold
- obtain limited execution
- use the lab C2 emulator safely
- discover internal services and documents
- separate valid clues from decoys
- pivot into DevOps services
- understand the build/update pipeline
- use the trusted update relationship to reach customer systems
- discover customer APIs and object storage
- collect the final flag
```

The final student experience should be:

```text
Explore → validate → exploit → stabilize → discover → filter noise → pivot → lateral movement → supply-chain trust abuse → customer discovery → final collection
```

---

## 18. Final Recommendation

Proceed with the **Enterprise APT Range** design, not the earlier linear supply-chain-only design.

The correct architecture is:

```text
Docker-only enterprise APT range
+ realistic Orion Echo corporate environment
+ CVE/foothold stage
+ lab-controlled persistence/C2 emulator
+ internal discovery
+ token/credential discovery
+ DevOps lateral movement
+ supply-chain/update channel
+ customer environment
+ object-store final objective
```

This design aligns with the actual goal: training students in APT-style chain building and pivoting, not just teaching them to recognize one CVE.


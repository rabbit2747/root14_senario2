# Orion Echo Supply Chain Demo

SolarWinds-inspired, Docker-only, one-person demonstration environment for
teaching MITRE ATT&CK techniques in a safe enterprise supply-chain scenario.

The current implementation is a compact MVP:

```text
recon
-> support-portal lab initial access
-> safe C2 emulator
-> corporate SSO/intranet/HR/wiki/ticket/docs/mail discovery
-> build/sign/publish flow
-> trusted ANRC customer update
-> customer export discovery
-> final object collection
```

## Quick Start

Run from this directory:

```powershell
docker compose up --build -d
.\scripts\walkthrough.ps1
```

Open the demo entrypoint:

```text
http://localhost:8080
```

Detailed demo commands are in:

```text
docs/demo/README_demo.md
```

Korean attack-chain teaching walkthrough:

```text
docs/demo/attack_walkthrough_ko.md
```

For container-internal end-to-end verification, use:

```powershell
docker compose exec -T support-portal sh -c "cat > /tmp/verify_chain.py" < scripts/verify_chain.py
docker compose exec -T support-portal python /tmp/verify_chain.py
```

For enterprise-surface verification, use:

```powershell
docker compose exec -T support-portal sh -c "cat > /tmp/verify_enterprise.py" < scripts/verify_enterprise.py
docker compose exec -T support-portal python /tmp/verify_enterprise.py
```

## Directory Layout

```text
.
├── docker-compose.yml
├── README.md
├── docs/
│   ├── demo/
│   │   ├── attack_walkthrough_ko.md
│   │   └── README_demo.md
│   ├── design/
│   │   ├── ai_instruction_enterprise_apt_range.md
│   │   ├── api_contracts.md
│   │   ├── data_schema.md
│   │   ├── platform_runtime.md
│   │   ├── stage_gating.md
│   │   └── team_plan_enterprise_apt_range.md
│   └── mitre/
│       ├── mitre_mapping_implementation_plan.md
│       └── technique_service_infra_matrix.md
├── infra/
│   └── edge-proxy/
│       └── nginx.conf
├── scripts/
│   ├── verify_enterprise.py
│   ├── verify_chain.py
│   └── walkthrough.ps1
└── services/
    └── orion-demo/
        ├── Dockerfile
        ├── requirements.txt
        └── app/
            ├── __init__.py
            └── main.py
```

## Enterprise Network Surfaces

The demo keeps the verified supply-chain attack path, but now includes
additional enterprise-like services from the original design:

```text
DMZ:
  public-site, public-docs, vendor-portal, support-portal

Corporate:
  corp-sso, intranet, hr-directory, wiki, ticket-service, doc-portal, mail-web

DevOps:
  source-repo, build-server

Release:
  signing-service, update-server

Customer:
  customer-app, customer-api, object-store, monitoring

Control:
  c2-emulator, flag-service, audit-log
```

## Important Docs

- MITRE stage and implementation plan:
  `docs/mitre/mitre_mapping_implementation_plan.md`
- Technique-to-service infrastructure matrix:
  `docs/mitre/technique_service_infra_matrix.md`
- Original enterprise range design:
  `docs/design/ai_instruction_enterprise_apt_range.md`
- API contracts:
  `docs/design/api_contracts.md`
- Stage gating design:
  `docs/design/stage_gating.md`

## Safety Boundaries

This demo intentionally avoids unsafe behavior:

```text
No real malware
No external C2
No Docker host escape
No docker.sock mount
No privileged containers
No destructive payloads
No arbitrary shell passthrough
```

Potentially sensitive behaviors are modeled with benign marker files, scoped
tokens, and a closed-action C2 emulator.

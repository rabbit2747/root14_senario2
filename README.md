# Orion Echo Supply Chain Demo

SolarWinds-inspired, Docker-only, one-person demonstration environment for
teaching MITRE ATT&CK techniques in a safe enterprise supply-chain scenario.

The current implementation is a compact MVP:

```text
recon
-> support-portal lab initial access
-> safe C2 emulator
-> wiki/ticket/repo discovery
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

## Directory Layout

```text
.
├── docker-compose.yml
├── README.md
├── docs/
│   ├── demo/
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
│   └── walkthrough.ps1
└── services/
    └── orion-demo/
        ├── Dockerfile
        ├── requirements.txt
        └── app/
            ├── __init__.py
            └── main.py
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

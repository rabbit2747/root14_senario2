# Orion Echo V2 Documentation

This directory is the working source of truth for the next Orion Echo scenario revision.

The original `senario_1` documents describe a safer training build that uses guarded command shims, C2 emulation, and flag-style progression. V2 intentionally moves the scenario toward an authorized red-team testbed model:

- Initial access is modeled as a real SSTI foothold inside an isolated support-portal container.
- C2 is removed from the main attack chain.
- Progression is based on evidence, access, logs, and customer impact rather than flags.
- Lateral movement is modeled through internal service discovery, application tokens, and CI/CD trust relationships.
- Visualization should separate network topology from stage-specific service/component details.

## Documents

- `01_scenario_v2_overview.md` - scenario intent, assumptions, and final kill chain.
- `02_network_topology_model.md` - enterprise-network interpretation for topology visualization.
- `03_stage_flow_v2.md` - stage-by-stage red-team flow without C2.
- `05_implementation_delta.md` - what must change later in code/config/docs.
- `visualization/` - separate visualization specs for `orion_2`.

## Non-goals

- Do not build external C2 infrastructure.
- Do not treat Docker containers as a mandatory one-to-one physical server mapping.
- Do not use flag strings as the customer-facing success artifact.
- Do not make SSH/RDP/SMB lateral movement the default path unless a later advanced module explicitly adds it.

# Implementation Delta

This document lists later code/config/doc changes needed to implement V2.

## Scenario Data

Create a V2 scenario source instead of mutating the original one in place.

Recommended file:

```text
mvp/data/orion-echo-supply-chain-v2.json
```

Data changes:

- remove `c2-emulator` from required active nodes and active edges
- replace C2 stages with direct internal discovery stages
- replace flag-like markers with evidence markers
- add component/evidence metadata per stage
- add topology-specific device/server roles

## Runtime Scenario

Later runtime changes should update the actual lab to match the V2 docs:

- replace `orion_exec` guarded macro with an isolated SSTI vulnerability
- allow real command execution inside support-portal container only
- keep non-root execution
- keep Docker socket absent
- keep privileged mode disabled
- keep host mounts absent
- restrict egress to lab networks
- log exploit attempts and command execution
- remove C2 dependency from the walkthrough path

## Demo / Walkthrough Docs

Do not keep V2 walkthroughs flag-first.

Replace:

- flag names
- C2 registration
- C2 discover-services
- guarded macro language

With:

- evidence records
- direct discovery from foothold
- SSTI exploit path
- impact summary

## MITRE Mapping

Remove or demote:

- T1071.001 as C2

Keep or strengthen:

- T1190 Exploit Public-Facing Application
- T1059.004 Unix Shell
- T1082 System Information Discovery
- T1016 System Network Configuration Discovery
- T1046 Network Service Discovery
- T1018 Remote System Discovery
- T1213 Data from Information Repositories
- T1552 Unsecured Credentials
- T1552.001 Credentials In Files
- T1550.001 Application Access Token
- T1078 Valid Accounts
- T1195.002 Compromise Software Supply Chain
- T1199 Trusted Relationship
- T1530 Data from Cloud Storage Object

## Visualization

Implement V2 visualization under a separate route/component first:

```text
/three/orion_2
ScenarioThreePlayerOrion2
```

The original `/three/orion` should remain available for comparison until V2 is accepted.

## Old Documents That Should Not Be Treated As V2 Source Of Truth

The following contain older C2/flag/guarded-RCE assumptions and should be superseded by this directory for V2 planning:

- `senario_1/README.md`
- `senario_1/docs/demo/README_demo.md`
- `senario_1/docs/demo/attack_walkthrough_ko.md`
- `senario_1/docs/design/ai_instruction_enterprise_apt_range.md`
- `senario_1/docs/design/stage_gating.md`
- `senario_1/docs/design/platform_runtime.md`
- `senario_1/docs/mitre/mitre_mapping_implementation_plan.md`
- `senario_1/docs/mitre/technique_service_infra_matrix.md`

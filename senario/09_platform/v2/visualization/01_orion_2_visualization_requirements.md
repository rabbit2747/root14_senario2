# Orion 2 Visualization Requirements

## Goal

`orion_2` should combine two views in one screen:

1. A network topology view showing the enterprise structure.
2. A stage detail area showing only the active infrastructure elements and the services/components used in the current stage.

## Main Topology View

The main view should look like an infrastructure/network topology, not a generic service graph.

Required areas:

- Internet / Operator
- Edge Proxy / WAF
- DMZ
- Corporate Internal
- DevOps
- Release Trust Chain
- Customer Environment

DMZ should contain distinct service-server nodes:

- Public Site Server
- Public Docs Server
- Support Portal Server
- Vendor Portal Server

`Support Portal Server` must be visually identifiable as the initial access target during SSTI stages.

## C2 Handling

Do not show `c2-emulator` in the V2 attack path.

Replace any C2 visual role with one of:

- Red Team Operator

Evidence should be attached to the infrastructure node that produced it, not rendered as a separate Control / Evidence network zone.

## Southern Active Stage Detail

The southern 3D world area should act as a focused detail bay.

For each stage, it should show:

- active infrastructure nodes from the topology
- services/components inside those nodes
- evidence produced by the stage
- active trust or API relationships
- operator action and next operational step

Example for Stage 1:

```text
Support Portal Server
  - /support/preview
  - template renderer
  - SSTI payload
  - shell context
  - exploit log
```

Example for Stage 3:

```text
Support Portal Foothold
  - DNS resolver
  - route table
  - HTTP health probes
  - wiki:8000
  - ticket-service:8000
  - source-repo:8000
```

Example for Stage 6:

```text
Build Server
  - /api/jobs
  - build trigger token
  - release ref
  - ANRC channel
  - artifact metadata
```

## Visual Language

Use different visual categories:

- network device: router, firewall, switch, proxy/WAF
- server/workload: public site, docs, support, vendor, repo, build, customer API
- component: endpoint, config, token, artifact, log, evidence
- trust path: API token, signed artifact, update channel
- evidence: logs, metadata, export proof

Avoid showing every service as the same generic cube when the view is in topology mode.

## Interaction

Stage navigation should update:

- active topology nodes
- active topology paths
- southern detail bay contents
- evidence/detection notes

The user should be able to pan and zoom like a map.

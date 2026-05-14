# Orion 2 Renderer Spec

## Target Route

The V2 renderer should be implemented separately from the existing Orion 3D view.

```text
/three/orion_2
```

The existing `/three/orion` route should remain available while V2 is being developed.

## Screen Composition

```text
+---------------------------------------------------------------+
| Scenario HUD                             Evidence / Stage Note |
|                                                               |
|                  Network Topology View                        |
|                                                               |
|                                                               |
|          +-------------------------------------------+        |
|          | Southern 3D Active Stage Detail Area      |        |
|          +-------------------------------------------+        |
+---------------------------------------------------------------+
```

The topology view owns the main canvas. The southern detail area is part of the same 3D world, placed south of the topology. It should pan, zoom, and rotate with the map instead of behaving like an HTML overlay.

## Data Concepts

The renderer should distinguish four concepts:

```ts
type TopologyZone = {
  id: string
  label: string
  kind: 'internet' | 'dmz' | 'internal' | 'devops' | 'release' | 'customer'
}

type TopologyNode = {
  id: string
  label: string
  zoneId: string
  kind: 'router' | 'firewall' | 'switch' | 'proxy' | 'server' | 'storage' | 'operator' | 'evidence'
  role?: string
}

type StageComponent = {
  id: string
  parentNodeId: string
  label: string
  kind: 'endpoint' | 'service' | 'config' | 'credential' | 'artifact' | 'log' | 'evidence' | 'data'
}

type TrustPath = {
  id: string
  source: string
  target: string
  kind: 'http' | 'discovery' | 'api-token' | 'signed-artifact' | 'update-channel' | 'evidence'
}
```

The exact TypeScript types may differ, but the renderer should preserve these conceptual boundaries.

## Network Topology Layout

Recommended high-level placement:

```text
Internet / Operator     left
Edge Proxy / WAF        left-center
DMZ                     upper-left / center-left
Corporate Internal      upper-center
DevOps                  lower-center
Release Trust Chain     center-right
Customer Environment    upper-right
```

DMZ nodes:

```text
Edge Proxy / WAF
  -> Public Site Server
  -> Public Docs Server
  -> Support Portal Server
  -> Vendor Portal Server
```

Support Portal should have stronger stage highlighting during:

- Initial Access via SSTI
- Foothold Validation
- Internal Service Discovery

## Stage Detail Bay

The southern detail area should render active topology nodes as compact 3D server panels. It should not simply list infrastructure. Each panel should explain the node's role in the active attack step.

Each active node card should show:

- node label
- network zone
- node role
- role in current stage
- operator action
- active surface
- material collected or abused
- evidence produced
- next step

The detail area should prefer fewer, richer node panels. If a stage touches many topology nodes, show the operationally important nodes first and collapse supporting infrastructure into path lines.

## Stage-to-View Mapping

### Stage 0. Public Recon

Active topology:

- Edge Proxy / WAF
- Public Site Server
- Public Docs Server
- Vendor Portal Server

Detail components:

- route logs
- product metadata
- release notes
- ANRC channel hints

### Stage 1. SSTI Initial Access

Active topology:

- Edge Proxy / WAF
- Support Portal Server

Detail components:

- `/support/preview`
- template renderer
- SSTI payload
- shell context
- exploit log

### Stage 2. Foothold Validation

Active topology:

- Support Portal Server
- command telemetry on Support Portal

Detail components:

- user context
- hostname
- route table
- DNS resolver
- environment snapshot

### Stage 3. Internal Service Discovery

Active topology:

- Support Portal Server
- Corporate Internal services
- DevOps services

Detail components:

- DNS lookups
- HTTP health probes
- `wiki:8000`
- `ticket-service:8000`
- `source-repo:8000`
- `build-server:8000`

### Stage 4. Knowledge Collection

Active topology:

- Wiki
- Ticket Service
- Doc Portal
- Mail Web
- Source Repo

Detail components:

- release runbook
- ticket metadata
- approval context
- release-pipeline config

### Stage 5. Build Credential Discovery

Active topology:

- Wiki
- Ticket Service
- Source Repo

Detail components:

- build trigger token
- release ref
- ANRC channel
- signing workflow
- decoy records

### Stage 6. Build Server API Abuse

Active topology:

- Source Repo
- Build Server
- Build Server logs

Detail components:

- `/api/jobs`
- application token
- build job metadata
- artifact metadata

### Stage 7. Release Trust Chain Abuse

Active topology:

- Build Server
- Signing Service
- Update Server

Detail components:

- signed manifest
- signing record
- update channel publish
- artifact transfer

### Stage 8. Customer Update Trust Abuse

Active topology:

- Update Server
- Customer App
- Customer API
- Monitoring

Detail components:

- update poll
- trusted manifest
- customer-side telemetry
- API reachability

### Stage 9. Sensitive Export Access

Active topology:

- Customer API
- Object Store
- Object Store

Detail components:

- metadata
- facilities
- audits
- exports
- sensitive object access proof

### Stage 10. Evidence And Detection Debrief

Active topology:

- impacted systems

Detail components:

- correlated timeline
- impact summary
- detection opportunities
- recommended controls

## Visual States

Each topology node should support:

- inactive
- previously touched
- active
- high-risk
- evidence-producing

Each path should support:

- inactive
- observed
- active
- trust relationship
- customer-impact path

## Implementation Notes

- Keep `/three/orion_2` isolated from `/three/orion`.
- Prefer a topology-specific layout model instead of reusing the generic service scatter layout.
- Keep map-like pan and zoom.
- Keep text readable at 1440x900 and common laptop sizes.
- Avoid placing the southern detail bay over critical topology nodes by default.
- Do not render C2 as an attack-path element.

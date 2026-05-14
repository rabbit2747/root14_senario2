# Network Topology Model

## Enterprise Interpretation

Docker Compose services are implementation units, not a mandatory one-container-equals-one-physical-server model. For the enterprise topology view, each service should be interpreted as an independent service node or server-like workload behind a network control.

The recommended topology model is:

```text
Internet
  |
  v
Edge Proxy / Reverse Proxy / WAF
  |
  v
DMZ Service Servers
  |-- Public Site Server
  |-- Public Docs Server
  |-- Support Portal Server
  |-- Vendor Portal Server

Corporate Internal
  |-- Corp SSO
  |-- Intranet
  |-- Wiki
  |-- Ticket Service
  |-- Doc Portal
  |-- Mail Web

DevOps
  |-- Source Repo
  |-- Build Server

Release Trust Chain
  |-- Signing Service
  |-- Update Server

Customer Environment
  |-- Customer App
  |-- Customer API
  |-- Object Store
  |-- Monitoring
```

## DMZ Interpretation

The DMZ should not be shown as a single generic web server with simple URL paths. The intended red-team testbed model is stronger if the edge proxy routes to separate DMZ service servers:

- `public-site` - public marketing and product surface
- `public-docs` - public documentation and release-note surface
- `support-portal` - support/ticket application and initial access surface
- `vendor-portal` - partner/customer portal and release-channel context

This keeps the support portal visually distinct as the initial access target.

## C2 Removal

Do not place `c2-emulator` as an attack-path node in V2 topology.

If an operator-side element is needed, use:

- `Red Team Operator`

Evidence should remain attached to the producing infrastructure node, such as support-portal exploit telemetry, build-server job logs, update-server publish records, customer-api access logs, and object-store access proof.

## Lateral Movement Interpretation

V2 movement is not:

```text
support-portal -> SSH -> build-server
```

V2 movement is:

```text
support-portal foothold
  -> internal DNS/HTTP discovery
  -> wiki/ticket/repo collection
  -> build-token discovery
  -> build-server API access
  -> signing/update trust-chain abuse
```

Use labels such as:

- Internal service discovery
- Application token use
- API trust
- Build job trigger
- Signed artifact publish
- Customer update trust

Avoid labels that imply remote shell movement unless an advanced T1021 module is added later.

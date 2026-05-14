# Stage Flow V2

## Stage 0. Public Recon

The operator starts from the public edge and reviews externally visible surfaces.

Active areas:

- Edge Proxy / WAF
- Public Site Server
- Public Docs Server
- Vendor Portal Server

Evidence:

- product and version metadata
- release notes
- ANRC customer/channel references
- public route access logs

MITRE:

- T1591 Gather Victim Org Information
- T1592 Gather Victim Host Information

## Stage 1. Initial Access via SSTI

The operator exploits an SSTI weakness in the support portal preview feature.

Active areas:

- Support Portal Server
- `/support/preview`
- Template renderer
- Exploit log

Expected result:

- command execution inside the isolated support-portal container
- no host escape
- no Docker socket access
- all exploit attempts logged

MITRE:

- T1190 Exploit Public-Facing Application
- T1059.004 Unix Shell

## Stage 2. Foothold Validation

The operator validates the execution context from the foothold.

Example observations:

- effective user
- hostname
- working directory
- environment variables
- network interfaces
- routing table
- resolver configuration

Evidence:

- foothold context record
- support-portal command/exploit telemetry

MITRE:

- T1082 System Information Discovery
- T1016 System Network Configuration Discovery

## Stage 3. Internal Service Discovery

The operator discovers reachable internal services directly from the foothold.

Discovery should not depend on C2 predefined actions. Use direct internal DNS/HTTP/TCP reachability inside the lab.

Expected discoveries:

- corp-sso
- wiki
- ticket-service
- doc-portal
- mail-web
- source-repo
- build-server

Evidence:

- DNS lookup results
- HTTP health responses
- service banner or metadata records

MITRE:

- T1046 Network Service Discovery
- T1018 Remote System Discovery

## Stage 4. Internal Knowledge Collection

The operator collects operational context from business systems.

Sources:

- Wiki release runbook
- Ticket service release ticket
- Doc portal operations guide
- Mail web approval context
- Source repo release pipeline config

Evidence:

- release runbook excerpts
- ticket metadata
- repo file metadata
- approval context

MITRE:

- T1213 Data from Information Repositories
- T1083 File and Directory Discovery

## Stage 5. Build Credential Discovery

The operator combines clues from multiple sources to identify build authorization material.

Artifacts:

- build trigger token
- release branch/ref
- ANRC channel
- artifact naming rule
- signing workflow

Evidence:

- where the token was found
- supporting context proving it is valid for build operations

MITRE:

- T1552 Unsecured Credentials
- T1552.001 Credentials In Files

## Stage 6. Build Server API Abuse

The operator uses application access material to trigger a build through the build-server API.

Active areas:

- Source Repo
- Build Server

Evidence:

- accepted build job
- job metadata
- artifact metadata
- API access logs

MITRE:

- T1550.001 Application Access Token
- T1078 Valid Accounts

## Stage 7. Release Trust Chain Abuse

The build output moves through the release trust chain.

Active areas:

- Build Server
- Signing Service
- Update Server

Evidence:

- signed manifest
- artifact signing record
- update channel publish record

MITRE:

- T1195.002 Compromise Software Supply Chain
- T1570 Lateral Tool Transfer

## Stage 8. Customer Update Trust Abuse

The customer environment trusts the update channel.

Active areas:

- Update Server
- Customer App
- Customer API
- Monitoring

Evidence:

- customer update poll
- update application record
- customer-side telemetry

MITRE:

- T1195.002 Compromise Software Supply Chain
- T1199 Trusted Relationship

## Stage 9. Sensitive Export Access

The operator validates customer impact by accessing sensitive export metadata and objects.

Active areas:

- Customer API
- Object Store

Evidence:

- customer metadata
- facility records
- audit export index
- object-store access proof
- impact summary

MITRE:

- T1213 Data from Information Repositories
- T1530 Data from Cloud Storage Object

## Stage 10. Evidence And Detection Debrief

The final step is a debrief, not flag submission.

Evidence sources:

- edge-proxy logs
- support-portal exploit logs
- internal service access logs
- wiki/ticket/repo logs
- build-server job logs
- signing-service logs
- update-server publish logs
- customer-api access logs
- object-store access logs

Output:

- attack path summary
- impacted trust relationships
- customer data access evidence
- detection opportunities
- recommended controls

# Orion Echo V2 Scenario Overview

## Purpose

Orion Echo V2 is an authorized red-team supply-chain testbed. It demonstrates how a DMZ support portal foothold can lead to internal service discovery, operational knowledge collection, build-token abuse, release trust-chain manipulation, and customer data exposure.

The scenario should feel like a realistic enterprise operation, not a CTF. The customer-facing outcome is not a flag. It is an evidence-backed impact narrative showing what systems were reached, what trust relationships were abused, and what sensitive customer data became accessible.

## Core Scenario

```text
Internet
  -> Edge Proxy / WAF
  -> DMZ Support Portal SSTI foothold
  -> Foothold environment validation
  -> Direct internal service discovery
  -> Wiki / Ticket / Docs / Mail / Source Repo collection
  -> Build token and release metadata discovery
  -> Build Server API abuse
  -> Signing / Update trust-chain abuse
  -> Customer update trust abuse
  -> Customer API and object-store access
  -> Evidence and detection debrief
```

## Important Design Decisions

### C2 Removed From The Main Chain

C2 is not required for this scenario. The core learning objective is supply-chain trust abuse, not malware command-and-control operations.

V2 removes `c2-emulator` from the required attack path. Internal discovery happens directly from the `support-portal` foothold using permitted lab tools and network reachability inside the isolated environment.

### SSTI Replaces Guarded Command Macro

The old `{{orion_exec:...}}` macro is a safe command shim. It is useful for demos but too artificial for a red-team testbed.

V2 uses an actual SSTI-style vulnerability in the support portal preview flow. The exploit should result in real command execution inside the support-portal container, while container isolation and network controls keep the lab safe.

### Evidence Replaces Flags

V2 progression should be verified by evidence objects:

- access logs
- exploit logs
- internal discovery output
- collected runbook/ticket/repo evidence
- build job metadata
- signing and update publish records
- customer API access records
- object-store export access proof
- final impact report

Flag strings may remain in old training assets, but they are not part of the V2 customer-facing narrative.

## Expected Difficulty

V2 remains a substantial red-team testbed without C2 because the difficulty comes from chaining multiple domains:

- web exploitation
- Linux/container foothold validation
- internal DNS and HTTP service discovery
- data collection from business systems
- application-token abuse
- CI/CD pipeline interaction
- release/signing/update trust-chain abuse
- customer data access validation

The default lateral movement path is application and service trust, not SSH/RDP/SMB.

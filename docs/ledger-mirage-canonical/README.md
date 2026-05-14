# Ledger Mirage Canonical Scenario

This directory is the canonical package for the BEC investigation curriculum
derived from `senario/bec_scam/bec_scam_scenario_implementation_plan.md`.

`Operation Ledger Mirage` is not an offensive phishing exercise. It is a
defensive investigation range where students reconstruct a fictional Business
Email Compromise incident from safe evidence artifacts.

## Source

- Source planning file: `senario/bec_scam/bec_scam_scenario_implementation_plan.md`
- Scenario name: `Operation Ledger Mirage`
- Scenario type: Business Email Compromise investigation
- Fictional company: NorthBridge Trading Ltd.
- Fictional vendor: Meridian Office Supply LLC

## Canonical Files

| File | Purpose |
| --- | --- |
| `scenario-canonical.md` | Human-readable canonical story, curriculum flow, and stage model |
| `canonical-scenario-manifest.json` | Structured scenario manifest for future template-driven implementation |

## Implementation Rule

All student-facing behavior must remain defensive and evidence-based:

- no real phishing delivery
- no credential harvesting
- no live lookalike domains
- no real payment rails
- no malware
- no external command-and-control

Future web, 3D, or lab implementations should use this directory as the source
of truth before copying content into app routes or scenario data files.

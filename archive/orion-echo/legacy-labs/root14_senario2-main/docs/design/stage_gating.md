# Stage Gating and Scenario Hooks Specification
# Orion Echo Enterprise APT Range

Version: 1.0
Date: 2026-04-29
Companion to: `ai_instruction_enterprise_apt_range.md` (§9), `api_contracts.md`, `data_schema.md`
Audience: implementation engineers / scenario designers / AI coding agent

---

## 0. Scope

This document closes the remaining gaps that block Phase 5 (APT chain hooks):

1. How each of the 11 stages is technically detected as "complete".
2. Full c2-emulator protocol semantics (registration, action enum, gating role).
3. Concrete placement of every valid credential, partial credential, and decoy.
4. CVE-class candidate per stage with one chosen Stage-1 design for Phase 5.
5. Decoy distribution discipline so the 50% noise rate is consistent.

It does NOT specify exploit code. Phase 5 implements scenario hooks; exact
exploit text is added in Phase 6.

---

## 1. Stage gating philosophy

Two gating modes exist:

**Passive gating** — flag is auto-issued when the platform observes the
student reaching a specific service or endpoint. The student does not need to
submit anything to flag-service themselves; the back-end emits
`/internal/stage-complete`.

**Active gating** — student must explicitly find a flag string (HMAC) in some
artifact (file, page, response, manifest) and paste it into CTFd.

Every stage uses one of these. We aim for:

```
passive   stages 0, 2, 3                  early-game, low friction
active    stages 1, 4, 5, 6, 7, 8, 9, 10  body of the exercise
```

Active stages embed the flag as text inside an artifact the student earns by
solving the stage. The flag string itself is computed by `flag-service` from
`session_id+stage_id` (deterministic per session) and templated into the
artifact at session-seed time.

---

## 2. c2-emulator protocol — full semantics

### 2.1 Role in the system

The c2-emulator is the **only sanctioned post-exploitation surface** in the
range. All "implant", "beacon", and "C2" concepts route through it. It exists
inside `control_net` and is reachable from a per-session set of services that
hold a foothold.

It serves three purposes:

```
1. Teach post-exploitation lifecycle (register, beacon, action, exit).
2. Replace any temptation to introduce real malware or shells.
3. Detect Stage 3 completion automatically.
```

### 2.2 Reachability

`c2-emulator` is on `control_net`. The following per-session services have
`control_net` membership AND have a reverse-proxy route students discover at
Stage 1:

```
vendor-portal  → after Stage 1 RCE, can reach c2-emulator at http://c2-emulator:7300
support-portal → same
```

Students who land a foothold reach c2-emulator via the foothold, not directly
from the student browser.

### 2.3 Registration (marks Stage 3)

```
POST http://c2-emulator:7300/beacon/register
Body: see api_contracts §12.1
```

On first valid registration for the session, c2-emulator calls
`flag-service /internal/stage-complete` for `flag_3_persistence_c2`. The flag
text becomes available (next stage hint is rendered in the c2-emulator UI).

### 2.4 Beacon and action loop

```
GET  /beacon/{implant_id}/actions          long-poll 30s
POST /beacon/{implant_id}/actions/{aid}/result
```

Allowed actions are a closed enum (see api_contracts §12.4). Each action runs
**inside the c2-emulator** against the target service via the implant's
declared `reachable_targets` list, NOT inside the student's foothold.
Concretely:

- `discover_services` — c2-emulator pings each declared target's `/health`
  and returns the list.
- `list_env_var_names` — returns a curated list of env var *names* visible
  to the foothold service (read from a per-session "env hint manifest" that
  c2-emulator gets from `session-agent`). Values are never returned.
- `read_known_file_marker` — c2-emulator reads `LAB_BUILD_MARKER` from
  `update-server`'s public artifact and returns the marker line.
- `collect_predefined_artifact` — returns one preset artifact path/content.
- `report_progress` — student logs free text up to 16 KB; stored in
  `audit-log`.
- `mark_persistence_simulated` — no-op confirmation.
- `exit` — implant deregisters.

There is no shell exec, no file write, no arbitrary network egress, no
filesystem traversal. Students learn the *concept* of operator workflow
without any of the dangerous primitives.

### 2.5 Gating role

c2-emulator is responsible for emitting these `stage-complete` events:

```
flag_3_persistence_c2     on first /beacon/register
flag_4_internal_discovery on the 4th unique target seen via discover_services or env-name listing (taught: "you've enumerated enough internal services")
```

All other stages are gated by their owning service (see §3 below).

---

## 3. Per-stage gating

Each subsection lists: gating mode, owning service, completion condition,
flag artifact, and observable evidence.

### 3.1 Stage 0 — flag_0_recon_context

**Mode**: passive
**Owning service**: `edge-proxy` access logs aggregator inside `session-agent`
**Completion**: student fetches `≥ 3` distinct routes from
`{ /, /portal/, /docs/, /support/, /releases/public }` within 5 minutes.
**Evidence**: edge-proxy access log entries with distinct paths.
**Flag artifact**: rendered into the response of
`GET /service/build-info` on `public-site` once stage is complete.
The student must read the response (curl, browser dev tools).

This teaches: "look at metadata endpoints, not just rendered HTML".

### 3.2 Stage 1 — flag_1_initial_access

**Mode**: active
**Owning service**: `support-portal`
**Completion**: student exploits the chosen Stage-1 vulnerability and
obtains the post-exploit marker file.
**Vulnerability**: see §6.1.
**Flag artifact**: a file at `/var/lib/support-portal/.post_exploit_marker`
inside the support-portal container, readable only after RCE. Content:

```
You executed: <user>@<host>
Your session: s_<sid>
Flag: orion{...HMAC...}
Hint: register a beacon at http://c2-emulator:7300/beacon/register
```

The student reads the file via the RCE primitive and submits the flag in
CTFd.

### 3.3 Stage 2 — flag_2_foothold_execution

**Mode**: passive
**Owning service**: `support-portal` post-exploit handler
**Completion**: student executes any of these probes via the Stage-1
RCE within 30 minutes of obtaining the foothold:

```
- read /etc/hostname
- read /proc/self/environ (returns env var names only; values are masked
  to "***" by a wrapper that the post-exploit shim runs)
- list /opt/support-portal
- run `id`
```

**Detection**: the post-exploit shim (a tiny Python wrapper that the RCE
launches first) records the probe to `audit-log`.
**Flag artifact**: the post-exploit shim writes the flag to a file
`/tmp/orion_stage2.txt` after the third probe is recorded.

This teaches: "stabilize and orient before you move".

### 3.4 Stage 3 — flag_3_persistence_c2

**Mode**: passive
**Owning service**: `c2-emulator`
**Completion**: student calls `POST /beacon/register` with a valid session_id.
**Detection**: c2-emulator emits `stage-complete`.
**Flag artifact**: returned in the registration response body, plus
displayed in the c2-emulator console.

Hint trail: the file written in Stage 1 mentions `c2-emulator:7300`. The
student must understand that calling this endpoint is the "register your
implant" act.

### 3.5 Stage 4 — flag_4_internal_discovery

**Mode**: passive (with active confirmation)
**Owning service**: c2-emulator + corp-services audit collation
**Completion**: c2-emulator records `≥ 4` distinct service hits among
`{corp-sso, intranet, wiki, ticket-service, hr-directory, mail-web, doc-portal}`
within the session. Hits can come from `discover_services` actions or from
the foothold service browsing the corp internal endpoints.
**Flag artifact**: emitted to the c2-emulator console and also stored in
audit-log; student must paste the flag into CTFd.

### 3.6 Stage 5 — flag_5_credential_material

**Mode**: active
**Owning service**: build-server (acceptance test)
**Completion**: student submits a valid `BUILD_TRIGGER_TOKEN` to
`POST /api/jobs` and the call succeeds with HTTP 202.
**Detection**: build-server emits `stage-complete` on first 202 with a token
that matches the per-session value.
**Flag artifact**: returned inside the 202 response body as a hidden field
`x_orion_acceptance` plus printed in the job's first log line.

The valid token is planted in exactly *one* location among many decoys.
See §4 (placement map).

### 3.7 Stage 6 — flag_6_devops_lateral_movement

**Mode**: active
**Owning service**: build-server (build artifact step)
**Completion**: a build job moves through stages
`fetch → compile → package` successfully. The package step writes a marker
into the artifact tarball; the artifact_id is exposed via
`GET /api/artifacts/{artifact_id}`.
**Detection**: build-server emits `stage-complete` when an artifact's
`marker` field equals `ORION_ECHO_BUILD_MARKER=s_<sid>`.
**Flag artifact**: a file `LAB_BUILD_MARKER` inside the tarball, content:

```
build_id: build-2026-0429-001
session: s_<sid>
flag: orion{...HMAC...}
```

The student fetches the tarball, extracts, reads.

### 3.8 Stage 7 — flag_7_supply_chain_stage

**Mode**: active
**Owning service**: update-server
**Completion**: a manifest is published to channel `anrc` whose
`metadata.lab_marker` matches the session's `ORION_ECHO_BUILD_MARKER`.
**Detection**: update-server emits `stage-complete` on `POST /internal/publish`
acceptance for channel=anrc.
**Flag artifact**: returned in the manifest itself as `metadata.flag` field
(this field is intentionally non-standard and serves as the active flag
text). The student fetches `GET /channels/anrc/manifest.json` and reads it.

This stage requires the student to:

1. Trigger build (Stage 5)
2. Pull artifact (Stage 6)
3. Sign the canonical manifest via signing-service
4. Publish to update-server with channel=anrc

The signing-service intentionally validates that the manifest's
`metadata.lab_marker` is present; without it, signing returns 400. This
forces the student to use the lab-only build chain.

### 3.9 Stage 8 — flag_8_customer_reach

**Mode**: passive
**Owning service**: customer-app
**Completion**: customer-app polls update-server, fetches the new manifest
(version > previously installed), validates the signature, downloads the
artifact, extracts, and successfully posts an `update-applied` event back
to customer-api.
**Detection**: customer-api emits `stage-complete` on first
`POST /internal/agent/update-applied` for the session's new build_id.
**Flag artifact**: customer-api logs the flag into the response body of
`GET /metadata` (added as a `recent_event_flag` field that is present only
after Stage 8 completion).

The student observes the customer-side telemetry change to confirm the
update propagated. Once they query `/metadata`, they see the flag.

### 3.10 Stage 9 — flag_9_customer_discovery

**Mode**: active
**Owning service**: customer-api + audit-log
**Completion**: student fetches `≥ 5` distinct endpoint paths under
`customer-api`, including `/exports/{id}` for at least one export with
`object_key` starting with `anrc-audit-exports/2026/Q2/`.
**Detection**: audit-log emits `stage-complete` on observing the criteria.
**Flag artifact**: included in the response of the first
`GET /exports/{id}` for a Q2 audit export, in a field
`x_orion_discovery_flag`.

This teaches: "enumerate the customer surface; identify the right export".

### 3.11 Stage 10 — flag_10_final_objective

**Mode**: active
**Owning service**: object-store
**Completion**: student successfully retrieves the object
`anrc-audit-exports/2026/Q2/project-orion-echo-final.txt` from the
`anrc-objects` bucket via a presigned URL obtained from customer-api.
**Detection**: object-store emits a GET log; audit-log filter watches for
this specific key under this specific session and emits `stage-complete`.
**Flag artifact**: the file's content includes the final flag and a
short congratulations message:

```
Operation Orion Echo — End of Range
session: s_<sid>
final_flag: orion{...HMAC...}

Thank you. Please return to CTFd to submit this flag.
```

The companion file `facility-risk-summary.pdf` contains a misleading
summary with no flag, to teach: "not everything in the bucket is the
target".

---

## 4. Credential and token placement map

Every per-session secret has exactly one valid location. Decoys outnumber
valid clues by 5:2 ratio per `team_plan §11.4`.

### 4.1 BUILD_TRIGGER_TOKEN (Stage 5)

**Valid placement**: in a wiki page titled "Release Engineering Runbook —
Build Trigger" (`page_id = release/runbook-build-trigger`), inside a code
block:

```
# Used by Release Engineering to trigger production builds
BUILD_TRIGGER_TOKEN=<per-session value>
```

The page has `category=runbook` and references real employee IDs to look
authentic. Access requires SSO; the page is in the `releng` group's view.

**Partial clue placements** (point at the runbook):
- A ticket `OES-1287` titled "Lost build trigger access" — a comment
  references "the runbook page".
- A mail message subject "Re: build trigger token — see wiki".

**Decoy placements**:
- `release-pipeline/.env.sample` lists `BUILD_TRIGGER_TOKEN=replace-me`
  (literal "replace-me", invalid).
- A wiki page "Old Build Process (2024)" lists
  `BUILD_TRIGGER_TOKEN=expired-2024-token` (rejected by build-server).
- A doc-portal file `legacy/build-tokens-2023.txt` lists 5 historical
  fake values, all rejected.

### 4.2 RELEASE_STAGING_TOKEN

**Valid placement**: env var of `build-server` container, NOT in any
seeded document. Discoverable only via Stage 7 chain (the student doesn't
*need* to read this; it's used by build-server to publish to update-server).
This is intentionally invisible to students; it represents real
production secrets that aren't leaked in docs.

**Decoy placements**:
- A ticket `OES-1140` mentions "RELEASE_STAGING_TOKEN=stg-old-2025-Q3" —
  this value is present in `corp-db.tickets` but is a decoy.
- An old release email contains the literal string
  `STAGING_API_KEY=` followed by a fake hex value.

### 4.3 CUSTOMER_ANRC_CHANNEL_TOKEN

**Valid placement**: env var of `customer-app`. Discoverable via Stage 4 →
hr-directory (`emp-0048` Fatima Al Qasimi is "ANRC Channel Owner") →
ticket `OES-1366` "ANRC channel rotation 2026-Q2" mentions a token name and
points to a doc-portal file `restricted/anrc-channel-2026q2.txt` whose
content is:

```
ANRC channel token (current generation):
  CUSTOMER_ANRC_CHANNEL=<per-session value>
Owner: emp-0048
Rotation: quarterly
Note: do NOT share with customer-success team.
```

This file is in folder `restricted` (visibility=restricted in `docs.folders`).
The student must escalate to a user in the `releng` group via Stage 4–5
discovery.

**Decoy placements**:
- 5 fake ANRC channel tokens scattered in `oes-decoys` MinIO bucket and
  `tickets.attachments` (filename suggests legitimacy: `anrc-token.txt`,
  but content is `revoked-2025-Q4`).

### 4.4 SIGNING_KEY_ID

`orion-lab-signing-key` is the public identifier; not a secret. The
identifier is referenced in:

- `release-pipeline/release.json`
- `wiki: release/runbook-signing` (legitimate)
- 3 decoy wiki pages mentioning `orion-prod-signing-key-2024` (does not
  exist in signing-service)

### 4.5 OIDC client_secret values

Per-session generated. Not planted in any document. If a student wants to
impersonate a client, the only way is via a misconfiguration cluepoint:

- `intranet`'s footer reveals the OIDC `client_id` (legitimate disclosure).
- A decoy doc-portal file `legacy/intranet-oidc-2023.txt` contains an old
  pre-rotation client_secret for `intranet` — rejected by current corp-sso
  because the per-session value is different.

### 4.6 Customer API token

`CUSTOMER_API_TOKEN` is held by customer-app only. It is NOT discoverable
through document mining. The student reaches customer-api by abusing the
customer-app trust relationship in Stage 8 — they don't steal a token.

This is deliberate: it teaches "trust the chain, not the credential".

### 4.7 Honeytoken decoy

`anrc-objects-legacy/deprecated/anrc-credentials-export.csv` contains
fake credentials AND triggers an audit-log alert when read. This alert is
visible in operator console; for the student, no immediate consequence
(they don't get blocked), but the post-mortem teaches what a honeytoken
is.

---

## 5. Decoy distribution discipline

Per team_plan §11.4 the ratios are:

```
Valid clues: 20%
Partial clues: 30%
Invalid/expired/decoy: 50%
```

To achieve this consistently across 40–80 wiki pages, 80–150 tickets, 30–60
mails, etc., each seed script tags its outputs:

```sql
ALTER TABLE wiki.pages    ADD COLUMN clue_kind TEXT;     -- 'valid'|'partial'|'decoy'|'noise'
ALTER TABLE tickets.tickets ADD COLUMN clue_kind TEXT;
ALTER TABLE mail.messages ADD COLUMN clue_kind TEXT;
ALTER TABLE docs.files    ADD COLUMN clue_kind TEXT;
```

`noise` is content that is neither clue nor decoy — pure routine business
content (HR onboarding email, IT password reset notice, etc.). The
distribution target is:

```
valid    20%
partial  30%
decoy    30%
noise    20%
```

(Noise is split out from "decoy" so students don't perceive every irrelevant
page as a decoy attempt — some pages are genuinely just noise.)

The `clue_kind` column is an internal attribute, NOT exposed to students.
Only operator dashboards can query it.

A linter `scripts/seed/audit_clue_distribution.py` runs after seeding and
fails if any category is more than ±5% off target.

---

## 6. CVE-class candidates

### 6.1 Stage 1 — chosen design

**Service**: `support-portal`
**Vulnerability class**: Server-side template injection (SSTI) in the
"Submit ticket" preview endpoint, leading to RCE.

Concrete shape:

- `support-portal` exposes `POST /preview` that takes a Markdown ticket body
  and renders it via Jinja2 with `autoescape=False` and
  `from_string(body).render(env=...)`.
- A malicious payload in the body achieves Python expression evaluation,
  then uses `subprocess` (whitelisted by a "lab guard" wrapper that allows
  only specific argv shapes — see below) to run a marker-recording command.
- A post-exploit shim wraps subprocess so that:
  - Allowed argv: `["cat", "/var/lib/support-portal/.post_exploit_marker"]`
    and a small set of read-only probes (id, hostname, ls /opt).
  - Disallowed argv: anything else returns "Permission denied (lab guard)".
- The shim is documented internally as "scenario only — not real exploit
  primitive". Students see what a real RCE looks like but cannot pivot to
  attack the host or other containers.

This design satisfies:

- Container-contained foothold ✓
- No host escape ✓
- No docker.sock abuse ✓
- Foothold ≠ final flag ✓
- Realistic "looks like a real CVE" feel ✓

The shim's whitelist is the safety boundary; without it, a real RCE in a
shared host could be dangerous even with non-privileged containers.

### 6.2 Alternative Stage-1 candidates (for variation across cohorts)

```
A. SSTI in support-portal /preview          [chosen above]
B. File upload bypass in vendor-portal /tickets/{id}/attach (unsanitized
   filename; path traversal writes to docs).
C. Auth bypass in public-docs admin route via predictable session token.
D. SSRF in vendor-portal /releases/public preview-url parameter.
```

Only one is wired into Phase 5 initially. Others are listed for future
cohort rotation.

### 6.3 Other stages with optional CVE-class hooks

- **Stage 6 (DevOps)**: a Gitea misconfiguration where `echo-update`
  repository has its `webhook` URL pointing to ci-runner with a token in
  the URL — a student who reads the repo settings can extract a
  `BUILD_TRIGGER_TOKEN` echo. This is an alternative path to Stage 5.
- **Stage 7 (supply chain)**: signing-service rejects payloads without
  `lab_marker`; this is a rules-checked control, not a CVE. No exploit
  needed.
- **Stage 8 (customer reach)**: trust-based, not CVE-based. The student
  doesn't exploit customer-app; they leverage the update channel.

The principle: the lab teaches **chain-building**, not multiple CVEs.

---

## 7. Stage state machine

Stages do not strictly require linear order, but most have prerequisites:

```
flag_0  no prereq
flag_1  flag_0
flag_2  flag_1
flag_3  flag_2
flag_4  flag_3
flag_5  flag_3                     (can be done in parallel with flag_4)
flag_6  flag_5
flag_7  flag_6 AND flag_5
flag_8  flag_7
flag_9  flag_8
flag_10 flag_9
```

`flag-service` enforces prereqs by rejecting submissions that lack
prerequisite completion. The rejection message hints:

```
{ "valid": false, "code": "prereq_missing", "missing": ["flag_5_credential_material"] }
```

This rejection is informative without giving the answer away.

---

## 8. Stage timing budget

Target student time on first attempt:

```
flag_0   2–5 min
flag_1   30–90 min   (CVE study and exploitation)
flag_2   5–10 min
flag_3   5–15 min
flag_4   30–60 min   (exploration)
flag_5   30–90 min   (token hunt; 50% decoys)
flag_6   15–30 min
flag_7   30–60 min   (chain together)
flag_8   10–20 min
flag_9   15–30 min
flag_10  5–15 min
─────
total    ~3–6 hours  (matches the 180 min default TTL with one reset)
```

Students who exceed the budget at any stage are good candidates for the
operator's `push-hint` action.

---

## 9. Operator hint catalog

Each stage has 3 prepared hints of escalating directness. Hints are pushed
via `c2-emulator /operator/push-hint`. They appear in the c2-emulator
console and as a transient banner on the edge-proxy landing page.

```
flag_5 hint 1: "Search wiki by category=runbook."
flag_5 hint 2: "Look at pages owned by the release-engineering team."
flag_5 hint 3: "Read 'Release Engineering Runbook — Build Trigger'."
```

Hint catalogs are stored in `seed/hints/` and loaded by lab-controller at
session create.

---

## 10. Walkthrough validation matrix

Before declaring a session ready, the seeding pipeline runs an automated
walkthrough that confirms each stage can be completed end-to-end:

```
scripts/walkthrough/stage_0.py    ← fetches recon URLs, expects flag in build-info
scripts/walkthrough/stage_1.py    ← submits SSTI payload, reads marker file
...
scripts/walkthrough/stage_10.py   ← retrieves final object, expects flag prefix orion{
```

If any walkthrough fails, the session is marked `failed_validation` and is
not exposed to the student. This gates "session ready" in the create flow.

The walkthrough scripts double as the instructor solution guide.

---

## 11. Open scenario items deferred to engineering review

1. Whether Stage 4 should require c2-emulator `discover_services` action
   specifically, or accept any 4 distinct internal hits (currently the
   latter, more lenient).
2. Whether Stage 7 should require all three sub-steps (build → sign →
   publish) to happen in the *same* session within a time window (currently
   no time window).
3. Whether stage prereq enforcement should be silent or verbose
   (currently verbose with a missing-list).
4. Whether to expose a "stage hint" button in CTFd that auto-pushes the
   next prepared hint (cost: ~ 25% of the stage's points), or keep hints
   instructor-only.

These are pedagogical knobs, not architectural blockers.

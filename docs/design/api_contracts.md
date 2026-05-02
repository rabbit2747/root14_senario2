# API Contracts Specification
# Orion Echo Enterprise APT Range

Version: 1.0
Date: 2026-04-29
Companion to: `ai_instruction_enterprise_apt_range.md` (§13–14)
Audience: implementation engineers / AI coding agent

---

## 0. Scope

This document defines the request/response schemas, authentication, and error
conventions for every service-to-service and student-to-service API in the
range. All schemas use JSON unless noted. All times are RFC 3339 UTC. All IDs
are URL-safe strings unless noted.

Field names in this document are normative. Implementations must use exactly
these names.

---

## 1. Authentication Schemes

The range uses three distinct auth schemes. Every endpoint listed below
declares which scheme protects it.

### 1.1 OIDC-lite (student → vendor-portal / intranet-class services)

- IdP: `corp-sso`
- Token format: JWT, HS256, signed with per-session secret `OIDC_SIGNING_KEY`
- Required claims: `sub`, `aud`, `iss`, `exp`, `iat`, `jti`, `dept`, `groups[]`
- Lifetime: 3600 seconds; refresh tokens not implemented (forces re-login)
- Cookie: `oes_session=<jwt>; HttpOnly; SameSite=Lax`
- Header alternative: `Authorization: Bearer <jwt>`

### 1.2 Service Bearer (service → service)

- Header: `Authorization: Bearer <token>`
- Token format: `<service_name>.<ts>.<nonce>.<hex_hmac>` where
  `hex_hmac = HMAC_SHA256(SERVICE_AUTH_SECRET, "${service_name}:${ts}:${nonce}")`
- Verification: receiver checks `|now - ts| ≤ 300`, recomputes HMAC
- Service identity is provisioned by `lab-controller` via per-session env at session start

### 1.3 Control Plane (lab-controller / flag-service ↔ services)

- Header: `X-Orion-Control: <token>`
- Token format: HMAC-SHA256 of `"${session_id}:${path}:${ts}"` with
  `CONTROL_PLANE_SECRET`
- Routes prefixed `/internal/*` MUST reject requests without this header
- Only `lab-controller` and `flag-service` may mint control tokens

### 1.4 Anonymous

- Permitted on: `public-site/*`, `public-docs/*`, `vendor-portal /`, `vendor-portal /releases/public`, `support-portal /`, `corp-sso /.well-known/*`
- All other routes require auth

---

## 2. Common Conventions

### 2.1 Headers (all responses)

```
X-Request-Id: <uuid4>
X-Service: <service_name>
X-Service-Version: <semver>
X-Build-Id: <build_id>
```

### 2.2 Error envelope

```json
{
  "error": {
    "code": "string_enum",
    "message": "human readable",
    "request_id": "uuid",
    "details": { "free_form": "object" }
  }
}
```

Standard `code` values: `bad_request`, `unauthorized`, `forbidden`,
`not_found`, `conflict`, `rate_limited`, `internal_error`, `service_unavailable`.

### 2.3 Pagination

```
GET /resource?limit=50&cursor=<opaque>
→ { "items": [...], "next_cursor": "opaque|null", "limit": 50 }
```

### 2.4 Health / metadata (every container exposes these)

```
GET /health           → 200 { "status": "ok", "uptime_s": 1234 }
GET /service/version  → 200 { "service": "vendor-portal", "version": "2.6.4", "build_id": "build-2026-0429-001", "channel": "production" }
GET /service/build-info → 200 { "git_sha": "abcdef", "built_at": "...", "service_account": "vp-svc" }
```

---

## 3. lab-controller API

Auth: §1.3 control plane token.

### 3.1 POST /sessions

Create a new session.

```json
// request
{
  "user_id": "ctfd-user-12",
  "challenge_id": "orion-echo-main",
  "ttl_seconds": 10800,
  "options": { "preset": "default" }
}
```

```json
// response 201
{
  "session_id": "s_3kQ9xv7",
  "session_url": "https://s-3kQ9xv7.orion.training.lab/",
  "expires_at": "2026-04-29T13:00:00Z",
  "compose_project": "orion_s_3kQ9xv7",
  "subnet_pool": "10.50.7.0/24",
  "stages": ["flag_0_recon_context", "...", "flag_10_final_objective"]
}
```

### 3.2 GET /sessions/{id}

```json
// response 200
{
  "session_id": "s_3kQ9xv7",
  "state": "running",          // pending|seeding|running|expiring|deleted
  "created_at": "...",
  "expires_at": "...",
  "stage_progress": { "flag_0_recon_context": "completed", "flag_1_initial_access": "pending" },
  "container_health": [ { "name": "vendor-portal", "status": "healthy" } ]
}
```

### 3.3 DELETE /sessions/{id}

Returns 202 with `{ "session_id": "...", "state": "expiring" }`. Idempotent.

### 3.4 POST /sessions/{id}/reset

Same body shape as create-options; returns same response shape as POST /sessions
with the same `session_id` but a new `session_secret`.

### 3.5 GET /sessions/{id}/health

```json
{
  "session_id": "s_3kQ9xv7",
  "summary": "healthy|degraded|failing",
  "last_checked_at": "...",
  "checks": [
    { "container": "vendor-portal", "ok": true, "latency_ms": 12 },
    { "container": "corp-sso",      "ok": true, "latency_ms": 9 }
  ]
}
```

### 3.6 Internal callbacks (used by session-agent)

```
POST /internal/sessions/{id}/heartbeat   { "agent_uptime_s": 360 }
POST /internal/sessions/{id}/incident    { "kind": "container_oom", "container": "corp-db" }
```

---

## 4. flag-service API

### 4.1 POST /verify (student-facing, called by CTFd)

Auth: shared CTFd↔flag-service secret in `X-CTFd-Auth` header.

```json
// request
{ "user_id": "ctfd-user-12", "session_id": "s_3kQ9xv7", "stage_id": "flag_4_internal_discovery", "submission": "orion{...}" }
```

```json
// response 200
{ "valid": true, "stage_id": "flag_4_internal_discovery", "next_stage": "flag_5_credential_material" }
```

### 4.2 GET /internal/flags/{session_id}/{stage_id}

Auth: §1.3 control plane.

```json
{ "session_id": "s_3kQ9xv7", "stage_id": "flag_4_internal_discovery", "flag": "orion{...}" }
```

### 4.3 POST /internal/stage-complete

Called by services or `c2-emulator` to mark a stage as completed.

```json
// request
{
  "session_id": "s_3kQ9xv7",
  "stage_id": "flag_3_persistence_c2",
  "evidence": { "kind": "c2_register", "host": "vendor-portal", "ts": "..." }
}
```

```json
// response 200
{ "accepted": true, "issued_flag_for_stage": "flag_3_persistence_c2" }
```

Implementation note: `flag-service` computes
`FLAG = "orion{" + base32(HMAC_SHA256(MASTER_SECRET, session_id + ":" + stage_id))[:24] + "}"`.
The student then submits this flag through CTFd.

---

## 5. corp-sso (OIDC-lite) API

OIDC subset, simplified for the lab. Conformant with OAuth 2.0 Authorization
Code flow only.

### 5.1 GET /.well-known/openid-configuration (anonymous)

```json
{
  "issuer": "https://sso.corp.local",
  "authorization_endpoint": "https://sso.corp.local/oauth/authorize",
  "token_endpoint": "https://sso.corp.local/oauth/token",
  "userinfo_endpoint": "https://sso.corp.local/oauth/userinfo",
  "jwks_uri": "https://sso.corp.local/oauth/jwks",
  "response_types_supported": ["code"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["HS256"]
}
```

### 5.2 GET /oauth/authorize (browser flow)

Query params: `response_type=code`, `client_id`, `redirect_uri`, `scope`, `state`, `code_challenge`, `code_challenge_method=S256`.

Redirects to login page on first hit. After successful login, redirects back to
`redirect_uri` with `?code=<auth_code>&state=<state>`.

### 5.3 POST /oauth/token

```
Content-Type: application/x-www-form-urlencoded
grant_type=authorization_code&code=...&redirect_uri=...&client_id=...&code_verifier=...
```

```json
// response 200
{ "access_token": "<jwt>", "id_token": "<jwt>", "token_type": "Bearer", "expires_in": 3600 }
```

### 5.4 GET /oauth/userinfo

Auth: bearer access_token.

```json
{ "sub": "emp-0048", "email": "f.alqasimi@orionecho.test", "name": "Fatima Al Qasimi", "dept": "release-engineering", "groups": ["releng", "build-trigger"] }
```

### 5.5 GET /oauth/jwks (anonymous)

For HS256 the JWKS is intentionally empty (`{ "keys": [] }`). Callers that
expect RS256 will fail safely, which is realistic.

### 5.6 Registered clients (seeded at session start)

```
client_id=vendor-portal     redirect_uri=https://portal.orionecho.test/callback
client_id=intranet          redirect_uri=https://intranet.corp.local/cb
client_id=ticket-service    redirect_uri=https://tickets.corp.local/cb
client_id=wiki              redirect_uri=https://wiki.corp.local/cb
client_id=doc-portal        redirect_uri=https://docs.corp.local/cb
client_id=hr-directory      redirect_uri=https://hr.corp.local/cb
client_id=build-server      (machine, password grant disabled — service token only)
```

---

## 6. vendor-portal API

Auth: anonymous for `/`, `/releases/public`, `/login`, `/callback`. OIDC bearer required for `/me`, `/releases/private`, `/tickets/*`.

```
GET  /health              → §2.4
GET  /                    → HTML landing
GET  /releases/public     → 200 [{ "version": "2.6.4", "channel": "stable", "released_at": "...", "summary": "..." }]
GET  /releases/private    → 200 [...] (auth required, includes "anrc" channel)
POST /login               → 302 to corp-sso authorize
GET  /callback?code=...   → 302 / with cookie set
GET  /me                  → 200 { "sub": "emp-...", "name": "...", "groups": [...] }
GET  /tickets             → 200 paginated
GET  /tickets/{id}        → 200 ticket detail
```

---

## 7. build-server API

Auth: §1.2 service bearer. Internal callers: `ci-runner`, `release-engineering` user tokens via vendor-portal proxy.

### 7.1 POST /api/jobs

```json
// request
{
  "repo": "orionecho/echo-agent",
  "ref": "refs/heads/release/2.6.4",
  "build_config": "release",
  "channel": "anrc",
  "trigger_token": "BUILD_TRIGGER_TOKEN_VALUE",
  "metadata": { "requested_by": "emp-0048" }
}
```

```json
// response 202
{
  "job_id": "build-2026-0429-001",
  "status": "queued",
  "queued_at": "..."
}
```

### 7.2 GET /api/jobs/{job_id}

```json
{
  "job_id": "build-2026-0429-001",
  "status": "queued|running|signed|published|failed",
  "stages": [
    { "name": "fetch", "status": "ok", "started_at": "...", "ended_at": "..." },
    { "name": "compile", "status": "ok" },
    { "name": "package", "status": "ok", "artifact_id": "art-9f7c2" },
    { "name": "sign", "status": "ok", "signature_id": "sig-aa01" },
    { "name": "publish", "status": "ok", "channel": "anrc", "manifest_url": "..." }
  ],
  "logs_url": "/api/jobs/build-2026-0429-001/logs"
}
```

### 7.3 GET /api/artifacts/{artifact_id}

```json
{
  "artifact_id": "art-9f7c2",
  "name": "echo-agent-2.6.4.tar.gz",
  "size_bytes": 5214093,
  "sha256": "<hex>",
  "url": "http://build-server:8080/api/artifacts/art-9f7c2/blob",
  "marker": "ORION_ECHO_BUILD_MARKER=s_3kQ9xv7"
}
```

`GET /api/artifacts/{id}/blob` streams the tarball. The tarball contains a
benign `EchoAgent` shell script and a marker file `LAB_BUILD_MARKER` whose
contents include the session_id. No executable behavior beyond the marker.

### 7.4 GET /api/environment

```json
{
  "build_node": "ci-runner-01",
  "tools": { "go": "1.22", "python": "3.12" },
  "env_hints": ["RELEASE_STAGING_TOKEN", "ORION_ECHO_BUILD_MARKER"]
}
```

(Stage 5 cluepoint: this endpoint exposes env var *names* but never values.)

---

## 8. signing-service API

Auth: §1.2 service bearer. Caller MUST be `build-server` per allowlist.

### 8.1 POST /api/sign

```json
// request
{
  "kid": "orion-lab-signing-key",
  "payload_sha256": "<hex of canonical manifest>",
  "channel": "anrc",
  "build_id": "build-2026-0429-001"
}
```

```json
// response 200
{
  "signature": {
    "alg": "HMAC-SHA256",
    "kid": "orion-lab-signing-key",
    "value": "<hex>"
  },
  "signed_at": "..."
}
```

The signing-service refuses any payload whose canonical manifest is missing
the `metadata.lab_marker` field equal to `ORION_ECHO_BUILD_MARKER`. This
ensures students cannot trick the signer into producing signatures over
arbitrary content.

### 8.2 POST /api/verify

```json
// request
{ "kid": "orion-lab-signing-key", "payload_sha256": "<hex>", "signature": "<hex>" }
// response 200
{ "valid": true, "kid": "orion-lab-signing-key" }
```

---

## 9. update-server API

### 9.1 GET /channels/{channel}/manifest.json (public to customer-app, OIDC-protected for `anrc` channel via vendor-portal)

```json
{
  "product": "EchoAgent",
  "channel": "anrc",
  "version": "2.6.4",
  "build_id": "build-2026-0429-001",
  "artifact": {
    "name": "echo-agent-2.6.4.tar.gz",
    "sha256": "<hex>",
    "url": "http://updates.release.local/artifacts/echo-agent-2.6.4.tar.gz",
    "size_bytes": 5214093
  },
  "signature": {
    "alg": "HMAC-SHA256",
    "kid": "orion-lab-signing-key",
    "value": "<hex>"
  },
  "metadata": {
    "customer": "anrc",
    "generated_at": "...",
    "lab_marker": "ORION_ECHO_BUILD_MARKER=s_3kQ9xv7"
  }
}
```

### 9.2 GET /artifacts/{artifact_name}

Streams the tarball. Verifies the artifact exists in the channel manifest before serving.

### 9.3 POST /internal/publish

Auth: §1.3 control or §1.2 service bearer (caller=`build-server`).

```json
// request
{ "channel": "anrc", "manifest": { ... full manifest object ... } }
// response 200
{ "published": true, "channel": "anrc", "version": "2.6.4" }
```

### 9.4 Channel list

`stable`, `beta`, `internal-canary`, `anrc` (per-customer), `legacy-2.5`.

The `anrc` channel is the intended target. `legacy-2.5` is a decoy with
attractive but useless artifacts.

---

## 10. customer-app polling protocol

`customer-app` is the simulated EchoAgent installed at ANRC. It polls
`update-server` every 60 seconds.

```
GET https://updates.release.local/channels/anrc/manifest.json
Accept: application/json
X-EchoAgent-Version: 2.6.3
X-EchoAgent-Customer: anrc
Authorization: Bearer <CUSTOMER_ANRC_CHANNEL_TOKEN>
```

On a new manifest:
1. Verify `signature.value` against `signing-service /api/verify`.
2. Fetch `artifact.url`, validate sha256.
3. Extract; locate `LAB_BUILD_MARKER` file.
4. POST to `customer-api /internal/agent/update-applied` with the marker contents.
5. Update local `installed_version`.

The customer-app exposes a small UI:

```
GET /                     → status page (HTML), shows installed version, last poll
GET /api/status           → 200 { "version": "2.6.4", "last_poll": "...", "trust_chain": ["orion-lab-signing-key"] }
GET /api/recent-updates   → 200 [{ "version": "...", "applied_at": "...", "marker": "..." }]
```

---

## 11. customer-api API

Auth: bearer token issued to `customer-app` only (`CUSTOMER_API_TOKEN`).
Token scope is checked per endpoint.

```
GET  /metadata        → 200 { "tenant": "anrc", "region": "uae-northeast-1", "object_store": "anrc-objects" }
GET  /facilities      → 200 paginated; 5–10 facility records
GET  /audits          → 200 paginated; 30–80 audit records
GET  /exports         → 200 paginated; lists export jobs and presigned URLs
GET  /exports/{id}    → 200 single export with object key
POST /internal/agent/update-applied  → 200 (called by customer-app, control auth)
```

Sample export record:

```json
{
  "id": "exp-2026-Q2-007",
  "kind": "facility-audit",
  "created_at": "...",
  "object_key": "anrc-audit-exports/2026/Q2/facility-risk-summary.pdf",
  "presigned_url": "http://object-store:9000/anrc-audit-exports/2026/Q2/facility-risk-summary.pdf?X-Amz-Signature=..."
}
```

The presigned URL is the bridge to `object-store`. The signing key for the
presign is rotated per session.

---

## 12. c2-emulator protocol

`c2-emulator` is a per-session container on `control_net` that is reachable
**only** through specific compromised services. It models a bounded implant
beacon.

### 12.1 Beacon registration (called from a student-controlled foothold)

```
POST http://c2-emulator:7300/beacon/register
Content-Type: application/json
{
  "session_id": "s_3kQ9xv7",
  "implant_id": "<random-32hex>",
  "host": "vendor-portal",
  "user_context": "vp-svc",
  "reachable_targets": ["corp-sso", "corp-db", "intranet"]
}
```

```json
// response 200
{ "implant_id": "<echo>", "registered_at": "...", "actions_endpoint": "/beacon/{implant_id}/actions" }
```

Triggering this endpoint marks `flag_3_persistence_c2` as completed via
`flag-service /internal/stage-complete`.

### 12.2 Action poll (long-poll, 30s)

```
GET /beacon/{implant_id}/actions
```

```json
// response 200
[ { "action_id": "act-1", "kind": "discover_services", "params": {} } ]
```

### 12.3 Action result post

```
POST /beacon/{implant_id}/actions/{action_id}/result
{ "ok": true, "output": "free-form, capped at 16 KB" }
```

### 12.4 Allowed action enum (closed set, no free-form commands)

```
register
discover_services
list_env_var_names
read_known_file_marker
collect_predefined_artifact
report_progress
mark_persistence_simulated
exit
```

Any non-listed action is rejected with 400 `bad_request`. There is no shell
exec, no file write, no network egress, no lateral spread.

### 12.5 Operator console (instructor-only)

```
GET /operator/beacons          → list active implants per session
POST /operator/push-hint       → { "session_id": "...", "stage_id": "...", "hint": "..." }
```

Auth: §1.3 control plane.

---

## 13. session-agent API

Per-session container on `control_net`. Reports to `lab-controller`.

```
GET  /agent/health   → 200 (container probe)
POST /agent/probe    → triggers internal port checks across the session, returns aggregate health
GET  /agent/stage    → 200 { "current_stage": "flag_4_internal_discovery", "completed": ["flag_0...", "flag_1..."] }
```

The agent itself does not gate stages; it is a passive reporter.

---

## 14. audit-log API

Auth: §1.2 service bearer for write, anonymous for read of certain queries.

```
POST /events                    write event (services emit here)
GET  /events?service=&since=    read events (paginated)
GET  /events/{id}
```

Event schema:

```json
{
  "id": "evt-...",
  "ts": "...",
  "service": "build-server",
  "kind": "job.published",
  "subject": "build-2026-0429-001",
  "actor": "emp-0048",
  "data": { "channel": "anrc", "version": "2.6.4" }
}
```

---

## 15. Service identity matrix

Provisioned at session start by `lab-controller` and injected as env vars in
each container. Each service has one identity; no service has more than one.

| Service           | Identity          | May call                                                |
|-------------------|-------------------|---------------------------------------------------------|
| vendor-portal     | `vp-svc`          | corp-sso, corp-db, ticket-service                       |
| support-portal    | `sp-svc`          | corp-db, ticket-service                                 |
| intranet          | `intra-svc`       | corp-sso, corp-db                                       |
| wiki              | `wiki-svc`        | corp-sso, corp-db                                       |
| ticket-service    | `tk-svc`          | corp-sso, corp-db, mail-web                             |
| hr-directory      | `hr-svc`          | corp-sso, corp-db                                       |
| doc-portal        | `doc-svc`         | corp-sso, corp-db                                       |
| build-server      | `build-svc`       | source-repo, package-registry, signing-service, update-server, audit-log |
| ci-runner         | `ci-svc`          | build-server, source-repo, package-registry            |
| signing-service   | `sign-svc`        | audit-log                                               |
| update-server     | `update-svc`      | release-db, audit-log                                   |
| customer-app      | `cust-app-svc`    | update-server, signing-service (verify), customer-api   |
| customer-api      | `cust-api-svc`    | object-store, audit-log                                 |
| c2-emulator       | `c2-svc`          | flag-service                                            |
| session-agent     | `sa-svc`          | lab-controller, flag-service                            |

A call from any service not listed in "May call" must be rejected with 403.
This is the trust matrix that the network policy must mirror.

---

## 16. Open questions for engineering review

1. Whether `corp-sso` should issue RS256 instead of HS256 for the
   `release-engineering` group only, to model a real key-pair cluepoint.
2. Whether `customer-app` should accept manifests outside the `anrc` channel
   (currently no — but this could be relaxed to model a misconfigured agent).
3. Whether `c2-emulator` action results should be visible to the student
   directly or only via the operator console.

These are deliberately deferred and should not block Phase 1–4 implementation.

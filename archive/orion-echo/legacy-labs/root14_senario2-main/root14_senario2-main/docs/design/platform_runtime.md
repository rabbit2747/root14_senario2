# Platform Runtime Specification
# Orion Echo Enterprise APT Range

Version: 1.0
Date: 2026-04-29
Companion to: `ai_instruction_enterprise_apt_range.md`, `api_contracts.md`, `data_schema.md`
Audience: implementation engineers / AI coding agent / SRE

---

## 0. Scope

This document covers the runtime mechanics that make the range actually work
when 20 concurrent sessions run on one host:

- Compose project topology and naming
- Per-session networks and subnets
- Default-deny network enforcement strategy
- Reverse proxy strategy (global + edge)
- DNS strategy (internal + external)
- TLS strategy
- Secrets management
- Volume management and TTL cleanup
- CTFd integration
- Container resource enforcement
- Logging and operator monitoring
- Backup, cost, and ops alerts

---

## 1. Compose project topology

The platform consists of two layers:

### 1.1 Shared platform layer (one Compose project per host)

Compose project name: `orion_platform`

Containers (1 set per host):

```
ctfd, ctfd-db, ctfd-cache
lab-controller
flag-service
global-reverse-proxy   (Traefik)
registry               (Docker Registry mirror for custom images)
prometheus
grafana
loki                   (log aggregation)
alertmanager
internal-ca            (cfssl or step-ca; issues internal TLS certs)
seed-runner            (one-shot worker called by lab-controller)
```

This Compose project starts at boot via systemd unit `orion-platform.service`.

### 1.2 Per-session layer (one Compose project per active session)

Compose project name: `orion_s_<session_id>` (e.g. `orion_s_3kQ9xv7`)

Each per-session project is generated dynamically by `lab-controller` from a
template using session variables (`.env`, network subnets, TLS certs,
secrets). The generated `docker-compose.yml` is written to
`/var/lib/orion/sessions/<session_id>/compose.yml` and brought up with:

```
docker compose -p orion_s_<sid> -f /var/lib/orion/sessions/<sid>/compose.yml up -d
```

Project names, container names, volume names, and network names are all
session-prefixed to guarantee no collision across 20 sessions.

---

## 2. Per-session networks and subnets

### 2.1 Network names

Each session has 7 user-defined bridge networks:

```
orion_s_<sid>_public_net
orion_s_<sid>_dmz_net
orion_s_<sid>_corp_net
orion_s_<sid>_dev_net
orion_s_<sid>_release_net
orion_s_<sid>_customer_net
orion_s_<sid>_control_net
```

(`build_net` from earlier docs is collapsed into `dev_net`+`release_net`
membership since it added a network without changing isolation.)

### 2.2 Subnet allocation

The platform owns `10.50.0.0/16`. `lab-controller` allocates one `/24` per
session from this pool, then sub-divides into seven `/27`s:

```
session N base: 10.50.<2*N>.0/24
   /27 #0  10.50.<2*N>.0/27    public_net
   /27 #1  10.50.<2*N>.32/27   dmz_net
   /27 #2  10.50.<2*N>.64/27   corp_net
   /27 #3  10.50.<2*N>.96/27   dev_net
   /27 #4  10.50.<2*N>.128/27  release_net
   /27 #5  10.50.<2*N>.160/27  customer_net
   /27 #6  10.50.<2*N>.192/27  control_net
```

This gives ~30 usable IPs per network (enough for any subset of the 20–25
containers attached to it). `lab-controller` keeps an allocation table in
`session-state` MinIO bucket and reuses freed `/24`s.

For 20 sessions × 7 networks = 140 Docker networks, well under Docker's
practical limit (~1000+ on modern kernels). The platform reserves
`10.51.0.0/16` as overflow.

### 2.3 Network membership rules

A container is attached to **only** the networks it absolutely needs. The
multi-attachment is the primary isolation tool.

```
edge-proxy           public_net, dmz_net
public-site          dmz_net
public-docs          dmz_net
vendor-portal        dmz_net, corp_net
support-portal       dmz_net, corp_net
corp-sso             corp_net
intranet             corp_net
wiki                 corp_net
ticket-service       corp_net
hr-directory         corp_net
mail-web             corp_net
doc-portal           corp_net
corp-db              corp_net
source-repo          dev_net
package-registry     dev_net
build-server         dev_net, release_net
ci-runner            dev_net
signing-service      release_net
update-server        release_net, customer_net
release-db           release_net
customer-app         customer_net
customer-api         customer_net
object-store         customer_net
monitoring           customer_net
audit-log            customer_net, control_net
session-agent        control_net, (read-only attach to corp_net for probes)
c2-emulator          control_net
```

Anything outside these attachments is by definition unreachable.

### 2.4 Default-deny enforcement (the gap §5.2 left open)

Docker's bridge networking is permissive within a network. The §15 service
identity matrix in `api_contracts.md` defines the allowed call pairs. We
enforce default-deny in three layered ways:

**Layer 1 — network membership:** if two services aren't on a shared network,
they cannot reach each other. This eliminates most pairs.

**Layer 2 — application auth:** services validate `Authorization` headers
against the `identity.service_accounts` table (see §15 of api_contracts).
A service that *is* on a shared network but is not on the allowlist is
rejected at the app layer with 403.

**Layer 3 — egress controls:** scenario containers must not reach the
internet by default. We achieve this by:

```
- Each session network has --internal=false (Docker's --internal=true would also block container-to-container DNS, so we don't use it)
- Instead, the host runs an iptables chain ORION_EGRESS that:
    * permits 10.50.0.0/15 (intra-platform)
    * permits 169.254.0.0/16 (link-local for Docker DNS)
    * drops all other egress from any veth in the orion subnet pool
- iptables rules are installed by orion-platform.service start hook and
  reverified every 60s by lab-controller
```

For inter-session isolation: bridge networks have unique names and unique
subnets, so cross-session traffic is impossible at L2. The iptables chain
also explicitly drops `10.50.<a>.0/24 → 10.50.<b>.0/24` for `a != b`.

For host-network protection: no container in the platform uses
`network_mode: host`, no container mounts `/var/run/docker.sock`, no
container runs `--privileged`. `lab-controller` uses Docker's UNIX socket
**read-only** for status, and shells out to `docker compose` for lifecycle
operations under a dedicated unprivileged user `orion-runner` whose only
extra capability is membership in the `docker` group.

---

## 3. Reverse proxy strategy

### 3.1 Two layers

**Global reverse proxy** (`global-reverse-proxy`, Traefik 3.x):

- Faces the public internet (or VPN).
- Owns wildcard cert for `*.orion.training.lab` and the platform admin domain.
- Routes by `Host` header: `s-<sid>.orion.training.lab/*` → that session's
  edge-proxy. Admin paths route to CTFd, lab-controller (operator), Grafana.
- Discovers sessions via Docker provider, watching containers labeled:
  ```
  orion.session.id=<sid>
  orion.role=session-edge
  traefik.http.routers.s-<sid>.rule=Host(`s-<sid>.orion.training.lab`)
  ```
  These labels are written by `lab-controller` when generating the per-session
  Compose file, on the `edge-proxy` container only.

**Per-session edge proxy** (`edge-proxy`, Nginx):

- Lives inside each session's `public_net`+`dmz_net`.
- Routes `/` to public-site, `/portal/*` to vendor-portal, `/docs/*` to
  public-docs, `/support/*` to support-portal, etc.
- Terminates TLS for the session's own internal hostnames using a
  session-issued cert from `internal-ca`.

This two-layer split lets the global proxy stay simple (Host-based routing
only) while each session controls its own internal URL structure.

### 3.2 No direct exposure

Backend containers (everything except `edge-proxy`) bind only to internal
networks. They never have a `ports:` mapping in Compose. The global proxy is
the only thing that publishes ports `80/443` on the host.

---

## 4. DNS strategy

### 4.1 External DNS

A wildcard A record for `*.orion.training.lab` points to the host IP. Plus an
A record for the admin domain (`admin.orion.training.lab`).

For UAE delivery, the actual zone name is decided at deployment time and
overridden in `lab-controller` env. `orion.training.lab` is the placeholder.

### 4.2 Internal DNS per session

Each session needs `wiki.corp.local`, `git.dev.local`, etc., to resolve
*inside* the session networks. Two approaches were considered:

- A per-session CoreDNS container (added complexity).
- Use Docker's built-in network DNS with explicit `aliases:` on each
  container.

We chose **the second**. Each container is given network-scoped aliases in
the Compose file:

```yaml
services:
  wiki:
    networks:
      corp_net:
        aliases:
          - wiki.corp.local
          - wiki
```

For a service that needs an alias on a network it's not on (e.g. the
`updates.release.local` name reachable from `customer_net`), we either add
the network membership or proxy through `update-server`'s existing
membership.

This eliminates one container per session and uses Docker DNS (`127.0.0.11`)
which is already running.

The earlier `internal-dns` container is removed from the per-session inventory
in favor of Compose aliases. This saves ~256 MB and one container × 20.

### 4.3 Public hostnames inside the lab

Public-facing hostnames like `portal.orionecho.test` are routed via the
session edge-proxy. We add an Nginx `server_name` for them, and the global
reverse-proxy splits by Host. From the public internet they resolve via DNS
(wildcard) to the host. Inside the session network, the edge-proxy answers.

Students who want to use `portal.orionecho.test` from their laptop must use
the session URL provided at session start (which is the real DNS record). The
fictional domain works *inside* the network but not on the open internet.

---

## 5. TLS strategy

### 5.1 Public

Wildcard cert for `*.orion.training.lab`. Issued via Let's Encrypt DNS-01
where DNS is delegated, or via a paid wildcard cert otherwise. Renewed by
`global-reverse-proxy` (Traefik native).

### 5.2 Internal (per-session)

`internal-ca` (step-ca) is a shared platform container that issues short-
lived certs for `*.corp.local`, `*.dev.local`, `*.release.local`,
`*.customer.local`, `*.mgmt.local`, `*.data.local`, `*.orionecho.test`.

`lab-controller` requests certs at session start, mounts them into edge-proxy
and (for some services) backend containers, and passes the CA root certificate
into the same containers as a trust anchor.

Internal certs are NOT trusted by student browsers. Students access through
the public name on `*.orion.training.lab`. The internal certs only matter for
service-to-service TLS (which we keep optional in Phase 1–4 to reduce
complexity; HTTP between containers is acceptable).

---

## 6. Secrets management

### 6.1 Per-session generation

At session creation, `lab-controller` generates these per-session secrets and
writes them to `/var/lib/orion/sessions/<sid>/secrets.env` (mode 0600,
owner `orion-runner`):

```
SESSION_ID
SESSION_SECRET                 32 random bytes hex
OIDC_SIGNING_KEY               32 random bytes hex
SERVICE_AUTH_SECRET            32 random bytes hex
CONTROL_PLANE_SECRET           32 random bytes hex
HMAC_FLAG_KEY                  32 random bytes hex (per-session derivation of master flag)
SIGNING_KEY_VALUE              32 random bytes hex (signing-service)
MINIO_ROOT_USER, MINIO_ROOT_PASSWORD
POSTGRES_CORP_PASSWORD, POSTGRES_RELEASE_PASSWORD
GITEA_ADMIN_PASSWORD
BUILD_TRIGGER_TOKEN            (also planted in cluepoint locations)
RELEASE_STAGING_TOKEN
CUSTOMER_ANRC_CHANNEL_TOKEN
CUSTOMER_API_TOKEN
LEGACY_BUILD_TOKEN_DECOY       expired-marked token used for decoys
```

Compose injects via `env_file: secrets.env`. No secret is committed to repo.

### 6.2 Platform-wide secrets

These live on the host in `/etc/orion/platform.env` (root only):

```
GLOBAL_SEED_SALT                 stable across deployments
MASTER_FLAG_SECRET               root for HMAC of all flags
INTERNAL_CA_PASSWORD             step-ca unlock
LETSENCRYPT_DNS_API_TOKEN        for cert renewal
GRAFANA_ADMIN_PASSWORD
CTFD_SECRET_KEY
CTFD_DB_PASSWORD
ALERTMANAGER_WEBHOOK_URL
```

Platform secrets are loaded by systemd into `lab-controller` only. Sessions
do not see them.

### 6.3 Secret rotation

- Per-session secrets rotate on every session create or reset (new random).
- Platform secrets rotate manually (documented in `runbook.md`, not auto).
- Honey credentials and decoy tokens have `_DECOY` or `_LEGACY` suffix in
  their name and an `expired_at` field stored alongside in `corp-db`. They
  remain present for student discovery but are validated and rejected by any
  real service that checks them.

---

## 7. Volume management and TTL cleanup

### 7.1 Volume naming

```
orion_s_<sid>_corp_db_data
orion_s_<sid>_release_db_data
orion_s_<sid>_gitea_data
orion_s_<sid>_minio_data
orion_s_<sid>_mail_data
orion_s_<sid>_student_workspace
```

### 7.2 TTL flow

- Default session TTL: 180 minutes (configurable per challenge).
- `session-agent` heartbeats every 30s. If a heartbeat misses 5 cycles,
  `lab-controller` marks the session `unhealthy` (does not auto-delete).
- `lab-controller` runs a sweeper every 60s that:
  - finds sessions where `expires_at < now`
  - sends a 10-minute warning (if not already sent and 10 mins remain)
  - on expiry: state=expiring → run `docker compose -p orion_s_<sid> down -v`
    (the `-v` removes anonymous volumes; we explicitly remove named volumes
    by name except `student_workspace`)
  - removes session networks
  - removes Traefik labels (the project goes away with the containers)
  - archives logs from `loki` for the session into a tarball under
    `/var/lib/orion/archives/<sid>.tar.zst` if the challenge config says so
  - marks session `deleted`

### 7.3 Reset semantics

`POST /sessions/{sid}/reset`:

1. Lock session in lab-controller.
2. Save `student_workspace` volume aside.
3. Tear down Compose project.
4. Remove all session volumes EXCEPT `student_workspace`.
5. Generate fresh `secrets.env` (new SESSION_SECRET).
6. Recreate Compose project, mount `student_workspace` back.
7. Re-seed databases (regenerates the same employee/ticket data because the
   seed is keyed by `session_id`, but the SECRETs are now different — so any
   old tokens the student was holding are invalid).
8. Unlock.

This is intentional: reset gives a fresh state but doesn't wipe the student's
notes/scripts.

---

## 8. CTFd integration

### 8.1 Architecture

CTFd is the only student-facing portal. Students never touch
`lab-controller` directly. The flow:

```
Student logs in to CTFd
  → opens "Operation Orion Echo" challenge page
  → page has a "Launch session" button (CTFd plugin)
    → plugin calls POST lab-controller /sessions with the user_id and challenge_id
    → returns session_url
  → plugin renders the URL and a countdown to expiry
  → student opens session_url
  → student finds flags, submits them in CTFd
    → CTFd calls flag-service /verify with session_id (from the launched session)
    → flag-service confirms, CTFd awards points
```

### 8.2 CTFd plugin contract

A small CTFd plugin (`orion-launcher`) is required:

```python
# Pseudocode — actual plugin in services/ctfd-plugin/
@blueprint.route("/api/orion/launch", methods=["POST"])
@authed_only
def launch():
    user_id = current_user.id
    res = httpx.post(
        f"{LAB_CONTROLLER_URL}/sessions",
        headers={"X-Orion-Control": mint_control_token()},
        json={"user_id": str(user_id), "challenge_id": "orion-echo-main", "ttl_seconds": 10800},
    )
    return res.json()

@blueprint.route("/api/orion/session/<sid>/reset", methods=["POST"])
@authed_only
def reset(sid):
    # check ownership in CTFd's user→session map
    ...

@blueprint.route("/api/orion/verify", methods=["POST"])
def verify_proxy():
    # CTFd's submission hook → flag-service
    ...
```

Ownership map: CTFd plugin stores `(user_id → session_id)` in its own DB
(extension table) so students can't reset another student's session.

### 8.3 Flag submission flow

Override CTFd's default flag check via plugin hook. On submission, plugin
calls `flag-service /verify` with the user's `session_id`. Static flags in
CTFd are not used.

---

## 9. Container resource enforcement

The per-container limits in §15 of `ai_instruction` are translated to
Compose `deploy.resources.limits` (Compose v3) or `mem_limit`/`cpus`
(Compose v2):

```yaml
services:
  build-server:
    mem_limit: 768m
    cpus: 1.0
    mem_reservation: 384m
```

Total target per session: 5–7 GB average, 8–10 GB peak. With 20 sessions on
24 OCPU / 384 GB:

```
20 × 7 GB average = 140 GB working set
20 × 10 GB peak   = 200 GB peak
+ shared platform: 16 GB
+ OS + buffers:    16 GB
Total peak budget: 232 GB    (within 384 GB)
Headroom:          152 GB
```

The 32 OCPU / 512 GB option is recommended if peak coincidence is high.

OOM behavior: containers may OOMKill under sustained pressure. `session-agent`
detects and posts `incident` to `lab-controller`. Compose `restart: on-failure`
restores within 30s. Repeated kills (3 in 5 min) escalate to operator alert.

---

## 10. Logging and operator monitoring

### 10.1 Logs

All per-session containers log to stdout. The Docker logging driver is
`json-file` with rotation:

```
log-driver: json-file
log-opts:
  max-size: 50m
  max-file: 3
  labels: orion.session.id,orion.role
```

`promtail` (in shared platform) tails Docker JSON logs and ships to `loki`,
labelled with `session_id`, `service`, `role`. Loki retention: 14 days.

`grafana` (operator UI) provides dashboards:

- Sessions overview: live sessions, age, stage progress
- Per-session container health
- Resource pressure (memory/cpu) per session
- Audit-log event stream
- Stage completion timing histogram

### 10.2 Metrics

`prometheus` scrapes:

- cAdvisor (per-container CPU/RAM/IO)
- Traefik metrics
- `lab-controller /metrics`
- `flag-service /metrics`
- Postgres exporters (corp-db, release-db, ctfd-db) — one per session is heavy;
  we deploy a *shared* postgres exporter container per session ONLY if the
  challenge config enables it. Default: off.

### 10.3 Alerts (alertmanager)

- Session count > 22 (reservation breach)
- Host memory pressure > 85%
- Host disk usage > 80%
- Any container OOM-killed > 3 times in 5 minutes
- `lab-controller` unhealthy for > 60s
- Cost guardrail: a daily check of OCI budget (via OCI CLI inside
  `lab-controller` cron) compared to threshold; alert if over

### 10.4 Operator console

Lab-controller exposes a small web UI (mounted on `admin.orion.training.lab`
behind operator auth) with:

- Active session list with reset / extend / kill buttons
- Per-session stage progress
- Push hint to a session (calls `c2-emulator /operator/push-hint`)
- Bulk actions: pause new sessions, drain mode

---

## 11. Backup and disaster recovery

### 11.1 What we back up

```
/etc/orion/platform.env          daily, encrypted, off-host
ctfd-db                          daily, pg_dump, encrypted, off-host
loki retention                   14 days local, no off-host
internal-ca state                weekly, encrypted, off-host
```

### 11.2 What we don't back up

- Per-session DBs, volumes, MinIO data — sessions are ephemeral.
- Student progress in CTFd is the source of truth for accomplishment.

### 11.3 Restore drills

Documented in `runbook.md` (separate file). At minimum, before UAE delivery,
run:

1. Stop platform.
2. Restore `platform.env` and `ctfd-db` from backup on a clean host.
3. Verify CTFd login + a fresh session create works end-to-end.

---

## 12. Cost monitoring

OCI cost is tracked daily by:

- A 0600 UTC cron in `lab-controller` running `oci usage-api summary` (CLI
  with a read-only IAM principal).
- Output stored in `corp-db`-adjacent ops DB? — we keep a small SQLite at
  `/var/lib/orion/ops.sqlite` for ops state to avoid coupling ops with
  scenario DBs.
- If month-to-date cost > 80% of monthly budget, alertmanager fires.

---

## 13. Boot/shutdown sequence

### 13.1 Host boot

```
systemd:
  orion-platform.service  ExecStart=/usr/local/bin/orion-platform-up
                          Wants=docker.service
                          After=docker.service
```

`orion-platform-up`:

1. Verify Docker is healthy.
2. Install/refresh ORION_EGRESS iptables chain.
3. `docker compose -p orion_platform up -d`.
4. Wait for `lab-controller /health` = 200 (60s timeout).
5. Sweep stale `orion_s_*` projects (pre-existing from previous run that
   didn't shut down cleanly — drop them).

### 13.2 Host shutdown

`orion-platform-down`:

1. Stop accepting new sessions (lab-controller drain mode).
2. Send 5-minute warning to all live sessions via push-hint.
3. Tear down all `orion_s_*` projects.
4. Tear down `orion_platform` project.
5. Flush iptables ORION_EGRESS chain.

### 13.3 Container restart policy

```
shared platform: restart: unless-stopped
per-session:     restart: on-failure (max 3)
```

Per-session containers do not restart forever; if they fail repeatedly the
session is marked unhealthy and the operator decides to reset or kill.

---

## 14. Session creation timing budget

Target: 60 seconds from `POST /sessions` to `session_url` returning 200 from
the edge-proxy.

Budget breakdown:

```
allocate session_id, secrets, subnet     0.1s
generate compose.yml                     0.1s
docker compose up -d                     8–15s (parallel container starts)
wait for postgres ready                  4s
run seed scripts (corp-db, release-db)   15s
seed minio buckets and objects           5s
seed gitea repos                         8s
seed mail-web                            3s
seed wiki/tickets/docs/HR                4s
publish anrc channel manifest (Stage 6 prereq)  2s
register Traefik labels (already during compose)  0s
edge-proxy first 200 OK                  2s
                                         ─────
                                         ~52s
```

If this is too slow under load, parallelize the seed scripts (they are
independent except for foreign key references between `identity` and `hr`,
`tickets`).

---

## 15. Failure modes and recovery

| Failure                          | Detection                      | Recovery                                    |
|----------------------------------|--------------------------------|---------------------------------------------|
| Single container OOM             | Docker event, cAdvisor alert  | Compose restart, alert if ≥3 in 5m          |
| Postgres seed failure            | seed script exit code         | retry once, then mark session failed        |
| Traefik label not picked up      | health-check fails after 60s  | lab-controller forces Traefik provider reload via API |
| Subnet exhaustion                | 10.50.0.0/16 full             | spill to 10.51.0.0/16; alert                |
| `lab-controller` crash           | systemd notify miss           | systemd restart; sessions keep running      |
| `flag-service` crash             | health-check                  | systemd restart; flag verifications queued for 60s    |
| Loki disk full                   | alertmanager                  | rotate / drop oldest; alert ops             |
| iptables chain wiped             | reverification cron           | re-install chain                            |
| Docker socket compromise attempt | seccomp/audit log             | not possible from per-session containers (socket not mounted); alert if attempted   |

---

## 16. Open runtime items deferred to engineering review

1. Whether to use Docker Swarm/Compose `deploy.placement` for any host
   pinning (only relevant if we move to multi-host; out of scope for v1).
2. Whether to add a per-session Tailscale subnet router for instructors who
   want to reach internal containers from a laptop. Currently not needed.
3. Whether to pre-warm a pool of "ready" sessions to drop the 60s boot
   latency to <5s. Not needed for 1-person UAE walkthrough; revisit before
   production for any scale-up.

These do not block any phase before Phase 7 (load test).

# Data Schema Specification
# Orion Echo Enterprise APT Range

Version: 1.0
Date: 2026-04-29
Companion to: `ai_instruction_enterprise_apt_range.md`, `api_contracts.md`
Audience: implementation engineers / AI coding agent

---

## 0. Scope

This document defines all persistent storage layouts:

- `corp-db` (PostgreSQL): identity, HR, tickets, wiki, docs, mail, customers
- `release-db` (PostgreSQL): builds, signatures, manifests, channels, audit
- `object-store` (MinIO): bucket layout for ANRC and decoy data
- `source-repo` (Gitea): repository list, seed branches, seed commits
- `mail-web` (Mailpit): in-memory; seeding strategy described

`ctfd-db` is left to stock CTFd schema and is out of scope.

All DDL is PostgreSQL 16 syntax. All tables include `created_at TIMESTAMPTZ NOT
NULL DEFAULT now()` unless trivially short-lived. All ID columns are TEXT
(URL-safe slugs) unless stated.

---

## 1. Database deployment topology

| Container        | Engine        | Schemas                                                   |
|------------------|---------------|-----------------------------------------------------------|
| `corp-db`        | postgres:16   | `identity`, `hr`, `tickets`, `wiki`, `docs`, `mail`, `customers` |
| `release-db`     | postgres:16   | `release` (single schema)                                 |
| `ctfd-db`        | postgres:16   | stock CTFd                                                |

Multiple schemas in `corp-db` keep the per-session container count down. Each
service owns one schema and connects with a schema-scoped role.

Connection roles in `corp-db`:

```
sso_app       → identity.*       (read/write)
hr_app        → hr.*             (read/write), identity.* (read)
ticket_app    → tickets.*        (read/write), identity.* (read), hr.* (read)
wiki_app      → wiki.*           (read/write), identity.* (read)
doc_app       → docs.*           (read/write), identity.* (read)
mail_app      → mail.*           (read/write)
vendor_app    → customers.*, identity.* (read)
intranet_app  → identity.*, hr.*, tickets.* (read), wiki.* (read)
```

---

## 2. corp-db — schema `identity`

```sql
CREATE SCHEMA identity;

CREATE TABLE identity.sso_users (
  user_id        TEXT PRIMARY KEY,        -- e.g. "emp-0048"
  username       TEXT NOT NULL UNIQUE,    -- e.g. "f.alqasimi"
  email          TEXT NOT NULL UNIQUE,    -- e.g. "f.alqasimi@orionecho.test"
  password_hash  TEXT NOT NULL,           -- bcrypt; lab-only weak passwords
  display_name   TEXT NOT NULL,
  dept_id        TEXT NOT NULL,
  job_title      TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active', -- active|disabled|service
  must_reset     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.sso_groups (
  group_id   TEXT PRIMARY KEY,            -- e.g. "releng"
  name       TEXT NOT NULL,
  description TEXT
);

CREATE TABLE identity.sso_user_groups (
  user_id    TEXT NOT NULL REFERENCES identity.sso_users(user_id),
  group_id   TEXT NOT NULL REFERENCES identity.sso_groups(group_id),
  PRIMARY KEY (user_id, group_id)
);

CREATE TABLE identity.sso_clients (
  client_id      TEXT PRIMARY KEY,        -- e.g. "vendor-portal"
  client_secret  TEXT NOT NULL,           -- per-session generated
  redirect_uris  TEXT[] NOT NULL,
  grant_types    TEXT[] NOT NULL DEFAULT '{authorization_code}',
  description    TEXT
);

CREATE TABLE identity.sso_auth_codes (
  code           TEXT PRIMARY KEY,
  client_id      TEXT NOT NULL,
  user_id        TEXT NOT NULL,
  redirect_uri   TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  scope          TEXT[] NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  used           BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.service_accounts (
  account_id     TEXT PRIMARY KEY,        -- e.g. "build-svc"
  description    TEXT,
  bearer_secret  TEXT NOT NULL,           -- shared HMAC secret per session
  enabled        BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Seed: 40–80 users across 7 departments, 10–20 service accounts (see §10
naming policy).

---

## 3. corp-db — schema `hr`

```sql
CREATE SCHEMA hr;

CREATE TABLE hr.departments (
  dept_id      TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  manager_id   TEXT,                       -- references identity.sso_users.user_id
  description  TEXT
);

CREATE TABLE hr.employees (
  user_id          TEXT PRIMARY KEY REFERENCES identity.sso_users(user_id),
  employee_number  TEXT NOT NULL UNIQUE,
  hire_date        DATE NOT NULL,
  office_location  TEXT NOT NULL,         -- "Dubai HQ" | "Abu Dhabi Lab" | "Remote"
  phone            TEXT,
  emergency_note   TEXT
);

CREATE TABLE hr.org_assignments (
  user_id        TEXT NOT NULL,
  team_id        TEXT NOT NULL,
  role           TEXT NOT NULL,
  is_lead        BOOLEAN NOT NULL DEFAULT false,
  effective_from DATE NOT NULL DEFAULT current_date,
  PRIMARY KEY (user_id, team_id, effective_from)
);

CREATE TABLE hr.teams (
  team_id      TEXT PRIMARY KEY,
  dept_id      TEXT NOT NULL REFERENCES hr.departments(dept_id),
  name         TEXT NOT NULL,
  description  TEXT
);
```

Departments (fixed — referenced from team_plan §11):

```
corporate-it
product-engineering
release-engineering
customer-success
security-operations
hr-administration
partner-operations
```

---

## 4. corp-db — schema `tickets`

```sql
CREATE SCHEMA tickets;

CREATE TABLE tickets.tickets (
  ticket_id      TEXT PRIMARY KEY,         -- e.g. "OES-1042"
  title          TEXT NOT NULL,
  body           TEXT NOT NULL,
  status         TEXT NOT NULL,            -- open|in_progress|resolved|closed|wontfix
  priority       TEXT NOT NULL,            -- low|normal|high|critical
  category       TEXT NOT NULL,            -- helpdesk|engineering|release|security|customer
  reporter_id    TEXT REFERENCES identity.sso_users(user_id),
  assignee_id    TEXT REFERENCES identity.sso_users(user_id),
  customer_id    TEXT,                      -- nullable for internal tickets
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets.comments (
  comment_id     TEXT PRIMARY KEY,
  ticket_id      TEXT NOT NULL REFERENCES tickets.tickets(ticket_id),
  author_id      TEXT REFERENCES identity.sso_users(user_id),
  body           TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets.attachments (
  attachment_id  TEXT PRIMARY KEY,
  ticket_id      TEXT NOT NULL,
  filename       TEXT NOT NULL,
  object_key     TEXT NOT NULL,            -- key into object-store/decoy bucket
  size_bytes     BIGINT NOT NULL,
  content_type   TEXT,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status   ON tickets.tickets(status);
CREATE INDEX idx_tickets_category ON tickets.tickets(category);
CREATE INDEX idx_tickets_customer ON tickets.tickets(customer_id);
```

Seed: 80–150 tickets per `team_plan_enterprise_apt_range.md §11.3`.
Distribution rule:

```
helpdesk         40%   (mostly noise)
engineering      25%   (release process, CI hints)
release          15%   (signing, channel, manifest hints — Stage 5–7 cluepoints live here)
security         10%   (audit findings, decoy alerts)
customer         10%   (ANRC-specific)
```

---

## 5. corp-db — schema `wiki`

```sql
CREATE SCHEMA wiki;

CREATE TABLE wiki.pages (
  page_id       TEXT PRIMARY KEY,           -- slug, e.g. "release/runbook"
  title         TEXT NOT NULL,
  body_md       TEXT NOT NULL,              -- markdown
  author_id     TEXT REFERENCES identity.sso_users(user_id),
  category      TEXT NOT NULL,              -- runbook|policy|onboarding|architecture|customer|legacy
  is_public     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wiki.page_history (
  history_id    BIGSERIAL PRIMARY KEY,
  page_id       TEXT NOT NULL REFERENCES wiki.pages(page_id),
  body_md       TEXT NOT NULL,
  edited_by     TEXT,
  edited_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wiki.attachments (
  attachment_id TEXT PRIMARY KEY,
  page_id       TEXT NOT NULL REFERENCES wiki.pages(page_id),
  filename      TEXT NOT NULL,
  object_key    TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Seed: 40–80 pages. Categories:

```
runbook        30%
policy         15%
onboarding     15%
architecture   15%
customer       10%
legacy         15%   (decoys; outdated; misleading hints)
```

---

## 6. corp-db — schema `docs`

```sql
CREATE SCHEMA docs;

CREATE TABLE docs.folders (
  folder_id    TEXT PRIMARY KEY,
  parent_id    TEXT REFERENCES docs.folders(folder_id),
  name         TEXT NOT NULL,
  visibility   TEXT NOT NULL DEFAULT 'internal'    -- public|internal|restricted
);

CREATE TABLE docs.files (
  file_id      TEXT PRIMARY KEY,
  folder_id    TEXT NOT NULL REFERENCES docs.folders(folder_id),
  name         TEXT NOT NULL,
  object_key   TEXT NOT NULL,                       -- key into MinIO docs-bucket
  size_bytes   BIGINT NOT NULL,
  content_type TEXT,
  uploaded_by  TEXT REFERENCES identity.sso_users(user_id),
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The doc-portal stores file blobs in MinIO bucket `oes-docs` (see §9).

---

## 7. corp-db — schema `mail`

```sql
CREATE SCHEMA mail;

CREATE TABLE mail.mailboxes (
  mailbox_id    TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES identity.sso_users(user_id),
  address       TEXT NOT NULL UNIQUE
);

CREATE TABLE mail.messages (
  message_id    TEXT PRIMARY KEY,
  mailbox_id    TEXT NOT NULL REFERENCES mail.mailboxes(mailbox_id),
  from_addr     TEXT NOT NULL,
  to_addrs      TEXT[] NOT NULL,
  subject       TEXT NOT NULL,
  body_text     TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mail_mailbox ON mail.messages(mailbox_id);
```

Note: real mail traffic is exposed via `mail-web` (Mailpit) for the student
SMTP UI. The `mail` schema in `corp-db` is for the seeded *historical*
mailboxes that the wiki/intranet/portal can search.

Seed: 30–60 messages.

---

## 8. corp-db — schema `customers`

```sql
CREATE SCHEMA customers;

CREATE TABLE customers.customers (
  customer_id   TEXT PRIMARY KEY,           -- "anrc", "smartport-jb", ...
  name          TEXT NOT NULL,
  industry      TEXT,
  region        TEXT,
  primary_contact TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  channel       TEXT,                        -- update channel
  notes         TEXT
);

CREATE TABLE customers.deployments (
  deployment_id TEXT PRIMARY KEY,
  customer_id   TEXT NOT NULL REFERENCES customers.customers(customer_id),
  product       TEXT NOT NULL,               -- "EchoAgent" etc
  version       TEXT NOT NULL,
  installed_at  DATE,
  health        TEXT
);
```

Seed: 5–10 customers including ANRC. Sample:

```
anrc            Al Noor Research Campus      Education / Facilities    UAE   anrc
smartport-jb    Jebel Bay Smart Port         Logistics                 UAE   stable
qadr-energy     Qadr Energy Operations       Energy                    UAE   stable
nova-towers     Nova Towers Real Estate      Real Estate               UAE   stable
mahra-rail      Mahra Rail Authority         Transport                 UAE   stable
shams-water     Shams Water Utility          Utilities                 UAE   stable
delta-cargo     Delta Cargo Hub              Logistics                 UAE   beta
falcon-medical  Falcon Medical Group         Healthcare                UAE   beta
zayd-edu        Zayd Education Foundation    Education                 UAE   stable
```

(Names are fictional. Do not match any real UAE entity.)

---

## 9. release-db — schema `release`

```sql
CREATE SCHEMA release;

CREATE TABLE release.builds (
  build_id      TEXT PRIMARY KEY,           -- "build-2026-0429-001"
  repo          TEXT NOT NULL,
  ref           TEXT NOT NULL,
  build_config  TEXT NOT NULL,
  channel       TEXT NOT NULL,
  status        TEXT NOT NULL,              -- queued|running|signed|published|failed
  triggered_by  TEXT,
  trigger_token_fingerprint TEXT,           -- last 8 chars of token hash, for audit
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ
);

CREATE TABLE release.artifacts (
  artifact_id   TEXT PRIMARY KEY,
  build_id      TEXT NOT NULL REFERENCES release.builds(build_id),
  name          TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL,
  sha256        TEXT NOT NULL,
  marker        TEXT NOT NULL,
  object_key    TEXT NOT NULL,              -- key into MinIO releases bucket
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE release.signatures (
  signature_id  TEXT PRIMARY KEY,
  artifact_id   TEXT NOT NULL REFERENCES release.artifacts(artifact_id),
  alg           TEXT NOT NULL,              -- HMAC-SHA256
  kid           TEXT NOT NULL,              -- "orion-lab-signing-key"
  value         TEXT NOT NULL,              -- hex
  signed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE release.channels (
  channel       TEXT PRIMARY KEY,           -- "stable" "anrc" "legacy-2.5"
  description   TEXT,
  current_version TEXT,
  current_manifest JSONB,
  customer_id   TEXT
);

CREATE TABLE release.audit_events (
  event_id      TEXT PRIMARY KEY,
  ts            TIMESTAMPTZ NOT NULL DEFAULT now(),
  service       TEXT NOT NULL,
  kind          TEXT NOT NULL,              -- build.queued|signed|published|...
  subject       TEXT NOT NULL,
  actor         TEXT,
  data          JSONB
);
```

Seed channels:

```
stable           current version 2.5.9
beta             current version 2.6.0-beta.4
internal-canary  current version 2.6.4-rc1
anrc             current version 2.6.3   (target channel; gets updated to 2.6.4 in Stage 7)
legacy-2.5       current version 2.5.7   (decoy)
```

---

## 10. Naming and identifier policy

To keep all seeds internally consistent:

```
employee user_id pattern   "emp-NNNN"   zero-padded, 4 digits, 0001..9999
employee email pattern     "<f>.<lastname>@orionecho.test"  (lowercased ascii)
service account id pattern "<svc>-svc"  e.g. build-svc, vp-svc
ticket id pattern          "OES-NNNN"   sequential, starts at 1001
build id pattern           "build-YYYY-MMDD-NNN"
artifact id pattern        "art-<6 hex>"
session id pattern         "s_<7 base62>"
customer id pattern        lowercase short slug, ASCII
group id pattern           lowercase, hyphenless preferred ("releng", "build-trigger")
```

Employee name pool:

```
60% Arabic-name first/last (e.g. Fatima Al Qasimi, Hamad Al Mazrouei)
20% South Asian (e.g. Priya Nair, Imran Sheikh)
15% Western (e.g. Daniel Hughes, Marta Lindgren)
 5% East Asian (e.g. Jihoon Park)
```

Names must be drawn from a fixed pool of ~200 candidates; do not match any
real public figure. The list is generated by `scripts/seed/employees.py`
with seed `=session_id` so 20 sessions get *different* employees but each
session is internally consistent.

---

## 11. object-store (MinIO) layout

Buckets:

```
oes-public               public marketing assets, accessible via edge-proxy
oes-docs                 backing store for doc-portal files
oes-releases             EchoAgent release artifacts (per channel)
oes-decoys               attractive but useless objects
anrc-objects             ANRC's customer-side bucket (final objective)
anrc-objects-legacy      decoy ANRC bucket with stale data
session-state            internal lab-controller state (control_net only)
```

Bucket policies (default-deny; only listed callers permitted):

```
oes-public         read: anonymous via edge-proxy        write: lab-controller seeding
oes-docs           read: doc_app role                    write: doc_app, lab-controller
oes-releases       read: build-server, update-server     write: build-server, lab-controller
oes-decoys         read: anonymous (intentional)         write: lab-controller
anrc-objects       read: customer-api with presigned URL write: customer-api, lab-controller
anrc-objects-legacy read: anonymous from customer_net    write: lab-controller (decoy seed)
session-state      read/write: lab-controller, session-agent
```

Key layout in `anrc-objects` (this is the final target):

```
anrc-audit-exports/
  2026/
    Q1/
      facility-monthly-summary.pdf
      uptime-report.json
    Q2/
      facility-risk-summary.pdf       ← stage 10 target #1
      project-orion-echo-final.txt    ← stage 10 target #2 (ENABLE only after stage 9)
      asset-inventory.csv
anrc-telemetry/
  2026/04/29/
    sample-bundle-001.json.gz
    sample-bundle-002.json.gz
```

Key layout in `anrc-objects-legacy` (decoys):

```
2024/old-audit-export-archive.zip                  (corrupt; opens to a banner)
2025/Q4/quarterly-summary.pdf                      (boilerplate; no flag inside)
deprecated/anrc-credentials-export.csv             (HONEYTOKEN — alerts audit-log)
```

The honeytoken file is intentionally accessible. Reading it triggers an
`audit.alert` event but does not block the student. It is a teaching moment
about decoy detection.

Object content rules:

```
- All documents are obviously fictional.
- All names match the customers and employee pool.
- No file > 5 MB unless explicitly required.
- No embedded executables, no macros.
- The two stage-10 target files contain the per-session flag; their content
  is templated by lab-controller at seed time.
```

---

## 12. source-repo (Gitea) repositories

Provisioned per session. All repos owned by the org `orionecho`. All have
Issues disabled (tickets are in `ticket-service`) but Wiki enabled (with one
seed page each).

| Repo                            | Purpose                                                     | Stage relevance |
|---------------------------------|-------------------------------------------------------------|-----------------|
| `orionecho/echo-agent`          | Main EchoAgent source (Python skeleton)                     | 5, 6, 7         |
| `orionecho/echo-update`         | Update channel manifest tooling                             | 6, 7            |
| `orionecho/echo-collector`      | Telemetry collector library                                 | 4, 5            |
| `orionecho/echo-insights`       | Analytics dashboard (frontend)                              | 4 (decoy-ish)   |
| `orionecho/release-pipeline`    | Build/release scripts, includes `release.json`              | 6, 7 (key)      |
| `orionecho/infra-as-code`       | Terraform/compose snippets                                  | 4 (cluepoint)   |
| `orionecho/customer-onboarding` | Templates per customer (incl. anrc.yaml)                    | 4, 8            |
| `orionecho/legacy-echo-agent`   | Archived 2.4.x branch (decoy)                               | decoy           |

Branch policy on `echo-agent`:

```
main                    HEAD = 2.6.3
release/2.6.4           branch ready to be tagged
release/2.5.x           historical
feature/anrc-channel    in-progress; mentions ANRC
```

Seed commits: 50–100 across all repos, distributed:

```
echo-agent             40%
release-pipeline       20%
echo-update            15%
echo-collector         10%
infra-as-code          10%
customer-onboarding     5%
others                 0–5%
```

Commit messages must read like real engineering output. Each repo includes a
README, a CODEOWNERS file (referencing employee user_ids), and a CHANGELOG.

`release-pipeline/release.json` (most important file in this group):

```json
{
  "product": "EchoAgent",
  "channels": ["stable", "beta", "anrc", "internal-canary", "legacy-2.5"],
  "trigger_token_env": "BUILD_TRIGGER_TOKEN",
  "signing_key_id": "orion-lab-signing-key",
  "default_marker": "ORION_ECHO_BUILD_MARKER"
}
```

`release-pipeline/.env.sample` MUST contain placeholder values only:

```
BUILD_TRIGGER_TOKEN=replace-me
RELEASE_STAGING_TOKEN=replace-me
SIGNING_KEY_ID=orion-lab-signing-key
```

The real values live in `corp-db` service_accounts and in environment
variables of the build-server container, not in the repo.

---

## 13. mail-web (Mailpit) seeding

Mailpit stores messages in-memory by default and accepts SMTP submissions on
1025. Seeding strategy:

1. After `mail-service` starts, run `scripts/seed/mail.py` which connects to
   Mailpit's SMTP and submits 30–60 messages.
2. Each message carries a `Date:` header within the past 60 days.
3. Topics: onboarding (10), support escalation (10), release announcement
   (10), customer issue (10), HR routine (5–10), security awareness (5–10).

Mailpit's `corp-db.mail` schema mirrors a *subset* of these for portals to
search. Mailpit itself is the live SMTP/UI surface students browse.

---

## 14. Seed determinism and per-session variation

To prevent answer sharing across the 20 concurrent students, every seed
script accepts a deterministic seed:

```
SESSION_SEED = HMAC_SHA256(GLOBAL_SEED_SALT, session_id)[:16]
```

Variation budget per session:

- Employee names: 60% from a fixed pool, 40% rotated by session
- Ticket IDs: starting offset rotated per session
- Wiki page slugs: 80% fixed, 20% rotated
- Build IDs: rotated per session
- Customers: 100% fixed (so the story stays coherent)
- ANRC final filenames: fixed
- Per-session flag content: 100% derived from session_id (never repeats)

This keeps the storyline shareable between students while making credentials
and IDs non-portable.

---

## 15. Storage volumes per session

| Volume                    | Mount                              | Persists across reset? |
|---------------------------|------------------------------------|------------------------|
| `corp-db-data-{sid}`      | postgres data dir                  | no (regenerated on reset) |
| `release-db-data-{sid}`   | postgres data dir                  | no                     |
| `gitea-data-{sid}`        | gitea data dir                     | no                     |
| `minio-data-{sid}`        | minio data dir                     | no                     |
| `mail-data-{sid}`         | mailpit data                       | no                     |
| `student-workspace-{sid}` | optional student-writable volume   | YES (only this one)    |

Session reset = drop everything except `student-workspace-{sid}`. Session
delete = drop everything including workspace.

Disk budget per session: ~20–40 GB peak, ~10 GB steady.

---

## 16. Open data items deferred to engineering review

1. Whether `wiki.pages` should support full-text search (pg `tsvector`) or
   ILIKE only. `tsvector` is realistic; ILIKE saves seed effort.
2. Whether `mail.messages` should also be ingested back into `mail-web`
   Mailpit on startup, or kept only in DB.
3. Final sizing of `oes-decoys` bucket — current target is 50–100 MB total
   across ~30 objects.

These do not block any phase before Phase 6 (realism pass).

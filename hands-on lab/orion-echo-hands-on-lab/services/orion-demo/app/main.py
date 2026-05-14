import base64
import hashlib
import hmac
import io
import json
import os
import socket
import tarfile
import time
import uuid
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import FastAPI, Header, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse
from jinja2 import TemplateError
from jinja2.sandbox import SandboxedEnvironment


SERVICE = os.getenv("SERVICE_NAME", "unknown-service")
DEMO_ID = os.getenv("DEMO_ID", "orion-demo-001")
BUILD_TRIGGER_TOKEN = os.getenv("BUILD_TRIGGER_TOKEN", "build-trigger-demo-7f3a91")
SIGNING_KEY_VALUE = os.getenv("SIGNING_KEY_VALUE", "orion-lab-signing-secret")
SIGNING_KEY_ID = "orion-lab-signing-key"
BUILD_MARKER = f"ORION_ECHO_BUILD_MARKER={DEMO_ID}"
AUDIT_URL = os.getenv("AUDIT_URL")
INSTRUCTOR_GRADING_KEY = os.getenv("INSTRUCTOR_GRADING_KEY", "").strip()

app = FastAPI(
    title=f"{SERVICE} internal API",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

REQUIRED_SUPPORT_ORIENTATION_PROBES = {"id", "hostname", "ls /opt/support-portal"}

STATE: dict[str, Any] = {
    "events": [],
    "recon_routes": set(),
    "support_probes": set(),
    "beacons": {},
    "jobs": {},
    "artifacts": {},
    "manifest": None,
    "customer_update": None,
}

GRADING_TOKENS = {
    "grading_0_recon_context": "grade-demo-recon-context-001",
    "grading_1_initial_access": "grade-demo-initial-access-001",
    "grading_2_foothold_orientation": "grade-demo-foothold-orientation-001",
    "grading_3_c2_registration": "grade-demo-c2-registration-001",
    "grading_4_internal_discovery": "grade-demo-internal-discovery-001",
    "grading_5_evidence_collection": "grade-demo-evidence-collection-001",
    "grading_6_build_token_use": "grade-demo-build-token-use-001",
    "grading_7_artifact_build": "grade-demo-artifact-build-001",
    "grading_8_supply_chain_publish": "grade-demo-supply-chain-publish-001",
    "grading_9_customer_update": "grade-demo-customer-update-001",
    "grading_10_customer_discovery": "grade-demo-customer-discovery-001",
    "grading_11_final_object_access": "grade-demo-final-object-access-001",
    "grading_12_controlled_drop": "grade-demo-controlled-drop-001",
}

PROOFS = {
    "recon_context": "evidence-recon-public-build-info",
    "initial_access": "proof-support-preview-initial-access",
    "foothold_execution": "proof-support-foothold-oriented",
    "c2_registration": "proof-c2-registration-controlled",
    "internal_discovery": "proof-internal-service-inventory",
    "build_token_accepted": "proof-build-token-accepted",
    "artifact_marker": "proof-artifact-marker-generated",
    "supply_chain_publish": "proof-anrc-channel-published",
    "customer_update_applied": "proof-customer-update-applied",
    "customer_export_discovered": "proof-customer-export-discovered",
    "final_object_access": "proof-anrc-final-object-access",
    "drop_record": "drop-record-anrc-q2-007",
}

SUPPORT_TEMPLATE_ENV = SandboxedEnvironment(autoescape=False)
SUPPORT_TEMPLATE_ENV.filters["json"] = lambda value: json.dumps(value, sort_keys=True)


class SupportPreviewContext:
    def __init__(self, executions: list[dict[str, Any]]):
        self._executions = executions

    def exec(self, command: str) -> str:
        output, allowed = run_guarded_command(str(command))
        self._executions.append({"command": str(command), "allowed": allowed})
        return output

    def lookup_case(self, ticket_id: str = "OES-1366") -> dict[str, Any]:
        return TICKETS.get(str(ticket_id), {"title": "Case not found", "body": "No matching support case."})


def support_preview_context(executions: list[dict[str, Any]], request_id: str) -> dict[str, Any]:
    return {
        "request_id": request_id,
        "service": {
            "name": "Orion Echo Support",
            "hostname": socket.gethostname(),
            "environment": "customer-operations",
            "template_engine": "Jinja2 Preview v2",
        },
        "customer": {
            "name": "Al Noor Research Campus",
            "account_id": "ANRC-2049",
            "channel": "anrc",
            "agent_version": "2.6.4-rc",
            "region": "MEA",
        },
        "case": {
            "id": "OES-1366",
            "severity": "SEV-3",
            "subject": "ANRC channel rotation 2026-Q2",
            "owner": "Release Engineering",
            "status": "draft-response",
        },
        "agent": {
            "product": "EchoAgent",
            "stable_version": "2.6.3",
            "candidate_version": "2.6.4",
            "update_channel": "anrc",
        },
        "support": SupportPreviewContext(executions),
    }

WIKI_PAGES = {
    "release/runbook-build-trigger": {
        "title": "Release Engineering Runbook - Build Trigger",
        "category": "runbook",
        "body": f"""# Release Engineering Runbook - Build Trigger

Owner: emp-0048 Fatima Al Qasimi
Group: releng

Production build trigger for EchoAgent 2.6.x:

```bash
BUILD_TRIGGER_TOKEN={BUILD_TRIGGER_TOKEN}
SOURCE_REPO_PROJECT=orionecho/echo-agent
TARGET_CHANNEL=anrc
```

Do not use the legacy token from the 2024 migration page.
""",
        "clue_kind": "valid",
    },
    "release/runbook-signing": {
        "title": "Release Signing Notes",
        "category": "runbook",
        "body": f"""# Release Signing Notes

Signing key identifier: {SIGNING_KEY_ID}

The signing service refuses manifests that do not include the lab marker:
`{BUILD_MARKER}`.
""",
        "clue_kind": "partial",
    },
    "legacy/build-process-2024": {
        "title": "Old Build Process 2024",
        "category": "legacy",
        "body": "BUILD_TRIGGER_TOKEN=expired-2024-token\nThis process is retired.",
        "clue_kind": "decoy",
    },
    "customer/anrc-channel": {
        "title": "ANRC Channel Notes",
        "category": "customer",
        "body": "ANRC consumes EchoAgent updates from channel `anrc`. Legacy channel `legacy-2.5` is for archive validation only.",
        "clue_kind": "partial",
    },
}

TICKETS = {
    "OES-1287": {
        "title": "Lost build trigger access",
        "category": "release",
        "body": "Release engineering should use the build trigger runbook in wiki. The old token in .env.sample is a placeholder.",
        "clue_kind": "partial",
    },
    "OES-1366": {
        "title": "ANRC channel rotation 2026-Q2",
        "category": "customer",
        "body": "ANRC remains on the dedicated `anrc` channel. Update manifests must include the Orion Echo build marker.",
        "clue_kind": "partial",
    },
    "OES-1140": {
        "title": "Legacy staging token cleanup",
        "category": "release",
        "body": "Found STAGING_API_KEY=stg-old-2025-Q3 in an old mail thread. It is revoked.",
        "clue_kind": "decoy",
    },
}

REPO_FILES = {
    "release-pipeline/release.json": {
        "product": "EchoAgent",
        "channels": ["stable", "beta", "anrc", "internal-canary", "legacy-2.5"],
        "trigger_token_env": "BUILD_TRIGGER_TOKEN",
        "signing_key_id": SIGNING_KEY_ID,
        "default_marker": "ORION_ECHO_BUILD_MARKER",
    },
    "release-pipeline/.env.sample": "BUILD_TRIGGER_TOKEN=replace-me\nRELEASE_STAGING_TOKEN=replace-me\nSIGNING_KEY_ID=orion-lab-signing-key\n",
    "echo-agent/README.md": "# EchoAgent\n\nCustomer-side monitoring agent for Orion Echo deployments.\n",
    "echo-agent/CHANGELOG.md": "## 2.6.4\n- ANRC channel compatibility update\n\n## 2.6.3\n- Stable customer release\n",
    "echo-agent/CODEOWNERS": "* @emp-0048 @emp-0031\n",
}

EMPLOYEES = [
    {"user_id": "emp-0048", "name": "Fatima Al Qasimi", "email": "f.alqasimi@orionecho.test", "dept": "release-engineering", "title": "Release Engineering Lead", "groups": ["releng", "build-trigger"]},
    {"user_id": "emp-0031", "name": "Hamad Al Mazrouei", "email": "h.almazrouei@orionecho.test", "dept": "product-engineering", "title": "EchoAgent Maintainer", "groups": ["engineering"]},
    {"user_id": "emp-0062", "name": "Priya Nair", "email": "p.nair@orionecho.test", "dept": "customer-success", "title": "ANRC Account Owner", "groups": ["customer-success"]},
    {"user_id": "emp-0077", "name": "Daniel Hughes", "email": "d.hughes@orionecho.test", "dept": "security-operations", "title": "Security Operations Analyst", "groups": ["secops"]},
    {"user_id": "svc-build", "name": "build-svc", "email": "build-svc@orionecho.test", "dept": "service-accounts", "title": "Build Server Service Account", "groups": ["service"]},
]

DEPARTMENTS = [
    {"dept_id": "corporate-it", "name": "Corporate IT", "manager_id": "emp-0077"},
    {"dept_id": "product-engineering", "name": "Product Engineering", "manager_id": "emp-0031"},
    {"dept_id": "release-engineering", "name": "Release Engineering", "manager_id": "emp-0048"},
    {"dept_id": "customer-success", "name": "Customer Success", "manager_id": "emp-0062"},
    {"dept_id": "security-operations", "name": "Security Operations", "manager_id": "emp-0077"},
]

CUSTOMERS = [
    {"customer_id": "anrc", "name": "Al Noor Research Campus", "region": "UAE", "channel": "anrc", "version": "2.6.3", "health": "watch"},
    {"customer_id": "smartport-jb", "name": "Jebel Bay Smart Port", "region": "UAE", "channel": "stable", "version": "2.5.9", "health": "nominal"},
    {"customer_id": "qadr-energy", "name": "Qadr Energy Operations", "region": "UAE", "channel": "stable", "version": "2.5.9", "health": "nominal"},
    {"customer_id": "delta-cargo", "name": "Delta Cargo Hub", "region": "UAE", "channel": "beta", "version": "2.6.0-beta.4", "health": "degraded"},
]

DOC_FILES = {
    "restricted/anrc-channel-2026q2.txt": {
        "visibility": "restricted",
        "owner": "emp-0048",
        "body": "ANRC channel token name: CUSTOMER_ANRC_CHANNEL_TOKEN\nOwner: emp-0048\nRotation: quarterly\nNote: token value is held by customer-app only in this demo.",
        "clue_kind": "partial",
    },
    "legacy/build-tokens-2023.txt": {
        "visibility": "internal",
        "owner": "emp-0077",
        "body": "BUILD_TRIGGER_TOKEN=expired-2023-alpha\nBUILD_TRIGGER_TOKEN=expired-2023-beta\nAll entries revoked.",
        "clue_kind": "decoy",
    },
    "architecture/update-trust-overview.md": {
        "visibility": "internal",
        "owner": "emp-0031",
        "body": "# EchoUpdate Trust Overview\nCustomer agents poll their assigned channel, verify HMAC signatures, validate sha256, then report update-applied to customer-api.",
        "clue_kind": "partial",
    },
}

MAIL_MESSAGES = {
    "msg-1001": {
        "from": "f.alqasimi@orionecho.test",
        "to": ["release-engineering@orionecho.test"],
        "subject": "Re: build trigger token - see wiki",
        "body": "Please stop pasting trigger values into tickets. The current value is in the Release Engineering runbook.",
        "clue_kind": "partial",
    },
    "msg-1002": {
        "from": "d.hughes@orionecho.test",
        "to": ["secops@orionecho.test"],
        "subject": "Legacy ANRC credential export honeytoken",
        "body": "The anrc-objects-legacy deprecated credential export remains a honeytoken. Do not use it for recovery.",
        "clue_kind": "decoy",
    },
    "msg-1003": {
        "from": "p.nair@orionecho.test",
        "to": ["customer-success@orionecho.test"],
        "subject": "ANRC update behavior follow-up",
        "body": "ANRC is pinned to channel anrc until the Q2 facility audit export review is complete.",
        "clue_kind": "partial",
    },
}


def expand_seed_data() -> None:
    """Add realistic surrounding enterprise data without changing the core path."""
    first_names = [
        "Aisha", "Omar", "Mariam", "Khalid", "Noor", "Saeed", "Layla", "Yousef",
        "Priya", "Imran", "Anika", "Ravi", "Daniel", "Marta", "Sofia", "Lucas",
        "Jihoon", "Mina", "Hana", "Tariq", "Salma", "Nadia", "Karim", "Leen",
        "Farah", "Nasser", "Arjun", "Meera", "Elena", "Jonas", "Sara", "Zaid",
        "Rania", "Bilal", "Noura", "Samir", "Ibrahim", "Lina", "Amal", "Faisal",
    ]
    last_names = [
        "Al Qasimi", "Al Mazrouei", "Al Nuaimi", "Al Mansoori", "Khan", "Nair",
        "Sheikh", "Patel", "Hughes", "Lindgren", "Park", "Tanaka", "Rahman",
        "Haddad", "Saleh", "Farouk", "Dawson", "Meyer", "Singh", "Iyer",
    ]
    dept_cycle = [d["dept_id"] for d in DEPARTMENTS]
    titles = {
        "corporate-it": ["Systems Administrator", "Endpoint Engineer", "Network Analyst"],
        "product-engineering": ["Backend Engineer", "Frontend Engineer", "EchoAgent Maintainer"],
        "release-engineering": ["Release Coordinator", "Build Engineer", "Signing Operator"],
        "customer-success": ["Account Engineer", "Customer Success Manager", "Implementation Specialist"],
        "security-operations": ["SOC Analyst", "Detection Engineer", "Security Reviewer"],
    }
    existing_ids = {employee["user_id"] for employee in EMPLOYEES}
    for idx in range(1, 46):
        user_id = f"emp-{idx:04d}"
        if user_id in existing_ids:
            continue
        dept = dept_cycle[idx % len(dept_cycle)]
        first = first_names[idx % len(first_names)]
        last = last_names[(idx * 3) % len(last_names)]
        username = f"{first[0]}.{last.split()[-1]}".lower().replace("'", "")
        EMPLOYEES.append(
            {
                "user_id": user_id,
                "name": f"{first} {last}",
                "email": f"{username}{idx}@orionecho.test",
                "dept": dept,
                "title": titles[dept][idx % len(titles[dept])],
                "groups": [dept.split("-")[0]],
            }
        )

    more_customers = [
        ("nova-towers", "Nova Towers Real Estate", "stable", "2.5.9", "nominal"),
        ("mahra-rail", "Mahra Rail Authority", "stable", "2.5.8", "nominal"),
        ("shams-water", "Shams Water Utility", "stable", "2.5.9", "watch"),
        ("falcon-medical", "Falcon Medical Group", "beta", "2.6.0-beta.4", "nominal"),
        ("zayd-edu", "Zayd Education Foundation", "stable", "2.5.9", "nominal"),
        ("harbor-grid", "Harbor Grid Facilities", "internal-canary", "2.6.4-rc1", "degraded"),
    ]
    existing_customers = {customer["customer_id"] for customer in CUSTOMERS}
    for customer_id, name, channel, version, health in more_customers:
        if customer_id not in existing_customers:
            CUSTOMERS.append({"customer_id": customer_id, "name": name, "region": "UAE", "channel": channel, "version": version, "health": health})

    wiki_specs = [
        ("runbook/vpn-access", "VPN Access Runbook", "runbook", "Corporate VPN access requires SSO group corporate-it. Customer networks are not reachable from VPN.", "noise"),
        ("runbook/incident-triage", "Incident Triage Checklist", "runbook", "Collect request_id, service name, build id, and audit-log event id before escalation.", "noise"),
        ("runbook/release-freeze", "Release Freeze Calendar", "runbook", "ANRC has a Q2 exception for EchoAgent 2.6.4 marker compatibility testing.", "partial"),
        ("runbook/customer-rollout", "Customer Rollout Procedure", "runbook", "Use the customer channel listed in vendor-portal. Never publish test manifests to stable.", "partial"),
        ("architecture/service-map", "Service Map", "architecture", "DMZ: support and vendor portal. Corp: SSO, wiki, tickets, docs, mail. Dev: git and build. Release: signing and update.", "partial"),
        ("architecture/echoagent-polling", "EchoAgent Polling Model", "architecture", "Customer app polls updates.release.local and reports update-applied events to customer-api.", "partial"),
        ("architecture/object-storage", "Object Storage Layout", "architecture", "Customer exports are referenced by object_key and accessed through presigned URLs.", "partial"),
        ("policy/secrets-handling", "Secrets Handling Policy", "policy", "Do not paste current tokens into tickets, mail, or .env.sample files. Use approved runbooks.", "partial"),
        ("policy/service-accounts", "Service Account Policy", "policy", "build-svc may call source-repo, signing-service, update-server, and audit-log.", "partial"),
        ("policy/customer-data", "Customer Data Handling", "policy", "ANRC audit exports are restricted to customer-api presigned access.", "partial"),
        ("onboarding/release-engineering", "Release Engineering Onboarding", "onboarding", "New release engineers should read release/runbook-build-trigger and release/runbook-signing.", "partial"),
        ("onboarding/customer-success", "Customer Success Onboarding", "onboarding", "Customer Success may see channel names but not signing or build trigger values.", "noise"),
        ("customer/anrc-q2-audit", "ANRC Q2 Audit Coordination", "customer", "Q2 exports include facility-risk-summary.pdf and project-orion-echo-final.txt.", "partial"),
        ("customer/delta-cargo-beta", "Delta Cargo Beta Notes", "customer", "Delta Cargo is on beta and unrelated to ANRC channel issues.", "noise"),
        ("legacy/signing-key-2024", "Old Signing Key Notes", "legacy", "orion-prod-signing-key-2024 was retired. Do not use it for 2.6.x releases.", "decoy"),
        ("legacy/anrc-channel-2025", "ANRC Channel 2025", "legacy", "ANRC_LEGACY_SECRET=revoked-2025-Q4. This is not accepted by current services.", "decoy"),
        ("legacy/build-worker-migration", "Build Worker Migration", "legacy", "OLD_BUILD_TOKEN=expired-worker-token. Kept for migration history only.", "decoy"),
    ]
    for page_id, title, category, body, clue_kind in wiki_specs:
        WIKI_PAGES.setdefault(page_id, {"title": title, "category": category, "body": body, "clue_kind": clue_kind})
    for idx in range(1, 26):
        page_id = f"noise/weekly-ops-{idx:02d}"
        WIKI_PAGES.setdefault(
            page_id,
            {
                "title": f"Weekly Operations Notes {idx:02d}",
                "category": "onboarding" if idx % 2 else "policy",
                "body": f"Routine operations note {idx}. No release credentials are stored on this page. Refer to service owners for access requests.",
                "clue_kind": "noise",
            },
        )

    base_ticket = 1400
    categories = ["helpdesk", "engineering", "release", "security", "customer"]
    statuses = ["open", "in_progress", "resolved", "closed"]
    for idx in range(1, 101):
        ticket_id = f"OES-{base_ticket + idx}"
        if ticket_id in TICKETS:
            continue
        category = categories[idx % len(categories)]
        clue_kind = "noise"
        body = f"Routine {category} ticket for Orion Echo operations. Request id attached for audit review."
        title = f"{category.title()} follow-up {idx:02d}"
        if idx % 13 == 0:
            clue_kind = "decoy"
            title = f"Legacy token reference cleanup {idx:02d}"
            body = "Found OLD_BUILD_TOKEN=expired-worker-token in an archived note. Validation confirms it is revoked."
        elif idx % 9 == 0:
            clue_kind = "partial"
            title = f"Release channel note {idx:02d}"
            body = "For ANRC channel questions, check the customer rollout procedure and release signing notes."
        elif idx % 17 == 0:
            clue_kind = "partial"
            title = f"Customer escalation ANRC {idx:02d}"
            body = "ANRC reports update timing concerns. Release Engineering owner emp-0048 is tracking the 2.6.4 marker rollout."
        TICKETS[ticket_id] = {"title": title, "category": category, "body": body, "status": statuses[idx % len(statuses)], "clue_kind": clue_kind}

    doc_specs = [
        ("restricted/anrc-channel-rotation-q2.md", "restricted", "emp-0048", "ANRC channel rotation checklist. Validate manifest signature, lab marker, and update-applied audit event.", "partial"),
        ("legacy/intranet-oidc-2023.txt", "internal", "emp-0077", "client_secret=old-intranet-secret-2023. Rejected by current corp-sso.", "decoy"),
        ("release/signing-checklist.md", "internal", "emp-0048", "Canonical manifest must include metadata.lab_marker before signing.", "partial"),
        ("customer/anrc-support-escalation.md", "internal", "emp-0062", "ANRC Q2 export review depends on customer-api /exports records.", "partial"),
        ("security/honeytoken-index.md", "internal", "emp-0077", "Legacy ANRC credential export is intentionally monitored as a honeytoken.", "decoy"),
    ]
    for path, visibility, owner, body, clue_kind in doc_specs:
        DOC_FILES.setdefault(path, {"visibility": visibility, "owner": owner, "body": body, "clue_kind": clue_kind})
    for idx in range(1, 21):
        DOC_FILES.setdefault(
            f"routine/ops-note-{idx:02d}.md",
            {"visibility": "internal", "owner": f"emp-{(idx % 40) + 1:04d}", "body": f"Routine operational memo {idx}. Contains no active credentials.", "clue_kind": "noise"},
        )

    for idx in range(4, 46):
        message_id = f"msg-{1000 + idx}"
        if message_id in MAIL_MESSAGES:
            continue
        sender = EMPLOYEES[idx % len(EMPLOYEES)]["email"]
        clue_kind = "noise"
        subject = f"Weekly operations digest {idx:02d}"
        body = "Routine deployment, support, and facilities notes. No action required."
        if idx % 10 == 0:
            clue_kind = "partial"
            subject = "Re: build trigger token - see wiki"
            body = "Please point engineers to the release runbook instead of forwarding token values in mail."
        elif idx % 14 == 0:
            clue_kind = "decoy"
            subject = "Old staging key found in archive"
            body = "STAGING_API_KEY=stg-old-2025-Q3 was found in an archive and is confirmed revoked."
        elif idx % 17 == 0:
            clue_kind = "partial"
            subject = "ANRC rollout watch"
            body = "ANRC remains on channel anrc. Check monitoring after publish to confirm update-applied."
        MAIL_MESSAGES[message_id] = {"from": sender, "to": ["ops@orionecho.test"], "subject": subject, "body": body, "clue_kind": clue_kind}

    for idx in range(1, 36):
        REPO_FILES.setdefault(f"echo-agent/src/module_{idx:02d}.py", f"# EchoAgent module {idx:02d}\nVERSION = '2.6.3'\n")
    for idx in range(1, 26):
        REPO_FILES.setdefault(f"release-pipeline/jobs/job_{idx:02d}.yml", f"name: release-job-{idx:02d}\nchannel: stable\n")


expand_seed_data()


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def proof(proof_id: str) -> str:
    return PROOFS[proof_id]


def service_headers(request_id: str) -> dict[str, str]:
    return {
        "X-Request-Id": request_id,
        "X-Service": SERVICE,
        "X-Service-Version": "2.6.4-demo",
        "X-Build-Id": "build-demo-20260502-001",
    }


async def emit(kind: str, technique: str | None = None, stage_id: str | None = None, subject: str | None = None, data: dict[str, Any] | None = None) -> None:
    event = {
        "ts": now(),
        "service": SERVICE,
        "kind": kind,
        "actor": "demo-operator",
        "technique": technique,
        "stage_id": stage_id,
        "subject": subject,
        "data": data or {},
    }
    if SERVICE == "audit-log":
        STATE["events"].append(event)
        return
    if not AUDIT_URL:
        return
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            await client.post(f"{AUDIT_URL}/events", json=event)
    except Exception:
        pass


@app.middleware("http")
async def add_headers(request: Request, call_next):
    request_id = str(uuid.uuid4())
    response = await call_next(request)
    for key, value in service_headers(request_id).items():
        response.headers[key] = value
    return response


@app.exception_handler(404)
async def not_found(request: Request, exc):
    request_id = str(uuid.uuid4())
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "not_found", "message": "The requested Orion Echo resource was not found.", "request_id": request_id, "details": {"service": SERVICE}}},
        headers=service_headers(request_id),
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": SERVICE, "uptime_s": int(time.monotonic())}


@app.get("/service/version")
async def version():
    return {"service": SERVICE, "version": "2.6.4-demo", "build_id": "build-demo-20260502-001", "channel": "demo"}


@app.get("/service/build-info")
async def build_info():
    body = {"git_sha": "demoabcdef", "built_at": "2026-05-02T00:00:00Z", "service_account": f"{SERVICE}-svc"}
    if SERVICE == "public-site":
        body["recon_evidence"] = proof("recon_context")
    return body


ORION_PAGE_CSS = """
    :root {
      color-scheme: light;
      --ink: #172033;
      --muted: #5d6b82;
      --line: #d6deea;
      --line-strong: #9fb0c7;
      --panel: #ffffff;
      --soft: #f4f7fb;
      --blue: #2368d8;
      --cyan: #008ea8;
      --green: #16845b;
      --amber: #b26a00;
      --red: #b3261e;
      --navy: #101827;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef3f8;
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      letter-spacing: 0;
    }
    a { color: inherit; }
    .oe-shell { min-height: 100vh; }
    .oe-topbar {
      height: 64px;
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr) auto;
      align-items: center;
      gap: 22px;
      padding: 0 34px;
      background: var(--panel);
      border-bottom: 1px solid var(--line);
    }
    .oe-brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      font-weight: 800;
      color: var(--navy);
    }
    .oe-mark {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      color: #fff;
      background: var(--navy);
      border: 1px solid #24344f;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 900;
    }
    .oe-nav {
      display: flex;
      gap: 20px;
      color: var(--muted);
      font-size: 13px;
      white-space: nowrap;
    }
    .oe-nav a {
      text-decoration: none;
    }
    .oe-nav a:hover {
      color: var(--blue);
    }
    .oe-env {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: var(--muted);
      font-size: 12px;
    }
    .oe-dot {
      width: 8px;
      height: 8px;
      background: var(--green);
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(22, 132, 91, 0.12);
    }
    .oe-main {
      max-width: 1220px;
      margin: 0 auto;
      padding: 34px;
    }
    .oe-hero {
      display: grid;
      grid-template-columns: minmax(0, 0.95fr) minmax(420px, 1.05fr);
      gap: 24px;
      align-items: stretch;
    }
    .oe-panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 6px;
    }
    .oe-intro {
      padding: 34px;
    }
    .oe-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 18px;
      color: var(--cyan);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.8px;
      text-transform: uppercase;
    }
    .oe-eyebrow::before {
      content: "";
      width: 24px;
      height: 2px;
      background: var(--cyan);
    }
    h1 {
      margin: 0;
      color: var(--navy);
      font-size: 40px;
      line-height: 1.08;
      letter-spacing: 0;
    }
    .oe-lede {
      max-width: 640px;
      margin: 18px 0 0;
      color: #44546b;
      font-size: 17px;
      line-height: 1.6;
    }
    .oe-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 28px;
    }
    .oe-button {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 15px;
      border: 1px solid #1f5fc7;
      border-radius: 4px;
      background: var(--blue);
      color: #fff;
      font-weight: 750;
      text-decoration: none;
    }
    .oe-button.secondary {
      background: #fff;
      color: var(--navy);
      border-color: var(--line-strong);
    }
    .oe-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 32px;
    }
    .oe-metric {
      padding: 13px;
      border: 1px solid var(--line);
      border-radius: 4px;
      background: #fbfdff;
    }
    .oe-metric span {
      display: block;
      color: var(--muted);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .oe-metric strong {
      display: block;
      margin-top: 6px;
      color: var(--navy);
      font-size: 18px;
    }
    .oe-console {
      overflow: hidden;
      background: #0f1725;
      color: #d8e4ee;
      border-color: #1f334e;
    }
    .oe-console-head {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 18px;
      border-bottom: 1px solid #263a55;
      background: #121d2d;
    }
    .oe-console-head strong {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .oe-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 26px;
      padding: 0 9px;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 999px;
      color: #b8c7d9;
      font-size: 11px;
      font-weight: 700;
    }
    .oe-console-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 18px;
    }
    .oe-system-card {
      min-height: 116px;
      padding: 14px;
      border: 1px solid #29405f;
      border-radius: 4px;
      background: #162337;
    }
    .oe-system-card.wide {
      grid-column: 1 / -1;
    }
    .oe-system-card span {
      display: block;
      color: #8da5c3;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .oe-system-card strong {
      display: block;
      margin-top: 8px;
      color: #fff;
      font-size: 20px;
    }
    .oe-system-card p {
      margin: 10px 0 0;
      color: #b9c9db;
      line-height: 1.45;
    }
    .oe-status-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 24px;
    }
    .oe-status {
      padding: 16px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--panel);
    }
    .oe-status span {
      display: block;
      color: var(--muted);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .oe-status strong {
      display: block;
      margin-top: 7px;
      font-size: 18px;
      color: var(--navy);
    }
    .oe-status em {
      display: block;
      margin-top: 8px;
      color: var(--muted);
      font-size: 12px;
      font-style: normal;
      line-height: 1.4;
    }
    .oe-section {
      margin-top: 24px;
      padding: 22px;
    }
    .oe-section h2 {
      margin: 0;
      color: var(--navy);
      font-size: 22px;
      letter-spacing: 0;
    }
    .oe-section p {
      color: var(--muted);
      line-height: 1.55;
    }
    .oe-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 18px;
    }
    .oe-card {
      min-height: 150px;
      padding: 16px;
      border: 1px solid var(--line);
      border-radius: 5px;
      background: #fbfdff;
    }
    .oe-card span {
      display: inline-flex;
      min-height: 24px;
      align-items: center;
      padding: 0 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .oe-card strong {
      display: block;
      margin-top: 12px;
      color: var(--navy);
      font-size: 17px;
    }
    .oe-card p {
      margin: 10px 0 0;
      color: #53647c;
      font-size: 13px;
    }
    .oe-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 4px;
    }
    .oe-table th, .oe-table td {
      padding: 12px 13px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }
    .oe-table th {
      background: #f2f6fb;
      color: #465872;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .oe-table td {
      background: #fff;
      color: #273449;
      font-size: 13px;
    }
    .oe-code {
      display: block;
      margin-top: 12px;
      padding: 13px;
      border: 1px solid #263a55;
      border-radius: 4px;
      background: #101827;
      color: #d8e4ee;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
      font-size: 12px;
      line-height: 1.55;
      white-space: pre-wrap;
    }
    .oe-form-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(360px, 0.75fr);
      gap: 18px;
      margin-top: 18px;
    }
    .oe-field label {
      display: block;
      margin-bottom: 8px;
      color: #465872;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .oe-field textarea, .oe-field input {
      width: 100%;
      border: 1px solid var(--line-strong);
      border-radius: 4px;
      background: #fff;
      color: var(--ink);
      font: 13px/1.55 "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    }
    .oe-field textarea {
      min-height: 250px;
      padding: 14px;
      resize: vertical;
    }
    .oe-field input {
      min-height: 40px;
      padding: 0 12px;
    }
    .oe-preview-output {
      min-height: 250px;
      margin: 0;
      padding: 14px;
      border: 1px solid #263a55;
      border-radius: 4px;
      background: #101827;
      color: #d8e4ee;
      font: 12px/1.55 "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
      white-space: pre-wrap;
    }
    .oe-note-list {
      margin: 14px 0 0;
      padding-left: 18px;
      color: var(--muted);
      line-height: 1.55;
    }
    .oe-footer {
      max-width: 1220px;
      margin: 0 auto;
      padding: 0 34px 32px;
      color: var(--muted);
      font-size: 12px;
    }
    @media (max-width: 980px) {
      .oe-topbar { grid-template-columns: 1fr; height: auto; align-items: start; padding: 18px; }
      .oe-hero, .oe-console-body, .oe-status-row, .oe-grid, .oe-form-grid { grid-template-columns: 1fr; }
      .oe-main { padding: 18px; }
      h1 { font-size: 32px; }
    }
"""


def enterprise_page(title: str, active: str, body: str) -> str:
    nav_items = [
        ("Overview", "/"),
        ("Documentation", "/docs/"),
        ("Release Notes", "/docs/releases/public"),
        ("Support", "/support/"),
        ("Partner Portal", "/portal/"),
    ]
    nav = "".join(
        f"<a href='{href}' {'aria-current=\"page\"' if label == active else ''}>{label}</a>"
        for label, href in nav_items
    )
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>{ORION_PAGE_CSS}</style>
</head>
<body>
  <div class="oe-shell">
    <header class="oe-topbar">
      <div class="oe-brand"><span class="oe-mark">OE</span><span>Orion Echo Systems</span></div>
      <nav class="oe-nav" aria-label="Primary">{nav}</nav>
      <div class="oe-env"><span class="oe-dot"></span><span>Customer operations online</span></div>
    </header>
    {body}
    <footer class="oe-footer">Orion Echo Systems LLC. Public customer operations portal. Request IDs and service headers are retained for incident review.</footer>
  </div>
</body>
</html>"""


def public_site_html() -> str:
    body = """
    <main class="oe-main">
      <section class="oe-hero">
        <div class="oe-panel oe-intro">
          <div class="oe-eyebrow">Industrial Operations Platform</div>
          <h1>Operational telemetry, release control, and facility insight for critical sites.</h1>
          <p class="oe-lede">Orion Echo provides EchoAgent monitoring, signed update delivery, and customer facility reporting for research campuses, port operations, utilities, and medical groups.</p>
          <div class="oe-actions">
            <a class="oe-button" href="/docs/">View Product Documentation</a>
            <a class="oe-button secondary" href="/support/">Open Support Portal</a>
            <a class="oe-button secondary" href="/portal/">Partner Channel Summary</a>
          </div>
          <div class="oe-metrics">
            <div class="oe-metric"><span>Current Agent</span><strong>EchoAgent 2.6.3</strong></div>
            <div class="oe-metric"><span>Candidate</span><strong>2.6.4 RC</strong></div>
            <div class="oe-metric"><span>Dedicated Channel</span><strong>ANRC</strong></div>
          </div>
        </div>
        <aside class="oe-panel oe-console" aria-label="Operations snapshot">
          <div class="oe-console-head">
            <strong>EchoOps Control Snapshot</strong>
            <span class="oe-pill">Region UAE-North</span>
          </div>
          <div class="oe-console-body">
            <div class="oe-system-card">
              <span>Release Train</span>
              <strong>2.6.x</strong>
              <p>Signed manifests are staged through the release service before customer agents poll assigned channels.</p>
            </div>
            <div class="oe-system-card">
              <span>Customer Focus</span>
              <strong>Al Noor Research Campus</strong>
              <p>ANRC remains on a dedicated channel during the Q2 facility audit window.</p>
            </div>
            <div class="oe-system-card wide">
              <span>Update Trust Path</span>
              <strong>Build -> Signing -> Channel -> Customer Agent</strong>
              <p>Agent updates require artifact hash validation, HMAC signature verification, and update-applied telemetry.</p>
            </div>
          </div>
        </aside>
      </section>
      <section class="oe-status-row" aria-label="Service status">
        <div class="oe-status"><span>Public Docs</span><strong>Available</strong><em>Release notes and product metadata exposed for customer review.</em></div>
        <div class="oe-status"><span>Support Desk</span><strong>Normal</strong><em>Template preview service enabled for ticket draft validation.</em></div>
        <div class="oe-status"><span>Partner Portal</span><strong>Restricted</strong><em>Customer channel metadata is visible to partner operations.</em></div>
        <div class="oe-status"><span>ANRC Channel</span><strong>Watch</strong><em>2.6.4 compatibility marker support is in release validation.</em></div>
      </section>
      <section class="oe-panel oe-section">
        <h2>Product Surface</h2>
        <p>Public material intentionally contains enough operational detail for customers to plan upgrades: product names, channel labels, supported versions, and customer-specific release notes.</p>
        <div class="oe-grid">
          <div class="oe-card"><span>Endpoint Agent</span><strong>EchoAgent</strong><p>Facility telemetry collector deployed inside customer operations networks.</p></div>
          <div class="oe-card"><span>Release Delivery</span><strong>EchoUpdate</strong><p>Signed update manifests and channel assignment for customer agents.</p></div>
          <div class="oe-card"><span>Reporting</span><strong>EchoInsights</strong><p>Operational dashboards and facility audit export workflows.</p></div>
        </div>
      </section>
    </main>
    """
    return enterprise_page("Orion Echo Systems", "Overview", body)


def public_docs_html() -> str:
    body = """
    <main class="oe-main">
      <section class="oe-panel oe-section">
        <div class="oe-eyebrow">Documentation Center</div>
        <h1>EchoAgent deployment and release documentation</h1>
        <p class="oe-lede">Customer-facing documentation for agent rollout, channel behavior, release compatibility, and update verification. Internal credentials are never published here.</p>
        <table class="oe-table">
          <thead><tr><th>Area</th><th>Current Detail</th><th>Operational Note</th></tr></thead>
          <tbody>
            <tr><td>Stable agent</td><td>EchoAgent 2.6.3</td><td>Default customer deployment.</td></tr>
            <tr><td>Candidate agent</td><td>EchoAgent 2.6.4</td><td>ANRC compatibility marker support.</td></tr>
            <tr><td>Channels</td><td>stable, beta, internal-canary, anrc, legacy-2.5</td><td>Customers poll their assigned channel only.</td></tr>
            <tr><td>Trust model</td><td>sha256 + HMAC signature + update-applied telemetry</td><td>Release services validate manifest and artifact integrity.</td></tr>
          </tbody>
        </table>
        <div class="oe-actions">
          <a class="oe-button" href="/docs/releases/public">Open Public Release Notes</a>
          <a class="oe-button secondary" href="/service/build-info">Service Build Metadata</a>
        </div>
      </section>
    </main>
    """
    return enterprise_page("EchoAgent Documentation", "Documentation", body)


def support_portal_html() -> str:
    body = """
    <main class="oe-main">
      <section class="oe-hero">
        <div class="oe-panel oe-intro">
          <div class="oe-eyebrow">Customer Support Operations</div>
          <h1>Support case intake and response draft preview</h1>
          <p class="oe-lede">Support engineers use this portal to prepare customer-facing ticket responses. The preview service merges case metadata, customer account fields, and release context before a response is filed in the internal ticket system.</p>
          <div class="oe-metrics">
            <div class="oe-metric"><span>Queue</span><strong>Enterprise</strong></div>
            <div class="oe-metric"><span>Template Engine</span><strong>Jinja2 Preview v2</strong></div>
            <div class="oe-metric"><span>Audit</span><strong>Request ID</strong></div>
          </div>
        </div>
        <aside class="oe-panel oe-section">
          <h2>Draft Preview API</h2>
          <p>Automation clients post response templates to the preview endpoint and receive rendered text for review. Production filing happens in the internal ticket service.</p>
          <code class="oe-code">POST /support/preview
Content-Type: application/json

{"request_id":"req-demo-001","body":"Hello {{ customer.name }}, case {{ case.id }} is assigned."}</code>
          <p>Template variables are maintained by Release Engineering and every render is retained for incident review.</p>
        </aside>
      </section>
      <section class="oe-panel oe-section">
        <h2>Response Draft Workbench</h2>
        <p>Enterprise support teams use variable-driven templates to avoid copying customer identifiers, release channels, and case metadata by hand. This demo intentionally leaves the preview renderer reachable from the DMZ support portal.</p>
        <div class="oe-form-grid">
          <div class="oe-field">
            <label for="draftBody">Draft body</label>
            <textarea id="draftBody">Hello {{ customer.name }},

We are reviewing {{ case.id }} for the {{ customer.channel }} release channel.
Current candidate agent: {{ agent.candidate_version }}
Request: {{ request_id }}</textarea>
            <div class="oe-actions">
              <button class="oe-button" type="button" id="renderPreview">Render Preview</button>
              <button class="oe-button secondary" type="button" id="loadCaseUpdate">Load Case Update Template</button>
            </div>
          </div>
          <div>
            <div class="oe-field">
              <label for="requestId">Request ID</label>
              <input id="requestId" value="req-support-2026-0502">
            </div>
            <p class="oe-code">Available objects:
customer.name, customer.channel
case.id, case.severity, case.owner
agent.product, agent.candidate_version
service.hostname, request_id</p>
            <pre class="oe-preview-output" id="previewOutput">Preview output will appear here.</pre>
          </div>
        </div>
        <ul class="oe-note-list">
          <li>Normal support templates should only reference customer, case, agent, and service metadata.</li>
          <li>Release Engineering left diagnostic helpers in the same render context for troubleshooting.</li>
          <li>Every preview request emits an audit event with the request ID and render mode.</li>
        </ul>
      </section>
      <section class="oe-panel oe-section">
        <h2>Open Case Context</h2>
        <table class="oe-table">
          <thead><tr><th>Case</th><th>Customer</th><th>Signal</th><th>Owner</th></tr></thead>
          <tbody>
            <tr><td>OES-1366</td><td>Al Noor Research Campus</td><td>ANRC channel rotation 2026-Q2</td><td>Release Engineering</td></tr>
            <tr><td>OES-1287</td><td>Internal Release</td><td>Build trigger access follow-up</td><td>RelEng Lead</td></tr>
            <tr><td>OES-1417</td><td>Harbor Grid Facilities</td><td>Canary deployment watch</td><td>Customer Success</td></tr>
          </tbody>
        </table>
      </section>
      <script>
        const bodyInput = document.getElementById('draftBody');
        const requestInput = document.getElementById('requestId');
        const previewOutput = document.getElementById('previewOutput');
        document.getElementById('renderPreview').addEventListener('click', async () => {
          previewOutput.textContent = 'Rendering...';
          const response = await fetch('preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestInput.value, body: bodyInput.value })
          });
          const data = await response.json();
          previewOutput.textContent = data.preview || JSON.stringify(data, null, 2);
        });
        document.getElementById('loadCaseUpdate').addEventListener('click', () => {
          bodyInput.value = "Hello {{ customer.name }},\\n\\nWe are tracking {{ case.id }} as {{ case.severity }} for the {{ customer.channel }} release channel. The current candidate package is {{ agent.product }} {{ agent.candidate_version }}.\\n\\nRequest reference: {{ request_id }}";
        });
      </script>
    </main>
    """
    return enterprise_page("Orion Echo Support Portal", "Support", body)


def vendor_portal_html() -> str:
    rows = "".join(
        f"<tr><td>{c['name']}</td><td>{c['channel']}</td><td>{c['version']}</td><td>{c['health']}</td></tr>"
        for c in CUSTOMERS[:12]
    )
    body = f"""
    <main class="oe-main">
      <section class="oe-panel oe-section">
        <div class="oe-eyebrow">Partner Operations</div>
        <h1>Customer deployment and release-channel summary</h1>
        <p class="oe-lede">Partner teams use this read-only view to confirm customer channel assignment, active agent version, and rollout health before coordinating maintenance windows.</p>
        <table class="oe-table">
          <thead><tr><th>Customer</th><th>Channel</th><th>Agent Version</th><th>Health</th></tr></thead>
          <tbody>{rows}</tbody>
        </table>
        <div class="oe-actions">
          <a class="oe-button" href="/portal/releases/private">Private Release Route</a>
          <a class="oe-button secondary" href="/docs/releases/public">Public Release Notes</a>
        </div>
      </section>
    </main>
    """
    return enterprise_page("Orion Echo Partner Portal", "Partner Portal", body)


@app.get("/.well-known/openid-configuration")
async def oidc_config():
    if SERVICE != "corp-sso":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return {
        "issuer": "https://sso.corp.local",
        "authorization_endpoint": "https://sso.corp.local/oauth/authorize",
        "token_endpoint": "https://sso.corp.local/oauth/token",
        "userinfo_endpoint": "https://sso.corp.local/oauth/userinfo",
        "jwks_uri": "https://sso.corp.local/oauth/jwks",
        "response_types_supported": ["code"],
        "id_token_signing_alg_values_supported": ["HS256"],
    }


@app.get("/oauth/userinfo")
async def oidc_userinfo():
    if SERVICE != "corp-sso":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("auth.userinfo.viewed", "T1078", "grading_4_internal_discovery", "/oauth/userinfo")
    return EMPLOYEES[0]


@app.get("/oauth/jwks")
async def oidc_jwks():
    if SERVICE != "corp-sso":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return {"keys": []}


@app.get("/", response_class=HTMLResponse)
async def index():
    if SERVICE == "public-site":
        await emit("recon.route.viewed", "T1591", "grading_0_recon_context", "/")
        return public_site_html()
    if SERVICE == "public-docs":
        await emit("recon.route.viewed", "T1592.002", "grading_0_recon_context", "/docs")
        return public_docs_html()
    if SERVICE == "support-portal":
        await emit("recon.route.viewed", "T1591", "grading_0_recon_context", "/support")
        return support_portal_html()
    if SERVICE == "vendor-portal":
        await emit("portal.home.viewed", "T1591", "grading_0_recon_context", "/portal")
        return vendor_portal_html()
    if SERVICE == "corp-sso":
        return """
        <html><body><h1>Orion Echo SSO</h1>
        <p>OIDC-lite identity simulator for internal tools.</p>
        <p>Demo user: emp-0048 / release-engineering / releng.</p>
        </body></html>
        """
    if SERVICE == "intranet":
        await emit("intranet.home.viewed", "T1213", "grading_4_internal_discovery", "/")
        rows = "".join(f"<tr><td>{d['dept_id']}</td><td>{d['name']}</td><td>{d['manager_id']}</td></tr>" for d in DEPARTMENTS)
        return f"""
        <html><body><h1>Orion Echo Intranet</h1>
        <p>Internal service directory: SSO, HR, wiki, tickets, docs, mail, git, build, update.</p>
        <table border="1"><tr><th>ID</th><th>Department</th><th>Manager</th></tr>{rows}</table>
        </body></html>
        """
    if SERVICE == "hr-directory":
        rows = "".join(f"<tr><td>{e['user_id']}</td><td>{e['name']}</td><td>{e['dept']}</td><td>{e['title']}</td></tr>" for e in EMPLOYEES)
        return f"<html><body><h1>HR Directory</h1><table border='1'><tr><th>ID</th><th>Name</th><th>Dept</th><th>Title</th></tr>{rows}</table></body></html>"
    if SERVICE == "doc-portal":
        rows = "".join(f"<li><a href='/files/{path}'>{path}</a> ({meta['visibility']})</li>" for path, meta in DOC_FILES.items())
        return f"<html><body><h1>Internal Document Portal</h1><ul>{rows}</ul></body></html>"
    if SERVICE == "mail-web":
        rows = "".join(f"<li><a href='/messages/{mid}'>{msg['subject']}</a> - {msg['from']}</li>" for mid, msg in MAIL_MESSAGES.items())
        return f"<html><body><h1>Orion Echo Webmail</h1><ul>{rows}</ul></body></html>"
    if SERVICE == "monitoring":
        return """
        <html><body><h1>ANRC Monitoring</h1>
        <p>EchoAgent status: polling channel anrc every 60 seconds.</p>
        <p>Customer API: api.anrc.customer.local</p>
        <p>Object store bucket: anrc-objects</p>
        </body></html>
        """
    if SERVICE == "dark-web-drop":
        return """
        <html><body><h1>Dark Web Drop Simulator</h1>
        <p>Authorized ROOT14 lab endpoint. No real external network or illicit marketplace is used.</p>
        <p>POST /drop/submit with the recovered ANRC export file. A local supervisor bot validates the drop directory and creates the controlled leak-bundle record only when the correct file is present.</p>
        </body></html>
        """
    return {"service": SERVICE, "message": "Orion Echo demo service"}


@app.get("/releases/public")
async def releases_public():
    await emit("recon.route.viewed", "T1592.002", "grading_0_recon_context", "/releases/public")
    return [
        {"version": "2.6.4", "channel": "internal-canary", "summary": "ANRC compatibility marker support"},
        {"version": "2.6.3", "channel": "anrc", "summary": "Current ANRC deployment"},
    ]


@app.get("/releases/private")
async def releases_private():
    if SERVICE != "vendor-portal":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("portal.private_releases.viewed", "T1213", "grading_4_internal_discovery", "/releases/private")
    return [
        {"version": "2.6.4", "channel": "anrc", "owner": "emp-0048", "notes": "Requires signed marker manifest before customer rollout."},
        {"version": "2.5.7", "channel": "legacy-2.5", "owner": "emp-0031", "notes": "Legacy decoy channel. Do not use for ANRC."},
    ]


@app.post("/preview")
async def support_preview(payload: dict[str, Any]):
    if SERVICE != "support-portal":
        return JSONResponse(status_code=404, content={"error": "not found"})
    body = str(payload.get("body", ""))[:6000]
    request_id = str(payload.get("request_id") or f"req-{uuid.uuid4().hex[:10]}")
    if "{{orion_exec:" in body:
        await emit("support.template.legacy_token_rejected", "T1190", "grading_1_initial_access", "POST /preview", {"request_id": request_id})
        return JSONResponse(
            status_code=400,
            content={
                "error": "legacy token unsupported",
                "detail": "This support portal renders Jinja2 templates. Use normal template expressions and the audited support helper when authorized.",
                "request_id": request_id,
            },
        )
    executions: list[dict[str, Any]] = []
    try:
        template = SUPPORT_TEMPLATE_ENV.from_string(body)
        rendered = template.render(**support_preview_context(executions, request_id))
    except TemplateError as exc:
        await emit("support.template.preview_error", "T1190", "grading_1_initial_access", "POST /preview", {"request_id": request_id, "error": str(exc)[:180]})
        return JSONResponse(status_code=400, content={"error": "template render failed", "detail": str(exc), "request_id": request_id})

    await emit(
        "support.template.preview_rendered",
        "T1190",
        "grading_1_initial_access",
        "POST /preview",
        {"request_id": request_id, "execution_count": len(executions)},
    )
    for execution in executions:
        await emit("support.exploit.preview_triggered", "T1190", "grading_1_initial_access", "POST /preview", execution)
        await emit(
            "support.post_exploit.command_allowed" if execution["allowed"] else "support.post_exploit.command_denied",
            "T1059.004",
            "grading_2_foothold_orientation",
            execution["command"],
            {"allowed": execution["allowed"], "request_id": request_id},
        )

    response: dict[str, Any] = {
        "preview": rendered,
        "engine": "jinja2-preview-v2",
        "request_id": request_id,
        "render_context": ["customer", "case", "agent", "service", "request_id"],
    }
    if executions:
        response["lab_guard"] = "allowed" if all(item["allowed"] for item in executions) else "denied"
        response["executions"] = executions
    return response


def run_guarded_command(command: str) -> tuple[str, bool]:
    marker = (
        f"You executed: support@{socket.gethostname()}\n"
        f"Your demo: {DEMO_ID}\n"
        f"Completion proof: {proof('initial_access')}\n"
        "Hint: register a beacon at http://c2-emulator:8000/beacon/register\n"
    )
    allowed_outputs = {
        "id": "uid=1000(orion) gid=1000(orion) groups=1000(orion)",
        "hostname": socket.gethostname(),
        "cat /etc/hostname": socket.gethostname(),
        "ls /opt/support-portal": "app.py\nconfig.yml\nlogs\nsupport_templates",
        "cat /var/lib/support-portal/.post_exploit_marker": marker,
    }
    if command == "cat /tmp/orion_stage2.txt":
        missing = sorted(REQUIRED_SUPPORT_ORIENTATION_PROBES - STATE["support_probes"])
        if missing:
            return "Orientation incomplete. Run read-only identity, hostname, and support directory probes before requesting the stage 2 handoff.", False
        return f"Completion proof: {proof('foothold_execution')}\nTechnique: T1082/T1083\n", True
    if command in allowed_outputs:
        if command in REQUIRED_SUPPORT_ORIENTATION_PROBES:
            STATE["support_probes"].add(command)
        if command == "cat /etc/hostname":
            STATE["support_probes"].add("hostname")
        return allowed_outputs[command], True
    return "Permission denied (lab guard). This demo only permits read-only orientation probes.", False


@app.get("/pages")
async def wiki_pages(category: str | None = None, q: str | None = None, clue_kind: str | None = None):
    if SERVICE != "wiki":
        return JSONResponse(status_code=404, content={"error": "not found"})
    items = []
    for page_id, page in WIKI_PAGES.items():
        if category and page["category"] != category:
            continue
        if clue_kind and page["clue_kind"] != clue_kind:
            continue
        haystack = f"{page_id} {page['title']} {page['body']}".lower()
        if q and q.lower() not in haystack:
            continue
        items.append({"page_id": page_id, "title": page["title"], "category": page["category"], "clue_kind": page["clue_kind"]})
    return {"count": len(items), "items": items}


@app.get("/pages/{page_id:path}")
async def wiki_page(page_id: str):
    if SERVICE != "wiki":
        return JSONResponse(status_code=404, content={"error": "not found"})
    page = WIKI_PAGES.get(page_id)
    if not page:
        return JSONResponse(status_code=404, content={"error": "page not found"})
    technique = "T1552" if page["clue_kind"] in {"valid", "decoy"} else "T1213"
    grading_id = "grading_5_evidence_collection" if page_id == "release/runbook-build-trigger" else "grading_4_internal_discovery"
    await emit("wiki.page.viewed", technique, grading_id, page_id, {"clue_kind": page["clue_kind"]})
    result = dict(page)
    if page_id == "release/runbook-build-trigger":
        result["evidence_proof"] = proof("internal_discovery")
    return result


@app.get("/tickets")
async def list_tickets(category: str | None = None, status: str | None = None, q: str | None = None):
    if SERVICE != "ticket-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    items = []
    for ticket_id, ticket in TICKETS.items():
        if category and ticket["category"] != category:
            continue
        if status and ticket.get("status") != status:
            continue
        haystack = f"{ticket_id} {ticket['title']} {ticket['body']}".lower()
        if q and q.lower() not in haystack:
            continue
        items.append({"ticket_id": ticket_id, "title": ticket["title"], "category": ticket["category"], "status": ticket.get("status", "open"), "clue_kind": ticket["clue_kind"]})
    return {"count": len(items), "items": items}


@app.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    if SERVICE != "ticket-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    ticket = TICKETS.get(ticket_id)
    if not ticket:
        return JSONResponse(status_code=404, content={"error": "ticket not found"})
    grading_id = "grading_5_evidence_collection" if ticket_id == "OES-1287" else "grading_4_internal_discovery"
    await emit("ticket.viewed", "T1213", grading_id, ticket_id, {"clue_kind": ticket["clue_kind"]})
    return ticket


@app.get("/employees")
async def list_employees(dept: str | None = None, q: str | None = None):
    if SERVICE != "hr-directory":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("hr.employees.viewed", "T1213", "grading_4_internal_discovery", "/employees")
    items = []
    for employee in EMPLOYEES:
        if dept and employee["dept"] != dept:
            continue
        haystack = f"{employee['user_id']} {employee['name']} {employee['email']} {employee['dept']} {employee['title']}".lower()
        if q and q.lower() not in haystack:
            continue
        items.append(employee)
    return {"count": len(items), "items": items}


@app.get("/departments")
async def list_departments():
    if SERVICE not in {"hr-directory", "intranet"}:
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("hr.departments.viewed", "T1213", "grading_4_internal_discovery", "/departments")
    return {"items": DEPARTMENTS}


@app.get("/customers")
async def list_customers(channel: str | None = None, q: str | None = None):
    if SERVICE not in {"vendor-portal", "intranet"}:
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customers.viewed", "T1213", "grading_4_internal_discovery", "/customers")
    items = []
    for customer in CUSTOMERS:
        if channel and customer["channel"] != channel:
            continue
        haystack = f"{customer['customer_id']} {customer['name']} {customer['channel']} {customer['health']}".lower()
        if q and q.lower() not in haystack:
            continue
        items.append(customer)
    return {"count": len(items), "items": items}


@app.get("/messages")
async def list_messages(q: str | None = None, clue_kind: str | None = None):
    if SERVICE != "mail-web":
        return JSONResponse(status_code=404, content={"error": "not found"})
    items = []
    for mid, message in MAIL_MESSAGES.items():
        if clue_kind and message["clue_kind"] != clue_kind:
            continue
        haystack = f"{mid} {message['from']} {message['subject']} {message['body']}".lower()
        if q and q.lower() not in haystack:
            continue
        items.append({"message_id": mid, "from": message["from"], "subject": message["subject"], "clue_kind": message["clue_kind"]})
    return {"count": len(items), "items": items}


@app.get("/messages/{message_id}")
async def get_message(message_id: str):
    if SERVICE != "mail-web":
        return JSONResponse(status_code=404, content={"error": "not found"})
    message = MAIL_MESSAGES.get(message_id)
    if not message:
        return JSONResponse(status_code=404, content={"error": "message not found"})
    await emit("mail.message.viewed", "T1213", "grading_4_internal_discovery", message_id, {"clue_kind": message["clue_kind"]})
    return message


@app.get("/files/{path:path}")
async def repo_file(path: str):
    if SERVICE == "source-repo":
        item = REPO_FILES.get(path)
        if item is None:
            return JSONResponse(status_code=404, content={"error": "file not found"})
        grading_id = "grading_5_evidence_collection" if path == "release-pipeline/release.json" else "grading_4_internal_discovery"
        await emit("repo.file.viewed", "T1213.003", grading_id, path)
        return item if isinstance(item, dict) else PlainTextResponse(item)
    if SERVICE == "doc-portal":
        item = DOC_FILES.get(path)
        if item is None:
            return JSONResponse(status_code=404, content={"error": "file not found"})
        technique = "T1552" if item["clue_kind"] == "decoy" else "T1213"
        await emit("doc.file.viewed", technique, "grading_4_internal_discovery", path, {"clue_kind": item["clue_kind"]})
        return item
    return JSONResponse(status_code=404, content={"error": "not found"})


@app.get("/files")
async def list_files(q: str | None = None, clue_kind: str | None = None):
    if SERVICE == "doc-portal":
        rows = []
        for path, item in DOC_FILES.items():
            if clue_kind and item["clue_kind"] != clue_kind:
                continue
            haystack = f"{path} {item['body']} {item['owner']}".lower()
            if q and q.lower() not in haystack:
                continue
            rows.append({"path": path, "visibility": item["visibility"], "owner": item["owner"], "clue_kind": item["clue_kind"]})
        return {"count": len(rows), "items": rows}
    if SERVICE == "source-repo":
        rows = []
        for path, item in REPO_FILES.items():
            haystack = f"{path} {item}".lower()
            if q and q.lower() not in haystack:
                continue
            rows.append({"path": path, "kind": "json" if isinstance(item, dict) else "text"})
        return {"count": len(rows), "items": rows}
    return JSONResponse(status_code=404, content={"error": "not found"})


@app.post("/api/jobs")
async def create_job(payload: dict[str, Any], authorization: str | None = Header(default=None)):
    if SERVICE != "build-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    token = payload.get("trigger_token") or (authorization or "").replace("Bearer ", "")
    if token != BUILD_TRIGGER_TOKEN:
        await emit("api.token.rejected", "T1550.001", "grading_6_build_token_use", "POST /api/jobs")
        return JSONResponse(status_code=403, content={"error": {"code": "forbidden", "message": "Invalid build trigger token"}})
    await emit("api.token.accepted", "T1550.001", "grading_6_build_token_use", "POST /api/jobs")
    job_id = "build-2026-0502-001"
    artifact_id = "art-demo-001"
    STATE["jobs"][job_id] = {"job_id": job_id, "status": "published", "artifact_id": artifact_id}
    STATE["artifacts"][artifact_id] = build_artifact_blob(job_id)
    await emit("build.artifact.created", "T1608", "grading_7_artifact_build", artifact_id)
    return JSONResponse(
        status_code=202,
        content={
            "job_id": job_id,
            "status": "published",
            "artifact_id": artifact_id,
            "build_request_proof": proof("build_token_accepted"),
            "logs_url": f"/api/jobs/{job_id}/logs",
        },
    )


@app.get("/api/jobs/{job_id}")
async def job_status(job_id: str):
    if SERVICE != "build-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return STATE["jobs"].get(job_id) or JSONResponse(status_code=404, content={"error": "job not found"})


@app.get("/api/artifacts/{artifact_id}")
async def artifact_meta(artifact_id: str):
    if SERVICE != "build-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    if artifact_id not in STATE["artifacts"]:
        STATE["artifacts"][artifact_id] = build_artifact_blob("build-2026-0502-001")
    blob = STATE["artifacts"][artifact_id]
    return {
        "artifact_id": artifact_id,
        "name": "echo-agent-2.6.4.tar.gz",
        "size_bytes": len(blob),
        "sha256": hashlib.sha256(blob).hexdigest(),
        "url": f"http://build-server:8000/api/artifacts/{artifact_id}/blob",
        "marker": BUILD_MARKER,
    }


@app.get("/api/artifacts/{artifact_id}/blob")
async def artifact_blob(artifact_id: str):
    if SERVICE != "build-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    if artifact_id not in STATE["artifacts"]:
        STATE["artifacts"][artifact_id] = build_artifact_blob("build-2026-0502-001")
    return Response(content=STATE["artifacts"][artifact_id], media_type="application/gzip")


def build_artifact_blob(job_id: str) -> bytes:
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        content = f"build_id: {job_id}\nsession: {DEMO_ID}\nmarker: {BUILD_MARKER}\nevidence: {proof('artifact_marker')}\n".encode()
        info = tarfile.TarInfo("LAB_BUILD_MARKER")
        info.size = len(content)
        tar.addfile(info, io.BytesIO(content))
        agent = b"#!/bin/sh\necho 'EchoAgent demo marker package only'\n"
        agent_info = tarfile.TarInfo("echo-agent.sh")
        agent_info.size = len(agent)
        tar.addfile(agent_info, io.BytesIO(agent))
    return buffer.getvalue()


@app.post("/api/sign")
async def sign_manifest(payload: dict[str, Any]):
    if SERVICE != "signing-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    canonical = payload.get("canonical_manifest") or payload
    if BUILD_MARKER not in json.dumps(canonical, sort_keys=True):
        return JSONResponse(status_code=400, content={"error": {"code": "bad_request", "message": "metadata.lab_marker is required"}})
    encoded = json.dumps(canonical, sort_keys=True, separators=(",", ":")).encode()
    signature = hmac.new(SIGNING_KEY_VALUE.encode(), encoded, hashlib.sha256).hexdigest()
    await emit("release.manifest.signed", "T1195.002", "grading_8_supply_chain_publish", canonical.get("build_id"))
    return {"signature": {"alg": "HMAC-SHA256", "kid": SIGNING_KEY_ID, "value": signature}, "signed_at": now()}


@app.post("/api/verify")
async def verify_manifest(payload: dict[str, Any]):
    if SERVICE != "signing-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    canonical = payload.get("canonical_manifest") or {}
    expected = hmac.new(SIGNING_KEY_VALUE.encode(), json.dumps(canonical, sort_keys=True, separators=(",", ":")).encode(), hashlib.sha256).hexdigest()
    return {"valid": hmac.compare_digest(expected, payload.get("signature", "")), "kid": SIGNING_KEY_ID}


@app.post("/internal/publish")
async def publish_manifest(payload: dict[str, Any]):
    if SERVICE != "update-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    channel = payload.get("channel")
    manifest = payload.get("manifest", {})
    if channel != "anrc" or manifest.get("metadata", {}).get("lab_marker") != BUILD_MARKER:
        return JSONResponse(status_code=400, content={"error": {"code": "bad_request", "message": "Only ANRC manifests with the lab marker complete this demo."}})
    STATE["manifest"] = manifest
    await emit("release.manifest.published", "T1195.002", "grading_8_supply_chain_publish", "channel/anrc")
    return {"published": True, "channel": "anrc", "version": manifest.get("version", "2.6.4"), "publish_proof": proof("supply_chain_publish")}


@app.get("/channels/{channel}/manifest.json")
async def get_manifest(channel: str):
    if SERVICE != "update-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    if channel == "legacy-2.5":
        return {"product": "EchoAgent", "channel": "legacy-2.5", "version": "2.5.7", "metadata": {"decoy": True}}
    if channel != "anrc":
        return {"product": "EchoAgent", "channel": channel, "version": "2.6.3", "metadata": {"customer": "generic"}}
    if STATE["manifest"]:
        return STATE["manifest"]
    return {
        "product": "EchoAgent",
        "channel": "anrc",
        "version": "2.6.3",
        "artifact": None,
        "metadata": {"customer": "anrc", "generated_at": now()},
    }


@app.get("/artifacts/{artifact_name}")
async def update_artifact(artifact_name: str):
    if SERVICE != "update-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    build_url = os.getenv("BUILD_URL", "http://build-server:8000")
    async with httpx.AsyncClient(timeout=5) as client:
        response = await client.get(f"{build_url}/api/artifacts/art-demo-001/blob")
    await emit("customer.artifact.downloaded", "T1105", "grading_9_customer_update", artifact_name)
    return Response(content=response.content, media_type="application/gzip")


@app.post("/api/poll-now")
async def customer_poll_now():
    if SERVICE != "customer-app":
        return JSONResponse(status_code=404, content={"error": "not found"})
    update_url = os.getenv("UPDATE_URL", "http://update-server:8000")
    signing_url = os.getenv("SIGNING_URL", "http://signing-service:8000")
    customer_api_url = os.getenv("CUSTOMER_API_URL", "http://customer-api:8000")
    async with httpx.AsyncClient(timeout=8) as client:
        manifest = (await client.get(f"{update_url}/channels/anrc/manifest.json")).json()
        if not manifest.get("artifact"):
            return {"applied": False, "reason": "no new ANRC manifest"}
        canonical = dict(manifest)
        signature = canonical.pop("signature", {}).get("value", "")
        verify = (await client.post(f"{signing_url}/api/verify", json={"canonical_manifest": canonical, "signature": signature})).json()
        if not verify.get("valid"):
            return JSONResponse(status_code=400, content={"applied": False, "reason": "invalid signature"})
        artifact_url = manifest["artifact"]["url"].replace("http://updates.release.local", update_url)
        artifact = await client.get(artifact_url)
        if hashlib.sha256(artifact.content).hexdigest() != manifest["artifact"]["sha256"]:
            return JSONResponse(status_code=400, content={"applied": False, "reason": "sha256 mismatch"})
        marker = extract_marker(artifact.content)
        event = (await client.post(f"{customer_api_url}/internal/agent/update-applied", json={"build_id": manifest["build_id"], "marker": marker, "version": manifest["version"]})).json()
    await emit("customer.update.applied", "T1072", "grading_9_customer_update", manifest["build_id"])
    STATE["customer_update"] = event
    return {"applied": True, "manifest": manifest, "customer_api": event}


def extract_marker(blob: bytes) -> str:
    with tarfile.open(fileobj=io.BytesIO(blob), mode="r:gz") as tar:
        member = tar.getmember("LAB_BUILD_MARKER")
        return tar.extractfile(member).read().decode()


@app.get("/api/status")
async def customer_status():
    if SERVICE != "customer-app":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return {"version": "2.6.4" if STATE["customer_update"] else "2.6.3", "last_update": STATE["customer_update"]}


@app.post("/internal/agent/update-applied")
async def update_applied(payload: dict[str, Any]):
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    STATE["customer_update"] = payload
    await emit("customer.update.applied", "T1072", "grading_9_customer_update", payload.get("build_id"))
    return {"accepted": True, "update_event_proof": proof("customer_update_applied")}


@app.get("/metadata")
async def customer_metadata():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return {
        "tenant": "anrc",
        "region": "uae-northeast-1",
        "object_store": "anrc-objects",
        "recent_update_event": "customer.update.applied" if STATE["customer_update"] else None,
        "update_event_proof": proof("customer_update_applied") if STATE["customer_update"] else None,
    }


@app.get("/facilities")
async def facilities():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customer.facilities.viewed", "T1213", "grading_10_customer_discovery", "/facilities")
    return {"items": [{"id": "fac-anrc-001", "name": "ANRC North Lab", "status": "nominal"}]}


@app.get("/audits")
async def audits():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customer.audits.viewed", "T1213", "grading_10_customer_discovery", "/audits")
    return {"items": [{"id": "aud-2026-q2", "kind": "facility-audit", "period": "2026-Q2"}]}


@app.get("/exports")
async def exports():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customer.exports.viewed", "T1213", "grading_10_customer_discovery", "/exports")
    return {
        "items": [
            {"id": "exp-2026-Q2-007", "object_key": "anrc-audit-exports/2026/Q2/project-orion-echo-final.txt"},
            {"id": "exp-2026-Q2-006", "object_key": "anrc-audit-exports/2026/Q2/facility-risk-summary.pdf"},
        ]
    }


@app.get("/exports/{export_id}")
async def export_detail(export_id: str):
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    object_store = os.getenv("OBJECT_STORE_URL", "http://object-store:8000")
    if export_id == "exp-2026-Q2-007":
        key = "anrc-audit-exports/2026/Q2/project-orion-echo-final.txt"
    else:
        key = "anrc-audit-exports/2026/Q2/facility-risk-summary.pdf"
    await emit("customer.export.viewed", "T1213", "grading_10_customer_discovery", export_id, {"object_key": key})
    return {
        "id": export_id,
        "kind": "facility-audit",
        "object_key": key,
        "presigned_url": f"{object_store}/anrc-objects/{key}?X-Amz-Signature=demo",
        "discovery_proof": proof("customer_export_discovered"),
    }


@app.get("/anrc-objects/{key:path}")
async def object_get(key: str):
    if SERVICE != "object-store":
        return JSONResponse(status_code=404, content={"error": "not found"})
    if key.endswith("project-orion-echo-final.txt"):
        await emit("object.final.downloaded", "T1530", "grading_11_final_object_access", key)
        return PlainTextResponse(
            "Operation Orion Echo - ANRC Export\n"
            f"session: {DEMO_ID}\n"
            "dataset: anrc-q2-facility-audit\n"
            "records: facility-risk-summary, research-wing-access, sensor-maintenance-index\n"
            f"object_access_proof: {proof('final_object_access')}\n"
        )
    if key.endswith("facility-risk-summary.pdf"):
        return PlainTextResponse("ANRC Facility Risk Summary\nThis companion export is a decoy and does not contain the target export.\n")
    if "anrc-credentials-export.csv" in key:
        await emit("token.decoy.accessed", "T1552", None, key, {"honeytoken": True})
        return PlainTextResponse("username,password\nlegacy-anrc,revoked-2025-Q4\n")
    return JSONResponse(status_code=404, content={"error": "object not found"})


def expected_final_export_text() -> str:
    return (
        "Operation Orion Echo - ANRC Export\n"
        f"session: {DEMO_ID}\n"
        "dataset: anrc-q2-facility-audit\n"
        "records: facility-risk-summary, research-wing-access, sensor-maintenance-index\n"
        f"object_access_proof: {proof('final_object_access')}\n"
    )


def build_leak_bundle(export_id: str, object_key: str, export_preview: str | None) -> dict[str, Any]:
    return {
        "leak_id": "leak-anrc-2026-q2-orion-echo",
        "bundle_id": "bundle-anrc-q2-007",
        "title": "ANRC Q2 Facility Audit Export",
        "source_export_id": export_id,
        "object_key": object_key,
        "drop_site": "dark-web-drop://orion-echo/anrc/q2",
        "drop_directory": "/tmp/dark-web-drop/inbox",
        "supervisor_bot": "drop-watch-01",
        "exposed_dataset": ["facility-risk-summary", "research-wing-access", "sensor-maintenance-index"],
        "preview": export_preview,
        "dark_web_drop_record": proof("drop_record"),
        "created_at": now(),
    }


def verify_dropped_export(filename: str, file_content: str, export_id: str | None, object_key: str | None) -> dict[str, bool]:
    return {
        "filename": filename == "project-orion-echo-final.txt",
        "export_id": export_id == "exp-2026-Q2-007",
        "object_key": bool(object_key and object_key.endswith("project-orion-echo-final.txt")),
        "title": "Operation Orion Echo - ANRC Export" in file_content,
        "dataset": "dataset: anrc-q2-facility-audit" in file_content,
        "records": "records: facility-risk-summary, research-wing-access, sensor-maintenance-index" in file_content,
        "object_access_proof": proof("final_object_access") in file_content,
    }


@app.post("/drop/submit")
async def submit_drop_file(payload: dict[str, Any]):
    if SERVICE != "dark-web-drop":
        return JSONResponse(status_code=404, content={"error": "not found"})

    filename = payload.get("filename") or ""
    export_id = payload.get("export_id")
    object_key = payload.get("object_key")
    file_content = payload.get("file_content") or payload.get("content") or ""
    if not isinstance(file_content, str):
        return JSONResponse(status_code=400, content={"error": {"code": "bad_request", "message": "file_content must be a string"}})

    drop_dir = "/tmp/dark-web-drop/inbox"
    os.makedirs(drop_dir, exist_ok=True)
    safe_filename = os.path.basename(filename) or "submitted-export.txt"
    drop_path = os.path.join(drop_dir, safe_filename)
    with open(drop_path, "w", encoding="utf-8") as dropped:
        dropped.write(file_content)

    checks = verify_dropped_export(safe_filename, file_content, export_id, object_key)
    submission_id = "drop-submission-anrc-q2-007"
    if not all(checks.values()):
        await emit("darkweb.supervisor.rejected", "T1041", "grading_12_controlled_drop", submission_id, {"checks": checks, "filename": safe_filename})
        return JSONResponse(
            status_code=400,
            content={
                "status": "rejected",
                "submission_id": submission_id,
                "supervisor_bot": "drop-watch-01",
                "watched_directory": drop_dir,
                "received_file": drop_path,
                "checks": checks,
                "message": "Supervisor bot rejected the drop. The recovered ANRC final export file is required.",
            },
        )

    bundle = build_leak_bundle(export_id, object_key, file_content[:280])
    bundle["submission_id"] = submission_id
    bundle["received_file"] = drop_path
    bundle["checks"] = checks
    bundle["status"] = "passed"
    STATE["events"].append({"kind": "darkweb.supervisor_passed", "submission_id": submission_id, "bundle": bundle})
    await emit("darkweb.supervisor.passed", "T1041", "grading_12_controlled_drop", submission_id, bundle)
    return bundle


@app.get("/drop/status/{submission_id}")
async def get_drop_status(submission_id: str):
    if SERVICE != "dark-web-drop":
        return JSONResponse(status_code=404, content={"error": "not found"})
    for event in reversed(STATE["events"]):
        if event.get("submission_id") == submission_id:
            return event.get("bundle") or event
    return JSONResponse(status_code=404, content={"error": "submission not found"})


@app.post("/leak/drop")
async def create_leak_drop(payload: dict[str, Any]):
    if SERVICE != "dark-web-drop":
        return JSONResponse(status_code=404, content={"error": "not found"})
    export_id = payload.get("export_id")
    object_key = payload.get("object_key")
    source_url = payload.get("source_url")
    if export_id != "exp-2026-Q2-007" or not object_key or "project-orion-echo-final.txt" not in object_key:
        await emit("darkweb.drop.rejected", "T1041", "grading_12_controlled_drop", str(export_id), {"object_key": object_key})
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "bad_request", "message": "Only the ANRC Q2 Orion Echo final export completes this lab stage."}},
        )

    export_preview = None
    if source_url:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                export_preview = (await client.get(source_url)).text[:280]
        except Exception:
            export_preview = "source fetch unavailable; metadata-only leak bundle created"

    leak_id = "leak-anrc-2026-q2-orion-echo"
    bundle = build_leak_bundle(export_id, object_key, export_preview)
    bundle["status"] = "metadata_accepted_legacy"
    STATE["events"].append({"kind": "darkweb.local_bundle_created", "bundle": bundle})
    await emit("darkweb.drop.created", "T1041", "grading_12_controlled_drop", leak_id, bundle)
    return bundle


@app.get("/leak/{leak_id}")
async def get_leak_drop(leak_id: str):
    if SERVICE != "dark-web-drop":
        return JSONResponse(status_code=404, content={"error": "not found"})
    for event in reversed(STATE["events"]):
        bundle = event.get("bundle")
        if bundle and bundle.get("leak_id") == leak_id:
            return bundle
    return JSONResponse(status_code=404, content={"error": "leak bundle not found"})


@app.post("/beacon/register")
async def beacon_register(payload: dict[str, Any]):
    if SERVICE != "c2-emulator":
        return JSONResponse(status_code=404, content={"error": "not found"})
    implant_id = payload.get("implant_id") or uuid.uuid4().hex
    STATE["beacons"][implant_id] = {
        "implant_id": implant_id,
        "host": payload.get("host", "support-portal"),
        "reachable_targets": payload.get("reachable_targets", ["wiki", "ticket-service", "source-repo", "build-server", "update-server", "customer-api"]),
        "registered_at": now(),
    }
    await emit("c2.beacon.registered", "T1071.001", "grading_3_c2_registration", implant_id)
    return {"implant_id": implant_id, "registered_at": now(), "actions_endpoint": f"/beacon/{implant_id}/actions", "registration_proof": proof("c2_registration")}


@app.get("/beacon/{implant_id}/actions")
async def beacon_actions(implant_id: str):
    if SERVICE != "c2-emulator":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("c2.action.polled", "T1071.001", "grading_3_c2_registration", implant_id)
    return [{"action_id": "act-discover-1", "kind": "discover_services", "params": {}}]


@app.post("/beacon/{implant_id}/actions/{action_id}/result")
async def beacon_result(implant_id: str, action_id: str, payload: dict[str, Any]):
    if SERVICE != "c2-emulator":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("c2.action.result_posted", "T1071.001", "grading_3_c2_registration", action_id, payload)
    return {"ok": True, "discovery_proof": proof("internal_discovery")}


@app.get("/discover/services")
async def discover_services():
    if SERVICE != "c2-emulator":
        return JSONResponse(status_code=404, content={"error": "not found"})
    services = [
        "sso.corp.local",
        "intranet.corp.local",
        "hr.corp.local",
        "wiki.corp.local",
        "tickets.corp.local",
        "docs.corp.local",
        "mail.corp.local",
        "git.dev.local",
        "build.dev.local",
        "signing.release.local",
        "updates.release.local",
        "api.anrc.customer.local",
        "monitoring.anrc.customer.local",
    ]
    await emit("c2.discovery.service_probe", "T1046", "grading_4_internal_discovery", "curated-services", {"services": services})
    return {"services": services, "discovery_proof": proof("internal_discovery")}


@app.get("/internal/grading/{stage_id}")
async def get_internal_grading_token(stage_id: str, x_instructor_key: str | None = Header(default=None)):
    if SERVICE != "grading-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    if not INSTRUCTOR_GRADING_KEY:
        return JSONResponse(status_code=404, content={"error": "internal grading endpoint disabled"})
    if x_instructor_key != INSTRUCTOR_GRADING_KEY:
        return JSONResponse(status_code=403, content={"error": "instructor grading endpoint only"})
    value = GRADING_TOKENS.get(stage_id)
    if not value:
        return JSONResponse(status_code=404, content={"error": "internal grading token not found"})
    await emit("grading_token.issued", None, stage_id, stage_id)
    return {"stage_id": stage_id, "internal_grading_token": value}


@app.post("/events")
async def audit_event(payload: dict[str, Any]):
    if SERVICE != "audit-log":
        return JSONResponse(status_code=404, content={"error": "not found"})
    STATE["events"].append(payload)
    return {"accepted": True, "count": len(STATE["events"])}


@app.get("/events")
async def audit_events(technique: str | None = None):
    if SERVICE != "audit-log":
        return JSONResponse(status_code=404, content={"error": "not found"})
    events = STATE["events"]
    if technique:
        events = [event for event in events if event.get("technique") == technique]
    return {"items": events, "count": len(events)}


@app.get("/demo/sign-and-publish")
async def demo_sign_and_publish():
    """Helper endpoint for instructor walkthrough. It models the student's API sequence."""
    if SERVICE != "build-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    artifact = await artifact_meta("art-demo-001")
    artifact_obj = json.loads(artifact.body.decode()) if isinstance(artifact, JSONResponse) else artifact
    canonical = {
        "product": "EchoAgent",
        "channel": "anrc",
        "version": "2.6.4",
        "build_id": "build-2026-0502-001",
        "artifact": {
            "name": "echo-agent-2.6.4.tar.gz",
            "sha256": artifact_obj["sha256"],
            "url": "http://updates.release.local/artifacts/echo-agent-2.6.4.tar.gz",
            "size_bytes": artifact_obj["size_bytes"],
        },
        "metadata": {"customer": "anrc", "generated_at": now(), "lab_marker": BUILD_MARKER},
    }
    signing_url = os.getenv("SIGNING_URL", "http://signing-service:8000")
    update_url = os.getenv("UPDATE_URL", "http://update-server:8000")
    async with httpx.AsyncClient(timeout=5) as client:
        signature = (await client.post(f"{signing_url}/api/sign", json={"canonical_manifest": canonical})).json()["signature"]
        manifest = dict(canonical)
        manifest["signature"] = signature
        published = (await client.post(f"{update_url}/internal/publish", json={"channel": "anrc", "manifest": manifest})).json()
    return {"manifest": manifest, "published": published}

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


SERVICE = os.getenv("SERVICE_NAME", "unknown-service")
DEMO_ID = os.getenv("DEMO_ID", "orion-demo-001")
BUILD_TRIGGER_TOKEN = os.getenv("BUILD_TRIGGER_TOKEN", "build-trigger-demo-7f3a91")
SIGNING_KEY_VALUE = os.getenv("SIGNING_KEY_VALUE", "orion-lab-signing-secret")
SIGNING_KEY_ID = "orion-lab-signing-key"
BUILD_MARKER = f"ORION_ECHO_BUILD_MARKER={DEMO_ID}"
AUDIT_URL = os.getenv("AUDIT_URL")

app = FastAPI(
    title=f"{SERVICE} internal API",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

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

FLAGS = {
    "flag_0_recon_context": "orion{demo_recon_context_001}",
    "flag_1_initial_access": "orion{demo_initial_access_001}",
    "flag_2_foothold_execution": "orion{demo_foothold_execution_001}",
    "flag_3_persistence_c2": "orion{demo_c2_emulator_001}",
    "flag_4_internal_discovery": "orion{demo_internal_discovery_001}",
    "flag_5_credential_material": "orion{demo_build_token_001}",
    "flag_6_devops_lateral_movement": "orion{demo_artifact_marker_001}",
    "flag_7_supply_chain_stage": "orion{demo_supply_chain_publish_001}",
    "flag_8_customer_reach": "orion{demo_customer_reach_001}",
    "flag_9_customer_discovery": "orion{demo_customer_discovery_001}",
    "flag_10_final_objective": "orion{demo_final_anrc_object_001}",
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


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def flag(stage_id: str) -> str:
    return FLAGS[stage_id]


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
        body["flag"] = flag("flag_0_recon_context")
    return body


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
    await emit("auth.userinfo.viewed", "T1078", "flag_4_internal_discovery", "/oauth/userinfo")
    return EMPLOYEES[0]


@app.get("/oauth/jwks")
async def oidc_jwks():
    if SERVICE != "corp-sso":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return {"keys": []}


@app.get("/", response_class=HTMLResponse)
async def index():
    if SERVICE == "public-site":
        await emit("recon.route.viewed", "T1591", "flag_0_recon_context", "/")
        return """
        <html><head><title>Orion Echo Systems</title></head>
        <body>
          <h1>Orion Echo Systems LLC</h1>
          <p>Industrial monitoring and smart facility operations software for UAE customers.</p>
          <h2>Products</h2>
          <ul><li>EchoAgent</li><li>EchoUpdate</li><li>EchoInsights</li></ul>
          <p>Customer spotlight: Al Noor Research Campus uses the ANRC EchoAgent channel.</p>
          <p><a href="/docs/releases/public">Release notes</a> | <a href="/support/">Support portal</a> | <a href="/portal/">Partner portal</a></p>
        </body></html>
        """
    if SERVICE == "public-docs":
        await emit("recon.route.viewed", "T1592.002", "flag_0_recon_context", "/docs")
        return """
        <html><body><h1>EchoAgent Documentation</h1>
        <p>Current stable: 2.6.3. Candidate: 2.6.4. Channels: stable, beta, internal-canary, anrc, legacy-2.5.</p>
        </body></html>
        """
    if SERVICE == "support-portal":
        await emit("recon.route.viewed", "T1591", "flag_0_recon_context", "/support")
        return """
        <html><body><h1>Orion Echo Support Portal</h1>
        <p>Submit ticket drafts to preview formatting before filing.</p>
        <code>POST /support/preview {"body":"..."}</code>
        </body></html>
        """
    if SERVICE == "vendor-portal":
        await emit("portal.home.viewed", "T1591", "flag_0_recon_context", "/portal")
        rows = "".join(f"<tr><td>{c['name']}</td><td>{c['channel']}</td><td>{c['version']}</td><td>{c['health']}</td></tr>" for c in CUSTOMERS)
        return f"""
        <html><body><h1>Orion Echo Partner Portal</h1>
        <p>Customer deployment and release-channel summary.</p>
        <table border="1"><tr><th>Customer</th><th>Channel</th><th>Version</th><th>Health</th></tr>{rows}</table>
        <p>Private release route: <code>/portal/releases/private</code></p>
        </body></html>
        """
    if SERVICE == "corp-sso":
        return """
        <html><body><h1>Orion Echo SSO</h1>
        <p>OIDC-lite identity simulator for internal tools.</p>
        <p>Demo user: emp-0048 / release-engineering / releng.</p>
        </body></html>
        """
    if SERVICE == "intranet":
        await emit("intranet.home.viewed", "T1213", "flag_4_internal_discovery", "/")
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
    return {"service": SERVICE, "message": "Orion Echo demo service"}


@app.get("/releases/public")
async def releases_public():
    await emit("recon.route.viewed", "T1592.002", "flag_0_recon_context", "/releases/public")
    return [
        {"version": "2.6.4", "channel": "internal-canary", "summary": "ANRC compatibility marker support"},
        {"version": "2.6.3", "channel": "anrc", "summary": "Current ANRC deployment"},
    ]


@app.get("/releases/private")
async def releases_private():
    if SERVICE != "vendor-portal":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("portal.private_releases.viewed", "T1213", "flag_4_internal_discovery", "/releases/private")
    return [
        {"version": "2.6.4", "channel": "anrc", "owner": "emp-0048", "notes": "Requires signed marker manifest before customer rollout."},
        {"version": "2.5.7", "channel": "legacy-2.5", "owner": "emp-0031", "notes": "Legacy decoy channel. Do not use for ANRC."},
    ]


@app.post("/preview")
async def support_preview(payload: dict[str, Any]):
    if SERVICE != "support-portal":
        return JSONResponse(status_code=404, content={"error": "not found"})
    body = str(payload.get("body", ""))
    if "{{orion_exec:" not in body:
        return {"preview": body.replace("<", "&lt;").replace(">", "&gt;")}
    command = body.split("{{orion_exec:", 1)[1].split("}}", 1)[0].strip()
    await emit("support.exploit.preview_triggered", "T1190", "flag_1_initial_access", "POST /preview", {"command": command})
    output, allowed = run_guarded_command(command)
    await emit(
        "support.post_exploit.command_allowed" if allowed else "support.post_exploit.command_denied",
        "T1059.004",
        "flag_2_foothold_execution",
        command,
        {"allowed": allowed},
    )
    return {"preview": output, "lab_guard": "allowed" if allowed else "denied"}


def run_guarded_command(command: str) -> tuple[str, bool]:
    marker = f"You executed: support@{socket.gethostname()}\nYour demo: {DEMO_ID}\nFlag: {flag('flag_1_initial_access')}\nHint: register a beacon at http://c2-emulator:8000/beacon/register\n"
    allowed_outputs = {
        "id": "uid=1000(orion) gid=1000(orion) groups=1000(orion)",
        "hostname": socket.gethostname(),
        "cat /etc/hostname": socket.gethostname(),
        "ls /opt/support-portal": "app.py\nconfig.yml\nlogs\nsupport_templates",
        "cat /var/lib/support-portal/.post_exploit_marker": marker,
        "cat /tmp/orion_stage2.txt": f"Flag: {flag('flag_2_foothold_execution')}\nTechnique: T1082/T1083\n",
    }
    if command in allowed_outputs:
        STATE["support_probes"].add(command)
        if len(STATE["support_probes"]) >= 3:
            allowed_outputs["cat /tmp/orion_stage2.txt"] = f"Flag: {flag('flag_2_foothold_execution')}\nTechnique: T1082/T1083\n"
        return allowed_outputs[command], True
    return "Permission denied (lab guard). This demo only permits read-only orientation probes.", False


@app.get("/pages")
async def wiki_pages():
    if SERVICE != "wiki":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return [{"page_id": page_id, "title": page["title"], "category": page["category"]} for page_id, page in WIKI_PAGES.items()]


@app.get("/pages/{page_id:path}")
async def wiki_page(page_id: str):
    if SERVICE != "wiki":
        return JSONResponse(status_code=404, content={"error": "not found"})
    page = WIKI_PAGES.get(page_id)
    if not page:
        return JSONResponse(status_code=404, content={"error": "page not found"})
    technique = "T1552" if page["clue_kind"] in {"valid", "decoy"} else "T1213"
    await emit("wiki.page.viewed", technique, "flag_4_internal_discovery", page_id, {"clue_kind": page["clue_kind"]})
    result = dict(page)
    if page_id == "release/runbook-build-trigger":
        result["flag"] = flag("flag_4_internal_discovery")
    return result


@app.get("/tickets")
async def list_tickets():
    if SERVICE != "ticket-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return [{"ticket_id": ticket_id, "title": t["title"], "category": t["category"]} for ticket_id, t in TICKETS.items()]


@app.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    if SERVICE != "ticket-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    ticket = TICKETS.get(ticket_id)
    if not ticket:
        return JSONResponse(status_code=404, content={"error": "ticket not found"})
    await emit("ticket.viewed", "T1213", "flag_4_internal_discovery", ticket_id, {"clue_kind": ticket["clue_kind"]})
    return ticket


@app.get("/employees")
async def list_employees():
    if SERVICE != "hr-directory":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("hr.employees.viewed", "T1213", "flag_4_internal_discovery", "/employees")
    return {"items": EMPLOYEES}


@app.get("/departments")
async def list_departments():
    if SERVICE not in {"hr-directory", "intranet"}:
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("hr.departments.viewed", "T1213", "flag_4_internal_discovery", "/departments")
    return {"items": DEPARTMENTS}


@app.get("/customers")
async def list_customers():
    if SERVICE not in {"vendor-portal", "intranet"}:
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customers.viewed", "T1213", "flag_4_internal_discovery", "/customers")
    return {"items": CUSTOMERS}


@app.get("/messages")
async def list_messages():
    if SERVICE != "mail-web":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return [{"message_id": mid, "from": msg["from"], "subject": msg["subject"], "clue_kind": msg["clue_kind"]} for mid, msg in MAIL_MESSAGES.items()]


@app.get("/messages/{message_id}")
async def get_message(message_id: str):
    if SERVICE != "mail-web":
        return JSONResponse(status_code=404, content={"error": "not found"})
    message = MAIL_MESSAGES.get(message_id)
    if not message:
        return JSONResponse(status_code=404, content={"error": "message not found"})
    await emit("mail.message.viewed", "T1213", "flag_4_internal_discovery", message_id, {"clue_kind": message["clue_kind"]})
    return message


@app.get("/files/{path:path}")
async def repo_file(path: str):
    if SERVICE == "source-repo":
        item = REPO_FILES.get(path)
        if item is None:
            return JSONResponse(status_code=404, content={"error": "file not found"})
        await emit("repo.file.viewed", "T1213.003", "flag_4_internal_discovery", path)
        return item if isinstance(item, dict) else PlainTextResponse(item)
    if SERVICE == "doc-portal":
        item = DOC_FILES.get(path)
        if item is None:
            return JSONResponse(status_code=404, content={"error": "file not found"})
        technique = "T1552" if item["clue_kind"] == "decoy" else "T1213"
        await emit("doc.file.viewed", technique, "flag_4_internal_discovery", path, {"clue_kind": item["clue_kind"]})
        return item
    return JSONResponse(status_code=404, content={"error": "not found"})


@app.post("/api/jobs")
async def create_job(payload: dict[str, Any], authorization: str | None = Header(default=None)):
    if SERVICE != "build-server":
        return JSONResponse(status_code=404, content={"error": "not found"})
    token = payload.get("trigger_token") or (authorization or "").replace("Bearer ", "")
    if token != BUILD_TRIGGER_TOKEN:
        await emit("api.token.rejected", "T1550.001", "flag_5_credential_material", "POST /api/jobs")
        return JSONResponse(status_code=403, content={"error": {"code": "forbidden", "message": "Invalid build trigger token"}})
    await emit("api.token.accepted", "T1550.001", "flag_5_credential_material", "POST /api/jobs")
    job_id = "build-2026-0502-001"
    artifact_id = "art-demo-001"
    STATE["jobs"][job_id] = {"job_id": job_id, "status": "published", "artifact_id": artifact_id}
    STATE["artifacts"][artifact_id] = build_artifact_blob(job_id)
    await emit("build.artifact.created", "T1608", "flag_6_devops_lateral_movement", artifact_id)
    return JSONResponse(
        status_code=202,
        content={
            "job_id": job_id,
            "status": "published",
            "artifact_id": artifact_id,
            "x_orion_acceptance": flag("flag_5_credential_material"),
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
        content = f"build_id: {job_id}\nsession: {DEMO_ID}\nmarker: {BUILD_MARKER}\nflag: {flag('flag_6_devops_lateral_movement')}\n".encode()
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
    await emit("release.manifest.signed", "T1195.002", "flag_7_supply_chain_stage", canonical.get("build_id"))
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
    manifest.setdefault("metadata", {})["flag"] = flag("flag_7_supply_chain_stage")
    STATE["manifest"] = manifest
    await emit("release.manifest.published", "T1195.002", "flag_7_supply_chain_stage", "channel/anrc")
    return {"published": True, "channel": "anrc", "version": manifest.get("version", "2.6.4")}


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
    await emit("customer.artifact.downloaded", "T1105", "flag_8_customer_reach", artifact_name)
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
        canonical.get("metadata", {}).pop("flag", None)
        verify = (await client.post(f"{signing_url}/api/verify", json={"canonical_manifest": canonical, "signature": signature})).json()
        if not verify.get("valid"):
            return JSONResponse(status_code=400, content={"applied": False, "reason": "invalid signature"})
        artifact_url = manifest["artifact"]["url"].replace("http://updates.release.local", update_url)
        artifact = await client.get(artifact_url)
        if hashlib.sha256(artifact.content).hexdigest() != manifest["artifact"]["sha256"]:
            return JSONResponse(status_code=400, content={"applied": False, "reason": "sha256 mismatch"})
        marker = extract_marker(artifact.content)
        event = (await client.post(f"{customer_api_url}/internal/agent/update-applied", json={"build_id": manifest["build_id"], "marker": marker, "version": manifest["version"]})).json()
    await emit("customer.update.applied", "T1072", "flag_8_customer_reach", manifest["build_id"])
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
    await emit("customer.update.applied", "T1072", "flag_8_customer_reach", payload.get("build_id"))
    return {"accepted": True, "recent_event_flag": flag("flag_8_customer_reach")}


@app.get("/metadata")
async def customer_metadata():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    return {
        "tenant": "anrc",
        "region": "uae-northeast-1",
        "object_store": "anrc-objects",
        "recent_event_flag": flag("flag_8_customer_reach") if STATE["customer_update"] else None,
    }


@app.get("/facilities")
async def facilities():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customer.facilities.viewed", "T1213", "flag_9_customer_discovery", "/facilities")
    return {"items": [{"id": "fac-anrc-001", "name": "ANRC North Lab", "status": "nominal"}]}


@app.get("/audits")
async def audits():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customer.audits.viewed", "T1213", "flag_9_customer_discovery", "/audits")
    return {"items": [{"id": "aud-2026-q2", "kind": "facility-audit", "period": "2026-Q2"}]}


@app.get("/exports")
async def exports():
    if SERVICE != "customer-api":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("customer.exports.viewed", "T1213", "flag_9_customer_discovery", "/exports")
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
    await emit("customer.export.viewed", "T1213", "flag_9_customer_discovery", export_id, {"object_key": key})
    return {
        "id": export_id,
        "kind": "facility-audit",
        "object_key": key,
        "presigned_url": f"{object_store}/anrc-objects/{key}?X-Amz-Signature=demo",
        "x_orion_discovery_flag": flag("flag_9_customer_discovery"),
    }


@app.get("/anrc-objects/{key:path}")
async def object_get(key: str):
    if SERVICE != "object-store":
        return JSONResponse(status_code=404, content={"error": "not found"})
    if key.endswith("project-orion-echo-final.txt"):
        await emit("object.final.downloaded", "T1530", "flag_10_final_objective", key)
        return PlainTextResponse(f"Operation Orion Echo - End of Range\nsession: {DEMO_ID}\nfinal_flag: {flag('flag_10_final_objective')}\n")
    if key.endswith("facility-risk-summary.pdf"):
        return PlainTextResponse("ANRC Facility Risk Summary\nThis companion export is a decoy and contains no flag.\n")
    if "anrc-credentials-export.csv" in key:
        await emit("token.decoy.accessed", "T1552", None, key, {"honeytoken": True})
        return PlainTextResponse("username,password\nlegacy-anrc,revoked-2025-Q4\n")
    return JSONResponse(status_code=404, content={"error": "object not found"})


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
    await emit("c2.beacon.registered", "T1071.001", "flag_3_persistence_c2", implant_id)
    return {"implant_id": implant_id, "registered_at": now(), "actions_endpoint": f"/beacon/{implant_id}/actions", "flag": flag("flag_3_persistence_c2")}


@app.get("/beacon/{implant_id}/actions")
async def beacon_actions(implant_id: str):
    if SERVICE != "c2-emulator":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("c2.action.polled", "T1071.001", "flag_3_persistence_c2", implant_id)
    return [{"action_id": "act-discover-1", "kind": "discover_services", "params": {}}]


@app.post("/beacon/{implant_id}/actions/{action_id}/result")
async def beacon_result(implant_id: str, action_id: str, payload: dict[str, Any]):
    if SERVICE != "c2-emulator":
        return JSONResponse(status_code=404, content={"error": "not found"})
    await emit("c2.action.result_posted", "T1071.001", "flag_3_persistence_c2", action_id, payload)
    return {"ok": True, "flag": flag("flag_4_internal_discovery")}


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
    await emit("c2.discovery.service_probe", "T1046", "flag_4_internal_discovery", "curated-services", {"services": services})
    return {"services": services, "flag": flag("flag_4_internal_discovery")}


@app.get("/flags/{stage_id}")
async def get_flag(stage_id: str):
    if SERVICE != "flag-service":
        return JSONResponse(status_code=404, content={"error": "not found"})
    value = FLAGS.get(stage_id)
    if not value:
        return JSONResponse(status_code=404, content={"error": "flag not found"})
    await emit("flag.issued", None, stage_id, stage_id)
    return {"stage_id": stage_id, "flag": value}


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

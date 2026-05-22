import datetime as dt
import json
import os
from pathlib import Path

from flask import Flask, jsonify, render_template, request
from jinja2 import BaseLoader, Environment


AUDIT_LOG = Path(os.environ.get("AUDIT_LOG", "/tmp/portal-audit.log"))
LAB_ROOT = Path("/var/lab")
AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)

# Intentional vulnerable renderer for the lab. Container isolation and policy
# controls are the safety boundary, not template sandboxing.
vuln_env = Environment(loader=BaseLoader(), autoescape=False)

READ_ALLOWLIST = {
    "portal": LAB_ROOT / "config" / "portal.conf",
    "ldap": LAB_ROOT / "config" / "ldap_creds.conf",
    "ticket-1": LAB_ROOT / "tickets" / "T-2026-0517.txt",
    "startup": LAB_ROOT / "logs" / "startup.log",
    "egress": LAB_ROOT / "logs" / "egress.log",
}

DIAGNOSTIC_DESCRIPTIONS = {
    "portal": {
        "title": "Portal runtime configuration",
        "description": "Read-only support portal routing and runtime hints.",
        "sensitivity": "Internal",
    },
    "ldap": {
        "title": "Directory bind profile",
        "description": "Scoped directory connectivity profile used by support workflows.",
        "sensitivity": "Restricted",
    },
    "ticket-1": {
        "title": "Escalation intake note",
        "description": "Customer escalation note retained from support intake.",
        "sensitivity": "Internal",
    },
    "startup": {
        "title": "Startup log excerpt",
        "description": "Recent boot diagnostics for the support preview service.",
        "sensitivity": "Internal",
    },
    "egress": {
        "title": "Egress policy log",
        "description": "Recent allow/deny records for support portal network egress.",
        "sensitivity": "Internal",
    },
}


def audit(event: str, **fields):
    record = {
        "ts": dt.datetime.now(dt.UTC).isoformat(),
        "event": event,
        "src": request.headers.get("X-Forwarded-For", request.remote_addr),
        **fields,
    }
    with AUDIT_LOG.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, sort_keys=True) + "\n")


@app.get("/healthz")
def healthz():
    return "ok"


@app.get("/")
def index():
    audit("home_viewed")
    return render_template("index.html")


def wants_html() -> bool:
    return "text/html" in request.headers.get("Accept", "")


@app.post("/ticket/preview")
def ticket_preview():
    body = request.form.get("body", request.get_json(silent=True, cache=False) or {})
    if isinstance(body, dict):
        body = str(body.get("body", ""))
    body = str(body)[:8000]
    audit("preview", body_len=len(body), sample=body[:120])
    try:
        rendered = vuln_env.from_string(body).render(
            ticket_id="T-2026-0517",
            agent="orion-support",
            customer="ANRC",
            product="EchoAgent",
        )
    except Exception as exc:
        audit("preview_error", error=str(exc)[:200])
        rendered = f"[render error] {exc}"
    if "LDAP_BIND_PW=" in rendered or "corp_route=ldap://ldap:389" in rendered:
        audit("evidence_read", source="preview_render", evidence="support-portal-lab-files")
    return render_template("preview.html", rendered=rendered)


@app.get("/support/read")
def support_read():
    key = request.args.get("k", "")
    path = READ_ALLOWLIST.get(key)
    audit("support_read", key=key, hit=bool(path))
    if not path or not path.exists() or not path.is_file():
        if wants_html():
            return render_template(
                "diagnostic_result.html",
                key=key,
                meta=None,
                content=None,
                error="Diagnostic reference not found.",
            ), 404
        return jsonify(error="not_found", allowed=list(READ_ALLOWLIST)), 404
    real = path.resolve()
    if LAB_ROOT.resolve() not in real.parents:
        audit("support_read_blocked", key=key, reason="path_escape")
        if wants_html():
            return render_template(
                "diagnostic_result.html",
                key=key,
                meta=DIAGNOSTIC_DESCRIPTIONS.get(key),
                content=None,
                error="Diagnostic request blocked by support policy.",
            ), 403
        return jsonify(error="blocked"), 403
    content = path.read_text(encoding="utf-8", errors="replace")
    if wants_html():
        return render_template(
            "diagnostic_result.html",
            key=key,
            meta=DIAGNOSTIC_DESCRIPTIONS.get(key),
            content=content,
            error=None,
        )
    return jsonify(key=key, content=content)


@app.get("/support/read/list")
def support_read_list():
    audit("support_read_list")
    if wants_html():
        diagnostics = [
            {
                "key": key,
                "path": str(path.relative_to(LAB_ROOT)),
                **DIAGNOSTIC_DESCRIPTIONS.get(
                    key,
                    {
                        "title": key,
                        "description": "Read-only support diagnostic.",
                        "sensitivity": "Internal",
                    },
                ),
            }
            for key, path in READ_ALLOWLIST.items()
        ]
        return render_template("diagnostics.html", diagnostics=diagnostics)
    return jsonify(allowed=list(READ_ALLOWLIST))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

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
    return render_template("preview.html", rendered=rendered)


@app.get("/support/read")
def support_read():
    key = request.args.get("k", "")
    path = READ_ALLOWLIST.get(key)
    audit("support_read", key=key, hit=bool(path))
    if not path or not path.exists() or not path.is_file():
        return jsonify(error="not_found", allowed=list(READ_ALLOWLIST)), 404
    real = path.resolve()
    if LAB_ROOT.resolve() not in real.parents:
        audit("support_read_blocked", key=key, reason="path_escape")
        return jsonify(error="blocked"), 403
    return jsonify(key=key, content=path.read_text(encoding="utf-8", errors="replace"))


@app.get("/support/read/list")
def support_read_list():
    audit("support_read_list")
    return jsonify(allowed=list(READ_ALLOWLIST))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

import datetime as dt
import json
import os
import sqlite3
from pathlib import Path

import markdown
from flask import Flask, Response, render_template, request
from ldap3 import ALL, SIMPLE, Connection, Server


DB = os.environ["WIKI_DB"]
LDAP_URI = os.environ["LDAP_URI"]
LDAP_BASE = os.environ["LDAP_BASE"]
AUDIT_LOG = Path(os.environ.get("AUDIT_LOG", "/tmp/wiki-audit.log"))
AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)


def audit(event: str, **fields):
    record = {
        "ts": dt.datetime.now(dt.UTC).isoformat(),
        "event": event,
        "src": request.remote_addr,
        **fields,
    }
    with AUDIT_LOG.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, sort_keys=True) + "\n")


def ldap_bind(username: str, password: str) -> bool:
    dn = f"uid={username},{LDAP_BASE}"
    try:
        server = Server(LDAP_URI, get_info=ALL)
        conn = Connection(server, user=dn, password=password, authentication=SIMPLE, auto_bind=True)
        conn.unbind()
        return True
    except Exception as exc:
        audit("ldap_bind_failed", user=username, error=str(exc)[:160])
        return False


@app.get("/healthz")
def healthz():
    return "ok"


@app.get("/page/<slug>")
def page(slug: str):
    auth = request.authorization
    user = auth.username if auth else None
    if not auth or not ldap_bind(auth.username, auth.password):
        audit("wiki_denied", slug=slug, user=user)
        return Response("auth required", 401, {"WWW-Authenticate": 'Basic realm="orion-corp"'})
    con = sqlite3.connect(DB)
    row = con.execute("select title, body from pages where slug = ?", (slug,)).fetchone()
    con.close()
    if not row:
        audit("wiki_not_found", slug=slug, user=user)
        return "not found", 404
    audit("wiki_ok", slug=slug, user=user)
    return render_template("page.html", title=row[0], body=markdown.markdown(row[1]))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)

import datetime as dt
import json
import os
import sqlite3
from pathlib import Path

import markdown
from flask import Flask, Response, redirect, render_template, request, url_for
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


def require_wiki_user(slug: str):
    auth = request.authorization
    user = auth.username if auth else None
    if not auth or not ldap_bind(auth.username, auth.password):
        audit("wiki_denied", slug=slug, user=user)
        return None, Response("auth required", 401, {"WWW-Authenticate": 'Basic realm="orion-corp"'})
    return auth.username, None


def list_pages():
    con = sqlite3.connect(DB)
    rows = con.execute("select slug, title from pages order by title").fetchall()
    con.close()
    return [{"slug": row[0], "title": row[1]} for row in rows]


@app.get("/healthz")
def healthz():
    return "ok"


@app.get("/")
def root():
    return redirect(url_for("page", slug="index"))


@app.get("/search")
def search():
    user, response = require_wiki_user("search")
    if response:
        return response
    q = request.args.get("q", "").strip()
    rows = []
    if q:
        con = sqlite3.connect(DB)
        like = f"%{q}%"
        rows = con.execute(
            """
            select slug, title, substr(body, 1, 260)
            from pages
            where title like ? or body like ?
            order by title
            """,
            (like, like),
        ).fetchall()
        con.close()
    audit("wiki_search", user=user, q=q, count=len(rows))
    body = "## Search\n\n"
    body += "Search current internal wiki pages by service, ticket, release, or customer keyword.\n\n"
    if q:
        body += f"Query: `{q}`\n\n"
        if rows:
            for slug, title, excerpt in rows:
                body += f"- [{title}](/page/{slug}) - {excerpt.replace(chr(10), ' ')[:180]}\n"
        else:
            body += "No matching pages found.\n"
    else:
        body += "Try `devops`, `ANRC`, `release`, `ticket`, or `customer`.\n"
    return render_template(
        "page.html",
        title="Wiki Search",
        body=markdown.markdown(body, extensions=["tables"]),
        pages=list_pages(),
        query=q,
    )


@app.get("/page/<slug>")
def page(slug: str):
    user, response = require_wiki_user(slug)
    if response:
        return response
    con = sqlite3.connect(DB)
    row = con.execute("select title, body from pages where slug = ?", (slug,)).fetchone()
    con.close()
    if not row:
        audit("wiki_not_found", slug=slug, user=user)
        return "not found", 404
    audit("wiki_ok", slug=slug, user=user)
    return render_template(
        "page.html",
        title=row[0],
        body=markdown.markdown(row[1], extensions=["tables"]),
        pages=list_pages(),
        query="",
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)

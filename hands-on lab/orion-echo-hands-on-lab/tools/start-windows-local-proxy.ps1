$ErrorActionPreference = "Stop"

$labRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$wslIp = ((wsl -e sh -lc "hostname -I | awk '{print `$1}'") -join "").Trim()
if ($wslIp.Contains(" ")) {
  $wslIp = $wslIp.Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)[0]
}

$ports = "5175,18081"
$existingPids = netstat -ano |
  Select-String ":5175|:18081" |
  ForEach-Object {
    if ($_ -match "\s+(\d+)$") {
      [int]$Matches[1]
    }
  } |
  Sort-Object -Unique

foreach ($existingPid in $existingPids) {
  $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
  if ($proc -and $proc.ProcessName -eq "node" -and $proc.Path -eq "C:\Program Files\nodejs\node.exe") {
    Stop-Process -Id $existingPid -Force
  }
}

New-Item -ItemType Directory -Force -Path (Join-Path $labRoot "logs") | Out-Null

$env:ORION_LAB_TARGET_HOST = $wslIp
$env:ORION_LAB_TARGET_PORT = "28081"
$env:ORION_LAB_LISTEN_HOST = "127.0.0.1"
$env:ORION_LAB_LISTEN_PORTS = $ports
$env:ORION_LAB_TARGET_TIMEOUT_MS = "2500"

$process = Start-Process `
  -FilePath "node.exe" `
  -ArgumentList @("tools\windows-local-proxy.mjs") `
  -WorkingDirectory $labRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $labRoot "logs\windows-local-proxy.out.log") `
  -RedirectStandardError (Join-Path $labRoot "logs\windows-local-proxy.err.log") `
  -PassThru

Start-Sleep -Seconds 1

[PSCustomObject]@{
  ProxyPid = $process.Id
  Target = "http://${wslIp}:28081"
  Listen = "http://127.0.0.1:5175, http://127.0.0.1:18081"
}

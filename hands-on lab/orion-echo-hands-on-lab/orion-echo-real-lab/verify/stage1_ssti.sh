#!/usr/bin/env bash
set -euo pipefail

body='body={{7*7}}'
html="$(curl -sS -X POST http://localhost:28181/ticket/preview -H 'Content-Type: application/x-www-form-urlencoded' --data "${body}")"
echo "${html}" | grep -q "49"
echo "[stage1] PASS: Jinja2 expression evaluated"

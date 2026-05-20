#!/usr/bin/env bash
set -euo pipefail

curl -sS 'http://localhost:28181/support/read?k=ldap' | grep -q 'LDAP_BIND_PW='
curl -sS 'http://localhost:28181/support/read?k=startup' | grep -q 'ldap://ldap:1389'
echo "[stage2] PASS: real evidence files are readable through the scoped support helper"

#!/usr/bin/env bash
set -euo pipefail

PW="$(grep LDAP_BIND_PW volumes/portal-data/config/ldap_creds.conf | cut -d= -f2-)"
docker run --rm --network orion-echo-real-lab_internal_net curlimages/curl:8.10.1 \
  -sS -u "operator:${PW}" http://wiki:6000/page/orion-echo-brief | grep -q 'evidence:corp-wiki-accessed'
curl -sS http://localhost:29100/status | grep -q '"stage3_wiki":true'
echo "[stage3] PASS: LDAP bind and internal wiki access verified"

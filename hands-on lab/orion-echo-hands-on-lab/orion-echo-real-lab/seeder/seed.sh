#!/usr/bin/env bash
set -euo pipefail

python /app/seed_files.py
python /app/seed_wiki.py

mkdir -p /seed/audit/portal /seed/audit/wiki
for svc in ticket-service source-repo build-server signing-service update-server customer-api customer-app object-store dark-web-drop; do
  mkdir -p "/seed/audit/${svc}" "/seed/state/${svc}"
  chown -R 10004:10004 "/seed/audit/${svc}" "/seed/state/${svc}"
  chmod -R u+rwX,go+rX "/seed/audit/${svc}" "/seed/state/${svc}"
done
mkdir -p /seed/signing
printf '%s\n' 'orion-real-lab-signing-secret-v2-file-backed' > /seed/signing/key.bin
chown -R 10004:10004 /seed/signing
chmod 0500 /seed/signing
chmod 0400 /seed/signing/key.bin
chown -R 10001:10001 /seed/audit/portal
chown -R 10002:10002 /seed/audit/wiki
chmod -R u+rwX,go+rX /seed/audit/portal /seed/audit/wiki

cat > /tmp/operator-password.ldif <<EOF
dn: uid=operator,ou=people,dc=orion,dc=echo
changetype: modify
replace: userPassword
userPassword: ${OPERATOR_PW}
EOF

ldapmodify -x -H ldap://ldap:389 -D "cn=admin,dc=orion,dc=echo" -w "${LDAP_ADMIN_PW}" -f /tmp/operator-password.ldif
echo "[seeder] complete"

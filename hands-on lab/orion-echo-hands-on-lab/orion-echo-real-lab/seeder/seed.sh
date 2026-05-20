#!/usr/bin/env bash
set -euo pipefail

python /app/seed_files.py
python /app/seed_wiki.py

cat > /tmp/operator-password.ldif <<EOF
dn: uid=operator,ou=people,dc=orion,dc=echo
changetype: modify
replace: userPassword
userPassword: ${OPERATOR_PW}
EOF

ldapmodify -x -H ldap://ldap:1389 -D "cn=admin,dc=orion,dc=echo" -w "${LDAP_ADMIN_PW}" -f /tmp/operator-password.ldif
echo "[seeder] complete"

import os
from pathlib import Path


portal = Path("/seed/portal")
(portal / "config").mkdir(parents=True, exist_ok=True)
(portal / "tickets").mkdir(parents=True, exist_ok=True)
(portal / "logs").mkdir(parents=True, exist_ok=True)

(portal / "config" / "portal.conf").write_text(
    "\n".join(
        [
            "[portal]",
            "name=orion-support",
            "version=0.4.2-real-lab",
            "workdir=/app",
            "dmz=true",
            "corp_route=ldap://ldap:389",
            "wiki_url=http://wiki:6000/page/orion-echo-brief",
            "",
        ]
    ),
    encoding="utf-8",
)

(portal / "config" / "ldap_creds.conf").write_text(
    "\n".join(
        [
            "# DO NOT COMMIT",
            "LDAP_URI=ldap://ldap:389",
            "LDAP_BIND_DN=uid=operator,ou=people,dc=orion,dc=echo",
            f"LDAP_BIND_PW={os.environ['OPERATOR_PW']}",
            "WIKI_URL=http://wiki:6000/page/orion-echo-brief",
            "",
        ]
    ),
    encoding="utf-8",
)

(portal / "tickets" / "T-2026-0517.txt").write_text(
    "\n".join(
        [
            "Subject: ANRC update anomaly",
            "Reported-by: watch@orion.echo",
            "Body: Support preview logs show unusual template expressions.",
            "Next: validate corporate wiki access with the operator LDAP account.",
            "",
        ]
    ),
    encoding="utf-8",
)

(portal / "logs" / "startup.log").write_text(
    "\n".join(
        [
            "2026-05-20T09:00:01Z support-portal boot",
            "runtime user: portal",
            "template renderer: jinja2",
            "corporate route available: ldap://ldap:389",
            "wiki target: http://wiki:6000/page/orion-echo-brief",
            "",
        ]
    ),
    encoding="utf-8",
)

(portal / "logs" / "egress.log").write_text(
    "\n".join(
        [
            "2026-05-20T09:00:04Z allowed egress ldap:389 reason=corp-directory",
            "2026-05-20T09:00:05Z allowed egress wiki:6000 reason=corp-knowledge",
            "2026-05-20T09:00:06Z denied egress internet:443 reason=external-network-blocked",
            "",
        ]
    ),
    encoding="utf-8",
)

print("[seeder] portal files written")

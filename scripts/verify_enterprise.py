import httpx


TARGETS = {
    "corp-sso": "http://corp-sso:8000/.well-known/openid-configuration",
    "intranet": "http://intranet:8000/departments",
    "hr-directory": "http://hr-directory:8000/employees",
    "doc-portal": "http://doc-portal:8000/files/architecture/update-trust-overview.md",
    "mail-web": "http://mail-web:8000/messages/msg-1001",
    "monitoring": "http://monitoring:8000/",
    "vendor-private": "http://vendor-portal:8000/releases/private",
    "c2-discovery": "http://c2-emulator:8000/discover/services",
}

VOLUME_CHECKS = {
    "employees": ("http://hr-directory:8000/employees", 40),
    "customers": ("http://vendor-portal:8000/customers", 8),
    "wiki_pages": ("http://wiki:8000/pages", 30),
    "tickets": ("http://ticket-service:8000/tickets", 80),
    "doc_files": ("http://doc-portal:8000/files", 20),
    "mail_messages": ("http://mail-web:8000/messages", 30),
    "repo_files": ("http://source-repo:8000/files", 50),
}


def main():
    for name, url in TARGETS.items():
        response = httpx.get(url, timeout=5)
        print(f"## {name} {response.status_code}")
        response.raise_for_status()
        print(response.text[:600].replace("\n", " "))
    for name, (url, minimum) in VOLUME_CHECKS.items():
        response = httpx.get(url, timeout=5)
        response.raise_for_status()
        count = response.json()["count"]
        print(f"## {name} count={count} minimum={minimum}")
        if count < minimum:
            raise SystemExit(f"{name} count {count} is below minimum {minimum}")


if __name__ == "__main__":
    main()

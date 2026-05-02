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


def main():
    for name, url in TARGETS.items():
        response = httpx.get(url, timeout=5)
        print(f"## {name} {response.status_code}")
        response.raise_for_status()
        print(response.text[:600].replace("\n", " "))


if __name__ == "__main__":
    main()

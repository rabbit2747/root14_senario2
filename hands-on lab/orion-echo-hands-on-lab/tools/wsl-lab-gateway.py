#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import http.client
import sys

LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = 18081
TARGET_HOST = "127.0.0.1"
TARGET_PORT = 28081


def rewrite_html(body: bytes) -> bytes:
    text = body.decode("utf-8", errors="replace")
    for quote in ('"', "'"):
        text = text.replace(f"href={quote}/", f"href={quote}/")
        text = text.replace(f"action={quote}/", f"action={quote}/")
        text = text.replace(f"src={quote}/", f"src={quote}/")
    return text.encode("utf-8")


class GatewayHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        self.forward()

    def do_POST(self):
        self.forward()

    def do_PUT(self):
        self.forward()

    def do_DELETE(self):
        self.forward()

    def forward(self):
        parsed = urlsplit(self.path)
        target_path = parsed.path or "/"
        if parsed.query:
            target_path += "?" + parsed.query

        length = int(self.headers.get("content-length", "0") or "0")
        request_body = self.rfile.read(length) if length else None
        headers = {
            key: value
            for key, value in self.headers.items()
            if key.lower() not in {"host", "connection", "proxy-connection", "content-length"}
        }
        headers["Host"] = f"{TARGET_HOST}:{TARGET_PORT}"
        if request_body is not None:
            headers["Content-Length"] = str(len(request_body))

        try:
            conn = http.client.HTTPConnection(TARGET_HOST, TARGET_PORT, timeout=10)
            conn.request(self.command, target_path, body=request_body, headers=headers)
            response = conn.getresponse()
            body = response.read()
            content_type = response.getheader("content-type", "")
            if "text/html" in content_type:
                body = rewrite_html(body)

            self.send_response(response.status)
            for key, value in response.getheaders():
                if key.lower() in {"content-length", "connection", "transfer-encoding"}:
                    continue
                self.send_header(key, value)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(body)
        except Exception as exc:
            body = f"Orion WSL lab gateway unavailable: {exc}\n".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(body)
        finally:
            try:
                conn.close()
            except Exception:
                pass

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))


if __name__ == "__main__":
    server = ThreadingHTTPServer((LISTEN_HOST, LISTEN_PORT), GatewayHandler)
    print(f"Orion WSL lab gateway listening on {LISTEN_HOST}:{LISTEN_PORT} -> {TARGET_HOST}:{TARGET_PORT}", flush=True)
    server.serve_forever()

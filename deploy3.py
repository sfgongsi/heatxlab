#!/usr/bin/env python3
"""Deploy with file contents using leading-slash field names + _routes.json."""

import hashlib
import json
import os
import ssl
import subprocess
import sys
import urllib.request
import io
import uuid

ssl._create_default_https_context = ssl._create_unverified_context

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "d271813319c47f80991aa9e3828f3ce5")
PROJECT_NAME = "heatxlab"
# Credentials are read from the environment. Never commit secrets to the repo.
#   export CLOUDFLARE_API_TOKEN="<your-token>"
API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
BASE_URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}"

SITE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
WORKER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_worker.js")
HEADERS = {"Authorization": f"Bearer {API_TOKEN}"}

ROUTES_JSON = json.dumps({
    "version": 1,
    "include": ["/api/*"],
    "exclude": []
})


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def build_manifest():
    manifest = {}
    for root, dirs, files in os.walk(SITE_DIR):
        for fname in files:
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, SITE_DIR)
            key = "/" + rel.replace(os.sep, "/")
            manifest[key] = sha256_file(fpath)
    return manifest


def create_deployment(manifest):
    boundary = uuid.uuid4().hex
    body = io.BytesIO()

    def add_field(name, value, content_type=None, filename=None):
        body.write(f"--{boundary}\r\n".encode())
        disposition = f'Content-Disposition: form-data; name="{name}"'
        if filename:
            disposition += f'; filename="{filename}"'
        body.write(f"{disposition}\r\n".encode())
        if content_type:
            body.write(f"Content-Type: {content_type}\r\n".encode())
        body.write(b"\r\n")
        body.write(value if isinstance(value, bytes) else value.encode())
        body.write(b"\r\n")

    def add_file(name, path, content_type="application/octet-stream"):
        with open(path, "rb") as f:
            data = f.read()
        body.write(f"--{boundary}\r\n".encode())
        body.write(
            f'Content-Disposition: form-data; name="{name}"; '
            f'filename="{os.path.basename(path)}"\r\n'.encode()
        )
        body.write(f"Content-Type: {content_type}\r\n\r\n".encode())
        body.write(data)
        body.write(b"\r\n")

    # manifest
    add_field("manifest", json.dumps(manifest), "application/json")
    # branch
    add_field("branch", "main")
    # _routes.json - only invoke worker for /api/* routes
    add_field("_routes.json", ROUTES_JSON, "application/json")
    # _worker.js
    add_file("_worker.js", WORKER_PATH, "application/javascript")
    print(f"  _worker.js: {os.path.getsize(WORKER_PATH)} bytes")

    # All static files - field name is the path WITH leading slash
    total = 0
    count = 0
    for root, dirs, files in os.walk(SITE_DIR):
        for fname in files:
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, SITE_DIR)
            field_name = "/" + rel.replace(os.sep, "/")
            with open(fpath, "rb") as f:
                data = f.read()
            total += len(data)
            count += 1
            body.write(f"--{boundary}\r\n".encode())
            body.write(
                f'Content-Disposition: form-data; name="{field_name}"; '
                f'filename="{fname}"\r\n'.encode()
            )
            body.write(b"Content-Type: application/octet-stream\r\n\r\n")
            body.write(data)
            body.write(b"\r\n")

    body.write(f"--{boundary}--\r\n".encode())
    body_bytes = body.getvalue()
    print(f"  {count} files, {len(body_bytes)} bytes total")

    req = urllib.request.Request(
        f"{BASE_URL}/deployments",
        data=body_bytes,
        headers={**HEADERS, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            result = json.loads(resp.read())
            if result.get("success"):
                d = result["result"]
                print(f"\n  Deployment created!")
                print(f"  ID: {d['id']}")
                print(f"  URL: {d.get('url','')}")
                print(f"  Uses functions: {d.get('uses_functions','N/A')}")
                return d
            else:
                print(f"\n  Failed: {json.dumps(result.get('errors',[]), indent=2)}")
                return None
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"\n  HTTP {e.code}: {err[:500]}")
        return None
    except Exception as e:
        print(f"\n  Error: {e}")
        return None


def verify(url):
    import time
    time.sleep(3)
    print(f"\n=== Verification ===")
    # Check index.html
    r = subprocess.run(["curl", "-sL", "-o", "/dev/null", "-w", "%{http_code} %{size_download}",
                        f"{url}/"], capture_output=True, text=True)
    print(f"  index.html: HTTP {r.stdout.strip()}")

    # Check hero image
    subprocess.run(["curl", "-sL", "-o", "/tmp/hero_v3.jpg", f"{url}/assets/hero-1-v2.jpg"],
                   capture_output=True)
    sz = os.path.getsize("/tmp/hero_v3.jpg") if os.path.exists("/tmp/hero_v3.jpg") else 0
    h = subprocess.run(["shasum", "-a", "256", "/tmp/hero_v3.jpg"],
                       capture_output=True, text=True).stdout.split()[0] if sz > 0 else "empty"
    expected = "37869fe9f54b11a606ca30f5ab45c219e07aced45fa48bdf306fb742053a3353"
    print(f"  hero-1-v2.jpg: {sz} bytes, hash={h[:20]}...")
    print(f"  Expected: {expected[:20]}...")
    print(f"  MATCH: {h == expected}")

    # Check API
    r = subprocess.run(["curl", "-s", "-w", "\nHTTP %{http_code}",
                        f"{url}/api/orders?order_id=test&email=test@test.com"],
                       capture_output=True, text=True)
    print(f"  API: {r.stdout.strip()}")


def main():
    print("=== Build manifest ===")
    manifest = build_manifest()
    print(f"  {len(manifest)} files")

    print("\n=== Create deployment ===")
    d = create_deployment(manifest)

    if d:
        verify(d.get("url", ""))
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()

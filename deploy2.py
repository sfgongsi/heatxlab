#!/usr/bin/env python3
"""Deploy with file contents included directly in the deployment request."""

import hashlib
import json
import os
import ssl
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
    """Create deployment with manifest, _worker.js, and ALL file contents as form-data."""
    boundary = uuid.uuid4().hex
    body = io.BytesIO()

    # manifest field
    manifest_json = json.dumps(manifest)
    body.write(f"--{boundary}\r\n".encode())
    body.write(
        b'Content-Disposition: form-data; name="manifest"\r\n'
        b'Content-Type: application/json\r\n\r\n'
    )
    body.write(manifest_json.encode())
    body.write(b"\r\n")

    # branch field
    body.write(f"--{boundary}\r\n".encode())
    body.write(b'Content-Disposition: form-data; name="branch"\r\n\r\nmain\r\n')

    # _worker.js file
    with open(WORKER_PATH, "rb") as f:
        worker_data = f.read()
    body.write(f"--{boundary}\r\n".encode())
    body.write(
        b'Content-Disposition: form-data; name="_worker.js"; filename="_worker.js"\r\n'
        b'Content-Type: application/javascript\r\n\r\n'
    )
    body.write(worker_data)
    body.write(b"\r\n")
    print(f"  _worker.js: {len(worker_data)} bytes")

    # All static files as form-data fields
    total_size = 0
    file_count = 0
    for root, dirs, files in os.walk(SITE_DIR):
        for fname in files:
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, SITE_DIR)
            field_name = rel.replace(os.sep, "/")
            with open(fpath, "rb") as f:
                file_data = f.read()
            total_size += len(file_data)
            file_count += 1
            body.write(f"--{boundary}\r\n".encode())
            body.write(
                f'Content-Disposition: form-data; name="{field_name}"; '
                f'filename="{fname}"\r\n'.encode()
            )
            body.write(b"Content-Type: application/octet-stream\r\n\r\n")
            body.write(file_data)
            body.write(b"\r\n")

    body.write(f"--{boundary}--\r\n".encode())
    body_bytes = body.getvalue()
    print(f"  Total: {file_count} files, {len(body_bytes)} bytes request body")

    req = urllib.request.Request(
        f"{BASE_URL}/deployments",
        data=body_bytes,
        headers={
            **HEADERS,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
            if result.get("success"):
                d = result["result"]
                print(f"\n  Deployment created!")
                print(f"  ID: {d['id']}")
                print(f"  URL: {d.get('url', 'N/A')}")
                print(f"  Environment: {d.get('environment', 'N/A')}")
                print(f"  Uses functions: {d.get('uses_functions', 'N/A')}")
                return d
            else:
                print(f"\n  Failed: {json.dumps(result.get('errors', []), indent=2)}")
                return None
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"\n  HTTP {e.code}: {err[:500]}")
        try:
            ej = json.loads(err)
            print(f"  Errors: {json.dumps(ej.get('errors', []), indent=2)}")
        except:
            pass
        return None
    except Exception as e:
        print(f"\n  Error: {e}")
        return None


def main():
    print("=== Build manifest ===")
    manifest = build_manifest()
    print(f"  {len(manifest)} files")

    print("\n=== Create deployment (with file contents) ===")
    d = create_deployment(manifest)

    if d:
        url = d.get("url", "N/A")
        print(f"\n=== Success ===")
        print(f"  Preview URL: {url}")
        # Check image
        import subprocess
        result = subprocess.run(
            ["curl", "-sL", "-o", "/tmp/hero_verify.jpg", f"{url}/assets/hero-1-v2.jpg"],
            capture_output=True
        )
        new_hash = subprocess.run(
            ["shasum", "-a", "256", "/tmp/hero_verify.jpg"],
            capture_output=True, text=True
        ).stdout.split()[0]
        att_hash = "37869fe9f54b11a606ca30f5ab45c219e07aced45fa48bdf306fb742053a3353"
        if new_hash == att_hash:
            print(f"  Hero image: MATCHED (correct attachment)")
        else:
            print(f"  Hero image: hash={new_hash[:20]}... (expected {att_hash[:20]}...)")
            import os as os2
            sz = os2.path.getsize("/tmp/hero_verify.jpg") if os2.path.exists("/tmp/hero_verify.jpg") else 0
            print(f"  Hero image size: {sz} bytes")
    else:
        print("\n=== Failed ===")
        sys.exit(1)


if __name__ == "__main__":
    main()

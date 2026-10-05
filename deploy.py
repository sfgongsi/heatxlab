#!/usr/bin/env python3
"""Build manifest, upload assets, and create a new Cloudflare Pages deployment."""

import hashlib
import json
import os
import ssl
import sys
import urllib.request
import urllib.parse
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

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
}


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
            file_hash = sha256_file(fpath)
            file_size = os.path.getsize(fpath)
            manifest[key] = file_hash
            print(f"  {key} -> {file_hash[:16]}... ({file_size} bytes)")
    return manifest


def upload_assets(manifest):
    """Upload files that might not exist on Cloudflare yet."""
    # Cloudflare's upload-assets endpoint accepts a multipart/form-data request.
    # We upload files in batches to stay within limits.
    BATCH_SIZE = 10
    entries = list(manifest.items())

    for i in range(0, len(entries), BATCH_SIZE):
        batch = entries[i:i + BATCH_SIZE]
        boundary = uuid.uuid4().hex
        body = io.BytesIO()

        for path, info in batch:
            file_path = os.path.join(SITE_DIR, path.lstrip("/"))
            with open(file_path, "rb") as f:
                file_data = f.read()

            body.write(f"--{boundary}\r\n".encode())
            body.write(
                f'Content-Disposition: form-data; name="{path[1:]}"; '
                f'filename="{os.path.basename(path)}"\r\n'.encode()
            )
            body.write(b"Content-Type: application/octet-stream\r\n\r\n")
            body.write(file_data)
            body.write(b"\r\n")

        body.write(f"--{boundary}--\r\n".encode())
        body_bytes = body.getvalue()

        req = urllib.request.Request(
            f"{BASE_URL}/upload-assets",
            data=body_bytes,
            headers={
                **HEADERS,
                "Content-Type": f"multipart/form-data; boundary={boundary}",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read())
                if result.get("success"):
                    uploaded = result.get("result", [])
                    skipped = [f for f in uploaded if isinstance(f, dict) and f.get("already_exists")]
                    new = [f for f in uploaded if isinstance(f, dict) and not f.get("already_exists")]
                    print(f"  Batch {i//BATCH_SIZE + 1}: {len(new)} new, {len(skipped)} already exist")
                else:
                    print(f"  Batch {i//BATCH_SIZE + 1}: {result.get('errors', [])}")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            print(f"  Batch {i//BATCH_SIZE + 1}: HTTP {e.code} - {err_body[:200]}")
        except Exception as e:
            print(f"  Batch {i//BATCH_SIZE + 1}: Error - {e}")


def create_deployment(manifest):
    """Create a new Pages deployment with manifest and _worker.js."""

    # Build the multipart form data
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
    body.write(
        b'Content-Disposition: form-data; name="branch"\r\n\r\n'
        b"main"
    )
    body.write(b"\r\n")

    # _worker.js file
    if os.path.exists(WORKER_PATH):
        with open(WORKER_PATH, "rb") as f:
            worker_data = f.read()
        body.write(f"--{boundary}\r\n".encode())
        body.write(
            b'Content-Disposition: form-data; name="_worker.js"; filename="_worker.js"\r\n'
            b'Content-Type: application/javascript\r\n\r\n'
        )
        body.write(worker_data)
        body.write(b"\r\n")
        print(f"  Including _worker.js ({len(worker_data)} bytes)")

    body.write(f"--{boundary}--\r\n".encode())
    body_bytes = body.getvalue()

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
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            if result.get("success"):
                deployment = result["result"]
                print(f"\n  Deployment created!")
                print(f"  ID: {deployment['id']}")
                print(f"  URL: {deployment.get('url', 'N/A')}")
                print(f"  Environment: {deployment.get('environment', 'N/A')}")
                aliases = deployment.get("aliases", [])
                if aliases:
                    print(f"  Aliases: {', '.join(aliases)}")
                return deployment
            else:
                print(f"\n  Deployment failed: {json.dumps(result.get('errors', []), indent=2)}")
                return None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"\n  HTTP {e.code}: {err_body[:500]}")
        try:
            err_json = json.loads(err_body)
            print(f"  Errors: {json.dumps(err_json.get('errors', []), indent=2)}")
        except:
            pass
        return None
    except Exception as e:
        print(f"\n  Error: {e}")
        return None


def main():
    print("=== Step 1: Build manifest ===")
    manifest = build_manifest()
    print(f"Total files: {len(manifest)}")

    print("\n=== Step 2: Upload assets ===")
    upload_assets(manifest)

    print("\n=== Step 3: Create deployment ===")
    deployment = create_deployment(manifest)

    if deployment:
        print("\n=== Done ===")
        print(f"Deployment URL: {deployment.get('url', 'N/A')}")
    else:
        print("\n=== Deployment failed ===")
        sys.exit(1)


if __name__ == "__main__":
    main()

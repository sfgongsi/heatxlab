#!/usr/bin/env python3
import os, subprocess, hashlib, json, re, sys
from urllib.parse import urljoin, urlparse, urlunparse

BASE = "https://heatxlab.com"
OUT = os.path.dirname(os.path.abspath(__file__))
HOSTS = {"heatxlab.com", "www.heatxlab.com", "heatxlab.pages.dev"}
VISITED = set()      # urls fetched
QUEUE = ["https://heatxlab.com/", "https://heatxlab.com/robots.txt", "https://heatxlab.com/sitemap.xml"]
MANIFEST = {}

def is_local(url):
    try:
        p = urlparse(url)
    except Exception:
        return False
    if p.scheme not in ("http", "https", ""):
        return False
    if p.scheme == "" :
        return True  # relative
    return p.netloc in HOSTS

def url_to_path(url):
    # absolute or relative -> normalized absolute on BASE
    absu = urljoin(BASE + "/", url)
    p = urlparse(absu)
    path = p.path
    if path == "" or path == "/":
        path = "/index.html"
    # strip leading slash for local storage
    local = path.lstrip("/")
    if local == "":
        local = "index.html"
    # directories ending with / -> index.html
    if local.endswith("/"):
        local = local + "index.html"
    # if no extension and not a known page, append index.html
    return absu, local

def fetch(url):
    absu, local = url_to_path(url)
    if absu in VISITED:
        return None
    VISITED.add(absu)
    lp = os.path.join(OUT, local)
    os.makedirs(os.path.dirname(lp), exist_ok=True)
    try:
        r = subprocess.run(["curl", "-s", "-A", "Mozilla/5.0 crawl", "--max-time", "60", absu],
                           capture_output=True)
        data = r.stdout
    except Exception as e:
        print("FETCH ERR", absu, e, file=sys.stderr)
        return None
    if not data:
        print("EMPTY", absu, file=sys.stderr)
        return None
    with open(lp, "wb") as f:
        f.write(data)
    h = hashlib.sha256(data).hexdigest()
    MANIFEST[local] = {"hash": h, "size": len(data)}
    print(f"GOT {local} ({len(data)}b) {h[:12]}")
    return data

def parse_refs(data, base_url):
    text = data.decode("utf-8", errors="replace")
    refs = set()
    # HTML attributes
    for m in re.finditer(r'(?:href|src|content|data-src|data-background)\s*=\s*"([^"]+)"', text, re.I):
        refs.add(m.group(1))
    for m in re.finditer(r"(?:href|src|content|data-src|data-background)\s*=\s*'([^']+)'", text, re.I):
        refs.add(m.group(1))
    # srcset
    for m in re.finditer(r'srcset\s*=\s*"([^"]+)"', text, re.I):
        for part in m.group(1).split(","):
            refs.add(part.strip().split()[0])
    # inline style url()
    for m in re.finditer(r"url\((['\"]?)([^)'\"]+)\1\)", text, re.I):
        refs.add(m.group(2))
    # CSS url() (also covers css files)
    return refs, text

def parse_css_refs(text):
    refs = set()
    for m in re.finditer(r"url\((['\"]?)([^)'\"]+)\1\)", text, re.I):
        refs.add(m.group(2))
    return refs

def is_html(local):
    return local.endswith(".html") or local.endswith(".htm") or local == "index.html"

def is_css(local):
    return local.endswith(".css")

def is_text(local):
    return local.endswith((".html",".htm",".css",".js",".xml",".txt",".json",".svg"))

def main():
    while QUEUE:
        url = QUEUE.pop(0)
        absu, local = url_to_path(url)
        if absu in VISITED:
            continue
        data = fetch(url)
        if data is None:
            continue
        if is_text(local):
            refs, text = parse_refs(data, absu)
            if is_css(local):
                refs = parse_css_refs(text)
            for ref in refs:
                if ref.startswith("data:"):
                    continue
                if ref.startswith("#") or ref.startswith("mailto:") or ref.startswith("tel:"):
                    continue
                # resolve relative to current page dir
                page_dir = absu.rsplit("/", 1)[0] + "/"
                ru = urljoin(page_dir, ref)
                if not is_local(ru):
                    continue
                rabs, rlocal = url_to_path(ru)
                # strip query/fragment
                rp = urlparse(rabs)
                rabs = urlunparse((rp.scheme, rp.netloc, rp.path, "", "", ""))
                rabs2, rlocal2 = url_to_path(rabs)
                if rabs2 not in VISITED:
                    QUEUE.append(rabs)
            # follow links to other html pages
            if is_html(local):
                for ref in refs:
                    if ref.startswith(("#","mailto:","tel:","data:")):
                        continue
                    page_dir = absu.rsplit("/", 1)[0] + "/"
                    ru = urljoin(page_dir, ref)
                    if not is_local(ru):
                        continue
                    rp = urlparse(ru)
                    rabs = urlunparse((rp.scheme, rp.netloc, rp.path, "", "", ""))
                    rabs2, rlocal2 = url_to_path(rabs)
                    if rlocal2.endswith(".html") and rabs2 not in VISITED:
                        QUEUE.append(rabs)
    # also scan JS files for asset string refs
    for local in list(MANIFEST.keys()):
        if local.endswith(".js"):
            lp = os.path.join(OUT, local)
            try:
                with open(lp, "r", encoding="utf-8", errors="replace") as f:
                    jtext = f.read()
            except Exception:
                continue
            for m in re.finditer(r"['\"]([^'\"]*\.(?:jpg|jpeg|png|webp|gif|svg|css|js|json|html))['\"]", jtext, re.I):
                ref = m.group(1)
                ru = urljoin(BASE + "/", ref)
                if not is_local(ru):
                    continue
                rabs, rlocal = url_to_path(ru)
                rp = urlparse(rabs)
                rabs = urlunparse((rp.scheme, rp.netloc, rp.path, "", "", ""))
                if rlocal not in MANIFEST and rabs not in VISITED:
                    QUEUE.append(rabs)
    # second pass for newly discovered
    while QUEUE:
        url = QUEUE.pop(0)
        absu, local = url_to_path(url)
        if absu in VISITED:
            continue
        data = fetch(url)
    # write manifest
    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(MANIFEST, f, indent=2, sort_keys=True)
    print(f"\nTOTAL {len(MANIFEST)} files")
    for k in sorted(MANIFEST):
        print(" ", k)

if __name__ == "__main__":
    main()

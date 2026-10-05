#!/usr/bin/env python3
import os, subprocess, hashlib, json, re, sys
from urllib.parse import urljoin, urlparse, urlunparse

BASE = "https://heatxlab.com"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
os.makedirs(OUT, exist_ok=True)
HOSTS = {"heatxlab.com", "www.heatxlab.com", "heatxlab.pages.dev"}
VISITED = set()
QUEUE = ["https://heatxlab.com/", "https://heatxlab.com/robots.txt", "https://heatxlab.com/sitemap.xml"]
MANIFEST = {}
EXTS = (".html",".htm",".css",".js",".json",".xml",".txt",".svg",".jpg",".jpeg",".png",".webp",".gif",".ico",".woff",".woff2",".ttf",".otf",".eot",".mp4",".webm",".pdf")

def looks_like_path(ref):
    if not ref or ref.startswith(("data:","mailto:","tel:","javascript:","#")):
        return False
    if " " in ref or "${" in ref or "<" in ref:
        return False
    # absolute url
    if ref.startswith(("http://","https://")):
        return is_local(ref)
    # must look like a path: has a slash, or ends with extension, or root
    if ref.startswith(("/","./","../")):
        return True
    # bare filename with extension
    if "." in ref.split("/")[-1]:
        seg = ref.split("/")[-1]
        return any(seg.lower().endswith(e) for e in EXTS)
    return False

def is_local(url):
    try:
        p = urlparse(url)
    except Exception:
        return False
    if p.scheme not in ("http","https",""):
        return False
    if p.scheme == "":
        return True
    return p.netloc.replace("www.","") in HOSTS

def url_to_path(url):
    absu = urljoin(BASE + "/", url)
    p = urlparse(absu)
    path = p.path
    if path == "" or path == "/":
        path = "/index.html"
    local = path.lstrip("/")
    if local == "":
        local = "index.html"
    if local.endswith("/"):
        local = local + "index.html"
    return absu, local

def clean_url(url):
    p = urlparse(url)
    return urlunparse((p.scheme, p.netloc, p.path, "", "", ""))

def fetch(url):
    absu, local = url_to_path(url)
    absu_clean = clean_url(absu)
    key = absu_clean
    if key in VISITED:
        return None
    VISITED.add(key)
    lp = os.path.join(OUT, local)
    os.makedirs(os.path.dirname(lp), exist_ok=True)
    try:
        r = subprocess.run(["curl","-sL","-A","Mozilla/5.0","--max-time","90",absu_clean],
                           capture_output=True)
        data = r.stdout
    except Exception as e:
        print("FETCH ERR", absu_clean, e, file=sys.stderr); return None
    if not data:
        print("EMPTY", absu_clean, file=sys.stderr); return None
    with open(lp,"wb") as f:
        f.write(data)
    h = hashlib.sha256(data).hexdigest()
    MANIFEST[local] = {"hash": h, "size": len(data)}
    print(f"GOT {local} ({len(data)}b) {h[:10]}")
    return data

def extract_refs(text, is_css):
    refs = set()
    if is_css:
        for m in re.finditer(r"url\(\s*(['\"]?)([^)'\"]+?)\1\s*\)", text, re.I):
            refs.add(m.group(2))
        return refs
    # HTML attributes (only meaningful ones)
    for m in re.finditer(r'(?:href|src|data-src|poster)\s*=\s*"([^"]+)"', text, re.I):
        refs.add(m.group(1))
    for m in re.finditer(r"(?:href|src|data-src|poster)\s*=\s*'([^']+)'", text, re.I):
        refs.add(m.group(1))
    # og:image / twitter:image / canonical only
    for m in re.finditer(r'<meta[^>]+(?:property|name)="(?:og:image|og:image:url|twitter:image|og:url|og:audio|og:video)"[^>]+content="([^"]+)"', text, re.I):
        refs.add(m.group(1))
    for m in re.finditer(r'content="([^"]+)"[^>]+(?:property|name)="(?:og:image|og:image:url|twitter:image|og:url)"', text, re.I):
        refs.add(m.group(1))
    # srcset
    for m in re.finditer(r'srcset\s*=\s*"([^"]+)"', text, re.I):
        for part in m.group(1).split(","):
            refs.add(part.strip().split()[0])
    # inline style + css url()
    for m in re.finditer(r"url\(\s*(['\"]?)([^)'\"]+?)\1\s*\)", text, re.I):
        refs.add(m.group(2))
    return refs

def main():
    while QUEUE:
        url = QUEUE.pop(0)
        absu, local = url_to_path(url)
        if clean_url(absu) in VISITED:
            continue
        data = fetch(url)
        if data is None:
            continue
        is_css = local.endswith(".css")
        is_html = local.endswith((".html",".htm")) or local == "index.html"
        if is_css or is_html:
            text = data.decode("utf-8", errors="replace")
            refs = extract_refs(text, is_css)
            page_dir = clean_url(absu).rsplit("/",1)[0] + "/"
            newq = set()
            for ref in refs:
                if not looks_like_path(ref):
                    continue
                if ref.startswith("#"):
                    continue
                ru = urljoin(page_dir, ref)
                if not is_local(ru):
                    continue
                rc = clean_url(ru)
                rabs, rlocal = url_to_path(ru)
                # skip url(#frag)
                if urlparse(rc).path == "" and urlparse(rc).fragment:
                    continue
                newq.add(rc)
            # for html, also follow page links
            for q in newq:
                if q not in VISITED:
                    QUEUE.append(q)
        # JS asset discovery
        if local.endswith(".js"):
            text = data.decode("utf-8", errors="replace")
            page_dir = clean_url(absu).rsplit("/",1)[0] + "/"
            for m in re.finditer(r"['\"]([^'\"]*\.(?:jpg|jpeg|png|webp|gif|svg|css|js|json|html?))['\"]", text, re.I):
                ref = m.group(1)
                if not looks_like_path(ref):
                    continue
                ru = urljoin(BASE + "/", ref)
                if not is_local(ru):
                    continue
                rc = clean_url(ru)
                if rc not in VISITED:
                    QUEUE.append(rc)
    # sitemap urls
    sm = os.path.join(OUT,"sitemap.xml")
    if os.path.exists(sm):
        with open(sm, encoding="utf-8", errors="replace") as f:
            st = f.read()
        for m in re.finditer(r"<loc>([^<]+)</loc>", st, re.I):
            u = m.group(1).strip()
            if is_local(u):
                rc = clean_url(u)
                if rc not in VISITED:
                    QUEUE.append(rc)
    while QUEUE:
        url = QUEUE.pop(0)
        absu, local = url_to_path(url)
        if clean_url(absu) in VISITED:
            continue
        fetch(url)
    with open(os.path.join(os.path.dirname(OUT), "manifest.json"),"w") as f:
        json.dump(MANIFEST, f, indent=2, sort_keys=True)
    print(f"\nTOTAL {len(MANIFEST)} files")
    for k in sorted(MANIFEST):
        print("  ", k)

if __name__ == "__main__":
    main()

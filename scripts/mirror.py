#!/usr/bin/env python3
"""Reproducible mirror of Kyte's publicly published Framer website."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlsplit, urljoin
import hashlib
import html
import json
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
CACHE = ROOT / '.cache'
ORIGIN = 'https://kytenewwebsite.framer.website'
HOSTS = {'framerusercontent.com', 'fonts.gstatic.com', 'unpkg.com', 'bucket-goodface-dev.s3.eu-central-1.amazonaws.com'}
URL_RE = re.compile(r'https?://[^\s"\x27<>`\\\)]+')
MODULE_RE = re.compile(r'["\x27`](\.?\.?/[^"\x27`\s]+\.(?:mjs|js|css)(?:\?[^"\x27`\s]*)?)["\x27`]')
CMS_RE = re.compile(r'new URL\([`"\x27]([^`"\x27]+\.framercms)[`"\x27],\s*[`"\x27](https://[^`"\x27]+)[`"\x27]\)')

def destination(url):
    u = urlsplit(url)
    if u.netloc == urlsplit(ORIGIN).netloc:
        return PUBLIC / u.path.strip('/') / 'index.html'
    p = Path('assets') / u.netloc / u.path.lstrip('/')
    if u.query:
        p = p.with_name(p.stem + '--' + hashlib.sha256(u.query.encode()).hexdigest()[:12] + p.suffix)
    return PUBLIC / p

def fetch(url):
    cache = CACHE / hashlib.sha256(url.encode()).hexdigest()
    if not cache.exists():
        tmp = cache.with_suffix('.part')
        proc = subprocess.run(['curl', '-sS', '-L', '--fail', '--retry', '2', '--connect-timeout', '20', '--max-time', '180', url, '-o', str(tmp)], capture_output=True)
        if proc.returncode:
            return url, None, proc.stderr.decode()[-500:]
        tmp.replace(cache)
    return url, cache.read_bytes(), None

def is_text(url):
    return urlsplit(url).netloc == urlsplit(ORIGIN).netloc or Path(urlsplit(url).path).suffix in {'.mjs','.js','.css','.json','.svg'}

def assets(text, base):
    result = set()
    for raw in URL_RE.findall(text):
        url = html.unescape(raw).replace('\\u0026', '&')
        if urlsplit(url).netloc in HOSTS and '${' not in url and urlsplit(url).path not in {'', '/', '/s/'}:
            result.add(url)
    if urlsplit(base).path.endswith(('.mjs','.js','.css')):
        result.update(urljoin(base, rel) for rel in MODULE_RE.findall(text) if 'node_modules/' not in rel)
        result.update(urljoin(origin, rel).replace('/modules/', '/cms/') for rel, origin in CMS_RE.findall(text))
    return result

def main():
    CACHE.mkdir(exist_ok=True)
    PUBLIC.mkdir(exist_ok=True)
    sitemap = subprocess.check_output(['curl','-sS','-L','--fail', ORIGIN + '/sitemap.xml'])
    pages = [e.text for e in ET.fromstring(sitemap).iter() if e.tag.endswith('loc')]
    pending, done, failures = set(pages), {}, {}
    with ThreadPoolExecutor(max_workers=12) as pool:
        while pending:
            batch = pending - done.keys() - failures.keys()
            pending = set()
            if not batch:
                break
            print(f'Downloading {len(batch)} resources ({len(done)} already saved)', flush=True)
            for future in as_completed([pool.submit(fetch, url) for url in sorted(batch)]):
                url, data, error = future.result()
                if error:
                    failures[url] = error
                    print(f'FAILED {url}: {error}', flush=True)
                    continue
                done[url] = data
                if is_text(url):
                    pending.update(assets(data.decode('utf-8', errors='replace'), url))
                elif url.endswith('.framercms'):
                    # Discover URL strings without changing the binary file's byte offsets.
                    for raw in re.findall(rb'https://[A-Za-z0-9/?=&%._~:@+#!-]+', data):
                        asset = raw.decode()
                        if urlsplit(asset).netloc in HOSTS:
                            pending.add(asset)
    def rewrite(match):
        raw = match.group()
        url = html.unescape(raw)
        return '/' + destination(url).relative_to(PUBLIC).as_posix() if url in done else raw
    for url, data in done.items():
        target = destination(url)
        target.parent.mkdir(parents=True, exist_ok=True)
        if is_text(url):
            text = URL_RE.sub(rewrite, data.decode('utf-8'))
            if urlsplit(url).path.endswith(('.mjs', '.js')):
                # URL constructors require an absolute base, even when assets are local.
                text = re.sub(r'(new URL\([`"\x27][^`"\x27]+[`"\x27],\s*)([`"\x27])(/assets/[^`"\x27]+)\2', r'\1globalThis.location.origin+\2\3\2', text)
                # Rewrite decoded CMS strings, preserving the original binary indexes.
                text = text.replace('return e.textDecoder.decode(n)', 'return globalThis.__kyteLocalize(e.textDecoder.decode(n))')
            if url in pages:
                # The live site resolves ./ links from the origin, including on nested routes.
                text = text.replace('<head>', '<head>\n<base href="/">\n<script src="/local-assets.js"></script>', 1)
                text = re.sub(r'<script\b[^>]*src="https://events\.framer\.com/[^>]*>\s*</script>', '', text)
                text = text.replace('href="' + ORIGIN + '/', 'href="/')
            data = text.encode()
        target.write_bytes(data)
    mapping = {url: '/' + destination(url).relative_to(PUBLIC).as_posix() for url in done if urlsplit(url).netloc in HOSTS}
    (PUBLIC / 'local-assets.js').write_text('/* Resolve published CMS media to local files. */\n(() => {\nconst assets = ' + json.dumps(mapping, separators=(',', ':')) + ';\nglobalThis.__kyteLocalize = value => value.replace(/https:\\/\\/[^\\s"\x27<>`\\\\)]+/g, url => assets[url] || url);\n})();\n')
    manifest = {'source': ORIGIN, 'pages': pages, 'resource_count': len(done), 'bytes': sum(len(d) for d in done.values()), 'failures': failures, 'resources': {url: '/' + destination(url).relative_to(PUBLIC).as_posix() for url in sorted(done)}}
    (ROOT / 'mirror-manifest.json').write_text(json.dumps(manifest, indent=2))
    print(f'Complete: {len(pages)} pages, {len(done)} resources, {manifest["bytes"] / 1024 / 1024:.1f} MB, {len(failures)} failures', flush=True)

if __name__ == '__main__':
    main()

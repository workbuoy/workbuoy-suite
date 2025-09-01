#!/usr/bin/env python3
import os, sys, json, hashlib, glob, time
from datetime import datetime

def sha256_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest(), os.path.getsize(p)

def main():
    manifest_path = os.environ.get('RELEASE_MANIFEST', 'release_manifest.json')
    out_dir = os.environ.get('SEAL_OUT', 'reports')
    repo_root = os.getcwd()
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    version = manifest.get('version', 'v1')
    paths = manifest.get('paths', [])
    entries = []
    missing = []
    for p in paths:
        if not os.path.exists(p):
            missing.append(p)
            continue
        h, sz = sha256_file(p)
        entries.append({"path": p, "sha256": h, "bytes": sz})
    agg = hashlib.sha256()
    for e in sorted(entries, key=lambda x: x['path']):
        agg.update((e['path']+':'+e['sha256']).encode('utf-8'))
    seal = {
        "version": version,
        "created_at": datetime.utcnow().isoformat() + 'Z',
        "git_sha": os.environ.get('GITHUB_SHA', ''),
        "entries": entries,
        "aggregate_sha256": agg.hexdigest(),
        "missing": missing
    }
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'seal.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(seal, f, indent=2)
    print(out_path)
    if missing:
        print("WARNING: missing files:", file=sys.stderr)
        for m in missing: print(m, file=sys.stderr)

if __name__ == "__main__":
    main()

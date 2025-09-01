#!/usr/bin/env python3
import os, sys, json, hashlib, time, glob

GLOBS = [
  "docs/**/*.md",
  "grafana/dashboards/**/*.json",
  "ops/alerts/**/*.yaml",
  "alertmanager/**/*.yaml",
  ".github/workflows/**/*.yml",
  "connectors/**/mapping.yaml",
  "connectors/**/package.json",
  "desktop/**/package.json",
  "scripts/**/*.js",
  "scripts/**/*.sh",
  "scripts/**/*.ps1",
]

def sha256_file(p):
  h = hashlib.sha256()
  with open(p, "rb") as f:
    for chunk in iter(lambda: f.read(8192), b""):
      h.update(chunk)
  return h.hexdigest()

def main():
  root = os.getcwd()
  files = []
  for pattern in GLOBS:
    for p in glob.glob(pattern, recursive=True):
      if os.path.isfile(p):
        files.append(p)

  files = sorted(set(files))
  entries = []
  for p in files:
    try:
      st = os.stat(p)
      entries.append({
        "path": p,
        "size": st.st_size,
        "mtime": int(st.st_mtime),
        "sha256": sha256_file(p)
      })
    except FileNotFoundError:
      continue

  manifest = {
    "created_at": int(time.time()),
    "files": entries,
    "summary": {
      "count": len(entries),
      "total_size": sum(e["size"] for e in entries)
    }
  }
  seal_dir = "reports"
  os.makedirs(seal_dir, exist_ok=True)
  with open(os.path.join(seal_dir, "seal.json"), "w") as f:
    json.dump(manifest, f, indent=2)

  # Also emit sha256sum list
  with open(os.path.join(seal_dir, "seal.SHA256SUMS"), "w") as f:
    for e in entries:
      f.write(f"{e['sha256']}  {e['path']}\n")

  print(json.dumps(manifest["summary"], indent=2))

if __name__ == "__main__":
  main()

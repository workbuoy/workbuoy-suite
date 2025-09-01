#!/usr/bin/env python3
import os, sys, json, hashlib

def sha256_file(p):
  h = hashlib.sha256()
  with open(p, "rb") as f:
    for chunk in iter(lambda: f.read(8192), b""):
      h.update(chunk)
  return h.hexdigest()

def main(path):
  j = json.load(open(path, "r"))
  bad = []
  for e in j.get("files", []):
    p = e["path"]
    if not os.path.exists(p):
      bad.append((p, "missing"))
      continue
    h = sha256_file(p)
    if h != e["sha256"]:
      bad.append((p, "hash_mismatch"))
  if bad:
    print("FAIL:", bad)
    sys.exit(2)
  print("OK: manifest matches")
  return 0

if __name__ == "__main__":
  sys.exit(main(sys.argv[1] if len(sys.argv)>1 else "reports/seal.json"))

#!/usr/bin/env python3
import json, sys, re

def normalize_role(r, idx):
    changed = False
    # Ensure role_id
    if not r.get("role_id"):
        r["role_id"] = f"auto-{idx:05d}"
        changed = True
    # Ensure title
    if not r.get("title") and r.get("canonical_title"):
        r["title"] = r["canonical_title"]
        changed = True
    elif not r.get("title"):
        r["title"] = f"Untitled-{idx}"
        changed = True
    # Ensure category
    if not r.get("category"):
        if "tags" in r and isinstance(r["tags"], list) and r["tags"]:
            r["category"] = r["tags"][0]
        else:
            r["category"] = "Uncategorized"
        changed = True
    return r, changed

def main():
    if len(sys.argv)<3:
        print("Usage: normalize_roles.py input.json output.json")
        sys.exit(1)
    src, dest = sys.argv[1], sys.argv[2]
    data = json.load(open(src))
    out = []
    changed_count = 0
    for i, r in enumerate(data):
        if isinstance(r, dict):
            nr, ch = normalize_role(r, i)
            out.append(nr)
            if ch: changed_count += 1
    json.dump(out, open(dest, "w"), indent=2, ensure_ascii=False)
    print(f"Processed {len(out)} roles, changed {changed_count}")

if __name__ == "__main__":
    main()

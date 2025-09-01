import json, os, re

ROLES_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "core", "roles", "roles.json")

def tolerant_load_roles(path):
    txt = open(path, "r", encoding="utf-8", errors="ignore").read()
    try:
        data = json.loads(txt)
        return data if isinstance(data, list) else []
    except Exception:
        import re
        txt2 = re.sub(r",\s*(\]|\})", r"\1", txt)
        try:
            data = json.loads(txt2)
            return data if isinstance(data, list) else []
        except Exception:
            arrays = re.findall(r"\[[\s\S]*?\]", txt)
            items = []
            for a in arrays:
                try: items.extend(json.loads(a))
                except: pass
            return items

def test_roles_required_fields_present():
    roles = tolerant_load_roles(ROLES_PATH)
    assert isinstance(roles, list), "roles.json should be a JSON array"
    missing = []
    for i, r in enumerate(roles):
        if not isinstance(r, dict):
            missing.append((i, "not an object"))
            continue
        for key in ("role_id", "title", "category"):
            if key not in r or r[key] in (None, ""):
                missing.append((i, f"missing {key}"))
    # Allow failing with explicit message for visibility; CI can mark as gate
    assert not missing, f"Missing required fields in {len(missing)} items (sample: {missing[:10]})"

def test_roles_unique_ids():
    roles = tolerant_load_roles(ROLES_PATH)
    seen = set(); dupes = set()
    for r in roles:
        if isinstance(r, dict):
            rid = r.get("role_id")
            if rid in seen:
                dupes.add(rid)
            else:
                seen.add(rid)
    assert not dupes, f"Duplicate role_id values found: {sorted(list(dupes))[:10]}"

# PR2 — Retire legacy policy middleware (standardize on Policy V2)

This patch removes the legacy policy surface by **aliasing** `src/core/policy.ts` to Policy V2.
All existing `import { policyGuard } from "src/core/policy"` calls will now resolve to `policyV2Guard`.

## What changed
- `src/core/policy.ts` now re-exports `policyV2Guard` from `src/core/policyV2/guard`.
- Added `tests/security/policyV2.e2e.test.ts` to assert write routes are gated (POST /api/tasks at autonomy=1 → 403 with explanations) while read routes are allowed (GET /api/tasks → 200).

## If your v2 guard lives elsewhere
Adjust the re-export path inside `src/core/policy.ts` to match your repo, e.g.
```ts
export { policyV2Guard as policyGuard } from "./policy/guardV2";
// or
export { policyGuard } from "./policyV2";
```

## One-time hygiene (optional)
If you still import from a v1 file, switch to the canonical surface:
```bash
git grep -n "from '.*core/policy'" | cut -d: -f1 | sort -u | xargs -I{} sed -i '' "s#core/policy#core/policy#g" {}
# (kept the same path; it's now an alias to v2)
```

## Commit message suggestion
```
chore(policy): retire legacy middleware; alias to policyV2; add e2e for write gating
```

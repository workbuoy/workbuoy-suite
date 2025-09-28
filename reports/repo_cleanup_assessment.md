# Repository Cleanup Assessment

## 1. Executive Summary
- **Repository size:** 563 MB across 31,993 tracked files, with the `desktop` (242 MB), root-level `node_modules` (172 MB), and `connectors` (131 MB) directories dominating space consumption.
- **Third-party dependencies:** Six checked-in `node_modules` trees account for ~448 MB (~80 % of the repo footprint) and contain large native/binary payloads such as the Next.js SWC bundle (125 MB) and multiple esbuild binaries.
- **Duplication:** 77 duplicate code groups exist outside dependency folders, notably mirrored implementations under `enterprise/lib` vs. `enterprise` and redundant backend routes under both `apps/backend` and `src`.
- **Generated/build artifacts:** Only a handful of small `dist`/`build` outputs are committed, but there are numerous generated API docs and packaged desktop artifacts that merit review.
- **Key recommendations:** Remove vendored dependency trees from version control, consolidate duplicated enterprise/backend sources, and introduce automated cleanup plus dependency caching to prevent future bloat.

## 2. Detailed Technical Findings

### Step 1 – File Structure, Metadata, and Duplicates

| Metric | Observation |
| --- | --- |
| File count | 31,993 files (`find . -type f`) |
| Total size | 563 MB (`du -sh .`) |
| Top directories by size | `desktop` 242 MB, `node_modules` 172 MB, `connectors` 131 MB, `enterprise` 5.7 MB, `.git` 4.2 MB |
| Files older than 12 months | None detected (`find . -mtime +365`) |

**File type distribution (top extensions):** JavaScript (15,018 files / 160 MB), TypeScript (5,231 files / 26 MB), source maps (4,135 files / 81 MB), JSON (1,704 files / 10 MB), Markdown (1,518 files / 6.7 MB), and numerous binaries with no extension (1,320 files / 36 MB).

**Dependency footprints:**
- Root `node_modules`: 153 MB
- `desktop/ui/node_modules`: 227 MB (Next.js + SWC binaries dominate)
- `connectors/dynamics/node_modules`: 43 MB
- `connectors/salesforce/node_modules`: 43 MB
- `enterprise/node_modules` & `crm/node_modules`: empty placeholders

**Large binaries checked in:** Next.js SWC native module (125 MB), Mapbox GL bundles (10–11 MB), and multiple esbuild binaries (~10 MB each) live under `node_modules`.

**Duplicate content highlights:**
- 77 duplicate groups detected excluding dependencies.
- Mirrored enterprise modules (e.g., `enterprise/lib/scoring/high-perf-engine.js` vs. `enterprise/scoring/high-perf-engine.js`).
- Backend route duplication (`apps/backend/src/...` vs. `src/...`).

### Step 2 – Potentially Unused or Outdated Resources

**Unreferenced / low-activity areas:**
- `prototypes/FlipCardPrototype.tsx` appears isolated—no references found in main apps.
- Redundant enterprise library copies (`enterprise/lib`) suggest legacy packaging; confirm whether both trees are needed.
- Duplicate backend routes in `apps/backend` and `src` hint at parallel implementations; evaluate which is authoritative.

**Legacy or niche configurations:**
- Multiple version-specific READMEs (`README_SUPERDROP_V2.md`, `README_SUPERPROMPT_BC.md`, etc.) lack cross-references and may document superseded releases.
- Stacked configuration manifests (`MERGE_MANIFEST.json`, `release_manifest.json`, `release_config.json`) warrant validation to ensure only current ones remain active.
- `packages/backend-auth/dist` is a compiled artifact that should be regenerated rather than committed.

**Outdated / generated documentation:**
- `openapi/` and `api-docs/` appear generated; ensure regeneration scripts exist to avoid drift if removed.
- Numerous `RUNBOOK` and `META_ROUTE` documents may describe retired deployments—review for accuracy.

**Build artifacts and caches:**
- Desktop packaging assets in `desktop/build/` (icons, entitlements) may be derivable from source.
- Sparse `.log` and `.map` files under dependencies are pure build outputs.

### Step 3 – Categorized Cleanup Candidates

| Category | Candidate | Est. Size | Notes |
| --- | --- | --- | --- |
| **Safe to delete** | All `node_modules` trees | ~448 MB | Regenerated via `npm install` / `pnpm install`; remove from VCS and rely on lockfiles. |
|  | Generated API docs (`openapi/`, `api-docs/`) | 128 KB | Ensure automated doc generation before removal. |
|  | `packages/backend-auth/dist` | 28 KB | Should be built during publishing. |
|  | Desktop `build/` assets if generated | 32 KB | Confirm packaging pipeline. |
| **Probably safe** | `enterprise/lib/*` mirrors | 25 KB per module | Validate consumers before deduplication. |
|  | Duplicate backend route copies | 9 KB per pair | Determine canonical source tree. |
|  | `prototypes/` experiments | 3 KB | Retire if not referenced. |
|  | Legacy README variants | ~300 KB total | Archive externally if history needed. |
| **Requires review** | Release/merge manifests (`MERGE_MANIFEST.json`, `release_manifest.json`, `release_config.json`) | <100 KB | Confirm pipeline usage before consolidation. |
|  | Observability dashboards & telemetry configs | multi-file | Verify with SRE/ops teams prior to pruning. |
|  | Runbooks (`RUNBOOK_prod_ready_musthave.md`, etc.) | textual | May have compliance/audit value. |

### Step 4 – Cleanup Script and Backup Strategy

```bash
#!/usr/bin/env bash
set -euo pipefail

# Configuration
TARGET_ROOT=${TARGET_ROOT:-"$(pwd)"}
BACKUP_DIR=${BACKUP_DIR:-"$TARGET_ROOT/.cleanup_backups"}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE=${LOG_FILE:-"$BACKUP_DIR/cleanup-$TIMESTAMP.log"}
PROCESS_SAFE=${PROCESS_SAFE:-true}
PROCESS_PROBABLE=${PROCESS_PROBABLE:-false}
PROCESS_REVIEW=${PROCESS_REVIEW:-false}

mkdir -p "$BACKUP_DIR"
touch "$LOG_FILE"
exec > >(tee -a "$LOG_FILE") 2>&1

backup_path() {
  local path=$1
  local rel=${path#"$TARGET_ROOT/"}
  local dest="$BACKUP_DIR/$TIMESTAMP/$rel"
  mkdir -p "$(dirname "$dest")"
  rsync -a "$path" "$dest"
}

remove_path() {
  local path=$1
  echo "Removing $path"
  rm -rf "$path"
}

process_safe() {
  echo "== Safe-to-delete artifacts =="
  local targets=(
    "$TARGET_ROOT/node_modules"
    "$TARGET_ROOT/desktop/ui/node_modules"
    "$TARGET_ROOT/connectors/dynamics/node_modules"
    "$TARGET_ROOT/connectors/salesforce/node_modules"
    "$TARGET_ROOT/enterprise/node_modules"
    "$TARGET_ROOT/crm/node_modules"
    "$TARGET_ROOT/openapi"
    "$TARGET_ROOT/api-docs"
    "$TARGET_ROOT/packages/backend-auth/dist"
    "$TARGET_ROOT/desktop/build"
  )
  for path in "${targets[@]}"; do
    [ -e "$path" ] || continue
    backup_path "$path"
    remove_path "$path"
  done
}

process_probable() {
  echo "== Probably-safe artifacts =="
  local targets=(
    "$TARGET_ROOT/enterprise/lib"
    "$TARGET_ROOT/apps/backend/src"
    "$TARGET_ROOT/prototypes"
    "$TARGET_ROOT/README_SUPERDROP_V2.md"
    "$TARGET_ROOT/README_SUPERDROP_V3.md"
    "$TARGET_ROOT/README_SUPERPROMPT.md"
    "$TARGET_ROOT/README_SUPERPROMPT_BC.md"
  )
  for path in "${targets[@]}"; do
    [ -e "$path" ] || continue
    backup_path "$path"
    echo "(Verify usage before deleting)"
  done
}

process_review() {
  echo "== Requires-review artifacts =="
  local targets=(
    "$TARGET_ROOT/MERGE_MANIFEST.json"
    "$TARGET_ROOT/release_manifest.json"
    "$TARGET_ROOT/release_config.json"
    "$TARGET_ROOT/RUNBOOK_prod_ready_musthave.md"
    "$TARGET_ROOT/META_ROUTE_RUNBOOK.md"
  )
  for path in "${targets[@]}"; do
    [ -e "$path" ] || continue
    backup_path "$path"
    echo "(Consult owners before removal)"
  done
}

$PROCESS_SAFE && process_safe || echo "Skipping safe-to-delete artifacts"
$PROCESS_PROBABLE && process_probable || echo "Skipping probable artifacts"
$PROCESS_REVIEW && process_review || echo "Skipping review artifacts"

echo "Cleanup completed. Backups stored in $BACKUP_DIR/$TIMESTAMP"
```

- Use environment toggles (`PROCESS_SAFE=false`, etc.) during dry runs.
- Backups are stored under `.cleanup_backups/<timestamp>/` with a full directory mirror for rollback via `rsync -a` back into place.

## 3. Prioritized Action Plan

1. **Remove vendored dependencies** (High impact, Low risk, Medium effort)
   - Delete all `node_modules` trees and add to `.gitignore`.
   - Update CI to install dependencies during builds; expect ~450 MB repo reduction and faster clones.
2. **Consolidate duplicated enterprise/backend code** (Medium impact, Medium risk, High effort)
   - Audit `enterprise/lib` vs. `enterprise` modules and backend route duplicates, selecting canonical implementations.
   - Add tests to cover consolidated modules before removing redundant copies.
3. **Audit legacy documentation and configs** (Medium impact, Low risk, Medium effort)
   - Review multiple README/runbook variants; archive historical docs externally or tag with applicable versions.
4. **Automate artifact cleanup** (Medium impact, Low risk, Low effort)
   - Integrate the provided script (safe-only mode) into CI pre-commit hooks to prevent re-introducing heavy artifacts.
5. **Establish regeneration workflows for docs & builds** (Low impact, Medium risk, Medium effort)
   - Document commands to regenerate API docs, desktop assets, and package dists to justify future deletions.

## 4. Post-Cleanup Recommendations

- **Strengthen `.gitignore`:** Ensure dependency, build, and cache directories are excluded to prevent re-commit.
- **Adopt dependency caching in CI:** Utilize package managers' cache features instead of checking in vendors.
- **Implement size monitoring:** Add a CI check (e.g., `git-sizer`, repository-size budgets) to detect sudden growth.
- **Enforce documentation lifecycle:** Tag docs with owners and review cadence; archive obsolete playbooks.
- **Encourage module discovery tooling:** Use linting/static analysis to detect unused files and drifted duplicates regularly.


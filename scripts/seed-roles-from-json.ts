// scripts/seed-roles-from-json.ts

import fs from "node:fs";
import path from "node:path";

function resolveFirst(paths: string[]): string | null {
  for (const p of paths) {
    if (!p) continue;
    const abs = path.resolve(process.cwd(), p);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

function readJSON(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw);
}

function resolveRolesPath(): string {
  const candidates = [
    process.env.ROLES_PATH || "",
    "core/roles/roles.json",
    "roles/roles.json",
    "backend/roles/roles.json",
    "data/roles.json"
  ];
  const found = resolveFirst(candidates);
  if (!found) {
    throw new Error(
      `Could not locate roles.json (tried: ${candidates.filter(Boolean).join(", ")})`
    );
  }
  return found;
}

function resolveFeaturesPath(): string | null {
  const candidates = [
    process.env.FEATURES_PATH || "",
    "core/roles/features.json",
    "roles/features.json",
    "backend/roles/features.json",
    "data/features.json"
  ];
  return resolveFirst(candidates);
}

function loadRoles(): any[] {
  const file = resolveRolesPath();
  const json = readJSON(file);
  if (Array.isArray((json as any)?.roles)) return (json as any).roles as any[];
  if (Array.isArray(json)) return json as any[];
  throw new Error(`roles.json at ${file} had unexpected shape`);
}

function loadFeatures(): any[] {
  const file = resolveFeaturesPath();
  if (!file) return [];
  const json = readJSON(file);
  if (Array.isArray((json as any)?.features)) return (json as any).features as any[];
  if (Array.isArray(json)) return json as any[];
  return [];
}

async function main() {
  const persist = (process.env.FF_PERSISTENCE || "").toLowerCase() === "true";
  if (!persist) {
    console.log(JSON.stringify({ ok: true, skipped: "FF_PERSISTENCE=false" }));
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set when FF_PERSISTENCE=true");
  }

  const rolesPath = resolveRolesPath();
  const featuresPath = resolveFeaturesPath() || "";
  console.log(`[seed-roles] using rolesPath=${rolesPath} featuresPath=${featuresPath || "(none)"}`);

  const roles = loadRoles();
  const features = loadFeatures();

  // Lazy import for ESM/CJS safety
  const importer =
    (await import("../src/roles/service/importer").catch(() => null)) ||
    (await import("../src/roles/service/importer.ts").catch(() => null)) ||
    (await import("../src/roles/service/importer.js").catch(() => null));

  if (!importer?.importRolesAndFeatures) {
    throw new Error("importRolesAndFeatures not found in importer module");
  }

  const summary = await importer.importRolesAndFeatures(roles, features);
  console.log(JSON.stringify({ ok: true, summary }));
}

main().catch((err) => {
  console.error("[seed-roles-from-json] failed:", err?.stack || err?.message || String(err));
  process.exit(1);
});

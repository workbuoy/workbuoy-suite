import fs from "fs";
import path from "path";

export type Rule = {
  id: string;
  match: Record<string, string>;
  minAutonomy: number;
  mode: "ask_approval" | "read_only" | "supervised";
  explanation: string;
};
export type PolicyBundle = { version: string; rules: Rule[]; default: { mode: Rule["mode"]; explanation: string } };

let bundleCache: PolicyBundle | null = null;

export function loadPolicyBundle(customPath?: string): PolicyBundle {
  if (bundleCache) return bundleCache;
  const p = customPath || path.join(process.cwd(), "config", "policy.rules.json");
  const raw = fs.readFileSync(p, "utf8");
  const parsed = JSON.parse(raw);
  bundleCache = parsed;
  return parsed;
}

export function clearCache() { bundleCache = null; }

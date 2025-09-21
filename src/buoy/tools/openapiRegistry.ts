import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type ToolDefinition = {
  name: string;
  description: string;
  method: string;
  path: string;
  inputSchema?: Record<string, unknown>;
};

type CachedSpec = {
  mtimeMs: number;
  tools: ToolDefinition[];
};

type CachedAllowlist = {
  mtimeMs: number;
  entries: Set<string>;
};

const specCache = new Map<string, CachedSpec>();
const allowlistCache = new Map<string, CachedAllowlist>();

function readMtimeMs(filePath: string): number {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

export function loadAllowlist(filePath: string): Set<string> {
  const abs = path.resolve(filePath);
  const mtimeMs = readMtimeMs(abs);
  const cached = allowlistCache.get(abs);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.entries;
  }
  try {
    const raw = fs.readFileSync(abs, "utf8");
    const doc = yaml.load(raw) as { allow?: string[] } | undefined;
    const entries = new Set<string>((doc?.allow ?? []).map((entry) => entry.toUpperCase()));
    allowlistCache.set(abs, { mtimeMs, entries });
    return entries;
  } catch {
    const empty = new Set<string>();
    allowlistCache.set(abs, { mtimeMs, entries: empty });
    return empty;
  }
}

function normaliseMethod(method: string): string {
  return method.toUpperCase();
}

function buildTools(doc: any, allowlist: Set<string>): ToolDefinition[] {
  if (!doc || typeof doc !== "object") return [];
  const paths: Record<string, any> = doc.paths ?? {};
  const out: ToolDefinition[] = [];

  for (const [pathKey, pathObj] of Object.entries(paths)) {
    if (!pathObj || typeof pathObj !== "object") continue;
    for (const [methodKey, operation] of Object.entries(pathObj as Record<string, any>)) {
      const method = normaliseMethod(methodKey);
      const allowKey = `${method} ${pathKey}`.toUpperCase();
      if (!allowlist.has(allowKey)) continue;
      const operationId = typeof operation?.operationId === "string"
        ? operation.operationId
        : `${method.toLowerCase()}_${pathKey.replace(/[^a-z0-9]+/gi, "_")}`;
      const description =
        typeof operation?.summary === "string"
          ? operation.summary
          : typeof operation?.description === "string"
            ? operation.description
            : allowKey;
      const bodySchema =
        operation?.requestBody?.content?.["application/json"]?.schema ?? undefined;
      out.push({
        name: operationId,
        description,
        method,
        path: pathKey,
        inputSchema: bodySchema,
      });
    }
  }
  return out;
}

export function loadOpenApiTools(specPath: string, allowlist: Set<string>): ToolDefinition[] {
  const abs = path.resolve(specPath);
  const mtimeMs = readMtimeMs(abs);
  const cached = specCache.get(abs);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.tools;
  }
  try {
    const raw = fs.readFileSync(abs, "utf8");
    const doc = abs.endsWith(".json") ? JSON.parse(raw) : (yaml.load(raw) as any);
    const tools = buildTools(doc, allowlist);
    specCache.set(abs, { mtimeMs, tools });
    return tools;
  } catch {
    const tools: ToolDefinition[] = [];
    specCache.set(abs, { mtimeMs, tools });
    return tools;
  }
}

function pathMatches(template: string, requestPath: string): boolean {
  if (template === requestPath) return true;
  if (!template.includes("{")) return false;
  const pattern = template.replace(/\{[^/]+\}/g, "[^/]+");
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(requestPath);
}

export function findTool(tools: ToolDefinition[], method: string, requestPath: string): ToolDefinition | undefined {
  const targetMethod = normaliseMethod(method);
  return tools.find((tool) => tool.method === targetMethod && pathMatches(tool.path, requestPath));
}

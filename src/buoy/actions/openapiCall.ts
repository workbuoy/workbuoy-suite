import { runTool } from "./toolRunner";
import { findTool, loadAllowlist, loadOpenApiTools } from "../tools/openapiRegistry";
import type { ToolDefinition } from "../tools/openapiRegistry";
import type { BuoyContext } from "../memory/context";
import type { PlanResult } from "../reasoning/planner";

export type OpenApiPlan = {
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
};

let cachedTools: { specPath: string; allowPath: string; allow: Set<string>; tools: ToolDefinition[] } | null = null;

function resolveTools(): { allow: Set<string>; tools: ToolDefinition[] } {
  const specPath = process.env.BUOY_OPENAPI_PATH || "openapi/openapi.yaml";
  const allowPath = process.env.BUOY_ACTION_ALLOWLIST || "ai/policy/tool_allowlist.yaml";
  if (
    cachedTools &&
    cachedTools.specPath === specPath &&
    cachedTools.allowPath === allowPath
  ) {
    const allow = loadAllowlist(allowPath);
    if (allow === cachedTools.allow) {
      return { allow, tools: cachedTools.tools };
    }
  }
  const allow = loadAllowlist(allowPath);
  const tools = loadOpenApiTools(specPath, allow);
  cachedTools = { specPath, allowPath, allow, tools };
  return { allow, tools };
}

function resolveBaseUrl(): string {
  return (
    process.env.BUOY_ACTION_BASE_URL ||
    process.env.BUOY_API_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.WORKBUOY_BASE_URL ||
    "http://localhost:3000"
  );
}

function resolveApiKey(): string | undefined {
  const key = process.env.BUOY_ACTION_API_KEY || process.env.WORKBUOY_API_KEY;
  return key && key.length > 0 ? key : undefined;
}

export async function executeOpenApiCall(
  ctx: BuoyContext & { plan?: PlanResult & { call?: OpenApiPlan } }
): Promise<{ ok: boolean; status: number; body: unknown; headers: Record<string, string> }>
{
  const planCall = ctx.plan?.call;
  if (!planCall) {
    return { ok: false, status: 500, body: { error: "missing_plan_call" }, headers: {} };
  }
  const { method, path, body, headers } = planCall;
  const toolsInfo = resolveTools();
  const tool = findTool(toolsInfo.tools, method, path);
  if (!tool) {
    return { ok: false, status: 403, body: { error: "tool_not_allowed", method, path }, headers: {} };
  }

  const result = await runTool({
    baseUrl: resolveBaseUrl(),
    apiKey: resolveApiKey(),
    method: tool.method,
    path,
    body,
    headers,
  });

  return { ok: result.ok, status: result.status, body: result.body, headers: result.headers };
}

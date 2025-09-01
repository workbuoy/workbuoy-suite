import { loadOpenApiTools } from '../tools/openapi_tool_registry';
import { runTool } from '../runtime/tool_runner';
import yaml from 'js-yaml';
import fs from 'fs';

export async function planAndExecute(intent: any, ctx: { baseUrl: string, apiKey: string }) {
  const allow = new Set((yaml.load(fs.readFileSync(process.env.BUOY_ACTION_ALLOWLIST||'ai/policy/tool_allowlist.yaml','utf8')) as any).allow);
  const tools = loadOpenApiTools(process.env.BUOY_OPENAPI_PATH || 'api-docs/openapi.yaml', allow);
  // naive selection: first tool matching resource
  const m = intent.method || 'GET';
  const p = intent.path;
  const tool = tools.find(t => t.method===m && t.path===p);
  if (!tool) throw new Error('No allowed tool matches intent');
  return runTool(ctx.baseUrl, ctx.apiKey, tool.method, tool.path, intent.body);
}

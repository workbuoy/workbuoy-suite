import fs from 'fs';
import yaml from 'js-yaml';

export type ToolDef = {
  name: string;
  description: string;
  method: string;
  path: string;
  inputSchema?: any;
};

export function loadOpenApiTools(openapiPath: string, allowlist: Set<string>): ToolDef[] {
  const raw = fs.readFileSync(openapiPath, 'utf8');
  const doc = openapiPath.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw) as any;
  const tools: ToolDef[] = [];
  const paths = doc.paths || {};
  for (const p of Object.keys(paths)) {
    const entry = paths[p];
    for (const m of Object.keys(entry)) {
      const op = entry[m];
      const key = `${m.toUpperCase()} ${p}`;
      if (!allowlist.has(key)) continue;
      const name = (op.operationId || `${m}_${p.replace(/[^a-z0-9]+/gi,'_')}`).toLowerCase();
      const desc = op.summary || op.description || key;
      const inputSchema = (op.requestBody?.content?.['application/json']?.schema) || undefined;
      tools.push({name, description: desc, method: m.toUpperCase(), path: p, inputSchema});
    }
  }
  return tools;
}

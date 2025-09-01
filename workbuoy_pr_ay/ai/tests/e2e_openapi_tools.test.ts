// pseudo-test, replace with your runner
import { loadOpenApiTools } from '../tools/openapi_tool_registry';
import { runTool } from '../runtime/tool_runner';
import fs from 'fs';

test('buoy can list contacts via tool', async () => {
  const allow = new Set(require('js-yaml').load(fs.readFileSync('ai/policy/tool_allowlist.yaml','utf8')).allow);
  const tools = loadOpenApiTools(process.env.BUOY_OPENAPI_PATH || 'api-docs/openapi.yaml', allow);
  const list = tools.find(t => t.method==='GET' && t.path==='/api/v1/crm/contacts');
  expect(list).toBeTruthy();
});

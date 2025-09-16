import * as path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';
import * as fs from 'fs';
const SPEC_PATH = path.resolve(process.cwd(), 'openapi/meta.yaml');
describe('META OpenAPI spec', () => {
  it('exists', () => {
    expect(fs.existsSync(SPEC_PATH)).toBe(true);
  });
  it('is a valid OpenAPI 3.0 document', async () => {
    const api = await SwaggerParser.parse(SPEC_PATH);
    await SwaggerParser.validate(api);
  });
  it('covers all META routes', async () => {
    const api = (await SwaggerParser.parse(SPEC_PATH)) as any;
    const paths = Object.keys(api.paths || {});
    const expected = [
      '/meta/health',
      '/meta/readiness',
      '/meta/version',
      '/meta/capabilities',
      '/meta/policy',
      '/meta/audit-stats',
      '/meta/metrics',
    ];
    expected.forEach((p) => expect(paths).toContain(p));
  });
  it('marks /meta/health and /meta/version as public', async () => {
    const api = (await SwaggerParser.parse(SPEC_PATH)) as any;
    expect(api.paths['/meta/health'].get.security).toEqual([]);
    expect(api.paths['/meta/version'].get.security).toEqual([]);
  });
});

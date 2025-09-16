import SwaggerParser from '@apidevtools/swagger-parser';
import path from 'path';
(async () => {
  const spec = path.resolve(process.cwd(), 'openapi/meta.yaml');
  const api = await SwaggerParser.parse(spec);
  await SwaggerParser.validate(api);
  if (!(api as any).components?.securitySchemes?.bearerAuth) {
    throw new Error('bearerAuth security scheme missing');
  }
  console.log('OpenAPI validation OK');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

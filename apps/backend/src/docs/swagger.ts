import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import swaggerDist from 'swagger-ui-dist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function swaggerRouter() {
  const r = express.Router();
  const dist: { getAbsoluteFSPath?: () => string } = swaggerDist as unknown as { getAbsoluteFSPath?: () => string };
  const swaggerPath = dist.getAbsoluteFSPath ? dist.getAbsoluteFSPath() : path.join(__dirname, '../../node_modules/swagger-ui-dist');
  const yamlPath = path.resolve(process.cwd(), 'openapi', 'workbuoy.yaml');

  r.get('/docs/openapi.yaml', (_req, res) => {
    try {
      const y = fs.readFileSync(yamlPath, 'utf8');
      res.setHeader('Content-Type', 'application/yaml');
      res.send(y);
    } catch (e) {
      res.status(500).send('OpenAPI file not found: ' + yamlPath);
    }
  });

  r.use('/docs', (req, res, next) => {
    if (req.path === '/' || req.path === '') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>WorkBuoy API – Swagger UI</title>
    <link rel="stylesheet" href="/docs/swagger-ui.css"/>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/docs/openapi.yaml',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: "BaseLayout"
        });
      };
    </script>
  </body>
</html>`);
    }
    next();
  });

  r.use('/docs', (req, _res, next) => {
    (req as any).url = req.originalUrl.replace(/^\/docs/, '');
    next();
  }, express.static(swaggerPath));

  return r;
}

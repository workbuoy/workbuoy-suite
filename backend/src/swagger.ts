import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Router } from 'express';

export const swaggerRouter = Router();
const specPath = join(process.cwd(), 'api-docs', 'openapi.yaml');
const spec = yaml.parse(readFileSync(specPath, 'utf-8'));
swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(spec));

import { Application } from 'express';
import metaRouter from '../meta/router';

export function mountMetaRoutes(app: Application) {
  app.use('/api/meta', metaRouter);
}

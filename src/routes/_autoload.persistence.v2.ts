import type { Express } from 'express';

export function mountPersistenceV2(app: Express){
  // mount under /api
  try { app.use('/api', require('../../backend/routes/admin.roles.v2').default); } catch {}
  try { app.use('/api', require('../../backend/routes/admin.subscription.v2').default); } catch {}
  try { app.use('/api', require('../../backend/routes/features.v2').default); } catch {}
  try { app.use('/api', require('../../backend/routes/usage.v2').default); } catch {}
}

export function maybeMountPersistenceV2(app: any){
  if (process.env.FF_PERSISTENCE === 'true') {
    mountPersistenceV2(app);
  }
}

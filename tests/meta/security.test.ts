import express from 'express';
import request from 'supertest';

import { createMetaRouter } from '../../backend/meta/router';
import { publicMetaRateLimit } from '../../backend/meta/security';

import type { NextFunction, Request, Response } from 'express';

describe('META security and rate limiting', () => {
  const createApp = (user?: { scopes?: string[] }) => {
    const app = express();
    if (user) {
      app.use((req: Request, _res: Response, next: NextFunction) => {
        (req as any).user = user;
        next();
      });
    }
    app.use('/api/meta', createMetaRouter());
    return app;
  };

  const protectedRoutes = ['/readiness', '/capabilities', '/policy', '/audit-stats', '/metrics'];

  beforeEach(() => {
    if (typeof (publicMetaRateLimit as any).resetKey === 'function') {
      (publicMetaRateLimit as any).resetKey('global');
    }
  });

  it('allows unauthenticated access to public routes', async () => {
    const app = createApp();

    const health = await request(app).get('/api/meta/health');
    const version = await request(app).get('/api/meta/version');

    expect(health.status).toBe(200);
    expect(version.status).toBe(200);
  });

  it('rejects protected routes without meta:read scope', async () => {
    const app = createApp();

    for (const route of protectedRoutes) {
      const res = await request(app).get(`/api/meta${route}`);
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'forbidden' });
    }
  });

  it('allows protected routes when user has meta:read scope', async () => {
    const app = createApp({ scopes: ['meta:read'] });

    for (const route of protectedRoutes) {
      const res = await request(app).get(`/api/meta${route}`);
      expect(res.status).toBe(200);
    }
  });

  it('enforces rate limiting on public endpoints', async () => {
    const app = createApp();
    let lastStatus = 200;

    for (let i = 0; i < 61; i += 1) {
      const res = await request(app).get('/api/meta/health');
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});

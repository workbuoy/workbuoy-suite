import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { createMetaRouter } from '../../backend/meta/router';
import * as metricsModule from '../../observability/metrics/meta';

describe('META: /meta/metrics', () => {
  const createApp = () => {
    const app = express();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = { scopes: ['meta:read'] };
      next();
    });
    app.use('/api/meta', createMetaRouter());
    return app;
  };

  it('returns Prometheus exposition text', async () => {
    const app = createApp();
    const res = await request(app).get('/api/meta/metrics');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text.trim().length).toBeGreaterThan(0);
  });

  it('falls back to JSON location when exporter errors', async () => {
    const spy = jest.spyOn(metricsModule, 'collectMetricsText').mockRejectedValueOnce(new Error('boom'));
    const app = createApp();

    const res = await request(app).get('/api/meta/metrics');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({ location: '/metrics' });

    spy.mockRestore();
  });
});

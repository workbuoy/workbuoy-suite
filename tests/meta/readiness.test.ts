import express from 'express';
import request from 'supertest';

import * as readinessModule from '../../apps/backend/meta/readiness';
import { createMetaRouter } from '../../apps/backend/meta/router';

import type { Probe, ProbeResult } from '../../apps/backend/meta/probes';
import type { NextFunction, Request, Response, Router as ExpressRouter } from 'express';

const makeProbe = (result: Omit<ProbeResult, 'latency_ms'> & { latency_ms?: number }): Probe => ({
  name: result.name,
  async check(): Promise<ProbeResult> {
    return { ...result, latency_ms: result.latency_ms ?? 5 };
  },
});

const withUser = (router: ExpressRouter) => {
  const app = express();
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as any).user = { scopes: ['meta:read'] };
    next();
  });
  app.use('/api/meta', router);
  return app;
};

describe('META: /meta/readiness', () => {
  it('returns ready when every probe is ok', async () => {
    const router = createMetaRouter({
      probes: [makeProbe({ name: 'db', status: 'ok' }), makeProbe({ name: 'queue', status: 'ok' })],
    });
    const app = withUser(router);

    const response = await request(app).get('/api/meta/readiness');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ready');
    expect(Array.isArray(response.body.checks)).toBe(true);
    expect(response.body.checks).toHaveLength(2);
    for (const check of response.body.checks) {
      expect(check).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          status: expect.any(String),
          latency_ms: expect.any(Number),
        }),
      );
    }
  });

  it('returns degraded when a probe warns', async () => {
    const router = createMetaRouter({
      probes: [
        makeProbe({ name: 'db', status: 'ok' }),
        makeProbe({ name: 'queue', status: 'warn', reason: 'lagging' }),
      ],
    });
    const app = withUser(router);

    const response = await request(app).get('/api/meta/readiness');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('degraded');
    const queueCheck = response.body.checks.find((check: ProbeResult) => check.name === 'queue');
    expect(queueCheck.reason).toBe('lagging');
  });

  it('returns not_ready when a probe fails, even if others succeed', async () => {
    const router = createMetaRouter({
      probes: [
        makeProbe({ name: 'db', status: 'ok' }),
        makeProbe({ name: 'outbound', status: 'fail', reason: 'timeout' }),
      ],
    });
    const app = withUser(router);

    const response = await request(app).get('/api/meta/readiness');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('not_ready');
    const outboundCheck = response.body.checks.find(
      (check: ProbeResult) => check.name === 'outbound',
    );
    expect(outboundCheck.status).toBe('fail');
    expect(outboundCheck.reason).toBe('timeout');
  });

  it('filters probes via include query parameter', async () => {
    const router = createMetaRouter({
      probes: [
        makeProbe({ name: 'db', status: 'ok' }),
        makeProbe({ name: 'queue', status: 'ok' }),
        makeProbe({ name: 'outbound', status: 'ok' }),
      ],
    });
    const app = withUser(router);

    const response = await request(app)
      .get('/api/meta/readiness')
      .query({ include: ['db', 'queue,outbound'] });

    expect(response.status).toBe(200);
    const checks = response.body.checks as ProbeResult[];
    const names = checks.map((check) => check.name).sort();
    expect(names).toEqual(['db', 'outbound', 'queue'].sort());
  });

  it('surfaces runner errors without throwing 500', async () => {
    const spy = jest
      .spyOn(readinessModule, 'runReadiness')
      .mockRejectedValueOnce(new Error('simulated failure'));
    const router = createMetaRouter();
    const app = withUser(router);

    const response = await request(app).get('/api/meta/readiness');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('not_ready');
    expect(response.body.checks).toEqual([
      { name: 'handler', status: 'fail', latency_ms: 0, reason: 'handler-error' },
    ]);

    spy.mockRestore();
  });
});

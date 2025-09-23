import express from 'express';
import request from 'supertest';

import {
  configurePolicySnapshot,
  resetPolicySnapshot,
  recordPolicyDeny,
  InMemoryPolicyMetricsStore,
} from '../../backend/meta/policy';
import router from '../../backend/meta/router';
import { policyDeniesTotal } from '../../observability/metrics/meta';

import type { NextFunction, Request, Response } from 'express';

describe('META: /meta/policy', () => {
  const createApp = () => {
    const app = express();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = { scopes: ['meta:read'] };
      next();
    });
    app.use('/api/meta', router);
    return app;
  };

  beforeEach(() => {
    resetPolicySnapshot();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    resetPolicySnapshot();
  });

  it('returns snapshot data from policy engine and metrics store', async () => {
    const metrics = new InMemoryPolicyMetricsStore();
    const engine = {
      getSnapshot: jest.fn(async () => ({
        autonomyLevel: 2 as const,
        policyProfile: 'secure' as const,
      })),
    };
    configurePolicySnapshot({ engine: engine as any, metrics });

    const now = new Date('2024-01-01T12:00:00.000Z');
    jest.setSystemTime(now);

    recordPolicyDeny(new Date(now.getTime() - 30 * 60 * 1000));
    recordPolicyDeny(new Date(now.getTime() - 2 * 60 * 60 * 1000));
    recordPolicyDeny(new Date(now.getTime() - 30 * 60 * 60 * 1000));

    const app = createApp();
    const res = await request(app).get('/api/meta/policy');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      autonomy_level: 2,
      policy_profile: 'secure',
      deny_counters: { last_1h: 1, last_24h: 2 },
    });
    expect(policyDeniesTotal.inc).toHaveBeenCalledTimes(3);
    expect(policyDeniesTotal.inc).toHaveBeenCalledWith({ feature: 'policy', reason: 'deny' });
  });

  it('normalises unexpected engine values and counter responses', async () => {
    const metrics = {
      recordDeny: jest.fn(() => true),
      getWindowCounts: jest.fn(() => ({ last_1h: -5, last_24h: Number.NaN })),
    };
    const engine = {
      getSnapshot: jest.fn(async () => ({ autonomyLevel: 9 as any, policyProfile: 'weird' })),
    };

    configurePolicySnapshot({ engine: engine as any, metrics: metrics as any });
    const app = createApp();
    const res = await request(app).get('/api/meta/policy');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      autonomy_level: 1,
      policy_profile: 'default',
      deny_counters: { last_1h: 0, last_24h: 0 },
    });
  });

  it('returns safe defaults when snapshot retrieval throws', async () => {
    const engine = {
      getSnapshot: jest.fn(async () => {
        throw new Error('boom');
      }),
    };

    configurePolicySnapshot({ engine: engine as any, metrics: new InMemoryPolicyMetricsStore() });
    const app = createApp();
    const res = await request(app).get('/api/meta/policy');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      autonomy_level: 0,
      policy_profile: 'default',
      deny_counters: { last_1h: 0, last_24h: 0 },
    });
  });
});

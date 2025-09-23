import express from 'express';
import request from 'supertest';

import router from '../../backend/meta/router';

import type { NextFunction, Request, Response } from 'express';

describe('META: /meta/capabilities', () => {
  const ORIGINAL_ENV = process.env;

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
    process.env = { ...ORIGINAL_ENV };
    delete process.env.META_MODE_CORE;
    delete process.env.META_MODE_CORE_ENABLED;
    delete process.env.META_MODE_FLEX;
    delete process.env.META_MODE_FLEX_ENABLED;
    delete process.env.META_MODE_SECURE;
    delete process.env.META_MODE_SECURE_ENABLED;
    delete process.env.WB_MODE_CORE;
    delete process.env.WB_MODE_CORE_ENABLED;
    delete process.env.WB_MODE_FLEX;
    delete process.env.WB_MODE_FLEX_ENABLED;
    delete process.env.WB_MODE_SECURE;
    delete process.env.WB_MODE_SECURE_ENABLED;
    delete process.env.META_CONNECTORS_ENABLED;
    delete process.env.WB_CONNECTORS_ENABLED;
    delete process.env.CONNECTORS_ENABLED;
    delete process.env.META_CONNECTOR_HUBSPOT_ENABLED;
    delete process.env.META_CONNECTOR_SALESFORCE_ENABLED;
    delete process.env.META_CONNECTOR_DYNAMICS_ENABLED;
    delete process.env.WB_CONNECTOR_HUBSPOT_ENABLED;
    delete process.env.WB_CONNECTOR_SALESFORCE_ENABLED;
    delete process.env.WB_CONNECTOR_DYNAMICS_ENABLED;
    delete process.env.CONNECTOR_HUBSPOT_ENABLED;
    delete process.env.CONNECTOR_SALESFORCE_ENABLED;
    delete process.env.CONNECTOR_DYNAMICS_ENABLED;
    delete process.env.META_FEATURE_FLAGS;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns default capability snapshot when env is unset', async () => {
    const app = createApp();
    const res = await request(app).get('/api/meta/capabilities');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      modes: { core: true, flex: false, secure: false },
      connectors: [
        { name: 'hubspot', enabled: true },
        { name: 'salesforce', enabled: true },
        { name: 'dynamics', enabled: true },
      ],
      feature_flags: {},
    });
  });

  it('respects mode and connector toggles from env', async () => {
    process.env.META_MODE_CORE = 'false';
    process.env.META_MODE_FLEX_ENABLED = '1';
    process.env.WB_MODE_SECURE = 'true';

    process.env.CONNECTORS_ENABLED = 'false';
    process.env.META_CONNECTOR_SALESFORCE_ENABLED = 'true';
    process.env.WB_CONNECTOR_DYNAMICS_ENABLED = 'true';

    const app = createApp();
    const res = await request(app).get('/api/meta/capabilities');

    expect(res.status).toBe(200);
    expect(res.body.modes).toEqual({ core: false, flex: true, secure: true });
    expect(res.body.connectors).toEqual([
      { name: 'hubspot', enabled: false },
      { name: 'salesforce', enabled: true },
      { name: 'dynamics', enabled: true },
    ]);
  });

  it('aggregates feature flags and only exposes boolean toggles', async () => {
    process.env.META_FEATURE_FLAGS = 'alpha, beta=false, gamma=yes';
    process.env.META_FEATURE_EXPERIMENTAL = 'true';
    process.env.SECRET_API_KEY = 'should_not_leak';

    const app = createApp();
    const res = await request(app).get('/api/meta/capabilities');

    expect(res.status).toBe(200);
    expect(res.body.feature_flags).toEqual({
      alpha: true,
      beta: false,
      experimental: true,
      gamma: true,
    });
    expect(
      Object.values(res.body.feature_flags).every((value: unknown) => typeof value === 'boolean'),
    ).toBe(true);
    expect(res.body.feature_flags).not.toHaveProperty('secret_api_key');
  });

  it('parses feature flags from JSON configuration when provided', async () => {
    process.env.META_FEATURE_FLAGS = '{"beta": true, "gamma": 0, "stringy": "no"}';

    const app = createApp();
    const res = await request(app).get('/api/meta/capabilities');

    expect(res.status).toBe(200);
    expect(res.body.feature_flags).toEqual({
      beta: true,
      gamma: false,
      stringy: false,
    });
  });
});

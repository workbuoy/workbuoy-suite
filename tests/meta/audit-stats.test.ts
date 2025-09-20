import express, { type NextFunction, type Request, type Response, type Router as ExpressRouter } from 'express';
import request from 'supertest';
import { createMetaRouter } from '../../backend/meta/router';
import type { AuditRepo, AuditRepoEvent } from '../../backend/meta/auditStats';
import { auditFailuresTotal } from '../../observability/metrics/meta';

describe('META: /meta/audit-stats', () => {
  const withUser = (router: ExpressRouter) => {
    const app = express();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = { scopes: ['meta:read'] };
      next();
    });
    app.use('/api/meta', router);
    return app;
  };

  beforeEach(() => {
    (auditFailuresTotal.inc as jest.Mock).mockClear();
  });

  it('returns zeroed totals when the repo has no events', async () => {
    const repo: AuditRepo = {
      async listEvents() {
        return [];
      },
    };
    const router = createMetaRouter({ auditRepo: repo });
    const app = withUser(router);

    const res = await request(app).get('/api/meta/audit-stats');

    expect(res.status).toBe(200);
    expect(res.body.totals).toEqual({ intents: 0, actions: 0, failures: 0 });
    expect(res.body.top_errors).toEqual([]);
    expect(new Date(res.body.window.from).getTime()).toBeLessThanOrEqual(new Date(res.body.window.to).getTime());
    expect(auditFailuresTotal.inc).not.toHaveBeenCalled();
  });

  it('aggregates intents, actions, and failures with top error ordering', async () => {
    const events: AuditRepoEvent[] = [
      { type: 'intent' },
      { type: 'action' },
      { type: 'action' },
      { type: 'failure', code: 'E_CONN' },
      { type: 'failure', code: 'E_CONN' },
      { type: 'failure', code: 'E_TIMEOUT' },
      { type: 'failure' },
    ];
    const fromTime = new Date(Date.now() - 20 * 60 * 1000);
    const toTime = new Date();
    const repo: AuditRepo = {
      async listEvents(from, to) {
        expectIsoClose(from, fromTime);
        expectIsoClose(to, toTime);
        return events;
      },
    };

    const router = createMetaRouter({ auditRepo: repo });
    const app = withUser(router);
    const res = await request(app)
      .get('/api/meta/audit-stats')
      .query({ from: fromTime.toISOString(), to: toTime.toISOString() });

    expect(res.status).toBe(200);
    expect(res.body.totals).toEqual({ intents: 1, actions: 2, failures: 4 });
    expect(res.body.top_errors).toEqual([
      { code: 'E_CONN', count: 2 },
      { code: 'E_TIMEOUT', count: 1 },
    ]);
    expect(auditFailuresTotal.inc).toHaveBeenCalledWith(4);
  });

  it('falls back to safe defaults when the repo throws', async () => {
    const repo: AuditRepo = {
      async listEvents() {
        throw new Error('boom');
      },
    };
    const router = createMetaRouter({ auditRepo: repo });
    const app = withUser(router);

    const res = await request(app).get('/api/meta/audit-stats').query({ from: 'invalid', to: 'invalid' });

    expect(res.status).toBe(200);
    expect(res.body.totals).toEqual({ intents: 0, actions: 0, failures: 0 });
    expect(res.body.top_errors).toEqual([]);
    expect(new Date(res.body.window.from).getTime()).toBeLessThan(new Date(res.body.window.to).getTime());
  });

  it('swaps invalid ranges where from > to', async () => {
    const repo: AuditRepo = {
      async listEvents() {
        return [];
      },
    };
    const router = createMetaRouter({ auditRepo: repo });
    const app = withUser(router);

    const res = await request(app)
      .get('/api/meta/audit-stats')
      .query({ from: '2024-05-01T12:30:00.000Z', to: '2024-05-01T12:00:00.000Z' });

    expect(res.status).toBe(200);
    expect(res.body.totals).toEqual({ intents: 0, actions: 0, failures: 0 });
    expect(new Date(res.body.window.from).getTime()).toBeLessThan(new Date(res.body.window.to).getTime());
  });
});

function expectIsoClose(actual: Date, expected: Date) {
  const actualTime = actual.getTime();
  const expectedTime = expected.getTime();
  if (Number.isNaN(actualTime) || Number.isNaN(expectedTime)) {
    throw new Error(`Invalid ISO date comparison: ${actual.toISOString()} vs ${expected.toISOString()}`);
  }
  const delta = Math.abs(actualTime - expectedTime);
  if (delta > 5) {
    throw new Error(`Expected ${actual.toISOString()} to be within 5ms of ${expected.toISOString()}, diff=${delta}`);
  }
}

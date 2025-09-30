import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

let app: Express | null = null;

async function loadApp(): Promise<Express> {
  if (!app) {
    process.env.METRICS_ENABLED = process.env.METRICS_ENABLED ?? 'true';
    process.env.WB_SKIP_OPTIONAL_ROUTES = process.env.WB_SKIP_OPTIONAL_ROUTES ?? '0';
    const mod = await import('../../src/server.ts');
    app = mod.default;
  }
  return app;
}

describe('Contract: GET /api/version', () => {
  beforeAll(async () => {
    app = await loadApp();
  });

  it('returns JSON metadata with name and semver version', async () => {
    const server = app ?? (await loadApp());
    const response = await request(server).get('/api/version');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.headers['content-type']).toContain('charset=utf-8');

    const payload = response.body as { name?: unknown; version?: unknown };

    expect(typeof payload.name).toBe('string');
    expect((payload.name as string).length).toBeGreaterThan(0);

    expect(typeof payload.version).toBe('string');
    expect(payload.version as string).toMatch(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/,
    );
  });
});

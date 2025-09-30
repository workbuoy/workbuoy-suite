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

describe('Contract: GET /metrics', () => {
  beforeAll(async () => {
    app = await loadApp();
  });

  it('exposes Prometheus text with backend service labels and semver version', async () => {
    const server = app ?? (await loadApp());
    const response = await request(server).get('/metrics');

    expect(response.status).toBe(200);
    const contentType = response.headers['content-type'] ?? '';
    expect(contentType).toContain('text/plain');
    expect(contentType).toContain('version=0.0.4');
    expect(contentType).toContain('charset=utf-8');

    const body = response.text;
    expect(body).toMatch(/#\s*HELP/m);
    expect(body).toMatch(/#\s*TYPE/m);
    expect(body).toMatch(/(service="backend"|service_name="workbuoy-backend")/);

    const versionMatch = body.match(/version="([^"]+)"/);
    expect(versionMatch).not.toBeNull();
    expect(versionMatch?.[1]).toMatch(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/,
    );
  });
});

import { afterAll, beforeAll, expect, test } from 'vitest';
import type { BackendRunner } from './types.js';
import { startBackend } from '../../tests-smoke/_helpers/backend.js';

const BASE_PORT = Number(process.env.SMOKE_PORT ?? 3100);

let backend: BackendRunner | null = null;

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

beforeAll(async () => {
  process.env.METRICS_ENABLED = 'true';
  process.env.CRM_ENABLED = process.env.CRM_ENABLED ?? 'true';
  backend = await startBackend(BASE_PORT + 19);
});

afterAll(async () => {
  if (backend) {
    await backend.stop();
    backend = null;
  }
});

test(
  'metrics exposes Prometheus format with default labels',
  async () => {
    if (!backend) {
      throw new Error('backend not initialized');
    }

    const versionResponse = await fetch(`${backend.url}/api/version`);
    expect(versionResponse.status).toBe(200);
    const versionPayload = (await versionResponse.json()) as { version?: string };
    const expectedVersion = versionPayload.version ?? 'unknown';

    const response = await fetch(`${backend.url}/metrics`);
    const contentType = response.headers.get('content-type') ?? '';
    expect(response.status).toBe(200);
    expect(contentType).toContain('text/plain');
    expect(contentType).toContain('charset=utf-8');
    expect(contentType).toContain('version=0.0.4');

    const body = await response.text();
    expect(body).toMatch(/# HELP/);
    expect(body).toMatch(/process_(cpu_seconds_total|start_time_seconds)/);
    // Back-compat: accept both new and old label names for the service
    // New label: service="backend"
    // Old label: service_name="workbuoy-backend"
    expect(body).toMatch(/(service_name="workbuoy-backend"|service="backend")/);
    expect(body).toMatch(new RegExp(`version="${escapeRegExp(expectedVersion)}"`));
  },
  10_000,
);

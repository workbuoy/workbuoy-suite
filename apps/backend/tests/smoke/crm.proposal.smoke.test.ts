import { setTimeout as delay } from 'node:timers/promises';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { BackendRunner } from './types.js';
import { startBackend } from '../../tests-smoke/_helpers/backend.js';

const BASE_PORT = Number(process.env.SMOKE_PORT ?? 3100);
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

let backend: BackendRunner | null = null;

async function fetchProposal(baseUrl: string, id: string) {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/crm/proposals/${encodeURIComponent(id)}`);
      if (response.status === 200) {
        return response.json();
      }
      const text = await response.text();
      lastError = new Error(`Unexpected status ${response.status}: ${text}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError ?? new Error('proposal not available');
}

beforeAll(async () => {
  process.env.CRM_ENABLED = 'true';
  process.env.METRICS_ENABLED = process.env.METRICS_ENABLED ?? 'true';
  backend = await startBackend(BASE_PORT + 11);
});

afterAll(async () => {
  if (backend) {
    await backend.stop();
    backend = null;
  }
});

test(
  'create + fetch CRM proposal is idempotent',
  async () => {
    if (!backend) {
      throw new Error('backend not initialized');
    }

    const payload = {
      title: 'Smoke CRM proposal',
      value: 123_000,
      currency: 'NOK',
    } as const;

    const response = await fetch(`${backend.url}/api/crm/proposals`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    const created = await response.json();

    expect(typeof created.id).toBe('string');
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(created).toEqual(
      expect.objectContaining({
        title: payload.title,
        value: payload.value,
        currency: payload.currency,
      }),
    );

    const fetched = await fetchProposal(backend.url, created.id);
    expect(fetched).toEqual(created);

    const fetchedAgain = await fetchProposal(backend.url, created.id);
    expect(fetchedAgain).toEqual(created);
  },
  10_000,
);

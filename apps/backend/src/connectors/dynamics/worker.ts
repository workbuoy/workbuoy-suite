import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
import { Redis } from 'ioredis';
import type { Redis as RedisClient } from 'ioredis';
import { getAccessToken, DynAuthConfig } from './auth.js';
import { mapContact, mapOpportunity, type DynContact, type DynOpportunity } from './mapping.js';
import { Upserter, WorkBuoyCfg } from './upsert.js';
import { dyn_errors_total } from './metrics.js';

export interface WorkerConfig {
  auth: DynAuthConfig;
  baseUrl: string;   // mock/provider base
  sinceMs: number;
  redisUrl: string;
  workbuoy: WorkBuoyCfg;
}

async function doFetchWithThrottle(url: string, init: any = {}, maxAttempts=5) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    const res = await fetch(url, init);
    if (res.status === 429) {
      dyn_errors_total.labels('throttle').inc();
      const ra = parseFloat(res.headers.get('retry-after') || '0.2');
      await new Promise(r=>setTimeout(r, Math.min(5000, Math.max(50, Math.floor(ra*1000)))));
      attempt++;
      continue;
    }
    if (!res.ok && res.status >= 500) {
      dyn_errors_total.labels('provider_5xx').inc();
      await new Promise(r=>setTimeout(r, Math.min(2000, (attempt+1)*200)));
      attempt++;
      continue;
    }
    return res;
  }
  throw new Error('provider fetch failed after retries');
}

async function parseJsonArray<T>(res: Response): Promise<T[]> {
  const payload = (await res.json()) as unknown;
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload as T[];
}

async function fetchContacts(accessToken: string, base: string, sinceMs: number): Promise<DynContact[]> {
  const url = `${base}/contacts?since=${sinceMs}`;
  const res = await doFetchWithThrottle(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  return parseJsonArray<DynContact>(res);
}

async function fetchOpportunities(accessToken: string, base: string, sinceMs: number): Promise<DynOpportunity[]> {
  const url = `${base}/opportunities?since=${sinceMs}`;
  const res = await doFetchWithThrottle(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  return parseJsonArray<DynOpportunity>(res);
}

export async function runOnce(cfg: WorkerConfig) {
  const token = await getAccessToken(cfg.auth);
  const dlq: RedisClient = new Redis(cfg.redisUrl);
  const up = new Upserter(cfg.redisUrl, cfg.workbuoy);
  try {
    const contacts = await fetchContacts(token, cfg.baseUrl, cfg.sinceMs);
    for (const c of contacts) {
      await up.upsertOrDlq('contact', mapContact(c), dlq);
    }
    const opps = await fetchOpportunities(token, cfg.baseUrl, cfg.sinceMs);
    for (const o of opps) {
      await up.upsertOrDlq('opportunity', mapOpportunity(o), dlq);
    }
  } finally {
    await up.close();
    await dlq.quit();
  }
}

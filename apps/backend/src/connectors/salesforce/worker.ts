import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
import { Redis } from 'ioredis';
import type { Redis as RedisClient } from 'ioredis';
import { getAccessToken, SfdcAuthConfig } from './auth.js';
import { mapContact, mapOpportunity, type SfdcContact, type SfdcOpportunity } from './mapping.js';
import { Upserter, WorkBuoyCfg } from './upsert.js';

export interface WorkerConfig {
  auth: SfdcAuthConfig;
  sfdcBaseUrl: string; // e.g., https://yourInstance.salesforce.com/services/data/v59.0
  sinceMs: number;
  redisUrl: string;
  workbuoy: WorkBuoyCfg;
}

async function parseJsonArray<T>(res: Response): Promise<T[]> {
  const payload = (await res.json()) as unknown;
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload as T[];
}

async function fetchContacts(accessToken: string, base: string, sinceMs: number): Promise<SfdcContact[]> {
  // For tests we allow a simplified provider API: GET /contacts?since=<ms>
  const url = `${base}/contacts?since=${sinceMs}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('sfdc contacts fetch failed: '+res.status);
  return parseJsonArray<SfdcContact>(res);
}

async function fetchOpportunities(accessToken: string, base: string, sinceMs: number): Promise<SfdcOpportunity[]> {
  const url = `${base}/opportunities?since=${sinceMs}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('sfdc opps fetch failed: '+res.status);
  return parseJsonArray<SfdcOpportunity>(res);
}

export async function runOnce(cfg: WorkerConfig) {
  const token = await getAccessToken(cfg.auth);
  const dlq: RedisClient = new Redis(cfg.redisUrl);
  const up = new Upserter(cfg.redisUrl, cfg.workbuoy);
  try {
    const contacts = await fetchContacts(token, cfg.sfdcBaseUrl, cfg.sinceMs);
    for (const c of contacts) {
      await up.upsertOrDlq('contact', mapContact(c), dlq);
    }
    const opps = await fetchOpportunities(token, cfg.sfdcBaseUrl, cfg.sinceMs);
    for (const o of opps) {
      await up.upsertOrDlq('opportunity', mapOpportunity(o), dlq);
    }
  } finally {
    await up.close();
    await dlq.quit();
  }
}

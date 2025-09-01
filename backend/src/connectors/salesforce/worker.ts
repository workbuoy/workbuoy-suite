import fetch from 'node-fetch';
import Redis from 'ioredis';
import { getAccessToken, SfdcAuthConfig } from './auth.js';
import { mapContact, mapOpportunity } from './mapping.js';
import { Upserter, WorkBuoyCfg } from './upsert.js';

export interface WorkerConfig {
  auth: SfdcAuthConfig;
  sfdcBaseUrl: string; // e.g., https://yourInstance.salesforce.com/services/data/v59.0
  sinceMs: number;
  redisUrl: string;
  workbuoy: WorkBuoyCfg;
}

async function fetchContacts(accessToken: string, base: string, sinceMs: number) {
  // For tests we allow a simplified provider API: GET /contacts?since=<ms>
  const url = `${base}/contacts?since=${sinceMs}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('sfdc contacts fetch failed: '+res.status);
  return await res.json();
}

async function fetchOpportunities(accessToken: string, base: string, sinceMs: number) {
  const url = `${base}/opportunities?since=${sinceMs}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('sfdc opps fetch failed: '+res.status);
  return await res.json();
}

export async function runOnce(cfg: WorkerConfig) {
  const token = await getAccessToken(cfg.auth);
  const dlq = new Redis(cfg.redisUrl);
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

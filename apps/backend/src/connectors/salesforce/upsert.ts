import fetch from 'node-fetch';
import Redis from 'ioredis';
import { sf_dlq_total, sf_errors_total, sf_ingest_total } from './metrics.js';

export interface WorkBuoyCfg {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
}

export class Upserter {
  private redis: Redis;
  private idempTTL = parseInt(process.env.SFDC_IDEMP_TTL_SEC || '86400',10);

  constructor(redisUrl: string, private wb: WorkBuoyCfg) {
    this.redis = new Redis(redisUrl);
  }

  async close(){ await this.redis.quit(); }

  private async idempotentKeyExists(kind: string, extId: string) {
    const k = `wb:idemp:sfdc:${kind}:${extId}`;
    const ok = await this.redis.set(k, '1', 'EX', this.idempTTL, 'NX');
    return ok === null; // exists if set returns null
  }

  private async push(kind: 'contact'|'opportunity', body: any) {
    // Idempotency (worker-side) to avoid duplicates
    if (await this.idempotentKeyExists(kind, body.external_id)) return;

    const path = kind === 'contact' ? '/api/v1/crm/contacts' : '/api/v1/crm/opportunities';
    const res = await fetch(`${this.wb.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'x-tenant-id': this.wb.tenantId,
        'x-api-key': this.wb.apiKey,
        'x-user-role': 'admin'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`wb upsert failed ${res.status}`);
    sf_ingest_total.labels(kind, 'poll').inc();
  }

  async upsertOrDlq(kind: 'contact'|'opportunity', body: any, dlq: Redis) {
    const max = parseInt(process.env.SFDC_RETRY_MAX || '5', 10);
    let attempt = 0;
    while (attempt < max) {
      try {
        await this.push(kind, body);
        return;
      } catch (e) {
        attempt++;
        sf_errors_total.labels('upsert').inc();
        // backoff
        await new Promise(r=>setTimeout(r, Math.min(1000, attempt*100)));
      }
    }
    sf_dlq_total.labels('upsert_failed').inc();
    await dlq.lpush('wb:dlq:salesforce', JSON.stringify({ kind, body, reason: 'upsert_failed', ts: Date.now() }));
  }
}

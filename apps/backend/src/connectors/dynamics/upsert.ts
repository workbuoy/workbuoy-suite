import fetch from 'node-fetch';
import { Redis } from 'ioredis';
import { dyn_dlq_total, dyn_errors_total, dyn_ingest_total } from './metrics.js';

export interface WorkBuoyCfg {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
}

type RedisClient = Redis;

export class Upserter {
  private redis: RedisClient;
  private idempTTL = parseInt(process.env.DYN_IDEMP_TTL_SEC || '86400',10);

  constructor(redisUrl: string, private wb: WorkBuoyCfg) {
    this.redis = new Redis(redisUrl);
  }

  async close(){ await this.redis.quit(); }

  private async idempotentKeyExists(kind: string, extId: string) {
    const k = `wb:idemp:dyn:${kind}:${extId}`;
    const ok = await this.redis.set(k, '1', 'EX', this.idempTTL, 'NX');
    return ok === null;
  }

  private async push(kind: 'contact'|'opportunity', body: any) {
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
    dyn_ingest_total.labels(kind, 'poll').inc();
  }

  async upsertOrDlq(kind: 'contact'|'opportunity', body: any, dlq: RedisClient) {
    const max = parseInt(process.env.DYN_RETRY_MAX || '5', 10);
    let attempt = 0;
    while (attempt < max) {
      try {
        await this.push(kind, body);
        return;
      } catch (e) {
        attempt++;
        dyn_errors_total.labels('upsert').inc();
        await new Promise(r=>setTimeout(r, Math.min(1000, attempt*100)));
      }
    }
    dyn_dlq_total.labels('upsert_failed').inc();
    await dlq.lpush('wb:dlq:dynamics', JSON.stringify({ kind, body, reason: 'upsert_failed', ts: Date.now() }));
  }
}

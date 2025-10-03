import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import { SecureDb } from '../storage/secureDb.js';
import { span } from '../telemetry/otel.js';

type PendingOpRow = {
  id: string;
  entity_type: string;
  op: 'create' | 'update' | 'delete';
  payload_b64: string;
  ts: number;
};

export interface SyncConfig {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
  conflict?: 'lww' | 'merge';
  onMerge?: (entity: string, local: any, remote: any) => any;
}

export class SyncEngine {
  constructor(private db: SecureDb, private cfg: SyncConfig) {}

  async enqueueCreate(entityType: 'contact' | 'opportunity', payload: any) {
    this.db.enqueueOp(randomUUID(), entityType, 'create', { ...payload, updated_at: Date.now() }, Date.now());
  }

  async enqueueUpdate(entityType: 'contact' | 'opportunity', id: string, patch: any) {
    this.db.enqueueOp(id, entityType, 'update', { ...patch, id, updated_at: Date.now() }, Date.now());
  }

  private async authorizedFetch(path: string, init?: RequestInit) {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.cfg.apiKey,
      'x-tenant-id': this.cfg.tenantId,
      ...(init?.headers || {}),
    } as Record<string, string>;
    return fetch(`${this.cfg.baseUrl}${path}`, { ...(init || {}), headers } as any);
  }

  private async push(op: PendingOpRow & { payload: any }) {
    const path = op.entity_type === 'contact' ? '/api/v1/crm/contacts' : '/api/v1/crm/opportunities';
    if (op.op === 'create') {
      const res = await this.authorizedFetch(path, { method: 'POST', body: JSON.stringify(op.payload) });
      if (!res.ok) {
        throw new Error(`create-failed:${res.status}`);
      }
      return;
    }

    if (op.op === 'update') {
      const id = op.id || op.payload.id;
      let res = await this.authorizedFetch(`${path}/${id}`, { method: 'PATCH', body: JSON.stringify(op.payload) });
      if (res.status === 409) {
        if ((this.cfg.conflict || 'lww') === 'lww') {
          res = await this.authorizedFetch(`${path}/${id}?force=1`, {
            method: 'PATCH',
            body: JSON.stringify(op.payload),
          });
        } else {
          const current = (await (await this.authorizedFetch(`${path}/${id}`, { method: 'GET' })).json()) as Record<string, any>;
          const merged = this.cfg.onMerge
            ? this.cfg.onMerge(op.entity_type, op.payload, current)
            : { ...(current || {}), ...(op.payload || {}), updated_at: Date.now() };
          res = await this.authorizedFetch(`${path}/${id}`, { method: 'PATCH', body: JSON.stringify(merged) });
        }
      }
      if (!res.ok) {
        throw new Error(`update-failed:${res.status}`);
      }
    }
  }

  async syncOnce() {
    const { rows, ack } = this.db.popNextOps(200);
    const ids: string[] = [];
    try {
      for (const row of rows as PendingOpRow[]) {
        const payload = JSON.parse(Buffer.from(row.payload_b64, 'base64').toString('utf8'));
        await this.push({ ...row, payload });
        ids.push(row.id);
        await span('sync.push', { entity: row.entity_type, op: row.op });
      }
      ack(ids);
    } catch (err) {
      throw err;
    }
  }

  countPending() {
    return this.db.countPending();
  }

  status() {
    return { pending: this.countPending() };
  }

  getStatus() {
    return this.status();
  }
}

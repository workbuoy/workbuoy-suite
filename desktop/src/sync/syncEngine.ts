import fetch from 'node-fetch';
import { SecureDb } from '../storage/secureDb.js';
import { randomUUID } from 'crypto';
import { span } from '../telemetry/otel.js';

export interface SyncConfig {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
  conflict?: 'lww'|'merge';
}

export class SyncEngine {
  constructor(private db: SecureDb, private cfg: SyncConfig) {}

  async enqueueCreate(entityType: 'contact'|'opportunity', payload: any) {
    this.db.enqueueOp(randomUUID(), entityType, 'create', { ...payload, updated_at: Date.now() }, Date.now());
  }

  async enqueueUpdate(entityType: 'contact'|'opportunity', id: string, patch: any) {
    this.db.enqueueOp(id, entityType, 'update', { ...patch, id, updated_at: Date.now() }, Date.now());
  }

  private async authorizedFetch(path: string, init?: any) {
    const headers = {
      'Content-Type':'application/json',
      'x-api-key': this.cfg.apiKey,
      'x-tenant-id': this.cfg.tenantId,
      ...(init?.headers || {})
    };
    return await fetch(`${this.cfg.baseUrl}${path}`, { ...(init||{}), headers });
  }

  private async push(op: any) {
    const path = op.entity_type === 'contact' ? '/api/v1/crm/contacts' : '/api/v1/crm/opportunities';
    if (op.op === 'create') {
      const res = await this.authorizedFetch(path, { method: 'POST', body: JSON.stringify(op.payload) });
      if (!res.ok) throw new Error('create-failed:'+res.status);
      return;
    } else if (op.op === 'update') {
      const id = op.id || op.payload.id;
      let res = await this.authorizedFetch(`${path}/${id}`, { method: 'PATCH', body: JSON.stringify(op.payload) });
      if (res.status === 409) {
        // conflict
        if ((this.cfg.conflict||'lww') === 'lww') {
          res = await this.authorizedFetch(`${path}/${id}?force=1`, { method: 'PATCH', body: JSON.stringify(op.payload) });
        } else {
          // merge: fetch server version, shallow-merge fields (server takes precedence unless overwritten locally)
          const cur = await (await this.authorizedFetch(`${path}/${id}`, { method: 'GET' })).json();
          const merged = { ...cur, ...op.payload, updated_at: Date.now() };
          res = await this.authorizedFetch(`${path}/${id}`, { method: 'PATCH', body: JSON.stringify(merged) });
        }
      }
      if (!res.ok) throw new Error('update-failed:'+res.status);
      return;
    }
  }

  async syncOnce() {
    const { rows, ack } = this.db.popNextOps(200);
    const ids: string[] = [];
    try {
      for (const r of rows) {
        const payload = JSON.parse(Buffer.from(r.payload_b64, 'base64').toString('utf8'));
        await this.push({ ...r, payload });
        ids.push(r.id);
        await span('sync.push', { entity: r.entity_type, op: r.op });
      }
      ack(ids);
    } catch (e) {
      throw e;
    }
  }

  countPending(){ return this.db.countPending(); }
}

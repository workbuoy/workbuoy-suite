import { db } from '../db/knex.js';
import { randomUUID } from 'crypto';

type T = Record<string, any>;

function now(){ return Math.floor(Date.now()/1000); }

function withDefaults(tenant_id: string, body: any) {
  const ts = now();
  return {
    id: body.id || randomUUID(),
    tenant_id,
    created_at: ts,
    updated_at: ts,
    ...body,
  };
}

export const repo = {
  async list(table: string, tenant_id: string, limit=50) {
    const rows = await db(table).where({ tenant_id }).orderBy('updated_at', 'desc').limit(limit);
    return rows.map((r:any)=>({ ...r, custom_fields: r.custom_fields ? JSON.parse(r.custom_fields) : undefined }));
  },
  async get(table: string, tenant_id: string, id: string) {
    const r = await db(table).where({ tenant_id, id }).first();
    if (!r) return null;
    return { ...r, custom_fields: r.custom_fields ? JSON.parse(r.custom_fields) : undefined };
  },
  async create(table: string, tenant_id: string, body: any) {
    const row = withDefaults(tenant_id, body);
    if (row.custom_fields) row.custom_fields = JSON.stringify(row.custom_fields);
    await db(table).insert(row);
    if (row.custom_fields) row.custom_fields = JSON.parse(row.custom_fields);
    return row;
  },
  async patch(table: string, tenant_id: string, id: string, patch: any) {
    const existing = await db(table).where({ tenant_id, id }).first();
    if (!existing) return null;
    const merged = { ...existing, ...patch, updated_at: now() };
    if (merged.custom_fields && typeof merged.custom_fields !== 'string') merged.custom_fields = JSON.stringify(merged.custom_fields);
    await db(table).where({ tenant_id, id }).update(merged);
    const r = await db(table).where({ tenant_id, id }).first();
    if (r?.custom_fields) r.custom_fields = JSON.parse(r.custom_fields);
    return r;
  },
  async del(table: string, tenant_id: string, id: string) {
    await db(table).where({ tenant_id, id }).delete();
  }
};

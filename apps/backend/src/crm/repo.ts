import { randomUUID } from 'crypto';
import { db } from '../db/knex.js';

type TenantContext = {
  tenant_id: string;
  user_id?: string;
  roles?: string[];
};

type Row = Record<string, any> & {
  id?: string;
  tenant_id?: string;
  custom_fields?: unknown;
};

function now() {
  return Math.floor(Date.now() / 1000);
}

function parseRow(row: Row | undefined | null): Row | null {
  if (!row) {
    return null;
  }
  if (typeof row.custom_fields === 'string') {
    try {
      return { ...row, custom_fields: JSON.parse(row.custom_fields) };
    } catch {
      return { ...row, custom_fields: undefined };
    }
  }
  return { ...row };
}

function withDefaults(tenant_id: string, body: Row): Row {
  const ts = now();
  return {
    id: body.id || randomUUID(),
    tenant_id,
    created_at: ts,
    updated_at: ts,
    ...body,
  };
}

function applyCursor<T extends { id?: string }>(rows: T[], cursor?: string) {
  if (!cursor) {
    return rows;
  }
  const idx = rows.findIndex((row) => row.id === cursor);
  return idx >= 0 ? rows.slice(idx + 1) : rows;
}

async function list(table: string, tenant_id: string, limit = 50) {
  const rows: Row[] = await db(table)
    .where({ tenant_id })
    .orderBy('updated_at', 'desc')
    .limit(limit);
  return rows
    .map((r) => parseRow(r))
    .filter((r): r is Row => Boolean(r));
}

async function get(table: string, tenant_id: string, id: string) {
  return parseRow(await db(table).where({ tenant_id, id }).first());
}

async function create(table: string, tenant_id: string, body: Row) {
  const row = withDefaults(tenant_id, body);
  const toInsert = { ...row };
  if (toInsert.custom_fields && typeof toInsert.custom_fields !== 'string') {
    toInsert.custom_fields = JSON.stringify(toInsert.custom_fields);
  }
  await db(table).insert(toInsert);
  return parseRow(row) ?? row;
}

async function patch(table: string, tenant_id: string, id: string, patchBody: Row) {
  const existing = await db(table).where({ tenant_id, id }).first();
  if (!existing) {
    return null;
  }
  const merged: Row = { ...existing, ...patchBody, updated_at: now() };
  const toUpdate = { ...merged };
  if (toUpdate.custom_fields && typeof toUpdate.custom_fields !== 'string') {
    toUpdate.custom_fields = JSON.stringify(toUpdate.custom_fields);
  }
  await db(table).where({ tenant_id, id }).update(toUpdate);
  return parseRow(await db(table).where({ tenant_id, id }).first());
}

async function del(table: string, tenant_id: string, id: string) {
  await db(table).where({ tenant_id, id }).delete();
}

async function listContacts(ctx: TenantContext, limit = 50, cursor?: string) {
  const rows = await list('contacts', ctx.tenant_id, limit);
  return applyCursor(rows, cursor);
}

async function createContact(ctx: TenantContext, body: Row) {
  return create('contacts', ctx.tenant_id, body);
}

async function updateContact(ctx: TenantContext, id: string, patchBody: Row) {
  return patch('contacts', ctx.tenant_id, id, patchBody);
}

async function listPipelines(ctx: TenantContext) {
  return list('pipelines', ctx.tenant_id, 50);
}

async function upsertPipeline(ctx: TenantContext, id: string | undefined, body: Row) {
  if (id) {
    return patch('pipelines', ctx.tenant_id, id, body);
  }
  return create('pipelines', ctx.tenant_id, body);
}

async function listOpportunities(ctx: TenantContext, limit = 50, cursor?: string) {
  const rows = await list('opportunities', ctx.tenant_id, limit);
  return applyCursor(rows, cursor);
}

async function createOpportunity(ctx: TenantContext, body: Row) {
  return create('opportunities', ctx.tenant_id, body);
}

async function patchOpportunity(ctx: TenantContext, id: string, patchBody: Row) {
  return patch('opportunities', ctx.tenant_id, id, patchBody);
}

export const repo = {
  list,
  get,
  create,
  patch,
  del,
  listContacts,
  createContact,
  updateContact,
  listPipelines,
  upsertPipeline,
  listOpportunities,
  createOpportunity,
  patchOpportunity,
};

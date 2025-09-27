// @ts-nocheck
import { Router } from 'express';
import { randomUUID, createHash } from 'crypto';
import { selectRepo } from '../core/persist/select';
import { policyGuardWrite } from '../core/policy/guard';

export type AuditRow = {
  id: string;
  ts: string;
  route: string;
  method: string;
  status?: number;
  wb?: any;
  explanations?: any[];
  prevHash: string;
  hash: string;
  payloadHash: string;
};

const repo = selectRepo<AuditRow>('audit_log');
const auditLog: AuditRow[] = [];
let hydrated = false;
let lastHash = 'GENESIS';

function computePayloadHash(payload: Pick<AuditRow, 'route' | 'method' | 'status' | 'wb' | 'explanations'>) {
  return createHash('sha256').update(JSON.stringify({
    route: payload.route,
    method: payload.method,
    status: payload.status ?? null,
    wb: payload.wb ?? null,
    explanations: payload.explanations ?? null
  })).digest('hex');
}

async function ensureHydrated() {
  if (hydrated) return;
  const rows = await repo.all();
  rows.sort((a, b) => a.ts.localeCompare(b.ts));
  auditLog.splice(0, auditLog.length, ...rows);
  lastHash = rows.length ? rows[rows.length - 1].hash : 'GENESIS';
  hydrated = true;
}

export async function appendAudit(entry: Omit<AuditRow, 'id' | 'ts' | 'prevHash' | 'hash' | 'payloadHash'>) {
  await ensureHydrated();
  const ts = new Date().toISOString();
  const payloadHash = computePayloadHash(entry);
  const prevHash = auditLog.length ? auditLog[auditLog.length - 1].hash : lastHash;
  const hash = createHash('sha256').update(`${ts}|${prevHash}|${payloadHash}`).digest('hex');
  const stored: AuditRow = {
    id: randomUUID(),
    ts,
    prevHash,
    hash,
    payloadHash,
    ...entry
  };
  await repo.upsert(stored);
  auditLog.push(stored);
  lastHash = hash;
  return stored;
}

async function verifyChain() {
  const rows = await repo.all();
  rows.sort((a, b) => a.ts.localeCompare(b.ts));
  let prev = 'GENESIS';
  for (const row of rows) {
    const payloadHash = computePayloadHash(row);
    const expectedHash = createHash('sha256').update(`${row.ts}|${prev}|${payloadHash}`).digest('hex');
    if (row.prevHash !== prev || row.hash !== expectedHash) {
      return false;
    }
    prev = row.hash;
  }
  return true;
}

export { auditLog };

export function auditRouter() {
  const r = Router();

  r.post('/', policyGuardWrite('audit'), async (req, res, next) => {
    try {
      const route =
        typeof req.body?.route === 'string' && req.body.route.length
          ? req.body.route
          : req.originalUrl;
      const method =
        typeof req.body?.method === 'string' && req.body.method.length
          ? req.body.method
          : req.method ?? 'GET';
      const base = {
        route,
        method,
        status: req.body?.status as number | undefined,
        wb: req.wb,
        explanations: req.body?.explanations
      };
      await appendAudit(base);
      res.json({ ok: true, size: auditLog.length });
    } catch (err) {
      next(err);
    }
  });

  r.get('/', async (_req, res, next) => {
    try {
      await ensureHydrated();
      res.json({ ok: true, size: auditLog.length, log: auditLog });
    } catch (err) {
      next(err);
    }
  });

  r.get('/verify', async (_req, res, next) => {
    try {
      const ok = await verifyChain();
      res.status(ok ? 200 : 500).json({ ok });
    } catch (err) {
      next(err);
    }
  });

  return r;
}

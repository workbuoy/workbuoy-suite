import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { WbContext } from '../types/wb-context';

type RequestWithCorrelation = Request & { correlationId?: string };

function toOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return toOptionalString(value[0]);
  }
  const asString = String(value).trim();
  return asString.length ? asString : undefined;
}

function parseAutonomy(value: unknown, fallback?: string | number): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return fallback;
  }
  if (typeof fallback === 'string' && fallback.trim().length) {
    const numeric = Number(fallback);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return undefined;
}

export function wbContext(req: Request, _res: Response, next: NextFunction): void {
  const headers = req.headers;
  const correlatedReq = req as RequestWithCorrelation;
  const existing = (req.wb ?? {}) as WbContext;

  const headerCorrelation = correlatedReq.correlationId;
  const correlationId =
    headerCorrelation ??
    (headers['x-correlation-id'] as string | undefined) ??
    existing.correlationId ??
    (typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2));

  const autonomyLevel = parseAutonomy(
    headers['x-autonomy-level'] ?? headers['x-wb-autonomy'] ?? headers['x-autonomy'],
    existing.autonomyLevel ?? existing.autonomy,
  );

  const roleHeader =
    (headers['x-role'] ?? headers['x-role-id'] ?? headers['x-wb-role']) as string | undefined;
  const roleId = toOptionalString(roleHeader) ?? existing.roleId;

  const intentHeader = headers['x-wb-intent'];
  const whenHeader = headers['x-wb-when'];
  const selectedIdHeader = headers['x-wb-selected-id'];
  const selectedTypeHeader = headers['x-wb-selected-type'];

  const ctx: WbContext = {
    ...existing,
    intent: intentHeader !== undefined ? toOptionalString(intentHeader) : existing.intent,
    when: whenHeader !== undefined ? toOptionalString(whenHeader) ?? existing.when : existing.when,
    autonomy: autonomyLevel ?? existing.autonomy,
    autonomyLevel: autonomyLevel ?? existing.autonomyLevel,
    roleId,
    role: roleId ?? existing.role,
    selectedId:
      selectedIdHeader !== undefined
        ? toOptionalString(selectedIdHeader)
        : existing.selectedId,
    selectedType:
      selectedTypeHeader !== undefined
        ? toOptionalString(selectedTypeHeader)
        : existing.selectedType,
    correlationId,
  };

  req.wb = ctx as WbContext;
  correlatedReq.correlationId = correlationId;
  next();
}

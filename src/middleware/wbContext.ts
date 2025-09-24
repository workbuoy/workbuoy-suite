import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

function parseAutonomy(value: unknown, fallback?: number): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return fallback;
}

export function wbContext(req: Request, _res: Response, next: NextFunction) {
  const headers = req.headers;
  const existing: Partial<WbContext> = req.wb ?? {};

  const headerCorrelation = (req as any).correlationId as string | undefined;
  const correlationId =
    headerCorrelation ||
    (headers["x-correlation-id"] as string) ||
    existing.correlationId ||
    (typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2));

  const autonomyLevel = parseAutonomy(
    headers["x-autonomy-level"] ?? headers["x-wb-autonomy"] ?? headers["x-autonomy"],
    existing.autonomyLevel
  );

  const roleHeader =
    (headers["x-role"] || headers["x-role-id"] || headers["x-wb-role"]) as string | undefined;
  const roleId = roleHeader?.toString().trim() || existing.roleId;

  const ctx: WbContext = {
    ...existing,
    intent: String(headers["x-wb-intent"] || existing.intent || "") || undefined,
    when: String(headers["x-wb-when"] || existing.when || "") || undefined,
    autonomy: autonomyLevel ?? existing.autonomy,
    autonomyLevel: autonomyLevel ?? existing.autonomyLevel,
    roleId: roleId || existing.roleId,
    role: roleId || existing.role,
    selectedId: String(headers["x-wb-selected-id"] || existing.selectedId || "") || undefined,
    selectedType: String(headers["x-wb-selected-type"] || existing.selectedType || "") || undefined,
    correlationId
  };

  req.wb = ctx;
  (req as any).correlationId = correlationId;
  next();
}

/**
 * Build Buoy context from request.
 */
import type { Request } from "express";

export type BuoyContext = {
  correlationId: string;
  roleId: string;
  autonomyLevel: 0 | 1 | 2;
  confidence?: number;
};

function readHeader(req: Request, name: string): string | undefined {
  const v = req.headers[name.toLowerCase()];
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : String(v);
}

export function buildContext(req: Request): BuoyContext {
  const wb: any = (req as any).wb || {};
  const corr =
    wb.correlationId ||
    readHeader(req, "x-correlation-id") ||
    Math.random().toString(36).slice(2);

  const role = wb.roleId || readHeader(req, "x-role-id") || "anon";
  const auto = Number(wb.autonomyLevel ?? readHeader(req, "x-autonomy") ?? 0);
  const autonomyLevel = (auto === 0 || auto === 1) ? (auto as 0|1) : 2;

  return {
    correlationId: String(corr),
    roleId: String(role),
    autonomyLevel,
    confidence: typeof wb.confidence === "number" ? wb.confidence : undefined
  };
}

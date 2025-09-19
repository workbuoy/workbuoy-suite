import type { Request, Response, NextFunction } from 'express';
import { policyCheck } from '../policyV2';
import { AppError } from '../http/middleware/errorHandler';

function resolveAutonomy(req: Request): number | undefined {
  const wb: any = (req as any).wb || {};
  const header =
    req.headers['x-autonomy-level'] ??
    req.headers['x-wb-autonomy'] ??
    req.headers['x-autonomy'];
  const source = wb.autonomyLevel ?? wb.autonomy ?? header;
  if (source === undefined || source === null) return undefined;
  const value = typeof source === 'number' ? source : Number(source);
  if (!Number.isFinite(value)) return NaN;
  return value;
}

export function policyGuardWrite(capability: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const autonomy = resolveAutonomy(req);
      if (autonomy === undefined) {
        throw new AppError(400, 'E_POLICY_HEADERS_MISSING', 'E_POLICY_HEADERS_MISSING', [
          {
            reasoning: 'x-autonomy-level header is required for write operations',
            policyBasis: ['header:x-autonomy-level']
          }
        ]);
      }
      if (Number.isNaN(autonomy)) {
        throw new AppError(400, 'E_POLICY_HEADERS_INVALID', 'E_POLICY_HEADERS_INVALID', [
          {
            reasoning: 'x-autonomy-level header must be numeric',
            policyBasis: ['header:x-autonomy-level']
          }
        ]);
      }

      const wb: any = (req as any).wb || {};
      wb.autonomyLevel = autonomy;
      wb.autonomy = autonomy;
      (req as any).wb = wb;

      const result = await policyCheck({ capability: `write:${capability}` }, { autonomy_level: autonomy as any });
      if (!result.allowed) {
        throw new AppError(403, 'Policy denied', 'E_POLICY_DENIED', [
          {
            reasoning: result.explanation,
            policyBasis: result.basis || [],
            impact: result.impact || undefined
          }
        ]);
      }
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

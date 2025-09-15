import type { Request, Response, NextFunction } from 'express';
import { policyCheck } from '../policyV2';
import { AppError } from '../http/middleware/errorHandler';

export function policyGuardWrite(capability: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const wb: any = (req as any).wb || {};
      const autonomy = Number(wb.autonomyLevel || 0);
      const result = await policyCheck({ capability: `write:${capability}` }, { autonomy_level: autonomy });
      if (!result.allowed) {
        throw new AppError(403, 'Policy denied', 'E_POLICY_DENIED', [{
          reasoning: result.explanation,
          policyBasis: result.basis || [],
          impact: result.impact || undefined
        }]);
      }
      return next();
    } catch (e) { return next(e); }
  };
}

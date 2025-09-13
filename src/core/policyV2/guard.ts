import { Request, Response, NextFunction } from 'express';
import { AppError } from '../http/middleware/errorHandler';

/**
 * MVP policy: gate write operations when autonomy < 2
 * write = POST|PUT|PATCH|DELETE
 */
export function policyV2Guard(req: Request, _res: Response, next: NextFunction){
  const method = req.method.toUpperCase();
  const isWrite = ['POST','PUT','PATCH','DELETE'].includes(method);
  const level = Number(req.wb?.autonomyLevel || 0);
  if (isWrite && level < 2){
    const expl = [{ reasoning: 'Write requires autonomy >= 2', policyBasis: 'autonomy', impact: 'ask_approval or deny', confidence: 0.9 }];
    return next(new AppError('E_POLICY_DENIED', 'Not allowed at current autonomy level', 403, expl));
  }
  return next();
}

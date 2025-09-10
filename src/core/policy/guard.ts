import { log } from '../logging/logger';
import type { Request, Response, NextFunction } from 'express';

export type DegradedMode = 'ask_approval'|'read_only'|'supervised';

export interface Explanation {
  reasoning: string;
  sources: Array<{ uri: string; label?: string }>;
  confidence: number;
  impact?: string|number;
  alternatives?: Array<{ type: string; payload?: Record<string,unknown> }>;
  policyBasis?: string;
}

function isWriteMethod(method?: string) {
  return !!method && !['GET','HEAD','OPTIONS'].includes(method.toUpperCase());
}

/**
 * MVP-regler:
 *  - Autonomi 0/1: alle write → deny (read_only)
 *  - Autonomi 2: write → degrade to ask_approval
 *  - Read (GET) alltid OK
 */
export function policyGuard() {
  return (req: Request & { wb?: any }, res: Response & { locals: any }, next: NextFunction) => {
    const level: 0|1|2|3|4|5 = req.wb?.autonomyLevel ?? 0;
    const correlationId = req.wb?.correlationId ?? 'unknown';
    const roleId = req.wb?.roleId ?? 'unknown';
    const confidence = typeof req.wb?.confidence === 'number' ? req.wb.confidence : 1;

    if (!isWriteMethod(req.method)) return next();

    // write-forsøk
    if (level === 0 || level === 1) {
      const explanation: Explanation = {
        reasoning: 'Write was denied due to autonomy level ≤ 1 (read-only rails).',
        sources: [{ uri: 'policy://autonomy/0-1' }],
        confidence,
        impact: 'prevented side-effect',
        alternatives: [{ type: 'request_approval' }],
        policyBasis: `role=${roleId}; autonomy=${level}; rule=read_only`,
      };
      res.locals.explanations = [...(res.locals.explanations ?? []), explanation];
      log('warn','core','POLICY_DENY',{ correlationId, policyBasis: explanation.policyBasis });
      return res.status(403).json({
        degraded_mode: 'read_only' as DegradedMode,
        explanations: [explanation],
        correlationId,
      });
    }

    if (level === 2) {
      const explanation: Explanation = {
        reasoning: 'Write requires ask_approval at autonomy level 2.',
        sources: [{ uri: 'policy://autonomy/2' }],
        confidence,
        alternatives: [{ type: 'submit_for_approval' }],
        policyBasis: `role=${roleId}; autonomy=2; rule=ask_approval`,
      };
      res.locals.explanations = [...(res.locals.explanations ?? []), explanation];
      log('info','core','POLICY_DEGRADE',{ correlationId, policyBasis: explanation.policyBasis });
      return res.status(403).json({
        degraded_mode: 'ask_approval' as DegradedMode,
        explanations: [explanation],
        correlationId,
      });
    }

    return next();
  };
}

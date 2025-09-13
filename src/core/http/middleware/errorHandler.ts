import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  code: string;
  explanations?: any[];
  constructor(code: string, message: string, status = 400, explanations?: any[]){
    super(message);
    this.code = code;
    this.status = status;
    this.explanations = explanations;
  }
}

export default function errorHandler(err: any, req: Request, res: Response, _next: NextFunction){
  const status = err?.status || 500;
  const code = err?.code || 'E_INTERNAL';
  const explanations = err?.explanations || (status===403 ? [{ reasoning: 'Policy denied', policyBasis: 'autonomy-level', confidence: 0.8 }] : undefined);
  res.status(status).json({ error: { code, message: err?.message || 'Internal Error', correlationId: req.wb?.correlationId, explanations } });
}

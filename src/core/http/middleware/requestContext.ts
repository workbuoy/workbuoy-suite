import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      wb?: {
        correlationId: string;
        roleId?: string;
        autonomyLevel?: number;
      }
    }
  }
}

function uuid4(){
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID();
  const s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  return s;
}

export default function requestContext(req: Request, _res: Response, next: NextFunction){
  const correlationId = (req.header('x-correlation-id') || uuid4()) as string;
  const autonomyLevel = Number(req.header('x-autonomy-level') || 0);
  const roleId = (req.header('x-role-id') || 'user') as string;
  req.wb = { correlationId, autonomyLevel, roleId };
  next();
}

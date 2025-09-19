// src/middleware/correlationHeader.ts
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function correlationHeader(req:Request,res:Response,next:NextFunction){
  const cid = (req.headers['x-correlation-id'] as string)
    || (typeof randomUUID === 'function' ? randomUUID() : Math.random().toString(36).slice(2));
  res.setHeader('x-correlation-id', cid);
  (req as any).correlationId = cid;
  next();
}

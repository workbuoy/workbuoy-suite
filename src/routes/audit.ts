import { Router } from "express";

type AuditRow = {
  ts: string;
  route: string;
  method: string;
  status?: number;
  wb?: any;
  explanations?: any[];
};

const log: AuditRow[] = [];
export const auditLog = log;

export function auditRouter(){
  const r = Router();
  r.post("/api/audit", (req, res)=>{
    const row: AuditRow = {
      ts: new Date().toISOString(),
      route: (req.body?.route)||req.originalUrl,
      method: (req.body?.method)||req.method,
      status: req.body?.status,
      wb: req.wb,
      explanations: req.body?.explanations,
    };
    log.push(row);
    // keep small
    if (log.length > 2000) log.shift();
    res.json({ ok:true, size: log.length });
  });
  r.get("/api/audit", (_req, res)=>{
    res.json({ ok:true, size: log.length, log });
  });
  return r;
}
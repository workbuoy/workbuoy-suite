import { Router } from "express";
import { appendAudit } from "../../core/audit";
import { policyGuard } from "../../core/policy";

type LogEntry = { ts: string; level: "info"|"warn"|"error"; msg: string; meta?: any; hash?: string; prevHash?: string };
const logs: LogEntry[] = [];
const router = Router();

router.post("/api/log", policyGuard, (req, res) => {
  const { level = "info", msg, meta } = req.body || {};
  if (!msg) return res.status(400).json({ error: { message: "msg required" }});
  const entry = appendAudit(`log.${level}`, { msg, meta });
  logs.push({ ts: entry.ts, level, msg, meta, hash: entry.hash, prevHash: entry.prevHash });
  return res.status(201).json({ item: logs[logs.length - 1], correlationId: (req as any).correlationId, explanation: (req as any).__explanation });
});

router.get("/api/log", (req, res) => {
  const level = req.query.level?.toString();
  const items = logs.filter(l => !level || l.level === level);
  return res.json({ items, correlationId: (req as any).correlationId, explanation: (req as any).__explanation });
});

export default router;

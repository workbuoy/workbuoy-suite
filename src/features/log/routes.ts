import { Router } from "express";
import { z } from "zod";
// RAIL:ENTRYPOINT log.routes (hardening)

import { policyV2Guard } from "../../core/policyV2/middleware";
import { writeRateLimiter } from "../../core/http/middleware/rateLimit";

const router = Router();

const NewLog = z.object({
  msg: z.string().min(1),
  level: z.enum(["info","warn","error"]).default("info"),
  meta: z.any().optional(),
});
const Query = z.object({
  limit: z.coerce.number().optional(),
  level: z.enum(["info","warn","error"]).optional()
});

type Entry = { ts:string; level:"info"|"warn"|"error"; msg:string; meta?:any; hash:string; prevHash?:string };
const items: Entry[] = [];

function tryReq<T=any>(m:string):T|null{ try{return require(m);}catch{return null;} }
const audit = tryReq<any>("../../core/audit");
const verify = tryReq<any>("../../core/audit/verify") || tryReq<any>("../../core/auditVerify");

router.get("/api/logs", (req, res, next) => {
  try {
    const q = Query.parse(req.query || {});
    const list = items.filter(i => !q.level || i.level===q.level);
    res.json({ items: list.slice(0, q.limit ?? 100), correlationId: (req as any).wb?.correlationId });
  } catch (e) { next(e); }
});

router.post("/api/logs", writeRateLimiter(), policyV2Guard("write","low"), (req, res, next) => {
  try {
    const body = NewLog.parse(req.body || {});
    const prev = items[0];
    const e: Entry = { ts: new Date().toISOString(), level: body.level, msg: body.msg, meta: body.meta, hash: Math.random().toString(36).slice(2), prevHash: prev?.hash };
    items.unshift(e);
    audit?.append?.({ ts: e.ts, msg: "log.append", meta: { level: e.level } });
    res.status(201).json({ item: e });
  } catch (e) { next(e); }
});

router.get("/api/audit/verify", (_req, res) => {
  if (verify?.verifyHashChain) {
    const ok = verify.verifyHashChain([...items].reverse());
    return res.status(ok.ok ? 200 : 500).json(ok);
  }
  return res.json({ ok: true });
});

export default router;

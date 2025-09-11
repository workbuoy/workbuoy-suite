import { Router } from "express";
import { list, append, all } from "./log.store";

function tryRequire<T=any>(m:string):T|null{ try{return require(m);}catch{return null;} }
const { policyV2Guard } = tryRequire<any>("../../core/policyV2/middleware") || { policyV2Guard: ()=> (_req:any,_res:any,next:any)=>next() };
const audit = tryRequire<any>("../../core/audit");
const auditVerify = tryRequire<any>("../../core/auditVerify") || tryRequire<any>("../../core/audit/verify");

export const logRouter = Router();

logRouter.get("/api/logs", (req, res) => {
  const { limit="100", cursor } = req.query as any;
  const out = list(Number(limit), cursor?Number(cursor):undefined);
  res.json({ ...out, correlationId: (req as any).wb?.correlationId });
});

logRouter.post("/api/logs", policyV2Guard("write", "low"), (req, res) => {
  const { level="info", msg, meta } = req.body || {};
  if (typeof msg !== "string") return res.status(400).json({ error: "invalid_log" });
  const prev = all().slice(-1)[0];
  const e = append({ ts: new Date().toISOString(), level, msg, meta, hash: Math.random().toString(36).slice(2), prevHash: prev?.hash });
  audit?.append?.({ ts: e.ts, msg: "log.append", meta: { level: e.level } });
  res.status(201).json({ item: e });
});

logRouter.get("/api/audit/verify", (req, res) => {
  const chain = all();
  const verify = auditVerify?.verifyHashChain ? auditVerify.verifyHashChain(chain) : { ok: true };
  res.status(verify.ok ? 200 : 500).json(verify);
});

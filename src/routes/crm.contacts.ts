import { Router } from "express";
import { policyGuardWrite } from "../policy/policyGuard";

type Contact = { id:string; name:string; email?:string; createdAt:string };
const db: Record<string, Contact> = {};

export function crmContactsRouter(){
  const r = Router();

  r.get("/api/crm/contacts", (_req, res)=>{
    res.json(Object.values(db));
  });

  r.post("/api/crm/contacts", policyGuardWrite, (req, res)=>{
    const id = (Date.now()).toString(36);
    const c: Contact = { id, name: req.body?.name||"Ukjent", email: req.body?.email, createdAt: new Date().toISOString() };
    db[id] = c;
    res.status(201).json(c);
  });

  r.delete("/api/crm/contacts/:id", policyGuardWrite, (req, res)=>{
    const id = req.params.id;
    delete db[id];
    res.status(204).end();
  });

  return r;
}
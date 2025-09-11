import { Router } from "express";
import { list, create, remove } from "./contacts.store";
import { validateNewContact } from "./contacts.types";

function tryRequire<T=any>(m:string):T|null{ try{return require(m);}catch{return null;} }
const bus = tryRequire<any>("../../core/eventBus");
const { policyV2Guard } = tryRequire<any>("../../core/policyV2/middleware") || { policyV2Guard: ()=> (_req:any,_res:any,next:any)=>next() };

export const crmRouter = Router();

crmRouter.get("/api/crm/contacts", (req, res) => {
  const { query = "", limit = "50", offset = "0" } = req.query as any;
  const items = list(String(query), Number(limit), Number(offset));
  res.json({ items, correlationId: (req as any).wb?.correlationId });
});

crmRouter.post("/api/crm/contacts", policyV2Guard("write", "low"), (req, res) => {
  try {
    validateNewContact(req.body);
  } catch {
    return res.status(400).json({ error: "invalid_contact" });
  }
  const item = create(req.body);
  bus?.emit?.({ type: "crm.contact.created", priority: "medium", payload: { id: item.id } });
  res.status(201).json({ item, correlationId: (req as any).wb?.correlationId, explanations: [] });
});

crmRouter.delete("/api/crm/contacts/:id", policyV2Guard("write", "low"), (req, res) => {
  const ok = remove(req.params.id);
  if (!ok) return res.status(404).end();
  bus?.emit?.({ type: "crm.contact.deleted", priority: "medium", payload: { id: req.params.id } });
  res.status(204).end();
});

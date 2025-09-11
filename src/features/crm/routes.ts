import { Router } from "express";
import { z } from "zod";
// RAIL:ENTRYPOINT crm.routes (hardening)

import { policyV2Guard } from "../../core/policyV2/middleware";
import { writeRateLimiter } from "../../core/http/middleware/rateLimit";
import { AppError } from "../../core/errors/AppError";
import { dbEnabled } from "../../core/config/dbFlag";

// Validation
const NewContact = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
const ContactId = z.object({ id: z.string().min(1) });

// Store (delta-safe)
const items: any[] = [];
// Event/audit (delta-safe)
function tryReq<T=any>(m:string):T|null{ try{return require(m);}catch{return null;} }
const bus = tryReq<any>("../../core/eventBus") || tryReq<any>("../../core/events/bus");
const audit = tryReq<any>("../../core/audit");

const router = Router();

router.get("/api/crm/contacts", (req, res) => {
  const q = (req.query.query as string) || "";
  const limit = Number(req.query.limit || 50);
  const offset = Number(req.query.offset || 0);
  const list = items.filter(i => !q || i.name.toLowerCase().includes(q.toLowerCase()));
  res.json({ items: list.slice(offset, offset+limit), correlationId: (req as any).wb?.correlationId });
});

router.post("/api/crm/contacts", writeRateLimiter(), policyV2Guard("write","low"), (req, res, next) => {
  try {
    const body = NewContact.parse(req.body || {});
    const item = { id: Math.random().toString(36).slice(2), createdAt: new Date().toISOString(), ...body };
    items.unshift(item);
    bus?.emit?.({ type: "crm.contact.created", priority: "medium", payload: { id: item.id } });
    audit?.append?.({ ts: new Date().toISOString(), msg: "crm.contact.created", meta: { id: item.id } });
    res.status(201).json({ item, correlationId: (req as any).wb?.correlationId, explanations: [] });
  } catch (e) { next(e); }
});

router.delete("/api/crm/contacts/:id", writeRateLimiter(), policyV2Guard("write","low"), (req, res, next) => {
  try {
    const { id } = ContactId.parse(req.params);
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) throw new AppError("E_NOT_FOUND","contact not found",404);
    items.splice(idx,1);
    bus?.emit?.({ type: "crm.contact.deleted", priority: "low", payload: { id } });
    audit?.append?.({ ts: new Date().toISOString(), msg: "crm.contact.deleted", meta: { id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;

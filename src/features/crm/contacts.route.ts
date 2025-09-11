import { Router } from "express";
import { z } from "zod";
import { policyGuard } from "../../core/policy";
import crypto from "crypto";

const Contact = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional()
});
export type Contact = z.infer<typeof Contact>;

const NewContact = Contact.partial({ id: true }).refine((v)=>!!(v.name), { message: "name required" });

const store = new Map<string, Contact>();

const router = Router();

router.get("/api/crm/contacts", (req, res) => {
  res.json({ items: Array.from(store.values()), correlationId: (req as any).correlationId, explanation: (req as any).__explanation });
});

router.post("/api/crm/contacts", policyGuard, (req, res) => {
  const parsed = NewContact.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid contact", details: parsed.error.flatten() } });
  const id = crypto.randomUUID();
  const value: Contact = { id, name: parsed.data.name!, email: parsed.data.email, phone: parsed.data.phone };
  store.set(id, value);
  res.status(201).json({ item: value, correlationId: (req as any).correlationId, explanation: (req as any).__explanation });
});

router.delete("/api/crm/contacts/:id", policyGuard, (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ error: { message: "Not found" } });
  store.delete(id);
  res.status(204).end();
});

export default router;

import { Router } from "express";
export const crm = Router();

type Contact = { id: string; name: string; email?: string; createdAt: string };
const store: Record<string, Contact> = {};

crm.get("/api/crm/contacts", (_req, res)=>{
  res.json(Object.values(store));
});

crm.post("/api/crm/contacts", (req, res)=>{
  const autonomy = (req as any).wb?.autonomy ?? 0;
  if (autonomy <= 0){
    return res.status(403).json({
      error: "forbidden",
      explanations: [
        { title:"Autonomi", quote:"Nivå 0 tillater ikke å opprette kontakter.", source:"Policy" },
        { quote:"Bytt modus i Navi (≥1) og prøv igjen." }
      ]
    });
  }
  const id = Math.random().toString(36).slice(2);
  const now = new Date().toISOString();
  const c: Contact = { id, name: req.body?.name || "Uten navn", email: req.body?.email, createdAt: now };
  store[id] = c;
  res.status(201).json(c);
});

crm.delete("/api/crm/contacts/:id", (req, res)=>{
  const autonomy = (req as any).wb?.autonomy ?? 0;
  if (autonomy <= 0){
    return res.status(403).json({
      error: "forbidden",
      explanations: [
        { title:"Autonomi", quote:"Nivå 0 tillater ikke sletting.", source:"Policy" },
        { quote:"Øk nivå i Navi eller be om godkjenning." }
      ]
    });
  }
  const id = req.params.id;
  delete store[id];
  res.status(204).end();
});
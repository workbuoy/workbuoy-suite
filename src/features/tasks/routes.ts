import { Router } from "express";
import { z } from "zod";

// RAIL:ENTRYPOINT tasks.routes
const router = Router();

// Validation
const NewTask = z.object({
  title: z.string().min(1),
  status: z.enum(["todo","doing","done"]).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});
const PatchTask = NewTask.partial();
const TaskId = z.object({ id: z.string().min(1) });

// Store (in-memory; delta-safe)
type Task = { id:string; title:string; status:"todo"|"doing"|"done"; assignee?:string; dueDate?:string; createdAt:string };
const items: Task[] = [];

// Guards / rails
import { policyV2Guard } from "../../core/policyV2/middleware";
function tryReq<T=any>(m:string):T|null{ try{return require(m);}catch{return null;} }
const bus = tryReq<any>("../../core/eventBus") || tryReq<any>("../../core/events/bus");

router.get("/api/tasks", (req, res) => {
  const status = (req.query.status as any) || undefined;
  const filtered = status ? items.filter(i => i.status===status) : items;
  res.json({ items: filtered, correlationId: (req as any).wb?.correlationId });
});

router.post("/api/tasks", policyV2Guard("write","low"), (req, res, next) => {
  try {
    const body = NewTask.parse(req.body || {});
    const t: Task = { id: Math.random().toString(36).slice(2), title: body.title, status: body.status ?? "todo", assignee: body.assignee, dueDate: body.dueDate, createdAt: new Date().toISOString() };
    items.unshift(t);
    bus?.emit?.({ type: "task.created", priority: "high", payload: { id: t.id } });
    res.status(201).json({ item: t });
  } catch (e) { next(e); }
});

router.patch("/api/tasks/:id", policyV2Guard("write","low"), (req, res, next) => {
  try {
    const { id } = TaskId.parse(req.params);
    const patch = PatchTask.parse(req.body || {});
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return res.status(404).json({ error: "not_found" });
    items[idx] = { ...items[idx], ...patch };
    if (patch.status) bus?.emit?.({ type: "task.status.changed", priority: "high", payload: { id, status: patch.status } });
    res.json({ item: items[idx] });
  } catch (e) { next(e); }
});

router.delete("/api/tasks/:id", policyV2Guard("write","low"), (req, res, next) => {
  try {
    const { id } = TaskId.parse(req.params);
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return res.status(404).json({ error: "not_found" });
    items.splice(idx,1);
    bus?.emit?.({ type: "task.deleted", priority: "high", payload: { id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;

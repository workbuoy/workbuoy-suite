import { Router } from "express";
import { z } from "zod";
// RAIL:ENTRYPOINT tasks.routes (hardening)

import { policyV2Guard } from "../../core/policyV2/middleware";
import { writeRateLimiter } from "../../core/http/middleware/rateLimit";
import { AppError } from "../../core/errors/AppError";
import { dbEnabled } from "../../core/config/dbFlag";

// Validation
const NewTask = z.object({
  title: z.string().min(1),
  status: z.enum(["todo","doing","done"]).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});
const PatchTask = NewTask.partial();
const TaskId = z.object({ id: z.string().min(1) });

// Repository selection (delta-safe)
import * as mem from "./tasks.store";
let repo:any = mem;
try { if (dbEnabled()) { repo = require("./tasks.repo"); } } catch { /* fallback */ }

// Event bus (delta-safe)
function tryReq<T=any>(m:string):T|null{ try{return require(m);}catch{return null;} }
const bus = tryReq<any>("../../core/eventBus") || tryReq<any>("../../core/events/bus");

const router = Router();

router.get("/api/tasks", (req, res) => {
  const status = (req.query.status as any) || undefined;
  const items = status ? repo.list(status) : repo.list();
  res.json({ items, correlationId: (req as any).wb?.correlationId });
});

router.post("/api/tasks", writeRateLimiter(), policyV2Guard("write","low"), (req, res, next) => {
  try {
    const body = NewTask.parse(req.body || {});
    const t = repo.create(body);
    bus?.emit?.({ type: "task.created", priority: "high", payload: { id: t.id } });
    res.status(201).json({ item: t });
  } catch (e) { next(e); }
});

router.patch("/api/tasks/:id", writeRateLimiter(), policyV2Guard("write","low"), (req, res, next) => {
  try {
    const { id } = TaskId.parse(req.params);
    const patch = PatchTask.parse(req.body || {});
    const updated = repo.patch(id, patch);
    if (!updated) throw new AppError("E_NOT_FOUND","task not found",404);
    if (patch.status) bus?.emit?.({ type: "task.status.changed", priority: "high", payload: { id, status: patch.status } });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/api/tasks/:id", writeRateLimiter(), policyV2Guard("write","low"), (req, res, next) => {
  try {
    const { id } = TaskId.parse(req.params);
    const ok = repo.remove(id);
    if (!ok) throw new AppError("E_NOT_FOUND","task not found",404);
    bus?.emit?.({ type: "task.deleted", priority: "high", payload: { id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;

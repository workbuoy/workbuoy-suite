import { Router } from "express";
import { z } from "zod";
import { policyGuard } from "../../core/policy";
import { emit } from "../../core/eventBus";
import crypto from "crypto";
import { appendAudit } from "../../core/audit";

const Task = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  status: z.enum(["todo", "doing", "done"]).default("todo"),
  dueAt: z.string().datetime().optional(),
  assignee: z.string().optional()
});
export type Task = z.infer<typeof Task>;

const NewTask = Task.partial({ id: true, status: true }).extend({
  title: z.string().min(1)
});

const store = new Map<string, Task>();
const router = Router();

router.get("/api/tasks", (req, res) => {
  const status = req.query.status?.toString();
  const items = Array.from(store.values()).filter(t => !status || t.status === status);
  res.json({ items, correlationId: (req as any).correlationId, explanation: (req as any).__explanation });
});

router.post("/api/tasks", policyGuard, async (req, res) => {
  const parsed = NewTask.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid task", details: parsed.error.flatten() }});
  const id = crypto.randomUUID();
  const task: Task = { id, title: parsed.data.title, status: parsed.data.status ?? "todo", dueAt: parsed.data.dueAt, assignee: parsed.data.assignee };
  store.set(id, task);
  appendAudit("task.create", { id, task });
  await emit({ type: "task.created", payload: task, priority: "normal" });
  res.status(201).json({ item: task, correlationId: (req as any).correlationId, explanation: (req as any).__explanation });
});

router.patch("/api/tasks/:id", policyGuard, async (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ error: { message: "Not found" } });
  const patch = Task.partial({ id: true }).safeParse(req.body);
  if (!patch.success) return res.status(400).json({ error: { message: "Invalid patch", details: patch.error.flatten() }});
  const prev = store.get(id)!;
  const next = { ...prev, ...patch.data };
  store.set(id, next);
  appendAudit("task.update", { id, patch: patch.data });
  await emit({ type: "task.updated", payload: next, priority: "normal" });
  res.json({ item: next, correlationId: (req as any).correlationId, explanation: (req as any).__explanation });
});

router.delete("/api/tasks/:id", policyGuard, async (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ error: { message: "Not found" } });
  store.delete(id);
  appendAudit("task.delete", { id });
  await emit({ type: "task.deleted", payload: { id }, priority: "low" });
  res.status(204).end();
});

export default router;

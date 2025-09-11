import { Router } from "express";
import { list, create, patch, remove } from "./tasks.store";
import { validateNewTask, validatePatch } from "./tasks.types";

function tryRequire<T=any>(m:string):T|null{ try{return require(m);}catch{return null;} }
const bus = tryRequire<any>("../../core/eventBus");
const { policyV2Guard } = tryRequire<any>("../../core/policyV2/middleware") || { policyV2Guard: ()=> (_req:any,_res:any,next:any)=>next() };

export const tasksRouter = Router();

tasksRouter.get("/api/tasks", (req, res) => {
  const status = (req.query.status as any) || undefined;
  const items = list(status);
  res.json({ items, correlationId: (req as any).wb?.correlationId });
});

tasksRouter.post("/api/tasks", policyV2Guard("write", "low"), (req, res) => {
  try { validateNewTask(req.body); } catch { return res.status(400).json({ error: "invalid_task" }); }
  const item = create(req.body);
  bus?.emit?.({ type: "task.changed", priority: "high", payload: { id: item.id, op: "create" } });
  res.status(201).json({ item });
});

tasksRouter.patch("/api/tasks/:id", policyV2Guard("write", "low"), (req, res) => {
  try { validatePatch(req.body); } catch { return res.status(400).json({ error: "invalid_patch" }); }
  const item = patch(req.params.id, req.body);
  if (!item) return res.status(404).end();
  bus?.emit?.({ type: "task.changed", priority: "high", payload: { id: item.id, op: "patch" } });
  res.json({ item });
});

tasksRouter.delete("/api/tasks/:id", policyV2Guard("write", "low"), (req, res) => {
  const ok = remove(req.params.id);
  if (!ok) return res.status(404).end();
  bus?.emit?.({ type: "task.changed", priority: "high", payload: { id: req.params.id, op: "delete" } });
  res.status(204).end();
});

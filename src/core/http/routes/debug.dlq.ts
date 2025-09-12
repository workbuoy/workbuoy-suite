import { Router } from "express";
import bus from "../../events/priorityBus";

const router = Router();
router.get("/api/_debug/dlq", (_req, res) => {
  const info = bus._peek();
  res.json({ ok: true, ...info });
});
export default router;

/**
 * Buoy HTTP endpoint (MVP).
 */
import { Router, Request, Response } from "express";
import { run } from "../../../buoy/agent";

// Dynamic import to avoid hard dep if policy module path differs
function tryRequire<T = any>(mod: string): T | null {
  try { return require(mod); } catch { return null; }
}
const policy = tryRequire<any>("../../policy");
const policyGuard = policy?.policyGuard || ((req: Request, res: Response, next: any) => next());

const router = Router();

router.post("/buoy/complete", policyGuard, async (req: Request, res: Response) => {
  const body = (req as any).body || {};
  if (!body || typeof body.intent !== "string") {
    return res.status(400).json({ error: "invalid_request", message: "intent required" });
  }
  try {
    const out = await run({ intent: body.intent, params: body.params }, req);
    return res.status(200).json(out);
  } catch (err: any) {
    return res.status(500).json({ error: "internal_error", message: err?.message || "unknown" });
  }
});

export default router;

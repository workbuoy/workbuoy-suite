import { Router } from "express";

function tryRequire<T = any>(mod: string): T | null {
  try { return require(mod); } catch { return null; }
}
const db = tryRequire<any>("../../db/prisma");

const router = Router();

router.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

router.get("/readyz", async (_req, res) => {
  let dbOk = false;
  try {
    if (db?.prisma) {
      await db.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    }
  } catch (_e) {
    dbOk = false;
  }
  res.status(dbOk ? 200 : 503).json({ ok: dbOk, db: dbOk, ts: new Date().toISOString() });
});

export default router;

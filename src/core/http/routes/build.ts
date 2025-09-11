import { Router } from "express";

const router = Router();

const buildInfo = {
  version: process.env.BUILD_VERSION || "dev",
  git_sha: process.env.GIT_SHA || "unknown",
  built_at: process.env.BUILT_AT || new Date().toISOString(),
  node: process.version,
};

router.get("/buildz", (_req, res) => {
  res.json(buildInfo);
});

export default router;

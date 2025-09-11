import { Router } from "express";
import { metricsHandler } from "../../observability/metrics";

const router = Router();
router.get("/metrics", metricsHandler);
export default router;

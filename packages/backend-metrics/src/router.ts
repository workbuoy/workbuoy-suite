import { Router, type Request, type Response } from "express";
import type { Registry } from "prom-client";
import { getRegistry } from "./registry.js";

export interface MetricsRouterOptions {
  registry?: Registry;
  beforeCollect?: () => Promise<void> | void;
}

async function collectMetrics(
  registry: Registry,
  res: Response,
  beforeCollect?: () => Promise<void> | void,
): Promise<void> {
  if (beforeCollect) {
    await beforeCollect();
  }

  res.setHeader("Content-Type", registry.contentType);
  res.send(await registry.metrics());
}

export function createMetricsRouter(options: MetricsRouterOptions = {}): Router {
  const registry = options.registry ?? getRegistry();
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    try {
      await collectMetrics(registry, res, options.beforeCollect);
    } catch (error) {
      res.status(500).json({
        error: "metrics_unavailable",
        message: error instanceof Error ? error.message : "Unexpected error while collecting metrics",
      });
    }
  });

  return router;
}

export const metricsRouter = createMetricsRouter();

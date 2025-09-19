/**
 * Buoy AI OS — agent orchestrator (v2.4.4)
 * Policy-first, explainable, auditable.
 */
import { buildContext, BuoyContext } from "./memory/context";
import { plan } from "./reasoning/planner";
import { execute } from "./actions";
import type { Request } from "express";

type Explanation = {
  mode?: "ask_approval" | "read_only" | "supervised";
  reason?: string;
  confidence?: number;
  impact?: string;
  alternatives?: string[];
  policyBasis?: string;
};

type RunInput = { intent: string; params?: Record<string, unknown> };
type RunOutput = {
  result: unknown;
  explanations: Explanation[];
  confidence: number;
  correlationId: string;
};

// Optional rails (loaded dynamically to avoid tight coupling)
function tryRequire<T = any>(mod: string): T | null {
  try { return require(mod); } catch { return null; }
}

const explainLib = tryRequire<any>("../core/explain");
const eventBus = tryRequire<any>("../core/eventBus");
const audit = tryRequire<any>("../core/audit");
const logging = tryRequire<any>("../core/logging/logger");

function buildExplanation(input: Partial<Explanation>): Explanation {
  if (explainLib && typeof explainLib.buildExplanation === "function") {
    return explainLib.buildExplanation(input);
  }
  return {
    mode: input.mode,
    reason: input.reason || "MVP explanation",
    confidence: input.confidence ?? 0.5,
    impact: input.impact,
    alternatives: input.alternatives || [],
    policyBasis: input.policyBasis,
  };
}

export async function run(input: RunInput, req: Request): Promise<RunOutput> {
  const ctx: BuoyContext = buildContext(req);
  const { intent, params } = input || {};
  const corrId = ctx.correlationId;

  logging?.log?.("info", "buoy.agent", "buoy.run.start", { intent }, corrId);

  // Reasoning (MVP)
  const planRes = await plan(intent, ctx);

  // Execute
  const execRes = await execute(planRes.action, { ...ctx, params, plan: planRes });

  const expl = buildExplanation({
    reason: planRes.rationale || "MVP planner",
    confidence: planRes.confidence,
    alternatives: planRes.alternatives,
    policyBasis: `autonomy=${ctx.autonomyLevel}; role=${ctx.roleId}`,
    mode: ctx.autonomyLevel === 0 ? "ask_approval" : ctx.autonomyLevel === 1 ? "read_only" : "supervised",
  });

  // Event + audit
  if (eventBus?.emit) {
    await eventBus.emit({
      type: "buoy.action.executed",
      priority: "low",
      payload: { intent, action: planRes.action, ok: !!execRes?.ok, corrId }
    });
  }
  if (audit?.append) {
    await audit.append({ ts: new Date().toISOString(), msg: "buoy.action.executed", meta: { intent, action: planRes.action, ok: !!execRes?.ok, corrId } });
  }

  logging?.log?.("info", "buoy.agent", "buoy.run.end", { intent }, corrId);

  return {
    result: execRes,
    explanations: [expl],
    confidence: planRes.confidence ?? 0.5,
    correlationId: corrId,
  };
}

export default { run };

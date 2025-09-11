/**
 * Buoy planner (MVP): choose a simple action based on intent.
 */
import type { BuoyContext } from "../memory/context";

export type PlanResult = {
  action: string;
  rationale: string;
  confidence: number;
  alternatives?: string[];
};

export async function plan(intent: string, ctx: BuoyContext): Promise<PlanResult> {
  if (!intent) {
    return {
      action: "noop",
      rationale: "No intent provided; default to noop",
      confidence: 0.3,
      alternatives: []
    };
  }
  if (intent === "echo") {
    return {
      action: "noop",
      rationale: "Echo intent → noop with echo payload (verifiable path)",
      confidence: 0.7,
      alternatives: ["noop"]
    };
  }
  return {
    action: "noop",
    rationale: `Unknown intent '${intent}' → noop`,
    confidence: 0.4,
    alternatives: ["noop"]
  };
}

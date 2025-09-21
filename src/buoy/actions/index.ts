/**
 * Buoy actions registry (MVP).
 */
import { noop } from "./noop";
import { executeOpenApiCall } from "./openapiCall";
import type { BuoyContext } from "../memory/context";

type ActionContext = BuoyContext & { params?: any; plan?: any };

const registry: Record<string, (ctx: ActionContext) => Promise<any>> = {
  noop,
  "openapi.call": async (ctx) => executeOpenApiCall(ctx),
};

export async function execute(action: string, ctx: ActionContext) {
  const fn = registry[action] || registry["noop"];
  return fn(ctx);
}

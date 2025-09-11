/**
 * Buoy actions registry (MVP).
 */
import { noop } from "./noop";
import type { BuoyContext } from "../memory/context";

const registry: Record<string, (ctx: BuoyContext & { params?: any; plan?: any }) => Promise<any>> = {
  noop
};

export async function execute(action: string, ctx: BuoyContext & { params?: any; plan?: any }) {
  const fn = registry[action] || registry["noop"];
  return fn(ctx);
}

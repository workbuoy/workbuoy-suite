import type { BuoyContext } from "../memory/context";

export async function noop(ctx: BuoyContext & { params?: any }) {
  return { ok: true, echo: ctx?.params ?? null };
}

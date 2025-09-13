// Legacy policy middleware retired.
// This file aliases the v2 guard so existing imports (`from "src/core/policy"`) keep working.
export { policyV2Guard as policyGuard } from "./policyV2/guard";
export * from "./policyV2/types";

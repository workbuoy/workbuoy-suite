// Compatibility shim: use Policy V2 everywhere via legacy import path.
// Any existing `import { policyGuard } from "../../core/policy/guard"` will now get v2.
export { policyV2Guard as policyGuard } from "../policyV2/middleware";
export { policyV2GuardCached as policyGuardCached } from "../policyV2/middleware.cached";

// Backwards compatibility shim. Prefer import { maskPII } from './pii' in new code.
import { maskPII } from "./pii";
export default function maskValue(input: unknown): unknown {
  return maskPII(input);
}

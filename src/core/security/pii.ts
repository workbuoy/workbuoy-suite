/**
 * PII masking utility + express middleware for logs
 */
const MASK = "***";

const defaultMap: Record<string, true> = {
  email: true,
  phone: true,
  ssn: true,
  password: true,
  token: true,
  apiKey: true
};

export function maskPII<T = any>(obj: T, map: Record<string, true> = defaultMap): T {
  if (!obj || typeof obj !== "object") return obj;
  const clone: any = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj as any)) {
    if (map[k]) {
      clone[k] = MASK;
    } else if (v && typeof v === "object") {
      clone[k] = maskPII(v as any, map);
    } else {
      clone[k] = v;
    }
  }
  return clone;
}

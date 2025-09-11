type Level = "debug" | "info" | "warn" | "error";
const PII_KEYS = ["email","phone","iban","ssn","password"];

function maskPII(obj: any): any {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(maskPII);
  if (typeof obj === "object") {
    const out: Record<string, any> = {};
    for (const [k,v] of Object.entries(obj)) {
      if (PII_KEYS.includes(k.toLowerCase())) {
        out[k] = "***";
      } else {
        out[k] = maskPII(v);
      }
    }
    return out;
  }
  return obj;
}

function log(level: Level, msg: string, meta?: Record<string, any>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...maskPII(meta || {}),
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

export const logger = {
  debug: (msg: string, meta?: any) => log("debug", msg, meta),
  info: (msg: string, meta?: any) => log("info", msg, meta),
  warn: (msg: string, meta?: any) => log("warn", msg, meta),
  error: (msg: string, meta?: any) => log("error", msg, meta),
};

export { maskPII };

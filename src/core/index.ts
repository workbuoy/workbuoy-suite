// Safer "core surface" barrel. Tolerates missing modules by exporting fallbacks.
function safeRequire(path: string) {
  try { return require(path); } catch { return {}; }
}

export const logging = safeRequire('./logging/logger');
export const policy = safeRequire('./policy');            // v2/facade
export const events = safeRequire('./events');            // should re-export priority bus & DLQ
export const audit = safeRequire('./audit');
export const explain = safeRequire('./explain');
export const config = safeRequire('./config');

export default { logging, policy, events, audit, explain, config };

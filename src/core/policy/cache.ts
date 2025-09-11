type Entry = { value: any; at: number };
const store = new Map<string, Entry>();

let TTL_SECONDS = Number(process.env.POLICY_CACHE_TTL || 60);
let VERSION_PREFIX = "v2";

export function setVersion(v: string) { VERSION_PREFIX = v; }
export function setTTL(sec: number) { TTL_SECONDS = sec; }

function keyify(parts: Record<string, any>) {
  return VERSION_PREFIX + ":" + Object.entries(parts).map(([k,v]) => `${k}=${v}`).join("|");
}

export function get(parts: Record<string, any>) {
  const k = keyify(parts);
  const e = store.get(k);
  if (!e) return null;
  if ((Date.now() - e.at) / 1000 > TTL_SECONDS) { store.delete(k); return null; }
  return e.value;
}

export function put(parts: Record<string, any>, value: any) {
  const k = keyify(parts);
  store.set(k, { value, at: Date.now() });
}

export function clear() { store.clear(); }

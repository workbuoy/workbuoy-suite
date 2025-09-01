// Simple in-memory LRU-ish cache for personal confidence lookups
const MAX = 500;
const map = new Map(); // key -> { value, ts }
export function get(key){
  const v = map.get(key);
  if(!v) return null;
  // 10 minute TTL
  if(Date.now()-v.ts > 10*60*1000){ map.delete(key); return null; }
  return v.value;
}
export function set(key, value){
  map.set(key, { value, ts: Date.now() });
  if(map.size > MAX){
    const oldestKey = [...map.entries()].sort((a,b)=>a[1].ts-b[1].ts)[0][0];
    map.delete(oldestKey);
  }
}
export default { get, set };

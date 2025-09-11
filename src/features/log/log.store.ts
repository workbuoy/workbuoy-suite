type Entry = { ts: string; level: "info"|"warn"|"error"; msg: string; meta?: any; hash: string; prevHash?: string };
const items: Entry[] = [];
export function list(limit=100, cursor?: number) {
  const start = cursor ?? 0;
  return { items: items.slice(start, start+limit), next: start+limit < items.length ? start+limit : null };
}
export function append(e: Entry) {
  items.unshift(e);
  return e;
}
export function all() { return items.slice().reverse(); }

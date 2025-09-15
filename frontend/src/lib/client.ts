// frontend/src/lib/client.ts
export type Options = RequestInit & { correlationId?: string };
export async function apiFetch<T=any>(path: string, opts: Options = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  const cid = (opts as any).correlationId || (window as any)?.__CID__;
  if (cid) headers.set('x-correlation-id', cid);
  if (!headers.get('content-type')) headers.set('content-type', 'application/json');
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) throw new Error(`apiFetch ${path} ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : (res.text() as any);
}
export const api = apiFetch;
export default apiFetch;

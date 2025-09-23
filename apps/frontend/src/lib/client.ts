// frontend/src/lib/client.ts
import { emitApiStatus } from "@/features/core/useApiStatus";
export type Options = RequestInit & {
  correlationId?: string;
  autonomyLevel?: number;
  role?: string;
};

function resolveAutonomyLevel(opts: Options): number {
  if (typeof opts.autonomyLevel === 'number') return opts.autonomyLevel;
  const globalCtx = (window as any)?.__WB_CONTEXT__ || (window as any)?.APP_STATE || {};
  const level = globalCtx.autonomyLevel ?? globalCtx.autonomy;
  return typeof level === 'number' ? level : 2;
}

function resolveRole(opts: Options): string {
  if (typeof opts.role === 'string' && opts.role.trim().length) return opts.role;
  const globalCtx = (window as any)?.__WB_CONTEXT__ || (window as any)?.APP_STATE || {};
  const role = globalCtx.role ?? globalCtx.roleId;
  return role && String(role).trim().length ? String(role) : 'ops';
}

export async function apiFetch<T=any>(path: string, opts: Options = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  const cid = opts.correlationId || (window as any)?.__CID__;
  if (cid) headers.set('x-correlation-id', cid);

  const level = resolveAutonomyLevel(opts);
  if (!headers.has('x-autonomy-level')) headers.set('x-autonomy-level', String(level));
  if (!headers.has('x-wb-autonomy')) headers.set('x-wb-autonomy', String(level));

  const role = resolveRole(opts);
  if (!headers.has('x-role')) headers.set('x-role', role);
  if (!headers.has('x-role-id')) headers.set('x-role-id', role);
  if (!headers.has('x-wb-role')) headers.set('x-wb-role', role);

  if (opts.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const init: RequestInit = { ...opts, headers };
  delete (init as any).correlationId;
  delete (init as any).autonomyLevel;
  delete (init as any).role;

  let statusEmitted = false;
  try {
    const res = await fetch(path, init);
    emitApiStatus({ status: res.status, ok: res.ok });
    statusEmitted = true;
    if (!res.ok) throw new Error(`apiFetch ${path} ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : (res.text() as any);
  } catch (error) {
    if (!statusEmitted) {
      emitApiStatus({ status: 0, ok: false });
    }
    throw error;
  }
}
export const api = apiFetch;
export default apiFetch;

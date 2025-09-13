export async function apiFetch(path: string, opts: RequestInit = {}, autonomy = 0, roleId = 'user') {
  const headers = new Headers(opts.headers || {});
  headers.set('content-type', 'application/json');
  headers.set('x-autonomy-level', String(autonomy));
  headers.set('x-role-id', roleId);
  headers.set('x-correlation-id', (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)));
  const res = await fetch(path, { ...opts, headers });
  return res;
}

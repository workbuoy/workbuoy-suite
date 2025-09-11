export async function api(path: string, method: string = "GET", body?: any, headers?: Record<string,string>) {
  const corr = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const h = { "Content-Type": "application/json", "x-correlation-id": corr, ...(headers || {}) };
  const res = await fetch(path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(()=> ({}));
  return { status: res.status, data, correlationId: corr, headers: Object.fromEntries(res.headers.entries()) };
}

export type ApiResult<T=any> = { status: number; data: T; explanations?: any[]; correlationId?: string; headers?: Record<string,string> };

export async function apiWhy(path: string, method: string = "GET", body?: any, headers?: Record<string,string>): Promise<ApiResult> {
  const corr = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const h = { "Content-Type": "application/json", "x-correlation-id": corr, ...(headers || {}) };
  const res = await fetch(path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  let data: any = {};
  try { data = await res.json(); } catch {}
  const explanations = data?.explanations || [];
  const headerEntries: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headerEntries[key] = value;
  });
  return {
    status: res.status,
    data,
    explanations,
    correlationId: corr,
    headers: headerEntries,
  };
}

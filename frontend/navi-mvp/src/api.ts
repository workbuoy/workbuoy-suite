export async function api(path: string, opts: RequestInit = {}, autonomy = 0) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "x-autonomy": String(autonomy),
      ...(opts.headers || {})
    }
  });
  const data = await res.json().catch(()=> ({}));
  return {
    ok: res.ok,
    status: res.status,
    data,
    correlationId: (data && data.correlationId) || res.headers.get("x-correlation-id") || undefined,
    explanation: data && data.explanation
  };
}

export async function withSpan<T>(name: string, fn: () => Promise<T>, log: (o:any)=>void) {
  const t0 = Date.now();
  try {
    const res = await fn();
    const dt = Date.now() - t0;
    log({ span: name, duration_ms: dt, status: "ok" });
    return res;
  } catch (err:any) {
    const dt = Date.now() - t0;
    log({ span: name, duration_ms: dt, status: "error", error: err?.message });
    throw err;
  }
}

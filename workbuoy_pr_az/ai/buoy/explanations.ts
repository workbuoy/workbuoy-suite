export function explain(intent: any, result: any) {
  return {
    summary: `Kjørte ${intent.method} ${intent.path} via Buoy action layer.`,
    status: result.status,
    hints: result.status===200 ? 'OK' : 'Kontroller input/RBAC/rate-limit'
  };
}

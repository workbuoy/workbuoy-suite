
export default function handler(req, res) {
  const { p95, error_rate, sla, err_max } = req.query;
  global.simulated_p95_latency_ms = Number(p95 || 0);
  global.simulated_error_rate = Number(error_rate || 0);
  global.simulated_sla_ms = Number(sla || 0);
  global.simulated_error_rate_max = Number(err_max || 1.0);
  res.status(200).json({ ok: true, p95: global.simulated_p95_latency_ms, error_rate: global.simulated_error_rate });
}

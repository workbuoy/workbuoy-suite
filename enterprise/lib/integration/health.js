
import { reportHealth } from './circuitBreaker.js';
export async function healthSummary(){
  const rows = await reportHealth();
  const overall = rows.every(r=>r.status==='healthy') ? 'healthy' : 'degraded';
  return { overall, connectors: rows };
}
export default { healthSummary };

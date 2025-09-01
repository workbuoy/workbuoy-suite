// k6 smoke test (run with: k6 run tools/k6/smoke.js)
import http from 'k6/http';
import { sleep } from 'k6';
export const options = { vus: 1, duration: '30s' };
export default function () {
  http.get(`${__ENV.API_BASE_URL || 'http://localhost:3000'}/api/v1/systems/status`, { headers: { 'x-tenant-id':'demo-tenant' } });
  sleep(1);
}

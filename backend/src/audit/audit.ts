import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { audit_events_total } from '../metrics/metrics.js';

const dir = '.audit';
mkdirSync(dir, { recursive: true });
const file = join(dir, 'audit.log');

export function audit(ev: any) {
  try {
    appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...ev }) + '\n');
    audit_events_total.inc();
  } catch {}
}

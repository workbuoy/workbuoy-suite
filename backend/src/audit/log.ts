import { writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const dir = '.audit';
mkdirSync(dir, { recursive: true });
const file = join(dir, 'rbac.log');

export function audit(event: { type: string; tenant_id: string; actor_id?: string|null; details?: any }) {
  const payload = { ts: new Date().toISOString(), ...event };
  appendFileSync(file, JSON.stringify(payload) + '\n');
}

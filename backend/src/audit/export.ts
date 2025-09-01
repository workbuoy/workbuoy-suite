import { writeFileSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const toFile = (process.env.AUDIT_EXPORT_FILE || 'true') === 'true';
const toS3 = (process.env.AUDIT_EXPORT_S3 || 'false') === 'true';

export function exportAudit(event: any) {
  if (toFile) {
    const dir = '.audit';
    mkdirSync(dir, { recursive: true });
    const f = join(dir, 'events.log');
    appendFileSync(f, JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n');
  }
  if (toS3) {
    // Stub: integrate AWS SDK in future PR
  }
}

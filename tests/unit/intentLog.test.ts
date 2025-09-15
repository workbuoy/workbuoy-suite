import fs from 'fs';
import path from 'path';
process.env.INTENT_LOG_SINK = 'file';
const FILE = path.join(process.cwd(), 'intent-log.jsonl');
if (fs.existsSync(FILE)) fs.unlinkSync(FILE);

import { logIntent } from '../../src/core/intentLog';

describe('intentLog (file sink)', () => {
  it('appends JSONL rows', async () => {
    const id = await logIntent({
      tenantId: 'T1',
      capability: 'finance.invoice.prepareDraft',
      payload: { x: 1 },
      policy: { allowed: true, explanation: 'ok' },
      mode: 'simulate',
      outcome: { previewUrl: 'https://preview' }
    });
    expect(typeof id).toBe('string');
    const txt = fs.readFileSync(FILE, 'utf8');
    expect(txt.split('\n').filter(Boolean).length).toBe(1);
  });
});

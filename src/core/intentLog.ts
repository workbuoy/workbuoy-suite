/**
 * IntentLog — append-only JSONL file sink (default) with in-memory mirror.
 * PR6 introduces a simple logging mechanism for capabilities.
 * Switch sink via env: INTENT_LOG_SINK=file|memory, INTENT_LOG_FILE=path.jsonl
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { ModuleMode, PolicyResponse } from './types';

const SINK = process.env.INTENT_LOG_SINK ?? 'file';
const FILE = process.env.INTENT_LOG_FILE ?? path.join(process.cwd(), 'intent-log.jsonl');

const inmem: any[] = [];

export async function logIntent(rec: {
  tenantId: string;
  capability: string;
  payload: any;
  policy: PolicyResponse;
  mode: ModuleMode;
  outcome?: any;
}) {
  const row = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ...rec,
  };
  if (SINK === 'file') {
    try {
      fs.appendFileSync(FILE, JSON.stringify(row) + '\n', 'utf8');
    } catch (err) {
      // Fallback to memory if file write fails.
      inmem.push({ ...row, _sinkError: String(err) });
    }
  } else {
    inmem.push(row);
  }
  return row.id;
}

export function getIntentLogInMemory() {
  return inmem.slice(-500);
}

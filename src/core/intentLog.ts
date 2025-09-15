import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { ModuleMode, PolicyResponse } from './types';

const SINK = process.env.INTENT_LOG_SINK ?? 'file';
const FILE = process.env.INTENT_LOG_FILE ?? path.join(process.cwd(), 'intent-log.jsonl');

const inmem: any[] = [];

export async function logIntent(rec: {
  tenantId: string; capability: string; payload: any; policy: PolicyResponse; mode: ModuleMode; outcome?: any
}) {
  const row = { id: randomUUID(), ts: new Date().toISOString(), ...rec };
  if (SINK === 'file') {
    fs.appendFileSync(FILE, JSON.stringify(row) + '\n', 'utf8');
  } else {
    inmem.push(row);
  }
  return row.id;
}

export function getIntentLogInMemory() { return inmem.slice(-500); }

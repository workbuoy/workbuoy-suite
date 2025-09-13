import crypto from 'crypto';

export interface AuditEntry {
  ts: string;
  correlationId: string;
  type: string;
  payloadHash: string;
  prevHash: string;
  hash: string;
}

const chain: AuditEntry[] = [];

export function append(correlationId: string, type: string, payload: any){
  const ts = new Date().toISOString();
  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload || {})).digest('hex');
  const prevHash = chain.length ? chain[chain.length-1].hash : 'GENESIS';
  const hash = crypto.createHash('sha256').update(ts + correlationId + type + payloadHash + prevHash).digest('hex');
  const entry = { ts, correlationId, type, payloadHash, prevHash, hash };
  chain.push(entry);
  return entry;
}

export function verify(){
  let prev = 'GENESIS';
  for (const e of chain){
    const recompute = require('crypto').createHash('sha256').update(e.ts + e.correlationId + e.type + e.payloadHash + prev).digest('hex');
    if (recompute !== e.hash) return false;
    prev = e.hash;
  }
  return true;
}

export function size(){ return chain.length; }

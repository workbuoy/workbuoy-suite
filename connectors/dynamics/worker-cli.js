#!/usr/bin/env node
import fs from 'fs';
import { DynamicsConnector } from './connector.js';

const args = Object.fromEntries(process.argv.slice(2).map((a,i,arr)=> a.startsWith('--') ? [a.replace(/^--/,''), arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : true] : []).filter(Boolean));
const inputFile = args.input || null;

async function main(){
  const conn = new DynamicsConnector({});
  const events = inputFile ? JSON.parse(fs.readFileSync(inputFile,'utf8')) : JSON.parse(fs.readFileSync(0,'utf8'));
  if (!Array.isArray(events)) throw new Error('input must be an array of events');
  let ok=0, err=0;
  for (const e of events){
    try{ await conn.processEvent(e); ok++; } catch { err++; }
  }
  console.log(JSON.stringify({ processed: events.length, ok, err }));
}
main().catch(e=>{ console.error(e); process.exit(1); });

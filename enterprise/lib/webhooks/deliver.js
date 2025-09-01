import { Queue, Worker, QueueScheduler } from 'bullmq';
import fetch from 'node-fetch';
import { sign } from './signer.js';
import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const connection = process.env.REDIS_URL ? { connection: { url: process.env.REDIS_URL } } : null;

const queueName = 'webhooks';
let q = null;
export function getQueue(){
  if(q) return q;
  q = connection ? new Queue(queueName, connection) : null;
  if(connection){ new QueueScheduler(queueName, connection); new Worker(queueName, handler, connection); }
  return q;
}

export async function enqueueDelivery(endpoint, event, payloadObj){
  const body = JSON.stringify(payloadObj);
  if(getQueue()){
    await getQueue().add('deliver', { endpoint, event, body }, { attempts: 5, backoff:{ type:'exponential', delay: 2000 } });
  }else{
    await handler({ data:{ endpoint, event, body } });
  }
}

export async function handler(job){
  const { endpoint, event, body } = job.data || job;
  const signature = sign(endpoint.secret, body);
  const r = await fetch(endpoint.url, { method:'POST', headers:{ 'content-type':'application/json', 'WB-Signature': signature }, body });
  const status = r.status;
  const db = new sqlite3.Database(DB_PATH);
  const id = 'wh_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  db.run(`INSERT INTO webhook_deliveries(id, endpoint_id, event, payload, status, attempts) VALUES(?,?,?,?,?,?)`,
    [id, endpoint.id, event, body, String(status), (job.attemptsMade||1)], ()=>{});
  if(status >= 500) throw new Error('delivery_failed_status_'+status);
  return status;
}

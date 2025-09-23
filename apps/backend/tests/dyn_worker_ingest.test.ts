import express from 'express';
import request from 'supertest';
import { runOnce } from '../src/connectors/dynamics/worker';
import Redis from 'ioredis';

const PORT_DYN = 45910;
const PORT_CRM = 45911;

function startDyn() {
  const app = express();
  app.use(express.json());
  app.post('/token', (req,res)=>res.json({ access_token: 't' }));
  app.get('/contacts', (req,res)=>res.json([{ contactid:'001', firstname:'Alice', lastname:'A', emailaddress1:'a@x.com' }]));
  app.get('/opportunities', (req,res)=>res.json([{ opportunityid:'op1', name:'Deal 1', estimatedvalue:{ value: 1000 } }]));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_DYN, ()=>resolve(s));
  });
}

function startCRM() {
  const app = express();
  app.use(express.json());
  let posted = 0;
  app.post('/api/v1/crm/contacts', (req,res)=>{ posted++; res.status(201).json({ok:true}); });
  app.post('/api/v1/crm/opportunities', (req,res)=>{ posted++; res.status(201).json({ok:true}); });
  app.get('/n', (_req,res)=>res.json({n: posted}));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_CRM, ()=>resolve(s));
  });
}

test('Worker ingests Dynamics contacts/opps and posts to CRM', async () => {
  const dyn = await startDyn();
  const crm = await startCRM();
  const redis = new Redis('redis://localhost:6379'); await redis.flushall(); await redis.quit();

  await runOnce({
    auth: { tenantId:'t', clientId:'c', clientSecret:'s', scope:'x/.default', tokenUrl:`http://localhost:${PORT_DYN}/token` },
    baseUrl: `http://localhost:${PORT_DYN}`,
    sinceMs: Date.now()-60000,
    redisUrl: 'redis://localhost:6379',
    workbuoy: { baseUrl: `http://localhost:${PORT_CRM}`, apiKey:'dev', tenantId:'t1' }
  } as any);

  const r = await request(`http://localhost:${PORT_CRM}`).get('/n');
  expect(r.body.n).toBe(2);

  await new Promise<void>((resolve,reject)=>dyn.close(e=>e?reject(e):resolve()));
  await new Promise<void>((resolve,reject)=>crm.close(e=>e?reject(e):resolve()));
});

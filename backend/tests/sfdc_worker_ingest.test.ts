import express from 'express';
import request from 'supertest';
import { runOnce } from '../src/connectors/salesforce/worker';
import Redis from 'ioredis';

const PORT_SF = 45820;
const PORT_CRM = 45821;

function startSF() {
  const app = express();
  app.use(express.json());
  app.post('/services/oauth2/token', (req,res)=>res.json({ access_token: 't' }));
  app.get('/contacts', (req,res)=>res.json([{ Id:'001', FirstName:'Alice', LastName:'A', Email:'a@x.com' }]));
  app.get('/opportunities', (req,res)=>res.json([{ Id:'op1', Name:'Deal 1', Amount: 1000 }]));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_SF, ()=>resolve(s));
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

test('Worker ingests contacts and opps and posts to CRM', async () => {
  const sf = await startSF();
  const crm = await startCRM();
  const redis = new Redis('redis://localhost:6379'); await redis.flushall(); await redis.quit();

  await runOnce({
    auth: {
      method: 'jwt', clientId: 'cid', user: 'u', loginUrl: `http://localhost:${PORT_SF}`, privateKeyBase64: Buffer.from('dummy').toString('base64')
    } as any,
    sfdcBaseUrl: `http://localhost:${PORT_SF}`,
    sinceMs: Date.now()-60000,
    redisUrl: 'redis://localhost:6379',
    workbuoy: { baseUrl: `http://localhost:${PORT_CRM}`, apiKey:'dev', tenantId:'t1' }
  } as any);

  const r = await request(`http://localhost:${PORT_CRM}`).get('/n');
  expect(r.body.n).toBe(2);

  await new Promise<void>((resolve,reject)=>sf.close(e=>e?reject(e):resolve()));
  await new Promise<void>((resolve,reject)=>crm.close(e=>e?reject(e):resolve()));
});

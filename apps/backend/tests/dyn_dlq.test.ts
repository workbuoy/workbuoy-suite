import express from 'express';
import { runOnce } from '../src/connectors/dynamics/worker';
import Redis from 'ioredis';

const PORT_DYN = 45930;
const PORT_CRM = 45931;

function startDyn() {
  const app = express();
  app.use(express.json());
  app.post('/token', (req,res)=>res.json({ access_token: 't' }));
  app.get('/contacts', (req,res)=>res.json([{ contactid:'001', firstname:'A' }]));
  app.get('/opportunities', (req,res)=>res.json([]));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_DYN, ()=>resolve(s));
  });
}

function startCRM() {
  const app = express();
  app.use(express.json());
  app.post('/api/v1/crm/contacts', (req,res)=>res.status(500).json({ error:'boom' }));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_CRM, ()=>resolve(s));
  });
}

test('DLQ receives failed upsert', async () => {
  const dyn = await startDyn();
  const crm = await startCRM();
  const redis = new Redis('redis://localhost:6379'); await redis.flushall();

  process.env.DYN_RETRY_MAX = '2';
  await runOnce({
    auth: { tenantId:'t', clientId:'c', clientSecret:'s', scope:'x/.default', tokenUrl:`http://localhost:${PORT_DYN}/token` },
    baseUrl: `http://localhost:${PORT_DYN}`,
    sinceMs: Date.now()-60000,
    redisUrl: 'redis://localhost:6379',
    workbuoy: { baseUrl: `http://localhost:${PORT_CRM}`, apiKey:'dev', tenantId:'t1' }
  } as any);

  const item = await redis.brpop('wb:dlq:dynamics', 1);
  expect(item && item[1]).toBeTruthy();
  await redis.quit();

  await new Promise<void>((resolve,reject)=>dyn.close(e=>e?reject(e):resolve()));
  await new Promise<void>((resolve,reject)=>crm.close(e=>e?reject(e):resolve()));
});

import express from 'express';
import { runOnce } from '../src/connectors/salesforce/worker';
import Redis from 'ioredis';

const PORT_SF = 45830;
const PORT_CRM = 45831;

function startSF() {
  const app = express();
  app.use(express.json());
  app.post('/services/oauth2/token', (req,res)=>res.json({ access_token: 't' }));
  app.get('/contacts', (req,res)=>res.json([{ Id:'001', FirstName:'Bob' }]));
  app.get('/opportunities', (req,res)=>res.json([]));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_SF, ()=>resolve(s));
  });
}

function startCRM(failTimes=3) {
  const app = express();
  app.use(express.json());
  let count=0;
  app.post('/api/v1/crm/contacts', (req,res)=>{
    count++;
    if (count <= failTimes) return res.status(500).json({ error: 'boom' });
    res.status(201).json({ ok:true });
  });
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_CRM, ()=>resolve(s));
  });
}

test('DLQ receives message after repeated failures', async () => {
  const sf = await startSF();
  const crm = await startCRM(10); // always fail to force DLQ
  const redis = new Redis('redis://localhost:6379'); await redis.flushall();

  process.env.SFDC_RETRY_MAX = '3';
  await runOnce({
    auth: { method:'jwt', clientId:'cid', user:'u', loginUrl:`http://localhost:${PORT_SF}`, privateKeyBase64: Buffer.from('dummy').toString('base64') } as any,
    sfdcBaseUrl: `http://localhost:${PORT_SF}`,
    sinceMs: Date.now()-60000,
    redisUrl: 'redis://localhost:6379',
    workbuoy: { baseUrl: `http://localhost:${PORT_CRM}`, apiKey:'dev', tenantId:'t1' }
  } as any);

  const dlqItem = await redis.brpop('wb:dlq:salesforce', 1);
  expect(dlqItem && dlqItem[1]).toBeTruthy();
  await redis.quit();

  await new Promise<void>((resolve,reject)=>sf.close(e=>e?reject(e):resolve()));
  await new Promise<void>((resolve,reject)=>crm.close(e=>e?reject(e):resolve()));
});

import express from 'express';
import { runOnce } from '../src/connectors/dynamics/worker';
import Redis from 'ioredis';

const PORT_DYN = 45920;
const PORT_CRM = 45921;

function startDynThrottling() {
  const app = express();
  app.use(express.json());
  app.post('/token', (req,res)=>res.json({ access_token: 't' }));
  let callsC = 0, callsO = 0;
  app.get('/contacts', (req,res)=>{
    callsC++;
    if (callsC < 3) return res.status(429).set('Retry-After','0.1').send('slow down');
    res.json([{ contactid:'001', firstname:'T', lastname:'User' }]);
  });
  app.get('/opportunities', (req,res)=>{
    callsO++;
    if (callsO < 2) return res.status(429).set('Retry-After','0.05').send('slow down');
    res.json([]);
  });
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_DYN, ()=>resolve({ s }));
  });
}

function startCRM() {
  const app = express();
  app.use(express.json());
  app.post('/api/v1/crm/contacts', (req,res)=>res.status(201).json({ok:true}));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_CRM, ()=>resolve({ s }));
  });
}

test('Worker respects Retry-After and succeeds', async () => {
  const { s: dyn } = await startDynThrottling();
  const { s: crm } = await startCRM();
  const redis = new Redis('redis://localhost:6379'); await redis.flushall(); await redis.quit();

  await runOnce({
    auth: { tenantId:'t', clientId:'c', clientSecret:'s', scope:'x/.default', tokenUrl:`http://localhost:${PORT_DYN}/token` },
    baseUrl: `http://localhost:${PORT_DYN}`,
    sinceMs: Date.now()-60000,
    redisUrl: 'redis://localhost:6379',
    workbuoy: { baseUrl: `http://localhost:${PORT_CRM}`, apiKey:'dev', tenantId:'t1' }
  } as any);

  await new Promise<void>((resolve,reject)=>dyn.close(e=>e?reject(e):resolve()));
  await new Promise<void>((resolve,reject)=>crm.close(e=>e?reject(e):resolve()));
});

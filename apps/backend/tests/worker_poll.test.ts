import express from 'express';
import request from 'supertest';
import app from '../src/app';
import { runOnce } from '../src/connectors/worker';

const PORT_PROVIDER = 45801;
const PORT_CRM = 45802;

function startProvider() {
  const app = express();
  app.get('/contacts', (req, res) => {
    res.json([{ name: 'A' }, { name: 'B' }]);
  });
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_PROVIDER, ()=>resolve(s));
  });
}

function startCRM() {
  const app = express();
  app.use(express.json());
  let n=0;
  app.post('/api/v1/crm/contacts', (req,res)=>{ n++; res.status(201).json({ id: 'c'+n, ...req.body }); });
  app.get('/n', (_req,res)=>res.json({n}));
  return new Promise<any>(resolve=>{
    const s = app.listen(PORT_CRM, ()=>resolve(s));
  });
}

describe('Polling worker', () => {
  test('runOnce ingests provider contacts into CRM', async () => {
    const prov = await startProvider();
    const crm = await startCRM();

    await runOnce({
      provider: 'hubspot',
      providerBaseUrl: `http://127.0.0.1:${PORT_PROVIDER}`,
      providerToken: 'x',
      crmBaseUrl: `http://127.0.0.1:${PORT_CRM}`,
      apiKey: 'dev', tenantId: 't1'
    });

    const r = await request(`http://127.0.0.1:${PORT_CRM}`).get('/n');
    expect(r.body.n).toBe(2);

    await new Promise<void>((resolve,reject)=>prov.close(e=>e?reject(e):resolve()));
    await new Promise<void>((resolve,reject)=>crm.close(e=>e?reject(e):resolve()));
  });
});

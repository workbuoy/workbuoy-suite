import express from 'express';
import { getAccessToken } from '../src/connectors/dynamics/auth';

test('AAD client_credentials returns token from mock', async () => {
  const app = express();
  app.post('/token', (_req,res)=>res.json({ access_token: 'tok' }));
  const s = app.listen(45900);
  const token = await getAccessToken({ tenantId: 't', clientId: 'c', clientSecret: 's', scope: 'x/.default', tokenUrl: 'http://localhost:45900/token' });
  expect(token).toBe('tok');
  await new Promise<void>((resolve,reject)=>s.close(e=>e?reject(e):resolve()));
});

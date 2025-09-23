import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { connectorsRouter } from '../src/connectors/routes';
import { redis } from '../src/connectors/queue';
import { setCrmPushDelegate } from '../src/connectors/crmPush';
import { runOnce } from '../src/connectors/worker';

const app = express();
app.use(bodyParser.json());
app.use('/api/v1/connectors', connectorsRouter);

test('hubspot webhook enqueues and worker pushes to CRM', async () => {
  // isolate redis keys
  await redis.flushdb();

  // mock CRM push
  let pushed = 0;
  setCrmPushDelegate(async (_tenant, type, rec) => {
    if (type==='contact' && rec.name) pushed++;
  });

  const payload = [{
    objectType: 'contact',
    objectId: '123',
    properties: { firstname: 'Alice', lastname: 'Smith', email: 'a@example.com' }
  }];

  const r = await request(app).post('/api/v1/connectors/hubspot/webhook')
    .set('x-tenant-id','t1')
    .send(payload);

  expect(r.status).toBe(202);
  // process once
  await runOnce();

  expect(pushed).toBe(1);
});

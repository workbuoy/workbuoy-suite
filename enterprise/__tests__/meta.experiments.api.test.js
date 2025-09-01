// __tests__/meta.experiments.api.test.js
import handlerStart from '../pages/api/meta/experiments/start.js';
import handlerStop from '../pages/api/meta/experiments/stop.js';
import handlerMetrics from '../pages/api/meta/experiments/[id]/metrics.js';
import { loadSecurePolicy } from '../lib/secure-policy.js';
import httpMocks from 'node-mocks-http';
import fs from 'fs';
import path from 'path';

// Ensure test DB path
process.env.DB_PATH = path.join(process.cwd(), 'db', 'test.workbuoy.db');

beforeAll(()=>{
  // Create a permissive secure.policy.json for tests
  const p = path.join(process.cwd(), 'secure.policy.json');
  fs.writeFileSync(p, JSON.stringify({ allow_autonomy: true }, null, 2));
});

afterAll(()=>{
  try{ fs.unlinkSync(path.join(process.cwd(), 'secure.policy.json')); }catch{}
  try{ fs.unlinkSync(process.env.DB_PATH); }catch{}
});

test('policy gate denies when allow_autonomy=false', async () => {
  const p = path.join(process.cwd(), 'secure.policy.json');
  fs.writeFileSync(p, JSON.stringify({ allow_autonomy: false }));
  const req = httpMocks.createRequest({ method:'POST', url:'/api/meta/experiments/start', body: { name:'t1', sla_target:{ p95_latency_ms: 500, error_rate_threshold: 0.02 } } });
  const res = httpMocks.createResponse();
  await handlerStart(req, res);
  expect(res.statusCode).toBe(403);
  // Reset to allow
  fs.writeFileSync(p, JSON.stringify({ allow_autonomy: true }));
});

test('start -> stop flow promotes by default', async () => {
  const req = httpMocks.createRequest({ method:'POST', body:{ name:'t2', goal:'test promote', sla_target:{ p95_latency_ms:9999, error_rate_threshold:1.0 } } });
  const res = httpMocks.createResponse();
  await handlerStart(req,res);
  expect(res.statusCode).toBe(200);
  const { id } = res._getJSONData();
  const stopReq = httpMocks.createRequest({ method:'POST', body:{ id } });
  const stopRes = httpMocks.createResponse();
  await handlerStop(stopReq, stopRes);
  const data = stopRes._getJSONData();
  expect(stopRes.statusCode).toBe(200);
  expect(data.outcome).toBeDefined();
});

test('metrics GET returns summary even with no events', async ()=>{
  // Create exp
  const req = httpMocks.createRequest({ method:'POST', body:{ name:'t3', goal:'summary', sla_target:{ p95_latency_ms:500, error_rate_threshold:0.05 } } });
  const res = httpMocks.createResponse();
  await handlerStart(req,res);
  const { id } = res._getJSONData();
  const mReq = httpMocks.createRequest({ method:'GET', query:{ id:String(id) } });
  const mRes = httpMocks.createResponse();
  await handlerMetrics(mReq, mRes);
  expect(mRes.statusCode).toBe(200);
  const payload = mRes._getJSONData();
  expect(payload.experiment).toBeDefined();
  expect(payload.events_summary).toBeDefined();
});

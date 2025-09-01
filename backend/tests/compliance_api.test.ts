import request from 'supertest';
import { buildComplianceApp } from '../src/compliance/app';

const app = buildComplianceApp();

beforeAll(async () => {
  await request(app).post('/_admin/reset').send({});
});

test('export flow creates job, completes, emits audit + webhook', async () => {
  const start = await request(app).post('/api/v1/compliance/export').send({ userId:'u1' });
  expect(start.status).toBe(202);
  const jobId = start.body.jobId;
  const status = await request(app).get(`/api/v1/compliance/export/${jobId}`);
  expect(status.status).toBe(200);
  expect(status.body.status).toBe('complete');
  expect(status.body.url).toContain(jobId);

  const audit = await request(app).get('/_admin/audit');
  const webhooks = await request(app).get('/_admin/webhooks');
  const a = audit.body.map((x:any)=>x.action);
  const w = webhooks.body.map((x:any)=>x.event);
  expect(a).toContain('export.start');
  expect(a).toContain('export.complete');
  expect(w).toContain('privacy.export.started');
  expect(w).toContain('privacy.export.completed');
});

test('delete flow emits webhook and audit', async () => {
  const r = await request(app).post('/api/v1/compliance/delete').send({ userId:'u2', scope:'all' });
  expect(r.status).toBe(202);
  const audit = await request(app).get('/_admin/audit');
  const webhooks = await request(app).get('/_admin/webhooks');
  const hasAudit = audit.body.some((x:any)=> x.action==='delete.start' && x.subject==='u2');
  const hasWebhook = webhooks.body.some((x:any)=> x.event==='privacy.delete.started' && x.data.userId==='u2');
  expect(hasAudit && hasWebhook).toBe(true);
});

test('portability returns dump and webhook', async () => {
  const r = await request(app).post('/api/v1/compliance/portability').send({ userId:'u3' });
  expect(r.status).toBe(200);
  expect(r.body?.metadata?.format).toBe('json');
  expect(r.body?.data?.userId).toBe('u3');
  const webhooks = await request(app).get('/_admin/webhooks');
  const hasWebhook = webhooks.body.some((x:any)=> x.event==='privacy.portability.generated' && x.data.userId==='u3');
  expect(hasWebhook).toBe(true);
});

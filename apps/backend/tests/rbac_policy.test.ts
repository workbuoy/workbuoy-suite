import express from 'express';
import request from 'supertest';
import { requireRole } from '@workbuoy/backend-rbac';

describe('RBAC policy (CRM endpoints)', () => {
  const app = express();
  app.use(express.json());
  app.get('/api/v1/crm/contacts', requireRole('viewer'), (_req,res)=>res.json({ items: [] }));
  app.post('/api/v1/crm/contacts', requireRole('contributor'), (_req,res)=>res.status(201).json({ id: 'c1' }));

  it('viewer can read but cannot write', async () => {
    const r1 = await request(app).get('/api/v1/crm/contacts').set('x-roles','viewer');
    expect(r1.status).toBe(200);
    const r2 = await request(app).post('/api/v1/crm/contacts').set('x-roles','viewer').send({ name:'A' });
    expect(r2.status).toBe(403);
  });

  it('contributor can write', async () => {
    const r = await request(app).post('/api/v1/crm/contacts').set('x-roles','contributor').send({ name:'A' });
    expect(r.status).toBe(201);
  });
});

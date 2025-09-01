import request from 'supertest';
import app from '../src/app';

describe('Connectors webhook', ()=>{
  it('denies without api-key', async ()=>{
    const res=await request(app).post('/api/v1/connectors/salesforce/webhook');
    expect(res.status).toBe(401);
  });
  it('accepts webhook', async ()=>{
    const res=await request(app)
      .post('/api/v1/connectors/salesforce/webhook')
      .set('x-api-key','dev-123')
      .set('Idempotency-Key','abc')
      .set('x-role','admin')
      .send({ id:'ext1', name:'Alice'});
    expect(res.status).toBe(200);
    expect(res.body.accepted).toBe(1);
  });
});

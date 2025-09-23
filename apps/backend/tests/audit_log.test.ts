import request from 'supertest';
import { buildApp } from '../src/app';

const app = buildApp();

beforeAll(async () => {
  await request(app).post('/_admin/seed').send({
    'contact:cx': { id:'cx', entity_type:'contact', owner_id:'u1', team_id:'teamA', pipeline_id:'p1', sensitive:false, name:'X' }
  });
});

test('audit entries created for allow/deny', async () => {
  // deny: viewer tries to update
  await request(app).patch('/api/v1/crm/contacts/cx').set('x-user-role','viewer').set('x-user-id','u_view').send({ name:'Nope' });
  // allow: manager updates
  await request(app).patch('/api/v1/crm/contacts/cx').set('x-user-role','manager').set('x-user-id','u_mgr').set('x-user-team','teamA').send({ name:'Ok' });

  const aud = await request(app).get('/_admin/audit');
  expect(aud.status).toBe(200);
  const entries = aud.body;
  const hasDenied = entries.some((e:any)=> e.action==='update' && e.allowed===false && e.reason);
  const hasAllowed = entries.some((e:any)=> e.action==='update' && e.allowed===true && e.after && e.after.name==='Ok');
  expect(hasDenied && hasAllowed).toBe(true);
});

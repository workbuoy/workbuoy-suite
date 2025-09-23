import request from 'supertest';
import { buildApp } from '../src/app';

const app = buildApp();

const contact = {
  id: 'c1',
  entity_type: 'contact',
  owner_id: 'u_contrib',
  team_id: 'teamA',
  pipeline_id: 'p1',
  sensitive: false,
  name: 'Alice'
};

beforeAll(async () => {
  await request(app).post('/_admin/seed').send({ ['contact:'+contact.id]: contact });
});

describe('RBAC record-level', () => {
  it('viewer can read non-sensitive, cannot write', async () => {
    const r = await request(app).get('/api/v1/crm/contacts/c1').set('x-user-role','viewer').set('x-user-id','u_view').set('x-user-team','teamB');
    expect(r.status).toBe(200);
    const w = await request(app).patch('/api/v1/crm/contacts/c1').set('x-user-role','viewer').set('x-user-id','u_view').send({ name:'Nope' });
    expect(w.status).toBe(403);
  });

  it('contributor can create & update own, not others', async () => {
    const c = await request(app).post('/api/v1/crm/contacts').set('x-user-role','contributor').set('x-user-id','u_contrib').set('x-user-team','teamA')
      .send({ name:'Mine', team_id:'teamA' });
    expect(c.status).toBe(201);
    const id = c.body.id;
    const uok = await request(app).patch(`/api/v1/crm/contacts/${id}`).set('x-user-role','contributor').set('x-user-id','u_contrib').send({ name:'Mine2' });
    expect(uok.status).toBe(200);
    const udeny = await request(app).patch(`/api/v1/crm/contacts/c1`).set('x-user-role','contributor').set('x-user-id','u_other').send({ name:'Hack' });
    expect(udeny.status).toBe(403);
  });

  it('contributor cannot mark sensitive or move across pipelines', async () => {
    const c = await request(app).post('/api/v1/crm/contacts').set('x-user-role','contributor').set('x-user-id','u_contrib').set('x-user-team','teamA')
      .send({ name:'S', team_id:'teamA' });
    const id = c.body.id;
    const sens = await request(app).patch(`/api/v1/crm/contacts/${id}`).set('x-user-role','contributor').set('x-user-id','u_contrib').send({ sensitive:true });
    expect(sens.status).toBe(403);
    const move = await request(app).patch(`/api/v1/crm/contacts/${id}`).set('x-user-role','contributor').set('x-user-id','u_contrib').send({ pipeline_id:'p2' });
    expect(move.status).toBe(403);
  });

  it('manager can update team records including sensitive and pipeline change', async () => {
    // mark original as sensitive by manager
    const s1 = await request(app).patch('/api/v1/crm/contacts/c1').set('x-user-role','manager').set('x-user-id','u_mgr').set('x-user-team','teamA').send({ sensitive:true, pipeline_id:'p2' });
    expect(s1.status).toBe(200);
  });

  it('manager cannot update other teams', async () => {
    const other = await request(app).post('/api/v1/crm/contacts').set('x-user-role','admin').set('x-user-id','u_admin').send({ name:'OtherTeam', team_id:'teamB', owner_id:'u2' });
    const id = other.body.id;
    const den = await request(app).patch(`/api/v1/crm/contacts/${id}`).set('x-user-role','manager').set('x-user-id','u_mgr').set('x-user-team','teamA').send({ name:'Nope' });
    expect(den.status).toBe(403);
  });

  it('admin can do everything', async () => {
    const r = await request(app).patch('/api/v1/crm/contacts/c1').set('x-user-role','admin').set('x-user-id','u_admin').send({ name:'AdminChange' });
    expect(r.status).toBe(200);
    const d = await request(app).delete('/api/v1/crm/contacts/c1').set('x-user-role','admin').set('x-user-id','u_admin');
    expect(d.status).toBe(204);
  });
});

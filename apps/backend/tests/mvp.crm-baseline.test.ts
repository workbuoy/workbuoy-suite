const request = require('supertest');

const { buildApp } = require('@backend/app');

describe('CRM MVP baseline', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp();
  });

  it('enforces viewer restrictions and logs admin operations', async () => {
    const viewerAttempt = await request(app)
      .post('/api/v1/crm/contacts')
      .send({ name: 'viewer-demo' });

    expect(viewerAttempt.status).toBe(403);
    expect(viewerAttempt.body).toMatchObject({ error: 'forbidden' });

    const managerCreate = await request(app)
      .post('/api/v1/crm/contacts')
      .set('x-user-role', 'manager')
      .set('x-user-id', 'manager-1')
      .send({ name: 'Alice Example', owner_id: 'manager-1', team_id: 'ops' });

    expect(managerCreate.status).toBe(201);
    expect(managerCreate.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Alice Example',
        entity_type: 'contact',
      }),
    );

    const auditLog = await request(app).get('/_admin/audit');
    expect(Array.isArray(auditLog.body)).toBe(true);
    expect(auditLog.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'create',
          entity_type: 'contact',
          actor_id: 'manager-1',
        }),
      ]),
    );
  });

  it('seeds baseline data and allows team managers to update sensitive records', async () => {
    const seed = await request(app)
      .post('/_admin/seed')
      .send({
        'contact:seed-1': {
          id: 'seed-1',
          entity_type: 'contact',
          owner_id: 'owner-1',
          team_id: 'team-a',
          sensitive: true,
        },
      });

    expect(seed.status).toBe(200);
    expect(seed.body).toMatchObject({ ok: true, n: 1 });

    const viewerGet = await request(app).get('/api/v1/crm/contacts/seed-1');
    expect(viewerGet.status).toBe(403);

    const managerGet = await request(app)
      .get('/api/v1/crm/contacts/seed-1')
      .set('x-user-role', 'manager')
      .set('x-user-id', 'manager-2')
      .set('x-user-team', 'team-a');

    expect(managerGet.status).toBe(200);
    expect(managerGet.body).toMatchObject({ id: 'seed-1', owner_id: 'owner-1' });

    const managerPatch = await request(app)
      .patch('/api/v1/crm/contacts/seed-1')
      .set('x-user-role', 'manager')
      .set('x-user-id', 'manager-2')
      .set('x-user-team', 'team-a')
      .send({ title: 'Updated Title' });

    expect(managerPatch.status).toBe(200);
    expect(managerPatch.body).toMatchObject({ title: 'Updated Title' });

    const auditLog = await request(app).get('/_admin/audit');
    expect(auditLog.body.length).toBeGreaterThanOrEqual(2);
    expect(auditLog.body[auditLog.body.length - 1]).toMatchObject({
      action: 'update',
      entity_type: 'contact',
      actor_id: 'manager-2',
    });
  });
});

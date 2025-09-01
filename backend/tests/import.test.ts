import request from 'supertest';
import app from '../src/app';

function mp(req: any, fields: Record<string,string>, fileField: string, fileName: string, fileContent: string, contentType='text/csv') {
  const bb = req.field('entity', fields.entity || 'contacts').field('dry_run', fields.dry_run || 'true');
  return bb.attach(fileField, Buffer.from(fileContent), { filename: fileName, contentType });
}

describe('Import/Export', () => {
  it('denies without api key', async () => {
    const res = await request(app).post('/api/v1/crm/import');
    expect(res.status).toBe(401);
  });

  it('imports small CSV in dry-run', async () => {
    const csv = 'tenant_id,name\ndemo-tenant,Alice\n,Missing\n';
    const res = await mp(request(app).post('/api/v1/crm/import')
      .set('x-api-key','dev-123')
      .set('x-tenant-id','demo-tenant')
      .set('Idempotency-Key','k1')
      .set('x-role','admin'),
      { entity: 'contacts', dry_run: 'true' }, 'file', 'contacts.csv', csv);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(1);
    expect(res.body.failed).toBe(1);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('exports CSV', async () => {
    const res = await request(app).get('/api/v1/crm/export?entity=contacts&format=csv')
      .set('x-api-key','dev-123')
      .set('x-tenant-id','demo-tenant')
      .set('x-role','admin');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
  });
});

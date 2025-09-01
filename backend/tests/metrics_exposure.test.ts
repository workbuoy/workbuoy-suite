import request from 'supertest';
import app from '../src/app';

describe('CRM Observability metrics', () => {
  test('webhook success/error counters and pipeline transitions + latency histogram exposed', async () => {
    // Simulate webhook success and error
    await request(app).post('/api/v1/connectors/hubspot/webhook').send({});
    await request(app).post('/api/v1/connectors/hubspot/webhook?error=1').send({});

    // Pipeline transition
    await request(app).post('/api/v1/crm/pipelines/p1/transitions').send({ from_stage: 'S1', to_stage: 'S2' }).expect(204);

    // Hit a CRM GET to record latency
    await request(app).get('/api/v1/crm/contacts').expect(200);

    // Fetch metrics
    const m = await request(app).get('/metrics');
    expect(m.status).toBe(200);
    const body = m.text;

    // Check metric names exist
    expect(body).toMatch(/crm_webhook_success_total/);
    expect(body).toMatch(/crm_webhook_error_total/);
    expect(body).toMatch(/crm_pipeline_transitions_total/);
    expect(body).toMatch(/crm_api_latency_ms_bucket/);
    expect(body).toMatch(/crm_api_latency_ms_count/);

    // Optional: label presence
    expect(body).toMatch(/provider="hubspot"/);
    expect(body).toMatch(/pipeline_id="p1"/);
    expect(body).toMatch(/from_stage="S1"/);
    expect(body).toMatch(/to_stage="S2"/);
  });
});

import express from 'express';
import request from 'supertest';
import { requestContext } from '../src/core/middleware/requestContext';

describe('requestContext correlation exposure', () => {
  it('makes correlationId available on req and wb', async () => {
    const app = express();
    app.use(requestContext as any);
    app.get('/ctx', (req: any, res) => {
      res.json({ correlationId: req.correlationId, wbCorrelationId: req.wb?.correlationId });
    });

    const correlationId = 'corr-full-123';
    const res = await request(app).get('/ctx').set('x-correlation-id', correlationId);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ correlationId, wbCorrelationId: correlationId });
  });
});

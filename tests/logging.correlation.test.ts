import express from 'express';
import request from 'supertest';
import { requestContext } from '../src/core/middleware/requestContext';
import { errorHandler } from '../src/core/middleware/errorHandler';
import { AppError } from '../src/core/errors';
import * as logging from '../src/core/logging/logger';

describe('logging correlation propagation', () => {
  it('logs correlation id from requestContext via errorHandler', async () => {
    const app = express();
    const logSpy = jest.spyOn(logging, 'log').mockImplementation(() => undefined);
    app.use(requestContext as any);
    app.get('/boom', (_req, _res, next) => {
      next(new AppError('test error', 418, 'E_TEST'));
    });
    app.use(errorHandler as any);

    const correlationId = 'corr-test-001';
    const res = await request(app).get('/boom').set('x-correlation-id', correlationId);

    expect(res.status).toBe(418);
    expect(res.body.correlationId).toBe(correlationId);

    const errorCall = logSpy.mock.calls.find(([level]) => level === 'error');
    expect(errorCall?.[3]).toBe(correlationId);

    logSpy.mockRestore();
  });
});

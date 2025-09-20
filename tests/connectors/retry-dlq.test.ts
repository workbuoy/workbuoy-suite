import { executeConnectorAction } from '../../src/connectors/execution';
import { resetConnectorCallRepository, getConnectorCallRepository } from '../../src/connectors/internal/callsRepository';
import { resetConnectorCircuits } from '../../src/connectors/internal/circuitRegistry';
import bus from '../../src/core/eventBusV2';

describe('connector retry and DLQ handling', () => {
  beforeEach(() => {
    resetConnectorCallRepository();
    resetConnectorCircuits();
    bus.reset?.();
  });

  it('retries on transient failures and emits to DLQ on exhaustion', async () => {
    const attempts: number[] = [];
    const failingCall = jest.fn(async () => {
      attempts.push(Date.now());
      const error: any = new Error('server_error');
      error.statusCode = 500;
      throw error;
    });

    await expect(executeConnectorAction(
      {
        connector: 'retry-test',
        capabilityId: 'demo.action',
        payload: { n: 1 },
        idempotencyKey: 'retry-key',
        maxRetries: 2,
        retryBaseMs: 1,
        sleepFn: async () => {},
      },
      failingCall,
    )).rejects.toThrow('connector_execution_failed');

    expect(failingCall).toHaveBeenCalledTimes(3); // initial + 2 retries
    const repo = getConnectorCallRepository();
    const record = await repo.find('retry-key');
    expect(record?.status).toBe('failed');
    expect(record?.retries).toBeGreaterThanOrEqual(3);

    const peek = bus._peek?.();
    const dlqEvents = peek?.dlq ?? [];
    expect(dlqEvents.some(event => event.type === 'eventbus.dlq' && event.payload?.connector === 'retry-test')).toBe(true);
  });
});

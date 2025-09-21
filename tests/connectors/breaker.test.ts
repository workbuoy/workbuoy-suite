import { executeConnectorAction } from '../../src/connectors/execution';
import { resetConnectorCallRepository } from '../../src/connectors/internal/callsRepository';
import { getConnectorCircuit, getConnectorCircuitState, resetConnectorCircuits } from '../../src/connectors/internal/circuitRegistry';

describe('connector circuit breaker', () => {
  beforeEach(() => {
    resetConnectorCallRepository();
    resetConnectorCircuits();
  });

  it('opens after repeated failures and recovers after cooldown', async () => {
    const breaker = getConnectorCircuit('breaker-test', { failureThreshold: 2, halfOpenAfterMs: 5, failureWindowMs: 50 });

    const failingCall = async () => {
      throw new Error('boom');
    };

    const attempt = async (key: string) => {
      await executeConnectorAction(
        {
          connector: 'breaker-test',
          capabilityId: 'demo.action',
          payload: { key },
          idempotencyKey: key,
          maxRetries: 0,
          retryBaseMs: 1,
          breaker,
          sleepFn: async () => {},
        },
        failingCall,
      );
    };

    await expect(attempt('k1')).rejects.toThrow('boom');
    await expect(attempt('k2')).rejects.toThrow('boom');

    await expect(attempt('k3')).rejects.toThrow(/circuit_open/);
    expect(getConnectorCircuitState('breaker-test')).toBe('open');

    await new Promise(resolve => setTimeout(resolve, 10));

    const successCall = jest.fn(async () => ({ ok: true }));
    const result = await executeConnectorAction(
      {
        connector: 'breaker-test',
        capabilityId: 'demo.action',
        payload: { key: 'k4' },
        idempotencyKey: 'k4',
        breaker,
        maxRetries: 0,
        retryBaseMs: 1,
        sleepFn: async () => {},
      },
      successCall,
    );

    expect(result.response).toEqual({ ok: true });
    expect(getConnectorCircuitState('breaker-test')).toBe('closed');
  });
});

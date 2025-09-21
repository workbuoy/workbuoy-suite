import { executeConnectorAction } from '../../src/connectors/execution';
import { resetConnectorCallRepository } from '../../src/connectors/internal/callsRepository';
import { resetConnectorCircuits } from '../../src/connectors/internal/circuitRegistry';
import bus from '../../src/core/eventBusV2';

describe('connector execution idempotency', () => {
  beforeEach(() => {
    resetConnectorCallRepository();
    resetConnectorCircuits();
    bus.reset?.();
  });

  it('returns cached response when same idempotency key is reused', async () => {
    const callFn = jest.fn(async () => ({ ok: true, ts: Date.now() }));
    const opts = {
      connector: 'idempotency',
      capabilityId: 'demo.execute',
      payload: { foo: 'bar' },
      idempotencyKey: 'key-1',
    };

    const first = await executeConnectorAction(opts, callFn);
    const second = await executeConnectorAction(opts, callFn);

    expect(callFn).toHaveBeenCalledTimes(1);
    expect(second.response).toEqual(first.response);
  });
});

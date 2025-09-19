import fs from 'fs';
import * as logging from '../src/core/logging/logger';

describe('logger PII masking', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('masks sensitive strings and preserves correlationId', () => {
    const appendSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);
    logging.log('info', 'user_signup', {
      email: 'user@example.com',
      phone: '+15551234567',
      account: 'NO9386011117947'
    }, 'corr-mask-001');

    expect(appendSpy).toHaveBeenCalled();
    const payload = appendSpy.mock.calls[0]?.[1];
    expect(typeof payload).toBe('string');
    const record = JSON.parse(String(payload).trim());
    expect(record.email).toBe('u***@example.com');
    expect(record.phone).toContain('***');
    expect(record.account).toContain('****');
    expect(record.correlationId).toBe('corr-mask-001');
  });
});

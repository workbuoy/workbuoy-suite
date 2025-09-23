import type { Server } from 'http';

describe('www entrypoint startup', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('loads without throwing when listen is defined', async () => {
    const { default: app } = await import('../../src/server');
    const listen = jest.spyOn(app, 'listen').mockImplementation((port: number, cb?: () => void) => {
      if (cb) {
        cb();
      }
      return { close: jest.fn() } as unknown as Server;
    });

    await import('../../src/bin/www');

    expect(listen).toHaveBeenCalled();
    const [portArg, handler] = listen.mock.calls[0]!;
    expect(typeof portArg).toBe('number');
    expect(typeof handler).toBe('function');
  });
});

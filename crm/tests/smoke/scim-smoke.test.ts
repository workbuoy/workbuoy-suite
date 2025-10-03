import { jest } from '@jest/globals';
import handler from '../../pages/api/scim/v2/Users';

jest.mock('../../lib/db', () => {
  const upsert = jest.fn().mockResolvedValue({ id: 'user-1', email: 'scim@example.com', name: 'SCIM User' });
  const findMany = jest.fn().mockResolvedValue([
    { id: 'user-1', email: 'scim@example.com', name: 'SCIM User' },
  ]);
  return {
    prisma: {
      user: {
        upsert,
        findMany,
      },
    },
  };
});

describe('SCIM Users API smoke', () => {
  beforeEach(() => {
    process.env.SCIM_BEARER = 'testtoken';
  });

  function resFactory() {
    const res: any = {};
    res.statusCode = 200;
    res.headers = {};
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    res.json = (body: unknown) => {
      res.body = body;
      return res;
    };
    res.setHeader = () => {};
    res.end = () => res;
    return res;
  }

  it('creates users via POST with bearer auth', async () => {
    const req: any = {
      method: 'POST',
      headers: { authorization: 'Bearer testtoken' },
      body: { userName: 'scim@example.com', name: { formatted: 'SCIM User' } },
    };
    const res = resFactory();
    // @ts-expect-error - Next API types not fully mocked
    await handler(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body?.userName).toBe('scim@example.com');
  });

  it('lists users via GET', async () => {
    const req: any = {
      method: 'GET',
      headers: { authorization: 'Bearer testtoken' },
    };
    const res = resFactory();
    // @ts-expect-error - Next API types not fully mocked
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body?.Resources)).toBe(true);
    expect(res.body?.Resources?.[0]?.userName).toBe('scim@example.com');
  });
});

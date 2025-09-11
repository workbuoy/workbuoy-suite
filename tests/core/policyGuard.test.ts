import { policyGuard } from '../../src/core/policy/guard';

function run(method: string, autonomy: number) {
  const req: any = { method, wb: { autonomyLevel: autonomy, correlationId: 'c-1', roleId: 'r-1', confidence: 0.9 } };
  let status = 200, body: any;
  const res: any = { locals:{}, status: (s:number)=>{ status=s; return { json:(b:any)=>{ body=b; } }; } };
  const next = jest.fn();
  policyGuard()(req,res,next);
  return { status, body, next, res };
}

describe('policyGuard', () => {
  it('GET allowed regardless of level', () => {
    const { next } = run('GET', 0);
    expect(next).toHaveBeenCalled();
  });
  it('POST denied at level 0/1 with read_only', () => {
    const { status, body } = run('POST', 1);
    expect(status).toBe(403);
    expect(body.degraded_mode).toBe('read_only');
    expect(Array.isArray(body.explanations)).toBe(true);
  });
  it('POST at level 2 -> ask_approval', () => {
    const { status, body } = run('POST', 2);
    expect(status).toBe(403);
    expect(body.degraded_mode).toBe('ask_approval');
  });
});

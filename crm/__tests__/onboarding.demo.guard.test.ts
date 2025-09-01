import handler from '../pages/api/onboarding/demo';

function resFactory(){
  const res: any = {}; res.statusCode = 200; res.headers = {};
  res.status = (c:number)=>{ res.statusCode=c; return res; };
  res.json = (b:any)=>{ res.body=b; return res; };
  res.setHeader = ()=>{}; res.end = ()=>res;
  return res;
}

const OLD_ENV = process.env;
beforeEach(()=>{ process.env = { ...OLD_ENV, WB_DEMO_ENABLE: 'false' }; });
afterAll(()=>{ process.env = OLD_ENV; });

test('demo endpoint requires WB_DEMO_ENABLE=true', async () => {
  const req: any = { method:'POST', headers: { 'x-user-role': 'editor' } };
  const res = resFactory();
  // @ts-ignore
  await handler(req, res);
  expect(res.statusCode).toBe(403);
});

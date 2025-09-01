import handler from '../pages/api/tasks/index';

function resFactory(){
  const res: any = {}; res.statusCode = 200; res.headers = {};
  res.status = (c:number)=>{ res.statusCode=c; return res; };
  res.json = (b:any)=>{ res.body=b; return res; };
  res.setHeader = ()=>{}; res.end = ()=>res;
  return res;
}

test('POST /api/tasks returns 400 on invalid payload', async () => {
  const req: any = { method:'POST', headers: { 'x-user-role':'editor' }, body: {} };
  const res = resFactory();
  // @ts-ignore
  await handler(req, res);
  expect(res.statusCode).toBe(400);
});

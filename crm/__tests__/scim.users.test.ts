import handler from '../pages/api/scim/v2/Users';

function resFactory(){
  const res: any = {};
  res.statusCode = 200;
  res.headers = {};
  res.status = (c:number)=>{ res.statusCode=c; return res; };
  res.setHeader = ()=>{};
  res.json = (b:any)=>{ res.body=b; return res; };
  res.end = ()=> res;
  return res;
}

const OLD_ENV = process.env;
beforeEach(()=>{ process.env = { ...OLD_ENV, SCIM_BEARER: 'testtoken' }; });
afterAll(()=>{ process.env = OLD_ENV; });

test('SCIM Users POST creates user', async () => {
  const req: any = { method: 'POST', headers: { authorization: 'Bearer testtoken' }, body: { userName: 'scim@example.com', name: { formatted: 'SCIM User' } } };
  const res = resFactory();
  // @ts-ignore
  await handler(req, res);
  expect(res.statusCode).toBe(201);
  expect(res.body?.userName).toBe('scim@example.com');
});

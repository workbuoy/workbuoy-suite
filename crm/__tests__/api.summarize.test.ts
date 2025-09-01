import handler from '../pages/api/crm/summarize';
function createRes(){
  const res: any = {};
  res.statusCode = 200;
  res.headers = {};
  res.status = (code:number)=>{ res.statusCode = code; return res; };
  res.setHeader = (k:string,v:any)=>{ res.headers[k]=v; };
  res.json = (body:any)=>{ res.body = body; return res; };
  return res;
}
test('/api/crm/summarize returns stub text', async () => {
  const req: any = { method: 'POST' };
  const res = createRes();
  await handler(req, res);
  expect(res.statusCode).toBe(200);
  expect(res.body.summary).toContain('AI-sammendrag av kundekontekst (stub)');
});

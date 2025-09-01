import handler from '../pages/api/feedback.js';

function mockReqRes(body={}, headers={}){
  let statusCode = 200; let jsonBody=null; let sent=false;
  return [
    { method:'POST', body, headers, },
    { status:(code)=>{ statusCode=code; return this; }, json:(obj)=>{ jsonBody=obj; sent=true; }, end:()=>{ sent=true; }, get statusCode(){return statusCode;}, get body(){return jsonBody;} }
  ];
}

describe('feedback rate limit payload', ()=>{
  test('429 shape', ()=>{
    const [req,res] = mockReqRes({ foo:'bar' }, { 'x-user-email':'test@example.com' });
    // exhaust bucket quickly
    for(let i=0;i<11;i++){
      handler(req,res);
    }
    expect(res.statusCode).toBe(429);
  });
});

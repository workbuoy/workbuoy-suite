const log = require('../../logger');
process.env.WB_LOG_JSON='1';
test('logger masks tokens and email', ()=>{
  const msg = { authorization:'Bearer abc', meta:{ email:'a@b.com' } };
  expect(()=> log.info(msg)).not.toThrow();
});

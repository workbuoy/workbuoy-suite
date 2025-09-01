/**
 * Basic token bucket behavior.
 */
import rateLimit from '../lib/middleware/rate-limit.js';

function mockReqRes() {
  let statusCode = 200;
  const headers = {};
  return [{
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
  }, {
    setHeader(k,v){ headers[k]=v; },
    status(code){ statusCode=code; return this; },
    json(obj){ this._json=obj; return this; },
    get statusCode(){ return statusCode; }
  }];
}

test('rate limit eventually 429s', () => {
  process.env.WB_RATE_LIMIT_PER_MIN = '60';
  process.env.WB_RATE_LIMIT_BURST = '3';
  let limited = false;
  for (let i=0;i<5;i++) {
    const [req,res] = mockReqRes();
    limited = rateLimit(req,res);
  }
  expect(limited).toBe(true);
});

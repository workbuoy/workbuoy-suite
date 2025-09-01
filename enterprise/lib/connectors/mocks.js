'use strict';
class UpstreamError extends Error { constructor(msg){ super(msg); this.name='UpstreamError'; } }

async function maybeFail(){
  if (process.env.CONNECTOR_MOCK_FAIL === '5xx') throw new UpstreamError('mock_5xx');
  if (process.env.CONNECTOR_MOCK_FAIL === 'timeout') await new Promise((_r, _j)=> setTimeout(()=>{}, 10*60*1000));
  return { ok: true };
}

module.exports = { maybeFail, UpstreamError };

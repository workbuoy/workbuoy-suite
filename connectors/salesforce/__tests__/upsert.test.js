import http from 'http';
import { SalesforceConnector } from '../connector.js';
import fs from 'fs';

function startMockSF(){
  // minimal oauth + upsert server
  const state = { patches: {}, tokens: 0 };
  const server = http.createServer((req,res)=>{
    if (req.method==='POST' && req.url==='/oauth/token'){
      state.tokens++;
      res.writeHead(200, {'content-type':'application/json'});
      res.end(JSON.stringify({ access_token:'t123', token_type:'Bearer', expires_in:3600 }));
      return;
    }
    if (req.method==='PATCH' && req.url.startsWith('/services/data/v58.0/sobjects/Contact/ExternalId__c/')){
      const id = decodeURIComponent(req.url.split('/').pop());
      let body=''; req.on('data',d=>body+=d); req.on('end', ()=>{
        state.patches[id] = (state.patches[id]||0)+1;
        const exists = state.patches[id] > 1;
        res.writeHead(exists?204:201, {'content-type':'application/json'});
        res.end(exists? '' : JSON.stringify({ id:'003xx000' }));
      });
      return;
    }
    res.writeHead(404); res.end();
  });
  return new Promise(resolve=> server.listen(0, ()=> resolve({ server, port: server.address().port, state })));
}

jest.setTimeout(10000);

test('idempotent upsert contact (201 then 204) and DLQ on failure', async () => {
  const { server, port, state } = await startMockSF();
  process.env.SF_TOKEN_URL = `http://127.0.0.1:${port}/oauth/token`;
  process.env.SF_INSTANCE_URL = `http://127.0.0.1:${port}`;
  process.env.SF_CLIENT_ID = 'x'; process.env.SF_CLIENT_SECRET='y'; process.env.SF_REFRESH_TOKEN='r';

  const conn = new SalesforceConnector({});
  const evt = { type:'contact', external_id:'wb-ct-1001', name:'Test', email:'t@example.com' };

  await conn.processEvent(evt); // 201
  await conn.processEvent(evt); // 204
  expect(state.patches['wb-ct-1001']).toBe(2);

  // induce failure: wrong endpoint by changing object name in mapping temporarily
  const mappingPath = new URL('../mapping.yaml', import.meta.url).pathname;
  const orig = fs.readFileSync(mappingPath, 'utf8');
  try {
    fs.writeFileSync(mappingPath, orig.replace('Contact','WrongObject'));
    await expect(conn.processEvent(evt)).rejects.toBeTruthy();
    // DLQ should have one
    const dlqFile = new URL('../dlq.json', import.meta.url).pathname;
    const arr = JSON.parse(fs.readFileSync(dlqFile,'utf8'));
    expect(arr.length).toBeGreaterThan(0);
  } finally {
    fs.writeFileSync(mappingPath, orig);
  }

  server.close();
});

import http from 'http';
import { DynamicsConnector } from '../connector.js';

function startMockDyn(){
  const state = { patches: {}, posts: {}, tokens: 0 };
  const server = http.createServer((req,res)=>{
    if (req.method==='POST' && req.url.startsWith('/token')){
      state.tokens++;
      res.writeHead(200, {'content-type':'application/json'});
      res.end(JSON.stringify({ access_token:'x', expires_in:3600 }));
      return;
    }
    if (req.method==='PATCH' && req.url.startsWith('/api/data/v9.2/contacts(')){
      const key = decodeURIComponent(req.url.match(/contacts\((.+)\)/)[1]);
      const id = key.split("=")[1].replace(/'/g,'');
      const exists = !!state.patches[id];
      state.patches[id] = (state.patches[id]||0)+1;
      if (!exists){
        // simulate not found on first PATCH → 404 to force create
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(204); res.end(); return;
    }
    if (req.method==='POST' && req.url==='/api/data/v9.2/contacts'){
      let body=''; req.on('data',d=>body+=d); req.on('end', ()=>{
        res.writeHead(204); res.end();
      }); return;
    }
    res.writeHead(404); res.end();
  });
  return new Promise(resolve => server.listen(0, ()=> resolve({ server, port: server.address().port, state })));
}

jest.setTimeout(10000);

test('upsert via alternate key: PATCH 404 -> POST 204 -> PATCH 204', async () => {
  const { server, port, state } = await startMockDyn();
  process.env.DYN_TENANT_ID = 'tenant';
  process.env.DYN_CLIENT_ID = 'id';
  process.env.DYN_CLIENT_SECRET = 'secret';
  process.env.DYN_SCOPE = `http://127.0.0.1:${port}/.default`;
  process.env.DYN_BASE_URL = `http://127.0.0.1:${port}`;

  const conn = new DynamicsConnector({});
  const evt = { type:'contact', external_id:'dyn-ct-1001', name:'Test', email:'t@example.com' };

  await conn.processEvent(evt); // PATCH -> 404, POST -> 204
  await conn.processEvent(evt); // PATCH -> 204

  expect(state.patches['dyn-ct-1001']).toBeGreaterThan(0);
  server.close();
});

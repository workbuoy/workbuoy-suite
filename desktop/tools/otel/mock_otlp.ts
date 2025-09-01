import express from 'express';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function startMockOTLP(port=4318) {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  let count = 0;

  app.post('/v1/traces', (req, res) => {
    count++;
    res.status(200).json({ ok: true });
  });

  const server = app.listen(port, () => console.log('[mock-otlp] listening on :'+port));
  return {
    server,
    getCount: ()=>count,
    async stop() {
      await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
      mkdirSync('reports', { recursive: true });
      writeFileSync(join('reports','otlp_mock.json'), JSON.stringify({ spans: count }, null, 2));
    }
  };
}

import { spawn } from 'child_process';
import fs from 'fs';

const COLLECTOR_PORT = Number(process.env.COLLECTOR_PORT || 43180);
const ENDPOINT = `http://127.0.0.1:${COLLECTOR_PORT}`;

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startCollector(){
  const ps = spawn(process.execPath, ['scripts/otel_collector_mock.js'], { stdio: 'inherit', env: { ...process.env, PORT: String(COLLECTOR_PORT) } });
  await wait(500);
  return ps;
}

async function send(endpoint, path, body){
  const r = await fetch(`${endpoint}${path}`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('send failed '+r.status);
}

async function main(){
  const ps = await startCollector();
  try {
    // Inject 20 sync spans (varying duration), and 2 crashes across versions
    for (let i=0;i<20;i++){
      const duration = 50 + (i*10 % 400);
      const version = i<10 ? '1.0.0' : '1.1.0';
      const env = i<10 ? 'staging' : 'prod';
      const span = {
        resourceSpans: [{
          resource: { attributes: [
            { key:'deployment.environment', value:{ stringValue: env } },
            { key:'release.channel', value:{ stringValue: 'stable' } },
            { key:'service.version', value:{ stringValue: version } },
            { key:'service.name', value:{ stringValue: 'workbuoy-desktop' } }
          ]},
          scopeSpans: [{
            scope: { name: 'wb.desktop.sync' },
            spans: [{
              traceId: '0000000000000000000000000000abcd',
              spanId: '00000000abcd1234',
              name: 'desktop.sync',
              kind: 2,
              startTimeUnixNano: String(BigInt(Date.now())*1000000n),
              endTimeUnixNano: String(BigInt(Date.now())*1000000n + BigInt(duration*1e6)),
              attributes: [{ key:'component', value:{ stringValue:'sync' } }]
            }]
          }]
        }]
      };
      await send(ENDPOINT, '/v1/traces', span);
    }
    const crash = (version, env)=> ({
      resourceLogs: [{
        resource: { attributes: [
          { key:'deployment.environment', value:{ stringValue: env } },
          { key:'release.channel', value:{ stringValue: 'stable' } },
          { key:'service.version', value:{ stringValue: version } },
          { key:'service.name', value:{ stringValue: 'workbuoy-desktop' } }
        ]},
        scopeLogs: [{
          scope: { name:'wb.desktop' },
          logRecords: [{
            timeUnixNano: String(BigInt(Date.now())*1000000n),
            body: { stringValue: 'Unhandled exception' },
            attributes: [
              { key:'event', value:{ stringValue:'crash' } },
              { key:'exception.type', value:{ stringValue:'TypeError' } },
              { key:'exception.message', value:{ stringValue:'x is not a function' } }
            ]
          }]
        }]
      }]
    });
    await send(ENDPOINT, '/v1/logs', crash('1.0.0','staging'));
    await send(ENDPOINT, '/v1/logs', crash('1.1.0','prod'));

    // Read /metrics
    const met = await (await fetch(`${ENDPOINT}/metrics`)).text();

    // Parse Prometheus text for counter and histogram quantile via naive parsing
    const crashes = (met.match(/^desktop_crash_total{[^}]*} [0-9.]+$/gm)||[]).length;
    const hasBuckets = /sync_latency_seconds_bucket/.test(met);

    const report = { endpoint: ENDPOINT, crashes_reported: crashes, has_latency_histogram: hasBuckets };
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync('reports/telemetry_smoke.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    if (!(crashes >= 2 && hasBuckets)) process.exit(2);
  } finally {
    ps.kill('SIGTERM');
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });

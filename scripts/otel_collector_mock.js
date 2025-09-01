// Minimal OTLP/HTTP collector mock: POST /v1/traces and /v1/logs (application/json)
// Aggregates desktop crash counts and sync latency histogram; exposes /metrics via prom-client.
import http from 'http';
import client from 'prom-client';
import { fileURLToPath } from 'url';

const PORT = Number(process.env.PORT || 43180);

// Registry & metrics
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const crashCounter = new client.Counter({
  name: 'desktop_crash_total',
  help: 'Desktop crashes total',
  labelNames: ['env','channel','version'],
  registers: [registry]
});

const syncLatency = new client.Histogram({
  name: 'sync_latency_seconds',
  help: 'Sync span latency in seconds',
  labelNames: ['env','channel','version'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 5],
  registers: [registry]
});

function nsToSec(ns){ return Number(ns) / 1e9; }

function extractResAttrs(resource){
  const out = { env:'dev', channel:'stable', version:'0.0.0' };
  const attrs = resource?.resource?.attributes || [];
  for (const a of attrs){
    const k = a.key; const v = a.value?.stringValue || a.value?.intValue || a.value?.doubleValue || a.value?.boolValue || null;
    if (k === 'service.version' || k==='app.version') out.version = String(v);
    if (k === 'deployment.environment' || k==='env') out.env = String(v);
    if (k === 'release.channel' || k==='channel') out.channel = String(v);
  }
  return out;
}

async function handleTraces(req, res, body){
  let j; try { j = JSON.parse(body||'{}'); } catch { res.writeHead(400); return res.end('bad json'); }
  const resourceSpans = j.resourceSpans || [];
  for (const rs of resourceSpans){
    const labels = extractResAttrs(rs);
    const scopeSpans = rs.scopeSpans || rs.instrumentationLibrarySpans || [];
    for (const ss of scopeSpans){
      const spans = ss.spans || [];
      for (const sp of spans){
        const dur = nsToSec(BigInt(sp.endTimeUnixNano) - BigInt(sp.startTimeUnixNano));
        if ((sp.name||'').toLowerCase().includes('sync')){
          syncLatency.labels(labels.env, labels.channel, labels.version).observe(Number(dur));
        }
      }
    }
  }
  res.writeHead(200); res.end('{}');
}

async function handleLogs(req, res, body){
  let j; try { j = JSON.parse(body||'{}'); } catch { res.writeHead(400); return res.end('bad json'); }
  const resourceLogs = j.resourceLogs || [];
  for (const rl of resourceLogs){
    const labels = extractResAttrs(rl);
    const scopeLogs = rl.scopeLogs || rl.instrumentationLibraryLogs || [];
    for (const sl of scopeLogs){
      const logs = sl.logRecords || [];
      for (const lr of logs){
        const attrs = lr.attributes || [];
        let isCrash = false;
        for (const a of attrs){
          if (a.key === 'event' && a.value?.stringValue === 'crash') isCrash = True;
          if (a.key === 'exception.type' || a.key === 'exception.message') isCrash = true;
        }
        if (isCrash) crashCounter.labels(labels.env, labels.channel, labels.version).inc();
      }
    }
  }
  res.writeHead(200); res.end('{}');
}

const server = http.createServer(async (req,res)=>{
  if (req.method==='GET' && (req.url==='/health' || req.url==='/')){
    res.writeHead(200, {'content-type':'application/json'});
    return res.end(JSON.stringify({ ok:true }));
  }
  if (req.method==='GET' && req.url==='/metrics'){
    res.writeHead(200, {'content-type':'text/plain'});
    return res.end(await registry.metrics());
  }
  // Collect body for POST
  if (req.method==='POST' && (req.url==='/v1/traces' || req.url==='/v1/logs')){
    let body=''; req.on('data',d=>body+=d);
    req.on('end', async ()=>{
      try {
        if (req.url==='/v1/traces') return handleTraces(req,res,body);
        if (req.url==='/v1/logs') return handleLogs(req,res,body);
      } catch (e){
        res.writeHead(500); return res.end(String(e));
      }
    });
    return;
  }
  res.writeHead(404); res.end('not found');
});

server.listen(PORT, ()=>console.log('OTEL collector mock on :'+PORT));

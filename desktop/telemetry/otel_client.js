// Minimal OTLP/HTTP JSON sender for WorkBuoy Desktop
// Sends: sync span (duration) and crash event (log)
function nowNs(){ return BigInt(Date.now()) * 1000000n; }
function rndId(){ return Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString('hex'); }

export async function sendSyncSpan({ endpoint, env='dev', channel='stable', version='1.0.0', durationMs=150 }){
  const start = nowNs(); const end = start + BigInt(Math.floor(durationMs*1e6));
  const payload = {
    resourceSpans: [{
      resource: { attributes: [
        { key:'deployment.environment', value:{ stringValue: env } },
        { key:'release.channel', value:{ stringValue: channel } },
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
          startTimeUnixNano: start.toString(),
          endTimeUnixNano: end.toString(),
          attributes: [{ key:'component', value:{ stringValue:'sync' } }]
        }]
      }]
    }]
  };
  const r = await fetch(`${endpoint}/v1/traces`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('trace send failed '+r.status);
}

export async function sendCrash({ endpoint, env='dev', channel='stable', version='1.0.0', type='Error', message='boom' }){
  const payload = {
    resourceLogs: [{
      resource: { attributes: [
        { key:'deployment.environment', value:{ stringValue: env } },
        { key:'release.channel', value:{ stringValue: channel } },
        { key:'service.version', value:{ stringValue: version } },
        { key:'service.name', value:{ stringValue: 'workbuoy-desktop' } }
      ]},
      scopeLogs: [{
        scope: { name:'wb.desktop' },
        logRecords: [{
          timeUnixNano: (BigInt(Date.now())*1000000n).toString(),
          body: { stringValue: 'Unhandled exception' },
          attributes: [
            { key:'event', value:{ stringValue:'crash' } },
            { key:'exception.type', value:{ stringValue: type } },
            { key:'exception.message', value:{ stringValue: message } }
          ]
        }]
      }]
    }]
  };
  const r = await fetch(`${endpoint}/v1/logs`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('log send failed '+r.status);
}

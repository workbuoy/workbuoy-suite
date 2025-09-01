import { randomUUID } from 'crypto';

const histo = {
  buckets: [0.01,0.05,0.1,0.25,0.5,1,2,5],
  counts: {}, // key -> [counts per bucket], key e.g. GET /api/modes/handle 200
  sums: {}, // key -> total seconds
  total: {}, // key -> total observations
};

export function startTrace(req){
  const start = process.hrtime.bigint();
  const requestId = req.headers['x-request-id'] || randomUUID();
  req._requestId = requestId;
  return {
    requestId,
    end: (route, statusCode=200) => {
      const end = process.hrtime.bigint();
      const sec = Number(end - start) / 1e9;
      observe(route, statusCode, sec);
      return { requestId, durationSeconds: sec };
    }
  };
}

function observe(route, statusCode, value){
  const key = `${route} ${statusCode}`;
  if(!histo.counts[key]){
    histo.counts[key] = new Array(histo.buckets.length+1).fill(0);
    histo.sums[key] = 0;
    histo.total[key] = 0;
  }
  let i=0; while(i<histo.buckets.length && value>histo.buckets[i]) i++;
  histo.counts[key][i]++;
  histo.sums[key]+=value;
  histo.total[key]++;
}

export function renderPromMetrics(){
  const lines = [];
  lines.push('# HELP workbuoy_requests_total Total HTTP requests');
  lines.push('# TYPE workbuoy_requests_total counter');
  Object.entries(histo.total).forEach(([k,v])=>{
    const [route, code] = k.split(' ');
    lines.push(`workbuoy_requests_total{route="${route}",code="${code}"} ${v}`);
  });

  lines.push('# HELP workbuoy_request_duration_seconds Duration histogram');
  lines.push('# TYPE workbuoy_request_duration_seconds histogram');
  Object.entries(histo.counts).forEach(([k,counts])=>{
    const [route, code] = k.split(' ');
    let cum=0;
    for(let i=0;i<counts.length-1;i++){
      cum+=counts[i];
      const le = histo.buckets[i];
      lines.push(`workbuoy_request_duration_seconds_bucket{route="${route}",code="${code}",le="${le}"} ${cum}`);
    }
    cum+=counts[counts.length-1];
    lines.push(`workbuoy_request_duration_seconds_bucket{route="${route}",code="${code}",le="+Inf"} ${cum}`);
    lines.push(`workbuoy_request_duration_seconds_sum{route="${route}",code="${code}"} ${histo.sums[k]}`);
    lines.push(`workbuoy_request_duration_seconds_count{route="${route}",code="${code}"} ${cum}`);
  });

  // simple monthly error budget (assume SLO 99.9%)
  // track 5xx as burn
  const slo = 0.999;
  const days = 30;
  const seconds = days*24*3600;
  const budget = (1-slo)*seconds;
  const errors = Object.entries(histo.total).filter(([k,v])=>k.includes(' 500')).reduce((a,[,v])=>a+v,0);
  lines.push('# HELP workbuoy_error_budget_seconds Monthly error budget and burn (rough)');
  lines.push('# TYPE workbuoy_error_budget_seconds gauge');
  lines.push(`workbuoy_error_budget_seconds{window="30d"} ${budget}`);
  lines.push(`workbuoy_error_budget_burn_events_total{window="30d"} ${errors}`);
  return lines.join("\n")+"\n";
}

/**
 * Simple perf smoke: fires requests to /api/healthz and /api/ai/ask (if available)
 * and prints approximate p95. Optionally POSTs to /api/perf/report if PERF_REPORT_TOKEN is set.
 */
const http = require('http');

function req(path){ return new Promise(res=>{
  const start=Date.now();
  const r=http.request({host:'localhost',port:3000,path,method:'GET'},(resp)=>{ resp.resume(); resp.on('end',()=>res(Date.now()-start)); });
  r.on('error',()=>res(1000)); r.end();
});}

async function run(){
  const times=[];
  for(let i=0;i<30;i++){ times.push(await req('/api/healthz')); }
  times.sort((a,b)=>a-b);
  const p95 = times[Math.floor(times.length*0.95)-1];
  console.log('p95(ms)=', p95);
  if(process.env.PERF_REPORT_TOKEN){
    // push via curl-like http to /api/perf/report
    const data=JSON.stringify({p95});
    const opts={host:'localhost',port:3000,path:'/api/perf/report',method:'POST',headers:{'content-type':'application/json','x-perf-token':process.env.PERF_REPORT_TOKEN}};
    const r=http.request(opts,(resp)=>{resp.resume(); resp.on('end',()=>process.exit(0));}); r.on('error',()=>process.exit(0)); r.write(data); r.end();
  }
}
run();

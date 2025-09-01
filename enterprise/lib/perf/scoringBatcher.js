
// Scoring batcher with concurrency and auto-tune
import { observeScoringP95 } from '../../pages/api/metrics.js';
import { ENABLE_PERF_AUTOTUNE } from '../flags.js';

let BATCH_SIZE = 50;
let CONCURRENCY = 4;

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function scoreOne(signal){
  // Placeholder scoring: combine urgency and impact with decay (if present)
  const u = Number(signal.urgency||0.5);
  const i = Number(signal.impact||0.5);
  const decay = Number(signal.decay||1);
  const base = (0.5*u + 0.5*i) * decay;
  await sleep(1); // simulate lightweight work
  return { id: signal.id||null, score: Math.max(0, Math.min(1, base)) };
}

function p95(arr){ if(arr.length===0) return 0; const s=[...arr].sort((a,b)=>a-b); const idx=Math.floor(0.95*(s.length-1)); return s[idx]; }

export async function scoreBatch(signals=[]){
  const batches = [];
  for(let i=0;i<signals.length;i+=BATCH_SIZE) batches.push(signals.slice(i,i+BATCH_SIZE));
  const latencies=[];
  const results = [];
  let active = 0; let idx = 0;
  return await new Promise(resolve=>{
    const runNext = async ()=>{
      if(idx>=batches.length && active===0){ 
        const p = p95(latencies); observeScoringP95(p); 
        // Auto-tune
        if(ENABLE_PERF_AUTOTUNE){
          if(p < 50 && BATCH_SIZE < 200) BATCH_SIZE *= 2;
          if(p > 200 && BATCH_SIZE > 10) BATCH_SIZE = Math.floor(BATCH_SIZE/2);
        }
        resolve(results); return; 
      }
      while(active<CONCURRENCY && idx<batches.length){
        const my = batches[idx++];
        active++;
        const t0 = performance.now?.() || Date.now();
        const partial = await Promise.all(my.map(scoreOne));
        const dt = (performance.now?.() || Date.now()) - t0;
        latencies.push(dt);
        results.push(...partial);
        active--;
        setTimeout(runNext, 0);
      }
    };
    runNext();
  });
}
export default { scoreBatch };

import { Queue, Worker } from 'bullmq';

const queues = new Map();
const inmem = { jobs: [], processing:false };

export function getQueue(name='workbuoy'){
  const url = process.env.REDIS_URL;
  if(url){
    if(!queues.has(name)){
      queues.set(name, new Queue(name, { connection: { url } }));
    }
    return { type:'bullmq', q: queues.get(name) };
  }else{
    return { type:'memory', q: inmem };
  }
}

export async function enqueue(name, job, data){
  const q = getQueue(name);
  if(q.type==='bullmq'){
    return q.q.add(job, data, { removeOnComplete: true, attempts: 3, backoff: { type:'exponential', delay: 500 } });
  }else{
    q.q.jobs.push({ job, data });
    if(!q.q.processing){
      q.q.processing = true;
      while(q.q.jobs.length){
        const j = q.q.jobs.shift();
        try{ await (global.__WB_JOB_HANDLER ? global.__WB_JOB_HANDLER(j.job, j.data) : Promise.resolve()); }catch(_){}
      }
      q.q.processing = false;
    }
    return { ok:true };
  }
}

export function registerWorker(name, handler){
  const q = getQueue(name);
  if(q.type==='bullmq'){
    const worker = new Worker(name, async (job)=> handler(job.name, job.data), { connection: { url: process.env.REDIS_URL } });
    return worker;
  }else{
    global.__WB_JOB_HANDLER = handler;
    return { stop: ()=> { global.__WB_JOB_HANDLER = null; } };
  }
}

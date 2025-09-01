
// Drain retry queue with backoff
import { nextRetryBatch, bumpRetry } from '../../lib/queues/retryQueue.js';

async function process(){
  const batch = await nextRetryBatch(50);
  for(const job of batch){
    try{
      // TODO: actually attempt connector write based on job.connector/op_type
      // Simulate failure for initial attempts
      if(job.attempts < 2){ throw new Error('transient'); }
      // success -> remove by bumpRetry reaching max attempts? For demo, bump with reason 'ok' and maxAttempts so it gets deleted
      bumpRetry(job.id, 0, job.attempts); // will delete if attempts>=maxAttempts
    }catch(e){
      const backoff = Math.min(600, Math.pow(2, job.attempts||0) * 30);
      bumpRetry(job.id, backoff, 5, e.message);
    }
  }
}
process();

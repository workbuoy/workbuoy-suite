import Redis from 'ioredis';
import { Job } from './types.js';
import { wb_connector_retries_total } from '../metrics/metrics.js';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const redis = new Redis(redisUrl);

const qKey = 'connectors:jobs';
const dlqKey = 'connectors:dlq';

export async function enqueue(job: Job) {
  await redis.lpush(qKey, JSON.stringify(job));
}

export async function requeue(job: Job, delaySec: number) {
  wb_connector_retries_total.inc();
  // naive delay: setTimeout on worker side would be cleaner; use a zset for real delays (future PR)
  const j = { ...job, attempt: (job.attempt||0)+1, ts: Date.now() };
  await redis.lpush(qKey, JSON.stringify(j));
}

export async function moveToDlq(job: Job, error: any) {
  const payload = { ...job, error: String(error), failed_at: new Date().toISOString() };
  await redis.lpush(dlqKey, JSON.stringify(payload));
}

export async function reserve(): Promise<Job|null> {
  const r = await redis.rpop(qKey);
  return r ? JSON.parse(r) as Job : null;
}

export async function dlqCount() {
  return (await redis.llen(dlqKey)) || 0;
}

import { redis } from '../redis/client.js';
import { v4 as uuidv4 } from 'uuid';

export interface IngestJob {
  id?: string;
  provider: 'salesforce'|'hubspot'|'dynamics';
  tenant_id: string;
  events: any[];
}

const QUEUE = 'wb:connectors:ingest';

export async function enqueueIngest(job: IngestJob) {
  job.id = job.id || uuidv4();
  await redis.lpush(QUEUE, JSON.stringify(job));
  return job.id;
}

export async function popIngest(): Promise<IngestJob | null> {
  const data = await redis.rpop(QUEUE);
  return data ? JSON.parse(data) as IngestJob : null;
}

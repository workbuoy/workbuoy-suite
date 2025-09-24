import { createClient } from 'redis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = createClient({ url });

redis.on('error', (err: unknown) => console.error('[redis]', err));
redis.connect().catch(console.error);

import { Redis } from 'ioredis';
import type { Redis as RedisClient } from 'ioredis';

export const redis: RedisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

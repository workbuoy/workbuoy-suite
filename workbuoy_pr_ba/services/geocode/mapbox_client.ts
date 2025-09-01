import fetch from 'node-fetch';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function geocodeOne(addr: string) {
  const key = `geo:${addr}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?access_token=${process.env.MAPBOX_TOKEN}`;
  const res = await fetch(url);
  const j = await res.json();
  const f = j.features?.[0];
  const out = f ? { lat: f.center[1], lng: f.center[0], precision: f.place_type?.[0] } : null;
  await redis.setex(key, parseInt(process.env.GEO_CACHE_TTL||'86400'), JSON.stringify(out));
  return out;
}

import type { Redis } from "ioredis";
import { redis as sharedRedis } from "../redis/client.js";

type MapboxFeature = {
  center?: [number, number];
  place_type?: string[];
  place_name?: string;
};

export type GeocodeResult = {
  lat: number;
  lng: number;
  precision?: string;
  label?: string;
};

const DEFAULT_CACHE_TTL = parseInt(process.env.GEO_CACHE_TTL || "86400", 10);

function cacheKey(address: string): string {
  return `geo:${address.toLowerCase()}`;
}

async function getFromCache(client: Redis | null, key: string): Promise<GeocodeResult | null | undefined> {
  if (!client) return undefined;
  try {
    const stored = await client.get(key);
    if (!stored) return null;
    return JSON.parse(stored) as GeocodeResult | null;
  } catch {
    return undefined;
  }
}

async function setCache(client: Redis | null, key: string, value: GeocodeResult | null, ttl: number) {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // ignore cache errors
  }
}

function ensureToken(): string {
  const token = process.env.MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token || token.trim().length === 0) {
    throw new Error("missing_mapbox_token");
  }
  return token;
}

function pickFeature(data: any): MapboxFeature | null {
  const features = Array.isArray(data?.features) ? data.features : [];
  if (features.length === 0) return null;
  return features[0] as MapboxFeature;
}

export async function geocodeAddress(address: string, client: Redis | null = sharedRedis): Promise<GeocodeResult | null> {
  const input = address?.trim();
  if (!input) {
    return null;
  }

  const key = cacheKey(input);
  const cached = await getFromCache(client, key);
  if (cached !== undefined) {
    return cached;
  }

  const token = ensureToken();
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`mapbox_error_${response.status}`);
  }
  const data = await response.json();
  const feature = pickFeature(data);
  if (!feature?.center || feature.center.length < 2) {
    await setCache(client, key, null, DEFAULT_CACHE_TTL);
    return null;
  }

  const result: GeocodeResult = {
    lat: feature.center[1],
    lng: feature.center[0],
    precision: feature.place_type?.[0],
    label: feature.place_name,
  };
  await setCache(client, key, result, DEFAULT_CACHE_TTL);
  return result;
}

export async function geocodeBatch(addresses: string[], client: Redis | null = sharedRedis): Promise<(GeocodeResult | null)[]> {
  const out: (GeocodeResult | null)[] = [];
  for (const addr of addresses) {
    try {
      out.push(await geocodeAddress(addr, client));
    } catch (error) {
      if ((error as Error).message === "missing_mapbox_token") {
        throw error;
      }
      out.push(null);
    }
  }
  return out;
}

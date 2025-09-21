import { Router } from 'express';
import { geocodeBatch } from '../src/geo/mapbox.js';
import { assignTerritory } from '../src/geo/territory.js';
import type { TerritoryDefinition } from '../src/geo/territory.js';

function normaliseAddresses(payload: any): string[] {
  if (!payload) return [];
  if (Array.isArray(payload.addresses)) {
    return payload.addresses.map(String).filter((addr) => addr.trim().length > 0);
  }
  if (Array.isArray(payload)) {
    return payload.map(String).filter((addr) => addr.trim().length > 0);
  }
  if (typeof payload.address === 'string' && payload.address.trim().length > 0) {
    return [payload.address.trim()];
  }
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return [payload.trim()];
  }
  return [];
}

function toTerritoryDefinitions(raw: any[]): TerritoryDefinition[] {
  return raw
    .map((item) => {
      const id = item?.id ?? item?.territoryId ?? item?.name;
      const shape = item?.shape ?? item?.polygon ?? item?.geometry;
      if (!id || !shape) return null;
      return { id: String(id), shape, properties: item?.properties ?? item?.meta } as TerritoryDefinition;
    })
    .filter((territory): territory is TerritoryDefinition => Boolean(territory));
}

function readPoint(raw: any): { lat: number; lng: number } | null {
  const source = raw?.point ?? raw;
  const lat = Number(source?.lat ?? source?.latitude);
  const lng = Number(source?.lng ?? source?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }
  return null;
}

export function geoRouter() {
  const router = Router();

  router.post('/v1/geo/geocode', async (req, res) => {
    const addresses = normaliseAddresses(req.body);
    if (addresses.length === 0) {
      return res.status(400).json({ error: 'addresses_required' });
    }
    try {
      const results = await geocodeBatch(addresses);
      res.json({ results });
    } catch (error) {
      if (error instanceof Error && error.message === 'missing_mapbox_token') {
        return res.status(503).json({ error: 'mapbox_token_missing' });
      }
      res.status(502).json({ error: 'geocode_failed', message: (error as Error)?.message });
    }
  });

  router.post('/v1/geo/territory/assign', (req, res) => {
    const point = readPoint(req.body);
    if (!point) {
      return res.status(400).json({ error: 'point_required' });
    }
    const territoriesRaw = Array.isArray(req.body?.territories) ? req.body.territories : [];
    const territories = toTerritoryDefinitions(territoriesRaw);
    if (territories.length === 0) {
      return res.status(400).json({ error: 'territories_required' });
    }
    const territory = assignTerritory(point, territories);
    if (!territory) {
      return res.json({ territory: null });
    }
    res.json({ territory: { id: territory.id, properties: territory.properties ?? null } });
  });

  return router;
}

export default geoRouter;

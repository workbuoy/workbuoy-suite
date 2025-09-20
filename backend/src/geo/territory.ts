import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

export type TerritoryShape = Feature<Polygon | MultiPolygon> | FeatureCollection<Polygon | MultiPolygon>;

export type TerritoryDefinition = {
  id: string;
  shape: TerritoryShape;
  properties?: Record<string, unknown>;
};

export type Coordinate = { lat: number; lng: number };

function featureToIterable(shape: TerritoryShape): Feature<Polygon | MultiPolygon>[] {
  if (!shape) return [];
  if ((shape as FeatureCollection<Polygon | MultiPolygon>).type === "FeatureCollection") {
    return ((shape as FeatureCollection<Polygon | MultiPolygon>).features || []) as Feature<Polygon | MultiPolygon>[];
  }
  return [shape as Feature<Polygon | MultiPolygon>];
}

export function assignTerritory(point: Coordinate, territories: TerritoryDefinition[]): TerritoryDefinition | null {
  if (!territories || territories.length === 0) return null;
  const pt = { type: "Point", coordinates: [point.lng, point.lat] as [number, number] };
  for (const territory of territories) {
    const shapes = featureToIterable(territory.shape);
    for (const feature of shapes) {
      if (!feature?.geometry) continue;
      if (booleanPointInPolygon(pt, feature.geometry as any)) {
        return territory;
      }
    }
  }
  return null;
}

export function assignAll(points: Coordinate[], territories: TerritoryDefinition[]): (TerritoryDefinition | null)[] {
  return points.map((point) => assignTerritory(point, territories));
}

declare module '@turf/boolean-point-in-polygon' {
  import type { Feature, Geometry, Polygon, MultiPolygon } from 'geojson';
  export default function booleanPointInPolygon(
    point: Feature<Geometry> | Geometry,
    polygon: Feature<Polygon | MultiPolygon> | Polygon | MultiPolygon,
    options?: { ignoreBoundary?: boolean }
  ): boolean;
}

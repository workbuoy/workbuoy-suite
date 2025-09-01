import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
export function assignTerritory(point:{lat:number,lng:number}, territories:any[]) {
  for (const t of territories) {
    if (booleanPointInPolygon([point.lng, point.lat], t.polygon)) return t.id;
  }
  return null;
}

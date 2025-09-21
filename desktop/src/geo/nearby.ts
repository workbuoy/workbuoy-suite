export type Point = { id: string; lat: number; lng: number };

export function findNearby(lat: number, lng: number, points: Point[], max = 10) {
  const origin = { lat, lng };
  const distance = (a: Point) => Math.hypot(a.lat - origin.lat, a.lng - origin.lng);
  return points
    .map((point) => ({ ...point, distance: distance(point) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, max);
}

import type { Point } from '../geo/nearby';

const COLORS = ['FF6347', '2563EB', '22C55E', 'F97316'];

export function buildStaticMapUrl(points: Point[], token?: string): string | null {
  const apiToken = token || process.env.MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN;
  if (!apiToken) {
    return null;
  }
  if (!points || points.length === 0) {
    return null;
  }
  const markers = points.slice(0, 8).map((point, index) => {
    const color = COLORS[index % COLORS.length];
    return `pin-s+${color}(${point.lng},${point.lat})`;
  });
  const markerString = markers.join(',');
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markerString}/auto/600x400?padding=60&access_token=${apiToken}`;
}

export function renderStaticMap(points: Point[], token?: string): string {
  const url = buildStaticMapUrl(points, token);
  if (!url) {
    return '<div class="map-fallback">Map not available (missing token or data)</div>';
  }
  return `<img src="${url}" alt="Contact map" class="map-static" />`;
}

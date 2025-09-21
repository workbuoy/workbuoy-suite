import type { Point } from '../geo/nearby';
import { renderStaticMap } from './staticMap';

type MapViewOptions = {
  points: Point[];
  token?: string;
};

export function renderMapView({ points, token }: MapViewOptions): string {
  return renderStaticMap(points, token);
}

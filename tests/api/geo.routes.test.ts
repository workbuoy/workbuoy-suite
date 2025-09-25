import request from 'supertest';
import app from '../../apps/backend/src/server';

jest.mock('../../apps/backend/src/geo/mapbox.js', () => ({
  geocodeBatch: jest.fn(async (addresses: string[]) => addresses.map((addr) => ({ lat: 59.91, lng: 10.75, label: addr }))),
}));

const { geocodeBatch } = jest.requireMock('../../apps/backend/src/geo/mapbox.js');

describe('geo routes', () => {
  beforeEach(() => {
    (geocodeBatch as jest.Mock).mockClear();
  });

  it('returns geocode results', async () => {
    const res = await request(app)
      .post('/api/v1/geo/geocode')
      .send({ addresses: ['Oslo', 'Bergen'] });

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(2);
    expect(geocodeBatch).toHaveBeenCalledWith(['Oslo', 'Bergen']);
  });

  it('validates territory assignment payload', async () => {
    const polygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [10.0, 59.0],
            [11.0, 59.0],
            [11.0, 60.0],
            [10.0, 60.0],
            [10.0, 59.0],
          ],
        ],
      },
      properties: {},
    };

    const res = await request(app)
      .post('/api/v1/geo/territory/assign')
      .send({
        point: { lat: 59.91, lng: 10.75 },
        territories: [
          { id: 'oslo', polygon },
          { id: 'bergen', polygon: { ...polygon, geometry: { ...polygon.geometry, coordinates: [[[5.0, 60.0], [6.0, 60.0], [6.0, 61.0], [5.0, 61.0], [5.0, 60.0]]] } } },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.territory).toMatchObject({ id: 'oslo' });
  });
});

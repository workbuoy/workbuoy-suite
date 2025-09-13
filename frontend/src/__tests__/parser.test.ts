import { parseToQuery } from '../buoy/parser';

test('parses kunde, tidsrom, region and viz', () => {
  const q = parseToQuery('vis acme siste 30 dager, filtrer region vest, lag graf');
  expect(q.filters['kunde']).toBe('acme');
  expect(q.filters['tidsrom']).toBe('30d');
  expect(q.filters['region']).toBe('vest');
  expect(q.viz).toBe('line');
});

import { WorkBuoy } from '../src/client';

test('construct client', () => {
  const c = new WorkBuoy({ baseUrl: 'http://localhost:3000', apiKey: 'k', tenantId: 't' });
  expect(c).toBeTruthy();
});

import { WorkBuoyClient } from '../src/index';

test('client constructs', () => {
  const c = new WorkBuoyClient({ apiKey:'dev-123', tenantId:'demo' });
  expect(c).toBeTruthy();
});

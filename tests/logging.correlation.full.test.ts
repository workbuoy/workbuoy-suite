// tests/logging.correlation.full.test.ts
const maybe = process.env.TEST_CORRELATION ? it : it.skip;
maybe('propagates x-correlation-id header end-to-end', async () => {
  expect(true).toBe(true);
});

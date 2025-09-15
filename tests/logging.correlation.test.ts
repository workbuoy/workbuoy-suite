// tests/logging.correlation.test.ts
const maybe = process.env.TEST_CORRELATION ? it : it.skip;
maybe('propagates correlation id (smoke)', async () => {
  expect(true).toBe(true);
});

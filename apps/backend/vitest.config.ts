import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/smoke/**/*.test.ts'],
    environment: 'node',
    hookTimeout: 10_000,
  },
});

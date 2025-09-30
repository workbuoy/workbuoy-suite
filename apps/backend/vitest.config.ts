import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/smoke/**/*.test.ts', 'tests/contract/**/*.spec.ts'],
    environment: 'node',
    hookTimeout: 10_000,
  },
});

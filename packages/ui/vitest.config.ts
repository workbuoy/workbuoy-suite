process.env.ROLLUP_SKIP_NODEJS_NATIVE ??= 'true';
process.env.ROLLUP_SKIP_NATIVE ??= 'true';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.a11y.test.tsx', 'src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['**/*.e2e.*', '**/e2e/**', '**/playwright/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    passWithNoTests: true,
    hookTimeout: 30_000,
    teardownTimeout: 30_000,
    pool: 'threads',
    maxThreads: 2,
    fakeTimers: {
      enable: true,
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
    },
  },
});

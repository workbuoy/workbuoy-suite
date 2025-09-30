import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.a11y.test.tsx', 'src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['src/test/setup.ts'],
  },
});

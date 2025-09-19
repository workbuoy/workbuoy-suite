const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/tests/genesis.autonomy.test.ts',
    '<rootDir>/tests/eventBus.stats.shape.test.ts',
    '<rootDir>/tests/mvp.crm-baseline.test.ts',
    '<rootDir>/../tests/proactivity/state-resolver.test.ts',
    '<rootDir>/../tests/proactivity/api-state.test.ts',
    '<rootDir>/../tests/proactivity/runner-paths.test.ts',
    '<rootDir>/../tests/policy/rolecap.test.ts',
    '<rootDir>/../tests/subscription/entitlements.test.ts',
    '<rootDir>/../tests/explainability/last.test.ts',
    '<rootDir>/../tests/metrics/metrics.test.ts'
  ],
};

const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/tests/genesis.autonomy.test.ts',
    '<rootDir>/tests/eventBus.stats.shape.test.ts',
    '<rootDir>/tests/mvp.crm-baseline.test.ts',
    '<rootDir>/../tests/meta/**/*.test.ts',
    '<rootDir>/../tests/policy/**/*.test.ts',
    '<rootDir>/../tests/features/**/*.test.ts',
    '<rootDir>/../tests/proactivity/**/*.test.ts',
    '<rootDir>/../tests/roles/**/*.test.ts',
    '<rootDir>/../tests/usage/**/*.test.ts',
    '<rootDir>/../tests/admin/**/*.test.ts',
    '<rootDir>/../tests/subscription/**/*.test.ts'
  ],
};

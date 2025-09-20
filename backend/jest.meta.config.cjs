const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/tests/genesis.autonomy.test.ts',
    '<rootDir>/tests/eventBus.stats.shape.test.ts',
    '<rootDir>/tests/mvp.crm-baseline.test.ts',
    '<rootDir>/../tests/meta/**/*.test.ts',
    '<rootDir>/../tests/policy/**/*.test.ts'
  ],
};

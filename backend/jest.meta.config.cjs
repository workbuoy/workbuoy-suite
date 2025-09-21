const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/tests/genesis.autonomy.test.ts',
    '<rootDir>/tests/eventBus.stats.shape.test.ts',
    '<rootDir>/tests/mvp.crm-baseline.test.ts',
    '<rootDir>/../tests/meta/**/*.test.ts',
    '<rootDir>/../tests/policy/**/*.test.ts',
    '<rootDir>/../tests/roles/db.registry.test.ts',
    '<rootDir>/../tests/usage/db.usage.test.ts',
    '<rootDir>/../tests/features/active.api.test.ts',
    '<rootDir>/../tests/admin/roles.api.test.ts',
    '<rootDir>/../tests/proactivity/context.integration.test.ts'
  ],
};

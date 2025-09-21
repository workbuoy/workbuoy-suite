const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/../tests/admin/roles.api.test.ts',
    '<rootDir>/../tests/features/active.api.test.ts',
    '<rootDir>/../tests/proactivity/context.integration.test.ts',
    '<rootDir>/../tests/roles/db.registry.test.ts',
    '<rootDir>/../tests/usage/db.usage.test.ts',
  ],
};

const baseConfig = require('./jest.config.cjs');

const {
  '^express$': _expressIgnored,
  '^supertest$': _supertestIgnored,
  ...metaModuleNameMapper
} = baseConfig.moduleNameMapper ?? {};

const metaSetupFiles = [
  ...(baseConfig.setupFiles ?? []),
  '<rootDir>/tests/setup-mime.cjs',
];

module.exports = {
  ...baseConfig,
  moduleNameMapper: metaModuleNameMapper,
  moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
  setupFiles: metaSetupFiles,
  testMatch: [
    '<rootDir>/tests/genesis.autonomy.test.ts',
    '<rootDir>/tests/eventBus.stats.shape.test.ts',
    '<rootDir>/tests/mvp.crm-baseline.test.ts',
    '<rootDir>/../../tests/meta/**/*.test.ts',
    '<rootDir>/../../tests/policy/**/*.test.ts',
    '<rootDir>/../../tests/roles/db.registry.test.ts',
    '<rootDir>/../../tests/usage/db.usage.test.ts',
    '<rootDir>/../../tests/features/active.api.test.ts',
    '<rootDir>/../../tests/admin/roles.api.test.ts',
    '<rootDir>/../../tests/proactivity/context.integration.test.ts'
  ],
};

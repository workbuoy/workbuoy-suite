import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from 'jest';
import baseConfig from './jest.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Config = {
  ...baseConfig,
  rootDir: dirname,
  moduleDirectories: [
    ...(baseConfig.moduleDirectories ?? []),
    '<rootDir>/node_modules',
    '<rootDir>/../../node_modules',
  ],
  setupFiles: [...(baseConfig.setupFiles ?? []), '<rootDir>/tests/setup-mime.cjs'],
  testEnvironment: 'node',
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
    '<rootDir>/../../tests/proactivity/context.integration.test.ts',
    '<rootDir>/src/metrics/**/*.spec.ts',
  ],
};

export default config;

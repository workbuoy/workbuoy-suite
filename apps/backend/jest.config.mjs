// ESM Jest config without ts-node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const setupFile = path.join(dirname, 'tests', 'setup.ts');
const setupFilesAfterEnv = fs.existsSync(setupFile) ? ['<rootDir>/tests/setup.ts'] : [];

const moduleNameMapper = {
  '^(\\\.{1,2}/.*)\\.js$': '$1',
  '^prom-client$': '<rootDir>/tests/__mocks__/prom-client.ts',
  '^express-rate-limit$': '<rootDir>/tests/__mocks__/express-rate-limit.ts',
  '^jsonwebtoken$': '<rootDir>/tests/__mocks__/jsonwebtoken.ts',
  '^@workbuoy/backend-auth$': '<rootDir>/../../packages/backend-auth/src',
  '^@workbuoy/backend-metrics$': '<rootDir>/../../packages/backend-metrics/src',
  '^@workbuoy/backend-rbac$': '<rootDir>/../../packages/backend-rbac/src',
  '^@workbuoy/backend-telemetry$': '<rootDir>/../../packages/backend-telemetry/src',
  '^\.\./src/app$': '<rootDir>/tests/jest.app.ts',
  '^@backend/app$': '<rootDir>/tests/jest.app.ts',
  '^@backend/(.*)$': '<rootDir>/src/$1',
  '^@backend-tests/(.*)$': '<rootDir>/tests/$1',
  '^@backend-meta/(.*)$': '<rootDir>/meta/$1',
};

const config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
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
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', tsx: false, decorators: true },
        transform: { decoratorMetadata: true }
      },
      module: { type: 'commonjs' }
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|openid-client|oauth4webapi)/)'
  ],
  coverageProvider: 'v8',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  setupFilesAfterEnv,
  moduleNameMapper,
};

export default config;

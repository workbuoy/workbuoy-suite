import type { Config } from 'jest';

const runFullSuite = process.env.WB_ENTERPRISE_TEST_PROFILE === 'full';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js)$': [
      '@swc/jest',
      {
        sourceMaps: true,
        module: { type: 'es6' },
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: false,
          },
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testMatch: runFullSuite
    ? [
        '<rootDir>/**/__tests__/**/*.(test|spec).(ts|tsx|js)',
        '<rootDir>/tests/jest/**/*.(test|spec).(ts|tsx|js)',
      ]
    : ['<rootDir>/tests/smoke/**/*.(test|spec).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/', '/playwright/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverage: runFullSuite,
  coverageThreshold: runFullSuite
    ? {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      }
    : undefined,
  transformIgnorePatterns: ['/node_modules/'],
  maxWorkers: 1,
};

export default config;

import type { Config } from 'jest';

const runFullSuite = process.env.WB_CRM_TEST_PROFILE === 'full';

const config: Config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  transform: {
    '^.+\\.(ts|tsx|js|mjs)$': [
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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testMatch: runFullSuite
    ? ['<rootDir>/**/__tests__/**/*.(test|spec).(ts|tsx|js|mjs)']
    : ['<rootDir>/tests/smoke/**/*.(test|spec).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/playwright/', '/.next/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts', '<rootDir>/jest.setup.ts'],
  collectCoverage: runFullSuite,
  coveragePathIgnorePatterns: ['/__mocks__/', '/tests/fixtures/', '/e2e/', '/playwright/'],
  transformIgnorePatterns: ['/node_modules/'],
  maxWorkers: 1,
};

export default config;

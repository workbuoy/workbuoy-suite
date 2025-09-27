const path = require('node:path');
const fs = require('node:fs');

const tryResolve = (moduleName) => {
  try {
    return require.resolve(moduleName);
  } catch (error) {
    return null;
  }
};

const tsJest = tryResolve('ts-jest');
const swcJest = tryResolve('@swc/jest');
const babelJest = tryResolve('babel-jest');

const transform = {};
if (tsJest) {
  transform['^.+\\.(ts|tsx)$'] = [
    'ts-jest',
    {
      tsconfig: path.join(__dirname, 'tsconfig.jest.json'),
    },
  ];
} else if (swcJest) {
  transform['^.+\\.(ts|tsx)$'] = ['@swc/jest'];
} else if (babelJest) {
  transform['^.+\\.(ts|tsx)$'] = ['babel-jest'];
}

/** @type {import('jest').Config} */
module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules'],
  transform,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'].filter((setupPath) =>
    fs.existsSync(setupPath.replace('<rootDir>', __dirname))
  ),
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^prom-client$': '<rootDir>/tests/__mocks__/prom-client.ts',
    '^express-rate-limit$': '<rootDir>/tests/__mocks__/express-rate-limit.ts',
    '^jsonwebtoken$': '<rootDir>/tests/__mocks__/jsonwebtoken.ts',
    '^@workbuoy/backend-auth$': '<rootDir>/../../packages/backend-auth/src',
    '^@workbuoy/backend-metrics$': '<rootDir>/../../packages/backend-metrics/src',
    '^@workbuoy/backend-rbac$': '<rootDir>/../../packages/backend-rbac/src',
    '^@workbuoy/backend-telemetry$': '<rootDir>/../../packages/backend-telemetry/src',
    '^@backend/(.*)$': '<rootDir>/src/$1',
    '^@backend-tests/(.*)$': '<rootDir>/tests/$1',
    '^@backend-meta/(.*)$': '<rootDir>/meta/$1',
  },
};

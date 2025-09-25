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
      tsconfig: path.join(__dirname, 'tsconfig.json'),
    },
  ];
} else if (swcJest) {
  transform['^.+\\.(ts|tsx)$'] = ['@swc/jest'];
} else if (babelJest) {
  transform['^.+\\.(ts|tsx)$'] = ['babel-jest'];
}

const setupCandidates = ['@testing-library/jest-dom', '<rootDir>/jest.setup.ts'];

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  roots: ['<rootDir>/src'],
  transform,
  setupFilesAfterEnv: setupCandidates.filter((candidate) => {
    if (candidate.startsWith('<rootDir>')) {
      const resolved = candidate.replace('<rootDir>', __dirname);
      return fs.existsSync(resolved);
    }
    try {
      require.resolve(candidate);
      return true;
    } catch (error) {
      return false;
    }
  }),
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

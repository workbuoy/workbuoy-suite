const path = require('path');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  rootDir: __dirname,
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: path.join(__dirname, 'tsconfig.jest.json'),
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^prom-client$': '<rootDir>/tests/__mocks__/prom-client.ts',
    '^express-rate-limit$': '<rootDir>/tests/__mocks__/express-rate-limit.ts',
    '^jsonwebtoken$': '<rootDir>/tests/__mocks__/jsonwebtoken.ts',
    '^@backend/(.*)$': '<rootDir>/src/$1',
    '^@backend-tests/(.*)$': '<rootDir>/tests/$1',
    '^@backend-meta/(.*)$': '<rootDir>/meta/$1',
  },
};

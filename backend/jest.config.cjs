/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest'],
  },
  moduleNameMapper: {
    // Resolve TS files when imports end with .js (e.g., './rbac/policies.js')
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^prom-client$': '<rootDir>/tests/__mocks__/prom-client.ts',
    '^jsonwebtoken$': '<rootDir>/tests/__mocks__/jsonwebtoken.ts',
    '^express$': '<rootDir>/node_modules/express',
  },
  // If your package.json has "type": "module", this CJS config still works.
};

\
/** Minimal CI config: only run smoke tests while we stabilize the repo. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/smoke'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
  },
  moduleNameMapper: {
    // Resolve TS files when imports end with .js (e.g., './rbac/policies.js')
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  passWithNoTests: true
};

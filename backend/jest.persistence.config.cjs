const base = require('./jest.config.cjs');
module.exports = {
  ...base,
  testMatch: ['<rootDir>/tests/persistence/**/*.test.ts'],
  passWithNoTests: true,
};

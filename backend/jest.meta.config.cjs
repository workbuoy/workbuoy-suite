const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/genesis.autonomy.test.ts'],
};

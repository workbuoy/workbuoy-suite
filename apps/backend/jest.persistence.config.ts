import type { Config } from 'jest';
import baseConfig from './jest.config';

const config: Config = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/persistence/**/*.test.ts'],
  passWithNoTests: true,
};

export default config;

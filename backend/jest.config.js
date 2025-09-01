export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js'],
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  transform: { '^.+\\.ts$': ['ts-jest', { isolatedModules: true }] },
  verbose: false
};

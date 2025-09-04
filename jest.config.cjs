/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  clearMocks: true,
  // Hvis du bruker paths i tsconfig, aktiver ts-jest path-mapping:
  // globals: {
  //   'ts-jest': { tsconfig: 'tsconfig.json' }
  // }
};

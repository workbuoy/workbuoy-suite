// If your repo already has a jest config, extend/merge this snippet.
// Otherwise you can rename this file to jest.config.js.
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "frontend/src/**/*.{ts,tsx,js,jsx}"
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  },
  // Allow slower integration tests to run sequentially in CI
  maxWorkers: process.env.CI ? 1 : undefined
};

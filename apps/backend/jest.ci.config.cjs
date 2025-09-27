/** Clean smoke Jest config for CI */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/smoke'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  passWithNoTests: true,
};

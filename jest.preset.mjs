/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: { "^.+\\.(t|j)sx?$": "@swc/jest" },
  extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Allow ESM packages under node_modules when needed
  transformIgnorePatterns: [
    "node_modules/(?!(@workbuoy|nanoid|uuid|ky|strip-ansi|ansi-regex)/)"
  ],
  moduleNameMapper: {
    // CSS/assets for frontend packages (safe no-op elsewhere)
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    // ESM .js specifiers -> TS sources during tests
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    // Keep current focus areas; adjust only if paths differ
    "apps/backend/src/metrics/**/*.{ts,tsx,js,jsx}",
    "apps/backend/src/core/events/**/*.{ts,tsx,js,jsx}"
  ],
  coverageReporters: ["text", "lcov", "cobertura", "json-summary"],
  reporters: ["default", "jest-junit"],
  // Don’t enforce high numbers repo-wide; per-project overrides can tighten
  coverageThreshold: { global: { branches: 30, functions: 30, lines: 30, statements: 30 } }
};

# Add to your Jest config or package.json
{
  "coverageThreshold": {
    "global": { "branches": 80, "functions": 80, "lines": 80, "statements": 80 }
  }
}
# You can relax in CI with env COVERAGE_LOOSE=1

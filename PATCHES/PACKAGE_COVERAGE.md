# Enable Jest coverage gate (global ≥80%)

In your root `package.json`, add:

```json
{
  "scripts": {
    "coverage": "jest --coverage --runInBand"
  },
  "jest": {
    "coverageThreshold": {
      "global": { "branches": 80, "functions": 80, "lines": 80, "statements": 80 }
    }
  }
}
```

Ensure your CI workflow runs `npm run coverage`.
```yaml
# .github/workflows/backend-ci.yml
# add an extra step after tests:
- name: Coverage
  run: npm run coverage
```

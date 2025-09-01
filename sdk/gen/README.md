# SDK Autogen (stub)

SDK skal genereres fra `api-docs/openapi.yaml` via openapi-generator.

- TS-klient: `sdk/gen/typescript`
- Python-klient: `sdk/gen/python`

Kjør:
```bash
openapi-generator-cli generate -i api-docs/openapi.yaml -g typescript-fetch -o sdk/gen/typescript
openapi-generator-cli generate -i api-docs/openapi.yaml -g python -o sdk/gen/python
```

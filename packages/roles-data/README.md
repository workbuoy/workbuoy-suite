# @workbuoy/roles-data

Canonical role & feature datasets for Workbuoy.

This workspace package exposes JSON catalogs for both roles and features.  
Consumers should import from `@workbuoy/roles-data/roles.json` or `@workbuoy/roles-data/features.json` rather than embedding their own copies.

## Validation

Run `npm run validate -w @workbuoy/roles-data` to sanity check schema and detect duplicate identifiers.

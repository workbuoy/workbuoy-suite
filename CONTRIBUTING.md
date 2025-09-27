# Contributing

- Use small, meaningful commits (no "Add files via upload").
- Ensure `npm test` passes before pushing.
- Do not commit node_modules, dist, coverage, or data files.
- Follow feature branch naming: cleanup/<scope>.
- Repo is ESM-first with NodeNext. Import specifiers must include .js when importing transpiled files.

## Proxy settings

- `http-proxy` is deprecated/unsupported in npm; use `proxy` and `https-proxy` instead.
- CI auto-sanitizes legacy `http-proxy` to avoid warnings.

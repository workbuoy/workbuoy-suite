# RELEASE_CHECKLIST (v1)

- [ ] `cp .env.example .env` fungerer lokalt.
- [ ] `docker compose up --build` starter db + backend + frontend.
- [ ] `npm run lint` grønn.
- [ ] `npm run typecheck` grønn.
- [ ] `npm test` grønn.
- [ ] Backend health endpoint svarer.
- [ ] Frontend happy-path verifisert manuelt.
- [ ] Ingen secrets committed.
- [ ] CI workflows passerer på PR.
- [ ] Release notes oppdatert.
